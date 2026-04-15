import { state, getTTSLang } from './state.js';
import { getLessonsForTarget, getTargetText, getTranslation, getTip, getLessonName } from './data/lesson-helpers.js';
import { ALPHABET } from './data/alphabet.js';
import { calcSimilarity, escHtml } from './utils.js';
import { saveProgress, updatePointsBadge } from './storage.js';
import { showScreen } from './router.js';
import { setupRecognition } from './speech.js';
import { speakText, speakSlow } from './voice.js';
import { t } from './i18n.js';
import { getLessonLevel, saveLessonLevel, getLevelLabel, getNextLevelLabel, hasNextLevel, generateNextLevelPhrases } from './api/level-up.js';
import { markPhraseAsLearned } from './review.js';

// BCP-47 tag for the user's native language TTS (used to speak translations).
function getNativeTTSLang() {
  return state.nativeLanguage === 'nl' ? 'nl-NL' : 'en-GB';
}

function getCurrentLessons() {
  return getLessonsForTarget(state.currentLanguage);
}

// Start a virtual lesson from homework-generated phrases.
export function startHomeworkLesson(topicSummary, phrases) {
  const native = state.nativeLanguage;
  const hwLabel = native === 'nl' ? 'Huiswerk' : 'Homework';
  state.currentLesson = {
    id: '_homework',
    name: { en: topicSummary || 'Homework practice', nl: topicSummary || 'Huiswerkoefening' },
    icon: '📄',
    tag: 'homework',
    phrases,
  };
  state.currentPhraseIndex = 0;
  state.lessonScores = [];
  document.getElementById('lessonTitle').textContent = `📄 ${hwLabel}`;
  document.getElementById('lessonContent').style.display = 'block';
  document.getElementById('lessonComplete').classList.remove('show');
  buildNavDots();
  renderPhrase();
  showScreen('lessonScreen');
}

export function startLesson(lessonId) {
  state.currentLesson = getCurrentLessons().find(l => l.id === lessonId);
  state.currentPhraseIndex = 0;
  state.lessonScores = [];
  if (!state.categoryProgress[lessonId]) state.categoryProgress[lessonId] = [];
  document.getElementById('lessonTitle').textContent = `${state.currentLesson.icon} ${getLessonName(state.currentLesson, state.nativeLanguage)}`;
  document.getElementById('lessonContent').style.display = 'block';
  document.getElementById('lessonComplete').classList.remove('show');
  buildNavDots();
  renderPhrase();
  showScreen('lessonScreen');
}

export function restartLesson() { startLesson(state.currentLesson.id); }

export function buildCategoryCards() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  getCurrentLessons().forEach(lesson => {
    const done = (state.categoryProgress[lesson.id] || []).length;
    const total = lesson.phrases.length;
    const pct = Math.round((done / total) * 100);
    const name = escHtml(getLessonName(lesson, state.nativeLanguage));
    const tagLabel = t(`lesson.tag.${lesson.tag}`);
    const level = getLessonLevel(lesson.id);
    const levelLabel = getLevelLabel(level);
    const levelBadge = level > 0 ? `<span class="level-badge">${levelLabel}</span>` : '';
    grid.innerHTML += `
      <div class="category-card" onclick="startLesson('${lesson.id}')">
        <div class="icon">${lesson.icon}</div>
        <div class="name">${name} ${levelBadge}</div>
        <div class="count">${total} ${t('lesson.phrases')} · <span class="tag tag-${lesson.tag}">${tagLabel}</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>`;
  });
}

export function buildAlphabet() {
  const grid = document.getElementById('alphabetGrid');
  if (!grid) return;
  grid.innerHTML = '';
  // Cyrillic alphabet reference is only meaningful when the target is Ukrainian.
  if (state.currentLanguage !== 'uk') return;
  ALPHABET.forEach(letter => {
    // Speak the actual Cyrillic letter using Ukrainian TTS — this produces the
    // correct native sound, unlike the old approach of reading English phonetic
    // approximations through an English voice.
    const cyrillic = letter.c.split(' ')[1] || letter.c.split(' ')[0]; // get lowercase: 'А а' → 'а'
    grid.innerHTML += `
      <div class="letter-card" onclick="speakAlphabetLetter(this, '${cyrillic}')">
        <div class="cyrillic">${letter.c}</div>
        <div class="latin">${letter.l}</div>
        <div class="sound">${letter.s}</div>
      </div>`;
  });
}

// Speak a single Cyrillic letter using the Ukrainian TTS voice with a brief
// visual flash to show which card is playing.
export function speakAlphabetLetter(card, letter) {
  speakText(letter, 'uk-UA');
  card.classList.add('playing');
  setTimeout(() => card.classList.remove('playing'), 600);
}

