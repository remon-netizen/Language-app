import { state } from './state.js';
import { escHtml } from './utils.js';
import { getLessonsForTarget, getLessonName } from './data/lesson-helpers.js';
import { getLearnedCount, getDuePhrases } from './review.js';
import { getWordsCount, getDueWords } from './words.js';
import { vocabStats } from './data/vocab-progress.js';
import { numbersStats } from './data/numbers-progress.js';
import { getAllMastery as verbMastery } from './data/verb-weakness.js';
import { getAllMastery as caseMastery } from './data/case-weakness.js';
import { getAllMastery as prefixMastery } from './data/prefix-weakness.js';
import { totalAttempts as numbersAttempts, weakKeys as numbersWeak } from './data/numbers-weakness.js';
import { tracker as sentenceTracker } from './grammar/sentence-build-ui.js';
import { tracker as dialogueTracker } from './grammar/dialogue-ui.js';
import { DIALOGUES } from './data/dialogues-uk.js';
import { currentStreak, lastDays, totalAnswers, activeDays } from './data/activity.js';

// ── One screen with every number the app keeps ───────────────────────────────

const L = (en, nl) => (state.nativeLanguage === 'nl' ? nl : en);

function sumMastery(m) {
  let attempts = 0, correct = 0, weak = 0, items = 0;
  for (const v of Object.values(m)) { attempts += v.attempts; correct += v.correct; items++; if (v.attempts && v.pct < 50) weak++; }
  return { attempts, correct, weak, items, pct: attempts ? Math.round(correct / attempts * 100) : 0 };
}

function bar(pct, cls = '') {
  return `<div class="pg-bar"><div class="pg-bar-fill ${cls}" style="width:${Math.max(0, Math.min(100, pct))}%"></div></div>`;
}

