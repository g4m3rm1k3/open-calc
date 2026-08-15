# Lesson 05: `NULL` and Three-Valued Logic

**What you will build:** a sixth real `parts` row with a genuinely
missing price — a real screwdriver set your hardware store hasn't been
quoted a supplier price for yet — and direct, run proof that ordinary
`=` comparison cannot find it, even when asked exactly that.

**What you need to know first:** [Lesson 04](lesson-04-select-where-order-by-limit.md)
— `WHERE`'s real predicate mechanics, which this lesson proves has a
genuine gap. [Lesson 03](lesson-03-insert-and-the-row.md) already proved
an omitted column becomes a real, missing value; this lesson names that
value and its real, surprising behavior.

**Terms introduced in this lesson:**
- **`NULL`** — SQL's real representation of "no value recorded" —
  genuinely absent, not zero, not an empty string, not any other
  concrete value standing in for "missing."
- **Three-valued logic** — SQL predicates don't only evaluate to true or
  false; a comparison involving `NULL` evaluates to a real third truth
  value, **`UNKNOWN`**, which `WHERE` treats the same as false (excluded
  from the result) but which is not the same thing as false.

**Objects and methods used:**

**`IS NULL` / `IS NOT NULL`**
- *What it is:* a real, dedicated comparison operator pair, distinct
  from `=`/`!=`, that exists specifically because `=` cannot correctly
  test for `NULL` — proven below.
- *Implementation:* `expr IS NULL` — true exactly when `expr` is `NULL`;
  `expr IS NOT NULL` — true exactly when it isn't. Unlike every other
  comparison operator, both always evaluate to a real true or false,
  never `UNKNOWN`.
- *Its use:* the only correct way, anywhere in this series, to ask "is
  this value missing?"

---

## Concept Unit: `NULL` Breaks Ordinary Equality

### The Problem

Lesson 03 proved a column left out of an `INSERT`'s column list becomes
a genuinely missing value, displayed as nothing by the CLI. If this
series adds a real `parts` row with a missing `price` — a real, common
case for a hardware store (an item not yet quoted by a supplier) — can
`WHERE price = <anything>` ever find it?

### Introduce the Concept in Isolation

A sixth real row, `price` deliberately left out of the column list:

```
$ sqlite3 pocket_hardware.db
sqlite> INSERT INTO parts (name, quantity) VALUES ('Screwdriver Set', 8);
sqlite> .headers on
sqlite> .mode column
sqlite> SELECT * FROM parts;
id  name             price  quantity
--  ---------------  -----  --------
1   Hammer           12.99  4
2   Wrench           8.5    10
3   Drill            45.0   2
4   Tape Measure     6.25   15
5   Level            14.75  6
6   Screwdriver Set         8
```

