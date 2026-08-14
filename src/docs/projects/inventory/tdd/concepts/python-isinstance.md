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

- isinstance(fido, Dog)
  → fido's actual type is Dog → matches directly → True

- isinstance(fido, Animal)
  → fido's actual type is Dog, not Animal directly
  → isinstance walks Dog's inheritance chain: Dog → Animal
  → Animal found in that chain → True

- type(fido) == Dog
  → type(fido) is exactly Dog → Dog == Dog → True

- type(fido) == Animal
  → type(fido) is exactly Dog, not Animal
  → Dog == Animal → False (no inheritance walk — this is a direct
    equality check between two type objects)

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

## A Second Real Facet: `assert isinstance(...)` as a Type-Narrowing Hint

Every use above checks a type to make a real runtime *decision*. A
real, different use reaches for `assert isinstance(...)` purely to
tell a **static type checker** what a value's real type is, at a point
where the checker's own tracked type is broader than what's actually
true:

```python
class Shape:
    pass


class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius


def get_current_shape() -> Shape:
    return Circle(5)  # in real code, might come from a container typed as returning plain Shape


shape = get_current_shape()
assert isinstance(shape, Circle)
print("radius:", shape.radius)
```

**Real `mypy` output, run this session:**
```
Success: no issues found in 1 source file
```

**Real `mypy` output with the `assert` removed, run this session:**
```
error: "Shape" has no attribute "radius"  [attr-defined]
Found 1 error in 1 file (checked 1 source file)
```

**What this proves:** `get_current_shape()` is declared to return the
broader `Shape` type — mypy has no way to know, just from that
signature, that it's really always a `Circle` in this specific case.
Without the `assert`, accessing `shape.radius` is a real, correctly-
flagged error — `Shape` genuinely has no `.radius` attribute. Adding
`assert isinstance(shape, Circle)` fixes this with **zero** runtime
behavior change (the assertion is trivially true and never fails) —
its entire real job is telling mypy "from this line onward, treat
`shape` as a `Circle`," which it does.

**Mechanical note:** this differs from every prior use of `isinstance`
in this file in *purpose*, not mechanism — the identical function call
either drives a real runtime branch (checking which of several cases
applies) or exists purely to narrow a static type checker's own
tracked type, with the actual check itself expected to always pass in
correct code. Real Qt/GUI code often needs this specifically because a
framework's own type signatures (like `QTabWidget.currentWidget()`
returning a plain `QWidget`) are broader than what a specific
application actually stores there.

### Try It Yourself (second facet)

1. Run Python with optimizations enabled (`python -O script.py`), which
   strips all `assert` statements entirely, and confirm the *runtime*
   behavior is unaffected either way — real, concrete proof this
   `assert`'s value is purely for the type checker, not runtime safety.
2. Replace `assert isinstance(shape, Circle)` with a real, incorrect
   assumption (`assert isinstance(shape, str)`) and confirm mypy now
   reports a **different** real error at the next line, since it
   correctly narrows to the (wrong) asserted type.
3. Compare this technique against a real `if isinstance(...): ... else:
   raise TypeError(...)` — reasoning about when the terser `assert`
   form (appropriate when the "impossible" case genuinely shouldn't
   happen in correct code) is the right choice versus the more
   explicit, real error-raising version (appropriate when the case
   is a genuinely possible, real input to guard against).

