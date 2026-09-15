import { state } from '../state.js';
import { escHtml, levenshtein } from '../utils.js';
import { speakText } from '../voice.js';
import { SENTENCES } from '../data/sentences-uk.js';
import { VERB_PAIRS } from '../data/verb-aspects.js';
import { makeTracker } from '../data/flat-weakness.js';
import { L, loc, shuffle, normalise, appendNext, missedListHtml, wireSpeakButtons, scoreMessage, scoreEmoji } from './drill-core.js';

// ── Sentence builder ─────────────────────────────────────────────────────────
// The learner sees a sentence in their own language plus the Ukrainian words
// it needs in dictionary form, and types the whole sentence. Endings, word
// order and agreement are theirs to get right. Two sets:
//   everyday  60 sentences written for this, each with a grammar note
//   aspect    the 200 sentences from the aspect data, hinted with the verb pair

export const tracker = makeTracker('sentenceWeakness');

const PREFS_KEY = 'sentenceBuildPrefs';
let sb = { set: 'everyday', total: 10, items: [], current: 0, score: 0, answered: false, missed: [] };

function loadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY));
    if (p?.set === 'everyday' || p?.set === 'aspect') sb.set = p.set;
    if ([10, 20].includes(p?.total)) sb.total = p.total;
  } catch { /* ignore */ }
}
function savePrefs() { localStorage.setItem(PREFS_KEY, JSON.stringify({ set: sb.set, total: sb.total })); }

function getScreen() { return document.getElementById('sentenceBuildScreen'); }

// Both sets in one shape: { key, uk, prompt (native), hint[], note }
function everydayItems() {
  return SENTENCES.map((s, i) => ({ key: `everyday:${i}`, uk: s.uk, prompt: state.nativeLanguage === 'nl' ? s.nl : s.en, hint: s.hint, note: s.note }));
}
function aspectItems() {
  const out = [];
  VERB_PAIRS.forEach(pair => pair.sentences.forEach((s, i) => out.push({
    key: `aspect:${pair.id}:${i}`, uk: s.uk, prompt: state.nativeLanguage === 'nl' ? s.nl : s.en,
    hint: [`${pair.imperfective} / ${pair.perfective}`, s.aspect === 'imperfective' ? 'IMP' : 'PERF'], note: s.why,
  })));
  return out;
}
function poolFor(set) { return set === 'aspect' ? aspectItems() : everydayItems(); }

// ── Public entry ─────────────────────────────────────────────────────────────

export function openSentenceBuildScreen() {
  loadPrefs();
  window.showScreen('sentenceBuildScreen');
  showMenu();
}

// ── Menu ─────────────────────────────────────────────────────────────────────

