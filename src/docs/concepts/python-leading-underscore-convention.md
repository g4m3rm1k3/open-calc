# Concept: Python's Leading-Underscore Naming Convention

**What you'll understand by the end:** what a single leading underscore on a name signals in Python, and why it's a convention rather than an enforced rule.

**Prerequisites:** none.

## Setup

Python 3, no packages needed.

## The Problem

A module often has internal details — helper values or functions — that aren't meant to be used by code outside that module, alongside a smaller "public" surface that is. Some way of signaling the difference to a reader (and to tools) is useful, even in a language that doesn't strictly enforce `public`/`private` access.

## The Isolated Example

`toolbox.py`:
```python
_INTERNAL_CONSTANT = 42

def public_function():
    return _INTERNAL_CONSTANT * 2
```

```python
import toolbox

print(toolbox.public_function())
print(toolbox._INTERNAL_CONSTANT)  # works — nothing stops this

from toolbox import *
print(public_function())
try:
    print(_INTERNAL_CONSTANT)
except NameError as e:
    print(f"NameError: {e}")
```

**Real output:**
```
84
42
84
NameError: name '_INTERNAL_CONSTANT' is not defined
```

**What this proves:** `toolbox._INTERNAL_CONSTANT` was reachable directly — Python never actually blocked access to it. But `from toolbox import *` (a wildcard import, pulling in "everything") silently skipped it — one specific place Python's tooling *does* honor the underscore, rather than a hard access restriction everywhere.

## Mechanical Walkthrough

- `_INTERNAL_CONSTANT`, with one leading underscore, signals "internal to this module, not meant to be imported and used elsewhere" — a documented intention, read by other programmers and some tools, not a lock enforced by the interpreter for ordinary imports.
- `from toolbox import *` is the one real place this convention has enforced behavior: wildcard imports skip any name starting with an underscore by default, unless the module defines an explicit `__all__` list overriding that.
- A double leading underscore (`__name`, not shown here) is a different, stronger mechanism inside a class body — it triggers real name-mangling to avoid accidental collisions in subclasses, a distinct concept from the plain single-underscore convention.

## CS Lens

This is a **convention-based access modifier** — signaling intended visibility through naming rather than through a compiler-enforced `private` keyword. Python calls this "we're all consenting adults here": the language trusts programmers to respect the signal rather than mechanically preventing access.

Also recognized in: many dynamically-typed languages favor convention over enforcement for this exact reason — Ruby's convention-heavy culture, JavaScript's older, pre-`#private-fields` reliance on a leading underscore for the same signal.

## SE Lens

The alternative — a real, enforced `private` keyword (as in Java or C#) — guarantees external code physically cannot access the marked member, at the cost of real inflexibility (debugging, testing, or a legitimate rare exception all become harder). Python's convention trades that guarantee for flexibility: a test suite can still reach `_INTERNAL_CONSTANT` directly when genuinely needed, at the cost of relying on every reader (and every other piece of code) to actually respect the signal rather than being forced to.

## Connection

Commonly paired with `python-regex-compile.md` and similar cases — a compiled pattern or other module-level value that exists purely to support the module's own public functions, not meant to be someone else's import target.

## Try It Yourself

1. Add an explicit `__all__ = ["public_function"]` to `toolbox.py` and repeat the wildcard-import example. Confirm the behavior is the same as relying on the underscore convention alone — `__all__` gives explicit control over exactly this same mechanism.
2. Access `_INTERNAL_CONSTANT` directly via `toolbox._INTERNAL_CONSTANT` from outside the module (not wildcard-imported) and confirm it works with zero restriction — re-read what the wildcard-import example did and did not prove.
3. Add a double-underscore attribute (`__secret`) inside a class body, and try to access it from outside the class as `instance.__secret`. Read the real error, then find it under its *mangled* real name (`instance._ClassName__secret`) to see what "name mangling" actually did.
