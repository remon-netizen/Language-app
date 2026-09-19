import { state } from '../state.js';
import { escHtml, levenshtein } from '../utils.js';
import { speakText } from '../voice.js';
import { CATEGORIES, getCategory, referenceRows, TIME_PATTERNS, ordinalSuffix, GENDER_LABEL, timeGloss, MONTHS } from '../data/numbers-time.js';
import { recordAnswer, weight, weakKeys, totalAttempts } from '../data/numbers-weakness.js';
import { STAGES } from '../data/numbers-course.js';
import { recordNumber, dueNumbers, unseenNumbers, numbersStats } from '../data/numbers-progress.js';

// ── State ────────────────────────────────────────────────────────────────────

const PREFS_KEY = 'numbersDrillPrefs';

let nd = {
  cats:      ['small'],   // selected category ids
  // 'type' (digits → word) | 'read' (word → digits, typed) | 'mixed' (those two)
  // | 'listen' (audio → digits) | 'dictate' (audio → word) | 'choose' (word → digits, four options)
  qMode:     'type',
  session:   'drill',     // 'drill' (random, weighted) | 'new' (next course stage) | 'due' (scheduled review)
  total:     25,
  questions: [],
  current:   0,
  score:     0,
  answered:  false,
  missed:    [],
  refIdx:    0,
  keyHandler: null,
};

function loadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY));
    if (!p) return;
    if (Array.isArray(p.cats) && p.cats.length) nd.cats = p.cats.filter(id => getCategory(id));
    if (['type', 'read', 'mixed', 'choose', 'listen', 'dictate'].includes(p.qMode)) nd.qMode = p.qMode;
    if ([10, 25, 50].includes(p.total)) nd.total = p.total;
  } catch { /* ignore */ }
  if (!nd.cats.length) nd.cats = ['small'];
}
function savePrefs() {
  localStorage.setItem(PREFS_KEY, JSON.stringify({ cats: nd.cats, qMode: nd.qMode, total: nd.total }));
}

const loc = field => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[state.nativeLanguage] || field.en || '';
};

function getScreen() { return document.getElementById('numbersDrillScreen'); }

