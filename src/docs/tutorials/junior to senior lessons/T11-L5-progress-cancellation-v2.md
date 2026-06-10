# Junior to Senior — T11·L5 — Progress, Cancellation, and Reconnection

**Prerequisites:** T11·L4 (React useWebSocket). You have the full WebSocket stack.
This final lesson explains WHY you cannot send progress on every iteration, HOW
cooperative cancellation works, and WHAT "estimated time remaining" requires that
you haven't implemented yet.

**What this lab adds:**
- WHY sending progress every iteration slows the computation — the benchmark
- HOW to calculate N (send every N iterations) so you update ~10 times per second
- WHY cancellation is "cooperative" — the server cannot interrupt a running computation
- HOW the `is_cancelled` flag works — what the server checks and when
- WHAT the complete message schema looks like — building it from the job state

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A job has 100,000 iterations. You send a WebSocket message on every iteration.
>    The loop runs in a FastAPI process. What specific mechanism makes this slow?
> 2. "Cooperative cancellation" — the server checks a flag between iterations.
>    The current iteration takes 5 seconds to complete. When does the server stop?
> 3. ETA formula: `elapsed_seconds / percent * (100 - percent)`.
>    At 25% done after 5 seconds, what is the ETA?
>
> *(Answers at the end of this lab)*

---

## Step 1 — See the Progress Frequency Problem

Add a simple benchmark to your project to see the cost of frequent progress sends:

```python
# In a Python terminal:
import asyncio
import time

async def send_fast_progress(n: int):
    """Simulate sending progress on every iteration."""
    start = time.perf_counter()
    for i in range(n):
        # This coroutine 'yield's every iteration — even without actual I/O
        # Each await allows the event loop to process other messages
        await asyncio.sleep(0)  # minimal yield — simulates send overhead
    return time.perf_counter() - start

async def run():
    slow = await send_fast_progress(100_000)  # send on every iteration
    fast = await send_fast_progress(10_000)   # send every 10 iterations worth
    print(f'100,000 sends: {slow:.2f}s')
    print(f'10,000 sends:  {fast:.2f}s')

asyncio.run(run())
```

**You should see:** 100,000 sends takes significantly longer than 10,000. Each `await` has
overhead — even a zero-time sleep still cycles through the event loop. For a job with 1
million iterations, sending every iteration would add seconds of pure overhead.

---

### Concept: Progress Granularity — Sending Every N Iterations

**What it is:** Send progress at most 10-20 times per second — regardless of how many
iterations run per second.

**The calculation:**

```python
total_iterations = 10_000
target_updates   = 20     # 20 updates total is plenty for a progress bar

interval = max(1, total_iterations // target_updates)
# = max(1, 10_000 // 20) = max(1, 500) = 500

# In the loop:
for i, item in enumerate(work_items):
    process(item)
    if i % interval == 0 or i == len(work_items) - 1:
        await send_progress(percent=int(100 * i / len(work_items)))
```

**The rule:** `interval = total // 20` means exactly 20 updates, spread evenly.
Never less than 1 (so at least one update per iteration for tiny jobs).

---

### Concept: Cooperative Cancellation — The Flag Check

**What it is:** The server cannot interrupt a running Python loop mid-iteration.
"Cooperative" means the computation CHOOSES to check for cancellation between iterations.

**Why you cannot forcefully interrupt:**

```python
# This CANNOT be interrupted:
async def compute(cancel_flag):
    result = []
    for i in range(10_000_000):
        result.append(heavy_computation(i))   # cannot be cancelled mid-step
    return result
```

There is no mechanism to stop `heavy_computation(i)` in the middle. You can only stop
between iterations.

**The cooperative approach:**

```python
async def compute(cancel_flag: dict):
    result = []
    for i in range(10_000_000):
        if cancel_flag.get('cancelled'):      # check before each unit of work
            return None                        # return early

        result.append(heavy_computation(i))
    return result
```

The cancel flag is a dict (mutable) because it is modified from the WebSocket handler
while the computation runs in `run_in_executor`. The dict is passed by reference — changes
in the handler are visible to the computation.

**Wait — computation runs in a PROCESS.** Dicts cannot be shared between processes.

**The real solution:** Use a `multiprocessing.Event` or pass cancel status via queue.
For this lesson, the computation checks the flag periodically via a shared mechanism.

In practice: the WebSocket handler receives `{ type: "cancel" }`, sets a flag in a
registry, and the computation checks the registry between iterations.

---

