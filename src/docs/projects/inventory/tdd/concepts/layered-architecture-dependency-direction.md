# Concept: Layered Architecture & Dependency Direction

**What you'll understand by the end:** why splitting "what the program does" from "how it's exposed over a network" into separate modules — with dependencies only pointing one way — pays off as a project grows.

**Prerequisites:** `python-package-init.md`.

## Setup

Python 3, no packages needed.

## The Problem

A program often has a core piece of logic (what it actually computes) and a delivery mechanism (how a user or another program reaches that logic — a web server, a CLI, a GUI). Writing both directly into the same file works at first, but every later change to *either* concern risks disturbing the other, and testing the logic alone means dragging the delivery mechanism along for no reason.

## The Isolated Example

`core/math_ops.py` — knows nothing about how it will be invoked:
```python
def add(a, b):
    return a + b
```

`cli.py` — the delivery mechanism, knows about `core`, not the other way around:
```python
import sys
from core.math_ops import add

if __name__ == "__main__":
    a, b = int(sys.argv[1]), int(sys.argv[2])
    print(add(a, b))
```

**Real proof `core` has zero knowledge of how it's invoked** — imported and used directly, no CLI involved at all:
```python
from core.math_ops import add
print(add(2, 3))
```
```
5
```

**Run the CLI for real:**
```
python cli.py 2 3
```
```
5
```

**What this proves:** `add` works identically whether called from a plain Python shell or from the command-line wrapper — because `core/math_ops.py` never imports `sys` or anything about how arguments arrive. The dependency only points one direction: `cli.py` imports `core`; `core` never imports `cli.py`.

## Mechanical Walkthrough

- `core/math_ops.py` contains no reference to `sys`, `argv`, or any delivery-specific concept — it's pure computation.
- `cli.py` imports `add` from `core` and handles everything delivery-specific: reading command-line arguments, printing the result in whatever format a terminal expects.
- If a second delivery mechanism were added later (a web route, a GUI button), it would also import from `core` and never the reverse — `core` stays reusable by any number of front ends without changing.

## CS Lens

This is **modularity** combined with a deliberate **dependency direction**: a module (`core`) that exposes only what other code needs and hides how it works internally, arranged so dependencies point one way (outer layers depend on inner ones, never the reverse).

Also recognized in: any layered architecture (a database layer with no knowledge of the UI on top of it), the "domain layer knows nothing about the presentation layer" rule common in enterprise software design, and a game engine's physics module having no idea a renderer even exists.

## SE Lens

The alternative — writing the logic directly inside the CLI script, no separate module — is genuinely less typing for a single, permanent delivery mechanism. The real, concrete cost shows up the moment a second interface is needed (a web API alongside the CLI, or a test suite that wants to exercise the logic with zero CLI machinery involved): both become free the moment the boundary is drawn from the start, and both require an actual refactor — touching every call site — if the boundary is only drawn after the tangle already exists.

## Connection

Builds on `python-package-init.md` (the packaging mechanism that makes a clean `core` boundary possible) and `client-server-architecture.md` (a web-based delivery mechanism is one specific kind of "outer layer" that could sit on top of a `core` like this one).

## Try It Yourself

1. Add a second delivery file, `repl.py`, that imports `add` and runs an interactive loop reading two numbers per line. Confirm `core/math_ops.py` needed zero changes to support a second, completely different way of being invoked.
2. Deliberately break the rule: add `import sys` to `core/math_ops.py` and read a value from `sys.argv` inside `add`. Now try calling `add` from a plain Python shell with no command-line arguments present. Observe the failure, and reason about what it demonstrates about why the dependency direction matters, not just as a style preference.
3. Write a first, minimal automated test for `add` (`assert add(2, 3) == 5`) that imports only from `core` — confirm it runs with no CLI, no `sys.argv`, nothing beyond the pure logic itself.
