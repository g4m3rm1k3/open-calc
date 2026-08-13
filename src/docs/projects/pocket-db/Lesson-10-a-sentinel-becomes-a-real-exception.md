# Lesson 10: A Sentinel Becomes a Real Exception

**What you will build**
`PocketDBError` — this project's own first custom Python exception type
— and real `create_table`/`insert`/`get` methods on `Database`,
completing the translation this project has been building toward since
Lesson 7: a real C++ exception, caught at the `extern "C"` boundary and
collapsed into a bare `-1` or `nullptr` (Lesson 7, Lesson 8), now
re-emerges on the Python side as a real, catchable, named exception —
not a number anyone has to remember to check.

**What you need to know first:** Lesson 7 — every `extern "C"`
function returning a real `int`/`nullptr` status code instead of
letting a C++ exception escape. Lesson 9 — `Database`, `self`,
`__init__`.

**Terms introduced in this lesson:**
- **Custom exception class** — a real, new exception type, specific to
  one project's own real failures, defined by inheriting from Python's
  built-in `Exception` — distinct from `pocketdb`'s own separate
  functions/methods failing in ways only a *generic* built-in exception
  (`ValueError`, `TypeError`) could describe.

**Objects and methods used**
- **`str.split(separator)`**
  - *What it is:* a real, built-in Python string method — splits a
    string into a real `list` of substrings, breaking wherever
    `separator` appears, discarding the separator itself.
  - *Implementation:* `"a,b,c".split(",")` returns the real list
    `["a", "b", "c"]` — none of the three resulting strings contain a
    comma.
  - *Its use:* `Database.get`, undoing `database_get`'s own real
    comma-joining (Lesson 8) — turning the one, joined string that
    crossed the FFI boundary back into a real, separate Python `list`
    of values.

This lesson's other new material is a real Python language mechanism
(inheriting from `Exception`), covered fully in Terms Introduced above;
every `ctypes` call reused here was already given full treatment in
Lessons 6 through 8.

---

## Concept Unit: A Custom Exception — a Real, Named Error Type

### The Problem

`database_create_table`/`database_insert`/`database_get` (Lessons 6
through 8) each report failure as a bare `-1` or `nullptr` — real,
correct C-compatible signals, but nothing about a plain `-1` says *what
kind* of thing went wrong, and nothing forces whoever calls
`Database.create_table` to even notice a failure happened at all,
unless they remember to check the return value by hand every time.
Python's own real exceptions (already used throughout this project's
own throwaway scripts, always a *built-in* type) solve exactly this —
but no built-in exception means "a PocketDB operation failed."

### Introduce the Concept in Isolation

A small, disposable proof — nothing about `pocketdb` yet. Save this as
`custom_exc_check.py`, in `pocketdb/`:

```python
class TooColdError(Exception):
    pass


def check_temperature(value):
    if value < 0:
        raise TooColdError(f"Temperature {value} is below freezing")
    return value


try:
    check_temperature(-5)
except TooColdError as e:
    print(f"Caught: {e}")

print("program continues")
print(f"valid call: {check_temperature(20)}")
```

Run with `python custom_exc_check.py`. Real output:

```text
Caught: Temperature -5 is below freezing
program continues
valid call: 20
```

*What this proves:* `TooColdError`, a real, brand-new exception type
this file itself defined, works exactly like every built-in exception
this project's earlier lessons already used — `raise`, `try`/`except`,
a real message read back via `e` — proving Python's own exception
mechanism doesn't require a *built-in* type at all; `Exception` itself
is a real, ordinary class, and inheriting from it is the entire real
recipe.

### Discard the Throwaway Example

`custom_exc_check.py` is deleted — `TooColdError` itself is never part
of the real project; only the pattern is kept:

```bash
rm custom_exc_check.py
```

### Mechanical Walkthrough

