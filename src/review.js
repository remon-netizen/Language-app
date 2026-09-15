// Review system — spaced recall practice for learned phrases.
//
// Flow: see/hear the native translation → try to say the target phrase
// from memory → score pronunciation → reveal the correct answer.
//
// This is the OPPOSITE of the lesson flow (which is imitation):
// Lessons:  hear target → repeat target
// Review:   see meaning → produce target from memory

import { state, getTTSLang } from './state.js';
import { calcSimilarity, escHtml } from './utils.js';
import { showScreen } from './router.js';
import { setupRecognition } from './speech.js';
import { speakText, speakSlow } from './voice.js';
import { getTargetText, getTranslation, getTip } from './data/lesson-helpers.js';
import { t } from './i18n.js';
import { getDueWords, getWordsCount } from './words.js';
import { vocabStats } from './data/vocab-progress.js';
import { levenshtein } from './utils.js';
import { markActivity } from './data/activity.js';

// ── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'learnedPhrases';

function loadLearned() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveLearned(phrases) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(phrases));
}

// Save a phrase after it's been practised in a lesson.
// Deduplicates by target text. Updates lastPractised timestamp.
export function markPhraseAsLearned(phrase) {
  const target = getTargetText(phrase);
  if (!target) return;

  const learned = loadLearned();
  const existing = learned.find(p => p.target === target);

  if (existing) {
    existing.lastPractised = Date.now();
    existing.practiceCount = (existing.practiceCount || 0) + 1;
  } else {
    learned.push({
      target,
      ph: phrase.ph || '',
      translations: phrase.translations || {},
      tip: phrase.tip || {},
      firstLearned: Date.now(),
      lastPractised: Date.now(),
      lastReviewed: 0,
      practiceCount: 1,
      reviewScore: 0,   // rolling average of review scores
      lang: state.currentLanguage,
    });
  }
  saveLearned(learned);
}

export function getLearnedCount() {
  return loadLearned().filter(p => p.lang === state.currentLanguage).length;
}

// Strong phrases wait longer before they count as due. This is the same
// cooldown curve the session ordering uses: score 0 → now, 50 → ~6h,
// 80 → ~24h, 95 → ~72h. Never-reviewed phrases are always due.
function cooldownHours(score) { return Math.pow(score / 100, 2) * 72; }
export function getDuePhrases() {
  const now = Date.now(), HOUR = 3600_000;
  return loadLearned().filter(p => {
    if (p.lang !== state.currentLanguage) return false;
    if (!p.lastReviewed) return true;
    return (now - p.lastReviewed) / HOUR >= cooldownHours(p.reviewScore || 0);
  });
}
// Phrases + words waiting, for the home badge and the Today card.
export function getDueTotal() {
  const vocabDue = state.currentLanguage === 'uk' ? vocabStats().due : 0;
  return getDuePhrases().length + getDueWords().length + vocabDue;
}

// ── Review session state ─────────────────────────────────────────────────────

let review = {
  phrases: [],
  current: 0,
  scores: [],
  recognition: null,
  isRecording: false,
  revealed: false,
};

// ── Public entry ─────────────────────────────────────────────────────────────

