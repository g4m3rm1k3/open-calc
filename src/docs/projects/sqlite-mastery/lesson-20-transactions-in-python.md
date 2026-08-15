# Lesson 20: Transactions in Python

**What you will build:** real, direct proof of what happens to a real
write when `conn.commit()` is genuinely never called — and a real,
common misconception about Python's own `with conn:` syntax, corrected
by running it and reading exactly what it does and doesn't do.

**What you need to know first:** [Lesson 17](lesson-17-connecting-from-python.md)
— `conn.commit()`'s own basic use, left deliberately unexplained in
depth there. [Lesson 14](lesson-14-transactions-and-acid.md) — the real
SQL-level `BEGIN`/`COMMIT`/`ROLLBACK` this lesson's own Python code sits
directly on top of.

**Terms introduced in this lesson:** none new — Python's own default
transaction behavior and `Connection`'s context-manager protocol are
this lesson's subject, covered as Objects and methods below.

**Objects and methods used:**

**`Connection.rollback()`**
- *What it is:* a real method on a `Connection` object.
- *Implementation:* `conn.rollback()` — discards every real change made
  since the last `commit()`, the identical guarantee Lesson 14's own
  SQL `ROLLBACK` already proved.
- *Its use:* undoing a real, deliberately bad write in this lesson's
  own second unit.

**`Connection` as a context manager**
- *What it is:* real, built-in support for Python's own `with`
  statement, directly on a `Connection` object.
- *Implementation:* `with conn:` — on successful exit from the block,
  calls `conn.commit()` automatically; on an exception, calls
  `conn.rollback()` automatically instead. It does **not** close the
  connection either way — proven directly below.
- *Its use:* removing the risk of a forgotten `commit()`/`rollback()`
  call from this project's own future code.

---

## Concept Unit: Nothing Commits Automatically — Proven With a Real Lost Write

### The Problem

Lesson 17's own two scripts both called `conn.commit()` — but never
explained what would happen without it. Is `commit()` a real
requirement, or a defensive habit that happened not to matter yet?

### Introduce the Concept in Isolation

A real write, deliberately left uncommitted, in a script that ends
without ever calling `commit()`:

```python
import sqlite3

conn = sqlite3.connect("pocket_hardware.db")
conn.execute(
    "INSERT INTO parts (name, price, quantity, supplier_id) VALUES ('Ghost Part', 1.00, 1, 1)"
)
# No conn.commit() here — the script simply ends.
```

A second, completely separate real script, run immediately afterward:

```python
import sqlite3

conn = sqlite3.connect("pocket_hardware.db")
row = conn.execute("SELECT * FROM parts WHERE name = 'Ghost Part'").fetchone()
print(row)
```

```
$ python write_uncommitted.py
$ python check.py
None
```

`Ghost Part` is real, genuinely gone — `check.py`, a fresh connection to
the exact same real file, finds nothing. The first script's own
`INSERT` really ran (SQLite's own real query engine processed it
without error), but with no `commit()` ever called, and the connection
object simply falling out of scope as the script ended, SQLite's own
real default discarded it — the identical real fate Lesson 14's own
`ROLLBACK` proved directly at the SQL level, happening here silently,
by default, for a write that was never explicitly resolved either way.

### Discard

`write_uncommitted.py` and `check.py` are real, disposable proof;
`Ghost Part` never becomes a real, permanent row in this project — that
was this unit's own entire point.

### Mechanical Walkthrough

- `conn.execute("INSERT INTO parts (...) VALUES (...)")` — **(a) first
  appearance** of calling `execute` directly on a `Connection` rather
  than through an explicit `cur = conn.cursor()` first — a real,
  equivalent shorthand `sqlite3` provides, creating a throwaway cursor
  internally; `INSERT INTO parts (...)` itself — **(b) hard concept
  reappearing**, Lesson 03's own shape.
- *(no `conn.commit()` call at all)* — the deliberate absence is this
  unit's own real point, not a typo.

### CS Lens

