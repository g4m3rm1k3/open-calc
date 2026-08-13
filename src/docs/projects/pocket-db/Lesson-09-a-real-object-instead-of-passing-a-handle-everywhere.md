# Lesson 9: A Real Object, Instead of Passing a Handle Everywhere

**What you will build**
The real `Database` Python class — the first piece of actual
`pocketdb` package code, and the first real object-oriented Python in
this entire curriculum. Every throwaway script since Lesson 6 has
called `engine.database_open()`, stored the raw handle in a plain
variable, and passed that same variable into every single later call by
hand — real, working, and genuinely tedious and error-prone. A class
lets the handle live *inside* a real object instead, with methods that
already know which handle is theirs.

**What you need to know first:** Lesson 6 — `database_open`/`database_close`,
the opaque handle pattern.

**Terms introduced in this lesson:**
- **Class** — a real, user-defined blueprint for a kind of object —
  what data it holds, and what real operations (methods) it supports.
  Nothing about a class exists at runtime by itself; it only describes
  what a real *instance* of it will look like once one is actually
  created.
- **Instance** — one real, concrete object built from a class — `a`
  and `b`, in this lesson's own isolated proof, are two separate real
  instances of the same `Counter` class, each with its own real,
  independent data.
- **`self`** — inside a method, the real instance the method was
  actually called on — `self.value` inside `Counter.increment` refers
  to *that specific* instance's own real data, not some other instance
  of the same class, and not the class itself.
- **`__init__`** — a real, special method Python calls automatically
  the moment a new instance is created — its real job is setting up
  that instance's own starting data, the same real moment
  `database_open()` needs to run exactly once per real `Database`.

**Objects and methods used:** None yet — this lesson's real subject is
the Python language's own class mechanism itself, covered fully in
Terms Introduced above; the real `Database` class this lesson builds
uses only already-covered `ctypes` calls (Lesson 6) inside its own
methods.

---

## Concept Unit: A Class — Bundling Data and the Operations That Use It

### The Problem

Every throwaway script since Lesson 6 has repeated the identical real
pattern: call `engine.database_open()`, store the result in a plain
variable (`db`), then pass `db` as the first argument to every single
later call (`database_create_table(db, ...)`, `database_insert(db, ...)`).
Nothing stops a real mistake — passing the wrong variable, forgetting
to pass it at all — and nothing bundles "a database handle" together
with "the operations that actually use it." What real Python construct
does that bundling?

### Introduce the Concept in Isolation

Nothing about `ctypes` or `pocketdb` yet — the smallest possible real
class, proving the mechanism itself. Save this as `counter_check.py`,
in `pocketdb/`:

```python
class Counter:
    def __init__(self):
        self.value = 0

    def increment(self):
        self.value = self.value + 1

    def read(self):
        return self.value


a = Counter()
b = Counter()

a.increment()
a.increment()
a.increment()
b.increment()

print(f"a.value = {a.read()}")
print(f"b.value = {b.read()}")
```

Run with `python counter_check.py`. Real output:

```text
a.value = 3
b.value = 1
```

*What this proves:* `a` and `b` are two real, separate `Counter`
**instances** — calling `a.increment()` three times and `b.increment()`
once genuinely changed only `a`'s own `value`, leaving `b`'s completely
independent, proven directly by the two different real numbers printed.
This is called a **class**: `Counter` itself is only a blueprint;
`a` and `b` are the real, concrete objects actually built from it, each
with its own real, separate data.

### Discard the Throwaway Example

`counter_check.py` is deleted — `Counter` itself is never part of the
real project; only the pattern is kept:

```bash
rm counter_check.py
```

### Mechanical Walkthrough

- `class Counter:` — declares a real, new class named `Counter` — on
  its own, this line creates no real object yet, only the blueprint.
- `def __init__(self):` — covered fully in Terms Introduced, above —
  Python calls this automatically, exactly once, the moment
  `Counter()` actually runs.
- `self.value = 0` — creates a real attribute, `value`, on *this*
  specific instance, set to `0` — `self` is what makes this "this
  instance's own `value`," not some shared, single `value` every
  `Counter` would otherwise fight over.
- `def increment(self):` / `def read(self):` — two real, ordinary
  methods; both take `self` as their first parameter, the same real
  mechanism `__init__` already used, so each one always knows which
  real instance it's actually operating on.
- `self.value = self.value + 1` — reads `self`'s own current `value`,
  adds one, and writes the result back onto that same real instance.
- `a = Counter()` — calls the class itself, like calling a function;
  this is what actually creates a real instance and triggers `__init__`.