// Apostrophe variants (’ ʼ ` ´) all count as the Ukrainian apostrophe.
const normalise = s => s.toLowerCase().replace(/[’ʼ`´‘]/g, "'").replace(/\s+/g, ' ').trim();

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Prompt labels ────────────────────────────────────────────────────────────

// What the learner sees for an item: "17", "3rd", "7:30", "at 7:30".
function promptText(item) {
  const nl = state.nativeLanguage === 'nl';
  switch (item.kind) {
    case 'ordinal': return ordinalSuffix(item.value, state.nativeLanguage);
    case 'attime':  return `${nl ? 'om' : 'at'} ${item.prompt}`;
    case 'date':    return `${item.d} ${nl ? MONTHS[item.m - 1].nl : MONTHS[item.m - 1].en}`;
    default:        return item.prompt;
  }
}

// Secondary line under the prompt: gender for ordinals, spoken gloss for times.
function promptHint(item) {
  if (item.kind === 'ordinal') return loc(GENDER_LABEL[item.gender]);
  if (item.kind === 'time' || item.kind === 'attime') return timeGloss(item.h, item.m, state.nativeLanguage);
  return '';
}

// The Ukrainian question this item answers.
function questionWord(item) {
  switch (item.kind) {
    case 'cardinal': return 'Скільки?';
    case 'ordinal':  return item.gender === 'f' ? 'Яка?' : item.gender === 'n' ? 'Яке?' : 'Який?';
    case 'time':     return 'Котра година?';
    case 'attime':   return 'О котрій годині?';
    case 'date':     return 'Яке сьогодні число?';
  }
  return '';
}

// Short gender tag for multiple-choice options.
const genderTag = g => ({ m: 'm', f: 'f', n: 'n' })[g] || '';

function optionLabel(item) {
  let label = promptText(item);
  if (item.kind === 'ordinal') label += ` (${genderTag(item.gender)})`;
  return label;
}

// Analogue clock for time prompts.
function clockSvg(h, m) {
  const hourAngle = ((h % 12) + m / 60) * 30;
  const minAngle  = m * 6;
  const hand = (angle, len, w, cls) => {
    const rad = (angle - 90) * Math.PI / 180;
    const x = 50 + len * Math.cos(rad), y = 50 + len * Math.sin(rad);
    return `<line x1="50" y1="50" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke-width="${w}" stroke-linecap="round" class="${cls}"/>`;
  };
  let ticks = '';
  for (let i = 0; i < 12; i++) {
    const rad = i * 30 * Math.PI / 180;
    const big = i % 3 === 0;
    const r1 = big ? 40 : 43;
    ticks += `<line x1="${(50 + r1 * Math.sin(rad)).toFixed(1)}" y1="${(50 - r1 * Math.cos(rad)).toFixed(1)}" x2="${(50 + 46 * Math.sin(rad)).toFixed(1)}" y2="${(50 - 46 * Math.cos(rad)).toFixed(1)}" stroke-width="${big ? 3 : 1.5}" class="nd-clock-tick"/>`;
  }
  return `<svg class="nd-clock" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="48" class="nd-clock-face"/>
    ${ticks}
    ${hand(hourAngle, 26, 5, 'nd-clock-hour')}
    ${hand(minAngle, 38, 3, 'nd-clock-min')}
    <circle cx="50" cy="50" r="3" class="nd-clock-pin"/>
  </svg>`;
}

// ── Public entry ─────────────────────────────────────────────────────────────

export function openNumbersDrillScreen() {
  loadPrefs();
  window.showScreen('numbersDrillScreen');
  showMenu();
}

// Review-hub entry: only what the schedule says is due.
export function startNumbersReview() {
  loadPrefs();
  window.showScreen('numbersDrillScreen');
  startCourse('due');
}

// ── Menu ─────────────────────────────────────────────────────────────────────

function showMenu() {
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const weak = weakKeys().length;
  const done = totalAttempts();
  const st = numbersStats();
  const stage = nextStage();

  const catCards = CATEGORIES.map(c => `
    <div class="nd-cat-card ${nd.cats.includes(c.id) ? 'active' : ''}" data-cat="${c.id}">
      <span class="nd-cat-check">${nd.cats.includes(c.id) ? '✓' : ''}</span>
      <span class="nd-cat-icon">${c.icon}</span>
      <span class="nd-cat-text">
        <span class="nd-cat-title">${escHtml(loc(c.title))}</span>
        <span class="nd-cat-sub">${escHtml(loc(c.sub))}</span>
      </span>
      <button class="nd-cat-study" data-study="${c.id}" title="${nl ? 'Bekijk de tabel' : 'Study the table'}">📖</button>
    </div>`).join('');

  const modeBtn = (id, icon, label, sub) => `
    <button class="nd-mode-btn ${nd.qMode === id ? 'active' : ''}" data-mode="${id}">
      <span class="nd-mode-icon">${icon}</span>
      <span class="nd-mode-label">${label}</span>
      <span class="nd-mode-sub">${sub}</span>
    </button>`;

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="ndBack">←</button>
      <div>
        <div class="lesson-title">🔢 ${nl ? 'Getallen & Tijd Drill' : 'Numbers & Time Drill'}</div>
        <div class="lesson-subtitle">${nl ? 'Eén woord per keer: getallen, rangtelwoorden, kloktijden' : 'One word at a time: numbers, ordinals, clock times'}</div>
      </div>
    </div>

    <div class="nd-stats-bar">
      <span class="nd-stat">✅ ${done} ${nl ? 'beantwoord' : 'answered'}</span>
      <span class="nd-stat ${weak ? 'nd-stat-weak' : ''}">🎯 ${weak} ${nl ? 'zwakke plekken' : 'weak spots'}</span>
    </div>

    <div class="nd-section-label">${nl ? 'Hoe?' : 'How?'}</div>
    <div class="nd-mode-row">
      ${modeBtn('type',   '✍️', '12 → UK', nl ? 'typ het woord' : 'type the word')}
      ${modeBtn('read',   '💡', 'UK → 12', nl ? 'typ het cijfer' : 'type the digits')}
      ${modeBtn('mixed',  '🔀', nl ? 'Beide kanten' : 'Both ways', nl ? 'typen, door elkaar' : 'typed, mixed')}
      ${modeBtn('listen', '👂', nl ? 'Luisteren' : 'Listen', nl ? 'geluid → cijfer' : 'audio → digits')}
      ${modeBtn('dictate', '👂✍️', nl ? 'Dictee' : 'Dictation', nl ? 'geluid → woord' : 'audio → word')}
      ${modeBtn('choose', '👆', nl ? 'Kiezen' : 'Choose', nl ? 'woord → cijfer' : 'word → digits')}
    </div>

    <div class="nd-section-label">${nl ? 'Leren, stap voor stap' : 'Learn, step by step'}</div>
    <div class="nd-course-stats">📚 ${st.seen} ${nl ? 'gezien' : 'seen'} · ${st.learned} ${nl ? 'geleerd' : 'learned'} / ${st.total}</div>
    <div class="nd-course-grid">
      <button class="nd-course-card nd-course-primary" id="ndLearn" ${stage ? '' : 'disabled'}>
        <span class="nd-course-icon">${stage ? stage.icon : '🏁'}</span>
        <span class="nd-course-title">${stage ? `${nl ? 'Leer' : 'Learn'}: ${escHtml(loc(stage.title))}` : (nl ? 'Alles gezien' : 'Everything seen')}</span>
        <span class="nd-course-sub">${stage ? `${stage.fresh.length} ${nl ? 'nieuw' : 'new'} · ${nl ? 'stap' : 'step'} ${stage.index + 1}/${STAGES.length}` : (nl ? 'Blijf herhalen en drillen' : 'Keep reviewing and drilling')}</span>
      </button>
      <button class="nd-course-card" id="ndDue" ${st.due ? '' : 'disabled'}>
        <span class="nd-course-icon">🔄</span>
        <span class="nd-course-title">${nl ? 'Herhalen' : 'Review due'}</span>
        <span class="nd-course-sub">${st.due} ${nl ? 'aan de beurt' : 'due'}</span>
      </button>
    </div>
    <button class="nd-path-btn" id="ndPath">🗺️ ${nl ? 'Bekijk het leerpad' : 'See the learning path'}</button>

    <div class="nd-section-label">${nl ? 'Vrij oefenen: willekeurige vragen' : 'Free practice: random questions'}</div>
    <div class="nd-cat-grid">${catCards}</div>

    <div class="nd-length-row">
      <span class="nd-length-label">${nl ? 'Aantal:' : 'Questions:'}</span>
      ${[10, 25, 50].map(n => `<button class="nd-length-btn ${nd.total === n ? 'active' : ''}" data-total="${n}">${n}</button>`).join('')}
    </div>

    <button class="nd-start-btn" id="ndStart">▶ ${nl ? 'Start' : 'Start'}</button>`;

  s.querySelector('#ndBack').addEventListener('click', () => window.openExercisesScreen());
  s.querySelector('#ndStart').addEventListener('click', startDrill);
  s.querySelector('#ndLearn').addEventListener('click', () => startCourse('new'));
  s.querySelector('#ndDue').addEventListener('click', () => startCourse('due'));
  s.querySelector('#ndPath').addEventListener('click', showPath);

  s.querySelectorAll('.nd-cat-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('[data-study]')) return;
      const id = card.dataset.cat;
      if (nd.cats.includes(id)) {
        if (nd.cats.length === 1) return; // keep at least one
        nd.cats = nd.cats.filter(c => c !== id);
      } else {
        nd.cats = [...nd.cats, id];
      }
      savePrefs();
      card.classList.toggle('active', nd.cats.includes(id));
      card.querySelector('.nd-cat-check').textContent = nd.cats.includes(id) ? '✓' : '';
    });
  });
  s.querySelectorAll('[data-study]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      showReference(CATEGORIES.findIndex(c => c.id === btn.dataset.study));
    });
  });
  s.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      nd.qMode = btn.dataset.mode;
      savePrefs();
      s.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('active', b.dataset.mode === nd.qMode));
    });
  });
  s.querySelectorAll('[data-total]').forEach(btn => {
    btn.addEventListener('click', () => {
      nd.total = Number(btn.dataset.total);
      savePrefs();
      s.querySelectorAll('[data-total]').forEach(b => b.classList.toggle('active', Number(b.dataset.total) === nd.total));
    });
  });
}

