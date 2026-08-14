# Concept: Default Parameter Values and Keyword Arguments

**What you'll understand by the end:** how to give a function or method parameter a fallback value so existing callers don't break when a new parameter is added, and how to pass arguments by name instead of position.

**Prerequisites:** `python-classes-instances.md`.

## Setup

Python 3, no install needed:
```
python3 --version
```

## The Problem

Adding a new parameter to an existing function or constructor normally breaks every call site that doesn't yet pass it — every existing caller would need to be found and updated, purely to keep working exactly as before, even when the new parameter's whole purpose is an *optional* behavior most callers don't need to think about at all.

## The Isolated Example

```python
class Greeter:
    def __init__(self, formal=False):
        self.formal = formal

    def greet(self, name):
        return f"Good day, {name}." if self.formal else f"Hey {name}!"

casual = Greeter()
formal = Greeter(formal=True)
formal_positional = Greeter(True)

print(casual.greet("Alex"))
print(formal.greet("Alex"))
print(formal_positional.greet("Alex"))
```

**Real output:**
```
Hey Alex!
Good day, Alex.
Good day, Alex.
```

**What this proves:** `Greeter()`, with zero arguments, works exactly as it would have before `formal` existed — the default value (`False`) was supplied automatically. `Greeter(formal=True)` and `Greeter(True)` produce the identical result, demonstrating the same argument can be passed either by explicit name or by position.

## Mechanical Walkthrough

- `def __init__(self, formal=False):` — `formal=False` in the parameter list gives `formal` a **default value**: any call that omits it entirely receives `False` automatically, with no error.
- A call supplying the argument by **position** (`Greeter(True)`) matches it to `formal` purely by where it appears in the argument list — correct here, since `formal` is the only parameter besides `self`, but fragile the moment a function has several parameters, since a reader has to check the function's own definition to know what a bare positional value even means.
- A call supplying it by **keyword** (`Greeter(formal=True)`) names the parameter explicitly at the call site — self-documenting, and immune to a parameter's position changing later if the function's signature is ever reordered (as long as the name stays the same).
- Parameters with default values must come *after* parameters without defaults in a function's definition — Python enforces this at definition time, since there would otherwise be no way to tell which arguments a partial positional call was meant to fill.

## CS Lens

A default parameter value is a form of **optional argument** — a real, language-level mechanism distinct from simply overloading a function with multiple signatures (as some languages, like Java, require instead). It lets a single function definition serve both "the common case, with no configuration" and "the less common case, explicitly configured," without duplicating the function's logic across two separately-named versions.

Also recognized in: JavaScript/TypeScript's own near-identical default parameter syntax (`function greet(name, formal = false)`), and, differently, C++/Java's function/method **overloading** (multiple distinct signatures for the same name) achieving a related but not identical goal — Python's single-definition-plus-defaults approach avoids the duplication overloading would otherwise require.

## SE Lens

The real, concrete payoff shows up specifically when a parameter is added to a widely-used function or constructor: giving it a sensible default means every existing call site continues to compile and behave exactly as before, with zero edits required anywhere else in a codebase — verified, not assumed, by confirming existing callers still pass. The alternative (a required new parameter) would force touching every call site immediately, for a feature most of them may not even care about yet — a real, avoidable cost when a sensible default genuinely exists.

## Connection

Builds on `python-classes-instances.md`. Frequently paired with `python-dict-get-method.md`'s own default-value pattern (`dict.get(key, default)`) — both address the same underlying need (a graceful, explicit fallback when something isn't supplied) via different language mechanisms.

## Try It Yourself

1. Add a second parameter with its own default (`def __init__(self, formal=False, language="en"):`) and confirm all of `Greeter()`, `Greeter(formal=True)`, and `Greeter(language="fr")` (skipping the first parameter entirely, by name) all work correctly.
2. Try defining a function with a non-default parameter *after* a default one (`def broken(a=1, b):`) and read the real `SyntaxError` Python produces — confirming this ordering rule is enforced at definition time, not just a style preference.
3. Write a function with three parameters, all with defaults, and call it three different ways: all positional, all keyword, and a mix of both (positional first, then keyword) — confirming Python allows mixing as long as every positional argument comes before every keyword argument in the call.
