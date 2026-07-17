---
concept: 192-decorators
name: Decorators (Python)
---

## Definition

A decorator is a function that takes another function (or class) as
input and returns a modified/wrapped version of it — using the
`@decorator_name` syntax placed just above a function definition, letting
you add behavior (logging, timing, access control) without changing the
original function's own code.

## Problem

Adding the same cross-cutting behavior (logging every call, timing
execution, checking permissions) to many different functions would
otherwise mean duplicating that logic inside each function, or manually
wrapping each one by hand at every call site. A decorator factors that
wrapping logic out ONCE, and `@decorator_name` applies it declaratively
to any function, without touching that function's own internals.

## Execution

A decorator function is defined, taking a function and returning a
wrapper that calls it
↓
`@my_decorator` placed above a function definition is EXACTLY equivalent
to reassigning the function's name to the decorator's return value
↓
Calling the decorated name actually calls the wrapper, since that's what
it now refers to
↓
The wrapper runs its own logic, calls the ORIGINAL function (captured via
closure), and returns its result
↓
The original function's own code never had to be modified to gain this
new behavior

## Computer Science

`@decorator` syntax is pure syntactic sugar for reassigning a name to the
result of calling the decorator function on the original — this relies
directly on functions being first-class values (see First-Class
Functions) and closures capturing the original function for the wrapper
to call later.

Tags: First-class functions, Closures, Syntactic sugar, Function wrapping

## Software Engineering

Decorators are widely used for cross-cutting concerns that apply
uniformly across many functions — logging, caching/memoization, access
control, retry logic — keeping that shared logic in ONE place instead of
duplicated inside every function that needs it.

Tags: Cross-cutting concerns, Memoization, Access control, DRY (don't repeat yourself)

## Common Mistakes

- Forgetting to return the wrapped function's result inside the wrapper — the decorated function then always returns `None`, silently discarding whatever the original function actually computed.
- Forgetting `*args, **kwargs` in the wrapper's signature when the decorator needs to work on functions taking different arguments — without them, the decorator only works on functions with the EXACT same signature as hardcoded in the wrapper.

## Exercises

- Trace through what calling the decorated function prints, in order, given the decorator in the example below — write out each line before checking it against the actual output.
- Write a `timer` decorator that prints how long a function took to run, using `time.time()` before and after calling the wrapped function.

## python

```python
import functools


def my_decorator(func):
    @functools.wraps(func)   # preserves the original function's name/docstring on the wrapper
    def wrapper(*args, **kwargs):
        print("before")
        result = func(*args, **kwargs)
        print("after")
        return result
    return wrapper


@my_decorator
def say_hello(name):
    print(f"hello, {name}")
    return f"greeted {name}"


result = say_hello("Alice")
print(result)
print(say_hello.__name__)   # 'say_hello', not 'wrapper' -- functools.wraps preserved the original name
```
Walkthrough: `@my_decorator` reassigns `say_hello` to `wrapper`, so
calling `say_hello("Alice")` actually runs `wrapper`, which prints
"before", calls the ORIGINAL `say_hello` function (captured via closure
as `func`), prints "after", and returns whatever that original call
returned. `functools.wraps` ensures `say_hello.__name__` still reports
`'say_hello'` rather than `'wrapper'`, preserving the original function's
identity for introspection.
