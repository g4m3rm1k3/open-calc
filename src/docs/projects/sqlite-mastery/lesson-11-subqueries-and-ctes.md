# Lesson 11: Subqueries and Common Table Expressions

**What you will build:** a real answer to "which parts cost more than
our own average price" — a question no single `WHERE` clause so far can
answer, because the threshold itself has to be computed from the same
table being filtered.

**What you need to know first:** [Lesson 10](lesson-10-aggregate-functions-group-by-having.md)
— `AVG(price)`, the real aggregate this lesson's own subquery computes
and reuses. [Lesson 04](lesson-04-select-where-order-by-limit.md) —
`WHERE`'s own predicate mechanics.

**Terms introduced in this lesson:**
- **Subquery** — a real, complete `SELECT` statement nested inside
  another SQL statement, its own result used as part of the outer
  query rather than returned directly to the caller.
- **Scalar subquery** — a subquery guaranteed to return exactly one row
  and one column, usable anywhere a single value is expected (here, on
  the right side of `>`).
- **Common Table Expression (CTE)** — a named, temporary result set,
  declared with `WITH`, that can be referenced by name later in the
  same statement — a subquery given a real name instead of being
  written inline.

**Objects and methods used:**

**`WITH`**
- *What it is:* the real SQL keyword introducing one or more CTEs
  before the main statement that uses them.
- *Implementation:* `WITH name AS (SELECT ...) SELECT ... FROM name
  ...;` — `name` becomes usable anywhere a real table name could
  appear, for the rest of this one statement only.
- *Its use:* rewriting this lesson's own subquery with a real, readable
  name instead of an inline nested `SELECT`.

---

## Concept Unit: A Subquery — a `SELECT` Inside a `SELECT`

### The Problem

Lesson 10 proved `AVG(price)` is a real, computable number —
`17.9133333333333`, right now. "Which parts cost more than that" is a
real, ordinary `WHERE price > ...` question, except the right-hand side
isn't a literal like Lesson 04's own `10` — it has to be computed from
`parts` itself, the same table `WHERE` is filtering.

### Introduce the Concept in Isolation

No throwaway table — the real average, computed once directly:

```
$ sqlite3 pocket_hardware.db
sqlite> .headers on
sqlite> .mode column
sqlite> SELECT AVG(price) FROM parts;
AVG(price)
----------------
17.9133333333333
```

The same real number, this time nested directly inside a second query
rather than read and retyped by hand:

```
sqlite> SELECT name, price FROM parts WHERE price > (SELECT AVG(price) FROM parts);
name             price
---------------  -----
Drill            45.0
Screwdriver Set  19.99
```

The parenthesized `(SELECT AVG(price) FROM parts)` is a real, complete,
independently-valid query — the exact one just run alone above — used
here as if it were a single literal value on `>`'s right-hand side.
SQLite evaluates it first, gets back one real number, and only then
runs the outer `WHERE price > <that number>` exactly the way Lesson 04
already explained ordinary `WHERE` comparisons work.

### Discard

Nothing throwaway — this is a real, permanent answer to a real question
this project's own data can now ask of itself.

### Mechanical Walkthrough

- `SELECT name, price FROM parts WHERE price >` — **(b) hard concept
  reappearing**, `SELECT`/`FROM`/`WHERE`/`>`, all already fully
  explained (Lessons 02, 04).
- `(SELECT AVG(price) FROM parts)` — **(a) first appearance** of a
  **subquery**, full treatment above; `AVG(price)` inside it — **(b)
  hard concept reappearing**, Lesson 10's own aggregate function,
  unchanged.

### CS Lens

A scalar subquery is real **function composition**: the output of one
complete computation (`AVG(price)` over all of `parts`) feeding
directly into the input of another (`WHERE`'s own per-row comparison),
without ever naming or storing an intermediate variable to hold it.

Also recognized in: nesting one function call directly inside another's
argument list in any general-purpose language (`f(g(x))`), a Unix pipe
feeding one command's output as another's input, spreadsheet formulas
nesting one function inside another's argument (`=IF(A1 >
AVERAGE(A:A), "above", "below")`) — the identical shape SQL's own
subquery just proved.

### SE Lens

The real alternative not chosen: compute `AVG(price)` in application
code first (Arc 2's own Python), then send a second query with that
number hardcoded into the `WHERE` clause. That alternative has a real,
concrete cost this lesson's own single query avoids entirely: two
separate round trips to the database, and a real window between them
where `parts`' own average could genuinely change (another process
writing a new row) before the second query ever runs — a real
consistency gap a single, self-contained query structurally cannot have.

## Concept Unit: `WITH` — Naming a Subquery Instead of Nesting It

### The Problem

This lesson's own subquery above is small enough to read easily inline.
A real subquery referenced more than once, or one several steps deep,
becomes genuinely hard to read nested directly inside another
statement's own parentheses.

### Introduce the Concept in Isolation

The identical real result, restructured:

```
sqlite> WITH avg_price AS (SELECT AVG(price) AS value FROM parts)
   ...> SELECT name, price FROM parts, avg_price WHERE price > avg_price.value;
