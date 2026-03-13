// TruthLens AI Content Script

let verifyButton = null;
let resultOverlay = null;
let currentSelection = '';

// Initialize extension
function init() {
  console.log('TruthLens AI extension loaded');
  
  // Add floating verify button for news articles
  addFloatingVerifyButton();
  
  // Listen for text selection
  document.addEventListener('mouseup', handleTextSelection);
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener(handleMessage);
}

// Add floating "Verify" button on news articles
function addFloatingVerifyButton() {
  // Detect if page is a news article or social media post
  const isNewsArticle = detectNewsArticle();
  
  if (!isNewsArticle) return;
  
  // Create floating button
  const button = document.createElement('div');
  button.id = 'truthlens-floating-button';
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>Verify with TruthLens</span>
  `;
  button.title = 'Verify this article with TruthLens AI';
  
  button.addEventListener('click', () => {
    verifyCurrentPage();
  });
  
  document.body.appendChild(button);
  verifyButton = button;
}

// Detect if current page is a news article or social media post
function detectNewsArticle() {
  const hostname = window.location.hostname;
  
  // News sites
  const newsSites = [
    'cnn.com', 'bbc.com', 'reuters.com', 'apnews.com', 'nytimes.com',
    'washingtonpost.com', 'theguardian.com', 'foxnews.com', 'nbcnews.com',
    'abcnews.go.com', 'cbsnews.com', 'usatoday.com', 'wsj.com', 'bloomberg.com'
  ];
  
  // Social media
  const socialSites = [
    'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'tiktok.com',
    'reddit.com', 'linkedin.com'
  ];
  
  const isNews = newsSites.some(site => hostname.includes(site));
  const isSocial = socialSites.some(site => hostname.includes(site));
  
  // Also check for article indicators
  const hasArticle = !!(
    document.querySelector('article') ||
    document.querySelector('[role="article"]') ||
    document.querySelector('.post-content') ||
    document.querySelector('.article-body')
  );
  
  return isNews || isSocial || hasArticle;
}

// Handle text selection
function handleTextSelection(event) {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText.length > 10 && selectedText.length < 500) {
    currentSelection = selectedText;
    showQuickVerifyButton(event);
  } else {
    hideQuickVerifyButton();
  }
}

// Show quick verify button near selection
function showQuickVerifyButton(event) {
  hideQuickVerifyButton();
  
  const button = document.createElement('div');
  button.id = 'truthlens-quick-verify';
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>
    </svg>
    Verify
  `;
  
  button.style.left = `${event.pageX + 10}px`;
  button.style.top = `${event.pageY - 40}px`;
  
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    verifyText(currentSelection);
    hideQuickVerifyButton();
  });
  
  document.body.appendChild(button);
  
  // Auto-hide after 5 seconds
  setTimeout(hideQuickVerifyButton, 5000);
}

function hideQuickVerifyButton() {
  const existingButton = document.getElementById('truthlens-quick-verify');
  if (existingButton) {
    existingButton.remove();
  }
}

// Verify current page
function verifyCurrentPage() {
  showLoadingOverlay();
  
  const pageData = {
    claim: window.location.href,
    inputType: 'url'
  };
  
  chrome.runtime.sendMessage(
    { action: 'verifyContent', data: pageData },
    handleVerificationResponse
  );
}

// Verify selected text
function verifyText(text) {
  showLoadingOverlay();
  
  const textData = {
    claim: text,
    inputType: 'text'
  };
  
  chrome.runtime.sendMessage(
    { action: 'verifyContent', data: textData },
    handleVerificationResponse
  );
}

// Handle messages from background script
function handleMessage(request, sender, sendResponse) {
  if (request.action === 'verify') {
    showLoadingOverlay();
    
    chrome.runtime.sendMessage(
      { action: 'verifyContent', data: request.data },
      handleVerificationResponse
    );
  }
}

// Show loading overlay
function showLoadingOverlay() {
  hideResultOverlay();
  
  const overlay = document.createElement('div');
  overlay.id = 'truthlens-overlay';
  overlay.innerHTML = `
    <div class="truthlens-modal">
      <div class="truthlens-header">
        <h3>TruthLens AI</h3>
        <button class="truthlens-close" id="truthlens-close">×</button>
      </div>
      <div class="truthlens-body">
        <div class="truthlens-loading">
          <div class="spinner"></div>
          <p>Analyzing with AI and verifying against global sources...</p>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  resultOverlay = overlay;
  
  document.getElementById('truthlens-close').addEventListener('click', hideResultOverlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideResultOverlay();
  });
}

// Handle verification response
function handleVerificationResponse(response) {
  if (!response) {
    showError('No response from verification service');
    return;
  }
  
  if (response.success) {
    showResult(response.result);
  } else {
    showError(response.error || 'Verification failed');
  }
}

// Show verification result
function showResult(result) {
  if (!resultOverlay) return;
  
  const truthScore = result.truthScore || 0;
  const status = result.status || 'unknown';
  
  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };
  
  const getStatusLabel = (status) => {
    const labels = {
      'true': 'TRUE',
      'mostly-true': 'MOSTLY TRUE',
      'disputed': 'DISPUTED',
      'mostly-false': 'MOSTLY FALSE',
      'false': 'FALSE'
    };
    return labels[status] || status.toUpperCase();
  };
  
  const sourcesHTML = (result.sources || []).slice(0, 3).map(source => `
    <div class="truthlens-source">
      <div class="source-name">${source.name}</div>
      <div class="source-excerpt">${source.excerpt}</div>
      <a href="${source.url}" target="_blank" class="source-link">Read more →</a>
    </div>
  `).join('');
  
  resultOverlay.querySelector('.truthlens-body').innerHTML = `
    <div class="truthlens-result">
      <div class="truth-score" style="color: ${getScoreColor(truthScore)}">
        <div class="score-value">${truthScore}%</div>
        <div class="score-label">${getStatusLabel(status)}</div>
      </div>
      
      <div class="explanation">
        <h4>Analysis</h4>
        <p>${result.explanation || 'No explanation available'}</p>
      </div>
      
      ${sourcesHTML ? `
        <div class="sources">
          <h4>Sources (${result.sources.length})</h4>
          ${sourcesHTML}
        </div>
      ` : ''}
      
      <div class="truthlens-actions">
        <a href="https://truthlens.ai/result/${result.id}" target="_blank" class="view-full">
          View Full Report →
        </a>
      </div>
    </div>
  `;
}

// Show error message
function showError(message) {
  if (!resultOverlay) return;
  
  resultOverlay.querySelector('.truthlens-body').innerHTML = `
    <div class="truthlens-error">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#ef4444" stroke-width="2"/>
      </svg>
      <h4>Verification Failed</h4>
      <p>${message}</p>
      <button class="truthlens-retry" onclick="location.reload()">Try Again</button>
    </div>
  `;
}

// Hide result overlay
function hideResultOverlay() {
  if (resultOverlay) {
    resultOverlay.remove();
    resultOverlay = null;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
