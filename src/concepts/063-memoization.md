---
concept: 063-memoization
name: Memoization
---

## Definition

Memoization is caching a function's return value, keyed by its arguments, so a
repeated call with the **same** arguments returns the stored result instead of
recomputing it.

## Problem

A naive recursive solution can call itself with the exact same arguments many
times over — computing `fib(3)` the same way whether it's reached through
`fib(5) → fib(4) → fib(3)` or through `fib(5) → fib(3)` directly. Each repeat
redoes identical work, and the redundancy compounds with depth. Memoization
remembers each unique call's answer the first time it's computed, so every
later call with those same arguments is a lookup instead of a recomputation.

## Execution

Call fib(5) with an empty cache
↓
5 not cached → need fib(4) + fib(3)
↓
Call fib(4) — not cached → need fib(3) + fib(2)
↓
Call fib(3) — not cached → need fib(2) + fib(1)
↓
Call fib(2) — not cached → need fib(1) + fib(0)
↓
Call fib(1) — base case → return 1, cache[1] = 1
↓
Call fib(0) — base case → return 0, cache[0] = 0
↓
fib(2) = 1 + 0 = 1 → cache[2] = 1, returns
↓
fib(3) needs fib(1) next — **cache[1] exists → cache hit, return 1 immediately, no recursion**
↓
fib(3) = 1 + 1 = 2 → cache[3] = 2, returns
↓
fib(4) needs fib(2) next — **cache[2] exists → cache hit, return 1 immediately, no recursion**
↓
fib(4) = 2 + 1 = 3 → cache[4] = 3, returns
↓
fib(5) needs fib(3) next — **cache[3] exists → cache hit, return 2 immediately, no recursion**
↓
fib(5) = 3 + 2 = 5 → cache[5] = 5, returns

Three of the nine calls in this trace (`fib(1)`, `fib(2)`, `fib(3)` on their
second visit) are cache hits — without the cache, each would have triggered a
full recursive re-expansion.

## Computer Science

Recursion plus a cache is exactly what "top-down dynamic programming" means —
it's valid whenever a problem has **overlapping subproblems** (see that
concept) and **optimal substructure** (see that concept); without overlapping
subproblems, a cache never gets a hit and buys nothing.

Tags: Dynamic programming, Overlapping subproblems, Recursion, Hash maps, Time-space tradeoff

## Software Engineering

Memoization shows up well outside "DP problems" too — React's `useMemo`,
Python's `functools.lru_cache`, and request-level caching are all the same
idea. The real risk is memoizing something that isn't actually a pure function
of its arguments: if the function depends on mutable outside state or has side
effects, the cache can silently return a stale or wrong result. An unbounded
cache is also a real memory-growth risk for long-running processes.

Tags: Caching, Pure functions, Cache invalidation, Space complexity

## Common Mistakes

- Memoizing a function with side effects or a dependency on mutable outside state — the cache returns a stale result once that outside state changes.
- Keying the cache on the wrong or partial arguments, so two genuinely different calls collide and return each other's cached answer.
- Placing the cache-check *after* the recursive calls instead of before them — this doesn't prevent the redundant work at all, since the redundant calls have already happened by the time the cache is checked.
- Assuming memoization changes *what* a function returns — it only changes *how often* the same computation is repeated. A correct un-memoized function and its memoized version must return identical results.

## Exercises

- Add a counter that increments on every non-cached computation; compare how many times `fib(3)` actually computes with and without the cache while computing `fib(6)`.
- Try memoizing with a plain array instead of an object/dict; predict what constraint that puts on valid arguments (only small non-negative integers).
- Remove the cache-check line and predict what changes — output correctness, or just speed?

## javascript

```javascript
function fib(n, cache = {}) {
  if (n in cache) {
    console.log(`cache hit for fib(${n})`)
    return cache[n]
  }
  if (n <= 1) {
    cache[n] = n
    return n
  }
  console.log(`computing fib(${n})`)
  cache[n] = fib(n - 1, cache) + fib(n - 2, cache)
  return cache[n]
}

console.log(fib(5))   // 5
```
Walkthrough: the first call to `fib(5)` cascades down through `fib(4)`, `fib(3)`,
and `fib(2)` — each logging "computing" since none are cached yet. `fib(2)`'s
own base-case calls (`fib(1)`, `fib(0)`) return silently (the base case has
nothing to log). On the way back up, `fib(3)`'s second call is `fib(1)`,
`fib(4)`'s second call is `fib(2)`, and `fib(5)`'s second call is `fib(3)` —
each of these three logs "cache hit" instead of re-expanding, matching the
Execution trace above exactly.

## python

```python
def fib(n, cache=None):
    if cache is None:
        cache = {}
    if n in cache:
        print(f"cache hit for fib({n})")
        return cache[n]
    if n <= 1:
        cache[n] = n
        return n
    print(f"computing fib({n})")
    cache[n] = fib(n - 1, cache) + fib(n - 2, cache)
    return cache[n]

print(fib(5))   # 5
```
Walkthrough: identical cache-hit sequence to the JavaScript version. Python's
standard library also offers this as a decorator, `functools.lru_cache`, which
does the same cache-check-then-store mechanics automatically — but writing it
out manually (as above) is what makes the cache-check-before-recursing order
visible, which is the detail most worth understanding first.
