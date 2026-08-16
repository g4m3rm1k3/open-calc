# Lesson 46: Lifecycle Modeling

**What you will build.** `Order.status` can currently be reassigned
directly to any `OrderStatus` member from anywhere — the previous lesson
ended by naming this gap explicitly: nothing stops a `SHIPPED` order from
being set straight to `CANCELLED`. This lesson closes it: a transition
table naming exactly which `OrderStatus` moves are legal from each
state, and a guarded `transition_to` method that consults it before
changing anything. The transferable problem: an enumerated field alone
only rules out invalid *values* — it says nothing about invalid *moves*
between valid values, and an entity's lifecycle is defined as much by
which transitions are forbidden as by which states exist at all.

**What you need to know first.** State (Lesson 45) — `OrderStatus` as a
closed set of named values, and the direct-assignment gap this lesson
exists to close. Invariants (Lesson 30) — a rule that must hold at every
point after construction, now applied to *moves* between states instead
of a single snapshot of one. Local Reasoning (Lesson 10) — being able to
trust what a piece of code does by reading only that piece; this
lesson's guard method is judged against that same bar.

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

This lesson still works entirely inside the **Domain model** stage, the
same stage as the previous lesson. Carried through: the *Problem* stays
the same order-tracking problem as before, now sharpened — knowing not
just what an order's current state is, but what it's allowed to become
next. The *Requirements* domain's own lesson on precision applies again,
one level up: "an order can be cancelled" reads as a complete
requirement and isn't, until someone is forced to say cancelled *from
which states*. The *Specification* domain's vocabulary — an invariant as
a rule that must hold at every point after construction — is what this
lesson generalizes: Lesson 45 made "an order's status is always exactly
one of five named values" true by construction; this lesson makes "an
order's status only ever moves along a legal edge" true the same way,
through the same *Domain model* stage's job of turning a real-world rule
into a shape the data and its own methods can't violate.

**Terms introduced in this lesson.** One line each.

- **lifecycle** — the full graph of states an entity can be in over its
  life, together with which moves between them are legal. It's named
  separately from "state" because a lifecycle is a claim about *motion*
  between states, not about any single state in isolation — two systems
  can have identical states and completely different, incompatible
  lifecycles.
- **transition** — one legal move from a specific state to a specific
  other state. It's the unit this lesson actually controls: not "is this
  value valid" (Lesson 45's job) but "is this specific move, right now,
  allowed."
- **transition table** — a mapping from each state to the set of states
  legally reachable from it in one move. It exists so that "which moves
  are allowed" stops being a sentence a team has to remember and
  re-enforce by hand everywhere a state gets changed, and becomes one
  piece of data a single guard can check.
- **guarded transition** — changing an entity's state only through a
  method that consults the transition table first, instead of assigning
  the new state directly. It's necessary because an enum field on its
  own stops invalid *values* but has no opinion about invalid *moves*
  between two values that are each, individually, perfectly valid.
- **terminal state** — a state with no legal outgoing transitions at all
  — an empty set in the transition table. It's worth naming because a
  lifecycle's real endpoints are exactly the states this lesson's own
  table maps to nothing, checkable the identical way as any other state's
  rule, not a special case requiring separate code.

**Objects and methods used.**

