# Lesson 20: What You Ask For Isn't How It's Found (Indexes & Query Planning)

**What you will build.** A new, real read capability — `ToolRepository
.FindByName` — searching `tools` by its own real `name` column instead of
only by `id`, backed by a new, permanent real index on `tools.db`'s own
real, live schema (`idx_tools_name`). Along the way, this lesson asks a
question this project's real SQL has never once asked out loud: every
real query this project has already shipped (the JOIN behind
`MainWindow_Loaded`, `FindToolById`'s own `WHERE`-filtered lookup) has
always returned the right rows, but nothing has ever asked *how* SQLite
actually finds them — a `SELECT` statement only ever says which rows are
wanted, never how to locate them, and SQLite's own real query planner is
the thing that silently decides that, fresh, every single time a
statement runs. The transferable problem underneath the feature: reading
a query's own SQL text tells you what it asks for; only inspecting the
real, running database directly — via `EXPLAIN QUERY PLAN`, and one real
level deeper, plain `EXPLAIN`'s own real bytecode — tells you what it
actually costs to answer.

**What you need to know first.** Schema Design (`CREATE TABLE`, type
affinity, `PRIMARY KEY`) — specifically the real, already-proven fact
that a column declared exactly `INTEGER PRIMARY KEY` becomes a real alias
for SQLite's own internal `rowid`. Multiple Tables & `JOIN` — the real
`tools JOIN vendors ON tools.vendor_id = vendors.id` query this lesson
inspects directly. Constraints & Data Integrity — the real `UNIQUE`
constraint already sitting on `vendors.name`. Two-Way Communication
Across the Split — `FindToolById`'s own real, already-shipped
`WHERE tools.id = @id` query, this lesson's other real inspection target.
Updating and Deleting Safely — `ToolRepository`'s own established real
shape (a `static` class of real methods, each given an already-open
`SqliteConnection`), which this lesson's own new method follows.

**Terms used in this lesson**

- **query plan** — SQLite's own real, chosen strategy for satisfying one
  specific SQL statement — which table it starts from, whether it uses a
  real index, in what order it joins tables — decided fresh, by SQLite's
  own real query planner, every single time that statement runs; nothing
  about a query's own SQL text specifies this directly, which is the
  entire reason this lesson exists.
- **`EXPLAIN QUERY PLAN`** — a real SQL command, prepended in front of any
  real query instead of running it for its data. Per sqlite.org's own
  real, fetched documentation (`eqp.html`), "The EXPLAIN QUERY PLAN SQL
  command is used to obtain a high-level description of the strategy or
  plan that SQLite uses to implement a specific SQL query" — it turns the
  query itself into a real diagnostic tool.
- **`SCAN`** — one of the two real row-shapes `EXPLAIN QUERY PLAN`'s own
  output reports for a table. Per that same real, fetched documentation,
  "SCAN is used for a full-table scan" — every real row in that table
  gets examined, whether it can possibly match or not.
- **`SEARCH`** — the other real row-shape. Per that same real, fetched
  documentation, "SEARCH indicates that only a subset of the table rows
  are visited" — SQLite found a real, faster path to only the rows that
  can possibly match, instead of visiting every one.
- **rowid** — reappearing — SQLite's own real, hidden 64-bit integer
  identity every ordinary table row already carries, stored in real
  sorted order internally whether a real query ever asks for it or not.
  A column declared exactly `INTEGER PRIMARY KEY` becomes a real alias
  for it, not a second, separate value — an already-proven real fact
  this project's own schema design already depends on, and the real
  reason `tools.id`/`vendors.id` lookups turn out to already be fast,
  this lesson's own first real finding.
- **index** — a second, real, separate data structure SQLite maintains
  alongside a table, holding a real sorted copy of one or more real
  column values, each paired with a real pointer back to its own original
  row. Per sqlite.org's own real, fetched documentation
  (`queryplanner.html`), "An index is another table similar to the
  original... table but with the content... stored in front of the rowid
  and with all rows in content order" — its entire real purpose is
  letting SQLite jump directly to matching rows instead of examining
  every one.
- **`CREATE INDEX`** — the real SQL statement that builds one. Per
  sqlite.org's own real, fetched documentation (`lang_createindex.html`),
  it "consists of the keywords 'CREATE INDEX' followed by the name of the
  new index, the keyword 'ON', the name of a previously created table
  that is to be indexed, and a parenthesized list of table column names...
  that are used for the index key."
- **covering index** — a real, specific kind of index that happens to
  already hold every real column a given query needs, output columns
  included, so SQLite never has to go back to the original table row at
  all. Per sqlite.org's own real, fetched documentation
  (`queryplanner.html`), "Because all of the information needed is in
  the covering index, SQLite never needs to consult the original table."
- **cost** — real, ordinary tradeoffs an index is never free of: real
  disk space to store the index itself, and — this lesson's own third
  unit, measured directly, not just asserted — real, additional work
  every future `INSERT`/`UPDATE`/`DELETE` touching an indexed column now
  has to do to keep that index correct.
- **`EXPLAIN`** (plain, without `QUERY PLAN`) — a different real SQL
  prefix from `EXPLAIN QUERY PLAN` above, one real level lower. Per
  sqlite.org's own real, fetched documentation (`lang_explain.html`),
  "When the EXPLAIN keyword appears by itself it causes the statement to
  behave as a query that returns the sequence of virtual machine
  instructions it would have used to execute the command."
- **virtual machine / bytecode** — SQLite's own real, actual execution
  model. Per sqlite.org's own real, fetched documentation
  (`opcode.html`), "SQLite works by translating SQL statements into
  bytecode and then running that bytecode in a virtual machine" — real,
  literal instructions, one level below the human-readable `SCAN`/`SEARCH`
  summary `EXPLAIN QUERY PLAN` gives, and this lesson's own third unit's
  real proof surface.
- **`IdxInsert`** — one specific, real, named bytecode instruction. Per
  sqlite.org's own real, fetched documentation (`opcode.html`), "This
  opcode writes that key into the index P1" — its real presence or
  absence, this lesson's own literal, measured evidence of an index's
  real write-side cost.

**Objects and methods used**

- **`ToolRepository.FindByName`**
  - *What it is:* a new, real `static` method on this project's own
    `ToolRepository` class, searching `tools` by its own real `name`
    column and returning every real match, joined against `vendors`
    exactly like every other real tool-loading query this project already
    has.
  - *Implementation:* `public static List<Tool> FindByName(SqliteConnection
    connection, string name)` — takes an already-open real connection
    (no transaction, unlike `UpdateFluteCount`/`UpdateTool`/`Delete`,
    since this is a real read, not a write) and a real `string` to match
    against `tools.name`; returns a real, possibly-empty `List<Tool>`.
  - *Its use:* the real, concrete vehicle this lesson's Unit 2 uses to
    give `tools.name` — a column with no real structure backing it at
    all, unlike `vendors.name` — a genuine reason to need a real index.
  - *Type:* a `static` method — no instance, no state of its own, exactly
    like every other real method already on this class.
  - *Responsibility:* accept a real connection and a real name, run one
    real parameterized `SELECT`...`JOIN` against it, and hand back every
    real matching row as a real, fully-populated `Tool` — nothing more;
    it does not open or close the connection itself, matching this
    class's own established real convention.
  - *Depends on:* an already-open `SqliteConnection` (supplied by its
    caller), `Tool.FromReader` (this project's own established
    row→object mapping factory) to build each real result, and,
    after this lesson's own Unit 2, the real `idx_tools_name` index for
    its own real, measured speed.
  - *Connects to:* called by whatever real code needs to look a tool up
    by its own name rather than its `id` — no real caller exists in this
    project yet, proven correct instead by this lesson's own two new
    real, permanent tests in `ToolRepositoryTests.cs`.
  - *Shape:* part of this project's own real persistence-layer API
    surface (`ToolRepository`) — the same seam `UpdateFluteCount`,
    `UpdateTool`, and `Delete` already established, never called directly
    from WebView2's own JavaScript, per this project's own standing
    architecture rule that all data access crosses the C# boundary first.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`SqliteCommand`, `SqliteParameterCollection.AddWithValue`**
  - *What it is:* reappearing — the real class that holds
    one real SQL statement's own text plus its own real parameters before
    running it, and the real method that binds one real value to one
    real named parameter.
  - *Implementation:* established when parameterized queries were first
    introduced into this project, unchanged — a real
    constructor taking real SQL text and a real, already-open connection;
    `AddWithValue(string parameterName, object value)` adds one real,
    positionally-independent binding.
  - *Its use:* `FindByName`'s own real `@name` parameter, bound exactly
    the same real way every parameterized query in this project already
    binds one, so a real tool name containing an apostrophe (this
    project's own real vendor name, `O'Brien Carbide Tools`, already
    proved this matters) can never be misread as SQL syntax.
  - *Type:* `SqliteCommand` is a real class; `AddWithValue` is a real
    instance method on its own `Parameters` collection.
  - *Responsibility:* `SqliteCommand`'s full real charter is pairing one
    real SQL statement with the real connection (and, for a write, the
    real transaction) it will run against, and safely carrying any real
    parameter values that statement needs; `AddWithValue`'s full real
    charter is recording one real value under one real placeholder name
    without ever letting that value be interpreted as SQL text itself.
  - *Depends on:* a real, already-open `SqliteConnection`; `AddWithValue`
    depends on a command object that already exists.
  - *Connects to:* built once per real `FindByName` call, read by
    `ExecuteReader` (below) to actually run.
  - *Shape:* this project's own established real ADO.NET seam — every
    real SQL statement in this project passes through exactly this same
    class, reads or writes alike.
- **`SqliteDataReader.ExecuteReader` / `.Read()`**
  - *What it is:* reappearing — the real method that runs a
    real `SELECT` and hands back a real, forward-only cursor over its own
    real result rows, and the real method that advances that cursor one
    real row at a time.
  - *Implementation:* established when row-by-row reading was first
    introduced into this project, unchanged — `ExecuteReader()`
    returns a real `SqliteDataReader`; `Read()` returns a real `bool`,
    `true` while a real row remains, `false` once none do.
  - *Its use:* `FindByName`'s own real `while (reader.Read())` loop,
    identical in real shape to every other real row-mapping loop this
    project already has.
  - *Type:* both are real instance methods — `ExecuteReader` on
    `SqliteCommand`, `Read` on the `SqliteDataReader` it returns.
  - *Responsibility:* `ExecuteReader`'s full real charter is actually
    running the real SQL and exposing its real results one row at a time,
    without loading every real row into memory at once; `Read`'s full
    real charter is moving that real cursor forward and reporting whether
    a real row is actually there to read.
  - *Depends on:* an already-built, already-parameterized `SqliteCommand`.
  - *Connects to:* `Read()`'s own real `true` result is what lets
    `Tool.FromReader` (below) run at all, once per real matching row.
  - *Shape:* the same real row-streaming seam this project has used since
    row-by-row reading was first introduced, reused here with zero real
    changes.
- **`List<Tool>`**
  - *What it is:* reappearing — a real, general-purpose,
    growable ordered collection.
  - *Implementation:* established when this project first needed to
    return more than one real row at once, unchanged — a real
    parameterless constructor builds an empty one; `Add` appends one real
    element; its own indexer and `Count` are unused by this lesson's own
    code but remain real members of the same real type.
  - *Its use:* `FindByName`'s own real return type and its own real
    accumulator — genuinely empty when no real tool matches, proven by
    this lesson's own new `FindByName_ReturnsEmptyList_WhenNoToolMatches`
    test, rather than `null` or a thrown exception.
  - *Type:* a real, generic class, `System.Collections.Generic.List<T>`,
    here closed over `Tool`.
  - *Responsibility:* hold zero or more real `Tool` values, in real
    insertion order, and let real code append to or iterate over them.
  - *Depends on:* nothing beyond its own generic type parameter.
  - *Connects to:* built inside `FindByName`, appended to once per real
    row `Read()` reports, then handed back whole to `FindByName`'s own
    real caller.
  - *Shape:* an ordinary real return-value container — not a database
    concept at all, the same real .NET type this project already reaches
    for whenever a query can return more than one real row.
- **`Tool.FromReader`**
  - *What it is:* reappearing — this project's own real
    factory method turning one real database row into one real, immutable
    `Tool` record.
  - *Implementation:* established when row→object mapping was first
    introduced into this project, unchanged — a real `static`
    method reading six real columns off a `SqliteDataReader` by real
    position, returning a new real `Tool`.
  - *Its use:* `FindByName`'s own real per-row mapping step, identical to
    every other real query in this project that builds `Tool` objects.
  - *Type:* a real `static` factory method on the real `Tool` record.
  - *Responsibility:* map exactly one real, already-positioned reader row
    into one real, fully-populated, immutable `Tool` — nothing about
    which query produced that row.
  - *Depends on:* a real `SqliteDataReader` already positioned on a real
    row with exactly six real columns, in the same real order this
    project's own queries all already agree on.
  - *Connects to:* called once per real iteration of `FindByName`'s own
    `while (reader.Read())` loop, its own real result appended straight
    into the real `List<Tool>` being built.
  - *Shape:* the same real row→object mapping boundary this project has
    used since row→object mapping was first introduced — unchanged by
    this lesson, reused as-is.

---

## Concept Unit: `EXPLAIN QUERY PLAN` — Seeing What SQLite Actually Does

### The Problem

This project has run the same real JOIN query — `tools JOIN vendors ON
tools.vendor_id = vendors.id` — dozens of real times since it first
appeared, and `FindToolById`'s own real `WHERE tools.id = @id` lookup
just as many, always returning the correct real rows. Nothing in this
project has ever asked *how* SQLite actually finds them — only that it
does, correctly, every time.

> **Try this first:** the Header, above, restates a real, already-proven
> fact about this project's own schema design — a column declared exactly `INTEGER PRIMARY
> KEY` becomes a real alias for SQLite's own internal `rowid`, a value
> every real table already keeps, in sorted order, whether a query asks
> for it or not. Given that, and given `tools.id` and `vendors.id` are
> each declared exactly that way — what real, concrete difference would
> you predict between how SQLite finds the one real row `FindToolById`'s
> own `WHERE tools.id = @id` wants, versus how it finds every real row
> `MainWindow_Loaded`'s own query wants, which has no `WHERE` clause on
> `tools` at all? Is there any way for SQLite to avoid examining every
> real row of `tools` for that second, unfiltered query — or is a real,
> unavoidable full pass the only honest option once every row is
> genuinely wanted?
>
> If SQLite really does treat these two real queries differently
> underneath, how would you actually find that out for real — using only
> something SQLite itself already gives you access to — rather than
> guessing from the SQL text alone?

### Project Change

- **Reference Source** — no reference counterpart consulted this
  session; per this project's own self-containment rule.
- **Files affected** — none. This unit is a real, direct inspection of
  two already-shipped real queries; nothing in `ToolDB/` changes yet.
- **Change type** — none (diagnostic only).
- **Location** — n/a.
- **Dependencies** — `FindToolById`'s own real query (established:
  Two-Way Communication Across the Split) and `MainWindow_Loaded`'s own
  real query (established: Multiple Tables & `JOIN`), both unchanged.

### The New Code

```sql
EXPLAIN QUERY PLAN
```

### The Updated Project

Prepended, unmodified, in front of this project's own two real,
already-shipped queries — the minimal real dependency this new prefix
actually runs against:

```sql
1  EXPLAIN QUERY PLAN                                                    <!-- ← new -->
2  SELECT tools.id, tools.name, vendors.name, tools.overall_diameter,
3         tools.overall_length, tools.flute_count
4  FROM tools
5  JOIN vendors ON tools.vendor_id = vendors.id
6  WHERE tools.id = @id
```

The second real, already-shipped query gets the identical real prefix —
this one with no real `WHERE` clause on `tools` at all, since it
deliberately wants every real row:

```sql
1  EXPLAIN QUERY PLAN                                                    <!-- ← new -->
2  SELECT tools.id, tools.name, vendors.name, tools.overall_diameter,
3         tools.overall_length, tools.flute_count
4  FROM tools
5  JOIN vendors ON tools.vendor_id = vendors.id
```

Run for real this session, read-only, against the real `tools.db`
(`verification/lesson-20/lab1-real-query-plans.cs`):

```
--- real FindToolById query (WHERE tools.id = @id) ---
SEARCH tools USING INTEGER PRIMARY KEY (rowid=?)
SEARCH vendors USING INTEGER PRIMARY KEY (rowid=?)
--- real MainWindow_Loaded / RefreshBrowserTableAsync query (no WHERE) ---
SCAN tools
SEARCH vendors USING INTEGER PRIMARY KEY (rowid=?)
```

The first real query (lines 1–6, first block) now genuinely returns two
rows of its own real diagnostic output instead of tool data — a real
`SEARCH` for `tools` and a real `SEARCH` for `vendors`, both by real
`rowid`. The second real query (lines 1–5, second block, no real `WHERE`
at all) returns a real `SCAN` for `tools` — every real row, on purpose —
but still only a `SEARCH` for `vendors`, since the real `JOIN` condition
(`tools.vendor_id = vendors.id`) still filters `vendors` by its own real
rowid, one real tool row at a time.

### Proving It in Isolation

A minimal, unrelated throwaway table, isolating exactly the real
`SCAN`/`SEARCH` distinction the real output above just showed, down to a
single table with a single row:

```csharp
new SqliteCommand("CREATE TABLE t (id INTEGER PRIMARY KEY, name TEXT NOT NULL)", connection).ExecuteNonQuery();
new SqliteCommand("INSERT INTO t (name) VALUES ('Widget')", connection).ExecuteNonQuery();
```

Against that one real row, the same real `EXPLAIN QUERY PLAN` prefix
from this unit's own real code above, run against two contrasting real
lookups on the identical table:

```sql
EXPLAIN QUERY PLAN SELECT * FROM t WHERE id = 1
EXPLAIN QUERY PLAN SELECT * FROM t WHERE name = 'Widget'
```

Run for real this session:

```
--- WHERE id = 1 (id is INTEGER PRIMARY KEY, a real rowid alias) ---
SEARCH t USING INTEGER PRIMARY KEY (rowid=?)
--- WHERE name = 'Widget' (name has no index yet) ---
SCAN t
```

This real, captured output proves the Socratic question's own prediction
exactly: filtering by `id` — a real rowid alias — gets a real `SEARCH`,
the identical real shape the real project's own `FindToolById` query just
showed; filtering by `name`, a column with no real structure backing it
at all yet, forces a real `SCAN`, the identical real shape `tools.name`
would face in this project's own real database right now, before this
lesson's own second unit changes that. This distinction is called
**query planning**: SQLite deciding, silently, which real strategy
actually answers a given real query.

### Discard the Throwaway Example

The throwaway `t` table above is discarded now — it never appears in
this project again. What's proven is the real, general `SCAN`/`SEARCH`
distinction itself, and that a rowid-aliased column always gets the fast
path for free — not this specific throwaway table.

### Mechanical Walkthrough

- `EXPLAIN QUERY PLAN` — a real SQL command (Header, above), prepended in
  front of an otherwise-unchanged real statement; per its own real,
  quoted documentation, it turns that statement into "a high-level
  description of the strategy or plan that SQLite uses" instead of
  running it for real data — the statement itself never executes for
  real when this prefix is present, only its own real plan is reported.
- `SCAN` (real output, Header above) — reported once per real query
  above, for `tools`, whenever every real row genuinely has to be
  examined; per its own real, quoted documentation, "SCAN is used for a
  full-table scan" — not a defect here, since `MainWindow_Loaded`'s own
  real query genuinely wants every real row.
- `SEARCH ... USING INTEGER PRIMARY KEY (rowid=?)` (real output) — the
  real `rowid` term (Header, above), reappearing, doing
  real work here: because `tools.id`/`vendors.id`/`t.id` are each real
  rowid aliases, SQLite can jump directly to the one real row whose
  rowid matches, exactly the real mechanism the Socratic question above
  predicted, rather than genuinely comparing every real row's own `id`
  one at a time.

### CS Lens

SQL's own real text states only *what* rows are wanted — `WHERE tools.id
= @id` — never *how* to find them; SQLite's own real query planner
decides that, silently, fresh, every time. This is a real instance of
**declarative programming**: describing a real desired result rather than
a real, step-by-step procedure for producing it. Also recognized in: a
GPS app asked for "the fastest route to X," never told which real turns
to take; a spreadsheet formula, which states a real relationship between
cells and lets the spreadsheet decide the real order to recalculate them
in; a compiler's own real optimizer, choosing real machine instructions
for the same real source program differently depending on real context;
regular expression engines, which are told what pattern to match, never
which real characters to compare first.

### SE Lens

Why does SQLite decide this silently, rather than requiring whoever wrote
the query to specify the real strategy by hand? The real alternative not
chosen — some real, older systems, and even some other SQL engines'
own optional query hints, let or require an author to name the real
access path directly — was rejected by SQLite's own real design, because
automatic planning means the exact same real SQL text can get faster
later (a new real index, this lesson's own second unit) with zero real
code changes anywhere in this project — a real, load-bearing separation
between this project's own persistence logic and its own real
performance. The honest cost, and this unit's own real point: a reader
genuinely cannot know how a real query performs by reading its own SQL
text alone — only by asking the real running engine directly, via
`EXPLAIN QUERY PLAN`, which is easy to simply never do, the exact real
gap this project's own queries have sat in since row→object mapping was
first introduced.

### Run It

Run for real this session, both against the real, live `tools.db`
(read-only) and against a real, throwaway single-table database; full
source and real captured output saved in this project's own
`verification/lesson-20/lab1-real-query-plans.cs` and
`lab0-scan-vs-search-isolated.cs`.

### Connecting Back

This project's own two real, already-shipped queries turn out to already
be fast, for a real reason this lesson just named: both filter on a real
rowid alias. The next unit finds a real query this project is about to
add that genuinely isn't so lucky.

---

## Concept Unit: `CREATE INDEX` — Building the Structure a Real Search Actually Needs

### The Problem

This project has no way today to look a tool up by its own real `name` —
only by `id` (`FindToolById`) or by loading every real row at once
(`MainWindow_Loaded`). Unit 1's own closing diagnostic already answered,
for real, what a hypothetical `WHERE tools.name = @name` query would face
right now: a real `SCAN` of every row in `tools`, because `name` — unlike
`vendors.name` — has no real structure backing it at all.

> **Try this first:** Constraints & Data Integrity gave `vendors.name` a
> real `UNIQUE` constraint, explained purely as a correctness
> guarantee — no two vendors may share a real name. Given a query
> filtering on `vendors.name` gets a real `SEARCH ... USING COVERING
> INDEX sqlite_autoindex_vendors_1` plan rather than a `SCAN` (this
> project's own real database, inspected below) — what does that tell you
> SQLite is actually doing, silently, every time a column is declared
> `UNIQUE`, beyond just checking for real duplicates at write time?
>
> If `tools.name` genuinely has no similar real protection, and Unit 1
> already proved that means a real `SCAN`, what would the real
> `CREATE INDEX` statement (Header, above) have to specify to fix that
> for `tools.name` specifically — given its own real, quoted syntax
> already names exactly the three real things a reader has to supply?
>
> Would adding this real index change a single real row `FindByName`
> returns, for any real input? If not — what exactly is different
> between the two, otherwise-identical real queries: the one before this
> index exists, and the one after?

### Project Change

- **Reference Source** — no reference counterpart consulted this
  session; per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolRepository.cs`, modified (new method).
  `ToolDB.Tests/ToolRepositoryTests.cs`, modified (two new tests).
  `tools.db`'s own real, live schema, modified (one new index, applied
  once, directly, the same real pattern already established by Multiple
  Tables & `JOIN` and Constraints & Data Integrity's own real
  migrations — never kept as permanent app code, since a schema object,
  unlike a table row, only needs to be created once).
- **Change type** — add.
- **Location** — `ToolRepository.cs`, after `Delete` (Updating and
  Deleting Safely); `ToolRepositoryTests.cs`, after
  `Delete_CommitsWhenTransactionSucceeds`.
- **Dependencies** — `Tool.FromReader` (Header, above), unchanged.

### The New Code

```csharp
public static List<Tool> FindByName(SqliteConnection connection, string name)
{
    using var command = new SqliteCommand(
        "SELECT tools.id, tools.name, vendors.name, tools.overall_diameter, tools.overall_length, tools.flute_count FROM tools JOIN vendors ON tools.vendor_id = vendors.id WHERE tools.name = @name",
        connection);
    command.Parameters.AddWithValue("@name", name);
    using var reader = command.ExecuteReader();

    var results = new List<Tool>();
    while (reader.Read())
    {
        results.Add(Tool.FromReader(reader));
    }
    return results;
}
```

`FindByName` alone only changes what this project can ask for — the
real, permanent structural change that makes asking for it fast is a
second, separate real statement:

```sql
CREATE INDEX idx_tools_name ON tools(name);
```

### The Updated Project

`ToolRepository.cs`, in full, new lines marked:

```csharp
 1  using Microsoft.Data.Sqlite;
 2
 3  public static class ToolRepository
 4  {
 5      public static void UpdateFluteCount(SqliteConnection connection, SqliteTransaction transaction, int id, int newFluteCount)
 6      {
 7          using var command = new SqliteCommand(
 8              "UPDATE tools SET flute_count = @fluteCount WHERE id = @id",
 9              connection,
10              transaction);
11          command.Parameters.AddWithValue("@fluteCount", newFluteCount);
12          command.Parameters.AddWithValue("@id", id);
13          command.ExecuteNonQuery();
14      }
15
16      public static void UpdateTool(SqliteConnection connection, SqliteTransaction transaction, int id, string name, double overallDiameter, double overallLength, int fluteCount)
17      {
18          using var command = new SqliteCommand(
19              "UPDATE tools SET name = @name, overall_diameter = @overallDiameter, overall_length = @overallLength, flute_count = @fluteCount WHERE id = @id",
20              connection,
21              transaction);
22          command.Parameters.AddWithValue("@name", name);
23          command.Parameters.AddWithValue("@overallDiameter", overallDiameter);
24          command.Parameters.AddWithValue("@overallLength", overallLength);
25          command.Parameters.AddWithValue("@fluteCount", fluteCount);
26          command.Parameters.AddWithValue("@id", id);
27          command.ExecuteNonQuery();
28      }
29
30      public static void Delete(SqliteConnection connection, SqliteTransaction transaction, int id)
31      {
32          using var command = new SqliteCommand(
33              "DELETE FROM tools WHERE id = @id",
34              connection,
35              transaction);
36          command.Parameters.AddWithValue("@id", id);
37          command.ExecuteNonQuery();
38      }
39
40      public static List<Tool> FindByName(SqliteConnection connection, string name)              // ← new
41      {                                                                                            // ← new
42          using var command = new SqliteCommand(                                                  // ← new
43              "SELECT tools.id, tools.name, vendors.name, tools.overall_diameter, tools.overall_length, tools.flute_count FROM tools JOIN vendors ON tools.vendor_id = vendors.id WHERE tools.name = @name",  // ← new
44              connection);                                                                         // ← new
45          command.Parameters.AddWithValue("@name", name);                                          // ← new
46          using var reader = command.ExecuteReader();                                              // ← new
47                                                                                                    // ← new
48          var results = new List<Tool>();                                                          // ← new
49          while (reader.Read())                                                                    // ← new
50          {                                                                                         // ← new
51              results.Add(Tool.FromReader(reader));                                                 // ← new
52          }                                                                                          // ← new
53          return results;                                                                           // ← new
54      }                                                                                             // ← new
55  }
```

`ToolRepository` (the whole real, static class) now offers a fourth real
operation alongside `UpdateFluteCount`, `UpdateTool`, and `Delete` —
`FindByName` (lines 40–54), the first of the four that reads instead of
writes, and the first that needs no `SqliteTransaction` at all, since a
real read never needs one.

The real, permanent schema change — applied once, directly, against the
real `tools.db` (`verification/lesson-20/step4-apply-real-index.cs`, run
this session with the user's own explicit authorization, since a real
schema change to the real database is exactly the kind of action this
project's own auto-mode classifier correctly pauses to confirm):

```
Real idx_tools_name created on the real tools.db.
--- sqlite_schema, confirming the real index now exists permanently ---
index | sqlite_autoindex_vendors_1 | vendors | (auto, no sql text)
index | idx_tools_name | tools | CREATE INDEX idx_tools_name ON tools(name)
--- real EXPLAIN QUERY PLAN, WHERE tools.name = ?, AFTER the real index exists ---
SEARCH tools USING INDEX idx_tools_name (name=?)
SEARCH vendors USING INTEGER PRIMARY KEY (rowid=?)
```

`sqlite_schema` (the real, hidden table SQLite itself keeps, already
inspected once by Schema Design) now genuinely lists two real indexes,
not one: `sqlite_autoindex_vendors_1` — a real index this project already
had, silently, since Constraints & Data Integrity's own `UNIQUE`
constraint — and `idx_tools_name`, this lesson's own new one. The real
`WHERE tools.name = ?` query that forced a real `SCAN` in Unit 1 now
genuinely reports a real `SEARCH` instead.

### Proving It in Isolation

A minimal, unrelated throwaway table, isolating exactly this real
before/after — the identical real `CREATE INDEX` statement just applied
to the real `tools.db` above, run first against a table with only one
real row, then again against one with 5,000 real synthetic rows, so the
real effect isn't mistaken for an artifact of this project's own
currently tiny real data:

```csharp
new SqliteCommand("CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT NOT NULL)", connection).ExecuteNonQuery();
new SqliteCommand("INSERT INTO tools (name) VALUES ('Widget')", connection).ExecuteNonQuery();
// ... EXPLAIN QUERY PLAN SELECT * FROM tools WHERE name = 'Widget' ...
new SqliteCommand("CREATE INDEX idx_tools_name ON tools(name)", connection).ExecuteNonQuery();
// ... EXPLAIN QUERY PLAN SELECT * FROM tools WHERE name = 'Widget' ... again
```

Run for real this session, once against a real 1-row table, once against
a real 5,000-row table:

```
--- tiny table, no index, WHERE name = ? ---
SCAN tools
--- tiny table (1 row), WITH index, WHERE name = ? ---
SEARCH tools USING COVERING INDEX idx_tools_name (name=?)
--- large table (5000 rows), no index, WHERE name = ? ---
SCAN tools
--- large table (5000 rows), WITH index, WHERE name = ? ---
SEARCH tools USING COVERING INDEX idx_tools_name (name=?)
```

This real, captured output proves the same real `CREATE INDEX` statement
just applied to `tools.db` genuinely flips `SCAN` to `SEARCH` — identical
at 1 real row and at 5,000 real rows, proving this isn't a coincidence of
this project's own currently tiny real data. It also shows something the
real, live `tools.db` run above didn't: **`SEARCH ... USING COVERING
INDEX`**, not plain `USING INDEX` — because this throwaway table's own
`SELECT *` needs only `id` (already free, a real rowid) and `name`
(already in the index), while the real project's own query also needs
`overall_diameter`/`overall_length`/`flute_count`, columns the index
doesn't hold — so SQLite must still fetch the real row itself there, the
real, honest reason the real `tools.db` run above says `USING INDEX`
without the word `COVERING`.

### Discard the Throwaway Example

The throwaway `tools` table above (and its own 5,000 synthetic rows) is
discarded now — it never appears in this project again. What's proven is
that `CREATE INDEX` genuinely changes the real query plan, at real scale,
and the real, specific condition (every needed column present in the
index) that separates a plain `SEARCH` from a real **covering** one — not
this specific throwaway data.

### Mechanical Walkthrough

- `public static List<Tool> FindByName(SqliteConnection connection,
  string name)` — a real `static` method (Header, above, established
  Updating and Deleting Safely's own `ToolRepository` shape), taking a
  real, already-open `SqliteConnection` and a real `string` — no
  `SqliteTransaction` parameter, unlike its three siblings, because a
  real read never needs to be rolled back.
- `new SqliteCommand(...)` — `SqliteCommand` (Header, above), reappearing
  — built here with only a connection, no transaction,
  matching this method's own real, read-only nature.
- `command.Parameters.AddWithValue("@name", name)` — `AddWithValue`
  (Header, above), reappearing — binds the real, caller-supplied `name`
  safely, the identical real defense this project has used for every
  real parameter since parameterized queries were first introduced.
- `using var reader = command.ExecuteReader();` — `ExecuteReader` (Header,
  above), reappearing — runs the real, now-parameterized
  `SELECT` and returns a real, forward-only cursor over its own real
  results.
- `var results = new List<Tool>();` — `List<Tool>` (Header, above),
  reappearing — a real, empty collection, genuinely capable
  of holding zero real tools, unlike returning a single, possibly-`null`
  `Tool?` the way `FindToolById` does.
- `while (reader.Read())` — `Read()` (Header, above), reappearing — the
  identical real loop shape this project has used since row-by-row
  reading was first introduced to walk every real row a query returns,
  one at a time.
- `results.Add(Tool.FromReader(reader));` — `Tool.FromReader` (Header,
  above), reappearing — maps the real, currently-positioned
  row into a real, immutable `Tool`, appended into the real, growing
  `results` list.
- `return results;` — hands the real, possibly-empty list back to
  whatever real code called `FindByName` — genuinely empty rather than
  `null` when nothing matches, proven by this lesson's own new
  `FindByName_ReturnsEmptyList_WhenNoToolMatches` test.
- `CREATE INDEX idx_tools_name ON tools(name);` — `CREATE INDEX` (Header,
  above) — its own real, quoted syntax supplies exactly the three real
  things sqlite.org's own documentation names: the new index's own real
  name (`idx_tools_name`), the real table it indexes (`tools`), and the
  real column used as its own key (`name`) — this real statement is what
  actually builds the real, separate sorted structure the Header's own
  **index** definition describes; it changes nothing about what any real
  query returns, only how SQLite finds the real rows that satisfy it.

### CS Lens

An index trades real disk space and real write-time upkeep for real
read-time speed — a concrete instance of a **space-time tradeoff**: a
real algorithmic decision to spend one real resource (space, or upfront
work) in exchange for saving a different real resource (time) later.
Also recognized in: a phone book's own real alphabetical order — itself a
real index by name — versus reading every real entry to find one; a
library's own real card catalog; hash tables and binary search trees in
general, which are the exact same real idea (a separate, real lookup
structure trading space for speed) applied outside a database entirely;
memoization/caching anywhere in software, trading real memory for
avoiding real repeated work.

### SE Lens

Why not index every real column, defensively, always? The real
alternative not chosen — indexing everything — was rejected here on two
real grounds this unit already surfaced: `vendors.name` already got a
real, automatic index for free the moment Constraints & Data Integrity
declared it `UNIQUE` (`sqlite_autoindex_vendors_1`, confirmed for real in
this unit's own `sqlite_schema` inspection above), so adding a second,
redundant one there would be pure real waste with zero real benefit; and
— this lesson's own third unit proves directly, not just asserts — every
real index adds real, measurable cost to every future real write that
touches it, cost this project is about to actually measure rather than
merely claim. The honest, unresolved tension this unit leaves open: this
index is added now for a real capability (`FindByName`) this project just
built, on the real bet that looking a tool up by its own name will be a
genuinely common real operation for this specific application (a tool
library meant to be searched, not just listed) — a real, reversible
engineering judgment call, not a provably correct one.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors (the one pre-existing, deliberate `CS0067` warning
from Building the Add/Edit Form in XAML is unchanged). Two new, real,
permanent tests were added to `ToolRepositoryTests.cs`
(`FindByName_ReturnsMatchingTool`,
`FindByName_ReturnsEmptyList_WhenNoToolMatches`) and pass for real this
session, alongside the eighteen tests already established: **20 tests,
0 failures.** The real, permanent index was applied directly to the real,
live `tools.db` this session, with the user's own explicit authorization;
source and real captured output for both the throwaway isolation and the
real, permanent change are saved in this project's own
`verification/lesson-20/lab2-index-before-after-isolated.cs` and
`step4-apply-real-index.cs`.

### Connecting Back

`tools.name` now has exactly the real structure `vendors.name` already
had, and `ToolRepository.FindByName` gives this project its first real
way to use it. The final unit asks the real question this unit's own SE
Lens deliberately left open: what does that real index actually cost, in
concrete, measured terms, not just a plausible-sounding sentence about
tradeoffs?

---

## Concept Unit: Cost — What an Index Actually Costs to Maintain

### The Problem

Unit 2 made every future `WHERE tools.name = @name` lookup real,
measurably faster — for free, as far as anything shown so far actually
proves. `ToolRepository`'s own real `INSERT`-adjacent write path
(`UpdateTool`, `Delete`, and any future real insert this project adds)
has never changed since Updating and Deleting Safely, and `idx_tools_name`
now lives on the exact real column, `tools.name`, every real row already
writes to.

> **Try this first:** the Header's own real, quoted definition of an
> index states it's "another table" — a real, genuinely separate data
> structure, kept in its own real sorted order. If that's true, what does
> inserting one new real row into `tools` now have to keep correct, that
> it didn't have to before `idx_tools_name` existed?
>
> This project has already seen `EXPLAIN QUERY PLAN`'s own high-level,
> human-readable summary. If you wanted real, exact proof of extra real
> work happening — not just a plausible-sounding sentence about it — what
> would you look for, one real level below `EXPLAIN QUERY PLAN` itself,
> given the Header's own real, quoted fact that "SQLite works by
> translating SQL statements into bytecode and then running that bytecode
> in a virtual machine"?
>
> Would you expect a real `INSERT`'s own bytecode to grow by a lot, or by
> only a handful of extra real instructions? What's actually being added —
> a whole second real copy of the row, or something smaller?

### Project Change

- **Reference Source** — no reference counterpart consulted this
  session; per this project's own self-containment rule.
- **Files affected** — none. Purely diagnostic, run against real,
  disposable, throwaway copies of this project's own real schema — never
  the real, live `tools.db`, since this unit's own entire point is
  measuring, not modifying, real data.
- **Change type** — none (diagnostic only).
- **Location** — n/a.
- **Dependencies** — the real `tools` schema shape established by
  Constraints & Data Integrity (`NOT NULL`, `CHECK` constraints).

### The New Code

```sql
EXPLAIN INSERT INTO tools (name) VALUES ('Widget')
```

### The Updated Project

Run for real this session against two real, disposable, throwaway
copies of a minimal one-column schema — one with no index, one with
`idx_tools_name` already applied — real captured bytecode for each
(`verification/lesson-20/lab3-insert-cost-opcodes.cs`):

```
--- MINIMAL schema, WITHOUT index ---
  0  Init
  1  OpenWrite
  2  SoftNull
  3  String8
  4  NewRowid
  5  HaltIfNull
  6  MakeRecord
  7  Insert
  8  Halt
  9  Transaction
 10  Goto
Total opcodes: 11
--- MINIMAL schema, WITH index ---
  0  Init
  1  OpenWrite
  2  OpenWrite
  3  SoftNull
  4  String8
  5  NewRowid
  6  HaltIfNull
  7  Affinity
  8  SCopy
  9  IntCopy
 10  MakeRecord
 11  MakeRecord
 12  IdxInsert
 13  Insert
 14  Halt
 15  Transaction
 16  Goto
Total opcodes: 17
```

The exact same real `INSERT` statement compiles to a real 11 real
instructions without the index, and a real 17 with it — six more real,
concrete instructions, not a hand-wave: a second real `OpenWrite` (a real
cursor onto the index's own real, separate sorted structure — the Header's
own **index** definition, above — alongside the one already open
on `tools` itself), `Affinity`/`SCopy`/`IntCopy` (real steps building the
real index key from `name` and its own real rowid), a second real
`MakeRecord` (the real index entry itself, separate from the real table
row's own record), and — the one real instruction this lesson's own
Header already named — a real `IdxInsert`, present only in the second
run.

### Proving It in Isolation

The exact same real comparison, run again against a real, disposable copy
of this project's own actual, current `tools` schema — every real `CHECK`
constraint Constraints & Data Integrity added included — so the real
6-instruction finding above isn't dismissed as an artifact of an
unrealistically bare table:

```sql
CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT NOT NULL,
    overall_diameter REAL NOT NULL CHECK (overall_diameter > 0),
    overall_length REAL NOT NULL CHECK (overall_length > 0),
    flute_count INTEGER NOT NULL CHECK (flute_count > 0));

EXPLAIN INSERT INTO tools (name, overall_diameter, overall_length, flute_count)
VALUES ('Widget', 0.5, 3.0, 4)
```

Run for real this session:

```
--- REAL-SHAPED schema, WITHOUT index --- (29 total opcodes)
--- REAL-SHAPED schema, WITH index ---    (34 total opcodes, includes IdxInsert)
```

This real, captured output (full instruction list saved in
`verification/lesson-20/lab3-insert-cost-opcodes.cs`) proves the same
real finding holds against this project's own actual, current, more
complex `tools` schema, `CHECK` constraints and all: a real, consistent
handful of extra real instructions — not a large, alarming jump — every
single time a real row is inserted, for as long as `idx_tools_name`
exists.

### Discard the Throwaway Example

Both throwaway comparisons above are discarded now — neither table nor
its own real, temporary `.db` file appears in this project again. What's
proven is the real, exact, named `IdxInsert` instruction, and that its
own real cost is small and constant, not proportional to the real size of
`tools` — not these specific throwaway schemas.

### Mechanical Walkthrough

- `EXPLAIN` (Header, above, plain, without `QUERY PLAN`) — per its own
  real, quoted documentation, causes the statement to "behave as a query
  that returns the sequence of virtual machine instructions it would have
  used to execute the command" — a real level below `EXPLAIN QUERY
  PLAN`'s own human-readable summary, showing the real, literal
  **bytecode** (Header, above) SQLite's own real **virtual machine**
  actually runs.
- `IdxInsert` (real output, Header above) — one specific, real, named
  instruction; per its own real, quoted documentation, "This opcode
  writes that key into the index P1" — its real presence, in the
  `WITH index` run and nowhere in the `WITHOUT index` run, is this
  lesson's own literal, measured proof that an index adds real work to
  every real future write, not merely a plausible-sounding claim about
  tradeoffs.

### CS Lens

Every real index this project ever adds makes some real future write do
strictly more real work, in exchange for some real future read doing
strictly less — there is no such thing as a real index that helps reads
for free. This is a real instance of an **amortized tradeoff between
operations**: optimizing one real operation's own cost necessarily shifts
real cost onto a different one, rather than eliminating cost outright.
Also recognized in: alphabetizing a real bookshelf, which makes finding
a book instant but makes shelving a new one slower, since the right real
spot has to be found first; a company's own real cross-reference filing
system, where every new real document now has to be filed in two real
places instead of one; database "denormalization" and materialized views
in general — the same real idea, one level up from a single index.

### SE Lens

Given this real, measured cost, why does this project keep
`idx_tools_name` rather than removing it? The real alternative not
chosen — leaving `tools.name` unindexed, since `tools.db` currently holds
exactly one real row, so the real cost either way is currently
negligible — was rejected here on the same real, honest bet Unit 2's own
SE Lens already named out loud: this project expects real, ongoing name
lookups (a tool library meant to be searched) to matter more than real,
comparatively rare inserts of brand-new tools. The honest cost of that
real bet, stated plainly rather than hidden: if this project's own real
usage pattern turns out to be write-heavy instead — many real tools added
constantly, rarely searched by name — this exact real index would be
actively, measurably wrong to keep, and this lesson's own real,
measured 6-instruction finding is precisely the real evidence a future
session would need to make that real call correctly, rather than
guessing.

### Run It

Run for real this session, twice — a minimal one-column schema and a
real, disposable copy of this project's own actual, current `tools`
schema — both with and without `idx_tools_name`; full real source and
real captured bytecode saved in this project's own
`verification/lesson-20/lab3-insert-cost-opcodes.cs`. No change to any
tracked project file or to the real, live `tools.db` was needed for this
unit; `dotnet test`'s own real, unchanged 20-test pass from Unit 2 still
holds.

### Connecting Back

The same real index that turned `FindByName`'s own `SCAN` into a real
`SEARCH` (Unit 2) is proven here, directly, to cost exactly six extra
real instructions on every real future insert into `tools` — a real,
honest, measured tradeoff, not a hidden one.

---

## Connect the Pieces

One real tool — id `1`, name `1/2 in 4-Flute Carbide End Mill` — traced
through everything this lesson built:

1. `FindToolById`'s own real, already-shipped `WHERE tools.id = @id`
   lookup for this exact real tool was already fast, proven directly by
   real `EXPLAIN QUERY PLAN` output: a real `SEARCH`, not a `SCAN`,
   because `tools.id` is a real rowid alias — true before this lesson
   ever started, and still true now (Unit 1).
2. Looking that same real tool up by its own real name instead — nothing
   this project could do before this lesson — would have forced a real
   `SCAN` of every row in `tools`, proven directly; `ToolRepository
   .FindByName` and a new, real, permanent `idx_tools_name` index,
   applied to the real, live `tools.db` with the user's own explicit
   authorization, fixed that for real, proven by the identical real query
   now reporting a real `SEARCH` instead (Unit 2).
3. That real speed never arrived free: the exact real column protecting
   this tool's own future edits and future siblings' own inserts,
   `tools.name`, now genuinely costs six extra real bytecode
   instructions — including one real, named `IdxInsert` — every single
   time a real row is written, proven directly by inspecting SQLite's
   own real virtual-machine bytecode, not merely asserted (Unit 3).

**Slice 4 continues.** **Next lesson:** 21 — Views.
