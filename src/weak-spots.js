// ── Weak spots: where they are, and the way to each ──────────────────────────
// Every course keeps count of what the learner gets wrong more often than right.
// Home adds the counts up; this is the list behind that number, one row per
// course with what a tap does there.

import { state } from './state.js';
import { escHtml } from './utils.js';
import { openSheet, closeSheet } from './sheet.js';
import { COURSE_ICON, courseName } from './course-names.js';
import { pathStats } from './data/path-progress.js';
import { weakVocab } from './data/vocab-progress.js';
import { getWeakVerbCount as weakVerbs } from './data/verb-weakness.js';
import { getWeakNounCount as weakNouns } from './data/case-weakness.js';
import { getWeakVerbCount as weakPrefixVerbs } from './data/prefix-weakness.js';
import { weakKeys as weakNumberKeys } from './data/numbers-weakness.js';
import { tracker as sentenceTracker } from './grammar/sentence-build-ui.js';
import { tracker as dialogueTracker } from './grammar/dialogue-ui.js';

const L = (en, nl) => (state.nativeLanguage === 'nl' ? nl : en);

// { id, count, sub, run }: what is weak in a course, and what a tap on its row does.
export function weakSpots() {
  if (state.currentLanguage !== 'uk') return [];
  const n = fn => { try { return fn(); } catch { return 0; } };
  const now = L('practise them now', 'oefen ze nu');
  const more = L('its drill asks them more often', 'de drill vraagt ze vaker');
  const focus = L('opens the drill with "focus on weak" on', 'opent de drill met "focus op zwakke" aan');
  return [
    { id: 'path',      count: n(() => pathStats().ownWeak),               sub: now,   run: () => window.startPathWeak() },
    { id: 'vocab',     count: n(() => weakVocab().length),                sub: now,   run: () => window.startVocabWeak() },
    { id: 'verbs',     count: n(weakVerbs),                               sub: focus, run: () => window.openVerbDrillScreen({ focusWeak: true }) },
    { id: 'cases',     count: n(weakNouns),                               sub: focus, run: () => window.openCaseDrillScreen({ focusWeak: true }) },
    { id: 'prefixes',  count: n(weakPrefixVerbs),                         sub: more,  run: () => window.openPrefixDrillScreen() },
    { id: 'numbers',   count: n(() => weakNumberKeys().length),           sub: more,  run: () => window.openNumbersDrillScreen() },
    { id: 'sentences', count: n(() => sentenceTracker.weakKeys().length), sub: more,  run: () => window.openSentenceBuildScreen() },
    { id: 'dialogues', count: n(() => dialogueTracker.weakKeys().length), sub: L('listen to them again', 'luister ze nog eens'), run: () => window.openDialogueScreen() },
  ].filter(x => x.count > 0);
}

export const weakSpotCount = () => weakSpots().reduce((sum, x) => sum + x.count, 0);

export function openWeakSpots() {
  const spots = weakSpots();
  openSheet({
    title: '🎯 ' + L('Weak spots', 'Zwakke plekken'),
    html: `
      <p class="ws-lead">${L('What you got wrong more often than right, per course.', 'Wat je vaker fout dan goed had, per cursus.')}</p>
      ${spots.map((x, i) => `
        <button class="ws-row" type="button" data-i="${i}">
          <span class="ws-icon">${COURSE_ICON[x.id]}</span>
          <span class="ws-text"><span class="ws-title">${escHtml(courseName(x.id))}</span><span class="ws-sub">${escHtml(x.sub)}</span></span>
          <span class="ws-count">${x.count}</span>
        </button>`).join('') || `<p class="ws-lead">${L('Nothing weak right now.', 'Op dit moment niets.')}</p>`}`,
    onOpen(root) {
      root.querySelectorAll('.ws-row').forEach(b => b.addEventListener('click', () => { closeSheet(); spots[Number(b.dataset.i)].run(); }));
    },
  });
}
