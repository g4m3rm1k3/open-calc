# Lesson 68: State Ownership

**What you will build.** A shipping service needs to mark an order
`SHIPPED` once a label prints. Rather than calling
`order.transition_to(...)`, it reimplements the check itself —
correctly, calling the same `can_transition` function `transition_to`
uses internally — and sets `order.status` directly. It works, in the
sense that the status changes correctly. What it skips is everything
Lesson 61 added *inside* `transition_to` since then: the registered
listeners never fire, and the shipped order never reaches the activity
log at all, even though a paid order, moved through `transition_to`
itself moments earlier, did. This lesson fixes it by having the shipping
service call `order.transition_to(...)` directly, making `Order`'s own
method the single owner of every status change, full stop. The
transferable problem: two pieces of code can each independently,
correctly validate the same change and still drift apart the moment one
of them gains new behavior the other was never written to know about —
correctness on the day something is written isn't the same guarantee as
staying correct as the thing it duplicates keeps changing.

**What you need to know first.** Dependency Inversion (Lesson 61) —
`_transition_listeners`, the exact behavior this lesson's bug silently
skips. Business Rules (Lesson 47) — rule drift, the closest previous
failure to this one; this lesson is the identical shape one level up,
applied to *who's allowed to change state* instead of *who checks a
rule before an action*.

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

Still the **Design** stage — closing out this domain's own run through
dependency and relationship questions before the next few lessons turn
to boundaries and patterns. Carried through: Lesson 67 named any
observable change beyond return value as a side effect; this lesson
names the specific discipline of making sure only one piece of code is
ever responsible for one particular side effect happening correctly.

**Terms introduced in this lesson.** One line each.

- **state ownership** — the design decision that exactly one piece of
  code is responsible for validating and applying every change to a
  given piece of state, with everything else that needs a change going
  through that one owner rather than changing the state directly — even
  when it could technically reach it, and even when its own change
  would individually be correct. It's distinguished from encapsulation
  (which code *can* reach the data) by being about which code *should*
  be the one making changes — a design decision, not only a technical
  guard.
- **duplicate implementation** — a second piece of code that
  independently reimplements a state change's own validation and effects
  instead of calling the one function that already does it. It's worth
  naming because a duplicate can be completely correct on the day it's
  written and still silently diverge from the original the moment the
  original gains new behavior the duplicate was never told about.

**Objects and methods used.** None new — this lesson's fix is calling an
existing method instead of reimplementing what it does; what's new is
recognizing when a "correct" second implementation is still the wrong
design.

## Concept Unit: Two Correct Implementations Can Still Disagree Later

### The Problem

A shipping service needs to move an order to `SHIPPED` once a label
prints. Instead of calling `transition_to`, it checks the transition
itself:

```python
def mark_shipped_via_shipping_service(order):
    if can_transition(order.status, OrderStatus.SHIPPED):
        order.status = OrderStatus.SHIPPED
    else:
        raise InvalidTransition(f"{order.status} cannot transition to SHIPPED")
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. It reuses `can_transition` correctly —
this isn't Lesson 46's bug, an illegal move isn't being allowed through.
Run alongside a normal `transition_to` call for a different move on the
same order:

```python
order = Order(order_id=501, customer_id=17)
order.transition_to(OrderStatus.PAID)
print("activity entries after PAID via transition_to:", len(customer_activity._activity_log))

mark_shipped_via_shipping_service(order)
print("status:", order.status)
print("activity entries after SHIPPED via shipping_service:", len(customer_activity._activity_log))
```

Running it produces:

```
activity entries after PAID via transition_to: 1
status: OrderStatus.SHIPPED
activity entries after SHIPPED via shipping_service: 1
```

The status is correct — `SHIPPED`, exactly right. The activity log,
which Lesson 61's listener registry is supposed to update on *every*
transition, stayed at `1`. `mark_shipped_via_shipping_service` reimplemented
the *validation* `transition_to` performs, correctly, but not the
*listener dispatch* Lesson 61 added afterward — because it never calls
`transition_to` at all, it has no way to know that dispatch exists, or
that it was ever added.

### Project Change

- **Reference Source:** none — a from-scratch addition continuing this
  curriculum's own running `order_lifecycle` module, not a port of an
  external reference codebase.
- **Files affected:** the shipping service's own module, modified.
- **Change type:** refactor — replace the duplicated check-and-assign
  with a direct call to `order.transition_to`.
- **Location:** `mark_shipped_via_shipping_service`'s own body.
- **Dependencies:** none.

### The New Code

The smallest new piece is the single call that replaces the duplicated
logic:

```python
def mark_shipped_via_shipping_service(order):
    order.transition_to(OrderStatus.SHIPPED)
