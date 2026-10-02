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
    id: 10, title: 'Everyday favorites',
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

/*
 * Part 2 — Reading mastery. These are explainer lessons: no new letters, so `items` is empty.
 * They open once lesson 6 (vowel signs + the dot) is done, and each opens after the one before it.
 *   after : the lesson that must be finished first (defaults to id - 1)
 *   cards : [{ title, body (html), rows: [{ gu, roman, en, hl, note }] }]
 *   quiz  : [{ ask, big, cue, opts, gu (options are Gujarati), ans (index of the right option), why (html) }]
 * Example words may use letters the learner has not met yet, so every example shows its sound.
 */
(function () {
  var W = function (gu, roman, en, hl, note) { return { gu: gu, roman: roman, en: en, hl: hl, note: note }; };
  var Q = function (ask, opts, ans, why, more) {
    var q = { ask: ask, opts: opts, ans: ans, why: why }; for (var k in (more || {})) q[k] = more[k]; return q;
  };
  /* "How do you spell it?" question: first option is always the right one; the game shuffles them. */
  var S = function (roman, en, right, wrong, why) {
    return { ask: 'You know how it sounds. Which spelling is right?', cue: roman + ' (' + en + ')', opts: [right].concat(wrong), gu: true, ans: 0, why: why };
  };

  GL.lessons.push(
    {
      id: 13, part: 'Part 2 · Reading mastery', after: 6, title: 'Short and long vowels',
      blurb: 'ઇ/ઈ and ઉ/ઊ: why they look different but sound alike.',
      cards: [
        { title: 'Your ear cannot help here',
          body: '<p>Say <b>દિવસ</b> (day), then <b>દીવો</b> (lamp). The vowel sounds the same in both.</p><p>Gujarati has a <b>short</b> vowel (હ્રસ્વ) and a <b>long</b> one (દીર્ઘ), but in speech they are said alike. So the difference lives only in the <b>spelling</b>. That is why it feels confusing: you cannot hear which one to write. You learn it by pattern, and the next lessons give you the patterns.</p>',
          rows: [W('દિવસ', 'divas', 'day (short િ)', 'િ'), W('દીવો', 'deevo', 'lamp (long ી)', 'ી')] },
        { title: 'The four pairs',
          body: '<p>There are two pairs of vowels, and each pair has a standalone letter and a sign.</p>',
          rows: [W('ઇ  ·  ઈ', 'i · ee', 'standalone, at the start of a word', null, 'said alike'), W('કિ  ·  કી', 'ki · kee', 'signs after a consonant', null, 'said alike'),
                 W('ઉ  ·  ઊ', 'u · oo', 'standalone, at the start of a word', null, 'said alike'), W('કુ  ·  કૂ', 'ku · koo', 'signs after a consonant', null, 'said alike')] },
        { title: 'Telling the shapes apart',
          body: '<p>Keep the shapes straight first. Then the patterns will have something to hang on.</p>',
          rows: [W('કિ', 'ki', 'short i: the sign is written BEFORE the letter'), W('કી', 'kee', 'long ee: the sign comes AFTER the letter'),
                 W('કુ', 'ku', 'short u: a small hook below'), W('કૂ', 'koo', 'long oo: the hook with a tail')] },
        { title: 'The names you will hear',
          body: '<p>If someone says “<b>dirgh ee</b>” or “<b>hrasva u</b>”, this is what they mean. Short is <b>હ્રસ્વ</b>, long is <b>દીર્ઘ</b>.</p>',
          rows: [W('હ્રસ્વ ઇ', 'hrasva i', 'short i (ઇ, િ)'), W('દીર્ઘ ઈ', 'deergh ee', 'long ee (ઈ, ી)'), W('હ્રસ્વ ઉ', 'hrasva u', 'short u (ઉ, ુ)'), W('દીર્ઘ ઊ', 'deergh oo', 'long oo (ઊ, ૂ)')] }
      ],
      quiz: [
        Q('Do ઇ and ઈ sound different when you speak?', ['No. They sound the same; only the spelling differs', 'Yes. ઈ is held much longer', 'Yes. ઇ is nasal'], 0, 'In modern Gujarati the short and long vowels are said alike. Spelling is what you have to learn.'),
        Q('Which sign is written BEFORE its consonant on the page?', ['િ (as in કિ)', 'ી (as in કી)'], 0, 'The short i sign િ is written first, then the consonant. The long ી comes after.'),
        Q('What does દીર્ઘ mean?', ['long', 'short', 'nasal'], 0, 'દીર્ઘ = long. હ્રસ્વ = short.'),
        Q('What does હ્રસ્વ mean?', ['short', 'long', 'silent'], 0, 'હ્રસ્વ = short. દીર્ઘ = long.'),
        Q('Which one has the LONG oo sign?', ['કુ', 'કૂ'], 1, 'કૂ has the longer hook with a tail. કુ is the short u.', { gu: true }),
        S('deevo', 'lamp', 'દીવો', ['દિવો'], 'દીવો has the long ી.'),
        S('dood-h', 'milk', 'દૂધ', ['દુધ'], 'દૂધ has the long ૂ.'),
        S('gulaab', 'rose', 'ગુલાબ', ['ગૂલાબ'], 'ગુલાબ has the short ુ.')
      ]
    },
    {
      id: 14, after: 13, title: 'Word endings: ી, િ, ુ and ું',
      blurb: 'The last vowel of a word follows patterns you can rely on.',
      cards: [
        { title: 'Endings carry meaning',
          body: '<p>Many Gujarati words change their last sound for masculine, feminine and neuter. You already do this when you speak. Now see it in writing:</p><ul><li><b>ો</b> masculine</li><li><b>ી</b> feminine</li><li><b>ું</b> neuter (that is a short ુ plus the dot)</li></ul>',
          rows: [W('છોકરો', 'chhokaro', 'boy', 'ો'), W('છોકરી', 'chhokaree', 'girl', 'ી'), W('છોકરું', 'chhokarun', 'child', 'ું'),
                 W('સારો', 'saaro', 'good (masculine)', 'ો'), W('સારી', 'saaree', 'good (feminine)', 'ી'), W('સારું', 'saarun', 'good (neuter)', 'ું')] },
        { title: 'Rule 1: everyday words end in long ી',
          body: '<p>At the end of an everyday Gujarati word, write the <b>long ી</b>. This is the most dependable spelling pattern you will learn.</p>',
          rows: [W('પાણી', 'paaNee', 'water', 'ી'), W('ટોપી', 'Topee', 'cap', 'ી'), W('ચાવી', 'chaavee', 'key', 'ી'), W('કેરી', 'keree', 'mango', 'ી'), W('રાણી', 'raaNee', 'queen', 'ી'), W('થાળી', 'thaaLee', 'plate', 'ી')] },
        { title: 'Rule 2: Sanskrit words keep a short િ',
          body: '<p>Words that came from Sanskrit keep their Sanskrit spelling, and many end in a <b>short િ</b>. Treat the long ી as your default, and learn these as the exceptions.</p>',
          rows: [W('કવિ', 'kavi', 'poet', 'િ'), W('રવિ', 'ravi', 'sun; Sunday', 'િ'), W('હરિ', 'hari', 'Hari (God)', 'િ'), W('પતિ', 'pati', 'husband', 'િ'), W('ગતિ', 'gati', 'speed', 'િ')] },
        { title: 'Rule 3: final ુ is common, final ૂ is rare',
          body: '<p>At the end of a word, the <b>short ુ</b> is the usual one, especially in Sanskrit words. A final long ૂ is rare.</p>',
          rows: [W('ગુરુ', 'guru', 'teacher', 'ુ'), W('સાધુ', 'saadhu', 'monk', 'ુ'), W('વસ્તુ', 'vastu', 'thing', 'ુ'), W('વાયુ', 'vaayu', 'wind, air', 'ુ')] },
        { title: 'A note on old spellings',
          body: '<p>Older Gujarati books wrote the neuter ending with a long ૂ, as in <b>સારૂં</b>. Today’s standard is the short ુ with the dot: <b>સારું</b>. If you see the older form in a family book, you now know why.</p>',
          rows: [W('સારૂં', 'saarun', 'old spelling'), W('સારું', 'saarun', 'today’s spelling')] }
      ],
      quiz: [
        Q('ટોપી (cap) ends in which sign?', ['Long ી', 'Short િ'], 0, 'Everyday words end in the long ી.'),
        S('kavi', 'poet', 'કવિ', ['કવી'], 'Sanskrit-origin words like કવિ, રવિ, પતિ and ગતિ keep the short િ.'),
        S('paaNee', 'water', 'પાણી', ['પાણિ'], 'Everyday words end in the long ી.'),
        Q('Which ending marks a neuter word, like છોકરું?', ['કું', 'કો', 'કી'], 0, 'ું (short ુ plus the dot) is the neuter ending. ો is masculine, ી is feminine.', { gu: true }),
        Q('છોકરી means…', ['girl', 'boy', 'child'], 0, 'ી = feminine, so છોકરી is a girl.'),
        Q('ઘર (home) is neuter: ઘર સારું છે. Which form of “good” goes with it?', ['સારું', 'સારો', 'સારી'], 0, 'Neuter words take ું, so સારું.', { gu: true }),
        S('guru', 'teacher', 'ગુરુ', ['ગુરૂ'], 'Sanskrit-origin words ending in u use the short ુ: ગુરુ, સાધુ, વસ્તુ.'),
        S('chaavee', 'key', 'ચાવી', ['ચાવિ'], 'An everyday word, so the long ી at the end.')
      ]
    },
    {
      id: 15, after: 14, title: 'Short or long in the middle',
      blurb: 'No single rule works here, so learn the word families.',
      cards: [
        { title: 'There is no rule that always works',
          body: '<p>Inside a word, the choice between short and long is not predictable. Even people who write Gujarati every day check a dictionary now and then.</p><p>So we learn <b>word families</b>: groups of common words that share a vowel. You have been saying these words all your life. Now you just need to see them often. The <b>Spelling Check</b> game in Practice is built for exactly this.</p>' },
        { title: 'Long ી family',
          body: '<p>Common words with the long ી in the middle.</p>',
          rows: [W('ગીત', 'geet', 'song', 'ી'), W('જીવ', 'jeev', 'life, soul', 'ી'), W('ખીર', 'kheer', 'rice pudding', 'ી'), W('દીવો', 'deevo', 'lamp', 'ી'), W('કીડી', 'keeDee', 'ant', 'ી'), W('સીડી', 'seeDee', 'stairs', 'ી'), W('પીળું', 'peeLun', 'yellow', 'ી'), W('લીલું', 'leelun', 'green', 'ી'), W('નીચે', 'neeche', 'below', 'ી')] },
        { title: 'Short િ family',
          body: '<p>Common words with the short િ in the middle.</p>',
          rows: [W('દિવસ', 'divas', 'day', 'િ'), W('પિતા', 'pitaa', 'father', 'િ'), W('કિરણ', 'kiraN', 'ray of light', 'િ'), W('શિક્ષક', 'shikShak', 'teacher', 'િ'), W('મિત્ર', 'mitra', 'friend', 'િ'), W('વિચાર', 'vichaar', 'thought', 'િ'), W('નિશાળ', 'nishaaL', 'school', 'િ'), W('ચિત્ર', 'chitra', 'picture', 'િ')] },
        { title: 'Long ૂ family',
          body: '<p>Common words with the long ૂ.</p>',
          rows: [W('દૂધ', 'doodh', 'milk', 'ૂ'), W('ફૂલ', 'phool', 'flower', 'ૂ'), W('ભૂલ', 'bhool', 'mistake', 'ૂ'), W('કૂવો', 'koovo', 'well', 'ૂ'), W('સૂરજ', 'sooraj', 'sun', 'ૂ'), W('ખૂબ', 'khoob', 'very', 'ૂ'), W('મૂળ', 'mooL', 'root', 'ૂ')] },
        { title: 'Short ુ family',
          body: '<p>Common words with the short ુ.</p>',
          rows: [W('ગુલાબ', 'gulaab', 'rose', 'ુ'), W('ગુણ', 'guN', 'quality', 'ુ'), W('પુસ્તક', 'pustak', 'book', 'ુ'), W('સુંદર', 'sundar', 'beautiful', 'ુ'), W('દુકાન', 'dukaan', 'shop', 'ુ'), W('મુખ', 'mukh', 'face', 'ુ'), W('ગુજરાત', 'gujaraat', 'Gujarat', 'ુ')] },
        { title: 'How to make them stick',
          body: '<ul><li><b>Learn in families.</b> Read each list aloud, looking at the vowel.</li><li><b>Write the word</b> three times on the Writing Pad. Your hand remembers.</li><li><b>Play Spelling Check</b> often. Short bursts beat one long session.</li><li><b>Sanskrit words</b> keep their Sanskrit spelling. Everyday words you simply memorize.</li></ul>' }
      ],
      quiz: [
        S('geet', 'song', 'ગીત', ['ગિત'], 'ગીત is in the long ી family.'),
        S('divas', 'day', 'દિવસ', ['દીવસ'], 'દિવસ is in the short િ family.'),
        S('phool', 'flower', 'ફૂલ', ['ફુલ'], 'ફૂલ is in the long ૂ family.'),
        S('gulaab', 'rose', 'ગુલાબ', ['ગૂલાબ'], 'ગુલાબ is in the short ુ family.'),
        S('keeDee', 'ant', 'કીડી', ['કિડી'], 'કીડી has the long ી, like સીડી.'),
        S('pitaa', 'father', 'પિતા', ['પીતા'], 'પિતા has the short િ.'),
        S('bhool', 'mistake', 'ભૂલ', ['ભુલ'], 'ભૂલ has the long ૂ.'),
        S('sundar', 'beautiful', 'સુંદર', ['સૂંદર'], 'સુંદર has the short ુ.'),
        Q('Is there one rule that tells you short or long in the middle of a word?', ['No. Learn the word families and keep practicing Spelling Check', 'Yes. It is always short in the middle'], 0, 'Correct. This is the one part you learn by seeing words again and again.')
      ]
    },
    {
      id: 16, after: 15, title: 'The dot ં: what it does',
      blurb: 'One small dot that adds a nasal hum. Where it sits, and how to read it.',
      cards: [
        { title: 'One dot, one job',
          body: '<p>The dot ં is called <b>અનુસ્વાર</b> (anusvaar). Its job is to add a soft <b>nasal hum</b> right <i>after</i> the vowel. Think of it as a note that says: “hum here”.</p><p>You already say these words perfectly. Now see where the hum is written.</p>',
          rows: [W('પતંગ', 'patang', 'kite', 'ં'), W('ઊંટ', 'oonT', 'camel', 'ં'), W('ઈંટ', 'eenT', 'brick', 'ં'), W('સંત', 'sant', 'saint', 'ં'), W('કંકુ', 'kanku', 'vermilion powder', 'ં')] },
        { title: 'Where it sits',
          body: '<p>The dot goes <b>on top, toward the right</b> of the letter and its vowel sign. Write the letter and its sign first, and add the dot last.</p>',
          rows: [W('કં', 'kan', 'ક + ં'), W('કાં', 'kaan', 'કા + ં'), W('કિં', 'kin', 'કિ + ં'), W('કીં', 'keen', 'કી + ં'), W('કું', 'kun', 'કુ + ં'), W('કૂં', 'koon', 'કૂ + ં')] },
        { title: 'It joins every vowel sign',
          body: '<p>The same dot sits on top of the e, ai, o and au signs too. The sign is said first, then the hum.</p>',
          rows: [W('કેં', 'ken', 'કે + ં'), W('કૈં', 'kain', 'કૈ + ં'), W('કોં', 'kon', 'કો + ં'), W('કૌં', 'kaun', 'કૌ + ં')] },
        { title: 'On standalone vowels, too',
          body: '<p>At the start of a word, the dot goes on the vowel letter itself.</p>',
          rows: [W('અંદર', 'andar', 'inside', 'ં'), W('અંત', 'ant', 'end', 'ં'), W('ઊંડું', 'oonDun', 'deep', 'ં'), W('ઈંટ', 'eenT', 'brick', 'ં')] },
        { title: 'Not a full stop',
          body: '<p>Gujarati also has a full stop, written as a normal period at the end of a sentence. The dot ં is different: it is <b>part of the word</b>, sits on top of a letter, and changes how you say it. Leave it out and you change the word: <b>કાન</b> (ear) is not <b>કાં</b>.</p>',
          rows: [W('કાન', 'kaan', 'ear'), W('કાં', 'kaan', 'or (as in કાં…કાં)')] }
      ],
      quiz: [
        Q('What is the dot ં called?', ['અનુસ્વાર (anusvaar)', 'વિસર્ગ (visarga)', 'વિરામ (virama)'], 0, 'The dot is the અનુસ્વાર.'),
        Q('What does the dot add to a sound?', ['A soft nasal hum after the vowel', 'A puff of breath', 'A silent letter'], 0, 'It adds a nasal hum right after the vowel.'),
        Q('Where does the dot go?', ['On top, toward the right', 'Below the letter', 'Before the letter'], 0, 'On top, toward the right. Write the letter and its sign first, then the dot.'),
        Q('Read it: કાં', ['kaan', 'kee', 'ko'], 0, 'કા says kaa, and the dot adds the hum: kaan.', { big: 'કાં' }),
        Q('Read it: કું', ['kun', 'koo', 'kan'], 0, 'કુ says ku, and the dot adds the hum: kun.', { big: 'કું' }),
        Q('Read it: કીં', ['keen', 'kin', 'kaan'], 0, 'કી says kee, and the dot adds the hum: keen.', { big: 'કીં' }),
        Q('Read it: કોં', ['kon', 'kaun', 'kee'], 0, 'કો says ko, and the dot adds the hum: kon.', { big: 'કોં' }),
        Q('Read the word. What does it mean?', ['camel', 'brick', 'kite'], 0, 'ઊંટ is a camel. ઈંટ is a brick. પતંગ is a kite.', { big: 'ઊંટ' }),
        Q('Read the word. What does it mean?', ['inside', 'outside', 'above'], 0, 'અંદર is inside. બહાર is outside. ઉપર is above.', { big: 'અંદર' })
      ]
    },
    {
      id: 17, after: 16, title: 'The dot picks its sound',
      blurb: 'ng, n or m? The next letter decides, and you already say it right.',
      cards: [
        { title: 'One dot, five sounds',
          body: '<p>Say <b>પતંગ</b>: your mouth says “ng”. Say <b>સંત</b>: “n”. Say <b>ચંપલ</b>: “m”. It is the same dot every time.</p><p>The dot quietly picks the right hum from the <b>letter that comes after it</b>. When you speak, you never think about it. When you write, it means one useful thing: <b>if you hear a nasal sound before a consonant, write the dot.</b></p><p class="small">(In this app’s hints the dot is always written “n”. The notes below show what your mouth actually does.)</p>' },
        { title: 'Before ક ખ ગ ઘ: “ng”',
          body: '<p>The throat-sound letters bring an <b>ng</b> hum, as in “song”.</p>',
          rows: [W('પતંગ', 'patang', 'kite', 'ં', 'ng'), W('રંગ', 'rang', 'colour', 'ં', 'ng'), W('અંગ', 'ang', 'body part', 'ં', 'ng'), W('બંગલો', 'bangalo', 'bungalow', 'ં', 'ng')] },
        { title: 'Before ચ છ જ ઝ: “n” as in “inch”',
          body: '<p>The letters said with the middle of the tongue bring an <b>n</b> that touches the roof of your mouth, as in “inch”.</p>',
          rows: [W('પંચ', 'panch', 'five; a group', 'ં', 'n as in inch'), W('વાંચ', 'vaanch', 'read!', 'ં', 'n as in inch'), W('ઝાંઝર', 'jhaanjhar', 'anklet', 'ં', 'n as in inch')] },
        { title: 'Before ટ ઠ ડ ઢ: the curled-tongue N',
          body: '<p>The curled-tongue letters bring a curled-tongue <b>N</b>, the same tongue position as ણ.</p>',
          rows: [W('ઊંટ', 'oonT', 'camel', 'ં', 'curled N'), W('ઘંટ', 'ghanT', 'bell', 'ં', 'curled N'), W('ઠંડી', 'ThanDee', 'cold', 'ં', 'curled N'), W('ઊંડું', 'oonDun', 'deep', 'ં', 'curled N')] },
        { title: 'Before ત થ દ ધ: “n” at the teeth',
          body: '<p>The teeth letters bring a plain <b>n</b>, with the tongue at the teeth.</p>',
          rows: [W('સંત', 'sant', 'saint', 'ં', 'n at the teeth'), W('અંત', 'ant', 'end', 'ં', 'n at the teeth'), W('ચાંદો', 'chaando', 'moon', 'ં', 'n at the teeth'), W('બંધ', 'bandh', 'closed', 'ં', 'n at the teeth'), W('ગંધ', 'gandh', 'smell', 'ં', 'n at the teeth')] },
        { title: 'Before પ ફ બ ભ: “m”',
          body: '<p>The lip letters bring an <b>m</b>. This is the one that surprises people, because you hear an “m” but write a dot.</p>',
          rows: [W('ચંપલ', 'champal', 'sandal', 'ં', 'sounds like m'), W('કંપની', 'kampanee', 'company', 'ં', 'sounds like m'), W('સંભાળ', 'sambhaaL', 'care', 'ં', 'sounds like m'), W('કુટુંબ', 'kuTumb', 'family', 'ં', 'sounds like m')] }
      ],
      quiz: [
        Q('What decides how the dot sounds?', ['The letter that comes AFTER it', 'The letter before it', 'The length of the word'], 0, 'The next letter decides: ng, n or m.'),
        Q('In પતંગ, the dot sounds like…', ['ng', 'm', 'n at the teeth'], 0, 'ક ખ ગ ઘ bring an ng hum.'),
        Q('In ચંપલ, the dot sounds like…', ['m', 'ng', 'n at the teeth'], 0, 'પ ફ બ ભ bring an m hum, so you say champal.'),
        Q('In સંત, the dot sounds like…', ['n at the teeth', 'm', 'ng'], 0, 'ત થ દ ધ bring a plain n.'),
        Q('In ઠંડી, the dot sounds like…', ['a curled-tongue N', 'm', 'ng'], 0, 'ટ ઠ ડ ઢ bring the curled-tongue N.'),
        Q('Which letters bring the “m” hum?', ['પ ફ બ ભ', 'ક ખ ગ ઘ', 'ત થ દ ધ'], 0, 'The lip letters પ ફ બ ભ.', { gu: true }),
        S('rang', 'colour', 'રંગ', ['રન્ગ'], 'Write the dot, not a full ન, even though you hear a hum.'),
        S('bandh', 'closed', 'બંધ', ['બન્ધ'], 'Modern spelling uses the dot: બંધ.'),
        Q('You hear an n, m or ng before a consonant. What do you usually write?', ['The dot ં', 'A full ન or મ'], 0, 'The dot. It covers all of them.')
      ]
    },
    {
      id: 18, after: 17, title: 'The dot at the end: હું, તું, ત્યાં',
      blurb: 'When no consonant follows, the vowel itself goes nasal.',
      cards: [
        { title: 'When nothing follows the dot',
          body: '<p>At the end of a word there is no next letter, so there is no n, m or ng. Instead the <b>vowel itself goes nasal</b>, as if you said it through your nose. In this app’s hints it is written “n”, but you say it softly.</p><p>These are some of the most common words in Gujarati.</p>',
          rows: [W('હું', 'hun', 'I', 'ં'), W('તું', 'tun', 'you (informal)', 'ં'), W('ક્યાં', 'kyaan', 'where', 'ં'), W('ત્યાં', 'tyaan', 'there', 'ં'), W('અહીં', 'aheen', 'here', 'ં'), W('નહીં', 'naheen', 'not', 'ં'), W('મોં', 'mon', 'mouth', 'ં')] },
        { title: 'The neuter ending ું',
          body: '<p>Neuter words end in <b>ું</b>: a short ુ plus the dot. You will see this ending all day: <b>મારું</b> (my), <b>તમારું</b> (your), <b>સારું</b> (good), <b>નવું</b> (new).</p>',
          rows: [W('મારું', 'maarun', 'my (neuter)', 'ું'), W('તમારું', 'tamaarun', 'your (neuter)', 'ું'), W('સારું', 'saarun', 'good (neuter)', 'ું'), W('નવું', 'navun', 'new (neuter)', 'ું'), W('ઘરનું', 'gharnun', 'of the home', 'ું')] },
        { title: 'The ending ાં',
          body: '<p><b>ાં</b> (the aa sign plus the dot) has two jobs. It marks the <b>plural of neuter words</b>, and it means <b>“in”</b> when it is attached to a noun.</p>',
          rows: [W('મારાં', 'maaraan', 'my (plural neuter)', 'ાં'), W('સારાં', 'saaraan', 'good (plural neuter)', 'ાં'), W('ઘરમાં', 'gharmaan', 'in the home', 'ાં'), W('શહેરમાં', 'shahermaan', 'in the city', 'ાં')] },
        { title: 'Dropping the dot changes the word',
          body: '<p>The dot at the end often carries the whole meaning. Compare:</p>',
          rows: [W('હું', 'hun', 'I'), W('હુ', 'hu', 'incomplete: the dot is missing'), W('ત્યાં', 'tyaan', 'there'), W('ત્યા', 'tyaa', 'incomplete: the dot is missing'), W('મારું', 'maarun', 'my'), W('મારુ', 'maaru', 'incomplete: the dot is missing')] }
      ],
      quiz: [
        Q('Read it: હું', ['hun (I)', 'hu', 'ho'], 0, 'હું = I.', { big: 'હું' }),
        Q('ક્યાં means…', ['where', 'here', 'there'], 0, 'ક્યાં = where. ત્યાં = there. અહીં = here.', { big: 'ક્યાં' }),
        Q('અહીં means…', ['here', 'there', 'where'], 0, 'અહીં = here.', { big: 'અહીં' }),
        Q('ત્યાં means…', ['there', 'here', 'where'], 0, 'ત્યાં = there.', { big: 'ત્યાં' }),
        Q('Which ending marks a neuter word, like સારું?', ['કું', 'કો', 'કી'], 0, 'The neuter ending is ું.', { gu: true }),
        S('maarun', 'my', 'મારું', ['મારુ'], 'Do not forget the dot: મારું.'),
        S('gharmaan', 'in the home', 'ઘરમાં', ['ઘરમા'], 'The dot on ાં makes it “in”: ઘરમાં.'),
        Q('Which one is the plural of સારું (good)?', ['સારાં', 'સારી', 'સારો'], 0, 'Neuter plural takes ાં: સારાં.', { gu: true })
      ]
    },
    {
      id: 19, after: 18, title: 'Dot or ન? Plus ઁ and ઃ',
      blurb: 'When to write the dot, the few exceptions, and two rare marks.',
      cards: [
        { title: 'The main spelling rule',
          body: '<p>Even though you hear an n, m or ng, you almost always <b>write the dot</b>:</p><ul><li>સંત, not <s>સન્ત</s></li><li>ચંપલ, not <s>ચમ્પલ</s></li><li>પતંગ, not <s>પતન્ગ</s></li></ul><p>Older books often wrote the full letter with a joiner (સન્ત, સમ્બન્ધ). Today’s standard is the dot, so use it.</p>',
          rows: [W('સંત', 'sant', 'saint', 'ં'), W('ચંપલ', 'champal', 'sandal', 'ં'), W('પતંગ', 'patang', 'kite', 'ં'), W('સુંદર', 'sundar', 'beautiful', 'ં')] },
        { title: 'The exceptions: real ન્ and મ્',
          body: '<p>A few words keep a full ન્ or મ્, usually when the nasal is <b>doubled</b> or is part of a joined letter. You learn these as words. The joiner ્ is the one from lesson 11.</p>',
          rows: [W('અન્ન', 'anna', 'food grain'), W('કન્યા', 'kanyaa', 'girl'), W('ધન્ય', 'dhanya', 'blessed, grateful'), W('સમ્મતિ', 'sammati', 'consent')] },
        { title: 'The moon-dot ઁ',
          body: '<p><b>ઁ</b> (ચંદ્રબિંદુ, “moon-dot”) is a dot inside a little cup. It also means a soft nasal sound, just gentler. In today’s Gujarati the ordinary dot has taken over almost everywhere.</p><p>Recognize it, but do not worry about writing it.</p>',
          rows: [W('કઁ', 'kan', 'moon-dot on ક (rare)'), W('કં', 'kan', 'the ordinary dot (everyday)')] },
        { title: 'The two dots ઃ',
          body: '<p><b>ઃ</b> (વિસર્ગ, visarga) looks like a colon after a letter. It adds a tiny breath of “h”. It appears almost only in <b>Sanskrit words</b>, and the most common one is <b>દુઃખ</b>.</p>',
          rows: [W('દુઃખ', 'dukh', 'sorrow', 'ઃ'), W('પુનઃ', 'punah', 'again', 'ઃ'), W('પ્રાતઃ', 'praatah', 'morning (in Sanskrit words)', 'ઃ')] },
        { title: 'Cheat sheet',
          body: '<ul><li><b>ં</b> the dot. Everyday. A nasal hum, and it picks ng, n or m from the next letter.</li><li><b>ઁ</b> the moon-dot. Rare. A gentler nasal.</li><li><b>ઃ</b> two dots. Sanskrit words. A tiny breath of h.</li><li><b>્</b> the joiner. Cancels the built-in “a” so letters can join.</li></ul>' }
      ],
      quiz: [
        S('sant', 'saint', 'સંત', ['સન્ત'], 'Modern spelling uses the dot.'),
        S('sundar', 'beautiful', 'સુંદર', ['સુન્દર'], 'Use the dot: સુંદર.'),
        S('anna', 'food grain', 'અન્ન', ['અંન'], 'A doubled nasal is written as joined letters, not a dot.'),
        S('kanyaa', 'girl', 'કન્યા', ['કંયા'], 'કન્યા is one of the few words that keeps a full ન્.'),
        S('dukh', 'sorrow', 'દુઃખ', ['દુખ'], 'દુઃખ keeps its visarga.'),
        Q('Which mark is the moon-dot?', ['કઁ', 'કં', 'કઃ'], 0, 'ઁ is the moon-dot. ં is the ordinary dot. ઃ is the visarga.', { gu: true }),
        Q('Which of these three do you meet most in everyday Gujarati?', ['ં the dot', 'ઁ the moon-dot', 'ઃ the visarga'], 0, 'The ordinary dot is everywhere. The other two are rare.'),
        Q('ઃ in દુઃખ adds…', ['a tiny breath of h (Sanskrit words)', 'an n sound', 'nothing, it is decoration'], 0, 'The visarga adds a little breath, and you read દુઃખ as dukh.')
      ]
    },
    {
      id: 20, after: 19, title: 'Putting it all together',
      blurb: 'Read words and short sentences using everything from Part 2.',
      cards: [
        { title: 'Read these: the dot',
          body: '<p>Read each word out loud first, then check the hint.</p>',
          rows: [W('રંગ', 'rang', 'colour'), W('પંચ', 'panch', 'five; a group'), W('ઠંડી', 'ThanDee', 'cold'), W('ઘંટ', 'ghanT', 'bell'), W('ચાંદો', 'chaando', 'moon'), W('ચંપલ', 'champal', 'sandal'), W('અંદર', 'andar', 'inside')] },
        { title: 'Read these: endings and vowel length',
          body: '<p>Look at the last vowel and the middle vowel of each.</p>',
          rows: [W('છોકરી', 'chhokaree', 'girl'), W('સારું', 'saarun', 'good'), W('નવું', 'navun', 'new'), W('કવિ', 'kavi', 'poet'), W('દૂધ', 'doodh', 'milk'), W('દિવસ', 'divas', 'day'), W('ગીત', 'geet', 'song')] },
        { title: 'Read these: short sentences',
          body: '<p>Now whole sentences. <b>છું</b> means “am” and <b>છે</b> means “is”.</p>',
          rows: [W('હું ઘરમાં છું.', 'hun gharmaan chhun', 'I am in the home.'), W('તું ક્યાં છે?', 'tun kyaan chhe?', 'Where are you?'), W('પાણી ઠંડું છે.', 'paaNee ThanDun chhe.', 'The water is cold.'), W('દૂધ ગરમ છે.', 'doodh garam chhe.', 'The milk is hot.'), W('અહીં આવો.', 'aheen aavo.', 'Come here.')] }
      ],
      quiz: [
        Q('Read it. What does it say?', ['I am in the home.', 'Where is the home?', 'You are outside.'], 0, 'હું = I, ઘરમાં = in the home, છું = am.', { big: 'હું ઘરમાં છું.' }),
        Q('Read it. What does it say?', ['Where are you?', 'Who are you?', 'You are here.'], 0, 'તું = you, ક્યાં = where, છે = is.', { big: 'તું ક્યાં છે?' }),
        Q('Read it. What does it say?', ['The water is cold.', 'The water is hot.', 'The milk is cold.'], 0, 'પાણી = water, ઠંડું = cold.', { big: 'પાણી ઠંડું છે.' }),
        Q('Read it. What does it say?', ['Come here.', 'Go there.', 'Come inside.'], 0, 'અહીં = here, આવો = come.', { big: 'અહીં આવો.' }),
        S('divas', 'day', 'દિવસ', ['દીવસ'], 'Short િ family.'),
        S('doodh', 'milk', 'દૂધ', ['દુધ'], 'Long ૂ family.'),
        S('chaando', 'moon', 'ચાંદો', ['ચાન્દો'], 'Write the dot.'),
        S('navun', 'new', 'નવું', ['નવુ'], 'Neuter ending: short ુ plus the dot.'),
        Q('Which letters bring the “m” hum before the dot?', ['પ ફ બ ભ', 'ક ખ ગ ઘ', 'ટ ઠ ડ ઢ'], 0, 'The lip letters પ ફ બ ભ.', { gu: true }),
        Q('Which is the long ee sign?', ['કી', 'કિ'], 0, 'કી is long. કિ is short.', { gu: true })
      ]
    }
  );
  GL.lessons.forEach(function (l) { if (!l.items) l.items = []; });   // explainer lessons teach no letters
})();
