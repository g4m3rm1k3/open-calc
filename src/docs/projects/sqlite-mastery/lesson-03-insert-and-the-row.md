# Lesson 03: `INSERT` and the Row

**What you will build:** two more real rows in `pocket_hardware.db`'s
`parts` table, written with `INSERT`'s real, full range of forms — not
just the single positional shape Lesson 02 used once, in passing, to
prove a different point.

**What you need to know first:** [Lesson 02](lesson-02-create-table-and-type-affinity.md)
— the real `parts` table and its four columns, which every `INSERT` in
this lesson writes into.

**Terms introduced in this lesson:**
- **Row** — one real, complete record inside a table, matching the
  table's declared column shape — the actual unit `INSERT` creates and
  `SELECT` (Lesson 04) reads back.
- **Column list** — the parenthesized, explicit list of column names in
  an `INSERT` statement, naming exactly which columns the given values
  belong to.

**Objects and methods used:**

**`INSERT INTO ... VALUES`**
- *What it is:* the real SQL statement that adds one or more new rows to
  a table — this lesson's own main subject; Lesson 02 used its simplest
  form once without full explanation, to prove a type-affinity point
  unrelated to `INSERT` itself.
- *Implementation:* `INSERT INTO table_name [(col1, col2, ...)] VALUES
  (val1, val2, ...) [, (val1, val2, ...) ...];` — a table name, an
  optional explicit column list, and one or more parenthesized value
  tuples, comma-separated.
- *Its use:* every real row `pocket_hardware.db` has ever received, in
  this lesson and every one before it.

---

## Concept Unit: Positional vs. Named `INSERT` — and What an Omitted Column Becomes

### The Problem

Lesson 02 wrote `INSERT INTO parts (name, price, quantity) VALUES
('Hammer', 12.99, 4);` three times without ever explaining the
parenthesized `(name, price, quantity)` part, or what would happen to a
column left out of it entirely. Both questions matter before writing
another row for real.

### Introduce the Concept in Isolation

A throwaway three-column table, written into two different ways:

```
$ sqlite3 insert_probe.db
sqlite> CREATE TABLE probe (id INTEGER PRIMARY KEY, label TEXT, note TEXT);
sqlite> INSERT INTO probe VALUES (1, 'full-positional', 'all three given');
sqlite> INSERT INTO probe (label) VALUES ('partial-named');
sqlite> SELECT rowid, id, label, note FROM probe;
1|1|full-positional|all three given
2|2|partial-named|
```

Row 1's `INSERT` gave no column list at all — every column's value is
supplied **positionally**, in the exact order `probe` declared them
(`id`, then `label`, then `note`), and there must be exactly one value
per column. Row 2's `INSERT` named only `label` in an explicit **column
list**; every column left out of that list — here, `id` and `note` —
receives no explicit value, and `note`'s value in the result above is
genuinely absent, not the four-character text `"null"` — a real, missing
value, printed as nothing by the CLI's default output mode. (`id`, being
an `INTEGER PRIMARY KEY`/`rowid` alias per Lesson 02, is the one
exception: a genuinely missing `id` is auto-assigned a real new integer
rather than left absent, which is why row 2 still got a real `id` of
`2`.)

Positional `INSERT` is fragile in a real, provable way — it silently
depends on the table's exact declared column order:

```
sqlite> INSERT INTO probe VALUES (5, 'too-few');
Error: in prepare, table probe has 3 columns but 2 values were supplied
```

A real, specific error, not silent misassignment — SQLite refuses to
guess which two of `probe`'s three columns these two values were meant
for.

### Discard

`insert_probe.db` and its throwaway `probe` table are deleted now;
neither reappears.

### Project Change

- **Reference Source** — no reference counterpart; this project's own
  schema and data.
- **Files affected** — `pocket_hardware.db`, modified (two new real
  rows added to the already-existing `parts` table).
- **Change type** — add (data, not schema — `parts`' shape is unchanged
  from Lesson 02).
- **Location** — appended to `parts`, after the three rows Lesson 02
  already wrote.
- **Dependencies** — the real `parts` table, already created in
  Lesson 02.

### The New Code

```sql
INSERT INTO parts (name, price, quantity) VALUES
    ('Tape Measure', 6.25, 15),
    ('Level', 14.75, 6);
```

### The Updated Project

`parts` already held three real rows from Lesson 02; this statement adds
two more, using the explicit column-list form this unit just proved is
the safer choice — `id` is left out of the column list on purpose, the
same way row 2's throwaway `probe` insert left it out above, so SQLite
keeps auto-assigning it:

