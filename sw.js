// Minimal service worker — enables "Add to Home Screen" / install prompts and caches the
// app shell so the terminal's UI still loads offline. Live market data always needs a
// network connection regardless, so this intentionally does not cache API responses.
const CACHE_NAME = 'ledger-shell-v1';
const SHELL_FILES = ['./ledger-pro.html', './manifest.json', './icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // only serve the cached app shell for same-origin navigation/asset requests;
  // everything else (Binance/Bybit/etc. API calls) always goes to the network
  if(url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
