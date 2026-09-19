import { state } from '../state.js';
import { escHtml } from '../utils.js';
import { PREFIXES, BASE_VERBS, buildPrefixDrillSet, getDistractorPrefixes, getDistractorMeanings } from '../data/prefix-verbs.js';
import { recordAnswer, hasWeaknessData, getWeakVerbCount, getWeakItems } from '../data/prefix-weakness.js';
import { L, loc, shuffle, grade } from './drill-core.js';
import { runSession } from './course-engine.js';
import { prefixProgress, prefixStats, prefixKey } from '../data/prefix-progress.js';

// ── State ────────────────────────────────────────────────────────────────────

let pd = {
  total:     25,
  mode:      'menu',        // 'menu' | 'refPrefix' | 'refVerb' | 'drill'
  refIdx:    0,
  prefixFilter: 'all',
  qMode:     localStorage.getItem('prefixDrillMode') || 'type', // 'type' | 'choose'
};

const COURSE = { icon: '🔗', get name() { return L('Prefixes', 'Voorvoegsels'); } };
const ACCENT = { main: '#7c3aed', dark: '#4c1d95', soft: '#f5f3ff', border: '#ddd6fe' };

function getScreen() { return document.getElementById('prefixDrillScreen'); }

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
  const st = prefixStats();
  const family = nextFamily();

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
      <span class="pd-stat">${hasWeaknessData() ? `🎯 ${getWeakVerbCount()} ${nl ? 'zwak' : 'weak'}` : `🔀 ${nl ? 'Gemengd' : 'Mixed'}`}</span>
    </div>

    <div class="pd-filter-section">
      <div class="pd-filter-label">${nl ? 'Voorvoegsel:' : 'Prefix:'}</div>
      <div class="pd-filter-row">
        <button class="pd-filter-btn ${pd.prefixFilter === 'all' ? 'active' : ''}" data-prefix="all">${nl ? 'Alle' : 'All'}</button>
        ${prefixBtns}
      </div>
    </div>

    <div class="pd-filter-section">
      <div class="pd-filter-label">${nl ? 'Hoe:' : 'How:'}</div>
      <div class="pd-filter-row">
        <button class="pd-filter-btn ${pd.qMode === 'type' ? 'active' : ''}" data-mode="type">✍️ ${nl ? 'Typen — schrijf het werkwoord' : 'Type — write the verb'}</button>
        <button class="pd-filter-btn ${pd.qMode === 'choose' ? 'active' : ''}" data-mode="choose">👆 ${nl ? 'Kiezen (meerkeuze)' : 'Choose (multiple choice)'}</button>
      </div>
    </div>

    <div class="pd-course-grid">
      <button class="pd-course-card pd-course-primary" id="pdLearnBtn" ${family ? '' : 'disabled'}>
        <span class="pd-menu-icon">🎓</span>
        <span class="pd-menu-title">${family ? `${nl ? 'Leer' : 'Learn'}: ${escHtml(family.bv.base)}` : (nl ? 'Alles gezien' : 'Everything seen')}</span>
        <span class="pd-menu-sub">${family ? `${family.fresh.length} ${nl ? 'nieuwe werkwoorden' : 'new verbs'} · ${nl ? 'familie' : 'family'} ${family.index + 1}/${BASE_VERBS.length}` : ''}</span>
      </button>
      <button class="pd-course-card" id="pdDueBtn" ${st.due ? '' : 'disabled'}>
        <span class="pd-menu-icon">🔄</span>
        <span class="pd-menu-title">${nl ? 'Herhalen' : 'Review due'}</span>
        <span class="pd-menu-sub">${st.due} ${nl ? 'aan de beurt' : 'due'} · ${st.learned}/${st.total} ${nl ? 'geleerd' : 'learned'}</span>
      </button>
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
        <span class="pd-menu-sub">25 ${nl ? 'vragen' : 'questions'} · ${pd.qMode === 'type' ? '✍️' : '👆'}</span>
      </button>
    </div>`;

  s.querySelector('#pdBack').addEventListener('click', () => window.openExercisesScreen());
  s.querySelector('#pdRefPrefixBtn').addEventListener('click', () => showRefByPrefix(0));
  s.querySelector('#pdRefVerbBtn').addEventListener('click', () => showRefByVerb(0));
  s.querySelector('#pdStartBtn').addEventListener('click', startDrill);
  s.querySelector('#pdLearnBtn').addEventListener('click', () => family && startLearnFamily(family.index));
  s.querySelector('#pdDueBtn').addEventListener('click', () => startPrefixReview(showMenu));

  s.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      pd.qMode = btn.dataset.mode;
      localStorage.setItem('prefixDrillMode', pd.qMode);
      s.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('active', b.dataset.mode === pd.qMode));
    });
  });
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
      <button class="pd-nav-btn pd-nav-primary" id="pdLearnFamily">🎓 ${nl ? 'Leer deze familie' : 'Learn this family'}</button>
      <button class="pd-nav-btn" id="pdNext" ${index >= BASE_VERBS.length - 1 ? 'disabled' : ''}>${nl ? 'Volgende' : 'Next'} →</button>
    </div>`;

  s.querySelector('#pdRefBack').addEventListener('click', showMenu);
  s.querySelector('#pdLearnFamily').addEventListener('click', () => startLearnFamily(index, { all: true }));
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

  // Verbs answered wrong before fill up to half the round, so they keep coming back.
  const weak = new Set(getWeakItems(999).map(i => i.verb));
  const weakQs = questions.filter(q => weak.has(q.verb)).slice(0, Math.ceil(pd.total / 2));
  const restQs = questions.filter(q => !weakQs.includes(q));
  pd.questions = shuffle([...weakQs, ...restQs.slice(0, pd.total - weakQs.length)]);
  // Typed mode turns both multiple-choice types into production: write the prefixed verb.
  if (pd.qMode === 'type') {
    pd.questions = pd.questions.map(q => {
      if (q.type === 'choose_prefix') return { ...q, type: 'type_verb', prefix: q.correctPrefix };
      if (q.type === 'identify_meaning') return { ...q, type: 'type_verb', meaning: q.correctMeaning };
      return q;
    });
  }
  if (pd.questions.length === 0) { showEmptyState(); return; }
  // The free drill only moves the schedule of verbs already learned family by family.
  const units = makeUnits({ onlySeen: true });
  runSession({
    screen: getScreen(), icon: COURSE.icon, title: L('Prefix Drill', 'Voorvoegsel Drill'), accent: ACCENT,
    cards: pd.questions.map(q => prefixCard(q, { units })),
    onExit: showMenu,
    again: () => ({ label: '🔄 ' + L('Try again (new questions)', 'Opnieuw (nieuwe vragen)'), run: startDrill }),
  });
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

