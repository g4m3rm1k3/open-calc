---
concept: 121-race-conditions
name: Race Conditions
---

## Definition

A race condition occurs when the correctness of a program depends on the
unpredictable timing or ordering of concurrent operations — specifically
when two or more threads or processes access shared data at the same time,
and the outcome depends on which one happens to "win" the race.

## Problem

Two threads incrementing the same shared counter "at the same time" can
each read the old value before either writes the new one, causing one
increment to be silently lost. The final count ends up lower than the
number of increments actually performed, and which run happens to lose an
increment is unpredictable, making the bug hard to reproduce and debug.

## Execution

Shared counter starts at 0. Two threads each try to increment it once.
↓
Thread A reads counter (sees 0)
↓
Thread B reads counter (ALSO sees 0, before A has written anything back)
↓
Thread A computes 0+1=1, writes counter=1
↓
Thread B computes 0+1=1 (using its STALE read from before), writes counter=1
↓
Final counter = 1, even though TWO increments were supposedly performed —
one was silently lost

## Computer Science

"Increment the counter" looks like one atomic operation in source code,
but is actually three separate steps at the hardware level — read,
compute, write — and if another thread's read/compute/write interleaves
between any of those steps, the two threads' updates can clobber each
other. Only a genuinely atomic operation or explicit synchronization
prevents this interleaving.

Tags: Interleaving, Read-modify-write, Non-atomic operations, Non-determinism

## Software Engineering

Race conditions are notoriously hard to debug specifically because they're
timing-dependent — a race that occurs 1 time in 10,000 runs might never
show up in testing but appear regularly in production under different
load or timing. This is exactly why defensive synchronization (mutexes,
atomic operations) is used proactively around shared mutable state, not
just added reactively after a bug is observed.

Tags: Debugging difficulty, Non-reproducible bugs, Defensive synchronization

## Common Mistakes

- Assuming a "quick" operation like incrementing a counter is atomic just because it's one line of source code — most languages compile this into multiple separate CPU steps, each independently interruptible by another thread.
- Testing for a race condition and concluding "it works" after a few runs that happened not to trigger it — the whole nature of a race condition is that it doesn't always manifest, so absence of failure in a few test runs proves very little.

## Exercises

- Manually trace on paper what happens if THREE threads interleave incrementing a shared counter starting at 0, all reading the same stale value before any of them write back.
- Look up how a mutex would prevent the exact interleaving traced in this lesson's Execution section.

## javascript

```javascript
// A deterministic simulation of the interleaving, since genuine timing-dependent
// races are inherently non-reproducible -- this demonstrates the EXACT sequence
// of steps that causes an increment to be lost, without relying on real timing luck.
let counter = 0

function simulateInterleavedIncrement() {
  const threadARead = counter        // Thread A reads (sees 0)
  const threadBRead = counter        // Thread B reads (ALSO sees 0 -- stale, before A writes)
  const threadAWrite = threadARead + 1
  const threadBWrite = threadBRead + 1   // computed from B's STALE read, not A's write
  counter = threadAWrite   // Thread A writes 1
  counter = threadBWrite   // Thread B writes 1 -- overwrites A's write with the SAME stale-based value
}

simulateInterleavedIncrement()
console.log(counter)   // 1 — even though two increments were "performed," one was lost
```
Walkthrough: this deliberately simulates the worst-case interleaving step
by step, rather than relying on real threads racing (which wouldn't
reliably reproduce the same outcome on every run). Both reads happen
before either write, so both threads compute `0 + 1 = 1` independently —
the final `counter` is `1`, not `2`, because Thread B's write was based on
a stale read, silently discarding Thread A's increment.

## python

```python
# A deterministic simulation of the interleaving, since genuine timing-dependent
# races are inherently non-reproducible -- this demonstrates the EXACT sequence
# of steps that causes an increment to be lost, without relying on real timing luck.
counter = 0

def simulate_interleaved_increment():
    global counter
    thread_a_read = counter        # Thread A reads (sees 0)
    thread_b_read = counter        # Thread B reads (ALSO sees 0 -- stale, before A writes)
    thread_a_write = thread_a_read + 1
    thread_b_write = thread_b_read + 1   # computed from B's STALE read, not A's write
    counter = thread_a_write   # Thread A writes 1
    counter = thread_b_write   # Thread B writes 1 -- overwrites A's write with the SAME stale-based value

simulate_interleaved_increment()
print(counter)   # 1 -- even though two increments were "performed," one was lost
```
Walkthrough: identical deliberately-forced interleaving as the JavaScript
version — this is a controlled demonstration of the exact bug, not a
timing-dependent real race, which wouldn't reliably reproduce the same
outcome every time this code runs.
