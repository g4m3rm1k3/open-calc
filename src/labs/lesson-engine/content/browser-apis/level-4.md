---
series: browser-apis
level: 4
title: Browser APIs — Putting It Together
lang: javascript
---

# Browser APIs — Putting It Together

The browser APIs you have learned — the environment model, events, Fetch, and storage — are most powerful when used together. A real browser application combines all of them: event listeners respond to user input, Fetch communicates with a server, storage persists state between sessions, and the event loop coordinates all of it asynchronously.

This capstone lesson integrates these APIs into a realistic pattern: a data-loading component that fetches from an API, stores a cache in localStorage, updates the DOM in response to events, handles loading and error states, and cleans up correctly when the component is removed.

## The complete browser API integration pattern

```javascript
// A self-contained "feature module" that integrates events, fetch, and storage:

function createProductSearch(containerEl) {
  // State:
  let currentQuery = ''
  const controller = new AbortController()   // to cancel in-flight requests on cleanup

  // Cache: persist recent results in localStorage to avoid redundant fetches
  function getCached(query) {
    try {
      const raw = localStorage.getItem(`search:${query}`)
      if (!raw) return null
      const { data, ts } = JSON.parse(raw)
      if (Date.now() - ts > 5 * 60 * 1000) return null   // 5-minute TTL
      return data
    } catch { return null }   // JSON parse failure or storage error — treat as miss
  }

  function setCache(query, data) {
    try {
      localStorage.setItem(`search:${query}`, JSON.stringify({ data, ts: Date.now() }))
    } catch {}   // QuotaExceededError — ignore, cache is best-effort
  }

  // Rendering:
  function render(state) {
    if (state.loading) {
      containerEl.innerHTML = '<p>Loading...</p>'
      return
    }
    if (state.error) {
      containerEl.innerHTML = `<p class="error">${state.error}</p>`
      return
    }
    if (!state.results) {
      containerEl.innerHTML = '<p>Type to search...</p>'
      return
    }
    containerEl.innerHTML = state.results
      .map(p => `<div class="product" data-id="${p.id}">${p.name} — $${p.price}</div>`)
      .join('')
  }

  // Search:
  async function search(query) {
    if (!query) { render({ results: null }); return }
    if (query === currentQuery) return   // debounce: same query already in progress

    currentQuery = query

    // Check cache first:
    const cached = getCached(query)
    if (cached) { render({ results: cached }); return }

    render({ loading: true })

    try {
      const response = await fetch(`/api/products?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setCache(query, data.products)
      render({ results: data.products })
    } catch (err) {
      if (err.name === 'AbortError') return   // component was cleaned up — do nothing
      render({ error: 'Search failed. Please try again.' })
    }
  }

  // Event delegation on the container for product clicks:
  containerEl.addEventListener('click', (event) => {
    const product = event.target.closest('[data-id]')
    if (!product) return
    console.log('Product selected:', product.dataset.id)
  })

  // Return public API:
  return {
    search,
    destroy() {
      controller.abort()   // cancel any in-flight fetch
      containerEl.innerHTML = ''
    }
  }
}
```

```text
What each API is doing in this pattern:

  EVENTS:   addEventListener on containerEl for product clicks (delegation).
            No individual listeners per product — they work for dynamically rendered products.

  FETCH:    GET /api/products?q=... with the AbortController signal.
            AbortError is caught and ignored (the component was destroyed).
            HTTP errors are caught and rendered as user-facing error messages.

  STORAGE:  localStorage as a cache with a 5-minute TTL.
            Errors are silently ignored (QuotaExceededError is not fatal).
            Cache key includes the query: search:laptop is separate from search:phone.

  ABORT:    One AbortController for the component's lifetime.
            controller.abort() in destroy() cancels any in-flight fetch.
            Without this, a fetch could resolve after destroy() and try to update a
            removed DOM element.

  EVENT LOOP: All fetch operations are async — the UI remains responsive during loading.
              render() is called synchronously from within the async chain.
