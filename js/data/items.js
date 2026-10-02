/*
 * ગુજરાતી Play — letter content.
 *
 * To add content later:
 *   1. Add an item to GL.items (glyph, kind, roman, example word).
 *   2. Add its id to a lesson's `items` list in lessons.js (or add a new lesson).
 *   3. Add example words to words.js — they unlock automatically once every
 *      letter/sign in them has been taught.
 *   4. Run `node tests/validate-data.js` to check everything is consistent.
 *
 * Transliteration (see "Sound guide" in the app):
 *   - Consonants carry an inherent short "a":  ક = ka.
 *   - Capital letters (T Th D Dh N L Sh) mark "tongue curled back" sounds.
 *   - Short ઇ/ઉ are written i/u, long ઈ/ઊ are written ee/oo. Modern Gujarati
 *     pronounces them alike; the difference is in spelling.
 *   - ં is written n.
 * Sources: Wikipedia "Gujarati alphabet" and "Gujarati phonology".
 */
window.GL = window.GL || {};

GL.items = [
  /* ---------- Consonants (વ્યંજન) ---------- */
  { id: 'ક', kind: 'consonant', roman: 'ka', tip: 'A plain k, without a puff of air.', word: { gu: 'કલમ', roman: 'kalam', en: 'pen', hl: 'ક' } },
  { id: 'ખ', kind: 'consonant', roman: 'kha', tip: 'Like ક, but with a puff of breath after it.', word: { gu: 'ખમણ', roman: 'khamaN', en: 'khaman (snack)', hl: 'ખ' } },
  { id: 'ગ', kind: 'consonant', roman: 'ga', tip: 'A plain g.', word: { gu: 'ગામ', roman: 'gaam', en: 'village', hl: 'ગ' } },
  { id: 'ઘ', kind: 'consonant', roman: 'gha', tip: 'Like ગ, with a breathy puff after it.', word: { gu: 'ઘર', roman: 'ghar', en: 'home', hl: 'ઘ' } },
  { id: 'ચ', kind: 'consonant', roman: 'cha', tip: 'The "ch" of ચા, with no extra puff.', word: { gu: 'ચા', roman: 'chaa', en: 'tea', hl: 'ચ' } },
  { id: 'છ', kind: 'consonant', roman: 'chha', tip: 'Like ચ, with a puff of breath. It is the number six, too!', word: { gu: 'છત્રી', roman: 'chhatree', en: 'umbrella', hl: 'છ' } },
  { id: 'જ', kind: 'consonant', roman: 'ja', tip: 'A plain j.', word: { gu: 'જમીન', roman: 'jameen', en: 'land, ground', hl: 'જ' } },
  { id: 'ઝ', kind: 'consonant', roman: 'jha', tip: 'Like જ, with a breathy puff after it.', word: { gu: 'ઝાડ', roman: 'jhaaD', en: 'tree', hl: 'ઝ' } },
  { id: 'ટ', kind: 'consonant', roman: 'Ta', tip: 'Tongue tip curls back to touch the roof of your mouth. Capital T reminds you.', word: { gu: 'ટોપી', roman: 'Topee', en: 'cap, hat', hl: 'ટ' } },
  { id: 'ઠ', kind: 'consonant', roman: 'Tha', tip: 'Like ટ (tongue curled back), with a puff of breath.', word: { gu: 'ઠંડી', roman: 'ThanDee', en: 'cold (weather)', hl: 'ઠ' } },
  { id: 'ડ', kind: 'consonant', roman: 'Da', tip: 'Tongue tip curled back, a voiced d.', word: { gu: 'ડર', roman: 'Dar', en: 'fear', hl: 'ડ' } },
  { id: 'ઢ', kind: 'consonant', roman: 'Dha', tip: 'Like ડ (tongue curled back), with a breathy puff.', word: { gu: 'ઢોલ', roman: 'Dhol', en: 'drum', hl: 'ઢ' } },
  { id: 'ણ', kind: 'consonant', roman: 'Na', tip: 'An n with the tongue tip curled back. It sits in words like પાણી.', word: { gu: 'પાણી', roman: 'paaNee', en: 'water', hl: 'ણ' } },
  { id: 'ત', kind: 'consonant', roman: 'ta', tip: 'Soft t: the tongue touches the back of your teeth.', word: { gu: 'તન', roman: 'tan', en: 'body', hl: 'ત' } },
  { id: 'થ', kind: 'consonant', roman: 'tha', tip: 'Like ત (tongue at the teeth), with a puff of breath.', word: { gu: 'થાક', roman: 'thaak', en: 'tiredness', hl: 'થ' } },
  { id: 'દ', kind: 'consonant', roman: 'da', tip: 'Soft d: the tongue touches the back of your teeth.', word: { gu: 'દિવસ', roman: 'divas', en: 'day', hl: 'દ' } },
  { id: 'ધ', kind: 'consonant', roman: 'dha', tip: 'Like દ (tongue at the teeth), with a breathy puff.', word: { gu: 'ધન', roman: 'dhan', en: 'wealth', hl: 'ધ' } },
  { id: 'ન', kind: 'consonant', roman: 'na', tip: 'A plain n.', word: { gu: 'નળ', roman: 'naL', en: 'tap, faucet', hl: 'ન' } },
  { id: 'પ', kind: 'consonant', roman: 'pa', tip: 'A plain p, without a puff of air.', word: { gu: 'પગ', roman: 'pag', en: 'foot, leg', hl: 'પ' } },
  { id: 'ફ', kind: 'consonant', roman: 'pha', tip: 'Officially a puffed p, but many people say it as "f", as in ફૂલ.', word: { gu: 'ફૂલ', roman: 'phool', en: 'flower', hl: 'ફ' } },
  { id: 'બ', kind: 'consonant', roman: 'ba', tip: 'A plain b.', word: { gu: 'બજાર', roman: 'bajaar', en: 'market', hl: 'બ' } },
  { id: 'ભ', kind: 'consonant', roman: 'bha', tip: 'Like બ, with a breathy puff after it.', word: { gu: 'ભાત', roman: 'bhaat', en: 'rice', hl: 'ભ' } },
  { id: 'મ', kind: 'consonant', roman: 'ma', tip: 'A plain m.', word: { gu: 'મન', roman: 'man', en: 'mind, heart', hl: 'મ' } },
  { id: 'ય', kind: 'consonant', roman: 'ya', tip: 'A y sound, as in સમય.', word: { gu: 'સમય', roman: 'samay', en: 'time', hl: 'ય' } },
  { id: 'ર', kind: 'consonant', roman: 'ra', tip: 'A tapped r, as in રસ.', word: { gu: 'રસ', roman: 'ras', en: 'juice', hl: 'ર' } },
  { id: 'લ', kind: 'consonant', roman: 'la', tip: 'A plain l.', word: { gu: 'લસણ', roman: 'lasaN', en: 'garlic', hl: 'લ' } },
  { id: 'વ', kind: 'consonant', roman: 'va', tip: 'Between v and w, as in વન.', word: { gu: 'વન', roman: 'van', en: 'forest', hl: 'વ' } },
  { id: 'શ', kind: 'consonant', roman: 'sha', tip: 'The "sh" of શાળા.', word: { gu: 'શાળા', roman: 'shaaLaa', en: 'school', hl: 'શ' } },
  { id: 'ષ', kind: 'consonant', roman: 'Sha', tip: 'Spelled differently from શ, but usually said the same way (sh). Mostly found in words from Sanskrit.', word: { gu: 'ભાષા', roman: 'bhaaShaa', en: 'language', hl: 'ષ' } },
  { id: 'સ', kind: 'consonant', roman: 'sa', tip: 'A plain s.', word: { gu: 'સરસ', roman: 'saras', en: 'nice, lovely', hl: 'સ' } },
  { id: 'હ', kind: 'consonant', roman: 'ha', tip: 'A plain h.', word: { gu: 'હવા', roman: 'havaa', en: 'air, wind', hl: 'હ' } },
  { id: 'ળ', kind: 'consonant', roman: 'La', tip: 'A curled-back l, never at the start of a word. Capital L reminds you.', word: { gu: 'કમળ', roman: 'kamaL', en: 'lotus', hl: 'ળ' } },

  /* ---------- Joined consonants (સંયુક્તાક્ષર) ---------- */
  { id: 'ક્ષ', kind: 'conjunct', roman: 'ksha', tip: 'ક + ષ joined into one shape. Sounds like "ksh".', word: { gu: 'શિક્ષક', roman: 'shikShak', en: 'teacher', hl: 'ક્ષ' } },
  { id: 'જ્ઞ', kind: 'conjunct', roman: 'gna', tip: 'જ + ઞ joined into one shape. Said "gn", as in જ્ઞાન.', word: { gu: 'જ્ઞાન', roman: 'gnaan', en: 'knowledge', hl: 'જ્ઞ' } },
  { id: 'ત્ર', kind: 'conjunct', roman: 'tra', tip: 'ત + ર joined: tra.', word: { gu: 'મિત્ર', roman: 'mitra', en: 'friend', hl: 'ત્ર' } },
  { id: 'સ્ત', kind: 'conjunct', roman: 'sta', tip: 'સ + ત joined: sta.', word: { gu: 'રસ્તો', roman: 'rasto', en: 'road', hl: 'સ્ત' } },
  { id: 'પ્ર', kind: 'conjunct', roman: 'pra', tip: 'પ + ર joined: pra.', word: { gu: 'પ્રેમ', roman: 'prem', en: 'love', hl: 'પ્ર' } },
  { id: 'શ્ર', kind: 'conjunct', roman: 'shra', tip: 'શ + ર joined: shra.', word: { gu: 'શ્રી', roman: 'shree', en: 'Shri (respectful title)', hl: 'શ્ર' } },
  { id: 'સ્વ', kind: 'conjunct', roman: 'sva', tip: 'સ + વ joined: sva.', word: { gu: 'સ્વાદ', roman: 'svaad', en: 'taste', hl: 'સ્વ' } },

  /* ---------- Independent vowels (સ્વર) ---------- */
  { id: 'અ', kind: 'vowel', roman: 'a', tip: 'A short, relaxed "a" — the same sound that is hiding inside ક, મ, ન…', word: { gu: 'અમે', roman: 'ame', en: 'we', hl: 'અ' } },
  { id: 'આ', kind: 'vowel', roman: 'aa', tip: 'A long, open "aa".', word: { gu: 'આજ', roman: 'aaj', en: 'today', hl: 'આ' } },
  { id: 'ઇ', kind: 'vowel', roman: 'i', tip: 'The short-ઇ spelling. It sounds just like ઈ in modern Gujarati.', word: { gu: 'ઇચ્છા', roman: 'ichchhaa', en: 'wish, desire', hl: 'ઇ' } },
  { id: 'ઈ', kind: 'vowel', roman: 'ee', tip: 'The long-ઈ spelling. Sounds just like ઇ in speech; only the spelling differs.', word: { gu: 'ઈશ્વર', roman: 'eeshvar', en: 'God', hl: 'ઈ' } },
  { id: 'ઉ', kind: 'vowel', roman: 'u', tip: 'The short-ઉ spelling, as in ઉપર.', word: { gu: 'ઉપર', roman: 'upar', en: 'above, up', hl: 'ઉ' } },
  { id: 'ઊ', kind: 'vowel', roman: 'oo', tip: 'The long-ઊ spelling. Sounds just like ઉ in speech; only the spelling differs.', word: { gu: 'ઊંટ', roman: 'oonT', en: 'camel', hl: 'ઊ' } },
  { id: 'એ', kind: 'vowel', roman: 'e', tip: 'An "e" as in એક.', word: { gu: 'એક', roman: 'ek', en: 'one', hl: 'એ' } },
  { id: 'ઐ', kind: 'vowel', roman: 'ai', tip: 'A glide that starts like અ and ends like ઇ, as in ઐતિહાસિક.', word: { gu: 'ઐતિહાસિક', roman: 'aitihaasik', en: 'historical', hl: 'ઐ' } },
  { id: 'ઓ', kind: 'vowel', roman: 'o', tip: 'An "o" as in ઓરડો.', word: { gu: 'ઓરડો', roman: 'orDo', en: 'room', hl: 'ઓ' } },
  { id: 'ઔ', kind: 'vowel', roman: 'au', tip: 'A glide that starts like અ and ends like ઉ, as in ઔષધ.', word: { gu: 'ઔષધ', roman: 'aushadh', en: 'medicine', hl: 'ઔ' } },

  /* ---------- Vowel signs (માત્રા) — shown on ક ---------- */
  { id: 'ા', kind: 'sign', demo: 'કા', vowel: 'aa', roman: 'kaa', tip: 'The aa sign stands tall after the consonant: ક → કા.', word: { gu: 'કામ', roman: 'kaam', en: 'work', hl: 'ા' } },
  { id: 'િ', kind: 'sign', demo: 'કિ', vowel: 'i', roman: 'ki', tip: 'The short i sign sits BEFORE the consonant on the page, but you say the consonant first: ક → કિ.', word: { gu: 'પિતા', roman: 'pitaa', en: 'father', hl: 'િ' } },
  { id: 'ી', kind: 'sign', demo: 'કી', vowel: 'ee', roman: 'kee', tip: 'The long ee sign comes after the consonant: ક → કી.', word: { gu: 'પાણી', roman: 'paaNee', en: 'water', hl: 'ી' } },
  { id: 'ુ', kind: 'sign', demo: 'કુ', vowel: 'u', roman: 'ku', tip: 'The short u sign hangs below: ક → કુ.', word: { gu: 'ગુલાબ', roman: 'gulaab', en: 'rose', hl: 'ુ' } },
  { id: 'ૂ', kind: 'sign', demo: 'કૂ', vowel: 'oo', roman: 'koo', tip: 'The long oo sign hangs below with a tail: ક → કૂ.', word: { gu: 'દૂધ', roman: 'doodh', en: 'milk', hl: 'ૂ' } },
  { id: 'ે', kind: 'sign', demo: 'કે', vowel: 'e', roman: 'ke', tip: 'The e sign sits on top of the consonant: ક → કે.', word: { gu: 'કેરી', roman: 'keree', en: 'mango', hl: 'ે' } },
  { id: 'ૈ', kind: 'sign', demo: 'કૈ', vowel: 'ai', roman: 'kai', tip: 'The ai sign has two marks on top: ક → કૈ.', word: { gu: 'પૈસા', roman: 'paisaa', en: 'money', hl: 'ૈ' } },
  { id: 'ો', kind: 'sign', demo: 'કો', vowel: 'o', roman: 'ko', tip: 'The o sign is a tall stroke plus a mark on top: ક → કો.', word: { gu: 'મોર', roman: 'mor', en: 'peacock', hl: 'ો' } },
  { id: 'ૌ', kind: 'sign', demo: 'કૌ', vowel: 'au', roman: 'kau', tip: 'The au sign is a tall stroke plus two marks on top: ક → કૌ.', word: { gu: 'નૌકા', roman: 'naukaa', en: 'boat', hl: 'ૌ' } },
  { id: 'ં', kind: 'sign', demo: 'કં', vowel: null, roman: 'kan', tip: 'A dot on top adds a soft nasal hum (written n here) to the end of the sound: ક → કં.', word: { gu: 'પતંગ', roman: 'patang', en: 'kite', hl: 'ં' } },
  { id: '્', kind: 'sign', demo: 'ક્', vowel: null, roman: 'k', tip: 'The joiner (virama) cancels the inherent "a", so ક્ is just "k". It is how letters get joined: ક્ + ષ → ક્ષ.', word: { gu: 'શબ્દ', roman: 'shabd', en: 'word', hl: '્' } }
];

