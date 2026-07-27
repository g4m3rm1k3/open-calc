# Concept: Python `@dataclass`

**What you'll understand by the end:** what the `@dataclass` decorator generates for you automatically, and why `frozen=True` matters for a value that's meant to describe something rather than hold changing state.

**Prerequisites:** `python-classes-instances.md`, `python-decorators.md`.

## Setup

Python 3.7+, no packages needed (`dataclasses` is in the standard library).

## The Problem

A plain class meant only to bundle a few named values together (no real behavior, just data) still requires writing `__init__` by hand, and gets no `__eq__` (two instances with identical values compare unequal by default — Python compares object identity, not field values) and no readable `__repr__` (printing an instance shows something like `<__main__.Point object at 0x...>` instead of its actual values) unless those are written by hand too — a lot of repetitive boilerplate for something that is, conceptually, just a labeled bundle of values.

## The Isolated Example

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Point:
    x: int
    y: int

p1 = Point(1, 2)
p2 = Point(1, 2)
print(p1)
print(p1 == p2)
try:
    p1.x = 99
except Exception as e:
    print(type(e).__name__, e)
```

**Real output:**
```
Point(x=1, y=2)
True
FrozenInstanceError cannot assign to field 'x'
```

**What this proves:** `@dataclass` generated a real `__init__` (accepting `x` and `y` positionally), a real `__repr__` (`Point(x=1, y=2)`, not a memory address), and a real `__eq__` (`p1 == p2` is `True` for two separately-constructed instances with the same values) — none of which were written by hand. `frozen=True` additionally makes every field genuinely immutable after construction — the assignment attempt raises a real exception rather than silently succeeding.

## Mechanical Walkthrough

- `@dataclass(frozen=True)` is a **class decorator with an argument** — a reappearing construct from `python-decorators.md`, here configured rather than used bare (`@dataclass` alone would generate `__init__`/`__repr__`/`__eq__` but leave fields mutable).
- `x: int` and `y: int` are **type-annotated class-body declarations**, not assignments — there's no `x = int` value here; the annotation tells `@dataclass` what fields to generate `__init__` parameters for, and what to name them. This is the same annotation syntax SQLAlchemy's `Mapped[int]` builds on (`sqlalchemy-mapped-column-types.md`), applied here to a plain Python class instead of a database-mapped one.
- `Point(1, 2)` calls the generated `__init__`, positionally, in declaration order.
- `p1 == p2` invokes the generated `__eq__`, which compares every field's value — not `is`-identity (see `python-is-vs-equals.md`).
- `p1.x = 99` — a normal attribute assignment — is what `frozen=True` specifically intercepts and rejects, raising `FrozenInstanceError`.

## Execution Trace

Three real operations against two separately-constructed instances,
traced against the real output above:

```
p1 = Point(1, 2)  → generated __init__(self, x, y) runs → p1.x=1, p1.y=2
p2 = Point(1, 2)  → a second, separate instance → p2.x=1, p2.y=2

print(p1)
  → generated __repr__ runs → "Point(x=1, y=2)"

print(p1 == p2)
  → generated __eq__ runs → compares p1.x==p2.x (1==1 → True) and
    p1.y==p2.y (2==2 → True) → both True → overall True
  → printed: True

p1.x = 99
  → frozen=True's own __setattr__ override intercepts this assignment
    before it ever reaches p1's real storage
  → raises FrozenInstanceError("cannot assign to field 'x'")
  → caught by except Exception as e
  → printed: "FrozenInstanceError cannot assign to field 'x'"
```

`p1` and `p2` are two distinct objects in memory the entire time —
`p1 == p2` being `True` comes entirely from the generated `__eq__`
comparing their field *values*, never from them secretly being the same
object.

## CS Lens

This is a **value object** — a real, named idea in software design: an object defined entirely by the values it holds (two value objects with the same values are considered equal and interchangeable), as opposed to an **entity**, which has an identity that persists even if its values change (a `Tool` row keyed by `tool_number` is an entity; a plain coordinate pair is a value object). `frozen=True` is what actually enforces the "defined entirely by its values, nothing else can happen to it" part.

Also recognized in: Java's `record` (added specifically to reduce this exact boilerplate), Kotlin's `data class`, C#'s `record`, and immutable value types in functional languages generally.

## SE Lens

The alternative — a hand-written class with a manual `__init__`, `__repr__`, and `__eq__` — is more code to write, and more code that can silently drift out of sync (adding a new field to `__init__` but forgetting to add it to a hand-written `__eq__` is a real, easy-to-miss bug; `@dataclass` regenerates both from the same single source of truth, the field list, so they can't drift apart). The real cost: a `@dataclass` is still a real class underneath, so it's easy to assume more of Python's data-modeling toolbox (like fully custom validation logic) comes for free — it doesn't, beyond what's shown here, without writing more.

## Connection

Builds on `python-classes-instances.md` and `python-decorators.md`. Used in this project to describe each real field a tool's API request body may contain — a set of small, comparable value objects, not mutable state — with validation logic (`input-validation-at-boundary.md`, `python-isinstance.md`) iterating over them.

## Try It Yourself

1. Remove `frozen=True` and confirm `p1.x = 99` now succeeds silently — then print `p1` again to see the mutated value, and consider why that's dangerous for something meant to be a fixed description of a field's shape.
2. Add a third field, `label: str = "point"`, with a default value, and construct a `Point` without passing it — confirm the default is used.
3. Compare `p1 is p2` (identity) against `p1 == p2` (value equality) for two separately-constructed instances with the same values — confirm they differ, and explain why, referencing `python-is-vs-equals.md`.