export function buildNavDots() {
  const dots = document.getElementById('navDots');
  dots.innerHTML = '';
  state.currentLesson.phrases.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'nav-dot' + (i === 0 ? ' active' : '');
    d.id = `dot-${i}`;
    dots.appendChild(d);
  });
}

export function renderPhrase() {
  const phrase = state.currentLesson.phrases[state.currentPhraseIndex];
  const total = state.currentLesson.phrases.length;
  document.getElementById('lessonSubtitle').textContent =
    t('lesson.phraseOf', { current: state.currentPhraseIndex + 1, total });
  document.getElementById('phraseCounter').textContent = `${state.currentPhraseIndex + 1} / ${total}`;
  document.getElementById('phraseUkrainian').textContent = getTargetText(phrase);
  document.getElementById('phrasePhonetic').textContent = `[ ${phrase.ph} ]`;
  document.getElementById('phraseEnglish').textContent = getTranslation(phrase, state.nativeLanguage);
  document.getElementById('phraseTip').textContent = getTip(phrase, state.nativeLanguage);
  hideFeedback();
  document.getElementById('micNotice').classList.remove('show');
  state.currentLesson.phrases.forEach((_, i) => {
    const dot = document.getElementById(`dot-${i}`);
    if (!dot) return;
    dot.className = 'nav-dot' + (i < state.currentPhraseIndex ? ' done' : i === state.currentPhraseIndex ? ' active' : '');
  });

  // Auto-play: speak the phrase so the learner hears it first (audio-primary).
  // Respects the autoPlayLesson toggle from settings.
  if (state.autoPlayLesson !== false) {
    setTimeout(() => speakText(getTargetText(phrase), getTTSLang()), 350);
  }
}

export function nextPhrase() {
  stopRecording();
  hideFeedback();
  state.currentPhraseIndex++;
  if (state.currentPhraseIndex >= state.currentLesson.phrases.length) showLessonComplete();
  else renderPhrase();
}

export function showLessonComplete() {
  document.getElementById('lessonContent').style.display = 'none';
  const completeEl = document.getElementById('lessonComplete');
  completeEl.classList.add('show');
  const excellent = state.lessonScores.filter(s => s >= 80).length;
  const good = state.lessonScores.filter(s => s >= 50 && s < 80).length;
  const avg = state.lessonScores.length ? Math.round(state.lessonScores.reduce((a,b)=>a+b,0)/state.lessonScores.length) : 0;
  const lessonName = getLessonName(state.currentLesson, state.nativeLanguage);
  const lessonId = state.currentLesson.id;
  const isHomework = lessonId === '_homework';

  document.getElementById('completeSubtitle').textContent =
    t('lesson.completeSubtitle', { count: state.currentLesson.phrases.length, name: lessonName.toLowerCase() });

  const currentLevel = isHomework ? 0 : getLessonLevel(lessonId);
  const levelLabel = getLevelLabel(currentLevel);
  const canLevelUp = !isHomework && avg >= 70 && hasNextLevel(currentLevel);
  const nextLabel = hasNextLevel(currentLevel) ? getNextLevelLabel(currentLevel) : '';
  const native = state.nativeLanguage;

  // If score is good enough, save the completed level
  if (!isHomework && avg >= 70) {
    saveLessonLevel(lessonId, Math.max(currentLevel, currentLevel));
  }

  let levelHtml = '';
  if (!isHomework) {
    levelHtml = `<div class="stat-box"><div class="num">${levelLabel}</div><div class="label">${native === 'nl' ? 'Niveau' : 'Level'}</div></div>`;
  }

  const savedMsg = native === 'nl'
    ? '✅ Deze zinnen zijn opgeslagen voor herhaling'
    : '✅ These phrases are saved for review practice';

  document.getElementById('completeStats').innerHTML = `
    <div class="stat-box"><div class="num">${excellent}</div><div class="label">${t('lesson.excellent')}</div></div>
    <div class="stat-box"><div class="num">${good}</div><div class="label">${t('lesson.good')}</div></div>
    <div class="stat-box"><div class="num">${avg}%</div><div class="label">${t('lesson.avgScore')}</div></div>
    ${levelHtml}
    <div class="review-saved-msg">${savedMsg}</div>`;

  // Clean up any previous level-related elements
  completeEl.querySelectorAll('.btn-level-up, .level-retry-msg, .level-max-msg').forEach(el => el.remove());

  if (canLevelUp) {
    let lvlBtn;
    lvlBtn = document.createElement('button');
    lvlBtn.className = 'btn-level-up';
    lvlBtn.textContent = native === 'nl'
      ? `🚀 Ga naar niveau ${nextLabel}`
      : `🚀 Go to level ${nextLabel}`;
    lvlBtn.addEventListener('click', () => handleLevelUp(lessonId, currentLevel));
    // Insert before the restart button
    const restartBtn = completeEl.querySelector('.btn-restart, .btn');
    if (restartBtn) completeEl.insertBefore(lvlBtn, restartBtn);
    else completeEl.appendChild(lvlBtn);
  } else if (!isHomework && !hasNextLevel(currentLevel)) {
    // Already at max level
    const maxMsg = document.createElement('div');
    maxMsg.className = 'level-max-msg';
    maxMsg.textContent = native === 'nl'
      ? `🏆 Je hebt het hoogste niveau (${levelLabel}) bereikt!`
      : `🏆 You've reached the highest level (${levelLabel})!`;
    const restartBtn = completeEl.querySelector('.btn-restart, .btn');
    if (restartBtn) completeEl.insertBefore(maxMsg, restartBtn);
    else completeEl.appendChild(maxMsg);
  } else if (!isHomework && avg < 70) {
    const retryMsg = document.createElement('div');
    retryMsg.className = 'level-retry-msg';
    retryMsg.textContent = native === 'nl'
      ? `💪 Haal 70% of meer om naar ${nextLabel || 'het volgende niveau'} te gaan`
      : `💪 Score 70% or higher to unlock ${nextLabel || 'the next level'}`;
    const restartBtn = completeEl.querySelector('.btn-restart, .btn');
    if (restartBtn) completeEl.insertBefore(retryMsg, restartBtn);
    else completeEl.appendChild(retryMsg);
  }
}

