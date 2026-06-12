# Lesson 37 — Concurrency and the Event Loop

## What You Will Build

Demonstrate the event loop in action by building a task queue UI: tasks are submitted,
queued, and processed one at a time. Implement a Worker Thread for a CPU-intensive
operation (syntax highlighting for large files) that would otherwise block the UI.
Fix a real race condition in the lesson completion flow.

---

## What You Need to Know First

- Lesson 16: Promises, async/await, `AbortController`
- Lesson 25: Event loop basics, WebSocket concurrency

---

## The Lesson

### Step 1 — The Event Loop, Precisely

JavaScript is single-threaded: only one piece of code executes at a time. The **event loop**
determines which piece runs next.

**The event loop has three queues:**
1. **Call stack:** Currently executing synchronous code. Functions push/pop frames here.
2. **Microtask queue (job queue):** Resolved Promise callbacks (`.then()`), `queueMicrotask()`.
   Drained completely before the event loop checks the macrotask queue.
3. **Macrotask queue (task queue):** `setTimeout`, `setInterval`, I/O callbacks, `MessageChannel`.
   One macrotask is processed per event loop iteration.

**The algorithm:**
```
while (true) {
  if (callStack.isEmpty) {
    process ALL microtasks until microtask queue is empty
    process ONE macrotask
  }
}
```

**Demonstration:**
```typescript
console.log('1 — synchronous')

setTimeout(() => console.log('4 — macrotask (setTimeout)'), 0)

Promise.resolve().then(() => console.log('3 — microtask (Promise)'))

console.log('2 — synchronous')

// Output: 1, 2, 3, 4
```

`setTimeout(() => ..., 0)` does not mean "execute immediately." It means "add to the
macrotask queue as soon as possible." Microtasks run before macrotasks, so the Promise
callback runs before the `setTimeout` callback — even though `setTimeout(fn, 0)` appears
first in the code.

**CS lens — cooperative multitasking:**
JavaScript's model is **cooperative multitasking**: each task runs until it yields
control (by finishing, awaiting, or explicitly returning to the event loop). Unlike
preemptive multitasking (operating system threads), the runtime cannot interrupt a running
task. A loop that runs for 10 seconds blocks the event loop for 10 seconds — no I/O,
no UI updates, no timers fire.

### Step 2 — Blocking the Event Loop

A CPU-intensive operation blocks the event loop:

```typescript
// BLOCKS: this runs synchronously, hogging the event loop for 500ms
function countLinesBlocking(code: string): number {
  let count = 0
  for (const char of code) {   // iterating 500,000-char string
    if (char === '\n') count++
  }
  return count
}

// During these 500ms:
// - No click events are processed
// - No render updates happen
// - WebSocket messages queue up but are not processed
// - The tab feels frozen
```

A single large file (500KB of code) can block the event loop for hundreds of milliseconds.

**Measuring blocking with `--trace-event-async-hooks` or `perf_hooks`:**
```typescript
import { performance } from 'perf_hooks'

const start = performance.now()
const result = countLinesBlocking(largeFile)
const elapsed = performance.now() - start
if (elapsed > 50) {
  console.warn(`Event loop blocked for ${elapsed.toFixed(1)}ms`)
}
```

### Step 3 — Worker Threads

Node.js and modern browsers provide **Worker Threads** (Node.js) and **Web Workers**
(browser) — true threads that run JavaScript concurrently with the main thread.

Workers:
- Have their own call stack, event loop, and memory
- Communicate with the main thread via message passing (`postMessage`)
- Can block without affecting the main thread

**CPU-intensive syntax highlighting in a Worker Thread:**
```typescript
// src/workers/syntaxHighlighter.worker.ts
import { parentPort } from 'worker_threads'
import { highlight } from 'highlight.js'

parentPort?.on('message', ({ id, code, language }: { id: string; code: string; language: string }) => {
  const result = highlight(code, { language, ignoreIllegals: true })
  parentPort?.postMessage({ id, html: result.value })
})
```

```typescript
// Main thread usage
import { Worker } from 'worker_threads'
import path from 'path'

class SyntaxHighlighterPool {
  private worker: Worker

  constructor() {
    this.worker = new Worker(
      path.join(__dirname, 'workers/syntaxHighlighter.worker.js')
    )
  }

  async highlight(code: string, language: string): Promise<string> {
    return new Promise((resolve) => {
      const id = crypto.randomUUID()
      const handler = (message: { id: string; html: string }) => {
        if (message.id === id) {
          this.worker.off('message', handler)
          resolve(message.html)
        }
      }
      this.worker.on('message', handler)
      this.worker.postMessage({ id, code, language })
    })
  }
}
```

