---
series: performance-engineering
level: 1
title: Caching — The Fastest Operation Is No Operation
lang: javascript
---

# Caching — The Fastest Operation Is No Operation

The fastest way to perform an operation is to not perform it at all. Caching stores the result of an expensive operation and returns the stored result on subsequent requests. When caching is applied correctly, a database query that takes 50ms becomes a memory lookup that takes microseconds.

Caching is one of the highest-leverage performance techniques, but it introduces complexity: stale data, cache invalidation, memory limits, and cold starts. The art of caching is knowing what to cache, for how long, at which layer, and when to invalidate. By the end of this lesson you will be able to implement in-memory caching, TTL-based expiry, LRU eviction, and know when caching is the right tool.

## Why caching works: the memory hierarchy

```text
MEMORY HIERARCHY (latency to access):
  CPU registers:        ~0.3 ns
  L1 cache:             ~1 ns
  L2 cache:             ~5 ns
  L3 cache:             ~20 ns
  RAM:                  ~100 ns
  SSD:                  ~100,000 ns  (0.1ms)
  HDD:                  ~10,000,000 ns (10ms)
  Network (same city):  ~1,000,000 ns  (1ms)
  Database query:       ~5,000,000 ns to ~100,000,000 ns (5ms–100ms)

CACHING PRINCIPLE:
  Move data from slow storage to fast storage when it is likely to be needed again.
  Trade space (in fast storage) for time (avoiding slow storage).
  
  If a database query takes 50ms and is called 1,000 times/second,
  and the result is valid for 60 seconds:
    WITHOUT CACHE: 50ms × 1,000 calls/s = 50,000ms of database wait per second
    WITH CACHE:    50ms × 1 call per 60s = ~0.8ms of database wait per second
    SPEEDUP:       ~60,000×
```

## Implementing a simple in-memory cache

```javascript
function createCache(options = {}) {
  const { ttlMs = 60_000, maxSize = 1000 } = options
  const store = new Map()   // key → { value, expiresAt }

  function get(key) {
    const entry = store.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      store.delete(key)
      return undefined   // expired
    }
    return entry.value
  }

  function set(key, value, ttl = ttlMs) {
    if (store.size >= maxSize) {
      // Simple eviction: delete the oldest entry (first in insertion order)
      const firstKey = store.keys().next().value
      store.delete(firstKey)
    }
    store.set(key, { value, expiresAt: Date.now() + ttl })
  }

  function del(key) {
    store.delete(key)
  }

  function clear() {
    store.clear()
  }

  function size() {
    return store.size
  }

  return { get, set, del, clear, size }
}
```

## The cache-aside pattern

The most common caching pattern: check the cache first; if miss, load from the source and populate the cache.

```javascript
const userCache = createCache({ ttlMs: 5 * 60 * 1000 })   // 5 minute TTL

async function getUser(id) {
  // 1. Check cache
  const cached = userCache.get(`user:${id}`)
  if (cached !== undefined) {
    return cached   // cache HIT: return immediately
  }

  // 2. Cache MISS: load from database
  const user = await db.users.findById(id)

  // 3. Populate cache for next time
  userCache.set(`user:${id}`, user)

  return user
}

// Cache invalidation: when data changes, delete the cache entry
async function updateUser(id, changes) {
  const user = await db.users.update(id, changes)
  userCache.del(`user:${id}`)   // invalidate so next read gets fresh data
  return user
}
```

```text
CACHE-ASIDE vs WRITE-THROUGH:
  Cache-aside (lazy population):
    → Cache is populated on first miss
    → First read after startup is slow (cold cache)
    → Easy to implement
    → Data in cache is at most TTL seconds stale

  Write-through (eager population):
    → Cache is populated when data is written
    → Every read is fast (no cold start)
    → More complex: writes must update both cache AND database
    → No staleness: cache is always up to date

  Write-behind (async):
    → Writes go to cache first, database later (in the background)
    → Fastest writes
    → Risk: data loss if cache crashes before database is updated
    → Only for non-critical data
```

**CS lens:** The cache-aside pattern is an implementation of **memoisation** at the service layer. In functional programming, memoisation stores the result of a pure function call keyed by its inputs. In the service layer, the "function" is a database query and the "input" is the query key (user ID, query string). The TTL adds the concept of **temporal validity** — the cached value is valid for a finite time, after which the system pretends it was never computed. This models the idea that data can change and caches become stale.

## LRU cache: eviction based on recency

The Least Recently Used (LRU) cache evicts the least recently accessed item when full. This is better than evicting the oldest insert (FIFO) because recently-used items are more likely to be needed again.

```javascript
class LRUCache {
  #capacity
  #cache    // Map preserves insertion order; we move accessed items to end
            // → end = most recently used; beginning = least recently used

  constructor(capacity) {
    this.#capacity = capacity
    this.#cache = new Map()
  }

  get(key) {
    if (!this.#cache.has(key)) return undefined
    // Move to end (mark as recently used):
    const value = this.#cache.get(key)
    this.#cache.delete(key)
    this.#cache.set(key, value)
    return value
  }

  set(key, value) {
    if (this.#cache.has(key)) {
      this.#cache.delete(key)     // will re-insert at end
    } else if (this.#cache.size >= this.#capacity) {
      // Evict least recently used (first entry in Map)
      const lruKey = this.#cache.keys().next().value
      this.#cache.delete(lruKey)
    }
    this.#cache.set(key, value)
  }

  get size() { return this.#cache.size }
}
```

