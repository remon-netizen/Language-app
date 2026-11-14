import { state, getTTSLang } from './state.js';
import { showToast } from './toast.js';

function scoreVoice(v) {
  let score = 0;
  const name = v.name.toLowerCase();
  if (name.includes('natural'))  score += 40;
  if (name.includes('online'))   score += 30;
  if (name.includes('neural'))   score += 30;
  if (name.includes('google'))   score += 10;
  if (v.localService === false)  score += 5;
  return score;
}

// label: the language as an adjective, in the learner's own language ("Ukrainian voice", "Oekraïense stem").
const TARGET_META = {
  uk: { prefix: 'uk', label: { en: 'Ukrainian', nl: 'Oekraïense' },  listKey: 'availableUkVoices', selKey: 'selectedVoice',   savedKey: 'ukVoiceName' },
  nl: { prefix: 'nl', label: { en: 'Dutch',     nl: 'Nederlandse' }, listKey: 'availableNlVoices', selKey: 'selectedNlVoice', savedKey: 'nlVoiceName' },
  en: { prefix: 'en', label: { en: 'English',   nl: 'Engelse' },     listKey: 'availableEnVoices', selKey: 'selectedEnVoice', savedKey: 'enVoiceName' },
  fr: { prefix: 'fr', label: { en: 'French',    nl: 'Franse' },      listKey: 'availableFrVoices', selKey: 'selectedFrVoice', savedKey: 'frVoiceName' },
};
const L = (en, nl) => (state.nativeLanguage === 'nl' ? nl : en);

function meta() {
  return TARGET_META[state.currentLanguage] || TARGET_META.uk;
}
function getVoices()    { return state[meta().listKey] || []; }
function getSavedKey()  { return meta().savedKey; }
function getLangPrefix(){ return meta().prefix; }
function getLangLabel() { return meta().label[state.nativeLanguage] || meta().label.en; }

// Fills the voice picker in Settings. `settled` = the browser has had its chance
// to hand over its voices, so an empty list means there really are none.
let voicesSettled = false;
function populate(settled = true) {
  if (settled) voicesSettled = true;
  const all = state.synth.getVoices();
  const filtered = all
    .filter(v => v.lang.startsWith(getLangPrefix()))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a));

  state[meta().listKey] = filtered;

  const sel     = document.getElementById('voiceSelect');
  const vcLabel = document.getElementById('vcLabel');
  if (!sel) return;

  const label = getLangLabel();
  if (vcLabel) vcLabel.textContent = L(`${label} voice`, `${label} stem`);

  if (filtered.length === 0) {
    const none = settled ? L(`No ${label} voice on this device`, `Geen ${label} stem op dit apparaat`) : L('Loading voices…', 'Stemmen laden…');
    sel.innerHTML = `<option>${none}</option>`;
    document.getElementById('vcName').textContent    = none;
    document.getElementById('vcQuality').textContent = settled
      ? L(`The 🔊 buttons stay silent without one. On a computer, Microsoft Edge has ${label} voices built in. On a phone or tablet, add the language under text-to-speech in the system settings.`,
          `Zonder stem blijven de 🔊-knoppen stil. Op een computer heeft Microsoft Edge ${label} stemmen ingebouwd. Op een telefoon of tablet voeg je de taal toe bij tekst-naar-spraak in de systeeminstellingen.`)
      : '';
    document.getElementById('vcQuality').className   = 'vc-quality standard';
    return;
  }

  sel.innerHTML = filtered.map((v, i) => `<option value="${i}">${v.name}</option>`).join('');

  const saved    = localStorage.getItem(getSavedKey());
  const savedIdx = saved ? filtered.findIndex(v => v.name === saved) : -1;
  const idx      = savedIdx >= 0 ? savedIdx : 0;
  sel.value = idx;
  applyVoice(idx);
}

// Called at start-up and again whenever the target or the interface language changes.
let listening = false;
export function loadVoices() {
  const ready = state.synth.getVoices().length > 0;
  populate(ready || voicesSettled);
  if (listening) return;
  listening = true;
  // Most browsers hand over their voices a moment after load, through this event.
  state.synth.addEventListener('voiceschanged', () => populate(true));
  // Some never fire it: after a few seconds an empty list is final.
  if (!ready) setTimeout(() => populate(true), 3000);
}

// True once the browser has handed over its voices and none of them speaks the target language.
export function hasNoVoice() {
  return voicesSettled && getVoices().length === 0;
}

