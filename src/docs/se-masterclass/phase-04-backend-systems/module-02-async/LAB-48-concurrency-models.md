# SE Masterclass — LAB-48 — Concurrency Models

**Language: Python** — same module as LAB-47, contrasting Python's model against LAB-47's JavaScript event loop.

**Prerequisites:** LAB-47 (Async and Promises — this lab studies TWO more concurrency models Python offers beyond that single-threaded event loop, plus explains a constraint JavaScript never has to deal with: the GIL).

**What this lab adds:**
- Concurrency (dealing with many things, interleaved) vs. parallelism (doing many things, literally simultaneously) — genuinely different
- Python's GIL (Global Interpreter Lock) — why `threading` doesn't give CPU-bound code real parallelism
- `multiprocessing` — genuine parallelism, by using separate PROCESSES instead of threads
- `asyncio` — Python's own version of LAB-47's event loop, for I/O-bound concurrency

**Time:** 90–110 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Two chefs sharing ONE stove, taking turns, vs. two chefs each with their OWN stove. Which is concurrency, and which is parallelism?
> 2. Why would `threading` fail to speed up a CPU-heavy calculation (like computing primes), even with 4 threads on a 4-core machine?
> 3. `asyncio` and `threading` are BOTH ways to handle "many things at once" in Python. Why does `asyncio` need `await` everywhere, but `threading` doesn't need special syntax at all?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running the various scripts shows:

```
=== CPU-Bound Work: Sync Baseline ===
sync (1 worker): 2.41s for 4 x 5,000,000-count loops

=== CPU-Bound Work: Threading (GIL-limited) ===
threading (4 threads): 2.53s for the SAME 4 loops
  ← NO speedup — the GIL lets only ONE thread run Python bytecode at a time

=== CPU-Bound Work: Multiprocessing (real parallelism) ===
multiprocessing (4 processes): 0.68s for the SAME 4 loops
  ← ~3.5x speedup — 4 separate processes, 4 separate GILs, genuinely parallel

=== I/O-Bound Work: Threading Helps Here ===
sync (1 worker): 4.02s for 4 x 1-second "network calls"
threading (4 threads): 1.01s for the SAME 4 calls
  ← threading DOES help for I/O — the GIL is released while waiting on I/O

=== I/O-Bound Work: asyncio (Python's Event Loop) ===
asyncio (4 concurrent coroutines): 1.00s for the SAME 4 calls
  ← same speedup as threading, but with ONE thread instead of 4
```

---

### Concept: Concurrency vs. Parallelism

**What it is:** **Concurrency** means dealing with multiple things by INTERLEAVING them — switching attention between them, possibly on a single worker. **Parallelism** means doing multiple things LITERALLY AT THE SAME INSTANT, requiring multiple actual workers (CPU cores). Concurrency is about STRUCTURE; parallelism is about SIMULTANEOUS EXECUTION. You can have one without the other.

**Canonical example:** One chef, cooking 3 dishes by switching between them (stir the soup, chop vegetables, check the oven, back to the soup) — CONCURRENT, not parallel; only one thing happens at any INSTANT, but multiple things make PROGRESS over time. Three chefs, each with their own stove, cooking simultaneously — PARALLEL.

**Project Application (The "Why" here):** LAB-47's event loop is CONCURRENCY without parallelism — ONE thread, interleaving many pending operations. This lab's `multiprocessing` is genuine PARALLELISM.

---

## Step 1 — CPU-Bound Work: The Baseline

```python
# cpu_bound.py
import time

def count_to(n):
    count = 0
    for _ in range(n):
        count += 1
    return count

def sync_baseline():
    start = time.time()
    for _ in range(4):
        count_to(5_000_000)
    print(f"sync (1 worker): {time.time() - start:.2f}s for 4 x 5,000,000-count loops")

if __name__ == '__main__':
    print("=== CPU-Bound Work: Sync Baseline ===")
    sync_baseline()
```

### SAVE AND TRY

```bash
python cpu_bound.py
```

