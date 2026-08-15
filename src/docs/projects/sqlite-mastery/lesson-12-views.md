# Lesson 12: Views

**What you will build:** a real, permanent `low_stock` view over
`parts` — queryable exactly like a real table, live against whatever
`parts` currently contains, and proven to hold no data of its own at
all.

**What you need to know first:** [Lesson 04](lesson-04-select-where-order-by-limit.md)
— the real `WHERE quantity < 5` predicate this lesson's own view wraps
and reuses.

**Terms introduced in this lesson:** none new — `VIEW` is this lesson's
own subject, covered as Objects and methods below.

**Objects and methods used:**

**`CREATE VIEW`**
- *What it is:* a real SQL statement that gives a `SELECT` query a
  permanent name, queryable afterward exactly like a real table.
- *Implementation:* `CREATE VIEW view_name AS SELECT ...;` — the view
  stores the query's own text, never its result; every future `SELECT
  FROM view_name` re-runs the original query fresh, against whatever
  the underlying table currently holds.
- *Its use:* `low_stock` — a real, standing "which parts need
  reordering" question, asked once and reused everywhere this project
  needs that answer, instead of retyping the same `WHERE` clause.

---

## Concept Unit: `CREATE VIEW` — a Saved Query, Not Saved Data

### The Problem

`WHERE quantity < 5` (Lesson 04's own shape) is a real, useful question
— "which parts are running low?" — genuinely worth asking often, from
many different places in this project (a report today; Arc 5's own
dashboard later). Retyping the identical `WHERE` clause everywhere it's
needed is real, avoidable repetition.

### Introduce the Concept in Isolation

No throwaway table — a real, permanent view over `parts` itself:

```
$ sqlite3 pocket_hardware.db
sqlite> CREATE VIEW low_stock AS
   ...> SELECT name, quantity FROM parts WHERE quantity < 5;
sqlite> .headers on
sqlite> .mode column
sqlite> SELECT * FROM low_stock;
name    quantity
------  --------
Hammer  4
Drill   2
```

`SELECT * FROM low_stock` — the exact same syntax Lesson 02 first used
against the real `parts` table — works unchanged against a view. The
real, load-bearing question: is this real result a stored snapshot,
copied out of `parts` the moment `CREATE VIEW` ran, or something that
tracks `parts` live?

```
sqlite> INSERT INTO parts (name, price, quantity, supplier_id) VALUES
   ...>     ('Chisel', 9.99, 3, 1);
sqlite> SELECT * FROM low_stock;
name    quantity
------  --------
Hammer  4
Drill   2
Chisel  3
```

`Chisel` — inserted into `parts` directly, with no statement anywhere
mentioning `low_stock` at all — appears in `low_stock`'s own result
immediately. This proves the real mechanism: `CREATE VIEW` stored only
the `SELECT`'s own text, never a copy of any row; every query against
`low_stock` genuinely re-runs `SELECT name, quantity FROM parts WHERE
quantity < 5` fresh, against whatever `parts` currently, really
contains, at the exact moment it's asked.

### Discard

Nothing throwaway — `low_stock` is a real, permanent object in
`pocket_hardware.db`, and `Chisel` is a real, permanent seventh row in
`parts` from here on.

### Mechanical Walkthrough

- `CREATE VIEW low_stock AS SELECT name, quantity FROM parts WHERE
  quantity < 5;` — **(a) first appearance** of `CREATE VIEW ... AS`,
  full treatment above; `SELECT name, quantity FROM parts WHERE
  quantity < 5` inside it — **(b) hard concept reappearing**, Lesson
  04's own `SELECT`/`WHERE`/`<` shape, unchanged.
- `SELECT * FROM low_stock;` — **(c) already basic**: `SELECT * FROM`
  is Lesson 01's own original shape; the only new fact is that
  `low_stock` — a view, not a real table — accepts it identically.

### CS Lens

A view is a real, named **abstraction**: it hides the concrete query
(`WHERE quantity < 5`, `parts` specifically) behind a stable name
(`low_stock`), so every future caller depends only on that name and its
meaning, never on the exact underlying expression.

Also recognized in: a named function wrapping a multi-step computation
so callers never repeat its internals, a getter property in an
object-oriented language computed fresh on every access rather than
stored, an interface in any typed language separating "what this does"
from "how it's currently implemented" — the shared idea: a stable name
standing in for logic that can change shape later without breaking
anything depending on the name alone.

### SE Lens

The real alternative not chosen: copy `low_stock`'s own rows into a
second, real table, refreshed by hand or by a scheduled job. That
alternative has a real, named failure mode this project is
deliberately avoiding: a **stale read** — a copy that drifts out of
sync with the real, current `parts` data the instant a row changes
between refreshes. A view structurally cannot go stale, because it
holds no data to go stale *with* — the real cost, honestly stated, is
that `low_stock` re-executes its own `WHERE quantity < 5` scan every
single time it's queried, rather than paying that cost once and reading
a cached answer repeatedly; this series' own Lesson 13, on indexes, is
the real tool for keeping that repeated cost cheap.

## Connect the pieces

`low_stock` is a real, permanent name for Lesson 04's own `WHERE
quantity < 5` question — proven, directly, to hold no data of its own:
inserting `Chisel` into `parts` (no statement touching `low_stock`
itself) changed `low_stock`'s own result immediately, because every
query against it genuinely re-runs the original `SELECT` fresh against
`parts`' real, current rows.

## What breaks without this

Attempt to write through the view, as if it were an ordinary table:

```
$ sqlite3 pocket_hardware.db "INSERT INTO low_stock (name, quantity) VALUES ('Fake Part', 1);"
Parse error: cannot modify low_stock because it is a view
```

A real, immediate rejection — not silently redirected to `parts`, and
not silently discarded. This is the real, direct consequence of
`low_stock` holding no storage of its own to write into: there is no
real row for `INSERT` to place a new value in, only a saved query
definition. (SQLite does have a real mechanism for making a view
genuinely writable — an `INSTEAD OF` trigger, intercepting the attempted
write and translating it into real statements against the base table —
outside this lesson's own scope, and not needed anywhere in this
series.)

## Exercises

1. Create a second real view, `by_supplier`, wrapping this series' own
   Lesson 09 `LEFT JOIN` query (parts alongside supplier name). Confirm
   it too updates live: add a new real part with `supplier_id = 3`
   (`Global Fasteners Inc.`, currently supplier-less per Lesson 09) and
   confirm `by_supplier` reflects it with no `CREATE`/`ALTER` statement
   touching the view itself.
2. Run `.schema low_stock` and confirm SQLite reports back the view's
   own real, stored `SELECT` text — direct, inspectable proof (the same
   spirit as Lesson 02's own `.schema parts` proof) that a view really
   is just saved query text, nothing more.

## Definition of Done

- [ ] You created `low_stock` and confirmed its initial real two-row
      result.
- [ ] You inserted `Chisel` into `parts` directly and confirmed
      `low_stock` reflected it immediately, with no statement
      mentioning the view.
- [ ] You caused the real "cannot modify low_stock because it is a
      view" rejection and understand why a view has nothing to write
      into.
- [ ] You completed both exercises.

## Next

[Lesson 13 — Indexes and `EXPLAIN QUERY PLAN`](lesson-13-indexes-and-explain-query-plan.md)
gives `low_stock` — and every other `WHERE`-filtered query this series
has written — a real, measurable reason to stop scanning every row of
`parts` from the top every single time.
