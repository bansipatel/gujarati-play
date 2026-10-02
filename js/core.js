/* Core helpers: content lookups, saved progress, review weighting, speech. */
window.GL = window.GL || {};

/* ---------------- Content lookups ---------------- */
GL.lessonOfItem = {};
GL.lessons.forEach(function (l) { l.items.forEach(function (id) { GL.lessonOfItem[id] = l.id; }); });

GL.lessonById = function (n) { return GL.lessons.filter(function (l) { return l.id === n; })[0]; };

/* Words list plus every item's example word (deduplicated). */
GL.allWords = function () {
  if (GL._allWords) return GL._allWords;
  var seen = {}, out = [];
  GL.words.concat(GL.items.map(function (i) { return i.word; })).forEach(function (w) {
    if (!seen[w.gu]) { seen[w.gu] = 1; out.push({ gu: w.gu, roman: w.roman, en: w.en }); }
  });
  return (GL._allWords = out);
};

/* Which taught items does a word need? Known conjunct items (ત્ર, સ્ત…) count as one item. */
GL.requiredIds = function (gu) {
  var conj = GL.items.filter(function (i) { return i.kind === 'conjunct'; })
    .map(function (i) { return i.id; }).sort(function (a, b) { return b.length - a.length; });
  var ids = [], i = 0, chars = Array.from(gu);
  while (i < chars.length) {
    var matched = null;
    for (var c = 0; c < conj.length; c++) {
      var cc = Array.from(conj[c]);
      if (chars.slice(i, i + cc.length).join('') === conj[c]) { matched = conj[c]; i += cc.length; break; }
    }
    if (matched) { ids.push(matched); continue; }
    ids.push(chars[i]); i++;
  }
  return ids.filter(function (x, k) { return ids.indexOf(x) === k; });
};

GL.wordLesson = function (w) {
  var max = 0;
  var ok = GL.requiredIds(w.gu).every(function (id) {
    var l = GL.lessonOfItem[id]; if (!l) return false; if (l > max) max = l; return true;
  });
  return ok ? max : 0;
};

GL.taughtThrough = function (n) {
  var out = [];
  GL.lessons.forEach(function (l) { if (l.id <= n) out = out.concat(l.items); });
  return out;
};

GL.wordsFor = function (taughtIds) {
  var set = {}; taughtIds.forEach(function (id) { set[id] = 1; });
  return GL.allWords().filter(function (w) { return GL.requiredIds(w.gu).every(function (id) { return set[id]; }); });
};

/* Consonant sound without its built-in a (ka → k). */
GL.baseOf = function (item) { return item.roman.slice(0, -1); };

GL.shuffle = function (arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
};


/* ---------------- Reading helpers: clusters, written-vs-said, look-alikes ---------------- */
/* One "akshara": consonant(s) joined by ્ plus any vowel signs, or an independent vowel. */
GL.CLUSTER_RE = /(?:[\u0A95-\u0AB9]\u0ACD)*[\u0A95-\u0AB9][\u0ABE-\u0AC2\u0AC7\u0AC8\u0ACB\u0ACC\u0A82]*|[\u0A85-\u0A94]\u0A82?|[\s\S]/g;

GL.clusters = function (gu) { return gu.match(GL.CLUSTER_RE) || []; };

/* Full written romanization of a cluster (every built-in "a" included) and whether it ends in one. */
GL._written = function (cluster) {
  var out = '', pending = false;
  Array.from(cluster.replace('જ્ઞ', '')).forEach(function (ch) {
    var it = GL.itemById[ch];
    if (ch === '્') { pending = false; return; }
    if (ch === '') { if (pending) out += 'a'; out += 'gn'; pending = true; return; }
    if (!it) return;
    if (it.kind === 'consonant') { if (pending) out += 'a'; out += GL.baseOf(it); pending = true; }
    else if (it.kind === 'vowel') { out += it.roman; pending = false; }
    else if (ch === 'ં') { if (pending) out += 'a'; out += 'n'; pending = false; }
    else if (it.kind === 'sign') { out += it.vowel; pending = false; }
  });
  if (pending) out += 'a';
  return { full: out, endsInherent: pending };
};

