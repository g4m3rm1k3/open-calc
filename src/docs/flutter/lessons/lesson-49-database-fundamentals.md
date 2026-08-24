# Lesson 49: Data That Has to Survive the App Closing

**Database Fundamentals**

## What you will build

Nothing in `project/` yet — no new file, no new dependency. This lesson
builds a small, real, throwaway SQLite database, entirely outside
`project/`, and runs real SQL against it to prove, for real, what a
table, a row, a column, a primary key, a foreign key, an index, a query,
and a transaction actually are and actually do — not as definitions to
memorize, but as real, observed behavior from a real database engine.
The transferable problem this whole lesson sets up: every real game this
app has ever played, since the very first `flutter run` in Lesson 26,
has lived only in memory — `GameSessionNotifier`'s own real, in-memory
`GameSession` (Lesson 38) vanishes completely the instant the app
process ends. Phase 6 exists to fix that, starting with Lesson 50's real
`project/pubspec.yaml` change; this lesson is the real vocabulary and
real, verified mechanics that change will depend on.

## What you need to know first

- Lesson 39 ("Naming and Injecting a Dependency") — `Clock`/`SystemClock`,
  the real pattern of naming an ability as an abstraction with exactly
  one real, concrete implementation, which Phase 6's own real database
  access will follow again.
- Lesson 43 ("Naming Where Data Actually Comes From") —
  `PuzzleRepository`/`InMemoryPuzzleRepository`, the real, already-working
  precedent for exactly the shape a real `ScoreRepository` or
  `GameRepository` will take once this phase gives it a real database to
  read from instead of a hardcoded constant.
- Lesson 41 ("Naming the Boundaries Already There") — the real
  Domain/Application/Infrastructure layering this project already has;
  the real database work this phase adds will live in Infrastructure,
  the same seam `SystemClock` and `InMemoryPuzzleRepository` already
  occupy.
- Lesson 24 ("A Real, Permanent Test Suite") — `isValidStartingGrid`'s
  own real point (checking data for *internal consistency*, not just
  presence) reappears here in a new form: a real database enforces some
  of its own consistency rules automatically, before a single line of
  this app's own Dart code ever runs.
- Lesson 2 ("Commanding the Machine Directly") — running a real program
  from a real terminal and reading its real output, reused here against
  a new real program, `sqlite3`, instead of a PowerShell cmdlet.

## Terms used in this lesson

- **Relational database** — a real program that stores data as a set of
  related tables, rather than as loose files or in-memory objects, and
  enforces rules about that data's own shape and consistency
  automatically, on every write, not just when this app's own Dart code
  happens to check. Exists because "a bunch of numbers and strings sitting
  in variables" stops being enough the moment data has to outlive the
  process that created it and stay internally consistent across every
  future process that reads it back.
- **SQLite** — the specific, real relational database engine every real
  command in this lesson runs against. Distinct from "SQL" (the general
  query language every relational database speaks a dialect of): SQLite
  is one real, specific implementation — a small, real, self-contained
  engine that reads and writes one plain file on disk, with no separate
  server process required, which is exactly why Lesson 50 will pick a
  Flutter-compatible wrapper around it rather than a client/server
  database that would need its own running process.
- **`sqlite3`** — the real, official, standard command-line program used
  in every real run in this lesson to create, populate, and query a real
  SQLite database file directly — no Dart, no Flutter, involved yet.
  Genuinely independent of whatever Flutter-compatible package Lesson 50
  adds to `project/pubspec.yaml`: this lesson is about universal
  relational-database concepts this project's own eventual package will
  also have to honor, not a preview of that package's own real API.
- **`.headers on` / `.mode column`** — real, `sqlite3`-CLI-specific
  configuration commands (not SQL — SQLite's own real CLI recognizes any
  line starting with `.` as a command to itself, not a statement to send
  to the database) controlling how this terminal displays real query
  results — column headers shown, columns aligned — never touching the
  real, stored data itself.
- **Table** — the real, rigid, named shape every row of one kind of data
  must conform to: a fixed set of named, typed columns, defined once, up
  front. Exists so a database can enforce "every row here has exactly a
  `title` and an `author`," automatically, rather than trusting every
  piece of code that ever writes to it to remember that convention on its
  own.
- **Column** — one real, named, typed slot in a table's own shape. Every
  real row has exactly one real value per column, of that column's own
  declared type.
- **SQL data type (`INTEGER`, `TEXT`)** — declares what real kind of
  value a column may hold. `INTEGER` — a real whole number. `TEXT` — a
  real string of characters. Exists for the same real reason Dart's own
  `int`/`String` do (Lesson 5, reappearing): so a value's own real shape
  is fixed and checked, not merely hoped for.
- **`NOT NULL`** — a real constraint (below) requiring a column to always
  hold a real, present value — never absent — on every real row, checked
  by the database itself on every write.
- **`CREATE TABLE`** — the real SQL statement that defines a new table's
  real shape: its name and its full, ordered list of columns, each with
  its own real type and constraints.
- **Row** — one real, concrete record conforming to a table's own real
  shape — the actual data, as distinct from the table's own structural
  definition. A table with zero rows still fully exists; a row cannot
  exist without a table defining its shape first.
- **`INSERT INTO ... VALUES`** — the real SQL statement that adds one or
  more new rows to an existing table, supplying one real value per
  named column.
- **`SELECT`** — the real SQL statement that reads rows back out of a
  table, without changing anything it reads.
- **`WHERE`** — a real clause narrowing which rows a `SELECT`,
  `UPDATE`, or `DELETE` actually affects, by testing a real condition
  against each row.
- **`ORDER BY`** — a real clause controlling the real order rows come
  back in from a `SELECT` — without it, a table's own real row order is
  not guaranteed at all.
- **`UPDATE ... SET ... WHERE`** — the real SQL statement that changes
  the value of one or more columns on every existing row a real `WHERE`
  clause matches.
- **`DELETE FROM ... WHERE`** — the real SQL statement that removes every
  existing row a real `WHERE` clause matches.
- **Constraint** — a general, real term for any rule a table enforces on
  its own data automatically, on every write, without this app's own
  Dart code ever having to check it — `NOT NULL`, `PRIMARY KEY`,
  `FOREIGN KEY`, and `UNIQUE` (below) are each one real, specific kind.
- **`UNIQUE` constraint** — a real rule that no two rows may share the
  same real value in a given column (or set of columns); appears by name
  inside SQLite's own real error text this lesson actually triggers,
  even before this lesson explains what causes it.
- **`PRIMARY KEY`** — a real constraint naming the column (or columns)
  that uniquely identifies each row in a table — combines `NOT NULL` and
  `UNIQUE` into one real, named purpose: "this is how one specific row
  gets referred to, unambiguously, from anywhere else," including,
  crucially, from a different table entirely.
- **`FOREIGN KEY`** — a real constraint naming that one table's column
  must hold a real value that actually exists as a `PRIMARY KEY` value in
  another (or the same) table — the real, enforced mechanism behind a
  relationship between two tables, rather than merely a naming
  convention two humans happen to agree on.
- **`PRAGMA`** — a real, SQLite-specific statement (not standard SQL —
  every relational database has its own real, non-standard escape hatch
  like this) that reads or changes a setting on the current real database
  connection itself, rather than reading or changing stored data.
- **`JOIN`** — a real clause combining rows from two tables into one real
  result, matched by a real, shared condition — almost always a foreign
  key's own real value matching a primary key's own real value in the
  other table.
- **Index** — a real, separate data structure the database maintains
  alongside a table, letting it find matching rows without checking every
  single row one by one — the real, general computer-science idea behind
  a book's own back-of-the-book index, applied to a database table.
- **`CREATE INDEX`** — the real SQL statement that builds one real index
  over a named column (or columns) of an existing table.
- **`EXPLAIN QUERY PLAN`** — a real, SQLite-specific diagnostic statement
  that reports, in real, plain text, exactly how SQLite itself intends to
  execute a given query — a real window into the engine's own actual
  decision, not this lesson's own guess about it.
- **Aggregate function (`COUNT(*)`)** — a real SQL function computing one
  single real value across many real rows at once, rather than one value
  per row the way an ordinary column read does; `COUNT(*)` specifically
  reports how many real rows a query matched. Exists so a question like
  "how many loans exist right now" can be answered by the database
  itself, in one real statement, instead of reading every real row back
  into this app's own code just to count them.
- **Transaction** — a real group of one or more statements the database
  treats as a single, indivisible unit: either every real statement in
  the group takes effect, or none of them do — never some real subset
  left half-applied.
- **`BEGIN TRANSACTION` / `COMMIT` / `ROLLBACK`** — the three real SQL
  statements controlling a transaction's own real boundaries:
  `BEGIN TRANSACTION` opens one; `COMMIT` makes every real change inside
  it permanent; `ROLLBACK` discards every real change made since the
  matching `BEGIN TRANSACTION`, as if none of it had ever run at all.
- **Atomicity** — the real, formal name for the guarantee a transaction
  provides: "all or nothing," with no real, observable state in between.
  A hard concept (Concept Unit 9's own real, run proof gives this its
  full treatment there).
