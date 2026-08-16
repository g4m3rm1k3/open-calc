# Lesson 63: Substitution

**What you will build.** `RushOrder`, a subclass of `Order`, overrides
`transition_to` to refuse cancelling a paid order — a stricter rule than
`Order` itself makes. A batch refund job, written generically against
`Order`, iterates a mixed list of regular orders and rush orders,
calling `transition_to(CANCELLED)` on each. It crashes on the first
`RushOrder` it meets, and never returns the refunds it had already
processed. This lesson removes the subclass entirely: `is_rush` becomes
an ordinary field on `Order` itself, and a `can_cancel_order` business
rule — the same named-function shape Lesson 47 already established —
checks it explicitly, so the batch job can decide what to skip instead
of being surprised by it. The transferable problem: Lesson 62 named that
inheritance makes an "is-a" claim; this lesson is the formal test for
whether that claim actually holds — a subclass that overrides a method
to accept *less* than its parent promised breaks every piece of code
that was correctly written against the parent's own contract.

**What you need to know first.** Composition (Lesson 62) — the "is-a"
versus "has-a" distinction this lesson gives a precise, checkable test
for. Lifecycle Modeling (Lesson 46) — `ORDER_TRANSITIONS` as the
contract `transition_to` originally made; this lesson is about what
happens when a subclass quietly narrows it. Business Rules (Lesson 47)
— `can_cancel_order`, this lesson's actual fix, reusing the exact
named-function shape `customer_can_pay` already established.

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

Still the **Design** stage. Carried through: Lesson 62 named the claim
inheritance makes; this lesson gives that claim a real, checkable test —
one every later lesson on polymorphism in this domain will assume has
already been asked.

**Terms introduced in this lesson.** One line each.

- **Liskov Substitution Principle** — the rule that any place code
  correctly works with a value of a given type, it must also work
  correctly with a value of any subtype of that type, without the
  caller needing to check which one it actually received. It's the
  formal test for exactly when inheritance's is-a claim, named in Lesson
  62, is actually safe to make — a subclass that narrows what its parent
  promises still violates it, even while every overridden method keeps
  the exact same signature.
- **contract narrowing** — when a subclass accepts fewer inputs, allows
  fewer operations, or promises less than its parent type did, even
  though every method it overrides still type-checks correctly. It's
  worth naming because it's the specific, easy-to-miss way a subclass
  violates substitutability without ever failing to compile — the break
  only shows up at the exact moment a caller trusts the parent's own,
  wider promise.

**Objects and methods used.** None new — `super()` and ordinary class
inheritance are already established constructs in this curriculum;
what's new is the test this lesson applies to a relationship built with
them.

## Concept Unit: A Subclass That Promises Less Is Not Substitutable

### The Problem

`RushOrder` inherits from `Order` and overrides `transition_to` to add a
stricter rule: a rush order can't be cancelled once it's been paid for.

```python
class RushOrder(Order):
    def transition_to(self, new_status):
        if self.status == OrderStatus.PAID and new_status == OrderStatus.CANCELLED:
            raise InvalidTransition("rush orders cannot be cancelled once paid")
        super().transition_to(new_status)
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. A batch refund job, written generically
against `Order`, has no reason to know `RushOrder` exists at all:

```python
def cancel_all_pending_refunds(orders):
    refunded = []
    for order in orders:
        order.transition_to(OrderStatus.CANCELLED)
        refunded.append(order.order_id)
    return refunded


o1 = Order(order_id=501)
o1.transition_to(OrderStatus.PAID)

o2 = RushOrder(order_id=502)
o2.transition_to(OrderStatus.PAID)

try:
    result = cancel_all_pending_refunds([o1, o2])
    print("refunded:", result)
except InvalidTransition as e:
    print("InvalidTransition:", e)
```

Running it produces:

```
InvalidTransition: rush orders cannot be cancelled once paid
```

`cancel_all_pending_refunds` never gets to `return` — it crashes on the
second order in the list, and the caller never even learns that order
`501` was already, correctly, cancelled before the crash; that
information is lost with the function's own local `refunded` list.
`RushOrder` type-checks perfectly as an `Order` — every method it
overrides has a matching signature — and still broke a function that was
written entirely correctly against `Order`'s own documented behavior.
That's the exact shape of a **Liskov Substitution Principle** violation:
`RushOrder` narrowed what `transition_to` promises, and nothing about
Python's own type system caught it.

### Project Change

- **Reference Source:** none — a from-scratch addition continuing this
  curriculum's own running `Order` example, not a port of an external
  reference codebase.
- **Files affected:** `orders.py`, modified — `RushOrder` removed
  entirely; `Order` gains an `is_rush` field.
- **Change type:** refactor — replace a subclass with a field plus a
  business-rule function.
- **Location:** `Order.__init__`, plus a new module-level
  `can_cancel_order` function.
- **Dependencies:** none.

### The New Code

The smallest new piece is the business-rule function that replaces the
subclass's overridden behavior:

```python
def can_cancel_order(order):
    if order.is_rush and order.status == OrderStatus.PAID:
        return False
    return OrderStatus.CANCELLED in ORDER_TRANSITIONS[order.status]