Row 6's `price` column is genuinely blank — real, missing, called
**`NULL`**, not the number `0` and not an empty string (confirmed
directly: `SELECT typeof(price) FROM parts WHERE name = 'Screwdriver
Set';` returns the literal text `null`, the same real storage-class name
Lesson 02's `typeof()` already explained).

The real, surprising part — asking `WHERE` to find it with ordinary
equality:

```
sqlite> SELECT NULL = NULL AS result;
result

```

```
sqlite> SELECT name, price FROM parts WHERE price = NULL;

```

Both queries return **nothing** — not an error, and not the expected
row. `NULL = NULL` doesn't evaluate to true; it evaluates to `NULL`
itself (displayed as a blank result, the same as any other missing
value). `WHERE price = NULL` inherits that same blank/`NULL` result for
every single row, and `WHERE` treats anything that isn't definitely true
as grounds for exclusion — so a query built specifically to find the
missing-price row finds nothing at all, including the very row it was
looking for.

### Discard

Nothing throwaway — `Screwdriver Set` is now a real, permanent sixth row
in `parts`, and `SELECT NULL = NULL` is shown once, directly, as proof,
not as project code to keep.

### Mechanical Walkthrough

- `INSERT INTO parts (name, quantity) VALUES ('Screwdriver Set', 8);` —
  **(b) hard concept reappearing**: Lesson 03's own column-list `INSERT`
  form, this time deliberately omitting `price` to produce a real
  missing value on purpose.
- `SELECT NULL = NULL AS result;` — **(b) hard concept reappearing** for
  `SELECT`/`AS` (Lesson 02's naming already covered plain column
  references; `AS` renaming an expression's own output column is the
  same underlying idea). The literal `NULL` written directly in SQL —
  **(a) first appearance**: a literal, usable anywhere a value can
  appear, meaning "no value" outright, not read from any column.
- `WHERE price = NULL` — **(b) hard concept reappearing** for `WHERE`
  and `=`, both fully explained in Lesson 04; the *result* of combining
  them with a `NULL` operand is this whole unit's real point, not a new
  syntactic element.

### CS Lens

This is **three-valued logic**: `=`, like every ordinary comparison
operator, produces one of three real outcomes against a `NULL` operand
— true, false, or a genuine third value, **`UNKNOWN`** — rather than
the two-valued true/false a general-purpose programming language's `==`
almost always guarantees.

Also recognized in: Kleene logic and other formal three-valued logics
used in circuit design (a wire can be high, low, or floating/undefined),
`NaN` in IEEE floating point (`NaN == NaN` is `false`, a different but
related "this equality question doesn't have a normal answer" case),
optional/nullable type systems that force a language to handle "value
absent" as a real third state rather than silently coercing it to
`false` or `0`.

### SE Lens

SQL's designers could have made `NULL = NULL` evaluate to true — a real
alternative that was not chosen, and for a real reason: `NULL` means "we
don't know this value," and two unknown values are not necessarily
equal to *each other* just because both are unknown (two different
suppliers' screwdriver-set prices, both not yet quoted, are not
provably the same price). Choosing strict three-valued logic keeps that
distinction honest, at a real, ongoing cost this lesson exists to name
directly: `=` alone is never sufficient to test for missingness, and
code that assumes otherwise — including this unit's own first, failed
`WHERE price = NULL` — silently returns an empty result instead of
raising an error, the worst possible failure mode because nothing about
it looks wrong at a glance.

## Concept Unit: `IS NULL` / `IS NOT NULL` — Three-Valued Logic's Real Escape Hatch

### The Problem

If `=` can never correctly test for `NULL`, what does?

### Introduce the Concept in Isolation

The exact same missing-price row, found correctly this time:

```
sqlite> SELECT name, price FROM parts WHERE price IS NULL;
name             price
---------------  -----
Screwdriver Set
```

```
sqlite> SELECT name, price FROM parts WHERE price IS NOT NULL;
name          price
------------  -----
Hammer        12.99
Wrench        8.5
Drill         45.0
Tape Measure  6.25
Level         14.75
```

`IS NULL` finds exactly the one row `= NULL` couldn't; `IS NOT NULL`
finds the other five — together, correctly partitioning all six rows,
proving `IS`/`IS NOT` are real operators with their own real logic,
outside three-valued logic's usual rules: they always resolve to a
definite true or false, specifically because their entire job is
answering the one question ordinary comparison can't.

`NULL`'s three-valued behavior doesn't stop at direct comparison —
it propagates through arithmetic and through `OR`:

```
sqlite> SELECT price * quantity AS total_value FROM parts WHERE name = 'Screwdriver Set';
total_value

```

```
sqlite> SELECT name, price FROM parts WHERE price > 5 OR price IS NULL;
name             price
---------------  -----
Hammer           12.99
Wrench           8.5
Drill            45.0
Tape Measure     6.25
Level            14.75
Screwdriver Set
```

`price * quantity` for the `Screwdriver Set` row is itself `NULL` — any
arithmetic expression touching a `NULL` operand produces `NULL`, not a
best-effort partial answer, since "unknown times eight" is itself
unknown. The final query proves `OR`'s own real three-valued rule: for
`Screwdriver Set`, `price > 5` evaluates to `UNKNOWN` (comparing `NULL`
against `5`), but `price IS NULL` evaluates to a definite `true` for
that same row — and `UNKNOWN OR true` is `true`, so the row survives.
This is the real, correct pattern for "give me everything past this
threshold, including anything I don't have a price for yet" — a
genuinely common real query shape.

### Discard

Nothing throwaway — every query above is real, permanent proof of how
`parts`' own actual data behaves, not a disposable example.

### Mechanical Walkthrough

- `WHERE price IS NULL` — **(a) first appearance** of `IS NULL`, full
  treatment above.
- `WHERE price IS NOT NULL` — **(a) first appearance** of `IS NOT NULL`,
  the direct logical complement.
- `SELECT price * quantity AS total_value` — **(a) first appearance**
  of `*` as SQL's real multiplication operator (ordinary arithmetic,
  worth naming once); its behavior against a `NULL` operand is this
  unit's own real point, not a separate concept.
