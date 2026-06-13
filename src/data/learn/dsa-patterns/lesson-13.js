// DSA + Design Patterns — Lesson 13
// Memoization + Proxy (deep dive)

export const lesson = {
  id: 'dsa-patterns-13',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '13. Memoization + Proxy (deep dive)',
  checkpoints: [
    { id: 'cp-memo',     label: 'Memoization' },
    { id: 'cp-proxy',    label: 'Proxy Pattern' },
    { id: 'cp-together', label: 'Put Together' },
  ],
  segments: [

    {
      type: 'narration',
      id: 'intro',
      text: 'Recap from the Space/Time Tradeoff lesson: memoization stores the result of a function call the first time it runs, and returns the cached result on all subsequent calls with the same input. This transforms exponential recursive algorithms into linear ones. That lesson introduced the pattern. This lesson goes deeper: what IS the cache structurally, why is hash table lookup O(1), how do you handle functions with multiple arguments, how do you set expiry on cache entries, and — most importantly — how does the Proxy pattern give memoization a principled, reusable structure that makes the original function completely unaware it is being cached.',
      code: null,
    },

    {
      type: 'narration',
      id: 'step1-cache-is-hashtable',
      text: 'The cache in a memoize function is a hash table (recall: a hash table maps keys to values in O(1) average). The argument string is the key. The return value is the value. JSON.stringify(args) converts any argument list into a deterministic string key. Hash table lookup — checking whether a key exists and retrieving its value — is O(1) average. This is what makes memoization fast: the cost of checking the cache is constant regardless of how many results have been cached.',
      code: `// The cache IS a hash table
function memoize(fn) {
  const cache = new Map()   // Map is a hash table: O(1) get and set
  let hits = 0, misses = 0

  return function(...args) {
    const key = JSON.stringify(args)   // hash table key
    if (cache.has(key)) {
      hits++
      return cache.get(key)            // O(1) hash table lookup
    }
    misses++
    const result = fn(...args)
    cache.set(key, result)             // O(1) hash table insert
    return result
  }
}

function slowFib(n) {
  if (n <= 1) return n
  return slowFib(n - 1) + slowFib(n - 2)
}

const fastFib = memoize(slowFib)

console.log(fastFib(10))   // computed
console.log(fastFib(10))   // cache hit
console.log(fastFib(5))    // cache hit (was computed as sub-problem of fib(10))`,
    },

    {
      type: 'narration',
      id: 'step2-multi-arg',
      text: 'JSON.stringify handles multiple arguments naturally — it serialises the entire args array into one string. But it has limitations: it cannot serialise functions, symbols, circular references, or class instances with methods. For these, you need a custom key function. The key function is a strategy — a pluggable algorithm for turning arguments into a cache key. This lets memoize work with any type of argument.',
      code: `function memoize(fn, keyFn = (...args) => JSON.stringify(args)) {
  const cache = new Map()
  return function(...args) {
    const key = keyFn(...args)   // pluggable key strategy
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

// Multi-argument function
function add(a, b) { return a + b }
const memoAdd = memoize(add)

console.log(memoAdd(2, 3))   // 5, computed
console.log(memoAdd(2, 3))   // 5, cached
console.log(memoAdd(3, 2))   // 5, computed — different key ("3,2" vs "2,3")

// Custom key function: ignore argument order (commutative operations)
const memoAddCommutative = memoize(add, (a, b) => JSON.stringify([Math.min(a,b), Math.max(a,b)]))
console.log(memoAddCommutative(2, 3))   // computed
console.log(memoAddCommutative(3, 2))   // cache hit — same key`,
    },

    {
      type: 'narration',
      id: 'step3-ttl',
      text: 'A cache entry should not live forever. Stale data — a cached result that is no longer valid because the underlying data changed — is a common production bug. TTL (Time To Live) is a duration after which a cache entry expires and must be recomputed. Implement TTL by storing the expiry timestamp alongside the cached value. On each lookup, check whether the entry has expired before returning it.',
      code: `function memoizeWithTTL(fn, ttlMs = 5000) {
  const cache = new Map()   // key → { value, expiresAt }

  return function(...args) {
    const key   = JSON.stringify(args)
    const now   = Date.now()
    const entry = cache.get(key)

    if (entry && entry.expiresAt > now) {
      console.log('cache hit:', key)
      return entry.value
    }

    console.log('cache miss:', key)
    const value = fn(...args)
    cache.set(key, { value, expiresAt: now + ttlMs })
    return value
  }
}

function getUser(id) {
  return { id, name: 'User ' + id, ts: Date.now() }
}

const cachedGetUser = memoizeWithTTL(getUser, 1000)   // 1 second TTL

console.log(cachedGetUser(1))   // miss — computed
console.log(cachedGetUser(1))   // hit — from cache
// After 1 second the entry expires and the next call will miss again`,
    },

    {
      type: 'challenge',
      id: 'ch-memo',
      text: 'Write a function called memoizeMax(fn, maxSize) that memoizes fn but only keeps the most recent maxSize results. When the cache reaches maxSize and a new key is added, remove the oldest entry. Use a Map — iteration order in a Map matches insertion order, so the first key from map.keys() is the oldest. Test: create a memoized version of (n) => n * 2 with maxSize 3. Call it with 1, 2, 3 (fills cache). Call with 4 (cache full — oldest evicted). Log cache size (3) after the fourth call.',
      expectedOutput: null,
      startCode: `function memoizeMax(fn, maxSize) {
  const cache = new Map()
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    if (cache.size >= maxSize) {
      // remove the oldest entry (first key in insertion order)
      const oldest = cache.keys().next().value
      cache.delete(oldest)
    }
    cache.set(key, result)
    return result
  }
}

const double = memoizeMax(n => n * 2, 3)
double(1); double(2); double(3)
double(4)   // evicts oldest

// Access the cache size via closure — test the return values instead
console.log(double(1))   // recomputed (was evicted)
console.log(double(2))   // still cached
console.log(double(3))   // still cached`,
      hint: 'The eviction logic is already in the scaffold. Call cache.keys().next().value to get the Map\'s oldest key.',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim(), 10))
        return nums.includes(2) && nums.includes(4) && nums.includes(6)
      },
    },

    { type: 'checkpoint', id: 'cp-memo' },

    {
      type: 'narration',
      id: 'step4-proxy-pattern',
      text: 'Recall from the Space/Time Tradeoff lesson: the Proxy pattern puts an object in front of another object with the same interface. The caller cannot distinguish the proxy from the real subject. The proxy intercepts calls and can short-circuit them (cache hit), add logging, add validation, or delay the real call. The memoize wrapper is a functional proxy: it wraps a function with the same signature and intercepts calls. In object-oriented code, the Proxy is a class that wraps another class.',
      code: null,
    },

    {
      type: 'narration',
      id: 'step5-es6-proxy',
      text: 'JavaScript has a built-in Proxy object that can intercept operations on any object — property access, function calls, assignment. The Proxy constructor takes a target and a handler. The handler defines traps: functions that intercept specific operations. The apply trap intercepts function calls. This makes it possible to build a memoizing proxy without modifying the original function at all.',
      code: `// ES6 Proxy with apply trap — intercepts function calls
function memoizeProxy(fn) {
  const cache = new Map()

  return new Proxy(fn, {
    apply(target, thisArg, args) {       // trap: called when the proxy is invoked
      const key = JSON.stringify(args)
      if (cache.has(key)) {
        console.log('proxy cache hit')
        return cache.get(key)
      }
      const result = Reflect.apply(target, thisArg, args)   // call the real function
      cache.set(key, result)
      return result
    }
  })
}

function square(n) { return n * n }

const memoSquare = memoizeProxy(square)

console.log(memoSquare(5))   // 25 — computed
console.log(memoSquare(5))   // 25 — proxy cache hit
console.log(memoSquare(6))   // 36 — computed`,
    },

    {
      type: 'narration',
      id: 'step6-meeting',
      text: 'This is where the two ideas meet — at the deepest level. Memoization is not a technique separate from the Proxy pattern. Memoization IS the Proxy pattern applied to functions. The cache is a hash table. The proxy intercepts the function call, checks the hash table, and either returns the cached result (O(1) hash lookup) or calls through to the real function and stores the result. The cache (hash table) is what makes the proxy fast. The proxy (interception layer) is what makes the cache transparent to the caller. Hash table + Proxy = memoization. Three ideas, one mechanism.',
      code: null,
    },

    {
      type: 'challenge',
      id: 'ch-proxy',
      text: 'Build a CountingProxy that wraps any function and counts how many times it is called and how many of those were cache hits. It has the same calling interface as the wrapped function. After some calls, log proxy.stats which returns { calls: number, hits: number, misses: number }. Test with a function (n) => n * 3. Call it with 1, 1, 2, 2, 3. Expected: calls=5, hits=2, misses=3.',
      expectedOutput: null,
      startCode: `function countingProxy(fn) {
  const cache = new Map()
  let calls = 0, hits = 0

  function proxy(...args) {
    calls++
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      hits++
      return cache.get(key)
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }

  proxy.stats = {
    get calls()  { return calls },
    get hits()   { return hits },
    get misses() { return calls - hits },
  }

  return proxy
}

const triple = countingProxy(n => n * 3)
triple(1); triple(1); triple(2); triple(2); triple(3)

console.log(triple.stats.calls)   // 5
console.log(triple.stats.hits)    // 2
console.log(triple.stats.misses)  // 3`,
      hint: 'The scaffold is complete — run it and verify the counts are correct.',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim(), 10))
        return nums[0] === 5 && nums[1] === 2 && nums[2] === 3
      },
    },

    { type: 'checkpoint', id: 'cp-proxy' },

    {
      type: 'narration',
      id: 'step7-combined',
      text: 'Build a full API caching layer: an ApiCache class that wraps any async-like data fetcher, caches results with TTL, logs hits and misses, and exposes cache statistics. This is what Redis, Varnish, and CDN edge caches do — a proxy layer with TTL memoization in front of a slow data source.',
      code: `class ApiCache {
  constructor(fetcher, ttlMs = 10000) {
    this.fetcher = fetcher
    this.ttlMs   = ttlMs
    this.cache   = new Map()
    this.hits    = 0
    this.misses  = 0
  }

  fetch(key) {
    const now   = Date.now()
    const entry = this.cache.get(key)
    if (entry && entry.expiresAt > now) {
      this.hits++
      return entry.value
    }
    this.misses++
    const value = this.fetcher(key)
    this.cache.set(key, { value, expiresAt: now + this.ttlMs })
    return value
  }

  stats() {
    const total = this.hits + this.misses
    return { hits: this.hits, misses: this.misses, hitRate: total ? (this.hits/total).toFixed(2) : '0.00' }
  }
}

function slowDatabase(key) {
  return { key, data: 'result for ' + key }
}

const cache = new ApiCache(slowDatabase, 5000)

cache.fetch('user:1')
cache.fetch('user:1')   // hit
cache.fetch('user:2')
cache.fetch('user:1')   // hit

console.log(cache.stats())   // { hits: 2, misses: 2, hitRate: '0.50' }`,
    },

    {
      type: 'challenge',
      id: 'ch-together',
      text: 'Add an invalidate(key) method to the ApiCache class below. invalidate(key) removes the cache entry for that key so the next fetch will be a miss. After the invalidation, fetch the same key again — it should be a miss. Test: fetch "item:1" (miss), fetch "item:1" again (hit), invalidate "item:1", fetch "item:1" again (miss). Log stats — expected: hits=1, misses=2.',
      expectedOutput: null,
      startCode: `class ApiCache {
  constructor(fetcher, ttlMs=10000) {
    this.fetcher=fetcher; this.ttlMs=ttlMs; this.cache=new Map(); this.hits=0; this.misses=0
  }
  fetch(key) {
    const e=this.cache.get(key)
    if(e && e.exp>Date.now()){this.hits++;return e.val}
    this.misses++
    const val=this.fetcher(key)
    this.cache.set(key,{val,exp:Date.now()+this.ttlMs})
    return val
  }
  invalidate(key) {
    // remove the cache entry for key
  }
  stats() { return {hits:this.hits,misses:this.misses} }
}

const cache = new ApiCache(k => 'data:'+k)

cache.fetch('item:1')          // miss
cache.fetch('item:1')          // hit
cache.invalidate('item:1')
cache.fetch('item:1')          // miss after invalidation

const s = cache.stats()
console.log(s.hits)    // 1
console.log(s.misses)  // 2`,
      hint: 'this.cache.delete(key)',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim(), 10))
        return nums[0] === 1 && nums[1] === 2
      },
    },

    { type: 'checkpoint', id: 'cp-together' },

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens. Step through the memoize wrapper. On the first call, watch the Map start empty, cache.has(key) is false, the real fn is called, and the result is stored in the Map. On the second identical call, watch cache.has(key) return true and the function short-circuit immediately — fn is never called. The Variables panel shows the Map growing with each unique argument and staying constant on repeated calls.',
      code: `function memoize(fn) {
  const cache = new Map()
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

let computations = 0
const slow = n => { computations++; return n * n }
const fast = memoize(slow)

console.log(fast(5), 'computations:', computations)  // 25, 1
console.log(fast(5), 'computations:', computations)  // 25, 1 (no new computation)
console.log(fast(6), 'computations:', computations)  // 36, 2`,
    },

    {
      type: 'codelens',
      id: 'cl-memo-proxy',
      text: `Step to: if (cache.has(key)) for fast(5) — first call.
Variables: cache is empty. has() returns false — miss.

Step to: cache.set(key, result)
Variables: cache now has one entry: { '[5]' → 25 }.

Step to: if (cache.has(key)) for fast(5) — second call (same args).
Variables: cache has '[5]'. has() returns true — hit. The next line (fn(...args)) is skipped entirely.

Step to: fast(6)
Variables: '[6]' is not in cache. fn is called. computations becomes 2. Cache now has two entries.`,
      code: `function memoize(fn){const cache=new Map();return function(...args){const key=JSON.stringify(args);if(cache.has(key))return cache.get(key);const r=fn(...args);cache.set(key,r);return r}}
let c=0
const slow=n=>{c++;return n*n}
const fast=memoize(slow)
console.log(fast(5),'c:',c)
console.log(fast(5),'c:',c)
console.log(fast(6),'c:',c)`,
      lang: 'js',
    },

  ],
}
