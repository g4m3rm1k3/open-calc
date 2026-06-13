# FOUNDATIONS — LAB-046 — Python: Async with asyncio

**Series:** FOUNDATIONS — Part VIII: Python Features
**Environment:** Python REPL or script file (`python3 script.py`). Python 3.10+.
**Time:** 50–65 minutes.

---

## What You Will Build

Two coroutines run concurrently with `asyncio.gather`, a timing comparison between sequential and concurrent execution, and a demonstration of why asyncio does not help CPU-bound work. After this lab you will understand the Python event loop, cooperative multitasking, and exactly when to use asyncio vs threads vs multiprocessing.

---

## What You Need to Know First

**From LAB-011 (Async):** You understand the JavaScript event loop, callbacks, and Promises. Python's asyncio is the same pattern with different syntax: `async def` instead of `async function`, `await` for both, but a single-threaded event loop with cooperative multitasking.

**From LAB-043 (Generators):** Python coroutines are implemented as generator functions under the hood. The `await` keyword is equivalent to `yield from` in the lower-level coroutine protocol.

---

> **Quick Check — try to answer before reading:**
>
> 1. Two `async` functions both `await asyncio.sleep(1)`. Can they run so that the total time is ~1 second, not ~2 seconds?
> 2. Does asyncio help with a CPU-bound task like computing the nth prime number?
> 3. What does `asyncio.gather` do differently from running two `await` calls in sequence?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Coroutines and `async def`

A **coroutine function** is declared with `async def`. Calling it returns a **coroutine object** — like calling a generator function returns a generator. The code inside does not run until the coroutine is awaited.

```python
import asyncio

async def greet(name: str, delay: float) -> str:
    print(f"Starting greeting for {name}")
    await asyncio.sleep(delay)   # suspend here — other coroutines can run
    message = f"Hello, {name}!"
    print(f"Finished greeting for {name}")
    return message

# Calling the function returns a coroutine object — code does not run yet:
coroutine_object = greet("Alice", 1.0)
print(type(coroutine_object))   # <class 'coroutine'>

# To run it, use asyncio.run():
result = asyncio.run(greet("Bob", 0.5))
print(result)   # Hello, Bob!
```

**The walkthrough:** `async def greet(...)` declares a coroutine function. When called, it returns a coroutine object without running. `asyncio.run(...)` starts the event loop, runs the coroutine, and blocks until complete. `await asyncio.sleep(1)` suspends the coroutine for 1 second; during that time, the event loop can run other coroutines.

**`asyncio.sleep` vs `time.sleep`:**
- `time.sleep(1)` blocks the entire thread for 1 second — no other coroutine can run.
- `asyncio.sleep(1)` suspends only the current coroutine — the event loop runs other coroutines while waiting.

---

### Step 2 — Sequential vs Concurrent Execution

```python
import asyncio
import time

async def fetch_data(source: str, delay: float) -> str:
    print(f"Fetching from {source}...")
    await asyncio.sleep(delay)   # simulate network I/O
    print(f"Done fetching from {source}")
    return f"data from {source}"

async def sequential_example():
    """Two fetches run one after the other — total time ≈ sum of delays."""
    start = time.perf_counter()

    result_a = await fetch_data("database", 1.0)
    result_b = await fetch_data("api", 1.5)

    elapsed = time.perf_counter() - start
    print(f"Sequential: {elapsed:.2f}s")   # ~2.5s
    return result_a, result_b

async def concurrent_example():
    """Two fetches run concurrently — total time ≈ max of delays."""
    start = time.perf_counter()

    result_a, result_b = await asyncio.gather(
        fetch_data("database", 1.0),
        fetch_data("api", 1.5),
    )

    elapsed = time.perf_counter() - start
    print(f"Concurrent: {elapsed:.2f}s")   # ~1.5s
    return result_a, result_b

asyncio.run(sequential_example())
asyncio.run(concurrent_example())
```

**The walkthrough — `asyncio.gather`:**

`asyncio.gather(coroutine_a, coroutine_b)` schedules both coroutines on the event loop simultaneously. Both start immediately. When `database` fetch hits `await asyncio.sleep(1.0)`, it suspends. The event loop immediately starts `api` fetch. `database` resumes after 1 second. `api` resumes after 1.5 seconds. Both finish after ~1.5 seconds — the maximum, not the sum.

In sequential mode: `database` runs, suspends for 1s, completes. Then `api` starts, suspends for 1.5s, completes. Total: 2.5s.

**The CS lens — cooperative multitasking:** asyncio uses cooperative multitasking — a coroutine voluntarily yields control at each `await`. Unlike threads (preemptive multitasking), no coroutine is interrupted mid-execution. This eliminates data races at the cost of requiring that coroutines cooperate by yielding at `await` points.

---

### Step 3 — The Event Loop and I/O Bound vs CPU Bound

