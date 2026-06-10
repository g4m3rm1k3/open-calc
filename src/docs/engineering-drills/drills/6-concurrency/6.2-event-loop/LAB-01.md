# Drill 6.2 — The Event Loop: How async/await Actually Works

**Standalone drill. No prerequisites except basic Python.**
**Time estimate:** 60–75 minutes
**Environment:** Python 3.8+ — standard library only (`asyncio`, `time`)
**What you will build:** A minimal event loop from scratch using generators, then the same pattern with asyncio. You will see the loop's internal state machine: the ready queue, the waiting tasks, and the mechanism that switches between tasks.
**What you will understand:** What `async def`, `await`, and `asyncio.run()` are doing under the hood — not magic, just a scheduler built on Python generators.

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. You have 1000 HTTP requests to make concurrently. With threads, you'd need 1000 threads — each consumes ~8MB of stack. With asyncio, you need 1 thread. How? What's the key difference in how they wait?

2. `await asyncio.sleep(1)` and `time.sleep(1)` both pause for 1 second. What is the critical behavioral difference between them?

3. Why can't you call `await` outside of an `async def` function?

4. You have CPU-intensive work (computing a large hash) and I/O-intensive work (reading 1000 files). Should you use asyncio for the CPU work? What about for the file reads?

*(Answers at the bottom.)*

---

## The Concept: The Event Loop

### Concept: Cooperative Multitasking Without Threads

**What it is:**
An event loop is a scheduler that runs multiple tasks on a single thread by switching between them whenever a task yields control. Tasks cooperate — they explicitly yield (via `await`) when they're waiting for I/O. The loop runs the next ready task while the first waits.

**The mechanism — generators first:**
Python generators (`yield`) are the foundation of async. A generator function can suspend itself and resume from the same point:

```python
def counter():
    print("A")
    yield        # suspend — return control to caller
    print("B")
    yield
    print("C")

gen = counter()
next(gen)   # runs until first yield, prints "A"
next(gen)   # resumes after first yield, runs until second yield, prints "B"
next(gen)   # prints "C", raises StopIteration
```

The generator remembers its local variables, call stack, and position between `next()` calls. This is the same mechanism `async def` uses — a coroutine is a generator that the event loop drives by calling `send()` on it.

**What the event loop does:**
```
Loop iteration:
  1. Check the "ready" queue: tasks that are ready to run
  2. Run each ready task until it hits an `await` (yields control)
  3. The yielded value tells the loop WHAT the task is waiting for (socket ready, timer, etc.)
  4. Register a callback: when the awaited thing is ready, put this task back in the ready queue
  5. Poll OS for I/O events (select/epoll/kqueue) — move tasks whose I/O is ready back to the queue
  6. Repeat
```

The loop never blocks waiting for one task's I/O. It moves on to other tasks. When I/O completes (the OS notifies via file descriptor), the task goes back in the ready queue.

**What `await` actually does:**
`await expression` suspends the current coroutine and yields control to the event loop. The event loop registers a callback: "when `expression` is ready, resume this coroutine." Meanwhile, the loop runs other tasks. When the expression becomes ready (timer fires, socket has data), the loop resumes the suspended coroutine.

**What `async def` actually is:**
An `async def` function returns a coroutine object when called. The coroutine object is not running yet — it's a suspended computation. `asyncio.run(coro)` creates an event loop, schedules the coroutine, and runs the loop until the coroutine completes.

**Constraints:**
- Single-threaded: only one task runs at a time. `await` is the only yield point — code between awaits is uninterruptible. Long CPU work between `await` calls blocks ALL other tasks.
- Cooperative, not preemptive: the loop cannot forcibly switch tasks — tasks must yield. A task that never awaits monopolizes the thread forever.
- asyncio does not speed up CPU work — it only helps with I/O-bound work where the CPU sits idle waiting for responses.

**Tradeoffs:**
- Async vs threads for I/O: asyncio handles thousands of concurrent connections on one thread with low memory overhead. Threads each consume ~8MB of stack; 10,000 threads = 80GB RAM. Asyncio's overhead per task is ~1KB.
- Async vs threads for CPU: asyncio provides zero benefit for CPU-bound work. Use `ProcessPoolExecutor` (multiprocessing) for CPU parallelism in Python.
- Sync vs async code: async infects the call stack — once you `await`, every caller up the stack must also be async. This is the "function color" problem. Mixing sync and async code requires bridges (`run_in_executor` for sync functions).

