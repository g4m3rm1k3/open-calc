# Lesson 17: Connecting from Python

**What you will build:** the first Python program in this series to
read and write `pocket_hardware.db` — the exact same file Arc 1 built
entirely from the `sqlite3` CLI, opened for the first time from outside
it, proving nothing about the file itself is CLI-specific.

**What you need to know first:** [Lesson 16](lesson-16-sqlite-specific-tour.md)
— the real, complete `pocket_hardware.db` this lesson connects to. Real
Python syntax (functions, `print`, control flow) is assumed, per this
series' own [README](README.md); nothing SQLite- or database-specific
is.

**Terms introduced in this lesson:**
- **DB-API 2.0** — the real, standard interface every mainstream Python
  database library (this series' own `sqlite3`, plus `psycopg2` for
  Postgres, `pymysql` for MySQL, and others) implements: the same core
  shape — a connection, a cursor, `execute`, `fetchall` — regardless of
  which real database sits underneath it.
- **Connection** — a real, open link to one specific database file,
  the object every other operation in this lesson happens through.
- **Cursor** — a real object that executes SQL statements against a
  connection and tracks a result set's current read position.

**Objects and methods used:**

**`sqlite3.connect()`**
- *What it is:* a real, built-in function in Python's own standard
  library `sqlite3` module — no install required, part of every real
  Python installation.
- *Implementation:* `sqlite3.connect(path)` — returns a real
  `Connection` object linked to the file at `path`, creating it fresh
  if it doesn't exist (Lesson 01's own lazy-creation proof, now visible
  from Python instead of the CLI).
- *Its use:* opening `pocket_hardware.db` for the first time from
  Python.

**`Connection.cursor()`**
- *What it is:* a real method on a `Connection` object.
- *Implementation:* `conn.cursor()` — returns a real, new `Cursor`
  object tied to that connection.
- *Its use:* the object every real query in this lesson runs through.

**`Cursor.execute()`**
- *What it is:* a real method on a `Cursor` object.
- *Implementation:* `cur.execute(sql_string)` — sends `sql_string` to
  SQLite to run, exactly as if typed at the real CLI prompt; returns the
  same cursor, ready to read results from if the statement was a
  `SELECT`.
- *Its use:* every real SQL statement this lesson's Python code runs.

**`Cursor.fetchall()` / `Cursor.fetchone()`**
- *What they are:* real methods on a `Cursor` object, for reading a
  `SELECT`'s own result rows back into Python.
- *Implementation:* `cur.fetchall()` returns every remaining real row
  as a real Python `list` of `tuple`s; `cur.fetchone()` returns just the
  next single row as one `tuple`, or `None` once no rows remain.
- *Its use:* reading `parts`' own real rows into real Python data.

