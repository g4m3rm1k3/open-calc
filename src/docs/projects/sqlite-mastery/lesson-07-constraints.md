# Lesson 07: Constraints

**What you will build:** a real second table, `suppliers`, with four
different real constraints enforced on it from the moment it's created —
and direct, run proof of each one rejecting a real bad insert before it
ever reaches a stored row.

**What you need to know first:** [Lesson 06](lesson-06-update-and-delete.md)
— this lesson's own closing section proved SQL enforces nothing that
stops a WHERE-less mistake. Constraints are this project's first real,
engine-enforced defense, layered on top of (never a replacement for)
writing careful SQL.

**Terms introduced in this lesson:** none new — `NOT NULL`, `UNIQUE`,
`CHECK`, and `DEFAULT` are this lesson's own subject, covered as Objects
and methods below, following the same treatment `CREATE TABLE` itself
received in Lesson 02.

**Objects and methods used:**

**`NOT NULL`**
- *What it is:* a column constraint forbidding Lesson 05's own `NULL`
  from ever being stored in that column.
- *Implementation:* written directly after a column's type name in
  `CREATE TABLE` — `name TEXT NOT NULL`; any `INSERT`/`UPDATE` that would
  leave it `NULL` is rejected outright.
- *Its use:* `suppliers.name` — a supplier record with no name at all is
  never a real, useful row.

**`UNIQUE`**
- *What it is:* a column constraint forbidding two rows from sharing the
  same real value in that column.
