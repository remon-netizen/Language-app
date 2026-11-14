import { state, flagImg } from '../state.js';
import { showScreen } from '../router.js';
import { conjugateVerb } from '../api/grammar.js';
import { escHtml } from '../utils.js';
import { languageName } from '../i18n.js';

const L = (en, nl) => (state.nativeLanguage === 'nl' ? nl : en);

const COMMON_VERBS = {
  uk: [
    { verb: 'бути',     en: 'to be',         nl: 'zijn' },
    { verb: 'мати',     en: 'to have',       nl: 'hebben' },
    { verb: 'робити',   en: 'to do',         nl: 'doen' },
    { verb: 'іти',      en: 'to go',         nl: 'gaan' },
    { verb: 'говорити', en: 'to speak',      nl: 'spreken' },
    { verb: 'знати',    en: 'to know',       nl: 'weten' },
    { verb: 'хотіти',   en: 'to want',       nl: 'willen' },
    { verb: 'могти',    en: 'can',           nl: 'kunnen' },
    { verb: 'любити',   en: 'to love',       nl: 'houden van' },
    { verb: 'думати',   en: 'to think',      nl: 'denken' },
    { verb: 'бачити',   en: 'to see',        nl: 'zien' },
    { verb: 'казати',   en: 'to say',        nl: 'zeggen' },
    { verb: 'дати',     en: 'to give',       nl: 'geven' },
    { verb: 'взяти',    en: 'to take',       nl: 'nemen' },
    { verb: 'читати',   en: 'to read',       nl: 'lezen' },
    { verb: 'писати',   en: 'to write',      nl: 'schrijven' },
    { verb: 'їсти',     en: 'to eat',        nl: 'eten' },
    { verb: 'пити',     en: 'to drink',      nl: 'drinken' },
    { verb: 'жити',     en: 'to live',       nl: 'leven / wonen' },
    { verb: 'розуміти', en: 'to understand', nl: 'begrijpen' },
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
  fr: [
    { verb: 'être',       en: 'to be' },
    { verb: 'avoir',      en: 'to have' },
    { verb: 'faire',      en: 'to do / make' },
    { verb: 'aller',      en: 'to go' },
    { verb: 'venir',      en: 'to come' },
    { verb: 'dire',       en: 'to say' },
    { verb: 'savoir',     en: 'to know' },
    { verb: 'vouloir',    en: 'to want' },
    { verb: 'pouvoir',    en: 'can' },
    { verb: 'devoir',     en: 'must / to owe' },
    { verb: 'penser',     en: 'to think' },
    { verb: 'voir',       en: 'to see' },
    { verb: 'donner',     en: 'to give' },
    { verb: 'prendre',    en: 'to take' },
    { verb: 'lire',       en: 'to read' },
    { verb: 'écrire',     en: 'to write' },
    { verb: 'manger',     en: 'to eat' },
    { verb: 'boire',      en: 'to drink' },
    { verb: 'vivre',      en: 'to live' },
    { verb: 'comprendre', en: 'to understand' },
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
    <div class="common-verbs-label">${L('Common verbs — tap to look up', 'Veelgebruikte werkwoorden — tik om op te zoeken')}</div>
    <div class="common-verb-chips">
      ${verbs.map(v => `
        <button class="common-verb-chip" data-verb="${escHtml(v.verb)}">
          <span class="cv-verb">${escHtml(v.verb)}</span>
          <span class="cv-en">${escHtml(state.nativeLanguage === 'nl' && v.nl ? v.nl : v.en)}</span>
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
  if (sub) sub.innerHTML = `${flagImg(state.currentLanguage, 16)} ${languageName(state.currentLanguage)}`;
  renderCommonVerbs();
}

export async function submitVerb() {
  const input = document.getElementById('verbInput');
  const verb = input?.value.trim();
  if (!verb) return;

  const resultEl = document.getElementById('verbResult');
  resultEl.innerHTML = `<div class="grammar-loading">⏳ ${L('Looking up the conjugation…', 'Vervoeging opzoeken…')}</div>`;

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
