# Concept: Running `mypy` — Real Configuration, Real Enforcement

**What you'll understand by the end:** how to actually run `mypy`
against real code, and what three of its real, individually-toggleable
checks (`disallow_untyped_defs`, `warn_return_any`,
`warn_unused_ignores`) each specifically catch.

**Prerequisites:** `static-vs-dynamic-typing.md`,
`python-function-type-hints.md`.

## Setup

Python 3 with `pip install mypy`.

## The Problem

`python-function-type-hints.md` already shows that Python's own type
hints are purely informational to the interpreter — nothing stops
wrong-typed code from running. `mypy` is the real, separate tool that
actually reads those hints and checks them — but by itself, "run mypy"
isn't a single fixed behavior: mypy has many real, individually
configurable checks, and which ones are active determines how much it
actually catches.

## The Isolated Example

A real, deliberately imperfect file:

```python
import json


def load_config(path: str) -> dict:
    with open(path) as f:
        return json.load(f)


def untyped_helper(x):
    return x * 2


def returns_any_from_json(path: str) -> int:
    with open(path) as f:
        data = json.load(f)  # json.load's return type is Any
    return data["count"]


def has_unnecessary_ignore(x: int) -> int:
    return x + 1  # type: ignore[no-any-return]
```

Checked with a **strict** config (`disallow_untyped_defs = True`,
`warn_return_any = True`, `warn_unused_ignores = True`):

**Real output, run this session:**
```
sample.py:6: error: Returning Any from function declared to return "dict[Any, Any]"  [no-any-return]
sample.py:9: error: Function is missing a type annotation  [no-untyped-def]
sample.py:16: error: Returning Any from function declared to return "int"  [no-any-return]
sample.py:20: error: Unused "type: ignore" comment  [unused-ignore]
Found 4 errors in 1 file (checked 1 source file)
```

Checked with those same three checks explicitly turned **off**:

**Real output, run this session:**
```
Success: no issues found in 1 source file
```

**What this proves:** the exact same real file produces two completely
different results depending purely on configuration — four real,
specific errors with the strict settings on, and a clean pass with
them off. Type checking isn't a single, fixed strictness level; it's a
real, tunable set of independent checks, and the *file itself* never
changed between the two runs.

## Mechanical Walkthrough

- `disallow_untyped_defs = True` requires every real function to have
  parameter and return annotations — `untyped_helper(x):` has neither,
  triggering `[no-untyped-def]`. Turned off, an unannotated function is
  simply treated as fully dynamic (`Any` everywhere), no error raised.
- `warn_return_any = True` flags a function whose **declared** return
  type is specific (`dict`, `int`) but whose **actual** returned
  expression's inferred type is `Any` — `json.load(...)`'s real return
  type is `Any` (its content genuinely isn't known until runtime), so
  returning it directly from a function declared `-> dict` or `-> int`
  is flagged as a real, potential type-safety gap being silently
  papered over. Turned off, returning `Any` from a specifically-typed
  function is allowed without complaint.
- `warn_unused_ignores = True` flags a `# type: ignore[...]` comment
  that isn't actually suppressing any real error — `has_unnecessary_
  ignore`'s `# type: ignore[no-any-return]` was written defensively,
  but `x + 1` on a real `int` genuinely returns `int`, not `Any`, so
  there's nothing there to suppress; mypy reports the ignore comment
  itself as dead weight. Turned off, an unnecessary ignore comment is
  silently accepted, hiding the fact it's doing nothing.
- Configuration lives in a real `[mypy]` section (in `mypy.ini`,
  `setup.cfg`, or `[tool.mypy]` inside `pyproject.toml`) — one real,
  central place controlling every file mypy checks, rather than
  per-file settings scattered throughout a codebase.

## CS Lens

This is **gradual, configurable static analysis**: rather than a fixed,
all-or-nothing strictness level, `mypy` exposes real, independent knobs
a team can enable incrementally — a project might start with lenient
settings on a large, existing codebase (avoiding an overwhelming flood
of errors on day one) and tighten specific checks over time as more of
the codebase gets properly annotated. `Any` itself is the real, load-
bearing concept underneath both `no-untyped-def` and `no-any-return` —
it represents "mypy has no real information about this value's type,"
and every one of these checks is really about controlling how much
`Any` is allowed to silently flow through otherwise-typed code.

Also recognized in: ESLint's own individually-toggleable rule
configuration in the JavaScript ecosystem, and `automated-linting-and-
formatting-ruff.md`'s own `--select` mechanism — the identical real
"enable exactly the checks you want, not an all-or-nothing switch"
design recurring across very different static-analysis tools.

## SE Lens

The real, practical payoff of `disallow_untyped_defs` specifically:
it's the actual enforcement mechanism that makes writing type hints
throughout a codebase non-optional in practice, rather than a
convention some functions happen to follow and others don't — the same
gap `python-function-type-hints.md`'s own SE Lens names ("hints are
only as good as a team's discipline running the checker"), now closed
by a real, specific configuration flag rather than left to hope.
`warn_return_any` catches a genuinely sneaky real gap: code that
*looks* fully typed (a clean `-> dict` signature) can still silently
leak untyped data through, if the actual returned value traces back to
something like `json.load()` that mypy can't see inside of.

## Connection

Builds directly on `static-vs-dynamic-typing.md` (the "why") and
`python-function-type-hints.md` (the annotation syntax mypy actually
reads) — this file's own job is the tool and its real configuration,
not the syntax. `warn_unused_ignores` connects to
`automated-linting-and-formatting-ruff.md`'s own idea of a tool
flagging dead, no-longer-needed suppressions.

## Try It Yourself

1. Remove the `# type: ignore[no-any-return]` comment from
   `has_unnecessary_ignore` entirely and confirm mypy reports **no**
   error for that function either way — direct, real proof the ignore
   comment genuinely wasn't suppressing anything.
2. Add a real, genuine type error mypy *would* need an ignore comment
   for (say, `return "not an int"` from a function declared `-> int`),
   add `# type: ignore[return-value]` to it, and confirm
   `warn_unused_ignores` now stays silent about that specific
   comment — contrasting a genuinely necessary ignore against the
   unnecessary one above.
3. Look up mypy's `--strict` flag (a real, single flag that enables a
   whole bundle of checks, including all three covered here at once)
   and compare its full list of enabled checks against the three
   configured individually in this file's own example.

