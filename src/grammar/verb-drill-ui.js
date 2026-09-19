import { state } from '../state.js';
import { escHtml } from '../utils.js';
import { CONJUGATIONS, buildDrillSet, findVerb } from '../data/verb-conjugations.js';
import { VERB_PAIRS } from '../data/verb-aspects.js';
import { ASPECT_TIPS } from '../data/aspect-tips.js';
import { L, loc, shuffle, grade } from './drill-core.js';
import { runSession } from './course-engine.js';
import { verbProgress, verbStats, tenseKey, aspectKey, TENSES } from '../data/verb-progress.js';
import { recordAnswer, getVerbMastery, getAllMastery, getWeakItems, hasWeaknessData, getWeakVerbCount } from '../data/verb-weakness.js';
import { englishGloss, aspectNote } from './english-gloss.js';

// ── State ────────────────────────────────────────────────────────────────────

let vd = {
  total:     25,
  mode:      'menu',      // 'menu' | 'reference' | 'drill' | 'learnPicker' | 'selectPicker' | 'learnVerb'
  refIdx:    0,
  filter:    'all',        // 'all' | 'imperfective' | 'perfective'
  tenseFilter: 'all',     // 'all' | 'present' | 'past' | 'future' | 'imperative'
  level:     localStorage.getItem('verbDrillLevel') || 'A1',
  focusWeak: false,
  dictation: localStorage.getItem('verbDrillDictation') === '1', // hear the form, type it
  // My list: hand-picked verb pairs to drill (e.g. this week's class list)
  selection:    loadSelection(),
  useSelection: localStorage.getItem('verbDrillUseSelection') === '1',
};

const COURSE = { icon: '✍️', get name() { return L('Verbs', 'Werkwoorden'); } };
const ACCENT = { main: '#0891b2', dark: '#155e75', soft: '#ecfeff', border: '#a5f3fc' };

function getScreen() { return document.getElementById('verbDrillScreen'); }

// ── Helpers ──────────────────────────────────────────────────────────────────

function getVerbsForLevel(level) {
  const levels = { A1: ['A1'], A2: ['A1', 'A2'], B1: ['A1', 'A2', 'B1'] };
  const allowed = levels[level] || levels.A1;
  return CONJUGATIONS.filter(v => allowed.includes(v.level || 'A1'));
}

const ALL_TENSES = ['present', 'past', 'future', 'imperative'];

/** My list is stored as imperfective infinitives; the partner is looked up on use. */
function loadSelection() {
  try {
    const raw = JSON.parse(localStorage.getItem('verbDrillSelection') || '[]');
    if (!Array.isArray(raw)) return new Set();
    return new Set(raw.filter(inf => CONJUGATIONS.some(v => v.infinitive === inf)));
  } catch {
    return new Set();
  }
}

function saveSelection() {
  localStorage.setItem('verbDrillSelection', JSON.stringify([...vd.selection]));
}

/** Expand each selected pair into both aspects, so a pick drills imperfective + perfective. */
function getSelectedVerbs() {
  const verbs = [];
  for (const inf of vd.selection) {
    const imp = findVerb(inf);
    if (!imp) continue;
    verbs.push(imp);
    const perf = imp.partner ? findVerb(imp.partner) : null;
    if (perf) verbs.push(perf);
  }
  return verbs;
}

/** True when the drill should be restricted to My list. */
function selectionActive() {
  return vd.useSelection && vd.selection.size > 0;
}

function countFormsForVerbs(verbs) {
  let count = 0;
  for (const v of verbs) {
    for (const t of ALL_TENSES) {
      if (v[t]) count += Object.keys(v[t]).length;
    }
  }
  return count;
}

function countFormsForLevel(level) {
  return countFormsForVerbs(getVerbsForLevel(level));
}

function getAllowedTenses(level) {
  if (level === 'A1') return ['present', 'past'];
  return ['present', 'past', 'future', 'imperative'];
}

function getPairsForLevel(level) {
  const verbs = getVerbsForLevel(level);
  const pairs = [];
  for (let i = 0; i < verbs.length; i += 2) {
    if (verbs[i + 1]) pairs.push([verbs[i], verbs[i + 1]]);
  }
  return pairs;
}

function getMasteryColor(inf1, inf2) {
  const m1 = getVerbMastery(inf1);
  const m2 = getVerbMastery(inf2);
  const total = m1.attempts + m2.attempts;
  if (total === 0) return 'gray';
  const avg = (m1.pct + m2.pct) / 2;
  if (avg >= 80) return 'green';
  if (avg >= 50) return 'yellow';
  return 'red';
}

// ── Public entry ─────────────────────────────────────────────────────────────

export function openVerbDrillScreen() {
  window.showScreen('verbDrillScreen');
  showMenu();
}

// ── Main menu ────────────────────────────────────────────────────────────────

