import { escHtml, calcSimilarity } from '../utils.js';
import { speakText, speakTextCb, speakSlow } from '../voice.js';
import { state, getTutorName, getTTSLang } from '../state.js';
import { setupRecognition } from '../speech.js';
import { openWordLookup } from '../words.js';
import { aiErrorText } from '../api/model.js';

// Interface text in the learner's own language.
const L = (en, nl) => (state.nativeLanguage === 'nl' ? nl : en);
const practiseLabel = () => '🎙️ ' + L('Practise saying it', 'Uitspraak oefenen');

function wrapWordsInSpans(rawText) {
  const parts = rawText.split(/([\p{L}'ʼ]+)/gu);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      const esc = escHtml(part);
      return `<span class="word-tap" data-word="${esc}">${esc}</span>`;
    }
    return escHtml(part);
  }).join('');
}

// spoken: the message came from the microphone (its "again" button listens again;
// for a typed one it puts the text back in the field).
export function addUserMessage(text, { spoken = false } = {}) {
  const chatArea = document.getElementById('chatArea');
  const div = document.createElement('div');
  div.className = 'chat-msg user';
  const hasCyrillic = /[\u0400-\u04FF]/.test(text);
  div.innerHTML = `
    <div class="msg-label">${L('You', 'Jij')}</div>
    <div class="msg-bubble">${escHtml(text)}</div>
    <div class="user-msg-actions">
      ${hasCyrillic ? `<button class="user-pronounce-btn pronounce-btn" data-text="${escHtml(text)}">${practiseLabel()}</button>` : ''}
      <button class="redo-btn" title="${spoken ? L('Mic got it wrong? Try again', 'Verstond de microfoon je verkeerd? Probeer het opnieuw') : L('Take this message back and change it', 'Haal dit bericht terug en pas het aan')}">🔄 ${L('Redo', 'Opnieuw')}</button>
    </div>`;

  if (hasCyrillic) {
    div.querySelector('.user-pronounce-btn').addEventListener('click', function() {
      practicePronunciation(this);
    });
  }

  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
  return div; // caller attaches redo handler
}

export function addBotMessage(ukText, enText) {
  const chatArea = document.getElementById('chatArea');
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.innerHTML = `
    <div class="msg-label">${getTutorName()}</div>
    <div class="msg-bubble">
      <span class="bot-text">${wrapWordsInSpans(ukText)}</span>
      ${enText ? `<div class="msg-translation">${escHtml(enText)}</div>` : ''}
    </div>
    <div class="bot-msg-actions">
      <button class="pronounce-btn" data-text="${escHtml(ukText)}">${practiseLabel()}</button>
      <button class="slow-btn">🐢 ${L('Slow', 'Langzaam')}</button>
    </div>`;

  div.querySelector('.pronounce-btn').addEventListener('click', function() {
    practicePronunciation(this);
  });

  div.querySelector('.slow-btn').addEventListener('click', () => {
    speakSlow(ukText, getTTSLang());
  });

  div.querySelectorAll('.word-tap').forEach(span => {
    span.addEventListener('click', () => openWordLookup(span.dataset.word));
  });

  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
  setTimeout(() => speakText(ukText, getTTSLang()), 200);
}

