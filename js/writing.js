/* Writing practice: a large reference letter next to a freehand drawing pad.
 * Built for iPad: Apple Pencil pressure, palm rejection, smooth lines. It only records strokes —
 * it does not judge them and shows no stroke order. */
window.GL = window.GL || {};

GL.writing = (function () {
  var h = GL.ui.h, gu = GL.ui.gu;
  var practiced = {}; // ids that already earned the small practice bonus this visit

  function view(root, startId) {
    var items = GL.items;
    var cur = Math.max(0, items.map(function (i) { return i.id; }).indexOf(startId));
    var strokes = [], drawing = null, activeId = null, penUntil = 0, guideMode = 'outline', guideToken = 0, penSize = 'medium';
    var PEN = { fine: 0.011, medium: 0.016, bold: 0.024 };   // line width as a share of the pad width

    var refBox = h('div', { class: 'ref-card' });
    var select = h('select', { id: 'letter-select', 'aria-label': 'Choose a letter to practice', onchange: function () { go(+select.value); } });
    GL.groups.forEach(function (g) {
      var og = h('optgroup', { label: g.title.split(' · ')[0] });
      items.forEach(function (it, i) {
        if (it.kind === g.id) {
          var learned = GL.store.taughtIds().indexOf(it.id) !== -1;
          og.appendChild(h('option', { value: i }, GL.ui.glyphOf(it) + (learned ? '' : '  (not learned yet)')));
        }
      });
      select.appendChild(og);
    });

    var guide = h('canvas', { class: 'guide', 'aria-hidden': 'true' });
    var canvas = h('canvas', { class: 'pad', tabindex: 0, role: 'img', 'aria-label': 'Drawing area. Use a finger, Apple Pencil, stylus or mouse to write the letter.' });
    var wrap = h('div', { class: 'pad-wrap' }, guide, canvas);
    var ctx = canvas.getContext('2d');
    var undoBtn = h('button', { type: 'button', class: 'btn', id: 'undo-btn', onclick: undo }, 'Undo');
    var clearBtn = h('button', { type: 'button', class: 'btn', id: 'clear-btn', onclick: clearAll }, 'Clear');
    var MODES = [['outline', 'Outline'], ['centerline', 'Strokes'], ['off', 'Off']];
    var modeBtns = MODES.map(function (m) { return h('button', { type: 'button', class: 'seg', 'aria-pressed': String(m[0] === guideMode), onclick: function () { setMode(m[0]); } }, m[1]); });
    var guideBtn = h('div', { class: 'seg-group', role: 'group', 'aria-label': 'Guide behind the pad' }, h('span', { class: 'seg-label' }, 'Guide'), modeBtns);
    var guideNote = h('p', { class: 'pen-hint', hidden: true }, 'Strokes view: the thin path the pen covers, with separate pieces in different colors. It comes from the letter\u2019s shape only. Stroke order and direction are not shown, because no trustworthy source was available for them. A Gujarati writer or a handwriting book is the place for those.');
    function setMode(m) {
      guideMode = m; modeBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(MODES[i][0] === m)); });
      guideNote.hidden = m !== 'centerline'; drawGuide();
    }
    var PEN_MODES = [['fine', 'Fine'], ['medium', 'Medium'], ['bold', 'Bold']];
    var penBtns = PEN_MODES.map(function (m) { return h('button', { type: 'button', class: 'seg', 'aria-pressed': String(m[0] === penSize), onclick: function () {
      penSize = m[0]; penBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(PEN_MODES[i][0] === penSize)); }); redraw();
    } }, m[1]); });
    var penGroup = h('div', { class: 'seg-group', role: 'group', 'aria-label': 'Pen thickness' }, h('span', { class: 'seg-label' }, 'Pen'), penBtns);
    var PIECE_COLORS = ['#6d28b8', '#c2570f', '#0f766e', '#be185d', '#1d4ed8', '#4d7c0f'];
    function drawGuide() {
      var w = wrap.clientWidth || 300, dpr = Math.min(window.devicePixelRatio || 1, 3), token = ++guideToken;
      guide.width = Math.round(w * dpr); guide.height = guide.width;
      var g = guide.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, w);
      if (guideMode === 'off') return;
      var glyph = GL.ui.glyphOf(items[cur]), mode = guideMode;
      GL.shape.ready(glyph).then(function () {
        if (token !== guideToken) return;
        var L = GL.shape.layout(glyph, w);
        g.font = L.font; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
        g.fillStyle = mode === 'outline' ? 'rgba(145, 73, 220, .15)' : 'rgba(145, 73, 220, .09)'; g.fillText(glyph, L.x, L.y);
        if (mode !== 'centerline') return;
        GL.shape.centerline(glyph).then(function (cl) {
          if (token !== guideToken) return;
          var r = Math.max(2, w * 0.0085);
          cl.pts.forEach(function (p) { g.fillStyle = PIECE_COLORS[p[2] % PIECE_COLORS.length]; g.beginPath(); g.arc(p[0] * w, p[1] * w, r, 0, 6.2832); g.fill(); });
        });
      });
    }
    var doneBtn = h('button', { type: 'button', class: 'btn', onclick: function () { logPractice(); } }, 'I practiced it');
    var checkBtn = h('button', { type: 'button', class: 'btn primary', id: 'check-btn', onclick: runCheck }, 'Check my shape');
    var resultBox = h('div', { class: 'shape-result', id: 'shape-result', 'aria-live': 'polite', hidden: true });
    var allGlyphs = items.map(function (it) { return GL.ui.glyphOf(it); });

    function logPractice() {
      var id = items[cur].id;
      if (!practiced[id]) { practiced[id] = 1; GL.ui.played(); GL.ui.award(3, 'Practice logged'); return true; }
      GL.ui.toast('Already logged. Keep going.'); return false;
    }
    function hideResult() { resultBox.hidden = true; resultBox.innerHTML = ''; }
    var CHECKING = false;
    function runCheck() {
      if (CHECKING) return;
      if (!strokes.length) { GL.ui.toast('Write the letter first'); return; }
      CHECKING = true; checkBtn.disabled = true;
      var it = items[cur], glyph = GL.ui.glyphOf(it);
      GL.shape.check(strokes, glyph, allGlyphs).then(function (res) {
        CHECKING = false; checkBtn.disabled = false; resultBox.innerHTML = ''; resultBox.hidden = false;
        if (!res.ok) { resultBox.appendChild(h('p', null, 'Write the whole letter in the box first, then check.')); return; }
        var v = res.verdict;
        var title = { great: 'Very close', close: 'Close', getting: 'Getting there', far: 'Not close yet' }[v.band];
        var msg = { great: 'Your pen path follows the letter very closely.', close: 'Your shape lines up well with the letter.', getting: 'You have the general idea. A few parts are off.', far: 'This does not match the letter yet. Compare with the big letter and try again.' }[v.band];
        var grade = res.me.grade;
        var img = res.overlay; img.className = 'shape-img'; img.setAttribute('role', 'img'); img.setAttribute('aria-label', 'Your drawing compared with the letter');
        var near = v.confusedWith ? items.filter(function (x) { return GL.ui.glyphOf(x) === v.confusedWith; })[0] : null;
        resultBox.appendChild(h('div', { class: 'shape-body' },
          h('div', { class: 'shape-text' },
            h('p', { class: 'label' }, 'Shape check'),
            h('div', { class: 'grade ' + v.band, role: 'img', 'aria-label': 'Grade ' + grade.toFixed(1) + ' out of 10' }, h('span', { class: 'grade-num' }, grade.toFixed(1)), h('span', { class: 'grade-of' }, ' / 10')),
            h('h3', { class: 'band ' + v.band }, title),
            h('p', null, msg),
            near ? h('p', null, 'Your shape is a bit closer to ', gu(v.confusedWith), near.roman ? ' (' + near.roman + ')' : '', ' than to ', gu(glyph), '.') : null,
            v.tips.map(function (t) { return h('p', { class: 'muted' }, t); }),
            h('p', { class: 'key' }, h('span', null, h('i', { class: 'k-letter' }), 'the letter'), h('span', null, h('i', { class: 'k-miss' }), 'not reached'), h('span', null, h('i', { class: 'k-ink' }), 'your ink'), h('span', null, h('i', { class: 'k-stray' }), 'outside the letter'))),
          img));
        resultBox.appendChild(h('p', { class: 'fine' }, 'The grade measures how closely your pen path follows the letter\u2019s path (where it goes and which way it runs), scaled to 10. It compares against one typeface and cannot see stroke order or neatness, so a good letter in your own handwriting can score lower than a traced one.'));
        if (v.band !== 'far') logPractice();
      });
    }
    var status = h('p', { class: 'muted', 'aria-live': 'polite', id: 'stroke-count' });

    function size() {
      var w = wrap.clientWidth || 300, dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(w * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw(); drawGuide();
    }
    function width(w, p) { return Math.max(2.5, w * PEN[penSize]) * (0.55 + 0.9 * p); }
    function seg(a, b, w) {
      ctx.lineWidth = width(w, (a[2] + b[2]) / 2);
      ctx.beginPath(); ctx.moveTo(a[0] * w, a[1] * w); ctx.lineTo(b[0] * w, b[1] * w); ctx.stroke();
    }
    function redraw() {
      var w = canvas.clientWidth || 300;
      ctx.clearRect(0, 0, w, w);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#2a1838';
      strokes.forEach(function (s) {
        if (s.length === 1) { ctx.beginPath(); ctx.moveTo(s[0][0] * w, s[0][1] * w); ctx.lineTo(s[0][0] * w + 0.1, s[0][1] * w); ctx.lineWidth = width(w, s[0][2]); ctx.stroke(); }
        for (var i = 1; i < s.length; i++) seg(s[i - 1], s[i], w);
      });
      undoBtn.disabled = !strokes.length; clearBtn.disabled = !strokes.length; checkBtn.disabled = !strokes.length || CHECKING;
      status.textContent = strokes.length ? strokes.length + (strokes.length === 1 ? ' stroke drawn' : ' strokes drawn') : 'Nothing drawn yet.';
    }
    function pt(e) {
      var r = canvas.getBoundingClientRect();
      var p = e.pointerType === 'pen' ? (e.pressure || 0.5) : 0.5;   // mouse and finger have no real pressure
      return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, p];
    }
    function undo() { strokes.pop(); hideResult(); redraw(); }
    function clearAll() { strokes = []; hideResult(); redraw(); }

    canvas.addEventListener('pointerdown', function (e) {
      if (activeId !== null) return;                                   // one pointer at a time
      if (e.pointerType === 'touch' && Date.now() < penUntil) return;  // palm rejection while an Apple Pencil is in use
      if (e.pointerType === 'pen') penUntil = Date.now() + 1500;
      e.preventDefault(); activeId = e.pointerId;
      try { canvas.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
      drawing = [pt(e)]; strokes.push(drawing); hideResult(); redraw();
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!drawing || e.pointerId !== activeId) return;
      if (e.pointerType === 'pen') penUntil = Date.now() + 1500;
      var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      var w = canvas.clientWidth;
      ctx.lineCap = 'round'; ctx.strokeStyle = '#2a1838';
      (evs.length ? evs : [e]).forEach(function (ev) {
        var p = pt(ev), prev = drawing[drawing.length - 1];
        if (Math.abs(p[0] - prev[0]) + Math.abs(p[1] - prev[1]) < 0.0015) return;
        drawing.push(p); seg(prev, p, w);
      });
    });
    function end(e) { if (drawing && (!e || e.pointerId === activeId)) { drawing = null; activeId = null; redraw(); } }
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
    }
    document.addEventListener('keydown', onKey);
    var ro = window.ResizeObserver ? new ResizeObserver(function () { size(); }) : null;
    if (ro) ro.observe(wrap); else window.addEventListener('resize', size);
    GL.ui.onCleanup(function () { document.removeEventListener('keydown', onKey); if (ro) ro.disconnect(); else window.removeEventListener('resize', size); });

    function go(i) {
      cur = (i + items.length) % items.length; strokes = []; hideResult(); select.value = cur;
      var it = items[cur];
      refBox.innerHTML = '';
      refBox.appendChild(h('div', { class: 'bigglyph xl' }, gu(GL.ui.glyphOf(it))));
      refBox.appendChild(h('p', { class: 'sound' }, GL.ui.hint(it.roman) || h('span', { class: 'muted' }, 'Hint hidden')));
      refBox.appendChild(h('p', { class: 'refword' }, GL.ui.hint(it.word.roman), ' ', h('span', { class: 'en' }, it.word.en)));
      if (GL.store.taughtIds().indexOf(it.id) === -1) refBox.appendChild(h('p', { class: 'note' }, 'Coming up in lesson ' + GL.lessonOfItem[it.id] + '. A sneak peek is fine.'));
      size();
    }

    root.appendChild(h('div', { class: 'write-view' },
      h('h1', null, 'Writing practice'),
      h('p', { class: 'lead' }, 'Look at the big letter, then write it in the box. Say its sound as you write.'),
      h('div', { class: 'write-grid' },
        h('div', { class: 'side' },
          h('div', { class: 'row' }, h('label', { for: 'letter-select' }, 'Letter'), select,
            h('button', { type: 'button', class: 'btn small', onclick: function () { go(cur - 1); } }, 'Previous'),
            h('button', { type: 'button', class: 'btn small', onclick: function () { go(cur + 1); } }, 'Next')),
          refBox,
          h('div', { class: 'row tools' }, undoBtn, clearBtn, guideBtn, penGroup, checkBtn, doneBtn)),
        h('div', { class: 'pad-col' }, wrap, guideNote, status, resultBox,
          h('p', { class: 'pen-hint' }, 'Works with a finger, Apple Pencil or mouse. With a Pencil you can rest your palm on the screen.'))),
      h('p', { class: 'note' }, '"Check my shape" compares your drawing\u2019s overall outline with the letter, at any size and position. It gives rough feedback only. Stroke order is not shown or checked here; a Gujarati teacher or a printed writing book is the best guide for that. Ctrl+Z also undoes.')));
    go(cur);
  }
  return { view: view };
})();
