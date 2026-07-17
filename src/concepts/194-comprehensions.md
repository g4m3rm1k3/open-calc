---
concept: 194-comprehensions
name: Comprehensions (Python)
---

## Definition

A comprehension is a concise expression for building a new list, dict, or
set by transforming and/or filtering an existing iterable in a single
line — `[expr for item in iterable if condition]` — combining what would
otherwise be a multi-line loop with an accumulator into one readable
expression.

## Problem

Building a new collection by looping, conditionally transforming each
element, and appending to an accumulator list requires several lines of
boilerplate (initialize the list, loop, condition-check, append) for
what's conceptually a single transformation. A comprehension expresses
the SAME transformation in one concise, readable line, directly mirroring
how the resulting collection is actually described mathematically ("the
set of x squared, for x in range, where x is even").

## Execution

A manual loop initializes an empty list, iterates, conditionally
transforms, and appends
↓
The equivalent list comprehension produces the SAME result in one line
↓
Both produce the squares of even numbers from 0 to 9
↓
A dict comprehension uses the same `expr for item if condition` pattern
but builds key-value pairs instead of a flat list
↓
A set comprehension automatically deduplicates, since it builds a SET —
fewer output elements than input values if some produce the same result

## Computer Science

A comprehension is fundamentally equivalent to a combination of `map`
(transforming each element) and `filter` (keeping only matching
elements) — see Higher-Order Functions — expressed as a single, more
readable syntactic form rather than nested/chained function calls.

Tags: Map/filter equivalence, Declarative syntax, Set-builder notation

## Software Engineering

Comprehensions are considered more "Pythonic" than the equivalent manual
loop for straightforward transformations, since they communicate intent
(building a new collection FROM an existing one) more directly — but
nesting too many conditions or transformations into a single
comprehension can hurt readability, at which point a regular loop is the
clearer choice.

Tags: Pythonic idioms, Readability threshold, When to avoid comprehensions

## Common Mistakes

- Nesting a comprehension so deeply (multiple `for` clauses, multiple conditions) that it becomes harder to read than the equivalent explicit loop — comprehensions are a readability tool, and past a certain complexity, they work against their own purpose.
- Using a list comprehension purely for its SIDE EFFECTS instead of a plain `for` loop — this builds and immediately discards a list just to trigger calls inside it, which is misleading about intent; a `for` loop is the clearer choice when there's no actual collection being built.

## Exercises

- Rewrite a comprehension you consider hard to read as an equivalent multi-line `for` loop, and compare which one communicates intent more clearly.
- Trace through what a set comprehension over remainders mod 3 for the numbers 0 through 9 produces, and explain why the result has fewer than 10 elements despite iterating over 10 values.

## python

```python
# Manual loop
squares_loop = []
for x in range(10):
    if x % 2 == 0:
        squares_loop.append(x * x)

# Equivalent list comprehension
squares_comp = [x * x for x in range(10) if x % 2 == 0]

print(squares_loop)   # [0, 4, 16, 36, 64]
print(squares_comp)   # [0, 4, 16, 36, 64] -- identical result
print(squares_loop == squares_comp)   # True

# Dict comprehension
square_map = {x: x * x for x in range(5)}
print(square_map)   # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# Set comprehension -- automatically deduplicates
remainders = {x % 3 for x in range(10)}
print(sorted(remainders))   # [0, 1, 2] -- only the DISTINCT remainders, despite 10 input values
```
Walkthrough: `squares_loop` and `squares_comp` produce the exact same
list via two different syntaxes — the manual loop and the comprehension
are functionally identical, confirmed by `squares_loop == squares_comp`
being `True`. `square_map` demonstrates the same `expr for item if
condition` pattern building key-value pairs instead. `remainders`
demonstrates automatic deduplication: 10 input values (`0` through `9`)
collapse down to just 3 distinct remainders when built as a set.
