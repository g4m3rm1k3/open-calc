---
concept: 251-vectorization-r
name: Vectorization (R)
---

## Definition

Vectorization in R means writing operations that work on ENTIRE vectors
at once — applying an operation element-wise across all values in a
vector directly, without an explicit loop — since R's most basic data
structure IS the vector (even a "single value" is technically a
length-1 vector), and its built-in operators are vectorized by default.

## Problem

Looping element-by-element over a vector in R is both more verbose AND
typically much SLOWER than R's built-in vectorized operations, since R's
interpreter has significant per-iteration overhead for explicit loops,
while vectorized operations are implemented in fast, compiled C code
under the hood. Writing vectorized code (operating on whole vectors
directly) is both more concise AND dramatically faster than the
equivalent explicit loop.

## Execution

A VECTOR of numbers is created (R has no true "scalar" — even a single
number is a length-1 vector)
↓
Adding a number to the vector adds it to EVERY element directly, no loop
needed
↓
Comparing the vector against a threshold produces a VECTOR of booleans,
one per element
↓
Using that boolean vector to FILTER the original — R's idiomatic way to
select elements matching a condition
↓
Adding TWO vectors together combines them element-wise, position by
position

## Computer Science

R's vectorized operators are implemented in compiled C code that loops
internally at NATIVE speed, entirely bypassing R's own (much slower)
interpreted loop overhead — this is conceptually similar to why NumPy
vectorized operations vastly outperform explicit Python loops, or why
Julia's broadcasting (see Broadcasting (Julia)) is preferred over manual
loops.

Tags: Compiled internal loops, Interpreter overhead avoidance, Cross-language pattern parallel (NumPy, Julia)

## Software Engineering

The idiomatic R style favors vectorized expressions over explicit `for`
loops for basically ALL elementwise data manipulation — reaching for a
loop where a vectorized expression would work is both a performance
anti-pattern and generally considered less "R-like," similar to
preferring comprehensions over loops in Python.

Tags: Idiomatic R style, Loop avoidance, Performance-driven convention

## Common Mistakes

- Writing an explicit `for` loop to apply an operation to every element of a vector when the SAME operation already works vectorized, directly on the whole vector — this is both slower and less idiomatic than the vectorized equivalent.
- Forgetting that comparing or filtering a vector produces ANOTHER VECTOR (of booleans, or of matching values), not a single yes/no answer — R's vectorized operations extend naturally to comparisons and filtering, not just arithmetic.

## Exercises

- Trace through what a boolean-indexed filter actually does in two steps: first, what the comparison produces, and second, how that boolean vector is used to select from the original.
- Explain why adding two vectors of the same length together in R combines them element-wise (position by position) rather than concatenating them into one longer vector.

## r

```r
x <- c(1, 2, 3, 4, 5)
print(x + 10)
print(x > 3)
print(x[x > 3])

y <- c(10, 20, 30, 40, 50)
print(x + y)
```
Walkthrough: `x + 10` adds `10` to every element without a loop,
producing `c(11, 12, 13, 14, 15)`. `x > 3` produces a boolean vector
marking which elements exceed `3`; using that boolean vector to index
`x` (`x[x > 3]`) filters it down to just `c(4, 5)`, R's idiomatic
filtering pattern. Adding `x` and `y` together combines them
element-wise by position, producing `c(11, 22, 33, 44, 55)`.
