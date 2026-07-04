export default   {
    id: 'memoization',
    title: 'Memoization',
    tag: 'Functional',
    steps: [
      {
        title: 'fibonacci — correct, but exponentially slow',
        code:
`function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}`,
        explanation: [
          '`fibonacci(n)` has one base case at line 2: `n <= 1` returns `n` immediately. For any other input, line 3 makes two recursive calls — `fibonacci(n - 1)` and `fibonacci(n - 2)` — and adds their results. The call tree branches into two nodes at every level. Every level doubles the number of calls.',
          'CS — This is the overlapping sub-problems pattern. `fibonacci(5)` calls `fibonacci(4) + fibonacci(3)`. `fibonacci(4)` calls `fibonacci(3) + fibonacci(2)`. `fibonacci(3)` is therefore computed twice at this level alone — and each of those calls fans into two more. Total calls for `fibonacci(n)` follows `O(2ⁿ)`. The redundancy compounds exponentially with depth.',
          'SE — This bug surfaces in production wherever sub-problems repeat: tree traversal over shared sub-paths, dynamic pricing where component costs overlap, compiler optimisation passes over repeated AST sub-trees. The code is correct on small inputs and catastrophically slow on real ones — the classic "works in dev, dies in prod" failure mode.',
          'Without this: `fibonacci(35)` makes approximately 29 million recursive calls. `fibonacci(50)` would take minutes. The function is mathematically correct but operationally useless above roughly `n = 30`. Any system that passes realistic inputs to this will time out or exhaust the call stack before returning an answer.',
        ],
        active: [{ startLine: 1, endLine: 4, color: 'indigo', label: 'fibonacci — correct result, exponentially slow' }],
        connections: [{ fromLine: 3, toLine: 1, color: 'indigo', label: 'recursive — branches at every node' }],
      },
      {
        title: 'fibonacci(10) — 177 recursive calls for one answer',
        code:
`function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

console.log(fibonacci(10))`,
        explanation: [
          '`console.log(fibonacci(10))` on line 6 enters `fibonacci` at line 1. `n = 10` fails the base case, so it calls `fibonacci(9) + fibonacci(8)`. Each fans into two more, until all paths reach `n <= 1`. The result 55 unwinds back up the call stack and prints. The interpreter made 177 recursive calls to compute this one number.',
          'CS — Call count for `fibonacci(n)` is approximately `2ⁿ`. For `n = 10`: 177 calls. For `n = 20`: 21,891. For `n = 30`: 2.7 million. For `n = 35`: 29 million. Each increment of `n` roughly doubles the work. The same sub-problem — say `fibonacci(8)` — is computed redundantly by both the `fibonacci(9)` branch and the `fibonacci(10)` branch, independently.',
          'SE — A function with two recursive self-calls and no cache is a standard code review red flag. It passes every unit test because test inputs are small. It fails in production because real input sizes expose the exponential. This is why performance testing with production-representative data is a separate discipline — correctness and performance are independent, and small-input tests cannot reveal exponential complexity.',
          'Without this: without a baseline call confirming `fibonacci(10)` is 55 and correct before optimising, you have no reference. An optimised function that returns the wrong answer is worse than a slow correct one. Always verify correctness before you cache — memoisation of a buggy function caches wrong answers permanently.',
        ],
        active: [
          { startLine: 6, endLine: 6, color: 'emerald', label: 'fibonacci(10) → 55 — took 177 recursive calls' },
          { startLine: 3, endLine: 3, color: 'indigo',  label: 'two calls per level — exponential branching' },
        ],
        connections: [{ fromLine: 6, toLine: 1, color: 'emerald', label: 'enters fibonacci' }],
      },
      {
        title: 'memoize — a cache wrapper around any pure function',
        code:
`function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

console.log(fibonacci(10))

function memoize(fn) {
  const cache = new Map()
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}`,
        explanation: [
          '`memoize` takes any function `fn` and returns a new wrapper. `const cache = new Map()` on line 9 creates a private cache — one `Map` per call to `memoize`, closed over by the wrapper. The wrapper serialises `args` to a string key with `JSON.stringify`, checks the cache, calls `fn` only on a miss, stores the result, and returns it. `fn` and `cache` are invisible to all outside code.',
          'CS — This is the higher-order function pattern: a function that takes a function and returns a function. The returned wrapper closes over `fn` and `cache` — those variables stay alive as long as the wrapper is referenced. The cache acts as a memo table, the same data structure dynamic programming uses. The key insight: pure functions (same input → same output, no side effects) can be cached safely forever.',
          'SE — `_.memoize` in Lodash does exactly this. React\'s `useMemo(fn, deps)` memoises a computed value between renders. `reselect`\'s `createSelector` memoises derived Redux state. All three implement the same pattern: wrap a pure computation in a cache lookup using the inputs as the key. The only difference is the invalidation strategy — here the cache never clears; `useMemo` clears when deps change; `createSelector` caches the most recent call only.',
          'Without this: without the closure, `cache` would be a local variable recreated on every call and immediately discarded — no caching at all. Without `Map`, a plain object `{}` would inherit `Object.prototype` methods, meaning a key like `\'constructor\'` or `\'toString\'` would collide with a prototype property and return a function instead of a cached value. `Map` has no prototype and handles any key safely.',
        ],
        active: [
          { startLine: 8,  endLine: 9,  color: 'violet', label: 'memoize — fn captured in closure, cache created per wrap' },
          { startLine: 10, endLine: 16, color: 'indigo', label: 'wrapper — key → check → miss: call+store | hit: return' },
        ],
        connections: [],
      },
      {
        title: 'fibonacci = memoize(fibonacci) — all recursive calls now hit the cache',
        code:
`function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

console.log(fibonacci(10))

function memoize(fn) {
  const cache = new Map()
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

fibonacci = memoize(fibonacci)`,
        explanation: [
          'Line 19 reassigns `fibonacci` to `memoize(fibonacci)`. Now when `fibonacci(n - 1)` runs inside the function body at line 3, it looks up `fibonacci` in the environment and finds the memoized wrapper — not the original. Every recursive call goes through the cache. `fibonacci(10)` descends linearly to the base cases and then caches each result on the way back up. 11 unique computations replace 177.',
          'CS — This is self-referential memoisation. Before the reassignment, `fibonacci(n - 1)` called the original. After, it calls the memoized wrapper. The call tree collapses from exponential to linear: each unique value of `n` is computed exactly once and stored. `fibonacci(10)` computing `fibonacci(9) + fibonacci(8)` — when `fibonacci(8)` is reached, it is already cached from computing `fibonacci(9)`. The second branch is always a cache hit.',
          'SE — `fibonacci = memoize(fibonacci)` is the standard pattern for memoising a recursive function. The function variable is rebound so all callers — including the recursive calls inside the function itself — go through the cache. This is how `_.memoize` is documented for recursive use: `fibonacci = _.memoize(fibonacci)`. Without the rebind, only the top-level call is cached and the entire call tree runs from scratch on every call.',
          'Without this: if you wrote `const fastFib = memoize(fibonacci)` instead, recursive calls inside `fibonacci` still call the original unbounded `fibonacci` — not `fastFib`. Every `fastFib(10)` call triggers a fresh 177-call tree. Only the top-level result is cached. This is a common mistake: wrapping a recursive function without rebinding the name it calls itself by.',
        ],
        active: [
          { startLine: 19, endLine: 19, color: 'emerald', label: 'fibonacci = memoize(fibonacci) — name rebound, recursion now cached' },
          { startLine: 3,  endLine: 3,  color: 'violet',  label: 'fibonacci(n-1) now resolves to the memoized wrapper' },
        ],
        connections: [{ fromLine: 19, toLine: 8, color: 'emerald', label: 'enters memoize' }],
      },
      {
        title: 'fibonacci(10) — 11 unique calls, then instant on repeat',
        code:
`function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

console.log(fibonacci(10))

function memoize(fn) {
  const cache = new Map()
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

fibonacci = memoize(fibonacci)

console.log(fibonacci(10))  // 11 unique calls — fills cache for n=0..10
console.log(fibonacci(10))  // cache hit — instant`,
        explanation: [
          '`fibonacci(10)` on line 21 enters the wrapper. Cache miss for `\'[10]\'` — `fn(10)` runs. It calls `fibonacci(9)` which enters the wrapper — cache miss, calls `fibonacci(8)`, which misses, calls `fibonacci(7)`... down to `fibonacci(1)` and `fibonacci(0)` (base cases). On the way back up: `fibonacci(2)` = `fibonacci(1)` [HIT: 1] + `fibonacci(0)` [HIT: 0] = 1, cached. Every subsequent level finds its second branch already in cache. Total: 11 unique computations, not 177. Line 22 is an instant cache hit.',
          'CS — The call tree has collapsed from a binary tree (`O(2ⁿ)` nodes) to a linear descent and ascent. `fibonacci(10)` descends to the base cases in 10 steps, then each return immediately caches the result. The second recursive branch at every level (`fibonacci(n - 2)`) is always a cache hit because `fibonacci(n - 1)` was just computed and cached going down. This is bottom-up dynamic programming, achieved automatically through memoisation.',
          'SE — After calling `fibonacci(10)`, the cache holds all values from `n = 0` through `n = 10`. Any future call to `fibonacci` for those values is now `O(1)`. This warm cache persists for the lifetime of the function. In Redis, the analogous concept is a cache warm-up: pre-compute frequently requested values so runtime requests are always hits. Here, the warm-up happens automatically on first access.',
          'Without this: without the `fibonacci = memoize(fibonacci)` rebind, `fibonacci(10)` in step 19 would call the original unmemoized function on every call, making 177 recursive calls each time. The cache would only store the top-level result for `\'[10]\'`. The recursive sub-problems — `fibonacci(9)`, `fibonacci(8)`, etc. — would still recompute from scratch on every call to `fibonacci(11)` or `fibonacci(12)`.',
        ],
        active: [
          { startLine: 21, endLine: 21, color: 'violet',  label: 'fibonacci(10) — 11 unique calls fills cache n=0..10' },
          { startLine: 12, endLine: 15, color: 'indigo',  label: 'miss path — compute each unique n once, then cache it' },
          { startLine: 22, endLine: 22, color: 'emerald', label: 'fibonacci(10) again — instant cache hit' },
        ],
        connections: [
          { fromLine: 21, toLine: 10, color: 'violet',  label: 'enters wrapper' },
          { fromLine: 22, toLine: 10, color: 'emerald', label: 'enters wrapper — hit, returns immediately' },
        ],
      },
      {
        title: 'fibonacci(35) — 25 more unique calls, then instant forever',
        code:
`function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

console.log(fibonacci(10))

function memoize(fn) {
  const cache = new Map()
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

fibonacci = memoize(fibonacci)

console.log(fibonacci(10))  // 11 unique calls — fills cache for n=0..10
console.log(fibonacci(10))  // cache hit — instant
console.log(fibonacci(35))  // 25 more unique calls — n=11..35 only
console.log(fibonacci(35))  // cache hit — instant`,
        explanation: [
          '`fibonacci(35)` on line 23: the cache already holds `n = 0` through `n = 10` from the previous calls. `fibonacci(35)` descends to `fibonacci(11)` — the first cache miss — then builds upward. Each step from `n = 11` to `n = 35` is one cache miss with the second branch always a hit. 25 unique computations. Without memoisation this would be 29 million calls. Line 24 is an instant cache hit.',
          'CS — The cache is persistent and cumulative. Each call to `fibonacci(n)` adds `n + 1` entries to the cache. Calling `fibonacci(35)` after `fibonacci(10)` adds only 25 entries — the first 11 (n=0..10) are reused. The total work done across all calls is `O(n_max)` where `n_max` is the largest value ever requested. Without memoisation, each call to `fibonacci(n)` costs `O(2ⁿ)` independently.',
          'SE — Persistent cache across calls is the production-grade behaviour. A CDN edge cache that evicted every entry after serving it would provide no benefit. Here, the `Map` is closed over by the wrapper and lives as long as `fibonacci` is in scope. Lodash\'s `_.memoize` works the same way — the cache accumulates across every call made through the memoized function, not just within a single call.',
          'Without this: the alternative — `const fastFib = memoize(fibonacci)` — would have called the original 177-call `fibonacci` inside `fn(35)`, making approximately 29 million recursive calls. Even with the top-level result cached for subsequent `fastFib(35)` calls, `fastFib(36)` would still trigger 47 million calls from scratch. The cache only covers inputs that have already been given to `fastFib` directly — none of the sub-problems benefit.',
        ],
        active: [
          { startLine: 23, endLine: 23, color: 'pink',    label: 'fibonacci(35) — only 25 new calls, n=11..35 computed' },
          { startLine: 12, endLine: 12, color: 'emerald', label: 'n=0..10 all hit instantly from previous calls' },
          { startLine: 24, endLine: 24, color: 'violet',  label: 'fibonacci(35) again — instant hit, 9227465' },
        ],
        connections: [
          { fromLine: 23, toLine: 10, color: 'pink',   label: 'enters wrapper' },
          { fromLine: 24, toLine: 10, color: 'violet', label: 'enters wrapper — hit' },
        ],
      },
    ],
  }
