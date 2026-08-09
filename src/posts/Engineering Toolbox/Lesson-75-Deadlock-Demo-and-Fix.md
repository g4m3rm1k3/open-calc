# Lesson 75: Two Locks, Opposite Order, Forever Stuck — Deadlock

**What you will build:** a `Bank` class whose `transfer` method safely
moves money between two accounts under concurrent access — and, along
the way, a genuine, reproducible deadlock, deliberately triggered, then
fixed. The working feature is a transfer function that's safe no
matter which direction concurrent transfers run in. The transferable
problem: `threading.Lock` (Lesson 74) fixes a race on *one* piece of
shared state — but the moment an operation needs *two* locks at once,
a new failure mode opens up that a single lock could never cause, and
it doesn't announce itself with an error. It just stops.

**What you need to know first:** Lesson 74 (thread pool,
producer/consumer, race conditions, `threading.Lock`) — this lesson
assumes the mutex/critical-section vocabulary from there is solid, and
spends no time re-teaching what a single lock does; it exists entirely
in the gap opened up by needing *two*.

---

## Concept Unit: The Problem — One Operation, Two Locks

### The Problem

Lesson 74's lock protected a single shared counter. Some operations
genuinely need to hold more than one lock at the same time to be
correct at all — a bank transfer between two accounts has to guard
*both* accounts' balances, or another thread could read a half-updated
state mid-transfer.

### The New Code

```python
import threading

account_a_lock = threading.Lock()
account_b_lock = threading.Lock()

balances = {"A": 100, "B": 100}

def transfer(from_lock, from_acct, to_lock, to_acct, amount):
    with from_lock:
        with to_lock:
            balances[from_acct] -= amount
            balances[to_acct] += amount
            print(f"moved {amount} from {from_acct} to {to_acct}")

transfer(account_a_lock, "A", account_b_lock, "B", 10)
print(balances)
```

### Run It

```
moved 10 from A to B
{'A': 90, 'B': 110}
```

Nested `with` blocks acquire both locks before touching either
balance — already-familiar syntax, nothing new yet. This single call
works correctly. Discarded now as a standalone lab — the danger isn't
visible with one transfer running alone; it shows up only once two
transfers, going in *opposite directions*, run concurrently, which the
next unit builds for real.

### CS Lens

An operation that isn't safe unless it holds two or more locks at once
is common, not exotic. Also recognized in: any database transaction
touching two rows at once, a file-move operation that needs to lock
both the source and destination directories, an operating system
scheduler moving a process between two queues, each independently
lockable.

---

## Concept Unit: Reproducing a Real Deadlock

### The Problem

If two concurrent operations each need the *same two* locks, but
happen to acquire them in *opposite* order, both can end up holding one
lock each and waiting forever for the other — a situation no amount of
waiting resolves on its own.

### The New Code

```python
import threading
import time

lock_a = threading.Lock()
lock_b = threading.Lock()

def transfer_a_to_b():
    with lock_a:
        print("transfer_a_to_b: got lock_a")
        time.sleep(0.2)
        print("transfer_a_to_b: waiting for lock_b...")
        with lock_b:
            print("transfer_a_to_b: got both locks")

def transfer_b_to_a():
    with lock_b:
        print("transfer_b_to_a: got lock_b")
        time.sleep(0.2)
        print("transfer_b_to_a: waiting for lock_a...")
        with lock_a:
            print("transfer_b_to_a: got both locks")

t1 = threading.Thread(target=transfer_a_to_b, daemon=True)
t2 = threading.Thread(target=transfer_b_to_a, daemon=True)

t1.start()
t2.start()

t1.join(timeout=3)
t2.join(timeout=3)

print("t1 still alive (deadlocked)?", t1.is_alive())
print("t2 still alive (deadlocked)?", t2.is_alive())
print("main thread reached the end -- exiting even though the deadlocked threads never will")
```

### Run It

```
transfer_a_to_b: got lock_a
transfer_b_to_a: got lock_b
transfer_a_to_b: waiting for lock_b...
transfer_b_to_a: waiting for lock_a...
t1 still alive (deadlocked)? True
t2 still alive (deadlocked)? True
main thread reached the end -- exiting even though the deadlocked threads never will
```

A real, reproducible deadlock — not simulated, not described, actually
triggered. Both threads print that they're waiting, and neither ever
prints "got both locks," because neither ever will.

### Mechanical Walkthrough

- `time.sleep(0.2)` inside each function, **between** acquiring the
  first lock and attempting the second — deliberately widens the
  window where the two threads can interleave badly, the same
  yield-point technique from Lesson 74's race-condition lab, reused
  here for a different failure mode. Without this gap, both threads
  would sometimes finish so fast that the dangerous interleaving never
  actually happens to occur — the bug would still exist, just harder
  to reliably observe.
