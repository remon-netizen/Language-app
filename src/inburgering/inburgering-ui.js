import { escHtml } from '../utils.js';
import {
  generateInburgeringQuestions,
  generateReadingSession,
  generateWritingTasks,
  evaluateWriting,
  evaluateSpeaking,
  INBURGERING_TOPICS,
} from '../api/inburgering.js';
import { speakText, speakSlow } from '../voice.js';
import { setupRecognition } from '../speech.js';

// ── State ─────────────────────────────────────────────────────────────────────

let ib = {
  topic:       null,
  list:        [],
  reading_text: null,
  current:     0,
  score:       0,
  answered:    false,
  level:       localStorage.getItem('ibLevel') || 'b1',
  playCount:   0,
};

function getScreen() { return document.getElementById('inburgeringScreen'); }

// ── Entry point ───────────────────────────────────────────────────────────────

export function openInburgeringScreen() {
  window.showScreen('inburgeringScreen');
  showTopicPicker();
}

// ── Topic picker ──────────────────────────────────────────────────────────────

function showTopicPicker() {
  ib = { ...ib, topic: null, list: [], reading_text: null, current: 0, score: 0, answered: false };
  const s = getScreen();

  const knsTopics  = INBURGERING_TOPICS.filter(t => t.category === 'kns');
  const taalTopics = INBURGERING_TOPICS.filter(t => t.category === 'taal');
  const isA2       = ib.level === 'a2';

  const renderGroup = (topics) => topics.map(t => `
    <button class="ib-topic-card" data-id="${t.id}">
      <span class="ib-topic-icon">${t.icon}</span>
      <span class="ib-topic-title">${escHtml(t.title)}</span>
      <span class="ib-topic-sub">${escHtml(t.subtitle)}</span>
    </button>`).join('');

  s.innerHTML = `
    <div class="ib-header">
      <button class="back-btn" id="ibHomeBack">←</button>
      <div>
        <div class="lesson-title">🇳🇱 Inburgeringsexamen</div>
        <div class="lesson-subtitle" id="ibPickerSub">Voorbereiding — kies een onderwerp</div>
      </div>
    </div>

    <div class="ib-level-bar">
      <span class="ib-level-label">Route:</span>
      <button class="ib-level-btn ${!isA2 ? 'active' : ''}" data-level="b1">B1 <span class="ib-level-hint">standaard</span></button>
      <button class="ib-level-btn ${isA2  ? 'active' : ''}" data-level="a2">A2 <span class="ib-level-hint">Z-route</span></button>
    </div>

    <div class="ib-intro-banner">
      <div class="ib-intro-icon">📝</div>
      <div class="ib-intro-text" id="ibIntroText"></div>
    </div>

    <div class="ib-section-label">📚 Kennis van de Nederlandse Samenleving (KNS)</div>
    <div class="ib-topic-grid">${renderGroup(knsTopics)}</div>

    <div class="ib-section-label" style="margin-top:18px">🗣️ Taalvaardigheid (NT2)</div>
    <div class="ib-topic-grid">${renderGroup(taalTopics)}</div>`;

  updateLevelBanner();

  s.querySelector('#ibHomeBack').addEventListener('click', () => window.showScreen('homeScreen'));
  s.querySelectorAll('.ib-level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      ib.level = btn.dataset.level;
      localStorage.setItem('ibLevel', ib.level);
      s.querySelectorAll('.ib-level-btn').forEach(b => b.classList.toggle('active', b.dataset.level === ib.level));
      updateLevelBanner();
    });
  });
  s.querySelectorAll('.ib-topic-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const topic = INBURGERING_TOPICS.find(t => t.id === btn.dataset.id);
      if (topic) startSession(topic);
    });
  });
}

