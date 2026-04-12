import { showScreen } from '../router.js';
import { generateDeHetNouns } from '../api/dehet.js';
import { escHtml } from '../utils.js';

// ── State ─────────────────────────────────────────────────────────────────────

const dh = {
  nouns:   [],
  current: 0,
  score:   0,
  wrong:   [],
  level:   'a2',
};

// ── Entry point ───────────────────────────────────────────────────────────────

export function openDeHetScreen() {
  dh.level = localStorage.getItem('dhLevel') || 'a2';
  showScreen('dehetScreen');
  renderDeHetHome();
}

function renderDeHetHome() {
  const screen = document.getElementById('dehetScreen');
  screen.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" onclick="showScreen('homeScreen')">←</button>
      <div>
        <div class="lesson-title">🇳🇱 De of Het?</div>
        <div class="lesson-subtitle">Dutch article drill</div>
      </div>
    </div>
    <div class="screen-inner">

      <div class="ex-level-bar">
        ${['a1','a2','b1','b2'].map(l => `
          <button class="ex-level-btn ${dh.level === l ? 'active' : ''}"
                  onclick="setDhLevel('${l}')">${l.toUpperCase()}</button>
        `).join('')}
      </div>

      <div class="dh-intro">
        <div class="dh-intro-icon">📖</div>
        <div class="dh-intro-title">De of Het?</div>
        <div class="dh-intro-desc">
          Dutch has two articles: <strong>de</strong> (common gender) and <strong>het</strong> (neuter).
          Practice 20 nouns — choose the right article for each word.
          <br><br>
          <em>Tip: diminutives ending in <strong>-je</strong> are always <strong>het</strong>.</em>
        </div>
      </div>

      <button class="dh-start-btn" onclick="startDeHetDrill()">▶ Start drill</button>

    </div>`;
}

// ── Level selector ────────────────────────────────────────────────────────────

export function setDhLevel(level) {
  dh.level = level;
  localStorage.setItem('dhLevel', level);
  document.querySelectorAll('.ex-level-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.toLowerCase() === level);
  });
}

// ── Drill ─────────────────────────────────────────────────────────────────────

export async function startDeHetDrill() {
  dh.nouns   = [];
  dh.current = 0;
  dh.score   = 0;
  dh.wrong   = [];

  const screen = document.getElementById('dehetScreen');
  screen.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" onclick="openDeHetScreen()">←</button>
      <div><div class="lesson-title">🇳🇱 De of Het?</div></div>
    </div>
    <div class="screen-inner">
      <div class="dh-loading">
        <span class="dh-loading-spinner">⏳</span>
        Loading nouns…
      </div>
    </div>`;

  try {
    dh.nouns = await generateDeHetNouns(dh.level);
    renderDeHetQuestion();
  } catch (err) {
    screen.querySelector('.screen-inner').innerHTML = `
      <div class="ex-error" style="margin:20px">Could not load nouns: ${escHtml(err.message)}</div>
      <button class="dh-start-btn" style="margin:0 16px" onclick="openDeHetScreen()">← Back</button>`;
  }
}

