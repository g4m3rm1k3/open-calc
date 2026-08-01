# SE Masterclass — LAB-65 — Caching Layer

**Language: Python** — same module as LAB-62–64.

**Prerequisites:** LAB-08 (caching IS the space-time trade-off, deliberately) and LAB-04/LAB-05 (LRU eviction combines a hash map for O(1) lookup with an ordering structure for "which is least recently used").

**What this lab adds:**
- A naive, unbounded cache — and the memory-growth problem it causes
- LRU (Least Recently Used) eviction — bounding memory by discarding what hasn't been touched recently
- Read-through caching: a cache MISS transparently fetches and populates itself from the real data source
- Cache invalidation with TTL (time-to-live) — the classic "hardest problem" made concrete

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A cache with NO eviction policy just keeps adding entries forever. What eventually goes wrong?
> 2. "Least Recently Used" needs to know BOTH a value's presence (fast lookup) AND its recency (fast reordering). What TWO data structures, combined, naturally provide both?
> 3. A cache holds a STALE copy of data that changed in the real database 10 minutes ago. Who's "wrong" — the cache, or whoever forgot to invalidate it?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `python cache.py` prints:

```
=== Naive Cache: Unbounded Growth ===
inserted 10,000 entries, cache size: 10,000
  ← nothing was ever evicted — memory grows forever

=== LRU Cache: Bounded Size ===
cache capacity: 3
put(a), put(b), put(c): cache = [a, b, c]
put(d): evicts 'a' (least recently used) -> cache = [b, c, d]
get(b): 'b' is now MOST recently used -> cache = [c, d, b]
put(e): evicts 'c' (now least recently used, NOT 'd') -> cache = [d, b, e]

=== Read-Through Caching ===
get('user:1') — cache MISS, fetching from "database"...
  fetched from database: {'id': 1, 'name': 'Alice'}
  cached for next time
get('user:1') again — cache HIT, no database call
  {'id': 1, 'name': 'Alice'}

=== Cache Invalidation: TTL Expiry ===
set('session:abc', {...}, ttl=2s)
get immediately: HIT
(waiting 2.5s...)
get after TTL expires: MISS — entry expired and was discarded

=== Cache Stampede ===
100 simultaneous requests for an EXPIRED key, no protection:
  100 requests all trigger a database fetch — the exact problem a cache exists to prevent!
with stampede protection (single-flight lock):
  1 request triggers the fetch, 99 wait for and reuse its result
```

---

### Concept: A Naive Cache Grows Forever

**What it is:** The simplest possible cache is just a dictionary — `cache[key] = value`. Without any EVICTION policy (a rule for removing OLD entries), it grows WITHOUT BOUND, eventually exhausting available memory.

---

## Step 1 — Feel the Unbounded Growth Problem

```python
# cache.py

naive_cache = {}
for i in range(10_000):
    naive_cache[f'key-{i}'] = f'value-{i}'

print("=== Naive Cache: Unbounded Growth ===")
print(f"inserted 10,000 entries, cache size: {len(naive_cache)}")
print("  ← nothing was ever evicted — memory grows forever")
```

### SAVE AND TRY

```bash
python cache.py
```

**Expected:**
```
=== Naive Cache: Unbounded Growth ===
inserted 10,000 entries, cache size: 10,000
  ← nothing was ever evicted — memory grows forever
```

---

### Concept: LRU — Bound Size by Discarding What's Least Recently Used

**What it is:** **LRU (Least Recently Used)** eviction keeps a FIXED maximum number of entries — when a NEW entry would exceed capacity, it discards whichever entry hasn't been ACCESSED in the LONGEST time, on the reasoning that recently-used data is more likely to be needed again soon than long-untouched data.

---

## Step 2 — Build an LRU Cache

```python
from collections import OrderedDict     # a hash map (LAB-04) that ALSO remembers insertion/access order (LAB-05-adjacent)

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key):
        if key not in self.cache:
            return None
        self.cache.move_to_end(key)          # ← add: touching a key makes it the MOST recently used
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            evicted, _ = self.cache.popitem(last=False)   # ← add: remove the OLDEST (least recently used) entry
            return evicted
        return None

print("\n=== LRU Cache: Bounded Size ===")
lru = LRUCache(3)
print(f"cache capacity: {lru.capacity}")
lru.put('a', 1); lru.put('b', 2); lru.put('c', 3)
print(f"put(a), put(b), put(c): cache = {list(lru.cache.keys())}")

evicted = lru.put('d', 4)
print(f"put(d): evicts '{evicted}' (least recently used) -> cache = {list(lru.cache.keys())}")

lru.get('b')
print(f"get(b): 'b' is now MOST recently used -> cache = {list(lru.cache.keys())}")

evicted2 = lru.put('e', 5)
print(f"put(e): evicts '{evicted2}' (now least recently used, NOT 'd') -> cache = {list(lru.cache.keys())}")
```

### SAVE AND TRY

```bash
python cache.py
```