```

### The Updated Project

`RushOrder` is deleted; `Order` gains one new field, and the batch job
is rewritten to check the rule explicitly instead of trusting
polymorphism to enforce it silently:

```python
class Order:
    def __init__(self, order_id, is_rush=False):              # ← changed
        self.order_id = order_id
        self.status = OrderStatus.PENDING
        self.is_rush = is_rush                                  # ← new

    def transition_to(self, new_status):
        if new_status not in ORDER_TRANSITIONS[self.status]:
            raise InvalidTransition(f"{self.status} cannot transition to {new_status}")
        self.status = new_status


def can_cancel_order(order):                                    # ← new
    if order.is_rush and order.status == OrderStatus.PAID:        # ← new
        return False                                              # ← new
    return OrderStatus.CANCELLED in ORDER_TRANSITIONS[order.status]  # ← new


def cancel_all_pending_refunds(orders):
    refunded = []
    skipped = []                                                 # ← new
    for order in orders:
        if not can_cancel_order(order):                           # ← new
            skipped.append(order.order_id)                          # ← new
            continue                                                # ← new
        order.transition_to(OrderStatus.CANCELLED)
        refunded.append(order.order_id)
    return refunded, skipped                                       # ← changed
```

Every `Order`, rush or not, is now the exact same type, with the exact
same `transition_to` contract — nothing about calling `transition_to` on
one behaves differently from any other. The difference that used to live
in a silently-overridden method now lives in `can_cancel_order`, a
function the batch job calls explicitly, on purpose, before deciding
what to do.

### Isolating the Concept: A Subclass That Refuses What Its Parent Allowed

The mechanism this lesson's fix avoids — a subclass overriding a method
to refuse an operation its parent type allows — deserves to be seen on
its own first. Here it is breaking generic code written against a
`Stack`:

```python
class Stack:
    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        return self._items.pop()


class ReadOnlyStack(Stack):
    def push(self, item):
        raise TypeError("this stack is read-only")


def fill_stack(stack, items):
    for item in items:
        stack.push(item)
    return stack


regular = fill_stack(Stack(), [1, 2, 3])
print("regular stack filled:", regular._items)

readonly = ReadOnlyStack()
try:
    fill_stack(readonly, [1, 2, 3])
except TypeError as e:
    print("TypeError:", e)
```

Running it produces:

```
regular stack filled: [1, 2, 3]
TypeError: this stack is read-only
```

This is the identical shape of failure as `RushOrder`: `fill_stack` is
written correctly against `Stack`'s own contract — `push` should always
succeed — and `ReadOnlyStack` type-checks as a `Stack` while silently
refusing the one operation every caller of `Stack.push` is entitled to
assume works. `ReadOnlyStack` isn't a bad idea; it's a bad *subclass* —
a read-only stack is a genuinely different thing from a stack, not a
stricter version of one, the same way a rush order turned out not to be
a stricter kind of order so much as an order with one more fact attached
to it. This throwaway example is now discarded; `Stack` and
`ReadOnlyStack` do not appear anywhere else in this lesson or this
project again.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`def __init__(self, order_id, is_rush=False):`** — `Order`'s
  constructor gains one new parameter, `is_rush`, defaulting to `False`
  so every existing call to `Order(order_id=...)` keeps working
  unchanged.
- **`self.is_rush = is_rush`** — an ordinary instance attribute
  assignment, storing the fact directly on the one `Order` type — no
  subclass required to represent it.
- **`def can_cancel_order(order):`** — a function taking one `Order`,
  the same shape as `customer_can_pay` from Lesson 47.
- **`if order.is_rush and order.status == OrderStatus.PAID: return
  False`** — checks the two facts that together make cancellation
  illegal for this specific order, returning `False` immediately if
  both hold.
- **`return OrderStatus.CANCELLED in ORDER_TRANSITIONS[order.status]`**
  — otherwise, falls back to the exact same lifecycle check
  `transition_to` itself already makes, so `can_cancel_order` never
  disagrees with what `transition_to` would actually allow for a
  non-rush order.

### CS Lens

This is the **Liskov Substitution Principle**, formally: if `S` is a
subtype of `T`, every property provable about objects of type `T`
should still be provable about objects of type `S`. `RushOrder`
satisfies this for every individual method *signature* — Python's
runtime never objects to the override — but violates it for
*behavior*: a property true of every `Order` (`transition_to(CANCELLED)`
succeeds from any state where `ORDER_TRANSITIONS` allows it) stops being
true for `RushOrder`. This is exactly why type-checking alone, in any
language, can't catch every LSP violation — the types line up; only the
actual behavior, exercised the way `cancel_all_pending_refunds` exercised
it, reveals the break.

Also recognized in: the classic square-inheriting-from-rectangle example
(setting a square's width independently of its height breaks code
written against a general rectangle's contract), a `ImmutableList`
subclassing a mutable `List` and overriding every mutating method to
raise, and a payment method subtype that refuses currencies its parent
type otherwise accepts.

### SE Lens

The principle is **prefer a field and a rule over a subclass whenever
the difference isn't a difference in what an object fundamentally is**
— the alternative that was rejected, `RushOrder(Order)`, treated "is
this order rush" as if it changed *what kind of thing* an order is,
when it's really just one more fact about an ordinary order, better
represented as data checked by an explicit rule than as a silently
divergent method override. The real cost of the fix: every place that
used to rely on `isinstance(order, RushOrder)` to detect rush orders now
has to check `order.is_rush` instead — a real, mechanical migration —
in exchange for `Order`'s own contract meaning the same thing for every
single order that exists, with no exceptions a caller has to remember to
check for by type.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running the fixed batch job against the identical mix of one regular
order and one rush order, both already paid:

```python
o1 = Order(order_id=501)
o1.transition_to(OrderStatus.PAID)

