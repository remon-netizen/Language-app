// ── Toast: one short message at the bottom of the screen ─────────────────────
// For things the learner should know but that must not stop them. It goes away
// by itself; an optional button does one thing.

let el = null, timer = null;

export function showToast(text, { action, onAction, ms = 8000 } = {}) {
  hideToast();
  el = document.createElement('div');
  el.className = 'app-toast';
  el.setAttribute('role', 'status');
  const span = document.createElement('span');
  span.textContent = text;
  el.appendChild(span);
  if (action) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = action;
    btn.addEventListener('click', () => { hideToast(); if (onAction) onAction(); });
    el.appendChild(btn);
  }
  document.body.appendChild(el);
  timer = setTimeout(hideToast, ms);
}

export function hideToast() {
  if (timer) { clearTimeout(timer); timer = null; }
  if (el) { el.remove(); el = null; }
}
