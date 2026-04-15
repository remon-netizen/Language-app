// Shared JSON extractor — used by gemini.js and grammar.js
export function extractJSON(text) {
  try { return JSON.parse(text); } catch(_) {}
  const stripped = text.replace(/^```(?:json)?\s*/im, '').replace(/```\s*$/m, '').trim();
  try { return JSON.parse(stripped); } catch(_) {}
  const m = text.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch(_) {} }
  return null;
}

export function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function levenshtein(a, b) {
  const dp = Array.from({length: a.length+1}, (_, i) =>
    Array.from({length: b.length+1}, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[a.length][b.length];
}

// Shuffle the options of a multiple_choice question in place and remap `correct`
// so it still points to the originally-correct option. No-op for other types or
// if options/correct are malformed. Uses Fisher-Yates.
export function shuffleMCQOptions(q) {
  if (!q || q.type !== 'multiple_choice') return q;
  const opts = q.options;
  if (!Array.isArray(opts) || opts.length < 2) return q;
  const origCorrect = q.correct;
  if (!Number.isInteger(origCorrect) || origCorrect < 0 || origCorrect >= opts.length) return q;

  // Pair each option with its original index, shuffle, then write back.
  const paired = opts.map((opt, i) => ({ opt, i }));
  for (let i = paired.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [paired[i], paired[j]] = [paired[j], paired[i]];
  }
  q.options = paired.map(p => p.opt);
  q.correct = paired.findIndex(p => p.i === origCorrect);
  return q;
}

export function calcSimilarity(target, heard) {
  if (!heard) return 0;
  // Strip punctuation, lowercase, collapse whitespace.
  const normalize = s => s.toLowerCase().replace(/[',.\?!;:\-—"«»""]/g, '').replace(/\s+/g, ' ').trim();
  const t = normalize(target), h = normalize(heard);
  if (t === h) return 100;

  // Character-level similarity (Levenshtein).
  const lev = levenshtein(t, h);
  const maxLen = Math.max(t.length, h.length);
  const charScore = maxLen ? ((maxLen - lev) / maxLen) * 100 : 0;

  const tw = t.split(/\s+/), hw = h.split(/\s+/);

  // For single-word targets (e.g. "березень"), word-matching is all-or-nothing
  // and unfairly harsh — "березні" shares the same root but scores 0% on words.
  // Use character similarity as the primary metric for short phrases.
  if (tw.length <= 2) {
    // Also check if the heard text starts with the same root (first 3+ chars).
    // If so, bump the score — the speaker clearly knew the word, just the
    // recognition returned a different grammatical form.
    const rootLen = Math.min(Math.floor(t.length * 0.6), t.length - 1);
    const sameRoot = rootLen >= 3 && h.startsWith(t.slice(0, rootLen));
    const rootBonus = sameRoot ? 15 : 0;
    return Math.min(100, Math.round(charScore + rootBonus));
  }

  // Multi-word phrases: blend word-matching with character similarity.
  let matched = 0;
  tw.forEach(w => { if (hw.includes(w)) matched++; });
  const wordScore = tw.length ? (matched / tw.length) * 100 : 0;
  return Math.round(wordScore * 0.5 + charScore * 0.5);
}