/* Aligns a word's everyday transliteration with its letters, marking built-in "a"s that are written but not said. */
GL.breakdown = function (w) {
  var units = GL.clusters(w.gu).map(function (c) {
    var r = GL._written(c);
    return { gu: c, full: r.full, endsInherent: r.endsInherent, said: r.full, silentA: false };
  });
  function align(i, pos) {
    if (i === units.length) return pos === w.roman.length ? [] : null;
    var u = units[i], opts = [u.full];
    if (u.endsInherent) opts.push(u.full.slice(0, -1));
    for (var k = 0; k < opts.length; k++) {
      if (w.roman.substr(pos, opts[k].length) === opts[k]) {
        var rest = align(i + 1, pos + opts[k].length);
        if (rest) { rest.unshift(opts[k]); return rest; }
      }
    }
    return null;
  }
  var a = align(0, 0);
  if (a) units.forEach(function (u, i) { u.said = a[i]; u.silentA = a[i].length < u.full.length; });
  return units;
};

/* Look-alike / sound-alike pairs. */
GL.confusablesOf = function (id) {
  var out = [];
  GL.confusables.forEach(function (c) {
    if (c[0] === id) out.push({ other: c[1], note: c[2] });
    else if (c[1] === id) out.push({ other: c[0], note: c[2] });
  });
  return out;
};
GL.pairNote = function (a, b) {
  var m = GL.confusablesOf(a).filter(function (c) { return c.other === b; })[0];
  return m ? m.note : null;
};

/* Plausible wrong spellings of a word: swap one letter for a confusable that has been taught. */
GL.spellingVariants = function (word, taughtSet) {
  var real = {}; GL.allWords().forEach(function (w) { real[w.gu] = 1; });
  var chars = Array.from(word.gu), seen = {}, out = [];
  chars.forEach(function (ch, i) {
    GL.confusablesOf(ch).forEach(function (c) {
      if (!taughtSet[c.other] || !taughtSet[ch]) return;
      var v = chars.slice(); v[i] = c.other; var s = v.join('');
      if (s !== word.gu && !real[s] && !seen[s]) { seen[s] = 1; out.push({ gu: s, a: ch, b: c.other, note: c.note }); }
    });
  });
  return out;
};

