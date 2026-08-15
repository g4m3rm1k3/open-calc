# Lesson 19: `sqlite3.Row` and Dict-Like Access

**What you will build:** real proof that Lesson 17's own tuple-based
row access is a genuine, silent liability the moment a query's column
list changes — and the one-line real fix that removes it entirely.

**What you need to know first:** [Lesson 17](lesson-17-connecting-from-python.md)
— `fetchall()`'s own real tuple-of-tuples return shape, which this
lesson changes without touching a single SQL statement.

**Terms introduced in this lesson:** none new — `sqlite3.Row` is this
lesson's own subject, covered as Objects and methods below.

**Objects and methods used:**

**`sqlite3.Row`**
- *What it is:* a real, built-in row factory class in the `sqlite3`
  module.
- *Implementation:* assigned to `Connection.row_factory` before a
  cursor is created; every row a cursor tied to that connection returns
  afterward is a real `Row` object — supporting both `row[0]` (Lesson
  17's own positional form, still real and valid) and `row["name"]`
  (real, new, by-name access) — plus `dict(row)`, converting a real
  `Row` into a genuine Python `dict`.
- *Its use:* every `fetchall()`/`fetchone()` result from this lesson
  onward, across the rest of this series.

---

## Concept Unit: Positional Access Is Fragile — Proven, Not Assumed

### The Problem

Lesson 17's own `cur.fetchall()` returned real Python tuples —
`('Hammer', 12.99)` — read by numeric position (`row[0]` for `name`,
`row[1]` for `price`). Does that position stay reliable if the query's
own column list ever changes?

### Introduce the Concept in Isolation

A real, small script, reading `parts` by position, followed by the
identical logic against a query with one real, deliberate change — the
column order swapped:

```python
import sqlite3

conn = sqlite3.connect("pocket_hardware.db")
cur = conn.cursor()

cur.execute("SELECT name, price FROM parts WHERE name = 'Drill'")
row = cur.fetchone()
print(f"{row[0]} costs ${row[1]}")

cur.execute("SELECT price, name FROM parts WHERE name = 'Drill'")
row = cur.fetchone()
print(f"{row[0]} costs ${row[1]}")
```

```
$ python positional.py
Drill costs $45.0
45.0 costs $Drill
```

The second line is real, and really wrong — not an error, not a crash,
a genuinely nonsensical sentence, produced by code that never changed
at all. Only the `SELECT`'s own column order changed (`price, name`
instead of `name, price`); `row[0]`/`row[1]` kept reading the exact
same numeric positions, now holding the exact opposite real values.
Nothing about `fetchone()` or the surrounding Python code signals this
happened — the bug is entirely silent, discoverable only by a human
reading the real, absurd output.

### Discard

`positional.py` is real, disposable proof — the swapped-column query is
never written into this project's own real code; every SQL statement
this series has written keeps a fixed, deliberate column order for
exactly this reason.

### Mechanical Walkthrough

- `cur.execute("SELECT price, name FROM parts WHERE name = 'Drill'")` —
  **(b) hard concept reappearing**, Lesson 04's own `SELECT`/`WHERE`
  shape; the reordered column list is the same syntax as always, its
  real consequence on the Python side is this unit's whole point.
- `row[0]` / `row[1]` — **(b) hard concept reappearing**, Lesson 17's
  own positional tuple indexing, unchanged — proven fragile here rather
  than explained again.

### CS Lens

