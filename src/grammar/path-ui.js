// ── Course path: the structured course from A1 to B2 ─────────────────────────
// Menu: a level, its units, where the learner is. Unit page: the grammar
// explained, the words, the sentences, then three steps run on the course
// engine: learn the words (shown, then typed both ways), practise the sentences
// (shown with their note, then typed from the translation with the words as
// hints), exercises (gaps and choices). Words and sentences join the shared
// review queue; see data/path-progress.js.

import { state } from '../state.js';
import { escHtml, levenshtein } from '../utils.js';
import { speakText } from '../voice.js';
import { showScreen } from '../router.js';
import { POS_LABEL } from '../data/vocab-uk.js';
import { LEVELS, UNITS, unitsOf, getUnit, unitIndex, nextUnit } from '../data/path/index.js';
import { unitItems, entryOf, recordItem, regradeItem, dueItems, pathStats, unitProgress, unitState, markUnitStep, unitDone, unitStarted, nextOpenUnit, STEPS } from '../data/path-progress.js';
import { meaning, gradeMeaning } from './vocab-drill-ui.js';
import { runSession, dueCount } from './course-engine.js';
import { L, loc, shuffle, grade, normalise, wireSpeakButtons } from './drill-core.js';

const COURSE = { icon: '🗺️', get name() { return L('Course path', 'Leerpad'); } };
const ACCENT = { main: '#0d9488', dark: '#115e59', soft: '#f0fdfa', border: '#99f6e4' };
const PREFS_KEY = 'pathPrefs';
let pt = { level: 'A1' };

function loadPrefs() { try { const p = JSON.parse(localStorage.getItem(PREFS_KEY)); if (p?.level && LEVELS.some(l => l.id === p.level)) pt.level = p.level; } catch { /* ignore */ } }
function savePrefs() { localStorage.setItem(PREFS_KEY, JSON.stringify({ level: pt.level })); }
function getScreen() { return document.getElementById('pathScreen'); }

const say = text => `<button class="pt-say" type="button" data-say="${escHtml(text)}">🔊</button>`;
const native = x => (state.nativeLanguage === 'nl' ? x.nl : x.en);
const unitName = u => `${u.level} · ${unitIndex(u)} — ${loc(u.title)}`;

// Grammar tag of a word: gender for nouns, aspect partner for verbs.
function wordTag(w) {
  if (w.pos === 'n') return `${loc(POS_LABEL.n)} · ${w.gender}`;
  if (w.pos === 'v') return w.perfective ? `${loc(POS_LABEL.v)} · ${L('perf.', 'volt.')} ${w.perfective}` : loc(POS_LABEL.v);
  return loc(POS_LABEL[w.pos]) || w.pos;
}

const firstOpen = nextOpenUnit;

// ── Public entry ─────────────────────────────────────────────────────────────

export function openPathScreen(unitId) {
  loadPrefs();
  showScreen('pathScreen');
  const u = unitId && getUnit(unitId);
  if (u) showUnit(u); else showMenu();
}

// ── Menu ─────────────────────────────────────────────────────────────────────