function showMenu() {
  vd.mode = 'menu';
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const selOn = selectionActive();
  const selVerbs = selOn ? getSelectedVerbs() : [];
  const verbCount = selOn ? selVerbs.length : getVerbsForLevel(vd.level).length;
  const formCount = selOn ? countFormsForVerbs(selVerbs) : countFormsForLevel(vd.level);
  const allowedTenses = selOn ? ALL_TENSES : getAllowedTenses(vd.level);
  const weakCount = getWeakVerbCount();
  const hasWeak = hasWeaknessData();
  const st = verbStats();

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vdBack">←</button>
      <div>
        <div class="lesson-title">✍️ ${nl ? 'Werkwoord Drill' : 'Verb Drill'}</div>
        <div class="lesson-subtitle">${nl ? 'Vormen, aspect en zinnen — door te typen' : 'Forms, aspect and sentences — by typing'}</div>
      </div>
    </div>

    <div class="vd-stats-bar">
      <span class="vd-stat">📊 ${verbCount} ${nl ? 'werkwoorden' : 'verbs'}</span>
      <span class="vd-stat">🎯 ${formCount} ${nl ? 'vormen' : 'forms'}</span>
      <span class="vd-stat">${selOn ? `📝 ${nl ? 'Mijn lijst' : 'My list'}` : `🔀 ${nl ? 'Willekeurig' : 'Randomised'}`}</span>
      <span class="vd-stat">📚 ${st.learned} ${nl ? (st.learned === 1 ? 'tijd geleerd' : 'tijden geleerd') : (st.learned === 1 ? 'tense learned' : 'tenses learned')}</span>
    </div>

    ${st.seen ? `
    <button class="vd-review-btn" id="vdReviewBtn" ${st.due ? '' : 'disabled'}>
      🔄 ${st.due ? (nl ? `Herhalen: ${st.due} aan de beurt` : `Review: ${st.due} due`) : (nl ? 'Niets aan de beurt' : 'Nothing due right now')}
      <span class="vd-review-sub">${nl ? 'Van de werkwoorden die je met “Leer één” hebt geleerd' : 'From the verbs you learned with “Learn One”'}</span>
    </button>` : ''}

    <div class="vd-filter-section">
      ${vd.selection.size ? `
        <div class="vd-weak-toggle vd-list-toggle ${vd.useSelection ? 'active' : ''}" id="vdSelToggle">
          <span class="vd-weak-check">${vd.useSelection ? '✓' : ''}</span>
          <span>📝 ${nl
            ? `Alleen mijn lijst (${vd.selection.size} werkwoorden)`
            : `Only my list (${vd.selection.size} verbs)`}</span>
        </div>` : ''}

      <div class="vd-filter-label">${nl ? 'Niveau:' : 'Level:'}${selOn
        ? ` <span class="vd-label-hint">${nl ? '— niet gebruikt bij mijn lijst' : '— not used with my list'}</span>`
        : ''}</div>
      <div class="vd-level-row${selOn ? ' vd-dim' : ''}">
        <button class="vd-level-btn ${vd.level === 'A1' ? 'active' : ''}" data-level="A1">A1</button>
        <button class="vd-level-btn ${vd.level === 'A2' ? 'active' : ''}" data-level="A2">A1 + A2</button>
        <button class="vd-level-btn ${vd.level === 'B1' ? 'active' : ''}" data-level="B1">A1 + A2 + B1</button>
      </div>

      <div class="vd-filter-label" style="margin-top:10px">${nl ? 'Aspect:' : 'Aspect:'}</div>
      <div class="vd-filter-row">
        <button class="vd-filter-btn ${vd.filter === 'all' ? 'active' : ''}" data-filter="all">${nl ? 'Alle' : 'All'}</button>
        <button class="vd-filter-btn ${vd.filter === 'imperfective' ? 'active' : ''}" data-filter="imperfective">${nl ? 'Onvoltooid' : 'Imperfective'}</button>
        <button class="vd-filter-btn ${vd.filter === 'perfective' ? 'active' : ''}" data-filter="perfective">${nl ? 'Voltooid' : 'Perfective'}</button>
      </div>
      <div class="vd-filter-label" style="margin-top:10px">${nl ? 'Tijd:' : 'Tense:'}</div>
      <div class="vd-filter-row" id="vdTenseRow">
        <button class="vd-filter-btn ${vd.tenseFilter === 'all' ? 'active' : ''}" data-tense="all">${nl ? 'Alle' : 'All'}</button>
        <button class="vd-filter-btn ${vd.tenseFilter === 'present' ? 'active' : ''}" data-tense="present">${nl ? 'Heden' : 'Present'}</button>
        <button class="vd-filter-btn ${vd.tenseFilter === 'past' ? 'active' : ''}" data-tense="past">${nl ? 'Verleden' : 'Past'}</button>
        <button class="vd-filter-btn ${vd.tenseFilter === 'future' ? 'active' : ''} ${!allowedTenses.includes('future') ? 'disabled' : ''}" data-tense="future">${nl ? 'Toekomst' : 'Future'}</button>
        <button class="vd-filter-btn ${vd.tenseFilter === 'imperative' ? 'active' : ''} ${!allowedTenses.includes('imperative') ? 'disabled' : ''}" data-tense="imperative">${nl ? 'Gebiedend' : 'Imperative'}</button>
      </div>

      <div class="vd-weak-toggle vd-dictation-toggle ${vd.dictation ? 'active' : ''}" id="vdDictToggle">
        <span class="vd-weak-check">${vd.dictation ? '✓' : ''}</span>
        <span>👂 ${nl ? 'Dictee: hoor de vorm, typ wat je hoort' : 'Dictation: hear the form, type what you hear'}</span>
      </div>
      ${hasWeak ? `
        <div class="vd-weak-toggle ${vd.focusWeak ? 'active' : ''}" id="vdWeakToggle">
          <span class="vd-weak-check">${vd.focusWeak ? '✓' : ''}</span>
          <span>🎯 ${nl ? `Focus op zwakke werkwoorden (${weakCount})` : `Focus on weak verbs (${weakCount})`}</span>
        </div>` : ''}
    </div>

    <div class="vd-menu-grid-4 vd-menu-grid-5">
      <button class="vd-menu-card" id="vdAspectBtn">
        <span class="vd-menu-icon">🔀</span>
        <span class="vd-menu-title">Aspect</span>
        <span class="vd-menu-sub">${nl ? 'Uitleg + voorbeelden' : 'Explained + examples'}</span>
      </button>
      <button class="vd-menu-card" id="vdRefBtn">
        <span class="vd-menu-icon">📖</span>
        <span class="vd-menu-title">${nl ? 'Tabel' : 'Tables'}</span>
        <span class="vd-menu-sub">${nl ? 'Vervoegingen' : 'Conjugations'}</span>
      </button>
      <button class="vd-menu-card" id="vdLearnBtn">
        <span class="vd-menu-icon">🎓</span>
        <span class="vd-menu-title">${nl ? 'Leer één' : 'Learn One'}</span>
        <span class="vd-menu-sub">${nl ? 'Eén werkwoord' : 'One verb'}</span>
      </button>
      <button class="vd-menu-card" id="vdPickBtn">
        <span class="vd-menu-icon">📝</span>
        <span class="vd-menu-title">${nl ? 'Mijn lijst' : 'My List'}</span>
        <span class="vd-menu-sub">${vd.selection.size
          ? `${vd.selection.size} ${nl ? 'gekozen' : 'selected'}`
          : (nl ? 'Kies zelf' : 'Pick your own')}</span>
      </button>
      <button class="vd-menu-card vd-menu-primary" id="vdStartBtn">
        <span class="vd-menu-icon">✍️</span>
        <span class="vd-menu-title">${nl ? 'Drill' : 'Drill'}</span>
        <span class="vd-menu-sub">25 ${nl ? 'vragen' : 'questions'}</span>
      </button>
    </div>`;

  s.querySelector('#vdBack').addEventListener('click', () => window.openExercisesScreen());
  s.querySelector('#vdRefBtn').addEventListener('click', () => showReference(0));
  s.querySelector('#vdAspectBtn').addEventListener('click', () => window.openVerbAspectScreen());
  s.querySelector('#vdLearnBtn').addEventListener('click', () => showVerbPicker());
  s.querySelector('#vdPickBtn').addEventListener('click', () => showSelectionPicker());
  s.querySelector('#vdStartBtn').addEventListener('click', startDrill);
  s.querySelector('#vdReviewBtn')?.addEventListener('click', () => startVerbReview(showMenu));

  // "Only my list" toggle — re-renders so the stats bar and tense row follow it
  const selToggle = s.querySelector('#vdSelToggle');
  if (selToggle) {
    selToggle.addEventListener('click', () => {
      vd.useSelection = !vd.useSelection;
      localStorage.setItem('verbDrillUseSelection', vd.useSelection ? '1' : '0');
      showMenu();
    });
  }

  // Level filter
  s.querySelectorAll('[data-level]').forEach(btn => {
    btn.addEventListener('click', () => {
      vd.level = btn.dataset.level;
      localStorage.setItem('verbDrillLevel', vd.level);
      // Reset tense filter if it's not allowed at new level
      const allowed = getAllowedTenses(vd.level);
      if (vd.tenseFilter !== 'all' && !allowed.includes(vd.tenseFilter)) {
        vd.tenseFilter = 'all';
      }
      showMenu();
    });
  });

  // Aspect filter
  s.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      vd.filter = btn.dataset.filter;
      s.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === vd.filter));
    });
  });
  // Tense filter
  s.querySelectorAll('[data-tense]').forEach(btn => {
    if (btn.classList.contains('disabled')) return;
    btn.addEventListener('click', () => {
      vd.tenseFilter = btn.dataset.tense;
      s.querySelectorAll('[data-tense]').forEach(b => {
        if (!b.classList.contains('disabled')) {
          b.classList.toggle('active', b.dataset.tense === vd.tenseFilter);
        }
      });
    });
  });

  // Dictation toggle
  const dictToggle = s.querySelector('#vdDictToggle');
  dictToggle.addEventListener('click', () => {
    vd.dictation = !vd.dictation;
    localStorage.setItem('verbDrillDictation', vd.dictation ? '1' : '0');
    dictToggle.classList.toggle('active', vd.dictation);
    dictToggle.querySelector('.vd-weak-check').textContent = vd.dictation ? '✓' : '';
  });
  // Weakness toggle
  const weakToggle = s.querySelector('#vdWeakToggle');
  if (weakToggle) {
    weakToggle.addEventListener('click', () => {
      vd.focusWeak = !vd.focusWeak;
      weakToggle.classList.toggle('active', vd.focusWeak);
      weakToggle.querySelector('.vd-weak-check').textContent = vd.focusWeak ? '✓' : '';
    });
  }
}

// ── Reference tables ─────────────────────────────────────────────────────────

/**
 * The conjugation table shown after an answer. Separate from renderTable because
 * it highlights the drilled row and uses the feedback styling, but it carries the
 * same gloss and usage note -- the moment right after answering is exactly when
 * that explanation is wanted. Shared by both answer handlers, which previously
 * held byte-identical copies and so missed the glosses when renderTable gained them.
 */
/**
 * The one-line aspect tip for a pair. VERB_PAIRS covers the 20 pairs in the
 * aspect drill; ASPECT_TIPS covers the other 34. Keyed by the imperfective, so a
 * perfective looks up through its partner.
 *
 * This is where the aspect nuance belongs: what "по-" does to a verb is a fact
 * about the pair, not about any one tense, and repeating it under every tense is
 * what made the tables heavy.
 */
function pairTip(verb) {
  if (!verb) return '';
  const impInf = verb.aspect === 'imperfective' ? verb.infinitive : verb.partner;
  const fromPairs = VERB_PAIRS.find(p => p.imperfective === impInf);
  if (fromPairs && fromPairs.tip) return loc(fromPairs.tip);
  return ASPECT_TIPS[impInf] ? loc(ASPECT_TIPS[impInf]) : '';
}

function renderAnswerTable(verb, tense, highlightPronoun) {
  if (!verb || !verb[tense]) return '';
  const note = aspectNote(verb, tense) || pairTip(verb);
  let html = `<div class="vd-full-table">`;
  html += `<div class="vd-full-table-header">${escHtml(verb.infinitive)} — ${escHtml(loc(getTenseLabel(tense)))}</div>`;
  if (note) html += `<div class="vd-full-note">${escHtml(note)}</div>`;
  for (const [pronoun, form] of Object.entries(verb[tense])) {
    const gloss = englishGloss(verb, tense, pronoun);
    html += `<div class="vd-full-row ${pronoun === highlightPronoun ? 'vd-highlight-row' : ''}">`
      + `<span class="vd-full-pronoun">${escHtml(pronoun)}</span>`
      + `<span class="vd-full-form">${escHtml(form)}</span>`
      + (gloss ? `<span class="vd-full-gloss">${escHtml(gloss)}</span>` : '')
      + `</div>`;
  }
  return html + `</div>`;
}

/**
 * @param {boolean} showNotes  usage lines are for the study view; the reference
 *   view is a lookup table you page through, where prose only slows you down.
 */
function renderTable(verb, label, showNotes) {
  if (!verb) return '';
  const nl = state.nativeLanguage === 'nl';
  const tenses = [
    { key: 'present', name: nl ? 'Tegenwoordige tijd' : 'Present' },
    { key: 'past', name: nl ? 'Verleden tijd' : 'Past' },
    { key: 'future', name: nl ? 'Toekomst' : 'Future' },
    { key: 'imperative', name: nl ? 'Gebiedende wijs' : 'Imperative' },
  ];
  let html = `<div class="vd-table-header">${label}: <strong>${escHtml(verb.infinitive)}</strong></div>`;
  for (const t of tenses) {
    if (!verb[t.key]) continue;
    // One usage line per tense: a single per-row gloss cannot carry the fact that
    // an imperfective past spans progressive, habitual and plain factual readings.
    const note = showNotes ? aspectNote(verb, t.key) : '';
    html += `<div class="vd-tense-label">${t.name}</div>`
      + (note ? `<div class="vd-tense-note">${escHtml(note)}</div>` : '')
      + `<div class="vd-conj-table">`;
    for (const [pronoun, form] of Object.entries(verb[t.key])) {
      // The gloss wraps onto its own line: the two aspect tables sit side by side,
      // so there is no room for a third inline column.
      const gloss = englishGloss(verb, t.key, pronoun);
      html += `<div class="vd-conj-row">`
        + `<span class="vd-pronoun">${escHtml(pronoun)}</span>`
        + `<span class="vd-form">${escHtml(form)}</span>`
        + (gloss ? `<span class="vd-conj-gloss">${escHtml(gloss)}</span>` : '')
        + `</div>`;
    }
    html += '</div>';
  }
  return html;
}

function showReference(index) {
  vd.mode = 'reference';
  vd.refIdx = index;
  const verbs = getVerbsForLevel(vd.level);
  const pairIdx = index;
  const imp = verbs[pairIdx * 2];
  const perf = verbs[pairIdx * 2 + 1];
  if (!imp || !perf) return showMenu();

  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const totalPairs = Math.floor(verbs.length / 2);

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vdRefBack">←</button>
      <div>
        <div class="lesson-title">${escHtml(imp.infinitive)} / ${escHtml(perf.infinitive)}</div>
        <div class="lesson-subtitle">${escHtml(loc(imp.meaning))} — ${pairIdx + 1}/${totalPairs}</div>
      </div>
    </div>

    <div class="vd-ref-tables">
      <div class="vd-ref-col vd-imp-col">${renderTable(imp, nl ? 'Onvoltooid' : 'Imperfective', false)}</div>
      <div class="vd-ref-col vd-perf-col">${renderTable(perf, nl ? 'Voltooid' : 'Perfective', false)}</div>
    </div>

    <div class="vd-ref-nav">
      <button class="vd-nav-btn" id="vdPrev" ${pairIdx === 0 ? 'disabled' : ''}>← ${nl ? 'Vorige' : 'Previous'}</button>
      <button class="vd-nav-btn" id="vdNext" ${pairIdx >= totalPairs - 1 ? 'disabled' : ''}>${nl ? 'Volgende' : 'Next'} →</button>
    </div>`;

  s.querySelector('#vdRefBack').addEventListener('click', showMenu);
  if (pairIdx > 0) s.querySelector('#vdPrev').addEventListener('click', () => showReference(pairIdx - 1));
  if (pairIdx < totalPairs - 1) s.querySelector('#vdNext').addEventListener('click', () => showReference(pairIdx + 1));
}

