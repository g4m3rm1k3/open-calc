# Lesson 57: Dependency Direction

**What you will build.** `order_lifecycle.py` — this domain's most
foundational module, reused by checkout, reporting, and everything else
built so far — starts importing `customer_activity.py` directly, so
`transition_to` can log every move to a customer's activity feed. The
activity feed's own logging function starts failing, and suddenly a
routine, otherwise-legal `PAID` transition raises an unrelated
`RuntimeError` — a core lifecycle operation broken by a failure in a
narrow, specific concern that has nothing to do with whether the
transition itself was legal. This lesson removes the dependency in that
direction entirely, moving the logging call to whichever caller actually
coordinates both modules, so `order_lifecycle.py` no longer needs
`customer_activity.py` to exist at all. The transferable problem: for
any two related pieces of code, the dependency between them can point
either way, and which way it points is a real design decision — not
something that falls out automatically from which feature happened to
be built second.

**What you need to know first.** Dependency (Lesson 56) — the precise
relationship this lesson now asks a directional question about. What Is
a Module? (Lesson 52) — `order_lifecycle.py` and `customer_activity.py`
as two separate, already-established modules; this lesson is about
which one should be allowed to `import` the other.

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

Still the **Design** stage. Carried through: Lesson 56 named what a
dependency actually is; this lesson asks which way it should point — the
same question the *Architecture* stage further down this pipeline asks
about entire services, where a wrong-direction dependency between two
teams' systems is far more expensive to reverse than it is between two
Python modules in one lesson.

**Terms introduced in this lesson.** One line each.

- **dependency direction** — which of two related pieces of code is the
  one that names, imports, and relies on the other. It's named as its
  own decision because for any two pieces of code that need to interact,
  the relationship could point either way, or not exist as a direct
  dependency at all — which way it actually points is a real design
  choice, not an accident of which file happened to get written first.
- **stable module** — a module other parts of a system are meant to
  build on and reuse widely, whose own correctness shouldn't be put at
  risk by problems in narrower, more specific parts of the system. It's
  worth naming because it's the practical test for which way a
  dependency should point: toward the module more code already relies
  on being trustworthy, not away from it.

**Objects and methods used.** None new — this lesson's fix removes a
dependency rather than introducing a new language construct.

## Concept Unit: A Foundational Module Should Not Depend on a Narrow One

### The Problem

`order_lifecycle.py`'s maintainer wants every status change logged to a
customer's activity feed, and adds the call directly inside
`transition_to`:

```python
import customer_activity


class Order:
    def transition_to(self, new_status):
        if not can_transition(self.status, new_status):
            raise InvalidTransition(f"{self.status} cannot transition to {new_status}")
        self.status = new_status
        customer_activity.log_order_activity(
            self.customer_id, f"order {self.order_id} moved to {new_status}"
        )
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. It works, right up until
`customer_activity.log_order_activity` itself starts failing — a
database outage behind the activity feed, say:

```python
order = Order(order_id=501, customer_id=17)
try:
    order.transition_to(OrderStatus.PAID)
    print("status:", order.status)
except RuntimeError as e:
    print("RuntimeError:", e)
    print("status still:", order.status)
```

Running it against a `customer_activity` whose logging function raises
produces:

```
RuntimeError: activity feed database is down
status still: OrderStatus.PAID
```

The transition was perfectly legal — `PENDING` to `PAID` is exactly the
kind of move `ORDER_TRANSITIONS` has allowed since Lesson 46. It happened
anyway, silently, inside the method — `order.status` really is `PAID`
now. But the caller sees a `RuntimeError`, from a subsystem that has
nothing to do with whether the order's own lifecycle move was valid, and
has no way to tell, from the exception alone, that the actual transition
already succeeded. `order_lifecycle.py`, this domain's most foundational
module, is now only as reliable as `customer_activity.py`'s own
database connection — a dependency pointing directly backwards from
where it should.

### Project Change

- **Reference Source:** none — a from-scratch addition continuing this
  curriculum's own running `order_lifecycle`/`customer_activity`
  modules, not a port of an external reference codebase.
- **Files affected:** `order_lifecycle.py`, modified to remove the
  import and the logging call; whatever caller invokes `transition_to`,
  modified to call `log_order_activity` itself, separately.
- **Change type:** remove — the `import customer_activity` line and the
  `customer_activity.log_order_activity(...)` call inside
  `transition_to`.
- **Location:** `order_lifecycle.py`'s own top-level imports and
  `Order.transition_to`'s body.
- **Dependencies:** none — this fix removes a dependency, it doesn't add
  one.

### The New Code

The smallest new piece is the calling code that now coordinates both
modules, since neither module coordinates itself with the other anymore:

```python
order.transition_to(OrderStatus.PAID)
try:
    customer_activity.log_order_activity(
        order.customer_id, f"order {order.order_id} moved to {order.status}"
    )
