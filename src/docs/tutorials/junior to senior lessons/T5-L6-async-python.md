# Junior to Senior — T5·L6 — Async Python

**Prerequisites:** T5·L5 (Alembic). You have a complete synchronous-looking backend
that actually uses `async def` throughout. This lesson explains WHY async matters
for APIs, HOW the event loop works, and WHEN async helps vs when it does not.

**What this lab adds:**
- `async def` returns a coroutine — the function body does NOT run until awaited
- `await` pauses the current coroutine and lets the event loop run other work
- Why async helps I/O-bound work but does NOT help CPU-bound work
- `asyncio.gather` — running multiple coroutines concurrently to reduce total wait time
- `asyncio.create_task` — scheduling background work without waiting for it

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Two database queries each take 100ms. How long does sequential `await` take?
>    How long does `asyncio.gather` take?
> 2. A FastAPI handler computes toolpath geometry for 10 seconds using pure Python.
>    Will making it `async def` let other requests proceed during those 10 seconds?
> 3. `async def f(): return 42` — what does `f()` return without `await`?
>    What does `await f()` return?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A demonstration of sequential vs concurrent async, and a timing utility:

```python
# Sequential — waits for each query before starting the next:
async def fetch_dashboard_sequential() -> dict:
    tasks    = await simulate_db_query('tasks',    100)  # 100ms
    projects = await simulate_db_query('projects', 80)   # 80ms
    # Total: ~180ms

# Concurrent — all queries wait simultaneously:
async def fetch_dashboard_concurrent() -> dict:
    tasks, projects = await asyncio.gather(
        simulate_db_query('tasks',    100),
        simulate_db_query('projects', 80),
    )
    # Total: ~100ms (the longest single query)
```

---

### Concept: The Event Loop and the `await` Mechanism

**What it is:** Python's `asyncio` event loop is a single-threaded scheduler. It runs
one coroutine at a time. When a coroutine hits `await`, it pauses and yields control
back to the event loop — which can run OTHER coroutines while waiting.

**The mental model:**

```
Event Loop tick:
  → Run Coroutine A until it hits `await asyncio.sleep(0.1)`
  → A is now waiting (0.1 seconds)
  → Run Coroutine B until it hits `await db.execute(stmt)`
  → B is now waiting (for DB response)
  → Run Coroutine C until it returns
  → DB response arrives → resume B
  → Sleep finishes → resume A
```

**The key insight:** "Async" does NOT mean parallel. It means "while I wait for I/O,
someone else can use the CPU." Only one coroutine runs at a time — but while one waits
for a database or network, others can make progress.

**The problem without async:**

```python
def handle_request():
    result = db.execute('SELECT * FROM tasks')  # BLOCKS for 100ms
    # During these 100ms: ALL other requests are frozen
    return result
```

**The solution with async:**

```python
async def handle_request():
    result = await db.execute('SELECT * FROM tasks')  # suspends for 100ms
    # During these 100ms: event loop serves other requests
    return result
```

**What it hides:** The callback machinery. Before `asyncio`, async code used callbacks
(functions called when I/O completed). `async/await` makes async code look synchronous
while still being non-blocking.

**Canonical example:** A busy waiter. A synchronous waiter stands at one table and
waits for the food to arrive before taking any other orders. An async waiter writes
down the order (starts the I/O), walks to other tables (serves other requests), and
returns when the food is ready (I/O completes).

**Project application:** The FastAPI task API handles many concurrent requests.
When one request awaits a database query, the event loop handles other incoming requests.
Without async, 100 concurrent requests would each wait for the previous one.

**You will see this again in:**
- Every FastAPI application is async — ASGI (Asynchronous Server Gateway Interface)
- JavaScript: `async/await` is identical semantically (same mechanism, different runtime)
- Go's goroutines and channels implement the same I/O concurrency model
- Standard interview topic: "What is the difference between async and threads?"

**Watch for:** Calling a blocking (non-async) function inside `async def` BLOCKS the
entire event loop. `time.sleep(2)` inside an async handler freezes ALL requests for
2 seconds. Use `await asyncio.sleep(2)` to sleep without blocking.

---

## Step 1 — Observe the Coroutine Behaviour

```bash
python -c "
import asyncio

async def greet(name):
    print(f'starting: {name}')
    await asyncio.sleep(0.1)   # simulates 100ms I/O wait
    print(f'finished: {name}')
    return f'Hello, {name}!'

# Calling greet() does NOT run it:
coro = greet('Alice')
print('type:', type(coro).__name__)   # 'coroutine'
print('nothing printed yet — function body has not run')

# Running it:
result = asyncio.run(greet('Alice'))
print('result:', result)
"
```

