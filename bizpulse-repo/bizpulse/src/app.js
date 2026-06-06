// src/app.js — BizPulse core application logic

// ============================================================
// CONFIG — replace with your Anthropic API key or proxy URL
// ============================================================
const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL   = 'claude-sonnet-4-20250514';

// ============================================================
// SYSTEM PROMPT
// ============================================================
const SYSTEM_PROMPT = `You are BizPulse, an elite AI business analyst. A business owner has described their situation. Respond ONLY with a valid JSON object — no markdown, no backticks, no extra text.

Return exactly this structure:
{
  "healthScore": <integer 0-100>,
  "healthLabel": <"Critical" | "At Risk" | "Caution" | "Stable" | "Healthy">,
  "summary": <1-2 sentence plain-language diagnosis>,
  "kpis": [
    { "name": <short metric name>, "value": <display string>, "trend": <"up"|"down"|"neutral">, "note": <short note> }
  ],
  "risks": [
    { "level": <"high"|"medium"|"low">, "title": <short title>, "description": <1-2 sentences> }
  ],
  "plan": [
    { "days": <e.g. "Day 1">, "title": <short action title>, "actions": <2-3 concrete actions as a single paragraph> }
  ]
}

Rules:
- healthScore reflects real urgency: below 40 = Critical, 40-59 = At Risk, 60-74 = Caution, 75-87 = Stable, 88+ = Healthy
- kpis: extract or infer exactly 4 metrics from the situation (revenue, margin, runway, churn, burn rate, etc.)
- risks: 3-5 risks ordered high to low priority
- plan: exactly 7 entries covering Day 1 through Day 7
- Be specific and reference numbers/details from the situation — never give generic advice
- Respond ONLY with the JSON object. Nothing else.`;

// ============================================================
// LOADING MESSAGES
// ============================================================
const LOADING_MESSAGES = [
  'Reading your situation...',
  'Identifying risk signals...',
  'Calculating health score...',
  'Building your battle plan...',
];

// ============================================================
// STATE
// ============================================================
let loadingInterval = null;
let loadingStepInterval = null;
let currentResult = null;

// ============================================================
// DOM HELPERS
// ============================================================
const $ = id => document.getElementById(id);
const show = id => $(id).style.display = 'block';
const hide = id => $(id).style.display = 'none';

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const input = $('situationInput');
  const analyzeBtn = $('analyzeBtn');
  const resetBtn = $('resetBtn');
  const charCount = $('charCount');

  // Character counter
  input.addEventListener('input', () => {
    const len = input.value.length;
    charCount.textContent = `${len} character${len !== 1 ? 's' : ''}`;
  });

  analyzeBtn.addEventListener('click', runAnalysis);
  resetBtn.addEventListener('click', resetApp);

  // Action buttons
  $('actionDeep').addEventListener('click', () =>
    window.open(`https://claude.ai/new?q=${encodeURIComponent('Give me a deeper financial analysis and break-even calculation for this business: ' + (currentResult?._input || ''))}`, '_blank')
  );
  $('actionPitch').addEventListener('click', () =>
    window.open(`https://claude.ai/new?q=${encodeURIComponent('Write a fundraising pitch based on this business situation: ' + (currentResult?._input || ''))}`, '_blank')
  );
  $('actionRoadmap').addEventListener('click', () =>
    window.open(`https://claude.ai/new?q=${encodeURIComponent('Create a detailed 30-day execution roadmap for: ' + (currentResult?._input || ''))}`, '_blank')
  );
  $('actionExport').addEventListener('click', exportReport);
});

// ============================================================
// MAIN ANALYSIS FLOW
// ============================================================
async function runAnalysis() {
  const input = $('situationInput').value.trim();

  if (!input || input.length < 40) {
    showError('Please describe your situation in a bit more detail — the more context you give, the better the diagnosis.');
    return;
  }

  hideError();
  startLoading();

  try {
    const result = await callClaude(input);
    result._input = input;
    currentResult = result;
    stopLoading();
    renderResults(result);
  } catch (err) {
    stopLoading();
    showError(`Analysis failed: ${err.message}. Please check your API key in src/app.js and try again.`);
    resetToInput();
  }
}

// ============================================================
// CLAUDE API CALL
// ============================================================
async function callClaude(situationText) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // NOTE: In production, proxy this through your backend.
      // Never expose your API key in client-side code.
      // For local dev, set your key here or use a proxy.
      // 'x-api-key': 'YOUR_API_KEY_HERE',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: situationText }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const raw = data.content.map(b => b.text || '').join('');
  const clean = raw.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

// ============================================================
// LOADING STATE
// ============================================================
function startLoading() {
  hide('inputPhase');
  show('loadingPhase');

  let msgIdx = 0;
  let stepIdx = 0;

  loadingInterval = setInterval(() => {
    msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
    $('loadingMsg').textContent = LOADING_MESSAGES[msgIdx];
  }, 2000);

  loadingStepInterval = setInterval(() => {
    const steps = document.querySelectorAll('.loading-steps .step');
    if (stepIdx > 0 && steps[stepIdx - 1]) {
      steps[stepIdx - 1].classList.remove('active');
      steps[stepIdx - 1].classList.add('done');
    }
    if (steps[stepIdx]) {
      steps[stepIdx].classList.add('active');
    }
    stepIdx = Math.min(stepIdx + 1, steps.length - 1);
  }, 1800);
}