// ── Drill session ────────────────────────────────────────────────────────────

function startDrill() {
  vd.mode = 'drill';
  // My list ignores the level filter — a class list often spans levels — and opens up all tenses.
  const useSel = selectionActive();
  const allowedTenses = useSel ? ALL_TENSES : getAllowedTenses(vd.level);
  const levelVerbs = useSel ? getSelectedVerbs() : getVerbsForLevel(vd.level);
  const levelInfinitives = new Set(levelVerbs.map(v => v.infinitive));

  let questions;

  if (vd.focusWeak && hasWeaknessData()) {
    // Build weakness-focused drill: 50% weak items, 50% random
    const weakItems = getWeakItems(Math.ceil(vd.total / 2));
    const weakQs = [];
    for (const w of weakItems) {
      if (!levelInfinitives.has(w.infinitive)) continue;
      if (!allowedTenses.includes(w.tense)) continue;
      const verb = findVerb(w.infinitive);
      if (!verb || !verb[w.tense] || !verb[w.tense][w.pronoun]) continue;
      weakQs.push({
        infinitive: verb.infinitive,
        aspect: verb.aspect,
        partner: verb.partner,
        meaning: verb.meaning,
        tense: w.tense,
        tenseLabel: getTenseLabel(w.tense),
        pronoun: w.pronoun,
        correctForm: verb[w.tense][w.pronoun],
      });
    }
    // Fill remaining with random
    let allQs = buildDrillSet(9999);
    allQs = allQs.filter(q => levelInfinitives.has(q.infinitive) && allowedTenses.includes(q.tense));
    const remaining = allQs.filter(q => !weakQs.find(w => w.infinitive === q.infinitive && w.tense === q.tense && w.pronoun === q.pronoun));
    const randomFill = remaining.slice(0, vd.total - weakQs.length);
    questions = shuffle([...weakQs, ...randomFill]);
  } else {
    questions = buildDrillSet(9999);
    questions = questions.filter(q => levelInfinitives.has(q.infinitive));
    if (vd.filter !== 'all') {
      questions = questions.filter(q => q.aspect === vd.filter);
    }
    if (vd.tenseFilter !== 'all') {
      questions = questions.filter(q => q.tense === vd.tenseFilter);
    } else {
      questions = questions.filter(q => allowedTenses.includes(q.tense));
    }
  }

  // Also mix in sentence exercises if available
  const sentenceQs = buildSentenceQuestions(levelVerbs, allowedTenses, Math.ceil(vd.total / 4));

  if (questions.length === 0 && sentenceQs.length === 0) {
    showEmptyState();
    return;
  }

  // Mix: take conjugation questions and intersperse sentence questions
  let drillQs = questions.slice(0, vd.total - sentenceQs.length);
  const mixed = [];
  let sIdx = 0;
  for (let i = 0; i < drillQs.length; i++) {
    mixed.push(drillQs[i]);
    if ((i + 1) % 3 === 0 && sIdx < sentenceQs.length) {
      mixed.push(sentenceQs[sIdx++]);
    }
  }
  while (sIdx < sentenceQs.length) mixed.push(sentenceQs[sIdx++]);

  const picked = mixed.slice(0, vd.total);
  if (picked.length === 0) { showEmptyState(); return; }
  // The free drill only moves the schedule of tenses already learned with Learn One.
  const units = makeUnits({ onlySeen: true });
  runSession({
    screen: getScreen(), icon: COURSE.icon, title: L('Verb Drill', 'Werkwoord Drill'), accent: ACCENT,
    cards: picked.map(q => formCard(q, { dictation: vd.dictation, units })),
    onExit: showMenu,
    again: () => ({ label: '🔄 ' + L('Try again (new questions)', 'Opnieuw (nieuwe vragen)'), run: startDrill }),
  });
}

