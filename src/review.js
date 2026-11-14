// ── Review: one queue for everything that is due ──────────────────────────────
// Every course (course path, vocabulary, numbers, verbs, cases, prefixes) is
// scheduled with the same SM-2 code and hands over its due items as course-engine
// cards, so they can be shuffled into a single round. The hub shows that one
// button first, then a row per course for reviewing a single subject.

import { state, getTTSLang } from './state.js';
import { calcSimilarity, escHtml, levenshtein } from './utils.js';
import { showScreen } from './router.js';
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
import { runSession, registerDueSource } from './grammar/course-engine.js';
import { L, shuffle } from './grammar/drill-core.js';
import { COURSE_ICON, courseName } from './course-names.js';

function getScreen() { return document.getElementById('reviewScreen'); }

// ── The courses ──────────────────────────────────────────────────────────────
// A new course is one entry here: hub row, due totals, Today card, Progress
// screen and the mixed round all follow. langs: 'all', or the targets it exists for.

const COURSES = [
  { id: 'path', langs: ['uk'], unit: { en: 'words & sentences', nl: 'woorden & zinnen' },
    fresh: { en: 'Not started — open unit A1 · 1', nl: 'Nog niet gestart — open unit A1 · 1' },
    stats: pathStats, dueCards: pathDueCards, review: 'startPathReview()', open: 'openPathScreen()' },
  { id: 'vocab', langs: ['uk'], unit: { en: 'words', nl: 'woorden' },
    fresh: { en: 'Not started — learn 10 new words', nl: 'Nog niet gestart — leer 10 nieuwe woorden' },
    stats: vocabStats, dueCards: vocabDueCards, review: 'startVocabReview()', open: 'openVocabDrillScreen()' },
  // The other target languages have no core list: their deck is the words saved from conversations.
  { id: 'mywords', langs: ['nl', 'en', 'fr'], unit: { en: 'words', nl: 'woorden' },
    fresh: { en: 'Tap a word in a conversation to save it, then learn it here', nl: 'Tik op een woord in een gesprek om het op te slaan en leer het dan hier' },
    stats: vocabStats, dueCards: vocabDueCards, review: 'startVocabReview()', open: 'openVocabDrillScreen()' },
  { id: 'numbers', langs: ['uk'], unit: { en: 'numbers & times', nl: 'getallen & tijden' },
    fresh: { en: 'Not started — learn 0 to 10', nl: 'Nog niet gestart — leer 0 tot 10' },
    stats: numbersStats, dueCards: numbersDueCards, review: 'startNumbersReview()', open: 'openNumbersDrillScreen()' },
  { id: 'verbs', langs: ['uk'], unit: { en: 'verb tenses', nl: 'werkwoordstijden' },
    fresh: { en: 'Not started — pick a verb under Learn One', nl: 'Nog niet gestart — kies een werkwoord bij Leer één' },
    stats: verbStats, dueCards: verbDueCards, review: 'startVerbReview()', open: 'openVerbDrillScreen()' },
  { id: 'cases', langs: ['uk'], unit: { en: 'nouns', nl: 'woorden' },
    fresh: { en: 'Not started — pick a noun under Learn One', nl: 'Nog niet gestart — kies een woord bij Leer één' },
    stats: caseStats, dueCards: caseDueCards, review: 'startCaseReview()', open: 'openCaseDrillScreen()' },
  { id: 'prefixes', langs: ['uk'], unit: { en: 'prefixed verbs', nl: 'werkwoorden met voorvoegsel' },
    fresh: { en: 'Not started — learn the first word family', nl: 'Nog niet gestart — leer de eerste woordfamilie' },
    stats: prefixStats, dueCards: prefixDueCards, review: 'startPrefixReview()', open: 'openPrefixDrillScreen()' },
];
// Name and icon come from course-names.js, so every list calls a course the same.
COURSES.forEach(c => { c.icon = COURSE_ICON[c.id] || COURSE_ICON.vocab; Object.defineProperty(c, 'name', { get: () => courseName(c.id) }); });
const activeCourses = () => COURSES.filter(c => c.langs === 'all' || c.langs.includes(state.currentLanguage));

