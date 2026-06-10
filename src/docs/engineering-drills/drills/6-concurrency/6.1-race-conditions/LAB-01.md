# Drill 6.1 — Race Conditions: When Timing Determines Correctness

**Standalone drill. No prerequisites except basic Python.**
**Time estimate:** 60–75 minutes
**Environment:** Python 3.8+ — standard library only (`threading`)
**What you will build:** A bank account with a race condition, a demonstration that the condition triggers under load, a fix using a Lock, and a demonstration of deadlock. You will see the exact broken behavior before fixing it.
**What you will understand:** Why shared mutable state + concurrent access = undefined behavior, what a critical section is, and why locks fix races but create new problems.

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. Thread A reads `balance = 100`. Thread B reads `balance = 100`. Thread A writes `balance = 200` (added 100). Thread B writes `balance = 150` (added 50). What is the final balance? What should it be?

2. Python has the GIL (Global Interpreter Lock). Does the GIL prevent race conditions? Why or why not?

3. What is the difference between a race condition and a deadlock? Which is harder to detect in production?

4. You have a cache: if a key is missing, fetch from DB and store it. Two threads check the cache simultaneously, both see it's missing, both fetch from DB. What problem does this cause? What is this pattern called?

*(Answers at the bottom.)*

---

## The Concept: Race Conditions

### Concept: Shared Mutable State and the Critical Section

**What it is:**
A race condition is a bug where the correctness of the program depends on the relative timing of two or more concurrent operations. The program produces different results depending on which thread executes first — the "winner" of the race.

**The mechanism — why reads and writes are not atomic:**
A simple Python statement `self.balance += amount` compiles to three bytecode operations:
```
LOAD_ATTR   balance       # read current value
BINARY_ADD  amount        # compute new value
STORE_ATTR  balance       # write new value
```

Between the `LOAD_ATTR` and `STORE_ATTR`, the Python interpreter can switch threads (the GIL is released at bytecode boundaries). If Thread A and Thread B both execute `LOAD_ATTR` before either executes `STORE_ATTR`, they both read the same old value. Both compute based on the old value. Both write. One write overwrites the other. Work is lost.

This sequence is called a **race condition** because the result depends on which thread wins the race to execute next. It is not deterministic — it depends on OS scheduling, CPU load, and timing.

**The critical section:**
A critical section is the portion of code that must execute atomically (without interruption from other threads). For a bank balance: the read-modify-write sequence is the critical section. For a cache: check-then-set is the critical section. Any compound operation on shared state is a candidate for a critical section.

**The fix — mutual exclusion:**
A `Lock` (mutex) enforces mutual exclusion: only one thread can hold the lock at a time. A thread that tries to acquire a held lock blocks (suspends) until the lock is released.

```python
lock = threading.Lock()

with lock:
    # critical section — only one thread here at a time
    self.balance += amount
```

The `with` statement acquires the lock on entry and releases it on exit, even if an exception is raised.

**Constraints:**
- Locks are not free: acquiring and releasing a lock takes time. Under high contention (many threads competing for one lock), threads spend most of their time waiting, not working.
- Locks protect the code path, not the data: if some code accesses shared data without holding the lock, the protection is broken. Every access path must hold the same lock.
- Granularity matters: one lock for the whole program eliminates concurrency. One lock per data item maximizes concurrency but requires careful ordering to avoid deadlocks.

**Tradeoffs:**
- Coarse-grained lock (one lock for everything): simple, no deadlocks, but serializes all work
- Fine-grained lock (one lock per data item): maximum concurrency, but complex, deadlock risk
- Lock-free data structures (atomic operations): fastest, hardest to implement correctly

**Failure modes:**
- Forgetting to acquire the lock on one code path: the lock is pointless — one unprotected access breaks the invariant
- Acquiring locks in different orders in different threads: deadlock (each thread waits for a lock the other holds)
- Holding a lock while doing slow I/O: all other threads block waiting for you — contention
- Using a dict or list from multiple threads without locks: Python's dict operations are not atomic across compound operations (check-then-set)

**Operational reality:**
Race conditions are the hardest class of bug to reproduce in testing. They may only trigger under production load. They produce different results on different runs. Thread sanitizers (like `-fsanitize=thread` in C++) detect them; Python has no built-in equivalent. Defensive design — minimize shared mutable state, prefer message-passing (queues) over shared objects — prevents most races.

**You will see this again in:**
Any multi-threaded Python with shared state, Flask/Django handling concurrent requests, database connection pools, cache implementations, counters and gauges in monitoring systems.

