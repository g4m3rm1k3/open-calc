# Concept: Python's `a or b` Fallback Idiom

**What you'll understand by the end:** how to use Python's `or`
operator to supply a fallback value when something might be missing —
`None`, an empty string, or otherwise falsy — and the real gotcha it
carries with legitimately falsy values like `0`.

**Prerequisites:** `python-truthy-falsy-values.md`.

## Setup

Python 3, no packages needed.

## The Problem

A value — a function parameter, a config field — sometimes isn't
given at all (`None`), or arrives as an empty string, and code needs a
reasonable default to fall back on in that case, without writing a
full `if`/`else` every time. This is the identical real need
`javascript-logical-or-default-fallback.md` already covers for
JavaScript's `||` — that file even names Python's own `a or b` as
having "near-identical" behavior, but never actually demonstrates
Python's real syntax or its own real gotcha.

## The Isolated Example

```python
import os


def resolve_start_path(initial_path):
    return initial_path or os.getcwd()


print(resolve_start_path("/tmp/projects"))
print(resolve_start_path(None))
print(resolve_start_path(""))
print("os.getcwd() itself:", os.getcwd())
```

**Real output, run this session:**
```
/tmp/projects
C:\Users\g4m3r\Documents\cam-project
C:\Users\g4m3r\Documents\cam-project
os.getcwd() itself: C:\Users\g4m3r\Documents\cam-project
```

**What this proves:** a real, non-empty path (`"/tmp/projects"`) passed
through unchanged. Both `None` and `""` — two genuinely different real
values, but both falsy — fell back to `os.getcwd()`'s real, current
working directory instead. `a or b` doesn't distinguish *why* `a` was
falsy; it only checks *whether* it was.

The real, honest gotcha this idiom carries:

```python
def effective_count(count):
    return count or 10


print(effective_count(3))
print(effective_count(0))
print(effective_count(None))
```

**Real output, run this session:**
```
3
10
10
```

**What this proves:** a genuinely meaningful, real `0` got silently
replaced by the fallback `10` — identical, real behavior to `count ||
10`'s own gotcha in JavaScript. `or` cannot tell "this is legitimately
zero" apart from "this is missing," which is fine when zero and
missing really should be treated the same (an empty starting path is a
reasonable stand-in for "no path given" — Step 32's own real,
motivating case), and a real bug source whenever zero is a meaningful,
distinct value that must be preserved.

## Mechanical Walkthrough

- `a or b` evaluates `a` first; if `a` is **truthy**, the whole
  expression's value is `a` itself, and `b` is never evaluated at all
  (short-circuit evaluation, the identical mechanism
  `javascript-logical-or-default-fallback.md` already names). If `a`
  is **falsy**, the expression's value is `b` instead.
- Python's falsy values (per `python-truthy-falsy-values.md`) are:
  `False`, `0`, `0.0`, `""`, `None`, and any empty container (`[]`,
  `{}`, `()`, `set()`) — every other value is truthy.
- Unlike JavaScript, Python has no separate "only fall back on `None`"
  operator (JavaScript's `??`, per that file's own SE Lens) built into
  the language — the closest real equivalent in Python is an explicit
  `b if a is None else a`, which correctly preserves a legitimate `0`
  or `""` that `or` would silently discard.
- `os.getcwd()` is a real, simple standard-library call returning the
  current working directory as a plain string — used here as the
  real, concrete fallback value for a missing starting path.

## CS Lens

This is the identical real mechanism
`javascript-logical-or-default-fallback.md` already covers — **short-
circuit evaluation** combined with an operator that returns whichever
real *operand* determined the result, rather than a plain `True`/
`False` — Python and JavaScript share this exact dual nature for their
logical operators, a genuinely convergent real language design choice.

Also recognized in: shell scripting's `${VAR:-default}` parameter
expansion (a different mechanism, the identical real intent); any
language whose logical-OR returns an operand rather than a boolean.

## SE Lens

The real, practical choice: `a or b` is the right, concise tool
specifically when every one of Python's falsy values genuinely should
be treated as "use the fallback" — a missing, `None`, or empty-string
path is a strong real example, since none of those meaningfully differ
from "no path was given." It's the wrong tool the moment a legitimately
falsy value (a real `0`, a real empty list that's meaningfully
different from "no list") needs to be preserved rather than silently
replaced — `b if a is not None else a` is the real, correct, more
verbose alternative for that case.

## Connection

Directly extends `javascript-logical-or-default-fallback.md`, cited
there as the "near-identical" Python behavior it never demonstrates —
this file is that demonstration. Builds on
`python-truthy-falsy-values.md` for Python's own specific falsy-value
list. A real, applied instance in this project's own history of the
`is not None` alternative this file's own SE Lens and Try It Yourself
#1 already name: a G-code motion parser carrying forward each axis's
last real coordinate (`new_x if new_x is not None else x`) whenever a
line only partially specifies X/Y/Z — `new_x or x` would have been a
genuine, real bug here, since `0.0` is both Python-falsy and a
perfectly legitimate real coordinate value that must never be silently
discarded.

## Try It Yourself

1. Rewrite `effective_count` using `10 if count is None else count`
   instead, and confirm it correctly preserves a real, legitimate `0`
   that the `or` version discarded.
2. Chain three fallbacks together (`a or b or c or "final default"`)
   and confirm, for several combinations of truthy/falsy values, that
   it scans left to right and stops at the first truthy one — the
   identical real behavior `javascript-logical-or-default-fallback.md`'s
   own Try It Yourself #3 already demonstrates for `||`.
3. Look up Python's own real precedent for this exact idiom in its
   standard library or common third-party code, and identify one real
   case where the falsy-vs-missing distinction genuinely doesn't
   matter (safe to use `or`) versus one where it would (`or` would be
   a real bug).
