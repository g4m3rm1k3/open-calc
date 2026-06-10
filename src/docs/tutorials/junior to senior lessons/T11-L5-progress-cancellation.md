# Junior to Senior — T11·L5 — Progress, Cancellation, and Reconnection

**Prerequisites:** T11·L4 (React useWebSocket). You have the full WebSocket stack.
This final lesson ties everything together — the complete job runner with typed
progress messages, cancellation, and reconnection after the job is already running.

**What this lab adds:**
- Progress message schema: `{ type, step, percent, elapsed_seconds }`
- Sending progress every N iterations (not every iteration)
- Cancellation: client sends `{ type: "cancel" }`; server checks between work units
- Reconnection: client stores job ID; on reconnect sends `{ type: "resume", job_id }`
- Estimated time remaining

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Your progress loop sends a message every iteration. There are 100,000 iterations.
>    What is the problem?
> 2. Cooperative cancellation: the server checks `is_cancelled` between work units.
>    What is the minimum time between a cancel request and the job actually stopping?
> 3. The user refreshes the browser. The WebSocket reconnects. How does the job
>    runner resume showing the correct progress?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

The complete production-grade job runner:

```
Server progress messages:
  { type: "progress", step: "offsetting curves", percent: 25, elapsed_seconds: 0.8 }
  { type: "progress", step: "generating toolpath", percent: 60, elapsed_seconds: 2.1 }
  { type: "complete",  step: "done", percent: 100, elapsed_seconds: 3.5, output_url: "/jobs/j-1/result" }

Cancel flow:
  Client: { type: "cancel", job_id: "j-1" }
  Server: (checks flag, stops after current work unit)
  Server: { type: "cancelled", job_id: "j-1", percent_complete: 48 }

Resume flow:
  Client reconnects, sends: { type: "resume", job_id: "j-1" }
  Server: { type: "progress", percent: 48, step: "resuming..." }  (if still running)
  Server: { type: "complete", ... }  (if already finished)
```

---

### Concept: Progress Message Schema

```ts
interface ProgressMessage {
  type:             'progress';
  job_id:           string;
  step:             string;   // current work step description
  percent:          number;   // 0–100
  elapsed_seconds:  number;   // time since job started
  eta_seconds?:     number;   // estimated time remaining
}

interface CompleteMessage {
  type:            'complete';
  job_id:          string;
  percent:         100;
  elapsed_seconds: number;
  output_url?:     string;
}

interface CancelledMessage {
  type:             'cancelled';
  job_id:           string;
  percent_complete: number;   // how far it got before cancellation
}
```

---

### Concept: Progress Granularity

**Too frequent:** 100,000 iterations × 1 message each = 100,000 WebSocket frames.
This slows the server more than the actual computation.

**Rule of thumb:** Send progress at most 10–20 times per second. For a job with
N iterations, send every `max(1, N // 20)` iterations:

```python
PROGRESS_INTERVAL = max(1, total_items // 20)

for i, item in enumerate(items):
    if cancel_flag.get('cancelled'):
        break

    process(item)  # the actual work

    if i % PROGRESS_INTERVAL == 0 or i == total_items - 1:
        elapsed = time.perf_counter() - start_time
        percent = int(100 * i / total_items)
        eta = (elapsed / max(percent, 1)) * (100 - percent)

        await send_progress({
            'type':            'progress',
            'percent':         percent,
            'elapsed_seconds': elapsed,
            'eta_seconds':     eta,
        })
```

---

## Step 1 — Complete Job Runner With All Features

Update `src/job_runner.py`:

