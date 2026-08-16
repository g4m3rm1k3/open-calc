# Lesson 82: Microservices

**What you will build.** Placing an order calls five services in
sequence — inventory, payments, shipping, notifications, loyalty — each
individually reliable, 99% of the time. Simulated across 100,000 orders,
each service failing independently and randomly at its own 1% rate, the
*order's* own success rate comes out to roughly 95.1%, not 99% —
matching the theoretical prediction, `0.99⁵`, almost exactly. This
lesson fixes it not by making any single service more reliable, but by
shrinking the **critical path**: notifications and loyalty don't
actually need to block the order at all, so their failures become
best-effort instead of order-failing, and the measured success rate
rises to roughly 97.0%, using the identical, unimproved services. The
transferable problem: Lesson 81 measured a real benefit to splitting one
operation across two services; at five, ten, or fifty services, the
dominant new cost isn't any one service's own reliability — it's the
multiplication of all of them together, a cost that grows with every
service added to a request's own path, whether or not any individual
one gets worse.

**What you need to know first.** Service-Oriented Architecture (Lesson
81) — the single split this lesson extends to many. Modular Monoliths
(Lesson 80) — partial failure, the specific cost this lesson now
compounds across five services instead of two, with real numbers
attached.

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

Still the **Architecture** stage. Carried through: Lesson 81 measured
one split's real benefit; this lesson measures what happens once
splitting becomes the system's default shape — the same partial-failure
cost Lesson 80 named, now compounding across every service a single
request actually depends on.

**Terms introduced in this lesson.** One line each.

- **microservices** — an architecture built from many independently
  deployed, independently scaled services, each owning one narrow
  capability. At this scale, the compounding cost of partial failure
  across every service a request depends on becomes the central design
  problem to actively manage — not an occasional risk, the dominant one.
- **critical path** — the minimum sequence of services a single
  operation genuinely cannot succeed without. Every service *not* on the
  critical path is a candidate to be made non-blocking or best-effort,
  since its own failure doesn't have to fail the whole operation. It's
  the concrete lever this lesson's fix pulls — shrinking the critical
  path improves the compounded reliability math directly, without
  improving any individual service at all.

**Objects and methods used.**

- **`random.random()`** (from Python's standard-library `random`
  module)
  - *What it is:* returns a random floating-point number between `0.0`
    and `1.0`.
  - *Implementation:* `random.random() >= failure_rate` simulates a call
    succeeding with probability `1 - failure_rate` — over many calls,
    the fraction that return `True` converges toward that probability.
  - *Its use:* this lesson uses it to simulate many independent service
    calls, each with its own small chance of failure, so the *compound*
    success rate across a whole chain of them can be measured empirically
    instead of only calculated on paper.

## Concept Unit: Five Reliable Services, One Less Reliable Order

### The Problem

Placing an order calls five services in sequence, each with its own
small, independent chance of failure:

```python
import random


def call_service(failure_rate):
    return random.random() >= failure_rate


def place_order_via_five_services(failure_rate):
    services = ["inventory", "payments", "shipping", "notifications", "loyalty"]
    for name in services:
        if not call_service(failure_rate):
            return False
    return True
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Simulating 100,000 orders, each service
failing independently at a 1% rate:

```python
trials = 100000
successes = sum(1 for _ in range(trials) if place_order_via_five_services(failure_rate=0.01))
print(f"each service has a 99% success rate (1% failure)")
print(f"observed order success rate across {trials} trials: {successes/trials*100:.2f}%")
print(f"theoretical: {0.99**5*100:.2f}%")
```

Running it produces:

```
each service has a 99% success rate (1% failure)
observed order success rate across 100000 trials: 95.12%
theoretical: 95.10%
```

Every service, individually, is reliable 99% of the time — a number
that sounds nearly perfect on its own. The order, depending on all five
of them succeeding in sequence, only succeeds about 95.1% of the time —
a real, measured, four-point gap that no single service's own team
would ever see in their own monitoring, because no single service's own
reliability actually changed.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** the order-placement code, restructured to shrink
  the critical path.
- **Change type:** refactor — notifications and loyalty become
  best-effort instead of blocking.
- **Location:** `place_order`'s own body.
- **Dependencies:** none.

### The New Code

The smallest new piece is the critical path itself, named explicitly:

```python
critical_services = ["inventory", "payments", "shipping"]
```

### The Updated Project

Only the three services an order genuinely cannot succeed without are
allowed to fail the order; the other two are called, but their own
failures no longer matter to the result:

```python
def place_order_critical_path_only(failure_rate):
    critical_services = ["inventory", "payments", "shipping"]    # ← new
    for name in critical_services:                                  # ← changed
        if not call_service(failure_rate):
            return False

    for name in ["notifications", "loyalty"]:                       # ← new
        call_service(failure_rate)                                    # ← new, result intentionally ignored
    return True
