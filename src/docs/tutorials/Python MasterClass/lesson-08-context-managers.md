# Lesson 8: Context Managers and `with` — Resource Lifetime as a Protocol

**What you will build.** You'll open a real file, write to it, and
deliberately trigger a crash between opening and closing it — then
check, directly, whether that file was actually left open. You'll fix
that leak with `try`/`finally`, then prove `with` does the identical
fix automatically, even when an exception happens inside its block.
You'll build a custom class implementing `__enter__` and `__exit__` by
hand, watch the exact order Python calls them in — including on a
crash — and prove one sharp, easy-to-misuse fact: `__exit__` can
choose to *swallow* an exception outright, just by returning `True`.
Finally, you'll give the project's `TaskList` real persistence — saving
to and loading from an actual JSON file on disk, using `with` to
guarantee the file gets closed correctly either way. The transferable
problem: "resource" here means anything with a lifetime that has to be
explicitly ended — a file handle, a database connection, a network
socket, a lock — and every language you'll touch next has its own
answer to "how do I guarantee cleanup happens, even when something goes
wrong." C#'s `using` statement and `IDisposable`, Java's
try-with-resources and `AutoCloseable`, are the identical idea, often
using nearly the same two-method shape this lesson builds by hand.
Once you've watched Python call `__exit__` on a crash path yourself,
those other languages' versions won't need re-deriving — you'll
recognize the shape on sight.

**What you need to know first.** Lesson 5's iterator protocol as a
model for what a *protocol* actually is in Python — a documented
contract of specific dunder methods that Python's own syntax calls
automatically, rather than something built into the language with no
way for your own code to opt in. This lesson's entire argument is that
`with` works the identical way, on a different two-method contract, and
that argument only lands for someone who's already seen Lesson 5 prove
the same shape for `for`. Lesson 5's exception-handling pattern
(`try`/`except`) is also reused directly, and extended here with
`finally`, a clause this curriculum hasn't used until now.

**Terms used in this lesson**

- **Resource** — anything acquired that has to be explicitly released
  when you're done with it — an open file handle, a network
  connection, a lock — where forgetting to release it causes a real,
  observable problem (a file left open, a connection left dangling).
  This term exists because it's the general category this entire
  lesson is about protecting; a file is this lesson's concrete example,
  but the mechanism applies to anything sharing this same shape.
- **`try`/`finally`** — an extension of the `try`/`except` pattern
  Lesson 5 already established: a `finally` clause's body runs no
  matter what happens in the `try` block — whether it completes
  normally, raises an exception that's caught, or raises one that
  isn't. This term exists because it's the manual, general-purpose fix
  this lesson's first unit builds by hand, before proving `with` does
  the identical job automatically.
- **Context manager** — an object implementing both `__enter__` and
  `__exit__` (both defined below), making it usable directly with a
  `with` statement. This term exists to name the category of object
  `with` actually requires — the same relationship "iterable" has to
  `for`, established in Lesson 5, applied here to a different protocol.
- **`__enter__`** — a dunder method (Lesson 5 introduced this term in
  full; restated per the Repetition Rule) that a context manager must
  define, called automatically at the very start of a `with` block,
  before its body runs; whatever it returns is bound to the name after
  `as`, if one is given. This term exists as the first half of the
  context-manager protocol: it's the method `with` calls to set up
  whatever resource the block is about to use.
- **`__exit__`** — a dunder method that a context manager must define,
  called automatically when a `with` block ends — for any reason at
  all, including an exception propagating out of the block — receiving
  information about that exception (or `None`s, if none occurred) as
  its arguments. This term exists as the second half of the protocol:
  it's the method `with` calls, unconditionally, to release whatever
  `__enter__` set up, and it's this method's own return value that
  determines whether an exception, if there was one, keeps propagating
  or gets silently stopped.
- **The `with` statement** — syntax (`with expr as name:`) that calls
  the given expression's `__enter__`, runs its own indented block, and
  guarantees `__exit__` is called when that block ends, regardless of
  how it ends. This term exists to name the actual syntax this whole
  lesson is reverse-engineering, the same way Lesson 5 reverse-
  engineered `for`.
- **Exception suppression** — the specific, deliberate behavior where a
  context manager's `__exit__` returns a truthy value, causing the
  exception that triggered it to stop propagating entirely, as if it
  had never been raised. This term exists because this lesson's second
  unit proves this behavior directly, and it's sharp enough, and rare
  enough as a legitimate need, to deserve its own name rather than
  being folded into "what `__exit__` does" generically.

**Objects and methods used**

