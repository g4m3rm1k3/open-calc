# Lesson 15 — Service Worker and Offline Cache

## What You Will Build

After running any WASM-backed language once, the app works offline. The student can open
Codex, disconnect from the internet, reload the page, and run Python — it works. The
service worker caches Pyodide, sql.js, Fengari, Opal, and JSCPP after the first download.
A "Ready offline" badge appears in the status bar once the cache is populated.

---

## What You Need to Know First

- Lesson 13: Pyodide, CDN lazy loading, the `<script>` injection pattern
- Lesson 14: The WASM registry, all CDN URLs

---

## The Lesson

### Step 1 — What a Service Worker Is

A service worker is a script that runs in a separate thread from the web page. Unlike
the page's JavaScript, a service worker:

- Does not have access to the DOM
- Runs in the background, even when the page is closed (as long as the browser is open)
- Can **intercept every network request** the page makes and respond with whatever it chooses
- Persists across page loads and browser restarts until explicitly unregistered

A service worker is, literally, a programmable proxy that sits between your page and
the network.

**The lifecycle:**
1. **Install** — fired when a new service worker is first registered. The worker is not
   yet controlling any pages. Used to pre-cache known resources.
2. **Activate** — fired when the new worker takes control (after the old worker is replaced).
   Used to clean up old caches.
3. **Fetch** — fired for every network request from controlled pages. The worker can
   respond with a cached resource, fetch from the network, or construct a response.

**The Cache API:**
The Cache API is a persistent storage mechanism for HTTP responses. Unlike `localStorage`
(strings only), the Cache API stores `Request`/`Response` pairs — full HTTP objects with
headers, bodies, and status codes.

```javascript
const cache = await caches.open('codex-wasm-v1')
await cache.put(request, response)
const cached = await cache.match(request)
```

`caches.open('name')` opens (or creates) a named cache. Caches are keyed by name and persist
across sessions. `cache.match(request)` returns a matching `Response` or `undefined`.

**CS lens:** The service worker implements the **cache-aside pattern** (also called
lazy loading): when a resource is requested, check the cache first; if found, serve it;
if not, fetch from the network, store in the cache, then serve it. This pattern is used
at every level of computer systems:
- CPU L1/L2/L3 caches — check faster memory before slower memory
- DNS resolver cache — check local cache before querying a DNS server
- Redis cache in front of a database — check the cache before querying the database
- The browser's own HTTP cache — check the cache before making a network request

The service worker's Cache API is the application-level version of the same concept.

**SE lens:** The service worker is a separate responsibility from the page's JavaScript.
The page is responsible for fetching resources. The service worker is responsible for
caching them. Neither needs to know the other's implementation. This is the separation
of concerns between business logic (what the app does) and infrastructure (how resources
are delivered).

### Step 2 — The Service Worker File

Create `apps/web/public/sw.js`:

```javascript
const CACHE_NAME = 'codex-wasm-v1'

const WASM_URLS_TO_CACHE = [
  'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js',
  'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.asm.wasm',
  'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js',
  'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.wasm',
  'https://cdn.jsdelivr.net/npm/fengari-web@0.1.4/dist/fengari-web.js',
  'https://cdn.opalrb.com/opal/1.7.4/opal.min.js',
  'https://cdn.opalrb.com/opal/1.7.4/opal-parser.min.js',
  'https://cdn.jsdelivr.net/npm/JSCPP@2.1.2/dist/JSCPP.es5.min.js',
]

self.addEventListener('install', (event) => {
  // Do not pre-cache at install time — these files are large.
  // They will be cached when first requested (cache-aside strategy).
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const url = event.request.url

  if (!WASM_URLS_TO_CACHE.some(wasmUrl => url.startsWith(wasmUrl.split('?')[0]))) {
    return
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cachedResponse = await cache.match(event.request)
      if (cachedResponse !== undefined) {
        return cachedResponse
      }

      const networkResponse = await fetch(event.request)
      if (networkResponse.ok) {
        cache.put(event.request, networkResponse.clone())
      }
      return networkResponse
    })
  )
})
```

**Why `sw.js` is in `public/` and not `src/`:**
The `public/` directory contains files that are served as-is, without Vite processing.
A service worker must be served from the same origin as the page, at a specific URL
(typically `/sw.js`). If Vite processed `sw.js`, it might rename or inline it, breaking
the registration. `public/sw.js` → served at `http://localhost:5173/sw.js` exactly.

**`self.skipWaiting()` explained:**
When a new service worker is installed, it waits for all pages controlled by the old worker
to close before it activates. `skipWaiting()` tells the new worker to activate immediately,
replacing the old worker right away. For a development tool where the student is the only
user, this is correct — no need to wait.

**`self.clients.claim()` in `activate`:**
After activation, the service worker takes control of pages that were loaded before it
was activated. Without `claim()`, the service worker only controls pages loaded after
it activates. With `claim()`, it takes over immediately — the current page starts having
its requests intercepted.

**`networkResponse.clone()` explained:**
A `Response` object can be read only once — its body is a stream. `cache.put` reads the
response body to store it. If we `cache.put` the response and then return it, the body
is already consumed and the browser receives an empty response. `.clone()` creates a
second response with the same body, allowing both the cache storage and the browser
response to read the body.