function updateLevelBanner() {
  const el  = document.getElementById('ibIntroText');
  const sub = document.getElementById('ibPickerSub');
  if (!el) return;
  if (ib.level === 'a2') {
    el.innerHTML = `<strong>A2 — Z-route (zelfredzaamheidsroute).</strong> Voor mensen die het B1-niveau niet kunnen halen. Test of je je kunt redden in het dagelijks leven.`;
    if (sub) sub.textContent = 'A2 Z-route — kies een onderwerp';
  } else {
    el.innerHTML = `<strong>B1 — Standaard inburgeringsroute.</strong> Test je kennis van de Nederlandse samenleving (KNS) en taalvaardigheid (NT2) op B1-niveau.`;
    if (sub) sub.textContent = 'B1 standaard — kies een onderwerp';
  }
}

// ── Session router ────────────────────────────────────────────────────────────

async function startSession(topic) {
  if (topic.id === 'taal_schrijven') { startWritingSession(topic); return; }
  if (topic.id === 'taal_lezen')     { startReadingSession(topic); return; }

  ib = { ...ib, topic, list: [], reading_text: null, current: 0, score: 0, answered: false, playCount: 0 };
  renderLoadingScreen(topic);

  try {
    const result = await generateInburgeringQuestions(topic, ib.level);
    ib.list  = result.exercises;
    ib.intro = result.intro;
    renderQuestion();
  } catch (err) { renderError(err.message); }
}

// ── Reading session ───────────────────────────────────────────────────────────

async function startReadingSession(topic) {
  ib = { ...ib, topic, list: [], reading_text: null, current: 0, score: 0, answered: false };
  renderLoadingScreen(topic);

  try {
    const result       = await generateReadingSession(ib.level);
    ib.reading_text    = result.reading_text;
    ib.reading_type    = result.text_type;
    ib.list            = result.exercises;
    renderReadingQuestion();
  } catch (err) { renderError(err.message); }
}

function renderReadingQuestion() {
  const q     = ib.list[ib.current];
  const total = ib.list.length;
  document.getElementById('ibSubtitle').textContent = `Vraag ${ib.current + 1} van ${total}`;

  const body = document.getElementById('ibBody');
  body.className = 'ib-body';
  body.innerHTML = `
    <div class="ib-progress">${buildDots()}</div>

    <details class="ib-reading-details" ${ib.current === 0 ? 'open' : ''}>
      <summary class="ib-reading-toggle">📄 ${escHtml(ib.reading_type || 'Lees de tekst')} <span class="ib-reading-hint">(klik om in/uit te klappen)</span></summary>
      <div class="ib-reading-text">${escHtml(ib.reading_text)}</div>
    </details>

    <div class="ib-question">${escHtml(q.question)}</div>
    <div class="ib-options">
      ${(q.options || []).map((opt, i) => `
        <button class="ib-option" data-idx="${i}">${escHtml(opt)}</button>`).join('')}
    </div>
    <div id="ibFeedback"></div>`;

  body.querySelectorAll('.ib-option').forEach(btn => {
    btn.addEventListener('click', () => handleMC(parseInt(btn.dataset.idx)));
  });
}

// ── Writing session ───────────────────────────────────────────────────────────

async function startWritingSession(topic) {
  ib = { ...ib, topic, list: [], current: 0, score: 0, answered: false };
  renderLoadingScreen(topic, 'Schrijfopdrachten worden aangemaakt…');

  try {
    const tasks = await generateWritingTasks(ib.level);
    ib.list = tasks.map(t => ({ type: 'writing', ...t }));
    renderWritingTask();
  } catch (err) { renderError(err.message); }
}