This is a real instance of **positional coupling**: code on one side
(the Python reading `row[0]`) silently depends on an implementation
detail of the other side (the SQL's own exact column order) that
nothing in the language enforces stays in sync.

Also recognized in: a function called with positional arguments instead
of named ones, where reordering the caller's arguments to match a
changed signature is easy to get subtly wrong; a CSV file read by
column index instead of header name, silently misreading every column
the moment someone reorders the source spreadsheet; a binary protocol
with fixed byte offsets, broken the instant a field is inserted before
an existing one.

### SE Lens

The real alternative this lesson's own next unit fixes structurally:
stop coupling to position at all. The cost of *not* fixing it, honestly
stated: every future edit to a `SELECT`'s own column list — adding a
column, reordering for readability, anything — becomes a real,
load-bearing risk to every piece of code reading that query's results
by index, with no error anywhere to catch the mistake.

## Concept Unit: `sqlite3.Row` — Reading a Column by Its Real Name

### The Problem

Reading by name instead of position would remove this entire class of
bug. Does `sqlite3` provide that directly?

### Introduce the Concept in Isolation

The identical two queries, this lesson's own real fix applied first:

```python
import sqlite3

conn = sqlite3.connect("pocket_hardware.db")
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute("SELECT name, price FROM parts WHERE name = 'Drill'")
row = cur.fetchone()
print(f"{row['name']} costs ${row['price']}")

cur.execute("SELECT price, name FROM parts WHERE name = 'Drill'")
row = cur.fetchone()
print(f"{row['name']} costs ${row['price']}")
```

```
$ python by_name.py
Drill costs $45.0
Drill costs $45.0
```

Both lines correct — including the second, whose underlying `SELECT`
still swaps the column order exactly as before. `row["name"]` and
`row["price"]` read by real column name, genuinely unaffected by the
order columns were listed in; changing the SQL's own column order no
longer changes which real value either line reads. `row[0]`/`row[1]`
still work too, unchanged — `sqlite3.Row` adds by-name access without
removing the positional form Lesson 17 already relied on.

### Discard

Nothing throwaway — `conn.row_factory = sqlite3.Row` is a real,
permanent line in every connection this project opens from this lesson
forward.

### Mechanical Walkthrough

- `conn.row_factory = sqlite3.Row` — **(a) first appearance**, full
  treatment above. `row_factory` — a real, settable attribute on a
  `Connection`, controlling what type every future cursor built from it
  returns rows as.
- `row["name"]` — **(a) first appearance** of by-name access on a real
  `Row` object.

### CS Lens

`sqlite3.Row` is a real, minimal instance of the **Adapter pattern**:
wrapping SQLite's own real, ordered row data (fundamentally positional,
the same way the underlying C API returns it) behind an interface
(`row["name"]`) that looks and behaves like a Python `dict`, without
the real memory cost of actually building one for every row unless
`dict(row)` is explicitly called.

Also recognized in: a database ORM's own model instance wrapping a raw
row (Arc 4's own FastAPI/Pydantic layer), a `NamedTuple` in Python
giving positional data real, named fields, a wrapper class around a
third-party library's own awkward return type, written once so every
caller gets a nicer interface.

### SE Lens

The real, small cost of this fix: `conn.row_factory = sqlite3.Row` must
be set once, per connection, before results are fetched — trivial, but
a real, easy-to-forget line the moment a new connection is opened
somewhere in a larger codebase (Arc 4's own multiple endpoint files).
Weighed against that trivial cost: an entire class of silent,
reordering-triggered bugs, this lesson's own first unit already proved
real, closed permanently and unconditionally — the kind of one-line,
asymmetric fix this series treats as a hard default (like Lesson 18's
own parameterized queries) rather than a judgment call per query.

## Connect the pieces

One real bug, proven, then closed: reading `parts` by tuple position
(`row[0]`, `row[1]`) silently broke the instant this lesson's own
second query reordered its `SELECT` list — real, wrong output, with no
error anywhere. `conn.row_factory = sqlite3.Row`, set once per
connection, fixed both queries at once by letting the exact same code
read `row["name"]`/`row["price"]` by real column name instead — proven
correct against both the original and the reordered query, with no
other line of code changed.

## What breaks without this

Access a column name that doesn't exist, on a real `sqlite3.Row`:

```
$ python -c "
import sqlite3
conn = sqlite3.connect('pocket_hardware.db')
conn.row_factory = sqlite3.Row
row = conn.execute('SELECT name, price FROM parts WHERE name = \'Drill\'').fetchone()
print(row['naem'])
"
IndexError: No item with that key
```

A real, immediate, loud failure — not a silent `None`, and not a
resurrection of this lesson's own original silent-wrong-value bug. A
genuine typo in a column name (`naem` instead of `name`) is caught the
instant it's read, proof `sqlite3.Row`'s by-name access is a real,
validated lookup against the query's own actual column set, not a
best-effort guess.

## Exercises

1. Reproduce this lesson's own silent positional-access bug and its
   real fix yourself, using `suppliers` instead of `parts` — swap
   `SELECT name, email` to `SELECT email, name` and confirm
   position-based code breaks while name-based code doesn't.
2. Convert a real `sqlite3.Row` into a genuine Python `dict` with
   `dict(row)`, `print()` it, and confirm its real, printed shape looks
   exactly like an ordinary dict literal — direct proof `dict(row)`
   isn't itself a `Row`, but a real, independent, ordinary `dict` copy.

## Definition of Done

- [ ] You reproduced the real silent bug caused by reordering a
      `SELECT`'s columns under positional access.
- [ ] You fixed it with `sqlite3.Row` and confirmed both the original
      and reordered queries now read correctly by name.
- [ ] You caused the real `IndexError` from a genuine column-name typo
      and understand why that failure is loud instead of silent.
- [ ] You completed both exercises.

## Next

[Lesson 20 — Transactions in Python](lesson-20-transactions-in-python.md)
answers Lesson 17's own deliberately open question: what Python's real,
specific default transaction behavior actually is, and what genuinely
happens if `commit()` is never called at all.