// ── Reference ────────────────────────────────────────────────────────────────

function showReference(index) {
  if (index < 0 || index >= CATEGORIES.length) return showMenu();
  nd.refIdx = index;
  const c = CATEGORIES[index];
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const isTime = c.id === 'time' || c.id === 'attime';

  const patterns = isTime ? `
    <div class="nd-ref-section">
      <div class="nd-ref-title">${nl ? 'De patronen' : 'The patterns'}</div>
      ${TIME_PATTERNS.map(p => `
        <div class="nd-ref-row">
          <span class="nd-ref-left">${escHtml(p.ex)}</span>
          <span class="nd-ref-right">${escHtml(p.uk)}</span>
          <span class="nd-ref-extra">${escHtml(nl ? p.nl : p.en)}</span>
          <button class="nd-ref-speak" data-say="${escHtml(p.uk)}">🔊</button>
        </div>`).join('')}
    </div>` : '';

  const rows = referenceRows(c.id).map(r => `
    <div class="nd-ref-row">
      <span class="nd-ref-left">${escHtml(r.left)}</span>
      <span class="nd-ref-right">${escHtml(r.right)}</span>
      <span class="nd-ref-extra">${escHtml(r.extra || '')}</span>
      <button class="nd-ref-speak" data-say="${escHtml(r.right)}">🔊</button>
    </div>`).join('');

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="ndRefBack">←</button>
      <div>
        <div class="lesson-title">${c.icon} ${escHtml(loc(c.title))}</div>
        <div class="lesson-subtitle">${escHtml(loc(c.sub))} — ${index + 1}/${CATEGORIES.length}</div>
      </div>
    </div>

    ${patterns}

    <div class="nd-ref-section">
      <div class="nd-ref-title">${isTime ? (nl ? 'Alle uren' : 'All hours') : (nl ? 'De woorden' : 'The words')}</div>
      ${rows}
    </div>

    <div class="nd-ref-nav">
      <button class="nd-nav-btn" id="ndPrev" ${index === 0 ? 'disabled' : ''}>← ${nl ? 'Vorige' : 'Previous'}</button>
      <button class="nd-nav-btn nd-nav-primary" id="ndRefDrill">✍️ ${nl ? 'Oefen dit' : 'Drill this'}</button>
      <button class="nd-nav-btn" id="ndNext" ${index >= CATEGORIES.length - 1 ? 'disabled' : ''}>${nl ? 'Volgende' : 'Next'} →</button>
    </div>`;

  s.querySelector('#ndRefBack').addEventListener('click', showMenu);
  s.querySelector('#ndRefDrill').addEventListener('click', () => {
    nd.cats = [c.id]; savePrefs(); startDrill();
  });
  if (index > 0) s.querySelector('#ndPrev').addEventListener('click', () => showReference(index - 1));
  if (index < CATEGORIES.length - 1) s.querySelector('#ndNext').addEventListener('click', () => showReference(index + 1));
  s.querySelectorAll('[data-say]').forEach(btn => {
    btn.addEventListener('click', () => speakText(btn.dataset.say, state.currentLanguage));
  });
  s.scrollTo({ top: 0 });
}

// ── Building a drill ─────────────────────────────────────────────────────────

// Weighted sample without replacement; wraps around if the pool is too small.
function weightedSample(pool, n) {
  let remaining = pool.map(item => ({ item, w: weight(item.key) }));
  const out = [];
  while (out.length < n && pool.length) {
    if (!remaining.length) remaining = pool.map(item => ({ item, w: weight(item.key) }));
    const total = remaining.reduce((s, r) => s + r.w, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < remaining.length - 1; idx++) { r -= remaining[idx].w; if (r <= 0) break; }
    out.push(remaining[idx].item);
    remaining.splice(idx, 1);
  }
  return out;
}

function buildQuestions() {
  const cats = nd.cats.map(getCategory).filter(Boolean);
  const pools = cats.map(c => ({ cat: c, pool: c.items() }));
  // Split the question count evenly across categories so a big category
  // (144 clock times) doesn't drown a small one (21 numbers).
  const per = Math.ceil(nd.total / pools.length);
  let questions = [];
  for (const { cat, pool } of pools) {
    for (const item of weightedSample(pool, per)) {
      questions.push({ item, pool, catId: cat.id });
    }
  }
  return shuffle(questions).slice(0, nd.total);
}

// ── The course ───────────────────────────────────────────────────────────────

const MAX_NEW = 12;

// The first stage that still holds unseen items, and those items.
function nextStage() {
  const unseen = new Set(unseenNumbers().map(c => c.item.key));
  const index = STAGES.findIndex(st => st.items.some(i => unseen.has(i.key)));
  if (index === -1) return null;
  return { ...STAGES[index], index, fresh: STAGES[index].items.filter(i => unseen.has(i.key)) };
}

// How a question is asked when the mode leaves a choice.
function modeFor() {
  return nd.qMode === 'mixed' ? (Math.random() < 0.5 ? 'read' : 'type') : nd.qMode;
}

// 'new': the next stage, at most 12 items. Each is shown with its word first
//        (hear it, copy it), then asked from memory: once in the chosen mode, or
//        word → digits followed by digits → word in 'mixed'.
// 'due': whatever the schedule says is due, at most 30.
function startCourse(kind) {
  let questions;
  if (kind === 'new') {
    const stage = nextStage();
    if (!stage) return showMenu();
    const items = stage.fresh.slice(0, MAX_NEW);
    const pool = stage.items;
    const ask = mode => shuffle(items).map(item => ({ item, pool, catId: stage.id, mode }));
    const passes = nd.qMode === 'mixed' ? ['read', 'type'] : [nd.qMode];
    questions = nd.qMode === 'choose'
      ? ask('choose')
      : [...items.map(item => ({ item, pool, catId: stage.id, mode: 'type', intro: true })), ...passes.flatMap(ask)];
  } else {
    questions = shuffle(dueNumbers()).slice(0, 30).map(c => ({ item: c.item, pool: c.stage.items, catId: c.stage.id, mode: modeFor() }));
  }
  if (!questions.length) return showMenu();
  nd.session = kind;
  nd.questions = questions;
  nd.current = 0; nd.score = 0; nd.missed = []; nd.answered = false;
  renderQuestion();
}

// One place for both records: the weak-spot counter every drill feeds, and the
// course schedule. Introduction cards are copying, so they count for neither.
function record(q, isCorrect, quality) {
  if (q.intro) return;
  recordAnswer(q.item.key, isCorrect);
  recordNumber(q.item.key, quality);
}

function showPath() {
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const unseen = new Set(unseenNumbers().map(c => c.item.key));
  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="ndPathBack">←</button>
      <div>
        <div class="lesson-title">🗺️ ${nl ? 'Leerpad' : 'Learning path'}</div>
        <div class="lesson-subtitle">${STAGES.length} ${nl ? 'stappen' : 'steps'} · ${nl ? 'van нуль tot двадцять п\'яте грудня' : 'from нуль to двадцять п\'яте грудня'}</div>
      </div>
    </div>
    ${STAGES.map((st, i) => {
      const seen = st.items.filter(it => !unseen.has(it.key)).length;
      return `
      <div class="nd-ref-section">
        <div class="nd-ref-title">${st.icon} ${i + 1}. ${escHtml(loc(st.title))} <span class="nd-path-count">${seen}/${st.items.length}</span></div>
        ${st.items.map(it => `
          <div class="nd-ref-row ${unseen.has(it.key) ? '' : 'nd-path-seen'}">
            <span class="nd-ref-left">${escHtml(optionLabel(it))}</span>
            <span class="nd-ref-right">${escHtml(it.answers[0])}</span>
            <span class="nd-ref-extra">${unseen.has(it.key) ? '' : '✓'}</span>
            <button class="nd-ref-speak" data-say="${escHtml(it.answers[0])}">🔊</button>
          </div>`).join('')}
      </div>`; }).join('')}`;
  s.querySelector('#ndPathBack').addEventListener('click', showMenu);
  s.querySelectorAll('[data-say]').forEach(btn => btn.addEventListener('click', () => speakText(btn.dataset.say, state.currentLanguage)));
  s.scrollTo({ top: 0 });
}