```python
import asyncio
import time

# I/O bound — asyncio helps:
async def io_bound_task(task_id: int) -> str:
    await asyncio.sleep(0.1)  # network/disk wait
    return f"task {task_id} complete"

# CPU bound — asyncio does NOT help:
def cpu_bound_work(n: int) -> int:
    """Compute sum of 0..n — purely CPU, no I/O."""
    return sum(range(n))

async def demonstrate_cpu_problem():
    start = time.perf_counter()

    # Run 3 I/O tasks concurrently — fast:
    io_results = await asyncio.gather(
        io_bound_task(1), io_bound_task(2), io_bound_task(3)
    )
    io_time = time.perf_counter() - start
    print(f"3 I/O tasks: {io_time:.2f}s")   # ~0.1s (concurrent)

    start = time.perf_counter()
    # "Concurrent" CPU tasks — no benefit:
    # cpu_bound_work runs synchronously — it never awaits, so the event loop is BLOCKED
    total_a = cpu_bound_work(10_000_000)
    total_b = cpu_bound_work(10_000_000)
    cpu_time = time.perf_counter() - start
    print(f"2 CPU tasks: {cpu_time:.2f}s")   # ~1s each, sequential

asyncio.run(demonstrate_cpu_problem())
```

**The walkthrough — why asyncio cannot help CPU work:**

The event loop runs on a single thread. A coroutine that performs CPU-intensive work (computing, data processing, image manipulation) never reaches an `await` — it runs uninterrupted until completion. During that time, NO other coroutine runs. The event loop is blocked.

**The three concurrency tools in Python:**

| Workload | Use |
|---|---|
| I/O bound (network, disk, database) | asyncio — single thread, cooperative |
| I/O bound, legacy blocking code | `threading` — OS threads, GIL prevents true parallelism for CPU |
| CPU bound (computation) | `multiprocessing` — multiple processes, each with own GIL |

asyncio shines when your program spends most of its time waiting — for the database, for an API, for a file. Web servers, microservices, and data pipelines are the classic use cases.

---

### Step 4 — async with and async for

```python
# Context managers can be async:
import asyncio

class AsyncDatabaseConnection:
    async def __aenter__(self):
        print("Connecting...")
        await asyncio.sleep(0.01)  # async connection setup
        return self

    async def __aexit__(self, *args):
        print("Disconnecting...")
        await asyncio.sleep(0.01)  # async cleanup

    async def query(self, sql: str) -> list:
        await asyncio.sleep(0.05)  # async query
        return [{"id": 1, "name": "Alice"}]

async def database_example():
    async with AsyncDatabaseConnection() as db:
        results = await db.query("SELECT * FROM users")
        return results

# Async generators for async iteration:
async def async_paginate(total_pages: int):
    for page_number in range(total_pages):
        await asyncio.sleep(0.01)  # fetch page from API
        yield {"page": page_number, "data": [page_number * 10]}

async def process_pages():
    async for page in async_paginate(5):
        print(f"Processing page {page['page']}")

asyncio.run(process_pages())
```

**The CS lens — protocol extension:** Python's async model extends the regular `with` and `for` protocols with async equivalents: `__aenter__`/`__aexit__` for `async with`, `__aiter__`/`__anext__` for `async for`. This mirrors the regular iterator and context manager protocols (LAB-043, LAB-044) but suspends at each step.

---

## Connect the Pieces

- **FastAPI and aiohttp** are async web frameworks. Each incoming HTTP request runs as a coroutine. Thousands of requests can be in flight simultaneously on a single thread — waiting for their database queries — because each suspends at `await`.
- **Python's `httpx`** (async HTTP client) and `asyncpg` (async PostgreSQL client) are async-native — they cooperate with the event loop instead of blocking it.
- **JavaScript's event loop** (LAB-011) is the same architecture: single-threaded, cooperative, excellent for I/O.

---

## What Breaks Without This

**Using `time.sleep` in an async context:**

```python
async def broken_concurrent():
    await asyncio.gather(
        broken_task(1),
        broken_task(2),
    )

async def broken_task(task_id: int):
    time.sleep(1)  # BUG: blocks the entire thread
    return task_id

asyncio.run(broken_concurrent())
# Total time: ~2 seconds — no concurrency achieved
# time.sleep blocks the event loop — task 2 cannot start until task 1 completes
```

`time.sleep` blocks the OS thread. No `await` means no opportunity for the event loop to schedule another coroutine. The two tasks run sequentially. Replace with `await asyncio.sleep(1)` and concurrency is restored.

---

## Definition of Done

- [ ] Two coroutines with `asyncio.gather` run in ~max-delay seconds, not sum-of-delays
- [ ] Sequential execution takes ~sum-of-delays — verify with `time.perf_counter()`
- [ ] `time.sleep` inside an async function blocks concurrent execution — demonstrate and fix
- [ ] `async with` context manager runs entry/exit correctly
- [ ] You can explain in one sentence why asyncio does not help CPU-bound work

**Git commit:**

```
git add src/
git commit -m "LAB-046: Python asyncio — cooperative multitasking explained; asyncio.gather provides I/O concurrency on one thread; CPU-bound work needs multiprocessing"
```

---

## Quick Check Answers

1. **Yes.** With `asyncio.gather`, both coroutines start immediately. Each reaches `await asyncio.sleep(1)` and suspends. Both resume after 1 second. Total time: ~1 second — not 2.
2. **No.** asyncio only provides concurrency through cooperative suspension at `await` points. A CPU-bound task never awaits — it runs to completion without yielding, blocking the event loop. For CPU-bound concurrency, use `multiprocessing` (which spawns separate processes, each with its own GIL).
3. **`asyncio.gather` runs multiple coroutines concurrently; sequential awaits run them one at a time.** `await task_a` then `await task_b` means task_b cannot start until task_a completes. `asyncio.gather(task_a, task_b)` schedules both on the event loop immediately — they interleave at their `await` suspension points.
