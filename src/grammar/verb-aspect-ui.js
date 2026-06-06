import { state } from '../state.js';
import { escHtml, levenshtein } from '../utils.js';
import { VERB_PAIRS, buildExerciseSet, shuffle } from '../data/verb-aspects.js';
import { speakText } from '../voice.js';

// ── State ────────────────────────────────────────────────────────────────────

let va = {
  exercises: [],
  current:   0,
  score:     0,
  answered:  false,
  total:     25,          // questions per session
  mode:      'exercises', // 'reference' | 'exercises'
  refPair:   0,           // current pair index in reference mode
};

const loc = field => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[state.nativeLanguage] || field.en || '';
};

function getScreen() { return document.getElementById('verbAspectScreen'); }

// ── Public entry ─────────────────────────────────────────────────────────────

export function openVerbAspectScreen() {
  window.showScreen('verbAspectScreen');
  showMenu();
}

// ── Main menu ────────────────────────────────────────────────────────────────

function showMenu() {
  const s = getScreen();
  const native = state.nativeLanguage;
  const lblTitle    = native === 'nl' ? '🔀 Werkwoordsaspect' : '🔀 Verb Aspect Workshop';
  const lblSub      = native === 'nl' ? 'Voltooid vs onvoltooid' : 'Perfective vs Imperfective';
  const lblRef      = native === 'nl' ? '📖 Werkwoord-overzicht' : '📖 Verb Reference Cards';
  const lblRefSub   = native === 'nl' ? 'Bekijk alle 20 werkwoordparen' : 'Browse all 20 verb pairs';
  const lblStart    = native === 'nl' ? '🎯 Oefeningen starten' : '🎯 Start Exercises';
  const lblStartSub = native === 'nl' ? '25 willekeurige vragen' : '25 randomised questions';
  const lblHow      = native === 'nl' ? 'Hoe werkt het aspect?' : 'How does aspect work?';

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vaBack">←</button>
      <div>
        <div class="lesson-title">${lblTitle}</div>
        <div class="lesson-subtitle">${lblSub}</div>
      </div>
    </div>

    <div class="va-tip-card">
      <div class="va-tip-title">${lblHow}</div>
      <div class="va-tip-body">${native === 'nl'
        ? '<b>Onvoltooid</b> (imperfective) = proces, gewoonte, herhaling, achtergrond.<br><b>Voltooid</b> (perfective) = resultaat, eenmalige actie, voltooid feit.<br><br>Tip: als je "elke dag", "altijd", "lang" ziet → waarschijnlijk <b>onvoltooid</b>.<br>Als je "al", "klaar", "in 5 minuten" ziet → waarschijnlijk <b>voltooid</b>.'
        : '<b>Imperfective</b> = process, habit, repetition, background action.<br><b>Perfective</b> = result, single completed action, done deal.<br><br>Tip: if you see "every day", "always", "for a long time" → likely <b>imperfective</b>.<br>If you see "already", "finished", "in 5 minutes" → likely <b>perfective</b>.'
      }</div>
    </div>

    <div class="va-menu-grid">
      <button class="va-menu-card" id="vaRefBtn">
        <span class="va-menu-icon">📖</span>
        <span class="va-menu-title">${lblRef}</span>
        <span class="va-menu-sub">${lblRefSub}</span>
      </button>
      <button class="va-menu-card va-menu-primary" id="vaStartBtn">
        <span class="va-menu-icon">🎯</span>
        <span class="va-menu-title">${lblStart}</span>
        <span class="va-menu-sub">${lblStartSub}</span>
      </button>
    </div>`;

  s.querySelector('#vaBack').addEventListener('click', () => window.showScreen('homeScreen'));
  s.querySelector('#vaRefBtn').addEventListener('click', () => showReference(0));
  s.querySelector('#vaStartBtn').addEventListener('click', startSession);
}

// ── Reference cards ──────────────────────────────────────────────────────────

function showReference(index) {
  va.mode = 'reference';
  va.refPair = index;
  const pair = VERB_PAIRS[index];
  const s = getScreen();
  const native = state.nativeLanguage;
  const total = VERB_PAIRS.length;

  const examplesHtml = pair.sentences.map(sent => {
    const aspectLabel = sent.aspect === 'imperfective'
      ? `<span class="va-aspect-tag va-imp">IMP</span>`
      : `<span class="va-aspect-tag va-perf">PERF</span>`;
    return `
      <div class="va-ref-example">
        <div class="va-ref-uk">${aspectLabel} ${escHtml(sent.uk)}</div>
        <div class="va-ref-en">${escHtml(loc(sent))}</div>
        <div class="va-ref-why">${escHtml(loc(sent.why))}</div>
      </div>`;
  }).join('');

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vaRefBack">←</button>
      <div>
        <div class="lesson-title">${escHtml(pair.imperfective)} / ${escHtml(pair.perfective)}</div>
        <div class="lesson-subtitle">${escHtml(loc(pair.meaning))} — ${index + 1}/${total}</div>
      </div>
    </div>

    <div class="va-ref-card">
      <div class="va-ref-pair-row">
        <div class="va-ref-pair-col va-imp-bg">
          <div class="va-ref-pair-label">${native === 'nl' ? 'Onvoltooid' : 'Imperfective'}</div>
          <div class="va-ref-pair-verb">${escHtml(pair.imperfective)}</div>
        </div>
        <div class="va-ref-pair-col va-perf-bg">
          <div class="va-ref-pair-label">${native === 'nl' ? 'Voltooid' : 'Perfective'}</div>
          <div class="va-ref-pair-verb">${escHtml(pair.perfective)}</div>
        </div>
      </div>
      <div class="va-ref-tip">${escHtml(loc(pair.tip))}</div>
    </div>

    <div class="va-ref-examples-title">${native === 'nl' ? 'Voorbeelden' : 'Examples'}</div>
    <div class="va-ref-examples">${examplesHtml}</div>

    <div class="va-ref-nav">
      <button class="va-nav-btn" id="vaRefPrev" ${index === 0 ? 'disabled' : ''}>← ${native === 'nl' ? 'Vorige' : 'Previous'}</button>
      <button class="va-nav-btn" id="vaRefNext" ${index === total - 1 ? 'disabled' : ''}>${native === 'nl' ? 'Volgende' : 'Next'} →</button>
    </div>`;

  s.querySelector('#vaRefBack').addEventListener('click', showMenu);
  if (index > 0) s.querySelector('#vaRefPrev').addEventListener('click', () => showReference(index - 1));
  if (index < total - 1) s.querySelector('#vaRefNext').addEventListener('click', () => showReference(index + 1));
}

