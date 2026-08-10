# Concept: The Mutable Default Argument Gotcha, and the `None`-Sentinel Fix

**What you'll understand by the end:** why a mutable value (a list, a
dict) used directly as a function parameter's default is a real,
classic Python trap — the same default object gets silently **shared**
across every call that doesn't override it — and the standard, safe
idiom that avoids it: default to `None`, then substitute the real
value inside the function body.

**Prerequisites:** `python-function-type-hints.md`.

## Setup

Python 3, no packages needed.

## The Problem

A function parameter sometimes has a sensible default that's a real,
mutable container — an empty list to accumulate into, a dict of
lookup values most callers want unchanged. Writing that container
directly as the default value (`def f(basket=[])`) looks completely
reasonable, and Python allows it with no error or warning — but it
hides a real, easy-to-miss fact: default values are evaluated **once**,
when the function is *defined*, not fresh on every call.

## The Isolated Example

```python
def add_item(item, basket=[]):
    basket.append(item)
    return basket


print(add_item("apple"))
print(add_item("banana"))
```

**Real output, run this session:**
```
['apple']
['apple', 'banana']
```

**What this proves:** the second call, `add_item("banana")`, genuinely
started from `['apple']`, not a fresh empty list — `"banana"`'s own
call never mentioned `"apple"` at all, yet it shows up anyway. `[]` in
the function's own signature was created exactly **once**, at
definition time, and every call that doesn't pass its own `basket`
argument reuses that identical, real list object — `append` on one
call's "default" basket is visible to the next call's "default"
basket too, because they're not two different lists, they're the
same one.

The fix — default to `None`, and build the real container fresh
inside the function body:

```python
def add_item_fixed(item, basket=None):
    if basket is None:
        basket = []
    basket.append(item)
    return basket


print(add_item_fixed("apple"))
print(add_item_fixed("banana"))
```

**Real output, run this session:**
```
['apple']
['banana']
```

**What this proves:** with the default changed to `None`, each call
that omits `basket` now genuinely gets its own, fresh, empty list —
`add_item_fixed("banana")` correctly starts clean, with no memory of
the previous call's `"apple"`.

## Mechanical Walkthrough

- A `def` statement's own default-value expressions run **once**,
  immediately when Python processes the `def` — not once per call.
  For an immutable default (`count=0`, `name=""`), this distinction is
  invisible, since immutable values can't be mutated in place anyway.
- For a **mutable** default (`basket=[]`), every call that doesn't
  supply its own argument receives the exact same object, by
  reference — any in-place mutation (`.append(...)`, `.update(...)`)
  persists and is visible on the **next** such call too.
- `basket=None` sidesteps this entirely: `None` is immutable, so
  there's nothing to accidentally share. The real, fresh container
  gets created **inside the function body**, via `if basket is None:
  basket = []` — a brand-new object, every single call.
- This idiom generalizes past empty containers: any parameter whose
  sensible default is a mutable object — or, as in a real, related
  case, a specific *named* value that the function wants to resolve
  explicitly inside its own body rather than bake directly into the
  signature — commonly uses the identical `None`-then-substitute shape.

## CS Lens

This is a real instance of Python's own **default-argument binding
time**: defaults are bound to the function object itself at definition
time, not re-evaluated per call — a real, deliberate language design
choice (it makes defaults cheap to reuse when they genuinely are
immutable) that becomes a trap the moment a default is mutable and
gets mutated. The general shape — "a value that looks freshly
initialized is secretly one shared, persistent object" — is the same
underlying idea `mutable-object-aliasing.md` names more generally,
applied here specifically to the moment a function is *defined*
rather than to ordinary variable assignment.

Also recognized in: JavaScript has no equivalent trap for default
parameters (`function f(basket = [])` genuinely creates a fresh array
per call) — a real, worth-knowing point of *divergence* between the
two languages' otherwise similar default-parameter syntax, not a
universal gotcha; Python's own class-body mutable defaults (a mutable
class attribute shared across every instance unless explicitly
reassigned per-instance) is a close structural cousin of the identical
underlying "one object, silently shared" shape.

## SE Lens

The real, practical discipline this teaches: treat a mutable value as
a default argument as a real, standing question — "will this object
ever be mutated by the function, and if so, do I actually want that
mutation to persist and leak into the *next* call that also uses the
default?" — rather than an automatic red flag. When the answer is
"yes, and that's a bug," `None`-then-substitute is the standard,
idiomatic fix, common enough in real Python code that many linters
(`ruff` among them) flag a literal mutable default automatically.

## Connection

Builds on `mutable-object-aliasing.md`'s general warning about shared
mutable references, applied specifically to function-default binding
time. Distinct from, but a close sibling of, `python-dataclasses.md`'s
own mutable-default facet — that file covers the identical underlying
risk for a `@dataclass` **field** default, where Python actually
raises a real, immediate `ValueError` rather than silently allowing
the trap, and `field(default_factory=...)` is the dataclass-specific
fix; this file covers the *ordinary function parameter* case, where
Python allows the mutable default with no warning at all, making the
`None`-sentinel discipline something a programmer has to apply
deliberately rather than something the language enforces. A real,
applied instance in this project's own history: a G-code parsing
function's optional code-mapping parameters (`motion_codes: dict[int,
str] | None = None`) using this exact idiom — resolved to a real,
named, public default (`DEFAULT_MOTION_CODES`) inside the function
body when a caller doesn't override it, keeping the parameter safe
regardless of whether any future caller ever mutates what they pass
in.

## Try It Yourself

1. Call the original, broken `add_item` a third time, still with no
   `basket` argument, and confirm the real list keeps growing
   (`['apple', 'banana', ...]`) — direct, real proof this isn't a
   one-time fluke, it compounds across every call sharing the default.
2. Print `id(basket)` inside `add_item` across two separate
   default-using calls, then do the same inside `add_item_fixed` —
   confirm the broken version reports the identical real object
   identity both times, while the fixed version reports two different
   ones.
3. Run `ruff check` (per `automated-linting-and-formatting-ruff.md`)
   against a file containing the original, broken `add_item` and read
   its real, specific warning — confirming this is a well-known enough
   real pattern that tooling actively watches for it.