// For menus: a listening exercise cannot be done where nothing can be heard.
export function noVoiceReason() {
  return L(`no ${getLangLabel()} voice on this device`, `geen ${getLangLabel()} stem op dit apparaat`);
}

export function applyVoice(idx) {
  const v = getVoices()[idx];
  if (!v) return;

  state[meta().selKey] = v;
  localStorage.setItem(getSavedKey(), v.name);

  const nameEl    = document.getElementById('vcName');
  const qualityEl = document.getElementById('vcQuality');
  if (nameEl) nameEl.textContent = v.name;
  const neural = /natural|online|neural/i.test(v.name);
  if (qualityEl) {
    qualityEl.textContent = neural ? L('✓ Neural voice — high quality', '✓ Neurale stem — hoge kwaliteit') : L('⚡ Standard voice', '⚡ Standaardstem');
    qualityEl.className   = 'vc-quality ' + (neural ? 'neural' : 'standard');
  }
}

export function changeVoice() {
  applyVoice(parseInt(document.getElementById('voiceSelect').value));
}

export function testVoice() {
  const samples = {
    uk: 'Привіт! Як справи? Мене звати Саша.',
    nl: 'Hallo! Hoe gaat het? Mijn naam is Emma.',
    en: 'Hello! How are you? My name is Oliver.',
    fr: 'Bonjour ! Comment allez-vous ? Je m\'appelle Pierre.',
  };
  speakText(samples[state.currentLanguage] || samples.uk, getTTSLang());
}

function getSelectedVoice(lang) {
  const code = (lang || '').slice(0, 2);
  if (code === 'nl') return state.selectedNlVoice;
  if (code === 'uk') return state.selectedVoice;
  if (code === 'en') return state.selectedEnVoice;
  if (code === 'fr') return state.selectedFrVoice;
  return null;
}

// Without a voice for the language a tap on 🔊 does nothing at all. Say so, once
// per visit, with the way to Settings where it is explained.
let warnedSilent = false;
function warnIfSilent(lang) {
  if (warnedSilent || !hasNoVoice() || !(lang || getTTSLang()).startsWith(getLangPrefix())) return;
  if (document.querySelector('.wl-overlay.open')) return;   // a sheet covers the screen: wait for the next time
  warnedSilent = true;
  const label = getLangLabel();
  showToast(L(`This device has no ${label} voice: the 🔊 buttons do not work here.`, `Dit apparaat heeft geen ${label} stem: de 🔊-knoppen werken hier niet.`),
    { action: L('What now?', 'Wat nu?'), onAction: () => window.toggleSettingsDrawer() });
}

export function speakText(text, lang) {
  warnIfSilent(lang);
  state.synth.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang || getTTSLang();
  utt.rate = state.speechRate;
  const voice = getSelectedVoice(utt.lang);
  if (voice) utt.voice = voice;
  state.synth.speak(utt);
}

export function speakSlow(text, lang) {
  warnIfSilent(lang);
  state.synth.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang || getTTSLang();
  utt.rate = 0.62;
  const voice = getSelectedVoice(utt.lang);
  if (voice) utt.voice = voice;
  state.synth.speak(utt);
}

export function speakTextCb(text, lang, onEnd) {
  warnIfSilent(lang);
  state.synth.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang || getTTSLang();
  utt.rate = state.speechRate;
  const voice = getSelectedVoice(utt.lang);
  if (voice) utt.voice = voice;
  if (onEnd) {
    // Whatever waits for the end of the sentence (the next line of a dialogue, the
    // microphone of the pronunciation practice) must not wait for ever: speech can
    // fail, or never start (no voice, a browser that wants a tap first).
    let done = false;
    const finish = () => { if (done) return; done = true; clearTimeout(timer); onEnd(); };
    const timer = setTimeout(finish, Math.max(6000, text.length * 220));
    utt.onend = finish;
    utt.onerror = finish;
  }
  state.synth.speak(utt);
}

// Edge's neural voices are a desktop matter: on a phone or tablet every browser
// speaks with the system's own voices, so the advice would only mislead there.
export function showBrowserBanner() {
  const dismissed = localStorage.getItem('browserBannerDismissed');
  const ua = navigator.userAgent;
  const isEdge = /Edg\//.test(ua);
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const banner = document.getElementById('browserBanner');
  if (dismissed || isEdge || isMobile) {
    banner.classList.add('hidden');
  }
}

export function dismissBanner() {
  localStorage.setItem('browserBannerDismissed', '1');
  document.getElementById('browserBanner').classList.add('hidden');
}
