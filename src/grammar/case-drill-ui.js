import { state } from '../state.js';
import { escHtml } from '../utils.js';
import { CASES, CASE_LABELS, NOUNS, CASE_SENTENCES, ADJECTIVE_NOUNS, buildCaseDrillSet, findNoun } from '../data/case-declensions.js';
import { PERSONAL, POSSESSIVE, PRON_CASES, GENDER_LABELS, INDECLINABLE_NOTE } from '../data/pronouns-uk.js';
import { recordAnswer, getNounMastery, getAllMastery, getWeakItems, hasWeaknessData, getWeakNounCount } from '../data/case-weakness.js';
import { L, loc, shuffle, grade } from './drill-core.js';
import { runSession } from './course-engine.js';
import { caseProgress, caseStats, nounKey, NUMBERS } from '../data/case-progress.js';

// ── State ────────────────────────────────────────────────────────────────────

let cd = {
  total:     25,
  mode:      'menu',
  refIdx:    0,
  caseFilter:   'all',
  numberFilter: 'all',
  genderFilter: 'all',
  level:     localStorage.getItem('caseDrillLevel') || 'A1',
  focusWeak: false,
  adjMode:   false,   // drill adjective + noun pairs instead of bare nouns
  pronMode:  false,   // drill personal and possessive pronouns
  dictation: localStorage.getItem('caseDrillDictation') === '1', // hear the form, type it
};

const COURSE = { icon: '📌', get name() { return L('Cases', 'Naamvallen'); } };
const ACCENT = { main: '#059669', dark: '#065f46', soft: '#ecfdf5', border: '#a7f3d0' };

function getScreen() { return document.getElementById('caseDrillScreen'); }

function getNounsForLevel(level) {
  const levels = { A1: ['A1'], A2: ['A1', 'A2'], B1: ['A1', 'A2', 'B1'] };
  const allowed = levels[level] || levels.A1;
  return NOUNS.filter(n => allowed.includes(n.level || 'A1'));
}

function genderLabel(g) {
  return { m: 'MASC', f: 'FEM', n: 'NEUT' }[g] || g;
}
function genderClass(g) {
  return { m: 'cd-gender-m', f: 'cd-gender-f', n: 'cd-gender-n' }[g] || '';
}

function getMasteryColor(noun) {
  const m = getNounMastery(noun);
  if (m.attempts === 0) return 'gray';
  if (m.pct >= 80) return 'green';
  if (m.pct >= 50) return 'yellow';
  return 'red';
}

// ── Public entry ─────────────────────────────────────────────────────────────

export function openCaseDrillScreen() {
  window.showScreen('caseDrillScreen');
  showMenu();
}

// ── Menu ─────────────────────────────────────────────────────────────────────