async function handleLevelUp(lessonId, currentLevel) {
  const native = state.nativeLanguage;
  const completeEl = document.getElementById('lessonComplete');
  const lvlBtn = completeEl.querySelector('.btn-level-up');
  if (lvlBtn) {
    lvlBtn.disabled = true;
    lvlBtn.textContent = native === 'nl' ? '⏳ Zinnen genereren…' : '⏳ Generating phrases…';
  }

  try {
    const newPhrases = await generateNextLevelPhrases(state.currentLesson, currentLevel);
    const nextLevelIndex = currentLevel + 1;

    // Save the new level
    saveLessonLevel(lessonId, nextLevelIndex);

    // Update the lesson with the new phrases and restart
    state.currentLesson.phrases = newPhrases;
    state.currentLesson.tag = getLevelLabel(nextLevelIndex).toLowerCase();
    state.currentPhraseIndex = 0;
    state.lessonScores = [];

    completeEl.classList.remove('show');
    document.getElementById('lessonContent').style.display = 'block';
    buildNavDots();
    renderPhrase();
  } catch (err) {
    if (lvlBtn) {
      lvlBtn.disabled = false;
      lvlBtn.textContent = `⚠️ ${err.message}`;
      setTimeout(() => {
        lvlBtn.textContent = native === 'nl'
          ? `🚀 Probeer opnieuw`
          : `🚀 Try again`;
      }, 3000);
    }
  }
}

export function listenPhrase() {
  const phrase = state.currentLesson.phrases[state.currentPhraseIndex];
  speakText(getTargetText(phrase), getTTSLang());
  const btn = document.getElementById('listenBtn');
  btn.textContent = `🔊 ${t('lesson.playing')}`;
  btn.disabled = true;
  setTimeout(() => { btn.textContent = `🔊 ${t('lesson.listen')}`; btn.disabled = false; }, 2200);
}

// Play the phrase slowly — helpful for pronunciation practice.
export function listenSlowPhrase() {
  const phrase = state.currentLesson.phrases[state.currentPhraseIndex];
  speakSlow(getTargetText(phrase), getTTSLang());
  const btn = document.getElementById('listenSlowBtn');
  if (!btn) return;
  btn.textContent = `🐢 ${t('lesson.playing')}`;
  btn.disabled = true;
  setTimeout(() => { btn.textContent = `🐢 ${t('lesson.listenSlow')}`; btn.disabled = false; }, 3500);
}

// Speak the translation in the user's native language so they know
// what the phrase means — without needing to read.
export function listenTranslation() {
  const phrase = state.currentLesson.phrases[state.currentPhraseIndex];
  const translation = getTranslation(phrase, state.nativeLanguage);
  speakText(translation, getNativeTTSLang());
  const btn = document.getElementById('listenTranslationBtn');
  if (!btn) return;
  btn.textContent = `💬 ${t('lesson.playing')}`;
  btn.disabled = true;
  setTimeout(() => { btn.textContent = `💬 ${t('lesson.hearMeaning')}`; btn.disabled = false; }, 2500);
}

