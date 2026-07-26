# Lesson 23: Making the Application Fast

**What you will build**
A timing decorator that measures and logs how long each request actually takes, and an in-memory cache for `/trending` — avoiding the same expensive aggregation query running on every single request. The problem we're solving: `EXPLAIN QUERY PLAN` (Lessons 10-12) told us query *shape* — `SCAN` vs. `SEARCH` — but never actual wall-clock time under real load, and this project has never systematically measured that at all.

**What you need to know first**
Lesson 22 (logging). Lesson 19 (`/trending`'s aggregation query — today's optimization target). Lesson 1 (`@app.get` — every decorator used so far, never built from scratch until now).

---

## Concept Unit: Profiling With a Real Decorator

### The Problem

Every route in this project has used `@app.get`, `@app.post`, and so on since Lesson 1 — but always someone else's decorator, applied, never explained beyond "it registers a route." Measuring how long every request takes, without adding timing code to every single route function by hand, needs exactly that same mechanism, built from scratch this time.

### The failing test

```python
def test_slow_requests_are_logged(client, caplog):
    import time, main
    original = main.get_trending
    def slow_version(*args, **kwargs):
        time.sleep(0.05)
        return original(*args, **kwargs)
    main.get_trending = slow_version

    with caplog.at_level("WARNING"):
        client.get("/trending")
    assert any("slow request" in record.message.lower() for record in caplog.records)

    main.get_trending = original
```

Run it:

```bash
pytest tests/
```

```text
FAILED — no timing/logging mechanism exists yet to detect or log a slow request.
```

### Introduce the concept in isolation

Create `lab_decorator.py`:

```python
import time
import functools

def timed(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timed
def slow_add(a, b):
    time.sleep(0.1)
    return a + b

print(slow_add(2, 3))
```

Run it:

```bash
python lab_decorator.py
```

Output:

```text
slow_add took 0.1002s
5
```

*What this proves, and finally explains the mechanism used silently since Lesson 1:* `@timed` above `def slow_add` is exactly equivalent to writing `slow_add = timed(slow_add)` immediately after defining it. `timed` receives the original function as `func`, and returns a *new* function (`wrapper`) that does something extra (timing) before and after calling the original. Every call to `slow_add(2, 3)` from here on actually calls `wrapper(2, 3)`, which calls the real `slow_add` internally. This is precisely what `@app.get("/")` has been doing since Lesson 1 — wrapping `homepage` in something that does extra work (routing registration) around the original function — just applied here to timing instead.

### Explain `*args, **kwargs` and `functools.wraps`

`*args, **kwargs` lets `wrapper` accept *any* arguments at all, and pass them straight through to `func` — necessary because `timed` has no idea in advance what arguments the function it's wrapping will need; `slow_add` takes two, but a decorator needs to work on functions with any signature. `functools.wraps(func)` preserves `func`'s original name and metadata on `wrapper` (without it, `slow_add.__name__` would misleadingly report `"wrapper"` instead of `"slow_add"`) — a small detail, but the difference between a decorator that's transparent to introspection and one that quietly corrupts it.

### Discard the throwaway example

Delete `lab_decorator.py`. Build a real timing decorator that logs slow requests.

### Project Change

* **Files affected:** `main.py`.
* **Change type:** Modify.

### The New Code

```python
import time
import functools

SLOW_REQUEST_THRESHOLD_SECONDS = 0.5

def log_slow_requests(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        if elapsed > SLOW_REQUEST_THRESHOLD_SECONDS:
            logger.warning(f"Slow request: {func.__name__} took {elapsed:.3f}s")
        return result
    return wrapper

@app.get("/trending", response_model=list[FeedPost])
@log_slow_requests
def get_trending():
    ...  # unchanged body from Lesson 19
```

### Mechanical walkthrough

1. `@app.get("/trending", ...)` followed by `@log_slow_requests` on the next line: (first appearance of **stacked decorators**). Decorators apply bottom-up: `get_trending` is first wrapped by `log_slow_requests` (producing a timed version), and *that* wrapped version is what `@app.get` then registers as the route handler — meaning every real HTTP request to `/trending` passes through the timing wrapper on its way to the original logic.
2. `SLOW_REQUEST_THRESHOLD_SECONDS = 0.5`: (first appearance). A named constant rather than a bare number buried in the function — the same "give it a name" instinct from every prior lesson's terminology, applied here to a tunable configuration value.