function renderWritingTask() {
  const task  = ib.list[ib.current];
  const total = ib.list.length;
  document.getElementById('ibSubtitle').textContent = `Opdracht ${ib.current + 1} van ${total}`;

  const body = document.getElementById('ibBody');
  body.className = 'ib-body';
  body.innerHTML = `
    <div class="ib-progress">${buildDots()}</div>
    <div class="ib-writing-badge">✍️ Schrijfopdracht</div>
    <div class="ib-writing-situation">${escHtml(task.situation)}</div>
    <div class="ib-writing-prompt">${escHtml(task.prompt)}</div>
    <div class="ib-writing-target">📝 Schrijf ongeveer <strong>${escHtml(task.word_target)}</strong></div>
    <div class="ib-criteria-list">
      ${(task.criteria || []).map(c => `
        <div class="ib-criterion" data-text="${escHtml(c)}">
          <span class="ib-criterion-dot"></span>
          <span>${escHtml(c)}</span>
        </div>`).join('')}
    </div>
    <textarea class="ib-writing-input" id="ibWritingInput"
      placeholder="Schrijf hier je tekst…"
      rows="6" autocomplete="off" spellcheck="true"></textarea>
    <div class="ib-writing-wordcount" id="ibWordCount">0 woorden</div>
    <button class="ib-check-btn" id="ibWritingSubmit">Inleveren →</button>
    <div id="ibFeedback"></div>`;

  const textarea  = body.querySelector('#ibWritingInput');
  const wordcount = body.querySelector('#ibWordCount');
  textarea.addEventListener('input', () => {
    const n = textarea.value.trim().split(/\s+/).filter(Boolean).length;
    wordcount.textContent = `${n} woorden`;
    wordcount.style.color = n >= 20 ? 'var(--success, #16a34a)' : 'var(--gray)';
  });
  textarea.focus();

  body.querySelector('#ibWritingSubmit').addEventListener('click', async () => {
    const text = textarea.value.trim();
    if (!text || text.split(/\s+/).length < 5) { textarea.focus(); return; }
    await handleWritingSubmit(task, text);
  });
}

async function handleWritingSubmit(task, userText) {
  if (ib.answered) return;
  ib.answered = true;

  document.getElementById('ibWritingInput').disabled  = true;
  document.getElementById('ibWritingSubmit').disabled = true;

  const fb = document.getElementById('ibFeedback');
  fb.innerHTML = `<div class="ib-eval-loading"><div class="ib-spinner" style="width:24px;height:24px"></div> Wordt beoordeeld…</div>`;
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  try {
    const ev = await evaluateWriting(task, userText, ib.level);

    const completionOk = ev.task_completion !== 'onvolledig';
    if (completionOk) ib.score++;

    const grammarEmoji = { goed: '✅', redelijk: '🟡', matig: '🔴' };
    const criteriaHtml = (task.criteria || []).map((c, i) => {
      const met = Array.isArray(ev.criteria_met) ? ev.criteria_met[i] : true;
      return `<div class="ib-criterion-result ${met ? 'met' : 'not-met'}">
        ${met ? '✓' : '✗'} ${escHtml(c)}
      </div>`;
    }).join('');

    const correctionsHtml = (ev.corrections || []).length
      ? `<div class="ib-writing-corrections">
          <div class="ib-eval-label">Verbeteringen:</div>
          ${(ev.corrections || []).map(c => `<div class="ib-correction-item">📝 ${escHtml(c)}</div>`).join('')}
        </div>`
      : '';

    fb.innerHTML = `
      <div class="ib-writing-eval">
        <div class="ib-eval-row">
          <span class="ib-eval-label">Taakvoltooiing:</span>
          <span class="ib-eval-badge ${ev.task_completion === 'volledig' ? 'good' : ev.task_completion === 'gedeeltelijk' ? 'ok' : 'bad'}">
            ${escHtml(ev.task_completion || '—')}
          </span>
        </div>
        <div class="ib-eval-row">
          <span class="ib-eval-label">Grammatica:</span>
          <span>${grammarEmoji[ev.grammar_score] || '—'} ${escHtml(ev.grammar_score || '—')}</span>
        </div>
        <div class="ib-eval-row">
          <span class="ib-eval-label">Woordenschat:</span>
          <span>${grammarEmoji[ev.vocabulary_score] || '—'} ${escHtml(ev.vocabulary_score || '—')}</span>
        </div>
        <div class="ib-criteria-results">${criteriaHtml}</div>
        ${correctionsHtml}
        ${ev.improved_version ? `
        <div class="ib-writing-example">
          <div class="ib-eval-label">Verbeterde versie:</div>
          <div class="ib-example-text">${escHtml(ev.improved_version)}</div>
        </div>` : ''}
        ${ev.tip ? `<div class="ib-explanation">💡 ${escHtml(ev.tip)}</div>` : ''}
      </div>`;

    appendNextBtn(fb, ib.current + 1 >= ib.list.length);
  } catch (err) {
    fb.innerHTML = `<div class="ib-error">Beoordeling mislukt: ${escHtml(err.message)}</div>`;
    appendNextBtn(fb, ib.current + 1 >= ib.list.length);
  }
}

