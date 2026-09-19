import { state } from '../state.js';
import { escHtml, levenshtein } from '../utils.js';
import { speakText } from '../voice.js';
import { THEMES as CORE_THEMES, POS_LABEL } from '../data/vocab-uk.js';
import { deck, myWords, recordVocab, regradeVocab, dueVocab, unseenVocab, weakVocab, vocabStats, getVocabProgress } from '../data/vocab-progress.js';
import { L, loc, isNL, targetCode, shuffle, grade, normalise, wireSpeakButtons } from './drill-core.js';
import { runSession } from './course-engine.js';

// ── State ────────────────────────────────────────────────────────────────────

const PREFS_KEY = 'vocabDrillPrefs';

let vc = {
  theme:  'all',
  // 'type' (meaning → word) | 'translate' (word → meaning, typed) | 'mixed' (both, typed)
  // | 'dictate' (audio → word) | 'choose' (word → meaning, four options)
  qMode:  'type',
  sessionKind: 'new',
};

const COURSE = { icon: '🧠', get name() { return L('Vocabulary', 'Woordenschat'); } };
const ACCENT = { main: '#db2777', dark: '#9d174d', soft: '#fdf2f8', border: '#fbcfe8' };

function loadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY));
    if (p?.theme) vc.theme = p.theme;
    if (['type', 'translate', 'mixed', 'dictate', 'choose'].includes(p?.qMode)) vc.qMode = p.qMode;
  } catch { /* ignore */ }
}
function savePrefs() { localStorage.setItem(PREFS_KEY, JSON.stringify({ theme: vc.theme, qMode: vc.qMode })); }

function getScreen() { return document.getElementById('vocabDrillScreen'); }

const meaning = w => (state.nativeLanguage === 'nl' ? w.nl : w.en);
// The themes on offer: the core themes for Ukrainian, plus "My words" (saved from
// conversations) whenever there are any. For other languages that is the whole deck.
const MINE = { icon: '📇', en: 'My words', nl: 'Mijn woorden' };
const isUK = () => state.currentLanguage === 'uk';
function themes() {
  const t = isUK() ? { ...CORE_THEMES } : {};
  if (myWords().length || !isUK()) t.mine = MINE;
  return t;
}
const themeName = t => (t === 'all' ? L('All themes', 'Alle thema\'s') : loc(themes()[t] || MINE));
const wordsOf = theme => deck().filter(w => theme === 'all' || w.theme === theme);

// Grammar tag shown with a word: gender for nouns, aspect partner for verbs.
function wordTag(w) {
  if (w.pos === 'n') return `${loc(POS_LABEL.n)} · ${w.gender}`;
  if (w.pos === 'v') return w.perfective ? `${loc(POS_LABEL.v)} · ${L('perf.', 'volt.')} ${w.perfective}` : loc(POS_LABEL.v);
  if (w.pos === 'saved') return w.posText;
  return loc(POS_LABEL[w.pos]) || w.pos;
}

// The tag on a question card. It never names the aspect partner: "perf. зробити"
// next to "to do" would hand over the stem of the answer.
function promptTag(w, shown = w.uk) {
  if (w.pos !== 'v' || !w.perfective) return wordTag(w);
  return `${loc(POS_LABEL.v)} · ${shown === w.perfective ? L('perfective', 'voltooid') : L('imperfective', 'onvoltooid')}`;
}

// ── Typed meanings ───────────────────────────────────────────────────────────
// "to go (on foot) / to walk" accepts "to go", "go", "to walk" and "walk";
// "potato(es)" accepts both spellings. A leading "to" or article is optional.

// " / " separates answers, except inside a gloss: "you (plural / formal)" is one answer.
function splitAlts(text) {
  const out = [];
  let depth = 0, cur = '';
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')') depth--;
    if (depth === 0 && text.startsWith(' / ', i)) { out.push(cur); cur = ''; i += 2; } else cur += text[i];
  }
  out.push(cur);
  return out;
}
const GLOSS = /\s+\([^)]*\)/g;

// plainOnly keeps the answers that carry no gloss: "to lie (tell lies)" and
// "to lie (down)" share a spelling in English, not a meaning.
function meaningForms(text, { plainOnly = false } = {}) {
  const out = [];
  for (const alt of splitAlts(text)) {
    if (plainOnly && /\s\(/.test(alt)) continue;
    const bare = alt.replace(GLOSS, '').trim();
    if (!bare) continue;
    if (bare.includes('(')) out.push(bare.replace(/\([^)]*\)/g, ''), bare.replace(/[()]/g, ''));
    else out.push(bare);
  }
  return out;
}
const LEAD = /^(to|a|an|the|de|het|een|om te|te)\s+/;
const core = s => normalise(s).replace(/[.!?,;:]+$/, '').trim().replace(LEAD, '');
const meaningCores = w => meaningForms(meaning(w)).map(core);

