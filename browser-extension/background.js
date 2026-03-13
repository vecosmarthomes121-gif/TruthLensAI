// TruthLens AI Background Service Worker

const TRUTHLENS_API = 'https://doztmrzytayxhgjbdozt.backend.onspace.ai/functions/v1/verify-claim';

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  // Context menu for selected text
  chrome.contextMenus.create({
    id: 'verify-text',
    title: 'Verify with TruthLens AI',
    contexts: ['selection']
  });

  // Context menu for images
  chrome.contextMenus.create({
    id: 'verify-image',
    title: 'Verify Image with TruthLens AI',
    contexts: ['image']
  });

  // Context menu for links
  chrome.contextMenus.create({
    id: 'verify-link',
    title: 'Verify Article with TruthLens AI',
    contexts: ['link']
  });

  console.log('TruthLens AI extension installed');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  let verificationData = {};

  if (info.menuItemId === 'verify-text' && info.selectionText) {
    verificationData = {
      claim: info.selectionText,
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
  }

  // Send verification request to content script
  if (tab.id && Object.keys(verificationData).length > 0) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'verify',
      data: verificationData
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'verifyContent') {
    // Make API call to TruthLens
    verifyWithTruthLens(request.data)
      .then(result => {
        sendResponse({ success: true, result });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    
    return true; // Keep channel open for async response
  }
});

// Verify content with TruthLens API
async function verifyWithTruthLens(data) {
  try {
    const response = await fetch(TRUTHLENS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        claim: data.claim,
        inputType: data.inputType,
        mediaUrl: data.mediaUrl
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Verification failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('TruthLens API error:', error);
    throw error;
  }
}
