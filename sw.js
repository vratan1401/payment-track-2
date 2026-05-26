// Payment Track 2.0 — Service Worker
const CACHE = 'pt2-v1';
const PRECACHE = [
  './',
  './index.html',
  './src/tweaks-panel.jsx',
  './src/gapi.jsx',
  './src/data.jsx',
  './src/primitives.jsx',
  './src/screens.jsx',
  './src/app.jsx',
  './manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Don't intercept Google API calls
  if (e.request.url.includes('googleapis.com') ||
      e.request.url.includes('accounts.google.com') ||
      e.request.url.includes('fonts.g')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