```

**CS lens:** This pattern is an implementation of the **observer pattern** applied to browser APIs. The component observes: user events (via addEventListener), network responses (via Fetch/async/await), and time (via the TTL in the cache). Each observation may trigger a state change, which triggers a render. The state — loading, error, results, currentQuery — is the single source of truth. This is the same pattern React's useState, Vue's reactive data, and Svelte's stores implement at a higher level of abstraction.

## Performance considerations for browser APIs

```text
WHAT COSTS WHAT (approximate, varies by browser and hardware):

  DOM read (offsetHeight, scrollTop):  ~microseconds (cheap)
  DOM write (innerHTML, appendChild):  ~microseconds but triggers layout (expensive if forced)
  Forced layout (read after write):    ~1–10 ms (triggers full layout recalculation)
  localStorage read:                   ~microseconds for small data
  localStorage write:                  ~microseconds for small data (disk flush is async in most browsers)
  fetch() network round-trip:          ~50–500 ms (dominant cost — always cache if possible)

PERFORMANCE RULES:
  → Batch DOM updates: do not alternate reads and writes in a loop.
    Reads after writes force the browser to recalculate layout synchronously.
    const heights = elements.map(el => el.offsetHeight)   ← all reads first
    elements.forEach((el, i) => el.style.height = heights[i] + 'px')  ← then all writes

  → Cache API responses: a fetch costs 50–500ms; a localStorage read costs microseconds.
    Cache aggressively, with a reasonable TTL for the data's volatility.

  → Debounce high-frequency events: 'resize', 'scroll', 'mousemove', 'keyup' fire
    dozens of times per second. Processing immediately on each event is expensive.
    Debounce: wait until the event stops firing for N ms before processing.
```

```javascript
// Debounce: delays execution until N ms after the last call
function debounce(fn, delayMs) {
  let timeoutId = null
  return function(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delayMs)
  }
}

const input = document.querySelector('#search-input')
const searchComponent = createProductSearch(document.querySelector('#results'))

// Without debounce: fires on every keystroke (may be 100ms or less between keystrokes)
// With debounce: fires 300ms after the user stops typing
input.addEventListener('input', debounce((event) => {
  searchComponent.search(event.target.value)
}, 300))
```

**SE lens:** The debounce pattern is the most impactful single performance improvement for event-driven browser code. A search input without debounce fires a fetch request for every keystroke. For "laptop", that is 6 requests — but only the last matters. The first 5 are wasted. With 300ms debounce, only one request fires (when the user pauses). Debounce is a standard utility in every production browser codebase. Its cousin, throttle (allow at most one call per N ms), is used for scroll and resize handlers where some intermediate events should be processed.

**Common mistakes:**
- Forgetting to call `destroy()` or equivalent cleanup when a component is removed — the AbortController is not aborted, the fetch resolves after the component is gone, the code tries to update innerHTML on a detached DOM node. In frameworks, this is the "setState on an unmounted component" warning.
- Not encoding query parameters in URLs — `fetch('/api?q=' + query)` breaks if query contains `&`, `=`, `+`, or spaces. Always use `encodeURIComponent(query)`.
- Not checking cache before fetching — even a 30-second cache dramatically reduces API traffic for repeated queries. Cache aggressively, invalidate specifically.

**Debug tip:** To monitor all fetch requests from a page: DevTools Network tab, filter by "Fetch/XHR". This shows every request URL, method, status, time, and response size. When a request fires too many times (debounce missing), or takes too long (no cache), or returns wrong data (wrong URL), the Network tab reveals it without modifying source code.

## Challenge: debounced_fetcher

Implement a debounced data fetcher that cancels in-flight requests when a new one is needed.

```challenge
function createDebouncedFetcher(fetchFn, delayMs) {
  // fetchFn: async function that takes a query string and returns data
  // delayMs: how long to wait after the last call before firing
  //
  // Returns: a function that takes a query string.
  //   On each call: cancels the previous pending fetch (if any), then waits delayMs.
  //   After delayMs with no new calls: calls fetchFn with the latest query.
  //   Returns a Promise that resolves with the fetched data,
  //   or resolves with null if a newer call superseded this one.
}
```

```test
const callLog = []
const fakeFetch = async (query) => {
  callLog.push(query)
  return { result: query.toUpperCase() }
}

const fetcher = createDebouncedFetcher(fakeFetch, 50)

// Call three times rapidly — only the last should fire fetchFn
const p1 = fetcher('a')
const p2 = fetcher('ab')
const p3 = fetcher('abc')

const r3 = await p3
await new Promise(r => setTimeout(r, 100))   // wait for debounce to settle

assert callLog.length === 1   // only one actual fetch — the rapid calls were debounced
assert callLog[0] === 'abc'   // the last query wins
assert r3.result === 'ABC'
const r1 = await p1
assert r1.result === 'ABC'   // earlier callers resolve to the same debounced result
```
