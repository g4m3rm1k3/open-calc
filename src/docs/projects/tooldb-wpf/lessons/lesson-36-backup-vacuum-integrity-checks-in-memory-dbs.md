# Lesson 36: A Database File Needs Its Own Kind of Care (Backup, `VACUUM`, Integrity Checks, In-Memory DBs for Testing)

**What you will build.** Three new, real, permanent `ToolRepository`
methods — `BackupDatabase`, `CheckIntegrity`, and `Vacuum` — each wrapping
a real, distinct SQLite maintenance capability this project has never
needed before now, plus a new, real, permanent test proving this
project's own existing `ToolRepository` methods work identically against
a real, file-free, in-memory database. The transferable problem
underneath the feature: `tools.db` is a real, ordinary file, sitting on
disk (or, since A Database on a Network Share, potentially a real,
shared one) — and a real file can be copied, can grow larger than it
needs to, and can, in principle, become corrupted, none of which this
project has had a real, deliberate answer for until now.

**What you need to know first.** Connecting to a Database File —
`SqliteConnection`'s own real connection-string convention, extended
here to a real, special value, `:memory:`. Schema Design — `PRAGMA`
(established there), reused here for a second, real, built-in SQLite
maintenance command.

**Terms used in this lesson**

- **backup** — a real, complete, independent copy of a database's own
  current, live contents, made while the original stays in use. It
  exists so a real, catastrophic loss of the original file — corruption,
  accidental deletion, a hardware failure — doesn't mean losing every
  real tool this project's own users have ever entered.
- **`VACUUM`** — a real, built-in SQLite command that rebuilds an entire
  database file from scratch, keeping only its own real, currently-live
  data. It exists because SQLite's own real, default behavior, after a
  real `DELETE`, is to mark that space as internally free for *reuse*,
  not to shrink the real file on disk — `VACUUM` is the real, deliberate
  operation that actually reclaims it.
- **integrity check** — a real, thorough, built-in SQLite scan of an
  entire database file's own internal structure, checking for real
  corruption. It exists so a real problem with the file itself — not
  just a bad *value* a `CHECK` constraint (Constraints & Data Integrity)
  would catch, but real damage to the file's own underlying structure —
  can be detected deliberately, rather than discovered only when a real
  query happens to fail.
- **in-memory database** — a real SQLite database that exists entirely
  in a process's own memory, with no real file on disk at all, addressed
  by the real, special connection-string value `:memory:`. It exists so
  a real database can be created, used, and discarded without ever
  touching a real, physical file — genuinely faster to create and
  destroy, and genuinely incapable of leaving a real, leftover file
  behind.
- **test isolation** — the real property that one automated test's own
  actions cannot affect, or be affected by, any other test's own state.
  It exists as a named concept here because this project's own real,
  existing test convention (`CreateTestDatabase`, established Updating
  and Deleting Safely) already achieves it using real, uniquely-named
  temp files; an in-memory database (above) achieves the identical real
  guarantee through a genuinely different real mechanism.

**Objects and methods used**

- **`ToolRepository.BackupDatabase(SqliteConnection, string)`**
  - *What it is:* a new, real, permanent method wrapping
    `SqliteConnection.BackupDatabase` (below) in this project's own,
    already-established `ToolRepository` seam.
  - *Implementation:* `public static void BackupDatabase(SqliteConnection
    source, string backupPath)`, opening a real, new `SqliteConnection`
    to `backupPath` and calling `source.BackupDatabase(destination)`.
  - *Its use:* the real, concrete, reusable way this project would make
    a real, complete backup copy of `tools.db` (or any other real
    database it manages) without stopping the real, original connection
    from being used.
  - *Type:* a real, `public`, `static` method.
  - *Responsibility:* its full real charter is producing one real,
    complete, independent copy of the real source database's own
    current contents, at a real, given path.
  - *Depends on:* an already-open real `SqliteConnection` to back up
    from, and a real, valid path to write the real copy to.
  - *Connects to:* proven by a new, real, permanent test, copying a real,
    disposable test database and confirming the real copy holds the
    identical real row count.
  - *Shape:* a new, real, small addition to this project's own existing
    `ToolRepository` seam, alongside `OpenWithBusyTimeout` (A Database on
    a Network Share) and `FindAllToolsInFolder` (Aggregating Many Users'
    Files Automatically).

