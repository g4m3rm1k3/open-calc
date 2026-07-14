---
concept: async-3-execution-models-compared
name: Async, Part 3 — Execution Models Compared
series: async-fundamentals
seriesTitle: Asynchronous Programming
part: 3
---

## Definition

**Concurrency** is structuring a program to handle multiple things making progress
over the same time window. **Parallelism** is multiple things *literally*
executing at the same instant, which requires more than one CPU core actually
running your code simultaneously. Concurrency does not require parallelism.

## Problem

Parts 1 and 2 could mostly share one explanation across languages — the problem
(blocking) and the abstraction (a placeholder for a future value) are genuinely the
same idea everywhere. What actually executes your "concurrent" code underneath is
not the same machine in any two of these languages, and that difference has real
consequences for what your code can and can't safely do. This part is read
per-language on purpose — each walkthrough below is real, different content, not a
syntax variant of one shared idea.

## Computer Science

One core can create the *appearance* of "many things happening at once" by rapidly
switching between them — **cooperative** multitasking, where each task voluntarily
yields control at await points — or the operating system can forcibly interrupt
tasks on a timer — **preemptive** multitasking, true OS threads. Every walkthrough
below is really answering: is this concurrency-without-parallelism, and who decides
when a task gets interrupted?

Tags: Concurrency vs parallelism, Cooperative multitasking, Preemptive multitasking, Event loop, GIL

## Software Engineering

None of these models is "better" in the abstract — they're different tradeoffs.
JavaScript's single thread means no risk of two pieces of code racing to corrupt
the same object, at the cost of one slow CPU-bound function freezing everything
else. Java's real threads give genuine parallel throughput, at the cost of needing
real discipline (locks, immutability, concurrent data structures) anywhere multiple
threads touch the same mutable state. Python's GIL removes an entire category of
those exact bugs, at the cost of not speeding up CPU-bound work with more threads.

Tags: Race conditions, Synchronization, Thread safety, Tradeoff analysis

## Common Mistakes

- Assuming Python threads will speed up CPU-bound work the way Java's do — the GIL makes this a common, genuine performance bug, not just a theoretical footnote.
- Assuming JavaScript's `async`/`await` provides real parallelism — it never does; it only avoids blocking the single thread while waiting on I/O.
- Sharing mutable state across Java threads without synchronization, on the assumption that "it worked in testing" means it's safe — race conditions are often timing-dependent and can pass thousands of test runs before appearing in production under different load.

## Exercises

- In the Java example, remove `t1.join()`/`t2.join()` and predict what happens to the program's exit timing.
- Predict, before running: does doubling the loop count in the Python threading example roughly double the total time, given the GIL?

## javascript

```javascript
console.log('1')
setTimeout(() => console.log('2'), 0)
console.log('3')
// Real output order: 1, 3, 2 — never 1, 2, 3
```
Walkthrough: JavaScript runs on exactly one thread with an event loop. There is no
parallelism here at all — only cooperative concurrency on a single thread. Every
`await`, every `setTimeout` callback, every Promise `.then()` is placed on a queue;
the single thread finishes whatever synchronous code is currently running, then —
and only then — checks the queue and runs the next thing waiting on it. This is why
`setTimeout(..., 0)`'s callback still prints last: "0 milliseconds" doesn't mean
"immediately," it means "as soon as the current synchronous code finishes and the
event loop gets a turn." Because there's truly one thread, two pieces of
JavaScript can never run at the exact same instant, no matter how many `async`
functions are in flight — async in JS buys responsiveness, never true parallelism.

## python

```python
import threading

def cpu_heavy():
    total = 0
    for i in range(50_000_000):
        total += i
    return total

t1 = threading.Thread(target=cpu_heavy)
t2 = threading.Thread(target=cpu_heavy)
t1.start(); t2.start()
t1.join(); t2.join()
# On most Python implementations, this is barely faster than running
# cpu_heavy() twice in a row on one thread — not close to 2x faster.
```
Walkthrough: this is the surprising one. Python genuinely has OS threads — `t1`
and `t2` are real, separate threads the operating system knows about. But standard
Python (CPython) has the Global Interpreter Lock (GIL): a single lock that only
lets one thread execute Python bytecode at any instant, even on a multi-core
machine. `t1` and `t2` take turns, not because Python is imitating JavaScript's
single-thread model on purpose, but as a side effect of how CPython manages memory
safety internally. The practical result: Python threads give you concurrency for
I/O-bound waiting (a thread blocked on `time.sleep` or a network call releases the
GIL, letting another thread run), but not parallelism for CPU-bound work like the
loop above. Getting real parallel computation in Python means reaching for a
different tool entirely (`multiprocessing`, separate OS processes, each with its
own GIL), not more threads.

## java

```java
Thread t1 = new Thread(() -> { for (long i = 0; i < 50_000_000L; i++); });
Thread t2 = new Thread(() -> { for (long i = 0; i < 50_000_000L; i++); });
t1.start(); t2.start();
t1.join(); t2.join();
// On a multi-core machine, this genuinely runs close to 2x faster than
// running the same loop twice in sequence on one thread.
```
Walkthrough: Java has no GIL. `t1` and `t2` are real OS threads, and on a machine
with at least two CPU cores, the operating system can schedule them onto different
cores to run at the literal same instant — genuine parallelism, not just
concurrency. This is the same identical loop as Python's example above, but
because nothing in the Java runtime forces the two threads to take turns, this one
actually gets faster with more cores. This is also why Java code sharing mutable
state across threads needs real synchronization (locks, `synchronized`,
`java.util.concurrent` classes) to avoid two threads corrupting the same data by
writing to it at the exact same instant — a category of bug that a GIL-having
Python program or a single-threaded JavaScript program structurally cannot have
in the same way, because in both of those, only one thread is ever touching your
data at any given instant.
