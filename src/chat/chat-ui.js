import { escHtml, calcSimilarity } from '../utils.js';
import { speakText, speakTextCb, speakSlow } from '../voice.js';
import { getTutorName, getTTSLang } from '../state.js';
import { setupRecognition } from '../speech.js';
import { openWordLookup } from '../words.js';

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

export function addUserMessage(text) {
  const chatArea = document.getElementById('chatArea');
  const div = document.createElement('div');
  div.className = 'chat-msg user';
  const hasCyrillic = /[\u0400-\u04FF]/.test(text);
  div.innerHTML = `
    <div class="msg-label">You</div>
    <div class="msg-bubble">${escHtml(text)}</div>
    <div class="user-msg-actions">
      ${hasCyrillic ? `<button class="user-pronounce-btn pronounce-btn" data-text="${escHtml(text)}">🎙️ Practice</button>` : ''}
      <button class="redo-btn" title="Mic got it wrong? Try again">🔄 Redo</button>
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
      <button class="pronounce-btn" data-text="${escHtml(ukText)}">🎙️ Practice</button>
      <button class="slow-btn">🐢 Slow</button>
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
    btn.textContent = '🎙️ Practice pronunciation';
    return;
  }

  btn.classList.add('pronounce-active');
  btn.disabled = true;
  btn.textContent = '🔊 Playing...';

  // Create status panel
  const panel = document.createElement('div');
  panel.className = 'pronounce-panel';
  panel.innerHTML = '<div class="pronounce-status">🔊 Listen carefully...</div>';
  btn.parentNode.insertBefore(panel, btn.nextSibling);

  // Speak the phrase — start recording when TTS finishes
  speakTextCb(text, 'uk-UA', () => {
    btn.disabled = false;
    btn.textContent = '⏹ Recording...';
    panel.innerHTML = '<div class="pronounce-status recording">🎙️ Say it now!</div>';

    const rec = setupRecognition('uk-UA', (event) => {
      const heard = event.results[0][0].transcript.trim();
      const score = calcSimilarity(text.toLowerCase().trim(), heard.toLowerCase());

      let cls, emoji, msg;
      if (score >= 85)      { cls = 'excellent'; emoji = '🎉'; msg = 'Excellent!'; }
      else if (score >= 60) { cls = 'good';      emoji = '👍'; msg = 'Good effort!'; }
      else if (score > 0)   { cls = 'try-again'; emoji = '🔄'; msg = 'Keep trying!'; }
      else                  { cls = 'no-speech'; emoji = '🎙️'; msg = 'Nothing detected.'; }

      panel.innerHTML = `
        <div class="pronounce-score ${cls}">${emoji} ${score > 0 ? score + '%' : ''} ${msg}</div>
        ${heard ? `<div class="pronounce-heard">I heard: "${escHtml(heard)}"</div>` : ''}
        <button class="pronounce-retry-btn">🔄 Try again</button>`;

      panel.querySelector('.pronounce-retry-btn').addEventListener('click', () => {
        panel.remove();
        btn.classList.remove('pronounce-active');
        btn.textContent = '🎙️ Practice pronunciation';
        practicePronunciation(btn);
      });

      btn.classList.remove('pronounce-active');
      btn.textContent = '🎙️ Practice pronunciation';
    }, () => {
      // Recording ended with no result
      btn.classList.remove('pronounce-active');
      btn.textContent = '🎙️ Practice pronunciation';
      if (panel.querySelector('.pronounce-status')) {
        panel.innerHTML = '<div class="pronounce-status">Nothing detected. <button class="pronounce-retry-btn">Try again</button></div>';
        panel.querySelector('.pronounce-retry-btn').addEventListener('click', () => {
          panel.remove();
          btn.textContent = '🎙️ Practice pronunciation';
          practicePronunciation(btn);
        });
      }
    });

    if (rec) rec.start();
  });
}

export function addSpeechFeedback() {
  // Chrome doesn't provide real confidence scores for free-form speech,
  // so we just confirm the mic picked up the input — no fake percentage.
  const chatArea = document.getElementById('chatArea');
  const div = document.createElement('div');
  div.className = 'speech-feedback';
  div.innerHTML = `<span class="sf-emoji">🎙️</span><span class="sf-label neutral">Mic input received</span>`;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

export function addGrammarFeedback(fb, original) {
  const chatArea = document.getElementById('chatArea');
  const div = document.createElement('div');
  div.className = 'grammar-feedback';

  if (!fb.has_errors) {
    div.style.background = '#f0fdf4';
    div.style.borderColor = '#86efac';
    div.innerHTML = `
      <div class="grammar-header" style="color:#16a34a">✓ No spelling/grammar rule errors</div>
      <div class="explanation" style="color:#555;font-size:0.78rem">${escHtml(fb.explanation)}</div>`;
  } else {
    div.innerHTML = `
      <div class="grammar-header">⚠️ Grammar note</div>
      ${original ? `<div style="margin-bottom:4px;color:var(--gray);font-size:0.8rem">You said: <em>${escHtml(original)}</em></div>` : ''}
      ${fb.corrected ? `<div style="margin-bottom:4px">Better: <span class="corrected">${escHtml(fb.corrected)}</span></div>` : ''}
      ${fb.explanation ? `<div class="explanation">${escHtml(fb.explanation)}</div>` : ''}`;
  }

  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

export function addErrorMessage(msg) {
  const chatArea = document.getElementById('chatArea');
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.innerHTML = `<div class="msg-bubble" style="background:#fee2e2;color:#dc2626">
    ⚠️ ${msg.includes('401') ? 'Invalid API key. Please check your Anthropic API key above.' :
         msg.includes('429') ? 'Rate limit reached. Please wait a moment and try again.' :
         msg.includes('Failed to fetch') ? 'Network error. Check your internet connection.' :
         'Error: ' + escHtml(msg)}
  </div>`;
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