function renderDeHetQuestion() {
  if (dh.current >= dh.nouns.length) {
    renderDeHetScore();
    return;
  }

  const q       = dh.nouns[dh.current];
  const progress = `${dh.current + 1} / ${dh.nouns.length}`;
  const fillPct  = (dh.current / dh.nouns.length) * 100;

  const screen = document.getElementById('dehetScreen');
  screen.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" onclick="openDeHetScreen()">←</button>
      <div>
        <div class="lesson-title">🇳🇱 De of Het?</div>
        <div class="lesson-subtitle">${progress}</div>
      </div>
    </div>
    <div class="screen-inner">

      <div class="dh-progress-bar">
        <div class="dh-progress-fill" style="width:${fillPct}%"></div>
      </div>

      <div class="dh-card" id="dhCard">
        <div class="dh-english">${escHtml(q.english)}</div>
        <div class="dh-word">${escHtml(q.word)}</div>
        ${q.tip ? `<div class="dh-tip-hidden" id="dhTip">💡 ${escHtml(q.tip)}</div>` : ''}
      </div>

      <div class="dh-choice-row">
        <button class="dh-choice-btn dh-de"  onclick="answerDeHet('de')">DE</button>
        <button class="dh-choice-btn dh-het" onclick="answerDeHet('het')">HET</button>
      </div>

      <div class="dh-score-line">✓ ${dh.score} correct · ${dh.current - dh.score} wrong so far</div>

    </div>`;
}

export function answerDeHet(chosen) {
  const q       = dh.nouns[dh.current];
  const correct = chosen === q.article;

  if (correct) dh.score++;
  else dh.wrong.push(q);

  // Disable buttons and show visual feedback
  const inner = document.querySelector('#dehetScreen .screen-inner');
  inner.querySelectorAll('.dh-choice-btn').forEach(b => {
    b.disabled = true;
    const val = b.classList.contains('dh-de') ? 'de' : 'het';
    if (val === chosen)     b.classList.add(correct ? 'dh-correct' : 'dh-wrong');
    if (!correct && val === q.article) b.classList.add('dh-correct');
  });

  // Show result on card
  const card = document.getElementById('dhCard');
  const resultDiv = document.createElement('div');
  resultDiv.className = `dh-result ${correct ? 'dh-res-correct' : 'dh-res-wrong'}`;
  resultDiv.innerHTML = correct
    ? `✓ Correct! <strong>${escHtml(q.article)} ${escHtml(q.word)}</strong>`
    : `✗ Wrong — it's <strong>${escHtml(q.article)} ${escHtml(q.word)}</strong>`;
  card.appendChild(resultDiv);

  // Reveal tip if present
  const tip = document.getElementById('dhTip');
  if (tip) tip.style.display = 'block';

  // Next / results button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'dh-next-btn';
  nextBtn.textContent = dh.current + 1 < dh.nouns.length ? 'Next →' : 'See results';
  nextBtn.onclick = () => {
    dh.current++;
    renderDeHetQuestion();
  };
  inner.appendChild(nextBtn);
}

// ── Score screen ──────────────────────────────────────────────────────────────

function renderDeHetScore() {
  const pct = Math.round((dh.score / dh.nouns.length) * 100);
  const msg = pct >= 80 ? '🎉 Excellent work!' : pct >= 60 ? '👍 Good effort!' : '💪 Keep practising!';

  const screen = document.getElementById('dehetScreen');
  screen.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" onclick="openDeHetScreen()">←</button>
      <div><div class="lesson-title">🇳🇱 De of Het? — Results</div></div>
    </div>
    <div class="screen-inner">

      <div class="dh-score-card">
        <div class="dh-score-pct">${pct}%</div>
        <div class="dh-score-text">${dh.score} / ${dh.nouns.length} correct</div>
        <div class="dh-score-msg">${msg}</div>
      </div>

      ${dh.wrong.length > 0 ? `
        <div class="dh-wrong-section">
          <div class="dh-wrong-title">Review — words to remember:</div>
          ${dh.wrong.map(w => `
            <div class="dh-wrong-item">
              <strong>${escHtml(w.article)} ${escHtml(w.word)}</strong>
              <span class="dh-wrong-en">${escHtml(w.english)}</span>
              ${w.tip ? `<div class="dh-wrong-tip">💡 ${escHtml(w.tip)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : `<div class="dh-perfect">🏆 Perfect score — no mistakes!</div>`}

      <div class="dh-action-row">
        <button class="dh-start-btn" style="max-width:none;flex:2" onclick="startDeHetDrill()">▶ Try again</button>
        <button class="dh-back-btn"  style="flex:1"               onclick="openDeHetScreen()">← Home</button>
      </div>

    </div>`;
}
