---
series: professional-engineering
level: 4
title: Scalability and Systems Thinking
lang: javascript
---

# Scalability and Systems Thinking

Scalability is the ability of a system to handle increased load without redesign. Most systems start with no scalability concerns and acquire them as they grow. The engineer who understands scalability from the start makes different decisions at every level — decisions that defer expensive rewrites until truly necessary. Amdahl's Law (1967), the CAP theorem (Brewer, 2000), and the circuit breaker pattern (Nygard, "Release It!", 2007) are the fundamental tools. By the end of this lesson you will understand performance bottlenecks, scaling strategies, caching, and how to prevent cascading failures in distributed systems.

## Amdahl's Law — Where Parallelism Helps

Before scaling anything, you need to know what the bottleneck is. Amdahl's Law says: the speedup from parallelism is limited by the serial portion of the work.

```javascript
// Demonstrating Amdahl's Law with a real simulation:
function demonstrateAmdahl() {
  // If 20% of work is serial (can't be parallelised), max speedup is 5x
  // regardless of how many cores you add

  function amdahlSpeedup(serialFraction, numCores) {
    // S(n) = 1 / (f + (1-f)/n) where f = serial fraction, n = num cores
    return 1 / (serialFraction + (1 - serialFraction) / numCores)
  }

  const serialFractions = [0.05, 0.20, 0.50]
  const coreCounts = [1, 2, 4, 8, 16, 64, Infinity]

  for (const serial of serialFractions) {
    console.log(`\nSerial portion: ${(serial * 100).toFixed(0)}% (max speedup: ${(1/serial).toFixed(1)}x)`)
    for (const cores of coreCounts) {
      const speedup = cores === Infinity ? 1/serial : amdahlSpeedup(serial, cores)
      const bar = '█'.repeat(Math.round(speedup))
      console.log(`  ${String(cores === Infinity ? '∞' : cores).padStart(3)} cores: ${speedup.toFixed(2)}x ${bar}`)
    }
  }
}

demonstrateAmdahl()
```

```text
Serial portion: 5% (max speedup: 20.0x)
    1 cores: 1.00x █
    2 cores: 1.91x ██
    4 cores: 3.48x ███
    8 cores: 5.93x ██████
   16 cores: 9.14x █████████
   64 cores: 14.23x ██████████████
    ∞ cores: 20.00x ████████████████████

Serial portion: 20% (max speedup: 5.0x)
    1 cores: 1.00x █
    2 cores: 1.67x ██
    4 cores: 2.50x ██
    8 cores: 3.08x ███
   16 cores: 3.56x ████
   64 cores: 4.26x ████
    ∞ cores: 5.00x █████

Serial portion: 50% (max speedup: 2.0x)
    1 cores: 1.00x █
    2 cores: 1.33x █
    4 cores: 1.60x ██
    8 cores: 1.78x ██
   16 cores: 1.88x ██
    ∞ cores: 2.00x ██
```

**CS lens:** Amdahl's Law has a counterintuitive implication: if 50% of your work is serial (e.g., database writes that must be sequential), adding 1000 cores gives at most 2x speedup. The serial bottleneck dominates. This is why profiling before optimising is essential — without profiling, you will spend time parallelising the wrong thing. The speedup ceiling from parallelism is `1 / serial_fraction`.

## Scaling Strategies — Vertical vs Horizontal

```javascript
async function demonstrateScalingStrategies() {
  // Simulate: 1000 requests, each taking 100ms to process
  const REQUESTS = 200
  const REQUEST_TIME_MS = 10  // reduced for demo

  async function processRequest(id) {
    return new Promise(resolve => setTimeout(() => resolve(`req-${id} done`), REQUEST_TIME_MS))
  }

  // VERTICAL SCALING: one big server, sequential processing
  async function verticalScaling() {
    const start = Date.now()
    for (let i = 0; i < REQUESTS; i++) {
      await processRequest(i)  // sequential — one at a time
    }
    return Date.now() - start
  }

  // HORIZONTAL SCALING: multiple workers, concurrent processing
  async function horizontalScaling(workerCount) {
    const start = Date.now()
    const batches = []
    for (let i = 0; i < REQUESTS; i += workerCount) {
      const batch = Array.from({ length: Math.min(workerCount, REQUESTS - i) }, (_, j) =>
        processRequest(i + j)
      )
      await Promise.all(batch)
    }
    return Date.now() - start
  }

  console.log(`Processing ${REQUESTS} requests (${REQUEST_TIME_MS}ms each):\n`)

  const seqTime  = await verticalScaling()
  const par4Time = await horizontalScaling(4)
  const par16Time = await horizontalScaling(16)

  console.log(`Sequential (1 worker):   ${seqTime}ms`)
  console.log(`Parallel (4 workers):    ${par4Time}ms  (${(seqTime/par4Time).toFixed(1)}x faster)`)
  console.log(`Parallel (16 workers):   ${par16Time}ms  (${(seqTime/par16Time).toFixed(1)}x faster)`)
  console.log(`\nKey constraint: stateless handlers can scale horizontally`)
  console.log(`If requests require shared state (DB writes), scaling is harder`)
}

demonstrateScalingStrategies()
```

