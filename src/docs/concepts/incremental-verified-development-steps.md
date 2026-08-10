# Concept: Small, Independently-Verified Development Steps

**What you'll understand by the end:** why building a feature as a
sequence of small, individually-tested changes finds a real bug faster
and more precisely than writing the whole feature first and testing it
only once, at the end.

**Prerequisites:** `automated-testing-unit-test-basics.md`.

## Setup

Python 3, no packages needed.

## The Problem

A real feature is often built from several real, connected steps (here:
apply a discount, then tax, then shipping, to get a checkout total).
Writing every step first and only checking the *final* result once
everything exists tells you *that* something is wrong, but not *which*
step introduced the problem — by the time you find out, every step
written since the last real check is a candidate.

## The Isolated Example

```python
def apply_discount(price):
    return price * 0.9


def apply_tax(price):
    return price + 8  # bug: should be price * 1.08


def apply_shipping(price):
    return price + 5


# --- Big-batch: write all three, verify only the final result ---
def checkout_total_batch(price):
    price = apply_discount(price)
    price = apply_tax(price)
    price = apply_shipping(price)
    return price


result = checkout_total_batch(100)
print(f"big-batch final total: {result}")
print(f"expected (discount, real tax, shipping): {100 * 0.9 * 1.08 + 5}")

# --- Incremental: verify each step the moment it's written ---
price = 100
price = apply_discount(price)
assert price == 90, f"discount step broken: got {price}"
print("step 1 (discount) verified independently: 90 -- correct, move on")

price = apply_tax(price)
try:
    assert price == 97.2, f"tax step broken: got {price}, expected 97.2"
except AssertionError as e:
    print(f"step 2 (tax) FAILED immediately: {e}")
```

**Real output, run this session:**
```
big-batch final total: 103.0
expected (discount, real tax, shipping): 102.2
step 1 (discount) verified independently: 90 -- correct, move on
step 2 (tax) FAILED immediately: tax step broken: got 98.0, expected 97.2
```

**What this proves:** the big-batch version only reveals that the final
number (`103.0`) doesn't match the expected one (`102.2`) — nothing
about *which* of the three steps caused it. The incremental version
catches the exact same real bug (`apply_tax`'s `+ 8` typo, meant to be
`* 1.08`) immediately after that one step runs, with `apply_discount`
already independently proven correct one line earlier — the search
space for the bug is exactly one function, not three.

## Mechanical Walkthrough

- `checkout_total_batch` chains all three steps and is only checked
  against its own final output — a real, common way to write code
  first and "test later."
- The incremental block applies one step, asserts a real, specific
  expected value for *that step alone*, and only proceeds to the next
  step once the current one is proven correct.
- When `apply_tax`'s real bug fires, the incremental version's own
  `try`/`except` shows the failure attributed to exactly "step 2 (tax)"
  — nothing else needs to be re-examined, because step 1 already has
  its own, separate, already-passed proof.

## CS Lens

This is the same real principle behind **bisection search** for
regressions (`git bisect`, or manually narrowing down which commit
broke something): the smaller the amount of unverified new work between
two known-good checkpoints, the less there is to search when something
breaks. Verifying after every small step is bisection taken to its
limit — the "search space" for a new bug is always just the one most
recent change, never a backlog of several.

Also recognized in: Extreme Programming's small-batches practice,
continuous integration's "keep the build green" discipline, and
scientific experimentation's own practice of changing one variable at a
time rather than several at once before checking the result.

## SE Lens

The real, concrete cost of the incremental style: more, smaller pauses
to actually run something and check it, rather than writing
uninterrupted for longer stretches. The real, concrete payoff, shown
directly above: when something breaks, it's immediately obvious *where*
without having to re-examine already-proven-correct work. This tradeoff
gets more favorable the larger and more interdependent a real feature
is — for three tiny functions the difference is modest; for a real
system with many interacting pieces, the gap between "I know exactly
which of my last five lines broke this" and "somewhere in the last
three hours of work, something broke this" becomes the difference
between a five-minute fix and a much longer, much more frustrating one.

## Connection

Builds on `automated-testing-unit-test-basics.md` (this only works if
each step's own correctness is actually checked by something real, not
assumed). This is the real, standing practice a real, whole codebase's
own commit history follows one small, verified change at a time,
captured explicitly here so it's named once rather than left an
unexplained, implicit habit repeated indefinitely.

## Try It Yourself

1. Fix `apply_tax`'s real bug (`return price * 1.08`) and confirm both
   the big-batch and incremental versions now agree on `102.2`.
2. Introduce a *second*, independent bug into `apply_shipping` (e.g.
   `return price + 50`) alongside the original `apply_tax` bug. Run the
   big-batch version and try to determine, from its output alone,
   whether one or two things are actually wrong. Then run the
   incremental version and observe it catching and naming each broken
   step separately, in order.
3. Extend the incremental version with a fourth real step, verified the
   same way, and confirm adding it required no changes at all to the
   already-verified first three steps' own checks.
