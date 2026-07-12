---
series: browser-apis
level: 3
title: Storage APIs
lang: javascript
---

# Storage APIs

Web applications need to persist data on the client: user preferences, session state, offline data, cached responses. The browser provides three main storage APIs with different scopes, capacities, and lifetimes: `localStorage`, `sessionStorage`, and the Cache API (for service workers). Choosing the right one depends on how long the data should persist, whether it should be shared across tabs, and how much data needs to be stored.

By the end of this lesson you will understand the storage APIs, their limits, when to use each, and how to avoid the common mistakes that lead to stale data, storage quota errors, and security issues.

## localStorage: persistent cross-tab storage

`localStorage` stores key-value pairs that persist until explicitly deleted — they survive page refreshes, browser restarts, and even computer reboots. Storage is per-origin: `localStorage` on `https://myapp.com` is separate from `localStorage` on `https://other.com`.

```javascript
// Storing data:
localStorage.setItem('theme', 'dark')
localStorage.setItem('userId', 'u_123')
localStorage.setItem('preferences', JSON.stringify({ fontSize: 16, language: 'en' }))
// Values must be strings. Objects must be JSON-serialised.

// Retrieving data:
const theme = localStorage.getItem('theme')          // 'dark'
const missingKey = localStorage.getItem('nothing')   // null (not undefined, not empty)

const prefs = JSON.parse(localStorage.getItem('preferences'))
// prefs: { fontSize: 16, language: 'en' }

// Removing data:
localStorage.removeItem('theme')
localStorage.clear()   // removes ALL items for this origin — use with care

// Checking what is stored:
console.log(localStorage.length)         // number of items
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)        // key at index i
  console.log(key, localStorage.getItem(key))
}
```

```text
localStorage characteristics:
  SCOPE:     Per-origin (scheme + hostname + port). All tabs on the same origin share it.
  LIFETIME:  Persists until explicitly deleted. Survives browser restart.
  CAPACITY:  Typically 5–10 MB per origin (browser-dependent).
  TYPE:      Synchronous — blocks the main thread while reading/writing.
  SECURITY:  Only accessible by JavaScript from the same origin.
             NOT sent to the server (unlike cookies).
             Accessible by ANY script on the page (including injected scripts — XSS risk).
```

## sessionStorage: tab-scoped temporary storage

`sessionStorage` has the same API as `localStorage` but is scoped to a single browser tab and cleared when the tab closes.

```javascript
// Same API as localStorage:
sessionStorage.setItem('currentStep', '3')
const step = sessionStorage.getItem('currentStep')   // '3'
sessionStorage.removeItem('currentStep')
```

```text
sessionStorage characteristics:
  SCOPE:     Per-tab AND per-origin. Two tabs on the same site have SEPARATE sessionStorage.
  LIFETIME:  Cleared when the tab is closed (or the session ends).
  CAPACITY:  Same as localStorage (5–10 MB).
  USE CASES: Multi-step forms (save progress in the current session).
             One-time flags: "show the onboarding modal to this tab but not after refresh."
             Temporary user input that should not persist if the user closes the tab.

localStorage vs sessionStorage:
  Same interface. Different scope and lifetime.
  Use sessionStorage when: data should not persist after closing the tab.
  Use localStorage when: data should persist across sessions (preferences, auth token).
```

**CS lens:** `localStorage` and `sessionStorage` are the browser's implementation of a **persistent key-value store** (a hash table persisted to disk) and a **session-scoped key-value store** respectively. Both are synchronous operations — reading from `localStorage` blocks the JavaScript main thread. For small data (< a few KB), the blocking time is negligible (~microseconds). For large data, the block is measurable. The asynchronous alternative is IndexedDB — a full transactional database API in the browser, async by design, with no blocking.

## What NOT to store in client-side storage

