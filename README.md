# ગુજરાતી Play

A playful, no-build website for Gujarati speakers who want to learn to **read and write** the script, five minutes a day. Plain HTML, CSS and JavaScript — no frameworks, no installs.

It is designed for someone who **already speaks Gujarati well** but has only ever seen it in English letters ("Gujlish"): the sounds and meanings are familiar, so the work is connecting them to the written letters and learning the spelling.

## Publish with GitHub Pages

1. Create a GitHub repository and upload everything in this folder (keep the folder structure: `index.html`, `sw.js`, `manifest.webmanifest`, `css/`, `js/`, `icons/`, `tests/`).
2. In the repository go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then **Save**.
4. After a minute your site is live at `https://<your-username>.github.io/<repository-name>/`.

To try it locally, open `index.html` in a browser, or run `python -m http.server` in this folder and visit `http://localhost:8000`.

## How it teaches (and why)

- **Start from words you already say.** Every letter is introduced inside a familiar word, shown as *your* Gujlish ➜ the Gujarati, with the letter highlighted and the word broken into letters.
- **Written vs said.** Gujarati writes a built-in "a" that you often don't say (કમર = *kamar*). Every word breakdown marks these as **(a)** so the written form finally makes sense of what you hear.
- **Spelling is the real challenge**, so there is a dedicated **Spelling Check** game: you see the sound and meaning, then pick the right spelling from one-letter look-alikes and sound-alikes (ઇ/ઈ, ન/ણ, સ/શ/ષ, ત/ટ…). Wrong picks get a specific explanation, not just "no".
- **Look-alike boxes** in lessons put confusable letters side by side the moment the second one is taught.
- **Letters in context.** *Find It* asks you to tap the part of a real word that holds a letter; *Say It* has you read whole words; *Word Builder* has you assemble them.
- **Retrieval before reveal, mixed practice.** Lesson quizzes begin with the new letters, then interleave word reading, spelling, and review of older letters.
- **Spaced review.** Each correct answer pushes a letter's next review further out (about 10 minutes, 1, 3, 7, 14 days); misses bring it back sooner. The home page shows how many letters are ready for a refresh.
- **Fading hints.** Once most letters feel strong the app suggests switching hints to tap-to-reveal, so you move from decoding to reading.

## Look and feel

The palette comes from the "Game Instruction Loop" slides: soft pink canvas, dark phone frames with a notch (the Practice menu), and the purple-to-orange gradient. It is used with restraint: the gradient appears only on primary actions, the hero panel and the game labels. Everything else is quiet: serif headings (Fraunces), system sans text, one consistent line-icon set instead of emoji, hairline borders, and plain-spoken feedback ("Right.", "Not that one.") instead of generic cheering. Motion is switched off for people who prefer reduced motion.

## Made for iPad

- **Layout adapts to the device:** bottom tabs on phones, a left navigation rail on iPad and desktop, and two-pane lessons and quizzes in landscape (big letter on the left, details on the right).
- **Touch first:** large targets (76-96 px answer buttons on tablets), no hover-only behavior, no double-tap zoom delays, and safe-area padding for the notch and home bar.
- **Apple Pencil writing pad:** pressure-sensitive strokes, palm rejection (rest your hand while using the Pencil), smooth coalesced input, and a larger pad on iPad. Finger and mouse work too.
- **Install it:** in Safari tap Share, then "Add to Home Screen". It opens full-screen, works offline (service worker), and Safari is far less likely to clear your progress than for a normal tab.
- **Back up progress:** Settings has a one-tap backup code you can paste into Notes or email to yourself, and restore on any device. Safari can clear site data it hasn't seen in a while, so this is worth doing.

## Handwriting shape check and 0-10 grade

The writing pad has a **Check my shape** button. It gives a **grade out of 10, in 0.1 steps**, plus a verdict ("Very close" 8.5+, "Close" 7+, "Getting there" 5+, "Not close yet" below that), a small picture (what you missed in orange, stray ink in red), and a note when your drawing looks more like a different letter.

How the grade works: your drawing and the font's version of the letter are scaled to the same size (so size and position don't matter) and reduced to centerlines. For every point on one path the code finds the nearest point on the other and charges for the distance and for running at a different angle, both ways, so missing parts and extra marks both cost points. Leaving out a chunk of the letter costs extra. The raw score is then stretched onto 0-10 using measurements on simulated drawings.

