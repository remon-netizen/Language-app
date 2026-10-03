#!/usr/bin/env node
// Validate course-path unit files (JSON, one unit each) against the shape in
// src/data/path/index.js, within a unit and across units.
//   node tools/path/validate.mjs <dir-with-unit-json> [--syllabus syllabus.json] [--json]
// Exit code 1 when any unit has errors. Warnings do not fail.

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const filePath = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;
const dir = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--file' && args[i - 1] !== '--syllabus');
const sylPath = args.includes('--syllabus') ? args[args.indexOf('--syllabus') + 1] : null;
const asJson = args.includes('--json');
if (!dir && !filePath) { console.error('usage: validate.mjs <dir> [--syllabus file] [--json]  |  validate.mjs --file unit.json'); process.exit(2); }

const POS = new Set(['n', 'v', 'adj', 'adv', 'pron', 'prep', 'conj', 'part', 'num', 'expr']);
const GENDERS = new Set(['m', 'f', 'n', 'pl']);
const CYR = /[Ѐ-ӿ]/;
const LATIN = /[A-Za-z]/;
const isText = (o, k) => o && typeof o[k] === 'string' && o[k].trim().length > 0;
const both = (o, name, errs, min = 1) => {
  if (!o || typeof o !== 'object') { errs.push(`${name}: missing { en, nl }`); return; }
  for (const k of ['en', 'nl']) {
    if (!isText(o, k)) errs.push(`${name}.${k}: missing`);
    else if (o[k].trim().length < min) errs.push(`${name}.${k}: too short (${o[k].trim().length} < ${min})`);
  }
};

export function validateUnit(u) {
  const errs = [], warns = [];
  if (!u || typeof u !== 'object') return { errs: ['not an object'], warns };
  if (!/^(a1|a2|b1|b2)-\d{2}$/.test(u.id || '')) errs.push(`id: "${u.id}" must look like a1-04`);
  else if (u.level !== u.id.slice(0, 2).toUpperCase()) errs.push(`level: "${u.level}" does not match id ${u.id}`);
  if (!isText(u, 'icon')) errs.push('icon: missing');
  both(u.title, 'title', errs);
  both(u.grammar, 'grammar', errs);
  both(u.explain, 'explain', errs, 400);
  if (u.explain) for (const k of ['en', 'nl']) {
    const t = u.explain[k] || '';
    const examples = (t.match(/^> .+ — .+$/gm) || []).length;
    if (examples < 3) errs.push(`explain.${k}: only ${examples} example lines of the form "> uk — gloss" (need 3+)`);
    if (/^\s*\|/m.test(t)) warns.push(`explain.${k}: markdown tables are not rendered; use bullets or example lines`);
    if (t.length > 3500) warns.push(`explain.${k}: long (${t.length} chars); aim for 800–2500`);
  }
  // words
  if (!Array.isArray(u.words)) errs.push('words: missing array');
  else {
    if (u.words.length < 10 || u.words.length > 18) errs.push(`words: ${u.words.length} entries (need 10–18)`);
    const seen = new Set();
    u.words.forEach((w, i) => {
      const at = `words[${i}]`;
      if (!Array.isArray(w) || w.length !== 5) { errs.push(`${at}: must be [uk, en, nl, pos, extra]`); return; }
      const [uk, en, nl, pos, extra] = w;
      if (typeof uk !== 'string' || !CYR.test(uk)) errs.push(`${at}: uk "${uk}" is not Ukrainian`);
      if (LATIN.test(uk || '')) errs.push(`${at}: uk "${uk}" contains Latin letters`);
      if (typeof en !== 'string' || !en.trim()) errs.push(`${at}: en missing`);
      if (typeof nl !== 'string' || !nl.trim()) errs.push(`${at}: nl missing`);
      if (!POS.has(pos)) errs.push(`${at}: pos "${pos}" not one of ${[...POS].join(',')}`);
      if (pos === 'n' && !GENDERS.has(extra)) errs.push(`${at}: noun "${uk}" needs gender m/f/n/pl, got "${extra}"`);
      if (pos === 'v' && typeof extra !== 'string') errs.push(`${at}: verb "${uk}" extra must be the perfective or ''`);
      if (pos === 'v' && extra && !CYR.test(extra)) errs.push(`${at}: perfective "${extra}" is not Ukrainian`);
      if (pos !== 'n' && pos !== 'v' && extra !== '') warns.push(`${at}: extra "${extra}" ignored for pos ${pos}`);
      if (seen.has(uk)) errs.push(`${at}: "${uk}" listed twice in this unit`);
      seen.add(uk);
    });
  }
  // sentences
  if (!Array.isArray(u.sentences)) errs.push('sentences: missing array');
  else {
    if (u.sentences.length < 6 || u.sentences.length > 12) errs.push(`sentences: ${u.sentences.length} (need 6–12)`);
    u.sentences.forEach((s, i) => {
      const at = `sentences[${i}]`;
      if (!isText(s, 'uk') || !CYR.test(s.uk)) errs.push(`${at}: uk missing or not Ukrainian`);
      if (LATIN.test(s.uk || '')) warns.push(`${at}: uk contains Latin letters: "${s.uk}"`);
      if (!isText(s, 'en')) errs.push(`${at}: en missing`);
      if (!isText(s, 'nl')) errs.push(`${at}: nl missing`);
      if (!Array.isArray(s.hint) || !s.hint.length || !s.hint.every(h => typeof h === 'string' && h.trim())) errs.push(`${at}: hint must be a non-empty array of dictionary forms`);
      both(s.note, `${at}.note`, errs);
      if (s.uk && s.uk.split(/\s+/).length > 14) warns.push(`${at}: long sentence (${s.uk.split(/\s+/).length} words)`);
    });
  }
  // exercises
  if (!Array.isArray(u.exercises)) errs.push('exercises: missing array');
  else {
    if (u.exercises.length < 5 || u.exercises.length > 12) errs.push(`exercises: ${u.exercises.length} (need 5–12)`);
    u.exercises.forEach((x, i) => {
      const at = `exercises[${i}]`;
      if (!isText(x, 'uk')) { errs.push(`${at}: uk missing`); return; }
      if ((x.uk.match(/___/g) || []).length !== 1) errs.push(`${at}: uk must contain exactly one "___"`);
      if (!isText(x, 'en')) errs.push(`${at}: en missing`);
      if (!isText(x, 'nl')) errs.push(`${at}: nl missing`);
      if (x.note) both(x.note, `${at}.note`, errs);
      if (x.type === 'gap') {
        if (!isText(x, 'answer') || !CYR.test(x.answer)) errs.push(`${at}: gap answer missing or not Ukrainian`);
      } else if (x.type === 'choose') {
        if (!Array.isArray(x.options) || x.options.length < 3 || x.options.length > 4) errs.push(`${at}: choose needs 3–4 options`);
        else {
          if (new Set(x.options).size !== x.options.length) errs.push(`${at}: options repeat`);
          if (!Number.isInteger(x.correct) || x.correct < 0 || x.correct >= x.options.length) errs.push(`${at}: correct must index options`);
          if (!x.options.every(o => typeof o === 'string' && CYR.test(o))) errs.push(`${at}: every option must be Ukrainian`);
        }
      } else errs.push(`${at}: type "${x.type}" must be gap or choose`);
    });
    const kinds = new Set(u.exercises.map(x => x.type));
    if (kinds.size < 2) warns.push('exercises: only one kind; mix gap and choose');
  }
  return { errs, warns };
}