**A related but genuinely different real reason to silence a type
checker:** `# type: ignore[call-arg]`, seen in this project's own real
code on a third-party call (`pyvista`'s `.reset_camera()`), with a
direct code comment explaining why — the library's own deprecation
decorator confuses mypy into thinking the method needs an explicit
`self` argument, a real bug in the library's own type stubs, not a
real type error in the calling code at all. This is a different real
category from `assert isinstance(...)`: that technique narrows an
already-correct-but-too-broad type using real, true runtime
information; `# type: ignore[...]` instead says "mypy is simply wrong
here, for a reason outside this code's own control" — worth keeping
these two "trust me" mechanisms mentally distinct: one is a real,
true statement about a value; the other is a workaround for a real,
external tooling gap.

**A third, genuinely distinct reason:** `# type: ignore[attr-defined]`,
for an attribute deliberately stashed on an object whose own class
was never written to carry it:

```python
class SharedResource:
    pass


def tag_with_owner(resource: SharedResource, owner_name: str) -> None:
    resource._owner_name = owner_name  # type: ignore[attr-defined]


def owner_of(resource: SharedResource) -> str:
    return resource._owner_name  # type: ignore[attr-defined]


r = SharedResource()
tag_with_owner(r, "team-a")
print("owner:", owner_of(r))
```

**Real output, run this session:**
```
owner: team-a
```

**Real `mypy` output with both `# type: ignore` comments removed, run
this session:**
```
attr_defined_noignore.py:6: error: "SharedResource" has no attribute "_owner_name"  [attr-defined]
attr_defined_noignore.py:10: error: "SharedResource" has no attribute "_owner_name"  [attr-defined]
Found 2 errors in 1 file (checked 1 source file)
```

**Real `mypy` output with the ignores restored:**
```
Success: no issues found in 1 source file
```

**What this proves:** `SharedResource`'s own class body declares no
`_owner_name` attribute anywhere — mypy is genuinely, correctly right
that nothing in the class's own definition promises it exists. The
code attaches it dynamically anyway (Python objects generally allow
this), and both `# type: ignore[attr-defined]` comments tell mypy
"yes, I know — this is intentional" rather than the attribute being a
real typo or a genuine mistake.

**Mechanical note — how this differs from the other two "trust me"
reasons in this file:** `[call-arg]` on `pyvista`'s method was a real
bug in *someone else's* stubs, entirely outside this codebase's
control. This `[attr-defined]` case is the opposite: the code itself
made a deliberate, real design choice (attaching state to an object
never designed to hold it, often to keep that state traveling
alongside a shared resource rather than duplicated per-view) that
mypy's static class-shape tracking simply cannot see, because it
genuinely happened at runtime, not in any class definition mypy can
read. Silencing mypy here isn't correcting mypy's mistake — it's
telling mypy about a real fact intentionally left out of the type
system.

## A Fourth Real Facet: `hasattr(...)` Does Not Narrow a Type the Way `isinstance`/`is not None` Do

A real, easy-to-miss trap: `hasattr(value, "some_method")` and `value
is not None` can be **behaviorally identical at runtime** for a
specific case, while only one of them actually helps mypy.

```python
class Editor:
    def zoom_in(self, delta: int = 1) -> None:
        pass


def current_editor() -> Editor | None:
    return Editor()


def zoom_in_hasattr() -> None:
    editor = current_editor()
    if hasattr(editor, "zoom_in"):
        editor.zoom_in(1)
```

**Real `mypy` output, run this session:**
```
error: Item "None" of "Editor | None" has no attribute "zoom_in"  [union-attr]
Found 1 error in 1 file (checked 1 source file)
```

**The fix — check `is not None` instead:**

```python
def zoom_in_is_not_none() -> None:
    editor = current_editor()
    if editor is not None:
        editor.zoom_in(1)
```

**Real `mypy` output, run this session:**
```
Success: no issues found in 1 source file
```

**What this proves:** at runtime, both versions behave identically —
`hasattr(None, "zoom_in")` is `False`, exactly like `None is not None`
— so `editor.zoom_in(1)` genuinely never executes when `editor` is
`None`, either way. mypy still rejects the `hasattr` version: it has no
built-in understanding that "this object has a `zoom_in` attribute"
implies "this object is not `None`" — `hasattr` is just an ordinary
function call as far as the type checker is concerned, carrying no
special narrowing meaning. `is not None` (like `isinstance(...)`
elsewhere in this file) is one of a small, specific set of checks mypy
recognizes and narrows on directly.

**Mechanical note — why this specific case is doubly misleading:**
`Editor` (the only non-`None` member of `Editor | None`) *always* has a
`zoom_in` method — there is no real scenario where `editor` is a
non-`None` `Editor` that happens to lack it. The `hasattr` check was
never really testing "does this object support zooming" at all; it was
functioning purely as an (accidentally correct, but type-checker-
invisible) `None`-guard the whole time. Once the real intent (guard
against `None`) is stated directly (`is not None`), mypy can verify it.

### Try It Yourself (fourth facet)

1. Add a second class, `BackplotView`, with no `zoom_in` method at all,
   change `current_editor`'s return type to `Editor | BackplotView`,
   and confirm `hasattr(editor, "zoom_in")` now genuinely *does* the
   real job its name suggests (distinguishing two concrete, always-
   non-`None` types by capability) — the one real case where reaching
   for `hasattr` over `isinstance` is actually meaningful, not just a
   disguised `None`-check.
2. Try `if editor:` (plain truthiness) instead of `if editor is not
   None:` and check whether mypy still narrows correctly — reasoning
   about why this happens to work here specifically because `Editor`
   has no `__bool__`/`__len__` override that could make a real,
   non-`None` instance falsy.
3. Search this project's own real code for another `hasattr(...)` call
   guarding a `None`-typed value, and rewrite it as an explicit
   `is not None` check — confirming, with a real `mypy` run before and
   after, whether the same `[union-attr]` gap was actually present.