/* ---------------- Saved progress ---------------- */
GL.store = (function () {
  var KEY = 'gujaratiPlay.v1';
  var memory = null;      // used when localStorage is unavailable
  var persistent = true;

  function fresh() {
    return { v: 1, name: '', nameAt: 0, badges: {}, badgeSeen: {}, points: 0, days: [], completed: {}, stats: {}, words: {}, settings: { hints: 'show', speech: true, effects: 'system' } };
  }
  function load() {
    var raw = null;
    try { raw = window.localStorage.getItem(KEY); } catch (e) { persistent = false; }
    var s = fresh();
    if (raw) {
      try {
        var p = JSON.parse(raw);
        if (p && p.v === 1) {
          s = Object.assign(s, p);
          s.settings = Object.assign(fresh().settings, p.settings || {});
        }
      } catch (e) { /* corrupted save: start fresh, nothing crashes */ }
    }
    return s;
  }
  var state = load();
  function save(silent) {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); persistent = true; }
    catch (e) { persistent = false; memory = state; }
    if (silent !== true && GL.sync && GL.sync.schedule) GL.sync.schedule();   // cloud sync (if on) follows local saves
  }

  /* Combine progress from another device into this one, losing nothing. Points only ever grow, days and finished lessons
     are unions, and for each letter we keep the more recently practiced record (with the larger right/wrong counts).
     Returns true if anything here changed. */
  function mergeInto(a, b) {
    var changed = false;
    a.badges = a.badges || {}; a.badgeSeen = a.badgeSeen || {};
    Object.keys(b.badges || {}).forEach(function (k) { if (!a.badges[k] || b.badges[k] < a.badges[k]) { a.badges[k] = b.badges[k]; changed = true; } });   // unlocked on either device = unlocked
    Object.keys(b.badgeSeen || {}).forEach(function (k) { if (!a.badgeSeen[k]) { a.badgeSeen[k] = true; changed = true; } });
    if ((b.nameAt || 0) > (a.nameAt || 0)) { a.name = b.name || ''; a.nameAt = b.nameAt; changed = true; }   // the most recently edited name wins
    if ((b.points || 0) > a.points) { a.points = b.points; changed = true; }
    (b.days || []).forEach(function (d) { if (a.days.indexOf(d) === -1) { a.days.push(d); changed = true; } });
    a.days.sort();
    Object.keys(b.completed || {}).forEach(function (k) {
      var x = a.completed[k], y = b.completed[k];
      if (!x) { a.completed[k] = y; changed = true; return; }
      var plays = Math.max(x.plays || 0, y.plays || 0), at = Math.max(x.at || 0, y.at || 0);
      if (plays !== x.plays || at !== x.at) { x.plays = plays; x.at = at; changed = true; }
    });
    Object.keys(b.stats || {}).forEach(function (id) {
      var x = a.stats[id], y = b.stats[id];
      if (!x) { a.stats[id] = y; changed = true; return; }
      var later = (y.t || 0) > (x.t || 0) ? y : x;
      var m = { s: later.s, c: Math.max(x.c || 0, y.c || 0), w: Math.max(x.w || 0, y.w || 0), t: Math.max(x.t || 0, y.t || 0), due: later.due };
      var lw = Math.max(x.lastWrong || 0, y.lastWrong || 0); if (lw) m.lastWrong = lw;
      if (m.s !== x.s || m.c !== x.c || m.w !== x.w || m.t !== x.t || m.due !== x.due || (m.lastWrong || 0) !== (x.lastWrong || 0)) { a.stats[id] = m; changed = true; }
    });
    Object.keys(b.words || {}).forEach(function (g) {
      var x = a.words[g], y = b.words[g];
      if (!x) { a.words[g] = y; changed = true; return; }
      var c = Math.max(x.c || 0, y.c || 0), w = Math.max(x.w || 0, y.w || 0);
      if (c !== x.c || w !== x.w) { x.c = c; x.w = w; changed = true; }
    });
    return changed;
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  var api = {
    state: function () { return state; },
    isPersistent: function () { return persistent; },
    save: save,
    /* A copy of all progress, for cloud sync. */
    /* The learner's name, shown in the corner and in greetings. Saved with progress and synced with it. */
    name: function () { return state.name || ''; },
    setName: function (n) {
      var clean = String(n || '').replace(/[\u0000-\u001F<>]/g, ' ').replace(/\s+/g, ' ').trim();
      clean = Array.from(clean).slice(0, 24).join('');
      if (clean === (state.name || '')) return clean;
      state.name = clean; state.nameAt = Date.now(); save(); return clean;
    },
    /* Practice badges. A badge unlocks once and stays unlocked; "seen" remembers that the NEW marker was shown. */
    unlockBadge: function (id) { if (!state.badges) state.badges = {}; if (state.badges[id]) return false; state.badges[id] = Date.now(); save(); return true; },
    markBadgeSeen: function (ids) { if (!state.badgeSeen) state.badgeSeen = {}; var ch = false; ids.forEach(function (id) { if (!state.badgeSeen[id]) { state.badgeSeen[id] = true; ch = true; } }); if (ch) save(); },
    snapshot: function () { return JSON.parse(JSON.stringify(state)); },
    mergeRemote: function (remote) {
      if (!remote || remote.v !== 1 || typeof remote.points !== 'number' || typeof remote.completed !== 'object') return false;
      var changed = mergeInto(state, remote);
      if (changed) save(true);
      return changed;
    },
    reset: function () { state = fresh(); save(); },
    addPoints: function (n) { state.points += n; save(); },
    /* Records a day of play. Returns true on the first activity of a new day. */
    markDay: function () {
      var t = today();
      if (state.days.indexOf(t) === -1) { state.days.push(t); save(); return true; }
      return false;
    },
    /* Backup: one text string that carries all progress (handy because Safari can clear site data). */
    exportCode: function () { return btoa(unescape(encodeURIComponent(JSON.stringify(state)))); },
    importCode: function (code) {
      try {
        var p = JSON.parse(decodeURIComponent(escape(atob(String(code).trim()))));
        if (!p || p.v !== 1 || typeof p.points !== 'number' || typeof p.completed !== 'object') return false;
        state = Object.assign(fresh(), p); state.settings = Object.assign(fresh().settings, p.settings || {}); save(); return true;
      } catch (e) { return false; }
    },
    isDone: function (n) { return !!state.completed[n]; },
    isUnlocked: function (n) { return n === 1 || !!state.completed[n - 1]; },
    completeLesson: function (n) {
      var first = !state.completed[n];
      var c = state.completed[n] || { plays: 0 };
      c.plays++; c.at = Date.now();
      state.completed[n] = c; save();
      return first;
    },
    taughtIds: function () {
      var out = [];
      GL.lessons.forEach(function (l) { if (state.completed[l.id]) out = out.concat(l.items); });
      return out;
    },
    nextLesson: function () {
      for (var i = 0; i < GL.lessons.length; i++) if (!state.completed[GL.lessons[i].id]) return GL.lessons[i];
      return null;
    },
    stat: function (id) { return state.stats[id] || { s: 0, c: 0, w: 0, t: 0 }; },
    /* Strength 0-5: a correct answer helps by 1, a miss costs 1 (never below 0). */
    record: function (id, ok) {
      var st = state.stats[id] || { s: 0, c: 0, w: 0, t: 0 };
      if (ok) { st.c++; st.s = Math.min(5, st.s + 1); } else { st.w++; st.s = Math.max(0, st.s - 1); st.lastWrong = Date.now(); }
      st.t = Date.now();
      // Spaced review: stronger letters come back later (10 min, 1, 3, 7, 14 days).
      var gaps = [0, 0.007, 1, 3, 7, 14];
      st.due = st.t + gaps[st.s] * 86400000;
      state.stats[id] = st; save();
    },
    /* Letters that have been seen and are ready for a refresh. */
    dueIds: function (pool) {
      var now = Date.now();
      return (pool || api.taughtIds()).filter(function (id) {
        var s = state.stats[id]; return s && (s.c + s.w) > 0 && (!s.due || s.due <= now);
      });
    },
    recordWord: function (gu, ok) {
      var w = state.words[gu] || { c: 0, w: 0 };
      if (ok) w.c++; else w.w++;
      state.words[gu] = w; save();
    },
    /* Letters worth a second look: missed recently/more often than they have been got right. */
    struggling: function (pool) {
      return (pool || api.taughtIds()).filter(function (id) {
        var s = api.stat(id); return s.w > 0 && s.s <= 2;
      }).sort(function (a, b) { return api.stat(a).s - api.stat(b).s; });
    },
    level: function () {
      var titles = ['Seedling', 'Sprout', 'Sapling', 'Blossom', 'Mango Tree', 'Lotus', 'Peacock', 'Star'];
      var lv = Math.floor(state.points / 250);
      return { n: lv + 1, title: titles[Math.min(lv, titles.length - 1)], into: state.points % 250, size: 250 };
    }
  };
  return api;
})();