let allCores = null, allCoresLang = null;
function everyMeaning() {
  const stamp = `${state.nativeLanguage}|${state.currentLanguage}|${myWords().length}`;
  if (!allCores || allCoresLang !== stamp) {
    allCores = new Set(deck().flatMap(meaningCores));
    allCoresLang = stamp;
  }
  return allCores;
}

// English and Dutch words sit closer together than Ukrainian ones (where / there,
// though / through), so a one-letter slip only passes on 6+ letters and never
// when what was typed is itself the meaning of another word in the deck.
function gradeMeaning(answer, w) {
  const a = core(answer);
  const forms = meaningCores(w);
  const isExact = forms.includes(a);
  const isClose = !isExact && !everyMeaning().has(a) && forms.some(f => f.length >= 6 && levenshtein(f, a) <= 1);
  return { isExact, isClose, isCorrect: isExact || isClose };
}

// Another word of the deck that fits the same prompt (теж / також, обирати / вибирати).
// Only unglossed meanings count as shared.
function synonymTyped(answer, w) {
  const a = normalise(answer);
  const plain = x => meaningForms(meaning(x), { plainOnly: true }).map(core);
  const mine = new Set(plain(w));
  return deck().find(o => o.key !== w.key && o.pos === w.pos
    && (normalise(o.uk) === a || (o.perfective && normalise(o.perfective) === a))
    && plain(o).some(m => mine.has(m)));
}

// ── Public entry ─────────────────────────────────────────────────────────────

export function openVocabDrillScreen(theme) {
  loadPrefs();
  if (theme) vc.theme = theme;
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
  if (vc.theme !== 'all' && !themes()[vc.theme]) vc.theme = 'all';
  const verbCount = wordsOf('verbs').length;
  const mineCount = myWords().length;
  const nat = isNL() ? 'NL' : 'EN';
  const target = targetCode();
  const unseenHere = unseenVocab().filter(w => vc.theme === 'all' || w.theme === vc.theme).length;

  const chips = ['all', ...Object.keys(themes())].map(t => `
    <button class="vc-chip ${vc.theme === t ? 'active' : ''}" data-theme="${t}">${t === 'all' ? '🌐' : themes()[t].icon} ${escHtml(themeName(t))}${t === 'mine' ? ` (${mineCount})` : ''}</button>`).join('');

  const modeBtn = (id, icon, label, sub, wide = false) => `
    <button class="vc-mode-btn ${wide ? 'vc-mode-wide' : ''} ${vc.qMode === id ? 'active' : ''}" data-mode="${id}">
      <span class="vc-mode-icon">${icon}</span>
      <span class="vc-mode-label">${label}</span>
      <span class="vc-mode-sub">${sub}</span>
    </button>`;

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vcBack">←</button>
      <div>
        <div class="lesson-title">🧠 ${L('Vocabulary', 'Woordenschat')}</div>
        <div class="lesson-subtitle">${isUK()
          ? L(`${st.total - mineCount} core words, ${verbCount} of them verbs${mineCount ? ` · ${mineCount} of your own` : ''}`, `${st.total - mineCount} kernwoorden, waarvan ${verbCount} werkwoorden${mineCount ? ` · ${mineCount} van jezelf` : ''}`)
          : L(`${mineCount} words you saved from conversations · typed both ways`, `${mineCount} woorden die je uit gesprekken hebt opgeslagen · in beide richtingen typen`)}</div>
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
      ${modeBtn('type', '✍️', `${nat} → ${target}`, L('type the word', 'typ het woord'))}
      ${modeBtn('translate', '💡', `${target} → ${nat}`, L('type the meaning', 'typ de betekenis'))}
      ${modeBtn('mixed', '🔀', L('Both ways', 'Beide kanten'), L('typed, mixed', 'typen, door elkaar'))}
      ${modeBtn('dictate', '👂', L('Dictation', 'Dictee'), L('audio → word', 'geluid → woord'), true)}
      ${modeBtn('choose', '👆', L('Choose', 'Kiezen'), L('word → meaning, no typing', 'woord → betekenis, zonder typen'), true)}
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
  s.querySelector('#vcBrowse').addEventListener('click', () => showReference(vc.theme === 'all' ? Object.keys(themes())[0] : vc.theme));
  if (!st.total) {   // another language, nothing saved yet
    s.querySelector('.vc-session-grid').outerHTML = `<div class="vc-empty">${L('No words yet. Tap any word in a conversation to look it up and save it; it then shows up here to learn.', 'Nog geen woorden. Tik in een gesprek op een woord om het op te zoeken en op te slaan; daarna kun je het hier leren.')}</div>`;
    s.querySelector('#vcBrowse').remove();
  }
}