**Failure modes:**
- Blocking the event loop: calling `time.sleep()`, reading a large file with `open().read()`, or doing heavy CPU work inside an async function freezes ALL other tasks for that duration. The symptom: your app handles one request per second instead of 1000.
- Forgetting `await`: `result = some_coroutine()` doesn't run the coroutine — it creates a coroutine object. The actual work never happens. Python 3.x will warn: "coroutine was never awaited."
- Mixing sync and async: `requests.get()` inside an async function blocks the thread. Use `aiohttp` or `httpx` instead.

**Operational reality:**
FastAPI, Starlette, aiohttp, and Tornado are all built on asyncio. A FastAPI route handler with `async def` runs in the event loop — it can handle thousands of concurrent requests on one thread as long as it awaits all I/O. A FastAPI route with `def` (sync) runs in a thread pool and blocks a thread per request. The framework choice doesn't matter — the principle (yield during I/O) is the same.

**You will see this again in:**
FastAPI `async def` route handlers, `aiohttp` for concurrent HTTP clients, `asyncpg` for async PostgreSQL, WebSocket servers, any high-concurrency server.

**Watch for:**
`await` can only appear inside `async def`. If you see `SyntaxError: 'await' outside async function`, you called an async function from sync code. The fix is either to make the calling function async, or to use `asyncio.run()` to bridge sync-to-async at the top level.

---

## Step 1 — Build a Minimal Event Loop from Scratch

Before using asyncio, build the mechanism yourself using generators:

```python
# mini_loop.py — a minimal event loop using generators
import time
from collections import deque

class MiniEventLoop:
    def __init__(self):
        self._ready: deque = deque()   # tasks ready to run now
        self._sleeping: list = []       # (wake_time, task) pairs

    def add_task(self, generator):
        """Schedule a generator-based task."""
        self._ready.append(generator)

    def sleep(self, seconds: float):
        """Yield this value from a task to tell the loop: 'wake me in N seconds'."""
        return ("sleep", seconds)

    def run_until_complete(self):
        """Drive all tasks to completion."""
        while self._ready or self._sleeping:
            # Check if any sleeping tasks should wake up
            now = time.monotonic()
            for wake_time, task in list(self._sleeping):
                if now >= wake_time:
                    self._sleeping.remove((wake_time, task))
                    self._ready.append(task)

            if not self._ready:
                # Nothing ready — wait until the soonest wakeup
                if self._sleeping:
                    sleep_until = min(t for t, _ in self._sleeping)
                    time.sleep(max(0, sleep_until - time.monotonic()))
                continue

            # Run the next ready task
            task = self._ready.popleft()
            try:
                instruction = next(task)  # run until next yield

                if isinstance(instruction, tuple) and instruction[0] == "sleep":
                    # Task is sleeping — register wakeup time
                    wake_time = time.monotonic() + instruction[1]
                    self._sleeping.append((wake_time, task))
                else:
                    # Unknown yield — put task back (it yielded None or something else)
                    self._ready.append(task)
            except StopIteration:
                pass  # task is done


# Task functions are generators that yield ("sleep", seconds)
def task_a(loop: MiniEventLoop):
    print("Task A: starting")
    yield loop.sleep(1.0)
    print("Task A: woke after 1.0s")
    yield loop.sleep(0.5)
    print("Task A: woke after another 0.5s — done")

def task_b(loop: MiniEventLoop):
    print("Task B: starting")
    yield loop.sleep(0.3)
    print("Task B: woke after 0.3s")
    yield loop.sleep(0.3)
    print("Task B: woke after another 0.3s")
    yield loop.sleep(0.3)
    print("Task B: woke after another 0.3s — done")

def task_c(loop: MiniEventLoop):
    print("Task C: starting — no sleeping, runs immediately")
    for i in range(3):
        print(f"Task C: step {i+1}")
        yield  # yield without sleeping — go back to queue, let others run
    print("Task C: done")


if __name__ == "__main__":
    loop = MiniEventLoop()
    
    # Add tasks — they don't run yet
    loop.add_task(task_a(loop))
    loop.add_task(task_b(loop))
    loop.add_task(task_c(loop))
    
    print("=== Mini Event Loop ===")
    start = time.monotonic()
    loop.run_until_complete()
    elapsed = time.monotonic() - start
    
    print(f"\nTotal time: {elapsed:.2f}s")
    print(f"(Sequential would take {1.0 + 0.5 + 0.3 + 0.3 + 0.3:.1f}s)")
    print("Tasks ran concurrently on ONE thread — no threads used")
```

