// ── Daily activity log ────────────────────────────────────────────────────────
// One entry per calendar day the learner answered anything, with a count.
// Feeds the streak and the last-14-days strip on the Progress screen.
// Structure: { "2026-09-15": 42, ... }

const STORAGE_KEY = 'activityDays';
let data = null;

function load() {
  if (data) return data;
  try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { data = {}; }
  return data;
}

export function dayKey(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function markActivity(n = 1) {
  const d = load();
  const k = dayKey();
  d[k] = (d[k] || 0) + n;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

export function activityOn(date) { return load()[dayKey(date)] || 0; }

// Consecutive days ending today (or yesterday, so an evening session
// still shows the streak the next morning).
export function currentStreak() {
  const d = load();
  let streak = 0;
  const cur = new Date();
  if (!d[dayKey(cur)]) cur.setDate(cur.getDate() - 1);
  while (d[dayKey(cur)]) { streak++; cur.setDate(cur.getDate() - 1); }
  return streak;
}

export function lastDays(n = 14) {
  const out = [];
  const cur = new Date();
  cur.setDate(cur.getDate() - (n - 1));
  for (let i = 0; i < n; i++) { out.push({ key: dayKey(cur), count: load()[dayKey(cur)] || 0, date: new Date(cur) }); cur.setDate(cur.getDate() + 1); }
  return out;
}

export function totalAnswers() { return Object.values(load()).reduce((a, b) => a + b, 0); }
export function activeDays() { return Object.keys(load()).length; }
