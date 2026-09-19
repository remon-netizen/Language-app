import { state } from '../state.js';
import { escHtml } from '../utils.js';
import { VERB_PAIRS } from '../data/verb-aspects.js';
import { loc } from './drill-core.js';

// Aspect explained: how the two aspects differ, and every pair's sentences with
// the reason behind each choice. Reference only. Aspect is practised where the
// verb is learned: the last step of Learn One in the Verb Drill, its review, and
// whole sentences in the Sentence Builder.

function getScreen() { return document.getElementById('verbAspectScreen'); }

// ── Public entry ─────────────────────────────────────────────────────────────

export function openVerbAspectScreen() {
  window.showScreen('verbAspectScreen');
  showMenu();
}

// ── Main menu ────────────────────────────────────────────────────────────────

function showMenu() {
  const s = getScreen();
  const native = state.nativeLanguage;
  const lblTitle    = native === 'nl' ? '🔀 Aspect uitgelegd' : '🔀 Aspect explained';
  const lblSub      = native === 'nl' ? 'Voltooid vs onvoltooid' : 'Perfective vs Imperfective';
  const lblRef      = native === 'nl' ? '📖 Werkwoord-overzicht' : '📖 Verb Reference Cards';
  const lblRefSub   = native === 'nl' ? 'Bekijk alle 20 werkwoordparen' : 'Browse all 20 verb pairs';
  const lblWhere    = native === 'nl'
    ? 'Oefenen doe je bij het werkwoord zelf: kies het bij “Leer één” in de Werkwoord Drill. De laatste stap vraagt welk aspect een zin nodig heeft.'
    : 'You practise this with the verb itself: pick it under “Learn One” in the Verb Drill. The last step asks which aspect a sentence needs.';
  const lblHow      = native === 'nl' ? 'Hoe werkt het aspect?' : 'How does aspect work?';

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vaBack">←</button>
      <div>
        <div class="lesson-title">${lblTitle}</div>
        <div class="lesson-subtitle">${lblSub}</div>
      </div>
    </div>

    <div class="va-tip-card">
      <div class="va-tip-title">${lblHow}</div>
      <div class="va-tip-body">${native === 'nl'
        ? '<b>Onvoltooid</b> (imperfective) = proces, gewoonte, herhaling, achtergrond.<br><b>Voltooid</b> (perfective) = resultaat, eenmalige actie, voltooid feit.<br><br>Tip: als je "elke dag", "altijd", "lang" ziet → waarschijnlijk <b>onvoltooid</b>.<br>Als je "al", "klaar", "in 5 minuten" ziet → waarschijnlijk <b>voltooid</b>.'
        : '<b>Imperfective</b> = process, habit, repetition, background action.<br><b>Perfective</b> = result, single completed action, done deal.<br><br>Tip: if you see "every day", "always", "for a long time" → likely <b>imperfective</b>.<br>If you see "already", "finished", "in 5 minutes" → likely <b>perfective</b>.'
      }</div>
    </div>

    <div class="va-menu-grid">
      <button class="va-menu-card" id="vaRefBtn">
        <span class="va-menu-icon">📖</span>
        <span class="va-menu-title">${lblRef}</span>
        <span class="va-menu-sub">${lblRefSub}</span>
      </button>
    </div>
    <div class="va-where">🎓 ${lblWhere}</div>`;

  s.querySelector('#vaBack').addEventListener('click', () => window.openVerbDrillScreen());
  s.querySelector('#vaRefBtn').addEventListener('click', () => showReference(0));
}

// ── Reference cards ──────────────────────────────────────────────────────────

function showReference(index) {
  const pair = VERB_PAIRS[index];
  const s = getScreen();
  const native = state.nativeLanguage;
  const total = VERB_PAIRS.length;

  const examplesHtml = pair.sentences.map(sent => {
    const aspectLabel = sent.aspect === 'imperfective'
      ? `<span class="va-aspect-tag va-imp">IMP</span>`
      : `<span class="va-aspect-tag va-perf">PERF</span>`;
    return `
      <div class="va-ref-example">
        <div class="va-ref-uk">${aspectLabel} ${escHtml(sent.uk)}</div>
        <div class="va-ref-en">${escHtml(loc(sent))}</div>
        <div class="va-ref-why">${escHtml(loc(sent.why))}</div>
      </div>`;
  }).join('');

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vaRefBack">←</button>
      <div>
        <div class="lesson-title">${escHtml(pair.imperfective)} / ${escHtml(pair.perfective)}</div>
        <div class="lesson-subtitle">${escHtml(loc(pair.meaning))} — ${index + 1}/${total}</div>
      </div>
    </div>

    <div class="va-ref-card">
      <div class="va-ref-pair-row">
        <div class="va-ref-pair-col va-imp-bg">
          <div class="va-ref-pair-label">${native === 'nl' ? 'Onvoltooid' : 'Imperfective'}</div>
          <div class="va-ref-pair-verb">${escHtml(pair.imperfective)}</div>
        </div>
        <div class="va-ref-pair-col va-perf-bg">
          <div class="va-ref-pair-label">${native === 'nl' ? 'Voltooid' : 'Perfective'}</div>
          <div class="va-ref-pair-verb">${escHtml(pair.perfective)}</div>
        </div>
      </div>
      <div class="va-ref-tip">${escHtml(loc(pair.tip))}</div>
    </div>

    <div class="va-ref-examples-title">${native === 'nl' ? 'Voorbeelden' : 'Examples'}</div>
    <div class="va-ref-examples">${examplesHtml}</div>

    <div class="va-ref-nav">
      <button class="va-nav-btn" id="vaRefPrev" ${index === 0 ? 'disabled' : ''}>← ${native === 'nl' ? 'Vorige' : 'Previous'}</button>
      <button class="va-nav-btn" id="vaRefNext" ${index === total - 1 ? 'disabled' : ''}>${native === 'nl' ? 'Volgende' : 'Next'} →</button>
    </div>`;

  s.querySelector('#vaRefBack').addEventListener('click', showMenu);
  if (index > 0) s.querySelector('#vaRefPrev').addEventListener('click', () => showReference(index - 1));
  if (index < total - 1) s.querySelector('#vaRefNext').addEventListener('click', () => showReference(index + 1));
}