```text
LRU CACHE: HOW IT WORKS
  Capacity: 3 items
  Sequence: get A, get B, get C, get A, get D

  After [A, B, C]:  cache = [A, B, C]   (all fit)
  get A:            cache = [B, C, A]   (A moved to end — recently used)
  get D (evict LRU): B is least recently used → cache = [C, A, D]

WHY LRU IS BETTER THAN FIFO:
  In practice, recently used items are more likely to be used again
  ("temporal locality of reference").
  LRU exploits this by keeping recently used items and evicting old ones.
  Real-world hit rate improvement over FIFO: often 10–50% better.
```

## Caching layers in a real system

```text
THE CACHING HIERARCHY:

  CLIENT (browser):
    → HTTP cache (Cache-Control headers): resources cached in the browser
    → Service Worker cache: explicit control over cached requests/responses
    → In-memory (JS variables): values computed once, reused in the session

  CDN (Content Delivery Network):
    → Caches static assets (images, JS, CSS) and API responses
    → Serves from a location near the user (< 50ms vs 200ms for distant servers)
    → Cache-Control: public, max-age=86400 → cache for 1 day in the CDN

  APPLICATION SERVER:
    → In-memory cache (LRU, TTL-based): cache computed values, DB results
    → Shared cache (Redis): cache shared across multiple server instances
      (in-process cache is per-instance — 3 servers = 3 separate caches)

  DATABASE:
    → Query result cache: DB engine caches results of frequent queries
    → Buffer pool: DB caches disk pages in RAM
    → Indexes: pre-computed lookup structures (a form of caching)
```

**SE lens:** The correct caching layer depends on the access pattern. Static assets (images, JS) belong in the CDN — close to users, long TTL, no server involvement after first request. User-specific data belongs in the application server cache (keyed by user ID), with short TTL. Shared computed results (daily report, global config) belong in Redis — all server instances see the same cached value. Choosing the wrong layer causes either cache misses (data is cached too far away) or stale data problems (data cached too far from the source).

**Common mistakes:**
- No cache invalidation strategy — caching without a plan for when to expire or delete entries leads to permanently stale data. Define TTL upfront; invalidate on write.
- Caching mutable shared state — caching data that changes frequently makes the cache more harmful than helpful (stale reads) and adds complexity (invalidation on every write). Only cache data that changes infrequently relative to how often it is read.
- Over-caching — caching data that is cheap to compute, unique per request, or changes on every write. Cache only data that is expensive to produce AND is requested more often than it changes.

**Debug tip:** Cache hit rate is the key metric for cache effectiveness: `hit rate = cache hits / (cache hits + cache misses)`. A cache with 50% hit rate is barely helpful — half the time it's a miss anyway. A cache with 95%+ hit rate is very effective. Measure hit rate before claiming the cache is working. Also measure memory usage: a cache that consumes 8 GB is not free — that memory is not available for the application's actual data.

## Challenge: memoise

Implement a memoisation function with TTL support.

```challenge
function memoize(fn, options = {}) {
  // fn: any function (sync or async) to memoize
  // options.ttlMs: time in milliseconds before a cached result expires (default: Infinity)
  // options.keyFn: function that takes the args and returns a cache key string
  //                (default: JSON.stringify of the first argument)
  //
  // Returns a new function with the same signature as fn.
  // On each call: check if a valid (non-expired) cached result exists.
  //   If yes: return the cached result.
  //   If no: call fn, cache the result, return it.
  //
  // The returned function also has:
  //   .cache: the internal Map of key → { value, expiresAt }
  //   .invalidate(key): removes the cache entry for the given key
  //   .clear(): clears all cache entries
}
```

```test
// Sync function
let callCount = 0
const expensiveFn = (n) => { callCount++; return n * n }
const memoised = memoize(expensiveFn)

assert memoised(4) === 16
assert memoised(4) === 16   // cached
assert callCount === 1      // only called once

assert memoised(5) === 25
assert callCount === 2

// Async function
let asyncCalls = 0
const asyncFn = async (id) => { asyncCalls++; return { id, name: 'item' + id } }
const memoAsync = memoize(asyncFn)

const r1 = await memoAsync('a')
const r2 = await memoAsync('a')
assert r1.name === 'itema'
assert asyncCalls === 1   // only fetched once

// TTL expiry
const shortCache = memoize((x) => x * 2, { ttlMs: 50 })
assert shortCache(7) === 14
await new Promise(r => setTimeout(r, 100))   // wait for TTL to expire
shortCache(7)   // should recompute (TTL expired)
assert shortCache.cache.get('7').value === 14   // re-cached with fresh value

// invalidate
memoised.invalidate('4')
callCount = 0
memoised(4)
assert callCount === 1   // recomputed after invalidation
```