```text
NEVER store in localStorage or sessionStorage:
  ✗ Passwords — if XSS occurs, any script on the page can read localStorage.
  ✗ Private keys or encryption keys — same XSS risk.
  ✗ Sensitive PII (SSN, credit card numbers, health data) — unnecessary exposure.
  ✗ Auth tokens (JWT, session tokens) in localStorage — susceptible to XSS.
     Use HttpOnly cookies for auth tokens instead: cookies with HttpOnly cannot be
     read by JavaScript. Even a successful XSS attack cannot steal an HttpOnly cookie.

OKAY to store (with awareness of XSS risk):
  ✓ User preferences (theme, language, font size).
  ✓ Non-sensitive app state (last selected tab, sort order).
  ✓ Cached, public API responses (weather data, public product catalog).
  ✓ Feature flags set by the user (not by the server for security decisions).

XSS (Cross-Site Scripting) risk:
  If your page is vulnerable to XSS — where an attacker injects script into your page —
  that script runs in YOUR origin's context and has full access to YOUR localStorage.
  The same-origin policy does not protect localStorage from scripts running on the same origin.
  Storing auth tokens in localStorage is therefore a known security risk.
```

## The storage event: reacting to changes across tabs

When `localStorage` changes in one tab, other tabs on the same origin receive a `storage` event.

```javascript
// Tab A writes:
localStorage.setItem('notification', JSON.stringify({ type: 'newMessage', count: 3 }))

// Tab B listens:
window.addEventListener('storage', (event) => {
  // event.key:      the key that changed ('notification')
  // event.newValue: the new value (JSON string)
  // event.oldValue: the previous value
  // event.url:      the URL of the page that made the change
  if (event.key === 'notification') {
    const data = JSON.parse(event.newValue)
    updateNotificationBadge(data.count)
  }
})
```

```text
storage event rules:
  Fires on OTHER tabs on the same origin — NOT on the tab that made the change.
  Fires on window (not document).
  Only fires for localStorage changes (not sessionStorage — sessionStorage is tab-private).

Use case: real-time sync across tabs without a server.
  Tab A logs in → sets localStorage.setItem('authState', 'logged-in')
  Tab B receives storage event → updates its UI to show the logged-in state.
```

**SE lens:** The decision about where to store auth tokens — `localStorage` vs `HttpOnly` cookies — is a real security tradeoff that developers face in production. `localStorage` tokens are convenient (accessible from JavaScript, no server setup needed) but are vulnerable to XSS. `HttpOnly` cookies are more secure (cannot be read by JS) but require server-side session management and are susceptible to CSRF attacks (mitigated with CSRF tokens or the `SameSite` cookie attribute). The standard recommendation for security-sensitive applications: use `HttpOnly`, `Secure`, `SameSite=Strict` cookies for auth tokens.

**Common mistakes:**
- Storing non-strings in localStorage — `localStorage.setItem('count', 42)` stores the string `'42'`, not the number `42`. `localStorage.getItem('count') + 1` returns `'421'` (string concatenation). Always parse: `parseInt(localStorage.getItem('count'), 10)`.
- Not handling quota errors — `localStorage.setItem` throws `QuotaExceededError` if storage is full. Wrap writes in try/catch for resilience.
- Using localStorage for large data — 5 MB limit, synchronous access, and no querying make localStorage unsuitable for large datasets. Use IndexedDB instead.

**Debug tip:** To inspect localStorage and sessionStorage: DevTools → Application panel → Storage section → Local Storage / Session Storage. You can view, edit, and delete entries directly. This is invaluable for debugging storage bugs — you can see exactly what is stored, set test values, or clear stale entries without writing code.

## Challenge: preferences_store

Implement a preferences store backed by localStorage.

```challenge
function createPreferencesStore(storageKey) {
  // storageKey: the localStorage key to use for all preferences (store as JSON)
  // Returns an object with:
  //   get(key): returns the preference value, or undefined if not set
  //   set(key, value): saves the preference (persists immediately)
  //   reset(): removes all preferences for this store key
  //   getAll(): returns all stored preferences as a plain object
}
```

```test
// Use a test key to avoid polluting real storage:
const store = createPreferencesStore('test-prefs-key')
store.reset()   // start clean

store.set('theme', 'dark')
store.set('fontSize', 16)

assert store.get('theme') === 'dark'
assert store.get('fontSize') === 16
assert store.get('missing') === undefined

const all = store.getAll()
assert all.theme === 'dark' && all.fontSize === 16

store.reset()
assert store.get('theme') === undefined
assert store.getAll() !== null && Object.keys(store.getAll()).length === 0
```
