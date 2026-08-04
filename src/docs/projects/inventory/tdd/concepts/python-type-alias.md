# Concept: A Type Alias — Giving a Type Expression a Reusable Name

**What you'll understand by the end:** how a plain assignment
(`Point = tuple[float, float, float]`) creates a reusable, named
stand-in for a type expression, why that's purely a readability and
maintenance win (not a new, distinct type), and how mypy treats a use
of the alias identically to writing out the full expression every
time.

**Prerequisites:** `python-function-type-hints.md`.

## Setup

Python 3.9+ with `pip install mypy`.

## The Problem

A type expression that's genuinely correct but long or easy to get
subtly wrong (`tuple[float, float, float]`, three coordinates in a
fixed order) becomes repetitive and error-prone once it shows up in
several function signatures — every one of them has to spell out the
identical, verbose expression, and a typo in any one of them
(`tuple[float, float]`, missing one axis) wouldn't visually stand out
as wrong the way a misspelled *name* would.

## The Isolated Example

```python
Point = tuple[float, float, float]


def midpoint(a: Point, b: Point) -> Point:
    return (
        (a[0] + b[0]) / 2,
        (a[1] + b[1]) / 2,
        (a[2] + b[2]) / 2,
    )


result = midpoint((0.0, 0.0, 0.0), (10.0, 20.0, 30.0))
print(result)
print("Point itself:", Point)
print("isinstance check against the underlying tuple type:", isinstance(result, tuple))
```

**Real output, run this session:**
```
(5.0, 10.0, 15.0)
Point itself: tuple[float, float, float]
isinstance check against the underlying tuple type: True
```

**Real `mypy` output, run this session:**
```
Success: no issues found in 1 source file
```

**What this proves:** `Point` genuinely is just an ordinary Python
variable — printing it shows the literal type expression it was
assigned (`tuple[float, float, float]`), and a real `Point` value is
still, at runtime, an ordinary `tuple` (`isinstance` confirms it).
Using `Point` in three separate signatures (`a`, `b`, the return type)
type-checks exactly as if `tuple[float, float, float]` had been
written out fully each time — mypy reports zero issues.

The real payoff — mypy still catches a genuine shape mismatch through
the alias, exactly as it would against the spelled-out type:

```python
midpoint((0.0, 0.0), (10.0, 20.0, 30.0))  # only 2 elements, not 3
```

**Real `mypy` output, run this session:**
```
error: Argument 1 to "midpoint" has incompatible type "tuple[float, float]"; expected "tuple[float, float, float]"  [arg-type]
Found 1 error in 1 file (checked 1 source file)
```

**What this proves:** mypy's real error message expands `Point` back
into its full, underlying expression (`"tuple[float, float, float]"`)
— confirming the alias is purely a *display and typing convenience*
for the code that uses it; mypy's own type-checking machinery sees
straight through to the real, underlying type either way.

## Mechanical Walkthrough

- `Point = tuple[float, float, float]` is an ordinary **assignment
  statement**, executed like any other Python line — `Point` becomes a
  real variable whose value happens to be a type expression object.
- Using `Point` in a later annotation (`def midpoint(a: Point, ...)`)
  works because Python annotations accept any expression; mypy
  specifically recognizes a variable holding a type expression and
  substitutes it back in wherever the alias is used.
- No new, distinct type is created — `Point` and `tuple[float, float,
  float]` are the exact same type from mypy's (and Python's own
  runtime) perspective; the alias exists purely so the *name* `Point`
  can be written wherever that type is needed, rather than the full
  expression every time.
- The convention of capitalizing an alias like an ordinary class name
  (`Point`, not `point`) signals "this is a type," matching how real
  class names are written, even though no class is actually being
  defined here.

## CS Lens

This is a real instance of giving a compound type a **name**, purely
for the humans reading and writing the code — mypy's own type-checking
result is provably identical whether the alias or the full expression
is used, confirmed directly above by the error message expanding
`Point` back to its full form. The underlying idea — a name standing
in for a more complex expression, substituted back in wherever it's
used — is the same one behind a compiler macro or a `#define` in C,
just scoped specifically to *type* expressions here rather than
arbitrary code.

Also recognized in: TypeScript's `type Point = [number, number,
number];`, the direct, near-identical equivalent; a SQL `VIEW`
standing in for a longer, reusable query expression, substituted back
in by the database wherever the view is queried.

## SE Lens

The real, practical payoff: three function signatures spelling out
`tuple[float, float, float]` each read, at a glance, as "some tuple of
three floats" — a reader has to trust it's the *same* three floats
every time, with nothing enforcing that beyond careful proofreading. A
shared `Point` alias makes that sameness structural: every signature
using `Point` is provably referring to the identical real type, and
changing what a "point" means later (adding a fourth axis, say) is a
one-line edit to the alias itself rather than a find-and-replace
across every signature that used the old, spelled-out expression.

## Connection

Builds on `python-function-type-hints.md` for the base annotation
mechanism a type alias plugs into. A real, applied instance in this
project's own history: a G-code motion parser's segments each carrying
a real 3-axis position — `Point = tuple[float, float, float]` — reused
across a dataclass's own field annotations and the parsing function's
own return type, rather than repeating the raw tuple expression at
every one of those real, separate sites.

## Try It Yourself

1. Add a second alias, `Vector = tuple[float, float, float]` (an
   identical underlying type, a different real *meaning*), and confirm
   mypy accepts passing a `Point`-typed value anywhere a `Vector` is
   expected — real, concrete proof aliases don't create distinct
   types, only distinct *names* for the same one.
2. Change `Point`'s own definition to `tuple[float, float]` (drop the
   Z axis) and rerun mypy against `midpoint` unchanged — read the real,
   resulting errors at every one of its three real 3-tuple call sites,
   confirming a one-line alias edit is enough to surface every
   affected real call site.
3. Look up `typing.TypeAlias` (an optional, explicit annotation for a
   type-alias assignment, e.g. `Point: TypeAlias = tuple[float, float,
   float]`) and reason about what real ambiguity it exists to resolve
   for a type checker, compared to the plain, unannotated assignment
   used here.
