import { state } from '../state.js';
import { escHtml } from '../utils.js';
import { generateExercises } from '../api/exercises.js';
import { languageName } from '../i18n.js';

// ── Topic definitions ─────────────────────────────────────────────────────────
// Each topic carries language-specific titles/subtitles per native language.
// The picker reads `topic.title[native]` and `topic.subtitle[native]`.

const TOPICS_UK = [
  { id: 'cases',        icon: '📌',
    title:    { en: 'Cases',                nl: 'Naamvallen' },
    subtitle: { en: 'відмінки — choosing the right case', nl: 'відмінки — de juiste naamval kiezen' } },
  { id: 'aspect',       icon: '⚡',
    title:    { en: 'Verb Aspect',          nl: 'Werkwoordsaspect' },
    subtitle: { en: 'perfective vs imperfective',         nl: 'voltooid vs onvoltooid' } },
  { id: 'gender',       icon: '🔤',
    title:    { en: 'Gender & Agreement',   nl: 'Geslacht & overeenkomst' },
    subtitle: { en: 'noun gender + adjective forms',      nl: 'geslacht + bijvoeglijk-naamwoorduitgangen' } },
  { id: 'adverbs',      icon: '⏱',
    title:    { en: 'Adverbs',              nl: 'Bijwoorden' },
    subtitle: { en: 'time, place, manner adverbs',        nl: 'bijwoorden van tijd, plaats en wijze' } },
  { id: 'prepositions', icon: '📍',
    title:    { en: 'Prepositions',         nl: 'Voorzetsels' },
    subtitle: { en: 'which preposition + which case',     nl: 'welk voorzetsel + welke naamval' } },
  { id: 'pronouns',     icon: '👤',
    title:    { en: 'Pronouns',             nl: 'Voornaamwoorden' },
    subtitle: { en: 'personal & possessive forms',        nl: 'persoonlijke en bezittelijke vormen' } },
  { id: 'negation',     icon: '🚫',
    title:    { en: 'Negation',             nl: 'Ontkenning' },
    subtitle: { en: 'не, ні, нічого, ніхто…',             nl: 'не, ні, нічого, ніхто…' } },
  { id: 'numbers',      icon: '🔢',
    title:    { en: 'Numbers',              nl: 'Telwoorden' },
    subtitle: { en: 'numeral agreement with nouns',       nl: 'telwoorden bij zelfstandige naamwoorden' } },
];

const TOPICS_NL = [
  { id: 'de_het',       icon: '📰',
    title:    { en: 'De / Het',              nl: 'De / Het' },
    subtitle: { en: 'article gender — the hardest rule',  nl: 'het lidwoordgeslacht — de moeilijkste regel' } },
  { id: 'conjugation',  icon: '🔄',
    title:    { en: 'Verb Conjugation',      nl: 'Werkwoordsvervoeging' },
    subtitle: { en: 'present tense patterns + t-rules',   nl: 'tegenwoordige tijd + t-regels' } },
  { id: 'past_tense',   icon: '⏮',
    title:    { en: 'Past Tense',            nl: 'Verleden tijd' },
    subtitle: { en: 'simple past vs present perfect',     nl: 'imperfectum vs voltooid tegenwoordige tijd' } },
  { id: 'word_order',   icon: '📝',
    title:    { en: 'Word Order',            nl: 'Woordvolgorde' },
    subtitle: { en: 'V2 rule & subordinate clauses',      nl: 'V2-regel & bijzinnen' } },
  { id: 'adjectives',   icon: '🖊',
    title:    { en: 'Adjective Inflection',  nl: 'Bijvoeglijke naamwoorden' },
    subtitle: { en: 'when to add -e',                     nl: 'wanneer voeg je -e toe' } },
  { id: 'adverbs',      icon: '⏱',
    title:    { en: 'Adverbs',               nl: 'Bijwoorden' },
    subtitle: { en: 'manner, place, time + position',     nl: 'wijze, plaats, tijd + positie' } },
  { id: 'separable',    icon: '✂️',
    title:    { en: 'Separable Verbs',       nl: 'Scheidbare werkwoorden' },
    subtitle: { en: 'prefix separation rules',            nl: 'regels voor het scheiden van het voorvoegsel' } },
  { id: 'prepositions', icon: '📍',
    title:    { en: 'Prepositions',          nl: 'Voorzetsels' },
    subtitle: { en: 'op, in, aan, bij, naar, van…',       nl: 'op, in, aan, bij, naar, van…' } },
];