// ── Standard question renderer ────────────────────────────────────────────────

function renderQuestion() {
  const q = ib.list[ib.current];
  document.getElementById('ibSubtitle').textContent = `Vraag ${ib.current + 1} van ${ib.list.length}`;

  if (q.passage) { renderListeningQuestion(q); return; }
  if (q.type === 'open' && ib.topic?.id === 'taal_spreken') { renderSpeakingQuestion(q); return; }
  if (q.type === 'open') { renderOpenQuestion(q); return; }
  renderMCQuestion(q);
}

function buildDots() {
  return ib.list.map((q, i) => {
    const cls  = i < ib.current ? 'done' : i === ib.current ? 'current' : '';
    const open = (q.type === 'open' || q.type === 'writing') ? ' ib-open-dot' : '';
    return `<span class="ib-dot ${cls}${open}"></span>`;
  }).join('');
}

// ── Listening question (TTS) ──────────────────────────────────────────────────

function renderListeningQuestion(q) {
  ib.playCount = 0;
  const body = document.getElementById('ibBody');
  body.className = 'ib-body';
  body.innerHTML = `
    <div class="ib-progress">${buildDots()}</div>
    <div class="ib-listening-card">
      <div class="ib-listen-situation">🎧 ${escHtml(q.situation || 'Luister naar het fragment')}</div>
      <button class="ib-tts-btn" id="ibPlayBtn">▶ Beluister het fragment</button>
      <div class="ib-play-count" id="ibPlayCount"></div>
      <div class="ib-passage-wrap">
        <details class="ib-passage-details">
          <summary class="ib-passage-toggle">📄 Tekst tonen (na afloop)</summary>
          <div class="ib-passage-text">${escHtml(q.passage)}</div>
        </details>
      </div>
    </div>
    <div class="ib-question">${escHtml(q.question)}</div>
    <div class="ib-options">
      ${(q.options || []).map((opt, i) => `
        <button class="ib-option" data-idx="${i}">${escHtml(opt)}</button>`).join('')}
    </div>
    <div id="ibFeedback"></div>`;

  body.querySelector('#ibPlayBtn').addEventListener('click', function() {
    speakText(q.passage, 'nl-NL');
    ib.playCount++;
    const countEl = document.getElementById('ibPlayCount');
    if (countEl) countEl.textContent = `${ib.playCount}× beluisterd`;
    this.textContent = '🔄 Opnieuw beluisteren';
  });

  body.querySelectorAll('.ib-option').forEach(btn => {
    btn.addEventListener('click', () => handleMC(parseInt(btn.dataset.idx)));
  });
}

// ── Multiple-choice ───────────────────────────────────────────────────────────

function renderMCQuestion(q) {
  const body = document.getElementById('ibBody');
  body.className = 'ib-body';
  body.innerHTML = `
    <div class="ib-progress">${buildDots()}</div>
    ${ib.current === 0 && ib.intro ? `<div class="ib-intro-note">${escHtml(ib.intro)}</div>` : ''}
    ${q.situation ? `<div class="ib-situation-label">📍 ${escHtml(q.situation)}</div>` : ''}
    <div class="ib-question">${escHtml(q.question)}</div>
    <div class="ib-options">
      ${(q.options || []).map((opt, i) => `
        <button class="ib-option" data-idx="${i}">${escHtml(opt)}</button>`).join('')}
    </div>
    <div id="ibFeedback"></div>`;

  body.querySelectorAll('.ib-option').forEach(btn => {
    btn.addEventListener('click', () => handleMC(parseInt(btn.dataset.idx)));
  });
}