- `WHERE price > 5 OR price IS NULL` — **(b) hard concept reappearing**
  for `WHERE`, `>`, and `IS NULL`, all already explained; `OR` —
  **(a) first appearance**: true when either side is true, including —
  proven directly above — when the other side is only `UNKNOWN`, not
  false.

### CS Lens

`NULL`'s propagation through arithmetic and comparison is a real
instance of a **propagating sentinel value**: an "absence" marker that
poisons any ordinary computation it touches, rather than being silently
treated as a stand-in for zero or empty.

Also recognized in: `NaN` propagating through floating-point arithmetic
(`NaN + 5` is `NaN`, never `5`), `None`/`null`/`nil` raising an error
the instant ordinary code tries to use it directly in most languages,
monadic `Maybe`/`Option` types in functional languages, whose entire
design is forcing exactly this propagation to be handled explicitly
instead of silently.

### SE Lens

`price > 5 OR price IS NULL`'s correctness depends on `OR`'s real
three-valued truth table — `UNKNOWN OR true = true`, proven directly
above — not merely on "or" as an English word. The real alternative this
project is deliberately not taking: forbidding `NULL` in `price`
entirely (this series' own Lesson 07, `NOT NULL`), which trades away a
real, legitimate business fact — "we don't have this data yet" — for
the simplicity of never having to reason about three-valued logic at
all. Both are real, valid designs; this lesson's own hardware-store data
keeps `price` nullable on purpose, because "not yet priced" is a real,
different fact from "priced at zero."

## Connect the pieces

One real gap, proven, then closed: `Screwdriver Set`'s missing `price` —
a real, genuine `NULL`, not a zero or an empty string — could not be
found by `WHERE price = NULL`, because `NULL = NULL` itself evaluates to
`NULL`, not true, under SQL's own three-valued logic. `IS NULL` and `IS
NOT NULL`, built specifically to sidestep that rule, correctly
partitioned all six real rows. That same three-valued behavior explained
why `price * quantity` came back `NULL` for this one row, and, combined
with `OR`'s own real truth table, is exactly what let `price > 5 OR
price IS NULL` correctly include a row whose price comparison alone was
only `UNKNOWN`.

## What breaks without this

Attempt the natural-seeming but wrong fix — testing for missingness with
`!=` instead of `IS NOT`:

```
$ sqlite3 pocket_hardware.db "SELECT name FROM parts WHERE price != 12.99;"
name
------------
Wrench
Drill
Tape Measure
Level
```

`Screwdriver Set` — genuinely not equal to `12.99` in any real sense —
is silently missing from a result that claims to be "everything not
priced at $12.99." The same root cause as this lesson's opening proof:
`price != 12.99` for the `NULL` row evaluates to `UNKNOWN`, not true,
and `WHERE` excludes it exactly like it excludes a definite false. This
is the single most common real `NULL` bug: `!=`/`<>` silently drop every
`NULL` row from a result set that, by its own English description,
should have included them — no error, no warning, just a quietly
incomplete answer.

## Exercises

1. Rewrite the broken query above so it correctly includes
   `Screwdriver Set` alongside every genuinely-not-`$12.99` row, using
   `OR price IS NULL` the same way this lesson's own final query did.
2. Using `COALESCE(price, 0)` (a real SQL function — look up its real
   signature before using it, but you are not required to fully explain
   it, only to use it correctly here), write a query that sorts all six
   `parts` rows by price ascending, with `Screwdriver Set` sorting as if
   its price were `0` — confirm it now appears first instead of being
   silently excluded the way `ORDER BY price` alone would leave it
   ordered unpredictably relative to real priced rows.

## Definition of Done

- [ ] You added the real `Screwdriver Set` row with a genuinely missing
      `price`, and confirmed `typeof(price)` reports `null` for it.
- [ ] You reproduced the real `NULL = NULL` and `WHERE price = NULL`
      proof and can state, from memory, why both return nothing instead
      of finding the missing-price row.
- [ ] You reproduced the `IS NULL`/`IS NOT NULL` correct partition of
      all six rows.
- [ ] You reproduced the `price > 5 OR price IS NULL` proof and can
      state `OR`'s real three-valued rule that makes it work.
- [ ] You caused the real `!=`-silently-excludes-`NULL` failure and
      understood why it's the most common real `NULL` bug.
- [ ] You completed both exercises.

## Next

[Lesson 06 — `UPDATE` and `DELETE`](lesson-06-update-and-delete.md) gives
`parts`' `Screwdriver Set` row a real price once your supplier quotes
one — and proves a real, permanent danger in both statements that
`INSERT` alone never has.
