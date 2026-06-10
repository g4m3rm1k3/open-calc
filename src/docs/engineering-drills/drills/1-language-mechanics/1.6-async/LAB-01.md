# DRILL 1.6 — Python Async From First Principles
## LAB-01: Concurrency Without Threads

**Standalone.** Prerequisites: basic Python, `pip install aiohttp requests`.
**Time:** 90–120 minutes.
**You will build:** A URL fetcher that is synchronous, then async — and measure the difference.

---

## Quick Check

Answer before you read. Check answers at the bottom.

**1.** Why does async/await make I/O faster?
- A) It uses multiple CPU cores simultaneously
- B) It lets the program do other work while waiting for I/O to complete
- C) It bypasses the operating system's network stack
- D) It compresses data to send fewer bytes

**2.** What does `await` do?
- A) Blocks the entire program until the coroutine finishes
- B) Suspends the current coroutine and lets the event loop run others
- C) Spawns a new thread for the coroutine
- D) Converts the coroutine into a regular function

**3.** Why does async NOT help CPU-bound workloads?
- A) Python's async is limited to 100 concurrent tasks
- B) CPU operations don't release the event loop — one coroutine monopolizes the thread
- C) The `asyncio` module doesn't support math operations
- D) CPU-bound tasks are too fast to benefit

**4.** What is the difference between `asyncio.gather` and a plain `await`?
- A) `gather` is faster because it uses threads
- B) `gather` schedules multiple coroutines to run concurrently; `await` runs one at a time
- C) `gather` only works with HTTP requests
- D) There is no difference — `gather` is just syntax sugar for sequential awaits

---

## Concept Block

### What It Is

Async is a way to write code that can pause while waiting, and do something else during that pause.

It is not faster at computation. It is better at not wasting time.

When you call `requests.get("https://example.com")`, your program stops. It does nothing. It waits — sometimes for hundreds of milliseconds — while bytes travel over a wire, through routers, to a server, back. Your CPU is idle. If you have 20 requests to make, you are idle 20 times in a row.

Async lets you make all 20 requests, then wait for all of them simultaneously, then collect all 20 results. The waiting overlaps instead of stacking.

### The Problem Before Async

```python
# Sequential: 20 requests × 200ms each = 4 seconds total
urls = [url_1, url_2, ..., url_20]
for url in urls:
    response = requests.get(url)   # blocked here for 200ms
    results.append(response.text)
```

Your program is single-threaded. It sits idle during each request.

### The Solution

```python
# Concurrent: 20 requests all "in flight" simultaneously = ~200ms total
async def fetch_all(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_one(session, url) for url in urls]
        results = await asyncio.gather(*tasks)   # all 20 overlap
    return results
```

The waiting overlaps. Total time ≈ the time of the slowest single request.

### What It Hides

`async def` defines a coroutine function. Calling it does NOT run the body. It returns a coroutine object — a paused computation waiting to be scheduled.

```python
async def greet():
    return "hello"

result = greet()   # does NOT run greet(). Returns a coroutine object.
# To actually run it:
result = await greet()   # or: asyncio.run(greet())
```

`await` hides a context switch. It suspends the current coroutine, hands control back to the event loop, and lets the event loop decide what to run next. When the awaited thing is done, the event loop resumes this coroutine.

### Canonical Example

```python
import asyncio

async def task(name, delay):
    print(f"{name} starting")
    await asyncio.sleep(delay)   # pause here; event loop runs other tasks
    print(f"{name} done")
    return name

async def main():
    results = await asyncio.gather(
        task("A", 1),
        task("B", 2),
        task("C", 0.5),
    )
    print(results)   # ['A', 'B', 'C']  -- all ran concurrently, total ~2s not ~3.5s

asyncio.run(main())
```

### Project Application

This lab measures real time differences between sync and async URL fetching. You will see 20 simulated HTTP requests collapse from sequential seconds to near-parallel milliseconds. Then you will see that a CPU-bound loop gains nothing from async — and understand exactly why.

### Constraints

