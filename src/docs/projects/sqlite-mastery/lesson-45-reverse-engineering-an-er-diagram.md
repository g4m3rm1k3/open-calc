# Lesson 45: Reverse-Engineering an ER Diagram From Schema Alone

**What you will build:** a real, complete entity-relationship diagram
for `library_system.db`, drawn entirely from `PRAGMA foreign_key_list`
output gathered across every real table — no documentation, no
assumption, no name-guessing.

**What you need to know first:** [Lesson 44](lesson-44-handed-a-db-with-no-docs.md)
— its own Exercise 1 already collected every real table's own column
shape and foreign keys individually; this lesson assembles those
separate, real facts into one coherent picture.

**Terms introduced in this lesson:**
- **Entity-relationship (ER) diagram** — a real, standard way to draw a
  relational schema: one real box per table, one real, labeled
  connecting line per foreign key, each end marked with its real
  cardinality (how many rows on one side can relate to how many on the
  other).

**Objects and methods used:** none new — this lesson assembles
`PRAGMA foreign_key_list` output (Lesson 16) gathered across every
real table into one real, coherent diagram; no new tool is introduced.

---

## Concept Unit: Every Real Foreign Key, Gathered in One Place

### The Problem

Lesson 44 read `tbl_book`'s own real foreign key in isolation. A real
ER diagram needs *every* real table's own foreign keys, gathered
together, before the real, whole shape of `library_system.db` becomes
visible.

### Introduce the Concept in Isolation

Running the identical real command Lesson 44 already used, against
every real table this time:

```
sqlite> PRAGMA foreign_key_list(category);
sqlite> PRAGMA foreign_key_list(tbl_person);
```

Both real, genuinely empty — `category` and `tbl_person` declare no
real foreign keys of their own; nothing in this schema depends on
either one *pointing at* something else.

```
sqlite> PRAGMA foreign_key_list(tbl_loan);
0|0|tbl_book|book_id|id|NO ACTION|NO ACTION|NONE
1|1|tbl_person|person_id|id|NO ACTION|NO ACTION|NONE
```

Two real, distinct foreign keys on one real table — `tbl_loan.book_id`
really references `tbl_book.id`, and, independently,
`tbl_loan.person_id` really references `tbl_person.id`. `tbl_loan`
itself, structurally, is what actually connects a real book to a real
borrower — nothing named "book" or "person" needs to say so directly;
the real foreign keys prove it.

```
sqlite> PRAGMA foreign_key_list(tbl_fine);
0|0|tbl_loan|loan_id|id|NO ACTION|NO ACTION|NONE
```

One real, final foreign key — `tbl_fine.loan_id` references
`tbl_loan.id` directly, not `tbl_book` or `tbl_person` — a real,
structural fact worth stating plainly: a fine is recorded per real
*loan*, not per book or per person directly, meaning any real question
like "how much does this person owe in total" genuinely requires
joining through `tbl_loan` first, never a direct `tbl_person`↔`tbl_fine`
relationship at all, because none exists.

Combined with `tbl_book`'s own real `cat_id → category.id` (Lesson 44),
every real foreign key in this schema is now known:

```
tbl_book.cat_id     → category.id
tbl_loan.book_id    → tbl_book.id
tbl_loan.person_id  → tbl_person.id
tbl_fine.loan_id    → tbl_loan.id
```

### Discard

Nothing throwaway — this real, complete list of foreign keys is the
direct, permanent basis for this unit's own next step.

### Mechanical Walkthrough

- `PRAGMA foreign_key_list(category);` / `PRAGMA
  foreign_key_list(tbl_person);` / `PRAGMA foreign_key_list(tbl_loan);`
  / `PRAGMA foreign_key_list(tbl_fine);` — **(c) already basic**, the
  identical already-explained pragma (Lesson 16), run four more times;
  no new syntax, only new, real, unfamiliar output to read correctly.

### CS Lens

The complete, real list of foreign keys gathered above is, formally, a
real **directed graph**: each table a real node, each foreign key a
real, directed edge from the table declaring it to the table it
references — exactly the structure this unit's own next step draws
directly.

### SE Lens

The real, deliberate discipline this unit modeled: gather every real,
structural fact *before* attempting to draw any real conclusion about
the schema's own overall shape. A real, common mistake this lesson's
own approach avoids: guessing at a schema's real relationships from
table and column *names* alone (`tbl_loan` "sounds like" it connects
books and people) — plausible, and, here, correct, but never
substituted for the real, structural proof `PRAGMA foreign_key_list`
actually provides.

## Concept Unit: Drawing the Real Diagram

### The Problem