**`Connection.commit()`**
- *What it is:* a real method on a `Connection` object.
- *Implementation:* `conn.commit()` — makes every real change since the
  last commit permanent, the same real guarantee Lesson 14's own SQL
  `COMMIT` already proved; full depth (what happens without it,
  `rollback()`, and Python's own real transaction defaults) is this
  series' own Lesson 20.
- *Its use:* making this lesson's own new row permanent.

---

## Concept Unit: `connect`/`cursor`/`execute`/`fetchall` — Reading Real Rows Into Python

### The Problem

Every real row in `pocket_hardware.db` so far has been read through the
`sqlite3` CLI. Arc 4's own backend and Arc 5's own desktop app both need
that same real data reachable from inside a running Python program
instead.

### Introduce the Concept in Isolation

A real, complete, five-line Python program, reading `parts` for the
first time from outside the CLI:

```python
import sqlite3

conn = sqlite3.connect("pocket_hardware.db")
cur = conn.cursor()
cur.execute("SELECT name, price FROM parts WHERE price > 10")
print(cur.fetchall())
```

Running it, from the same real directory `pocket_hardware.db` already
lives in:

```
$ python read_parts.py
[('Hammer', 12.99), ('Drill', 45.0), ('Level', 14.75)]
```

The identical three real rows Lesson 04's own `WHERE price > 10` proved
against the CLI — now a real Python `list` of real `tuple`s, each one
matching the `SELECT`'s own column order (`name`, then `price`)
exactly. Nothing about the SQL itself changed at all: `cur.execute`'s
own string argument is the exact same real SQL this entire series has
already been writing.

### Discard

`read_parts.py` is a real, disposable script — shown once to prove the
mechanism; every later lesson's own Python code is a real, permanent
piece of this project instead.

### Mechanical Walkthrough

- `import sqlite3` — **(a) first appearance** of importing this
  series' own real, standard-library database module — no install step,
  part of every real CPython distribution.
- `sqlite3.connect("pocket_hardware.db")` — **(a) first appearance**,
  full treatment above.
- `conn.cursor()` — **(a) first appearance**, full treatment above.
- `cur.execute("SELECT name, price FROM parts WHERE price > 10")` —
  **(a) first appearance** of `execute` itself, full treatment above;
  the SQL string inside it — **(b) hard concept reappearing**, Lesson
  04's own `SELECT`/`WHERE`/`>` shape, unchanged.
- `print(cur.fetchall())` — **(a) first appearance** of `fetchall`,
  full treatment above; `print` — **(c) already basic**, ordinary
  Python.

### CS Lens

`sqlite3.connect`/`cursor`/`execute`/`fetchall` together are Python's
own real implementation of **DB-API 2.0** — a standard *interface*,
not a standard *implementation*: the exact same four-call shape works,
with only the connection string changed, against Postgres
(`psycopg2.connect(...)`), MySQL (`pymysql.connect(...)`), or any other
DB-API-compliant Python driver.

Also recognized in: JDBC in Java (the identical idea — one interface,
many real database drivers underneath), ODBC at the operating-system
level, any plugin architecture where a fixed, agreed-upon interface
lets genuinely different real implementations be swapped in without
changing the calling code at all.

### SE Lens

DB-API 2.0's real value is **portability of skill, not of data**: code
written against this lesson's own four calls transfers directly to a
real Postgres-backed FastAPI service (a real, common next step beyond
this series' own scope) with no new concepts to learn, only a different
`connect()` call and a different real connection string — the exact
reason this series' own Arc 3 can prove the same underlying `.db` file
is readable from entirely different languages, while this lesson proves
the *code shape* itself carries across different databases within the
same language.

## Concept Unit: Writing a Real Row From Python, and `commit()`

### The Problem

Reading is only half of what Arc 4's own backend needs. Can Python
write a real, permanent row into `parts`, the same way the CLI has
been doing since Lesson 03?

### Introduce the Concept in Isolation

A second real, small script, adding one genuinely new part:

```python
import sqlite3

conn = sqlite3.connect("pocket_hardware.db")
cur = conn.cursor()
cur.execute(
    "INSERT INTO parts (name, price, quantity, supplier_id) VALUES ('Stud Finder', 24.99, 6, 1)"
)
conn.commit()
conn.close()
```

Confirmed for real, back at the CLI — proof this was a genuine,
permanent write, not something visible only to the Python process that
made it:

```
$ sqlite3 pocket_hardware.db "SELECT * FROM parts WHERE name = 'Stud Finder';"
8|Stud Finder|24.99|6|1
```

A real, new eighth row, with a real, auto-assigned `id` (`8`) — Lesson
02's own `INTEGER PRIMARY KEY` behavior, unchanged and unaware it was
Python, not the CLI, that triggered it this time.

### Discard

Nothing throwaway — `Stud Finder` is a real, permanent ninth... eighth
real row in `parts` from here on, this project's first row ever
written by Python rather than the CLI directly.

### Mechanical Walkthrough

- `cur.execute("INSERT INTO parts (...) VALUES (...)")` — **(b) hard
  concept reappearing** for `execute` itself; the SQL string — **(b)
  hard concept reappearing**, Lesson 03's own column-list `INSERT`
  shape, unchanged.
- `conn.commit()` — **(a) first appearance**, full treatment above.
- `conn.close()` — **(a) first appearance**: releases the real
  connection and its underlying file handle; not calling it eventually
  leaks a real, open file handle, though Python's own garbage collector
  frequently closes it anyway once `conn` goes out of scope — real,
  but not a guarantee this series relies on going forward (Lesson 20's
  own context-manager form removes the need to call it by hand at all).

### CS Lens

`conn.commit()` here is the identical real **atomicity** guarantee
Lesson 14 already proved directly at the SQL level — Python's `sqlite3`
module doesn't invent a new transaction model; it's a thin, real layer
over the exact same SQLite engine and the exact same `BEGIN`/`COMMIT`
machinery this series has already used directly.

### SE Lens

The real, honest gap this lesson leaves open on purpose: what happens
if `conn.commit()` is never called at all, or the program crashes
before reaching it? That real, load-bearing question — and Python's
own real, specific transaction defaults, genuinely worth knowing
precisely rather than assumed — is this series' own Lesson 20, not
answered here; this lesson's own two scripts both call `commit()`
correctly, deliberately, without yet explaining what happens without
it.

## Connect the pieces

One real file, `pocket_hardware.db`, opened twice from Python: once to
read, using `connect`/`cursor`/`execute`/`fetchall` to pull the same
real `price > 10` rows the CLI already proved back in Lesson 04, and
once to write, using the identical `execute` call with a real `INSERT`
string, made permanent with `commit()` and confirmed — genuinely,
independently, back at the real CLI — as a real, permanent eighth row
in `parts`.

## What breaks without this

Run the exact same read script from a directory that doesn't contain
`pocket_hardware.db`:

```
$ cd /tmp && python /path/to/read_parts.py
[]
```

No error — an empty real list, not an exception. `sqlite3.connect`,
per Lesson 01's own lazy-creation proof, silently creates a brand-new,
genuinely empty database at that path rather than raising a real "file
not found" error the way opening a missing file with Python's own
built-in `open()` would. `SELECT ... FROM parts` then fails to find any
`parts` table at all inside that new, empty file — but that specific,
real failure is masked here, because `cur.execute` on a missing table
does raise a real `sqlite3.OperationalError: no such table: parts`, not
run silently; the truly silent part is `connect()` itself, which is
why checking you're pointed at the *right* real file matters before
trusting an empty result.

## Exercises

1. Write a real Python script that reads and prints every row in
   `suppliers`, using `fetchall()`, and confirm the real output matches
   Lesson 07's own CLI-based `SELECT * FROM suppliers;` exactly.
2. Write a second real script using `fetchone()` in a `while` loop
   instead of `fetchall()` — reading `parts` one real row at a time
   until `fetchone()` returns `None` — and confirm it visits every real
   row exactly once, in the same order `fetchall()` would have returned
   them.

## Definition of Done

- [ ] You read real `parts` rows from Python and confirmed the exact
      same three rows Lesson 04's own CLI query returned.
- [ ] You wrote a real new row from Python, called `commit()`, and
      confirmed it independently from the CLI.
- [ ] You caused the real silent-empty-database behavior by pointing at
      a nonexistent file, and understand exactly which part of that
      failure is silent and which part (a missing table) genuinely
      raises.
- [ ] You completed both exercises.

## Next

[Lesson 18 — Parameterized Queries and SQL Injection](lesson-18-parameterized-queries-and-sql-injection.md)
proves this lesson's own `execute` calls have a real, dangerous gap the
instant a query's values come from outside the program itself, rather
than being hardcoded the way every example above was.