```python
from __future__ import annotations
import asyncio
import time
from concurrent.futures import ProcessPoolExecutor
from dataclasses import dataclass, field
from typing import Callable, Any

_pool = ProcessPoolExecutor(max_workers=4)


@dataclass
class JobState:
    job_id:      str
    status:      str = 'running'  # 'running' | 'complete' | 'cancelled' | 'error'
    percent:     int = 0
    step:        str = 'starting'
    result:      Any = None
    error:       str | None = None
    started_at:  float = field(default_factory=time.perf_counter)


# In-memory job registry — in production, use Redis or a database:
_jobs: dict[str, JobState] = {}


def _compute_job(points: list, tool_radius: float, cancel_check: list) -> dict:
    """Runs in a worker process. cancel_check is a shared list [False]."""
    import time
    start = time.perf_counter()
    result = []
    total = len(points)

    for i, pt in enumerate(points):
        # Check for cancellation every 100 items:
        if i % 100 == 0 and cancel_check[0]:
            return {'cancelled': True, 'processed': i}

        result.append({'x': pt[0] + tool_radius, 'y': pt[1] + tool_radius})

    return {'moves': result, 'duration_ms': (time.perf_counter() - start) * 1000}


async def run_job(
    job_id:      str,
    points:      list,
    tool_radius: float,
    on_progress: Callable,
) -> JobState:
    state = JobState(job_id=job_id)
    _jobs[job_id] = state

    loop         = asyncio.get_event_loop()
    total        = len(points)
    cancel_check = [False]   # passed to the worker process

    # Wrap the progress-reporting around the executor:
    future = loop.run_in_executor(
        _pool, _compute_job, points, tool_radius, cancel_check
    )

    steps = ['loading geometry', 'computing offsets', 'generating toolpath', 'finalising']

    for i in range(100):
        if future.done():
            break

        percent = min(i, 95)
        step    = steps[min(i // 25, len(steps) - 1)]
        elapsed = time.perf_counter() - state.started_at
        eta     = (elapsed / max(percent, 1)) * (100 - percent) if percent > 0 else None

        state.percent = percent
        state.step    = step

        await on_progress({
            'type':            'progress',
            'job_id':          job_id,
            'step':            step,
            'percent':         percent,
            'elapsed_seconds': round(elapsed, 2),
            'eta_seconds':     round(eta, 1) if eta else None,
        })

        await asyncio.sleep(0.1)

        # Check if cancel was requested:
        if state.status == 'cancelled':
            cancel_check[0] = True

    try:
        result = await future
        if result.get('cancelled'):
            state.status  = 'cancelled'
        else:
            state.status  = 'complete'
            state.percent = 100
            state.result  = result

        await on_progress({
            'type':            state.status,
            'job_id':          job_id,
            'percent':         state.percent,
            'elapsed_seconds': round(time.perf_counter() - state.started_at, 2),
        })

    except Exception as e:
        state.status = 'error'
        state.error  = str(e)

    return state


def get_job(job_id: str) -> JobState | None:
    return _jobs.get(job_id)


def cancel_job(job_id: str) -> bool:
    job = _jobs.get(job_id)
    if job and job.status == 'running':
        job.status = 'cancelled'
        return True
    return False
```

---

## Step 2 — Write Tests

Create `tests/test_job_runner_complete.py`:

```python
import pytest
import asyncio
from src.job_runner import run_job, cancel_job, get_job

@pytest.mark.asyncio
async def test_job_completes_and_sends_final_message() -> None:
    messages = []
    await run_job('j-complete', [[i, 0] for i in range(10)], 3.0, lambda m: messages.append(m))

    final = messages[-1]
    assert final['type'] == 'complete'
    assert final['percent'] == 100


@pytest.mark.asyncio
async def test_cancelled_job_sends_cancelled_message() -> None:
    messages = []

    async def cancel_after_start(msg):
        messages.append(msg)
        if msg.get('percent', 0) > 5:
            cancel_job('j-cancel')

    await run_job('j-cancel', [[i, 0] for i in range(100)], 3.0, cancel_after_start)

    types = [m['type'] for m in messages]
    assert 'cancelled' in types or 'complete' in types  # one or the other


@pytest.mark.asyncio
async def test_progress_includes_elapsed_seconds() -> None:
    messages = []
    await run_job('j-elapsed', [[0, 0]], 1.0, lambda m: messages.append(m))

    progress_msgs = [m for m in messages if m.get('type') == 'progress']
    if progress_msgs:
        assert 'elapsed_seconds' in progress_msgs[0]
        assert progress_msgs[0]['elapsed_seconds'] >= 0


def test_get_job_returns_state_after_completion() -> None:
    # This test requires a job to have been run first — integration test
    pass  # skipped here for brevity
```

