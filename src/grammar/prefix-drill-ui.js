import { state } from '../state.js';
import { escHtml, levenshtein } from '../utils.js';
import { PREFIXES, BASE_VERBS, buildPrefixDrillSet, findBaseVerb, getDistractorPrefixes, getDistractorMeanings } from '../data/prefix-verbs.js';
import { speakText } from '../voice.js';
import { recordAnswer, hasWeaknessData, getWeakVerbCount } from '../data/prefix-weakness.js';

// ── State ────────────────────────────────────────────────────────────────────

let pd = {
  questions: [],
  current:   0,
  score:     0,
  answered:  false,
  total:     25,
  mode:      'menu',        // 'menu' | 'refPrefix' | 'refVerb' | 'drill'
  refIdx:    0,
  prefixFilter: 'all',
};

const loc = field => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[state.nativeLanguage] || field.en || '';
};

function getScreen() { return document.getElementById('prefixDrillScreen'); }

const normalise = s => s.toLowerCase().replace(/['ʼ]/g, "'").replace(/\s+/g, ' ').trim();

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Count total prefixed entries
function totalEntries() {
  let n = 0;
  for (const bv of BASE_VERBS) n += bv.prefixed.length;
  return n;
}

// ── Public entry ─────────────────────────────────────────────────────────────

export function openPrefixDrillScreen() {
  window.showScreen('prefixDrillScreen');
  showMenu();
}

// ── Menu ─────────────────────────────────────────────────────────────────────

function showMenu() {
  pd.mode = 'menu';
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const count = totalEntries();

  const prefixBtns = PREFIXES.map(p =>
    `<button class="pd-filter-btn ${pd.prefixFilter === p.prefix ? 'active' : ''}" data-prefix="${escHtml(p.prefix)}">${escHtml(p.prefix)}</button>`
  ).join('');

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="pdBack">←</button>
      <div>
        <div class="lesson-title">🔗 ${nl ? 'Voorvoegsel Drill' : 'Prefix Drill'}</div>
        <div class="lesson-subtitle">${nl ? 'Leer hoe voorvoegsels werkwoorden veranderen' : 'Learn how prefixes change verb meanings'}</div>
      </div>
    </div>

    <div class="pd-stats-bar">
      <span class="pd-stat">🔗 ${PREFIXES.length} ${nl ? 'voorvoegsels' : 'prefixes'}</span>
      <span class="pd-stat">📊 ${count} ${nl ? 'combinaties' : 'combinations'}</span>
      <span class="pd-stat">🔀 ${nl ? 'Gemengd' : 'Mixed'}</span>
    </div>

    <div class="pd-filter-section">
      <div class="pd-filter-label">${nl ? 'Voorvoegsel:' : 'Prefix:'}</div>
      <div class="pd-filter-row">
        <button class="pd-filter-btn ${pd.prefixFilter === 'all' ? 'active' : ''}" data-prefix="all">${nl ? 'Alle' : 'All'}</button>
        ${prefixBtns}
      </div>
    </div>

    <div class="pd-menu-grid">
      <button class="pd-menu-card" id="pdRefPrefixBtn">
        <span class="pd-menu-icon">📖</span>
        <span class="pd-menu-title">${nl ? 'Voorvoegsels' : 'Prefixes'}</span>
        <span class="pd-menu-sub">${nl ? 'Bekijk betekenissen' : 'Browse meanings'}</span>
      </button>
      <button class="pd-menu-card" id="pdRefVerbBtn">
        <span class="pd-menu-icon">🌳</span>
        <span class="pd-menu-title">${nl ? 'Woordfamilies' : 'Word Families'}</span>
        <span class="pd-menu-sub">${nl ? 'Per werkwoord' : 'By base verb'}</span>
      </button>
      <button class="pd-menu-card pd-menu-primary" id="pdStartBtn">
        <span class="pd-menu-icon">✍️</span>
        <span class="pd-menu-title">${nl ? 'Drill' : 'Drill'}</span>
        <span class="pd-menu-sub">25 ${nl ? 'vragen' : 'questions'}</span>
      </button>
    </div>`;

  s.querySelector('#pdBack').addEventListener('click', () => window.showScreen('homeScreen'));
  s.querySelector('#pdRefPrefixBtn').addEventListener('click', () => showRefByPrefix(0));
  s.querySelector('#pdRefVerbBtn').addEventListener('click', () => showRefByVerb(0));
  s.querySelector('#pdStartBtn').addEventListener('click', startDrill);

  s.querySelectorAll('[data-prefix]').forEach(btn => {
    btn.addEventListener('click', () => {
      pd.prefixFilter = btn.dataset.prefix;
      s.querySelectorAll('[data-prefix]').forEach(b => b.classList.toggle('active', b.dataset.prefix === pd.prefixFilter));
    });
  });
}

// ── Reference: by prefix ─────────────────────────────────────────────────────

function showRefByPrefix(index) {
  pd.mode = 'refPrefix';
  pd.refIdx = index;
  if (index < 0 || index >= PREFIXES.length) return showMenu();

  const p = PREFIXES[index];
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';

  // Find all verbs using this prefix
  const entries = [];
  for (const bv of BASE_VERBS) {
    for (const pv of bv.prefixed) {
      if (pv.prefix === p.prefix) {
        entries.push({ base: bv.base, verb: pv.verb, meaning: pv.meaning });
      }
    }
  }

  let listHtml = entries.map(e =>
    `<div class="pd-ref-entry">
      <span class="pd-ref-verb">${escHtml(e.verb)}</span>
      <span class="pd-ref-meaning">${escHtml(e.base)} → ${escHtml(loc(e.meaning))}</span>
    </div>`
  ).join('');

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="pdRefBack">←</button>
      <div>
        <div class="lesson-title"><span class="pd-prefix-tag">${escHtml(p.prefix)}</span></div>
        <div class="lesson-subtitle">${escHtml(loc(p.meaning))} — ${index + 1}/${PREFIXES.length}</div>
      </div>
    </div>

    <div class="pd-ref-section">
      <div class="pd-ref-title">${entries.length} ${nl ? 'werkwoorden met' : 'verbs with'} ${escHtml(p.prefix)}</div>
      ${listHtml || `<div style="color:var(--gray)">${nl ? 'Geen werkwoorden gevonden' : 'No verbs found'}</div>`}
    </div>

    <div class="pd-ref-nav">
      <button class="pd-nav-btn" id="pdPrev" ${index === 0 ? 'disabled' : ''}>← ${nl ? 'Vorige' : 'Previous'}</button>
      <button class="pd-nav-btn" id="pdNext" ${index >= PREFIXES.length - 1 ? 'disabled' : ''}>${nl ? 'Volgende' : 'Next'} →</button>
    </div>`;

  s.querySelector('#pdRefBack').addEventListener('click', showMenu);
  if (index > 0) s.querySelector('#pdPrev').addEventListener('click', () => showRefByPrefix(index - 1));
  if (index < PREFIXES.length - 1) s.querySelector('#pdNext').addEventListener('click', () => showRefByPrefix(index + 1));
}

// ── Reference: by base verb ──────────────────────────────────────────────────

function showRefByVerb(index) {
  pd.mode = 'refVerb';
  pd.refIdx = index;
  if (index < 0 || index >= BASE_VERBS.length) return showMenu();

  const bv = BASE_VERBS[index];
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';

  let listHtml = bv.prefixed.map(pv =>
    `<div class="pd-ref-entry">
      <span class="pd-prefix-tag">${escHtml(pv.prefix)}</span>
      <span class="pd-ref-verb">${escHtml(pv.verb)}</span>
      <span class="pd-ref-meaning">${escHtml(loc(pv.meaning))}</span>
    </div>`
  ).join('');

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="pdRefBack">←</button>
      <div>
        <div class="lesson-title">🌳 ${escHtml(bv.base)}</div>
        <div class="lesson-subtitle">${escHtml(loc(bv.meaning))} — ${index + 1}/${BASE_VERBS.length}</div>
      </div>
    </div>

    <div class="pd-ref-section">
      <div class="pd-ref-title">${bv.prefixed.length} ${nl ? 'afgeleide werkwoorden' : 'derived verbs'}</div>
      ${listHtml}
    </div>

    <div class="pd-ref-nav">
      <button class="pd-nav-btn" id="pdPrev" ${index === 0 ? 'disabled' : ''}>← ${nl ? 'Vorige' : 'Previous'}</button>
      <button class="pd-nav-btn" id="pdNext" ${index >= BASE_VERBS.length - 1 ? 'disabled' : ''}>${nl ? 'Volgende' : 'Next'} →</button>
    </div>`;

  s.querySelector('#pdRefBack').addEventListener('click', showMenu);
  if (index > 0) s.querySelector('#pdPrev').addEventListener('click', () => showRefByVerb(index - 1));
  if (index < BASE_VERBS.length - 1) s.querySelector('#pdNext').addEventListener('click', () => showRefByVerb(index + 1));
}

// ── Drill ────────────────────────────────────────────────────────────────────

function startDrill() {
  pd.mode = 'drill';
  let questions = buildPrefixDrillSet(pd.total);

  if (pd.prefixFilter !== 'all') {
    questions = questions.filter(q => (q.correctPrefix || q.prefix) === pd.prefixFilter);
    if (questions.length === 0) {
      // Rebuild with only this prefix
      const filtered = [];
      for (const bv of BASE_VERBS) {
        for (const pv of bv.prefixed) {
          if (pv.prefix !== pd.prefixFilter) continue;
          filtered.push(pv);
        }
      }
      if (filtered.length === 0) { showEmptyState(); return; }
      questions = buildPrefixDrillSet(999).filter(q => (q.correctPrefix || q.prefix) === pd.prefixFilter);
    }
  }

  pd.questions = questions.slice(0, pd.total);
  if (pd.questions.length === 0) { showEmptyState(); return; }
  pd.current = 0;
  pd.score = 0;
  pd.answered = false;
  renderQuestion();
}

function showEmptyState() {
  const nl = state.nativeLanguage === 'nl';
  const s = getScreen();
  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="pdNoBack">←</button>
      <div>
        <div class="lesson-title">🔗 ${nl ? 'Voorvoegsel Drill' : 'Prefix Drill'}</div>
        <div class="lesson-subtitle">${nl ? 'Geen vragen' : 'No questions'}</div>
      </div>
    </div>
    <div class="pd-empty">
      <div class="pd-empty-icon">🤔</div>
      <div class="pd-empty-text">${nl ? 'Geen vragen voor dit filter.' : 'No questions for this filter.'}</div>
      <button class="pd-nav-btn" id="pdEmptyBack">← ${nl ? 'Terug' : 'Back'}</button>
    </div>`;
  s.querySelector('#pdNoBack').addEventListener('click', showMenu);
  s.querySelector('#pdEmptyBack').addEventListener('click', showMenu);
}

function renderQuestion() {
  pd.answered = false;
  const q = pd.questions[pd.current];

  switch (q.type) {
    case 'choose_prefix': renderChoosePrefix(q); break;
    case 'identify_meaning': renderIdentifyMeaning(q); break;
    case 'fill_blank': renderFillBlank(q); break;
    default: renderChoosePrefix(q);
  }
}

// ── Type 1: Choose prefix (MC) ───────────────────────────────────────────────

function renderChoosePrefix(q) {
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const pct = Math.round((pd.current / pd.questions.length) * 100);

  const distractors = getDistractorPrefixes(q.correctPrefix, 3);
  const options = shuffle([q.correctPrefix, ...distractors]);

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="pdDrillBack">←</button>
      <div>
        <div class="lesson-title">🔗 ${nl ? 'Voorvoegsel Drill' : 'Prefix Drill'}</div>
        <div class="lesson-subtitle">
          <div class="pd-progress-wrap"><div class="pd-progress-bar" style="width:${pct}%"></div></div>
          <div class="pd-progress-text">${pd.current + 1} / ${pd.questions.length}</div>
        </div>
      </div>
    </div>

    <div class="pd-q-card">
      <div class="pd-q-base">${escHtml(q.base)}</div>
      <div class="pd-q-meaning">${escHtml(loc(q.baseMeaning))}</div>
      <div class="pd-q-target">${nl ? 'Welk voorvoegsel maakt' : 'Which prefix makes'}: ${escHtml(loc(q.meaning))}?</div>
    </div>

    <div class="pd-options">
      ${options.map(o => `<button class="pd-option-btn" data-option="${escHtml(o)}">${escHtml(o)}${escHtml(q.base)}</button>`).join('')}
    </div>

    <div id="pdFeedback"></div>`;

  s.querySelector('#pdDrillBack').addEventListener('click', showMenu);

  s.querySelectorAll('.pd-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (pd.answered) return;
      pd.answered = true;
      const chosen = btn.dataset.option;
      const isCorrect = chosen === q.correctPrefix;
      if (isCorrect) pd.score++;
      recordAnswer(q.verb, 'choose_prefix', isCorrect);

      // Disable all buttons and highlight
      s.querySelectorAll('.pd-option-btn').forEach(b => {
        b.disabled = true;
        if (b.dataset.option === q.correctPrefix) b.classList.add('correct');
        if (b.dataset.option === chosen && !isCorrect) b.classList.add('wrong');
      });

      showDrillFeedback(isCorrect, q.verb, q.correctPrefix, q.meaning);
    });
  });
}

// ── Type 2: Identify meaning (MC) ────────────────────────────────────────────

function renderIdentifyMeaning(q) {
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const pct = Math.round((pd.current / pd.questions.length) * 100);

  const distractors = getDistractorMeanings(q.correctMeaning, 3);
  const options = shuffle([q.correctMeaning, ...distractors]);

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="pdDrillBack">←</button>
      <div>
        <div class="lesson-title">🔗 ${nl ? 'Voorvoegsel Drill' : 'Prefix Drill'}</div>
        <div class="lesson-subtitle">
          <div class="pd-progress-wrap"><div class="pd-progress-bar" style="width:${pct}%"></div></div>
          <div class="pd-progress-text">${pd.current + 1} / ${pd.questions.length}</div>
        </div>
      </div>
    </div>

    <div class="pd-q-card">
      <div class="pd-q-base"><span class="pd-prefix-tag">${escHtml(q.prefix)}</span>${escHtml(q.verb)}</div>
      <div class="pd-q-meaning">${nl ? 'Basiswerkwoord' : 'Base verb'}: ${escHtml(q.base)} — ${escHtml(loc(q.baseMeaning))}</div>
      <div class="pd-q-target">${nl ? 'Wat betekent dit werkwoord?' : 'What does this verb mean?'}</div>
    </div>

    <div class="pd-options">
      ${options.map(o => `<button class="pd-option-btn" data-meaning="${escHtml(o.en)}">${escHtml(loc(o))}</button>`).join('')}
    </div>

    <div id="pdFeedback"></div>`;

  s.querySelector('#pdDrillBack').addEventListener('click', showMenu);

  s.querySelectorAll('.pd-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (pd.answered) return;
      pd.answered = true;
      const chosenEn = btn.dataset.meaning;
      const isCorrect = chosenEn === q.correctMeaning.en;
      if (isCorrect) pd.score++;
      recordAnswer(q.verb, 'identify_meaning', isCorrect);

      s.querySelectorAll('.pd-option-btn').forEach(b => {
        b.disabled = true;
        if (b.dataset.meaning === q.correctMeaning.en) b.classList.add('correct');
        if (b.dataset.meaning === chosenEn && !isCorrect) b.classList.add('wrong');
      });

      showDrillFeedback(isCorrect, q.verb, q.prefix, q.correctMeaning);
    });
  });
}