```
id  name          price  quantity
--  ------------  -----  --------
1   Hammer        12.99  4
2   Wrench        8.5    10
3   Drill         45.0   2
4   Tape Measure  6.25   15   ← new
5   Level         14.75  6    ← new
```

`parts` now holds five real rows — Lesson 02's original three, plus
these two — every one written with the explicit column-list form, and
every `id` auto-assigned rather than hand-typed.

### Mechanical Walkthrough

- `INSERT INTO parts (name, price, quantity) VALUES` — **(b) hard
  concept reappearing**: the exact statement shape Lesson 02 already
  used three times, now given its full explanation above rather than
  reused silently.
- `('Tape Measure', 6.25, 15),` — **(a) first appearance** of a
  **multi-row `VALUES` list**: more than one parenthesized value tuple,
  comma-separated, inside a single `INSERT` statement — new specifically
  because every earlier `INSERT` in this series wrote exactly one row
  per statement.
- `('Level', 14.75, 6);` — **(c) already basic**, a second value tuple
  in the same already-explained shape as the first.

### CS Lens

A single multi-row `INSERT` is one real **batch operation**: the
database engine receives every new row in one call, rather than the
caller looping and issuing N separate single-row statements.

Also recognized in: batched HTTP requests (sending ten records in one
POST instead of ten), `git add` staging multiple files in one command,
SIMD instructions applying one operation across several values at once
— the same underlying shape, "do this once, for many," recurring at
very different scales.

### SE Lens

The real, named alternative not chosen for this lesson's own two new
rows: N separate `INSERT INTO parts (...) VALUES (...)` statements, one
per row — functionally equivalent right now, with two real costs this
project is deliberately avoiding early: each separate statement is its
own separate round trip to the database engine (irrelevant at two rows,
genuinely costly once Arc 2's Python layer is loading hundreds), and
each one is, by default, its own separate transaction (Lesson 14's own
subject) — meaning a crash halfway through N single-row inserts can
leave some committed and others not, where one multi-row `INSERT`
either writes every row or none.

## Connect the pieces

`parts` now holds five real rows: Lesson 02's original three, written
one statement at a time using the column-list form now fully explained,
plus two more written in this lesson's own single multi-row `INSERT` —
proven, by this unit's own throwaway `probe` table, to behave correctly
whether values are given positionally (fragile, tied to declared column
order) or by explicit column list (safe, and the only form that lets a
column be skipped and default to a real, genuinely missing value).

## What breaks without this

Attempt the same column-count mistake this lesson's isolated lab already
proved, now against the real `parts` table instead of a throwaway one:

```
$ sqlite3 pocket_hardware.db "INSERT INTO parts VALUES (99, 'Bad Row');"
Error: in prepare, table parts has 4 columns but 2 values were supplied
```

The same real, specific error as the throwaway lab, now naming
`parts`'s own real column count (`4`, not `probe`'s `3`) — direct proof
this isn't a fact about the throwaway table specifically, but about
positional `INSERT` generally: it always requires exactly one value per
declared column, with no partial form available at all. (The
column-list form used throughout this lesson has no equivalent failure
mode here — omitting a column from an explicit list is valid syntax,
proven above, not a mistake.)

## Exercises

1. Add a sixth real row to `parts` — any hardware-store item you choose
   — using the explicit column-list form, and confirm with `SELECT *
   FROM parts;` that it received a real, correctly auto-assigned `id`.
2. Reproduce this lesson's "omitted column becomes genuinely missing"
   proof yourself: insert a row into `parts` naming only `name` in the
   column list (leaving out `price` and `quantity` both), then run
   `SELECT name, price, quantity FROM parts WHERE name = '<your
   value>';` and confirm both omitted columns come back empty rather
   than `0`.

## Definition of Done

- [ ] You reproduced the positional-vs-column-list proof against a
      throwaway table, including the real "too few values" error.
- [ ] You added two real rows to `parts` using a single multi-row
      `INSERT`, and confirmed both with a real `SELECT *`.
- [ ] You caused the real "has 4 columns but 2 values were supplied"
      error against the real `parts` table and understood why it names
      `4`, not some other number.
- [ ] You completed both exercises.

## Next

[Lesson 04 — `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`](lesson-04-select-where-order-by-limit.md)
gives real, structured shape to reading rows back — every `SELECT` so
far in this series has been `SELECT *` or a fixed column list with no
real filtering or ordering at all.