I measured it on **simulated** drawings with the same font the app uses (each letter's centerline stretched, rotated, sheared and wobbled, plus drawings that are not letters; run `tests/shape-sim.html` through a local server to reproduce):

| Drawing | Typical grade | Notes |
|---|---|---|
| Right letter, tidy | 9.2 | 69% rated "very close" |
| Right letter, typical | 8.1 | 75% rated close or better |
| Right letter, messy | 6.4 | spread from about 3 to 8 |
| A different letter | 0.0 | 99% rated "not close"; the letter you actually drew was named correctly 83% of the time |
| Look-alike pair (e.g. ઇ/ઈ) | 0.1 | 23% still rated "getting there" or better |
| Not a letter: O, line, zigzag, wave, plus, scribble | 0 to 1 | none rated "getting there" |
| An S drawn for ક | 3.9 | the Gujarati ક is genuinely S-shaped, so this is the hardest case |

Limits, honestly:
- It compares overall shape and direction of the pen path to **one typeface**. It cannot judge stroke order, neatness or style, so a good letter in your own handwriting can score lower than a traced one.
- Real hands are messier than the simulation, so expect the real numbers to be a bit worse. Treat the grade as a guide, not a mark.
- The pad's pen is deliberately thin (Fine / Medium / Bold, default Medium) and the guide letter is large, so the letter is easy to trace.

## Strokes view (what it shows, and what it doesn't)

Next to the pad's guide there is an **Outline / Strokes / Off** switch. *Strokes* draws each letter's **centerline**: the thin path a pen would cover, with separate pieces in different colors (a dot or a vowel sign is its own piece). It is computed from the font's shape, so you can see the skeleton of the letter while you write over it.

It deliberately does **not** show stroke order or direction. I looked for a reliable source and did not find one: the one open dataset I found generated its strokes automatically from fonts (so the order is a guess) and is GPL-licensed, which would also affect this project's license. Showing guessed order as if it were correct would be worse than showing none. If you want real stroke order, the dependable route is to record it from a fluent Gujarati writer; the pad already captures ordered strokes, so a small "record a letter" tool could export them as data.

## What's inside

- **12 short lessons** (5 new items each): consonants and their built-in "a", standalone vowels, vowel signs, the nasal dot, the joiner, and common joined letters. Each lesson unlocks after the previous one; any finished lesson can be replayed.
- **Games:** Quick 5, Say It, Spelling Check, Find It, letter match, flashcards, recall (typing), word reader, word builder, and writing practice. Games only use letters and words you have already been taught.
- **Points, levels and progress.** No streaks and no penalties. A small "welcome back" bonus is the only day-based reward.
- **Smarter review:** letters you miss are asked about more often until they feel comfortable.
- **Alphabet reference** with a short sound guide, and **hints** you can show, tap-to-reveal, or hide (Settings).
- **Saved in your browser** (`localStorage`). Reset anytime in Settings.

## Transliteration system

One consistent scheme everywhere (also explained in the app's *Sound guide*):

| Idea | Written as |
|---|---|
| Built-in vowel | ક = ka |
| Vowels | a, aa, i / ee, u / oo, e, ai, o, au |
| Breathy puff | an `h` after the consonant: kh, gh, chh, jh, th, dh, ph, bh |
| Tongue curled back | capital letters: T, Th, D, Dh, N, L (ષ = Sh) |
| Nasal dot ં | n |

Modern Gujarati pronounces ઇ/ઈ and ઉ/ઊ alike, so i vs ee and u vs oo show *spelling*, not sound.

## Adding more content

All content lives in `js/data/` and is plain data:

- `items.js` — letters, signs and joined letters (glyph, sound, tip, example word), plus the list of commonly confused pairs.
- `lessons.js` — which items each lesson teaches (add a lesson by adding an object).
- `words.js` — `[gujarati, transliteration, english]`. Words unlock automatically once every letter in them has been taught.

Then run `node tests/validate-data.js`. It checks that every item is in exactly one lesson, every example word contains its highlighted letter, every word is eventually unlockable, and every transliteration matches the letters it spells, and the written-vs-said breakdown lines up for every word.

## Sources and honesty about accuracy

Letters, vowel signs, sound values and the notes about ઇ/ઈ, ઉ/ઊ, ફ, ષ, ળ and the rare letters follow Wikipedia's *Gujarati alphabet* and *Gujarati phonology* articles. The example words and spellings were checked for internal consistency by the validation script, **but not against a dictionary or a native-speaker review**. As a Gujarati speaker you are the best proofreader — if a word, spelling or hint looks off, edit the data files (it is one line each).

## Limitations

- **Audio:** there are no recordings. The "Hear it" button appears only if your browser has a Gujarati text-to-speech voice (many desktops don't). Otherwise the app says so and suggests saying the word aloud. Synthesized voices may pronounce words imperfectly.
- **Writing practice:** "Check my shape" gives rough shape feedback only (see below). It does not check stroke order, direction or neatness, and no stroke-order guidance is included.
- **Not covered:** rare letters ઙ ઞ ઋ, loan-word signs ઑ ૉ, the visarga ઃ, and Gujarati digits.
- **Fonts:** Google Fonts (Fraunces, Noto Sans Gujarati) load from the internet and are cached for offline use after the first visit; before that, the app falls back to system Gujarati fonts (Nirmala UI, Shruti, Gujarati Sangam MN).
- **Updating:** after you change any file, bump `VERSION` in `sw.js` so installed copies pick up the update.
- **Not tested on real hardware:** layouts were checked at iPad portrait/landscape and phone sizes in a desktop browser. Apple Pencil pressure and palm rejection follow the standard Pointer Events behavior but I could not try them on an actual iPad.
- **Progress** lives in one browser on one device; clearing site data erases it.
- Transliteration of words follows everyday speech (final "a" silent), so it is a guide rather than a precise phonetic notation.