except RuntimeError as e:
    print("activity log failed, order transition unaffected:", e)
```

### The Updated Project

`order_lifecycle.py` loses the import and the logging call entirely;
`transition_to` goes back to doing exactly one thing, the thing its own
name says it does:

```python
class Order:                                                       # order_lifecycle.py
    def transition_to(self, new_status):
        if not can_transition(self.status, new_status):
            raise InvalidTransition(f"{self.status} cannot transition to {new_status}")
        self.status = new_status                                    # ← unchanged
                                                                       # ← logging call removed
```

The calling code — a checkout flow, in a real system — now does what
`order_lifecycle.py` used to do internally, but explicitly, and with the
freedom to decide for itself how a logging failure should be handled:

```python
import order_lifecycle                                             # caller
import customer_activity

order = order_lifecycle.Order(order_id=501, customer_id=17)
order.transition_to(order_lifecycle.OrderStatus.PAID)               # ← unaffected by logging
print("status:", order.status)

try:
    customer_activity.log_order_activity(                            # ← moved here
        order.customer_id, f"order {order.order_id} moved to {order.status}"
    )
    print("activity logged")
except RuntimeError as e:
    print("activity log failed, order transition unaffected:", e)
```

`order_lifecycle.py` no longer has an `import customer_activity` line
anywhere in it at all — it has no way to even know that module exists.
The dependency didn't get safer; it got removed, from the one file that
never needed it in the first place.

### Isolating the Concept: Whichever Side Depends, Depends

The mechanism this lesson demonstrates — moving a call from inside a
foundational module to the caller that already needs both modules — is
shown directly above rather than through a separate, unrelated
throwaway example, since the real project code already is the minimal
demonstration: two modules, one call relocated, one dependency reversed.
Running the caller against the *original*, still-broken
`customer_activity`:

```python
order = order_lifecycle.Order(order_id=501, customer_id=17)
order.transition_to(order_lifecycle.OrderStatus.PAID)
print("status:", order.status)

try:
    customer_activity.log_order_activity(order.customer_id, f"order {order.order_id} moved to {order.status}")
    print("activity logged")
except RuntimeError as e:
    print("activity log failed, order transition unaffected:", e)

print("status still:", order.status)
```

Running it produces:

```
status: OrderStatus.PAID
activity log failed, order transition unaffected: activity feed database is down
status still: OrderStatus.PAID
```

The exact same broken `customer_activity` module — its logging function
still raises `RuntimeError` every time — no longer breaks the order
transition at all. `order.transition_to` succeeds, cleanly, with no
exception of its own; the caller separately attempts to log the
activity, catches the failure there, and reports it as what it actually
is: a logging problem, not an order problem. This throwaway distinction
is now proven, not just asserted; the fix required no new construct,
only moving three lines to the correct side of the dependency.

### Mechanical Walkthrough

Working through what actually changed in the code above:

- **the removed `import customer_activity` line** — deleting an import
  is itself the substantive change here; `order_lifecycle.py` no longer
  has any name bound to `customer_activity`'s module object anywhere in
  its own namespace, which means nothing in this file can call anything
  in that module even by accident.
- **the relocated `customer_activity.log_order_activity(...)` call** —
  syntactically identical to before, just moved from inside
  `Order.transition_to`'s body to the calling code that already has both
  `order` and access to `customer_activity` in scope. Nothing about the
  call itself changed; only which module's file it physically lives in.

### CS Lens

This is **dependency direction**, closely related to a system's own
**layering**: a well-layered system has its more general, more widely
reused code at a lower layer, depended *on* by more specific, narrower
code above it, never the reverse. `order_lifecycle.py` sits, functionally,
below `customer_activity.py` — more code across a real system would
reasonably need order lifecycle rules than would need customer activity
logging specifically — so a dependency pointing from the lower, more
general layer up into the narrower one inverts the layering a healthy
system would otherwise have. The same shape appears in an operating
system kernel that must never depend on a specific user application, a
standard library that must never depend on any one program built with
it, and a foundation class in any object hierarchy that must never
depend on one of its own specific subclasses.

Also recognized in: a core payment-processing library that should never
import a specific storefront's UI code, a logging framework that should
never depend on any one application using it, and a database engine that
should never depend on a specific application's schema.

### SE Lens

The principle is **depend toward stability, not away from it** — the
alternative that was rejected, keeping the logging call inside
`transition_to`, isn't wrong because logging is unimportant; it's wrong
because it makes the more foundational, more widely-relied-upon module's
own correctness hostage to the narrower module's own uptime. The real
cost of the fix: every caller of `transition_to` that wants activity
logging now has to remember to call `log_order_activity` itself,
separately — the convenience of "one call does both things" is
genuinely gone, traded for the guarantee that a failure in one no longer
silently threatens the other. That tradeoff is the entire point of this
lesson, not a side effect of it: convenience concentrated in one
foundational call site is exactly what let one subsystem's outage
propagate into another's success or failure in the first place.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running the fixed version, with `customer_activity`'s logging function
still broken, the identical failure this lesson opened with:

```python
order = order_lifecycle.Order(order_id=501, customer_id=17)
order.transition_to(order_lifecycle.OrderStatus.PAID)
print("status:", order.status)