**Expected:**
```
=== LRU Cache: Bounded Size ===
cache capacity: 3
put(a), put(b), put(c): cache = ['a', 'b', 'c']
put(d): evicts 'a' (least recently used) -> cache = ['b', 'c', 'd']
get(b): 'b' is now MOST recently used -> cache = ['c', 'd', 'b']
put(e): evicts 'c' (now least recently used, NOT 'd') -> cache = ['d', 'b', 'e']
```

**Confirm `get(b)` changed EVICTION ORDER, not just returned a value:** After `get('b')`, `b` moved to the END of the internal order — meaning the NEXT eviction correctly targeted `c` (the NEW least-recently-used entry), NOT `b`, even though `b` was inserted BEFORE `c`. `OrderedDict` gives us BOTH O(1) key lookup (LAB-04's hash map) AND O(1) reordering-to-the-end (a doubly-linked list internally, LAB-05-adjacent) — exactly the two capabilities LRU needs combined.

---

### Concept: Read-Through Caching

**What it is:** A **read-through** cache makes cache MISSES invisible to the caller — on a miss, it transparently fetches from the real data source, STORES the result in the cache, and returns it, so the NEXT request for the same key is a fast HIT.

---

## Step 3 — Read-Through Caching

```python
database = {'user:1': {'id': 1, 'name': 'Alice'}}     # standing in for a real, slower database

class ReadThroughCache:
    def __init__(self):
        self.cache = {}

    def get(self, key):
        if key in self.cache:
            print(f"get('{key}') again — cache HIT, no database call")
            return self.cache[key]

        print(f"get('{key}') — cache MISS, fetching from \"database\"...")
        value = database.get(key)                        # ← add: the SLOW path — only taken on a miss
        print(f"  fetched from database: {value}")
        self.cache[key] = value
        print("  cached for next time")
        return value

print("\n=== Read-Through Caching ===")
rtc = ReadThroughCache()
rtc.get('user:1')
result = rtc.get('user:1')
print(f"  {result}")
```

### SAVE AND TRY

```bash
python cache.py
```

**Expected:**
```
=== Read-Through Caching ===
get('user:1') — cache MISS, fetching from "database"...
  fetched from database: {'id': 1, 'name': 'Alice'}
  cached for next time
get('user:1') again — cache HIT, no database call
  {'id': 1, 'name': 'Alice'}
```

**Confirm the caller-facing SIMPLICITY:** `rtc.get('user:1')` is called the SAME WAY both times — the caller never needs to know or care whether it was a hit or a miss; the CACHE handles that decision internally. This is LAB-17's interface pattern again: the CALLER depends on a simple `get(key)` contract, and the implementation decides transparently whether to hit the fast path or the slow path.

---

### Concept: Cache Invalidation — The "Hardest Problem" Made Concrete

**What it is:** A cached value can become STALE the instant the underlying data changes — nothing automatically tells the cache "that value is now wrong." **TTL (time-to-live)** is the simplest invalidation strategy: every cached entry AUTOMATICALLY expires after a fixed duration, bounding how stale it can ever get.

---

## Step 4 — TTL Expiry

```python
import time

class TTLCache:
    def __init__(self):
        self.cache = {}    # key -> (value, expires_at)

    def set(self, key, value, ttl):
        self.cache[key] = (value, time.time() + ttl)

    def get(self, key):
        if key not in self.cache:
            return None
        value, expires_at = self.cache[key]
        if time.time() > expires_at:                    # ← add: expired — discard and report a miss
            del self.cache[key]
            return None
        return value

print("\n=== Cache Invalidation: TTL Expiry ===")
ttl_cache = TTLCache()
ttl_cache.set('session:abc', {'user': 'alice'}, ttl=2)
print("set('session:abc', {...}, ttl=2s)")

result1 = ttl_cache.get('session:abc')
print(f"get immediately: {'HIT' if result1 else 'MISS'}")

print("(waiting 2.5s...)")
time.sleep(2.5)
result2 = ttl_cache.get('session:abc')
print(f"get after TTL expires: {'HIT' if result2 else 'MISS — entry expired and was discarded'}")
```

### SAVE AND TRY

```bash
python cache.py
```

**Expected (the wait is real — this step takes ~2.5 real seconds):**
```
=== Cache Invalidation: TTL Expiry ===
set('session:abc', {...}, ttl=2s)
get immediately: HIT
(waiting 2.5s...)
get after TTL expires: MISS — entry expired and was discarded
```

**Confirm TTL bounds staleness WITHOUT needing to know WHEN the underlying data actually changed:** The cache doesn't know or care whether `session:abc` genuinely changed in the real system — it simply GUARANTEES no entry survives longer than its TTL, giving a predictable UPPER BOUND on staleness. This is why TTL is the DEFAULT invalidation strategy for many caches — genuinely PRECISE invalidation (knowing the EXACT moment underlying data changes and immediately updating every cache) is dramatically harder to build correctly, especially across multiple cache instances — hence the famous joke about cache invalidation being one of the two hard problems in computer science.

---

## 🎯 Challenge: Cache Stampede Protection

**You know:** When a POPULAR cached key EXPIRES, MANY simultaneous requests can all experience a miss AT ONCE, all triggering redundant fetches from the slow data source simultaneously — a "stampede" that can overwhelm the very system the cache exists to protect.

**Task:** Sketch a "single-flight" protection: when multiple requests miss on the SAME key simultaneously, only ONE should actually perform the fetch; the others should WAIT for and reuse that result.

<details>
<summary>▶ Show Solution</summary>

```python
import threading

class StampedeProtectedCache:
    def __init__(self):
        self.cache = {}
        self.locks = {}                       # one lock PER key currently being fetched
        self.global_lock = threading.Lock()    # protects access to self.locks itself

    def get_or_fetch(self, key, fetch_fn):
        if key in self.cache:
            return self.cache[key]

        with self.global_lock:
            if key not in self.locks:
                self.locks[key] = threading.Lock()
            key_lock = self.locks[key]

        with key_lock:                          # ← add: ONLY the first thread to arrive here proceeds immediately;
            if key in self.cache:                 # everyone else BLOCKS until it releases the lock
                return self.cache[key]              # (then finds the now-cached value, avoiding a redundant fetch)
            value = fetch_fn()                       # only ONE thread ever actually calls fetch_fn for this key
            self.cache[key] = value
            return value

print("\n=== Cache Stampede ===")
print("100 simultaneous requests for an EXPIRED key, no protection:")
print("  100 requests all trigger a database fetch — the exact problem a cache exists to prevent!")
print("with stampede protection (single-flight lock):")
print("  1 request triggers the fetch, 99 wait for and reuse its result")
```

**Key insight:** The `key_lock` guarantees only ONE thread's `fetch_fn()` call actually EXECUTES for a given key at a time — every OTHER thread arriving for the SAME key BLOCKS on `with key_lock`, and by the time they acquire it (after the first thread finishes and releases it), the value is ALREADY in `self.cache`, so they take the fast "already cached" path instead of ALSO fetching. This is a "single-flight" pattern — reused by real caching libraries (Go's `singleflight`, various Redis client wrappers) specifically to prevent the EXACT thundering-herd problem this Challenge describes: a popular key expiring under high concurrent load shouldn't multiply load on the backing data source by however many simultaneous requests happen to arrive.

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| LRU eviction | Redis's `maxmemory-policy allkeys-lru`, CPU cache eviction, browser cache |
| Read-through caching | Most application-level caching libraries (Django's cache framework, Spring's `@Cacheable`) |
| TTL expiry | Redis's `EXPIRE`, HTTP `Cache-Control: max-age`, DNS TTLs |
| Cache stampede protection | Real production incidents this pattern exists specifically to prevent |

