# Ukrainian Language Practice App

A Progressive Web App (PWA) for learning Ukrainian: a structured course from A1 to B2, vocabulary and grammar courses on one review schedule, text-to-speech, and free-form AI conversation with live grammar feedback.

---

## 1. Project Overview

> **Since October 2026 the app is a Ukrainian course only.** `TARGET_LANGUAGES` in `src/state.js` is `['uk']` and the picker offers Ukrainian alone; an older install that had Dutch, English or French as target falls back to Ukrainian. The modules and data for those targets (inburgering, de/het) are still in the tree, unused, until they are removed in a later clean-up.
>
> **The lesson flow is gone (October 2026).** The listen-and-repeat lessons, their phrase review queue, homework upload and level-up were removed: the course path covers the same ground with explanations and typed practice. What stayed is the Cyrillic alphabet table (`src/alphabet-ui.js`, under Courses & drills) and the `.lesson-header` / `.lesson-title` / `.lesson-subtitle` classes every screen uses for its header (now in `styles/base.css`). The file trees below predate this and still list `lesson.js`, `lessons.js` and `lesson.css`.

**What it does:**
- A structured course path from A1 to B2 (see section 9), with electronic-warfare and office work tracks
- Cyrillic alphabet reference with tap-to-hear pronunciation
- Free AI conversation chat with a tutor persona ("Taras")
- Real-time grammar checking via LanguageTool (free, no key)
- AI responses via Gemini or Anthropic (user supplies their own API key)
- Progress tracking and points system stored in localStorage
- Voice selection with quality ranking (prefers Microsoft neural voices on Edge)
- Works offline after first load (PWA / service worker)

**Tech stack:**
- Vanilla JavaScript (ES modules, no build step)
- Web Speech API — SpeechRecognition + SpeechSynthesis
- LanguageTool API (free, no auth)
- Google Gemini API (`gemini-2.0-flash`)
- Anthropic Claude API (`claude-haiku-4-5`)
- PWA: manifest.json + service worker

---

## 2. Architecture Diagram

```
index.html (HTML shell)
│
├── styles/
│   ├── variables.css      CSS custom properties (:root)
│   ├── base.css           Reset, body, header, keyframes
│   ├── home.css           Home screen, voice card, alphabet
│   ├── lesson.css         Lesson flow, feedback, complete screen
│   └── chat.css           Chat UI, suggestions sidebar, settings
│
└── src/
    ├── data/
    │   ├── lessons.js     LESSONS[] — phrase data
    │   └── alphabet.js    ALPHABET[] — letter data
    │
    ├── state.js           Shared mutable state object
    ├── utils.js           escHtml, levenshtein, calcSimilarity
    ├── storage.js         localStorage helpers (progress, API keys)
    ├── router.js          showScreen() — stops recordings on nav
    ├── speech.js          setupRecognition() factory
    ├── voice.js           loadVoices, speakText, changeVoice, etc.
    │
    ├── lesson.js          Full lesson flow (start→render→score→complete)
    │                        imports: data, utils, state, storage, router,
    │                                 speech, voice
    ├── api/
    │   ├── languagetool.js  checkGrammarLanguageTool()
    │   ├── gemini.js        buildSystemPrompt(), callGeminiAPI()
    │   └── claude.js        callClaudeAPI() (reuses buildSystemPrompt)
    │
    ├── chat/
    │   ├── chat-ui.js     DOM helpers: addUserMessage, addBotMessage, etc.
    │   ├── suggestions.js updateSuggestions, useSuggestion
    │   └── chat.js        openFreeChat, processUserInput, getFallbackResponse,
    │                        toggleFreeSpeak, setDifficulty, setLang, sendText
    │
    └── main.js            Entry point: init(), exposes all window.* functions

Import order (no circular deps):
  data → utils → state → storage/router → speech/voice → api/* → chat/* → lesson → main
```

---

## 3. File Structure