// ── Exercise session ─────────────────────────────────────────────────────────

function startSession() {
  va.mode = 'exercises';
  va.exercises = buildExerciseSet(va.total);
  va.current = 0;
  va.score = 0;
  va.answered = false;
  renderExercise();
}

function renderExercise() {
  const q = va.exercises[va.current];
  va.answered = false;

  switch (q.type) {
    case 'aspect_choice':  renderAspectChoice(q); break;
    case 'fill_verb':      renderFillVerb(q);     break;
    case 'sentence_write': renderSentenceWrite(q); break;
  }
}

function buildProgressBar() {
  const pct = Math.round((va.current / va.exercises.length) * 100);
  return `
    <div class="va-progress-wrap">
      <div class="va-progress-bar" style="width: ${pct}%"></div>
    </div>
    <div class="va-progress-text">${va.current + 1} / ${va.exercises.length}</div>`;
}

function buildVerbHint(pair) {
  return `
    <div class="va-verb-hint">
      <span class="va-hint-imp">${escHtml(pair.imperfective)}</span>
      <span class="va-hint-sep">/</span>
      <span class="va-hint-perf">${escHtml(pair.perfective)}</span>
      <span class="va-hint-meaning">${escHtml(loc(pair.meaning))}</span>
    </div>`;
}

// ── Type 1: Aspect Choice ────────────────────────────────────────────────────

