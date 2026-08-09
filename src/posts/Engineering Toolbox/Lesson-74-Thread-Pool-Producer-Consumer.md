# Lesson 74: Doing More Than One Thing at Once, Safely — Threads, Races, and a Thread Pool

**What you will build:** a `ThreadPool` class that runs a fixed number
of worker threads pulling tasks from a shared queue, plus the two
building blocks that make it safe: `threading.Lock` for protecting
shared state, and `queue.Queue` for handing work between threads
without racing. The working feature is a reusable pool that runs many
jobs across a small, fixed number of workers. The transferable
problem: running things concurrently is easy to *start*; running them
concurrently *without corrupting shared state* is a completely
different, much harder problem, and this lesson is about the gap
between those two.

**What you need to know first:** Lesson 18 (sockets) and the
scheduling half of Track 4 — this lesson assumes comfort with the idea
of a program doing real I/O-bound waiting (a network call, a sleep
standing in for one), which is exactly the situation where concurrency
actually pays off. Lesson 68's queue concept (FIFO: first in, first
out) reappears here too, though this lesson reaches for Python's own
`queue.Queue` — thread-safe by design — rather than rebuilding a queue
class a fourth time.

---

## Concept Unit: The Problem — Sequential Waiting Wastes Real Time

### The Problem

Some work is *waiting*, not *computing* — a network request, a disk
read, anything where the CPU sits idle until something external
finishes. Running several such tasks one after another means paying
for all their waiting time, added up, even though the CPU was free to
do something else during every single one of those waits.

### The New Code

```python
import time

def fake_download(name, seconds):
    time.sleep(seconds)   # standing in for a slow network request
    print(f"finished: {name}")

start = time.perf_counter()
fake_download("file1.zip", 1)
fake_download("file2.zip", 1)
fake_download("file3.zip", 1)
elapsed = time.perf_counter() - start
print(f"Total time (sequential): {elapsed:.2f}s")
```

### Run It

```
finished: file1.zip
finished: file2.zip
finished: file3.zip
Total time (sequential): 3.00s
```

Three one-second waits, run one after another, cost three full
seconds — exactly what you'd expect, and exactly the cost this lesson
exists to avoid. Discarded now; the next unit runs the same three
calls a genuinely different way.

### CS Lens

Work that spends most of its time waiting on something external,
rather than computing, is called **I/O-bound** — as opposed to
**CPU-bound** work (heavy computation, no waiting). This distinction
matters enormously for what follows: threading, as this lesson uses
it, is a strong fix for I/O-bound waiting specifically. It is *not* a
general fix for CPU-bound work in Python — a fact this lesson sets up
now and returns to explicitly at the end.

---

## Concept Unit: `threading.Thread` — Running Things at the Same Time

### The Problem

The three downloads above don't depend on each other at all — nothing
about `file2.zip` needs `file1.zip` to finish first. Running them
sequentially is a choice, not a requirement. Something is needed to
actually start more than one of them at once.

### The New Code

```python
import threading
import time

def fake_download(name, seconds):
    time.sleep(seconds)
    print(f"finished: {name}")

start = time.perf_counter()

t1 = threading.Thread(target=fake_download, args=("file1.zip", 1))
t2 = threading.Thread(target=fake_download, args=("file2.zip", 1))
t3 = threading.Thread(target=fake_download, args=("file3.zip", 1))

t1.start()
t2.start()
t3.start()

t1.join()
t2.join()
t3.join()

elapsed = time.perf_counter() - start
print(f"Total time (threaded): {elapsed:.2f}s")
```

### Run It

```
finished: file1.zip
finished: file2.zip
finished: file3.zip
Total time (threaded): 1.01s
```

Three real seconds of sequential waiting became just over one second —
the same three downloads, genuinely overlapping in time.

### Mechanical Walkthrough

- `threading.Thread(target=fake_download, args=("file1.zip", 1))` —
  **first appearance of `Thread`.** `target` is the function to run;
  `args` is a tuple of arguments to call it with — the thread doesn't
  run yet, this line only *creates* it.
