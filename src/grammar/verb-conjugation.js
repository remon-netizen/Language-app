import { state } from '../state.js';
import { showScreen } from '../router.js';
import { conjugateVerb } from '../api/grammar.js';
import { escHtml } from '../utils.js';

const COMMON_VERBS = {
  uk: [
    { verb: 'бути',     en: 'to be' },
    { verb: 'мати',     en: 'to have' },
    { verb: 'робити',   en: 'to do' },
    { verb: 'іти',      en: 'to go' },
    { verb: 'говорити', en: 'to speak' },
    { verb: 'знати',    en: 'to know' },
    { verb: 'хотіти',   en: 'to want' },
    { verb: 'могти',    en: 'can' },
    { verb: 'любити',   en: 'to love' },
    { verb: 'думати',   en: 'to think' },
    { verb: 'бачити',   en: 'to see' },
    { verb: 'казати',   en: 'to say' },
    { verb: 'дати',     en: 'to give' },
    { verb: 'взяти',    en: 'to take' },
    { verb: 'читати',   en: 'to read' },
    { verb: 'писати',   en: 'to write' },
    { verb: 'їсти',     en: 'to eat' },
    { verb: 'пити',     en: 'to drink' },
    { verb: 'жити',     en: 'to live' },
    { verb: 'розуміти', en: 'to understand' },
  ],
  nl: [
    { verb: 'zijn',      en: 'to be' },
    { verb: 'hebben',    en: 'to have' },
    { verb: 'doen',      en: 'to do' },
    { verb: 'gaan',      en: 'to go' },
    { verb: 'komen',     en: 'to come' },
    { verb: 'zeggen',    en: 'to say' },
    { verb: 'weten',     en: 'to know' },
    { verb: 'willen',    en: 'to want' },
    { verb: 'kunnen',    en: 'can' },
    { verb: 'maken',     en: 'to make' },
    { verb: 'denken',    en: 'to think' },
    { verb: 'zien',      en: 'to see' },
    { verb: 'geven',     en: 'to give' },
    { verb: 'nemen',     en: 'to take' },
    { verb: 'lezen',     en: 'to read' },
    { verb: 'schrijven', en: 'to write' },
    { verb: 'eten',      en: 'to eat' },
    { verb: 'drinken',   en: 'to drink' },
    { verb: 'wonen',     en: 'to live' },
    { verb: 'begrijpen', en: 'to understand' },
  ],
  en: [
    { verb: 'to be',         en: 'zijn' },
    { verb: 'to have',       en: 'hebben' },
    { verb: 'to do',         en: 'doen' },
    { verb: 'to go',         en: 'gaan' },
    { verb: 'to come',       en: 'komen' },
    { verb: 'to say',        en: 'zeggen' },
    { verb: 'to know',       en: 'weten' },
    { verb: 'to want',       en: 'willen' },
    { verb: 'can',           en: 'kunnen' },
    { verb: 'to make',       en: 'maken' },
    { verb: 'to think',      en: 'denken' },
    { verb: 'to see',        en: 'zien' },
    { verb: 'to give',       en: 'geven' },
    { verb: 'to take',       en: 'nemen' },
    { verb: 'to read',       en: 'lezen' },
    { verb: 'to write',      en: 'schrijven' },
    { verb: 'to eat',        en: 'eten' },
    { verb: 'to drink',      en: 'drinken' },
    { verb: 'to live',       en: 'wonen' },
    { verb: 'to understand', en: 'begrijpen' },
  ],
};

function renderCommonVerbs() {
  const container = document.getElementById('commonVerbsContainer');
  if (!container) return;
  const verbs = COMMON_VERBS[state.currentLanguage] || COMMON_VERBS.uk;
  container.innerHTML = `
    <div class="common-verbs-label">Common verbs — tap to look up</div>
    <div class="common-verb-chips">
      ${verbs.map(v => `
        <button class="common-verb-chip" data-verb="${escHtml(v.verb)}">
          <span class="cv-verb">${escHtml(v.verb)}</span>
          <span class="cv-en">${escHtml(v.en)}</span>
        </button>`).join('')}
    </div>`;

  container.querySelectorAll('.common-verb-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById('verbInput');
      if (input) input.value = btn.dataset.verb;
      submitVerb();
    });
  });
}

export function openVerbScreen() {
  showScreen('verbScreen');
  const input = document.getElementById('verbInput');
  if (input) { input.value = ''; input.focus(); }
  document.getElementById('verbResult').innerHTML = '';
  const sub = document.getElementById('verbScreenSub');
  if (sub) {
    const meta = { uk: '🇺🇦 Ukrainian', nl: '🇳🇱 Dutch', en: '🇬🇧 English' };
    sub.textContent = meta[state.currentLanguage] || meta.uk;
  }
  renderCommonVerbs();
}

export async function submitVerb() {
  const input = document.getElementById('verbInput');
  const verb = input?.value.trim();
  if (!verb) return;

  const resultEl = document.getElementById('verbResult');
  resultEl.innerHTML = `<div class="grammar-loading">⏳ Looking up conjugation…</div>`;

  const btn = document.getElementById('verbSubmitBtn');
  if (btn) btn.disabled = true;

  try {
    const data = await conjugateVerb(verb);
    renderConjugation(data, resultEl);
  } catch (err) {
    resultEl.innerHTML = `<div class="grammar-error">⚠️ ${escHtml(err.message)}</div>`;
  } finally {
    if (btn) btn.disabled = false;
  }
}

function renderConjugation(data, container) {
  const tenses = data.tenses || [];
  let html = `
    <div class="verb-header">
      <span class="verb-infinitive">${escHtml(data.verb_target || '')}</span>
      <span class="verb-meaning">= ${escHtml(data.verb_infinitive || '')}</span>
    </div>`;

  for (const tense of tenses) {
    html += `
      <div class="tense-card">
        <div class="tense-title">
          ${escHtml(tense.tense_name)}
          <span class="tense-title-target">${escHtml(tense.tense_name_target || '')}</span>
        </div>
        <div class="conjugation-table">`;
    for (const f of (tense.forms || [])) {
      html += `
          <div class="conjugation-row">
            <span class="conj-pronoun">${escHtml(f.pronoun)}</span>
            <span class="conj-pronoun-en">${escHtml(f.pronoun_en)}</span>
            <span class="conj-form">${escHtml(f.form)}</span>
          </div>`;
    }
    html += `</div></div>`;
  }

  if (data.notes) {
    html += `<div class="grammar-note-box">📝 ${escHtml(data.notes)}</div>`;
  }

  container.innerHTML = html;
}
