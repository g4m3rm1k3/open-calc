# Concept: Finite State Machines for Guarding Valid Transitions

**What you'll understand by the end:** how to model a real-world object's own lifecycle as a closed set of named states plus an explicit table of which transitions between them are actually allowed — rejecting anything outside that table structurally, instead of trusting every single caller to check by hand before changing the object's state.

**Prerequisites:** basic classes/objects and methods, in any language.

## Setup

Python 3, no packages needed.

## The Problem

Many real objects — an order, a job, a document, a network connection — don't just hold one flat, independent fact; they move through a real, meaningful sequence of states over their lifetime, and only *some* of the possible jumps between those states actually make sense. Modeling that sequence as a plain, freely-assignable field (`order.status = "Delivered"`, settable to any string at any time) puts the entire burden of "is this actually a legal change?" on every single piece of code that ever touches the field — a burden nothing enforces, and one bad call site is all it takes to leave the object in a state that should have been unreachable (a "Delivered" order that was never "Shipped," a "Cancelled" order un-cancelled back to "Pending").

## The Isolated Example

```python
class Order:
    # The closed set of valid states, named explicitly -- not any string
    # anyone happens to type.
    PENDING = "Pending"
    SHIPPED = "Shipped"
    DELIVERED = "Delivered"
    CANCELLED = "Cancelled"

    # The explicit table of which transitions are allowed. Every pair NOT
    # listed here is invalid, by definition, not by omission.
    VALID_TRANSITIONS = {
        (PENDING, SHIPPED),
        (PENDING, CANCELLED),
        (SHIPPED, DELIVERED),
    }

    def __init__(self):
        self.status = Order.PENDING

    def try_transition(self, new_status):
        if (self.status, new_status) not in Order.VALID_TRANSITIONS:
            return False
        self.status = new_status
        return True


order = Order()
print(f"Initial status: {order.status}")

print(f"Pending -> Shipped: {order.try_transition(Order.SHIPPED)}, status now: {order.status}")
print(f"Shipped -> Pending (invalid): {order.try_transition(Order.PENDING)}, status still: {order.status}")
print(f"Shipped -> Delivered: {order.try_transition(Order.DELIVERED)}, status now: {order.status}")
print(f"Delivered -> Cancelled (invalid): {order.try_transition(Order.CANCELLED)}, status still: {order.status}")
```

Run it:

```
python lab.py
```

**Real output:**

```
Initial status: Pending
Pending -> Shipped: True, status now: Shipped
Shipped -> Pending (invalid): False, status still: Shipped
Shipped -> Delivered: True, status now: Delivered
Delivered -> Cancelled (invalid): False, status still: Delivered
```

**What this proves:** `try_transition` checks the *current* state paired with the *requested* state against `VALID_TRANSITIONS` before ever assigning `self.status` — an attempt to go straight from `Shipped` back to `Pending`, or from `Delivered` to `Cancelled`, is rejected outright (`False`, state unchanged), even though nothing about a plain `str` field would have stopped either assignment on its own. Every *successful* transition also lands on exactly one new, named state — there's no way to end up somewhere `Order` doesn't explicitly name as one of its four states.

## Mechanical Walkthrough

- `PENDING`/`SHIPPED`/`DELIVERED`/`CANCELLED` — a fixed, small, named set of states declared once, up front — the defining shape of "finite" state: the set never grows or shrinks at runtime, and every value `self.status` can ever hold is one of exactly these four.
- `VALID_TRANSITIONS` — a `set` of `(from, to)` tuples, the actual rule table: any pair not present in this set is invalid, by omission, not by an explicit "reject" entry — a smaller, positive list of what *is* allowed, rather than an ever-growing negative list of what isn't.
- `if (self.status, new_status) not in Order.VALID_TRANSITIONS: return False` — the guard itself: one membership check against the rule table, run *before* any mutation, deciding the entire outcome.
- `self.status = new_status` — only reached once the guard has already passed; the actual state change is the easy, unconditional part once the harder question (is this even legal?) has already been answered.

## Execution Trace

Two independent `Order` objects, each transitioned through a real sequence of calls:

