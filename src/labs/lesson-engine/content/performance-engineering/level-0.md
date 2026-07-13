---
series: performance-engineering
level: 0
title: What Performance Engineering Is
lang: javascript
---

# What Performance Engineering Is

Performance is not about making code fast. It is about making the right code fast, at the right time, for the right reason. Most code does not need to be faster. Premature optimisation — making code faster before you know it is too slow — is one of the most common sources of unnecessary complexity in software.

Performance engineering is the discipline of measuring, understanding, and improving performance where it matters. It has three steps: measure first (form a hypothesis, then verify), find the bottleneck (80% of time is usually in 20% of code), and apply the right optimisation (algorithmic, data structure, caching, concurrency, or hardware). By the end of this series you will be able to identify performance problems, measure them correctly, and apply the appropriate optimisation.

## The performance engineering mindset

```text
THE THREE RULES OF PERFORMANCE:
  1. MEASURE FIRST
     Never guess. The bottleneck is almost never where you think it is.
     Profile before changing code. Measure after changing code.
     An optimisation that you haven't measured is a change, not an improvement.

  2. OPTIMISE THE BOTTLENECK
     A system's performance is determined by its slowest part (Amdahl's Law).
     Making the fast part 10× faster does not help if the slow part runs 90% of the time.
     Find the bottleneck. Fix the bottleneck. Then find the next bottleneck.

  3. SET A PERFORMANCE GOAL
     "Make it faster" is not a goal. "Reduce p99 latency from 3s to under 500ms" is a goal.
     Without a specific goal, you don't know when to stop optimising.
     Performance has diminishing returns and real costs (complexity, development time).
```

## Types of performance

```text
LATENCY:
  How long does one operation take?
  Units: milliseconds (ms), microseconds (μs)
  Example: a web request takes 250ms from request to response
  
  Percentiles matter more than averages:
    p50 (median): half of requests are faster, half are slower
    p95: 95% of requests are faster than this
    p99: 99% of requests are faster than this
    p99.9 (tail latency): what the 1-in-1000 unlucky user experiences
    Average can mask terrible tail latency.

THROUGHPUT:
  How many operations can the system handle per unit time?
  Units: requests/second (RPS), transactions/second (TPS), MB/s
  Example: the server handles 500 requests/second

CAPACITY:
  What is the maximum the system can handle before it degrades?
  Related: saturation point (where adding more load causes quality to drop)

RELATIONSHIP:
  Latency and throughput are connected but independent:
  → High throughput, high latency: batch processing (throughput is good, but each batch takes time)
  → Low throughput, low latency: single-threaded real-time (fast responses, but can't handle many)
  → High throughput AND low latency: the goal, but requires concurrency and optimised code
```

**CS lens:** Amdahl's Law states: if a fraction `f` of a program is parallelisable (or optimisable), the maximum speedup is `1 / (1 - f)`. If 90% of time is in one bottleneck, fixing it gives at most 10× speedup. If only 50% is in the bottleneck, the max speedup is 2×. The implication: optimisations to non-bottleneck code are bounded by the remaining bottleneck. This is why "find and fix the bottleneck" is the core performance engineering cycle — you must fix the right 20% of code to get 80% of the improvement.

## Why code is slow

```text
CATEGORY 1: ALGORITHM COMPLEXITY
  O(n²) where O(n log n) is possible. Nested loops where a hash map would do.
  Example: checking if every item in list A exists in list B:
    O(n²): for each item in A, scan all of B
    O(n):  put all of B in a Set, then check membership in O(1)

CATEGORY 2: DATA STRUCTURE CHOICE
  Array linear search instead of hash map. Repeated array copying instead of streaming.
  Example: building a string with += in a loop:
    O(n²): each += copies the whole string
    O(n):  push to array, join at the end

CATEGORY 3: UNNECESSARY WORK
  Recomputing the same thing repeatedly. Loading data that is not used.
  Example: calling JSON.parse() on every request instead of caching the result.

CATEGORY 4: I/O BOTTLENECK
  Too many database queries (N+1 problem). Waiting for network serially.
  Example: loading 100 user profiles one at a time instead of a batch query.

CATEGORY 5: MEMORY PRESSURE
  Creating too many objects, triggering frequent garbage collection.
  Storing too much in memory, causing thrashing.

CATEGORY 6: BLOCKING THE EVENT LOOP (JavaScript-specific)
  CPU-intensive synchronous work holding up all async operations.
```

## The measurement toolkit

