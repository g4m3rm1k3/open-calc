# Lesson 21: `executemany` and Bulk Loading

**What you will build:** a real, three-part shipment loaded into
`parts` in one call, replacing a real Python loop that did the
identical job one row, one `execute()` call, at a time.

**What you need to know first:** [Lesson 18](lesson-18-parameterized-queries-and-sql-injection.md)
— the `?` placeholder this lesson's own bulk form reuses unchanged.
[Lesson 03](lesson-03-insert-and-the-row.md) — SQL's own multi-row
`VALUES` list, the direct SQL-level precedent for this lesson's
Python-level equivalent.

**Terms introduced in this lesson:** none new — `executemany` is this
lesson's own subject, covered as Objects and methods below.

**Objects and methods used:**

**`Cursor.executemany()`**
- *What it is:* a real method on a `Cursor` object.
- *Implementation:* `cur.executemany(sql_with_placeholders,
  sequence_of_tuples)` — runs the identical parameterized SQL once per
  tuple in `sequence_of_tuples`, internally, without a Python-level
  loop calling `execute()` repeatedly.
- *Its use:* loading a real, multi-row shipment of new parts in one
  call.

---

## Concept Unit: `executemany` — One Call, Many Rows

### The Problem

A real shipment of new hardware-store stock rarely arrives one item at
a time. Writing a Python `for` loop that calls `execute()` once per
real row works — but repeats the exact same SQL string, re-sent to
SQLite, once per row, for a task that's really one coherent operation:
"load this shipment."

### Introduce the Concept in Isolation

The loop-based version, first, for real comparison:

```python
import sqlite3

shipment = [
    ("Bolt Cutter", 27.50, 5, 1),
    ("Pipe Wrench", 15.25, 8, 1),
    ("Caulk Gun", 12.00, 10, 2),
]

conn = sqlite3.connect("pocket_hardware.db")
for name, price, quantity, supplier_id in shipment:
    conn.execute(
        "INSERT INTO parts (name, price, quantity, supplier_id) VALUES (?, ?, ?, ?)",
        (name, price, quantity, supplier_id),
    )
conn.commit()
```

This real script works correctly — three real rows, safely
parameterized per Lesson 18's own `?` form. The real point this lesson
exists to make: `executemany` does the identical job in one call:

```python
import sqlite3

shipment = [
    ("Bolt Cutter", 27.50, 5, 1),
    ("Pipe Wrench", 15.25, 8, 1),
    ("Caulk Gun", 12.00, 10, 2),
]

conn = sqlite3.connect("pocket_hardware.db")
conn.executemany(
    "INSERT INTO parts (name, price, quantity, supplier_id) VALUES (?, ?, ?, ?)",
    shipment,
)
conn.commit()
```

```
$ python bulk_load.py
$ sqlite3 pocket_hardware.db "SELECT name, price, quantity FROM parts WHERE name IN ('Bolt Cutter', 'Pipe Wrench', 'Caulk Gun');"
Bolt Cutter|27.5|5
Pipe Wrench|15.25|8
Caulk Gun|12.0|10
```

The real, identical three rows, correctly loaded — `shipment` itself,
a real Python `list` of real tuples, is passed directly as
`executemany`'s own second argument; no explicit Python `for` loop
appears in the script at all. Each tuple's own values bind to the same
`?` placeholders Lesson 18 already proved safe, in the same left-to-
right positional order, once per tuple.

### Discard