- **Identifier (reappearing, Lesson 5)** — a real name given to something
  — a table, a column — so it can be referred to elsewhere; the identical
  real idea Dart variable/class names already used, now applied to SQL's
  own real names.

## Objects and methods used

None. This lesson's own real subject — `CREATE TABLE`, `INSERT`,
`SELECT`, `PRIMARY KEY`, `FOREIGN KEY`, `CREATE INDEX`,
`BEGIN TRANSACTION`/`COMMIT`/`ROLLBACK` — is entirely SQL statements and
constraints: real language keywords and clauses, not classes, interfaces,
or methods, so every one of them belongs in Terms, above, per this
schema's own category rule. The one real external program this lesson
runs, `sqlite3`, is a standalone command-line tool, not a class or
method either (the same real category `dart`/`flutter`/`adb`/`winget`
already occupied in Lessons 1, 2, and 26) — its real usage is explained
in full in Commands Needed, per Concept Unit, at the point it's first
needed.

---

## Concept Unit 1: Tables and Columns

### The Problem

`GameSessionNotifier.build()` currently gets its starting puzzle from
`InMemoryPuzzleRepository.startingPuzzle()` — a real Dart method
returning a real, hardcoded `List<List<int?>>` (Lesson 43). That real
data has a shape (nine rows, nine columns, each cell a digit or `null`)
that every piece of code reading it just has to already agree on, by
convention, because `List<List<int?>>` itself enforces nothing about
*which* list of lists is a valid Sudoku board. A real database needs a
different, stronger way to say "every row of this kind of data has
exactly this shape" — enforced by the database itself, not merely
assumed by whatever Dart code happens to read it.

> **Socratic prompt:** if you had to store a real list of books — a
> title and an author for each one — in a single Dart `List`, the way
> `InMemoryPuzzleRepository` stores a puzzle, what would stop a caller
> from accidentally adding an entry with no author, or with an author
> where the title should be? Second: `List<List<int?>>` never actually
> names its own columns — position 0 happens to mean "row," position 1
> happens to mean "column." What would change about reading that data if
> every column had a real, declared name instead of just a position?

### Project Change

- **Reference Source:** No reference counterpart — this is foundational,
  pre-project conceptual content, teaching universal, real SQL semantics
  via a real, throwaway SQLite database that never becomes part of
  `project/`. Deliberately **not** this project's own future schema
  (`players`/`game_sessions`/`scores`, curriculum's own real conceptual
  model) — that real design work is Lesson 51's own job. This lesson's
  own example is a small, generic library-lending domain (`books` that
  get `loans`), chosen specifically to avoid presupposing any of Lesson
  51's real decisions.
- **Files affected:** `verification/lesson-49/db_fundamentals.sql` —
  created (a real, throwaway SQL script, grown across every Concept Unit
  in this lesson).
- **Change type:** add.
- **Location:** the very top of a brand-new file.
- **Dependencies:** the real `sqlite3` command-line tool — already
  installed on this machine (confirmed, this session:
  `sqlite3 --version` → `3.45.3 2024-04-15 ...`); no new install needed.

### The New Code

```sql
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL
);
```

### Updated Project

