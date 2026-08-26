# Lesson 15: Teaching the Database What "Valid" Means

**What you will build.** `tools.db`'s own real schema gains two brand-new
rules it has never enforced before — every tool's own diameter, length,
and flute count must be a real positive number, and no two vendors can
ever share the same real name — proven by real, deliberately-forced
violations, each one caught with a real, exact SQLite error. A third rule,
`NOT NULL`, turns out to have been silently enforced since this project's
very first schema (Lesson 2) without ever once being explained — this
lesson gives it the same full, real treatment for the first time. The
transferable problem underneath the feature: this project's own C# code
has, so far, been the only thing standing between a real mistake (a
negative diameter, a duplicate vendor) and a row that shouldn't exist ever
actually landing in `tools.db`. A constraint moves that protection down
into the database itself — real, structural rules a row must satisfy no
matter which code path,今 or future, tries to write it.

**What you need to know first.** Lesson 2 — `CREATE TABLE`, column types,
`tools.db`'s own real schema. Lesson 9 — the real `tools`/`vendors` schema
this lesson modifies, and the real, already-discovered fact that
`Microsoft.Data.Sqlite` enforces foreign keys by default. Lesson 14 —
`SqliteTransaction`, `BeginTransaction()`/`Commit()`/`Rollback()`, and the
real, tested guarantee that a transaction's own statements succeed or fail
as one indivisible unit.

**Terms used in this lesson**

- **`NOT NULL` constraint** — a real, per-column rule rejecting any attempt
  to write a real `NULL` into that column, on insert or update alike. Per
  SQLite's own official documentation (fetched this session), "a NOT NULL
  constraint dictates that the associated column may not contain a NULL
  value" — real text describing a rule that has been silently present on
  every one of `tools`' own real columns since this project's own Lesson 2,
  never before explained in this project despite being real, active code
  this whole time.
- **`CHECK` constraint** — a real, per-column or per-table rule requiring a
  given real expression to hold true for every row. Per SQLite's own
  official documentation (fetched this session), "if the result is zero
  ..., then a constraint violation has occurred," while "NULL, or any
  other non-zero value" is accepted — meaning a `CHECK` constraint doesn't
  reject `NULL` itself (that's `NOT NULL`'s own separate job, above); it
  only rejects a real value that evaluates its own expression to false. It
  exists so a schema can encode a real, meaningful business rule (a
  diameter can never be zero or negative) as a structural guarantee, not
  merely a hope every future line of C# happens to check first.
- **`UNIQUE` constraint** — a real rule requiring every row's own value (or
  combination of values) in a given column to differ from every other
  row's. Per SQLite's own official documentation (fetched this session),
  "each row must contain a unique combination of values in the columns
  identified by the UNIQUE constraint" — and, a real, easy-to-miss detail
  that same documentation states plainly: "NULL values are considered
  distinct from all other values, including other NULLs," meaning a
  `UNIQUE` column can, in principle, hold more than one real `NULL` at
  once without violating anything.
- **constraint violation** — the real, general outcome whenever a real
  statement would produce a row breaking one of the rules above — SQLite
  refuses the entire statement, real and immediate, rather than silently
  writing an invalid row or silently fixing it.
- **schema migration via table recreation** — a real, necessary technique
  this lesson reuses from Lesson 9: SQLite's own `ALTER TABLE` cannot add a
  `CHECK` or `UNIQUE` constraint to a table that already exists, so gaining
  either one on an existing table requires creating a brand-new table with
  the constraint already declared, copying every real row into it, removing
  the old table, and renaming the new one into its place — the same real
  dance Lesson 9 already used to add `vendor_id`, reused here for a
  genuinely different real reason.
- **`PRAGMA foreign_keys`** — reappearing from Lesson 9's own real
  discovery that `Microsoft.Data.Sqlite` enforces foreign keys by default.
  This lesson meets a real, new consequence of that same fact: dropping a
  table another table's own foreign key still points at is itself a real
  constraint violation while enforcement is on — this lesson's own new code
  toggles this exact pragma `OFF`, performs the migration, then back `ON`,
  a real, deliberate, temporary exception to a rule Lesson 9 already
  established as this project's own default.

**Objects and methods used**

