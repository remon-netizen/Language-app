import { state } from './state.js';

// ── Screen switching with browser history ────────────────────────────────────
// Every screen change is mirrored into the browser history, so the phone's
// back gesture (and the browser Back button) moves between screens instead of
// leaving the app. We keep our own stack of screen ids alongside history so an
// in-app "←" that returns to a screen already in the stack walks history back
// to it rather than pushing a duplicate entry.

const stack = ['homeScreen'];
let ignoreNextPop = false;

if (typeof history !== 'undefined' && history.replaceState) {
  history.replaceState({ screen: 'homeScreen', depth: 0 }, '');
  window.addEventListener('popstate', e => {
    if (ignoreNextPop) { ignoreNextPop = false; return; }
    const depth = Number.isInteger(e.state?.depth) ? e.state.depth : 0;
    const id = e.state?.screen || 'homeScreen';
    stack.length = Math.min(stack.length, depth + 1);
    stack[depth] = id;
    if (document.getElementById(id)) render(id);
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
  const top = stack[stack.length - 1];
  if (id === top) return;
  const idx = stack.lastIndexOf(id);
  if (idx !== -1) {
    // Going back to a screen we came from: unwind history to it.
    const steps = idx - (stack.length - 1);
    stack.length = idx + 1;
    ignoreNextPop = true;
    history.go(steps);
    // If no popstate arrives (history shorter than our stack), don't swallow the next real one.
    setTimeout(() => { ignoreNextPop = false; }, 400);
  } else {
    stack.push(id);
    history.pushState({ screen: id, depth: stack.length - 1 }, '');
  }
}

export function currentScreen() { return stack[stack.length - 1]; }
