import { state } from '../state.js';
import { escHtml } from '../utils.js';
import { speakText } from '../voice.js';
import { VOCAB, THEMES, POS_LABEL, vocabByTheme } from '../data/vocab-uk.js';
import { recordVocab, dueVocab, unseenVocab, weakVocab, vocabStats, getVocabProgress } from '../data/vocab-progress.js';
import { L, loc, shuffle, grade, resultLine, appendNext, missedListHtml, wireSpeakButtons, scoreMessage, scoreEmoji } from './drill-core.js';

// ── State ────────────────────────────────────────────────────────────────────

const PREFS_KEY = 'vocabDrillPrefs';

let vc = {
  theme:  'all',
  qMode:  'type',     // 'type' (meaning → word) | 'dictate' (audio → word) | 'choose' (word → meaning)
  queue:  [],         // [{ word, intro }] intro = first exposure: the word is shown and copied
  current: 0,
  score:  0,
  answered: false,
  missed: [],
  sessionKind: 'new',
  refTheme: 'basics',
};

function loadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY));
    if (p?.theme && (p.theme === 'all' || THEMES[p.theme])) vc.theme = p.theme;
    if (['type', 'dictate', 'choose'].includes(p?.qMode)) vc.qMode = p.qMode;
  } catch { /* ignore */ }
}
function savePrefs() { localStorage.setItem(PREFS_KEY, JSON.stringify({ theme: vc.theme, qMode: vc.qMode })); }

function getScreen() { return document.getElementById('vocabDrillScreen'); }

const meaning = w => (state.nativeLanguage === 'nl' ? w.nl : w.en);
const themeName = t => (t === 'all' ? L('All themes', 'Alle thema\'s') : loc(THEMES[t]));

// Grammar tag shown with a word: gender for nouns, aspect partner for verbs.
function wordTag(w) {
  if (w.pos === 'n') return `${loc(POS_LABEL.n)} · ${w.gender}`;
  if (w.pos === 'v') return w.perfective ? `${loc(POS_LABEL.v)} · ${L('perf.', 'volt.')} ${w.perfective}` : loc(POS_LABEL.v);
  return loc(POS_LABEL[w.pos]) || w.pos;
}

// ── Public entry ─────────────────────────────────────────────────────────────

export function openVocabDrillScreen() {
  loadPrefs();
  window.showScreen('vocabDrillScreen');
  showMenu();
}

// Review-hub entry: only what is due.
export function startVocabReview() {
  loadPrefs();
  window.showScreen('vocabDrillScreen');
  startSession('due');
}

// ── Menu ─────────────────────────────────────────────────────────────────────