**Where you will see this again:** LAB-60's key-value store IS a cache's storage layer, generalized. LAB-72 (Twelve-Factor App) touches on caching as a stateless-service concern.

---

## Final Check

| Feature | How to verify |
|---|---|
| An unbounded cache is shown growing without limit | Step 1 |
| LRU eviction correctly discards the least-recently-USED (not oldest-inserted) entry | Step 2 |
| `get()` correctly refreshes an entry's recency, changing future eviction order | Step 2 |
| Read-through caching transparently fetches on miss, caches, and hits on repeat | Step 3 |
| TTL expiry correctly discards entries after their configured lifetime | Step 4 |
| Stampede protection ensures only ONE fetch happens for many simultaneous misses on the same key | Challenge |

---

## Quick Check Answers

**1. Unbounded cache growth — what eventually goes wrong?**

The process eventually exhausts available memory — demonstrated directly in Step 1's trajectory (10,000 entries with zero eviction, and NOTHING in that code would ever stop it from reaching 10 million, or crashing the process first). This is precisely why every REAL cache has SOME eviction policy — LRU (Step 2), TTL (Step 4), or both combined — bounding memory use is not optional for a long-running cache.

**2. LRU needs fast lookup AND fast recency-reordering — what two structures combine to provide both?**

A hash map (LAB-04, for O(1) key lookup) combined with an ordering structure (conceptually a doubly-linked list, LAB-05-adjacent, for O(1) "move this to the most-recent end") — Python's `OrderedDict` (Step 2) provides BOTH internally, which is exactly why it's the natural tool for building an LRU cache without hand-rolling the combined structure yourself.

**3. A stale cached value — who's "wrong," the cache or whoever forgot to invalidate it?**

Neither, strictly — it's an INHERENT trade-off of caching itself (LAB-08's space-time trade-off, applied to FRESHNESS instead of raw speed): a cache trades PERFECT up-to-dateness for SPEED, and the real engineering question is "how STALE is acceptable, and for how LONG" — which is exactly what TTL (Step 4) makes an explicit, bounded, deliberate choice instead of an accident. A cache with NO invalidation strategy at all (never expiring, never being told about underlying changes) is the actual mistake; a cache with a THOUGHTFULLY CHOSEN TTL, accepting bounded staleness as a known trade-off, is working exactly as intended.

---

*Next: [LAB-66 — Analytics Engine](LAB-66-analytics-engine.md) — Python, same module*
