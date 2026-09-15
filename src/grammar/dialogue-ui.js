import { state, getTTSLang } from '../state.js';
import { escHtml } from '../utils.js';
import { speakText, speakTextCb } from '../voice.js';
import { DIALOGUES } from '../data/dialogues-uk.js';
import { makeTracker } from '../data/flat-weakness.js';
import { L, loc, shuffle, grade, resultLine, appendNext } from './drill-core.js';

// ── Dialogues: listen first, then prove you understood ───────────────────────
// The transcript stays hidden while the dialogue plays. Two gap-fill lines
// (type the missing word you heard) and one comprehension question follow,
// then the transcript appears with translations and per-line playback.

export const tracker = makeTracker('dialogueWeakness');

let dg = { dialogue: null, step: 0, tasks: [], answered: false, results: [], playing: false, playIdx: -1 };

function getScreen() { return document.getElementById('dialogueScreen'); }
const line = (d, i) => (state.nativeLanguage === 'nl' ? d.lines[i].nl : d.lines[i].en);

function stopPlayback() { dg.playing = false; dg.playIdx = -1; state.synth.cancel(); }

// Plays lines one after another; onLine(i) fires as each starts.
function playLines(lines, onLine, onDone) {
  let i = 0;
  dg.playing = true;
  const next = () => {
    if (!dg.playing) return;
    if (i >= lines.length) { dg.playing = false; onDone && onDone(); return; }
    onLine(i);
    speakTextCb(lines[i].uk, getTTSLang(), () => { i++; setTimeout(next, 400); });
  };
  next();
}

// ── Public entry ─────────────────────────────────────────────────────────────

export function openDialogueScreen() {
  window.showScreen('dialogueScreen');
  showMenu();
}

// ── Menu ─────────────────────────────────────────────────────────────────────

function showMenu() {
  stopPlayback();
  const s = getScreen();
  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="dgBack">←</button>
      <div>
        <div class="lesson-title">🎧 ${L('Dialogues', 'Dialogen')}</div>
        <div class="lesson-subtitle">${L('Listen without the text, then answer', 'Luister zonder tekst, beantwoord dan de vragen')}</div>
      </div>
    </div>
    <div class="dg-howto">
      ${L('Each dialogue plays with the transcript hidden. Then you type two words you heard and answer one question. The text appears only at the end.',
          'Elke dialoog wordt afgespeeld zonder tekst. Daarna typ je twee woorden die je hoorde en beantwoord je één vraag. De tekst verschijnt pas aan het eind.')}
    </div>
    <div class="dg-list">
      ${DIALOGUES.map(d => {
        const keys = ['gap0', 'gap1', 'mc'].map(t => `dlg:${d.id}:${t}`);
        const tried = keys.some(k => tracker.attempts(k));
        const ok = keys.filter(k => tracker.attempts(k) && tracker.errorRate(k) < 0.5).length;
        return `
        <button class="dg-card" data-id="${d.id}">
          <span class="dg-card-icon">${d.icon}</span>
          <span class="dg-card-text">
            <span class="dg-card-title">${escHtml(loc(d.title))}</span>
            <span class="dg-card-sub">${d.level} · ${d.lines.length} ${L('lines', 'regels')}${tried ? ` · ${L('last time', 'vorige keer')} ${ok}/3` : ''}</span>
          </span>
          <span class="dg-card-arrow">▶</span>
        </button>`; }).join('')}
    </div>`;
  s.querySelector('#dgBack').addEventListener('click', () => window.openExercisesScreen());
  s.querySelectorAll('[data-id]').forEach(b => b.addEventListener('click', () => startDialogue(DIALOGUES.find(d => d.id === b.dataset.id))));
}

// ── Listening ────────────────────────────────────────────────────────────────

function startDialogue(d) {
  dg.dialogue = d;
  dg.results = [];
  dg.tasks = [
    { kind: 'gap', ...d.gaps[0], key: `dlg:${d.id}:gap0` },
    { kind: 'gap', ...d.gaps[1], key: `dlg:${d.id}:gap1` },
    { kind: 'mc', ...d.mc, key: `dlg:${d.id}:mc` },
  ];
  dg.step = 0;
  renderListen();
}

function renderListen() {
  const d = dg.dialogue;
  const s = getScreen();
  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="dgLBack">←</button>
      <div>
        <div class="lesson-title">${d.icon} ${escHtml(loc(d.title))}</div>
        <div class="lesson-subtitle">${L('Step 1 · Listen', 'Stap 1 · Luister')}</div>
      </div>
    </div>
    <div class="dg-stage">
      <div class="dg-speakers">
        ${d.lines.map((l, i) => `<div class="dg-bubble dg-bubble-${l.who}" data-line="${i}"><span class="dg-who">${l.who === 'A' ? '👩' : '👨'}</span><span class="dg-wave">▁▃▅▃▁</span></div>`).join('')}
      </div>
      <button class="dg-play-btn" id="dgPlay" type="button">▶ ${L('Play the dialogue', 'Speel de dialoog af')}</button>
      <div class="dg-play-hint">${L('Listen as often as you like. The text stays hidden.', 'Luister zo vaak je wilt. De tekst blijft verborgen.')}</div>
    </div>
    <button class="dg-ready-btn" id="dgReady" type="button" disabled>${L('I\'m ready → questions', 'Ik ben klaar → vragen')}</button>`;

  s.querySelector('#dgLBack').addEventListener('click', showMenu);
  const play = s.querySelector('#dgPlay');
  const ready = s.querySelector('#dgReady');
  play.addEventListener('click', () => {
    if (dg.playing) { stopPlayback(); play.textContent = '▶ ' + L('Play again', 'Nog eens'); s.querySelectorAll('.dg-bubble').forEach(b => b.classList.remove('active')); return; }
    play.textContent = '⏹ ' + L('Stop', 'Stop');
    playLines(d.lines, i => {
      s.querySelectorAll('.dg-bubble').forEach(b => b.classList.toggle('active', Number(b.dataset.line) === i));
    }, () => {
      s.querySelectorAll('.dg-bubble').forEach(b => b.classList.remove('active'));
      play.textContent = '🔁 ' + L('Play again', 'Nog eens');
      ready.disabled = false;
      ready.focus({ preventScroll: true });
    });
  });
  ready.addEventListener('click', () => { stopPlayback(); renderTask(); });
  // Voices may be missing in some browsers; never trap the learner on this screen.
  setTimeout(() => { ready.disabled = false; }, 4000);
}