const TOPICS_EN = [
  { id: 'tenses',       icon: '⏱',
    title:    { en: 'Tenses',                nl: 'Werkwoordstijden' },
    subtitle: { en: 'present, past, perfect, future',     nl: 'present simple, past simple, perfect, future' } },
  { id: 'articles',     icon: '📰',
    title:    { en: 'Articles',              nl: 'Lidwoorden' },
    subtitle: { en: 'a / an / the / no article',          nl: 'a / an / the / geen lidwoord' } },
  { id: 'conditionals', icon: '🔀',
    title:    { en: 'Conditionals',          nl: 'Voorwaardelijke zinnen' },
    subtitle: { en: 'zero, first, second, third + mixed', nl: 'zero, first, second, third + mixed' } },
  { id: 'prepositions', icon: '📍',
    title:    { en: 'Prepositions',          nl: 'Voorzetsels' },
    subtitle: { en: 'time, place, common collocations',   nl: 'tijd, plaats, vaste combinaties' } },
  { id: 'word_order',   icon: '📝',
    title:    { en: 'Word Order',            nl: 'Woordvolgorde' },
    subtitle: { en: 'SVO + adverb position + questions',  nl: 'SVO + bijwoordpositie + vragen' } },
  { id: 'phrasal',      icon: '🔗',
    title:    { en: 'Phrasal Verbs',         nl: 'Phrasal verbs' },
    subtitle: { en: 'look up, give up, run into…',        nl: 'look up, give up, run into…' } },
  { id: 'modals',       icon: '🛡',
    title:    { en: 'Modal Verbs',           nl: 'Modale werkwoorden' },
    subtitle: { en: 'can, could, may, must, should…',     nl: 'can, could, may, must, should…' } },
  { id: 'pronouns',     icon: '👤',
    title:    { en: 'Pronouns',              nl: 'Voornaamwoorden' },
    subtitle: { en: 'subject, object, possessive, reflexive', nl: 'onderwerp, lijdend voorwerp, bezittelijk, wederkerend' } },
];

const TOPICS_FR = [
  { id: 'gender',       icon: '🔤',
    title:    { en: 'Gender & Articles',     nl: 'Geslacht & lidwoorden' },
    subtitle: { en: 'le / la / les, un / une / des',  nl: 'le / la / les, un / une / des' } },
  { id: 'conjugation',  icon: '🔄',
    title:    { en: 'Verb Conjugation',      nl: 'Werkwoordsvervoeging' },
    subtitle: { en: '-er, -ir, -re groups + irregulars', nl: '-er, -ir, -re groepen + onregelmatig' } },
  { id: 'past_tense',   icon: '⏮',
    title:    { en: 'Past Tense',            nl: 'Verleden tijd' },
    subtitle: { en: 'passé composé vs imparfait',    nl: 'passé composé vs imparfait' } },
  { id: 'pronouns',     icon: '👤',
    title:    { en: 'Pronouns',              nl: 'Voornaamwoorden' },
    subtitle: { en: 'subject, object, reflexive',     nl: 'onderwerp, lijdend voorwerp, wederkerend' } },
  { id: 'prepositions', icon: '📍',
    title:    { en: 'Prepositions',          nl: 'Voorzetsels' },
    subtitle: { en: 'à, de, en, dans, pour…',         nl: 'à, de, en, dans, pour…' } },
  { id: 'adjectives',   icon: '🖊',
    title:    { en: 'Adjectives',            nl: 'Bijvoeglijke naamwoorden' },
    subtitle: { en: 'agreement + position (BANGS)',   nl: 'verbuiging + positie (BANGS)' } },
  { id: 'negation',     icon: '🚫',
    title:    { en: 'Negation',              nl: 'Ontkenning' },
    subtitle: { en: 'ne...pas, ne...jamais, ne...rien', nl: 'ne...pas, ne...jamais, ne...rien' } },
  { id: 'subjunctive',  icon: '💭',
    title:    { en: 'Subjunctive',           nl: 'Aanvoegende wijs' },
    subtitle: { en: 'il faut que, je veux que…',      nl: 'il faut que, je veux que…' } },
];