- *Implementation:* `email TEXT UNIQUE` — enforced by a real, automatic
  index SQLite creates and maintains internally (a preview of Lesson
  13's own dedicated subject).
- *Its use:* `suppliers.email` — two different real supplier rows should
  never claim the same contact address.

**`CHECK`**
- *What it is:* a column (or table-level) constraint that must evaluate
  true for every stored row, expressed as an arbitrary real SQL
  predicate — not limited to a fixed rule like `NOT NULL`/`UNIQUE`.
- *Implementation:* `rating INTEGER CHECK (rating BETWEEN 1 AND 5)` —
  `BETWEEN a AND b` is real, inclusive-range SQL syntax; any row where
  the parenthesized predicate evaluates false is rejected.
- *Its use:* `suppliers.rating` — a 1-to-5 real rating scale, with
  anything outside it rejected rather than silently stored.

**`DEFAULT`**
- *What it is:* a column constraint (loosely: a fallback rule, not a
  restriction like the other three) supplying a real value automatically
  whenever an `INSERT` doesn't specify one.
- *Implementation:* `is_preferred INTEGER NOT NULL DEFAULT 0` — `0`
  becomes the real, stored value the instant `is_preferred` is left out
  of an `INSERT`'s column list, rather than becoming `NULL` the way
  Lesson 03 and Lesson 05 proved an ordinary omitted column does.
- *Its use:* every new `suppliers` row starts "not preferred" unless a
  real `INSERT` says otherwise.

---

## Concept Unit: Four Real Constraints, Enforced From `CREATE TABLE` Onward

### The Problem

`parts`' own four columns, as declared back in Lesson 02, forbid
nothing: any `price`, any `quantity`, any `name` — including a genuinely
malformed one — is accepted without complaint, the moment it's the
right storage class (Lesson 02's own type-affinity proof). This
project's next real table, `suppliers` — one real row per hardware
supplier, needed before Lesson 08's foreign keys can point at anything
— is the right place to prove SQL can do better than that.

### Introduce the Concept in Isolation

No throwaway table — every constraint below is proven directly against
this project's own real, permanent `suppliers` table, created for the
first time in this exact statement:

```
$ sqlite3 pocket_hardware.db
sqlite> CREATE TABLE suppliers (
   ...>     id INTEGER PRIMARY KEY,
   ...>     name TEXT NOT NULL,
   ...>     email TEXT UNIQUE,
   ...>     rating INTEGER CHECK (rating BETWEEN 1 AND 5),
   ...>     is_preferred INTEGER NOT NULL DEFAULT 0
   ...> );
```

`NOT NULL`, real, tested first:

```
sqlite> INSERT INTO suppliers (email) VALUES ('x@example.com');
Runtime error: NOT NULL constraint failed: suppliers.name
```

A real, named rejection — `name` was left out of the column list, which
Lesson 03 already proved ordinarily produces a real `NULL`; here,
`NOT NULL` refuses to let that `NULL` ever get stored, and the entire
`INSERT` fails rather than partially succeeding.

A real, valid row, to prove the constraints don't block legitimate data:

```
sqlite> INSERT INTO suppliers (name, email, rating) VALUES
   ...>     ('Ace Tools Co.', 'sales@acetools.example', 5);
```

`UNIQUE`, real, against that same email:

```
sqlite> INSERT INTO suppliers (name, email, rating) VALUES
   ...>     ('Copycat Supply', 'sales@acetools.example', 3);
Runtime error: UNIQUE constraint failed: suppliers.email
```

Rejected — even though `name` and `rating` are both perfectly valid on
their own, the shared `email` alone is enough to fail the whole row.

`CHECK`, real, against an out-of-range rating:

```
sqlite> INSERT INTO suppliers (name, email, rating) VALUES
   ...>     ('Bad Rating Co.', 'bad@example.com', 9);
Runtime error: CHECK constraint failed: rating BETWEEN 1 AND 5
```

Rejected — `9` is a real, valid integer (Lesson 02's own type affinity
has no complaint about it), but `CHECK`'s own predicate, evaluated
against this specific row, is false.

`DEFAULT`, real, proven by omission:

```
sqlite> INSERT INTO suppliers (name, email) VALUES
   ...>     ('Northwind Hardware', 'orders@northwind.example');
sqlite> .headers on
sqlite> .mode column
sqlite> SELECT * FROM suppliers;
id  name                email                     rating  is_preferred
--  ------------------  ------------------------  ------  ------------
1   Ace Tools Co.       sales@acetools.example    5       0
2   Northwind Hardware  orders@northwind.example          0
```

`rating` for row 2 is genuinely `NULL` (no `DEFAULT` was declared on
it, and `CHECK`'s own predicate never runs at all against a `NULL`
value — three-valued logic, Lesson 05's own subject, treats `NULL
BETWEEN 1 AND 5` as `UNKNOWN`, not false, so the row is accepted).
`is_preferred`, by contrast, is a real, concrete `0` — not `NULL` —
because `DEFAULT 0` supplied it the instant the column was left out of
the `INSERT`'s own list, exactly the behavior this lesson's Header
promised.

### Discard

Nothing throwaway — `suppliers` is a real, permanent second table in
`pocket_hardware.db`, and every constraint above stays enforced for the
rest of this series.

### Mechanical Walkthrough

- `name TEXT NOT NULL,` — **(a) first appearance** of `NOT NULL`, full
  treatment above.
- `email TEXT UNIQUE,` — **(a) first appearance** of `UNIQUE`, full
  treatment above.
- `rating INTEGER CHECK (rating BETWEEN 1 AND 5),` — **(a) first
  appearance** of `CHECK`, and, inside it, `BETWEEN ... AND ...` — a
  real, dedicated inclusive-range comparison, first appearance in this
  series even though its effect (`rating >= 1 AND rating <= 5`, Lesson
  04's own `AND` reused) could be spelled without it.
- `is_preferred INTEGER NOT NULL DEFAULT 0` — **(b) hard concept
  reappearing** for `NOT NULL`, just explained two lines above,
  correctly combined with `DEFAULT` (**(a) first appearance**, full
  treatment above) on the same column — proving the two are
  independent, stackable constraints, not alternatives to each other.

### CS Lens

Every one of these four is a real, enforced **invariant**: a rule the
engine itself guarantees holds for every stored row, at every point in
time, rather than a rule application code is merely expected to
remember to check.

Also recognized in: a class's own constructor validating its arguments
before ever constructing the object, a type system rejecting a value at
compile time rather than trusting a comment describing what "should"
hold, an assertion left permanently active in production code instead
of only during testing — the shared idea: move a rule from "hopefully
true, if every caller remembered" to "provably true, checked by
something other than trust."

### SE Lens

Constraints are this project's real, first instance of pushing
validation to the actual data boundary, rather than trusting every
future piece of application code (Arc 2's Python layer, Arc 4's FastAPI
backend, Arc 5's desktop UI, and any tool this database is ever opened
from directly, per Arc 3) to independently remember and correctly
re-implement the same rules. The real alternative not chosen — validate
only in application code, keep the schema itself permissive — has a
real, honest cost this project would otherwise carry forward silently:
N independent call sites, each capable of forgetting the rule in its
own unique way, the identical failure mode Lesson 01's own SE Lens
already named for hand-rolled filtering logic. The real cost paid here
instead: a rejected `INSERT` is a hard failure, not a soft warning —
calling code (starting Arc 2) must be written to expect and handle it,
never assume every `INSERT` silently succeeds.

## Connect the pieces

One real table, `suppliers`, now exists with four independent real
constraints, each proven by a real, rejected bad insert before a single
valid row was ever written: `NOT NULL` refused a nameless supplier,
`UNIQUE` refused a duplicate email even with an otherwise-valid row
around it, `CHECK` refused an out-of-range rating using a real predicate
rather than a fixed built-in rule, and `DEFAULT` proved omission doesn't
always mean `NULL` — only when nothing else was declared to catch it.
Two real, valid suppliers — `Ace Tools Co.` and `Northwind Hardware` —
now exist, ready for Lesson 08 to give `parts` a real, enforced way to
point at either one.

## What breaks without this

Recreate `suppliers`' exact same four columns, deliberately with every
constraint stripped out, against a throwaway table only:

```
$ sqlite3 pocket_hardware.db
sqlite> CREATE TABLE suppliers_unsafe (
   ...>     id INTEGER PRIMARY KEY, name TEXT, email TEXT, rating INTEGER
   ...> );
sqlite> INSERT INTO suppliers_unsafe (rating) VALUES (9999);
sqlite> INSERT INTO suppliers_unsafe (email) VALUES ('dup@example.com');
sqlite> INSERT INTO suppliers_unsafe (email) VALUES ('dup@example.com');
sqlite> SELECT * FROM suppliers_unsafe;
id  name  email            rating
--  ----  ---------------  ------
1         9999
2         dup@example.com
3         dup@example.com
```

Every real mistake this lesson's own constraints would have caught
succeeds silently here: a nameless row, a nonsensical `9999` rating, and
two rows sharing the exact same email, all stored without one single
error. Nothing about SQLite's real engine catches any of this on its
own — the four constraint keywords this lesson taught are not defaults;
they are opt-in, and a schema that omits them accepts anything shaped
correctly enough to satisfy Lesson 02's own type affinity alone.

## Exercises

1. Add a real `phone` column to a throwaway table with a `CHECK`
   constraint requiring it to be either `NULL` or at least 7 characters
   long (`CHECK (phone IS NULL OR length(phone) >= 7)` — `length()` is a
   real, built-in SQL function; look up its signature before using it).
   Prove both a valid short-circuit case (`NULL`) and a real rejection
   (a 3-character phone number) against it.
2. Attempt to `INSERT` a third supplier into this lesson's own real
   `suppliers` table with a `NULL` `rating` intentionally, and confirm —
   using this lesson's own three-valued-logic explanation of why row 2
   above already has a `NULL` rating — that it succeeds rather than
   being rejected by `CHECK`.

## Definition of Done

- [ ] You created the real `suppliers` table with all four constraints.
- [ ] You caused all three real rejections (`NOT NULL`, `UNIQUE`,
      `CHECK`) and can state, for each, which specific rule the
      rejected row violated.
- [ ] You proved `DEFAULT` produces a real, concrete stored value on
      omission, distinct from an ordinary omitted column's `NULL`.
- [ ] You reproduced the throwaway `suppliers_unsafe` proof and
      understand that constraints are opt-in, not automatic.
- [ ] You completed both exercises.

## Next

[Lesson 08 — Primary and Foreign Keys](lesson-08-primary-and-foreign-keys.md)
connects `parts` to this lesson's real `suppliers` table for the first
time — and proves a real, load-bearing SQLite default this series has
to work around explicitly.
