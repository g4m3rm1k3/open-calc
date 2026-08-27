# Lesson 21: Naming a Query Instead of Repeating It (Views)

**What you will build.** A new, real, permanent database object,
`tool_details` (a `CREATE VIEW`), replacing the exact same real,
six-column `tools JOIN vendors` query this project has now typed out, by
hand, in four separate real places (`MainWindow_Loaded`,
`RefreshBrowserTableAsync`, `FindToolById`, `FindByName`). All four real
call sites get rewritten to select from the real view instead. The
transferable problem underneath the feature: duplicated real query logic
scattered across several real call sites means a future real schema
change has to be found and correctly re-applied in every real copy — a
view moves that logic to exactly one real, shared, named place instead. A
real, verified bonus this lesson proves directly, not just claims: going
through the real view costs nothing at real query time, because of
SQLite's own real "Subquery Flattening" optimization — proven by
identical real `EXPLAIN QUERY PLAN` output whether a real query is
written against the view or written out by hand.

**What you need to know first.** Multiple Tables & `JOIN` — the real
`tools JOIN vendors ON tools.vendor_id = vendors.id` query this lesson
deduplicates. Indexes & Query Planning — `EXPLAIN QUERY PLAN`, and the
real `SCAN`/`SEARCH` vocabulary this lesson reuses directly to prove the
view is free. Two-Way Communication Across the Split — `FindToolById`'s
own real, already-shipped query, one of the four this lesson rewrites.
Indexes & Query Planning, again — `ToolRepository.FindByName` and the
real `idx_tools_name` index, the other real call site this lesson
rewrites.

**Terms used in this lesson**

- **view** — a real, named database object that is not itself a real
  table — it stores no real rows of its own. Per sqlite.org's own real,
  fetched documentation (`lang_createview.html`), "The CREATE VIEW
  command assigns a name to a pre-packaged SELECT statement" — a real,
  reusable name for a query, not a second real copy of any data.
- **`CREATE VIEW`** — the real SQL statement that builds one. Per that
  same real, fetched documentation, "Once the view is created, it can be
  used in the FROM clause of another SELECT in place of a table name" —
  real code that queries a view looks exactly like real code querying a
  table, even though nothing about the view's own real rows is actually
  stored anywhere.
- **query reuse** — one real, shared query definition instead of several
  independently typed, independently maintained real copies of the
  identical logic. Its real motivation: a future real schema change only
  has to happen once, correctly, instead of being found and re-applied
  in every real copy — a real risk this project's own current, real
  four-copy duplication already demonstrates, before this lesson fixes
  it.
- **subquery flattening** — a real, specific SQLite query-planner
  optimization. Per sqlite.org's own real, fetched documentation
  (`optoverview.html`, section "11. Subquery Flattening"), the naive
  alternative — "evaluate the subquery into a transient table, then run
  the outer SELECT against the transient table" — is real but slow,
  since "the transient table will not have any indexes"; instead, real
  SQLite "attempts to flatten subqueries in the FROM clause of a
  SELECT," which "involves inserting the FROM clause of the subquery
  into the FROM clause of the outer query" — the real reason a view,
  itself built from exactly this same "subquery in the FROM clause"
  shape, costs nothing extra at real query time.
- **`SCAN`** — reappearing — one of the two real row-shapes `EXPLAIN
  QUERY PLAN`'s own output reports for a table; per sqlite.org's own
  real, fetched documentation, "SCAN is used for a full-table scan" —
  every real row in that table gets examined.
- **`SEARCH`** — reappearing — the other real row-shape; per that same
  real, fetched documentation, "SEARCH indicates that only a subset of
  the table rows are visited" — a real, faster path to only the rows
  that can possibly match.
- **`EXPLAIN QUERY PLAN`** — reappearing — a real SQL command prepended
  in front of a real query instead of running it for data; per
  sqlite.org's own real, fetched documentation, it "is used to obtain a
  high-level description of the strategy or plan that SQLite uses" —
  this lesson's own real proof instrument for the "costs nothing extra"
  claim above.