function showMenu() {
  const s = getScreen();
  const st = pathStats();
  const doneCount = UNITS.filter(u => unitDone(u.id)).length;
  const cont = firstOpen();
  const dueAll = dueCount();
  const level = LEVELS.find(l => l.id === pt.level);
  const units = unitsOf(pt.level);

  const levelBtn = l => {
    const us = unitsOf(l.id), d = us.filter(u => unitDone(u.id)).length;
    return `<button class="pt-level-btn ${pt.level === l.id ? 'active' : ''}" data-level="${l.id}">
      <span class="pt-level-id">${l.id}</span><span class="pt-level-meta">${d} / ${us.length}</span></button>`;
  };
  const unitRow = u => {
    const done = unitDone(u.id), started = unitStarted(u.id) || unitProgress(u) > 0;
    const pct = Math.round(unitProgress(u) * 100);
    return `<button class="pt-unit ${done ? 'done' : ''}" data-unit="${u.id}">
      <span class="pt-unit-num">${unitIndex(u)}</span>
      <span class="pt-unit-icon">${u.icon}</span>
      <span><span class="pt-unit-title">${escHtml(loc(u.title))}</span>${u.track ? ` <span class="pt-track">${u.track === 'ew' ? 'EW' : L('work', 'werk')}</span>` : ''}<br><span class="pt-unit-grammar">${escHtml(loc(u.grammar))}</span></span>
      <span class="pt-unit-status">${done ? '✓ ' + L('done', 'klaar') : started ? `${pct}%` : ''}</span>
      ${started && !done ? `<span class="pt-unit-bar"><div style="width:${pct}%"></div></span>` : ''}
    </button>`;
  };

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="ptBack">←</button>
      <div>
        <div class="lesson-title">${COURSE.icon} ${COURSE.name}</div>
        <div class="lesson-subtitle">${L('Ukrainian from A1 to B2, one grammar point at a time', 'Oekraïens van A1 tot B2, één grammaticapunt per keer')}</div>
      </div>
    </div>

    <div class="pt-stats-bar">
      <span class="pt-stat">📘 ${doneCount} / ${UNITS.length} ${L('units done', 'units klaar')}</span>
      <span class="pt-stat">🧠 ${st.learned} / ${st.total} ${L('learned', 'geleerd')}</span>
      <span class="pt-stat ${st.due ? 'pt-stat-due' : ''}">🔄 ${st.due} ${L('due', 'aan de beurt')}</span>
    </div>

    ${cont ? `<button class="pt-continue" id="ptContinue">
      <span class="pt-continue-icon">${cont.icon}</span>
      <span><span class="pt-continue-title">▶ ${unitStarted(cont.id) ? L('Continue', 'Verder') : L('Start', 'Start')}: ${escHtml(unitName(cont))}</span><br>
      <span class="pt-continue-sub">${escHtml(loc(cont.grammar))}${dueAll ? ` · 🔁 ${dueAll} ${L('due, warm-up first', 'aan de beurt, eerst opwarmen')}` : ''}</span></span>
    </button>` : `<div class="pt-empty">🎉 ${L('Every unit is done.', 'Alle units zijn klaar.')}</div>`}
    ${practisePool().length ? `<button class="vc-browse-btn pt-practise" id="ptPractise">✍️ ${L('Practise what you learned', 'Oefen wat je geleerd hebt')} · ${L('20 exercises from finished units', '20 oefeningen uit afgeronde units')}</button>` : ''}

    <div class="pt-section-label">${L('Level', 'Niveau')}</div>
    <div class="pt-level-row">${LEVELS.map(levelBtn).join('')}</div>
    <div class="pt-level-sub">${escHtml(loc(level.name))} · ${escHtml(loc(level.sub))}</div>

    <div class="pt-unit-list">
      ${units.length ? units.map(unitRow).join('') : `<div class="pt-empty">${L('The units of this level are still being written.', 'De units van dit niveau worden nog geschreven.')}</div>`}
    </div>`;

  s.querySelector('#ptBack').addEventListener('click', () => window.openExercisesScreen());
  s.querySelectorAll('[data-level]').forEach(b => b.addEventListener('click', () => { pt.level = b.dataset.level; savePrefs(); showMenu(); }));
  s.querySelectorAll('[data-unit]').forEach(b => b.addEventListener('click', () => showUnit(getUnit(b.dataset.unit))));
  s.querySelector('#ptContinue')?.addEventListener('click', () => { pt.level = cont.level; savePrefs(); showUnit(cont); });
  s.querySelector('#ptPractise')?.addEventListener('click', startPractise);
  s.scrollTo({ top: 0 });
}

// ── Unit page ────────────────────────────────────────────────────────────────

const inline = t => escHtml(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>');
function exampleLine(t) {
  const i = t.indexOf(' — ');
  if (i === -1) return `<div class="pt-ex-line"><span class="pt-ex-uk">${inline(t)}</span> ${say(t)}</div>`;
  const uk = t.slice(0, i), gloss = t.slice(i + 3);
  return `<div class="pt-ex-line"><span class="pt-ex-uk">${inline(uk)}</span> ${say(uk)} <span class="pt-ex-gloss">${inline(gloss)}</span></div>`;
}
// markdown-lite: paragraphs, "- " bullets, "> uk — gloss" example lines, "### " headings, **bold**, `code`
// A block may mix kinds (a sentence, then two example lines): consecutive lines
// of one kind form a run, and each run is rendered on its own.
const kindOf = l => (l.startsWith('- ') ? 'ul' : l.startsWith('> ') ? 'ex' : /^#{1,4} /.test(l) ? 'h' : 'p');
export function renderExplain(text) {
  return String(text).trim().split(/\n\s*\n/).map(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const runs = [];
    for (const l of lines) {
      const k = kindOf(l);
      if (runs.length && runs[runs.length - 1].k === k && k !== 'h') runs[runs.length - 1].lines.push(l);
      else runs.push({ k, lines: [l] });
    }
    return runs.map(({ k, lines }) => {
      if (k === 'ul') return `<ul>${lines.map(l => `<li>${inline(l.slice(2))}</li>`).join('')}</ul>`;
      if (k === 'ex') return `<div class="pt-ex">${lines.map(l => exampleLine(l.slice(2))).join('')}</div>`;
      if (k === 'h') return `<h4>${inline(lines[0].replace(/^#+ /, ''))}</h4>`;
      return `<p>${lines.map(inline).join('<br>')}</p>`;
    }).join('');
  }).join('');
}

