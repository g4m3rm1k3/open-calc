---
concept: 126-thread-pools
name: Thread Pools
---

## Definition

A thread pool maintains a fixed set of reusable worker threads that pick
up queued tasks as they arrive, instead of creating a brand-new thread for
every single task and destroying it afterward.

## Problem

Creating a new thread for every task has real overhead — allocating a
stack, OS-level bookkeeping. For workloads with many short-lived tasks,
that overhead can dominate the actual work being done. A thread pool
creates a fixed number of threads once, reusing them for task after task,
amortizing the creation cost.

## Execution

Pool created with 2 worker threads
↓
5 tasks submitted to the pool's queue
↓
Worker 1 picks up task 1, Worker 2 picks up task 2 — both processing concurrently
↓
Worker 1 finishes task 1, immediately picks up task 3 from the queue (REUSED, not recreated)
↓
Worker 2 finishes task 2, picks up task 4; whichever worker finishes next picks up task 5
↓
All 5 tasks eventually complete, having been processed by just 2 reused
worker threads, not 5 newly-created ones

## Computer Science

A thread pool decouples "how many tasks exist" from "how many threads
exist" — the pool size is chosen based on available resources, often
related to CPU core count, and a queue absorbs any burst of tasks beyond
what the fixed pool can immediately process, smoothing out load rather
than creating unbounded threads under heavy load.

Tags: Task queue, Resource management, Bounded concurrency, Amortized thread creation

## Software Engineering

Thread pools are the standard mechanism behind most production concurrent
systems — web server request handlers, background job processors —
specifically because unbounded thread creation under load can exhaust
system resources and degrade performance. A bounded pool with a queue
provides predictable, controlled resource usage instead.

Tags: Web servers, Job processing, Resource exhaustion prevention, Executor services

## Common Mistakes

- Sizing the pool far too large or too small for the actual workload — too few threads underutilizes available parallelism; too many threads reintroduces the very overhead pools are meant to avoid.
- Submitting tasks that BLOCK indefinitely to a bounded pool — if every worker thread gets stuck on a blocking task, the whole pool can stall, unable to process any further queued tasks even though they're independent.

## Exercises

- Increase the pool size in the example and observe how more tasks can run truly concurrently before any have to wait in the queue.
- Research what a "thread pool executor" provides in a language or framework you're familiar with, and identify its default pool-sizing strategy.

## javascript

```javascript
// A minimal thread-pool-style task queue, using Promises to model workers
// picking up queued tasks as they become free (Node's real worker_threads
// would follow this exact same queue-plus-fixed-worker-count shape).
class TaskPool {
  #concurrency
  #running = 0
  #queue = []

  constructor(concurrency) { this.#concurrency = concurrency }

  async run(task) {
    if (this.#running >= this.#concurrency) {
      await new Promise(resolve => this.#queue.push(resolve))
    }
    this.#running++
    try {
      return await task()
    } finally {
      this.#running--
      const next = this.#queue.shift()
      if (next) next()
    }
  }
}

async function main() {
  const pool = new TaskPool(2)   // only 2 "workers" at a time
  const results = await Promise.all(
    [1, 2, 3, 4, 5].map(n => pool.run(async () => n * n))
  )
  console.log(results)   // [ 1, 4, 9, 16, 25 ] — all 5 tasks completed, only 2 ran concurrently at once
}

main()
```
Walkthrough: at most `concurrency` (2) tasks run at the same time — a 3rd
task waits in the queue until one of the first two finishes and frees up a
slot. All 5 tasks still complete correctly; the pool just bounds how many
run simultaneously, exactly like a real thread pool bounds how many OS
threads actually exist.

## python

```python
from concurrent.futures import ThreadPoolExecutor

def square(n):
    return n * n

with ThreadPoolExecutor(max_workers=2) as pool:   # only 2 real worker threads, reused across tasks
    results = list(pool.map(square, [1, 2, 3, 4, 5]))

print(results)   # [1, 4, 9, 16, 25] -- all 5 tasks completed, only 2 threads ever created
```
Walkthrough: `ThreadPoolExecutor(max_workers=2)` creates exactly 2 real
worker threads once, and `pool.map` feeds all 5 tasks through that fixed
pool, reusing each thread for multiple tasks rather than creating 5
separate threads for 5 tasks.
