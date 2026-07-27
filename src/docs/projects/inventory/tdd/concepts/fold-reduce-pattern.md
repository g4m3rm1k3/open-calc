# Concept: Fold / Reduce

**What you'll understand by the end:** the general pattern of building up a single result by processing a sequence of inputs one at a time, accumulating as you go.

**Prerequisites:** none.

## Setup

Python 3, no packages needed.

## The Problem

A very common shape of computation takes a sequence of items and combines them into one final result — a sum, a maximum, a combined data structure — by looking at each item once, in order, updating an accumulator as it goes.

## The Isolated Example

```python
numbers = [3, 1, 4, 1, 5, 9]

total = 0
for n in numbers:
    total = total + n
print(total)

from functools import reduce
total_via_reduce = reduce(lambda acc, n: acc + n, numbers, 0)
print(total_via_reduce)
```

**Real output:**
```
23
23
```

**What this proves:** the hand-written loop and `functools.reduce` compute the identical result the identical way — both start with an accumulator (`0`), and update it once per item by combining the current accumulator with the next item. `reduce` is just a named, reusable version of the exact loop shape written out above it.

## Mechanical Walkthrough

- `total = 0` is the **accumulator** — the running result, seeded with a starting value.
- Each loop iteration computes a *new* accumulator value from the *old* one and the current item (`total = total + n`) — the old value is never needed again after this step.
- `reduce(function, sequence, initial)` performs exactly this loop generically: call `function(accumulator, item)` once per item, threading the result through as the new accumulator each time, starting from `initial`.

## Execution Trace

The hand-written loop against `numbers = [3, 1, 4, 1, 5, 9]`:

```
Start: total = 0
n=3: total = 0 + 3 = 3
n=1: total = 3 + 1 = 4
n=4: total = 4 + 4 = 8
n=1: total = 8 + 1 = 9
n=5: total = 9 + 5 = 14
n=9: total = 14 + 9 = 23
Final: total = 23
```

`reduce(lambda acc, n: acc + n, numbers, 0)` runs the identical
sequence, just with `acc` as the parameter name instead of `total`, and
the combining step expressed as a lambda instead of a loop body:

```
Start: acc = 0 (the initial value)
acc=0, n=3: lambda(0, 3)  = 3   → acc = 3
acc=3, n=1: lambda(3, 1)  = 4   → acc = 4
acc=4, n=4: lambda(4, 4)  = 8   → acc = 8
acc=8, n=1: lambda(8, 1)  = 9   → acc = 9
acc=9, n=5: lambda(9, 5)  = 14  → acc = 14
acc=14, n=9: lambda(14, 9) = 23 → acc = 23
Final: total_via_reduce = 23
```

Every intermediate accumulator value is identical between the two —
`reduce` isn't computing anything differently, it's just the same
fold, generalized so the combining step and starting value are
arguments instead of hardcoded loop internals.

## CS Lens

This is **fold** (also called **reduce** in many languages, including Python's own `functools.reduce`) — collapsing a sequence into a single value by repeatedly combining an accumulator with the next element. Building a dictionary one entry at a time from a sequence of matches is the same shape, just accumulating into a `dict` instead of a number — the accumulator's *type* doesn't change what pattern this is.

Also recognized in: JavaScript's `Array.prototype.reduce`, functional programming generally (fold is one of the most fundamental operations in that paradigm), and `sum()`/`max()`/`min()` — all specialized, pre-named versions of exactly this same general shape.

## SE Lens

Writing the loop out explicitly (as in the first version above) is often more readable to someone unfamiliar with `reduce`, especially once the combining logic is more than a one-line lambda. `reduce` earns its place when the accumulation logic is genuinely reusable as a named function, or when a codebase already leans functional-style throughout — using it doesn't make code do anything a plain loop couldn't; it names the pattern explicitly for a reader who already recognizes the name.

## Connection

Directly describes the general shape behind building a dict from a sequence of regex matches (see `python-regex-search-findall.md`/`python-iterators.md`) — that operation is a fold whose accumulator happens to be a `dict` instead of a number.

## Try It Yourself

1. Use `reduce` to find the maximum of a list without calling the built-in `max()` — `reduce(lambda acc, n: n if n > acc else acc, numbers)`. Confirm it matches `max(numbers)`.
2. Fold a list of strings into one dict counting how many times each string appears (a real, common "count occurrences" task) — accumulator starts as `{}`, and each step increments `acc.get(item, 0)`.
3. Try to write the dict-building example above as a single `reduce` call with a lambda, then compare its readability against the equivalent explicit `for` loop. Which would you rather encounter in a codebase you're new to, and why?
