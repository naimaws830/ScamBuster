// ScamBuster - Popup Script

const API_BASE = 'http://localhost:8080'; // Change to Vercel URL after deploy

const stateIdle     = document.getElementById('stateIdle');
const stateScanning = document.getElementById('stateScanning');
const stateResult   = document.getElementById('stateResult');
const stateError    = document.getElementById('stateError');
const currentUrlEl  = document.getElementById('currentUrl');
const urlDot        = document.getElementById('urlDot');
const btnScan       = document.getElementById('btnScan');
const btnHist       = document.getElementById('btnHist');
const historyPanel  = document.getElementById('historyPanel');
const historyClose  = document.getElementById('historyClose');
const historyList   = document.getElementById('historyList');
const scanCountEl   = document.getElementById('scanCount');

let currentTab = null;

// ─── INIT ───────────────────────────────────────────
(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;

  try {
    const domain = new URL(tab.url).hostname;
    currentUrlEl.textContent = domain;
  } catch {
    currentUrlEl.textContent = tab.url || 'Unknown';
  }

  const { scanCount = 0 } = await chrome.storage.local.get('scanCount');
  updateScanCount(scanCount);

  // Check existing result
  const result = await new Promise(res => {
    chrome.runtime.sendMessage({ type: 'GET_RESULT', tabId: tab.id }, (r) => {
      res(r || null);
    });
  });

  if (result) {
    if (result.status === 'scanning') showScanning();
    else if (result.status === 'done')  showResult(result);
    else showIdle();
  } else {
    showIdle();
  }
})();

