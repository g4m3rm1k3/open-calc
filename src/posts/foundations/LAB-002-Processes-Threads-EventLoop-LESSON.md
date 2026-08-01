# FOUNDATIONS — LAB-002 — Processes, Threads, and the Event Loop

**Prerequisites:** LAB-001 (call stack, heap, what a function call costs)

**What this lab adds:**
- You will freeze the browser on purpose and understand exactly why
- You will see the event loop's ordering rules — and they will surprise you
- You will understand why `setTimeout(fn, 0)` does not mean "run immediately"
- You will be able to predict the output order of any mix of sync code, Promises, and setTimeout

**Time:** 45–55 minutes

**Environment:** Browser DevTools console (F12 → Console). A visible webpage helps for the freeze demo — open any webpage (even google.com) before opening the console.

---

> **Quick Check — try to answer before reading:**
>
> 1. If JavaScript runs on one thread, how can a webpage play audio, animate something, and respond to clicks all at the same time?
> 2. What do you think `setTimeout(fn, 0)` does — does `fn` run immediately?
> 3. If you have a `for` loop that runs 10 billion iterations, what happens to the browser while it runs?
>
> *(Answers at the end of this lab)*

---

## What You Will Be Able To Do

When this lab is complete, you can look at any JavaScript file mixing synchronous code, `setTimeout`, and `Promise.resolve().then(...)` and write down the exact order the lines execute — before running it. You will understand why a slow database query does not freeze a web server, and why a 3-second `for` loop does freeze a browser.

---

## Step 1 — Freeze the Browser on Purpose

Open any webpage (google.com is fine). Open the console (F12 → Console). Paste this:

```js
// WARNING: this will freeze your browser tab for several seconds
const start = Date.now();
while (Date.now() - start < 3000) {
  // spin for 3 seconds doing nothing
}
console.log("done");
```

---

### SAVE AND TRY

Paste the code and press Enter.

**You should see:** The browser tab completely freezes. You cannot click anything. You cannot scroll. The page is a brick. After 3 seconds, `"done"` prints and the browser unfreezes.

**Try during the freeze:** Try clicking on the page. Try scrolling. Try clicking another tab in the same browser window. None of it works while the loop runs.

**Change something:** Change `3000` to `500`. Paste again. The freeze is shorter but still total — every UI interaction is blocked for exactly that duration. Change it back to `3000` to feel the full effect before moving on.

---

That freeze is not a bug. It is the direct consequence of how JavaScript works. To understand why, we need to understand what a thread is.

---

### Concept: Processes and Threads

**What it is:** A **process** is an isolated, running instance of a program with its own memory space. A **thread** is a unit of execution within a process — a sequence of instructions the CPU executes one at a time. A process can have multiple threads sharing its memory.

**The problem before:**

Two independent tasks need to happen simultaneously — like downloading a file while the user scrolls a webpage. With a single thread, only one thing happens at a time. The download would pause scrolling; scrolling would pause the download.

**The solution:**

Operating systems give each thread its own program counter (which instruction to execute next) and its own call stack. The OS scheduler rapidly switches the CPU between threads — so fast it appears simultaneous. Multiple physical CPU cores can run threads truly in parallel.

**What it hides:**

The OS scheduling. You write code that appears to run straight through. Behind the scenes, your thread is interrupted thousands of times per second, other threads run, then your thread resumes — all without your code knowing. The CPU registers are saved and restored each switch so your thread sees no gaps.

The invariant it protects: each thread has its own call stack and program counter. One thread's function calls do not interfere with another thread's function calls. Memory on the heap is shared — which is both the power and the danger of multi-threading (shared mutable state causes race conditions).

**Canonical example:**

A restaurant kitchen. The restaurant is the process. Each chef is a thread. Chefs share the kitchen (heap — shared memory) and work simultaneously. Two chefs can both reach for the same knife at once (race condition). The head chef (OS scheduler) assigns tasks and manages who does what. Each chef has their own notepad of current tasks (call stack — private to the thread).

**Smallest possible example** — check how many CPU cores your machine has:

```js
// This is not JavaScript — run in your browser console:
navigator.hardwareConcurrency
```

Expected: a number between 4 and 16 typically. That is how many threads your machine can run simultaneously. Each core can run one thread. Your browser can use all of them — but your JavaScript code runs on just one.

