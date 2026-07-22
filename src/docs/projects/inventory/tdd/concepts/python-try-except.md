# Concept: `try`/`except`

**What you'll understand by the end:** how to run code that might fail, catch a specific kind of failure, and let anything else propagate normally.

**Prerequisites:** `python-custom-exceptions.md`.

## Setup

Python 3, no packages needed.

## The Problem

Some operations can fail in ways that are expected and recoverable — invalid input, a missing file. Without a way to catch that failure, it crashes the entire program at the point it happens. Code needs a way to say "try this, and if this *specific* kind of thing goes wrong, handle it — but let anything else fail normally."

## The Isolated Example

```python
def divide(a, b):
    return a / b

try:
    result = divide(10, 0)
    print("never reached:", result)
except ZeroDivisionError as e:
    print("caught:", e)

print("program continues normally")
```

**Real output:**
```
caught: division by zero
program continues normally
```

**What this proves:** `divide(10, 0)` really did raise `ZeroDivisionError` — the `print("never reached:", ...)` line genuinely never ran, proven by its absence from the output. The `except` block caught it, and the program continued past the whole `try`/`except` normally, rather than crashing.

## Mechanical Walkthrough

- Code inside `try:` runs normally, statement by statement, unless one of them raises an exception.
- The moment an exception is raised anywhere inside the `try` block, execution immediately jumps out of the block — any remaining statements in it (like the `print("never reached...")` line) are skipped entirely, not just the one that failed.
- `except ZeroDivisionError as e:` only catches this specific exception type. `as e` binds the actual exception object to the name `e`, so its message (`str(e)`) or other attributes can be read inside the handler.
- Code after the whole `try`/`except` statement runs normally afterward, whether or not an exception was caught — the program isn't "broken" by a caught exception, only by an uncaught one.

## CS Lens

This is **structured exception handling** — separating the code that might fail from the code that decides how to react to that failure, connected by the type of what was raised rather than by manually checking a return value after every call for a special "error" sentinel.

Also recognized in: every language with exceptions (Java's `try`/`catch`, JavaScript's `try`/`catch`, C#'s `try`/`catch`) — near-universal syntax across languages for this exact control-flow shape, differing mostly in keyword spelling.

## SE Lens

Catching a *specific* exception type (`except ZeroDivisionError:`) rather than a bare `except:` (which catches literally everything, including exceptions signaling a real bug elsewhere in the code) is the important discipline here: a broad catch-all can silently swallow an unrelated programming mistake and make it look like the expected, handled case — a real, common source of bugs that are hard to diagnose specifically because the error that would have revealed them got silently absorbed. Catching narrowly means only the specific, anticipated failure is handled; everything else still fails loudly, as it should.

## Connection

Builds on `python-custom-exceptions.md`. Directly enables `exception-translation-at-boundary.md` — catching a specific exception at one layer and converting it into a different kind of signal (an HTTP status code, for instance) for the next layer up.

## Try It Yourself

1. Add a second `except` clause for a different exception type (e.g. `except TypeError:`) on the same `try`, and trigger each one separately with different bad input, confirming each routes to its own handler.
2. Add a bare `except:` as a final fallback after the specific ones, then deliberately trigger an exception type none of the specific clauses catches. Confirm it lands in the bare fallback — then reason about why the SE Lens above recommends being cautious with this pattern in real code.
3. Add a `finally:` block after the `except` clause, printing a message. Confirm it runs both when an exception is caught and when the `try` block succeeds with no exception at all — `finally` runs unconditionally, a real, distinct guarantee from `except`.
