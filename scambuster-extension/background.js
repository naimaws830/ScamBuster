// ScamBuster - Background Service Worker

const API_BASE = 'http://localhost:8080';

const scanResults = {};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.type === 'AUTO_SCAN') {
    const tabId = sender.tab?.id;
    if (tabId) handleScan(msg.data, tabId);
  }

  if (msg.type === 'MANUAL_SCAN') {
    handleScan(msg.data, msg.tabId).then(result => sendResponse(result));
    return true;
  }

  if (msg.type === 'GET_RESULT') {
    sendResponse(scanResults[msg.tabId] || null);
    return true;
  }

  if (msg.type === 'SET_BADGE') {
    updateBadge(msg.tabId, msg.score);
  }

  return true;
});

async function handleScan(pageData, tabId) {
  try {
    scanResults[tabId] = { status: 'scanning', url: pageData.url };
    updateBadge(tabId, 'scanning');

    let domain = pageData.domain || '';
    if (!domain && pageData.url) {
      try { domain = new URL(pageData.url).hostname; } catch(e) {}
    }
    if (!domain) domain = 'unknown.com';

    const payload = {
      url:      pageData.url      || '',
      domain:   domain,
      title:    pageData.title    || '',
      text:     pageData.text     || '',
      headings: pageData.headings || ''
    };

    const response = await fetch(`${API_BASE}/scan.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    if (!response.ok) throw new Error(`Server ${response.status}: ${text}`);

    const result = JSON.parse(text);
    result.status    = 'done';
    result.url       = pageData.url;
    result.scannedAt = new Date().toISOString();

    scanResults[tabId] = result;
    updateBadge(tabId, result.risk_score);

    if (result.risk_score >= 70) showNotification(result);

    return result;

  } catch (err) {
    const errorResult = { status: 'error', error: err.message, url: pageData.url };
    scanResults[tabId] = errorResult;
    updateBadge(tabId, null);
    return errorResult;
  }
}

function updateBadge(tabId, value) {
  if (value === 'scanning') {
    chrome.action.setBadgeText({ text: '...', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#6b7280', tabId });
    return;
  }
  if (value === null || value === undefined) {
    chrome.action.setBadgeText({ text: '', tabId });
    return;
  }
  const score = parseInt(value);
  const color = score >= 70 ? '#ff3d57' : score >= 40 ? '#ffb300' : '#00e676';
  chrome.action.setBadgeText({ text: `${score}`, tabId });
  chrome.action.setBadgeBackgroundColor({ color, tabId });
}

function showNotification(result) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: `⚠️ ScamBuster: High Risk (${result.risk_score}%)`,
    message: result.reasons?.[0] || 'This site shows signs of investment fraud.',
    priority: 2
  });
}

chrome.tabs.onRemoved.addListener((tabId) => { delete scanResults[tabId]; });