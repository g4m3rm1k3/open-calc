# Drill 6.3 — Parallelism vs Concurrency: Threads, Processes, and the GIL

**Standalone drill. No prerequisites except basic Python.**
**Time estimate:** 60–75 minutes
**Environment:** Python 3.8+ — standard library only (`threading`, `multiprocessing`, `concurrent.futures`)
**What you will build:** Benchmarks that measure real speedup from threads vs processes for CPU-bound and I/O-bound tasks. You will see the GIL's effect as a number, not just a concept.
**What you will understand:** Why threads don't speed up Python CPU work, why processes do, why threads DO speed up I/O work, and when to use each.

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. You have a 4-core CPU. You run 4 Python threads, each doing CPU-heavy math. How much faster does it run than 1 thread? Why?

2. You have a 4-core CPU. You run 4 Python processes (not threads), each doing CPU-heavy math. How much faster does it run than 1 process?

3. You run 100 threads, each making one HTTP request and waiting for the response. The GIL is held while waiting for a response. True or false? Explain.

4. `multiprocessing` is slower than `threading` for small tasks. Why? What overhead does it have that threading doesn't?

*(Answers at the bottom.)*

---

## The Concept: The GIL, Threads, and Processes

### Concept: The Global Interpreter Lock

**What it is:**
The GIL (Global Interpreter Lock) is a mutex inside CPython that allows only one thread to execute Python bytecode at a time. Even on a multi-core CPU, two Python threads cannot execute simultaneously — one holds the GIL while the other waits.

**Why it exists:**
CPython's memory management (reference counting) is not thread-safe. Without the GIL, two threads incrementing the same object's reference count simultaneously could produce the wrong count, causing premature deallocation (use-after-free) or memory leaks. The GIL is a coarse lock that makes reference counting safe without fine-grained per-object locks. It was a pragmatic choice in CPython's early design that stuck because removing it is extremely difficult.

**What the GIL does NOT block:**
The GIL is released during I/O operations. When Python calls `socket.recv()`, `file.read()`, or `time.sleep()`, it releases the GIL before the system call and re-acquires it after. During the I/O wait, OTHER Python threads can run. This is why threading IS useful for I/O-bound work.

**The mechanism:**
```
Thread A (CPU work):  [GIL held]──────────────[GIL released, switch]──[GIL held]──
Thread B (CPU work):  [waiting for GIL]────────────────────────────────[waiting]──
                      
Thread A (I/O work):  [GIL held]──[GIL released: I/O wait]──────────[GIL re-acquired]──
Thread B (I/O work):  [waiting for GIL]──[GIL acquired: runs!]──────[GIL released: I/O]──
```

For CPU work: Thread A holds the GIL the whole time (checks every 5ms to see if another thread wants it). Thread B mostly waits. No speedup.
For I/O work: Both threads release the GIL while waiting. Both run their Python code in the gaps between I/O operations. Effective concurrency.

**The fix for CPU parallelism:**
Use separate processes (`multiprocessing`). Each process has its own Python interpreter and its own GIL. Processes can run truly in parallel across cores. The cost: process creation overhead (~50-100ms), inter-process communication via queues/pipes (serialization cost), and no shared memory.

**Constraints:**
- `ProcessPoolExecutor` requires pickling (serializing) arguments and return values. Lambda functions and local functions cannot be pickled. All task functions must be importable at the module level.
- Process creation is expensive (~50-100ms). For tasks under ~100ms, the overhead exceeds the benefit.
- Shared state between processes requires `multiprocessing.Value`, `multiprocessing.Queue`, or other IPC mechanisms. Regular Python objects are NOT shared.
- The GIL is CPython-specific. PyPy, Jython, and GraalPy don't have this constraint.

**Tradeoffs:**
| Scenario | Best tool | Why |
|---|---|---|
| 1000 HTTP requests | asyncio | I/O-bound, no parallelism needed |
| 4 CPU-heavy calculations | ProcessPoolExecutor | True parallelism, bypasses GIL |
| Mixed I/O + some CPU | asyncio + run_in_executor | Async for I/O, processes for CPU bursts |
| Shared mutable state | threading + Lock | Processes can't share memory easily |

**Failure modes:**
- Using threads for CPU work expecting speedup: you get SLOWER results due to GIL contention overhead and context switching
- Using processes for tiny tasks: process startup cost (50-100ms) exceeds task time — slower than single-threaded
- Not accounting for serialization cost in multiprocessing: passing large numpy arrays between processes serializes them — use shared memory instead
- Fork vs spawn: on Linux, `multiprocessing` defaults to `fork` (fast but can cause issues with threads/sockets in the parent). On Windows and macOS, it uses `spawn` (safe but slower). Use `spawn` explicitly for reliability.

