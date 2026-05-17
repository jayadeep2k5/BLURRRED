# BLURRRED 👁️‍🗨️

> **Privacy during screen sharing, simplified.**

BLURRRED is a lightweight Chrome extension that automatically blurs WhatsApp Web sidebar chats and message previews — protecting your private conversations during screen sharing, meetings, recordings, and live demos.

---

## Features

-  **Auto-blur** — Sidebar chats blur instantly on page load
-  **Active chat stays readable** — Only the open conversation is visible
-  **Real-time** — MutationObserver handles dynamic WhatsApp updates
-  **One-click toggle** — Enable/disable via the extension popup
-  **Persistent settings** — Your preference is remembered across sessions
-  **100% local** — No data collected, no external servers

---

## Installation (Developer Mode)

### Step 1 — Download the extension

Place the `blurrred/` folder somewhere permanent on your computer (don't delete it after loading).

### Step 2 — Open Chrome Extensions

Open Chrome and navigate to:
```
chrome://extensions
```

Or: **Menu → More Tools → Extensions**

### Step 3 — Enable Developer Mode

Toggle **"Developer mode"** in the top-right corner of the Extensions page.

### Step 4 — Load the extension

Click **"Load unpacked"** and select the `blurrred/` folder.

### Step 5 — Use it!

1. Open [https://web.whatsapp.com](https://web.whatsapp.com)
2. Sidebar chats blur automatically ✅
3. Click any chat to open it — it becomes readable instantly
4. Use the extension popup icon to toggle on/off

---

## How It Works

```
WhatsApp Web loads
       │
       ▼
content.js injects
       │
       ▼
MutationObserver watches DOM
       │
       ▼
Chat rows get .blurrred-item class → CSS blur applied
       │
       ▼
Selected chat gets .blurrred-active class → No blur
       │
       ▼
User opens popup → toggle sends message to content.js
```

---

## File Structure

```
blurrred/
├── manifest.json      ← Extension config (Manifest V3)
├── background.js      ← Service worker (install/update events)
├── content.js         ← Core blur logic + MutationObserver
├── styles.css         ← Blur CSS injected into WhatsApp Web
├── popup.html         ← Extension popup UI
├── popup.js           ← Popup toggle logic
├── popup.css          ← Popup styles
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome (latest) | ✅ Supported |
| Brave | ✅ Supported |
| Edge (Chromium) | ✅ Supported |

---

## Known Limitations

- WhatsApp Web uses obfuscated class names that may change with updates. The extension uses `data-testid` attributes which are more stable, but a WhatsApp redesign may require selector updates.
- Works only on `https://web.whatsapp.com`

---

## Roadmap (Post-MVP)

- [ ] Adjustable blur intensity slider
- [ ] Keyboard shortcut toggle
- [ ] Auto-enable when screen sharing is detected (`getDisplayMedia`)
- [ ] Selective contact unblur (whitelist specific chats)
- [ ] Hover-to-preview
- [ ] Support for Telegram Web, Slack, Discord

---

## Privacy

- ❌ No data collection
- ❌ No analytics
- ❌ No external requests
- ✅ All processing is local-only
- ✅ No message content is ever stored or transmitted

---

## Packaging for Chrome Web Store

1. Zip the entire `blurrred/` folder:
   ```bash
   zip -r blurrred.zip blurrred/
   ```
2. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Fill in store listing details and submit for review

---

*Built with ❤️ for privacy-conscious professionals.*