**You should see:**
```
type: coroutine
nothing printed yet — function body has not run
starting: Alice
finished: Alice
result: Hello, Alice!
```

This proves that calling `greet('Alice')` returns a coroutine object — no code runs.
Only `asyncio.run()` (or `await`) executes the body.

---

### Concept: Sequential vs Concurrent With `asyncio.gather`

**What it is:** `asyncio.gather(coro1, coro2, ...)` runs ALL coroutines concurrently.
All start immediately. The event loop advances each one as their I/O completes.
`gather` returns when ALL coroutines have finished, returning their results in order.

**The problem — sequential `await`:**

```python
async def load_dashboard():
    tasks    = await fetch_tasks()    # waits 100ms
    projects = await fetch_projects() # THEN waits 80ms
    return tasks, projects
# Total: 180ms
```

**The solution — concurrent with `gather`:**

```python
async def load_dashboard():
    tasks, projects = await asyncio.gather(
        fetch_tasks(),    # starts — 100ms wait begins
        fetch_projects(), # also starts — 80ms wait begins (SIMULTANEOUSLY)
    )
    return tasks, projects
# Total: ~100ms (limited by the slowest coroutine, not the sum)
```

**What it hides:** The scheduling. `gather` submits all coroutines to the event loop
and waits for all of them. You do not manually manage the interleaving — the event loop
does.

**Canonical example:** Ordering from multiple restaurants at once via food delivery.
Sequential: order from restaurant A, wait for delivery, then order from B, wait.
Concurrent (`gather`): order from A and B simultaneously, wait for both — total time
is the longer delivery, not the sum.

**Project application:** The dashboard endpoint needs tasks, projects, and recent activity.
`gather` fetches all three concurrently — the response is ready when the slowest query finishes.

**Smallest possible example:**

```python
import asyncio

async def sleep_and_return(seconds: float, value: str) -> str:
    await asyncio.sleep(seconds)
    return value

async def main():
    results = await asyncio.gather(
        sleep_and_return(0.1, 'first'),
        sleep_and_return(0.05, 'second'),
        sleep_and_return(0.2, 'third'),
    )
    # results = ['first', 'second', 'third'] — ORDER matches input, not completion
    print(results)

asyncio.run(main())   # takes ~0.2s (max), not ~0.35s (sum)
```

**You will see this again in:**
- FastAPI route handlers that call multiple services or database queries
- JavaScript: `Promise.all([p1, p2, p3])` is the direct equivalent
- Python's `asyncio.TaskGroup` (Python 3.11+) is a more structured alternative

**Watch for:** `gather` fails if ANY coroutine raises an exception (by default).
Use `return_exceptions=True` to collect exceptions as values instead of failing:
`results = await asyncio.gather(..., return_exceptions=True)`.

---

### Concept: CPU-Bound vs I/O-Bound — Why Async Doesn't Help CPU Work

**What it is:** Async only helps when the bottleneck is waiting for external systems
(I/O). When the bottleneck is Python computation (CPU), there is nothing to await —
the event loop is always blocked.

**The problem:**

```python
def compute_toolpath(points: list) -> list:
    # Pure Python: no I/O, no await points
    result = []
    for point in points:
        result.append(complex_calculation(point))
    return result

async def handle_request():
    toolpath = compute_toolpath(ten_thousand_points)  # BLOCKS event loop for 10 seconds
    # ALL other requests are frozen for 10 seconds
    return toolpath
```

Making `handle_request` async does NOT help — `compute_toolpath` never yields.

**The solution for CPU-bound work:**

```python
import asyncio

async def handle_request():
    loop = asyncio.get_event_loop()
    # Run CPU work in a thread pool — doesn't block the event loop:
    toolpath = await loop.run_in_executor(None, compute_toolpath, ten_thousand_points)
    return toolpath
# run_in_executor yields to the event loop while the thread runs compute_toolpath
```

**The definitive rule:**
- I/O-bound (database, HTTP, file): use `async def` + `await` → event loop handles concurrency
- CPU-bound (math, image processing, parsing): use `run_in_executor` → thread pool handles it

**Project application:** G-code generation is CPU-bound. It must run in `run_in_executor`
or a separate process (covered in T11-L3), not in the async event loop.