- **`Assert.Contains(string, string)`**
  - *What it is:* a real xUnit assertion, first appearing in this
    project's own test suite — confirms one real string appears somewhere
    inside another.
  - *Implementation:* per xUnit's own real, established behavior (the same
    library already used since Lesson 4's own `Assert.Equal`/this
    project's own Lesson 14 `Assert.Throws`), `Assert.Contains(expected,
    actual)` fails the test, with a real, descriptive message, if
    `actual` does not contain `expected` as a real substring.
  - *Its use:* `Assert.Contains("NOT NULL constraint failed: tools.name",
    ex.Message)` and its two siblings, this lesson's own third unit —
    checking only that each real `SqliteException`'s own message names the
    right real constraint, without demanding its entire real text match
    exactly.
  - *Type:* a `static` method on xUnit's own `Assert` class (already
    established Lesson 4).
  - *Responsibility:* fail a test, with a clear, real reason, the moment an
    expected substring is genuinely absent from the real string being
    checked.
  - *Depends on:* two real strings — the substring expected, and the real
    string to search inside.
  - *Connects to:* called here on `SqliteException.Message` (established
    Lesson 3), the real, live text SQLite itself produces for each real
    constraint violation this lesson forces.
  - *Shape:* a softer real check than `Assert.Equal` — appropriate here
    because this lesson cares that the *right rule* was violated, not that
    SQLite's own exact, full sentence never changes wording between
    versions.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`SqliteTransaction`, `BeginTransaction()`/`Commit()`**
  - *What it is:* reappearing from Lesson 14 — a real, named group of
    statements the database treats as one indivisible unit.
  - *Implementation:* established Lesson 14, unchanged.
  - *Its use:* this lesson's own real schema migration runs entirely inside
    one real transaction — the exact same real guarantee Lesson 14 already
    proved (one failure undoes everything) is what makes it safe to
    recreate two real tables in sequence without risking a half-migrated
    schema if anything partway through fails.
- **`SqliteException`**
  - *What it is:* reappearing from Lesson 3 — the real exception type
    SQLite/`Microsoft.Data.Sqlite` throws for a real database-level error.
  - *Implementation:* established Lesson 3, unchanged.
  - *Its use:* every real constraint violation this lesson forces throws
    this exact real type — the identical one Lesson 3's own injection lab
    and Lesson 14's own forced-rollback test already threw.

---

## Concept Unit: `NOT NULL` — The Constraint That Was Already There

### The Problem

`tools`' own real schema has declared `name TEXT NOT NULL` since this
project's very first `CREATE TABLE`, back in Lesson 2 — real, live code
this entire project has depended on this whole time, yet never once
explained. Nothing in this project has ever actually tried to violate it,
so its own real behavior has never been directly observed either.

> **Try this first:** given `name`'s own column definition already reads
> `TEXT NOT NULL`, and given this project's own established convention
> (Lesson 3 onward) is that every real schema rule gets proven, not just
> asserted — what real C# value, passed as a real SQL parameter bound to
> `name`, would you expect to trigger this exact constraint, and what
> general category of exception (Lesson 3's own established vocabulary)
> would you expect SQLite to raise in response?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — none; `NOT NULL` already exists in `tools.db`'s own
  real, live schema since Lesson 2. This unit's own real code lives
  entirely in this lesson's own third unit's test file.
- **Change type** — not applicable; no schema or `ToolDB` source change
  for this specific unit.
- **Location** — not applicable.
- **Dependencies** — `tools.db`'s own real, existing schema.

### The New Code

Not applicable to this unit specifically — the real proof of this
already-existing constraint is written once, together with `CHECK`'s and
`UNIQUE`'s own real proofs, in this lesson's own third unit.

### The Updated Project

Not applicable — no file changes for this unit.

### Proving It in Isolation

A minimal, unrelated throwaway table, isolating a real `NOT NULL`
violation before this lesson's own real, permanent test (third unit) does
the identical thing against `tools`:

```csharp
new SqliteCommand("CREATE TABLE widgets (id INTEGER PRIMARY KEY, label TEXT NOT NULL)", connection).ExecuteNonQuery();