Not applicable — this is the first real statement in a brand-new file,
with nothing surrounding it yet (the same real exemption a freestanding
new function gets, per this schema's own step 6).

### Isolate and Discard

This whole statement **is** the isolated lab — there is no separate,
smaller throwaway version, because `CREATE TABLE` has no smaller real
form than the real statement above. It will run for real, once, this
session, and never appear inside `project/` at all; the whole file it
lives in, `verification/lesson-49/db_fundamentals.sql`, is itself
throwaway lab code per the Concept Isolation Rule, kept only as this
lesson's own real, saved verification artifact.

This is called a **`CREATE TABLE`** statement.

### Mechanical Walkthrough

- `CREATE TABLE books` — `CREATE TABLE` (Terms, above) is the real SQL
  statement that defines a brand-new table's own real shape; `books` is
  a real **identifier** (Terms, reappearing from Lesson 5) — a name
  chosen by whoever writes this statement, exactly the same real role a
  Dart class name plays, naming the real table this whole statement is
  defining.
- `(` ... `)` — the real, required parenthesized list of every real
  **column** (Terms, above) this table will have — not optional syntax
  riding along; a `CREATE TABLE` with nothing inside these parentheses
  is a real syntax error, since a table with zero columns could never
  hold any real row at all.
- `id INTEGER PRIMARY KEY` — `id` is a real column name (an identifier,
  same as `books` above); `INTEGER` (Terms, above) is a real **SQL data
  type**, declaring that every real value in this column must be a whole
  number; `PRIMARY KEY` (Terms, above) is used here only narrowly — it
  marks `id` as the column that will uniquely identify each row, but its
  own real, run proof (what actually happens if two rows try to share a
  value, and what happens if a row omits one) is Concept Unit 4's own
  subject, immediately ahead in this same lesson.
- `title TEXT NOT NULL` — `title` is a real column name; `TEXT` (Terms,
  above) is a real SQL data type, declaring that every real value here
  must be a string of characters; `NOT NULL` (Terms, above) is a real
  constraint (Terms, above) requiring this column to genuinely hold a
  real value on every row — never absent — checked by SQLite itself on
  every real write, not by any Dart code reading the result afterward.
- `author TEXT NOT NULL` — the identical real shape as `title`, one
  column over: a real `TEXT` column, also genuinely required.
- `;` — the real statement terminator SQL uses to mark where one real
  statement ends and the next, if any, begins — the same real purpose
  Dart's own `;` already serves (Lesson 5, reappearing), applied to a
  different language's own real grammar.

### CS Lens

A **table**, in the relational sense, is real, structured schema
enforcement — the database itself refusing to accept data that doesn't
conform to a declared shape, rather than trusting every writer to get it
right.

```
Also recognized in: a spreadsheet's own column headers (every row below
them is implicitly expected to match), a CSV file's own first header row,
a Java/Kotlin `class`'s own field declarations (Lesson 11, reappearing —
every instance must have every declared field), a network protocol's own
fixed-format packet header
```

### SE Lens

The real principle is **enforced structure over trusted convention**.
The alternative not chosen: keep storing this kind of data the way
`InMemoryPuzzleRepository` already does, as a plain Dart `List`/`Map`
whose shape is never checked by anything but the humans who wrote the
code that reads it. The real tradeoff: a `CREATE TABLE` statement has to
be written and agreed on up front, before a single real row exists —
real, real, genuine friction Dart's own dynamically-shaped collections
don't impose. The real payoff, which this lesson's own later Concept
Units will each prove concretely rather than merely claim: once that
shape is declared, the database itself — not this app's own Dart code —
becomes responsible for catching a real row that would violate it,
automatically, on every single write, forever, including writes this
app's own future code hasn't been written yet to anticipate.

### Commands Needed

- **`sqlite3 lesson49.db`** — the real `sqlite3` command-line program
  (Terms, above), given one real argument: the path to a database file.
  If that file doesn't exist yet, SQLite creates it, real and empty, the
  moment the first real statement actually writes to it — there is no
  separate "create the database" step distinct from creating its first
  real table.
- **`sqlite3 lesson49.db < db_fundamentals.sql`** — the real form this
  lesson actually uses: instead of typing statements one at a time at an
  interactive prompt, this redirects (`<`, reusing the real shell
  redirection syntax already available since this machine's own
  PowerShell/Bash setup) the real contents of a `.sql` file in as this
  session's entire real input, running every statement in it, in order,
  in one real pass.
- **`.headers on`** / **`.mode column`** (Terms, above) — two real,
  `sqlite3`-CLI-specific configuration lines, placed at the very top of
  `db_fundamentals.sql`, before any real SQL statement: `.headers on`
  makes every real `SELECT` result print its own real column names on
  top; `.mode column` aligns real output into real, readable columns
  instead of the CLI's own default, cramped one-line-per-row format.
  Neither line is SQL — SQLite's own real CLI recognizes any line
  starting with a literal `.` as a command to the CLI program itself,
  never sent to the database.

### Run It

`CREATE TABLE` produces no real output on success — SQLite's own real,
confirmed behavior (verified this session: the real run below shows
nothing at all between this statement and the next). Confirming a table
was genuinely created for real is Concept Unit 2's own job, the moment a
real row exists to prove it.

### Connect

A table now exists, real and empty, with a declared, enforced shape.
Concept Unit 2 puts a real row inside it.

---

## Concept Unit 2: Rows

### The Problem

`books` exists, real and structurally defined, but holds zero real rows
— a table's own shape says nothing about what data, if any, actually
lives inside it yet. Something has to add real, concrete records that
conform to that shape.

> **Socratic prompt:** given `books`'s own real shape from Concept Unit
> 1 (`id`, `title`, `author`, with `title`/`author` both genuinely
> required), what real information would a statement adding one new book
> have to supply, at minimum? Second: what do you predict happens, for
> real, if that statement tries to add a book with no `author` at all?

### Project Change

- **Reference Source:** No reference counterpart — same real throwaway
  lab as Concept Unit 1.
- **Files affected:** `verification/lesson-49/db_fundamentals.sql` —
  modified (real lines appended after Concept Unit 1's own
  `CREATE TABLE`).
- **Change type:** add.
- **Location:** immediately after the `CREATE TABLE books (...)`
  statement Concept Unit 1 already added.
- **Dependencies:** the real `books` table Concept Unit 1 already
  created — this statement cannot run against a table that doesn't
  exist yet.

### The New Code

```sql
INSERT INTO books (id, title, author) VALUES
  (1, 'Structure and Interpretation of Computer Programs', 'Abelson & Sussman'),
  (2, 'The Pragmatic Programmer', 'Hunt & Thomas'),
  (3, 'Clean Code', 'Robert C. Martin');
```

### Updated Project

The growing real script, with this unit's own new lines marked:

```sql
 1  CREATE TABLE books (
 2    id INTEGER PRIMARY KEY,
 3    title TEXT NOT NULL,
 4    author TEXT NOT NULL
 5  );
 6
 7  INSERT INTO books (id, title, author) VALUES        -- ← new
 8    (1, 'Structure and Interpretation of Computer      -- ← new
 9     Programs', 'Abelson & Sussman'),                  -- ← new
10    (2, 'The Pragmatic Programmer', 'Hunt & Thomas'),   -- ← new
11    (3, 'Clean Code', 'Robert C. Martin');               -- ← new
```

The script now both declares `books`'s own real shape (lines 1-5) and
populates it with three real rows (lines 7-11) — a real table with real
data inside it, for the first time this lesson.

### Isolate and Discard

Same real, single throwaway file as Concept Unit 1 — nothing separate to
isolate; the statement above, run once for real this session, is its own
real lab. This is called an **`INSERT`** statement.

### Mechanical Walkthrough

- `INSERT INTO books` — `INSERT INTO ... VALUES` (Terms, above) is the
  real SQL statement adding new rows; `books` names which real,
  already-existing table receives them — the identical real identifier
  Concept Unit 1's `CREATE TABLE` already declared, reused here to name
  the same real table, not a second one.
- `(id, title, author)` — a real, explicit list naming which real
  columns this statement is supplying values for, in the order those
  values will be given below — required here because it lets the values
  list that follows stay in a real, deliberate, chosen order rather than
  having to match the table's own internal column order exactly.
- `VALUES` — the real keyword introducing one or more real rows to add,
  each one a parenthesized, comma-separated list of real values.
- `(1, 'Structure and Interpretation of Computer Programs', 'Abelson &
  Sussman')` — one real row: `1` is a real `INTEGER` literal supplied for
  the real `id` column; the two quoted pieces are real `TEXT` literals
  (SQL's own real string syntax uses single quotes, not Dart's double
  quotes — a genuinely new, real syntax detail, not the same character
  Dart already trained the reader to expect) for `title` and `author`,
  in that real order, matching the column list just given.
- `,` between rows — a real comma separating one complete row from the
  next, letting one single `INSERT INTO ... VALUES` statement add
  multiple real rows in one real pass rather than needing a separate
  statement per row.
- The second and third rows — the identical real shape repeated twice
  more, each supplying its own real `id`/`title`/`author` triple.
- `;` — the same real statement terminator Concept Unit 1 already gave
  full treatment to, closing this real, multi-row statement.

### CS Lens

A **row** is one real, concrete instance of a table's own declared
shape — the data itself, not the structure.

```
Also recognized in: one line of a spreadsheet beneath its header row,
one real object instance of a class (Lesson 11, reappearing — the class
is the shape; each object is a row), one JSON object inside an array of
otherwise-identical-shaped objects
```

### SE Lens

The real principle here is **batching real writes together**. The
alternative not chosen: three separate `INSERT INTO books (...) VALUES
(...)` statements, one per book. The real tradeoff: three separate
statements would be marginally easier to read in isolation, each fitting
on fewer lines, but cost three real round trips to the database engine
instead of one — for three rows the real difference is negligible, but
the same real shape, scaled to thousands of real rows (this project's
own future high-score table, once players have been playing for months),
is exactly the real difference between a fast, one-pass real bulk insert
and a genuinely slow one. The honest, present cost: nothing yet — this
whole database is real, throwaway lab data, discarded at the end of this
lesson.

### Commands Needed

Reusing the same real `sqlite3 lesson49.db < db_fundamentals.sql`
command Concept Unit 1 already explained in full — the script itself has
simply grown by this unit's own three new lines of SQL.

### Run It

Real, captured output (this statement itself prints nothing — SQLite's
own real, confirmed behavior for a successful `INSERT`, identical to
`CREATE TABLE`'s own silence — real proof the three rows actually landed
comes from Concept Unit 3's own `SELECT`, immediately next, reading the
same real database back):

```
(no output)
```

### Connect

Three real rows now exist inside `books`. Concept Unit 3 reads them back
out for real, for the first time, proving Concept Unit 1's own shape and
this unit's own data both actually took effect.

---

## Concept Unit 3: Reading Rows Back

### The Problem

Three real rows were just added, silently — `INSERT` itself printed
nothing at all. Nothing so far has actually confirmed, for real, that
`books` contains what this lesson claims it does.

> **Socratic prompt:** if `INSERT` genuinely produces no confirmation
> output at all, what real risk does that create for someone typing SQL
> by hand, one statement at a time? Second: given `books` has three real
> columns (`id`, `title`, `author`), what would a statement that reads
> back *every* real column, for *every* real row, need to say, if you
> had to guess its shape before being told?

### Project Change

- **Reference Source:** No reference counterpart — same real throwaway
  lab.
- **Files affected:** `verification/lesson-49/db_fundamentals.sql` —
  modified.
- **Change type:** add.
- **Location:** immediately after Concept Unit 2's own `INSERT`
  statement.
- **Dependencies:** the three real rows Concept Unit 2 already inserted.

### The New Code

```sql
SELECT * FROM books;
```

### Updated Project

```sql
 7  INSERT INTO books (id, title, author) VALUES
 8    (1, 'Structure and Interpretation of Computer
 9     Programs', 'Abelson & Sussman'),
10    (2, 'The Pragmatic Programmer', 'Hunt & Thomas'),
11    (3, 'Clean Code', 'Robert C. Martin');
12
13  SELECT * FROM books;                                 -- ← new
```

The script now inserts three real rows and immediately reads every one
of them back — the first real, complete round trip this lesson has run:
declare a shape, populate it, confirm it.

### Isolate and Discard

Same real, single throwaway file — the statement above is its own real
lab. This is called a **`SELECT`** statement.

### Mechanical Walkthrough

- `SELECT` — `SELECT` (Terms, above) is the real SQL statement that
  reads rows back out of a table without changing anything it reads —
  the real read-only counterpart to `INSERT`'s real write.
- `*` — a real, literal wildcard meaning "every real column this table
  has," in the table's own real declared order (`id`, `title`, `author`)
  — chosen here specifically because this is the first time this data
  is being confirmed at all; a real, deliberate, narrower column list is
  Concept Unit 5's own subject, once filtering specific data actually
  matters.
- `FROM books` — the real, required clause naming which real table this
  read targets — the identical real identifier every earlier statement
  in this lesson has already used to mean the same one real table.
- `;` — the same real statement terminator already given full treatment
  in Concept Unit 1.

### CS Lens

**Reading data without changing it** is the real, general idea of a
read-only query.

```
Also recognized in: an HTTP GET request (reads a resource, defined by
its own real specification to never change server state), a getter
method with no setter (Lesson 11, reappearing), a database "view,"
which is itself defined entirely by a stored SELECT
```

### SE Lens

The real principle is **separating reads from writes**. The alternative
not chosen: a single, combined statement type that both writes and
immediately returns what it wrote. The real tradeoff: SQL keeps `INSERT`
and `SELECT` as two genuinely separate real statements, which costs one
extra real round trip (as just happened here) to confirm a write, but
buys a real, simpler mental model — any statement beginning with
`SELECT` is guaranteed, by the language's own real grammar, to never
change stored data, which is exactly the real property Concept Unit 5's
own `WHERE`-filtered reads, and every later `SELECT` in this lesson,
will keep relying on without re-arguing it each time.

### Commands Needed

Reusing the same real `sqlite3 lesson49.db < db_fundamentals.sql`
command already explained in full.

### Run It

Real, captured output:

```
id  title                                              author
--  -------------------------------------------------  -----------------
1   Structure and Interpretation of Computer Programs  Abelson & Sussman
2   The Pragmatic Programmer                           Hunt & Thomas
3   Clean Code                                         Robert C. Martin
```

Real, direct proof of two things at once: `books`'s own real column
names (`id`, `title`, `author` — visible because of `.headers on`,
Concept Unit 1) match Concept Unit 1's own declared shape exactly, and
all three real rows Concept Unit 2 inserted genuinely exist, with every
real value intact.

### Connect

The full real round trip — declare, populate, confirm — now works.
Concept Unit 4 asks what actually stops two real rows from claiming the
same real identity.

---

## Concept Unit 4: Primary Keys

### The Problem

`id` was declared `PRIMARY KEY` back in Concept Unit 1, narrowly, without
proof of what that constraint actually does. Nothing yet has tested it
for real.

> **Socratic prompt:** given `PRIMARY KEY`'s own real name — "the column
> that uniquely identifies each row" — what real, concrete thing would
> you predict happens if a new `INSERT` tries to reuse an `id` value a
> real row already has? Second: every real `INSERT` so far has supplied
> an explicit `id`. What would you predict happens if one omitted it
> entirely — a genuine error, a `NULL`, or something else?

### Project Change

- **Reference Source:** No reference counterpart — same real throwaway
  lab.
- **Files affected:** `verification/lesson-49/db_fundamentals.sql` —
  modified.
- **Change type:** add.
- **Location:** immediately after Concept Unit 3's own `SELECT *`.
- **Dependencies:** `books`'s own real, existing rows (`id` values `1`,
  `2`, `3` already taken).