- `a.increment()` — calls `increment` *on* `a` specifically — Python
  automatically passes `a` itself as `increment`'s own `self` parameter,
  without it being written explicitly at the call site.
- `a.read()` — reappearing shape (`.increment()`, just returning a
  value instead of only modifying one).

### CS Lens

This is **object-oriented programming** — bundling data (`value`) and
the operations that act on it (`increment`, `read`) into one real unit,
with many independent real instances possible from one shared
blueprint. Also recognized in: the exact same idea already proven, in a
completely different language, throughout this whole project's own C++
side — `Column`, `Row`, `Table`, `Database` (Lessons 2 through 5) are
all C++ classes doing the identical real job for C++'s own objects;
Python's `self` is the direct counterpart to C++'s implicit `this`.

### SE Lens

Why does `self` have to be written explicitly as every method's first
parameter, when Python already knows which instance a method was
called on? Because Python's own real design deliberately keeps that
knowledge visible in the method's own signature, rather than hiding it
— a real, different tradeoff than C++'s own implicit `this` (already
used throughout this project's C++ side without ever being written by
name). The real cost: every method needs `self` written out, every
time, even though it's supplied automatically at the call site — a
small, constant bit of real boilerplate Python's own design accepts in
exchange for never leaving "which object's data does this refer to"
ambiguous or hidden.

### Commands Needed

Already shown above, alongside the file.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

A class can now bundle real data with the operations that use it,
proven with two genuinely independent real instances. `Database`,
wrapping the real opaque handle Lesson 6 already proved works, is
built the identical way next.

---

## Concept Unit: `Database` — the Handle, Now Living Inside a Real Object

### The Problem

`Database`'s own real job: hold the opaque handle Lesson 6's
`database_open()` returns, and provide real methods (`close`, and, in
later lessons, `create_table`/`insert`/`get`) that already know which
handle is theirs, instead of it being passed in by hand at every call
site.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, the real start of the `pocketdb` package.
- **Files affected:** `pocketdb.py` (new) — this project's first real
  Python module file, distinct from the throwaway scripts every earlier
  lesson used.
