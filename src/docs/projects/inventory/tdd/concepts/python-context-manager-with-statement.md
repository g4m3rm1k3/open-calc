# Concept: The `with` Statement (Context Managers)

**What you'll understand by the end:** what `with open(path) as f:`
actually guarantees — real cleanup even if an exception occurs inside
the block — contrasted directly with manual `open()`/`.close()`, where
an exception can skip the close call entirely.

**Prerequisites:** `python-try-except.md`.

## Setup

Python 3, no packages needed.

## The Problem

A real, open file handle (or a database connection, a network socket,
a lock) needs to be reliably released when code is done with it — but
"done with it" isn't always a clean, guaranteed path: an exception
raised partway through a block of code can skip right past a cleanup
call written at the end of it, leaving the real resource open longer
than intended, or forever, for the life of the program.

## The Isolated Example

```python
p = "sample.txt"
with open(p, "w") as f:
    f.write("hello")

# WITH a `with` block: the file closes even if an exception happens INSIDE it.
f_ref = None
try:
    with open(p) as f:
        f_ref = f
        raise ValueError("something went wrong mid-block")
except ValueError:
    pass
print("file closed after an exception INSIDE the `with` block?", f_ref.closed)

# WITHOUT `with`, using manual open()/close(): an exception before
# .close() is reached means .close() never runs.
f2 = open(p)
try:
    raise ValueError("something went wrong before close() was reached")
    f2.close()  # never runs -- the exception above skips this line
except ValueError:
    pass
print("file closed after an exception SKIPPED the manual .close() call?", f2.closed)
```

**Real output, run this session:**
```
file closed after an exception INSIDE the `with` block? True
file closed after an exception SKIPPED the manual .close() call? False
```

**What this proves:** the file opened inside a real `with` block was
genuinely **closed** (`f_ref.closed` is `True`) even though a
`ValueError` was raised in the middle of that block, before reaching
the block's own natural end. The manually-opened file, by contrast,
stayed **open** (`f2.closed` is `False`) — the exception was raised
*before* `f2.close()` on the next line ever had a chance to run, so it
simply never executed.

## Mechanical Walkthrough

- `with open(path) as f:` calls `open(path)`, then binds the returned
  file object to `f` for the duration of the indented block — but the
  real, important part is what happens **after** the block, guaranteed:
  the file's `.close()` is called automatically, whether the block
  finished normally *or* an exception propagated out of it.
- This works because a real file object implements the **context
  manager protocol** — two special methods, `__enter__` (called when
  the `with` block starts, its return value becomes what `as f` binds
  to) and `__exit__` (called when the block ends, for **any** reason,
  including an exception) — `with` is the real, dedicated syntax for
  using an object that provides both.
- Manual `open()`/`.close()` has no such guarantee: `.close()` is just
  an ordinary line of code, and ordinary code **after** an exception is
  raised simply never runs — Python doesn't skip forward to find and
  run a "cleanup" line the way `with`'s own protocol does.
- `except ValueError: pass` around each attempt is only there so this
  example's own deliberate exception doesn't crash the whole script —
  the interesting real difference is entirely in what happened to the
  file *before* that `except` block ever ran.

## CS Lens

This is **guaranteed resource cleanup**, also known by the more general
name **RAII** (Resource Acquisition Is Initialization) in languages
like C++/Rust, where a resource's own cleanup is tied structurally to
its scope rather than left to a separately-written, skippable line of
code. Python's `with` statement is its own real, dedicated mechanism
for the identical guarantee, implemented via the `__enter__`/`__exit__`
protocol rather than automatic destructors.

Also recognized in: Java/C#'s `try`-with-resources / `using` blocks
(the identical real guarantee, different keyword); a database
connection pool's context-manager wrapper (`connection-pooling.md`'s
own real resource, released the identical guaranteed way); any
"acquire, use, guaranteed-release" pattern across resource types far
beyond files.

## SE Lens

The real, practical risk manual cleanup carries: in real, more complex
code, a resource can be left open across many possible early-exit paths
— an exception, an early `return`, a `break` out of an enclosing loop
— each one a real, separate place a hand-written `.close()` call could
get skipped. `with` removes the need to reason about every one of
those paths individually; the cleanup guarantee lives in one place (the
object's own `__exit__`), not scattered across every possible exit
point in the calling code.

## Connection

Builds on `python-try-except.md`. Directly relevant to
`python-pathlib-file-reading.md`'s own real, honest note that this
project's code uses both pathlib's `read_text()`/`write_text()`
(internally using `with` already, with no explicit block needed at the
call site) and the classic `with open(...) as f:` idiom directly, when
a method like `.readlines()` is needed. `pyside6-headless-gui-
testing.md`'s `QApplication` and `orm-session-unit-of-work.md`'s
`Session` are both real, separate objects also commonly used as context
managers via `with`, for the identical underlying guarantee applied to
different real resources.

## Try It Yourself

1. Write a small, real class of your own implementing `__enter__` and
   `__exit__` (each just printing a message) and use it in a `with`
   block that raises an exception inside — confirm `__exit__` still
   runs, by seeing its print statement appear before the exception
   propagates further.
2. Look up `contextlib.contextmanager` — a real, common shortcut for
   writing a context manager as a single generator function instead of
   a full class with both dunder methods — and rewrite your class above
   using it.
3. Confirm `f_ref.closed` in the example above by trying to
   `f_ref.read()` after the `with` block ends — read the real
   `ValueError` this raises, confirming "closed" isn't just a reported
   flag but a genuine, enforced state change.
