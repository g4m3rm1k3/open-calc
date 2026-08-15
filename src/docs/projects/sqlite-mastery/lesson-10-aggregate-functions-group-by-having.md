# Lesson 10: Aggregate Functions, `GROUP BY`, `HAVING`

**What you will build:** real, whole-table answers — how many parts,
their total stocked quantity, their average price — and then the same
questions broken down per real supplier, using `parts`' own real
`supplier_id` link from Lesson 09.

**What you need to know first:** [Lesson 09](lesson-09-inner-and-left-joins.md)
— not required for this lesson's first unit, but its own real
`supplier_id` grouping is this lesson's second unit's whole subject.
[Lesson 05](lesson-05-null-and-three-valued-logic.md) — `NULL`'s real
behavior, which this lesson proves aggregate functions handle
differently than ordinary expressions do.

**Terms introduced in this lesson:**
- **Aggregate function** — a real SQL function that consumes many rows
  and produces one summary value, unlike every function used so far
  (`typeof()`, `json_extract()`... — none seen yet, but the contrast
  matters going forward), which produce one output per input row.
- **Group** — a real, named subset of rows sharing the same value in
  one or more columns, the unit `GROUP BY` and `HAVING` both operate
  on.

**Objects and methods used:**

**`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`**
- *What they are:* five real, built-in aggregate functions.
- *Implementation:* `COUNT(*)` counts every row in the group;
  `COUNT(column)` counts only rows where `column` is not `NULL`;
  `SUM`/`AVG`/`MIN`/`MAX(column)` compute the named statistic over a
  column's non-`NULL` values only.
- *Its use:* real, whole-table and per-supplier summaries of `parts`.

**`GROUP BY`**
- *What it is:* a real `SELECT` clause that partitions the result set
  into groups sharing the same value in a named column, before any
  aggregate function is computed.
- *Implementation:* `SELECT col, AGG(other_col) FROM table GROUP BY
  col;` — one output row per distinct value of `col`, each aggregate
  computed only over that group's own rows.
- *Its use:* per-supplier totals, this lesson's own second real query.

**`HAVING`**
- *What it is:* a real clause filtering *groups*, evaluated after
  `GROUP BY` forms them — as distinct from `WHERE`, which filters
  individual rows before grouping ever happens.
- *Implementation:* `SELECT ... GROUP BY col HAVING aggregate_condition;`
- *Its use:* keeping only suppliers with more than one real part.

---

## Concept Unit: Whole-Table Aggregates — One Row In, One Row Out

### The Problem

Lesson 04's own `WHERE`/`ORDER BY`/`LIMIT` all still return the same
*kind* of thing they started with — real `parts` rows, filtered,
ordered, or sliced. "How many parts do we stock in total?" and "what's
our average price?" aren't questions any single row, or any list of
rows, can answer directly.

### Introduce the Concept in Isolation

No throwaway table — real, whole-table summaries of `parts`' own six
rows:

```
$ sqlite3 pocket_hardware.db
sqlite> .headers on
sqlite> .mode column
sqlite> SELECT COUNT(*) AS n, SUM(quantity) AS total_qty,
   ...>        AVG(price) AS avg_price, MIN(price) AS min_price, MAX(price) AS max_price
   ...> FROM parts;
n  total_qty  avg_price         min_price  max_price
-  ---------  ----------------  ---------  ---------
6  45         17.9133333333333  6.25       45.0
```

One real output row — not six — summarizing all six real input rows at
once: `6` total parts, `45` total units on hand across all of them, a
real average price, and the real min/max across every priced part.

The real, `NULL`-specific behavior, proven directly — `parts.supplier_id`
is genuinely `NULL` for one row (`Screwdriver Set`, per Lesson 08):

```
sqlite> SELECT COUNT(*) AS row_count, COUNT(supplier_id) AS with_supplier_count FROM parts;
row_count  with_supplier_count
---------  -------------------
6          5
```

`COUNT(*)` counted all six real rows, unconditionally. `COUNT
(supplier_id)`, given a specific column instead of `*`, counted only
`5` — every aggregate function here silently skips a `NULL` input
rather than letting Lesson 05's own `NULL`-poisons-everything rule
apply the way it does to ordinary arithmetic (`price * quantity`
produced a real `NULL` in Lesson 05's own proof; `SUM(price)` across a
group containing one `NULL` price does not become `NULL` itself — it
sums only the real, non-`NULL` values present).

