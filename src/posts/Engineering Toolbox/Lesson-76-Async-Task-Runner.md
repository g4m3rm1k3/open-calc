# Lesson 76: Concurrency Without Threads — an `asyncio` Task Runner

**What you will build:** an `AsyncTaskRunner` class — the same
"fixed-size pool of workers pulling from a shared queue" shape as
Lesson 74's `ThreadPool`, rebuilt entirely with `async`/`await` and no
OS threads at all. The working feature is the same: many jobs, run
concurrently, across a small number of workers. The transferable
problem: Lesson 74 got concurrency by handing work to *multiple
threads*, each with its own OS-managed stack. `asyncio` gets
concurrency a completely different way — one single thread,
*cooperatively* switching between tasks at points those tasks
explicitly agree to pause — and that difference in mechanism has real,
concrete consequences this lesson makes visible, not just states.

**What you need to know first:** Lesson 74 (threads, race conditions,
`Lock`, `queue.Queue`, thread pool) — every structural comparison in
this lesson is made directly against that lesson's `ThreadPool`, so
its shape needs to be fresh, not just its vocabulary.

---

## Concept Unit: The Coroutine — a Function That Doesn't Run When Called

### The Problem

Every function used so far, called anywhere in this curriculum, has
run immediately when called. `asyncio`'s entire model depends on a
different kind of function — one that, when called, doesn't run yet at
all, just creates something that *can* be run later, under the control
of something else.

### The New Code

```python
import asyncio

async def say_hello():
    print("about to sleep")
    await asyncio.sleep(1)
    print("done sleeping")

result = say_hello()   # calling it does NOT run the body
print(type(result))

asyncio.run(result)    # THIS is what actually runs it
```

### Run It

```
<class 'coroutine'>
about to sleep
done sleeping
```

Notice the order: `<class 'coroutine'>` prints *before* either
`"about to sleep"` or `"done sleeping"` — proof that calling
`say_hello()` didn't run any of its body at all; it only built an
object of a new type.

### Mechanical Walkthrough

- `async def say_hello():` — **first appearance of `async def`.**
  Syntactically almost identical to an ordinary `def`, but this one
  keyword changes what calling the function actually does entirely.
- `result = say_hello()` — calling an `async def` function does not
  execute its body. It immediately returns a **coroutine object** —
  confirmed by `type(result)` printing `<class 'coroutine'>` — which
  is best understood as a paused, not-yet-started plan for a
  computation, not the computation itself.
- `await asyncio.sleep(1)` — **first appearance of `await`.** Inside
  an `async def` function, `await` is how one coroutine hands control
  to another awaitable operation and waits for it to complete — worth
  naming precisely what it is *not*: it does not block the entire
  program the way `time.sleep` does (proven directly in the next
  unit); it pauses only this specific coroutine, at this specific
  point, and — critically — the `await` keyword is not optional syntax
  sugar here; it's the actual point where this coroutine gives up
  control so something else could, in principle, run during the wait.
- `asyncio.run(result)` — **first appearance of `asyncio.run`.** This
  is what actually starts a coroutine executing, from the very first
  line of its body — everything printed after `<class 'coroutine'>`
  happens because of this call, not the earlier one.

### CS Lens

