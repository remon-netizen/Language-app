// ── Ukrainian keyboard: how to get one ───────────────────────────────────────
// Most answers are typed in Ukrainian, and nothing in a phone or a computer says
// how to get the Cyrillic letters. This sheet does: the steps for the device in
// hand first, the other devices behind a fold. It opens by itself once, before a
// new learner's first typed answer, and again from the hint that appears when
// Latin letters are typed where Cyrillic is expected, and from Settings.

import { state } from './state.js';
import { escHtml } from './utils.js';
import { openSheet, closeSheet } from './sheet.js';
import { totalAnswers } from './data/activity.js';

const L = (en, nl) => (state.nativeLanguage === 'nl' ? nl : en);
const SEEN_KEY = 'kbHelpSeen';

function device() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Windows/.test(ua)) return 'windows';
  if (/Macintosh/.test(ua)) return 'mac';
  return null;
}

const DEVICES = {
  ios: {
    name: { en: 'iPhone and iPad', nl: 'iPhone en iPad' },
    steps: {
      en: ['Open <b>Settings</b> → <b>General</b> → <b>Keyboard</b> → <b>Keyboards</b>.', 'Tap <b>Add New Keyboard…</b> and choose <b>Ukrainian</b>.', 'While typing, switch with the <b>globe key 🌐</b> at the bottom left of the keyboard.'],
      nl: ['Open <b>Instellingen</b> → <b>Algemeen</b> → <b>Toetsenbord</b> → <b>Toetsenborden</b>.', 'Tik op <b>Voeg toetsenbord toe…</b> en kies <b>Oekraïens</b>.', 'Wissel tijdens het typen met de <b>wereldbol 🌐</b> linksonder op het toetsenbord.'],
    },
  },
  android: {
    name: { en: 'Android', nl: 'Android' },
    steps: {
      en: ['Open <b>Settings</b> → <b>System</b> → <b>Keyboard</b> (or <b>Languages &amp; input</b>) → <b>On-screen keyboard</b> → <b>Gboard</b> → <b>Languages</b>.', 'Tap <b>Add keyboard</b> and choose <b>Ukrainian</b>.', 'While typing, switch with the <b>globe key 🌐</b>, or hold the space bar.', 'Samsung keyboard: <b>Settings</b> → <b>General management</b> → <b>Samsung Keyboard settings</b> → <b>Languages and types</b>; switch by swiping the space bar.'],
      nl: ['Open <b>Instellingen</b> → <b>Systeem</b> → <b>Toetsenbord</b> (of <b>Talen en invoer</b>) → <b>Schermtoetsenbord</b> → <b>Gboard</b> → <b>Talen</b>.', 'Tik op <b>Toetsenbord toevoegen</b> en kies <b>Oekraïens</b>.', 'Wissel tijdens het typen met de <b>wereldbol 🌐</b>, of houd de spatiebalk ingedrukt.', 'Samsung-toetsenbord: <b>Instellingen</b> → <b>Algemeen beheer</b> → <b>Instellingen Samsung-toetsenbord</b> → <b>Talen en typen</b>; wissel door over de spatiebalk te vegen.'],
    },
  },
  windows: {
    name: { en: 'Windows', nl: 'Windows' },
    steps: {
      en: ['Open <b>Settings</b> → <b>Time &amp; language</b> → <b>Language &amp; region</b>.', 'Choose <b>Add a language</b> and pick <b>Ukrainian</b>.', 'Switch with <b>Windows key + space</b>.'],
      nl: ['Open <b>Instellingen</b> → <b>Tijd en taal</b> → <b>Taal en regio</b>.', 'Kies <b>Een taal toevoegen</b> en neem <b>Oekraïens</b>.', 'Wissel met <b>Windows-toets + spatie</b>.'],
    },
  },
  mac: {
    name: { en: 'Mac', nl: 'Mac' },
    steps: {
      en: ['Open <b>System Settings</b> → <b>Keyboard</b> → <b>Text Input</b> → <b>Edit…</b>.', 'Click <b>+</b> and add <b>Ukrainian</b>: the plain one, not a variant such as “Legacy” or “QWERTY” (the keys sit elsewhere on those).', 'Switch with the <b>🌐 key</b> (or <b>Control + space</b>).'],
      nl: ['Open <b>Systeeminstellingen</b> → <b>Toetsenbord</b> → <b>Tekstinvoer</b> → <b>Wijzig…</b>.', 'Klik op <b>+</b> en voeg <b>Oekraïens</b> toe: de gewone, niet een variant met een toevoeging als “QWERTY” (daar zitten de toetsen anders).', 'Wissel met de <b>🌐-toets</b> (of <b>Control + spatie</b>).'],
    },
  },
};

const stepsHtml = d => `<ol class="kb-steps">${d.steps[state.nativeLanguage === 'nl' ? 'nl' : 'en'].map(x => `<li>${x}</li>`).join('')}</ol>`;
const nameOf = d => d.name[state.nativeLanguage === 'nl' ? 'nl' : 'en'];

