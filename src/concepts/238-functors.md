---
concept: 238-functors
name: Functors (Haskell)
---

## Definition

A Functor is a type class for types that can be MAPPED OVER — `fmap`
applies a function to the value(s) INSIDE a wrapped/contextual structure
(`Maybe`, a list, `IO`), producing a new wrapped structure with the
function applied, WITHOUT needing to unwrap the value manually first.

## Problem

A value wrapped in some context (`Maybe Int`, `[Int]`, `IO Int`) can't
have an ordinary function applied to it directly, since the function
expects a plain `Int`, not a wrapped one — manually unwrapping, applying,
and re-wrapping at every step is repetitive. `fmap` (and its operator
alias `<$>`) does this unwrap-apply-rewrap pattern generically, for ANY
type that implements the Functor type class.

## Execution

Applying `fmap` with a function to a `Just` value applies that function
to the value INSIDE, producing a new `Just`, WITHOUT needing to manually
pattern-match and unwrap
↓
Applying `fmap` to `Nothing` — there's NOTHING inside to apply the
function to — `fmap` just returns `Nothing` unchanged, the function is
never even called
↓
Lists are ALSO Functors — `fmap` here is exactly equivalent to `map`,
applying the function to EVERY element
↓
`<$>` is the SAME operation as `fmap`, used as an infix operator alias
instead

## Computer Science

Every Monad (see Monads) is ALSO required to be a Functor (this is a
formal law of the type class hierarchy) — `fmap` is strictly LESS
powerful than `>>=`, since `fmap` can only apply an ORDINARY function
(`a -> b`) to a wrapped value, while `>>=` can chain a function that
ITSELF returns a NEW wrapped value (`a -> f b`), letting the
wrapping/context be threaded and potentially change between steps.

Tags: Type class hierarchy, fmap vs bind, Functor as a Monad prerequisite

## Software Engineering

Reaching for `fmap`/`<$>` when you just need to TRANSFORM a value inside
a context (without needing to sequence multiple wrapped operations) is
simpler and more directly expresses intent than reaching for the full
Monad machinery (`>>=`/`do`-notation) when it isn't actually needed.

Tags: Choosing the right abstraction level, fmap for simple transforms, Not over-reaching for Monad

## Common Mistakes

- Manually pattern-matching to unwrap a `Maybe`/list just to apply a simple function and rewrap it — `fmap` does exactly this generically, for any Functor, without needing to write that unwrap/rewrap logic by hand each time.
- Assuming `fmap` calls the function even on an "empty" context like `Nothing` or `[]` — it correctly does NOTHING in those cases, since there's no actual value present to apply the function to.

## Exercises

- Trace through what `fmap (*2) []` (an empty list) produces, and explain why, given there's nothing to actually map over.
- Explain the specific difference between `fmap`'s type signature (`(a -> b) -> f a -> f b`) and `>>=`'s type signature (`m a -> (a -> m b) -> m b`) — what capability does `>>=` have that `fmap` doesn't?

## haskell

```haskell
main :: IO ()
main = do
  print (fmap (+1) (Just 5))
  print (fmap (+1) (Nothing :: Maybe Int))
  print (fmap (*2) [1, 2, 3])
  print ((+1) <$> Just 5)
```
Walkthrough: `fmap (+1) (Just 5)` produces `Just 6`, applying the
function to the value inside without any manual unwrapping. `fmap (+1)
Nothing` produces `Nothing` unchanged, since there's no value to apply
the function to. `fmap (*2) [1, 2, 3]` behaves exactly like `map`,
producing `[2,4,6]`. The final line confirms `<$>` and `fmap` produce
identical results (`Just 6`), since `<$>` is just `fmap` used infix.
