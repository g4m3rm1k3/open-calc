# Lesson 49: SQLite's Limited `ALTER TABLE`, and the Table-Rebuild Pattern

**What you will build:** a real, structural fix Lesson 47 could only
work around until now — a genuine `CHECK` constraint on `tbl_book`,
added not through `ALTER TABLE` (which cannot do this at all) but
through SQLite's own real, documented, twelve-step rebuild procedure.

**What you need to know first:** [Lesson 47](lesson-47-messy-legacy-schema-realities.md)
— `qty_avail`'s own real drift, the exact problem this lesson's own new
constraint partially, honestly guards against. [Lesson 08](lesson-08-primary-and-foreign-keys.md)
— `ALTER TABLE ADD COLUMN`, already proven real and working; this
lesson proves its own real, documented limits.

**Terms introduced in this lesson:**
- **Table rebuild** — SQLite's own real, standard, documented technique
  for schema changes `ALTER TABLE` cannot perform directly: create a
  new table with the desired shape, copy the real data across, remove
  the old table, and rename the new one into its place.

**Objects and methods used:**

**`PRAGMA foreign_key_check`**
- *What it is:* a real, built-in SQLite pragma.
- *Implementation:* `PRAGMA foreign_key_check;` — scans every real row
  in the database and reports any that violate a declared foreign key,
  returning genuinely nothing if none exist.
- *Its use:* the real, final safety check this lesson's own rebuild
  procedure runs before committing.

---

## Concept Unit: What `ALTER TABLE` Cannot Do

### The Problem

Lesson 08 already proved `ALTER TABLE ... ADD COLUMN` real and working.
Does `ALTER TABLE` offer any real, equivalent way to add a `CHECK`
constraint to `tbl_book`, closing Lesson 47's own real drift at its
actual source?

### Introduce the Concept in Isolation

SQLite's own real, documented `ALTER TABLE` grammar supports exactly
four real forms, and no others: `RENAME TO`, `RENAME COLUMN`, `ADD
COLUMN`, and `DROP COLUMN`. There is no real syntax anywhere in it for
adding a `CHECK`, `UNIQUE`, `PRIMARY KEY`, or `FOREIGN KEY` constraint
to a table that already exists — not a real restriction on *this*
specific constraint, but a genuine, documented gap in the statement
itself.

A real, direct, concrete proof of the same underlying limit — even
`ADD COLUMN`'s own real form cannot be used to change an *existing*
column's constraints, only to add a genuinely new one:

```
$ sqlite3 library_system.db "ALTER TABLE tbl_book ADD COLUMN qty_total INTEGER;"
Error: duplicate column name: qty_total
```

The identical real error family Lesson 24 already proved directly —
`ADD COLUMN` refuses to redeclare a column that's already there, with
no real way to pass it a modified definition instead. Every real
`ALTER TABLE` form is additive or renaming only; none of them can
retroactively attach a new rule to data or columns that already exist.

### Discard

Nothing throwaway — this real, confirmed limit is exactly why this
lesson's own next unit exists.

### Mechanical Walkthrough

- `ALTER TABLE tbl_book ADD COLUMN qty_total INTEGER;` — **(b) hard
  concept reappearing**, Lesson 08's own real `ADD COLUMN` form,
  unchanged; the real, "duplicate column name" rejection — **(b) hard
  concept reappearing**, Lesson 24's own identical real error,
  encountered here for a genuinely different, real reason (proving a
  limit, not recovering from a real authoring mistake).

### CS Lens

This is a real, honest instance of a **minimal, deliberately restricted
grammar**: SQLite's own real `ALTER TABLE` implementation supports only
operations that can be performed safely and cheaply, in place, without
rewriting the table's own real, underlying storage — renaming and
adding a column both qualify; retrofitting a constraint that existing
data might already violate does not, and was deliberately left out
rather than implemented unsafely.

### SE Lens

