# Lesson 32: State-Based Specifications

**What you will build.** A small shopping cart, represented as a plain
piece of state — a list of items and a running total — with two
operations, `add_item` and `remove_item`. `remove_item` will have a real,
plausible bug: it correctly removes the item from the list and forgets
to update the total. Every ordinary postcondition this domain has built
so far would miss it completely, because `remove_item`'s own return
value looks locally reasonable. Catching it requires a genuinely
different kind of check — one that relates the cart's state *before* the
operation to its state *after*, not just the operation's own arguments to
its own result.

**What you need to know first.** Lesson 29's postcondition — this lesson
builds a specification that a postcondition, exactly as Lesson 29 defined
it, cannot express, and shows precisely why.

**Terms introduced in this lesson**

- **state-based specification** — a specification that describes an
  operation by relating the state *before* it runs to the state *after*,
  rather than describing the operation only in terms of its own arguments
  and return value in isolation. The word matters because Lesson 29's
  postcondition, exactly as defined there, only ever looked at one
  function call's own inputs and output — `average(readings)`'s
  postcondition needed nothing but `readings` and the result. Some real
  operations, like removing an item from a cart, can only be correctly
  specified by comparing two different moments of the *same* persistent
  data, which a single call's own arguments and return value don't
  capture on their own.

**Objects and methods used.** `list.remove(value)`, first appearance in
this curriculum: removes the first occurrence of `value` from a list in
place, given full treatment where it's used below.

Pipeline: this lesson continues in the *Specification* stage, restated
per Lesson 28's convention:

```text
Problem → Requirements → Domain model → Specification → Architecture →
Design → Implementation → Verification → Integration → Release →
Deployment → Operations → Observation → Change → Migration → Evolution →
Retirement
```

---

## Concept Unit: A Bug a Postcondition Alone Can't See

### The Problem

Build a small cart, as a plain piece of state — a list of items and a
running total — with two operations.

### The Code, Run for Real

```python
def add_item(state, price):
    return {"items": state["items"] + [price], "total": state["total"] + price}

def remove_item(state, price):
    new_items = list(state["items"])
    new_items.remove(price)
    return {"items": new_items, "total": state["total"]}
```

Build a cart with two items, then remove one:

```python
cart = {"items": [], "total": 0.0}
cart = add_item(cart, 12.50)
cart = add_item(cart, 4.00)
print(cart)

new_cart = remove_item(cart, 4.00)
print(new_cart)
```

Running it:

```text
$ python cart.py
{'items': [12.5, 4.0], 'total': 16.5}
{'items': [12.5], 'total': 16.5}
```

The item is gone from `items` — `[12.5, 4.0]` correctly became `[12.5]`.
The `total`, `16.5`, never changed. `remove_item` forgot to subtract the
removed item's price. Now consider what a Lesson 29-style postcondition,
looking only at this call's own arguments and return value, could
actually say about this: `remove_item(cart, 4.00)` takes a `state` and a
`price` and returns a new `state` — there's no single, simple relationship
between `4.00` and the returned dict alone that says "the total should be
lower by exactly this much," because that fact isn't about the return
value in isolation. It's about how the return value relates to the
*state that came in*.

### Mechanical Walkthrough

- `list(state["items"])` — copies `state["items"]` into a new list,
  already-assumed `list()` conversion; done here specifically so the
  original `state["items"]` isn't mutated by the `.remove()` call that
  follows.
- `new_items.remove(price)` — given full treatment above: finds and
  removes the first list element equal to `price`. Already-assumed to
  succeed here because `4.00` is genuinely present in `new_items`; a
  value not found would raise a real `ValueError`, a different failure
  this lesson doesn't explore further.
- `"total": state["total"]` — the actual bug, in the mechanical
  enumeration: this line simply copies the old total forward unchanged,
  instead of computing `state["total"] - price`.

### CS Lens

This is the same gap Lesson 6 opened between correctness and reliability,
approached from a new direction: `remove_item`'s output is a
well-formed, plausible-looking dict — nothing about it, examined alone,
looks wrong. The defect is only visible by comparing it against something
outside the call itself: the state that existed a moment before.

### SE Lens

The realistic risk here is trusting Lesson 29's postcondition machinery
to catch every kind of mistake, simply because it already caught a real
one in `search_files_ranked`. Postconditions are powerful specifically
for what they were built to check — a function's own input-to-output
relationship. Persistent, changing state introduces a genuinely different
shape of correctness question, and this domain needs a genuinely
different tool to ask it.

---

## Concept Unit: Specifying the Relationship Between Two Moments

### The Problem

Write a real, checkable specification for `remove_item` that actually
captures what went wrong — not "the output looks reasonable," but "the
new total must equal the old total minus the removed price."

### The New Code

```python
def check_remove_item_relation(old_state, price, new_state):
    expected_total = old_state["total"] - price
    assert new_state["total"] == expected_total, (
        f"state relation violated: total should go from {old_state['total']} "
        f"to {expected_total} after removing {price}, but got {new_state['total']}"
    )
```

Run it against the buggy version's real output:

```python
check_remove_item_relation(cart, 4.00, new_cart)
```

Here's what actually happens:

```text
$ python cart.py
Traceback (most recent call last):
  File "cart.py", line 20, in <module>
    check_remove_item_relation(cart, 4.00, new_cart)
  File "cart.py", line 4, in check_remove_item_relation
    assert new_state["total"] == expected_total, (
AssertionError: state relation violated: total should go from 16.5 to 12.5 after removing 4.0, but got 16.5
```

