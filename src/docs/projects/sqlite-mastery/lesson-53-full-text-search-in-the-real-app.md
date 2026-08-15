# Lesson 53: Full-Text Search in the Real App

**What you will build:** a real, always-synchronized `parts_fts`
index, kept correct automatically by three real triggers, wired
directly into Arc 5's own real DataTables search box in place of
Lesson 40's own plain `LIKE`-based search.

**What you need to know first:** [Lesson 16](lesson-16-sqlite-specific-tour.md)
— its own real, standalone FTS5 preview, and its own closing exercise
(keeping it synchronized with triggers), finally completed for real in
this lesson. [Lesson 40](lesson-40-datatables-server-side-processing.md)
— the real `WHERE name LIKE ?` search this lesson directly replaces.

**Terms introduced in this lesson:** none new — FTS5 (Lesson 16) and
triggers (Lesson 15) are both reused, applied together for a real,
permanent, production purpose for the first time.

**Objects and methods used:** none new — every real tool this lesson
uses (`CREATE VIRTUAL TABLE ... USING fts5`, `CREATE TRIGGER`, `MATCH`)
already has full treatment from Lessons 15 and 16.

---

## Concept Unit: A Real, Self-Synchronizing FTS5 Index

### The Problem

Lesson 16's own closing "what breaks" section proved `parts_fts` goes
stale the instant `parts` changes without it. This project's own real
search box cannot afford that — a real, newly added part needs to be
real, immediately findable.

### Introduce the Concept in Isolation

Lesson 16's own real `parts_fts` table, rebuilt fresh, plus three real
triggers keeping it correct automatically:

```sql
CREATE VIRTUAL TABLE parts_fts USING fts5(name);

INSERT INTO parts_fts (rowid, name) SELECT id, name FROM parts;

CREATE TRIGGER trg_parts_fts_insert
AFTER INSERT ON parts
BEGIN
    INSERT INTO parts_fts (rowid, name) VALUES (new.id, new.name);
END;

CREATE TRIGGER trg_parts_fts_update
AFTER UPDATE OF name ON parts
BEGIN
    UPDATE parts_fts SET name = new.name WHERE rowid = new.id;
END;

CREATE TRIGGER trg_parts_fts_delete
AFTER DELETE ON parts
BEGIN
    DELETE FROM parts_fts WHERE rowid = old.id;
END;
```

Real, direct proof this closes Lesson 16's own real gap:

```
$ sqlite3 pocket_hardware.db "INSERT INTO parts (name, price, quantity) VALUES ('Torque Wrench', 42.00, 4);"
$ sqlite3 pocket_hardware.db "SELECT * FROM parts_fts WHERE name MATCH 'torque';"
Torque Wrench
```

Found immediately — with no manual `INSERT INTO parts_fts ... SELECT`
re-run by hand, exactly the real, missing piece Lesson 16 left as an
exercise. The new part's own real name reached `parts_fts` purely
because `trg_parts_fts_insert` fired automatically, the instant the
real `INSERT` into `parts` itself ran.

### Discard

Nothing throwaway — `parts_fts` and all three real triggers are
permanent, correct, self-maintaining parts of this project from here
on.

### Mechanical Walkthrough

- `CREATE VIRTUAL TABLE parts_fts USING fts5(name);` / `INSERT INTO
  parts_fts (rowid, name) SELECT id, name FROM parts;` — **(b) hard
  concept reappearing**, Lesson 16's own real, original setup,
  unchanged.
- `CREATE TRIGGER trg_parts_fts_insert AFTER INSERT ON parts BEGIN
  INSERT INTO parts_fts (rowid, name) VALUES (new.id, new.name); END;`
  — **(b) hard concept reappearing** throughout: `CREATE TRIGGER`/
  `AFTER INSERT`/`new.` (Lesson 15), applied here for the first time to
  keep a *second*, real, derived structure (an FTS5 index, not an
  ordinary table like Lesson 15's own `price_history`) synchronized.
- The `UPDATE`/`DELETE` triggers — **(c) already basic**, the identical
  already-explained shape, applied to the two other real events
  `parts_fts` needs to track.

### CS Lens

This is real, direct proof that Lesson 15's own general trigger
mechanism — "run this automatically, whenever this specific real event
happens" — applies identically whether the thing being kept in sync is
an ordinary audit table (`price_history`) or a genuinely different kind
of real structure (an FTS5 virtual table): the trigger itself doesn't
know or care what `parts_fts` actually is, only that `INSERT`/
`UPDATE`/`DELETE` against it are real, valid SQL operations it can run.

### SE Lens

The real, deliberate choice to synchronize `parts_fts` via triggers,
rather than rebuilding it fresh on every request (a real, much simpler
alternative): a full rebuild would repeat Lesson 51's own real N+1-
adjacent cost — real, wasted, repeated work on every single search,
proportional to `parts`' own entire size, regardless of how small the
real change since the last rebuild was. Three small, targeted triggers,
each doing real, minimal work exactly when a genuine change happens,
is the correct, scalable real choice — the identical underlying
tradeoff Lesson 46's own `qty_avail` counter already made, this time
implemented completely, covering every real transition rather than
Lesson 47's own proven, incomplete version.

## Concept Unit: Wiring FTS5 Into the Real Search Box

### The Problem

Lesson 40's own `GET /parts/datatable` still searches with `WHERE name
LIKE ?` — real, working, but, per Lesson 13's own real indexing
lessons, never able to use a real index efficiently, and blind to real
word boundaries the way FTS5's own inverted index (Lesson 16) is built
for directly.

### Introduce the Concept in Isolation

One real, small change to Lesson 40's own endpoint:

```python
if search_value:
    where = "WHERE id IN (SELECT rowid FROM parts_fts WHERE parts_fts MATCH ?)"
    where_params = (search_value + "*",)
else:
    where = ""
    where_params = ()
```

```
$ curl "http://127.0.0.1:8000/parts/datatable?draw=1&start=0&length=10&search%5Bvalue%5D=torq&order%5B0%5D%5Bcolumn%5D=0&order%5B0%5D%5Bdir%5D=asc"
{"draw":1,"recordsTotal":15,"recordsFiltered":1,"data":[{"id":15,"name":"Torque Wrench", ...}]}
```

Typing `torq` — a real, deliberately incomplete word — into Arc 5's own
real DataTables search box (Lesson 39–41) now correctly finds `Torque
Wrench`. `search_value + "*"` appends FTS5's own real, standard prefix-
match operator: `'torq*'` matches any indexed word *starting with*
`torq`, the real mechanism behind "search as you type" feeling
immediately responsive rather than requiring a complete, exact word
before returning anything.

### Discard

Nothing throwaway — this real, small change is a permanent, correct
replacement for Lesson 40's own original `LIKE`-based search.

### Mechanical Walkthrough

- `"WHERE id IN (SELECT rowid FROM parts_fts WHERE parts_fts MATCH
  ?)"` — **(b) hard concept reappearing** for `IN (...)` (Lesson 08)
  and a real subquery (Lesson 11), combined here for the first time:
  the subquery returns every real, matching `rowid`, and the outer
  query's own `id IN (...)` selects exactly those real `parts` rows.
