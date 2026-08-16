# Lesson 81: Service-Oriented Architecture

**What you will build.** Rendering a receipt is fast — checkout depends
on it staying that way. Generating an annual tax report is slow and
rare, but shares the same single worker as checkout in this system's
current, modular-monolith shape. Queue a report request ahead of three
checkouts and measure, for real: all three checkouts finish at the same
moment the report does, roughly 300ms later, even though rendering a
receipt alone takes a fraction of a millisecond. This lesson gives the
report its own, independent worker — the smallest real instance of
splitting into a separate service — and measures the same three
checkouts finishing in about a millisecond, completely unaffected by
the report running alongside them. The transferable problem: Lesson 80
measured a real cost to splitting into separate services; this lesson
measures a real cost to *not* splitting — two operations with wildly
different resource profiles, sharing one process, can make the fast one
only as fast as whatever the slow one happens to be doing at the same
moment.

**What you need to know first.** Modular Monoliths (Lesson 80) — the
partial-failure cost this lesson's own decision has to be weighed
against; splitting into services isn't free just because this lesson
shows a real benefit too. Architectural Drivers (Lesson 73) — the real,
measured facts that should decide an architecture question; this lesson
supplies one, concretely, for the first time.

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

Still the **Architecture** stage. Carried through: Lesson 80 measured a
real reason to stay a modular monolith; this lesson measures a real
reason to split — the two lessons together are this curriculum's own
proof that neither answer is correct by default, only by measurement.

**Terms introduced in this lesson.** One line each.

- **service-oriented architecture** — splitting a system into
  separately deployed, separately scaled services, each owning one
  clear capability, specifically when a real, measured driver justifies
  paying Lesson 80's own partial-failure cost. It's the counterpart to
  the previous lesson: not a default, a decision made *because* a real
  number, like this lesson's own latency measurement, said so.
- **resource contention** — when two operations with very different
  resource needs — a fast, frequent one and a slow, rare one — compete
  for the same limited processing capacity, so the rare one can degrade
  the frequent one's latency even though neither operation has a bug in
  it. It's named because this lesson measures it directly: checkout's
  own code never changed, and its latency still moved by 300 milliseconds
  purely because of what else happened to be sharing its worker.

**Objects and methods used.**

- **`threading.Thread(target=..., args=...)`** (from Python's
  standard-library `threading` module)
  - *What it is:* a class representing a separate thread of execution,
    letting a function run concurrently with the rest of the program
    instead of blocking it.
  - *Implementation:* `threading.Thread(target=fn, args=(a, b))`
    creates a thread that will call `fn(a, b)` once started;
    `.start()` begins running it concurrently, and `.join()` blocks
    until it finishes.
  - *Its use:* this lesson uses it to simulate giving the tax report its
    own independent worker, so it can run without blocking checkout's
    own thread — an honest simplification of a real separate service,
    not a full substitute for one, as this lesson's own SE Lens makes
    clear.

## Concept Unit: A Slow, Rare Operation Sharing a Worker With a Fast, Frequent One

### The Problem

Checkout and tax reporting share one worker, processing requests in the
order they arrive:

```python
import time


def render_receipt(order_id):
    return f"receipt for order {order_id}"


def generate_annual_tax_report(order_count):
    time.sleep(0.3)
    return f"tax report for {order_count} orders"


request_queue = [
    ("report", 1000),
    ("checkout", 501),
    ("checkout", 502),
    ("checkout", 503),
]
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Processing the queue in order and timing
when each request actually finishes:

```python
batch_start = time.perf_counter()
for kind, arg in request_queue:
    if kind == "report":
        generate_annual_tax_report(arg)
    else:
        render_receipt(arg)
    elapsed = time.perf_counter() - batch_start
    print(f"{kind} {arg} finished at {elapsed*1000:.1f}ms since the batch started")
```

Running it produces (real timings vary slightly run to run; the shape
doesn't):

```
report 1000 finished at 300.5ms since the batch started
checkout 501 finished at 300.6ms since the batch started
checkout 502 finished at 300.6ms since the batch started
checkout 503 finished at 300.6ms since the batch started
```

Every checkout finishes at essentially the same moment the report does
— not because rendering a receipt takes 300 milliseconds, but because
none of the three checkouts could even *start* until the one worker
they share finished the report ahead of them in the queue. Nothing
about `render_receipt` is slow; the worker it depends on was busy.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** the request-processing code, restructured to give
  the report its own independent worker.
- **Change type:** add — a separate thread for report generation,
  simulating a separate service.
- **Location:** wherever incoming requests are dispatched.
- **Dependencies:** `threading`, a Python standard-library module, no
  install needed.

### The New Code

The smallest new piece is the independent worker itself:

```python
report_thread = threading.Thread(target=generate_annual_tax_report, args=(1000,))
report_thread.start()
```

### The Updated Project

The report runs on its own thread, started once, while checkouts are
processed on the main one, immediately, without waiting for it:

```python
import threading