// ── Tasks ────────────────────────────────────────────────────────────────────

function renderTask() {
  const d = dg.dialogue;
  const t = dg.tasks[dg.step];
  dg.answered = false;
  const s = getScreen();
  const header = `
    <div class="lesson-header">
      <button class="back-btn" id="dgTBack">←</button>
      <div>
        <div class="lesson-title">${d.icon} ${escHtml(loc(d.title))}</div>
        <div class="lesson-subtitle">${L('Step 2 · Question', 'Stap 2 · Vraag')} ${dg.step + 1} / ${dg.tasks.length}</div>
      </div>
    </div>`;

  if (t.kind === 'gap') {
    const l = d.lines[t.line];
    // Blank the word (any inflection/punctuation around it stays).
    const re = new RegExp(t.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const gapped = escHtml(l.uk).replace(new RegExp(escHtml(t.word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '<span class="dg-blank">____</span>');
    s.innerHTML = `
      ${header}
      <div class="dg-task-card">
        <div class="dg-task-label">${L('Which word did you hear?', 'Welk woord hoorde je?')}</div>
        <div class="dg-gap-line"><span class="dg-who">${l.who === 'A' ? '👩' : '👨'}</span> ${gapped}</div>
        <div class="dg-gap-trans">${escHtml(line(d, t.line))}</div>
        <button class="dg-replay" id="dgReplay" type="button">🔊 ${L('Hear this line', 'Hoor deze regel')}</button>
      </div>
      <div class="dg-input-area">
        <input type="text" class="dg-text-input" id="dgInput" lang="uk" placeholder="${L('Type the missing word…', 'Typ het ontbrekende woord…')}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
        <button class="dg-check-btn" id="dgCheck" type="button">${L('Check', 'Controleer')} ✓</button>
      </div>
      <div id="dgFeedback"></div>`;
    s.querySelector('#dgTBack').addEventListener('click', showMenu);
    s.querySelector('#dgReplay').addEventListener('click', () => speakText(l.uk, getTTSLang()));
    const input = s.querySelector('#dgInput');
    const submit = () => {
      if (dg.answered) return;
      const a = input.value.trim();
      if (!a) { input.focus(); return; }
      dg.answered = true;
      input.disabled = true; s.querySelector('#dgCheck').disabled = true;
      const g = grade(a, [t.word, ...(t.alts || [])]);
      input.classList.add(g.isExact ? 'correct' : g.isClose ? 'close' : 'wrong');
      finishTask(t, g.isCorrect, resultLine(g) + (g.isExact ? '' : `<div class="dg-correct">${L('The word was', 'Het woord was')}: <b>${escHtml(t.word)}</b></div>`) + `<div class="dg-full-line">${escHtml(l.uk)}</div>`);
    };
    s.querySelector('#dgCheck').addEventListener('click', submit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    speakText(l.uk, getTTSLang());
    input.focus();
    void re;
    return;
  }

  // multiple choice comprehension
  const opts = t.options.map((o, i) => ({ o, i }));
  s.innerHTML = `
    ${header}
    <div class="dg-task-card">
      <div class="dg-task-label">${L('Did you understand?', 'Heb je het begrepen?')}</div>
      <div class="dg-mc-q">${escHtml(loc(t.q))}</div>
    </div>
    <div class="dg-options">
      ${shuffle(opts).map(({ o, i }, n) => `<button class="dg-option-btn" type="button" data-i="${i}" data-n="${n}">${escHtml(loc(o))}</button>`).join('')}
    </div>
    <div id="dgFeedback"></div>`;
  s.querySelector('#dgTBack').addEventListener('click', showMenu);
  const pick = btn => {
    if (dg.answered) return;
    dg.answered = true;
    const ok = Number(btn.dataset.i) === t.correct;
    s.querySelectorAll('.dg-option-btn').forEach(b => { b.disabled = true; if (Number(b.dataset.i) === t.correct) b.classList.add('correct'); else if (b === btn) b.classList.add('wrong'); });
    finishTask(t, ok, resultLine({ isExact: ok, isCorrect: ok }));
  };
  s.querySelectorAll('.dg-option-btn').forEach(b => b.addEventListener('click', () => pick(b)));
  const keyHandler = e => { if (dg.answered || !/^[1-3]$/.test(e.key)) return; const b = s.querySelector(`.dg-option-btn[data-n="${Number(e.key) - 1}"]`); if (b) { e.preventDefault(); pick(b); } };
  if (dg.keyHandler) s.removeEventListener('keydown', dg.keyHandler);
  dg.keyHandler = keyHandler; s.addEventListener('keydown', keyHandler);
  s.querySelector('.dg-option-btn').focus({ preventScroll: true });
}

function finishTask(t, ok, html) {
  tracker.recordAnswer(t.key, ok);
  dg.results.push(ok);
  const fb = document.getElementById('dgFeedback');
  fb.innerHTML = html;
  const isLast = dg.step + 1 >= dg.tasks.length;
  appendNext(fb, { isLast, className: 'dg-next-btn', onNext: () => {
    if (isLast) renderTranscript();
    else { dg.step++; renderTask(); }
  } });
}

// ── Transcript ───────────────────────────────────────────────────────────────

function renderTranscript() {
  const d = dg.dialogue;
  const ok = dg.results.filter(Boolean).length;
  const s = getScreen();
  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="dgRBack">←</button>
      <div>
        <div class="lesson-title">${d.icon} ${escHtml(loc(d.title))}</div>
        <div class="lesson-subtitle">${L('Step 3 · Read along', 'Stap 3 · Lees mee')} · ${ok}/3 ${L('correct', 'goed')}</div>
      </div>
    </div>
    <div class="dg-score-line ${ok === 3 ? 'dg-score-top' : ''}">${ok === 3 ? '🏆 ' + L('All three right!', 'Alle drie goed!') : ok === 2 ? '👍 ' + L('Two out of three', 'Twee van de drie') : '💪 ' + L('Read along and try again later', 'Lees mee en probeer het later nog eens')}</div>
    <div class="dg-transcript">
      ${d.lines.map((l, i) => `
        <div class="dg-t-row dg-t-${l.who}">
          <span class="dg-who">${l.who === 'A' ? '👩' : '👨'}</span>
          <div class="dg-t-text">
            <div class="dg-t-uk">${escHtml(l.uk)} <button class="dg-t-say" data-say="${escHtml(l.uk)}" type="button">🔊</button></div>
            <div class="dg-t-tr">${escHtml(line(d, i))}</div>
          </div>
        </div>`).join('')}
    </div>
    <div class="dg-end-actions">
      <button class="dg-play-btn" id="dgPlayAll" type="button">🔁 ${L('Play the whole dialogue', 'Hele dialoog afspelen')}</button>
      <button class="dg-ready-btn" id="dgMenu" type="button">← ${L('More dialogues', 'Meer dialogen')}</button>
    </div>`;
  s.querySelector('#dgRBack').addEventListener('click', showMenu);
  s.querySelector('#dgMenu').addEventListener('click', showMenu);
  s.querySelectorAll('[data-say]').forEach(b => b.addEventListener('click', () => speakText(b.dataset.say, getTTSLang())));
  s.querySelector('#dgPlayAll').addEventListener('click', () => {
    if (dg.playing) { stopPlayback(); return; }
    playLines(d.lines, i => s.querySelectorAll('.dg-t-row').forEach((r, n) => r.classList.toggle('active', n === i)), () => s.querySelectorAll('.dg-t-row').forEach(r => r.classList.remove('active')));
  });
  s.scrollTo({ top: 0 });
}