- `t1.start()` — actually begins running `fake_download` on a separate
  thread of execution. Calling `.start()` on `t1`, `t2`, and `t3`
  before calling `.join()` on any of them is deliberate: this is what
  lets all three begin overlapping — starting one and immediately
  joining it before starting the next would be back to sequential
  behavior, just with extra ceremony.
- `t1.join()` — **first appearance of `.join()`.** Blocks the *calling*
  thread (the main program) until `t1` finishes. Called on all three,
  in order, after all three have already started — the main thread
  waits for each in turn, but since they're all already running
  concurrently by this point, the total wait is however long the
  *slowest* one takes, not the sum of all three.

### CS Lens

Starting several independent units of work and waiting for all of them
to finish, rather than running them one after another, is called
**concurrency** — and specifically, when it's genuinely happening at
the same instant on multiple CPU cores, **parallelism** (a related but
distinct term worth knowing apart: concurrency is about *structure* —
tasks that can overlap — parallelism is about *execution* — them
actually running simultaneously). Also recognized in: a web browser
loading a page's images, scripts, and stylesheets all at once instead
of one at a time, a build system compiling independent source files in
parallel, a restaurant kitchen with multiple cooks working different
dishes for the same table at once instead of one cook doing everything
in sequence.

---

## Concept Unit: The Race Condition

### The Problem

Threads overlapping in time is exactly what made the download example
faster — and exactly what makes *shared, mutable state* dangerous.
When two threads read and write the same variable without any
coordination, the order their individual steps actually interleave in
is not guaranteed, and the result can be silently wrong.

### The New Code

```python
import threading
import time

counter = 0

def increment_unsafely():
    global counter
    for _ in range(1000):
        current = counter       # read
        time.sleep(0)            # force a chance for another thread to run right here
        counter = current + 1    # write

threads = [threading.Thread(target=increment_unsafely) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(f"Expected: {4 * 1000}, Actual: {counter}")
```

### Run It

```
Expected: 4000, Actual: 1000
```

(Run again, and the actual number will likely differ again —
`1002`, `1000`, some other number below `4000` — never reliably
`4000`. That unpredictability is itself the point, not a bug in this
demonstration.)

### Mechanical Walkthrough

- `current = counter` then `counter = current + 1` — **deliberately
  split into two separate statements**, rather than writing `counter
  += 1` in one line. This split makes visible something that's true
  even of the single-line version, just harder to see: incrementing a
  variable is actually *two* operations under the hood — read the
  current value, then write back a new one — and nothing guarantees
  those two operations happen back-to-back with no other thread
  getting a turn in between.
- `time.sleep(0)` — **first appearance of a deliberate yield point.**
  Sleeping for zero seconds still hands control back to Python's
  thread scheduler, giving another thread a real chance to run before
  this one continues. This line is added purely to make the race
  reliably visible for this lesson — in real, unguarded code, the same
  danger exists with no `sleep(0)` needed at all; a thread can be
  interrupted between *any* two bytecode-level steps, including the
  ones inside a plain `counter += 1`, whether or not a sleep call
  gives it an obvious opening.

### Execution Trace — Why the Count Comes Out Low