export function practicePronunciation(btn) {
  const text = btn.dataset.text;

  // Remove existing panel if present
  const existing = btn.nextElementSibling;
  if (existing && existing.classList.contains('pronounce-panel')) {
    existing.remove();
    btn.classList.remove('pronounce-active');
    btn.textContent = practiseLabel();
    return;
  }

  btn.classList.add('pronounce-active');
  btn.disabled = true;
  btn.textContent = '🔊 ' + L('Playing…', 'Speelt af…');

  // Create status panel
  const panel = document.createElement('div');
  panel.className = 'pronounce-panel';
  panel.innerHTML = `<div class="pronounce-status">🔊 ${L('Listen carefully…', 'Luister goed…')}</div>`;
  btn.parentNode.insertBefore(panel, btn.nextSibling);

  // Speak the phrase — start recording when TTS finishes
  speakTextCb(text, getTTSLang(), () => {
    btn.disabled = false;
    btn.textContent = '⏹ ' + L('Recording…', 'Opname loopt…');
    panel.innerHTML = `<div class="pronounce-status recording">🎙️ ${L('Say it now!', 'Zeg het nu!')}</div>`;

    const rec = setupRecognition(getTTSLang(), (event) => {
      const heard = event.results[0][0].transcript.trim();
      const score = calcSimilarity(text.toLowerCase().trim(), heard.toLowerCase());

      let cls, emoji, msg;
      if (score >= 85)      { cls = 'excellent'; emoji = '🎉'; msg = L('Excellent!', 'Uitstekend!'); }
      else if (score >= 60) { cls = 'good';      emoji = '👍'; msg = L('Good effort!', 'Goed bezig!'); }
      else if (score > 0)   { cls = 'try-again'; emoji = '🔄'; msg = L('Keep trying!', 'Blijf proberen!'); }
      else                  { cls = 'no-speech'; emoji = '🎙️'; msg = L('Nothing detected.', 'Niets gehoord.'); }

      panel.innerHTML = `
        <div class="pronounce-score ${cls}">${emoji} ${score > 0 ? score + '%' : ''} ${msg}</div>
        ${heard ? `<div class="pronounce-heard">${L('I heard', 'Ik hoorde')}: "${escHtml(heard)}"</div>` : ''}
        <button class="pronounce-retry-btn">🔄 ${L('Try again', 'Nog een keer')}</button>`;

      panel.querySelector('.pronounce-retry-btn').addEventListener('click', () => {
        panel.remove();
        btn.classList.remove('pronounce-active');
        btn.textContent = practiseLabel();
        practicePronunciation(btn);
      });

      btn.classList.remove('pronounce-active');
      btn.textContent = practiseLabel();
    }, () => {
      // Recording ended with no result
      btn.classList.remove('pronounce-active');
      btn.textContent = practiseLabel();
      if (panel.querySelector('.pronounce-status')) {
        panel.innerHTML = `<div class="pronounce-status">${L('Nothing detected.', 'Niets gehoord.')} <button class="pronounce-retry-btn">${L('Try again', 'Nog een keer')}</button></div>`;
        panel.querySelector('.pronounce-retry-btn').addEventListener('click', () => {
          panel.remove();
          btn.textContent = practiseLabel();
          practicePronunciation(btn);
        });
      }
    });

    // Not listening after all (no speech recognition here, or it would not start):
    // the button must not go on saying that it records.
    const notListening = () => { panel.remove(); btn.classList.remove('pronounce-active'); btn.textContent = practiseLabel(); };
    if (!rec) { notListening(); return; }
    try { rec.start(); } catch { notListening(); }
  });
}

export function addGrammarFeedback(fb, original) {
  const chatArea = document.getElementById('chatArea');
  const div = document.createElement('div');
  div.className = 'grammar-feedback';

  if (!fb.has_errors) {
    div.style.background = '#f0fdf4';
    div.style.borderColor = '#86efac';
    div.innerHTML = `
      <div class="grammar-header" style="color:#16a34a">✓ ${L('No spelling or grammar errors found', 'Geen spel- of grammaticafouten gevonden')}</div>
      <div class="explanation" style="color:#555;font-size:0.78rem">${escHtml(fb.explanation)}</div>`;
  } else {
    div.innerHTML = `
      <div class="grammar-header">⚠️ ${L('Grammar note', 'Grammatica')}</div>
      ${original ? `<div style="margin-bottom:4px;color:var(--gray);font-size:0.8rem">${L('You said', 'Jij zei')}: <em>${escHtml(original)}</em></div>` : ''}
      ${fb.corrected ? `<div style="margin-bottom:4px">${L('Better', 'Beter')}: <span class="corrected">${escHtml(fb.corrected)}</span></div>` : ''}
      ${fb.explanation ? `<div class="explanation">${escHtml(fb.explanation)}</div>` : ''}`;
  }

  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// err: the error itself, or its message.
export function addErrorMessage(err) {
  const chatArea = document.getElementById('chatArea');
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.innerHTML = `<div class="msg-bubble" style="background:#fee2e2;color:#b91c1c">⚠️ ${escHtml(aiErrorText(err))}</div>`;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

export function addSystemNotice(text) {
  const chatArea = document.getElementById('chatArea');
  const div = document.createElement('div');
  div.style.cssText = 'text-align:center;font-size:0.75rem;color:var(--gray);padding:6px 0;';
  div.textContent = text;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

export function showTypingIndicator() {
  const chatArea = document.getElementById('chatArea');
  const existing = document.getElementById('typingIndicator');
  if (existing) return;
  const div = document.createElement('div');
  div.id = 'typingIndicator';
  div.className = 'typing-indicator';
  div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

export function hideTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}