- `async def` functions can only be called with `await` or `asyncio.run()`
- You cannot use `requests` inside async code — it blocks the event loop
- `asyncio.gather` requires awaitables — coroutines, tasks, or futures
- The event loop is single-threaded — only one coroutine runs its Python code at a time
- `await` only suspends during I/O or explicit yields (`asyncio.sleep`) — not during CPU work

### Failure Modes

| Mistake | Symptom |
|---------|---------|
| Calling a coroutine without `await` | Nothing runs; you get a `RuntimeWarning: coroutine was never awaited` |
| Using `requests` inside async code | Blocks the event loop; no concurrency benefit |
| `asyncio.run()` inside an existing event loop | `RuntimeError: This event loop is already running` |
| Forgetting `async with` for `aiohttp.ClientSession` | `ResourceWarning` about unclosed sessions |
| Using `await` outside `async def` | `SyntaxError` |
| Mutable default arguments in coroutines | Same bug as regular Python — shared state across calls |

### Operational Reality

Async is used everywhere requests leave the machine:

- Web frameworks (FastAPI, aiohttp) handle thousands of concurrent HTTP requests on a single process
- Database drivers (`asyncpg`, `aiosqlite`) fetch records while the server handles other requests
- Web scrapers fetch hundreds of pages in parallel
- Discord bots, Slack bots — all event-driven, all async

Python's async is cooperative: every coroutine must voluntarily yield with `await`. One misbehaving coroutine that never yields blocks everything.

### You Will See This Again In

- FastAPI: every route handler is `async def`
- SQLAlchemy async session: `await session.execute(query)`
- pytest-asyncio: async tests with `@pytest.mark.asyncio`
- WebSocket handlers: long-lived connections that wait for messages
- `asyncio.Queue` for producer-consumer patterns

### Watch For

- **Threads vs async:** Threads are preemptive (OS can pause any thread). Async is cooperative (you pause yourself). Async has lower overhead but requires explicit yields.
- **`asyncio.create_task`** — schedules a coroutine to run immediately, without waiting for it. `gather` wraps create_task internally.
- **The GIL (Global Interpreter Lock):** Python's interpreter only runs one thread's Python bytecode at a time. Async is still single-threaded — but I/O operations release the GIL and don't block other coroutines.
- **CPU-bound → use `multiprocessing` or `concurrent.futures.ProcessPoolExecutor`**, not async.

---

## Setup

```
mkdir async-drill
cd async-drill
pip install requests aiohttp
```

Create two files: `sync_fetch.py` and `async_fetch.py`. A third file `cpu_demo.py` in Step 5.

---

## Step 1 — Synchronous: Requests One at a Time

This is the baseline. 20 HTTP requests. Sequential. Time it.

We use `httpbin.org/delay/N` which waits N seconds before responding — a reliable way to simulate a slow server without depending on real website response times. If httpbin is unavailable, use `httpstat.us/200` or any list of URLs.

Create `sync_fetch.py`:

```python
# sync_fetch.py
# The baseline: fetch 20 URLs one at a time.
# Each request blocks until the server responds.

import requests   # standard HTTP library — synchronous
import time

# httpbin.org/delay/0.2 waits 200ms before responding.
# This simulates a real API that takes ~200ms to answer.
BASE_URL = "https://httpbin.org/delay/0.2"

# 20 identical URLs — in real code these would be different endpoints.
URLS = [BASE_URL] * 20


def fetch_one(url, index):
    """Fetch a single URL and return the status code."""
    response = requests.get(url, timeout=10)   # blocks here until server responds
    return response.status_code


def fetch_all_sync(urls):
    """Fetch all URLs sequentially. Returns list of status codes."""
    results = []
    for i, url in enumerate(urls):
        status = fetch_one(url, i)
        results.append(status)
        print(f"  [{i+1:2d}/{len(urls)}] status {status}")   # progress indicator
    return results


if __name__ == "__main__":
    print(f"Fetching {len(URLS)} URLs synchronously...")
    print(f"Each URL takes ~200ms to respond.\n")

    start = time.perf_counter()
    results = fetch_all_sync(URLS)
    end = time.perf_counter()

    total_time = end - start
    print(f"\nDone.")
    print(f"Total time:    {total_time:.2f}s")
    print(f"Average/URL:   {total_time / len(URLS) * 1000:.0f}ms")
    print(f"Expected:      ~{len(URLS) * 0.2:.1f}s (20 requests × 200ms each)")
    print(f"All status codes: {set(results)}")   # should be {200}
```

