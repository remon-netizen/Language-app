import { state } from '../state.js';
import { t, languageName } from '../i18n.js';

// MyMemory free API expects 2-letter codes for our supported languages.
function shortCode(lang) {
  return lang === 'uk' ? 'uk' : lang === 'nl' ? 'nl' : 'en';
}

export async function translateText() {
  const input  = document.getElementById('translateInput');
  const output = document.getElementById('translateOutput');
  const text   = input.value.trim();
  if (!text) return;

  const sourceLang = shortCode(state.nativeLanguage);
  const targetLang = shortCode(state.currentLanguage);

  // Edge case: native == target (shouldn't happen due to the picker invariant,
  // but be defensive).
  if (sourceLang === targetLang) {
    output.className = 'translate-output result';
    output.innerHTML = `<div class="translate-result-uk">${escHtml(text)}</div>`;
    return;
  }

  output.className = 'translate-output loading';
  output.textContent = t('chat.translating');

  try {
    // MyMemory free API — no key required, 5 000 words/day
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    const res  = await fetch(url);
    const data = await res.json();
    const translation = data?.responseData?.translatedText;

    if (!translation || data.responseStatus !== 200) {
      throw new Error(data.responseDetails || 'Translation failed');
    }

    output.className = 'translate-output result';
    output.innerHTML = `
      <div class="translate-result-uk">${escHtml(translation)}</div>
      <button class="translate-copy-btn" onclick="copyTranslation(this)" data-text="${escHtml(translation)}">${t('chat.copy')}</button>`;
  } catch (err) {
    output.className = 'translate-output error';
    output.textContent = '⚠️ ' + err.message;
  }
}

export function updateTranslatorLabel() {
  const targetName = languageName(state.currentLanguage);
  const nativeName = languageName(state.nativeLanguage);
  const title  = document.querySelector('.translator-card .sidebar-title');
  const btn    = document.getElementById('translateBtn');
  const input  = document.getElementById('translateInput');
  const output = document.getElementById('translateOutput');
  if (title)  title.textContent       = t('chat.translateTitle', { language: targetName });
  if (btn)    btn.textContent         = t('chat.translateBtn',   { language: targetName });
  if (input) {
    input.value = '';
    input.placeholder = t('chat.translatePlaceholder', { nativeLanguage: nativeName });
  }
  if (output) { output.textContent = ''; output.className = 'translate-output'; }
}

export function copyTranslation(btn) {
  const text = btn.dataset.text;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = t('chat.copied');
    setTimeout(() => { btn.textContent = t('chat.copy'); }, 1500);
  });
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