**Why it matters here:** JavaScript deliberately chose the single-threaded model to avoid the complexity of race conditions. You never need a mutex, a semaphore, or a lock in standard JavaScript because no other thread can touch your memory while your code runs. The tradeoff: if your code blocks, everything blocks.

**You will see this again in:**
- Python's GIL (Global Interpreter Lock) — Python also effectively runs one thread at a time for CPU-bound work
- Web Workers — JavaScript's way of running code on a second thread (isolated memory, no shared state)
- Node.js worker_threads — same concept for the server
- Database connection pools — each connection uses a thread on the database server
- Race conditions in any multi-threaded language (Go, Java, C++) — the nightmare that JavaScript's single-thread model avoids

**Watch for:** "JavaScript is single-threaded" does not mean it cannot do many things simultaneously. It means your code runs on one thread. The browser has many threads — for networking, rendering, audio. The event loop is how your single thread interacts with all those other threads' results.

---

### SAVE AND TRY

```js
navigator.hardwareConcurrency
```

Expected: the number of logical CPU cores on your machine.

```js
// Your JavaScript runs on ONE thread.
// This is the thread ID — but JavaScript does not expose it directly.
// Instead, confirm the single-thread model:

let blocked = false;

setTimeout(() => {
  blocked = true;  // runs after the loop
}, 0);

// Long loop:
const start = Date.now();
while (Date.now() - start < 100) {}

// Is blocked true yet?
console.log(blocked); // what prints?
```

**Expected:** `false`. The setTimeout callback cannot run while the `while` loop occupies the thread. Even though `0` milliseconds have elapsed, the callback must wait until the current synchronous task finishes. This is the key fact about the event loop.

**Change something:** Move `console.log(blocked)` inside a `setTimeout(() => { console.log(blocked) }, 50)`. Now `true` prints — because by then the thread is free and the callback has run.

---

### Concept: The Event Loop

**What it is:** The event loop is a loop that runs inside the JavaScript runtime — it checks whether the call stack is empty, and if so, picks the next task from the task queue and pushes it onto the stack to run.

**The problem before:**

JavaScript needs to handle results that arrive in the future — a network response, a timer firing, a user click — without blocking while waiting. With a blocking model, the thread would sit idle for 200ms waiting for a network response, unable to process any clicks or run any other code.

**The solution:**

```
The event loop — forever:

1. Run whatever is on the call stack until it is empty.
2. Drain the microtask queue (Promise callbacks) completely.
3. Pick one task from the task queue (setTimeout callbacks, click events, etc.).
4. Push it onto the stack. Go to step 1.
```

When you call `fetch(url)`, the browser's networking thread handles the HTTP request in the background. Your JavaScript thread continues running. When the network response arrives, the networking thread puts a callback into the task queue. The event loop picks it up the next time the call stack is empty.

**What it hides:**

All the coordination between the JavaScript thread and the browser's background threads (networking, timers, I/O). You write `await fetch(url)` and the language handles pausing your function, yielding the thread to other work, and resuming your function when the data arrives. Without the event loop, you would need threads, locks, and synchronization primitives to accomplish the same thing.

The invariant it protects: your JavaScript callback always runs on the main thread with an empty call stack. You never run in the middle of someone else's code. There are no data races in the core JavaScript memory model.

**Canonical example:**

A single waiter in a restaurant. The waiter (JavaScript thread) takes an order (function call), walks to the kitchen window, submits the ticket (starts an async operation — the kitchen is the background thread), then immediately returns to take the next table's order. When the kitchen rings a bell (task queue), the waiter finishes what they are currently doing, then goes to pick up the food (runs the callback). The waiter never stands at the kitchen window waiting — they keep working other tables.

**The exact execution order — this is where most developers are wrong:**

```
Priority 1: Current synchronous code (the call stack)
Priority 2: Microtasks — Promise .then() callbacks, queueMicrotask()
Priority 3: Macrotasks — setTimeout, setInterval, click events, fetch responses
```

Microtasks drain completely before any macrotask runs. This means a chain of `.then()` callbacks can run entirely before any `setTimeout(fn, 0)` fires.

**Smallest possible example** — predict the output before running:

```js
console.log("1 — sync");

setTimeout(() => console.log("2 — setTimeout"), 0);

Promise.resolve().then(() => console.log("3 — Promise"));

console.log("4 — sync");
```

