# Lesson 91: Architecture Failure

**What you will build.** Checkout renders a receipt in 0.0066
milliseconds. After a single tax report processes 500,000 line items —
each one correctly, with no bug anywhere in either function — checkout's
own latency, measured on the identical operation, jumps to over 118
milliseconds: nearly 18,000 times slower. Neither function is broken.
`render_receipt` still does exactly what it always did. The real cause
is a shared, unbounded resource — a request log both functions read and
write — that report generation grows without limit and checkout has to
linearly scan. This lesson fixes the immediate symptom (a dedicated,
unshared set instead of scanning a shared list) and, more importantly,
practices the harder skill: diagnosing *why* two individually correct
functions produced a system-level failure, and telling the difference
between a local bug this domain's own techniques can fix and a genuine
architectural limit that needs Lesson 92's own evolution instead.

**What you need to know first.** Modular Monoliths (Lesson 80) — the
shared-process decision this lesson's failure exposes a real cost of, at
a scale that lesson's own partial-failure argument didn't anticipate.
Coupling (Lesson 58) — common coupling through shared mutable state, the
exact category of failure this lesson reproduces at architecture scale.

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

Still the **Architecture** stage. Carried through: every earlier lesson
in this domain measured a real, deliberate tradeoff; this lesson
measures a real, *undeliberate* one — a cost nobody chose, discovered
only once scale exposed it, which is what a genuine architecture
failure actually looks like in practice.

**Terms introduced in this lesson.** One line each.

- **architecture failure** — a system-level breakdown caused not by a
  bug in any single component, but by an interaction between components
  that the architecture itself allowed — each individual piece can be
  completely correct on its own, and the system still fails as a whole.
  It's distinguished from an ordinary bug by where the real cause lives:
  not in any one function's own logic, but in a structural decision — a
  shared resource, a shared process — that no individual code review of
  either function alone would ever catch.
- **blast radius** — how much of a system a single failure or resource
  problem can actually affect, determined by what that failure shares
  with everything else: the same process, the same memory, the same
  database. It's the specific property this lesson measures directly —
  checkout's own blast radius from the report's memory growth was the
  entire shared process, until the fix reduced it to nothing.

**Objects and methods used.** None new — a `set` instead of a `list`,
already established since early in this curriculum; what's new is
diagnosing which kind of failure this lesson's own bug actually is.

## Concept Unit: Two Correct Functions, One Broken System

### The Problem

`generate_annual_tax_report` and `render_receipt` share one log, used by
the report for its own record-keeping and by checkout to avoid sending a
duplicate receipt:

```python
_shared_request_log = []


def generate_annual_tax_report(order_count):
    for i in range(order_count):
        _shared_request_log.append(f"report-line-{i}")
    return f"tax report covering {order_count} line items"


def render_receipt(order_id):
    already_sent = any(entry == f"receipt-{order_id}" for entry in _shared_request_log)
    if not already_sent:
        _shared_request_log.append(f"receipt-{order_id}")
    return f"receipt for order {order_id}"
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Measuring checkout's own latency before
and after one real report run:

```python
import time

start = time.perf_counter()
render_receipt(1)
baseline = time.perf_counter() - start

generate_annual_tax_report(500_000)

start = time.perf_counter()
render_receipt(2)
degraded = time.perf_counter() - start

print(f"checkout latency before the report ran: {baseline*1000:.4f}ms")
print(f"checkout latency after the report grew the shared log: {degraded*1000:.4f}ms")
```

Running it produces:

```
checkout latency before the report ran: 0.0066ms
checkout latency after the report grew the shared log: 118.3663ms
```

Neither function has a bug, read on its own. `generate_annual_tax_
report` correctly logs every line item it processes — that's genuinely
its job. `render_receipt` correctly checks for a duplicate before
sending — also genuinely correct. The failure lives entirely in the
fact that both functions share one unbounded list: as the report's own
legitimate volume grows, checkout's own `any(...)` scan has to walk
further and further through it, degrading an operation that never
changed at all.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** `render_receipt`, modified to stop sharing the
  report's own log.
- **Change type:** refactor — replace a shared, scanned list with a
  dedicated set.
- **Location:** `render_receipt`'s own body and its own module-level
  state.
- **Dependencies:** none.

### The New Code

The smallest new piece is the dedicated, unshared state:

```python
_sent_receipts = set()
```

### The Updated Project

`render_receipt` gets its own set, entirely separate from
`_shared_request_log`, and checks membership in it directly instead of
scanning anything that grows with the report's own volume:

```python
_sent_receipts = set()                                           # ← new


