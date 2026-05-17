/**
 * BLURRRED – Content Script
 * Automatically blurs WhatsApp Web sidebar chats/message previews
 * while keeping the active chat fully readable.
 *
 * Strategy: We inject CSS classes via JS and use a MutationObserver
 * to re-apply blur whenever WhatsApp's React app re-renders the DOM.
 */

(() => {
  'use strict';

  // ─── State ────────────────────────────────────────────────────────────────
  let blurEnabled = true;
  let observer = null;
  let debounceTimer = null;

  // ─── Selector Utilities ───────────────────────────────────────────────────
  /**
   * WhatsApp Web uses obfuscated class names that change with updates.
   * We target structural/semantic attributes that are more stable:
   *  - [data-testid] attributes (most reliable)
   *  - aria roles
   *  - structural patterns
   *
   * We apply a single CSS class `blurrred-item` to blurrable rows,
   * and `blurrred-active` to the currently selected chat row.
   * The actual blur is defined in styles.css.
   */

  const SELECTORS = {
    // The scrollable list of chat rows in the left sidebar
    chatList: '[data-testid="chat-list"]',
    // Individual chat row items
    chatRow: '[data-testid="cell-frame-container"]',
    // The active/selected chat pane (right side)
    activePane: '#main',
    // Chat title text inside a row
    chatTitle: '[data-testid="cell-frame-title"]',
    // Last message preview text
    lastMessage: '[data-testid="last-msg-status"], [data-testid="cell-frame-secondary"]',
    // Unread badge & count
    unreadBadge: '[data-testid="icon-unread-count"]',
    // Media preview thumbnails in sidebar
    mediaThumb: '[data-testid="media-thumb"]',
    // The selected/active chat row (WhatsApp marks it with aria-selected)
    selectedRow: '[aria-selected="true"]',
  };

  const BLUR_CLASS = 'blurrred-item';
  const ACTIVE_CLASS = 'blurrred-active';
  const EXTENSION_ATTR = 'data-blurrred';

  // ─── Core Blur Logic ──────────────────────────────────────────────────────

  /**
   * Apply blur to all sidebar chat rows except the currently selected one.
   */
  function applyBlur() {
    if (!blurEnabled) return;

    const chatRows = document.querySelectorAll(SELECTORS.chatRow);
    const selectedRow = document.querySelector(SELECTORS.selectedRow);

    chatRows.forEach(row => {
      // Mark as processed so CSS knows to blur
      row.setAttribute(EXTENSION_ATTR, 'true');

      if (selectedRow && row.contains(selectedRow) || row === selectedRow) {
        // This is the active chat – keep readable
        row.classList.remove(BLUR_CLASS);
        row.classList.add(ACTIVE_CLASS);
      } else {
        // Blur this sidebar row
        row.classList.add(BLUR_CLASS);
        row.classList.remove(ACTIVE_CLASS);
      }
    });
  }

  /**
   * Remove all blur classes and attributes applied by the extension.
   */
  function removeBlur() {
    document.querySelectorAll(`.${BLUR_CLASS}, .${ACTIVE_CLASS}`).forEach(el => {
      el.classList.remove(BLUR_CLASS, ACTIVE_CLASS);
      el.removeAttribute(EXTENSION_ATTR);
    });
  }

  /**
   * Toggle blur on/off.
   */
  function setBlur(enabled) {
    blurEnabled = enabled;
    if (enabled) {
      applyBlur();
    } else {
      removeBlur();
    }
  }

  // ─── MutationObserver ─────────────────────────────────────────────────────

  /**
   * Debounced re-apply: prevents excessive DOM traversal when WhatsApp
   * re-renders many elements rapidly (e.g. receiving multiple messages).
   */
  function debouncedApply() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyBlur, 80);
  }

  /**
   * Start observing the DOM for WhatsApp's React-driven re-renders.
   */
  function startObserver() {
    if (observer) return;

    observer = new MutationObserver(mutations => {
      if (!blurEnabled) return;

      // Only re-apply if something relevant changed
      const relevant = mutations.some(m =>
        m.type === 'childList' ||
        (m.type === 'attributes' && (
          m.attributeName === 'aria-selected' ||
          m.attributeName === 'class'
        ))
      );

      if (relevant) debouncedApply();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-selected', 'class'],
    });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    clearTimeout(debounceTimer);
  }

  // ─── Initialisation ───────────────────────────────────────────────────────

  /**
   * Wait for WhatsApp to finish loading its UI before we start.
   * We poll for the chat list to appear.
   */
  function waitForWhatsApp(callback, attempts = 0) {
    const chatList = document.querySelector(SELECTORS.chatList);
    if (chatList) {
      callback();
    } else if (attempts < 60) {
      // Retry every 500ms for up to 30 seconds
      setTimeout(() => waitForWhatsApp(callback, attempts + 1), 500);
    }
  }

  function init() {
    // Load saved state from storage
    chrome.storage.local.get(['blurrredEnabled'], result => {
      blurEnabled = result.blurrredEnabled !== false; // default ON

      if (blurEnabled) {
        waitForWhatsApp(() => {
          applyBlur();
          startObserver();
        });
      }
    });
  }

  // ─── Message Listener (from popup) ────────────────────────────────────────

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'BLURRRED_TOGGLE') {
      setBlur(message.enabled);

      if (message.enabled) {
        startObserver();
      } else {
        stopObserver();
      }

      sendResponse({ success: true, enabled: blurEnabled });
    }

    if (message.type === 'BLURRRED_GET_STATE') {
      sendResponse({ enabled: blurEnabled });
    }

    return true; // Keep message channel open for async response
  });

  // ─── Boot ─────────────────────────────────────────────────────────────────
  init();

})();
