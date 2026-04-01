// TruthLens AI Popup Script v2.0
const BASE_URL = 'https://doztmrzytayxhgjbdozt.onspace.app';
const API_URL  = 'https://doztmrzytayxhgjbdozt.backend.onspace.ai/functions/v1/verify-claim';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvenRtcnp5dGF5eGhnamJkb3p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTY3NDUsImV4cCI6MjA1OTA3Mjc0NX0.CJ_qFJcMSJ3rniicU_XPRJrg4JwS2OEfZRWH4cBP5Xo';

let currentResult = null;

// ── Boot ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  loadRecentVerifications();
  bindUI();
});

// ── Load Stats ───────────────────────────────────────────────────────────────
function loadStats() {
  chrome.storage.local.get(['totalVerifications'], (res) => {
    document.getElementById('total-count').textContent = res.totalVerifications || 0;
  });
}

// ── Load Recent ──────────────────────────────────────────────────────────────
function loadRecentVerifications() {
  chrome.storage.local.get(['recentVerifications'], (res) => {
    const recents = res.recentVerifications || [];
    if (recents.length === 0) return;

    document.getElementById('recent-section').style.display = 'block';
    const list = document.getElementById('recent-list');
    list.innerHTML = recents.map(v => {
      const color = scoreColor(v.truthScore);
      return `
        <div class="recent-item" data-id="${v.id}">
          <span class="recent-claim">${v.claim}</span>
          <span class="recent-score" style="color:${color}">${v.truthScore}%</span>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.recent-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        if (id) openTab(`${BASE_URL}/result/${id}`);
      });
    });
  });
}

// ── Bind All UI ──────────────────────────────────────────────────────────────
function bindUI() {
  // Quick verify input
  const input = document.getElementById('claim-input');
  const goBtn = document.getElementById('quick-verify-btn');

  const runQuickVerify = () => {
    const val = input.value.trim();
    if (!val) return;
    const inputType = val.startsWith('http://') || val.startsWith('https://') ? 'url' : 'text';
    runPopupVerification({ claim: val, inputType });
  };

  goBtn.addEventListener('click', runQuickVerify);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') runQuickVerify(); });

  // Verify current page
  document.getElementById('verify-current').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url && !tabs[0].url.startsWith('chrome://') && !tabs[0].url.startsWith('about:')) {
        runPopupVerification({ claim: tabs[0].url, inputType: 'url' });
      } else {
        showPopupError('Cannot verify this type of page.');
      }
    });
  });

  // Navigation buttons
  document.getElementById('open-trending').addEventListener('click', () => openTab(`${BASE_URL}/trending`));
  document.getElementById('open-dashboard').addEventListener('click', () => openTab(`${BASE_URL}/dashboard`));
  document.getElementById('view-history').addEventListener('click', () => openTab(`${BASE_URL}/history`));
  document.getElementById('open-web').addEventListener('click', () => openTab(BASE_URL));
  document.getElementById('btn-help').addEventListener('click', showHelp);
}

// ── Popup In-line Verification ───────────────────────────────────────────────
async function runPopupVerification(data) {
  const resultArea = document.getElementById('popup-result');
  resultArea.style.display = 'block';
  resultArea.className = 'visible';

  const truncated = data.claim.length > 60 ? data.claim.substring(0, 60) + '…' : data.claim;
  resultArea.innerHTML = `
    <div class="popup-loading">
      <div class="spinner-sm"></div>
      <span>Verifying: "${truncated}"</span>
    </div>
  `;

  // Disable verify buttons while loading
  document.getElementById('quick-verify-btn').disabled = true;
  document.getElementById('verify-current').disabled = true;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({
        claim: data.claim,
        inputType: data.inputType,
        mediaUrl: data.mediaUrl || null
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`[${response.status}] ${err}`);
    }

    const result = await response.json();
    currentResult = result;

    // Save to storage
    chrome.storage.local.get(['totalVerifications', 'recentVerifications'], (stored) => {
      const newTotal = (stored.totalVerifications || 0) + 1;
      const recents = stored.recentVerifications || [];
      recents.unshift({
        id: result.id,
        claim: data.claim.substring(0, 80),
        truthScore: result.truthScore,
        status: result.status,
        timestamp: Date.now()
      });
      chrome.storage.local.set({
        totalVerifications: newTotal,
        recentVerifications: recents.slice(0, 5)
      });
      document.getElementById('total-count').textContent = newTotal;
    });

    showPopupResult(result, data);
  } catch (err) {
    console.error('[TruthLens Popup]', err);
    showPopupError(err.message || 'Verification failed. Try again.');
  } finally {
    document.getElementById('quick-verify-btn').disabled = false;
    document.getElementById('verify-current').disabled = false;
  }
}

function showPopupResult(result, originalData) {
  const resultArea = document.getElementById('popup-result');
  const score  = result.truthScore || 0;
  const status = result.status || 'unknown';
  const claim  = result.claim || originalData.claim;

  const themes = {
    'true':         { color: '#16a34a', bg: '#dcfce7', label: '✅ TRUE' },
    'mostly-true':  { color: '#2563eb', bg: '#dbeafe', label: '✔️ MOSTLY TRUE' },
    'disputed':     { color: '#d97706', bg: '#fef3c7', label: '⚠️ DISPUTED' },
    'mostly-false': { color: '#dc2626', bg: '#fee2e2', label: '❌ MOSTLY FALSE' },
    'false':        { color: '#991b1b', bg: '#fee2e2', label: '🚫 FALSE' },
  };
  const t = themes[status] || { color: '#6b7280', bg: '#f3f4f6', label: status.toUpperCase() };

  const claimDisplay = claim.length > 100 ? claim.substring(0, 100) + '…' : claim;
  const explanation = (result.explanation || '').substring(0, 180) + ((result.explanation || '').length > 180 ? '…' : '');

  resultArea.innerHTML = `
    <div class="popup-result-card">
      <div class="popup-score-row" style="background:${t.bg}">
        <span class="popup-score-val" style="color:${t.color}">${score}%</span>
        <span class="popup-status-badge" style="background:rgba(0,0,0,0.1);color:${t.color}">${t.label}</span>
      </div>
      <div class="popup-claim-text">"${claimDisplay}"</div>
      <div class="popup-explanation">${explanation}</div>
      <div class="popup-actions">
        <button class="popup-action-btn popup-action-primary" id="popup-full-btn">View Full Report</button>
        <button class="popup-action-btn popup-action-secondary" id="popup-share-btn">Share</button>
      </div>
    </div>
  `;

  document.getElementById('popup-full-btn').addEventListener('click', () => {
    if (result.id) openTab(`${BASE_URL}/result/${result.id}`);
  });

  document.getElementById('popup-share-btn').addEventListener('click', () => {
    const text = `"${claim.substring(0, 100)}" - Truth Score: ${score}% | Verified by TruthLens AI\n${BASE_URL}/result/${result.id || ''}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        document.getElementById('popup-share-btn').textContent = '✅ Copied!';
      });
    }
  });

  // Refresh recent list
  loadRecentVerifications();
}