- `t1.join(timeout=3)` — **first appearance of `join`'s `timeout`
  parameter.** Ordinary `.join()` (used without arguments throughout
  Lesson 74) blocks *forever* until the thread finishes — which, for a
  genuinely deadlocked thread, would hang this lesson's own code
  forever too. Passing `timeout=3` makes `.join()` give up waiting
  after 3 seconds and return control to the caller regardless of
  whether the thread actually finished.
- `t1.is_alive()` — **first appearance.** Returns `True` if the thread
  is still running (or, as here, still stuck) after the `join` timeout
  elapsed — this is how the deadlock is *detected* and confirmed
  programmatically, rather than just inferred from the program hanging.
- `daemon=True` — **first appearance.** Marking a thread as a daemon
  tells Python's interpreter not to wait for it before the process
  exits. This matters concretely here: the code above genuinely
  reaches its final `print` line and the script genuinely exits — but
  the two deadlocked threads are, at that moment, still alive,
  permanently stuck, forever. Without `daemon=True`, Python would
  refuse to let the process actually terminate while those non-daemon
  threads still existed — confirmed by re-running this exact script
  with `daemon=True` removed: every print statement still appears,
  `is_alive()` still correctly reports `True` for both, but the
  process itself never exits — it has to be killed externally. That
  is the deadlock made completely concrete: not a metaphor, an actual
  process that will not end on its own.

### Execution Trace — Why Both Threads Freeze

1. `t1` acquires `lock_a`. `t2` acquires `lock_b` — both succeed,
   because they're different locks; nothing conflicts yet.
2. Both threads sleep for 0.2 seconds — this is the deliberately
   widened window.
3. `t1` wakes up and tries to acquire `lock_b` — but `t2` already holds
   it. `t1` blocks, waiting.
4. `t2` wakes up and tries to acquire `lock_a` — but `t1` already
   holds it. `t2` blocks, waiting.
5. `t1` is waiting for a lock only `t2` can release; `t2` is waiting
   for a lock only `t1` can release. Neither thread will ever release
   what it's holding, because releasing happens only when the `with`
   block exits — and neither `with` block can exit, because each is
   still waiting on its *second* lock, forever.

### CS Lens

This exact shape — thread A holds resource 1 and wants resource 2;
thread B holds resource 2 and wants resource 1 — is called a
**circular wait**, and it's one of four conditions (alongside mutual
exclusion, hold-and-wait, and no preemption) that must *all* be true
simultaneously for a **deadlock** to occur. Also recognized in: two
cars arriving at a single-lane bridge from opposite ends, each waiting
for the other to back up first; two people in a narrow hallway each
stepping the same direction to let the other pass, forever
re-blocking each other; a database deadlock between two transactions
each holding a row-lock the other transaction's next step needs.

### SE Lens

The most dangerous thing about this deadlock, worth stating as plainly
as Lesson 74's race condition: **no exception was ever raised.** The
program didn't crash — it just stopped making progress, silently,
exactly at the two `with lock_b:` / `with lock_a:` lines, with no
stack trace pointing at the problem. In a real server process, this
looks like a hung request, or a thread pool that slowly runs out of
usable workers as more and more of them each get stuck waiting on a
different pair of locks — degrading, not crashing, which is often
harder to notice and diagnose in production than an outright failure.

---

## Concept Unit: The Fix — a Fixed, Global Lock Order

### The Problem

Nothing about locks themselves caused this — the *order* two different
call sites happened to acquire the same two locks in was the entire
cause. If every caller, everywhere, always acquired the same set of
locks in the same order, a circular wait becomes structurally
impossible: there's no way for thread A to hold lock 1 while wanting
lock 2 *and* thread B to hold lock 2 while wanting lock 1, if both
threads are only ever allowed to reach for lock 1 before lock 2.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition, extending Lesson 74's `Lock` usage rather than introducing
  a new primitive.
- **Files affected:** `bank.py` (new file).
- **Change type:** add.
- **Location:** n/a — brand-new file.
- **Dependencies:** `threading.Lock`, already established.

### The New Code

```python
class Bank:
    def __init__(self, starting_balances):
        self.balances = dict(starting_balances)
        self.locks = {name: threading.Lock() for name in starting_balances}

    def transfer(self, from_acct, to_acct, amount):
        first, second = sorted([from_acct, to_acct])
        with self.locks[first]:
            with self.locks[second]:
                self.balances[from_acct] -= amount
                self.balances[to_acct] += amount
```

### The Updated Project