```
Ukrainian language app/
├── index.html              Clean HTML shell — no inline CSS or JS
├── manifest.json           PWA manifest (theme colour, icons, display mode)
├── sw.js                   Service worker — caches all app-shell files
├── icon.svg                App icon (used for PWA and apple-touch-icon)
├── README.md               This file
├── styles/
│   ├── variables.css       CSS custom properties (:root block only)
│   ├── base.css            Reset, body, header, .app, shared tags, @keyframes
│   ├── home.css            Home screen components + alphabet grid
│   ├── lesson.css          Lesson screen components + complete screen
│   └── chat.css            Chat settings, messages, sidebar, media queries
└── src/
    ├── data/
    │   ├── lessons.js      LESSONS array — 6 categories × 8–10 phrases each
    │   └── alphabet.js     ALPHABET array — 33 Cyrillic letters with romanisation
    ├── state.js            Single shared state object (see State Management)
    ├── utils.js            escHtml, levenshtein distance, calcSimilarity
    ├── storage.js          loadProgress, saveProgress, loadApiKey, saveApiKey,
    │                         switchProvider, updateApiStatus, getApiKey,
    │                         updatePointsBadge
    ├── router.js           showScreen(id) — switches active screen, stops mic
    ├── speech.js           setupRecognition(lang, onResult, onEnd) factory
    ├── voice.js            loadVoices, applyVoice, changeVoice, testVoice,
    │                         speakText, showBrowserBanner, dismissBanner
    ├── lesson.js           startLesson, restartLesson, buildCategoryCards,
    │                         buildAlphabet, buildNavDots, renderPhrase,
    │                         nextPhrase, showLessonComplete, listenPhrase,
    │                         toggleSpeak, stopRecording, processLessonResult,
    │                         showFeedback, hideFeedback
    ├── api/
    │   ├── languagetool.js checkGrammarLanguageTool(text) → {has_errors, corrected, explanation}
    │   ├── gemini.js       buildSystemPrompt(isUkrainian), callGeminiAPI(msg, isUk)
    │   └── claude.js       callClaudeAPI(msg, isUk) — reuses buildSystemPrompt
    ├── chat/
    │   ├── chat-ui.js      addUserMessage, addBotMessage, addGrammarFeedback,
    │                         addErrorMessage, addSystemNotice,
    │                         showTypingIndicator, hideTypingIndicator
    │   ├── suggestions.js  updateSuggestions(list), useSuggestion(text)
    │   └── chat.js         openFreeChat, startConversation, setDifficulty, setLang,
    │                         sendText, processUserInput, getFallbackResponse,
    │                         toggleFreeSpeak, updateFreeMicBtn
    └── main.js             Calls init(), registers SW, exposes window.* globals
```

---

## 4. State Management

All mutable runtime state lives in a single exported object in `src/state.js`:

```js
export const state = {
  currentLesson: null,         // active LESSONS entry
  currentPhraseIndex: 0,       // index into currentLesson.phrases
  lessonScores: [],            // similarity scores for current lesson run
  totalPoints: 0,              // persisted in localStorage
  recognition: null,           // active SpeechRecognition instance (lesson)
  synth: window.speechSynthesis,
  isRecording: false,          // lesson mic active
  freeChatLang: 'uk',          // 'uk' | 'en' — what language user is typing/speaking
  freeRecording: false,        // chat mic active
  freeRecognition: null,       // active SpeechRecognition instance (chat)
  categoryProgress: {},        // { lessonId: [phraseIndex, ...] } persisted
  conversationHistory: [],     // [{role, content}] for API context window
  currentDifficulty: 'beginner',
  currentProvider: 'gemini',   // 'gemini' | 'anthropic'
  selectedVoice: null,         // SpeechSynthesisVoice
  availableUkVoices: [],       // ranked list of Ukrainian voices
};
```

All modules import `{ state }` and mutate it directly. There is no getter/setter pattern — modules read and write properties on the object. Because the object reference never changes, all modules always share the same live values.

---

## 5. API Integrations

### LanguageTool (free, no key)
- **Endpoint:** `POST https://api.languagetool.org/v2/check`
- **Params:** `text=<Ukrainian text>&language=uk`
- **Returns:** list of grammar matches with offsets and suggested replacements
- **Module:** `src/api/languagetool.js` → `checkGrammarLanguageTool(text)`
- No API key required. Rate limit applies on the free tier.

