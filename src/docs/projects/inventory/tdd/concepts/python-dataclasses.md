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

- p1 = Point(1, 2)  → generated __init__(self, x, y) runs → p1.x=1, p1.y=2
- p2 = Point(1, 2)  → a second, separate instance → p2.x=1, p2.y=2

- print(p1)
  → generated __repr__ runs → "Point(x=1, y=2)"

- print(p1 == p2)
  → generated __eq__ runs → compares p1.x==p2.x (1==1 → True) and
    p1.y==p2.y (2==2 → True) → both True → overall True
  → printed: True

- p1.x = 99
  → frozen=True's own __setattr__ override intercepts this assignment
    before it ever reaches p1's real storage
  → raises FrozenInstanceError("cannot assign to field 'x'")
  → caught by except Exception as e
  → printed: "FrozenInstanceError cannot assign to field 'x'"

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

## A Second Real Facet: Mutable Defaults and `field(default_factory=...)`

`Point`'s fields above are simple, immutable values (`int`). A real,
different — and genuinely dangerous — situation arises when a field's
type is itself **mutable**, like a `list`:

```python
from dataclasses import dataclass, field

# The real trap -- a bare mutable default is REJECTED outright:
try:
    @dataclass
    class TrapBasket:
        items: list = []
except ValueError as e:
    print(f"ValueError: {e}")


# The real, correct fix:
@dataclass
class Basket:
    items: list = field(default_factory=list)


b1 = Basket()
b2 = Basket()
b1.items.append("apple")

print("b1.items:", b1.items)
print("b2.items:", b2.items)
print("are b1.items and b2.items the SAME list object?", b1.items is b2.items)
```

**Real output, run this session:**
```
ValueError: mutable default <class 'list'> for field items is not allowed: use default_factory
b1.items: ['apple']
b2.items: []
are b1.items and b2.items the SAME list object? False
```

**What this proves:** attempting `items: list = []` directly didn't
silently misbehave — `@dataclass` **refuses to even define the class**,
raising a real `ValueError` immediately. Using `field(default_factory=
list)` instead — calling `list()` fresh for every new instance, rather
than sharing one literal `[]` written once at class-definition time —
fixed it: `b1.items` and `b2.items` are two genuinely separate list
objects (`is` → `False`), so appending to one leaves the other
untouched.

**Why this matters, shown by contrast** — the same real trap on a
plain function, which has **no** such protection:

```python
def make_basket(items=[]):
    return items


f1 = make_basket()
f2 = make_basket()
f1.append("apple")
print("f1:", f1)
print("f2 (should be empty, but isn't):", f2)
print("are f1 and f2 the SAME list object?", f1 is f2)
```

**Real output, run this session:**
```
f1: ['apple']
f2 (should be empty, but isn't): ['apple']
are f1 and f2 the SAME list object? True
```

**What this proves:** a plain function's default argument (`items=[]`)
is evaluated **once**, at function-definition time, and that *same*
list object is reused as the default for every call that doesn't pass
its own — `f1` and `f2` share the identical real list (`is` → `True`),
so mutating one silently corrupts the other, with no error anywhere.
`@dataclass`'s own `ValueError` is a real, deliberate safety net this
plain-function version doesn't have — it catches the identical
underlying mistake *before* it can ever cause the silent aliasing bug
shown here.

### Try It Yourself (second facet)

1. Change `Basket`'s field to a `dict` (`field(default_factory=dict)`)
   and confirm the identical real protection and fix apply — the trap
   and its solution aren't `list`-specific.
2. Explain, in your own words, why `@dataclass` can detect and reject
   the mutable-default mistake at class-definition time while a plain
   function (`make_basket` above) cannot — what does `@dataclass`
   actually inspect that a plain `def` doesn't?
3. Connect this directly to `mutable-object-aliasing.md` — write one
   sentence stating exactly which of that file's own "does mutating
   this affect something else" scenarios this trap is a real, concrete
   instance of.

## A Third Real Facet: A Plain (Non-Frozen) Dataclass Isn't Hashable

`@dataclass` (without `frozen=True`) generates a real `__eq__` —
but that comes with a real, easy-to-miss consequence: the instance
can no longer go in a `set` or be used as a dict key at all.

