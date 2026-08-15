# Lesson 22: A Repository Pattern in Python

**What you will build:** a real `parts_repository.py` module,
collecting every real `parts`-related operation this arc has scattered
across six separate standalone scripts (Lessons 17–21) into one place,
each one written once instead of copy-pasted per script.

**What you need to know first:** [Lesson 19](lesson-19-sqlite3-row-and-dict-like-access.md)
— `conn.row_factory = sqlite3.Row`, one of the real, repeated lines
this lesson's own module stops repeating. [Lesson 20](lesson-20-transactions-in-python.md)
— `with conn:`, reused inside this lesson's own write functions.

**Terms introduced in this lesson:**
- **Repository pattern** — a real, named software design pattern:
  collecting every operation against one specific kind of data (here,
  `parts` rows) behind a small set of named functions or methods, so
  every caller depends on *what* operation happens, never on the raw
  SQL or connection details making it happen.

**Objects and methods used:** none new — this lesson organizes
already-explained `sqlite3` calls (`connect`, `execute`, `with conn:`)
into reusable functions; no new library object or method is introduced.

---

## Concept Unit: Six Lessons of Repeated Connection Code — Named, Then Fixed

### The Problem

Lessons 17 through 21 each opened a fresh `sqlite3.connect(...)` call,
and Lesson 19 onward each repeated the identical `conn.row_factory =
sqlite3.Row` line. Real, working code — and real, genuine duplication:
the exact same three-line setup, retyped in roughly six separate real
scripts, with nothing stopping a seventh script from forgetting the
`row_factory` line and silently reverting to Lesson 17's own fragile
tuple-position access, the precise bug Lesson 19 already proved real.

### Introduce the Concept in Isolation

No throwaway script — a real, permanent module, replacing this arc's
own scattered scripts with one shared home:

```python
# parts_repository.py
import sqlite3

DB_PATH = "pocket_hardware.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def get_all_parts():
    conn = get_connection()
    try:
        return conn.execute("SELECT * FROM parts").fetchall()
    finally:
        conn.close()


def get_part_by_name(name):
    conn = get_connection()
    try:
        return conn.execute(
            "SELECT * FROM parts WHERE name = ?", (name,)
        ).fetchone()
    finally:
        conn.close()


def add_part(name, price, quantity, supplier_id=None):
    conn = get_connection()
    try:
        with conn:
            conn.execute(
                "INSERT INTO parts (name, price, quantity, supplier_id) VALUES (?, ?, ?, ?)",
                (name, price, quantity, supplier_id),
            )
    finally:
        conn.close()
```

Every real Lesson 17–21 concept is reused here, once each, correctly:
`sqlite3.connect` (Lesson 17), `row_factory = sqlite3.Row` (Lesson 19),
`?` parameterization (Lesson 18), `with conn:` (Lesson 20) — none
explained again, all applied consistently in exactly one place instead
of six.

Real usage, from a genuinely separate script:

```python
from parts_repository import get_all_parts, get_part_by_name, add_part

add_part("Chalk Line", 8.75, 12, supplier_id=1)
part = get_part_by_name("Chalk Line")
print(f"{part['name']}: ${part['price']}, qty {part['quantity']}")
print(f"Total parts: {len(get_all_parts())}")
```

```
$ python use_repository.py
Chalk Line: $8.75, qty 12
Total parts: 12
```

No SQL string, no `sqlite3.connect`, no `row_factory` line appears in
`use_repository.py` at all — every real database detail lives inside
`parts_repository.py` alone, and the calling script reads like the
real, plain-English operations it performs.

### Discard

Nothing throwaway — `parts_repository.py` is a real, permanent module
this project's own Arc 4 backend imports directly, rather than
reopening raw `sqlite3` connections inside its own HTTP handlers.

### Mechanical Walkthrough

- `DB_PATH = "pocket_hardware.db"` — **(c) already basic**, an ordinary
  module-level constant.
- `def get_connection(): ...` — **(a) first appearance** of extracting
  Lesson 17/19's own two-line connection setup into one real, named,
  reusable function — not a new `sqlite3` capability, a new
  organizational one.
- `def get_all_parts(): ... try: ... finally: conn.close()` — **(a)
  first appearance** of `try`/`finally` guaranteeing `conn.close()`
  runs even if `execute`/`fetchall` raises — **(c) already basic** as
  ordinary Python control flow, new here only in the specific,
  deliberate combination with a database connection.