## A Real Second Facet: a Plural Method Accepting a Stricter Type Than Its Singular Counterpart

Two methods on the same real class can accept genuinely different
types for what looks like "the same kind of value," purely because one
takes a single item and the other takes a list.

```python
import sys
from PySide6.QtGui import QAction, QKeySequence
from PySide6.QtWidgets import QApplication

app = QApplication.instance() or QApplication(sys.argv)

action = QAction("Zoom In")
action.setShortcut("Ctrl++")  # a single str -- this line is fine
action.setShortcuts(["Ctrl++", "Ctrl+="])  # a list of str
```

**Real `mypy` output, run this session:**
```
error: List item 0 has incompatible type "str"; expected "QKeySequence"  [list-item]
error: List item 1 has incompatible type "str"; expected "QKeySequence"  [list-item]
Found 2 errors in 1 file (checked 1 source file)
```

**The fix — wrap each string explicitly:**

```python
action.setShortcuts([QKeySequence("Ctrl++"), QKeySequence("Ctrl+=")])
```

**What this proves:** `setShortcut(str)` — singular — genuinely accepts
a plain string directly; PySide6's own type stubs declare an implicit
`str`-to-`QKeySequence` conversion for that one parameter. `setShortcuts
(list[str])` — plural, otherwise the identical real concept — does
**not** get the same implicit-conversion treatment in its own stub
signature; each list element's declared type is `QKeySequence`
specifically, with no automatic `str` coercion inside a list. Passing
plain strings type-checks fine for the singular method and fails for
the plural one, even though both ultimately describe the same real
key-sequence data.

**Mechanical note — why this isn't a mypy bug:** this is a real,
correctly-reported mismatch against PySide6's own actual declared
signatures, not a false positive — the two methods' own real type
stubs genuinely differ in what they accept, likely because the
implicit-conversion convenience was only ever written for the far more
common single-shortcut case. The fix is not a workaround; it's writing
the type the method's real signature has always required, just spelled
out explicitly instead of relying on an implicit conversion that
doesn't exist for a list.

### Try It Yourself (second facet)

1. Look up `QKeySequence.__init__`'s own real signature and confirm it
   accepts a plain `str` directly — the actual implicit conversion
   `setShortcut(str)` relies on internally.
2. Find one other real pair of singular/plural methods in a library
   you use where the plural version turns out to be stricter (or looser)
   about accepted types than its singular counterpart — real,
   concrete proof this "shouldn't they accept the same things?"
   assumption is worth checking, not assuming.
3. Write a small helper function, `to_key_sequences(*shortcuts: str) ->
   list[QKeySequence]`, that performs this wrapping once, and reason
   about whether centralizing it is worth it for a codebase with only
   one or two call sites versus one with many.
