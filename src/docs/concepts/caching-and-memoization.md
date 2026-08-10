# Concept: Caching and Memoization

**What you'll understand by the end:** how to avoid repeating expensive work by remembering a previous result, and the real correctness risk that comes with it.

**Prerequisites:** `pure-functions-testability.md`.

## Setup

Any language works; the isolated example uses Python, no install needed.

## The Problem

Some computations or lookups are genuinely expensive relative to how often their result actually changes — a slow calculation, a network call, a disk read — and recomputing the identical result from scratch every single time it's needed wastes real time and resources for no benefit, if nothing that would change the answer has actually changed since the last time it was computed.

## The Isolated Example

```python
import time

call_count = 0

def slow_square(n):
    global call_count
    call_count += 1
    time.sleep(0.5)  # stands in for real, expensive work
    return n * n

def memoized_square():
    cache = {}
    def wrapper(n):
        if n not in cache:
            cache[n] = slow_square(n)
        return cache[n]
    return wrapper

cached = memoized_square()

start = time.time()
print(cached(4), cached(4), cached(4))
print(f"took {time.time() - start:.2f}s, real work done {call_count} time(s)")
```

**Real output:**
```
16 16 16
took 0.50s, real work done 1 time(s)
```

**What this proves:** three calls asking for the same input (`4`) produced the correct, identical answer each time, but the genuinely expensive work (`slow_square`, with its real 0.5-second delay) only actually ran once — the second and third calls were served entirely from the cache, confirmed both by the real elapsed time (roughly 0.5s total, not 1.5s) and by `call_count` staying at `1`.

## Mechanical Walkthrough

- A **cache** is a real, stored mapping from "inputs already seen" to "the result computed for them" — checked *before* doing the real work, so a repeated input can be served instantly from what's already known instead of recomputed.
- **Memoization** specifically refers to caching a *function's* return value, keyed by its arguments — exactly what `wrapper` does above, checking `cache` before ever calling the real, slow `slow_square`.
- This only works correctly for a **pure function** (see `pure-functions-testability.md`) — a function whose output depends only on its input, with no other state. Caching the result of a function whose answer can change over time even for the *same* input (today's exchange rate, a value in a database that could be updated by someone else) risks serving a stale, wrong answer with no way for the cache to know the underlying reality already changed.
- A real cache typically needs an **eviction** strategy — some way to eventually remove or refresh entries — since an unbounded cache that never forgets anything will eventually consume unbounded memory; common strategies include a maximum size with "least recently used" eviction, or a time-based expiration.

## CS Lens

Caching is a direct application of the **space-time tradeoff** — trading memory (storing results) for time (not recomputing them) — one of the most fundamental tradeoffs in computer science, appearing at every layer of a real system: a CPU's own hardware cache, a database's query result cache, a CDN caching static files close to users, and a single function's memoized results, as shown here, are all the identical underlying idea applied at wildly different scales.

Also recognized in: dynamic programming (memoization is literally the technique dynamic-programming algorithms use to avoid recomputing overlapping subproblems), HTTP caching headers (`Cache-Control`, `ETag` — a browser or proxy caching a response so it doesn't have to be re-fetched), and a CPU's own multi-level memory hierarchy, which is itself a cascading series of caches trading cost and size for speed.

## SE Lens

The real, honest risk caching introduces — famously summarized as one of the two hard problems in computer science ("cache invalidation and naming things") — is a cache silently serving a wrong, stale answer once the real underlying data has changed but the cache doesn't yet know it. This is exactly why a project might explicitly *choose not* to cache something, even at a real, measurable performance cost, when correctness matters more than speed and the underlying data changes in ways the cache can't reliably detect — a deliberate, honest tradeoff, not an oversight, the same "simplicity and correctness now, named optimization later" pattern that shows up whenever a real system defers caching until it's actually proven necessary.

## Connection

Builds on `pure-functions-testability.md`. Directly relevant anywhere a function repeatedly recomputes or re-fetches the same result on every call rather than reusing a previous one — a real, deliberate design choice worth naming explicitly, in either direction, rather than leaving unstated.

## Try It Yourself

1. Call `cached` with a second, different input (`cached(5)`) and confirm it takes the real 0.5-second delay again — `4` and `5` are cached independently, proof the cache is keyed by the actual argument, not a single, global "already ran once" flag.
2. Add a maximum cache size (evict the oldest entry once a third unique input arrives) and test it with three different inputs, confirming the first one's cached result is discarded and would need to be recomputed if asked for a fourth time.
3. Deliberately break correctness on purpose: cache a function that reads a value which can change between calls (a counter that increments each real call, cached anyway) and observe the cache serving an outdated result — a concrete, hands-on demonstration of exactly the staleness risk this file's SE Lens describes.