try:
    customer_activity.log_order_activity(
        order.customer_id, f"order {order.order_id} moved to {order.status}"
    )
    print("activity logged")
except RuntimeError as e:
    print("activity log failed, order transition unaffected:", e)

print("status still:", order.status)
```

The real output:

```
status: OrderStatus.PAID
activity log failed, order transition unaffected: activity feed database is down
status still: OrderStatus.PAID
```

Every line proves the same point from a different angle: the transition
itself never raises anything now; the caller learns about the logging
failure separately and explicitly, at the exact point it happens; and
`order.status` is `PAID` at both the start and the end of this trace —
never in doubt, never dependent on whether the unrelated logging call
happened to succeed.

### Connecting Back

Where Lesson 56 named the precise relationship between two pieces of
code, this lesson names the choice buried inside that relationship —
which side gets to be the dependency, and which side gets to stay
foundational and unaffected by the other's problems.

## Connect the Pieces

Order `501`'s `PENDING → PAID` transition was attempted twice against
the identical broken `customer_activity` module. First, with the
logging call living inside `transition_to`: the transition itself raised
`RuntimeError`, even though the move was perfectly legal, because
`order_lifecycle.py` depended on `customer_activity.py` succeeding.
Second, with the logging call moved to the caller: `transition_to`
succeeded cleanly every time, and the identical logging failure was
caught and reported separately, exactly where it belonged — because
`order_lifecycle.py` no longer depended on `customer_activity.py` at
all.

## What Breaks Without This

Moving the call to the caller only helps callers that actually catch the
logging failure. A caller that doesn't still lets a narrow concern's
outage look like it broke something more important, just one level
further out than before:

```python
order = order_lifecycle.Order(order_id=501, customer_id=17)
order.transition_to(order_lifecycle.OrderStatus.PAID)
try:
    customer_activity.log_order_activity(
        order.customer_id, f"order {order.order_id} moved to {order.status}"
    )
    print("this line never runs if logging fails")
except RuntimeError as e:
    print("RuntimeError:", e)
print("order.status regardless:", order.status)
```

Run for real, this is what comes back:

```
RuntimeError: activity feed database is down
order.status regardless: OrderStatus.PAID
```

`order.transition_to` still succeeded on its own — `order.status` is
already `PAID` before the logging call even runs, and stays `PAID`
afterward regardless of how the logging call turns out. But
`"this line never runs if logging fails"` never prints: a caller that
doesn't wrap the logging call the way the fixed version does still lets
the same outage stop its own surrounding code from continuing, the same
practical effect as before, just no longer *inside* `order_lifecycle.py`
itself. Fixing the dependency's direction moved the risk to where it
structurally belongs; it didn't remove the risk of an unhandled failure
from existing somewhere.

## Exercises

1. Rewrite the caller so a failed activity log is retried once before
   giving up, without ever letting that retry logic touch
   `order_lifecycle.py` again. Prove, with real output, that
   `order.status` stays correct throughout.
2. Name one other place in this domain's own running example where a
   call currently goes from a more foundational module toward a more
   specific one (check `order_lifecycle.py`, `customers.py`, and any
   reporting code built so far). If none exists, explain in two
   sentences why this lesson's own example was the first place that
   temptation actually showed up.
3. `customer_activity.py` itself currently has no dependencies on
   `order_lifecycle.py` at all. Should it? Write two sentences arguing
   either side, using this lesson's "depend toward stability" test.

## Definition of Done

- [ ] `order_lifecycle.py` has no `import customer_activity` line
      anywhere in it.
- [ ] `Order.transition_to` no longer calls `log_order_activity`
      directly.
- [ ] The Problem section's broken transition has been reproduced for
      real, against the *original*, logging-inside-transition_to
      version, before you apply the fix.
- [ ] The "Run It" scenario above runs against your own fixed files and
      produces output matching what's pasted here.
- [ ] Commit, with a message stating *why*: something like `dependency
      direction: move activity logging out of transition_to so an
      activity-feed outage can no longer break a legal order transition`,
      not `move logging call`.

Up next: Lesson 58, Coupling — now that direction is a deliberate
choice, how tightly two pieces of code are bound together in the
direction they do point.