```

`notifications` and `loyalty` are still called — a real system would
still want them to run — but their own individual success or failure no
longer determines whether the order itself succeeded.

### Isolating the Concept: Shrinking the Chain, Measured Directly

The mechanism this lesson demonstrates — the compound probability of a
chain of independent services, and the real improvement from shortening
it — is shown directly through the real order-placement simulation
above, since the measurement itself, run at real scale (100,000 trials),
is this lesson's own evidence, and a smaller, unrelated example would
only restate the identical math with smaller, less convincing numbers.
Running the fixed, three-service critical path through the identical
simulation:

```python
successes = sum(1 for _ in range(trials) if place_order_critical_path_only(failure_rate=0.01))
print(f"observed order success rate, 3-service critical path, across {trials} trials: {successes/trials*100:.2f}%")
print(f"theoretical: {0.99**3*100:.2f}%")
```

Running it produces:

```
observed order success rate, 3-service critical path, across 100000 trials: 97.04%
theoretical: 97.03%
```

Nearly two full percentage points better, at the same 100,000-order
scale — from the identical five services, none of them individually
more reliable than before, purely from removing two of them from the
path an order's own success actually depends on.

### Mechanical Walkthrough

Working through the one syntactic element that actually changed:

- **`for name in ["notifications", "loyalty"]: call_service(failure_rate)`**
  — still calls both services, exactly as before, but the loop's own
  `if not call_service(...): return False` guard is gone; the return
  value is computed and discarded, meaning neither service's own
  success or failure has any further effect on `place_order_critical_
  path_only`'s own return value.

### CS Lens

This is the **compound probability** of independent events, the same
mathematics behind a chain's overall reliability being the *product* of
each link's own reliability, not their average: five links at 99% chain
to `0.99⁵ ≈ 95.1%`, not 99%. This is why a real system's own
service-level objective (SLO) math has to account for every dependency
in a request's actual path, not just each service's own individually
reported uptime — a common, real mistake in production systems, where
five services each individually meeting a "99.9% uptime" target still
combine into a customer-facing experience noticeably below that number.

Also recognized in: RAID storage reliability calculations (multiple
disks' combined failure probability), network reliability across
multiple hops each with their own small packet-loss rate, and any
pipeline of independent steps — a CI/CD pipeline's own stages, a data
processing pipeline's own transforms — where the pipeline's overall
success rate is always lower than its least reliable individual stage,
compounded by every other stage in the chain.

### SE Lens

The principle is **minimize the critical path, not just each service's
own individual reliability** — the alternative many teams reach for
first, improving each service's own uptime number in isolation, has
real, diminishing returns once several already-reliable services are
chained together: improving `notifications` from 99% to 99.9% barely
moves the *order's* own success rate if `notifications` was never on
the critical path to begin with, while removing it from the critical
path entirely — this lesson's actual fix — improves the order's real
number regardless of how reliable `notifications` itself ever becomes.
The real cost: `notifications` and `loyalty` failures are now silent to
the caller of `place_order`, which is exactly right for genuinely
optional side effects, and exactly wrong if either one turns out to
matter more than assumed — deciding which services truly belong off the
critical path is a real, consequential judgment call, not a
mechanical rule.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running both versions back to back, at the identical scale, to see the
real gap directly:

```python
random.seed(42)
five_service_successes = sum(1 for _ in range(trials) if place_order_via_five_services(failure_rate=0.01))