GL.itemById = {};
GL.items.forEach(function (it) { GL.itemById[it.id] = it; });

/* Display order for the Alphabet reference page. */
GL.groups = [
  { id: 'vowel', title: 'Vowels · સ્વર', sub: 'Used on their own, usually at the start of a word.' },
  { id: 'sign', title: 'Vowel signs · માત્રા', sub: 'Attached to a consonant to change its built-in “a”. Shown on ક.' },
  { id: 'consonant', title: 'Consonants · વ્યંજન', sub: 'Each one carries a built-in “a”.' },
  { id: 'conjunct', title: 'Joined letters · સંયુક્તાક્ષર', sub: 'Two consonants joined into one shape.' }
];

/*
 * Pairs people commonly mix up when they know the spoken language but not the spelling.
 * [a, b, note]. Used for look-alike boxes in lessons, corrective feedback, and the
 * Spelling Check game. Only pairs where BOTH letters have been taught are ever shown.
 */
GL.confusables = [
  ['ઇ', 'ઈ', 'These sound the same in modern Gujarati — the difference is only in how the word is spelled.'],
  ['ઉ', 'ઊ', 'These sound the same in modern Gujarati — the difference is only in how the word is spelled.'],
  ['િ', 'ી', 'Short and long i signs sound alike — spelling is what differs.'],
  ['ુ', 'ૂ', 'Short and long u signs sound alike — spelling is what differs.'],
  ['ન', 'ણ', 'ન is the plain n (tongue at the teeth); ણ is the curled-tongue N.'],
  ['લ', 'ળ', 'લ is the plain l; ળ is the curled-tongue L.'],
  ['સ', 'શ', 'સ says “s”; શ says “sh”.'],
  ['શ', 'ષ', 'Both usually say “sh” — you learn which one a word uses by seeing it.'],
  ['ત', 'ટ', 'ત is the soft t (teeth); ટ is the curled-tongue T.'],
  ['થ', 'ઠ', 'થ is the soft th (teeth); ઠ is the curled-tongue Th.'],
  ['દ', 'ડ', 'દ is the soft d (teeth); ડ is the curled-tongue D.'],
  ['ધ', 'ઢ', 'ધ is the soft dh (teeth); ઢ is the curled-tongue Dh.'],
  ['ક', 'ખ', 'ખ has an extra puff of breath.'],
  ['ગ', 'ઘ', 'ઘ has an extra breathy puff.'],
  ['ચ', 'છ', 'છ has an extra puff of breath.'],
  ['જ', 'ઝ', 'ઝ has an extra breathy puff.'],
  ['પ', 'ફ', 'ફ has a puff (often said as “f”).'],
  ['બ', 'ભ', 'ભ has an extra breathy puff.'],
  ['ઘ', 'ધ', 'These two look alike — look closely at the shape.'],
  ['ભ', 'મ', 'These two look alike — look closely at the shape.'],
  ['ખ', 'ષ', 'These two look alike — look closely at the shape.'],
  ['ન', 'ત', 'These two look alike — look closely at the shape.'],
  ['ે', 'ૈ', 'ે (one mark) says e; ૈ (two marks) says ai.'],
  ['ો', 'ૌ', 'ો (one mark) says o; ૌ (two marks) says au.'],
  ['એ', 'ઐ', 'એ says e; ઐ says ai.'],
  ['ઓ', 'ઔ', 'ઓ says o; ઔ says au.']
];