// ── Reference ────────────────────────────────────────────────────────────────

function showReference(theme) {
  const s = getScreen();
  const all = themes();
  const keys = Object.keys(all);
  const idx = keys.indexOf(theme);
  const words = wordsOf(theme);

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vcRefBack">←</button>
      <div>
        <div class="lesson-title">${all[theme].icon} ${escHtml(loc(all[theme]))}</div>
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
// 'new'   : next 10 unseen words in frequency order. Each appears first with the
//           word shown (copy it, hear it), then from memory: one pass in the chosen
//           direction, or word → meaning followed by meaning → word in 'mixed'.
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
    words = shuffle(deck().filter(inTheme)).slice(0, 20);
  }
  if (!words.length) { showMenu(); return; }

  // A translate card shows the perfective partner now and then: in real text a
  // verb turns up in either aspect, and зробити has to ring the same bell as робити.
  const card = (w, dir) => (dir === 'translate' ? translateCard(w) : produceCard(w, { dictation: vc.qMode === 'dictate' }));
  const dirOf = () => (vc.qMode === 'translate' ? 'translate'
    : vc.qMode === 'mixed' ? (Math.random() < 0.5 ? 'translate' : 'produce') : 'produce');

  let cards;
  if (vc.qMode === 'choose') {
    cards = words.map(chooseCard);
  } else if (kind === 'new') {
    // first the word shown and copied, then from memory: one pass in the chosen
    // direction, or word → meaning followed by meaning → word in 'mixed'
    const passes = vc.qMode === 'mixed' ? ['translate', 'produce'] : [dirOf()];
    cards = [
      ...words.map(w => produceCard(w, { intro: true })),
      ...passes.flatMap(dir => shuffle(words).map(w => card(w, dir))),
    ];
  } else {
    cards = words.map(w => card(w, dirOf()));
  }

  runSession({
    screen: getScreen(), icon: COURSE.icon, title: COURSE.name, accent: ACCENT, cards,
    onExit: showMenu,
    scoreSubtitle: () => { const st = vocabStats(); return `${COURSE.name} · ${st.learned}/${st.total} ${L('learned', 'geleerd')}`; },
    again: () => {
      if (kind === 'new') return unseenVocab().some(inTheme) ? { label: '📥 ' + L('Next 10 new', 'Volgende 10'), run: () => startSession('new') } : null;
      if (kind === 'due') return dueVocab().length ? { label: '🔄 ' + L('More reviews', 'Verder herhalen'), run: () => startSession('due') } : null;
      return { label: '🔄 ' + L('Another round', 'Nog een ronde'), run: () => startSession(kind) };
    },
  });
}

// ── Cards ────────────────────────────────────────────────────────────────────
// What the course engine needs to ask one word. Also used by the Review queue,
// where vocabulary cards sit between cards of other courses.

const wordLine = w => `
  <div class="vc-word-line">
    <span class="vc-word-uk">${escHtml(w.uk)}</span>
    <span class="vc-word-eq">=</span>
    <span class="vc-word-meaning">${escHtml(meaning(w))}</span>
    <span class="vc-word-tag">${escHtml(wordTag(w))}</span>
    ${w.details ? `<span class="vc-word-tag">${escHtml(w.details)}</span>` : ''}
  </div>`;

const base = w => ({ key: w.key, course: COURSE, say: w.uk, detailHtml: wordLine(w) });