### SAVE AND TRY

```
python mini_loop.py
```

Expected output (order of interleaved output will vary slightly):
```
=== Mini Event Loop ===
Task A: starting
Task B: starting
Task C: starting — no sleeping, runs immediately
Task C: step 1
Task C: step 2
Task C: step 3
Task C: done
Task B: woke after 0.3s
Task B: woke after another 0.3s
Task B: woke after another 0.3s — done
Task A: woke after 1.0s
Task A: woke after another 0.5s — done

Total time: 1.51s
(Sequential would take 2.4s)
```

Task C runs all its steps immediately (no sleeping, yields control but stays ready). Task B wakes three times at 0.3s intervals. Task A sleeps the longest. All three run concurrently on one thread — total time is ~1.5s, not 2.4s.

**Change something:** Add a "blocking" task that does NOT yield:
```python
def blocking_task(loop):
    print("Blocking task: starting — will NOT yield for 1 second")
    time.sleep(1.0)  # blocks the ENTIRE loop
    print("Blocking task: done")
    return
    yield  # make it a generator
```
Add it to the loop and run. Notice all other tasks freeze for 1 second while the blocking task runs. This is why `time.sleep()` in async code is catastrophic.

---

## Step 2 — asyncio: The Same Mechanism, Production-Ready

The mini loop above IS asyncio's mechanism. Now use asyncio:

```python
# asyncio_demo.py
import asyncio
import time

async def task_a():
    print("Task A: starting")
    await asyncio.sleep(1.0)   # yield to event loop, register 1s wakeup
    print("Task A: woke after 1.0s")
    await asyncio.sleep(0.5)
    print("Task A: woke after another 0.5s — done")

async def task_b():
    print("Task B: starting")
    await asyncio.sleep(0.3)
    print("Task B: woke after 0.3s")
    await asyncio.sleep(0.3)
    print("Task B: woke after another 0.3s")
    await asyncio.sleep(0.3)
    print("Task B: woke after another 0.3s — done")

async def task_c():
    print("Task C: starting — yields control at each step")
    for i in range(3):
        print(f"Task C: step {i+1}")
        await asyncio.sleep(0)  # yield to loop without actually sleeping

async def main():
    print("=== asyncio Event Loop ===\n")
    start = time.monotonic()
    
    # asyncio.gather runs all coroutines concurrently
    await asyncio.gather(task_a(), task_b(), task_c())
    
    elapsed = time.monotonic() - start
    print(f"\nTotal time: {elapsed:.2f}s")

asyncio.run(main())
```

Also show how to inspect the running loop state:

```python
# asyncio_tasks.py
import asyncio

async def worker(name: str, delay: float):
    print(f"{name}: starting, will take {delay}s")
    await asyncio.sleep(delay)
    print(f"{name}: done")
    return f"{name} result"

async def main():
    # Create tasks explicitly (rather than gather)
    tasks = [
        asyncio.create_task(worker("fast", 0.5)),
        asyncio.create_task(worker("medium", 1.0)),
        asyncio.create_task(worker("slow", 1.5)),
    ]
    
    # Check task state before they complete
    await asyncio.sleep(0)  # yield to let tasks start
    for t in tasks:
        print(f"  Task '{t.get_name()}': done={t.done()}, cancelled={t.cancelled()}")
    
    # Wait for all
    results = await asyncio.gather(*tasks)
    print(f"\nResults: {results}")
    
    # All done
    for t in tasks:
        print(f"  Task '{t.get_name()}': done={t.done()}, result={t.result()}")

asyncio.run(main())
```

### SAVE AND TRY

```
python asyncio_demo.py
python asyncio_tasks.py
```