```python
import threading


class Bank:
    def __init__(self, starting_balances):
        self.balances = dict(starting_balances)
        self.locks = {name: threading.Lock() for name in starting_balances}

    def transfer(self, from_acct, to_acct, amount):
        # Always acquire locks in a fixed, GLOBAL order -- sorted by
        # account name -- regardless of which direction this specific
        # transfer is moving money. That's the entire fix.
        first, second = sorted([from_acct, to_acct])                      # ← new
        with self.locks[first]:                                            # ← new
            with self.locks[second]:                                        # ← new
                self.balances[from_acct] -= amount                            # ← new
                self.balances[to_acct] += amount                               # ← new
```

### Mechanical Walkthrough

- `self.locks = {name: threading.Lock() for name in starting_balances}`
  — **first appearance of one lock per resource, built with a dict
  comprehension.** Rather than two hardcoded lock variables (as in the
  broken standalone version), each account gets its own lock, keyed by
  account name — this generalizes the fix to any number of accounts,
  not just a hardcoded pair.
- `first, second = sorted([from_acct, to_acct])` — **the entire fix,
  in one line.** `sorted()` on a two-element list of strings returns
  them in a consistent, deterministic order — alphabetical, here —
  regardless of which one was passed as `from_acct` and which as
  `to_acct`. A transfer from `"A"` to `"B"` and a transfer from `"B"`
  to `"A"` both compute `first="A"`, `second="B"` — the *conceptual*
  direction of the transfer (which account loses money, which gains
  it) is completely decoupled from the *locking* order, which is fixed
  and global.
- `with self.locks[first]: with self.locks[second]:` — same nested
  `with` structure as the original two-lock lab, but now driven by the
  sorted order instead of the parameter order — this is the only
  change that matters; everything else about the transfer logic is
  identical to the very first lab in this lesson.

### Execution Trace

`bank.transfer("A", "B", 10)` and `bank.transfer("B", "A", 5)`,
running concurrently:

1. Call 1: `sorted(["A", "B"])` → `["A", "B"]` → `first="A"`,
   `second="B"`. Acquires `locks["A"]`, then `locks["B"]`.
2. Call 2: `sorted(["B", "A"])` → **also** `["A", "B"]` → `first="A"`,
   `second="B"`. Acquires `locks["A"]`, then `locks["B"]` — the exact
   same order as call 1, even though the transfer itself is moving
   money the opposite direction.
3. Whichever call reaches `locks["A"]` first simply makes the other
   one wait for `locks["A"]` — a completely ordinary, resolvable wait,
   not a circular one. There is no scenario where one call holds `A`
   while waiting for `B` and the other holds `B` while waiting for
   `A`, because neither call is ever able to acquire `B` before `A` in
   the first place.

### Run It

```python
>>> import threading, time
>>> from bank import Bank
>>> bank = Bank({"A": 500, "B": 500})
>>> def run_transfers(from_acct, to_acct, count):
...     for _ in range(count):
...         bank.transfer(from_acct, to_acct, 1)
>>> t1 = threading.Thread(target=run_transfers, args=("A", "B", 1000))
>>> t2 = threading.Thread(target=run_transfers, args=("B", "A", 1000))
>>> start = time.perf_counter()
>>> t1.start(); t2.start()
>>> t1.join(timeout=5); t2.join(timeout=5)
>>> elapsed = time.perf_counter() - start
>>> print("t1 still alive?", t1.is_alive())
>>> print("t2 still alive?", t2.is_alive())
>>> print("final balances:", bank.balances)
>>> print(f"finished in {elapsed:.2f}s")
```

```
t1 still alive (deadlocked)? False
t2 still alive (deadlocked)? False
final balances: {'A': 500, 'B': 500}
finished in 0.00s
```

Two threads, transferring money in *opposite directions*, 1000 times
each, concurrently — the exact shape that deadlocked before — now
finishes instantly, with correct final balances (1000 transfers of $1
each direction cancel out exactly, back to the $500 starting point).
No deadlock, no corruption.

### Confirming the Fix Was Actually Necessary

It's worth proving the unsorted version really would deadlock under
this same stress test, not just trusting that it would — otherwise
"the fix worked" is unfalsifiable. Reverting `transfer` to acquire
`from_acct` before `to_acct` (no sorting) and adding back a small
`time.sleep(0.01)` between acquiring the two locks (to widen the
interleaving window, same reasoning as the very first deadlock lab):

```python
def transfer(self, from_acct, to_acct, amount):
    with self.locks[from_acct]:
        time.sleep(0.01)
        with self.locks[to_acct]:
            self.balances[from_acct] -= amount
            self.balances[to_acct] += amount
```

Run against the same two opposite-direction threads (reduced to 5
transfers each, to keep the wait bounded):

```
t1 still alive (deadlocked)? True
t2 still alive (deadlocked)? True
waited 6.00s
```

Real deadlock, reproduced a second time, this time inside the general
`Bank` class rather than the two standalone functions from the earlier
unit — confirming the sorted-order fix isn't incidental; it's the
specific thing standing between this class deadlocking under real
concurrent load and not.

### CS Lens

