---
concept: 150-caching
name: Caching
---

## Definition

Caching stores the result of an expensive operation (a computation, a
database query, a network request) so a later request for the same thing
can be served instantly from the stored copy, instead of redoing the
expensive work.

## Problem

Repeating the same expensive operation over and over (re-querying a
database for data that hasn't changed, re-computing the same result)
wastes time and resources on work that's already been done. A cache
stores the result once and serves it directly on subsequent requests, at
the cost of needing to know when a cached result is no longer valid (has
gone "stale") and needs to be refreshed.

## Execution

Request 1: get user 42's profile — not in cache — query the database
(slow), store the result in the cache
↓
Request 2 (same user, shortly after): get user 42's profile — found in
cache (fast) — return the cached copy WITHOUT querying the database again
↓
User 42 updates their profile — the CACHED copy is now stale (out of
date)
↓
Cache invalidation: the cache entry for user 42 must be explicitly cleared
or updated, or future requests would keep returning the STALE data
↓
Request 3 (after invalidation): not in cache anymore — query the database
again, get the FRESH data, re-cache it

## Computer Science

Caching is a general application of this exact same "trade memory for
speed by avoiding recomputation" idea (see Memoization) — the added
ingredient at a system level is invalidation, deciding WHEN a cached value
stops being trustworthy, which memoization within a single pure function
computation never has to worry about, since a pure function's inputs
never change underneath it.

Tags: Memoization, Cache invalidation, Staleness, Trading memory for speed

## Software Engineering

"There are only two hard things in computer science: cache invalidation
and naming things" is a famous (only half-joking) observation — deciding
when to invalidate a cache entry is a genuinely tricky design problem: too
aggressive and you lose most of the speed benefit; too conservative and
users see stale data.

Tags: Cache invalidation strategies, TTL, Stale data tradeoffs

## Common Mistakes

- Caching data that changes frequently without any invalidation strategy at all — users see stale data indefinitely, with no mechanism to ever refresh it.
- Caching data that's already fast to compute or fetch — caching adds real complexity (invalidation logic, memory usage), which isn't worth it unless the underlying operation is genuinely expensive enough to matter.

## Exercises

- Trace through what happens in the example above if the cache is NEVER invalidated after user 42 updates their profile — how long would stale data be served?
- Identify one piece of data in an app you've used that would be a good caching candidate (expensive to compute, doesn't change often) versus one that would be a bad candidate (changes constantly).

## javascript

```javascript
// Simulating a cache with explicit invalidation, contrasting a cache HIT,
// a stale read, and invalidation forcing a fresh re-fetch.
class ProfileCache {
  #cache = new Map()
  #dbCalls = 0
  #db = { 42: { name: 'Alice' } }   // the "real" data source

  get(userId) {
    if (this.#cache.has(userId)) return { ...this.#cache.get(userId), fromCache: true }
    this.#dbCalls++
    const data = this.#db[userId]
    this.#cache.set(userId, data)
    return { ...data, fromCache: false }
  }

  updateProfile(userId, newData) {
    this.#db[userId] = newData   // update the real data...
    this.#cache.delete(userId)   // ...and invalidate the now-stale cache entry
  }
}

const cache = new ProfileCache()
console.log(cache.get(42))   // { name: 'Alice', fromCache: false } -- first request, real DB hit
console.log(cache.get(42))   // { name: 'Alice', fromCache: true }  -- second request, served from cache

cache.updateProfile(42, { name: 'Alice Smith' })
console.log(cache.get(42))   // { name: 'Alice Smith', fromCache: false } -- invalidated, so this re-fetches FRESH data
```
Walkthrough: the second `get(42)` call is served `fromCache: true`,
avoiding a repeated database hit. After `updateProfile` explicitly
invalidates that entry, the next `get(42)` call is a real cache miss
again (`fromCache: false`), fetching the newly updated data rather than
returning a stale cached copy.

## python

```python
class ProfileCache:
    def __init__(self):
        self._cache = {}
        self._db_calls = 0
        self._db = {42: {'name': 'Alice'}}   # the "real" data source

    def get(self, user_id):
        if user_id in self._cache:
            return {**self._cache[user_id], 'from_cache': True}
        self._db_calls += 1
        data = self._db[user_id]
        self._cache[user_id] = data
        return {**data, 'from_cache': False}

    def update_profile(self, user_id, new_data):
        self._db[user_id] = new_data       # update the real data...
        self._cache.pop(user_id, None)     # ...and invalidate the now-stale cache entry


cache = ProfileCache()
print(cache.get(42))   # {'name': 'Alice', 'from_cache': False} -- first request, real DB hit
print(cache.get(42))   # {'name': 'Alice', 'from_cache': True}  -- second request, served from cache

cache.update_profile(42, {'name': 'Alice Smith'})
print(cache.get(42))   # {'name': 'Alice Smith', 'from_cache': False} -- invalidated, so this re-fetches FRESH data
```
Walkthrough: identical cache-hit/invalidate/re-fetch mechanics as the
JavaScript version — the cached second read avoids a DB hit, and explicit
invalidation after an update forces a fresh read rather than returning
stale data.