function startDrill() {
  nd.session = 'drill';
  nd.questions = buildQuestions().map(q => ({ ...q, mode: modeFor() }));
  if (!nd.questions.length) return showMenu();
  nd.current = 0;
  nd.score = 0;
  nd.missed = [];
  nd.answered = false;
  renderQuestion();
}

// ── Question rendering ───────────────────────────────────────────────────────

function headerHtml() {
  const nl = state.nativeLanguage === 'nl';
  const pct = Math.round((nd.current / nd.questions.length) * 100);
  return `
    <div class="lesson-header">
      <button class="back-btn" id="ndDrillBack">←</button>
      <div>
        <div class="lesson-title">🔢 ${nl ? 'Getallen & Tijd Drill' : 'Numbers & Time Drill'}</div>
        <div class="lesson-subtitle">
          <div class="nd-progress-wrap"><div class="nd-progress-bar" style="width:${pct}%"></div></div>
          <div class="nd-progress-text">${nd.current + 1} / ${nd.questions.length}</div>
        </div>
      </div>
    </div>`;
}

function renderQuestion() {
  nd.answered = false;
  const q = nd.questions[nd.current];
  if (q.mode === 'choose') renderChoose(q);
  else if (q.mode === 'listen') renderListen(q);
  else if (q.mode === 'read') renderListen(q, { read: true });
  else if (q.mode === 'dictate') renderType(q, { dictation: true });
  else renderType(q);
}

