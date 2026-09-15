// ── Shared pieces of every typed drill ────────────────────────────────────────
// The verb, case, prefix, aspect and numbers drills all check a typed answer,
// show feedback, hand focus to a Next button so a second Enter advances, and
// end on a score card. Those pieces live here so they behave the same way and
// a fix lands in every drill at once.

import { state } from '../state.js';
import { escHtml, levenshtein } from '../utils.js';
import { speakText } from '../voice.js';

export const isNL = () => state.nativeLanguage === 'nl';
export const L = (en, nl) => (isNL() ? nl : en);

// Picks the native-language variant of a { en, nl } field, or passes strings through.
export function loc(field) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[state.nativeLanguage] || field.en || '';
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Apostrophe variants (’ ʼ ` ´ ‘) all count as the Ukrainian apostrophe.
export const normalise = s => String(s).toLowerCase().replace(/[’ʼ`´‘]/g, "'").replace(/\s+/g, ' ').trim();

// Grade a typed answer against one or more accepted forms.
// A one-letter slip counts as correct ("close") only on words of minTypoLen+
// characters: два/дві or три/тре are real errors, not typos.
export function grade(answer, accepted, { minTypoLen = 5 } = {}) {
  const list = Array.isArray(accepted) ? accepted : [accepted];
  const a = normalise(answer);
  const isExact = list.some(c => normalise(c) === a);
  const isClose = !isExact && list.some(c => c.length >= minTypoLen && levenshtein(normalise(c), a) <= 1);
  return { isExact, isClose, isCorrect: isExact || isClose };
}

// "✓ Correct!" / "✓ Almost! (minor typo)" / "✗ Not quite"
export function resultLine({ isExact, isCorrect }) {
  const text = isExact ? '✓ Correct!'
    : isCorrect ? '✓ ' + L('Almost! (minor typo)', 'Bijna! (kleine typfout)')
    : '✗ ' + L('Not quite', 'Niet helemaal');
  return `<div class="ex-feedback-result ${isCorrect ? 'correct' : 'wrong'}">${text}</div>`;
}

// Append a Next / See results button and focus it, so Enter advances.
export function appendNext(container, { isLast, className, onNext }) {
  const btn = document.createElement('button');
  btn.className = className;
  btn.type = 'button'; // not 'submit': Enter activates this button by design
  btn.textContent = isLast ? '🏁 ' + L('See results', 'Resultaten') : L('Next →', 'Volgende →');
  btn.addEventListener('click', onNext);
  container.appendChild(btn);
  // The answer input is disabled once checked, so it can no longer receive the
  // keypress itself; preventScroll keeps focus from fighting the smooth scroll.
  btn.focus({ preventScroll: true });
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  return btn;
}

export function scoreMessage(pct) {
  return pct === 100 ? L('Perfect score!', 'Perfecte score!')
    : pct >= 80 ? L('Great job!', 'Geweldig!')
    : pct >= 60 ? L('Good effort!', 'Goed bezig!')
    : L('Keep practising!', 'Blijf oefenen!');
}
export function scoreEmoji(pct) {
  return pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪';
}

// "Missed this round" list. items: [{ left, right, extra?, say? }]
export function missedListHtml(items, { cls = 'drill' } = {}) {
  if (!items.length) return '';
  return `
    <div class="dc-missed dc-missed-${cls}">
      <div class="dc-missed-title">${L('Missed this round', 'Fout deze ronde')}</div>
      ${items.map(it => `
        <div class="dc-missed-row">
          <span class="dc-missed-left">${escHtml(it.left)}</span>
          <span class="dc-missed-right">${escHtml(it.right)}</span>
          <span class="dc-missed-extra">${escHtml(it.extra || '')}</span>
          <button class="dc-missed-speak" type="button" data-say="${escHtml(it.say || it.right)}">🔊</button>
        </div>`).join('')}
    </div>`;
}

// Wire every [data-say] button inside a container to text-to-speech.
export function wireSpeakButtons(container) {
  container.querySelectorAll('[data-say]').forEach(btn => {
    btn.addEventListener('click', () => speakText(btn.dataset.say, state.currentLanguage));
  });
}
