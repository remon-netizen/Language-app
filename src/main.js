// ── Imports ───────────────────────────────────────────────────────────────────
import { state, validTargetsFor, getTargetFlag, getTutorFirstName } from './state.js';
import { t, languageName } from './i18n.js';
import { loadProgress, loadApiKey, saveApiKey, switchProvider } from './storage.js';
import { loadVoices, showBrowserBanner, dismissBanner, changeVoice, testVoice, speakText } from './voice.js';
import { showScreen } from './router.js';
import { openFreeChat, setDifficulty, setLang, sendText, toggleFreeSpeak, redoFromMessage, showConversationSummary } from './chat/chat.js';
import { useSuggestion } from './chat/suggestions.js';
import { translateText, copyTranslation, updateTranslatorLabel } from './chat/translator.js';
import { practicePronunciation } from './chat/chat-ui.js';
import { openVerbScreen, submitVerb } from './grammar/verb-conjugation.js';
import { openDissectScreen, submitDissect } from './grammar/sentence-dissection.js';
import { openWordsScreen, closeWordLookup, updateWordsCount } from './words.js';
import { openExercisesScreen, setExLevel } from './grammar/exercises-ui.js';
import { openInburgeringScreen } from './inburgering/inburgering-ui.js';
import { openFlashcardScreen, flipFlashcard, rateFlashcard } from './grammar/flashcards-ui.js';
import { openDeHetScreen, setDhLevel, startDeHetDrill, answerDeHet } from './grammar/dehet-ui.js';
import { startLesson, startHomeworkLesson, restartLesson, buildCategoryCards, buildAlphabet, listenPhrase, listenSlowPhrase, listenTranslation, toggleSpeak as toggleLessonSpeak, nextPhrase, speakAlphabetLetter } from './lesson.js';
import { readHomeworkFile, generateHomeworkPhrases } from './api/homework.js';
import { openReviewScreen, startNewReview, getLearnedCount } from './review.js';

// ── Speech speed ──────────────────────────────────────────────────────────────
function setSpeechRate(rate) {
  state.speechRate = rate;
  localStorage.setItem('speechRate', rate);
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.rate) === rate);
  });
}

// ── Settings drawer ───────────────────────────────────────────────────────────
function toggleSettingsDrawer() {
  const drawer  = document.getElementById('settingsDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const open    = drawer.classList.toggle('open');
  overlay.classList.toggle('open', open);
  document.body.classList.toggle('drawer-open', open);
}

// ── i18n re-render of static strings ──────────────────────────────────────────
// Anything keyed off the user's native language gets re-applied here.
function applyStaticI18n() {
  const setText = (id, key, vars) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key, vars);
  };
  const setHtml = (id, key, vars) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = t(key, vars);
  };

  // <html lang>
  document.documentElement.lang = state.nativeLanguage;

  // Header tagline (title is set by switchLanguage)
  setText('headerTagline', 'header.tagline');

  // Settings drawer
  setText('drawerHeaderLabel', 'settings.title');
  const vcLabel = document.getElementById('vcLabel');
  if (vcLabel && /Loading|laden/i.test(vcLabel.textContent || '')) {
    vcLabel.textContent = t('settings.voice');
  }
  setText('voiceTestBtn', 'settings.test');
  setText('speedLabel', 'settings.speed');
  setText('speedSlowBtn', 'settings.speedSlow');
  setText('speedNormalBtn', 'settings.speedNormal');
  setText('aiLabel', 'settings.aiTitle');
  setText('apiSaveBtn', 'settings.save');

  // Home screen
  setText('iSpeakLabel', 'home.iSpeak');
  setText('iLearnLabel', 'home.iLearn');
  setText('grammarLabel', 'home.grammarTitle');
  setText('grammarBtn', 'home.grammarBtn');
  setText('myWordsLabel', 'home.myWords');
  setText('startBtnLabel', 'home.start');
  setText('lessonsBtnTitle', 'home.lessonsBtnTitle');
  setText('lessonsBtnSub', 'home.lessonsBtnSub');
  setText('reviewBtnTitle', 'home.reviewTitle');
  setText('reviewBtnSub', 'home.reviewSub');
  updateReviewCount();
  setText('hwTitle', 'home.hwTitle');
  setText('hwSub', 'home.hwSub');
  setText('hwBtn', 'home.hwBtn');
  setText('bbTitle', 'home.browserTitle');
  setText('bbSub', 'home.browserSub');
  setText('bbCloseBtn', 'home.browserClose');

  // Inburgering button — title is in Dutch (it's a Dutch civic exam),
  // sub-line follows native language for the English-speaking learner.
  setText('ibTitle', 'home.inburgering');
  setText('ibSub', 'home.inburgeringSub');

  // Language picker labels — show each target language name in the user's
  // native language.
  document.querySelectorAll('[data-langname]').forEach(span => {
    const code = span.dataset.langname;
    span.textContent = languageName(code);
  });

  // Settings button title
  const settingsBtn = document.getElementById('settingsToggleBtn');
  if (settingsBtn) settingsBtn.title = t('header.settings');

  // Chat screen subtitle (the title is updated in switchLanguage)
  const chatSub = document.querySelector('#chatScreen .lesson-subtitle');
  if (chatSub) chatSub.textContent = t('chat.subtitle');

  // Chat input + sidebar
  const talkInput = document.getElementById('talkInput');
  if (talkInput) talkInput.placeholder = t('chat.placeholder');
  const sendBtn = document.querySelector('.send-btn');
  if (sendBtn) sendBtn.textContent = t('chat.send');
  const suggestionsTitle = document.querySelector('#suggestionsCard .sidebar-title');
  if (suggestionsTitle) suggestionsTitle.textContent = t('chat.suggestions');
  const suggestionsEmpty = document.querySelector('#suggestionsList .suggestions-empty');
  if (suggestionsEmpty) suggestionsEmpty.textContent = t('chat.suggestionsEmpty');
  const summaryBtn = document.getElementById('chatSummaryBtn');
  if (summaryBtn) summaryBtn.textContent = t('chat.summaryBtn');

  // Chat level label
  const levelLabel = document.querySelector('.chat-settings .settings-label');
  if (levelLabel) levelLabel.textContent = t('chat.level');

  // Words screen
  setText('wordsScreenTitle', 'words.title');
  setText('wordsScreenSubtitle', 'words.subtitle');
}

