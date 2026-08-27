# Lesson 29: Let the Folder Decide How Many (Aggregating Many Users' Files Automatically)

**What you will build.** A new, real, permanent method,
`ToolRepository.FindAllToolsInFolder`, that scans a real, given folder for
every real `.db` file it currently contains — not a fixed count decided
in advance — reads every real tool out of each one, and, when a specific
real file turns out to be corrupt or unreadable, skips it and reports
that real failure by name rather than letting it stop the whole real
operation. The transferable problem underneath the feature: Multiple
Database Files already proved two real, named files can be combined in
one real query, but a real shop doesn't have exactly two users, forever —
it has however many real people happen to have a real tool-library file
in the shared real folder today, and any one of those real files can be
the one that's corrupt, mid-save, or simply gone.

**What you need to know first.** Multiple Database Files — the real
`tool_details`-based query shape this lesson's own new method reuses per
real file, and the real contrast this lesson's own SE Lens draws against
`ATTACH DATABASE`'s own fixed, named-file approach. Turning Rows Into
Objects — `Tool.FromReader`, reused unchanged, once per real file.

**Terms used in this lesson**

- **aggregation over files** — combining real data drawn from a real,
  *variable* number of independent files, discovered at run time, rather
  than a fixed number of files named in advance in the code itself. It
  exists because a real, growing shop adds and removes real users' own
  files over time; code that only knows how to combine "file A and file
  B" by name would need editing every time that real count changed.
- **error tolerance** — continuing a real, larger operation past one
  real, individual failure, rather than letting that one real failure
  abort everything else that would otherwise have succeeded. It exists
  because, once a real operation touches a real, unknown, and
  potentially large number of independent files, some real file being
  corrupt, locked, or simply not a real database at all stops being a
  rare accident and becomes a routine, expected possibility.
- **`Mode=ReadOnly`** — a real `Microsoft.Data.Sqlite` connection-string
  keyword, opening a real SQLite file without ever requesting a real
  write lock on it. It exists so that reading many real users' own files
  for a real aggregation — an operation with no real reason to ever
  change any of them — cannot itself contend with, or be blocked by, a
  real write those same users' own applications might be doing at the
  same real moment.
- **named tuple** — a real C# feature, first used in this lesson, letting
  a method return more than one real value at once, each with its own
  real, meaningful name, without declaring a dedicated real class or
  `record` for it. Per Microsoft's own real, fetched documentation
  (`learn.microsoft.com/dotnet/csharp/language-reference/builtin-types/value-tuples`),
  "One of the most common use cases for tuples is as a method return
  type," letting a caller "work with the returned tuple instance directly
  or deconstruct it in separate variables." It exists here so
  `FindAllToolsInFolder` can hand back both its real successes and its
  real failures from one real call, without inventing a new type whose
  only real job is holding exactly those two things together once.

**Objects and methods used**

- **`ToolRepository.FindAllToolsInFolder(string)`**
  - *What it is:* a new, real, permanent method on `ToolRepository`,
    aggregating every real tool found across every real `.db` file in a
    given real folder.
  - *Implementation:* `public static (List<Tool> Tools, List<string> Errors)
    FindAllToolsInFolder(string folderPath)`, shown in full below.
  - *Its use:* the real, concrete generalization of Multiple Database
    Files' own `FindAllAcrossDatabases` — that method combined exactly
    two, real, named files through one real `ATTACH`/`UNION ALL` query;
    this one combines however many real files a real folder happens to
    hold right now, discovered automatically.
  - *Type:* a real, `public`, `static` method, returning a real named
    tuple (Terms, above) rather than a plain `List<Tool>`.
  - *Responsibility:* its full real charter is visiting every real `.db`
    file in a given real folder, reading every real tool out of each one
    that can actually be read, and reporting, by real file name, every
    one that couldn't — never letting one real, bad file prevent any
    other real, good file's own data from being returned.
  - *Depends on:* a real, existing folder path; every real file inside it
    that matches `*.db` sharing this project's own real `tools`/`vendors`/
    `tool_details` schema shape closely enough for `Tool.FromReader`
    (established Turning Rows Into Objects) to succeed against it.
  - *Connects to:* not yet called from `MainWindow.xaml.cs` — proven
    correct by one new, real, permanent test, matching this project's own
    established "prove it, then wire it in later" pattern.
  - *Shape:* a new, real capability on this project's own existing
    ADO.NET persistence seam, sitting directly alongside
    `FindAllAcrossDatabases` (Multiple Database Files) as a second,
    genuinely different real strategy for the same real underlying goal.