// The review hub: one place for everything that is due, whichever system
// scheduled it. Phrases (from lessons) are spoken from memory; words (saved
// from conversations) are typed or flipped as flashcards.
export function openReviewScreen() {
  showScreen('reviewScreen');
  const nl = state.nativeLanguage === 'nl';
  const learned = getLearnedCount();
  const duePhrases = getDuePhrases().length;
  const words = getWordsCount();
  const dueWords = getDueWords().length;
  const vs = state.currentLanguage === 'uk' ? vocabStats() : null;
  const s = getScreen();

  const row = (icon, title, sub, count, total, onclick, disabled) => `
    <button class="rv-row ${disabled ? 'rv-row-disabled' : ''}" ${disabled ? 'disabled' : `onclick="${onclick}"`}>
      <span class="rv-row-icon">${icon}</span>
      <span class="rv-row-text">
        <span class="rv-row-title">${title}</span>
        <span class="rv-row-sub">${sub}</span>
      </span>
      <span class="rv-row-count ${count ? 'rv-row-due' : ''}">${count ? count : total}</span>
    </button>`;

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" onclick="showScreen('homeScreen')">←</button>
      <div>
        <div class="lesson-title">${nl ? '🔄 Herhalen' : '🔄 Review'}</div>
        <div class="lesson-subtitle">${nl ? 'Wat vandaag aan de beurt is' : 'What is due today'}</div>
      </div>
    </div>
    <div class="rv-hub">
      ${row('🗣️', nl ? 'Zinnen uit lessen' : 'Phrases from lessons',
            learned ? (nl ? `${duePhrases} van ${learned} aan de beurt · uit je hoofd zeggen` : `${duePhrases} of ${learned} due · say them from memory`)
                    : (nl ? 'Nog niets geleerd — doe eerst een les' : 'Nothing learned yet — do a lesson first'),
            duePhrases, learned, 'startPhraseReview()', learned === 0)}
      ${row('📇', nl ? 'Woorden uit gesprekken' : 'Words from conversations',
            words ? (nl ? `${dueWords} van ${words} aan de beurt · typen of omdraaien` : `${dueWords} of ${words} due · type or flip`)
                  : (nl ? 'Nog geen woorden — tik op een woord in een gesprek' : 'No words yet — tap a word in a conversation'),
            dueWords, words, 'openFlashcardScreen()', words === 0)}
      ${vs ? row('🧠', nl ? 'Woordenschat (kernwoorden)' : 'Vocabulary deck (core words)',
            vs.seen ? (nl ? `${vs.due} aan de beurt · ${vs.seen} gezien, ${vs.learned} geleerd van ${vs.total}` : `${vs.due} due · ${vs.seen} seen, ${vs.learned} learned of ${vs.total}`)
                    : (nl ? 'Nog niet gestart — leer 10 nieuwe woorden' : 'Not started — learn 10 new words'),
            vs.due, vs.seen ? vs.learned : '→', vs.due ? 'startVocabReview()' : 'openVocabDrillScreen()', false) : ''}
      ${learned === 0 && words === 0 ? `
        <div class="rv-empty">
          <button class="rv-empty-btn" onclick="openLessonBrowse()">📖 ${nl ? 'Naar de lessen' : 'Go to lessons'}</button>
          <button class="rv-empty-btn" onclick="openFreeChat()">💬 ${nl ? 'Start een gesprek' : 'Start a conversation'}</button>
        </div>` : ''}
    </div>`;
}

export function startPhraseReview() {
  const all = loadLearned().filter(p => p.lang === state.currentLanguage);
  if (all.length === 0) { openReviewScreen(); return; }

  // ── Smart spaced repetition ──────────────────────────────────────────────
  // Each phrase gets an urgency score. Higher urgency = reviewed sooner.
  //
  // Factors:
  //  1. Low review score → high urgency  (you struggle with this phrase)
  //  2. Long time since last review → high urgency  (it's fading from memory)
  //  3. Never reviewed → highest urgency  (brand new, needs first review)
  //  4. Small random jitter so sessions don't feel repetitive
  //
  // Strong phrases (high reviewScore) get a longer "cooldown" before they
  // become urgent again — this is the core spaced-repetition idea.

  const now = Date.now();
  const HOUR = 3600_000;

  all.forEach(p => {
    const score       = p.reviewScore || 0;       // 0–100 rolling average
    const lastReview  = p.lastReviewed || 0;
    const hoursSince  = lastReview ? (now - lastReview) / HOUR : 999;

    // Cooldown: strong phrases need more hours to pass before they're urgent.
    // score 0 → cooldown 0h (review immediately)
    // score 50 → cooldown ~6h
    // score 80 → cooldown ~24h
    // score 95 → cooldown ~72h
    const cooldownHours = Math.pow(score / 100, 2) * 72;
    const overdue       = hoursSince - cooldownHours; // positive = overdue

    // Weakness boost: phrases with low scores get extra urgency.
    // score 0 → +100, score 50 → +50, score 90 → +10
    const weaknessBoost = 100 - score;

    // Never-reviewed bonus: brand new phrases get a big push.
    const newBonus = lastReview === 0 ? 200 : 0;

    // Random jitter (0–15) so tied phrases shuffle each session.
    const jitter = Math.random() * 15;

    p._urgency = overdue + weaknessBoost + newBonus + jitter;
  });

  // Sort by urgency descending (most urgent first).
  all.sort((a, b) => b._urgency - a._urgency);

  // Take up to 10 phrases for this review session.
  review.phrases = all.slice(0, 10);
  review.current = 0;
  review.scores = [];
  review.revealed = false;

  showScreen('reviewScreen');
  renderReviewCard();
}

// ── Rendering ────────────────────────────────────────────────────────────────

function getScreen() {
  return document.getElementById('reviewScreen');
}

function renderReviewCard() {
  const p = review.phrases[review.current];
  const total = review.phrases.length;
  const native = state.nativeLanguage;
  const translation = getTranslation(p, native);
  const tip = getTip(p, native);

  const lblTitle    = native === 'nl' ? '🔄 Herhaling' : '🔄 Review';
  const lblSubtitle = native === 'nl' ? `Zin ${review.current + 1} van ${total}` : `Phrase ${review.current + 1} of ${total}`;
  const lblPrompt   = native === 'nl' ? 'Hoe zeg je dit?' : 'How do you say this?';
  const lblHear     = native === 'nl' ? '🔊 Hoor betekenis' : '🔊 Hear meaning';
  const lblHint     = native === 'nl' ? '💡 Toon hint' : '💡 Show hint';
  const lblSpeak    = native === 'nl' ? '🎙️ Spreek' : '🎙️ Speak';
  const lblStop     = native === 'nl' ? '⏹ Stop' : '⏹ Stop';

  review.revealed = false;
  const s = getScreen();

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="reviewBack">←</button>
      <div>
        <div class="lesson-title">${lblTitle}</div>
        <div class="lesson-subtitle">${lblSubtitle}</div>
      </div>
    </div>

    <div class="review-card">
      <div class="review-prompt">${lblPrompt}</div>
      <div class="review-translation">${escHtml(translation)}</div>
      ${tip ? `<div class="review-tip">${escHtml(tip)}</div>` : ''}
      <div class="review-answer" id="reviewAnswer" style="display:none">
        <div class="review-answer-label">${native === 'nl' ? 'Antwoord:' : 'Answer:'}</div>
        <div class="review-answer-target" id="reviewTarget"></div>
        <div class="review-answer-phonetic" id="reviewPhonetic"></div>
      </div>
    </div>

    <div class="review-type-row">
      <input type="text" class="review-type-input" id="reviewInput" lang="${state.currentLanguage}"
        placeholder="${native === 'nl' ? 'Typ het in het Oekraïens…' : 'Type it in the target language…'}"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
      <button class="review-type-check" id="reviewCheckBtn" type="button">${native === 'nl' ? 'Controleer' : 'Check'} ✓</button>
    </div>
    <div class="review-or">${native === 'nl' ? 'of zeg het hardop' : 'or say it out loud'}</div>
    <div class="controls" style="margin-top:0">
      <button class="btn btn-speak" id="reviewSpeakBtn">${lblSpeak}</button>
      <button class="btn btn-translation" id="reviewHearBtn">${lblHear}</button>
      <button class="btn btn-listen-slow" id="reviewHintBtn">${lblHint}</button>
    </div>

    <div class="feedback-area" id="reviewFeedback"></div>
    <button class="next-btn" id="reviewNextBtn" style="display:none">${
      review.current + 1 >= total
        ? (native === 'nl' ? '🏁 Bekijk resultaten' : '🏁 See results')
        : (native === 'nl' ? 'Volgende →' : 'Next →')
    }</button>
  `;

  s.querySelector('#reviewBack').addEventListener('click', () => openReviewScreen());

  // Hear the translation in native language
  s.querySelector('#reviewHearBtn').addEventListener('click', () => {
    const nativeTTS = native === 'nl' ? 'nl-NL' : 'en-GB';
    speakText(translation, nativeTTS);
  });

  // Show hint: reveal phonetic transcription
  s.querySelector('#reviewHintBtn').addEventListener('click', () => {
    const hintEl = document.getElementById('reviewAnswer');
    const phoneticEl = document.getElementById('reviewPhonetic');
    hintEl.style.display = 'block';
    document.getElementById('reviewTarget').textContent = '???';
    phoneticEl.textContent = `[ ${p.ph} ]`;
  });

  // Speak: record and compare
  const speakBtn = s.querySelector('#reviewSpeakBtn');
  speakBtn.addEventListener('click', () => toggleReviewSpeak(speakBtn));

  s.querySelector('#reviewNextBtn').addEventListener('click', nextReviewCard);

  // Typed recall: same scoring path as speech, so the spaced queue treats both alike.
  const input = s.querySelector('#reviewInput');
  const check = () => {
    const typed = input.value.trim();
    if (!typed || review.revealed) { input.focus(); return; }
    input.disabled = true;
    s.querySelector('#reviewCheckBtn').disabled = true;
    const score = typedScore(typed, p.target);
    input.classList.add(score >= 85 ? 'correct' : score >= 60 ? 'close' : 'wrong');
    processReviewResult([typed], score);
  };
  s.querySelector('#reviewCheckBtn').addEventListener('click', check);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
  input.focus({ preventScroll: true });
}

