---
series: async-programming
level: 1
title: Promises Deep Dive
lang: javascript
---

# Promises Deep Dive

You have used Promises with `async/await`, but Promises have a rich API that goes beyond what `await` exposes. Understanding Promises at the level of `.then()`, `.catch()`, `.finally()`, and the static combinators (`Promise.all`, `Promise.allSettled`, `Promise.race`, `Promise.any`) gives you precise control over concurrent async operations — controlling when they run, how errors propagate, and what happens when some succeed and others fail.

By the end of this lesson you will be able to write correct Promise chains, handle errors at every level, use the right combinator for each concurrency pattern, and understand the Promise state machine that `async/await` is built on.

## The Promise state machine

A Promise is a state machine with three states:

```text
PROMISE STATES:
  PENDING   → the async operation is in progress
  FULFILLED → the operation completed successfully (has a value)
  REJECTED  → the operation failed (has a reason/error)

STATE TRANSITIONS:
  PENDING → FULFILLED (when resolve(value) is called)
  PENDING → REJECTED  (when reject(error) is called)
  Once fulfilled or rejected: SETTLED — the state cannot change again.

A PROMISE IS IMMUTABLE ONCE SETTLED:
  const p = Promise.resolve(42)
  p.then(v => console.log(v))    // 42
  p.then(v => console.log(v))    // 42 again — the value is stored
  // Attaching .then() to an already-resolved Promise runs the callback asynchronously
  // but immediately (via microtask queue) — not after another async operation.
```

## Constructing Promises

```javascript
// The Promise constructor: wraps callback-based async in a Promise
function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) reject(err)       // transition to REJECTED with err
      else     resolve(data)     // transition to FULFILLED with data
    })
  })
}

// Promise.resolve: creates an already-fulfilled Promise
const p1 = Promise.resolve(42)          // fulfilled with 42
const p2 = Promise.resolve({ x: 1 })   // fulfilled with an object

// Promise.reject: creates an already-rejected Promise
const p3 = Promise.reject(new Error('immediate failure'))   // rejected

// Returning a value from .then() creates a new Promise fulfilled with that value:
Promise.resolve(1)
  .then(v => v + 1)       // new Promise fulfilled with 2
  .then(v => v * 3)       // new Promise fulfilled with 6
  .then(v => console.log(v))   // logs 6
```

## Error propagation in Promise chains

```javascript
// Errors propagate down the chain until caught:
Promise.resolve('data')
  .then(data => {
    throw new Error('processing failed')   // rejected Promise
  })
  .then(result => {
    // SKIPPED — the previous .then threw
    console.log('This does not run')
  })
  .catch(err => {
    console.log('Caught:', err.message)   // 'Caught: processing failed'
    return 'recovered'                     // returns fulfilled Promise with 'recovered'
  })
  .then(value => {
    console.log('After recovery:', value)  // 'After recovery: recovered'
    // The chain CONTINUES after .catch() if catch() doesn't throw
  })
```

```text
ERROR PROPAGATION RULES:
  → An unhandled rejection in .then() creates a rejected Promise
  → Rejected Promises SKIP .then() handlers
  → .catch() handles the nearest upstream rejection
  → .catch() that returns a value creates a new FULFILLED Promise
  → .catch() that throws creates a new REJECTED Promise
  → .finally() runs regardless of fulfillment/rejection, does NOT change the value

  COMMON MISTAKE: .catch() at the wrong level
    fetch(url)
      .then(r => r.json())
      .catch(err => console.log(err))   // catches fetch AND json errors
      .then(data => processData(data))  // 'data' is undefined if catch ran!
```

**CS lens:** Promise chaining is **monadic composition** — each `.then()` transforms the value inside the Promise and produces a new Promise containing the transformed value. This is the same structure as the `Maybe` monad you saw in functional programming: `.then()` on a rejected Promise does nothing (like `Maybe.map()` on Nothing), and `.catch()` recovers from rejection (like `Maybe.getOrElse()`). The Promise monad is the JavaScript runtime's native implementation of this abstract algebra applied to asynchronous values.

## The four combinators

```javascript
// 1. Promise.all: wait for ALL to succeed; fail if ANY fail
const [user, orders, inventory] = await Promise.all([
  fetchUser(userId),
  fetchOrders(userId),
  fetchInventory(userId),
])
// All three run concurrently.
// If fetchUser rejects, the whole Promise.all rejects.
// The other two results are discarded.

// 2. Promise.allSettled: wait for ALL, get ALL results regardless of failure
const results = await Promise.allSettled([
  fetchUser(userId),
  fetchOrders(userId),
  fetchInventory(userId),
])
// results: [
//   { status: 'fulfilled', value: user },
//   { status: 'rejected',  reason: Error('Not found') },
//   { status: 'fulfilled', value: inventory },
// ]
const fulfilled = results.filter(r => r.status === 'fulfilled').map(r => r.value)
const failed = results.filter(r => r.status === 'rejected')

// 3. Promise.race: resolves/rejects with the FIRST to settle
const result = await Promise.race([
  fetch('/api/fast'),
  fetch('/api/slow'),
  new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
])
// Useful for: timeouts, racing multiple sources for the fastest response

// 4. Promise.any: resolves with the FIRST to succeed; rejects only if ALL fail
const fastResult = await Promise.any([
  fetchFromCDN1('/asset'),
  fetchFromCDN2('/asset'),
  fetchFromCDN3('/asset'),
])
// First CDN to succeed wins. If all fail: AggregateError with all rejection reasons.
```