### The New Code

```sql
INSERT INTO books (id, title, author) VALUES (1, 'Duplicate Id Test', 'Nobody');
```

### Updated Project

```sql
13  SELECT * FROM books;
14
15  -- a duplicate primary key value — real, expected failure          -- ← new
16  INSERT INTO books (id, title, author)                              -- ← new
17    VALUES (1, 'Duplicate Id Test', 'Nobody');                       -- ← new
```

The growing script now deliberately attempts a real write it expects to
fail, immediately after the real read that just confirmed `id = 1`
already belongs to a different real row.

### Isolate and Discard

Same real, single throwaway file — no separate lab needed; this
deliberately-failing statement, run for real this session, is the whole
real proof. This is called **enforcing a `PRIMARY KEY` constraint**.

### Mechanical Walkthrough

- `INSERT INTO books (id, title, author) VALUES (1, 'Duplicate Id
  Test', 'Nobody')` — the identical real shape as Concept Unit 2's own
  `INSERT`, every clause already given full treatment there
  (`INSERT INTO`, the real column list, `VALUES`, real string/integer
  literals) — the only real difference is the chosen `id` value, `1`,
  deliberately reusing one Concept Unit 2 already inserted.
- `PRIMARY KEY` (Terms, above, full treatment here) — the real
  constraint declared back in Concept Unit 1, now actually enforced:
  SQLite checks, on every real write, that no two rows in `books` ever
  share the same real `id` value — combining `NOT NULL` (a primary key
  can never be absent) and `UNIQUE` (Terms, above — no two rows may
  share it) into one real, named purpose. This is why the statement
  above is expected to fail, not a bug in the statement itself.

### CS Lens

A **primary key** is a real, guaranteed, unique identity for a row.

```
Also recognized in: a Social Security number (deliberately built to be
unique per person), a VIN on a car, a `hashCode`/`==` pair on an
immutable value object (Lesson 13, reappearing — identity by value,
enforced), a UUID generated for a distributed system's own records
```

### SE Lens

The real principle is **the database enforcing uniqueness itself**,
rather than trusting every piece of code that ever writes to it to check
first. The alternative not chosen: no `PRIMARY KEY` at all, leaving
`id` an ordinary `INTEGER` column, uniqueness maintained only by
convention — exactly the same real risk Concept Unit 1's own Socratic
prompt raised about a plain Dart `List`. The real tradeoff: a real
`PRIMARY KEY` constraint costs nothing to declare and enforces itself
automatically forever, for the real price of a rejected write the moment
someone gets it wrong — which is exactly the real, deliberate point: a
loud, immediate, real failure at the moment of the mistake, not a silent
data-integrity bug discovered later, the same real tradeoff Lesson 42's
own `Difficulty` enum already made against a bare `String`.

### Commands Needed

Reusing the same real `sqlite3 lesson49.db < db_fundamentals.sql`
command already explained in full.

### Run It

Real, captured output:

```
Runtime error near line 28: UNIQUE constraint failed: books.id (19)
```

Real, direct proof: SQLite genuinely rejected the duplicate `id`, and
its own real error text names the specific real mechanism underneath a
`PRIMARY KEY` — `UNIQUE constraint failed` — confirming, for real, that
`PRIMARY KEY` really is built on the same real `UNIQUE` constraint named
in Terms, above, not a separate, unrelated check. `(19)` is SQLite's own
real, numeric error code for a constraint violation
(`SQLITE_CONSTRAINT`), the same real code every constraint failure in
this lesson will report.

A second, real, separate check answers this unit's own second Socratic
question — what happens when `id` is omitted entirely:

```sql
INSERT INTO books (title, author) VALUES ('Refactoring', 'Martin Fowler');
SELECT * FROM books;
```

Real, captured output:

```
id  title                                              author
--  -------------------------------------------------  -----------------
1   Structure and Interpretation of Computer Programs  Abelson & Sussman
2   The Pragmatic Programmer                           Hunt & Thomas
3   Clean Code                                         Robert C. Martin
4   Refactoring                                        Martin Fowler
```

Real, direct proof of SQLite's own real, documented, specific behavior:
an `INTEGER PRIMARY KEY` column is a real alias for the table's own
internal row identifier; omitting it from an `INSERT` does not fail at
all — SQLite genuinely assigns the next unused real integer (`4`)
automatically, visible here as the fourth real row. This real book is
then removed again (`DELETE FROM books WHERE title = 'Refactoring';` —
Concept Unit 6's own real statement, used here narrowly, ahead of its
own full treatment, purely to restore `books` to its original real
three-row state before Concept Unit 5 continues) so the rest of this
lesson's own real row counts stay exactly as already shown in Concept
Unit 3.

### Connect

`id` is now proven, for real, to be a genuine, enforced identity — never
duplicated, and automatically assigned when left unspecified. Concept
Unit 5 uses `WHERE` to ask for specific real rows by something other than
scanning every one of them by eye.

---

## Concept Unit 5: Filtering and Ordering

### The Problem

`SELECT * FROM books` (Concept Unit 3) returns every real row, every
real time — fine for three books, unworkable the moment a real table
holds thousands of real rows (this project's own future high-score
table, once real players have played for months). Something has to
narrow down which real rows actually come back, and control what real
order they come back in.

> **Socratic prompt:** given `books` already has a real `author` column,
> what real condition would you write, in plain English first, to find
> only the one real book written by "Robert C. Martin"? Second: `SELECT
> *` so far has returned rows in whatever real order SQLite happened to
> store them in — what real, explicit instruction would you need to give
> to guarantee alphabetical order by title instead, regardless of
  storage order?

### Project Change

- **Reference Source:** No reference counterpart — same real throwaway
  lab.
- **Files affected:** `verification/lesson-49/db_fundamentals.sql` —
  modified.
- **Change type:** add.
- **Location:** immediately after Concept Unit 4's own real cleanup
  (`DELETE FROM books WHERE title = 'Refactoring';`).
- **Dependencies:** `books`'s own real, current three rows.

### The New Code

Both real statements together — this unit's own two curriculum-named
ideas, `WHERE` and `ORDER BY`, are close enough in real purpose
(narrowing and arranging the same real result set) that neither is
complete evidence without the other sitting right next to it, the same
real grouping Lesson 6's own comparison operators already used:

```sql
SELECT title FROM books WHERE author = 'Robert C. Martin';
SELECT title, author FROM books ORDER BY title;
```

### Updated Project

```sql
18  DELETE FROM books WHERE title = 'Refactoring';
19
20  SELECT title FROM books                              -- ← new
21    WHERE author = 'Robert C. Martin';                  -- ← new
22  SELECT title, author FROM books ORDER BY title;        -- ← new
```

### Isolate and Discard

Same real, single throwaway file — no separate lab. This is called a
**`WHERE`-filtered** `SELECT`, alongside a **`ORDER BY`-sorted** one.

### Mechanical Walkthrough

- `SELECT title` — the real `SELECT` statement, already given full
  treatment in Concept Unit 3, this time naming one real, specific
  column instead of `*` — a real, deliberate, narrower request: only
  `title`, not every column this table has.
- `FROM books` — the same real clause already explained, naming the same
  real table every earlier statement in this lesson has used.
- `WHERE author = 'Robert C. Martin'` — `WHERE` (Terms, above, full
  treatment here) narrows which real rows this statement actually
  returns: SQLite checks the real condition `author = 'Robert C.
  Martin'` against every real row in `books`, one at a time, keeping
  only the ones where it's real and true. `=` here is SQL's own real
  equality operator, comparing two real `TEXT` values — the identical
  real *idea* as Dart's own `==` (Lesson 6, reappearing), a genuinely
  different real character and a genuinely different real language, but
  the same real comparison.
- `SELECT title, author` — the real `SELECT` statement, naming two real
  columns this time, comma-separated — a real, explicit list, the same
  real syntax `INSERT`'s own column list already used in Concept Unit 2.