function getTenseLabel(tense) {
  const nl = state.nativeLanguage === 'nl';
  return {
    present:    { en: 'Present', nl: 'Tegenwoordige tijd' },
    past:       { en: 'Past', nl: 'Verleden tijd' },
    future:     { en: 'Future', nl: 'Toekomst' },
    imperative: { en: 'Imperative', nl: 'Gebiedende wijs' },
  }[tense] || { en: tense, nl: tense };
}

function showEmptyState() {
  const nl = state.nativeLanguage === 'nl';
  const s = getScreen();
  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vdNoBack">←</button>
      <div>
        <div class="lesson-title">✍️ ${nl ? 'Werkwoord Drill' : 'Verb Drill'}</div>
        <div class="lesson-subtitle">${nl ? 'Geen vragen gevonden' : 'No questions found'}</div>
      </div>
    </div>
    <div class="vd-empty">
      <div class="vd-empty-icon">🤔</div>
      <div class="vd-empty-text">${nl
        ? 'Geen vragen voor deze combinatie. Kies een andere combinatie.'
        : 'No questions for this combination. Choose a different one.'}</div>
      <button class="vd-nav-btn" id="vdEmptyBack">← ${nl ? 'Terug' : 'Back'}</button>
    </div>`;
  s.querySelector('#vdNoBack').addEventListener('click', showMenu);
  s.querySelector('#vdEmptyBack').addEventListener('click', showMenu);
}

// ── Sentence questions ───────────────────────────────────────────────────────

function buildSentenceQuestions(verbs, allowedTenses, count) {
  const all = [];
  for (const v of verbs) {
    if (!v.sentences) continue;
    for (const sent of v.sentences) {
      if (!allowedTenses.includes(sent.tense)) continue;
      all.push({
        type: 'sentence',
        infinitive: v.infinitive,
        aspect: v.aspect,
        partner: v.partner,
        meaning: v.meaning,
        tense: sent.tense,
        tenseLabel: getTenseLabel(sent.tense),
        pronoun: sent.pronoun,
        correctForm: sent.answer,
        sentence: sent.uk,
        fullSentence: sent.full,
        translation: loc(sent),
      });
    }
  }
  return shuffle(all).slice(0, count);
}

// ── Learn one verb: Verb picker ──────────────────────────────────────────────

function showVerbPicker() {
  vd.mode = 'learnPicker';
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const mastery = getAllMastery();

  const allVerbs = getVerbsForLevel('B1'); // show all verbs in picker regardless of level filter
  const groups = { A1: [], A2: [], B1: [] };
  for (let i = 0; i < allVerbs.length; i += 2) {
    const imp = allVerbs[i];
    const perf = allVerbs[i + 1];
    if (!imp || !perf) continue;
    const level = imp.level || 'A1';
    if (!groups[level]) groups[level] = [];
    groups[level].push({ imp, perf, idx: i / 2 });
  }

  let listHtml = '';
  for (const [level, pairs] of Object.entries(groups)) {
    if (pairs.length === 0) continue;
    listHtml += `<div class="vd-level-group">
      <div class="vd-level-group-title">${level} — ${pairs.length} ${nl ? 'paren' : 'pairs'}</div>`;
    for (const p of pairs) {
      const color = getMasteryColor(p.imp.infinitive, p.perf.infinitive);
      listHtml += `
        <div class="vd-verb-row" data-pair="${p.imp.infinitive}|${p.perf.infinitive}">
          <div class="vd-verb-pair-text">
            <div class="vd-verb-pair-inf">${escHtml(p.imp.infinitive)} / ${escHtml(p.perf.infinitive)}</div>
            <div class="vd-verb-pair-meaning">${escHtml(loc(p.imp.meaning))}</div>
          </div>
          <div class="vd-mastery-dot ${color}"></div>
        </div>`;
    }
    listHtml += '</div>';
  }

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vdPickerBack">←</button>
      <div>
        <div class="lesson-title">🎓 ${nl ? 'Kies een werkwoord' : 'Choose a Verb'}</div>
        <div class="lesson-subtitle">${nl ? 'Leer alle vormen van één werkwoord' : 'Learn all forms of one verb'}</div>
      </div>
    </div>

    <input type="text" class="vd-search-input" id="vdSearch"
      placeholder="${nl ? 'Zoek werkwoord...' : 'Search verb...'}"
      autocomplete="off" />

    <div id="vdVerbList">${listHtml}</div>`;

  s.querySelector('#vdPickerBack').addEventListener('click', showMenu);

  // Search filter
  const search = s.querySelector('#vdSearch');
  search.addEventListener('input', () => {
    const q = search.value.toLowerCase().trim();
    s.querySelectorAll('.vd-verb-row').forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = q && !text.includes(q) ? 'none' : '';
    });
  });

  // Click verb to learn
  s.querySelectorAll('.vd-verb-row').forEach(row => {
    row.addEventListener('click', () => {
      const [impInf, perfInf] = row.dataset.pair.split('|');
      const impVerb = findVerb(impInf);
      const perfVerb = findVerb(perfInf);
      if (impVerb && perfVerb) {
        showLearnVerb(impVerb, perfVerb);
      }
    });
  });
}

