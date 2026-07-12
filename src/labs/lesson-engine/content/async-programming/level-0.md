---
series: async-programming
level: 0
title: Concurrency Without Threads — The Event Loop Model
lang: javascript
---

# Concurrency Without Threads — The Event Loop Model

Most programming languages handle concurrent tasks with threads: run this code in parallel with that code, each in its own thread. JavaScript takes a different approach. It has a single main thread and a cooperative concurrency model called the event loop. Understanding this model is the prerequisite for writing correct async JavaScript — including avoiding the subtle bugs that arise from getting the model wrong.

You saw the event loop briefly in the debugging series. This lesson goes deeper: how the call stack, task queue, and microtask queue interact, what "non-blocking" means, and why JavaScript can handle thousands of concurrent requests without parallelism. By the end of this lesson you will have an accurate mental model of JavaScript's concurrency that you can reason from when debugging async bugs.

## Why single-threaded concurrency exists

```text
THE THREADING PROBLEM:
  Traditional multi-threaded servers allocate one thread per connection.
  A thread requires: ~1 MB of stack memory + OS scheduling overhead.
  A server with 10,000 simultaneous connections = ~10 GB just for thread stacks.
  PLUS: threads share memory → race conditions, deadlocks, locks, synchronisation.

  For I/O-bound work (waiting for database, network, disk), threads spend most
  of their time waiting — they are idle but still consuming resources.

THE EVENT LOOP ALTERNATIVE:
  One thread. Never blocks. When waiting for I/O, register a callback and move on.
  When the I/O completes, run the callback.
  10,000 simultaneous connections = 10,000 registered callbacks waiting for I/O.
  Memory: proportional to the number of active callbacks, not number of threads.

  This model was pioneered by Node.js and Nginx.
  Node.js can handle 100,000+ concurrent connections on a laptop.
```

## The three-queue model

JavaScript has three runtime components that coordinate execution:

```text
THE EVENT LOOP MODEL:

  ┌───────────────────────────┐
  │       CALL STACK          │  ← JavaScript currently executing
  │   (one frame at a time)   │
  └──────────────┬────────────┘
                 │  when empty:
     ┌───────────▼───────────┐
     │   MICROTASK QUEUE     │  ← Promise callbacks, queueMicrotask()
     │   (drain completely)  │     ALL microtasks run before returning to task queue
     └───────────┬───────────┘
                 │  when empty:
     ┌───────────▼───────────┐
     │    TASK QUEUE         │  ← setTimeout, setInterval, I/O callbacks
     │  (one task at a time) │     Only ONE task is taken per event loop turn
     └───────────────────────┘

EVENT LOOP ALGORITHM (simplified):
  1. Run the current synchronous code until the call stack is empty.
  2. Drain the microtask queue: run ALL queued microtasks until it is empty.
     (New microtasks added during this step are also run immediately.)
  3. Take ONE task from the task queue. Run it (which may add new microtasks).
  4. Drain the microtask queue again.
  5. Repeat.
```

## Execution order trace

```javascript
console.log('1: start')

setTimeout(() => console.log('4: timeout'), 0)

Promise.resolve()
  .then(() => console.log('2: microtask 1'))
  .then(() => console.log('3: microtask 2'))

console.log('1b: still synchronous')
```

```text
EXECUTION TRACE:

  Synchronous (call stack):
    console.log('1: start')          → prints "1: start"
    setTimeout(fn, 0)                → fn added to TASK QUEUE (not executed yet)
    Promise.resolve().then(fn1)      → fn1 added to MICROTASK QUEUE
    .then(fn2)                       → fn2 will be added after fn1 resolves
    console.log('1b: still sync')    → prints "1b: still synchronous"
    
  Call stack is now empty. Check microtask queue:
    fn1 runs → prints "2: microtask 1"
    fn1's .then(fn2) adds fn2 to MICROTASK QUEUE
    fn2 runs → prints "3: microtask 2"
    Microtask queue is empty.

  Take one task from task queue:
    timeout callback runs → prints "4: timeout"

OUTPUT ORDER:
  1: start
  1b: still synchronous
  2: microtask 1
  3: microtask 2
  4: timeout
```

**CS lens:** The event loop is an implementation of the **reactor pattern** — a design for handling concurrent I/O in a single thread. The reactor (the event loop) multiplexes events (I/O completion, timers, messages) onto a single execution context. When a selector detects that an I/O operation is complete (the OS signals readiness), the reactor dispatches the associated callback. This is fundamentally different from the **proactor pattern** (used in threading models), where work is dispatched proactively to threads that block until I/O completes. The reactor model handles I/O completion; the proactor model handles I/O initiation.

## What "non-blocking" means

```javascript
// BLOCKING (hypothetical — not real Node.js):
// The call stack is occupied for the entire 1 second.
// No other code can run during this second.
const result = db.querySync('SELECT * FROM users')   // blocks for 1 second

// NON-BLOCKING (real Node.js):
// The call stack is freed immediately.
// The event loop can run other tasks while the database query executes.
db.query('SELECT * FROM users', (err, result) => {
  // This runs when the database has responded — could be 1 second later.
  // The event loop ran other callbacks during that second.
  console.log(result)
})
console.log('This runs BEFORE the query completes!')
```

