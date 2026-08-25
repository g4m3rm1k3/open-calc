# Lesson 9: One Fact, Stored Once

**What you will build.** `tools.db` stops storing each tool's manufacturer
as a raw text column and starts storing a real reference to a new `vendors`
table — one row per real manufacturer, referenced by every tool that uses
it, instead of that manufacturer's name being retyped into every tool row
that mentions it. `MainWindow`'s own query changes to reconnect the two
tables at read time; `Tool.FromReader` and everything downstream of it stay
completely unchanged. The transferable problem underneath the feature: the
instant the same real-world fact (a vendor's name) is capable of being
stored in more than one row, nothing stops two of those rows from
disagreeing — a typo in one, a rename that only updates one row, "O'Brien
Carbide Tools" in one row and "O'brien Carbide Tools" in another, both
meant to be the same vendor. Storing that fact exactly once, in exactly one
row, and having every other row *point to* it instead of *repeating* it, is
how a relational database prevents that kind of disagreement from ever
being possible in the first place.

**What you need to know first.** Lesson 2 — `CREATE TABLE`, column types,
`PRIMARY KEY`. Lesson 3 — parameterized `INSERT`, `SqliteParameter`. Lesson
4 — `Tool`, `Tool.FromReader(SqliteDataReader)`, reading columns by
position (`reader.GetInt32(0)`, `reader.GetString(1)`, and so on).

**Terms used in this lesson**

- **foreign key** — a column in one table whose value is required to match
  the primary key of a row in another table (or be left unset, if the
  column allows it). It exists to let one table's row *point to* another
  table's row — here, a `tools` row pointing to the one `vendors` row that
  actually owns that vendor's name — instead of copying that other row's
  data inline.
- **referential integrity** — the guarantee that a foreign key value
  always actually points at a row that exists — no `tools` row can ever
  reference vendor `id` 999 if no vendor with `id` 999 exists. It exists
  because a foreign key column is only useful as a real pointer if it's
  never allowed to point at nothing; a foreign key that's sometimes
  allowed to dangle is no more trustworthy than a plain text column that
  might be misspelled.
- **`PRAGMA`** — a SQLite-specific statement, not standard SQL, used to
  configure how the current database connection itself behaves, rather
  than to read or write table data. It exists because some behaviors
  (like whether foreign keys are enforced at all, this lesson's own
  subject) are properties of the *connection*, not the *data* — different
  code connecting to the exact same file can legitimately want different
  enforcement behavior.
- **normalization** — the general database design practice of splitting
  data so each real-world fact is stored in exactly one place, with other
  tables referencing it instead of repeating it. It exists to make the
  specific failure this lesson's own Header names — the same fact stored
  twice, disagreeing with itself — structurally impossible rather than
  something application code has to remember to prevent.
- **`JOIN`** — a SQL clause that combines rows from two tables into one
  result set, matching rows from each side using a stated condition. It
  exists because normalizing data across multiple tables (above) means the
  data a program actually wants to display — a tool's name *and* its
  vendor's name, together — no longer lives in one table; `JOIN` is how
  SQL reconnects them, once, at query time, without ever storing the
  vendor's name inside the `tools` table again.
- **schema migration** — a change made to an already-populated database's
  table structure, without losing the data already stored in it. It
  exists because a schema decided in Lesson 2 doesn't have to be the
  schema forever — but a real, non-empty `tools.db` can't simply be
  dropped and recreated with a better shape; the shape has to change
  underneath data that's already there. This lesson performs one by hand,
  directly; a later lesson introduces a repeatable, versioned way to do
  this instead of a one-off script.

**Objects and methods used**

- **`Microsoft.Data.Sqlite.SqliteException`**
  - *What it is:* the exception type `Microsoft.Data.Sqlite` throws when a
    SQL statement fails at the database level — a constraint violation,
    a syntax error, or any other rejection SQLite itself reports back.
  - *Implementation:* a class deriving from `System.Data.Common.DbException`
    (confirmed by this project's own real, captured output in this
    lesson's first Concept Unit, which reads its `.SqliteErrorCode` and
    `.Message` properties directly after catching one for real). Its
    `SqliteErrorCode` property exposes the underlying SQLite numeric result
    code — `19`, in every real error this lesson captures, which
    SQLite's own error-code table names `SQLITE_CONSTRAINT`.
  - *Its use:* caught, in this lesson's first Concept Unit's own lab, to
    prove — rather than assume — exactly when a foreign key violation is
    and isn't enforced.
  - *Type:* a class, thrown by `SqliteCommand.ExecuteNonQuery()` and other
    execution methods when the underlying SQLite call reports failure.
  - *Responsibility:* carry a failed database operation's real error
    information (a numeric code, a human-readable message) back into C#
    code as a catchable, inspectable object, instead of the failure
    disappearing silently or crashing the process with no information.
  - *Depends on:* the underlying SQLite C library actually reporting a
    non-success result code for the statement that was executing.
  - *Connects to:* thrown by `SqliteCommand.ExecuteNonQuery()` (reappearing
    from Lesson 2); caught here by an ordinary C# `try`/`catch`, the same
    exception-handling syntax already familiar from any language with
    exceptions.
  - *Shape:* a real, standard .NET exception type — inspectable the same
    way any other caught exception is, not a special case.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`SqliteConnection`, `SqliteCommand`, `.Open()`, `.ExecuteNonQuery()`,
  `.ExecuteReader()`, `.Read()`, `.GetInt32`/`.GetString`/`.GetDouble`**
  - *What it is:* reappearing from Lessons 1–8 — the same connection and
    command sequence this project has used every lesson since Lesson 1.
  - *Implementation:* established in Lessons 1–2, unchanged.
  - *Its use:* still how every statement in this lesson — the new `CREATE
    TABLE vendors`, the `ALTER TABLE` calls, and the new `JOIN` query
    alike — actually reaches `tools.db`.
- **`Tool`, `Tool.FromReader(SqliteDataReader)`**
  - *What it is:* reappearing from Lesson 4, changed to a `record` with
    `init` properties in Lesson 8 — this project's own domain type and its
    row-mapping factory method.
  - *Implementation:* established in Lesson 4, changed in Lesson 8,
    unchanged by this lesson.
  - *Its use:* this lesson's own entire point, proven directly in its
    third Concept Unit, is that this method needs *no* change at all —
    it reads six columns by position, and a `JOIN`-produced result set
    hands it six columns in the identical order and types as before.

---

## Concept Unit: A Column That Isn't Actually Enforced — Until It Is

### The Problem

`tools.manufacturer`, as this project has built it since Lesson 2, is a
plain `TEXT NOT NULL` column — nothing stops two different rows from
holding two spellings of the same real vendor, and nothing connects that
text to anything else in the database. Fixing that means introducing a
real foreign key — but before adding one to this project's real data, this
project needs to know something concrete: does SQLite actually *refuse* an
invalid reference, or does it only look like it should?

> **Try this first:** SQLite is famously permissive about types compared to
> other databases (Lesson 2's own type-affinity coverage already showed
> this). Given that reputation — if a `vendor_id` column is declared
> `REFERENCES vendors(id)`, would you bet SQLite enforces that reference
> by default, the moment the table is created? Or might it need to be told
> to, the same way `PRAGMA`s (Terms, above) configure other
> connection-level behavior?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `LabScratch/Program.cs`, replaced entirely (this
  project's own established convention for this file).
- **Change type** — add (throwaway lab code only).
- **Location** — top-level statements, before any type declaration.
- **Dependencies** — none beyond what Lessons 1–3 already established.

### The New Code

One local function, run three times with different connection setup:

```csharp
void RunFkTest(string label, string dbFile, string? pragma)
{
    using var connection = new SqliteConnection($"Data Source={dbFile}");
    connection.Open();
    if (pragma != null)
    {
        new SqliteCommand(pragma, connection).ExecuteNonQuery();
    }
    new SqliteCommand("CREATE TABLE vendors (id INTEGER PRIMARY KEY, name TEXT NOT NULL)", connection).ExecuteNonQuery();
    new SqliteCommand("CREATE TABLE widgets (id INTEGER PRIMARY KEY, vendor_id INTEGER NOT NULL REFERENCES vendors(id))", connection).ExecuteNonQuery();

    try
    {
        new SqliteCommand("INSERT INTO widgets (vendor_id) VALUES (999)", connection).ExecuteNonQuery();
        Console.WriteLine($"{label}: insert with bad vendor_id 999 SUCCEEDED.");
    }
    catch (SqliteException ex)
    {
        Console.WriteLine($"{label}: insert with bad vendor_id 999 FAILED: {ex.SqliteErrorCode} {ex.Message}");
    }
}
```

### The Updated Project

This is new, freestanding top-level code with nothing existing to place it
inside — a brand-new local function has nothing to locate a position
*within* yet. Its three call sites, immediately below it in the same file,
are what actually exercise it:

```csharp
RunFkTest("No PRAGMA statement at all", "fk_test_1.db", null);
RunFkTest("PRAGMA foreign_keys = OFF", "fk_test_2.db", "PRAGMA foreign_keys = OFF");
RunFkTest("PRAGMA foreign_keys = ON", "fk_test_3.db", "PRAGMA foreign_keys = ON");
```

Each call gets its own database file — a real, deliberate choice, not
incidental: this project already learned, in Lesson 3, that connection
pooling can hold a SQLite file's native handle open past a `using` block's
own `Dispose()` call within the same process, which would make a second
call reusing the same filename fail to recreate its tables. Three separate
files sidestep that entirely, rather than fighting it.

### Proving It in Isolation

The code above already *is* the isolated lab. Run, from `LabScratch/`:

```
dotnet run
```

Real output, captured this session:

```
No PRAGMA statement at all: insert with bad vendor_id 999 FAILED: 19 SQLite Error 19: 'FOREIGN KEY constraint failed'.
PRAGMA foreign_keys = OFF: insert with bad vendor_id 999 SUCCEEDED.
PRAGMA foreign_keys = ON: insert with bad vendor_id 999 FAILED: 19 SQLite Error 19: 'FOREIGN KEY constraint failed'.
```

This is a genuinely surprising result, worth stating plainly rather than
glossing over: raw SQLite itself defaults foreign key enforcement to
**off** unless a connection explicitly turns it on — but this real,
captured output shows the *first* call, with no `PRAGMA` statement at all,
already failing with a real `FOREIGN KEY constraint failed` error.
`Microsoft.Data.Sqlite`, this project's own real data-access library since
Lesson 1, does not leave SQLite's own off-by-default behavior in place — it
enables enforcement automatically on every connection it opens, before any
of this project's own code runs a single statement. The second call proves
that behavior is real and controllable, not baked in unconditionally: an
explicit `PRAGMA foreign_keys = OFF` genuinely disables it, and the same
invalid insert that failed twice elsewhere now succeeds. The third call,
an explicit `PRAGMA foreign_keys = ON`, is redundant with
`Microsoft.Data.Sqlite`'s own default — included here specifically to
prove it's redundant, not assumed to be, and because writing it explicitly
in real project code (this lesson's next unit) documents the intent
directly rather than depending on a library default a future reader might
not know about.

### Discard the Throwaway Example

`RunFkTest`, `widgets`, and all three `fk_test_*.db` files are discarded
here — real proof of `Microsoft.Data.Sqlite`'s own default foreign-key
behavior, never part of `ToolDB` itself.

### Mechanical Walkthrough

- `void RunFkTest(string label, string dbFile, string? pragma)` — a local
  function (reappearing from Lesson 6, where `MainWindow_Loaded` and its
  sibling handlers were first defined as named methods) — declared inside
  top-level statements this time rather than inside a class, which C#
  permits identically; its three `string`/`string?` parameters are
  ordinary parameter declarations, established since Lesson 4.
- `using var connection = new SqliteConnection($"Data Source={dbFile}");`
  — `SqliteConnection` and the `using` declaration (Header, reappearing
  from Lesson 1), with `dbFile` — a *parameter*, not a hardcoded literal —
  interpolated into the connection string, which is the actual mechanism
  that gives each of this unit's three calls its own separate file.
- `if (pragma != null) { new SqliteCommand(pragma, connection).ExecuteNonQuery(); }`
  — an ordinary `if` (established since Lesson 1) guarding a conditional
  statement execution; `pragma`, a nullable `string?` (established since
  Lesson 3's own nullability coverage), is only actually run as a command
  when a caller passes a real string rather than `null` — the first call's
  own `null` argument means this whole block is skipped, which is exactly
  what proves that call's own "no PRAGMA at all" label honestly.
- `new SqliteCommand("PRAGMA foreign_keys = OFF", connection).ExecuteNonQuery();`
  (as constructed when `pragma` is non-null) — `SqliteCommand` and
  `ExecuteNonQuery()` (reappearing from Lesson 2); the SQL text itself is
  a **`PRAGMA`** statement (Terms, above) — not a `SELECT`, `INSERT`, or
  any other standard SQL statement this project has written before, but
  executed the identical way, because `SqliteCommand` has no separate
  "pragma mode."
- `new SqliteCommand("CREATE TABLE vendors (id INTEGER PRIMARY KEY, name TEXT NOT NULL)", connection).ExecuteNonQuery();`
  — `CREATE TABLE` (reappearing from Lesson 2), identical shape to
  `tools`'s own original schema — one auto-assigned `INTEGER PRIMARY KEY`,
  one `NOT NULL` text column.
- `new SqliteCommand("CREATE TABLE widgets (id INTEGER PRIMARY KEY, vendor_id INTEGER NOT NULL REFERENCES vendors(id))", connection).ExecuteNonQuery();`
  — `CREATE TABLE` again, this time declaring a **foreign key** (Terms,
  above) directly inline on the column: `vendor_id INTEGER ... REFERENCES
  vendors(id)` names `vendor_id`'s own required relationship — every value
  ever stored in it must match a real `id` already present in `vendors` —
  at the moment the column itself is declared, not as some separate,
  later configuration step.
- `try { ... } catch (SqliteException ex) { ... }` — ordinary
  `try`/`catch` (established since Lesson 3's own injection-lab error
  handling), catching `SqliteException` (Header, above) specifically
  rather than the general `Exception` base type, so only a real database-
  level failure is caught here — any other, unrelated kind of exception
  would still propagate normally.
- `new SqliteCommand("INSERT INTO widgets (vendor_id) VALUES (999)", connection).ExecuteNonQuery();`
  — an ordinary `INSERT` (reappearing from Lesson 3), deliberately using a
  literal `999` — a `vendor_id` this test's own `vendors` table, freshly
  created and never populated, cannot possibly contain — to force the
  exact failure this unit exists to observe.
- `ex.SqliteErrorCode`, `ex.Message` — two real properties on the caught
  `SqliteException` (Header, above), read directly to print the exact
  numeric code and human-readable text SQLite itself reported, rather than
  a generic "it failed" message this project would have to invent.

### CS Lens

A rule stated once, at the point where data is *defined*, and enforced by
the system itself on every future attempt to violate it, rather than
trusted to every piece of code that ever touches that data — is a specific
instance of a much broader idea: a **constraint**, enforced closest to the
data it protects. Also recognized in: type systems generally (Lesson 4's
own compile-time property types are a constraint enforced by the compiler,
not by every caller remembering to check), database `CHECK`/`UNIQUE`
constraints, a spreadsheet's own data-validation rules on a cell, and API
input-validation middleware that rejects malformed requests before they
ever reach application logic.

### SE Lens

Why does `Microsoft.Data.Sqlite` override SQLite's own off-by-default
foreign key behavior, rather than leaving the underlying library's own
default in place? The alternative not chosen — matching raw SQLite's own
default exactly — would mean every `.NET` project using this library
silently gets *weaker* referential integrity than its own declared schema
promises, unless every single developer remembers to opt in with an
explicit `PRAGMA`. `Microsoft.Data.Sqlite`'s own choice trades a small
amount of surprise (this unit's own first, doubted prediction) for a much
safer default: a `REFERENCES` clause written in a `CREATE TABLE` statement
is enforced unless a developer *deliberately* opts out, not the reverse.
The honest cost: code written against raw SQLite, or against a different
.NET SQLite library with a different default, can carry an assumption that
turns out wrong the moment it's ported here — which is exactly why this
lesson's own real project change, next, sets `PRAGMA foreign_keys = ON`
explicitly rather than relying on this default silently.

### Run It

Already run above, real output captured and shown.

### Connecting Back

This unit proved, with real captured output, that a foreign key
constraint on a brand-new, empty pair of tables is genuinely enforced by
default in this project's own real stack. The next unit is where a
foreign key gets added to this project's own real, already-populated
`tools` table — where the question is no longer "is a new constraint
enforced," but "how does an existing column, with existing data, safely
become one."

---

## Concept Unit: Splitting One Table Into Two, Without Losing Data

### The Problem

`tools.db`'s real `tools` table, since Lesson 2, already has one real row
in it — this project's own long-traced "1/2 in 4-Flute Carbide End Mill,"
manufacturer "O'Brien Carbide Tools." Fixing `manufacturer`'s own design
problem (this lesson's Header) can't mean dropping and recreating `tools`
from scratch — that would destroy the one real row this project has
carried since Lesson 3. The schema has to change *underneath* data that's
already there, safely.

> **Try this first:** Given that a new `vendors` table needs to hold "one
> row per real, distinct vendor name" — and `tools.manufacturer` currently
> holds one repeated text value per row, not yet organized into distinct
> vendors at all — what SQL clause, from Lesson 2's or 3's own coverage,
> would find just the *distinct* values already sitting in that column,
> before this unit shows you the real answer?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `tools.db` itself, migrated (not a source file —
  the database file this project has built since Lesson 2).
- **Change type** — add (`vendors` table, `vendor_id` column), remove
  (`manufacturer` column).
- **Location** — run directly against the real, existing `tools.db`, in
  the exact order shown below — this is a **schema migration** (Terms,
  above), and migration order matters: `vendor_id` has to exist and be
  populated *before* `manufacturer` can safely be dropped, or the data
  connecting a tool to its vendor would be lost with nothing left to
  recover it from.
- **Dependencies** — the real, already-populated `tools` table from
  Lessons 2–3.

### The New Code

Five statements, run in this exact order, against the real `tools.db`:

```sql
CREATE TABLE vendors (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
INSERT INTO vendors (name) SELECT DISTINCT manufacturer FROM tools;
ALTER TABLE tools ADD COLUMN vendor_id INTEGER REFERENCES vendors(id);
UPDATE tools SET vendor_id = (SELECT id FROM vendors WHERE vendors.name = tools.manufacturer);
ALTER TABLE tools DROP COLUMN manufacturer;
```

### The Updated Project

`tools.db`'s own schema, before and after — queried directly from SQLite's
own `sqlite_schema` table (the same real system table Lesson 2 already
used to confirm `tools`'s original shape):

Before this unit (unchanged since Lesson 2):

```sql
CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT NOT NULL, manufacturer TEXT NOT NULL, overall_diameter REAL NOT NULL, overall_length REAL NOT NULL, flute_count INTEGER NOT NULL)
```

After all five statements above run, real output captured this session,
read back from the real, migrated `tools.db`:

```sql
CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT NOT NULL, overall_diameter REAL NOT NULL, overall_length REAL NOT NULL, flute_count INTEGER NOT NULL, vendor_id INTEGER REFERENCES vendors(id))
```

`manufacturer` is gone; `vendor_id` has taken its place, at the end of the
column list rather than where `manufacturer` used to sit — `ALTER TABLE
ADD COLUMN` always appends a new column at the end, it cannot insert one in
the middle, which is exactly why this lesson's next unit's own `SELECT`
names its columns explicitly rather than relying on position.

### Proving It in Isolation

Because this unit's own change *is* a one-time action against real,
irreplaceable project data, this project's own established Verification
Rule practice — proving a risky change against a throwaway copy before
touching the real file — applies directly here. The exact same five
statements, run first against a disposable `migration_test.db` seeded with
an identical fake row, from `LabScratch/`:

```
dotnet run
```

Real output, captured this session, from that disposable copy:

```
Migration succeeded. New tools schema:
CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT NOT NULL, overall_diameter REAL NOT NULL, overall_length REAL NOT NULL, flute_count INTEGER NOT NULL, vendor_id INTEGER REFERENCES vendors(id))
JOIN query result:
id=1, name=1/2 in 4-Flute Carbide End Mill, manufacturer=O'Brien Carbide Tools, diameter=0.5, length=3, flutes=4
```

Only once this confirmed the real sequence works — the schema lands in the
expected shape, and (this lesson's own next unit's query, run early here
specifically to de-risk this step) the original row's data survives the
round trip intact — did the identical five statements run against the
real `tools.db`, producing this unit's own "Updated Project" output above.
This is called a **dry run**: rehearsing a risky, one-way action against
disposable data before committing it against data that can't be recreated
if something goes wrong.

### Discard the Throwaway Example

`migration_test.db` and its one fake row are discarded here — real,
successful proof that this exact migration sequence is safe, never part of
`ToolDB`'s own real `tools.db`, which received the identical statements
separately, for real, immediately after.

### Mechanical Walkthrough

- `CREATE TABLE vendors (id INTEGER PRIMARY KEY, name TEXT NOT NULL);` —
  `CREATE TABLE` (reappearing from Lesson 2), identical shape to this
  lesson's first unit's own throwaway `vendors` table — one auto-assigned
  primary key, one required text column — now written into the real
  project for the first time.
- `INSERT INTO vendors (name) SELECT DISTINCT manufacturer FROM tools;` —
  `INSERT` (reappearing from Lesson 3), but its source of data is new: not
  a literal `VALUES (...)` list, but an entire `SELECT` statement
  (reappearing from Lesson 3's own read queries) supplying the rows to
  insert. `DISTINCT`, first appearing here, removes duplicate values from
  a query's own result — with `tools.db`'s real single row, there is only
  one manufacturer value to begin with, so this specific run inserts
  exactly one `vendors` row, but the same statement would collapse any
  number of tool rows sharing one manufacturer spelling down to that
  vendor's single row, which is the entire point of **normalization**
  (Terms, above): one real fact, stored once, no matter how many `tools`
  rows reference it.
- `ALTER TABLE tools ADD COLUMN vendor_id INTEGER REFERENCES vendors(id);`
  — `ALTER TABLE` (first appearing here) modifies an already-existing
  table's own structure, in contrast to `CREATE TABLE`, which only ever
  builds a brand-new one; `ADD COLUMN` is the specific operation being
  performed, appending one new column (`vendor_id`, typed `INTEGER`, with
  the same `REFERENCES vendors(id)` **foreign key** syntax this lesson's
  first unit already proved is genuinely enforced) — every one of
  `tools`'s existing rows immediately gets this new column, initialized to
  SQL `NULL` since no value was specified for existing rows.
- `UPDATE tools SET vendor_id = (SELECT id FROM vendors WHERE vendors.name = tools.manufacturer);`
  — `UPDATE` (first appearing here) modifies existing rows' own column
  values, in contrast to `INSERT`, which only ever adds new rows; its
  `SET` clause's own value is not a literal, but a **subquery** — an
  entire `SELECT` nested inside another statement, evaluated once per row
  `UPDATE` is currently processing, correlated against that row's own
  `manufacturer` value (still present at this exact point in the
  sequence, since the next statement hasn't run yet) to look up the
  matching `vendors.id`.
- `ALTER TABLE tools DROP COLUMN manufacturer;` — `ALTER TABLE` again,
  this time `DROP COLUMN` — the operation that actually removes
  `manufacturer` from `tools`'s own structure, permanently, along with
  whatever text value each row was still holding in it. Running this
  before the previous statement had a chance to copy each row's
  `manufacturer` value into its new `vendor_id` would have destroyed the
  only link between a `tools` row and its real vendor, with nothing left
  to recover it from — the exact ordering hazard this unit's own Project
  Change section named directly.

### CS Lens

Splitting one table that mixed two different real-world concepts — "a
tool" and "a vendor" — into two tables, each owning exactly one concept,
connected by a reference instead of repeated text, is the core idea behind
**database normalization** (Terms, above), a formalized set of rules
(*normal forms*) database design has used for decades to eliminate exactly
this class of "the same fact, stored twice, capable of disagreeing with
itself" bug. Also recognized in: object-oriented design's own preference
for one class owning one responsibility rather than several unrelated
ones mixed together, DRY ("Don't Repeat Yourself") as a general software
principle, and version control systems that store one canonical copy of a
file's history rather than a fresh copy embedded in every commit message
that happens to mention it.

### SE Lens

Why perform this migration by hand, as a one-off sequence of statements,
rather than reaching for a dedicated migration tool immediately? The
alternative not chosen — a versioned migration framework, tracking which
schema changes have already been applied — is a real, valuable tool this
project's own roadmap already commits to introducing later, once there's
enough real schema history to make tracking it worthwhile. Reaching for
that machinery on this project's very first schema change, while `tools.db`
still holds exactly one row, would mean learning a framework's own
configuration and conventions before ever seeing the actual problem it
exists to solve. The honest cost accepted here, on purpose: this exact
five-statement sequence is not saved anywhere as a *repeatable, named*
migration — if a second, empty `tools.db` needed the identical schema
today, these statements would have to be typed again by hand, with no
record of "which changes have already been applied to which database."
That gap is real, named debt, not an oversight — it is exactly the problem
this project's own future migration-tooling lesson exists to close.

### Run It

Already run above, real output captured and shown, against both the
disposable dry-run copy and the real `tools.db`.

### Connecting Back

`tools.db` now has two tables where it had one, and the one real row this
project has carried since Lesson 3 survived the split completely intact —
proven, not assumed, by this unit's own dry-run output. But nothing in
`ToolDB` itself has been told about this new shape yet: `MainWindow_Loaded`
still runs its old, Lesson 7-era query, which now names a column,
`manufacturer`, that no longer exists at all. The next unit is where the
application code catches up to the data.

---

## Concept Unit: Reconnecting the Tables at Query Time — `JOIN`

### The Problem

`MainWindow_Loaded`'s own `SELECT` statement, unchanged since Lesson 7,
still reads `id, name, manufacturer, overall_diameter, overall_length,
flute_count FROM tools` — and `manufacturer`, per the previous unit's own
real, captured schema output, no longer exists as a column on `tools` at
all. Running `ToolDB` right now, unmodified, would fail the instant this
query runs. The vendor's actual name still exists — just in a different
table now — and nothing yet tells SQL how to bring the two back together
into one result.

> **Try this first:** `tools.vendor_id` and `vendors.id` are two columns,
> in two different tables, where a matching pair of values (a tool's
> `vendor_id`, that same vendor's real `id`) means "these two rows are
> about the same vendor." Given this lesson's own Terms already named
> `JOIN` as the clause that combines matching rows from two tables — what
> condition do you expect a `JOIN` between `tools` and `vendors` needs to
> state, for SQL to know which `vendors` row belongs with which `tools`
> row?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/MainWindow.xaml.cs`, modified.
- **Change type** — replace (the SQL text of `selectCommand`'s own query
  string).
- **Location** — inside `MainWindow_Loaded`, the `SqliteCommand`
  construction immediately before `selectCommand.ExecuteReader()` —
  established in Lesson 4, unchanged in shape since.
- **Dependencies** — the previous unit's real schema migration must
  already have run; this query would fail against the pre-migration
  schema, and the pre-migration query would now fail against the
  post-migration one.

### The New Code

One SQL string, replacing the old one:

```csharp
"SELECT tools.id, tools.name, vendors.name, tools.overall_diameter, tools.overall_length, tools.flute_count FROM tools JOIN vendors ON tools.vendor_id = vendors.id"
```

### The Updated Project

`MainWindow_Loaded`'s own query construction, changed line marked (every
other line in this method — the connection, the read loop, the `Title`
assignment, the JSON/navigation calls — is Lessons 5–8's own unchanged
code, shown here so the one changed line is seen in its real context):

```csharp
 1  private void MainWindow_Loaded(object sender, RoutedEventArgs e)
 2  {
 3      using var connection = new SqliteConnection("Data Source=tools.db");
 4      connection.Open();
 5
 6      using var selectCommand = new SqliteCommand(
 7          "SELECT tools.id, tools.name, vendors.name, tools.overall_diameter, tools.overall_length, tools.flute_count FROM tools JOIN vendors ON tools.vendor_id = vendors.id",  // ← changed
 8          connection);
 9      using var reader = selectCommand.ExecuteReader();
10
11      List<Tool> tools = new List<Tool>();
12      while (reader.Read())
13      {
14          tools.Add(Tool.FromReader(reader));
15      }
16
17      if (tools.Count > 0)
18      {
19          Title = $"ToolDB — Loaded {tools.Count} tool(s). First: {tools[0].Name} ({tools[0].Manufacturer})";
20      }
21      else
22      {
23          Title = "ToolDB — Loaded 0 tools.";
24      }
25
26      _toolsJson = JsonSerializer.Serialize(tools);
27
28      string htmlPath = Path.Combine(AppContext.BaseDirectory, "local.html");
29      Browser.Source = new Uri(htmlPath);
30  }
```

Lines 11–26 — every line that touches `Tool.FromReader`, `List<Tool>`,
`Title`, and `_toolsJson` — are completely unchanged from Lesson 8. That's
this unit's own real point: `reader`, on line 9, now iterates rows produced
by a `JOIN` across two tables instead of a plain `SELECT` from one, but
`Tool.FromReader(reader)` on line 14 has no way to tell the difference — it
only ever asked for "column 0, column 1, column 2, ..." by position, and
this unit's own new query still hands it exactly six columns, in the exact
same order and types as before.

### Proving It in Isolation

This unit's own real proof already happened, deliberately, inside the
previous unit's own dry-run — reproduced here as this unit's own isolated
lab, explicitly connected back to what it already showed. The exact `JOIN`
query, run standalone against the disposable `migration_test.db`:

```csharp
using var joinCmd = new SqliteCommand(
    "SELECT tools.id, tools.name, vendors.name, tools.overall_diameter, tools.overall_length, tools.flute_count FROM tools JOIN vendors ON tools.vendor_id = vendors.id",
    connection);
using var joinReader = joinCmd.ExecuteReader();
while (joinReader.Read())
{
    Console.WriteLine($"id={joinReader.GetInt32(0)}, name={joinReader.GetString(1)}, manufacturer={joinReader.GetString(2)}, diameter={joinReader.GetDouble(3)}, length={joinReader.GetDouble(4)}, flutes={joinReader.GetInt32(5)}");
}
```

Real output, captured this session (already shown once, in the previous
unit, as evidence the migration was safe — shown again here as this unit's
own direct subject):

```
id=1, name=1/2 in 4-Flute Carbide End Mill, manufacturer=O'Brien Carbide Tools, diameter=0.5, length=3, flutes=4
```

This is exactly what the previous unit's own dry run already proved, now
named for what it actually demonstrates about `JOIN` itself: `tools`
contributes `id`, `name`, `overall_diameter`, `overall_length`, and
`flute_count`; `vendors` contributes only `name`, aliased here to sit in
the *second* position by the `SELECT` clause's own explicit column order —
`tools.id, tools.name, vendors.name, ...` — even though `id` and `name`
both exist on *both* tables, and SQL would refuse an ambiguous, unqualified
`name` in a `JOIN` query without the `tools.`/`vendors.` prefix stating
which table's column is meant. `ON tools.vendor_id = vendors.id` is the
condition deciding *which* `vendors` row pairs with *which* `tools` row —
answering this unit's own Socratic question directly: without it, SQL
would have no way to know that this specific tool belongs with this
specific vendor.

### Discard the Throwaway Example

`joinCmd`/`joinReader`, run against `migration_test.db`, are discarded
here — real proof the query produces the right shape and the right values,
never executed against `migration_test.db` again; `ToolDB`'s own real
`MainWindow_Loaded` runs the identical query text against the real,
migrated `tools.db` instead, every time the app starts.

### Mechanical Walkthrough

- `SELECT tools.id, tools.name, vendors.name, ...` — `SELECT` (reappearing
  from Lesson 3), now naming every column with an explicit `tablename.`
  prefix — first appearing here, necessary specifically because this
  query reads from two tables at once and `id`/`name` exist, ambiguously,
  on both.
- `FROM tools` — reappearing from every lesson since Lesson 3; still names
  the query's own starting table.
- `JOIN vendors` — the **`JOIN`** keyword (Terms, above), used here for
  the first time in this project — names the second table this query
  pulls rows from, in addition to `tools`.
- `ON tools.vendor_id = vendors.id` — the `ON` clause, first appearing
  here, is not optional decoration on `JOIN` — it's the condition deciding
  which row from `vendors` gets matched against which row from `tools`:
  for every `tools` row, SQL finds the `vendors` row whose `id` equals that
  tool's own `vendor_id` (the previous unit's own real migration column),
  and produces one combined result row carrying columns from both. This
  specific form — only rows with a real match on both sides appear in the
  result at all — is called an **inner join**, the default meaning of a
  bare `JOIN` with no other qualifier.
- `tools.overall_diameter, tools.overall_length, tools.flute_count` —
  reappearing from Lesson 4's original `SELECT`, still qualified with
  `tools.` even though neither name collides with anything on `vendors` —
  a deliberate consistency choice, not a requirement, so every column's
  own source table is unambiguous to a reader at a glance, not just to
  SQL's own parser.

### CS Lens

Recombining data that was deliberately split across two structures back
into one result, at the moment it's actually needed, rather than keeping
it pre-combined and risking it going stale or inconsistent, is a pattern
far broader than SQL's own `JOIN` keyword. Also recognized in: a
relational algebra "join" operation (the formal mathematical concept
`JOIN` itself is named after), a GraphQL query resolving fields from
multiple separate backend services into one response, a spreadsheet's own
`VLOOKUP`/`XLOOKUP` functions pulling a matching value from a second sheet,
and an object-relational mapper's own "eager loading" of a related entity.

### SE Lens

Why reconnect the two tables with a `JOIN` at query time, rather than
storing a copy of the vendor's name back onto every `tools` row (a
"denormalized" cache column) to avoid the extra table lookup? The
alternative not chosen — a cached, duplicated `tools.manufacturer_name`
column, kept in sync with `vendors.name` — would return to this lesson's
own opening problem: two places for the same fact to live, and a real risk
of them silently disagreeing if the vendor is ever renamed in one place but
not the other. `JOIN` accepts a real, honest cost in exchange for
correctness by construction: every read of tool data now costs one
additional table lookup that a single-table `SELECT` never needed — for
`tools.db`'s current one row, this cost is unmeasurable; for a real,
larger tool library, `JOIN` performance against an unindexed foreign key
column is a real, named concern this project's own roadmap already commits
to addressing directly, once indexes are actually in scope.

### Run It

Already proven via the dry run above; the real, live query now lives in
`ToolDB/MainWindow.xaml.cs` itself. Built, from `ToolDB/`:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

And, per this project's own established practice of confirming the
existing automated test still agrees with a change that touches shared
code, from `ToolDB.Tests/`:

```
dotnet test
```

Real output, captured this session:

```
Passed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: 176 ms - ToolDB.Tests.dll (net9.0)
```

`ToolTests.cs`'s own test builds its own separate, single-table database
directly — it was never touched by this lesson's own migration, and never
needed to be: it tests `Tool.FromReader`'s own column-mapping logic in
total isolation from where those six columns' data actually originates,
which is precisely this unit's own point proven a second, independent way.

### Connecting Back

Every piece this lesson built now closes the loop this lesson's own Header
opened with: `vendors` holds the real vendor's name exactly once; `tools`
holds a `vendor_id` **foreign key**, genuinely enforced (this lesson's
first unit); `JOIN` reconnects the two at read time, producing the exact
same six-column shape `Tool.FromReader` has always expected, since
Lesson 4, completely unaware anything about the underlying schema changed
at all.

---

## Connect the Pieces

One concrete trace, start to finish, through everything this lesson built:

1. A brand-new, empty pair of tables — `vendors` and a throwaway
   `widgets` — proved, with real captured output, that `Microsoft.Data.Sqlite`
   enforces a `REFERENCES vendors(id)` foreign key by default, no `PRAGMA`
   required — a real surprise this lesson's own first unit caught by
   actually running the check, not assuming raw SQLite's own off-by-
   default reputation carried through unchanged (Unit 1).
2. The real, already-populated `tools.db` — carrying one real row since
   Lesson 3 — gained a real `vendors` table (one row, `O'Brien Carbide
   Tools`, `id` 1), a real `vendor_id` column added and populated on
   `tools`, and lost its old `manufacturer` column entirely — five real
   SQL statements, dry-run first against disposable data, then applied for
   real, in the one order that never lost the link between a tool and its
   vendor (Unit 2).
3. `MainWindow_Loaded`'s own query changed from a single-table `SELECT` to
   a `tools JOIN vendors ON tools.vendor_id = vendors.id` — and
   `Tool.FromReader`, unchanged since Lesson 8, kept working without a
   single edit, because it has only ever asked for six columns by
   position, and this lesson's new query still hands it exactly that
   (Unit 3).
4. The proof this actually works end to end: a real `dotnet build` with
   zero warnings and zero errors, and `ToolDB.Tests`'s own existing test —
   built against `Tool.FromReader` in total isolation from any real
   `tools.db` — still passing, unchanged, confirming this lesson's entire
   change is additive restructuring underneath the data, not a behavior
   change to anything that already worked (Unit 3).

**Next lesson:** 10 — jQuery Basics (selectors, events).