```python
@dataclass
class WaitCode:
    line_index: int
    value: str | None


a = WaitCode(5, "100")
b = WaitCode(5, "100")

print("a == b (auto-generated __eq__):", a == b)

try:
    used = {a, b}
    print("went into a set:", used)
except TypeError as e:
    print(f"TypeError: {e}")

used_ids = {id(a)}
print("id(a) in used_ids:", id(a) in used_ids)
print("id(b) in used_ids (a different real object):", id(b) in used_ids)


@dataclass(frozen=True)
class FrozenWaitCode:
    line_index: int
    value: str | None


fa = FrozenWaitCode(5, "100")
fb = FrozenWaitCode(5, "100")
print("frozen instances CAN go in a set:", {fa, fb})
```

**Real output, run this session:**
```
a == b (auto-generated __eq__): True
TypeError: cannot use 'WaitCode' as a set element (unhashable type: 'WaitCode')
id(a) in used_ids: True
id(b) in used_ids (a different real object): False
frozen instances CAN go in a set: {FrozenWaitCode(line_index=5, value='100')}
```

**What this proves:** `a == b` correctly reports `True` — the
generated `__eq__` compares field values, exactly as this file's own
first facet established. But putting `a` into a real `set` genuinely
**raises** `TypeError` — Python explicitly sets `__hash__ = None` on
any class that defines a custom `__eq__` without also defining
`__hash__`, which `@dataclass` does automatically unless `frozen=True`
is given. `id(a)` — each live object's own, real, unique identity
integer — works as a real, idiomatic workaround for tracking "have I
already seen this specific object" without needing the object itself
to be hashable. The frozen version, by contrast, genuinely **is**
hashable (`@dataclass(frozen=True)` generates a real `__hash__` too,
consistent with its own fields being immutable).

**Mechanical note:** this is a real, deliberate Python safety rule, not
an oversight — a mutable object's hash would need to stay constant for
correct `set`/`dict` behavior, but a mutable object's fields (and
therefore what `__eq__` compares) can change after insertion, which
would silently break the set/dict's own internal structure; Python
refuses to let that happen by making a custom-`__eq__`-but-mutable
class simply unhashable.

### Try It Yourself (third facet)

1. Add `eq=False` to `@dataclass` (keeping it non-frozen) and confirm
   the resulting class **is** hashable again — real, direct proof the
   restriction is specifically about the *combination* of a custom
   `__eq__` and mutability, not mutability alone.
2. Try tracking "already seen" objects using a real `list` and `in`
   instead of `id()` in a set — confirm it works but reasoning about
   the real, `O(n)` performance cost per check versus a set's `O(1)`
   average case (`python-set-membership-testing.md`).
3. Explain, in your own words, why using `id(a)` rather than `a`
   itself in the tracking set is safe even though `WaitCode` isn't
   hashable — what real, different thing is actually being stored?

**A real, direct bookend, worth stating explicitly:** not every plain
class loses hashability this way — only ones that get a **custom**
`__eq__`. A class that never defines `__eq__` at all keeps Python's
*default* `__hash__`, based on identity (`id()`), unchanged:

```python
class PlainWidget:
    def __init__(self, name):
        self.name = name


print("PlainWidget defines its own __eq__:", "__eq__" in PlainWidget.__dict__)

w1 = PlainWidget("editor A")
w2 = PlainWidget("editor A")
print("w1 == w2 (default __eq__, identity-based):", w1 == w2)
print("hash(w1) works:", isinstance(hash(w1), int))
print("{w1, w2} works as a real set:", len({w1, w2}))
```

**Real output, run this session:**
```
PlainWidget defines its own __eq__: False
w1 == w2 (default __eq__, identity-based): False
hash(w1) works: True
{w1, w2} works as a real set: 2
```

**What this proves:** `PlainWidget` never defines `__eq__` at all, so
`w1 == w2` uses Python's own **default** `__eq__` — identity comparison
(`is`), correctly reporting `False` even though the two instances hold
identical `name` values, because they're genuinely two separate
objects. Because `__eq__` was never overridden, `__hash__` was never
set to `None` either — `PlainWidget` stays hashable, and `{w1, w2}`
correctly holds **two** real entries (not deduplicated to one, since
`w1 != w2`).

