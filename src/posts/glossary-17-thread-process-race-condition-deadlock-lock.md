# Concurrency Fundamentals: Thread, Process, Race Condition, Deadlock, Lock/Mutex

## What you will build

Five runnable programs — covering Thread, Process, Race Condition,
Deadlock, and Lock/Mutex — in Python, with TypeScript explanations for
the concepts (TypeScript/Node.js handles concurrency differently, and that
difference is itself the lesson). By the end you'll understand what
threads and processes are, why shared mutable state causes race conditions,
why deadlocks happen, and how locks prevent both — and why JavaScript's
single-threaded model sidesteps most of these problems while creating
its own trade-offs.

## An honest note about this post

This is the post flagged in the introduction to this series as genuinely
hard to demonstrate reliably. Race conditions and deadlocks are
**timing-dependent** — they depend on the scheduler, the OS, the CPU,
and random timing, so a race condition that shows up consistently on one
machine may never appear on another. This post demonstrates real race
conditions using Python's threading, but results may vary. The concepts
are real and important regardless of whether any specific run visibly
demonstrates the timing-based failure.

## What you need to know first

This post assumes comfort with basic Python (variables, functions,
classes). No TypeScript knowledge is assumed. This post stands fully alone.

## Setting up to run TypeScript

For concepts covered in TypeScript in this post, the same workflow applies:

```
npx tsc filename.ts
node filename.js
```

---

## Concept 1: Process

A **process** is a running program — an independent unit of execution with
its own memory space, its own file handles, and its own CPU state. When
you run `python3 myscript.py`, you create a process. Running it again
creates a second, entirely separate process. Processes don't share memory
with each other by default — data in one process is invisible to another
unless explicitly communicated through mechanisms like pipes, files, or
sockets.

### Python

```python
import multiprocessing
import os


def worker_task(worker_id):
    pid = os.getpid()
    print(f"  Worker {worker_id}: running in process {pid}")
    total = sum(range(1_000_000))
    print(f"  Worker {worker_id}: computed sum = {total}")


if __name__ == "__main__":
    main_pid = os.getpid()
    print(f"Main process: {main_pid}")

    processes = []
    for worker_id in range(3):
        process = multiprocessing.Process(
            target=worker_task,
            args=(worker_id,)
        )
        processes.append(process)
        process.start()

    for process in processes:
        process.join()

    print("All processes finished.")
```

**Walkthrough — new syntax.** `import multiprocessing` brings in Python's
built-in module for creating separate processes. `import os` brings in the
operating system interface module; `os.getpid()` returns the **Process ID**
(PID) of the current process — a unique number assigned by the OS to every
running process, useful for identifying which code is running in which
process. `if __name__ == "__main__":` — this guard is required for
multiprocessing on some platforms (particularly Windows and macOS). When
Python spawns a child process, it imports the script again to find the
function to run; without this guard, the import would start spawning more
processes recursively, causing a fork bomb. The guard ensures the
process-spawning code only runs when the script is the main entry point,
not when it's being imported.

`multiprocessing.Process(target=worker_task, args=(worker_id,))` creates
a new process object. `target` is the function to run; `args` is a tuple
of arguments to pass it. `process.start()` launches the process.
`process.join()` blocks until that process has finished — without
`join()`, the main process might exit before the workers complete.

```
Main process: 12345
  Worker 0: running in process 12346
  Worker 1: running in process 12347
  Worker 2: running in process 12348
  Worker 0: computed sum = 499999500000
  Worker 1: computed sum = 499999500000
  Worker 2: computed sum = 499999500000
All processes finished.
```

(Exact PIDs and ordering will vary each run.)

**CS lens — what makes processes isolated.** The OS gives each process its
own **virtual address space** — the process believes it has the entire
memory of the machine to itself, but the OS maps this virtual space to
actual physical memory, keeping processes' views separate. Writing to
memory in one process cannot affect any other process's memory; the OS
simply won't allow it. This isolation makes processes safe — one process
crashing doesn't corrupt another — but also means communication between
processes requires explicit mechanisms (pipes, sockets, shared memory
regions that the OS creates specifically for cross-process sharing).