random.seed(42)
critical_path_successes = sum(1 for _ in range(trials) if place_order_critical_path_only(failure_rate=0.01))

print(f"5-service critical path: {five_service_successes/trials*100:.2f}%")
print(f"3-service critical path: {critical_path_successes/trials*100:.2f}%")
```

The real output:

```
5-service critical path: 95.12%
3-service critical path: 97.04%
```

Both runs use the identical seeded random sequence for their first
three, shared critical calls — the nearly two-point gap is real,
attributable entirely to which services were allowed to fail the order,
not to any difference in the underlying random simulation.

### Connecting Back

Where Lesson 81 measured a real benefit from one split, this lesson
measures the real, compounding cost that accumulates once splitting
becomes a system's default shape — and shows that the fix isn't
necessarily making each piece more reliable, it's minimizing how many
pieces a single operation's own success genuinely depends on.

## Connect the Pieces

100,000 simulated orders were placed twice in this lesson, against the
identical five services, each independently failing 1% of the time.
First, with all five services on the critical path: roughly 95.1%
succeeded, a real, four-point gap below any individual service's own
99% reliability. Second, with only inventory, payments, and shipping on
the critical path: roughly 97.0% succeeded — the same five services,
the same 1% individual failure rate, with the only real change being
how many of them were allowed to fail the order at all.

## What Breaks Without This

Shrinking the critical path to three services still leaves those three
fully exposed to the identical compounding math. Adding a fourth
critical service recreates the same cost, at a smaller scale:

```python
def place_order_four_critical_services(failure_rate):
    critical_services = ["inventory", "payments", "shipping", "fraud_check"]
    for name in critical_services:
        if not call_service(failure_rate):
            return False
    return True


random.seed(42)
four_service_successes = sum(1 for _ in range(trials) if place_order_four_critical_services(failure_rate=0.01))
print(f"4-service critical path: {four_service_successes/trials*100:.2f}%")
```

Run for real, this is what comes back:

```
4-service critical path: 96.04%
```

Adding one more genuinely critical service — a real fraud check might
legitimately need to block the order — drops the success rate back down,
measurably, even though the fraud check itself is just as reliable as
every other service. Minimizing the critical path is a one-time
decision that has to be revisited every time a new dependency is added
to it; nothing about this lesson's own fix prevents the critical path
from growing again the next time a genuinely necessary step is added.

## Exercises

1. Using this lesson's own simulation code, find the individual
   per-service failure rate at which a 3-service critical path's overall
   success rate drops below 95% — the exact number the original
   5-service version had at 1% per service. What does that tell you
   about how much "budget" for unreliability each critical service
   actually has?
2. `notifications` failing silently might be the wrong choice for a real
   system — a customer who never gets their confirmation email has a
   real problem, even if the order itself succeeded. Design, without
   necessarily implementing it, a middle option between "blocks the
   order" and "fails completely silently."
3. Using Lesson 81's own resource-contention lesson alongside this one,
   write two or three sentences on how *many* services, each
   individually reliable and individually fast, can still produce a
   slow, unreliable customer experience — even when every single
   service's own dashboard looks healthy.

## Definition of Done

- [ ] `place_order_critical_path_only` fails the order only on
      `inventory`, `payments`, or `shipping` failing — never on
      `notifications` or `loyalty`.
- [ ] The Problem section's 95.1% success rate has been reproduced for
      real, at real scale (100,000 or more trials), against the
      *original* 5-service version, before applying the fix.
- [ ] The "Run It" comparison above runs against your own code and
      produces a real, measured gap, even if it differs slightly from
      the numbers shown here.
- [ ] The "What Breaks Without This" 4-critical-service scenario has
      been run against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like
      `microservices: shrink the order-placement critical path to three
      services, improving measured success rate from ~95% to ~97% with
      no change to any individual service`, not `make notifications
      async`.

Up next: Lesson 83, Event-Driven Architecture — a different way to
shrink a critical path, by decoupling non-critical work from the
request's own timeline entirely instead of just excusing its failures.
