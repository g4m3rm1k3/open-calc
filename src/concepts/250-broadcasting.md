---
concept: 250-broadcasting
name: Broadcasting (Julia)
---

## Definition

Broadcasting (the `.` dot syntax, as in `f.(array)` or `array .+ 1`)
applies a function or operator ELEMENT-WISE across an array (or multiple
arrays together) automatically, without writing an explicit loop —
Julia's uniform mechanism for vectorizing ANY function, not just a fixed
set of built-in array operations.

## Problem

Applying a function meant for a SINGLE value to EVERY element of an
array normally requires either an explicit loop, or the function being
specially written/overloaded to already understand arrays. Broadcasting
lets ANY ordinary, single-value function be applied element-wise across
an array automatically, just by adding a `.` — no special array-aware
version of the function needs to be written separately.

## Execution

An ORDINARY function, written for a SINGLE number, has no array-handling
logic at all
↓
Adding a `.` after the function name BROADCASTS it across an array,
applying it to EACH element individually
↓
Broadcasting also works for OPERATORS via `.+`, `.*`, etc. — a scalar
broadcasts against every element of an array
↓
Broadcasting TWO arrays together applies the operator ELEMENT-WISE,
position by position
↓
Broadcasting even handles MISMATCHED shapes via automatic "expansion"
(e.g., a single scalar broadcasts against every element of an array of
any size) — this general shape-reconciliation rule is what lets the SAME
`.` syntax work uniformly whether combining a scalar with an array, or
two same-shaped arrays together

## Computer Science

Broadcasting is implemented generically via Julia's `broadcast` function
and its own dispatch mechanism (see Multiple Dispatch) — it isn't a
special case hardcoded into the language for a fixed set of operations;
ANY function, including user-defined ones, automatically gains
element-wise "vectorized" behavior via the `.` syntax, with no extra work
required from the function's author.

Tags: Generic vectorization, No special-casing required, Dispatch-based implementation

## Software Engineering

Broadcasting is the idiomatic Julia alternative to explicit `for` loops
for elementwise array operations — it's typically both more concise AND
competitively fast (Julia's compiler can fuse multiple chained
broadcasts into a single efficient pass), which is why reaching for `.`
syntax is preferred over manual loops for straightforward elementwise
transformations.

Tags: Idiomatic vectorization, Loop fusion, Performance-competitive conciseness

## Common Mistakes

- Writing an explicit `for` loop to apply a function to every array element when broadcasting would express the exact same operation more concisely and just as efficiently.
- Forgetting the `.` when intending to broadcast — calling the function directly (without the dot) either errors (if it genuinely only accepts a single value) or does something entirely different than expected, rather than automatically vectorizing.

## Exercises

- Trace through what broadcasting an addition between two equal-length arrays computes position by position, and contrast it with what broadcasting a scalar addition does differently.
- Explain why broadcasting a function requires NO changes to how that function itself is written (it can stay a completely ordinary single-value function) for broadcasting to work.

## julia

```julia
f(x) = x^2 + 1

println(f.([1, 2, 3]))
println([1, 2, 3] .+ 10)
println([1, 2, 3] .+ [10, 20, 30])
```
Walkthrough: `f.([1, 2, 3])` applies the ordinary, single-value function
`f` to each element individually via broadcasting, producing `[2, 5,
10]` — `f` itself never needed to be rewritten to understand arrays.
`[1, 2, 3] .+ 10` broadcasts a scalar against every element, producing
`[11, 12, 13]`, while `[1, 2, 3] .+ [10, 20, 30]` broadcasts two
same-shaped arrays together position by position, producing `[11, 22,
33]`.
