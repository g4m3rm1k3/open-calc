# SE Masterclass — LAB-47 — Async and Promises

**Language: JavaScript (Node.js)** — returning to Node for this event-loop-focused lab.

**Prerequisites:** LAB-35 (the browser's rendering pipeline and batching — this lab studies the SAME event loop from the runtime side, not the rendering side).

**What this lab adds:**
- The event loop: how single-threaded JavaScript handles many things "at once" without real parallelism
- Callbacks → Promises → `async`/`await`, each solving a problem with the previous one
- Microtasks vs. macrotasks — WHY `Promise.then` always runs before `setTimeout`, even with a 0ms delay
- `Promise.all` for genuine CONCURRENT (not parallel) I/O-bound work

**Time:** 90–110 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. JavaScript is single-threaded — only ONE line of code runs at any instant. So how can it "wait" for a network request without freezing the entire program?
> 2. `setTimeout(fn, 0)` schedules `fn` to run "immediately" — with a 0 millisecond delay. Does it run BEFORE or AFTER the rest of the currently-executing synchronous code?
> 3. `async`/`await` is often called "syntax sugar" over Promises. What does that mean — is there anything `async`/`await` can do that Promises alone cannot?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `node main.js` prints:

```
=== Blocking vs Non-Blocking ===
start
blocking work done (took 200ms, main thread frozen)
after blocking call
--- now non-blocking ---
start
after non-blocking call (scheduled)
non-blocking work done (ran later, main thread was free)

=== Callbacks -> Promises ===
callback style: data loaded (callback)
promise style: data loaded (promise)

=== async/await: Sugar Over Promises ===
before await
data loaded (async/await)
after await

=== Microtasks vs Macrotasks ===
1: synchronous
4: setTimeout (macrotask)
3: Promise.then (microtask)
2: another synchronous line
  ← actual execution order: 1, 2, 3, 4 — NOT the numbers as written

=== Promise.all: Concurrent I/O ===
starting 3 "requests" at time 0ms
all 3 finished after ~300ms (the SLOWEST one) — not 100+150+300=550ms
```

---

### Concept: The Event Loop — One Thread, Many Things "At Once"

**What it is:** JavaScript runs on a SINGLE THREAD — literally one line of code executes at any given instant, ever. Yet Node.js servers handle THOUSANDS of concurrent connections. The trick: I/O operations (network requests, file reads, timers) are handed OFF to the runtime/OS, which notifies JavaScript LATER, via a callback, when they're done — the single thread is never actually BLOCKED waiting.

**The problem before:** A function that blocks the thread while waiting (like a naive `sleep()`) freezes EVERYTHING — no other code, no other request, nothing can run until it's done. For a server handling many users, that's catastrophic.

**The solution:** Non-blocking APIs. Instead of `data = readFileBlocking(path)` (freezes until done), use `readFile(path, (data) => { ... })` — START the read, IMMEDIATELY return control to the thread, and get called back LATER when the data is ready. In the meantime, the thread is free to handle OTHER work.

---

## Step 1 — Feel Blocking vs. Non-Blocking

```js
// main.js
console.log('=== Blocking vs Non-Blocking ===')

function blockingWork(ms) {
  const start = Date.now()
  while (Date.now() - start < ms) {}          // ← add: a busy-loop — this FREEZES the entire thread, on purpose
}

console.log('start')
blockingWork(200)
console.log('blocking work done (took 200ms, main thread frozen)')
console.log('after blocking call')

console.log('--- now non-blocking ---')
console.log('start')
setTimeout(() => {
  console.log('non-blocking work done (ran later, main thread was free)')
}, 200)
console.log('after non-blocking call (scheduled)')
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Blocking vs Non-Blocking ===
start
blocking work done (took 200ms, main thread frozen)
after blocking call
--- now non-blocking ---
start
after non-blocking call (scheduled)
non-blocking work done (ran later, main thread was free)
```

**Confirm the ORDER difference is the entire point:** In the BLOCKING version, "blocking work done" prints BEFORE "after blocking call" — the thread literally could not do anything else while `blockingWork` ran. In the NON-BLOCKING version, "after non-blocking call (scheduled)" prints BEFORE "non-blocking work done" — the thread was FREE to continue running code WHILE the 200ms timer counted down in the background, only running the callback once the timer actually finished.

---

## Step 2 — Callbacks, Then Promises

```js
console.log('\n=== Callbacks -> Promises ===')

function loadDataCallback(callback) {
  setTimeout(() => {
    callback('data loaded (callback)')
  }, 50)
}

loadDataCallback((result) => {
  console.log(result)
})

function loadDataPromise() {                          // ← add: the SAME idea, wrapped as a Promise
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('data loaded (promise)')
    }, 50)
  })
}

loadDataPromise().then((result) => {
  console.log(result)
})
```

### SAVE AND TRY

```bash
node main.js
```

**Expected (order may interleave slightly with Step 1's timer, but both eventually print):**
```
=== Callbacks -> Promises ===
callback style: data loaded (callback)
promise style: data loaded (promise)
```

**Confirm a Promise is a WRAPPER around the exact same callback mechanism:** `new Promise((resolve) => { setTimeout(() => resolve(...), 50) })` — INSIDE, it's still `setTimeout` and a callback. The Promise doesn't change WHAT happens; it changes HOW YOU'RE NOTIFIED — `.then(callback)` instead of passing a callback directly into the function, which becomes a real advantage the moment you need to CHAIN multiple async steps (next section) — chained callbacks nest ever deeper ("callback hell"), while chained `.then()` calls stay flat.

---

## Step 3 — async/await: Sugar Over Promises

```js
console.log('\n=== async/await: Sugar Over Promises ===')

async function main() {
  console.log('before await')
  const result = await loadDataPromise()          // ← add: 'await' PAUSES this function (not the whole thread!) until the Promise resolves
  console.log(result.replace('promise', 'async/await'))
  console.log('after await')
}

main()
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== async/await: Sugar Over Promises ===
before await
data loaded (async/await)
after await
```

**Confirm `await` pauses the FUNCTION, not the THREAD:** While `main()` is paused at `await loadDataPromise()`, the REST of your program (any other scheduled work, other requests in a real server) continues running normally — this is the crucial difference from Step 1's `blockingWork`. `await` is syntactic sugar for `.then(result => { /* rest of the function */ })` — the JavaScript engine transforms your linear-looking `async` code into the exact same callback/Promise machinery under the hood, just without the manual `.then()` chaining.

---

### Concept: Microtasks vs. Macrotasks

**What it is:** The event loop has (at least) TWO queues of pending work: the **microtask queue** (Promise callbacks — `.then`, `async`/`await` continuations) and the **macrotask queue** (`setTimeout`, I/O callbacks). After each piece of SYNCHRONOUS code finishes, the event loop drains the ENTIRE microtask queue BEFORE picking even ONE macrotask — meaning Promise callbacks ALWAYS run before `setTimeout` callbacks, regardless of delay values.

---

## Step 4 — Confirm the Ordering, Directly

```js
console.log('\n=== Microtasks vs Macrotasks ===')

console.log('1: synchronous')

setTimeout(() => {
  console.log('4: setTimeout (macrotask)')
}, 0)

Promise.resolve().then(() => {
  console.log('3: Promise.then (microtask)')
})

console.log('2: another synchronous line')
console.log('  ← actual execution order: 1, 2, 3, 4 — NOT the numbers as written')
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Microtasks vs Macrotasks ===
1: synchronous
2: another synchronous line
3: Promise.then (microtask)
4: setTimeout (macrotask)
  ← actual execution order: 1, 2, 3, 4 — NOT the numbers as written
```

**Trace WHY, precisely:** All SYNCHRONOUS code (`console.log('1: ...')`, scheduling the timer, scheduling the Promise callback, `console.log('2: ...')`) runs FIRST, to completion, uninterrupted — this is "1" then "2." ONLY once the synchronous code finishes does the event loop check its queues: it ALWAYS fully drains the MICROTASK queue first (running "3," the `Promise.then` callback) BEFORE processing even one MACROTASK (running "4," the `setTimeout` callback) — even though `setTimeout` was SCHEDULED first and given a `0`ms delay. This ordering is NOT a coincidence or a timing fluke; it's a GUARANTEED rule of how the event loop is specified to work.

**Change something:** Add a SECOND `Promise.resolve().then(...)` call. Confirm BOTH microtasks run before the `setTimeout` callback — the microtask queue is fully drained, however many items are in it, before any macrotask gets a turn.

---

## 🎯 Challenge: Promise.all for Concurrent I/O

**You know:** `await` pauses ONE async function at its own call site. Multiple INDEPENDENT async operations, awaited one after another with separate `await` statements, run SEQUENTIALLY — even though they don't actually depend on each other.

**Task:** Simulate 3 independent "network requests" (100ms, 150ms, 300ms) — first sequentially (measure the total time), then concurrently with `Promise.all` (measure again). Confirm the concurrent version takes roughly as long as the SLOWEST single request, not the SUM of all three.

<details>
<summary>▶ Show Solution</summary>

```js
function simulateRequest(label, ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(`${label} done`), ms)
  })
}

async function sequential() {
  const start = Date.now()
  await simulateRequest('A', 100)
  await simulateRequest('B', 150)               // doesn't START until A finishes — no reason for that dependency here
  await simulateRequest('C', 300)
  console.log(`sequential total: ~${Date.now() - start}ms`)   // ~550ms — 100+150+300
}

async function concurrent() {
  const start = Date.now()
  console.log('starting 3 "requests" at time 0ms')
  await Promise.all([                             // ← ALL THREE start at the same instant
    simulateRequest('A', 100),
    simulateRequest('B', 150),
    simulateRequest('C', 300),
  ])
  console.log(`all 3 finished after ~${Date.now() - start}ms (the SLOWEST one) — not 100+150+300=550ms`)
}

concurrent()
```

**Key insight:** `Promise.all([p1, p2, p3])` starts ALL THREE promises AT THE SAME TIME (each `simulateRequest` call begins its `setTimeout` immediately, before `Promise.all` is even called) and waits for ALL of them to finish — the TOTAL time is bounded by the SLOWEST one, not the SUM, because they're genuinely running CONCURRENTLY (interleaved, on the single thread, via the event loop) rather than one strictly after another. This is NOT the same as true PARALLELISM (LAB-6.3 in engineering-drills, and LAB-48 next) — it's still one thread — but for I/O-BOUND work (waiting on a network, a disk, a timer), concurrency alone delivers the real-world speedup, because the thread isn't doing CPU work during the wait anyway.

</details>

### SAVE AND TRY

```bash
node main.js
```

**Expected (approximate timing):**
```
=== Promise.all: Concurrent I/O ===
starting 3 "requests" at time 0ms
all 3 finished after ~300ms (the SLOWEST one) — not 100+150+300=550ms
```

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| The event loop, microtask/macrotask queues | Every Node.js server, and every browser tab (LAB-35 studied the SAME loop, browser-side) |
| Callbacks → Promises → async/await | The actual historical evolution of JavaScript's async story |
| `Promise.all` for concurrent I/O | Fetching multiple API endpoints at once, batch database queries |
| Non-blocking I/O | The entire reason Node.js can serve thousands of concurrent connections on ONE thread |

**Where you will see this again:** LAB-48 (Concurrency Models) contrasts this thread's single-threaded concurrency against Python's GIL, real threading, and multiprocessing — clarifying exactly what "concurrent" does and doesn't mean. LAB-51 (WebSocket Server) and every backend mini-project from here forward relies on this event loop model directly.

---

## Final Check

| Feature | How to verify |
|---|---|
| Blocking code visibly freezes execution order; non-blocking code doesn't | Step 1 |
| A Promise-wrapped async function behaves identically to its callback version | Step 2 |
| `async`/`await` produces the same result as manual `.then()` chaining, with linear-looking code | Step 3 |
| `Promise.then` callbacks always run before `setTimeout` callbacks, regardless of delay | Step 4 |
| `Promise.all` completes in roughly the SLOWEST individual duration, not the sum | Challenge |
| You can explain, without notes, why `await` doesn't freeze the whole program | Step 3 |

---

## Quick Check Answers

**1. How can single-threaded JS "wait" for a network request without freezing?**

It doesn't actually WAIT on the JS thread at all — the request is handed OFF to the runtime/OS (which handles the actual network I/O outside the JS thread), and JavaScript is immediately free to run OTHER code. When the response arrives, the runtime schedules a CALLBACK (or resolves a Promise) to run on the JS thread LATER — demonstrated directly in Step 1, where "after non-blocking call (scheduled)" printed immediately, well before the "non-blocking work done" callback fired.

**2. Does `setTimeout(fn, 0)` run before or after the rest of the synchronous code?**

AFTER — always. Even with a `0`ms delay, `setTimeout`'s callback is a MACROTASK, and ALL currently-running synchronous code finishes first, THEN the entire microtask queue drains, and ONLY THEN does the event loop get around to macrotasks like this one — demonstrated precisely in Step 4, where the `setTimeout(..., 0)` callback ("4") printed dead last, after both synchronous lines AND the Promise microtask.

**3. Is `async`/`await` "just sugar," or can it do something Promises alone cannot?**

It's genuinely "just sugar" in terms of CAPABILITY — anything expressible with `async`/`await` can be rewritten using `.then()`/`.catch()` chains directly (Step 3 demonstrated the equivalence), because the JavaScript engine transforms `async`/`await` into that same Promise machinery under the hood. The real value of `async`/`await` is READABILITY: linear, top-to-bottom-looking code instead of nested or chained callback structures — a genuine ergonomic improvement, but not a new CAPABILITY that Promises didn't already provide.

---

*Next: [LAB-48 — Concurrency Models](LAB-48-concurrency-models.md) — Python, same module*