function stopLoading() {
  clearInterval(loadingInterval);
  clearInterval(loadingStepInterval);
  hide('loadingPhase');
}

// ============================================================
// RENDER RESULTS
// ============================================================
function renderResults(d) {
  const score = Math.min(100, Math.max(0, d.healthScore || 0));
  const scoreColor = score >= 76 ? '#3B6D11' : score >= 50 ? '#BA7517' : '#A32D2D';

  // Timestamp
  $('reportTime').textContent = `Generated ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`;

  // Health score ring
  const circumference = 2 * Math.PI * 40; // 251.2
  const offset = circumference - (score / 100) * circumference;
  const ring = $('scoreRingFill');
  ring.style.stroke = scoreColor;
  ring.style.strokeDashoffset = circumference; // start at 0
  setTimeout(() => { ring.style.strokeDashoffset = offset; }, 100);

  $('scoreNum').textContent = score;
  $('scoreNum').style.color = scoreColor;
  $('healthLabel').textContent = d.healthLabel || '—';
  $('healthLabel').style.color = scoreColor;
  $('healthSummary').textContent = d.summary || '';

  // KPIs
  $('kpiGrid').innerHTML = (d.kpis || []).map(k => `
    <div class="kpi-card">
      <div class="kpi-name">${escHtml(k.name)}</div>
      <div class="kpi-val">${escHtml(k.value)}</div>
      <div class="kpi-trend ${k.trend === 'up' ? 'kpi-up' : k.trend === 'down' ? 'kpi-down' : 'kpi-neutral'}">
        <i class="ti ti-arrow-${k.trend === 'up' ? 'up' : k.trend === 'down' ? 'down' : 'right'}" aria-hidden="true"></i>
        ${escHtml(k.note)}
      </div>
    </div>
  `).join('');

  // Risks
  $('risksList').innerHTML = (d.risks || []).map(r => `
    <div class="risk-item risk-${r.level}">
      <div class="risk-dot" aria-hidden="true"></div>
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">
          <div class="risk-title">${escHtml(r.title)}</div>
          <span class="risk-badge">${r.level}</span>
        </div>
        <div class="risk-desc">${escHtml(r.description)}</div>
      </div>
    </div>
  `).join('');

  // 7-Day Plan
  $('planList').innerHTML = (d.plan || []).map((p, i) => `
    <div class="plan-item">
      <button class="plan-header" onclick="togglePlan(${i})" aria-expanded="${i === 0}">
        <span class="day-badge">${escHtml(p.days)}</span>
        <span class="day-title">${escHtml(p.title)}</span>
        <i class="ti ti-chevron-down plan-chevron ${i === 0 ? 'open' : ''}" id="chev-${i}" aria-hidden="true"></i>
      </button>
      <div class="plan-body ${i === 0 ? 'open' : ''}" id="plan-body-${i}">
        <p>${escHtml(p.actions)}</p>
      </div>
    </div>
  `).join('');

  // Show results
  const resultsEl = $('resultsPhase');
  resultsEl.style.display = 'block';
  resultsEl.classList.add('fade-up');
}

function togglePlan(i) {
  const body = $(`plan-body-${i}`);
  const chev = $(`chev-${i}`);
  const isOpen = body.classList.toggle('open');
  chev.classList.toggle('open', isOpen);
}

// ============================================================
// EXPORT REPORT
// ============================================================
function exportReport() {
  if (!currentResult) return;
  const d = currentResult;

  const lines = [
    '# BizPulse Business Health Report',
    `Generated: ${new Date().toLocaleString('en-IN')}`,
    '',
    `## Health Score: ${d.healthScore}/100 — ${d.healthLabel}`,
    '',
    d.summary,
    '',
    '## Key Metrics',
    ...(d.kpis || []).map(k => `- **${k.name}**: ${k.value} (${k.note})`),
    '',
    '## Risk Signals',
    ...(d.risks || []).map(r => `### [${r.level.toUpperCase()}] ${r.title}\n${r.description}`),
    '',
    '## 7-Day Battle Plan',
    ...(d.plan || []).map(p => `### ${p.days}: ${p.title}\n${p.actions}`),
    '',
    '---',
    'Generated by BizPulse · FlowZint AI Hackathon 2026',
    'https://github.com/YOUR_USERNAME/bizpulse',
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bizpulse-report-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// RESET
// ============================================================
function resetApp() {
  hide('resultsPhase');
  $('resultsPhase').classList.remove('fade-up');
  show('inputPhase');
  currentResult = null;

  // Reset loading steps
  document.querySelectorAll('.loading-steps .step').forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i === 0) s.classList.add('active');
  });

  $('analyzeBtn').disabled = false;
  $('situationInput').focus();
}

function resetToInput() {
  hide('loadingPhase');
  show('inputPhase');
  $('analyzeBtn').disabled = false;
}

// ============================================================
// UTILITIES
// ============================================================
function showError(msg) {
  const box = $('errorBox');
  box.textContent = msg;
  box.style.display = 'block';
}

function hideError() {
  $('errorBox').style.display = 'none';
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
