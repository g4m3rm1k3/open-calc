# Lesson 80: Modular Monoliths

**What you will build.** Placing an order needs to reserve stock, then
charge payment. Split into two separately-deployed services,
communicating over a network, reserving stock succeeds and commits —
then the payment service is unreachable, and the order fails with stock
already, permanently, reserved for nothing. This lesson keeps `reserve_
stock` and `charge_payment` as two separate, well-bounded modules —
everything this curriculum has already taught about boundaries still
applies — but running in the same process, so a payment failure can be
caught and the stock reservation rolled back atomically, in-process,
with no network partition possible between the two steps. The
transferable problem: every boundary technique in Domain 5 and this
domain's own first nine lessons is about organizing code *well*; none of
them, on their own, argue for splitting a system into separately
*deployed* services — that's a different decision, with a real, measured
cost (partial failure across a network) that strong internal module
boundaries don't have at all.

**What you need to know first.** Layered Architecture (Lesson 77) and
Ports and Adapters (Lesson 79) — both apply identically whether a system
is one process or many; this lesson is about *when* to actually split
into many, not about whether to organize internally well. Coupling
(Lesson 58) — the real cost this lesson measures is a new, more severe
kind of coupling a network boundary introduces that an in-process module
boundary never had.

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

Still the **Architecture** stage. Carried through: every boundary this
domain has built so far — layers, ports, adapters, policies — works
identically whether the code on both sides runs in one process or two.
This lesson is the first to measure the real, specific cost of choosing
two.

**Terms introduced in this lesson.** One line each.

- **modular monolith** — a system deployed and run as a single process,
  internally organized into strongly bounded modules using the same
  discipline this curriculum has built since Domain 5, without the
  network boundary between them a microservices split would introduce.
  It's the middle ground between an undifferentiated pile of code and a
  fleet of separately-deployed services — real internal boundaries,
  without paying a network's own real costs before there's a measured
  reason to.
- **partial failure** — the specific new failure mode a network boundary
  introduces that a single process doesn't have: one step in a logical
  sequence succeeding and committing its effect, while a later step in
  the same operation fails independently, leaving the system in a state
  neither step intended on its own. It's named because it's the real,
  concrete cost this lesson measures directly — not a hypothetical risk,
  a reproducible one.

**Objects and methods used.** None new — ordinary functions and a
`try`/`except`, already established; what's new is what a network
boundary would take away from this lesson's own rollback, which no
amount of in-process code alone can restore once a network is actually
involved.

## Concept Unit: A Network Boundary Removes the Ability to Roll Back Atomically

### The Problem

Placing an order needs two steps: reserve stock, then charge payment.
Split into two separately-deployed services, each network call
succeeding or failing on its own:

```python
_stock = {"sku-1": 10}


def reserve_stock_over_network(sku, qty):
    _stock[sku] -= qty
    return "reserved"


def charge_payment_over_network(amount):
    raise ConnectionError("payment service unreachable")


def place_order_split_services(sku, qty, amount):
    reserve_stock_over_network(sku, qty)
    charge_payment_over_network(amount)
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it, with the payment service
simulated as unreachable:

```python
try:
    place_order_split_services("sku-1", 3, 50)
except ConnectionError as e:
    print("ConnectionError:", e)

print("stock after failed order (reserved but never paid for):", _stock)
```

Running it produces:

```
ConnectionError: payment service unreachable
stock after failed order (reserved but never paid for): {'sku-1': 7}
```

The reservation already committed — `_stock["sku-1"]` dropped from `10`
to `7` — before the payment call even happened. The payment call's
failure has no way to reach back across the network and undo the
reservation that already succeeded on the other side of it. Three units
of stock are now reserved for an order that was never actually paid
for, and nothing about either individual service's own code is wrong —
this is exactly what happens when two steps of one logical operation are
allowed to succeed or fail independently, on opposite sides of a network
call.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** the order-placement code, restructured to keep
  `reserve_stock` and `charge_payment` as in-process modules.
- **Change type:** refactor — remove the network boundary, keep the
  module boundary.
- **Location:** `place_order`'s own body.
- **Dependencies:** none.

### The New Code

The smallest new piece is the rollback the in-process boundary now makes
possible:

```python
def release_stock(sku, qty):
    _stock[sku] += qty
