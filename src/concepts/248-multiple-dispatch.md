---
concept: 248-multiple-dispatch
name: Multiple Dispatch (Julia)
---

## Definition

Multiple dispatch selects WHICH method implementation to call based on
the RUNTIME TYPES of ALL of a function's arguments (not just the
first/receiver, as in single-dispatch object-oriented languages) —
Julia's core organizing principle, where a single function name can have
many specialized implementations, each chosen based on the full
combination of argument types.

## Problem

Single dispatch (Java, Python, most OOP languages) only chooses a method
based on ONE object's type (the "receiver" the method is called ON) —
expressing an operation that genuinely depends on the types of TWO or
more arguments together (like how a collision behaves differently for
circle-vs-circle, circle-vs-square, square-vs-square) requires awkward
workarounds (double-dispatch patterns, type-checking inside a single
method). Multiple dispatch selects the right implementation based on ALL
argument types simultaneously, directly expressing this naturally.

## Execution

THREE separate METHODS are defined for the SAME function name, each
specialized for a different COMBINATION of argument types
↓
Calling the function with two arguments of one type combination selects
the method matching THAT specific combination
↓
Calling it with a DIFFERENT combination of types selects a DIFFERENT
method entirely
↓
Adding a NEW type later just means defining NEW methods for the new
combinations involving it — the EXISTING methods for the original types
never need to be touched or reorganized

## Computer Science

Multiple dispatch generalizes single-dispatch object-oriented method
calls (which only consider ONE argument's type — the receiver) to
consider ALL arguments' types together when selecting which specialized
implementation ("method") to run — Julia resolves this either at compile
time (when types are known statically) or at the first call with a new
combination of runtime types (via JIT compilation), making it both
flexible and fast.

Tags: Generalizes single dispatch, Runtime type-based selection, JIT specialization

## Software Engineering

Multiple dispatch is WHY Julia code tends to define many small,
narrowly-typed methods sharing one function name, rather than one large
method with internal type-checking branches — this style makes it easy
to EXTEND existing functions with new type combinations later (even from
a completely separate package), without ever modifying the original
code.

Tags: Small specialized methods, Extensibility across packages, No internal type-branching

## Common Mistakes

- Writing ONE method with internal type-checking branches instead of separate, specialized methods per type combination — this works against Julia's whole design, losing the extensibility and dispatch-table performance benefits multiple dispatch provides.
- Assuming multiple dispatch is the same as function overloading in languages like Java/C++ — Julia's dispatch happens based on RUNTIME types (dynamically), not just resolved at compile time from STATIC argument types, which matters for genuinely dynamic/generic code.

## Exercises

- Trace through which specific method gets called when the argument order is swapped compared to the examples below — does argument ORDER matter for which method is selected?
- Explain why adding a brand-new type and its corresponding methods LATER, in a completely separate file or package, doesn't require modifying any of the original method definitions.

## julia

```julia
struct Circle end
struct Square end

collide(a::Circle, b::Circle) = "two circles bounce"
collide(a::Circle, b::Square) = "circle bounces off square"
collide(a::Square, b::Circle) = "square bounces off circle"
collide(a::Square, b::Square) = "two squares collide"

println(collide(Circle(), Circle()))
println(collide(Circle(), Square()))
println(collide(Square(), Circle()))
```
Walkthrough: `collide`'s SPECIFIC method is selected based on BOTH
arguments' types together — `Circle(), Circle()` and `Circle(), Square()`
dispatch to genuinely different implementations, and swapping the
argument order to `Square(), Circle()` selects yet a THIRD distinct
method, since Julia treats `collide(a::Circle, b::Square)` and
`collide(a::Square, b::Circle)` as entirely separate method definitions,
demonstrating that argument order matters for which combination is
matched.
