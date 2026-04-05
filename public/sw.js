// Service worker — network-first for navigation, auto-reload on new deploy

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', e => {
  e.waitUntil(
    self.clients.claim().then(() =>
      self.clients.matchAll({ type: 'window' }).then(clients =>
        clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' }))
      )
    )
  )
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
