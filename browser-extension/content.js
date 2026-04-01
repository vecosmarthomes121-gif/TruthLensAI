// TruthLens AI Content Script v2.0
(function() {
  'use strict';

  // Prevent double injection
  if (window.__truthlensLoaded) return;
  window.__truthlensLoaded = true;

  let resultOverlay = null;
  let quickVerifyBtn = null;
  let currentSelection = '';
  let selectionTimeout = null;

  // ─── Initialization ────────────────────────────────────────────────────────
  function init() {
    injectFloatingButton();
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);
    chrome.runtime.onMessage.addListener(onMessage);
    console.log('[TruthLens AI] Content script ready');
  }

  // ─── Floating Verify Button ────────────────────────────────────────────────
  function injectFloatingButton() {
    if (!shouldShowFloatingButton()) return;

    const btn = document.createElement('div');
    btn.id = 'truthlens-fab';
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-label', 'Verify this page with TruthLens AI');
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Verify Page</span>
    `;
    btn.addEventListener('click', verifyCurrentPage);
    document.body.appendChild(btn);
  }

  function shouldShowFloatingButton() {
    const host = location.hostname.replace('www.', '');
    const newsSites = [
      'cnn.com','bbc.com','bbc.co.uk','reuters.com','apnews.com','nytimes.com',
      'washingtonpost.com','theguardian.com','foxnews.com','nbcnews.com',
      'abcnews.go.com','cbsnews.com','usatoday.com','wsj.com','bloomberg.com',
      'aljazeera.com','theatlantic.com','politico.com','axios.com','vox.com',
      'huffpost.com','dailymail.co.uk','mirror.co.uk','independent.co.uk',
      'telegraph.co.uk','ft.com','time.com','newsweek.com','thedailybeast.com',
      'twitter.com','x.com','facebook.com','instagram.com','tiktok.com',
      'reddit.com','linkedin.com','youtube.com','threads.net','mastodon.social'
    ];
    if (newsSites.some(s => host.includes(s))) return true;
    // Heuristic: does page have article content?
    return !!(
      document.querySelector('article') ||
      document.querySelector('[role="article"]') ||
      document.querySelector('[itemprop="articleBody"]') ||
      document.querySelector('.post-content, .article-body, .entry-content, .story-body')
    );
  }

  // ─── Text Selection Quick-Verify ───────────────────────────────────────────
  function onMouseUp(e) {
    // Don't trigger inside our own overlay
    if (e.target && e.target.closest && e.target.closest('#truthlens-overlay, #truthlens-fab')) return;

    clearTimeout(selectionTimeout);
    selectionTimeout = setTimeout(() => {
      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : '';
      if (text.length >= 15 && text.length <= 600) {
        currentSelection = text;
        showQuickVerifyBtn(e.pageX, e.pageY);
      } else {
        removeQuickVerifyBtn();
      }
    }, 300);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      removeResultOverlay();
      removeQuickVerifyBtn();
    }
  }

  function showQuickVerifyBtn(x, y) {
    removeQuickVerifyBtn();

    const btn = document.createElement('button');
    btn.id = 'truthlens-quick-verify';
    btn.setAttribute('aria-label', 'Verify selected text with TruthLens AI');
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Verify with TruthLens
    `;

    // Position relative to viewport
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    btn.style.left = Math.min(x - scrollX, window.innerWidth - 220) + 'px';
    btn.style.top = (y - scrollY - 50) + 'px';

    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const textToVerify = currentSelection;
      removeQuickVerifyBtn();
      startVerification({ claim: textToVerify, inputType: 'text' });
    });

    document.body.appendChild(btn);
    quickVerifyBtn = btn;

    // Auto-dismiss after 6 seconds
    setTimeout(removeQuickVerifyBtn, 6000);
  }

  function removeQuickVerifyBtn() {
    if (quickVerifyBtn) { quickVerifyBtn.remove(); quickVerifyBtn = null; }
    const existing = document.getElementById('truthlens-quick-verify');
    if (existing) existing.remove();
  }

  // ─── Message Handler ───────────────────────────────────────────────────────
  function onMessage(request, sender, sendResponse) {
    if (request.action === 'verify' && request.data) {
      startVerification(request.data);
    }
  }

  // ─── Verification Flow ─────────────────────────────────────────────────────
  function verifyCurrentPage() {
    startVerification({ claim: location.href, inputType: 'url' });
  }

  function startVerification(data) {
    removeQuickVerifyBtn();
    showLoadingOverlay(data);

    chrome.runtime.sendMessage(
      { action: 'verifyContent', data },
      (response) => {
        if (chrome.runtime.lastError) {
          showError('Extension error: ' + chrome.runtime.lastError.message);
          return;
        }
        if (response && response.success) {
          showResult(response.result, data);
        } else {
          showError((response && response.error) || 'Verification failed. Please try again.');
        }
      }
    );
  }

  // ─── Overlay UI ────────────────────────────────────────────────────────────
  function createOverlay(bodyContent) {
    removeResultOverlay();

    const overlay = document.createElement('div');
    overlay.id = 'truthlens-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'TruthLens AI Verification');

    overlay.innerHTML = `
      <div class="tl-modal" role="document">
        <div class="tl-header">
          <div class="tl-brand">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>TruthLens AI</span>
          </div>
          <button class="tl-close" aria-label="Close" id="tl-close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="tl-body" id="tl-body">
          ${bodyContent}
        </div>
      </div>
    `;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) removeResultOverlay();
    });

    document.body.appendChild(overlay);
    resultOverlay = overlay;

    document.getElementById('tl-close-btn').addEventListener('click', removeResultOverlay);

    return overlay;
  }

  function showLoadingOverlay(data) {
    const truncated = data.claim.length > 80 ? data.claim.substring(0, 80) + '…' : data.claim;
    const typeLabel = { text: 'Text Claim', url: 'Web Article', image: 'Image', video: 'Video' }[data.inputType] || data.inputType;

    createOverlay(`
      <div class="tl-loading">
        <div class="tl-spinner">
          <div class="tl-spinner-ring"></div>
        </div>
        <h3>Analyzing with AI...</h3>
        <div class="tl-claim-preview">
          <span class="tl-type-badge">${typeLabel}</span>
          <p>${truncated}</p>
        </div>
        <p class="tl-loading-sub">Searching global sources · AI analysis in progress</p>
      </div>
    `);
  }

  function showResult(result, originalData) {
    const score = result.truthScore || 0;
    const status = result.status || 'unknown';
    const claim = result.claim || originalData.claim;

    const colorMap = {
      'true':         { color: '#16a34a', bg: '#dcfce7', label: 'TRUE', emoji: '✅' },
      'mostly-true':  { color: '#2563eb', bg: '#dbeafe', label: 'MOSTLY TRUE', emoji: '✔️' },
      'disputed':     { color: '#d97706', bg: '#fef3c7', label: 'DISPUTED', emoji: '⚠️' },
      'mostly-false': { color: '#dc2626', bg: '#fee2e2', label: 'MOSTLY FALSE', emoji: '❌' },
      'false':        { color: '#991b1b', bg: '#fee2e2', label: 'FALSE', emoji: '🚫' },
    };
    const theme = colorMap[status] || { color: '#6b7280', bg: '#f3f4f6', label: status.toUpperCase(), emoji: '❓' };

    const arcPercent = score / 100;
    const circumference = 2 * Math.PI * 40;
    const dashOffset = circumference * (1 - arcPercent);

    const sourcesHTML = (result.sources || []).slice(0, 4).map(s => `
      <a class="tl-source-item" href="${s.url}" target="_blank" rel="noopener noreferrer">
        <div class="tl-source-meta">
          <span class="tl-source-name">${s.name}</span>
          <span class="tl-source-credibility" style="color:${s.credibility >= 70 ? '#16a34a' : '#d97706'}">${s.credibility}%</span>
        </div>
        <p class="tl-source-excerpt">${(s.excerpt || '').substring(0, 100)}${(s.excerpt || '').length > 100 ? '…' : ''}</p>
      </a>
    `).join('');

    const claimDisplay = claim.length > 120 ? claim.substring(0, 120) + '…' : claim;
    const resultId = result.id || '';

    if (resultOverlay) {
      document.getElementById('tl-body').innerHTML = `
        <div class="tl-result">
          <!-- Claim -->
          <div class="tl-result-claim">
            "${claimDisplay}"
          </div>

          <!-- Score -->
          <div class="tl-score-section" style="--score-color:${theme.color};--score-bg:${theme.bg}">
            <div class="tl-donut-wrap">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="10"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="${theme.color}" stroke-width="10"
                  stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
                  stroke-linecap="round" transform="rotate(-90 50 50)"
                  style="transition:stroke-dashoffset 0.8s ease"/>
                <text x="50" y="46" text-anchor="middle" fill="${theme.color}" font-size="18" font-weight="800" font-family="-apple-system,sans-serif">${score}</text>
                <text x="50" y="62" text-anchor="middle" fill="${theme.color}" font-size="9" font-weight="600" font-family="-apple-system,sans-serif">%</text>
              </svg>
            </div>
            <div class="tl-verdict" style="background:${theme.bg};color:${theme.color}">
              ${theme.emoji} ${theme.label}
            </div>
          </div>

          <!-- Explanation -->
          <div class="tl-section">
            <div class="tl-section-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              AI Analysis
            </div>
            <p class="tl-explanation">${result.explanation || 'No explanation available.'}</p>
          </div>

          <!-- Sources -->
          ${sourcesHTML ? `
          <div class="tl-section">
            <div class="tl-section-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Sources (${(result.sources || []).length})
            </div>
            <div class="tl-sources-list">${sourcesHTML}</div>
          </div>
          ` : ''}

          <!-- Actions -->
          <div class="tl-actions">
            ${resultId ? `
            <button class="tl-btn-primary" id="tl-full-report">
              View Full Report
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            ` : ''}
            <button class="tl-btn-secondary" id="tl-share-result">
              Share
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="tl-btn-secondary" id="tl-verify-again">
              Re-Verify
            </button>
          </div>
        </div>
      `;

      // Wire up action buttons
      const fullReportBtn = document.getElementById('tl-full-report');
      if (fullReportBtn) {
        fullReportBtn.addEventListener('click', () => {
          chrome.runtime.sendMessage({ action: 'openFullResult', id: resultId });
        });
      }

      const shareBtn = document.getElementById('tl-share-result');
      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          const shareText = `"${claim.substring(0, 100)}" - Truth Score: ${score}% | Verified by TruthLens AI`;
          if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
              shareBtn.textContent = '✅ Copied!';
              setTimeout(() => { shareBtn.textContent = 'Share'; }, 2000);
            });
          }
        });
      }

      const reVerifyBtn = document.getElementById('tl-verify-again');
      if (reVerifyBtn) {
        reVerifyBtn.addEventListener('click', () => {
          startVerification(originalData);
        });
      }
    }
  }

  function showError(message) {
    if (!resultOverlay) return;
    document.getElementById('tl-body').innerHTML = `
      <div class="tl-error">
        <div class="tl-error-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h3>Verification Failed</h3>
        <p>${message}</p>
        <button class="tl-btn-primary" id="tl-dismiss-error">Dismiss</button>
      </div>
    `;
    document.getElementById('tl-dismiss-error')?.addEventListener('click', removeResultOverlay);
  }

  function removeResultOverlay() {
    if (resultOverlay) { resultOverlay.remove(); resultOverlay = null; }
    const el = document.getElementById('truthlens-overlay');
    if (el) el.remove();
  }

  // ─── Boot ──────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