**The fetch handler filter:**
`WASM_URLS_TO_CACHE.some(wasmUrl => url.startsWith(...))` limits caching to the known
WASM CDN URLs. Any other network request (API calls, other CDNs, the app's own files) is
not intercepted — the service worker returns immediately (`return` without calling
`event.respondWith`). Without this filter, the service worker would intercept all
requests — including the app's own development server requests — and potentially serve
stale versions.

**Cleanup in `activate`:**
When `CACHE_NAME` changes (e.g., when WASM library versions are updated), the old cache
(`codex-wasm-v0`) is no longer needed. The `activate` handler deletes all caches except
the current version. This prevents old WASM files from accumulating indefinitely.

**The activate event's `event.waitUntil`:**
`waitUntil` tells the browser to keep the service worker alive until the Promise resolves.
Without it, the browser might terminate the service worker before the cache cleanup
completes. Always wrap async operations in `waitUntil` in `install` and `activate`.

### Step 3 — Registering the Service Worker

In `apps/web/src/main.tsx`:

```typescript
import React from 'react'
import { createRoot } from 'react-dom/client'
import { WebApp } from './WebApp'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(registration => {
    console.log('Service worker registered:', registration.scope)
  }).catch(err => {
    console.warn('Service worker registration failed:', err)
  })
}

const rootElement = document.getElementById('root')!
createRoot(rootElement).render(<WebApp />)
```

**`'serviceWorker' in navigator` explained:**
Service workers are supported in all modern browsers (Chrome, Firefox, Safari, Edge) but
not in some older environments. The feature detection `'serviceWorker' in navigator` checks
for support before attempting registration. Without the check, registering in an unsupported
environment throws a `TypeError`.

**Why registration does not `await`:**
Service worker registration is fire-and-forget for the page. The page does not need to wait
for registration to complete — it can render immediately. Registration happens asynchronously
in the background. On subsequent page loads, the service worker is already active from the
previous registration.

### Step 4 — The "Ready Offline" Badge

Post a message from the service worker to the page when the cache is populated. Add to
the service worker's `fetch` handler:

```javascript
// After cache.put succeeds, check if all WASM files are cached
cache.put(event.request, networkResponse.clone()).then(async () => {
  const keys = await cache.keys()
  const cachedUrls = new Set(keys.map(req => req.url))
  const allCached = WASM_URLS_TO_CACHE.every(url => cachedUrls.has(url))
  if (allCached) {
    const clients = await self.clients.matchAll()
    clients.forEach(client => client.postMessage({ type: 'ALL_CACHED' }))
  }
})
```

In the web app, listen for the message:

```typescript
useEffect(() => {
  if (!('serviceWorker' in navigator)) return

  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'ALL_CACHED') {
      setIsOfflineReady(true)
    }
  }

  navigator.serviceWorker.addEventListener('message', handler)
  return () => navigator.serviceWorker.removeEventListener('message', handler)
}, [])
```

**`self.clients.matchAll()` explained:**
`self` inside a service worker refers to the service worker's global scope (equivalent to
`window` in a page). `clients` is a property of the service worker global that provides
access to all pages controlled by the worker. `matchAll()` returns an array of all
controlled clients. `client.postMessage(data)` sends a message to a specific page.

This is the reverse of `ipcRenderer` in Electron — here, the "main process" (service
worker) pushes a message to the "renderer" (the page). The mechanism is different but
the pattern is the same: one context notifying another without the receiver polling.

---

## Connect the Pieces

The service worker is entirely in `apps/web` — the Electron app does not use it (Electron
has its own caching and the WASM files are available locally). This is one of the few
features that differs between shells: the web shell needs offline caching; the Electron
shell gets offline capability for free from the file system.

In Lesson 23, when the VSCode extension is built, the service worker is also absent —
VSCode extensions run in a context that has direct file system access for caching.

---

## What Breaks Without This

If the service worker's `fetch` handler does not return early for non-WASM URLs, every
network request — including HMR (hot module replacement) WebSocket connections from Vite —
is intercepted. The service worker tries to cache and replay Vite's development server
responses. The result: hot reload breaks, and Vite shows connection errors. The filter
(`if (!WASM_URLS_TO_CACHE.some(...)) return`) is not optional — it preserves all non-WASM
requests to pass through normally.

---

## Definition of Done

- [ ] Run a Python block online. DevTools → Network → verify the CDN request was made.
- [ ] Reload the page. Run the same block. DevTools → Network → CDN request is served
      from ServiceWorker (shown as "(ServiceWorker)" in the Status column).
- [ ] Go to DevTools → Network → check "Offline." Reload. Run Python. It works.
- [ ] The "Ready offline" badge appears after all five WASM runtimes have been run once.
- [ ] Change `CACHE_NAME` from `codex-wasm-v1` to `codex-wasm-v2`; verify the old cache
      is deleted on activation (DevTools → Application → Cache Storage).
- [ ] You can answer: what is `respondWith` and why does the fetch handler not return a value
      normally?
- [ ] You can answer: why does `networkResponse.clone()` exist?
- [ ] `git commit` with a message explaining why
