# Lesson 23: When a Column Needs More Than One Shape (JSON Functions)

**What you will build.** A new, real, permanent `tags` column on `tools`,
holding a real JSON array of strings (backfilled for this project's own
one real existing row, `["carbide","4-flute","end-mill"]`), plus a new,
real `ToolRepository.FindByTag` method that searches inside it using
`json_each` — a real, table-valued SQL function — reused alongside
`tool_details`, this project's own already-established real view. The
transferable problem underneath the feature: an ordinary relational
column holds exactly one real, fixed-shape value per row; a genuinely
open-ended, variable-length real collection — a tool's own set of tags,
which could be zero, one, or a dozen — doesn't fit that shape cleanly
without either a whole new normalized real table or a wasteful, fixed
number of real columns. SQLite's own real, built-in JSON1 extension lets
one real column hold that flexible real collection instead, while
staying genuinely queryable, real SQL.

**What you need to know first.** Schema Design — the real
`ALTER TABLE`/backfill pattern this lesson reuses to add the new column.
Multiple Tables & `JOIN` — the fully-normalized alternative this lesson's
own SE Lens weighs this new column against. Views — `tool_details`,
reused directly inside this lesson's own new query. Indexes & Query
Planning — `EXPLAIN QUERY PLAN`, and the real `SCAN`/`SEARCH` vocabulary
this lesson extends with a genuinely new real plan-row kind.

**Terms used in this lesson**

- **JSON1** — SQLite's own real, built-in extension for working with
  JSON values directly in SQL — no separate library, no C#-side parsing
  needed. Per sqlite.org's own real, fetched documentation
  (`json1.html`), "By default, SQLite supports thirty functions and two
  operators for dealing with JSON values."
- **semi-structured data** — real data whose own shape genuinely varies,
  row to row, rather than being fixed in advance the way `tools`'s own
  other seven real columns each are. A tool's own real tag list is a
  concrete instance: one real tool might have zero tags, another five,
  and the exact real count is never known in advance.
- **`json_valid`** — a real JSON1 function. Per that same real, fetched
  documentation, "The json_valid(X,Y) function returns 1 if the argument
  X is well-formed JSON, or returns 0 if X is not well-formed" — a real,
  direct way to check a stored real string is genuinely trustworthy JSON
  before relying on any other real JSON1 function to read it.
- **`json_array_length`** — a real JSON1 function. Per that same real,
  fetched documentation, it "returns the number of elements in the JSON
  array X, or 0 if X is some kind of JSON value other than an array."
- **table-valued function** — a real, distinct category of SQL function:
  one usable directly inside a `FROM` clause, returning a whole real set
  of rows rather than one real scalar value per call — genuinely
  different from every real function this project has used so far
  (`json_valid`, `json_array_length`, `CURRENT_TIMESTAMP`, all of which
  return exactly one real value).
- **`json_each`** — a real, specific table-valued function. Per that
  same real, fetched documentation, "json_each(X)... table-valued
  function... walk[s] the JSON value provided as their first argument
  and return[s] one row for each element" — the real mechanism this
  lesson's own second unit uses to make each real tag individually
  visible to a `WHERE` clause.
- **`VIRTUAL TABLE`** — reappearing, extended — a real annotation
  `EXPLAIN QUERY PLAN`'s own output can report alongside `SCAN`/`SEARCH`,
  naming a real result set that isn't an ordinary stored table at all —
  this lesson's own first real appearance of a plan row describing
  something other than `tools` or `vendors` directly.

**Objects and methods used**