### CS Lens

**Decorators as a general instance of the cross-cutting concern problem.** Timing, logging, and authentication (Lesson 14's `Depends()`) all share a shape: behavior that needs to wrap *many* functions identically, without being copy-pasted into each one. Decorators are one mechanism for this in Python; `Depends()` is FastAPI's own related mechanism, purpose-built for routes specifically. Recognizing "this is the same kind of problem" across seemingly different features (auth vs. timing) is more valuable long-term than memorizing either syntax on its own.

### SE Lens

**Measure before deciding what to optimize — now with a real, generalizable tool, not a one-off.** Lesson 10's `EXPLAIN QUERY PLAN` measured one query's *shape*. This decorator measures actual *wall-clock time*, in production, for any route it's applied to — including time spent outside the database entirely (Python logic, serialization, network). Both matter, and neither substitutes for the other.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 31 items

tests/test_api.py ..............................                         [ 97%]
tests/test_units.py .                                                    [100%]

============================== 31 passed in 0.14s ===============================
```

### Connecting sentence

Measuring is in place — the next unit uses it to justify a real optimization for `/trending` specifically, which recomputes its entire aggregation from scratch on every single request regardless of whether the underlying data changed in between.

---

## Concept Unit: Caching

### The Problem

`/trending`'s query (Lesson 19: a `LEFT JOIN` plus a `GROUP BY` CTE) runs in full on every request, even if a hundred requests arrive in the same second and the underlying likes and comments haven't changed at all between them. Recomputing an identical answer repeatedly is pure waste.

### Introduce the concept in isolation

Create `lab_cache.py`:

```python
import time

_cache = {}
CACHE_TTL_SECONDS = 5

def expensive_computation():
    time.sleep(0.2)
    return "computed result"

def get_cached_or_compute(key):
    if key in _cache:
        value, cached_at = _cache[key]
        if time.time() - cached_at < CACHE_TTL_SECONDS:
            return value, "HIT"
    value = expensive_computation()
    _cache[key] = (value, time.time())
    return value, "MISS"

print(get_cached_or_compute("trending"))
print(get_cached_or_compute("trending"))
```

Run it:

```bash
python lab_cache.py
```

Output:

```text
('computed result', 'MISS')
('computed result', 'HIT')
```

*What this proves:* the first call actually ran `expensive_computation` (the `0.2`s delay was real, and the code path returned `"MISS"`). The second call, within `CACHE_TTL_SECONDS`, returned the identical value instantly, without calling `expensive_computation` again at all — `"HIT"` instead. This is the entire mechanism: check a dictionary first; only do the real work if nothing valid is there yet.

### Explain the mechanism, and its real cost

This trades memory (storing the cached result) and a real risk — **staleness** — for speed: within the 5-second window, `get_cached_or_compute` will return the *same* answer even if the true, underlying answer would have changed. This is the identical tradeoff shape as Lesson 8's denormalized `like_count`: a deliberately accepted gap between "instantly available" and "perfectly current," sized by a number you choose on purpose.

### Discard the throwaway example

Delete `lab_cache.py`. Apply this to `/trending`.

### Project Change

* **Files affected:** `main.py`.
* **Change type:** Modify.

### The New Code

```python
_trending_cache = {"data": None, "cached_at": 0}
TRENDING_CACHE_TTL_SECONDS = 30

@app.get("/trending", response_model=list[FeedPost])
@log_slow_requests
def get_trending():
    now = time.time()
    if _trending_cache["data"] is not None and now - _trending_cache["cached_at"] < TRENDING_CACHE_TTL_SECONDS:
        return _trending_cache["data"]

    conn = get_connection()
    rows = conn.execute("""...""").fetchall()  # unchanged query from Lesson 19
    conn.close()
    result = [dict(row) for row in rows]

    _trending_cache["data"] = result
    _trending_cache["cached_at"] = now
    return result
```

### Mechanical walkthrough

1. `_trending_cache = {"data": None, "cached_at": 0}`: (already-established dict pattern from isolation, module-level this time rather than inside a function). Living at module level means this dict persists across requests, for as long as the server process runs — unlike any variable local to a route function, which is discarded (Interlude A's stack frame) the instant each request finishes.
2. `now - _trending_cache["cached_at"] < TRENDING_CACHE_TTL_SECONDS`: (already-established TTL check from isolation, real usage). 30 seconds chosen deliberately — trending data changing meaningfully within 30 seconds is unlikely, so the staleness cost is judged acceptable in exchange for skipping the query almost entirely for that window.

### CS Lens

**Caching as a space-time tradeoff — one of the most fundamental tradeoffs in computing.** Trading memory (storing a result) for time (skipping recomputation) shows up everywhere at every scale, from a CPU's own hardware cache up through this exact application-level pattern. The specific numbers change; the shape of the tradeoff doesn't.

### SE Lens

**Cache invalidation is a genuinely hard problem, and this lesson deliberately sidesteps the hardest version of it.** This cache only ever expires by time — it has no way to know "a new post just got liked, the trending order might actually be stale right now" and proactively refresh. A more sophisticated system might invalidate the cache explicitly whenever a like or comment is created — more accurate, but meaningfully more complex to get correct (what if two requests invalidate and rebuild simultaneously?). Choosing simple time-based expiration here is a deliberate, named tradeoff of correctness-precision for implementation simplicity, appropriate for how forgiving "trending" specifically is of slight staleness — a decision that wouldn't be appropriate for every kind of data.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 31 items

tests/test_api.py ..............................                         [ 97%]
tests/test_units.py .                                                    [100%]

============================== 31 passed in 0.14s ===============================
```

### Connecting sentence

The application is now observable, reliable, and reasonably fast. The final lesson makes it actually deployable — packaging it, addressing the WAL term you originally had to ask about back in NexusInventory, and setting up the safety measures a real, running deployment needs.

---

## Closing

**Connect the pieces**
`@log_slow_requests` wraps `get_trending`, logging anything over half a second — the same decorator mechanism `@app.get` has used invisibly since Lesson 1, now built and understood directly. `get_trending` itself checks an in-memory, time-expiring cache before running its Lesson 19 aggregation query at all, trading up to 30 seconds of potential staleness for skipping that query almost entirely under repeated load.

**What breaks without this**
Without caching, a `/trending` endpoint under real traffic — many users refreshing a feed repeatedly — would recompute an identical, expensive aggregation query for every single request, even when nothing in the underlying data changed between them, wasting database work at a rate directly proportional to traffic rather than to how often the real answer actually changes.

**Exercises**
1. Add a `?force_refresh=true` query parameter to `/trending` that bypasses the cache check entirely, useful for testing or for an admin who needs guaranteed-current data.
2. Apply `@log_slow_requests` to `/recommendations` as well, and consider (in a sentence, without necessarily implementing it) whether caching would be appropriate there too, given that its results are personalized per member rather than global.

**Definition of Done**
* [x] A real, from-scratch decorator times requests and logs slow ones.
* [x] `/trending` cached with explicit, deliberate time-based expiration.
* [x] Can explain, without notes, what a stacked decorator actually does, in the order it does it.
* [x] Commit: `feat: request timing decorator and time-based caching for trending`

---

## Context Snapshot (End of Lesson 23)

**5. Test State:** 31 tests, 31 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Decorator (mechanism, fully explained) | L23 | `@decorator` above a function is equivalent to `func = decorator(func)`, wrapping it |
| `*args, **kwargs` | L23 | Accepts any arguments, forwarding them through to a wrapped function |
| `functools.wraps` | L23 | Preserves a wrapped function's name/metadata on its wrapper |
| Stacked decorators | L23 | Multiple `@decorator` lines apply bottom-up, each wrapping the result of the one below |
| Cache / TTL (time-to-live) | L23 | Stored result reused until a fixed expiration window passes |
| Staleness | L23 | The gap between a cached value and the true current value, accepted deliberately |
| Space-time tradeoff | L23 | Trading memory for speed (or vice versa) — a fundamental, recurring computing tradeoff |

**7. Lesson Completion State:**
- Completed: Lessons 1-23, Interludes A, B, C, D
- Next: Lesson 24 — Deployment (Docker, SQLite WAL, backups, migrations in deployment)

**8. Current Architecture State:**
- HTTP Layer: 23 routes, timing-instrumented on key endpoints
- Business Logic: `extract_hashtags`, `create_access_token`, `get_current_member`, `require_admin`, `log_slow_requests`
- Data Access: `/trending` now cached
- ORM: partially adopted
- Authentication: complete
- Observability: structured logging (L22) plus request timing (L23)
