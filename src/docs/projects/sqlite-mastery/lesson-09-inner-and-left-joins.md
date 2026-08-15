# Lesson 09: Inner and Left Joins

**What you will build:** the first real queries in this series that
read from `parts` and `suppliers` at the same time — and direct, run
proof that two genuinely different join forms handle `Screwdriver Set`'s
own `NULL` `supplier_id` (Lesson 08) in two different, both-correct
ways.

**What you need to know first:** [Lesson 08](lesson-08-primary-and-foreign-keys.md)
— the real `parts.supplier_id` foreign key this lesson's own joins read
across.

**Terms introduced in this lesson:** none new — `JOIN` and `LEFT JOIN`
are this lesson's own subject, covered as Objects and methods below.

**Objects and methods used:**

**`JOIN` (inner join)**
- *What it is:* a real SQL clause combining rows from two tables,
  keeping only the pairs where a given condition matches on both sides.
- *Implementation:* `SELECT ... FROM table_a JOIN table_b ON
  condition;` — `JOIN` alone means **inner join**: a row from `table_a`
  with no matching `table_b` row (or vice versa) is dropped from the
  result entirely.
- *Its use:* listing every real part alongside its real supplier's
  name, for parts that genuinely have one.

**`LEFT JOIN`**
- *What it is:* a real variant of `JOIN` that keeps every row from the
  left-named table regardless of whether a match exists on the right.
- *Implementation:* `SELECT ... FROM table_a LEFT JOIN table_b ON
  condition;` — an unmatched left-side row still appears once, with
  every right-side column filled in as `NULL`.
- *Its use:* proving `Screwdriver Set` (no supplier) and `Global
  Fasteners Inc.` (no parts) are each still real, visible rows, exactly
  the case plain `JOIN` would silently drop.

---

## Concept Unit: `JOIN` — Combining Two Tables Where They Genuinely Match

### The Problem

`parts.supplier_id` (Lesson 08) and `suppliers.id` (Lesson 07) are
declared to relate to each other, but nothing so far has actually
*read* both tables together in one result.

### Introduce the Concept in Isolation

No throwaway tables — this project's own real `parts` and `suppliers`,
combined for the first time:

```
$ sqlite3 pocket_hardware.db
sqlite> .headers on
sqlite> .mode column
sqlite> SELECT parts.name AS part_name, suppliers.name AS supplier_name
   ...> FROM parts
   ...> JOIN suppliers ON parts.supplier_id = suppliers.id;
part_name     supplier_name
------------  ------------------
Hammer        Ace Tools Co.
Wrench        Ace Tools Co.
Drill         Ace Tools Co.
Tape Measure  Northwind Hardware
Level         Northwind Hardware
```

Five rows — not six. `Screwdriver Set`, `parts`' own sixth real row,
is genuinely absent: its `supplier_id` is `NULL` (Lesson 08's own
deliberate choice), and `NULL = suppliers.id` evaluates to `UNKNOWN`
for every real `suppliers` row (Lesson 05's own three-valued logic,
still governing `ON`'s predicate exactly as it governs `WHERE`'s) —
never true, so no pairing is ever formed for that row at all. This is
`JOIN`'s real, defining behavior: a row with no match, on either side,
is dropped from the result set entirely, not shown with blanks.

### Discard

Nothing throwaway — this is a real, permanent query shape this project
reuses directly, including in Arc 4's own backend endpoints.

### Mechanical Walkthrough

- `SELECT parts.name AS part_name, suppliers.name AS supplier_name` —
  **(b) hard concept reappearing** for `SELECT`/`AS`, both explained in
  Lesson 05; **(a) first appearance** of a **qualified column name**
  (`parts.name`, not bare `name`) — required here because both `parts`
  and `suppliers` each have their own real `name` column, and an
  unqualified `name` would be genuinely ambiguous the moment both
  tables are in play together.
- `FROM parts` — **(c) already basic**, unchanged.
- `JOIN suppliers ON parts.supplier_id = suppliers.id;` — **(a) first
  appearance** of `JOIN`/`ON` together, full treatment above; `=`
  inside `ON` — **(b) hard concept reappearing**, the identical
  comparison operator Lesson 04 already explained, evaluated here once
  per candidate row-pair rather than once per single row.

