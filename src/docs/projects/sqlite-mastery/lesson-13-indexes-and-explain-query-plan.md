# Lesson 13: Indexes and `EXPLAIN QUERY PLAN`

**What you will build:** a real index on `parts.name`, plus direct,
run proof — in the query engine's own words, not a guess — of exactly
how it changes the way a `WHERE name = ...` query finds its answer.

**What you need to know first:** [Lesson 04](lesson-04-select-where-order-by-limit.md)
— the `WHERE name = ...` shape this lesson's own index speeds up.
[Lesson 12](lesson-12-views.md) — its own SE Lens named this lesson's
subject directly as the real fix for a view's repeated scan cost.

**Terms introduced in this lesson:**
- **Index** — a real, separate on-disk structure SQLite maintains
  automatically, holding a sorted copy of one or more columns' values
  paired with a fast way to find the real row(s) each one belongs to.
- **Table scan** — reading every real row in a table, in order, to find
  the ones a query wants — the only strategy possible with no relevant
  index.
- **Query plan** — the real, specific strategy SQLite's own query
  planner chose for one specific query, inspectable directly rather
  than assumed.

**Objects and methods used:**

**`CREATE INDEX`**
- *What it is:* a real SQL statement that builds and maintains a real
  index structure on one or more columns of an existing table.
- *Implementation:* `CREATE INDEX index_name ON table_name(column);` —
  SQLite builds the structure immediately and keeps it automatically in
  sync with every future `INSERT`/`UPDATE`/`DELETE` on that table, with
  no further action required from any caller.
- *Its use:* `idx_parts_name` — a real index letting `WHERE name = ...`
  find a matching row without reading every row in `parts`.

**`EXPLAIN QUERY PLAN`**
- *What it is:* a real, diagnostic SQL prefix that reports the query
  planner's own chosen strategy for a statement, instead of running it.
- *Implementation:* `EXPLAIN QUERY PLAN <statement>;` — returns a
  short, human-readable description of the real plan (a table scan, an
  index search, and which index if any), never the statement's own
  result rows.
- *Its use:* the exact tool this lesson uses to prove, in the engine's
  own reported words, what changed once a real index existed.

---

## Concept Unit: `CREATE INDEX` — Proven by the Planner's Own Report

### The Problem

Every `WHERE name = ...` query this series has run against `parts` (six
or seven real rows, so far) is instant regardless of strategy — too
small a table for any real difference in approach to be felt. Whether
SQLite is genuinely reading every row to find a match, or using a
faster structure, isn't something speed alone can answer at this scale
— but the engine's own real, internal decision can be asked directly.

### Introduce the Concept in Isolation

No throwaway table — `parts` itself, asked to explain its own plan
before anything changes:

```
$ sqlite3 pocket_hardware.db
sqlite> EXPLAIN QUERY PLAN SELECT * FROM parts WHERE name = 'Drill';
QUERY PLAN
`--SCAN parts
```

`SCAN parts` — SQLite's own real, honest report: finding `Drill` means
reading every row in `parts`, from the first to however far it takes,
checking each one's `name` in turn. This is called a **table scan**;
with no index on `name`, it's the only strategy that exists.

```
sqlite> CREATE INDEX idx_parts_name ON parts(name);
sqlite> EXPLAIN QUERY PLAN SELECT * FROM parts WHERE name = 'Drill';
QUERY PLAN
`--SEARCH parts USING INDEX idx_parts_name (name=?)
```

The identical query, unchanged, now reports `SEARCH ... USING INDEX
idx_parts_name (name=?)` — direct, engine-reported proof the planner
switched strategies on its own, the instant a relevant index existed,
with no change to the query itself at all.

### Discard

Nothing throwaway — `idx_parts_name` is a real, permanent index,
automatically maintained by SQLite for the rest of this project's life,
requiring no further action from any future `INSERT`/`UPDATE`/`DELETE`
against `parts`.

### Mechanical Walkthrough

