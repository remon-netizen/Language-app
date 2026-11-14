import { state, flagImg } from '../state.js';
import { showScreen } from '../router.js';
import { dissectSentence } from '../api/grammar.js';
import { escHtml } from '../utils.js';
import { languageName } from '../i18n.js';
import { aiErrorText } from '../api/model.js';
import { posName } from '../words.js';

const L = (en, nl) => (state.nativeLanguage === 'nl' ? nl : en);
// The model answers with these English labels (they pick the colour too).
const ROLE_NL = { subject: 'onderwerp', predicate: 'gezegde', object: 'lijdend voorwerp', modifier: 'bepaling', adverbial: 'bijwoordelijke bepaling', other: 'overig' };
const roleName = role => (state.nativeLanguage === 'nl' && ROLE_NL[String(role || '').trim().toLowerCase()]) || role || '—';

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
  if (sub) sub.innerHTML = `${flagImg(state.currentLanguage, 16)} ${languageName(state.currentLanguage)}`;
}

export async function submitDissect() {
  const input = document.getElementById('dissectInput');
  const sentence = input?.value.trim();
  if (!sentence) return;

  const resultEl = document.getElementById('dissectResult');
  resultEl.innerHTML = `<div class="grammar-loading">⏳ ${L('Analysing the sentence…', 'Zin ontleden…')}</div>`;

  const btn = document.getElementById('dissectSubmitBtn');
  if (btn) btn.disabled = true;

  try {
    const data = await dissectSentence(sentence);
    renderDissection(data, resultEl);
  } catch (err) {
    resultEl.innerHTML = `<div class="grammar-error">⚠️ ${escHtml(aiErrorText(err))}</div>`;
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
    <div class="detail-hint">${L('Tap a word above to see its grammar', 'Tik op een woord hierboven voor de grammatica')}</div>
  </div>`;

  // Translation + note
  const translationHtml = data.sentence_translation
    ? `<div class="dissect-translation">${flagImg(state.nativeLanguage, 16)} ${escHtml(data.sentence_translation)}</div>` : '';
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
        <span class="detail-label">${L('Base form', 'Basisvorm')}</span>
        <span class="detail-value">${escHtml(word.lemma || '—')}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">${L('Part of speech', 'Woordsoort')}</span>
        <span class="detail-value">${escHtml([word.part_of_speech_target, posName(word.part_of_speech)].filter(Boolean).join(' · ') || '—')}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">${L('Role in the sentence', 'Rol in de zin')}</span>
        <span class="detail-value">${escHtml(roleName(word.role_in_sentence))}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">${L('Grammar', 'Grammatica')}</span>
        <span class="detail-value">${escHtml(word.details || '—')}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">${L('Translation', 'Vertaling')}</span>
        <span class="detail-value">${escHtml(word.translation || '—')}</span>
      </div>
    </div>`;
}