**Operational reality:**
Most Python web frameworks run in multiple worker processes (gunicorn, uvicorn with multiple workers). Each process handles requests independently with its own memory — no GIL contention between requests. For data science: NumPy, SciPy, Pandas release the GIL for their C-extension operations — you CAN get parallel speedup with threads when calling NumPy on large arrays. The rule: GIL applies to Python bytecode, not to C extensions that explicitly release it.

**You will see this again in:**
gunicorn worker count tuning, scikit-learn's `n_jobs` parameter, Celery workers, FastAPI's `ProcessPoolExecutor` for CPU-heavy endpoints, PyTorch distributed training.

**Watch for:**
The benchmark that proves the GIL: four threads doing heavy math takes the SAME time as one thread. If you see this in production (adding workers doesn't help), you're CPU-bound and threading is the wrong tool. Switch to multiprocessing or distribute work across separate processes.

---

## Step 1 — Measure the GIL's Effect on CPU-Bound Work

Create `benchmark.py`:

```python
import time
import threading
import multiprocessing
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

def cpu_work(n: int) -> int:
    """Pure Python CPU work — counts up. GIL is held throughout."""
    total = 0
    for i in range(n):
        total += i * i
    return total

def time_it(label: str, fn) -> float:
    start = time.perf_counter()
    fn()
    elapsed = time.perf_counter() - start
    print(f"  {label:<40} {elapsed:.3f}s")
    return elapsed


N = 10_000_000  # 10 million iterations per task
TASKS = 4       # 4 tasks

print(f"=== CPU-Bound Work: {TASKS} tasks of {N:,} iterations each ===\n")

# Baseline: sequential
def sequential():
    for _ in range(TASKS):
        cpu_work(N)

# 4 threads
def threaded():
    with ThreadPoolExecutor(max_workers=TASKS) as ex:
        list(ex.map(cpu_work, [N] * TASKS))

# 4 processes
def multiprocess():
    with ProcessPoolExecutor(max_workers=TASKS) as ex:
        list(ex.map(cpu_work, [N] * TASKS))

print("Running benchmarks (this takes ~10 seconds)...")
seq_time = time_it("1 thread (sequential):", sequential)
thread_time = time_it(f"{TASKS} threads:", threaded)
proc_time = time_it(f"{TASKS} processes:", multiprocess)

print(f"\nResults:")
print(f"  Threading speedup: {seq_time/thread_time:.2f}x (expected: ~1x due to GIL)")
print(f"  Process speedup:   {seq_time/proc_time:.2f}x (expected: ~{TASKS}x on {TASKS} cores)")
print(f"\nConclusion: for CPU-bound work, threads do NOT help (GIL).")
print(f"Processes give near-linear speedup with core count.")
```

### SAVE AND TRY

```
python benchmark.py
```

Expected output (exact numbers vary by machine):
```
=== CPU-Bound Work: 4 tasks of 10,000,000 iterations each ===

Running benchmarks (this takes ~10 seconds)...
  1 thread (sequential):                  2.841s
  4 threads:                              2.975s
  4 processes:                            0.821s

Results:
  Threading speedup: 0.96x (expected: ~1x due to GIL)
  Process speedup:   3.46x (expected: ~4x on 4 cores)

Conclusion: for CPU-bound work, threads do NOT help (GIL).
Processes give near-linear speedup with core count.
```

The threading speedup is ~1x (no benefit, slight overhead). Processes give near-linear speedup. The GIL as a measurable number.

**Change something:** Reduce `N` to `100_000` (100k iterations). Now the process speedup is WORSE than sequential because process startup overhead dominates. This shows why multiprocessing is wrong for small tasks.

---

## Step 2 — Threads DO Help for I/O-Bound Work

```python
# io_benchmark.py
import time
import threading
import urllib.request
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

def fake_io_work(duration: float) -> str:
    """Simulate I/O work by sleeping (GIL is released during sleep)."""
    time.sleep(duration)
    return f"done after {duration}s"

def time_it(label, fn):
    start = time.perf_counter()
    result = fn()
    elapsed = time.perf_counter() - start
    print(f"  {label:<40} {elapsed:.3f}s")
    return elapsed


TASKS = 10
DELAY = 0.5   # 0.5s per task = 5.0s sequential

print(f"=== I/O-Bound Work: {TASKS} tasks each sleeping {DELAY}s ===")
print(f"(Sequential total: {TASKS * DELAY:.1f}s)\n")

def sequential():
    for _ in range(TASKS):
        fake_io_work(DELAY)

def threaded():
    with ThreadPoolExecutor(max_workers=TASKS) as ex:
        list(ex.map(fake_io_work, [DELAY] * TASKS))

def multiprocess():
    with ProcessPoolExecutor(max_workers=TASKS) as ex:
        list(ex.map(fake_io_work, [DELAY] * TASKS))

seq_time = time_it("Sequential:", sequential)
thread_time = time_it(f"{TASKS} threads:", threaded)
proc_time = time_it(f"{TASKS} processes:", multiprocess)

print(f"\nResults:")
print(f"  Threading speedup: {seq_time/thread_time:.1f}x (threads release GIL during I/O)")
print(f"  Process speedup:   {seq_time/proc_time:.1f}x")
print(f"\nConclusion: for I/O-bound work, threads give near-linear speedup.")
print(f"Process overhead doesn't help here — threads are the right tool.")
print(f"(asyncio would be even better for 1000+ concurrent I/O tasks)")
```

### SAVE AND TRY

```
python io_benchmark.py
```

Expected output:
```
=== I/O-Bound Work: 10 tasks each sleeping 0.5s ===
(Sequential total: 5.0s)

  Sequential:                              5.003s
  10 threads:                              0.502s
  10 processes:                            0.601s

Results:
  Threading speedup: 9.9x (threads release GIL during I/O)
  Process speedup:   8.3x

Conclusion: for I/O-bound work, threads give near-linear speedup.
Process overhead doesn't help here — threads are the right tool.
(asyncio would be even better for 1000+ concurrent I/O tasks)
```

Threads give near-linear speedup for I/O because the GIL is released during sleep/I/O. Processes also work but have more overhead. This is why web servers use many threads or async — requests spend most of their time waiting for the database.

---

## Step 3 — The Right Tool for Each Job

Demonstrate the decision matrix with a realistic mixed workload:

```python
# mixed_workload.py
import asyncio
import time
import hashlib
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

# --- CPU-bound task (must use processes) ---
def hash_data(data: bytes) -> str:
    result = data
    for _ in range(100):
        result = hashlib.sha256(result).digest()
    return result.hex()[:16]

# --- I/O-bound task (use async or threads) ---
async def fetch_simulated(url_id: int) -> str:
    await asyncio.sleep(0.1)  # simulate network latency
    return f"response-{url_id}"

# --- Mixed workload orchestrator ---
async def main():
    loop = asyncio.get_event_loop()
    proc_executor = ProcessPoolExecutor(max_workers=4)
    
    print("=== Mixed Workload ===\n")
    start = time.perf_counter()
    
    # 1. Fetch 50 URLs concurrently (async I/O)
    print("Step 1: Fetch 50 URLs concurrently (asyncio)...")
    io_start = time.perf_counter()
    responses = await asyncio.gather(*[fetch_simulated(i) for i in range(50)])
    io_time = time.perf_counter() - io_start
    print(f"  Done: {len(responses)} responses in {io_time:.2f}s")
    
    # 2. Hash 8 large payloads in parallel (multiprocessing via run_in_executor)
    print("\nStep 2: Hash 8 payloads in parallel (ProcessPoolExecutor)...")
    cpu_start = time.perf_counter()
    payload = b"x" * 100_000
    hash_futures = [
        loop.run_in_executor(proc_executor, hash_data, payload)
        for _ in range(8)
    ]
    hashes = await asyncio.gather(*hash_futures)
    cpu_time = time.perf_counter() - cpu_start
    print(f"  Done: {len(hashes)} hashes in {cpu_time:.2f}s")
    print(f"  First hash: {hashes[0]}")
    
    total = time.perf_counter() - start
    print(f"\nTotal time: {total:.2f}s")
    print(f"(50x0.1s I/O = 5s sequential, 8 CPU tasks sequential = much longer)")
    print("Async + ProcessPool = best of both worlds")
    
    proc_executor.shutdown()

asyncio.run(main())
```

### SAVE AND TRY

```
python mixed_workload.py
```

Expected output:
```
=== Mixed Workload ===

Step 1: Fetch 50 URLs concurrently (asyncio)...
  Done: 50 responses in 0.10s

Step 2: Hash 8 payloads in parallel (ProcessPoolExecutor)...
  Done: 8 hashes in <Ns>
  First hash: <hex>

Total time: <Ns>
(50x0.1s I/O = 5s sequential, 8 CPU tasks sequential = much longer)
Async + ProcessPool = best of both worlds
```

The 50 I/O tasks complete in ~0.1s (asyncio runs them concurrently). The 8 CPU tasks complete in roughly `ceil(8/cores) * hash_time` (processes run them in parallel).

---

## Challenge

**No solution provided. Requirements checklist only.**

Build a parallel image processing pipeline that demonstrates the correct tool choice for each stage.

**Requirements checklist:**

- [ ] `Stage 1: Download` — 20 simulated "downloads" (sleep 0.2s each). Use `asyncio` (I/O-bound). Time this stage.
- [ ] `Stage 2: Process` — 20 "processing" tasks (compute sha256 of a 500KB blob 50 times each). Use `ProcessPoolExecutor`. Time this stage.
- [ ] `Stage 3: Upload` — 20 simulated "uploads" (sleep 0.1s each). Use `asyncio`. Time this stage.
- [ ] Pipeline stages run one-after-the-other (Stage 2 waits for Stage 1 output). Show: `Download → Process → Upload`
- [ ] Compare total time against a sequential baseline (one task at a time, no parallelism): print `Pipeline: Xs, Sequential: Ys, Speedup: Zx`
- [ ] Worker count for ProcessPoolExecutor is configurable — test with `workers=1`, `workers=2`, `workers=4` and show speedup for the CPU stage
- [ ] A summary at the end: `Downloaded: N, Processed: N, Uploaded: N` (counts, verifying all items made it through)

**Starter:**
```python
import asyncio
import hashlib
import time
from concurrent.futures import ProcessPoolExecutor

def process_item(data: bytes) -> str:
    """CPU-bound: hash the data 50 times."""
    result = data
    for _ in range(50):
        result = hashlib.sha256(result).digest()
    return result.hex()[:16]

async def download(item_id: int) -> bytes:
    """I/O-bound: simulate download."""
    await asyncio.sleep(0.2)
    return b"x" * 500_000  # 500KB blob

async def upload(item_id: int, result: str) -> bool:
    """I/O-bound: simulate upload."""
    await asyncio.sleep(0.1)
    return True

async def pipeline(workers: int):
    loop = asyncio.get_event_loop()
    executor = ProcessPoolExecutor(max_workers=workers)
    # TODO: run all 20 items through download → process → upload
    # TODO: time each stage, print results
    pass

asyncio.run(pipeline(workers=4))
```

**When you're done:**
```
=== Pipeline (4 workers) ===
Stage 1 Download:  0.20s (20 concurrent)
Stage 2 Process:   Xs   (4 processes)
Stage 3 Upload:    0.10s (20 concurrent)
Total:             Xs

=== Sequential baseline ===
Total: Ys

Speedup: Zx
Downloaded: 20, Processed: 20, Uploaded: 20
```

**Stuck?** Ask AI: "In Python asyncio with ProcessPoolExecutor, how do I process a list of results from the first stage using `loop.run_in_executor` with multiple worker processes, then feed all results into a third async stage? Show me how to use `asyncio.gather` for both async stages and the executor for the CPU stage."

---

## Quick Check Answers

**1. Four threads doing CPU-heavy math — speedup vs 1 thread:**
Approximately 1x — no speedup. The GIL prevents all four threads from executing Python bytecode simultaneously. Only one thread holds the GIL at a time. The other three wait. With four threads doing CPU work, you get the same throughput as one thread, plus overhead from context switching and GIL acquisition/release. You might even see 0.9x (slight slowdown) due to contention.

**2. Four processes doing CPU-heavy math — speedup vs 1 process:**
Approximately 3-4x on a 4-core machine. Each process has its own interpreter with its own GIL. All four processes can run Python bytecode simultaneously on four separate CPU cores. The speedup is not exactly 4x due to: process creation overhead, OS scheduling, and tasks that don't evenly divide work.

**3. GIL during HTTP request wait — False:**
The GIL is released during I/O system calls. When Python's socket code calls `recv()` (or `sleep()`), it releases the GIL before the system call. Other Python threads can run while the first thread waits for the network response. This is why threads are effective for I/O-bound work — the GIL is not held during the waiting.

**4. Process overhead vs thread overhead:**
Process creation requires: forking (copy of the entire process memory), initializing a new Python interpreter, importing modules, and establishing inter-process communication. This takes 50-200ms. Thread creation is much cheaper: a new stack (a few MB) and a new OS thread, sharing the same interpreter and memory. For a task that takes 1ms, the 100ms process creation cost makes it 100x slower than just running it in the calling thread. ProcessPoolExecutor amortizes this by keeping processes alive (a "pool") — but the first set of tasks still pays the startup cost.
