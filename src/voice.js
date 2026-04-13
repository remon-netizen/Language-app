import { state, getTTSLang } from './state.js';

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

const TARGET_META = {
  uk: { prefix: 'uk', label: 'Ukrainian', listKey: 'availableUkVoices', selKey: 'selectedVoice',   savedKey: 'ukVoiceName' },
  nl: { prefix: 'nl', label: 'Dutch',     listKey: 'availableNlVoices', selKey: 'selectedNlVoice', savedKey: 'nlVoiceName' },
  en: { prefix: 'en', label: 'English',   listKey: 'availableEnVoices', selKey: 'selectedEnVoice', savedKey: 'enVoiceName' },
  fr: { prefix: 'fr', label: 'French',    listKey: 'availableFrVoices', selKey: 'selectedFrVoice', savedKey: 'frVoiceName' },
};

function meta() {
  return TARGET_META[state.currentLanguage] || TARGET_META.uk;
}
function getVoices()    { return state[meta().listKey] || []; }
function getSavedKey()  { return meta().savedKey; }
function getLangPrefix(){ return meta().prefix; }
function getLangLabel() { return meta().label; }

export function loadVoices() {
  const populate = () => {
    const all = state.synth.getVoices();
    const filtered = all
      .filter(v => v.lang.startsWith(getLangPrefix()))
      .sort((a, b) => scoreVoice(b) - scoreVoice(a));

    state[meta().listKey] = filtered;

    const sel     = document.getElementById('voiceSelect');
    const vcLabel = document.getElementById('vcLabel');
    if (!sel) return;

    if (vcLabel) vcLabel.textContent = `${getLangLabel()} voice`;

    if (filtered.length === 0) {
      sel.innerHTML = `<option>No ${getLangLabel()} voices found</option>`;
      document.getElementById('vcName').textContent    = `No ${getLangLabel()} voices found`;
      document.getElementById('vcQuality').textContent = 'Try Microsoft Edge for best results';
      document.getElementById('vcQuality').className   = 'vc-quality standard';
      return;
    }

    sel.innerHTML = filtered.map((v, i) => `<option value="${i}">${v.name}</option>`).join('');

    const saved    = localStorage.getItem(getSavedKey());
    const savedIdx = saved ? filtered.findIndex(v => v.name === saved) : -1;
    const idx      = savedIdx >= 0 ? savedIdx : 0;
    sel.value = idx;
    applyVoice(idx);
  };

  if (state.synth.getVoices().length) populate();
  // voiceschanged fires once on load; re-populate whenever language switches
  state.synth.addEventListener('voiceschanged', populate);
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
    qualityEl.textContent = neural ? '✓ Neural voice — high quality' : '⚡ Standard voice';
    qualityEl.className   = 'vc-quality ' + (neural ? 'neural' : 'standard');
  }
}

export function changeVoice() {
  applyVoice(parseInt(document.getElementById('voiceSelect').value));
}

export function testVoice() {
  const samples = {
    uk: 'Привіт! Як справи? Мене звати Sasha.',
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

export function speakText(text, lang) {
  state.synth.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang || getTTSLang();
  utt.rate = state.speechRate;
  const voice = getSelectedVoice(utt.lang);
  if (voice) utt.voice = voice;
  state.synth.speak(utt);
}

export function speakSlow(text, lang) {
  state.synth.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang || getTTSLang();
  utt.rate = 0.62;
  const voice = getSelectedVoice(utt.lang);
  if (voice) utt.voice = voice;
  state.synth.speak(utt);
}

export function speakTextCb(text, lang, onEnd) {
  state.synth.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang || getTTSLang();
  utt.rate = state.speechRate;
  const voice = getSelectedVoice(utt.lang);
  if (voice) utt.voice = voice;
  if (onEnd) utt.onend = onEnd;
  state.synth.speak(utt);
}

export function showBrowserBanner() {
  const dismissed = localStorage.getItem('browserBannerDismissed');
  const isEdge = /Edg\//.test(navigator.userAgent);
  const banner = document.getElementById('browserBanner');
  if (dismissed || isEdge) {
    banner.classList.add('hidden');
  }
}

export function dismissBanner() {
  localStorage.setItem('browserBannerDismissed', '1');
  document.getElementById('browserBanner').classList.add('hidden');
}