This is real, direct proof of SQLite's own **implicit transaction**
behavior, reached from Python instead of the CLI: an `INSERT` (a real
Data Modification Language statement) implicitly opens a transaction
the moment it runs, if none is already open — the exact same real
`BEGIN`/`COMMIT` machinery Lesson 14 already named directly, just never
spelled out in the Python code itself.

### SE Lens

The real alternative SQLite's own `sqlite3` module could have chosen —
autocommitting every single statement immediately, with no implicit
transaction at all — was deliberately not made Python's own default,
for a real reason directly connected to this series' own Lesson 14: a
genuinely multi-statement change (Lesson 24's own migrations) needs the
ability to fail partway through and leave nothing behind, exactly the
real guarantee an implicit per-statement autocommit would remove. The
real cost of that design, honestly named: a forgotten `commit()` — this
lesson's own first unit — fails completely silently, with no exception,
no warning, and a real write that quietly never happened.

## Concept Unit: `with conn:` — Automatic Resolution, Not Automatic Closing

### The Problem

A forgotten `commit()` is a real, silent risk. Can Python's own `with`
statement remove that risk the way it removes a forgotten `file.close()`
elsewhere in ordinary Python?

### Introduce the Concept in Isolation

A real write, this time inside a `with` block:

```python
import sqlite3

conn = sqlite3.connect("pocket_hardware.db")

with conn:
    conn.execute(
        "INSERT INTO parts (name, price, quantity, supplier_id) VALUES ('Level Vial Kit', 11.50, 4, 1)"
    )

row = conn.execute("SELECT * FROM parts WHERE name = 'Level Vial Kit'").fetchone()
print(row)
```

```
$ python with_conn.py
(9, 'Level Vial Kit', 11.5, 4, 1)
```

Real, permanent, with no explicit `conn.commit()` anywhere in the
script — `with conn:` committed it automatically the instant the block
exited successfully. And the real, easy-to-assume-wrong part, proven
directly: the `SELECT` immediately *after* the `with` block still ran,
against the same still-open `conn` — `with conn:` never closed the
connection at all, unlike almost every other real Python `with`-managed
resource (an open file, for instance, genuinely does close at the end
of its own `with` block). Attempting the same call once the script
would naturally end and Python cleans up confirms the connection was
never closed by `with` itself — it remains real and usable for as many
further real queries as the rest of the script needs, right up until an
explicit `conn.close()` or the process actually exits.

A real, deliberate failure, proving the automatic-rollback half of the
same guarantee:

```python
with conn:
    conn.execute(
        "INSERT INTO parts (name, price, quantity, supplier_id) VALUES ('Bad Part', 5.00, 2, 1)"
    )
    raise RuntimeError("simulated failure mid-transaction")
```

```
$ python with_conn_fail.py
Traceback (most recent call last):
  ...
RuntimeError: simulated failure mid-transaction
$ sqlite3 pocket_hardware.db "SELECT * FROM parts WHERE name = 'Bad Part';"
```

The real exception propagates normally — `with conn:` never silently
swallows it — and a follow-up real check at the CLI confirms `Bad Part`
was never actually written: the exception triggered `conn.rollback()`
automatically before propagating, the exact same real guarantee Lesson
14's own explicit `ROLLBACK` already proved, now happening without a
single line of `try`/`except` written by hand.

### Discard

`Level Vial Kit` is a real, permanent ninth... tenth real row in
`parts`, kept intentionally as proof `with conn:` genuinely committed
it; `with_conn_fail.py` and its own `Bad Part` are real, disposable
proof — `Bad Part` never becomes a real row, which was the whole point.

### Mechanical Walkthrough

- `with conn:` — **(a) first appearance** of `Connection`'s own context-
  manager protocol, full treatment above; `with` itself — **(c) already
  basic**, ordinary Python.
- `conn.execute(...)` inside the block — **(b) hard concept
  reappearing**, this lesson's own first unit already introduced calling
  `execute` directly on a connection.
- `raise RuntimeError(...)` — **(c) already basic**, ordinary Python
  exception raising, used here purely to trigger `with conn:`'s own
  real rollback behavior on a real error.

### CS Lens

`with conn:` implements the real **RAII-adjacent** pattern (Resource
Acquisition Is Initialization, a term from C++, applied here loosely
since Python's own garbage collection means the "acquisition" half is
less strict) — tying a resource's own cleanup/resolution to a block's
own scope, so successful completion and early, exceptional exit both
have a real, guaranteed, automatic outcome instead of relying on
code at the end of the block that might never be reached.

Also recognized in: Python's own `with open(path) as f:` (though that
one *does* close its resource, unlike `Connection`), a `try`/`finally`
block guaranteeing cleanup regardless of an exception, a lock released
automatically at the end of a `with lock:` block even if the code
inside raises.

