// Language App — Service Worker
// Cache the app shell so it works offline after first load.
// Bump CACHE version whenever shell file list changes or content updates.
const CACHE = 'language-app-v33';
const SHELL = [
  './index.html',
  './manifest.json',
  './icon.svg',
  './styles/variables.css',
  './styles/base.css',
  './styles/home.css',
  './styles/lesson.css',
  './styles/chat.css',
  './styles/grammar.css',
  './styles/words.css',
  './src/main.js',
  './src/state.js',
  './src/i18n.js',
  './src/utils.js',
  './src/storage.js',
  './src/router.js',
  './src/speech.js',
  './src/voice.js',
  './src/words.js',
  './src/lesson.js',
  './src/review.js',
  './src/data/lessons.js',
  './src/data/dutch-lessons.js',
  './src/data/english-lessons.js',
  './src/data/french-lessons.js',
  './src/data/lesson-helpers.js',
  './src/data/alphabet.js',
  './src/api/languagetool.js',
  './src/api/gemini.js',
  './src/api/claude.js',
  './src/api/grammar.js',
  './src/api/word-lookup.js',
  './src/chat/chat-ui.js',
  './src/chat/suggestions.js',
  './src/chat/chat.js',
  './src/chat/translator.js',
  './src/grammar/verb-conjugation.js',
  './src/grammar/sentence-dissection.js',
  './src/grammar/exercises-ui.js',
  './src/api/exercises.js',
  './src/api/homework.js',
  './src/api/level-up.js',
  './styles/exercises.css',
  './src/inburgering/inburgering-ui.js',
  './src/api/inburgering.js',
  './styles/inburgering.css',
  './src/grammar/flashcards-ui.js',
  './src/grammar/dehet-ui.js',
  './src/api/dehet.js',
  './src/api/conversation-summary.js',
  './styles/flashcards.css',
  './styles/dehet.css',
];

// Install: pre-cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache first, fall back to network
self.addEventListener('fetch', event => {
  // Only handle same-origin GET requests
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
