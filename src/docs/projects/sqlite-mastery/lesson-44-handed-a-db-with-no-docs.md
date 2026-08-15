# Lesson 44: Handed a `.db` With No Docs

**Setup — read this part, then forget you read it.** In a genuine
real-world version of this scenario, someone else already built the
file and handed it to you. This series can't literally hand you one, so
run this real, one-time script yourself to build an equivalent copy —
then treat everything in it as unseen for the rest of this arc, exactly
the way the rest of this lesson assumes. Nothing about the script
itself is this arc's subject; the real, unfamiliar *result* is.

```
$ sqlite3 library_system.db
```

```sql
CREATE TABLE category (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE tbl_book (
    id INTEGER PRIMARY KEY,
    ttl TEXT NOT NULL,
    isbn TEXT,
    pub_yr INTEGER,
    cat_id INTEGER REFERENCES category(id),
    qty_total INTEGER NOT NULL DEFAULT 1,
    qty_avail INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE tbl_person (
    id INTEGER PRIMARY KEY,
    fname TEXT NOT NULL,
    lname TEXT NOT NULL,
    email TEXT,
    mbr_type TEXT NOT NULL DEFAULT 'P',
    joined_dt TEXT NOT NULL DEFAULT (date('now'))
);

CREATE TABLE tbl_loan (
    id INTEGER PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES tbl_book(id),
    person_id INTEGER NOT NULL REFERENCES tbl_person(id),
    loan_dt TEXT NOT NULL DEFAULT (date('now')),
    due_dt TEXT NOT NULL,
    ret_dt TEXT
);

CREATE TABLE tbl_fine (
    id INTEGER PRIMARY KEY,
    loan_id INTEGER NOT NULL REFERENCES tbl_loan(id),
    amt REAL NOT NULL,
    paid_flag INTEGER NOT NULL DEFAULT 0
);

CREATE VIEW vw_overdue AS
SELECT tbl_loan.id AS loan_id, tbl_book.ttl, tbl_person.fname, tbl_person.lname, tbl_loan.due_dt
FROM tbl_loan
JOIN tbl_book ON tbl_loan.book_id = tbl_book.id
JOIN tbl_person ON tbl_loan.person_id = tbl_person.id
WHERE tbl_loan.ret_dt IS NULL AND tbl_loan.due_dt < date('now');

CREATE TRIGGER trg_loan_checkout
AFTER INSERT ON tbl_loan
BEGIN
    UPDATE tbl_book SET qty_avail = qty_avail - 1 WHERE id = NEW.book_id;
END;

CREATE TRIGGER trg_loan_return
AFTER UPDATE OF ret_dt ON tbl_loan
WHEN NEW.ret_dt IS NOT NULL AND OLD.ret_dt IS NULL
BEGIN
    UPDATE tbl_book SET qty_avail = qty_avail + 1 WHERE id = NEW.book_id;
END;

INSERT INTO category (name) VALUES ('Fiction'), ('Non-Fiction'), ('Reference');

INSERT INTO tbl_book (ttl, isbn, pub_yr, cat_id, qty_total, qty_avail) VALUES
    ('The Pragmatic Programmer', '978-0135957059', 2019, 2, 3, 3),
    ('Dune', '978-0441172719', 1965, 1, 2, 2),
    ('The C Programming Language', '978-0131103627', 1988, 3, 1, 1);

INSERT INTO tbl_person (fname, lname, email, mbr_type, joined_dt) VALUES
    ('Ada', 'Lovelace', 'ada@example.com', 'F', '2023-01-15'),
    ('Alan', 'Turing', 'alan@example.com', 'S', '2023-03-02'),
    ('Grace', 'Hopper', 'grace@example.com', 'P', '2022-11-20');

-- Loan 1: Ada borrows book 1, never returns it (still out, overdue).
INSERT INTO tbl_loan (book_id, person_id, loan_dt, due_dt, ret_dt) VALUES
    (1, 1, '2024-06-01', '2024-06-15', NULL);

-- Loan 2: Alan borrows book 1, returns it on time — checked out, then
-- returned, as two separate real statements, so both triggers fire.
INSERT INTO tbl_loan (book_id, person_id, loan_dt, due_dt, ret_dt) VALUES
    (1, 2, '2024-06-10', '2024-06-24', NULL);
UPDATE tbl_loan SET ret_dt = '2024-06-20' WHERE id = 2;

-- Loan 3: Grace borrows book 2, never returns it (still out, overdue).
INSERT INTO tbl_loan (book_id, person_id, loan_dt, due_dt, ret_dt) VALUES
    (2, 3, '2024-05-01', '2024-05-15', NULL);

-- Loan 4: Ada borrows book 3, returns it, then a librarian "undoes"
-- the return (a real, plausible correction) — the exact real sequence
-- Lesson 47 explains produces a genuine, lasting qty_avail drift.
INSERT INTO tbl_loan (book_id, person_id, loan_dt, due_dt, ret_dt) VALUES
    (3, 1, '2024-01-10', '2024-01-24', NULL);
UPDATE tbl_loan SET ret_dt = '2024-01-24' WHERE id = 4;
UPDATE tbl_loan SET ret_dt = NULL WHERE id = 4;

INSERT INTO tbl_fine (loan_id, amt, paid_flag) VALUES
    (1, 2.50, 0),
    (3, 1.00, 1);
```

