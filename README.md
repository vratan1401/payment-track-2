# Payment Track 2.0
**The new way to spend.**

A PWA personal finance tracker backed by your own Google Sheet.

---

## Deploy to GitHub Pages

```bash
# 1. Create a new repo: vratan1401/payment-track-2 (or any name)
# 2. Clone it and copy these files in
git clone https://github.com/vratan1401/payment-track-2
cp -r * payment-track-2/
cd payment-track-2
git add .
git commit -m "Payment Track 2.0"
git push

# 3. Go to repo Settings → Pages → Source: Deploy from branch → main / root
# 4. Your app is live at: https://vratan1401.github.io/payment-track-2
```

---

## Google Cloud Setup (one-time)

Your OAuth Client ID is already baked in. Just make sure:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials → your OAuth 2.0 Client
3. Add `https://vratan1401.github.io` to **Authorized JavaScript origins**
4. Add any test users under OAuth consent screen → Test users

---

## How it works

- Sign in with Google OAuth
- App finds or creates a Google Sheet named `payment-track-2` in your Drive
- All expenses, budgets, and modes are read/written directly to that sheet
- Each user who signs in gets their own isolated sheet
- Data persists forever in your Google Drive — uninstall the app, your data stays

---

## Install on phone

- **Android**: Open in Chrome → three dots menu → "Add to Home Screen"
- **iPhone**: Open in Safari → Share → "Add to Home Screen"

---

## File structure

```
index.html          Main shell + CSS design system
manifest.json       PWA manifest (installable)
sw.js               Service worker (offline support)
src/
  tweaks-panel.jsx  Design tweaks panel
  gapi.jsx          Google Auth + Sheets API
  data.jsx          Data helpers + categories
  primitives.jsx    UI components (Stamp, LedgerBar, etc.)
  screens.jsx       All app screens
  app.jsx           Main app, routing, state
icons/
  icon-192.png
  icon-512.png
```