- `class TooColdError(Exception):` — **first appearance of inheriting
  from a real built-in class.** `(Exception)` means `TooColdError` *is
  a* real `Exception` — everywhere Python (or this project's own code)
  expects "some kind of exception," a `TooColdError` genuinely
  qualifies, the same real relationship Lesson 2's own `IntegerColumn : public Column`
  established in C++.
- `pass` — a real, do-nothing statement, needed here only because
  Python doesn't allow a completely empty class body — `TooColdError`
  needs no new data or methods of its own; it inherits everything
  `Exception` already provides (storing a message, `str()` support)
  automatically.
- `raise TooColdError(f"...")` — constructs a real `TooColdError`
  instance, with a real message, and raises it — reappearing shape
  (Python's own `raise`, already used implicitly whenever a built-in
  exception fired in earlier throwaway scripts, now written explicitly
  for the first time).
- `except TooColdError as e:` — reappearing shape (Python's own
  `try`/`except`, first properly introduced here in this project) —
  matches specifically because `TooColdError` really is the type that
  was raised.

### CS Lens

This is the identical real idea Lesson 2's own CS Lens already named in
C++ — **inheritance**, here applied to Python's own exception system
specifically: a whole hierarchy of real, distinguishable failure types
can share one common ancestor (`Exception`), letting code catch broadly
(`except Exception:`) or narrowly (`except TooColdError:`) depending on
how specific a real response it needs.

### SE Lens

Why define a real, named `TooColdError` instead of just raising a
generic `ValueError(f"Temperature {value} is below freezing")`? A
generic `ValueError` could mean *any* invalid value, anywhere in a real
program — code catching it specifically to handle "temperature too
cold" would also silently catch a completely unrelated `ValueError`
from somewhere else entirely, a real, easy-to-miss bug. A real, named
exception type lets calling code catch *exactly* the one real failure
it actually knows how to handle, and nothing else.

### Commands Needed

Already shown above, alongside the file.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

`PocketDBError`, this project's own real, named exception type, is
built the identical way next — then wired into `create_table`/`insert`/
`get`, replacing every raw `-1`/`nullptr` this project has produced
since Lesson 7.

---

## Concept Unit: Wrapping the Raw API — a Sentinel Becomes a Real Exception

### The Problem

`Database.create_table`/`.insert`/`.get` need to exist at all —
`Database` (Lesson 9) currently only opens and closes a handle. Each
real method needs to call the matching raw `extern "C"` function
(Lessons 6 through 8), and translate its real `-1`/`nullptr` sentinel
into a real, raised `PocketDBError` instead of a value the caller could
silently ignore.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition to `pocketdb.py`.
- **Files affected:** `pocketdb.py` (modified — adds `PocketDBError`,
  `INTEGER`/`TEXT` constants, and three new `Database` methods).
- **Change type:** Add.
- **Dependencies:** `database_create_table`/`database_insert`/
  `database_get` (Lessons 6 through 8), the custom-exception pattern
  (this lesson's first unit).

### The New Code — `pocketdb.py`, Extended

Add the three missing `argtypes`/`restype` declarations (Lessons 7–8),
two real constants standing in for Lesson 6's own `ColumnTypeCode`, and
`PocketDBError`, right after the existing `_engine.database_close.argtypes`
line:

```python
_engine.database_create_table.argtypes = [
    ctypes.c_void_p, ctypes.c_char_p,
    ctypes.POINTER(ctypes.c_char_p), ctypes.POINTER(ctypes.c_int), ctypes.c_int,
]
_engine.database_create_table.restype = ctypes.c_int
_engine.database_insert.argtypes = [
    ctypes.c_void_p, ctypes.c_char_p, ctypes.POINTER(ctypes.c_char_p), ctypes.c_int,
]
_engine.database_insert.restype = ctypes.c_int
_engine.database_get.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_int]
_engine.database_get.restype = ctypes.c_void_p
_engine.database_free_string.argtypes = [ctypes.c_void_p]

INTEGER = 0
TEXT = 1


class PocketDBError(Exception):
    pass
```

### The Updated Project — `Database`, With Three New Real Methods

`Database` (Lesson 9) grows three new methods, added after `close`:

```python
class Database:
    def __init__(self):                                                    # ← unchanged from Lesson 9
        self._handle = _engine.database_open()

    def close(self):                                                       # ← unchanged from Lesson 9
        _engine.database_close(self._handle)
        self._handle = None

    def create_table(self, name, column_names, column_types):              # ← new
        names_array = (ctypes.c_char_p * len(column_names))(               # ← new
            *[n.encode("utf-8") for n in column_names]                     # ← new
        )
        types_array = (ctypes.c_int * len(column_types))(*column_types)    # ← new

        result = _engine.database_create_table(                           # ← new
            self._handle, name.encode("utf-8"), names_array, types_array, len(column_names)
        )
        if result != 0:                                                   # ← new
            raise PocketDBError(f"Failed to create table '{name}'")       # ← new

    def insert(self, table, values):                                       # ← new
        str_values = [str(v).encode("utf-8") for v in values]              # ← new
        values_array = (ctypes.c_char_p * len(str_values))(*str_values)    # ← new

        result = _engine.database_insert(                                  # ← new
            self._handle, table.encode("utf-8"), values_array, len(str_values)
        )
        if result != 0:                                                   # ← new
            raise PocketDBError(f"Failed to insert into table '{table}'") # ← new

    def get(self, table, index):                                           # ← new
        ptr = _engine.database_get(self._handle, table.encode("utf-8"), index)  # ← new
        if ptr is None:                                                   # ← new
            raise PocketDBError(f"No row {index} in table '{table}'")     # ← new

        text = ctypes.string_at(ptr).decode("utf-8")                      # ← new
        _engine.database_free_string(ptr)                                 # ← new
        return text.split(",")                                            # ← new
```

Proven for real — the complete round trip, and every real failure path
this project has caused on purpose since Lesson 7, all now real,
catchable Python exceptions instead of raw sentinels. Save this as
`verify_pyexc.py`:

```python
from pocketdb import Database, PocketDBError, INTEGER, TEXT

db = Database()
db.create_table("games", ["id", "player", "score"], [INTEGER, TEXT, INTEGER])

db.insert("games", [1, "Alice", 100])
db.insert("games", [2, "Bob", 85])

print(f"row 0: {db.get('games', 0)}")
print(f"row 1: {db.get('games', 1)}")

try:
    db.get("games", 99)
except PocketDBError as e:
    print(f"Caught (missing row): {e}")

try:
    db.insert("missing_table", [1, "X", 1])
except PocketDBError as e:
    print(f"Caught (missing table): {e}")

try:
    db.insert("games", [1, "Bad", "not_a_number"])
except PocketDBError as e:
    print(f"Caught (bad int): {e}")

db.close()
print("program continues normally")
```

Run with `python verify_pyexc.py`. Real output:

```text
row 0: ['1', "'Alice'", '100']
row 1: ['2', "'Bob'", '85']
Caught (missing row): No row 99 in table 'games'
Caught (missing table): Failed to insert into table 'missing_table'
Caught (bad int): Failed to insert into table 'games'
program continues normally
```

*What this proves:* two real rows insert and read back correctly — the
identical real data every earlier lesson's own raw `ctypes` calls
already proved, now reached through ordinary method calls
(`db.insert(...)`, `db.get(...)`) instead of hand-written `ctypes`
boilerplate at every call site. All three real failures this project
has caused on purpose since Lesson 7 — a missing row index, a missing
table name, an unparseable integer — now surface as a real, catchable
`PocketDBError`, with a real, specific message, instead of a bare `-1`
or `None` a caller could silently ignore.

### Discard the Throwaway Example

`verify_pyexc.py` is deleted:

```bash
rm verify_pyexc.py
```

`pocketdb.py`'s three new methods are kept — real, permanent project
code.

### Mechanical Walkthrough

- `names_array = (ctypes.c_char_p * len(column_names))(*[n.encode("utf-8") for n in column_names])` —
  reappearing shape (Lesson 6's own array-construction pattern), this
  time built from a real Python `list` instead of hand-typed literal
  values; `[n.encode("utf-8") for n in column_names]` is a real **list
  comprehension** — builds a new list by applying `.encode("utf-8")`
  (already used in this project's own throwaway scripts, converting a
  real Python `str` into real bytes) to every element of `column_names`
  in turn.
- `(ctypes.c_int * len(column_types))(*column_types)` — reappearing
  exactly (Lesson 6) — the `*` before `column_types` unpacks the real
  Python `list` into individual arguments, the same real mechanism
  every earlier lesson's own literal `(ctypes.c_int * 3)(0, 1, 0)`
  already used, just applied to a real, variable-length list instead of
  three hand-typed literals.
- `if result != 0: raise PocketDBError(...)` — reappearing shape (this
  lesson's own first unit) — translates the real raw `int` sentinel
  (Lesson 7) into a real, raised exception.
- `if ptr is None: raise PocketDBError(...)` — reappearing shape —
  `ctypes` itself already represents a real C `nullptr` as Python's own
  `None` (Lesson 8); this line is the real translation from that `None`
  into a real, raised exception.
- `text.split(",")` — **first appearance of `str.split`.** Splits a
  real string into a real `list` of substrings, wherever the given
  separator (`","`) appears — the real, direct undo of `database_get`'s
  own comma-joining (Lesson 8).

### CS Lens

This is **exception translation at a boundary** — converting one
layer's own real failure signal (a raw `int`/`nullptr`, the only shape
that could cross the `extern "C"` boundary at all) into a different,
more appropriate real signal for the next layer up (a real Python
exception, the idiomatic way Python code actually expects failure to be
reported). Also recognized in: an HTTP client library translating a
raw socket error into a real, named `ConnectionError`, and a database
driver translating a raw SQL error code into a real, specific exception
class per real error category.

### SE Lens

Why does `pocketdb.py` check `if result != 0:` after every single raw
call, rather than, say, writing one shared helper function that does
the check-and-raise once? Because that repetition is real and genuine
— three near-identical checks — and a shared helper *would* be a real,
reasonable next improvement; it isn't built here because this project's
own real convention (established since `pocket-inventory-wpf`, a
different project in this same repo) treats premature abstraction as a
real cost too: extracting a shared helper before there's a second,
third, *and* genuinely varied real use case to prove it's the right
shape risks guessing wrong. Three call sites, each simple and each
already correct, is a real, legitimate place to stop for now.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code" — the complete real round trip,
plus all three real, caught failures.

### Connection

`pocketdb` now has a real, working, exception-safe interface —
`create_table`/`insert`/`get`, each raising a real, specific
`PocketDBError` on failure instead of a bare sentinel. Its real,
current parameter shapes — separate `column_names`/`column_types`
lists, a plain `values` list — are correct, but not yet the most
natural real Python API this project's own `README.md` promised
(`db.create_table("games", id=INTEGER, player=TEXT, score=INTEGER)`).
`**kwargs`/`*args` — real Python syntax for exactly that shape — is
next.

---

## Closing

### Connect the Pieces

`TooColdError`, a small, disposable proof, established the real recipe
— inheriting from `Exception`, `pass` for an empty body — before
`PocketDBError` applied it to this real project. `Database.create_table`/
`.insert`/`.get` each call the identical real `extern "C"` functions
Lessons 6 through 8 already proved correct, then check the real return
value (`!= 0`, or `is None`) and `raise PocketDBError` with a real,
specific message instead of returning that raw sentinel to the caller.
Every real failure this project has caused on purpose since Lesson 7 —
a bad integer, a missing table, a missing row — now surfaces as one
consistent, real, catchable exception type, proven with a real `try`/
`except` around each one, and the real, correct data from two
successfully inserted rows reads back out exactly as it went in.

### What Breaks Without This

Comment out the `if result != 0: raise PocketDBError(...)` line inside
`create_table`, then deliberately call it with a name that fails on the
C++ side for some real reason (a genuinely invalid input your own
`database_create_table` rejects). Run it — no exception is raised at
all, and the program continues as if the table was created
successfully, when it wasn't; only a later `db.insert(...)` call into
that never-really-created table reveals the real problem, far from
where it actually happened. Restore the check and confirm the real
failure now surfaces immediately, at its own real, correct source.

### Exercises

- Add a second, more specific custom exception,
  `class TableNotFoundError(PocketDBError): pass` — inheriting from
  `PocketDBError` itself, not directly from `Exception` — and raise it
  specifically from `insert`/`get` when the real failure is a missing
  table name (a real string comparison or a separate raw API call could
  tell you this; pick either and justify your choice). Confirm
  `except PocketDBError:` still catches it (since it *is* one), while a
  new, narrower `except TableNotFoundError:` catches only that specific
  real case.
- Add real, Python-side validation to `Database.insert` — check
  `len(values)` against a real, remembered column count *before*
  calling the raw `extern "C"` function at all, raising `PocketDBError`
  immediately if they don't match. You'll need `create_table` to
  remember each table's real column count somewhere on `self` first.
- Read `pocketdb.py` end to end and count how many places the literal
  string `"utf-8"` appears. Consider (and try) extracting it into one
  real, named module-level constant, and explain, from this lesson's
  own SE Lens, whether three repetitions is enough to justify that
  extraction, or whether it's the same "not yet" case in this lesson's
  own SE Lens.

### Definition of Done

- [ ] `PocketDBError`, `INTEGER`/`TEXT`, and the three new `Database`
      methods all exist as real code in your own `pocketdb.py`.
- [ ] You created a real table, inserted two real rows, and read both
      back correctly using only `Database`'s own real methods — no raw
      `ctypes` calls in your own test script.
- [ ] You caused all three real failure paths yourself (bad integer,
      missing table, missing row) and caught each one as a real
      `PocketDBError`, with `try`/`except`, without the program
      crashing.
- [ ] You can explain, from memory, why a custom exception type is
      better here than reusing a generic built-in one, referencing this
      lesson's own SE Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add PocketDBError and wrap create_table/insert/get with real exception translation"`.