- **`ToolRepository.FindByTag`**
  - *What it is:* a new, real `static` method on this project's own
    `ToolRepository` class, searching `tools` by a single real tag
    inside its own `tags` column and returning every real match.
  - *Implementation:* `public static List<Tool> FindByTag(SqliteConnection
    connection, string tag)` — takes an already-open real connection (no
    transaction, matching `FindByName`'s own real read-only shape) and a
    real `string` to match against one real element of `tags`'s own real
    JSON array; returns a real, possibly-empty `List<Tool>`.
  - *Its use:* the real, concrete vehicle for this lesson's own second
    unit — proving a real value stored inside a JSON column can be
    searched with genuine SQL, not just read back whole into C#.
  - *Type:* a `static` method — no instance, no state of its own,
    matching every other real method already on this class.
  - *Responsibility:* accept a real connection and a real tag string,
    run one real query joining `tool_details` against `json_each`'s own
    real per-tag rows, and hand back every real matching tool as a real,
    fully-populated `Tool` — nothing more.
  - *Depends on:* an already-open `SqliteConnection`; `tool_details`
    (Views); `tools.tags` actually containing real, well-formed JSON.
  - *Connects to:* called by whatever real code needs to look up tools
    by a real tag rather than an `id` or a `name` — no real caller exists
    in this project yet, proven correct instead by this lesson's own two
    new, real, permanent tests.
  - *Shape:* part of this project's own real persistence-layer API
    surface (`ToolRepository`), the same real seam `FindByName` already
    established.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`SqliteCommand`, `SqliteDataReader.ExecuteReader`, `Tool.FromReader`**
  - *What it is:* reappearing — the real class that holds one real SQL
    statement before running it, the real method that runs it and hands
    back a real, forward-only cursor, and this project's own real
    factory method turning one real row into one real, immutable `Tool`.
  - *Implementation:* established when parameterized queries,
    row-by-row reading, and row→object mapping were each first
    introduced into this project, unchanged by this lesson.
  - *Its use:* `FindByTag`'s own real body uses all three exactly the
    same real way `FindByName` already does — only the real SQL text,
    and the real table-valued function it now joins against, is new.
  - *Type:* `SqliteCommand` and `ExecuteReader` are real ADO.NET class/
    method; `Tool.FromReader` is a real, project-authored `static`
    factory method.
  - *Responsibility:* unchanged from every earlier real appearance —
    pairing SQL with a connection, streaming real rows back one at a
    time, and mapping each real row into a real `Tool`.
  - *Depends on:* a real, already-open `SqliteConnection`; `Tool
    .FromReader` depends on a reader positioned on a row with exactly six
    real columns, in the same real order this project's own queries —
    `tool_details` included — all agree on.
  - *Connects to:* built once per real `FindByTag` call; each real row
    `ExecuteReader` yields is mapped by `Tool.FromReader` and appended
    into the real list `FindByTag` returns.
  - *Shape:* the same real ADO.NET/mapping seam this project has used
    since its own earliest queries — unchanged by this lesson.

---

## Concept Unit: Storing a Real, Flexible Collection in One Column

### The Problem

None of `tools`'s own seven real columns — `id`, `name`, `vendor_id`,
`overall_diameter`, `overall_length`, `flute_count`, `last_modified` —
could hold something like "this tool has these three tags: carbide,
finishing, 4-flute" without a real, different shape entirely. A real,
fully-normalized answer already exists in this project's own real
conventions — `vendors`, joined by a real foreign key — but a tool's own
real tag list is different in an important way: it's genuinely
open-ended, could be zero real tags or a dozen, and this project has no
real current need to query, sort, or join on tags the heavyweight
relational way `vendors` requires.

> **Try this first:** given this project's own already-established real
> pattern for a one-to-many relationship — a brand-new `vendors`-style
> table, plus a real join table connecting it to `tools` — how many new
> real tables and columns would a fully-normalized "tags" feature
> require? Given a tool's own real tag list is genuinely variable-length,
> is that real weight justified for a feature this project doesn't yet
> need to join or index the relational way — or is there a real, lighter
> alternative?

### Project Change

- **Reference Source** — no reference counterpart consulted this
  session; per this project's own self-containment rule.
- **Files affected** — `tools.db`'s own real, live schema, modified (one
  new column, backfilled once — the same real one-time-schema-change
  pattern already used for this project's own real index, view, and
  trigger).
