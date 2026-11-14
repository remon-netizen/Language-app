// ── Course engine ─────────────────────────────────────────────────────────────
// One way of learning for every subject:
//   1. learn   a new item is shown with its answer (hear it, copy it)
//   2. test    the same item from memory, typed
//   3. review  it comes back on an SM-2 schedule, in one queue with everything else
//   4. apply   free practice on the patterns (the course's own random drill)
//
// A course supplies its items, its menu and its cards. The engine owns what used
// to be copied into every drill: running a session, checking
// an answer, feedback, "my answer was right too", the score card and the missed
// list. Because every course hands over the same kind of card, cards of different
// courses can sit in one session: that is the single Review queue.
// The schedule behind it lives in data/course-progress.js.

import { state } from '../state.js';
import { escHtml } from '../utils.js';
import { speakText } from '../voice.js';
import { setupRecognition } from '../speech.js';
import { L, shuffle, byKeyboard, keyboardOf, resultLine, appendNext, missedListHtml, wireSpeakButtons, scoreMessage, scoreEmoji } from './drill-core.js';
import { keyboardHelpFirstTime, openKeyboardHelp, latinTypedNote, cyrillicTypedNote } from '../keyboard-help.js';
import { keyboardAid } from '../keyboard-picture.js';

// ── Sessions ─────────────────────────────────────────────────────────────────
// A card:
//   key          item id
//   course       { icon, name } shown as a chip when cards of several courses are mixed
//   intro        first exposure: the answer is on the card, nothing is recorded
//   promptHtml   the question block
//   autoSay      text spoken when the card appears
//   input        { type: 'text', lang, placeholder, inputmode, speak? }
//                  speak = { lang, check(heard[]) → result }: the answer may be said out loud
//                | { type: 'choice', options: [{ label, correct }] }
//   check(a)     → { isExact, isClose, isCorrect, quality, retry?, headline? }
//                  retry = a note; the answer is not counted and the learner tries again
//   record(res)  stores the result, returns a token for override
//   override(t)  optional: undo a miss ("my answer was right too")
//   compareOnClose  show "your answer / correct" for a near miss too
//   correctText  the right answer, as text
//   detailHtml   shown under the verdict: the item itself, notes. A string, or
//                ({ res, compare }) => string when it depends on what is already on screen
//   say          text behind the Listen button; with sayAfter it is also played once answered
//   missed       { left, right, extra, say } row for the end-of-round list
//   mount({ root, input, submit })  optional, called once the card is on screen: for a
//                card that reacts while the learner types (the typing course colours
//                each letter and submits by itself when the line is complete)

