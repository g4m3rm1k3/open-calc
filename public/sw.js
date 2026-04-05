// Service worker — network-first for navigation, user-triggered reload on new deploy

// Don't auto-skipWaiting — wait for the page to send SKIP_WAITING so the
// update banner shows BEFORE the page reloads, not during the reload.
self.addEventListener('install', () => {})

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim())
})

// Page sends this when user clicks "Reload" in the update banner.
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', e => {
  // Navigation requests (the HTML page) — always go to network so we never
  // serve a stale index.html that references old asset hashes.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    )
  }
  // All other requests (hashed assets, etc.) pass through unchanged.
})