**SE lens.** Processes are used when you need true isolation (a crash in a
worker shouldn't kill the main program), when you need to use multiple CPU
cores to parallelize CPU-intensive work (Python's threading can't do this
for CPU-bound work — see Thread below for why), or when running separate
programs that communicate through standard interfaces. Web servers
typically use processes: each worker process handles requests
independently, so a crash in one doesn't take down the others.

---

## Concept 2: Thread

A **thread** is a unit of execution within a process. Where a process is
an independent program with its own memory, a thread shares memory with
every other thread in the same process. Multiple threads in one process
all see the same variables, the same objects, the same open files. This
sharing is what makes threads both useful (fast communication, shared
state) and dangerous (race conditions, deadlocks).

### Python

```python
import threading
import time


def count_task(name, count):
    print(f"  Thread '{name}': starting")
    total = 0
    for i in range(count):
        total += i
    print(f"  Thread '{name}': finished, total={total}")
    return total


threads = []
for name in ["alpha", "beta", "gamma"]:
    thread = threading.Thread(target=count_task, args=(name, 500_000))
    threads.append(thread)
    thread.start()

for thread in threads:
    thread.join()

print("All threads finished.")
```

**Walkthrough — new syntax.** `import threading` brings in Python's
built-in threading module. `threading.Thread(target=count_task,
args=(name, 500_000))` creates a thread object — same API pattern as
`multiprocessing.Process`. `thread.start()` begins the thread's execution.
`thread.join()` blocks until that specific thread finishes.

```
  Thread 'alpha': starting
  Thread 'beta': starting
  Thread 'gamma': starting
  Thread 'gamma': finished, total=124999750000
  Thread 'alpha': finished, total=124999750000
  Thread 'beta': finished, total=124999750000
All threads finished.
```

(The order of completion may vary — that's the point.)

**CS lens — the GIL.** Python has a famous limitation: the **Global
Interpreter Lock** (GIL). The GIL is a mutex (covered below) built into
CPython (the standard Python interpreter) that allows only one thread at
a time to execute Python bytecode. This means Python threads don't
actually run in parallel for CPU-bound work — they take turns. For
I/O-bound work (waiting for network, disk, database), threads are still
very useful: while one thread is waiting for data, another can run. But
for CPU-intensive computation, `multiprocessing` (actual separate
processes) is needed to achieve true parallelism in Python.

**TypeScript/Node.js comparison.** This is where the TypeScript side of
this post's explanation matters most. Node.js is **single-threaded** —
there is exactly one thread, ever. JavaScript was designed for the browser,
where blocking the thread would freeze the UI, so the entire runtime was
built around an **event loop**: instead of threads, Node.js uses
asynchronous callbacks (the next post covers this properly). The benefit:
no shared memory, no race conditions, no deadlocks — they simply can't
happen because there's only one thread. The cost: CPU-intensive work
blocks the event loop and starves all other work. Node.js has
`worker_threads` for true parallelism, but they're not the default tool
the way threads are in Python or Java.

**SE lens.** Threads are appropriate for I/O-bound work that needs to
happen concurrently in Python: handling multiple network connections,
reading from multiple files simultaneously, making parallel API calls.
For CPU-bound work in Python, use processes. In Node.js, use
`async`/`await` for I/O-bound work (the next post), and `worker_threads`
only when genuine CPU parallelism is actually needed.

---

## Concept 3: Race Condition

A **race condition** occurs when the outcome of a program depends on the
timing of events that can happen in any order — and at least some of those
orderings produce incorrect results. Race conditions happen when multiple
threads share mutable state and access it without coordination.

### Python

```python
import threading


shared_counter = 0


def increment_unsafe(iterations):
    global shared_counter
    for _ in range(iterations):
        shared_counter += 1


threads = []
for _ in range(5):
    thread = threading.Thread(target=increment_unsafe, args=(100_000,))
    threads.append(thread)
    thread.start()

for thread in threads:
    thread.join()

expected = 5 * 100_000
print(f"Expected: {expected}")
print(f"Actual:   {shared_counter}")
print(f"Lost increments: {expected - shared_counter}")
```

**Walkthrough — new syntax.** `global shared_counter` inside a function
declares that `shared_counter` refers to the module-level variable, not a
new local variable — without this, Python would create a local `shared_counter`
in each thread, and the shared one would never be updated. This is the
only use of `global` in this series; it's considered poor practice in
general (using shared mutable globals is precisely the problem being
demonstrated), but it's the most direct way to show the race condition
clearly.

`_` as the loop variable in `for _ in range(...)` is a convention meaning
"I don't need this value" — the underscore is a valid variable name that
signals "intentionally unused."

```
Expected: 500000
Actual:   483271
Lost increments: 16729
```

(The actual number will vary — sometimes the race is hard to trigger,
sometimes the loss is larger. This is the nature of race conditions.)

**Walkthrough of why this happens.** `shared_counter += 1` looks like one
operation but is actually three steps in machine terms: read the current
value, add 1, write the result back. When two threads interleave between
these steps, one thread can overwrite the other's write:

```
Thread A reads: 42
Thread B reads: 42   (same value — B read before A wrote!)
Thread A writes: 43
Thread B writes: 43  (B also computed 42+1=43, so one increment is lost)
```

Two increments happened, but the counter only went up by 1. This is the
**lost update** problem — one of the most common race condition patterns.

**CS lens.** A race condition is a class of **concurrency bug** — a bug
that only manifests under specific timing conditions. This makes them
notoriously hard to debug: a race condition bug might appear 1 in 10,000
runs, only under high load, only on certain hardware, and might disappear
entirely when you add print statements to investigate (because print
statements slow the code down, changing the timing). Testing cannot
reliably reproduce them. The only reliable fix is designing shared state
away entirely, or protecting it with synchronization primitives — which
brings us to Lock/Mutex.

**SE lens.** Race conditions in real systems have caused significant
failures: financial systems double-charging accounts, web applications
corrupting user data, inventory systems overselling products. Any time
multiple threads (or async operations) read and write the same data
without coordination, the potential for a race condition exists.

---

## Concept 4: Lock / Mutex

A **Lock** (also called a **Mutex** — short for mutual exclusion) is a
synchronization primitive that ensures only one thread at a time can
execute a critical section of code. A thread **acquires** the lock before
entering the critical section; any other thread that tries to acquire it
blocks until the first thread **releases** it.

### Python — fixing the race condition

```python
import threading

shared_counter = 0
counter_lock   = threading.Lock()


def increment_safe(iterations):
    global shared_counter
    for _ in range(iterations):
        with counter_lock:
            shared_counter += 1


threads = []
for _ in range(5):
    thread = threading.Thread(target=increment_safe, args=(100_000,))
    threads.append(thread)
    thread.start()

for thread in threads:
    thread.join()

expected = 5 * 100_000
print(f"Expected: {expected}")
print(f"Actual:   {shared_counter}")
print(f"Correct:  {shared_counter == expected}")
```

**Walkthrough — new syntax.** `threading.Lock()` creates a new lock
object — initially unlocked. `with counter_lock:` is Python's **context
manager** syntax for a lock: it acquires the lock on entry and releases it
on exit, even if an exception occurs inside the block. This is equivalent
to:

```python
counter_lock.acquire()
try:
    shared_counter += 1
finally:
    counter_lock.release()
```

The `with` statement guarantees the lock is always released, preventing
the program from freezing if an exception interrupts the critical section.

```
Expected: 500000
Actual:   500000
Correct:  True
```

**Walkthrough of why this works.** Only one thread can hold `counter_lock`
at a time. When Thread A holds the lock and executes the three steps (read,
add, write), no other thread can enter the `with counter_lock:` block —
they block at the `with` statement until Thread A exits the block and
releases the lock. The read-add-write sequence is now **atomic** from the
perspective of other threads — it can't be interrupted by another thread
also trying to modify the counter.

**CS lens — the cost of locking.** Locks solve race conditions but
introduce their own costs. First: **contention** — when many threads
want the same lock, they queue up waiting, eliminating the parallelism
you hoped to achieve. Second: **deadlock** (the next concept). Third:
**lock granularity** — a lock that covers too much code serializes threads
unnecessarily; a lock that covers too little might not prevent all races.
Locking is not free, and good concurrent design minimizes the size and
frequency of critical sections.

**SE lens.** Locks appear in every concurrent system: database engines use
locks on rows or tables to prevent conflicting writes; operating systems use
locks to protect kernel data structures; GUI frameworks use locks to
protect UI state updated from background threads. The general design
principle: share as little mutable state as possible between threads,
and protect what must be shared with the smallest, most targeted lock
that's still correct.

---

## Concept 5: Deadlock

A **deadlock** occurs when two or more threads are each waiting for the
other to release a lock — a circular wait that can never resolve, freezing
all involved threads indefinitely.

### Python

```python
import threading
import time

lock_a = threading.Lock()
lock_b = threading.Lock()


def thread_one():
    print("  Thread 1: acquiring lock_a...")
    with lock_a:
        print("  Thread 1: acquired lock_a. Waiting briefly...")
        time.sleep(0.1)
        print("  Thread 1: trying to acquire lock_b...")
        acquired = lock_b.acquire(timeout=1.0)
        if acquired:
            print("  Thread 1: acquired lock_b — doing work")
            lock_b.release()
        else:
            print("  Thread 1: DEADLOCK DETECTED — could not acquire lock_b")


def thread_two():
    print("  Thread 2: acquiring lock_b...")
    with lock_b:
        print("  Thread 2: acquired lock_b. Waiting briefly...")
        time.sleep(0.1)
        print("  Thread 2: trying to acquire lock_a...")
        acquired = lock_a.acquire(timeout=1.0)
        if acquired:
            print("  Thread 2: acquired lock_a — doing work")
            lock_a.release()
        else:
            print("  Thread 2: DEADLOCK DETECTED — could not acquire lock_a")


t1 = threading.Thread(target=thread_one)
t2 = threading.Thread(target=thread_two)
t1.start()
t2.start()
t1.join()
t2.join()
print("Both threads finished (deadlock was detected and handled).")
```

**Walkthrough — new syntax.** `time.sleep(0.1)` pauses the thread for 0.1
seconds — used here to make the deadlock timing reliable: Thread 1 acquires
`lock_a` then sleeps, giving Thread 2 time to acquire `lock_b`; when both
wake up, they're each holding one lock and wanting the other. `lock_b.acquire(timeout=1.0)` attempts to acquire the lock but gives up after 1
second and returns `False` rather than blocking forever — this is the
**deadlock detection** mechanism used here to prevent the program from
hanging permanently. In real code without timeouts, a deadlock would freeze
the threads indefinitely with no output and no error message.

```
  Thread 1: acquiring lock_a...
  Thread 2: acquiring lock_b...
  Thread 1: acquired lock_a. Waiting briefly...
  Thread 2: acquired lock_b. Waiting briefly...
  Thread 1: trying to acquire lock_b...
  Thread 2: trying to acquire lock_a...
  Thread 1: DEADLOCK DETECTED — could not acquire lock_b
  Thread 2: DEADLOCK DETECTED — could not acquire lock_a
Both threads finished (deadlock was handled).
```

**CS lens — the four conditions for deadlock.** A deadlock requires all
four of these conditions simultaneously (this is the **Coffman
conditions**, a classic CS result from 1971):

1. **Mutual exclusion** — at least one resource is non-shareable (only one
   thread can hold the lock at a time).
2. **Hold and wait** — a thread holds at least one resource while waiting
   to acquire another.
3. **No preemption** — a resource can only be released voluntarily by the
   thread holding it.
4. **Circular wait** — Thread A waits for a resource held by Thread B, and
   Thread B waits for a resource held by Thread A.

Eliminating any one condition prevents deadlock. The most practical
approach: eliminate circular wait by enforcing a **lock ordering** — always
acquire locks in the same global order (e.g., always acquire `lock_a`
before `lock_b`, everywhere in the codebase). If every thread follows this
order, circular wait is impossible.

**SE lens.** Deadlocks in real systems are among the most insidious bugs:
the program doesn't crash, doesn't print an error, and doesn't produce
wrong output — it just silently stops making progress. Detection typically
requires monitoring tools that identify threads stuck waiting, or timeouts
on lock acquisition. Prevention through lock ordering or lock-free data
structures is far preferable to detection-after-the-fact.

### TypeScript/Node.js — why this doesn't apply

Traditional deadlocks involving locks cannot happen in standard
Node.js/JavaScript code, because there is only one thread and no blocking
lock primitives. JavaScript's event loop prevents one piece of code from
holding a resource while waiting for another — when code is waiting
(for a timer, a network response, a file read), it simply isn't running,
and the event loop can run other code in its place. This is the fundamental
design choice that makes Node.js different from Python, Java, and C# for
server-side concurrency: instead of threads sharing memory protected by
locks, Node.js uses a single thread with asynchronous I/O, eliminating
the race condition and deadlock problem class entirely for the common case.

The trade-off: Node.js cannot run two JavaScript operations *simultaneously*.
If a computation takes 5 seconds and nothing awaits during it, the entire
event loop is blocked for 5 seconds — no other requests are handled, no
timers fire. This is why long-running CPU work is moved to `worker_threads`
in Node.js, and why the `async`/`await` post (Glossary 18) is so
important: it's the mechanism that keeps the event loop unblocked for I/O.

---

## Connect the pieces

**Process** and **Thread** are the two fundamental units of concurrent
execution. Processes are isolated — they don't share memory and can't
corrupt each other. Threads share memory — fast communication, but shared
mutable state creates the possibility of **Race Conditions** (two threads
interleaving through a read-modify-write sequence, losing updates) and
**Deadlocks** (two threads each waiting for the other's lock, freezing
both). **Locks/Mutexes** prevent race conditions by making critical
sections atomic, but introduce contention and the possibility of deadlocks
if acquired in inconsistent orders.

Python's GIL limits threading for CPU-bound work but allows it for
I/O-bound concurrency. Node.js eliminates the threading model entirely
for its core use case, using a single-threaded event loop that makes race
conditions and deadlocks impossible in standard code — at the cost of not
being able to run true parallel computation without `worker_threads`.

## What breaks without understanding this

Race conditions silently corrupt data — the program runs with no error,
producing wrong results only some of the time, under specific timing
conditions that testing rarely reproduces. Deadlocks silently freeze
progress — no crash, no error, just a program that stops doing anything.
Both are significantly harder to debug than regular bugs, which is why
designing concurrent systems to minimize shared mutable state is
preferable to trying to lock everything correctly.

## Definition of done

- [ ] You can explain what distinguishes a process from a thread —
      specifically what is and isn't shared between them.
- [ ] You can explain Python's GIL and why it means Python threads don't
      parallelize CPU-bound work.
- [ ] You can explain, step by step, how two threads interleaving through
      `shared_counter += 1` produces a lost update.
- [ ] You can explain what a lock does mechanically — what "acquire" and
      "release" mean, and what "blocking" means.
- [ ] You can explain the four Coffman conditions for deadlock, and name
      one prevention strategy.
- [ ] You can explain why Node.js/JavaScript doesn't have the threading
      race condition and deadlock problem, and what trade-off it makes
      instead.
- [ ] You've run the race condition and lock examples in Python and
      observed the difference in results.
