# Concept: `isinstance`

**What you'll understand by the end:** how to check a value's type at runtime, and why `isinstance` is generally preferred over comparing `type(x)` directly.

**Prerequisites:** none.

## Setup

Python 3, no packages needed.

## The Problem

Code sometimes needs to behave differently depending on what *kind* of value it's holding — a value that might be a single number, or might already be a list of numbers, for example — and needs a reliable way to ask "is this a list?" at the moment it matters.

## The Isolated Example

```python
class Animal:
    pass

class Dog(Animal):
    pass

fido = Dog()

print(isinstance(fido, Dog))
print(isinstance(fido, Animal))
print(type(fido) == Dog)
print(type(fido) == Animal)
```

**Real output:**
```
True
True
True
False
```

**What this proves:** `isinstance(fido, Animal)` is `True` even though `fido` is specifically a `Dog`, not literally an `Animal` — `isinstance` accounts for inheritance (a `Dog` *is* an `Animal`, per the `class Dog(Animal)` relationship). `type(fido) == Animal`, checking for an *exact* type match, is `False` — `fido`'s exact type is `Dog`, not `Animal`, even though it's related.

## Mechanical Walkthrough

- `isinstance(value, SomeType)` returns `True` if `value` is `SomeType` or any subclass of it.
- `isinstance` also accepts a tuple of types, checking "is it any one of these": `isinstance(value, (int, float))`.
- `type(value) == SomeType` only matches the *exact* type, ignoring the inheritance relationship entirely — a genuinely different, stricter check.

## Execution Trace

Four checks against the same real `fido = Dog()`:

```
isinstance(fido, Dog)
  → fido's actual type is Dog → matches directly → True

isinstance(fido, Animal)
  → fido's actual type is Dog, not Animal directly
  → isinstance walks Dog's inheritance chain: Dog → Animal
  → Animal found in that chain → True

type(fido) == Dog
  → type(fido) is exactly Dog → Dog == Dog → True

type(fido) == Animal
  → type(fido) is exactly Dog, not Animal
  → Dog == Animal → False (no inheritance walk — this is a direct
    equality check between two type objects)
```

The third and fourth checks both use `type(fido)`, which returns the
same exact value (`Dog`) both times — it's the comparison target
(`Dog` vs. `Animal`) that changes, not what `type()` itself returns.

## CS Lens

This is a **runtime type check** — asking a question about a value's type while the program is running, as opposed to a statically-typed language catching type mismatches before the program ever runs. `isinstance` specifically respects **polymorphism**: code written to accept "any `Animal`" correctly accepts a `Dog`, a `Cat`, or any other subclass, without needing to know about each one individually.

Also recognized in: any dynamically-typed language's runtime type-checking facility — JavaScript's `instanceof`, and the general need in duck-typed languages to occasionally confirm a value really is what code is about to assume it is.

## SE Lens

Using `isinstance` instead of `type(x) == SomeType` matters specifically because it respects inheritance — code written against a base class continues to work correctly for any future subclass, without modification, which is exactly what inheritance is for. Checking `type(x) == SomeType` breaks that promise silently: a new subclass would fail the check even though it's logically a valid `SomeType` for every practical purpose. The real-world justification for `isinstance` is almost never about a class hierarchy this deep, though — it's most often used, as in the earlier tokenizer example this file supports, to distinguish between fundamentally different shapes of data at a boundary (is this value a single number, or a list of them?), not to navigate a class tree at all.

## Connection

Commonly appears immediately after data crosses a real boundary — parsed JSON, a function's return value whose shape depends on some prior branch — exactly where `input-validation-at-boundary.md` also applies: confirming a value really is what the following code is about to assume before acting on that assumption.

## Try It Yourself

1. Check `isinstance(True, int)` (not `bool`) and explain the surprising-until-you-know-it result — in Python, `bool` is actually a subclass of `int`, so `isinstance` reports it as one.
2. Write a function that accepts one argument and returns `"a number"`, `"a list"`, or `"something else"` based on `isinstance` checks (`(int, float)`, then `list`), and call it with several different values to confirm each branch.
3. Build a small class hierarchy three levels deep (`Animal` → `Dog` → `Puppy`) and confirm `isinstance(some_puppy, Animal)` is `True` at every level, while `type(some_puppy) == Animal` is `False` — inheritance depth doesn't limit how far `isinstance` looks.