**You will see this again in:**
- Python's GIL (Global Interpreter Lock) prevents true CPU parallelism in threads
- For CPU parallelism: `ProcessPoolExecutor` (separate processes, no GIL constraint)
- FastAPI documentation recommends `async def` for I/O-bound and `def` for CPU-bound

**Watch for:** `asyncio.sleep(0)` yields to the event loop once without actually sleeping.
It does NOT help with CPU-bound work — the computation continues immediately on the
next event loop tick. It only helps if the computation is broken into many small steps.

---

## Step 2 — Build the Demo

Create `src/utils/async_demo.py`:

```python
# src/utils/async_demo.py
from __future__ import annotations
import asyncio
import time
from typing import Any


async def simulate_db_query(source: str, delay_ms: float) -> dict[str, Any]:
    """Simulates a database query with a configurable delay."""
    await asyncio.sleep(delay_ms / 1000)   # yield during the 'wait'
    return {'source': source, 'delay_ms': delay_ms}


async def fetch_dashboard_sequential() -> dict[str, Any]:
    """Fetches three data sources one after another."""
    start = time.perf_counter()

    tasks    = await simulate_db_query('tasks',    100)
    projects = await simulate_db_query('projects', 80)
    activity = await simulate_db_query('activity', 120)

    elapsed_ms = (time.perf_counter() - start) * 1000
    return {
        'data':       [tasks, projects, activity],
        'elapsed_ms': round(elapsed_ms),
        'strategy':   'sequential',
    }


async def fetch_dashboard_concurrent() -> dict[str, Any]:
    """Fetches three data sources concurrently."""
    start = time.perf_counter()

    tasks, projects, activity = await asyncio.gather(
        simulate_db_query('tasks',    100),
        simulate_db_query('projects', 80),
        simulate_db_query('activity', 120),
    )

    elapsed_ms = (time.perf_counter() - start) * 1000
    return {
        'data':       [tasks, projects, activity],
        'elapsed_ms': round(elapsed_ms),
        'strategy':   'concurrent',
    }
```

### SAVE AND TRY

```bash
python -c "
import asyncio
from src.utils.async_demo import fetch_dashboard_sequential, fetch_dashboard_concurrent

seq  = asyncio.run(fetch_dashboard_sequential())
conc = asyncio.run(fetch_dashboard_concurrent())

print(f'Sequential:  {seq[\"elapsed_ms\"]}ms  (sum ≈ {100+80+120}ms)')
print(f'Concurrent:  {conc[\"elapsed_ms\"]}ms (max ≈ {max(100,80,120)}ms)')
print(f'Speedup:     {seq[\"elapsed_ms\"] / conc[\"elapsed_ms\"]:.1f}x')
"
```

**You should see:**
```
Sequential:  302ms  (sum ≈ 300ms)
Concurrent:  121ms (max ≈ 120ms)
Speedup:     2.5x
```

The concurrent version takes approximately the time of the slowest single query, not
the sum of all queries.

---

## Step 3 — Write the Tests

Create `tests/test_async_utils.py`:

```python
# tests/test_async_utils.py
import asyncio
import pytest
from src.utils.async_demo import (
    simulate_db_query,
    fetch_dashboard_sequential,
    fetch_dashboard_concurrent,
)


class TestAsyncTiming:

    @pytest.mark.asyncio
    async def test_sequential_takes_approximately_sum_of_delays(self) -> None:
        result = await fetch_dashboard_sequential()
        # Sum of delays: 100 + 80 + 120 = 300ms — allow 100ms tolerance:
        assert result['elapsed_ms'] >= 250

    @pytest.mark.asyncio
    async def test_concurrent_takes_approximately_max_delay(self) -> None:
        result = await fetch_dashboard_concurrent()
        # Max delay: 120ms — should be much less than the sequential sum:
        assert result['elapsed_ms'] < 250   # well under 300ms sum

    @pytest.mark.asyncio
    async def test_concurrent_returns_all_data_sources(self) -> None:
        result = await fetch_dashboard_concurrent()
        sources = {d['source'] for d in result['data']}
        assert sources == {'tasks', 'projects', 'activity'}

    @pytest.mark.asyncio
    async def test_gather_preserves_result_order(self) -> None:
        """asyncio.gather returns results in INPUT order, not COMPLETION order."""
        results = await asyncio.gather(
            asyncio.sleep(0.1, result='slow'),    # finishes second
            asyncio.sleep(0.0, result='fast'),    # finishes first
        )
        # 'slow' is first because it was first in the gather call:
        assert results == ['slow', 'fast']
```