- **Change type** — add.
- **Location** — `tools.db`'s own real schema, alongside its existing
  real columns.
- **Dependencies** — none beyond this project's own existing real
  `tools` table.

### The New Code

```sql
ALTER TABLE tools ADD COLUMN tags TEXT;
```

The one real, existing row backfilled with a real value directly derived
from its own already-known real name:

```sql
UPDATE tools SET tags = '["carbide","4-flute","end-mill"]' WHERE id = 1;
```

### The Updated Project

Applied directly to the real, live `tools.db` this session
(`verification/lesson-23/step2-apply-real-tags-column.cs`):

```
Real tags column + backfill applied to the real tools.db.
--- real tools row, with its own real tags ---
1, 1/2 in 4-Flute Carbide End Mill, ["carbide","4-flute","end-mill"], valid=1
```

`tools.db`'s own real, live schema now has an eighth real column,
`tags`, and its own one real existing row already carries a real,
well-formed JSON array — confirmed directly by `json_valid` (Header,
above) returning a real `1`, not merely assumed from the fact that the
`UPDATE` statement itself didn't fail.

### Proving It in Isolation

A minimal, unrelated throwaway table, isolating exactly what a JSON
column actually is — and how to check it's trustworthy — before this
project's own real `tags` column meets any real query:

```csharp
new SqliteCommand("CREATE TABLE widgets (id INTEGER PRIMARY KEY, name TEXT NOT NULL, tags TEXT)", connection).ExecuteNonQuery();
new SqliteCommand("INSERT INTO widgets (name, tags) VALUES ('Widget A', '[\"red\",\"small\"]')", connection).ExecuteNonQuery();
```

Real `json_valid`/`json_array_length` calls against both a genuinely
well-formed value and a deliberately broken one:

```sql
SELECT json_valid('["red","small"]'), json_valid('not json');
SELECT json_array_length('["red","small"]');
```

Run for real this session:

```
--- json_valid tests ---
valid array: 1, invalid text: 0
--- json_array_length ---
2
```

This real, captured output proves both real functions (Header, above)
behave exactly as documented: a genuinely well-formed real array reports
`1` and a real length of `2`; a plain, non-JSON real string reports `0`,
with no real exception thrown at all — `json_valid` is meant to be
checked, not relied on to fail loudly.

### Discard the Throwaway Example

The throwaway `widgets` table above is discarded now — it never appears
in this project again. What's proven is that `json_valid` and
`json_array_length` behave exactly as documented against both genuinely
valid and genuinely broken real input — not this specific throwaway row.

### Mechanical Walkthrough

- `ALTER TABLE tools ADD COLUMN tags TEXT;` — `ALTER TABLE` (established
  when this project first added a foreign-key column), reappearing —
  adds a real, nullable column; unlike `last_modified`, this one is
  never given a real default at all, since this lesson's own backfill
  supplies a real, specific value directly rather than a generic one.
- `UPDATE tools SET tags = '["carbide","4-flute","end-mill"]' WHERE id =
  1;` — a real, one-time backfill `UPDATE` (established when this
  project first needed to populate a newly-added column), reappearing —
  the real JSON text itself is just an ordinary real SQL string literal;
  SQLite does not require or enforce any real JSON-specific column type
  to store it.

### CS Lens

Storing a genuinely variable-shaped real collection inside one ordinary
real text column, deferring any real structural checking until the value
is actually read, is a concrete instance of **semi-structured data**
(Header, above) — sometimes described by the broader real principle
**schema-on-read**: the real shape of the data is validated and
interpreted when queried, rather than rigidly enforced by the real table
definition itself, the way `overall_diameter`'s own real `CHECK`
constraint enforces its shape at write time. Also recognized in: many
real NoSQL document stores, built around this exact real tradeoff from
the ground up; a real spreadsheet cell holding a comma-separated real
list of values; HTML's own real `class="a b c"` attribute, one real
string attribute silently holding several real, space-separated values.

### SE Lens