export function openProgressScreen() {
  window.showScreen('progressScreen');
  const s = document.getElementById('progressScreen');
  const nl = state.nativeLanguage === 'nl';
  const isUK = state.currentLanguage === 'uk';

  // Lessons
  const lessons = getLessonsForTarget(state.currentLanguage) || [];
  const totalPhrases = lessons.reduce((a, l) => a + l.phrases.length, 0);
  const donePhrases = lessons.reduce((a, l) => a + Math.min(l.phrases.length, (state.categoryProgress[l.id] || []).length), 0);
  const finished = lessons.filter(l => (state.categoryProgress[l.id] || []).length >= l.phrases.length).length;

  // Review queues
  const learned = getLearnedCount(), duePhrases = getDuePhrases().length;
  const words = getWordsCount(), dueWords = getDueWords().length;
  const vs = isUK ? vocabStats() : null;
  const ns = isUK ? numbersStats() : null;

  // Drills
  const drills = isUK ? [
    { icon: '✍️', name: L('Verb Drill', 'Werkwoord Drill'), m: sumMastery(verbMastery()), open: 'openVerbDrillScreen()' },
    { icon: '📌', name: L('Case Drill', 'Naamvallen Drill'), m: sumMastery(caseMastery()), open: 'openCaseDrillScreen()' },
    { icon: '🔗', name: L('Prefix Drill', 'Voorvoegsel Drill'), m: sumMastery(prefixMastery()), open: 'openPrefixDrillScreen()' },
    { icon: '🔢', name: L('Numbers & Time', 'Getallen & Tijd'), m: { attempts: numbersAttempts(), weak: numbersWeak().length, pct: null }, open: 'openNumbersDrillScreen()' },
    { icon: '🧩', name: L('Sentence Builder', 'Zinnen bouwen'), m: { attempts: sentenceTracker.totalAttempts(), correct: sentenceTracker.totalCorrect(), weak: sentenceTracker.weakKeys().length }, open: 'openSentenceBuildScreen()' },
    { icon: '🎧', name: L('Dialogues', 'Dialogen'), m: { attempts: dialogueTracker.totalAttempts(), correct: dialogueTracker.totalCorrect(), weak: dialogueTracker.weakKeys().length, done: new Set(dialogueTracker.seenKeys().map(k => k.split(':')[1])).size, of: DIALOGUES.length }, open: 'openDialogueScreen()' },
  ] : [];
  drills.forEach(d => { if (d.m.pct == null && d.m.attempts && d.m.correct != null) d.m.pct = Math.round(d.m.correct / d.m.attempts * 100); });

  // Activity
  const streak = currentStreak();
  const days = lastDays(14);
  const maxDay = Math.max(1, ...days.map(d => d.count));
  const weekday = d => d.toLocaleDateString(nl ? 'nl-NL' : 'en-GB', { weekday: 'narrow' });

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" onclick="showScreen('homeScreen')">←</button>
      <div>
        <div class="lesson-title">📊 ${L('Progress', 'Voortgang')}</div>
        <div class="lesson-subtitle">${L('Everything the app remembers about your practice', 'Alles wat de app over je oefenen bijhoudt')}</div>
      </div>
    </div>

    <div class="pg-card pg-streak">
      <div class="pg-streak-num">${streak > 0 ? '🔥 ' + streak : '💤'}</div>
      <div class="pg-streak-text">
        <div class="pg-streak-title">${streak > 0 ? L(`${streak}-day streak`, `${streak} dagen op rij`) : L('No streak yet', 'Nog geen reeks')}</div>
        <div class="pg-streak-sub">${totalAnswers()} ${L('answers over', 'antwoorden op')} ${activeDays()} ${L('days', 'dagen')}</div>
      </div>
      <div class="pg-days">
        ${days.map(d => `<div class="pg-day" title="${d.key}: ${d.count}"><div class="pg-day-bar" style="height:${Math.round(d.count / maxDay * 100)}%"></div><div class="pg-day-label">${weekday(d.date)}</div></div>`).join('')}
      </div>
    </div>

    <div class="pg-section">${L('Lessons', 'Lessen')}</div>
    <button class="pg-card pg-row" onclick="openLessonBrowse()">
      <span class="pg-row-icon">📖</span>
      <span class="pg-row-text">
        <span class="pg-row-title">${finished} / ${lessons.length} ${L('lessons finished', 'lessen afgerond')}</span>
        <span class="pg-row-sub">${donePhrases} / ${totalPhrases} ${L('phrases practised', 'zinnen geoefend')}</span>
        ${bar(totalPhrases ? donePhrases / totalPhrases * 100 : 0)}
      </span>
    </button>

    <div class="pg-section">${L('Review queues', 'Herhaalrijen')}</div>
    <button class="pg-card pg-row" onclick="openReviewScreen()">
      <span class="pg-row-icon">🗣️</span>
      <span class="pg-row-text">
        <span class="pg-row-title">${learned} ${L('phrases learned', 'zinnen geleerd')} <span class="pg-due">${duePhrases ? duePhrases + ' ' + L('due', 'aan de beurt') : ''}</span></span>
        <span class="pg-row-sub">${L('From lessons, spoken or typed from memory', 'Uit lessen, gesproken of getypt uit je hoofd')}</span>
      </span>
    </button>
    <button class="pg-card pg-row" onclick="openWordsScreen()">
      <span class="pg-row-icon">📇</span>
      <span class="pg-row-text">
        <span class="pg-row-title">${words} ${L('saved words', 'opgeslagen woorden')} <span class="pg-due">${dueWords ? dueWords + ' ' + L('due', 'aan de beurt') : ''}</span></span>
        <span class="pg-row-sub">${L('From conversations', 'Uit gesprekken')}</span>
      </span>
    </button>
    ${vs ? `
    <button class="pg-card pg-row" onclick="openVocabDrillScreen()">
      <span class="pg-row-icon">🧠</span>
      <span class="pg-row-text">
        <span class="pg-row-title">${vs.learned} / ${vs.total} ${L('core words learned', 'kernwoorden geleerd')} <span class="pg-due">${vs.due ? vs.due + ' ' + L('due', 'aan de beurt') : ''}</span></span>
        <span class="pg-row-sub">${vs.seen} ${L('seen', 'gezien')} · ${vs.weak} ${L('weak', 'zwak')}</span>
        ${bar(vs.learned / vs.total * 100, 'pg-fill-pink')}
      </span>
    </button>` : ''}
    ${ns ? `
    <button class="pg-card pg-row" onclick="openNumbersDrillScreen()">
      <span class="pg-row-icon">🔢</span>
      <span class="pg-row-text">
        <span class="pg-row-title">${ns.learned} / ${ns.total} ${L('numbers & times learned', 'getallen & tijden geleerd')} <span class="pg-due">${ns.due ? ns.due + ' ' + L('due', 'aan de beurt') : ''}</span></span>
        <span class="pg-row-sub">${ns.seen} ${L('seen', 'gezien')}</span>
        ${bar(ns.learned / ns.total * 100, 'pg-fill-pink')}
      </span>
    </button>` : ''}

    ${drills.length ? `<div class="pg-section">${L('Drills', 'Drills')}</div>` : ''}
    ${drills.map(d => `
      <button class="pg-card pg-row" onclick="${d.open}">
        <span class="pg-row-icon">${d.icon}</span>
        <span class="pg-row-text">
          <span class="pg-row-title">${escHtml(d.name)} ${d.m.attempts ? `<span class="pg-pct">${d.m.pct != null ? d.m.pct + '%' : ''}</span>` : ''}</span>
          <span class="pg-row-sub">${d.m.attempts
            ? `${d.m.attempts} ${L('answers', 'antwoorden')}${d.m.items ? ` · ${d.m.items} ${L('items', 'items')}` : ''}${d.m.done != null ? ` · ${d.m.done}/${d.m.of} ${L('dialogues', 'dialogen')}` : ''} · ${d.m.weak} ${L('weak', 'zwak')}`
            : L('Not started', 'Nog niet begonnen')}</span>
          ${d.m.attempts && d.m.pct != null ? bar(d.m.pct, d.m.pct >= 80 ? 'pg-fill-green' : d.m.pct >= 50 ? 'pg-fill-amber' : 'pg-fill-red') : ''}
        </span>
      </button>`).join('')}`;
}