### SAVE AND TRY

```
python sync_fetch.py
```

Expected output:
```
Fetching 20 URLs synchronously...
Each URL takes ~200ms to respond.

  [ 1/20] status 200
  [ 2/20] status 200
  ...
  [20/20] status 200

Done.
Total time:    4.23s
Average/URL:   212ms
Expected:      ~4.0s (20 requests × 200ms each)
All status codes: {200}
```

**Change something:** Change `BASE_URL` to use `delay/0.5` (500ms delay). Confirm total time jumps to approximately 10 seconds.

**What just happened:** Each `requests.get()` call blocked — your Python process sat completely idle while the network transferred bytes. 20 blocks × 200ms = 4 seconds. Your CPU did nothing useful for 4 seconds. This is the waste that async solves.

---

## Step 2 — The Waiting Problem: A Concrete Analogy

Before writing async code, see exactly what "waiting" means and why it is avoidable.

Create `waiting_demo.py`:

```python
# waiting_demo.py
# Three tasks. Each takes 1 second of "waiting" (not computing).
# SYNC: run them one after another = 3 seconds
# ASYNC: run them overlapping = ~1 second

import time
import asyncio


# --- SYNCHRONOUS VERSION ---
# Each task sleeps for 1 second. They run one at a time.

def sync_task(name, duration):
    """A task that waits for `duration` seconds."""
    print(f"  {name}: starting")
    time.sleep(duration)   # blocks the entire program — nothing else can run
    print(f"  {name}: done after {duration}s")
    return name


print("=== SYNCHRONOUS (sequential) ===")
start = time.perf_counter()

sync_task("Task A", 1)
sync_task("Task B", 1)
sync_task("Task C", 1)

sync_total = time.perf_counter() - start
print(f"Total: {sync_total:.2f}s\n")   # ~3 seconds


# --- ASYNCHRONOUS VERSION ---
# Each coroutine suspends at 'await asyncio.sleep(duration)'.
# The event loop runs Task B while Task A is sleeping.
# All three sleep periods overlap.

async def async_task(name, duration):
    """A coroutine that 'waits' without blocking anything."""
    print(f"  {name}: starting")
    await asyncio.sleep(duration)   # suspends THIS coroutine; event loop runs others
    print(f"  {name}: done after {duration}s")
    return name


async def async_main():
    # asyncio.gather schedules all three coroutines immediately.
    # They start together. Their sleeps overlap.
    results = await asyncio.gather(
        async_task("Task A", 1),
        async_task("Task B", 1),
        async_task("Task C", 1),
    )
    return results


print("=== ASYNCHRONOUS (concurrent) ===")
start = time.perf_counter()

results = asyncio.run(async_main())   # create event loop, run, close event loop

async_total = time.perf_counter() - start
print(f"Total: {async_total:.2f}s")   # ~1 second
print(f"Speedup: {sync_total / async_total:.1f}x")
```

### SAVE AND TRY

```
python waiting_demo.py
```

Expected output:
```
=== SYNCHRONOUS (sequential) ===
  Task A: starting
  Task A: done after 1s
  Task B: starting
  Task B: done after 1s
  Task C: starting
  Task C: done after 1s
Total: 3.01s

=== ASYNCHRONOUS (concurrent) ===
  Task A: starting
  Task B: starting
  Task C: starting
  Task A: done after 1s
  Task B: done after 1s
  Task C: done after 1s
Total: 1.01s
Speedup: 3.0x
```

