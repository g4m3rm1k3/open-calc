# Lesson 27: One Connection, Two Files (Multiple Database Files via `ATTACH DATABASE`)

**What you will build.** A new, real, permanent method,
`ToolRepository.FindAllAcrossDatabases`, that opens a real connection to
this project's own `tools.db`-shaped schema, reaches into a second,
completely separate, real SQLite file, and returns one real, combined
`List<Tool>` drawn from both — proving, for the first time in this
project, that "the database" and "the database file" are not the same
real thing. The transferable problem underneath the feature: every real
query this project has written so far assumes exactly one real file per
connection; a real Mastercam-style shop, this project's own eventual
real target, keeps one real tool-library file per user, and answering
"show me every tool anyone has" means reading more than one real file in
a single real operation.

**What you need to know first.** Multiple Tables & `JOIN` — `tool_details`,
reused, unmodified, against a second real file this lesson attaches.
Never Let Data Become Code — the real parameterized-query discipline this
lesson's own new `ATTACH DATABASE` call reuses for a real file path,
not just an ordinary column value.

**Terms used in this lesson**

- **`ATTACH DATABASE`** — a real, SQLite-specific SQL statement, distinct
  from an ordinary `SELECT`/`INSERT`/`UPDATE`. Per sqlite.org's own real,
  fetched documentation (`sqlite.org/lang_attach.html`), it "adds another
  database file to the current database connection," under a real,
  chosen `schema-name`. It exists so a single real connection — and a
  single real transaction, within real limits this lesson's own second
  unit names — can reach across more than one real, independent database
  file at once.
- **schema-qualified name** — a real, two-part name,
  `schema-name.table-name`, naming a real table inside a specific real
  attached database rather than the connection's own main file. Per that
  same real documentation, "Tables in an attached database can be
  referred to using the syntax *schema-name.table-name*." It exists so a
  real query can unambiguously say *which* real file's own `tools` table
  it means, once more than one is attached.
- **`DETACH DATABASE`** — the real, exact reverse of `ATTACH DATABASE`,
  per that same real documentation: "Database files that were previously
  attached can be removed using the DETACH DATABASE command." It exists
  so a real connection doesn't keep an unneeded real file open, and its
  own real schema-name, indefinitely.
- **`UNION ALL`** — a real, first-appearing SQL operator in this
  curriculum, combining the real result rows of two separate `SELECT`
  statements into one real, single result set, keeping every real row
  from both, including real duplicates. It exists so two real,
  independently-run queries — here, one against each real, attached
  database — can be presented to calling C# code as one real, unified
  list, rather than two separate real ones a caller has to merge by hand.
- **cross-database query** — a real query whose own `FROM` clause names
  tables from more than one real, currently-attached database in the same
  real statement (a plain `JOIN`, or, as this lesson uses, `UNION ALL`).
  It exists as the actual real payoff of `ATTACH DATABASE`: without it,
  attaching a second real file would do nothing a second, separate real
  connection couldn't already do.

**Objects and methods used**

- **`ToolRepository.FindAllAcrossDatabases(SqliteConnection, string)`**
  - *What it is:* a new, real, permanent method on this project's own
    `ToolRepository`, returning every real tool from both the connection's
    own real, main database and one real, named secondary file.
  - *Implementation:* shown in full in this lesson's second unit, below —
    real `ATTACH DATABASE`, a real `UNION ALL` query against both real
    `tool_details` views, and a real `DETACH DATABASE` in a real `finally`
    block.
  - *Its use:* the real, concrete answer to this lesson's own opening
    question — combining two real, independent files' worth of tools into
    one real list.
  - *Type:* a real, `public`, `static` method (established Updating and
    Deleting Safely's own `ToolRepository` shape).
  - *Responsibility:* its full real charter is temporarily attaching one
    real, named secondary database, running one real, combined query
    across both, and guaranteeing the secondary database is detached
    again before returning — success or failure.
  - *Depends on:* an already-open real `SqliteConnection` to the primary
    real database, and a real, valid file path to a second, real SQLite
    file sharing the identical real `tools`/`vendors`/`tool_details` shape.
  - *Connects to:* not yet called from `MainWindow.xaml.cs` — proven
    correct by two new, real, permanent tests only, matching this
    project's own established "prove it works before wiring it into the
    UI" pattern (What an ORM Is and Isn't, Rewriting Your Queries Through
    EF Core).
  - *Shape:* a new, real capability on this project's own existing
    ADO.NET persistence seam — deliberately not built through
    `ToolDbContext`, since EF Core has no real, built-in concept of
    `ATTACH DATABASE` at all; this is real, plain SQL, the same real
    layer `ToolRepository`'s other methods already live in.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`SqliteCommand`, `SqliteParameter`/`AddWithValue`, `ExecuteNonQuery()`,
  `ExecuteReader()`, `Tool.FromReader`**
  - *What it is:* reappearing, unchanged — this project's own real,
    established ADO.NET vocabulary.
  - *Implementation:* unchanged from every earlier real appearance.
  - *Its use:* `FindAllAcrossDatabases`'s own real body uses all of these
    exactly as `ToolRepository`'s other real methods already do — only
    the real SQL text (`ATTACH`/`UNION ALL`/`DETACH`) is new.
  - *Type:* unchanged real ADO.NET classes/methods.
  - *Responsibility:* unchanged.
  - *Depends on:* unchanged — a real, already-open `SqliteConnection`.
  - *Connects to:* unchanged.
  - *Shape:* unchanged — the same real seam this project has used since
    its own first lesson.

