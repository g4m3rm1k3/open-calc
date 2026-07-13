---
series: go-fundamentals
level: 3
title: Concurrency Patterns
lang: javascript
---

# Concurrency Patterns

Goroutines and channels (from Level 1) are the primitives. But in production Go programs, you build patterns on top of those primitives: **pipelines** for sequential processing stages, **fan-out** for parallelising heavy work, **timeouts** for preventing goroutine leaks, and **worker pools** for limiting concurrency. These patterns appear in nearly every production Go server. By the end of this lesson you will understand each pattern, when to use it, and how to implement it.

## Pipeline — Chaining Processing Stages

A pipeline passes data through a sequence of stages, each running concurrently. Each stage receives from an upstream channel and sends to a downstream channel.

```javascript
// In real Go:
//   func generate(nums ...int) <-chan int {
//     out := make(chan int)
//     go func() { for _, n := range nums { out <- n }; close(out) }()
//     return out
//   }
//   func square(in <-chan int) <-chan int {
//     out := make(chan int)
//     go func() { for n := range in { out <- n * n }; close(out) }()
//     return out
//   }

// Simulating with async generators:
async function* generate(values) {
  for (const value of values) {
    yield value
  }
}

async function* mapStage(source, transform) {
  for await (const value of source) {
    yield transform(value)
  }
}

async function* filterStage(source, predicate) {
  for await (const value of source) {
    if (predicate(value)) yield value
  }
}

async function collect(source) {
  const results = []
  for await (const value of source) {
    results.push(value)
  }
  return results
}

async function demonstratePipeline() {
  // Pipeline: generate → square → filter (> 10) → collect
  const nums    = generate([1, 2, 3, 4, 5, 6])
  const squared = mapStage(nums, x => x * x)
  const filtered = filterStage(squared, x => x > 10)
  const results = await collect(filtered)

  console.log('pipeline output:', results)
}

demonstratePipeline()
```

```text
pipeline output: [ 16, 25, 36 ]
```

Execution trace:
```text
generate: yields 1, 2, 3, 4, 5, 6
square:   1→1, 2→4, 3→9, 4→16, 5→25, 6→36
filter:   1 skip, 4 skip, 9 skip, 16 keep, 25 keep, 36 keep
result:   [16, 25, 36]
```

**CS lens:** Pipelines are a functional programming pattern (**function composition**) expressed as concurrent data flow. Each stage is a pure transformation — it does not share state with other stages, so stages can safely run in parallel. In Go, each stage is a goroutine; the channels between them are the communication. Adding buffering to the channels between stages controls back-pressure.

## Fan-Out / Fan-In — Parallelising Heavy Work

Fan-out distributes work across multiple goroutines. Fan-in collects their results.

```javascript
// When: each item requires heavy computation (e.g., HTTP call, database query)
// How: start N goroutines, each processing a subset; collect all results

async function fanOut(items, workerCount, processItem) {
  const results = new Array(items.length)
  const pending = items.map((item, index) => ({ item, index }))

  async function worker() {
    while (pending.length > 0) {
      const { item, index } = pending.shift()
      results[index] = await processItem(item)
    }
  }

  // Start workerCount workers concurrently
  await Promise.all(
    Array.from({ length: workerCount }, () => worker())
  )

  return results  // in original order
}

async function demonstrateFanOut() {
  // Simulate: fetch each URL (slow operation, done in parallel)
  function simulateFetch(url) {
    const delay = Math.random() * 20
    return new Promise(resolve =>
      setTimeout(() => resolve(`response from ${url} (${delay.toFixed(1)}ms)`), delay)
    )
  }

  const urls = [
    'https://api.example.com/users',
    'https://api.example.com/orders',
    'https://api.example.com/products',
    'https://api.example.com/inventory',
  ]

  console.log(`fetching ${urls.length} URLs with 2 workers...`)
  const start = Date.now()
  const responses = await fanOut(urls, 2, simulateFetch)
  const elapsed = Date.now() - start

  responses.forEach((resp, i) => console.log(`[${i}] ${resp}`))
  console.log(`completed in ~${elapsed}ms (would take ~${urls.length * 20}ms sequentially)`)
}

demonstrateFanOut()
```

```text
fetching 4 URLs with 2 workers...
[0] response from https://api.example.com/users (...)
[1] response from https://api.example.com/orders (...)
[2] response from https://api.example.com/products (...)
[3] response from https://api.example.com/inventory (...)
completed in ~Xms (would take ~80ms sequentially)
```

**SE lens:** The `results` array preserves input order even though workers complete in arbitrary order — this is important for the caller who expects result[0] to correspond to input[0]. In real Go, a common pattern is to send `(index, result)` pairs through a results channel and reconstruct the order in the fan-in stage.

## Timeout Pattern — Preventing Goroutine Leaks

Every blocking operation in production must have a timeout. A goroutine that blocks forever waiting on a channel that never sends is a **goroutine leak** — it consumes memory and a goroutine slot forever.

