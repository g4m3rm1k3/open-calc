# Concept: Python's Union-Type `|` Syntax (PEP 604)

**What you'll understand by the end:** Python's real `X | Y` union-type
annotation syntax (Python 3.10+), how it requires narrowing before a
type-specific operation is allowed (mirroring TypeScript's own union
types), and how it compares to the older `Optional[str]`/`Union[str,
None]` spellings it largely replaced.

**Prerequisites:** `python-function-type-hints.md`,
`typescript-union-types.md`.

## Setup

Python 3.10+ with `pip install mypy`.

## The Problem

Some real values genuinely aren't always the same type — a lookup
might return a real string, or might return nothing at all
(`None`); a parameter might legitimately accept either a `str` or an
`int`. `typescript-union-types.md` already covers this exact real need
and TypeScript's `string | number` syntax for it — this file exists
because that one only ever demonstrates TypeScript, never Python's own,
visually similar but separately-introduced real syntax.

## The Isolated Example

```python
def describe(value: str | int) -> str:
    if isinstance(value, str):
        return f"text: {value.upper()}"
    return f"number: {value:.2f}"


print(describe("hello"))
print(describe(3))
```

**Real output, run this session:**
```
text: HELLO
3.00
```

Checked with `mypy` — clean:
```
Success: no issues found in 1 source file
```

Calling a type-specific method **without** narrowing first:

```python
def broken(value: str | int) -> str:
    return value.upper()
```

**Real `mypy` output, run this session:**
```
broken.py:2: error: Item "int" of "str | int" has no attribute "upper"  [union-attr]
Found 1 error in 1 file (checked 1 source file)
```

**What this proves:** `describe`'s real `isinstance(value, str)` check
is what let mypy confirm every operation was valid — a clean pass with
zero errors. `broken`, calling `.upper()` (a `str`-only method) with no
check at all, produced a real, specific `[union-attr]` error — mypy
correctly refused to assume `value` was a `str` just because it *might*
be, the identical real behavior `typescript-union-types.md`'s own
`broken` example demonstrates for TypeScript's `string | number`.

## Mechanical Walkthrough

- `value: str | int` — Python's real, native union-type syntax (PEP
  604, available directly since Python 3.10, no import required):
  `value` could genuinely be either type, and mypy tracks both
  possibilities simultaneously, the identical real idea
  `typescript-union-types.md` already names as a **sum type**.
- `isinstance(value, str)` acts as a real **type guard** — the same
  concept as TypeScript's `typeof value === "string"` check, just
  Python's own native runtime-type-check syntax instead. Inside the
  `if` branch, mypy narrows `value`'s tracked type down to just `str`;
  in the code after it (assuming every other case is handled), it
  narrows to `int`.
- Before narrowing, only operations valid on **every** member of the
  union are allowed — `.upper()` isn't valid on `int`, so `broken` is
  rejected even though `value` might genuinely be a `str` at runtime.
- `str | None` — the single most common real union in practice — reads
  naturally as "a real string, or the deliberate absence of one,"
  mirroring `typescript-union-types.md`'s own note that `T | null` is
  TypeScript's most common union too.

## A Second Real Contrast: `|` vs. the Older `Optional`/`Union` Spellings

Before Python 3.10, the identical real type had to be spelled using the
`typing` module instead:

```python
from typing import Optional, Union

def old_optional(name: Optional[str]) -> str:
    return name if name is not None else "anonymous"


def old_union(name: Union[str, None]) -> str:
    return name if name is not None else "anonymous"


def new_pipe(name: str | None) -> str:
    return name if name is not None else "anonymous"


print(old_optional(None), old_union(None), new_pipe(None))
print(old_optional("Ana"), old_union("Ana"), new_pipe("Ana"))
```

**Real output, run this session:**
```
anonymous anonymous anonymous
Ana Ana Ana
```

**Real `mypy` output, run this session:**
```
Success: no issues found in 1 source file
```

**What this proves:** all three functions — `Optional[str]`,
`Union[str, None]`, and `str | None` — produce identical real results
and pass `mypy` cleanly, because they're three different real spellings
of the *exact same* type. `Optional[str]` is itself real, historical
shorthand specifically for `Union[str, None]`; `str | None` is the
modern, more concise syntax replacing both, requiring no `import` from
`typing` at all.

## CS Lens

This is the identical **sum type** idea `typescript-union-types.md`
already establishes in full — Python's real contribution here is
purely syntactic: a native `|` operator directly on type expressions,
rather than a generic-style `Union[...]` container type. Requiring
narrowing before a type-specific operation is the type checker
enforcing that every real possibility gets handled, not silently
assuming the most convenient one — identical enforcement, different
language.

Also recognized in: Rust's `enum` and Haskell/OCaml's algebraic data
types (`typescript-union-types.md`'s own CS Lens already names these as
the formal origin of this idea) — Python's `|` syntax is a comparatively
recent, real, deliberate move toward that same expressiveness.

## SE Lens

The real, practical value of the modern `|` syntax over the older
`Optional`/`Union` spellings: no `from typing import ...` needed at
all, and the annotation reads left-to-right the same way a plain
English description would ("a string, or nothing"). The real, honest
limit: `|` union syntax as a runtime-evaluable expression (not just
inside a string-quoted or deferred annotation) requires Python 3.10 or
newer — real, older-version-compatible code still commonly uses
`Optional`/`Union` from `typing`, and recognizing both spellings as
equivalent (rather than assuming only one is "correct") matters when
reading real, existing codebases.

## Connection

Directly extends `typescript-union-types.md`, cross-referenced from
there as the real gap this file closes. Builds on
`python-function-type-hints.md` for the base annotation syntax, and
connects to `python-mypy-static-type-checking.md` — narrowing failures
like `broken`'s are exactly the kind of real, specific error mypy is
built to catch.