- `def add_part(name, price, quantity, supplier_id=None): ...` — **(c)
  already basic**, an ordinary Python function with a default parameter
  value; the `with conn:` inside it — **(b) hard concept reappearing**,
  Lesson 20's own automatic commit/rollback, unchanged.

### CS Lens

The repository pattern is a real, named instance of **encapsulation**
applied at the data-access layer specifically: every real detail of
*how* `parts` is read or written (the connection, the row factory, the
exact SQL) is hidden behind function names describing *what* operation
happens, the same underlying idea as a class hiding its own internal
fields behind public methods.

Also recognized in: the DAO (Data Access Object) pattern in Java, an
ORM's own model class (Arc 4's own Pydantic/SQLAlchemy-adjacent layer)
hiding raw SQL behind attribute access, a `UserService`/`UserRepository`
class in virtually any real, layered application architecture.

### SE Lens

The real alternative not chosen — leaving every future caller free to
open its own `sqlite3.connect()` and write its own SQL inline, the
exact shape every one of Lessons 17–21's own scripts used — has the
real, concrete cost this lesson's own opening already named: six
separate, real chances to forget `row_factory`, mis-type a column name,
or omit a `?` placeholder in favor of an f-string (Lesson 18's own real
vulnerability), each one an independent, undetected risk. Centralizing
this project's real `parts` operations behind one module doesn't remove
any of Lessons 17–21's own concepts — it applies each of them exactly
once, correctly, and lets every future caller (starting with Arc 4's
own FastAPI endpoints) trust that correctness by construction, rather
than re-earning it in every new file.

## Connect the pieces

One real module, `parts_repository.py`, replacing six lessons' worth of
scattered, real, working — but duplicated — scripts: `get_connection`
centralizes Lesson 17's own connect call and Lesson 19's own
`row_factory` line; `get_all_parts`/`get_part_by_name` reuse Lesson
18's own safe parameterization; `add_part` reuses Lesson 20's own
automatic `with conn:` resolution. `use_repository.py` then proved the
real payoff directly: three real operations, zero raw SQL or connection
code in the calling script at all.

## What breaks without this

Add a second, careless function directly inside some other, future
script — one that reimplements `get_part_by_name` from memory, without
importing the real one:

```python
def sloppy_get_part(name):
    conn = sqlite3.connect(DB_PATH)
    return conn.execute("SELECT * FROM parts WHERE name = ?", (name,)).fetchone()
```

```
$ python -c "
from parts_repository import DB_PATH
import sqlite3
def sloppy_get_part(name):
    conn = sqlite3.connect(DB_PATH)
    return conn.execute('SELECT * FROM parts WHERE name = ?', (name,)).fetchone()
row = sloppy_get_part('Hammer')
print(row[0], row['name'])
"
Traceback (most recent call last):
  ...
TypeError: tuple indices must be integers or slices, not str
```

`row[0]` (Lesson 17's own positional form) works — `row['name']`
(Lesson 19's own by-name form) fails, with a real, genuine `TypeError`,
because `sloppy_get_part` forgot the one `row_factory` line
`get_connection` already handles correctly, every time, for every
caller that actually uses it. This is direct, real proof of this
lesson's own SE Lens: the repository didn't make this mistake
*impossible* — nothing in Python enforces using it — but it did make
the *correct* version the easy, one-import default, and the sloppy
version something a future contributor has to deliberately bypass.

## Exercises

1. Add a real `update_price(name, new_price)` function to
   `parts_repository.py`, following this lesson's own `add_part` shape
   (a real `UPDATE`, wrapped in `with conn:`). Use it to change a real
   part's price, and confirm the change with `get_part_by_name`.
2. Add a real `low_stock_parts()` function wrapping Lesson 12's own
   `low_stock` view (`SELECT * FROM low_stock`), and confirm it returns
   real `sqlite3.Row` objects readable by column name, exactly like
   every other function in this lesson's own module.

## Definition of Done

- [ ] You created `parts_repository.py` with all three real functions
      shown above.
- [ ] You used it from a separate script with zero raw SQL or
      connection code in that script.
- [ ] You reproduced the real `TypeError` caused by a careless,
      repository-bypassing function that forgot `row_factory`, and can
      explain exactly why the repository prevents that mistake by
      default rather than by force.
- [ ] You completed both exercises.

## Next

[Lesson 23 — Testing Against an In-Memory Database](lesson-23-testing-against-an-in-memory-database.md)
gives this lesson's own repository module a real, automated test suite
— run against a real database that never touches `pocket_hardware.db`
at all.