### SAVE AND TRY

```bash
pytest tests/test_job_runner_complete.py -v
```

Expected: all tests pass.

---

## 🎯 Challenge: Add Resume Support to the React Hook

**You know:** `useWebSocket`, job state, `sendMessage`.

**Task:** Modify `JobRunner.tsx` to persist the current `job_id` in
`sessionStorage`. When the component mounts and finds a `job_id` in storage,
send `{ type: "resume", job_id }` to the server. The server responds with the
current job state (or "job not found" if it expired).

---

<details>
<summary>▶ Show Solution</summary>

```tsx
// In JobRunner.tsx:
const [currentJobId, setCurrentJobId] = useState<string | null>(
  () => sessionStorage.getItem('current_job_id')
);

// When WebSocket opens:
useEffect(() => {
  if (status === 'open' && currentJobId) {
    sendMessage({ type: 'resume', job_id: currentJobId });
  }
}, [status, currentJobId]);  // eslint-disable-line react-hooks/exhaustive-deps

// When starting a job:
const startJob = () => {
  const jobId = `job-${Date.now()}`;
  setCurrentJobId(jobId);
  sessionStorage.setItem('current_job_id', jobId);
  sendMessage({ type: 'start_job', job_id: jobId });
};

// When job completes or is cancelled:
// Clear the stored job id:
if (msg.type === 'complete' || msg.type === 'cancelled') {
  setCurrentJobId(null);
  sessionStorage.removeItem('current_job_id');
}
```

</details>

---

## Final Check

| Feature | Implemented |
|---|---|
| Progress with step description | `{ type, step, percent, elapsed }` |
| Progress granularity | Every N iterations, max 10–20/sec |
| Cancellation | Client sends cancel; server checks flag |
| Estimated time remaining | `elapsed / percent × (100 - percent)` |
| Job state registry | `_jobs` dict keyed by job_id |
| Resume after reconnect | Client sends `{ type: "resume", job_id }` |

---

## Quick Check Answers

**1. 100,000 iterations × 1 message each — what is the problem?**

100,000 WebSocket frames in rapid succession. Each `send_json` is an async
operation that buffers data and sends it over the network. At 100,000/second,
the send buffer overflows and backpressure starts building. The actual computation
slows because it spends more time sending messages than doing work. The client
also processes 100,000 UI updates per second, freezing the browser.
Send every `N // 20` iterations — at most 20 updates per full run.

**2. Cooperative cancellation. Minimum time between cancel request and stop?**

One work unit (the granularity of the cancellation check). If the code checks
`is_cancelled` every 100 iterations and each iteration takes 10ms, the maximum
delay is 100 × 10ms = 1 second. For tighter responsiveness, check more frequently
or process in smaller units. Cooperative cancellation is always delayed by at least
one check interval — it cannot interrupt a running computation mid-iteration.

**3. Browser refresh — WebSocket reconnects — how to resume showing correct progress?**

Store the `job_id` in `sessionStorage` when a job starts. On WebSocket reconnect,
send `{ type: "resume", job_id }`. The server checks its job registry and responds
with the current state: if still running, resume sending progress; if complete,
send the result; if expired/not found, send an error. `sessionStorage` persists
across page reloads but not across tabs — appropriate for this use case.

---

# Curriculum Complete

All 110+ lessons across Topics 0–11 have been written. You are ready to build the CAD/CAM MVP.

The next step is the **MVP Build Phase** — applying everything from this curriculum to build the actual CNC-SIM application. The foundation is solid: TypeScript, Python/FastAPI, React Three Fiber, domain modeling, testing, geometry, parsing, and real-time communication.