Immediate, exact, and specific: not just "something's wrong," but the
precise expected value, `12.5`, against the precise actual one, `16.5`.

### The Fix

```python
def remove_item(state, price):
    new_items = list(state["items"])
    new_items.remove(price)
    return {"items": new_items, "total": state["total"] - price}
```

Run the identical check against the corrected version:

```python
new_cart = remove_item(cart, 4.00)
check_remove_item_relation(cart, 4.00, new_cart)
print(new_cart)
print("state relation held")
```

Running it:

```text
$ python cart.py
{'items': [12.5], 'total': 12.5}
state relation held
```

### The Concept

`check_remove_item_relation` takes **three** arguments where a Lesson
29-style postcondition would only ever see two — it needs `old_state`
explicitly, alongside the operation's own argument and its result,
because the property being checked genuinely spans two different moments
of the same data. This is what makes it a **state-based specification**
rather than an ordinary postcondition: the claim isn't about
`remove_item`'s inputs and output considered alone, it's about how one
snapshot of the cart's state relates to the next one, across the
operation that connects them.

### CS Lens

This is a real, direct instance of what formal specification traditions
call a **before/after relation** — common in specifying operations on
databases, file systems, or any object with persistent state, where
correctness is fundamentally a claim about a *transition*, not a
standalone input/output pair.

### SE Lens

Notice this specification had to be written *against the bug*, not
derived automatically from `remove_item`'s signature the way Lesson 28's
precondition or Lesson 29's postcondition could be attached with a
generic decorator. State relations are specific to what a particular
operation is supposed to preserve or change, which means they cost real,
specific thought per operation — a cost worth paying exactly when an
operation's correctness genuinely depends on more than its own arguments,
the way `remove_item`'s did and `average`'s never has.

---

## Concept Unit: What This Adds to the Contract

### The Problem

Design by Contract, per Lesson 31, already covers preconditions,
postconditions, and invariants. Where does a state-based specification
fit relative to those three?

### The Concept

It doesn't replace any of them — it extends what a postcondition can
express, specifically for operations that transform persistent state
rather than compute a fresh answer from scratch. `average` never needed
this: its result depends entirely on its own argument, with nothing
carried over from a previous call. `remove_item` does need it, because
the entire point of a cart is that it *persists* across operations —
`add_item` and `remove_item` are only meaningful in relation to each
other, connected by the state they share. Lesson 30's invariant — a
condition true at every valid moment — and this lesson's state relation —
a condition relating two specific moments — are close cousins: an
invariant says "this must always be true"; a state relation says "this
must be true about how this specific operation is allowed to change
things." Together with preconditions, postconditions, and invariants,
this is the fourth real tool this domain has built for stating a
contract precisely enough to check mechanically.

### CS Lens

This is the same distinction formal methods draw between a stateless
function's specification and a state machine's transition relation — the
first needs only input and output; the second inherently needs "state
before" and "state after," which is exactly the shape Lesson 33, next,
gives a full, named structure of its own.

### SE Lens

Recognizing *which* kind of specification an operation actually needs is
itself a real skill this lesson is building: reaching for a Lesson 29
postcondition on an operation that secretly depends on prior state, the
way an early, ungeneralized attempt at specifying `remove_item` might
have, produces a check that looks reasonable and misses the actual bug —
this lesson's own opening unit demonstrated exactly that gap before
building the tool that closes it.

---

## Connect the Pieces

One cart, one operation, one bug only a state relation could catch:

1. **A postcondition-shaped question, asked and found wanting** —
   `remove_item`'s own arguments and return value, considered alone,
   contain nothing a Lesson 29 postcondition could use to catch the
   missing subtraction.
2. **The state relation, written and run** — `check_remove_item_relation`
   compares `old_state` to `new_state` directly, catching the exact
   `16.5`-versus-`12.5` discrepancy immediately.
3. **The fix, verified the same way** — the corrected `remove_item`
   satisfies the identical relation, confirmed by real output.

## What Breaks Without This

Ship the buggy `remove_item`, verified only by a postcondition checking
that its return value is a well-formed dict with the right keys — which
it is, every time. Real carts drift: a customer removes an item, the
displayed total doesn't change, and every check the team wrote passes,
because none of them ever compared the cart's state before the removal
to its state after. The bug isn't invisible because nobody tested
`remove_item` — it's invisible because the *kind* of test that was
written could never have seen it.

## Exercises

1. Write a state relation for `add_item`: the new total must equal the
   old total plus the added price, and the new item list must equal the
   old one with the new price appended. Run it against the real
   `add_item` calls from this lesson's opening unit.
2. Add a `clear_cart(state)` operation and its own state relation: after
   clearing, the total must be `0.0` and the item list must be empty,
   regardless of what the old state was.
3. Explain, in your own words, why `check_remove_item_relation` needs
   `old_state` as an explicit argument, while Lesson 29's postcondition
   for `search_files_ranked` never needed anything but the function's own
   real arguments and return value.

## Definition of Done

- [ ] You can define a state-based specification in your own words, and
      explain how it differs from an ordinary postcondition.
- [ ] You've reproduced the real `remove_item` bug and confirmed the
      state relation catches it and the fix satisfies it.
- [ ] You've completed all three exercises.
- [ ] Commit the corrected `remove_item` and
      `check_remove_item_relation`. Commit message should explain *why*:
      for example, `Lesson 32 — remove_item was silently leaving the cart
      total unchanged; caught by a state relation comparing cart state
      before and after, which an ordinary postcondition couldn't
      express.`