// ── The course: one word family at a time ────────────────────────────────────

// The first family that still holds unseen verbs, and those verbs.
function nextFamily() {
  const unseen = new Set(prefixProgress.unseenKeys());
  const index = BASE_VERBS.findIndex(bv => bv.prefixed.some(pv => unseen.has(prefixKey(pv.verb))));
  if (index === -1) return null;
  return { index, bv: BASE_VERBS[index], fresh: BASE_VERBS[index].prefixed.filter(pv => unseen.has(prefixKey(pv.verb))) };
}

const question = (bv, pv, type) => ({
  type, base: bv.base, baseMeaning: bv.meaning, verb: pv.verb, prefix: pv.prefix, meaning: pv.meaning,
  correctPrefix: pv.prefix, correctMeaning: pv.meaning,
  ...(pv.sentence ? { sentence: pv.sentence.uk, answer: pv.sentence.answer, fullSentence: pv.sentence.full, translation: pv.sentence } : {}),
});

// Each new verb is shown with its meaning first (hear it, copy it), then asked from
// memory: meaning → verb, and the verb inside its sentence. At most 8 verbs a round.
function startLearnFamily(index, { all = false } = {}) {
  const bv = BASE_VERBS[index];
  const unseen = new Set(prefixProgress.unseenKeys());
  const verbs = (all ? bv.prefixed : bv.prefixed.filter(pv => unseen.has(prefixKey(pv.verb)))).slice(0, 8);
  const units = makeUnits();
  const cards = [
    ...verbs.map(pv => prefixCard(question(bv, pv, 'type_verb'), { intro: true })),
    ...shuffle(verbs).map(pv => prefixCard(question(bv, pv, 'type_verb'), { units })),
    ...shuffle(verbs.filter(pv => pv.sentence)).map(pv => prefixCard(question(bv, pv, 'fill_blank'), { units })),
  ];
  runSession({
    screen: getScreen(), icon: '🎓', title: `${bv.base} · ${loc(bv.meaning)}`, accent: ACCENT, cards,
    onExit: showMenu,
    scoreSubtitle: () => { const st = prefixStats(); return `${st.learned}/${st.total} ${L('learned', 'geleerd')} · ${st.due} ${L('due', 'aan de beurt')}`; },
    again: () => { const f = nextFamily(); return f ? { label: `📥 ${L('Next', 'Volgende')}: ${f.bv.base}`, run: () => startLearnFamily(f.index) } : null; },
  });
}

