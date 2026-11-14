// ── Cyrillic alphabet: a reference table, tap a letter to hear it ───────────
import { ALPHABET } from './data/alphabet.js';
import { speakText } from './voice.js';
import { showScreen } from './router.js';
import { L, isNL } from './grammar/drill-core.js';

export function openAlphabetScreen() {
  // The table is looked at from Home, from a unit page, from the middle of a round:
  // ← returns to that place as it was left.
  const from = document.querySelector('.screen.active')?.id;
  const fromScroll = window.scrollY;
  showScreen('alphabetScreen');
  const s = document.getElementById('alphabetScreen');
  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" id="abBack" type="button">←</button>
      <div>
        <div class="lesson-title">🔤 ${L('Cyrillic alphabet', 'Cyrillisch alfabet')}</div>
        <div class="lesson-subtitle">${L('Tap a letter to hear it', 'Tik op een letter om hem te horen')}</div>
      </div>
    </div>
    <div class="alphabet-grid">
      ${ALPHABET.map(l => {
        const lower = l.c.split(' ')[1] || l.c;
        const hint = isNL() ? l.nl : l;
        return `<button class="letter-card" type="button" data-letter="${lower}">
          <div class="cyrillic">${l.c}</div><div class="latin">${hint.l}</div><div class="sound">${hint.s}</div>
        </button>`;
      }).join('')}
    </div>`;
  s.querySelector('#abBack').addEventListener('click', () => {
    if (!from || from === 'alphabetScreen') { window.openExercisesScreen(); return; }
    showScreen(from);
    window.scrollTo(0, fromScroll);
  });
  s.querySelectorAll('.letter-card').forEach(c => c.addEventListener('click', () => {
    speakText(c.dataset.letter, 'uk-UA');
    c.classList.add('playing');
    setTimeout(() => c.classList.remove('playing'), 600);
  }));
}
