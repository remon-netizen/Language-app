import { state } from '../state.js';
import { escHtml, levenshtein } from '../utils.js';
import { CONJUGATIONS, buildDrillSet, findVerb } from '../data/verb-conjugations.js';
import { VERB_PAIRS } from '../data/verb-aspects.js';
import { speakText } from '../voice.js';
import { recordAnswer, getVerbMastery, getAllMastery, getWeakItems, hasWeaknessData, getWeakVerbCount } from '../data/verb-weakness.js';

// ── State ────────────────────────────────────────────────────────────────────

let vd = {
  questions: [],
  current:   0,
  score:     0,
  answered:  false,
  total:     25,
  mode:      'menu',      // 'menu' | 'reference' | 'drill' | 'learnPicker' | 'learnVerb'
  refIdx:    0,
  filter:    'all',        // 'all' | 'imperfective' | 'perfective'
  tenseFilter: 'all',     // 'all' | 'present' | 'past' | 'future' | 'imperative'
  level:     localStorage.getItem('verbDrillLevel') || 'A1',
  focusWeak: false,
  // Learn one verb state
  learnPairIdx: 0,
  learnStep:    'study',   // 'study' | 'practice' | 'sentences' | 'summary'
  learnForms:   [],        // all forms to practice
  learnFormIdx: 0,
  learnResults: [],        // { pronoun, tense, correct, correctForm, userAnswer }
  learnSentences: [],      // sentence exercises for current verb
  learnSentIdx:  0,
};

const loc = field => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[state.nativeLanguage] || field.en || '';
};

function getScreen() { return document.getElementById('verbDrillScreen'); }

// ── Helpers ──────────────────────────────────────────────────────────────────

function getVerbsForLevel(level) {
  const levels = { A1: ['A1'], A2: ['A1', 'A2'], B1: ['A1', 'A2', 'B1'] };
  const allowed = levels[level] || levels.A1;
  return CONJUGATIONS.filter(v => allowed.includes(v.level || 'A1'));
}

