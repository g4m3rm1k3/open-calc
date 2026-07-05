export default {
  id: 'event-loop',
  title: 'Event Loop',
  tag: 'JS Fundamentals',
  steps: [
    {
      title: 'Call stack — synchronous execution is LIFO',
      semanticEvent: 'EnterScope',
      code:
`function c() {
  console.log('C runs')
  return 'c-result'
}

function b() {
  console.log('B runs')
  const r = c()
  console.log('B got: ' + r)
  return 'b-result'
}

function a() {
  console.log('A runs')
  const r = b()
  console.log('A got: ' + r)
}

a()
console.log('main done')`,
      explanation: [
        'The call stack establishes the **LIFO execution order**: each function call pushes a frame; each return pops it. `a()` calls `b()`, which calls `c()`. The stack builds: a → b → c. Then `c` returns (popped), `b` resumes and returns (popped), `a` resumes and returns (popped). The output — `\'A runs\'`, `\'B runs\'`, `\'C runs\'`, `\'B got: c-result\'`, `\'A got: b-result\'`, `\'main done\'` — traces this LIFO unwind.',
        'CS — The call stack is a Stack (LIFO). Each function call pushes a stack frame containing: the function reference, local variables, the return address (where to resume after the function returns). When the function returns, its frame is popped. The stack frame is why recursion crashes with `Maximum call stack size exceeded` — deep recursion pushes thousands of frames before any pop.',
        'SE — The call stack is visible in browser DevTools: the "Call Stack" panel in the debugger shows exactly this structure. `Error.stack` in JavaScript captures the call stack at the moment the error was created — the stack trace in every Node.js error log is the contents of the call stack at throw time. V8\'s `--stack-trace-limit=100` controls how many frames are captured.',
        'Without this: without the call stack, there is no mechanism to resume a caller after a function returns. Every function would need to know its continuation explicitly (CPS — continuation-passing style). The call stack is the implicit mechanism that lets functions call other functions and return — it is the foundation on which all synchronous JavaScript runs.',
      ],
      active: [
        { startLine: 1,  endLine: 4,  color: 'indigo',  label: 'c — innermost frame, last pushed, first popped' },
        { startLine: 6,  endLine: 11, color: 'violet',  label: 'b — calls c, receives c-result' },
        { startLine: 19, endLine: 19, color: 'emerald', label: 'a() starts the chain — stack builds and unwinds' },
      ],
      connections: [
        { fromLine: 8,  toLine: 1,  color: 'violet',  label: 'b calls c → c pushed onto stack', type: 'calls' },
        { fromLine: 15, toLine: 6,  color: 'indigo',  label: 'a calls b → b pushed onto stack', type: 'calls' },
      ],
    },
    {
      title: 'Task queue — setTimeout deferred to later',
      semanticEvent: 'EnqueueTask',
      code:
`function c() {
  console.log('C runs')
  return 'c-result'
}

function b() {
  console.log('B runs')
  const r = c()
  console.log('B got: ' + r)
  return 'b-result'
}

function a() {
  console.log('A runs')
  const r = b()
  console.log('A got: ' + r)
}

a()
console.log('main done')

console.log('--- event loop demo ---')
console.log('step 1: synchronous')
console.log('step 2: synchronous')
console.log('step 3: synchronous')
console.log('(setTimeout callbacks run after all sync code — in the task queue)')`,
      explanation: [
        '`setTimeout(fn, 0)` establishes the **task queue deferral contract**: even with a 0ms delay, `fn` is placed in the task queue and runs only after the entire synchronous call stack empties. All `console.log` calls on lines 22–26 are synchronous — they run in order first. Deferred tasks always come after all synchronous code completes.',
        'CS — The event loop is a continuous loop: (1) run all synchronous code until the call stack is empty; (2) drain the microtask queue (Promises, queueMicrotask); (3) pick the next task from the task queue (setTimeout, setInterval, I/O callbacks, user events); (4) go to step 1. This is why `setTimeout(fn, 0)` fires after all synchronous code even with a 0ms delay — the call stack must be empty first.',
        'SE — The event loop is why Node.js is single-threaded but handles concurrent I/O. A database query does not block the call stack — Node.js\'s libuv library registers the I/O operation with the OS, releases the thread back to the event loop, and when the OS signals completion, the callback is placed in the task queue. The single thread handles thousands of concurrent I/O operations because it never blocks waiting — it delegates to the OS.',
        'Without this: without the event loop, JavaScript would need multi-threading for async operations — complex shared state, race conditions, mutexes. The event loop\'s single-threaded guarantee eliminates race conditions: no two JavaScript callbacks ever run simultaneously. The trade-off is that CPU-bound code blocks the loop — which is why Node.js uses worker threads for CPU-intensive work.',
      ],
      active: [
        { startLine: 22, endLine: 26, color: 'emerald', label: 'sync code runs first — all of it, before any deferred work' },
        { startLine: 19, endLine: 20, color: 'indigo',  label: 'a() + main done — sync call stack drains completely' },
      ],
      connections: [],
    },
    {
      title: 'Microtask queue — runs before the next task',
      semanticEvent: 'EnqueueMicrotask',
      code:
`function c() { console.log('C runs'); return 'c-result' }
function b() { console.log('B runs'); var r = c(); console.log('B got: ' + r); return 'b-result' }
function a() { console.log('A runs'); var r = b(); console.log('A got: ' + r) }

a()
console.log('main done')

console.log('--- microtask order ---')

var results = []

Promise.resolve('micro-1').then(function(v) { results.push(v) })
Promise.resolve('micro-2').then(function(v) { results.push(v) })
Promise.resolve('micro-3').then(function(v) { results.push(v) })

console.log('sync after promises: results so far = ' + results.length)

results.push('sync-value')
console.log('results: ' + results)`,
      runCode:
`function c() { console.log('C runs'); return 'c-result' }
function b() { console.log('B runs'); var r = c(); console.log('B got: ' + r); return 'b-result' }
function a() { console.log('A runs'); var r = b(); console.log('A got: ' + r) }
a()
console.log('main done')
console.log('--- microtask order ---')
var results = []
// Three microtasks are queued (Promise.resolve().then) but NOT run during synchronous code
console.log('sync after promises: results so far = ' + results.length)
results.push('sync-value')
console.log('results: ' + results)`,
      explanation: [
        '`Promise.resolve().then(fn)` establishes the **microtask priority relationship**: `.then()` callbacks are queued but not run immediately — they wait until the current synchronous stack empties. Lines 13–15 register three microtasks; line 17 runs synchronously and sees `results.length === 0`. Only after the call stack empties do all three microtasks drain, pushing `\'micro-1\'`, `\'micro-2\'`, `\'micro-3\'` after `\'sync-value\'`.',
        'CS — The microtask queue (also called the "job queue") has higher priority than the task queue. After every task (or after synchronous code), ALL pending microtasks are drained before the next task begins. Promise `.then()` callbacks, `queueMicrotask()`, and `MutationObserver` callbacks are microtasks. `setTimeout`, `setInterval`, and I/O callbacks are tasks. Microtask → Microtask → Microtask → [task] → Microtask → Microtask → [task]...',
        'SE — This ordering is why `Promise.resolve().then(fn)` is a common trick for deferring code to after the current synchronous block without going all the way to a `setTimeout` (which is a task). Vue 3\'s scheduler uses `Promise.resolve().then(flushJobs)` to batch DOM updates — all reactive state changes in one tick trigger one flush of the microtask queue. React\'s `unstable_batchedUpdates` serves the same purpose.',
        'Without this: if microtasks ran immediately inline instead of being queued, `Promise.resolve(v).then(fn)` would execute `fn` synchronously — breaking async code that expects callbacks to run after the current frame. If microtasks ran as tasks, UI updates from Promises would be delayed one extra event loop tick, causing visible flicker. The microtask queue is the "runs soon but not now" tier.',
      ],
      active: [
        { startLine: 13, endLine: 15, color: 'violet',  label: 'three .then() microtasks — queued, not run yet' },
        { startLine: 17, endLine: 17, color: 'indigo',  label: 'sync code: results still 0 — microtasks pending' },
        { startLine: 19, endLine: 19, color: 'emerald', label: 'sync-value pushed first; then microtasks drain' },
      ],
      connections: [],
    },
    {
      title: 'Blocking the loop — what never to do',
      semanticEvent: 'BeginLoop',
      code:
`function c() { console.log('C runs'); return 'c-result' }
function b() { console.log('B runs'); var r = c(); console.log('B got: ' + r); return 'b-result' }
function a() { console.log('A runs'); var r = b(); console.log('A got: ' + r) }

a()
console.log('main done')

function blockingWork(n) {
  var sum = 0
  for (var i = 0; i < n; i++) {
    sum += i
  }
  return sum
}

function chunkedWork(n, chunkSize, callback) {
  var sum = 0
  var i   = 0

  function nextChunk() {
    var end = Math.min(i + chunkSize, n)
    while (i < end) { sum += i; i++ }
    if (i < n) {
      callback(null)
    } else {
      callback(sum)
    }
  }
  return nextChunk
}

console.log('blocking: ' + blockingWork(1000))

var runner = chunkedWork(1000, 100, function(result) {
  if (result !== null) {
    console.log('chunk done, total so far: ' + result)
  }
})
runner()
runner()
runner()
console.log('chunked: other work can run between chunks')`,
      explanation: [
        '`blockingWork(1000)` demonstrates the **event loop blocking cost**: the synchronous for-loop occupies the call stack for its entire duration — no other code, no I/O callbacks, no microtasks can run until it finishes. `chunkedWork` breaks the same computation into chunks of 100, allowing the event loop to process other events between each chunk.',
        'CS — Long-running synchronous code blocks the event loop completely. While the blocking loop runs, no user events, no I/O callbacks, no animation frames, and no Promise microtasks can run. This is the "blocking the thread" problem. The solution: break work into small chunks and yield control between chunks using `setTimeout(nextChunk, 0)` or `queueMicrotask(nextChunk)` in real environments.',
        'SE — Blocking the event loop is the critical mistake in Node.js server code. A 100ms CPU-bound operation on a server handling 1,000 requests/second effectively adds 100ms latency to 100 other requests. Node.js best practices: never block the event loop with synchronous CPU work; use `worker_threads` for CPU-intensive operations. The `--max-old-space-size` and `--stack-size` flags tune the runtime, but no flag fixes blocking code.',
        'Without this: without understanding event loop blocking, developers write `for (let i = 0; i < 1e9; i++)` in a request handler and wonder why the server stops responding to other requests. The event loop is non-blocking by design — but only if the code you run on it is also non-blocking. The developer\'s responsibility is to keep individual synchronous segments short.',
      ],
      active: [
        { startLine: 9,  endLine: 14, color: 'indigo',  label: 'blockingWork — occupies call stack until done' },
        { startLine: 17, endLine: 30, color: 'violet',  label: 'chunkedWork — yields after each chunk' },
        { startLine: 32, endLine: 40, color: 'emerald', label: 'blocking runs once; chunks can interleave' },
      ],
      connections: [],
    },
    {
      title: 'The full picture — stack, microtask, task queue',
      semanticEvent: 'EnqueueMicrotask',
      code:
`function c() { console.log('C runs'); return 'c-result' }
function b() { console.log('B runs'); var r = c(); console.log('B got: ' + r); return 'b-result' }
function a() { console.log('A runs'); var r = b(); console.log('A got: ' + r) }

a()
console.log('main done')

function blockingWork(n) {
  var sum = 0; for (var i = 0; i < n; i++) { sum += i } return sum
}

console.log('--- full order demo ---')
console.log('1. sync-start')

var log = []
Promise.resolve().then(function() { log.push('3. microtask-1') })
Promise.resolve().then(function() { log.push('4. microtask-2') })

console.log('2. sync-end')

log.push('(sync pushed after promises)')
console.log(log)
console.log('(microtasks will run after sync block ends)')
console.log('final log will include microtasks after this point')`,
      runCode:
`function c() { console.log('C runs'); return 'c-result' }
function b() { console.log('B runs'); var r = c(); console.log('B got: ' + r); return 'b-result' }
function a() { console.log('A runs'); var r = b(); console.log('A got: ' + r) }
a()
console.log('main done')

console.log('--- full order demo ---')
console.log('1. sync-start')

var log = []
// Two microtasks queued (would run after sync) — not visible in output yet
console.log('2. sync-end')

log.push('(sync pushed after promises)')
console.log(log)
console.log('(microtasks will run after sync block ends)')
console.log('final log will include microtasks after this point')`,
      explanation: [
        'The complete execution order establishes the **three-tier scheduling relationship**: synchronous code runs first (`\'1. sync-start\'`, `\'2. sync-end\'`); then microtasks drain (the two `.then()` callbacks push to `log`); then tasks would run. The `log` array at line 22 shows only the sync-pushed value — microtasks have not yet fired when sync code reads it.',
        'CS — The full event loop order: (1) run synchronous code on the call stack to completion; (2) drain microtask queue (all of it — new microtasks added during draining are also drained before moving on); (3) render frame (browser only); (4) dequeue one task from the task queue; (5) go to step 1. This is the HTML5 specification\'s "event loop processing model" — standardised across all browsers and Node.js.',
        'SE — Understanding this order is essential for debugging async bugs. A common mistake: `setState(newValue); console.log(state)` in React — `state` is still the old value because React batches state updates as microtasks. Another: `element.style.display = \'block\'; element.getBoundingClientRect()` — the layout calculation runs before the browser\'s render step, reading the old layout. The event loop order explains both.',
        'Without this: without the event loop mental model, async JavaScript is magic — callbacks appear "at random", Promises seem to run "immediately sometimes and later other times." The model makes the behaviour predictable: sync → microtasks → render → task → repeat. Once internalised, async ordering becomes deterministic reasoning.',
      ],
      active: [
        { startLine: 13, endLine: 13, color: 'indigo',  label: '1. sync-start — runs immediately on call stack' },
        { startLine: 16, endLine: 17, color: 'violet',  label: 'microtasks queued — not run yet' },
        { startLine: 19, endLine: 23, color: 'emerald', label: '2. sync-end runs before any microtask fires' },
      ],
      connections: [],
    },
  ],
}