**Change something:** Change Task B's duration to `0.5` and Task C's to `2`. Observe that async total becomes ~2 seconds (the slowest task), not 3.5 seconds.

**What just happened:** In the async version, all three tasks started before any of them finished. When Task A hit `await asyncio.sleep(1)`, it suspended — literally paused at that line — and the event loop started Task B. Task B suspended too. Task C started. All three sleep timers ran simultaneously. After ~1 second, all three timers expired, and the event loop resumed each task in order. Same total waiting time as the slowest individual task.

---

## Step 3 — The Async Version of the URL Fetcher

Now rewrite the URL fetcher using `aiohttp` and `asyncio.gather`.

Create `async_fetch.py`:

```python
# async_fetch.py
# Fetch 20 URLs concurrently using aiohttp.
# All 20 HTTP requests are "in flight" simultaneously.

import asyncio
import aiohttp    # async HTTP client — does NOT block the event loop
import time

BASE_URL = "https://httpbin.org/delay/0.2"
URLS = [BASE_URL] * 20


async def fetch_one(session, url, index):
    """
    Fetch a single URL and return the status code.
    
    'session' is a shared connection pool — reusing TCP connections is faster
    than opening a new connection for each request.
    
    This coroutine suspends at 'await session.get(url)' — the event loop
    runs other fetch_one coroutines while this one waits for the response.
    """
    async with session.get(url) as response:   # 'async with' handles open/close of the request
        await response.read()                  # wait for full response body
        status = response.status
        print(f"  [{index+1:2d}/{len(URLS)}] status {status}")
        return status


async def fetch_all_async(urls):
    """
    Fetch all URLs concurrently.
    
    aiohttp.ClientSession manages a pool of connections.
    We create ONE session and reuse it for all requests.
    'async with' ensures the session is closed even if an exception occurs.
    """
    async with aiohttp.ClientSession() as session:
        # Build a list of coroutines — not yet started, just defined.
        coroutines = [
            fetch_one(session, url, i)   # creates a coroutine object, does NOT run it
            for i, url in enumerate(urls)
        ]

        # asyncio.gather() schedules all coroutines to start immediately.
        # It returns when ALL of them have completed.
        # The * unpacks the list: gather(coro1, coro2, ..., coro20)
        results = await asyncio.gather(*coroutines)

    return results


async def main():
    print(f"Fetching {len(URLS)} URLs asynchronously...")
    print(f"All requests start simultaneously.\n")

    start = time.perf_counter()
    results = await fetch_all_async(URLS)
    end = time.perf_counter()

    total_time = end - start
    print(f"\nDone.")
    print(f"Total time:    {total_time:.2f}s")
    print(f"Average/URL:   {total_time / len(URLS) * 1000:.0f}ms")
    print(f"Expected:      ~0.2–0.5s (all requests overlap)")
    print(f"All status codes: {set(results)}")


if __name__ == "__main__":
    asyncio.run(main())   # create event loop, run main(), close event loop
```

### SAVE AND TRY

```
python async_fetch.py
```

Expected output:
```
Fetching 20 URLs asynchronously...
All requests start simultaneously.

  [ 1/20] status 200
  [ 3/20] status 200
  [ 7/20] status 200
  ...
  [20/20] status 200

Done.
Total time:    0.48s
Average/URL:   24ms
Expected:      ~0.2–0.5s (all requests overlap)
All status codes: {200}
```

Note: the completion order is non-deterministic — responses arrive when they arrive, not in the order requests were sent. This is visible in the index numbers appearing out of order.

**Change something:** Add `return_exceptions=True` to `asyncio.gather(*coroutines, return_exceptions=True)`. Change one URL to `"https://httpbin.org/status/500"`. Observe that the error is returned as a value in the results list rather than raising and stopping all 20 requests.

**What just happened:** All 20 coroutines started before any of them got a response. Each coroutine suspended at `await session.get(url)` — handing control back to the event loop. The event loop cycled through all suspended coroutines, resuming each one when its network data arrived. The total wall-clock time ≈ the time for one request, not 20.