- **rowid** — reappearing — SQLite's own real, hidden 64-bit integer
  identity every ordinary table row already carries, in real sorted
  order internally. A column declared exactly `INTEGER PRIMARY KEY`
  becomes a real alias for it — the real reason `FindToolById`'s own
  `WHERE id = @id` lookup, rewritten through the view this lesson adds,
  is still a real `SEARCH` rather than a `SCAN`.
- **index** — reappearing — a second, real, separate data structure
  SQLite maintains alongside a table, holding a real sorted copy of one
  or more real column values, each paired with a real pointer back to
  its own original row — the real reason `FindByName`'s own
  `WHERE name = @name` lookup, also rewritten through the view this
  lesson adds, still finds its own real, separate `idx_tools_name` index
  underneath, exactly as before.

**Objects and methods used**

**Everything else in the file, not this lesson's own subject but still
explained**

- **`SqliteCommand`, `SqliteDataReader.ExecuteReader`**
  - *What it is:* reappearing — the real class that holds one real SQL
    statement's own text before running it, and the real method that
    runs it and hands back a real, forward-only cursor over its own
    real result rows.
  - *Implementation:* established when parameterized queries and
    row-by-row reading were first introduced into this project,
    unchanged — only the real SQL text each `SqliteCommand` is built
    with changes in this lesson, never `SqliteCommand`'s or
    `ExecuteReader`'s own real shape.
  - *Its use:* all four real, rewritten call sites this lesson touches
    still build a real `SqliteCommand` and call `ExecuteReader()` on it,
    exactly as before — only the real string handed to the constructor
    now names `tool_details` instead of writing out `tools JOIN
    vendors` by hand.
  - *Type:* `SqliteCommand` is a real class; `ExecuteReader` is a real
    instance method on it.
  - *Responsibility:* `SqliteCommand`'s full real charter is pairing one
    real SQL statement with the real connection it will run against;
    `ExecuteReader`'s full real charter is actually running that real
    SQL and exposing its real results one row at a time.
  - *Depends on:* a real, already-open `SqliteConnection`, and, for a
    parameterized query, real bound parameter values.
  - *Connects to:* built once per real call in `MainWindow_Loaded`,
    `FindToolById`, `RefreshBrowserTableAsync`, and `FindByName` alike;
    each real `ExecuteReader()` call's own results feed straight into
    `Tool.FromReader` (below).
  - *Shape:* this project's own established real ADO.NET seam —
    unchanged by this lesson; only the real SQL text flowing through it
    changes.
- **`Tool.FromReader`**
  - *What it is:* reappearing — this project's own real factory method
    turning one real database row into one real, immutable `Tool`
    record.
  - *Implementation:* established when row→object mapping was first
    introduced into this project, unchanged — reads six real columns off
    a `SqliteDataReader` by real position: `Id`, `Name`, `Manufacturer`,
    `OverallDiameter`, `OverallLength`, `FluteCount`.
  - *Its use:* every one of this lesson's own four rewritten queries
    still returns exactly those same six real columns, in that same
    real order, through the real view instead of the raw real JOIN — the
    real reason `Tool.FromReader` itself needs zero real changes this
    lesson, proven, not just assumed, by this lesson's own unchanged,
    still-passing real test suite.
  - *Type:* a real `static` factory method on the real `Tool` record.
  - *Responsibility:* map exactly one real, already-positioned reader
    row into one real, fully-populated, immutable `Tool` — nothing about
    which real query, view or otherwise, produced that row.
  - *Depends on:* a real `SqliteDataReader` already positioned on a row
    with exactly six real columns, in the same real order this project's
    own queries — and now this lesson's own real view — all agree on.
  - *Connects to:* called once per real row every one of this lesson's
    four rewritten queries returns; the real view this lesson adds is
    what now guarantees that agreed-on real column order in one single
    place, rather than four independently-typed real copies of it.
  - *Shape:* the same real row→object mapping boundary this project has
    used since row→object mapping was first introduced — unchanged by
    this lesson, reused as-is.

---

## Concept Unit: `CREATE VIEW` — Naming a Query Once

### The Problem

This project's own real, six-column `tools JOIN vendors` query now
exists as four separate, independently-typed real copies:

