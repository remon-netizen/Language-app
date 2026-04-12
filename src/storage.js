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

export function updatePointsBadge() {
  // points badge removed — kept as no-op so existing callers don't break
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
}

export function updateApiStatus(key, provider) {
  provider = provider || state.currentProvider;
  const el = document.getElementById('apiStatus');
  const isGemini = provider === 'gemini';
  const validPrefix = isGemini ? 'AIza' : 'sk-ant-';
  const providerName = isGemini ? 'Gemini' : 'Anthropic';
  if (key && key.startsWith(validPrefix)) {
    el.textContent = `✓ ${providerName} key saved — AI responses enabled`;
    el.className = 'api-status ok';
  } else if (key) {
    el.textContent = `⚠ Key saved but may be invalid (should start with ${validPrefix})`;
    el.className = 'api-status missing';
  } else {
    el.textContent = 'No key — conversations will use fallback responses';
    el.className = 'api-status missing';
  }
}

export function getApiKey() {
  const storageKey = state.currentProvider === 'gemini' ? 'geminiKey' : 'anthropicKey';
  return localStorage.getItem(storageKey) || document.getElementById('apiKeyInput').value.trim();
}