function showMenu() {
  const s = getScreen();
  const st = vocabStats();
  const pool = vc.theme === 'all' ? VOCAB : vocabByTheme(vc.theme);
  const unseenHere = unseenVocab().filter(w => vc.theme === 'all' || w.theme === vc.theme).length;

  const chips = ['all', ...Object.keys(THEMES)].map(t => `
    <button class="vc-chip ${vc.theme === t ? 'active' : ''}" data-theme="${t}">${t === 'all' ? '🌐' : THEMES[t].icon} ${escHtml(themeName(t))}</button>`).join('');

  const modeBtn = (id, icon, label, sub) => `
    <button class="vc-mode-btn ${vc.qMode === id ? 'active' : ''}" data-mode="${id}">
      <span class="vc-mode-icon">${icon}</span>
      <span class="vc-mode-label">${label}</span>
      <span class="vc-mode-sub">${sub}</span>
    </button>`;

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vcBack">←</button>
      <div>
        <div class="lesson-title">🧠 ${L('Vocabulary', 'Woordenschat')}</div>
        <div class="lesson-subtitle">${L(`${st.total} core words · see the meaning, type the word`, `${st.total} kernwoorden · zie de betekenis, typ het woord`)}</div>
      </div>
    </div>

    <div class="vc-stats-bar">
      <span class="vc-stat">📚 ${st.seen} ${L('seen', 'gezien')} · ${st.learned} ${L('learned', 'geleerd')} / ${st.total}</span>
      <span class="vc-stat ${st.due ? 'vc-stat-due' : ''}">🔄 ${st.due} ${L('due', 'aan de beurt')}</span>
      <span class="vc-stat ${st.weak ? 'vc-stat-weak' : ''}">🎯 ${st.weak} ${L('weak', 'zwak')}</span>
    </div>

    <div class="vc-section-label">${L('Theme', 'Thema')}</div>
    <div class="vc-chip-row">${chips}</div>

    <div class="vc-section-label">${L('How', 'Hoe')}</div>
    <div class="vc-mode-row">
      ${modeBtn('type', '✍️', L('Type', 'Typen'), L('meaning → word', 'betekenis → woord'))}
      ${modeBtn('dictate', '👂', L('Dictation', 'Dictee'), L('audio → word', 'geluid → woord'))}
      ${modeBtn('choose', '👆', L('Choose', 'Kiezen'), L('word → meaning', 'woord → betekenis'))}
    </div>

    <div class="vc-session-grid">
      <button class="vc-session-card vc-session-primary" id="vcNew" ${unseenHere ? '' : 'disabled'}>
        <span class="vc-session-icon">📥</span>
        <span class="vc-session-title">${L('Learn 10 new', '10 nieuwe leren')}</span>
        <span class="vc-session-sub">${unseenHere ? `${unseenHere} ${L('left in', 'over in')} ${escHtml(themeName(vc.theme))}` : L('Theme complete', 'Thema klaar')}</span>
      </button>
      <button class="vc-session-card" id="vcDue" ${st.due ? '' : 'disabled'}>
        <span class="vc-session-icon">🔄</span>
        <span class="vc-session-title">${L('Review due', 'Herhalen')}</span>
        <span class="vc-session-sub">${st.due} ${L('words', 'woorden')}</span>
      </button>
      <button class="vc-session-card" id="vcWeak" ${st.weak ? '' : 'disabled'}>
        <span class="vc-session-icon">🎯</span>
        <span class="vc-session-title">${L('Weak spots', 'Zwakke plekken')}</span>
        <span class="vc-session-sub">${st.weak} ${L('words', 'woorden')}</span>
      </button>
      <button class="vc-session-card" id="vcTheme">
        <span class="vc-session-icon">🔀</span>
        <span class="vc-session-title">${L('Practise theme', 'Thema oefenen')}</span>
        <span class="vc-session-sub">20 ${L('from', 'uit')} ${escHtml(themeName(vc.theme))}</span>
      </button>
    </div>

    <button class="vc-browse-btn" id="vcBrowse">📖 ${L('Browse the words', 'Bekijk de woorden')} · ${escHtml(themeName(vc.theme))}</button>`;

  s.querySelector('#vcBack').addEventListener('click', () => window.openExercisesScreen());
  s.querySelectorAll('[data-theme]').forEach(btn => btn.addEventListener('click', () => { vc.theme = btn.dataset.theme; savePrefs(); showMenu(); }));
  s.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => {
    vc.qMode = btn.dataset.mode; savePrefs();
    s.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('active', b.dataset.mode === vc.qMode));
  }));
  s.querySelector('#vcNew').addEventListener('click', () => startSession('new'));
  s.querySelector('#vcDue').addEventListener('click', () => startSession('due'));
  s.querySelector('#vcWeak').addEventListener('click', () => startSession('weak'));
  s.querySelector('#vcTheme').addEventListener('click', () => startSession('theme'));
  s.querySelector('#vcBrowse').addEventListener('click', () => showReference(vc.theme === 'all' ? 'basics' : vc.theme));
}

// ── Reference ────────────────────────────────────────────────────────────────

function showReference(theme) {
  vc.refTheme = theme;
  const s = getScreen();
  const keys = Object.keys(THEMES);
  const idx = keys.indexOf(theme);
  const words = vocabByTheme(theme);

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vcRefBack">←</button>
      <div>
        <div class="lesson-title">${THEMES[theme].icon} ${escHtml(loc(THEMES[theme]))}</div>
        <div class="lesson-subtitle">${words.length} ${L('words', 'woorden')} · ${idx + 1}/${keys.length}</div>
      </div>
    </div>
    <div class="vc-ref-list">
      ${words.map(w => {
        const p = getVocabProgress(w.key);
        const dot = !p ? 'gray' : p.c / p.a >= 0.8 ? 'green' : p.c / p.a >= 0.5 ? 'yellow' : 'red';
        return `
        <div class="vc-ref-row">
          <span class="vc-ref-dot vc-dot-${dot}"></span>
          <span class="vc-ref-uk">${escHtml(w.uk)}</span>
          <span class="vc-ref-meaning">${escHtml(meaning(w))}</span>
          <span class="vc-ref-tag">${escHtml(wordTag(w))}</span>
          <button class="vc-ref-speak" data-say="${escHtml(w.uk)}">🔊</button>
        </div>`; }).join('')}
    </div>
    <div class="vc-ref-nav">
      <button class="vc-nav-btn" id="vcPrev" ${idx === 0 ? 'disabled' : ''}>← ${L('Previous', 'Vorige')}</button>
      <button class="vc-nav-btn vc-nav-primary" id="vcRefDrill">✍️ ${L('Drill this theme', 'Oefen dit thema')}</button>
      <button class="vc-nav-btn" id="vcNext" ${idx >= keys.length - 1 ? 'disabled' : ''}>${L('Next', 'Volgende')} →</button>
    </div>`;

  s.querySelector('#vcRefBack').addEventListener('click', showMenu);
  s.querySelector('#vcRefDrill').addEventListener('click', () => { vc.theme = theme; savePrefs(); startSession('theme'); });
  if (idx > 0) s.querySelector('#vcPrev').addEventListener('click', () => showReference(keys[idx - 1]));
  if (idx < keys.length - 1) s.querySelector('#vcNext').addEventListener('click', () => showReference(keys[idx + 1]));
  wireSpeakButtons(s);
  s.scrollTo({ top: 0 });
}

