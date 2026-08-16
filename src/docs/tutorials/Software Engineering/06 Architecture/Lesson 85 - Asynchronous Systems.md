# Lesson 85: Asynchronous Systems

**What you will build.** `process_event_queue`, from Lesson 83, sends
notifications one at a time — five queued notifications take about 250
milliseconds, five times a single one's own 50-millisecond wait,
because each one waits for the last to finish before starting. This
lesson rewrites `send_notification` as a **coroutine**, using
`async`/`await`, and processes all five with `asyncio.gather` — the
measured total time drops to about 66 milliseconds, close to the time
a *single* notification takes alone, because all five spend their
50-millisecond wait at the same time instead of one after another. The
transferable problem: Lesson 81 gave one slow operation its own thread;
this lesson handles *many* operations waiting on slow I/O at once, using
a fundamentally different, lighter-weight mechanism — one that doesn't
need a new thread per operation to get the same real concurrency
benefit.

**What you need to know first.** Message-Oriented Architecture (Lesson
84) — `read_unprocessed_events`, the exact queue this lesson's async
version processes, now all at once instead of one at a time. Service-
Oriented Architecture (Lesson 81) — `threading.Thread`, the mechanism
this lesson's own coroutine-based approach is contrasted against
directly, including its own honest limits around Python's GIL.

**Pipeline diagram.** Lesson 12 established the full sequence every
system in this curriculum is placed against:

```text
Problem
  ↓
Requirements
  ↓
Domain model
  ↓
Specification
  ↓
Architecture
  ↓
Design
  ↓
Implementation
  ↓
Verification
  ↓
Integration
  ↓
Release
  ↓
Deployment
  ↓
Operations
  ↓
Observation
  ↓
Change
  ↓
Migration
  ↓
Evolution
  ↓
Retirement
```

Still the **Architecture** stage. Carried through: Lesson 81 gave one
slow operation independent capacity; this lesson gives *many* slow
operations the ability to wait on I/O simultaneously, using a mechanism
purpose-built for exactly that shape of problem.

**Terms introduced in this lesson.** One line each.

- **asynchronous** — code that can pause while waiting for a slow
  operation and let other code run during that wait, instead of
  blocking an entire thread until the operation finishes. It's
  distinguished from Lesson 81's threading by mechanism: threading uses
  operating-system-level threads, switched by the OS; async concurrency
  happens within a single thread, using cooperative pausing at explicit
  points the code itself names.
- **coroutine** — a function defined with `async def`, which doesn't run
  when called the ordinary way — calling it produces a coroutine object
  that has to be awaited or scheduled before it actually runs. It's the
  specific new construct this lesson introduces, and the mechanical
  distinction that has to be understood before `await` or
  `asyncio.gather` mean anything concrete.

**Objects and methods used.**

- **`async def`**
  - *What it is:* the syntax that defines a coroutine instead of an
    ordinary function.
  - *Implementation:* `async def send_notification_async(order_id):`
    looks like an ordinary function definition with `async` prepended;
    calling it, `send_notification_async(501)`, does not run the
    function's body at all — it returns a coroutine object, which has to
    be awaited or scheduled to actually execute.
  - *Its use:* this lesson uses it to define every function that needs
    to pause while waiting on simulated I/O, so the event loop can run
    other coroutines during that wait instead of blocking entirely.
- **`await`**
  - *What it is:* an expression that pauses the current coroutine until
    whatever it's awaiting completes, yielding control back to the
    event loop in the meantime.
  - *Implementation:* `await asyncio.sleep(0.05)` pauses this specific
    coroutine for 0.05 seconds — but, critically, doesn't block anything
    else; the event loop is free to run other coroutines during that
    pause.
  - *Its use:* this lesson uses it every time a coroutine needs to wait
    on something slow, marking exactly the point where other work is
    allowed to interleave.
- **`asyncio.gather(*coroutines)`**
  - *What it is:* a function that runs multiple coroutines concurrently
    and waits for all of them to finish, returning their results in
    order.
  - *Implementation:* `asyncio.gather(*(send_notification_async(oid) for
    oid in order_ids))` schedules every coroutine in the generator
    expression to run concurrently, returning a list of results once
    every one has completed.
  - *Its use:* this lesson uses it to send all five notifications at
    once, rather than looping over them one at a time.