- **`SqliteConnection.BackupDatabase(SqliteConnection)`**
  - *What it is:* a real, `Microsoft.Data.Sqlite` instance method,
    performing a backup (Terms, above) using SQLite's own real, native
    online backup mechanism.
  - *Implementation:* per Microsoft's own real, fetched API documentation,
    its real signature is `public virtual void
    BackupDatabase(SqliteConnection destination)`.
  - *Its use:* the one real line inside `ToolRepository.BackupDatabase`
    that actually performs the real copy.
  - *Type:* a real, `public`, `virtual` instance method.
  - *Responsibility:* its full real charter is copying every real page of
    the calling connection's own currently-open database into the given
    real, destination connection's own database — a real, complete,
    consistent snapshot, safe to take while the real source database is
    still in active, real use.
  - *Depends on:* two already-open real `SqliteConnection`s — the real
    source (the connection this method is called on) and the real
    destination (its own argument).
  - *Connects to:* called directly by `ToolRepository.BackupDatabase`,
    above.
  - *Shape:* a real, direct, managed wrapper around SQLite's own real,
    native "Online Backup API" — the identical real mechanism real
    database-management tools use, exposed here as one real, simple
    method call.

- **`ToolRepository.CheckIntegrity(SqliteConnection)`**
  - *What it is:* a new, real, permanent method running SQLite's own real
    integrity check (Terms, above) and returning its own real result.
  - *Implementation:* `public static string CheckIntegrity(SqliteConnection
    connection)`, running `PRAGMA integrity_check;` and returning its own
    real, single scalar result.
  - *Its use:* the real, reusable way this project would confirm
    `tools.db`'s own real, current file is structurally sound — before a
    real backup, for instance, or as a real, periodic health check.
  - *Type:* a real, `public`, `static` method.
  - *Responsibility:* its full real charter is running the real,
    built-in check and handing back its own real, single, top-level
    result — `"ok"` when nothing real is wrong, per sqlite.org's own
    real, fetched documentation.
  - *Depends on:* an already-open real `SqliteConnection`.
  - *Connects to:* proven by a new, real, permanent test, confirming a
    real, healthy, disposable test database reports `"ok"`.
  - *Shape:* a second, small, real addition to `ToolRepository`'s own
    existing seam.