### Discard

Nothing throwaway — every real number above is a genuine, current fact
about this project's own live data.

### Mechanical Walkthrough

- `COUNT(*)` — **(a) first appearance.** Counts every row, `NULL`
  columns included — the one aggregate function that genuinely ignores
  column content entirely.
- `SUM(quantity)` — **(a) first appearance.** Adds every non-`NULL`
  `quantity` value across the group.
- `AVG(price)` — **(a) first appearance.** The arithmetic mean of every
  non-`NULL` `price` value.
- `MIN(price)` / `MAX(price)` — **(a) first appearance**, both, of the
  same real shape: the smallest/largest non-`NULL` value present.
- `COUNT(supplier_id)` — **(b) hard concept reappearing** for `COUNT`
  itself, just explained; the real behavioral difference from `COUNT(*)`
  — skipping `NULL`s — is this unit's own explicit point, not a new
  syntactic element.

### CS Lens

Every aggregate function here is a real **fold** (also called
`reduce`): a function that consumes a whole sequence and combines it
down to one value, rather than transforming each element independently
the way Lesson 01's own filter/`WHERE` comparison does.

Also recognized in: `Array.prototype.reduce` in JavaScript, Python's
`sum()`/`functools.reduce`, a spreadsheet's own `=SUM()`/`=AVERAGE()`
column formulas — the identical shape, "combine many values into one,"
recurring at very different scales and in very different syntaxes.

### SE Lens

Computing these five numbers in application code instead — fetch every
`parts` row, then loop and accumulate in Python (Arc 2) — has the exact
same real cost this series' own Lesson 01 and Lesson 09 already named
for filtering and joining respectively: every row still crosses the
real process boundary before being discarded down to five numbers the
database engine could have computed itself, without ever materializing
six full rows' worth of data just to throw almost all of it away.

## Concept Unit: `GROUP BY` and `HAVING` — the Same Aggregates, Per Group

### The Problem

Lesson 09's own `parts`↔`suppliers` link makes a more specific real
question askable: not "what's our total stocked quantity," but "what's
our total stocked quantity, broken down by which supplier provides
it?"

### Introduce the Concept in Isolation

The identical aggregate shape, now partitioned:

```
sqlite> SELECT supplier_id, COUNT(*) AS n, SUM(quantity) AS total_qty
   ...> FROM parts
   ...> GROUP BY supplier_id;
supplier_id  n  total_qty
-----------  -  ---------
             1  8
1            3  16
2            2  21
```

Three real output rows now, not one — `GROUP BY supplier_id` split
`parts`' six rows into three real groups first (`NULL`'s own group,
`1`'s group, `2`'s group), and every aggregate function was computed
**separately within each group**, not across all six rows at once the
way this lesson's first unit did. The blank `supplier_id` row is real,
too: `NULL` is treated as its own genuine group by `GROUP BY` — a
different rule from `WHERE`'s own three-valued logic, which would have
silently excluded a `NULL` row from a comparison; grouping only asks
"do these values match each other," and every `NULL` value is treated
as matching every other `NULL` for this specific purpose.

`HAVING`, filtering groups rather than rows:

```
sqlite> SELECT supplier_id, COUNT(*) AS n
   ...> FROM parts
   ...> GROUP BY supplier_id
   ...> HAVING COUNT(*) > 1;
supplier_id  n
-----------  -
1            3
2            2
```

The `NULL`-group row (`Screwdriver Set` alone, `n = 1`) is gone —
`HAVING COUNT(*) > 1` evaluates *after* grouping and aggregation have
already happened, keeping only groups whose own computed `COUNT(*)`
exceeds `1`. `WHERE` could never express this: `WHERE`'s own predicate
runs per individual row, before any group or aggregate exists yet, so
it has no `COUNT(*)` value available to compare against in the first
place.

### Discard

Nothing throwaway — both real query shapes are permanent, and Arc 5's
own by-supplier dashboard view is built directly on the first one.

### Mechanical Walkthrough

- `SELECT supplier_id, COUNT(*) AS n, SUM(quantity) AS total_qty FROM
  parts GROUP BY supplier_id;` — `supplier_id`, `COUNT(*)`,
  `SUM(quantity)` — **(b) hard concept reappearing**, all three already
  explained; `GROUP BY supplier_id` — **(a) first appearance**, full
  treatment above.