---

## Concept Unit: `ATTACH DATABASE` — Reaching a Second Real File

### The Problem

Every real `SqliteConnection` this project has ever opened points at
exactly one real file, named once, in its own real connection string
(Connecting to a Database File). If a second, completely separate, real
tool-library file existed — a real, different user's own `tools.db` —
nothing in this project's own current real code could read from it using
the same real, already-open connection to the first. Could a real
connection, once open, be told to open a *second* real file, without
closing and reopening anything?

> **Try this first:** this project's own real `Data Source=...`
> connection string (established Connecting to a Database File) names
> exactly one real file, once, at connection-open time. Given that a real
> `ATTACH DATABASE` statement is just an ordinary real SQL statement — not
> a special constructor argument — what would you expect to still be true
> about an already-open connection's own original file, immediately after
> a second one is attached to it?

### Introduce the Concept in Isolation

Two small, real, throwaway SQLite files, `attach_a.db`/`attach_b.db`, each
holding one real `widgets` table with one real, different row, built and
attached for real this session:

```csharp
using var connection = new SqliteConnection("Data Source=attach_a.db");
connection.Open();

using var attach = new SqliteCommand("ATTACH DATABASE @path AS other;", connection);
attach.Parameters.AddWithValue("@path", "attach_b.db");
attach.ExecuteNonQuery();
```

Real, captured output, querying the newly-attached real file directly by
its own real, schema-qualified name:

```
--- Lab: parameterized ATTACH DATABASE ---
Parameterized ATTACH succeeded.
1, A-Widget
1, B-Widget
```

This real, captured output proves two things at once: first, that
`attach_a.db`'s own original connection genuinely gained real access to
`attach_b.db`'s own `widgets` table, reachable as `other.widgets`
(schema-qualified name, Terms, above) once attached; second, and
genuinely worth calling out, that `ATTACH DATABASE`'s own filename
expression accepts a real, bound `SqliteParameter` (`@path`) exactly like
an ordinary column value would — this project's own established
parameterization discipline (Never Let Data Become Code) extends here
too, with no special-case string concatenation needed for a real file
path.

### Discard the Throwaway Example

