// ── Cyrillic alphabet: a reference table, tap a letter to hear it ───────────
import { ALPHABET } from './data/alphabet.js';
import { speakText } from './voice.js';
import { showScreen } from './router.js';
import { L } from './grammar/drill-core.js';

export function openAlphabetScreen() {
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
        return `<button class="letter-card" type="button" data-letter="${lower}">
          <div class="cyrillic">${l.c}</div><div class="latin">${l.l}</div><div class="sound">${l.s}</div>
        </button>`;
      }).join('')}
    </div>`;
  s.querySelector('#abBack').addEventListener('click', () => window.openExercisesScreen());
  s.querySelectorAll('.letter-card').forEach(c => c.addEventListener('click', () => {
    speakText(c.dataset.letter, 'uk-UA');
    c.classList.add('playing');
    setTimeout(() => c.classList.remove('playing'), 600);
  }));
}