Most people guess: `1, 2, 3, 4`. Or `1, 4, 2, 3`. The actual output is `1, 4, 3, 2`.

Why:
- `1` and `4` run synchronously (call stack)
- `3` runs as a microtask (Promise.then) before any macrotask
- `2` runs as a macrotask (setTimeout) after all microtasks

**Why it matters here:** Every async framework, every network request, every event handler you ever write is governed by these three priority levels. When a bug involves "why did X run before Y", the answer is almost always "one is a microtask and one is a macrotask."

**You will see this again in:**
- Node.js — uses the same event loop model for server-side I/O
- Every React rendering — state updates are batched and applied after the current event handler finishes (a microtask)
- `queueMicrotask()` — explicitly scheduling a microtask without creating a Promise
- The `async/await` desugaring — `await` is syntactic sugar for `.then()`, so everything after an `await` runs as a microtask when the Promise resolves
- Interview questions: "What is the event loop?" is on every JavaScript job interview

**Watch for:** `setTimeout(fn, 0)` does not mean "run immediately." It means "add this to the macrotask queue after at least 0ms." The actual delay is always at least one event loop tick — and often much longer if the task queue is busy.

---

### SAVE AND TRY

Paste this and predict the output before pressing Enter:

```js
console.log("A");

setTimeout(() => console.log("B"), 0);
setTimeout(() => console.log("C"), 0);

Promise.resolve()
  .then(() => console.log("D"))
  .then(() => console.log("E"));

console.log("F");
```

Write down your prediction. Then press Enter.

**Expected output:**
```
A
F
D
E
B
C
```

**Walk through it:**
1. `A` — synchronous, runs immediately
2. `B` callback is placed in the macrotask queue (not run yet)
3. `C` callback is placed in the macrotask queue (not run yet)
4. `D` callback is placed in the microtask queue
5. `F` — synchronous, runs immediately
6. Call stack is now empty. Drain microtasks:
   - `D` runs → its `.then()` queues `E` → `E` runs (microtasks drain fully)
7. Pick next macrotask: `B` runs
8. Pick next macrotask: `C` runs

**Change something:** Add a second `.then()` to the Promise chain before `D`:

```js
Promise.resolve()
  .then(() => { setTimeout(() => console.log("X"), 0); })
  .then(() => console.log("D"))
  .then(() => console.log("E"));
```

Predict where `X` appears in the output, then run it. `X` appears after `B` and `C` because scheduling a `setTimeout` inside a microtask puts the callback in the macrotask queue — which runs after all current microtasks.

---

## Step 2 — The Freeze, Fixed

Here is the frozen `while` loop from Step 1, and the non-blocking version next to it:

```js
// BLOCKING — freezes everything for 3 seconds:
function blockingWork() {
  const start = Date.now();
  while (Date.now() - start < 3000) {}
  console.log("blocking done");
}

// NON-BLOCKING — yields the thread on each chunk:
function nonBlockingWork(totalMs) {
  const chunkMs = 50; // work for 50ms, then yield
  const start = Date.now();

  function doChunk() {
    const chunkStart = Date.now();
    while (Date.now() - chunkStart < chunkMs) {
      // simulate work
    }
    if (Date.now() - start < totalMs) {
      setTimeout(doChunk, 0); // yield the thread, schedule next chunk
    } else {
      console.log("non-blocking done");
    }
  }

  doChunk();
}
```

---

### SAVE AND TRY

First test the blocking version:
```js
blockingWork();
```
Expected: Tab freezes for 3 seconds, then `"blocking done"` prints.

Now test the non-blocking version:
```js
nonBlockingWork(3000);
```
Expected: `"non-blocking done"` prints after ~3 seconds, but the tab stays responsive. While it runs, try clicking on the page, scrolling, or opening a new tab. Everything works — because every 50ms the thread is released to handle other events.

**Change something:** Change `chunkMs` from `50` to `500`. Now the page freezes in 500ms chunks with gaps between them. You can feel the stuttering. Change it back to `50` — the yielding is frequent enough that it feels smooth.

**In the console, while nonBlockingWork is running:**
```js
Date.now()
```
Expected: A timestamp. The console responds — proving the thread is not blocked.

---