```text
Processing 200 requests (10ms each):

Sequential (1 worker):   ~2000ms
Parallel (4 workers):    ~500ms  (4.0x faster)
Parallel (16 workers):   ~125ms  (16.0x faster)

Key constraint: stateless handlers can scale horizontally
If requests require shared state (DB writes), scaling is harder
```

**SE lens:** Horizontal scaling requires **stateless services** — each request must be completable without local state from previous requests. If a service stores session state in memory, you cannot add another instance (the second instance doesn't have the state). This is why stateless design (JWT tokens instead of server-side sessions, shared caches instead of local caches) is an architectural prerequisite for horizontal scaling.

## Caching — The Single Biggest Performance Lever

```javascript
function demonstrateCaching() {
  // Simulate: expensive database query vs cached result
  let dbCalls = 0

  function expensiveDbQuery(userId) {
    dbCalls++
    // In reality: 50-200ms database round-trip
    return { id: userId, name: `User ${userId}`, role: 'member', score: Math.random() * 100 }
  }

  // Simple LRU-ish cache:
  function createCache(ttlMs) {
    const store = new Map()
    return {
      get(key) {
        const entry = store.get(key)
        if (!entry) return null
        if (Date.now() - entry.time > ttlMs) { store.delete(key); return null }
        return entry.value
      },
      set(key, value) {
        store.set(key, { value, time: Date.now() })
      },
      invalidate(key) { store.delete(key) },
    }
  }

  const cache = createCache(5000)  // 5-second TTL

  function getUserCached(userId) {
    const cached = cache.get(`user:${userId}`)
    if (cached) { console.log(`  [CACHE HIT]  user:${userId}`); return cached }
    console.log(`  [CACHE MISS] user:${userId} — querying database`)
    const user = expensiveDbQuery(userId)
    cache.set(`user:${userId}`, user)
    return user
  }

  console.log('Request sequence:')
  getUserCached(1)  // miss → db
  getUserCached(2)  // miss → db
  getUserCached(1)  // hit → cache
  getUserCached(1)  // hit → cache
  getUserCached(3)  // miss → db
  getUserCached(2)  // hit → cache

  console.log(`\nTotal DB calls: ${dbCalls} (instead of 6 without cache)`)
  console.log('Cache hit rate: 50% (3 hits / 6 total requests)')
  console.log('\nCache invalidation scenarios:')
  console.log('  · User updates profile → must invalidate user:${userId}')
  console.log('  · TTL expires → automatic invalidation after 5 seconds')
  console.log('  · Server restart → cache cold → all misses until warmed')
}

demonstrateCaching()
```

```text
Request sequence:
  [CACHE MISS] user:1 — querying database
  [CACHE MISS] user:2 — querying database
  [CACHE HIT]  user:1
  [CACHE HIT]  user:1
  [CACHE MISS] user:3 — querying database
  [CACHE HIT]  user:2

Total DB calls: 3 (instead of 6 without cache)
Cache hit rate: 50% (3 hits / 6 total requests)

Cache invalidation scenarios:
  · User updates profile → must invalidate user:${userId}
  · TTL expires → automatic invalidation after 5 seconds
  · Server restart → cache cold → all misses until warmed
```

**CS lens:** Phil Karlton's saying: "There are only two hard things in Computer Science: cache invalidation and naming things." Cache invalidation is hard because it is a **distributed consistency problem**: when the source of truth changes, every copy of the cached value must be updated or expired — across all processes, all machines, all regions. Too-eager invalidation loses the performance benefit; too-lazy invalidation serves stale data.

## Circuit Breaker — Preventing Cascading Failure

```javascript
function createCircuitBreaker(threshold, resetMs) {
  let state = 'closed'
  let failures = 0
  let openedAt = null

  return {
    call(fn) {
      if (state === 'open') {
        if (Date.now() - openedAt >= resetMs) {
          state = 'half-open'
          console.log('  [CB] → half-open: testing recovery')
        } else {
          throw new Error('circuit open')
        }
      }

      try {
        const result = fn()
        if (state === 'half-open') {
          state = 'closed'
          failures = 0
          console.log('  [CB] → closed: recovered')
        }
        return result
      } catch (err) {
        failures++
        if (state === 'half-open' || failures >= threshold) {
          state = 'open'
          openedAt = Date.now()
          console.log(`  [CB] → open: ${failures} failures (threshold: ${threshold})`)
        }
        throw err
      }
    },
    state()    { return state },
    failures() { return failures },
  }
}

async function demonstrateCircuitBreaker() {
  const cb = createCircuitBreaker(3, 200)

  console.log('--- Accumulating failures ---')
  for (let i = 0; i < 3; i++) {
    try { cb.call(() => { throw new Error('downstream unavailable') }) }
    catch (e) { console.log(`  call ${i+1} failed: ${e.message}`) }
  }
  console.log('State:', cb.state())

  console.log('\n--- Circuit is OPEN: fast-fail ---')
  try { cb.call(() => 'result') }
  catch (e) { console.log(`  rejected immediately: ${e.message}`) }

  console.log('\n--- Waiting for reset timeout ---')
  await new Promise(r => setTimeout(r, 210))

  console.log('\n--- Half-open: testing recovery ---')
  const result = cb.call(() => 'service recovered')
  console.log(`  call succeeded: ${result}`)
  console.log('State:', cb.state())
}

demonstrateCircuitBreaker()
```

```text
--- Accumulating failures ---
  call 1 failed: downstream unavailable
  call 2 failed: downstream unavailable
  [CB] → open: 3 failures (threshold: 3)
  call 3 failed: downstream unavailable
State: open

--- Circuit is OPEN: fast-fail ---
  rejected immediately: circuit open

--- Waiting for reset timeout ---

--- Half-open: testing recovery ---
  [CB] → half-open: testing recovery
  [CB] → closed: recovered
  call succeeded: service recovered
State: closed
```

**CS lens:** Without a circuit breaker, a slow downstream service causes threads to block waiting for timeouts (5-30 seconds each). As threads accumulate, the upstream service exhausts its thread pool and becomes unavailable — the failure cascades upward. The circuit breaker converts this into a **fast failure**: instead of waiting 30 seconds per request, the caller fails in microseconds and can serve a cached response or degrade gracefully.

## Challenge: circuit_breaker

Implement the circuit breaker pattern.

`createCircuitBreaker(threshold, resetMs)` — `threshold` is failures before opening; `resetMs` is milliseconds before attempting recovery. Returns an object with:
- `.call(fn)` — if `CLOSED` or `HALF-OPEN`: calls `fn()`, returns result; if fn throws, counts failure; if failures reach threshold, goes `OPEN`; if `HALF-OPEN` and fn succeeds, goes back to `CLOSED`. If `OPEN` and timeout not elapsed: throws `Error('circuit open')`
- `.state()` — returns `'closed'|'open'|'half-open'`
- `.failures()` — returns current failure count

```challenge
function createCircuitBreaker(threshold, resetMs) {
  return {
    call(fn) {
      return fn()
    },
    state()    { return 'closed' },
    failures() { return 0 },
  }
}
```

```test
const cb = createCircuitBreaker(3, 100)
assert cb.state() === 'closed' && cb.failures() === 0

try { cb.call(() => { throw new Error('down') }) } catch {}
try { cb.call(() => { throw new Error('down') }) } catch {}
try { cb.call(() => { throw new Error('down') }) } catch {}
assert cb.state() === 'open'

let rejected = false
try { cb.call(() => 'ok') } catch (e) { rejected = e.message === 'circuit open' }
assert rejected === true

await new Promise(r => setTimeout(r, 110))
assert cb.state() === 'half-open'

const result = cb.call(() => 'recovered')
assert result === 'recovered' && cb.state() === 'closed' && cb.failures() === 0
```
