---
concept: 119-threads
name: Threads
---

## Definition

A thread is an independent sequence of execution within a process, allowing
multiple parts of a program to run concurrently — or in true parallel on
multiple CPU cores — while sharing the same process's memory space.

## Problem

A program needing to do multiple independent things at once — handle
multiple network connections, perform a background computation while
staying responsive — can't do so with a single sequential execution path.
Threads let a single process run several independent sequences of
execution, potentially in parallel, without the heavier overhead of
starting entirely separate processes.

## Execution

Main thread starts, spawns a worker thread to compute something
↓
Main thread continues running its OWN code, without waiting idle for the worker
↓
Worker thread runs independently, computing its result
↓
Worker thread signals completion — main thread receives it whenever it's
ready, without having blocked the whole time

## Computer Science

Threads within the same process share memory (global variables,
heap-allocated objects) by default, which is both threads' biggest
advantage (fast communication, no copying data between them) and their
biggest danger — two threads modifying the same shared memory at the same
time without coordination corrupts it (see the Race Conditions concept).

Tags: Shared memory, Concurrent execution, Parallelism, Process vs thread

## Software Engineering

Python's real OS-level threads are limited for CPU-bound parallelism by
the Global Interpreter Lock (GIL) — only one thread executes Python
bytecode at a time, even on a multi-core machine — so Python threads help
most with I/O-bound work (waiting on network or disk), not CPU-bound
computation, where multiprocessing (separate processes, no shared GIL) is
usually the better choice.

Tags: GIL, I/O-bound vs CPU-bound, Multiprocessing, Node.js worker_threads

## Common Mistakes

- Assuming threads always run code faster through true parallelism — on a single core, or in Python specifically for CPU-bound work due to the GIL, threads may not actually run any code in parallel at all, just interleaved.
- Sharing mutable data between threads without any coordination — this is exactly the setup for a race condition, a common source of hard-to-reproduce bugs.

## Exercises

- Spawn two worker threads computing two different values, and confirm both results arrive without either one blocking the main thread while waiting.
- Look up what the GIL is and why it specifically limits Python threads for CPU-bound, not I/O-bound, parallelism.

## javascript

```javascript
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')

if (isMainThread) {
  const worker = new Worker(__filename, { workerData: { n: 5 } })
  worker.on('message', (result) => {
    console.log('Result from worker thread:', result)
  })
} else {
  const square = workerData.n * workerData.n
  parentPort.postMessage(square)
}
```
Walkthrough: this same file runs twice — once as the main thread
(`isMainThread` is true), which spawns a worker running the same file; and
once as that worker (`isMainThread` is false), which computes a result and
sends it back via `parentPort.postMessage`. Unlike Python's threads, Node's
worker threads don't share memory directly — they communicate by passing
messages, which is why the result arrives via an event listener rather
than a shared variable.

## python

```python
import threading

results = {}

def compute_square(n):
    results[n] = n * n

thread = threading.Thread(target=compute_square, args=(5,))
thread.start()
thread.join()   # wait for the thread to finish before reading its result

print('Result from thread:', results[5])
```
Walkthrough: `thread.start()` begins running `compute_square` concurrently;
`thread.join()` blocks the main thread until it finishes, guaranteeing
`results[5]` is populated before it's read. Unlike Node's worker (separate
memory, message-passing), Python's `threading.Thread` shares the SAME
`results` dictionary directly with the main thread — this is real shared
memory, not message passing.
