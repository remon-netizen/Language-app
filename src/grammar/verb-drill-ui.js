import { state } from '../state.js';
import { escHtml, levenshtein } from '../utils.js';
import { CONJUGATIONS, buildDrillSet, findVerb } from '../data/verb-conjugations.js';
import { speakText } from '../voice.js';

// ── State ────────────────────────────────────────────────────────────────────

let vd = {
  questions: [],
  current:   0,
  score:     0,
  answered:  false,
  total:     25,
  mode:      'menu',      // 'menu' | 'reference' | 'drill'
  refIdx:    0,            // current verb index in reference mode
  filter:    'all',        // 'all' | 'imperfective' | 'perfective'
  tenseFilter: 'all',     // 'all' | 'present' | 'past' | 'future' | 'imperative'
};

const loc = field => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[state.nativeLanguage] || field.en || '';
};

function getScreen() { return document.getElementById('verbDrillScreen'); }

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

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vdBack">←</button>
      <div>
        <div class="lesson-title">✍️ ${nl ? 'Werkwoord Drill' : 'Verb Conjugation Drill'}</div>
        <div class="lesson-subtitle">${nl ? 'Oefen werkwoordsvormen door te schrijven' : 'Practice verb forms by typing'}</div>
      </div>
    </div>

    <div class="vd-stats-bar">
      <span class="vd-stat">📊 40 ${nl ? 'werkwoorden' : 'verbs'}</span>
      <span class="vd-stat">🎯 600 ${nl ? 'vormen' : 'forms'}</span>
      <span class="vd-stat">🔀 ${nl ? 'Willekeurig' : 'Randomised'}</span>
    </div>

    <div class="vd-filter-section">
      <div class="vd-filter-label">${nl ? 'Aspect:' : 'Aspect:'}</div>
      <div class="vd-filter-row">
        <button class="vd-filter-btn ${vd.filter === 'all' ? 'active' : ''}" data-filter="all">${nl ? 'Alle' : 'All'}</button>
        <button class="vd-filter-btn ${vd.filter === 'imperfective' ? 'active' : ''}" data-filter="imperfective">${nl ? 'Onvoltooid' : 'Imperfective'}</button>
        <button class="vd-filter-btn ${vd.filter === 'perfective' ? 'active' : ''}" data-filter="perfective">${nl ? 'Voltooid' : 'Perfective'}</button>
      </div>
      <div class="vd-filter-label" style="margin-top:10px">${nl ? 'Tijd:' : 'Tense:'}</div>
      <div class="vd-filter-row">
        <button class="vd-filter-btn ${vd.tenseFilter === 'all' ? 'active' : ''}" data-tense="all">${nl ? 'Alle' : 'All'}</button>
        <button class="vd-filter-btn ${vd.tenseFilter === 'present' ? 'active' : ''}" data-tense="present">${nl ? 'Heden' : 'Present'}</button>
        <button class="vd-filter-btn ${vd.tenseFilter === 'past' ? 'active' : ''}" data-tense="past">${nl ? 'Verleden' : 'Past'}</button>
        <button class="vd-filter-btn ${vd.tenseFilter === 'future' ? 'active' : ''}" data-tense="future">${nl ? 'Toekomst' : 'Future'}</button>
        <button class="vd-filter-btn ${vd.tenseFilter === 'imperative' ? 'active' : ''}" data-tense="imperative">${nl ? 'Gebiedend' : 'Imperative'}</button>
      </div>
    </div>

    <div class="vd-menu-grid">
      <button class="vd-menu-card" id="vdRefBtn">
        <span class="vd-menu-icon">📖</span>
        <span class="vd-menu-title">${nl ? 'Werkwoord-tabel' : 'Verb Tables'}</span>
        <span class="vd-menu-sub">${nl ? 'Bekijk alle vervoegingen' : 'Browse all conjugations'}</span>
      </button>
      <button class="vd-menu-card vd-menu-primary" id="vdStartBtn">
        <span class="vd-menu-icon">✍️</span>
        <span class="vd-menu-title">${nl ? 'Start Drill' : 'Start Drill'}</span>
        <span class="vd-menu-sub">25 ${nl ? 'willekeurige vragen' : 'randomised questions'}</span>
      </button>
    </div>`;

  s.querySelector('#vdBack').addEventListener('click', () => window.showScreen('homeScreen'));
  s.querySelector('#vdRefBtn').addEventListener('click', () => showReference(0));
  s.querySelector('#vdStartBtn').addEventListener('click', startDrill);

  // Aspect filter
  s.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      vd.filter = btn.dataset.filter;
      s.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === vd.filter));
    });
  });
  // Tense filter
  s.querySelectorAll('[data-tense]').forEach(btn => {
    btn.addEventListener('click', () => {
      vd.tenseFilter = btn.dataset.tense;
      s.querySelectorAll('[data-tense]').forEach(b => b.classList.toggle('active', b.dataset.tense === vd.tenseFilter));
    });
  });
}

// ── Reference tables ─────────────────────────────────────────────────────────

function showReference(index) {
  vd.mode = 'reference';
  vd.refIdx = index;
  // Show pairs: index 0 = verbs 0&1, index 1 = verbs 2&3, etc.
  const pairIdx = index;
  const imp = CONJUGATIONS[pairIdx * 2];
  const perf = CONJUGATIONS[pairIdx * 2 + 1];
  if (!imp || !perf) return showMenu();

  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const totalPairs = CONJUGATIONS.length / 2;

  const renderTable = (verb, label) => {
    if (!verb) return '';
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
  };

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
  // Build filtered drill set
  let questions = buildDrillSet(9999); // get all, then filter
  if (vd.filter !== 'all') {
    questions = questions.filter(q => q.aspect === vd.filter);
  }
  if (vd.tenseFilter !== 'all') {
    questions = questions.filter(q => q.tense === vd.tenseFilter);
  }
  if (questions.length === 0) {
    // No questions match filter (e.g. perfective + present)
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
          ? 'Voltooide werkwoorden hebben geen tegenwoordige tijd! Kies een andere combinatie.'
          : 'Perfective verbs have no present tense! Choose a different combination.'}</div>
        <button class="vd-nav-btn" id="vdEmptyBack">← ${nl ? 'Terug' : 'Back'}</button>
      </div>`;
    s.querySelector('#vdNoBack').addEventListener('click', showMenu);
    s.querySelector('#vdEmptyBack').addEventListener('click', showMenu);
    return;
  }

  vd.questions = questions.slice(0, vd.total);
  vd.current = 0;
  vd.score = 0;
  vd.answered = false;
  renderDrillQuestion();
}

