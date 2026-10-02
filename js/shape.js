/* Shape check for the writing pad.
 *
 * What it does: scales your drawing and the font's version of the letter to the same size, then measures
 *   coverage  - how much of the letter's shape your strokes reach, and
 *   precision - how much of your ink lies on the letter's shape.
 * It also scores your drawing against every other letter, to notice "this looks more like ઘ than ધ".
 *
 * What it does NOT do: judge stroke order, stroke direction, neatness, or fine letter form. It compares the
 * overall shape to one typeface, so a perfectly good hand-written letter can score lower than a traced one.
 */
window.GL = window.GL || {};

GL.shape = (function () {
  var N = 64;                 // comparison grid
  var FIT = 54;               // letter is scaled to fit this box inside the grid
  var P = { DC: 3, DP: 3 };   // tolerances (grid px) between your strokes and the letter's centerline
  var INK_PAD = 0.035;        // font strokes are thicker than a pen line; pad the ink box a little to match
  var FONT = '"Noto Sans Gujarati","Gujarati Sangam MN","Nirmala UI","Shruti",sans-serif';
  var templates = {};

  function makeCanvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  function maskOf(canvas, thresh) {
    var d = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data, m = new Uint8Array(canvas.width * canvas.height);
    for (var i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > thresh ? 1 : 0;
    return m;
  }

  /* Chamfer 3-4 distance transform: distance (in grid px) from every cell to the nearest set cell of `mask`. */
  function distance(mask) {
    var INF = 1e9, d = new Float32Array(N * N), x, y, v;
    for (var i = 0; i < d.length; i++) d[i] = mask[i] ? 0 : INF;
    for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
      v = d[y * N + x];
      if (x > 0) v = Math.min(v, d[y * N + x - 1] + 3);
      if (y > 0) { v = Math.min(v, d[(y - 1) * N + x] + 3); if (x > 0) v = Math.min(v, d[(y - 1) * N + x - 1] + 4); if (x < N - 1) v = Math.min(v, d[(y - 1) * N + x + 1] + 4); }
      d[y * N + x] = v;
    }
    for (y = N - 1; y >= 0; y--) for (x = N - 1; x >= 0; x--) {
      v = d[y * N + x];
      if (x < N - 1) v = Math.min(v, d[y * N + x + 1] + 3);
      if (y < N - 1) { v = Math.min(v, d[(y + 1) * N + x] + 3); if (x < N - 1) v = Math.min(v, d[(y + 1) * N + x + 1] + 4); if (x > 0) v = Math.min(v, d[(y + 1) * N + x - 1] + 4); }
      d[y * N + x] = v;
    }
    for (i = 0; i < d.length; i++) d[i] = d[i] / 3;
    return d;
  }

  /* Zhang-Suen thinning: reduces the font's thick strokes to a one-pixel centerline. */
  function thin(mask, n) {
    n = n || N;
    var m = Uint8Array.from(mask), changed = true;
    function nb(x, y) {
      var g = function (a, b) { return (a < 0 || b < 0 || a >= n || b >= n) ? 0 : m[b * n + a]; };
      return [g(x, y - 1), g(x + 1, y - 1), g(x + 1, y), g(x + 1, y + 1), g(x, y + 1), g(x - 1, y + 1), g(x - 1, y), g(x - 1, y - 1)];
    }
    while (changed) {
      changed = false;
      for (var step = 0; step < 2; step++) {
        var del = [];
        for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
          if (!m[y * n + x]) continue;
          var p = nb(x, y), B = p.reduce(function (a, b) { return a + b; }, 0);
          if (B < 2 || B > 6) continue;
          var A = 0; for (var i = 0; i < 8; i++) if (p[i] === 0 && p[(i + 1) % 8] === 1) A++;
          if (A !== 1) continue;
          if (step === 0 ? (p[0] * p[2] * p[4] || p[2] * p[4] * p[6]) : (p[0] * p[2] * p[6] || p[0] * p[4] * p[6])) continue;
          del.push(y * n + x);
        }
        del.forEach(function (i) { m[i] = 0; });
        if (del.length) changed = true;
      }
    }
    return m;
  }

  /* The font's version of a letter, scaled to the comparison grid. */
  function template(glyph) {
    if (templates[glyph]) return templates[glyph];
    var big = makeCanvas(640, 360), g = big.getContext('2d');
    g.font = '400 180px ' + FONT; g.textBaseline = 'alphabetic'; g.fillStyle = '#000';
    g.fillText(glyph, 60, 240);
    var d = g.getImageData(0, 0, 640, 360).data, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (var y = 0; y < 360; y++) for (var x = 0; x < 640; x++) if (d[(y * 640 + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    var small = makeCanvas(N, N), s = small.getContext('2d');
    var bw = Math.max(1, x1 - x0 + 1), bh = Math.max(1, y1 - y0 + 1), sc = FIT / Math.max(bw, bh);
    s.imageSmoothingQuality = 'high';
    s.drawImage(big, x0, y0, bw, bh, (N - bw * sc) / 2, (N - bh * sc) / 2, bw * sc, bh * sc);
    var mask = maskOf(small, 110), skel = thin(mask, N), count = 0;
    for (var i = 0; i < skel.length; i++) count += skel[i];
    return (templates[glyph] = { mask: mask, skel: skel, sdist: distance(skel), count: count });
  }

  /* Your strokes (points normalized to the pad) scaled the same way. Returns null if there is too little ink. */
  function inkMask(strokes) {
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, pts = 0;
    strokes.forEach(function (s) { s.forEach(function (p) { pts++; x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }); });
    if (pts < 4) return null;
    var bw = x1 - x0, bh = y1 - y0, side = Math.max(bw, bh);
    if (side < 0.06) return null;                          // basically a dot
    var pad = INK_PAD * side;
    x0 -= pad; y0 -= pad; bw += 2 * pad; bh += 2 * pad;
    var sc = FIT / Math.max(bw, bh);
    var c = makeCanvas(N, N), g = c.getContext('2d');
    g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#000'; g.lineWidth = 2.4;
    var ox = (N - bw * sc) / 2, oy = (N - bh * sc) / 2;
    strokes.forEach(function (s) {
      g.beginPath();
      s.forEach(function (p, i) { var X = ox + (p[0] - x0) * sc, Y = oy + (p[1] - y0) * sc; if (i) g.lineTo(X, Y); else g.moveTo(X, Y); });
      if (s.length === 1) g.lineTo(ox + (s[0][0] - x0) * sc + 0.1, oy + (s[0][1] - y0) * sc);
      g.stroke();
    });
    return maskOf(c, 70);
  }

  /* Core measurement on masks. Exposed so it can be tested without a drawing surface. */
  function measure(ink, distInk, tpl) {
    var covered = 0, i, near = 0, inkCount = 0;
    for (i = 0; i < N * N; i++) {
      if (tpl.skel[i] && distInk[i] <= P.DC) covered++;
      if (ink[i]) { inkCount++; if (tpl.sdist[i] <= P.DP) near++; }
    }
    var coverage = tpl.count ? covered / tpl.count : 0, precision = inkCount ? near / inkCount : 0;
    var f = coverage + precision > 0 ? 2 * coverage * precision / (coverage + precision) : 0;
    return { coverage: coverage, precision: precision, f: f };
  }

  /* ---- The 0-10 grade ----
     Both drawings are reduced to centerlines. For every point on one centerline we find the nearest point on the other,
     and charge for (a) the distance and (b) running at a different angle. Averaged both ways, so missing parts and extra
     marks both cost points. The raw number is then stretched onto 0-10 using values measured on simulated handwriting
     (see tests/shape-sim.html): tidy tracing of the right letter lands near 9-10, and shapes that are not the letter land low. */
  var G = { LAM: 4, CAP: 8, POWER: 2, RAW_LO: 0.4, RAW_HI: 7.2, R: 4, FAR: 5, FREE: 0.06, MISS_W: 3, STRAY_W: 0 };

  function pointsOf(mask) { var p = []; for (var j = 0; j < mask.length; j++) if (mask[j]) p.push([j % N, Math.floor(j / N)]); return p; }
  /* Local line direction (0..pi) at each point, from the points around it. */
  function orientations(Pts, R) {
    return Pts.map(function (p) {
      var sx = 0, sy = 0, n = 0, i, q;
      for (i = 0; i < Pts.length; i++) { q = Pts[i]; if (Math.abs(q[0] - p[0]) <= R && Math.abs(q[1] - p[1]) <= R) { sx += q[0]; sy += q[1]; n++; } }
      if (n < 3) return -1;
      var mx = sx / n, my = sy / n, cxx = 0, cyy = 0, cxy = 0;
      for (i = 0; i < Pts.length; i++) { q = Pts[i]; if (Math.abs(q[0] - p[0]) <= R && Math.abs(q[1] - p[1]) <= R) { var dx = q[0] - mx, dy = q[1] - my; cxx += dx * dx; cyy += dy * dy; cxy += dx * dy; } }
      var th = 0.5 * Math.atan2(2 * cxy, cxx - cyy); return th < 0 ? th + Math.PI : th;
    });
  }
  function angleGap(a, b) { if (a < 0 || b < 0) return 0; var d = Math.abs(a - b); return d > Math.PI / 2 ? Math.PI - d : d; }   // 0..pi/2
  function pathSet(mask) { var Pts = pointsOf(mask); return Pts.length < 8 ? null : { P: Pts, O: orientations(Pts, G.R) }; }
  function pathOfTemplate(tpl) { return tpl.path || (tpl.path = pathSet(tpl.skel)); }

  /* For each point of A: distance (plus angle penalty) to the nearest point of B. Returns the capped mean and the share
     of points that have nothing close on the other side (FAR px or more). */
  function directed(A, B) {
    var tot = 0, far = 0, i, j;
    for (i = 0; i < A.P.length; i++) {
      var best = 1e9, bj = 0, px = A.P[i][0], py = A.P[i][1];
      for (j = 0; j < B.P.length; j++) { var dx = px - B.P[j][0], dy = py - B.P[j][1], d = dx * dx + dy * dy; if (d < best) { best = d; bj = j; } }
      var dist = Math.sqrt(best);
      if (dist >= G.FAR) far++;
      tot += Math.min(dist + G.LAM * angleGap(A.O[i], B.O[bj]) / (Math.PI / 2), G.CAP);
    }
    return { mean: tot / A.P.length, far: far / A.P.length };
  }
  function gradeOf(inkPath, tpl) {
    var ref = pathOfTemplate(tpl); if (!ref || !inkPath) return 0;
    var a = directed(inkPath, ref), b = directed(ref, inkPath);
    var e = (a.mean + b.mean) / 2 / G.CAP;
    var raw = 10 * Math.pow(Math.max(0, 1 - e), G.POWER);
    var g = Math.max(0, Math.min(10, 10 * (raw - G.RAW_LO) / (G.RAW_HI - G.RAW_LO)));
    // leaving out part of the letter (or adding a lot of stray ink) costs extra
    var miss = Math.max(0, b.far - G.FREE), stray = Math.max(0, a.far - G.FREE);
    return g * Math.max(0, 1 - G.MISS_W * miss - G.STRAY_W * stray);
  }
  var round1 = function (x) { return Math.round(x * 10) / 10; };

  function scoreAll(ink, targetGlyph, allGlyphs) {
    var di = distance(ink), me = measure(ink, di, template(targetGlyph)), others = [];
    var path = pathSet(thin(ink, N));
    me.grade = round1(gradeOf(path, template(targetGlyph)));
    allGlyphs.forEach(function (g) { if (g !== targetGlyph) others.push({ glyph: g, grade: gradeOf(path, template(g)) }); });
    others.sort(function (a, b) { return b.grade - a.grade; });
    return { me: me, others: others, distInk: di };
  }

  /* Plain-language verdict from the grade. */
  function verdict(me, others) {
    var gr = me.grade, band = gr >= 8.5 ? 'great' : gr >= 7 ? 'close' : gr >= 5 ? 'getting' : 'far';
    var best = others[0], confusedWith = null;
    if (best && best.grade >= 6 && best.grade > gr + 0.8 && gr < 7) confusedWith = best.glyph;
    var tips = [];
    if (band === 'getting' || band === 'far') {
      if (me.coverage < me.precision - 0.12) tips.push('Part of the letter is missing. The orange marks show where the letter goes that your strokes did not reach.');
      else if (me.precision < me.coverage - 0.12) tips.push('Some of your ink sits away from the letter. The red marks are strokes outside it.');
      else tips.push('The overall shape is a little off. Look at the big letter again and try to match its curves and proportions.');
    }
    return { band: band, confusedWith: confusedWith, tips: tips };
  }

  /* A small picture: the letter (light purple), parts of its centerline you did not reach (orange),
     your ink (dark) and ink that strayed from the letter (red). */
  function overlay(ink, targetGlyph, distInk) {
    var tpl = template(targetGlyph), S = 4, c = makeCanvas(N * S, N * S), g = c.getContext('2d');
    g.fillStyle = '#fff9fc'; g.fillRect(0, 0, c.width, c.height);
    var x, y, i;
    for (y = 0; y < N; y++) for (x = 0; x < N; x++) { i = y * N + x; if (tpl.mask[i]) { g.fillStyle = 'rgba(145,73,220,.2)'; g.fillRect(x * S, y * S, S, S); } }
    for (y = 0; y < N; y++) for (x = 0; x < N; x++) { i = y * N + x; if (tpl.skel[i] && distInk[i] > P.DC) { g.fillStyle = '#f28a4b'; g.fillRect((x - 1) * S, (y - 1) * S, S * 3, S * 3); } }
    for (y = 0; y < N; y++) for (x = 0; x < N; x++) { i = y * N + x; if (ink[i]) { g.fillStyle = tpl.sdist[i] <= P.DP ? '#2a1838' : '#dc2626'; g.fillRect(x * S, y * S, S, S); } }
    return c;
  }

  /* ---- Guide drawing for the pad: the same letter placement is used for the outline and the centerline ---- */
  function ready(glyph) {
    return document.fonts && document.fonts.load ? document.fonts.load('180px "Noto Sans Gujarati"', glyph).catch(function () {}) : Promise.resolve();
  }
  /* Font and origin that put the letter's ink box in the middle of an S x S square, sized so the letter
     fills about 72% of the square (a large target is easier to trace). */
  function layout(glyph, S) {
    var g = makeCanvas(8, 8).getContext('2d'), fs = Math.round(S * 0.5), m, w, h;
    for (var k = 0; k < 2; k++) {
      g.font = '400 ' + fs + 'px ' + FONT; m = g.measureText(glyph);
      w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight; h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      fs = Math.max(8, Math.round(fs * 0.72 * S / Math.max(w, h, 1)));
    }
    g.font = '400 ' + fs + 'px ' + FONT; m = g.measureText(glyph);
    w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight; h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    return { font: g.font, x: (S - w) / 2 + m.actualBoundingBoxLeft, y: (S - h) / 2 + m.actualBoundingBoxAscent };
  }

  /* The letter's centerline: the thin path the pen would cover, split into separate pieces (connected parts).
     This is derived from the font's shape only. It says nothing about stroke order or direction. */
  var centerlines = {};
  function centerline(glyph) {
    if (centerlines[glyph]) return centerlines[glyph];
    return (centerlines[glyph] = ready(glyph).then(function () {
      var S = 256, c = makeCanvas(S, S), g = c.getContext('2d'), L = layout(glyph, S);
      g.font = L.font; g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.fillStyle = '#000'; g.fillText(glyph, L.x, L.y);
      var sk = thin(maskOf(c, 110), S), comp = new Int16Array(S * S).fill(-1), sizes = [], i, j;
      var nbrs = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
      for (i = 0; i < S * S; i++) {                         // label connected pieces
        if (!sk[i] || comp[i] >= 0) continue;
        var id = sizes.length, stack = [i], n = 0; comp[i] = id;
        while (stack.length) {
          var cur = stack.pop(), cx = cur % S, cy = (cur - cx) / S; n++;
          nbrs.forEach(function (d) { var x = cx + d[0], y = cy + d[1]; if (x < 0 || y < 0 || x >= S || y >= S) return; var q = y * S + x; if (sk[q] && comp[q] < 0) { comp[q] = id; stack.push(q); } });
        }
        sizes.push(n);
      }
      for (var pass = 0; pass < 6; pass++) {               // trim tiny spurs left by thinning (long pieces only, so dots survive)
        var drop = [];
        for (i = 0; i < S * S; i++) {
          if (!sk[i] || sizes[comp[i]] < 50) continue;
          var x0 = i % S, y0 = (i - x0) / S, cnt = 0;
          nbrs.forEach(function (d) { var x = x0 + d[0], y = y0 + d[1]; if (x >= 0 && y >= 0 && x < S && y < S && sk[y * S + x]) cnt++; });
          if (cnt <= 1) drop.push(i);
        }
        drop.forEach(function (q) { sk[q] = 0; });
      }
      var pts = [], remap = {}, next = 0;
      for (j = 0; j < S * S; j++) if (sk[j]) { var cid = comp[j]; if (remap[cid] === undefined) remap[cid] = next++; pts.push([(j % S) / S, Math.floor(j / S) / S, remap[cid]]); }
      return { pts: pts, pieces: next };
    }));
  }

  /* Public: resolves to {ok:false} if there is too little drawing, else scores, verdict and overlay. */
  function check(strokes, targetGlyph, allGlyphs) {
    var fonts = document.fonts && document.fonts.load ? document.fonts.load('180px "Noto Sans Gujarati"', targetGlyph).catch(function () {}) : Promise.resolve();
    return fonts.then(function () {
      var ink = inkMask(strokes);
      if (!ink) return { ok: false };
      var sc = scoreAll(ink, targetGlyph, allGlyphs), v = verdict(sc.me, sc.others);
      return { ok: true, me: sc.me, others: sc.others, verdict: v, overlay: overlay(ink, targetGlyph, sc.distInk) };
    });
  }

  return { params: P, grading: G, thin: thin, ready: ready, layout: layout, centerline: centerline, check: check, _ink: inkMask, _template: template, _distance: distance, _measure: measure, _scoreAll: scoreAll, _verdict: verdict, N: N };
})();