- **`Exception`** (Python's built-in base exception class)
  - *What it is:* the standard base class nearly every raisable error in
    Python ultimately inherits from, including every built-in exception
    like `ValueError` or `KeyError`.
  - *Implementation:* subclassing it with an empty body —
    `class InvalidTransition(Exception): pass` — is enough to create a
    new, distinct, catchable error type; the `pass` means no new
    behavior is added beyond what `Exception` already provides
    (accepting a message, being raisable, being catchable).
  - *Its use:* this lesson uses it to give illegal transitions their own
    specific, named error — `InvalidTransition` — instead of reusing a
    generic built-in like `ValueError`, so code that wants to catch
    *this specific kind* of mistake can do so without also catching
    unrelated `ValueError`s from somewhere else in the same program.
- **`dict.__getitem__` (square-bracket lookup on a `dict`)**
  - *What it is:* the mechanism behind `some_dict[key]` — looking up the
    value stored under an exact key, raising `KeyError` if that key was
    never stored.
  - *Implementation:* `ORDER_TRANSITIONS[self.status]` looks up the
    *value* stored under the *key* `self.status` (an `OrderStatus`
    member) in the `ORDER_TRANSITIONS` dict, returning whatever set of
    members was written there when the dict was built.
  - *Its use:* this is how `transition_to` finds "the states legally
    reachable from wherever this order currently is" as a single lookup,
    rather than writing a chain of `if self.status == ...` comparisons
    by hand for every one of the five states.

## Concept Unit: Guarding Transitions With a Transition Table

### The Problem

Lesson 45 ended by asking a question it deliberately didn't answer:
should a `SHIPPED` order even be allowed to move to `CANCELLED` at all?
`OrderStatus` rules out five nonsense *values* (a status of `"shiped"`
can no longer exist), but it says nothing about which *moves* between
its five real values make business sense. Right now, nothing stops
`order.status = OrderStatus.CANCELLED` from running on an order that is
already `SHIPPED` — the assignment is between two perfectly valid
`OrderStatus` members, so the enum has no basis to object, even though
the business plainly does: a shipped order is physically already on its
way and cannot be un-shipped by editing an attribute.

### Project Change

- **Reference Source:** none. This is a from-scratch addition
  illustrating the general principle, continuing this curriculum's own
  running `Order` example, not a port of any external reference
  codebase.
- **Files affected:** `orders.py` (the same file `OrderStatus` and
  `Order` were added to in the previous lesson), modified.
- **Change type:** add (`InvalidTransition`, `ORDER_TRANSITIONS`, and
  `Order.transition_to`) plus a behavior change (direct assignment to
  `order.status` is no longer how the rest of this lesson's own code
  changes an order's status, though — see "What Breaks Without This" —
  nothing yet stops the attribute from still being reachable directly).
- **Location:** `InvalidTransition` and `ORDER_TRANSITIONS` are added at
  module level, below the `OrderStatus` definition and above `Order`;
  `transition_to` is added as a new method inside the `Order` class,
  alongside `__init__`.
- **Dependencies:** none beyond what Lesson 45 already added — `Enum` is
  still the only non-built-in import this file needs.

### The New Code

The smallest new piece is the transition table itself, plus the error
type it needs to report a rejected move:

```python
class InvalidTransition(Exception):
    pass


ORDER_TRANSITIONS = {
    OrderStatus.PENDING: {OrderStatus.PAID, OrderStatus.CANCELLED},
    OrderStatus.PAID: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},
    OrderStatus.SHIPPED: {OrderStatus.DELIVERED},
    OrderStatus.DELIVERED: set(),
    OrderStatus.CANCELLED: set(),
}
```

### The Updated Project

That table sits between `OrderStatus` and `Order`, and `Order` gains one
new method that's now the only sanctioned way this file changes an
order's status:

```python
from enum import Enum


class OrderStatus(Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class InvalidTransition(Exception):              # ← new
    pass                                           # ← new


ORDER_TRANSITIONS = {                              # ← new
    OrderStatus.PENDING: {OrderStatus.PAID, OrderStatus.CANCELLED},   # ← new
    OrderStatus.PAID: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},   # ← new
    OrderStatus.SHIPPED: {OrderStatus.DELIVERED},                     # ← new
    OrderStatus.DELIVERED: set(),                                     # ← new
    OrderStatus.CANCELLED: set(),                                     # ← new
}                                                   # ← new


class Order:
    def __init__(self, order_id, customer_id):
        self.order_id = order_id
        self.customer_id = customer_id
        self.status = OrderStatus.PENDING

    def transition_to(self, new_status):            # ← new
        legal_next = ORDER_TRANSITIONS[self.status]  # ← new
        if new_status not in legal_next:              # ← new
            raise InvalidTransition(                  # ← new
                f"{self.status} cannot transition to {new_status}"  # ← new
            )                                          # ← new
        self.status = new_status                       # ← new


def can_cancel(order):
    return order.status not in {
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
    }
```

`Order` now has a method whose whole job is deciding whether a requested
status change is legal *before* it happens, instead of every caller
being trusted to already know the rules and assign `status` directly.
`can_cancel` is unchanged — it still answers "is cancelling legal from
here," and `transition_to` is what actually enforces that answer instead
of leaving it as a check callers could ignore.

### Isolating the Concept: A Transition Table as Guard Data

The mechanism doing the real work above — a dictionary from state to the
set of states reachable from it, consulted before a change is allowed —
deserves to be seen on its own first. Here it is guarding a three-color
traffic light instead of an order:

```python
class TrafficLightError(Exception):
    pass


TRANSITIONS = {
    "RED": {"GREEN"},
    "GREEN": {"YELLOW"},
    "YELLOW": {"RED"},
}


class TrafficLight:
    def __init__(self):
        self.color = "RED"

    def advance(self, new_color):
        if new_color not in TRANSITIONS[self.color]:
            raise TrafficLightError(f"{self.color} cannot advance to {new_color}")
        self.color = new_color


light = TrafficLight()
light.advance("GREEN")
print("color:", light.color)
light.advance("YELLOW")
print("color:", light.color)

try:
    light.advance("YELLOW")
except TrafficLightError as e:
    print("error:", e)
```

Running it produces:

```
color: GREEN
color: YELLOW
error: YELLOW cannot advance to YELLOW
```

This is exactly what `ORDER_TRANSITIONS` and `transition_to` are doing
above, isolated down to three states: `TRANSITIONS["RED"]` is the set
`{"GREEN"}`, so `advance("GREEN")` from `RED` succeeds and `self.color`
becomes `"GREEN"` — the same single-attribute overwrite Lesson 45 already
established, now reached only after a lookup approves it. The second
`advance("YELLOW")` call, attempted while already at `YELLOW`, looks up
`TRANSITIONS["YELLOW"]` — the set `{"RED"}` — finds `"YELLOW"` is not a
member of it, and raises instead of changing `self.color`. This pattern
— a table naming every state's legal next moves, checked by a guard
method before any state actually changes — is called a **transition
table**, and the method itself is performing a **guarded transition**.
This throwaway example is now discarded; `TrafficLight` does not appear
anywhere else in this lesson or this project again.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`class InvalidTransition(Exception):`** — a class statement whose
  parent is Python's built-in `Exception` class. Inheriting from
  `Exception` is what makes `InvalidTransition` something Python's
  `raise` and `except` machinery recognize as a legitimate error type;
  without it, this would be an ordinary class with no special relationship
  to error handling at all.
- **`pass`** — a statement that does nothing, used here because a class
  body cannot be syntactically empty; `InvalidTransition` needs no new
  attributes or methods of its own beyond what `Exception` already
  supplies (holding a message, being raisable, being catchable), so
  `pass` is the explicit way of saying "nothing more is needed here."
- **`ORDER_TRANSITIONS = { ... }`** — a module-level assignment binding
  the name `ORDER_TRANSITIONS` to a dict literal. Each key is an
  `OrderStatus` member (from the previous lesson); each value is a `set`
  literal of the members legally reachable from that key in one move.
  `OrderStatus.DELIVERED: set()` and `OrderStatus.CANCELLED: set()` use
  the empty-set constructor call, `set()`, rather than the `{}` literal —
  `{}` alone is Python's empty *dict* literal, not an empty set, so an
  empty set has to be written as a call to `set()` instead.
- **`OrderStatus.PENDING: {OrderStatus.PAID, OrderStatus.CANCELLED}`** —
  the dict's first entry: the key `OrderStatus.PENDING` maps to a set
  containing two members, `OrderStatus.PAID` and `OrderStatus.CANCELLED`
  — stating, as data, that a pending order may move to either paid or
  cancelled next, and nothing else.
- **`OrderStatus.PAID: {OrderStatus.SHIPPED, OrderStatus.CANCELLED}`,
  `OrderStatus.SHIPPED: {OrderStatus.DELIVERED}`** — the same mechanism
  as the `PENDING` entry, stating that a paid order may become shipped or
  cancelled, and a shipped order may only become delivered — critically,
  `CANCELLED` is absent from `SHIPPED`'s set, which is the one line in
  this whole table that actually answers the question Lesson 45 left
  open.

### CS Lens

`ORDER_TRANSITIONS` is a **transition function**, represented as data
instead of code: formally, a finite-state machine is a set of states
plus a function mapping (current state, requested move) to either "yes,
land in the new state" or "no." Writing that function as a dict-of-sets
rather than as a chain of `if`/`elif` branches makes the *entire* set of
legal moves visible and auditable in one place — a reader (or a test)
can ask "what are ALL of this machine's legal moves" by reading one
literal, rather than reconstructing the answer by tracing every branch
of a function's control flow.

Also recognized in: traffic-light controllers (this lesson's own
throwaway lab), elevator controllers (which floor requests are legal
from which state of motion), version-control merge state machines,
regex engines' own DFA transition tables, board-game rule engines
(which moves are legal from a given board position), and network
protocol implementations like TCP, where an entire connection's behavior
is defined by exactly this shape of table.

### SE Lens

The design principle here is **enforce the rule at the boundary the data
is changed through, not everywhere the data might be read**. The
alternative not chosen: leave `order.status = new_value` as the normal
way to change status, and instead write a `validate_transition(order,
new_value)` function that every caller is expected to call first. That
alternative has the same real weakness Lesson 45's SE Lens already
raised about validation-after-the-fact: it only works if every caller,
everywhere, remembers to call it — one call site that skips the check is
one order that can still jump straight from `SHIPPED` to `CANCELLED`.
Making `transition_to` the method that owns the check *and* the
assignment closes that gap for any caller that uses it, at a real cost:
every existing call site in a real project that used to write
`order.status = X` directly now has to be found and rewritten to call
`order.transition_to(X)` instead, and that migration doesn't happen for
free just because the method now exists.

The honest limit here is sharper than Lesson 45's, not milder: Python
gives no way to make `self.status` itself refuse direct assignment
without extra machinery (a `property` with a custom setter) this lesson
hasn't introduced yet. `order.status = OrderStatus.CANCELLED`, written
directly instead of through `transition_to`, still works right now,
completely bypassing the table — proven for real in "What Breaks Without
This," below. `transition_to` is the *sanctioned* path, not yet the
*only* one; closing that remaining gap for good is exactly the kind of
problem a later lesson in this domain, on protecting an object's own
invariants from its own attributes, exists to solve.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, the path to a `.py`
file, executes that file's statements top to bottom in a fresh
interpreter process. Success looks like exactly the `print(...)` output
appearing in order, with no traceback beneath it; a traceback means an
exception propagated out of the script instead of being caught.

### Run It

Running the full updated `Order`, exercising a normal path and then the
one Lesson 45 left unresolved:

```python
from enum import Enum


class OrderStatus(Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class InvalidTransition(Exception):
    pass


ORDER_TRANSITIONS = {
    OrderStatus.PENDING: {OrderStatus.PAID, OrderStatus.CANCELLED},
    OrderStatus.PAID: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},
    OrderStatus.SHIPPED: {OrderStatus.DELIVERED},
    OrderStatus.DELIVERED: set(),
    OrderStatus.CANCELLED: set(),
}


class Order:
    def __init__(self, order_id, customer_id):
        self.order_id = order_id
        self.customer_id = customer_id
        self.status = OrderStatus.PENDING

    def transition_to(self, new_status):
        legal_next = ORDER_TRANSITIONS[self.status]
        if new_status not in legal_next:
            raise InvalidTransition(
                f"{self.status} cannot transition to {new_status}"
            )
        self.status = new_status


order = Order(order_id=501, customer_id=17)
print("status:", order.status)

order.transition_to(OrderStatus.PAID)
print("status:", order.status)

order.transition_to(OrderStatus.SHIPPED)
print("status:", order.status)

try:
    order.transition_to(OrderStatus.CANCELLED)
except InvalidTransition as e:
    print("error:", e)

fresh_order = Order(order_id=502, customer_id=17)
fresh_order.transition_to(OrderStatus.CANCELLED)
print("fresh order status:", fresh_order.status)
```

The real output:

```
status: OrderStatus.PENDING
status: OrderStatus.PAID
status: OrderStatus.SHIPPED
error: OrderStatus.SHIPPED cannot transition to OrderStatus.CANCELLED
fresh order status: OrderStatus.CANCELLED
```

Order `501` moves `PENDING → PAID → SHIPPED` without incident — each of
those three moves is present in `ORDER_TRANSITIONS`. The fourth call,
`transition_to(OrderStatus.CANCELLED)` from `SHIPPED`, is rejected: the
`InvalidTransition` error names both the state it was rejected from and
the state it was rejected toward, and `order.status` is left exactly
where it was, `SHIPPED` — the failed call changed nothing. The final two
lines prove the table isn't just refusing everything: order `502`,
starting fresh at `PENDING`, cancels successfully in one call, because
`OrderStatus.CANCELLED` genuinely is in `ORDER_TRANSITIONS[PENDING]`.
The rule isn't "cancellation is forbidden" — it's "cancellation is only
legal from the states the business actually allows it from," which is
precisely the question Lesson 45 raised and left open.

### Connecting Back

Where Lesson 45 made an order's *current* status impossible to
misrepresent, this lesson makes an order's *next* status impossible to
misroute — together, the two lessons close both halves of "what can this
piece of data legally be, right now and next."

## Connect the Pieces

Order `501` moved through this lesson exactly once, cleanly:
`PENDING → PAID → SHIPPED`, each move checked against
`ORDER_TRANSITIONS` and allowed. The fourth attempted move,
`SHIPPED → CANCELLED`, was checked against the same table and rejected,
`order.status` left untouched at `SHIPPED` — proving the guard inspects
*before* acting, not after. Order `502`, run through the identical
`transition_to` method, shows the same table permitting a move
`501` was never asked to attempt: `PENDING → CANCELLED`, legal from a
state that hasn't shipped yet. One method, one table, two different
real outcomes, both correct for the same underlying rule.

## What Breaks Without This

The SE Lens above already named the honest limit: `transition_to` is the
*sanctioned* path, not the *only* one, because `self.status` is still an
ordinary, directly-assignable attribute. Prove it — build a `SHIPPED`
order the sanctioned way, then reach past `transition_to` entirely:

```python
order = Order(order_id=501, customer_id=17)
order.transition_to(OrderStatus.PAID)
order.transition_to(OrderStatus.SHIPPED)
order.status = OrderStatus.CANCELLED
print("status after direct assignment, bypassing transition_to:", order.status)
```

Run for real, this is what comes back:

```
status after direct assignment, bypassing transition_to: OrderStatus.CANCELLED
```

No `InvalidTransition`, no error of any kind — the exact move this
lesson's whole Concept Unit exists to forbid still happens, silently,
the instant a caller writes `order.status = ...` instead of
`order.transition_to(...)`. `ORDER_TRANSITIONS` is real, correct data,
and `transition_to` checks it faithfully every time it's called — but a
guard that can be walked around isn't a guarantee, it's a convention two
lines shorter than the alternative it replaced. That gap — making
`status` itself refuse to be set except through the guard — is exactly
what a later lesson in this domain, on protecting an object's own
invariants from its own attributes, exists to close.

## Exercises

1. Add `OrderStatus.RETURNED` to `ORDER_TRANSITIONS` as a state reachable
   only from `DELIVERED`, terminal itself (mapping to `set()`). Run a
   scenario that moves an order all the way to `RETURNED` and one that
   attempts `PENDING → RETURNED` directly, and paste both real outputs.
2. Write a `legal_next_states(order)` function that returns
   `ORDER_TRANSITIONS[order.status]` directly, and use it to print every
   order's legal next moves at each step of the "Run It" scenario above,
   without changing `transition_to` itself.
3. `TrafficLight`'s own `TRANSITIONS` table never gives `"RED"` a way
   back to itself, and neither state has a terminal state at all. Decide
   whether a real traffic light's lifecycle should have a terminal state,
   argue for your answer in a sentence, and if you decide it shouldn't,
   explain what "terminal state," as this lesson defined it, would even
   mean for a system that's supposed to run forever.

## Definition of Done

- [ ] `ORDER_TRANSITIONS` exists as a module-level dict mapping every
      `OrderStatus` member to the exact set of members legally reachable
      from it, including both terminal states mapping to `set()`.
- [ ] `Order.transition_to` is the only method in the file that assigns
      `self.status`, and it always checks `ORDER_TRANSITIONS` first.
- [ ] The "Run It" scenario above runs against your own file and
      produces output matching what's pasted here, including the
      rejected `SHIPPED → CANCELLED` attempt.
- [ ] The "What Breaks Without This" bypass has been run against your
      own file, not just read, and you can state in one sentence why it
      still succeeds.
- [ ] Commit, with a message stating *why*: something like `lifecycle:
      add a transition table so Order can no longer skip straight from
      shipped to cancelled`, not `add transition_to method`.

Up next: Lesson 47, Business Rules — rules that depend on more than just
an order's own status, the next layer past what a single entity's own
lifecycle can enforce by itself.