Every real number this arc's own lessons reference — `tbl_book`'s own
seven columns, `qty_avail`'s own real drift on row `3`, `mbr_type`'s
own three codes — comes directly from running this exact script. If
your own copy of `library_system.db` was built from it, every real
command in Lessons 44–49 should produce the identical, real output
shown.

---

**What you will build:** nothing yet — this lesson's real deliverable
is a complete, real, structured inventory of `library_system.db`'s own
actual schema, built entirely from the file itself, with no README, no
diagram, and no one to ask. `library_system.db` is a real, second,
independent database this series hands you now, deliberately never
designed by you and never explained anywhere in this series before this
exact lesson — a small public library's own real book-lending system.

**What you need to know first:** [Lesson 16](lesson-16-sqlite-specific-tour.md)
— `PRAGMA table_info`/`foreign_key_list`, both reused directly here for
their real, original purpose (Lesson 16 introduced them against a
schema you already knew by heart; this lesson is where that really
matters). [Lesson 01](lesson-01-what-a-database-is-and-why-sqlite.md) —
`.tables`, reused as the very first real command run against a
genuinely unfamiliar file.

**Terms introduced in this lesson:** none new — every tool this lesson
uses already has full treatment from Arc 1; this lesson is entirely
about applying them to a real, unfamiliar target for the first time.

**Objects and methods used:** none new — `.tables`, `.schema`,
`sqlite_master`, `PRAGMA table_info`, and `PRAGMA foreign_key_list` are
all reused, unchanged, from Lessons 01, 02, and 16.

---

## Concept Unit: A Complete, Real Inventory — Built From Nothing But the File

### The Problem

A real, working developer's own most common first encounter with a
database is not one they designed — it's one they were handed, with
little or no documentation, and a real, immediate need to understand it
correctly before changing anything. `library_system.db` is that
scenario, deliberately: open it now, for the very first time, with
nothing but the tools Arc 1 already taught.

### Introduce the Concept in Isolation

No throwaway table — the real, unfamiliar file itself, worked through
methodically:

```
$ sqlite3 library_system.db
sqlite> .tables
category    tbl_book    tbl_fine    tbl_loan    tbl_person  vw_overdue
```

Six real names — five that read like ordinary tables, and one,
`vw_overdue`, whose `vw_` prefix is a real, human naming convention
hinting at "view" (Lesson 12) before confirming it directly:

```
sqlite> SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view');
category|table
tbl_book|table
tbl_fine|table
tbl_loan|table
tbl_person|table
vw_overdue|view
```

Confirmed, from `sqlite_master` itself (Lesson 08's own real, internal
source of truth), not merely inferred from a naming convention that
could theoretically be wrong: five real tables, one real view. A real,
first, honest observation about this schema's own naming, worth noting
immediately rather than waiting for Lesson 47's own dedicated subject:
four of the five real tables carry a `tbl_` prefix — `category` does
not. Nothing about this is a bug; it's a real, human inconsistency,
the first of several this arc's own later lessons name directly.

Full, structured detail on one real table, `tbl_book`:

```
sqlite> PRAGMA table_info(tbl_book);
0|id|INTEGER|0||1
1|ttl|TEXT|1||0
2|isbn|TEXT|0||0
3|pub_yr|INTEGER|0||0
4|cat_id|INTEGER|0||0
5|qty_total|INTEGER|1|1|0
6|qty_avail|INTEGER|1|1|0
```

Real, structured facts, not guesses: seven real columns, `id` the real
primary key (`pk` = `1`), `ttl` and `qty_total`/`qty_avail` all real,
`NOT NULL` (`notnull` = `1`), `qty_total`/`qty_avail` both carrying a
real `DEFAULT` of `1`. `ttl` is real, abbreviated — this schema's own
real word for "title" — a second, real naming inconsistency worth
noting directly rather than assumed obvious.