A function whose execution can be paused and resumed, rather than
running start-to-finish in one uninterrupted call, is called a
**coroutine**. Also recognized in: a generator function using `yield`
(a coroutine's simpler ancestor, already familiar if a "generate one
value, pause, resume on request" function has been written before),
a state machine that processes one event at a time and remembers where
it left off, and a video game's cutscene system that can be paused and
resumed exactly where it stopped.

---

## Concept Unit: `await` Alone Is Not Concurrency

### The Problem

It would be easy to assume that switching every blocking call to
`await asyncio.sleep(...)` automatically makes independent operations
run concurrently. It doesn't, on its own — `await`ing one coroutine
after another, in sequence, is still sequential.

### The New Code

```python
import asyncio
import time

async def fake_download(name, seconds):
    print(f"starting: {name}")
    await asyncio.sleep(seconds)
    print(f"finished: {name}")

async def main():
    start = time.perf_counter()
    await fake_download("file1.zip", 1)
    await fake_download("file2.zip", 1)
    await fake_download("file3.zip", 1)
    elapsed = time.perf_counter() - start
    print(f"Total time (sequential await): {elapsed:.2f}s")

asyncio.run(main())
```

### Run It

```
starting: file1.zip
finished: file1.zip
starting: file2.zip
finished: file2.zip
starting: file3.zip
finished: file3.zip
Total time (sequential await): 3.00s
```

Three seconds — exactly as sequential as three plain `time.sleep(1)`
calls would have been. `await` pauses *this* coroutine until the
awaited operation finishes and then resumes immediately afterward — it
doesn't, by itself, start the next `fake_download` any earlier than a
normal function call would have. Discarded now, but the exact lesson
it teaches — `await` in a row is not concurrency — is the entire
reason the next unit's tool exists.

### CS Lens

Confusing "this code can pause" with "this code automatically overlaps
with other code" is a genuinely common mistake with `async`/`await`
across many languages, not unique to Python. Worth stating precisely:
`await` grants the *opportunity* for something else to run during a
wait — it doesn't create that something else on its own. This unit
proves that distinction concretely rather than asserting it.

---

## Concept Unit: `asyncio.gather` — Real Concurrency

### The Problem

To actually run several coroutines concurrently — the entire point of
this lesson, the direct async counterpart to Lesson 74's
`threading.Thread` + `.start()` pattern — something needs to schedule
more than one of them at once, rather than awaiting them one at a time.

### The New Code

```python
async def main():
    start = time.perf_counter()
    await asyncio.gather(
        fake_download("file1.zip", 1),
        fake_download("file2.zip", 1),
        fake_download("file3.zip", 1),
    )
    elapsed = time.perf_counter() - start
    print(f"Total time (gathered): {elapsed:.2f}s")

asyncio.run(main())
```

### Run It

```
starting: file1.zip
starting: file2.zip
starting: file3.zip
finished: file1.zip
finished: file2.zip
finished: file3.zip
Total time (gathered): 1.00s
```

Three real seconds of sequential waiting compressed to one — the same
speedup Lesson 74 got from threads, achieved with a single thread the
entire time.

### Mechanical Walkthrough

- `asyncio.gather(fake_download(...), fake_download(...), fake_download(...))`
  — **first appearance of `gather`.** Takes multiple coroutine objects
  (each created by calling `fake_download(...)`, same as the previous
  unit — none of them run yet at the moment `gather` is called, same
  as `say_hello()` earlier) and schedules all of them to run
  concurrently, returning only once every single one has completed.
- `await asyncio.gather(...)` — the `gather` call itself is awaited
  exactly once, from `main`; this single `await` is what starts, runs,
  and waits for all three inner coroutines together, rather than three
  separate `await` statements running them one at a time.

### One Real Detail Worth Naming

Compare this run's print order — `starting`, `starting`, `starting`,
then `finished`, `finished`, `finished` — against Lesson 74's threaded
version of the exact same three downloads, whose actual output
interleaved unpredictably (`finished: file1.zip` could print between
two other `starting` lines, depending on OS thread scheduling).
`asyncio`'s output here is far more orderly, and that's not a
coincidence of this specific run — it's a structural consequence of
how `asyncio` works, covered directly in the next unit.

### CS Lens

Scheduling several paused computations to run in an interleaved
fashion, resuming each one only at its own explicit pause points, is
called **cooperative multitasking** — contrasted with the
**preemptive multitasking** threading relies on, where the operating
system can interrupt a thread at essentially any instruction, whether
that thread "agreed" to pause or not. This is the real mechanical
reason the print order above came out orderly: nothing can interrupt a
coroutine except its own `await` statements, so two `print` calls from
two different coroutines can never physically interleave mid-statement
the way two threads' prints sometimes can.

---

## Concept Unit: `asyncio.Queue` — the Same Interface, Every Operation Awaited

### The Problem

Lesson 74's `ThreadPool` needed a thread-safe queue to hand tasks
between threads. An async version needs the same kind of handoff
mechanism between coroutines — but a coroutine-based queue doesn't need
locks the way `queue.Queue` did, because only one coroutine ever
actually executes at a physical instant; it needs, instead, to
integrate with `await` itself.

### The New Code

```python
import asyncio

async def main():
    q = asyncio.Queue()
    await q.put("task1")
    await q.put("task2")
    print(await q.get())
    print(q.qsize())

asyncio.run(main())
```

### Run It

```
task1
1
```

### Mechanical Walkthrough

- `q = asyncio.Queue()` — same FIFO shape as `queue.Queue` from Lesson
  74, deliberately mirrored naming and interface (`put`, `get`,
  `qsize`).
- `await q.put("task1")` — **first appearance of an awaited queue
  operation.** `asyncio.Queue.put` is itself a coroutine, not an
  ordinary method — it must be awaited, even here where the queue is
  nowhere near full and the call completes instantly. This is a real,
  necessary difference from `queue.Queue.put`, which was never
  awaited in Lesson 74: an `asyncio.Queue` needs to cooperate with the
  event loop's scheduling even for operations that don't actually
  need to wait for anything, because *every* interaction point between
  coroutines and the loop happens through `await`.
- `await q.get()` — same reasoning; retrieving is awaited too, and —
  matching `queue.Queue.get`'s blocking behavior from Lesson 74 — if
  the queue were empty, this would pause the *calling coroutine*
  (not the whole program) until something was put.

This is discarded as a standalone lab now — the real project below
uses `asyncio.Queue` for exactly the same purpose Lesson 74's
`ThreadPool` used `queue.Queue` for: handing tasks to a fixed number of
workers.

### CS Lens

Rebuilding the same interface (`put`/`get`/`qsize`) under a different
concurrency model, rather than inventing new vocabulary, is a
deliberate design choice in `asyncio`'s own standard library — it
mirrors `threading`'s primitives closely (`asyncio.Lock` exists too,
with the same purpose as `threading.Lock`) specifically so concepts
transfer, even though the underlying mechanism (cooperative vs.
preemptive) is completely different.

