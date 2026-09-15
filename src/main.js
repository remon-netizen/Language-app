// ── Imports ───────────────────────────────────────────────────────────────────
import { state, validTargetsFor, getTargetFlag, getTutorFirstName, flagImg } from './state.js';
import { t, languageName } from './i18n.js';
import { escHtml } from './utils.js';
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
import { openVerbAspectScreen } from './grammar/verb-aspect-ui.js';
import { openVerbDrillScreen } from './grammar/verb-drill-ui.js';
import { openCaseDrillScreen } from './grammar/case-drill-ui.js';
import { openPrefixDrillScreen } from './grammar/prefix-drill-ui.js';
import { openNumbersDrillScreen } from './grammar/numbers-drill-ui.js';
import { openVocabDrillScreen, startVocabReview } from './grammar/vocab-drill-ui.js';
import { openSentenceBuildScreen, tracker as sentenceTracker } from './grammar/sentence-build-ui.js';
import { openDialogueScreen, tracker as dialogueTracker } from './grammar/dialogue-ui.js';
import { openProgressScreen } from './progress-ui.js';
import { dueVocab, weakVocab } from './data/vocab-progress.js';
import { startLesson, startHomeworkLesson, restartLesson, buildCategoryCards, buildAlphabet, listenPhrase, listenSlowPhrase, listenTranslation, toggleSpeak as toggleLessonSpeak, nextPhrase, speakAlphabetLetter } from './lesson.js';
import { readHomeworkFile, generateHomeworkPhrases } from './api/homework.js';
import { openReviewScreen, startPhraseReview, startNewReview, getLearnedCount, getDuePhrases, getDueTotal } from './review.js';
import { getDueWords } from './words.js';
import { getLessonsForTarget, getLessonName } from './data/lesson-helpers.js';
import { getWeakVerbCount as weakVerbs } from './data/verb-weakness.js';
import { getWeakNounCount as weakNouns } from './data/case-weakness.js';
import { getWeakVerbCount as weakPrefixVerbs } from './data/prefix-weakness.js';
import { weakKeys as weakNumberKeys } from './data/numbers-weakness.js';

// ── Collapsible language picker ────────────────────────────────────────────────
function collapseLangPicker() {
  const hasSetup = localStorage.getItem('langPickerSetup');
  const full    = document.getElementById('langPickerFull');
  const compact = document.getElementById('langCompact');
  if (!full || !compact) return;

  if (hasSetup) {
    // Show compact, hide full
    full.style.display    = 'none';
    compact.style.display = '';
    updateCompactLabel();
  } else {
    // First visit — show full picker
    full.style.display    = '';
    compact.style.display = 'none';
  }
}

function updateCompactLabel() {
  const el = document.getElementById('langCompactText');
  if (!el) return;
  const nativeFlag = flagImg(state.nativeLanguage, 16);
  const targetFlag = flagImg(state.currentLanguage, 16);
  const targetName = languageName(state.currentLanguage);
  el.innerHTML = `${nativeFlag} → ${targetFlag} ${targetName}`;
}

function expandLangPicker() {
  const full    = document.getElementById('langPickerFull');
  const compact = document.getElementById('langCompact');
  if (full)    full.style.display    = '';
  if (compact) compact.style.display = 'none';
}

// Called after a language switch to collapse the picker and save the flag.
function markLangPickerSetup() {
  localStorage.setItem('langPickerSetup', '1');
  updateCompactLabel();
  // Collapse after a short delay so the user sees their choice take effect.
  setTimeout(collapseLangPicker, 400);
}

// ── API key notice ────────────────────────────────────────────────────────────
function updateApiNotice() {
  const notice = document.getElementById('apiNotice');
  if (!notice) return;
  const hasKey = !!(localStorage.getItem('geminiKey') || localStorage.getItem('anthropicKey'));
  notice.style.display = hasKey ? 'none' : '';
}

// ── Auto-play toggle ──────────────────────────────────────────────────────────
function toggleAutoPlay(enabled) {
  state.autoPlayLesson = enabled;
  localStorage.setItem('autoPlayLesson', enabled ? '1' : '0');
}