Four real, disconnected facts (this unit's own predecessor's own list)
are harder to reason about than one real, connected picture.

### Introduce the Concept in Isolation

The real, complete ER diagram, drawn directly from the four real
foreign keys gathered above:

```
┌──────────┐  1    ∞  ┌──────────┐  1    ∞  ┌──────────┐  ∞    1  ┌────────────┐
│ category │ ───────► │ tbl_book │ ───────► │ tbl_loan │ ◄─────── │ tbl_person │
└──────────┘          └──────────┘          └──────────┘          └────────────┘
                                                   │ 1
                                                   ▼
                                                   ∞
                                              ┌──────────┐
                                              │ tbl_fine │
                                              └──────────┘
```

Every real arrow points from the "many" side to the "one" side it
references, matching each real foreign key exactly: many real books
share one real category; many real loans reference one real book and,
separately, one real person; many real fines reference one real loan.
No real, direct line connects `tbl_person` to `tbl_fine`, or
`category` to `tbl_loan` — because no real foreign key does either;
the diagram is honest about what the schema does *not* directly
relate, not only what it does.

### Discard

Nothing throwaway — this real diagram is this arc's own permanent,
shared reference for every later lesson touching `library_system.db`.

### Mechanical Walkthrough

Not applicable — this unit assembles the prior unit's already-gathered
real facts into a real diagram; no new command or syntax is introduced.

### CS Lens

This diagram makes visible a real, standard relational shape: three
real **one-to-many** relationships (`category`→`tbl_book`,
`tbl_book`→`tbl_loan`, `tbl_person`→`tbl_loan`) and one more
(`tbl_loan`→`tbl_fine`), chained together — `tbl_loan` itself acting as
a real, central **associative table**, connecting two otherwise
unrelated real entities (`tbl_book` and `tbl_person`) by holding a
foreign key to each.

### SE Lens

The real, practical value of having drawn this diagram, rather than
only holding the four real facts separately in a written list: a real,
whole-schema question — "can I find every fine a specific person
currently owes?" — is now answerable by reading a real *path* through
the diagram directly (`tbl_person` → `tbl_loan` → `tbl_fine`, three
real joins) rather than re-deriving that path from the raw `PRAGMA`
output every single time it's needed.

## Connect the pieces

Four real, separately-gathered foreign keys — `tbl_book.cat_id`,
`tbl_loan.book_id`, `tbl_loan.person_id`, `tbl_fine.loan_id` — became
one real, connected diagram, showing `library_system.db`'s own real
shape for the first time: a real book belongs to a real category; a
real loan connects a real book to a real person; a real fine belongs to
a real loan. Every real relationship in this diagram traces back
directly to a real, structural fact this arc gathered itself, with no
outside documentation consulted at all.

## What breaks without this

Assume a real, direct relationship the diagram never actually shows —
attempt to join `tbl_person` straight to `tbl_fine`, skipping
`tbl_loan` entirely:

```
$ sqlite3 library_system.db "SELECT tbl_person.fname, tbl_fine.amt FROM tbl_person JOIN tbl_fine ON tbl_person.id = tbl_fine.person_id;"
Error: in prepare, no such column: tbl_fine.person_id
```

A real, immediate, correct rejection — `tbl_fine` genuinely has no
`person_id` column at all; this lesson's own real diagram already
showed the only real path from a person to their fines runs *through*
`tbl_loan`. This is direct, provable proof of why building the real
diagram first, rather than guessing at a join from table names alone,
matters: the guess here was plausible and wrong, and the real schema
itself — not intuition — is the only reliable source of truth.

## Exercises

1. Write the real, corrected three-table join this lesson's own "what
   breaks" section proved necessary — `tbl_person` → `tbl_loan` →
   `tbl_fine` — returning each real person's name alongside every real
   fine amount they owe.
2. Redraw this lesson's own diagram by hand (on paper, or in any real
   diagramming tool of your choice), independently, using only your own
   Lesson 44 exercise notes — then compare it against this lesson's own
   version and reconcile any real, genuine difference.

## Definition of Done

- [ ] You gathered every real foreign key across all five tables in
      `library_system.db`.
- [ ] You drew a real, complete ER diagram connecting all five real
      tables.
- [ ] You caused the real "no such column" failure from assuming an
      unproven direct relationship, and understand why the diagram
      would have prevented that mistake.
- [ ] You completed both exercises.

## Next

[Lesson 46 — Reading Views and Triggers to Recover Business Rules](lesson-46-reading-views-and-triggers.md)
goes one real layer deeper than structure alone — recovering *why*
this schema is shaped this way, not just *what* it's shaped like.
