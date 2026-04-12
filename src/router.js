import { state } from './state.js';

export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  // Stop any ongoing speech synthesis when leaving the chat (not when entering it)
  if (id !== 'chatScreen') state.synth.cancel();
  // Stop lesson recording
  if (state.recognition) {
    try { state.recognition.stop(); } catch(e) {}
    state.recognition = null;
  }
  state.isRecording = false;
  const speakBtn = document.getElementById('speakBtn');
  if (speakBtn) { speakBtn.textContent = '🎙️ Speak'; speakBtn.classList.remove('recording'); }
  // Stop free chat recording
  if (state.freeRecognition) { state.freeRecognition.stop(); state.freeRecording = false; }
  const micBtn = document.getElementById('talkMicBtn');
  if (micBtn) { micBtn.textContent = '🎙️'; micBtn.classList.remove('recording'); }
}
