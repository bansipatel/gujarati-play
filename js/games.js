/* Question builders and the shared session runner for every game. */
window.GL = window.GL || {};

GL.games = (function () {
  var h = GL.ui.h, gu = GL.ui.gu;
  var byId = function (id) { return GL.itemById[id]; };
  var group = function (it) { return it.kind === 'conjunct' ? 'consonant' : it.kind; };
  var glyphOf = GL.ui.glyphOf;

  /* Up to n distractor items: same kind first, unique by key, never matching the answer. */
  function distractors(item, pool, n, keyOf) {
    var others = pool.filter(function (id) { return id !== item.id; }).map(byId);
    var same = GL.shuffle(others.filter(function (o) { return group(o) === group(item); }));
    var rest = GL.shuffle(others.filter(function (o) { return group(o) !== group(item); }));
    var seen = {}; seen[keyOf(item)] = 1;
    var out = [];
    same.concat(rest).forEach(function (o) {
      var k = keyOf(o);
      if (out.length < n && !seen[k]) { seen[k] = 1; out.push(o); }
    });
    return out;
  }
  var lowerRoman = function (it) { return it.roman.toLowerCase(); };

  function exampleLine(item) {
    var w = item.word;
    return h('span', null, h('b', null, glyphOf(item) + ' = ' + item.roman), ' · as in ',
      GL.ui.highlighted(w.gu, w.hl), ' (', w.roman, ' — ', w.en, ')');
  }

  /* ---------- Question builders ---------- */
  function soundQ(id, pool) {
    var it = byId(id);
    var opts = [it].concat(distractors(it, pool, 3, lowerRoman));
    return {
      kind: 'choice', track: { item: id }, cls: 'sound',
      instruction: it.kind === 'sign' ? 'What does this say? (the sign is shown on ક)' : 'What sound does this make?',
      prompt: h('div', { class: 'bigglyph' }, gu(glyphOf(it))),
      options: GL.shuffle(opts).map(function (o) { return { node: h('span', { class: 'roman-opt' }, o.roman), correct: o === it, key: o.roman }; }),
      explain: exampleLine(it)
    };
  }
  function glyphQ(id, pool) {
    var it = byId(id);
    var opts = [it].concat(distractors(it, pool, 3, lowerRoman));
    return {
      kind: 'choice', track: { item: id }, cls: 'glyph',
      instruction: 'Which one says “' + it.roman + '”?',
      prompt: h('p', { class: 'cue' }, 'Hear it in “', it.word.roman, '” (', it.word.en, ')'),
      options: GL.shuffle(opts).map(function (o) {
        var ok = lowerRoman(o) === lowerRoman(it);
        return { node: gu(glyphOf(o), 'glyph-opt'), correct: ok, key: o.id,
          note: ok ? null : 'That one says “' + o.roman + '”.' + (GL.pairNote(it.id, o.id) ? ' ' + GL.pairNote(it.id, o.id) : '') };
      }),
      explain: exampleLine(it)
    };
  }
  function typeQ(id) {
    var it = byId(id), ans = [lowerRoman(it)];
    if (it.kind === 'consonant' || it.kind === 'conjunct') ans.push(GL.baseOf(it).toLowerCase());
    if (id === 'ફ') ans.push('fa', 'f');
    return {
      kind: 'type', track: { item: id }, answers: ans, shown: it.roman,
      instruction: 'Type the sound you hear in your head (like “ka”). Capitals are optional.',
      prompt: h('div', { class: 'bigglyph' }, gu(glyphOf(it))),
      explain: exampleLine(it)
    };
  }
  /* A consonant + vowel sign, e.g. કી → kee. Only uses taught consonants and signs. */
  function syllableQ(pool) {
    var cons = pool.filter(function (id) { return byId(id).kind === 'consonant'; });
    var signs = pool.filter(function (id) { var i = byId(id); return i.kind === 'sign' && i.vowel; });
    if (!cons.length || signs.length < 2) return null;
    var c = byId(cons[Math.floor(Math.random() * cons.length)]);
    var s = byId(GL.pickItems(signs, 1)[0]);
    var base = GL.baseOf(c);
    var correct = base + s.vowel;
    var seen = {}; seen[correct] = 1; var wrong = [];
    GL.shuffle(signs.map(byId)).forEach(function (o) {
      var r = base + o.vowel; if (wrong.length < 2 && !seen[r]) { seen[r] = 1; wrong.push(r); }
    });
    if (!seen[c.roman]) { seen[c.roman] = 1; wrong.push(c.roman); }
    var opts = [correct].concat(wrong);
    return {
      kind: 'choice', track: { item: s.id }, cls: 'sound',
      instruction: 'Read this syllable: consonant + vowel sign',
      prompt: h('div', { class: 'bigglyph' }, gu(c.id + s.id)),
      options: GL.shuffle(opts).map(function (r) { return { node: h('span', { class: 'roman-opt' }, r), correct: r === correct, key: r }; }),
      explain: h('span', null, h('b', null, c.id + s.id + ' = ' + correct), ' — ', c.id, ' (', c.roman, ') with the “', s.vowel, '” sign replaces the built-in a.')
    };
  }
  function wordQ(word, words) {
    var seen = {}; seen[word.en] = 1; var wrong = [];
    GL.shuffle(words).forEach(function (w) { if (wrong.length < 3 && !seen[w.en]) { seen[w.en] = 1; wrong.push(w); } });
    var opts = [word].concat(wrong);
    return {
      kind: 'choice', track: { word: word.gu }, cls: 'word',
      instruction: 'Read the word. What does it mean?',
      prompt: h('div', { class: 'bigword' }, gu(word.gu)),
      options: GL.shuffle(opts).map(function (w) { return { node: h('span', { class: 'en-opt' }, w.en), correct: w === word, key: w.gu }; }),
      explain: h('div', null, h('span', null, GL.ui.gu(word.gu), ' = ', h('b', null, word.roman), ' — ', word.en), GL.ui.breakdownNode(word)),
      speak: word.gu
    };
  }

  /* “Say it”: read a Gujarati word and pick how it sounds — the way you already know it. */
  function decodeQ(word, words) {
    var n = GL.clusters(word.gu).length, seen = {}, wrong = [];
    seen[word.roman.toLowerCase()] = 1;
    GL.shuffle(words).sort(function (a, b) { return Math.abs(GL.clusters(a.gu).length - n) - Math.abs(GL.clusters(b.gu).length - n); })
      .forEach(function (w) { var k = w.roman.toLowerCase(); if (wrong.length < 3 && !seen[k]) { seen[k] = 1; wrong.push(w); } });
    return {
      kind: 'choice', track: { word: word.gu }, cls: 'word',
      instruction: 'Read the word. How do you say it?',
      prompt: h('div', { class: 'bigword' }, gu(word.gu)),
      options: GL.shuffle([word].concat(wrong)).map(function (w) {
        return { node: h('span', { class: 'roman-opt' }, w.roman), correct: w === word, key: w.gu, note: w === word ? null : 'That one is ' + w.roman + ' (' + w.en + ').' };
      }),
      explain: h('div', null, h('span', null, gu(word.gu), ' = ', h('b', null, word.roman), ' — ', word.en), GL.ui.breakdownNode(word)),
      speak: word.gu
    };
  }

  /* A vowel sign on its own needs a dotted circle to be readable. */
  function shown(ch) { var it = byId(ch); return it && it.kind === 'sign' ? '◌' + ch : ch; }

  /* “Spelling check”: you know how it sounds — which spelling is right? Wrong options are one-letter look/sound-alikes. */
  function spellQ(word, pool) {
    var set = {}; pool.forEach(function (id) { set[id] = 1; });
    var vars = GL.spellingVariants(word, set);
    if (!vars.length) return null;
    var picks = GL.shuffle(vars).slice(0, 3);
    var all = [{ gu: word.gu, ok: true }].concat(picks.map(function (v) { return { gu: v.gu, ok: false, note: shown(v.a) + ' vs ' + shown(v.b) + ': ' + v.note }; }));
    return {
      kind: 'choice', track: { word: word.gu }, cls: 'spell', layout: 'col',
      instruction: 'You know how it sounds. Which spelling is right?',
      prompt: h('div', { class: 'spell-prompt' }, h('div', { class: 'roman-big' }, word.roman), h('p', { class: 'cue' }, '“' + word.en + '”')),
      options: GL.shuffle(all).map(function (o) { return { node: gu(o.gu, 'word-opt'), correct: o.ok, key: o.gu, note: o.note }; }),
      explain: h('div', null, h('span', null, gu(word.gu), ' = ', h('b', null, word.roman), ' — ', word.en), GL.ui.breakdownNode(word)),
      speak: word.gu
    };
  }

  /* “Find it”: a letter inside a real word — tap the part that holds it. */
  function findQ(id, pool, words) {
    var it = byId(id);
    if (['consonant', 'vowel', 'conjunct'].indexOf(it.kind) === -1) return null;
    var cands = words.filter(function (w) { var c = GL.clusters(w.gu); return c.length >= 2 && c.length <= 6 && GL.requiredIds(w.gu).indexOf(id) !== -1; });
    if (!cands.length) return null;
    var w = cands[Math.floor(Math.random() * cands.length)];
    var units = GL.breakdown(w);
    return {
      kind: 'choice', track: { item: id }, cls: 'find', layout: 'row',
      instruction: 'Tap the part of the word that says “' + it.roman + '”',
      prompt: h('p', { class: 'cue' }, 'In ', h('b', null, w.roman), ' (' + w.en + ')'),
      options: units.map(function (u) {
        var hit = GL.requiredIds(u.gu).indexOf(id) !== -1;
        return { node: gu(u.gu, 'glyph-opt'), correct: hit, key: u.gu, note: hit ? null : u.gu + ' says “' + u.said + '”. Try another part.' };
      }),
      explain: h('div', null, h('span', null, GL.ui.highlighted(w.gu, it.id), ' = ', h('b', null, w.roman), ' — ', w.en), GL.ui.breakdownNode(w))
    };
  }
  function buildQ(word, pool) {
    return { kind: 'build', track: { word: word.gu }, word: word, pool: pool, instruction: 'Build the word from the tiles', explain: h('span', null, gu(word.gu), ' = ', h('b', null, word.roman), ' — ', word.en), speak: word.gu };
  }

  /* A hand-written question from an explainer lesson (see Part 2 in lessons.js). The first listed option need not be
     the right one: `ans` says which, and the options are shuffled here. */
  function conceptQ(spec) {
    var short = spec.gu && spec.opts.every(function (o) { return Array.from(o).length <= 4; });
    var opts = spec.opts.map(function (o, i) {
      var node = spec.gu ? gu(o, short ? 'glyph-opt' : 'word-opt') : h('span', { class: 'en-opt' }, o);
      return { node: node, correct: i === spec.ans, key: o, note: null };
    });
    return {
      kind: 'choice', track: {}, cls: spec.gu ? (short ? 'glyph' : 'spell') : 'word', layout: spec.gu && !short ? 'col' : null,
      instruction: spec.ask,
      prompt: spec.big ? h('div', { class: 'bigword' }, gu(spec.big)) : spec.cue ? h('div', { class: 'spell-prompt' }, h('p', { class: 'cue' }, spec.cue)) : h('div'),
      options: GL.shuffle(opts),
      explain: h('span', { html: spec.why })
    };
  }

  /* Pick words to ask about, preferring ones that use `focus` letters. */
  function pickWords(words, n, focus) {
    focus = focus || [];
    var scored = GL.shuffle(words).map(function (w) {
      var hit = GL.requiredIds(w.gu).some(function (id) { return focus.indexOf(id) !== -1; });
      var s = GL.store.state().words[w.gu];
      return { w: w, s: (hit ? 2 : 0) + (s && s.w > s.c ? 1 : 0) + Math.random() };
    }).sort(function (a, b) { return b.s - a.s; });
    return scored.slice(0, n).map(function (x) { return x.w; });
  }

  /* ---------- Question sets for each mode ---------- */
  function sg(id, pool, i) { return i % 2 ? glyphQ(id, pool) : soundQ(id, pool); }
  function compact(a) { return a.filter(Boolean); }

  function build(mode, pool, opts) {
    opts = opts || {};
    var focus = opts.focus || [], qs = [], words = GL.wordsFor(pool);
    var count = opts.count || 8;
    var ids = GL.pickItems(pool, count, { focus: focus });
    var syl = function () { return syllableQ(pool); };
    var wordMode = words.length >= 4;
    if (mode === 'match') {
      ids.forEach(function (id, i) { qs.push(i % 3 === 2 ? (syl() || soundQ(id, pool)) : sg(id, pool, i)); });
    } else if (mode === 'recall') {
      ids.forEach(function (id) { qs.push(typeQ(id)); });
    } else if (mode === 'words') {
      pickWords(words, count, focus).forEach(function (w) { qs.push(wordQ(w, words)); });
    } else if (mode === 'decode') {
      pickWords(words, count, focus).forEach(function (w) { qs.push(decodeQ(w, words)); });
    } else if (mode === 'spell') {
      pickWords(words, words.length, focus).forEach(function (w) { if (qs.length < count) { var q = spellQ(w, pool); if (q) qs.push(q); } });
    } else if (mode === 'find') {
      var fpool = pool.filter(function (id) { return ['consonant', 'vowel', 'conjunct'].indexOf(byId(id).kind) !== -1; });
      if (fpool.length) compact(GL.pickItems(fpool, count * 2, { focus: focus }).map(function (id) { return findQ(id, pool, words); })).slice(0, count).forEach(function (q) { qs.push(q); });
    } else if (mode === 'lesson') {
      // Teach, then check: your new letters first, then a shuffled mix with a little review of older material.
      var own = GL.shuffle(focus.slice()), older = pool.filter(function (id) { return focus.indexOf(id) === -1; });
      var head = own.map(function (id, i) { return sg(id, pool, i); });
      var rest = [];
      GL.shuffle(own).slice(0, 2).forEach(function (id) { var f = findQ(id, pool, words); if (f) rest.push(f); });
      rest.push(typeQ(own[Math.floor(Math.random() * own.length)]));
      var sy = syl(); if (sy && focus.some(function (id) { return byId(id).kind === 'sign'; })) rest.push(sy);
      if (wordMode) {
        var ws = pickWords(words, 3, focus);
        rest.push(decodeQ(ws[0], words));
        var sp = null; for (var k = 0; k < ws.length && !sp; k++) sp = spellQ(ws[k], pool);
        if (sp) rest.push(sp);
      }
      if (older.length) GL.pickItems(older, Math.min(2, older.length), {}).forEach(function (id, i) { rest.push(sg(id, pool, i + 1)); });
      qs = head.concat(GL.shuffle(rest));
    } else { // quick: a mixed five-minute set, weighted toward letters due for review
      GL.pickItems(pool, 5, { focus: focus }).forEach(function (id, i) { qs.push(sg(id, pool, i)); });
      GL.pickItems(pool, 1, { focus: focus }).forEach(function (id) { qs.push(typeQ(id)); });
      var s2 = syl(); if (s2) qs.push(s2);
      if (wordMode) {
        var w2 = pickWords(words, 4, focus);
        qs.push(decodeQ(w2[0], words));
        var sp2 = null; for (var j = 0; j < w2.length && !sp2; j++) sp2 = spellQ(w2[j], pool);
        if (sp2) qs.push(sp2);
        var f2 = findQ(GL.pickItems(pool, 1, { focus: focus })[0], pool, words); if (f2) qs.push(f2);
        if (words.length >= 6) qs.push(buildQ(w2[w2.length - 1], pool));
      }
      qs = GL.shuffle(qs);
    }
    return qs;
  }

  /* ---------- Session runner ---------- */
  function run(root, questions, opts) {
    opts = opts || {};
    var idx = 0, summary = { total: questions.length, firstTry: 0, points: 0, missed: [] };

    function clear() { while (root.firstChild) root.removeChild(root.firstChild); }

    function frame(body) {
      clear();
      var pct = Math.round(idx / questions.length * 100);
      root.appendChild(h('div', { class: 'session' },
        h('div', { class: 'session-top' },
          h('a', { class: 'btn small ghost', href: opts.exitHref || '#/practice' }, 'Leave'),
          h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': questions.length, 'aria-valuenow': idx, 'aria-label': 'Question progress' }, h('div', { style: 'width:' + pct + '%' })),
          h('span', { class: 'count' }, (idx + 1) + ' / ' + questions.length)),
        body));
    }

    function finish(q, firstTry, gaveUp, feedbackBox, nextWrap) {
      var pts = gaveUp ? 0 : (firstTry ? 10 : 3);
      if (q.track.item) { if (firstTry) GL.store.record(q.track.item, true); }
      if (q.track.word) GL.store.recordWord(q.track.word, firstTry);
      if (firstTry) summary.firstTry++;
      else if (q.track.item && summary.missed.indexOf(q.track.item) === -1) summary.missed.push(q.track.item);
      if (pts) { summary.points += pts; GL.ui.award(pts); }
      feedbackBox.className = 'feedback good';
      feedbackBox.innerHTML = '';
      feedbackBox.appendChild(h('p', null, h('b', null, gaveUp ? 'Here it is. It will come back soon.' : (firstTry ? GL.ui.cheer() : 'You got there.'))));
      feedbackBox.appendChild(h('p', { class: 'explain' }, q.explain));
      var rom = q.track.word ? null : null;
      var sp = q.speak ? GL.ui.speakBtn(q.speak, true) : null;
      if (sp) feedbackBox.appendChild(sp);
      var next = h('button', { type: 'button', class: 'btn primary', id: 'next-btn', onclick: advance }, idx + 1 >= questions.length ? 'See results →' : 'Next →');
      nextWrap.innerHTML = ''; nextWrap.appendChild(next);
      next.focus();
    }

    function miss(q) {
      if (!q.missed) {
        q.missed = true;
        if (q.track.item) GL.store.record(q.track.item, false);
        if (q.track.word) GL.store.recordWord(q.track.word, false);
      }
    }

    function advance() {
      idx++;
      if (idx >= questions.length) return done();
      show();
    }

    function done() {
      clear();
      GL.ui.played();
      if (opts.onFinish) opts.onFinish(summary, root);
    }

    function renderChoice(q) {
      var fb = h('div', { class: 'feedback', 'aria-live': 'polite' }), nextWrap = h('div', { class: 'next-wrap' });
      var buttons = q.options.map(function (o, i) {
        var b = h('button', { type: 'button', class: 'opt ' + (q.cls || ''), 'data-key': i + 1 },
          h('span', { class: 'num', 'aria-hidden': 'true' }, i + 1), o.node);
        b.addEventListener('click', function () {
          if (q.done) return;
          if (o.correct) {
            q.done = true; b.classList.add('good');
            buttons.forEach(function (x) { x.disabled = true; });
            finish(q, !q.missed, false, fb, nextWrap);
          } else {
            miss(q); b.classList.add('miss'); b.disabled = true;
            fb.className = 'feedback soft'; fb.textContent = GL.ui.kindly() + (o.note ? ' ' + o.note : '');
          }
        });
        return b;
      });
      var body = h('div', { class: 'qcard split' },
        h('div', { class: 'q-left' }, h('p', { class: 'instruction' }, q.instruction), q.prompt),
        h('div', { class: 'q-right' }, h('div', { class: 'options n' + buttons.length + (q.layout ? ' ' + q.layout : '') }, buttons), fb, nextWrap));
      frame(body);
      if (q.speak && GL.speech.available()) { /* offered after answering, to avoid giving the answer away */ }
      return function (key) { var b = buttons[key - 1]; if (b && !b.disabled) b.click(); };
    }

    function renderType(q) {
      var fb = h('div', { class: 'feedback', 'aria-live': 'polite' }), nextWrap = h('div', { class: 'next-wrap' });
      var input = h('input', { type: 'text', class: 'typed', autocomplete: 'off', autocapitalize: 'none', autocorrect: 'off', spellcheck: 'false', enterkeyhint: 'done', inputmode: 'text', 'aria-label': 'Your answer', placeholder: 'type here' });
      var tries = 0;
      var form = h('form', { class: 'type-form', onsubmit: function (e) {
        e.preventDefault();
        if (q.done) return;
        var v = input.value.trim().toLowerCase();
        if (!v) return;
        if (q.answers.indexOf(v) !== -1) { q.done = true; input.disabled = true; finish(q, !q.missed, false, fb, nextWrap); return; }
        miss(q); tries++;
        if (tries >= 2) { q.done = true; input.disabled = true; finish(q, false, true, fb, nextWrap); return; }
        fb.className = 'feedback soft'; fb.textContent = GL.ui.kindly() + ' It starts with “' + q.shown.charAt(0).toLowerCase() + '”.';
        input.select();
      } }, input, h('button', { type: 'submit', class: 'btn primary' }, 'Check'));
      frame(h('div', { class: 'qcard' }, h('p', { class: 'instruction' }, q.instruction), q.prompt, form, fb, nextWrap));
      input.focus();
      return null;
    }

    function renderBuild(q) {
      var target = Array.from(q.word.gu);
      var used = {};
      var extra = GL.shuffle(q.pool.filter(function (id) { var k = byId(id).kind; return (k === 'consonant' || k === 'sign' || k === 'vowel') && Array.from(id).length === 1 && target.indexOf(id) === -1; })).slice(0, 2);
      var tiles = GL.shuffle(target.concat(extra)).map(function (ch, i) { return { ch: ch, n: i }; });
      var built = [];
      var fb = h('div', { class: 'feedback', 'aria-live': 'polite' }), nextWrap = h('div', { class: 'next-wrap' });
      var out = h('div', { class: 'built', lang: 'gu', 'aria-live': 'polite', 'aria-label': 'Your word' });
      var tray = h('div', { class: 'tray' });
      var showMe;

      function label(ch) { var it = byId(ch); return it && it.kind === 'sign' ? '◌' + ch : ch; }
      function aria(ch) { var it = byId(ch); return it ? (it.kind === 'sign' ? 'vowel sign ' : '') + ch + (it.vowel ? ' ' + it.vowel : '') : ch; }

      function refresh() {
        out.textContent = built.map(function (t) { return t.ch; }).join('') || '·  ·  ·';
        out.classList.toggle('empty', !built.length);
        Array.prototype.forEach.call(tray.children, function (b) { b.disabled = !!used[b.getAttribute('data-n')] || !!q.done; });
        if (built.length === target.length && !q.done) check();
      }
      function check() {
        if (built.map(function (t) { return t.ch; }).join('') === q.word.gu) {
          q.done = true; refresh2(); finish(q, !q.missed, false, fb, nextWrap);
        } else {
          miss(q); fb.className = 'feedback soft';
          fb.textContent = GL.ui.kindly() + ' Tap Undo to change a tile.';
          showMe.hidden = false;
        }
      }
      function refresh2() { Array.prototype.forEach.call(tray.children, function (b) { b.disabled = true; }); }
      function undo() { if (q.done) return; var t = built.pop(); if (t) { delete used[t.n]; fb.textContent = ''; fb.className = 'feedback'; } refresh(); }
      tiles.forEach(function (t) {
        tray.appendChild(h('button', { type: 'button', class: 'tile gu', 'data-n': t.n, 'aria-label': aria(t.ch), onclick: function () {
          if (q.done || used[t.n] || built.length >= target.length) return;
          used[t.n] = 1; built.push(t); refresh();
        } }, label(t.ch)));
      });
      showMe = h('button', { type: 'button', class: 'btn small ghost', hidden: true, onclick: function () {
        if (q.done) return; q.done = true; built = target.map(function (c) { return { ch: c }; }); out.textContent = q.word.gu; refresh2(); finish(q, false, true, fb, nextWrap);
      } }, 'Show me');
      var body = h('div', { class: 'qcard' },
        h('p', { class: 'instruction' }, q.instruction),
        h('p', { class: 'cue big' }, 'Meaning: ', h('b', null, q.word.en)),
        GL.ui.hint('Sounds like: ' + q.word.roman, 'center'),
        out, tray,
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn small', onclick: undo }, 'Undo'),
          h('button', { type: 'button', class: 'btn small ghost', onclick: function () { if (!q.done) { built = []; used = {}; fb.textContent = ''; refresh(); } } }, 'Clear'), showMe),
        fb, nextWrap);
      frame(body); refresh();
      return function (key, ev) { if (key === 'Backspace') undo(); };
    }

    var keyHandler = null;
    function show() {
      var q = questions[idx];
      keyHandler = q.kind === 'choice' ? renderChoice(q) : q.kind === 'type' ? renderType(q) : renderBuild(q);
    }
    function onKey(e) {
      if (!keyHandler) return;
      var tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[1-9]$/.test(e.key)) keyHandler(+e.key, e);
      else if (e.key === 'Backspace') keyHandler('Backspace', e);
    }
    document.addEventListener('keydown', onKey);
    GL.ui.onCleanup(function () { document.removeEventListener('keydown', onKey); });

    if (!questions.length) return done();
    show();
  }

  /* Standard results card; `extra` nodes are added under the summary. */
  function resultCard(summary, extra, title) {
    var pct = summary.total ? summary.firstTry / summary.total : 1;
    var msg = pct >= 0.8 ? 'Strong round.' : pct >= 0.5 ? 'Good round. The ones you missed will come back.' : 'A tough one. Missed letters come back more often, so this gets easier.';
    return h('div', { class: 'qcard result' },
      h('h2', null, title || 'Round complete!'),
      h('p', { class: 'big-msg' }, msg),
      h('p', null, summary.firstTry + ' of ' + summary.total + ' right on the first try · ', h('b', null, '+' + summary.points + ' pts')),
      summary.missed.length ? h('div', { class: 'review-chips' }, h('p', null, 'We will show these a little more often:'),
        summary.missed.map(function (id) { return h('span', { class: 'chip' }, gu(glyphOf(byId(id))), ' ', GL.ui.hint(byId(id).roman)); })) : null,
      extra);
  }

  /* ---------- Flashcards ---------- */
  function flashcards(root, ids, opts) {
    opts = opts || {};
    var deck = ids, idx = 0, got = 0, flipped = false;
    var card;

    function render() {
      while (root.firstChild) root.removeChild(root.firstChild);
      if (idx >= deck.length) {
        GL.ui.played();
        GL.ui.award(5 + got, 'Deck done');
        root.appendChild(h('div', { class: 'qcard result' }, h('h2', null, 'Deck finished'),
          h('p', { class: 'big-msg' }, 'You knew ' + got + ' of ' + deck.length + '. The “not yet” ones will come back sooner.'),
          h('div', { class: 'row center' }, h('button', { type: 'button', class: 'btn primary', onclick: function () { GL.app.render(); } }, 'Another deck'), h('a', { class: 'btn', href: '#/practice' }, 'Practice menu'))));
        return;
      }
      var it = byId(deck[idx]);
      flipped = false;
      var front = h('div', { class: 'face front' }, h('div', { class: 'bigglyph' }, gu(glyphOf(it))), h('p', { class: 'muted' }, 'Say it in your head, then flip.'));
      var back = h('div', { class: 'face back' },
        h('div', { class: 'bigglyph small' }, gu(glyphOf(it))),
        h('p', { class: 'sound' }, h('b', null, it.roman)),
        h('p', { class: 'tip' }, it.tip),
        h('p', { class: 'exword' }, GL.ui.highlighted(it.word.gu, it.word.hl), ' — ', it.word.roman, ' (', it.word.en, ')'),
        GL.ui.speakBtn(it.word.gu, true));
      back.hidden = true;
      card = h('div', { class: 'flashcard', tabindex: 0, role: 'button', 'aria-label': 'Flashcard. Press Space to flip.', onclick: flip }, front, back);
      var rate = h('div', { class: 'row center rate', hidden: true },
        h('button', { type: 'button', class: 'btn', id: 'again', onclick: function () { rateIt(false); } }, 'Not yet  ←'),
        h('button', { type: 'button', class: 'btn primary', id: 'knew', onclick: function () { rateIt(true); } }, 'I knew it  →'));
      var flipBtn = h('button', { type: 'button', class: 'btn primary', id: 'flip', onclick: flip }, 'Flip card');
      function flip() {
        if (flipped) return; flipped = true; front.hidden = true; back.hidden = false; rate.hidden = false; flipBtn.hidden = true;
        card.setAttribute('aria-label', 'Flashcard answer'); rate.querySelector('#knew').focus();
      }
      card._flip = flip;
      root.appendChild(h('div', { class: 'session' },
        h('div', { class: 'session-top' }, h('a', { class: 'btn small ghost', href: '#/practice' }, 'Leave'),
          h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': deck.length, 'aria-valuenow': idx, 'aria-label': 'Card progress' }, h('div', { style: 'width:' + Math.round(idx / deck.length * 100) + '%' })),
          h('span', { class: 'count' }, (idx + 1) + ' / ' + deck.length)),
        card, h('div', { class: 'row center' }, flipBtn), rate));
      card.focus();
    }
    function rateIt(ok) {
      GL.store.record(deck[idx], ok); if (ok) got++;
      idx++; render();
    }
    function onKey(e) {
      if (e.target && e.target.tagName === 'INPUT') return;
      if (e.key === ' ' || e.key === 'Enter') { if (card && !flipped && document.activeElement === card) { e.preventDefault(); card._flip(); } }
      else if (e.key === 'ArrowLeft' && flipped) rateIt(false);
      else if (e.key === 'ArrowRight' && flipped) rateIt(true);
    }
    document.addEventListener('keydown', onKey);
    GL.ui.onCleanup(function () { document.removeEventListener('keydown', onKey); });
    render();
  }

  return { build: build, run: run, resultCard: resultCard, flashcards: flashcards, wordQ: wordQ, buildQ: buildQ, pickWords: pickWords, conceptQ: conceptQ };
})();