// ── Review count badge ────────────────────────────────────────────────────────
function updateReviewCount() {
  const count = getLearnedCount();
  const badge = document.getElementById('reviewBtnCount');
  if (badge) {
    badge.textContent = count > 0 ? count : '';
    badge.style.display = count > 0 ? '' : 'none';
  }
}

// ── Homework upload ───────────────────────────────────────────────────────────
async function handleHomeworkUpload(file) {
  if (!file) return;
  const statusEl = document.getElementById('hwStatus');
  const btn      = document.getElementById('hwBtn');
  const native   = state.nativeLanguage;
  const loading  = native === 'nl' ? '⏳ Document lezen en oefenzinnen genereren…' : '⏳ Reading document and generating practice phrases…';
  const errPre   = native === 'nl' ? '⚠️ Fout: ' : '⚠️ Error: ';

  statusEl.textContent = loading;
  statusEl.className = 'hw-status loading';
  btn.disabled = true;

  try {
    const text = await readHomeworkFile(file);
    if (!text.trim()) throw new Error(native === 'nl' ? 'Document is leeg' : 'Document is empty');

    const result = await generateHomeworkPhrases(text);

    statusEl.textContent = '';
    statusEl.className = 'hw-status';

    // Build a temporary lesson object and start the lesson practice flow.
    startHomeworkLesson(result.topicSummary, result.phrases);
  } catch (err) {
    statusEl.textContent = errPre + err.message;
    statusEl.className = 'hw-status error';
  } finally {
    btn.disabled = false;
    // Reset the file input so the same file can be re-uploaded.
    document.getElementById('homeworkFileInput').value = '';
  }
}

// ── Lesson browse ─────────────────────────────────────────────────────────────
function openLessonBrowse() {
  showScreen('lessonBrowseScreen');
  buildCategoryCards();
  buildAlphabet();

  // Hide alphabet section if target isn't Ukrainian
  const alphaSection = document.getElementById('alphabetSection');
  if (alphaSection) alphaSection.style.display = state.currentLanguage === 'uk' ? '' : 'none';

  // Update browse header
  const title = document.getElementById('lessonBrowseTitle');
  if (title) title.textContent = t('home.lessons');
  const sub = document.getElementById('lessonBrowseSubtitle');
  if (sub) sub.textContent = t('home.lessonsSub');
}

// ── Language switchers ────────────────────────────────────────────────────────

// Refresh the highlight + disabled state of the target picker so it always
// reflects the current `state.currentLanguage` and the current
// `state.nativeLanguage` (the target matching the native is disabled).
function refreshTargetPicker() {
  document.querySelectorAll('#targetLangOptions .lang-choice-btn').forEach(btn => {
    const isTarget = btn.dataset.lang === state.currentLanguage;
    const isNative = btn.dataset.lang === state.nativeLanguage;
    btn.classList.toggle('active',  isTarget);
    btn.classList.toggle('disabled', isNative);
    btn.disabled = isNative;
  });
}

// Refresh the highlight on the native picker.
function refreshNativePicker() {
  document.querySelectorAll('#nativeLangOptions .lang-choice-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.native === state.nativeLanguage);
  });
}

// Show / hide target-conditional flows (alphabet card, inburgering button, …).
function refreshConditionalFlows() {
  const ibBtn = document.getElementById('inburgeringBtn');
  if (ibBtn) {
    // Inburgering only when target = nl AND native ≠ nl (Dutch natives don't
    // need the integration exam).
    ibBtn.style.display =
      (state.currentLanguage === 'nl' && state.nativeLanguage !== 'nl') ? 'flex' : 'none';
  }
}