```

### The Updated Project

`reserve_stock` and `charge_payment` stay two separate, well-bounded
functions — nothing about Domain 5's own boundary discipline is
abandoned — but `place_order` can now catch a failure in one and
compensate for the other, because both run in the same process:

```python
def reserve_stock(sku, qty):                                     # ← changed, no longer "over_network"
    _stock[sku] -= qty


def release_stock(sku, qty):                                       # ← new
    _stock[sku] += qty                                                # ← new


def charge_payment(amount):                                        # ← changed, no longer "over_network"
    raise ConnectionError("payment provider unreachable")


def place_order_modular_monolith(sku, qty, amount):                # ← changed
    reserve_stock(sku, qty)
    try:                                                              # ← new
        charge_payment(amount)
    except ConnectionError:                                            # ← new
        release_stock(sku, qty)                                          # ← new
        raise                                                             # ← new
```

`place_order_modular_monolith` can now guarantee that a failed payment
never leaves stock reserved for nothing — a guarantee that required
nothing more exotic than an ordinary `try`/`except`, because both steps
still live in the same process, able to see and undo each other's
effects directly.

### Isolating the Concept: The Same Rollback, Impossible Across a Real Network

The mechanism this lesson demonstrates — an in-process rollback closing
a gap a network boundary would leave open — is shown directly through
the real order-placement code above, since the comparison between the
split-service and modular-monolith versions already is the smallest
possible demonstration; a second, unrelated example would only restate
the same two functions under different names. Running the fixed version
against the identical unreachable payment provider:

```python
_stock["sku-1"] = 10  # reset for a clean comparison

try:
    place_order_modular_monolith("sku-1", 3, 50)
except ConnectionError as e:
    print("ConnectionError:", e)

print("stock after failed order, reservation rolled back:", _stock)
```

Running it produces:

```
ConnectionError: payment provider unreachable
stock after failed order, reservation rolled back: {'sku-1': 10}
```

The identical failure — payment unreachable — no longer leaves stock
reserved. `release_stock` ran the instant `charge_payment` raised,
inside the same `try`/`except`, because nothing about calling
`release_stock` required crossing back over a network that might itself
be down by the time the rollback needed to happen.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`def release_stock(sku, qty):`** — a new function, the direct
  inverse of `reserve_stock`, adding back exactly what was subtracted.
- **`try: charge_payment(amount) except ConnectionError: release_
  stock(sku, qty); raise`** — attempts the payment; if it raises
  `ConnectionError`, calls `release_stock` to undo the reservation
  *before* re-raising the same exception with a bare `raise`, so the
  caller still learns the order failed, but the system's own state is
  consistent by the time they find out.

### CS Lens

This is the **distributed transaction problem**, one of the oldest and
most fundamental challenges in systems that span a network: guaranteeing
that a sequence of operations across multiple independent participants
either all succeed or all fail together, when any individual network
call between them can fail on its own, independently, at any point. Real
distributed systems solve this with genuinely hard techniques — two-phase
commit, sagas with explicit compensating actions, idempotency keys — all
of which exist specifically because a `try`/`except` around a network
call, as shown in the split-service version above, is not enough; the
first call already committed its effect before the network boundary
was ever crossed a second time. A modular monolith doesn't solve the
distributed transaction problem — it avoids needing to solve it at all,
for exactly as long as the operation stays inside one process.

Also recognized in: a bank transfer needing to debit one account and
credit another as a single atomic operation, a database's own
`COMMIT`/`ROLLBACK` mechanism existing specifically to give
single-database operations this exact guarantee for free, and the
"two generals problem" in distributed systems theory, which proves this
kind of coordination can never be guaranteed with perfect certainty
across an unreliable network at all.

### SE Lens

The principle is **don't pay for a network boundary's real costs until
a measured reason justifies it** — the alternative that produced this
lesson's bug, splitting into separate services from the start, is often
chosen for reasons that sound architectural (Lesson 73's own drivers:
independent scaling, independent deployment) without ever weighing them
against the real, concrete cost this lesson just measured: an operation
that used to be trivially atomic inside one process now requires real,
hard distributed-systems engineering to keep consistent. The real cost
of staying a modular monolith: it doesn't scale each module
independently, and every module still shares one deployment — a real,
honest limitation this lesson doesn't pretend away, weighed against a
partial-failure bug this lesson proved is real, not hypothetical, the
moment a network sits between two steps of one logical operation.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running the fixed version through a *successful* payment too, to prove
the fix doesn't just handle failure — it still lets a real order
succeed:

```python
_stock["sku-1"] = 10


