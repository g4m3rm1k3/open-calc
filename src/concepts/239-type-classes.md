---
concept: 239-type-classes
name: Type Classes (Haskell)
---

## Definition

A type class defines a set of functions that must be implemented for a
type to belong to it — Haskell's mechanism for ad-hoc polymorphism (like
`Show` for "can be converted to a String" or `Eq` for "can be compared
with =="), similar in spirit to interfaces/traits in other languages (see
Traits (Rust), Protocols (Swift)).

## Problem

Writing separate, differently-named functions for every type that needs
some common capability (comparing for equality, converting to a string)
would prevent generic code from working uniformly across types. A type
class defines that capability ONCE as a named contract, and any type can
be made an INSTANCE of it by implementing the required functions —
letting generic code work with "any type implementing this type class,"
not one specific concrete type.

## Execution

A type class definition declares ONE required function's signature, with
no implementation yet
↓
An `instance` block makes a specific type belong to that type class,
providing the actual implementation
↓
Calling the type class's function on a value of that type dispatches to
the INSTANCE's implementation for that specific type
↓
A GENERIC function constrained by that type class works for ANY type
that's an instance of it, not just the one originally shown — the
constraint in its type signature is what enables this

## Computer Science

Type classes achieve polymorphism resolved at COMPILE time via a hidden
"dictionary" of the required functions, passed implicitly wherever a
type-class-constrained function is called — this is conceptually similar
to how Rust's trait bounds and monomorphization work (see Traits
(Rust)), achieving flexible, generic code with (in most cases) no runtime
dispatch overhead.

Tags: Ad-hoc polymorphism, Compile-time dictionary passing, Type class constraints

## Software Engineering

Common built-in type classes (`Eq`, `Ord`, `Show`, `Num`) can often be
auto-derived (`deriving (Eq, Show)`) rather than hand-implemented, for
straightforward cases where the default, structural implementation
(e.g., comparing all fields for `Eq`) is exactly what's wanted — saving
the boilerplate of writing an explicit `instance` block.

Tags: Deriving type class instances, Reducing boilerplate, Standard type classes

## Common Mistakes

- Confusing a type class DEFINITION (the required function signatures) with an INSTANCE (the actual implementation for one specific type) — a type class alone provides no behavior; each `instance` block supplies the real logic for one type.
- Writing a function that needs a type-class capability without adding the appropriate CONSTRAINT to its type signature — without the constraint, the compiler won't allow calling type-class functions on the generic type parameter at all.

## Exercises

- Trace through what happens if the generic function below is called with a type that has NOT been made an instance of `Describable` — what specific compiler error occurs?
- Explain the difference between Haskell's type classes and a language's INHERITANCE hierarchy — why is a type class more like an "interface a type can adopt" than a "parent class a type extends"?

## haskell

```haskell
class Describable a where
  describe :: a -> String

data Animal = Dog | Cat

instance Describable Animal where
  describe Dog = "a dog"
  describe Cat = "a cat"

announce :: Describable a => a -> String
announce x = "Behold: " ++ describe x

main :: IO ()
main = do
  putStrLn (announce Dog)
  putStrLn (announce Cat)
```
Walkthrough: `announce` is written generically against the `Describable`
constraint, with no knowledge of `Animal` specifically — calling it with
`Dog` and `Cat` both work, each dispatching to `Animal`'s `Describable`
instance to produce the underlying description, then wrapping it with
"Behold: " — printing "Behold: a dog" and "Behold: a cat".
