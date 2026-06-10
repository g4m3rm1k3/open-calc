# Junior to Senior — T11·L3 — CPU-Bound Work and `ProcessPoolExecutor`

**Prerequisites:** T11·L2 (FastAPI WebSocket). You can send progress via WebSocket.
This lesson covers the critical pattern for CPU-intensive work in an async API —
running it in a separate process so the event loop stays responsive.

**What this lab adds:**
- Why `asyncio` does NOT help CPU-bound work: the GIL
- A CPU-intensive `async` handler blocks the entire server
- `ProcessPoolExecutor`: runs a function in a separate OS process
- `asyncio.run_in_executor(executor, func, *args)`: non-blocking
- Why threading doesn't solve this (the GIL)

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A FastAPI handler computes a 10-second G-code offset. During those 10 seconds,
>    can other clients send requests? (Pure async, no executor.)
> 2. `asyncio.run_in_executor(None, heavy_fn, arg1, arg2)` — what does `None`
>    mean for the first argument?
> 3. The offset function takes a list of 10,000 polygons. You serialise them to
>    pass to the process. What is the cost?
>
> *(Answers at the end of this lab)*

---

## The Problem

```python
from fastapi import FastAPI

app = FastAPI()

def compute_offset(points: list, distance: float) -> list:
    # CPU-intensive: takes 10 seconds
    return offset_polygons(points, distance)

@app.post('/compute')
async def compute_endpoint(body: dict):
    # THIS BLOCKS THE EVENT LOOP FOR 10 SECONDS:
    result = compute_offset(body['points'], body['distance'])
    return result
```

During those 10 seconds, no other request can be processed — not a health check,
not a WebSocket message, nothing. The entire server is frozen.

---

### Concept: `ProcessPoolExecutor`

```python
from concurrent.futures import ProcessPoolExecutor
import asyncio
from fastapi import FastAPI

app    = FastAPI()
# Create the pool at startup (reuse across requests):
_pool  = ProcessPoolExecutor(max_workers=4)  # 4 parallel processes

def compute_offset(points: list, distance: float) -> list:
    """This runs in a SEPARATE PROCESS — does not block the event loop."""
    return offset_polygons(points, distance)

@app.post('/compute')
async def compute_endpoint(body: dict):
    loop   = asyncio.get_event_loop()
    # Run the CPU work in the pool:
    result = await loop.run_in_executor(
        _pool,           # use this executor (None = default thread pool)
        compute_offset,  # function
        body['points'],  # arguments (pickled and sent to the process)
        body['distance'],
    )
    return result
```

Now the server can handle other requests while the compute is running in the pool.

---

### Concept: Why Not Threads?

Python's GIL (Global Interpreter Lock) allows only one thread to execute Python
code at a time. Threading provides concurrency (switching between tasks) but not
parallelism (running simultaneously). For I/O-bound work (waiting for network,
disk), threading and asyncio both work. For CPU-bound work, only processes bypass
the GIL.

```
Thread 1: ─────CPU──────WAIT────CPU────
Thread 2:       ────CPU──────CPU───────
                     ↑
                   GIL switches — they don't actually run simultaneously

Process 1: ─────CPU───────────────────  (independent Python interpreter)
Process 2:       ─────CPU─────────────  (actually parallel)
```

---

## Step 1 — Build the Job Runner

Create `src/job_runner.py`:

```python
from __future__ import annotations
import asyncio
import time
from concurrent.futures import ProcessPoolExecutor
from dataclasses import dataclass, field
from typing import Callable

# Module-level pool (created once per process):
_pool = ProcessPoolExecutor(max_workers=4)


@dataclass
class JobResult:
    job_id:      str
    success:     bool
    result:      object | None = None
    error:       str | None    = None
    duration_ms: float         = 0.0


# This function runs in a SEPARATE PROCESS — must be a module-level function
# (not a lambda or nested function) because it must be picklable.
def _run_toolpath_computation(points: list, tool_radius: float) -> dict:
    """CPU-intensive toolpath computation. Runs in a worker process."""
    import time
    start = time.perf_counter()

    # Simulate heavy computation:
    result = []
    for i, point in enumerate(points):
        # In reality: offset computation, path planning, G-code generation
        result.append({'x': point[0] + tool_radius, 'y': point[1] + tool_radius})
        if i % 100 == 0:
            time.sleep(0.01)  # simulate expensive work

    elapsed_ms = (time.perf_counter() - start) * 1000
    return {'moves': result, 'duration_ms': elapsed_ms}


async def run_job_with_progress(
    job_id:      str,
    points:      list,
    tool_radius: float,
    on_progress: Callable[[int], None],
) -> JobResult:
    """Runs a toolpath job in a process pool, reporting progress via callback."""
    loop  = asyncio.get_event_loop()
    start = time.perf_counter()

    # Start the computation in a worker process:
    future = loop.run_in_executor(
        _pool,
        _run_toolpath_computation,
        points,
        tool_radius,
    )

    # Simulate progress while waiting for the result:
    for percent in range(0, 100, 10):
        await asyncio.sleep(0.1)  # check if future is done
        if future.done():
            break
        on_progress(percent)

    try:
        result = await future
        on_progress(100)
        return JobResult(
            job_id      = job_id,
            success     = True,
            result      = result,
            duration_ms = (time.perf_counter() - start) * 1000,
        )
    except Exception as e:
        return JobResult(
            job_id  = job_id,
            success = False,
            error   = str(e),
        )
```

---

## Step 2 — Integrate with WebSocket

Update `src/websocket_router.py` to use the job runner:

