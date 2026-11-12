// Service worker: app shell offline (cache-first); la IA siempre va por red.
const VERSION = 'iv-v0.2.0';
const SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/ai.js',
  './js/store.js',
  './js/data/niveles.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './fonts/alfa-slab-one-latin-400-normal.woff2',
  './fonts/instrument-sans-latin-400-normal.woff2',
  './fonts/instrument-sans-latin-400-italic.woff2',
  './fonts/instrument-sans-latin-600-normal.woff2',
  './fonts/instrument-sans-latin-700-normal.woff2',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request).then((res) => {
      if (res.ok) { const copia = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copia)); }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
