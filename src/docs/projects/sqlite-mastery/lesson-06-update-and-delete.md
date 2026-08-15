# Lesson 06: `UPDATE` and `DELETE`

**What you will build:** a real supplier-quoted price for `parts`'
`Screwdriver Set` row (Lesson 05's real `NULL`, now resolved), a real
discontinued row added and then really removed — and, deliberately
against a disposable copy only, direct proof of the single most
dangerous real mistake either statement can make.

**What you need to know first:** [Lesson 04](lesson-04-select-where-order-by-limit.md)
— `WHERE`'s real predicate mechanics, reused here to target which rows
`UPDATE`/`DELETE` affect. [Lesson 05](lesson-05-null-and-three-valued-logic.md)
— the real, missing `price` this lesson's own `UPDATE` resolves.

**Terms introduced in this lesson:** none new — `UPDATE`/`DELETE` are
this lesson's own subject, covered under Objects and methods below;
every other piece (`WHERE`, comparison operators) already has full
treatment from Lessons 04–05.

**Objects and methods used:**

**`UPDATE`**
- *What it is:* the real SQL statement that modifies existing rows'
  column values, without removing or adding any row.
- *Implementation:* `UPDATE table SET col1 = val1 [, col2 = val2 ...]
  WHERE predicate;` — `WHERE` is syntactically optional; every row
  satisfying it (or every row in the table, if omitted) gets the same
  new value(s) written.
- *Its use:* giving `Screwdriver Set` a real price for the first time.

**`DELETE`**
- *What it is:* the real SQL statement that removes entire rows.
- *Implementation:* `DELETE FROM table WHERE predicate;` — `WHERE` is,
  again, syntactically optional; every row satisfying it (or every row,
  if omitted) is permanently removed.
- *Its use:* removing a real, deliberately-added discontinued row from
  `parts`.

---

## Concept Unit: `UPDATE` — Changing a Row Without Replacing It

### The Problem

Lesson 05 proved `Screwdriver Set`'s `price` is a real, genuine `NULL`
— not a placeholder value, but a legitimately absent one. A real
supplier has now quoted a real price. Nothing about `INSERT` (Lesson 03)
can help here: that statement only ever adds a *new* row; this table
already has the right row, missing only one correct value.

### Introduce the Concept in Isolation

```
$ sqlite3 pocket_hardware.db
sqlite> .headers on
sqlite> .mode column
sqlite> SELECT * FROM parts WHERE name = 'Screwdriver Set';
id  name             price  quantity
--  ---------------  -----  --------
6   Screwdriver Set         8
```

```
sqlite> UPDATE parts SET price = 19.99 WHERE name = 'Screwdriver Set';
sqlite> SELECT * FROM parts WHERE name = 'Screwdriver Set';
id  name             price  quantity
--  ---------------  -----  --------
6   Screwdriver Set  19.99  8
```

Row 6's own `id` (`6`) is unchanged — this is the exact same real row,
not a new one replacing it; only its `price` column changed, from
genuinely missing to `19.99`, exactly as `SET` named. `quantity` (`8`)
is untouched too — `UPDATE`'s `SET` clause only ever touches the
columns it explicitly names.

`.changes on`, a real dot-command, proves exactly how many rows one
`UPDATE` actually touched:

```
sqlite> .changes on
sqlite> UPDATE parts SET price = 19.99 WHERE name = 'Screwdriver Set';
changes: 1   total_changes: 2
sqlite> .changes off
```

`changes: 1` — this specific statement modified exactly one real row
(the same value it already had, run a second time here purely to show
the count; still one real matched row). `total_changes: 2` is a running
total across this whole session, including the first, unshown-count
`UPDATE` moments earlier.

### Discard

Nothing throwaway — `Screwdriver Set` now permanently carries a real
price for the rest of this series.

### Mechanical Walkthrough

- `UPDATE parts SET price = 19.99 WHERE name = 'Screwdriver Set';` —
  **(a) first appearance** of `UPDATE`/`SET` together: `UPDATE parts`
  names the target table; `SET price = 19.99` is an assignment, not a
  comparison, despite reusing the `=` symbol Lesson 04 introduced as a
  comparison operator — the same character, a genuinely different
  meaning depending on which clause it appears in. `WHERE name =
  'Screwdriver Set'` — **(b) hard concept reappearing**: Lesson 04's own
  `WHERE`/`=`, here used in its original comparison sense, filtering
  which row(s) `SET` applies to.
- `.changes on` / `.changes off` — **(a) first appearance**, a
  dot-command (Lesson 01's category) toggling whether the CLI reports
  each statement's real affected-row count.

### CS Lens

`UPDATE` is a real, **in-place mutation** — the row's own identity
(`id`/`rowid`, per Lesson 02's proof) persists across the change,
distinct from removing the old row and inserting a new one with fresh
identity, even though the visible end state (the same columns, new
values) can look identical either way.

Also recognized in: any object's field reassignment in an
object-oriented language (`obj.price = 19.99` mutates the same object,
doesn't create a new one), a spreadsheet cell edited in place, a Git
commit that amends a file's content while the file's own path/identity
stays the same.

### SE Lens

`UPDATE`'s `WHERE` clause is what makes a mutation *targeted* rather
than *global* — the real alternative, `WHERE` omitted entirely, is this
lesson's own closing "What breaks without this," deliberately not run
against real project data. The real design question `WHERE`'s optional
syntax raises, honestly: SQL trusts the author to supply it whenever a
targeted change is intended, rather than requiring an explicit
"update everything" keyword the way a genuinely safer design might —
a real, load-bearing gap this lesson's own closing section proves has
real teeth.

## Concept Unit: `DELETE` — Removing Rows, Permanently

### The Problem

A real hardware store occasionally discontinues a part. Neither
`UPDATE` (changes values, never removes a row) nor anything covered so
far can make a row stop existing.

### Introduce the Concept in Isolation

A real row, added specifically to be removed again — proving `DELETE`
against genuinely real (if short-lived) project data, not a throwaway
table:

```
sqlite> INSERT INTO parts (name, price, quantity) VALUES ('Old Rusty Hinge', 1.00, 3);
sqlite> SELECT * FROM parts;
id  name             price  quantity
--  ---------------  -----  --------
1   Hammer           12.99  4
2   Wrench           8.5    10
3   Drill            45.0   2
4   Tape Measure     6.25   15
5   Level            14.75  6
6   Screwdriver Set  19.99  8
7   Old Rusty Hinge  1.0    3
```

```
sqlite> DELETE FROM parts WHERE name = 'Old Rusty Hinge';
sqlite> SELECT * FROM parts;
id  name             price  quantity
--  ---------------  -----  --------
1   Hammer           12.99  4
2   Wrench           8.5    10
3   Drill            45.0   2
4   Tape Measure     6.25   15
5   Level            14.75  6
6   Screwdriver Set  19.99  8
```

Row 7 is completely gone — not blanked, not marked inactive, genuinely
absent from every column. `parts` is back to exactly six real rows,
`id`s 1 through 6 unchanged and untouched by the row 7 that briefly
existed between them and nothing.

### Discard

Nothing throwaway — `Old Rusty Hinge` was real, added and removed on
purpose, inside this lesson's own real project data, to prove `DELETE`
against a genuine row rather than a disposable scratch table.

### Mechanical Walkthrough

- `INSERT INTO parts (name, price, quantity) VALUES ('Old Rusty Hinge',
  1.00, 3);` — **(c) already basic**, Lesson 03's own column-list
  `INSERT` form, unchanged.
- `DELETE FROM parts WHERE name = 'Old Rusty Hinge';` — **(a) first
  appearance** of `DELETE FROM`: names the target table exactly like
  `UPDATE` does, with no `SET`-equivalent clause at all — there is
  nothing to assign, only rows to remove. `WHERE name = 'Old Rusty
  Hinge'` — **(c) already basic**, the identical already-explained
  `WHERE`/`=` shape.

### CS Lens

`DELETE` is a real **destructive operation**: the removed row's data is
not recoverable from inside the database itself afterward — no undo,
no version history, nothing short of a real backup (this series' own
Lesson 52) restores it.

Also recognized in: `rm` on a filesystem with no trash/recycle bin,
`git gc` permanently pruning unreachable commits after enough time has
passed, any in-memory data structure's own `remove`/`delete` — the
distinguishing question is always the same: does anything, anywhere,
retain the old state, or is this the only copy?

### SE Lens

The real, honest tradeoff this project is carrying, unresolved until a
later lesson: `DELETE` here is a real **hard delete** — permanent,
irreversible, no trace left. A real, common alternative — a **soft
delete** (an `is_discontinued` flag column, `UPDATE`d rather than the
row ever being `DELETE`d) — keeps the data recoverable and preserves
historical queries ("what did we used to stock?") at the real cost of
every future query needing to remember to filter discontinued rows out.
This series' own `pocket-inventory-wpf` sibling project uses exactly
that soft-delete pattern for the identical real reason; this lesson's
own `parts` table uses a real hard delete deliberately, to prove
`DELETE`'s actual, permanent behavior honestly before ever reaching for
a pattern that hides it.

## Connect the pieces

Two real, permanent changes, and one real mechanism connecting them:
`UPDATE parts SET price = 19.99 WHERE name = 'Screwdriver Set'` resolved
Lesson 05's own genuine `NULL`, mutating one real row's one real column
in place, its `id`/identity unchanged throughout. `DELETE FROM parts
WHERE name = 'Old Rusty Hinge'` then proved the opposite kind of real
change — not modifying a row, but making one stop existing entirely,
with nothing left behind. Both statements share the identical
`WHERE`-targets-which-rows mechanism Lesson 04 already proved for
`SELECT` — the same clause, doing the same real filtering job, now
deciding what gets changed or destroyed instead of merely what gets
read.

## What breaks without this

`WHERE` is syntactically optional on both statements — proven, once,
against a disposable copy of `parts`' own shape, never against the real
project table:

```
$ sqlite3 danger_probe.db
sqlite> CREATE TABLE parts_copy (id INTEGER PRIMARY KEY, name TEXT, price REAL, quantity INTEGER);
sqlite> INSERT INTO parts_copy (name, price, quantity) VALUES
   ...>     ('Hammer', 12.99, 4), ('Wrench', 8.50, 10), ('Drill', 45.00, 2);
sqlite> SELECT * FROM parts_copy;
id  name    price  quantity
--  ------  -----  --------
1   Hammer  12.99  4
2   Wrench  8.5    10
3   Drill   45.0   2
sqlite> DELETE FROM parts_copy;
sqlite> SELECT * FROM parts_copy;
sqlite>
```

`DELETE FROM parts_copy;` — with no `WHERE` at all — really did delete
every single row, silently, with no confirmation prompt and no error:
the final `SELECT *` above returns nothing at all, not even a header
row. This is the exact real danger this lesson's Header promised: the
only real difference between "remove one specific discontinued part"
and "erase this entire table" is the presence or absence of one clause
— and SQL enforces nothing that would stop the second one from running
by mistake. (`UPDATE` with no `WHERE` is the identical danger, one
statement over: every row gets the same new value, silently,
all at once.) This is real, permanent proof of why this series' own
Lesson 14, on transactions, and Lesson 52, on real backups, both exist —
`WHERE`'s optionality alone is not a safety net.

## Exercises

1. Reproduce this lesson's real `UPDATE`/`.changes on` proof yourself,
   against a throwaway table of your own: run one `UPDATE` matching
   zero rows (a `WHERE` clause that matches nothing real) and confirm
   `.changes` reports `0` — direct proof `UPDATE` doesn't error just
   because nothing matched.
2. Reproduce this lesson's closing WHERE-less `DELETE` catastrophe
   yourself, against your own disposable copy — then reproduce the
   equivalent mistake for `UPDATE`: run `UPDATE parts_copy SET price =
   0;` with no `WHERE` on a freshly reseeded copy, and confirm every
   row's price is now really, identically `0`.

## Definition of Done

- [ ] You gave `Screwdriver Set` a real price with `UPDATE` and
      confirmed its `id` stayed unchanged, proving this was a mutation,
      not a replacement.
- [ ] You added and then really removed `Old Rusty Hinge` with `DELETE`,
      confirming it left no trace in a follow-up `SELECT *`.
- [ ] You reproduced the real WHERE-less `DELETE FROM parts_copy;`
      catastrophe against a disposable copy only, and can state why
      SQL allows it with no warning.
- [ ] You completed both exercises.

## Next

[Lesson 07 — Constraints](lesson-07-constraints.md) gives this lesson's
own real gap — nothing stops `price` or `quantity` from ever holding a
genuinely nonsensical value, like a negative quantity — its real,
enforced fix.