`attach_a.db`/`attach_b.db` are discarded now — they never appear in this
project again. What's proven is that `ATTACH DATABASE` genuinely, safely
reaches a second real file from an already-open connection — not this
specific throwaway pair.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolRepository.cs`, modified (new method,
  begun here, completed in this lesson's second unit).
- **Change type** — add.
- **Location** — `ToolRepository.cs`, after `FindByTag`, established JSON
  Functions in SQLite.
- **Dependencies** — an already-open `SqliteConnection` to a real, primary
  database; a real, valid path to a second, real SQLite file.

### The New Code

```csharp
using (var attach = new SqliteCommand("ATTACH DATABASE @path AS other;", connection))
{
    attach.Parameters.AddWithValue("@path", secondaryPath);
    attach.ExecuteNonQuery();
}
```

### The Updated Project

This fragment is the opening piece of `FindAllAcrossDatabases`'s own real
body — shown whole, with this fragment in place, in this lesson's second
unit, once the rest of the method exists to show it inside. Nothing about
this fragment can run meaningfully on its own yet: attaching a second
real database with no query against it afterward has no observable real
effect.

### Mechanical Walkthrough

- `new SqliteCommand("ATTACH DATABASE @path AS other;", connection)` —
  `SqliteCommand` (established Never Let Data Become Code, reappearing)
  wraps a real SQL statement — here, `ATTACH DATABASE` (Terms, above), a
  real statement form distinct from every real `SELECT`/`INSERT`/`UPDATE`/
  `DELETE` this project has written so far — parameterized identically to
  any of them, with `@path` standing in for the real, second file's own
  path, and `AS other` naming the real schema this second file will be
  reachable under.
- `attach.Parameters.AddWithValue("@path", secondaryPath);` —
  `AddWithValue` (established Never Let Data Become Code, reappearing)
  binds `secondaryPath`'s own real value safely — the identical real
  defense this project's own hand-written SQL has used for every other
  real, caller-supplied value, now proven (Introduce the Concept in
  Isolation, above) to work for a real file path too.
- `attach.ExecuteNonQuery();` — `ExecuteNonQuery` (established Schema
  Design, reappearing) runs the real statement; `ATTACH DATABASE` itself
  returns no real rows, matching every other real, non-`SELECT` statement
  this project has already run this way.

### CS Lens

Attaching a second real file to an already-open connection, rather than
opening a second, wholly independent connection to it, is a concrete
instance of **extending a session's own scope rather than starting a new
one** — the same real idea, at a different real layer, as this project's
own `DbContext` (established What an ORM Is and Isn't) representing one
real, short-lived unit of work rather than a brand-new object per query.
Also recognized in: a real web browser opening a second real tab that
still shares one real, logged-in session's own cookies; a real shell
session's own `source`d script, extending the current real environment
rather than launching a subprocess; a real version-control system's own
"add a second remote," extending one real local repository's own reach
rather than cloning a second, separate copy.

### SE Lens

Why attach a second file to the same connection, rather than simply
opening two separate `SqliteConnection`s — one per file — and combining
their own real results in C#? The real alternative — two connections,
merged in C# — was not chosen here for a real, concrete reason: `UNION
ALL` (this lesson's own next unit) lets the real *database engine itself*
combine both real result sets in one real round trip, rather than this
project's own C# code looping twice and concatenating two real
`List<Tool>`s by hand. The real, honest cost, stated plainly: `ATTACH
DATABASE` has a real, documented limit on how many real databases can be
attached to one real connection at once (`sqlite3_limit()`/
`SQLITE_LIMIT_ATTACHED`, per sqlite.org's own real, fetched
documentation) — a real ceiling this project's own real, eventual
multi-user aggregation (Aggregating Many Users' Files Automatically) will
need to respect, not a technique that scales to an unlimited real number
of real files on a single real connection.

### Run It

A real, isolated lab was run this session, proving `ATTACH DATABASE`'s
own real mechanics and its own real, parameterizable filename. Real
source and captured output saved in
`verification/lesson-27/lab1-parameterized-attach.cs`. This fragment
cannot run meaningfully alone yet — it connects directly into the next
unit's own complete, real method.

### Connecting Back

A second real database file can now be reached from an already-open
connection, safely and correctly. The next unit actually combines rows
from both real files into one real, unified result.

---

## Concept Unit: `UNION ALL` — Combining Two Real Files Into One Real Result

### The Problem

`attach_a.db`'s own connection can now reach `other.widgets` directly —
but only as a second, separate real table, queried on its own. Nothing
yet lets a single real query return rows from *both* real files at once,
the way this project's own real goal — "every tool anyone has" — actually
needs.

> **Try this first:** `tool_details` (established Views) already gives
> this project's own real `tools`/`vendors` join a single, real,
> queryable shape. Given a second, real, attached database with its own
> identical `tool_details` view, what real SQL construct would let a
> single query return rows from *both* views, stacked into one real
> result — and how is that genuinely different from a `JOIN`, which
> combines columns from two tables side by side, row by row, rather than
> stacking two separate row sets on top of each other?

### Introduce the Concept in Isolation

The same real `attach_a.db`/`attach_b.db` pair, this time combined with a
real `UNION ALL`:

```sql
SELECT id, name FROM widgets
UNION ALL
SELECT id, name FROM other.widgets;
```

Run for real this session (Introduce the Concept in Isolation, previous
unit — the same real run already captured both this query's own real
output and the `ATTACH` that made it possible):

```
1, A-Widget
1, B-Widget
```

This real, captured output proves `UNION ALL`'s own real behavior
directly: two separate real `SELECT` statements, each against a different
real, attached database, produced exactly one real, combined result — two
real rows, one from each real file, in the real order each `SELECT` was
written, not merged or matched by any shared column the way a real `JOIN`
would.

### Discard the Throwaway Example

The same `attach_a.db`/`attach_b.db` pair is now fully discarded — it
never appears in this project again. What's proven is `UNION ALL`'s own
real row-stacking behavior across two real, attached databases — not this
specific throwaway `widgets` table.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolRepository.cs`, modified (method
  completed). `ToolDB.Tests/ToolRepositoryTests.cs`, modified (two new,
  real, permanent tests).