```text
COMBINATOR CHEAT SHEET:
  Promise.all(ps)        → Fulfills when ALL fulfill; rejects if ANY reject
  Promise.allSettled(ps) → Fulfills when ALL settle (fulfilled or rejected)
  Promise.race(ps)       → Fulfills/rejects with the FIRST to settle
  Promise.any(ps)        → Fulfills with the FIRST to fulfill; rejects if ALL reject

WHEN TO USE EACH:
  all:         Parallel independent requests, ALL results needed, fail-fast on any error
  allSettled:  Parallel independent requests, PARTIAL results acceptable (dashboard loading)
  race:        Timeout pattern; racing multiple equivalent sources
  any:         Redundancy pattern; want any one success from multiple fallbacks
```

## Building a timeout wrapper

```javascript
function withTimeout(promise, timeoutMs) {
  let timeoutId
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
      timeoutMs
    )
  })

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId))
}

// Usage:
const user = await withTimeout(fetchUser(id), 5000)
// If fetchUser takes > 5 seconds: throws 'Operation timed out after 5000ms'
// If fetchUser completes in time: clearTimeout prevents memory leak
```

**SE lens:** The `withTimeout` wrapper is an example of the **decorator pattern applied to Promises**. It wraps any Promise with additional behaviour (timeout), without modifying the original Promise or the function that created it. This is the same composability that made the channel decorator work in the OOP lesson — the pattern applies at every level of abstraction, from classes to Promises to functions.

**Common mistakes:**
- Promise chain swallowing errors — `.catch(() => null)` recovers silently. The caller receives `null` and may try to use it as if it were valid data. Always log or rethrow in `.catch()` unless silence is intentional and documented.
- Not returning Promises in `.then()` callbacks — `.then(async () => { await something() })` — the inner `await something()` is fine, but if you forget `return` in a non-async callback, the next `.then()` runs immediately without waiting.
- Creating unnecessary Promise wrappers — `new Promise(resolve => resolve(fetch(url)))` is equivalent to just `fetch(url)`. Do not wrap Promises in new Promises. The exception: wrapping callback-based APIs (the "promisification" pattern).

**Debug tip:** Promise rejections that are not handled trigger `UnhandledPromiseRejection` in Node.js (crashes the process in newer versions) and a console warning in browsers. When you see this error: find the Promise chain that is missing a `.catch()`. Always ensure every Promise chain ends with `.catch()` OR is `await`-ed inside a `try/catch`. Tools like `async_hooks` in Node.js and browser DevTools can trace the origin of unhandled rejections.

## Challenge: promise_combinators

Implement a data loading function that uses the right combinator for each requirement.

```challenge
async function loadDashboard(userId, fetchFn) {
  // fetchFn: async function that takes a URL and returns data (or throws)
  //
  // Load these in PARALLEL (all at once, don't wait for one before starting another):
  //   profile:   fetchFn('/api/users/' + userId)
  //   orders:    fetchFn('/api/orders?user=' + userId)
  //   inventory: fetchFn('/api/inventory')
  //
  // Requirements:
  //   profile is REQUIRED — if it fails, throw immediately
  //   orders and inventory: return partial results even if they fail
  //   Return: { profile, orders: data or null, inventory: data or null, errors: string[] }
  //     errors: list of error messages for failed optional loads
}
```

```test
// All three load successfully, in parallel
const successFetch = async (url) => ({ url, data: 'ok' })
const result = await loadDashboard('u1', successFetch)
assert result.profile.url.includes('u1') && result.orders.data === 'ok' && result.errors.length === 0

// Profile failure: required, must throw
let threw = false
const failProfile = async (url) => {
  if (url.includes('/users/')) throw new Error('user not found')
  return { url, data: 'ok' }
}
try { await loadDashboard('u1', failProfile) } catch(e) { threw = true; assert e.message === 'user not found' }
assert threw

// Optional failures: return partial results, don't throw
const failOrders = async (url) => {
  if (url.includes('/orders')) throw new Error('orders unavailable')
  return { url, data: 'ok' }
}
const partial = await loadDashboard('u1', failOrders)
assert partial.profile.data === 'ok' && partial.orders === null && partial.inventory.data === 'ok'
assert partial.errors.length === 1 && partial.errors[0].includes('orders unavailable')
```
