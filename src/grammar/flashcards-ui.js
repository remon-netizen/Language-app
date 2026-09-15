import { state } from '../state.js';
import { getDueWords, scheduleWord, updateWordAfterReview } from '../words.js';
import { escHtml } from '../utils.js';
import { speakText } from '../voice.js';
import { grade, resultLine, L } from './drill-core.js';
import { markActivity } from '../data/activity.js';

// ── State ─────────────────────────────────────────────────────────────────────

const fc = {
  cards: [],
  current: 0,
  score: 0,
};

// ── Entry point ───────────────────────────────────────────────────────────────

export function openFlashcardScreen() {
  const due = getDueWords();
  window.showScreen('flashcardScreen');
  if (due.length === 0) {
    renderNothingDue();
    return;
  }
  fc.cards = [...due].sort(() => Math.random() - 0.5);
  fc.current = 0;
  fc.score = 0;
  renderFlashcard();
}

function header(subtitle) {
  return `
    <div class="lesson-header">
      <button class="back-btn" onclick="openReviewScreen()">←</button>
      <div>
        <div class="lesson-title">📇 ${L('Flashcards', 'Flashcards')}</div>
        <div class="lesson-subtitle">${subtitle}</div>
      </div>
    </div>`;
}

function renderNothingDue() {
  const screen = document.getElementById('flashcardScreen');
  screen.innerHTML = `
    ${header(L('Nothing due', 'Niets te herhalen'))}
    <div class="screen-inner">
      <div class="fc-done-card">
        <div class="fc-done-icon">🎉</div>
        <div class="fc-done-msg">${L('All caught up. Save words from a conversation and they come back here when they are due.', 'Helemaal bij. Sla woorden op uit een gesprek; ze komen hier terug als ze aan de beurt zijn.')}</div>
        <button class="fc-flip-btn" onclick="openReviewScreen()" style="margin-top:20px">← ${L('Back to review', 'Terug naar herhalen')}</button>
      </div>
    </div>`;
}

// ── Card ──────────────────────────────────────────────────────────────────────
// Two ways in: type the word from its meaning (production), or just flip it.
// Typing suggests a rating; the learner still confirms with a rating button,
// and Enter confirms the suggested one.

function renderFlashcard() {
  if (fc.current >= fc.cards.length) {
    renderDoneScreen();
    return;
  }

  const w = fc.cards[fc.current];
  const progress = `${fc.current + 1} / ${fc.cards.length}`;
  const fillPct = (fc.current / fc.cards.length) * 100;

  const screen = document.getElementById('flashcardScreen');
  screen.innerHTML = `
    ${header(`${progress} · ${L('due today', 'vandaag')}`)}
    <div class="screen-inner">
      <div class="fc-progress-bar">
        <div class="fc-progress-fill" style="width:${fillPct}%"></div>
      </div>
      <div class="fc-card" id="fcCard">
        <!-- Front: meaning → type the word -->
        <div id="fcFront">
          <div class="fc-prompt">${L('How do you say', 'Hoe zeg je')}</div>
          <div class="fc-translation fc-translation-front">${escHtml(w.translation)}</div>
          <div class="fc-pos">${escHtml(w.part_of_speech_target || w.part_of_speech || '')}</div>
          <div class="fc-type-row">
            <input type="text" class="fc-type-input" id="fcInput" lang="${state.currentLanguage}"
              placeholder="${L('Type it…', 'Typ het…')}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
            <button class="fc-check-btn" id="fcCheck" type="button">✓</button>
          </div>
          <button class="fc-flip-btn" id="fcFlip" type="button">${L('Just show me →', 'Laat maar zien →')}</button>
        </div>
        <!-- Back (hidden) -->
        <div id="fcBack" style="display:none">
          <div id="fcResult"></div>
          <div class="fc-word">${escHtml(w.word)} <button class="fc-say" id="fcSay" type="button" title="${L('Listen', 'Luister')}">🔊</button></div>
          <div class="fc-translation">${escHtml(w.translation)}</div>
          ${w.details ? `<div class="fc-details">${escHtml(w.details)}</div>` : ''}
          <div class="fc-rate-label" id="fcRateLabel">${L('How well did you know it?', 'Hoe goed kende je het?')}</div>
          <div class="fc-rate-row">
            <button class="fc-rate-btn fc-again" type="button" data-q="1">😰 ${L('Again', 'Opnieuw')}</button>
            <button class="fc-rate-btn fc-hard"  type="button" data-q="3">🤔 ${L('Hard', 'Moeilijk')}</button>
            <button class="fc-rate-btn fc-easy"  type="button" data-q="5">😊 ${L('Easy', 'Makkelijk')}</button>
          </div>
        </div>
      </div>
      <div style="text-align:center;font-size:0.8rem;color:var(--gray)">
        ✓ ${fc.score} ${L('remembered', 'onthouden')} · ${fc.current - fc.score} ${L('to review again', 'nog een keer')}
      </div>
    </div>`;

  const input = screen.querySelector('#fcInput');
  const check = () => {
    const answer = input.value.trim();
    if (!answer) { input.focus(); return; }
    const g = grade(answer, [w.word]);
    reveal(g.isExact ? 5 : g.isClose ? 3 : 1, resultLine(g) + (g.isExact ? '' : `
      <div class="fc-compare">${L('You typed', 'Jij typte')}: <b>${escHtml(answer)}</b></div>`));
  };
  screen.querySelector('#fcCheck').addEventListener('click', check);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
  screen.querySelector('#fcFlip').addEventListener('click', () => reveal(null, ''));
  screen.querySelectorAll('.fc-rate-btn').forEach(btn => {
    btn.addEventListener('click', () => rateFlashcard(Number(btn.dataset.q)));
  });
  screen.querySelector('#fcSay').addEventListener('click', () => speakText(w.word, state.currentLanguage));
  input.focus();
}

