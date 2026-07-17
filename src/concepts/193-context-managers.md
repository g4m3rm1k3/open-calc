---
concept: 193-context-managers
name: Context Managers (Python)
---

## Definition

A context manager is an object implementing `__enter__` and `__exit__`
methods, used with the `with` statement to guarantee setup and cleanup
code runs — cleanup runs automatically when the `with` block ends, EVEN
if an exception occurred inside it, without needing an explicit
try/finally.

## Problem

Resources that need explicit cleanup (files, locks, database connections)
risk being left open/held if cleanup code is forgotten, or if an
exception occurs before a manual cleanup call is reached. A context
manager guarantees `__exit__` runs when the `with` block ends for ANY
reason (normal completion OR an exception), centralizing the
acquire/release logic in one place instead of relying on every caller
remembering try/finally.

## Execution

`__enter__` runs FIRST when entering a `with` block, and its return
value is bound to the `as` variable
↓
The `with` block's body executes
↓
`__exit__` runs AUTOMATICALLY when the block ends — whether it ended
normally OR because an exception was raised inside it
↓
If an exception occurred, `__exit__` receives its type/value/traceback as
arguments, and returning `False` (or `None`) lets the exception continue
propagating after cleanup; returning `True` would SUPPRESS it

## Computer Science

The `with` statement is syntactic sugar for a guaranteed try/finally —
`__enter__` runs before the block, and `__exit__` is guaranteed to run
after, REGARDLESS of whether the block completed normally or raised —
this parallels how `defer` in Go, or RAII in C++, guarantees cleanup
runs on every exit path.

Tags: Try/finally guarantee, RAII (cross-language parallel), Guaranteed cleanup

## Software Engineering

Built-in context managers (`open()` for files, `threading.Lock()` for
locks) are the standard idiomatic way to handle resources in Python —
using `with open(path) as f:` instead of manually calling `f.close()`
guarantees the file gets closed even if code inside the block raises an
exception partway through.

Tags: File handling, Lock management, Idiomatic resource acquisition

## Common Mistakes

- Manually calling acquire/release methods (opening a file, then calling `.close()` at the end of a function) instead of using `with` — this skips cleanup entirely if an exception is raised between acquisition and the manual cleanup call.
- Returning `True` from `__exit__` without a deliberate reason — this SUPPRESSES any exception that occurred in the block, which can silently hide real bugs unless swallowing that specific exception is genuinely the intended behavior.

## Exercises

- Trace through what the example below prints if an exception is raised INSIDE the `with` block — does `__exit__` still run, and does the exception still propagate afterward?
- Explain why `with open(path) as f:` is preferred over manually calling `f = open(path)` followed by `f.close()` at the end of a function.

## python

```python
class Resource:
    def __enter__(self):
        print("acquiring")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("releasing")
        return False   # False (or None) lets any exception continue propagating after cleanup


with Resource() as r:
    print("using resource")

print("---")

try:
    with Resource() as r:
        print("using resource, about to fail")
        raise ValueError("something went wrong")
except ValueError as e:
    print(f"caught: {e}")
```
Walkthrough: the first `with` block runs normally — "acquiring", "using
resource", "releasing", in that order. The second `with` block raises a
`ValueError` INSIDE it — `__exit__` still runs ("releasing" still
prints), demonstrating cleanup happens regardless of the exception, and
then `__exit__`'s `return False` lets the exception continue propagating
outward, where the surrounding `try/except` catches it.
