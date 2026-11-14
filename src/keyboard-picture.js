// ── A picture of the Ukrainian keyboard ───────────────────────────────────────
// For whoever types on a keyboard with Latin letters printed on it: where each
// Ukrainian letter is, with the key to press next lit up. The typing course is
// built around it; every other round offers it under a Ukrainian answer field,
// lit up while a new word is being copied and as plain reference when the
// answer has to come from memory.
//
// The three letter rows are the standard Ukrainian layout, the same on Windows,
// Linux and macOS (data/typing.js). ґ and the apostrophe sit somewhere else on
// every system, so those two are said in words.

import { state } from './state.js';
import { escHtml } from './utils.js';
import { KEY_ROWS } from './data/typing.js';
import { totalAnswers } from './data/activity.js';

const L = (en, nl) => (state.nativeLanguage === 'nl' ? nl : en);

export const isMac = /Mac/.test(navigator.platform || '') || /Macintosh/.test(navigator.userAgent);
// A phone or tablet: its on-screen keyboard shows the letters, a physical one does not.
export const isTouch = () => window.matchMedia('(hover: none), (pointer: coarse)').matches;

const LATIN = Object.fromEntries(KEY_ROWS.flat());   // { й: 'Q', … }

// Which keys to light for a character, and how to say it in words.
export function whereIs(ch) {
  const low = ch.toLowerCase(), upper = ch !== low;
  const key = k => L(`the ${k} key`, `toets ${k}`);
  if (ch === ' ') return { keys: [' '], text: L('space bar', 'spatiebalk') };
  if (low === 'ґ') return { keys: upper ? ['shift', 'г'] : ['г'], text: `${ch} = ${upper ? 'Shift + ' : ''}${isMac ? 'Option' : L('right Alt', 'rechter Alt')} + г` };
  if (ch === "'" || ch === '’' || ch === 'ʼ') return { keys: [], text: isMac ? L('apostrophe = the \\ key', 'apostrof = de \\-toets') : L('apostrophe = the key left of the 1', 'apostrof = de toets links van de 1') };
  if (ch === ',') return { keys: ['shift', '.'], text: `, = Shift + ${key('/')}` };
  if (ch === '?') return { keys: ['shift'], text: '? = Shift + 7' };
  if (ch === '!') return { keys: ['shift'], text: '! = Shift + 1' };
  if (LATIN[low]) return { keys: upper ? ['shift', low] : [low], text: `${ch} = ${upper ? 'Shift + ' : ''}${key(LATIN[low])}` };
  return { keys: [], text: '' };
}

function pictureHtml() {
  const key = ([ch, latin]) => `<span class="ty-key" data-k="${escHtml(ch)}"><b>${escHtml(ch)}</b><i>${escHtml(latin)}</i></span>`;
  return `
    <div class="ty-kb" aria-hidden="true">
      <div class="ty-kb-row">${KEY_ROWS[0].map(key).join('')}</div>
      <div class="ty-kb-row ty-kb-r2">${KEY_ROWS[1].map(key).join('')}</div>
      <div class="ty-kb-row ty-kb-r3"><span class="ty-key ty-key-shift" data-k="shift"><b>⇧</b></span>${KEY_ROWS[2].map(key).join('')}</div>
      <div class="ty-kb-row"><span class="ty-key ty-key-space" data-k=" "></span></div>
      <div class="ty-kb-cap"></div>
    </div>`;
}

// Puts the picture after `anchor`. Returns { point(ch), remove() }: light the key
// for ch (null for none).
export function keyboardPicture(anchor) {
  if (!anchor) return null;
  anchor.insertAdjacentHTML('afterend', pictureHtml());
  const kb = anchor.nextElementSibling, cap = kb.querySelector('.ty-kb-cap');
  const keys = [...kb.querySelectorAll('.ty-key')];
  return {
    point(ch) {
      keys.forEach(el => el.classList.remove('on'));
      if (ch == null) { cap.textContent = ''; return; }
      const w = whereIs(ch);
      w.keys.forEach(k => keys.find(el => el.dataset.k === k)?.classList.add('on'));
      cap.textContent = w.text;
    },
    remove() { kb.remove(); },
  };
}

// ── Under an answer field, outside the typing course ─────────────────────────
// Whether the picture shows there is the learner's choice ('kbAid'). Before they
// have chosen: on for someone who has never answered anything and sits at a
// physical keyboard (they cannot know where the letters are), off for everyone
// who has been typing answers all along.
const AID_KEY = 'kbAid';
function aidOn() {
  let v = localStorage.getItem(AID_KEY);
  if (v === null) { v = !isTouch() && totalAnswers() === 0 ? '1' : '0'; localStorage.setItem(AID_KEY, v); }
  return v === '1';
}

// text: the answer, when it is on the card anyway (a new word being copied): the
// next key is lit. Without it the picture is reference only.
// under: the element the picture goes below. That is the retry note, which sits
// under the answer field and its Check button: what the note says ("those are
// Latin letters") then stays next to the field, not below the keyboard.
export function keyboardAid({ root, input, text = null, under = root.querySelector('.ce-retry-note') }) {
  if (!under || isTouch()) return;
  const chars = text ? [...text] : null;
  let pic = null;
  const point = () => { if (!pic) return; const n = [...input.value].length; pic.point(chars && n < chars.length ? chars[n] : null); };
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ty-kb-toggle';
  const render = () => {
    const on = aidOn();
    btn.textContent = '⌨️ ' + (on ? L('Hide the keyboard', 'Verberg het toetsenbord') : L('Where are the letters?', 'Waar zitten de letters?'));
    if (on && !pic) { pic = keyboardPicture(under); point(); }
    if (!on && pic) { pic.remove(); pic = null; }
  };
  btn.addEventListener('click', () => { localStorage.setItem(AID_KEY, aidOn() ? '0' : '1'); render(); input.focus(); });
  input.addEventListener('input', point);
  under.insertAdjacentElement('afterend', btn);
  render();
}