### SE Lens

The real, easy mistake this lesson's own second unit exists to prevent:
assuming `with conn:` behaves like every *other* `with`-managed
resource in Python and closes the connection — a real, false assumption
that would lead to either a real resource leak (never closing it
explicitly at all) or a confusing real error (using `conn` again after
wrongly assuming it was closed). The real, correct mental model, proven
directly above rather than asserted: `with conn:` manages one
transaction's own resolution, once, per block — closing the connection
itself remains a separate, explicit responsibility, exactly like it was
in Lesson 17.

## Connect the pieces

Two real proofs, same underlying default: an `INSERT` run with no
`commit()` at all was silently, completely discarded — `Ghost Part`,
real when written, gone by the time a second connection looked for it,
proof SQLite's own real implicit-transaction behavior requires an
explicit resolution, one way or the other. `with conn:` then proved
both directions of that same resolution can happen automatically:
`Level Vial Kit` committed for real on a clean exit, `Bad Part` rolled
back for real on a raised exception — and, separately, proved `with
conn:` never closes the connection itself, confirmed directly by
successfully querying `conn` again immediately afterward.

## What breaks without this

Call `conn.rollback()` after a real `commit()` has already happened, in
the same script:

```python
conn.execute("INSERT INTO parts (name, price, quantity, supplier_id) VALUES ('Too Late', 1.0, 1, 1)")
conn.commit()
conn.rollback()
row = conn.execute("SELECT * FROM parts WHERE name = 'Too Late'").fetchone()
print(row)
```

```
$ python too_late.py
(11, 'Too Late', 1.0, 1, 1)
```

`Too Late` survives — `rollback()` called *after* a `commit()` has
nothing left to undo; `commit()` already made the change real and
permanent, and SQLite's own real transaction boundary resets the moment
it runs. This is direct, provable proof that `commit()`/`rollback()`
only ever affect changes made since the *last* resolution, never
retroactively — exactly why `with conn:`'s own automatic behavior
(commit on success, rollback on exception, always at the moment the
block itself resolves) is safer than manually placed calls that can be
written in the wrong order by mistake.

## Exercises

1. Reproduce this lesson's own real "lost write" proof yourself, with
   a part of your own choosing, and confirm a fresh connection genuinely
   finds nothing.
2. Reproduce the real `with conn:` rollback-on-exception proof
   yourself, then change the raised exception to a real, caught
   `try`/`except` around the `with` block instead of letting it
   propagate — confirm the real row is still correctly rolled back even
   though the exception itself never reaches the top of the script.

## Definition of Done

- [ ] You reproduced the real silent data loss from a never-committed
      `INSERT`.
- [ ] You reproduced `with conn:`'s own real automatic commit on
      success and automatic rollback on a raised exception.
- [ ] You confirmed directly that `with conn:` does not close the
      connection, by successfully querying it again afterward.
- [ ] You reproduced the real "rollback after commit does nothing"
      proof and understand why transaction boundaries don't retroact.
- [ ] You completed both exercises.

## Next

[Lesson 21 — `executemany` and Bulk Loading](lesson-21-executemany-and-bulk-loading.md)
gives this project a real, efficient way to write many rows at once
from Python — every `INSERT` so far in this arc has written exactly
one row per `execute` call.