using var command = new SqliteCommand("INSERT INTO widgets (id, label) VALUES (1, NULL)", connection);
try
{
    command.ExecuteNonQuery();
}
catch (SqliteException ex)
{
    Console.WriteLine($"SqliteErrorCode: {ex.SqliteErrorCode}");
    Console.WriteLine($"Message: {ex.Message}");
}
```

Run for real this session:

```
SqliteErrorCode: 19
Message: SQLite Error 19: 'NOT NULL constraint failed: widgets.label'.
```

This real, captured output proves `NOT NULL`'s own real behavior directly:
attempting to write a real `NULL` into `label` throws a real
`SqliteException`, error code `19` — SQLite's own real, general code for a
constraint violation (Terms, above), reused, this lesson's own real proof
shows, identically for `CHECK` and `UNIQUE` too.

### Discard the Throwaway Example

The `widgets` example above is discarded now — it never appears in this
project again. What's proven is `NOT NULL`'s own real, exact failure
message shape and error code — not this specific table.

### Mechanical Walkthrough

- `CREATE TABLE widgets (id INTEGER PRIMARY KEY, label TEXT NOT NULL)` —
  the same real `CREATE TABLE` shape (Lesson 2) already established,
  `NOT NULL` (Terms, above) declared directly after `label`'s own type,
  the identical real position `tools.name` already uses.
- `INSERT INTO widgets (id, label) VALUES (1, NULL)` — a real SQL literal,
  `NULL`, deliberately supplied where a real value belongs — SQLite's own
  literal keyword for "no value," distinct from an empty string (`''`),
  which would **not** violate this constraint at all.
- `catch (SqliteException ex)` — `SqliteException` (Header, above),
  reappearing — this specific real catch block exists only to inspect and
  print its own real message and error code, not to recover or continue.

### CS Lens

A `NOT NULL` constraint enforcing that a real value must always be present
is a specific instance of a **non-nullability guarantee** — a structural
promise that a given piece of data can never be genuinely absent, checked
once, structurally, rather than by every single piece of code that ever
reads it. Also recognized in: C#'s own non-nullable reference types
(`string name`, as opposed to `string?`, a real feature this project's own
`ImplicitUsings`/`Nullable` project settings, established Lesson 1, already
enable project-wide), a physical form with a field marked "required" that
a submitter cannot leave blank, and a shipping label that cannot legally
be printed without a real destination address already filled in.

### SE Lens

Why does this project rely on the database's own real `NOT NULL`
constraint at all, rather than only checking for a real, non-null `name`
in C# before ever building the `INSERT`/`UPDATE` statement — a real,
alternative approach this project could also take? The alternative not
chosen — C#-only validation — was rejected because it protects exactly one
real path into the database: whatever C# code happens to run the check.
A constraint declared on the column itself protects every real path,
including ones this project hasn't written yet (a future migration script,
a different application entirely, opened directly with `sqlite3` at a
terminal) — real, structural safety that doesn't depend on every future
caller remembering to check first. The honest cost: a constraint violation
surfaces as a real, generic `SqliteException`, farther from the original
mistake than a C#-level check with a specific, custom error message could
provide — this project's own future lessons may still want both, not
either/or.

### Run It

The throwaway `widgets` example above was run for real this session with
`dotnet run`, real output shown and quoted above; source and output are
saved in this project's own `verification/lesson-15/` folder
(`lab-not-null-isolated.cs`). `NOT NULL`'s own real behavior against
`tools` itself is proven a second time, permanently, in this lesson's own
third unit.

### Connecting Back

A rule this project has silently depended on since Lesson 2 is now real,
explained, and proven — not just present. The next unit adds two rules
that have never existed in this schema at all.

---

## Concept Unit: `CHECK` and `UNIQUE` — Adding Real Rules an Existing Table Never Had

### The Problem

Nothing in `tools.db`'s own real schema stops a real, physically
nonsensical row from being written — a tool with a zero or negative
diameter, an impossible flute count — nor does anything stop two real
`vendors` rows from sharing the identical real name, something Lesson 9's
own migration only avoided by accident (it built `vendors` from `SELECT
DISTINCT manufacturer`, a one-time guarantee, not a standing rule). Adding
either real constraint isn't as simple as it was for a new column (Lesson
9's own `ALTER TABLE ... ADD COLUMN`) — SQLite's own real `ALTER TABLE`
cannot add a `CHECK` or `UNIQUE` constraint to a table that already exists.

> **Try this first:** Lesson 9 already proved a real technique for
> changing an existing table's own shape more deeply than `ALTER TABLE`
> allows — create a new table with the desired real shape, copy every row
> into it, remove the old one, rename the new one into place — all inside
> one real transaction (Lesson 14), so a failure partway through can't
> leave the schema half-changed. Given `vendors` is referenced by
> `tools.vendor_id` via a real foreign key (Lesson 9), and given Lesson 9
> already established that `Microsoft.Data.Sqlite` enforces foreign keys by
> default, what real, predictable problem would you expect from trying to
> `DROP TABLE vendors` while that enforcement is still active?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/tools.db`, migrated (real, permanent schema
  change, applied this session). `ToolDB.Tests/ToolRepositoryTests.cs`,
  modified (its own `CreateTestDatabase` helper updated to match the new,
  real current schema).