// Pick the localised string from a {en, nl} field, falling back to English.
function loc(field) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[state.nativeLanguage] || field.en || '';
}

// ── Exercise state ────────────────────────────────────────────────────────────

let ex = {
  topic:       null,
  list:        [],
  current:     0,
  score:       0,
  answered:    false,
  level:       localStorage.getItem('exLevel')      || 'a1',
  includeOpen: localStorage.getItem('exIncludeOpen') === 'true',
};

function getTopics() {
  switch (state.currentLanguage) {
    case 'nl': return TOPICS_NL;
    case 'en': return TOPICS_EN;
    case 'fr': return TOPICS_FR;
    case 'uk':
    default:   return TOPICS_UK;
  }
}

function getScreen() {
  return document.getElementById('exercisesScreen');
}

// ── Public entry points ───────────────────────────────────────────────────────

export function openExercisesScreen() {
  window.showScreen('exercisesScreen');
  showTopicPicker();
}

export function setExLevel(level) {
  ex.level = level;
  localStorage.setItem('exLevel', level);
  document.querySelectorAll('.ex-level-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.level === level);
  });
}

// ── Topic picker ──────────────────────────────────────────────────────────────

function showTopicPicker() {
  ex.topic = null;
  const isNL    = state.currentLanguage === 'nl';
  const topics  = getTopics();
  const s       = getScreen();
  const native  = state.nativeLanguage;
  const flag    = { uk: '🇺🇦', nl: '🇳🇱', en: '🇬🇧' }[state.currentLanguage] || '🌐';
  const lblTitle    = native === 'nl' ? '🎯 Grammatica-oefeningen' : '🎯 Grammar Exercises';
  const lblPick     = native === 'nl' ? 'kies een onderwerp' : 'pick a topic';
  const lblPracVerb = native === 'nl' ? 'Werkwoorden oefenen' : 'Practice Verbs';
  const lblDissect  = native === 'nl' ? 'Zin ontleden' : 'Dissect a Sentence';
  const lblDeHet    = native === 'nl' ? 'De of Het?' : 'De or Het?';
  const lblLevel    = native === 'nl' ? 'Niveau:' : 'Level:';
  const lblOpen     = native === 'nl' ? '✏️ Open vragen:' : '✏️ Open questions:';
  const lblOn       = native === 'nl' ? 'AAN' : 'ON';
  const lblOff      = native === 'nl' ? 'UIT' : 'OFF';
  const targetName  = languageName(state.currentLanguage);

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="exHomeBack">←</button>
      <div>
        <div class="lesson-title">${lblTitle}</div>
        <div class="lesson-subtitle">${flag} ${escHtml(targetName)} — ${lblPick}</div>
      </div>
    </div>

    <div class="ex-tools-row">
      <button class="ex-tool-btn" id="exVerbBtn">
        <span class="ex-tool-icon">📋</span>
        <span>${lblPracVerb}</span>
      </button>
      <button class="ex-tool-btn" id="exDissectBtn">
        <span class="ex-tool-icon">🔍</span>
        <span>${lblDissect}</span>
      </button>
      <button class="ex-tool-btn ex-tool-dehet" id="exDehetBtn" style="${isNL ? '' : 'display:none'}">
        <span class="ex-tool-icon">🏷️</span>
        <span>${lblDeHet}</span>
      </button>
    </div>

    <div class="ex-controls-bar">
      <div class="ex-level-bar">
        <span class="ex-level-label">${lblLevel}</span>
        ${['a1','a2','b1','b2'].map(l => `
          <button class="ex-level-btn ${ex.level === l ? 'active' : ''}" data-level="${l}">${l.toUpperCase()}</button>
        `).join('')}
      </div>
      <button class="ex-open-toggle ${ex.includeOpen ? 'active' : ''}" id="exOpenToggle">
        ${lblOpen} <span class="ex-open-status">${ex.includeOpen ? lblOn : lblOff}</span>
      </button>
    </div>

    <div class="ex-topic-grid" id="exTopicGrid"></div>`;

  s.querySelector('#exHomeBack').addEventListener('click', () => window.showScreen('homeScreen'));
  s.querySelector('#exVerbBtn').addEventListener('click', () => window.openVerbScreen());
  s.querySelector('#exDissectBtn').addEventListener('click', () => window.openDissectScreen());
  const dehetBtn = s.querySelector('#exDehetBtn');
  if (dehetBtn) dehetBtn.addEventListener('click', () => window.openDeHetScreen());

  s.querySelectorAll('.ex-level-btn').forEach(btn => {
    btn.addEventListener('click', () => setExLevel(btn.dataset.level));
  });

  s.querySelector('#exOpenToggle').addEventListener('click', function() {
    ex.includeOpen = !ex.includeOpen;
    localStorage.setItem('exIncludeOpen', ex.includeOpen);
    this.classList.toggle('active', ex.includeOpen);
    this.querySelector('.ex-open-status').textContent = ex.includeOpen ? lblOn : lblOff;
  });

  const grid = s.querySelector('#exTopicGrid');
  topics.forEach(topic => {
    const btn = document.createElement('button');
    btn.className = 'ex-topic-card';
    // Pass an English title to the API hint lookup (topic.id is the canonical key).
    const titleStr    = loc(topic.title);
    const subtitleStr = loc(topic.subtitle);
    btn.innerHTML = `
      <span class="ex-topic-icon">${topic.icon}</span>
      <span class="ex-topic-title">${escHtml(titleStr)}</span>
      <span class="ex-topic-sub">${escHtml(subtitleStr)}</span>`;
    btn.addEventListener('click', () => startExercises({ ...topic, title: titleStr, subtitle: subtitleStr }));
    grid.appendChild(btn);
  });
}

// ── Load exercises ────────────────────────────────────────────────────────────

async function startExercises(topic) {
  ex = { ...ex, topic, list: [], current: 0, score: 0, answered: false };
  const s = getScreen();

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="exTopicBack">←</button>
      <div>
        <div class="lesson-title">${topic.icon} ${escHtml(topic.title)}</div>
        <div class="lesson-subtitle" id="exSubtitle">Generating exercises…</div>
      </div>
    </div>
    <div id="exBody" class="ex-loading">
      <div class="ex-spinner"></div>
      <div class="ex-loading-text">Creating your exercises…</div>
    </div>`;

  s.querySelector('#exTopicBack').addEventListener('click', () => {
    window.showScreen('exercisesScreen');
    showTopicPicker();
  });

  try {
    ex.list = await generateExercises(topic.id, topic.title, ex.level, ex.includeOpen);
    renderQuestion();
  } catch (err) {
    document.getElementById('exBody').innerHTML = `
      <div class="ex-error">⚠️ ${escHtml(err.message)}</div>
      <button class="ex-action-btn" id="exErrBack">← Back to topics</button>`;
    document.getElementById('exErrBack').addEventListener('click', () => {
      window.showScreen('exercisesScreen');
      showTopicPicker();
    });
  }
}