name             price
---------------  -----
Drill            45.0
Screwdriver Set  19.99
```

The exact same two real rows as this lesson's first unit — `avg_price`
is a real, named, temporary result (one row, one column, `value`),
usable in the main `SELECT`'s own `FROM` list exactly as if it were a
genuine table, for the rest of this one statement only. `FROM parts,
avg_price` lists both the real `parts` table and this new named result
side by side; `WHERE price > avg_price.value` then reads `avg_price`'s
one real computed value by name, the same qualified-name syntax
Lesson 09's own joins already established for reading a specific
table's own column.

### Discard

Nothing throwaway — this is a real, equally-valid alternative to this
lesson's own first unit, kept as a second real form specifically
because Lesson 24's own migration-history query and Arc 6's own
schema-exploration queries both reuse `WITH` directly.

### Mechanical Walkthrough

- `WITH avg_price AS (SELECT AVG(price) AS value FROM parts)` — **(a)
  first appearance** of `WITH`, full treatment above; `SELECT
  AVG(price) AS value FROM parts` inside the parentheses — **(b) hard
  concept reappearing**, the identical subquery from this lesson's
  first unit, given an explicit output name (`AS value`) so it can be
  referenced by that name afterward.
- `SELECT name, price FROM parts, avg_price WHERE price > avg_price.value;`
  — **(b) hard concept reappearing** for `SELECT`/`WHERE`/`>`; `FROM
  parts, avg_price` — **(a) first appearance** of listing more than one
  source in `FROM` with a plain comma, distinct from Lesson 09's own
  `JOIN ... ON` — here, `avg_price` genuinely has only one row, so every
  `parts` row pairs with that same single row with no real join
  condition needed at all. `avg_price.value` — **(b) hard concept
  reappearing**, Lesson 09's own qualified-column-name syntax, applied
  to a CTE's own name instead of a real table's.

### CS Lens

A CTE is exactly a **named intermediate value** — the same real idea as
assigning `avg = compute_average(prices)` in an ordinary program before
using `avg` in a later line, applied inside a single SQL statement
instead of across lines of imperative code.

Also recognized in: a spreadsheet's own named range or named cell used
in later formulas instead of repeating a raw cell reference, a `let`
binding in a functional language giving a computed expression a real
name before it's used again, refactoring a repeated inline expression
into one local variable in any general-purpose language for the exact
same readability reason.

### SE Lens

`WITH` and an inline subquery are, here, functionally identical — the
real reason to prefer one over the other is pure readability, not
performance or correctness. The real principle at stake: naming a
computed intermediate result (`avg_price`) the moment it would
otherwise need to be read twice, or nested more than one level deep, is
the same discipline this series already assumes from general
programming — extracting a named variable instead of repeating (or
deeply nesting) an expression — applied here to SQL specifically.

## Connect the pieces

One real question — "which parts cost more than average?" — answered
twice, two equally valid ways: an inline scalar subquery,
`(SELECT AVG(price) FROM parts)`, used directly where `WHERE` expected
a single value; and the identical computation, named `avg_price` with
`WITH` and referenced afterward the same way Lesson 09's own joins
already taught this series to read a qualified column. Both produced
the exact same two real rows, `Drill` and `Screwdriver Set` — proof
that `WITH` is a real alternative syntax for the same underlying
subquery mechanism, not a different capability.

## What breaks without this

`(SELECT AVG(price) FROM parts)` is safe specifically because `AVG`, an
aggregate function, always collapses however many rows exist down to
one real output value. SQLite's own real, documented rule for a scalar
subquery position is worth knowing precisely, because it is **not** "an
error if more than one row comes back" — it's something quieter and
more dangerous: only the *first* row the subquery happens to produce is
used, every other row is silently discarded, and no error is raised at
all. Dropping the aggregate and asking the identical question with a
"naked" subquery proves it:

```sql
SELECT name FROM parts WHERE price = (SELECT price FROM parts WHERE quantity > 5);
```

`quantity > 5` genuinely matches four different real rows in `parts`
(`Wrench`, `Tape Measure`, `Level`, `Screwdriver Set`), each with its
own different price — not one. This runs without any error at all, and
returns whichever single one of those four prices SQLite's own query
plan happened to produce first — a real answer, shaped exactly like a
correct one, silently built from only one arbitrary row out of four,
with nothing about the output itself hinting that three real rows were
quietly discarded. (Which specific row is "first" is not something this
lesson promises, on purpose — SQLite's own documentation doesn't
guarantee an order here without an explicit `ORDER BY` inside the
subquery, the same real fact Lesson 04 already proved about result-set
ordering generally.) This is the real, concrete reason this lesson's
own two subqueries both deliberately wrap an aggregate function
(`AVG`) — the one kind of subquery genuinely guaranteed to collapse to
a single real row, rather than merely happening to today.

## Exercises

1. Reproduce this lesson's own two real "above average" rows using
   `WITH`, but compute a *different* threshold: the average `quantity`
   instead of the average `price`. Confirm which real parts qualify,
   and state why the result is a genuinely different set of rows than
   this lesson's own price-based query.
2. Write a real subquery-based query answering "which supplier's parts
   have the highest combined `quantity`?" — you will likely want
   `GROUP BY` (Lesson 10) *inside* the subquery, and `ORDER BY`/`LIMIT`
   (Lesson 04) on the outer query. There is no single required shape;
   confirm your own version returns the real, correct supplier name.

## Definition of Done

- [ ] You answered "which parts cost more than average" using an
      inline scalar subquery.
- [ ] You reproduced the identical result using `WITH`, and can state
      why both are equally valid here.
- [ ] You reproduced the silent first-row-only behavior of a non-
      aggregate scalar subquery and can state why this is more
      dangerous than an outright error would be.
- [ ] You completed both exercises.

## Next

[Lesson 12 — Views](lesson-12-views.md) gives this lesson's own
above-average query — or any other real, reusable query — a permanent
name of its own, queryable like a real table without ever copying the
underlying data.