### Concept: Non-Blocking I/O

**What it is:** Non-blocking I/O means that starting an I/O operation (reading a file, making a network request, querying a database) does not block the thread — the operation runs in the background, and a callback runs on the event loop when it completes.

**The problem before:**

```
// Imagine if fetch were blocking (it is not — this is hypothetical):
let response = blockingFetch("https://api.example.com/data"); // thread freezes here
let data = response.json();   // resumes 200ms later
render(data);
// During those 200ms: zero clicks processed, zero animations, zero other requests
```

A typical web server handles thousands of requests per second. If each database query (10–50ms) blocked the thread, one slow query would make all other requests wait. A server with 1,000 concurrent users would become unusable.

**The solution:**

The OS handles I/O via interrupt-driven or completion-port mechanisms. When you start a network read, the OS registers interest in that socket, and your thread continues. When data arrives, the OS delivers an interrupt, the runtime puts your callback in the task queue, and the event loop picks it up.

```js
// How fetch actually works:
fetch("https://api.example.com/data")  // registers interest, returns immediately
  .then(r => r.json())                 // callback queued when response arrives
  .then(data => render(data));         // callback queued when JSON is parsed

// All of this continues running while fetch is in progress:
doOtherWork();
handleOtherRequests();
updateAnimation();
```

**What it hides:**

The OS-level socket management, the interrupt mechanism, and the callback registration. You write `.then()` and the entire machinery of "tell the OS to watch this socket, wake me up when it has data, put my callback on the queue, run the callback on the right thread" is invisible.

The invariant it protects: the JavaScript thread is never idle while I/O is in progress. It always has other work it can do. Throughput is high because the thread spends its time executing JavaScript, not waiting for bytes from a disk or network.

**Canonical example:**

Ordering food at a restaurant with a buzzer. You order (start the I/O operation), get a buzzer (the callback registration), and go sit down (thread continues with other work). When your food is ready (I/O complete), the buzzer goes off (callback added to queue), and you go pick it up (callback runs). You are not standing at the counter waiting. The counter person is not standing there waiting for you.

**Smallest possible example:**

```js
// Start a fetch and immediately continue doing other work:
const promise = fetch("https://jsonplaceholder.typicode.com/todos/1");

console.log("fetch started — thread continues immediately");
console.log("doing other work...");

// The response arrives later and the callback runs:
promise
  .then(r => r.json())
  .then(data => console.log("response arrived:", data.title));

console.log("this runs BEFORE the response arrives");
```

**Why it matters here:** Node.js is built entirely on this model. A single-threaded Node.js server handles thousands of concurrent database queries because none of them block the thread. When you later build the GEOMETRY backend with FastAPI and async database calls, this is the model that makes it work.

**You will see this again in:**
- Node.js — the entire platform is built on non-blocking I/O via libuv
- FastAPI's `async def` endpoints — same model, different runtime
- Python's asyncio — same event loop concept in Python
- Every database driver for JavaScript — they all return Promises, never block
- Server performance benchmarks — "10,000 concurrent connections" is achievable with event loop I/O, not with one thread per connection

**Watch for:** Non-blocking I/O is only efficient for I/O-bound work (waiting for network, disk). For CPU-bound work (image processing, video encoding, path calculations), the thread must actually do computation — there is nothing to yield to. CPU-heavy work needs Web Workers or worker threads to avoid blocking.

---

### SAVE AND TRY

```js
// Demonstrate that fetch does not block:
const start = Date.now();

fetch("https://jsonplaceholder.typicode.com/todos/1")
  .then(r => r.json())
  .then(data => {
    console.log(`Response arrived after ${Date.now() - start}ms:`, data.title);
  });

// This runs BEFORE the fetch completes:
console.log(`After starting fetch: ${Date.now() - start}ms elapsed`);
```

Expected: "After starting fetch: 0ms elapsed" prints immediately. The response arrives 50–300ms later (network dependent) and its log appears afterward.

**Change something:** Add another `fetch()` for a different URL at the same time. Both start simultaneously — the thread does not wait for the first before starting the second. Both responses arrive and log independently. This is concurrency without threads.

---

## 🎯 Challenge: Predict and Explain the Output

**You know:** The event loop runs sync code first, then drains microtasks (Promises) fully, then runs one macrotask (setTimeout), then drains microtasks again, and repeats.