export function validateDir(dir, syllabus = null) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  const report = { units: {}, cross: [], ok: true };
  const units = [];
  for (const f of files) {
    let u;
    try { u = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
    catch (e) { report.units[f] = { errs: [`invalid JSON: ${e.message}`], warns: [] }; report.ok = false; continue; }
    const r = validateUnit(u);
    report.units[f] = r;
    if (r.errs.length) report.ok = false;
    if (u.id && f !== `${u.id}.json`) { r.errs.push(`file name ${f} does not match id ${u.id}`); report.ok = false; }
    units.push(u);
  }
  // across units
  const ids = new Map(), words = new Map(), sents = new Map();
  for (const u of units) {
    if (ids.has(u.id)) report.cross.push(`duplicate unit id ${u.id}`);
    ids.set(u.id, true);
    for (const w of u.words || []) {
      if (!Array.isArray(w)) continue;
      if (words.has(w[0])) report.cross.push(`word "${w[0]}" is in ${words.get(w[0])} and ${u.id}; a word belongs to one unit`);
      else words.set(w[0], u.id);
    }
    for (const s of u.sentences || []) {
      if (s?.uk && sents.has(s.uk)) report.cross.push(`sentence "${s.uk}" is in ${sents.get(s.uk)} and ${u.id}`);
      else if (s?.uk) sents.set(s.uk, u.id);
    }
  }
  if (syllabus) {
    const wanted = syllabus.units.map(s => s.id);
    const missing = wanted.filter(id => !ids.has(id));
    const extra = [...ids.keys()].filter(id => !wanted.includes(id));
    if (missing.length) report.cross.push(`missing units: ${missing.join(', ')}`);
    if (extra.length) report.cross.push(`units not in the syllabus: ${extra.join(', ')}`);
  }
  if (report.cross.length) report.ok = false;
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname && filePath) {
  // One unit on its own: the checks within a unit, not the cross-unit ones.
  let r;
  try { r = validateUnit(JSON.parse(fs.readFileSync(filePath, 'utf8'))); }
  catch (e) { r = { errs: [`invalid JSON: ${e.message}`], warns: [] }; }
  r.errs.forEach(e => console.log(`ERROR ${e}`));
  r.warns.forEach(w => console.log(`warn  ${w}`));
  console.log(r.errs.length ? `FAIL (${r.errs.length} errors)` : 'OK');
  process.exit(r.errs.length ? 1 : 0);
}
if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const syllabus = sylPath ? JSON.parse(fs.readFileSync(sylPath, 'utf8')) : null;
  const report = validateDir(dir, syllabus);
  if (asJson) console.log(JSON.stringify(report, null, 2));
  else {
    for (const [f, r] of Object.entries(report.units)) {
      if (r.errs.length || r.warns.length) console.log(`\n${f}`);
      r.errs.forEach(e => console.log(`  ERROR ${e}`));
      r.warns.forEach(w => console.log(`  warn  ${w}`));
    }
    report.cross.forEach(c => console.log(`CROSS ${c}`));
    const n = Object.keys(report.units).length, bad = Object.values(report.units).filter(r => r.errs.length).length;
    console.log(`\n${n} units, ${bad} with errors, ${report.cross.length} cross-unit problems → ${report.ok ? 'OK' : 'FAIL'}`);
  }
  process.exit(report.ok ? 0 : 1);
}