function showMenu() {
  cd.mode = 'menu';
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const nouns = getNounsForLevel(cd.level);
  const formCount = nouns.length * 14; // 7 cases × 2 numbers
  const weakCount = getWeakNounCount();
  const hasWeak = hasWeaknessData();
  const st = caseStats();

  const caseBtns = CASES.map(c =>
    `<button class="cd-filter-btn ${cd.caseFilter === c ? 'active' : ''}" data-case="${c}">${escHtml(loc(CASE_LABELS[c]))}</button>`
  ).join('');

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="cdBack">←</button>
      <div>
        <div class="lesson-title">📌 ${nl ? 'Naamvallen Drill' : 'Case Drill'}</div>
        <div class="lesson-subtitle">${nl ? 'Oefen Oekraïense naamvallen' : 'Practice Ukrainian noun cases'}</div>
      </div>
    </div>

    <div class="cd-stats-bar">
      <span class="cd-stat">📊 ${nouns.length} ${nl ? 'woorden' : 'nouns'}</span>
      <span class="cd-stat">🎯 ${formCount} ${nl ? 'vormen' : 'forms'}</span>
      <span class="cd-stat">📚 ${st.learned} ${nl ? 'geleerd' : 'learned'}</span>
    </div>

    ${st.seen ? `
    <button class="cd-review-btn" id="cdReviewBtn" ${st.due ? '' : 'disabled'}>
      🔄 ${st.due ? (nl ? `Herhalen: ${st.due} aan de beurt` : `Review: ${st.due} due`) : (nl ? 'Niets aan de beurt' : 'Nothing due right now')}
      <span class="cd-review-sub">${nl ? 'Van de woorden die je met “Leer één” hebt geleerd' : 'From the nouns you learned with “Learn One”'}</span>
    </button>` : ''}

    <div class="cd-filter-section">
      <div class="cd-filter-label">${nl ? 'Niveau:' : 'Level:'}</div>
      <div class="cd-level-row">
        <button class="cd-level-btn ${cd.level === 'A1' ? 'active' : ''}" data-level="A1">A1</button>
        <button class="cd-level-btn ${cd.level === 'A2' ? 'active' : ''}" data-level="A2">A1 + A2</button>
        <button class="cd-level-btn ${cd.level === 'B1' ? 'active' : ''}" data-level="B1">A1 + A2 + B1</button>
      </div>

      <div class="cd-filter-label" style="margin-top:10px">${nl ? 'Naamval:' : 'Case:'}</div>
      <div class="cd-filter-row">
        <button class="cd-filter-btn ${cd.caseFilter === 'all' ? 'active' : ''}" data-case="all">${nl ? 'Alle' : 'All'}</button>
        ${caseBtns}
      </div>

      <div class="cd-filter-label" style="margin-top:10px">${nl ? 'Getal:' : 'Number:'}</div>
      <div class="cd-filter-row">
        <button class="cd-filter-btn ${cd.numberFilter === 'all' ? 'active' : ''}" data-num="all">${nl ? 'Alle' : 'All'}</button>
        <button class="cd-filter-btn ${cd.numberFilter === 'singular' ? 'active' : ''}" data-num="singular">${nl ? 'Enkelvoud' : 'Singular'}</button>
        <button class="cd-filter-btn ${cd.numberFilter === 'plural' ? 'active' : ''}" data-num="plural">${nl ? 'Meervoud' : 'Plural'}</button>
      </div>

      <div class="cd-filter-label" style="margin-top:10px">${nl ? 'Geslacht:' : 'Gender:'}</div>
      <div class="cd-filter-row">
        <button class="cd-filter-btn ${cd.genderFilter === 'all' ? 'active' : ''}" data-gen="all">${nl ? 'Alle' : 'All'}</button>
        <button class="cd-filter-btn ${cd.genderFilter === 'm' ? 'active' : ''}" data-gen="m">${nl ? 'Mann.' : 'Masc'}</button>
        <button class="cd-filter-btn ${cd.genderFilter === 'f' ? 'active' : ''}" data-gen="f">${nl ? 'Vr.' : 'Fem'}</button>
        <button class="cd-filter-btn ${cd.genderFilter === 'n' ? 'active' : ''}" data-gen="n">${nl ? 'Onz.' : 'Neut'}</button>
      </div>

      <div class="cd-weak-toggle cd-adj-toggle ${cd.dictation ? 'active' : ''}" id="cdDictToggle">
        <span class="cd-weak-check">${cd.dictation ? '✓' : ''}</span>
        <span>👂 ${nl ? 'Dictee: hoor de vorm, typ wat je hoort' : 'Dictation: hear the form, type what you hear'}</span>
      </div>
      <div class="cd-filter-label" style="margin-top:12px">${nl ? 'Wat:' : 'What:'}</div>
      <div class="cd-weak-toggle cd-adj-toggle ${!cd.adjMode && !cd.pronMode ? 'active' : ''}" id="cdNounToggle">
        <span class="cd-weak-check">${!cd.adjMode && !cd.pronMode ? '✓' : ''}</span>
        <span>📌 ${nl ? `Zelfstandige naamwoorden (${nouns.length})` : `Nouns (${nouns.length})`}</span>
      </div>
      <div class="cd-weak-toggle cd-adj-toggle ${cd.adjMode ? 'active' : ''}" id="cdAdjToggle">
        <span class="cd-weak-check">${cd.adjMode ? '✓' : ''}</span>
        <span>📐 ${nl ? `Bijvoeglijk naamwoord + zelfstandig naamwoord (${ADJECTIVE_NOUNS.length} paren)` : `Adjective + noun agreement (${ADJECTIVE_NOUNS.length} pairs)`}</span>
      </div>
      <div class="cd-weak-toggle cd-adj-toggle ${cd.pronMode ? 'active' : ''}" id="cdPronToggle">
        <span class="cd-weak-check">${cd.pronMode ? '✓' : ''}</span>
        <span>👤 ${nl ? `Voornaamwoorden: я, ти, він… + мій, наш… (${PERSONAL.length + POSSESSIVE.length})` : `Pronouns: я, ти, він… + мій, наш… (${PERSONAL.length + POSSESSIVE.length})`}</span>
      </div>
      ${hasWeak ? `<div class="cd-weak-toggle ${cd.focusWeak ? 'active' : ''}" id="cdWeakToggle">
        <span class="cd-weak-check">${cd.focusWeak ? '✓' : ''}</span>
        <span>🎯 ${nl ? 'Focus op zwakke woorden' : 'Focus on weak nouns'} (${weakCount})</span>
      </div>` : ''}
    </div>

    <div class="cd-menu-grid">
      <button class="cd-menu-card" id="cdRefBtn">
        <span class="cd-menu-icon">📖</span>
        <span class="cd-menu-title">${nl ? 'Tabellen' : 'Tables'}</span>
        <span class="cd-menu-sub">${nl ? 'Verbuigingen' : 'Declensions'}</span>
      </button>
      <button class="cd-menu-card" id="cdLearnBtn">
        <span class="cd-menu-icon">🎓</span>
        <span class="cd-menu-title">${nl ? 'Leer één' : 'Learn One'}</span>
        <span class="cd-menu-sub">${nl ? 'Eén woord' : 'One noun'}</span>
      </button>
      <button class="cd-menu-card cd-menu-primary" id="cdStartBtn">
        <span class="cd-menu-icon">✍️</span>
        <span class="cd-menu-title">${nl ? 'Drill' : 'Drill'}</span>
        <span class="cd-menu-sub">25 ${nl ? 'vragen' : 'questions'}</span>
      </button>
    </div>`;

  s.querySelector('#cdBack').addEventListener('click', () => window.openExercisesScreen());
  s.querySelector('#cdRefBtn').addEventListener('click', () => showReference(0));
  s.querySelector('#cdLearnBtn').addEventListener('click', showNounPicker);
  s.querySelector('#cdStartBtn').addEventListener('click', startDrill);
  s.querySelector('#cdReviewBtn')?.addEventListener('click', () => startCaseReview(showMenu));

  // Level
  s.querySelectorAll('[data-level]').forEach(btn => {
    btn.addEventListener('click', () => { cd.level = btn.dataset.level; localStorage.setItem('caseDrillLevel', cd.level); showMenu(); });
  });
  // Case filter
  s.querySelectorAll('[data-case]').forEach(btn => {
    btn.addEventListener('click', () => { cd.caseFilter = btn.dataset.case; s.querySelectorAll('[data-case]').forEach(b => b.classList.toggle('active', b.dataset.case === cd.caseFilter)); });
  });
  // Number filter
  s.querySelectorAll('[data-num]').forEach(btn => {
    btn.addEventListener('click', () => { cd.numberFilter = btn.dataset.num; s.querySelectorAll('[data-num]').forEach(b => b.classList.toggle('active', b.dataset.num === cd.numberFilter)); });
  });
  // Gender filter
  s.querySelectorAll('[data-gen]').forEach(btn => {
    btn.addEventListener('click', () => { cd.genderFilter = btn.dataset.gen; s.querySelectorAll('[data-gen]').forEach(b => b.classList.toggle('active', b.dataset.gen === cd.genderFilter)); });
  });
  // Dictation toggle
  const dt = s.querySelector('#cdDictToggle');
  dt.addEventListener('click', () => { cd.dictation = !cd.dictation; localStorage.setItem('caseDrillDictation', cd.dictation ? '1' : '0'); dt.classList.toggle('active', cd.dictation); dt.querySelector('.cd-weak-check').textContent = cd.dictation ? '✓' : ''; });
  // What to drill: nouns / adjective+noun / pronouns (one at a time)
  const setWhat = what => { cd.adjMode = what === 'adj'; cd.pronMode = what === 'pron'; showMenu(); };
  s.querySelector('#cdNounToggle').addEventListener('click', () => setWhat('noun'));
  s.querySelector('#cdAdjToggle').addEventListener('click', () => setWhat('adj'));
  s.querySelector('#cdPronToggle').addEventListener('click', () => setWhat('pron'));
  // Weak toggle
  const wt = s.querySelector('#cdWeakToggle');
  if (wt) wt.addEventListener('click', () => { cd.focusWeak = !cd.focusWeak; wt.classList.toggle('active', cd.focusWeak); wt.querySelector('.cd-weak-check').textContent = cd.focusWeak ? '✓' : ''; });
}

// ── Reference ────────────────────────────────────────────────────────────────

function showReference(index) {
  cd.mode = 'reference';
  const nouns = getNounsForLevel(cd.level);
  if (index < 0 || index >= nouns.length) return showMenu();
  cd.refIdx = index;
  const noun = nouns[index];
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';

  let tableHtml = `<div class="cd-decl-table">
    <div class="cd-decl-header">
      <span>${escHtml(noun.nom_s)} <span class="cd-gender-tag ${genderClass(noun.gender)}">${genderLabel(noun.gender)}</span></span>
      <span>${escHtml(loc(noun.meaning))}</span>
    </div>`;

  for (const c of CASES) {
    const sg = noun.singular?.[c] || '—';
    const pl = noun.plural?.[c] || '—';
    tableHtml += `<div class="cd-decl-row">
      <span class="cd-decl-case">${escHtml(loc(CASE_LABELS[c]))}</span>
      <span class="cd-decl-sg">${escHtml(sg)}</span>
      <span class="cd-decl-pl">${escHtml(pl)}</span>
    </div>`;
  }
  tableHtml += '</div>';

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="cdRefBack">←</button>
      <div>
        <div class="lesson-title">${escHtml(noun.nom_s)}</div>
        <div class="lesson-subtitle">${escHtml(loc(noun.meaning))} — ${index + 1}/${nouns.length}</div>
      </div>
    </div>
    <div class="cd-ref-tables">${tableHtml}</div>
    <div class="cd-ref-nav">
      <button class="cd-nav-btn" id="cdPrev" ${index === 0 ? 'disabled' : ''}>← ${nl ? 'Vorige' : 'Previous'}</button>
      <button class="cd-nav-btn" id="cdNext" ${index >= nouns.length - 1 ? 'disabled' : ''}>${nl ? 'Volgende' : 'Next'} →</button>
    </div>`;

  s.querySelector('#cdRefBack').addEventListener('click', showMenu);
  if (index > 0) s.querySelector('#cdPrev').addEventListener('click', () => showReference(index - 1));
  if (index < nouns.length - 1) s.querySelector('#cdNext').addEventListener('click', () => showReference(index + 1));
}