- `FROM books` — the same real clause, same real table.
- `ORDER BY title` (Terms, above, full treatment here) — a real clause
  guaranteeing the real rows returned come back sorted by `title`, real
  and alphabetically by default — without it, as this unit's own
  Socratic prompt named, SQL makes genuinely no real promise about
  result order at all.

### CS Lens

**Filtering** and **sorting** are both real, general query operations.

```
Also recognized in: a spreadsheet's own "Filter" and "Sort" toolbar
buttons, `Iterable.where`/a list's own `.sort()` (Lesson 9, reappearing
— the identical real ideas, applied to in-memory Dart collections
instead of stored database rows), a search engine's own query box
```

### SE Lens

The real principle is **letting the database do the filtering, not this
app's own Dart code**. The alternative not chosen: `SELECT * FROM
books`, read every real row back into Dart, then filter and sort with
`Iterable.where`/`.sort()` (Lesson 9, reappearing) in application code.
The real tradeoff: for three real rows, genuinely no difference at all;
for this project's own future real high-score table, `WHERE`/`ORDER BY`
let the database itself discard rows this app never actually needed to
transfer across the real boundary between the database file and this
app's own running process at all — real, concrete cost avoided, not
merely moved elsewhere, and exactly the real technique Lesson 57's own
future leaderboard queries (curriculum's own real Phase 6 bullet: "Top
N," "Personal best") will depend on entirely.

### Commands Needed

Reusing the same real `sqlite3 lesson49.db < db_fundamentals.sql`
command already explained in full.

### Run It

Real, captured output, `WHERE`:

```
title
----------
Clean Code
```

Real, captured output, `ORDER BY`:

```
title                                              author
-------------------------------------------------  -----------------
Clean Code                                         Robert C. Martin
Structure and Interpretation of Computer Programs  Abelson & Sussman
The Pragmatic Programmer                           Hunt & Thomas
```

Real, direct proof of both: exactly one real row matched
`author = 'Robert C. Martin'`, and the sorted real result genuinely
starts with "Clean Code," not the real insertion order Concept Unit 2
originally used (SICP, then Pragmatic Programmer, then Clean Code).

### Connect

`books` can now be read selectively and in a real, chosen order.
Concept Unit 6 changes and removes real rows that already exist, rather
than only ever reading them.

---

## Concept Unit 6: Changing and Removing Rows

### The Problem

Every real row added so far has been permanent and exactly as first
written. Real data changes — a book's own title gets a real, corrected
subtitle; a book gets real, permanently removed from a real catalog.
Nothing so far can do either.

> **Socratic prompt:** `UPDATE`'s own real name suggests changing an
> existing row rather than adding a new one — given that, what real risk
> would an `UPDATE` with no `WHERE` clause at all carry, compared to one
> that has one? Second: is that same real risk just as real for
> `DELETE`?

### Project Change

- **Reference Source:** No reference counterpart — same real throwaway
  lab.
- **Files affected:** `verification/lesson-49/db_fundamentals.sql` —
  modified.
- **Change type:** add.
- **Location:** immediately after Concept Unit 5's own `ORDER BY`
  query.
- **Dependencies:** `books`'s own real, current three rows (ids `1`,
  `2`, `3`).

### The New Code

Both real statements together, the same real grouping Concept Unit 5
already used — `UPDATE` and `DELETE` are this unit's own paired,
curriculum-named ideas, and this unit's own Socratic prompt asks the
identical real question of both at once:

```sql
UPDATE books SET title = 'Clean Code: A Handbook of Agile Software Craftsmanship' WHERE id = 3;
DELETE FROM books WHERE id = 2;
```

### Updated Project

```sql
20  SELECT title FROM books
21    WHERE author = 'Robert C. Martin';
22  SELECT title, author FROM books ORDER BY title;
23
24  UPDATE books                                          -- ← new
25    SET title = 'Clean Code: A Handbook of Agile         -- ← new
26          Software Craftsmanship'                        -- ← new
27    WHERE id = 3;                                        -- ← new
28  SELECT * FROM books WHERE id = 3;                       -- ← new
29
30  DELETE FROM books WHERE id = 2;                          -- ← new
31  SELECT * FROM books;                                      -- ← new
```

### Isolate and Discard

Same real, single throwaway file — no separate lab. This is called an
**`UPDATE`** statement, alongside a **`DELETE`** one.

### Mechanical Walkthrough

- `UPDATE books` — `UPDATE ... SET ... WHERE` (Terms, above, full
  treatment here) is the real SQL statement that changes existing rows;
  `books` names the same real, already-familiar table.
- `SET title = '...'` — `SET` is the real keyword introducing which real
  column(s) to change and their real new value(s) — here, one real
  column, `title`, assigned a new real `TEXT` literal, the identical
  real single-quoted string syntax Concept Unit 2 already gave full
  treatment.
- `WHERE id = 3` — the same real `WHERE` clause already given full
  treatment in Concept Unit 5, this time controlling not which rows are
  *read*, but which rows are *changed* — a genuinely different real
  consequence riding on the identical real syntax; this unit's own
  Socratic prompt names exactly why: an `UPDATE` with no `WHERE` at all
  would apply to genuinely every real row in the table, real and
  irreversibly, the moment it ran.
- `DELETE FROM books` — `DELETE FROM ... WHERE` (Terms, above, full
  treatment here) is the real SQL statement that removes existing rows
  entirely — not a "mark as deleted" flag, a genuine, permanent removal
  from the table's own real storage.
- `WHERE id = 2` — the identical real `WHERE` clause, this time
  controlling which real rows are removed; the identical real risk named
  above applies here too: `DELETE FROM books;` with no `WHERE` at all
  would remove every real row this table has.

### CS Lens

**Mutating existing state in place** (`UPDATE`) versus **removing it
entirely** (`DELETE`) are both real, general data-management operations.

```
Also recognized in: a spreadsheet cell edit (UPDATE) versus deleting an
entire spreadsheet row (DELETE), a Dart object's own field reassignment
via a setter (Lesson 11, reappearing — UPDATE) versus removing an
element from a `List` (Lesson 9, reappearing — DELETE), a version
control system's own "amend" versus "revert"
```

### SE Lens

The real principle is **`WHERE` as a real safety boundary, not just a
filter**. The alternative not chosen: separate, dedicated statement
forms for "change one specific row" versus "change every row" — SQL
instead uses the exact same real `UPDATE`/`DELETE` grammar for both, with
`WHERE`'s own real presence or absence being the entire real difference.
The real tradeoff: this is genuinely economical — one real statement
shape covers both real cases — at the real, honest cost that a single
missing `WHERE` clause, a real typo away from every other statement in
this lesson, is silently syntactically valid and real, immediately and
irreversibly destructive. The real, standard professional mitigation —
running inside a real transaction first, so a mistake can be undone
before it's made permanent — is Concept Unit 9's own real subject,
directly ahead.

### Commands Needed

Reusing the same real `sqlite3 lesson49.db < db_fundamentals.sql`
command already explained in full.

### Run It

Real, captured output, after `UPDATE`:

```
id  title                                                   author
--  ------------------------------------------------------  ----------------
3   Clean Code: A Handbook of Agile Software Craftsmanship  Robert C. Martin
```

Real, captured output, after `DELETE`:

```
id  title                                                   author
--  ------------------------------------------------------  -----------------
1   Structure and Interpretation of Computer Programs       Abelson & Sussman
3   Clean Code: A Handbook of Agile Software Craftsmanship  Robert C. Martin
```

Real, direct proof of both: row `3`'s real title genuinely changed in
place, its real `id` and `author` untouched; row `2` (Pragmatic
Programmer) is genuinely, permanently gone from every subsequent real
`SELECT` in this lesson.

### Connect

`books` can now be created, read, filtered, sorted, changed, and
removed — every real operation curriculum's own "queries" bullet names.
Concept Unit 7 introduces a second real table, and a real, enforced
relationship to this one.

---

## Concept Unit 7: Foreign Keys

### The Problem

A real library doesn't just have books — it has real loans, each one
naming which real book is out and to whom. That second real kind of
data belongs in its own real table, but it has to genuinely refer back
to a real, existing row in `books` — not just a plain `INTEGER` column
that happens, by convention, to look like a book's `id`.

> **Socratic prompt:** if a `loans` table had a plain `book_id INTEGER`
> column with no real, enforced connection back to `books`, what real,
> concrete bad state could exist that nothing would ever catch — a loan
> naming a book that was deleted, or never existed at all? Second: given
> `PRIMARY KEY` (Concept Unit 4) already proved the database enforces
> uniqueness automatically, what would you predict a *foreign* key
> constraint enforces instead?

### Project Change

- **Reference Source:** No reference counterpart — same real throwaway
  lab.
- **Files affected:** `verification/lesson-49/db_fundamentals.sql` —
  modified.
- **Change type:** add.
- **Location:** immediately after Concept Unit 6's own `DELETE`.
- **Dependencies:** `books`'s own real, current two rows (ids `1`, `3`).

### The New Code

`FOREIGN KEY`'s own real effect can't be shown in one small fragment —
proving a constraint actually does something needs a real write that
would violate it, both before and after enforcement is turned on. Per
this schema's own "escalating sequence of tiny inputs" guidance, this
unit's own real lab is one connected, step-by-step sequence, each real
statement changing exactly one thing from the one before it:

```sql
CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  book_id INTEGER NOT NULL,
  borrower TEXT NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