---

## Concept Unit: The Async Task Runner

### The Problem

With coroutines, `gather`, and an async queue all in place, the same
"fixed number of workers pulling from a shared backlog" shape Lesson
74 built with real OS threads can be rebuilt with none at all — a
direct, side-by-side structural echo of `ThreadPool`, worth building
specifically to make the comparison concrete rather than abstract.

### Project Change

- **Reference Source:** Lesson 74's `ThreadPool` class — this project
  deliberately mirrors its structure (`submit`, a worker loop pulling
  from a queue, a sentinel-based shutdown) method for method, so the
  two can be compared directly rather than described as merely
  "similar."
- **Files affected:** `async_runner.py` (new file).
- **Change type:** add (new file; structurally parallel to, but not
  literally copied from, `threadpool.py`).
- **Location:** n/a — brand-new file.
- **Dependencies:** `asyncio.Queue`, `asyncio.gather`.

### The New Code

```python
class AsyncTaskRunner:
    def __init__(self, num_workers):
        self.tasks = asyncio.Queue()
        self.num_workers = num_workers

    async def _worker(self, worker_id):
        while True:
            task = await self.tasks.get()
            if task is None:
                self.tasks.task_done()
                break
            coro_func, args = task
            await coro_func(*args)
            self.tasks.task_done()

    def submit(self, coro_func, *args):
        self.tasks.put_nowait((coro_func, args))

    async def run(self):
        workers = [asyncio.create_task(self._worker(i)) for i in range(self.num_workers)]
        for _ in range(self.num_workers):
            await self.tasks.put(None)
        await asyncio.gather(*workers)
```

### Run It

```python
>>> import asyncio, time
>>> from async_runner import AsyncTaskRunner
>>> async def job(name, seconds):
...     print(f"starting {name}")
...     await asyncio.sleep(seconds)
...     print(f"finished {name}")
>>> async def main():
...     runner = AsyncTaskRunner(num_workers=3)
...     for i in range(6):
...         runner.submit(job, f"job-{i}", 0.5)
...     start = time.perf_counter()
...     await runner.run()
...     print(f"Total time: {time.perf_counter()-start:.2f}s")
>>> asyncio.run(main())
```

```
starting job-0
starting job-1
starting job-2
finished job-0
starting job-3
finished job-1
starting job-4
finished job-2
starting job-5
finished job-3
finished job-4
finished job-5
Total time: 1.00s (6 jobs x 0.5s each, 3 workers)
```

Six jobs, three workers, one second total — the exact same timing
Lesson 74's `ThreadPool` produced for the identical workload, achieved
with zero OS threads.

### Mechanical Walkthrough — Compared Directly to `ThreadPool`

