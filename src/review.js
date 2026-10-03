// ── Review: one queue for everything that is due ──────────────────────────────
// Every course (course path, vocabulary, numbers, verbs, cases, prefixes) is
// scheduled with the same SM-2 code and hands over its due items as course-engine
// cards, so they can be shuffled into a single round. The hub shows that one
// button first, then a row per course for reviewing a single subject.

import { state, getTTSLang } from './state.js';
import { calcSimilarity, escHtml, levenshtein } from './utils.js';
import { showScreen } from './router.js';
import { getWordsCount } from './words.js';
import { vocabStats } from './data/vocab-progress.js';
import { numbersStats } from './data/numbers-progress.js';
import { verbStats } from './data/verb-progress.js';
import { caseStats } from './data/case-progress.js';
import { prefixStats } from './data/prefix-progress.js';
import { pathStats } from './data/path-progress.js';
import { vocabDueCards } from './grammar/vocab-drill-ui.js';
import { numbersDueCards } from './grammar/numbers-drill-ui.js';
import { verbDueCards } from './grammar/verb-drill-ui.js';
import { caseDueCards } from './grammar/case-drill-ui.js';
import { prefixDueCards } from './grammar/prefix-drill-ui.js';
import { pathDueCards } from './grammar/path-ui.js';
import { runSession } from './grammar/course-engine.js';
import { L, shuffle } from './grammar/drill-core.js';

function getScreen() { return document.getElementById('reviewScreen'); }

// ── The courses ──────────────────────────────────────────────────────────────
// A new course is one entry here: hub row, due totals, Today card, Progress
// screen and the mixed round all follow. langs: 'all', or the targets it exists for.

const COURSES = [
  { id: 'path', langs: ['uk'], icon: '🗺️', name: { en: 'Course path (A1 → B2)', nl: 'Leerpad (A1 → B2)' }, unit: { en: 'words & sentences', nl: 'woorden & zinnen' },
    fresh: { en: 'Not started — open unit A1 · 1', nl: 'Nog niet gestart — open unit A1 · 1' },
    stats: pathStats, dueCards: pathDueCards, review: 'startPathReview()', open: 'openPathScreen()' },
  { id: 'vocab', langs: ['uk'], icon: '🧠', name: { en: 'Vocabulary (core words + my words)', nl: 'Woordenschat (kernwoorden + mijn woorden)' }, unit: { en: 'words', nl: 'woorden' },
    fresh: { en: 'Not started — learn 10 new words', nl: 'Nog niet gestart — leer 10 nieuwe woorden' },
    stats: vocabStats, dueCards: vocabDueCards, review: 'startVocabReview()', open: 'openVocabDrillScreen()' },
  // The other target languages have no core list: their deck is the words saved from conversations.
  { id: 'mywords', langs: ['nl', 'en', 'fr'], icon: '🧠', name: { en: 'Vocabulary (my words)', nl: 'Woordenschat (mijn woorden)' }, unit: { en: 'words', nl: 'woorden' },
    fresh: { en: 'Tap a word in a conversation to save it, then learn it here', nl: 'Tik op een woord in een gesprek om het op te slaan en leer het dan hier' },
    stats: vocabStats, dueCards: vocabDueCards, review: 'startVocabReview()', open: 'openVocabDrillScreen()' },
  { id: 'numbers', langs: ['uk'], icon: '🔢', name: { en: 'Numbers & time', nl: 'Getallen & tijd' }, unit: { en: 'numbers & times', nl: 'getallen & tijden' },
    fresh: { en: 'Not started — learn 0 to 10', nl: 'Nog niet gestart — leer 0 tot 10' },
    stats: numbersStats, dueCards: numbersDueCards, review: 'startNumbersReview()', open: 'openNumbersDrillScreen()' },
  { id: 'verbs', langs: ['uk'], icon: '✍️', name: { en: 'Verbs (tenses you learned)', nl: 'Werkwoorden (geleerde tijden)' }, unit: { en: 'verb tenses', nl: 'werkwoordstijden' },
    fresh: { en: 'Not started — pick a verb under Learn One', nl: 'Nog niet gestart — kies een werkwoord bij Leer één' },
    stats: verbStats, dueCards: verbDueCards, review: 'startVerbReview()', open: 'openVerbDrillScreen()' },
  { id: 'cases', langs: ['uk'], icon: '📌', name: { en: 'Cases (nouns you learned)', nl: 'Naamvallen (geleerde woorden)' }, unit: { en: 'nouns', nl: 'woorden' },
    fresh: { en: 'Not started — pick a noun under Learn One', nl: 'Nog niet gestart — kies een woord bij Leer één' },
    stats: caseStats, dueCards: caseDueCards, review: 'startCaseReview()', open: 'openCaseDrillScreen()' },
  { id: 'prefixes', langs: ['uk'], icon: '🔗', name: { en: 'Prefixed verbs', nl: 'Werkwoorden met voorvoegsel' }, unit: { en: 'prefixed verbs', nl: 'werkwoorden met voorvoegsel' },
    fresh: { en: 'Not started — learn the first word family', nl: 'Nog niet gestart — leer de eerste woordfamilie' },
    stats: prefixStats, dueCards: prefixDueCards, review: 'startPrefixReview()', open: 'openPrefixDrillScreen()' },
];
const activeCourses = () => COURSES.filter(c => c.langs === 'all' || c.langs.includes(state.currentLanguage));