The real, documented reason this restriction exists, rather than being
an oversight SQLite's own developers simply haven't gotten to: safely
adding a `CHECK` constraint to a table already holding real data
requires real, extra work no other `ALTER TABLE` form does — every
existing row must be verified against the new rule *before* it can be
considered valid, a real, structural difference from adding a new,
always-`NULL`-or-`DEFAULT`ed column (Lesson 08's own real case), which
can never violate anything by construction. This lesson's own next
unit is the real, correct, honest way SQLite's own documentation itself
recommends handling exactly this case.

## Concept Unit: The Real, Twelve-Step Rebuild

### The Problem

A genuine `CHECK (qty_avail >= 0 AND qty_avail <= qty_total)` on
`tbl_book` needs to exist, and `ALTER TABLE` alone cannot create it.

### Introduce the Concept in Isolation

SQLite's own real, official, twelve-step procedure, applied directly to
`tbl_book`:

```sql
-- 1. Disable foreign key enforcement for the duration of the rebuild.
PRAGMA foreign_keys = OFF;

-- 2. Start a real transaction — every step below succeeds together, or none does.
BEGIN TRANSACTION;

-- 3. (No real indexes, triggers, or views are defined directly ON tbl_book
--    itself in this schema — nothing to remember or restore for this
--    specific table; vw_overdue references tbl_book by name only, and
--    is unaffected by this change, per step 9 below.)

-- 4. Create a new table with the desired, real, additional constraint.
CREATE TABLE new_tbl_book (
    id INTEGER PRIMARY KEY,
    ttl TEXT NOT NULL,
    isbn TEXT,
    pub_yr INTEGER,
    cat_id INTEGER REFERENCES category(id),
    qty_total INTEGER NOT NULL DEFAULT 1,
    qty_avail INTEGER NOT NULL DEFAULT 1,
    CHECK (qty_avail >= 0 AND qty_avail <= qty_total)
);

-- 5. Copy every real, existing row across.
INSERT INTO new_tbl_book SELECT * FROM tbl_book;

-- 6. Remove the old table.
DROP TABLE tbl_book;

-- 7. Rename the new table into its place.
ALTER TABLE new_tbl_book RENAME TO tbl_book;

-- 8. (No indexes/triggers/views to recreate — none existed on tbl_book.)

-- 9. Confirm no view is broken by this change (vw_overdue, checked
--    directly: it references tbl_book.ttl and tbl_book.id only, both
--    unchanged — no action needed).

-- 10. Verify no foreign key referencing tbl_book was broken by the rebuild.
PRAGMA foreign_key_check;

-- 11. Commit.
COMMIT;

-- 12. Re-enable foreign key enforcement.
PRAGMA foreign_keys = ON;
```

```
$ sqlite3 library_system.db < rebuild_tbl_book.sql
$ sqlite3 library_system.db ".schema tbl_book"
CREATE TABLE tbl_book (
    id INTEGER PRIMARY KEY,
    ttl TEXT NOT NULL,
    isbn TEXT,
    pub_yr INTEGER,
    cat_id INTEGER REFERENCES category(id),
    qty_total INTEGER NOT NULL DEFAULT 1,
    qty_avail INTEGER NOT NULL DEFAULT 1,
    CHECK (qty_avail >= 0 AND qty_avail <= qty_total)
);
```

A real, genuine `CHECK` constraint, now permanently part of `tbl_book`'s
own real schema — step 5's own `INSERT ... SELECT` succeeded without
error, confirming every one of `tbl_book`'s own three existing rows,
Lesson 47's own already-known drifted row `3` included, genuinely
satisfies this new rule (`qty_avail = 1`, `qty_total = 1` — `1 <= 1` is
real, technically true, even though `1` is still the *wrong* real
value per Lesson 47's own honest cross-check). This new constraint is
a real, honest, **partial** fix — it prevents `qty_avail` from ever
becoming negative or exceeding `qty_total` from this point forward, a
genuinely worse state than today's drift; it does not, and cannot,
retroactively correct a value that's merely wrong while still inside
that real, valid range.

### Discard

Nothing throwaway — this real rebuild is permanent; `tbl_book` now
carries this constraint for the rest of this project's own life.

### Mechanical Walkthrough

- `PRAGMA foreign_keys = OFF;` / `= ON;` — **(b) hard concept
  reappearing**, Lesson 08's own real pragma, toggled here specifically
  to avoid any real, incidental foreign-key friction during the
  multi-step rebuild itself.
- `BEGIN TRANSACTION;` / `COMMIT;` — **(b) hard concept reappearing**,
  Lesson 14's own real transaction boundary, ensuring this entire real
  procedure succeeds or fails as one unit.
- `CREATE TABLE new_tbl_book (..., CHECK (qty_avail >= 0 AND qty_avail
  <= qty_total));` — **(b) hard concept reappearing** for `CREATE
  TABLE`/`CHECK` (Lessons 02, 07); the real, new fact is applying them
  to a temporary, real table used only as a rebuild vehicle.
- `INSERT INTO new_tbl_book SELECT * FROM tbl_book;` — **(a) first
  appearance** of `INSERT ... SELECT` used specifically for a real
  table-to-table copy — Lesson 16's own FTS5 unit used this same real
  shape once, for a genuinely different real purpose (populating a
  search index rather than migrating a whole table).
- `DROP TABLE tbl_book;` / `ALTER TABLE new_tbl_book RENAME TO
  tbl_book;` — **(b) hard concept reappearing** for `DROP TABLE`
  (a real, direct inverse of `CREATE TABLE`, implied but not separately
  named until now) and `ALTER TABLE ... RENAME TO` (Lesson 49's own
  Header already named this as one of `ALTER TABLE`'s real four valid
  forms).
- `PRAGMA foreign_key_check;` — **(a) first appearance**, full
  treatment above.

### CS Lens

This entire, real procedure is a direct, hands-on instance of **schema
migration by full materialization**: rather than mutating a structure
in place (impossible here, per this lesson's own first unit), a
genuinely new, correct structure is built alongside the old one, real
data is transferred across, and the old structure is discarded — the
identical underlying strategy behind a real "blue-green" database
migration, or rebuilding an index from scratch rather than attempting
to patch a corrupted one in place.

### SE Lens

The real, honest cost of this entire lesson, worth stating directly
rather than glossed over: twelve real, careful steps, run inside one
real transaction specifically because a real, partial failure partway
through — the old table dropped, the new one not yet renamed, say —
would leave `library_system.db` in a genuinely broken, half-migrated
state without it. This is real, concrete, provable evidence for why
Lesson 24's own hand-rolled migration runner, and every real production
migration tool it was deliberately modeled after (Alembic, Django's
own), exist at all: a real, twelve-step manual procedure, done
correctly by hand once in this lesson, is exactly the kind of real,
error-prone, repetitive work software should automate the moment a
project needs to do it more than once.

## Connect the pieces

One real, confirmed limit — `ALTER TABLE` genuinely cannot add a
constraint to an existing table, proven both by direct documentation
and by a real, concrete "duplicate column name" rejection — closed by
SQLite's own real, twelve-step, officially documented rebuild
procedure: a new table, a real data copy, the old table dropped, the
new one renamed into place, and a real `PRAGMA foreign_key_check`
confirming nothing broke. `tbl_book` now carries a genuine, structural
`CHECK` constraint Lesson 47 could only work around in application
code until this exact lesson.

## What breaks without this

Attempt to violate the real, new constraint directly, proving it's
genuinely enforced, not merely present in the schema's own text:

```
$ sqlite3 library_system.db "UPDATE tbl_book SET qty_avail = 99 WHERE id = 1;"
Runtime error: CHECK constraint failed: tbl_book
```

A real, immediate rejection — the identical real `CHECK`-violation
error family Lesson 07 first proved directly, now genuinely protecting
`tbl_book` specifically, for the first time in this project's own real
history. This is direct, provable proof the rebuild actually worked:
before this lesson, this exact `UPDATE` would have succeeded silently,
compounding Lesson 47's own real drift even further.

## Exercises

1. Confirm this lesson's own honest, partial-fix claim directly:
   `SELECT qty_avail, qty_total FROM tbl_book WHERE id = 3;` still shows
   the real, drifted `qty_avail = 1` — the new `CHECK` constraint did
   not, and structurally could not, correct it. Write the real, single
   `UPDATE` statement that manually corrects it now, and confirm it
   succeeds under the new constraint.
2. Using this lesson's own real, twelve-step procedure as a template,
   add a real, third trigger — `AFTER UPDATE OF ret_dt ON tbl_loan WHEN
   NEW.ret_dt IS NULL AND OLD.ret_dt IS NOT NULL` — that correctly
   decrements `qty_avail` for exactly the real, reverse transition
   Lesson 46 and Lesson 47 both proved neither existing trigger
   handles. (This one doesn't require a full rebuild — `CREATE TRIGGER`
   works directly on an existing table; state, in your own words, why
   this real fix doesn't hit the same `ALTER TABLE` limitation this
   lesson's own `CHECK` constraint did.)

## Definition of Done

- [ ] You confirmed `ALTER TABLE` has no real form for adding a
      constraint, and reproduced the real "duplicate column name"
      proof of its narrower limits generally.
- [ ] You ran the real, complete twelve-step rebuild and confirmed
      `tbl_book`'s own new `CHECK` constraint in its real `.schema`
      output.
- [ ] You caused the real, new `CHECK constraint failed` error and
      understand why it could not have happened before this lesson.
- [ ] You completed both exercises, including a real, written
      explanation of why Exercise 2's own trigger fix needed no
      rebuild at all.

## Arc 6 complete

Six lessons, and this project inherited a real, unfamiliar database it
never designed — `library_system.db` — and understood it correctly,
methodically, from nothing but the file itself: every real table and
view catalogued (Lesson 44), every real relationship diagrammed
(Lesson 45), two real business rules recovered from views and triggers
(Lesson 46), a real, genuine data-drift bug found, explained, and
reproduced on demand (Lesson 47), this project's own real backend
correctly adapted to serve it — deliberately choosing honest, computed
data over a column already proven untrustworthy (Lesson 48) — and,
finally, a real, structural fix applied directly to the schema itself,
using SQLite's own documented answer to `ALTER TABLE`'s real limits
(this lesson). [Arc 7](lesson-50-concurrency-and-locking.md) closes this
series with the real, remaining production concerns every lesson so far
has deliberately deferred: concurrency, performance, backup, and
mastery-level SQLite.