/* Weighted random pick that favors weaker letters. Returns `n` ids (repeats only if the pool is small). */
GL.pickItems = function (pool, n, opts) {
  opts = opts || {};
  var focus = opts.focus || [];
  var out = [], bag = pool.slice(), last = opts.avoid;
  function weight(id) {
    var s = GL.store.stat(id);
    var w = s.c + s.w === 0 ? 3 : Math.pow(6 - s.s, 1.4) * (s.due && s.due > Date.now() ? 0.5 : 1.5);
    if (s.w > 0 && s.s <= 2) w += 3;       // review letters you struggle with more often
    if (focus.indexOf(id) !== -1) w *= 2;  // letters from the current lesson
    if (id === last) w *= 0.1;
    return w;
  }
  while (out.length < n) {
    if (!bag.length) bag = pool.slice();
    var total = 0, ws = bag.map(function (id) { var w = weight(id); total += w; return w; });
    var r = Math.random() * total, idx = 0;
    for (; idx < bag.length - 1; idx++) { r -= ws[idx]; if (r <= 0) break; }
    last = bag[idx]; out.push(bag[idx]); bag.splice(idx, 1);
  }
  return out;
};

/* ---------------- Speech (only when the browser has a Gujarati voice) ---------------- */
GL.speech = (function () {
  var synth = window.speechSynthesis, voice = null, listeners = [];
  function find() {
    if (!synth || !synth.getVoices) return;
    var vs = synth.getVoices();
    voice = vs.filter(function (v) { return /^gu([-_]|$)/i.test(v.lang); })[0] || null;
    listeners.forEach(function (f) { f(!!voice); });
  }
  if (synth) {
    find();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', find);
  }
  return {
    available: function () { return !!voice; },
    onChange: function (f) { listeners.push(f); },
    speak: function (text) {
      if (!voice || !GL.store.state().settings.speech) return false;
      synth.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.voice = voice; u.lang = voice.lang; u.rate = 0.85;
      synth.speak(u); return true;
    }
  };
})();

if (typeof module !== 'undefined') module.exports = GL;