**Expected (exact timing varies by machine):**
```
=== CPU-Bound Work: Sync Baseline ===
sync (1 worker): 2.41s for 4 x 5,000,000-count loops
```

---

### Concept: The GIL — Why Python Threads Don't Parallelize CPU Work

**What it is:** Python's **Global Interpreter Lock (GIL)** allows only ONE thread to execute Python BYTECODE at any given instant, even on a multi-core machine, even with multiple `threading.Thread` objects created. This is a deliberate design choice in CPython (the standard Python implementation) that simplifies memory management, at the cost of true CPU parallelism within threads.

**The problem this causes:** Spinning up 4 threads to do 4 independent CPU-heavy calculations does NOT get you 4x the speed — the GIL forces them to take turns, exactly like Step 1's chef metaphor, EVEN THOUGH you have 4 real CPU cores sitting idle.

---

## Step 2 — Threading Fails to Speed Up CPU-Bound Work

```python
# cpu_bound_threading.py
import threading
import time
from cpu_bound import count_to

def threading_version():
    start = time.time()
    threads = [threading.Thread(target=count_to, args=(5_000_000,)) for _ in range(4)]
    for t in threads: t.start()
    for t in threads: t.join()
    print(f"threading (4 threads): {time.time() - start:.2f}s for the SAME 4 loops")
    print("  ← NO speedup — the GIL lets only ONE thread run Python bytecode at a time")

if __name__ == '__main__':
    print("\n=== CPU-Bound Work: Threading (GIL-limited) ===")
    threading_version()
```

### SAVE AND TRY

```bash
python cpu_bound_threading.py
```

**Expected (roughly the SAME time as Step 1, not 1/4 of it):**
```
=== CPU-Bound Work: Threading (GIL-limited) ===
threading (4 threads): 2.53s for the SAME 4 loops
  ← NO speedup — the GIL lets only ONE thread run Python bytecode at a time
```