// ── My list: multi-select picker ──────────────────────────────────────────────

function showSelectionPicker() {
  vd.mode = 'selectPicker';
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';

  const allVerbs = getVerbsForLevel('B1'); // My list may span every level
  const groups = {};
  for (let i = 0; i < allVerbs.length; i += 2) {
    const imp = allVerbs[i];
    const perf = allVerbs[i + 1];
    if (!imp || !perf) continue;
    const level = imp.level || 'A1';
    (groups[level] = groups[level] || []).push({ imp, perf });
  }

  let listHtml = '';
  for (const [level, pairs] of Object.entries(groups)) {
    if (pairs.length === 0) continue;
    listHtml += `<div class="vd-level-group">
      <div class="vd-level-group-title">${level} — ${pairs.length} ${nl ? 'paren' : 'pairs'}</div>`;
    for (const p of pairs) {
      const on = vd.selection.has(p.imp.infinitive);
      const color = getMasteryColor(p.imp.infinitive, p.perf.infinitive);
      listHtml += `
        <div class="vd-verb-row vd-pick-row ${on ? 'picked' : ''}" data-inf="${escHtml(p.imp.infinitive)}">
          <span class="vd-pick-box">${on ? '✓' : ''}</span>
          <div class="vd-verb-pair-text">
            <div class="vd-verb-pair-inf">${escHtml(p.imp.infinitive)} / ${escHtml(p.perf.infinitive)}</div>
            <div class="vd-verb-pair-meaning">${escHtml(loc(p.imp.meaning))}</div>
          </div>
          <div class="vd-mastery-dot ${color}"></div>
        </div>`;
    }
    listHtml += '</div>';
  }

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vdPickBack">←</button>
      <div>
        <div class="lesson-title">📝 ${nl ? 'Mijn lijst' : 'My List'}</div>
        <div class="lesson-subtitle">${nl
          ? 'Tik werkwoorden aan en oefen alleen die'
          : 'Tap verbs to practise just those'}</div>
      </div>
    </div>

    <input type="text" class="vd-search-input" id="vdPickSearch"
      placeholder="${nl ? 'Zoek werkwoord...' : 'Search verb...'}" autocomplete="off" />

    <div class="vd-pick-list">${listHtml}</div>

    <div class="vd-pick-bar">
      <span class="vd-pick-count" id="vdPickCount"></span>
      <button class="vd-pick-clear" id="vdPickClear">${nl ? 'Wissen' : 'Clear'}</button>
      <button class="vd-pick-start" id="vdPickStart"></button>
    </div>`;

  const countEl = s.querySelector('#vdPickCount');
  const startBtn = s.querySelector('#vdPickStart');

  const refreshBar = () => {
    const n = vd.selection.size;
    countEl.textContent = nl ? `${n} gekozen` : `${n} selected`;
    startBtn.disabled = n === 0;
    startBtn.textContent = n === 0
      ? `✍️ ${nl ? 'Oefen' : 'Practise'}`
      : `✍️ ${nl ? `Oefen ${n}` : `Practise ${n}`}`;
  };
  refreshBar();

  s.querySelector('#vdPickBack').addEventListener('click', showMenu);

  // Toggle a pair in/out of the list, updating in place to keep scroll and search intact
  s.querySelectorAll('.vd-pick-row').forEach(row => {
    row.addEventListener('click', () => {
      const inf = row.dataset.inf;
      if (vd.selection.has(inf)) vd.selection.delete(inf);
      else vd.selection.add(inf);
      const on = vd.selection.has(inf);
      row.classList.toggle('picked', on);
      row.querySelector('.vd-pick-box').textContent = on ? '✓' : '';
      saveSelection();
      refreshBar();
    });
  });

  const search = s.querySelector('#vdPickSearch');
  search.addEventListener('input', () => {
    const q = search.value.toLowerCase().trim();
    s.querySelectorAll('.vd-pick-row').forEach(row => {
      row.style.display = q && !row.textContent.toLowerCase().includes(q) ? 'none' : '';
    });
  });

  s.querySelector('#vdPickClear').addEventListener('click', () => {
    vd.selection.clear();
    saveSelection();
    showSelectionPicker();
  });

  startBtn.addEventListener('click', () => {
    if (vd.selection.size === 0) return;
    vd.useSelection = true;
    localStorage.setItem('verbDrillUseSelection', '1');
    startDrill();
  });
}

// ── Learn one verb: Study + Practice + Sentences ─────────────────────────────

function showLearnVerb(imp, perf) {
  vd.mode = 'learnVerb';
  renderLearnStudy(imp, perf);
}

/**
 * Example sentences for both aspects, with the drilled form highlighted in place
 * of the blank. The data already carries these; they were only ever shown inside
 * a drill, so the study view never let you see the forms in context.
 */
function renderExamples(imp, perf) {
  const nl = state.nativeLanguage === 'nl';
  const groups = [imp, perf].filter(v => v && v.sentences && v.sentences.length);
  if (!groups.length) return '';

  let html = `<div class="vd-examples">
    <div class="vd-examples-title">${nl ? 'In zinnen' : 'In sentences'}</div>`;

  for (const verb of groups) {
    const tag = verb.aspect === 'imperfective'
      ? `<span class="vd-aspect-tag vd-imp">IMP</span>`
      : `<span class="vd-aspect-tag vd-perf">PERF</span>`;
    html += `<div class="vd-example-group">
      <div class="vd-example-verb">${tag} ${escHtml(verb.infinitive)}</div>`;
    for (const sent of verb.sentences) {
      const filled = escHtml(sent.uk)
        .replace('___', `<strong class="vd-example-form">${escHtml(sent.answer)}</strong>`);
      html += `<div class="vd-example">
        <div class="vd-example-uk">${filled}</div>
        <div class="vd-example-en">${escHtml(sent.en)}</div>
      </div>`;
    }
    html += `</div>`;
  }
  return html + `</div>`;
}

function renderLearnStudy(imp, perf) {
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';

  // Find aspect tip from verb-aspects data if available
  const tip = pairTip(imp);

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vdLearnBack">←</button>
      <div>
        <div class="lesson-title">🎓 ${escHtml(imp.infinitive)} / ${escHtml(perf.infinitive)}</div>
        <div class="lesson-subtitle">${escHtml(loc(imp.meaning))}</div>
      </div>
    </div>

    <div class="vd-learn-verb-header">
      <div class="vd-learn-verb-pair">${escHtml(imp.infinitive)} / ${escHtml(perf.infinitive)}</div>
      <div class="vd-learn-verb-meaning">${escHtml(loc(imp.meaning))}</div>
    </div>

    ${tip ? `<div class="vd-learn-tip">💡 ${escHtml(tip)}</div>` : ''}

    <div class="vd-ref-tables">
      <div class="vd-ref-col vd-imp-col">${renderTable(imp, nl ? 'Onvoltooid' : 'Imperfective', true)}</div>
      <div class="vd-ref-col vd-perf-col">${renderTable(perf, nl ? 'Voltooid' : 'Perfective', true)}</div>
    </div>

    ${renderExamples(imp, perf)}

    <div class="vd-learn-actions">
      <button id="vdLearnBackBtn">← ${nl ? 'Terug' : 'Back'}</button>
      <button class="vd-learn-primary" id="vdLearnStart">${nl ? 'Test me ✍️' : 'Test me ✍️'}</button>
    </div>`;

  s.querySelector('#vdLearnBack').addEventListener('click', showVerbPicker);
  s.querySelector('#vdLearnBackBtn').addEventListener('click', showVerbPicker);
  s.querySelector('#vdLearnStart').addEventListener('click', () => startLearnPractice(imp, perf));
}

