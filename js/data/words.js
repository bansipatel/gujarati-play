/*
 * Simple, familiar words. Each word unlocks automatically once every letter,
 * sign and joined letter it contains has been taught (see GL.requiredIds in core.js).
 * Format: [gujarati, transliteration, english]
 * Transliteration follows everyday speech: the built-in "a" at the end of a
 * word (and often in the middle) is not pronounced, e.g. કમર = kamar.
 */
window.GL = window.GL || {};

GL.words = ([
  // consonants only (lessons 1-2)
  ['મન', 'man', 'mind, heart'], ['તન', 'tan', 'body'], ['કપ', 'kap', 'cup'], ['મત', 'mat', 'vote, opinion'],
  ['વર', 'var', 'groom'], ['રસ', 'ras', 'juice'], ['વન', 'van', 'forest'], ['નવ', 'nav', 'nine'],
  ['સરસ', 'saras', 'nice, lovely'], ['રમત', 'ramat', 'game'], ['કમર', 'kamar', 'waist'], ['કલમ', 'kalam', 'pen'],
  ['મલમ', 'malam', 'ointment'], ['પવન', 'pavan', 'wind'], ['વતન', 'vatan', 'homeland'], ['નસ', 'nas', 'vein'],
  ['કસરત', 'kasrat', 'exercise'], ['પલક', 'palak', 'eyelid'],
  // standalone vowels
  ['અમર', 'amar', 'immortal'], ['અસર', 'asar', 'effect'], ['આવ', 'aav', 'come!'], ['આપ', 'aap', 'you (respectful)'],
  ['આવક', 'aavak', 'income'], ['ઉપર', 'upar', 'above, up'], ['આસન', 'aasan', 'seat'], ['આરસ', 'aaras', 'marble'],
  ['એક', 'ek', 'one'],
  // vowel signs
  ['કામ', 'kaam', 'work'], ['નામ', 'naam', 'name'], ['રામ', 'raam', 'Ram'], ['માતા', 'maataa', 'mother'],
  ['પિતા', 'pitaa', 'father'], ['હવા', 'havaa', 'air, wind'], ['વાત', 'vaat', 'talk, story'], ['પાન', 'paan', 'betel leaf'],
  ['માપ', 'maap', 'measure'], ['સાપ', 'saap', 'snake'], ['તાર', 'taar', 'wire'], ['કાન', 'kaan', 'ear'],
  ['નાક', 'naak', 'nose'], ['વાર', 'vaar', 'day (of week)'], ['કાકા', 'kaakaa', 'uncle'], ['કાકી', 'kaakee', 'aunt'],
  ['માસી', 'maasee', 'maternal aunt'], ['નાની', 'naanee', 'maternal grandmother'], ['મામા', 'maamaa', 'maternal uncle'],
  ['સાસુ', 'saasu', 'mother-in-law'], ['નવી', 'navee', 'new (feminine)'], ['પૂરી', 'pooree', 'puri (fried bread)'],
  ['કૂવો', 'koovo', 'well'], ['સૂર', 'soor', 'tune, note'],
  ['કેમ', 'kem', 'why, how'], ['સેવ', 'sev', 'sev (crunchy snack)'], ['કેરી', 'keree', 'mango'], ['પેન', 'pen', 'pen'],
  ['મૌન', 'maun', 'silence'], ['સૌ', 'sau', 'everyone'], ['નૌકા', 'naukaa', 'boat'], ['કરો', 'karo', 'do (polite)'],
  ['આવો', 'aavo', 'come (polite)'], ['મોર', 'mor', 'peacock'], ['અમે', 'ame', 'we'], ['અને', 'ane', 'and'],
  ['તમે', 'tame', 'you (polite)'], ['હું', 'hun', 'I'], ['તું', 'tun', 'you (informal)'], ['કંકુ', 'kanku', 'vermilion powder'],
  ['સંત', 'sant', 'saint'], ['મારું', 'maarun', 'my, mine'], ['સારું', 'saarun', 'good, okay'], ['અહીં', 'aheen', 'here'],
  ['પૈસા', 'paisaa', 'money'],
  // lesson 7
  ['ઘર', 'ghar', 'home'], ['ઘી', 'ghee', 'ghee'], ['ચા', 'chaa', 'tea'], ['ચાવી', 'chaavee', 'key'],
  ['છત', 'chhat', 'roof'], ['છે', 'chhe', 'is'], ['ચાલ', 'chaal', 'come on, walk'], ['ખાસ', 'khaas', 'special'],
  ['ખેતર', 'khetar', 'field'], ['ગરમ', 'garam', 'hot'], ['ચમચી', 'chamchee', 'spoon'], ['ચકલી', 'chakalee', 'sparrow'],
  ['ખીર', 'kheer', 'rice pudding'], ['ચોર', 'chor', 'thief'], ['ગીત', 'geet', 'song'], ['ઘાસ', 'ghaas', 'grass'],
  ['છોકરો', 'chhokaro', 'boy'], ['છોકરી', 'chhokaree', 'girl'], ['છાસ', 'chhaas', 'buttermilk'], ['ગામ', 'gaam', 'village'],
  ['ખરું', 'kharun', 'true, right'],
  // lesson 8
  ['જા', 'jaa', 'go!'], ['જીવ', 'jeev', 'life, soul'], ['જવાબ', 'javaab', 'answer'], ['જાગ', 'jaag', 'wake up!'],
  ['જય', 'jay', 'victory'], ['જાપ', 'jaap', 'chanting'], ['બજાર', 'bajaar', 'market'], ['જમીન', 'jameen', 'land, ground'],
  ['બાપ', 'baap', 'father'], ['બહાર', 'bahaar', 'outside'], ['બાર', 'baar', 'twelve'], ['બસ', 'bas', 'enough; bus'],
  ['બેન', 'ben', 'sister'], ['બા', 'baa', 'grandmother'], ['ભાત', 'bhaat', 'rice'], ['ભાવ', 'bhaav', 'price; feeling'],
  ['ભજન', 'bhajan', 'devotional song'], ['ભાર', 'bhaar', 'weight'], ['ભૂલ', 'bhool', 'mistake'],
  ['ભગવાન', 'bhagavaan', 'God'], ['ભાભી', 'bhaabhee', 'brother’s wife'], ['સમય', 'samay', 'time'],
  ['ગાય', 'gaay', 'cow'], ['ભય', 'bhay', 'fear'], ['નાયક', 'naayak', 'hero, leader'],
  // lesson 9
  ['ટોપી', 'Topee', 'cap, hat'], ['ટાપુ', 'Taapu', 'island'], ['ઠંડી', 'ThanDee', 'cold (weather)'], ['ઠીક', 'Theek', 'okay'],
  ['ઠગ', 'Thag', 'cheat'], ['ડર', 'Dar', 'fear'], ['ડાબે', 'Daabe', 'on the left'], ['ઢોલ', 'Dhol', 'drum'],
  ['ઢગલો', 'Dhagalo', 'heap, pile'], ['પાણી', 'paaNee', 'water'], ['ઘણું', 'ghaNun', 'a lot, many'], ['રાણી', 'raaNee', 'queen'],
  ['રણ', 'raN', 'desert'], ['ગુણ', 'guN', 'quality, virtue'], ['ચણા', 'chaNaa', 'chickpeas'], ['પણ', 'paN', 'but'],
  ['કણ', 'kaN', 'grain, particle'], ['હરણ', 'haraN', 'deer'], ['લસણ', 'lasaN', 'garlic'], ['કિરણ', 'kiraN', 'ray of light'],
  ['ખમણ', 'khamaN', 'khaman (snack)'], ['ટાઢ', 'TaaDh', 'cold'], ['ટપાલ', 'Tapaal', 'mail, post'],
  // lesson 10
  ['થાક', 'thaak', 'tiredness'], ['થોડું', 'thoDun', 'a little'], ['દૂધ', 'doodh', 'milk'], ['દવા', 'davaa', 'medicine'],
  ['દિવસ', 'divas', 'day'], ['દર', 'dar', 'every; rate'], ['દેવ', 'dev', 'god'], ['દેશ', 'desh', 'country'],
  ['દીવો', 'deevo', 'lamp'], ['દાદા', 'daadaa', 'paternal grandfather'], ['દાદી', 'daadee', 'paternal grandmother'],
  ['ધન', 'dhan', 'wealth'], ['ધાર', 'dhaar', 'edge, stream'], ['ધીમે', 'dheeme', 'slowly'], ['ફૂલ', 'phool', 'flower'],
  ['ફોન', 'phon', 'phone'], ['શહેર', 'shaher', 'city'], ['શાક', 'shaak', 'vegetable'], ['શરમ', 'sharam', 'shyness'],
  ['શોર', 'shor', 'noise'], ['શેર', 'sher', 'lion'],
  // lesson 11
  ['ભાષા', 'bhaaShaa', 'language'], ['વર્ષ', 'varSh', 'year'], ['કમળ', 'kamaL', 'lotus'], ['થાળી', 'thaaLee', 'plate'],
  ['નળ', 'naL', 'tap, faucet'], ['ફળ', 'phaL', 'fruit'], ['જળ', 'jaL', 'water'], ['કાળું', 'kaaLun', 'black'],
  ['ઢોકળા', 'DhokaLaa', 'dhokla (snack)'], ['દાળ', 'daaL', 'lentil soup'], ['વાદળ', 'vaadaL', 'cloud'],
  ['ગોળ', 'goL', 'jaggery'], ['મેળો', 'meLo', 'fair'], ['શિક્ષક', 'shikShak', 'teacher'], ['ક્ષમા', 'kShamaa', 'forgiveness'],
  ['રક્ષા', 'rakShaa', 'protection'], ['જ્ઞાન', 'gnaan', 'knowledge'], ['દોસ્ત', 'dost', 'friend'], ['શબ્દ', 'shabd', 'word'],
  ['ત્યાં', 'tyaan', 'there'], ['ક્યાં', 'kyaan', 'where'], ['ઔષધ', 'auShadh', 'medicine (herbal)'],
  // lesson 12
  ['મિત્ર', 'mitra', 'friend'], ['રસ્તો', 'rasto', 'road'], ['પ્રેમ', 'prem', 'love'], ['શ્રી', 'shree', 'Shri (respectful title)'],
  ['સ્વાદ', 'svaad', 'taste'], ['પુસ્તક', 'pustak', 'book'], ['ત્રણ', 'traN', 'three'], ['છત્રી', 'chhatree', 'umbrella'],
  ['પત્ર', 'patra', 'letter'], ['સ્વર', 'svar', 'voice, vowel'], ['સ્ત્રી', 'stree', 'woman']
]).map(function (w) { return { gu: w[0], roman: w[1], en: w[2] }; });
