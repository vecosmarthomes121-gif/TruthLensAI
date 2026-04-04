# TruthLens AI Browser Extension v2.0

AI-powered fact-checking on every webpage — verify text, articles, images, and links without leaving the site.

---

## 🚀 How Users Install It (After You Publish)

Once you publish to the Chrome Web Store, **regular users don't need any technical steps**:

1. Share your Chrome Web Store link
2. User clicks **"Add to Chrome"**
3. User clicks **"Add Extension"** in the popup
4. Done — extension is active on every website automatically

That's it. No developer mode. No ZIP files. No technical knowledge required.

---

## Publishing to Chrome Web Store (Recommended)

This makes the extension available to everyone with one click.

### Steps

1. **Download your project**
   - Click the Download button in OnSpace (top-right toolbar)
   - Unzip the downloaded file

2. **Create the extension ZIP**
   - Inside the unzipped project, find the `browser-extension/` folder
   - Zip just that folder → `browser-extension.zip`

3. **Register as a Chrome developer**
   - Go to: https://chrome.google.com/webstore/devconsole
   - Sign in with a Google account
   - Pay the one-time **$5 registration fee**

4. **Upload your extension**
   - Click **"New Item"** → upload `browser-extension.zip`
   - Fill in: name, description, category (Productivity / News)
   - Add screenshots (at least 1 required — use the popup or overlay UI)
   - Set visibility to **Public**

5. **Submit for review**
   - Click **"Submit for Review"**
   - Google reviews extensions in **1–3 business days**
   - You'll receive an email when approved

6. **Share your link**
   - Once live, copy the Web Store URL and share it
   - Users install in one click — permission prompt asks only once

### Cost
- One-time developer registration: **$5**
- Unlimited installs, no per-user cost

---

## Developer / Tester Install (No fee — for testing only)

> ⚠️ This requires Developer Mode and may reset after Chrome updates. Not suitable for regular users.

### Chrome / Edge / Brave

1. Open **chrome://extensions/** (or **edge://extensions/**)
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** → select the `browser-extension/` folder
4. The TruthLens shield icon appears in your toolbar

### Firefox

1. Open **about:debugging#/runtime/this-firefox**
2. Click **Load Temporary Add-on**
3. Select `browser-extension/manifest.json`
4. *(Disappears after Firefox restart — use Web Store version for permanent install)*

---

## How to Use the Extension

### Method 1 — Extension Popup
1. Click the TruthLens icon in your toolbar
2. Type or paste a claim/URL into the input field
3. Press **Enter** or **Go**
4. Results appear inline

### Method 2 — Floating Button (News/Social Sites)
- A blue **"Verify Page"** button appears bottom-right on news articles
- Click it to fact-check the entire page with one tap

### Method 3 — Text Selection
1. Highlight any text (15–600 characters)
2. A **"Verify with TruthLens"** bubble appears near your cursor
3. Click it — results open in a modal without leaving the page

### Method 4 — Right-Click Context Menu
| What you right-click | Menu item |
|---|---|
| Selected text | 🔍 Verify with TruthLens AI |
| Any image | 🖼️ Check Image Authenticity |
| Any hyperlink | 📰 Fact-Check This Article |
| Blank page area | ✅ Verify This Page |

---

## Supported Sites (Floating Button)

News: CNN, BBC, Reuters, AP News, NYT, WaPo, The Guardian, Fox News, NBC, ABC, CBS, USA Today, WSJ, Bloomberg, Al Jazeera, The Atlantic, Politico, Axios, Vox, HuffPost, Daily Mail, The Independent, Financial Times, Time, Newsweek

Social: Twitter/X, Facebook, Instagram, TikTok, Reddit, LinkedIn, YouTube, Threads

*Text selection & right-click work on **all websites**.*

---

## What Users See

Each verification shows:
- **Truth Score** (0–100%) with animated donut chart
- **Verdict** badge (TRUE / MOSTLY TRUE / DISPUTED / MOSTLY FALSE / FALSE)
- **AI Analysis** — plain-language explanation
- **Top Sources** — up to 4 credibility-rated links
- **Full Report link** — opens complete analysis on TruthLens web app

---

## Privacy

- No browsing data is collected or stored externally
- API calls are made **only when you explicitly trigger verification**
- Locally cached: last 5 results (browser storage only, never synced)

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Extension icon missing | Click the puzzle-piece icon → pin TruthLens |
| Verification times out | Check internet connection; AI analysis can take up to 60s |
| Floating button missing | Only shown on article pages; use right-click or text selection |
| Content script blocked | Some CSP-strict sites block extensions; use popup input |
| Firefox extension disappears | Must reload after restart (temporary add-on limitation) |

---

## Version History

**v2.0.0** — Complete rewrite: in-popup verification, overlay UI, smarter site detection, recent verifications, better error handling  
**v1.0.0** — Initial release

---

**Support:** contact@onspace.ai | **Website:** https://doztmrzytayxhgjbdozt.onspace.app