Expected `asyncio_demo.py` output:
```
=== asyncio Event Loop ===

Task A: starting
Task B: starting
Task C: starting — yields control at each step
Task C: step 1
Task C: step 2
Task C: step 3
Task C: done
Task B: woke after 0.3s
Task B: woke after another 0.3s
Task B: woke after another 0.3s — done
Task A: woke after 1.0s
Task A: woke after another 0.5s — done

Total time: 1.51s
```

Expected `asyncio_tasks.py` output:
```
fast: starting, will take 0.5s
medium: starting, will take 1.0s
slow: starting, will take 1.5s
  Task 'Task-1': done=False, cancelled=False
  Task 'Task-2': done=False, cancelled=False
  Task 'Task-3': done=False, cancelled=False
fast: done
medium: done
slow: done

Results: ['fast result', 'medium result', 'slow result']
  Task 'Task-1': done=True, result=fast result
  Task 'Task-2': done=True, result=medium result
  Task 'Task-3': done=True, result=slow result
```

**Change something:** Replace `await asyncio.sleep(0.3)` in `task_b` with `time.sleep(0.3)` (the synchronous version). Run and observe that Task A and Task C are blocked during Task B's sleep — the entire event loop freezes. This is the "blocking the event loop" failure mode.

---

## Step 3 — Concurrency vs Parallelism: asyncio + ProcessPool

asyncio handles I/O concurrency. For CPU work, use `run_in_executor`:

```python
# cpu_vs_io.py
import asyncio
import time
import hashlib
from concurrent.futures import ProcessPoolExecutor

def cpu_heavy(n: int) -> str:
    """CPU-bound work — hashes a large string N times. Runs in a worker process."""
    data = b"x" * 1_000_000
    result = data
    for _ in range(n):
        result = hashlib.sha256(result).digest()
    return result.hex()[:16]

async def io_simulation(name: str, delay: float) -> str:
    """I/O-bound work — simulated network request."""
    await asyncio.sleep(delay)
    return f"{name} done after {delay}s"

async def main():
    executor = ProcessPoolExecutor(max_workers=4)
    loop = asyncio.get_event_loop()
    
    print("=== I/O concurrency (asyncio alone) ===")
    start = time.monotonic()
    
    # 10 "I/O" tasks each taking 0.5s — run concurrently = 0.5s total
    io_results = await asyncio.gather(*[
        io_simulation(f"req-{i}", 0.5) for i in range(10)
    ])
    print(f"10 x 0.5s I/O tasks completed in {time.monotonic() - start:.2f}s")
    print(f"(Sequential would take 5.0s)")
    
    print("\n=== CPU work (run_in_executor — ProcessPool) ===")
    start = time.monotonic()
    
    # 4 CPU tasks — run in parallel worker processes
    cpu_results = await asyncio.gather(*[
        loop.run_in_executor(executor, cpu_heavy, 5)
        for _ in range(4)
    ])
    print(f"4 CPU hashing tasks completed in {time.monotonic() - start:.2f}s")
    print(f"(Uses {4} worker processes for true parallelism)")
    print(f"First result: {cpu_results[0]}")
    
    executor.shutdown()

asyncio.run(main())
```

### SAVE AND TRY

```
python cpu_vs_io.py
```

Expected output:
```
=== I/O concurrency (asyncio alone) ===
10 x 0.5s I/O tasks completed in 0.50s
(Sequential would take 5.0s)

=== CPU work (run_in_executor — ProcessPool) ===
4 CPU hashing tasks completed in <Ns>
(Uses 4 worker processes for true parallelism)
First result: <hex string>
```

The I/O tasks run in ~0.5s regardless of count (up to OS limits). CPU tasks run in parallel using separate processes (bypassing the GIL).

---

## Challenge

**No solution provided. Requirements checklist only.**

Build an async HTTP client that fetches 20 URLs concurrently and reports results — without using `aiohttp` or `httpx`. Use `asyncio.open_connection()` which gives you raw TCP socket access.

**Requirements checklist:**