function showPopupError(msg) {
  const resultArea = document.getElementById('popup-result');
  resultArea.innerHTML = `
    <div style="padding:14px;background:#fee2e2;border-radius:10px;border:1px solid #fca5a5;">
      <p style="font-size:12.5px;color:#991b1b;font-weight:600;margin:0 0 6px">❌ Verification Failed</p>
      <p style="font-size:12px;color:#7f1d1d;margin:0;line-height:1.5">${msg}</p>
    </div>
  `;
}

function showHelp() {
  const resultArea = document.getElementById('popup-result');
  resultArea.style.display = 'block';
  resultArea.className = 'visible';
  resultArea.innerHTML = `
    <div style="padding:14px;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;">
      <p style="font-size:12.5px;font-weight:700;color:#166534;margin:0 0 8px">How to Use TruthLens AI</p>
      <ul style="font-size:12px;color:#15803d;margin:0;padding-left:16px;line-height:1.8">
        <li>Type a claim or paste a URL above and press <strong>Go</strong></li>
        <li>Click <strong>Verify Current Page</strong> to fact-check what you're reading</li>
        <li><strong>Right-click</strong> any text, image, or link → Verify with TruthLens</li>
        <li><strong>Highlight text</strong> on any page → click the Verify bubble</li>
        <li>Look for the blue <strong>floating button</strong> on news sites</li>
      </ul>
    </div>
  `;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function openTab(url) {
  chrome.tabs.create({ url });
}

function scoreColor(score) {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#2563eb';
  if (score >= 40) return '#d97706';
  return '#dc2626';
}