function renderAspectChoice(q) {
  const s = getScreen();
  const native = state.nativeLanguage;
  const lblType = native === 'nl' ? 'Kies het juiste aspect' : 'Choose the correct aspect';

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vaExBack">←</button>
      <div>
        <div class="lesson-title">🔀 ${lblType}</div>
        <div class="lesson-subtitle" id="vaExSub">${buildProgressBar()}</div>
      </div>
    </div>

    ${buildVerbHint(q.pair)}

    <div class="va-q-card">
      <div class="va-q-translation">${escHtml(loc(q.translation))}</div>
      <div class="va-q-sentence">${escHtml(q.sentence)}</div>
    </div>

    <div class="va-options" id="vaOptions">
      ${q.options.map((opt, i) => `
        <button class="va-option-btn" data-value="${opt.value}" data-idx="${i}">
          ${escHtml(opt.label)}
        </button>
      `).join('')}
    </div>

    <div id="vaFeedback"></div>`;

  s.querySelector('#vaExBack').addEventListener('click', showMenu);
  s.querySelectorAll('.va-option-btn').forEach(btn => {
    btn.addEventListener('click', () => handleAspectAnswer(q, btn.dataset.value));
  });
}

function handleAspectAnswer(q, chosen) {
  if (va.answered) return;
  va.answered = true;
  const isRight = chosen === q.correctAspect;
  if (isRight) va.score++;

  document.querySelectorAll('.va-option-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.value === q.correctAspect) btn.classList.add('correct');
    else if (btn.dataset.value === chosen && !isRight) btn.classList.add('wrong');
  });

  showExFeedback(isRight, q.translation, q.verb);
}

// ── Type 2: Fill in the verb ─────────────────────────────────────────────────

function renderFillVerb(q) {
  const s = getScreen();
  const native = state.nativeLanguage;
  const lblType = native === 'nl' ? 'Vul het juiste werkwoord in' : 'Fill in the correct verb';

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vaExBack">←</button>
      <div>
        <div class="lesson-title">✏️ ${lblType}</div>
        <div class="lesson-subtitle" id="vaExSub">${buildProgressBar()}</div>
      </div>
    </div>

    ${buildVerbHint(q.pair)}

    <div class="va-q-card">
      <div class="va-q-translation">${escHtml(loc(q.translation))}</div>
      <div class="va-q-sentence">${escHtml(q.sentence)}</div>
    </div>

    <div class="va-input-area">
      <input type="text" class="va-text-input" id="vaInput"
        placeholder="${native === 'nl' ? 'Typ het werkwoord...' : 'Type the verb...'}"
        autocomplete="off" autocorrect="off" spellcheck="false" />
      <button class="va-check-btn" id="vaCheck">${native === 'nl' ? 'Controleer ✓' : 'Check ✓'}</button>
    </div>

    <div id="vaFeedback"></div>`;

  s.querySelector('#vaExBack').addEventListener('click', showMenu);
  const input = s.querySelector('#vaInput');
  const check = s.querySelector('#vaCheck');

  const submit = () => {
    const answer = input.value.trim();
    if (!answer) { input.focus(); return; }
    handleFillAnswer(q, answer);
  };

  check.addEventListener('click', submit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
  });
  input.focus();
}