// Show the back. `suggest` is the rating the typed answer earned (or null when
// the card was simply flipped); that button gets focus so Enter confirms it.
function reveal(suggest, resultHtml) {
  const front = document.getElementById('fcFront');
  const back  = document.getElementById('fcBack');
  if (front) front.style.display = 'none';
  if (back)  back.style.display  = '';
  const res = document.getElementById('fcResult');
  if (res) res.innerHTML = resultHtml;
  if (suggest) {
    const label = document.getElementById('fcRateLabel');
    if (label) label.textContent = L('Confirm or adjust:', 'Bevestig of pas aan:');
    const btn = document.querySelector(`.fc-rate-btn[data-q="${suggest}"]`);
    if (btn) { btn.classList.add('fc-suggested'); btn.focus({ preventScroll: true }); }
  }
}

function renderDoneScreen() {
  const pct = fc.cards.length ? Math.round((fc.score / fc.cards.length) * 100) : 0;
  const msg = pct >= 80 ? L('🎉 Excellent session!', '🎉 Uitstekende sessie!')
    : pct >= 60 ? L('👍 Good work!', '👍 Goed gedaan!')
    : L('💪 Keep reviewing — repetition is key!', '💪 Blijf herhalen — herhaling is de sleutel!');

  const screen = document.getElementById('flashcardScreen');
  screen.innerHTML = `
    ${header(L('Session complete', 'Sessie klaar'))}
    <div class="screen-inner">
      <div class="fc-done-card">
        <div class="fc-done-icon">🎉</div>
        <div class="fc-done-pct">${pct}%</div>
        <div class="fc-done-text">${fc.score} / ${fc.cards.length} ${L('remembered', 'onthouden')}</div>
        <div class="fc-done-msg">${msg}</div>
        <div class="fc-next-info">📅 ${L('Next review scheduled automatically', 'Volgende herhaling wordt automatisch ingepland')} ✓</div>
        <button class="fc-flip-btn" onclick="openReviewScreen()" style="margin-top:20px">← ${L('Back to review', 'Terug naar herhalen')}</button>
      </div>
    </div>`;
}

// ── Exported actions (called via window.* from onclick) ───────────────────────

export function flipFlashcard() { reveal(null, ''); }

export function rateFlashcard(quality) {
  const word    = fc.cards[fc.current];
  const updated = scheduleWord(word, quality);
  updateWordAfterReview(updated);

  if (quality >= 3) fc.score++;
  markActivity();
  fc.current++;
  renderFlashcard();
}