**The rule stated plainly:** Python only sets `__hash__ = None`
specifically when a class defines a **custom** `__eq__` without also
defining a custom `__hash__` — a plain `@dataclass` (this file's own
third facet) does exactly that automatically; a hand-written class
that never touches `__eq__` at all is never affected, and keeps its
default, identity-based hashability throughout. The identical real rule
produces two opposite real outcomes for two different kinds of class in
the same codebase, each for a concrete, checkable reason: a `WaitCode`-
style plain dataclass loses hashability because `@dataclass` generated
a value-based `__eq__`; a plain widget class that never defines `__eq__`
never loses anything, because nothing ever touched the default.

### Try It Yourself (bookend)

1. Add a custom `__eq__` to `PlainWidget` by hand (comparing `.name`,
   without also defining `__hash__`) and confirm it now behaves exactly
   like `WaitCode` — unhashable, a real `TypeError` going into a `set`
   — direct, real proof the rule is about defining `__eq__` at all, not
   about `@dataclass` specifically.
2. Add a custom `__hash__` alongside that same custom `__eq__` (hashing
   `.name`) and confirm hashability returns — but now watch for a
   *different*, real danger: create two `PlainWidget`s with the same
   name, put one in a set, then mutate its `.name` — does the set still
   find it by membership afterward? Connect your answer back to this
   file's own third facet on why *mutable* fields and custom hashing
   are a genuinely risky combination.
3. Explain, in your own words, why a `QWidget`-based class in a real
   GUI toolkit is specifically the kind of class that should almost
   never define a custom `__eq__` at all — what real, practical use
   does "two widgets are equal if they show the same text" have,
   compared to "this is literally the same on-screen widget as that
   one" (identity)?

## A Fourth Real Facet: `dataclasses.replace` — a Modified Copy, One Field at a Time

A **frozen** dataclass (this file's own opening facet) can never be
mutated in place — there is no real way to just change one field on an
existing instance. `dataclasses.replace` is the standard-library
answer: it builds a **new** instance, copying every field from the
original except the ones explicitly overridden.

```python
from dataclasses import dataclass, replace


@dataclass(frozen=True)
class Tool:
    id: int
    diameter: float
    external_id: bytes


original = Tool(id=1, diameter=6.0, external_id=b"abc123")
reimported = replace(original, id=99, diameter=6.35)

print("original:", original)
print("reimported:", reimported)
print("original unchanged:", original)
```

**Real output, run this session:**
```
original: Tool(id=1, diameter=6.0, external_id=b'abc123')
reimported: Tool(id=99, diameter=6.35, external_id=b'abc123')
original unchanged: Tool(id=1, diameter=6.0, external_id=b'abc123')
```

**What this proves:** `reimported` genuinely has the two real fields
that were explicitly passed to `replace` changed (`id`, `diameter`) —
while `external_id`, never mentioned in the `replace` call at all, was
carried over from `original` completely unchanged. `original` itself
is provably untouched afterward — printing it a second time shows the
identical real values it started with, confirming `replace` never
mutates its input, only reads from it to build something new.

**Mechanical note:** `replace` works by re-calling the dataclass's own
`__init__` with a merged set of arguments — every field from the
original instance, overridden by whatever keyword arguments were
explicitly passed to `replace` itself. This is exactly why it's the
standard, correct tool for a **frozen** dataclass specifically:
direct attribute mutation (`original.id = 99`) is actively forbidden
and raises a real error, but building an entirely new, independent
instance that happens to share most of the old one's data is always
allowed, since nothing about immutability restricts *construction*.

### Try It Yourself (fourth facet)

1. Call `replace(original)` with **no** keyword overrides at all, and
   confirm it produces a real, genuinely separate object (`is` reports
   `False`) that nonetheless compares equal (`==` reports `True`) to
   `original` — direct proof of this file's own opening facet: value
   equality, not identity, is what `==` checks for a dataclass.
2. Try `replace(original, made_up_field=5)`, passing a keyword that
   isn't a real field on `Tool` at all, and read the resulting error —
   confirming `replace` validates its overrides against the dataclass's
   own real fields, the same way constructing one directly would.
3. Write a small function, `reimport(existing, freshly_parsed)`, that
   uses `replace` to update every field from `freshly_parsed` onto
   `existing` **except** `id` — reasoning about why keeping the
   original local `id` while accepting every other freshly-imported
   value is exactly the shape a real "re-import from an external
   source without creating a duplicate" operation needs.