- `def __init__(self, num_workers): self.tasks = asyncio.Queue(); self.num_workers = num_workers`
  — **a real, deliberate difference from `ThreadPool.__init__`**:
  `ThreadPool` started its worker *threads* immediately, inside
  `__init__`, because `threading.Thread.start()` can be called any
  time. `AsyncTaskRunner` cannot do the equivalent here — starting a
  coroutine requires a running event loop, and `__init__` (an ordinary
  `def`, not `async def`, since Python doesn't support async
  constructors) has no event loop to schedule anything onto yet.
  Workers only get created once `run()` is awaited.
- `async def _worker(self, worker_id): while True: task = await self.tasks.get(); ...`
  — the loop body is structurally identical to `ThreadPool._worker_loop`
  — same sentinel check (`if task is None: ... break`), same
  unpack-and-call pattern (`coro_func, args = task; await coro_func(*args)`,
  the async counterpart of `func, args = task; func(*args)`) — the only
  difference is `async def` instead of `def`, and `await` in front of
  both the queue operations and the task call itself.
- `def submit(self, coro_func, *args): self.tasks.put_nowait((coro_func, args))`
  — **first appearance of `put_nowait`.** Unlike `await q.put(...)`
  from the previous unit's lab, `put_nowait` adds an item without
  needing to be awaited at all, and without the calling code needing
  to be inside a coroutine — this matters because `submit`, like
  `ThreadPool.submit`, is meant to be callable as an ordinary
  synchronous method, not something that itself requires `await`.
  (This works safely here specifically because the queue has no
  maximum size — `put_nowait` would raise an exception on a full
  bounded queue instead of waiting, a real edge case outside this
  lesson's scope.)
- `async def run(self): workers = [asyncio.create_task(self._worker(i)) for i in range(self.num_workers)]`
  — **first appearance of `asyncio.create_task`.** Calling
  `self._worker(i)` alone would only build a coroutine object, exactly
  like `say_hello()` did in the very first unit — it would not start
  running. `asyncio.create_task` is what actually schedules a
  coroutine to begin running *concurrently*, without needing to
  `await` it immediately — the async equivalent of `Thread(...).start()`
  from Lesson 74, creating three genuinely concurrent workers in one
  list comprehension.
- `for _ in range(self.num_workers): await self.tasks.put(None)` —
  the exact same "one sentinel per worker" logic as
  `ThreadPool.shutdown`, reappearing unchanged in reasoning: with 3
  workers, 3 sentinels guarantee every worker eventually sees one and
  exits its loop.
- `await asyncio.gather(*workers)` — **first appearance of `gather`
  used on already-created tasks, rather than bare coroutines.** This
  is the async equivalent of `ThreadPool.shutdown`'s final
  `for worker in self.workers: worker.join()` — waiting for every
  worker to actually finish before `run()` itself returns. The `*`
  unpacks the `workers` list into individual arguments, since `gather`
  takes each awaitable as a separate argument rather than a single
  list — already-established unpacking syntax, applied to a new
  situation.

### CS Lens

Rebuilding the exact same architectural pattern (fixed worker count,
shared queue, sentinel shutdown) under two entirely different
concurrency primitives — OS threads in Lesson 74, coroutines here — and
getting the same observable timing result, demonstrates something
worth stating plainly: **the pattern (thread pool / worker pool) is
independent of the underlying mechanism.** The choice of `threading`
vs. `asyncio` is an implementation decision about *how* concurrency is
achieved, not a decision about *what shape* the solution takes.

### SE Lens

This isn't a case where one approach is simply better — each has a
real cost the other doesn't. `ThreadPool` pays OS-level costs per
thread (memory for each thread's stack, kernel-level context-switching
overhead) but gets true parallelism on CPU-bound work across multiple
cores (once outside the GIL's limits, e.g. via `multiprocessing`, not
covered here). `AsyncTaskRunner` avoids all of that OS-level cost —
thousands of coroutines can exist cheaply where thousands of OS
threads would be prohibitively expensive — but, as the next section
shows concretely, it depends entirely on every single piece of code
running inside it actually cooperating by yielding control back at
`await` points; one piece of code that doesn't breaks the entire
model, not just itself.

---

## What Breaks Without This — A Blocking Call Inside a Coroutine

### The New Code

```python
import asyncio
import time

async def broken_download(name, seconds):
    print(f"starting: {name}")
    time.sleep(seconds)   # BROKEN: blocking call inside an async function
    print(f"finished: {name}")

async def main():
    start = time.perf_counter()
    await asyncio.gather(
        broken_download("file1.zip", 1),
        broken_download("file2.zip", 1),
        broken_download("file3.zip", 1),
    )
    elapsed = time.perf_counter() - start
    print(f"Total time: {elapsed:.2f}s")

asyncio.run(main())
```

### Run It

```
starting: file1.zip
finished: file1.zip
starting: file2.zip
finished: file2.zip
starting: file3.zip
finished: file3.zip
Total time: 3.00s
```

Back to fully sequential — three seconds, not one — with the exact
same `gather` call this lesson used a moment ago to get real
concurrency. Nothing about `gather` changed; the one line that changed
is `time.sleep(seconds)` in place of `await asyncio.sleep(seconds)`.

### Why This Happens

`time.sleep` is a genuinely blocking call — it doesn't hand control
back to anything; it simply halts the one thread it's running on for
the full duration, and `asyncio`'s entire model runs on exactly *one*
thread. When `broken_download`'s first call reaches `time.sleep(1)`,
there is no `await` there to hand control back to the event loop — so
the event loop itself is frozen for that full second, unable to make
progress on the other two `broken_download` calls that `gather`
scheduled, even though they were scheduled and ready to run. Compare
this precisely against Lesson 74's threading model: a blocking
`time.sleep` inside a *thread* doesn't freeze other threads, because
the operating system, not the sleeping thread itself, decides when to
switch — that's exactly what "preemptive" meant in the earlier
concept unit. `asyncio`'s cooperative model has no such external
referee; a coroutine that doesn't `await` is a coroutine that never
gives anyone else a turn.

### CS Lens

A single non-cooperating operation stalling an entire cooperative
scheduler is sometimes called **blocking the event loop** — a failure
mode with no equivalent in preemptive threading, and one of the most
common real mistakes when first working with `asyncio`: calling an
ordinary, well-tested, perfectly correct *synchronous* library function
(a blocking database driver, a blocking HTTP request via `requests`
instead of an async HTTP client, even significant CPU-bound computation
with no `await` points inside it at all) from inside a coroutine
silently degrades an entire async application back to fully
sequential — with no exception raised, no warning, just three seconds
where one was expected.

## Exercises

- Add a `results` list to `AsyncTaskRunner`, collected via
  `asyncio.gather`'s own return value (it returns a list of each
  awaitable's result, in order) rather than requiring a separate
  locking mechanism the way Lesson 74's threaded version would have.
  Notice this is genuinely simpler here — explain why, referencing
  cooperative vs. preemptive scheduling.
- Time `AsyncTaskRunner` against `ThreadPool` on the exact same
  workload (6 jobs, 0.5s each, 3 workers) and confirm the timings
  match — then try 1,000 jobs of 0.01s each across 50 "workers" in
  both, and compare how each approach's underlying resource cost
  differs even when the timing is similar.
- Research `asyncio.to_thread` (or `loop.run_in_executor`) — the
  sanctioned way to call a genuinely blocking function from inside a
  coroutine without freezing the event loop — and use it to fix
  `broken_download` without switching back to `time.sleep`.
- Build a version of `AsyncTaskRunner.run` that uses
  `asyncio.wait_for` to enforce a per-task timeout, cancelling any
  single job that runs longer than a given duration without affecting
  the other concurrently running jobs.

## Definition of Done

- [ ] Confirmed for real that calling an `async def` function returns
      a coroutine object without running its body — the
      `<class 'coroutine'>` print appearing *before* any of the
      function's own output.
- [ ] The sequential-`await`-vs-`gather` timing contrast (3.00s vs
      1.00s) reproduced on your own machine, on the same three
      downloads.
- [ ] `AsyncTaskRunner` implemented and run with the same 6-jobs/
      3-workers trace as this lesson's `ThreadPool` comparison,
      confirming matching ~1.00s timing.
- [ ] The blocking-call failure reproduced for real — confirming
      `time.sleep` inside a coroutine silently serializes concurrent
      work that `await asyncio.sleep` would have overlapped.
- [ ] Can explain out loud, without looking at the code, the one-line
      difference between `AsyncTaskRunner.__init__` not starting its
      workers immediately and `ThreadPool.__init__` doing exactly
      that.
- [ ] Committed, with a message explaining *why* — e.g. `"Async task
      runner: the same worker-pool pattern as the thread pool, built
      on cooperative coroutines instead of OS threads, and why a
      blocking call inside one freezes all of them"` — not `"add
      async_runner.py"`.
