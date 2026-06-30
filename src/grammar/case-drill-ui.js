import { state } from '../state.js';
import { escHtml, levenshtein } from '../utils.js';
import { CASES, CASE_LABELS, NOUNS, CASE_SENTENCES, buildCaseDrillSet, findNoun } from '../data/case-declensions.js';
import { speakText } from '../voice.js';
import { recordAnswer, getNounMastery, getAllMastery, getWeakItems, hasWeaknessData, getWeakNounCount } from '../data/case-weakness.js';

// ── State ────────────────────────────────────────────────────────────────────

let cd = {
  questions: [],
  current:   0,
  score:     0,
  answered:  false,
  total:     25,
  mode:      'menu',
  refIdx:    0,
  caseFilter:   'all',
  numberFilter: 'all',
  genderFilter: 'all',
  level:     localStorage.getItem('caseDrillLevel') || 'A1',
  focusWeak: false,
  // Learn one noun
  learnNoun:    null,
  learnForms:   [],
  learnFormIdx: 0,
  learnResults: [],
};

const loc = field => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[state.nativeLanguage] || field.en || '';
};

function getScreen() { return document.getElementById('caseDrillScreen'); }

const normalise = s => s.toLowerCase().replace(/['ʼ]/g, "'").replace(/\s+/g, ' ').trim();

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

  const caseBtns = CASES.map(c =>
    `<button class="cd-filter-btn ${cd.caseFilter === c ? 'active' : ''}" data-case="${c}">${escHtml(loc(CASE_LABELS[c]))}</button>`
  ).join('');

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="cdBack">←</button>
      <div>
        <div class="lesson-title">📌 ${nl ? 'Naamvallen Drill' : 'Case Practice Drill'}</div>
        <div class="lesson-subtitle">${nl ? 'Oefen Oekraïense naamvallen' : 'Practice Ukrainian noun cases'}</div>
      </div>
    </div>

    <div class="cd-stats-bar">
      <span class="cd-stat">📊 ${nouns.length} ${nl ? 'woorden' : 'nouns'}</span>
      <span class="cd-stat">🎯 ${formCount} ${nl ? 'vormen' : 'forms'}</span>
    </div>

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

  s.querySelector('#cdBack').addEventListener('click', () => window.showScreen('homeScreen'));
  s.querySelector('#cdRefBtn').addEventListener('click', () => showReference(0));
  s.querySelector('#cdLearnBtn').addEventListener('click', showNounPicker);
  s.querySelector('#cdStartBtn').addEventListener('click', startDrill);

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

function startDrill() {
  cd.mode = 'drill';
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

  const formQs = shuffle(questions).slice(0, cd.total - sentenceQs.length);
  const mixed = shuffle([...formQs, ...sentenceQs]).slice(0, cd.total);

  if (mixed.length === 0) {
    showEmptyState();
    return;
  }

  cd.questions = mixed;
  cd.current = 0;
  cd.score = 0;
  cd.answered = false;
  renderDrillQuestion();
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

function renderDrillQuestion() {
  cd.answered = false;
  const q = cd.questions[cd.current];
  if (q.type === 'sentence') renderSentenceQuestion(q);
  else renderFormQuestion(q);
}

function renderFormQuestion(q) {
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const pct = Math.round((cd.current / cd.questions.length) * 100);
  const caseLabel = loc(CASE_LABELS[q.caseName]);
  const numLabel = q.number === 'singular' ? (nl ? 'enkelvoud' : 'singular') : (nl ? 'meervoud' : 'plural');

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="cdDrillBack">←</button>
      <div>
        <div class="lesson-title">📌 ${nl ? 'Naamvallen Drill' : 'Case Drill'}</div>
        <div class="lesson-subtitle">
          <div class="cd-progress-wrap"><div class="cd-progress-bar" style="width:${pct}%"></div></div>
          <div class="cd-progress-text">${cd.current + 1} / ${cd.questions.length}</div>
        </div>
      </div>
    </div>

    <div class="cd-q-card">
      <div class="cd-q-noun">
        <span class="cd-gender-tag ${genderClass(q.gender)}">${genderLabel(q.gender)}</span>
        ${escHtml(q.nom_s)}
      </div>
      <div class="cd-q-meaning">${escHtml(loc(q.meaning))}</div>
      <div class="cd-q-prompt">
        <span class="cd-q-case">${escHtml(caseLabel)}</span>
        <span class="cd-q-number">${escHtml(numLabel)}</span>
      </div>
    </div>

    <div class="cd-input-area">
      <input type="text" class="cd-text-input" id="cdInput"
        placeholder="${nl ? 'Typ de vorm...' : 'Type the form...'}"
        autocomplete="off" autocorrect="off" spellcheck="false" />
      <button class="cd-check-btn" id="cdCheck">${nl ? 'Controleer ✓' : 'Check ✓'}</button>
    </div>
    <div id="cdFeedback"></div>`;

  s.querySelector('#cdDrillBack').addEventListener('click', showMenu);
  setupInput(q);
}

function renderSentenceQuestion(q) {
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const pct = Math.round((cd.current / cd.questions.length) * 100);

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="cdDrillBack">←</button>
      <div>
        <div class="lesson-title">📌 ${nl ? 'Naamvallen Drill' : 'Case Drill'}</div>
        <div class="lesson-subtitle">
          <div class="cd-progress-wrap"><div class="cd-progress-bar" style="width:${pct}%"></div></div>
          <div class="cd-progress-text">${cd.current + 1} / ${cd.questions.length}</div>
        </div>
      </div>
    </div>

    <div class="cd-sentence-card">
      <div class="cd-sentence-translation">${escHtml(loc(q))}</div>
      <div class="cd-sentence-text">${escHtml(q.uk).replace('___', '<span class="cd-sentence-blank"></span>')}</div>
      <div class="cd-sentence-hint">${escHtml(q.noun)} → ${escHtml(loc(CASE_LABELS[q.targetCase]))} ${q.number === 'singular' ? '(sg)' : '(pl)'}</div>
    </div>

    <div class="cd-input-area">
      <input type="text" class="cd-text-input" id="cdInput"
        placeholder="${nl ? 'Typ het antwoord...' : 'Type the answer...'}"
        autocomplete="off" autocorrect="off" spellcheck="false" />
      <button class="cd-check-btn" id="cdCheck">${nl ? 'Controleer ✓' : 'Check ✓'}</button>
    </div>
    <div id="cdFeedback"></div>`;

  s.querySelector('#cdDrillBack').addEventListener('click', showMenu);
  const sq = { ...q, correctForm: q.answer, caseName: q.targetCase };
  setupInput(sq);
}

function setupInput(q) {
  const s = getScreen();
  const input = s.querySelector('#cdInput');
  const check = s.querySelector('#cdCheck');
  const submit = () => {
    const answer = input.value.trim();
    if (!answer) { input.focus(); return; }
    handleAnswer(q, answer);
  };
  check.addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
  input.focus();
}

function handleAnswer(q, answer) {
  if (cd.answered) return;
  cd.answered = true;

  const input = document.getElementById('cdInput');
  const check = document.getElementById('cdCheck');
  input.disabled = true;
  check.disabled = true;

  const normAnswer = normalise(answer);
  const normCorrect = normalise(q.correctForm);
  const isExact = normAnswer === normCorrect;
  const lev = levenshtein(normAnswer, normCorrect);
  const isClose = !isExact && lev <= 1;
  const isCorrect = isExact || isClose;

  if (isCorrect) { cd.score++; input.classList.add(isExact ? 'correct' : 'close'); }
  else { input.classList.add('wrong'); }

  recordAnswer(q.nom_s || q.noun, q.caseName || q.targetCase, q.number, isCorrect);

  const fb = document.getElementById('cdFeedback');
  const nl = state.nativeLanguage === 'nl';
  const resultClass = isCorrect ? 'correct' : 'wrong';
  const resultText = isExact ? '✓ Correct!' : isClose ? '✓ Almost!' : '✗ Not quite';

  let html = `<div class="ex-feedback-result ${resultClass}">${resultText}</div>`;

  if (!isExact) {
    html += `<div class="cd-answer-compare">
      <div class="cd-your-answer"><span class="cd-ans-label">${nl ? 'Jouw antwoord:' : 'Your answer:'}</span> ${escHtml(answer)}</div>
      <div class="cd-correct-answer"><span class="cd-ans-label">${nl ? 'Correct:' : 'Correct:'}</span> ${escHtml(q.correctForm)}</div>
    </div>`;
  }

  // Show sentence context if available
  if (q.type === 'sentence' && q.full) {
    html += `<div class="cd-context">${escHtml(q.full)}</div>`;
  }

  // Show declension table
  const noun = findNoun(q.nom_s || q.noun);
  if (noun) {
    html += renderDeclTable(noun, q.caseName || q.targetCase, q.number);
  }

  html += `<button class="cd-listen-btn" id="cdListen">🔊 ${nl ? 'Luister' : 'Listen'}</button>`;
  fb.innerHTML = html;

  fb.querySelector('#cdListen').addEventListener('click', () => {
    speakText(q.type === 'sentence' ? q.full : q.correctForm, state.currentLanguage);
  });

  const isLast = cd.current + 1 >= cd.questions.length;
  const nextBtn = document.createElement('button');
  nextBtn.className = 'cd-next-btn';
  nextBtn.textContent = isLast ? (nl ? '🏁 Resultaten' : '🏁 See results') : (nl ? 'Volgende →' : 'Next →');
  nextBtn.addEventListener('click', () => {
    if (isLast) showScore();
    else { cd.current++; renderDrillQuestion(); getScreen().scrollTo({ top: 0, behavior: 'smooth' }); }
  });
  fb.appendChild(nextBtn);
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

// ── Score ─────────────────────────────────────────────────────────────────────

function showScore() {
  const total = cd.questions.length;
  const score = cd.score;
  const pct = Math.round((score / total) * 100);
  const emoji = pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪';
  const nl = state.nativeLanguage === 'nl';
  const msg = pct === 100 ? 'Perfect!' : pct >= 80 ? (nl ? 'Geweldig!' : 'Great job!') : pct >= 60 ? (nl ? 'Goed bezig!' : 'Good effort!') : (nl ? 'Blijf oefenen!' : 'Keep practising!');

  const s = getScreen();
  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="cdScoreBack">←</button>
      <div>
        <div class="lesson-title">📌 ${nl ? 'Resultaten' : 'Results'}</div>
        <div class="lesson-subtitle">${nl ? 'Naamvallen Drill' : 'Case Drill'}</div>
      </div>
    </div>
    <div class="ex-score-card">
      <div class="ex-score-emoji">${emoji}</div>
      <div class="ex-score-title">${escHtml(msg)}</div>
      <div class="ex-score-fraction">${score} / ${total}</div>
      <div class="ex-score-bar-wrap"><div class="ex-score-bar-fill" style="width: ${pct}%"></div></div>
      <div class="ex-score-pct">${pct}%</div>
      <div class="ex-score-actions">
        <button class="ex-next-btn" id="cdRetry">🔄 ${nl ? 'Opnieuw' : 'Try again'}</button>
        <button class="ex-back-btn" id="cdBackMenu">← Menu</button>
      </div>
    </div>`;

  s.querySelector('#cdScoreBack').addEventListener('click', showMenu);
  s.querySelector('#cdRetry').addEventListener('click', startDrill);
  s.querySelector('#cdBackMenu').addEventListener('click', showMenu);
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
  cd.learnNoun = noun;
  cd.learnResults = [];

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

function startLearnPractice(noun) {
  const forms = [];
  for (const number of ['singular', 'plural']) {
    for (const caseName of CASES) {
      const form = noun[number]?.[caseName];
      if (!form) continue;
      forms.push({ nom_s: noun.nom_s, gender: noun.gender, meaning: noun.meaning, caseName, number, correctForm: form });
    }
  }
  cd.learnForms = forms;
  cd.learnFormIdx = 0;
  cd.learnResults = [];
  renderLearnForm(noun);
}

function renderLearnForm(noun) {
  if (cd.learnFormIdx >= cd.learnForms.length) { showLearnSummary(noun); return; }
  cd.answered = false;
  const q = cd.learnForms[cd.learnFormIdx];
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const pct = Math.round((cd.learnFormIdx / cd.learnForms.length) * 100);
  const caseLabel = loc(CASE_LABELS[q.caseName]);
  const numLabel = q.number === 'singular' ? 'sg' : 'pl';

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="cdLearnPracBack">←</button>
      <div>
        <div class="lesson-title">🎓 ${escHtml(noun.nom_s)}</div>
        <div class="lesson-subtitle">
          <div class="cd-progress-wrap"><div class="cd-progress-bar" style="width:${pct}%"></div></div>
          <div class="cd-progress-text">${cd.learnFormIdx + 1} / ${cd.learnForms.length}</div>
        </div>
      </div>
    </div>
    <div class="cd-q-card">
      <div class="cd-q-noun"><span class="cd-gender-tag ${genderClass(q.gender)}">${genderLabel(q.gender)}</span> ${escHtml(q.nom_s)}</div>
      <div class="cd-q-prompt"><span class="cd-q-case">${escHtml(caseLabel)}</span><span class="cd-q-number">${numLabel}</span></div>
    </div>
    <div class="cd-input-area">
      <input type="text" class="cd-text-input" id="cdInput" placeholder="${nl ? 'Typ de vorm...' : 'Type the form...'}" autocomplete="off" autocorrect="off" spellcheck="false" />
      <button class="cd-check-btn" id="cdCheck">${nl ? 'Controleer ✓' : 'Check ✓'}</button>
    </div>
    <div id="cdFeedback"></div>`;

  s.querySelector('#cdLearnPracBack').addEventListener('click', () => showLearnSummary(noun));

  const input = s.querySelector('#cdInput');
  const check = s.querySelector('#cdCheck');
  const submit = () => {
    if (cd.answered) return;
    const answer = input.value.trim();
    if (!answer) { input.focus(); return; }
    cd.answered = true;
    input.disabled = true; check.disabled = true;

    const normAnswer = normalise(answer);
    const normCorrect = normalise(q.correctForm);
    const isExact = normAnswer === normCorrect;
    const lev = levenshtein(normAnswer, normCorrect);
    const isClose = !isExact && lev <= 1;
    const isCorrect = isExact || isClose;

    if (isCorrect) input.classList.add(isExact ? 'correct' : 'close');
    else input.classList.add('wrong');

    recordAnswer(q.nom_s, q.caseName, q.number, isCorrect);
    cd.learnResults.push({ caseName: q.caseName, number: q.number, correct: isCorrect, correctForm: q.correctForm, userAnswer: answer });

    const fb = document.getElementById('cdFeedback');
    const resultClass = isCorrect ? 'correct' : 'wrong';
    const resultText = isExact ? '✓ Correct!' : isClose ? '✓ Almost!' : '✗ Not quite';
    let html = `<div class="ex-feedback-result ${resultClass}">${resultText}</div>`;
    if (!isExact) {
      html += `<div class="cd-answer-compare">
        <div class="cd-your-answer"><span class="cd-ans-label">${nl ? 'Jouw:' : 'Yours:'}</span> ${escHtml(answer)}</div>
        <div class="cd-correct-answer"><span class="cd-ans-label">${nl ? 'Correct:' : 'Correct:'}</span> ${escHtml(q.correctForm)}</div>
      </div>`;
    }
    html += renderDeclTable(noun, q.caseName, q.number);
    fb.innerHTML = html;

    const nextBtn = document.createElement('button');
    nextBtn.className = 'cd-next-btn';
    nextBtn.textContent = nl ? 'Volgende →' : 'Next →';
    nextBtn.addEventListener('click', () => {
      cd.learnFormIdx++;
      renderLearnForm(noun);
      getScreen().scrollTo({ top: 0, behavior: 'smooth' });
    });
    fb.appendChild(nextBtn);
  };

  check.addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
  input.focus();
}

function showLearnSummary(noun) {
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const results = cd.learnResults;
  const correct = results.filter(r => r.correct).length;
  const total = results.length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const emoji = total === 0 ? '🎓' : pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪';

  const wrongHtml = results.filter(r => !r.correct).map(r =>
    `<div class="cd-learn-summary-row wrong">
      <span>✗</span>
      <span>${escHtml(loc(CASE_LABELS[r.caseName]))} ${r.number === 'singular' ? 'sg' : 'pl'} — <span class="cd-learn-summary-form">${escHtml(r.correctForm)}</span> <span style="color:var(--gray);font-size:0.75rem">(${escHtml(r.userAnswer)})</span></span>
    </div>`
  ).join('');

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="cdSumBack">←</button>
      <div>
        <div class="lesson-title">🎓 ${escHtml(noun.nom_s)}</div>
        <div class="lesson-subtitle">${nl ? 'Resultaten' : 'Results'}</div>
      </div>
    </div>
    <div class="ex-score-card">
      <div class="ex-score-emoji">${emoji}</div>
      <div class="ex-score-fraction">${correct} / ${total}</div>
      <div class="ex-score-bar-wrap"><div class="ex-score-bar-fill" style="width: ${pct}%"></div></div>
      <div class="ex-score-pct">${pct}%</div>
    </div>
    ${wrongHtml ? `<div style="margin-bottom:14px">${wrongHtml}</div>` : ''}
    <div class="cd-learn-actions">
      <button id="cdSumRetry">${nl ? '🔄 Opnieuw' : '🔄 Try again'}</button>
      <button id="cdSumPicker">← ${nl ? 'Woorden' : 'Noun list'}</button>
      <button id="cdSumMenu">← Menu</button>
    </div>`;

  s.querySelector('#cdSumBack').addEventListener('click', showNounPicker);
  s.querySelector('#cdSumRetry').addEventListener('click', () => showLearnNoun(noun));
  s.querySelector('#cdSumPicker').addEventListener('click', showNounPicker);
  s.querySelector('#cdSumMenu').addEventListener('click', showMenu);
}
