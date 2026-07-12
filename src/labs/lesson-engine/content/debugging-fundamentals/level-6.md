---
series: debugging-fundamentals
level: 6
title: Debugging Async Code
lang: javascript
---

# Debugging Async Code

Synchronous code executes one statement after the next in a predictable order. When something goes wrong, the stack trace tells you exactly where. Asynchronous code does not work this way: operations start, yield control, and resume later — possibly in a different order than they were initiated. Error traces span multiple turns of the event loop. Unhandled promise rejections disappear silently. Race conditions appear only under load.

Async bugs are not more complex than sync bugs in principle — the same five-step debugging process applies. But they require additional techniques: understanding the JavaScript event loop, catching errors from promises, and reading async stack traces. By the end of this lesson you will be able to debug async/await code, handle promise errors correctly, and reason about event loop ordering.

## The event loop: why async code behaves this way

To debug async code, you must understand why async code can run out of order.

```text
THE EVENT LOOP — a continuous loop with three components:

  CALL STACK:      Where synchronous code executes. One frame at a time.
                   While the call stack is not empty, nothing else runs.

  TASK QUEUE:      Also called the macrotask queue. Holds callbacks from:
                   setTimeout, setInterval, I/O completion (network, file read).
                   The event loop picks ONE task from here when the call stack is empty.

  MICROTASK QUEUE: Holds resolved promise callbacks (.then, async/await continuations).
                   ALWAYS drains completely before the event loop picks the next task.
                   This makes promises run before the next setTimeout.
```

```javascript
console.log('1 — synchronous')

setTimeout(() => console.log('2 — setTimeout callback'), 0)

Promise.resolve().then(() => console.log('3 — promise .then'))

console.log('4 — synchronous')
```

```text
Execution order:

  Call stack runs:
    console.log('1 — synchronous')         → output: "1"
    setTimeout schedules callback in task queue
    Promise.resolve().then schedules callback in MICROTASK queue
    console.log('4 — synchronous')         → output: "4"
    Call stack is now empty.

  Microtask queue drains (before any task):
    promise .then callback runs             → output: "3"

  Task queue (next macrotask):
    setTimeout callback runs               → output: "2"

ACTUAL OUTPUT ORDER: 1, 4, 3, 2

The promise .then runs before the setTimeout even though setTimeout was scheduled first.
Microtasks always run before the next macrotask.
```

**CS lens:** The event loop is the JavaScript runtime's implementation of **cooperative multitasking**: code voluntarily yields control (via await, .then, setTimeout) instead of being preemptively interrupted by the OS scheduler. Unlike threads (which are preemptively scheduled by the OS and can be suspended at any instruction), JavaScript yields control only at explicit `await` points. This means JavaScript code is safe from data races within a single await-to-await block — but between await points, other code can run.

## Async stack traces and their limitations

A synchronous stack trace shows the complete call chain. An async stack trace is split at every `await` — each continuation is a separate event loop turn with its own call stack.

```javascript
async function fetchData(url) {
  const response = await fetch(url)   // yields here
  return response.json()
}

async function loadUser(id) {
  const data = await fetchData(`/api/users/${id}`)   // yields here
  return data.user
}

async function main() {
  const user = await loadUser('abc')
  console.log(user.name)   // user is null → TypeError
}
```

```text
Synchronous stack trace (ideal):
  TypeError: Cannot read properties of null (reading 'name')
      at main (app.js:12)
      at loadUser (app.js:7)
      at fetchData (app.js:2)

Actual async stack trace (Node.js without --async-stack-trace):
  TypeError: Cannot read properties of null (reading 'name')
      at main (app.js:12)
      at processTicksAndRejections (node:internal/process/task_queues:95:5)

The intermediate async frames (loadUser, fetchData) are GONE.
Each await created a new event loop turn — the previous turn's stack was discarded.

Modern tooling improves this:
  Chrome DevTools: enables "async stack traces" — reconstructs the full chain.
  Node.js 12+: --async-stack-trace flag or --experimental-vm-modules.
  Structured logging with requestId (from the previous lesson) traces the chain manually.
```

## Handling promise errors: the two patterns

Promise errors that are not caught are **unhandled rejections** — they are either silently ignored or cause the process to crash, depending on the runtime version.

```javascript
// WRONG: error from fetch is not caught
async function loadConfig() {
  const response = await fetch('/config')   // if fetch throws, where does the error go?
  return response.json()
}

loadConfig()   // no .catch, no try/catch — error is an unhandled rejection

// In Node.js: "UnhandledPromiseRejectionWarning" (older), then process crash (newer).
// In browser: silent (console warning only, if DevTools is open).
```

