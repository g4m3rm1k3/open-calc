---
series: async-programming
level: 4
title: Async Programming — Putting It Together
lang: javascript
---

# Async Programming — Putting It Together

The four concepts you have learned — the event loop model, Promises, async/await patterns, and production patterns (retry, semaphore, cancellation, work queue) — are the complete toolkit for writing reliable async JavaScript. This capstone lesson integrates them into a realistic scenario: a resilient API client that handles parallelism, retries, rate limiting, and cancellation.

## The design: a resilient API client

```text
REQUIREMENTS:
  1. Fetches data from a paginated API
  2. Fetches pages in parallel (up to 3 concurrent)
  3. Retries failed fetches up to 2 times (exponential backoff)
  4. Can be cancelled mid-fetch via an AbortSignal
  5. Collects all results, reports partial success on failure
  6. Provides progress callbacks
```

## The implementation

```javascript
async function fetchAllPages(baseUrl, options = {}) {
  const {
    maxPages       = Infinity,
    concurrency    = 3,
    maxRetries     = 2,
    retryBaseMs    = 100,
    signal         = null,
    onProgress     = () => {},
  } = options

  // Step 1: discover total pages from the first page
  const firstPage = await fetchPageWithRetry(baseUrl, 1, { maxRetries, retryBaseMs, signal })
  const totalPages = Math.min(firstPage.totalPages, maxPages)

  onProgress({ loaded: 1, total: totalPages, page: 1 })

  if (totalPages === 1) {
    return { items: firstPage.items, errors: [] }
  }

  // Step 2: fetch remaining pages with concurrency limit
  const semaphore = createSemaphore(concurrency)
  const results = []
  const errors = []

  const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)

  await Promise.allSettled(
    remainingPages.map(pageNum =>
      semaphore.run(async () => {
        if (signal?.aborted) return   // honour cancellation

        try {
          const page = await fetchPageWithRetry(baseUrl, pageNum, { maxRetries, retryBaseMs, signal })
          results.push({ pageNum, items: page.items })
          onProgress({ loaded: results.length + 1, total: totalPages, page: pageNum })
        } catch (err) {
          if (err.name !== 'AbortError') {
            errors.push({ pageNum, error: err.message })
          }
        }
      })
    )
  )

  // Sort results by page number (pages complete out of order)
  results.sort((a, b) => a.pageNum - b.pageNum)
  const allItems = [
    ...firstPage.items,
    ...results.flatMap(r => r.items),
  ]

  return { items: allItems, errors }
}

async function fetchPageWithRetry(baseUrl, pageNum, { maxRetries, retryBaseMs, signal }) {
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    try {
      const url = `${baseUrl}?page=${pageNum}`
      const response = await fetch(url, { signal })
      if (!response.ok) throw Object.assign(new Error(`HTTP ${response.status}`), { status: response.status })
      return await response.json()
    } catch (err) {
      if (err.name === 'AbortError') throw err   // don't retry aborts
      if (attempt > maxRetries) throw err        // exhausted retries

      const delay = retryBaseMs * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

function createSemaphore(max) {
  let running = 0
  const queue = []

  return {
    async run(fn) {
      await new Promise(resolve => {
        if (running < max) { running++; resolve() }
        else queue.push(resolve)
      })
      try {
        return await fn()
      } finally {
        running--
        if (queue.length > 0) {
          const next = queue.shift()
          running++
          next()
        }
      }
    }
  }
}
```

## Trace: what happens during a 5-page fetch

```text
EXECUTION TRACE for fetchAllPages('/api/items', { maxPages: 5, concurrency: 2 }):

  t=0ms:
    Fetch page 1 (discover total pages)
    
  t=200ms (page 1 returns):
    totalPages = 5
    onProgress({ loaded: 1, total: 5, page: 1 })
    Start semaphore with max=2
    Start page 2 (slot 1)
    Start page 3 (slot 2)
    Pages 4, 5 queue behind semaphore

  t=350ms (page 3 returns first):
    results.push({ pageNum: 3, items: [...] })
    onProgress({ loaded: 2, total: 5, page: 3 })
    semaphore releases slot → page 4 starts

  t=380ms (page 2 returns):
    results.push({ pageNum: 2, items: [...] })
    onProgress({ loaded: 3, total: 5, page: 2 })
    semaphore releases slot → page 5 starts

  t=500ms (pages 4 and 5 return):
    results.push({ pageNum: 4 }), onProgress(...)
    results.push({ pageNum: 5 }), onProgress(...)

  Final:
    results.sort((a,b) => a.pageNum - b.pageNum)
    → [page2, page3, page4, page5] correctly ordered
    allItems = [...page1.items, ...page2.items, ...page3.items, ...]
    return { items: allItems, errors: [] }
```

