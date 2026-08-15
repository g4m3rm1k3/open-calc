# Lesson 04: `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`

**What you will build:** real, filtered, ordered, size-bounded views into
`pocket_hardware.db`'s five real `parts` rows — the first genuine
questions this series has asked its own data, instead of the
unconditional `SELECT *` used so far only to confirm a write happened.

**What you need to know first:** [Lesson 03](lesson-03-insert-and-the-row.md)
— the real, five-row `parts` table this lesson filters, orders, and
slices.

**Terms introduced in this lesson:**
- **Predicate** — a real expression that evaluates to true or false for
  one row, deciding whether `WHERE` keeps or discards it.
- **Result set** — the real, ordered collection of rows a `SELECT`
  statement produces, distinct from the table itself: filtering,
  ordering, or limiting a result set never changes a single row in the
  real table underneath it.

**Objects and methods used:**

**`WHERE`**
- *What it is:* a real clause on `SELECT` (and, this series' own Lesson
  06, on `UPDATE`/`DELETE`) that filters which rows are included, by a
  real predicate.
- *Implementation:* `SELECT ... FROM table WHERE predicate;` — the
  predicate is evaluated once per row; only rows where it's true survive
  into the result set.
- *Its use:* every real, targeted question this lesson asks of `parts`.

**`ORDER BY`**
- *What it is:* a real clause on `SELECT` controlling the order rows
  appear in the result set.
- *Implementation:* `SELECT ... ORDER BY column [ASC|DESC] [, column
  [ASC|DESC] ...];` — `ASC` (ascending, the default if omitted) or
  `DESC` (descending); multiple columns break ties left to right.
- *Its use:* presenting `parts` sorted by price and by quantity, in this
  lesson's own real queries.

**`LIMIT`**
- *What it is:* a real clause on `SELECT` capping how many rows the
  result set contains.
- *Implementation:* `SELECT ... LIMIT n [OFFSET m];` — at most `n` rows,
  skipping the first `m` if `OFFSET` is given.
