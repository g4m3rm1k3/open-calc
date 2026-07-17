---
concept: 195-args-kwargs
name: *args and **kwargs (Python)
---

## Definition

`*args` collects any number of extra POSITIONAL arguments into a tuple,
and `**kwargs` collects any number of extra KEYWORD arguments into a
dictionary — letting a function accept a flexible, variable number of
arguments without declaring each one individually in its signature.

## Problem

A function that needs to accept a variable, unknown-in-advance number of
arguments (like `print()`, which can take any number of values) can't
have a fixed, hardcoded parameter list. `*args` and `**kwargs` let a
function's signature stay flexible, gathering however many positional or
keyword arguments the caller actually supplies into a tuple/dict the
function body can then work with directly.

## Execution

A function using `*args` collects EVERY positional argument passed, as a
tuple
↓
Calling it with 3 arguments, then with 5 arguments — both work, since
`args` just collects whatever was actually passed
↓
A function using `**kwargs` collects EVERY keyword argument passed, as a
dict
↓
Calling it with named arguments packs them into that dict inside the
function
↓
`*` and `**` can also be used at the CALL site to UNPACK a list/tuple or
dict into individual arguments — the SAME syntax, opposite direction

## Computer Science

This is Python's mechanism for variadic functions (accepting a variable
number of arguments) — `*args`/`**kwargs` at the DEFINITION site gather
scattered arguments into a collection, while the SAME `*`/`**` syntax at
the CALL site does the reverse, spreading a collection back out into
individual arguments — the same operator serving opposite purposes
depending on context.

Tags: Variadic functions, Argument unpacking, Gather vs spread

## Software Engineering

`*args, **kwargs` are commonly used in wrapper/decorator functions (see
Decorators) specifically so the wrapper can accept and forward ANY
arguments to the wrapped function, without needing to know or hardcode
that function's specific parameter list.

Tags: Decorator forwarding, Generic wrappers, Flexible APIs

## Common Mistakes

- Assuming `*args` and `**kwargs` are REQUIRED names — they're just conventional; the actual mechanism is the `*`/`**` prefix, so other names work identically, just less immediately recognizable to other Python developers.
- Forgetting that `*args`/`**kwargs` parameters must come AFTER regular positional/keyword parameters in a function signature — Python enforces a specific parameter ordering, and getting it wrong is a syntax error.

## Exercises

- Trace through what a function using `**kwargs` would print, given a dict of city/zip fields unpacked into it as keyword arguments.
- Explain the difference between using `*` to DEFINE a function that gathers arguments, versus using `*` at a CALL site to spread a list back into individual arguments.

## python

```python
def add_all(*args):
    return sum(args)


print(add_all(1, 2, 3))         # 6
print(add_all(1, 2, 3, 4, 5))   # 15 -- works with ANY number of arguments


def describe(**kwargs):
    parts = [f"{key}={value}" for key, value in kwargs.items()]
    return ", ".join(parts)


print(describe(name="Alice", age=30))   # name=Alice, age=30

# Unpacking a list at the CALL site with * -- spreads it into individual positional args
numbers = [10, 20, 30]
print(add_all(*numbers))   # 60 -- equivalent to add_all(10, 20, 30)

# Unpacking a dict at the CALL site with ** -- spreads it into individual keyword args
info = {"city": "NYC", "zip": "10001"}
print(describe(**info))   # city=NYC, zip=10001
```
Walkthrough: `add_all(*args)` gathers however many positional arguments
are passed into the `args` tuple, working identically for 3 or 5
arguments. `describe(**kwargs)` gathers keyword arguments into a dict the
same way. The final two calls demonstrate the REVERSE direction — `*` and
`**` at the call site UNPACK an existing list/dict back into individual
arguments, the exact opposite operation from gathering them at definition
time.