```javascript
// 1. console.time / console.timeEnd: the simplest timing tool
console.time('data-load')
const data = await loadData()
console.timeEnd('data-load')   // prints "data-load: 342.47ms"

// 2. performance.now(): high-resolution timestamps (browser and Node.js)
const start = performance.now()
processData(data)
const elapsed = performance.now() - start
console.log(`processData: ${elapsed.toFixed(2)}ms`)

// 3. Writing a simple benchmark
function benchmark(name, fn, iterations = 1000) {
  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  const elapsed = performance.now() - start
  const perOp = elapsed / iterations
  console.log(`${name}: ${perOp.toFixed(4)}ms per operation (${iterations} iterations)`)
  return perOp
}

// 4. Comparing two implementations
const data = generateTestData(1000)

const slowTime = benchmark('linear search', () => linearSearch(data, 'target'))
const fastTime = benchmark('binary search', () => binarySearch(data, 'target'))
console.log(`Speedup: ${(slowTime / fastTime).toFixed(1)}×`)
```

```text
MEASUREMENT PITFALLS:
  → Single measurement is not representative — outliers exist (GC pause, OS interruption)
    Run many iterations and use the average or median.
  → "Warm" vs "cold" — first run may be slower (JIT compilation, cache misses)
    Discard the first few measurements.
  → Measuring the wrong thing — measuring total time when only one part changed
    Isolate the section being optimised.
  → Test data that doesn't match production — benchmarking with 10 items
    when production has 100,000 items
    Benchmark at realistic scale.
```

**SE lens:** Measurement is not just for optimisation — it is for understanding. When you do not know what your system's performance looks like in production, you are flying blind. Every production system should have performance monitoring: latency percentiles per endpoint, error rates, throughput over time. Without this data, you cannot know when performance degrades, cannot verify that an optimisation worked, and cannot set realistic goals. The tools: Application Performance Monitoring (APM) systems (Datadog, New Relic, Sentry Performance).

**Common mistakes:**
- Optimising without measuring — "this loop must be slow" without checking. It is often wrong and leads to complexity with no benefit.
- Micro-optimising while ignoring architecture — replacing `===` with `==` (irrelevant) while loading data with N+1 queries (very relevant). Fix the big things first.
- Not measuring in production conditions — a benchmark that runs in 1ms on a developer laptop may run in 100ms on a production server with concurrent load, cold caches, and real data sizes.

**Debug tip:** To find where time is being spent, use a profiler — not print statements. Browser DevTools: Performance tab → record while reproducing the problem. Node.js: `node --prof server.js` to generate a V8 profile, then `node --prof-process` to read it. The profiler shows a call tree: how much time was spent in each function. The function at the top of the "hot path" is where to focus optimisation effort.

## Challenge: performance_diagnosis

Diagnose the performance problem in each scenario.

```challenge
function diagnosePerformance(scenario) {
  // Returns: { category: string, bottleneck: string, fix: string }
  //   category: 'algorithm' | 'data-structure' | 'unnecessary-work' | 'io' | 'memory'
  //   bottleneck: one sentence describing what is slow
  //   fix: one sentence describing the fix

  if (scenario === 'duplicate-check') {
    // function hasDuplicates(arr) {
    //   for (let i = 0; i < arr.length; i++) {
    //     for (let j = 0; j < arr.length; j++) {
    //       if (i !== j && arr[i] === arr[j]) return true
    //     }
    //   }
    //   return false
    // }
    // Called with arrays of 100,000 items — takes 10 seconds.
  }

  if (scenario === 'repeated-parse') {
    // app.get('/config', (req, res) => {
    //   const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'))
    //   res.json(config)
    // })
    // Called 10,000 times per second — file is read and parsed on every request.
  }

  if (scenario === 'n-plus-one') {
    // async function loadUsersWithOrders(userIds) {
    //   const users = await db.users.findMany(userIds)
    //   for (const user of users) {
    //     user.orders = await db.orders.findByUser(user.id)   // 1 query per user
    //   }
    //   return users
    // }
    // With 500 users: runs 501 database queries.
  }
}
```

```test
const d = diagnosePerformance('duplicate-check')
assert d.category === 'algorithm' && d.bottleneck.length > 15
assert d.fix.toLowerCase().includes('set') || d.fix.toLowerCase().includes('hash') || d.fix.toLowerCase().includes('o(n)')

const p = diagnosePerformance('repeated-parse')
assert p.category === 'unnecessary-work'
assert p.fix.toLowerCase().includes('cach') || p.fix.toLowerCase().includes('once') || p.fix.toLowerCase().includes('startup')

const n = diagnosePerformance('n-plus-one')
assert n.category === 'io'
assert n.fix.toLowerCase().includes('batch') || n.fix.toLowerCase().includes('join') || n.fix.toLowerCase().includes('single query')
```