// ── Render dispatcher ─────────────────────────────────────────────────────────

function renderQuestion() {
  const q = ex.list[ex.current];
  if (q.type === 'open') {
    renderOpenQuestion();
  } else {
    renderMCQuestion();
  }
}

function buildProgressDots() {
  return ex.list.map((q, i) => {
    const cls  = i < ex.current ? 'done' : i === ex.current ? 'current' : '';
    const type = q.type === 'open' ? ' open-dot' : '';
    return `<span class="ex-dot ${cls}${type}" title="${q.type === 'open' ? 'Open question' : 'Multiple choice'}"></span>`;
  }).join('');
}

// ── Multiple-choice question ──────────────────────────────────────────────────

function renderMCQuestion() {
  const q     = ex.list[ex.current];
  const total = ex.list.length;

  document.getElementById('exSubtitle').textContent = `Question ${ex.current + 1} of ${total}`;

  const body = document.getElementById('exBody');
  body.className = 'ex-body';
  body.innerHTML = `
    <div class="ex-progress">${buildProgressDots()}</div>
    <div class="ex-question">${escHtml(q.question)}</div>
    <div class="ex-options">
      ${(q.options || []).map((opt, i) => `
        <button class="ex-option" data-idx="${i}">${escHtml(opt)}</button>
      `).join('')}
    </div>
    <div id="exFeedback"></div>`;

  body.querySelectorAll('.ex-option').forEach(btn => {
    btn.addEventListener('click', () => handleMCAnswer(parseInt(btn.dataset.idx)));
  });
}

