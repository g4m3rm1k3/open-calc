# Concept: Custom Exception Classes

**What you'll understand by the end:** how to define your own named error type, and why a specific, named exception is more useful than a generic one.

**Prerequisites:** `python-classes-instances.md`.

## Setup

Python 3, no packages needed.

## The Problem

Python's built-in exceptions (`ValueError`, `TypeError`, and similar) are generic — catching a bare `ValueError` might catch one raised for a completely unrelated reason somewhere else in a call chain. Code that wants to signal and catch one *specific, named* kind of failure needs its own distinct exception type.

## The Isolated Example

```python
class TooColdError(Exception):
    pass


def check_temp(t):
    if t < 0:
        raise TooColdError(f"{t} is below freezing")
    return "ok"


try:
    check_temp(-5)
except TooColdError as e:
    print("caught:", e)

print(check_temp(10))
```

**Real output:**
```
caught: -5 is below freezing
ok
```

**What this proves:** `class TooColdError(Exception): pass` defined a brand-new, custom error type — `(Exception)` means it **inherits** from Python's built-in `Exception` class, so it automatically works everywhere a normal exception does (can be raised, caught, carries a message). `pass` means it adds nothing extra of its own — the *name* itself is the entire point, making `except TooColdError` catch specifically this kind of failure and no other. `check_temp(10)` still returns normally for valid input — raising is not the only path through the function.

## Mechanical Walkthrough

- `class TooColdError(Exception):` — a class definition where `(Exception)` specifies what it inherits from, giving it all of `Exception`'s existing behavior (accepting a message, being raisable, being catchable) for free.
- `pass` is a real Python statement meaning "do nothing" — used here because the class body needs *something* syntactically, but no additional behavior beyond what `Exception` already provides is needed.
- `raise TooColdError(f"{t} is below freezing")` constructs an instance of the custom exception (passing a message, exactly like calling any class) and immediately stops normal execution, propagating upward until something catches it.
- `except TooColdError as e:` only catches this specific exception type (and any subclass of it, were one to exist) — a `ValueError` raised elsewhere would not be caught here; it would propagate further up, uncaught by this block.

## Execution Trace

Two calls to `check_temp`, tracing both the raising and non-raising paths:

```
try: check_temp(-5)
  t = -5.  t < 0? → True → raise TooColdError("-5 is below freezing")
  → normal execution inside check_temp stops immediately; the
    exception propagates up to the try block
except TooColdError as e:
  → e is the TooColdError instance just raised
  → print("caught:", e) → "caught: -5 is below freezing"

print(check_temp(10))
  t = 10.  t < 0? → False → skip the raise entirely
  → return "ok"
  → print("ok")
```

The first call never reaches its own `return "ok"` line at all — the
`raise` inside the `if` block is a real, immediate exit from the
function, not a value that happens to get returned.

## CS Lens

This is using **inheritance** to create a new, named category within an existing hierarchy — `TooColdError` *is a* `Exception` (in the same sense `python-isinstance.md` describes), so all the general machinery for handling exceptions works on it unmodified, while its distinct name lets code single it out specifically from every other kind of failure.

Also recognized in: every language with structured exception handling defining its own domain-specific exception hierarchy — Java's checked exceptions, C#'s custom `Exception` subclasses — the same pattern, of naming specific failure categories precisely so callers can react to exactly the ones they know how to handle.

## SE Lens

Raising a generic `Exception` (or a bare `ValueError`) for every kind of failure forces callers who want to react to *one specific* failure mode to inspect the exception's message text to figure out what actually went wrong — fragile, since message text can change without warning. A named, specific exception type lets a caller write `except TooColdError:` and know precisely, structurally, what they're catching, without parsing a string. It also means a `try`/`except` block written to catch one expected failure genuinely won't accidentally swallow a real, unrelated bug that happens to also raise some exception — a real, important distinction from a broad, catch-everything `except:`.

## Connection

Builds on `python-classes-instances.md` (a custom exception is still a class) and directly enables `python-try-except.md`'s specific-vs-broad catching, and `exception-translation-at-boundary.md`'s pattern of catching one named exception type and converting it into a different kind of signal at a layer boundary.

## Try It Yourself

1. Add a second custom exception, `TooHotError`, and a combined check function raising whichever applies. Catch both with two separate `except` clauses on the same `try` and confirm each message routes to the correct branch.
2. Give `TooColdError` a real subclass, `DangerouslyColdError(TooColdError)`, raised for an even lower temperature. Confirm `except TooColdError:` still catches instances of the subclass too — the same inheritance-respecting behavior `isinstance` has.
3. Add a custom attribute to the exception itself (override `__init__` to accept and store the offending temperature as `self.temperature`), and read it back from the `except` block (`e.temperature`) — richer than just the message string, a real, structured piece of data attached to the failure.