// 0–100 similarity of a typed phrase to the target, ignoring case, punctuation
// and apostrophe variants. Exact → 100; a slip or two in a long phrase still
// scores high, a different phrase scores low.
function typedScore(typed, target) {
  const norm = s => s.toLowerCase().replace(/[’ʼ`´‘]/g, "'").replace(/[.,!?;:"«»—\-]/g, '').replace(/\s+/g, ' ').trim();
  const a = norm(typed), b = norm(target);
  if (a === b) return 100;
  const lev = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length) || 1;
  return Math.max(0, Math.round((1 - lev / maxLen) * 100));
}

// ── Speech recognition ───────────────────────────────────────────────────────

function toggleReviewSpeak(btn) {
  if (review.isRecording) {
    if (review.recognition) review.recognition.stop();
    return;
  }
  review.isRecording = true;
  const native = state.nativeLanguage;
  btn.textContent = native === 'nl' ? '⏹ Stop' : '⏹ Stop';
  btn.classList.add('recording');

  review.recognition = setupRecognition(getTTSLang(), (event) => {
    const results = Array.from(event.results[0]).map(r => r.transcript.trim().toLowerCase());
    processReviewResult(results);
  }, () => {
    review.isRecording = false;
    btn.textContent = native === 'nl' ? '🎙️ Spreek' : '🎙️ Speak';
    btn.classList.remove('recording');
  });
  if (review.recognition) review.recognition.start();
}

function processReviewResult(recognizedList, presetScore) {
  const p = review.phrases[review.current];
  const target = p.target.toLowerCase().trim();
  const heard = recognizedList[0] || '';
  const score = presetScore !== undefined ? presetScore : calcSimilarity(target, heard);
  review.scores.push(score);
  review.revealed = true;
  markActivity();
  const ri = document.getElementById('reviewInput');
  if (ri) { ri.disabled = true; const cb = document.getElementById('reviewCheckBtn'); if (cb) cb.disabled = true; }

  // Update the stored phrase's review data
  const learned = loadLearned();
  const stored = learned.find(lp => lp.target === p.target);
  if (stored) {
    stored.lastReviewed = Date.now();
    stored.reviewScore = stored.reviewScore
      ? Math.round(stored.reviewScore * 0.6 + score * 0.4)  // rolling average
      : score;
    saveLearned(learned);
  }

  showReviewFeedback(score, heard, p);
}

function showReviewFeedback(score, heard, phrase) {
  const native = state.nativeLanguage;
  const fb = document.getElementById('reviewFeedback');
  let cls, emoji, msg;

  if (score >= 85) {
    cls = 'excellent'; emoji = '🎉';
    msg = native === 'nl' ? 'Uitstekend! Je herinnerde het perfect!' : 'Excellent! You remembered it perfectly!';
  } else if (score >= 60) {
    cls = 'good'; emoji = '👍';
    msg = native === 'nl' ? 'Goed bezig! Bijna perfect.' : 'Good job! Almost perfect.';
  } else if (score > 0) {
    cls = 'try-again'; emoji = '🔄';
    msg = native === 'nl' ? 'Bijna — bekijk het juiste antwoord hieronder.' : 'Close — check the correct answer below.';
  } else {
    cls = 'no-speech'; emoji = '🎙️';
    msg = native === 'nl' ? 'Niets gehoord. Probeer het nog eens.' : 'Nothing detected. Try again.';
  }

  fb.className = `feedback-area show ${cls}`;
  fb.innerHTML = `
    <div class="feedback-score ${cls}">${heard ? `${emoji} ${score}%` : emoji}</div>
    <div class="feedback-text">${msg}</div>
    ${heard ? `<div class="feedback-heard">${document.getElementById('reviewInput')?.value.trim() === heard ? (native === 'nl' ? 'Jij typte:' : 'You typed:') : (native === 'nl' ? 'Ik hoorde:' : 'I heard:')} <span>"${escHtml(heard)}"</span></div>` : ''}
  `;

  // Reveal the correct answer
  const answerEl = document.getElementById('reviewAnswer');
  answerEl.style.display = 'block';
  document.getElementById('reviewTarget').textContent = phrase.target;
  document.getElementById('reviewPhonetic').textContent = `[ ${phrase.ph} ]`;

  // Play the correct pronunciation so they hear how it should sound
  setTimeout(() => speakText(phrase.target, getTTSLang()), 500);

  // Show the next button and hand it focus so Enter advances
  const nb = document.getElementById('reviewNextBtn');
  nb.style.display = '';
  nb.focus({ preventScroll: true });
}

function nextReviewCard() {
  review.current++;
  if (review.current >= review.phrases.length) {
    showReviewComplete();
  } else {
    renderReviewCard();
  }
}

// ── Completion screen ────────────────────────────────────────────────────────

function showReviewComplete() {
  const native = state.nativeLanguage;
  const total = review.scores.length;
  const avg = total ? Math.round(review.scores.reduce((a, b) => a + b, 0) / total) : 0;
  const perfect = review.scores.filter(s => s >= 85).length;
  const good = review.scores.filter(s => s >= 60 && s < 85).length;
  const emoji = avg >= 85 ? '🏆' : avg >= 60 ? '🎉' : '💪';

  const s = getScreen();
  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" onclick="openReviewScreen()">←</button>
      <div>
        <div class="lesson-title">${native === 'nl' ? '🔄 Herhaling klaar!' : '🔄 Review complete!'}</div>
      </div>
    </div>
    <div class="lesson-complete show">
      <div class="complete-icon">${emoji}</div>
      <div class="complete-title">${avg}%</div>
      <div class="complete-subtitle">${
        native === 'nl'
          ? `Je hebt ${review.phrases.length} zinnen herhaald`
          : `You reviewed ${review.phrases.length} phrases`
      }</div>
      <div class="complete-stats">
        <div class="stat-box"><div class="num">${perfect}</div><div class="label">${native === 'nl' ? 'Perfect' : 'Perfect'}</div></div>
        <div class="stat-box"><div class="num">${good}</div><div class="label">${native === 'nl' ? 'Goed' : 'Good'}</div></div>
        <div class="stat-box"><div class="num">${avg}%</div><div class="label">${native === 'nl' ? 'Gem. score' : 'Avg score'}</div></div>
      </div>
      <button class="btn-level-up" onclick="startNewReview()">${native === 'nl' ? '🔄 Nog een ronde' : '🔄 Another round'}</button>
      <button class="next-btn" onclick="openReviewScreen()">${native === 'nl' ? '← Terug naar herhalen' : '← Back to review'}</button>
    </div>
  `;
}

// Alias for the onclick — starts another phrase round.
export function startNewReview() {
  startPhraseReview();
}