function handleMCAnswer(chosen) {
  if (ex.answered) return;
  ex.answered = true;

  const q       = ex.list[ex.current];
  const correct = q.correct;
  const isRight = chosen === correct;
  if (isRight) ex.score++;

  document.querySelectorAll('.ex-option').forEach((btn, i) => {
    btn.disabled = true;
    if (i === correct) btn.classList.add('correct');
    else if (i === chosen && !isRight) btn.classList.add('wrong');
  });

  showFeedback(isRight, q.explanation);
}

// ── Open question ─────────────────────────────────────────────────────────────

function renderOpenQuestion() {
  const q     = ex.list[ex.current];
  const total = ex.list.length;

  document.getElementById('exSubtitle').textContent = `Question ${ex.current + 1} of ${total}`;

  const body = document.getElementById('exBody');
  body.className = 'ex-body';
  body.innerHTML = `
    <div class="ex-progress">${buildProgressDots()}</div>
    <div class="ex-open-badge">✏️ Open question — write your answer</div>
    <div class="ex-question">${escHtml(q.question)}</div>
    <div class="ex-open-area">
      <textarea class="ex-open-input" id="exOpenInput"
        placeholder="Type your answer here…" rows="3" autocomplete="off" autocorrect="off" spellcheck="false"></textarea>
      <button class="ex-open-check-btn" id="exOpenCheck">Check ✓</button>
    </div>
    <div id="exFeedback"></div>`;

  const input    = body.querySelector('#exOpenInput');
  const checkBtn = body.querySelector('#exOpenCheck');

  const submit = () => {
    const answer = input.value.trim();
    if (!answer) { input.focus(); return; }
    handleOpenAnswer(answer);
  };

  checkBtn.addEventListener('click', submit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  });

  input.focus();
}