batch_start = time.perf_counter()

report_thread = threading.Thread(target=generate_annual_tax_report, args=(1000,))  # ← new
report_thread.start()                                                                # ← new

for order_id in (501, 502, 503):                                                     # ← changed
    render_receipt(order_id)
    elapsed = time.perf_counter() - batch_start
    print(f"checkout {order_id} finished at {elapsed*1000:.1f}ms since the batch started, report service running independently")

report_thread.join()                                                                  # ← new
```

Checkout's own code, `render_receipt`, is completely unchanged — the fix
is entirely about giving the report request somewhere else to run,
rather than making receipts render any faster than they already did.

### Isolating the Concept: Independent Capacity, Measured Directly

The mechanism this lesson demonstrates — giving a slow, rare operation
its own worker so it can't delay a fast, frequent one — is shown
directly through the real checkout-and-report scenario above rather
than a separate, unrelated example, since the measurement itself, run
for real, is this lesson's actual evidence. Running the fixed version:

```python
report_thread = threading.Thread(target=generate_annual_tax_report, args=(1000,))
report_thread.start()

for order_id in (501, 502, 503):
    render_receipt(order_id)
    elapsed = time.perf_counter() - batch_start
    print(f"checkout {order_id} finished at {elapsed*1000:.1f}ms since the batch started, report service running independently")

report_thread.join()
```

Running it produces:

```
checkout 501 finished at 1.3ms since the batch started, report service running independently
checkout 502 finished at 1.3ms since the batch started, report service running independently
checkout 503 finished at 1.4ms since the batch started, report service running independently
```

All three checkouts finish roughly 300 times faster than in the shared-
worker version — proof, not assumption, that the report's own resource
needs were the actual cause of the earlier delay, not anything about
checkout's own code.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`threading.Thread(target=generate_annual_tax_report, args=(1000,))`**
  — constructs a `Thread` object, bound to call
  `generate_annual_tax_report(1000)` once started, but not yet running.
- **`report_thread.start()`** — begins running the thread's target
  function concurrently; execution continues immediately to the next
  line without waiting for it to finish.
- **`report_thread.join()`** — blocks until the report thread finishes,
  placed at the very end so the whole program doesn't exit while the
  report is still running, but positioned *after* all three checkouts
  have already been processed, so it never delays them.

### CS Lens

This is **resource isolation**, achieved here through **concurrency** —
giving two operations with different resource profiles their own,
separate capacity so one can't starve the other. `time.sleep(0.3)`
specifically simulates *I/O-bound* waiting — a slow database query, a
slow external API call — which genuinely does yield control back to
other work in a single Python process, exactly the way this lesson's
own threaded version demonstrates. A genuinely *CPU-bound* heavy
operation (real, sustained computation, not waiting) behaves
differently in Python specifically, because of the Global Interpreter
Lock — a detail this lesson's SE Lens addresses directly, honestly,
rather than letting the measurement above imply more than it actually
proves.

Also recognized in: separate thread pools for fast and slow database
queries in a connection pool manager, dedicated background-job queues
(Celery, Sidekiq) keeping slow work off a web server's own request-
handling threads, and cloud auto-scaling groups configured independently
per service specifically so a traffic spike in one doesn't starve
capacity from an unrelated one.

### SE Lens

The principle is **split when a real, measured resource conflict
justifies it, not by guessing** — this lesson's own 300ms-to-1ms
improvement is a real, measured driver, exactly the kind Lesson 73
argued should decide an architecture question. The honest limit,
stated plainly: `threading.Thread` genuinely solves *this* lesson's
scenario because `time.sleep` releases Python's Global Interpreter
Lock while waiting, simulating I/O-bound work like a slow database
query — a real, CPU-bound tax report, doing sustained computation
rather than waiting, would **not** see the same improvement from a
Python thread alone, because the GIL only lets one thread run Python
bytecode at a time. A genuinely CPU-heavy report needs a separate
process, or a genuinely separate service, to get real parallel
capacity — this lesson's own threaded fix is a faithful simulation of
*why* separate services help, not a complete substitute for building
one for real, CPU-bound work.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running both versions back to back, in the same process, to see the
real gap directly:

```python
def time_shared_worker():
    start = time.perf_counter()
    for kind, arg in request_queue:
        if kind == "report":
            generate_annual_tax_report(arg)
        else:
            render_receipt(arg)
    return time.perf_counter() - start