- **Change type** — replace (both `tools` and `vendors`, recreated with
  their own new real constraints).
- **Location** — a real, one-time migration script, run once this session
  directly against `tools.db`, following this project's own established
  convention (Lesson 9) of dry-running any destructive schema change
  against a disposable copy first.
- **Dependencies** — `tools.db`'s own real, current schema (Lesson 9); a
  real, temporarily-disabled `PRAGMA foreign_keys` (Terms, above).

### The New Code

```csharp
new SqliteCommand("PRAGMA foreign_keys = OFF", connection).ExecuteNonQuery();

using (var transaction = connection.BeginTransaction())
{
    Exec(connection, transaction, @"
        CREATE TABLE vendors_new (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE
        )");
    Exec(connection, transaction, "INSERT INTO vendors_new SELECT id, name FROM vendors");
    Exec(connection, transaction, "DROP TABLE vendors");
    Exec(connection, transaction, "ALTER TABLE vendors_new RENAME TO vendors");

    Exec(connection, transaction, @"
        CREATE TABLE tools_new (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            overall_diameter REAL NOT NULL CHECK (overall_diameter > 0),
            overall_length REAL NOT NULL CHECK (overall_length > 0),
            flute_count INTEGER NOT NULL CHECK (flute_count > 0),
            vendor_id INTEGER REFERENCES vendors(id)
        )");
    Exec(connection, transaction, "INSERT INTO tools_new SELECT id, name, overall_diameter, overall_length, flute_count, vendor_id FROM tools");
    Exec(connection, transaction, "DROP TABLE tools");
    Exec(connection, transaction, "ALTER TABLE tools_new RENAME TO tools");

    transaction.Commit();
}

new SqliteCommand("PRAGMA foreign_keys = ON", connection).ExecuteNonQuery();
```

### The Updated Project

`tools.db`'s own real schema, before and after this real migration (read
directly from `sqlite_schema` — established Lesson 2 — both times):

```sql
-- Before
CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT NOT NULL, overall_diameter REAL NOT NULL, overall_length REAL NOT NULL, flute_count INTEGER NOT NULL, vendor_id INTEGER REFERENCES vendors(id))
CREATE TABLE vendors (id INTEGER PRIMARY KEY, name TEXT NOT NULL)

-- After                                                              -- ← new
CREATE TABLE "vendors" (                                              -- ← new
    id INTEGER PRIMARY KEY,                                           -- ← new
    name TEXT NOT NULL UNIQUE                                         -- ← new
)                                                                      -- ← new
CREATE TABLE "tools" (                                                -- ← new
    id INTEGER PRIMARY KEY,                                           -- ← new
    name TEXT NOT NULL,                                               -- ← new
    overall_diameter REAL NOT NULL CHECK (overall_diameter > 0),      -- ← new
    overall_length REAL NOT NULL CHECK (overall_length > 0),          -- ← new
    flute_count INTEGER NOT NULL CHECK (flute_count > 0),             -- ← new
    vendor_id INTEGER REFERENCES vendors(id)                          -- ← new
)                                                                      -- ← new
```