```

### The Updated Project

The shipping service's function shrinks to exactly one line, delegating
entirely to `Order`'s own method instead of reimplementing any part of
what it does:

```python
def mark_shipped_via_shipping_service(order):    # ← changed
    order.transition_to(OrderStatus.SHIPPED)       # ← changed, replaces the duplicated check
```

Whatever `transition_to` does — validate against `_ORDER_TRANSITIONS`,
notify every registered listener, anything added to it in the future —
now happens automatically for a shipment marked through the shipping
service too, because there's only one real implementation of "change an
order's status" left in the entire program.

### Isolating the Concept: One Real Setter, Everyone Else Calls It

The mechanism doing the real work above — one method owning a change,
every other caller going through it instead of reimplementing it —
deserves to be seen on its own. Here it is protecting a thermostat's
own change history from a second, independent way of setting the
temperature:

```python
class Thermostat:
    def __init__(self):
        self.temperature = 68
        self.history = []

    def set_temperature(self, new_temp):
        self.history.append((self.temperature, new_temp))
        self.temperature = new_temp


def set_via_wall_panel(thermostat, new_temp):
    thermostat.temperature = new_temp


thermostat = Thermostat()
thermostat.set_temperature(70)
print("history after app change:", thermostat.history)

set_via_wall_panel(thermostat, 72)
print("temperature:", thermostat.temperature)
print("history after wall panel change:", thermostat.history)
```

Running it produces:

```
history after app change: [(68, 70)]
temperature: 72
history after wall panel change: [(68, 70)]
```

This is exactly what `mark_shipped_via_shipping_service` was doing above,
isolated: `set_via_wall_panel` sets `temperature` directly, correctly
changing the value, but has no idea `history` exists, the same way the
shipping service had no idea the listener registry existed. The fix
would be identical — `set_via_wall_panel` calling
`thermostat.set_temperature(new_temp)` instead of touching `temperature`
directly. This throwaway example is now discarded; `Thermostat` does not
appear anywhere else in this lesson or this project again.

### Mechanical Walkthrough

Working through the one syntactic element that actually changed:

- **`order.transition_to(OrderStatus.SHIPPED)`** — a single method call,
  replacing an entire `if`/`else` block that used to reimplement part of
  what this call already does internally. Nothing about this line is
  new syntax; what changed is that the shipping service no longer has
  its own opinion about how a transition is validated or what happens
  when one succeeds — it defers entirely to `Order`'s own method.

### CS Lens

This is **state ownership**, closely related to the **single source of
truth** idea Lesson 47 already applied to business logic, now applied to
*who is allowed to change something*, not just *who decides whether a
change is allowed*. A duplicate implementation is dangerous specifically
because it can pass every test written against it on the day it's
written — `mark_shipped_via_shipping_service`'s original version
genuinely never allowed an illegal transition — and still silently stop
matching the original's *complete* behavior the moment the original
gains a capability the duplicate doesn't know to reimplement. This is
the identical risk two independent database replicas run if both accept
direct writes instead of one being the single writable source the other
follows.

Also recognized in: two microservices each maintaining their own copy of
a customer's shipping address instead of one owning it and the other
querying it, a cached computed value updated by two different code paths
that can each independently forget to invalidate it, and version-control
history: a repository with one true commit log versus a workflow where
multiple systems could each independently rewrite history, guaranteed to
eventually disagree about what actually happened.

### SE Lens

The principle is **prefer delegation to duplication, even when the
duplicate is correct today** — the alternative that was rejected,
`mark_shipped_via_shipping_service` reimplementing `can_transition`'s own
check, wasn't a mistake in judgment on the day it was written; it was a
choice that looked equivalent to calling `transition_to` and quietly
stopped being equivalent the moment Lesson 61 added something to
`transition_to` that the duplicate had no way to inherit. The real cost
of the fix: the shipping service now has a real dependency on
`order_lifecycle.Order.transition_to`'s exact signature and behavior,
the same dependency-surface question Lesson 56 already named — but that
cost was always there, hidden, in the duplicate version too; this
lesson's fix just makes it honest and visible instead of silently
incomplete.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running the fixed shipping service through the identical
PAID-then-SHIPPED sequence:

```python
order = Order(order_id=501, customer_id=17)
order.transition_to(OrderStatus.PAID)
print("activity entries after PAID via transition_to:", len(customer_activity._activity_log))