// Prompt card: big digits / "3rd" / "7:30" with clock, plus the question word.
function promptCard(item, { hideClock = false, intro = false } = {}) {
  const isTime = item.kind === 'time' || item.kind === 'attime';
  const hint = promptHint(item);
  const nl = state.nativeLanguage === 'nl';
  return `
    <div class="nd-q-card ${intro ? 'nd-q-intro' : ''}">
      ${intro ? `<div class="nd-q-badge">✨ ${nl ? 'Nieuw' : 'New'}</div>` : ''}
      <div class="nd-q-question">${escHtml(questionWord(item))}</div>
      <div class="nd-q-main">
        ${isTime && !hideClock ? clockSvg(item.h, item.m) : ''}
        <div class="nd-q-prompt ${item.kind === 'cardinal' && item.value >= 1000 ? 'nd-q-prompt-long' : ''}">${escHtml(promptText(item))}</div>
      </div>
      ${hint ? `<div class="nd-q-hint">${escHtml(hint)}</div>` : ''}
      ${intro ? `<div class="nd-q-word">${escHtml(item.answers[0])} <button class="nd-say-inline" id="ndSayIntro" type="button">🔊</button></div>
                 <div class="nd-q-hint">${nl ? 'Zeg het, typ het dan' : 'Say it, then type it'}</div>` : ''}
    </div>`;
}

// Mode 1: see the digits, type the Ukrainian word.
// With dictation on, the word is spoken and the digits are hidden: type what you hear.
function renderType(q, { dictation = false } = {}) {
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const word = q.item.answers[0];
  s.innerHTML = `
    ${headerHtml()}
    ${dictation ? `
    <div class="nd-q-card nd-q-card-listen">
      <div class="nd-q-question">${escHtml(questionWord(q.item))}</div>
      <button class="nd-big-listen" id="ndSay">🔊</button>
      <div class="nd-q-hint">${nl ? 'Typ wat je hoort' : 'Type what you hear'}</div>
    </div>` : promptCard(q.item, { intro: q.intro })}
    <div class="nd-input-area">
      <input type="text" class="nd-text-input" id="ndInput" lang="uk"
        placeholder="${nl ? 'Typ het in het Oekraïens…' : 'Type it in Ukrainian…'}"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
      <button class="nd-check-btn" id="ndCheck">${nl ? 'Controleer ✓' : 'Check ✓'}</button>
    </div>
    <div id="ndFeedback"></div>`;

  s.querySelector('#ndDrillBack').addEventListener('click', showMenu);
  if (dictation) {
    const say = () => speakText(word, state.currentLanguage);
    s.querySelector('#ndSay').addEventListener('click', say);
    say();
  }
  if (q.intro) {
    const say = () => speakText(word, state.currentLanguage);
    s.querySelector('#ndSayIntro').addEventListener('click', say);
    setTimeout(say, 200);
  }
  const input = s.querySelector('#ndInput');
  const check = s.querySelector('#ndCheck');

  const submit = () => {
    if (nd.answered) return;
    const answer = input.value.trim();
    if (!answer) { input.focus(); return; }
    nd.answered = true;
    input.disabled = true; check.disabled = true;

    const normAnswer = normalise(answer);
    const isExact = q.item.answers.some(a => normalise(a) === normAnswer);
    // Typo tolerance only on longer words: два/дві, три/тре are real errors.
    const isClose = !isExact && q.item.answers.some(a => a.length >= 5 && levenshtein(normalise(a), normAnswer) <= 1);
    const isCorrect = isExact || isClose;
    if (isCorrect) nd.score++;
    input.classList.add(isExact ? 'correct' : isClose ? 'close' : 'wrong');
    record(q, isCorrect, isExact ? 5 : isClose ? 3 : 1);
    showFeedback(q, { isCorrect, isExact, answer });
  };
  check.addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
  input.focus();
}