### CS Lens

An inner join computes a real **relational equi-join**: the subset of
the Cartesian product of both tables' rows where a named equality holds
— formally, exactly the operation relational algebra (the mathematical
foundation SQL itself is built on) calls a join, restricted here to
equality.

Also recognized in: an SQL `JOIN` mirrors a database-style "lookup" done
by hand in a spreadsheet (`VLOOKUP`/`INDEX`-`MATCH` finding a matching
row in a second sheet), a hash-join or merge-join physically executing
this exact logical operation inside the query engine itself (a real
implementation detail this series' own Lesson 13 touches via `EXPLAIN
QUERY PLAN`), and object-relational mapping layers (this series' own
Arc 4) that generate exactly this SQL shape from a `part.supplier`
attribute access in application code.

### SE Lens

The real alternative not chosen — asking for every `parts` row, then
issuing a second, separate query per row to fetch its supplier by
`supplier_id` — has a real, named cost this series' own Lesson 51 gives
a name to directly: the **N+1 query problem**, one query to list the
parts plus N more, one per part, to resolve each supplier separately.
`JOIN` answers the same real question in one single round trip to the
database engine, at the real cost of a slightly more complex query to
write and reason about than two separate simple ones.

## Concept Unit: `LEFT JOIN` — Keeping Rows With No Match

### The Problem

`Screwdriver Set` is a real, permanent row in `parts` — Lesson 05 built
this entire lesson around proving `NULL` still means something real,
not "doesn't exist." A report that silently drops it just because it
has no supplier yet is a real, different problem from the one `JOIN`
alone was built to solve.

### Introduce the Concept in Isolation

The identical query, one keyword changed:

```
sqlite> SELECT parts.name AS part_name, suppliers.name AS supplier_name
   ...> FROM parts
   ...> LEFT JOIN suppliers ON parts.supplier_id = suppliers.id;
part_name        supplier_name
---------------  ------------------
Hammer           Ace Tools Co.
Wrench           Ace Tools Co.
Drill            Ace Tools Co.
Tape Measure     Northwind Hardware
Level            Northwind Hardware
Screwdriver Set
```

All six real `parts` rows now appear — `Screwdriver Set` included, its
`supplier_name` genuinely `NULL` rather than the row being dropped.
`LEFT JOIN` names `parts` (the left-hand table, the one written first
in `FROM`) as the one whose every row is guaranteed to survive,
regardless of whether `ON`'s condition ever matches.

The same real asymmetry, proven from the other direction — every real
supplier, even one with no parts at all:

```
sqlite> SELECT suppliers.name AS supplier_name, parts.name AS part_name
   ...> FROM suppliers
   ...> LEFT JOIN parts ON parts.supplier_id = suppliers.id;
supplier_name          part_name
---------------------  ------------
Ace Tools Co.          Drill
Ace Tools Co.          Hammer
Ace Tools Co.          Wrench
Northwind Hardware     Level
Northwind Hardware     Tape Measure
Global Fasteners Inc.
```

`Global Fasteners Inc.` — a real `suppliers` row with zero real `parts`
rows pointing at it — appears once, with `part_name` genuinely `NULL`,
proving `LEFT JOIN`'s guarantee applies to whichever table is actually
named on the left, not to `parts` specifically. (Neither query's row
order within a matched supplier's group — `Drill`, `Hammer`, `Wrench`,
in that order rather than insertion order — is guaranteed by anything
covered so far; Lesson 04's own proof that a result set's order is
never implied without an explicit `ORDER BY` applies here exactly as it
did there.)

### Discard

Nothing throwaway — both real query shapes are permanent, reused
directly by Arc 5's own low-stock and by-supplier UI views.

### Mechanical Walkthrough

- `LEFT JOIN suppliers ON parts.supplier_id = suppliers.id;` — **(a)
  first appearance** of `LEFT JOIN`, full treatment above; every other
  token in this line is `JOIN`'s own already-explained shape, unchanged.
- `FROM suppliers LEFT JOIN parts ON parts.supplier_id = suppliers.id;`
  — **(c) already basic**, the identical already-explained clause
  shape, with `suppliers` and `parts` swapped — worth the second real
  example specifically to prove `LEFT JOIN`'s guarantee follows
  whichever table is written on the left, not a fixed table.

### CS Lens

`LEFT JOIN` computes relational algebra's own **outer join**: `JOIN`'s
plain equi-join, plus every otherwise-unmatched row from the named
"outer" side, padded with `NULL`s where a match would have gone.

Also recognized in: a `LEFT JOIN` and Python's own `dict.get(key,
default)` share the identical shape — "give me this thing, and if
there's genuinely nothing to pair it with, give me a real placeholder
instead of silently omitting it," at two very different points in a
system.

### SE Lens

Choosing `JOIN` vs. `LEFT JOIN` is a real, deliberate decision about
which real-world fact a query is allowed to hide. Plain `JOIN`'s
silent-drop behavior is the right choice exactly when an unmatched row
genuinely shouldn't appear in the answer at all (Lesson 11's own
"parts priced above average" has nothing to do with suppliers, and
never needs either join); `LEFT JOIN` is the right, and sometimes only
correct, choice whenever "this exists, but has no match yet" is itself
part of the real answer — precisely `Screwdriver Set`'s own situation,
and precisely the shape Arc 5's own inventory UI needs so a real,
unassigned part is never invisible to the person meant to notice and
fix it.

## Connect the pieces

One real link, read two different ways: `JOIN` proved `parts` and
`suppliers` can be combined into one real result set wherever
`supplier_id` genuinely matches a real `suppliers.id` — five of six
rows, `Screwdriver Set` correctly, silently excluded because `NULL`
never equals anything. `LEFT JOIN`, the identical query with one
keyword changed, proved the opposite, complementary guarantee: every
real row on the named left-hand table survives regardless of a match,
`NULL`-padded rather than dropped — proven in both directions, once
from `parts`' own side (`Screwdriver Set` reappears) and once from
`suppliers`' (`Global Fasteners Inc.` reappears).

## What breaks without this

Qualify neither table's own `name` column, now that both are in scope
together:

```
$ sqlite3 pocket_hardware.db "SELECT name FROM parts JOIN suppliers ON parts.supplier_id = suppliers.id;"
Error: in prepare, ambiguous column name: name
```

A real, immediate rejection — not a silent guess at which table's
`name` was meant. The instant a query's `FROM`/`JOIN` brings two tables
with a same-named column into scope together, SQLite requires
qualification (`parts.name`, `suppliers.name`) for that column and
refuses to pick a default; this is exactly why this lesson's own first
real query above wrote `parts.name AS part_name` rather than the bare
`name` every earlier lesson's single-table queries safely used.

## Exercises

1. Write a real `LEFT JOIN` query listing every supplier's name
   alongside a `COUNT` of how many parts each one supplies (`COUNT`
   itself is this series' own Lesson 10 subject — using it here is a
   deliberate small preview; look up its basic `COUNT(column)` form if
   needed). Confirm `Global Fasteners Inc.` correctly shows a count of
   `0` rather than being excluded.
2. Using plain `JOIN` (not `LEFT JOIN`), write a query listing every
   part supplied by `Ace Tools Co.` specifically — filtered with a real
   `WHERE suppliers.name = 'Ace Tools Co.'` clause added after the
   `JOIN`'s own `ON` clause — and confirm the result contains exactly
   `Hammer`, `Wrench`, and `Drill`.

## Definition of Done

- [ ] You joined `parts` and `suppliers` with plain `JOIN` and confirmed
      `Screwdriver Set` is correctly absent from the result.
- [ ] You reran the identical query as a `LEFT JOIN` and confirmed
      `Screwdriver Set` reappears with a `NULL` supplier name.
- [ ] You ran the reversed `LEFT JOIN` (from `suppliers`) and confirmed
      `Global Fasteners Inc.` appears with a `NULL` part name.
- [ ] You caused the real "ambiguous column name" error and understand
      exactly why it only appears once two tables share a column name
      and neither is qualified.
- [ ] You completed both exercises.

## Next

[Lesson 10 — Aggregate Functions, `GROUP BY`, `HAVING`](lesson-10-aggregate-functions-group-by-having.md)
answers real questions about `parts` as a whole — how many, how much,
per supplier — that no single-row query so far can answer.