### SAVE AND TRY

```bash
pytest tests/test_async_utils.py -v
```

**You should see:**
```
tests/test_async_utils.py::TestAsyncTiming::test_sequential_takes_approximately_sum_of_delays PASSED
tests/test_async_utils.py::TestAsyncTiming::test_concurrent_takes_approximately_max_delay PASSED
tests/test_async_utils.py::TestAsyncTiming::test_concurrent_returns_all_data_sources PASSED
tests/test_async_utils.py::TestAsyncTiming::test_gather_preserves_result_order PASSED

4 passed
```

---

## 🎯 Challenge: Build `gather_with_partial_results`

**You know:** `asyncio.gather`, `Result[T]` from T5-L0k.

**Task:** Build `gather_with_partial_results(coroutines: list) -> list[Result]` that:
- Returns a list of `Result` objects — one per coroutine
- Failed coroutines return `Result.failure(str(exception))`
- Successful coroutines return `Result.ok(value)`
- ALL coroutines run — one failure does not stop the others

```python
results = await gather_with_partial_results([
    fetch_task('t-1'),   # succeeds → Result.ok(task)
    fetch_task('t-99'),  # fails → Result.failure('not found')
    fetch_task('t-2'),   # succeeds → Result.ok(task)
])
# All three return — none are cancelled
```

Write 3 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```python
from src.domain.result import Result

async def gather_with_partial_results(coroutines: list) -> list[Result]:
    """Runs all coroutines; wraps each result in Result.ok or Result.failure."""
    async def safe_run(coro):
        try:
            value = await coro
            return Result.ok(value)
        except Exception as e:
            return Result.failure(str(e))

    return await asyncio.gather(*[safe_run(c) for c in coroutines])
```

**Tests:**
```python
@pytest.mark.asyncio
async def test_all_successful_returns_all_ok() -> None:
    async def succeed(x: int) -> int:
        return x * 2

    results = await gather_with_partial_results([succeed(1), succeed(2)])
    assert all(r.is_ok for r in results)
    assert [r.value for r in results] == [2, 4]

@pytest.mark.asyncio
async def test_failed_coroutine_returns_failure() -> None:
    async def fail() -> None:
        raise ValueError('something wrong')

    results = await gather_with_partial_results([fail()])
    assert not results[0].is_ok
    assert 'something wrong' in results[0].error_message

@pytest.mark.asyncio
async def test_mix_of_success_and_failure() -> None:
    async def succeed() -> str: return 'ok'
    async def fail()    -> None: raise RuntimeError('bad')

    results = await gather_with_partial_results([succeed(), fail(), succeed()])
    assert results[0].is_ok
    assert not results[1].is_ok
    assert results[2].is_ok
```

**Key insight:** `asyncio.gather(*return_exceptions=True)` returns exceptions as
values — but checking `isinstance(result, Exception)` is awkward. Wrapping in
`Result` gives callers a typed, consistent interface. Both successes and failures
are handled the same way: check `.is_ok`, then access `.value` or `.error_message`.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| `async def` returns coroutine | `type(f())` without await → `coroutine` |
| Sequential vs concurrent timing | `gather` takes ≈ max delay, not sum |
| `gather` preserves order | Results index matches input, not completion time |
| CPU-bound blocks event loop | Add CPU loop inside async fn, verify others don't run |
| `run_in_executor` unblocks | Thread pool runs heavy work, other tasks proceed |

---

## Quick Check Answers

**1. Two 100ms queries — sequential `await` vs `asyncio.gather`. Timing?**

Sequential: ~200ms. Each `await` pauses execution of the current coroutine for the
full duration before starting the next query. The waits are serialised.

`asyncio.gather`: ~100ms. Both queries start simultaneously — the event loop advances
whichever one gets an I/O completion event. Total time is the maximum (100ms), not
the sum (200ms).

**2. 10-second toolpath computation in `async def`. Does it let other requests proceed?**

No. Pure Python computation never yields to the event loop — there is no `await` point
for the event loop to advance other coroutines. Making the function `async def` only
enables `await` inside it — if there is no `await`, it behaves identically to a
synchronous function: it runs to completion, blocking everything else.

**3. `f()` without await — what type? `await f()` — what value?**

`f()` returns a coroutine object — a paused execution context with no code having run.
Type: `coroutine`. `await f()` runs the coroutine body to completion and evaluates to
the return value: `42`. The `await` keyword is what triggers execution — without it,
the coroutine object is just a value, unused until awaited or garbage-collected.