- **Change type:** Add.
- **Dependencies:** `pocketdb_engine.dll` (Lessons 6–8), the class
  mechanism (this lesson's first unit).

### The New Code — `pocketdb.py`

In `pocketdb/`, save the following as `pocketdb.py` — the real module
every future Python user of this project will actually `import`:

```python
import ctypes

_engine = ctypes.CDLL("./pocketdb_engine.dll")
_engine.database_open.restype = ctypes.c_void_p
_engine.database_close.argtypes = [ctypes.c_void_p]


class Database:
    def __init__(self):
        self._handle = _engine.database_open()

    def close(self):
        _engine.database_close(self._handle)
        self._handle = None
```

Proven for real — a small, throwaway check that this genuinely new
module works before anything else depends on it. Save this as
`pocketdb_class_check.py`:

```python
from pocketdb import Database

db = Database()
print(f"db._handle = {db._handle}")
db.close()
print(f"db._handle after close = {db._handle}")
```

Run with `python pocketdb_class_check.py`. Real output:

```text
db._handle = 1581032787456
db._handle after close = None
```

*What this proves:* `Database()` genuinely opened a real handle — the
identical real mechanism Lesson 6 already proved, now happening
automatically inside `__init__` — and `db.close()` correctly closed it
using `self._handle`, the exact instance's own handle, without that
handle ever being passed in by hand at the call site the way every
earlier throwaway script required.

### Discard the Throwaway Example

`pocketdb_class_check.py` is deleted — it exists only to confirm
`pocketdb.py` works:

```bash
rm pocketdb_class_check.py
```

`pocketdb.py` is kept — the real, permanent start of this project's own
Python package.

### Mechanical Walkthrough

- `_engine = ctypes.CDLL("./pocketdb_engine.dll")` — reappearing
  exactly (Lesson 0) — the leading underscore is an ordinary Python
  naming convention (not enforced by the language) signaling "this name
  is this module's own internal detail," not meant to be used directly
  by whoever imports `pocketdb`.
- `_engine.database_open.restype = ctypes.c_void_p` /
  `_engine.database_close.argtypes = [ctypes.c_void_p]` — reappearing
  exactly (Lesson 6) — declared once, here, at module load time,
  instead of being redeclared inside every function that needs them,
  the way every earlier throwaway script did.
- `class Database:` / `def __init__(self):` — reappearing exactly
  (this lesson's own first unit).
- `self._handle = _engine.database_open()` — reappearing shape (this
  unit's own `Counter.__init__`) — opens a real handle the moment a
  `Database` instance is created, storing it as that instance's own
  data.
- `def close(self):` / `_engine.database_close(self._handle)` —
  reappearing shape — closes *this* instance's own real handle,
  reading it from `self`, never needing it passed in separately.
- `self._handle = None` — reappearing exactly (this unit's own
  `Counter`-adjacent pattern of writing to `self`) — a real, deliberate
  signal that this instance's handle is no longer valid, worth keeping
  even though nothing currently checks it.

### CS Lens

This is the exact same **encapsulation** idea `Table`/`Database`
(Lessons 5, this lesson's C++-side counterparts) already used on the
C++ side — the real handle is `Database`'s own private implementation
detail (the leading underscore signals this, even though Python itself
doesn't enforce real privacy the way C++'s `private:` does), and
whoever uses this class never needs to touch `_handle` directly at all.

### SE Lens

Why does `pocketdb.py` load `pocketdb_engine.dll` using a plain,
relative path (`"./pocketdb_engine.dll"`), the same way every earlier
throwaway script did? Because this project's own working directory has
always been `pocketdb/` itself, where both files live side by side —
a real, honest simplification that works today, and a real limitation
worth naming directly: importing `pocketdb` from a different working
directory would fail to find the `.dll` at all. A more robust real
fix — locating the `.dll` relative to `pocketdb.py`'s own file location,
not the caller's current directory — is a real, natural improvement,
not built now because nothing yet requires running this project's code
from anywhere other than its own folder.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code."

### Connection

`Database` now opens and closes its own real handle automatically,
proven correct. It doesn't yet do anything *useful* — no
`create_table`, no `insert`, no `get`. Wrapping those, and turning
Lesson 7/8's own raw `-1`/`nullptr` error signals into real Python
exceptions instead, is next.

---

## Closing

### Connect the Pieces

`Counter`, a small, disposable class, proved the real mechanism first:
`__init__` runs automatically per instance, `self` keeps each real
instance's own data separate, and two real `Counter`s
(`a`/`b`) genuinely never interfered with each other's `value`.
`Database` then applied the identical real pattern to something real:
`__init__` calls `database_open()` (Lesson 6) automatically, storing
the resulting handle as `self._handle`; `close()` reads that same real
handle back out and closes it — proven directly, a real handle
appearing after construction, and a real `None` after `close()`, with
no handle ever passed around by hand at a call site.

### What Breaks Without This

Comment out `self._handle = _engine.database_open()` inside
`__init__`, replacing it with `pass` (a real Python no-op keyword — a
statement that does literally nothing, needed here only because Python
doesn't allow a completely empty function body). Run
`pocketdb_class_check.py` again — `db._handle` is now a real
`AttributeError` the moment it's accessed (`'Database' object has no
attribute '_handle'`), proving `__init__` genuinely is what creates
that attribute in the first place, not something that exists on every
`Database` automatically for free. Restore the original line and
confirm it works again.

### Exercises

- Create two separate real `Database` instances in the same script
  (`db1 = Database()`, `db2 = Database()`) and print both real handles.
  Confirm they're two different real numbers — proving each instance
  really did open its own separate, independent real `Database` on the
  C++ side, the identical independence `Counter`'s own `a`/`b` already
  proved.
- Add a real `__del__` method to `Database` (a second special method,
  called automatically when an instance is actually destroyed) that
  calls `self.close()` if `self._handle` is not already `None`. Confirm,
  by deliberately *not* calling `.close()` yourself and instead letting
  the script end naturally, that the handle still gets closed — read
  about the real, honest limitation Python's own documentation states
  about exactly when `__del__` is actually guaranteed to run.
- Try calling `db.close()` twice in a row on the same real instance.
  Confirm it doesn't crash (calling `database_close` on an already-`None`...
  actually, read what real value gets passed the second time, and
  explain, from Lesson 6's own SE Lens, why calling the real
  `database_close` a second time on the same original handle would be
  genuinely dangerous — a real double-free — and why this lesson's own
  `self._handle = None` line is what actually prevents it here.

### Definition of Done

- [ ] `pocketdb.py` exists as a real, permanent file in your own
      `pocketdb/` folder, with a real `Database` class.
- [ ] You ran the real `Counter` proof yourself, with two separate real
      instances, and can explain why their two `value`s stayed
      independent.
- [ ] `Database()` opens a real handle automatically, and `.close()`
      correctly closes it — proven with your own real run, not just
      read here.
- [ ] You can explain, from memory, what `self` actually refers to
      inside a method, and why it has to be written explicitly as
      Python's first parameter.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Start the pocketdb package: a real Database class wrapping the opaque handle"`.