function initAutoPlay() {
  const saved = localStorage.getItem('autoPlayLesson');
  state.autoPlayLesson = saved !== '0'; // default ON
  const toggle = document.getElementById('autoPlayToggle');
  if (toggle) toggle.checked = state.autoPlayLesson;
}

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
  setText('progressLinkLabel', 'home.progress');
  setText('apiNoticeText', 'home.apiNotice');
  setText('apiNoticeBtn', 'home.apiNoticeBtn');
  setText('grammarSub', 'home.grammarSub');
  setText('autoPlayLabel', 'settings.autoPlay');
  setText('geminiFreeLabel', 'settings.geminiFree');
  setText('updateToastText', 'app.updateReady');
  setText('updateToastBtn', 'app.reload');
  // Lesson screen (static buttons; lesson.js re-labels them during recording)
  setText('listenBtn', 'lesson.listen'); const lb = document.getElementById('listenBtn'); if (lb) lb.textContent = '🔊 ' + t('lesson.listen');
  const lsb = document.getElementById('listenSlowBtn'); if (lsb) lsb.textContent = '🐢 ' + t('lesson.listenSlow');
  const ltb = document.getElementById('listenTranslationBtn'); if (ltb) ltb.textContent = '💬 ' + t('lesson.hearMeaning');
  const spk = document.getElementById('speakBtn'); if (spk) { spk.textContent = '🎙️ ' + t('lesson.speak'); spk.dataset.idleLabel = '🎙️ ' + t('lesson.speak'); }
  setText('nextBtn', 'lesson.next');
  setText('completeTitle', 'lesson.completeTitle');
  setText('restartBtn', 'lesson.restart');
  setText('backToLessonsBtn', 'lesson.backToLessons');
  setText('micNotice', 'lesson.micNotice');
  setText('alphabetTitle', 'lesson.alphabet');
  // Verb lookup / dissection screens
  setText('verbScreenTitle', 'grammar.verbTitle');
  setText('verbSubmitBtn', 'grammar.verbBtn');
  const vi = document.getElementById('verbInput'); if (vi) vi.placeholder = t('grammar.verbPlaceholder');
  setText('dissectScreenTitle', 'grammar.dissectTitle');
  setText('dissectSubmitBtn', 'grammar.dissectBtn');
  const di = document.getElementById('dissectInput'); if (di) di.placeholder = t('grammar.dissectPlaceholder');
  setText('summaryTitle', 'chat.summaryTitle');
  setText('iSpeakLabel', 'home.iSpeak');
  setText('iLearnLabel', 'home.iLearn');
  setText('grammarLabel', 'home.grammarTitle');
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

// ── Review count badge + Today card ──────────────────────────────────────────
// The badge shows what is DUE (phrases + words), not how much has ever been
// learned; that is the number a learner acts on.
function updateReviewCount() {
  const due = getDueTotal();
  const badge = document.getElementById('reviewBtnCount');
  if (badge) {
    badge.textContent = due > 0 ? due : '';
    badge.style.display = due > 0 ? '' : 'none';
  }
  renderTodayCard();
}

// How many weak items the offline drills are tracking for the current target.
function weakSpotCount() {
  if (state.currentLanguage !== 'uk') return 0;
  try { return weakVerbs() + weakNouns() + weakPrefixVerbs() + weakNumberKeys().length + weakVocab().length + sentenceTracker.weakKeys().length + dialogueTracker.weakKeys().length; }
  catch { return 0; }
}

// The first lesson that is not finished yet, for "continue where you left off".
function nextLesson() {
  const lessons = getLessonsForTarget(state.currentLanguage) || [];
  let started = null;
  for (const l of lessons) {
    const done = (state.categoryProgress[l.id] || []).length;
    if (done > 0 && done < l.phrases.length) return { lesson: l, done };
    if (done === 0 && !started) started = { lesson: l, done: 0 };
  }
  return started;
}

// One card at the top of Home that answers "what should I do now?".
function renderTodayCard() {
  const card = document.getElementById('todayCard');
  if (!card) return;
  const nl = state.nativeLanguage === 'nl';
  const duePhrases = getDuePhrases().length;
  const dueWords = getDueWords().length + (state.currentLanguage === 'uk' ? dueVocab().length : 0);
  const weak = weakSpotCount();
  const next = nextLesson();
  const anyProgress = getLearnedCount() > 0 || Object.keys(state.categoryProgress).length > 0;

  const rows = [];
  if (duePhrases + dueWords > 0) {
    const parts = [];
    if (duePhrases) parts.push(nl ? `${duePhrases} ${duePhrases === 1 ? 'zin' : 'zinnen'}` : `${duePhrases} phrase${duePhrases === 1 ? '' : 's'}`);
    if (dueWords) parts.push(nl ? `${dueWords} ${dueWords === 1 ? 'woord' : 'woorden'}` : `${dueWords} word${dueWords === 1 ? '' : 's'}`);
    rows.push({ icon: '🔄', title: nl ? 'Herhalen' : 'Review', sub: parts.join(' + ') + (nl ? ' aan de beurt' : ' due'), onclick: 'openReviewScreen()', hot: true });
  }
  if (weak > 0) {
    rows.push({ icon: '🎯', title: nl ? 'Zwakke plekken' : 'Weak spots', sub: nl ? `${weak} ${weak === 1 ? 'vorm' : 'vormen'} die je eerder fout had` : `${weak} form${weak === 1 ? '' : 's'} you got wrong before`, onclick: 'openExercisesScreen()' });
  }
  if (next) {
    const name = getLessonName(next.lesson, state.nativeLanguage);
    rows.push({ icon: next.lesson.icon || '📖', title: next.done ? (nl ? 'Ga verder' : 'Continue') : (nl ? 'Volgende les' : 'Next lesson'),
      sub: `${name} · ${next.done}/${next.lesson.phrases.length}`, onclick: `startLesson('${next.lesson.id}')` });
  }
  if (!rows.length && !anyProgress) {
    rows.push({ icon: '👋', title: nl ? 'Begin met een les' : 'Start with a lesson', sub: nl ? 'Luister, spreek na, en de zinnen komen terug om te herhalen' : 'Listen, repeat, and the phrases come back for review', onclick: 'openLessonBrowse()', hot: true });
  }
  if (!rows.length) { card.style.display = 'none'; return; }

  card.style.display = '';
  card.innerHTML = `
    <div class="today-title">${nl ? '📅 Vandaag' : '📅 Today'}</div>
    ${rows.slice(0, 3).map(r => `
      <button class="today-row ${r.hot ? 'today-row-hot' : ''}" onclick="${r.onclick}">
        <span class="today-icon">${r.icon}</span>
        <span class="today-text"><span class="today-row-title">${escHtml(r.title)}</span><span class="today-row-sub">${escHtml(r.sub)}</span></span>
        <span class="today-arrow">→</span>
      </button>`).join('')}`;
}
document.addEventListener('screenShown', e => { if (e.detail.id === 'homeScreen') updateReviewCount(); });

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

  // Update review button text + count badge
  const reviewText = document.getElementById('lessonReviewText');
  if (reviewText) reviewText.textContent = state.nativeLanguage === 'nl' ? 'Herhaal geleerde zinnen' : 'Review learned phrases';
  const count = getLearnedCount();
  const badge = document.getElementById('lessonReviewCount');
  if (badge) {
    badge.textContent = count > 0 ? count : '';
    badge.style.display = count > 0 ? '' : 'none';
  }
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
  markLangPickerSetup();

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
  markLangPickerSetup();
}