function handleMC(chosen) {
  if (ib.answered) return;
  ib.answered = true;

  const q       = ib.list[ib.current];
  const correct = q.correct;
  const isRight = chosen === correct;
  if (isRight) ib.score++;

  document.querySelectorAll('.ib-option').forEach((btn, i) => {
    btn.disabled = true;
    if (i === correct)               btn.classList.add('correct');
    else if (i === chosen && !isRight) btn.classList.add('wrong');
  });

  showFeedback(isRight, q.explanation);
}

// ── Open question ─────────────────────────────────────────────────────────────

function renderOpenQuestion(q) {
  const body = document.getElementById('ibBody');
  body.className = 'ib-body';
  body.innerHTML = `
    <div class="ib-progress">${buildDots()}</div>
    <div class="ib-open-badge">✏️ Open vraag</div>
    ${q.situation ? `<div class="ib-situation-label">📍 ${escHtml(q.situation)}</div>` : ''}
    <div class="ib-question">${escHtml(q.question)}</div>
    <div class="ib-open-area">
      <textarea class="ib-open-input" id="ibOpenInput"
        placeholder="Typ je antwoord hier…" rows="3"
        autocomplete="off" autocorrect="off" spellcheck="false"></textarea>
      <button class="ib-check-btn" id="ibCheck">Controleer ✓</button>
    </div>
    <div id="ibFeedback"></div>`;

  const input  = body.querySelector('#ibOpenInput');
  const submit = () => { const v = input.value.trim(); if (!v) { input.focus(); return; } handleOpen(v); };
  body.querySelector('#ibCheck').addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } });
  input.focus();
}

function handleOpen(userAnswer) {
  if (ib.answered) return;
  ib.answered = true;
  document.getElementById('ibOpenInput').disabled = true;
  document.getElementById('ibCheck').disabled     = true;

  const q  = ib.list[ib.current];
  const fb = document.getElementById('ibFeedback');
  fb.innerHTML = `
    <div class="ib-open-row your"><span class="ib-open-lbl">Jouw antwoord:</span> <span class="ib-open-val">${escHtml(userAnswer)}</span></div>
    <div class="ib-open-row correct"><span class="ib-open-lbl">Goed antwoord:</span> <span class="ib-open-val">${escHtml(q.correct_answer)}</span></div>
    <div class="ib-explanation">${escHtml(q.explanation)}</div>
    <div class="ib-self-assess">
      <div class="ib-self-label">Had je het goed?</div>
      <div class="ib-self-btns">
        <button class="ib-self-yes" id="ibYes">✓ Ja</button>
        <button class="ib-self-no"  id="ibNo">✗ Niet helemaal</button>
      </div>
    </div>`;

  const proceed = (got) => {
    if (got) ib.score++;
    fb.querySelector('#ibYes').disabled = true;
    fb.querySelector('#ibNo').disabled  = true;
    fb.querySelector('#ibYes').classList.toggle('chosen', got);
    fb.querySelector('#ibNo').classList.toggle('chosen', !got);
    appendNextBtn(fb);
  };
  fb.querySelector('#ibYes').addEventListener('click', () => proceed(true));
  fb.querySelector('#ibNo').addEventListener('click',  () => proceed(false));
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Speaking question (mic + AI evaluation) ───────────────────────────────────

function renderSpeakingQuestion(q) {
  const body = document.getElementById('ibBody');
  body.className = 'ib-body';
  body.innerHTML = `
    <div class="ib-progress">${buildDots()}</div>
    <div class="ib-open-badge">🗣️ Spreek- / schrijfopdracht</div>
    ${q.situation ? `<div class="ib-situation-label">📍 ${escHtml(q.situation)}</div>` : ''}
    <div class="ib-question">${escHtml(q.question)}</div>
    <div class="ib-speaking-area">
      <textarea class="ib-open-input" id="ibSpeakInput"
        placeholder="Typ je antwoord of gebruik de microfoon…" rows="3"
        autocomplete="off" spellcheck="false"></textarea>
      <div class="ib-speaking-btns">
        <button class="ib-mic-btn" id="ibSpeakMic" title="Spreek in het Nederlands">🎙️ Spreek</button>
        <button class="ib-check-btn" id="ibSpeakCheck">Controleer ✓</button>
      </div>
      <div class="ib-mic-status" id="ibMicStatus"></div>
    </div>
    <div id="ibFeedback"></div>`;

  const input    = body.querySelector('#ibSpeakInput');
  const micBtn   = body.querySelector('#ibSpeakMic');
  const micStatus = body.querySelector('#ibMicStatus');

  // Mic button
  micBtn.addEventListener('click', () => {
    micBtn.disabled  = true;
    micStatus.textContent = '🎙️ Spreek nu…';
    micStatus.className = 'ib-mic-status recording';

    const rec = setupRecognition('nl-NL',
      (event) => {
        const transcript = event.results[0][0].transcript.trim();
        input.value = transcript;
        micStatus.textContent = `✓ Opgenomen: "${transcript}"`;
        micStatus.className = 'ib-mic-status done';
      },
      () => {
        micBtn.disabled = false;
        if (!input.value) {
          micStatus.textContent = 'Niets gehoord. Probeer opnieuw.';
          micStatus.className = 'ib-mic-status';
        }
      }
    );
    if (rec) rec.start();
    else {
      micBtn.disabled = false;
      micStatus.textContent = 'Microfoon niet beschikbaar.';
    }
  });

  // Submit
  const submit = () => {
    const val = input.value.trim();
    if (!val) { input.focus(); return; }
    handleSpeakingAnswer(val, q);
  };
  body.querySelector('#ibSpeakCheck').addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } });
  input.focus();
}