// ── Cards ────────────────────────────────────────────────────────────────────

// A prefixed verb moves on the schedule once per session, when the last of its
// cards is answered, by how many were right.
function makeUnits({ onlySeen = false } = {}) {
  const tally = new Map();
  return {
    expect(key) { const t = tally.get(key) || { total: 0, n: 0, ok: 0 }; t.total++; tally.set(key, t); },
    answer(key, res) {
      const t = tally.get(key);
      if (!t) return;
      t.n++; if (res.isCorrect) t.ok++;
      if (t.n < t.total) return;
      if (onlySeen && !prefixProgress.get(key)) return;
      prefixProgress.record(key, t.total === 1 ? res.quality : t.ok === t.total ? 5 : t.ok > 0 ? 3 : 1);
    },
  };
}

// q.type: 'type_verb' (meaning → verb, typed) · 'fill_blank' (verb form in a sentence, typed)
//         'choose_prefix' · 'identify_meaning' (four options each)
function prefixCard(q, { intro = false, units = null } = {}) {
  const unit = prefixKey(q.verb);
  if (units && !intro) units.expect(unit);
  const wordLine = `<div class="pd-context"><span class="pd-prefix-tag">${escHtml(q.prefix || q.correctPrefix)}</span> ${escHtml(q.verb)} = ${escHtml(loc(q.meaning || q.correctMeaning))}</div>`;
  const card = {
    key: `${unit}|${q.type}`, course: COURSE, intro,
    record(res) { recordAnswer(q.verb, q.type, res.isCorrect); units?.answer(unit, res); },
    detailHtml: wordLine, say: q.verb, correctText: q.verb,
    missed: { left: loc(q.meaning || q.correctMeaning), right: q.verb, extra: q.base },
  };

  if (q.type === 'choose_prefix') {
    return { ...card,
      promptHtml: `
        <div class="pd-q-card">
          <div class="pd-q-base">${escHtml(q.base)}</div>
          <div class="pd-q-meaning">${escHtml(loc(q.baseMeaning))}</div>
          <div class="pd-q-target">${L('Which prefix makes', 'Welk voorvoegsel maakt')}: ${escHtml(loc(q.meaning))}?</div>
        </div>`,
      input: { type: 'choice', options: shuffle([q.correctPrefix, ...getDistractorPrefixes(q.correctPrefix, 3)]).map(o => ({ label: `${o}${q.base}`, correct: o === q.correctPrefix })) } };
  }
  if (q.type === 'identify_meaning') {
    return { ...card, missed: { left: q.verb, right: loc(q.correctMeaning), extra: q.base, say: q.verb },
      promptHtml: `
        <div class="pd-q-card">
          <div class="pd-q-base"><span class="pd-prefix-tag">${escHtml(q.prefix)}</span>${escHtml(q.verb)}</div>
          <div class="pd-q-meaning">${L('Base verb', 'Basiswerkwoord')}: ${escHtml(q.base)} — ${escHtml(loc(q.baseMeaning))}</div>
          <div class="pd-q-target">${L('What does this verb mean?', 'Wat betekent dit werkwoord?')}</div>
        </div>`,
      input: { type: 'choice', options: shuffle([q.correctMeaning, ...getDistractorMeanings(q.correctMeaning, 3)]).map(o => ({ label: loc(o), correct: o.en === q.correctMeaning.en })) },
      correctText: loc(q.correctMeaning) };
  }
  if (q.type === 'fill_blank') {
    return { ...card, say: q.fullSentence, correctText: q.answer,
      missed: { left: loc(q.meaning), right: q.answer, extra: q.verb, say: q.fullSentence },
      promptHtml: `
        <div class="pd-sentence-card">
          <div class="pd-sentence-translation">${escHtml(loc(q.translation))}</div>
          <div class="pd-sentence-text">${escHtml(q.sentence).replace('___', '<span class="pd-sentence-blank"></span>')}</div>
          <div class="pd-sentence-hint"><span class="pd-prefix-tag">${escHtml(q.prefix)}</span> ${escHtml(q.verb)} — ${escHtml(loc(q.meaning))}</div>
        </div>`,
      input: { type: 'text', lang: 'uk', placeholder: L('Type the answer…', 'Typ het antwoord…') },
      check(answer) { const g = grade(answer, [q.answer], { minTypoLen: 5 }); return { ...g, quality: g.isExact ? 5 : g.isClose ? 3 : 1 }; },
      compareOnClose: true,
      detailHtml: `<div class="pd-context">${escHtml(q.fullSentence)}</div>${wordLine}` };
  }
  // type_verb, and the introduction card that shows the verb to copy
  return { ...card,
    promptHtml: `
      <div class="pd-q-card ${intro ? 'pd-q-intro' : ''}">
        ${intro ? `<div class="pd-q-badge">✨ ${L('New verb', 'Nieuw werkwoord')}</div>` : ''}
        <div class="pd-q-base">${escHtml(q.base)}</div>
        <div class="pd-q-meaning">${escHtml(loc(q.baseMeaning))}</div>
        <div class="pd-q-target">${L('Which verb means', 'Welk werkwoord betekent')}: ${escHtml(loc(q.meaning))}?</div>
        ${intro ? `<div class="pd-q-word"><span class="pd-prefix-tag">${escHtml(q.prefix)}</span>${escHtml(q.verb)} <button class="pd-say-inline" type="button" data-say="${escHtml(q.verb)}">🔊</button></div>
                   <div class="pd-q-hint">${L('Say it, then type it', 'Zeg het, typ het dan')}</div>` : ''}
      </div>`,
    autoSay: intro ? q.verb : null,
    input: { type: 'text', lang: 'uk', placeholder: L('Type the prefixed verb…', 'Typ het werkwoord met voorvoegsel…') },
    check(answer) { const g = grade(answer, [q.verb], { minTypoLen: 5 }); return { ...g, quality: g.isExact ? 5 : g.isClose ? 3 : 1 }; },
    compareOnClose: true };
}

// For the Review queue: every due verb as one card, typed: from its meaning, or
// inside its sentence.
export function prefixDueCards() {
  const units = makeUnits();
  const byVerb = new Map(BASE_VERBS.flatMap(bv => bv.prefixed.map(pv => [pv.verb, [bv, pv]])));
  return prefixProgress.dueKeys().map(key => {
    const [bv, pv] = byVerb.get(key.slice('prefix:'.length));
    return prefixCard(question(bv, pv, pv.sentence && Math.random() < 0.5 ? 'fill_blank' : 'type_verb'), { units });
  });
}

export function startPrefixReview(onExit = showMenu) {
  window.showScreen('prefixDrillScreen');
  runSession({
    screen: getScreen(), icon: COURSE.icon, title: `${COURSE.name} · ${L('review', 'herhalen')}`, accent: ACCENT,
    cards: shuffle(prefixDueCards()).slice(0, 30),
    onExit,
    again: () => (prefixStats().due ? { label: '🔄 ' + L('More reviews', 'Verder herhalen'), run: () => startPrefixReview(onExit) } : null),
  });
}
