# Junior to Senior — T11·L3 — CPU-Bound Work and `ProcessPoolExecutor`

**Prerequisites:** T11·L2 (FastAPI WebSocket). You can send progress via WebSocket.
This lesson explains WHY asyncio does not help CPU-bound work by demonstrating what
"blocks the event loop" actually means — all other requests freeze — then shows the
`ProcessPoolExecutor` solution step by step.

**What this lab adds:**
- DEMONSTRATING that a CPU-heavy `async` function freezes the entire server
- WHY the GIL prevents threads from helping (the specific mechanism)
- HOW `ProcessPoolExecutor` bypasses the GIL with separate OS processes
- WHAT `run_in_executor` does — creates a task on a process and returns an awaitable
- WHY arguments must be picklable — and what fails if they're not

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. While Python runs `for i in range(100_000_000): x = i * i`, can any other
>    Python thread run? Why or why not?
> 2. `await asyncio.sleep(10)` — during those 10 seconds, can other requests be served?
>    Compare to `time.sleep(10)` (synchronous). What is the difference?
> 3. `run_in_executor(executor, heavy_fn, arg1, arg2)` sends `arg1` and `arg2` to
>    a different process. What format do they travel in, and what types cannot be sent?
>
> *(Answers at the end of this lab)*

---

## Step 1 — See the Event Loop Block in Action

This step demonstrates the problem concretely before fixing it.

Add a deliberately slow endpoint to `src/main.py`:

```python
@app.get('/slow')
async def slow_endpoint():
    # CPU-heavy work: no await — blocks the event loop:
    total = sum(i * i for i in range(10_000_000))  # takes ~1 second
    return {'total': total}

@app.get('/fast')
async def fast_endpoint():
    return {'status': 'ok'}
```

### SAVE AND TRY

Start the server:

```bash
uvicorn src.main:app --reload
```

In one terminal, call `/slow`:

```bash
curl http://localhost:8000/slow &
```

IMMEDIATELY (within 100ms) in another terminal, call `/fast`:

```bash
curl http://localhost:8000/fast
```

**You should see:** `/fast` does NOT respond immediately — it waits until `/slow` finishes.
The CPU-heavy computation in `/slow` blocks the event loop, preventing any other request
from being processed.

**Change something:** Replace `sum(i*i ...)` with `await asyncio.sleep(1)` — simulates
1 second of I/O wait. Now call both endpoints simultaneously.
**Expected:** `/fast` responds instantly while `/slow` is sleeping.
`asyncio.sleep` YIELDS the event loop; the CPU loop does NOT.

---

### Concept: The GIL — Why Threads Don't Help

**What it is:** Python's GIL (Global Interpreter Lock) is a mutex that allows only ONE
thread to execute Python bytecode at a time. Even on a multi-core machine, two Python
threads cannot run Python code simultaneously.

**Why threads seem to help for I/O:**

When a thread does I/O (waiting for a socket, file, or sleep), it RELEASES the GIL.
Another thread can then run. This is why multi-threaded servers work for I/O-bound work:
threads take turns doing I/O, releasing the GIL while waiting.

**Why threads DO NOT help for CPU-bound work:**

```python
import threading

def cpu_heavy():
    sum(i*i for i in range(10_000_000))   # pure CPU — never releases GIL

t1 = threading.Thread(target=cpu_heavy)
t2 = threading.Thread(target=cpu_heavy)
t1.start(); t2.start()
t1.join(); t2.join()

# t1 and t2 take turns: one runs, the other waits for the GIL.
# Total time: ~2 seconds (sequential), NOT ~1 second (parallel).
# The GIL prevents true parallel CPU execution.
```

**The fix:** Separate OS PROCESSES. Each process has its own GIL. Two processes can
genuinely run Python code in parallel.

**Canonical example:** The GIL is like a single key to a room. Multiple threads can take
turns inside (holding the key), but only one at a time. For I/O: threads leave the room
briefly (drop the key while waiting), so others can enter. For CPU: threads never leave,
so others always wait. Separate processes have their own rooms and their own keys.

**You will see this again in:**
- Every Python performance discussion mentions the GIL
- `multiprocessing.Pool` is the standard library version of `ProcessPoolExecutor`
- Go and Rust don't have a GIL — they have true thread parallelism
- Standard interview topic: "What is the GIL and why does it exist?"