function switchNativeLanguage(native) {
  state.nativeLanguage = native;
  localStorage.setItem('appNativeLanguage', native);

  // If the current target is now equal to the new native, force a different
  // target language. switchLanguage() already calls all the refresh helpers.
  if (state.currentLanguage === native) {
    const fallback = validTargetsFor(native)[0];
    switchLanguage(fallback);
  } else {
    // Target stays the same, but its disabled flag may have flipped.
    refreshTargetPicker();
    refreshConditionalFlows();
  }

  refreshNativePicker();

  // Re-apply all static strings in the new native language
  applyStaticI18n();
  // Refresh dynamic bits that depend on either native or target
  updateHeaderAndChat();
  updateTranslatorLabel();
}

function switchLanguage(lang) {
  // Reject invalid combination — clicking a target equal to native is a no-op.
  if (lang === state.nativeLanguage) return;

  state.currentLanguage = lang;
  localStorage.setItem('appLanguage', lang);

  refreshTargetPicker();
  refreshConditionalFlows();

  // Reload TTS voices for the new target
  loadVoices();

  // Refresh translator + headers + chat
  updateTranslatorLabel();
  updateHeaderAndChat();

  // Clear chat history (the tutor persona / opener is target-dependent)
  state.conversationHistory = [];
  const chatArea = document.getElementById('chatArea');
  if (chatArea) chatArea.innerHTML = '';

  // Update review badge for the new target language
  updateReviewCount();
}

function updateHeaderAndChat() {
  const flag       = getTargetFlag();
  const targetName = languageName(state.currentLanguage);

  // Header
  const h1 = document.getElementById('headerTitle');
  if (h1) h1.innerHTML = t('header.title', { flag, language: targetName });

  // Start button flag
  const startFlag = document.getElementById('startBtnFlag');
  if (startFlag) startFlag.textContent = flag;

  // Chat title
  const chatTitle = document.getElementById('chatTitle');
  if (chatTitle) chatTitle.textContent = t('chat.title', { language: targetName });

  // Verb / dissect screen subtitles include the target language name + flag
  const verbSub = document.getElementById('verbScreenSub');
  if (verbSub) verbSub.textContent = `${flag} ${targetName}`;
  const dissectSub = document.getElementById('dissectScreenSub');
  if (dissectSub) dissectSub.textContent = `${flag} ${targetName}`;
}

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  loadProgress();
  loadApiKey();

  // Apply native-language UI strings first so labels are correct on first paint.
  applyStaticI18n();

  // Highlight pickers from the persisted state.
  refreshNativePicker();
  refreshTargetPicker();
  refreshConditionalFlows();

  // switchLanguage early-returns if the target equals native, so we call
  // its side effects (voice loading, header text, etc.) directly here.
  loadVoices();
  updateHeaderAndChat();
  updateTranslatorLabel();

  showBrowserBanner();
  setSpeechRate(state.speechRate);
  updateWordsCount();
}

init();

// Register service worker for PWA / offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// ── Expose functions to HTML onclick/onchange attributes ──────────────────────
window.toggleSettingsDrawer  = toggleSettingsDrawer;
window.showScreen            = showScreen;
window.openFreeChat          = openFreeChat;
window.setDifficulty         = setDifficulty;
window.setLang               = setLang;
window.sendText              = sendText;
window.toggleFreeSpeak       = toggleFreeSpeak;
window.redoFromMessage       = redoFromMessage;
window.switchLanguage        = switchLanguage;
window.switchNativeLanguage  = switchNativeLanguage;
window.translateText         = translateText;
window.copyTranslation       = copyTranslation;
window.useSuggestion         = useSuggestion;
window.saveApiKey            = saveApiKey;
window.switchProvider        = switchProvider;
window.setSpeechRate         = setSpeechRate;
window.changeVoice           = changeVoice;
window.testVoice             = testVoice;
window.speakText             = speakText;
window.dismissBanner         = dismissBanner;
window.practicePronunciation = practicePronunciation;
window.openVerbScreen        = openVerbScreen;
window.submitVerb            = submitVerb;
window.openDissectScreen     = openDissectScreen;
window.submitDissect         = submitDissect;
window.openWordsScreen       = openWordsScreen;
window.closeWordLookup       = closeWordLookup;
window.openExercisesScreen   = openExercisesScreen;
window.setExLevel            = setExLevel;
window.openInburgeringScreen = openInburgeringScreen;
window.openFlashcardScreen   = openFlashcardScreen;
window.flipFlashcard         = flipFlashcard;
window.rateFlashcard         = rateFlashcard;
window.openDeHetScreen       = openDeHetScreen;
window.setDhLevel            = setDhLevel;
window.startDeHetDrill       = startDeHetDrill;
window.answerDeHet           = answerDeHet;
window.showConversationSummary = showConversationSummary;
window.openLessonBrowse    = openLessonBrowse;
window.startLesson         = startLesson;
window.restartLesson       = restartLesson;
window.listenPhrase        = listenPhrase;
window.listenSlowPhrase    = listenSlowPhrase;
window.listenTranslation   = listenTranslation;
window.toggleLessonSpeak   = toggleLessonSpeak;
window.nextPhrase          = nextPhrase;
window.speakAlphabetLetter = speakAlphabetLetter;
window.handleHomeworkUpload = handleHomeworkUpload;
window.openReviewScreen    = openReviewScreen;
window.startNewReview      = startNewReview;
