# Concept: Python Packages and `__init__.py`

**What you'll understand by the end:** what turns a plain folder of `.py` files into an importable Python package.

**Prerequisites:** `python-import-statement.md`.

## Setup

Python 3, no packages needed.

## The Problem

A single file (a *module*) is fine for a small amount of code. Organizing a larger amount of related code means grouping several files into a folder — but Python needs some signal to treat that folder as one importable unit (a *package*), with a path through it (`folder.file`) mirroring the real directory structure.

## The Isolated Example

```
mypackage/
    __init__.py   (empty)
    greetings.py
```

`mypackage/greetings.py`:
```python
def hello():
    return "hello from the package"
```

From a script in the parent folder:
```python
from mypackage.greetings import hello
print(hello())
```

**Real output:**
```
hello from the package
```

**What this proves:** `mypackage.greetings` as an import path directly mirrors the real folder structure on disk (`mypackage/greetings.py`) — the dot in the import path corresponds to the folder separator on disk, and the presence of `__init__.py` is what makes `mypackage/` importable as `mypackage` at all, rather than just being an ordinary folder Python ignores as an import target.

## Mechanical Walkthrough

- A file named exactly `__init__.py` inside a folder is the traditional signal telling Python "this folder is a package," rather than just a folder that happens to contain `.py` files.
- It can be completely empty, as here — its *presence* is the signal, not its contents (it can also contain real code, run once whenever the package is first imported — not used for that purpose here).
- `from mypackage.greetings import hello` — the path `mypackage.greetings` walks from the package (`mypackage`) into the module inside it (`greetings`), exactly mirroring the folder structure `mypackage/greetings.py` on disk.

## CS Lens

This is a **namespace hierarchy** mechanism — packages nest namespaces the same way folders nest files, letting `greetings` exist inside `mypackage` without colliding with an unrelated `greetings.py` that might exist somewhere else in a large project.

Also recognized in: Java's package-per-folder convention (`com/example/util/Helper.java` importable as `com.example.util.Helper`), and JavaScript/Node's folder-based module resolution.

## SE Lens

Modern Python (3.3+) can actually treat folders without an `__init__.py` as "namespace packages" too, making the file technically optional on current versions. It's still worth including explicitly: it's the unambiguous, widely-recognized convention going back much further than namespace packages, it costs nothing to add, and it removes any doubt — for both the reader and certain older tools — about whether a folder was *meant* to be a package or just happens to contain Python files.

## Connection

Builds on `python-import-statement.md`. Directly enables `layered-architecture-dependency-direction.md` — a clean package boundary is what makes "this module knows nothing about that one" an enforceable, visible structure rather than just a convention held in someone's head.

## Try It Yourself

1. Delete `__init__.py` entirely and try the same import again. On a modern Python version, does it still work? Look up "namespace packages" to understand why, and what's genuinely different about a package with an explicit `__init__.py` versus one relying on this newer, implicit behavior.
2. Add a second module, `mypackage/farewells.py`, with its own function, and import from both `mypackage.greetings` and `mypackage.farewells` in the same script.
3. Put a real statement inside `__init__.py` — e.g. `print("mypackage loaded")` — and import something from `mypackage.greetings`. Confirm the print statement runs even though nothing explicitly imported `mypackage` itself, only a module inside it — proof that importing a submodule always runs the package's own `__init__.py` first.