function helpHtml() {
  const mine = device();
  const others = Object.keys(DEVICES).filter(k => k !== mine);
  const fold = k => `<details class="kb-other"><summary>${nameOf(DEVICES[k])}</summary>${stepsHtml(DEVICES[k])}</details>`;
  return `
    <p class="kb-lead">${L('Ukrainian answers are typed in Cyrillic letters. Your device has them built in: you only add the Ukrainian keyboard once.',
                           'Oekraïense antwoorden typ je met cyrillische letters. Die zitten al in je apparaat: je voegt het Oekraïense toetsenbord één keer toe.')}</p>
    ${mine ? `<div class="kb-mine"><div class="kb-mine-title">${nameOf(DEVICES[mine])}</div>${stepsHtml(DEVICES[mine])}</div>
              <div class="kb-others-label">${L('Another device', 'Een ander apparaat')}</div>` : ''}
    ${others.map(fold).join('')}
    <p class="kb-note">${L('Do not know the letters yet? You do not have to: the first units show every word and you copy it, letter by letter. The alphabet table lists all 33; the typing course lets you practise them a few at a time.',
                           'Ken je de letters nog niet? Dat hoeft niet: de eerste units laten elk woord zien en jij typt het na, letter voor letter. De alfabettabel toont ze alle 33; in de typcursus oefen je ze met een paar tegelijk.')}</p>
    <div class="kb-actions">
      <button class="kb-btn" id="kbAlphabet" type="button">🔤 ${L('Alphabet table', 'Alfabettabel')}</button>
      <button class="kb-btn" id="kbTyping" type="button">⌨️ ${L('Typing course', 'Typcursus')}</button>
      <button class="kb-btn kb-btn-primary" id="kbDone" type="button">${L('Got it', 'Begrepen')} →</button>
    </div>`;
}

export function openKeyboardHelp() {
  localStorage.setItem(SEEN_KEY, '1');
  openSheet({
    title: '⌨️ ' + L('The Ukrainian keyboard', 'Het Oekraïense toetsenbord'),
    html: helpHtml(),
    onOpen(root) {
      root.querySelector('#kbDone').addEventListener('click', closeSheet);
      root.querySelector('#kbAlphabet').addEventListener('click', () => { closeSheet(); window.closeSettingsDrawer(); window.openAlphabetScreen(); });
      root.querySelector('#kbTyping').addEventListener('click', () => { closeSheet(); window.closeSettingsDrawer(); window.openTypingScreen(); });
    },
  });
}

// Before the very first typed Ukrainian answer of someone who has never answered
// anything: open the help once. Whoever has answers on record got here without it.
// Returns true when the sheet was opened.
export function keyboardHelpFirstTime() {
  if (localStorage.getItem(SEEN_KEY)) return false;
  if (totalAnswers() > 0) { localStorage.setItem(SEEN_KEY, '1'); return false; }
  openKeyboardHelp();
  return true;
}

// The other way round: Cyrillic letters where an answer in the learner's own
// language is expected, typically right after a block of Ukrainian answers.
export function cyrillicTypedNote(answer, expected) {
  if (!/[\u0400-\u04FF]/.test(answer) || /[a-z]/i.test(answer) || /[\u0400-\u04FF]/.test(expected || '')) return null;
  return L('Those are Cyrillic letters. This answer is typed in English: switch your keyboard back and try again.',
           'Dat zijn cyrillische letters. Dit antwoord typ je in het Nederlands: zet je toetsenbord terug en probeer het opnieuw.');
}

// Latin letters where a Ukrainian answer is expected: not a wrong answer, a
// keyboard that is still set to another language. Returns a note, or null.
// The Latin a, c, e, i, o, p, x, y look exactly like Cyrillic letters, so a single
// stray one is named: the learner cannot see it.
export function latinTypedNote(answer, expected) {
  const latin = answer.match(/[a-z]/gi);
  if (!latin || /[a-z]/i.test(expected || '')) return null;
  if (!/[Ѐ-ӿ]/.test(answer)) {
    return L('Those are Latin letters. This answer is typed in Ukrainian: switch your keyboard to Ukrainian and try again.',
             'Dat zijn Latijnse letters. Dit antwoord typ je in het Oekraïens: zet je toetsenbord op Oekraïens en probeer het opnieuw.');
  }
  const which = [...new Set(latin.map(c => c.toLowerCase()))].join(', ');
  return L(`There is a Latin letter in your answer (${which}). It may look the same, but it is another letter: type the whole answer with the Ukrainian keyboard.`,
           `Er staat een Latijnse letter in je antwoord (${which}). Hij ziet er misschien hetzelfde uit, maar het is een andere letter: typ het hele antwoord met het Oekraïense toetsenbord.`);
}

// An answer typed on the wrong keyboard is not graded: the learner switches and
// tries again. Shows the reason in `note` and returns true when that is the case.
//   lang      what the answer should be typed in: 'uk', or the learner's own language
//   expected  the right answer (an answer that itself holds the other alphabet is let through)
export function wrongKeyboard({ answer, expected, lang, note, input }) {
  const uk = lang === 'uk';
  const text = uk ? latinTypedNote(answer, expected) : cyrillicTypedNote(answer, expected);
  if (!text) return false;
  if (uk) {
    note.innerHTML = `${escHtml(text)} <button class="ce-retry-link" type="button">⌨️ ${L('How?', 'Hoe?')}</button>`;
    note.querySelector('button').addEventListener('click', openKeyboardHelp);
  } else {
    note.textContent = text;
  }
  note.hidden = false;
  input.focus();
  input.select();
  return true;
}
