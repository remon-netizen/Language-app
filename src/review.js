// ── Review: one queue for everything that is due ──────────────────────────────
// Every course (vocabulary, numbers, verbs, cases, prefixes) and the phrases from
// lessons are scheduled with the same SM-2 code and hand over their due items as
// course-engine cards, so they can be shuffled into a single round. The hub shows
// that one button first, then a row per course for reviewing a single subject.
//
// Phrases are the opposite of the lesson flow: a lesson is imitation (hear the
// phrase, repeat it), review is recall (see the meaning, say or type the phrase).

import { state, getTTSLang } from './state.js';
import { calcSimilarity, escHtml, levenshtein } from './utils.js';
import { showScreen } from './router.js';
import { getTranslation, getTip } from './data/lesson-helpers.js';
import { getWordsCount } from './words.js';
import { getLearnedCount, getDuePhrases, recordPhrase, regradePhrase, phraseStats } from './data/phrases.js';
import { vocabStats } from './data/vocab-progress.js';
import { numbersStats } from './data/numbers-progress.js';
import { verbStats } from './data/verb-progress.js';
import { caseStats } from './data/case-progress.js';
import { prefixStats } from './data/prefix-progress.js';
import { vocabDueCards } from './grammar/vocab-drill-ui.js';
import { numbersDueCards } from './grammar/numbers-drill-ui.js';
import { verbDueCards } from './grammar/verb-drill-ui.js';
import { caseDueCards } from './grammar/case-drill-ui.js';
import { prefixDueCards } from './grammar/prefix-drill-ui.js';
import { runSession } from './grammar/course-engine.js';
import { L, shuffle } from './grammar/drill-core.js';

// lesson.js, main.js and the progress screen reach the phrase store through here.
export { markPhraseAsLearned, getLearnedCount, getDuePhrases } from './data/phrases.js';

function getScreen() { return document.getElementById('reviewScreen'); }

// ── Phrase cards ─────────────────────────────────────────────────────────────

const PHRASES = { icon: '🗣️', get name() { return L('Phrases from lessons', 'Zinnen uit lessen'); } };

// 0–100: how close a typed phrase is, ignoring case, punctuation and apostrophe style.
function typedScore(typed, target) {
  const norm = s => s.toLowerCase().replace(/[’ʼ`´‘]/g, "'").replace(/[.,!?;:"«»—\-]/g, '').replace(/\s+/g, ' ').trim();
  const a = norm(typed), b = norm(target);
  if (a === b) return 100;
  return Math.max(0, Math.round((1 - levenshtein(a, b) / (Math.max(a.length, b.length) || 1)) * 100));
}

// 85 and up is remembered, 60 and up is close enough to count, below that it comes back tomorrow.
const verdict = score => ({
  isExact: score >= 85, isClose: score >= 60 && score < 85, isCorrect: score >= 60,
  quality: score >= 85 ? 5 : score >= 60 ? 3 : 1, score,
  headline: score >= 85 ? `${score}% — ${L('you remembered it', 'je wist het nog')}` : score >= 60 ? `${score}% — ${L('close enough', 'bijna goed')}` : '',
});

function phraseCard(p) {
  const tip = getTip(p, state.nativeLanguage);
  return {
    key: `phrase:${p.target}`, course: PHRASES, intro: false,
    promptHtml: `
      <div class="review-card">
        <div class="review-prompt">${L('How do you say this?', 'Hoe zeg je dit?')}</div>
        <div class="review-translation">${escHtml(getTranslation(p, state.nativeLanguage))}</div>
        ${tip ? `<div class="review-tip">${escHtml(tip)}</div>` : ''}
        ${p.ph ? `<details class="review-hint"><summary>💡 ${L('Show hint', 'Toon hint')}</summary>[ ${escHtml(p.ph)} ]</details>` : ''}
      </div>`,
    input: { type: 'text', lang: state.currentLanguage, placeholder: L('Type it in the language you are learning…', 'Typ het in de taal die je leert…'),
             speak: { lang: getTTSLang(), check: heard => verdict(calcSimilarity(p.target.toLowerCase().trim(), (heard[0] || '').toLowerCase())) } },
    check: answer => verdict(typedScore(answer, p.target)),
    record: res => recordPhrase(p.target, res.score, res.quality),
    override: before => regradePhrase(p.target, before, 4),   // the microphone mishears
    compareOnClose: true,
    correctText: p.target,
    detailHtml: p.ph ? `<div class="review-answer-phonetic">[ ${escHtml(p.ph)} ]</div>` : '',
    say: p.target, sayAfter: true,
    missed: { left: getTranslation(p, state.nativeLanguage), right: p.target, extra: '' },
  };
}

// Never-reviewed phrases first, then the longest overdue.
const phraseDueCards = () => getDuePhrases().sort((a, b) => a.nextReview - b.nextReview).map(phraseCard);

// ── The courses ──────────────────────────────────────────────────────────────
// A new course is one entry here: hub row, due totals, Today card, Progress
// screen and the mixed round all follow. langs: 'all', or the targets it exists for.

const COURSES = [
  { id: 'phrases', langs: 'all', icon: '🗣️', name: { en: 'Phrases from lessons', nl: 'Zinnen uit lessen' }, unit: { en: 'phrases', nl: 'zinnen' },
    fresh: { en: 'Nothing learned yet — do a lesson first', nl: 'Nog niets geleerd — doe eerst een les' },
    sub: (st, nl) => (nl ? `${st.due} van ${st.total} aan de beurt · zeggen of typen uit je hoofd` : `${st.due} of ${st.total} due · say or type them from memory`),
    stats: phraseStats, dueCards: phraseDueCards, review: 'startPhraseReview()', open: 'openLessonBrowse()' },
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

// The drill courses of the current target language, for the Progress screen
// (phrases have their own row there, next to the lessons).
export const getCourses = () => activeCourses().filter(c => c.id !== 'phrases');

// Everything due across the courses, phrases included.
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

// Ten phrases a round: recall takes longer than a single word.
export function startPhraseReview() {
  showScreen('reviewScreen');
  runSession({
    screen: getScreen(), icon: PHRASES.icon, title: PHRASES.name,
    cards: phraseDueCards().slice(0, 10),
    onExit: openReviewScreen,
    again: () => (getDuePhrases().length ? { label: '🔄 ' + L('Another round', 'Nog een ronde'), run: startPhraseReview } : null),
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
    const started = c.id === 'phrases' ? st.total > 0 : st.seen > 0;
    const sub = !started ? pick(c.fresh) : c.sub ? c.sub(st, nl)
      : nl ? `${st.due} aan de beurt · ${st.seen} gezien, ${st.learned} geleerd van ${st.total}` : `${st.due} due · ${st.seen} seen, ${st.learned} learned of ${st.total}`;
    return row(c.icon, pick(c.name), sub, st.due, started ? (c.id === 'phrases' ? st.total : st.learned) : '→', st.due ? c.review : c.open, false);
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
      ${getLearnedCount() === 0 && words === 0 ? `
        <div class="rv-empty">
          <button class="rv-empty-btn" onclick="openLessonBrowse()">📖 ${nl ? 'Naar de lessen' : 'Go to lessons'}</button>
          <button class="rv-empty-btn" onclick="openFreeChat()">💬 ${nl ? 'Start een gesprek' : 'Start a conversation'}</button>
        </div>` : ''}
    </div>`;
}