**Watch for:**
The phrase "increment the counter" should immediately make you think: is this a read-modify-write? Is it protected? In Python, `counter += 1` is NOT atomic. `collections.Counter` is NOT thread-safe for concurrent updates. Use `threading.Lock` or `threading.local` (thread-local storage) instead.

---

## Step 1 — Create and Trigger the Race Condition

Create `bank_race.py`:

```python
import threading
import time

class BankAccount:
    def __init__(self, balance: float):
        self.balance = balance
    
    def deposit(self, amount: float) -> None:
        # Intentionally unprotected: read-modify-write is NOT atomic
        current = self.balance        # LOAD: read current balance
        time.sleep(0.0001)            # simulate a tiny delay (makes the race more likely)
        self.balance = current + amount  # STORE: write new balance

def run_deposits(account: BankAccount, amount: float, count: int) -> None:
    for _ in range(count):
        account.deposit(amount)

def test_race():
    account = BankAccount(0)
    
    # 10 threads each deposit 1.0 ten times = should end at 100.0
    threads = [
        threading.Thread(target=run_deposits, args=(account, 1.0, 10))
        for _ in range(10)
    ]
    
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    
    expected = 100.0
    actual = account.balance
    status = "CORRECT" if actual == expected else "RACE CONDITION — data lost"
    print(f"Expected: {expected:.1f}")
    print(f"Actual:   {actual:.1f}")
    print(f"Status:   {status}")
    if actual != expected:
        print(f"Lost:     {expected - actual:.1f} (overwrites happened)")

if __name__ == "__main__":
    print("Running 10 concurrent deposits of 10x 1.0 each...")
    print("(Expected total: 100.0)\n")
    
    for i in range(5):
        test_race()
        print()
```

### SAVE AND TRY

```
python bank_race.py
```

Expected output (will vary between runs — that is the point):
```
Running 10 concurrent deposits of 10x 1.0 each...
(Expected total: 100.0)

Expected: 100.0
Actual:   47.0
Status:   RACE CONDITION — data lost
Lost:     53.0

Expected: 100.0
Actual:   32.0
Status:   RACE CONDITION — data lost
Lost:     68.0

Expected: 100.0
Actual:   100.0
Status:   CORRECT

Expected: 100.0
Actual:   58.0
Status:   RACE CONDITION — data lost
Lost:     42.0
```

Notice: sometimes it returns 100.0 by luck (threads happened not to interleave during the critical section). Sometimes it loses half the deposits. The same code, different results, depending on timing. This non-determinism is the hallmark of a race condition.

**Change something:** Remove the `time.sleep(0.0001)` from `deposit`. Run again. The race condition becomes less frequent (fewer interleaving opportunities) but does not disappear. In production, the sleep is replaced by the actual latency of database calls, network I/O, or CPU scheduling — the race is always there.

---

## Step 2 — Fix with a Lock

Create `bank_safe.py`:

```python
import threading
import time

class SafeBankAccount:
    def __init__(self, balance: float):
        self.balance = balance
        self._lock = threading.Lock()
    
    def deposit(self, amount: float) -> None:
        with self._lock:
            # Critical section: only one thread here at a time
            current = self.balance
            time.sleep(0.0001)  # same artificial delay — but now protected
            self.balance = current + amount
    
    def withdraw(self, amount: float) -> bool:
        with self._lock:
            if self.balance < amount:
                return False  # insufficient funds
            current = self.balance
            time.sleep(0.0001)
            self.balance = current - amount
            return True
    
    @property
    def snapshot(self) -> float:
        with self._lock:
            return self.balance

def run_deposits(account: SafeBankAccount, amount: float, count: int) -> None:
    for _ in range(count):
        account.deposit(amount)

def run_mixed(account: SafeBankAccount, results: list, index: int) -> None:
    successes = 0
    for _ in range(20):
        if account.withdraw(5.0):
            successes += 1
        account.deposit(5.0)
    results[index] = successes

def test_safe():
    account = SafeBankAccount(0)
    
    threads = [
        threading.Thread(target=run_deposits, args=(account, 1.0, 10))
        for _ in range(10)
    ]
    
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    
    expected = 100.0
    actual = account.balance
    status = "CORRECT" if actual == expected else "BUG"
    print(f"Deposit test — Expected: {expected:.1f}, Actual: {actual:.1f}, Status: {status}")

def test_overdraft_protection():
    account = SafeBankAccount(50.0)
    results = [0] * 20
    
    # 20 threads each try to withdraw 5.0 twenty times and re-deposit
    threads = [
        threading.Thread(target=run_mixed, args=(account, results, i))
        for i in range(20)
    ]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    
    final = account.snapshot
    print(f"Overdraft test — Final balance: {final:.1f} (should be >= 0)")
    if final < 0:
        print("  BUG: balance went negative — overdraft check race condition!")
    else:
        print("  Overdraft protection held correctly")

if __name__ == "__main__":
    print("=== Safe Bank Account (with Lock) ===\n")
    for _ in range(5):
        test_safe()
    
    print("\n=== Overdraft Protection Test ===")
    test_overdraft_protection()
```