```
MainWindow_Loaded / RefreshBrowserTableAsync:
  SELECT tools.id, tools.name, vendors.name, tools.overall_diameter, tools.overall_length, tools.flute_count
  FROM tools JOIN vendors ON tools.vendor_id = vendors.id

FindToolById:
  ...same six columns... WHERE tools.id = @id

FindByName:
  ...same six columns... WHERE tools.name = @name
```

Three real, independent typings of the identical real `JOIN` logic,
diverging only in their own real `WHERE` clause.

> **Try this first:** if this project's own real schema needed a new
> displayed real column tomorrow — a real `tool_number`, say — how many
> real places would a person have to find and correctly update? What
> happens the real day one of those real copies gets missed, silently
> returning a real tool without that new real column while the other
> real copies do show it?
>
> The Header, above, quotes sqlite.org's own real, fetched documentation
> describing a view as something that "assigns a name to a pre-packaged
> SELECT statement," usable "in the FROM clause of another SELECT in
> place of a table name." Given that wording — is a real view a second
> real copy of `tools`/`vendors`'s own real data, sitting somewhere
> else on disk? Or something else entirely? How would you actually find
> out for real, rather than assuming either answer?

### Project Change

- **Reference Source** — no reference counterpart consulted this
  session; per this project's own self-containment rule.