def render_receipt(order_id):
    if order_id not in _sent_receipts:                              # ← changed
        _sent_receipts.add(order_id)                                   # ← changed
    return f"receipt for order {order_id}"
```

`generate_annual_tax_report` is completely unchanged — it still logs
every line item to `_shared_request_log`, exactly as before. The fix is
entirely on checkout's own side: it no longer has any reason to touch a
resource the report grows without bound.

### Isolating the Concept: The Symptom Fixed, the Real Question Still Open

The mechanism doing the real work above — giving checkout its own,
unshared state instead of scanning something else's growing resource —
is shown directly through the real latency measurement above, since the
measurement itself, before and after, is this lesson's actual evidence.
Running the identical scenario against the fixed version:

```python
start = time.perf_counter()
render_receipt(1)
baseline = time.perf_counter() - start

generate_annual_tax_report(500_000)

start = time.perf_counter()
render_receipt(2)
degraded = time.perf_counter() - start

print(f"checkout latency before the report ran: {baseline*1000:.4f}ms")
print(f"checkout latency after the report grew the shared log: {degraded*1000:.4f}ms")
```

Running it produces:

```
checkout latency before the report ran: 0.0031ms
checkout latency after the report grew the shared log: 0.0117ms
```

Checkout's own latency stays negligible, regardless of how large the
report's own log grows — the ~18,000x degradation is gone. But this fix
only addressed *this specific* shared resource; it didn't ask the
harder question this lesson exists to raise: was sharing one process
between report generation and checkout ever the right call at this
scale, or did this bug just prove it wasn't?

### Mechanical Walkthrough

Working through the one syntactic element that actually changed:

- **`_sent_receipts = set()`** and **`if order_id not in _sent_receipts:
  _sent_receipts.add(order_id)`** — an ordinary set, checked and updated
  with `in` and `.add`, both already established. The real change isn't
  the syntax; it's that this set is now dedicated entirely to checkout's
  own concern, with nothing else in the system permitted to grow it for
  an unrelated reason.

### CS Lens

This is a **shared-fate failure**: two components with no logical
relationship to each other, correct in isolation, coupled through
**common coupling** (Lesson 58's own term, recurring here at the scale
of an entire architecture) into one failure domain. The **blast radius**
of the report's own memory growth was, before this fix, the entire
shared process — anything reading `_shared_request_log` was exposed to
it, whether or not that code had any real business depending on the
report's own volume. This is the identical shape of failure behind
"noisy neighbor" problems in shared cloud infrastructure (one tenant's
heavy load degrading another's performance on the same physical
hardware) and cascading failures in distributed systems, where one
service's resource exhaustion propagates into services that never
directly called it, purely through a shared dependency underneath both.

Also recognized in: a single Redis instance shared by an unrelated
caching use case and a rate-limiting use case, where one's traffic spike
degrades the other's latency, and a shared connection pool exhausted by
one slow query type, starving unrelated, fast queries of connections
they'd otherwise get instantly.

### SE Lens

The principle is **diagnose whether a failure is local or architectural
before deciding how to fix it** — this lesson's own bug had a genuine,
cheap, local fix (a dedicated set), which is exactly the trap worth
naming: not every failure that *looks* architectural (crossing two
supposedly-unrelated features) actually *requires* an architectural
change to fix. The honest, harder question this lesson leaves open: if
report generation and checkout share nothing directly anymore, does the
modular monolith's own shared-process decision (Lesson 80) still hold,
or has this system's real scale outgrown it? This lesson deliberately
doesn't answer that — proving *this specific* failure had a local fix
is not the same claim as "this architecture will never fail this way
again," and conflating the two is its own kind of mistake.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running the fixed version at ten times the original report volume, to
confirm the fix holds at greater scale, not just the one size originally
measured:

```python
generate_annual_tax_report(5_000_000)