function renderDrillQuestion() {
  vd.answered = false;
  const q = vd.questions[vd.current];
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

  const normalise = s => s.toLowerCase().replace(/['ʼ]/g, "'").replace(/\s+/g, ' ').trim();
  const normAnswer = normalise(answer);
  const normCorrect = normalise(q.correctForm);

  const isExact = normAnswer === normCorrect;
  const lev = levenshtein(normAnswer, normCorrect);
  const isClose = !isExact && lev <= 1;

  if (isExact || isClose) {
    vd.score++;
    input.classList.add(isExact ? 'correct' : 'close');
  } else {
    input.classList.add('wrong');
  }

  const fb = document.getElementById('vdFeedback');
  const nl = state.nativeLanguage === 'nl';

  const resultClass = (isExact || isClose) ? 'correct' : 'wrong';
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

  // Show full conjugation table for this tense, highlighting the correct row
  const verb = findVerb(q.infinitive);
  if (verb && verb[q.tense]) {
    const tenseNames = {
      present:    { en: 'Present', nl: 'Tegenwoordige tijd' },
      past:       { en: 'Past', nl: 'Verleden tijd' },
      future:     { en: 'Future', nl: 'Toekomst' },
      imperative: { en: 'Imperative', nl: 'Gebiedende wijs' },
    };
    const tenseName = loc(tenseNames[q.tense]);
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
    // Speak the pronoun + form together
    const text = q.tense === 'imperative' ? q.correctForm : `${q.pronoun} ${q.correctForm}`;
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
