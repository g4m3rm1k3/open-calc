---
concept: 123-mutexes
name: Mutexes
---

## Definition

A mutex (mutual exclusion lock) ensures only one thread at a time can
execute a specific section of code — a critical section — forcing every
other thread wanting to enter that same section to wait until the current
holder releases it.

## Problem

Multiple threads modifying the same shared data without coordination can
interleave badly (see the Race Conditions concept), corrupting the result.
A mutex enforces that only one thread's read-modify-write sequence can
happen at a time, eliminating the interleaving that caused the corruption.

## Execution

Thread A wants to increment a shared counter — acquires the mutex first
↓
Thread B ALSO wants to increment it — tries to acquire the mutex, but it's
already held by A — Thread B WAITS
↓
Thread A finishes its read-modify-write sequence, releases the mutex
↓
Thread B's wait ends — it now acquires the mutex, performs its own
complete read-modify-write sequence, undisturbed
↓
Both increments are correctly applied — no update was lost, since the two
critical sections never overlapped

## Computer Science

A mutex turns a multi-step operation (read, modify, write) into an
effectively atomic one from every other thread's perspective, by
physically preventing any other thread from entering the same critical
section until the current holder is done — this is the direct fix for
exactly the interleaving demonstrated in the Race Conditions concept.

Tags: Mutual exclusion, Critical section, Lock acquisition, Blocking

## Software Engineering

Mutexes have a real performance cost — code inside a critical section runs
one thread at a time, serialized, even on a multi-core machine, so overly
broad or long-held mutexes can turn a supposedly-parallel program back
into an effectively sequential one. The goal is to protect only the actual
shared-state access, keeping critical sections as small as correctness
allows.

Tags: Lock contention, Critical section size, Performance tradeoff

## Common Mistakes

- Forgetting to release a mutex — if an exception is thrown inside the critical section before the release line is reached, this can permanently block every other thread waiting for it, effectively causing a deadlock.
- Making the critical section far larger than necessary, holding the mutex during slow, unrelated work — this serializes more of the program than actually needs protecting, hurting performance without any additional correctness benefit.

## Exercises

- Compare this lesson's mutex-protected counter increment against the Race Conditions concept's unprotected version — reason about why one is reliable and the other isn't.
- Identify the smallest possible critical section for a function that reads a shared value, does a slow unrelated computation, then writes an updated shared value — should the slow computation be inside or outside the lock?

## javascript

```javascript
// Node's single-threaded event loop means genuine multi-threaded race conditions
// on plain variables don't occur the way they do in Python -- this demonstrates
// the MUTEX API's shape (acquire, critical section, release) using a simple
// async-lock abstraction, the pattern real concurrent code follows regardless of language.
class Mutex {
  #locked = false
  #waiting = []
  async acquire() {
    if (!this.#locked) { this.#locked = true; return }
    await new Promise(resolve => this.#waiting.push(resolve))
  }
  release() {
    const next = this.#waiting.shift()
    if (next) next()
    else this.#locked = false
  }
}

async function main() {
  const mutex = new Mutex()
  let counter = 0

  async function increment() {
    await mutex.acquire()
    const current = counter        // read
    counter = current + 1          // modify + write
    mutex.release()
  }

  await Promise.all([increment(), increment()])
  console.log(counter)   // 2 — both increments applied correctly, none lost
}

main()
```
Walkthrough: `acquire()` only lets one caller proceed at a time — a
second caller waits until `release()` explicitly lets it through. Both
`increment()` calls run their read-modify-write sequence one at a time,
never interleaved, so the final `counter` is correctly `2` — contrast this
with the Race Conditions concept's unprotected version, which lost an
increment to exactly this kind of interleaving.

## python

```python
import threading

counter = 0
lock = threading.Lock()

def increment():
    global counter
    with lock:              # acquire the mutex, automatically released after this block
        current = counter   # read
        counter = current + 1   # modify + write

threads = [threading.Thread(target=increment) for _ in range(2)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(counter)   # 2 -- both increments applied correctly, none lost
```
Walkthrough: Python's `with lock:` acquires the mutex on entry and
guarantees it's released on exit, even if an exception occurs inside.
Because both threads' entire read-modify-write sequence happens while
holding the lock, they can never interleave — unlike the Race Conditions
concept's unprotected version, this reliably produces `2`, not `1`.
