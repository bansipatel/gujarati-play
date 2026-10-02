// Run: node tests/validate-data.js
// Checks lesson/item/word data is internally consistent and that every word's
// transliteration matches what the letters spell (allowing unpronounced built-in "a"s).
global.window = global; global.GL = {};
const load = f => (0, eval)(require('fs').readFileSync(require('path').join(__dirname, '..', f), 'utf8'));
['js/data/items.js', 'js/data/lessons.js', 'js/data/words.js', 'js/core.js'].forEach(load);
let errors = 0; const err = m => { errors++; console.log('✗', m); };

// lessons reference real items, each exactly once
const seen = {};
GL.lessons.forEach(l => {
  if (l.cards) {   // explainer lesson: no new letters, but cards and a quiz
    if (l.items.length) err(`lesson ${l.id}: explainer lessons teach no letters`);
    if (!GL.lessonById(l.after)) err(`lesson ${l.id}: unknown prerequisite ${l.after}`);
    if (!l.quiz || l.quiz.length < 6) err(`lesson ${l.id}: needs a quiz of at least 6 questions`);
    l.cards.forEach((c, i) => { if (!c.title || !c.body) err(`lesson ${l.id} card ${i + 1}: missing title or body`); (c.rows || []).forEach(r => { if (!r.gu || !r.roman) err(`lesson ${l.id} card ${i + 1}: row missing gu/roman`); }); });
    (l.quiz || []).forEach((q, i) => {
      if (!q.ask || !q.why) err(`lesson ${l.id} quiz ${i + 1}: missing ask/why`);
      if (!(q.opts.length >= 2 && q.ans >= 0 && q.ans < q.opts.length)) err(`lesson ${l.id} quiz ${i + 1}: bad answer index`);
      if (new Set(q.opts).size !== q.opts.length) err(`lesson ${l.id} quiz ${i + 1}: duplicate options`);
    });
  } else if (l.items.length !== 5) err(`lesson ${l.id} has ${l.items.length} items`);
  l.items.forEach(id => { if (!GL.itemById[id]) err(`lesson ${l.id}: unknown item ${id}`); if (seen[id]) err(`${id} taught twice`); seen[id] = l.id; });
});
GL.items.forEach(it => {
  if (!seen[it.id]) err(`item ${it.id} is in no lesson`);
  if (!it.word || !it.word.gu.includes(it.word.hl)) err(`item ${it.id}: example word missing highlight`);
});

// transliteration check
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function derive(gu) {
  const parts = []; let pending = false;
  for (const ch of gu) {
    const it = GL.itemById[ch];
    if (ch === '્') { pending = false; continue; }
    if (it && it.kind === 'sign') {
      if (ch === 'ં') { if (pending) parts.push('a'); pending = false; parts.push('n'); } else { pending = false; parts.push(esc(it.vowel)); }
      continue;
    }
    if (it && it.kind === 'consonant') { if (pending) parts.push('(?:a)?'); parts.push(esc(it.roman.slice(0, -1))); pending = true; continue; }
    if (it && it.kind === 'vowel') { if (pending) parts.push('(?:a)?'); parts.push(esc(it.roman)); pending = false; continue; }
    if (ch === 'ઞ') { if (pending) parts.push('(?:a)?'); parts.push('gn'); pending = true; continue; }
    return null;
  }
  if (pending) parts.push('(?:a)?');
  return new RegExp('^' + parts.join('') + '$');
}
GL.allWords().forEach(w => {
  // જ્ઞ is spelled જ + ્ + ઞ; compare using its own romanization
  const re = w.gu.includes('જ્ઞ') ? derive(w.gu.replace('જ્ઞ', '\u0000')) : derive(w.gu);
  if (w.gu.includes('જ્ઞ')) { if (!/gn/.test(w.roman)) err(`word ${w.gu}: roman should contain gn`); }
  else if (!re) err(`word ${w.gu}: contains a character that is not an item`);
  else if (!re.test(w.roman)) err(`word ${w.gu}: roman "${w.roman}" does not match its letters (${re})`);
  if (!GL.wordLesson(w)) err(`word ${w.gu} never unlocks`);
});
GL.confusables.forEach(c => { if (!GL.itemById[c[0]] || !GL.itemById[c[1]]) err(`confusable pair uses unknown item: ${c[0]} ${c[1]}`); });
GL.allWords().forEach(w => {
  const b = GL.breakdown(w);
  if (b.map(u => u.gu).join('') !== w.gu) err(`word ${w.gu}: clusters do not rebuild the word`);
  if (b.map(u => u.said).join('') !== w.roman) err(`word ${w.gu}: written-vs-said alignment failed for "${w.roman}"`);
});
GL.lessons.forEach(l => console.log(`after lesson ${l.id}: ${GL.wordsFor(GL.taughtThrough(l.id)).length} words available`));
console.log(errors ? `\n${errors} problem(s)` : '\nAll data checks passed ✓');
process.exit(errors ? 1 : 0);