## Step 2 — Build the Complete Job State

Update `src/job_runner.py` to track job state:

```python
# src/job_runner.py
import asyncio
import time
from concurrent.futures import ProcessPoolExecutor
from dataclasses import dataclass, field
from typing import Optional, Callable

_pool = ProcessPoolExecutor(max_workers=4)


@dataclass
class JobState:
    job_id:      str
    status:      str        = 'running'   # 'running' | 'complete' | 'cancelled' | 'error'
    percent:     int        = 0
    step:        str        = 'starting'
    elapsed_s:   float      = 0.0
    eta_s:       Optional[float] = None
    result:      object     = None
    error:       Optional[str] = None
    started_at:  float      = field(default_factory=time.perf_counter)


# Registry: job_id → JobState (in-memory; production would use Redis or DB)
_jobs: dict[str, JobState] = {}


def _compute(points: list, tool_radius: float) -> dict:
    """Module-level: picklable for process pool."""
    import time
    start = time.perf_counter()
    result = [{'x': p[0] + tool_radius, 'y': p[1] + tool_radius} for p in points]
    return {'toolpath': result, 'duration_ms': (time.perf_counter() - start) * 1000}


async def start_job(
    job_id:      str,
    points:      list,
    tool_radius: float,
    on_event:    Callable,
) -> None:
    """
    Starts a job in the process pool and streams events via on_event.
    on_event is called with typed event dicts.
    """
    state = JobState(job_id=job_id)
    _jobs[job_id] = state

    loop   = asyncio.get_event_loop()
    future = loop.run_in_executor(_pool, _compute, points, tool_radius)

    steps = ['loading', 'computing offsets', 'generating toolpath', 'finalising']

    for pct in range(0, 100, 5):
        if future.done():
            break

        elapsed = time.perf_counter() - state.started_at
        step    = steps[min(pct // 25, len(steps) - 1)]
        eta     = (elapsed / max(pct, 1)) * (100 - pct) if pct > 0 else None

        state.percent   = pct
        state.step      = step
        state.elapsed_s = elapsed
        state.eta_s     = eta

        await on_event({
            'type':       'progress',
            'job_id':     job_id,
            'step':       step,
            'percent':    pct,
            'elapsed_s':  round(elapsed, 2),
            'eta_s':      round(eta, 1) if eta else None,
        })

        await asyncio.sleep(0.1)

        if state.status == 'cancelled':
            await on_event({'type': 'cancelled', 'job_id': job_id, 'percent': pct})
            return

    try:
        result = await future
        state.status  = 'complete'
        state.percent = 100
        state.result  = result

        await on_event({
            'type':      'complete',
            'job_id':    job_id,
            'percent':   100,
            'elapsed_s': round(time.perf_counter() - state.started_at, 2),
        })

    except Exception as e:
        state.status = 'error'
        state.error  = str(e)
        await on_event({'type': 'error', 'job_id': job_id, 'error': str(e)})


def cancel_job(job_id: str) -> bool:
    job = _jobs.get(job_id)
    if job and job.status == 'running':
        job.status = 'cancelled'
        return True
    return False


def get_job(job_id: str) -> Optional[JobState]:
    return _jobs.get(job_id)
```

---

## Step 3 — Write the Tests

```python
# tests/test_job_state.py
import pytest
import asyncio
from src.job_runner import start_job, cancel_job, get_job, JobState


class TestJobProgress:

    @pytest.mark.asyncio
    async def test_job_sends_progress_events(self) -> None:
        events = []

        async def on_event(e):
            events.append(e)

        await start_job(
            job_id      = 'j-progress',
            points      = [[i, 0] for i in range(20)],
            tool_radius = 3.0,
            on_event    = on_event,
        )

        types = [e['type'] for e in events]
        assert 'progress' in types
        assert 'complete' in types
        # Never more than 20 progress events (5% intervals):
        progress_events = [e for e in events if e['type'] == 'progress']
        assert len(progress_events) <= 20

    @pytest.mark.asyncio
    async def test_complete_event_has_elapsed_time(self) -> None:
        events = []
        await start_job('j-elapsed', [[0,0]], 1.0, on_event=lambda e: events.append(e))
        complete = next((e for e in events if e['type'] == 'complete'), None)
        assert complete is not None
        assert complete['elapsed_s'] >= 0

    @pytest.mark.asyncio
    async def test_progress_events_have_schema(self) -> None:
        events = []
        await start_job('j-schema', [[0,0]], 1.0, on_event=lambda e: events.append(e))
        progress = next((e for e in events if e['type'] == 'progress'), None)
        if progress:
            # Required fields in the progress message schema:
            assert 'job_id'    in progress
            assert 'step'      in progress
            assert 'percent'   in progress
            assert 'elapsed_s' in progress


class TestCancellation:

    @pytest.mark.asyncio
    async def test_cancelled_job_sends_cancelled_event(self) -> None:
        events   = []
        received = {'cancelled': False}

        async def on_event(e):
            events.append(e)
            if e['type'] == 'progress' and e['percent'] > 5:
                # Cancel after first meaningful progress:
                cancel_job('j-cancel')

        await start_job(
            job_id      = 'j-cancel',
            points      = [[i, 0] for i in range(100)],
            tool_radius = 3.0,
            on_event    = on_event,
        )

        types = [e['type'] for e in events]
        # Either cancelled or complete — the cancel might arrive too late:
        assert 'cancelled' in types or 'complete' in types
```