---

## Step 4 — Run Both and Compare

Run sync, then async, back to back in one script to make the comparison concrete.

Create `compare.py`:

```python
# compare.py
# Run the sync fetcher and the async fetcher on the same URLs.
# Print a clear comparison.

import requests
import aiohttp
import asyncio
import time

BASE_URL = "https://httpbin.org/delay/0.2"
URLS = [BASE_URL] * 20


# --- Synchronous ---
def fetch_sync(urls):
    results = []
    for url in urls:
        r = requests.get(url, timeout=10)
        results.append(r.status_code)
    return results


# --- Asynchronous ---
async def fetch_one_async(session, url):
    async with session.get(url) as response:
        await response.read()
        return response.status


async def fetch_async(urls):
    async with aiohttp.ClientSession() as session:
        coros = [fetch_one_async(session, url) for url in urls]
        return await asyncio.gather(*coros)


# --- Compare ---
print(f"Comparing sync vs async for {len(URLS)} URLs ({BASE_URL})\n")

print("Running SYNC...")
t0 = time.perf_counter()
sync_results = fetch_sync(URLS)
sync_time = time.perf_counter() - t0
print(f"  Done: {sync_time:.2f}s")

print("\nRunning ASYNC...")
t0 = time.perf_counter()
async_results = asyncio.run(fetch_async(URLS))
async_time = time.perf_counter() - t0
print(f"  Done: {async_time:.2f}s")

print(f"\n{'='*40}")
print(f"Sync:    {sync_time:.2f}s")
print(f"Async:   {async_time:.2f}s")
print(f"Speedup: {sync_time / async_time:.1f}x faster")
print(f"{'='*40}")
print(f"Both returned {len(URLS)} results: {set(sync_results) == set(async_results)}")
```

### SAVE AND TRY

```
python compare.py
```

Expected output:
```
Comparing sync vs async for 20 URLs (https://httpbin.org/delay/0.2)

Running SYNC...
  Done: 4.28s

Running ASYNC...
  Done: 0.47s

========================================
Sync:    4.28s
Async:   0.47s
Speedup: 9.1x faster
========================================
Both returned 20 results: True
```

The speedup depends on network conditions. With a reliable connection and a fast server, you can approach 20x. With high latency variance, you may see 6–12x.

**Change something:** Change `URLS = [BASE_URL] * 20` to `URLS = [BASE_URL] * 50`. The sync version should take about 10 seconds. The async version should remain under 1 second.

**What just happened:** The sync version took N × request_time. The async version took approximately max(request_time) — the time of the slowest single request, plus overhead. This is the ceiling: you cannot beat the speed of one request with async alone.

---

## Step 5 — CPU-Bound Failure: Why Async Doesn't Help

Async is designed for I/O — operations that spend their time waiting for external responses. When the work is computation (number crunching, hashing, parsing), async provides no benefit. Here is why.

Create `cpu_demo.py`:

