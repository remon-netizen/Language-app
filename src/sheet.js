// ── Sheet: a text panel that slides up over the current screen ───────────────
// For help and explanations that should not cost the learner their place: the
// screen underneath (a card in the middle of a round, say) stays as it is.
// One sheet at a time. The back gesture closes it (see router.js).

import { escHtml } from './utils.js';
import { sheetOpened, sheetClosed } from './router.js';

let el = null;

// title: plain text · html: the body · onOpen(root): wire up what is inside
export function openSheet({ title, html, onOpen }) {
  closeSheet();
  el = document.createElement('div');
  el.className = 'wl-overlay open info-sheet';
  el.innerHTML = `
    <div class="wl-card info-sheet-card" role="dialog" aria-modal="true">
      <div class="wl-header">
        <span class="info-sheet-title">${escHtml(title)}</span>
        <button class="wl-close" type="button" aria-label="✕">✕</button>
      </div>
      <div class="info-sheet-body">${html}</div>
    </div>`;
  el.addEventListener('click', e => { if (e.target === el) closeSheet(); });
  el.querySelector('.wl-close').addEventListener('click', closeSheet);
  document.body.appendChild(el);
  sheetOpened(closeSheet);
  if (onOpen) onOpen(el);
}

export function closeSheet() {
  if (!el) return;
  el.remove();
  el = null;
  sheetClosed(closeSheet);
}
