export default {
  id: 'memoization',
  title: 'Memoization',
  tag: 'Functional',
  steps: [
    {
      title: 'fibonacci — correct but exponentially slow',
      semanticEvent: 'DefineFunction',
      code:
`function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}`,
      explanation: [
        '`fibonacci` establishes a **two-branch recursive dependency**: every call produces two more calls, each producing two more. The abstraction is correct — the return value is the right Fibonacci number — but the dependency graph is a binary tree that doubles in size with every level. Sub-problems overlap massively: `fibonacci(8)` is recomputed dozens of times across different branches.',
        'CS — This is the overlapping sub-problems pattern. `fibonacci(5)` calls `fibonacci(4) + fibonacci(3)`. `fibonacci(4)` calls `fibonacci(3) + fibonacci(2)`. `fibonacci(3)` is therefore computed twice at this level alone. Total calls for `fibonacci(n)` follows `O(2ⁿ)`. The redundancy compounds exponentially with depth.',
        'SE — This bug surfaces in production wherever sub-problems repeat: tree traversal over shared sub-paths, dynamic pricing where component costs overlap, compiler optimisation passes over repeated AST sub-trees. The code is correct on small inputs and catastrophically slow on real ones — the classic "works in dev, dies in prod" failure mode.',
        'Without this: `fibonacci(35)` makes approximately 29 million recursive calls. `fibonacci(50)` would take minutes. The function is mathematically correct but operationally useless above roughly `n = 30`. Any system that passes realistic inputs to this will time out or exhaust the call stack before returning an answer.',
      ],
      active: [{ startLine: 1, endLine: 4, color: 'indigo', label: 'fibonacci — two recursive branches per call' }],
      connections: [{ fromLine: 3, toLine: 1, color: 'indigo', label: 'recursive self-call branches', type: 'calls' }],
    },
    {
      title: 'fibonacci(10) — 177 calls for one answer',
      semanticEvent: 'CallFunction',
      code:
`function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

console.log(fibonacci(10))`,
      explanation: [
        '`fibonacci(10)` reveals the cost of the overlapping dependency: **177 recursive calls to produce one number**. The return value (`55`) is correct, but the call tree is a wasteful binary explosion — `fibonacci(8)` alone is recomputed 21 times across different branches, each time from scratch. The correct answer obscures the redundant computation behind it.',
        'CS — Call count for `fibonacci(n)` is approximately `2ⁿ`. For `n = 10`: 177 calls. For `n = 20`: 21,891. For `n = 30`: 2.7 million. Each increment of `n` roughly doubles the work. The same sub-problem — say `fibonacci(8)` — is computed redundantly by both the `fibonacci(9)` branch and the `fibonacci(10)` branch.',
        'SE — A function with two recursive self-calls and no cache is a standard code review red flag. It passes every unit test because test inputs are small. It fails in production because real input sizes expose the exponential. This is why performance testing with production-representative data is a separate discipline — correctness and performance are independent.',
        'Without this: without a baseline call confirming `fibonacci(10)` is 55 and correct before optimising, you have no reference. An optimised function that returns the wrong answer is worse than a slow correct one. Always verify correctness before you cache — memoisation of a buggy function caches wrong answers permanently.',
      ],
      active: [
        { startLine: 6, endLine: 6, color: 'emerald', label: 'fibonacci(10) → 55 (177 calls)' },
        { startLine: 3, endLine: 3, color: 'indigo',  label: 'two branches — exponential fan-out' },
      ],
      connections: [
        { fromLine: 6, toLine: 1, color: 'emerald', label: 'fibonacci(10) entry', type: 'calls' },
        { fromLine: 3, toLine: 1, color: 'indigo',  label: 'recursive branches', type: 'calls' },
      ],
    },
    {
      title: 'memoize — a cache wrapper for any pure function',
      semanticEvent: 'DefineFunction',
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
        '`memoize` establishes the **cache → function dependency**: it wraps any pure function `fn` in a layer that stores results by input key. The `cache` Map is private to this wrap — one Map per `memoize(fn)` call, closed over by the returned wrapper. The relationship: the first call for any input flows through to `fn`; every subsequent call for that input reads from `cache` instead.',
        'CS — This is the higher-order function pattern: a function that takes a function and returns a function. The returned wrapper closes over `fn` and `cache` — those variables stay alive as long as the wrapper is referenced. The cache acts as a memo table, the same data structure dynamic programming uses. Pure functions (same input → same output, no side effects) can be cached safely forever.',
        'SE — `_.memoize` in Lodash does exactly this. React\'s `useMemo(fn, deps)` memoises a computed value between renders. `reselect`\'s `createSelector` memoises derived Redux state. All three implement the same pattern: wrap a pure computation in a cache lookup using the inputs as the key. The only difference is the invalidation strategy — here the cache never clears; `useMemo` clears when deps change.',
        'Without this: without the closure, `cache` would be a local variable recreated on every call and immediately discarded — no caching at all. Without `Map`, a plain object `{}` would inherit `Object.prototype` methods, meaning a key like `\'constructor\'` or `\'toString\'` would collide with a prototype property. `Map` has no prototype and handles any key safely.',
      ],
      active: [
        { startLine: 8,  endLine: 9,  color: 'violet', label: 'memoize — fn captured, cache allocated per wrap' },
        { startLine: 10, endLine: 16, color: 'indigo', label: 'wrapper — miss: call+cache | hit: return' },
      ],
      connections: [
        { fromLine: 9,  toLine: 8,  color: 'violet', label: 'cache allocated per memoize() call', type: 'creates' },
        { fromLine: 10, toLine: 13, color: 'indigo', label: 'miss path calls fn', type: 'calls' },
      ],
    },
    {
      title: 'fibonacci = memoize(fibonacci) — recursion now cached',
      semanticEvent: 'WriteVariable',
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
        'Reassigning `fibonacci` to the memoized wrapper **closes the self-referential loop**: the recursive calls on line 3 (`fibonacci(n-1)`, `fibonacci(n-2)`) now resolve to the wrapper — not the original. Every recursive sub-call goes through the cache. The call tree collapses from a binary explosion to a linear descent where each value of `n` is computed exactly once.',
        'CS — This is self-referential memoisation. Before the reassignment, `fibonacci(n - 1)` called the original. After, it calls the memoized wrapper. The call tree collapses from exponential to linear: each unique value of `n` is computed exactly once and stored. The second recursive branch at every level is always a cache hit.',
        'SE — `fibonacci = memoize(fibonacci)` is the standard pattern for memoising a recursive function. The function variable is rebound so all callers — including the recursive calls inside the function itself — go through the cache. This is how `_.memoize` is documented for recursive use: `fibonacci = _.memoize(fibonacci)`. Without the rebind, only the top-level call is cached.',
        'Without this: if you wrote `const fastFib = memoize(fibonacci)` instead, recursive calls inside `fibonacci` still call the original unbounded `fibonacci` — not `fastFib`. Every `fastFib(10)` call triggers a fresh 177-call tree. Only the top-level result is cached. This is a common mistake: wrapping a recursive function without rebinding the name it calls itself by.',
      ],
      active: [
        { startLine: 19, endLine: 19, color: 'emerald', label: 'fibonacci rebound — recursion now routes through cache' },
        { startLine: 3,  endLine: 3,  color: 'violet',  label: 'fibonacci(n-1) now resolves to the memoized wrapper' },
      ],
      connections: [
        { fromLine: 19, toLine: 8,  color: 'emerald', label: 'memoize(fibonacci) wraps it', type: 'calls' },
        { fromLine: 19, toLine: 3,  color: 'violet',  label: 'recursive calls now hit wrapper', type: 'writes' },
      ],
    },
    {
      title: 'fibonacci(10) — 11 calls, then instant on repeat',
      semanticEvent: 'CallFunction',
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
        'First call: `fibonacci(10)` descends to `fibonacci(0)` in 10 steps — each a cache miss — then each return **caches its result and is immediately reused** as the second branch of the level above. Total: 11 unique computations replacing 177. Second call: pure cache hit — `O(1)`. The dependency structure is now: first call populates the cache; all subsequent calls read from it.',
        'CS — The call tree has collapsed from a binary tree (`O(2ⁿ)` nodes) to a linear descent and ascent. `fibonacci(10)` descends to the base cases in 10 steps, then each return immediately caches the result. The second recursive branch at every level is always a cache hit because `fibonacci(n - 1)` was just computed and cached going down. This is bottom-up dynamic programming achieved automatically through memoisation.',
        'SE — After calling `fibonacci(10)`, the cache holds all values from `n = 0` through `n = 10`. Any future call to `fibonacci` for those values is now `O(1)`. This warm cache persists for the lifetime of the function. In Redis, the analogous concept is a cache warm-up: pre-compute frequently requested values so runtime requests are always hits.',
        'Without this: without the `fibonacci = memoize(fibonacci)` rebind, `fibonacci(10)` would call the original 177-call function every time. The cache would only store the top-level result for `\'[10]\'`. The recursive sub-problems — `fibonacci(9)`, `fibonacci(8)`, etc. — would still recompute from scratch on every call to `fibonacci(11)` or `fibonacci(12)`.',
      ],
      active: [
        { startLine: 21, endLine: 21, color: 'violet',  label: 'fibonacci(10) — 11 unique calls fills cache n=0..10' },
        { startLine: 12, endLine: 15, color: 'indigo',  label: 'miss: compute and cache; hit: return immediately' },
        { startLine: 22, endLine: 22, color: 'emerald', label: 'fibonacci(10) again — instant cache hit' },
      ],
      connections: [
        { fromLine: 21, toLine: 10, color: 'violet',  label: 'enters wrapper', type: 'calls' },
        { fromLine: 21, toLine: 9,  color: 'indigo',  label: 'miss: result cached', type: 'writes' },
        { fromLine: 22, toLine: 10, color: 'emerald', label: 'enters wrapper — hit', type: 'calls' },
        { fromLine: 22, toLine: 9,  color: 'emerald', label: 'reads from cache', type: 'reads' },
      ],
    },
    {
      title: 'fibonacci(35) — 25 new calls, then instant',
      semanticEvent: 'CallFunction',
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
        '`fibonacci(35)` needs values `n = 11..35` — `n = 0..10` are already cached from the previous calls. Only **25 new computations** run instead of 29 million. The cache accumulates across calls: each new `fibonacci(n)` call extends the warm region by exactly one entry. The relationship is now fully visible: sub-problem results are dependencies shared across all future calls.',
        'CS — The cache is persistent and cumulative. Each call to `fibonacci(n)` adds `n + 1` entries to the cache. Calling `fibonacci(35)` after `fibonacci(10)` adds only 25 entries — the first 11 (n=0..10) are reused. The total work done across all calls is `O(n_max)` where `n_max` is the largest value ever requested.',
        'SE — Persistent cache across calls is the production-grade behaviour. A CDN edge cache that evicted every entry after serving it would provide no benefit. Here, the `Map` is closed over by the wrapper and lives as long as `fibonacci` is in scope. Lodash\'s `_.memoize` works the same way — the cache accumulates across every call made through the memoized function.',
        'Without this: the alternative — `const fastFib = memoize(fibonacci)` — would have called the original 177-call `fibonacci` inside `fn(35)`, making approximately 29 million recursive calls. Even with the top-level result cached, `fastFib(36)` would still trigger 47 million calls. The cache only covers inputs given to `fastFib` directly — none of the sub-problems benefit.',
      ],
      active: [
        { startLine: 23, endLine: 23, color: 'pink',    label: 'fibonacci(35) — 25 new calls (n=11..35)' },
        { startLine: 12, endLine: 12, color: 'emerald', label: 'n=0..10 all hit instantly from warm cache' },
        { startLine: 24, endLine: 24, color: 'violet',  label: 'fibonacci(35) again — instant hit' },
      ],
      connections: [
        { fromLine: 23, toLine: 10, color: 'pink',    label: 'enters wrapper', type: 'calls' },
        { fromLine: 23, toLine: 9,  color: 'pink',    label: 'n=11..35 written to cache', type: 'writes' },
        { fromLine: 24, toLine: 9,  color: 'violet',  label: 'reads from cache', type: 'reads' },
      ],
    },
  ],
}