**`parentPort` explained:**
In a Worker Thread, `parentPort` is the communication channel to the parent thread.
`parentPort.postMessage(data)` sends data to the parent. `parentPort.on('message', handler)`
receives data from the parent. Structured cloning is used — primitive types and plain
objects are copied; class instances are not supported.

**Message correlation with `id`:**
The worker may receive multiple requests concurrently. Without an `id`, the response
cannot be matched to the request. Including an `id` in both the request and response
correlates them — the same pattern as the HTTP request ID or the WebSocket ack ID.

### Step 4 — Race Condition in Lesson Completion

A race condition: two events affect shared state, and the outcome depends on their order.

**The bug:**
```typescript
// In the lesson engine, user presses Run twice quickly
async function handleRun() {
  // setIsRunning(true) not preventing concurrent runs
  const result = await runner.run(currentCode)
  setCheckResult(checkOutput(result.stdout.join('\n'), lesson.expectedOutput))

  if (check.matches) {
    await markLessonComplete(lesson.id, token!)  // call 1 and call 2 both reach here
  }
}
```

If the user clicks Run twice within 100ms:
- Both calls reach `markLessonComplete`
- Both calls fire the API request
- The server receives two `POST /api/progress` for the same lesson
- The response handler fires twice: `queryClient.invalidateQueries` fires twice
- Two concurrent refetches race to update the UI

**Fix with a ref to track in-flight state:**
```typescript
const isRunningRef = useRef(false)

async function handleRun() {
  if (isRunningRef.current) return    // prevent concurrent runs
  isRunningRef.current = true

  try {
    const result = await runner.run(currentCode)
    const actualOutput = result.stdout.join('\n')
    const check = checkOutput(actualOutput, lesson.expectedOutput)
    setCheckResult(check)

    if (check.matches && completeMutation.status === 'idle') {
      completeMutation.mutate()
    }
  } finally {
    isRunningRef.current = false
  }
}
```

**Why `useRef` instead of `useState` here:**
`isRunning` state would work for UI feedback (disabling the button). But state updates
are asynchronous — the second click may arrive before `setIsRunning(true)` causes a
re-render that disables the button. `useRef.current` is synchronously readable and
writable. The check `if (isRunningRef.current) return` happens synchronously, before
any `await` introduces re-entrancy.

**CS lens — mutual exclusion:**
`isRunningRef.current` is a **mutex** (mutual exclusion lock) — a mechanism that allows
only one execution to proceed at a time. In operating systems, mutex locks prevent two
threads from entering a critical section simultaneously. In JavaScript (single-threaded),
re-entrancy through `await` creates the same risk — the mutex prevents it.

---

## Connect the Pieces

The event loop's microtask queue explains why `queryClient.invalidateQueries` in
`useMutation.onSuccess` fires after the render that shows the success state: `onSuccess`
is a Promise `.then()` callback (microtask), which runs after the synchronous `mutate()`
call returns, but before the next macrotask (which might be a paint or a setTimeout).

Worker Threads in Node.js are the same concept as the UI thread separation in React Native
(Lesson 27). In both cases, long-running computation is moved to a separate thread to
avoid blocking the UI/event thread. The pattern and the reason are identical.

The `isRunningRef.current` mutex is the same pattern as the `locked` boolean used in
optimistic locking database patterns (Lesson 22's `$transaction`). Both prevent concurrent
access to a resource — one in JavaScript, one in the database.

---

## What Breaks Without This

Without the Worker Thread for syntax highlighting, opening a 500KB lesson file in
the editor blocks the event loop for ~300ms. The cursor freezes, animations stutter,
incoming WebSocket messages are delayed. On mobile (slower JS engines), the block
can be 1–2 seconds. The app feels broken for large files.

Without the mutex in `handleRun`, a determined user who clicks Run three times rapidly
fires three concurrent code executions. The three results arrive in unpredictable order.
The last result to arrive sets the UI state — which may not be the result of the last
click. The UI shows a stale or incorrect check result. The completion mutation may fire
three times, causing three `invalidateQueries` and three round-trip refetches.

---

## Definition of Done

- [ ] The event loop demonstration logs 1, 2, 3, 4 in the correct order and you can explain why
- [ ] Syntax highlighting for a 500KB file is offloaded to a Worker Thread (main thread not blocked)
- [ ] Clicking Run twice rapidly does not fire duplicate completion API calls
- [ ] The memory monitor from Lesson 36 shows no heap spike during large file processing
- [ ] You can answer: what are the three queues in the event loop and in what order are they processed?
- [ ] You can answer: what is cooperative multitasking and how does it differ from preemptive?
- [ ] You can answer: why is `useRef` used instead of `useState` for the mutex?
- [ ] You can answer: what is a race condition and how does re-entrancy through `await` create one?
- [ ] `git commit` with a message explaining why — "Offload syntax highlighting to Worker Thread and fix race condition in lesson completion"