### Gemini (`gemini-2.0-flash`)
- **Endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=<KEY>`
- **Key prefix:** `AIza...`
- **Module:** `src/api/gemini.js` → `callGeminiAPI(userMessage, isUkrainian)`
- Uses `responseMimeType: 'application/json'` for structured output
- Free tier available at aistudio.google.com

### Anthropic Claude (`claude-haiku-4-5`)
- **Endpoint:** `POST https://api.anthropic.com/v1/messages`
- **Key prefix:** `sk-ant-...`
- **Headers:** `x-api-key`, `anthropic-version: 2023-06-01`, `anthropic-dangerous-direct-browser-access: true`
- **Module:** `src/api/claude.js` → `callClaudeAPI(userMessage, isUkrainian)`
- Paid tier only. The `anthropic-dangerous-direct-browser-access` header is required for direct browser calls.

Both AI modules use `buildSystemPrompt(isUkrainian)` from `src/api/gemini.js` to generate the system instruction. The prompt instructs the AI to respond with a specific JSON schema containing `response_uk`, `response_en`, `grammar_feedback`, and `suggestions`.

---

## 6. Data Flow — Chat Message

```
User types / speaks
       │
       ▼
sendText() / toggleFreeSpeak()        [src/chat/chat.js]
       │
       ▼
processUserInput(text)
       │
       ├─── addUserMessage(text)       [chat-ui.js] — render to DOM
       ├─── totalPoints += 3; saveProgress()
       ├─── showTypingIndicator()
       │
       ├─── checkGrammarLanguageTool(text)   ─┐  run in parallel
       └─── callGeminiAPI / callClaudeAPI    ─┘  via Promise.all
                                               │
                                               ▼
                              hideTypingIndicator()
                                               │
                              ┌────────────────┴──────────────────┐
                              │                                   │
                     addGrammarFeedback(...)          addBotMessage(uk, en)
                     [chat-ui.js]                     [chat-ui.js]
                                                           │
                                                   updateSuggestions(list)
                                                   [suggestions.js]
```

---

## 7. Local Development

ES modules require HTTP — they cannot load from `file://`. Use any local server:

```bash
# Option A — npx serve (Node.js required)
cd "Ukrainian language app"
npx serve .

# Option B — Python
cd "Ukrainian language app"
python3 -m http.server 8080

# Option C — VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

Then open `http://localhost:3000` (or whichever port is shown).

**No build step.** There is no bundler, transpiler, or package.json. Edit files and reload.

---

## 8. Deployment

### Netlify Drop (easiest)
1. Go to app.netlify.com/drop
2. Drag the entire `Ukrainian language app/` folder onto the page
3. Netlify gives you a live URL instantly

### iOS PWA (Add to Home Screen)
1. Open the deployed URL in **Safari** on iPhone/iPad
2. Tap the Share button → "Add to Home Screen"
3. The app icon appears on the home screen and launches full-screen

Note: Speech recognition on iOS requires a user gesture before the mic can be activated. The first tap on the Speak or mic button triggers the permission prompt.

---

## 9. Extending the App

### Adding a new lesson category
Edit `src/data/lessons.js` and add a new object to the `LESSONS` array:

```js
{
  id: 'colors',           // unique string, used as localStorage key
  name: 'Colors',
  icon: '🎨',
  tag: 'beginner',        // 'beginner' | 'intermediate'
  phrases: [
    { uk: 'Червоний', ph: 'chehr-VOH-nyy', en: 'Red', tip: '💡 tip here' },
    // ...
  ]
}
```

The home screen category grid and lesson flow are fully data-driven — no other changes needed.

### Adding a new AI provider
1. Create `src/api/myprovider.js` exporting `callMyProviderAPI(userMessage, isUkrainian)`
2. Follow the pattern in `gemini.js`: push to `state.conversationHistory`, call the API, parse JSON, push assistant reply, return parsed object
3. In `src/chat/chat.js`, import your function and add a branch in `processUserInput`:
   ```js
   } else if (state.currentProvider === 'myprovider') {
     convPromise = callMyProviderAPI(text, isUkrainian);
   }
   ```
4. Add a radio button in `index.html` and handle it in `src/storage.js → switchProvider()`

---

## 10. Known Limitations

