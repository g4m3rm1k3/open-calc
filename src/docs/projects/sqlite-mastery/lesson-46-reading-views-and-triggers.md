# Lesson 46: Reading Views and Triggers to Recover Business Rules

**What you will build:** nothing yet — this lesson's real deliverable
is recovering two real, previously-undocumented business rules —
"what counts as overdue" and "how `qty_avail` stays in sync" — by
reading `library_system.db`'s own real view and trigger definitions
directly, the same real skill Lesson 45 applied to structure, now
applied to *behavior*.

**What you need to know first:** [Lesson 45](lesson-45-reverse-engineering-an-er-diagram.md)
— the real ER diagram this lesson's own two objects sit on top of.
[Lesson 12](lesson-12-views.md) and [Lesson 15](lesson-15-triggers.md)
— both lessons' own original subjects, reused here for their real,
intended purpose: recovering intent from an unfamiliar schema, not
merely confirming syntax already known.

**Terms introduced in this lesson:** none new — this lesson applies
already-explained tools (`.schema`, `CREATE VIEW`, `CREATE TRIGGER`) to
real, unfamiliar objects for the first time.

**Objects and methods used:** none new.

---

## Concept Unit: `vw_overdue` — Recovering "What Counts as Overdue"

### The Problem

Lesson 44's own Exercise 2 already guessed, from its name alone, that
`vw_overdue` shows overdue loans. A real guess is not the same as a
real, confirmed business rule — and "overdue" itself could mean several
genuinely different real things (past its due date regardless of
return status? past due *and* still unreturned? past due by more than
some real grace period?).

### Introduce the Concept in Isolation

```
$ sqlite3 library_system.db
sqlite> .schema vw_overdue
CREATE VIEW vw_overdue AS
SELECT tbl_loan.id AS loan_id, tbl_book.ttl, tbl_person.fname, tbl_person.lname, tbl_loan.due_dt
FROM tbl_loan
JOIN tbl_book ON tbl_loan.book_id = tbl_book.id
JOIN tbl_person ON tbl_loan.person_id = tbl_person.id
WHERE tbl_loan.ret_dt IS NULL AND tbl_loan.due_dt < date('now');
```