```python
# cpu_demo.py
# Demonstrate that async does NOT help CPU-bound workloads.
# 
# Why? The event loop is single-threaded.
# CPU operations don't contain 'await' — they never yield.
# One coroutine computing for 1 second blocks ALL other coroutines for 1 second.
# Async concurrency requires cooperation: you must voluntarily 'await' to yield.

import asyncio
import time
import hashlib


def cpu_work(n):
    """Pure CPU computation: hash a number N times. No I/O involved."""
    data = str(n).encode()
    for _ in range(500_000):          # 500k hash rounds — takes ~0.3–0.5s per call
        data = hashlib.sha256(data).digest()
    return data.hex()[:8]             # return first 8 chars of hex digest


# --- SYNC VERSION ---
def run_sync(count):
    results = []
    for i in range(count):
        result = cpu_work(i)          # blocks; nothing else can run
        results.append(result)
    return results


# --- ASYNC VERSION ---
# IMPORTANT: cpu_work is still a regular function — no await inside.
# Calling it from async code does NOT make it concurrent.
# The event loop can only switch at await points.
# cpu_work never awaits anything, so it never yields.
async def run_async(count):
    tasks = []
    for i in range(count):
        # create_task schedules the coroutine immediately
        # But async_cpu_work never yields, so it still runs to completion
        # before the next task gets any CPU time.
        task = asyncio.create_task(async_cpu_work(i))
        tasks.append(task)

    results = await asyncio.gather(*tasks)
    return results


async def async_cpu_work(n):
    """An 'async' version of cpu_work. Still no yield point inside."""
    return cpu_work(n)   # still blocks — wrapping in async def doesn't help


# --- Measure both ---
COUNT = 4

print(f"Computing {COUNT} CPU-bound tasks ({COUNT} × 500k SHA-256 rounds)\n")

print("SYNC:")
t0 = time.perf_counter()
sync_results = run_sync(COUNT)
sync_time = time.perf_counter() - t0
print(f"  {sync_time:.2f}s")

print("\nASYNC (same CPU work, wrapped in coroutines):")
t0 = time.perf_counter()
async_results = asyncio.run(run_async(COUNT))
async_time = time.perf_counter() - t0
print(f"  {async_time:.2f}s")

print(f"\n{'='*40}")
print(f"Sync:  {sync_time:.2f}s")
print(f"Async: {async_time:.2f}s")
print(f"Ratio: {async_time/sync_time:.2f}x  (should be ~1.0 — no improvement)")
print(f"{'='*40}")

# Both should produce the same results
assert sorted(sync_results) == sorted(async_results), "Results differ!"
print("Results match: True")

print("""
EXPLANATION:
  The event loop is single-threaded.
  cpu_work() contains no 'await' — it never yields.
  One cpu_work call monopolizes the thread until it finishes.
  The other tasks wait in the queue but cannot start.
  All 4 tasks still run sequentially.

  TO ACTUALLY PARALLELIZE CPU work, use:
    - multiprocessing.Pool (multiple processes, each with its own GIL)
    - concurrent.futures.ProcessPoolExecutor (same thing, cleaner API)
    - asyncio.loop.run_in_executor() (offloads to a thread/process pool)
""")
```

### SAVE AND TRY

```
python cpu_demo.py
```

Expected output:
```
Computing 4 CPU-bound tasks (4 × 500k SHA-256 rounds)

SYNC:
  1.34s

ASYNC (same CPU work, wrapped in coroutines):
  1.36s

========================================
Sync:  1.34s
Async: 1.36s
Ratio: 1.01x  (should be ~1.0 — no improvement)
========================================
Results match: True

EXPLANATION:
  The event loop is single-threaded.
  cpu_work() contains no 'await' — it never yields.
  One cpu_work call monopolizes the thread until it finishes.
  The other tasks wait in the queue but cannot start.
  All 4 tasks still run sequentially.

  TO ACTUALLY PARALLELIZE CPU work, use:
    - multiprocessing.Pool (multiple processes, each with its own GIL)
    - concurrent.futures.ProcessPoolExecutor (same thing, cleaner API)
    - asyncio.loop.run_in_executor() (offloads to a thread/process pool)
```

**Change something:** Add `await asyncio.sleep(0)` inside `async_cpu_work`, after the `cpu_work` call. This adds a yield point — but the work is already done by then, so async still doesn't help. It demonstrates that yielding after the work is different from yielding during the work.

**What just happened:** `async def` does not run code on a background thread. It does not parallelize CPU work. It is cooperative multitasking — each coroutine runs until it chooses to yield at an `await` point. `cpu_work` never yields. The event loop cannot interrupt it. All 4 tasks run sequentially, same as sync.

---

## Step 6 — `create_task` vs `await`: Concurrency Within Async

`asyncio.gather` is the usual way to run multiple coroutines. But `create_task` gives you finer control: start a coroutine and get a handle to it, without waiting for it to finish. The task runs in the background while your current coroutine continues.

Add to `async_fetch.py` (or create a new `tasks_demo.py`):

