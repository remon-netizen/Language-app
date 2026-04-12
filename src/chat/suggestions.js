import { escHtml } from '../utils.js';

export function updateSuggestions(suggestions) {
  const list = document.getElementById('suggestionsList');
  list.innerHTML = '';
  suggestions.forEach(sug => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.innerHTML = `<div class="sug-uk">${escHtml(sug.uk)}</div><div class="sug-en">${escHtml(sug.en)}</div>`;
    div.onclick = () => useSuggestion(sug.uk);
    list.appendChild(div);
  });
}

export function useSuggestion(text) {
  document.getElementById('talkInput').value = text;
  document.getElementById('talkInput').focus();
  const input = document.getElementById('talkInput');
  input.style.borderColor = 'var(--blue)';
  input.style.background = 'var(--light-blue)';
  setTimeout(() => { input.style.background = ''; }, 600);
}