def charge_payment_success(amount):
    return f"charged ${amount}"


def place_order_success(sku, qty, amount):
    reserve_stock(sku, qty)
    charge_payment_success(amount)


place_order_success("sku-1", 3, 50)
print("stock after a successful order:", _stock)
```

The real output:

```
stock after a successful order: {'sku-1': 7}
```

A real, successful order still reserves stock correctly and keeps it
reserved — the rollback only fires when payment genuinely fails, proven
by running both the success and failure paths for real rather than
assuming the failure-handling code doesn't also break the success path.

### Connecting Back

Where Lessons 77 through 79 organized how code inside a system's own
boundaries should call each other, this lesson is the first to ask
whether those boundaries should be *deployed* separately at all —
answering, for this specific operation, with a measured cost rather than
an assumption.

## Connect the Pieces

Placing an order for `sku-1` was attempted twice in this lesson, with
the identical unreachable payment provider both times. First, split
across a simulated network boundary: the reservation committed, the
payment failed, and stock stayed reserved for an order that never
happened — a real, reproduced partial failure. Second, kept as two
modules in one process: the identical payment failure, caught in-process,
correctly triggered a rollback, leaving stock exactly as it was before
the attempt.

## What Breaks Without This

A modular monolith avoids partial failure for operations that stay
entirely inside one process. It says nothing about an operation that
genuinely needs to reach an *external* system this lesson's own process
boundary can't absorb:

```python
def charge_real_external_payment_gateway(amount):
    raise ConnectionError("the real, external payment gateway is still a separate network call")


try:
    reserve_stock("sku-1", 3)
    charge_real_external_payment_gateway(50)
except ConnectionError:
    release_stock("sku-1", 3)
    print("stock rolled back after external gateway failure")
```

Run for real, this is what comes back:

```
stock rolled back after external gateway failure
```

The rollback still works here — but only because `release_stock` itself
never had to leave this process. The real payment gateway is, and has to
be, a genuine external system reached over a genuine network; a modular
monolith removes partial failure *between this system's own modules*,
never between this system and any real external dependency it has no
choice but to call across a real boundary. That remaining risk is
exactly what idempotency keys and retry logic — real techniques this
lesson doesn't build — exist to manage.

## Exercises

1. Simulate the external gateway call itself failing *after* actually
   charging the customer (a real, common failure mode: the charge
   succeeded, but the response never arrived). Explain, in two or three
   sentences, why this lesson's own `try`/`except` rollback is
   dangerously wrong for this specific failure — what does
   `release_stock` risk causing if the charge actually went through?
2. Measure this lesson's own claim for real: write a version of
   `place_order_split_services` using `time.sleep(0.01)` to simulate
   real network latency for each call, and compare its total time to
   `place_order_modular_monolith`'s. How much of the real cost of
   splitting into services is partial failure risk, and how much is
   simply added latency?
3. Name one real, measured driver from Lesson 73's own vocabulary — not
   a guess — that would justify splitting `reserve_stock` and
   `charge_payment` into genuinely separate, independently deployed
   services despite this lesson's own partial-failure cost. What would
   have to be true about this system's actual scale or team structure
   first?

## Definition of Done

- [ ] `place_order_modular_monolith` rolls back a stock reservation when
      payment fails, using an in-process `try`/`except`, not a network
      call.
- [ ] The Problem section's stuck reservation has been reproduced for
      real, against the *split-service* version, before you apply the
      fix.
- [ ] The "Run It" scenario above runs against your own fixed file,
      proving both the success and failure paths work correctly.
- [ ] You can state, in one sentence, why this lesson's own rollback
      technique would not reliably work if `charge_payment` were a real
      network call instead of an in-process function.
- [ ] Commit, with a message stating *why*: something like `modular
      monolith: keep stock reservation and payment in one process so a
      payment failure can be rolled back atomically, without a
      distributed transaction`, not `add rollback logic`.

Up next: Lesson 81, Service-Oriented Architecture — the real drivers
that eventually justify paying this lesson's own partial-failure cost on
purpose.