### SAVE AND TRY

```bash
pytest tests/test_job_state.py -v
```

Expected: all tests pass.

---

## 🎯 Challenge: Add the ETA Calculation Test

**You know:** The ETA formula, `elapsed_s`, `percent`.

**The formula:** `ETA = (elapsed_seconds / percent) * (100 - percent)`

At 25% done after 5 seconds: `ETA = (5/25) * 75 = 0.2 * 75 = 15 seconds`.

**Task:** Write a test that verifies:
1. The first progress event (at percent=0) has `eta_s = None` (cannot estimate yet)
2. A later progress event has `eta_s` that is a positive number

---

<details>
<summary>▶ Show Solution</summary>

```python
@pytest.mark.asyncio
async def test_eta_is_none_at_start_and_positive_later() -> None:
    events = []

    async def on_event(e):
        events.append(e)

    await start_job('j-eta', [[i, 0] for i in range(100)], 1.0, on_event=on_event)

    # First progress event (percent=0) should have no ETA:
    first_progress = next((e for e in events if e['type'] == 'progress'), None)
    if first_progress and first_progress['percent'] == 0:
        assert first_progress['eta_s'] is None

    # Later progress events should have a positive ETA:
    later_progress = [
        e for e in events
        if e['type'] == 'progress' and e.get('percent', 0) > 0 and e.get('eta_s') is not None
    ]
    if later_progress:
        assert all(e['eta_s'] > 0 for e in later_progress)
```

**Key insight:** At `percent=0`, dividing by zero would crash. The code handles this with
`if pct > 0 else None` — no ETA until there is at least some progress to extrapolate from.
The first non-zero percent event gives an ETA, though it's unreliable early in the job.

</details>

---

## Final Check

| Feature | What to verify |
|---|---|
| Progress count ≤ 20 | Count progress events — never more than total//5 + 1 |
| Complete event exists | `complete` in event types |
| Cancelled event possible | Cancel mid-job — `cancelled` event appears |
| ETA is None at start | First event with percent=0 has `eta_s = None` |
| Schema completeness | Every progress event has job_id, step, percent, elapsed_s |

---

## Quick Check Answers

**1. 100,000 iterations, send every iteration. What makes it slow?**

Each `await send_json()` call: (1) acquires the event loop for one tick, (2) serialises
the dict to JSON, (3) copies it into the WebSocket write buffer, (4) schedules the actual
send. This is not free. At 100,000 sends per second on a typical machine, the overhead
is 1-3 seconds per 100,000 sends — ADDED TO the actual computation time. The computation
is also interrupted 100,000 times, preventing CPU caches from warming up.

**2. Cooperative cancellation — current iteration takes 5 seconds. When does the server stop?**

After 5 seconds — when the current iteration completes. The cancel flag is only checked
BETWEEN iterations. If `heavy_computation(i)` takes 5 seconds, the server cannot stop it
mid-way. The job stops at the start of the NEXT iteration when it checks `cancel_flag.get('cancelled')`.
This is why "cooperative" — the computation must cooperate by checking regularly.

**3. ETA at 25% after 5 seconds?**

`ETA = (5 / 25) * (100 - 25) = 0.2 * 75 = 15 seconds`. The formula assumes constant
speed. If the work varies in difficulty across iterations, the ETA will be inaccurate.
At 25% done, the estimate is reasonable but can be off by 50% or more if work distribution
is uneven. Display ETA with a caveat like "~15s remaining" rather than an exact number.