- `EXPLAIN QUERY PLAN SELECT * FROM parts WHERE name = 'Drill';` — **(a)
  first appearance** of `EXPLAIN QUERY PLAN`, full treatment above; the
  `SELECT` it prefixes — **(b) hard concept reappearing**, unchanged
  from Lesson 04.
- `CREATE INDEX idx_parts_name ON parts(name);` — **(a) first
  appearance**, full treatment above.

### CS Lens

An index is a real, general **auxiliary data structure**: extra,
redundant storage, paid for once, that turns an otherwise-linear search
(a table scan, real cost proportional to row count) into something far
faster (a real search proportional to the structure's own depth, not
the table's size) — the same underlying tradeoff, more storage for less
search time, behind a huge range of real data structures.

Also recognized in: a book's own index at the back (extra pages, so you
never have to read the whole book to find one topic), a hash table
trading memory for near-constant-time lookup, a B-tree (the real,
specific structure SQLite's own index uses internally) underlying
almost every real database's own index implementation, a search
engine's inverted index (this series' own Lesson 53, FTS5, is exactly
this idea applied to searching text).

### SE Lens

An index is not free, and this lesson would be dishonest pretending
otherwise: every real `INSERT`/`UPDATE`/`DELETE` touching an indexed
column now does real, extra work keeping that index in sync, and the
index itself consumes real, permanent disk space alongside the table
it indexes. The real tradeoff, stated plainly: pay a small, real cost
on every write, in exchange for a large, real savings on every read
that can use it — the correct choice exactly when a column is read far
more often than it's written, `parts.name` being a real, direct
example (looked up constantly across this whole series; changed almost
never). Indexing a column read rarely and written constantly would
invert that tradeoff for no real benefit — a genuine judgment call, not
a rule to apply blindly to every column.

## Connect the pieces

One real query, `WHERE name = 'Drill'`, asked to explain itself twice:
before `idx_parts_name` existed, the planner's own honest answer was
`SCAN parts` — read every row. After, with the query itself completely
unchanged, the identical planner reported `SEARCH parts USING INDEX
idx_parts_name` — direct, engine-reported proof that Lesson 12's own SE
Lens promise (a real, structural fix for repeated scan cost) is real,
not asserted on faith.

## What breaks without this

Ask `EXPLAIN QUERY PLAN` about a *different* column with no index at
all:

```
$ sqlite3 pocket_hardware.db "EXPLAIN QUERY PLAN SELECT * FROM parts WHERE price = 45.00;"
QUERY PLAN
`--SCAN parts
```

`price` has no index — `idx_parts_name` only covers `name` — and the
real report proves an index is never automatic just because *some*
index exists on the table: SQLite's planner only uses an index that
actually covers the specific column a query filters on. This is direct
proof that indexing is a real, per-column decision, not a table-wide
setting flipped once and forgotten.

## Exercises

1. Confirm this lesson's own `low_stock` view (Lesson 12) still reports
   `SCAN parts` under `EXPLAIN QUERY PLAN` — its own `WHERE quantity <
   5` filters a column with no index at all, unaffected by
   `idx_parts_name`.
2. Create a second real index, on `parts.quantity`, and confirm with
   `EXPLAIN QUERY PLAN` that `low_stock`'s own underlying query now
   reports a `SEARCH`, not a `SCAN` — direct, engine-reported proof a
   view benefits from an index on its own underlying table exactly like
   an ordinary query would.

## Definition of Done

- [ ] You ran `EXPLAIN QUERY PLAN` against `WHERE name = 'Drill'`
      before any index existed and saw the real `SCAN parts` report.
- [ ] You created `idx_parts_name` and reran the identical query,
      confirming the real `SEARCH ... USING INDEX` report.
- [ ] You confirmed a query filtering a *different*, unindexed column
      still reports `SCAN`, and understand why indexing is per-column.
- [ ] You completed both exercises.

## Next

[Lesson 14 — Transactions and ACID](lesson-14-transactions-and-acid.md)
covers a real, genuinely surprising SQLite default about what happens
to a multi-statement change when one statement inside it fails partway
through.
