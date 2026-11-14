// ── Imports ───────────────────────────────────────────────────────────────────
import { state, validTargetsFor, getTargetFlag } from './state.js';
import { t, languageName } from './i18n.js';
import { escHtml } from './utils.js';
import { loadProgress, loadApiKey, saveApiKey, switchProvider } from './storage.js';
import { loadVoices, showBrowserBanner, dismissBanner, changeVoice, testVoice, speakText } from './voice.js';
import { showScreen, sheetOpened, sheetClosed } from './router.js';
import { openFreeChat, setDifficulty, sendText, toggleFreeSpeak, redoFromMessage, showConversationSummary } from './chat/chat.js';
import { useSuggestion } from './chat/suggestions.js';
import { translateText, copyTranslation, updateTranslatorLabel } from './chat/translator.js';
import { practicePronunciation } from './chat/chat-ui.js';
import { openVerbScreen, submitVerb } from './grammar/verb-conjugation.js';
import { openDissectScreen, submitDissect } from './grammar/sentence-dissection.js';
import { openWordsScreen, closeWordLookup, updateWordsCount } from './words.js';
import { openExercisesScreen, setExLevel } from './grammar/exercises-ui.js';
import { openInburgeringScreen } from './inburgering/inburgering-ui.js';
import { openDeHetScreen, setDhLevel, startDeHetDrill, answerDeHet } from './grammar/dehet-ui.js';
import { openVerbAspectScreen } from './grammar/verb-aspect-ui.js';
import { openVerbDrillScreen, startVerbReview } from './grammar/verb-drill-ui.js';
import { openCaseDrillScreen, startCaseReview } from './grammar/case-drill-ui.js';
import { openPrefixDrillScreen, startPrefixReview } from './grammar/prefix-drill-ui.js';
import { openNumbersDrillScreen, startNumbersReview } from './grammar/numbers-drill-ui.js';
import { openVocabDrillScreen, startVocabReview, startVocabWeak } from './grammar/vocab-drill-ui.js';
import { openSentenceBuildScreen } from './grammar/sentence-build-ui.js';
import { openDialogueScreen } from './grammar/dialogue-ui.js';
import { openProgressScreen } from './progress-ui.js';
import { openPathScreen, startPathReview, startPathWeak } from './grammar/path-ui.js';
import { weakSpotCount, openWeakSpots } from './weak-spots.js';
import { openReviewScreen, startReviewAll, getDueTotal } from './review.js';
import { openAlphabetScreen } from './alphabet-ui.js';
import { openTypingScreen } from './grammar/typing-ui.js';
import { typingStats } from './data/typing-progress.js';
import { nextOpenUnit, pathStats, unitStarted, unitDone } from './data/path-progress.js';
import { openKeyboardHelp } from './keyboard-help.js';
import { renderBackupSection } from './backup-ui.js';
import { unitIndex } from './data/path/index.js';
import { loc } from './grammar/drill-core.js';

// ── Speech speed ──────────────────────────────────────────────────────────────
function setSpeechRate(rate) {
  state.speechRate = rate;
  localStorage.setItem('speechRate', rate);
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.rate) === rate);
  });
}