The real, exact business rule, recovered directly from the view's own
real, stored `SELECT` (Lesson 12's own proven fact: a view holds only
its query text, never a copy of data) rather than guessed: a real loan
counts as overdue *specifically* when `ret_dt IS NULL` (Lesson 05's own
real `IS NULL`, meaning "genuinely never returned," not merely "not
returned in time") **and** `due_dt < date('now')`. A real loan that was
returned two months late — `ret_dt` holding a real, if tardy, date — is
correctly *excluded* by this rule: `vw_overdue` tracks currently-overdue
loans, not historically-late ones, a real, meaningful distinction this
view's own name alone never made explicit.

### Discard

Nothing throwaway — this real, recovered business rule is now a
genuine, confirmed fact about `library_system.db`, not a guess.

### Mechanical Walkthrough

- `.schema vw_overdue` — **(b) hard concept reappearing**, Lesson 02's
  own `.schema`, applied here to a view instead of a table for the
  first time in this series with real, unfamiliar content to read.
- The real `SELECT`/`JOIN`/`WHERE` inside it — **(b) hard concept
  reappearing** throughout: Lesson 09's own `JOIN` shape and Lesson
  05's own `IS NULL`, both fully explained, now read cold, in an
  unfamiliar real context, rather than written from scratch.

### CS Lens

A view's own stored query text is, formally, real **executable
documentation**: unlike a comment or a separate wiki page, it cannot
silently drift out of sync with what it actually does, because it *is*
what it does — the identical real principle Lesson 24's own SE Lens
already used to justify trusting `PRAGMA` output over hand-maintained
docs, now applied to recovering *behavior* instead of *structure*.

### SE Lens

The real, practical value of this recovery: any future real code
this project writes against `library_system.db` (Lesson 48's own
subject) can now correctly reuse `vw_overdue`'s own real, confirmed
definition of "overdue" directly — querying the view itself, or
replicating its exact real predicate — rather than a real, second,
independently-guessed definition that might subtly disagree (a real,
common source of bugs: two different parts of a system quietly
disagreeing about what a shared business term actually means).

## Concept Unit: The Triggers — Recovering How `qty_avail` Stays in Sync

### The Problem

`tbl_book.qty_avail` (Lesson 44) is a real, plain `INTEGER` column —
nothing about its own declaration explains how, or whether, it's kept
correct as real loans are checked out and returned.

### Introduce the Concept in Isolation

```
sqlite> SELECT name FROM sqlite_master WHERE type = 'trigger';
trg_loan_checkout
trg_loan_return
```

```
sqlite> .schema trg_loan_checkout
CREATE TRIGGER trg_loan_checkout
AFTER INSERT ON tbl_loan
BEGIN
    UPDATE tbl_book SET qty_avail = qty_avail - 1 WHERE id = NEW.book_id;
END;
```

A real, recovered business rule: every time a new real row is inserted
into `tbl_loan` (Lesson 03's own real `INSERT`, checking out a book),
`qty_avail` on the referenced `tbl_book` row automatically decreases by
one — `qty_avail`, confirmed now, is a real, deliberately denormalized
counter (Lesson 16's own JSON1 unit already used the word "schema-on-
write" for a related idea; this is a related, real, different tradeoff:
storing a derived total directly, rather than computing it fresh with
`COUNT` every time it's needed).

```
sqlite> .schema trg_loan_return
CREATE TRIGGER trg_loan_return
AFTER UPDATE OF ret_dt ON tbl_loan
WHEN NEW.ret_dt IS NOT NULL AND OLD.ret_dt IS NULL
BEGIN
    UPDATE tbl_book SET qty_avail = qty_avail + 1 WHERE id = NEW.book_id;
END;
```

The real, complementary half: `qty_avail` increases by one specifically
when `ret_dt` changes from `NULL` to a real, non-`NULL` value — Lesson
15's own real `OLD`/`NEW` references, here comparing both together
inside a real `WHEN` clause (Lesson 07's own `CHECK`-adjacent
conditional syntax, reused in a genuinely new, trigger-specific
context) to detect *specifically* the moment a loan transitions from
"out" to "returned," not merely any change to `ret_dt` at all.

A real, worthwhile question to sit with, rather than assume answered:
what happens if `ret_dt` ever changes the *other* direction — from a
real date back to `NULL`? Neither trigger's own real `WHEN` clause
covers that case at all. This unit does not answer that question yet —
Lesson 47 does, with a real, concrete, provable consequence.

### Discard

Nothing throwaway — both real, recovered rules (`qty_avail` decrements
on checkout, increments specifically on the NULL→dated transition) are
now genuine, confirmed facts, carried forward directly into Lesson 47.

### Mechanical Walkthrough

- `SELECT name FROM sqlite_master WHERE type = 'trigger';` — **(b)
  hard concept reappearing**, `sqlite_master` (Lesson 08), filtered by
  a real, new value of its already-explained `type` column.
- `.schema trg_loan_checkout` / `.schema trg_loan_return` — **(b) hard
  concept reappearing**, `.schema` applied to real, unfamiliar
  triggers; `AFTER INSERT ON tbl_loan`, `AFTER UPDATE OF ret_dt ON
  tbl_loan`, `WHEN ...`, `OLD`/`NEW` — **(b) hard concept reappearing**
  throughout, every piece already explained in Lesson 15, now read,
  not written.

### CS Lens

These two real triggers together implement a real, working instance of
**maintaining a derived value incrementally** — `qty_avail` is,
conceptually, always equal to `qty_total` minus the real, current count
of unreturned loans for that book, but stored and updated directly
rather than recomputed with a real `COUNT`-based query every time it's
read — a real, deliberate performance tradeoff, paid for entirely by
these two triggers staying correct.

### SE Lens

The real, honest engineering judgment this unit deliberately leaves
open, rather than resolving prematurely: is `qty_avail`, as a
denormalized counter maintained only by these two specific triggers,
actually *trustworthy*? Lesson 12's own real view, `low_stock`, chose
the structurally safer alternative — compute fresh, every time, direct
from real data, never able to drift. `library_system.db`'s own real
designers chose differently here, for `qty_avail` specifically — a
real, legitimate performance-motivated choice, but one whose real
correctness depends entirely on *every* real way `tbl_loan` can change
being covered by a trigger. This unit's own closing question — what
about the reverse transition? — is exactly where that assumption gets
tested for real.

## Connect the pieces

Two real, previously-undocumented business rules, recovered entirely
from `library_system.db`'s own stored definitions: `vw_overdue`'s own
real `WHERE` clause precisely defined "overdue" as unreturned *and*
past due, distinct from "was once late"; and this schema's own two real
triggers revealed `qty_avail` as a deliberately denormalized counter,
correctly maintained on checkout and on a specific, real return
transition — with one, real, open question about its own real
completeness carried forward directly into Lesson 47.

## What breaks without this

Assume, instead of confirming, that `qty_avail` simply always equals
`qty_total` minus every currently-open real loan, and write a query
based on that unconfirmed assumption instead of using `qty_avail`
directly:

```
$ sqlite3 library_system.db "SELECT id, ttl, qty_total - (SELECT COUNT(*) FROM tbl_loan WHERE tbl_loan.book_id = tbl_book.id AND ret_dt IS NULL) AS computed_avail, qty_avail AS stored_avail FROM tbl_book;"
1|The Pragmatic Programmer|2|2
2|Dune|1|1
3|The C Programming Language|0|1
```

Book `3`'s own two real numbers **disagree** — `computed_avail` (`0`,
derived fresh from real, current loan data) and `stored_avail` (`1`,
the real, stored `qty_avail` column) are not the same real value. This
is direct, provable proof this unit's own closing question was worth
asking: something about this schema's own real trigger coverage is
genuinely incomplete, and trusting `qty_avail` blindly, without this
real cross-check, would have produced a real, wrong answer with no
error or warning anywhere. Lesson 47 is exactly this real discrepancy,
explained.

## Exercises

1. Confirm, using `.schema`, that no *third* trigger exists on
   `tbl_loan` beyond the two read in this lesson — direct, structural
   proof this unit's own closing question (what handles the reverse
   `ret_dt` transition?) has a real, honest answer: nothing does.
2. Using `vw_overdue`'s own real, recovered definition, write a second,
   independent query — not using the view at all — that produces the
   identical real result by hand, directly against `tbl_loan`,
   `tbl_book`, and `tbl_person`. Confirm both real approaches agree.

## Definition of Done

- [ ] You recovered `vw_overdue`'s own exact, real business rule from
      its stored `SELECT` alone.
- [ ] You recovered both real triggers' own logic and can state, from
      memory, exactly which `ret_dt` transition each one handles.
- [ ] You reproduced this lesson's own real `computed_avail` vs.
      `stored_avail` discrepancy for book `3` and can state, honestly,
      that you don't yet know *why* — only *that* it's real.
- [ ] You completed both exercises.

## Next

[Lesson 47 — Messy Legacy Schema Realities](lesson-47-messy-legacy-schema-realities.md)
explains this lesson's own real, unresolved discrepancy directly — and
names the other, real, human inconsistencies this arc has already
noticed in passing.
