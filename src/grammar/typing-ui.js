// ── Typing course: getting used to the Ukrainian keyboard ────────────────────
// Eight steps (data/typing.js). A step with new letters runs: each letter shown
// with its sound and its key, typed once; then the sound asked and the letter
// typed; then syllable lines; then lines of real words that use only letters met
// so far. The last two steps are capitals (names) and whole sentences. After
// that there is a practice round over everything, which leans on the letters
// that keep going wrong.
//
// It runs on the course engine like every other course, with one difference: a
// card here reacts while the learner types (the engine's `mount` hook). Each
// letter of the line turns green or red as it is typed, the key to press next
// lights up on a picture of the keyboard, and a finished line checks itself.
// The picture is for a keyboard with Latin letters printed on it; on a phone
// the letters are on the keys already, so it is off there by default.
//
// Typing is practice, not memory work: nothing is put on the review schedule.
// What is kept is which steps were done and the best speed (typing-progress.js).

import { state } from '../state.js';
import { escHtml, levenshtein } from '../utils.js';
import { showScreen } from '../router.js';
import { VOCAB, WORK_THEMES } from '../data/vocab-uk.js';
import { UNITS } from '../data/path/index.js';
import { ALPHABET } from '../data/alphabet.js';
import { STAGES, EXTRA_WORDS, NAMES, KEY_ROWS } from '../data/typing.js';
import { stageRecord, recordRound, noteKey, noteAnswer, flush, troubleLetters, typingStats, nextStage } from '../data/typing-progress.js';
import { runSession } from './course-engine.js';
import { L, isNL, loc, shuffle } from './drill-core.js';
import { openKeyboardHelp } from '../keyboard-help.js';
import { courseName } from '../course-names.js';

const COURSE = { icon: '⌨️', get name() { return courseName('typing'); } };
const ACCENT = { main: '#475569', dark: '#1e293b', soft: '#f1f5f9', border: '#cbd5e1' };
const PREFS_KEY = 'typingPrefs';
const FREE = 'free';   // the practice round keeps its best speed under this id

const isMac = /Mac/.test(navigator.platform || '') || /Macintosh/.test(navigator.userAgent);
// A phone or tablet: the on-screen keyboard shows the letters, a physical one does not.
const isTouch = () => window.matchMedia('(hover: none), (pointer: coarse)').matches;

let prefs = null;
function loadPrefs() {
  if (prefs) return prefs;
  let p = null;
  try { p = JSON.parse(localStorage.getItem(PREFS_KEY)); } catch { /* ignore */ }
  prefs = { kb: typeof p?.kb === 'boolean' ? p.kb : !isTouch() };
  return prefs;
}
const savePrefs = () => localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));

function getScreen() { return document.getElementById('typingScreen'); }

// ── Comparing what was typed ─────────────────────────────────────────────────