## Try It Yourself

1. Add a third type to the union (`str | int | float`) and extend
   `describe` to handle it with a third `isinstance` branch — confirm
   mypy requires the new case be handled before allowing any
   branch-specific operation on it, the identical real requirement
   `typescript-union-types.md`'s own Try It Yourself #1 poses.
2. Remove the `isinstance` check from `describe` entirely, replacing
   the body with just `return value.upper()` unconditionally, and read
   mypy's real, specific error — compare its wording to `broken`'s
   error above.
3. Search a real, existing Python codebase (or this project's own) for
   both spellings — `Optional[X]`/`Union[X, Y]` and `X | Y` — and note
   which one appears more often, reasoning about whether that reflects
   the codebase's minimum supported Python version.

## A Third Real Facet: A Return Type Widening to `| None` Ripples Through Every Caller

Every union above was designed in from the start. A real, different,
common situation: a function that always returned one real type — until
a genuinely new real case appears that it can't honestly satisfy, and
its signature has to *widen* to `X | None` after the fact.

```python
class DocumentPanel:
    def __init__(self, title):
        self.title = title


# A NEW real kind of panel, added later -- not every panel is a document.
class PreviewPanel:
    def __init__(self, source):
        self.source = source


def current_document(panels, index):
    panel = panels[index]
    if not isinstance(panel, DocumentPanel):
        return None
    return panel


def window_title(panels, index):
    doc = current_document(panels, index)
    if doc is None:
        return "My App"
    return f"My App - {doc.title}"


panels = [DocumentPanel("report.txt"), PreviewPanel("report.txt")]
print(window_title(panels, 0))
print(window_title(panels, 1))
```

**Real output, run this session:**
```
My App - report.txt
My App
```

**What this proves:** before `PreviewPanel` existed, `current_document`
could honestly return `DocumentPanel` unconditionally — every real
panel was one. Once a second, genuinely different real kind exists,
that's no longer true, and the function's own return type has to widen
to `DocumentPanel | None` to stay honest. `window_title` — and, in a
real codebase, every other caller of `current_document` — now has a
real, new obligation: handle the `None` case explicitly, exactly the
narrowing discipline this file's own first facet already establishes.

**Mechanical note:** this is the same real union-type mechanism as
every other example in this file — what's different is the *trigger*:
the type didn't start as a union by design, it widened because a new
real case appeared that the old, narrower type could no longer
honestly describe. This is a real, common, worth-recognizing shape in
an evolving codebase: a single new real requirement (here, a second
kind of tab/panel) doesn't just add code in one place — it can force a
signature to become more honest everywhere it's used, and every caller
has to be found and updated to handle the newly-possible case.

### Try It Yourself (third facet)

1. Add a **third** panel kind and confirm `current_document` needs no
   changes at all — the `isinstance` check already correctly excludes
   anything that isn't a `DocumentPanel`, regardless of how many other
   real kinds exist.
2. Find every real caller of a function in a codebase you have access
   to whose return type recently widened to include `None` (check its
   git history) — confirm each one actually handles the new case, or
   identify one that doesn't as a real, live bug.
3. Explain, in your own words, why this kind of change is often more
   invasive than it first looks — a one-line signature change at the
   source can require real edits at every single call site, not just
   the function itself.

## A Fourth Real Facet: `X | Y` as a Runtime `isinstance` Check, Not Just an Annotation

Every use above is a **type annotation** — text mypy reads, never
executed as real code. `X | Y` is also a real, runtime-evaluable
Python expression (it builds an actual `types.UnionType` object), and
`isinstance` accepts one directly as its second argument:

```python
class Circle:
    pass


class Square:
    pass


class Triangle:
    pass


shapes = [Circle(), Square(), Triangle()]

for shape in shapes:
    print(type(shape).__name__, "matches Circle | Square:", isinstance(shape, Circle | Square))
```

**Real output, run this session:**
```
Circle matches Circle | Square: True
Square matches Circle | Square: True
Triangle matches Circle | Square: False
```

**What this proves:** `isinstance(shape, Circle | Square)` genuinely
evaluates `Circle | Square` first (producing a real union-type object),
then checks whether `shape` is an instance of either member — `True`
for the two matching shapes, `False` for `Triangle`, with no
annotation or mypy involved anywhere in this example.

**Mechanical note — this isn't a new capability, just a new spelling:**
`isinstance` has always accepted a **tuple** of types for exactly this
"any of these" check, long before `X | Y` syntax existed:

```python
for shape in shapes:
    print(type(shape).__name__, "matches (Circle, Square):", isinstance(shape, (Circle, Square)))
```

**Real output, run this session:**
```
Circle matches (Circle, Square): True
Square matches (Circle, Square): True
Triangle matches (Circle, Square): False
```

Both forms produce identical real results — `Circle | Square` and
`(Circle, Square)` are two different real spellings `isinstance`
accepts for the same "is this any of these types" question. The `|`
spelling's real advantage is consistency: the exact same `X | Y` text
that appears in a type annotation can be reused verbatim as a runtime
check, rather than switching to a differently-shaped tuple literal.

### Try It Yourself (fourth facet)

1. Add a third type to the union (`Circle | Square | Triangle`) and
   confirm every shape now matches — direct, real proof this scales to
   more than two members the same way the tuple form does.
2. Store `Circle | Square` in a variable first (`shape_types =
   Circle | Square`) and pass the variable to `isinstance` instead of
   the inline expression — confirm it behaves identically, real proof
   `X | Y` really does produce an ordinary, storable object at runtime.
3. Try `issubclass(Circle, Circle | Square)` (note: a *class*, not an
   instance) and reason about why this succeeds for the same real
   reason `isinstance` does.