- **`open`**
  - *What it is:* A built-in function, available everywhere with no
    import.
  - *Implementation:* `open(file, mode='r') -> file object`. Takes a
    path and an optional mode string (`'r'` for reading, `'w'` for
    writing, and others this lesson doesn't use); returns a file
    object representing the open file.
  - *Its use:* This lesson's entire first two units are built around
    exactly the resource `open()` acquires — a real, limited operating-
    system resource (an open file handle) that has to be explicitly
    released with `.close()` — making it a concrete, observable stand-in
    for "resource" in general.
  - *Type:* A built-in free function.
  - *Responsibility:* Its full charter is asking the operating system to
    open the given file in the given mode, and returning a Python
    object wrapping that open connection — nothing about ensuring it
    later gets closed; that's left entirely to the calling code, which
    is precisely this lesson's whole subject.
  - *Depends on:* A file path, and a mode string determining whether the
    file is opened for reading, writing, or another mode this lesson
    doesn't cover.
  - *Connects to:* Called directly throughout this lesson's labs and in
    the project's own `save`/`load` methods; the returned file object is
    what `.write()`, `.close()`, and, per this lesson's second unit,
    `__enter__`/`__exit__` are all called on.
  - *Shape:* A file object — itself a context manager, per this
    lesson's second unit's own proof — with a real `.closed` boolean
    attribute reporting whether it's currently open.

- **`json.dump`**
  - *What it is:* A function from Python's standard-library `json`
    module (imported via `import json`, the same mechanism Lesson 4
    established for `tasks.py` itself being imported by `main.py`, now
    applied to a module that ships with Python itself rather than one
    this curriculum wrote).
  - *Implementation:* `json.dump(obj, fp)`. Takes a Python object (here,
    always a `list` of `dict`s) and an already-open, writable file
    object; converts the given object into JSON text and writes that
    text directly into the file.
  - *Its use:* The project's `TaskList.save` needs to convert its own
    internal list of task dicts into a real, persisted text
    representation — `json.dump` is the standard-library tool for
    exactly that, requiring no hand-written text formatting at all.
  - *Type:* A free function, defined inside the `json` module (a
    function belonging to a module's own namespace, per Lesson 4's
    proof that a module's names are ordinary attribute access into its
    `__dict__` — `json.dump` is retrieved from `json`'s namespace the
    identical way `tasks.create_task` would be).
  - *Responsibility:* Its full charter is serializing the given Python
    object into JSON text and writing that text into the given,
    already-open file — it does not open or close the file itself; the
    caller is responsible for both, which is exactly why this lesson's
    project code wraps this call in a `with` statement.
  - *Depends on:* The Python object to serialize (must be built from
    JSON-representable types — dicts, lists, strings, numbers,
    booleans, and `None`, which every task dict in this project already
    is), and an already-open file object, opened in a writable text
    mode.
  - *Connects to:* Called inside `TaskList.save`, given `self._tasks`
    and the file object a `with open(path, "w") as f:` block provides;
    writes directly into that file's underlying stream.
  - *Shape:* Returns `None` — like `print()`, its value lies entirely in
    its side effect (writing text into the given file), not in a
    returned value.

- **`json.load`**
  - *What it is:* A function from the same `json` module.
  - *Implementation:* `json.load(fp) -> object`. Takes an already-open,
    readable file object; reads its entire contents, parses them as
    JSON text, and returns the resulting Python object.
  - *Its use:* The project's `TaskList.load` needs to reconstruct the
    exact list-of-dicts structure `json.dump` originally wrote —
    `json.load` is the exact inverse operation.
  - *Type:* A free function, defined inside the `json` module.
  - *Responsibility:* Its full charter is reading and parsing whatever
    JSON text is in the given file, and returning the equivalent Python
    object — a JSON array becomes a `list`, a JSON object becomes a
    `dict`, exactly mirroring what `json.dump` would have produced from
    them.
  - *Depends on:* An already-open file object, opened in a readable
    text mode, containing valid JSON text.
  - *Connects to:* Called inside `TaskList.load`, given the file object
    a `with open(path, "r") as f:` block provides; its return value is
    bound directly to `self._tasks`, replacing whatever that instance's
    task list held before.
  - *Shape:* For this project's own saved files specifically, always a
    `list` of `dict`s — the exact shape `self._tasks` already has,
    reconstructed faithfully from the saved JSON text.

**Everything else in the file, not this lesson's subject but still explained.**

- **`print`, `type`, `isinstance`**
  - All fully covered in previous lessons and reappearing here
    unchanged; used throughout this lesson's labs exactly as already
    established.
- **`len`**
  - The same built-in briefly named (though not fully treated) back in
    Lesson 3's second unit's `len("hello")` example — given its own
    full treatment here, on its first real use in this curriculum:
    `len(x) -> int`, a built-in free function reporting how many
    elements `x` contains (for a `list`, the number of items; for a
    `str`, the number of characters); used in this lesson's project
    code, via `len(list(reloaded_tasks))`, to confirm a round-tripped
    `TaskList` holds the same number of tasks as the original.

---

## Concept Unit: The Problem `try`/`finally` Exists to Solve

### The Problem

Every file this curriculum has opened so far — none, until now — would
need, at minimum, an `open()` call and a matching `.close()` call once
you're done with it. What happens, concretely, if something goes wrong
*between* those two calls — an exception raised while the file is still
open? Does the file get closed anyway, as some kind of automatic
cleanup, or does it stay open, genuinely leaked, for as long as the
program keeps running?

> **Before reading on:** picture opening a file, writing to it, then
> immediately raising an exception — on purpose — before the matching
> `.close()` call is ever reached. Nothing about `try`/`except` (Lesson
> 5) that this curriculum has used so far promises anything runs
> *unconditionally* — an `except` block only runs if its specific
> exception type is actually raised and caught. Given that, what do you
> predict happens to the open file object in this scenario — does
> Python close it automatically as part of handling the exception, or
> does the `.close()` line simply never run, exactly like any other
> line of code after a `raise` that isn't reached?

### Isolating the Concept

```python
f2 = open("test2.txt", "w")
try:
    f2.write("hello")
    raise RuntimeError("simulated crash")
    f2.close()
except RuntimeError as e:
    print(e)
print(f2.closed)
```

Real output:

```
caught: simulated crash
f2.closed: False
```

`f2.closed` is `False` — the file genuinely was left open. `raise
RuntimeError(...)` immediately transfers control to the matching
`except` clause; the `f2.close()` line directly below it, inside the
same `try` block, never runs at all, exactly like any other
unreachable code after a `raise`. This is a real **resource leak**
(the concrete failure "resource," defined in Terms, above, is named
for): `f2`, this specific open file handle, stays open for as long as
the program keeps running, or until the operating system itself cleans
it up when the process eventually ends — neither of which is something
well-behaved code should rely on.

The fix:

```python
f3 = open("test3.txt", "w")
try:
    try:
        f3.write("hello")
        raise RuntimeError("simulated crash again")
    finally:
        f3.close()
except RuntimeError as e:
    print(e)
print(f3.closed)
```

Real output:

```
caught: simulated crash again
f3.closed: True
```

Adding a `finally:` clause (part of **`try`/`finally`**, defined in
Terms, above) changes this completely: `f3.close()`, inside `finally`,
runs *unconditionally* — whether the `try` block completes normally or
raises an exception, `finally`'s body always runs before control leaves
this construct. Here, `f3.close()` runs the moment `RuntimeError` is
raised, *before* that exception continues propagating outward to the
outer `except RuntimeError as e:` that ultimately catches and prints
it. `f3.closed` being `True` proves it directly: the file was correctly
closed despite the crash, unlike `f2` in the version with no `finally`
at all.

### Discarding the Example

All three throwaway scripts shown here — the clean manual open/close,
the leaking version, and the `try`/`finally`-fixed version — are
deleted now and won't appear in later lessons or project code. They
existed only to make a real resource leak observable, and to prove the
manual fix for it.

### Project Change

No project change in this unit — this unit establishes the problem
`with` exists to solve, using the manual `try`/`finally` fix; the
project's own file handling, using `with` directly rather than manual
`try`/`finally`, arrives in this lesson's third unit.

### Mechanical Walkthrough

- `f2 = open("test2.txt", "w")` — a call to the `open` built-in (full
  treatment in Objects and methods, above), given a file path and the
  mode string `"w"` (opens the file for writing, creating it if it
  doesn't exist, or overwriting it if it does); the returned file
  object is bound to `f2`.
- `f2.write("hello")` — a call to the file object's own `.write()`
  method (genuinely narrow to this lab's own use of it — writes the
  given string into the file's contents; not a subject of its own in
  this curriculum), writing the text `"hello"`.
- `raise RuntimeError("simulated crash")` — the `raise` keyword
  (Lesson 2, restated per the Repetition Rule), constructing and
  raising a `RuntimeError` (a built-in exception class this curriculum
  hasn't used by this exact name before, though structurally identical
  in role to Lesson 2's `TypeError`: a general-purpose exception for a
  problem that doesn't fit any more specific built-in category) with
  the given message.
- `f2.close()`, immediately after the `raise` — never executes; this is
  the crux of this unit's own finding, made visible by placing this
  call directly after an unconditional `raise` inside the same block.
- `except RuntimeError as e:` — an `except` clause (Lesson 5, restated
  per the Repetition Rule), catching the raised `RuntimeError`.
- `print(e)` — `print` (Lesson 1, restated per the Repetition Rule),
  given the caught exception object.
- `print(f2.closed)` — `print`, given `f2.closed`, a plain boolean
  attribute every file object carries, reporting whether `.close()` has
  actually been called on it.
- `f3 = open("test3.txt", "w")` — the same pattern as `f2`'s, opening a
  second file.
- `try:` (outer), `try:` (inner), `finally:` — a nested `try`
  construct: the inner `try`/`finally` guarantees `f3.close()` runs
  regardless of what happens inside the inner `try` block; the outer
  `try`/`except RuntimeError as e:` is what actually catches the
  exception once it propagates out past the inner block's `finally`.
- `f3.write("hello")`, `raise RuntimeError(...)` — the identical
  operations as `f2`'s version.
- `finally:` / `f3.close()` — the `finally` clause (defined in Terms,
  above) and its body: this runs unconditionally, the instant the
  `raise` above transfers control out of the inner `try` block, before
  that exception is allowed to propagate any further outward.
- `except RuntimeError as e:` (outer) / `print(e)` — catches the
  exception *after* `finally`'s body has already run, and prints it.
- `print(f3.closed)` — confirms, via the same `.closed` attribute, that
  `f3` really was closed this time.

### CS Lens

This is a hard concept — guaranteed cleanup in the presence of
exceptions — so, per the Repetition Rule, several unrelated
recurrences:

```
Also recognized in: C#'s `finally` block (identical name, identical
guarantee — runs regardless of how a try block exits, including via an
exception or an early return), Java's `finally` (the same construct,
predating both Python's and C#'s versions and a direct influence on
both), database transaction rollback-on-error handling generally
(guaranteeing a partially-completed operation is cleaned up rather than
left in an inconsistent state, regardless of what specifically failed),
and RAII (Resource Acquisition Is Initialization) in C++ (a different
mechanism — tying resource release to an object's destructor rather
than to a language keyword — solving the identical underlying problem:
guaranteed cleanup regardless of how a scope is exited)
```

### SE Lens

The alternative — relying on programmer discipline alone, always
remembering to call `.close()` at the correct point, with no language
support for guaranteeing it — was rejected because, as this unit's own
first lab demonstrates concretely, that discipline genuinely fails the
moment an exception can occur between acquisition and release, which is
essentially always true in real code: any line, including ones that
look completely unrelated to file handling, could potentially raise.
`try`/`finally` is Python's answer, and it works — but the real cost,
which sets up this lesson's next unit directly: writing it correctly,
by hand, every single time a resource needs guaranteed cleanup, is
verbose and easy to get subtly wrong (nesting it incorrectly, or
forgetting it entirely on a resource that doesn't obviously "look like"
a resource) — exactly the kind of repetitive, error-prone pattern a
language feature built specifically around it would be worth having.

### Commands Needed

Run the same way as every previous lesson: `python3 lab1.py`. Nothing
new.

### Run It

Already shown and verified above, under "Isolating the Concept," for
all three parts of this unit's lab.

### Connection

This unit proved the exact problem — and the exact manual fix —
`try`/`finally` provides for guaranteed cleanup. The next unit asks
whether Python offers a more compact, purpose-built way to express this
same guarantee, specifically for the common case of "acquire a
resource, use it, release it" — and whether that mechanism is itself
just another protocol, the same shape Lesson 5 already proved `for`
to be.

---

## Concept Unit: `with` and the Context Manager Protocol

### The Problem

The previous unit's fix — a `try`/`finally` wrapped around every use of
a resource — works, but requires writing that same nested structure by
hand every single time. `with open(...) as f:` is syntax this
curriculum has never used, but resembles something narrower and more
purpose-built. Does `with` actually *do* the identical `try`/`finally`
guarantee automatically, or something different? And if it does the
same thing, what would a type have to provide for `with` to work on it
— the same kind of question Lesson 5 asked about `for` and `__iter__`?

> **Before reading on:** Lesson 5 proved `for` works uniformly on any
> type providing `__iter__` and `__next__` — a documented protocol, not
> special-cased machinery for specific built-in types. If `with` works
> the identical way, on some different pair of methods, what would you
> guess those two methods are named, given Python's own dunder-method
> naming convention already established for `__iter__`/`__next__`? And
> what job would each of those two methods need to do, given everything
> the previous unit already proved about what `with` needs to
> guarantee?

### Isolating the Concept

```python
try:
    with open("test5.txt", "w") as f5:
        f5.write("data")
        raise RuntimeError("boom")
except RuntimeError as e:
    print(e)
print(f5.closed)
```

Real output:

```
caught: boom
f5.closed: True
```

`with` alone — no explicit `try`/`finally` written anywhere in this
code — produces the identical guarantee the previous unit's manual
version required: `f5.closed` is `True`, even though `RuntimeError` was
raised *inside* the `with` block, before the block's natural end. This
is called **the `with` statement** (defined in Terms, above): it
performs the previous unit's exact `try`/`finally` pattern
automatically, calling the file object's own cleanup logic no matter
how the block ends.

A custom class exposes the actual mechanism directly:

```python
class Resource:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        print(f"acquiring {self.name}")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        print(f"releasing {self.name}")
        return False

with Resource("A") as r:
    print("using", r.name)
```

Real output:

```
acquiring A
using A
releasing A
```

`Resource` implements two dunder methods: `__enter__` (defined in
Terms, above) and `__exit__` (defined in Terms, above) — together,
this pair is called the **context manager** (defined in Terms, above)
protocol, and `Resource` is a context manager because it implements
both. The output's exact order proves the mechanism directly: `with
Resource("A") as r:` calls `__enter__()` first (printing `"acquiring
A"`), binds whatever it returns — `self`, here — to `r` (the name after
`as`), runs the block's body (printing `"using A"`), and then calls
`__exit__(...)` (printing `"releasing A"`) once the block ends.

A second run of `Resource` proves this order holds even on a crash:

```python
try:
    with Resource("B") as r:
        print("using", r.name)
        raise ValueError("oops")
except ValueError as e:
    print(e)
```

Real output:

```
acquiring B
using B
releasing B
caught: oops
```

`"releasing B"` prints *before* `"caught: oops"` — `__exit__` runs the
instant the exception propagates out of the `with` block's body,
exactly like the previous unit's `finally` clause, before that
exception is allowed to continue outward to the `except` that
ultimately catches it. `__exit__`'s three parameters — `exc_type`,
`exc_value`, `traceback` — are how it receives information about
whatever exception (if any) is currently propagating; here, they'd
carry real values describing the `ValueError`, though `Resource`'s own
`__exit__` doesn't use them for anything beyond accepting them.

The sharpest fact this unit builds toward:

```python
class Suppressor:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        print("suppressing:", exc_type)
        return True

with Suppressor():
    raise ValueError("this should be suppressed")
print("we get here because the exception was suppressed")
```

Real output:

```
suppressing: <class 'ValueError'>
we get here because the exception was suppressed
```

No `try`/`except` surrounds this `with` block at all, and yet the
raised `ValueError` never propagates past it — the very next line after
the `with` block runs normally. This is called **exception suppression**
(defined in Terms, above): `__exit__` returning `True` (rather than
`Resource`'s `False`) tells `with` to treat the exception as fully
handled, right here, and not let it propagate any further — a real,
deliberate capability, and, per this lesson's SE Lens below, a
genuinely dangerous one to reach for carelessly.

### Discarding the Example

All throwaway code shown here — the `with open(...)` crash
demonstration, `Resource`, and `Suppressor` — is deleted now and won't
appear in later lessons or project code. It existed only to isolate,
in the smallest possible form, exactly what `with` calls, in what
order, and exactly what `__exit__`'s return value controls.

### Project Change

No project change in this unit — the project's own use of `with`,
applied to real file persistence, arrives in the next unit.

### Mechanical Walkthrough

- `with open("test5.txt", "w") as f5:` — the `with` statement (defined
  in Terms, above): evaluates `open("test5.txt", "w")` (full treatment
  in Objects and methods, above), calls the resulting file object's own
  `__enter__()` (provided automatically by Python's built-in file type,
  with no code of this lesson's own defining it — the identical
  "automatically provided" relationship Lesson 6 proved for a generator
  object's `__iter__`), binds whatever it returns (the file object
  itself, for a real file) to `f5`, and guarantees its `__exit__()` will
  be called once this block ends.
- `f5.write("data")` — the same `.write()` method as the previous
  unit's `f2.write(...)`.
- `raise RuntimeError("boom")` — the same `raise` mechanism as the
  previous unit; here, this is what triggers `f5`'s `__exit__()` to run
  automatically, closing the file, before the exception continues
  propagating to the surrounding `except`.
- `class Resource:` — a `class` statement (Lesson 4, restated per the
  Repetition Rule).
- `def __init__(self, name):` / `self.name = name` — a method
  definition and instance-attribute assignment (Lesson 5, restated per
  the Repetition Rule), storing the given `name`.
- `def __enter__(self):` — a method definition; `__enter__` (defined in
  Terms, above) takes only `self`.
- `print(f"acquiring {self.name}")` — `print` (Lesson 1, restated per
  the Repetition Rule), given an f-string (Lesson 2, restated per the
  Repetition Rule) interpolating `self.name`.
- `return self` — a `return` statement (Lesson 2) whose value is the
  instance itself — this is what gets bound to `r` in `with
  Resource("A") as r:`; `__enter__` could, in principle, return a
  completely different object instead, but returning `self` is a common
  and here-chosen convention letting the `with` block access the
  resource's own attributes directly through the `as`-bound name.
- `def __exit__(self, exc_type, exc_value, traceback):` — a method
  definition; `__exit__` (defined in Terms, above) takes `self` plus
  three additional parameters, automatically supplied by `with` itself:
  `exc_type` (the exception's class, or `None` if the block ended
  without one), `exc_value` (the actual exception object, or `None`),
  and `traceback` (an object describing where the exception occurred,
  or `None`) — this lesson doesn't inspect any of the three directly
  beyond accepting them, but their presence is what makes `__exit__`
  aware of whether, and how, the block it's cleaning up after actually
  failed.
- `print(f"releasing {self.name}")` — `print`, given an f-string.
- `return False` — a `return` statement whose value, `False`, tells
  `with` not to suppress any exception that was propagating — if one
  was, it continues propagating past this `with` block exactly as if
  `__exit__` hadn't run at all (beyond the fact that it did run, for
  its own cleanup side effect).
- `with Resource("A") as r:` — constructs a `Resource` instance
  (Lesson 5, restated per the Repetition Rule: calling a class
  constructs a new instance and calls `__init__` on it), immediately
  used as the `with` statement's context manager: calls its
  `__enter__()`, binds the result to `r`.
- `print("using", r.name)` — inside the block, `print` given two
  arguments, accessing `r.name` via attribute access (Lesson 4,
  restated per the Repetition Rule).
- `class Suppressor:` / its `__enter__`/`__exit__` — the identical
  method-definition mechanism as `Resource`'s, except `__exit__` here
  `return True` instead of `False`.
- `with Suppressor():` — no `as` clause here at all; a `with` statement
  doesn't require binding `__enter__`'s return value to any name if the
  block's body doesn't need to reference it — `Suppressor.__enter__`
  still runs, its return value is simply discarded.
- `raise ValueError(...)`, inside the `Suppressor` block — raises the
  exception; per this unit's own finding, `Suppressor.__exit__`'s
  `return True` is what stops this exception from propagating any
  further once `__exit__` finishes running.
- `print("we get here because the exception was suppressed")` — this
  line, directly after the `with` block, with no surrounding
  `try`/`except` anywhere in this script, runs normally — direct proof
  the exception genuinely never propagated past the `with` statement at
  all.

### Execution Trace

A timing/control-flow trace for `with Resource("B") as r:` and its
crash, since the entire point is exactly *when* `__exit__` runs
relative to the exception's own propagation:

1. `Resource("B")` constructs a new instance; `__init__` runs, setting
   `self.name` to `"B"`.
2. `with` calls this instance's `__enter__()`: prints `"acquiring B"`;
   returns `self`; `r` is bound to it.
3. The block's body runs: prints `"using B"`; then
   `raise ValueError("oops")` executes.
4. Because an exception was just raised inside the `with` block's body,
   `with`'s own machinery calls `__exit__(ValueError, <the actual
   ValueError instance>, <a traceback object>)` — not the `(None, None,
   None)` it would have called with had the block ended normally.
   `__exit__` runs: prints `"releasing B"`; `return False`.
5. Because `__exit__` returned `False` (a falsy value), `with` does not
   suppress the exception — it re-raises the same `ValueError`,
   continuing its propagation exactly as if `__exit__` had never run,
   beyond having already performed its own cleanup side effect.
6. That propagating `ValueError` reaches the surrounding
   `except ValueError as e:`, which catches it and prints `"caught:
   oops"`.

### CS Lens

This is a hard concept — a second protocol, distinct from Lesson 5's
iterator protocol, built on the identical underlying idea of a fixed
dunder-method contract Python's own syntax calls automatically — so,
per the Repetition Rule, several unrelated recurrences:

```
Also recognized in: C#'s IDisposable interface and using statement
(Dispose() playing __exit__'s role, called automatically when a using
block ends, including on exception — C# has no direct equivalent of
__enter__, since the object being disposed is typically already fully
constructed before the using block begins), Java's AutoCloseable
interface and try-with-resources (close() playing the identical role,
automatically called when the try block ends), the RAII pattern in
C++ again (this time specifically as an alternative protocol shape:
tying release to object destruction rather than to a dedicated
exit-method call, achieving the identical unconditional-cleanup
guarantee through a different mechanism), and database connection
pooling libraries generally, across nearly every language (a checked-
out connection is very often wrapped in exactly this
acquire/use/guaranteed-release shape, regardless of which specific
language's syntax expresses it)
```

### SE Lens

The alternative — never exposing `__exit__`'s return value as a
suppression mechanism at all, and simply always letting an exception
propagate through a `with` block regardless of what its context manager
does — was rejected because there are genuine, if uncommon, legitimate
uses for suppression (a context manager specifically designed to
convert certain expected exceptions into silent no-ops, for instance,
which Python's own standard library provides a ready-made version of,
`contextlib.suppress`, built on exactly this mechanism). The real,
sharp cost this unit's own `Suppressor` example demonstrates directly:
a context manager whose `__exit__` returns a truthy value for the
*wrong* reason — a bug, not a deliberate design choice — silently
swallows real errors with no trace at all; `Suppressor`'s own output
shows this plainly: the `ValueError`, and whatever real problem it was
reporting, simply vanishes, and code after the `with` block continues
running as if nothing happened. This is a much more dangerous failure
mode than an uncaught exception crashing the program loudly, which is
exactly why nearly every real context manager, including every one this
lesson has shown besides `Suppressor` itself, `return False` (or
`return None`, which is falsy and behaves identically) — suppression is
something to reach for deliberately and rarely, never as an accidental
default.

### Commands Needed

Run the same way as every previous lesson: `python3 lab2.py`. Nothing
new.

### Run It

Already shown and verified above, under "Isolating the Concept" and
"Execution Trace."

### Connection

This unit proved `with` is a real protocol — `__enter__` and
`__exit__`, called automatically, with `__exit__`'s return value
controlling exception propagation — built on the identical
"documented dunder-method contract" shape Lesson 5 already established
for iteration. The next unit applies this directly to the project: real
persistence, using `with` to guarantee a file gets closed correctly
whether saving or loading succeeds or fails.

---

## Concept Unit: `save()` and `load()` — Real Persistence for the Project

### The Problem

Every previous lesson's project run has started from scratch — `task_a`
and `task_b` are rebuilt, from the same hardcoded values, every single
time `main.py` runs. A real task-tracking program needs to remember its
tasks between runs: save them somewhere, and load them back later.
Given everything this lesson has just proven about `with` and file
objects, what would `TaskList.save`, writing its own tasks out to a
real file, and `TaskList.load`, reading them back in, actually need to
look like?

> **Before reading on:** `self._tasks`, inside `TaskList`, is a plain
> `list` of `dict`s. Saving that to a file means turning it into some
> kind of text representation, and loading means turning that text back
> into the identical structure. Python's standard library ships a
> module, `json`, built for exactly this — converting between Python's
> own `dict`/`list`/`str`/`int`/`bool` structures and a standard text
> format. Given this lesson's own proof that a file object is itself a
> context manager, what should `save`'s own use of `open()` look like —
> a bare `open(...)` call with a manual `.close()`, the way this
> lesson's first unit's manual version worked, or something built on
> what this lesson's second unit actually proved is the safer,
> guaranteed-cleanup way to use one?

### Isolating the Concept

The mechanism this unit needs was already fully isolated in this
lesson's second unit — `with open(path, mode) as f:`, guaranteeing the
file is closed whether the code inside the block succeeds or raises.
No further throwaway lab is needed before applying it directly to real
persistence, combined with the standard library's own `json` module for
the actual serialization step — the same "no further isolation needed,
apply the already-proven mechanism directly" pattern this lesson's own
schema already used in its second unit's own project-facing sibling
lessons.

### Discarding the Example

Not applicable — see above: this unit builds directly on the previous
units' already-isolated `with`/context-manager mechanism, with no new
throwaway script of its own to discard.

### Project Change

- **Reference Source:** No reference counterpart — original to this
  project, same as every previous unit in this curriculum.
- **Files affected:** `project/tasks.py` (modified: a new `import json`
  line, and two new methods on `TaskList`), `project/main.py`
  (modified: real save/load demonstration).
- **Change type:** Add.
- **Location:** `import json` is added at the very top of `tasks.py`,
  before `create_id_generator`; `save` and `load` are added directly
  after `priorities_used`, established in Lesson 7; `main.py`'s
  existing code is left unchanged, with new lines added at the end.
- **Dependencies:** The `json` module, part of Python's own standard
  library — no separate installation required, unlike `mypy` in Lesson
  2.

### The New Code

```python
    def save(self, path: str) -> None:
        with open(path, "w") as f:
            json.dump(self._tasks, f)

    def load(self, path: str) -> None:
        with open(path, "r") as f:
            self._tasks = json.load(f)
```

### The Updated Project

```
tasks.py:
 1  import json                                                # ← new
 2
 3
 4  def create_id_generator():
...
64  def priorities_used(self) -> set:
65      return {task["priority"] for task in self._tasks}
66
67      def save(self, path: str) -> None:                    # ← new
68          with open(path, "w") as f:                        # ← new
69              json.dump(self._tasks, f)                     # ← new
70                                                              # ← new
71      def load(self, path: str) -> None:                    # ← new
72          with open(path, "r") as f:                        # ← new
73              self._tasks = json.load(f)                    # ← new
```

```
main.py:
34  print("=== Distinct priority levels currently in use ===")
35  print(my_tasks.priorities_used())
36
37  print("=== Saving to tasks.json ===")                                    # ← new
38  my_tasks.save("tasks.json")                                              # ← new
39
40  print("=== Loading into a brand-new, separate TaskList ===")             # ← new
41  reloaded_tasks = TaskList()                                              # ← new
42  reloaded_tasks.load("tasks.json")                                       # ← new
43  for task in reloaded_tasks:                                              # ← new
44      print(describe_task(task))                                          # ← new
45  print(len(list(reloaded_tasks)) == len(list(my_tasks)))                 # ← new
```

As a whole, `tasks.py` now provides genuine persistence: `save` writes
`TaskList`'s own tasks out to a real file as JSON text, and `load`
reads that text back in, reconstructing the identical structure —
both guaranteeing the file involved is properly closed, success or
failure, via `with`. `main.py`, as a whole, now demonstrates a real
round trip: save the project's existing tasks to `tasks.json`, then
load them into a completely separate, brand-new `TaskList` instance,
proving the saved data faithfully reconstructs the original.

### Mechanical Walkthrough

- `import json` — an import statement (Lesson 2, restated per the
  Repetition Rule), this time naming a module from Python's own
  standard library rather than a file this project wrote itself; binds
  the name `json` to the resulting module object (per Lesson 4's proof
  that a module is a real object with a real `__dict__`).
- `def save(self, path: str) -> None:` — a method definition (Lesson
  5, restated per the Repetition Rule) with a hinted parameter and
  return type (Lesson 2, restated per the Repetition Rule).
- `with open(path, "w") as f:` — the `with` statement (full treatment
  in this lesson's second unit, restated per the Repetition Rule):
  opens the file at `path` for writing, binds the resulting file object
  to `f`, and guarantees it will be closed once this block ends, no
  matter how.
- `json.dump(self._tasks, f)` — a call to `json.dump` (full treatment
  in Objects and methods, above), retrieved from the `json` module's
  own namespace via attribute access (Lesson 4, restated per the
  Repetition Rule), given the instance's own `self._tasks` list and the
  open file object `f`; writes `self._tasks`'s JSON representation
  directly into the file.
- `def load(self, path: str) -> None:` — a method definition, hinted
  the same way as `save`'s.
- `with open(path, "r") as f:` — the same `with`/`open` pattern as
  `save`'s, this time opening for reading (`"r"`).
- `self._tasks = json.load(f)` — an assignment statement (Lesson 1)
  whose right-hand side is a call to `json.load` (full treatment in
  Objects and methods, above), given the open file object `f`; the
  returned `list` of `dict`s is bound directly to the instance
  attribute `self._tasks`, replacing whatever list it held before this
  call — a real rebinding, per Lesson 1's model, not a mutation of the
  previous list in place.
- `my_tasks.save("tasks.json")`, in `main.py` — a method call, invoking
  `save` on the existing `my_tasks` instance with the path
  `"tasks.json"`.
- `reloaded_tasks = TaskList()` — constructs a completely new, empty
  `TaskList` instance (Lesson 5, restated per the Repetition Rule),
  deliberately separate from `my_tasks`.
- `reloaded_tasks.load("tasks.json")` — a method call, invoking `load`
  on this new, empty instance, populating its `_tasks` from the file
  `my_tasks.save(...)` just wrote.
- `for task in reloaded_tasks:` — the iterator protocol (Lesson 5,
  restated per the Repetition Rule), driven by `TaskList.__iter__`
  (Lesson 5), iterating over the freshly-loaded tasks.
- `print(describe_task(task))` — `describe_task` (Lesson 4, restated
  per the Repetition Rule), applied to each reloaded task.
- `len(list(reloaded_tasks)) == len(list(my_tasks))` — `list(...)`
  (Lesson 6, restated per the Repetition Rule: fully consumes an
  iterable into a real list) applied to each `TaskList` (via its
  `__iter__`), then `len` (full treatment in "Everything else," above)
  applied to each resulting list, compared with `==` (Lesson 1,
  restated per the Repetition Rule) — confirming both `TaskList`
  instances hold the same number of tasks.

### CS Lens

This reappears the context-manager idea from earlier in this lesson,
restated in full per the Repetition Rule, now specifically as it
combines with a real serialization format to provide genuine
persistence:

```
Also recognized in: an ORM's session/unit-of-work pattern in web
frameworks (typically itself a context manager, guaranteeing a database
transaction is committed or rolled back regardless of whether the code
inside succeeds — the identical guaranteed-cleanup shape applied to a
database connection instead of a file), configuration file loading in
nearly every real-world application (the same save/load-as-JSON-or-
similar round trip this unit just built, at the scale of an entire
application's settings rather than a small task list), version control
systems' own object storage (Git, at its core, serializes structured
data — commits, trees, file contents — to disk and reconstructs it on
demand, the identical save/load principle at a much larger and more
sophisticated scale), and the general Serialization design pattern in
software engineering (converting an in-memory object graph to a
storable or transmittable format, and back — JSON is one concrete
serialization format among many, chosen here for being human-readable
and built into Python's standard library with no extra installation)
```

### SE Lens

The alternative — writing a custom, hand-rolled text format for saving
tasks, rather than using the standard library's `json` module — was
rejected because `json` is already correct, already handles edge cases
this project's own code would otherwise have to think through by hand
(escaping special characters inside a task's title, for instance), and
produces a format any other program, in any language, can read without
needing to understand this specific project's own custom rules. The
real, honest cost: `json.dump`/`json.load` only work directly with
JSON-representable types — this project's task dicts, built entirely
from strings, ints, and booleans, happen to fit perfectly, but a future
task attribute that isn't naturally JSON-representable (a `datetime`
object, say, a type this curriculum hasn't covered) would need extra
handling `json` doesn't provide automatically, a real limitation this
project's current, simple task shape doesn't yet expose.

### Commands Needed

The updated project runs and checks the same way every previous
lesson's project code has: `python3 main.py`, `mypy main.py`.

### Run It

The real, updated project's full output, from this unit's own new
lines onward:

```
=== Saving to tasks.json ===
=== Loading into a brand-new, separate TaskList ===
[!!!] Write lesson 3 (id=1) — CRITICAL
[!] Review lesson 3 (id=2) — high priority
Same number of tasks: True
```

The actual contents written to `tasks.json`, inspected directly:

```
[{"id": 1, "title": "Write lesson 3", "priority": 1, "done": true}, {"id": 2, "title": "Review lesson 3", "priority": 2, "done": false}]
```

— a real JSON array of two objects, `task_a`'s `"done"` correctly
saved as `true` (matching the `task_a["done"] = True` assignment
Lesson 6 added), proving the round trip preserves every field exactly.
`mypy main.py` reports:

```
Success: no issues found in 1 source file
```

### Connection

This unit is where every rule this lesson established became a real,
working project feature: the first unit's proof that a resource left
open on a crash path is a genuine, observable leak is exactly why
`save` and `load` both use `with` rather than a bare `open()` call; the
second unit's proof that `with` is a real, callable protocol —
`__enter__`, then the block, then `__exit__`, guaranteed — is exactly
the mechanism `open(path, "w")`'s own file object relies on to close
itself correctly, whether `json.dump` succeeds or somehow raises partway
through.

---

## Connect the Pieces

Trace one save/load round trip through everything this lesson built:
`my_tasks.save("tasks.json")`, followed by
`reloaded_tasks.load("tasks.json")`. Per this lesson's second unit's own
proof, `with open("tasks.json", "w") as f:`, inside `save`, calls the
returned file object's `__enter__()` (provided automatically by
Python's built-in file type, the identical "automatically provided"
relationship this lesson's second unit already established), binds it
to `f`, and guarantees `__exit__()` — which closes the file — runs once
this block ends, whether `json.dump(self._tasks, f)` succeeds
completely or raises partway through, exactly mirroring this lesson's
own `Resource`/`Suppressor` examples' guaranteed-cleanup behavior on a
crash path. `json.dump` itself writes `self._tasks`'s two task dicts
out as real JSON text — text this unit's own "Run It" step showed
verbatim, including `task_a`'s `"done": true`, correctly reflecting the
mutation Lesson 6 performed on it. `reloaded_tasks.load("tasks.json")`
then runs the identical `with`-guaranteed pattern in reverse: opens the
same file for reading, and `json.load(f)` parses its JSON text back
into an equivalent `list` of `dict`s, which `self._tasks = ...`
rebinds `reloaded_tasks`'s own internal list to — a completely separate
`TaskList` instance, per this lesson's own project code, from `my_tasks`,
proving the saved data alone, not any shared in-memory state, is what
faithfully reconstructs the original two tasks. Four lessons of
`TaskList` methods — `__iter__`, `pending()`, `by_id()`,
`priorities_used()` — all still work identically on `reloaded_tasks`,
because nothing about `load` changed what kind of object `_tasks` holds
— only where its actual contents came from.
