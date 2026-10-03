#!/usr/bin/env node
// Run every Ukrainian string of the course-path units through LanguageTool
// (public API, uk-UA). One request per unit, paced for the free tier.
//   node tools/path/lt-check.mjs <dir-with-unit-json> [--out report.json] [--only a1-03,a1-04]
// Prints a summary; the report lists each match with the sentence it is in.
// Proper names and loanwords show up as spelling matches: those are for a
// human (or the reviewer agent) to judge, not automatic failures.

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const dir = args.find(a => !a.startsWith('--'));
const out = args.includes('--out') ? args[args.indexOf('--out') + 1] : null;
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
if (!dir) { console.error('usage: lt-check.mjs <dir> [--out report.json] [--only ids]'); process.exit(2); }

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Every Ukrainian sentence or word of a unit, each on its own line.
export function ukStrings(u) {
  const lines = [];
  for (const k of ['en', 'nl']) {
    for (const m of (u.explain?.[k] || '').matchAll(/^> (.+?)(?: — .*)?$/gm)) lines.push(m[1].replace(/\*\*|`/g, ''));
  }
  for (const w of u.words || []) lines.push(w[0]);
  for (const s of u.sentences || []) lines.push(s.uk);
  for (const x of u.exercises || []) {
    if (x.type === 'gap') lines.push(x.uk.replace('___', (x.answer || '').split(' / ')[0]));
    else if (x.type === 'choose' && x.options) lines.push(x.uk.replace('___', x.options[x.correct]));
  }
  return [...new Set(lines.map(l => l.trim()).filter(Boolean))];
}

async function check(text) {
  const res = await fetch('https://api.languagetool.org/v2/check', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ text, language: 'uk-UA', level: 'default' }),
  });
  if (res.status === 429) { await sleep(20000); return check(text); }
  if (!res.ok) throw new Error(`LanguageTool ${res.status}: ${await res.text()}`);
  return (await res.json()).matches || [];
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
const report = {};
let total = 0;
for (const f of files) {
  const u = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  if (only && !only.includes(u.id)) continue;
  const lines = ukStrings(u);
  const text = lines.join('\n');
  const matches = await check(text);
  // Strings are sent one per line; a match that spans a line break is the checker
  // reading two unrelated strings as one sentence, so it is dropped.
  const items = matches.map(m => {
    const before = text.slice(0, m.offset);
    const lineNo = (before.match(/\n/g) || []).length;
    return { rule: m.rule.id, category: m.rule.category?.id, message: m.message, bad: text.slice(m.offset, m.offset + m.length),
             suggestions: m.replacements.slice(0, 3).map(r => r.value), line: lines[lineNo] };
  }).filter(it => !it.bad.includes('\n'));
  report[u.id] = items;
  total += items.length;
  console.log(`${u.id}: ${lines.length} strings, ${items.length} matches`);
  for (const it of items) console.log(`    [${it.rule}] "${it.bad}" in "${it.line}" → ${it.suggestions.join(' / ') || '-'} · ${it.message}`);
  await sleep(3500);
}
if (out) fs.writeFileSync(out, JSON.stringify(report, null, 2));
console.log(`\n${total} matches over ${Object.keys(report).length} units`);