### SAVE AND TRY

```
python bank_safe.py
```

Expected output (consistent across all runs):
```
=== Safe Bank Account (with Lock) ===

Deposit test — Expected: 100.0, Actual: 100.0, Status: CORRECT
Deposit test — Expected: 100.0, Actual: 100.0, Status: CORRECT
Deposit test — Expected: 100.0, Actual: 100.0, Status: CORRECT
Deposit test — Expected: 100.0, Actual: 100.0, Status: CORRECT
Deposit test — Expected: 100.0, Actual: 100.0, Status: CORRECT

=== Overdraft Protection Test ===
Overdraft test — Final balance: 50.0 (should be >= 0)
  Overdraft protection held correctly
```

Every run produces exactly 100.0. The lock serializes the critical section — the delay inside `deposit` no longer matters because no other thread can enter while one is executing it.

**Change something:** Run `bank_race.py` and `bank_safe.py` and time them with `time python bank_race.py` and `time python bank_safe.py`. The safe version is slower — the lock introduces waiting. In production, this tradeoff is measured in profiling: is the correctness cost worth the performance cost? (It always is for financial operations.)

---

## Step 3 — Demonstrate Deadlock

A deadlock occurs when two threads each hold a lock the other needs, and both wait forever:

```python
# deadlock_demo.py
import threading
import time

lock_a = threading.Lock()
lock_b = threading.Lock()

def thread_1():
    print("Thread 1: acquiring lock_a...")
    with lock_a:
        print("Thread 1: acquired lock_a. Waiting 0.1s, then acquiring lock_b...")
        time.sleep(0.1)  # sleep gives Thread 2 time to acquire lock_b
        print("Thread 1: trying to acquire lock_b...")
        with lock_b:
            print("Thread 1: acquired both locks (will not print in deadlock)")

def thread_2():
    print("Thread 2: acquiring lock_b...")
    with lock_b:
        print("Thread 2: acquired lock_b. Waiting 0.1s, then acquiring lock_a...")
        time.sleep(0.1)
        print("Thread 2: trying to acquire lock_a...")
        with lock_a:
            print("Thread 2: acquired both locks (will not print in deadlock)")

print("Starting threads — will deadlock...")
print("(Ctrl+C to kill — the program will hang)\n")

t1 = threading.Thread(target=thread_1)
t2 = threading.Thread(target=thread_2)
t1.start()
t2.start()

t1.join(timeout=3)  # give it 3 seconds
t2.join(timeout=3)

if t1.is_alive() or t2.is_alive():
    print("\nDEADLOCK DETECTED: Threads are still blocked after 3 seconds")
    print("Thread 1 holds lock_a and waits for lock_b")
    print("Thread 2 holds lock_b and waits for lock_a")
    print("Neither can proceed. This is a deadlock.")
else:
    print("\n(No deadlock this run — timing was off)")
```

Then show the fix — always acquire locks in the same order:

```python
# deadlock_fixed.py
import threading
import time

lock_a = threading.Lock()
lock_b = threading.Lock()

def thread_1():
    with lock_a:     # always acquire A before B
        time.sleep(0.1)
        with lock_b:
            print("Thread 1: completed successfully")

def thread_2():
    with lock_a:     # same order: A before B
        time.sleep(0.1)
        with lock_b:
            print("Thread 2: completed successfully")

t1 = threading.Thread(target=thread_1)
t2 = threading.Thread(target=thread_2)
t1.start()
t2.start()
t1.join()
t2.join()
print("Both threads completed — no deadlock")
```

### SAVE AND TRY

```
python deadlock_demo.py
```

Expected output:
```
Starting threads — will deadlock...
(Ctrl+C to kill — the program will hang)

Thread 1: acquiring lock_a...
Thread 2: acquiring lock_b...
Thread 1: acquired lock_a. Waiting 0.1s, then acquiring lock_b...
Thread 2: acquired lock_b. Waiting 0.1s, then acquiring lock_a...
Thread 1: trying to acquire lock_b...
Thread 2: trying to acquire lock_a...

DEADLOCK DETECTED: Threads are still blocked after 3 seconds
Thread 1 holds lock_a and waits for lock_b
Thread 2 holds lock_b and waits for lock_a
Neither can proceed. This is a deadlock.
```

```
python deadlock_fixed.py
```