```python
from src.job_runner import run_job_with_progress

@router.websocket('/ws/jobs/{client_id}')
async def job_websocket(websocket: WebSocket, client_id: str) -> None:
    await manager.connect(client_id, websocket)

    try:
        while True:
            message = await websocket.receive_json()

            if message.get('type') == 'start_job':
                job_id = message.get('job_id', 'j-1')
                points = message.get('points', [[0, 0]] * 1000)

                async def on_progress(percent: int) -> None:
                    await manager.send(client_id, {
                        'type':    'progress',
                        'job_id':  job_id,
                        'percent': percent,
                    })

                result = await run_job_with_progress(job_id, points, 3.0, on_progress)

                await manager.send(client_id, {
                    'type':         'complete' if result.success else 'error',
                    'job_id':       job_id,
                    'duration_ms':  result.duration_ms,
                })

    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(client_id)
```

---

## Step 3 — Write Tests

Create `tests/test_job_runner.py`:

```python
import pytest
import asyncio
from src.job_runner import _run_toolpath_computation, run_job_with_progress, JobResult


class TestCPUBoundWork:

    def test_computation_runs_and_returns_result(self) -> None:
        points = [[i, 0] for i in range(10)]
        result = _run_toolpath_computation(points, 3.0)
        assert 'moves' in result
        assert len(result['moves']) == 10

    def test_each_move_is_offset_by_tool_radius(self) -> None:
        points = [[0, 0], [10, 0]]
        result = _run_toolpath_computation(points, 3.0)
        assert result['moves'][0]['x'] == 3.0  # 0 + 3.0

    @pytest.mark.asyncio
    async def test_run_job_reports_progress(self) -> None:
        progress_values = []
        points = [[i, 0] for i in range(50)]

        result = await run_job_with_progress(
            job_id      = 'test-1',
            points      = points,
            tool_radius = 2.0,
            on_progress = lambda p: progress_values.append(p),
        )

        assert result.success is True
        assert len(progress_values) > 0   # progress was reported
        assert 100 in progress_values     # completion was reported

    @pytest.mark.asyncio
    async def test_run_job_returns_result_with_correct_job_id(self) -> None:
        result = await run_job_with_progress(
            job_id      = 'my-job-id',
            points      = [[0, 0]],
            tool_radius = 1.0,
            on_progress = lambda _: None,
        )
        assert result.job_id == 'my-job-id'
```

### SAVE AND TRY

```bash
pytest tests/test_job_runner.py -v
```

Expected: all tests pass.

---

## 🎯 Challenge: Add a Timeout

**You know:** `ProcessPoolExecutor`, `asyncio.wait_for`.

**Task:** Wrap `run_job_with_progress` with a timeout: if the job takes longer
than `timeout_seconds`, cancel it and return a `JobResult(success=False, error='Timeout')`.

```python
result = await run_job_with_timeout(job_id, points, tool_radius, timeout_seconds=30)
```

Write 2 tests: one that completes within the timeout, one that exceeds it.

---

<details>
<summary>▶ Show Solution</summary>

```python
async def run_job_with_timeout(
    job_id:          str,
    points:          list,
    tool_radius:     float,
    timeout_seconds: float,
    on_progress:     Callable[[int], None] | None = None,
) -> JobResult:
    try:
        return await asyncio.wait_for(
            run_job_with_progress(
                job_id, points, tool_radius, on_progress or (lambda _: None)
            ),
            timeout=timeout_seconds,
        )
    except asyncio.TimeoutError:
        return JobResult(
            job_id  = job_id,
            success = False,
            error   = f'Job exceeded timeout of {timeout_seconds}s',
        )
```

**Tests:**
```python
@pytest.mark.asyncio
async def test_completes_within_timeout() -> None:
    result = await run_job_with_timeout(
        'j', [[0,0]], 1.0, timeout_seconds=30, on_progress=None
    )
    assert result.success is True

@pytest.mark.asyncio
async def test_returns_error_on_timeout() -> None:
    points = [[i, 0] for i in range(10000)]  # many points
    result = await run_job_with_timeout(
        'j', points, 1.0, timeout_seconds=0.001  # 1ms — guaranteed timeout
    )
    assert result.success is False
    assert 'Timeout' in (result.error or '')
```

</details>

---

## Final Check

| Approach | CPU-bound parallelism? | Use case |
|---|---|---|
| Pure async | No (GIL) | I/O-bound: DB, HTTP |
| `ThreadPoolExecutor` | No (GIL) | Blocking I/O in sync libs |
| `ProcessPoolExecutor` | Yes (separate processes) | CPU-bound: geometry, rendering |
| `multiprocessing.Queue` | Yes | Between processes, without asyncio |

---

## Quick Check Answers

**1. 10-second compute in async handler — can other clients send requests?**

No. `asyncio` is single-threaded. While the CPU is running Python code in the
`compute_offset` function, the event loop cannot run other coroutines. No other
request can be processed until the computation finishes. This is the critical
difference from I/O-bound work: `await database.fetch()` yields to the event loop;
a pure Python computation does not.

**2. `run_in_executor(None, ...)` — what does `None` mean?**

`None` means use the default thread pool executor (a `ThreadPoolExecutor`).
For CPU-bound work, this is insufficient (GIL prevents true parallelism).
Pass a `ProcessPoolExecutor` instance explicitly for CPU-bound work:
`loop.run_in_executor(_pool, compute_offset, ...)`.

**3. Serialising 10,000 polygons to pass to the process. What is the cost?**

Python uses pickle to serialise arguments when sending them to a worker process.
Pickling 10,000 complex polygon objects can take 100ms–1s depending on the data.
Mitigation: use simple data structures (lists of tuples) rather than custom objects,
consider numpy arrays (faster pickle), or redesign to pass the computation parameters
rather than pre-built objects.
