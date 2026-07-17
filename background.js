/**
 * ClipPIN Background Service Worker (Manifest V3)
 */

// Consolidated Backend API URL
const API_BASE_URL = 'https://clippin-backend.onrender.com/api';
const CONTEXT_MENU_ID = 'send_to_temp_clip';

// Create right-click context menu item on extension install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: 'Send Selection to Temp Clipboard',
    contexts: ['selection']
  });
  console.log('[ClipPIN Extension] Context menu registered.');
});

// Handle Context Menu Item Clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID) {
    const selectedText = info.selectionText;

    if (!selectedText || selectedText.trim() === '') {
      console.warn('[ClipPIN Extension] Selection was empty.');
      return;
    }

    try {
      // Indicate sending state on badge
      chrome.action.setBadgeText({ text: '...' });
      chrome.action.setBadgeBackgroundColor({ color: '#6366F1' });

      const response = await fetch(`${API_BASE_URL}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: selectedText })
      });

      const data = await response.json();

      if (response.ok && data.pin) {
        // Store latest PIN and a snippet of text in local storage
        await chrome.storage.local.set({
          latestPin: data.pin,
          latestSnippet: selectedText.length > 50 ? selectedText.substring(0, 50) + '...' : selectedText,
          createdTimestamp: Date.now()
        });

        // Set extension badge to "NEW" to alert user
        chrome.action.setBadgeText({ text: 'NEW' });
        chrome.action.setBadgeBackgroundColor({ color: '#6366F1' });

        console.log(`[ClipPIN Extension] Success! New PIN generated: ${data.pin}`);
      } else {
        throw new Error(data.error || 'Server error creating clip.');
      }
    } catch (err) {
      console.error('[ClipPIN Extension] Failed to send clip:', err);
      chrome.action.setBadgeText({ text: 'ERR' });
      chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });
    }
  }
});