- **Change type** — add.
- **Location** — `ToolRepository.cs`, completing `FindAllAcrossDatabases`,
  begun this lesson's first unit.
- **Dependencies** — `tool_details` (Views), present, identically, in
  both real, attached databases; the previous unit's own real `ATTACH`
  call.

### The New Code

```csharp
public static List<Tool> FindAllAcrossDatabases(SqliteConnection connection, string secondaryPath)
{
    using (var attach = new SqliteCommand("ATTACH DATABASE @path AS other;", connection))
    {
        attach.Parameters.AddWithValue("@path", secondaryPath);
        attach.ExecuteNonQuery();
    }

    try
    {
        using var command = new SqliteCommand(
            "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tool_details " +
            "UNION ALL " +
            "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM other.tool_details",
            connection);
        using var reader = command.ExecuteReader();

        var results = new List<Tool>();
        while (reader.Read())
        {
            results.Add(Tool.FromReader(reader));
        }
        return results;
    }
    finally
    {
        using var detach = new SqliteCommand("DETACH DATABASE other;", connection);
        detach.ExecuteNonQuery();
    }
}
```

### The Updated Project

`ToolRepository.cs`'s own class, new method added directly after
`FindByTag`, established JSON Functions in SQLite:

```csharp
56  public static List<Tool> FindByTag(SqliteConnection connection, string tag)
57  {
58      /* unchanged, established JSON Functions in SQLite */
72  }
73
74  public static List<Tool> FindAllAcrossDatabases(SqliteConnection connection, string secondaryPath)  // ← new
75  {                                                                                                    // ← new
76      using (var attach = new SqliteCommand("ATTACH DATABASE @path AS other;", connection))            // ← new
77      {                                                                                                 // ← new
78          attach.Parameters.AddWithValue("@path", secondaryPath);                                       // ← new
79          attach.ExecuteNonQuery();                                                                      // ← new
80      }                                                                                                  // ← new
81                                                                                                          // ← new
82      try                                                                                                 // ← new
83      {                                                                                                    // ← new
84          using var command = new SqliteCommand(                                                          // ← new
85              "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tool_details " +  // ← new
86              "UNION ALL " +                                                                                // ← new
87              "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM other.tool_details",  // ← new
88              connection);                                                                                  // ← new
89          using var reader = command.ExecuteReader();                                                       // ← new
90                                                                                                              // ← new
91          var results = new List<Tool>();                                                                    // ← new
92          while (reader.Read())                                                                              // ← new
93          {                                                                                                    // ← new
94              results.Add(Tool.FromReader(reader));                                                           // ← new
95          }                                                                                                    // ← new
96          return results;                                                                                     // ← new
97      }                                                                                                        // ← new
98      finally                                                                                                  // ← new
99      {                                                                                                        // ← new
100         using var detach = new SqliteCommand("DETACH DATABASE other;", connection);                         // ← new
101         detach.ExecuteNonQuery();                                                                            // ← new
102     }                                                                                                        // ← new
103 }
```

`ToolRepository` now offers a real, fourth way to gather tools, after
`id`, `name`, and `tag` — across two real, separate files at once. Two
new, real, permanent tests confirm this real behavior against two real,
disposable copies of this project's own schema (never the live
`tools.db`), each seeded with the identical two real tools
`CreateTestDatabase` already establishes: one real call returns all four
real rows, two from each real file, and a second, real, repeated call
against the same real primary connection succeeds identically —
real, direct proof that `DETACH DATABASE` (Terms, above) genuinely runs
every time, leaving the connection ready to attach `other` again.

### Mechanical Walkthrough