function handleFillAnswer(q, answer) {
  if (va.answered) return;
  va.answered = true;

  const input = document.getElementById('vaInput');
  const check = document.getElementById('vaCheck');
  input.disabled = true;
  check.disabled = true;

  const normalise = s => s.toLowerCase().replace(/['ʼ]/g, "'").trim();
  const isRight = normalise(answer) === normalise(q.correctVerb);
  // Also accept close matches (1 character difference)
  const isClose = !isRight && levenshtein(normalise(answer), normalise(q.correctVerb)) <= 1;

  if (isRight || isClose) {
    va.score++;
    if (isClose) input.classList.add('close');
    else input.classList.add('correct');
  } else {
    input.classList.add('wrong');
  }

  showExFeedback(isRight || isClose, q.translation, q.correctVerb, answer, isClose);
}

// ── Type 3: Write the sentence ───────────────────────────────────────────────

function renderSentenceWrite(q) {
  const s = getScreen();
  const native = state.nativeLanguage;
  const lblType = native === 'nl' ? 'Schrijf de Oekraïense zin' : 'Write the Ukrainian sentence';

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vaExBack">←</button>
      <div>
        <div class="lesson-title">📝 ${lblType}</div>
        <div class="lesson-subtitle" id="vaExSub">${buildProgressBar()}</div>
      </div>
    </div>

    ${buildVerbHint(q.pair)}

    <div class="va-q-card">
      <div class="va-q-translation va-q-prominent">${escHtml(loc(q.translation))}</div>
      <div class="va-q-aspect-clue">
        ${q.translation.aspect === 'imperfective'
          ? `<span class="va-aspect-tag va-imp">IMP</span> ${native === 'nl' ? 'onvoltooid aspect' : 'imperfective aspect'}`
          : `<span class="va-aspect-tag va-perf">PERF</span> ${native === 'nl' ? 'voltooid aspect' : 'perfective aspect'}`}
      </div>
    </div>

    <div class="va-input-area">
      <textarea class="va-text-input va-textarea" id="vaInput" rows="2"
        placeholder="${native === 'nl' ? 'Schrijf de volledige zin in het Oekraïens...' : 'Write the full sentence in Ukrainian...'}"
        autocomplete="off" autocorrect="off" spellcheck="false"></textarea>
      <button class="va-check-btn" id="vaCheck">${native === 'nl' ? 'Controleer ✓' : 'Check ✓'}</button>
    </div>

    <div id="vaFeedback"></div>`;

  s.querySelector('#vaExBack').addEventListener('click', showMenu);
  const input = s.querySelector('#vaInput');
  const check = s.querySelector('#vaCheck');

  const submit = () => {
    const answer = input.value.trim();
    if (!answer) { input.focus(); return; }
    handleSentenceAnswer(q, answer);
  };

  check.addEventListener('click', submit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  });
  input.focus();
}

function handleSentenceAnswer(q, answer) {
  if (va.answered) return;
  va.answered = true;

  const input = document.getElementById('vaInput');
  const check = document.getElementById('vaCheck');
  input.disabled = true;
  check.disabled = true;

  // Compare normalised versions
  const normalise = s => s.toLowerCase().replace(/[.,!?;:'"«»""—\-]/g, '').replace(/\s+/g, ' ').trim();
  const normAnswer = normalise(answer);
  const normCorrect = normalise(q.correctSentence);

  const isExact = normAnswer === normCorrect;
  const lev = levenshtein(normAnswer, normCorrect);
  const maxLen = Math.max(normAnswer.length, normCorrect.length);
  const similarity = maxLen ? ((maxLen - lev) / maxLen) * 100 : 0;
  const isClose = !isExact && similarity >= 80;

  const fb = document.getElementById('vaFeedback');
  const native = state.nativeLanguage;

  if (isExact || isClose) {
    va.score++;
    input.classList.add(isExact ? 'correct' : 'close');
  } else {
    input.classList.add('wrong');
  }

  const yourLabel = native === 'nl' ? 'Jouw antwoord:' : 'Your answer:';
  const correctLabel = native === 'nl' ? 'Correct:' : 'Correct:';
  const whyLabel = native === 'nl' ? 'Waarom:' : 'Why:';

  const resultClass = (isExact || isClose) ? 'correct' : 'wrong';
  const resultText = isExact
    ? (native === 'nl' ? '✓ Perfect!' : '✓ Perfect!')
    : isClose
      ? (native === 'nl' ? '✓ Bijna perfect!' : '✓ Almost perfect!')
      : (native === 'nl' ? '✗ Niet helemaal' : '✗ Not quite');

  fb.innerHTML = `
    <div class="ex-feedback-result ${resultClass}">${resultText}</div>
    <div class="va-answer-compare">
      <div class="va-your-answer"><span class="va-ans-label">${yourLabel}</span> ${escHtml(answer)}</div>
      <div class="va-correct-answer"><span class="va-ans-label">${correctLabel}</span> ${escHtml(q.correctSentence)}</div>
    </div>
    <div class="va-why"><span class="va-ans-label">${whyLabel}</span> ${escHtml(loc(q.translation.why))}</div>
    <button class="va-listen-btn" id="vaListenCorrect">🔊 ${native === 'nl' ? 'Luister' : 'Listen'}</button>`;

  fb.querySelector('#vaListenCorrect').addEventListener('click', () => {
    speakText(q.correctSentence, state.currentLanguage);
  });

  showNextButton(fb);
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Shared feedback ──────────────────────────────────────────────────────────

function showExFeedback(isRight, translation, correctVerb, userAnswer, isClose) {
  const fb = document.getElementById('vaFeedback');
  const native = state.nativeLanguage;
  const whyLabel = native === 'nl' ? 'Waarom:' : 'Why:';

  const resultClass = isRight ? 'correct' : 'wrong';
  const resultText = isClose
    ? (native === 'nl' ? '✓ Bijna perfect! (kleine typfout)' : '✓ Almost perfect! (minor typo)')
    : isRight
      ? (native === 'nl' ? '✓ Correct!' : '✓ Correct!')
      : (native === 'nl' ? '✗ Niet helemaal' : '✗ Not quite');

  let answerHtml = '';
  if (userAnswer !== undefined && !isRight) {
    const yourLabel = native === 'nl' ? 'Jouw antwoord:' : 'Your answer:';
    const correctLabel = native === 'nl' ? 'Correct:' : 'Correct:';
    answerHtml = `
      <div class="va-answer-compare">
        <div class="va-your-answer"><span class="va-ans-label">${yourLabel}</span> ${escHtml(userAnswer)}</div>
        <div class="va-correct-answer"><span class="va-ans-label">${correctLabel}</span> ${escHtml(correctVerb)}</div>
      </div>`;
  } else if (!isRight) {
    const correctLabel = native === 'nl' ? 'Correct:' : 'Correct:';
    answerHtml = `
      <div class="va-correct-answer"><span class="va-ans-label">${correctLabel}</span> ${escHtml(correctVerb)}</div>`;
  }

  const fullSentence = translation.uk;

  fb.innerHTML = `
    <div class="ex-feedback-result ${resultClass}">${resultText}</div>
    ${answerHtml}
    <div class="va-full-sentence">${escHtml(fullSentence)}</div>
    <div class="va-why"><span class="va-ans-label">${whyLabel}</span> ${escHtml(loc(translation.why))}</div>
    <button class="va-listen-btn" id="vaListenCorrect">🔊 ${native === 'nl' ? 'Luister' : 'Listen'}</button>`;

  fb.querySelector('#vaListenCorrect').addEventListener('click', () => {
    speakText(fullSentence, state.currentLanguage);
  });

  showNextButton(fb);
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showNextButton(container) {
  const isLast = va.current + 1 >= va.exercises.length;
  const native = state.nativeLanguage;
  const btn = document.createElement('button');
  btn.className = 'va-next-btn';
  btn.textContent = isLast
    ? (native === 'nl' ? '🏁 Resultaten' : '🏁 See results')
    : (native === 'nl' ? 'Volgende →' : 'Next →');
  btn.addEventListener('click', () => {
    if (isLast) {
      showScore();
    } else {
      va.current++;
      renderExercise();
      getScreen().scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  container.appendChild(btn);
}

// ── Score screen ─────────────────────────────────────────────────────────────

function showScore() {
  const total = va.exercises.length;
  const score = va.score;
  const pct = Math.round((score / total) * 100);
  const emoji = pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪';
  const native = state.nativeLanguage;
  const msg = pct === 100 ? (native === 'nl' ? 'Perfecte score!' : 'Perfect score!')
            : pct >= 80 ? (native === 'nl' ? 'Geweldig!' : 'Great job!')
            : pct >= 60 ? (native === 'nl' ? 'Goed bezig!' : 'Good effort!')
            : (native === 'nl' ? 'Blijf oefenen!' : 'Keep practising!');

  const s = getScreen();
  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="vaScoreBack">←</button>
      <div>
        <div class="lesson-title">🔀 ${native === 'nl' ? 'Resultaten' : 'Results'}</div>
        <div class="lesson-subtitle">${native === 'nl' ? 'Werkwoordsaspect' : 'Verb Aspect Workshop'}</div>
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
      <div class="va-score-breakdown">
        ${countTypes()}
      </div>
      <div class="ex-score-actions">
        <button class="ex-next-btn" id="vaRetry">🔄 ${native === 'nl' ? 'Opnieuw (nieuwe vragen)' : 'Try again (new questions)'}</button>
        <button class="ex-back-btn" id="vaBackMenu">← ${native === 'nl' ? 'Menu' : 'Menu'}</button>
      </div>
    </div>`;

  s.querySelector('#vaScoreBack').addEventListener('click', showMenu);
  s.querySelector('#vaRetry').addEventListener('click', startSession);
  s.querySelector('#vaBackMenu').addEventListener('click', showMenu);
}

function countTypes() {
  const counts = { aspect_choice: 0, fill_verb: 0, sentence_write: 0 };
  va.exercises.forEach(q => counts[q.type]++);
  const native = state.nativeLanguage;
  return [
    counts.aspect_choice > 0 ? `${counts.aspect_choice} ${native === 'nl' ? 'aspectkeuze' : 'aspect choice'}` : '',
    counts.fill_verb > 0 ? `${counts.fill_verb} ${native === 'nl' ? 'invuloefeningen' : 'fill-in'}` : '',
    counts.sentence_write > 0 ? `${counts.sentence_write} ${native === 'nl' ? 'schrijfoefeningen' : 'sentence writing'}` : '',
  ].filter(Boolean).join(' · ');
}
