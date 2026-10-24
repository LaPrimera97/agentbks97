/* ═══════════════════════════════════════════════════
   AGENT BKS97 — builder.js
   Core logic for builder.html
═══════════════════════════════════════════════════ */

/* ── STATE ──────────────────────────────────────── */
const State = {
  currentHTML:      '',
  history:          [],
  selectedPalette:  'dark',
  selectedFont:     'modern',
  selectedStyle:    'professional',
  timerInterval:    null,
  barInterval:      null,
  startTime:        0,
};

/* ── INIT ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  Particles.init('bg-canvas');
  GridCanvas.init('grid-canvas');

  setupTabs();
  setupPalette();
  setupFontOptions();
  setupStyleOptions();
  setupSectionToggles();
  setupDeviceToggle();
  setupRefineBar();
  loadSessionPrompt();
  startClock();
});

/* ── CLOCK ──────────────────────────────────────── */
function startClock() {
  const el = document.getElementById('bld-clock');
  const tick = () => {
    const n = new Date();
    if (el) el.textContent =
      String(n.getHours()).padStart(2,'0') + ':' +
      String(n.getMinutes()).padStart(2,'0');
  };
  tick();
  setInterval(tick, 1000);
}

/* ── SESSION PROMPT ─────────────────────────────── */
function loadSessionPrompt() {
  const saved = sessionStorage.getItem('agentbks97_prompt');
  if (saved) {
    const ta = document.getElementById('main-prompt');
    if (ta) ta.value = saved;
    sessionStorage.removeItem('agentbks97_prompt');
  }
}

/* ── TABS ───────────────────────────────────────── */
function setupTabs() {
  document.querySelectorAll('.sidebar-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById('tab-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });
}

/* ── PALETTE ────────────────────────────────────── */
function setupPalette() {
  document.querySelectorAll('.palette-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      document.querySelectorAll('.palette-swatch').forEach(s => s.classList.remove('selected'));
      sw.classList.add('selected');
      State.selectedPalette = sw.dataset.palette;
    });
  });
}

/* ── FONT OPTIONS ───────────────────────────────── */
function setupFontOptions() {
  document.querySelectorAll('.font-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.font-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      State.selectedFont = opt.dataset.font;
    });
  });
}

/* ── STYLE OPTIONS ──────────────────────────────── */
function setupStyleOptions() {
  document.querySelectorAll('.style-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.style-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      State.selectedStyle = opt.dataset.style;
    });
  });
}

/* ── SECTION TOGGLES ────────────────────────────── */
function setupSectionToggles() {
  document.querySelectorAll('.section-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => toggle.classList.toggle('on'));
  });
}

/* ── DEVICE TOGGLE ──────────────────────────────── */
function setupDeviceToggle() {
  document.querySelectorAll('.device-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const frameWrap = document.getElementById('frame-container');
      frameWrap.classList.toggle('mobile-view', btn.dataset.device === 'mobile');
    });
  });
}

/* ── REFINE BAR ─────────────────────────────────── */
function setupRefineBar() {
  const input = document.getElementById('refine-input');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') iterate();
    });
  }
}

/* ── QUICK CHIPS ────────────────────────────────── */
function fillTemplate(key) {
  const ta = document.getElementById('main-prompt');
  if (ta && TEMPLATES[key]) {
    ta.value = TEMPLATES[key];
    ta.focus();
    // Switch to prompt tab
    const promptTab = document.querySelector('[data-tab="prompt"]');
    if (promptTab) promptTab.click();
  }
}

/* ── GET ACTIVE SECTIONS ────────────────────────── */
function getActiveSections() {
  return Array.from(document.querySelectorAll('.section-toggle.on'))
    .map(el => el.dataset.section);
}

/* ── REQUEST OPTIONS ────────────────────────────── */
function getOptions() {
  return {
    palette:  State.selectedPalette,
    font:     State.selectedFont,
    style:    State.selectedStyle,
    sections: getActiveSections(),
  };
}

