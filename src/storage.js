import { state } from './state.js';

export function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem('ukProgress') || '{}');
    state.categoryProgress = saved.categories || {};
    state.totalPoints = saved.points || 0;
  } catch(e) {}
}

export function saveProgress() {
  localStorage.setItem('ukProgress', JSON.stringify({ categories: state.categoryProgress, points: state.totalPoints }));
}

export function loadApiKey() {
  const radio = document.querySelector(`input[name="aiProvider"][value="${state.currentProvider}"]`);
  if (radio) radio.checked = true;
  switchProvider(state.currentProvider);
}

export function switchProvider(provider) {
  state.currentProvider = provider;
  localStorage.setItem('aiProvider', provider);
  const input = document.getElementById('apiKeyInput');
  input.placeholder = provider === 'gemini' ? 'AIza...' : 'sk-ant-...';
  const saved = localStorage.getItem(provider === 'gemini' ? 'geminiKey' : 'anthropicKey') || '';
  input.value = saved;
  updateApiStatus(saved, provider);
}

export function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (key) {
    const storageKey = state.currentProvider === 'gemini' ? 'geminiKey' : 'anthropicKey';
    localStorage.setItem(storageKey, key);
    updateApiStatus(key, state.currentProvider);
  }
  // Home notice, hub buttons and anything else that depends on the key re-check.
  document.dispatchEvent(new CustomEvent('apiKeyChanged'));
}

export function updateApiStatus(key, provider) {
  provider = provider || state.currentProvider;
  const el = document.getElementById('apiStatus');
  const isGemini = provider === 'gemini';
  const validPrefix = isGemini ? 'AIza' : 'sk-ant-';
  const providerName = isGemini ? 'Gemini' : 'Anthropic';
  const nl = state.nativeLanguage === 'nl';
  if (key && key.startsWith(validPrefix)) {
    el.textContent = nl ? `✓ ${providerName}-sleutel opgeslagen — AI-functies staan aan` : `✓ ${providerName} key saved — AI features enabled`;
    el.className = 'api-status ok';
  } else if (key) {
    el.textContent = nl ? `⚠ Sleutel opgeslagen, maar lijkt ongeldig (moet beginnen met ${validPrefix})` : `⚠ Key saved but may be invalid (should start with ${validPrefix})`;
    el.className = 'api-status missing';
  } else {
    el.textContent = nl ? 'Geen sleutel — chat gebruikt standaardantwoorden, AI-oefeningen staan uit' : 'No key — chat uses canned replies, AI exercises are off';
    el.className = 'api-status missing';
  }
}

export function getApiKey() {
  const storageKey = state.currentProvider === 'gemini' ? 'geminiKey' : 'anthropicKey';
  return localStorage.getItem(storageKey) || document.getElementById('apiKeyInput').value.trim();
}