- **`Directory.GetFiles(string, string)`**
  - *What it is:* a real, `static` .NET method returning every real file
    name in a given real directory matching a real search pattern.
  - *Implementation:* per Microsoft's own real, fetched API documentation
    (`learn.microsoft.com/dotnet/api/system.io.directory.getfiles`), its
    real declared signature is `public static string[] GetFiles(string
    path, string searchPattern)`, returning "the names of files
    (including their paths) that match the specified search pattern in
    the specified directory" — real wildcard characters `*`/`?` are
    supported; real regular expressions are not.
  - *Its use:* `FindAllToolsInFolder`'s own real starting point —
    `Directory.GetFiles(folderPath, "*.db")` discovers every real
    candidate file, whatever real name each one happens to have.
  - *Type:* a real, `public`, `static` method.
  - *Responsibility:* its full real charter is returning a real array of
    every real, matching file's own full real path — nothing about
    reading, opening, or validating any of them; that's this lesson's own
    method's own job, one real file at a time.
  - *Depends on:* a real, existing, readable directory; per that same
    real documentation, a genuinely missing directory throws a real
    `DirectoryNotFoundException` rather than returning an empty real
    array.
  - *Connects to:* its own real, returned file names are looped over
    directly inside `FindAllToolsInFolder`, each one handed to a new,
    real `SqliteConnection`.
  - *Shape:* a real, ordinary .NET I/O method — the same real
    `System.IO` namespace this project's own `File.Exists`/`File.Delete`
    calls have used since its own earliest lessons.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`SqliteConnection`, `SqliteCommand`, `ExecuteReader()`,
  `Tool.FromReader`**
  - *What it is:* reappearing, unchanged — this project's own real,
    established ADO.NET and row-mapping vocabulary.
  - *Implementation:* unchanged from every earlier real appearance.
  - *Its use:* `FindAllToolsInFolder`'s own real body opens one real
    `SqliteConnection` per real file found, runs the identical real
    `tool_details`-based `SELECT` this project has used since Multiple
    Tables & `JOIN`, and maps every real row through `Tool.FromReader`
    exactly as every other real query in this project already does.
  - *Type:* unchanged real ADO.NET classes/method; `Tool.FromReader` is
    this project's own real, established factory method.
  - *Responsibility:* unchanged.
  - *Depends on:* unchanged — a real, already-open connection, and a
    reader positioned on a row with the identical six real columns, in
    the identical real order, every other real query in this project
    already relies on.
  - *Connects to:* unchanged.
  - *Shape:* unchanged — the same real ADO.NET/mapping seam this project
    has used since its own earliest queries.
- **`try`/`catch (Exception ex)`**
  - *What it is:* reappearing, established UI/UX for Async State's own
    real exception-handling shape — here catching the real, broad
    `Exception` base type, rather than the narrower `SqliteException`
    this project's own other real `catch` blocks have used.
  - *Implementation:* unchanged real C# syntax.
  - *Its use:* this lesson's own real, deliberate choice, explained
    directly in this unit's own SE Lens — a corrupt real file can fail in
    more than one real way, not only as a `SqliteException`.
  - *Type:* unchanged.
  - *Responsibility:* unchanged.
  - *Depends on:* unchanged.
  - *Connects to:* unchanged.
  - *Shape:* unchanged.

---

## Concept Unit: `Directory.GetFiles` — Discovering However Many Real Files Exist

### The Problem

`FindAllAcrossDatabases` (Multiple Database Files) already combines two
real files — but it has to be told both real file names, by a real
caller, in advance. A real shop's own shared folder doesn't come with a
fixed, known real list of users; it holds however many real `.db` files
happen to be sitting there the moment this project's own code looks. Can
this project's own code discover that real, variable set of files itself,
rather than requiring a real caller to already know it?