INSERT INTO loans (book_id, borrower) VALUES (999, 'Nobody');

PRAGMA foreign_keys;
PRAGMA foreign_keys = ON;
PRAGMA foreign_keys;

INSERT INTO loans (book_id, borrower) VALUES (998, 'Nobody Else');

INSERT INTO loans (book_id, borrower) VALUES (1, 'Ada');
SELECT loans.id, books.title, loans.borrower FROM loans JOIN books ON loans.book_id = books.id;
```

### Updated Project

```sql
28  SELECT * FROM books;
29
30  CREATE TABLE loans (                                   -- ← new
31    id INTEGER PRIMARY KEY,                               -- ← new
32    book_id INTEGER NOT NULL,                              -- ← new
33    borrower TEXT NOT NULL,                                -- ← new
34    FOREIGN KEY (book_id) REFERENCES books(id)             -- ← new
35  );                                                       -- ← new
36                                                            -- ← new
37  -- foreign keys are NOT enforced yet (SQLite's own real   -- ← new
38  -- default is OFF) — this references a nonexistent book   -- ← new
39  INSERT INTO loans (book_id, borrower)                    -- ← new
40    VALUES (999, 'Nobody');                                -- ← new
41                                                            -- ← new
42  PRAGMA foreign_keys;                                      -- ← new
43  PRAGMA foreign_keys = ON;                                 -- ← new
44  PRAGMA foreign_keys;                                      -- ← new
45                                                            -- ← new
46  -- the identical shape, still a nonexistent book_id,      -- ← new
47  -- now that enforcement is genuinely on                   -- ← new
48  INSERT INTO loans (book_id, borrower)                    -- ← new
49    VALUES (998, 'Nobody Else');                            -- ← new
50                                                            -- ← new
51  -- a legitimate loan against a real, existing book        -- ← new
52  INSERT INTO loans (book_id, borrower)                    -- ← new
53    VALUES (1, 'Ada');                                      -- ← new
54  SELECT loans.id, books.title, loans.borrower              -- ← new
55    FROM loans JOIN books ON loans.book_id = books.id;      -- ← new
```

A second real table now exists, alongside `books`, with an explicit,
declared, real relationship back to it, and this unit's own real,
run sequence has already proven — not merely stated — exactly what that
relationship does and does not stop.

### Isolate and Discard

Same real, single throwaway file — no separate lab. This is called a
**`FOREIGN KEY`** constraint.

### Mechanical Walkthrough

- `CREATE TABLE loans` — the identical real statement Concept Unit 1
  already gave full treatment to, this time defining a genuinely
  different real table.
- `id INTEGER PRIMARY KEY` — the identical real shape Concept Unit 4
  already proved: `loans`'s own real, unique row identifier.
- `book_id INTEGER NOT NULL` — a real, plain `INTEGER` column, required
  on every row — on its own, structurally identical to any other real
  column, carrying no real enforcement yet about what values it may
  hold.
- `borrower TEXT NOT NULL` — the identical real shape as `books.title`,
  a real, required string.
- `FOREIGN KEY (book_id) REFERENCES books(id)` — `FOREIGN KEY` (Terms,
  above, full treatment here) is the real constraint naming, explicitly,
  that `book_id`'s own real value must actually exist as a real `id`
  value inside `books` — `REFERENCES books(id)` names exactly which real
  table and column it must match. This is the real, enforced version of
  what this unit's own Socratic prompt named as a plain, unenforced
  `INTEGER` column's own real risk.
- `INSERT INTO loans (book_id, borrower) VALUES (999, 'Nobody')` — the
  identical real `INSERT` shape already given full treatment in Concept
  Unit 2, this time deliberately naming a `book_id` (`999`) that matches
  no real row anywhere in `books` — chosen specifically to test whether
  `FOREIGN KEY`, above, actually stops it.
- `PRAGMA foreign_keys` — `PRAGMA` (Terms, above, full treatment here) is
  a real, SQLite-specific statement reading or changing a setting on the
  current real database connection itself, rather than reading or
  changing stored data; `foreign_keys` names the specific real setting
  being read here — whether `FOREIGN KEY` constraints are actually
  enforced at all.
- `PRAGMA foreign_keys = ON` — the identical real `PRAGMA` statement,
  this time assigning a new real value (`ON`) instead of only reading the
  current one — SQLite's own real, explicit way to turn foreign-key
  enforcement on for the rest of this real connection.
- `INSERT INTO loans (book_id, borrower) VALUES (998, 'Nobody Else')` —
  the identical real shape as the `999` insert above, deliberately
  differing only in which nonexistent `book_id` it names, run now that
  enforcement is genuinely on — this unit's own real, deliberate,
  controlled contrast.
- `INSERT INTO loans (book_id, borrower) VALUES (1, 'Ada')` — the
  identical real shape again, this time against `book_id = 1`, which
  genuinely does exist in `books` — a real, legitimate loan.
- `SELECT loans.id, books.title, loans.borrower FROM loans JOIN books ON
  loans.book_id = books.id` — `JOIN ... ON` (Terms, above, full
  treatment here) is the real clause combining `loans` and `books` into
  one real result, matched by the real condition `loans.book_id =
  books.id`: for each real row in `loans`, SQLite finds the real row in
  `books` whose `id` genuinely equals that loan's `book_id`, and returns
  both together — real, direct proof the `FOREIGN KEY` relationship
  connects two real tables into one coherent real answer, not just two
  separately-readable tables that happen to share a naming convention.
  `loans.id`/`books.title`/`loans.borrower` — each real column name
  prefixed with its own real table name, required here because `id`
  alone would be genuinely ambiguous between the two real tables in a
  query naming both, which is exactly why this real, explicit
  `table.column` syntax exists.

### CS Lens

A **foreign key** is a real, enforced reference from one table's own
row to another's.

```
Also recognized in: a Dart object holding a reference to another real
object (Lesson 11, reappearing — the same real "points to something
that must actually exist" idea, enforced by the database instead of by
the language's own null-safety), a filesystem symlink (a real, named
pointer that can also go stale), a citation in an academic paper
(pointing to a real, specific other real source)
```

### SE Lens

The real principle is **relational integrity enforced by the database,
not merely assumed by application code**. The alternative not chosen: a
plain `INTEGER book_id` column with no real `FOREIGN KEY` clause at all
— syntactically simpler, and, as this unit's own real, run proof (below)
is about to show, this project's own real, current database engine
doesn't even enforce it by default. The real tradeoff, honestly stated
before it's even proven: declaring a real `FOREIGN KEY` costs one extra
real clause, for a real guarantee that becomes genuinely load-bearing
the moment this project's own real, future `game_sessions`/`scores`
tables (curriculum's own real Lesson 51 design) need every real score to
genuinely belong to a real, existing session, not a stale or fabricated
one.

### Commands Needed

Reusing the same real `sqlite3 lesson49.db < db_fundamentals.sql`
command already explained in full.

### Run It

`CREATE TABLE` produces no real output — the identical real, silent
success already confirmed in Concept Unit 1. The real proof that
`FOREIGN KEY` actually enforces anything needs a real write that
violates it — which is this unit's own next, genuinely surprising real
finding, run in the same batched pass:

```sql
INSERT INTO loans (book_id, borrower) VALUES (999, 'Nobody');
SELECT * FROM loans;
```

Real, captured output:

```
id  book_id  borrower
--  -------  --------
1   999      Nobody
```

A real, genuinely surprising result: `999` is not a real `id` that
exists anywhere in `books`, and this statement **succeeded anyway** — no
error at all, despite Concept Unit 7's own `FOREIGN KEY` clause. A real,
run check of why:

```sql
PRAGMA foreign_keys;
```

Real, captured output:

```
foreign_keys
------------
0
```

Real, confirmed proof: SQLite's own real, actual default has foreign-key
enforcement genuinely **off** — `0` — a real, non-obvious, easy-to-assume
-wrong fact about this specific engine, not something Claude already
knew with confidence before running it, which is exactly why the
Verification Rule required running it rather than stating it from
memory. Turning it on, for real:

```sql
PRAGMA foreign_keys = ON;
PRAGMA foreign_keys;
```

Real, captured output:

```
foreign_keys
------------
1
```

Now the identical shape of statement, against a different nonexistent
`book_id`:

```sql
INSERT INTO loans (book_id, borrower) VALUES (998, 'Nobody Else');
```

Real, captured output:

```
Runtime error near line 62: FOREIGN KEY constraint failed (19)
```

Real, direct, contrasted proof: the identical real statement shape,
differing only in which nonexistent `book_id` it names, genuinely
succeeded before `PRAGMA foreign_keys = ON` and genuinely failed after
— real, run evidence that `FOREIGN KEY` enforcement in SQLite is a real,
explicit, per-connection choice, never assumed on by default. A final,
real, legitimate loan, against a book that actually exists, confirms
enforcement doesn't block valid real data:

```sql
INSERT INTO loans (book_id, borrower) VALUES (1, 'Ada');
SELECT loans.id, books.title, loans.borrower FROM loans JOIN books ON loans.book_id = books.id;
```

Real, captured output:

```
id  title                                              borrower
--  -------------------------------------------------  --------
2   Structure and Interpretation of Computer Programs  Ada
```

Real, direct proof the `JOIN` (Mechanical Walkthrough, above) actually
connects the two real tables into one coherent real answer: "Ada
borrowed *Structure and Interpretation of Computer Programs*" — a real
sentence this lesson could not have produced from either table read
alone.

### Connect

`loans` now genuinely, enforceably belongs to `books` — real proof that
a plain, unenforced reference and a real `FOREIGN KEY` produce
genuinely different real outcomes for the identical bad input. Concept
Unit 8 asks whether `loans.book_id = 1`, the real condition the `JOIN`
above just used, can be answered without checking every real row.

---

## Concept Unit 8: Indexes

### The Problem

`JOIN ... ON loans.book_id = books.id` (Concept Unit 7) has to find
every real row in `loans` where `book_id` matches a given real value.
With two real rows, checking each one by eye costs nothing; with
this project's own future real high-score table, holding years of real
games, checking every real row for every real query would not scale.

> **Socratic prompt:** without anything beyond `loans`'s own real table
> as it currently exists, how would SQLite have to find every row where
> `book_id = 1` — check every single real row in order, or something
> smarter? Second: a book's own back-of-the-book index lets a reader find
> a topic without reading every page — what would the real, database
> equivalent of that structure need to know about a column to work the
> same way?

### Project Change

- **Reference Source:** No reference counterpart — same real throwaway
  lab.
- **Files affected:** `verification/lesson-49/db_fundamentals.sql` —
  modified.
- **Change type:** add.
- **Location:** immediately after Concept Unit 7's own `JOIN` query.
- **Dependencies:** `loans`'s own real, current rows and its real
  `book_id` column.

### The New Code

Same real reason as Concept Unit 7's own escalating sequence: an index's
own real effect is only observable by comparing the identical real query
before and after it exists — one connected, three-statement real
sequence, not a single fragment shown in isolation:

```sql
EXPLAIN QUERY PLAN SELECT * FROM loans WHERE book_id = 1;