1. Thread A reads `counter` → gets `0`.
2. Before Thread A writes back `1`, the scheduler switches to Thread
   B, which also reads `counter` → also gets `0` (Thread A's write
   hasn't happened yet).
3. Thread A resumes, writes `counter = 0 + 1` → `counter` is now `1`.
4. Thread B resumes with its *already-read* `current = 0`, writes
   `counter = 0 + 1` → `counter` is *still* `1` — Thread B's
   increment was completely lost, even though both threads genuinely
   ran an increment.

Two increments happened; only one is reflected in the final value.
Multiply this by thousands of iterations across four threads, and the
final count ends up far below the `4000` that four threads each
incrementing `1000` times, uncorrupted, would produce.

### CS Lens

This exact failure — the correctness of a result depending on the
unpredictable *timing* of concurrent operations — is called a **race
condition**. Also recognized in: two people editing the same
spreadsheet cell at once and one edit silently overwriting the other,
two processes both checking "does this file exist?" before creating
it and both proceeding as if they're first, a double-spend attack in a
naively implemented payment system where two withdrawals both read the
same starting balance before either one's deduction is recorded.

### SE Lens

The scariest part of a race condition, worth naming explicitly: this
code runs *without error* every single time. No exception, no crash,
no stack trace — just a wrong number, and only *sometimes* wrong, and
wrong by a different, unpredictable amount each run. That
unpredictability is exactly why race conditions are notoriously hard
to catch in testing — a test suite might pass a hundred times and
still contain one.

---

## Concept Unit: `threading.Lock`

### The Problem

The race above happened because "read, then write" wasn't treated as
one indivisible step — another thread could always slip in between.
Something is needed to guarantee that a specific block of code runs to
completion, for one thread at a time, with no other thread allowed to
interleave partway through.

### Project Change

- **Reference Source:** No reference counterpart — this is a
  from-scratch addition, though the underlying idea (mutual exclusion)
  is the same one Lesson 68's dynamic array or Lesson 70's hash table
  never needed to worry about, because nothing in those lessons ran
  concurrently.
- **Files affected:** the same file as the race-condition lab, fixed
  in place.
- **Change type:** modify.
- **Location:** wrapping the read-then-write block inside
  `increment_unsafely`.
- **Dependencies:** none beyond the standard library.

### The New Code

```python
import threading
import time

counter = 0
lock = threading.Lock()

def increment_safely():
    global counter
    for _ in range(1000):
        with lock:
            current = counter
            time.sleep(0)
            counter = current + 1

threads = [threading.Thread(target=increment_safely) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(f"Expected: {4 * 1000}, Actual: {counter}")
```

### Run It

```
Expected: 4000, Actual: 4000
```

Run repeatedly, this is `4000` every single time — not because the
`time.sleep(0)` yield point stopped happening (it still runs, every
iteration), but because the lock now guarantees no other thread can
enter the same protected block while one thread is already inside it.

### Mechanical Walkthrough

- `lock = threading.Lock()` — **first appearance of `Lock`.** Created
  once, outside any thread, and shared by all four — a lock created
  fresh inside each thread would protect nothing, since each thread
  would be locking its own separate lock.
- `with lock:` — **first appearance of a lock used as a context
  manager.** Entering the `with` block acquires the lock — if another
  thread already holds it, this thread blocks here, waiting, until the
  lock is free. Everything indented inside the block — the read, the
  yield point, the write — now runs as one uninterruptible unit from
  the perspective of any *other* thread also trying to acquire the same
  lock. Leaving the block (even via an exception) automatically
  releases the lock — the same guaranteed-cleanup behavior already
  familiar from `with open(...)` for files.
- The read/write logic itself — `current = counter`,
  `time.sleep(0)`, `counter = current + 1` — is completely unchanged
  from the broken version. Nothing about *what* the code does was
  fixed; what changed is *who's allowed to run it at the same time*.

### CS Lens

A block of code that must run in full, by only one thread at a time,
is called a **critical section**, and a lock enforcing that is
providing **mutual exclusion**. Also recognized in: a single-occupancy
restroom's lock on the door, a database transaction's row-level lock
preventing two simultaneous updates to the same row, a git repository
refusing a second `push` while another is still being processed on the
remote.

### SE Lens

Locks fix races, but they're not free: a thread waiting on a lock is,
for that stretch, back to doing nothing — the exact cost concurrency
was meant to eliminate. A common, real mistake is locking too much
code (turning an entire function into one giant critical section,
serializing work that didn't actually need to be) rather than locking
only the specific shared-state operation that's actually unsafe. This
lesson's lock wraps exactly three lines — the minimum needed — on
purpose.

---

## Concept Unit: `queue.Queue` — Thread-Safe Handoff

### The Problem

A lock protects a single shared variable. Handing *work* between
threads — one thread producing tasks, another consuming them — needs
something more structured: a FIFO that's safe to `put` into and `get`
from concurrently, without the caller managing a lock by hand every
time.

### The New Code

```python
import queue

q = queue.Queue()
q.put("task1")
q.put("task2")
q.put("task3")

print(q.get())   # thread-safe FIFO -- no lock needed by the caller
print(q.get())
print(q.qsize())
```

### Run It

```
task1
task2
1
```

`queue.Queue` behaves like the FIFO already familiar from Lesson 68's
own queue and Lesson 71's `deque`-based BFS — first in, first out —
but with one crucial addition neither of those needed: every method
(`put`, `get`, `qsize`) is internally protected against concurrent
access, so multiple threads can call them at once without any race,
without the caller ever writing a `Lock` themselves. This is discarded
as a standalone lab now — the real project below builds on it
directly, not around it.

### CS Lens

A structure that handles its own internal locking, so callers get
correctness for free without managing synchronization themselves, is
called **thread-safe**. Also recognized in: Python's own `dict` and
`list` being thread-safe for individual single operations (though
*not* for compound ones like "check, then update," which is exactly
the trap the earlier race-condition lab fell into) — worth knowing
that thread-safety is a property of *specific operations*, not
something that transfers automatically to every use of a structure.

---

## Concept Unit: Producer and Consumer

### The Problem

With a thread-safe queue available, two threads can now safely
cooperate: one generating work, one processing it, without either one
needing to know or care about the other's exact timing.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `prodcons.py` (new file).
- **Change type:** add.
- **Location:** n/a — brand-new file.
- **Dependencies:** `queue.Queue` from the previous unit.

### The New Code

```python
def producer(q, count):
    for i in range(count):
        item = f"item-{i}"
        q.put(item)
        print(f"produced: {item}")
        time.sleep(0.1)

def consumer(q, count):
    for _ in range(count):
        item = q.get()
        print(f"consumed: {item}")
        q.task_done()
```

### Run It

```python
>>> import threading, queue
>>> from prodcons import producer, consumer
>>> q = queue.Queue()
>>> COUNT = 5
>>> t_producer = threading.Thread(target=producer, args=(q, COUNT))
>>> t_consumer = threading.Thread(target=consumer, args=(q, COUNT))
>>> t_producer.start()
>>> t_consumer.start()
>>> t_producer.join()
>>> t_consumer.join()
>>> print("all done, queue size:", q.qsize())
```

```
produced: item-0
consumed: item-0
consumed: item-1
produced: item-1
consumed: item-2
produced: item-2
consumed: item-3
produced: item-3
consumed: item-4
produced: item-4
all done, queue size: 0
```

### One Real Detail Worth Stopping For

Look closely: `consumed: item-1` printed *before* `produced: item-1`.
That's not a bug, and it's not the queue misbehaving — it's a genuine,
correct consequence of exactly where each `print` call sits relative
to the actual thread-safe operation. The producer's loop runs
`q.put(item)` *first*, then `print(f"produced: {item}")` — so the item
is genuinely available in the queue the instant `put` returns, one
full line *before* the producer even announces it. If the scheduler
switches to the consumer thread in that gap, the consumer can `get()`
the item and print its own "consumed" line before the producer's
thread gets back around to printing "produced." The queue's guarantee
was never about print statement ordering — only about `put`/`get`
themselves being race-free. This is worth sitting with as a concrete
reminder: thread-safety covers exactly the operations it's built for,
nothing else that happens to be nearby in the code.

### Mechanical Walkthrough

- `def producer(q, count):` — takes the shared queue as a parameter,
  rather than reaching for a global — already-established good
  practice, made slightly more important here because it makes
  explicit exactly what state this function touches.
- `q.put(item)` — thread-safe by construction, from the previous unit;
  no lock needed here, unlike the raw `counter` from two units ago.
- `def consumer(q, count):` `item = q.get()` — **first appearance of
  `Queue.get()`'s blocking behavior.** If the queue is empty when
  `get()` is called, it doesn't raise an error or return `None` — it
  *blocks*, waiting until something is available. This is what lets
  the consumer safely start before the producer has produced anything
  at all: it simply waits for the first item to exist.
- `q.task_done()` — **first appearance.** Signals back to the queue
  that a previously retrieved item has been fully processed — not
  required for the `get`/`put` mechanics to work correctly on their
  own, but it's what powers `Queue.join()` (a separate method from
  `Thread.join()`, not used yet here, covered in the next unit),
  which waits until every `put` item has had a matching `task_done`
  call.

### CS Lens

Decoupling "generates work" from "processes work" through a shared
buffer, so neither side needs to know the other's speed or timing, is
the **producer-consumer pattern**. Also recognized in: a web server's
request queue (accepting connections faster than it processes them,
buffered by the OS), a video streaming service's playback buffer
(downloading ahead of what's currently playing), a print spooler
(documents queued faster than the physical printer can produce pages).

---

## Concept Unit: The Thread Pool

### The Problem

One producer and one consumer is a start, but real workloads often
need *several* consumers working through a shared backlog at once —
and starting a brand-new thread for every single task, one at a time,
wastes the overhead of thread creation on tasks that could instead
share a small, fixed, reusable set of workers.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition, combining `Queue` (already built) with multiple
  simultaneous consumer threads (extending the single-consumer pattern
  from the previous unit to several at once).
- **Files affected:** `threadpool.py` (new file).
- **Change type:** add.
- **Location:** n/a — brand-new file.
- **Dependencies:** `queue.Queue`, `threading.Thread`.

### The New Code

```python
import threading
import queue


class ThreadPool:
    def __init__(self, num_workers):
        self.tasks = queue.Queue()
        self.workers = []
        for _ in range(num_workers):
            worker = threading.Thread(target=self._worker_loop)
            worker.start()
            self.workers.append(worker)

    def _worker_loop(self):
        while True:
            task = self.tasks.get()
            if task is None:      # sentinel: signals this worker to stop
                self.tasks.task_done()
                break
            func, args = task
            func(*args)
            self.tasks.task_done()

    def submit(self, func, *args):
        self.tasks.put((func, args))

    def shutdown(self):
        for _ in self.workers:
            self.tasks.put(None)   # one sentinel per worker
        for worker in self.workers:
            worker.join()
```

### Run It

```python
>>> import time, threading
>>> from threadpool import ThreadPool
>>> def task(name, seconds):
...     print(f"[{threading.current_thread().name}] starting {name}")
...     time.sleep(seconds)
...     print(f"[{threading.current_thread().name}] finished {name}")
>>> start = time.perf_counter()
>>> pool = ThreadPool(num_workers=3)
>>> for i in range(6):
...     pool.submit(task, f"job-{i}", 0.5)
>>> pool.shutdown()
>>> elapsed = time.perf_counter() - start
>>> print(f"Total time: {elapsed:.2f}s (6 jobs x 0.5s each, 3 workers)")
```

```
[Thread-2 (_worker_loop)] starting job-0
[Thread-1 (_worker_loop)] starting job-1
[Thread-3 (_worker_loop)] starting job-2
[Thread-3 (_worker_loop)] finished job-2
[Thread-3 (_worker_loop)] starting job-3
[Thread-1 (_worker_loop)] finished job-1
[Thread-1 (_worker_loop)] starting job-4
[Thread-2 (_worker_loop)] finished job-0
[Thread-2 (_worker_loop)] starting job-5
[Thread-1 (_worker_loop)] finished job-4
[Thread-2 (_worker_loop)] finished job-5
[Thread-3 (_worker_loop)] finished job-3
Total time: 1.00s (6 jobs x 0.5s each, 3 workers)
```

Six jobs, each taking half a second, run across three workers, finish
in **one second total** — two rounds of three concurrent jobs each —
instead of three full seconds run sequentially, or the overhead of
spinning up six separate threads for six separate jobs.

### Mechanical Walkthrough

- `def __init__(self, num_workers): self.tasks = queue.Queue(); self.workers = []`
  — a pool holds one shared task queue and a list of the worker
  threads it started, already-established container patterns.
- `for _ in range(num_workers): worker = threading.Thread(target=self._worker_loop); worker.start(); self.workers.append(worker)`
  — **first appearance of starting threads inside `__init__` itself.**
  Every worker starts running `_worker_loop` immediately upon pool
  creation — before a single task has even been submitted — because
  `_worker_loop`'s first action is to call `self.tasks.get()`, which
  simply blocks until work arrives, exactly like the single consumer
  from the previous unit.
- `def _worker_loop(self): while True: task = self.tasks.get(); ...`
  — **first appearance of an infinite loop as a worker's entire
  lifecycle.** Each worker doesn't process one task and stop — it
  loops forever, pulling one task after another from the shared
  queue, for as long as the pool exists.
- `if task is None: self.tasks.task_done(); break` — **first
  appearance of a sentinel value used for shutdown signaling**,
  reappearing the sentinel-node idea from Lesson 72's `LRUCache`, but
  applied here to *control flow* rather than list boundaries: `None`
  is never a real task, so its presence in the queue can only mean
  "stop." `task_done()` is still called even on the sentinel, matching
  every `get()` with exactly one `task_done()` regardless of what was
  retrieved.
- `func, args = task; func(*args)` — **first appearance of unpacking a
  task into a callable and its arguments, then calling it.**
  `self.submit` (below) packages a function and its arguments together
  as one tuple; `*args` here unpacks that tuple back out as individual
  positional arguments to `func` — the same star-unpacking already
  familiar from ordinary function calls, applied to a value pulled out
  of a queue instead of typed literally.
- `def submit(self, func, *args): self.tasks.put((func, args))` — the
  public entry point: bundles a function and its arguments as a single
  tuple and enqueues it — nothing here runs the function; it only
  schedules it for whichever worker gets to it next.
- `def shutdown(self): for _ in self.workers: self.tasks.put(None) ... for worker in self.workers: worker.join()`
  — **first appearance of a graceful, controlled shutdown.** Exactly
  one `None` sentinel is enqueued per worker — not one sentinel total
  — because each worker's own loop only checks for *one* sentinel
  before breaking; with three workers, three sentinels guarantee every
  worker eventually sees one and stops, no matter which worker happens
  to dequeue which sentinel. Only *after* all sentinels are queued does
  the method call `.join()` on every worker — reappearing `Thread.join`
  from the very first threading unit — waiting for every worker to
  actually finish, including finishing whatever real task it was mid-way
  through before it reaches its own sentinel.

### CS Lens

A small, fixed, reusable set of workers pulling from a shared backlog,
rather than one thread created and destroyed per task, is the **thread
pool** pattern. Also recognized in: a database connection pool
(reusing a fixed number of open connections instead of opening a new
one per query), a web server's worker process pool (Gunicorn, uWSGI,
and similar), and a restaurant kitchen again — a fixed number of cooks
working through an ever-refilling order queue, rather than hiring and
firing a new cook for every single dish.

### SE Lens

The sentinel-shutdown approach here is simple and correct, but has a
real limitation worth naming: `shutdown()` waits for *every* queued
task to be picked up and finished, including ones submitted right
before shutdown — there's no way to say "stop accepting new work but
let what's already running finish" versus "abandon everything queued
immediately." Real-world thread pools (including Python's own
`concurrent.futures.ThreadPoolExecutor`) offer exactly that distinction
as an option; this from-scratch version doesn't, on purpose, to keep
the sentinel mechanism itself clear and traceable.

