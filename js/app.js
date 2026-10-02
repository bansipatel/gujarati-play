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

  /* ---------- Home ---------- */
  function home() {
    var s = stats(), lv = store.level(), st = store.state();
    var started = s.lessons > 0, next = store.nextLesson();
    var last = st.days.length ? st.days[st.days.length - 1] : null;
    var welcome = (started && last && last !== today_()) ? h('p', { class: 'muted' }, 'Welcome back. Everything you learned is still here.') : null;

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

    // Letter map: every letter in lesson order, coloured by how well you know it.
    var order = []; GL.lessons.forEach(function (l) { order = order.concat(l.items); });
    var taughtSet = {}; s.taught.forEach(function (id) { taughtSet[id] = 1; });
    var map = h('div', { class: 'lettermap', role: 'group', 'aria-label': 'All letters' }, order.map(function (id) {
      var it = byId(id), t = !!taughtSet[id], sx = store.stat(id), cls = 'lm';
      var label = 'not learned yet';
      if (t) { cls += ' taught'; label = 'learned'; if (sx.s >= 4) { cls += ' strong'; label = 'strong'; } else if (sx.w > 0 && sx.s <= 1) { cls += ' weak'; label = 'needs review'; } else if (sx.s >= 2) { cls += ' ok'; label = 'getting there'; } }
      return h('button', { type: 'button', class: cls, lang: 'gu', 'aria-label': GL.ui.glyphOf(it) + ', ' + it.roman + ', ' + label, onclick: function () { detail(it); } }, GL.ui.glyphOf(it));
    }));

    return h('div', { class: 'home' },
      h('div', { class: 'home-top' },
        h('section', { class: 'hero-panel' },
          h('div', { class: 'hero-glyphs', 'aria-hidden': 'true' }, h('span', { class: 'g1' }, 'ગ'), h('span', { class: 'g2' }, 'ક'), h('span', { class: 'g3' }, 'મ')),
          h('p', { class: 'label' }, 'Gujarati, on paper'),
          h('h1', null, 'Read what you already say.'),
          h('p', null, 'You speak Gujarati. This teaches you to see it written, a few minutes at a time, starting from words you already know.'),
          h('div', { class: 'row' }, link(started ? '#/today' : '#/lesson/1', 'btn primary huge', 'Start playing'), link('#/alphabet', 'btn ghost', 'Browse the alphabet'))),
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
    if (wl) rows.push({ t: 'Write a letter', d: 'Optional. Practise ' + GL.ui.glyphOf(byId(wl)) + ' on the drawing pad.', href: '#/write/' + encodeURIComponent(wl), b: 'Open pad' });
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
          h('div', { class: 'dsec' }, link('#/write/' + encodeURIComponent(it.id), 'btn small', [GL.ui.icon('pen', 'sm'), 'Practise writing it']))));
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
          if (first) box.appendChild(h('div', { class: 'celebrate' }, GL.ui.confetti(30), h('div', { class: 't' }, 'Lesson ' + n + ' complete')));
          box.appendChild(GL.games.resultCard(summary, [
            h('p', { class: 'big-msg' }, first ? (nextL ? 'Lesson ' + nextL.id + ' is unlocked.' : 'You have finished every lesson.') : 'Replay done. Nice refresher.'),
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

  /* ---------- Practice hub: a phone per game, grouped by what it trains ---------- */
  var GAMES = [
    { g: 'Letters and sounds', id: 'quick', name: 'Quick 5', tag: 'Warm-up', shot: 'ક', mock: 'g2', href: '#/play/quick', need: 'letters', text: 'About ten mixed questions, weighted toward letters due for review.' },
    { g: 'Letters and sounds', id: 'match', name: 'Letter Match', tag: 'Letters', shot: 'ખ', mock: 'g2', href: '#/play/match', need: 'letters', text: 'Match letters to sounds, and sounds to letters.' },
    { g: 'Letters and sounds', id: 'recall', name: 'Recall', tag: 'Memory', shot: 'ગ', mock: 'type', href: '#/play/recall', need: 'letters', text: 'See a letter and type its sound from memory.' },
    { g: 'Letters and sounds', id: 'flash', name: 'Flashcards', tag: 'Cards', shot: 'ઘ', mock: 'card', href: '#/flash', need: 'letters', text: 'Flip, think, rate yourself. Keys: Space, ← and →.' },
    { g: 'Words and spelling', id: 'decode', name: 'Say It', tag: 'Reading', shot: 'ઘર', mock: 'rows', href: '#/play/decode', need: 'words', text: 'Read a Gujarati word and pick how you say it.' },
    { g: 'Words and spelling', id: 'spell', name: 'Spelling Check', tag: 'Spelling', shot: 'પાણી', mock: 'rows', href: '#/play/spell', need: 'spell', text: 'You know the sound. Pick the right spelling: ઇ/ઈ, ન/ણ, સ/શ/ષ.' },
    { g: 'Words and spelling', id: 'find', name: 'Find It', tag: 'Letters in words', shot: 'કમળ', mock: 'tiles', href: '#/play/find', need: 'find', text: 'Tap the part of a real word that holds a letter.' },
    { g: 'Words and spelling', id: 'words', name: 'Word Reader', tag: 'Meaning', shot: 'ચા', mock: 'g2', href: '#/play/words', need: 'words', text: 'Read real words and pick the meaning.' },
    { g: 'Words and spelling', id: 'build', name: 'Word Builder', tag: 'Building', shot: 'ટોપી', mock: 'tiles', href: '#/play/build', need: 'words', text: 'Build words from letter and sign tiles.' },
    { g: 'Writing', id: 'write', name: 'Writing Pad', tag: 'Writing', shot: 'ક', mock: 'pad', href: '#/write', need: 'free', text: 'Copy big letters. Works with Apple Pencil.' }
  ];
  function mockOf(g, ok) {
    var opts = { g2: h('div', { class: 'm-opts g2' }, h('i'), h('i', { class: 'on' }), h('i'), h('i')), rows: h('div', { class: 'm-opts' }, h('i'), h('i', { class: 'on' }), h('i')),
      tiles: h('div', { class: 'm-opts g2' }, h('i'), h('i'), h('i', { class: 'on' }), h('i')), type: h('div', { class: 'm-opts' }, h('i', { class: 'on' })), card: null, pad: h('div', { class: 'm-pad' }) }[g.mock];
    return h('div', { class: 'mock' }, h('div', { class: 'm-bar' }), h('div', { class: 'm-glyph gu', lang: 'gu' }, ok ? g.shot : ''), opts);
  }

  function practice() {
    var s = stats(), pool = s.taught;
    var avail = {
      letters: s.learned >= 4, words: s.words >= 4, free: true,
      spell: s.words >= 4 && GL.games.build('spell', pool, { count: 3 }).length >= 3,
      find: s.words >= 4 && GL.games.build('find', pool, { count: 3 }).length >= 3
    };
    var why = { letters: 'Finish lesson 1 to unlock.', words: 'Finish lessons 1 and 2 to unlock.', spell: 'Unlocks once you know a few look-alike letters, like ન and ણ.', find: 'Finish lesson 2 to unlock.' };
    var groups = [];
    GAMES.forEach(function (g) { if (groups.indexOf(g.g) === -1) groups.push(g.g); });
    return h('div', null,
      h('h1', null, 'Practice'),
      h('p', { class: 'lead' }, 'Games only use letters and words you have already learned.'),
      strugglingBlock(),
      groups.map(function (gn) {
        return h('section', null, h('div', { class: 'group-head' }, h('h2', null, gn)),
          h('div', { class: 'phone-grid' }, GAMES.filter(function (g) { return g.g === gn; }).map(function (g) {
            var ok = avail[g.need];
            var phone = h('div', { class: 'iphone' + (ok ? '' : ' locked') }, h('div', { class: 'screen' }, mockOf(g, ok)));
            return h('div', { class: 'phone-stack' + (ok ? '' : ' locked'), role: 'group', 'aria-label': g.name },
              ok ? h('a', { href: g.href, class: 'phone-link', 'aria-label': 'Play ' + g.name }, phone) : phone,
              pill(g.name + ' - ' + g.tag, ok ? g.href : null),
              h('p', { class: 'phone-text' }, ok ? g.text : why[g.need]));
          })));
      }));
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
      h('p', { class: 'lead' }, 'Tap any letter for details. A tick means you have learned it; dashed tiles are still ahead.'),
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

  /* ---------- Settings ---------- */
  function settings() {
    var st = store.state();
    function radio(val, label, desc) {
      return h('label', { class: 'choice' }, h('input', { type: 'radio', name: 'hints', value: val, checked: st.settings.hints === val, onchange: function () { st.settings.hints = val; store.save(); GL.ui.toast('Saved'); } }), h('span', null, h('b', null, label), ' — ', desc));
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
        h('section', { class: 'card' }, h('h2', null, 'Transliteration hints'),
          h('p', null, 'As you improve, hide the English-letter hints. Quiz answers still use sounds as choices.'),
          h('fieldset', null, h('legend', { class: 'sr' }, 'Hint display'),
            radio('show', 'Always show', 'hints appear next to letters and words'),
            radio('tap', 'Tap to reveal', 'a small button shows each hint when you want it'),
            radio('hide', 'Hide', 'read with no hints'))),
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
      h('p', null, 'This clears your points, lessons and letter practice from this browser. It cannot be undone.'),
      h('div', { class: 'row center' },
        h('button', { type: 'button', class: 'btn primary', id: 'cancel-reset', onclick: function () { dlg.close(); } }, 'Keep my progress'),
        h('button', { type: 'button', class: 'btn danger', id: 'confirm-reset', onclick: function () { store.reset(); dlg.close(); GL.ui.updateHud(); GL.ui.toast('Fresh start'); location.hash = '#/'; render(); } }, 'Yes, reset'))));
    dlg.setAttribute('aria-labelledby', 'dlg-title');
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    document.getElementById('cancel-reset').focus();
  }

  function notFound() { return h('div', { class: 'card' }, h('h1', null, 'That page wandered off'), link('#/', 'btn primary', 'Back home')); }

  /* ---------- Router ---------- */
  var titles = { '': 'Home', today: 'Today', lessons: 'Lessons', lesson: 'Lesson', practice: 'Practice', play: 'Game', flash: 'Flashcards', write: 'Writing', alphabet: 'Alphabet', settings: 'Settings' };
  function render() {
    GL.ui.runCleanups();
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    var route = parts[0] || '', arg = decodeURIComponent(parts.slice(1).join('/') || '');
    main.innerHTML = '';
    var node;
    try {
      if (route === '') node = home();
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
    document.title = (titles[route] || 'Play') + ' · ગુજરાતી Play';
    Array.prototype.forEach.call(document.querySelectorAll('nav a[data-route]'), function (a) {
      var r = a.getAttribute('data-route'), on = r === route || (route === 'today' && r === '') || ((route === 'play' || route === 'flash') && r === 'practice') || (route === 'lesson' && r === 'lessons');
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    GL.ui.updateHud();
    window.scrollTo(0, 0);
    if (route !== 'write') main.focus({ preventScroll: true });
  }

  function init() {
    main = document.getElementById('app');
    window.addEventListener('hashchange', render);
    render();
  }
  return { init: init, render: render };
})();

document.addEventListener('DOMContentLoaded', GL.app.init);