```python
# tasks_demo.py
# Demonstrate the difference between:
#   await coro()       -- runs ONE coroutine to completion, then continues
#   create_task(coro()) -- starts the coroutine NOW, returns immediately
#   gather(c1, c2)    -- starts multiple, waits for all

import asyncio
import time


async def job(name, duration):
    """Simulate an I/O job that takes `duration` seconds."""
    print(f"  {name}: started")
    await asyncio.sleep(duration)    # yield here; other tasks can run
    print(f"  {name}: finished after {duration}s")
    return f"{name}-result"


# --- Pattern 1: sequential await (NO concurrency) ---
async def sequential():
    """Await one at a time. Total time = sum of all durations."""
    result_a = await job("A", 1)   # wait for A to finish before starting B
    result_b = await job("B", 1)   # wait for B to finish before starting C
    result_c = await job("C", 1)
    return [result_a, result_b, result_c]


# --- Pattern 2: create_task (full concurrency) ---
async def concurrent_tasks():
    """Create tasks first, then await them. All run simultaneously."""
    # create_task() starts the coroutine IMMEDIATELY and returns a Task object.
    # The task is now "in flight" — it will run whenever the event loop gets a turn.
    task_a = asyncio.create_task(job("A", 1))
    task_b = asyncio.create_task(job("B", 1))
    task_c = asyncio.create_task(job("C", 1))

    # Now await all tasks. By now they're already running (or done).
    result_a = await task_a
    result_b = await task_b
    result_c = await task_c
    return [result_a, result_b, result_c]


# --- Pattern 3: gather (concurrency, cleaner) ---
async def with_gather():
    """gather() wraps create_task internally. Cleaner for multiple coroutines."""
    results = await asyncio.gather(
        job("A", 1),
        job("B", 1),
        job("C", 1),
    )
    return results


# --- Measure all three ---
for label, coro_factory in [
    ("Sequential await", sequential),
    ("create_task",      concurrent_tasks),
    ("asyncio.gather",   with_gather),
]:
    print(f"\n=== {label} ===")
    start = time.perf_counter()
    results = asyncio.run(coro_factory())
    elapsed = time.perf_counter() - start
    print(f"Results: {results}")
    print(f"Time: {elapsed:.2f}s")
```

### SAVE AND TRY

```
python tasks_demo.py
```

Expected output:
```
=== Sequential await ===
  A: started
  A: finished after 1s
  B: started
  B: finished after 1s
  C: started
  C: finished after 1s
Results: ['A-result', 'B-result', 'C-result']
Time: 3.01s

=== create_task ===
  A: started
  B: started
  C: started
  A: finished after 1s
  B: finished after 1s
  C: finished after 1s
Results: ['A-result', 'B-result', 'C-result']
Time: 1.01s

=== asyncio.gather ===
  A: started
  B: started
  C: started
  A: finished after 1s
  B: finished after 1s
  C: finished after 1s
Results: ['A-result', 'B-result', 'C-result']
Time: 1.01s
```

**Change something:** In `concurrent_tasks`, move the three `create_task` lines after a `await asyncio.sleep(0)`. Notice that you need to yield at least once before tasks can actually start running.

**What just happened:** `await job("A", 1)` in sequential mode fully completes A before B starts. `create_task` schedules A, B, and C into the event loop's ready queue, then `await task_a` gives the event loop a chance to run them — so all three are started before any finish. `gather` does the same thing internally. The output order confirms it: in concurrent modes, all three "started" lines appear before any "finished" line.

---

## The Rule, Stated Plainly

Use this table to decide which tool to reach for:

| Workload type | Example | Solution |
|---------------|---------|----------|
| I/O-bound | HTTP requests, database queries, file reads | `async`/`await` + `asyncio.gather` |
| I/O-bound, simpler | Same, but team unfamiliar with async | `concurrent.futures.ThreadPoolExecutor` |
| CPU-bound | Hashing, number crunching, image processing | `concurrent.futures.ProcessPoolExecutor` |
| CPU-bound + I/O | Training + uploading model checkpoints | ProcessPoolExecutor for CPU, async for I/O |

