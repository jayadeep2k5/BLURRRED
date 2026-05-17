/**
 * BLURRRED – Popup Script
 * Manages the extension toggle UI and communicates with content.js
 */

(() => {
  'use strict';

  const toggle = document.getElementById('blurToggle');
  const statusCard = document.getElementById('statusCard');
  const statusLabel = document.getElementById('statusLabel');
  const statusSub = document.getElementById('statusSub');
  const statusDot = document.getElementById('statusDot');
  const pulseRing = document.getElementById('pulseRing');

  // ─── Update UI based on state ──────────────────────────────────────────────

  function updateUI(enabled) {
    toggle.checked = enabled;

    if (enabled) {
      statusCard.className = 'status-card active';
      statusLabel.textContent = 'Blur Active';
      statusSub.textContent = 'Sidebar chats are hidden';
    } else {
      statusCard.className = 'status-card inactive';
      statusLabel.textContent = 'Blur Off';
      statusSub.textContent = 'Sidebar chats are visible';
    }
  }

  // ─── Check if we're on WhatsApp Web ───────────────────────────────────────

  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  async function isWhatsAppTab(tab) {
    return tab?.url?.startsWith('https://web.whatsapp.com');
  }

  // ─── Load initial state ────────────────────────────────────────────────────

  async function loadState() {
    const tab = await getActiveTab();
    const onWhatsApp = await isWhatsAppTab(tab);

    if (!onWhatsApp) {
      // Not on WhatsApp – show informational state
      statusCard.className = 'status-card';
      statusLabel.textContent = 'Not on WhatsApp Web';
      statusSub.textContent = 'Open web.whatsapp.com first';
      toggle.disabled = true;
      toggle.checked = false;
      statusDot.style.background = '#5a5a6a';
      pulseRing.style.animation = 'none';
      return;
    }

    // Load from storage
    chrome.storage.local.get(['blurrredEnabled'], result => {
      const enabled = result.blurrredEnabled !== false;
      updateUI(enabled);
    });
  }

  // ─── Toggle handler ────────────────────────────────────────────────────────

  toggle.addEventListener('change', async () => {
    const enabled = toggle.checked;

    // Save to storage
    chrome.storage.local.set({ blurrredEnabled: enabled });

    // Update UI immediately
    updateUI(enabled);

    // Send message to content script
    const tab = await getActiveTab();
    if (!tab?.id) return;

    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'BLURRRED_TOGGLE',
        enabled,
      });
    } catch (err) {
      // Content script may not be loaded yet (e.g. extension just installed)
      // Storage value will be picked up on next page load
      console.warn('[BLURRRED popup] Could not reach content script:', err.message);
    }
  });

  // ─── Boot ──────────────────────────────────────────────────────────────────

  loadState();

})();