// The courses of the current target language, for the Progress screen.
export const getCourses = () => activeCourses();

// Everything due across the courses.
export const getCourseDue = () => activeCourses().reduce((n, c) => n + c.stats().due, 0);

// Everything waiting, for the home badge and the Today card.
export const getDueTotal = () => getCourseDue();

// ── Sessions ─────────────────────────────────────────────────────────────────

const REVIEW_ROUND = 30;

export function startReviewAll() {
  showScreen('reviewScreen');
  runSession({
    screen: getScreen(), icon: '🔄', title: L('Review', 'Herhalen'), mixed: true,
    cards: shuffle(activeCourses().flatMap(c => c.dueCards())).slice(0, REVIEW_ROUND),
    onExit: openReviewScreen,
    again: () => { const left = getCourseDue(); return left ? { label: L(`🔄 Keep going: ${left} left`, `🔄 Verder: nog ${left}`), run: startReviewAll } : null; },
  });
}


// ── The hub ──────────────────────────────────────────────────────────────────

export function openReviewScreen() {
  showScreen('reviewScreen');
  const nl = state.nativeLanguage === 'nl';
  const words = getWordsCount();
  const courseDue = getCourseDue();
  const pick = f => f[nl ? 'nl' : 'en'];

  const row = (icon, title, sub, count, total, onclick, disabled) => `
    <button class="rv-row ${disabled ? 'rv-row-disabled' : ''}" ${disabled ? 'disabled' : `onclick="${onclick}"`}>
      <span class="rv-row-icon">${icon}</span>
      <span class="rv-row-text">
        <span class="rv-row-title">${title}</span>
        <span class="rv-row-sub">${sub}</span>
      </span>
      <span class="rv-row-count ${count ? 'rv-row-due' : ''}">${count ? count : total}</span>
    </button>`;

  const courseRow = c => {
    const st = c.stats();
    const started = st.seen > 0;
    const sub = !started ? pick(c.fresh) : c.sub ? c.sub(st, nl)
      : nl ? `${st.due} aan de beurt · ${st.seen} gezien, ${st.learned} geleerd van ${st.total}` : `${st.due} due · ${st.seen} seen, ${st.learned} learned of ${st.total}`;
    return row(c.icon, pick(c.name), sub, st.due, started ? st.learned : '→', st.due ? c.review : c.open, false);
  };

  getScreen().innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" onclick="showScreen('homeScreen')">←</button>
      <div>
        <div class="lesson-title">${nl ? '🔄 Herhalen' : '🔄 Review'}</div>
        <div class="lesson-subtitle">${nl ? 'Wat vandaag aan de beurt is' : 'What is due today'}</div>
      </div>
    </div>
    <button class="rv-all-btn" ${courseDue ? 'onclick="startReviewAll()"' : 'disabled'}>
      <span class="rv-all-title">🔄 ${courseDue ? (nl ? `Herhaal alles: ${courseDue} aan de beurt` : `Review everything: ${courseDue} due`) : (nl ? 'Niets aan de beurt' : 'Nothing due right now')}</span>
      <span class="rv-all-sub">${nl ? 'Alles wat aan de beurt is, door elkaar, in één ronde' : 'Everything that is due, mixed, in one round'}</span>
    </button>
    <div class="rv-hub">
      ${activeCourses().map(courseRow).join('')}
      ${!courseDue && words === 0 && activeCourses().every(c => c.stats().seen === 0) ? `
        <div class="rv-empty">
          <button class="rv-empty-btn" onclick="openPathScreen()">🗺️ ${nl ? 'Begin het leerpad' : 'Start the course path'}</button>
          <button class="rv-empty-btn" onclick="openFreeChat()">💬 ${nl ? 'Start een gesprek' : 'Start a conversation'}</button>
        </div>` : ''}
    </div>`;
}
