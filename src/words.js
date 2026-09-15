import { lookupWord } from './api/word-lookup.js';
import { escHtml } from './utils.js';
import { state } from './state.js';

const STORAGE_KEY = 'savedWords';
let _currentLookup = null;

const L = (en, nl) => (state.nativeLanguage === 'nl' ? nl : en);

// ── Storage helpers ───────────────────────────────────────────────────────────

// Every saved word, in every language (for writes).
function loadAllWords() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

// Words for the current target language. Words saved before languages were
// tagged are assigned by script: Cyrillic → Ukrainian, anything else → the
// non-Ukrainian target being studied.
function wordLang(w) {
  if (w.lang) return w.lang;
  return /[\u0400-\u04FF]/.test(w.word) ? 'uk' : (state.currentLanguage === 'uk' ? 'other' : state.currentLanguage);
}
export function loadSavedWords() {
  return loadAllWords().filter(w => wordLang(w) === state.currentLanguage);
}

export function saveWord(wordData) {
  const words = loadAllWords();
  const already = words.some(w => w.word === wordData.word && wordLang(w) === state.currentLanguage);
  if (!already) {
    words.unshift({ ...wordData, lang: state.currentLanguage, savedAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    updateWordsCount();
    return true;
  }
  return false;
}

export function deleteWord(word) {
  const words = loadAllWords().filter(w => !(w.word === word && wordLang(w) === state.currentLanguage));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  updateWordsCount();
}

export function isWordSaved(word) {
  return loadSavedWords().some(w => w.word === word);
}

export function getWordsCount() {
  return loadSavedWords().length;
}

export function updateWordsCount() {
  const count = getWordsCount();
  const due   = getDueCount();
  const badge = document.getElementById('wordsBadge');
  if (!badge) return;
  if (count > 0) {
    badge.textContent = due > 0 ? `${count} · ${due} ${L('due', 'nu')}` : count;
    badge.style.display = 'inline';
  } else {
    badge.style.display = 'none';
  }
}

// ── Spaced Repetition (SM-2 algorithm) ───────────────────────────────────────

// quality: 5 = easy, 3 = hard, 1 = again
export function scheduleWord(wordObj, quality) {
  let { interval = 0, easeFactor = 2.5, repetitions = 0 } = wordObj;
  if (quality >= 3) {
    if (repetitions === 0)      interval = 1;
    else if (repetitions === 1) interval = 6;
    else                        interval = Math.round(interval * easeFactor);
    easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    repetitions++;
  } else {
    interval   = 1;
    repetitions = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }
  return { ...wordObj, interval, easeFactor, repetitions, nextReview: Date.now() + interval * 86_400_000 };
}

export function updateWordAfterReview(updatedWord) {
  const words = loadAllWords().map(w => (w.word === updatedWord.word && wordLang(w) === wordLang(updatedWord)) ? updatedWord : w);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  updateWordsCount();
}

export function getDueWords() {
  const now = Date.now();
  return loadSavedWords().filter(w => !w.nextReview || w.nextReview <= now);
}

export function getDueCount() {
  return getDueWords().length;
}

// ── Word Lookup Popup ─────────────────────────────────────────────────────────

export async function openWordLookup(rawWord) {
  const overlay = document.getElementById('wordLookupOverlay');
  const wordEl  = document.getElementById('wlWord');
  const content = document.getElementById('wlContent');
  if (!overlay) return;

  // Strip leading/trailing non-letter chars
  const word = rawWord.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '').trim();
  if (!word) return;

  _currentLookup = null;
  wordEl.textContent = word;
  content.innerHTML = `<div class="wl-loading">${L('Looking up…', 'Opzoeken…')}</div>`;
  overlay.classList.add('open');

  try {
    const data = await lookupWord(word);
    _currentLookup = data;
    const saved = isWordSaved(data.word);

    content.innerHTML = `
      <div class="wl-translation">${escHtml(data.translation)}</div>
      <div class="wl-meta">
        <span class="wl-pos-badge">${escHtml(data.part_of_speech_target || data.part_of_speech)}</span>
        <span class="wl-pos-en">${escHtml(data.part_of_speech)}</span>
      </div>
      ${data.details ? `<div class="wl-details">${escHtml(data.details)}</div>` : ''}
      <div class="wl-base">${L('Base form', 'Basisvorm')}: <strong>${escHtml(data.word)}</strong></div>
      <button class="wl-save-btn ${saved ? 'saved' : ''}" id="wlSaveBtn">
        ${saved ? '✓ ' + L('Saved', 'Opgeslagen') : '+ ' + L('Save word', 'Woord opslaan')}
      </button>`;

    document.getElementById('wlSaveBtn').addEventListener('click', function() {
      if (!_currentLookup || isWordSaved(_currentLookup.word)) return;
      saveWord(_currentLookup);
      this.textContent = '✓ ' + L('Saved', 'Opgeslagen');
      this.classList.add('saved');
    });
  } catch (err) {
    content.innerHTML = `<div class="wl-error">${L('Could not look up word', 'Kon het woord niet opzoeken')}: ${escHtml(err.message)}</div>`;
  }
}

export function closeWordLookup() {
  const overlay = document.getElementById('wordLookupOverlay');
  if (overlay) overlay.classList.remove('open');
}

// ── My Words Screen ───────────────────────────────────────────────────────────

export function openWordsScreen() {
  window.showScreen('wordsScreen');
  renderWordsScreen();
}

export function renderWordsScreen() {
  const container = document.getElementById('wordsListContainer');
  if (!container) return;

  const words = loadSavedWords();
  if (words.length === 0) {
    container.innerHTML = `
      <div class="words-empty">
        ${L('No saved words yet.', 'Nog geen opgeslagen woorden.')}<br>
        ${L('Tap any word in a conversation to look it up and save it.', 'Tik op een woord in een gesprek om het op te zoeken en op te slaan.')}
      </div>`;
    return;
  }

  const due = getDueCount();
  const reviewBtn = due > 0 ? `
    <button class="fc-review-btn" onclick="openFlashcardScreen()">
      <span class="fc-review-icon">📇</span>
      <span class="fc-review-text">
        <span class="fc-review-title">${L(`Review ${due} word${due === 1 ? '' : 's'} due`, `${due} ${due === 1 ? 'woord' : 'woorden'} herhalen`)}</span>
        <span class="fc-review-sub">${L('Flashcards: type it or flip it', 'Flashcards: typen of omdraaien')}</span>
      </span>
      <span>→</span>
    </button>` : '';

  container.innerHTML = reviewBtn + words.map(w => `
    <div class="word-card">
      <div class="wc-body">
        <div class="wc-word">${escHtml(w.word)}</div>
        <div class="wc-translation">${escHtml(w.translation)}</div>
        <div class="wc-meta">
          <span class="wc-pos">${escHtml(w.part_of_speech_target || w.part_of_speech)}</span>
          ${w.details ? `<div class="wc-details">${escHtml(w.details)}</div>` : ''}
        </div>
      </div>
      <button class="wc-delete" data-word="${escHtml(w.word)}" title="${L('Remove', 'Verwijderen')}">🗑</button>
    </div>`).join('');

  // Attach delete listeners
  container.querySelectorAll('.wc-delete').forEach(btn => {
    btn.addEventListener('click', function() {
      deleteWord(this.dataset.word);
      renderWordsScreen();
    });
  });
}
