---
series: async-programming
level: 3
title: Async Patterns — Queues, Retries, and Cancellation
lang: javascript
---

# Async Patterns — Queues, Retries, and Cancellation

Production async code goes beyond simple `await fetch()`. Real systems must handle: operations that might fail and should be retried, concurrent operations that must be limited so they don't overwhelm a downstream service, long-running operations that can be cancelled, and tasks that must execute in order even when produced concurrently.

These patterns appear in every real backend: the retry-with-backoff for flaky network calls, the semaphore for database connection limits, the cancellation token for user-initiated aborts, and the work queue for ordered processing. By the end of this lesson you will be able to implement and apply all four.

## Retry with exponential backoff

Transient failures (network hiccups, temporary rate limiting, brief database unavailability) should be retried. The backoff ensures that retries don't overwhelm a recovering service.

```javascript
async function withRetry(asyncFn, options = {}) {
  const {
    maxAttempts = 3,
    baseDelayMs = 200,
    maxDelayMs  = 5000,
    shouldRetry = (err) => true,   // by default, retry any error
  } = options

  let lastError
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await asyncFn(attempt)
    } catch (err) {
      lastError = err
      if (attempt === maxAttempts || !shouldRetry(err)) {
        throw err
      }

      // Exponential backoff with jitter: delay = base * 2^(attempt-1) ± jitter
      const expDelay = baseDelayMs * Math.pow(2, attempt - 1)
      const jitter   = Math.random() * baseDelayMs   // randomise to avoid thundering herd
      const delay    = Math.min(expDelay + jitter, maxDelayMs)

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw lastError
}

// Usage:
const data = await withRetry(
  () => fetch('/api/data').then(r => r.json()),
  {
    maxAttempts: 4,
    baseDelayMs: 100,
    shouldRetry: (err) => err.status !== 400 && err.status !== 404,
    // Don't retry client errors (400, 404) — only server errors and network failures
  }
)
```

```text
EXPONENTIAL BACKOFF:
  Attempt 1: fails → wait ~200ms
  Attempt 2: fails → wait ~400ms
  Attempt 3: fails → wait ~800ms
  Attempt 4: fails → throw

JITTER:
  Without jitter: all clients retry at the same time → thundering herd
  With jitter: retries are spread out → recovering service is not re-overwhelmed

shouldRetry:
  Retry transient errors: 500, 503, network failure, timeout
  Don't retry: 400 (bad request), 401 (auth), 404 (not found) — retrying won't help
```

**CS lens:** Exponential backoff is an example of **adaptive rate control** — the client reduces its request rate in response to congestion or failure signals from the server. This is the same principle as TCP congestion control: when packet loss is detected, the sender halves its sending rate and grows exponentially again. The distributed systems insight: in a system where many clients are hammering a partially-failed server, the fastest recovery comes when each client backs off independently and at random intervals (jitter), rather than synchronising their retries.

## Semaphore: limiting concurrency

A semaphore limits how many async operations can run simultaneously.

```javascript
function createSemaphore(maxConcurrent) {
  let running = 0
  const queue = []

  function release() {
    running--
    if (queue.length > 0) {
      const { resolve } = queue.shift()
      running++
      resolve()
    }
  }

  async function acquire() {
    if (running < maxConcurrent) {
      running++
      return
    }
    // Wait for a slot to become available
    await new Promise(resolve => queue.push({ resolve }))
  }

  return {
    async run(asyncFn) {
      await acquire()
      try {
        return await asyncFn()
      } finally {
        release()
      }
    },
    get running() { return running },
    get queued() { return queue.length },
  }
}

// Usage: limit database queries to 5 concurrent
const dbSemaphore = createSemaphore(5)

async function queryUserBatch(userIds) {
  return Promise.all(
    userIds.map(id => dbSemaphore.run(() => db.users.findById(id)))
  )
}
// Even if userIds has 1,000 entries:
// Promise.all starts all 1,000 operations
// But the semaphore limits to 5 running at a time
// The rest wait in the queue
```

```text
SEMAPHORE USE CASES:
  → Database connection pools (don't exceed 10 concurrent connections)
  → API rate limiting (don't exceed 100 requests/minute to a third-party API)
  → File system operations (don't open too many files simultaneously)
  → Memory control (don't load too many large objects simultaneously)

WITHOUT A SEMAPHORE:
  Promise.all(1000 ids.map(fetchUser)) → 1,000 simultaneous database queries
  → Database overwhelmed, connections exhausted, everything slows down or fails

WITH SEMAPHORE(10):
  10 queries run, 990 wait
  As each of the 10 completes, one from the queue starts
  The database never sees more than 10 simultaneous queries
```

## Cancellation with AbortController

Long-running operations should be cancellable. The browser's `AbortController` pattern can be used in Node.js too, and is the standard approach.

```javascript
function fetchWithCancellation(url, signal) {
  return fetch(url, { signal })   // AbortController.signal passed to fetch
}

// Usage: cancel pending fetch when user navigates away
function createCancellableSearch(onResult, onError) {
  let currentController = null

  return {
    search(query) {
      // Cancel any previous in-flight search
      currentController?.abort()
      currentController = new AbortController()

      const { signal } = currentController

      fetchWithCancellation(`/api/search?q=${encodeURIComponent(query)}`, signal)
        .then(r => r.json())
        .then(data => {
          if (!signal.aborted) onResult(data)
        })
        .catch(err => {
          if (err.name === 'AbortError') return   // expected — user typed more
          onError(err)
        })
    },

    cancel() {
      currentController?.abort()
    },
  }
}
```