// The courses of the current target language, for the Progress screen.
export const getCourses = () => activeCourses();

// Everything due across the courses.
export const getCourseDue = () => activeCourses().reduce((n, c) => n + c.stats().due, 0);

// Everything waiting, for the home badge and the Today card.
export const getDueTotal = () => getCourseDue();

// Sessions that teach something new start with a few of these (course-engine warm-up).
registerDueSource({ cards: () => activeCourses().flatMap(c => c.dueCards()), count: getCourseDue });

// ── Catch-up ─────────────────────────────────────────────────────────────────
// After a break the queue can be hundreds deep. Catch-up spreads it: the learner
// takes a daily share (the queue over seven days) and the rest simply waits;
// nothing is rescheduled. { date, share, done } under 'reviewCatchUp'.
const CATCH_KEY = 'reviewCatchUp';
const CATCH_FROM = 100, CATCH_DAYS = 7;
const today = () => new Date().toISOString().slice(0, 10);
function catchUp() {
  try { const c = JSON.parse(localStorage.getItem(CATCH_KEY)); return c && c.date === today() ? c : null; } catch { return null; }
}
const saveCatchUp = c => localStorage.setItem(CATCH_KEY, JSON.stringify(c));
export function startCatchUp() { saveCatchUp({ date: today(), share: Math.ceil(getCourseDue() / CATCH_DAYS), done: 0 }); }
function stopCatchUp() { localStorage.removeItem(CATCH_KEY); }
// How many the mixed round may take right now: the daily share left, or the usual cap.
function roundSize() {
  const c = catchUp();
  return c ? Math.max(0, Math.min(REVIEW_ROUND, c.share - c.done)) : REVIEW_ROUND;
}
function countDone(n) { const c = catchUp(); if (c) saveCatchUp({ ...c, done: c.done + n }); }

// ── Sessions ─────────────────────────────────────────────────────────────────

const REVIEW_ROUND = 30;

export function startReviewAll() {
  showScreen('reviewScreen');
  const cards = shuffle(activeCourses().flatMap(c => c.dueCards())).slice(0, roundSize());
  runSession({
    screen: getScreen(), icon: '🔄', title: L('Review', 'Herhalen'), mixed: true,
    cards,
    onExit: openReviewScreen,
    again: () => {
      countDone(cards.length);
      const left = getCourseDue(), c = catchUp();
      if (c && c.done >= c.share) return left ? { label: L(`✓ Done for today · ${left} wait for tomorrow`, `✓ Klaar voor vandaag · ${left} wachten tot morgen`), run: openReviewScreen } : null;
      return left ? { label: L(`🔄 Keep going: ${left} left`, `🔄 Verder: nog ${left}`), run: startReviewAll } : null;
    },
  });
}
window.startCatchUp = () => { startCatchUp(); openReviewScreen(); };
window.stopCatchUp = () => { stopCatchUp(); openReviewScreen(); };


// ── The hub ──────────────────────────────────────────────────────────────────

