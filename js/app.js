/* App shell: hash router and every screen except the games themselves. */
window.GL = window.GL || {};

GL.app = (function () {
  var h = GL.ui.h, gu = GL.ui.gu, store = GL.store, byId = function (id) { return GL.itemById[id]; };
  var main;

  /* ---------- helpers ---------- */
  function link(href, cls, kids) { return h('a', { href: href, class: cls || 'btn' }, kids); }
  function today_() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

  function stats() {
    var taught = store.taughtIds(), st = store.state();
    var mastered = taught.filter(function (id) { return store.stat(id).s >= 3; }).length;
    return {
      taught: taught, learned: taught.length, total: GL.items.length, mastered: mastered,
      words: GL.wordsFor(taught).length, lessons: Object.keys(st.completed).length, days: st.days.length,
      due: store.dueIds(taught).length
    };
  }
  function pill(text, href) { return href ? h('a', { class: 'label-pill', href: href }, text) : h('div', { class: 'label-pill' }, text); }
  function chipsOf(ids) { return ids.map(function (id) { return h('span', { class: 'chip' }, gu(GL.ui.glyphOf(byId(id))), ' ', GL.ui.hint(byId(id).roman)); }); }

  function strugglingBlock() {
    var s = store.struggling();
    if (!s.length) return null;
    return h('div', { class: 'callout pink' },
      h('h3', null, 'Worth another look'),
      h('p', null, 'These letters are still shaky, so they come up more often.'),
      h('div', { class: 'chips' }, chipsOf(s.slice(0, 8))),
      h('div', { class: 'row' }, link('#/play/review', 'btn small', 'Review these')));
  }

  /* ---------- Home: the landing page (start menu) ---------- */
  var celebrateNext = false;
  /* Soft celebration once the screen has been placed. where() returns [x, y] in the viewport. */
  function celebrateSoon(where) {
    setTimeout(function () { if (!document.querySelector('.landing, .summary')) return; var p = where(); GL.ui.burst(p[0], p[1]); }, 450);
  }
  function menuBtn(id, title, sub, icon, onclick, primary, i) {
    var b = h('button', { type: 'button', class: 'menu-btn' + (primary ? ' primary' : ''), id: id, onclick: onclick },
      h('span', { class: 'mb-ic' }, GL.ui.icon(icon)),
      h('span', { class: 'mb-text' }, h('span', { class: 'mb-title' }, title), h('span', { class: 'mb-sub' }, sub)),
      h('span', { class: 'mb-arrow', 'aria-hidden': 'true' }, GL.ui.icon('arrow', 'sm')));
    b.style.setProperty('--i', String(i || 0));
    return b;
  }
  function landing() {
    var s = stats(), st = store.state(), next = store.nextLesson();
    var hasLocal = s.lessons > 0 || st.points > 0;
    var syncOn = !!(GL.sync && GL.sync.available()), linked = !!(GL.sync && GL.sync.linked());
    var upNext = next ? 'Up next: Lesson ' + next.id + ', ' + next.title + '.' : 'Every lesson finished. Time to sharpen your skills.';
    var playHref = hasLocal ? '#/today' : '#/lesson/1';
    function go(href) { return function () { location.hash = href; }; }
    var opts = [];
    if (linked) {
      opts.push(menuBtn('title-continue', 'Continue', upNext + ' Saved to the cloud.', 'play', go(playHref), true, 0));
      opts.push(menuBtn('title-mycode', 'My code', 'See or copy your private code.', 'key', function () { openCodeDialog('show', null); }, false, 1));
    } else {
      opts.push(menuBtn('title-play', hasLocal ? 'Keep playing' : 'Start playing',
        hasLocal ? upNext + ' Saved on this device.' : 'Jump right in. Your progress is saved on this device only.', 'play', go(playHref), true, 0));
      if (syncOn) {
        opts.push(menuBtn('title-continue', 'Continue with a code', 'Already saved your progress? Enter your code to bring it back.', 'key',
          function () { openCodeDialog('enter', function () { celebrateNext = true; location.hash = '#/summary'; }); }, false, 1));
        opts.push(menuBtn('title-getcode', 'Get a code', 'Save your progress to the cloud. You get a private code to continue on any device.', 'cloud',
          function () { openCodeDialog('make', function () { celebrateNext = true; render(); }); }, false, 2));
      }
    }
    var orbit = h('div', { class: 'edge-letters', 'aria-hidden': 'true' });
    var sec = h('section', { class: 'landing' },
      h('div', { class: 'aurora', 'aria-hidden': 'true' }, h('i', { class: 'a1' }), h('i', { class: 'a2' }), h('i', { class: 'a3' }), h('i', { class: 'a4' })),
      orbit, GL.ui.sparkles(9),
      h('div', { class: 'landing-grid' },
        h('div', { class: 'landing-copy' },
          store.name() ? h('p', { class: 'label' }, (hasLocal ? 'Welcome back, ' : 'Hello, ') + store.name()) : null,
          h('h1', { class: 'brandmark' }, h('span', { class: 'gu gtext', lang: 'gu' }, 'અક્ષર'), h('span', { class: 'landing-title' }, 'Learn to read and write Gujarati')),
          h('p', { class: 'landing-tag' }, 'You already speak it. ', h('em', null, 'Now read it.')),
          h('p', { class: 'landing-sub' }, 'Five letters at a time, starting from words you already know. Then games, a writing pad, and reviews that bring back whatever slipped.'),
          h('ul', { class: 'feats', 'aria-label': 'What is inside' }, ['Short lessons', 'Games and flashcards', 'Writing pad'].map(function (t) { return h('li', null, t); }))),
        h('div', { class: 'menu' }, opts,
          h('p', { class: 'title-foot' }, syncOn ? 'Codes are private and need no account or email.' : 'Your progress is saved on this device.'))));
    setTimeout(function () { scatterLetters(sec, orbit); }, 60);
    window.addEventListener('resize', function onResize() {
      if (!sec.isConnected) { window.removeEventListener('resize', onResize); return; }
      clearTimeout(onResize.t); onResize.t = setTimeout(function () { scatterLetters(sec, orbit); }, 150);
    });
    return sec;
  }

  /* Drop faint letters into the empty spaces of the landing card: anywhere that is not under text or a button. */
  function scatterLetters(sec, layer) {
    if (!sec.isConnected) return;
    var box = sec.getBoundingClientRect(), pad = 22, blocks = [];
    function add(r) { if (r.width && r.height) blocks.push({ l: r.left - pad, t: r.top - pad, r: r.right + pad, b: r.bottom + pad }); }
    sec.querySelectorAll('.gtext, .feats li, .menu-btn').forEach(function (el) { add(el.getBoundingClientRect()); });
    sec.querySelectorAll('.landing-title, .landing-tag, .landing-sub, .title-foot, .label').forEach(function (el) {
      var rg = document.createRange(); rg.selectNodeContents(el);
      Array.prototype.forEach.call(rg.getClientRects(), add);
    });
    var seed = 7, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    var pool = ['ક', 'ખ', 'ગ', 'ઘ', 'ચ', 'છ', 'જ', 'ઝ', 'ટ', 'ઠ', 'ડ', 'ઢ', 'ણ', 'ત', 'થ', 'દ', 'ધ', 'ન', 'પ', 'ફ', 'બ', 'ભ', 'મ', 'ય', 'ર', 'લ', 'વ', 'શ', 'સ', 'હ'];
    var placed = [], tries = 0, max = box.width < 700 ? 8 : 22;
    layer.textContent = '';
    while (placed.length < max && tries++ < 600) {
      var size = 26 + rnd() * 22, x = rnd() * (box.width - size - 20) + 10, y = rnd() * (box.height - size - 20) + 10;
      var L = box.left + x, T = box.top + y, R = L + size * 1.1, B = T + size * 1.3, ok = true, k;
      for (k = 0; k < blocks.length && ok; k++) { var q = blocks[k]; if (!(R < q.l || L > q.r || B < q.t || T > q.b)) ok = false; }
      for (k = 0; k < placed.length && ok; k++) { var dx = placed[k].x - x, dy = placed[k].y - y; if (dx * dx + dy * dy < 62 * 62) ok = false; }
      if (!ok) continue;
      placed.push({ x: x, y: y });
      var sp = h('span', { lang: 'gu' }, pool[placed.length % pool.length]);
      sp.style.left = x + 'px'; sp.style.top = y + 'px'; sp.style.fontSize = size + 'px';
      sp.style.setProperty('--d', (-rnd() * 7) + 's'); sp.style.setProperty('--r', (rnd() * 24 - 12) + 'deg');
      layer.appendChild(sp);
    }
  }

  /* ---------- Summary: your progress at a glance (the old Home) ---------- */
  function summary() {
    var s = stats(), lv = store.level(), st = store.state();
    var started = s.lessons > 0, next = store.nextLesson();
    var last = st.days.length ? st.days[st.days.length - 1] : null;
    var welcome = (started && last && last !== today_()) ? h('p', { class: 'muted' }, 'Welcome back. Everything you learned is still here.') : null;

    // Summary shows progress. Saving choices live on Home; here we only show where progress is saved.
    var syncOn = !!(GL.sync && GL.sync.available()), syncLinked = !!(GL.sync && GL.sync.linked());
    var startBtn = h('a', { href: started ? '#/today' : '#/lesson/1', class: 'btn primary huge', id: 'home-start' }, 'Start playing');
    var heroNote = syncOn ? h('p', { class: 'hero-note', id: 'hero-note' }, syncLinked
      ? ['Synced to the cloud with your private code. ', link('#/settings', 'note-link', 'Manage it in Settings')]
      : ['Saved on this device only. ', link('#/', 'note-link', 'Get a code to save it to the cloud')]) : null;

    var nextPanel;
    if (next) {
      nextPanel = h('div', { class: 'next-panel' },
        welcome,
        h('p', { class: 'label' }, started ? 'Up next' : 'Start here'),
        h('h2', null, 'Lesson ' + next.id + ': ' + next.title),
        h('p', { class: 'np-meta' }, next.blurb),
        h('div', { class: 'np-letters', lang: 'gu' }, next.items.map(function (id) { return h('span', { class: 'gu' }, GL.ui.glyphOf(byId(id))); })),
        h('p', { class: 'np-meta' }, '5 new letters · about 4 minutes'),
        h('div', { class: 'np-foot' }, link('#/lesson/' + next.id, 'btn primary huge', [started ? 'Continue' : 'Start lesson', GL.ui.icon('arrow', 'sm')])),
        s.due >= 3 ? h('div', { class: 'np-due' }, GL.ui.icon('refresh', 'sm'), h('span', null, s.due + ' letters are ready for a refresh. '), link('#/play/quick', 'btn small ghost', 'Quick 5')) : null);
    } else {
      nextPanel = h('div', { class: 'next-panel' }, h('p', { class: 'label' }, 'All lessons done'), h('h2', null, 'Keep them sharp'),
        h('p', { class: 'np-meta' }, 'Spelling Check and Say It are the best way to make this stick.'),
        h('div', { class: 'np-foot' }, link('#/practice', 'btn primary huge', ['Practice', GL.ui.icon('arrow', 'sm')])));
    }

    var fade = (st.settings.hints === 'show' && s.learned >= 10 && s.mastered / s.learned >= 0.6) ? h('div', { class: 'callout gold' },
      h('h3', null, 'Ready to fade the hints?'),
      h('p', null, 'Most of your letters feel strong. Reading without the English-letter hints is how this turns into real reading.'),
      h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn small primary', onclick: function () { st.settings.hints = 'tap'; store.save(); GL.ui.toast('Hints are now tap-to-reveal'); render(); } }, 'Switch to tap-to-reveal'))) : null;

    // Letter map: every letter in lesson order, colored by how well you know it.
    var order = []; GL.lessons.forEach(function (l) { order = order.concat(l.items); });
    var taughtSet = {}; s.taught.forEach(function (id) { taughtSet[id] = 1; });
    var map = h('div', { class: 'lettermap', role: 'group', 'aria-label': 'All letters' }, order.map(function (id) {
      var it = byId(id), t = !!taughtSet[id], sx = store.stat(id), cls = 'lm';
      var label = 'not learned yet';
      if (t) { cls += ' taught'; label = 'learned'; if (sx.s >= 4) { cls += ' strong'; label = 'strong'; } else if (sx.w > 0 && sx.s <= 1) { cls += ' weak'; label = 'needs review'; } else if (sx.s >= 2) { cls += ' ok'; label = 'getting there'; } }
      return h('button', { type: 'button', class: cls, lang: 'gu', 'aria-label': GL.ui.glyphOf(it) + ', ' + it.roman + ', ' + label, onclick: function () { detail(it); } }, GL.ui.glyphOf(it));
    }));

    return h('div', { class: 'home summary' },
      h('div', { class: 'home-top' },
        h('section', { class: 'hero-panel summary' },
          h('div', { class: 'hero-glyphs', 'aria-hidden': 'true' }, h('span', { class: 'g1' }, '\u0A97'), h('span', { class: 'g2' }, '\u0A95'), h('span', { class: 'g3' }, '\u0AAE')),
          h('p', { class: 'label' }, 'Summary'),
          h('h1', null, store.name() ? GL.ui.greeting(store.name()) : 'Level ' + lv.n + ' \u00b7 ' + lv.title),
          h('p', null, (store.name() ? 'Level ' + lv.n + ' \u00b7 ' + lv.title + ' \u00b7 ' : '') + st.points + ' points \u00b7 ' + s.days + (s.days === 1 ? ' day' : ' days') + ' played \u00b7 ' + s.learned + ' of ' + s.total + ' letters learned'),
          h('div', { class: 'lv-bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': lv.size, 'aria-valuenow': lv.into, 'aria-label': 'Progress to the next level' }, h('div', { style: 'width:' + Math.round(lv.into / lv.size * 100) + '%' })),
          h('p', { class: 'hero-note' }, (lv.size - lv.into) + ' points to the next level.'),
          h('div', { class: 'row' }, startBtn, link('#/alphabet', 'btn ghost', 'Browse the alphabet')),
          heroNote),
        nextPanel),
      h('ul', { class: 'statline' },
        h('li', null, h('b', null, String(st.points)), h('span', null, 'points')),
        h('li', null, h('b', null, 'Lv ' + lv.n), h('span', null, lv.title)),
        h('li', null, h('b', null, s.learned + '/' + s.total), h('span', null, 'letters learned')),
        h('li', null, h('b', null, String(s.words)), h('span', null, 'words you can read')),
        h('li', null, h('b', null, String(s.days)), h('span', null, 'days played'))),
      fade, strugglingBlock(),
      h('div', { class: 'section-head' }, h('h2', null, 'Your letters'), h('span', null, s.mastered + ' feeling strong')),
      map,
      h('div', { class: 'legend-row' },
        h('span', null, h('i', { style: 'background:transparent;border-style:dashed' }), 'not yet taught'), h('span', null, h('i', { style: 'background:#fff' }), 'learned'),
        h('span', null, h('i', { style: 'background:var(--tint-pink)' }), 'needs review'), h('span', null, h('i', { style: 'background:var(--tint)' }), 'getting there'), h('span', null, h('i', { style: 'background:var(--accent)' }), 'strong')),
      h('div', { class: 'section-head' }, h('h2', null, 'How this works')),
      h('div', { class: 'principles' },
        h('div', null, h('h3', null, 'Start from words you say'), h('p', null, 'Each letter arrives inside a word you already know, with your familiar spelling next to the Gujarati.')),
        h('div', null, h('h3', null, 'Train the spelling'), h('p', null, 'You know the sounds. The hard part is ઇ vs ઈ, ન vs ણ, સ vs શ vs ષ, and the “a” that is written but not said.')),
        h('div', null, h('h3', null, 'Review before you forget'), h('p', null, 'Letters come back right before they fade, and the hints fade as you improve. No streaks, no penalties.'))));
  }

  /* ---------- Today ---------- */
  function today() {
    var s = stats(), next = store.nextLesson(), struggling = store.struggling();
    var rows = [];
    if (s.learned >= 4) rows.push({ t: 'Warm-up: Quick 5', d: s.due ? s.due + ' letters are ready for a refresh.' : 'A mixed set from letters you know.', href: '#/play/quick', b: 'Warm up' });
    if (next) rows.push({ t: 'Lesson ' + next.id + ': ' + next.title, d: next.blurb, href: '#/lesson/' + next.id, b: 'Start lesson' });
    else rows.push({ t: 'Every lesson finished', d: 'Replay any lesson, or keep your skills sharp with the games.', href: '#/lessons', b: 'See lessons' });
    var wl = struggling[0] || (s.taught.length ? s.taught[s.taught.length - 1] : null);
    if (wl) rows.push({ t: 'Write a letter', d: 'Optional. Practice ' + GL.ui.glyphOf(byId(wl)) + ' on the drawing pad.', href: '#/write/' + encodeURIComponent(wl), b: 'Open pad' });
    return h('div', null,
      h('h1', null, 'Your five minutes'),
      h('p', { class: 'lead' }, 'Do one, two or all three. Whatever fits today is the right amount.'),
      h('div', { class: 'lesson-list' }, rows.map(function (r, i) {
        return h('div', { class: 'lesson-row' + (i === (s.learned >= 4 ? 1 : 0) ? ' next' : '') }, h('div', { class: 'lr-num' }, String(i + 1)),
          h('div', { class: 'lr-body' }, h('h3', null, r.t), h('p', null, r.d)), h('div', { class: 'lr-act' }, link(r.href, 'btn small primary', r.b)));
      })));
  }

  /* ---------- Lessons ---------- */
  function lessons() {
    var next = store.nextLesson();
    return h('div', null,
      h('h1', null, 'Lessons'),
      h('p', { class: 'lead' }, 'Finish a lesson to unlock the next one. Completed lessons can be replayed any time.'),
      h('div', { class: 'lesson-list' }, GL.lessons.map(function (l) {
        var done = store.isDone(l.id), open = store.isUnlocked(l.id), isNext = next && next.id === l.id;
        return h('div', { class: 'lesson-row ' + (done ? 'done' : open ? 'open' : 'locked') + (isNext ? ' next' : '') },
          h('div', { class: 'lr-num' }, done ? GL.ui.icon('check') : (open ? String(l.id) : GL.ui.icon('lock'))),
          h('div', { class: 'lr-body' },
            h('div', { class: 'lr-letters', lang: 'gu' }, l.items.map(function (id) { return h('span', null, GL.ui.glyphOf(byId(id))); })),
            h('h3', null, 'Lesson ' + l.id + ': ' + l.title), h('p', null, l.blurb)),
          h('div', { class: 'lr-act' }, open ? link('#/lesson/' + l.id, 'btn small' + (done ? '' : ' primary'), done ? 'Replay' : 'Start') : null));
      })));
  }

  /* ---------- A single lesson ---------- */
  function lesson(n) {
    var L = GL.lessonById(n);
    if (!L) return notFound();
    if (!store.isUnlocked(n)) {
      return h('div', { class: 'card' }, h('h1', null, 'Not quite yet'), h('p', null, 'Finish lesson ' + (n - 1) + ' first, then this one opens up.'), link('#/lessons', 'btn primary', 'Back to lessons'));
    }
    var steps = [];
    if (L.intro) steps.push({ t: 'intro' });
    L.items.forEach(function (id) { steps.push({ t: 'learn', id: id }); });
    steps.push({ t: 'quiz' });
    var i = 0, box = h('div', { class: 'lesson-box' });

    /* Look-alikes that have already been taught (or are in this very lesson). */
    function compareBox(it) {
      var near = GL.confusablesOf(it.id).filter(function (c) { return (GL.lessonOfItem[c.other] || 99) <= n; });
      if (!near.length) return null;
      return h('div', { class: 'dsec' }, h('p', { class: 'label' }, 'Don’t mix them up'),
        near.slice(0, 2).map(function (c) {
          var o = byId(c.other);
          return h('div', { class: 'cmp-row' },
            h('span', { class: 'cmp-pair' }, h('span', { class: 'gu cg', lang: 'gu' }, GL.ui.glyphOf(it)), h('span', { class: 'vs' }, 'vs'), h('span', { class: 'gu cg', lang: 'gu' }, GL.ui.glyphOf(o))),
            h('span', { class: 'cmp-note' }, h('b', null, it.roman + ' / ' + o.roman), ' · ', c.note));
        }));
    }

    function learnCard(id, k) {
      var it = byId(id), w = it.word;
      var kind = { consonant: 'Consonant', vowel: 'Vowel', sign: 'Vowel sign', conjunct: 'Joined letters' }[it.kind];
      var explain = null;
      if (it.kind === 'consonant') explain = h('p', { class: 'say' }, 'Every consonant carries a built-in “a”: ', gu(it.id), ' = ', h('b', null, it.roman), '. No extra letter needed.');
      if (it.kind === 'sign' && it.vowel) explain = h('p', { class: 'say' }, 'ક + ', gu(it.id), ' = ', gu(it.demo), ' (', h('b', null, it.roman), ')');
      var wordObj = { gu: w.gu, roman: w.roman, en: w.en };
      return h('div', { class: 'learn-grid' },
        h('div', { class: 'stage' },
          h('p', { class: 'label' }, kind + ' · ' + (k + 1) + ' of ' + L.items.length),
          h('div', { class: 'bigglyph xl' }, gu(GL.ui.glyphOf(it))),
          h('p', { class: 'sound' }, GL.ui.hint(it.roman) || h('span', { class: 'muted' }, 'Hint hidden')),
          h('p', { class: 'tip' }, it.tip)),
        h('div', { class: 'detail-col' },
          explain ? h('div', { class: 'dsec' }, explain) : null,
          h('div', { class: 'dsec' },
            h('p', { class: 'label' }, 'A word you already say'),
            h('p', { class: 'gujlish' }, GL.ui.hint(w.roman, 'big') || null, h('span', { class: 'arrow', 'aria-hidden': 'true' }, '→'), GL.ui.highlighted(w.gu, w.hl), h('span', { class: 'en' }, w.en)),
            GL.ui.breakdownNode(wordObj),
            h('p', { class: 'say' }, 'Say it out loud, then point at the highlighted letter.'),
            GL.ui.speakBtn(w.gu)),
          compareBox(it),
          h('div', { class: 'dsec' }, link('#/write/' + encodeURIComponent(it.id), 'btn small', [GL.ui.icon('pen', 'sm'), 'Practice writing it']))));
    }

    function render() {
      box.innerHTML = '';
      var s = steps[i];
      if (s.t === 'quiz') return startQuiz();
      var card;
      if (s.t === 'intro') card = h('div', { class: 'qcard' }, h('p', { class: 'label' }, 'The big idea'), h('h2', null, L.intro.title), h('p', { class: 'big-msg', html: L.intro.body }));
      else card = learnCard(s.id, L.items.indexOf(s.id));
      var learnSteps = steps.length - 1;
      box.appendChild(h('div', { class: 'session' },
        h('div', { class: 'session-top' }, link('#/lessons', 'btn small ghost', 'Leave'),
          h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': learnSteps, 'aria-valuenow': i, 'aria-label': 'Lesson progress' }, h('div', { style: 'width:' + Math.round(i / learnSteps * 100) + '%' })),
          h('span', { class: 'count' }, 'Learn')),
        card,
        h('div', { class: 'row between' },
          h('button', { type: 'button', class: 'btn', disabled: i === 0, onclick: function () { i--; render(); } }, 'Back'),
          h('button', { type: 'button', class: 'btn primary huge', id: 'learn-next', onclick: function () { i++; render(); } }, i === learnSteps - 1 ? 'Start the quiz' : 'Next'))));
      var nb = document.getElementById('learn-next'); if (nb) nb.focus({ preventScroll: true });
      GL.ui.played();
    }

    function startQuiz() {
      var pool = store.taughtIds().concat(L.items.filter(function (id) { return store.taughtIds().indexOf(id) === -1; }));
      var qs = GL.games.build('lesson', pool, { focus: L.items });
      GL.games.run(box, qs, {
        exitHref: '#/lessons',
        onFinish: function (summary) {
          var first = store.completeLesson(n);
          GL.ui.award(first ? 50 : 15, first ? 'Lesson complete' : 'Replay bonus');
          var nextL = GL.lessonById(n + 1);
          var freshBadges = first ? unlockBadges() : [];
          if (first) box.appendChild(h('div', { class: 'celebrate' }, GL.ui.confetti(30), h('div', { class: 't' }, 'Lesson ' + n + ' complete')));
          box.appendChild(GL.games.resultCard(summary, [
            h('p', { class: 'big-msg' }, first ? (nextL ? 'Lesson ' + nextL.id + ' is unlocked.' : 'You have finished every lesson.') : 'Replay done. Nice refresher.'),
            freshBadges.length ? h('p', { class: 'big-msg new-badges', id: 'new-badges' }, 'New badge' + (freshBadges.length > 1 ? 's' : '') + ' unlocked: ', h('b', null, freshBadges.map(function (g) { return g.name; }).join(', ')), '.') : null,
            h('div', { class: 'row center' },
              nextL ? link('#/lesson/' + nextL.id, 'btn primary', 'Next lesson') : null,
              link('#/practice', 'btn', 'Practice games'), link('#/lesson/' + n, 'btn ghost', 'Replay'), link('#/', 'btn ghost', 'Home'))
          ], 'Lesson ' + n + ' quiz'));
        }
      });
    }

    function onKey(e) {
      if (steps[i].t === 'quiz' || e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') { i++; render(); } else if (e.key === 'ArrowLeft' && i > 0) { i--; render(); }
    }
    document.addEventListener('keydown', onKey);
    GL.ui.onCleanup(function () { document.removeEventListener('keydown', onKey); });
    render();
    return box;
  }

  /* ---------- Practice: a badge per game. Each one starts locked and unlocks as you learn. ---------- */
  var GAMES = [
    { g: 'Letters and sounds', id: 'quick', name: 'Quick 5', tag: 'Warm-up', shot: '\u0A95', theme: 'letters', href: '#/play/quick', need: 'letters', text: 'About ten mixed questions, weighted toward letters due for review.' },
    { g: 'Letters and sounds', id: 'match', name: 'Letter Match', tag: 'Letters', shot: '\u0A96', theme: 'letters', href: '#/play/match', need: 'letters', text: 'Match letters to sounds, and sounds to letters.' },
    { g: 'Letters and sounds', id: 'recall', name: 'Recall', tag: 'Memory', shot: '\u0A97', theme: 'letters', href: '#/play/recall', need: 'letters', text: 'See a letter and type its sound from memory.' },
    { g: 'Letters and sounds', id: 'flash', name: 'Flashcards', tag: 'Cards', shot: '\u0A98', theme: 'letters', href: '#/flash', need: 'letters', text: 'Flip, think, rate yourself. Keys: Space, \u2190 and \u2192.' },
    { g: 'Words and spelling', id: 'decode', name: 'Say It', tag: 'Reading', shot: '\u0A98\u0AB0', theme: 'words', href: '#/play/decode', need: 'words', text: 'Read a Gujarati word and pick how you say it.' },
    { g: 'Words and spelling', id: 'spell', name: 'Spelling Check', tag: 'Spelling', shot: '\u0AAA\u0ABE\u0AA3\u0AC0', theme: 'words', href: '#/play/spell', need: 'spell', text: 'You know the sound. Pick the right spelling: \u0A87/\u0A88, \u0AA8/\u0AA3, \u0AB8/\u0AB6/\u0AB7.' },
    { g: 'Words and spelling', id: 'find', name: 'Find It', tag: 'Letters in words', shot: '\u0A95\u0AAE\u0AB3', theme: 'words', href: '#/play/find', need: 'find', text: 'Tap the part of a real word that holds a letter.' },
    { g: 'Words and spelling', id: 'words', name: 'Word Reader', tag: 'Meaning', shot: '\u0A9A\u0ABE', theme: 'words', href: '#/play/words', need: 'words', text: 'Read real words and pick the meaning.' },
    { g: 'Words and spelling', id: 'build', name: 'Word Builder', tag: 'Building', shot: '\u0A9F\u0ACB\u0AAA\u0AC0', theme: 'words', href: '#/play/build', need: 'words', text: 'Build words from letter and sign tiles.' },
    { g: 'Writing', id: 'write', name: 'Writing Pad', tag: 'Writing', shot: '\u0A95', theme: 'write', href: '#/write', need: 'free', text: 'Copy big letters. Works with Apple Pencil.' }
  ];
  var ACH = [
    { id: 'a-first', name: 'First Steps', tag: 'Milestone', shot: '\u0AE7', req: 'Finish your first lesson.', text: 'You finished a lesson.', test: function (s) { return s.lessons >= 1; } },
    { id: 'a-ten', name: 'Ten Letters', tag: 'Milestone', shot: '\u0AE7\u0AE6', req: 'Learn 10 letters.', text: 'Ten letters learned.', test: function (s) { return s.learned >= 10; } },
    { id: 'a-twenty', name: 'Twenty Letters', tag: 'Milestone', shot: '\u0AE8\u0AE6', req: 'Learn 20 letters.', text: 'Twenty letters learned.', test: function (s) { return s.learned >= 20; } },
    { id: 'a-all', name: 'Whole Alphabet', tag: 'Milestone', shot: '\u0A85', req: 'Learn every letter.', text: 'Every letter learned.', test: function (s) { return s.learned >= s.total; } },
    { id: 'a-words', name: 'Word Collector', tag: 'Words', shot: '\u0AB6\u0AAC\u0ACD\u0AA6', req: 'Learn enough letters to read 10 words.', text: 'Ten words you can read.', test: function (s) { return s.words >= 10; } },
    { id: 'a-words25', name: 'Word Hoard', tag: 'Words', shot: '\u0AB6\u0AAC\u0ACD\u0AA6\u0ACB', req: 'Learn enough letters to read 25 words.', text: 'Twenty-five words you can read.', test: function (s) { return s.words >= 25; } },
    { id: 'a-solid5', name: 'Solid Five', tag: 'Mastery', shot: '\u0AEB', req: 'Get 5 letters to feel solid.', text: 'Five letters you know well.', test: function (s) { return s.mastered >= 5; } },
    { id: 'a-solid15', name: 'Fifteen Strong', tag: 'Mastery', shot: '\u0AE7\u0AEB', req: 'Get 15 letters to feel solid.', text: 'Fifteen letters you know well.', test: function (s) { return s.mastered >= 15; } },
    { id: 'a-days3', name: 'Three Days', tag: 'Habit', shot: '\u0AE9', req: 'Practice on 3 different days.', text: 'Back for a third day.', test: function (s) { return s.days >= 3; } },
    { id: 'a-days7', name: 'A Full Week', tag: 'Habit', shot: '\u0AED', req: 'Practice on 7 different days.', text: 'Seven days of practice.', test: function (s) { return s.days >= 7; } },
    { id: 'a-p100', name: '100 Points', tag: 'Points', shot: '\u0AE7\u0AE6\u0AE6', req: 'Earn 100 points.', text: 'A hundred points.', test: function (s, st) { return st.points >= 100; } },
    { id: 'a-p500', name: '500 Points', tag: 'Points', shot: '\u0AEB\u0AE6\u0AE6', req: 'Earn 500 points.', text: 'Five hundred points.', test: function (s, st) { return st.points >= 500; } },
    { id: 'a-p1000', name: '1,000 Points', tag: 'Points', shot: '\u0AE7\u0AE6\u0AE6\u0AE6', req: 'Earn 1,000 points.', text: 'A thousand points.', test: function (s, st) { return st.points >= 1000; } },
    { id: 'a-course', name: 'Course Complete', tag: 'Finish', shot: '\u0AAA\u0AC2\u0AB0\u0ACD\u0AA3', req: 'Finish every lesson.', text: 'Every lesson finished.', test: function (s) { return s.lessons >= GL.lessons.length; } }
  ];
  ACH.forEach(function (a) { a.g = 'Milestones'; a.theme = 'ach'; a.need = 'ach'; });
  var ALL = GAMES.concat(ACH);
  var WHY = { letters: 'Finish lesson 1 to unlock.', words: 'Finish lessons 1 and 2 to unlock.', spell: 'Learn a few look-alike letters, like \u0AA8 and \u0AA3, to unlock.', find: 'Finish lesson 2 to unlock.' };

  /* Which badge requirements are met right now. */
  function badgeAvail() {
    var s = stats(), pool = s.taught;
    return {
      letters: s.learned >= 4, words: s.words >= 4, free: true,
      spell: s.words >= 4 && GL.games.build('spell', pool, { count: 3 }).length >= 3,
      find: s.words >= 4 && GL.games.build('find', pool, { count: 3 }).length >= 3
    };
  }
  function isOpen(g, av, s, st) { return !!((st.badges && st.badges[g.id]) || (g.test ? g.test(s, st) : av[g.need])); }
  /* Record every badge whose requirement is now met. Returns the ones unlocked just now (the free one never counts as new). */
  function unlockBadges() {
    var av = badgeAvail(), s = stats(), st = store.state(), fresh = [];
    ALL.forEach(function (g) {
      if (isOpen(g, av, s, st) && store.unlockBadge(g.id)) { if (g.need === 'free') store.markBadgeSeen([g.id]); else fresh.push(g); }
    });
    return fresh;
  }

  var rosetteN = 0;
  /* A scalloped medal drawn in SVG; colors come from the badge's theme. */
  function rosette() {
    var NS = 'http://www.w3.org/2000/svg', id = 'rg' + (++rosetteN), n = 16, R = 50, d = '', i;
    function el(tag, attrs) { var e = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); return e; }
    for (i = 0; i < n; i++) {
      var a0 = i * 2 * Math.PI / n, a1 = (i + 1) * 2 * Math.PI / n, am = (a0 + a1) / 2, cr = R * 1.2;
      if (i === 0) d += 'M ' + (R * Math.cos(a0)).toFixed(2) + ' ' + (R * Math.sin(a0)).toFixed(2);
      d += ' Q ' + (cr * Math.cos(am)).toFixed(2) + ' ' + (cr * Math.sin(am)).toFixed(2) + ' ' + (R * Math.cos(a1)).toFixed(2) + ' ' + (R * Math.sin(a1)).toFixed(2);
    }
    var svg = el('svg', { viewBox: '-60 -60 120 120', class: 'rosette', 'aria-hidden': 'true', focusable: 'false' });
    var defs = el('defs'), grad = el('linearGradient', { id: id, x1: '0', y1: '0', x2: '1', y2: '1' });
    var s1 = el('stop', { offset: '0', style: 'stop-color: var(--c1)' }), s2 = el('stop', { offset: '1', style: 'stop-color: var(--c2)' });
    grad.appendChild(s1); grad.appendChild(s2); defs.appendChild(grad); svg.appendChild(defs);
    svg.appendChild(el('path', { d: d + ' Z', fill: 'url(#' + id + ')' }));
    svg.appendChild(el('circle', { r: '41', fill: 'none', stroke: '#fff', 'stroke-opacity': '.6', 'stroke-width': '1.4' }));
    svg.appendChild(el('circle', { r: '37', fill: '#fff', 'fill-opacity': '.13' }));
    svg.appendChild(el('ellipse', { cx: '-13', cy: '-31', rx: '24', ry: '9', fill: '#fff', 'fill-opacity': '.22', transform: 'rotate(-24)' }));
    return svg;
  }

  function badge(g, open, fresh) {
    var medal = h('span', { class: 'medal theme-' + g.theme }, rosette(),
      open ? h('span', { class: 'medal-glyph gu' + (Array.from(g.shot).length > 3 ? ' xlong' : Array.from(g.shot).length > 2 ? ' long' : ''), lang: 'gu' }, g.shot) : GL.ui.icon('lock', 'medal-lock'),
      fresh ? h('span', { class: 'medal-new' }, 'New') : null);
    var label = h('span', { class: 'label-pill' }, g.tag === 'Milestone' ? g.name : g.name + ' - ' + g.tag);
    var why = g.req || WHY[g.need];
    var text = h('span', { class: 'badge-text' }, open ? g.text : 'Locked. ' + why);
    if (open) return h('a', { href: g.href, class: 'badge' + (fresh ? ' fresh' : ''), id: 'badge-' + g.id, 'aria-label': 'Play ' + g.name + (fresh ? ' (new badge)' : '') }, medal, label, text);
    return h('div', { class: 'badge locked', id: 'badge-' + g.id, role: 'group', 'aria-label': g.name + ', locked. ' + why }, medal, label, text);
  }

  function practice() {
    var av = badgeAvail(), sx = stats(), stx = store.state();
    unlockBadges();
    var seen = store.state().badgeSeen || {}, freshIds = [], freshNames = [], openCount = 0;
    var groups = [];
    ALL.forEach(function (g) { if (groups.indexOf(g.g) === -1) groups.push(g.g); if (isOpen(g, av, sx, stx)) openCount++; });
    var page = h('div', null,
      h('h1', null, 'Practice'),
      h('p', { class: 'lead' }, 'Each game is a badge, and so are your milestones. They unlock as you learn, and games only use letters and words you have already learned.'),
      h('p', { class: 'badge-count', id: 'badge-count' }, h('b', null, openCount + ' of ' + ALL.length), ' badges unlocked'),
      strugglingBlock(),
      groups.map(function (gn) {
        return h('section', null, h('div', { class: 'group-head' }, h('h2', null, gn)),
          h('div', { class: 'badge-grid' }, ALL.filter(function (g) { return g.g === gn; }).map(function (g) {
            var open = isOpen(g, av, sx, stx), fresh = open && g.need !== 'free' && !seen[g.id];
            if (fresh) { freshIds.push(g.id); freshNames.push(g.name); }
            return badge(g, open, fresh);
          })));
      }));
    if (freshIds.length) {
      setTimeout(function () {
        var m = document.querySelector('.badge.fresh .medal');
        if (m && document.querySelector('.badge-grid')) { var r = m.getBoundingClientRect(); GL.ui.burst(r.left + r.width / 2, r.top + r.height / 2); GL.ui.toast('Badge unlocked: ' + freshNames.join(', ')); }
        store.markBadgeSeen(freshIds);
      }, 600);
    }
    return page;
  }

  function play(mode) {
    var s = stats(), pool = s.taught;
    if (pool.length < 4) return h('div', { class: 'card' }, h('h1', null, 'Almost there'), h('p', null, 'Finish lesson 1 to unlock the games.'), link('#/lesson/1', 'btn primary', 'Go to lesson 1'));
    var box = h('div', { class: 'lesson-box' }), qs;
    var words = GL.wordsFor(pool);
    var focus = store.struggling(pool);
    var needsWords = ['words', 'build', 'decode', 'spell', 'find'].indexOf(mode) !== -1;
    if (needsWords && words.length < 4) return h('div', { class: 'card' }, h('h1', null, 'Words are coming'), h('p', null, 'Finish lessons 1 and 2 to unlock word games.'), link('#/lesson/' + (store.nextLesson() || { id: 1 }).id, 'btn primary', 'Continue lessons'));
    if (mode === 'build') qs = pickBuild(words, pool);
    else qs = GL.games.build(mode === 'review' ? 'match' : mode, pool, { focus: focus, count: 8 });
    if (!qs.length) return h('div', { class: 'card' }, h('h1', null, 'Not enough yet'), h('p', null, 'This game needs a few more letters first. Keep going with the lessons.'), link('#/practice', 'btn primary', 'Back to practice'));
    GL.games.run(box, qs, {
      exitHref: '#/practice',
      onFinish: function (summary) {
        box.appendChild(GL.games.resultCard(summary, h('div', { class: 'row center' },
          h('button', { type: 'button', class: 'btn primary', onclick: function () { render(); } }, 'Play again'),
          link('#/practice', 'btn', 'Practice menu'), link('#/', 'btn ghost', 'Home'))));
      }
    });
    return box;
  }
  function pickBuild(words, pool) {
    var usable = words.filter(function (w) { return Array.from(w.gu).length <= 7; });
    return GL.shuffle(usable).slice(0, 6).map(function (w) { return GL.games.buildQ(w, pool); });
  }

  function flash() {
    var pool = store.taughtIds();
    if (pool.length < 4) return h('div', { class: 'card' }, h('h1', null, 'Almost there'), h('p', null, 'Finish lesson 1 to unlock flashcards.'), link('#/lesson/1', 'btn primary', 'Go to lesson 1'));
    var box = h('div', { class: 'lesson-box' });
    GL.games.flashcards(box, GL.pickItems(pool, Math.min(10, pool.length), { focus: store.struggling(pool) }));
    return box;
  }

  /* ---------- Alphabet reference ---------- */
  function guide() {
    return h('details', { class: 'card guide' }, h('summary', null, 'Sound guide: how the hints are written'),
      h('div', { html:
        '<p>The hints use plain English letters, written the same way everywhere in this app, close to how you may already text Gujarati.</p>' +
        '<ul>' +
        '<li><b>Built-in a.</b> A consonant carries a short “a”: <span lang="gu" class="gu">ક</span> = <b>ka</b>. In everyday speech the last “a” of a word is silent: <span lang="gu" class="gu">કમર</span> = <b>kamar</b>. The app marks these as <b>(a)</b>: written, but not said.</li>' +
        '<li><b>Vowels.</b> a, aa, i / ee, u / oo, e, ai, o, au. Modern Gujarati says short and long <span lang="gu" class="gu">ઇ ઈ</span> (and <span lang="gu" class="gu">ઉ ઊ</span>) the same way, so <b>i</b> vs <b>ee</b> and <b>u</b> vs <b>oo</b> only show the <i>spelling</i>. That is exactly the part you have to learn by seeing it.</li>' +
        '<li><b>Puff of breath.</b> An <b>h</b> after a consonant (kh, gh, chh, jh, Th, Dh, th, dh, ph, bh) means a breathy puff. <span lang="gu" class="gu">ફ</span> is often said as “f”.</li>' +
        '<li><b>Capital letters</b> (T, Th, D, Dh, N, L) mark sounds made with the tongue curled back: <span lang="gu" class="gu">ટ ઠ ડ ઢ ણ ળ</span>. Lower-case t, th, d, dh, n, l are the tongue-at-the-teeth sounds <span lang="gu" class="gu">ત થ દ ધ ન લ</span>. <span lang="gu" class="gu">ષ</span> is written <b>Sh</b> but sounds like <span lang="gu" class="gu">શ</span> (<b>sh</b>).</li>' +
        '<li><b>Nasal dot.</b> <span lang="gu" class="gu">ં</span> is written <b>n</b>: <span lang="gu" class="gu">પતંગ</span> = <b>patang</b>.</li>' +
        '</ul>' +
        '<p class="muted">Sources: Wikipedia “Gujarati alphabet” and “Gujarati phonology”. Hints are an aid, not a replacement for your own ear.</p>' }));
  }

  function alphabet() {
    var taught = store.taughtIds();
    return h('div', null,
      h('h1', null, 'Alphabet'),
      h('p', { class: 'lead' }, 'Tap any letter for details. A checkmark means you have learned it; dashed tiles are still ahead.'),
      guide(),
      GL.groups.map(function (g) {
        return h('section', { class: 'alpha-group' }, h('h2', null, g.title), h('p', { class: 'muted' }, g.sub),
          h('div', { class: 'alpha-grid' }, GL.items.filter(function (it) { return it.kind === g.id; }).map(function (it) {
            var learned = taught.indexOf(it.id) !== -1;
            return h('button', { type: 'button', class: 'alpha-tile ' + (learned ? 'learned' : 'unlearned'), onclick: function () { detail(it); },
              'aria-label': GL.ui.glyphOf(it) + ', ' + it.roman + (learned ? ', learned' : ', not learned yet') },
              h('span', { class: 'g gu', lang: 'gu' }, GL.ui.glyphOf(it)), GL.ui.hint(it.roman, 'r'), learned ? GL.ui.icon('check', 'tick') : null);
          })));
      }),
      h('div', { class: 'callout' }, h('h3', null, 'Not covered yet'),
        h('p', null, 'Rare letters ઙ ઞ ઋ, the loan-word signs ઑ ૉ, the visarga ઃ and Gujarati digits are not included. They show up much less in everyday reading.')));
  }

  function detail(it) {
    var dlg = document.getElementById('dlg');
    var learned = store.taughtIds().indexOf(it.id) !== -1;
    dlg.innerHTML = '';
    var near = GL.confusablesOf(it.id);
    dlg.appendChild(h('div', { class: 'dlg-body' },
      h('p', { class: 'label', id: 'dlg-title' }, it.kind === 'sign' ? 'Vowel sign' : it.kind === 'conjunct' ? 'Joined letters' : it.kind),
      h('div', { class: 'bigglyph xl' }, gu(GL.ui.glyphOf(it))),
      h('p', { class: 'sound' }, GL.ui.hint(it.roman)),
      h('p', { class: 'tip' }, it.tip),
      h('p', { class: 'exword' }, GL.ui.highlighted(it.word.gu, it.word.hl)), h('p', null, GL.ui.hint(it.word.roman), ' ', h('span', { class: 'en' }, it.word.en)), GL.ui.speakBtn(it.word.gu),
      near.length ? h('p', { class: 'muted' }, 'Often mixed up with ', near.map(function (c) { return GL.ui.glyphOf(byId(c.other)) + ' '; }), '· ', near[0].note) : null,
      h('p', { class: 'muted' }, learned ? 'You have learned this one.' : 'Coming up in lesson ' + GL.lessonOfItem[it.id] + '.'),
      h('div', { class: 'row center' },
        link('#/write/' + encodeURIComponent(it.id), 'btn', 'Write it'),
        h('button', { type: 'button', class: 'btn primary', onclick: function () { dlg.close(); } }, 'Close'))));
    dlg.setAttribute('aria-labelledby', 'dlg-title');
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    dlg.querySelector('.btn.primary').focus();
    dlg.querySelector('a.btn').addEventListener('click', function () { dlg.close(); });
  }

  /* ---------- Sync (cloud) ---------- */
  var revealCode = false, syncPaint = null;
  /* The private-code dialog.  make: explain, then create a code on request.  show: the code you have.
     enter: continue with a code (restores progress, opens Today). */
  function openCodeDialog(mode, after) {
    var dlg = document.getElementById('dlg');
    var st = { mode: mode, code: mode === 'show' ? GL.sync.code() : null, msg: '', busy: false, name: store.name() };
    function done() { dlg.close(); if (after) after(); else render(); }
    function create() {
      if ((st.name || '').trim()) store.setName(st.name);   // saved with the progress, so the first cloud save already has it
      st.busy = true; st.msg = ''; paint();
      GL.sync.enable().then(function (code) { st.code = code; st.mode = 'show'; st.busy = false; revealCode = true; paint(); },
        function () { st.busy = false; st.msg = 'Could not reach the cloud. Check your connection and try again.'; paint(); });
    }
    function paint() {
      dlg.innerHTML = '';
      var body = h('div', { class: 'dlg-body' });
      if (st.mode === 'make') {
        body.appendChild(h('h2', { id: 'dlg-title' }, 'Get a private code'));
        if (st.busy) body.appendChild(h('p', { id: 'code-msg' }, 'Creating your code\u2026'));
        else {
          body.appendChild(h('p', null, 'This saves your progress to the cloud under a code only you have. Save the code, then enter it on any device to continue where you left off. No account or email.'));
          var nameIn = h('input', { type: 'text', class: 'typed name-input', id: 'name-input', maxlength: '24', autocomplete: 'nickname', autocapitalize: 'words', spellcheck: 'false', 'aria-label': 'Your name', placeholder: 'Your first name or a nickname', value: st.name || '', enterkeyhint: 'done',
            oninput: function () { st.name = nameIn.value; } });
          body.appendChild(h('label', { class: 'name-field', for: 'name-input' }, h('span', { class: 'label' }, 'What should we call you?'), nameIn,
            h('span', { class: 'field-note' }, 'Optional. It is saved with your progress so the app can greet you, including on other devices. A nickname is fine.')));
          if (st.msg) body.appendChild(h('p', { class: 'muted', id: 'code-msg' }, st.msg));
          body.appendChild(h('div', { class: 'row center' },
            h('button', { type: 'button', class: 'btn primary', id: 'code-get', onclick: create }, 'Get my code'),
            h('button', { type: 'button', class: 'btn ghost', id: 'code-cancel', onclick: function () { dlg.close(); } }, 'Not now')));
        }
      } else if (st.mode === 'show') {
        body.appendChild(h('h2', { id: 'dlg-title' }, 'Your private code'));
        body.appendChild(h('div', { class: 'sync-code', id: 'code-shown', 'aria-label': 'Your code ' + st.code }, st.code));
        body.appendChild(h('div', { class: 'row center' }, h('button', { type: 'button', class: 'btn', id: 'code-copy', onclick: function () { copyText(st.code); } }, 'Copy code')));
        body.appendChild(h('p', { class: 'note' }, 'Save this code now (Notes, a message to yourself). It is the only way to bring your progress back on another device, and anyone with it can see your progress, so keep it private. You can find it again in Settings on this device.'));
        body.appendChild(h('div', { class: 'row center' }, h('button', { type: 'button', class: 'btn primary', id: 'code-saved', onclick: function () { done(); } }, 'I\u2019ve saved it')));
      } else {
        body.appendChild(h('h2', { id: 'dlg-title' }, 'Continue with your code'));
        var input = h('input', { type: 'text', class: 'typed code-input', id: 'code-input', 'aria-label': 'Your private code', placeholder: 'ABCD-EFGH-JKMN-PQRS', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', enterkeyhint: 'go' });
        var msg = h('p', { class: 'muted', id: 'code-msg', 'aria-live': 'polite' }, st.msg);
        body.appendChild(h('p', null, 'Enter the code you saved to bring your progress back.'));
        body.appendChild(h('form', { class: 'type-form', onsubmit: function (e) {
          e.preventDefault(); msg.textContent = 'Connecting\u2026';
          GL.sync.connect(input.value).then(function (r) { GL.ui.updateHud(); GL.ui.toast(r.changed ? 'Progress restored' : 'Connected'); revealCode = false; done(); },
            function (err) { msg.textContent = err.message; });
        } }, input, h('button', { type: 'submit', class: 'btn primary', id: 'code-connect' }, 'Continue')));
        body.appendChild(msg);
        body.appendChild(h('p', null, h('button', { type: 'button', class: 'btn small ghost', id: 'code-cancel', onclick: function () { dlg.close(); } }, 'Cancel')));
      }
      dlg.appendChild(body);
      dlg.setAttribute('aria-labelledby', 'dlg-title');
    }
    paint();
    if (dlg.showModal) { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
    var first = dlg.querySelector('input') || dlg.querySelector('.btn.primary'); if (first) first.focus();
  }

  function ago(ts) {
    if (!ts) return 'never';
    var s = Math.round((Date.now() - ts) / 1000);
    if (s < 20) return 'just now'; if (s < 3600) return Math.round(s / 60) + ' min ago';
    if (s < 86400) return Math.round(s / 3600) + ' h ago'; return Math.round(s / 86400) + ' days ago';
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { GL.ui.toast('Code copied'); }, function () { GL.ui.toast('Select the code and copy it'); });
    else GL.ui.toast('Select the code and copy it');
  }
  function confirmDeleteCloud() {
    var dlg = document.getElementById('dlg');
    dlg.innerHTML = '';
    dlg.appendChild(h('div', { class: 'dlg-body' },
      h('h2', { id: 'dlg-title' }, 'Delete the cloud copy?'),
      h('p', null, 'Your progress on this device stays. Other devices using this code will no longer be able to sync.'),
      h('div', { class: 'row center' },
        h('button', { type: 'button', class: 'btn primary', id: 'cancel-delete', onclick: function () { dlg.close(); } }, 'Keep it'),
        h('button', { type: 'button', class: 'btn danger', id: 'confirm-delete', onclick: function () {
          GL.sync.deleteCloud().then(function () { dlg.close(); GL.ui.toast('Cloud copy deleted'); revealCode = false; if (syncPaint) syncPaint(); }, function () { dlg.close(); GL.ui.toast('Could not reach the cloud. Try again.'); });
        } }, 'Delete cloud copy'))));
    dlg.setAttribute('aria-labelledby', 'dlg-title');
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    document.getElementById('cancel-delete').focus();
  }
  function syncCard() {
    if (!GL.sync || !GL.sync.configured()) return null;
    var card = h('section', { class: 'card sync-card' });
    function paint() {
      card.innerHTML = '';
      card.appendChild(h('h2', null, 'Sync across devices'));
      if (!GL.sync.available()) { card.appendChild(h('p', null, 'Sync needs a secure (https) page. Open the published site to use it.')); return; }
      if (GL.sync.linked()) {
        var code = GL.sync.code(), shown = revealCode ? code : code.replace(/[A-Z0-9]/g, '\u2022');
        var st = { idle: '', syncing: 'Syncing\u2026', synced: 'Synced ' + ago(GL.sync.last()), offline: 'Offline. It will sync when you are back online.', error: 'Could not reach the cloud. Your progress is safe on this device and it will retry.' }[GL.sync.status()] || '';
        card.appendChild(h('p', null, 'Your progress is saved to the cloud under this code. Enter it on another device to pick up where you left off.'));
        card.appendChild(h('div', { class: 'sync-code', id: 'sync-code', 'aria-label': revealCode ? 'Your sync code ' + code : 'Sync code hidden' }, shown));
        card.appendChild(h('div', { class: 'row' },
          h('button', { type: 'button', class: 'btn small', id: 'sync-reveal', onclick: function () { revealCode = !revealCode; paint(); } }, revealCode ? 'Hide code' : 'Show code'),
          h('button', { type: 'button', class: 'btn small', id: 'sync-copy', onclick: function () { copyText(code); } }, 'Copy code'),
          h('button', { type: 'button', class: 'btn small ghost', id: 'sync-now', onclick: function () { GL.sync.now().then(paint); } }, 'Sync now')));
        card.appendChild(h('p', { class: 'muted', id: 'sync-status' }, st));
        card.appendChild(h('p', { class: 'note' }, 'Anyone with this code can see and change your progress, so keep it private. There are no accounts: if you lose the code, you lose the cloud copy (your progress on this device stays).'));
        card.appendChild(h('div', { class: 'row' },
          h('button', { type: 'button', class: 'btn small', id: 'sync-stop', onclick: function () { GL.sync.unlink(); revealCode = false; paint(); render(); } }, 'Stop syncing on this device'),
          h('button', { type: 'button', class: 'btn small danger', id: 'sync-delete', onclick: confirmDeleteCloud }, 'Delete cloud copy')));
      } else {
        card.appendChild(h('p', null, 'Save your progress to the cloud with a private code, then enter that code on another device to continue where you left off. No account or email needed.'));
        card.appendChild(h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn primary', id: 'sync-on', onclick: function () {
          GL.sync.enable().then(function () { revealCode = true; GL.ui.toast('Sync is on'); paint(); render(); }, function () { GL.ui.toast('Could not turn on sync. Check your connection.'); });
        } }, 'Turn on sync')));
        var input = h('input', { type: 'text', class: 'typed code-input', id: 'sync-input', 'aria-label': 'Sync code', placeholder: 'ABCD-EFGH-JKMN-PQRS', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', enterkeyhint: 'go' });
        var msg = h('p', { class: 'muted', id: 'sync-msg', 'aria-live': 'polite' });
        card.appendChild(h('p', { class: 'label' }, 'Already have a code?'));
        card.appendChild(h('form', { class: 'type-form', onsubmit: function (e) {
          e.preventDefault(); msg.textContent = 'Connecting\u2026';
          GL.sync.connect(input.value).then(function (r) { GL.ui.updateHud(); GL.ui.toast(r.changed ? 'Progress combined' : 'Connected'); revealCode = false; render(); }, function (err) { msg.textContent = err.message; });
        } }, input, h('button', { type: 'submit', class: 'btn', id: 'sync-connect' }, 'Connect')));
        card.appendChild(msg);
      }
    }
    syncPaint = function () { if (document.body.contains(card)) paint(); };
    paint();
    return card;
  }

  /* ---------- Settings ---------- */
  function nameCard() {
    var input = h('input', { type: 'text', class: 'typed name-input', id: 'settings-name', maxlength: '24', autocomplete: 'nickname', autocapitalize: 'words', spellcheck: 'false', 'aria-label': 'Your name', placeholder: 'Your first name or a nickname', value: store.name(), enterkeyhint: 'done' });
    return h('section', { class: 'card' }, h('h2', null, 'Your name'),
      h('p', null, 'Shown in the corner and in your greeting. It is saved with your progress, and with the cloud copy if you use a code. A nickname is fine, or leave it empty.'),
      h('form', { class: 'type-form', onsubmit: function (e) {
        e.preventDefault(); var n = store.setName(input.value); input.value = n; GL.ui.updateHud(); GL.ui.toast(n ? 'Saved, ' + n : 'Name removed');
      } }, input, h('button', { type: 'submit', class: 'btn primary', id: 'settings-name-save' }, 'Save')));
  }
  function settings() {
    var st = store.state();
    function radio(val, label, desc) {
      return h('label', { class: 'choice' }, h('input', { type: 'radio', name: 'hints', value: val, checked: st.settings.hints === val, onchange: function () { st.settings.hints = val; store.save(); GL.ui.toast('Saved'); } }), h('span', null, h('b', null, label), ' — ', desc));
    }
    function fxRadio(val, label, desc) {
      return h('label', { class: 'choice' }, h('input', { type: 'radio', name: 'effects', value: val, checked: (st.settings.effects || 'system') === val, onchange: function () { st.settings.effects = val; store.save(); GL.ui.applyFx(); GL.ui.toast('Saved'); if (val === 'on') GL.ui.burst(innerWidth / 2, innerHeight / 2, 24); } }), h('span', null, h('b', null, label), ' \u2014 ', desc));
    }
    var voiceNote = h('p', { class: 'muted', id: 'voice-note' });
    function updVoice() { voiceNote.textContent = GL.speech.available() ? 'A Gujarati voice was found on this device.' : 'No Gujarati voice found on this device, so audio buttons stay hidden. Voices vary by device and browser.'; }
    updVoice(); GL.speech.onChange(updVoice);

    var standalone = window.navigator.standalone === true || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    var backup = h('textarea', { class: 'backup', id: 'backup-box', readonly: true, 'aria-label': 'Backup code', spellcheck: 'false' });
    var restore = h('textarea', { class: 'backup', id: 'restore-box', 'aria-label': 'Paste a backup code here', placeholder: 'Paste a backup code here', spellcheck: 'false' });
    return h('div', null,
      h('h1', null, 'Settings'),
      h('div', { class: 'settings-grid' },
        nameCard(),
        syncCard(),
        h('section', { class: 'card' }, h('h2', null, 'Transliteration hints'),
          h('p', null, 'As you improve, hide the English-letter hints. Quiz answers still use sounds as choices.'),
          h('fieldset', null, h('legend', { class: 'sr' }, 'Hint display'),
            radio('show', 'Always show', 'hints appear next to letters and words'),
            radio('tap', 'Tap to reveal', 'a small button shows each hint when you want it'),
            radio('hide', 'Hide', 'read with no hints'))),
        h('section', { class: 'card' }, h('h2', null, 'Effects'),
          h('p', null, 'Drifting color, a turning ring of letters, sparkles and soft ripples.'),
          h('fieldset', null, h('legend', { class: 'sr' }, 'Effects'),
            fxRadio('system', 'Follow my device', 'calmer if your device is set to reduce motion'),
            fxRadio('on', 'Always on', 'show them even if your device reduces motion'),
            fxRadio('off', 'Off', 'a quiet, still screen'))),
        h('section', { class: 'card' }, h('h2', null, 'Audio'),
          h('label', { class: 'choice' }, h('input', { type: 'checkbox', checked: st.settings.speech, onchange: function (e) { st.settings.speech = e.target.checked; store.save(); } }), h('span', null, 'Offer “Hear it” buttons when a Gujarati voice is available')),
          voiceNote),
        standalone ? null : h('section', { class: 'card' }, h('h2', null, 'Install on iPad or iPhone'),
          h('p', null, 'In Safari, tap the Share button, then “Add to Home Screen”. It opens full-screen like an app, works offline, and Safari is much less likely to clear your progress.')),
        h('section', { class: 'card' }, h('h2', null, 'Back up your progress'),
          h('p', null, 'Progress lives in this browser only. Copy the code below somewhere safe (Notes, email to yourself) and paste it back here on another device or after clearing data.'),
          h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn small', id: 'make-backup', onclick: function () {
            backup.value = store.exportCode();
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(backup.value).then(function () { GL.ui.toast('Backup code copied'); }, function () { backup.select(); });
            else backup.select();
          } }, 'Create backup code')),
          backup,
          h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn small', id: 'do-restore', onclick: function () {
            if (store.importCode(restore.value)) { GL.ui.updateHud(); GL.ui.toast('Progress restored'); location.hash = '#/'; render(); }
            else GL.ui.toast('That code did not work');
          } }, 'Restore from code')),
          restore),
        h('section', { class: 'card' }, h('h2', null, 'Start over'),
          h('p', null, store.isPersistent() ? 'Clears points, lessons and letter practice from this browser.' : 'This browser is blocking storage, so progress will be lost when you close the page.'),
          h('div', { class: 'row' }, link('#/lessons', 'btn', 'Replay lessons'), h('button', { type: 'button', class: 'btn danger', id: 'reset-btn', onclick: confirmReset }, 'Reset all progress')))));
  }
  function confirmReset() {
    var dlg = document.getElementById('dlg');
    dlg.innerHTML = '';
    dlg.appendChild(h('div', { class: 'dlg-body' },
      h('h2', { id: 'dlg-title' }, 'Start over from the beginning?'),
      h('p', null, 'This clears your points, lessons and letter practice from this browser. It cannot be undone.' + (GL.sync && GL.sync.linked() ? ' This device will also stop syncing. The cloud copy is kept; delete it in Sync settings if you want it gone.' : '')),
      h('div', { class: 'row center' },
        h('button', { type: 'button', class: 'btn primary', id: 'cancel-reset', onclick: function () { dlg.close(); } }, 'Keep my progress'),
        h('button', { type: 'button', class: 'btn danger', id: 'confirm-reset', onclick: function () { if (GL.sync) GL.sync.unlink(); store.reset(); dlg.close(); GL.ui.updateHud(); GL.ui.toast('Fresh start'); location.hash = '#/'; render(); } }, 'Yes, reset'))));
    dlg.setAttribute('aria-labelledby', 'dlg-title');
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    document.getElementById('cancel-reset').focus();
  }

  function notFound() { return h('div', { class: 'card' }, h('h1', null, 'That page wandered off'), link('#/', 'btn primary', 'Back home')); }

  /* ---------- Router ---------- */
  var titles = { '': 'Home', summary: 'Summary', today: 'Today', lessons: 'Lessons', lesson: 'Lesson', practice: 'Practice', play: 'Game', flash: 'Flashcards', write: 'Writing', alphabet: 'Alphabet', settings: 'Settings' };
  function render() {
    GL.ui.runCleanups();
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    var route = parts[0] || '', arg = decodeURIComponent(parts.slice(1).join('/') || '');
    main.innerHTML = '';
    var node;
    try {
      if (route === '' || route === 'start') { route = ''; node = landing(); }
      else if (route === 'summary') node = summary();
      else if (route === 'today') node = today();
      else if (route === 'lessons') node = lessons();
      else if (route === 'lesson') node = lesson(parseInt(arg, 10));
      else if (route === 'practice') node = practice();
      else if (route === 'play') node = play(arg || 'quick');
      else if (route === 'flash') node = flash();
      else if (route === 'alphabet') node = alphabet();
      else if (route === 'settings') node = settings();
      else if (route === 'write') { node = h('div'); GL.writing.view(node, arg); }
      else node = notFound();
    } catch (e) {
      console.error(e);
      node = h('div', { class: 'card' }, h('h1', null, 'Something went wrong'), h('p', null, 'Try going home. Your progress is safe.'), link('#/', 'btn primary', 'Home'));
    }
    main.appendChild(node);
    if (celebrateNext && (route === '' || route === 'summary')) { celebrateNext = false; celebrateSoon(function () { var r = document.querySelector('.hero-panel, .menu'); var b = r ? r.getBoundingClientRect() : { left: 0, top: 0, width: innerWidth, height: 300 }; return [b.left + b.width / 2, b.top + Math.min(b.height / 2, 220)]; }); }
    document.title = (titles[route] || 'Play') + ' · Read and Write Gujarati';
    Array.prototype.forEach.call(document.querySelectorAll('nav a[data-route]'), function (a) {
      var r = a.getAttribute('data-route'), on = r === route || (route === 'today' && r === '') || ((route === 'play' || route === 'flash') && r === 'practice') || (route === 'lesson' && r === 'lessons');
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    var foot = document.getElementById('foot');
    if (foot) foot.innerHTML = (GL.sync && GL.sync.linked()) ? 'Progress is saved on this device and synced with your code. <a href="#/settings">Sync settings</a>' : 'Progress is saved only in this browser. <a href="#/settings">Back it up' + ((GL.sync && GL.sync.configured()) ? ' or turn on sync' : '') + '</a> before clearing site data.';
    GL.ui.updateHud();
    window.scrollTo(0, 0);
    if (route !== 'write') main.focus({ preventScroll: true });
  }

  /* Full-screen toggle in the sidebar. Shown only where the browser allows it (iPad Safari, desktop browsers) and
     not when the app is already running full-screen as an installed app. */
  function setupFullscreen() {
    var btn = document.getElementById('fs-btn'); if (!btn) return;
    var root = document.documentElement;
    var request = root.requestFullscreen || root.webkitRequestFullscreen;
    var exit = document.exitFullscreen || document.webkitExitFullscreen;
    var installed = window.navigator.standalone === true || (window.matchMedia && window.matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches);
    if (!request || !exit || installed) return;
    function isOn() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
    function paint() {
      var on = isOn();
      btn.setAttribute('aria-pressed', String(on));
      btn.querySelector('span').textContent = on ? 'Exit full screen' : 'Full screen';
      btn.querySelector('use').setAttribute('href', on ? '#i-collapse' : '#i-expand');
    }
    btn.hidden = false;
    btn.addEventListener('click', function () {
      var p = isOn() ? exit.call(document) : request.call(root);
      if (p && p.catch) p.catch(function () { GL.ui.toast('Full screen is not available here'); });
    });
    document.addEventListener('fullscreenchange', paint);
    document.addEventListener('webkitfullscreenchange', paint);
    paint();
  }

  function init() {
    main = document.getElementById('app');
    GL.ui.applyFx();
    if (window.matchMedia) { var mq = window.matchMedia('(prefers-reduced-motion: reduce)'); if (mq.addEventListener) mq.addEventListener('change', GL.ui.applyFx); }
    setupFullscreen();
    if (GL.sync) { GL.sync.onStatus(function () { if (syncPaint) syncPaint(); }); GL.sync.start(); }
    window.addEventListener('hashchange', render);
    render();
  }
  return { init: init, render: render };
})();

document.addEventListener('DOMContentLoaded', GL.app.init);
