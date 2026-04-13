import { state } from '../state.js';
import { showScreen } from '../router.js';
import { dissectSentence } from '../api/grammar.js';
import { escHtml } from '../utils.js';

const POS_COLOURS = {
  verb:        'pos-verb',
  noun:        'pos-noun',
  adjective:   'pos-adjective',
  adverb:      'pos-adverb',
  pronoun:     'pos-pronoun',
  preposition: 'pos-preposition',
  conjunction: 'pos-conjunction',
  particle:    'pos-particle',
};

export function openDissectScreen() {
  showScreen('dissectScreen');
  const input = document.getElementById('dissectInput');
  if (input) { input.value = ''; input.focus(); }
  document.getElementById('dissectResult').innerHTML = '';
  const sub = document.getElementById('dissectScreenSub');
  if (sub) {
    const meta = { uk: '🇺🇦 Ukrainian', nl: '🇳🇱 Dutch', en: '🇬🇧 English', fr: '🇫🇷 French' };
    sub.textContent = meta[state.currentLanguage] || meta.uk;
  }
}

export async function submitDissect() {
  const input = document.getElementById('dissectInput');
  const sentence = input?.value.trim();
  if (!sentence) return;

  const resultEl = document.getElementById('dissectResult');
  resultEl.innerHTML = `<div class="grammar-loading">⏳ Analysing sentence…</div>`;

  const btn = document.getElementById('dissectSubmitBtn');
  if (btn) btn.disabled = true;

  try {
    const data = await dissectSentence(sentence);
    renderDissection(data, resultEl);
  } catch (err) {
    resultEl.innerHTML = `<div class="grammar-error">⚠️ ${escHtml(err.message)}</div>`;
  } finally {
    if (btn) btn.disabled = false;
  }
}

function renderDissection(data, container) {
  const words = data.words || [];

  // Build word pills
  let pillsHtml = `<div class="word-pill-row">`;
  words.forEach((w, i) => {
    const cls = POS_COLOURS[w.part_of_speech?.toLowerCase()] || 'pos-other';
    pillsHtml += `<button class="word-pill ${cls}" data-index="${i}">${escHtml(w.word)}</button>`;
  });
  pillsHtml += `</div>`;

  // Legend
  const usedPos = [...new Set(words.map(w => w.part_of_speech?.toLowerCase()).filter(Boolean))];
  let legendHtml = `<div class="pos-legend">`;
  for (const pos of usedPos) {
    const cls = POS_COLOURS[pos] || 'pos-other';
    const label = words.find(w => w.part_of_speech?.toLowerCase() === pos)?.part_of_speech_target || pos;
    legendHtml += `<span class="legend-item ${cls}">${escHtml(label)}</span>`;
  }
  legendHtml += `</div>`;

  // Detail panel (starts empty, filled on pill click)
  const detailHtml = `<div class="word-detail-panel" id="wordDetailPanel">
    <div class="detail-hint">Tap a word above to see its grammar breakdown</div>
  </div>`;

  // Translation + note
  const translationHtml = data.sentence_translation
    ? `<div class="dissect-translation">🇬🇧 ${escHtml(data.sentence_translation)}</div>` : '';
  const noteHtml = data.grammar_note
    ? `<div class="grammar-note-box">📝 ${escHtml(data.grammar_note)}</div>` : '';

  container.innerHTML = pillsHtml + legendHtml + detailHtml + translationHtml + noteHtml;

  // Wire pill clicks
  container.querySelectorAll('.word-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.word-pill').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      const word = words[parseInt(pill.dataset.index)];
      showWordDetail(word, document.getElementById('wordDetailPanel'));
    });
  });

  // Auto-select first word
  const firstPill = container.querySelector('.word-pill');
  if (firstPill) firstPill.click();
}

function showWordDetail(word, panel) {
  panel.innerHTML = `
    <div class="detail-word">${escHtml(word.word)}</div>
    <div class="detail-grid">
      <div class="detail-row">
        <span class="detail-label">Base form</span>
        <span class="detail-value">${escHtml(word.lemma || '—')}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Part of speech</span>
        <span class="detail-value">${escHtml(word.part_of_speech_target || word.part_of_speech || '—')}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Role in sentence</span>
        <span class="detail-value">${escHtml(word.role_in_sentence || '—')}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Grammar details</span>
        <span class="detail-value">${escHtml(word.details || '—')}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Translation</span>
        <span class="detail-value">${escHtml(word.translation || '—')}</span>
      </div>
    </div>`;
}
