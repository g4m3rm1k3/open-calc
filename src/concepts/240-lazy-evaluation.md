---
concept: 240-lazy-evaluation
name: Lazy Evaluation (Haskell)
---

## Definition

Haskell evaluates expressions LAZILY by default — a value isn't actually
computed until its result is genuinely NEEDED, letting code define
infinite data structures or avoid wasted computation on values that end
up unused, in ways strict (eager) languages generally can't.

## Problem

In a strictly-evaluated language, EVERY expression is computed as soon
as it's bound, even if the result is never actually used — this makes
truly infinite data structures (an infinite list of natural numbers)
impossible to even define, since eager evaluation would try to compute
the WHOLE thing immediately and never finish. Lazy evaluation defers
computation until a value's result is actually demanded, making infinite
structures representable (you just never ask for "all of it" — only as
much as you need).

## Execution

An INFINITE list of natural numbers doesn't hang or error when defined,
since NOTHING is computed yet — just a DESCRIPTION of how to produce more
elements on demand
↓
Asking for the first 5 elements computes ONLY those 5, on demand, and
stops
↓
A binding whose value is never actually USED is never evaluated at all —
laziness means unused bindings cost nothing
↓
Filtering an INFINITE list for even numbers, then taking just 3,
terminates fine — only as much of the infinite list as needed to find 3
even numbers is ever actually evaluated

## Computer Science

Haskell's laziness is implemented via "thunks" — an unevaluated
expression is represented as a suspended computation, only forced
(actually run) the first time its result is genuinely demanded, and then
the computed result is CACHED for any subsequent access (so a value is
computed AT MOST once, no matter how many times it's referenced).

Tags: Thunks, Suspended computation, Memoized forcing

## Software Engineering

Laziness has real, sometimes surprising performance implications —
building up a long chain of unevaluated thunks without ever forcing them
(a classic Haskell beginner pitfall called a "space leak") can consume
far more memory than a strict language's immediate evaluation would,
since Haskell keeps the entire chain of suspended computations around
until something finally forces it.

Tags: Space leaks, Thunk buildup, Strictness annotations (as a fix)

## Common Mistakes

- Assuming an expression bound to a name has already been "computed" the moment it's bound — in Haskell, it's only a thunk until actually demanded, which can be surprising when reasoning about WHEN side-effecting or expensive code actually runs.
- Building up long chains of lazy, unevaluated arithmetic (e.g., accumulating a sum lazily in a large loop) without forcing intermediate results — this can cause a space leak, since the ENTIRE unevaluated expression chain is kept in memory until finally forced at the very end.

## Exercises

- Trace through what taking the first 5 elements of the infinite list below actually computes, step by step, and explain why the infinite list itself never causes a hang or an out-of-memory error on its own.
- Explain why binding a name to an expensive, unused computation never actually runs that computation — what would need to change to force it to run?

## haskell

```haskell
naturals :: [Integer]
naturals = [1..]

main :: IO ()
main = do
  print (take 5 naturals)
  print (take 3 (filter even naturals))
```
Walkthrough: `naturals` is an infinite list, but defining it causes no
hang, since nothing is computed until demanded. `take 5 naturals`
computes exactly the first 5 elements on demand, printing `[1,2,3,4,5]`.
`take 3 (filter even naturals)` evaluates just enough of the infinite
list to find 3 even numbers, printing `[2,4,6]`, without ever attempting
to evaluate the list's later, unneeded elements.