```javascript
// In real Go:
//   ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
//   defer cancel()
//   select {
//   case result := <-doWork(ctx):
//     fmt.Println("result:", result)
//   case <-ctx.Done():
//     fmt.Println("timed out:", ctx.Err())
//   }

function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('operation timed out')), ms)
  )
  return Promise.race([promise, timeout])
}

async function demonstrateTimeout() {
  function slowOperation(delayMs) {
    return new Promise(resolve =>
      setTimeout(() => resolve('done!'), delayMs)
    )
  }

  // Fast operation completes before timeout
  try {
    const result = await withTimeout(slowOperation(50), 200)
    console.log('fast result:', result)
  } catch (e) {
    console.log('fast timed out:', e.message)
  }

  // Slow operation exceeds timeout
  try {
    const result = await withTimeout(slowOperation(500), 100)
    console.log('slow result:', result)
  } catch (e) {
    console.log('slow timed out:', e.message)
  }
}

demonstrateTimeout()
```

```text
fast result: done!
slow timed out: operation timed out
```

**CS lens:** Go's `context.Context` propagates cancellation through the entire call tree. When a request times out at the top level, `ctx.Done()` fires in every goroutine doing work for that request — they all stop. Without context propagation, a timed-out request still has goroutines running in the background, wasting CPU and memory. Goroutine leaks are a common production issue in Go programs that forget to add timeouts.

## Worker Pool — Limiting Concurrency

A worker pool limits the number of goroutines running at once, preventing resource exhaustion.

```javascript
// Use when: you have many tasks but limited resources (database connections, file handles)
// The pool processes tasks up to maxWorkers at a time

async function workerPool(tasks, maxWorkers, processTask) {
  const results = []
  let taskIndex = 0

  async function worker() {
    while (taskIndex < tasks.length) {
      const index = taskIndex++
      const task = tasks[index]
      console.log(`  worker processing task ${index}: ${task}`)
      const result = await processTask(task)
      results[index] = result
    }
  }

  // Exactly maxWorkers goroutines active at any time
  await Promise.all(Array.from({ length: maxWorkers }, worker))
  return results
}

async function demonstrateWorkerPool() {
  const tasks = ['email-1', 'email-2', 'email-3', 'email-4', 'email-5']

  function sendEmail(address) {
    return new Promise(resolve =>
      setTimeout(() => resolve(`sent to ${address}`), 30)
    )
  }

  console.log('sending 5 emails with pool of 2 workers:')
  const results = await workerPool(tasks, 2, sendEmail)
  results.forEach(r => console.log(' ', r))
}

demonstrateWorkerPool()
```

```text
sending 5 emails with pool of 2 workers:
  worker processing task 0: email-1
  worker processing task 1: email-2
  worker processing task 2: email-3
  worker processing task 3: email-4
  worker processing task 4: email-5
  sent to email-1
  sent to email-2
  ...
```

**SE lens:** In Go, the worker pool pattern uses a **semaphore channel**: `sem := make(chan struct{}, maxWorkers)`. Before each task, a goroutine sends to `sem` (blocking if capacity is full); after each task, it receives from `sem` (releasing the slot). This limits active workers to exactly `maxWorkers`. The pattern is used in HTTP servers for database connection pools, in crawlers for rate-limited requests, and anywhere you need to limit resource usage.

## Challenge: concurrency_simulator

Implement the three core concurrency patterns.

`createConcurrencySimulator()` — returns an object with:
- `.pipeline(values, stages)` — `values` is a number array; `stages` is an array of functions (each takes a number, returns a number); applies stages in order to each value; returns Promise resolving to number array
- `.fanOut(values, workers, transform)` — processes values in parallel up to `workers` at a time; `transform` is `async (n) => number`; returns Promise resolving to results in original input order
- `.withTimeout(promise, ms)` — resolves if promise resolves within `ms` milliseconds; otherwise rejects with `Error('timeout')`

```challenge
function createConcurrencySimulator() {
  return {
    pipeline(values, stages) {
      return Promise.resolve(values)
    },
    fanOut(values, workers, transform) {
      return Promise.resolve(values.map(() => 0))
    },
    withTimeout(promise, ms) {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), ms)
      )
      return Promise.race([promise, timeout])
    },
  }
}
```

```test
const sim = createConcurrencySimulator()
const pipeResult = await sim.pipeline([1, 2, 3], [x => x * 2, x => x + 1])
assert pipeResult[0] === 3 && pipeResult[2] === 7
const fanResult = await sim.fanOut([1, 4, 9], 2, async x => Math.sqrt(x))
assert fanResult[0] === 1 && fanResult[1] === 2 && fanResult[2] === 3
const fast = await sim.withTimeout(Promise.resolve(42), 100)
assert fast === 42
let threw = false
try { await sim.withTimeout(new Promise(() => {}), 50) } catch (e) { threw = e.message === 'timeout' }
assert threw === true
```