o2 = Order(order_id=502, is_rush=True)
o2.transition_to(OrderStatus.PAID)

refunded, skipped = cancel_all_pending_refunds([o1, o2])
print("refunded:", refunded)
print("skipped (rush, already paid):", skipped)
```

The real output:

```
refunded: [501]
skipped (rush, already paid): [502]
```

The batch job runs to completion this time, for both orders, with no
exception anywhere. Order `501` is refunded correctly; order `502` is
skipped, deliberately, with the caller able to see and act on that fact
— rather than the entire batch failing partway through and silently
losing track of what had already succeeded.

### Connecting Back

Where Lesson 62 named the claim inheritance makes, this lesson proves
what happens when that claim turns out false in practice — and, like
Lesson 62's own fix, the way out is the same: replace the false is-a
relationship with an honest fact and an explicit rule, rather than
letting a silently overridden method carry the difference.

## Connect the Pieces

A mixed batch of one regular order and one rush order, both paid, was
run through `cancel_all_pending_refunds` twice. First, with `RushOrder`
as a subclass overriding `transition_to`: the batch crashed on the
second order, and the caller never learned the first order's refund had
already succeeded. Second, with `is_rush` as an ordinary field checked
by `can_cancel_order`: the batch completed for both orders, correctly
refunding one and explicitly skipping the other, with the caller able to
see both outcomes.

## What Breaks Without This

`can_cancel_order` protects `cancel_all_pending_refunds`, because that
function was rewritten to call it. It does nothing to protect a
*different* function that still calls `transition_to` directly, ignorant
of the rush-order rule entirely — because, unlike Lesson 45's `Enum`,
this fix doesn't make an illegal state structurally impossible; it's a
rule a caller has to know to ask:

```python
def emergency_cancel(order):
    order.transition_to(OrderStatus.CANCELLED)


rush_order = Order(order_id=503, is_rush=True)
rush_order.transition_to(OrderStatus.PAID)
emergency_cancel(rush_order)
print("status after emergency_cancel, bypassing can_cancel_order:", rush_order.status)
```

Run for real, this is what comes back:

```
status after emergency_cancel, bypassing can_cancel_order: OrderStatus.CANCELLED
```

`emergency_cancel` never calls `can_cancel_order` — it calls
`transition_to` directly, and `ORDER_TRANSITIONS` alone has no idea
`is_rush` even exists, so it allows the move without objection. The rush
order gets cancelled anyway, the exact outcome this lesson's whole fix
was built to prevent, through a call site that simply never asked the
right question. Removing the subclass fixed the substitutability
problem; it didn't automatically protect every future caller the way a
structurally enforced invariant would have.

## Exercises

1. Rewrite `emergency_cancel` to call `can_cancel_order` first, the same
   way `cancel_all_pending_refunds` does, and prove with real output that
   the identical rush order is now correctly refused.
2. `ReadOnlyStack`, from this lesson's isolated lab, could instead be
   modeled as a plain `Stack` with an `is_read_only` flag, checked by a
   `can_push(stack)` function — the identical fix this lesson applied to
   `RushOrder`. Write that version, and prove `fill_stack` can be
   rewritten to check it and skip cleanly instead of crashing.
3. Not every subclass narrows its parent's contract. Write a
   `LoggedOrder(Order)` that overrides `transition_to` only to print a
   message before calling `super().transition_to(new_status)` unchanged,
   with no new restriction. Argue, using this lesson's own test, why this
   subclass *does* satisfy the Liskov Substitution Principle where
   `RushOrder` didn't.

## Definition of Done

- [ ] `RushOrder` no longer exists as a class; `is_rush` is a field on
      `Order` itself.
- [ ] `can_cancel_order` checks `is_rush` before falling back to
      `ORDER_TRANSITIONS`.
- [ ] The Problem section's crash has been reproduced for real, against
      the *original* `RushOrder` subclass, before you apply the fix.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here.
- [ ] The "What Breaks Without This" `emergency_cancel` bypass has been
      run against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `substitution:
      replace RushOrder subclass with an is_rush field and an explicit
      rule, so batch code written against Order can't be silently broken
      by a narrower subtype`, not `remove subclass`.

Up next: Lesson 64, Polymorphism in Engineering — now that substitution
has a real test, what polymorphism is actually *for* when it's used
correctly, not as a shortcut for code reuse.
