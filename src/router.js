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
let ownBack = 0;       // serial of our own history.back() whose popstate has not come yet (0: none)
let backSerial = 0;
const sheets = [];     // open sheets, the last one opened on top: their close functions

const activeScreen = () => document.querySelector('.screen.active');
const needTrap = () => sheets.length > 0 || activeScreen()?.id !== 'homeScreen';

function sync() {
  if (typeof history === 'undefined' || !history.pushState) return;
  // One of our own steps back is still under way. An entry pushed now would end
  // up behind it: the browser finishes the step back after the push, leaving the
  // app on the base entry while it believes the trap is in place, and the next
  // return to Home would then step out of the app. So wait: the popstate handler
  // calls sync() again when the step has landed. (This happens whenever a sheet on
  // Home is closed by an action that opens a screen: the keyboard help's
  // "Alphabet" button, an entry of the weak-spots list.)
  if (ownBack) return;
  if (needTrap() && !trapped) {
    history.pushState({ trap: true }, '');
    trapped = true;
  } else if (!needTrap() && trapped) {
    trapped = false;
    // The popstate this causes is ours, not the learner's.
    const id = ownBack = ++backSerial;
    history.back();
    // Should no popstate follow, stop waiting for it (and for this call only).
    setTimeout(() => { if (ownBack === id) { ownBack = 0; sync(); } }, 2000);
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
    // Our own step back has landed: now the history can be brought in line with
    // whatever the app has moved on to in the meantime.
    if (ownBack) { ownBack = 0; sync(); return; }
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
  // The app's own header shows on Home only; a screen has a header of its own (base.css).
  document.body.classList.toggle('on-home', id === 'homeScreen');
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
