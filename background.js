/**
 * BLURRRED – Background Service Worker (Manifest V3)
 *
 * Handles extension install/update events and sets default storage values.
 * Kept minimal – all heavy lifting is in content.js.
 */

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    // Set defaults on first install
    chrome.storage.local.set({
      blurrredEnabled: true,
    });

    console.log('[BLURRRED] Extension installed. Blur enabled by default.');
  }

  if (reason === 'update') {
    console.log('[BLURRRED] Extension updated.');
  }
});