`tools.db`'s own real, live schema now enforces two brand-new rules that
never existed before this session — every one of `tools`' own three
numeric columns must hold a real positive value, and `vendors.name` can
never repeat. Both real tables' own existing data — this project's own
real, single tool row and its real vendor — survived the migration intact,
confirmed by re-running the exact real `JOIN` query `MainWindow.xaml.cs`
itself already uses (Lesson 9), this session, against the migrated file.

### Proving It in Isolation

Before touching the real `tools.db` at all, this exact migration script was
run twice against a disposable copy (this project's own established Lesson
9 convention). The first real attempt deliberately skipped the `PRAGMA
foreign_keys = OFF` step, to directly observe the Socratic question's own
prediction:

```
Unhandled exception. Microsoft.Data.Sqlite.SqliteException (0x80004005): SQLite Error 19: 'FOREIGN KEY constraint failed'.
```

Real, immediate confirmation: `DROP TABLE vendors` genuinely fails while
`Microsoft.Data.Sqlite`'s own default foreign-key enforcement (Lesson 9)
is active and `tools.vendor_id` still references it. A second real
attempt, toggling `PRAGMA foreign_keys = OFF` **inside** the same
transaction the migration runs in (a real, tempting-looking fix), still
failed identically — proving a second, real, and easy-to-miss fact,
confirmed directly against SQLite's own official documentation (fetched
this session): "this pragma is a no-op within a transaction; foreign key
constraint enforcement may only be enabled or disabled when there is no
pending BEGIN" — the pragma silently does nothing when set from inside an
already-open transaction, with no error at all warning that it didn't
take effect. Only toggling it **before** `BeginTransaction()` — exactly
where this unit's own real "New Code" places it — actually works, proven
by the real, successful migration output already shown above.

### Discard the Throwaway Example

Both disposable-copy dry runs above are discarded now — they existed only
to prove the real technique safe before it touched `tools.db` for real,
the identical real caution Lesson 9 already established for its own
migration.

### Mechanical Walkthrough

- `new SqliteCommand("PRAGMA foreign_keys = OFF", connection)
  .ExecuteNonQuery();` — **`PRAGMA foreign_keys`** (Terms, above), set to
  `OFF`, run *before* any transaction begins — the only real position
  this unit's own isolated proof confirms actually takes effect.
- `connection.BeginTransaction()` — `SqliteTransaction`/`BeginTransaction()`
  (established Lesson 14), reappearing — every statement inside this real
  migration succeeds together, or, had any one failed, none of them would
  have taken effect at all, the identical real guarantee Lesson 14 already
  proved for `UPDATE`/`DELETE`.
