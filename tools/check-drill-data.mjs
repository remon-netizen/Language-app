#!/usr/bin/env node
// Checks the hand-written drill data: the case tables, the verb tables, the
// prefix verbs, the aspect sentences, the Sentence Builder and the dialogues.
//
//   node tools/check-drill-data.mjs            what can be checked without a network:
//                                              the data against itself
//   node tools/check-drill-data.mjs --spell    also sends every form and sentence to
//                                              LanguageTool (uk-UA): unknown word forms,
//                                              grammar. Words and sentences only.
//
// Exit code 1 when the data contradicts itself. What --spell reports is for a
// person to read: a spelling dictionary also flags good words (a radio call word,
// an abbreviation), and its style advice is advice.
//
// Why this exists: in November 2026 this found a sentence about a pen filed under
// "hand", three verb forms that are not words (відповіш, відповідьте, Вип'й) and
// plurals of nouns that have none (молоко, здоров'я).

import { NOUNS, CASES, CASE_SENTENCES, ADJECTIVE_NOUNS, PARALLEL_FORMS, nounForms, findNoun } from '../src/data/case-declensions.js';
import { CONJUGATIONS, verbForms } from '../src/data/verb-conjugations.js';
import { BASE_VERBS } from '../src/data/prefix-verbs.js';
import { VERB_PAIRS } from '../src/data/verb-aspects.js';
import { SENTENCES } from '../src/data/sentences-uk.js';
import { DIALOGUES } from '../src/data/dialogues-uk.js';

const low = s => String(s).toLowerCase();
// A gapped sentence with its answer filled in ("___ ." leaves a space before the full stop).
const filled = (gapped, answer) => gapped.replace('___', answer).replace(/\s+([.,!?])/g, '$1');
const errors = [];
const err = m => errors.push(m);

// ── The data against itself ──────────────────────────────────────────────────

// Cases: a sentence asks for a form the table has; a parallel form belongs to a real cell.
for (const s of CASE_SENTENCES) {
  const noun = findNoun(s.noun);
  if (!noun) { err(`case sentence "${s.full}": no noun "${s.noun}"`); continue; }
  const forms = nounForms(noun, s.targetCase, s.number).map(low);
  if (!forms.includes(low(s.answer))) err(`case sentence "${s.full}": answer "${s.answer}" is not a ${s.targetCase} ${s.number} of ${s.noun} (${forms.join(', ') || 'no such form'})`);
  if (low(filled(s.uk, s.answer)) !== low(s.full)) err(`case sentence "${s.full}": the gap filled in gives "${filled(s.uk, s.answer)}"`);
}
for (const [nomS, byNumber] of Object.entries(PARALLEL_FORMS)) {
  const noun = findNoun(nomS);
  if (!noun) { err(`PARALLEL_FORMS: no noun "${nomS}"`); continue; }
  for (const [number, byCase] of Object.entries(byNumber)) for (const [c, forms] of Object.entries(byCase)) {
    if (!CASES.includes(c) || !noun[number]?.[c]) err(`PARALLEL_FORMS ${nomS}: no cell ${c} ${number}`);
    for (const f of forms) if (f === noun[number]?.[c]) err(`PARALLEL_FORMS ${nomS} ${c} ${number}: "${f}" is the form in the table`);
  }
}
for (const e of ADJECTIVE_NOUNS) {
  const noun = findNoun(e.noun);
  if (!noun) { err(`adjective pair ${e.adjective} + ${e.noun}: the noun has no table`); continue; }
  for (const c of CASES) for (const [k, number] of [['s', 'singular'], ['p', 'plural']]) {
    const phrase = e.forms[c]?.[k];
    if (phrase && low(phrase.split(' ').pop()) !== low(noun[number]?.[c] || '')) err(`adjective pair "${phrase}": the noun is not the ${c} ${number} of ${e.noun} (${noun[number]?.[c]})`);
  }
}

// Verbs: every verb has its partner; a sentence's gap, filled in, is the full sentence.
const infinitives = new Set(CONJUGATIONS.map(v => v.infinitive));
for (const v of CONJUGATIONS) {
  if (!infinitives.has(v.partner)) err(`verb ${v.infinitive}: partner ${v.partner} has no table`);
  for (const s of v.sentences || []) {
    if (!v[s.tense]) err(`verb ${v.infinitive}: sentence "${s.full}" is in the ${s.tense}, which the verb does not have`);
    if (filled(s.uk, s.answer) !== s.full) err(`verb ${v.infinitive}: "${s.uk}" with "${s.answer}" is not "${s.full}"`);
    // The card names the tense and the person: the gap has to take that form of
    // this verb (or the first word of a two-word future, "будемо ___ йти").
    const cell = v[s.tense] || {};
    const person = cell[s.pronoun] !== undefined ? s.pronoun : 'він/вона';   // a sentence says він or вона
    const form = cell[person];
    if (form && !verbForms(v, s.tense, person, form).includes(low(s.answer)) && !form.startsWith(low(s.answer) + ' ')) err(`verb ${v.infinitive}: "${s.full}" asks for "${s.answer}", but the ${s.tense} for ${s.pronoun} is "${form}"`);
  }
}
for (const p of VERB_PAIRS) for (const s of p.sentences) {
  if (!low(s.uk).includes(low(s.verb))) err(`aspect sentence "${s.uk}": the verb form "${s.verb}" is not in it`);
}
for (const b of BASE_VERBS) for (const d of b.prefixed) {
  // The sentence has to use the verb it is filed under, not its reflexive or a look-alike.
  if (d.sentence && /с[яь]$/.test(low(d.sentence.answer)) !== /ся$/.test(d.verb)) err(`prefix verb ${d.verb}: the sentence asks for "${d.sentence.answer}", ${/ся$/.test(d.verb) ? 'which is not reflexive' : 'a reflexive form'}`);
  if (d.sentence && filled(d.sentence.uk, d.sentence.answer) !== d.sentence.full) err(`prefix verb ${d.verb}: "${d.sentence.uk}" with "${d.sentence.answer}" is not "${d.sentence.full}"`);
}
for (const d of DIALOGUES) for (const g of d.gaps) {
  if (!low(d.lines[g.line]?.uk || '').includes(low(g.word))) err(`dialogue ${d.id}: "${g.word}" is not in line ${g.line}`);
}

