/**
 * ClipPIN Extension Popup Logic
 */

// Consolidated Frontend Receiver URL (Configurable for deployment)
const FRONTEND_RECEIVER_URL = 'https://clipspin.netlify.app'; // Or file path / server URL

// DOM References
const pinDisplay = document.getElementById('pin-display');
const snippetDisplay = document.getElementById('snippet-display');
const btnCopyPin = document.getElementById('btn-copy-pin');
const textCopyPin = document.getElementById('text-copy-pin');
const btnOpenWeb = document.getElementById('btn-open-web');

let currentPin = '';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Clear the "NEW" badge text immediately when user views the popup
  try {
    if (chrome.action && chrome.action.setBadgeText) {
      await chrome.action.setBadgeText({ text: '' });
    }
  } catch (e) {
    console.error('[ClipPIN] Failed to clear badge:', e);
  }

  // 2. Retrieve latest stored PIN & snippet from chrome.storage.local
  chrome.storage.local.get(['latestPin', 'latestSnippet'], (data) => {
    if (data.latestPin) {
      currentPin = data.latestPin;
      pinDisplay.textContent = currentPin;
      pinDisplay.classList.remove('pin-empty');

      if (data.latestSnippet) {
        snippetDisplay.textContent = `"${data.latestSnippet}"`;
        snippetDisplay.classList.remove('hidden');
      }
    } else {
      pinDisplay.textContent = 'NONE';
      pinDisplay.classList.add('pin-empty');
      btnCopyPin.disabled = true;
    }
  });

  // 3. Setup Copy PIN listener
  btnCopyPin.addEventListener('click', async () => {
    if (!currentPin) return;

    try {
      await navigator.clipboard.writeText(currentPin);
      textCopyPin.textContent = 'Copied!';
      btnCopyPin.classList.add('btn-success');

      setTimeout(() => {
        textCopyPin.textContent = 'Copy PIN';
        btnCopyPin.classList.remove('btn-success');
      }, 2000);
    } catch (err) {
      console.error('[ClipPIN] Copy PIN error:', err);
    }
  });

  // 4. Setup "Go to Receiver Webpage" listener
  btnOpenWeb.addEventListener('click', () => {
    const url = currentPin ? `${FRONTEND_RECEIVER_URL}?pin=${currentPin}` : FRONTEND_RECEIVER_URL;
    chrome.tabs.create({ url });
  });
});