// ── Drill ────────────────────────────────────────────────────────────────────

function buildAdjectiveQuestions() {
  const levels = { A1: ['A1'], A2: ['A1', 'A2'], B1: ['A1', 'A2', 'B1'] };
  const allowed = levels[cd.level] || levels.A1;
  const out = [];
  for (const entry of ADJECTIVE_NOUNS) {
    if (!allowed.includes(entry.level || 'A1')) continue;
    for (const caseName of CASES) {
      if (cd.caseFilter !== 'all' && caseName !== cd.caseFilter) continue;
      for (const number of ['singular', 'plural']) {
        if (cd.numberFilter !== 'all' && number !== cd.numberFilter) continue;
        const form = entry.forms[caseName]?.[number === 'singular' ? 's' : 'p'];
        if (!form) continue;
        out.push({
          type: 'adj', entry, caseName, number,
          nom_s: `${entry.adjective} + ${entry.noun}`,
          meaning: entry.meaning, gender: null, correctForm: form,
        });
      }
    }
  }
  return out;
}

// Personal pronouns: one form per case (nominative skipped, it is the word itself).
// Possessives: case × gender, like adjectives. Alternatives (нього, мого) are accepted.
function buildPronounQuestions() {
  const out = [];
  const cases = PRON_CASES.filter(c => c !== 'nominative' && (cd.caseFilter === 'all' || c === cd.caseFilter));
  for (const entry of PERSONAL) {
    for (const caseName of cases) {
      out.push({ type: 'pron', entry, caseName, number: 'singular', nom_s: entry.word, meaning: entry.meaning,
        gender: null, tag: 'PRON', correctForm: entry.forms[caseName], alts: entry.alts[caseName] || [] });
    }
  }
  for (const entry of POSSESSIVE) {
    for (const caseName of cases) {
      for (const g of ['m', 'f', 'n', 'p']) {
        if (cd.numberFilter === 'singular' && g === 'p') continue;
        if (cd.numberFilter === 'plural' && g !== 'p') continue;
        if (cd.genderFilter !== 'all' && g !== 'p' && g !== cd.genderFilter) continue;
        const forms = entry.forms[caseName][g];
        out.push({ type: 'pron', entry, caseName, number: g === 'p' ? 'plural' : 'singular', gender: g === 'p' ? null : g,
          tag: g === 'p' ? 'PL' : null, nom_s: entry.word, meaning: entry.meaning, pronGender: g,
          correctForm: forms[0], alts: forms.slice(1) });
      }
    }
  }
  return out;
}