function updateHeaderAndChat() {
  const flag       = getTargetFlag();
  const targetName = languageName(state.currentLanguage);

  // Header
  const h1 = document.getElementById('headerTitle');
  if (h1) h1.innerHTML = t('header.title', { flag, language: targetName });

  // Start button flag
  const startFlag = document.getElementById('startBtnFlag');
  if (startFlag) startFlag.innerHTML = flag;

  // Chat title
  const chatTitle = document.getElementById('chatTitle');
  if (chatTitle) chatTitle.textContent = t('chat.title', { language: targetName });

  // Verb / dissect screen subtitles include the target language name + flag
  const verbSub = document.getElementById('verbScreenSub');
  if (verbSub) verbSub.innerHTML = `${flag} ${targetName}`;
  const dissectSub = document.getElementById('dissectScreenSub');
  if (dissectSub) dissectSub.innerHTML = `${flag} ${targetName}`;
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
  collapseLangPicker();
  updateApiNotice();
  initAutoPlay();
  document.addEventListener('apiKeyChanged', updateApiNotice);
}

init();

// Register service worker for PWA / offline support.
// Skipped on localhost: the cache-first strategy would keep serving stale files
// during development. Any SW left over from an earlier visit is torn down too.
const isLocalhost = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(location.hostname);
if ('serviceWorker' in navigator) {
  if (isLocalhost) {
    navigator.serviceWorker.getRegistrations()
      .then(regs => Promise.all(regs.map(r => r.unregister())))
      .then(() => caches?.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))))
      .catch(() => {});
  } else {
    // A new worker installs and claims the page, but the page is already rendered
    // from the old cache and nothing reloads it -- so the app kept showing an old
    // build. Reload once on handover, and re-check on foreground, because a PWA
    // resumed from memory never navigates and so never checks on its own.
    // Rather than reloading under the learner's feet (mid-drill state lives in
    // memory), show a toast and let them reload when they are ready. On Home,
    // where nothing is in progress, reload straight away.
    const hadController = !!navigator.serviceWorker.controller;
    let handled = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || handled) return; // first install: page is already current
      handled = true;
      const onHome = document.getElementById('homeScreen')?.classList.contains('active');
      if (onHome) { location.reload(); return; }
      const toast = document.getElementById('updateToast');
      if (toast) toast.style.display = '';
    });
    navigator.serviceWorker.register('./sw.js').then(reg => {
      reg.update().catch(() => {});
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {});
      });
    }).catch(() => {});
  }
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
window.expandLangPicker    = expandLangPicker;
window.toggleAutoPlay      = toggleAutoPlay;
window.openReviewScreen    = openReviewScreen;
window.startPhraseReview   = startPhraseReview;
window.startNewReview      = startNewReview;
window.openVerbAspectScreen = openVerbAspectScreen;
window.openVerbDrillScreen    = openVerbDrillScreen;
window.openCaseDrillScreen    = openCaseDrillScreen;
window.openPrefixDrillScreen  = openPrefixDrillScreen;
window.openNumbersDrillScreen = openNumbersDrillScreen;
window.openVocabDrillScreen   = openVocabDrillScreen;
window.openSentenceBuildScreen = openSentenceBuildScreen;
window.openDialogueScreen     = openDialogueScreen;
window.openProgressScreen     = openProgressScreen;
window.startVocabReview       = startVocabReview;