Why not build a real, fully-normalized `tags`/`tool_tags` junction table
instead — the same real relational shape `vendors` already uses? The
real alternative not chosen was rejected here for two honest reasons:
this project has no real current need to `JOIN`, sort, or index tags the
relational way, so two new real tables would add real structural weight
this feature doesn't yet use; and a tool's own real tag list is
genuinely open-ended in a way `vendors` never was. The honest cost,
stated plainly rather than hidden: nothing in `tools.tags`'s own real
schema enforces spelling — a real typo like `"carbde"` is just an
unvalidated real string sitting inside a real JSON array, never caught
the way a real `FOREIGN KEY` on `vendor_id` would catch an unknown real
vendor — and, as the next unit's own real evidence shows directly, no
real index can accelerate a tag search inside this column the way
`idx_tools_name` accelerates an ordinary column lookup. This project
accepts both real costs deliberately, for a feature genuinely lighter
than full normalization would justify.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. The real, permanent `tags` column was applied
directly to the real, live `tools.db` this session; source and real
captured output saved in
`verification/lesson-23/step2-apply-real-tags-column.cs`. The throwaway
`widgets` isolation was run for real this session; source and real
captured output saved in
`verification/lesson-23/lab1-json-functions-isolated.cs`.

### Connecting Back

`tools.db` can now hold a genuinely flexible real collection per tool,
confirmed real and well-formed by `json_valid`. The next unit makes that
real collection actually searchable through ordinary, real SQL.

---

## Concept Unit: `json_each` — Querying Inside the Column

### The Problem

`tags` now holds a real, well-formed JSON array per tool, but nothing
in real SQL so far can ask "which tools have the tag `finishing`?" —
`json_array_length` (previous unit) only ever answers a single real
number about the whole array, never which specific real values it
contains.

> **Try this first:** every real SQL function this project has used so
> far — `json_valid`, `json_array_length`, `CURRENT_TIMESTAMP`,
> `AddWithValue`'s own real parameter binding — takes real input and
> returns exactly one real value. Given a tool might have any real
> number of tags, could a function shaped like that alone ever let a
> real `WHERE` clause check "does this list contain X"? What would a
> real function need to do differently to make each real array element
> individually visible to SQL, rather than trapped inside one opaque
> real string?

### Project Change