**Confirm this is the GIL, not a bug in the code:** 4 threads were genuinely created and genuinely run CONCURRENTLY (LAB-47's sense — interleaved) — but because the GIL only lets ONE of them execute Python bytecode at any instant, the TOTAL CPU work done is unchanged, and often SLIGHTLY SLOWER than the sync version due to the overhead of switching between threads. This is a real, well-known Python limitation — not a mistake you made.

---

## Step 3 — Multiprocessing: Real Parallelism

```python
# cpu_bound_multiprocessing.py
import multiprocessing
import time
from cpu_bound import count_to

def multiprocessing_version():
    start = time.time()
    processes = [multiprocessing.Process(target=count_to, args=(5_000_000,)) for _ in range(4)]
    for p in processes: p.start()
    for p in processes: p.join()
    print(f"multiprocessing (4 processes): {time.time() - start:.2f}s for the SAME 4 loops")
    print("  ← ~3.5x speedup — 4 separate processes, 4 separate GILs, genuinely parallel")

if __name__ == '__main__':
    print("\n=== CPU-Bound Work: Multiprocessing (real parallelism) ===")
    multiprocessing_version()
```

### SAVE AND TRY

```bash
python cpu_bound_multiprocessing.py
```

**Expected (roughly 1/4 of Step 1's time, on a 4+ core machine):**
```
=== CPU-Bound Work: Multiprocessing (real parallelism) ===
multiprocessing (4 processes): 0.68s for the SAME 4 loops
  ← ~3.5x speedup — 4 separate processes, 4 separate GILs, genuinely parallel
```

**Confirm WHY this bypasses the GIL:** Each `multiprocessing.Process` is a COMPLETELY SEPARATE operating-system process, with its OWN Python interpreter, its OWN memory space, and CRUCIALLY its OWN GIL — there is no SHARED lock forcing them to take turns, because there's nothing shared between them at all (which is also why passing data between processes is more expensive and more restricted than between threads — LAB-08's space-time trade-off, applied here as a genuine "more parallelism, less easy sharing" trade-off).

---

## Step 4 — I/O-Bound Work: Where Threading DOES Help

```python
# io_bound.py
import time
import threading

def fake_network_call():
    time.sleep(1)     # ← simulates waiting on I/O — the GIL is RELEASED during this wait

def sync_version():
    start = time.time()
    for _ in range(4):
        fake_network_call()
    print(f"sync (1 worker): {time.time() - start:.2f}s for 4 x 1-second \"network calls\"")

def threading_version():
    start = time.time()
    threads = [threading.Thread(target=fake_network_call) for _ in range(4)]
    for t in threads: t.start()
    for t in threads: t.join()
    print(f"threading (4 threads): {time.time() - start:.2f}s for the SAME 4 calls")
    print("  ← threading DOES help for I/O — the GIL is released while waiting on I/O")

if __name__ == '__main__':
    print("=== I/O-Bound Work: Threading Helps Here ===")
    sync_version()
    threading_version()
```

### SAVE AND TRY

```bash
python io_bound.py
```

**Expected:**
```
=== I/O-Bound Work: Threading Helps Here ===
sync (1 worker): 4.02s for 4 x 1-second "network calls"
threading (4 threads): 1.01s for the SAME 4 calls
  ← threading DOES help for I/O — the GIL is released while waiting on I/O
```

**Confirm the crucial distinction from Step 2:** `time.sleep(1)` (simulating waiting on a network response) RELEASES the GIL while waiting — Python KNOWS the thread isn't doing any actual bytecode execution during a sleep/I/O wait, so it lets OTHER threads run during that idle time. This is precisely why threading helps for I/O-BOUND work (waiting on something external) but NOT for CPU-BOUND work (Step 2, where every thread is constantly, actively executing bytecode, with no idle gaps for the GIL to hand off during).

---

## Step 5 — asyncio: Python's Own Event Loop

```python
# io_bound_asyncio.py
import asyncio
import time

async def fake_network_call_async():
    await asyncio.sleep(1)          # ← non-blocking sleep — LAB-47's exact concept, Python's syntax

async def asyncio_version():
    start = time.time()
    await asyncio.gather(                       # ← LAB-47's Promise.all, Python's name for it
        fake_network_call_async(),
        fake_network_call_async(),
        fake_network_call_async(),
        fake_network_call_async(),
    )
    print(f"asyncio (4 concurrent coroutines): {time.time() - start:.2f}s for the SAME 4 calls")
    print("  ← same speedup as threading, but with ONE thread instead of 4")

if __name__ == '__main__':
    print("\n=== I/O-Bound Work: asyncio (Python's Event Loop) ===")
    asyncio.run(asyncio_version())
```

### SAVE AND TRY

```bash
python io_bound_asyncio.py
```

**Expected:**
```
=== I/O-Bound Work: asyncio (Python's Event Loop) ===
asyncio (4 concurrent coroutines): 1.00s for the SAME 4 calls
  ← same speedup as threading, but with ONE thread instead of 4
```

**Confirm `asyncio.gather` is LITERALLY LAB-47's `Promise.all`:** Both start MULTIPLE independent async operations at the same moment and wait for ALL to complete, with total time bounded by the SLOWEST one — the exact same concurrency PATTERN, just Python's syntax (`await`, `asyncio.sleep`, coroutines defined with `async def`) instead of JavaScript's (`await`, native `Promise`s). Python's `asyncio` achieves the SAME I/O speedup as `threading` (Step 4) but with only ONE thread — no GIL contention issue exists at all, because there's only ever one thread trying to run bytecode.

---

## 🎯 Challenge: When to Use Which

**You know:** Threading helps for I/O-bound work but not CPU-bound work (the GIL). Multiprocessing helps for CPU-bound work (bypasses the GIL) but has more overhead. Asyncio helps for I/O-bound work with less overhead than threading (one thread, not many).

**Task:** For each scenario, decide: threading, multiprocessing, or asyncio? Justify in one sentence.

1. A web scraper making 1,000 HTTP requests to different sites.
2. Resizing 500 large images (pure CPU/memory work, no network).
3. A web server handling thousands of simultaneous slow client connections.

<details>
<summary>▶ Show Solution</summary>

1. **asyncio** (or threading) — this is I/O-bound (waiting on network responses), and asyncio's single-thread efficiency scales BEST to very high counts (1,000 concurrent connections) without the memory overhead of 1,000 OS threads.
2. **multiprocessing** — pure CPU work, the GIL would block ANY threading-based speedup entirely (Step 2's exact demonstration); only separate processes, each with their own GIL, deliver real parallel speedup here.
3. **asyncio** — this is EXACTLY what async event loops (LAB-47's Node.js model, this lab's Python model) were purpose-built for: many slow, mostly-idle, I/O-bound connections, handled efficiently by ONE thread that's never blocked, rather than needing one OS thread per connection (which becomes memory-prohibitive at scale).

**Key insight:** The right tool depends ENTIRELY on whether the bottleneck is CPU (needs real parallelism — multiprocessing) or I/O/waiting (needs concurrency, not necessarily parallelism — asyncio or threading). Guessing wrong doesn't just under-perform; using threading for CPU-bound work (Step 2) can be actively WORSE than doing nothing extra at all, due to thread-switching overhead with zero compensating benefit.

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| The GIL | Why Python web servers (Flask, Django) often run MULTIPLE processes (via Gunicorn workers), not just threads |
| `multiprocessing` | NumPy/Pandas operations that release the GIL internally, or explicit worker pools for CPU-heavy tasks |
| `asyncio` | FastAPI (LAB-45) is built on `asyncio` under the hood — this is WHY `async def` route handlers work efficiently |
| LAB-47's event loop vs. this lab's `asyncio` | Same underlying idea, two different language ecosystems |

**Where you will see this again:** LAB-49 (Queues and Workers) uses MULTIPROCESSING or separate worker PROCESSES for genuinely parallel background job execution — directly building on this lab's "CPU-bound work needs processes, not threads" lesson.

---

## Final Check

| Feature | How to verify |
|---|---|
| Threading shows NO speedup for CPU-bound work (the GIL) | Step 2 |
| Multiprocessing shows REAL speedup for the same CPU-bound work | Step 3 |
| Threading DOES show speedup for I/O-bound work | Step 4 |
| Asyncio matches threading's I/O speedup, using only one thread | Step 5 |
| You can correctly classify three real scenarios by which model fits | Challenge |
| You can explain, without notes, why the GIL only matters for CPU-bound, not I/O-bound work | Step 4's Concept box |

---

## Quick Check Answers

**1. Two chefs sharing one stove vs. two chefs with separate stoves — which is which?**

Sharing ONE stove, taking turns, is CONCURRENCY — both dishes make progress over time, but never literally at the same instant. Two chefs with SEPARATE stoves is PARALLELISM — genuinely simultaneous work. This lab's `threading` (Step 2, for CPU work) is the shared-stove case (the GIL forces turn-taking); `multiprocessing` (Step 3) is the separate-stoves case (each process has its own resources).

**2. Why doesn't threading speed up CPU-heavy work, even on a 4-core machine?**

The GIL allows only ONE thread to execute Python bytecode at any instant, REGARDLESS of how many CPU cores are physically available — demonstrated directly in Step 2, where 4 threads doing CPU-bound counting took roughly the SAME time as doing them one after another, because the GIL forced them to take turns rather than genuinely run in parallel, leaving 3 of the 4 cores idle the entire time.

**3. Why does asyncio need `await` everywhere, but threading doesn't need special syntax?**

`asyncio` uses COOPERATIVE scheduling — a coroutine must EXPLICITLY yield control (via `await`) at points where it's willing to let other coroutines run; without `await`, a coroutine runs to completion uninterrupted, blocking everything else. `threading`, by contrast, uses PREEMPTIVE scheduling — the operating system (or Python's interpreter, subject to the GIL) can interrupt a thread at ANY point to let another thread run, without that thread needing to explicitly signal "you can switch now." This is why `asyncio` code needs to be written with cooperation in mind (special syntax, explicit yield points) while ordinary threaded code looks like normal, sequential Python.

---

*Next: [LAB-49 — Queues and Workers](LAB-49-queues-and-workers.md) — Python, same module*
