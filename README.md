# Ukrainian Language Practice App

A Progressive Web App (PWA) for learning Ukrainian through speech recognition, text-to-speech, structured lessons, and free-form AI conversation with live grammar feedback.

---

## 1. Project Overview

**What it does:**
- Guided phrase lessons with speech recognition scoring (listen → speak → get scored)
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