- `... HAVING COUNT(*) > 1;` — **(a) first appearance** of `HAVING`,
  full treatment above; `COUNT(*) > 1` inside it — **(b) hard concept
  reappearing**, `COUNT(*)` and `>` both already explained, now
  evaluated against a group's computed value instead of a row's raw
  column.

### CS Lens

`GROUP BY` implements a real **partition**: splitting a set into
non-overlapping subsets by a shared key, the exact operation behind a
`GROUP BY` in any query language and a `groupBy`/`itertools.groupby` in
general-purpose ones — after which a fold (this lesson's own first
unit) is applied independently to each partition instead of to the
whole set at once.

Also recognized in: a spreadsheet's own pivot table (rows grouped by a
category, then summed per group), a hash map built specifically to
bucket items by key before processing each bucket, MapReduce's own
"reduce" step operating per-key group after the "map" step has already
tagged every item with one.

### SE Lens

`WHERE` and `HAVING` are not interchangeable, and confusing them is a
real, common mistake: `WHERE` must run first, before grouping, because
it has no aggregate value to test yet; `HAVING` must run second,
because its entire job is testing a value (`COUNT(*)`, `SUM(...)`) that
doesn't exist until grouping and aggregation have already happened.
Using `WHERE COUNT(*) > 1` in place of `HAVING` is not a style
preference — this lesson's own closing section proves it's a real,
hard SQL error, not a silently-wrong-but-running query.

## Connect the pieces

Two real questions, one shared mechanism: this lesson's first unit
computed five whole-table facts about `parts` in one pass, proving
`COUNT`, unlike ordinary arithmetic, silently skips `NULL` inputs
rather than propagating them. `GROUP BY supplier_id` then re-ran the
identical aggregate shape three times over, once per real supplier
group (including a genuine `NULL` group), using Lesson 09's own
`supplier_id` column as the real partition key — and `HAVING` filtered
the *results* of that grouping, a real capability `WHERE` structurally
cannot provide, because the values `HAVING` tests don't exist until
grouping has already run.

## What breaks without this

Attempt `HAVING`'s exact condition using `WHERE` instead:

```
$ sqlite3 pocket_hardware.db "SELECT supplier_id, COUNT(*) AS n FROM parts WHERE COUNT(*) > 1 GROUP BY supplier_id;"
Error: in prepare, misuse of aggregate function COUNT()
```

A real, specific rejection — not a silently wrong answer. SQLite's own
real clause-evaluation order runs `WHERE` before any grouping or
aggregation exists, so `COUNT(*)` genuinely has no value yet at the
point `WHERE` would need one; the engine refuses to guess, and names
the exact aggregate function it caught being misused rather than a
generic syntax complaint.

## Exercises

1. Write a real query computing `AVG(price)` per `supplier_id`, and
   confirm `Ace Tools Co.`'s group (`supplier_id = 1`) and `Northwind
   Hardware`'s group (`supplier_id = 2`) produce two genuinely different
   real averages.
2. Combine `JOIN` (Lesson 09) with `GROUP BY` in one real query:
   `SELECT suppliers.name, COUNT(*) FROM parts JOIN suppliers ON
   parts.supplier_id = suppliers.id GROUP BY suppliers.name;` — run it,
   and explain in your own words why `Global Fasteners Inc.` is
   correctly absent from this result even though `LEFT JOIN` would have
   included it.

## Definition of Done

- [ ] You computed all five whole-table aggregates over `parts` in one
      query.
- [ ] You proved `COUNT(*)` and `COUNT(supplier_id)` disagree by
      exactly one, and can state why.
- [ ] You grouped `parts` by `supplier_id` and confirmed a genuine
      `NULL` group appears in the result.
- [ ] You used `HAVING` to exclude the single-part group and can state
      why `WHERE` cannot express the same filter.
- [ ] You caused the real "misuse of aggregate function" error and
      understand SQL's real clause evaluation order well enough to
      explain it.
- [ ] You completed both exercises.

## Next

[Lesson 11 — Subqueries and Common Table Expressions](lesson-11-subqueries-and-ctes.md)
uses this lesson's own `AVG(price)` inside a *second* query, answering
"which parts cost more than average" for the first time.