- **iOS Safari mic**: SpeechRecognition requires a direct user gesture. It cannot be triggered programmatically. The first mic button tap shows the system permission dialog.
- **SpeechRecognition availability**: Only available in Chromium-based browsers (Chrome, Edge, Opera) and Safari. Firefox does not support the Web Speech API SpeechRecognition interface.
- **Ukrainian voice availability**: Ukrainian TTS voices are only available in some OS/browser combinations. Microsoft Edge on Windows/macOS provides the highest-quality neural voices. Chrome on macOS uses a lower-quality system voice.
- **LanguageTool rate limits**: The free API tier has request rate limits. Grammar checks may silently fail under heavy use — the app continues without them.
- **Direct browser API calls**: Calling Anthropic's API directly from the browser requires the `anthropic-dangerous-direct-browser-access` header, which means the API key is visible in browser DevTools network requests. For production use, proxy calls through a server-side function.
- **Gemini JSON mode**: The `responseMimeType: 'application/json'` config enforces JSON output in Gemini 2.0 Flash. Older model versions do not support this parameter.

---

## Drills, review and the shared modules (2026-09)

- `src/api/model.js` — the one place that calls the AI provider. Every generated feature (exercises, De/Het nouns, homework, level-up, word lookup, verb lookup, dissection, Inburgering, summary) goes through `generateJSON()`, which routes to Gemini or Anthropic by the provider chosen in Settings and throws one localised "no key" error.
- **Course engine** (`src/grammar/course-engine.js`, `src/data/course-progress.js`) — the one learning method the app is moving to: *learn* (item shown with its answer) → *test* (typed from memory) → *review* (SM-2, one queue) → *apply* (free practice). A course supplies items, a menu and cards (`{ promptHtml, input, check, record, override, detailHtml, missed … }`); the engine runs the session, checks answers, shows feedback, "my answer was right too", the score card and the missed list. `makeProgress(storageKey, keys)` is the single progress store. Vocabulary and Numbers run on it; because every course hands over the same kind of card, `startReviewAll()` in `src/review.js` shuffles due cards of all courses into one round. Verbs run on it too (`src/data/verb-progress.js`): Learn One, My List, Tables and the random drill stay, the learner still picks the verbs; what is scheduled is a unit (one verb in one tense, or a pair's aspect choice), moved once per session by how many of its cards were right, so learning a pair adds about eight reviews, not thirty-six. Learn One ends with the pair's aspect sentences; the old Aspect quiz screen is now reference only ("Aspect explained"). Courses are listed once, in `COURSES` in `src/review.js`: hub rows, due totals, Today card and the mixed round follow from it. Cases (`case-progress.js`: unit = one noun in one number, learned with Learn One) and Prefixes (`prefix-progress.js`: unit = one prefixed verb, learned a word family at a time with introduction cards) follow the same pattern; their tables, reference lists, filters and free drills stay. The free drills only move the schedule of units that were learned first. The engine takes a spoken answer next to a typed one. Words saved from conversations are the theme "My words" of the vocabulary deck (`vocab-progress.js` merges them in; their schedule stays on the saved word), for every target language; the Flashcards screen is gone. The hub (`exercises-ui.js`, Home tile "Courses & drills") is the supporting layer beside the course path, which has its own Home tile and is not repeated here. It is laid out by what a thing is for: **Learn** (the supporting courses, each tile with its progress and due count), **Apply** (Sentence Builder, Dialogues), **AI tools and quizzes**. The Ukrainian AI quiz topics that a course now covers (cases, aspect, gender agreement, pronouns) were removed; adverbs, prepositions and negation stay.
- `src/grammar/drill-core.js` — shared pieces of every typed drill: answer grading with typo tolerance, the result line, a focused Next button (Enter advances), score wording, and the "missed this round" list.
- Offline drills (Ukrainian): Verb Drill (with Aspect practice inside it), Case Drill (nouns and adjective + noun), Prefix Drill, Numbers & Time (cardinals, ordinals, dates, clock time). Each records mistakes in its own `*Weakness` localStorage store and feeds them back into later rounds.
- `src/review.js` is the review hub: every course's due items with one due count, which also drives the Today card on Home (`renderTodayCard` in `src/main.js`; the card also points at the next open unit of the course path).
- `src/router.js`: the phone's back gesture (and the browser's Back button) presses the active screen's own `.back-btn`, so the gesture and the arrow can never disagree: a card leaves its round for the page it was started from, a unit page returns to the menu, a menu returns Home. An open sheet (settings drawer, word lookup, a help sheet) is closed first; it reports itself with `sheetOpened(close)` / `sheetClosed(close)`. The router keeps one extra history entry (the "trap") while there is somewhere to go back to, and lays it again after each step. A new view therefore needs nothing but a visible `.back-btn` that does the right thing.
- **Course path** (`src/data/path/`, `src/data/path-progress.js`, `src/grammar/path-ui.js`, `tools/path/`): the structured course from A1 to B2, hub tile "Course path A1 → B2". Its spine is the Ukrainian state standard "Українська мова як іноземна, рівні А1–С2" (2024) and the Lviv University standard behind it: per level their grammar list and themes, in order. One unit = one grammar point in one theme: an explanation (markdown-lite with `> uk — gloss` example lines), 12–16 words, 8–10 example sentences with a note each, and gap/choice exercises. Three steps on the course engine: words (shown, then typed both ways), sentences (shown with the note, then typed from the translation with the dictionary forms as hints), exercises. Words and sentences join the shared review queue; a word that is in the core deck keeps its schedule there, so nothing is scheduled twice. Unit steps done are kept under `pathUnits`. Content pipeline: units are written as one JSON file each, `tools/path/validate.mjs` checks the shape within and across units, `tools/path/lt-check.mjs` runs every Ukrainian string through LanguageTool (uk-UA), `tools/path/assemble.mjs` writes `src/data/path/{a1,a2,b1,b2}.js` (one unit per line, so a unit can also be edited there directly). Two work tracks are interleaved with the general units and tagged in the list: `track: 'ew'` (12 units, electronic warfare and EMS operations, reusing the vocabulary theme of the same name) and `track: 'work'` (6 units: the working week, arranging a meeting, agenda and minutes, polite requests and deadlines, the follow-up email, feedback and presenting). A word may be taught again in a later unit; it shares one schedule entry, and `dedupe.mjs` only trims repeats down to 12 words per unit. `tools/path/syllabus.json` holds the 122 unit specs (grammar point, the standard's wording, theme, focus, writer brief) the content was written from.
- **Keeping old material alive** (course engine, `src/review.js`): a session that teaches something new (a unit step of the course path, "Learn 10 new" or a theme round of the vocabulary deck) starts with a *warm-up* of up to 8 due items from the course's own material (`runSession({ warmUp, warmUpSource })`): for the path, words and sentences of the units already done, core words included (`learnedDueItems()` in `path-progress.js`); for the vocabulary deck, its own due words. `review.js` registers the all-course source as the default. Nothing is locked: the unit page and the Continue card show how many of those are due, with a one-tap round over them. After a break, when 100+ items are due, the review hub offers *catch-up*: the queue is split over seven days and the mixed round takes only today's share; nothing is rescheduled, the rest just waits (`reviewCatchUp` in localStorage, per day). The path's menu has "Practise what you learned": 20 exercises drawn from units whose exercise step is done, since exercises are not on the schedule.
- **Backup** (`src/backup.js`, `src/backup-ui.js`): everything the app keeps is in this browser's localStorage. The Settings drawer has "Download" (one JSON file with every key except the API keys) and "Restore" (replaces the device's data with the file's, keeps the device's API keys, reloads). The Progress screen only shows when the last backup was, in amber when it is more than two weeks old (or when there is none after three days of practice), and opens Settings.
- **Vocabulary deck** (`src/data/vocab-uk.js`, `vocab-progress.js`, `grammar/vocab-drill-ui.js`): ~1150 core words in 14 themes, 289 of them verbs (every Verb Drill pair included). A *work* theme (`work: true` in `THEMES`), Electronic warfare & EMS operations, holds ~240 specialist words: drilled and browsed when chosen, scheduled like any other word once learned, but left out of "All themes" so the general deck stays general. Typed both ways: meaning → word, word → meaning (any listed meaning counts, `to`/articles optional, "my answer was right too" for synonyms), or both mixed; plus dictation and multiple choice. Translate cards sometimes show a verb's perfective partner. New words are dealt from all themes at once. Scheduled with the same SM-2 code as saved words.
- **Numbers course** (`src/data/numbers-course.js`, `numbers-progress.js`, inside `grammar/numbers-drill-ui.js`): 128 items in 13 stages (0–10, teens, tens, compounds, hundreds, thousands, years, ordinals, clock times, dates). "Learn" introduces the next stage with the word shown, then asks it from memory; SM-2 review feeds the review hub. Typed both ways (digits → word, word → digits), plus listening, dictation and multiple choice. The random drill below it stays for applying the patterns to unseen numbers; both share item keys and weak spots.
- **Sentence Builder** (`src/data/sentences-uk.js`, `grammar/sentence-build-ui.js`): 61 everyday sentences plus the 200 aspect sentences; dictionary forms in, a typed sentence out, graded by similarity with a word-by-word view.
- **Dialogues** (`src/data/dialogues-uk.js`, `grammar/dialogue-ui.js`): 8 short dialogues played with the transcript hidden, then two gap-fills and one comprehension question.
- **Pronouns** (`src/data/pronouns-uk.js`) are a third mode of the Case Drill next to nouns and adjective + noun.
- **Progress** (`src/progress-ui.js`, `src/data/activity.js`): one screen with the streak, the last 14 days and one row per course: what was learned and is scheduled, and under it what the course's free drill recorded. "Weak" is the count from `src/weak-spots.js`, the same list Home adds up. Every recorder calls `markActivity()`.

