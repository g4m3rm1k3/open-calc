# Concept: `typing.Protocol` — Structural Typing ("Matches the Shape," Not "Inherits From")

**What you'll understand by the end:** how `typing.Protocol` lets a
class satisfy an interface purely by having the right methods, with no
inheritance declared anywhere, why `@runtime_checkable` is a real,
necessary requirement (not decoration) for using `isinstance` against
one, and how this differs from every ordinary base-class interface.

**Prerequisites:** `python-isinstance.md`, `python-classes-instances.md`.

## Setup

Python 3.8+, no packages needed (`typing` is in the standard library).

## The Problem

An ordinary interface — a real base class with methods a subclass is
expected to override — requires every real implementer to explicitly
declare `class Robot(Greeter):`. That's fine when every implementer is
written with the interface already in mind. It's a genuine problem when
two classes were each written independently, already happen to have the
identical real method shape some new, shared code needs, and neither
one should have to be retroactively rewritten just to add an
inheritance declaration.

## The Isolated Example

```python
from typing import Protocol, runtime_checkable


@runtime_checkable
class Greeter(Protocol):
    def greet(self) -> str: ...


class Robot:
    def greet(self) -> str:
        return "beep boop hello"


class Toaster:
    def toast(self) -> str:
        return "ding"


r = Robot()
t = Toaster()

print("Robot isinstance Greeter:", isinstance(r, Greeter))
print("Toaster isinstance Greeter:", isinstance(t, Greeter))
print("Robot inherits from Greeter anywhere:", Greeter in type(r).__mro__)
```

**Real output, run this session:**
```
Robot isinstance Greeter: True
Toaster isinstance Greeter: False
Robot inherits from Greeter anywhere: False
```

**What this proves:** `Robot` genuinely passes `isinstance(r, Greeter)`
— real, `True` — despite `class Robot:` never mentioning `Greeter`
anywhere, and `Greeter` genuinely does **not** appear in `Robot`'s own
`__mro__` (its real inheritance chain). `isinstance` here isn't
checking ancestry at all — it's checking whether `Robot` happens to
have a real, callable `greet` method matching the Protocol's declared
shape. `Toaster`, which has no `greet` method (only an unrelated
`toast`), genuinely fails the same check.

The real, necessary role of `@runtime_checkable` — without it,
`isinstance` against a bare `Protocol` doesn't quietly fall back to
something else, it **raises**:

```python
class PlainProtocol(Protocol):
    def greet(self) -> str: ...


try:
    isinstance(r, PlainProtocol)
except TypeError as e:
    print(f"TypeError: {e}")
```

**Real output, run this session:**
```
TypeError: Instance and class checks can only be used with @runtime_checkable protocols
```

**What this proves:** a `Protocol` with no `@runtime_checkable`
decorator genuinely cannot be used with `isinstance` at all — a real
`TypeError`, not silent success or a static-only check. `@runtime_
checkable` is a real, required opt-in specifically for the case where a
Protocol needs to be checked at runtime, not purely by a static type
checker like mypy (which understands and checks structural typing
against *any* `Protocol`, decorated or not, without ever needing
`isinstance` at all).

## Mechanical Walkthrough

- `class Greeter(Protocol):` declares a **structural** interface — a
  named shape (here, "has a `greet()` method returning `str`"), not a
  real base class anything needs to inherit from.
- `def greet(self) -> str: ...` — the body is the real `Ellipsis`
  literal (`...`), a genuine, idiomatic "signature only, no
  implementation" stub (the identical real idea `stub-placeholder-
  pattern.md` covers, applied here specifically to a Protocol's own
  method declarations, which are never meant to be called directly —
  only checked against).
- `@runtime_checkable` makes `isinstance`/`issubclass` against this
  specific Protocol legal at all — real, structural matching happens
  at the moment the check runs, by inspecting whether the candidate
  object actually has every real method the Protocol declares.
- Neither `Robot` nor `Toaster` needed to import `Greeter`, subclass
  it, or know it exists — a real, genuine difference from every prior
  interface-like pattern based on explicit inheritance (`class
  MyWidget(QWidget):`), where the relationship has to be declared by
  the implementer, in advance, at the point the class is written.

## CS Lens

This is **structural typing** ("duck typing," made real and checkable)
— "if it has the right shape, it counts" — as opposed to **nominal
typing**, where a value's type is determined by its declared name/
ancestry (`class X(Base)`), regardless of what methods it happens to
have. Most of Python's own dynamic behavior is already, informally,
structural (`for x in thing` works on anything with `__iter__`, no
inheritance from any "Iterable" class required) — `Protocol` makes this
informal duck-typing pattern into a real, named, statically-checkable
(and, with `@runtime_checkable`, dynamically-checkable) contract.

Also recognized in: Go's interfaces (satisfied implicitly, purely by
having the right methods — no `implements` keyword exists in the
language at all); TypeScript's structural type system (an object type
is satisfied by shape, not by a declared class relationship); C++20
concepts (constraining a template parameter by what operations it
supports, not by inheritance).

## SE Lens

The real, practical payoff, demonstrated directly above: two classes
written completely independently — with no coordination, no shared
base class, no advance planning — both satisfy the same real interface
simply because they happen to already have the right shape. This
matters specifically when retrofitting a shared interface onto code
that already exists in more than one, independently-evolved form
(rather than designing the interface first and building every
implementer against it from scratch) — exactly the situation this
project's own real history reaches this mechanism from (two already-
working classes, given matching method shapes first, formalized into a
shared Protocol only once the duplication was real and confirmed, not
guessed at up front).

## Connection

Builds on `python-isinstance.md` and `python-classes-instances.md`.
Directly related to, but a real, different mechanism from, `stub-
placeholder-pattern.md` (a Protocol's `...` bodies are never meant to
run — they exist purely to declare a shape, unlike a stub, which is a
real, working, callable placeholder). This project's own real history
reaches for a `Protocol` at the exact moment `avoid-premature-
abstraction.md`'s own judgment call resolves in favor of extracting a
shared interface: two independent classes had already, concretely,
converged on the identical real method shapes before any formal
interface was declared — see `move-method-refactoring.md`'s sibling
Fowler-catalog citation for the companion refactoring (Replace
Conditional with Polymorphism) this new Protocol makes possible.

## Try It Yourself

1. Add a second method to `Greeter` (`def volume(self) -> int: ...`)
   and confirm `isinstance(r, Greeter)` now returns `False` — `Robot`
   no longer has every method the Protocol requires, direct, real proof
   that *every* declared method has to match, not just one.
2. Give `Toaster` a real `greet` method too (even a trivial one) and
   confirm `isinstance(t, Greeter)` now returns `True` — no code change
   to `Greeter` itself was needed, just the shape, once again, being
   what actually matters.
3. Try declaring `class Robot(Greeter):` explicitly (real, actual
   inheritance from the Protocol this time) and confirm `isinstance`
   still reports `True` — a `Protocol` can be inherited from directly
   too, it's just never *required*, unlike an ordinary base class.