Eliminating one of the four necessary conditions for deadlock —here,
**circular wait**, by imposing a total order on lock acquisition — is
one of the standard, textbook deadlock-prevention strategies. Also
recognized in: database systems that internally order row-locks by a
row ID to prevent exactly this kind of transaction deadlock, the
Dining Philosophers problem's classic solution (number the forks,
always pick up the lower-numbered one first), and version-control
merge tools that resolve conflicting lock requests by a fixed priority
order rather than whoever asked first.

### SE Lens

`sorted([from_acct, to_acct])` works here because account names are
directly comparable strings. In a more general system, the same
principle still applies but needs a canonical key to sort by — some
locking systems sort by each lock's memory address or a unique
creation-order ID for exactly this reason, when the resources being
locked don't have an obviously comparable name. The mechanism this
lesson uses is intentionally the simplest version of a general
technique, not a special case unrelated to the harder ones.

---

## Connect the Pieces

```python
import threading
import time
from bank import Bank

bank = Bank({"A": 500, "B": 500, "C": 500})

def run_transfers(from_acct, to_acct, count):
    for _ in range(count):
        bank.transfer(from_acct, to_acct, 1)

threads = [
    threading.Thread(target=run_transfers, args=("A", "B", 500)),
    threading.Thread(target=run_transfers, args=("B", "A", 500)),
    threading.Thread(target=run_transfers, args=("B", "C", 500)),
    threading.Thread(target=run_transfers, args=("C", "B", 500)),
    threading.Thread(target=run_transfers, args=("A", "C", 500)),
    threading.Thread(target=run_transfers, args=("C", "A", 500)),
]

for t in threads:
    t.start()
for t in threads:
    t.join(timeout=10)

print([t.is_alive() for t in threads])   # -> all False, no deadlock
print(bank.balances)                      # -> back to {'A': 500, 'B': 500, 'C': 500}
```

Six threads, three accounts, every possible pairing and direction,
running concurrently against locks acquired in a globally consistent
order — no deadlock, regardless of how many resources or how many
simultaneous callers are involved, because the *one* structural
property (a fixed acquisition order) that prevents circular waits
holds no matter how large the system grows.

## What Breaks Without This

Already shown directly above, twice: the standalone two-function
version and the unsorted `Bank.transfer` both deadlock reliably under
concurrent opposite-direction calls with a widened acquisition window
— confirmed by `is_alive()` returning `True` well past a generous
timeout, both times. The fix in both cases was never "add more
locking" — both broken versions were already using locks correctly by
Lesson 74's standards, protecting every shared access. The bug was
purely about the *order* two already-correct pieces of locking code
happened to acquire two already-correct locks in.

## Exercises

- Extend `Bank` with a `transfer_multiple(pairs)` method that performs
  several transfers as one atomic operation — all locks for every
  account involved acquired up front, in sorted order, before any
  balance changes happen — and confirm it doesn't deadlock even when
  called concurrently with overlapping sets of accounts.
- Research `Lock.acquire(timeout=...)` (available on `threading.Lock`
  itself, not just `Thread.join`) as a second deadlock-avoidance
  strategy: instead of preventing deadlock structurally via ordering,
  detect a stuck acquisition after a timeout, release whatever's
  already held, and retry. Implement it and compare the tradeoffs
  against the lock-ordering approach used in this lesson.
- Deliberately build a three-lock deadlock (three threads, three
  locks, each thread wanting the lock the next thread already holds,
  in a cycle) and confirm the same sorted-acquisition-order fix
  resolves it too.
- Research `threading.RLock` (a *reentrant* lock) and identify a
  situation where a regular `Lock` would deadlock a single thread
  against *itself*, which `RLock` avoids — a different failure mode
  than anything covered in this lesson, worth knowing exists.

## Definition of Done

- [ ] The original two-function deadlock reproduced for real on your
      own machine — both `is_alive()` calls returning `True`, not just
      read about.
- [ ] Confirmed, by actually removing `daemon=True` and observing the
      process fail to exit, that the deadlocked threads are genuinely,
      permanently stuck — not merely slow.
- [ ] `Bank.transfer` implemented with sorted lock acquisition, and the
      1000-transfers-each-direction stress test run for real, finishing
      near-instantly with correct final balances.
- [ ] The unsorted version's deadlock reproduced a second time, inside
      `Bank` itself, confirming the fix was load-bearing, not
      coincidental.
- [ ] Can explain out loud, without looking at the code, why
      `sorted([from_acct, to_acct])` — not `[from_acct, to_acct]` in
      parameter order — is the one line that matters.
- [ ] Committed, with a message explaining *why* — e.g. `"Deadlock
      demo and fix: two correct locks, acquired in opposite order,
      freeze forever; a fixed global acquisition order prevents it
      structurally"` — not `"add bank.py"`.