function handleOpenAnswer(userAnswer) {
  if (ex.answered) return;
  ex.answered = true;

  const q = ex.list[ex.current];

  // Disable the input area
  document.getElementById('exOpenInput').disabled = true;
  document.getElementById('exOpenCheck').disabled = true;

  const fb = document.getElementById('exFeedback');
  fb.innerHTML = `
    <div class="ex-open-your-answer">
      <span class="ex-open-your-label">Your answer:</span>
      <span class="ex-open-your-text">${escHtml(userAnswer)}</span>
    </div>
    <div class="ex-open-correct-answer">
      <span class="ex-open-correct-label">Correct answer:</span>
      <span class="ex-open-correct-text">${escHtml(q.correct_answer)}</span>
    </div>
    <div class="ex-feedback-explanation">${escHtml(q.explanation)}</div>
    <div class="ex-self-assess">
      <div class="ex-self-label">Did you get it right?</div>
      <div class="ex-self-btns">
        <button class="ex-self-yes" id="exSelfYes">✓ Yes</button>
        <button class="ex-self-no"  id="exSelfNo">✗ Not quite</button>
      </div>
    </div>`;

  const proceed = (gotIt) => {
    if (gotIt) ex.score++;

    fb.querySelector('#exSelfYes').disabled = true;
    fb.querySelector('#exSelfNo').disabled  = true;
    fb.querySelector('#exSelfYes').classList.toggle('chosen', gotIt);
    fb.querySelector('#exSelfNo').classList.toggle('chosen', !gotIt);

    showNextButton(fb);
  };

  fb.querySelector('#exSelfYes').addEventListener('click', () => proceed(true));
  fb.querySelector('#exSelfNo').addEventListener('click',  () => proceed(false));

  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Shared feedback helpers ───────────────────────────────────────────────────

function showFeedback(isRight, explanation) {
  const isLast = ex.current + 1 >= ex.list.length;
  const fb = document.getElementById('exFeedback');

  fb.innerHTML = `
    <div class="ex-feedback-result ${isRight ? 'correct' : 'wrong'}">
      ${isRight ? '✓ Correct!' : '✗ Not quite'}
    </div>
    <div class="ex-feedback-explanation">${escHtml(explanation)}</div>`;

  showNextButton(fb, isLast);
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showNextButton(container, isLastOverride) {
  const isLast = isLastOverride !== undefined ? isLastOverride : ex.current + 1 >= ex.list.length;
  const btn = document.createElement('button');
  btn.className = 'ex-next-btn';
  btn.textContent = isLast ? '🏁 See results' : 'Next →';
  btn.addEventListener('click', () => {
    if (isLast) {
      showScore();
    } else {
      ex.current++;
      ex.answered = false;
      renderQuestion();
      document.getElementById('exBody').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  container.appendChild(btn);
}

// ── Score screen ──────────────────────────────────────────────────────────────

function showScore() {
  const total = ex.list.length;
  const score = ex.score;
  const pct   = Math.round((score / total) * 100);
  const emoji = pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪';
  const msg   = pct === 100 ? 'Perfect score!' : pct >= 80 ? 'Great job!' : pct >= 60 ? 'Good effort!' : 'Keep practising!';
  const topic = ex.topic;

  const openCount = ex.list.filter(q => q.type === 'open').length;
  const mcCount   = total - openCount;

  document.getElementById('exSubtitle').textContent = 'Finished!';

  const body = document.getElementById('exBody');
  body.innerHTML = `
    <div class="ex-score-card">
      <div class="ex-score-emoji">${emoji}</div>
      <div class="ex-score-title">${escHtml(msg)}</div>
      <div class="ex-score-fraction">${score} / ${total}</div>
      <div class="ex-score-bar-wrap">
        <div class="ex-score-bar-fill" style="width: ${pct}%"></div>
      </div>
      <div class="ex-score-pct">${pct}%</div>
      ${openCount > 0 ? `<div class="ex-score-breakdown">${mcCount} multiple choice · ${openCount} open (self-assessed)</div>` : ''}
      <div class="ex-score-actions">
        <button class="ex-next-btn" id="exRetry">🔄 Try again</button>
        <button class="ex-back-btn" id="exBackTopics">← Topics</button>
      </div>
    </div>`;

  body.querySelector('#exRetry').addEventListener('click', () => startExercises(topic));
  body.querySelector('#exBackTopics').addEventListener('click', () => {
    window.showScreen('exercisesScreen');
    showTopicPicker();
  });
}