---

## Step 2 — Build the Process Pool Solution

```python
# src/process_worker.py
# NOTE: This module is imported by WORKER PROCESSES.
# It must only contain code that can be pickled and sent to a process.
# No FastAPI objects, no event loops, no singletons.

def compute_toolpath(points: list[list[float]], tool_radius: float) -> dict:
    """
    CPU-intensive computation. Runs in a WORKER PROCESS — not in the event loop.

    WHY a separate module?
    ProcessPoolExecutor pickles the function and sends it to worker processes.
    If this function were defined inside a coroutine or a class method, pickling would fail.
    Module-level functions are always picklable.
    """
    import time
    start = time.perf_counter()

    result = []
    for point in points:
        # Simulate offset calculation (simplified):
        result.append({'x': point[0] + tool_radius, 'y': point[1] + tool_radius})

    return {
        'toolpath':    result,
        'duration_ms': (time.perf_counter() - start) * 1000,
    }
```

Create `src/job_runner.py`:

```python
# src/job_runner.py
import asyncio
from concurrent.futures import ProcessPoolExecutor
from src.process_worker import compute_toolpath

# One pool per application — created once, reused:
_pool = ProcessPoolExecutor(max_workers=4)


async def run_job(
    job_id:      str,
    points:      list,
    tool_radius: float,
    on_progress: callable,
) -> dict:
    """
    Runs compute_toolpath in a worker process.
    The event loop remains free for other requests while the worker runs.

    run_in_executor(pool, fn, *args):
    - Submits fn(*args) to the process pool
    - Returns a Future that resolves when the process finishes
    - await suspends THIS coroutine — the event loop runs other things
    """
    loop   = asyncio.get_event_loop()
    future = loop.run_in_executor(
        _pool,             # which pool to use
        compute_toolpath,  # function to call in the worker
        points,            # arg 1 — must be picklable
        tool_radius,       # arg 2 — must be picklable
    )

    # Simulate progress while waiting:
    for pct in range(0, 100, 10):
        if future.done():
            break
        await on_progress(pct)
        await asyncio.sleep(0.1)

    result = await future    # wait for completion
    await on_progress(100)
    return result
```

### SAVE AND TRY — Verify the Event Loop Stays Free

Update the `/slow` endpoint to use the process pool:

```python
@app.get('/slow-fixed')
async def slow_endpoint_fixed():
    loop   = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,   # None = default thread pool (acceptable for this demo; use ProcessPoolExecutor for real CPU work)
        lambda: sum(i * i for i in range(10_000_000))
    )
    return {'total': result}
```

Start the server and repeat the two-terminal test with `/slow-fixed` and `/fast`.

**Expected:** `/fast` now responds immediately while `/slow-fixed` is computing.
The computation runs outside the event loop, so the loop can serve `/fast`.

---

## Step 3 — Write the Tests

```python
# tests/test_job_runner.py
import pytest
import asyncio
from src.process_worker import compute_toolpath
from src.job_runner     import run_job


class TestComputeToolpath:

    def test_runs_and_returns_result(self) -> None:
        # This function runs SYNCHRONOUSLY here (not in a process):
        points = [[i, 0] for i in range(10)]
        result = compute_toolpath(points, 3.0)
        assert 'toolpath' in result
        assert len(result['toolpath']) == 10

    def test_each_point_is_offset_by_tool_radius(self) -> None:
        points = [[0, 0], [10, 0]]
        result = compute_toolpath(points, 3.0)
        assert result['toolpath'][0]['x'] == 3.0   # 0 + 3.0
        assert result['toolpath'][1]['x'] == 13.0  # 10 + 3.0

    def test_is_a_module_level_function_for_pickling(self) -> None:
        import pickle
        # If this fails, the function cannot be sent to worker processes:
        pickled = pickle.dumps(compute_toolpath)
        assert len(pickled) > 0


class TestRunJob:

    @pytest.mark.asyncio
    async def test_reports_progress(self) -> None:
        progress_values = []

        async def on_progress(pct: int) -> None:
            progress_values.append(pct)

        result = await run_job(
            job_id      = 'test-1',
            points      = [[i, 0] for i in range(50)],
            tool_radius = 2.0,
            on_progress = on_progress,
        )

        assert result is not None
        assert len(progress_values) > 0
        assert 100 in progress_values

    @pytest.mark.asyncio
    async def test_event_loop_is_free_during_computation(self) -> None:
        """
        While a job runs in the process pool, other coroutines should run.
        We verify this by running a job AND a concurrent task — both should complete.
        """
        completed_other = []

        async def other_task():
            await asyncio.sleep(0.1)
            completed_other.append(True)

        async def noop(pct): pass

        # Run job AND other_task concurrently:
        await asyncio.gather(
            run_job('j', [[0, 0]], 1.0, noop),
            other_task(),
        )

        # If the event loop were blocked, other_task would not complete:
        assert completed_other == [True]
```