// Mode 2: see the Ukrainian word, pick the right digits.
function renderChoose(q) {
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const options = shuffle([q.item, ...distractors(q)]);
  const word = q.item.answers[0];

  s.innerHTML = `
    ${headerHtml()}
    <div class="nd-q-card">
      <div class="nd-q-question">${escHtml(questionWord(q.item))}</div>
      <div class="nd-q-word">${escHtml(word)}</div>
      <button class="nd-listen-btn nd-listen-inline" id="ndSay">🔊 ${nl ? 'Luister' : 'Listen'}</button>
    </div>
    <div class="nd-options">
      ${options.map((o, i) => `<button class="nd-option-btn" data-idx="${i}" data-key="${escHtml(o.key)}">${escHtml(optionLabel(o))}</button>`).join('')}
    </div>
    <div id="ndFeedback"></div>`;

  s.querySelector('#ndDrillBack').addEventListener('click', showMenu);
  s.querySelector('#ndSay').addEventListener('click', () => speakText(word, state.currentLanguage));

  const pick = btn => {
    if (nd.answered) return;
    nd.answered = true;
    const isCorrect = btn.dataset.key === q.item.key;
    if (isCorrect) nd.score++;
    record(q, isCorrect, isCorrect ? 3 : 1);
    s.querySelectorAll('.nd-option-btn').forEach(b => {
      b.disabled = true;
      if (b.dataset.key === q.item.key) b.classList.add('correct');
      else if (b === btn) b.classList.add('wrong');
    });
    showFeedback(q, { isCorrect, isExact: isCorrect, answer: btn.textContent, showWord: false });
  };
  s.querySelectorAll('.nd-option-btn').forEach(btn => btn.addEventListener('click', () => pick(btn)));
  // Keys 1–4 pick an option, so the whole drill can be done from the keyboard.
  const keyHandler = e => {
    if (nd.answered || !/^[1-4]$/.test(e.key)) return;
    const btn = s.querySelector(`.nd-option-btn[data-idx="${Number(e.key) - 1}"]`);
    if (btn) { e.preventDefault(); pick(btn); }
  };
  if (nd.keyHandler) s.removeEventListener('keydown', nd.keyHandler);
  nd.keyHandler = keyHandler;
  s.addEventListener('keydown', keyHandler);
  s.querySelector('.nd-option-btn').focus({ preventScroll: true });
}

// Mode 3: hear the Ukrainian, type the digits.
// With read on, the word is shown instead of spoken: word → digits, typed.
function renderListen(q, { read = false } = {}) {
  const s = getScreen();
  const nl = state.nativeLanguage === 'nl';
  const word = q.item.answers[0];
  const isTime = q.item.kind === 'time' || q.item.kind === 'attime';
  const isDate = q.item.kind === 'date';
  const placeholder = isTime ? '7:30' : isDate ? (nl ? '15-9 (dag-maand)' : '15-9 (day-month)') : q.item.kind === 'ordinal' ? (nl ? '3 (rangtelwoord)' : '3 (ordinal)') : '17';
  const what = read ? (nl ? 'Typ het in cijfers' : 'Type it in digits')
    : q.item.kind === 'ordinal' ? (nl ? 'Welk rangtelwoord hoor je?' : 'Which ordinal do you hear?')
    : isTime ? (nl ? 'Hoe laat hoor je?' : 'What time do you hear?')
    : isDate ? (nl ? 'Welke datum hoor je?' : 'Which date do you hear?')
    : (nl ? 'Welk getal hoor je?' : 'Which number do you hear?');

  s.innerHTML = `
    ${headerHtml()}
    <div class="nd-q-card nd-q-card-listen">
      <div class="nd-q-question">${escHtml(questionWord(q.item))}</div>
      ${read ? `<div class="nd-q-word nd-q-word-read">${escHtml(word)} <button class="nd-say-inline" id="ndSay" type="button">🔊</button></div>`
             : '<button class="nd-big-listen" id="ndSay">🔊</button>'}
      <div class="nd-q-hint">${what}${q.item.kind === 'ordinal' ? ` · ${escHtml(loc(GENDER_LABEL[q.item.gender]))}` : ''}</div>
    </div>
    <div class="nd-input-area">
      <input type="text" class="nd-text-input nd-digits-input" id="ndInput" inputmode="${isTime || isDate ? 'text' : 'numeric'}"
        placeholder="${placeholder}" autocomplete="off" autocorrect="off" spellcheck="false" />
      <button class="nd-check-btn" id="ndCheck">${nl ? 'Controleer ✓' : 'Check ✓'}</button>
    </div>
    <div id="ndFeedback"></div>`;

  s.querySelector('#ndDrillBack').addEventListener('click', showMenu);
  const say = () => speakText(word, state.currentLanguage);
  s.querySelector('#ndSay').addEventListener('click', say);
  if (!read) say();

  const input = s.querySelector('#ndInput');
  const check = s.querySelector('#ndCheck');
  const submit = () => {
    if (nd.answered) return;
    const answer = input.value.trim();
    if (!answer) { input.focus(); return; }
    nd.answered = true;
    input.disabled = true; check.disabled = true;
    const isCorrect = isTime ? parseTime(answer) === q.item.value
      : isDate ? parseDate(answer) === q.item.value
      : parseNumber(answer) === q.item.value;
    if (isCorrect) nd.score++;
    input.classList.add(isCorrect ? 'correct' : 'wrong');
    record(q, isCorrect, isCorrect ? 4 : 1);
    showFeedback(q, { isCorrect, isExact: isCorrect, answer, expectedDigits: promptText(q.item) });
  };
  check.addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
  input.focus();
}

