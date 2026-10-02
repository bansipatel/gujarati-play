/* Cloud sync with a private code, using Firebase Firestore's REST API (no SDK, no accounts).
 *
 * How it works
 *  - The app generates a random 16-character code (about 78 bits). The code is the only "password", so it is
 *    assigned, never chosen by the user. It is never sent to the server: the document ID is SHA-256("gujarati-play:" + code).
 *  - Progress is one small document per code. The security rules (firebase/firestore.rules) allow reading and writing a
 *    document only by its exact ID and forbid listing, so nobody can browse other people's progress.
 *  - Local progress stays the source of truth and the app works offline. Each sync pulls the cloud copy, MERGES it with
 *    the local copy (nothing is lost), then pushes the result. Merging rules live in GL.store.mergeRemote.
 *
 * Setup: fill in js/firebase-config.js (see the README). Without it, sync is simply hidden.
 */
window.GL = window.GL || {};

GL.sync = (function () {
  var cfg = window.GL_FIREBASE || null;
  var KEY = 'gujaratiPlay.sync';
  var ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';   // no 0 O 1 I L: easy to read aloud and type
  var DELAY = 3000;                                // wait this long after the last change before syncing (batches a burst of answers into one save)
  var link = readLink(), status = 'idle', listeners = [], timer = null, busy = false, again = false;

  function readLink() { try { var r = JSON.parse(window.localStorage.getItem(KEY)); return r && r.code ? r : null; } catch (e) { return null; } }
  function writeLink() { try { if (link) window.localStorage.setItem(KEY, JSON.stringify(link)); else window.localStorage.removeItem(KEY); } catch (e) { /* ignore */ } }
  function configured() { return !!(cfg && cfg.apiKey && cfg.projectId); }
  function available() { return configured() && !!(window.crypto && window.crypto.subtle && window.crypto.getRandomValues && window.fetch); }
  function setStatus(s) { status = s; listeners.forEach(function (f) { try { f(s); } catch (e) { /* ignore */ } }); }

  /* ---- codes ---- */
  function pretty(raw) { return raw.match(/.{1,4}/g).join('-'); }
  function newRaw() {
    var out = '', buf = new Uint8Array(32), i = 0;
    while (out.length < 16) {
      window.crypto.getRandomValues(buf);
      for (i = 0; i < buf.length && out.length < 16; i++) if (buf[i] < 248) out += ALPHA[buf[i] % 31];   // reject 248-255 so every letter is equally likely
    }
    return out;
  }
  /* Returns {raw} or {error}. Accepts any case, with or without dashes and spaces. */
  function parse(input) {
    var raw = String(input || '').toUpperCase().replace(/[\s-]/g, '');
    if (raw.length !== 16) return { error: 'A code has 16 letters and numbers, like ABCD-EFGH-JKMN-PQRS.' };
    for (var i = 0; i < raw.length; i++) if (ALPHA.indexOf(raw[i]) === -1) return { error: 'Codes never contain 0, 1, I, L or O. Check those characters.' };
    return { raw: raw };
  }
  function docId(raw) {
    return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode('gujarati-play:' + raw)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }

  /* ---- Firestore REST ---- */
  function url(id) { return 'https://firestore.googleapis.com/v1/projects/' + encodeURIComponent(cfg.projectId) + '/databases/(default)/documents/progress/' + id + '?key=' + encodeURIComponent(cfg.apiKey); }
  function get(id) {
    return fetch(url(id)).then(function (r) {
      if (r.status === 404) return null;
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json().then(function (j) { return JSON.parse(j.fields.data.stringValue); });
    });
  }
  function put(id, state) {
    var body = { fields: { data: { stringValue: JSON.stringify(state) }, updatedAt: { integerValue: String(Date.now()) }, v: { integerValue: '1' } } };
    return fetch(url(id), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); });
  }
  function del(id) { return fetch(url(id), { method: 'DELETE' }).then(function (r) { if (!r.ok && r.status !== 404) throw new Error('HTTP ' + r.status); }); }

  /* After pulling newer progress, refresh the screen unless the learner is in the middle of a lesson or game. */
  function refreshUi() {
    if (GL.ui && GL.ui.updateHud) GL.ui.updateHud();
    var route = (window.location.hash.replace(/^#\/?/, '').split('/')[0]) || '';
    if (['', 'lessons', 'practice', 'alphabet', 'settings', 'today'].indexOf(route) !== -1 && GL.app && GL.app.render) GL.app.render();
  }

  /* ---- sync ---- */
  function now() {
    if (!link || !available()) return Promise.resolve(false);
    if (busy) { again = true; return Promise.resolve(false); }
    busy = true; setStatus('syncing');
    return docId(link.code.replace(/-/g, '')).then(function (id) {
      return get(id).then(function (remote) {
        var changed = remote ? GL.store.mergeRemote(remote) : false;
        return put(id, GL.store.snapshot()).then(function () {
          link.last = Date.now(); writeLink(); setStatus('synced');
          if (changed) refreshUi();
          return true;
        });
      });
    }).catch(function () { setStatus(window.navigator.onLine === false ? 'offline' : 'error'); return false; })
      .then(function (ok) { busy = false; if (again) { again = false; schedule(); } return ok; });
  }
  function schedule() {
    if (!link || !available()) return;
    clearTimeout(timer); timer = setTimeout(function () { timer = null; now(); }, DELAY);
  }

  /* Turn sync on for this device: make a new code, check nobody has it, upload progress. Resolves with the code. */
  function enable() {
    if (!available()) return Promise.reject(new Error('Sync is not available here.'));
    var raw = newRaw();
    return docId(raw).then(function (id) {
      return get(id).then(function (existing) {
        if (existing) return enable();                              // astronomically unlikely, but never reuse a code
        link = { code: pretty(raw), last: 0 }; writeLink(); setStatus('syncing');
        return put(id, GL.store.snapshot()).then(function () { link.last = Date.now(); writeLink(); setStatus('synced'); return link.code; });
      });
    });
  }
  /* Use an existing code on this device: combine the cloud progress with whatever is here. */
  function connect(input) {
    if (!available()) return Promise.reject(new Error('Sync is not available here.'));
    var p = parse(input);
    if (p.error) return Promise.reject(new Error(p.error));
    return docId(p.raw).then(function (id) {
      return get(id).then(function (remote) {
        if (!remote) throw new Error('No progress was found for that code. Check it and try again.');
        var changed = GL.store.mergeRemote(remote);
        link = { code: pretty(p.raw), last: 0 }; writeLink(); setStatus('syncing');
        return put(id, GL.store.snapshot()).then(function () { link.last = Date.now(); writeLink(); setStatus('synced'); return { changed: changed }; });
      });
    });
  }
  function unlink() { clearTimeout(timer); timer = null; link = null; writeLink(); setStatus('idle'); }
  function deleteCloud() {
    if (!link) return Promise.resolve();
    return docId(link.code.replace(/-/g, '')).then(del).then(function () { unlink(); });
  }

  function start() {
    if (!link || !available()) return;
    now();
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') now(); else if (timer) { clearTimeout(timer); timer = null; now(); } });
    window.addEventListener('online', function () { now(); });
    window.addEventListener('pagehide', function () { if (timer) { clearTimeout(timer); timer = null; now(); } });
  }

  return {
    configured: configured, available: available, linked: function () { return !!link; }, code: function () { return link ? link.code : null; },
    last: function () { return link ? link.last : 0; }, status: function () { return status; }, onStatus: function (f) { listeners.push(f); },
    enable: enable, connect: connect, now: now, schedule: schedule, unlink: unlink, deleteCloud: deleteCloud, start: start, parse: parse, _newRaw: newRaw
  };
})();