// Test every form of both verbs in table order, then up to five sentences, then
// (for the pairs that have them) which aspect a sentence needs. This is the
// "learn" step of the verbs course: it is what puts a tense on the review schedule.
function startLearnPractice(imp, perf) {
  const units = makeUnits();
  const cards = [];
  for (const verb of [imp, perf]) {
    for (const tense of TENSES) {
      if (!verb[tense]) continue;
      Object.entries(verb[tense]).forEach(([pronoun, form], i) => {
        const q = formQuestion(verb, tense, pronoun, form);
        const divider = i === 0 ? `<div class="vd-tense-divider">${aspectTag(verb.aspect)} ${escHtml(verb.infinitive)} — ${escHtml(loc(q.tenseLabel))}</div>` : '';
        cards.push(formCard(q, { units, divider }));
      });
    }
  }
  cards.push(...buildSentenceQuestions([imp, perf], TENSES, 5).map(q => formCard(q)));
  cards.push(...aspectCards(imp, units, 4));

  runSession({
    screen: getScreen(), icon: '🎓', title: `${imp.infinitive} / ${perf.infinitive}`, accent: ACCENT, cards,
    onExit: showVerbPicker,
    scoreSubtitle: () => { const st = verbStats(); return `${st.learned} ${L('tenses learned', 'tijden geleerd')} · ${st.due} ${L('due', 'aan de beurt')}`; },
    again: () => ({ label: '🔄 ' + L('Try again', 'Opnieuw'), run: () => showLearnVerb(imp, perf) }),
  });
}

