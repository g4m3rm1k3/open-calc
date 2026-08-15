# Lesson 02: `CREATE TABLE` and SQLite's Type Affinity

**What you will build:** the real, first table of this series' running
project — `pocket_hardware.db`'s `parts` table — plus direct, run proof
of SQLite's own genuinely distinctive rule about what a column's declared
type name actually guarantees (less than you'd assume coming from almost
any other database).

**What you need to know first:** [Lesson 01](lesson-01-what-a-database-is-and-why-sqlite.md)
— what a database and a DBMS are, and the proven fact that a SQLite file
only becomes real the moment real content is written to it. This
lesson's own `CREATE TABLE` is that real write, given full treatment for
the first time.

**Terms introduced in this lesson:**
- **Schema** — the declared shape data must conform to: which tables
  exist, and which columns, in which order, with which types, each one
  has.
- **`rowid`** — a real, hidden 64-bit integer every ordinary SQLite table
  row has automatically, used internally to locate that row.
- **Storage class** — the *actual, real* kind of a specific stored
  value: `NULL`, `INTEGER`, `REAL`, `TEXT`, or `BLOB` — a fact about one
  value, not about a column.
- **Type affinity** — a *preference* a column's declared type name gives
  the storage engine for coercing an incoming value toward one storage
  class, before falling back to storing it exactly as given if
  coercion isn't possible.

**Objects and methods used:**

**`CREATE TABLE`**
- *What it is:* the real SQL statement that declares a new table's
  schema — this lesson's own main subject.
- *Implementation:* `CREATE TABLE table_name (column_name TYPE_NAME,
  ...);` — one or more comma-separated column definitions between
  parentheses, terminated with `;`.
- *Its use:* the exact statement that creates this series' real, running
  `parts` table.

**`INTEGER PRIMARY KEY`**
- *What it is:* a column declaration that makes this column a real,
  literal alias for the table's own hidden `rowid` — not merely a
  uniqueness constraint layered on top of it.
- *Implementation:* proven below by changing a row's declared
  `INTEGER PRIMARY KEY` value directly and observing `rowid` change to
  match, in the same operation.
- *Its use:* `parts.id`, this series' own real, human-readable handle
  onto each row's `rowid`.

**`typeof()`**
- *What it is:* a real, built-in SQL function.
- *Implementation:* `typeof(X)` — returns one of the five literal
  strings `"null"`, `"integer"`, `"real"`, `"text"`, `"blob"`: the real
  storage class of whatever value `X` evaluates to, not the affinity of
  the column it came from.
- *Its use:* the exact tool this lesson uses to prove type affinity is
  real, not a claim taken on faith.

**`.schema`**
- *What it is:* a dot-command (Lesson 01 introduced the category; this
  is a new one).
- *Implementation:* `.schema ?PATTERN?` — prints the real, exact
  `CREATE TABLE`/`CREATE INDEX`/etc. statement(s) currently stored for
  the matching object(s), or every object if no pattern is given.
- *Its use:* confirms, in the database's own words, exactly what schema
  a `CREATE TABLE` statement actually produced.

---

## Concept Unit: `CREATE TABLE` — Declaring a Real Table's Shape

### The Problem

Lesson 01 proved that a real write — any real write — is what makes a
SQLite file materialize on disk. What does the *smallest* real write
actually look like, and what does declaring a table's shape in advance
actually buy you?

### Introduce the Concept in Isolation

A throwaway two-column table, one row inserted with an explicit `id`,
a second with none:

```
$ sqlite3 rowid_probe.db
sqlite> CREATE TABLE probe (id INTEGER PRIMARY KEY, label TEXT);
sqlite> INSERT INTO probe (label) VALUES ('first');
sqlite> INSERT INTO probe (label) VALUES ('second');
sqlite> SELECT rowid, id, label FROM probe;
1|1|first
2|2|second
```

Every ordinary SQLite table already has a real, hidden 64-bit integer
per row called **`rowid`**, assigned automatically — proven directly
above: neither `INSERT` supplied an `id`, and both rows still got one,
matching `rowid` exactly. Now the real, load-bearing question:
is `id` merely *initialized* from `rowid`, or is it the *same* value,
permanently?

