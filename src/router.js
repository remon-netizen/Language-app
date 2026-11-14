import { state } from './state.js';

// ── Screens, and what "back" means ───────────────────────────────────────────
// Every view carries its own ← button, and that button knows where it leads: a
// card leaves its round for the page it was started from, a unit page returns
// to the menu, a menu returns Home. The phone's back gesture (and the browser's
// Back button) presses that same button. So the gesture and the arrow can never
// disagree, and a swipe steps back one level instead of dropping a round to Home.
// A sheet that lies over the screen (settings, word lookup, a help text) is
// closed first.
//
// To hear about the gesture the app keeps one extra history entry, the trap,
// for as long as there is somewhere to go back to: any screen but Home, or an
// open sheet. The gesture pops it; the handler takes the step back and lays
// the trap again if it is still needed.

let trapped = false;   // is the trap entry on top of the history?
let ignorePops = 0;    // popstate events caused by our own history.back()
const sheets = [];     // open sheets, the last one opened on top: their close functions

const activeScreen = () => document.querySelector('.screen.active');
const needTrap = () => sheets.length > 0 || activeScreen()?.id !== 'homeScreen';

function sync() {
  if (typeof history === 'undefined' || !history.pushState) return;
  if (needTrap() && !trapped) {
    history.pushState({ trap: true }, '');
    trapped = true;
  } else if (!needTrap() && trapped) {
    trapped = false;
    ignorePops++;
    history.back();
    // Should no popstate follow, do not swallow the next real one.
    setTimeout(() => { if (ignorePops > 0) ignorePops--; }, 500);
  }
}

// One step back: close the top sheet, or press the screen's own ← button.
function goBack() {
  if (sheets.length) { sheets[sheets.length - 1](); return; }
  const scr = activeScreen();
  if (!scr || scr.id === 'homeScreen') return;
  const btn = [...scr.querySelectorAll('.back-btn')].find(b => b.offsetParent !== null);
  if (btn) btn.click(); else showScreen('homeScreen');
}

if (typeof history !== 'undefined' && history.replaceState) {
  // The page always starts on Home: whatever entry it was loaded on is the base.
  history.replaceState({ base: true }, '');
  // Going back must not make the browser jump to an old scroll position.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('popstate', e => {
    if (ignorePops > 0) { ignorePops--; return; }
    if (e.state && e.state.trap) {
      // Forward into a trap entry left behind earlier: adopt it, or step out again.
      trapped = true;
      sync();
      return;
    }
    trapped = false;
    goBack();
    sync();
  });
}

function render(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0 });
  // Stop any ongoing speech synthesis when leaving the chat (not when entering it)
  if (id !== 'chatScreen') state.synth.cancel();
  // Stop lesson recording
  if (state.recognition) {
    try { state.recognition.stop(); } catch(e) {}
    state.recognition = null;
  }
  state.isRecording = false;
  const speakBtn = document.getElementById('speakBtn');
  if (speakBtn) { speakBtn.textContent = speakBtn.dataset.idleLabel || '🎙️ Speak'; speakBtn.classList.remove('recording'); }
  // Stop free chat recording
  if (state.freeRecognition) { state.freeRecognition.stop(); state.freeRecording = false; }
  const micBtn = document.getElementById('talkMicBtn');
  if (micBtn) { micBtn.textContent = '🎙️'; micBtn.classList.remove('recording'); }
  document.dispatchEvent(new CustomEvent('screenShown', { detail: { id } }));
}

export function showScreen(id) {
  render(id);
  sync();
}

// A sheet tells the router when it opens and closes, with the function that
// closes it: the back gesture then closes the sheet instead of leaving the screen.
export function sheetOpened(close) {
  if (!sheets.includes(close)) sheets.push(close);
  sync();
}
export function sheetClosed(close) {
  const i = sheets.indexOf(close);
  if (i !== -1) sheets.splice(i, 1);
  sync();
}