- `CREATE TABLE vendors_new (id INTEGER PRIMARY KEY, name TEXT NOT NULL
  UNIQUE)` — the real `CREATE TABLE` shape (Lesson 2), `vendors`' own
  existing `NOT NULL` (this lesson's own first unit) plus a real, new
  **`UNIQUE`** constraint (Terms, above), written directly after `name`'s
  own type, the same real position `NOT NULL` already occupies.
- `INSERT INTO vendors_new SELECT id, name FROM vendors` — a real `SELECT`
  used as an `INSERT`'s own data source, rather than literal `VALUES` —
  copies every real existing row, whatever it currently holds, without
  this migration script needing to know or restate any of it by hand.
- `DROP TABLE vendors` / `ALTER TABLE vendors_new RENAME TO vendors` — the
  identical real technique Lesson 9 already established: the old table is
  removed entirely, then the new one takes its exact real name, so every
  other real reference to `vendors` (including `tools.vendor_id`'s own
  `REFERENCES vendors(id)`) keeps working unchanged.
- The four analogous real statements for `tools` — the identical real
  technique, this time introducing three real **`CHECK`** constraints
  (Terms, above), one per numeric column, each requiring that column's own
  real value to be strictly greater than zero.
- `transaction.Commit();` — `SqliteTransaction.Commit()` (established
  Lesson 14), reappearing — makes this entire six-statement real migration
  permanent, all at once.
- `new SqliteCommand("PRAGMA foreign_keys = ON", connection)
  .ExecuteNonQuery();` — the same real pragma, restored to this project's
  own real, established default (Lesson 9) immediately after the migration
  commits.

### CS Lens

Temporarily relaxing one real safety rule (foreign-key enforcement) in
order to safely perform an operation that rule would otherwise block, then
restoring it immediately afterward, is a specific instance of a **critical
section** — a real, deliberately bounded window where an ordinary
guarantee is suspended under carefully controlled conditions, never left
open longer than the exact operation that needs it. Also recognized in: a
building's own fire-suppression system being deliberately, temporarily
disabled by a technician performing hot work, with a real, explicit
procedure for re-enabling it immediately after, and a database's own
`ALTER TABLE` internals (invisible to this project's own code) briefly
holding a table in a genuinely inconsistent intermediate state while a
migration like this one runs.

### SE Lens

Why recreate both `vendors` and `tools` inside one single real transaction,
rather than two separate ones — commit the `vendors` migration, then begin
a second, independent transaction for `tools`? The alternative not chosen
— two separate transactions — was rejected because it would reopen exactly
the real risk Lesson 14 already named: if the `tools` migration failed
partway through *after* the `vendors` migration had already committed on
its own, this project's own schema would be left in a real, genuinely
inconsistent state — `vendors` migrated, `tools` not — with no way to
undo the first half automatically. One combined transaction makes the
entire migration atomic (Lesson 14's own established term): both tables
gain their new constraints together, or neither does. The honest cost:
`PRAGMA foreign_keys` had to be turned off for the *entire* combined
migration, a real, if brief, window where foreign-key enforcement wasn't
protecting this database at all, slightly longer than it would have needed
to be for either table's own migration alone.

### Run It

Both disposable-copy dry runs were executed for real this session with
`dotnet run`, real output shown and quoted above; source and output for
both are saved in this project's own `verification/lesson-15/` folder
(`lab-pragma-noop-in-transaction.cs`, `lab-migration-and-violations.cs`).
The real migration was then applied,
for real, directly against the actual `tools.db` — a real, deliberately
destructive schema change, run only after both dry runs confirmed it safe,
and only with the user's own direct authorization for this specific real
action this session. A real `dotnet build` against `ToolDB` afterward
confirmed 0 Warnings, 0 Errors — this project's own existing `SELECT ...
JOIN` query (Lesson 9) still compiles and runs unchanged against the newly
migrated schema, since neither new constraint changes any column's own
name or type, only what values that column will now accept.

### Connecting Back

`tools.db`'s own real, live schema now actively enforces two brand-new
rules, migrated in place without losing this project's own real, existing
data. Nothing has yet actually tried to break either new rule on purpose —
the final unit proves both really work.

---

## Concept Unit: Proving Every Constraint Actually Works

### The Problem

Three real rules now exist on `tools.db`'s own schema — `NOT NULL`
(already there since Lesson 2), and this lesson's own new `CHECK` and
`UNIQUE` — but only `NOT NULL` has been directly, deliberately violated so
far (this lesson's own first unit), and only against a disposable
throwaway table, never `tools`/`vendors` themselves, and never as a real,
permanent, automated test the way Lesson 14's own transaction guarantee
already is.

> **Try this first:** Lesson 14's own `ToolRepositoryTests.cs` already
> established a real pattern for proving a database-level guarantee: a
> real, disposable temp-file database, a real deliberate mistake, and a
> real xUnit assertion checking what SQLite itself actually reports. Given
> this lesson's own three real constraints each produce a distinctly-worded
> real error message (this lesson's own first and second units already
> showed each one), what would a real, permanent xUnit test for each look
> like, reusing that exact established shape?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB.Tests/ConstraintTests.cs`, created.
- **Change type** — add (one new test file, three real `[Fact]` tests).
- **Location** — new file, sitting alongside `ToolTests.cs` and
  `ToolRepositoryTests.cs` in `ToolDB.Tests/`.
- **Dependencies** — `tools.db`'s own real, migrated schema, this lesson's
  own second unit.

### The New Code

```csharp
[Fact]
public void Insert_ViolatesCheck_WhenFluteCountIsZero()
{
    using var connection = CreateTestDatabase("test_constraint_check.db");

    using var command = new SqliteCommand(
        "INSERT INTO tools (name, vendor_id, overall_diameter, overall_length, flute_count) VALUES ('Bad Tool', 1, 0.5, 3.0, 0)",
        connection);

    var ex = Assert.Throws<SqliteException>(() => command.ExecuteNonQuery());
    Assert.Contains("CHECK constraint failed", ex.Message);
}
```

### The Updated Project

`ToolDB.Tests/ConstraintTests.cs`, in full (a brand-new file, nothing to
mark as changed):

```csharp
 1  using Microsoft.Data.Sqlite;
 2
 3  public class ConstraintTests
 4  {
 5      private static SqliteConnection CreateTestDatabase(string path)
 6      {
 7          if (File.Exists(path))
 8          {
 9              File.Delete(path);
10          }
11
12          var connection = new SqliteConnection($"Data Source={path}");
13          connection.Open();
14
15          new SqliteCommand("CREATE TABLE vendors (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE)", connection).ExecuteNonQuery();
16          new SqliteCommand("INSERT INTO vendors (name) VALUES ('Test Tooling Co.')", connection).ExecuteNonQuery();
17          new SqliteCommand(
18              "CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT NOT NULL, vendor_id INTEGER REFERENCES vendors(id), " +
19              "overall_diameter REAL NOT NULL CHECK (overall_diameter > 0), overall_length REAL NOT NULL CHECK (overall_length > 0), " +
20              "flute_count INTEGER NOT NULL CHECK (flute_count > 0))", connection).ExecuteNonQuery();
21
22          return connection;
23      }
24
25      [Fact]
26      public void Insert_ViolatesNotNull_WhenNameIsMissing()
27      {
28          using var connection = CreateTestDatabase("test_constraint_not_null.db");
29
30          using var command = new SqliteCommand(
31              "INSERT INTO tools (name, vendor_id, overall_diameter, overall_length, flute_count) VALUES (NULL, 1, 0.5, 3.0, 4)",
32              connection);
33
34          var ex = Assert.Throws<SqliteException>(() => command.ExecuteNonQuery());
35          Assert.Contains("NOT NULL constraint failed: tools.name", ex.Message);
36      }
37
38      [Fact]
39      public void Insert_ViolatesCheck_WhenFluteCountIsZero()
40      {
41          using var connection = CreateTestDatabase("test_constraint_check.db");
42
43          using var command = new SqliteCommand(
44              "INSERT INTO tools (name, vendor_id, overall_diameter, overall_length, flute_count) VALUES ('Bad Tool', 1, 0.5, 3.0, 0)",
45              connection);
46
47          var ex = Assert.Throws<SqliteException>(() => command.ExecuteNonQuery());
48          Assert.Contains("CHECK constraint failed", ex.Message);
49      }
50
51      [Fact]
52      public void Insert_ViolatesUnique_WhenVendorNameAlreadyExists()
53      {
54          using var connection = CreateTestDatabase("test_constraint_unique.db");
55
56          using var command = new SqliteCommand(
57              "INSERT INTO vendors (name) VALUES ('Test Tooling Co.')",
58              connection);
59
60          var ex = Assert.Throws<SqliteException>(() => command.ExecuteNonQuery());
61          Assert.Contains("UNIQUE constraint failed: vendors.name", ex.Message);
62      }
63  }
```

Three real, permanent, passing tests now exist — one per real constraint
this lesson introduces or finally explains — each building its own
disposable real database (via `CreateTestDatabase`, matching Lesson 14's
own established per-test-file convention), each attempting exactly one
real, deliberate violation, and each confirming, via `Assert.Contains`
(Header, above), that SQLite's own real error message names the specific
real rule that was actually broken.

### Proving It in Isolation

No throwaway example exists for this unit beyond what this lesson's own
first and second units already ran — this unit's own real code *is* the
permanent, isolated proof each constraint's own earlier real demonstration
was building toward; a further throwaway version would only repeat it.

### Discard the Throwaway Example

Not applicable, for the reason stated above — this unit's own code is
real, permanent project code from the moment it's written, not a
throwaway example to later discard.

### Mechanical Walkthrough

- `CreateTestDatabase(string path)` — the identical real method shape
  Lesson 14 already established for `ToolRepositoryTests.cs`, reappearing
  here in a new, separate file — deliberately not shared between the two
  test classes (each test file stays self-contained, the same real
  convention `ToolTests.cs` already set).
- `INSERT INTO tools (...) VALUES (NULL, 1, 0.5, 3.0, 4)` — a real,
  deliberate `NOT NULL` violation (this lesson's own first unit's subject),
  this time against `tools` itself rather than a throwaway table.
- `INSERT INTO tools (...) VALUES ('Bad Tool', 1, 0.5, 3.0, 0)` — a real,
  deliberate `CHECK` violation — `0` for `flute_count`, failing `flute_count
  > 0` exactly the way this lesson's own second unit already predicted.
- `INSERT INTO vendors (name) VALUES ('Test Tooling Co.')` — a real,
  deliberate `UNIQUE` violation — `CreateTestDatabase` already inserted
  this exact real name once (line 16); inserting it again violates
  `vendors.name`'s own new constraint.
- `Assert.Throws<SqliteException>(() => command.ExecuteNonQuery());` — the
  identical real xUnit method Lesson 14 already established, reappearing
  three times, once per real violation.
- `Assert.Contains(...)` — `Assert.Contains` (Header, above), this lesson's
  own new xUnit method — checked instead of `Assert.Equal` specifically
  because this unit's own SE Lens, below, explains why matching the whole
  real message exactly would be the wrong real choice here.

### CS Lens

Writing one real, automated test per distinct real failure mode, rather
than one broad test asserting "something goes wrong somehow," is a
specific instance of **precise fault isolation** — knowing not just that a
system can fail, but exactly which real rule failed and why, confirmed
directly rather than inferred. Also recognized in: this project's own
already-established `Assert.Throws<SqliteException>` (Lesson 14) checking
a specific real exception type rather than merely "the code threw
something," a car's own dashboard showing a distinct warning light per
real subsystem rather than one generic "check engine" light, and a medical
test targeting one specific real condition rather than a single broad
"something is wrong" result.

### SE Lens

Why check only that each real message *contains* the right real substring
(`Assert.Contains`), rather than asserting the *entire* real message
matches exactly (`Assert.Equal`), the way this project's own earlier tests
(Lesson 4, 14) checked exact real values? The alternative not chosen —
exact-match assertions — was rejected because `SqliteException.Message`'s
own full real text is owned entirely by `Microsoft.Data.Sqlite` and SQLite
itself, not this project; a future version of either could reasonably
reword the surrounding sentence without changing which real constraint was
actually violated, and an exact-match test would then fail for a reason
that has nothing to do with this project's own real schema being broken.
`Assert.Contains`'s own real, honest cost: it would also pass if SQLite's
own message happened to name the *wrong* constraint but still contained
matching text by coincidence — a real, if unlikely, gap this project
accepts in exchange for not being needlessly fragile against a dependency's
own future wording changes.

### Run It

A real `dotnet test` was run this session against the actual new file:
all three new tests passed, alongside every one of this project's own
existing tests (Lesson 4's `ToolTests`, Lesson 14's three
`ToolRepositoryTests`) — seven total, zero failures.

### Connecting Back

Every real constraint this lesson introduced or finally explained —
`NOT NULL`, `CHECK`, `UNIQUE` — is now proven, permanently and
automatically, not merely demonstrated once in a throwaway script.

---

## Connect the Pieces

One concrete trace, start to finish, through everything this lesson built:

1. `NOT NULL`, real and active on `tools.name` since Lesson 2 but never
   explained until now, was proven for real against a throwaway table —
   the identical real error shape (`SqliteErrorCode 19`, a real, exact
   message) every other constraint in this lesson also produces (Unit 1).
2. `tools.db`'s own real schema was migrated, live, inside one real
   transaction (Lesson 14's own atomicity, reused for a schema change
   instead of a data change) — `vendors.name` gained a real `UNIQUE`
   constraint, and `tools`' own three numeric columns each gained a real
   `CHECK (... > 0)` — proven safe first against two disposable dry runs,
   one of which caught a real `FOREIGN KEY constraint failed` error and
   the exact reason `PRAGMA foreign_keys` has to be toggled *before* a
   transaction begins, never inside one (Unit 2).
3. Three real, permanent xUnit tests — one per constraint — each force
   their own specific real violation and confirm, via `Assert.Contains`,
   that SQLite's own real error message names the exact rule that broke,
   joining this project's own existing test suite for good (Unit 3).

**Next lesson:** 16 — XAML Data Binding & MVVM Basics.