```javascript
// CORRECT pattern 1: try/catch inside async functions
async function loadConfig() {
  try {
    const response = await fetch('/config')
    if (!response.ok) throw new Error(`Config load failed: HTTP ${response.status}`)
    return await response.json()
  } catch (err) {
    throw new Error('Failed to load configuration', { cause: err })
  }
}

// CORRECT pattern 2: .catch() at the call site
loadConfig()
  .then(config => startApp(config))
  .catch(err => {
    console.error('Startup failed:', err)
    process.exit(1)
  })
```

```text
The rule: every async function that can fail must have BOTH:
  1. Internal error handling (try/catch) to add context and wrap errors.
  2. External handling (.catch or try/catch at the call site) to decide what to do.

Catching inside an async function:
  Converts the async error into a structured error with context.
  Re-throws so the caller can handle it.

Catching at the call site:
  Decides the user-visible outcome: retry, fallback, error message, process exit.
  This is the appropriate level for that decision.
```

## Debugging timing-dependent async bugs

Async bugs often appear only under specific timing conditions — a race between two operations that resolve in different orders depending on network latency, load, or scheduling.

```javascript
// Race condition: two concurrent fetches write to shared state
let cachedUser = null

async function getUser(id) {
  if (cachedUser && cachedUser.id === id) return cachedUser
  const user = await fetchUserFromDB(id)   // async — another call can start here
  cachedUser = user                         // both calls write here — last one wins
  return user
}

// Two simultaneous calls: getUser('a') and getUser('b')
// Both read cachedUser = null → both fetch → both write → one result lost
```

```text
TECHNIQUES FOR TIMING-DEPENDENT BUGS:

  1. ADD ARTIFICIAL DELAYS at suspected race points:
     const user = await fetchUserFromDB(id)
     await new Promise(r => setTimeout(r, Math.random() * 50))   // introduce jitter
     cachedUser = user
     If this makes the bug appear more often, it confirms a race condition.

  2. LOG WITH TIMESTAMPS at every operation:
     console.log({ ts: Date.now(), op: 'fetch start',   id })
     console.log({ ts: Date.now(), op: 'fetch complete', id })
     console.log({ ts: Date.now(), op: 'write cache',    id })
     Interleaved timestamps reveal concurrent operations.

  3. SEQUENCE NUMBERS: add a counter to each operation and include it in every log.
     The counter reveals out-of-order completion.
```

**SE lens:** Async error handling is the most commonly neglected aspect of JavaScript codebases. Developers add `try/catch` for synchronous code but forget that `async/await` requires it too. The consequence is silent failures in production: a fetch that fails returns undefined, the code accesses `.data` on undefined, and the user sees a blank page with no error in the logs. The pattern to enforce: every `await` that could fail is inside a `try/catch`, and every async function call at the top level has a `.catch`. Linting rules (`no-floating-promises`) can enforce this automatically.

**Common mistakes:**
- Catching the error but not awaiting the async function — `async function foo() { ... } foo()` without `await` or `.catch` creates an unhandled rejection even if foo() has internal try/catch. The outer `catch` cannot catch what it is not awaiting.
- Using `Promise.all` without understanding that if ONE rejects, ALL results are lost — use `Promise.allSettled` when you need all results even if some fail.
- Assuming sequential execution across two awaits — code between two `await`s is synchronous, but between the `await` yielding and the continuation running, other code CAN run.

**Debug tip:** When an async function seems to silently do nothing, add a `console.error` in every `catch` block before you do anything else. Silent failures are always catch blocks that swallow the error. Find the catch that is not logging, add the log, and the bug becomes visible.

## Challenge: fix_async_error_handling

This async function has three error-handling problems. Fix all three.

```challenge
// BROKEN VERSION — identify and fix the three issues:
async function fetchOrderSummary(orderId) {
  const response = await fetch(`/api/orders/${orderId}`)
  const data = response.json()   // Issue 1: missing await
  
  if (data.status === 'cancelled') {
    return null
  }
  
  const items = await fetchOrderItems(orderId)
  // Issue 2: if fetchOrderItems throws, the error propagates with no context
  
  return {
    id: orderId,
    total: data.total,
    itemCount: items.length,
  }
}

// Issue 3: no error handling when called — commented out so it doesn't throw in tests
// fetchOrderSummary('ord-42')

// FIXED VERSION:
async function fetchOrderSummaryFixed(orderId) {
  // Fix all three issues here
}
```

```test
// Test that the fixed version awaits response.json()
// We simulate this by testing that fetchOrderSummaryFixed returns a structured object
const fakeResponse = { ok: true, json: async () => ({ status: 'active', total: 49.99 }) }
const fakeItems = [{ id: 1 }, { id: 2 }]
global.fetch = async () => fakeResponse
global.fetchOrderItems = async () => fakeItems

const result = await fetchOrderSummaryFixed('ord-99')
assert result !== null
assert result.id === 'ord-99'
assert Math.abs(result.total - 49.99) < 0.01
assert result.itemCount === 2
```