async function handleSpeakingAnswer(userText, q) {
  if (ib.answered) return;
  ib.answered = true;

  document.getElementById('ibSpeakInput').disabled  = true;
  document.getElementById('ibSpeakCheck').disabled  = true;
  document.getElementById('ibSpeakMic').disabled    = true;

  const fb = document.getElementById('ibFeedback');
  fb.innerHTML = `<div class="ib-eval-loading"><div class="ib-spinner" style="width:24px;height:24px"></div> Wordt beoordeeld…</div>`;
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  try {
    const ev = await evaluateSpeaking(q.situation || '', q.question, userText, ib.level);
    if (ev.appropriate) ib.score++;

    const regLabel = ev.register_correct ? '✅ Register correct' : '⚠️ Let op register (formeel/informeel)';
    const grammarEmoji = { goed: '✅', redelijk: '🟡', matig: '🔴' };

    fb.innerHTML = `
      <div class="ib-feedback-result ${ev.appropriate ? 'correct' : 'wrong'}">
        ${ev.appropriate ? '✓ Gepast antwoord!' : '✗ Antwoord kan beter'}
      </div>
      <div class="ib-speaking-eval">
        <div class="ib-eval-row">${regLabel}</div>
        <div class="ib-eval-row">Grammatica: ${grammarEmoji[ev.grammar_score] || '—'} ${escHtml(ev.grammar_score || '—')}</div>
      </div>
      ${ev.better_response ? `
      <div class="ib-writing-example">
        <div class="ib-eval-label">Beter antwoord:</div>
        <div class="ib-example-text">${escHtml(ev.better_response)}</div>
      </div>` : ''}
      <div class="ib-explanation">${escHtml(ev.explanation || '')}</div>`;

    appendNextBtn(fb);
  } catch (err) {
    fb.innerHTML = `<div class="ib-error">Kon niet beoordelen: ${escHtml(err.message)}</div>`;
    appendNextBtn(fb);
  }
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function showFeedback(isRight, explanation) {
  const fb = document.getElementById('ibFeedback');
  fb.innerHTML = `
    <div class="ib-feedback-result ${isRight ? 'correct' : 'wrong'}">
      ${isRight ? '✓ Correct!' : '✗ Niet helemaal'}
    </div>
    <div class="ib-explanation">${escHtml(explanation)}</div>`;
  appendNextBtn(fb);
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function appendNextBtn(container, isLastOverride) {
  const isLast = isLastOverride !== undefined ? isLastOverride : ib.current + 1 >= ib.list.length;
  const btn = document.createElement('button');
  btn.className   = 'ib-next-btn';
  btn.textContent = isLast ? '🏁 Resultaat bekijken' : 'Volgende →';
  btn.addEventListener('click', () => {
    if (isLast) {
      showScore();
    } else {
      ib.current++;
      ib.answered = false;
      if (ib.topic?.id === 'taal_schrijven')       renderWritingTask();
      else if (ib.topic?.id === 'taal_lezen')      renderReadingQuestion();
      else                                          renderQuestion();
      document.getElementById('ibBody').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  container.appendChild(btn);
}

function renderLoadingScreen(topic, msg = 'Oefenvragen worden gemaakt…') {
  const s = getScreen();
  s.innerHTML = `
    <div class="ib-header">
      <button class="back-btn" id="ibTopicBack">←</button>
      <div>
        <div class="lesson-title">${topic.icon} ${escHtml(topic.title)}</div>
        <div class="lesson-subtitle" id="ibSubtitle">${escHtml(ib.level.toUpperCase())} · laden…</div>
      </div>
    </div>
    <div id="ibBody" class="ib-loading">
      <div class="ib-spinner"></div>
      <div class="ib-loading-text">${msg}</div>
    </div>`;
  s.querySelector('#ibTopicBack').addEventListener('click', () => { showTopicPicker(); });
}

function renderError(msg) {
  const body = document.getElementById('ibBody');
  if (!body) return;
  body.className = 'ib-body';
  body.innerHTML = `
    <div class="ib-error">⚠️ ${escHtml(msg)}</div>
    <button class="ib-action-btn" id="ibErrBack">← Terug naar onderwerpen</button>`;
  body.querySelector('#ibErrBack').addEventListener('click', () => showTopicPicker());
}

// ── Score screen ──────────────────────────────────────────────────────────────

function showScore() {
  const total   = ib.list.length;
  const score   = ib.score;
  const pct     = Math.round((score / total) * 100);
  const emoji   = pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪';
  const msg     = pct === 100 ? 'Uitstekend!' : pct >= 80 ? 'Goed gedaan!' : pct >= 60 ? 'Goede poging!' : 'Blijf oefenen!';
  const topic   = ib.topic;

  document.getElementById('ibSubtitle').textContent = 'Klaar!';

  const isWriting  = ib.list[0]?.type === 'writing';
  const breakdownLine = isWriting
    ? `${total} schrijfopdrachten (AI-beoordeeld)`
    : (() => {
        const openCount = ib.list.filter(q => q.type === 'open').length;
        const mc = total - openCount;
        return openCount > 0 ? `${mc} meerkeuzevragen · ${openCount} open vragen` : '';
      })();

  document.getElementById('ibBody').innerHTML = `
    <div class="ib-score-card">
      <div class="ib-score-emoji">${emoji}</div>
      <div class="ib-score-title">${escHtml(msg)}</div>
      <div class="ib-score-fraction">${score} / ${total}</div>
      <div class="ib-score-bar-wrap"><div class="ib-score-bar-fill" style="width:${pct}%"></div></div>
      <div class="ib-score-pct">${pct}%</div>
      ${breakdownLine ? `<div class="ib-score-breakdown">${escHtml(breakdownLine)}</div>` : ''}
      <div class="ib-exam-tip">
        ${pct >= 70
          ? `✅ <strong>Examentip (${ib.level.toUpperCase()}):</strong> Je haalt de minimale 70%. Je zit op schema!`
          : `💡 <strong>Examentip (${ib.level.toUpperCase()}):</strong> Voor het echte examen moet je minimaal 70% halen. Nog wat oefenen!`}
      </div>
      <div class="ib-score-actions">
        <button class="ib-next-btn" id="ibRetry">🔄 Opnieuw proberen</button>
        <button class="ib-back-btn" id="ibBackTopics">← Onderwerpen</button>
      </div>
    </div>`;

  document.getElementById('ibRetry').addEventListener('click', () => startSession(topic));
  document.getElementById('ibBackTopics').addEventListener('click', () => showTopicPicker());
}