// "17", "17th", "17e", "17." → 17
function parseNumber(s) {
  const m = s.replace(/[\s.,]/g, '').match(/\d+/);
  return m ? Number(m[0]) : NaN;
}
// "7:30", "7.30", "7 30", "730", "0730", "at 7:30" → "7:30"
function parseTime(s) {
  const digits = s.replace(/[^\d]/g, '');
  if (!digits) return null;
  let h, m;
  if (digits.length <= 2) { h = Number(digits); m = 0; }
  else { h = Number(digits.slice(0, -2)); m = Number(digits.slice(-2)); }
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, '0')}`;
}

// "15-9", "15/9", "15.9", "15 9", "15 september" → "15-9"
function parseDate(s) {
  const nums = s.match(/\d+/g);
  if (!nums) return null;
  const d = Number(nums[0]);
  let m = nums[1] ? Number(nums[1]) : NaN;
  if (Number.isNaN(m)) {
    const word = s.toLowerCase().replace(/[\d\s\-\/.]/g, '');
    const idx = MONTHS.findIndex(mo => word && (mo.en.toLowerCase().startsWith(word.slice(0, 3)) || mo.nl.startsWith(word.slice(0, 3))));
    if (idx !== -1) m = idx + 1;
  }
  return `${d}-${m}`;
}

// ── Distractors for choose mode ──────────────────────────────────────────────

// Pairs that sound alike and are worth confusing on purpose.
const CONFUSABLE = { 12: 20, 20: 12, 13: 30, 30: 13, 14: 40, 40: 14, 15: 50, 50: 15, 16: 60, 60: 16, 17: 70, 70: 17, 18: 80, 80: 18, 19: 90, 90: 19 };

function distractors(q) {
  const { item, pool } = q;
  const others = pool.filter(o => o.key !== item.key);
  const picked = [];
  const take = pred => {
    const cand = shuffle(others.filter(o => !picked.includes(o) && pred(o)));
    if (cand.length) picked.push(cand[0]);
  };
  if (item.kind === 'cardinal') {
    if (CONFUSABLE[item.value]) take(o => o.value === CONFUSABLE[item.value]);
    take(o => Math.abs(o.value - item.value) <= 2 && o.value !== item.value);
  } else if (item.kind === 'ordinal') {
    take(o => o.value === item.value && o.gender !== item.gender);   // same number, other gender
    take(o => o.value !== item.value && o.gender === item.gender);   // other number, same gender
  } else if (item.kind === 'date') {
    take(o => o.m === item.m && o.d !== item.d);                     // same month, other day
    take(o => o.d === item.d && o.m !== item.m);                     // same day, other month
  } else {
    take(o => o.h === item.h && o.m !== item.m);                     // same hour, other minutes
    take(o => o.m === item.m && o.h !== item.h);                     // same minutes, other hour
  }
  while (picked.length < 3 && picked.length < others.length) take(() => true);
  return picked;
}

// ── Feedback ─────────────────────────────────────────────────────────────────

function showFeedback(q, { isCorrect, isExact, answer, showWord = true, expectedDigits = null }) {
  const fb = document.getElementById('ndFeedback');
  const nl = state.nativeLanguage === 'nl';
  const item = q.item;
  if (!isCorrect && !q.intro) nd.missed.push(q);
  const resultText = isExact ? '✓ ' + (nl ? 'Correct!' : 'Correct!')
    : isCorrect ? '✓ ' + (nl ? 'Bijna! (kleine typfout)' : 'Almost! (minor typo)')
    : '✗ ' + (nl ? 'Niet helemaal' : 'Not quite');

  let html = `<div class="ex-feedback-result ${isCorrect ? 'correct' : 'wrong'}">${resultText}</div>`;

  if (!isExact) {
    html += `<div class="nd-answer-compare">
      <div class="nd-your-answer"><span class="nd-ans-label">${nl ? 'Jouw antwoord:' : 'Your answer:'}</span> ${escHtml(answer)}</div>
      <div class="nd-correct-answer"><span class="nd-ans-label">${nl ? 'Correct:' : 'Correct:'}</span> ${escHtml(expectedDigits || item.answers[0])}</div>
    </div>`;
  }

  // The word itself (always shown so every question doubles as a study card).
  if (showWord || expectedDigits) {
    html += `<div class="nd-word-line">
      <span class="nd-word-prompt">${escHtml(promptText(item))}</span>
      <span class="nd-word-arrow">=</span>
      <span class="nd-word-uk">${escHtml(item.answers[0])}</span>
    </div>`;
  }

  const alts = item.answers.slice(1, 3);
  if (alts.length) {
    html += `<div class="nd-alts">${nl ? 'Ook goed:' : 'Also fine:'} ${alts.map(a => `<span>${escHtml(a)}</span>`).join(' · ')}</div>`;
  }
  if (item.note) html += `<div class="nd-note">💡 ${escHtml(loc(item.note))}</div>`;

  html += `<button class="nd-listen-btn" id="ndListen">🔊 ${nl ? 'Luister' : 'Listen'}</button>`;
  fb.innerHTML = html;
  fb.querySelector('#ndListen').addEventListener('click', () => speakText(item.answers[0], state.currentLanguage));

  const isLast = nd.current + 1 >= nd.questions.length;
  const nextBtn = document.createElement('button');
  nextBtn.className = 'nd-next-btn';
  nextBtn.type = 'button';
  nextBtn.textContent = isLast ? (nl ? '🏁 Resultaten' : '🏁 See results') : (nl ? 'Volgende →' : 'Next →');
  nextBtn.addEventListener('click', () => {
    if (isLast) showScore();
    else { nd.current++; renderQuestion(); getScreen().scrollTo({ top: 0, behavior: 'smooth' }); }
  });
  fb.appendChild(nextBtn);
  // Enter again advances: the input is disabled now, so Next takes the focus.
  nextBtn.focus({ preventScroll: true });
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Score ─────────────────────────────────────────────────────────────────────

function showScore() {
  const total = nd.questions.length;
  const score = nd.score;
  const pct = Math.round((score / total) * 100);
  const emoji = pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪';
  const nl = state.nativeLanguage === 'nl';
  const msg = pct === 100 ? (nl ? 'Perfecte score!' : 'Perfect score!')
            : pct >= 80 ? (nl ? 'Geweldig!' : 'Great job!')
            : pct >= 60 ? (nl ? 'Goed bezig!' : 'Good effort!')
            : (nl ? 'Blijf oefenen!' : 'Keep practising!');

  // List what went wrong this round so it can be studied right away.
  const missed = nd.missed;
  const stage = nextStage();
  const again = nd.session === 'new'
    ? (stage ? `📥 ${nl ? 'Volgende' : 'Next'}: ${escHtml(loc(stage.title))}` : '')
    : nd.session === 'due' ? (dueNumbers().length ? `🔄 ${nl ? 'Verder herhalen' : 'More reviews'}` : '')
    : `🔄 ${nl ? 'Nog een ronde' : 'Another round'}`;
  const s = getScreen();
  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="ndScoreBack">←</button>
      <div>
        <div class="lesson-title">🔢 ${nl ? 'Resultaten' : 'Results'}</div>
        <div class="lesson-subtitle">${nl ? 'Getallen & Tijd Drill' : 'Numbers & Time Drill'}</div>
      </div>
    </div>

    <div class="ex-score-card">
      <div class="ex-score-emoji">${emoji}</div>
      <div class="ex-score-title">${escHtml(msg)}</div>
      <div class="ex-score-fraction">${score} / ${total}</div>
      <div class="ex-score-bar-wrap"><div class="ex-score-bar-fill" style="width: ${pct}%"></div></div>
      <div class="ex-score-pct">${pct}%</div>
      <div class="ex-score-actions">
        ${again ? `<button class="ex-next-btn" id="ndRetry">${again}</button>` : ''}
        <button class="ex-back-btn" id="ndBackMenu">← Menu</button>
      </div>
    </div>
    ${missed.length ? `
      <div class="nd-ref-section">
        <div class="nd-ref-title">${nl ? 'Fout deze ronde' : 'Missed this round'}</div>
        ${missed.map(q => `
          <div class="nd-ref-row">
            <span class="nd-ref-left">${escHtml(promptText(q.item))}</span>
            <span class="nd-ref-right">${escHtml(q.item.answers[0])}</span>
            <span class="nd-ref-extra">${escHtml(promptHint(q.item))}</span>
            <button class="nd-ref-speak" data-say="${escHtml(q.item.answers[0])}">🔊</button>
          </div>`).join('')}
      </div>` : ''}`;

  s.querySelector('#ndScoreBack').addEventListener('click', showMenu);
  s.querySelector('#ndRetry')?.addEventListener('click', () => (nd.session === 'drill' ? startDrill() : startCourse(nd.session)));
  s.querySelector('#ndBackMenu').addEventListener('click', showMenu);
  s.querySelectorAll('[data-say]').forEach(btn => {
    btn.addEventListener('click', () => speakText(btn.dataset.say, state.currentLanguage));
  });
  s.scrollTo({ top: 0 });
}
