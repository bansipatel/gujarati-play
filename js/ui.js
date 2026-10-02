/* Small UI helpers shared by every screen. */
window.GL = window.GL || {};

GL.ui = (function () {
  var cleanups = [];

  function append(el, kid) {
    if (kid == null || kid === false) return;
    if (Array.isArray(kid)) { kid.forEach(function (k) { append(el, k); }); return; }
    el.appendChild(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  /* h('div', {class:'x', onclick:fn}, child, child…) */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  /* Gujarati text span (lang attribute helps screen readers and font choice). */
  function gu(text, cls) { return h('span', { lang: 'gu', class: 'gu ' + (cls || '') }, text); }

  /* Gujarati word with the target letter highlighted. The highlight always covers whole letter
     clusters (consonant + its signs) so the script never gets split mid-letter and shaping stays correct. */
  function highlighted(word, hl) {
    var i = hl ? word.indexOf(hl) : -1;
    if (i < 0) return gu(word);
    var start = 0, from = -1, to = -1;
    GL.clusters(word).forEach(function (c) {
      var end = start + c.length;
      if (end > i && start < i + hl.length) { if (from < 0) from = start; to = end; }
      start = end;
    });
    return h('span', { lang: 'gu', class: 'gu' }, word.slice(0, from), h('mark', null, word.slice(from, to)), word.slice(to));
  }

  function toast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 1800);
  }

  function updateHud() {
    var s = GL.store.state(), lv = GL.store.level();
    var p = document.getElementById('hud-points'); if (p) p.textContent = s.points + ' pts';
    var l = document.getElementById('hud-level'); if (l) l.textContent = 'Level ' + lv.n + ' · ' + lv.title;
  }

  /* Inline line icon from the sprite in index.html. */
  function icon(id, cls) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'ic ' + (cls || '')); svg.setAttribute('aria-hidden', 'true');
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#i-' + id); use.setAttribute('href', '#i-' + id);
    svg.appendChild(use); return svg;
  }

  function onCleanup(fn) { cleanups.push(fn); }
  function runCleanups() { var c = cleanups; cleanups = []; c.forEach(function (f) { try { f(); } catch (e) { /* ignore */ } }); }

  function award(n, why) {
    GL.store.addPoints(n); updateHud(); toast('+' + n + (why ? '  ' + why : ''));
  }

  /* Transliteration shown according to the learner's hint setting: show / tap / hide. */
  function hint(text, cls) {
    var mode = GL.store.state().settings.hints;
    if (mode === 'hide') return null;
    if (mode === 'tap') {
      var span = h('span', { class: 'roman ' + (cls || '') });
      var btn = h('button', { type: 'button', class: 'peek', 'aria-label': 'Show sound hint' }, 'show hint');
      btn.addEventListener('click', function () { span.textContent = text; span.classList.add('revealed'); });
      span.appendChild(btn);
      return span;
    }
    return h('span', { class: 'roman ' + (cls || '') }, text);
  }

  /* “Hear it” button, or a friendly fallback if this device has no Gujarati voice. */
  function speakBtn(text, quiet) {
    if (!GL.speech.available() || !GL.store.state().settings.speech) {
      if (quiet || !GL.store.state().settings.speech || speakBtn._told) return null;
      speakBtn._told = true;   // say it once per visit, not on every card
      return h('p', { class: 'say' }, 'No Gujarati voice was found on this device, so there is no audio. Say the word out loud — you already know how it sounds.');
    }
    return h('button', { type: 'button', class: 'btn small ghost', onclick: function () { GL.speech.speak(text); } }, 'Hear it');
  }

  function glyphOf(item) { return item.kind === 'sign' ? item.demo : item.id; }

  /* Called whenever the learner does something. A small hello bonus on the first activity each day — never a penalty for days off. */
  function played() { if (GL.store.markDay()) award(20, 'Welcome-back bonus!'); }


  /* Letter-by-letter view of a word: what is written vs what you actually say. (a) = written, not said. */
  function breakdownNode(w) {
    var units = GL.breakdown(w), anySilent = units.some(function (u) { return u.silentA; });
    return h('div', { class: 'breakdown-wrap' },
      h('div', { class: 'breakdown', role: 'group', 'aria-label': 'Letter by letter: ' + units.map(function (u) { return u.said; }).join(' ') },
        units.map(function (u) {
          return h('span', { class: 'bchip' }, h('span', { class: 'gu bg', lang: 'gu' }, u.gu),
            h('span', { class: 'bs' }, u.said, u.silentA ? h('span', { class: 'silent', title: 'written, but not said' }, '(a)') : null));
        })),
      anySilent ? h('p', { class: 'legend' }, '(a) = the built-in “a” is written, but not said out loud.') : null);
  }

  /* Falling confetti (pure CSS) for celebrations; skipped for reduced motion via the stylesheet. */
  function confetti(count) {
    var box = h('div', { class: 'confetti-box', 'aria-hidden': 'true' });
    var colors = ['#9149dc', '#f28a4b', '#bc69a6', '#ffd166'];
    for (var i = 0; i < (count || 24); i++) {
      var c = h('span', { class: 'confetti' });
      c.style.left = (Math.random() * 100) + '%';
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = (4 + Math.random() * 3) + 's';
      c.style.animationDelay = (Math.random() * 2.5) + 's';
      box.appendChild(c);
    }
    return box;
  }

  var cheers = ['Right.', 'Yes.', 'Got it.', 'Exactly.', 'Correct.'];
  var kind = ['Not that one.', 'Close. Try again.', 'Have another look.', 'Try once more.'];
  function cheer() { return cheers[Math.floor(Math.random() * cheers.length)]; }
  function kindly() { return kind[Math.floor(Math.random() * kind.length)]; }

  return { h: h, gu: gu, highlighted: highlighted, toast: toast, updateHud: updateHud, onCleanup: onCleanup, runCleanups: runCleanups,
    award: award, played: played, hint: hint, speakBtn: speakBtn, glyphOf: glyphOf, icon: icon, breakdownNode: breakdownNode, confetti: confetti, cheer: cheer, kindly: kindly };
})();