## Home, first minutes, unit page (2026-11)

Changes from the UI review of November 2026 (a new learner's first minutes, things in odd places, bugs).

- **Home** opens on the Today card (due, weak spots, next unit; for a new learner "Start here" and the alphabet). The interface language is chosen in Settings; a new install takes it from the device (`firstNativeLanguage()` in `src/state.js`: Dutch on a Dutch device, English otherwise, Dutch for installs that were used before). There is no API-key banner: the conversation screen, My Words and the hub each say what a missing key means where it matters.
- **Ukrainian keyboard** (`src/keyboard-help.js`): a sheet with the steps for the device in hand (iOS, Android, Windows, Mac). It opens once before a new learner's first typed Ukrainian answer (`keyboardHelpFirstTime()`, called by the course engine) and is reachable from Settings, the hub and the first three units. `latinTypedNote()` is the engine's check for Latin letters in an answer whose card has `input.lang === 'uk'`: nothing is graded, the card says to switch keyboard, and it names a stray Latin letter inside a Cyrillic word.
- **Sheets and toasts**: `src/sheet.js` (`openSheet({ title, html, onOpen })`) is a text panel over the current screen that leaves the screen underneath untouched, a card in mid-round included; `src/toast.js` is a one-line message that goes away by itself (used when the device has no Ukrainian voice, see `warnIfSilent()` in `src/voice.js`).
- **Alphabet** (`src/alphabet-ui.js`, `src/data/alphabet.js`): the table has Dutch sound hints next to the English ones, and its back button returns to wherever it was opened from.
- **Unit page** (`showUnit` in `src/grammar/path-ui.js`): the practice buttons come first, with the next step highlighted; the explanation lies open on a first visit and folds away once the unit is under way; words and sentences are folded lists.
- **Resume**: a unit round is planned as a list of `[kind, ref]` pairs (`stepPlan`) and its cards are made from the plan (`planCards`). After every answer the plan and the position go to `pathResume` (`saveResume` in `src/data/path-progress.js`); the unit page offers "Pick up where you left off". The engine takes `resume: { at, score, missed }` and reports through `onProgress`.
- **Weak spots** (`src/weak-spots.js`): `weakSpots()` is the list of courses with weak items and what a tap does for each; Home shows the sum and opens the list as a sheet.
- **Course names** (`src/course-names.js`): one name and icon per course for the hub, Review, Progress and the weak-spots list.
- **Typing course** (`src/data/typing.js`, `src/data/typing-progress.js`, `src/grammar/typing-ui.js`, `styles/typing.css`): getting used to the Ukrainian keyboard in eight steps, in the order the alphabet unit presents the letters (the familiar ones, the false friends, the other vowels, the new shapes, soft sign and apostrophe, then capitals and whole sentences). A step with new letters shows each letter with its sound and its key, asks the sound back, drills syllables, and then has the learner type real words that use only letters met so far; those words are picked from the vocabulary deck at run time (`stageWords`), so nothing is spelled by hand except a few extras. It runs on the course engine with two hooks added for it: a card's `mount({ root, input, submit })` (each letter of the line turns green or red while it is typed, the next key lights up on a picture of the keyboard, a finished line checks itself) and `scoreNote()` (characters a minute and the share of keys hit right on the score card). The keyboard picture is the standard Ukrainian layout, the same letter rows on Windows, Linux and macOS; it is on by default on a device with a physical keyboard and off on a phone. Typing is practice, not memory work: nothing goes on the review schedule; `typingProgress` keeps the steps done, the best speed and a count of missed keys per letter, which the practice round leans on.
- **Keyboards** (`src/keyboard-picture.js`, `byKeyboard` / `keyboardOf` in `drill-core.js`): the picture of the Ukrainian keyboard is one module. The typing course is built around it; every other round offers it under a Ukrainian answer field on a device with a physical keyboard (`keyboardAid`, called by the course engine): the next key is lit while a new word is copied, and it is reference only where the answer must come from memory. It is on by default for someone who has never answered anything (`kbAid`), off otherwise, with a link to show it. A round that asks both directions puts its cards in blocks per keyboard (`byKeyboard`), the card where the keyboard changes says so, and letters from the wrong keyboard are not graded in either direction (`latinTypedNote`, `cyrillicTypedNote`).
- **One header per screen**: the app's own header shows on Home only (`body.on-home`, set by the router). Inside a screen the way to Settings is a gear in the screen header, which `dressHeaders()` in `main.js` adds to every `.lesson-header` as it appears (a MutationObserver), so no screen has to add it itself.
- **Sizes**: no font size under `0.75rem` (12px) in any stylesheet except the legend on a key of the keyboard picture; filter chips and small option buttons are at least 36px high (`base.css`, "Sizes").
- **The alphabet is the first unit**: the unit with id `a1-02` stands before `a1-01` ("Hello, I am…") in `src/data/path/a1.js` and in `tools/path/syllabus.json`, which is where the order of the units comes from. Ids were not renumbered, because progress is stored under them; the number a learner sees is the unit's place in its level. The alphabet unit now teaches `це` itself and uses no word of the other unit, and the later notes that name these two units by number were turned round.
- The inline markup of unit texts (`inline()` in `path-ui.js`) knows `*italic*`; a single asterisk before a form is left alone, because the texts use it to mark a wrong form (never *скажите).

## Right answers that were marked wrong (2026-11, second round)

A pass through the courses themselves: what a round does with an answer, and whether the hand-written data is right.

- **More than one right form.** Ukrainian often has two endings or spellings for one cell, and a typed answer may be either. The tables keep one form per cell; the others come from `PARALLEL_FORMS` / `nounForms()` in `src/data/case-declensions.js` (брату and братові, стола and столу, у домі and у дому) and from `verbForms()` in `src/data/verb-conjugations.js`, which derives them: the one-word future (`syntheticFuture()`: буду готувати → готуватиму), -сь for -ся after a vowel, іду / йду, вчу / учу. The Prefix Drill takes both spellings of the prefix у-/в- (`bothSpellings()`), and where a family mixes the aspects (давати gives віддати) the verb's partner, listed as `also` on the entry. Under the verdict, `alsoFineHtml()` in `drill-core.js` names the forms the learner has not just seen; for that a card's `detailHtml` function also receives the `answer`. The case tables show a second form under the main one, the verb tables list the one-word future under the two-word one.
- **Wrong keyboard**: `wrongKeyboard()` in `src/keyboard-help.js` is the one check for an answer typed in the wrong alphabet. The course engine, the Sentence Builder and the dialogues use it: nothing is graded, a note says to switch, the learner tries again. The keyboard picture (`keyboardAid`) goes under that note (`.ce-retry-note`) in all three.
- **Sentence Builder**: the target sentence is shown once (alone when exactly right, otherwise as the word-by-word comparison, written as in the data), and a miss can be taken back with "My answer was right too" (`amend()` on the tracker in `src/data/flat-weakness.js`), because one sentence can be said in more than one way.
- **Vocabulary, "choose"**: the three wrong options are words of the same kind as the one asked, never a work word for a general one, never a word with the same meaning (`distractors()` in `vocab-drill-ui.js`).
- **Filters hold for a whole round**: the aspect and tense chosen in the Verb Drill and the gender chosen in the Case Drill now apply to the sentence cards too; a Prefix Drill on one prefix is a full round of that prefix (it used to be a card or two).
- **Everything that takes a click is a control**: the rows of the verb and noun pickers and the toggles on the drill menus are buttons (`aria-pressed` where they stay on), the category cards of Numbers answer to space and Enter. All can be reached with Tab.
- **Data**: `node tools/check-drill-data.mjs` checks the drill data against itself (a sentence asks for a form its table has, for the verb it is filed under); with `--spell` it also sends every form and sentence to LanguageTool. Two nouns have no plural (молоко, здоров'я); a family base that is no word on its own is marked `bound: true` and shown with a hyphen (-дягати).

## The AI parts, checked against a stand-in provider (2026-11)

The chat, word lookup, verb lookup, sentence dissection and AI quiz were walked with `fetch` replaced by canned answers (good ones, a rejected key, a busy service, no network, an empty or unreadable reply).

- **One wording for a failed request**: `aiErrorText(err)` in `src/api/model.js` turns the provider's own text ("invalid x-api-key", "Failed to fetch", an empty or unparseable reply) into a sentence in the learner's language. Chat, summary, word lookup, verb lookup, dissection, quiz and the translate helper all use it.
- **Chat** (`src/chat/chat.js`, `src/api/claude.js`, `src/api/gemini.js`): a message whose request failed is taken out of the conversation history again, so it is not re-sent with every later message. The Anthropic reply is read from its text blocks (a block of another kind in front, or a reply with no text, no longer ends in a JavaScript error). "Redo" on a typed message puts the text back in the field; on a spoken one it listens again. Each message remembers where the history stood (`data-hist-at`), so taking one back cuts the history at the right place. The microphone button no longer stays on "recording" in a browser without speech recognition.
- **My Words** (`src/words.js`): removing a word shows a toast with "Undo" (the word comes back with its review state). The lookup card shows the answer to the last word tapped, also when an earlier lookup returns later.
- **In Dutch**: sentence dissection (labels, roles, loading text), the tense names and pronoun glosses of the verb lookup, and the kind of word on the lookup card.
- **AI quiz**: an open answer that is word for word the answer on the card counts without asking "did you get it right?"; an answer in the wrong alphabet gets the keyboard note instead of being judged.
- **Numbers**: the four year items say how a year is spoken (`yearOrdinal()` in `numbers-time.js`): the last word is an ordinal.
- The Anthropic model is still `claude-haiku-4-5`, called with plain `fetch` (the app has no build step and no dependencies). Moving to a newer model changes the request (no `temperature`, thinking on by default), so it is a decision for the owner, not a rename.

## Every card of the course path against its own answer (2026-11)

All 122 units were played as whole rounds, every card answered with the answer from the data (9,921 cards, a few seconds in a headless browser), in Dutch and in English.

- **Two course words for one meaning** (книга and книжка, поїзд and потяг, магазин and крамниця, теж and також): typing the other one on a "meaning → word" card is not a mistake. `synonymIn()` in `vocab-drill-ui.js` finds it among the course's words and the vocabulary deck, and the card asks again without a penalty, as the vocabulary deck already did. The same word in its other spelling (увечері / ввечері, учитель / вчитель: у- and в- alternate) simply counts as right. A meaning with the very same gloss twice ("to ask (a question)") counts as shared.
- **Brackets in a meaning are optional parts** (`bracketForms()`): "(aan) haar" is *haar* and *aan haar*, "laat (hem / haar / ze) maar" also *laat hem maar*, "to wake (someone) up" with and without *someone*. A meaning typed with its brackets is read both ways.