- *Its use:* this lesson's own proof that a table's real row order (Lesson
  03's insertion order) and a query's `ORDER BY`-controlled order are two
  independent things.

---

## Concept Unit: `WHERE` — Filtering Rows by a Real Predicate

### The Problem

Every `SELECT` in this series so far has returned all five of `parts`'
rows. Lesson 01's own opening problem was a real question — "which parts
cost more than $10?" — never actually answered by a real database query
yet.

### Introduce the Concept in Isolation

No throwaway table needed — Lesson 01's exact original question, asked
for real against `parts`, which this lesson's second Concept Unit
onward continues to build on:

```
$ sqlite3 pocket_hardware.db
sqlite> .headers on
sqlite> .mode column
sqlite> SELECT name, price FROM parts WHERE price > 10;
name    price
------  -----
Hammer  12.99
Drill   45.0
Level   14.75
```

Three of `parts`' five real rows survived; `Wrench` (`8.5`) and `Tape
Measure` (`6.25`) did not. `price > 10` is a real **predicate** —
`>` compares each row's own `price` value against the literal `10`,
producing true or false — evaluated once per row, independently; only
rows where it's true make it into the **result set**.

A second, real predicate combining two conditions:

```
sqlite> SELECT name, price, quantity FROM parts WHERE quantity < 5 AND price > 10;
name    price  quantity
------  -----  --------
Hammer  12.99  4
Drill   45.0   2
```

`Wrench`, `Tape Measure`, and `Level` are excluded now too —
`Level` genuinely satisfies `price > 10` alone (proven above) but fails
`quantity < 5` (its real quantity is `6`), and `AND` requires both
halves true for the same row.

### Discard

Nothing here is throwaway — Lesson 01's original motivating question is
answered for real, against this series' own real project data, and this
exact query is the real, permanent proof this lesson's Header promised.

### Mechanical Walkthrough

- `SELECT name, price FROM parts` — **(b) hard concept reappearing**:
  the same `SELECT ... FROM` shape from every earlier lesson, naming
  specific columns instead of `*`, already explained in Lesson 02.
- `WHERE price > 10` — **(a) first appearance.** `WHERE` introduces a
  predicate clause; `price` reads the column (already basic); `>` is a
  real comparison operator, first appearance, comparing `price`'s real
  per-row value against the literal `10`.
- `WHERE quantity < 5 AND price > 10` — **(a) first appearance** of
  `AND`, combining two predicates into one: true only when both sides
  are independently true. `quantity < 5` and `price > 10` are each the
  same already-explained comparison shape, applied to a different
  column and operator (`<` instead of `>`, both first appearances of
  their own literal symbol, same underlying concept as `>`).

### CS Lens

`WHERE`'s predicate is a real **filter**: a pure function from one row
to true/false, applied independently to every row, with no row's result
affecting any other row's.

Also recognized in: `Array.prototype.filter` in JavaScript, Python's
`filter()`/list-comprehension `if` clause, a regex's own match/no-match
decision per line, an `if` statement inside any per-item loop in any
language — the same "keep or discard, decided independently per item"
shape, at very different scales.

### SE Lens

The real alternative not chosen: read every row with an unconditional
`SELECT *`, then filter in application code (Python, once Arc 2 starts).
The real cost of that alternative: every one of `parts`' rows — five
today, potentially thousands once this project grows — crosses the real
boundary between the database process and the application process
before a single one gets discarded, for a decision the database engine
could have made itself, more cheaply, using Lesson 13's own indexes.
`WHERE` pushes the filtering decision to the same place the data already
lives, a real efficiency case this series proves directly, with real
numbers, once Lesson 13 introduces `EXPLAIN QUERY PLAN`.

## Concept Unit: `ORDER BY` — a Result Set's Order Is Not a Table's Order

### The Problem

`parts`' five rows were written in a specific sequence across Lessons
02–03 (`Hammer`, `Wrench`, `Drill`, `Tape Measure`, `Level`) — visible in
every unconditional `SELECT *` this series has run. Is that sequence a
real, permanent fact about the table, or just an artifact of insertion
order?

### Introduce the Concept in Isolation

The same five rows, requested in two different real orders:

```
sqlite> SELECT name, price FROM parts ORDER BY price DESC;
name          price
------------  -----
Drill         45.0
Level         14.75
Hammer        12.99
Wrench        8.5
Tape Measure  6.25
```

```
sqlite> SELECT name, quantity, price FROM parts ORDER BY quantity ASC, price DESC;
name          quantity  price
------------  --------  -----
Drill         2         45.0
Hammer        4         12.99
Level         6         14.75
Wrench        10        8.5
Tape Measure  15        6.25
```

Neither result matches `parts`' own real insertion order (`Hammer`,
`Wrench`, `Drill`, `Tape Measure`, `Level`) — the first is sorted purely
by `price`, descending; the second primarily by `quantity`, ascending,
with `price`, descending, breaking ties only when two rows share the
same `quantity` (none do here, so `price`'s own tiebreak ordering isn't
actually exercised by this particular data — still real, correct syntax,
just not visibly load-bearing with these five specific rows). Neither
query touched a single stored row — `parts`' own real, on-disk order is
completely unaffected, provable by running an unconditional `SELECT *
FROM parts;` again and seeing Lesson 03's original insertion order
return unchanged.

### Discard

Nothing throwaway here either — both orderings are real, permanent
capabilities this project keeps using from here on (Arc 5's DataTables
UI, this series' own Lesson 40, lets a real user click a column header
to trigger exactly this clause).

### Mechanical Walkthrough

- `ORDER BY price DESC` — **(a) first appearance.** `ORDER BY` sorts the
  result set by the named column; `DESC` (descending — largest first) is
  a first-appearance keyword; its unwritten counterpart `ASC` (ascending
  — smallest first) is `ORDER BY`'s real default when neither is
  written.
- `ORDER BY quantity ASC, price DESC` — **(a) first appearance** of
  multiple sort columns: `quantity ASC` decides the primary order; `price
  DESC`, second in the list, only breaks ties between rows that share
  the exact same `quantity` — genuinely real syntax, even though this
  specific five-row data never exercises the tie-break itself. `ASC`
  here is the same keyword just introduced, written explicitly this
  time.

### CS Lens

`ORDER BY` is a real, general **sort**, parameterized by a comparator
built from the named column(s) and direction(s) — conceptually identical
to sorting an array in any language, just expressed declaratively
(Lesson 01's own CS Lens) instead of by calling a sort function.

Also recognized in: `Array.prototype.sort` with a custom comparator,
SQL's own multi-key sort mirrored by "sort by last name, then first
name" in a spreadsheet or a phone contacts app — a tie-break chain is
the exact same idea in both places.

### SE Lens

A table's own real row order is deliberately not something SQL promises
to preserve without `ORDER BY` — the real, load-bearing implication:
never assume a `SELECT` with no `ORDER BY` returns rows in insertion
order, even when it happens to today (as `parts`' own unconditional
`SELECT *` still does, purely because this table is small and hasn't
been touched by `DELETE`, `VACUUM`, or an index yet). The real
alternative — guaranteeing insertion order by default — was not chosen
by SQL's own designers because it would forbid the query planner
(Lesson 13) from ever choosing a faster physical row order internally;
requiring an explicit `ORDER BY` whenever order actually matters keeps
that optimization freedom real, at the real cost of a bug this exact
lesson exists to prevent: code that silently depends on an unordered
result's incidental order, until the day it changes.

## Concept Unit: `LIMIT` — Capping a Result Set's Size

### The Problem

`ORDER BY price DESC` just proved `Drill` is `parts`' single most
expensive real row. Reading the *entire* five-row result to find that
one fact works today; does it still work once this table holds
thousands of rows instead of five?

### Introduce the Concept in Isolation

The same descending-price query, capped:

```
sqlite> SELECT name, price FROM parts ORDER BY price DESC LIMIT 2;
name   price
-----  -----
Drill  45.0
Level  14.75
```

```
sqlite> SELECT name, price FROM parts ORDER BY price DESC LIMIT 2 OFFSET 2;
name    price
------  -----
Hammer  12.99
Wrench  8.5
```

The first query returns only `parts`' two real most-expensive rows —
`LIMIT 2` caps the result set at two rows, applied *after* `ORDER BY`
has already sorted all five, not before. The second, adding `OFFSET 2`,
returns the *next* two rows after skipping the first two — `Hammer` and
`Wrench`, correctly excluding both rows already shown by the first
query and the fifth row (`Tape Measure`) that neither query reached.

### Discard

Nothing throwaway — this exact `LIMIT`/`OFFSET` pair is the real
mechanism Arc 4's own backend (Lesson 34) and Arc 5's own DataTables UI
(Lesson 40) build real pagination on top of.

### Mechanical Walkthrough

- `ORDER BY price DESC LIMIT 2` — **(b) hard concept reappearing** for
  `ORDER BY price DESC`, already fully explained above; `LIMIT 2` —
  **(a) first appearance**: caps the already-ordered result set at its
  first two rows.
- `LIMIT 2 OFFSET 2` — **(a) first appearance** of `OFFSET`: skips the
  first `2` rows of the already-ordered, already-`LIMIT`-capped-from
  result before counting out the next `2` to return.

### CS Lens

`LIMIT`/`OFFSET` together implement **pagination**: returning a
bounded-size slice of a larger, ordered sequence, addressed by a
starting position — the exact real mechanism behind "page 2 of search
results," a scrollable feed loading more content, or any UI that shows
20 rows at a time out of a much larger real total.

Also recognized in: Python's own slice syntax `sequence[offset:offset +
limit]`, array pagination in virtually every REST API that returns
lists, a book's own table of contents pointing to a bounded page range
instead of printing the entire book at once.

### SE Lens

The real alternative not chosen: fetch every row, every time, and let
application code slice off the piece it actually wants to show. The
real cost, invisible at `parts`' current five rows and genuinely
damaging at scale: every unfetched row still crosses the real
network/process boundary between the database and its caller, using
real memory and real bandwidth for data no one asked to see. `LIMIT`
lets the database engine discard the excess before it ever leaves the
engine — the same "push the decision to where the data already lives"
principle this lesson's own `WHERE` unit already named, applied to size
instead of filtering.

## Connect the pieces

One real chain, start to finish: `WHERE price > 10` answered Lesson 01's
original motivating question for real, against this project's own five
rows, keeping only the ones that satisfy a real predicate. `ORDER BY
price DESC` then proved a result set's order is a property of the
*query*, chosen independently of `parts`' own real, unrelated insertion
order. `LIMIT 2 OFFSET 2`, stacked on top of that same ordering, sliced
out exactly the third and fourth most expensive rows — the same real
mechanism a future page of search results, in Arc 4 and Arc 5, will be
built directly on top of.

## What breaks without this

Reorder `LIMIT` and `ORDER BY` themselves — write `LIMIT` before
`ORDER BY` instead of after:

```
$ sqlite3 pocket_hardware.db "SELECT name, price FROM parts LIMIT 2 ORDER BY price DESC;"
Error: near "ORDER": syntax error
```

A real, immediate syntax error — SQL's clause order is fixed
(`SELECT` → `FROM` → `WHERE` → `ORDER BY` → `LIMIT`), and unlike English
prose, rearranging clauses isn't a stylistic choice; the parser accepts
exactly one real order and rejects every other one outright, before
even attempting to run the query.

## Exercises

1. Write a real query returning every `parts` row with `quantity`
   greater than or equal to `10`, ordered by `name` ascending (SQL's own
   default when `ASC`/`DESC` is omitted) — confirm the real result
   includes exactly `Wrench` and `Tape Measure`, in that alphabetical
   order.
2. Using `LIMIT`/`OFFSET`, write three separate real queries that
   together read all five `parts` rows two at a time (page size `2`) —
   confirm the third page correctly returns only the one remaining row,
   with no error and no duplicate row across all three pages.

## Definition of Done

- [ ] You answered Lesson 01's original "which parts cost more than
      $10?" question for real, with a real `WHERE` query against
      `parts`.
- [ ] You proved a result set's `ORDER BY` order is independent of
      `parts`' own real insertion order, and can state why SQL doesn't
      guarantee insertion order without it.
- [ ] You reproduced the real two-page `LIMIT`/`OFFSET` proof and
      understand why `OFFSET 2` was necessary to avoid repeating the
      first query's own two rows.
- [ ] You caused the real `ORDER`-after-`LIMIT` syntax error and can
      state SQL's real, fixed clause order from memory.
- [ ] You completed both exercises.

## Next

[Lesson 05 — `NULL` and Three-Valued Logic](lesson-05-null-and-three-valued-logic.md)
covers a real, provable gap in `WHERE`'s own predicate logic — Lesson
03 already produced a genuinely missing value once, and this lesson
proves it doesn't behave the way `WHERE`'s comparisons above might
suggest.