```text
THE NON-BLOCKING GUARANTEE:
  A Node.js function that initiates I/O (fetch, fs.readFile, db.query) does not wait
  for the I/O to complete before returning. It:
    1. Tells the OS to perform the I/O
    2. Registers a callback to run when it's done
    3. Returns immediately

  The OS performs the I/O in a separate thread (or using async I/O syscalls).
  When it completes, it signals the event loop.
  The event loop adds the callback to the task queue.
  The callback runs when the call stack is empty.

  RESULT: JavaScript can "do" 1,000 I/O operations simultaneously
  even though it has only one thread — it's just waiting for all of them,
  and running callbacks as each completes.
```

## The main thread starvation problem

The event loop's single thread means that long-running synchronous code blocks everything:

```javascript
// This blocks the event loop for ~5 seconds:
function expensiveComputation() {
  let sum = 0
  for (let i = 0; i < 5_000_000_000; i++) {
    sum += i
  }
  return sum
}

app.get('/total', (req, res) => {
  const result = expensiveComputation()   // BLOCKS: no requests served for 5 seconds
  res.json({ result })
})
```

```text
MAIN THREAD STARVATION CONSEQUENCES:
  → While expensiveComputation runs, the event loop is blocked
  → No other requests are processed
  → No timers fire
  → No Promises resolve
  → The server is effectively down for all users

SOLUTIONS:
  → Web Workers (browser): run the computation in a background thread
    const worker = new Worker('./compute.js')
  → Worker threads (Node.js): same idea
    const { Worker } = require('worker_threads')
  → Break the computation into chunks with setTimeout between chunks
    (yields back to the event loop between chunks)
  → Offload to a dedicated compute service or job queue
```

**SE lens:** The practical implication for web APIs: a Node.js server can handle thousands of concurrent database queries (all async, all non-blocking) but will choke on a single synchronous CPU-intensive task. This is why CPU-intensive work (image processing, PDF generation, machine learning inference, cryptographic key generation) must be moved off the main thread. The architecture decision: Node.js is an excellent choice for I/O-bound workloads (APIs, proxies, real-time servers) and a poor choice for CPU-bound workloads (use Go, C++, or a worker thread pool for those).

**Common mistakes:**
- Assuming `setTimeout(fn, 0)` means "run immediately" — it means "add to the task queue." Pending microtasks run first. If there are 1,000 pending microtask callbacks, they all run before the timeout callback.
- Doing synchronous heavy work in async-looking code — `async function processAll(items) { for (const item of items) { processSync(item) } }` — the `async` keyword does not make the loop asynchronous. The synchronous processing still blocks the event loop.
- Forgetting that `await` suspends the function — when you `await` a Promise, the current function is suspended. The event loop can run other code. When the Promise resolves, the function resumes. This suspension is what allows cooperative concurrency.

**Debug tip:** If a Node.js server becomes unresponsive without crashing, it is usually event loop blocking: a synchronous operation (CPU-intensive computation, synchronous file read, blocking crypto) is occupying the main thread. Profile with `--prof` or use the `clinic` tool to identify blocking operations. The symptom: all requests timeout simultaneously, server recovers when the blocking operation completes.

## Challenge: event_loop_trace

Predict the output order of async code by tracing the event loop.

```challenge
function eventLoopTrace(scenario) {
  // scenario: 'basic' | 'promise-chain' | 'mixed'
  // Returns: string[] — the console.log outputs in order

  if (scenario === 'basic') {
    // console.log('A')
    // setTimeout(() => console.log('B'), 0)
    // Promise.resolve().then(() => console.log('C'))
    // console.log('D')
    return []   // fill in the correct order
  }

  if (scenario === 'promise-chain') {
    // console.log('start')
    // Promise.resolve()
    //   .then(() => { console.log('p1'); return Promise.resolve() })
    //   .then(() => console.log('p2'))
    // console.log('end')
    return []
  }

  if (scenario === 'mixed') {
    // setTimeout(() => console.log('t1'), 0)
    // Promise.resolve().then(() => {
    //   console.log('m1')
    //   setTimeout(() => console.log('t2'), 0)
    // })
    // console.log('sync')
    return []
  }
}
```

```test
const basic = eventLoopTrace('basic')
assert basic[0] === 'A'
assert basic[1] === 'D'
assert basic[2] === 'C'
assert basic[3] === 'B'

const chain = eventLoopTrace('promise-chain')
assert chain[0] === 'start'
assert chain[1] === 'end'
assert chain[2] === 'p1'
assert chain[3] === 'p2'

const mixed = eventLoopTrace('mixed')
assert mixed[0] === 'sync'
assert mixed[1] === 'm1'
assert mixed[2] === 't1'
assert mixed[3] === 't2'
```