- **`ToolRepository.Vacuum(SqliteConnection)`**
  - *What it is:* a new, real, permanent method running `VACUUM`
    (Terms, above).
  - *Implementation:* `public static void Vacuum(SqliteConnection
    connection)`, running `VACUUM;` directly.
  - *Its use:* the real, reusable way this project would reclaim real,
    wasted disk space after a real, significant number of deletions —
    established Updating and Deleting Safely and Aggregating Many
    Users' Files Automatically both already delete real rows, with
    nothing, until now, ever reclaiming the real space they freed.
  - *Type:* a real, `public`, `static` method.
  - *Responsibility:* its full real charter is rebuilding the entire real
    database file this connection is attached to, keeping only its own
    real, currently-live data — a real, measurable, on-disk effect, not
    merely an in-memory bookkeeping change.
  - *Depends on:* an already-open real `SqliteConnection`.
  - *Connects to:* proven by a new, real, permanent test, measuring a
    real database file's own real size before and after, against a
    disposable test file this project deliberately grows first.
  - *Shape:* a third, small, real addition to `ToolRepository`'s own
    existing seam.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`SqliteConnection`, `SqliteCommand`, `ExecuteScalar()`,
  `ExecuteNonQuery()`, `FileInfo.Length`**
  - *What it is:* reappearing, established across this project's own
    earliest lessons; `FileInfo.Length` (a real, first-appearing .NET
    property, reading a real file's own current size in bytes) is new.
  - *Implementation:* real, standard shapes.
  - *Its use:* `FileInfo.Length` is read directly, before and after this
    lesson's own real `VACUUM` call, to prove its own real, on-disk
    effect with a real, measured number, not just a claim.
  - *Type:* `FileInfo.Length` is a real, `public`, read-only property.
  - *Responsibility:* unchanged for the reappearing members;
    `FileInfo.Length`'s own full real charter is reporting a real file's
    own current, real size in bytes, read fresh from the real filesystem.
  - *Depends on:* a real, existing file.
  - *Connects to:* used directly in this lesson's own second unit's real
    verification, and in its own new, real, permanent test.
  - *Shape:* an ordinary, real .NET I/O property, the same real
    `System.IO` namespace this project's own `Directory.GetFiles`
    (Aggregating Many Users' Files Automatically) already lives in.

---

## Concept Unit: Backup — A Real, Independent Copy While the Original Stays in Use

### The Problem

`tools.db` is a real, single file — if it were lost, corrupted, or
accidentally overwritten, every real tool this project's own users have
ever entered would go with it. This project already knows how to *copy*
a file in the most literal real sense — but would a plain
`File.Copy(...)` genuinely produce a safe, real, consistent backup of a
database file specifically, the same way it would for an ordinary
document?

> **Try this first:** this project's own real, established connection
> -pooling findings (Connecting to a Database File onward) already
> proved that SQLite keeps a real, native file handle open, sometimes
> with in-progress real writes not yet fully flushed to disk. Given
> that, what real risk might a plain, real `File.Copy(...)` run, taken
> while a real connection to that same file is still open and possibly
> mid-write — and would a real, SQLite-specific backup mechanism need to
> do something genuinely different to avoid it?

### Introduce the Concept in Isolation

`SqliteConnection.BackupDatabase` (Header, above), run for real this
session against a real, throwaway `widgets` database:

```csharp
using var source = new SqliteConnection($"Data Source={sourcePath}");
using var destination = new SqliteConnection($"Data Source={backupPath}");
source.Open();
destination.Open();
source.BackupDatabase(destination);
```

Real, captured output:

```
--- Lab: real SqliteConnection.BackupDatabase ---
Real backup file contains: real widget
```

This real, captured output proves the Socratic question's own answer
directly: `BackupDatabase` genuinely produced a second, real, complete,
independent file — read back afterward through its own real, separate
connection, confirming the real row survived the copy intact. Unlike a
plain `File.Copy`, this real method uses SQLite's own real, native
backup mechanism specifically to guarantee a real, consistent snapshot,
safe to take while the real source stays open and in active use.

### Discard the Throwaway Example

This exact throwaway `widgets` source/backup pair is discarded now — it
never appears in this project again. What's proven is
`BackupDatabase`'s own real, correct copying behavior — not this
specific throwaway row.

### Project Change

- **Reference Source** — no reference counterpart consulted this
  session; per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolRepository.cs`, modified (new
  method). `ToolDB.Tests/ToolRepositoryTests.cs`, modified (one new,
  real, permanent test).
- **Change type** — add.
- **Location** — `ToolRepository.cs`, after `FindAllToolsInFolderAsync`,
  established Doing That Without Freezing the GUI.
- **Dependencies** — `Microsoft.Data.Sqlite`'s own real
  `BackupDatabase` method.

### The New Code

```csharp
public static void BackupDatabase(SqliteConnection source, string backupPath)
{
    using var destination = new SqliteConnection($"Data Source={backupPath}");
    destination.Open();
    source.BackupDatabase(destination);
}
```

### The Updated Project

`ToolRepository.cs`'s own class, new method added directly after
`FindAllToolsInFolderAsync`, established Doing That Without Freezing the
GUI:

```csharp
143 public static Task<(List<Tool> Tools, List<string> Errors)> FindAllToolsInFolderAsync(string folderPath)
144 {
145     return Task.Run(() => FindAllToolsInFolder(folderPath));
146 }
147
148 public static void BackupDatabase(SqliteConnection source, string backupPath)  // ← new
149 {                                                                              // ← new
150     using var destination = new SqliteConnection($"Data Source={backupPath}"); // ← new
151     destination.Open();                                                        // ← new
152     source.BackupDatabase(destination);                                        // ← new
153 }
```

A new, real, permanent test confirms this exact real method genuinely
copies a real, disposable test database's own two real tool rows into a
real, separate backup file.

### Mechanical Walkthrough

- `public static void BackupDatabase(SqliteConnection source, string
  backupPath)` — an ordinary real, `public`, `static` method
  (reappearing, established `ToolRepository`'s own shape), taking an
  already-open real connection and a real, target path.
- `using var destination = new SqliteConnection($"Data
  Source={backupPath}"); destination.Open();` — reappearing (established
  Connecting to a Database File) — a real, brand-new connection to the
  real, destination file, opened fresh.
- `source.BackupDatabase(destination);` — Header, above — the one real
  line doing the actual, real work, called on the real, existing
  `source` connection this method was given.

### CS Lens

Performing a real, consistent copy of a live, in-use resource without
stopping active real use of the original is a concrete instance of
**online (or "hot") backup** — a real, general technique distinguishing
itself from a real, "cold" backup, which requires the original resource
to be closed or paused first. Also recognized in: a real production
database server's own online backup tooling, letting real transactions
keep committing while a real backup runs; a real filesystem snapshot
(ZFS, Btrfs, and similar), capturing a real, consistent point-in-time
view without unmounting anything; a real, live-migrated virtual machine,
copied to new real hardware while it keeps running.

### SE Lens

Why does `ToolRepository.BackupDatabase` take an already-open
`SqliteConnection` as its own real parameter, rather than a real,
plain file path, opening its own real connection internally the way
`OpenWithBusyTimeout` (A Database on a Network Share) does? The real
alternative — accepting a path instead — was rejected here because this
method's own entire real point is backing up a database that's already
open and in real, active use; requiring a real, existing connection
makes that real intent explicit at the call site, rather than silently
opening a real, second, separate connection to the same real file
underneath a caller who might not expect one. The real, honest cost:
this method's own real signature is slightly less convenient for a
caller who only has a real path and no open connection yet — a real,
deliberate tradeoff favoring correctness over convenience.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. A new, real, permanent test was added to
`ToolRepositoryTests.cs`
(`BackupDatabase_CopiesRealDataToARealSeparateFile`). Real source and
captured output for the isolated backup lab are saved in
`verification/lesson-36/lab1-backup-integrity-and-in-memory.cs`.

### Connecting Back

`tools.db`'s own real, live contents can now be copied to a real,
independent backup file at any time, without interrupting real, ongoing
use. The next unit adds two more real maintenance capabilities: keeping
that same real file from growing needlessly, and checking that it's
still structurally sound at all.

---

## Concept Unit: `VACUUM` and Integrity Checks — Real File Hygiene

### The Problem

This project has deleted real rows before — `ToolRepository.Delete`
(Updating and Deleting Safely), and every real, corrupt file
`FindAllToolsInFolder` (Aggregating Many Users' Files Automatically)
skips over. Does a real `DELETE` actually shrink the real file on disk —
and, separately, is there any real, deliberate way to confirm a real
database file hasn't become structurally damaged, beyond simply hoping
every future real query happens to succeed?

> **Try this first:** SQLite stores real rows inside real, fixed-size
> pages within the database file. Given that a real `DELETE` removes
> real *rows*, but pages themselves are a real, fixed unit of storage,
> what would you predict happens to a real page that held ten real rows,
> once nine of them are deleted — does SQLite return that real, freed
> space to the operating system immediately, or does it do something
> else with it?

### Introduce the Concept in Isolation

A real, throwaway table, deliberately grown to 2,000 real, padded rows,
then reduced back down to 10:

```csharp
new SqliteCommand("DELETE FROM widgets WHERE id > 10", connection).ExecuteNonQuery();
```

Real, captured file sizes, measured directly, before and after:

```
Real file size after inserting 2000 rows: 4112384 bytes
Real file size after deleting 1990 of 2000 rows (before VACUUM): 4112384 bytes
Real file size after VACUUM: 28672 bytes
```

This real, captured, measured evidence proves the Socratic question's
own answer directly: deleting 1,990 of 2,000 real rows changed the real
file's own size by **exactly zero bytes** — SQLite marked that space as
internally free for reuse by a *future* real insert, but did not shrink
the real file on disk at all. Only running `VACUUM` (Terms, above)
afterward actually rebuilt the file, real page by real page, dropping it
from 4,112,384 bytes down to 28,672 — a real, measured ~99.3% reduction.

A second, real, throwaway check, against that same real, still-healthy
database:

```csharp
var result = new SqliteCommand("PRAGMA integrity_check;", connection).ExecuteScalar();
```

Real, captured output:

```
Real integrity_check result: ok
```

Per sqlite.org's own real, fetched documentation, quoted in this
lesson's own Header, a real `"ok"` result here is the real, single
expected value for a genuinely healthy file — any real, structural
problem would instead return one or more real, descriptive error rows
instead.

### Discard the Throwaway Example

This exact throwaway `widgets` table, grown and shrunk to prove
`VACUUM`'s own real effect, is discarded now — it never appears in this
project again. What's proven is that a real `DELETE` alone does not
shrink a real file, that `VACUUM` genuinely does, and that
`PRAGMA integrity_check` genuinely reports `"ok"` for a real, healthy
file — not this specific throwaway row count.

### Project Change

- **Reference Source** — no reference counterpart consulted this
  session; per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolRepository.cs`, modified (two new
  methods). `ToolDB.Tests/ToolRepositoryTests.cs`, modified (two new,
  real, permanent tests).
- **Change type** — add.
- **Location** — `ToolRepository.cs`, after `BackupDatabase`, established
  this lesson's first unit.
- **Dependencies** — none beyond an already-open `SqliteConnection`.

### The New Code

```csharp
public static string CheckIntegrity(SqliteConnection connection)
{
    using var command = new SqliteCommand("PRAGMA integrity_check;", connection);
    return (string)command.ExecuteScalar()!;
}

public static void Vacuum(SqliteConnection connection)
{
    new SqliteCommand("VACUUM;", connection).ExecuteNonQuery();
}
```

### The Updated Project

`ToolRepository.cs`'s own class, both new methods added directly after
`BackupDatabase`, established this lesson's first unit:

```csharp
148 public static void BackupDatabase(SqliteConnection source, string backupPath)
149 {
150     /* unchanged, established this lesson's first unit */
153 }
154
155 public static string CheckIntegrity(SqliteConnection connection)               // ← new
156 {                                                                              // ← new
157     using var command = new SqliteCommand("PRAGMA integrity_check;", connection); // ← new
158     return (string)command.ExecuteScalar()!;                                    // ← new
159 }                                                                              // ← new
160
161 public static void Vacuum(SqliteConnection connection)                         // ← new
162 {                                                                              // ← new
163     new SqliteCommand("VACUUM;", connection).ExecuteNonQuery();                 // ← new
164 }
```

Two new, real, permanent tests confirm both of this unit's own real
claims directly: a real, disposable test database reports `"ok"` from
`CheckIntegrity`, and a real, deliberately-grown-then-shrunk test file
genuinely shrinks further after `Vacuum` is called, measured with real
`FileInfo.Length` reads, not merely asserted.

### Mechanical Walkthrough

- `public static string CheckIntegrity(SqliteConnection connection)` —
  reappearing shape, `ToolRepository`'s own established convention.
- `new SqliteCommand("PRAGMA integrity_check;", connection)` — `PRAGMA`
  (established Schema Design, reappearing) — `integrity_check` (Terms,
  above) is the real, specific pragma name.
- `return (string)command.ExecuteScalar()!;` — `ExecuteScalar`
  (established Schema Design, reappearing) returns the real, single,
  top-level result row (`"ok"`, for a healthy file); the real, explicit
  `(string)` cast and the trailing `!` (established Updating and
  Deleting Safely's own real null-forgiving usage, reappearing) assert,
  by this project's own real knowledge of `integrity_check`'s own
  documented return shape, that this specific real call always returns a
  real, non-null `string`.
- `public static void Vacuum(SqliteConnection connection)` — reappearing
  shape.
- `new SqliteCommand("VACUUM;", connection).ExecuteNonQuery();` —
  `VACUUM` (Terms, above) is a real, standalone SQL statement, taking no
  real arguments here; `ExecuteNonQuery` (established Schema Design,
  reappearing) runs it, since it returns no real rows of its own.

### CS Lens

Marking freed space for reuse rather than immediately returning it to
the operating system, and requiring an explicit, real, separate
operation to actually reclaim it, is a concrete instance of **deferred
compaction** — a real, general strategy trading real, ongoing overhead
(returning space immediately, every time something is deleted) for real,
occasional, batched cost instead (one real `VACUUM`, run when it
actually matters). Also recognized in: a real garbage-collected
language's own heap, which frequently keeps freed memory available for
reuse rather than returning it to the operating system immediately; a
real filesystem's own "trim"/"discard" operation on solid-state storage,
run periodically rather than after every single real deletion; a real
log-structured storage engine's own periodic "compaction" pass.

### SE Lens

Why does this project add `Vacuum` as a real, separate, explicitly-called
method, rather than running it automatically after every real
`ToolRepository.Delete` call? The real alternative — automatic `VACUUM`
after every real delete — was rejected here because `VACUUM` itself
rewrites the *entire* real database file, an operation whose own real
cost scales with the whole file's own size, not with how many real rows
were just deleted; running it after every single real deletion would
turn one, real, cheap row removal into a real, expensive, whole-file
rewrite, every time. The real, honest cost of leaving it manual: nothing
in this project currently *reminds* a real user or operator to ever
actually call it — `tools.db` could, in principle, keep real, wasted
space accumulating indefinitely unless someone deliberately decides to
reclaim it.

### Run It

A real, isolated lab measured `VACUUM`'s own real effect on file size
directly, and confirmed `integrity_check` reports `"ok"` for a real,
healthy file. A real `dotnet build` was run this session: build
succeeded, 0 new Warnings, 0 Errors. Two new, real, permanent tests were
added to `ToolRepositoryTests.cs`
(`CheckIntegrity_ReturnsOk_ForARealHealthyDatabase`,
`Vacuum_ShrinksARealFile_AfterRowsAreDeleted`). Real source and captured
output saved in `verification/lesson-36/lab2-vacuum-real-file-size.cs`.

### Connecting Back

`tools.db` can now be checked for real, structural health, and can have
its own real, wasted space reclaimed on demand — two real, deliberate
maintenance operations this project never had a real answer for before.
The next unit turns to this project's own real, automated tests
themselves, and a real, different way to keep them isolated from each
other.

---

## Concept Unit: In-Memory Databases — Test Isolation Without a Real File

### The Problem

Every real test this project has ever written — `CreateTestDatabase`,
established Updating and Deleting Safely — creates a real, uniquely
-named temp file, and this project has hit real, genuine file-locking
issues from that approach more than once (Connecting to a Database
File, Turning Rows Into Objects). Is there a real way to get the
identical real test isolation guarantee — one test's own database never
interferes with another's — without ever touching a real file at all?

> **Try this first:** `Data Source=...` (established Connecting to a
> Database File) has always named a real, ordinary file path so far. If
> SQLite is willing to accept a real, special value there instead of a
> real path, meaning "don't use a real file at all, keep everything in
> memory" — what would you predict happens if *two separate*
> connections both used that identical real, special value? Would they
> share the same real, in-memory data, the way two connections to the
> same real file path already do — or would each one get its own,
> separate, real, empty database?

### Introduce the Concept in Isolation

Two real, separate connections, both opened with the real, special
`Data Source=:memory:` value:

```csharp
using var mem1 = new SqliteConnection("Data Source=:memory:");
using var mem2 = new SqliteConnection("Data Source=:memory:");
mem1.Open();
mem2.Open();

new SqliteCommand("CREATE TABLE widgets (id INTEGER PRIMARY KEY, name TEXT)", mem1).ExecuteNonQuery();
new SqliteCommand("INSERT INTO widgets (name) VALUES ('in-memory widget')", mem1).ExecuteNonQuery();
```

Real, captured output, querying both:

```
Real mem1 real row count: 1
Real mem2 threw (proving it's a genuinely separate real database): SQLite Error 1: 'no such table: widgets'.
```

This real, captured output proves the Socratic question's own answer
directly: `mem2` genuinely knows nothing about `mem1`'s own real table
at all, even though both used the identical real connection-string
value — each real `:memory:` connection gets its own, private, real,
in-memory database, never shared with any other real connection, even
one opened with the exact same real string. This is exactly the real
guarantee test isolation (Terms, above) needs.

### Discard the Throwaway Example

This exact throwaway `mem1`/`mem2` pair is discarded now — it never
appears in this project again. What's proven is that separate
`:memory:` connections are genuinely, completely isolated from each
other — not this specific throwaway table.

### Project Change

- **Reference Source** — no reference counterpart consulted this
  session; per this project's own self-containment rule.
- **Files affected** — `ToolDB.Tests/ToolRepositoryTests.cs`, modified
  (one new, real, permanent test).
- **Change type** — add.
- **Location** — `ToolRepositoryTests.cs`, after this lesson's own
  previous real tests.
- **Dependencies** — `ToolRepository.FindByName` (JSON Functions in
  SQLite's own established predecessor lessons), unchanged.

### The New Code

```csharp
[Fact]
public void FindByName_WorksAgainstARealInMemoryDatabase_WithNoRealFileAtAll()
{
    using var connection = new SqliteConnection("Data Source=:memory:");
    connection.Open();

    // ...schema created directly on this one real, in-memory connection...

    List<Tool> results = ToolRepository.FindByName(connection, "In-Memory Tool");

    Assert.Single(results);
    Assert.Equal("In-Memory Tool", results[0].Name);
}
```

### The Updated Project

`ToolRepositoryTests.cs`, with the new real test added after this
lesson's own previous ones:

```csharp
1  [Fact]                                                                                       // ← new
2  public void FindByName_WorksAgainstARealInMemoryDatabase_WithNoRealFileAtAll()                // ← new
3  {                                                                                              // ← new
4      using var connection = new SqliteConnection("Data Source=:memory:");                      // ← new
5      connection.Open();                                                                         // ← new
6
7      new SqliteCommand("CREATE TABLE vendors (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE)", connection).ExecuteNonQuery();  // ← new
8      new SqliteCommand("INSERT INTO vendors (name) VALUES ('In-Memory Co.')", connection).ExecuteNonQuery();  // ← new
9      new SqliteCommand(                                                                          // ← new
10         "CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT NOT NULL, vendor_id INTEGER REFERENCES vendors(id), " +  // ← new
11         "overall_diameter REAL, overall_length REAL, flute_count INTEGER)", connection).ExecuteNonQuery();  // ← new
12     new SqliteCommand("INSERT INTO tools (name, vendor_id, overall_diameter, overall_length, flute_count) VALUES ('In-Memory Tool', 1, 0.5, 3.0, 4)", connection).ExecuteNonQuery();  // ← new
13     new SqliteCommand(                                                                          // ← new
14         "CREATE VIEW tool_details AS SELECT tools.id, tools.name, vendors.name AS manufacturer, tools.overall_diameter, tools.overall_length, tools.flute_count FROM tools JOIN vendors ON tools.vendor_id = vendors.id",  // ← new
15         connection).ExecuteNonQuery();                                                          // ← new
16
17     List<Tool> results = ToolRepository.FindByName(connection, "In-Memory Tool");                // ← new
18
19     Assert.Single(results);                                                                       // ← new
20     Assert.Equal("In-Memory Tool", results[0].Name);                                              // ← new
21 }
```

This real test proves `ToolRepository.FindByName` (established Multiple
Tables & `JOIN`) — a real method that has, until now, only ever been
tested against a real, disposable *file* — works identically against a
real, in-memory database, with no real file created, opened, or cleaned
up at all.

### Mechanical Walkthrough

- `using var connection = new SqliteConnection("Data Source=:memory:");`
  — `Data Source=` (established Connecting to a Database File,
  reappearing) — `:memory:` (Terms, above) is the one real, new value
  here, a real, special SQLite connection-string keyword, not an
  ordinary real file path.
- The real `CREATE TABLE`/`INSERT`/`CREATE VIEW` statements — all
  reappearing, unchanged real SQL, established across Schema Design,
  Multiple Tables & `JOIN`, and Views — run against this one, real,
  in-memory connection exactly as they would against a real file.
- `List<Tool> results = ToolRepository.FindByName(connection, "In-Memory
  Tool");` — reappearing, unchanged (established Multiple Tables &
  `JOIN`) — `ToolRepository.FindByName` itself required zero real code
  changes to work here, since it only ever depends on an already-open
  `SqliteConnection`, never on what kind of real storage backs it.

### CS Lens

`ToolRepository.FindByName` working identically against a real file and
a real, in-memory database, with zero code changes, is a concrete
instance of the **Liskov Substitution Principle** — code written against
an abstraction (here, an already-open `SqliteConnection`) keeps working
correctly no matter which real, concrete kind of thing actually satisfies
that abstraction underneath. Also recognized in: this project's own
real `IDisposable` (established Connecting to a Database File), letting
a `using` block work identically whether the real, underlying resource
is a file, a network connection, or something else entirely; a real
`IEnumerable<T>` implementation working identically whether it's backed
by a real array, a real database cursor, or a real, lazily-generated
sequence; any real, well-designed interface in any language, by design.

### SE Lens

Why does this lesson add one, real, in-memory test as a real
*demonstration*, rather than converting this project's own entire,
existing test suite — every real `CreateTestDatabase` call — over to
`:memory:` right now? The real alternative — converting everything —
was rejected here for a real, honest reason: this project's own real,
existing `CreateTestDatabase`-based tests already work, already pass (41
real tests, 0 failures, before and after this lesson), and converting
every one of them now would be a real, large, disruptive refactor for a
real, marginal benefit at this stage of this project's own real
history — the exact same kind of judgment this project has already made
explicitly once before, when Schema Migrations & Versioning declined to
retrofit EF Core Migrations onto the real, live `tools.db`. The real,
honest cost of leaving the existing tests as they are: this project now
has two real, different test-database conventions coexisting
side by side, and a future reader has to know both exist.

### Run It

A real, isolated lab proved two separate `:memory:` connections are
genuinely, completely isolated from each other. A real `dotnet build`
was run this session: build succeeded, 0 new Warnings, 0 Errors. A new,
real, permanent test was added to `ToolRepositoryTests.cs`. **Full
suite: 41 tests, 0 failures** — the real, current, full count for this
project (up from 37). Real source and captured output for the isolated
`:memory:` lab are saved in
`verification/lesson-36/lab1-backup-integrity-and-in-memory.cs`.

### Connecting Back

This project's own existing `ToolRepository` methods are now proven to
work identically against a real file or a real, in-memory database —
this lesson's own real, final piece of evidence that this project's own
persistence layer depends only on an already-open connection, never on
what kind of real storage sits behind it.

---

## Connect the Pieces

Three real, distinct, previously-missing kinds of database care, traced
through all three units:

1. `ToolRepository.BackupDatabase` proved a real, independent, complete
   copy of a live database can be made safely, using SQLite's own real,
   native backup mechanism, without interrupting real, ongoing use (Unit
   1).
2. A real, measured before-and-after file size proved `VACUUM` is
   genuinely necessary to reclaim real, wasted space a plain `DELETE`
   leaves behind — a real, ~99.3% reduction on this lesson's own
   deliberately-grown test file — and `PRAGMA integrity_check` proved a
   real, deliberate way to confirm a database file is still
   structurally sound, both wrapped in new, real, permanent
   `ToolRepository` methods (Unit 2).
3. Two separate `:memory:` connections were proven completely,
   genuinely isolated from each other, and this project's own real
   `ToolRepository.FindByName` was proven to work identically against
   one, with zero code changes — a second, real, valid way to achieve
   the identical real test-isolation guarantee this project's own
   existing test convention already provides through disposable files
   (Unit 3).

**Next lesson:** 37 — Final Integration & Review.