- **Reference Source** — no reference counterpart consulted this
  session; per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolRepository.cs`, modified (new
  method). `ToolDB.Tests/ToolRepositoryTests.cs`, modified
  (`CreateTestDatabase` gains a real `tags` column and a second real
  seeded tool; two new real tests).
- **Change type** — add.
- **Location** — `ToolRepository.cs`, after `FindByName`, established
  Indexes & Query Planning.
- **Dependencies** — `tool_details` (Views); `tools.tags` (previous
  unit).

### The New Code

```csharp
public static List<Tool> FindByTag(SqliteConnection connection, string tag)
{
    using var command = new SqliteCommand(
        "SELECT DISTINCT tool_details.id, tool_details.name, tool_details.manufacturer, tool_details.overall_diameter, tool_details.overall_length, tool_details.flute_count " +
        "FROM tool_details JOIN tools ON tools.id = tool_details.id, json_each(tools.tags) " +
        "WHERE json_each.value = @tag",
        connection);
    command.Parameters.AddWithValue("@tag", tag);
    using var reader = command.ExecuteReader();

    var results = new List<Tool>();
    while (reader.Read())
    {
        results.Add(Tool.FromReader(reader));
    }
    return results;
}
```

### The Updated Project

`ToolRepository.cs`'s own class, new method added directly after
`FindByName`, established Indexes & Query Planning:

```csharp
40  public static List<Tool> FindByName(SqliteConnection connection, string name)
41  {
42      /* unchanged, established Indexes & Query Planning */
54  }
55
56  public static List<Tool> FindByTag(SqliteConnection connection, string tag)              // ← new
57  {                                                                                          // ← new
58      using var command = new SqliteCommand(                                                // ← new
59          "SELECT DISTINCT tool_details.id, tool_details.name, tool_details.manufacturer, tool_details.overall_diameter, tool_details.overall_length, tool_details.flute_count " +  // ← new
60          "FROM tool_details JOIN tools ON tools.id = tool_details.id, json_each(tools.tags) " +  // ← new
61          "WHERE json_each.value = @tag",                                                    // ← new
62          connection);                                                                       // ← new
63      command.Parameters.AddWithValue("@tag", tag);                                          // ← new
64      using var reader = command.ExecuteReader();                                            // ← new
65                                                                                              // ← new
66      var results = new List<Tool>();                                                        // ← new
67      while (reader.Read())                                                                  // ← new
68      {                                                                                        // ← new
69          results.Add(Tool.FromReader(reader));                                               // ← new
70      }                                                                                        // ← new
71      return results;                                                                         // ← new
72  }                                                                                            // ← new
```

`ToolRepository` now offers a real, third way to look up a tool, after
`id` and `name`: by a single real tag, reaching directly into
`tags`'s own real JSON contents through `tool_details` (Views) rather
than duplicating that view's own real `JOIN` logic a second time.

Real, captured proof against the real, live `tools.db`
(`verification/lesson-23/lab3-findbytag-and-plan.cs`):

```
--- real FindByTag('carbide') against the real, live tools.db ---
1, 1/2 in 4-Flute Carbide End Mill, O'Brien Carbide Tools, 0.5, 3, 4
--- real EXPLAIN QUERY PLAN for that same real query ---
SCAN tools
SEARCH vendors USING INTEGER PRIMARY KEY (rowid=?)
SEARCH tools USING INTEGER PRIMARY KEY (rowid=?)
SCAN json_each VIRTUAL TABLE INDEX 1:
```

### Proving It in Isolation

A minimal, unrelated throwaway pair of tools, isolating exactly what
`json_each` does before this project's own real, more complex query
meets it:

```csharp
new SqliteCommand("INSERT INTO tools (name, tags) VALUES ('End Mill', '[\"carbide\",\"finishing\",\"4-flute\"]')", connection).ExecuteNonQuery();
new SqliteCommand("INSERT INTO tools (name, tags) VALUES ('Drill Bit', '[\"hss\",\"roughing\"]')", connection).ExecuteNonQuery();
```

`json_each` used directly inside a real `FROM` clause, alongside `tools`
itself:

```sql
SELECT tools.id, tools.name, value FROM tools, json_each(tools.tags);
```

Run for real this session:

```
1, End Mill, tag=carbide
1, End Mill, tag=finishing
1, End Mill, tag=4-flute
2, Drill Bit, tag=hss
2, Drill Bit, tag=roughing
```

This real, captured output proves the Socratic question's own answer
directly: `json_each(tools.tags)` (Header, above) genuinely produces one
real output row *per array element*, each one carrying its own real
`value` column, rather than one opaque real string per tool — exactly
what a `WHERE value = @tag` clause needs to check each real tag
individually. This is called a **table-valued function** (Header,
above): a real function that returns a whole real result set, usable
directly in a `FROM` clause, standing alongside an ordinary real table.

### Discard the Throwaway Example

The throwaway `End Mill`/`Drill Bit` rows above are discarded now — they
never appear in this project again. What's proven is `json_each`'s own
real, one-row-per-element behavior — not this specific throwaway tag
list.

### Mechanical Walkthrough

- `"...FROM tool_details JOIN tools ON tools.id = tool_details.id,
  json_each(tools.tags) WHERE json_each.value = @tag"` — `tool_details`
  (Views), reappearing, supplies the real, already-deduplicated
  `tools`/`vendors` join; a second real reference to `tools` is joined
  back in, by `id`, purely so `tools.tags` — a real column `tool_details`
  itself never exposes — is reachable at all; `json_each(tools.tags)`
  (Header, above) then walks that real column's own array, one real row
  per tag; `json_each.value` (Header, above) reads each of those real
  rows' own tag string, compared against the real, parameterized `@tag`.
