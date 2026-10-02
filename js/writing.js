/* Writing practice: a large reference letter next to a freehand drawing pad.
 * Built for iPad: Apple Pencil pressure, palm rejection, smooth lines. It only records strokes —
 * it does not judge them and shows no stroke order. */
window.GL = window.GL || {};

GL.writing = (function () {
  var h = GL.ui.h, gu = GL.ui.gu;
  var practised = {}; // ids that already earned the small practice bonus this visit

  function view(root, startId) {
    var items = GL.items;
    var cur = Math.max(0, items.map(function (i) { return i.id; }).indexOf(startId));
    var strokes = [], drawing = null, activeId = null, penUntil = 0, showGuide = true;

    var refBox = h('div', { class: 'ref-card' });
    var select = h('select', { id: 'letter-select', 'aria-label': 'Choose a letter to practise', onchange: function () { go(+select.value); } });
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

    var ghost = h('div', { class: 'ghost gu', lang: 'gu', 'aria-hidden': 'true' });
    var canvas = h('canvas', { class: 'pad', tabindex: 0, role: 'img', 'aria-label': 'Drawing area. Use a finger, Apple Pencil, stylus or mouse to write the letter.' });
    var wrap = h('div', { class: 'pad-wrap' }, ghost, canvas);
    var ctx = canvas.getContext('2d');
    var undoBtn = h('button', { type: 'button', class: 'btn', id: 'undo-btn', onclick: undo }, 'Undo');
    var clearBtn = h('button', { type: 'button', class: 'btn', id: 'clear-btn', onclick: clearAll }, 'Clear');
    var guideBtn = h('button', { type: 'button', class: 'btn ghost', 'aria-pressed': 'true', onclick: function () {
      showGuide = !showGuide; guideBtn.setAttribute('aria-pressed', String(showGuide));
      guideBtn.textContent = showGuide ? 'Faint guide: on' : 'Faint guide: off';
      ghost.hidden = !showGuide;
    } }, 'Faint guide: on');
    var doneBtn = h('button', { type: 'button', class: 'btn primary', onclick: function () {
      var id = items[cur].id;
      if (!practised[id]) { practised[id] = 1; GL.ui.played(); GL.ui.award(3, 'Practice logged'); }
      else GL.ui.toast('Already logged. Keep going.');
    } }, 'I practised it');
    var status = h('p', { class: 'muted', 'aria-live': 'polite', id: 'stroke-count' });

    function size() {
      var w = wrap.clientWidth || 300, dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(w * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var len = Array.from(GL.ui.glyphOf(items[cur])).length;
      ghost.style.fontSize = Math.round(w * (len > 2 ? 0.4 : len > 1 ? 0.55 : 0.65)) + 'px';
      redraw();
    }
    function width(w, p) { return Math.max(4, w * 0.034) * (0.45 + 1.1 * p); }
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
      undoBtn.disabled = !strokes.length; clearBtn.disabled = !strokes.length;
      status.textContent = strokes.length ? strokes.length + (strokes.length === 1 ? ' stroke drawn' : ' strokes drawn') : 'Nothing drawn yet.';
    }
    function pt(e) {
      var r = canvas.getBoundingClientRect();
      var p = e.pointerType === 'pen' ? (e.pressure || 0.5) : 0.5;   // mouse and finger have no real pressure
      return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, p];
    }
    function undo() { strokes.pop(); redraw(); }
    function clearAll() { strokes = []; redraw(); }

    canvas.addEventListener('pointerdown', function (e) {
      if (activeId !== null) return;                                   // one pointer at a time
      if (e.pointerType === 'touch' && Date.now() < penUntil) return;  // palm rejection while an Apple Pencil is in use
      if (e.pointerType === 'pen') penUntil = Date.now() + 1500;
      e.preventDefault(); activeId = e.pointerId;
      try { canvas.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
      drawing = [pt(e)]; strokes.push(drawing); redraw();
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
      cur = (i + items.length) % items.length; strokes = []; select.value = cur;
      var it = items[cur];
      refBox.innerHTML = '';
      refBox.appendChild(h('div', { class: 'bigglyph xl' }, gu(GL.ui.glyphOf(it))));
      refBox.appendChild(h('p', { class: 'sound' }, GL.ui.hint(it.roman) || h('span', { class: 'muted' }, 'Hint hidden')));
      refBox.appendChild(h('p', { class: 'exword' }, GL.ui.highlighted(it.word.gu, it.word.hl), ' ', h('span', { class: 'en' }, it.word.en)));
      if (GL.store.taughtIds().indexOf(it.id) === -1) refBox.appendChild(h('p', { class: 'note' }, 'Coming up in lesson ' + GL.lessonOfItem[it.id] + '. A sneak peek is fine.'));
      ghost.textContent = GL.ui.glyphOf(it); ghost.hidden = !showGuide;
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
          h('div', { class: 'row tools' }, undoBtn, clearBtn, guideBtn, doneBtn)),
        h('div', { class: 'pad-col' }, wrap, status,
          h('p', { class: 'pen-hint' }, 'Works with a finger, Apple Pencil or mouse. With a Pencil you can rest your palm on the screen.'))),
      h('p', { class: 'note' }, 'This pad cannot check your handwriting. Compare your letter with the big one by eye. Stroke order is not shown here; a Gujarati teacher or a printed writing book is the best guide for that. Ctrl+Z also undoes.')));
    go(cur);
  }
  return { view: view };
})();