// ── Sessions ─────────────────────────────────────────────────────────────────
// 'new'   : next 10 unseen words in frequency order. Each appears twice: first
//           with the word shown (copy it, hear it), later from the meaning alone.
// 'due'   : everything the schedule says is due (max 30).
// 'weak'  : words answered wrong more than right.
// 'theme' : 20 random words from the theme, schedule ignored.

function startSession(kind) {
  vc.sessionKind = kind;
  const inTheme = w => vc.theme === 'all' || w.theme === vc.theme;
  let words;
  if (kind === 'new') {
    words = unseenVocab().filter(inTheme).slice(0, 10);
  } else if (kind === 'due') {
    words = shuffle(dueVocab()).slice(0, 30);
  } else if (kind === 'weak') {
    words = shuffle(weakVocab()).slice(0, 25);
  } else {
    words = shuffle(VOCAB.filter(inTheme)).slice(0, 20);
  }
  if (!words.length) { showMenu(); return; }

  if (kind === 'new' && vc.qMode !== 'choose') {
    // intro pass, then production pass in a different order
    vc.queue = [...words.map(w => ({ word: w, intro: true })), ...shuffle(words).map(w => ({ word: w, intro: false }))];
  } else {
    vc.queue = words.map(w => ({ word: w, intro: false }));
  }
  vc.current = 0; vc.score = 0; vc.missed = []; vc.answered = false;
  renderQuestion();
}

function headerHtml() {
  const pct = Math.round((vc.current / vc.queue.length) * 100);
  return `
    <div class="lesson-header">
      <button class="back-btn" id="vcDrillBack">←</button>
      <div>
        <div class="lesson-title">🧠 ${L('Vocabulary', 'Woordenschat')}</div>
        <div class="lesson-subtitle">
          <div class="vc-progress-wrap"><div class="vc-progress-bar" style="width:${pct}%"></div></div>
          <div class="vc-progress-text">${vc.current + 1} / ${vc.queue.length}</div>
        </div>
      </div>
    </div>`;
}

function renderQuestion() {
  vc.answered = false;
  const q = vc.queue[vc.current];
  if (vc.qMode === 'choose') renderChoose(q);
  else renderType(q, vc.qMode === 'dictate');
}