const DEFAULT_ACCENT = { main: '#7c3aed', dark: '#5b21b6', soft: '#f5f3ff', border: '#c4b5fd' };
// An answer that is one plain Ukrainian text (no "a / b" alternatives): its keys can be pointed out one by one.
const COPYABLE = /^[\u0400-\u04FF' .,?!-]+$/;

// ── Warm-up ──────────────────────────────────────────────────────────────────
// A session that teaches something new starts with a few items that are due,
// from every course: old material is kept alive inside what the learner wanted
// to do anyway, without ever locking the new. review.js registers the source.
let dueSource = null;
export function registerDueSource(src) { dueSource = src; }   // { cards(): card[], count(): number }
export const dueCount = () => (dueSource ? dueSource.count() : 0);

function warmUpCards(n, own, source) {
  const src = source || (dueSource && dueSource.cards);
  if (!src || n <= 0) return [];
  const taken = new Set(own.map(c => c.key));
  const due = src().filter(c => !taken.has(c.key));
  // A course's own source hands over its cards in its own order (due first).
  // The warm-up's Ukrainian answers come last: what follows it is typed in Ukrainian too.
  return byKeyboard((source ? due : shuffle(due)).slice(0, n), 'own').map(c => ({ ...c, warmup: true }));
}

// warmUp: how many due items open the session; warmUpSource: where they come from
// (a course's own due cards), default every course.
// resume: { at, score, missed } picks a round up where it was left: it starts at
// own card number `at` (the warm-up is skipped) with the score so far.
// onProgress({ at, score, missed }) reports after every answered card of the
// round itself, so the caller can keep that position.
// scoreNote() → html: a line of the round's own on the score card (typing speed).
export function runSession({ screen, icon, title, accent = DEFAULT_ACCENT, cards, mixed = false, warmUp = 0, warmUpSource = null, resume = null, onProgress = null, onExit, again, scoreSubtitle, scoreNote = null }) {
  const s = screen;
  const startAt = resume ? Math.max(0, Math.min(resume.at || 0, cards.length - 1)) : 0;
  const warm = startAt ? [] : warmUpCards(warmUp, cards, warmUpSource);
  if (warm.length) cards = [...warm, ...cards];
  const run = { current: startAt, score: resume?.score || 0, answered: false, missed: [...(resume?.missed || [])], keyHandler: null };
  // How far the round itself is, for the caller to remember.
  const report = () => { const at = run.current + 1 - warm.length; if (onProgress && at > 0) onProgress({ at, score: run.score, missed: run.missed }); };
  s.style.setProperty('--ce-main', accent.main);
  s.style.setProperty('--ce-dark', accent.dark);
  s.style.setProperty('--ce-soft', accent.soft);
  s.style.setProperty('--ce-border', accent.border);

  const header = (titleText, sub) => `
    <div class="lesson-header ce-header">
      <button class="back-btn" id="ceBack" type="button">←</button>
      <div class="ce-header-text">
        <div class="lesson-title">${icon} ${escHtml(titleText)}</div>
        <div class="lesson-subtitle">${sub}</div>
      </div>
    </div>`;

  const exit = () => { detachKeys(); onExit(); };
  const detachKeys = () => { if (run.keyHandler) { s.removeEventListener('keydown', run.keyHandler); run.keyHandler = null; } };

  function renderCard() {
    run.answered = false;
    detachKeys();
    const card = cards[run.current];
    const inWarm = !!card.warmup, own = cards.length - warm.length;
    const pos = inWarm ? run.current : run.current - warm.length, total = inWarm ? warm.length : own;
    const pct = Math.round((pos / total) * 100);
    const isChoice = card.input.type === 'choice';
    // The answer moves to another keyboard than the last typed card used: say so
    // once, at the card where it changes.
    const kb = keyboardOf(card);
    const kbSwitch = kb && run.kb && kb !== run.kb;
    if (kb) run.kb = kb;

    s.innerHTML = `
      ${header(title, `<div class="ce-progress-wrap"><div class="ce-progress-bar" style="width:${pct}%"></div></div>
                       <div class="ce-progress-text">${inWarm ? L('Warm-up', 'Opwarmen') + ' · ' : ''}${pos + 1} / ${total}</div>`)}
      ${inWarm ? `<div class="ce-warmup-banner">
          <span class="ce-warmup-title">🔁 ${L('Warm-up', 'Opwarmen')} ${pos + 1}/${warm.length}: ${card.practice ? L('extra practice, not due yet', 'extra oefening, nog niet aan de beurt') : L('something you learned before', 'iets wat je al geleerd hebt')}${card.course ? ` · ${card.course.icon} ${escHtml(card.course.name)}` : ''}</span>
          <span class="ce-warmup-sub">${L(`Then the new material (${own} cards).`, `Daarna het nieuwe (${own} kaarten).`)} <button class="ce-warmup-skip" id="ceSkipWarm" type="button">${L('Skip warm-up →', 'Opwarmen overslaan →')}</button></span>
        </div>`
        : mixed && card.course ? `<div class="ce-course-chip">${card.course.icon} ${escHtml(card.course.name)}</div>` : ''}
      ${kbSwitch ? `<div class="ce-kb-switch">⌨️ ${kb === 'uk'
        ? L('From here the answers are in Ukrainian: switch your keyboard.', 'Vanaf hier zijn de antwoorden in het Oekraïens: wissel je toetsenbord.')
        : L('From here the answers are in English: switch your keyboard back.', 'Vanaf hier zijn de antwoorden in het Nederlands: zet je toetsenbord terug.')}</div>` : ''}
      ${card.promptHtml}
      ${isChoice ? `
        <div class="ce-options">
          ${card.input.options.map((o, i) => `<button class="ce-option-btn" type="button" data-idx="${i}">${escHtml(o.label)}</button>`).join('')}
        </div>` : `
        <div class="ce-input-area">
          <input type="text" class="ce-text-input" id="ceInput" lang="${card.input.lang || 'uk'}" inputmode="${card.input.inputmode || 'text'}"
            placeholder="${escHtml(card.input.placeholder || '')}"
            autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
          <button class="ce-check-btn" id="ceCheck" type="button">${L('Check', 'Controleer')} ✓</button>
        </div>
        ${card.input.speak ? `
        <div class="ce-or">${L('or say it out loud', 'of zeg het hardop')}</div>
        <button class="ce-speak-btn" id="ceSpeak" type="button">🎙️ ${L('Speak', 'Spreek')}</button>` : ''}
        <div class="ce-retry-note" id="ceRetry" hidden></div>`}
      <div id="ceFeedback"></div>`;

    s.querySelector('#ceBack').addEventListener('click', exit);
    s.querySelector('#ceSkipWarm')?.addEventListener('click', () => { run.current = warm.length; renderCard(); s.scrollTo({ top: 0 }); });
    wireSpeakButtons(s);
    if (card.autoSay) setTimeout(() => speakText(card.autoSay, state.currentLanguage), card.intro ? 200 : 0);

    if (isChoice) wireChoice(card); else wireText(card);
    // A new learner's first typed Ukrainian answer: say how to get the letters, once.
    if (!isChoice && card.input.lang === 'uk' && keyboardHelpFirstTime()) s.querySelector('#ceInput')?.blur();
  }

  function wireText(card) {
    const input = s.querySelector('#ceInput');
    const check = s.querySelector('#ceCheck');
    const submit = () => {
      if (run.answered) return;
      const answer = input.value.trim();
      if (!answer) { input.focus(); return; }
      const note = s.querySelector('#ceRetry');
      // Latin letters in a Ukrainian answer are a keyboard setting, not a mistake:
      // nothing is graded, the learner switches and tries again.
      const latin = card.input.lang === 'uk' ? latinTypedNote(answer, card.correctText) : null;
      if (latin) {
        note.innerHTML = `${escHtml(latin)} <button class="ce-retry-link" id="ceKbHelp" type="button">⌨️ ${L('How?', 'Hoe?')}</button>`;
        note.hidden = false;
        note.querySelector('#ceKbHelp').addEventListener('click', openKeyboardHelp);
        input.focus(); input.select();
        return;
      }
      // And the same the other way round, for an answer in the learner's own language.
      const cyrillic = card.input.lang !== 'uk' ? cyrillicTypedNote(answer, card.correctText) : null;
      if (cyrillic) {
        note.textContent = cyrillic; note.hidden = false;
        input.focus(); input.select();
        return;
      }
      const res = card.check(answer);
      if (res.retry) {
        note.textContent = res.retry; note.hidden = false;
        input.value = ''; input.focus();
        return;
      }
      run.answered = true;
      input.disabled = true; check.disabled = true;
      input.classList.add(res.isExact ? 'correct' : res.isClose ? 'close' : 'wrong');
      settle(card, res, answer, { compare: card.compareOnClose ? !res.isExact : !res.isCorrect });
    };
    check.addEventListener('click', submit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    input.focus();
    if (card.input.speak) wireSpeak(card, input, check);
    if (card.mount) card.mount({ root: s, input, submit });
    // Where the letters are, for whoever types Ukrainian on a keyboard with Latin
    // keycaps. On a card that shows its answer (a new word being copied) the next
    // key is lit; where the answer must come from memory it is reference only.
    // (A card with its own mount, the typing course, brings its own.)
    else if (card.input.lang === 'uk') keyboardAid({ root: s, input, text: card.intro && COPYABLE.test(card.correctText || '') ? card.correctText : null });
  }

  // The microphone is a second way to give the same answer: what was heard is
  // graded by the card and settled exactly like a typed answer.
  function wireSpeak(card, input, check) {
    const btn = s.querySelector('#ceSpeak');
    let rec = null, recording = false;
    const idle = () => { recording = false; btn.textContent = '🎙️ ' + L('Speak', 'Spreek'); btn.classList.remove('recording'); };
    btn.addEventListener('click', () => {
      if (recording) { rec?.stop(); return; }
      rec = setupRecognition(card.input.speak.lang, event => {
        if (run.answered) return;
        const heard = Array.from(event.results[0]).map(r => r.transcript.trim());
        rec.stop();
        if (!heard[0]) { const note = s.querySelector('#ceRetry'); note.textContent = L('Nothing detected. Try again.', 'Niets gehoord. Probeer het nog eens.'); note.hidden = false; return; }
        run.answered = true;
        input.disabled = true; check.disabled = true; btn.disabled = true;
        const res = card.input.speak.check(heard);
        input.value = heard[0];
        input.classList.add(res.isExact ? 'correct' : res.isClose ? 'close' : 'wrong');
        settle(card, res, heard[0], { compare: !res.isExact, heard: true });
      }, idle);
      if (!rec) return;
      recording = true; btn.textContent = '⏹ Stop'; btn.classList.add('recording');
      rec.start();
    });
  }

  function wireChoice(card) {
    const buttons = [...s.querySelectorAll('.ce-option-btn')];
    const pick = btn => {
      if (run.answered) return;
      run.answered = true;
      const opt = card.input.options[Number(btn.dataset.idx)];
      const ok = !!opt.correct;
      buttons.forEach((b, i) => {
        b.disabled = true;
        if (card.input.options[i].correct) b.classList.add('correct');
        else if (b === btn) b.classList.add('wrong');
      });
      settle(card, { isExact: ok, isClose: false, isCorrect: ok, quality: ok ? 3 : 1 }, opt.label, { compare: false });
    };
    buttons.forEach(btn => btn.addEventListener('click', () => pick(btn)));
    // Keys 1–4 pick an option, so a whole round can be done from the keyboard.
    run.keyHandler = e => {
      if (run.answered || !/^[1-9]$/.test(e.key)) return;
      const btn = buttons[Number(e.key) - 1];
      if (btn) { e.preventDefault(); pick(btn); }
    };
    s.addEventListener('keydown', run.keyHandler);
    buttons[0].focus({ preventScroll: true });
  }

  // Verdict, record, feedback, Next.
  function settle(card, res, answer, { compare, heard = false }) {
    if (res.isCorrect) run.score++;
    // Introduction cards are copying, so they never count as a failure.
    let token = null;
    if (!card.intro) {
      token = card.record(res);
      if (!res.isCorrect) run.missed.push(card.missed);
    }

    s.querySelectorAll('.ty-kb, .ty-kb-toggle').forEach(el => el.remove());   // the answer is in: make way for the feedback
    const fb = s.querySelector('#ceFeedback');
    let html = res.headline ? `<div class="ex-feedback-result correct">✓ ${escHtml(res.headline)}</div>` : resultLine(res);
    if (compare) {
      html += `<div class="ce-compare">
        <div class="ce-your-answer"><b>${heard ? L('I heard:', 'Ik hoorde:') : L('Your answer:', 'Jouw antwoord:')}</b> ${escHtml(answer)}</div>
        <div class="ce-correct-answer"><b>${L('Correct:', 'Correct:')}</b> ${escHtml(card.correctText)}</div>
      </div>`;
    }
    // A typed answer can be right without being on the list (a synonym, another turn of phrase).
    const canOverride = !card.intro && !res.isCorrect && card.override;
    if (canOverride) html += `<button class="ce-override-btn" id="ceOverride" type="button">✓ ${L('My answer was right too', 'Mijn antwoord was ook goed')}</button>`;
    html += (typeof card.detailHtml === 'function' ? card.detailHtml({ res, compare }) : card.detailHtml) || '';
    if (card.say) html += `<button class="ce-listen-btn" id="ceListen" type="button">🔊 ${L('Listen', 'Luister')}</button>`;
    fb.innerHTML = html;
    wireSpeakButtons(fb);
    fb.querySelector('#ceListen')?.addEventListener('click', () => speakText(card.say, state.currentLanguage));
    if (card.sayAfter && card.say) setTimeout(() => speakText(card.say, state.currentLanguage), 400);

    report();

    if (canOverride) {
      const btn = fb.querySelector('#ceOverride');
      btn.addEventListener('click', () => {
        card.override(token);
        run.score++;
        run.missed.pop();
        report();
        fb.querySelector('.ex-feedback-result').outerHTML = `<div class="ex-feedback-result correct">✓ ${L('Counted as correct', 'Goed gerekend')}</div>`;
        btn.remove();
        const input = s.querySelector('#ceInput');
        if (input) { input.classList.remove('wrong'); input.classList.add('close'); }
        fb.querySelector('.ce-next-btn')?.focus({ preventScroll: true });
      });
    }

    const isLast = run.current + 1 >= cards.length;
    appendNext(fb, { isLast, className: 'ce-next-btn', onNext: () => {
      if (isLast) showScore();
      else { run.current++; renderCard(); s.scrollTo({ top: 0, behavior: 'smooth' }); }
    } });
  }

  function showScore() {
    detachKeys();
    const total = cards.length;
    const pct = Math.round((run.score / total) * 100);
    const more = again ? again() : null; // { label, run } — asked now, progress has moved on
    s.innerHTML = `
      ${header(L('Results', 'Resultaten'), escHtml(scoreSubtitle ? scoreSubtitle() : title))}
      <div class="ex-score-card">
        <div class="ex-score-emoji">${scoreEmoji(pct)}</div>
        <div class="ex-score-title">${escHtml(scoreMessage(pct))}</div>
        <div class="ex-score-fraction">${run.score} / ${total}</div>
        <div class="ex-score-bar-wrap"><div class="ex-score-bar-fill" style="width: ${pct}%"></div></div>
        <div class="ex-score-pct">${pct}%</div>
        ${scoreNote ? `<div class="ce-score-note">${scoreNote()}</div>` : ''}
        <div class="ex-score-actions">
          ${more ? `<button class="ex-next-btn" id="ceAgain" type="button">${escHtml(more.label)}</button>` : ''}
          <button class="ex-back-btn" id="ceMenu" type="button">← Menu</button>
        </div>
      </div>
      ${missedListHtml(run.missed, { cls: 'course' })}`;
    wireSpeakButtons(s);
    s.querySelector('#ceBack').addEventListener('click', exit);
    s.querySelector('#ceMenu').addEventListener('click', exit);
    if (more) s.querySelector('#ceAgain').addEventListener('click', more.run);
    s.scrollTo({ top: 0 });
  }

  if (!cards.length) { onExit(); return; }
  renderCard();
}