export function toggleSpeak() {
  if (state.isRecording) { stopRecording(); return; }
  state.isRecording = true;
  const btn = document.getElementById('speakBtn');
  btn.textContent = `⏹ ${t('lesson.stop')}`; btn.classList.add('recording');
  state.recognition = setupRecognition(getTTSLang(), (event) => {
    const results = Array.from(event.results[0]).map(r => r.transcript.trim().toLowerCase());
    processLessonResult(results);
  }, () => {
    state.isRecording = false;
    if (btn) { btn.textContent = `🎙️ ${t('lesson.speak')}`; btn.classList.remove('recording'); }
  });
  if (state.recognition) state.recognition.start();
}

export function stopRecording() {
  state.isRecording = false;
  if (state.recognition) { try { state.recognition.stop(); } catch(e){} state.recognition = null; }
  const btn = document.getElementById('speakBtn');
  if (btn) { btn.textContent = `🎙️ ${t('lesson.speak')}`; btn.classList.remove('recording'); }
}

export function processLessonResult(recognizedList) {
  const phrase = state.currentLesson.phrases[state.currentPhraseIndex];
  const target = getTargetText(phrase).toLowerCase().trim();
  const heard = recognizedList[0] || '';
  const score = calcSimilarity(target, heard);
  state.lessonScores.push(score);

  // Save this phrase to the learned-phrases store for later review.
  markPhraseAsLearned(phrase);
  const pts = score >= 80 ? 10 : score >= 50 ? 5 : 2;
  state.totalPoints += pts;
  updatePointsBadge();
  if (!state.categoryProgress[state.currentLesson.id]) state.categoryProgress[state.currentLesson.id] = [];
  if (!state.categoryProgress[state.currentLesson.id].includes(state.currentPhraseIndex)) state.categoryProgress[state.currentLesson.id].push(state.currentPhraseIndex);
  saveProgress();
  showFeedback(score, heard, target);
}

export function showFeedback(score, heard, target) {
  const area = document.getElementById('feedbackArea');
  const scoreEl = document.getElementById('feedbackScore');
  let cls, emoji, msg;
  if (score >= 85)      { cls = 'excellent'; emoji = '🎉'; msg = t('lesson.feedback.excellent'); }
  else if (score >= 60) { cls = 'good';      emoji = '👍'; msg = t('lesson.feedback.good'); }
  else if (score > 0)   { cls = 'try-again'; emoji = '🔄'; msg = t('lesson.feedback.tryAgain'); }
  else                  { cls = 'no-speech'; emoji = '🎙️'; msg = t('lesson.feedback.noSpeech'); }
  area.className = `feedback-area show ${cls}`;
  scoreEl.className = `feedback-score ${cls}`;
  scoreEl.textContent = heard ? `${emoji} ${score}%` : emoji;
  document.getElementById('feedbackText').textContent = msg;
  document.getElementById('feedbackHeard').innerHTML = heard ? `${t('lesson.iHeard')} <span>"${heard}"</span>` : '';
  const compEl = document.getElementById('comparisonView');
  if (heard) {
    const tw = target.split(/\s+/), hw = heard.toLowerCase().split(/\s+/);
    const targetHtml = tw.map(w => `<span class="word ${hw.includes(w.toLowerCase()) ? 'match' : 'mismatch'}">${w}</span>`).join(' ');
    compEl.innerHTML = `<div class="comparison-col"><label>${t('lesson.expected')}</label><div>${targetHtml}</div></div><div class="comparison-col"><label>${t('lesson.heard')}</label><div class="word">${heard}</div></div>`;
  } else { compEl.innerHTML = ''; }

  // Remove any previous skip button before potentially adding a new one.
  area.querySelectorAll('.btn-skip').forEach(el => el.remove());

  // When the score is low but something was heard, show a "I said it right"
  // skip button. Speech recognition for Ukrainian is imperfect — the user
  // shouldn't be stuck on a phrase they're pronouncing correctly just because
  // the recognition returns a different grammatical form.
  if (heard && score < 60) {
    const native = state.nativeLanguage;
    const skipBtn = document.createElement('button');
    skipBtn.className = 'btn-skip';
    skipBtn.textContent = native === 'nl' ? '✓ Ik zei het goed — ga door' : '✓ I said it right — continue';
    skipBtn.addEventListener('click', () => {
      // Override the score to 80 so this phrase doesn't drag down the average.
      state.lessonScores[state.lessonScores.length - 1] = 80;
      hideFeedback();
      nextPhrase();
    });
    area.appendChild(skipBtn);
  }
}

export function hideFeedback() { document.getElementById('feedbackArea').className = 'feedback-area'; }
