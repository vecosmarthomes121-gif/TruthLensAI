# TruthLens AI Browser Extension v2.0

AI-powered fact-checking on every webpage — verify text, articles, images, and links without leaving the site.

---

## ✨ What's New in v2.0

- **In-popup verification** — type a claim directly in the extension popup and get results instantly
- **Improved inline overlay** — beautiful modal with donut-chart truth score, detailed sources, and share button
- **Smarter site detection** — floating button now appears on 30+ news sites and all article-type pages
- **Recent verifications** — popup shows your last 5 fact-checks with quick re-open
- **Better error handling** — clear timeout messages and retry options
- **Dark-mode-safe styles** — scoped CSS won't clash with host-page dark themes

---

## Installation

### Chrome / Edge / Brave

1. Open **chrome://extensions/** (or **edge://extensions/**)
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** → select the `browser-extension/` folder
4. The TruthLens shield icon appears in your toolbar

### Firefox

1. Open **about:debugging#/runtime/this-firefox**
2. Click **Load Temporary Add-on**
3. Select `browser-extension/manifest.json`
4. *(For permanent install, extension must be signed by Mozilla)*

---

## How to Use

### Method 1 — Extension Popup
1. Click the TruthLens icon in your toolbar
2. Type or paste a claim/URL into the input field
3. Press **Enter** or **Go**
4. Results appear inline — click **View Full Report** for complete analysis

### Method 2 — Floating Button (News/Social Sites)
- A blue **"Verify Page"** button appears bottom-right on news articles and social media
- Click it to fact-check the entire page with one tap

### Method 3 — Text Selection
1. Highlight any text (15–600 characters) on any webpage
2. A **"Verify with TruthLens"** bubble appears near your cursor
3. Click it — results open in a beautiful overlay without leaving the page

### Method 4 — Right-Click Context Menu
| What you right-click | Menu item |
|---|---|
| Selected text | 🔍 Verify with TruthLens AI |
| Any image | 🖼️ Check Image Authenticity |
| Any hyperlink | 📰 Fact-Check This Article |
| Blank page area | ✅ Verify This Page |

---

## Overlay Controls

| Control | Action |
|---|---|
| **ESC** key | Close overlay |
| Click outside modal | Close overlay |
| **View Full Report** | Opens complete result in new tab |
| **Share** | Copies shareable text to clipboard |
| **Re-Verify** | Runs verification again |

---

## Supported Sites (Floating Button)

News: CNN, BBC, Reuters, AP News, NYT, WaPo, The Guardian, Fox News, NBC, ABC, CBS, USA Today, WSJ, Bloomberg, Al Jazeera, The Atlantic, Politico, Axios, Vox, HuffPost, Daily Mail, The Independent, Financial Times, Time, Newsweek

Social: Twitter/X, Facebook, Instagram, TikTok, Reddit, LinkedIn, YouTube, Threads

*Text selection & right-click work on **all websites**.*

---

## Result Display

Each verification shows:
- **Truth Score** (0–100%) with animated donut chart
- **Verdict** badge (TRUE / MOSTLY TRUE / DISPUTED / MOSTLY FALSE / FALSE)
- **AI Analysis** — plain-language explanation
- **Top Sources** — up to 4 credibility-rated links
- **Full Report link** — opens complete analysis on TruthLens web app

---

## Privacy

- No browsing data is collected or stored externally
- Verification API calls are made **only** when you explicitly trigger them
- Locally cached: verification count + 5 most recent results (stored in browser only)

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Extension icon missing | Click the puzzle-piece icon → pin TruthLens |
| Verification times out | Check internet connection; AI analysis can take up to 60 s |
| Floating button missing | Only shown on article-type pages; use right-click or text selection instead |
| Content script blocked | Some CSP-strict sites block extensions; use the popup input instead |
| Firefox extension disappears | Must reload after Firefox restart (temporary add-on) |

---

## Version History

**v2.0.0** — Complete rewrite: in-popup verification, improved overlay UI, smarter site detection, recent verifications list, better error handling  
**v1.0.0** — Initial release

---

**Support:** contact@onspace.ai | **Website:** https://doztmrzytayxhgjbdozt.onspace.app