- `SELECT DISTINCT ...` — `DISTINCT` (established when this project
  first needed to remove real duplicate rows from a result), reappearing
  — defensive here: if a real tool's own tags array ever contained the
  identical real tag twice, this real join would otherwise return that
  same real tool once per real duplicate.
- `command.Parameters.AddWithValue("@tag", tag);` — `AddWithValue`
  (established when parameterized queries were first introduced),
  reappearing — binds the real, caller-supplied tag safely, the
  identical real defense every other real parameter in this project
  already receives.

### CS Lens

`json_each` transforms one real, nested value (an array, sitting inside
a single column) into a real, flat set of rows a plain `WHERE` clause can
reason about — a concrete instance of **unnesting**: converting a
hierarchical or nested real structure into a real, flat, tabular one so
ordinary relational operations apply to it directly. Also recognized in:
a spreadsheet's own real "text to columns" feature, splitting one real
cell into several; a real compiler flattening nested real function calls
into a real, linear sequence of instructions before execution; a real
`for`/`for...of` loop in any language, walking a real nested collection
one flat element at a time.

### SE Lens

The real `EXPLAIN QUERY PLAN` output above reports `SCAN json_each
VIRTUAL TABLE INDEX 1:` (Header, above) — a real `SCAN`, not a `SEARCH`
(Indexes & Query Planning). Why does this project accept that, when
`idx_tools_name` already proved a real column search doesn't have to be
a scan? The real alternative — a real index directly on `tools.tags` —
was never seriously available here: SQLite's own ordinary `CREATE INDEX`
indexes a real column's own whole value, never the individual real
elements packed inside a JSON array stored in one. The honest cost,
already flagged in this lesson's own first unit: every real
`FindByTag` call genuinely examines every real tag of every real tool,
proportional to real table size — an accepted real tradeoff for a
feature this project's own current real scale doesn't yet need to
optimize, not a claim that this scales the way `idx_tools_name`'s own
real `SEARCH` does.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. Two new, real, permanent tests were added to
`ToolRepositoryTests.cs` (`FindByTag_ReturnsOnlyTheMatchingTool`,
`FindByTag_ReturnsEmptyList_WhenNoToolHasThatTag`), against a
`CreateTestDatabase` helper now seeding two real tools with two
different real tag sets. Full suite: **24 tests, 0 failures** — the
real, current, full count for this project. Real source and captured
output for the throwaway `json_each` isolation, and for the real,
permanent `FindByTag` query run against the real, live `tools.db`, are
saved in `verification/lesson-23/lab1-json-functions-isolated.cs` and
`lab3-findbytag-and-plan.cs`.

### Connecting Back

`tools.tags`'s own real, flexible JSON contents are now genuinely
searchable through ordinary SQL, reusing `tool_details`'s own real
deduplication rather than writing a fourth real copy of the
`tools`/`vendors` join — with the real, honest cost of that search's own
`SCAN`-shaped cost stated plainly, not hidden.

---

## Connect the Pieces

The same real tool — id `1`, `1/2 in 4-Flute Carbide End Mill` — traced
through both units:

1. Its own real row gained a new, real `tags` column, backfilled with a
   real, well-formed JSON array directly derived from its own already-
   known name — confirmed genuinely valid by `json_valid`, not merely
   assumed, after a real, isolated proof first showed exactly how that
   function reports both well-formed and broken real input (Unit 1).
2. A new, real `ToolRepository.FindByTag` method now finds this exact
   real tool by searching inside that array with `json_each`, reusing
   `tool_details`'s own already-established real `JOIN` rather than
   duplicating it a fourth time — proven against the real, live
   `tools.db` itself, with its own real `EXPLAIN QUERY PLAN` cost stated
   honestly rather than hidden (Unit 2).

**Slice 4 is complete.** **Next lesson:** 24 — What an ORM Is and Isn't
(EF Core, `DbContext`, mapping a table to a class) — the start of
Slice 5.