console.log(`${NOUNS.length} nouns, ${CONJUGATIONS.length} verbs, ${BASE_VERBS.reduce((n, b) => n + b.prefixed.length, 0)} prefixed verbs, ${CASE_SENTENCES.length + VERB_PAIRS.reduce((n, p) => n + p.sentences.length, 0) + SENTENCES.length} sentences`);
console.log(errors.length ? `${errors.length} contradiction(s):\n  ` + errors.join('\n  ') : 'The data agrees with itself.');

// ── LanguageTool ─────────────────────────────────────────────────────────────

if (process.argv.includes('--spell')) {
  const check = async text => {
    for (let tries = 0; tries < 6; tries++) {
      const r = await fetch('https://api.languagetool.org/v2/check', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ language: 'uk-UA', text }) });
      if (r.ok) { await new Promise(res => setTimeout(res, 3500)); return (await r.json()).matches || []; }
      await new Promise(res => setTimeout(res, 20000));   // the free service allows 20 requests a minute
    }
    return [];
  };

  // Single forms: is it a word at all?
  const forms = new Map();   // word → where it comes from
  const addForm = (f, where) => String(f).split(/\s+/).forEach(w => { if (!forms.has(w)) forms.set(w, where); });
  for (const n of NOUNS) for (const number of ['singular', 'plural']) for (const c of CASES) nounForms(n, c, number).forEach(f => addForm(f, `noun ${n.nom_s}`));
  for (const e of ADJECTIVE_NOUNS) for (const c of CASES) for (const k of ['s', 'p']) if (e.forms[c]?.[k]) addForm(e.forms[c][k], `${e.adjective} + ${e.noun}`);
  for (const v of CONJUGATIONS) for (const t of ['present', 'past', 'future', 'imperative']) for (const [p, f] of Object.entries(v[t] || {})) verbForms(v, t, p, f).forEach(x => addForm(x, `verb ${v.infinitive}`));
  for (const b of BASE_VERBS) for (const d of b.prefixed) addForm(d.verb, `prefix verb of ${b.base}`);
  const words = [...forms.keys()];
  const unknown = [];
  for (let i = 0; i < words.length; i += 300) {
    const text = words.slice(i, i + 300).join(' , ') + ' .';
    for (const m of await check(text)) if (/MORFOLOGIK|SPELL/.test(m.rule.id)) { const w = text.slice(m.offset, m.offset + m.length); unknown.push(`${w}  (${forms.get(w) || '?'})`); }
  }
  console.log(`\n${words.length} word forms; not in the dictionary: ${unknown.length ? '\n  ' + unknown.join('\n  ') : 'none'}`);

  // Whole sentences: grammar and spelling.
  const sents = [];
  VERB_PAIRS.forEach(p => p.sentences.forEach(s => sents.push([s.uk, `aspect ${p.imperfective}`])));
  SENTENCES.forEach(s => sents.push([s.uk, 'sentence builder']));
  DIALOGUES.forEach(d => d.lines.forEach(l => sents.push([l.uk, `dialogue ${d.id}`])));
  BASE_VERBS.forEach(b => b.prefixed.forEach(d => d.sentence && sents.push([d.sentence.full, `prefix ${d.verb}`])));
  CONJUGATIONS.forEach(v => (v.sentences || []).forEach(s => sents.push([s.full, `verb ${v.infinitive}`])));
  CASE_SENTENCES.forEach(s => sents.push([s.full, `case ${s.noun}`]));
  // Typography, and two points of style the course leaves as they are spoken.
  const SKIP = /^(UPPERCASE_SENTENCE_START|COMMA_PARENTHESIS_WHITESPACE|WHITESPACE_RULE|DASH_RULE|vocative_inanim|DAVAITE_VERB|EUPHONY_)/;
  let n = 0;
  for (let i = 0; i < sents.length; i += 80) {
    const batch = sents.slice(i, i + 80);
    const text = batch.map(s => s[0]).join('\n');
    for (const m of await check(text)) {
      if (SKIP.test(m.rule.id)) continue;
      let pos = 0, hit = null;
      for (const s of batch) { if (m.offset < pos + s[0].length + 1) { hit = s; break; } pos += s[0].length + 1; }
      n++;
      console.log(`  [${m.rule.id}] ${hit?.[1]}: "${hit?.[0]}" — «${text.slice(m.offset, m.offset + m.length)}» → ${m.replacements.slice(0, 3).map(x => x.value).join(' / ')}`);
    }
  }
  console.log(`${sents.length} sentences; ${n} remark(s) to read.`);
}

process.exit(errors.length ? 1 : 0);