1. `order = Order()` — starts at `PENDING`, the constructor's own hardcoded initial state.
2. `try_transition(SHIPPED)` — `(PENDING, SHIPPED)` is in `VALID_TRANSITIONS`; guard passes, `status` becomes `SHIPPED`, returns `True`.
3. `try_transition(PENDING)` — `(SHIPPED, PENDING)` is **not** in `VALID_TRANSITIONS` (only the forward pair, `(PENDING, SHIPPED)`, was ever listed); guard fails, `status` stays `SHIPPED`, returns `False` — an order cannot un-ship itself back to pending through this method, no matter what code calls it.
4. `try_transition(DELIVERED)` — `(SHIPPED, DELIVERED)` is in the table; guard passes, `status` becomes `DELIVERED`.
5. `try_transition(CANCELLED)` — `(DELIVERED, CANCELLED)` was never listed (only `(PENDING, CANCELLED)` was); guard fails, `status` stays `DELIVERED` — a delivered order can no longer be cancelled through this method, matching the real-world rule this table was written to encode.

Every rejected call leaves `self.status` completely untouched — the guard runs, decides, and either the whole transition happens or none of it does; there's no partial or "sort of" state change.

## CS Lens

This is a **finite state machine**: a fixed, named set of states, plus an explicit set of allowed transitions between them, with every other transition rejected as invalid rather than merely unusual. The general shape recurs constantly, in two closely related flavors worth telling apart: *recognizing* a sequence as valid or not (a regex engine deciding whether a string matches a pattern, character by character) versus *guarding* a single long-lived object's own lifecycle against illegal jumps (this file's own subject) — the same underlying machine, aimed at two different real jobs.

Also recognized in: a traffic light (`Red → Green → Yellow → Red`, never `Red → Yellow` directly); a vending machine (`Idle → Selecting → Dispensing → Idle`); a TCP connection's own states (`LISTEN → SYN_SENT → ESTABLISHED → ...`); a document's real workflow status in any content-management or approvals system (`Draft → In Review → Published`, never `Draft → Published` directly, skipping review); a video game character's animation states (`Idle → Jumping → Falling → Idle`, with specific, deliberately limited transitions between them).

## SE Lens

Why write a guarded `try_transition` method at all, instead of just letting any code assign `order.status = "Delivered"` directly, the same way an ordinary field would be set? Because a plain setter has no way to say no — anything holding a reference to the object could set an invalid status by accident (a typo, a forgotten precondition, a code path written before a new state existed), and nothing would catch it until much later, far from the actual mistake. A guarded transition method is the difference between "this fact happens to usually be set correctly, by convention" and "this fact is structurally impossible to set incorrectly through this path" — a real, checkable guarantee instead of a hope resting on every future caller remembering a rule that lives only in a comment, or nowhere at all. The real cost: every new, legitimate transition has to be added to the rule table deliberately, by someone who understands the domain — an omission there silently blocks a transition that should have been allowed, which is a real, opposite-direction failure mode worth testing for, not just the "blocked an invalid one correctly" case.

## Connection

Builds on ordinary classes/objects. This is the general pattern underneath any object with a real, named lifecycle — an order, a support ticket, a job queue entry, a document's approval status — anywhere "which changes are even legal right now" is itself part of the domain's own rules, not an incidental detail of how the field happens to be typed.

## Try It Yourself

1. Add a fifth state, `RETURNED`, reachable only from `DELIVERED` (`(DELIVERED, RETURNED)`), and confirm — with real output — that a fresh order can reach `RETURNED` only by first passing through `SHIPPED` and `DELIVERED` in order, never directly from `PENDING`.
2. Write a method `allowed_next_states(self)` that returns every state currently reachable from `self.status` in exactly one transition, by scanning `VALID_TRANSITIONS` — confirm it returns `{"Shipped", "Cancelled"}` for a fresh `PENDING` order.
3. Remove the `(SHIPPED, DELIVERED)` entry from `VALID_TRANSITIONS` entirely (simulating a real, easy-to-make mistake: a new valid transition needed in the domain but never added to the table) and confirm — with real output — that a correctly-shipped order can now never be marked delivered, demonstrating the SE Lens's own "omission silently blocks a legal transition" failure mode directly.
