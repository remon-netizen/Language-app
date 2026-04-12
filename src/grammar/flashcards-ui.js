import { getDueWords, scheduleWord, updateWordAfterReview } from '../words.js';
import { escHtml } from '../utils.js';

// ── State ─────────────────────────────────────────────────────────────────────

const fc = {
  cards: [],
  current: 0,
  score: 0,
};

// ── Entry point ───────────────────────────────────────────────────────────────

export function openFlashcardScreen() {
  const due = getDueWords();
  if (due.length === 0) {
    alert('🎉 No cards due for review right now!\n\nAll caught up — check back later or save more words from conversations.');
    return;
  }
  // Shuffle
  fc.cards = [...due].sort(() => Math.random() - 0.5);
  fc.current = 0;
  fc.score = 0;
  window.showScreen('flashcardScreen');
  renderFlashcard();
}

// ── Render helpers ────────────────────────────────────────────────────────────

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
    <div class="lesson-header">
      <button class="back-btn" onclick="showScreen('wordsScreen')">←</button>
      <div>
        <div class="lesson-title">📇 Flashcards</div>
        <div class="lesson-subtitle">${progress} due today</div>
      </div>
    </div>
    <div class="screen-inner">
      <div class="fc-progress-bar">
        <div class="fc-progress-fill" style="width:${fillPct}%"></div>
      </div>
      <div class="fc-card" id="fcCard">
        <!-- Front -->
        <div id="fcFront">
          <div class="fc-word">${escHtml(w.word)}</div>
          <div class="fc-pos">${escHtml(w.part_of_speech_target || w.part_of_speech || '')}</div>
          <button class="fc-flip-btn" onclick="flipFlashcard()">Tap to reveal →</button>
        </div>
        <!-- Back (hidden) -->
        <div id="fcBack" style="display:none">
          <div class="fc-word">${escHtml(w.word)}</div>
          <div class="fc-translation">${escHtml(w.translation)}</div>
          ${w.details ? `<div class="fc-details">${escHtml(w.details)}</div>` : ''}
          <div class="fc-rate-label">How well did you know it?</div>
          <div class="fc-rate-row">
            <button class="fc-rate-btn fc-again" onclick="rateFlashcard(1)">😰 Again</button>
            <button class="fc-rate-btn fc-hard"  onclick="rateFlashcard(3)">🤔 Hard</button>
            <button class="fc-rate-btn fc-easy"  onclick="rateFlashcard(5)">😊 Easy</button>
          </div>
        </div>
      </div>
      <div style="text-align:center;font-size:0.8rem;color:var(--gray)">
        ✓ ${fc.score} remembered · ${fc.current - fc.score} to review again
      </div>
    </div>`;
}

function renderDoneScreen() {
  const pct = fc.cards.length ? Math.round((fc.score / fc.cards.length) * 100) : 0;
  const msg = pct >= 80 ? '🎉 Excellent session!' : pct >= 60 ? '👍 Good work!' : '💪 Keep reviewing — repetition is key!';

  const screen = document.getElementById('flashcardScreen');
  screen.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" onclick="showScreen('wordsScreen')">←</button>
      <div>
        <div class="lesson-title">📇 Flashcards</div>
        <div class="lesson-subtitle">Session complete!</div>
      </div>
    </div>
    <div class="screen-inner">
      <div class="fc-done-card">
        <div class="fc-done-icon">🎉</div>
        <div class="fc-done-pct">${pct}%</div>
        <div class="fc-done-text">${fc.score} / ${fc.cards.length} remembered</div>
        <div class="fc-done-msg">${msg}</div>
        <div class="fc-next-info">📅 Next review scheduled automatically ✓</div>
        <button class="fc-flip-btn" onclick="showScreen('wordsScreen')" style="margin-top:20px">← Back to My Words</button>
      </div>
    </div>`;
}

// ── Exported actions (called via window.* from onclick) ───────────────────────

export function flipFlashcard() {
  const front = document.getElementById('fcFront');
  const back  = document.getElementById('fcBack');
  if (front) front.style.display = 'none';
  if (back)  back.style.display  = '';
}

export function rateFlashcard(quality) {
  const word    = fc.cards[fc.current];
  const updated = scheduleWord(word, quality);
  updateWordAfterReview(updated);

  if (quality >= 3) fc.score++;
  fc.current++;
  renderFlashcard();
}