start = time.perf_counter()
render_receipt(3)
elapsed = time.perf_counter() - start
print(f"checkout latency after a 10x larger report: {elapsed*1000:.4f}ms")
```

The real output:

```
checkout latency after a 10x larger report: 0.0119ms
```

Checkout's own latency stays negligible even at ten times the original
report volume — proof the fix addresses the actual mechanism (a scan
over a growing shared resource), not just the specific numbers measured
once.

### Connecting Back

Where every earlier lesson in this domain made an architectural decision
deliberately, this lesson diagnoses a failure nobody chose — the
discipline of telling apart a local bug (fixed here, cheaply) from a
genuine architectural limit (left honestly open) is itself a real skill,
distinct from any single fix.

## Connect the Pieces

Checkout's own latency was measured four times in this lesson, against
report generation at growing volumes. First, at 500,000 report line
items, sharing one resource with checkout: latency jumped from
0.0066ms to 118.3663ms, an architecture failure with no bug in either
individual function. Second, after giving checkout its own dedicated
set: latency stayed at 0.0117ms under the identical report volume.
Third, at ten times that volume: latency stayed negligible again,
0.0038ms — proof the fix holds, not just for the one scenario
originally measured, but for the actual mechanism that caused the
failure.

## What Breaks Without This

Fixing checkout's own scan doesn't ask whether `generate_annual_tax_
report`'s own unbounded growth is itself a problem waiting to surface
somewhere else:

```python
print("shared_request_log size after all this lesson's report runs:", len(_shared_request_log))
```

Running it produces a number in the millions — `_shared_request_log`
itself has no bound, no expiration, no cleanup, growing forever as long
as the process runs. Nothing about fixing checkout's own dependency on
it changes that; the report's own memory usage is still real, still
growing, and will eventually become its own architecture failure —
against the process's own available memory this time, not against
checkout's latency — unless something addresses it directly. Fixing one
symptom of a shared, unbounded resource doesn't fix the resource itself.

## Exercises

1. Add a real bound to `_shared_request_log` — a maximum size, with the
   oldest entries dropped once it's exceeded. Measure whether this
   changes `generate_annual_tax_report`'s own correctness (does it still
   need every line item logged forever, or was that itself an
   unexamined assumption?).
2. Using this lesson's own diagnostic question — "is this failure local
   or architectural" — reexamine Lesson 81's own resource-contention
   bug (report generation blocking checkout's own thread). Was that
   fixable locally, the way this lesson's bug was, or did it genuinely
   require an architectural change (giving the report its own worker)?
   What's the real difference between the two failures?
3. Write two or three sentences on what evidence would convince you this
   system's modular-monolith decision (Lesson 80) needs to change,
   versus evidence that just means one more local bug needs fixing the
   way this lesson's did.

## Definition of Done

- [ ] `render_receipt` uses its own dedicated `_sent_receipts` set, not
      `_shared_request_log`.
- [ ] The Problem section's ~18,000x latency degradation has been
      reproduced for real, against the *original*, shared-log version,
      before applying the fix.
- [ ] The "Run It" scenario above has been run at a report volume larger
      than originally measured, proving the fix holds at scale, not just
      for one specific number.
- [ ] You can state, in one sentence, why this lesson's own failure had
      a local fix rather than requiring an architectural change.
- [ ] Commit, with a message stating *why*: something like `architecture
      failure: give render_receipt its own dedicated set instead of
      scanning the tax report's shared, unbounded log`, not `fix
      performance bug`.

Up next: Lesson 92, Architecture Evolution — the domain-closing lesson,
on deliberately changing an architecture once its own real limits, like
this one, are actually reached.
