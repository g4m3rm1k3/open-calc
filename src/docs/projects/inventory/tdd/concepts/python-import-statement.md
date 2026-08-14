# Concept: Python's `import` Statement

**What you'll understand by the end:** the difference between `import module` and `from module import name`, and what actually happens when a file is imported.

**Prerequisites:** none.

## Setup

Python 3, no packages needed. Two files in the same folder.

## The Problem

Code in one file often needs to use functions, classes, or values defined in another file. A language needs a way to say "make that other file's code available here" without copy-pasting it.

## The Isolated Example

`toolbox.py`:
```python
GREETING = "hello"

def shout(text):
    return text.upper()
```

`main.py`, same folder:
```python
import toolbox
from toolbox import shout

print(toolbox.GREETING)
print(shout("world"))
```

**Real output:**
```
hello
WORLD
```

**What this proves:** `import toolbox` made the whole module available under the name `toolbox` — reaching its contents requires the prefix (`toolbox.GREETING`). `from toolbox import shout` instead pulled one specific name directly into `main.py`'s own namespace — usable as `shout(...)`, with no prefix at all. Both statements imported the same file; they differ only in how the imported content is *named* afterward.

## Mechanical Walkthrough

- `import toolbox` — Python finds `toolbox.py`, runs it top to bottom exactly once, and binds the name `toolbox` to the resulting module object. Every name defined at that file's top level becomes an attribute reachable via `toolbox.<name>`.
- `from toolbox import shout` — same underlying process (finding and running `toolbox.py`), but instead of binding the whole module to a name, it binds just `shout` directly, as if `shout = toolbox.shout` had been written.
- A module is only ever actually executed once per program run, no matter how many times it's imported from different files — Python caches the result the first time and reuses it on subsequent imports.

## CS Lens

This is a **namespace** operation — `import toolbox` keeps the imported names inside their own separate namespace (`toolbox.X`), avoiding collisions with names already in the importing file; `from toolbox import X` merges a chosen name directly into the current namespace, trading that collision-safety for shorter references.

Also recognized in: JavaScript's `import { shout } from "./toolbox.js"` (a near-identical two-styles-of-import distinction), Java's `import` statement bringing a class name into scope without a package prefix.

## SE Lens

`from X import Y` is convenient but risks silently colliding with an existing name in the importing file (defining your own `shout` after this import would silently shadow the imported one, with no error). `import X` avoids that entirely at the cost of typing `X.` every time. Real style guides generally prefer `import X` for modules with many things you'll use, and `from X import Y` for a small, specific set of names you'll use often and want short — a real, ongoing readability tradeoff, not a rule with one universally correct answer.

## Connection

The direct mechanism underneath every "borrow code from another file" example already relied upon before this file existed — every `from flask import Flask` and `from core.lexer import tokenize` moment is exactly this.

## Try It Yourself

1. Add a second function to `toolbox.py`, import it with `import toolbox` (not `from`), and try calling it with no prefix (`shout2("x")` instead of `toolbox.shout2("x")`). Read the real `NameError` and confirm it names exactly what's missing.
2. Add a top-level `print("toolbox loaded")` to `toolbox.py`. Import it from two different files run in the same program (one importing the other) and confirm the message prints only once, not twice — proof of the "executed once, cached" behavior.
3. Use `from toolbox import shout as yell` (the `as` keyword, renaming an import) and call it as `yell(...)`. Confirm this works identically to the un-renamed version, just under a different local name.