```javascript
// Propagating cancellation through a multi-step operation
async function longProcess(signal) {
  // Check cancellation at each step
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError')

  const step1 = await doStep1(signal)

  if (signal.aborted) throw new DOMException('Aborted', 'AbortError')

  const step2 = await doStep2(step1, signal)

  return step2
}

// Or: listen for the abort event to clean up
async function streamData(signal) {
  signal.addEventListener('abort', () => cleanupResources())
  // ... do work
}
```

**SE lens:** AbortController implements the **cooperative cancellation** pattern — the cancellation is requested by the controller, but honoured by the operation. This is different from **preemptive cancellation** (forcibly killing a thread), which is unsafe because it can leave shared resources in inconsistent states. Cooperative cancellation is safe: the operation checks the signal at safe checkpoints and stops cleanly. This is why `AbortError` is a first-class concept in the Fetch API and why the signal propagates through every layer.

## Work queue: ordered async processing

```javascript
// A work queue processes items in order, one at a time,
// but accepts items concurrently (from multiple producers)
function createWorkQueue(processor) {
  let tail = Promise.resolve()   // the end of the current queue

  return {
    enqueue(item) {
      // Chain the new item to the end of the queue
      tail = tail
        .then(() => processor(item))
        .catch(err => {
          console.error('Queue item failed:', err)
          // Continue processing the queue even after a failure
        })
      return tail
    },
    get pending() {
      // Returns a Promise that resolves when all current items are processed
      return tail
    }
  }
}

// Usage: process payments in order (can't process the same account concurrently)
const paymentQueue = createWorkQueue(async (payment) => {
  await db.begin()
  try {
    await processPayment(payment)
    await db.commit()
  } catch (err) {
    await db.rollback()
    throw err
  }
})

// Multiple producers can enqueue concurrently:
paymentQueue.enqueue(payment1)   // starts processing
paymentQueue.enqueue(payment2)   // waits for payment1
paymentQueue.enqueue(payment3)   // waits for payment2
// Processing order: payment1 → payment2 → payment3 (guaranteed)
```

```text
WORK QUEUE VS Promise.all:
  Promise.all:  all start simultaneously, complete in any order
  Work queue:   each starts after the previous completes, strictly ordered

WORK QUEUE USE CASES:
  → Processing events that affect the same resource (payments to the same account)
  → Ensuring database writes happen in order (audit log, event sourcing)
  → Rate-limited API calls that must happen in order
  → User actions that must be serialised (undo/redo stack)
```

**Common mistakes:**
- Retrying non-idempotent operations — retrying a POST that creates a resource may create duplicates. Only retry idempotent operations (GET, PUT) or implement idempotency keys (unique request IDs that the server uses to deduplicate).
- Not handling the AbortError — cancellation via AbortController throws an AbortError in the promise chain. If you have a `catch` that handles all errors the same way, it will treat cancellation as an error. Always check `err.name === 'AbortError'` and handle it separately (usually by doing nothing — the cancellation was intentional).
- Semaphore deadlock — if `asyncFn` inside `semaphore.run()` awaits another call to `semaphore.run()`, both will be waiting for the semaphore that neither holds. Deadlock. Never nest semaphore acquisitions for the same semaphore.

**Debug tip:** When debugging concurrency issues: add timestamps to each operation and log them. `console.log('[${Date.now()}] Operation X started/completed')` reveals whether operations overlap, whether they are truly parallel, and whether the order matches expectations. For race conditions: add `Math.random() * 100ms` artificial delays to exaggerate timing differences and make the race reliably reproducible.

## Challenge: retry_semaphore

Implement retry with exponential backoff and a semaphore for concurrency control.

```challenge
async function withRetry(asyncFn, { maxAttempts = 3, baseDelayMs = 50 } = {}) {
  // asyncFn: async function to call
  // Retries up to maxAttempts times on failure
  // Delay between attempts: baseDelayMs * 2^(attempt-1) (no jitter needed for this test)
  // If all attempts fail: throw the last error
}

function createSemaphore(maxConcurrent) {
  // Returns: { run(asyncFn): Promise } — limits concurrent executions to maxConcurrent
  // Tasks exceeding the limit wait for a slot to become available
}
```

```test
// withRetry: succeeds on 3rd attempt
let attempts = 0
const result = await withRetry(async () => {
  attempts++
  if (attempts < 3) throw new Error('transient')
  return 'success'
}, { maxAttempts: 3, baseDelayMs: 10 })
assert result === 'success'
assert attempts === 3

// withRetry: throws after maxAttempts
attempts = 0
let threw = false
try {
  await withRetry(async () => { attempts++; throw new Error('always fails') }, { maxAttempts: 2, baseDelayMs: 10 })
} catch (e) {
  threw = true
  assert e.message === 'always fails'
}
assert threw && attempts === 2

// semaphore: limits concurrency
const sem = createSemaphore(2)
const running = []
let maxConcurrent = 0
const tasks = Array.from({ length: 5 }, (_, i) => sem.run(async () => {
  running.push(i)
  maxConcurrent = Math.max(maxConcurrent, running.length)
  await new Promise(r => setTimeout(r, 20))
  running.splice(running.indexOf(i), 1)
}))
await Promise.all(tasks)
assert maxConcurrent <= 2
```