function countFormsForLevel(level) {
  const verbs = getVerbsForLevel(level);
  let count = 0;
  for (const v of verbs) {
    for (const t of ['present', 'past', 'future', 'imperative']) {
      if (v[t]) count += Object.keys(v[t]).length;
    }
  }
  return count;
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

const normalise = s => s.toLowerCase().replace(/['ʼ]/g, "'").replace(/\s+/g, ' ').trim();

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
  const verbCount = getVerbsForLevel(vd.level).length;
  const formCount = countFormsForLevel(vd.level);
  const allowedTenses = getAllowedTenses(vd.level);
  const weakCount = getWeakVerbCount();
  const hasWeak = hasWeaknessData();

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vdBack">←</button>
      <div>
        <div class="lesson-title">✍️ ${nl ? 'Werkwoord Drill' : 'Verb Conjugation Drill'}</div>
        <div class="lesson-subtitle">${nl ? 'Oefen werkwoordsvormen door te schrijven' : 'Practice verb forms by typing'}</div>
      </div>
    </div>

    <div class="vd-stats-bar">
      <span class="vd-stat">📊 ${verbCount} ${nl ? 'werkwoorden' : 'verbs'}</span>
      <span class="vd-stat">🎯 ${formCount} ${nl ? 'vormen' : 'forms'}</span>
      <span class="vd-stat">🔀 ${nl ? 'Willekeurig' : 'Randomised'}</span>
    </div>

    <div class="vd-filter-section">
      <div class="vd-filter-label">${nl ? 'Niveau:' : 'Level:'}</div>
      <div class="vd-level-row">
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

      ${hasWeak ? `
        <div class="vd-weak-toggle ${vd.focusWeak ? 'active' : ''}" id="vdWeakToggle">
          <span class="vd-weak-check">${vd.focusWeak ? '✓' : ''}</span>
          <span>🎯 ${nl ? `Focus op zwakke werkwoorden (${weakCount})` : `Focus on weak verbs (${weakCount})`}</span>
        </div>` : ''}
    </div>

    <div class="vd-menu-grid-3">
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
      <button class="vd-menu-card vd-menu-primary" id="vdStartBtn">
        <span class="vd-menu-icon">✍️</span>
        <span class="vd-menu-title">${nl ? 'Drill' : 'Drill'}</span>
        <span class="vd-menu-sub">25 ${nl ? 'vragen' : 'questions'}</span>
      </button>
    </div>`;

  s.querySelector('#vdBack').addEventListener('click', () => window.showScreen('homeScreen'));
  s.querySelector('#vdRefBtn').addEventListener('click', () => showReference(0));
  s.querySelector('#vdLearnBtn').addEventListener('click', () => showVerbPicker());
  s.querySelector('#vdStartBtn').addEventListener('click', startDrill);

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

function renderTable(verb, label) {
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
    html += `<div class="vd-tense-label">${t.name}</div><div class="vd-conj-table">`;
    for (const [pronoun, form] of Object.entries(verb[t.key])) {
      html += `<div class="vd-conj-row"><span class="vd-pronoun">${escHtml(pronoun)}</span><span class="vd-form">${escHtml(form)}</span></div>`;
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
      <div class="vd-ref-col vd-imp-col">${renderTable(imp, nl ? 'Onvoltooid' : 'Imperfective')}</div>
      <div class="vd-ref-col vd-perf-col">${renderTable(perf, nl ? 'Voltooid' : 'Perfective')}</div>
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
  const allowedTenses = getAllowedTenses(vd.level);
  const levelVerbs = getVerbsForLevel(vd.level);
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

  vd.questions = mixed.slice(0, vd.total);
  if (vd.questions.length === 0) { showEmptyState(); return; }
  vd.current = 0;
  vd.score = 0;
  vd.answered = false;
  renderDrillQuestion();
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

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

function renderDrillQuestion() {
  vd.answered = false;
  const q = vd.questions[vd.current];

  if (q.type === 'sentence') {
    renderSentenceQuestion(q);
  } else {
    renderConjugationQuestion(q);
  }
}

function renderSentenceQuestion(q) {
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const pct = Math.round((vd.current / vd.questions.length) * 100);

  const aspectTag = q.aspect === 'imperfective'
    ? `<span class="vd-aspect-tag vd-imp">IMP</span>`
    : `<span class="vd-aspect-tag vd-perf">PERF</span>`;

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vdDrillBack">←</button>
      <div>
        <div class="lesson-title">✍️ ${nl ? 'Werkwoord Drill' : 'Verb Drill'}</div>
        <div class="lesson-subtitle">
          <div class="vd-progress-wrap"><div class="vd-progress-bar" style="width:${pct}%"></div></div>
          <div class="vd-progress-text">${vd.current + 1} / ${vd.questions.length}</div>
        </div>
      </div>
    </div>

    <div class="vd-sentence-card">
      <div class="vd-sentence-translation">${escHtml(q.translation)}</div>
      <div class="vd-sentence-text">${escHtml(q.sentence).replace('___', '<span class="vd-sentence-blank"></span>')}</div>
      <div class="vd-sentence-hint">
        ${aspectTag}
        ${escHtml(q.infinitive)} — ${escHtml(loc(q.tenseLabel))} — ${escHtml(q.pronoun)}
      </div>
    </div>

    <div class="vd-input-area">
      <input type="text" class="vd-text-input" id="vdInput"
        placeholder="${nl ? 'Typ de werkwoordsvorm...' : 'Type the verb form...'}"
        autocomplete="off" autocorrect="off" spellcheck="false" />
      <button class="vd-check-btn" id="vdCheck">${nl ? 'Controleer ✓' : 'Check ✓'}</button>
    </div>

    <div id="vdFeedback"></div>`;

  s.querySelector('#vdDrillBack').addEventListener('click', showMenu);
  setupInputHandlers(q);
}

function renderConjugationQuestion(q) {
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const pct = Math.round((vd.current / vd.questions.length) * 100);

  const aspectTag = q.aspect === 'imperfective'
    ? `<span class="vd-aspect-tag vd-imp">IMP</span>`
    : `<span class="vd-aspect-tag vd-perf">PERF</span>`;

  const tenseLabel = loc(q.tenseLabel);

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vdDrillBack">←</button>
      <div>
        <div class="lesson-title">✍️ ${nl ? 'Werkwoord Drill' : 'Verb Drill'}</div>
        <div class="lesson-subtitle">
          <div class="vd-progress-wrap"><div class="vd-progress-bar" style="width:${pct}%"></div></div>
          <div class="vd-progress-text">${vd.current + 1} / ${vd.questions.length}</div>
        </div>
      </div>
    </div>

    <div class="vd-q-card">
      <div class="vd-q-verb-row">
        ${aspectTag}
        <span class="vd-q-infinitive">${escHtml(q.infinitive)}</span>
        <span class="vd-q-meaning">${escHtml(loc(q.meaning))}</span>
      </div>
      <div class="vd-q-partner">${nl ? 'Paar' : 'Pair'}: ${escHtml(q.partner)}</div>
      <div class="vd-q-prompt">
        <span class="vd-q-pronoun">${escHtml(q.pronoun)}</span>
        <span class="vd-q-tense">${escHtml(tenseLabel)}</span>
      </div>
    </div>

    <div class="vd-input-area">
      <input type="text" class="vd-text-input" id="vdInput"
        placeholder="${nl ? 'Typ de werkwoordsvorm...' : 'Type the verb form...'}"
        autocomplete="off" autocorrect="off" spellcheck="false" />
      <button class="vd-check-btn" id="vdCheck">${nl ? 'Controleer ✓' : 'Check ✓'}</button>
    </div>

    <div id="vdFeedback"></div>`;

  s.querySelector('#vdDrillBack').addEventListener('click', showMenu);
  setupInputHandlers(q);
}

function setupInputHandlers(q) {
  const s = getScreen();
  const input = s.querySelector('#vdInput');
  const check = s.querySelector('#vdCheck');

  const submit = () => {
    const answer = input.value.trim();
    if (!answer) { input.focus(); return; }
    handleAnswer(q, answer);
  };

  check.addEventListener('click', submit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
  });
  input.focus();
}

function handleAnswer(q, answer) {
  if (vd.answered) return;
  vd.answered = true;

  const input = document.getElementById('vdInput');
  const check = document.getElementById('vdCheck');
  input.disabled = true;
  check.disabled = true;

  const normAnswer = normalise(answer);
  const normCorrect = normalise(q.correctForm);

  const isExact = normAnswer === normCorrect;
  const lev = levenshtein(normAnswer, normCorrect);
  const isClose = !isExact && lev <= 1;
  const isCorrect = isExact || isClose;

  if (isCorrect) {
    vd.score++;
    input.classList.add(isExact ? 'correct' : 'close');
  } else {
    input.classList.add('wrong');
  }

  // Record for weakness tracking
  recordAnswer(q.infinitive, q.tense, q.pronoun, isCorrect);

  const fb = document.getElementById('vdFeedback');
  const nl = state.nativeLanguage === 'nl';

  const resultClass = isCorrect ? 'correct' : 'wrong';
  const resultText = isExact
    ? '✓ ' + (nl ? 'Correct!' : 'Correct!')
    : isClose
      ? '✓ ' + (nl ? 'Bijna! (kleine typfout)' : 'Almost! (minor typo)')
      : '✗ ' + (nl ? 'Niet helemaal' : 'Not quite');

  let html = `<div class="ex-feedback-result ${resultClass}">${resultText}</div>`;

  if (!isExact) {
    html += `
      <div class="vd-answer-compare">
        <div class="vd-your-answer"><span class="vd-ans-label">${nl ? 'Jouw antwoord:' : 'Your answer:'}</span> ${escHtml(answer)}</div>
        <div class="vd-correct-answer"><span class="vd-ans-label">${nl ? 'Correct:' : 'Correct:'}</span> ${escHtml(q.correctForm)}</div>
      </div>`;
  }

  // For sentence questions, show the full sentence
  if (q.type === 'sentence' && q.fullSentence) {
    html += `<div class="vd-context">${escHtml(q.fullSentence)}</div>`;
  }

  // Show full conjugation table for this tense
  const verb = findVerb(q.infinitive);
  if (verb && verb[q.tense]) {
    const tenseName = loc(getTenseLabel(q.tense));
    html += `<div class="vd-full-table">`;
    html += `<div class="vd-full-table-header">${escHtml(q.infinitive)} — ${escHtml(tenseName)}</div>`;
    for (const [pronoun, form] of Object.entries(verb[q.tense])) {
      const isCorrectRow = pronoun === q.pronoun;
      html += `<div class="vd-full-row ${isCorrectRow ? 'vd-highlight-row' : ''}">`;
      html += `<span class="vd-full-pronoun">${escHtml(pronoun)}</span>`;
      html += `<span class="vd-full-form">${escHtml(form)}</span>`;
      html += `</div>`;
    }
    html += `</div>`;
  }

  // Listen button
  html += `<button class="vd-listen-btn" id="vdListen">🔊 ${nl ? 'Luister' : 'Listen'}</button>`;

  fb.innerHTML = html;

  fb.querySelector('#vdListen').addEventListener('click', () => {
    const text = q.type === 'sentence' && q.fullSentence
      ? q.fullSentence
      : q.tense === 'imperative' ? q.correctForm : `${q.pronoun} ${q.correctForm}`;
    speakText(text, state.currentLanguage);
  });

  // Next button
  const isLast = vd.current + 1 >= vd.questions.length;
  const nextBtn = document.createElement('button');
  nextBtn.className = 'vd-next-btn';
  nextBtn.textContent = isLast
    ? (nl ? '🏁 Resultaten' : '🏁 See results')
    : (nl ? 'Volgende →' : 'Next →');
  nextBtn.addEventListener('click', () => {
    if (isLast) {
      showDrillScore();
    } else {
      vd.current++;
      renderDrillQuestion();
      getScreen().scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  fb.appendChild(nextBtn);
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Score screen ─────────────────────────────────────────────────────────────

function showDrillScore() {
  const total = vd.questions.length;
  const score = vd.score;
  const pct = Math.round((score / total) * 100);
  const emoji = pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪';
  const nl = state.nativeLanguage === 'nl';
  const msg = pct === 100 ? (nl ? 'Perfecte score!' : 'Perfect score!')
            : pct >= 80 ? (nl ? 'Geweldig!' : 'Great job!')
            : pct >= 60 ? (nl ? 'Goed bezig!' : 'Good effort!')
            : (nl ? 'Blijf oefenen!' : 'Keep practising!');

  // Collect wrong answers
  const wrongQs = vd.questions.filter((q, i) => {
    // We don't track per-question correctness directly, so reconstruct from weakness data
    // Instead, just show the questions and let the score speak for itself
    return false; // simplified — the weakness tracker already recorded everything
  });

  const s = getScreen();
  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vdScoreBack">←</button>
      <div>
        <div class="lesson-title">✍️ ${nl ? 'Resultaten' : 'Results'}</div>
        <div class="lesson-subtitle">${nl ? 'Werkwoord Drill' : 'Verb Conjugation Drill'}</div>
      </div>
    </div>

    <div class="ex-score-card">
      <div class="ex-score-emoji">${emoji}</div>
      <div class="ex-score-title">${escHtml(msg)}</div>
      <div class="ex-score-fraction">${score} / ${total}</div>
      <div class="ex-score-bar-wrap">
        <div class="ex-score-bar-fill" style="width: ${pct}%"></div>
      </div>
      <div class="ex-score-pct">${pct}%</div>
      <div class="ex-score-actions">
        <button class="ex-next-btn" id="vdRetry">🔄 ${nl ? 'Opnieuw (nieuwe vragen)' : 'Try again (new questions)'}</button>
        <button class="ex-back-btn" id="vdBackMenu">← Menu</button>
      </div>
    </div>`;

  s.querySelector('#vdScoreBack').addEventListener('click', showMenu);
  s.querySelector('#vdRetry').addEventListener('click', startDrill);
  s.querySelector('#vdBackMenu').addEventListener('click', showMenu);
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

// ── Learn one verb: Study + Practice + Sentences ─────────────────────────────

function showLearnVerb(imp, perf) {
  vd.mode = 'learnVerb';
  vd.learnStep = 'study';
  renderLearnStudy(imp, perf);
}

function renderLearnStudy(imp, perf) {
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';

  // Find aspect tip from verb-aspects data if available
  const aspectPair = VERB_PAIRS.find(p =>
    p.imperfective === imp.infinitive || p.perfective === perf.infinitive
  );
  const tip = aspectPair ? loc(aspectPair.tip) : '';

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
      <div class="vd-ref-col vd-imp-col">${renderTable(imp, nl ? 'Onvoltooid' : 'Imperfective')}</div>
      <div class="vd-ref-col vd-perf-col">${renderTable(perf, nl ? 'Voltooid' : 'Perfective')}</div>
    </div>

    <div class="vd-learn-actions">
      <button id="vdLearnBackBtn">← ${nl ? 'Terug' : 'Back'}</button>
      <button class="vd-learn-primary" id="vdLearnStart">${nl ? 'Test me ✍️' : 'Test me ✍️'}</button>
    </div>`;

  s.querySelector('#vdLearnBack').addEventListener('click', showVerbPicker);
  s.querySelector('#vdLearnBackBtn').addEventListener('click', showVerbPicker);
  s.querySelector('#vdLearnStart').addEventListener('click', () => startLearnPractice(imp, perf));
}

function startLearnPractice(imp, perf) {
  vd.learnStep = 'practice';
  vd.learnResults = [];

  // Build all forms for both verbs
  const forms = [];
  const tenseNames = {
    present:    { en: 'Present', nl: 'Tegenwoordige tijd' },
    past:       { en: 'Past', nl: 'Verleden tijd' },
    future:     { en: 'Future', nl: 'Toekomst' },
    imperative: { en: 'Imperative', nl: 'Gebiedende wijs' },
  };

  for (const verb of [imp, perf]) {
    for (const tense of ['present', 'past', 'future', 'imperative']) {
      if (!verb[tense]) continue;
      for (const [pronoun, form] of Object.entries(verb[tense])) {
        forms.push({
          infinitive: verb.infinitive,
          aspect: verb.aspect,
          partner: verb.partner,
          meaning: verb.meaning,
          tense,
          tenseLabel: tenseNames[tense],
          pronoun,
          correctForm: form,
        });
      }
    }
  }

  vd.learnForms = forms;
  vd.learnFormIdx = 0;
  renderLearnForm(imp, perf);
}

function renderLearnForm(imp, perf) {
  if (vd.learnFormIdx >= vd.learnForms.length) {
    // Check if there are sentence exercises
    const hasSentences = (imp.sentences && imp.sentences.length > 0) || (perf.sentences && perf.sentences.length > 0);
    if (hasSentences) {
      startLearnSentences(imp, perf);
    } else {
      showLearnSummary(imp, perf);
    }
    return;
  }

  const q = vd.learnForms[vd.learnFormIdx];
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const total = vd.learnForms.length;
  const pct = Math.round((vd.learnFormIdx / total) * 100);

  const aspectTag = q.aspect === 'imperfective'
    ? `<span class="vd-aspect-tag vd-imp">IMP</span>`
    : `<span class="vd-aspect-tag vd-perf">PERF</span>`;

  // Show tense divider when tense changes
  const prevForm = vd.learnFormIdx > 0 ? vd.learnForms[vd.learnFormIdx - 1] : null;
  const showDivider = !prevForm || prevForm.tense !== q.tense || prevForm.infinitive !== q.infinitive;

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vdLearnPracBack">←</button>
      <div>
        <div class="lesson-title">🎓 ${escHtml(imp.infinitive)} / ${escHtml(perf.infinitive)}</div>
        <div class="lesson-subtitle">
          <div class="vd-progress-wrap"><div class="vd-progress-bar" style="width:${pct}%"></div></div>
          <div class="vd-progress-text">${vd.learnFormIdx + 1} / ${total} ${nl ? 'vormen' : 'forms'}</div>
        </div>
      </div>
    </div>

    ${showDivider ? `<div class="vd-tense-divider">${aspectTag} ${escHtml(q.infinitive)} — ${escHtml(loc(q.tenseLabel))}</div>` : ''}

    <div class="vd-q-card">
      <div class="vd-q-verb-row">
        ${aspectTag}
        <span class="vd-q-infinitive">${escHtml(q.infinitive)}</span>
        <span class="vd-q-meaning">${escHtml(loc(q.meaning))}</span>
      </div>
      <div class="vd-q-prompt">
        <span class="vd-q-pronoun">${escHtml(q.pronoun)}</span>
        <span class="vd-q-tense">${escHtml(loc(q.tenseLabel))}</span>
      </div>
    </div>

    <div class="vd-input-area">
      <input type="text" class="vd-text-input" id="vdInput"
        placeholder="${nl ? 'Typ de werkwoordsvorm...' : 'Type the verb form...'}"
        autocomplete="off" autocorrect="off" spellcheck="false" />
      <button class="vd-check-btn" id="vdCheck">${nl ? 'Controleer ✓' : 'Check ✓'}</button>
    </div>

    <div id="vdFeedback"></div>`;

  s.querySelector('#vdLearnPracBack').addEventListener('click', () => showLearnSummary(imp, perf));

  const input = s.querySelector('#vdInput');
  const check = s.querySelector('#vdCheck');

  const submit = () => {
    const answer = input.value.trim();
    if (!answer) { input.focus(); return; }
    handleLearnAnswer(q, answer, imp, perf);
  };

  check.addEventListener('click', submit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
  });
  input.focus();
}

function handleLearnAnswer(q, answer, imp, perf) {
  if (vd.answered) return;
  vd.answered = true;

  const input = document.getElementById('vdInput');
  const check = document.getElementById('vdCheck');
  input.disabled = true;
  check.disabled = true;

  const normAnswer = normalise(answer);
  const normCorrect = normalise(q.correctForm);

  const isExact = normAnswer === normCorrect;
  const lev = levenshtein(normAnswer, normCorrect);
  const isClose = !isExact && lev <= 1;
  const isCorrect = isExact || isClose;

  if (isCorrect) {
    input.classList.add(isExact ? 'correct' : 'close');
  } else {
    input.classList.add('wrong');
  }

  recordAnswer(q.infinitive, q.tense, q.pronoun, isCorrect);
  vd.learnResults.push({
    pronoun: q.pronoun,
    tense: q.tense,
    infinitive: q.infinitive,
    correct: isCorrect,
    correctForm: q.correctForm,
    userAnswer: answer,
  });

  const fb = document.getElementById('vdFeedback');
  const nl = state.nativeLanguage === 'nl';

  const resultClass = isCorrect ? 'correct' : 'wrong';
  const resultText = isExact
    ? '✓ ' + (nl ? 'Correct!' : 'Correct!')
    : isClose
      ? '✓ ' + (nl ? 'Bijna!' : 'Almost!')
      : '✗ ' + (nl ? 'Niet helemaal' : 'Not quite');

  let html = `<div class="ex-feedback-result ${resultClass}">${resultText}</div>`;

  if (!isExact) {
    html += `
      <div class="vd-answer-compare">
        <div class="vd-your-answer"><span class="vd-ans-label">${nl ? 'Jouw antwoord:' : 'Your answer:'}</span> ${escHtml(answer)}</div>
        <div class="vd-correct-answer"><span class="vd-ans-label">${nl ? 'Correct:' : 'Correct:'}</span> ${escHtml(q.correctForm)}</div>
      </div>`;
  }

  // Show full conjugation table
  const verb = findVerb(q.infinitive);
  if (verb && verb[q.tense]) {
    const tenseName = loc(getTenseLabel(q.tense));
    html += `<div class="vd-full-table">`;
    html += `<div class="vd-full-table-header">${escHtml(q.infinitive)} — ${escHtml(tenseName)}</div>`;
    for (const [pronoun, form] of Object.entries(verb[q.tense])) {
      const isCorrectRow = pronoun === q.pronoun;
      html += `<div class="vd-full-row ${isCorrectRow ? 'vd-highlight-row' : ''}">`;
      html += `<span class="vd-full-pronoun">${escHtml(pronoun)}</span>`;
      html += `<span class="vd-full-form">${escHtml(form)}</span>`;
      html += `</div>`;
    }
    html += `</div>`;
  }

  html += `<button class="vd-listen-btn" id="vdListen">🔊 ${nl ? 'Luister' : 'Listen'}</button>`;

  fb.innerHTML = html;

  fb.querySelector('#vdListen').addEventListener('click', () => {
    const text = q.tense === 'imperative' ? q.correctForm : `${q.pronoun} ${q.correctForm}`;
    speakText(text, state.currentLanguage);
  });

  const nextBtn = document.createElement('button');
  nextBtn.className = 'vd-next-btn';
  nextBtn.textContent = nl ? 'Volgende →' : 'Next →';
  nextBtn.addEventListener('click', () => {
    vd.learnFormIdx++;
    vd.answered = false;
    renderLearnForm(imp, perf);
    getScreen().scrollTo({ top: 0, behavior: 'smooth' });
  });
  fb.appendChild(nextBtn);
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Learn one verb: Sentence exercises ───────────────────────────────────────

function startLearnSentences(imp, perf) {
  vd.learnStep = 'sentences';
  const allSentences = [...(imp.sentences || []), ...(perf.sentences || [])];
  // Pick up to 5 sentence exercises
  const picked = shuffle(allSentences).slice(0, 5);
  vd.learnSentences = picked;
  vd.learnSentIdx = 0;
  renderLearnSentence(imp, perf);
}

function renderLearnSentence(imp, perf) {
  if (vd.learnSentIdx >= vd.learnSentences.length) {
    showLearnSummary(imp, perf);
    return;
  }

  const sent = vd.learnSentences[vd.learnSentIdx];
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  vd.answered = false;

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vdSentBack">←</button>
      <div>
        <div class="lesson-title">🎓 ${nl ? 'In context' : 'In Context'}</div>
        <div class="lesson-subtitle">${vd.learnSentIdx + 1} / ${vd.learnSentences.length} ${nl ? 'zinnen' : 'sentences'}</div>
      </div>
    </div>

    <div class="vd-sentence-card">
      <div class="vd-sentence-translation">${escHtml(loc(sent))}</div>
      <div class="vd-sentence-text">${escHtml(sent.uk).replace('___', '<span class="vd-sentence-blank"></span>')}</div>
      <div class="vd-sentence-hint">
        ${escHtml(imp.infinitive)} / ${escHtml(perf.infinitive)}
      </div>
    </div>

    <div class="vd-input-area">
      <input type="text" class="vd-text-input" id="vdInput"
        placeholder="${nl ? 'Typ de werkwoordsvorm...' : 'Type the verb form...'}"
        autocomplete="off" autocorrect="off" spellcheck="false" />
      <button class="vd-check-btn" id="vdCheck">${nl ? 'Controleer ✓' : 'Check ✓'}</button>
    </div>

    <div id="vdFeedback"></div>`;

  s.querySelector('#vdSentBack').addEventListener('click', () => showLearnSummary(imp, perf));

  const input = s.querySelector('#vdInput');
  const check = s.querySelector('#vdCheck');

  const submit = () => {
    const answer = input.value.trim();
    if (!answer) { input.focus(); return; }
    handleLearnSentenceAnswer(sent, answer, imp, perf);
  };

  check.addEventListener('click', submit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
  });
  input.focus();
}

function handleLearnSentenceAnswer(sent, answer, imp, perf) {
  if (vd.answered) return;
  vd.answered = true;

  const input = document.getElementById('vdInput');
  const check = document.getElementById('vdCheck');
  input.disabled = true;
  check.disabled = true;

  const normAnswer = normalise(answer);
  const normCorrect = normalise(sent.answer);

  const isExact = normAnswer === normCorrect;
  const lev = levenshtein(normAnswer, normCorrect);
  const isClose = !isExact && lev <= 1;
  const isCorrect = isExact || isClose;

  if (isCorrect) {
    input.classList.add(isExact ? 'correct' : 'close');
  } else {
    input.classList.add('wrong');
  }

  // Track in weakness system
  recordAnswer(
    imp.infinitive === findVerbForSentence(sent, imp, perf) ? imp.infinitive : perf.infinitive,
    sent.tense, sent.pronoun, isCorrect
  );

  vd.learnResults.push({
    pronoun: sent.pronoun,
    tense: sent.tense,
    infinitive: imp.infinitive,
    correct: isCorrect,
    correctForm: sent.answer,
    userAnswer: answer,
    isSentence: true,
  });

  const fb = document.getElementById('vdFeedback');
  const nl = state.nativeLanguage === 'nl';

  const resultClass = isCorrect ? 'correct' : 'wrong';
  const resultText = isExact
    ? '✓ ' + (nl ? 'Correct!' : 'Correct!')
    : isClose
      ? '✓ ' + (nl ? 'Bijna!' : 'Almost!')
      : '✗ ' + (nl ? 'Niet helemaal' : 'Not quite');

  let html = `<div class="ex-feedback-result ${resultClass}">${resultText}</div>`;

  if (!isExact) {
    html += `
      <div class="vd-answer-compare">
        <div class="vd-your-answer"><span class="vd-ans-label">${nl ? 'Jouw antwoord:' : 'Your answer:'}</span> ${escHtml(answer)}</div>
        <div class="vd-correct-answer"><span class="vd-ans-label">${nl ? 'Correct:' : 'Correct:'}</span> ${escHtml(sent.answer)}</div>
      </div>`;
  }

  html += `<div class="vd-context">${escHtml(sent.full)}</div>`;
  html += `<button class="vd-listen-btn" id="vdListen">🔊 ${nl ? 'Luister' : 'Listen'}</button>`;

  fb.innerHTML = html;

  fb.querySelector('#vdListen').addEventListener('click', () => {
    speakText(sent.full, state.currentLanguage);
  });

  const nextBtn = document.createElement('button');
  nextBtn.className = 'vd-next-btn';
  const isLast = vd.learnSentIdx + 1 >= vd.learnSentences.length;
  nextBtn.textContent = isLast
    ? (nl ? '🏁 Resultaten' : '🏁 See results')
    : (nl ? 'Volgende →' : 'Next →');
  nextBtn.addEventListener('click', () => {
    vd.learnSentIdx++;
    renderLearnSentence(imp, perf);
    getScreen().scrollTo({ top: 0, behavior: 'smooth' });
  });
  fb.appendChild(nextBtn);
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function findVerbForSentence(sent, imp, perf) {
  // Try to match the answer to one of the verb's forms
  for (const verb of [imp, perf]) {
    for (const tense of ['present', 'past', 'future', 'imperative']) {
      if (!verb[tense]) continue;
      for (const form of Object.values(verb[tense])) {
        if (normalise(form) === normalise(sent.answer)) return verb.infinitive;
      }
    }
  }
  return imp.infinitive;
}

// ── Learn one verb: Summary ──────────────────────────────────────────────────

function showLearnSummary(imp, perf) {
  vd.learnStep = 'summary';
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const results = vd.learnResults;
  const correct = results.filter(r => r.correct).length;
  const total = results.length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const emoji = total === 0 ? '🎓' : pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪';
  const wrongResults = results.filter(r => !r.correct);

  let wrongHtml = '';
  if (wrongResults.length > 0) {
    wrongHtml = `<div class="vd-learn-section">
      <div class="vd-learn-section-title">${nl ? 'Te oefenen' : 'Needs practice'}</div>`;
    for (const r of wrongResults) {
      wrongHtml += `
        <div class="vd-learn-summary-row wrong">
          <span class="vd-learn-summary-icon">✗</span>
          <span class="vd-learn-summary-text">
            ${escHtml(r.pronoun)} — <span class="vd-learn-summary-form">${escHtml(r.correctForm)}</span>
            <span style="color:var(--gray);font-size:0.75rem"> (${escHtml(r.userAnswer)})</span>
          </span>
        </div>`;
    }
    wrongHtml += '</div>';
  }

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vdSumBack">←</button>
      <div>
        <div class="lesson-title">🎓 ${escHtml(imp.infinitive)} / ${escHtml(perf.infinitive)}</div>
        <div class="lesson-subtitle">${nl ? 'Resultaten' : 'Results'}</div>
      </div>
    </div>

    <div class="ex-score-card">
      <div class="ex-score-emoji">${emoji}</div>
      <div class="ex-score-fraction">${correct} / ${total}</div>
      <div class="ex-score-bar-wrap">
        <div class="ex-score-bar-fill" style="width: ${pct}%"></div>
      </div>
      <div class="ex-score-pct">${pct}%</div>
    </div>

    ${wrongHtml}

    <div class="vd-learn-actions">
      <button id="vdSumRetry">${nl ? '🔄 Opnieuw' : '🔄 Try again'}</button>
      <button id="vdSumPicker">← ${nl ? 'Werkwoorden' : 'Verb list'}</button>
      <button id="vdSumMenu">← Menu</button>
    </div>`;

  s.querySelector('#vdSumBack').addEventListener('click', showVerbPicker);
  s.querySelector('#vdSumRetry').addEventListener('click', () => showLearnVerb(imp, perf));
  s.querySelector('#vdSumPicker').addEventListener('click', showVerbPicker);
  s.querySelector('#vdSumMenu').addEventListener('click', showMenu);
}