// ── Type 3: Fill in blank (typing) ───────────────────────────────────────────

function renderFillBlank(q) {
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const pct = Math.round((pd.current / pd.questions.length) * 100);
  const trans = loc(q.translation);

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="pdDrillBack">←</button>
      <div>
        <div class="lesson-title">🔗 ${nl ? 'Voorvoegsel Drill' : 'Prefix Drill'}</div>
        <div class="lesson-subtitle">
          <div class="pd-progress-wrap"><div class="pd-progress-bar" style="width:${pct}%"></div></div>
          <div class="pd-progress-text">${pd.current + 1} / ${pd.questions.length}</div>
        </div>
      </div>
    </div>

    <div class="pd-sentence-card">
      <div class="pd-sentence-translation">${escHtml(trans)}</div>
      <div class="pd-sentence-text">${escHtml(q.sentence).replace('___', '<span class="pd-sentence-blank"></span>')}</div>
      <div class="pd-sentence-hint">
        <span class="pd-prefix-tag">${escHtml(q.prefix)}</span>
        ${escHtml(q.verb)} — ${escHtml(loc(q.meaning))}
      </div>
    </div>

    <div class="pd-input-area">
      <input type="text" class="pd-text-input" id="pdInput"
        placeholder="${nl ? 'Typ het antwoord...' : 'Type the answer...'}"
        autocomplete="off" autocorrect="off" spellcheck="false" />
      <button class="pd-check-btn" id="pdCheck">${nl ? 'Controleer ✓' : 'Check ✓'}</button>
    </div>

    <div id="pdFeedback"></div>`;

  s.querySelector('#pdDrillBack').addEventListener('click', showMenu);
  const input = s.querySelector('#pdInput');
  const check = s.querySelector('#pdCheck');

  const submit = () => {
    if (pd.answered) return;
    const answer = input.value.trim();
    if (!answer) { input.focus(); return; }
    pd.answered = true;
    input.disabled = true;
    check.disabled = true;

    const normAnswer = normalise(answer);
    const normCorrect = normalise(q.answer);
    const isExact = normAnswer === normCorrect;
    const lev = levenshtein(normAnswer, normCorrect);
    const isClose = !isExact && lev <= 1;
    const isCorrect = isExact || isClose;

    if (isCorrect) { pd.score++; input.classList.add(isExact ? 'correct' : 'close'); }
    else { input.classList.add('wrong'); }

    recordAnswer(q.verb, 'fill_blank', isCorrect);

    const fb = document.getElementById('pdFeedback');
    const resultClass = isCorrect ? 'correct' : 'wrong';
    const resultText = isExact ? '✓ Correct!' : isClose ? '✓ Almost!' : '✗ Not quite';
    let html = `<div class="ex-feedback-result ${resultClass}">${resultText}</div>`;

    if (!isExact) {
      html += `<div class="pd-answer-compare">
        <div class="pd-your-answer"><span class="pd-ans-label">${nl ? 'Jouw antwoord:' : 'Your answer:'}</span> ${escHtml(answer)}</div>
        <div class="pd-correct-answer"><span class="pd-ans-label">${nl ? 'Correct:' : 'Correct:'}</span> ${escHtml(q.answer)}</div>
      </div>`;
    }

    html += `<div class="pd-context">${escHtml(q.fullSentence)}</div>`;
    html += `<button class="pd-listen-btn" id="pdListen">🔊 ${nl ? 'Luister' : 'Listen'}</button>`;
    fb.innerHTML = html;

    fb.querySelector('#pdListen').addEventListener('click', () => speakText(q.fullSentence, state.currentLanguage));
    appendNextBtn(fb);
  };

  check.addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
  input.focus();
}

// ── Shared feedback & navigation ─────────────────────────────────────────────

function showDrillFeedback(isCorrect, verb, prefix, meaning) {
  const fb = document.getElementById('pdFeedback');
  const nl = state.nativeLanguage === 'nl';
  const resultClass = isCorrect ? 'correct' : 'wrong';
  const resultText = isCorrect
    ? '✓ ' + (nl ? 'Correct!' : 'Correct!')
    : '✗ ' + (nl ? 'Niet helemaal' : 'Not quite');

  let html = `<div class="ex-feedback-result ${resultClass}">${resultText}</div>`;
  html += `<div class="pd-context"><span class="pd-prefix-tag">${escHtml(prefix)}</span> ${escHtml(verb)} = ${escHtml(loc(meaning))}</div>`;
  html += `<button class="pd-listen-btn" id="pdListen">🔊 ${nl ? 'Luister' : 'Listen'}</button>`;
  fb.innerHTML = html;

  fb.querySelector('#pdListen').addEventListener('click', () => speakText(verb, state.currentLanguage));
  appendNextBtn(fb);
}

function appendNextBtn(container) {
  const nl = state.nativeLanguage === 'nl';
  const isLast = pd.current + 1 >= pd.questions.length;
  const btn = document.createElement('button');
  btn.className = 'pd-next-btn';
  btn.textContent = isLast ? (nl ? '🏁 Resultaten' : '🏁 See results') : (nl ? 'Volgende →' : 'Next →');
  btn.addEventListener('click', () => {
    if (isLast) { showScore(); }
    else { pd.current++; renderQuestion(); getScreen().scrollTo({ top: 0, behavior: 'smooth' }); }
  });
  container.appendChild(btn);
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Score ─────────────────────────────────────────────────────────────────────

function showScore() {
  const total = pd.questions.length;
  const score = pd.score;
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
      <button class="back-btn" id="pdScoreBack">←</button>
      <div>
        <div class="lesson-title">🔗 ${nl ? 'Resultaten' : 'Results'}</div>
        <div class="lesson-subtitle">${nl ? 'Voorvoegsel Drill' : 'Prefix Drill'}</div>
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
        <button class="ex-next-btn" id="pdRetry">🔄 ${nl ? 'Opnieuw' : 'Try again'}</button>
        <button class="ex-back-btn" id="pdBackMenu">← Menu</button>
      </div>
    </div>`;

  s.querySelector('#pdScoreBack').addEventListener('click', showMenu);
  s.querySelector('#pdRetry').addEventListener('click', startDrill);
  s.querySelector('#pdBackMenu').addEventListener('click', showMenu);
}