```
sqlite> UPDATE probe SET id = 100 WHERE label = 'first';
sqlite> SELECT rowid, id, label FROM probe;
2|2|second
100|100|first
```

Changing `id` changed `rowid` too, in the same row, with no separate
update to `rowid` written anywhere. This proves `id` and `rowid` are the
literal same stored value under two names, not two values kept
coincidentally equal — the real meaning of `INTEGER PRIMARY KEY` in
SQLite specifically: a real alias for `rowid`, not just a uniqueness
rule bolted on top of an ordinary column.

### Discard

`rowid_probe.db` and its throwaway `probe` table are deleted now;
neither reappears.

### Project Change

- **Reference Source** — no reference counterpart; this series designs
  its own hardware-store schema from scratch.
- **Files affected** — `pocket_hardware.db`, created for real (Lesson
  01 opened this filename but never wrote to it — this is that file's
  first real content).
- **Change type** — add (the project's first table).
- **Location** — n/a; this is the first object in a brand-new database.
- **Dependencies** — the real `sqlite3` CLI, already confirmed working
  in Lesson 01.

### The New Code

```sql
CREATE TABLE parts (
    id INTEGER PRIMARY KEY,
    name TEXT,
    price REAL,
    quantity INTEGER
);
```

### The Updated Project

This is the whole new structure — a brand-new table in a database that,
per Lesson 01's own proof, held no real content until this exact
statement ran. Confirmed in the database's own words:

```
sqlite> .schema parts
CREATE TABLE parts (
    id INTEGER PRIMARY KEY,
    name TEXT,
    price REAL,
    quantity INTEGER
);
```

`pocket_hardware.db` now holds one real table, `parts`, with four
columns — an identity (`id`), and three columns describing one
hardware-store part (`name`, `price`, `quantity`) — and, per Lesson 01's
own proof, is now a real, non-empty file on disk for the first time.

### Mechanical Walkthrough

- `CREATE TABLE parts (` — **(a) first appearance.** The statement
  keyword pair `CREATE TABLE`, naming the new table `parts`, opening a
  parenthesized list of column definitions.
- `id INTEGER PRIMARY KEY,` — **(a) first appearance.** `id` is the
  column's name; `INTEGER PRIMARY KEY` (this exact two-keyword pair,
  together) is what makes `id` a real alias for the table's own hidden
  `rowid`, proven above — not an ordinary column that merely happens to
  hold integers.
- `name TEXT,` / `quantity INTEGER` — **(a) first appearance** of
  declaring an ordinary column's type name; full treatment of what that
  type name actually guarantees is this lesson's second Concept Unit,
  immediately below.
- `price REAL` — same as above; `REAL` specifically is SQLite's name for
  a floating-point column.
- `);` — **(a) first appearance** of a multi-line SQL statement's real
  terminator: the statement doesn't end at a line break, only at the
  literal `;`, which is why every line above except the last has a
  trailing comma and no semicolon.

### CS Lens

A `CREATE TABLE` statement is a **schema**: a declared, fixed shape data
must conform to, checked at write time rather than left to be discovered
by whoever reads it later.