// The big review button, or the catch-up offer / state when the queue is deep.
function catchUpHtml(courseDue, nl) {
  const c = catchUp();
  if (!courseDue) return `<button class="rv-all-btn" disabled><span class="rv-all-title">🔄 ${nl ? 'Niets aan de beurt' : 'Nothing due right now'}</span></button>`;
  if (c) {
    const left = Math.max(0, c.share - c.done);
    const title = left ? (nl ? `🔄 Vandaag nog ${left} van je deel (${c.share})` : `🔄 ${left} of today's share (${c.share}) to go`) : (nl ? `✓ Klaar voor vandaag` : `✓ Done for today`);
    const sub = nl ? `Inhalen: ${courseDue} aan de beurt, verdeeld over ${CATCH_DAYS} dagen. De rest wacht gewoon.` : `Catching up: ${courseDue} due, spread over ${CATCH_DAYS} days. The rest just waits.`;
    return `<button class="rv-all-btn" ${left ? 'onclick="startReviewAll()"' : 'disabled'}><span class="rv-all-title">${title}</span><span class="rv-all-sub">${sub}</span></button>
      <button class="rv-catch-link" onclick="stopCatchUp()">${nl ? 'Toch alles tonen' : 'Show everything anyway'}</button>`;
  }
  const offer = courseDue >= CATCH_FROM ? `<button class="rv-catch-btn" onclick="startCatchUp()">🗓️ ${nl ? `Veel ineens? Verdeel ${courseDue} over ${CATCH_DAYS} dagen (${Math.ceil(courseDue / CATCH_DAYS)} per dag)` : `A lot at once? Spread ${courseDue} over ${CATCH_DAYS} days (${Math.ceil(courseDue / CATCH_DAYS)} a day)`}</button>` : '';
  return `<button class="rv-all-btn" onclick="startReviewAll()">
      <span class="rv-all-title">🔄 ${nl ? `Herhaal alles: ${courseDue} aan de beurt` : `Review everything: ${courseDue} due`}</span>
      <span class="rv-all-sub">${nl ? 'Alles wat aan de beurt is, door elkaar, in één ronde' : 'Everything that is due, mixed, in one round'}</span>
    </button>${offer}`;
}

export function openReviewScreen() {
  showScreen('reviewScreen');
  const nl = state.nativeLanguage === 'nl';
  const courseDue = getCourseDue();

  const row = (icon, title, sub, count, total, onclick, disabled) => `
    <button class="rv-row ${disabled ? 'rv-row-disabled' : ''}" ${disabled ? 'disabled' : `onclick="${onclick}"`}>
      <span class="rv-row-icon">${icon}</span>
      <span class="rv-row-text">
        <span class="rv-row-title">${title}</span>
        <span class="rv-row-sub">${sub}</span>
      </span>
      <span class="rv-row-count ${count ? 'rv-row-due' : ''}">${count ? count : total}</span>
    </button>`;

  // A row per course the learner has started; a course that was never opened has
  // nothing to review and lives in the hub, not here.
  const courseRow = c => {
    const st = c.stats();
    const sub = nl ? `${st.due} aan de beurt · ${st.seen} gezien, ${st.learned} geleerd van ${st.total}` : `${st.due} due · ${st.seen} seen, ${st.learned} learned of ${st.total}`;
    return row(c.icon, c.name, sub, st.due, st.learned, st.due ? c.review : c.open, false);
  };
  const started = activeCourses().filter(c => c.stats().seen > 0);

  getScreen().innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" onclick="showScreen('homeScreen')">←</button>
      <div>
        <div class="lesson-title">${nl ? '🔄 Herhalen' : '🔄 Review'}</div>
        <div class="lesson-subtitle">${nl ? 'Wat vandaag aan de beurt is' : 'What is due today'}</div>
      </div>
    </div>
    ${catchUpHtml(courseDue, nl)}
    <div class="rv-hub">
      ${started.map(courseRow).join('')}
      ${started.length ? '' : `
        <div class="rv-empty-note">${nl
          ? 'Hier komt terug wat je geleerd hebt, steeds vlak voordat je het zou vergeten. Zodra je iets geleerd hebt, staat het hier.'
          : 'What you have learned comes back here, each time just before you would forget it. As soon as you have learned something, it shows up here.'}</div>
        <div class="rv-empty">
          <button class="rv-empty-btn" onclick="openPathScreen()">🗺️ ${nl ? 'Begin het leerpad' : 'Start the course path'}</button>
        </div>`}
    </div>`;
}
