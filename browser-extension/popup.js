// TruthLens AI Popup Script

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  setupEventListeners();
});

// Load user stats from storage
function loadStats() {
  chrome.storage.local.get(['totalVerifications'], (result) => {
    const total = result.totalVerifications || 0;
    document.getElementById('total-verifications').textContent = total;
  });
}

// Setup event listeners
function setupEventListeners() {
  // Verify current page
  document.getElementById('verify-current').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'verify',
          data: {
            claim: tabs[0].url,
            inputType: 'url'
          }
        });
        window.close();
      }
    });
  });

  // Open dashboard
  document.getElementById('open-dashboard').addEventListener('click', () => {
    chrome.tabs.create({
      url: 'https://truthlens.ai/dashboard'
    });
  });

  // View history
  document.getElementById('view-history').addEventListener('click', () => {
    chrome.tabs.create({
      url: 'https://truthlens.ai/history'
    });
  });
}

// Update verification count
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'verificationComplete') {
    chrome.storage.local.get(['totalVerifications'], (result) => {
      const newTotal = (result.totalVerifications || 0) + 1;
      chrome.storage.local.set({ totalVerifications: newTotal });
      document.getElementById('total-verifications').textContent = newTotal;
    });
  }
});
