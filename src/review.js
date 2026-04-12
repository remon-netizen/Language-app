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

export function openReviewScreen() {
  const all = loadLearned().filter(p => p.lang === state.currentLanguage);
  if (all.length === 0) {
    alert(state.nativeLanguage === 'nl'
      ? 'Nog geen zinnen geleerd. Voltooi eerst een les!'
      : 'No phrases learned yet. Complete a lesson first!');
    return;
  }

  // Prioritise phrases that haven't been reviewed recently.
  // Simple sort: least-recently-reviewed first, then oldest first.
  all.sort((a, b) => (a.lastReviewed || 0) - (b.lastReviewed || 0));

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

    <div class="controls">
      <button class="btn btn-translation" id="reviewHearBtn">${lblHear}</button>
      <button class="btn btn-listen-slow" id="reviewHintBtn">${lblHint}</button>
    </div>
    <div class="controls" style="margin-top:0">
      <button class="btn btn-speak" id="reviewSpeakBtn">${lblSpeak}</button>
    </div>

    <div class="feedback-area" id="reviewFeedback"></div>
    <button class="next-btn" id="reviewNextBtn" style="display:none">${
      review.current + 1 >= total
        ? (native === 'nl' ? '🏁 Bekijk resultaten' : '🏁 See results')
        : (native === 'nl' ? 'Volgende →' : 'Next →')
    }</button>
  `;

  s.querySelector('#reviewBack').addEventListener('click', () => showScreen('homeScreen'));

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

function processReviewResult(recognizedList) {
  const p = review.phrases[review.current];
  const target = p.target.toLowerCase().trim();
  const heard = recognizedList[0] || '';
  const score = calcSimilarity(target, heard);
  review.scores.push(score);

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
    ${heard ? `<div class="feedback-heard">${native === 'nl' ? 'Ik hoorde:' : 'I heard:'} <span>"${escHtml(heard)}"</span></div>` : ''}
  `;

  // Reveal the correct answer
  const answerEl = document.getElementById('reviewAnswer');
  answerEl.style.display = 'block';
  document.getElementById('reviewTarget').textContent = phrase.target;
  document.getElementById('reviewPhonetic').textContent = `[ ${phrase.ph} ]`;

  // Play the correct pronunciation so they hear how it should sound
  setTimeout(() => speakText(phrase.target, getTTSLang()), 500);

  // Show the next button
  document.getElementById('reviewNextBtn').style.display = '';
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
      <button class="back-btn" onclick="showScreen('homeScreen')">←</button>
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
      <button class="next-btn" onclick="showScreen('homeScreen')">${native === 'nl' ? '← Naar huis' : '← Home'}</button>
    </div>
  `;
}

// Alias for the onclick — calls openReviewScreen again.
export function startNewReview() {
  openReviewScreen();
}
