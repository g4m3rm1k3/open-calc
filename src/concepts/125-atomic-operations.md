---
concept: 125-atomic-operations
name: Atomic Operations
---

## Definition

An atomic operation completes as a single, indivisible step from every
other thread's perspective — no other thread can ever observe it
"half-done," and no other thread's operation can interleave in the middle
of it.

## Problem

A compound operation like "read, then increment, then write" can be
interrupted partway through by another thread (see the Race Conditions
concept), corrupting the result. An atomic version of that same operation
guarantees it happens as one indivisible unit — either fully before, or
fully after, any other thread's own atomic operation on the same data,
never interleaved with it.

## Execution

Two threads each atomically increment the same counter, starting at 0
↓
Thread A's atomic increment: read 0, add 1, write 1 — ALL AS ONE STEP, no
other thread can interleave partway through
↓
Thread B's atomic increment: read 1 (A's fully-completed result), add 1,
write 2 — also one indivisible step
↓
Final counter = 2 — both increments correctly applied, since neither could
ever observe or interleave with the other's partial progress

## Computer Science

True atomicity is provided by the hardware itself — a CPU's
compare-and-swap or fetch-and-add instruction. These are the low-level
building blocks that higher-level constructs like mutexes are actually
implemented WITH, not just abstractly similar to; an atomic operation
doesn't need a separate lock because indivisibility is guaranteed directly
by the processor.

Tags: Compare-and-swap, Hardware-level guarantees, Indivisible operations, Lock-free programming

## Software Engineering

Atomic operations are typically faster than a full mutex for simple
operations (incrementing a counter, swapping a single value) since they
avoid the overhead of acquiring and releasing a separate lock — but they
only cover one operation at a time; anything requiring multiple
coordinated steps to stay consistent together still needs a mutex around
the whole sequence.

Tags: Lock-free programming, Performance, Compare-and-swap, Limited scope

## Common Mistakes

- Assuming an atomic operation makes an ENTIRE function thread-safe — it only guarantees that one specific operation is indivisible; a function doing several atomic operations in sequence can still have a race condition BETWEEN those operations, even though each one individually is safe.
- Reaching for a full mutex when a single atomic operation would be simpler and faster — mutexes are the more general tool but come with more overhead for protecting just one simple operation.

## Exercises

- Compare an atomic increment against the Mutexes concept's lock-protected increment — both solve the same lost-update problem; what's the key difference in mechanism?
- Research what "compare-and-swap" (CAS) means at the hardware level, and explain how it can implement a lock-free atomic increment.

## javascript

```javascript
// Node/JS: Atomics on a SharedArrayBuffer provide real hardware-backed atomic
// operations -- this demonstrates the API's guarantee (indivisible read-modify-write)
// even in a single-threaded demo, since the API itself is what matters here.
const buffer = new SharedArrayBuffer(4)
const view = new Int32Array(buffer)

Atomics.add(view, 0, 1)   // atomically: read view[0], add 1, write back -- one indivisible step
Atomics.add(view, 0, 1)   // a second atomic increment

console.log(Atomics.load(view, 0))   // 2 — both atomic increments applied correctly
```
Walkthrough: `Atomics.add` performs the entire read-modify-write as one
indivisible hardware-backed step — even across real worker threads
sharing this same `SharedArrayBuffer`, neither increment could ever
observe the other mid-way through, which is exactly what "atomic" means
here.

## python

```python
import threading

counter = 0
lock = threading.Lock()   # CPython doesn't expose a portable atomic-increment
                            # primitive directly -- a lock-protected increment is
                            # the standard stand-in, achieving the same indivisibility.

def atomic_increment():
    global counter
    with lock:
        counter += 1

atomic_increment()
atomic_increment()
print(counter)   # 2 -- both increments applied correctly, indivisibly
```
Walkthrough: Python doesn't expose a portable hardware-level atomic
increment the way `Atomics.add` does in JS — a lock around the smallest
possible critical section is the conventional way to get the same
indivisibility guarantee, which is why this looks similar to the Mutexes
concept's example, just applied to the narrowest possible operation.