// Every apostrophe a keyboard may produce counts as the apostrophe.
const apos = s => String(s).replace(/[’ʼ`´‘]/g, "'");
const fold = (s, caseless) => { const x = apos(s).replace(/\s+/g, ' ').trim(); return caseless ? x.toLowerCase() : x; };

// Exact, or one slip in a line of eight characters or more.
function verdict(answer, target, caseless, { slip = true } = {}) {
  const a = fold(answer, caseless), t = fold(target, caseless);
  const isExact = a === t;
  const isClose = !isExact && slip && t.length >= 8 && levenshtein(a, t) <= 1;
  return { isExact, isClose, isCorrect: isExact || isClose, quality: isExact ? 5 : isClose ? 3 : 1 };
}

// ── The keyboard on screen ───────────────────────────────────────────────────

const LATIN = Object.fromEntries(KEY_ROWS.flat());   // { й: 'Q', … }

// Which keys to light for a character, and how to say it in words.
function whereIs(ch) {
  const low = ch.toLowerCase(), upper = ch !== low;
  const key = k => L(`the ${k} key`, `toets ${k}`);
  if (ch === ' ') return { keys: [' '], text: L('space bar', 'spatiebalk') };
  if (low === 'ґ') return { keys: upper ? ['shift', 'г'] : ['г'], text: `${ch} = ${upper ? 'Shift + ' : ''}${isMac ? 'Option' : L('right Alt', 'rechter Alt')} + г` };
  if (ch === "'") return { keys: [], text: isMac ? L('apostrophe = the \\ key', 'apostrof = de \\-toets') : L('apostrophe = the key left of the 1', 'apostrof = de toets links van de 1') };
  if (ch === ',') return { keys: ['shift', '.'], text: `, = Shift + ${key('/')}` };
  if (ch === '?') return { keys: ['shift'], text: '? = Shift + 7' };
  if (ch === '!') return { keys: ['shift'], text: '! = Shift + 1' };
  if (LATIN[low]) return { keys: upper ? ['shift', low] : [low], text: `${ch} = ${upper ? 'Shift + ' : ''}${key(LATIN[low])}` };
  return { keys: [], text: '' };
}

function keyboardHtml() {
  const key = ([ch, latin]) => `<span class="ty-key" data-k="${escHtml(ch)}"><b>${escHtml(ch)}</b><i>${escHtml(latin)}</i></span>`;
  return `
    <div class="ty-kb" aria-hidden="true">
      <div class="ty-kb-row">${KEY_ROWS[0].map(key).join('')}</div>
      <div class="ty-kb-row ty-kb-r2">${KEY_ROWS[1].map(key).join('')}</div>
      <div class="ty-kb-row ty-kb-r3"><span class="ty-key ty-key-shift" data-k="shift"><b>⇧</b></span>${KEY_ROWS[2].map(key).join('')}</div>
      <div class="ty-kb-row"><span class="ty-key ty-key-space" data-k=" "></span></div>
      <div class="ty-kb-cap"></div>
    </div>`;
}

// Puts the picture under the answer field; returns point(ch): light the key for ch.
function mountKeyboard(root) {
  const area = root.querySelector('.ce-input-area');
  if (!area) return null;
  area.insertAdjacentHTML('afterend', keyboardHtml());
  const kb = root.querySelector('.ty-kb'), cap = kb.querySelector('.ty-kb-cap');
  const keys = [...kb.querySelectorAll('.ty-key')];
  return {
    point(ch) {
      keys.forEach(el => el.classList.remove('on'));
      if (ch == null) { cap.textContent = ''; return; }
      const w = whereIs(ch);
      w.keys.forEach(k => keys.find(el => el.dataset.k === k)?.classList.add('on'));
      cap.textContent = w.text;
    },
  };
}

// ── A card that reacts while it is typed ─────────────────────────────────────
// text: what is to be typed · st: this card's own counters { started, errs }
// point: light the next key (off for "which letter is this?", where it would be the answer)
// auto: 'complete' checks the line once it is typed in full, 'first' on the first character
function live(text, st, { point = true, auto = 'complete', caseless = true } = {}) {
  return ({ root, input, submit }) => {
    const chars = [...text];
    const spans = [...root.querySelectorAll('.ty-ch')];
    const kb = loadPrefs().kb ? mountKeyboard(root) : null;
    const same = (a, b) => fold(a, caseless) === fold(b, caseless);
    let before = 0;
    const paint = () => {
      const v = [...input.value];
      spans.forEach((sp, i) => {
        const typed = i < v.length;
        sp.classList.toggle('ty-ok', typed && same(v[i], chars[i]));
        sp.classList.toggle('ty-bad', typed && !same(v[i], chars[i]));
        sp.classList.toggle('ty-next', i === v.length);
      });
      if (kb) kb.point(point && v.length < chars.length ? chars[v.length] : null);
    };
    input.addEventListener('input', () => {
      if (!st.started) st.started = performance.now();
      const v = [...input.value];
      if (v.length <= 1) before = 0;   // the field was emptied (after "try again"): count from the start
      // One character more: was it the right key? A Latin letter is the wrong
      // keyboard, not a wrong key; the engine says so when the line is checked.
      if (v.length > before && v.length <= chars.length && !/[a-z]/i.test(v[v.length - 1])) {
        const i = v.length - 1, hit = same(v[i], chars[i]);
        if (!hit) st.errs++;
        if (/\p{L}/u.test(chars[i])) noteKey(chars[i].toLowerCase(), hit);
      }
      before = v.length;
      paint();
      if (auto === 'first' ? v.length >= 1 : same(input.value, text)) submit();
    });
    paint();
  };
}

// ── Cards ────────────────────────────────────────────────────────────────────

const sayBtn = text => `<button class="vc-say-inline" type="button" data-say="${escHtml(text)}">🔊</button>`;

// A letter's row in the alphabet table: its capital, and how it sounds in the learner's language.
function letterInfo(ch) {
  const row = ALPHABET.find(a => a.c.split(' ')[1] === ch);
  if (!row) return { upper: ch, lower: ch, l: '', s: '' };
  const hint = isNL() ? row.nl : row;
  return { upper: row.c.split(' ')[0], lower: ch, l: hint.l, s: hint.s };
}

// Where ґ and the apostrophe are, in words: they sit elsewhere on every system.
const hardKeyTip = ch => (ch === 'ґ'
  ? (isTouch() ? L('ґ has no key of its own: hold г down and pick ґ.', 'ґ heeft geen eigen toets: houd г ingedrukt en kies ґ.')
    : isMac ? L('ґ: hold Option and press г.', 'ґ: houd Option ingedrukt en druk op г.')
    : L('ґ: hold the right Alt key and press г.', 'ґ: houd de rechter Alt-toets ingedrukt en druk op г.'))
  : ch === "'"
    ? (isTouch() ? L('It is with the punctuation (the 123 key). Any apostrophe your keyboard gives counts.', 'Hij staat bij de leestekens (de 123-toets). Elke apostrof die je toetsenbord geeft telt.')
      : isMac ? L('On a Mac it is the \\ key.', 'Op een Mac is het de \\-toets.')
      : L('On Windows it is the key left of the 1.', 'Op Windows is het de toets links van de 1.'))
    : '');

// A new letter: shown with its sound and its key, typed once. Nothing is counted.
function introCard(ch) {
  const st = { started: 0, errs: 0 };
  const isApos = ch === "'";
  const info = letterInfo(ch);
  const tip = hardKeyTip(ch);
  return {
    key: `ty:intro:${ch}`, course: COURSE, intro: true,
    promptHtml: `
      <div class="ty-card ty-intro">
        <div class="ty-badge">✨ ${isApos ? L('The apostrophe', 'De apostrof') : L('New letter', 'Nieuwe letter')}</div>
        <div class="ty-letter">${isApos ? "'" : `${escHtml(info.upper)} ${escHtml(info.lower)} ${sayBtn(ch)}`}</div>
        <div class="ty-sound">${isApos
          ? L('keeps two sounds apart: п\'ять is p + yat', 'houdt twee klanken uit elkaar: п\'ять is p + jat')
          : `<b>${escHtml(info.l)}</b> · ${escHtml(info.s)}`}</div>
        ${tip ? `<div class="ty-tip">${escHtml(tip)}</div>` : ''}
        <div class="ty-ask">${isApos ? L('Type it', 'Typ hem') : L('Type the letter', 'Typ de letter')}</div>
      </div>`,
    autoSay: isApos ? null : ch,
    input: { type: 'text', lang: 'uk', placeholder: L('Type it here…', 'Typ hem hier…') },
    // The wrong key here means "look again", not a verdict: the learner tries until it is the right one.
    check(answer) {
      const v = verdict(answer, ch, true, { slip: false });
      return v.isExact ? v : { retry: isApos
        ? L('That is not the apostrophe. Look for it and try again.', 'Dat is niet de apostrof. Zoek hem en probeer het opnieuw.')
        : L(`That is another letter. Find ${ch} and try again.`, `Dat is een andere letter. Zoek de ${ch} en probeer het opnieuw.`) };
    },
    record: () => null, override: null,
    correctText: ch,
    mount: live(ch, st, { auto: 'first' }),
    missed: { left: info.l, right: ch, extra: '' },
  };
}

// The sound is given, the letter is typed: the one card here that asks for memory.
function soundCard(ch) {
  const st = { started: 0, errs: 0 };
  const info = letterInfo(ch);
  return {
    key: `ty:sound:${ch}`, course: COURSE, intro: false,
    promptHtml: `
      <div class="ty-card">
        <div class="ty-label">${L('Which letter is this?', 'Welke letter is dit?')}</div>
        <div class="ty-letter ty-letter-latin">${escHtml(info.l)} ${sayBtn(ch)}</div>
        <div class="ty-sound">${escHtml(info.s)}</div>
      </div>`,
    autoSay: ch,
    input: { type: 'text', lang: 'uk', placeholder: L('Type the letter…', 'Typ de letter…') },
    check: answer => verdict(answer, ch, true, { slip: false }),
    record: () => { noteAnswer(); return null; },
    override: null,
    correctText: ch, say: ch,
    mount: live(ch, st, { point: false, auto: 'first' }),
    missed: { left: `${info.l} · ${info.s}`, right: ch, extra: '', say: ch },
  };
}

// A line to copy: syllables, words, names or a sentence. Its time and its wrong
// keys go into the round's totals, from which the speed is worked out.
function lineCard(text, round, { gloss = '', caseless = true, say = null, tip = '', label = null } = {}) {
  const st = { started: 0, errs: 0 };
  const target = text.split(' ').map(w => `<span class="ty-word">${[...w].map(c => `<span class="ty-ch">${escHtml(c)}</span>`).join('')}</span>`)
    .join('<span class="ty-ch ty-sp"> </span>');
  return {
    key: `ty:line:${text}`, course: COURSE, intro: false,
    promptHtml: `
      <div class="ty-card">
        <div class="ty-label">${label || L('Type this', 'Typ dit over')}</div>
        ${tip ? `<div class="ty-tip">${escHtml(tip)}</div>` : ''}
        <div class="ty-target">${target}</div>
        ${gloss ? `<div class="ty-gloss">${escHtml(gloss)}</div>` : ''}
      </div>`,
    input: { type: 'text', lang: 'uk', placeholder: L('Type the line…', 'Typ de regel over…') },
    check(answer) {
      st.ms = st.started ? performance.now() - st.started : 0;
      st.answer = answer;
      return verdict(answer, text, caseless);
    },
    record(res) {
      noteAnswer();
      round.chars += [...text].length;
      // The clock runs from the first key to the last, so it times one key fewer than the line has.
      if (st.ms) { round.timed += [...text].length - 1; round.ms += st.ms; }
      // Wrong keys along the way, or what was still wrong when the line was handed in, whichever is more.
      round.errs += Math.max(st.errs, res.isExact ? 0 : levenshtein(fold(text, caseless), fold(st.answer || '', caseless)));
      return null;
    },
    override: null, compareOnClose: true,
    correctText: text, say,
    mount: live(text, st, { caseless }),
    missed: { left: gloss || L('line', 'regel'), right: text, extra: '', say: say || text },
  };
}

// ── What a step is made of ───────────────────────────────────────────────────

// One meaning, short: "there is / is / are (у мене є = I have)" → "there is"
const meaningOf = w => (isNL() ? w.nl : w.en).split(' / ')[0].replace(/\s*\([^)]*\)/g, '').trim();
const chunk = (list, n) => list.reduce((rows, x, i) => { if (i % n === 0) rows.push([]); rows[rows.length - 1].push(x); return rows; }, []);

// Single lower-case words of the general vocabulary, most common first, plus the extras.
let pool = null;
function words() {
  if (pool) return pool;
  const seen = new Set();
  pool = [...VOCAB.filter(w => !WORK_THEMES.has(w.theme)), ...EXTRA_WORDS]
    .filter(w => /^[а-яіїєґ']+$/.test(w.uk) && w.uk.length >= 2 && w.uk.length <= 8 && !seen.has(w.uk) && seen.add(w.uk));
  return pool;
}

// Words for a step: only letters met so far, at least one of the step's own. Every
// new letter turns up at least twice where the vocabulary allows; the rest are
// drawn from the most common words that fit.
function stageWords(stage, n) {
  const idx = STAGES.indexOf(stage);
  const known = new Set(STAGES.slice(0, idx + 1).flatMap(s => [...s.letters]));
  const fresh = [...stage.letters];
  const fits = words().filter(w => [...w.uk].every(c => known.has(c)) && fresh.some(c => w.uk.includes(c)));
  const picked = [];
  for (const letter of fresh) picked.push(...shuffle(fits.filter(w => w.uk.includes(letter) && !picked.includes(w))).slice(0, 2));
  const rest = shuffle(fits.slice(0, 60).filter(w => !picked.includes(w)));
  return shuffle([...picked, ...rest].slice(0, Math.max(n, picked.length)));
}

const wordLine = (ws, round) => lineCard(ws.map(w => w.uk).join(' '), round, {
  gloss: ws.map(w => `${w.uk} = ${meaningOf(w)}`).join(' · '), say: ws.map(w => w.uk).join(', '),
});

// Short sentences of the first units of the course path, typed as they stand.
function sentenceLines(n, round, tip = '') {
  const plain = /^[А-ЯІЇЄҐа-яіїєґ' .,?!]+$/;
  const fits = UNITS.filter(u => u.level === 'A1' && !u.track).slice(0, 12).flatMap(u => u.sentences).filter(x => plain.test(x.uk) && x.uk.length <= 32);
  return shuffle(fits).slice(0, n).map((x, i) => lineCard(x.uk, round, {
    caseless: false, gloss: isNL() ? x.nl : x.en, say: x.uk, tip: i === 0 ? tip : '',
  }));
}

function stageCards(stage, round) {
  if (stage.kind === 'capitals') {
    const tip = isTouch() ? L('A capital: tap ⇧ first.', 'Een hoofdletter: tik eerst op ⇧.') : L('A capital: hold Shift and press the letter.', 'Een hoofdletter: houd Shift ingedrukt en druk op de letter.');
    return chunk(shuffle(NAMES).slice(0, 12), 2).map((pair, i) => lineCard(pair.join(' '), round, { caseless: false, say: pair.join(', '), tip: i === 0 ? tip : '' }));
  }
  if (stage.kind === 'sentences') {
    return sentenceLines(8, round, isTouch()
      ? L('Full stop, comma and question mark are on the keyboard or behind the 123 key.', 'Punt, komma en vraagteken staan op het toetsenbord of achter de 123-toets.')
      : L('Full stop: the / key. Comma: Shift + the / key. Question mark: Shift + 7.', 'Punt: toets /. Komma: Shift + toets /. Vraagteken: Shift + 7.'));
  }
  const letters = [...stage.letters];
  return [
    ...letters.map(introCard),
    ...shuffle(letters.filter(ch => ch !== "'")).map(soundCard),
    ...stage.drills.map(t => lineCard(t, round, { label: L('Syllables: type this', 'Lettergrepen: typ dit over') })),
    ...chunk(stageWords(stage, 12), 3).map(ws => wordLine(ws, round)),
  ];
}

// The practice round: words from everything, half of them with the letters that
// go wrong most, and two sentences.
function freeCards(round) {
  const trouble = troubleLetters();
  const all = words();
  const hard = shuffle(all.filter(w => trouble.some(l => w.uk.includes(l)))).slice(0, 9);
  const rest = shuffle(all.slice(0, 500).filter(w => !hard.includes(w))).slice(0, 18 - hard.length);
  return [...chunk(shuffle([...hard, ...rest]), 3).map(ws => wordLine(ws, round)), ...sentenceLines(2, round)];
}

// ── Rounds ───────────────────────────────────────────────────────────────────

// Speed in characters a minute and the share of keys hit right, or null when too little was typed.
function roundStats(round) {
  if (round.timed < 10 || round.ms < 1500) return { cpm: null, acc: null };
  return { cpm: Math.round(round.timed / (round.ms / 60000)), acc: Math.max(0, 1 - round.errs / round.chars) };
}

function run({ id, title, cards, round, next }) {
  if (!cards.length) { showMenu(); return; }
  runSession({
    screen: getScreen(), icon: COURSE.icon, title, accent: ACCENT, cards,
    onExit: () => { flush(); showMenu(); },   // the key counts of a round that was left are kept too
    again: () => {
      const { cpm, acc } = roundStats(round);
      round.result = { cpm, acc, record: recordRound(id, { cpm: cpm || 0, acc: acc || 0 }) };
      return next();
    },
    scoreNote: () => {
      const r = round.result;
      if (!r || r.cpm == null) return '';
      return `⌨️ ${L(`<b>${r.cpm}</b> characters a minute · <b>${Math.round(r.acc * 100)}%</b> of the keys right`, `<b>${r.cpm}</b> tekens per minuut · <b>${Math.round(r.acc * 100)}%</b> van de toetsen raak`)}${r.record ? ` · 🏆 ${L('your best', 'je beste tot nu toe')}` : ''}`;
    },
  });
}

function startStage(stage) {
  const round = { chars: 0, timed: 0, ms: 0, errs: 0 };
  const n = STAGES.indexOf(stage) + 1;
  run({
    id: stage.id, round, cards: stageCards(stage, round),
    title: `${COURSE.name} · ${L('step', 'stap')} ${n}`,
    next: () => {
      const after = STAGES[n];
      return after
        ? { label: `▶ ${L('Next step', 'Volgende stap')}: ${loc(after.title)}`, run: () => startStage(after) }
        : { label: `🔀 ${L('Practice round', 'Oefenronde')}`, run: startFree };
    },
  });
}

function startFree() {
  const round = { chars: 0, timed: 0, ms: 0, errs: 0 };
  run({
    id: FREE, round, cards: freeCards(round),
    title: `${COURSE.name} · ${L('practice round', 'oefenronde')}`,
    next: () => ({ label: `🔀 ${L('Another round', 'Nog een ronde')}`, run: startFree }),
  });
}

// ── Menu ─────────────────────────────────────────────────────────────────────

// Where the course was opened from: ← returns there (Home, a unit page, the hub).
let origin = null;

export function openTypingScreen() {
  const active = document.querySelector('.screen.active')?.id;
  if (active && active !== 'typingScreen') origin = { id: active, y: window.scrollY };
  showScreen('typingScreen');
  showMenu();
}

function leave() {
  // The hub shows how far the course is, so it is written out again; other screens return as they were.
  if (!origin || origin.id === 'exercisesScreen' || !document.getElementById(origin.id)) { window.openExercisesScreen(); return; }
  showScreen(origin.id);
  window.scrollTo(0, origin.y);
}

const stageLetters = s => (s.kind === 'capitals' ? 'А Б В' : s.kind === 'sentences' ? '. , ? !' : [...s.letters].join(' '));

function showMenu() {
  const s = getScreen();
  loadPrefs();
  const st = typingStats();
  const upNext = nextStage();
  const trouble = troubleLetters();
  const free = stageRecord(FREE);
  const perMin = L('a minute', 'per minuut');

  const row = (stage, i) => {
    const rec = stageRecord(stage.id);
    return `
      <button class="ty-stage ${stage === upNext ? 'ty-stage-next' : ''} ${rec?.done ? 'done' : ''}" data-stage="${stage.id}">
        <span class="ty-stage-num">${i + 1}</span>
        <span class="ty-stage-text">
          <span class="ty-stage-letters">${escHtml(stageLetters(stage))}</span>
          <span class="ty-stage-title">${escHtml(loc(stage.title))}</span>
          <span class="ty-stage-sub">${escHtml(loc(stage.sub))}</span>
        </span>
        <span class="ty-stage-status">${rec?.done ? `✓${rec.cpm ? `<small>${rec.cpm} ${perMin}</small>` : ''}` : stage === upNext ? '▶' : ''}</span>
      </button>`;
  };

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="tyBack">←</button>
      <div>
        <div class="lesson-title">${COURSE.icon} ${escHtml(COURSE.name)}</div>
        <div class="lesson-subtitle">${L('Get used to the Ukrainian keyboard, a few letters at a time', 'Raak gewend aan het Oekraïense toetsenbord, een paar letters per keer')}</div>
      </div>
    </div>

    <div class="ty-stats-bar">
      <span class="ty-stat">✅ ${st.done} / ${st.total} ${L('steps', 'stappen')}</span>
      ${st.best ? `<span class="ty-stat">🏆 ${st.best} ${L('characters a minute', 'tekens per minuut')}</span>` : ''}
    </div>

    <button class="ty-link" id="tySetup" type="button">🔧 ${L('No Ukrainian keyboard yet? How to add one', 'Nog geen Oekraïens toetsenbord? Zo voeg je het toe')} →</button>
    <button class="ty-toggle ${prefs.kb ? 'active' : ''}" id="tyKb" type="button" aria-pressed="${prefs.kb}">
      <span class="ty-check">${prefs.kb ? '✓' : ''}</span>
      <span>${L('Show the keyboard on screen: for a keyboard that has Latin letters on its keys', 'Toon het toetsenbord op het scherm: voor een toetsenbord met Latijnse letters op de toetsen')}</span>
    </button>

    <div class="ty-section">${L('Steps', 'Stappen')}</div>
    <div class="ty-stages">${STAGES.map(row).join('')}</div>

    <div class="ty-section">${L('Keep it up', 'Bijhouden')}</div>
    <button class="ty-stage ty-free" id="tyFree">
      <span class="ty-stage-num">🔀</span>
      <span class="ty-stage-text">
        <span class="ty-stage-title">${L('Practice round', 'Oefenronde')}</span>
        <span class="ty-stage-sub">${trouble.length
          ? L(`words and sentences from all letters, with extra ${trouble.join(' ')}: those go wrong most`, `woorden en zinnen met alle letters, met extra ${trouble.join(' ')}: die gaan het vaakst mis`)
          : L('words and sentences from all letters', 'woorden en zinnen met alle letters')}</span>
      </span>
      <span class="ty-stage-status">${free?.cpm ? `<small>${free.cpm} ${perMin}</small>` : ''}</span>
    </button>`;

  s.querySelector('#tyBack').addEventListener('click', leave);
  s.querySelector('#tySetup').addEventListener('click', openKeyboardHelp);
  s.querySelector('#tyKb').addEventListener('click', () => { prefs.kb = !prefs.kb; savePrefs(); showMenu(); });
  s.querySelectorAll('[data-stage]').forEach(b => b.addEventListener('click', () => startStage(STAGES.find(x => x.id === b.dataset.stage))));
  s.querySelector('#tyFree').addEventListener('click', startFree);
  window.scrollTo({ top: 0 });
}