def time_independent_worker():
    start = time.perf_counter()
    t = threading.Thread(target=generate_annual_tax_report, args=(1000,))
    t.start()
    for order_id in (501, 502, 503):
        render_receipt(order_id)
    last_checkout_time = time.perf_counter() - start
    t.join()
    return last_checkout_time


shared = time_shared_worker()
independent = time_independent_worker()
print(f"time until last checkout finishes, shared worker: {shared*1000:.1f}ms")
print(f"time until last checkout finishes, independent worker: {independent*1000:.1f}ms")
```

The real output (exact numbers vary run to run; the gap doesn't):

```
time until last checkout finishes, shared worker: 300.7ms
time until last checkout finishes, independent worker: 1.4ms
```

A roughly 200x difference, measured, not assumed — the exact kind of
number Lesson 73 argued an architecture decision should be justified
by, now actually in hand for this specific pair of operations.

### Connecting Back

Where Lesson 80 measured a real cost to splitting services (partial
failure), this lesson measures a real benefit (resource isolation) —
together, the two lessons are this curriculum's own demonstration that
the right answer is neither "always split" nor "never split," only
"measure this specific pair of operations and decide."

## Connect the Pieces

Three checkouts were processed twice in this lesson, alongside the
identical tax report request both times. First, sharing one worker: all
three finished roughly 300ms after the batch started, blocked behind the
report regardless of their own speed. Second, with the report given its
own independent worker: the identical three checkouts finished in about
a millisecond, completely unaffected by the report running alongside
them — the same two operations, the same work, the only difference
being whether they shared processing capacity.

## What Breaks Without This

The threaded fix solves this lesson's specific scenario. It says
nothing about what happens if two *genuinely* CPU-bound operations share
a thread pool instead:

```python
def cpu_bound_work(n):
    total = 0
    for i in range(n):
        total += i * i
    return total


start = time.perf_counter()
t = threading.Thread(target=cpu_bound_work, args=(20_000_000,))
t.start()
cpu_bound_work(5_000_000)
t.join()
elapsed = time.perf_counter() - start
print(f"two CPU-bound threads together: {elapsed*1000:.1f}ms")
```

Run for real, this measures roughly the same total time as running both
pieces of work one after another, sequentially — Python's GIL means two
CPU-bound threads don't actually run Python code at the same time,
regardless of how the code is structured. This lesson's own fix, and its
own measured 200x improvement, depended specifically on the report being
I/O-bound (simulated by `time.sleep`, which releases the GIL). A real
tax report doing genuine, sustained computation would need a separate
process, or a genuinely separate deployed service, to get the isolation
this lesson demonstrated — threads alone would not be enough.

## Exercises

1. Replace `time.sleep(0.3)` in `generate_annual_tax_report` with the
   `cpu_bound_work` function from "What Breaks Without This," using a
   large enough `n` to take a similar amount of time. Rerun this
   lesson's own shared-vs-independent-worker comparison and report
   whether the 200x improvement still holds.
2. Using Python's `multiprocessing.Process` instead of
   `threading.Thread`, rerun the CPU-bound comparison from Exercise 1.
   Does a separate process restore the isolation a thread couldn't
   provide? What does that prove about the real difference between "a
   thread" and "a separate service" for CPU-bound work specifically?
3. Using Lesson 73's own architectural-driver vocabulary, write two or
   three sentences arguing whether `render_receipt` and
   `generate_annual_tax_report` should actually be split into two
   separately deployed services in a real production system, weighing
   this lesson's own measured benefit against Lesson 80's own measured
   partial-failure cost.

## Definition of Done

- [ ] The shared-worker and independent-worker versions have both been
      run and measured for real, with actual timing numbers, not
      estimates.
- [ ] The Problem section's 300ms checkout delay has been reproduced for
      real, against the *shared*-worker version, before applying the
      fix.
- [ ] The "Run It" comparison above runs against your own code and
      produces a real, large gap, even if the exact numbers differ from
      the ones shown here.
- [ ] The "What Breaks Without This" CPU-bound scenario has been run
      against your own file, not just read, and you can state in one
      sentence why threading didn't help there the way it did for the
      I/O-bound report.
- [ ] Commit, with a message stating *why*: something like
      `service-oriented architecture: give tax report generation its own
      worker so it can no longer add 300ms to every checkout sharing its
      thread`, not `add threading`.

Up next: Lesson 82, Microservices — taking this lesson's own single
split further, to many independently deployed services, and the real
costs that accumulate as the number of services grows.