// Meaning → word (or audio → word). Intro cards show the word too.
function renderType(q, dictation) {
  const s = getScreen();
  const w = q.word;
  const prompt = dictation && !q.intro
    ? `<button class="vc-big-listen" id="vcSay" type="button">🔊</button>
       <div class="vc-q-hint">${L('Type what you hear', 'Typ wat je hoort')}</div>`
    : `<div class="vc-q-meaning">${escHtml(meaning(w))}</div>
       <div class="vc-q-hint">${escHtml(wordTag(w))}</div>`;

  s.innerHTML = `
    ${headerHtml()}
    <div class="vc-q-card ${q.intro ? 'vc-q-intro' : ''}">
      ${q.intro ? `<div class="vc-q-badge">✨ ${L('New word', 'Nieuw woord')}</div>` : ''}
      ${prompt}
      ${q.intro ? `<div class="vc-q-word">${escHtml(w.uk)} <button class="vc-say-inline" id="vcSayIntro" type="button">🔊</button></div>
                   <div class="vc-q-hint">${L('Say it, then type it', 'Zeg het, typ het dan')}</div>` : ''}
    </div>
    <div class="vc-input-area">
      <input type="text" class="vc-text-input" id="vcInput" lang="uk"
        placeholder="${L('Type the Ukrainian…', 'Typ het Oekraïens…')}"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
      <button class="vc-check-btn" id="vcCheck" type="button">${L('Check', 'Controleer')} ✓</button>
    </div>
    <div id="vcFeedback"></div>`;

  s.querySelector('#vcDrillBack').addEventListener('click', showMenu);
  const say = () => speakText(w.uk, state.currentLanguage);
  const sayBtn = s.querySelector('#vcSay'); if (sayBtn) { sayBtn.addEventListener('click', say); say(); }
  const introBtn = s.querySelector('#vcSayIntro'); if (introBtn) { introBtn.addEventListener('click', say); setTimeout(say, 200); }

  const input = s.querySelector('#vcInput');
  const check = s.querySelector('#vcCheck');
  const submit = () => {
    if (vc.answered) return;
    const answer = input.value.trim();
    if (!answer) { input.focus(); return; }
    vc.answered = true;
    input.disabled = true; check.disabled = true;
    const g = grade(answer, [w.uk], { minTypoLen: 5 });
    input.classList.add(g.isExact ? 'correct' : g.isClose ? 'close' : 'wrong');
    if (g.isCorrect) vc.score++;
    // Intro cards are copying, so they never count as a failure; the real test is the second pass.
    if (!q.intro) {
      recordVocab(w.key, g.isExact ? 5 : g.isClose ? 3 : 1);
      if (!g.isCorrect) vc.missed.push({ left: meaning(w), right: w.uk, extra: wordTag(w) });
    }
    showFeedback(w, { g, answer, showCompare: !g.isExact });
  };
  check.addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
  input.focus();
}

// Word → meaning, four options. Recognition only, so it does not touch the schedule
// as strongly: a right answer counts as "hard", a wrong one as "again".
function renderChoose(q) {
  const s = getScreen();
  const w = q.word;
  const pool = VOCAB.filter(o => o.key !== w.key && (o.pos === w.pos || Math.random() < 0.3));
  const options = shuffle([w, ...shuffle(pool).slice(0, 3)]);

  s.innerHTML = `
    ${headerHtml()}
    <div class="vc-q-card">
      <div class="vc-q-word">${escHtml(w.uk)} <button class="vc-say-inline" id="vcSay" type="button">🔊</button></div>
      <div class="vc-q-hint">${escHtml(loc(POS_LABEL[w.pos]) || '')}</div>
    </div>
    <div class="vc-options">
      ${options.map((o, i) => `<button class="vc-option-btn" type="button" data-idx="${i}" data-key="${escHtml(o.key)}">${escHtml(meaning(o))}</button>`).join('')}
    </div>
    <div id="vcFeedback"></div>`;

  s.querySelector('#vcDrillBack').addEventListener('click', showMenu);
  s.querySelector('#vcSay').addEventListener('click', () => speakText(w.uk, state.currentLanguage));
  const pick = btn => {
    if (vc.answered) return;
    vc.answered = true;
    const ok = btn.dataset.key === w.key;
    if (ok) vc.score++;
    recordVocab(w.key, ok ? 3 : 1);
    if (!ok) vc.missed.push({ left: meaning(w), right: w.uk, extra: wordTag(w) });
    s.querySelectorAll('.vc-option-btn').forEach(b => {
      b.disabled = true;
      if (b.dataset.key === w.key) b.classList.add('correct');
      else if (b === btn) b.classList.add('wrong');
    });
    showFeedback(w, { g: { isExact: ok, isCorrect: ok }, answer: btn.textContent, showCompare: false });
  };
  s.querySelectorAll('.vc-option-btn').forEach(btn => btn.addEventListener('click', () => pick(btn)));
  const keyHandler = e => {
    if (vc.answered || !/^[1-4]$/.test(e.key)) return;
    const btn = s.querySelector(`.vc-option-btn[data-idx="${Number(e.key) - 1}"]`);
    if (btn) { e.preventDefault(); pick(btn); }
  };
  if (vc.keyHandler) s.removeEventListener('keydown', vc.keyHandler);
  vc.keyHandler = keyHandler;
  s.addEventListener('keydown', keyHandler);
  s.querySelector('.vc-option-btn').focus({ preventScroll: true });
}