Async is not a general speedup. It is specifically for not blocking during waits.

---

## Challenge — Async GitHub Profile Fetcher

Write an async function that fetches GitHub user profiles concurrently and returns structured data.

**Requirements:**
- Accept a list of GitHub usernames
- Fetch `https://api.github.com/users/{username}` for each user concurrently
- Return a list of dicts: `{"login": str, "name": str, "followers": int}`
- Handle HTTP errors gracefully: if a user is not found (404) or the request fails, include `{"login": username, "name": None, "followers": 0, "error": str}` in the results
- Time it against a synchronous version using `requests`
- Print the speedup ratio

**Starter:**

```python
import asyncio
import aiohttp
import requests
import time

USERNAMES = [
    "torvalds", "gvanrossum", "antirez", "kennethreitz",
    "mitsuhiko", "peterbe", "kennethreitz", "defunkt",
    "mojombo", "wycats", "dhh", "tenderlove",
    "jashkenas", "sindresorhus", "tj", "addyosmani",
    "substack", "isaacs", "maxogden", "feross",
]

async def fetch_profile(session, username):
    """
    Fetch one GitHub profile.
    Handle 404 and other errors.
    Return the structured dict.
    """
    url = f"https://api.github.com/users/{username}"
    # TODO: use async with session.get(url) as response:
    # TODO: check response.status
    # TODO: parse json and return {"login", "name", "followers"}
    # TODO: handle errors — return {"login": username, "name": None, "followers": 0, "error": "..."}
    pass


async def fetch_all_profiles(usernames):
    """Fetch all profiles concurrently. Return list of dicts."""
    # TODO: create a ClientSession
    # TODO: build list of coroutines
    # TODO: gather them
    pass


def fetch_all_sync(usernames):
    """Fetch all profiles synchronously. Return list of dicts."""
    results = []
    for username in usernames:
        url = f"https://api.github.com/users/{username}"
        # TODO: requests.get(url), parse, append
        pass
    return results


# --- Time both ---
# TODO: time fetch_all_sync(USERNAMES)
# TODO: time asyncio.run(fetch_all_profiles(USERNAMES))
# TODO: print speedup
```

**When done:** The async version fetches 20 profiles in roughly the time of the slowest single request (usually under 2 seconds). The sync version takes 10–30 seconds. Print the speedup ratio. Both versions should return identical data (modulo ordering, which you can sort by `login` to verify).

**Stuck? Ask AI:** "My aiohttp request is returning 403 on the GitHub API. How do I add a User-Agent header to aiohttp.ClientSession?"

---

## Quick Check Answers

**1. B** — Async lets the program do other work while waiting for I/O. Step 1 shows the problem: `requests.get()` blocks for ~200ms while the network responds. Step 3 shows the fix: `await session.get(url)` suspends just the one coroutine; the event loop runs others. The CPU is never idle while any request is in flight.

**2. B** — `await` suspends the current coroutine and returns control to the event loop. The event loop picks another ready coroutine and runs it. When the awaited thing completes, the event loop puts the original coroutine back in the ready queue. Step 2 shows this explicitly: all three async tasks print "starting" before any print "done" — because each suspends at `await asyncio.sleep(duration)` and lets the others start.

**3. B** — CPU operations contain no `await` — they never voluntarily yield. One coroutine running CPU-intensive code monopolizes the single thread for the entire duration. Step 5 demonstrates: 4 async CPU tasks take the same time as 4 sync CPU tasks. The ratio is ~1.0x — no improvement. `cpu_work` never reaches an `await`, so the event loop never gets a turn to run other tasks.

**4. B** — `asyncio.gather` schedules all provided coroutines to run concurrently. `await coro()` runs one coroutine to completion before proceeding. Step 6 shows all three patterns with timing: sequential await = 3 seconds, create_task = 1 second, gather = 1 second. gather and create_task are equivalent in outcome; gather is cleaner for lists of coroutines.