// ── Cards ────────────────────────────────────────────────────────────────────
// What the course engine needs to ask one verb form, one gapped sentence or one
// aspect choice. The Review queue uses the same cards between those of other courses.

const aspectTag = aspect => (aspect === 'imperfective'
  ? '<span class="vd-aspect-tag vd-imp">IMP</span>'
  : '<span class="vd-aspect-tag vd-perf">PERF</span>');

function formQuestion(verb, tense, pronoun, form) {
  return { infinitive: verb.infinitive, aspect: verb.aspect, partner: verb.partner, meaning: verb.meaning,
           tense, tenseLabel: getTenseLabel(tense), pronoun, correctForm: form };
}

// A unit ("робити · present", or a pair's aspect) moves on the schedule once per
// session, when the last of its cards is answered, by how many were right. Asking
// six forms of one tense must not count as six successful reviews.
function makeUnits({ onlySeen = false } = {}) {
  const tally = new Map();
  return {
    expect(key) { const t = tally.get(key) || { total: 0, n: 0, ok: 0 }; t.total++; tally.set(key, t); },
    answer(key, res) {
      const t = tally.get(key);
      if (!t) return;
      t.n++; if (res.isCorrect) t.ok++;
      if (t.n < t.total) return;
      if (onlySeen && !verbProgress.get(key)) return;
      const share = t.ok / t.total;
      verbProgress.record(key, t.total === 1 ? res.quality : share === 1 ? 5 : share >= 0.8 ? 3 : 1);
    },
  };
}