CREATE INDEX idx_loans_book_id ON loans(book_id);

EXPLAIN QUERY PLAN SELECT * FROM loans WHERE book_id = 1;
```

### Updated Project

```sql
50  SELECT loans.id, books.title, loans.borrower
51    FROM loans JOIN books ON loans.book_id = books.id;
52
53  EXPLAIN QUERY PLAN                                     -- ← new
54    SELECT * FROM loans WHERE book_id = 1;               -- ← new
55                                                          -- ← new
56  CREATE INDEX idx_loans_book_id ON loans(book_id);        -- ← new
57                                                          -- ← new
58  EXPLAIN QUERY PLAN                                      -- ← new
59    SELECT * FROM loans WHERE book_id = 1;                -- ← new
```

The same real query, run through `EXPLAIN QUERY PLAN` both before and
after the real index exists — the exact real moment its effect becomes
observable, not merely claimed.

### Isolate and Discard

Same real, single throwaway file — no separate lab. This is called
**`CREATE INDEX`**, examined through **`EXPLAIN QUERY PLAN`**.

### Mechanical Walkthrough

- `EXPLAIN QUERY PLAN` (Terms, above, full treatment here) — a real,
  SQLite-specific diagnostic statement, placed directly in front of any
  other real statement, that reports how SQLite itself actually intends
  to execute it, in real, plain text, instead of running it for real —
  used here, the first of two identical real times, before any index
  exists at all.
- `SELECT * FROM loans WHERE book_id = 1` — the real `SELECT`/`WHERE`
  shape already given full treatment in Concept Units 3 and 5, this time
  the real subject `EXPLAIN QUERY PLAN` is reporting on, not itself run
  for its own real rows.
- `CREATE INDEX idx_loans_book_id` — `CREATE INDEX` (Terms, above, full
  treatment here) is the real SQL statement building a real index (Terms,
  above); `idx_loans_book_id` is a real, chosen identifier naming this
  specific index — SQL requires every index to have its own real name,
  the same real requirement a table or column already has.
- `ON loans(book_id)` — names which real table and column this index
  covers: `loans`, indexed by its own real `book_id` column — the exact
  real column every `JOIN`/`WHERE` in this lesson has searched by so far.
- The second, real `EXPLAIN QUERY PLAN SELECT * FROM loans WHERE book_id
  = 1` — the identical real statement as the first, re-run only because
  the real database underneath it has changed; this real repetition is
  the entire point of the sequence, not an oversight.

### CS Lens

An **index** is a real, general computer-science idea: trading real
storage space and real write cost for real read speed, via a separate,
pre-organized structure.

```
Also recognized in: a book's own back-of-the-book index, a phone
book sorted by last name, a hash map's own real `O(1)` lookup (Lesson 23,
reappearing — the identical real tradeoff, a different real data
structure), a search engine's own inverted index
```

### SE Lens

The real principle is **paying an upfront, real cost for a repeated,
real benefit**. The alternative not chosen: no index at all, relying on
`EXPLAIN QUERY PLAN`'s own first real run (below) — a genuine, real full
table scan, every single time this real query runs. The real tradeoff,
honestly two-sided: an index makes real reads by `book_id` faster, at
the real cost of extra real storage for the index itself, and slightly
slower real writes to `loans`, since every real `INSERT`/`UPDATE`/
`DELETE` now has to keep the index itself correct too, not just the
table's own real rows. The honest, present cost: with two real rows,
this lesson's own real database is far too small for that tradeoff to
matter at all — the real point here is proving the *mechanism*, for
real, before Phase 6's own future real high-score table makes the
tradeoff genuinely matter.

### Commands Needed

Reusing the same real `sqlite3 lesson49.db < db_fundamentals.sql`
command already explained in full.

### Run It

Real, captured output, `EXPLAIN QUERY PLAN` before the index exists:

```
QUERY PLAN
`--SCAN loans
```

Real, captured output, after `CREATE INDEX`, the identical real query:

```
QUERY PLAN
`--SEARCH loans USING INDEX idx_loans_book_id (book_id=?)
```

Real, direct, contrasted proof: the exact same real `SELECT`
statement's own real execution strategy genuinely changed from `SCAN
loans` (a real, full, row-by-row scan of the whole table) to `SEARCH
loans USING INDEX idx_loans_book_id (book_id=?)` (a real, direct lookup
via the new index) — SQLite's own real, internal decision, made visible,
not asserted from prose alone.

### Connect

The same real query is now provably answered a genuinely different, real
way. Concept Unit 9 asks what happens when more than one real statement
has to succeed or fail together, as a single unit.

---

## Concept Unit 9: Transactions

### The Problem

Every real statement so far has taken effect the instant it ran. Real
work sometimes needs several real statements to succeed or fail
*together* — recording a real completed Sudoku game (curriculum's own
Lesson 54: puzzle, state, timer, difficulty, mistakes, hints, all at
once) should never leave half of that real data saved and the rest
missing because one real statement, partway through, failed.

> **Socratic prompt:** if two real `INSERT` statements ran back to back,
> and the second one genuinely failed, what real state would `loans` be
> in — would the first real insert still be there? Second: given
> `ROLLBACK`'s own real name, what real, concrete guarantee would you
> want it to provide about *every* statement since a transaction began,
> not just the one that actually failed?

### Project Change

- **Reference Source:** No reference counterpart — same real throwaway
  lab.
- **Files affected:** `verification/lesson-49/db_fundamentals.sql` —
  modified.
- **Change type:** add.
- **Location:** the very end of the script, after Concept Unit 8's own
  second `EXPLAIN QUERY PLAN`.
- **Dependencies:** `loans`'s own real, current two rows.

### The New Code

The same real escalating-sequence shape Concept Unit 7 already used —
atomicity can't be shown by one statement in isolation; it needs a real
baseline, a real failing transaction to compare against it, and a real
succeeding one to contrast with that:

```sql
SELECT COUNT(*) FROM loans;

BEGIN TRANSACTION;
INSERT INTO loans (id, book_id, borrower) VALUES (100, 1, 'Grace');
INSERT INTO loans (id, book_id, borrower) VALUES (100, 1, 'Duplicate Id, should fail');
ROLLBACK;
SELECT COUNT(*) FROM loans;