Nothing throwaway — `Bolt Cutter`, `Pipe Wrench`, and `Caulk Gun` are
three real, permanent new rows in `parts`; `executemany` itself is a
real, permanent tool this project reuses wherever a genuine batch of
rows needs loading (Arc 6's own real, larger dataset, especially).

### Mechanical Walkthrough

- `shipment = [("Bolt Cutter", 27.50, 5, 1), ...]` — **(c) already
  basic**, an ordinary Python list of tuples.
- `conn.executemany("INSERT INTO parts (...) VALUES (?, ?, ?, ?)",
  shipment)` — **(a) first appearance**, full treatment above; the SQL
  string itself — **(b) hard concept reappearing**, Lesson 18's own
  parameterized `INSERT` shape, unchanged.

### CS Lens

`executemany` is a real **batch operation**, the identical shape Lesson
03's own SQL-level multi-row `INSERT` already introduced — here
implemented at the Python-driver level instead of inside a single SQL
statement: many logically-identical operations, submitted together,
rather than one at a time.

Also recognized in: `Array.prototype.map`/a list comprehension applying
one operation across many items in one expression instead of an
explicit loop, a bulk file-upload API accepting many files in one HTTP
request instead of one request per file, vectorized operations in
NumPy applying one operation across an entire array at once rather than
looping in Python.

### SE Lens

The real, honest, twofold benefit: fewer real round trips between
Python and the underlying SQLite C library (each `execute()` call has
real, if small, per-call overhead; `executemany` pays that cost once,
not N times), and genuinely less code to read — the loop-based version
above is not wrong, but `executemany`'s own version states the real
intent ("load this batch") more directly than a `for` loop whose real
purpose has to be inferred from what's inside it. The real limit worth
naming honestly: every row in the batch must share the exact same SQL
statement shape — `executemany` has no way to run N genuinely different
statements in one call, only the same one, N times, against N different
parameter tuples.

## Connect the pieces

One real shipment, three rows, loaded two ways: first with an explicit
Python `for` loop calling `execute()` once per tuple — correct, and a
real, direct application of Lesson 18's own parameterized form — then
with a single `executemany` call doing the identical job, proven by an
identical, real three-row result read back from the CLI afterward.

## What breaks without this

Pass a plain tuple — one single row — where `executemany` expects a
real sequence of tuples:

```
$ python -c "
import sqlite3
conn = sqlite3.connect('pocket_hardware.db')
conn.executemany('INSERT INTO parts (name, price, quantity, supplier_id) VALUES (?, ?, ?, ?)', ('Single Part', 5.0, 1, 1))
"
Traceback (most recent call last):
  ...
sqlite3.ProgrammingError: parameters are of unsupported type
```

A real, immediate rejection — `executemany`'s own second argument must
be a real sequence *of* parameter sequences (a list of tuples, even a
list holding exactly one tuple), never a single flat tuple standing in
for one row's own values. This is direct proof `executemany` and
`execute` are not interchangeable by just adding an `s` — `execute`
takes one row's parameters directly; `executemany` always expects a
real collection of them, one full parameter tuple per intended row,
even for a real batch of size one.

## Exercises

1. Reproduce this lesson's own real bulk-load, then intentionally
   trigger this lesson's own "unsupported type" error by passing a
   single tuple instead of a list containing one, and confirm the exact
   real message.
2. Load a real batch of new rows into `price_history` (Lesson 15) using
   `executemany` directly — bypassing the trigger entirely, a real,
   legitimate use case for backfilling historical data that predates
   this project's own trigger being created. Confirm the real inserted
   rows appear correctly, with no interference from
   `trg_log_price_change` (which only fires on real `UPDATE`s to
   `parts.price`, never on a direct `INSERT` into `price_history`
   itself).

## Definition of Done

- [ ] You loaded a real three-row shipment with an explicit Python
      loop, one `execute()` call per row.
- [ ] You reproduced the identical result using one `executemany` call
      instead.
- [ ] You caused the real "parameters are of unsupported type" error
      and understand why `executemany` always expects a sequence of
      tuples, never one bare tuple.
- [ ] You completed both exercises.

## Next

[Lesson 22 — A Repository Pattern in Python](lesson-22-a-repository-pattern-in-python.md)
gives this arc's own scattered SQL strings — spread across roughly six
lessons' worth of standalone scripts by now — one real, organized home.