function showMenu() {
  const s = getScreen();
  const done = tracker.totalAttempts();
  const weak = tracker.weakKeys().length;
  const everydaySeen = tracker.seenKeys('everyday:').length;
  const aspectSeen = tracker.seenKeys('aspect:').length;

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="sbBack">←</button>
      <div>
        <div class="lesson-title">🧩 ${L('Sentence Builder', 'Zinnen bouwen')}</div>
        <div class="lesson-subtitle">${L('Dictionary words in, a whole sentence out', 'Woordenboekvormen erin, een hele zin eruit')}</div>
      </div>
    </div>

    <div class="sb-stats-bar">
      <span class="sb-stat">✅ ${done} ${L('written', 'geschreven')}</span>
      <span class="sb-stat ${weak ? 'sb-stat-weak' : ''}">🎯 ${weak} ${L('weak', 'zwak')}</span>
    </div>

    <div class="sb-section-label">${L('Which sentences?', 'Welke zinnen?')}</div>
    <div class="sb-set-grid">
      <button class="sb-set-card ${sb.set === 'everyday' ? 'active' : ''}" data-set="everyday">
        <span class="sb-set-icon">💬</span>
        <span class="sb-set-title">${L('Everyday', 'Alledaags')}</span>
        <span class="sb-set-sub">${SENTENCES.length} ${L('sentences', 'zinnen')} · ${everydaySeen} ${L('done', 'gedaan')}<br>${L('one grammar point each', 'één grammaticapunt per zin')}</span>
      </button>
      <button class="sb-set-card ${sb.set === 'aspect' ? 'active' : ''}" data-set="aspect">
        <span class="sb-set-icon">🔀</span>
        <span class="sb-set-title">${L('Aspect sentences', 'Aspect-zinnen')}</span>
        <span class="sb-set-sub">${aspectItems().length} ${L('sentences', 'zinnen')} · ${aspectSeen} ${L('done', 'gedaan')}<br>${L('plans for the week, hinted with the verb pair', 'plannen voor de week, met het werkwoordpaar als hint')}</span>
      </button>
    </div>

    <div class="sb-length-row">
      <span class="sb-length-label">${L('Sentences:', 'Aantal:')}</span>
      ${[10, 20].map(n => `<button class="sb-length-btn ${sb.total === n ? 'active' : ''}" data-total="${n}">${n}</button>`).join('')}
    </div>

    <div class="sb-howto">
      ${L('You get the sentence in your language and the Ukrainian words in dictionary form. Type the full sentence: endings, agreement and word order are up to you. Small slips still count.',
          'Je krijgt de zin in jouw taal en de Oekraïense woorden in woordenboekvorm. Typ de hele zin: uitgangen, overeenkomst en woordvolgorde zijn aan jou. Kleine slippers tellen nog mee.')}
    </div>

    <button class="sb-start-btn" id="sbStart">▶ ${L('Start', 'Start')}</button>
    <button class="sb-browse-btn" id="sbBrowse">📖 ${L('Read through the sentences', 'Lees de zinnen door')}</button>`;

  s.querySelector('#sbBack').addEventListener('click', () => window.openExercisesScreen());
  s.querySelectorAll('[data-set]').forEach(b => b.addEventListener('click', () => { sb.set = b.dataset.set; savePrefs(); showMenu(); }));
  s.querySelectorAll('[data-total]').forEach(b => b.addEventListener('click', () => { sb.total = Number(b.dataset.total); savePrefs(); showMenu(); }));
  s.querySelector('#sbStart').addEventListener('click', startRound);
  s.querySelector('#sbBrowse').addEventListener('click', showBrowse);
}

function showBrowse() {
  const s = getScreen();
  const items = poolFor(sb.set);
  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="sbBrowseBack">←</button>
      <div>
        <div class="lesson-title">📖 ${sb.set === 'aspect' ? L('Aspect sentences', 'Aspect-zinnen') : L('Everyday sentences', 'Alledaagse zinnen')}</div>
        <div class="lesson-subtitle">${items.length} ${L('sentences', 'zinnen')}</div>
      </div>
    </div>
    <div class="sb-browse-list">
      ${items.map(it => `
        <div class="sb-browse-row">
          <div class="sb-browse-uk">${escHtml(it.uk)} <button class="sb-say" data-say="${escHtml(it.uk)}">🔊</button></div>
          <div class="sb-browse-prompt">${escHtml(it.prompt)}</div>
          ${tracker.attempts(it.key) ? `<span class="sb-browse-dot ${tracker.errorRate(it.key) < 0.5 ? 'ok' : 'bad'}"></span>` : ''}
        </div>`).join('')}
    </div>`;
  s.querySelector('#sbBrowseBack').addEventListener('click', showMenu);
  wireSpeakButtons(s);
  s.scrollTo({ top: 0 });
}

// ── Round ────────────────────────────────────────────────────────────────────

function weightedSample(pool, n) {
  let remaining = pool.map(item => ({ item, w: tracker.weight(item.key) }));
  const out = [];
  while (out.length < n && remaining.length) {
    const total = remaining.reduce((a, r) => a + r.w, 0);
    let r = Math.random() * total, idx = 0;
    for (; idx < remaining.length - 1; idx++) { r -= remaining[idx].w; if (r <= 0) break; }
    out.push(remaining[idx].item);
    remaining.splice(idx, 1);
  }
  return out;
}

function startRound() {
  sb.items = weightedSample(poolFor(sb.set), sb.total);
  sb.current = 0; sb.score = 0; sb.missed = []; sb.answered = false;
  renderQuestion();
}