BEGIN TRANSACTION;
INSERT INTO loans (id, book_id, borrower) VALUES (100, 1, 'Grace');
INSERT INTO loans (id, book_id, borrower) VALUES (101, 1, 'Alan');
COMMIT;
SELECT COUNT(*) FROM loans;
```

### Updated Project

```sql
56  EXPLAIN QUERY PLAN
57    SELECT * FROM loans WHERE book_id = 1;
58
59  SELECT COUNT(*) FROM loans;                            -- ← new
60
61  BEGIN TRANSACTION;                                      -- ← new
62  INSERT INTO loans (id, book_id, borrower)               -- ← new
63    VALUES (100, 1, 'Grace');                             -- ← new
64  INSERT INTO loans (id, book_id, borrower)               -- ← new
65    VALUES (100, 1, 'Duplicate Id, should fail');         -- ← new
66  ROLLBACK;                                                -- ← new
67  SELECT COUNT(*) FROM loans;                             -- ← new
68                                                            -- ← new
69  BEGIN TRANSACTION;                                        -- ← new
70  INSERT INTO loans (id, book_id, borrower)                 -- ← new
71    VALUES (100, 1, 'Grace');                                -- ← new
72  INSERT INTO loans (id, book_id, borrower)                  -- ← new
73    VALUES (101, 1, 'Alan');                                  -- ← new
74  COMMIT;                                                     -- ← new
75  SELECT COUNT(*) FROM loans;                                 -- ← new
```

### Isolate and Discard

Same real, single throwaway file — no separate lab. This is called a
**transaction**, opened and closed by real `BEGIN TRANSACTION`/
`ROLLBACK` statements.

### Mechanical Walkthrough

- `SELECT COUNT(*) FROM loans` — the real `SELECT` statement, already
  given full treatment in Concept Unit 3, this time with `COUNT(*)`
  (Terms, above, full treatment here) — a real aggregate function —
  instead of a column list, reporting one real number: how many rows
  `loans` genuinely has right now. Run here specifically to give this
  unit a real, known baseline to compare against once the transaction
  below finishes.
- `BEGIN TRANSACTION` — `BEGIN TRANSACTION`/`COMMIT`/`ROLLBACK` (Terms,
  above, full treatment here) opens a real transaction (Terms, above):
  from this real statement until a matching `COMMIT` or `ROLLBACK`,
  every real change is held provisionally, not yet permanent.
- `INSERT INTO loans (id, book_id, borrower) VALUES (100, 1, 'Grace')` —
  the identical real `INSERT` shape already given full treatment in
  Concept Unit 2, run here inside the open real transaction.
- `INSERT INTO loans (id, book_id, borrower) VALUES (100, 1, 'Duplicate
  Id, should fail')` — the identical real shape again, deliberately
  reusing `id = 100` a second time — expected, per Concept Unit 4's own
  already-proven `PRIMARY KEY` enforcement, to fail.
- `ROLLBACK` — discards every real change made since the matching
  `BEGIN TRANSACTION` — this unit's own central real question is exactly
  *how much* gets discarded: only the real statement that failed, or
  everything since `BEGIN TRANSACTION`, including the real insert that
  actually succeeded.
- The second, real `SELECT COUNT(*) FROM loans` — the identical real
  statement as the baseline above, re-run to check whether the count
  actually changed.
- The second real `BEGIN TRANSACTION` — the identical real statement,
  opening a genuinely new, separate real transaction.
- `INSERT INTO loans (id, book_id, borrower) VALUES (100, 1, 'Grace')` /
  `VALUES (101, 1, 'Alan')` — the identical real `INSERT` shape, this
  time two rows that are both genuinely valid together — `id = 100` is
  real and safe to reuse here specifically because the earlier
  transaction's own real `100` was fully discarded, never actually
  persisted.
- `COMMIT` (Terms, above, full treatment here) — the real counterpart to
  `ROLLBACK`: makes every real change made since the matching `BEGIN
  TRANSACTION` permanent, together, at once — the real "all" half of
  atomicity's own "all or nothing," proven directly against `ROLLBACK`'s
  own real "nothing" half just shown above.
- The third, real `SELECT COUNT(*) FROM loans` — the identical real
  statement once more, checked a final time after a real, successful
  `COMMIT`.

### CS Lens

**Atomicity** (Terms, above) is a hard concept — one of database
theory's own real, named transaction guarantees, alongside three others
(consistency, isolation, durability) genuinely outside this lesson's own
scope; this lesson gives only atomicity itself real, run treatment.

```
Also recognized in: a bank transfer (debiting one account and crediting
another must both happen or neither should), a file system's own atomic
rename operation, a `git commit` (every staged real change becomes one
real commit, or the commit genuinely doesn't happen at all), a chess
move that's illegal partway through being made — either the whole move
completes legally or the board reverts
```

### SE Lens

The real principle is **all-or-nothing as a real, structural guarantee**,
not a convention this app's own Dart code has to remember to uphold by
carefully ordering its own real writes and manually undoing partial
failures itself. The alternative not chosen: run every real statement
outside an explicit transaction, each one its own separate real unit —
SQLite's own real, default behavior for any statement not wrapped in an
explicit `BEGIN`/`COMMIT`. The real tradeoff, about to be proven twice
over by this unit's own real, run evidence below: without an explicit
transaction wrapping multiple related real statements, a failure
partway through a real, multi-step operation (Lesson 54's own future
save-a-completed-game write, several real columns at once) could
genuinely leave real, inconsistent data behind — exactly the real
failure mode this whole mechanism exists to make structurally
impossible, not just unlikely.

### Commands Needed

Reusing the same real `sqlite3 lesson49.db < db_fundamentals.sql`
command already explained in full.

### Run It

Real, captured output, baseline count before the transaction:

```
COUNT(*)
--------
2
```

Real, captured output, the failing insert inside the transaction:

```
Runtime error near line 78: UNIQUE constraint failed: loans.id (19)
```

The identical real error Concept Unit 4 already explained in full,
reappearing here against `loans.id` instead of `books.id` — the real
`PRIMARY KEY` enforcement holds identically on this second real table.

Real, captured output, `COUNT(*)` after `ROLLBACK`:

```
COUNT(*)
--------
2
```

A real, genuinely important result: still `2` — **unchanged** from the
baseline. This is real, direct proof of this unit's own central claim:
`ROLLBACK` discarded not just the failed second insert, but the first,
successful `Grace` insert too — real, hidden behavior (a successful
statement being undone by a later, unrelated failure) that this schema's
own standard specifically requires proof for, not a confident sentence
alone, which is exactly why this was run for real rather than stated
from prediction.

The second, real, contrasting transaction shown above — the successful
case — produces this real, captured output:

```
COUNT(*)
--------
4
```

Real, direct, contrasted proof: two real inserts, both genuinely valid
this time (`id = 100` reused safely, since the first `100` was fully
rolled back and never actually persisted; `id = 101` new), both actually
committed — `COUNT(*)` genuinely rose from `2` to `4`, both real rows
present. A final, real check confirms exactly which rows exist:

```sql
SELECT * FROM loans;
```

Real, captured output:

```
id   book_id  borrower
---  -------  --------
1    999      Nobody
2    1        Ada
100  1        Grace
101  1        Alan
```

### Connect

A multi-statement real operation now provably either fully happens or
fully doesn't — no real, partial, inconsistent state possible in
between, proven twice over: once by failure (`ROLLBACK`, discarding
even the statement that had already succeeded) and once by success
(`COMMIT`, making both real statements permanent together).

---

## Connect the Pieces

One real, throwaway SQLite database, built and queried entirely by hand
this session, now stands as real, run, verified proof of every real
concept curriculum's own Lesson 49 bullets name. `CREATE TABLE books
(id INTEGER PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL);`
declared a real, enforced shape (Concept Unit 1); three real `INSERT`
statements populated it, and a real `SELECT *` confirmed them (Concept
Units 2-3). A deliberately duplicated `id` proved `PRIMARY KEY`'s own
real uniqueness enforcement, and an omitted one proved its own real
auto-assignment (Concept Unit 4). `WHERE`/`ORDER BY` narrowed and sorted
real results; `UPDATE`/`DELETE` changed and removed real rows, both
riding the identical real `WHERE` clause that makes either one either
precise or catastrophic depending on whether it's present (Concept Units
5-6). A second real table, `loans`, declared a real `FOREIGN KEY` back
to `books` — genuinely unenforced by SQLite's own real default, proven
by a real, silently-accepted bad reference, then genuinely enforced the
instant `PRAGMA foreign_keys = ON` actually ran, proven by the identical
bad shape of statement now failing loudly (Concept Unit 7). The same
real `WHERE book_id = 1` query's own real execution plan provably
changed from a real, full `SCAN loans` to a real, targeted `SEARCH ...
USING INDEX` the instant a real `CREATE INDEX` existed (Concept Unit 8).
And a real, multi-statement transaction proved atomicity twice over — a
real failure discarding even the statement that had already succeeded,
and a real success making two real statements permanent together
(Concept Unit 9). Every real fact this lesson leaned on came from
actually running `sqlite3` against a real file, this session — never
from confident prose alone. None of `books`, `loans`, or
`db_fundamentals.sql` will ever appear inside `project/`; the real
vocabulary and real, verified mechanics they leave behind are what
Lesson 50 needs the moment it wires a real, Flutter-compatible database
package into this project for the first time.