- `search_value + "*"` — **(a) first appearance** of FTS5's own real
  prefix-match operator, `*`, appended directly to a real search term.

### CS Lens

Real, direct proof of Lesson 16's own CS Lens claim: FTS5's own
**inverted index**, unlike `LIKE '%...%'`'s own real, unavoidable full
scan (confirmable directly with `EXPLAIN QUERY PLAN`, Lesson 13),
answers a real word-prefix search by looking the term up directly, the
identical structural advantage an ordinary `CREATE INDEX` (Lesson 13)
gives an exact `WHERE name = ...` match, here extended to real,
partial-word text search specifically.

### SE Lens

The real, honest tradeoff this lesson's own fix accepts: FTS5 search is
real, word-boundary-aware — `'torq*'` matches `Torque Wrench` but would
not match a real, hypothetical part named `Multorque` the way a naive
`LIKE '%torq%'` substring match would, since `torq` isn't the *start*
of a real, indexed word there. This is, for a real, user-facing search
box, almost always the *more* correct behavior, not a limitation — a
real user typing a partial word expects it to match the start of a
real word, not an arbitrary substring buried inside an unrelated one —
but it's a genuine, real behavioral difference from `LIKE`, worth
naming directly rather than assuming the two are interchangeable.

## Connect the pieces

Three real triggers closed Lesson 16's own original gap, keeping
`parts_fts` permanently, automatically synchronized with `parts`
itself. `GET /parts/datatable`'s own real search then switched from
Lesson 40's own `LIKE`-based scan to a real FTS5 `MATCH` query,
proven directly against a real, newly-added part — found immediately,
by a deliberately incomplete search term, through Arc 5's own actual,
live search box.

## What breaks without this

Search for a real word that exists in `parts.name` but was never
actually indexed — reproduce this deliberately by disabling one real
trigger, `trg_parts_fts_insert`, then adding a new real part:

```
$ sqlite3 pocket_hardware.db "DROP TRIGGER trg_parts_fts_insert;"
$ sqlite3 pocket_hardware.db "INSERT INTO parts (name, price, quantity) VALUES ('Bolt Extractor', 15.00, 5);"
$ curl "http://127.0.0.1:8000/parts/datatable?draw=1&start=0&length=10&search%5Bvalue%5D=bolt&order%5B0%5D%5Bcolumn%5D=0&order%5B0%5D%5Bdir%5D=asc"
{"draw":1,"recordsTotal":16,"recordsFiltered":0,"data":[]}
```

`recordsTotal: 16` correctly counts the new real part in `parts`
itself, but `recordsFiltered: 0` and an empty `data` array prove it's
genuinely unfindable through search — direct, real proof of exactly
what a missing sync trigger costs, reproduced deliberately rather than
discovered by surprise. (Recreate `trg_parts_fts_insert`, exactly as
this lesson's own first unit defined it, and re-insert the missing row
into `parts_fts` by hand to restore correct behavior before
continuing.)

## Exercises

1. Reproduce this lesson's own real "missing trigger" failure yourself,
   then restore `trg_parts_fts_insert` and confirm a fresh part becomes
   searchable again immediately.
2. Confirm, using `EXPLAIN QUERY PLAN` (Lesson 13), that this lesson's
   own FTS5-based search genuinely avoids a full `parts` table scan,
   compared against Lesson 40's own original `LIKE '%...%'` version —
   run both and compare their real, reported plans directly.

## Definition of Done

- [ ] You built all three real, permanent sync triggers and confirmed a
      newly-added part is immediately searchable.
- [ ] You wired FTS5's own real `MATCH` into `GET /parts/datatable`,
      confirmed live through Arc 5's own actual search box.
- [ ] You reproduced the real "missing trigger" failure deliberately
      and restored correct behavior.
- [ ] You completed both exercises.

## Next

[Lesson 54 — Encryption Overview](lesson-54-encryption-overview.md)
closes this arc's own remaining production topics with an honest look
at what this project's own database still doesn't protect against.
