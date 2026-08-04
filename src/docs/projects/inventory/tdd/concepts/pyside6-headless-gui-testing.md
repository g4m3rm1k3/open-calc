# Concept: Testing a Real GUI With No Display, and the Singleton It Relies On

**What you'll understand by the end:** how to run real, automated tests
against real Qt widgets in an environment with no screen at all, why
every test in a whole test run has to share one `QApplication`, and the
real GoF pattern — Singleton — that sharing depends on.

**Prerequisites:** `pyside6-qapplication-and-mainwindow.md`,
`automated-testing-unit-test-basics.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Automated tests often run on a machine with no real monitor attached at
all (a CI server, a headless container) — but a real GUI toolkit like
Qt normally expects to talk to a real, present windowing system. Testing
real widget behavior (does clicking this button really fire this
signal?) shouldn't require a real screen to exist. Separately: Qt
enforces a real, hard rule that only one `QApplication` may exist per
process — but a real test suite has many independent test functions,
each of which might naively try to create one.

## The Isolated Example

```python
import sys
from PySide6.QtWidgets import QApplication, QLabel

# QT_QPA_PLATFORM=offscreen (set as a real environment variable before
# this process starts) tells Qt to use its own real "offscreen" backend
# -- it still does everything a normal backend does (layout, painting,
# signal delivery) but never actually opens a window on any real screen.

first = QApplication.instance() or QApplication(sys.argv)
second = QApplication.instance() or QApplication(sys.argv)

print("same object:", first is second)
print("instance() returns it too:", QApplication.instance() is first)

label = QLabel("hi")
print("widget constructed fine with the shared instance:", label.text())
```

**Real output, run this session (with `QT_QPA_PLATFORM=offscreen` set):**
```
same object: True
instance() returns it too: True
widget constructed fine with the shared instance: hi
```

**The real rule this is working around, proven directly** — constructing
a *second*, independent `QApplication` in the same process, without the
`instance() or ...` guard:
```python
import sys
from PySide6.QtWidgets import QApplication

app1 = QApplication(sys.argv)
app2 = QApplication(sys.argv)  # no guard this time
```
**Real error, run this session:**
```
RuntimeError: libshiboken: Please destroy the QApplication singleton before creating a new QApplication instance.
```

**What this proves:** Qt doesn't just *recommend* one `QApplication`
per process — it actively, immediately refuses a second one with a real
runtime error naming it a "singleton" in its own message. `QApplication.
instance() or QApplication(sys.argv)` is the real, correct way multiple
independent test functions can each safely ask for "the application,
creating it only if it doesn't exist yet" without ever risking that
crash.

## Mechanical Walkthrough

- `QT_QPA_PLATFORM=offscreen` is read by Qt itself at process startup,
  before any Python code runs — it selects Qt's own real "offscreen"
  platform plugin, which implements the full real widget/painting/event
  pipeline but never opens an actual OS window.
- `QApplication.instance()` returns the current process's one real
  `QApplication` object if one already exists, or `None` if it doesn't.
- `... or QApplication(sys.argv)` — Python's `or` only evaluates its
  right-hand side if the left side is falsy (`None` counts as falsy) —
  so this line constructs a new `QApplication` *only* when `instance()`
  came back empty, and reuses the existing one otherwise.
- Every test file in a real Qt test suite typically repeats this exact
  `QApplication.instance() or QApplication([])` line at module level —
  each file can be run alone (creating the one real instance itself) or
  as part of a larger suite (reusing whatever earlier file already
  created it), without either case crashing.

## CS Lens

This is a real, checked instance of the GoF **Singleton** pattern: a
class deliberately restricted to at most one real instance per process,
with a real, standard way (`instance()`) to fetch that one instance
from anywhere, rather than constructing a new one each time. Unlike a
textbook, invented Singleton example, this one is enforced by the real
framework itself (the `RuntimeError` above), not merely a convention
the surrounding code agrees to follow.

Also recognized in: a database connection pool's single shared pool
object, a logging framework's single root logger, a game engine's
single active `Scene` manager — anywhere exactly one real, global
coordination point genuinely makes sense and more than one would be
actively wrong, not just wasteful.

## SE Lens

The real, concrete reason this matters for testing specifically: a real
test suite has many independent test files, each wanting to construct
real widgets, and none of them can safely assume whether it's the
*first* one to run in the process or not. `instance() or ...` makes
every file's own setup code correct regardless of run order — running
one test file alone, or the whole suite together, both work identically,
with no test needing to know or care whether some other file already
did this setup. Getting this wrong (each file unconditionally calling
`QApplication(sys.argv)`) doesn't fail quietly — it fails loudly, with
the real `RuntimeError` shown above, the moment two files run in the
same process.

## Connection

Builds on `pyside6-qapplication-and-mainwindow.md` (what a
`QApplication` is and why exactly one must exist).
`get-or-create-pattern.md` names a related but genuinely different real
mechanism (a database-backed "fetch or insert" operation) — checked
directly: that file's own real example commits a new database row when
one doesn't exist yet, a different concrete mechanism (persistence,
not process-wide object identity) from what's happening here, even
though both share the surface shape of "get the existing one, or make
one."

## Try It Yourself

1. Remove the `QT_QPA_PLATFORM=offscreen` environment variable (run the
   first example in a normal, real graphical environment instead) and
   confirm it still works identically — the offscreen platform is an
   optional backend choice, not something the application code itself
   has to know about or branch on.
2. Write a tiny second script that imports and calls a function from
   the first one (reusing its already-created `QApplication` via
   `instance()`), and confirm no second, competing `QApplication` ever
   gets constructed across the two files.
3. Deliberately reproduce the real `RuntimeError` above yourself, then
   fix it using the `instance() or ...` guard, and confirm the error is
   gone — real, hands-on proof of exactly what the guard prevents, not
   just reading about it.