/* ── API CALL ────────────────────────────────────── */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function callModel(messages) {
  const id = crypto.randomUUID();

  let start;
  try {
    start = await fetch(CONFIG.GENERATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, options: getOptions(), messages }),
    });
  } catch (e) {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  if (start.status !== 202) throw new Error('Could not start generation. Please try again.');

  const deadline = Date.now() + CONFIG.POLL_TIMEOUT_MS;
  let failures = 0;

  while (Date.now() < deadline) {
    await sleep(CONFIG.POLL_INTERVAL_MS);
    let job;
    try {
      const res = await fetch(`${CONFIG.STATUS_URL}?id=${id}`, { cache: 'no-store' });
      job = await res.json();
      failures = 0;
    } catch (e) {
      failures++;
      if (failures >= 5) throw new Error('Lost connection to the server. Please try again.');
      continue;
    }
    if (job.status === 'done')  return job.content;
    if (job.status === 'error') throw new Error(job.message || 'Generation failed. Please try again.');
  }
  throw new Error('Generation is taking too long. Please try again.');
}

/* ── EXTRACT HTML ───────────────────────────────── */
function extractHTML(raw) {
  raw = raw.trim()
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '')
    .trim();
  const idx = raw.indexOf('<!DOCTYPE');
  return idx > 0 ? raw.slice(idx) : raw;
}

/* ── TIMER ──────────────────────────────────────── */
function startTimer() {
  State.startTime = Date.now();
  State.timerInterval = setInterval(() => {
    const el = document.getElementById('loading-timer');
    if (el) el.textContent = ((Date.now() - State.startTime) / 1000).toFixed(1) + 's';
  }, 100);
}
function stopTimer() {
  clearInterval(State.timerInterval);
  return ((Date.now() - State.startTime) / 1000).toFixed(1) + 's';
}

/* ── LOADING BAR ────────────────────────────────── */
const LOAD_STEPS = [
  [10,  'Reading your description...'],
  [28,  'Planning layout and sections...'],
  [52,  'Writing HTML structure...'],
  [74,  'Crafting CSS styles...'],
  [90,  'Adding interactions...'],
  [97,  'Finalising...'],
];

function startLoadBar() {
  let pct = 0, stepIdx = 0;
  State.barInterval = setInterval(() => {
    if (pct < 97) pct += 0.32;
    document.getElementById('loading-bar-fill').style.width = pct + '%';
    document.getElementById('loading-pct').textContent = Math.round(pct) + '%';
    document.getElementById('loading-word-fill').style.width = Math.min(pct, 100) + '%';
    if (stepIdx < LOAD_STEPS.length && pct >= LOAD_STEPS[stepIdx][0]) {
      document.getElementById('loading-step-text').textContent = LOAD_STEPS[stepIdx][1];
      stepIdx++;
    }
  }, 80);
}

function finishLoadBar() {
  clearInterval(State.barInterval);
  document.getElementById('loading-bar-fill').style.width = '100%';
  document.getElementById('loading-pct').textContent = '100%';
  document.getElementById('loading-word-fill').style.width = '100%';
  document.getElementById('loading-step-text').textContent = 'Complete.';
}

/* ── UI STATE HELPERS ───────────────────────────── */
function showStandby() {
  document.getElementById('standby-screen').style.display  = 'flex';
  document.getElementById('loading-screen').classList.remove('active');
  document.getElementById('frame-container').classList.remove('active');
}
function showLoading() {
  document.getElementById('standby-screen').style.display  = 'none';
  document.getElementById('loading-screen').classList.add('active');
  document.getElementById('frame-container').classList.remove('active');
  LoadCanvas.init('load-canvas');
}
function showFrame() {
  document.getElementById('standby-screen').style.display  = 'none';
  document.getElementById('loading-screen').classList.remove('active');
  document.getElementById('frame-container').classList.add('active');
}
function setStatus(text, isActive = false) {
  const el = document.getElementById('gen-status');
  if (!el) return;
  el.className = 'status-pill' + (isActive ? ' active' : '');
  el.innerHTML = `<span class="status-dot${isActive ? ' live' : ''}"></span>${text}`;
}
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4500);
}