**Task:** Without running it, predict the exact output order of this code. Write your prediction down first. Then run it and check. If you were wrong, explain each line you mispredicted.

```js
console.log("start");

setTimeout(() => {
  console.log("timeout 1");
  Promise.resolve().then(() => console.log("promise inside timeout"));
}, 0);

Promise.resolve()
  .then(() => {
    console.log("promise 1");
    setTimeout(() => console.log("timeout inside promise"), 0);
  })
  .then(() => console.log("promise 2"));

setTimeout(() => console.log("timeout 2"), 0);

console.log("end");
```

**Hints:**

1. Trace the macrotask queue and microtask queue step by step, not just the code lines
2. When a microtask schedules a macrotask, that macrotask goes to the END of the macrotask queue

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

**Predicted output:**
```
start
end
promise 1
promise 2
timeout 1
promise inside timeout
timeout 2
timeout inside promise
```

**Step-by-step trace:**

**Sync phase (call stack):**
- `"start"` → logged
- `setTimeout(timeout1, 0)` → macrotask queue: `[timeout1]`
- `Promise.resolve().then(p1)` → microtask queue: `[p1]`
- `setTimeout(timeout2, 0)` → macrotask queue: `[timeout1, timeout2]`
- `"end"` → logged
- Call stack empty. Check microtasks.

**Microtask drain:**
- Run `p1`: logs `"promise 1"`, schedules `timeout-inside-promise` → macrotask queue: `[timeout1, timeout2, timeout-inside-promise]`. Its `.then(p2)` queues `p2` → microtask queue: `[p2]`
- Run `p2`: logs `"promise 2"`. Microtask queue empty.

**First macrotask: `timeout1`:**
- Logs `"timeout 1"`, schedules `promise-inside-timeout` → microtask queue: `[promise-inside-timeout]`
- `timeout1` finishes. Drain microtasks.
- Run `promise-inside-timeout`: logs `"promise inside timeout"`. Microtask queue empty.

**Second macrotask: `timeout2`:**
- Logs `"timeout 2"`. No microtasks queued. Done.

**Third macrotask: `timeout-inside-promise`:**
- Logs `"timeout inside promise"`. Done.

**Key insight:** The event loop drains the *entire* microtask queue after *each* macrotask — not just once at the end. This means if a macrotask schedules a Promise, that Promise runs before the next macrotask. The microtask/macrotask interleaving is the most commonly misunderstood part of the event loop.

</details>

---

## What Just Happened

JavaScript's single-threaded model is a deliberate choice. It eliminates race conditions — your code is never interrupted mid-execution by another piece of your code. The tradeoff is that if you block the thread (a long synchronous loop), everything blocks: rendering, clicks, timers, fetch responses. All of it queues up, waiting for your code to finish.

The event loop is the mechanism that makes the single-thread model work for real applications. It continuously checks: is the call stack empty? If yes, pull the next task. Microtasks (Promise callbacks) have higher priority than macrotasks (setTimeout, I/O callbacks), and the microtask queue drains completely before any macrotask runs. This is why async code in JavaScript feels concurrent even though only one thing runs at a time.

Non-blocking I/O is what makes this scale. Starting a network request does not occupy the thread — the OS watches the socket. The thread is free to handle other events. When the data arrives, the callback is queued. A Node.js server handles 10,000 concurrent database queries with one thread because the thread is never sitting idle — it is always running callbacks for whichever queries just completed.

---

## Final Check

| You can do this | This demonstrates |
|---|---|
| A `while` loop running for 3 seconds freezes all browser interaction | JavaScript runs on one thread; blocking the thread blocks everything |
| `setTimeout(fn, 0)` does not run `fn` before subsequent synchronous code | `setTimeout` is a macrotask; sync code always runs first |
| `Promise.resolve().then(fn)` runs before `setTimeout(fn, 0)` | Microtasks (Promises) are drained before any macrotask runs |
| `fetch()` does not block the thread while waiting for the response | Non-blocking I/O: the OS handles the socket; the thread continues |
| The chunked `nonBlockingWork` function keeps the UI responsive | Yielding via `setTimeout` allows the event loop to process other events between chunks |
| Correctly predicting the output of mixed sync/Promise/setTimeout code | Full understanding of the event loop's three priority levels |