// Meaning → word (or audio → word). Introduction cards show the word too.
function produceCard(w, { intro = false, dictation = false } = {}) {
  const heard = dictation && !intro;
  return {
    ...base(w), intro,
    promptHtml: `
      <div class="vc-q-card ${intro ? 'vc-q-intro' : ''}">
        ${intro ? `<div class="vc-q-badge">✨ ${L('New word', 'Nieuw woord')}</div>` : ''}
        ${heard ? `<button class="vc-big-listen" type="button" data-say="${escHtml(w.uk)}">🔊</button>
                   <div class="vc-q-hint">${L('Type what you hear', 'Typ wat je hoort')}</div>`
                : `<div class="vc-q-meaning">${escHtml(meaning(w))}</div>
                   <div class="vc-q-hint">${escHtml(intro ? wordTag(w) : promptTag(w))}</div>`}
        ${intro ? `<div class="vc-q-word">${escHtml(w.uk)} <button class="vc-say-inline" type="button" data-say="${escHtml(w.uk)}">🔊</button></div>
                   <div class="vc-q-hint">${L('Say it, then type it', 'Zeg het, typ het dan')}</div>` : ''}
      </div>`,
    autoSay: intro || heard ? w.uk : null,
    input: { type: 'text', lang: state.currentLanguage, placeholder: isUK() ? L('Type the Ukrainian…', 'Typ het Oekraïens…') : L('Type the word…', 'Typ het woord…') },
    check(answer) {
      const g = grade(answer, [w.uk], { minTypoLen: 5 });
      if (intro) return { ...g, quality: 0 };
      // A different word that means the same is not a mistake: ask again, no penalty.
      const other = !g.isCorrect && !heard && synonymTyped(answer, w);
      if (other) return { retry: L(`${other.uk} fits too, but here it is another word. Try again.`, `${other.uk} past ook, maar hier is het een ander woord. Probeer opnieuw.`) };
      // The perfective partner is the right verb in the other aspect. Checked before the
      // typo tolerance has its say: вивчити for вивчати is one letter off, but no slip.
      if (!g.isExact && !heard && w.perfective && normalise(answer) === normalise(w.perfective)) {
        return { isExact: false, isClose: true, isCorrect: true, quality: 4,
                 headline: L('Right verb, but that is the perfective', 'Juiste werkwoord, maar dat is de voltooide vorm') };
      }
      return { ...g, quality: g.isExact ? 5 : g.isClose ? 3 : 1 };
    },
    record: res => recordVocab(w.key, res.quality),
    override: heard ? null : before => regradeVocab(w.key, before, 4),
    compareOnClose: true,
    correctText: w.uk,
    missed: { left: meaning(w), right: w.uk, extra: wordTag(w) },
  };
}

// Word → meaning, typed. Any one of the listed meanings is enough. The card shows
// the perfective partner now and then: in real text a verb turns up in either
// aspect, and зробити has to ring the same bell as робити.
function translateCard(w) {
  const shown = w.perfective && Math.random() < 0.4 ? w.perfective : w.uk;
  const langName = isNL() ? 'het Nederlands' : 'English';
  return {
    ...base(w), intro: false,
    promptHtml: `
      <div class="vc-q-card">
        <div class="vc-q-word vc-q-word-prompt">${escHtml(shown)} <button class="vc-say-inline" type="button" data-say="${escHtml(shown)}">🔊</button></div>
        <div class="vc-q-hint">${escHtml(promptTag(w, shown))}</div>
      </div>`,
    input: { type: 'text', lang: isNL() ? 'nl' : 'en', placeholder: L(`Type the meaning in ${langName}…`, `Typ de betekenis in ${langName}…`) },
    // Knowing a word when you see it is the easier half, so it ages a little slower than producing it.
    check(answer) { const g = gradeMeaning(answer, w); return { ...g, quality: g.isExact ? 4 : g.isClose ? 3 : 1 }; },
    record: res => recordVocab(w.key, res.quality),
    override: before => regradeVocab(w.key, before, 4),
    compareOnClose: false,
    correctText: meaning(w),
    missed: { left: shown, right: meaning(w), extra: wordTag(w), say: shown },
  };
}

// Word → meaning, four options. Recognition only, so a right answer counts as
// "hard" on the schedule and a wrong one as "again".
function chooseCard(w) {
  const pool = deck().filter(o => o.key !== w.key && (o.pos === w.pos || Math.random() < 0.3));
  const options = shuffle([w, ...shuffle(pool).slice(0, 3)]);
  return {
    ...base(w), intro: false,
    promptHtml: `
      <div class="vc-q-card">
        <div class="vc-q-word vc-q-word-prompt">${escHtml(w.uk)} <button class="vc-say-inline" type="button" data-say="${escHtml(w.uk)}">🔊</button></div>
        <div class="vc-q-hint">${escHtml(loc(POS_LABEL[w.pos]) || '')}</div>
      </div>`,
    input: { type: 'choice', options: options.map(o => ({ label: meaning(o), correct: o.key === w.key })) },
    record: res => recordVocab(w.key, res.quality),
    correctText: meaning(w),
    missed: { left: meaning(w), right: w.uk, extra: wordTag(w) },
  };
}

// For the Review queue: every due word as a card, in the direction set on the menu.
export function vocabDueCards() {
  loadPrefs();
  return dueVocab().map(w => (vc.qMode === 'translate' || (vc.qMode === 'mixed' && Math.random() < 0.5) ? translateCard(w) : produceCard(w)));
}