### SAVE AND TRY

```bash
pytest tests/test_job_runner.py -v
```

Expected: all tests pass.

---

## 🎯 Challenge: Add a Timeout to `run_job`

**You know:** `run_in_executor`, `asyncio.wait_for`.

**Task:** Add timeout support: if the job takes longer than `timeout_seconds`, cancel
it and return an error. Use `asyncio.wait_for(future, timeout=...)`.

Write 2 tests: one that completes in time, one that times out.

---

<details>
<summary>▶ Show Solution</summary>

```python
async def run_job_with_timeout(
    job_id:          str,
    points:          list,
    tool_radius:     float,
    timeout_seconds: float,
    on_progress:     callable,
) -> dict | None:
    """Returns None if the job times out."""
    loop   = asyncio.get_event_loop()
    future = loop.run_in_executor(_pool, compute_toolpath, points, tool_radius)

    try:
        result = await asyncio.wait_for(future, timeout=timeout_seconds)
        await on_progress(100)
        return result
    except asyncio.TimeoutError:
        return None
```

**Tests:**
```python
@pytest.mark.asyncio
async def test_completes_within_timeout() -> None:
    async def noop(pct): pass
    result = await run_job_with_timeout(
        'j', [[0, 0]], 1.0, timeout_seconds=30, on_progress=noop
    )
    assert result is not None

@pytest.mark.asyncio
async def test_returns_none_on_timeout() -> None:
    async def noop(pct): pass
    # Very short timeout — guaranteed to expire:
    result = await run_job_with_timeout(
        'j', [[i, 0] for i in range(10000)], 1.0, timeout_seconds=0.001, on_progress=noop
    )
    assert result is None
```

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| Event loop blocks without process pool | Two-terminal test: slow endpoint freezes fast one |
| Event loop free with process pool | Same test: fast endpoint responds during slow computation |
| Function must be picklable | `pickle.dumps(compute_toolpath)` — no error |
| Progress reported | `progress_values` contains intermediate values |
| `other_task` runs concurrently | Completed during job → event loop was free |

---

## Quick Check Answers

**1. `for i in range(100_000_000): x = i*i` — can another thread run?**

No. Pure Python computation never releases the GIL. Only I/O operations (waiting for
network data, file reads, sleep) release it. The CPU loop holds the GIL for its entire
duration — no other Python thread can execute. Multiple threads on a multi-core machine
still run one-at-a-time for CPU-bound work. For true parallelism in Python, you need
separate PROCESSES (each with their own GIL).

**2. `await asyncio.sleep(10)` vs `time.sleep(10)` — can other requests be served?**

`await asyncio.sleep(10)`: YES — other requests can be served. The `await` suspends
this coroutine and returns control to the event loop, which runs other coroutines.
After 10 seconds, the event loop resumes this coroutine.

`time.sleep(10)`: NO — the entire process blocks for 10 seconds. `time.sleep` is
a synchronous OS-level sleep — it does not release to the event loop. The event loop
cannot run any other coroutine during those 10 seconds.

**3. Arguments travel as pickle. What types cannot be sent?**

Lambda functions, closures, nested functions, and any object that holds a reference
to the event loop or a socket — none of these can be pickled. Module-level functions,
plain Python objects (`list`, `dict`, `tuple`, `int`, `str`), dataclasses, and many
standard library types can be pickled. The error: `pickle.PicklingError: Can't pickle <function ...>`.