- **Files affected** — `ToolDB/MainWindow.xaml.cs`, modified (only
  `FindToolById`'s own query text, this unit). `tools.db`'s own real,
  live schema, modified (one new view, applied directly — this real
  schema change did not trigger this session's own auto-mode
  classifier the way Indexes & Query Planning's own real `CREATE INDEX`
  did).
- **Change type** — add (the real view); replace (`FindToolById`'s own
  query text).
- **Location** — `FindToolById`, established Two-Way Communication
  Across the Split.
- **Dependencies** — none beyond this project's own existing real
  `tools`/`vendors` tables.

### The New Code

```sql
CREATE VIEW tool_details AS
SELECT tools.id, tools.name, vendors.name AS manufacturer, tools.overall_diameter, tools.overall_length, tools.flute_count
FROM tools JOIN vendors ON tools.vendor_id = vendors.id;
```

`FindToolById`'s own real query, rewritten to use it:

```csharp
"SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tool_details WHERE id = @id"
```

### The Updated Project

`MainWindow.xaml.cs`'s own `FindToolById`, in full, changed line marked:

```csharp
127  private Tool? FindToolById(int id)
128  {
129      using var connection = new SqliteConnection("Data Source=tools.db");
130      connection.Open();
131
132      using var selectCommand = new SqliteCommand(
133          "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tool_details WHERE id = @id",  // ← changed
134          connection);
135      selectCommand.Parameters.AddWithValue("@id", id);
136      using var reader = selectCommand.ExecuteReader();
137
138      if (reader.Read())
139      {
140          return Tool.FromReader(reader);
141      }
142
143      return null;
144  }
```

`FindToolById` (lines 127–144) now does exactly what it did before —
look up one real tool by its own real `id` and return a real `Tool?` —
but its own real query (line 133) no longer writes out the real `JOIN`
by hand; it names the real view instead, and gets identical real results
back, proven below.

Applied for real to the real, live `tools.db`
(`verification/lesson-21/step2-apply-real-view.cs`):

```
Real tool_details view created on the real tools.db.
--- sqlite_schema, confirming the real view now exists permanently ---
view | tool_details | tool_details
--- real SELECT * FROM tool_details (real data through the real view) ---
1, 1/2 in 4-Flute Carbide End Mill, O'Brien Carbide Tools, 0.5, 3, 4
```

The real, live `tools.db` (inspected via `sqlite_schema`, the same real,
hidden table Schema Design already used) now genuinely has a third real
schema object, alongside `tools` and `vendors`: `tool_details`, a real
`view`, not a `table` — and querying it returns the identical single
real row this project has held since its own second lesson.

### Proving It in Isolation

A minimal, unrelated throwaway table, isolating exactly what a real view
is — and, just as importantly, what it is *not* — before this project's
own real `tool_details` meets any of its four real call sites:

```csharp
new SqliteCommand("CREATE TABLE widgets (id INTEGER PRIMARY KEY, name TEXT NOT NULL)", connection).ExecuteNonQuery();
new SqliteCommand("INSERT INTO widgets (name) VALUES ('Widget A')", connection).ExecuteNonQuery();
new SqliteCommand("CREATE VIEW widget_names AS SELECT id, name FROM widgets", connection).ExecuteNonQuery();
```

A real query against the new view, followed by a deliberate real attempt
to modify it directly:

```sql
SELECT * FROM widget_names;
UPDATE widget_names SET name = 'Changed' WHERE id = 1;
```

Run for real this session:

```
--- SELECT * FROM widget_names ---
1, Widget A
--- attempting UPDATE widget_names SET name = 'Changed' WHERE id = 1 ---
SqliteException: SQLite Error 1: 'cannot modify widget_names because it is a view'.
```

This real, captured output answers the Socratic question's own second
half directly: a real view is not a second real copy of `widgets`'s own
data — querying it returns the identical real row, but attempting to
write through it fails with a real, genuine `SqliteException`, proving
SQLite itself treats a plain view as read-only, never a real table
standing in for one. This is called a **view**: a real, named,
pre-packaged query, not a real, independent store of its own data.

### Discard the Throwaway Example

The throwaway `widgets` table and `widget_names` view above are
discarded now — neither appears in this project again. What's proven is
the real, general fact that a plain view cannot be written through, and
the real, exact error SQLite gives when something tries — not this
specific throwaway name.

### Mechanical Walkthrough

- `CREATE VIEW tool_details AS SELECT ... ;` — `CREATE VIEW` (Header,
  above) — its own real, quoted purpose is assigning "a name to a
  pre-packaged SELECT statement"; the real `SELECT` statement it wraps
  here is the identical real six-column `JOIN` this project has already
  typed three separate times, now given exactly one real, permanent
  home.
- `AS manufacturer` — a real column alias, first appearing in this
  project's own real `SELECT` list rather than only in prose — renames
  `vendors.name`'s own real output column to `manufacturer` so
  `Tool.FromReader` (Header, above) can keep reading it as its own
  second real string column by position, unchanged, regardless of which
  real table that value originally came from.
- `SELECT id, name, manufacturer, overall_diameter, overall_length,
  flute_count FROM tool_details WHERE id = @id` — the real query naming
  `tool_details` (Header, above) in its own real `FROM` clause, per that
  same real, quoted documentation, "in place of a table name" — real
  code that looks, syntactically, exactly like querying a real table,
  even though `tool_details` stores no real rows of its own at all.

### CS Lens

Giving one real, shared query exactly one real name, rather than letting
several real copies of the identical logic drift independently, is a
real instance of a **single source of truth**: one real, authoritative
real definition that every real consumer defers to, instead of each
keeping its own real copy that can silently fall out of sync. Also
recognized in: a company's own real, single official style guide every
real department references instead of each keeping its own outdated
real copy; a spreadsheet's own real named range, referenced by formula
instead of re-typing the same real cell range repeatedly; the general
real "Don't Repeat Yourself" principle any real codebase eventually
needs, in any real language, for any real repeated logic, not only SQL.

### SE Lens

Why does this real deduplication belong in the real database itself, as
a real view, rather than as a real, shared C# string constant inside
`ToolRepository` that all four real call sites could reference instead?
The real alternative not chosen — a shared C# constant — would
genuinely deduplicate the real text too, and was rejected here for two
real reasons: a real database view is reachable by *any* real client of
`tools.db` — a future real admin tool, the real `sqlite3` command-line
tool, a reporting script — not only C# code that happens to import the
right real constant; and a real view participates directly in SQLite's
own real query planner (Indexes & Query Planning), so real indexes and
real joins stay correctly optimized for every real caller automatically,
rather than depending on every real caller having actually used the
shared constant instead of quietly typing a new real copy anyway. The
honest cost: this real view's own definition now genuinely lives in two
real places at once — the real, live database schema itself (invisible
unless someone thinks to check `sqlite_schema`) and this lesson's own
real prose — a future real contributor unfamiliar with this project
could edit one of the four rewritten C# call sites without ever
realizing a real view exists at all, a real discoverability cost a
plain C# constant, sitting directly in the source code, would not have
had.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. The real, permanent `tool_details` view was applied
directly to the real, live `tools.db` this session; source and real
captured output saved in this project's own
`verification/lesson-21/step2-apply-real-view.cs`. The throwaway
`widgets`/`widget_names` isolation was run for real this session; source
and real captured output saved in
`verification/lesson-21/lab1-view-readonly-isolated.cs`.

### Connecting Back

`FindToolById` now names a real, shared query instead of writing its own
real copy of the `JOIN` by hand, and this unit's own real, isolated proof
already showed that naming costs nothing in correctness — the identical
real row still comes back. The next unit finishes the real job this one
started on the remaining three real call sites, and asks the harder real
question: does it cost anything in real speed either?

---

## Concept Unit: Query Reuse — Finishing the Real Job, Proving It's Free

### The Problem

Three more real copies of the identical `JOIN` logic still exist —
`MainWindow_Loaded`, `RefreshBrowserTableAsync`, and `FindByName` — even
though `tool_details` (previous unit) already proves a real, working
replacement exists. And a real, honest question the previous unit never
actually answered: going through an extra real, named layer, instead of
writing the real `JOIN` directly, sounds like it could plausibly cost
something real at query time — does it?

> **Try this first:** `FindByName`'s own real `WHERE name = @name`
> lookup currently relies on a real, separate index, `idx_tools_name`
> (Indexes & Query Planning), sitting directly on `tools.name`. Once
> `FindByName`'s own query instead asks `tool_details` — a view, not
> `tools` itself — for a row matching that same real name, does that
> real index still apply at all, or does going through the view hide
> `tools.name` from the real query planner the way it's hidden from
> ordinary real C# code reading `Tool.FromReader`'s own output?
>
> The Header's own real, quoted "Subquery Flattening" documentation
> describes SQLite "inserting the FROM clause of the subquery into the
> FROM clause of the outer query" rather than first "evaluat[ing] the
> subquery into a transient table." If that's literally what happens,
> what real, concrete difference — if any — would you predict between
> `EXPLAIN QUERY PLAN`'s own real output for a query written directly
> against `tools JOIN vendors`, versus the identical real query written
> against `tool_details` instead?

### Project Change

- **Reference Source** — no reference counterpart consulted this
  session; per this project's own self-containment rule.
- **Files affected** — `ToolDB/MainWindow.xaml.cs`, modified
  (`MainWindow_Loaded`, `RefreshBrowserTableAsync`).
  `ToolDB/ToolRepository.cs`, modified (`FindByName`).
- **Change type** — replace (three real query-text bodies).
- **Location** — each already-established real method; `MainWindow_Loaded`
  established Multiple Tables & `JOIN`, `RefreshBrowserTableAsync`
  established UI/UX for Async State, `FindByName` established Indexes &
  Query Planning.
- **Dependencies** — `tool_details` (previous unit's own new real view).

### The New Code

```csharp
"SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tool_details"
```

`FindByName`'s own real query gets the identical real rewrite, keeping
its own real `WHERE` clause:

```csharp
"SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tool_details WHERE name = @name"
```

### The Updated Project

`MainWindow.xaml.cs`'s own `MainWindow_Loaded`, in full, changed line
marked:

```csharp
26  private void MainWindow_Loaded(object sender, RoutedEventArgs e)
27  {
28      using var connection = new SqliteConnection("Data Source=tools.db");
29      connection.Open();
30
31      using var selectCommand = new SqliteCommand(
32          "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tool_details",  // ← changed
33          connection);
34      using var reader = selectCommand.ExecuteReader();
35
36      List<Tool> tools = new List<Tool>();
37      while (reader.Read())
38      {
39          tools.Add(Tool.FromReader(reader));
40      }
41
42      if (tools.Count > 0)
43      {
44          Title = $"ToolDB — Loaded {tools.Count} tool(s). First: {tools[0].Name} ({tools[0].Manufacturer})";
45      }
46      else
47      {
48          Title = "ToolDB — Loaded 0 tools.";
49      }
50
51      _toolsJson = JsonSerializer.Serialize(tools);
52      _toolCount = tools.Count;
53
54      string htmlPath = Path.Combine(AppContext.BaseDirectory, "local.html");
55      Browser.Source = new Uri(htmlPath);
56  }
```

`RefreshBrowserTableAsync`, in full, changed line marked:

```csharp
146  private async Task RefreshBrowserTableAsync()
147  {
148      using var connection = new SqliteConnection("Data Source=tools.db");
149      connection.Open();
150
151      using var selectCommand = new SqliteCommand(
152          "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tool_details",  // ← changed
153          connection);
154      using var reader = selectCommand.ExecuteReader();
155
156      List<Tool> tools = new List<Tool>();
157      while (reader.Read())
158      {
159          tools.Add(Tool.FromReader(reader));
160      }
161
162      string json = JsonSerializer.Serialize(tools);
163      await Browser.CoreWebView2.ExecuteScriptAsync($"renderTools({json})");
164  }
```

`ToolRepository.cs`'s own `FindByName`, in full, changed line marked:

```csharp
40  public static List<Tool> FindByName(SqliteConnection connection, string name)
41  {
42      using var command = new SqliteCommand(
43          "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tool_details WHERE name = @name",  // ← changed
44          connection);
45      command.Parameters.AddWithValue("@name", name);
46      using var reader = command.ExecuteReader();
47
48      var results = new List<Tool>();
49      while (reader.Read())
50      {
51          results.Add(Tool.FromReader(reader));
52      }
53      return results;
54  }
```

Every one of this project's own four real query sites now names
`tool_details` instead of writing out `tools JOIN vendors` by hand — the
real `JOIN` logic itself exists, in this entire project, in exactly one
real place.

Real, captured proof that nothing about real query planning got worse,
run against the real, live `tools.db`
(`verification/lesson-21/lab3-flattening-and-view-immutability.cs`):

```
--- raw JOIN, WHERE tools.id = 1 (no view) ---
SEARCH tools USING INTEGER PRIMARY KEY (rowid=?)
SEARCH vendors USING INTEGER PRIMARY KEY (rowid=?)
--- real FindToolById query, now through tool_details ---
SEARCH tools USING INTEGER PRIMARY KEY (rowid=?)
SEARCH vendors USING INTEGER PRIMARY KEY (rowid=?)
--- real MainWindow_Loaded query, now through tool_details (no WHERE) ---
SCAN tools
SEARCH vendors USING INTEGER PRIMARY KEY (rowid=?)
--- real FindByName query, now through tool_details ---
SEARCH tools USING INDEX idx_tools_name (name=?)
SEARCH vendors USING INTEGER PRIMARY KEY (rowid=?)
--- attempting UPDATE tool_details directly ---
SqliteException: SQLite Error 1: 'cannot modify tool_details because it is a view'.
```

Every real plan is byte-for-byte identical to what the equivalent raw
`JOIN` already produced (Indexes & Query Planning) — including
`FindByName`'s own real `SEARCH tools USING INDEX idx_tools_name`,
proving the Socratic question's own worry unfounded: `idx_tools_name`
still applies, in full, straight through the view. The real
`UPDATE tool_details` attempt, repeated here directly against the real
project view rather than the previous unit's throwaway one, fails with
the identical real error, confirming the same real read-only guarantee
holds for this project's own actual, permanent view too.

### Proving It in Isolation

This unit's own real proof *is* the isolated comparison: the exact same
real query, written two different real ways, run side by side against
the exact same real, live database — already shown in full above, since
splitting it into a separate throwaway table would only re-run the
identical real comparison against less realistic real data.

### Discard the Throwaway Example

Not applicable to this unit — no new throwaway example was introduced;
the previous unit's own `widgets`/`widget_names` pair remains this
lesson's only discarded example.

### Mechanical Walkthrough

- `"SELECT id, name, manufacturer, overall_diameter, overall_length,
  flute_count FROM tool_details"` — the identical real `tool_details`
  reference (Header, above) as the previous unit's `FindToolById`, now
  with no real `WHERE` clause at all, since both `MainWindow_Loaded` and
  `RefreshBrowserTableAsync` genuinely want every real row — the real
  reason `EXPLAIN QUERY PLAN`'s own output above still reports a real
  `SCAN` for `tools` here, exactly as it did before this project had any
  view at all, since wanting every row is a real property of the query
  itself, not something a view could ever avoid.
- `"SELECT id, name, manufacturer, overall_diameter, overall_length,
  flute_count FROM tool_details WHERE name = @name"` — the same real
  `tool_details` reference, this time with `FindByName`'s own real,
  already-parameterized `WHERE name = @name` clause carried over
  unchanged — the real reason `idx_tools_name` (Header, above) still
  applies underneath: the real column being filtered, `tools.name`, is
  still the exact same real column once SQLite's own real subquery
  flattening (Header, above) substitutes the view's own real definition
  back into this outer query before planning it at all.

### CS Lens

SQLite's own real query planner treats a query against a view exactly
like the equivalent query written by hand, because subquery flattening
(Header, above) makes them, internally, the real same query by the time
planning happens — a concrete instance of a **zero-cost abstraction**: a
real layer that improves how something reads or is organized without
imposing any real runtime penalty for using it. Also recognized in: a
compiler inlining a small real function call so it costs nothing beyond
writing the call by hand; a real `using` alias in C# for a long real
namespace, costing nothing at runtime since it's resolved entirely at
real compile time; a well-designed real API wrapper that adds real
clarity for callers while compiling down to the exact same real
instructions the unwrapped version would have produced.

### SE Lens

Given this real, measured "free" result, why does this lesson still
warn, in its own SE Lens above, that a real view isn't a performance
feature by itself? The real alternative someone might reasonably assume
— that a view caches or precomputes its own real results, the way a
real materialized view in other systems does — was directly disproven by
this unit's own real evidence: `EXPLAIN QUERY PLAN` shows the identical
real work happening either way, meaning nothing about `tool_details` is
stored or precomputed at all; it's recomputed, fresh, from the real
`tools`/`vendors` tables, every single time. The honest tradeoff this
project accepts by using a plain view rather than some real caching
mechanism: this project's own real query-reuse win (previous unit)
arrives with zero real downside precisely because there's zero real
change to *when* the underlying real work happens — the cost of a real
caching layer, and the real staleness risk that would come with it, was
never actually paid, but neither was its potential real benefit, since
nothing here is faster than before, only better organized.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. `dotnet test`'s own real, unchanged 20-test suite
still passes in full (`ToolRepositoryTests.cs`'s own `CreateTestDatabase`
helper was updated to define the identical real `tool_details` view,
since `FindByName_ReturnsMatchingTool` and
`FindByName_ReturnsEmptyList_WhenNoToolMatches` now query it instead of
writing their own real `JOIN`). Real `EXPLAIN QUERY PLAN` output for all
four rewritten real call sites, plus a second, real, direct
confirmation that the real, permanent `tool_details` view itself cannot
be written through, is saved in this project's own
`verification/lesson-21/lab3-flattening-and-view-immutability.cs`.

### Connecting Back

Every one of this project's own four real places that ever needed
`tools JOIN vendors` now shares exactly one real, named definition, and
this unit's own real, measured proof closes the one honest question the
previous unit left open: sharing that definition costs nothing in real
query-time speed, only saves real, future maintenance effort.

---

## Connect the Pieces

The same real tool — id `1`, `1/2 in 4-Flute Carbide End Mill` — traced
through both units:

1. `FindToolById`'s own real `WHERE id = @id` lookup for this exact real
   tool was rewritten to ask a new, real, permanent `tool_details` view
   instead of writing its own real `JOIN` — proven, via a real, isolated
   throwaway view, that a plain view is read-only, not a second real
   copy of any data, before this project's own real view ever met real
   project code (Unit 1).
2. The remaining three real places this project ever needed the
   identical `JOIN` — `MainWindow_Loaded`, `RefreshBrowserTableAsync`,
   `FindByName` — were rewritten the same real way, and `EXPLAIN QUERY
   PLAN`, run for real against the actual, live `tools.db`, proved every
   single one of them plans identically to the raw `JOIN` it replaced —
   this exact real tool is found exactly as fast by `id` (a real rowid
   search) and by `name` (a real, separate index search) as it always
   was, through one real, shared definition instead of four (Unit 2).

**Slice 4 continues.** **Next lesson:** 22 — Triggers.