function renderQuestion() {
  sb.answered = false;
  const it = sb.items[sb.current];
  const s = getScreen();
  const pct = Math.round((sb.current / sb.items.length) * 100);

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="sbQBack">←</button>
      <div>
        <div class="lesson-title">🧩 ${L('Sentence Builder', 'Zinnen bouwen')}</div>
        <div class="lesson-subtitle">
          <div class="sb-progress-wrap"><div class="sb-progress-bar" style="width:${pct}%"></div></div>
          <div class="sb-progress-text">${sb.current + 1} / ${sb.items.length}</div>
        </div>
      </div>
    </div>

    <div class="sb-q-card">
      <div class="sb-q-label">${L('Say this in Ukrainian', 'Zeg dit in het Oekraïens')}</div>
      <div class="sb-q-prompt">${escHtml(it.prompt)}</div>
      <div class="sb-hint-row">
        ${it.hint.map(h => `<span class="sb-hint-chip ${h === 'IMP' || h === 'PERF' ? 'sb-hint-aspect' : ''}">${escHtml(h)}</span>`).join('')}
      </div>
    </div>

    <div class="sb-input-area">
      <textarea class="sb-text-input" id="sbInput" rows="2" lang="uk"
        placeholder="${L('Type the whole sentence…', 'Typ de hele zin…')}"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
      <button class="sb-check-btn" id="sbCheck" type="button">${L('Check', 'Controleer')} ✓</button>
    </div>
    <div id="sbFeedback"></div>`;

  s.querySelector('#sbQBack').addEventListener('click', showMenu);
  const input = s.querySelector('#sbInput');
  const check = s.querySelector('#sbCheck');
  const submit = () => {
    if (sb.answered) return;
    const answer = input.value.trim();
    if (!answer) { input.focus(); return; }
    sb.answered = true;
    input.disabled = true; check.disabled = true;
    handleAnswer(it, answer, input);
  };
  check.addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } });
  input.focus();
}

// Sentence-level grading: strip punctuation and case, then character
// similarity. 100 = exact; ≥ 88 = a slip or two, still correct; below = wrong.
const clean = s => normalise(s).replace(/[.,!?;:"«»—–-]/g, '').replace(/\s+/g, ' ').trim();
function similarity(a, b) {
  const x = clean(a), y = clean(b);
  if (x === y) return 100;
  const maxLen = Math.max(x.length, y.length) || 1;
  return Math.round((1 - levenshtein(x, y) / maxLen) * 100);
}

// Word-by-word view of the target: green if the learner used that exact word,
// red if it is missing or has a different ending.
function wordDiff(target, answer) {
  const got = new Set(clean(answer).split(' '));
  return clean(target).split(' ').map(w => `<span class="sb-w ${got.has(w) ? 'sb-w-ok' : 'sb-w-bad'}">${escHtml(w)}</span>`).join(' ');
}

function handleAnswer(it, answer, input) {
  const sim = similarity(answer, it.uk);
  const isExact = sim === 100, isClose = !isExact && sim >= 88, isCorrect = isExact || isClose;
  if (isCorrect) sb.score++;
  else sb.missed.push({ left: it.prompt, right: it.uk, extra: '' });
  input.classList.add(isExact ? 'correct' : isClose ? 'close' : 'wrong');
  tracker.recordAnswer(it.key, isCorrect);

  const fb = document.getElementById('sbFeedback');
  const resultText = isExact ? '✓ ' + L('Perfect!', 'Perfect!')
    : isClose ? '✓ ' + L(`Almost! (${sim}% match)`, `Bijna! (${sim}% overeenkomst)`)
    : '✗ ' + L(`Not quite (${sim}% match)`, `Niet helemaal (${sim}% overeenkomst)`);
  fb.innerHTML = `
    <div class="ex-feedback-result ${isCorrect ? 'correct' : 'wrong'}">${resultText}</div>
    ${isExact ? '' : `
      <div class="sb-compare">
        <div class="sb-your"><b>${L('You wrote:', 'Jij schreef:')}</b> ${escHtml(answer)}</div>
        <div class="sb-target"><b>${L('Target:', 'Doel:')}</b> ${wordDiff(it.uk, answer)}</div>
      </div>`}
    <div class="sb-full">${escHtml(it.uk)}</div>
    ${it.note ? `<div class="sb-note">💡 ${escHtml(loc(it.note))}</div>` : ''}
    <button class="sb-listen-btn" id="sbListen" type="button">🔊 ${L('Listen', 'Luister')}</button>`;
  fb.querySelector('#sbListen').addEventListener('click', () => speakText(it.uk, state.currentLanguage));

  const isLast = sb.current + 1 >= sb.items.length;
  appendNext(fb, { isLast, className: 'sb-next-btn', onNext: () => {
    if (isLast) showScore();
    else { sb.current++; renderQuestion(); getScreen().scrollTo({ top: 0, behavior: 'smooth' }); }
  } });
}

function showScore() {
  const total = sb.items.length;
  const pct = Math.round((sb.score / total) * 100);
  const s = getScreen();
  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="sbScoreBack">←</button>
      <div>
        <div class="lesson-title">🧩 ${L('Results', 'Resultaten')}</div>
        <div class="lesson-subtitle">${L('Sentence Builder', 'Zinnen bouwen')}</div>
      </div>
    </div>
    <div class="ex-score-card">
      <div class="ex-score-emoji">${scoreEmoji(pct)}</div>
      <div class="ex-score-title">${escHtml(scoreMessage(pct))}</div>
      <div class="ex-score-fraction">${sb.score} / ${total}</div>
      <div class="ex-score-bar-wrap"><div class="ex-score-bar-fill" style="width: ${pct}%"></div></div>
      <div class="ex-score-pct">${pct}%</div>
      <div class="ex-score-actions">
        <button class="ex-next-btn" id="sbRetry">🔄 ${L('Another round', 'Nog een ronde')}</button>
        <button class="ex-back-btn" id="sbBackMenu">← Menu</button>
      </div>
    </div>
    ${missedListHtml(sb.missed, { cls: 'sentence' })}`;
  wireSpeakButtons(s);
  s.querySelector('#sbScoreBack').addEventListener('click', showMenu);
  s.querySelector('#sbRetry').addEventListener('click', startRound);
  s.querySelector('#sbBackMenu').addEventListener('click', showMenu);
  s.scrollTo({ top: 0 });
}
