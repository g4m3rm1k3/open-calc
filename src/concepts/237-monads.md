---
concept: 237-monads
name: Monads (Haskell)
---

## Definition

A Monad is a type class describing types that support CHAINING
computations that each produce a wrapped value, using `>>=` (bind) to
sequence them — letting side-effect-like behavior (I/O, failure, state)
be threaded through a sequence of operations while keeping the language
itself purely functional.

## Problem

Purely functional code has no built-in way to sequence operations that
depend on each other's "context" (a computation that might fail, one
that produces output, one with hidden state) without threading that
context through manually at every single step. The Monad type class
provides a STANDARD interface (`>>=` and `return`) for exactly this
"chain computations, propagating some shared context automatically"
pattern, reused across many different contexts (`Maybe` for possible
failure, `IO` for side effects, lists for multiple results).

## Execution

A function returns a `Maybe Int`, WRAPPING the result (or `Nothing` on
failure)
↓
`>>=` (bind) UNWRAPS a `Just` value, applies the next function, producing
a new wrapped result
↓
If the LEFT side is already `Nothing`, `>>=` short-circuits — the
function is NEVER even called, and the result is `Nothing`
↓
CHAINING multiple `Maybe`-returning operations: if ANY step produces
`Nothing`, the REST of the chain is automatically skipped, propagating
the failure without manual checking at every step

## Computer Science

The Monad type class requires exactly two operations, `return` (wrap a
plain value into the monadic context) and `>>=` (chain a wrapped value
into a function that produces another wrapped value) — different Monad
INSTANCES (`Maybe`, `IO`, `[]`) implement these two operations
differently, but any code written generically against the Monad
interface works uniformly across all of them.

Tags: Type class, Bind operator, Uniform chaining interface

## Software Engineering

`do`-notation is syntactic sugar that makes monadic chains READ like
ordinary imperative, sequential code even though it desugars directly
into nested `>>=` calls — this is what makes Haskell's I/O code (using
the `IO` monad) look approachable despite the underlying
purely-functional machinery.

Tags: do-notation, Syntactic sugar, IO monad readability

## Common Mistakes

- Assuming Monads are ONLY about I/O or side effects — the SAME chaining pattern (`Maybe` for optional/failure, lists for multiple results) applies to many different contexts that have nothing to do with I/O; `IO` is just one specific, commonly-discussed Monad instance among several.
- Trying to "escape" a monadic value (like extracting an `Int` directly out of a `Maybe Int` without handling the `Nothing` case) — the whole point of the Monad interface is that you chain WITHIN the wrapped context using `>>=`/`do`-notation, rather than unwrapping early and losing the safety it provides.

## Exercises

- Trace through what the three-step chain below evaluates to, step by step, and explain exactly WHERE the chain short-circuits.
- Explain why `Nothing >>= someFunction` never actually CALLS `someFunction`, regardless of what it does.

## haskell

```haskell
safeDivide :: Int -> Int -> Maybe Int
safeDivide _ 0 = Nothing
safeDivide a b = Just (a `div` b)

main :: IO ()
main = do
  print (Just 10 >>= \x -> safeDivide x 2)
  print (Nothing >>= \x -> safeDivide x 2)
  print (Just 10 >>= \x -> safeDivide x 0 >>= \y -> safeDivide y 2)
```
Walkthrough: `Just 10 >>= \x -> safeDivide x 2` unwraps `10`, computes
`safeDivide 10 2`, producing `Just 5`. `Nothing >>= ...` short-circuits
immediately — the function is never called — producing `Nothing`. The
final chain divides by `0` at the SECOND step, producing `Nothing` right
there, which then short-circuits the THIRD step entirely — the whole
chain evaluates to `Nothing` without ever calling `safeDivide y 2`.
