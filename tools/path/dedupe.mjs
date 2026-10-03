#!/usr/bin/env node
// A word is taught in one unit only. Walk the units in syllabus order and drop
// from a later unit any word an earlier unit already teaches (the learner has it
// by then). Reports units that end up short, and repeated sentences.
//   node tools/path/dedupe.mjs <dir-with-unit-json> --syllabus syllabus.json [--write]
// Without --write it only reports.

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const dir = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--syllabus');
const sylPath = args.includes('--syllabus') ? args[args.indexOf('--syllabus') + 1] : null;
const write = args.includes('--write');
if (!dir || !sylPath) { console.error('usage: dedupe.mjs <dir> --syllabus syllabus.json [--write]'); process.exit(2); }

const FLOOR = 12;
const order = JSON.parse(fs.readFileSync(sylPath, 'utf8')).units.map(u => u.id);
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
const units = files.map(f => ({ f, u: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }))
  .sort((a, b) => order.indexOf(a.u.id) - order.indexOf(b.u.id));

const seen = new Map(), sents = new Map();
let dropped = 0;
for (const { f, u } of units) {
  // A repeated word shares one schedule entry whichever unit teaches it, so
  // repeating is harmless; it is only dropped to make room for new words, and
  // never below FLOOR words (the work units revisit their vocabulary on purpose).
  const keep = [], gone = [];
  let room = Math.max(0, u.words.length - FLOOR);
  for (const w of u.words) {
    if (seen.has(w[0]) && room > 0) { gone.push(`${w[0]} (${seen.get(w[0])})`); room--; }
    else { if (!seen.has(w[0])) seen.set(w[0], u.id); keep.push(w); }
  }
  if (gone.length) {
    dropped += gone.length;
    const flag = '     ';
    console.log(`${flag} ${u.id}: drop ${gone.length} → ${keep.length} words left · ${gone.join(', ')}`);
    if (write) { u.words = keep; fs.writeFileSync(path.join(dir, f), JSON.stringify(u, null, 2) + '\n'); }
  }
  for (const s of u.sentences) {
    if (sents.has(s.uk)) console.log(`      ${u.id}: sentence also in ${sents.get(s.uk)}: "${s.uk}"`);
    else sents.set(s.uk, u.id);
  }
}
console.log(`\n${dropped} duplicate words ${write ? 'dropped' : 'found (run with --write to drop them)'} over ${units.length} units; ${seen.size} distinct words taught`);