- [ ] `async def fetch(host, path)` opens a TCP connection to host:80, sends an HTTP/1.0 GET request, reads the response, returns `(status_code, content_length)`. Use `asyncio.open_connection(host, 80)` to get `(reader, writer)`.
- [ ] `async def fetch_all(urls)` takes a list of `(host, path)` tuples and fetches all concurrently using `asyncio.gather()`
- [ ] Implements a 5-second timeout per request using `asyncio.wait_for(fetch(host, path), timeout=5)`
- [ ] Times the total fetch duration and prints: `Fetched N URLs in X.XXs (would take Y.XXs sequentially)`
- [ ] Reports each result: `[200] example.com/ — 1234 bytes` or `[TIMEOUT] slow.example.com/`
- [ ] Tests with at least 5 real URLs (use public websites that support plain HTTP, like `neverssl.com`, `example.com`)
- [ ] Handles connection refused and DNS errors gracefully — print `[ERROR] host: reason` instead of crashing

**Starter:**
```python
import asyncio
import time

async def fetch(host: str, path: str = "/") -> tuple[int, int]:
    """
    Fetch host:80/path using raw TCP.
    Returns (status_code, content_length).
    """
    reader, writer = await asyncio.open_connection(host, 80)
    
    # Send HTTP/1.0 request (HTTP/1.0 closes connection after response — simpler than 1.1)
    request = f"GET {path} HTTP/1.0\r\nHost: {host}\r\n\r\n"
    writer.write(request.encode())
    await writer.drain()
    
    # TODO: read the response
    # HTTP response starts with "HTTP/1.x STATUS_CODE reason\r\n"
    # Then headers, then blank line, then body
    # Hint: reader.readline() reads one line at a time
    pass

async def fetch_all(urls: list[tuple[str, str]]) -> list:
    # TODO: use asyncio.gather with asyncio.wait_for for timeouts
    pass

if __name__ == "__main__":
    urls = [
        ("example.com", "/"),
        ("neverssl.com", "/"),
        # Add more...
    ]
    asyncio.run(fetch_all(urls))
```

**When you're done:**
- Running the script fetches all URLs concurrently — total time should be close to the slowest single URL, not the sum of all URLs
- Timeout URLs show `[TIMEOUT]` without crashing the other fetches
- The comparison shows concrete speedup: `Fetched 10 URLs in 0.8s (sequential: 4.2s)`

**Stuck?** Ask AI: "In Python asyncio, how do I read an HTTP response from an asyncio StreamReader? I need to read the status line, then headers line by line until a blank line, then read the body. Show me the pattern using reader.readline() and reader.read()."

---

## Quick Check Answers

**1. How asyncio handles 1000 concurrent requests on one thread:**
Threads block the OS thread while waiting — a sleeping thread still occupies memory (stack, registers) and OS scheduler slots. Asyncio tasks yield control when they start waiting for I/O. The single thread runs other tasks while the first waits. When I/O completes, the OS notifies via file descriptor event (epoll/kqueue), and the task resumes. The key difference: threads hold OS resources while blocking; coroutines release the thread to do other work while waiting.

**2. `await asyncio.sleep(1)` vs `time.sleep(1)`:**
`await asyncio.sleep(1)` suspends the current coroutine and yields control to the event loop — the loop runs other tasks for 1 second. `time.sleep(1)` blocks the OS thread — the event loop cannot run, no other tasks execute, the entire program pauses for 1 second. This is the blocking-the-event-loop problem: `time.sleep()` in an async context freezes all concurrent operations.

**3. Why `await` requires `async def`:**
`await` is implemented as a `yield` inside the coroutine. The event loop drives coroutines by calling `send()` on them. A regular (non-async) function is not a generator and cannot be suspended — it runs to completion. Making a function `async def` transforms it into a coroutine factory that returns a suspendable generator-like object. `await` outside `async def` has no mechanism to yield control — there is no event loop managing the current execution frame.

**4. asyncio for CPU work vs I/O work:**
asyncio does NOT help with CPU-bound work. A CPU-intensive task running between `await` points blocks the event loop for its entire duration — no other tasks run. asyncio only helps with I/O-bound work where the CPU is idle waiting for the OS (network, disk). For CPU-bound parallelism in Python: use `ProcessPoolExecutor` (separate processes bypass the GIL) with `loop.run_in_executor()`. For file reads: `aiofiles` or `run_in_executor(ThreadPoolExecutor, ...)` for filesystem I/O that doesn't have native async support.