function startDrill() {
  cd.mode = 'drill';
  if (cd.pronMode) {
    play(shuffle(buildPronounQuestions()).slice(0, cd.total));
    return;
  }
  if (cd.adjMode) {
    play(shuffle(buildAdjectiveQuestions()).slice(0, cd.total));
    return;
  }
  let questions = buildCaseDrillSet(9999);
  const levelNouns = new Set(getNounsForLevel(cd.level).map(n => n.nom_s));

  questions = questions.filter(q => levelNouns.has(q.nom_s));
  if (cd.caseFilter !== 'all') questions = questions.filter(q => q.caseName === cd.caseFilter);
  if (cd.numberFilter !== 'all') questions = questions.filter(q => q.number === cd.numberFilter);
  if (cd.genderFilter !== 'all') questions = questions.filter(q => q.gender === cd.genderFilter);

  // Mix in sentence questions
  let sentenceQs = CASE_SENTENCES.filter(sq => levelNouns.has(sq.noun));
  if (cd.caseFilter !== 'all') sentenceQs = sentenceQs.filter(sq => sq.targetCase === cd.caseFilter);
  if (cd.numberFilter !== 'all') sentenceQs = sentenceQs.filter(sq => sq.number === cd.numberFilter);
  sentenceQs = shuffle(sentenceQs).slice(0, Math.ceil(cd.total / 4)).map(sq => ({ ...sq, type: 'sentence' }));

  // Focus on weak nouns: half the form questions come from forms answered wrong before.
  let pool = shuffle(questions);
  if (cd.focusWeak) {
    const weak = new Set(getWeakItems(999).map(i => `${i.noun}|${i.caseName}|${i.number}`));
    const weakQs = pool.filter(q => weak.has(`${q.nom_s}|${q.caseName}|${q.number}`));
    const restQs = pool.filter(q => !weak.has(`${q.nom_s}|${q.caseName}|${q.number}`));
    pool = [...weakQs.slice(0, Math.ceil(cd.total / 2)), ...restQs];
  }
  const formQs = pool.slice(0, cd.total - sentenceQs.length);
  const mixed = shuffle([...formQs, ...sentenceQs]).slice(0, cd.total);

  play(mixed);
}