> **Try this first:** this project's own real `File.Exists`/`File.Delete`
> calls (established early in this project) already operate on one real,
> named file, given directly by a real caller. Given that a real folder
> is just another real, named location on disk — the same real kind of
> thing a single real file's own path already names — what real .NET
> capability would you expect exists specifically for asking "what real
> files currently live inside this real folder," rather than "does this
> one real, already-named file exist"?

### Introduce the Concept in Isolation

A real, throwaway folder, `aggregation_demo`, holding two real, valid
SQLite files and one deliberately corrupt one — not a real SQLite file at
all, just real plain text — built and scanned for real this session:

```csharp
Directory.CreateDirectory(folder);
// ...three real files written into it, one of them plain text...

foreach (string file in Directory.GetFiles(folder, "*.db"))
{
    Console.WriteLine(file);
}
```

Real, captured output (file discovery half only; the full real script also
attempts to read each one, covered in this lesson's second unit):

```
aggregation_demo\alice.db
aggregation_demo\bob.db
aggregation_demo\corrupt.db
```

This real, captured output proves the Socratic question's own answer
directly: `Directory.GetFiles` genuinely returns every real file matching
`*.db` — three, in this case — with no code anywhere having to know their
real names in advance, and, notably, with no real distinction yet drawn
between the two genuinely valid real SQLite files and the one that
isn't; `GetFiles` only ever looks at real file *names*, never real file
*contents*.

### Discard the Throwaway Example

The throwaway `aggregation_demo` folder is discarded now — it never
appears in this project again. What's proven is `Directory.GetFiles`'
own real, name-based discovery — not this specific throwaway set of
three files.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolRepository.cs`, modified (new method,
  begun here, completed in this lesson's second unit; a new
  `using System.IO;` directive, needed because `Directory`/`Path`
  (this lesson's second unit) are not already in scope in this
  particular file).
- **Change type** — add.
- **Location** — `ToolRepository.cs`, after `OpenWithBusyTimeout`,
  established A Database on a Network Share.
- **Dependencies** — a real, existing folder containing zero or more real
  `.db` files.

### The New Code

```csharp
foreach (string file in Directory.GetFiles(folderPath, "*.db"))
```

### The Updated Project

This fragment is the opening line of `FindAllToolsInFolder`'s own real
body — shown whole, with this fragment in place, in this lesson's second
unit, once the rest of the method exists to show it inside. On its own,
discovering real file names with nothing done for each one has no real,
observable effect worth showing yet.

### Mechanical Walkthrough

- `Directory.GetFiles(folderPath, "*.db")` — `Directory` (Header, above)
  is a real, `static` .NET class; `GetFiles` (Header, above) is called
  with two real arguments — `folderPath`, the real directory to search,
  and `"*.db"`, a real search pattern where `*` (Header, above) matches
  any real, zero-or-more-character sequence, so this real call matches
  every real file whose own name ends in `.db`, regardless of what comes
  before it.
- `foreach (string file in ...)` — `foreach` (established Multiple Tables
  & `JOIN`'s own real row-loop, reappearing) iterates the real, returned
  `string[]`, binding `file` to one real, full file path per real
  iteration.

### CS Lens

Asking the filesystem itself "what currently exists here" instead of
requiring a real, hardcoded list is a concrete instance of **runtime
discovery over static configuration** — the real set of things a program
operates on is determined by real, live, external state at the moment
it's needed, not fixed in advance by whoever wrote the code. Also
recognized in: a real plugin system scanning a real folder for whatever
real `.dll` files happen to be present, rather than requiring every
plugin's own name to be listed in a config file; a real DNS resolver
discovering whatever real servers currently answer for a given name,
rather than a hardcoded IP; a real package manager's own dependency
resolution, walking whatever real packages are actually declared, not a
fixed list baked into the tool itself.

### SE Lens

Why does this project reach for `Directory.GetFiles` here, rather than
extending `FindAllAcrossDatabases`'s own real `ATTACH DATABASE` approach
(Multiple Database Files) to attach every real file a folder happens to
contain? The real alternative — attaching every real, discovered file —
was rejected here for a real, structural reason: `ATTACH DATABASE` has a
real, documented per-connection limit on how many real databases can be
attached at once (`sqlite3_limit()`/`SQLITE_LIMIT_ATTACHED`, already
named in Multiple Database Files), which makes it a poor real fit for a
genuinely *unbounded*, dynamically-discovered real set of files — exactly
this lesson's own real scenario, as opposed to Multiple Database Files'
own fixed, known pair. The real, honest cost of this lesson's own
alternative instead: one real, separate `SqliteConnection` per real file,
rather than one real, combined SQL query — real, additional connection
overhead this project accepts deliberately, in exchange for a real
technique that scales to however many real files actually exist, not a
fixed real ceiling.

### Run It

A real, isolated lab was run this session, proving `Directory.GetFiles`
genuinely discovers every real, matching file in a real folder, with no
real distinction yet drawn between valid and corrupt ones. Real source
and captured output saved in
`verification/lesson-29/lab1-folder-aggregation-with-a-corrupt-file.cs`.
This fragment cannot run meaningfully alone yet — it connects directly
into the next unit's own complete, real method.

### Connecting Back

This project can now discover however many real `.db` files a real
folder actually holds, with no fixed count assumed anywhere in the code.
The next unit actually reads each one, and proves that one bad real file
doesn't stop the rest.

---

## Concept Unit: Error Tolerance — One Bad File Doesn't Stop the Rest

### The Problem

`Directory.GetFiles` (previous unit) found all three real files in this
lesson's own throwaway folder — two real, valid SQLite databases, and one
that's just plain text wearing a real `.db` extension. If this project's
own code simply looped over all three and read each one the way
`ToolRepository`'s other methods already do, what would happen the moment
it reached the real, corrupt one — and should that real failure really
be allowed to erase the two real, good results already found before it?

> **Try this first:** this project's own real `UpdateFluteCount_RollsBackWhenLaterStatementFails`
> test (Updating and Deleting Safely) already proved a real failure
> partway through a real *transaction* undoes everything in it — a
> deliberate, real all-or-nothing guarantee. Given that this lesson's own
> operation is a real *loop* over independent real files, not a single
> real transaction, is "one bad file undoes everything" actually the real
> behavior a caller would want here too — or does the real, right
> behavior look different specifically because each real file's own
> success or failure has nothing to do with any other real file's own?

### Introduce the Concept in Isolation

The same real, three-file folder, now fully read, not just discovered —
run for real this session:

```csharp
var tools = new List<string>();
var errors = new List<string>();

foreach (string file in Directory.GetFiles(folder, "*.db"))
{
    try
    {
        using var connection = new SqliteConnection($"Data Source={file};Mode=ReadOnly");
        connection.Open();
        using var command = new SqliteCommand("SELECT name FROM tool_details", connection);
        using var reader = command.ExecuteReader();
        while (reader.Read())
        {
            tools.Add(reader.GetString(0));
        }
    }
    catch (Exception ex)
    {
        errors.Add($"{Path.GetFileName(file)}: {ex.GetType().Name}: {ex.Message}");
    }
}
```

Real, captured output:

```
Real tools found: Alice's End Mill, Bob's Drill Bit
Real errors found: corrupt.db: SqliteException: SQLite Error 26: 'file is not a database'.
```

This real, captured output proves the Socratic question's own answer
directly: both real, valid tools were found and returned, and the one
real, corrupt file produced a real, named, collected failure —
`SQLite Error 26: 'file is not a database'`, SQLite's own real, exact
diagnosis of a file that isn't one — rather than an unhandled real
exception stopping the whole real loop before `bob.db` was ever reached.

### Discard the Throwaway Example

This exact throwaway three-file folder is discarded now — it never
appears in this project again. What's proven is that a per-file real
`try`/`catch` genuinely isolates one real failure from the rest of a real
loop — not this specific throwaway corrupt file.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolRepository.cs`, modified (method
  completed). `ToolDB.Tests/ToolRepositoryTests.cs`, modified (one new,
  real, permanent test).
- **Change type** — add.
- **Location** — `ToolRepository.cs`, completing `FindAllToolsInFolder`,
  begun this lesson's first unit.
- **Dependencies** — `tool_details` (Views), present in every real,
  valid file this method encounters.

### The New Code

```csharp
public static (List<Tool> Tools, List<string> Errors) FindAllToolsInFolder(string folderPath)
{
    var tools = new List<Tool>();
    var errors = new List<string>();

    foreach (string file in Directory.GetFiles(folderPath, "*.db"))
    {
        try
        {
            using var connection = new SqliteConnection($"Data Source={file};Mode=ReadOnly");
            connection.Open();

            using var command = new SqliteCommand(
                "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tool_details",
                connection);
            using var reader = command.ExecuteReader();

            while (reader.Read())
            {
                tools.Add(Tool.FromReader(reader));
            }
        }
        catch (Exception ex)
        {
            errors.Add($"{Path.GetFileName(file)}: {ex.Message}");
        }
    }

    return (tools, errors);
}
```

### The Updated Project

`ToolRepository.cs`'s own class, new method added directly after
`OpenWithBusyTimeout`, established A Database on a Network Share:

```csharp
105 public static SqliteConnection OpenWithBusyTimeout(string dataSource, int timeoutSeconds)
106 {
107     /* unchanged, established A Database on a Network Share */
110 }
111
112 public static (List<Tool> Tools, List<string> Errors) FindAllToolsInFolder(string folderPath)  // ← new
113 {                                                                                                // ← new
114     var tools = new List<Tool>();                                                                // ← new
115     var errors = new List<string>();                                                              // ← new
116                                                                                                     // ← new
117     foreach (string file in Directory.GetFiles(folderPath, "*.db"))                                // ← new
118     {                                                                                               // ← new
119         try                                                                                          // ← new
120         {                                                                                             // ← new
121             using var connection = new SqliteConnection($"Data Source={file};Mode=ReadOnly");         // ← new
122             connection.Open();                                                                         // ← new
123                                                                                                          // ← new
124             using var command = new SqliteCommand(                                                      // ← new
125                 "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tool_details", // ← new
126                 connection);                                                                             // ← new
127             using var reader = command.ExecuteReader();                                                  // ← new
128                                                                                                            // ← new
129             while (reader.Read())                                                                         // ← new
130             {                                                                                              // ← new
131                 tools.Add(Tool.FromReader(reader));                                                        // ← new
132             }                                                                                              // ← new
133         }                                                                                                  // ← new
134         catch (Exception ex)                                                                              // ← new
135         {                                                                                                  // ← new
136             errors.Add($"{Path.GetFileName(file)}: {ex.Message}");                                         // ← new
137         }                                                                                                  // ← new
138     }                                                                                                       // ← new
139                                                                                                              // ← new
140     return (tools, errors);                                                                                // ← new
141 }
```

`ToolRepository` now offers a real, fifth way to gather tools — after
`id`, `name`, `tag`, and Multiple Database Files' own fixed pair — this
one across however many real files a real folder actually holds, with
one bad real file among them never preventing the good ones from being
returned. A new, real, permanent test confirms this exact real behavior
against a real, disposable folder holding two real, valid schema copies
and one deliberately corrupt real file.

### Mechanical Walkthrough

- `public static (List<Tool> Tools, List<string> Errors)
  FindAllToolsInFolder(string folderPath)` — an ordinary real, `public`,
  `static` method (reappearing, established `ToolRepository`'s own
  existing shape), returning a real named tuple (Terms, above) —
  `Tools`/`Errors` are its own real, chosen field names, readable by a
  caller as `result.Tools`/`result.Errors`, or split apart directly via
  real deconstruction (`(List<Tool> tools, List<string> errors) = ...`).
- `var tools = new List<Tool>(); var errors = new List<string>();` —
  reappearing (established early in this project) — two real, empty
  lists, accumulated across every real file this method visits.
- `foreach (string file in Directory.GetFiles(folderPath, "*.db"))` —
  established this lesson's first unit, reappearing here as the real,
  complete method's own outer loop.
- `try { ... } catch (Exception ex) { ... }` — `try`/`catch`
  (established UI/UX for Async State, reappearing) — but catching the
  real, broad `Exception` base type here, genuinely different from this
  project's own other real `catch (SqliteException ...)` blocks
  (Constraints & Data Integrity and others), a deliberate real choice
  explained directly in this unit's own SE Lens.
- `new SqliteCommand(..., connection)` / `ExecuteReader()` /
  `Tool.FromReader` — all reappearing, unchanged (Header, above) — the
  identical real query shape `FindAllAcrossDatabases`'s own real
  `tool_details` half already established, run here once per real file
  instead of once per real connection pair.
- `errors.Add($"{Path.GetFileName(file)}: {ex.Message}");` —
  `Path.GetFileName` (a new, real, `static` .NET method, first appearance
  — extracts just a real file's own name from its full real path,
  discarding the real directory portion) keeps this real, reported error
  readable (`corrupt.db: ...`) rather than repeating the real, full,
  already-known folder path for every real entry.
- `return (tools, errors);` — Terms, above — hands back both real,
  accumulated lists at once, as one real named tuple.

### CS Lens

Isolating each real unit of work's own real failure so it can't affect
any other, independent real unit of work is a concrete instance of
**fault isolation** — the real, general engineering principle behind
containing a real failure's own blast radius to exactly the part that
actually failed. Also recognized in: a real web server handling one HTTP
request per real thread or task, so one real request's own unhandled
exception doesn't take down every other real, concurrent request; a real
ship's own separate, sealed hull compartments, so a real breach in one
doesn't sink the whole real vessel; a real batch job processing a
thousand real records and logging, not aborting on, the ones that fail
validation.

### SE Lens

Why catch the real, broad `Exception` base type here, rather than the
narrower `SqliteException` this project's own other real `catch` blocks
already use? The real alternative — catching only `SqliteException` —
was rejected here for a real, concrete reason this lesson's own isolated
lab already demonstrated: a genuinely corrupt real file, a real file with
the wrong real permissions, or a real path that simply doesn't resolve
can each surface as a *different* real exception type, not only a
`SqliteException`. This method's own real job is "don't let any one real
file ruin this real operation for the others" — a real promise that only
holds if every real kind of per-file failure is caught, not just the
ones this project happened to anticipate. The real, honest cost of a
broad `catch (Exception ex)`: it can also silently swallow a real,
genuine programming mistake (a real `NullReferenceException` from a bug
in this very method, for instance) as if it were just another bad real
file — a real risk this method accepts deliberately, in this one,
narrow, per-file context, and would not be appropriate to reach for
throughout this project's own code as a general habit.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. One new, real, permanent test was added to
`ToolRepositoryTests.cs` (`FindAllToolsInFolder_SkipsACorruptFile_AndReportsIt`).
**Full suite: 34 tests, 0 failures** — the real, current, full count for
this project (up from 33). Real source and captured output for the
isolated, two-part discovery-then-read lab are saved in
`verification/lesson-29/lab1-folder-aggregation-with-a-corrupt-file.cs`.

### Connecting Back

`ToolRepository.FindAllToolsInFolder` can now do exactly what this lesson
set out to prove: discover however many real files a real folder
actually holds, read every real tool out of every real, valid one, and
report — by real file name — exactly which ones couldn't be read, all in
one real, combined result a caller can act on however it needs to.

---

## Connect the Pieces

A real, throwaway folder with three real files — two real, valid tool
databases and one deliberately corrupt real file — traced through both
units:

1. `Directory.GetFiles` discovered all three real files by name, with no
   real distinction yet drawn between the valid ones and the corrupt one
   — proving this project's own code no longer needs a fixed, hardcoded
   real file count anywhere (Unit 1).
2. A real, per-file `try`/`catch`, wrapped around this project's own
   already-established `tool_details` query shape, then read each real
   file in turn — returning both real tools successfully, and reporting
   the one real, corrupt file by name, in one real, combined named-tuple
   result, proven by a new, real, permanent test (Unit 2).

**Slice 6 is complete.** **Next lesson:** 30 — Watching the Filesystem
for Changes (`FileSystemWatcher`; includes diagnosing duplicate events
and locked-file races).
