# Concept: Singleton Pattern

**What you'll understand by the end:** how to make a class that
guarantees, mechanically, that only one instance of it can ever exist —
and why some kinds of objects genuinely need that guarantee.

**Prerequisites:** `python-classes-instances.md`.

## Setup

Python 3, no packages needed.

## The Problem

Some objects represent something there is only ever meaningfully *one*
of at real runtime — a connection to the one printer attached to a
machine, the one configuration loaded for this run, the one event loop
coordinating an entire application. Nothing in an ordinary class stops
a programmer from accidentally writing `Printer()` twice and ending up
with two separate objects both claiming to represent the same real,
single piece of hardware — a real bug, not a hypothetical one, and one
that's easy to introduce by accident in a large codebase where it isn't
obvious a second instance was ever created.

## The Isolated Example

```python
class PrinterConnection:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            print("creating the real connection (first time only)")
            cls._instance = super().__new__(cls)
        else:
            print("reusing the existing connection")
        return cls._instance


first = PrinterConnection()
second = PrinterConnection()
print("same object?", first is second)
```

**Real output:**
```
creating the real connection (first time only)
reusing the existing connection
same object? True
```

**What this proves:** calling `PrinterConnection()` twice did not
produce two different objects. The second call's own printed message —
"reusing the existing connection" — proves it took a genuinely different
path than the first call, and `first is second` (Python's identity
check, confirming both names point at the exact same object in memory,
not just two equal-looking ones) confirms there is truly only one real
`PrinterConnection` in existence, no matter how many times the class is
called.

## Mechanical Walkthrough

- `_instance = None` is a **class attribute** — shared by the class
  itself, not per-instance like `python-classes-instances.md`'s
  `self.count`. There's exactly one `_instance` slot for the whole
  class, not one per object.
- `__new__` is the method Python actually calls to *create* a new
  object, one step before `__init__` would run to initialize it — this
  example overrides that earlier step directly, rather than relying on
  `__init__`, because by the time `__init__` runs an instance already
  exists; `__new__` is the only point early enough to hand back an
  *existing* object instead of building a new one.
- The first call finds `cls._instance is None`, so it actually builds a
  new object (`super().__new__(cls)`) and saves it on the class.
- The second call finds `cls._instance` is no longer `None` — it skips
  building anything new and simply returns the object saved from the
  first call.

## Execution Trace

Two calls, traced against the real output above:

```
PrinterConnection()  [1st call]
  cls._instance is None? Yes
    → print "creating the real connection (first time only)"
    → cls._instance = a brand-new object (call it OBJ-A)
  → returns OBJ-A

PrinterConnection()  [2nd call]
  cls._instance is None? No (it's OBJ-A)
    → print "reusing the existing connection"
  → returns OBJ-A (the SAME object, not a new one)

first is second → first is OBJ-A, second is OBJ-A → True
```

Both `first` and `second` end up bound to the identical object, `OBJ-A`
— the second call never reached the branch that builds anything new.

## CS Lens

This is the **Singleton pattern**: a class that enforces, in its own
construction logic, that at most one instance of it can ever exist for
the lifetime of the program. The enforcement lives inside the class
itself — nothing about *calling* `PrinterConnection()` looks unusual;
the guarantee comes entirely from what happens mechanically inside
`__new__`.

Also recognized in: a database connection pool's single pool manager, a
logging system's one global logger, an operating system's one process
table — anywhere exactly one real, shared thing needs exactly one
software object representing it, with no ambiguity about which object
is the authoritative one.

## SE Lens

Singleton is one of the more debated design patterns in real software
engineering, precisely because the guarantee it enforces (*global*,
program-wide uniqueness) is also a real cost: any code anywhere in the
program can reach the singleton and depend on its current state, which
makes testing harder (two tests can't each get their own fresh instance
without extra work) and hides a real dependency behind what looks like
an ordinary constructor call. It's the right tool specifically when a
real external resource — one printer, one open event loop, one
configuration file actually loaded — genuinely is singular at runtime,
not merely "a value I'd rather not pass around explicitly."

## Connection

Builds on `python-classes-instances.md`'s constructor mechanics —
knowing how an ordinary `Counter()` call builds a new instance is what
makes it clear *why* overriding `__new__` here is unusual: it's the
same call syntax, deliberately made to sometimes skip building anything
new at all.

## Try It Yourself

1. Add a real piece of state to `PrinterConnection`, set once inside the
   `if cls._instance is None:` branch (e.g. `cls._instance._jobs_sent =
   0`), and increment it through `first`. Confirm reading it through
   `second` shows the same, updated value — direct proof they're the
   same object, not just equal.
2. Remove the `if cls._instance is None:` check entirely (always build a
   new object). Rerun the example and confirm `first is second` now
   prints `False` — seeing the guarantee actually fail is often more
   convincing than seeing it hold.
3. Research why Python's `None`, `True`, and `False` are themselves real,
   built-in singletons — confirm with `x = None; y = None; print(x is
   y)` — and connect this to why `is None` (identity) is the correct way
   to check for `None` in Python, rather than `== None` (equality).