const dotClass = item => {
  const e = entryOf(item);
  if (!e || !e.a) return '';
  const r = e.c / e.a;
  return r >= 0.8 ? 'pt-dot-green' : r >= 0.5 ? 'pt-dot-yellow' : 'pt-dot-red';
};

function showUnit(unit) {
  const s = getScreen();
  const items = unitItems(unit);
  const st = unitState(unit.id);
  const next = nextUnit(unit);
  const due = dueCount();
  const action = (id, icon, title, sub, step, primary = false) => `
    <button class="pt-action ${primary ? 'pt-action-primary' : ''} ${step && st[step] ? 'done' : ''}" id="${id}">
      <span class="pt-action-icon">${icon}</span>
      <span class="pt-action-title">${step && st[step] ? '✓ ' : ''}${title}</span>
      <span class="pt-action-sub">${sub}</span>
    </button>`;

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="ptUnitBack">←</button>
      <div>
        <div class="lesson-title">${unit.icon} ${escHtml(unitName(unit))}</div>
        <div class="lesson-subtitle">${escHtml(loc(unit.grammar))}</div>
      </div>
    </div>

    <div class="pt-card">
      <div class="pt-card-title">📖 ${L('Grammar', 'Grammatica')} · ${escHtml(loc(unit.grammar))}</div>
      <div class="pt-explain">${renderExplain(loc(unit.explain))}</div>
    </div>

    <div class="pt-card">
      <div class="pt-card-title">🧠 ${L('Words', 'Woorden')} · ${items.words.length}</div>
      <div class="pt-words">
        ${items.words.map(w => `
          <div class="pt-word">
            <span><span class="pt-word-dot ${dotClass(w)}"></span><span class="pt-word-uk">${escHtml(w.uk)}</span><span class="pt-word-tag">${escHtml(wordTag(w))}</span></span>
            <span class="pt-word-meaning">${escHtml(meaning(w))}</span>
            ${say(w.uk)}
          </div>`).join('')}
      </div>
    </div>

    <div class="pt-card">
      <div class="pt-card-title">💬 ${L('Sentences', 'Zinnen')} · ${items.sentences.length}</div>
      ${items.sentences.map(x => `
        <div class="pt-sentence">
          <div class="pt-sentence-uk"><span class="pt-word-dot ${dotClass(x)}"></span>${escHtml(x.uk)} ${say(x.uk)}</div>
          <div class="pt-sentence-native">${escHtml(native(x))}</div>
          ${x.note ? `<div class="pt-sentence-note">💡 ${escHtml(loc(x.note))}</div>` : ''}
        </div>`).join('')}
    </div>

    ${due ? `<button class="pt-due-row" id="ptDue">
      <span>🔁 ${due} ${L('due across your courses', 'aan de beurt in je cursussen')}</span>
      <span class="pt-due-hint">${L('Each step starts with a warm-up of up to 8 · tap for a full round', 'Elke stap begint met een opwarmer van max. 8 · tik voor een hele ronde')}</span>
    </button>` : ''}
    <div class="pt-section-label">${L('Practise', 'Oefenen')}</div>
    <div class="pt-actions">
      ${action('ptWords', '🧠', L('Learn the words', 'Leer de woorden'), `${items.words.length} ${L('words · shown, then typed both ways', 'woorden · eerst zien, dan beide kanten typen')}`, 'words')}
      ${action('ptSentences', '💬', L('Practise the sentences', 'Oefen de zinnen'), `${items.sentences.length} ${L('sentences · typed from your language', 'zinnen · typen vanuit jouw taal')}`, 'sentences')}
      ${action('ptExercises', '✍️', L('Exercises', 'Oefeningen'), `${unit.exercises.length} ${L('gaps and choices', 'gaten en keuzes')}`, 'exercises')}
      ${action('ptAll', '▶', L('Whole unit', 'Hele unit'), L('words, sentences and exercises in one go', 'woorden, zinnen en oefeningen achter elkaar'), null, true)}
    </div>
    ${next ? `<button class="vc-browse-btn" id="ptNext">${L('Next unit', 'Volgende unit')}: ${escHtml(unitName(next))} →</button>` : ''}`;

  wireSpeakButtons(s);
  s.querySelector('#ptUnitBack').addEventListener('click', () => { pt.level = unit.level; savePrefs(); showMenu(); });
  s.querySelector('#ptWords').addEventListener('click', () => startStep(unit, 'words'));
  s.querySelector('#ptSentences').addEventListener('click', () => startStep(unit, 'sentences'));
  s.querySelector('#ptExercises').addEventListener('click', () => startStep(unit, 'exercises'));
  s.querySelector('#ptAll').addEventListener('click', () => startStep(unit, 'all'));
  s.querySelector('#ptNext')?.addEventListener('click', () => showUnit(next));
  s.querySelector('#ptDue')?.addEventListener('click', () => window.startReviewAll());
  s.scrollTo({ top: 0 });
}

// ── Cards ────────────────────────────────────────────────────────────────────

const q = (isExact, isClose) => (isExact ? 5 : isClose ? 3 : 1);

// A word: shown first (intro), then meaning → word, then word → meaning.
function wordCard(w, { intro = false, dir = 'produce' } = {}) {
  const base = {
    key: w.key, course: COURSE, intro,
    record: res => recordItem(w, res.quality),
    override: before => regradeItem(w, before, 4),
    compareOnClose: true, say: w.uk,
  };
  if (intro || dir === 'produce') {
    return { ...base,
      promptHtml: `
        <div class="pt-q-card ${intro ? 'pt-q-intro' : ''}">
          ${intro ? `<div class="pt-q-badge">✨ ${L('New word', 'Nieuw woord')}</div>` : `<div class="pt-q-label">${L('In Ukrainian', 'In het Oekraïens')}</div>`}
          <div class="pt-q-main">${escHtml(meaning(w))}</div>
          <div class="pt-q-hint">${escHtml(wordTag(w))}</div>
          ${intro ? `<div class="pt-q-word">${escHtml(w.uk)} ${say(w.uk)}</div><div class="pt-q-hint">${L('Say it, then type it', 'Zeg het, typ het dan')}</div>` : ''}
        </div>`,
      autoSay: intro ? w.uk : null,
      input: { type: 'text', lang: 'uk', placeholder: L('Type the Ukrainian…', 'Typ het Oekraïens…') },
      check(answer) {
        const g = grade(answer, [w.uk], { minTypoLen: 5 });
        if (intro) return { ...g, quality: 0 };
        if (!g.isExact && w.perfective && normalise(answer) === normalise(w.perfective)) {
          return { isExact: false, isClose: true, isCorrect: true, quality: 4, headline: L('Right verb, but that is the perfective', 'Juiste werkwoord, maar dat is de voltooide vorm') };
        }
        return { ...g, quality: q(g.isExact, g.isClose) };
      },
      override: null,
      correctText: w.uk,
      missed: { left: meaning(w), right: w.uk, extra: wordTag(w) },
    };
  }
  return { ...base,
    promptHtml: `
      <div class="pt-q-card">
        <div class="pt-q-label">${L('What does it mean?', 'Wat betekent het?')}</div>
        <div class="pt-q-main">${escHtml(w.uk)} ${say(w.uk)}</div>
        <div class="pt-q-hint">${escHtml(wordTag(w))}</div>
      </div>`,
    autoSay: w.uk,
    input: { type: 'text', lang: state.nativeLanguage, placeholder: L('Type the meaning…', 'Typ de betekenis…') },
    check(answer) { const g = gradeMeaning(answer, w); return { ...g, quality: q(g.isExact, g.isClose) }; },
    correctText: meaning(w),
    missed: { left: w.uk, right: meaning(w), extra: wordTag(w), say: w.uk },
  };
}

// Sentence-level grading as in the sentence builder: 100 exact, 88+ a slip, below wrong.
const clean = s => normalise(s).replace(/[.,!?;:"«»—–-]/g, '').replace(/\s+/g, ' ').trim();
function similarity(a, b) {
  const x = clean(a), y = clean(b);
  if (x === y) return 100;
  return Math.round((1 - levenshtein(x, y) / (Math.max(x.length, y.length) || 1)) * 100);
}
const sentenceVerdict = (answer, target) => {
  const sim = similarity(answer, target);
  const isExact = sim === 100, isClose = !isExact && sim >= 88;
  return { isExact, isClose, isCorrect: isExact || isClose, quality: q(isExact, isClose), sim };
};

// A sentence: shown with its note first (intro, copied), then typed from the translation.
function sentenceCard(x, { intro = false } = {}) {
  const note = x.note ? `<div class="pt-detail-note">💡 ${escHtml(loc(x.note))}</div>` : '';
  return {
    key: x.key, course: COURSE, intro,
    promptHtml: `
      <div class="pt-q-card ${intro ? 'pt-q-intro' : ''}">
        ${intro ? `<div class="pt-q-badge">✨ ${L('New sentence', 'Nieuwe zin')}</div>` : `<div class="pt-q-label">${L('Say this in Ukrainian', 'Zeg dit in het Oekraïens')}</div>`}
        <div class="pt-q-main">${escHtml(native(x))}</div>
        ${intro ? `<div class="pt-q-sentence">${escHtml(x.uk)} ${say(x.uk)}</div>
                   ${x.note ? `<div class="pt-q-note">💡 ${escHtml(loc(x.note))}</div>` : ''}
                   <div class="pt-q-hint">${L('Read it, say it, then type it', 'Lees het, zeg het, typ het dan')}</div>`
                : `<div class="pt-hint-row">${x.hint.map(h => `<span class="pt-hint-chip">${escHtml(h)}</span>`).join('')}</div>`}
      </div>`,
    autoSay: intro ? x.uk : null,
    input: { type: 'text', lang: 'uk', placeholder: L('Type the whole sentence…', 'Typ de hele zin…') },
    check(answer) { const v = sentenceVerdict(answer, x.uk); return intro ? { ...v, quality: 0 } : v; },
    record: res => recordItem(x, res.quality),
    override: before => regradeItem(x, before, 4),
    compareOnClose: true,
    correctText: x.uk,
    detailHtml: intro ? '' : `<div class="pt-detail-full">${escHtml(x.uk)}</div>${note}`,
    say: x.uk, sayAfter: !intro,
    missed: { left: native(x), right: x.uk, extra: '' },
  };
}

// Exercises are practice, not scheduled: record is a no-op.
function exerciseCard(x) {
  const note = x.note ? `<div class="pt-detail-note">💡 ${escHtml(loc(x.note))}</div>` : '';
  const shownUk = escHtml(x.uk).replace(/___/g, '<span class="pt-q-gap">&nbsp;</span>');
  const common = { key: `ex:${x.uk}`, course: COURSE, intro: false, record: () => null, override: null, detailHtml: note };
  if (x.type === 'choose') {
    const full = x.uk.replace(/___/, x.options[x.correct]);
    return { ...common,
      promptHtml: `
        <div class="pt-q-card">
          <div class="pt-q-label">${L('Which form fits?', 'Welke vorm past?')}</div>
          <div class="pt-q-sentence">${shownUk}</div>
          <div class="pt-q-native">${escHtml(native(x))}</div>
        </div>`,
      input: { type: 'choice', options: x.options.map((o, i) => ({ label: o, correct: i === x.correct })) },
      check: () => null,
      correctText: x.options[x.correct],
      say: full,
      missed: { left: x.uk, right: x.options[x.correct], extra: native(x), say: full },
    };
  }
  const answers = x.answer.split(' / ');
  const full = x.uk.replace(/___/, answers[0]);
  return { ...common,
    promptHtml: `
      <div class="pt-q-card">
        <div class="pt-q-label">${L('Fill the gap', 'Vul het gat in')}</div>
        <div class="pt-q-sentence">${shownUk}</div>
        <div class="pt-q-native">${escHtml(native(x))}</div>
      </div>`,
    input: { type: 'text', lang: 'uk', placeholder: L('The missing word…', 'Het ontbrekende woord…') },
    check(answer) { const g = grade(answer, answers, { minTypoLen: 5 }); return { ...g, quality: q(g.isExact, g.isClose) }; },
    compareOnClose: true,
    correctText: answers[0],
    say: full,
    missed: { left: x.uk, right: answers[0], extra: native(x), say: full },
  };
}

// ── Sessions ─────────────────────────────────────────────────────────────────

function stepCards(unit, step) {
  const items = unitItems(unit);
  if (step === 'words') {
    return [
      ...items.words.map(w => wordCard(w, { intro: true })),
      ...shuffle(items.words).map(w => wordCard(w, { dir: 'produce' })),
      ...shuffle(items.words).map(w => wordCard(w, { dir: 'translate' })),
    ];
  }
  if (step === 'sentences') {
    return [...items.sentences.map(x => sentenceCard(x, { intro: true })), ...shuffle(items.sentences).map(x => sentenceCard(x))];
  }
  if (step === 'exercises') return shuffle(unit.exercises).map(exerciseCard);
  return [...stepCards(unit, 'words'), ...stepCards(unit, 'sentences'), ...stepCards(unit, 'exercises')];
}

const stepName = step => ({ words: L('Words', 'Woorden'), sentences: L('Sentences', 'Zinnen'), exercises: L('Exercises', 'Oefeningen'), all: L('Whole unit', 'Hele unit') })[step];

function startStep(unit, step) {
  const cards = stepCards(unit, step);
  if (!cards.length) { showUnit(unit); return; }
  const done = step === 'all' ? STEPS : [step];
  runSession({
    screen: getScreen(), icon: unit.icon, title: `${unit.level} · ${unitIndex(unit)} · ${stepName(step)}`, accent: ACCENT, cards, warmUp: 8,
    onExit: () => showUnit(unit),
    scoreSubtitle: () => unitName(unit),
    // The step is done once the round ends; offer the next step, or the next unit.
    again: () => {
      done.forEach(s => markUnitStep(unit.id, s));
      const st = unitState(unit.id);
      const todo = STEPS.find(s => !st[s]);
      if (todo) return { label: `▶ ${L('Next', 'Volgende')}: ${stepName(todo)}`, run: () => startStep(unit, todo) };
      const next = nextUnit(unit);
      return next ? { label: `→ ${L('Next unit', 'Volgende unit')}: ${loc(next.title)}`, run: () => showUnit(next) } : null;
    },
  });
}

// ── Practise what you learned ────────────────────────────────────────────────
// The exercises of units whose exercise step is done, as a mixed round. They are
// not scheduled (the words and sentences are), so this is the free practice.
const practisePool = () => UNITS.filter(u => unitState(u.id).exercises).flatMap(u => u.exercises.map(x => ({ x, unit: u })));
function startPractise() {
  const pool = practisePool();
  if (!pool.length) { showMenu(); return; }
  const cards = shuffle(pool).slice(0, 20).map(({ x, unit }) => ({ ...exerciseCard(x), course: { icon: unit.icon, name: unitName(unit) } }));
  runSession({
    screen: getScreen(), icon: '✍️', title: L('Practise what you learned', 'Oefen wat je geleerd hebt'), accent: ACCENT, cards, mixed: true,
    onExit: showMenu,
    again: () => ({ label: '🔄 ' + L('Another round', 'Nog een ronde'), run: startPractise }),
  });
}

// ── Review ───────────────────────────────────────────────────────────────────

export function pathDueCards() {
  return dueItems().map(i => (i.kind === 'sentence' ? sentenceCard(i) : wordCard(i, { dir: Math.random() < 0.5 ? 'produce' : 'translate' })));
}

export function startPathReview() {
  showScreen('reviewScreen');
  runSession({
    screen: document.getElementById('reviewScreen'), icon: COURSE.icon, title: COURSE.name, accent: ACCENT,
    cards: shuffle(pathDueCards()).slice(0, 30),
    onExit: () => window.openReviewScreen(),
    again: () => { const left = dueItems().length; return left ? { label: L(`🔄 Keep going: ${left} left`, `🔄 Verder: nog ${left}`), run: startPathReview } : null; },
  });
}