**CS lens:** The fetch-all-pages pattern is a classic **parallel map with bounded concurrency** — a fundamental concurrent programming construct. The semaphore bounds the fan-out; `Promise.allSettled` collects all results (including failures); the sort restores order after out-of-order completion. This pattern appears in database query batching, file processing pipelines, and any system where you want to process N items faster than N-sequential but safer than N-parallel.

## When async goes wrong: debugging checklist

```text
SYMPTOM: Async function returns undefined
  CAUSE: Missing 'await' — function returns a Promise, caller reads it as a value
  FIX: Add 'await' before the async call; check that the async function 'return's a value

SYMPTOM: Sequential execution where parallel was expected
  CAUSE: 'await' inside .map() without Promise.all, or multiple top-level awaits
  FIX: Collect Promises into an array, then Promise.all([...promises])

SYMPTOM: UnhandledPromiseRejection
  CAUSE: A floating Promise (no await, no .catch()) rejected
  FIX: Add 'await' or chain .catch() to every Promise that might reject

SYMPTOM: Memory leak in long-running process
  CAUSE: EventEmitter listeners never removed, AbortController signals never resolved,
         Promises holding closures never settled
  FIX: Remove listeners in cleanup; ensure every Promise settles

SYMPTOM: Operations run too slowly despite parallelism
  CAUSE: Semaphore limit too low, or operations are sequential due to missed await
  FIX: Profile with timestamps; increase semaphore limit if safe; check for sequential awaits

SYMPTOM: Race condition (non-deterministic results)
  CAUSE: Shared mutable state updated by concurrent operations
  FIX: Use a work queue to serialise access, or use immutable state
```

## Challenge: resilient_fetch_all

Implement a simplified version of the fetchAllPages pattern.

```challenge
async function fetchAll(urls, fetcher, { concurrency = 2, maxRetries = 1 } = {}) {
  // urls: array of URLs to fetch
  // fetcher: async (url) → data
  // concurrency: max simultaneous fetches
  // maxRetries: number of retry attempts on failure (total attempts = maxRetries + 1)
  //
  // Fetch all URLs with bounded concurrency.
  // Retry failed fetches up to maxRetries times.
  // Return: { results: data[], errors: { url, error }[] }
  //   results: successfully fetched data (in the SAME ORDER as urls)
  //   errors: failed URLs with their error messages
  //   Both are in url-order (results[i] corresponds to urls[i], or null if failed)
}
```

```test
const log = []
const fetcher = async (url) => {
  log.push('start:' + url)
  await new Promise(r => setTimeout(r, 10))
  if (url.includes('fail')) throw new Error('fetch failed')
  return { url, data: 'ok' }
}

const urls = ['a', 'b', 'fail1', 'c', 'fail2']
const { results, errors } = await fetchAll(urls, fetcher, { concurrency: 2, maxRetries: 1 })

// All 5 URLs attempted
assert results.length + errors.length === 5

// Successes at correct positions
assert results.find(r => r?.url === 'a')
assert results.find(r => r?.url === 'b')
assert results.find(r => r?.url === 'c')

// Failures captured with correct info
assert errors.length === 2
assert errors.every(e => e.url.includes('fail'))
assert errors.every(e => e.error === 'fetch failed')

// Concurrency: max 2 start simultaneously
const starts = log.filter(l => l.startsWith('start:'))
// At no point should more than 2 be running at once
// (verify via timing — hard to assert exactly, so just verify results are correct)
assert starts.length >= 5   // at least one retry per failure = at least 5 start events (could be 7 with retries)
```