```
sqlite> PRAGMA foreign_key_list(tbl_book);
0|0|category|cat_id|id|NO ACTION|NO ACTION|NONE
```

One real, declared foreign key: `tbl_book.cat_id` really does reference
`category.id` — confirmed structurally, not merely guessed from the
column's own suggestive name.

### Discard

Nothing throwaway — every real fact gathered above is a genuine,
permanent piece of this project's own new, real understanding of
`library_system.db`, carried forward into every later lesson in this
arc.

### Mechanical Walkthrough

- `.tables` — **(b) hard concept reappearing**, Lesson 01's own
  dot-command, unchanged; used here for real, unfamiliar discovery
  rather than confirming an already-known schema.
- `SELECT name, type FROM sqlite_master WHERE type IN ('table',
  'view');` — **(b) hard concept reappearing** for `sqlite_master`
  (Lesson 08) and `SELECT`/`WHERE` generally; `IN (...)` — **(b) hard
  concept reappearing**, Lesson 08's own real `IN` operator, unchanged.
- `PRAGMA table_info(tbl_book);` / `PRAGMA foreign_key_list(tbl_book);`
  — **(b) hard concept reappearing**, both fully explained in Lesson
  16; the real, new fact here is not the tool, but that its output is
  genuinely being read cold, for the first time, rather than confirming
  something already known.

### CS Lens

This entire lesson is a real, direct application of **reverse
engineering**: recovering a system's own real design and intent purely
from its observable, structural artifacts, with no access to original
design documentation or its original authors.

Also recognized in: decompiling a compiled binary with no source
available, a new engineer reading an unfamiliar codebase's own tests
and type signatures to infer its real behavior before ever reading a
wiki page, an archaeologist reconstructing a real, ancient system's
purpose from physical remains alone.

### SE Lens

The real, deliberate reason this arc leans on `PRAGMA`
introspection and `sqlite_master` directly, rather than trusting any
real, separate documentation that might exist for a real, unfamiliar
database: Lesson 24's own SE Lens already named the real risk directly
— hand-maintained documentation genuinely drifts out of sync with a
real, evolving schema, and a real developer trusting a stale document
over the real, authoritative file itself is a genuine, common source of
real bugs. Every real fact this lesson gathered came from the file
itself, which — per Lesson 24's own reasoning — can never be stale
relative to its own real, current structure.

## Connect the pieces

One real, previously unknown file, `library_system.db`, given a
genuine, structured first inventory: six real names from `.tables`,
confirmed and split into five real tables and one real view via
`sqlite_master` directly, `tbl_book`'s own real, full column shape
from `PRAGMA table_info`, and its one real, declared foreign key from
`PRAGMA foreign_key_list` — a real, provable starting understanding,
built entirely from the file, with nothing taken on faith.

## What breaks without this

Assume, instead of confirming, that every real name in `.tables`' own
output is an ordinary table:

```
$ sqlite3 library_system.db "INSERT INTO vw_overdue (loan_id) VALUES (1);"
Parse error: cannot modify vw_overdue because it is a view
```

The identical real rejection Lesson 12 already proved directly — a
real, honest reminder that `.tables`' own output alone, without the
real `sqlite_master` cross-check this lesson's own first unit already
ran, would have left `vw_overdue`'s own real nature ambiguous, and a
real, careless assumption ("this looks like a table") would have led
directly to this exact real failure.

## Exercises

1. Run `PRAGMA table_info` and `PRAGMA foreign_key_list` against each
   of `library_system.db`'s own remaining four real tables
   (`category`, `tbl_person`, `tbl_loan`, `tbl_fine`), and write down,
   in your own real notes, every real column name, type, and
   constraint you find — this real inventory is the direct foundation
   Lesson 45 builds an ER diagram from.
2. Run `.schema vw_overdue` directly, and — without yet treating this
   as Lesson 46's own dedicated subject — write one real, honest
   sentence stating what you believe this view is *for*, based purely
   on its name and its real, visible SQL text.

## Definition of Done

- [ ] You listed every real table and view in `library_system.db` and
      confirmed the distinction directly via `sqlite_master`.
- [ ] You read `tbl_book`'s own real, full column shape and its one
      real foreign key using `PRAGMA`.
- [ ] You caused the real "cannot modify... because it is a view"
      failure and understood why confirming object type before acting
      on it matters.
- [ ] You completed both exercises, including a real, written inventory
      of every remaining table's own structure.

## Next

[Lesson 45 — Reverse-Engineering an ER Diagram From Schema Alone](lesson-45-reverse-engineering-an-er-diagram.md)
turns this lesson's own real, scattered `PRAGMA` output into one real,
coherent picture of how every table in `library_system.db` actually
relates to every other one.