function play(questions) {
  if (questions.length === 0) { showEmptyState(); return; }
  // The free drill only moves the schedule of nouns already learned with Learn One.
  const units = makeUnits({ onlySeen: true });
  runSession({
    screen: getScreen(), icon: COURSE.icon, title: L('Case Drill', 'Naamvallen Drill'), accent: ACCENT,
    cards: questions.map(q => formCard(q, { dictation: cd.dictation, units })),
    onExit: showMenu,
    again: () => ({ label: '🔄 ' + L('Try again (new questions)', 'Opnieuw (nieuwe vragen)'), run: startDrill }),
  });
}

function showEmptyState() {
  const nl = state.nativeLanguage === 'nl';
  const s = getScreen();
  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="cdNoBack">←</button>
      <div><div class="lesson-title">📌 ${nl ? 'Naamvallen Drill' : 'Case Drill'}</div></div>
    </div>
    <div class="cd-empty">
      <div class="cd-empty-icon">🤔</div>
      <div class="cd-empty-text">${nl ? 'Geen vragen voor deze combinatie.' : 'No questions for this combination.'}</div>
      <button class="cd-nav-btn" id="cdEmptyBack">← ${nl ? 'Terug' : 'Back'}</button>
    </div>`;
  s.querySelector('#cdNoBack').addEventListener('click', showMenu);
  s.querySelector('#cdEmptyBack').addEventListener('click', showMenu);
}

function renderDeclTable(noun, highlightCase, highlightNumber) {
  let html = `<div class="cd-decl-table"><div class="cd-decl-header"><span>${escHtml(noun.nom_s)}</span><span>sg / pl</span></div>`;
  for (const c of CASES) {
    const sg = noun.singular?.[c] || '—';
    const pl = noun.plural?.[c] || '—';
    const isHL = c === highlightCase;
    html += `<div class="cd-decl-row ${isHL ? 'cd-highlight-row' : ''}">
      <span class="cd-decl-case">${escHtml(loc(CASE_LABELS[c]))}</span>
      <span class="cd-decl-sg">${escHtml(sg)}</span>
      <span class="cd-decl-pl">${escHtml(pl)}</span>
    </div>`;
  }
  return html + '</div>';
}

function renderPronTable(entry, highlightCase, gender) {
  const nl = state.nativeLanguage === 'nl';
  if (entry.kind === 'personal') {
    let html = `<div class="cd-decl-table"><div class="cd-decl-header"><span>${escHtml(entry.word)} — ${escHtml(loc(entry.meaning))}</span><span></span></div>`;
    for (const c of PRON_CASES) {
      const isHL = c === highlightCase;
      const alt = (entry.alts[c] || []).join(' / ');
      html += `<div class="cd-decl-row ${isHL ? 'cd-highlight-row' : ''}">
        <span class="cd-decl-case">${escHtml(loc(CASE_LABELS[c]))}</span>
        <span class="cd-decl-sg">${escHtml(entry.forms[c])}</span>
        <span class="cd-decl-pl">${alt ? escHtml(alt) : ''}</span>
      </div>`;
    }
    return html + '</div>';
  }
  let html = `<div class="cd-decl-table cd-pron-table"><div class="cd-decl-header"><span>${escHtml(entry.word)} — ${escHtml(loc(entry.meaning))}</span><span>m · f · n · pl</span></div>`;
  for (const c of PRON_CASES) {
    const isHL = c === highlightCase;
    const cell = g => `<span class="${isHL && g === gender ? 'cd-hl-cell' : ''}">${escHtml(entry.forms[c][g][0])}</span>`;
    html += `<div class="cd-decl-row cd-pron-row ${isHL ? 'cd-highlight-row' : ''}">
      <span class="cd-decl-case">${escHtml(loc(CASE_LABELS[c]).split(' — ')[0])}</span>
      ${cell('m')} ${cell('f')} ${cell('n')} ${cell('p')}
    </div>`;
  }
  return html + '</div>';
}

function renderAdjTable(entry, highlightCase, highlightNumber) {
  let html = `<div class="cd-decl-table"><div class="cd-decl-header"><span>${escHtml(entry.adjective)} + ${escHtml(entry.noun)}</span><span>sg / pl</span></div>`;
  for (const c of CASES) {
    const f = entry.forms[c] || {};
    const isHL = c === highlightCase;
    html += `<div class="cd-decl-row ${isHL ? 'cd-highlight-row' : ''}">
      <span class="cd-decl-case">${escHtml(loc(CASE_LABELS[c]))}</span>
      <span class="cd-decl-sg ${isHL && highlightNumber === 'singular' ? 'cd-hl-cell' : ''}">${escHtml(f.s || '—')}</span>
      <span class="cd-decl-pl ${isHL && highlightNumber === 'plural' ? 'cd-hl-cell' : ''}">${escHtml(f.p || '—')}</span>
    </div>`;
  }
  return html + '</div>';
}

// ── Learn one noun: picker ───────────────────────────────────────────────────

function showNounPicker() {
  cd.mode = 'learnPicker';
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const allNouns = getNounsForLevel('B1');
  const groups = { A1: [], A2: [], B1: [] };
  for (const n of allNouns) { (groups[n.level || 'A1'] = groups[n.level || 'A1'] || []).push(n); }

  let listHtml = '';
  for (const [level, nouns] of Object.entries(groups)) {
    if (nouns.length === 0) continue;
    listHtml += `<div class="cd-level-group"><div class="cd-level-group-title">${level} — ${nouns.length} ${nl ? 'woorden' : 'nouns'}</div>`;
    for (const n of nouns) {
      const color = getMasteryColor(n.nom_s);
      listHtml += `<div class="cd-noun-row" data-noun="${escHtml(n.nom_s)}">
        <span class="cd-gender-tag ${genderClass(n.gender)}">${genderLabel(n.gender)}</span>
        <div class="cd-noun-text">
          <div class="cd-noun-word">${escHtml(n.nom_s)}</div>
          <div class="cd-noun-meaning">${escHtml(loc(n.meaning))}</div>
        </div>
        <div class="cd-mastery-dot ${color}"></div>
      </div>`;
    }
    listHtml += '</div>';
  }

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="cdPickerBack">←</button>
      <div>
        <div class="lesson-title">🎓 ${nl ? 'Kies een woord' : 'Choose a Noun'}</div>
        <div class="lesson-subtitle">${nl ? 'Leer alle vormen' : 'Learn all case forms'}</div>
      </div>
    </div>
    <input type="text" class="cd-search-input" id="cdSearch" placeholder="${nl ? 'Zoek...' : 'Search...'}" autocomplete="off" />
    <div id="cdNounList">${listHtml}</div>`;

  s.querySelector('#cdPickerBack').addEventListener('click', showMenu);
  const search = s.querySelector('#cdSearch');
  search.addEventListener('input', () => {
    const q = search.value.toLowerCase().trim();
    s.querySelectorAll('.cd-noun-row').forEach(row => {
      row.style.display = q && !row.textContent.toLowerCase().includes(q) ? 'none' : '';
    });
  });

  s.querySelectorAll('.cd-noun-row').forEach(row => {
    row.addEventListener('click', () => {
      const noun = findNoun(row.dataset.noun);
      if (noun) showLearnNoun(noun);
    });
  });
}

