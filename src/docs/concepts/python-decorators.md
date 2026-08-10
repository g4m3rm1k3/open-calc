# Concept: Python Decorators

**What you'll understand by the end:** what `@name` above a function definition actually does to that function.

**Prerequisites:** none.

## Setup

Python 3, no packages needed.

## The Problem

Sometimes you want to add behavior around a function — logging every call, checking permissions, registering it somewhere — without editing the function's own body, and without every caller having to remember to wrap the call themselves.

## The Isolated Example

```python
def shout(func):
    def wrapper():
        original_result = func()
        return original_result.upper()
    return wrapper

@shout
def greet():
    return "hello"

print(greet())
```

**Real output:**
```
HELLO
```

**What this proves:** `@shout` above `def greet():` didn't add a comment or a label — it silently *replaced* `greet` with `wrapper` (the inner function `shout` returned). Calling `greet()` now actually calls `wrapper()`, which calls the original `greet` internally (captured as `func`), then uppercases whatever it returned. `greet`'s own body never changed.

## Mechanical Walkthrough

- `def shout(func): ...` — an ordinary function that takes a function and returns a new one.
- `def wrapper(): ...`, defined *inside* `shout`, is a **closure** — it remembers `func` (the argument `shout` was called with) even after `shout` itself has finished running.
- `@shout` placed directly above `def greet():` is exactly equivalent to writing `greet = shout(greet)` immediately after defining `greet` — Python evaluates `shout(greet)` at the moment the file loads, and rebinds the name `greet` to whatever that call returns.
- `print(greet())` therefore calls `wrapper()`, not the original function body directly.

## CS Lens

This is **higher-order functions** in action — a function (`shout`) that takes a function as an argument and returns a function as its result, treating functions as ordinary values that can be passed around and transformed.

Also recognized in: any language where functions are first-class values — JavaScript's higher-order functions (`.map`, `.filter` take a function argument the same way), functional programming generally.

## SE Lens

The alternative — manually wrapping every call site (`print(shout(greet)())` everywhere `greet()` was needed) — pushes the responsibility for "apply this extra behavior" onto every caller, who can forget. A decorator applies the behavior once, at the definition site, so every caller automatically gets it with no extra effort or risk of forgetting.

## Connection

This is the exact mechanism a real web framework's routing decorator (see `http-routing-dispatch-table.md`) is built on — a decorator that registers a function to answer a specific URL, instead of transforming its return value the way `shout` does here.

## Try It Yourself

1. Change `wrapper` to print a message before and after calling `func()`, in addition to uppercasing the result. Confirm both the print statements and the uppercasing happen on every call.
2. Write a second decorator, `shout_twice`, that calls `func()` and repeats the uppercased result twice with a space between. Apply both `@shout` and `@shout_twice` to the same function (stacked) and predict the output before running — decorator order matters.
3. Modify `shout`'s inner `wrapper` to accept `*args, **kwargs` and pass them through to `func(*args, **kwargs)`. Apply `@shout` to a function that takes a real argument (e.g. `def greet(name): return f"hello {name}"`) and confirm it still works — the original version would fail here; figure out why before fixing it.