- `"SELECT ... FROM tool_details UNION ALL SELECT ... FROM
  other.tool_details"` — the first `SELECT` (established Views,
  reappearing) reads the primary connection's own real `tool_details`;
  `UNION ALL` (Terms, above) is a real SQL operator, not a function call,
  sitting directly between two complete real `SELECT` statements; the
  second `SELECT` reads `other.tool_details` — the real, schema-qualified
  name (Terms, above) reaching the real, just-attached secondary
  database's own identical view.
- `try { ... } finally { ... }` — `try`/`finally` (established Building
  the Add/Edit Form's own `RelayCommand`/UI/UX for Async State's own
  `async void` handling, reappearing) guarantees the real `DETACH
  DATABASE` (Terms, above) call runs whether the real query inside
  succeeds or throws — the real reason a second, later call to this same
  method against the same connection can safely re-`ATTACH` under the
  identical real name `other` without a real "already attached" error.
- `new SqliteCommand("DETACH DATABASE other;", connection)` /
  `ExecuteNonQuery()` — reappearing shapes (Terms/established Schema
  Design) — the real, exact reverse of this lesson's own first unit,
  removing `other` from the connection's own real, currently-attached
  set.

### CS Lens

Guaranteeing a real cleanup step (`DETACH DATABASE`) runs regardless of
whether the real work in between succeeds is a concrete instance of
**resource cleanup via a finally block** — the identical real guarantee
`using` (established Connecting to a Database File) already provides
automatically for `IDisposable` objects, written out explicitly here
because attaching and detaching a real database is a real, stateful
*operation* on an existing connection, not a new, disposable object of
its own. Also recognized in: a real file handle closed in a `finally`
block even when reading it throws; a real mutex or lock released in
`finally` regardless of what happened while held; a real database
transaction's own `Rollback()`, called from `finally` in code that
doesn't reach an explicit `Commit()`.

### SE Lens

Why `UNION ALL` and not plain `UNION`? The real alternative — plain
`UNION` — automatically removes real, exact-duplicate rows across both
real result sets; `UNION ALL` keeps every real row from both, duplicates
included. This project's own real tools are only ever created once, in
one real file, so a genuine cross-database real duplicate (the identical
real `id`, `name`, and every other real column, appearing in both files)
would be a real, meaningful anomaly worth surfacing, not one worth
silently hiding the way plain `UNION` would. The real, honest cost of
`UNION ALL`, accepted deliberately here: if two real, independent files
*did* happen to describe what a person would consider "the same tool" —
a real, genuine possibility once two different real users maintain their
own separate real files — this method reports both, unmerged, leaving
"are these actually the same tool" as a real, harder question this
lesson does not attempt to answer; Aggregating Many Users' Files
Automatically is where this project's own roadmap returns to real,
multi-file reconciliation directly.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. Two new, real, permanent tests were added to
`ToolRepositoryTests.cs` (`FindAllAcrossDatabases_CombinesRowsFromBothRealFiles`,
`FindAllAcrossDatabases_DetachesAfterQuery_SoASecondCallSucceeds`). **Full
suite: 32 tests, 0 failures** — the real, current, full count for this
project (up from 30). Real source and captured output for the isolated
`ATTACH`/`UNION ALL` lab are saved in
`verification/lesson-27/lab1-parameterized-attach.cs`.

### Connecting Back

`ToolRepository.FindAllAcrossDatabases` can now do exactly what this
lesson set out to prove: attach a second, real, independent database file
and return one real, combined, correctly-detached result — proven safe to
call more than once in a row, against real, disposable copies of this
project's own schema, never the live `tools.db`.

---

## Connect the Pieces

Two real, separate SQLite files — a primary and a secondary, each holding
the identical two-tool real schema `CreateTestDatabase` already
establishes — traced through both units:

1. The primary real connection attached the secondary real file under a
   real, chosen schema name, `other` — proven first against a minimal,
   throwaway `widgets` pair, including real, direct proof that the
   attached file's own path can be safely parameterized, not
   string-concatenated (Unit 1).
2. A single, real `UNION ALL` query then read both real files'
   `tool_details` views at once, returning all four real tools in one
   real, combined list — with a real `finally` block guaranteeing
   `DETACH DATABASE` always runs afterward, proven by a second, real,
   successful call against the same real connection (Unit 2).

**Next lesson:** 28 — A Database on a Network Share (UNC paths, locking,
WAL, `busy_timeout`).
