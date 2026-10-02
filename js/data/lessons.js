/*
 * Lessons: each teaches a handful of items from items.js.
 * A lesson unlocks when the previous one is completed.
 * `intro` (optional) is a short idea card shown before the letters.
 */
window.GL = window.GL || {};

GL.lessons = [
  {
    id: 1, title: 'Your first five letters',
    blurb: 'Meet the built-in “a” that sits inside every consonant.',
    intro: { title: 'Every consonant has a built-in “a”', body: 'In Gujarati, a consonant letter already carries a short “a”. So ક is not just “k” — it is <b>ka</b>. You never write a separate “a” after it.' },
    items: ['ક', 'મ', 'ન', 'ત', 'પ']
  },
  {
    id: 2, title: 'Five more consonants',
    blurb: 'Five more consonants, and your first real words.',
    items: ['ર', 'લ', 'વ', 'સ', 'હ']
  },
  {
    id: 3, title: 'Vowels that stand alone',
    blurb: 'The vowels you meet at the start of a word.',
    intro: { title: 'Two ways to write a vowel', body: 'When a vowel starts a word (or stands alone), it gets its own letter, like <b>અ</b> in અમે. When a vowel comes after a consonant, it shrinks into a small <b>sign</b> — you will learn those soon.' },
    items: ['અ', 'આ', 'ઇ', 'ઈ', 'ઉ']
  },
  {
    id: 4, title: 'More standalone vowels',
    blurb: 'The rest of the vowel family.',
    items: ['ઊ', 'એ', 'ઐ', 'ઓ', 'ઔ']
  },
  {
    id: 5, title: 'Vowel signs, part 1',
    blurb: 'Little marks that change a consonant’s vowel.',
    intro: { title: 'Signs replace the built-in “a”', body: 'A vowel sign attaches to a consonant and swaps its built-in “a” for another vowel: ક → <b>કા</b> (kaa), <b>કિ</b> (ki), <b>કી</b> (kee). That unlocks real words.' },
    items: ['ા', 'િ', 'ી', 'ુ', 'ૂ']
  },
  {
    id: 6, title: 'Vowel signs, part 2',
    blurb: 'More vowel marks, plus the nasal dot.',
    items: ['ે', 'ૈ', 'ો', 'ૌ', 'ં']
  },
  {
    id: 7, title: 'Puffs of breath',
    blurb: 'Plain and breathy pairs. Words like ઘર and ચા.',
    items: ['ખ', 'ગ', 'ઘ', 'ચ', 'છ']
  },
  {
    id: 8, title: 'Bright consonants',
    blurb: 'Words like બજાર and ભાત.',
    items: ['જ', 'ઝ', 'બ', 'ભ', 'ય']
  },
  {
    id: 9, title: 'Curled-tongue sounds',
    blurb: 'The curled-tongue family. Words like પાણી and ટોપી.',
    intro: { title: 'Tongue-curled-back letters', body: 'Five letters are said with the tongue tip curled back. In our hints they use <b>capital letters</b> — T, Th, D, Dh, N — so you can tell them from the teeth-sounds ત, થ, દ, ધ, ન.' },
    items: ['ટ', 'ઠ', 'ડ', 'ઢ', 'ણ']
  },
  {
    id: 10, title: 'Everyday favourites',
    blurb: 'Everyday words like દૂધ, ફૂલ and શહેર.',
    items: ['થ', 'દ', 'ધ', 'ફ', 'શ']
  },
  {
    id: 11, title: 'Joining letters',
    blurb: 'Letters that join, and the lotus: કમળ.',
    intro: { title: 'Letters can join hands', body: 'The joiner sign <b>્</b> cancels a consonant’s built-in “a” so it can team up with the next letter. ક્ + ષ become <b>ક્ષ</b>. Two joined letters are called a <b>conjunct</b>.' },
    items: ['ષ', 'ળ', 'ક્ષ', 'જ્ઞ', '્']
  },
  {
    id: 12, title: 'Common conjuncts',
    blurb: 'Joined letters you will see everywhere: મિત્ર, પ્રેમ.',
    items: ['ત્ર', 'સ્ત', 'પ્ર', 'શ્ર', 'સ્વ']
  }
];
