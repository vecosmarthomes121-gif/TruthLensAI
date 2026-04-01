// TruthLens AI Background Service Worker v2.0

const TRUTHLENS_API = 'https://doztmrzytayxhgjbdozt.backend.onspace.ai/functions/v1/verify-claim';
const TRUTHLENS_BASE_URL = 'https://doztmrzytayxhgjbdozt.onspace.app';

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  // Context menu for selected text
  chrome.contextMenus.create({
    id: 'verify-text',
    title: '🔍 Verify with TruthLens AI',
    contexts: ['selection']
  });

  // Context menu for images
  chrome.contextMenus.create({
    id: 'verify-image',
    title: '🖼️ Check Image Authenticity',
    contexts: ['image']
  });

  // Context menu for links/articles
  chrome.contextMenus.create({
    id: 'verify-link',
    title: '📰 Fact-Check This Article',
    contexts: ['link']
  });

  // Context menu for current page
  chrome.contextMenus.create({
    id: 'verify-page',
    title: '✅ Verify This Page',
    contexts: ['page']
  });

  console.log('[TruthLens AI] Extension installed successfully');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  let verificationData = null;

  if (info.menuItemId === 'verify-text' && info.selectionText) {
    verificationData = {
      claim: info.selectionText.trim(),
      inputType: 'text'
    };
  } else if (info.menuItemId === 'verify-image' && info.srcUrl) {
    verificationData = {
      claim: info.srcUrl,
      inputType: 'image',
      mediaUrl: info.srcUrl
    };
  } else if (info.menuItemId === 'verify-link' && info.linkUrl) {
    verificationData = {
      claim: info.linkUrl,
      inputType: 'url'
    };
  } else if (info.menuItemId === 'verify-page') {
    verificationData = {
      claim: tab.url,
      inputType: 'url'
    };
  }

  if (tab && tab.id && verificationData) {
    // Inject content script first if needed, then send message
    chrome.scripting.executeScript(
      { target: { tabId: tab.id }, func: () => window.__truthlensLoaded },
    ).then(results => {
      const isLoaded = results && results[0] && results[0].result;
      if (isLoaded) {
        chrome.tabs.sendMessage(tab.id, { action: 'verify', data: verificationData });
      } else {
        // Inject content script then send message
        Promise.all([
          chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] }),
          chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['styles.css'] })
        ]).then(() => {
          setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, { action: 'verify', data: verificationData });
          }, 200);
        });
      }
    }).catch(() => {
      chrome.tabs.sendMessage(tab.id, { action: 'verify', data: verificationData });
    });
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'verifyContent') {
    verifyWithTruthLens(request.data)
      .then(result => {
        // Increment verification count in storage
        chrome.storage.local.get(['totalVerifications'], (stored) => {
          const newTotal = (stored.totalVerifications || 0) + 1;
          chrome.storage.local.set({ totalVerifications: newTotal });
          
          // Store recent verification for popup display
          chrome.storage.local.get(['recentVerifications'], (recentData) => {
            const recent = recentData.recentVerifications || [];
            recent.unshift({
              id: result.id,
              claim: request.data.claim.substring(0, 80),
              truthScore: result.truthScore,
              status: result.status,
              timestamp: Date.now()
            });
            // Keep only 5 most recent
            chrome.storage.local.set({ recentVerifications: recent.slice(0, 5) });
          });
        });

        sendResponse({ success: true, result });
      })
      .catch(error => {
        console.error('[TruthLens AI] Verification error:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep channel open for async response
  }

  if (request.action === 'getBaseUrl') {
    sendResponse({ url: TRUTHLENS_BASE_URL });
    return true;
  }

  if (request.action === 'openFullResult') {
    chrome.tabs.create({ url: `${TRUTHLENS_BASE_URL}/result/${request.id}` });
    return true;
  }
});

// Verify content with TruthLens API
async function verifyWithTruthLens(data) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetch(TRUTHLENS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvenRtcnp5dGF5eGhnamJkb3p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTY3NDUsImV4cCI6MjA1OTA3Mjc0NX0.CJ_qFJcMSJ3rniicU_XPRJrg4JwS2OEfZRWH4cBP5Xo',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvenRtcnp5dGF5eGhnamJkb3p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTY3NDUsImV4cCI6MjA1OTA3Mjc0NX0.CJ_qFJcMSJ3rniicU_XPRJrg4JwS2OEfZRWH4cBP5Xo',
      },
      body: JSON.stringify({
        claim: data.claim,
        inputType: data.inputType,
        mediaUrl: data.mediaUrl || null
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`[${response.status}] ${errorText || 'Verification service error'}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
}