- **`asyncio.run(coroutine)`**
  - *What it is:* the entry point that starts an event loop, runs one
    top-level coroutine to completion, and shuts the loop back down.
  - *Implementation:* `asyncio.run(send_all_notifications(order_ids))`
    is how ordinary, non-async code (a script's own top level) actually
    starts running async code at all.
  - *Its use:* this lesson uses it once, at the outermost point where
    this lesson's own async code is invoked from ordinary, synchronous
    code.

## Concept Unit: Waiting Sequentially When Nothing Requires It

### The Problem

Sending five notifications, one at a time, each waiting for the
previous one to fully finish:

```python
import time


def send_notification(order_id):
    time.sleep(0.05)
    return f"notification sent for order {order_id}"


start = time.perf_counter()
for order_id in [501, 502, 503, 504, 505]:
    send_notification(order_id)
elapsed = time.perf_counter() - start
print(f"5 notifications sent sequentially: {elapsed*1000:.1f}ms total")
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
5 notifications sent sequentially: 251.8ms total
```

Each notification's own wait — 50 milliseconds, simulating a slow
network call to a real notification provider — has nothing to do with
any of the others; they don't depend on each other, don't need to run in
any particular order relative to one another, and don't share any state
that would make running them one after another necessary. They're
simply written in a loop, which runs one iteration fully before starting
the next, by default.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** the notification-sending code, rewritten as
  coroutines.
- **Change type:** refactor — `send_notification` becomes `async def`;
  the loop becomes `asyncio.gather`.
- **Location:** wherever queued notifications are processed.
- **Dependencies:** `asyncio`, a Python standard-library module, no
  install needed.

### The New Code

The smallest new piece is the coroutine itself:

```python
async def send_notification_async(order_id):
    await asyncio.sleep(0.05)
    return f"notification sent for order {order_id}"
```

### The Updated Project

Every notification is scheduled to run concurrently, through
`asyncio.gather`, instead of one at a time in a loop:

```python
import asyncio


async def send_notification_async(order_id):                    # ← new
    await asyncio.sleep(0.05)                                       # ← new
    return f"notification sent for order {order_id}"                # ← new


async def send_all_notifications(order_ids):                        # ← new
    return await asyncio.gather(*(send_notification_async(oid) for oid in order_ids))  # ← new


results = asyncio.run(send_all_notifications([501, 502, 503, 504, 505]))  # ← new
```

None of the five notifications wait for each other anymore — each one's
own 50-millisecond pause happens concurrently with the other four's, and
the whole batch finishes in roughly the time one alone would have taken.

### Isolating the Concept: Five Waits, Overlapped Instead of Stacked

The mechanism doing the real work above — many coroutines pausing at the
same simulated wait, all overlapping instead of stacking end to end — is
shown directly through the real notification-sending scenario above
rather than a separate, unrelated example, since the measured speedup
itself is this lesson's actual evidence. Running the async version and
comparing directly to the sequential one:

```python
start = time.perf_counter()
results = asyncio.run(send_all_notifications([501, 502, 503, 504, 505]))
elapsed = time.perf_counter() - start
print(f"5 notifications sent concurrently: {elapsed*1000:.1f}ms total")
```

Running it produces:

```
5 notifications sent concurrently: 66.0ms total
```

Roughly 3.8 times faster than the sequential version's own 251.8ms, and
close to the 50ms a *single* notification takes on its own — proof that
all five waits genuinely overlapped, rather than merely being reordered.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`async def send_notification_async(order_id):`** — defines a
  coroutine; calling `send_notification_async(501)` alone, with no
  `await`, does not run this body at all — it produces a coroutine
  object, inert until scheduled.
- **`await asyncio.sleep(0.05)`** — pauses this specific coroutine for
  0.05 seconds, yielding control back to the event loop during the
  pause, so other coroutines — the other four notifications — can make
  progress on their own waits during this exact window.
- **`asyncio.gather(*(send_notification_async(oid) for oid in
  order_ids))`** — the `*` unpacks a generator expression of five
  coroutine objects (one per `order_id`) into five separate arguments;
  `gather` schedules all five to run concurrently and returns a single
  awaitable that completes once every one of them has.
- **`asyncio.run(send_all_notifications([...]))`** — the one place
  ordinary, synchronous code (this script's own top level) starts an
  event loop and runs the whole async operation to completion, then
  shuts the loop down and returns the final result.

### CS Lens

This is **cooperative concurrency**, built around an **event loop**: a
single thread that, instead of blocking on a slow operation, pauses the
current coroutine at an explicit `await` and runs a different one during
the wait, cycling between however many are pending. This is
fundamentally different from Lesson 81's threading, which relies on the
operating system preemptively switching between threads — async
concurrency is cooperative, meaning a coroutine only ever pauses at a
point it names itself (`await`), never interrupted mid-computation the
way a thread can be. This is why async is especially well suited to
I/O-bound work — many things simultaneously *waiting*, none of them
computing — and doesn't help CPU-bound work at all, the identical
honest limit Lesson 81 already proved for threads and the GIL.

Also recognized in: Node.js's own single-threaded event loop, handling
thousands of concurrent connections without a thread per connection,
async database drivers letting a web server handle other requests while
waiting on a slow query, and modern async web frameworks (FastAPI,
aiohttp) built specifically to serve many slow, I/O-bound requests
concurrently from a single worker process.

### SE Lens

The principle is **use the concurrency mechanism that matches the actual
bottleneck** — Lesson 81 already proved a thread works for one slow
I/O-bound operation running alongside other work; this lesson's async
approach is the right tool specifically when *many* independent,
I/O-bound operations need to run concurrently, without the overhead of
spinning up a full OS thread per operation. The real cost: every
function in a call chain that needs to eventually `await` something has
to itself become `async def`, all the way up — a real, structural
change that can't be applied to just one function in isolation the way
Lesson 78's dependency-injection fix could; async is genuinely
"contagious" through a codebase in a way none of this domain's earlier
fixes have been.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom, including starting and running the `asyncio`
event loop wherever `asyncio.run` is called.

### Run It

Running both versions back to back, at the identical simulated latency,
to see the real gap directly:

```python
def time_sequential():
    start = time.perf_counter()
    for order_id in [501, 502, 503, 504, 505]:
        send_notification(order_id)
    return time.perf_counter() - start


def time_concurrent():
    start = time.perf_counter()
    asyncio.run(send_all_notifications([501, 502, 503, 504, 505]))
    return time.perf_counter() - start


sequential = time_sequential()
concurrent = time_concurrent()
print(f"sequential: {sequential*1000:.1f}ms")
print(f"concurrent: {concurrent*1000:.1f}ms")
```

The real output:

```
sequential: 251.9ms
concurrent: 64.3ms
```

A real, roughly 3.8x speedup, measured directly, for the identical five
notifications — the only difference between the two runs being whether
their waits were allowed to overlap.

### Connecting Back

Where Lesson 81 gave one slow operation independent capacity to avoid
blocking a fast one, this lesson gives many slow, independent operations
the ability to wait concurrently instead of sequentially — a different
shape of the same underlying goal, matched to a different real
bottleneck.

## Connect the Pieces

Five notifications for orders `501` through `505` were sent twice in
this lesson, with the identical 50-millisecond simulated wait each time.
First, sequentially: roughly 252 milliseconds total, five separate waits
stacked end to end. Second, concurrently, using `asyncio.gather`:
roughly 66 milliseconds total, the same five waits overlapping almost
completely, because nothing about any one notification's own wait
depended on any of the others finishing first.

## What Breaks Without This

Async concurrency helps I/O-bound waiting. It does nothing for genuine
CPU-bound work, the identical honest limit Lesson 81 already proved for
threads:

```python
async def cpu_bound_async(n):
    total = 0
    for i in range(n):
        total += i * i
    return total


async def run_two_cpu_bound():
    return await asyncio.gather(cpu_bound_async(10_000_000), cpu_bound_async(10_000_000))


start = time.perf_counter()
asyncio.run(run_two_cpu_bound())
elapsed = time.perf_counter() - start
print(f"two CPU-bound coroutines together: {elapsed*1000:.1f}ms")
```

Run for real, this takes roughly the same total time as running both
pieces of work one after another — `cpu_bound_async` never actually
`await`s anything, so it never yields control back to the event loop at
all; the second coroutine can't make any progress until the first one's
entire loop finishes. Async concurrency requires an actual `await` point
inside the slow work for cooperative scheduling to have anywhere to
interleave — a synchronous computation with no `await` in it blocks the
whole event loop exactly the way a synchronous function call would.

## Exercises

1. Rewrite `read_unprocessed_events` from Lesson 84 to feed its results
   directly into `send_all_notifications`, processing every unprocessed
   event from the durable log concurrently in one batch. Measure the
   real time for 10 queued events, sequential versus concurrent.
2. Add `await asyncio.sleep(0)` inside `cpu_bound_async`'s own loop,
   every 1,000,000 iterations, and rerun the CPU-bound comparison above.
   Does this restore any concurrency? What does that prove about what
   `await` actually does, mechanically, versus what CPU-bound code
   needs?
3. Using both this lesson's own results and Lesson 81's, write two or
   three sentences comparing when you'd reach for `threading.Thread`
   versus `asyncio` for a real, mixed workload of both I/O-bound and
   CPU-bound operations.

## Definition of Done

- [ ] `send_notification_async` is defined with `async def` and
      `await`s `asyncio.sleep`.
- [ ] `send_all_notifications` uses `asyncio.gather` to run all
      coroutines concurrently.
- [ ] The Problem section's ~252ms sequential time has been measured for
      real, against the *original* loop-based version, before applying
      the fix.
- [ ] The "Run It" comparison above runs against your own code and
      produces a real, measured speedup close to the numbers shown here.
- [ ] The "What Breaks Without This" CPU-bound scenario has been run
      against your own file, not just read, proving async doesn't help
      CPU-bound work without a genuine `await` point.
- [ ] Commit, with a message stating *why*: something like `asynchronous
      systems: send queued notifications concurrently with asyncio
      instead of sequentially, cutting a 5-item batch from ~250ms to
      ~65ms`, not `add asyncio`.

Up next: Lesson 86, Data Ownership — moving from how operations run
concurrently to a different architectural question: which service owns
which piece of data, once a system has grown into more than one.