// ─── SCAN BUTTON ────────────────────────────────────
btnScan.addEventListener('click', async () => {
  if (!currentTab) return;

  showScanning();
  btnScan.disabled = true;
  btnScan.innerHTML = '<span>⏳</span> Scanning...';

  try {
    // Get tab URL info directly — no content script needed
    const tabUrl = currentTab.url || '';
    let domain = '';
    try { domain = new URL(tabUrl).hostname; } catch(e) { domain = 'unknown.com'; }

    // Try to get page text from content script
    // If it fails, we still proceed with URL/domain only
    let pageText = '';
    let pageTitle = currentTab.title || '';
    let pageHeadings = '';

    try {
      const pageData = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('timeout')), 3000);
        chrome.tabs.sendMessage(currentTab.id, { type: 'GET_PAGE_DATA' }, (res) => {
          clearTimeout(timeout);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(res);
          }
        });
      });
      if (pageData) {
        pageText     = pageData.text     || '';
        pageTitle    = pageData.title    || pageTitle;
        pageHeadings = pageData.headings || '';
        domain       = pageData.domain   || domain;
      }
    } catch (contentErr) {
      console.warn('Content script unavailable, using tab info only:', contentErr.message);
      // Still proceed — we have domain and title from tab
    }

    // Build payload — domain is ALWAYS set
    // Detect protocol clearly for backend
    let protocol = 'unknown';
    try {
      protocol = new URL(tabUrl).protocol.replace(':', ''); // 'https', 'http', 'file', etc.
    } catch(e) {}

    const payload = {
      url:      tabUrl,
      domain:   domain || 'unknown.com',
      protocol: protocol,
      title:    pageTitle,
      text:     pageText,
      headings: pageHeadings
    };

    console.log('Sending to API:', payload.domain, payload.url);

    // Call backend directly from popup as fallback
    const response = await fetch(`${API_BASE}/scan.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('API response:', responseText.substring(0, 200));

    if (!response.ok) {
      throw new Error(`Server error ${response.status}: ${responseText}`);
    }

    const result = JSON.parse(responseText);
    result.status    = 'done';
    result.url       = tabUrl;
    result.scannedAt = new Date().toISOString();

    showResult(result);

    // Update badge via background
    chrome.runtime.sendMessage({
      type: 'SET_BADGE',
      tabId: currentTab.id,
      score: result.risk_score
    });

    // Update scan count
    const { scanCount = 0 } = await chrome.storage.local.get('scanCount');
    const newCount = scanCount + 1;
    await chrome.storage.local.set({ scanCount: newCount });
    updateScanCount(newCount);

    // Save to history
    await saveHistory(result);

  } catch (err) {
    console.error('Scan error:', err);
    showError(err.message);
  }

  btnScan.disabled = false;
  btnScan.innerHTML = '<span>🔍</span> Scan This Page';
});

// ─── HISTORY ────────────────────────────────────────
btnHist.addEventListener('click', async () => {
  await renderHistory();
  historyPanel.classList.remove('hidden');
});

historyClose.addEventListener('click', () => {
  historyPanel.classList.add('hidden');
});

// ─── STATE FUNCTIONS ────────────────────────────────
function showIdle() {
  stateIdle.classList.remove('hidden');
  stateScanning.classList.add('hidden');
  stateResult.classList.add('hidden');
  stateError.classList.add('hidden');
  urlDot.className = 'url-dot';
}

function showScanning() {
  stateIdle.classList.add('hidden');
  stateScanning.classList.remove('hidden');
  stateResult.classList.add('hidden');
  stateError.classList.add('hidden');
  urlDot.className = 'url-dot';
}

function showError(msg) {
  stateIdle.classList.add('hidden');
  stateScanning.classList.add('hidden');
  stateResult.classList.add('hidden');
  stateError.classList.remove('hidden');
  document.getElementById('errorDesc').textContent = msg || 'Unknown error.';
  urlDot.className = 'url-dot';
}

function showResult(result) {
  stateIdle.classList.add('hidden');
  stateScanning.classList.add('hidden');
  stateResult.classList.remove('hidden');
  stateError.classList.add('hidden');

  const score = parseInt(result.risk_score) || 0;
  const level = score >= 70 ? 'danger' : score >= 40 ? 'warn' : 'safe';

  urlDot.className = `url-dot ${level}`;

  // Animate circle meter (circumference of r=52 = ~327)
  const circumference = 327;
  const offset = circumference - (circumference * score / 100);
  const fill = document.getElementById('meterFill');
  fill.style.strokeDashoffset = offset;
  fill.className = `meter-fill ${level === 'safe' ? '' : level}`;

  animateNumber(document.getElementById('meterNum'), 0, score, 1100);

  document.getElementById('meterLbl').textContent =
    level === 'danger' ? 'HIGH RISK' : level === 'warn' ? 'CAUTION' : 'SAFE';

  const badge = document.getElementById('riskBadge');
  badge.className = `risk-badge ${level === 'safe' ? '' : level}`;
  document.getElementById('badgeIcon').textContent =
    level === 'danger' ? '🚨' : level === 'warn' ? '⚠️' : '✅';
  document.getElementById('badgeText').textContent =
    level === 'danger' ? 'High Risk — Likely a Scam' :
    level === 'warn'   ? 'Suspicious — Proceed Carefully' :
                         'Looks Safe';

  // Scam type
  const scamBlock = document.getElementById('scamTypeBlock');
  const scamVal   = document.getElementById('scamTypeVal');
  if (result.scam_type && result.scam_type !== 'None' && result.scam_type !== 'none') {
    scamBlock.classList.remove('hidden');
    scamVal.textContent = result.scam_type;
  } else {
    scamBlock.classList.add('hidden');
  }

  // Reasons
  const list = document.getElementById('reasonsList');
  list.innerHTML = '';
  (result.reasons || []).forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    list.appendChild(li);
  });

  // Domain info
  const grid = document.getElementById('domainGrid');
  grid.innerHTML = '';
  if (result.domain_info) {
    const di = result.domain_info;
    const items = [
      { label: 'Domain Age',  value: di.age || 'Unknown',       color: di.age_risk || '' },
      { label: 'Privacy',     value: di.privacy || 'Unknown',   color: di.privacy_risk || '' },
      { label: 'HTTPS', value: di.https_label ?? (di.https === null ? 'N/A' : di.https ? 'Secure ✓' : 'Insecure ✗'), color: di.https_risk ?? (di.https === null ? 'green' : di.https ? 'green' : 'red') },
      { label: 'Risk Level',  value: di.risk_label || 'Unknown', color: di.risk_color || '' }
    ];
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'd-item';
      div.innerHTML = `<div class="d-item-label">${item.label}</div><div class="d-item-value ${item.color}">${item.value}</div>`;
      grid.appendChild(div);
    });
  }
}

// ─── HELPERS ────────────────────────────────────────
function animateNumber(el, from, to, duration) {
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * eased) + '%';
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function updateScanCount(n) {
  scanCountEl.textContent = `${n} scan${n !== 1 ? 's' : ''}`;
}

async function saveHistory(result) {
  const { history = [] } = await chrome.storage.local.get('history');
  history.unshift({
    url: result.url,
    score: result.risk_score,
    scannedAt: result.scannedAt || new Date().toISOString()
  });
  await chrome.storage.local.set({ history: history.slice(0, 30) });
}

async function renderHistory() {
  const { history = [] } = await chrome.storage.local.get('history');
  historyList.innerHTML = '';
  if (history.length === 0) {
    historyList.innerHTML = '<div class="h-empty">No scans yet</div>';
    return;
  }
  history.forEach(item => {
    const score = item.score || 0;
    const level = score >= 70 ? 'danger' : score >= 40 ? 'warn' : 'safe';
    const time  = new Date(item.scannedAt).toLocaleTimeString();
    const div   = document.createElement('div');
    div.className = 'h-item';
    div.innerHTML = `
      <div class="h-url">${item.url}</div>
      <div class="h-meta">
        <span class="h-score ${level}">${score}% Risk</span>
        <span class="h-time">${time}</span>
      </div>`;
    historyList.appendChild(div);
  });
}