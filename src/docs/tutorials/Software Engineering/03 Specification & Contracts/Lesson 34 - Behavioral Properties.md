# Lesson 34: Behavioral Properties

**What you will build.** A single claim about Lesson 32's cart —
"removing what you just added should return you to exactly where you
started" — checked not against one hand-picked example, the way every
postcondition in this domain has been checked so far, but against four
different starting carts. Three pass without incident. The fourth
reveals something genuinely unplanned: the claim, exactly as stated, is
false — not because `add_item` or `remove_item` has a bug, but because
the claim itself asked for more than the cart was ever actually supposed
to guarantee.

**What you need to know first.** Lesson 32's `add_item`/`remove_item`
cart and its state relation, and Lesson 29's postcondition — this lesson
generalizes both from a single checked example into a claim meant to hold
across every valid input.

**Terms introduced in this lesson**

- **behavioral property** — a general statement about a function's or
  operation's behavior that's meant to hold across *every* valid input,
  not just the one example a postcondition happens to check. Every
  postcondition and state relation this domain has written so far (Lesson
  29's `search_files_ranked`, Lesson 32's `remove_item`) was checked
  against one specific call. A behavioral property makes the same kind of
  claim, but as a general rule — "for any state and any price, adding
  then removing returns you to the start" — which means it has to be
  checked against more than one input before anyone can trust it's
  actually true in general, rather than true by coincidence of whichever
  example happened to be tried.

**Objects and methods used.** None new — this lesson's code uses only
already-assumed syntax: `sorted()`, already given full treatment in
Lesson 15, and list/dict equality, already used without comment since
Lesson 32.

Pipeline: this lesson continues in the *Specification* stage, restated
per Lesson 28's convention:

```text
Problem → Requirements → Domain model → Specification → Architecture →
Design → Implementation → Verification → Integration → Release →
Deployment → Operations → Observation → Change → Migration → Evolution →
Retirement
```

---

## Concept Unit: A Claim Meant to Hold Everywhere

### The Problem

Lesson 32 checked one specific call: add `4.00`, then remove `4.00`, and
confirmed the total dropped back correctly. Is there a more general claim
hiding behind that one example — something true not just for that cart
and that price, but for *any* cart and *any* price?

### The Concept

There is, and it's worth stating precisely, as a **behavioral property**:
*for any cart state and any price, adding that price and then removing it
again should return the cart to exactly the state it started in.* This
is a stronger, more general claim than Lesson 32's own state relation,
which only ever checked the total. A property like this one can't be
trusted from a single passing example the way a postcondition can — it
has to be checked against a real range of inputs before it's earned any
right to be believed as a general rule.

### CS Lens

This is the same widening Lesson 15 performed on `search_files` — moving
from "does this one call return the right answer" to "does this hold as
a general rule" — applied here to a claim about behavior instead of a
claim about search relevance.

### SE Lens

Writing a property this way costs something real: it's a stronger,
riskier claim than any single postcondition, and stronger claims are
more likely to turn out false. That risk is the entire point of checking
one at all — a property that survives being checked against several real
cases is worth far more confidence than one checked against a single,
possibly lucky example.

---

## Concept Unit: Checking It — and Finding It Isn't Quite True

### The Problem

Check the property against several different starting carts and prices,
not just one.

### The Code, Run for Real

```python
def check_add_then_remove_is_identity(state, price):
    after_add = add_item(state, price)
    after_remove = remove_item(after_add, price)
    assert after_remove == state, (
        f"behavioral property violated: add_item then remove_item({price}) "
        f"should return to {state}, got {after_remove}"
    )
```

Run it against four real cases:

```python
test_cases = [
    ({"items": [], "total": 0.0}, 5.0),
    ({"items": [1.0, 2.0], "total": 3.0}, 2.0),
    ({"items": [10.0], "total": 10.0}, 10.0),
    ({"items": [3.5, 1.5, 2.0], "total": 7.0}, 1.5),
]

for state, price in test_cases:
    check_add_then_remove_is_identity(state, price)
    print("holds for", state, "+", price)
```

Running it:

```text
$ python cart_property.py
holds for {'items': [], 'total': 0.0} + 5.0
holds for {'items': [1.0, 2.0], 'total': 3.0} + 2.0
holds for {'items': [10.0], 'total': 10.0} + 10.0
Traceback (most recent call last):
  File "cart_property.py", line 20, in <module>
    check_add_then_remove_is_identity(state, price)
  File "cart_property.py", line 6, in check_add_then_remove_is_identity
    assert after_remove == state, (
AssertionError: behavioral property violated: add_item then remove_item(1.5) should return to {'items': [3.5, 1.5, 2.0], 'total': 7.0}, got {'items': [3.5, 1.5, 2.0], 'total': 7.0}
```

The first three cases hold cleanly. The fourth fails — and the printed
values in the error message look identical at a glance, which is itself
worth noticing before moving on.

### The Concept

Look more closely at what actually happened on the fourth case. The
starting cart was `[3.5, 1.5, 2.0]`. Adding `1.5` produces
`[3.5, 1.5, 2.0, 1.5]` — two `1.5`s now, one original, one just added.
`remove_item`'s `.remove(1.5)`, given full treatment in Lesson 32, removes
the *first* matching value it finds — the original `1.5`, sitting at
index `1`, not the one just appended at the end. The result is
`[3.5, 2.0, 1.5]`: the same three values, the identical total, `7.0` —
but in a different order than the cart started in. `after_remove == state`
compares lists by position, so `[3.5, 2.0, 1.5]` and `[3.5, 1.5, 2.0]`
count as unequal, even though nothing about the cart's real contents
actually changed.

### CS Lens