// ── Learn one noun ───────────────────────────────────────────────────────────

function showLearnNoun(noun) {
  cd.mode = 'learnNoun';

  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';

  const table = renderDeclTable(noun, null, null);

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="cdLearnBack">←</button>
      <div>
        <div class="lesson-title">🎓 ${escHtml(noun.nom_s)} <span class="cd-gender-tag ${genderClass(noun.gender)}">${genderLabel(noun.gender)}</span></div>
        <div class="lesson-subtitle">${escHtml(loc(noun.meaning))}</div>
      </div>
    </div>
    <div class="cd-ref-tables">${table}</div>
    <div class="cd-learn-actions">
      <button id="cdLearnBackBtn">← ${nl ? 'Terug' : 'Back'}</button>
      <button class="cd-learn-primary" id="cdLearnStart">${nl ? 'Test me ✍️' : 'Test me ✍️'}</button>
    </div>`;

  s.querySelector('#cdLearnBack').addEventListener('click', showNounPicker);
  s.querySelector('#cdLearnBackBtn').addEventListener('click', showNounPicker);
  s.querySelector('#cdLearnStart').addEventListener('click', () => startLearnPractice(noun));
}

// Every form of the noun in table order: singular, then plural. This is the
// "learn" step of the cases course: it puts the noun on the review schedule.
function startLearnPractice(noun) {
  const units = makeUnits();
  const cards = [];
  for (const number of NUMBERS) {
    for (const caseName of CASES) {
      const form = noun[number]?.[caseName];
      if (form) cards.push(formCard(nounQuestion(noun, caseName, number, form), { units }));
    }
  }
  runSession({
    screen: getScreen(), icon: '🎓', title: noun.nom_s, accent: ACCENT, cards,
    onExit: showNounPicker,
    scoreSubtitle: () => { const st = caseStats(); return `${st.learned} ${L('learned', 'geleerd')} · ${st.due} ${L('due', 'aan de beurt')}`; },
    again: () => ({ label: '🔄 ' + L('Try again', 'Opnieuw'), run: () => showLearnNoun(noun) }),
  });
}

// ── Cards ────────────────────────────────────────────────────────────────────
// What the course engine needs to ask one declined form or one gapped sentence.
// The Review queue uses the same cards between those of other courses.

const nounQuestion = (noun, caseName, number, form) =>
  ({ nom_s: noun.nom_s, gender: noun.gender, meaning: noun.meaning, caseName, number, correctForm: form });

// A unit ("книга · singular") moves on the schedule once per session, when the
// last of its cards is answered, by how many were right. Seven cases of one noun
// must not count as seven successful reviews.
function makeUnits({ onlySeen = false } = {}) {
  const tally = new Map();
  return {
    expect(key) { const t = tally.get(key) || { total: 0, n: 0, ok: 0 }; t.total++; tally.set(key, t); },
    answer(key, res) {
      const t = tally.get(key);
      if (!t) return;
      t.n++; if (res.isCorrect) t.ok++;
      if (t.n < t.total) return;
      if (onlySeen && !caseProgress.get(key)) return;
      const share = t.ok / t.total;
      caseProgress.record(key, t.total === 1 ? res.quality : share === 1 ? 5 : share >= 0.8 ? 3 : 1);
    },
  };
}

// q: a noun, adjective + noun or pronoun form, or with type 'sentence' a noun form inside a sentence.
function formCard(q, { dictation = false, units = null } = {}) {
  const isSentence = q.type === 'sentence';
  const caseName = q.caseName || q.targetCase;
  const correct = isSentence ? q.answer : q.correctForm;
  const name = q.nom_s || q.noun;
  const isNoun = !q.type;                          // only plain nouns are on the schedule
  const unit = nounKey(name, q.number);
  if (units && isNoun) units.expect(unit);
  const heard = dictation && !isSentence;
  const numLabel = q.type === 'pron'
    ? (q.pronGender ? loc(GENDER_LABELS[q.pronGender]) : '')
    : q.number === 'singular' ? L('singular', 'enkelvoud') : L('plural', 'meervoud');

  const promptHtml = isSentence ? `
    <div class="cd-sentence-card">
      <div class="cd-sentence-translation">${escHtml(loc(q))}</div>
      <div class="cd-sentence-text">${escHtml(q.uk).replace('___', '<span class="cd-sentence-blank"></span>')}</div>
      <div class="cd-sentence-hint">${escHtml(q.noun)} → ${escHtml(loc(CASE_LABELS[q.targetCase]))} ${q.number === 'singular' ? '(sg)' : '(pl)'}</div>
    </div>` : `
    <div class="cd-q-card">
      <div class="cd-q-noun">
        ${q.gender ? `<span class="cd-gender-tag ${genderClass(q.gender)}">${genderLabel(q.gender)}</span>` : `<span class="cd-gender-tag cd-gender-adj">${escHtml(q.tag || 'ADJ + N')}</span>`}
        ${escHtml(q.nom_s)}
      </div>
      <div class="cd-q-meaning">${escHtml(loc(q.meaning))}</div>
      <div class="cd-q-prompt">
        <span class="cd-q-case">${escHtml(loc(CASE_LABELS[caseName]))}</span>
        <span class="cd-q-number">${escHtml(numLabel)}</span>
        ${heard ? `<button class="cd-dict-play" type="button" data-say="${escHtml(correct)}" title="${L('Play again', 'Nog eens')}">🔊</button>` : ''}
      </div>
    </div>`;

  let detail = isSentence && q.full ? `<div class="cd-context">${escHtml(q.full)}</div>` : '';
  const noun = q.type === 'adj' || q.type === 'pron' ? null : findNoun(name);
  if (noun) detail += renderDeclTable(noun, caseName, q.number);
  else if (q.type === 'adj') detail += renderAdjTable(q.entry, q.caseName, q.number);
  else if (q.type === 'pron') {
    detail += renderPronTable(q.entry, q.caseName, q.pronGender);
    if (q.alts && q.alts.length) detail += `<div class="cd-context">${L('Also fine', 'Ook goed')}: ${q.alts.map(escHtml).join(' · ')}</div>`;
    if (q.entry.kind === 'possessive') detail += `<div class="cd-context">💡 ${escHtml(loc(INDECLINABLE_NOTE))}</div>`;
  }

  return {
    key: `${name}|${caseName}|${q.number}|${q.pronGender || ''}`, course: COURSE, intro: false,
    promptHtml, autoSay: heard ? correct : null,
    input: { type: 'text', lang: 'uk', placeholder: isSentence ? L('Type the answer…', 'Typ het antwoord…') : L('Type the form…', 'Typ de vorm…') },
    check(answer) { const g = grade(answer, [correct, ...(q.alts || [])], { minTypoLen: 5 }); return { ...g, quality: g.isExact ? 5 : g.isClose ? 3 : 1 }; },
    record(res) {
      recordAnswer(q.type === 'pron' ? `${q.nom_s}${q.pronGender ? ' (' + q.pronGender + ')' : ''}` : name, caseName, q.number, res.isCorrect);
      if (isNoun) units?.answer(unit, res);
    },
    compareOnClose: true,
    correctText: correct,
    detailHtml: detail,
    say: isSentence && q.full ? q.full : correct,
    missed: { left: name, right: correct, extra: `${loc(CASE_LABELS[caseName]).split(' — ')[0]} · ${q.number === 'singular' ? 'sg' : 'pl'}`,
              say: isSentence && q.full ? q.full : correct },
  };
}

// For the Review queue: every due noun as one card, a random case other than the
// nominative singular (that one is the word itself).
export function caseDueCards() {
  const units = makeUnits();
  return caseProgress.dueKeys().map(key => {
    const [nomS, number] = key.slice('noun:'.length).split('|');
    const noun = findNoun(nomS);
    const cases = CASES.filter(c => noun[number]?.[c] && !(number === 'singular' && c === 'nominative'));
    const caseName = shuffle(cases)[0];
    return formCard(nounQuestion(noun, caseName, number, noun[number][caseName]), { units });
  });
}

// Due nouns only, from the case menu or the review hub.
export function startCaseReview(onExit = showMenu) {
  window.showScreen('caseDrillScreen');
  runSession({
    screen: getScreen(), icon: COURSE.icon, title: `${COURSE.name} · ${L('review', 'herhalen')}`, accent: ACCENT,
    cards: shuffle(caseDueCards()).slice(0, 30),
    onExit,
    again: () => (caseStats().due ? { label: '🔄 ' + L('More reviews', 'Verder herhalen'), run: () => startCaseReview(onExit) } : null),
  });
}