mark_shipped_via_shipping_service(order)
print("status:", order.status)
print("activity entries after SHIPPED via shipping_service:", len(customer_activity._activity_log))
```

The real output:

```
activity entries after PAID via transition_to: 1
status: OrderStatus.SHIPPED
activity entries after SHIPPED via shipping_service: 2
```

The status is correct, exactly as it was before this lesson's fix. The
activity count is the real change: `2`, not `1` — the shipment now
correctly reaches the activity log, automatically, because
`mark_shipped_via_shipping_service` no longer has its own opinion about
what a transition does; it only knows how to ask `Order`'s one real
owner of that behavior to do it.

### Connecting Back

Where Lesson 61 let an unstable module react to a stable one without a
direct dependency, this lesson makes sure every *legitimate* caller of a
stable module's own behavior goes through its one real implementation —
the two lessons together close both "how does a reaction get wired up"
and "how many places actually implement the reaction."

## Connect the Pieces

An order moved `PENDING → PAID → SHIPPED` in this lesson, with the
identical two-step sequence run twice. First, with the shipping service
reimplementing its own transition check: the status ended up correct,
`SHIPPED`, but the activity log stayed at one entry, silently missing
the shipment. Second, with the shipping service calling
`order.transition_to` directly: the identical status change, plus a
second, correctly logged activity entry — proving the difference was
never about whether the status changed correctly, only about whether
everything that's supposed to happen alongside it actually did.

## What Breaks Without This

Making the shipping service delegate to `transition_to` fixes this one
duplicate. It says nothing about a *third* module written the same
mistaken way, independently reimplementing the same check:

```python
def mark_delivered_via_warehouse_system(order):
    if can_transition(order.status, OrderStatus.DELIVERED):
        order.status = OrderStatus.DELIVERED


order.transition_to(OrderStatus.SHIPPED)
mark_delivered_via_warehouse_system(order)
print("status:", order.status)
print("activity entries after DELIVERED via warehouse_system:", len(customer_activity._activity_log))
```

Run for real, this is what comes back:

```
status: OrderStatus.DELIVERED
activity entries after DELIVERED via warehouse_system: 2
```

The status correctly reaches `DELIVERED`. The activity count stays at
`2` — the delivery never gets logged, the identical bug this lesson just
fixed once, recreated independently in a different module that never
learned the lesson the shipping service did. Fixing one duplicate
doesn't prevent the next team, or the next lesson, from writing a new
one; that's a code-review and design-convention question, not something
this lesson's own fix can enforce across a whole codebase by itself.

## Exercises

1. Fix `mark_delivered_via_warehouse_system` the same way this lesson
   fixed the shipping service, and prove with real output that the
   activity count reaches `3`.
2. Search this domain's own running example — `Order`, `Customer`,
   `payments.py` — for any other place a state change might plausibly be
   reimplemented instead of delegated. If none exists yet, write one
   deliberately, the way this lesson did, and then fix it, to prove you
   can recognize the pattern before it's pointed out.
3. `Thermostat.set_temperature` is the sole owner of `temperature` and
   `history` together. Write a `get_current_temperature(thermostat)`
   function that only *reads* `thermostat.temperature`. Does read-only
   code need to go through the owner the same way a write does? Justify
   your answer using this lesson's own definition of state ownership.

## Definition of Done

- [ ] `mark_shipped_via_shipping_service` calls `order.transition_to`
      directly, with no reimplemented validation logic of its own.
- [ ] The Problem section's missing activity entry has been reproduced
      for real, against the *original*, duplicating version, before you
      apply the fix.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here.
- [ ] The "What Breaks Without This" warehouse-system duplicate has been
      run against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `state
      ownership: make shipping_service call transition_to directly
      instead of duplicating its validation, so shipment events reach
      the activity log`, not `fix shipping bug`.

Up next: Lesson 69, Boundary Design — closing this domain's dependency-
and-relationship arc by naming, deliberately, where one part of a system
ends and another begins, instead of discovering the boundary after
something has already crossed it badly.