This is a real, direct case of a property test doing exactly the job
Lesson 21's ambiguity detection did for requirements: not proving code is
wrong, but proving a *stated claim* was imprecise enough to admit a case
nobody had pictured — here, a cart that already contained the exact price
being re-added.

### SE Lens

Neither `add_item` nor `remove_item` did anything unreasonable. `.remove()`
removing the first match is exactly how Lesson 32 already said it works.
The real question this failure raises isn't "which function has the
bug" — it's whether the property, exactly as stated, was ever actually
true of what this cart promises. That's a genuinely different diagnosis
than every earlier lesson in this domain has produced, and it's worth
sitting with before reaching for a fix.

---

## Concept Unit: The Property Was Asking for Too Much

### The Problem

Is `add_item`/`remove_item` actually broken, or was the property wrong to
demand exact order in the first place?

### The Concept

Nothing about a shopping cart's real contract, anywhere in this
curriculum, ever promised that item *order* would survive an add-then-
remove round trip — only that the cart's actual contents and total would.
The original property demanded more than that: exact list equality,
position included, which is a stronger claim than the cart's real
purpose ever needed. Restate the property to ask only what's actually
meant to be guaranteed:

```python
def check_add_then_remove_preserves_contents(state, price):
    after_add = add_item(state, price)
    after_remove = remove_item(after_add, price)
    assert after_remove["total"] == state["total"], "total not preserved"
    assert sorted(after_remove["items"]) == sorted(state["items"]), (
        f"behavioral property violated: add_item then remove_item({price}) "
        f"should contain the same items as {state['items']}, got {after_remove['items']}"
    )
```

Run it against all four cases, including the one that just failed:

```python
for state, price in test_cases:
    check_add_then_remove_preserves_contents(state, price)
    print("holds for", state, "+", price)
```

Running it:

```text
$ python cart_property.py
holds for {'items': [], 'total': 0.0} + 5.0
holds for {'items': [1.0, 2.0], 'total': 3.0} + 2.0
holds for {'items': [10.0], 'total': 10.0} + 10.0
holds for {'items': [3.5, 1.5, 2.0], 'total': 7.0} + 1.5
```

All four hold. Nothing about `add_item` or `remove_item` changed — only
the property's own wording did, from "identical, position included" to
"the same items, in any order, and the same total."

### Mechanical Walkthrough

- `sorted(after_remove["items"]) == sorted(state["items"])` — already-
  assumed `sorted()` and list equality; sorting both sides before
  comparing makes the check order-independent, exactly matching what the
  cart's real contract actually promises rather than what the original
  property assumed it did.

### CS Lens

This is exactly the same order-versus-membership distinction Lesson 29's
own postcondition drew for `search_files_ranked` —
`sorted(result) == sorted(matches)` there, for the identical reason:
some properties are genuinely about *which* elements are present, not
what order they happen to sit in, and conflating the two produces a
check stricter than the real contract it's supposed to represent.

### SE Lens

This is worth stating as its own real lesson, distinct from every earlier
one in this domain: not every failed check means the code is wrong.
Sometimes — as here — it means the specification asked for something the
system never actually promised. Telling the two apart matters, because
"fix the code" and "fix the claim" are different repairs, and applying
the wrong one either leaves a real bug in place or forces an
implementation into guaranteeing something it never needed to. This
curriculum's closing lesson in this domain returns to exactly this
question, at real depth, under its own name.

---

## Connect the Pieces

One claim, checked broadly, found imprecise, corrected — not the code:

1. **The property, stated generally** — add then remove should return a
   cart to where it started, for any state and any price.
2. **Checked across four cases, failing on the fourth** — a cart already
   containing the price being re-added exposes that `.remove()` deletes
   the *first* match, not necessarily the one just added.
3. **The real diagnosis** — `add_item` and `remove_item` were never
   wrong; the property demanded exact order when the cart's real contract
   only ever promised contents and total.
4. **The corrected property, holding everywhere** — order-independent
   comparison passes on all four cases, including the one that broke the
   stronger, over-specified version.

## What Breaks Without This

Trust a property after checking it against only one or two convenient
examples — exactly the habit this lesson's first three passing cases
could have encouraged, stopping right before the fourth revealed
anything. A property checked against too narrow a range of inputs earns
false confidence: it looks proven, the same way `add_item`/`remove_item`
looked proven after three clean passes, while a real, findable case —
here, a repeated price — sits unchecked and undiscovered until it shows
up in production instead of in a lesson's own worked example.

## Exercises

1. Find a fifth test case, different from all four in this lesson, that
   also breaks the original, order-sensitive property. Explain, before
   running it, why you expect it to fail.
2. Write a second behavioral property for the cart: removing an item
   that was never added should leave the cart unchanged rather than
   crashing. Check whether the current `remove_item` actually satisfies
   it — it doesn't, and you don't need to fix it yet, only demonstrate
   the failure the way this lesson demonstrated the order issue.
3. Explain, in your own words, the difference between "this test failed
   because the code is wrong" and "this test failed because the property
   asked for too much." Use an example from your own experience if you
   have one, real or from an earlier lesson in this curriculum.

## Definition of Done

- [ ] You can define a behavioral property in your own words, and
      explain why checking one against a single example isn't enough.
- [ ] You've reproduced the real order-sensitivity failure and confirmed
      the corrected, order-independent property holds across all four
      cases.
- [ ] You can explain the difference between a broken implementation and
      an over-specified property, using this lesson's own example.
- [ ] You've completed all three exercises.
- [ ] Commit `check_add_then_remove_preserves_contents`, replacing the
      original, over-specified version. Commit message should explain
      *why*: for example, `Lesson 34 — corrected the add/remove
      round-trip property to compare contents and total instead of exact
      list order, which the cart's real contract never promised.`