// ── Settings drawer ───────────────────────────────────────────────────────────
function setSettingsDrawer(open) {
  document.getElementById('settingsDrawer').classList.toggle('open', open);
  document.getElementById('drawerOverlay').classList.toggle('open', open);
  document.body.classList.toggle('drawer-open', open);
  // The backup section shows when the last one was: fill it in as the drawer opens.
  if (open) renderBackupSection(document.getElementById('backupSection'));
  // The back gesture closes an open drawer instead of leaving the screen behind it.
  if (open) sheetOpened(closeSettingsDrawer); else sheetClosed(closeSettingsDrawer);
}
function closeSettingsDrawer() { setSettingsDrawer(false); }
function toggleSettingsDrawer() {
  setSettingsDrawer(!document.getElementById('settingsDrawer').classList.contains('open'));
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
  setText('progressLinkSub', 'home.progressSub');
  setText('grammarSub', 'home.grammarSub');
  setText('autoPlayLabel', 'settings.autoPlay');
  setText('geminiFreeLabel', 'settings.geminiFree');
  setText('updateToastText', 'app.updateReady');
  setText('updateToastBtn', 'app.reload');
  // Verb lookup / dissection screens
  setText('verbScreenTitle', 'grammar.verbTitle');
  setText('verbSubmitBtn', 'grammar.verbBtn');
  const vi = document.getElementById('verbInput'); if (vi) vi.placeholder = t('grammar.verbPlaceholder');
  setText('dissectScreenTitle', 'grammar.dissectTitle');
  setText('dissectSubmitBtn', 'grammar.dissectBtn');
  const di = document.getElementById('dissectInput'); if (di) di.placeholder = t('grammar.dissectPlaceholder');
  setText('summaryTitle', 'chat.summaryTitle');
  setText('langLabel', 'settings.language');
  setText('kbHelpBtn', 'settings.keyboard');
  setText('grammarLabel', 'home.grammarTitle');
  setText('myWordsLabel', 'home.myWords');
  setText('myWordsSub', 'home.myWordsSub');
  setText('startBtnLabel', 'home.start');
  setText('startBtnSub', 'home.startSub');
  setText('pathBtnTitle', 'home.pathBtnTitle');
  setText('pathBtnSub', 'home.pathBtnSub');
  setText('reviewBtnTitle', 'home.reviewTitle');
  setText('reviewBtnSub', 'home.reviewSub');
  updateReviewCount();
  setText('bbTitle', 'home.browserTitle');
  setText('bbSub', 'home.browserSub');
  setText('bbCloseBtn', 'home.browserClose');

  // Inburgering button — title is in Dutch (it's a Dutch civic exam),
  // sub-line follows native language for the English-speaking learner.
  setText('ibTitle', 'home.inburgering');
  setText('ibSub', 'home.inburgeringSub');

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
  const micBtn = document.getElementById('talkMicBtn');
  if (micBtn) micBtn.title = t('lesson.speak');
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

// One card at the top of Home that answers "what should I do now?".
function renderTodayCard() {
  const card = document.getElementById('todayCard');
  if (!card) return;
  const nl = state.nativeLanguage === 'nl';
  const due = getDueTotal();
  const weak = weakSpotCount();
  const next = nextOpenUnit();
  const anyProgress = pathStats().seen > 0 || due > 0;

  const rows = [];
  if (due > 0) {
    rows.push({ icon: '🔄', title: nl ? 'Herhalen' : 'Review', sub: nl ? `${due} aan de beurt, in één ronde` : `${due} due, in one round`, onclick: 'openReviewScreen()', hot: true });
  }
  if (weak > 0) {
    rows.push({ icon: '🎯', title: nl ? 'Zwakke plekken' : 'Weak spots', sub: nl ? `${weak} ${weak === 1 ? 'vorm' : 'vormen'} die je eerder fout had` : `${weak} form${weak === 1 ? '' : 's'} you got wrong before`, onclick: 'openWeakSpots()' });
  }
  if (next) {
    const started = unitStarted(next.id);
    rows.push({ icon: next.icon, title: started ? (nl ? 'Ga verder' : 'Continue') : !anyProgress ? (nl ? 'Begin hier' : 'Start here') : (nl ? 'Volgende unit' : 'Next unit'),
      sub: `${next.level} · ${unitIndex(next)} — ${loc(next.title)}`, onclick: `openPathScreen('${next.id}')`, hot: !anyProgress });
  }
  // The first units are typed in Cyrillic before the alphabet unit has been done:
  // until then the letters are one tap away.
  if (!unitDone('a1-02') && rows.length < 3) {
    rows.push({ icon: '🔤', title: nl ? 'Het cyrillische alfabet' : 'The Cyrillic alphabet', sub: nl ? 'De 33 letters en hoe ze klinken' : 'The 33 letters and how they sound', onclick: 'openAlphabetScreen()' });
  }
  // And so is the typing course, until its letter steps are done.
  if (!unitDone('a1-02') && typingStats().done < 6 && rows.length < 3) {
    rows.push({ icon: '⌨️', title: nl ? 'Leren typen' : 'Learn to type', sub: nl ? 'Typcursus: de letters en waar ze zitten' : 'Typing course: the letters and where they are', onclick: 'openTypingScreen()' });
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

// ── Language switchers ────────────────────────────────────────────────────────

// Refresh the highlight on the native picker (Settings).
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
    refreshConditionalFlows();
  }

  refreshNativePicker();

  // Re-apply all static strings in the new native language
  applyStaticI18n();
  // Refresh dynamic bits that depend on either native or target
  loadVoices();
  updateHeaderAndChat();
  updateTranslatorLabel();
  renderBackupSection(document.getElementById('backupSection'));
  // The language is switched from Settings, over whatever screen is open. Screens
  // are written out when they are opened, so the one underneath would stay in the
  // old language: go Home, which has just been redone in the new one.
  if (!document.getElementById('homeScreen').classList.contains('active')) showScreen('homeScreen');
}

function switchLanguage(lang) {
  // Reject invalid combination — clicking a target equal to native is a no-op.
  if (lang === state.nativeLanguage) return;

  state.currentLanguage = lang;
  localStorage.setItem('appLanguage', lang);

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

  // Highlight the picker from the persisted state.
  refreshNativePicker();
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
window.closeSettingsDrawer   = closeSettingsDrawer;
window.openKeyboardHelp      = openKeyboardHelp;
window.showScreen            = showScreen;
window.openFreeChat          = openFreeChat;
window.setDifficulty         = setDifficulty;
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
window.openDeHetScreen       = openDeHetScreen;
window.setDhLevel            = setDhLevel;
window.startDeHetDrill       = startDeHetDrill;
window.answerDeHet           = answerDeHet;
window.showConversationSummary = showConversationSummary;
window.openAlphabetScreen  = openAlphabetScreen;
window.openTypingScreen    = openTypingScreen;
window.openReviewScreen    = openReviewScreen;
window.openVerbAspectScreen = openVerbAspectScreen;
window.openVerbDrillScreen    = openVerbDrillScreen;
window.startVerbReview       = () => startVerbReview(openReviewScreen);
window.openCaseDrillScreen    = openCaseDrillScreen;
window.startCaseReview = () => startCaseReview(openReviewScreen);
window.openPrefixDrillScreen  = openPrefixDrillScreen;
window.startPrefixReview = () => startPrefixReview(openReviewScreen);
window.openNumbersDrillScreen = openNumbersDrillScreen;
window.startNumbersReview     = startNumbersReview;
window.startReviewAll         = startReviewAll;
window.openVocabDrillScreen   = openVocabDrillScreen;
window.openSentenceBuildScreen = openSentenceBuildScreen;
window.openDialogueScreen     = openDialogueScreen;
window.openProgressScreen     = openProgressScreen;
window.openPathScreen         = openPathScreen;
window.startPathReview        = startPathReview;
window.startVocabReview       = startVocabReview;
window.startVocabWeak         = startVocabWeak;
window.startPathWeak          = startPathWeak;
window.openWeakSpots          = openWeakSpots;