---

## Connect the Pieces

```python
import time
import threading
from threadpool import ThreadPool

def task(name, seconds):
    print(f"[{threading.current_thread().name}] starting {name}")
    time.sleep(seconds)
    print(f"[{threading.current_thread().name}] finished {name}")

pool = ThreadPool(num_workers=3)
for i in range(6):
    pool.submit(task, f"job-{i}", 0.5)
pool.shutdown()
```

Every concept in this lesson shows up here at once: `ThreadPool.__init__`
starts real `threading.Thread`s (unit 2); each worker's `_worker_loop`
pulls from a `queue.Queue` (unit 5) that's safe precisely because
`Queue` handles its own internal locking (unit 4) so nothing here
needed a hand-written `Lock`; `submit` and the workers together form a
producer-consumer relationship (unit 6), just with several consumers
instead of one; and `shutdown`'s sentinel mechanism, plus the final
`worker.join()` calls, guarantee every task genuinely finishes before
the program considers itself done.

## What Breaks Without This

Remove the lock from the earlier counter example — restore
`increment_unsafely`'s unprotected version — and this lesson's very
first race-condition trace already showed exactly what breaks: a wrong
answer, with no error raised, differing unpredictably from run to run.
That failure mode — silently wrong, not loudly broken — is worth
carrying forward as the defining danger of concurrent code, more than
any single example here.