function showFeedback(w, { g, answer, showCompare }) {
  const fb = document.getElementById('vcFeedback');
  let html = resultLine(g);
  if (showCompare) {
    html += `<div class="vc-compare">
      <div class="vc-your-answer"><b>${L('Your answer:', 'Jouw antwoord:')}</b> ${escHtml(answer)}</div>
      <div class="vc-correct-answer"><b>${L('Correct:', 'Correct:')}</b> ${escHtml(w.uk)}</div>
    </div>`;
  }
  html += `<div class="vc-word-line">
    <span class="vc-word-uk">${escHtml(w.uk)}</span>
    <span class="vc-word-eq">=</span>
    <span class="vc-word-meaning">${escHtml(meaning(w))}</span>
    <span class="vc-word-tag">${escHtml(wordTag(w))}</span>
  </div>`;
  html += `<button class="vc-listen-btn" id="vcListen" type="button">🔊 ${L('Listen', 'Luister')}</button>`;
  fb.innerHTML = html;
  fb.querySelector('#vcListen').addEventListener('click', () => speakText(w.uk, state.currentLanguage));

  const isLast = vc.current + 1 >= vc.queue.length;
  appendNext(fb, { isLast, className: 'vc-next-btn', onNext: () => {
    if (isLast) showScore();
    else { vc.current++; renderQuestion(); getScreen().scrollTo({ top: 0, behavior: 'smooth' }); }
  } });
}

// ── Score ─────────────────────────────────────────────────────────────────────

function showScore() {
  const total = vc.queue.length;
  const pct = Math.round((vc.score / total) * 100);
  const st = vocabStats();
  const s = getScreen();
  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vcScoreBack">←</button>
      <div>
        <div class="lesson-title">🧠 ${L('Results', 'Resultaten')}</div>
        <div class="lesson-subtitle">${L('Vocabulary', 'Woordenschat')} · ${st.learned}/${st.total} ${L('learned', 'geleerd')}</div>
      </div>
    </div>
    <div class="ex-score-card">
      <div class="ex-score-emoji">${scoreEmoji(pct)}</div>
      <div class="ex-score-title">${escHtml(scoreMessage(pct))}</div>
      <div class="ex-score-fraction">${vc.score} / ${total}</div>
      <div class="ex-score-bar-wrap"><div class="ex-score-bar-fill" style="width: ${pct}%"></div></div>
      <div class="ex-score-pct">${pct}%</div>
      <div class="ex-score-actions">
        <button class="ex-next-btn" id="vcAgain">${vc.sessionKind === 'new' ? '📥 ' + L('Next 10 new', 'Volgende 10') : '🔄 ' + L('Another round', 'Nog een ronde')}</button>
        <button class="ex-back-btn" id="vcBackMenu">← Menu</button>
      </div>
    </div>
    ${missedListHtml(vc.missed, { cls: 'vocab' })}`;
  wireSpeakButtons(s);
  s.querySelector('#vcScoreBack').addEventListener('click', showMenu);
  s.querySelector('#vcAgain').addEventListener('click', () => startSession(vc.sessionKind));
  s.querySelector('#vcBackMenu').addEventListener('click', showMenu);
  s.scrollTo({ top: 0 });
}
