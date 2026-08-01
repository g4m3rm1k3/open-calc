# SE Masterclass — LAB-94 — Synchronization

**Prerequisites:** LAB-93 (IPC)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why can `counter += 1` from two threads at once produce a *wrong* final count, even though each individual `+= 1` looks atomic in source code?
2. What's the difference between a mutex and a semaphore?
3. What are the four conditions that must all hold simultaneously for deadlock to occur?

## What You Will Build

A race condition reproduced on purpose (two threads incrementing a shared counter, landing on the wrong total), fixed with a mutex, and then a deliberately constructed deadlock between two locks — all in Python, where `threading` makes real concurrent memory access easy to demonstrate.

```
Without lock:  10 threads x 100,000 increments each -> expected 1,000,000, got 743,918 (wrong!)
With lock:     10 threads x 100,000 increments each -> got exactly 1,000,000 (correct)
Deadlock demo: thread A holds lock1, waits for lock2
               thread B holds lock2, waits for lock1
               -> both threads hang forever
```

## Concept: Synchronization — Preventing Concurrent Corruption

**What it is:** When multiple threads share memory (LAB-92 Step 3's `SharedArrayBuffer`, or any threaded program by default), operations that look like one step in source code are often *several* steps at the machine level — read the value, add one, write the value back. If two threads interleave those steps, updates can be lost. Synchronization primitives — mutexes, semaphores — are tools for making a group of operations effectively atomic: only one thread executes them at a time, no interleaving possible.

**The problem before:** LAB-92's `SharedArrayBuffer` example deliberately showed one thread mutating shared memory while the main thread only *read* it afterward — no two threads ever wrote at the same instant, so nothing could go wrong. Real threaded programs aren't that polite: multiple threads routinely need to update the *same* shared state concurrently (a shared counter, a shared cache, a shared queue), and without protection, "increment a counter 100,000 times from 10 threads" reliably produces a wrong final number — not due to a bug in the increment logic, but because increments from different threads interleave and overwrite each other.

**The solution:** A **mutex** (mutual exclusion lock) lets only one thread execute a protected section of code at a time — every other thread trying to acquire the same mutex blocks until the current holder releases it. A **semaphore** generalizes this to allow up to N concurrent holders instead of exactly one (useful for "at most 5 concurrent database connections," not just "at most 1 at a time"). Both prevent corruption by turning "many threads racing through shared state" into "threads politely taking turns" for the specific operations that need it.

**Canonical example:**

```python
import threading

lock = threading.Lock()
counter = 0

def increment():
    global counter
    with lock:  # only one thread executes this block at a time
        counter += 1
```

**Project Application:** LAB-97's process manager needs a lock around its shared process-registry map, since multiple event handlers (a process exiting, a new process starting) can fire in close succession and both try to mutate the registry; LAB-100's job scheduler needs synchronization around its shared job queue for the same reason.

**Watch for:** Holding a lock longer than necessary, or acquiring multiple locks in inconsistent orders across different threads — the second is exactly what causes the deadlock this lab deliberately constructs in Step 3.

## Step 1: Reproducing a race condition on purpose

```python
import threading

counter = 0

def increment_unsafe(times: int) -> None:
    global counter
    for _ in range(times):
        counter += 1  # looks atomic in Python source -- is NOT atomic at the interpreter level

def run_race_condition() -> None:
    global counter
    counter = 0
    threads = [threading.Thread(target=increment_unsafe, args=(100_000,)) for _ in range(10)]
    for t in threads: t.start()
    for t in threads: t.join()
    print(f"Expected 1,000,000, got {counter}")

run_race_condition()
```

`counter += 1` compiles to multiple bytecode steps: load the current value of `counter`, add one, store the result back. Python's Global Interpreter Lock (GIL) allows a thread switch to happen *between* any of these steps — thread A can load `counter` (say, `500`), get paused, thread B loads the same `500`, increments to `501`, stores it, then thread A resumes, increments its stale `500` to `501`, and stores `501` again — one of the two increments was silently lost.

### SAVE AND TRY

Run `run_race_condition()` several times. The reported count will very likely be *less* than `1,000,000` and will probably differ between runs — confirming this isn't a deterministic bug with one fixed wrong answer, but a genuine race whose outcome depends on unpredictable thread scheduling.

## Step 2: Fixing it with a mutex

```python
import threading

counter = 0
lock = threading.Lock()

def increment_safe(times: int) -> None:
    global counter
    for _ in range(times):
        with lock:
            counter += 1

def run_with_lock() -> None:
    global counter
    counter = 0
    threads = [threading.Thread(target=increment_safe, args=(100_000,)) for _ in range(10)]
    for t in threads: t.start()
    for t in threads: t.join()
    print(f"Expected 1,000,000, got {counter}")

run_with_lock()
```

`with lock:` acquires the lock before entering the block and releases it automatically on exit (even if an exception occurs) — while one thread holds the lock, every other thread calling `lock.acquire()` (which `with lock:` does internally) blocks until it's released. This turns `counter += 1` from "three separate, interruptible steps" into "one indivisible unit as far as any other lock-respecting thread can observe" — the race from Step 1 becomes structurally impossible, not just unlikely.

### SAVE AND TRY

Run `run_with_lock()` several times. It should report exactly `1,000,000` every single time — the same workload as Step 1, same number of threads, same number of increments, the only difference being the lock, and that difference is the entire gap between "usually wrong" and "always correct."

## Step 3: Deadlock — two locks, acquired in opposite orders

```python
import threading
import time

lock1 = threading.Lock()
lock2 = threading.Lock()

def thread_a() -> None:
    with lock1:
        print("Thread A acquired lock1")
        time.sleep(0.1)  # gives thread B time to acquire lock2 first
        print("Thread A waiting for lock2...")
        with lock2:
            print("Thread A acquired lock2")  # never reached in the deadlock

def thread_b() -> None:
    with lock2:
        print("Thread B acquired lock2")
        time.sleep(0.1)
        print("Thread B waiting for lock1...")
        with lock1:
            print("Thread B acquired lock1")  # never reached in the deadlock

def run_deadlock_demo() -> None:
    t_a = threading.Thread(target=thread_a)
    t_b = threading.Thread(target=thread_b)
    t_a.start()
    t_b.start()
    t_a.join(timeout=2)
    t_b.join(timeout=2)
    if t_a.is_alive() or t_b.is_alive():
        print("DEADLOCK: threads did not finish within 2 seconds")

run_deadlock_demo()
```

This deliberately constructs all four classic deadlock conditions at once: **mutual exclusion** (each lock only allows one holder), **hold and wait** (each thread holds one lock while waiting for the other), **no preemption** (neither lock can be forcibly taken from its holder), and **circular wait** (A waits for what B holds, B waits for what A holds — a cycle). Removing any *one* of these conditions breaks the deadlock; Step 4 removes circular wait specifically.

### SAVE AND TRY

Run `run_deadlock_demo()`. Both threads print their first "acquired" message and their "waiting for..." message, then the program hangs until the 2-second `join(timeout=2)` expires and reports `DEADLOCK` — a live demonstration that neither thread can ever complete, because each is permanently blocked waiting for a lock the other one refuses to release.

## Step 4: Preventing deadlock — consistent lock ordering

```python
import threading

lock1 = threading.Lock()
lock2 = threading.Lock()

def thread_a_fixed() -> None:
    with lock1:  # both threads now acquire lock1 BEFORE lock2 -- no circular wait possible
        with lock2:
            print("Thread A acquired both locks")

def thread_b_fixed() -> None:
    with lock1:  # same order as thread_a_fixed, not lock2-then-lock1
        with lock2:
            print("Thread B acquired both locks")

def run_fixed_demo() -> None:
    t_a = threading.Thread(target=thread_a_fixed)
    t_b = threading.Thread(target=thread_b_fixed)
    t_a.start(); t_b.start()
    t_a.join(); t_b.join()
    print("Both threads completed -- no deadlock")

run_fixed_demo()
```

The fix requires no new synchronization primitive at all — just a convention: **every thread that needs both locks acquires them in the same fixed order** (here, always `lock1` before `lock2`). This eliminates circular wait structurally: if both threads always try `lock1` first, whichever thread gets there first proceeds to also acquire `lock2` and finish, releasing both locks before the second thread ever gets a chance to hold one while waiting for the other.

### SAVE AND TRY

Run `run_fixed_demo()` many times in a loop (`for _ in range(20): run_fixed_demo()`) — it should complete cleanly every time, with no hang, confirming the fix isn't "usually avoids deadlock" but structurally cannot deadlock given this ordering discipline, regardless of thread scheduling timing.

## 🎯 Challenge

Implement a simple counting semaphore from scratch using `threading.Lock` and a condition variable (`threading.Condition`), limiting concurrent access to at most N "slots" — then use it to simulate 10 threads competing for only 3 concurrent "database connection" slots, logging when a thread has to wait.

<details>
<summary>Solution</summary>

```python
import threading
import time

class CountingSemaphore:
    def __init__(self, max_count: int):
        self._condition = threading.Condition()
        self._count = max_count

    def acquire(self) -> None:
        with self._condition:
            while self._count == 0:
                self._condition.wait()  # blocks until notified, releasing the lock while waiting
            self._count -= 1

    def release(self) -> None:
        with self._condition:
            self._count += 1
            self._condition.notify()  # wake one waiting thread

def simulate_connections() -> None:
    db_semaphore = CountingSemaphore(3)

    def use_connection(thread_id: int) -> None:
        print(f"Thread {thread_id} requesting a connection...")
        db_semaphore.acquire()
        print(f"Thread {thread_id} got a connection")
        time.sleep(0.3)
        db_semaphore.release()
        print(f"Thread {thread_id} released its connection")

    threads = [threading.Thread(target=use_connection, args=(i,)) for i in range(10)]
    for t in threads: t.start()
    for t in threads: t.join()

simulate_connections()
```

`threading.Condition` combines a lock with the ability to `wait()` (block and release the lock atomically until notified) and `notify()` (wake a waiting thread) — this is what lets `acquire()` block cleanly when `_count == 0` instead of busy-looping, and lets `release()` wake exactly one waiting thread rather than requiring polling. Running this shows at most 3 "got a connection" lines active at once, with the remaining 7 threads' "requesting" messages appearing before their eventual "got a connection" — the semaphore's whole job, generalizing a mutex's "1 at a time" to "N at a time."

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| `counter += 1` from multiple threads | "It's one line, so it's atomic" | Multiple bytecode steps — needs an explicit lock |
| Fixing a race condition | Add `time.sleep()` and hope timing works out | Use a mutex to make the critical section indivisible |
| Avoiding deadlock | Add more locks for "safety" | Acquire shared locks in one consistent order everywhere |
| Semaphore vs mutex | Same thing with a different name | Mutex = 1 holder max; semaphore = up to N holders |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does `with lock:` around `counter += 1` fix the race condition from Step 1? | |
| 2 | Which of the four deadlock conditions does Step 4's fix eliminate, and how? | |
| 3 | When would a semaphore be the right choice over a plain mutex? | |

## Quick Check Answers

1. `counter += 1` actually executes as separate load, add, and store steps at the interpreter level — a thread switch between any of those steps lets two threads both read the same stale value before either writes back, silently losing one of the two increments.
2. A mutex allows exactly one holder; a semaphore allows up to a configured maximum number N of concurrent holders — a mutex is really just a semaphore with N fixed at 1.
3. Mutual exclusion, hold-and-wait, no preemption, and circular wait — deadlock requires every one of these to hold at once, and breaking any single one prevents it.

*Next: [LAB-95 — Memory Management](LAB-95-memory-management.md)*