One further limitation, not a bug but a boundary worth stating
plainly: everything sped up in this lesson (`time.sleep`, standing in
for real I/O waiting) sped up because the CPU was sitting idle during
the wait, free for another thread to use. Try replacing `task`'s
`time.sleep(seconds)` with genuine CPU-bound work — a tight
number-crunching loop, no sleeping at all — and the "3 workers, 1
second instead of 3" speedup mostly disappears. That's not a bug in
this `ThreadPool`; it's **the Global Interpreter Lock (GIL)**, a real
CPython implementation detail that allows only one thread to execute
Python bytecode at a time, regardless of how many CPU cores are
available. Threading in Python is a genuine, correct fix for I/O-bound
waiting — proven throughout this lesson — but not for CPU-bound
computation; that's a different problem, usually reached for with
`multiprocessing` instead, outside this lesson's scope.

## Exercises

- Add a `results` list (protected by its own `Lock`, or built from a
  second `queue.Queue`) so `ThreadPool` can report each task's return
  value back to the caller, not just run it for its side effects.
- Deliberately remove the lock from the `counter` example and run it
  50 times in a loop, collecting the final `counter` value each time
  — confirm how often (if ever) it happens to still equal `4000` by
  chance, versus how often it doesn't.
- Add a `pending()` method to `ThreadPool` reporting how many tasks are
  still queued or in progress, using `self.tasks.qsize()` — and
  research why `qsize()` alone can't distinguish "queued" from
  "currently being processed by a worker."
- Compare this lesson's `ThreadPool` against Python's own
  `concurrent.futures.ThreadPoolExecutor` — submit the same six jobs
  to both and confirm the timing is comparable.

## Definition of Done

- [ ] `threading.Thread`, `.start()`, and `.join()` all used
      correctly, with the sequential-vs-threaded timing comparison
      (3.00s vs ~1.01s) reproduced on your own machine.
- [ ] The race condition reproduced for real — an `Actual` count below
      the `Expected` one, on your own run, not just read about — and
      then fixed with `threading.Lock`, confirmed correct across
      multiple runs.
- [ ] `ThreadPool` implemented and run with the exact 6-jobs/3-workers
      trace above, confirming ~1.00s total, not ~3.00s.
- [ ] Can explain out loud, without looking at the code, why exactly
      `num_workers` sentinel values (not just one) are needed in
      `shutdown()`.
- [ ] Can state, from memory, the one-sentence reason threading speeds
      up I/O-bound work in Python but not CPU-bound work (the GIL).
- [ ] Committed, with a message explaining *why* — e.g. `"Thread pool
      over a shared queue: fixed workers, sentinel shutdown, and why
      the counter race needed a lock but the queue never did"` — not
      `"add threadpool.py"`.