Expected output:
```
Thread 1: completed successfully
Thread 2: completed successfully
Both threads completed — no deadlock
```

In the fixed version, Thread 2 can't acquire `lock_a` until Thread 1 releases it (when Thread 1 finishes). The consistent lock ordering prevents circular waiting.

---

## Challenge

**No solution provided. Requirements checklist only.**

Build a thread-safe connection pool — a fixed set of database connections shared among many worker threads.

**Requirements checklist:**

- [ ] `ConnectionPool(size=5)` creates a pool of `size` simulated connections (just integers 1-5 as IDs)
- [ ] `pool.acquire()` returns a connection ID — if no connections are available, the caller blocks (waits) until one is released
- [ ] `pool.release(conn_id)` returns a connection to the pool
- [ ] `pool.acquire()` with `timeout=seconds` raises `TimeoutError` if no connection is available within `timeout` seconds
- [ ] Pool is fully thread-safe: 50 threads acquiring/releasing concurrently never produces duplicate connections (two threads holding the same ID simultaneously)
- [ ] `pool.stats()` returns `{"available": N, "in_use": M}` — call this without a lock if possible (hint: use atomic reads)
- [ ] A context manager interface works: `with pool.connection() as conn_id: ...` auto-releases on exit
- [ ] Test: 50 threads each do 20 acquire/sleep(random)/release cycles. Verify: no connection_id is held by two threads at the same time, all connections return to the pool at the end.

**Starter:**
```python
import threading
import time
from contextlib import contextmanager

class ConnectionPool:
    def __init__(self, size: int):
        self._size = size
        self._available = list(range(1, size + 1))  # [1, 2, 3, 4, 5]
        self._lock = threading.Lock()
        self._condition = threading.Condition(self._lock)
        # TODO: Condition variables allow threads to wait AND release the lock
        # when waiting. Look up threading.Condition in the Python docs.
    
    def acquire(self, timeout: float = None) -> int:
        # TODO: wait until a connection is available
        # TODO: pop from _available, return the connection ID
        pass
    
    def release(self, conn_id: int) -> None:
        # TODO: return conn_id to _available
        # TODO: notify waiting threads
        pass
    
    @contextmanager
    def connection(self, timeout: float = None):
        # TODO: acquire, yield, release in finally
        pass
    
    def stats(self) -> dict:
        # TODO: return available count and in-use count
        pass
```

**When you're done:**
```
python pool_test.py
```
Output should be:
```
50 threads, 20 operations each
No duplicate connections detected
All connections returned to pool
Final stats: {'available': 5, 'in_use': 0}
Pool is correct.
```

**Stuck?** Ask AI: "In Python threading, what is a Condition variable and how do I use `condition.wait()` and `condition.notify_all()` to implement a blocking acquire on a connection pool? Show me the pattern for 'wait until a resource is available, then take it.'"

---

## Quick Check Answers

**1. Lost update — what is the final balance?**
The final balance is 150. Thread A read 100, added 100, wrote 200. Thread B also read 100 (before A wrote), added 50, wrote 150. Thread B's write overwame Thread A's write. The correct answer is 250 (100 + 100 + 50). The lost update (Thread A's +100) happened because both threads read the same old value before either wrote. This is the canonical "lost update" race condition.

**2. Does Python's GIL prevent race conditions?**
No. The GIL prevents multiple Python bytecodes from executing simultaneously, but a thread switch can happen between any two bytecodes. `balance += amount` is three bytecodes: LOAD, ADD, STORE. A thread switch between LOAD and STORE creates a race condition even with the GIL. The GIL prevents true parallelism (running on multiple CPUs at once) but does not prevent concurrent interleaving on a single CPU. Any compound operation (check-then-act, read-modify-write) is still vulnerable.

**3. Race condition vs deadlock:**
A race condition is non-deterministic incorrect behavior — the program produces wrong results depending on timing. A deadlock is a program that stops making progress — all threads wait forever. In production, **race conditions are harder to detect** because: they produce wrong results intermittently (not always), symptoms appear far from the cause (balance shows wrong value hours later), and they don't crash (so no error logs). Deadlocks are easier to find: the process hangs, it's reproducible, and thread dumps show exactly which thread is waiting on which lock.

**4. Double-fetch from cache:**
This is the "check-then-act" race condition, also called a **thundering herd** or cache stampede. Both threads see the cache miss and both issue database queries. The database may be hit twice unnecessarily (wasted work). If the value is expensive to compute and 100 threads all see the cache miss simultaneously, 100 queries hit the database at once — the "thundering herd." The fix: distributed locking (only one thread fetches, others wait), or probabilistic early expiration (refresh the cache before it expires).