/* ── RENDER PREVIEW ─────────────────────────────── */
function renderPreview(html) {
  const frame = document.getElementById('preview-iframe');
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  frame.src = url;
}

/* ── GENERATE ───────────────────────────────────── */
async function generate() {
  const prompt = document.getElementById('main-prompt').value.trim();
  if (!prompt) {
    showToast('Please describe your business first.');
    document.getElementById('main-prompt').focus();
    return;
  }

  const genBtn = document.getElementById('generate-btn');
  genBtn.disabled = true;
  showLoading();
  startTimer();
  startLoadBar();
  setStatus('Generating...', true);

  State.history = [{
    role: 'user',
    content: `Create a landing page for this South African business:\n\n${prompt}`,
  }];

  try {
    const raw  = await callModel(State.history);
    const html = extractHTML(raw);
    State.currentHTML = html;
    State.history.push({ role: 'assistant', content: raw });

    finishLoadBar();
    const elapsed = stopTimer();
    await new Promise(r => setTimeout(r, 380));

    renderPreview(html);
    showFrame();

    document.getElementById('refine-bar').classList.add('visible');
    document.getElementById('dl-btn').disabled = false;

    const words = prompt.split(' ').slice(0, 4).join('-')
      .toLowerCase().replace(/[^a-z0-9-]/g, '');
    document.getElementById('preview-address').textContent =
      'agentbks97 · ' + words + '.html';

    setStatus('Generated in ' + elapsed);

  } catch (err) {
    clearInterval(State.barInterval);
    stopTimer();
    showStandby();
    showToast(err.message || 'Something went wrong. Please try again.');
    setStatus('Error');
  } finally {
    genBtn.disabled = false;
  }
}

/* ── ITERATE ────────────────────────────────────── */
async function iterate() {
  const change = document.getElementById('refine-input').value.trim();
  if (!change) return;

  const refineBtn = document.getElementById('refine-btn');
  refineBtn.disabled = true;
  refineBtn.textContent = 'Updating...';

  State.history.push({
    role: 'user',
    content: `Update the landing page with these changes: ${change}\n\nReturn the complete updated HTML file.`,
  });

  showLoading();
  startTimer();
  startLoadBar();
  setStatus('Updating...', true);

  try {
    const raw  = await callModel(State.history);
    const html = extractHTML(raw);
    State.currentHTML = html;
    State.history.push({ role: 'assistant', content: raw });

    finishLoadBar();
    const elapsed = stopTimer();
    await new Promise(r => setTimeout(r, 300));

    renderPreview(html);
    showFrame();

    document.getElementById('refine-input').value = '';
    setStatus('Updated in ' + elapsed);

  } catch (err) {
    clearInterval(State.barInterval);
    stopTimer();
    showFrame();
    showToast(err.message || 'Update failed. Please try again.');
    setStatus('Error');
  } finally {
    refineBtn.disabled = false;
    refineBtn.textContent = 'Apply →';
  }
}

/* ── DOWNLOAD ───────────────────────────────────── */
function downloadPage() {
  if (!State.currentHTML) return;
  const a = document.createElement('a');
  a.href = 'data:text/html;charset=utf-8,' + encodeURIComponent(State.currentHTML);
  a.download = 'my-landing-page.html';
  a.click();
}

/* ── RESET ──────────────────────────────────────── */
function resetBuilder() {
  State.currentHTML = '';
  State.history     = [];
  document.getElementById('preview-iframe').src = 'about:blank';
  document.getElementById('refine-input').value = '';
  document.getElementById('refine-bar').classList.remove('visible');
  document.getElementById('dl-btn').disabled = true;
  document.getElementById('preview-address').textContent = 'agentbks97 · awaiting generation';
  setStatus('Ready');
  showStandby();
}