// q: a conjugation question, or with type 'sentence' the same form inside a sentence.
function formCard(q, { dictation = false, divider = '', units = null } = {}) {
  const isSentence = q.type === 'sentence';
  const unit = tenseKey(q.infinitive, q.tense);
  if (units && !isSentence) units.expect(unit);
  const spoken = isSentence && q.fullSentence ? q.fullSentence
    : q.tense === 'imperative' ? q.correctForm : `${q.pronoun} ${q.correctForm}`;
  const heard = dictation && !isSentence;

  const promptHtml = isSentence ? `
    <div class="vd-sentence-card">
      <div class="vd-sentence-translation">${escHtml(q.translation)}</div>
      <div class="vd-sentence-text">${escHtml(q.sentence).replace('___', '<span class="vd-sentence-blank"></span>')}</div>
      <div class="vd-sentence-hint">${aspectTag(q.aspect)} ${escHtml(q.infinitive)} — ${escHtml(loc(q.tenseLabel))} — ${escHtml(q.pronoun)}</div>
    </div>` : `
    ${divider}
    <div class="vd-q-card">
      <div class="vd-q-verb-row">
        ${aspectTag(q.aspect)}
        <span class="vd-q-infinitive">${escHtml(q.infinitive)}</span>
        <span class="vd-q-meaning">${escHtml(loc(q.meaning))}</span>
      </div>
      <div class="vd-q-partner">${L('Pair', 'Paar')}: ${escHtml(q.partner)}</div>
      <div class="vd-q-prompt">
        <span class="vd-q-pronoun">${escHtml(q.pronoun)}</span>
        <span class="vd-q-tense">${escHtml(loc(q.tenseLabel))}</span>
        ${heard ? `<button class="vd-dict-play" type="button" data-say="${escHtml(spoken)}" title="${L('Play again', 'Nog eens')}">🔊</button>` : ''}
      </div>
    </div>`;

  return {
    key: `${unit}|${q.pronoun}`, course: COURSE, intro: false,
    promptHtml, autoSay: heard ? spoken : null,
    input: { type: 'text', lang: 'uk', placeholder: L('Type the verb form…', 'Typ de werkwoordsvorm…') },
    // One slip passes only on forms of five letters and up: їм / їж is a real mistake.
    check(answer) { const g = grade(answer, [q.correctForm], { minTypoLen: 5 }); return { ...g, quality: g.isExact ? 5 : g.isClose ? 3 : 1 }; },
    record(res) { recordAnswer(q.infinitive, q.tense, q.pronoun, res.isCorrect); if (!isSentence) units?.answer(unit, res); },
    compareOnClose: true,
    correctText: q.correctForm,
    detailHtml: (isSentence && q.fullSentence ? `<div class="vd-context">${escHtml(q.fullSentence)}</div>` : '')
      + renderAnswerTable(findVerb(q.infinitive), q.tense, q.pronoun),
    say: spoken,
    missed: { left: q.infinitive, right: q.correctForm,
              extra: `${q.tense === 'imperative' ? '' : q.pronoun + ' · '}${loc(q.tenseLabel)}`, say: spoken },
  };
}

// "Imperfective or perfective?" on a pair's own sentences: half as a choice, half
// typed into the gap. 20 of the pairs have such sentences (data/verb-aspects.js).
function aspectCards(imp, units, count) {
  const pair = VERB_PAIRS.find(p => p.imperfective === imp.infinitive);
  if (!pair) return [];
  return shuffle(pair.sentences).slice(0, count).map((sent, i) => aspectCard(pair, sent, { typed: i % 2 === 1, units }));
}

function aspectCard(pair, sent, { typed = false, units = null } = {}) {
  const unit = aspectKey(pair.id);
  units?.expect(unit);
  const label = aspect => `${aspect === 'imperfective' ? pair.imperfective : pair.perfective} (${aspect === 'imperfective' ? L('imperfective', 'onvoltooid') : L('perfective', 'voltooid')})`;
  const card = {
    key: `${unit}|${sent.uk}`, course: COURSE, intro: false,
    promptHtml: `
      <div class="va-verb-hint">
        <span class="va-hint-imp">${escHtml(pair.imperfective)}</span><span class="va-hint-sep">/</span><span class="va-hint-perf">${escHtml(pair.perfective)}</span>
        <span class="va-hint-meaning">${escHtml(loc(pair.meaning))}</span>
      </div>
      <div class="va-q-card">
        <div class="va-q-translation">${escHtml(loc(sent))}</div>
        <div class="va-q-sentence">${escHtml(sent.uk.replace(sent.verb, '______'))}</div>
      </div>`,
    record: res => units?.answer(unit, res),
    correctText: sent.verb,
    detailHtml: `<div class="vd-context">${escHtml(sent.uk)}</div>${sent.why ? `<div class="vd-full-note vd-aspect-why">💡 ${escHtml(loc(sent.why))}</div>` : ''}`,
    say: sent.uk,
    missed: { left: loc(sent), right: sent.uk, extra: label(sent.aspect) },
  };
  if (!typed) {
    return { ...card, input: { type: 'choice', options: shuffle(['imperfective', 'perfective']).map(a => ({ label: label(a), correct: a === sent.aspect })) } };
  }
  return { ...card,
    input: { type: 'text', lang: 'uk', placeholder: L('Type the verb…', 'Typ het werkwoord…') },
    check(answer) { const g = grade(answer, [sent.verb], { minTypoLen: 5 }); return { ...g, quality: g.isExact ? 5 : g.isClose ? 3 : 1 }; },
    compareOnClose: true };
}

// For the Review queue: every due unit as one card: a random form of the tense,
// or a random sentence of the pair.
export function verbDueCards() {
  const units = makeUnits();
  return verbProgress.dueKeys().map(key => {
    if (key.startsWith('aspect:')) {
      const pair = VERB_PAIRS.find(p => aspectKey(p.id) === key);
      return aspectCard(pair, shuffle(pair.sentences)[0], { typed: Math.random() < 0.5, units });
    }
    const [infinitive, tense] = key.slice('verb:'.length).split('|');
    const verb = findVerb(infinitive);
    const [pronoun, form] = shuffle(Object.entries(verb[tense]))[0];
    return formCard(formQuestion(verb, tense, pronoun, form), { units });
  });
}

// Due verb units only, from the verb menu or the review hub.
export function startVerbReview(onExit = showMenu) {
  window.showScreen('verbDrillScreen');
  runSession({
    screen: getScreen(), icon: COURSE.icon, title: `${COURSE.name} · ${L('review', 'herhalen')}`, accent: ACCENT,
    cards: shuffle(verbDueCards()).slice(0, 30),
    onExit,
    again: () => (verbStats().due ? { label: '🔄 ' + L('More reviews', 'Verder herhalen'), run: () => startVerbReview(onExit) } : null),
  });
}