Also recognized in: a `struct` definition in C, a TypeScript `interface`,
a Protocol Buffers `.proto` message, an XML Schema (XSD) — every one of
these is the same underlying idea (a name for "data shaped exactly like
this"), applied to a different kind of data.

### SE Lens

This is **schema-on-write**: the shape of the data is declared and
enforced once, at the table's own definition, rather than **schema-on-
read** — the alternative genuinely used elsewhere (a raw CSV file, like
Lesson 01's `parts.csv`; many NoSQL document stores), where nothing
stops malformed data from being written, and the cost of checking
"is this actually shaped right" is paid by *every single reader*,
separately, forever. Schema-on-write's real cost, honestly stated: the
table's shape has to be decided before any real data exists, and
changing it later (this series' own Lesson 49, once a real complex
database is involved) is real, nontrivial work — a cost schema-on-read
never pays, because it never made a promise in the first place.

## Concept Unit: Type Affinity — a Column's Declared Type Is a Preference, Not a Guarantee

### The Problem

The `parts` table just declared `quantity INTEGER`. In a client-server
database, that declaration is an enforced promise: an attempt to store
text there is rejected outright. Does SQLite enforce that same promise?

### Introduce the Concept in Isolation

A throwaway single-column table, declared `INTEGER`, given four
deliberately mismatched values:

```
$ sqlite3 affinity.db
sqlite> CREATE TABLE probe (n INTEGER);
sqlite> INSERT INTO probe VALUES (42);
sqlite> INSERT INTO probe VALUES ('hello');
sqlite> INSERT INTO probe VALUES ('99');
sqlite> INSERT INTO probe VALUES (3.7);
sqlite> SELECT rowid, n, typeof(n) FROM probe;
1|42|integer
2|hello|text
3|99|integer
4|3.7|real
```

None of the four `INSERT`s failed. Row 1's plain integer stayed an
integer. Row 2's genuinely non-numeric text (`'hello'`) stayed text,
exactly as written — the `INTEGER` column declaration did not, and
could not, reject it. Row 3's `'99'` — text that *looks* numeric — was
silently converted to the real integer `99`. Row 4's `3.7` was stored as
a real number, not truncated to fit `INTEGER`.

This is called **type affinity**: `INTEGER` on a column declaration
isn't an enforced type in SQLite the way it is in most other databases
— it's a *preference*. The engine tries to coerce an incoming value
toward the declared affinity's storage class *only when that conversion
is lossless and unambiguous* (`'99'` → `99`, exactly — nothing about
that text was discarded), and simply stores the value exactly as given,
under its own real storage class, whenever it can't (`'hello'` has no
lossless integer form; `3.7` truncated to an integer would lose real
information, so SQLite keeps it as `REAL` instead of forcing it).

The real, documented mapping from a declared type name to one of five
affinities:

| Declared type name contains… | Affinity |
|---|---|
| `INT` | `INTEGER` |
| `CHAR`, `CLOB`, or `TEXT` | `TEXT` |
| `BLOB`, or no type given at all | `BLOB` |
| `REAL`, `FLOA`, or `DOUB` | `REAL` |
| anything else | `NUMERIC` |

`typeof()` is a real, separate tool from this table: it reports a
*value's* actual storage class, not a *column's* declared affinity —
the exact distinction rows 2 and 3 above prove: same declared affinity
(`INTEGER`) on the column both values live in, two different real
storage classes reported back for the two different values.

### Discard

`affinity.db` and its throwaway `probe` table are deleted now; neither
reappears.

### Project Change

- **Reference Source** — no reference counterpart; this unit inspects
  the real `parts` table this lesson's first Concept Unit already
  created.
- **Files affected** — `pocket_hardware.db` (no schema change — this
  unit only queries the table already created above).
- **Change type** — none (a read-only inspection of already-written
  real project data).
- **Location** — n/a.
- **Dependencies** — the `parts` table and its three real rows, both
  already present from this lesson's first Concept Unit.

### The New Code

```sql
SELECT name,     typeof(name),
       price,    typeof(price),
       quantity, typeof(quantity)
FROM parts;
```

### The Updated Project

This is a standalone query against the already-existing `parts` table —
nothing about the table itself changes; only real proof of what's
inside it, right now:

```
name    typeof(name)  price  typeof(price)  quantity  typeof(quantity)
------  ------------  -----  -------------  --------  ----------------
Hammer  text          12.99  real           4         integer
Wrench  text          8.5    real           10        integer
Drill   text          45.0   real           2         integer
```

Every one of `parts`' real rows already matches its column's declared
affinity — `name` (`TEXT` affinity) really is `text`, `price` (`REAL`
affinity) really is `real`, `quantity` (`INTEGER` affinity) really is
`integer` — because every value this series has inserted so far was
already the right shape. Nothing about that is guaranteed to stay true
the moment application code (Arc 2 onward) starts inserting values it
didn't hand-type directly into the CLI itself.

### Mechanical Walkthrough

- `SELECT name, typeof(name), ...` — **(b) hard concept reappearing**:
  `SELECT` and a comma-separated column list are Lesson 01's own
  `SELECT * FROM sqlite_master` reused, now selecting specific
  expressions instead of `*`.
- `typeof(name)` — **(a) first appearance**, full treatment above:
  returns `name`'s real, per-value storage class as a string.
- `FROM parts;` — **(c) already basic** — reused, unchanged syntax.

### CS Lens

SQLite's type affinity is a real, storage-layer instance of **dynamic
typing with optional hints** — the declared type name is consulted and
respected when it can be, but the language (here, the storage engine)
does not treat it as a hard guarantee the way a statically-typed
system does.

Also recognized in: Python and JavaScript's own dynamic typing (a
variable's real type is a fact about its current value, not a
declaration), TypeScript's gradual typing (annotations are checked at
compile time but erased at runtime — nothing stops a real `any`-typed
value from violating them), duck typing generally ("if it quacks like
an integer, store it as one").

### SE Lens

The real design tradeoff, stated honestly: SQLite's flexible typing
removes real friction during fast, early iteration — a table's shape
can evolve, and an occasional mismatched value doesn't halt the whole
system — at the cost of a real guarantee most other databases give you
for free: that a column's declared type is actually, unconditionally
true of every value inside it. This project is now carrying a real,
named debt forward: application code (starting Arc 2) cannot treat
`quantity INTEGER` as proof that every value read back from it really
is a number, and must validate at its own boundary instead of trusting
the schema alone — the concrete subject of this series' own Lesson 30
(Pydantic request validation), not something this lesson pretends is
already solved.

## Connect the pieces

One real table, `parts`, now exists inside `pocket_hardware.db` for the
first time — the exact real write Lesson 01 proved was necessary before
that file could stop being empty. Its `id` column is proven to be a real
alias for SQLite's own hidden `rowid`, not a separate value kept
coincidentally in sync. And every column's declared type — `TEXT`,
`REAL`, `INTEGER` — is proven to be a real *affinity*, a preference the
engine tries to honor and coerces toward when it safely can, rather than
a strict, enforced guarantee the way the same declarations would behave
in most other databases.

## What breaks without this

Attempt to create `parts` a second time, unchanged, against the same
already-real `pocket_hardware.db`:

```
$ sqlite3 pocket_hardware.db "CREATE TABLE parts (id INTEGER PRIMARY KEY);"
Error: in prepare, table parts already exists
  CREATE TABLE parts (id INTEGER PRIMARY KEY);
               ^--- error here
```

A real, specific error — not a silent overwrite, and not a generic
syntax complaint — naming the exact real conflict (`table parts already
exists`) and pointing, with a real caret, at exactly where in the
statement the engine detected it. SQLite refuses to guess whether a
second `CREATE TABLE parts` means "replace the old one" or "this is a
mistake"; it treats an existing name as a real conflict, every time,
by design.

## Exercises

1. Reproduce this lesson's `rowid`/`INTEGER PRIMARY KEY` proof yourself
   against a new scratch table: insert two rows, confirm `rowid` and
   your primary-key column start out equal, then `UPDATE` the primary
   key on one row directly and confirm `rowid` changes to match in the
   same query.
2. Create a throwaway table with `CREATE TABLE t (n INTEGER) STRICT;` —
   the real `STRICT` keyword, SQLite's own opt-in way to turn a
   column's declared type back into a real, enforced guarantee — and
   attempt the same `INSERT INTO t VALUES ('hello');` this lesson ran
   against a non-`STRICT` table. Confirm you get a real, different
   result this time, and state in your own words what `STRICT` actually
   changed.

## Definition of Done

- [ ] You created the real `parts` table inside `pocket_hardware.db`
      and confirmed its schema with `.schema parts`.
- [ ] You proved `INTEGER PRIMARY KEY` is a real `rowid` alias, not a
      separately-tracked value, by changing one and watching the other
      change with it.
- [ ] You reproduced this lesson's four-row type-affinity proof and can
      state, from memory, why `'99'` became a real integer while
      `'hello'` did not.
- [ ] You caused the real `table parts already exists` failure and
      understood why SQLite refuses to guess your intent here.
- [ ] You completed both exercises.

## Next

[Lesson 03 — `INSERT` and the Row](lesson-03-insert-and-the-row.md)
gives `INSERT` — used above only as a vehicle for proving type affinity
— its own full, real treatment: every form it takes, and exactly what a
row is once it's really been written.
