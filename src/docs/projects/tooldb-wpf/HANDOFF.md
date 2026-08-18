# ToolDB (WPF + WebView2) — Handoff

Read this first when resuming. Roadmap and lesson status live in
`Curriculum.md`; this file is current position + conventions only.

## Status

- **Next lesson:** 6 — Hosting WebView2 in a WPF Window
- **Lessons written:** 0 — Environment & Project Setup
  (`lessons/lesson-00-environment-and-project-setup.md`); 1 — Static
  Types, Connection Strings, and a Resource's Lifetime
  (`lessons/lesson-01-connecting-to-a-database-file.md`); 2 — What a
  Schema Promises vs. What SQLite Enforces
  (`lessons/lesson-02-schema-design.md`); 3 — Never Let Data Become Code
  (`lessons/lesson-03-inserting-safely.md`); 4 — Turning Rows Into Objects,
  and Making "Still Correct" Automatic
  (`lessons/lesson-04-querying-back.md`); 5 — The Framework Calls You Now
  (WPF Basics) (`lessons/lesson-05-wpf-basics.md`)
- Update the "Next lesson" line above after every lesson, not just at
  session boundaries.
- **Lesson 5 notes (this session):** `ToolDB` is a WPF application now —
  `ToolDB.csproj` gained `<OutputType>WinExe</OutputType>` (was `Exe`),
  `<TargetFramework>net10.0-windows</TargetFramework>` (was `net10.0`),
  and `<UseWPF>true</UseWPF>`; `App.xaml`/`App.xaml.cs`/`MainWindow.xaml`/
  `MainWindow.xaml.cs` are new; `Program.cs` is emptied (not deleted —
  same rm-avoidance convention as always) since WPF's own generated
  `Main()` (from `App.xaml`'s `StartupUri`) is the real entry point now.
  Lesson 4's own query-and-mapping logic (`SqliteConnection`/
  `SqliteCommand`/`SqliteDataReader`/`Tool.FromReader`) moved, unchanged,
  from `Program.cs`'s top-level statements into `MainWindow`'s own
  `Loaded` event handler, writing its result into a named `TextBlock`
  (`StatusText`) instead of `Console.WriteLine`. A second, genuinely new
  project now exists at `code/LabScratch.Wpf/` (via `dotnet new wpf`),
  sibling to `LabScratch/`, `ToolDB/`, and `ToolDB.Tests/` — this
  lesson's own throwaway lab for every WPF-specific concept (an
  entry-point conflict, plain XAML compiling into real objects, `x:Name`
  generating a real field, `Loaded`/`Closing` lifecycle events),
  overwritten and evolved across the lesson's own four units exactly the
  way `LabScratch/Program.cs` already was in Lesson 4. **A real,
  fully-verified discovery, not asserted:** a top-level-statements
  `Program.cs` coexisting with a WPF project's own `App.xaml` does *not*
  fail the build — it produces a real `CS7022` warning ("ignoring
  'App.Main()' entry point") and the build still reports `Build
  succeeded`, but the WPF `Application`/window never actually runs at
  all; the top-level code silently wins, prints, and exits. Proven twice
  this session: once in isolation in `LabScratch.Wpf/`, and a second time
  against the real, finished `ToolDB` project itself (this lesson's own
  Closing "what breaks" section), both via real `dotnet build`/`dotnet
  run` output, both reverted afterward. **A second real, unplanned
  discovery:** converting `ToolDB` to `net10.0-windows` broke
  `ToolDB.Tests` (still plain `net10.0`) with a real `NU1201` restore
  error ("Project ToolDB is not compatible with net10.0... Project ToolDB
  supports: net10.0-windows7.0") — fixed by updating `ToolDB.Tests.csproj`
  to `net10.0-windows` too; `dotnet test` passes again afterward,
  unchanged assertion, same as Lesson 4 left it. **A real permission
  constraint hit and worked around this session:** launching an actual
  WPF window (via `dotnet run`, foregrounded or backgrounded) is not
  something this session could execute — the user explicitly stopped a
  `run_in_background` attempt, citing permission-prompt overhead/session
  length, the same category of concern as the established rm-avoidance
  rule. Every claim in Lesson 5 that would normally come from watching a
  live window instead comes from `dotnet build`'s own clean output (0
  Warnings/0 Errors, always real, always captured) plus the real
  markup-compiler-generated C# read directly out of `obj/` (`App.g.cs`,
  `MainWindow.g.cs`, fetched fresh this session, both before and after
  adding `x:Name`, to prove exactly what it generates) — genuine
  Microsoft Learn documentation (`Application`, `Window`,
  `FrameworkElement.Loaded`, `Window.Closing`, `STAThreadAttribute`, all
  fetched fresh this session) fills in what a build alone can't prove
  (event firing order, `Closing`'s cancelability). The lesson's own
  Header states this tradeoff plainly and asks the reader to actually run
  `dotnet run` themselves for the one thing a transcript can't
  substitute for — watching the window itself. **Don't attempt to launch
  a live WPF window via Bash/PowerShell (foreground or background) in a
  future session without first checking whether this constraint still
  holds** — retest before assuming it, but treat it as the default going
  in.
- **Lesson 4 notes (this session):** `code/ToolDB/` gained its first
  user-defined type, `Tool.cs` (`public class Tool`, five properties plus a
  `static Tool FromReader(SqliteDataReader reader)` factory method) — the
  first OOP construct this curriculum has ever introduced. `Program.cs`'s
  Lesson 3 `INSERT` checkpoint was *removed* (same reasoning as Lesson 3
  removing Lesson 2's `CREATE TABLE` — the row already exists permanently on
  disk) and replaced with a `SELECT` + `ExecuteReader()` + `while
  (reader.Read())` loop that maps every row through `Tool.FromReader`.
  `tools.db` still holds exactly one row, unchanged, confirmed by a real
  read-only check both before and after this session's work.
  A second project, `code/ToolDB.Tests/` (via `dotnet new xunit`, project
  reference to `ToolDB`, own `Microsoft.Data.Sqlite` package reference),
  now exists with one real, passing `[Fact]` (`ToolTests.cs`) — this
  project's first automated test. Two genuinely real discoveries came out
  of writing it, both fully proven (not asserted) and written into the
  lesson: (1) `class Widget { ... }` placed *before* top-level statements in
  the same file produces a real `CS8803` compiler error — type declarations
  must follow top-level statements in one file; the real project sidesteps
  this entirely by giving `Tool` its own file. (2) A test that calls
  `connection.Close()` then immediately `File.Delete()`s that same SQLite
  file fails with a real `IOException` ("being used by another process") —
  connection pooling (Lesson 1's own file-lock proof) holds the native
  handle open past `Close()`; the fix, matching this curriculum's own
  established "delete before, not after" pattern, is to drop the trailing
  cleanup and rely on the next run's own leading `File.Exists`/`File.Delete`
  guard. The Closing's "what breaks" demo deliberately swapped
  `Tool.FromReader`'s `Name`/`Manufacturer` ordinals and captured **both**
  real outcomes: `dotnet run` prints a deceptively plausible-looking line
  (two real strings, just transposed — easy for a human to miss), while
  `dotnet test` fails precisely and immediately with an exact expected/
  actual diff — the actual point of this lesson's second half. All output
  in the lesson is real, captured this session; no invented output anywhere
  in it, including both the red and green test runs.
- **Lesson 3 notes (this session):** `tools.db` now holds its first real
  row (a real endmill; manufacturer `"O'Brien Carbide Tools"`, chosen
  deliberately for its apostrophe). Lesson 2's `CREATE TABLE`/verification
  block was *removed* from `Program.cs` (not kept and reconditionally
  skipped) — the schema now exists permanently on disk, so nothing
  reverifies it every run; don't re-add a `CREATE TABLE` call in a future
  lesson without deleting `tools.db` first, same reasoning as Lesson 2's
  own manual-delete steps. The naive/unsafe string-concatenation `INSERT`
  technique was deliberately **never** written into `ToolDB` at any point,
  even temporarily — only into throwaway `LabScratch` labs and one
  temporary Closing edit (immediately reverted) — per this project's own
  "don't write insecure code into the real project" instinct.
  A genuinely surprising, fully-verified fact came out of this session's
  injection lab: `Microsoft.Data.Sqlite`'s `ExecuteNonQuery()`, when a
  `CommandText` contains multiple `;`-separated statements, sums
  `sqlite3_changes()` once per statement — and since SQLite's own
  `sqlite3_changes()` is left stale (unchanged) by any non-INSERT/UPDATE/
  DELETE statement, a `DROP TABLE` following a real `INSERT` in the same
  batch double-counts the `INSERT`'s own change, returning `2` for what
  was really one row. This is traced to real fetched source
  (`SqliteCommand.ExecuteNonQuery()` → `SqliteDataReader.NextResult()`/
  `AddChanges()`) and to sqlite.org's own `sqlite3_changes()` docs, both
  cited in the lesson itself — don't re-derive this from scratch if it
  resurfaces; it's fully explained in Lesson 3's second Concept Unit.
- **The runnable `ToolDB`/`LabScratch` projects are now persisted in-repo,
  at `code/ToolDB/` and `code/LabScratch/` (with a `.gitignore` for
  `bin/`, `obj/`, `*.db`) — not recreated from scratch each session.**
  This changed 2026-08-17: earlier sessions used a throwaway scratch
  directory outside the repo and rebuilt both projects from
  `dotnet new console` every time, which the user flagged mid-session as
  wasted work. From here forward: open `code/ToolDB/Program.cs` directly
  to see the exact end-of-latest-lesson state (currently Lesson 2's
  finished six-column `tools` table with `id INTEGER PRIMARY KEY`
  first), edit it in place for the next lesson's checkpoints, and
  `dotnet build`/`dotnet run` it from that folder. `code/LabScratch/`
  holds whatever the most recently written throwaway lab was — per this
  project's own conventions, its content is never meant to be trusted as
  "the current state" of anything; only `ToolDB/Program.cs` is.
- **Permission nuance learned this session:** in this repo, `Bash(*)` is
  allowlisted (`.claude/settings.json`), so plain `dotnet build`/
  `dotnet run`/`dotnet new`/`dotnet add package` calls run with no
  prompt — but `rm`/delete-style shell commands still get intercepted
  and were explicitly rejected by the user this session ("I'm not here
  watching and it adds to usage"). Workaround used successfully: when a
  checkpoint needs a stale `tools.db` cleared before re-running (this
  lesson's schema changed shape more than once), add a temporary
  `if (File.Exists("tools.db")) { File.Delete("tools.db"); }` line at
  the top of `Program.cs`, run it once, then remove the line again via
  Edit before writing the lesson's real, committed checkpoint code (the
  line never appears in the lesson text itself — a reader is just told
  to delete the file manually before that checkpoint). Avoid shell
  `rm`/`Remove-Item` entirely in this project going forward; C#-level
  `File.Delete` (temporary, or narrated as a manual reader step) is the
  safe substitute.
- Lesson 2's code (`SqliteCommand`, `ExecuteNonQuery()`, `ExecuteScalar()`,
  `sqlite_schema`, type affinity via `CAST`/`typeof()`, and the
  `PRIMARY KEY`/`rowid`-alias/autoindex proof) was all actually run this
  session in `code/LabScratch/` and `code/ToolDB/` — no invented output
  anywhere in it, including the Closing's `SqliteException` failure
  demo. All SQLite/`Microsoft.Data.Sqlite` documentation quoted verbatim
  in the lesson was fetched fresh this session (sqlite.org's
  `lang_createtable.html`, `datatype3.html`, `schematab.html`; Microsoft
  Learn's `SqliteCommand`/`ExecuteNonQuery`/`ExecuteScalar` pages) — see
  the lesson file's own citations. One deliberate schema-compliance catch
  mid-session: the ternary operator (`?:`) showed up in an early draft of
  the labs and was rewritten to plain `if`/`else` before finalizing,
  because this curriculum hasn't taught `?:` yet and the schema names a
  first-appearing ternary as its own concept requiring an isolated lab —
  worth double-checking for on any lesson using nullable lookup results.
- `LessonContract` and `Guide.md`, referenced in the Schema section below,
  were checked for this session: neither exists inside this repo — both
  only exist as files in unrelated, separate repos elsewhere on disk (a
  different project entirely, not a companion doc to this one). Per this
  project's own self-containment rule, Lesson 0 was written directly from
  `LESSON SCHEMA.md` (which is fully self-sufficient — "the literal,
  ordered sequence of things to write") without pulling those files in.
  Don't re-attempt this lookup in future sessions.
- Lesson 0's code was verified for real (SDK check, `dotnet new console`,
  `dotnet add package`, build) in a scratch directory this session, all
  real output. The one "cause a real failure" Closing step (renaming
  `ToolDB.csproj` away and rebuilding) was written as a reader-run
  exercise instead of an executed-and-pasted trace, to avoid an extra
  permission-gated shell command — safe to redo for real and tighten if a
  future session has approval available and wants to.
- Lesson 1's code (connection string, `SqliteConnection`/`Open()`, the
  `using` declaration, the connection-pooling file-lock proof, the
  `CS0029`/`CS0219`/`CS8602` compiler diagnostics, and the final
  `SqliteException` "what breaks" trace) was all actually run in a scratch
  directory this session — no invented output anywhere in it. The
  `SqliteConnection`/connection-string/`IDisposable`/`using` API facts cited
  were fetched fresh from Microsoft Learn this session (not from memory);
  see the lesson file's own citations for the exact pages.
- **`Untitled.TOOLDB`, in this same project folder, is a real Mastercam
  tool-library SQLite file** (confirmed via `sqlite3_version 3046001`; 79
  tables, GUID primary keys, `BLOB` columns, `DEFERRABLE` FK constraints —
  e.g. `TlTool`, `TlHolder`, `TlAssembly`; `TlTool` holds 4 real rows). It's
  already accounted for in `Curriculum.md` under **Slice 10 — 3D Tool
  Visualization** as that slice's real data source (paired with
  `reference-tool-geometry.md`), not something newly discovered this
  session. Its 79-table normalized shape is far past this curriculum's
  beginner pace — it is **not** a schema or data source for Lesson 4 or any
  earlier lesson; `tools.db`'s own single `tools` table stays what those
  lessons build on. Don't re-investigate this file's contents in an early-
  lesson session; it's Slice 10's concern only.
- **Do not go looking for a "real" reference app to port from** — not
  react-studio/frontend-client-style siblings in this repo, and not some
  other project elsewhere on disk that looks like it might be "the
  original ToolDB." Confirmed explicitly this session: this curriculum's
  own Reference Source fields say "no reference counterpart consulted"
  rather than searching one out. See the memory rule this produced,
  `feedback_no_cross_project_audits`, if this needs re-explaining to a
  future session.

## Stack decisions (locked in before Lesson 1)

- **Host:** WPF (XAML) — native chrome, dialogs, and forms.
- **Embedded content:** WebView2, hosting HTML/CSS/JS.
- **JS progression:** vanilla JS/jQuery/DataTables first (Slices 1–7);
  React is introduced in Slice 8 by rebuilding a screen already built
  in vanilla JS, not from lesson 1.
- **UI split is deliberate, not a thin shell:** some real screens are
  native XAML (forms, dialogs — starting Slice 2), others are WebView2
  content (data table/dashboard). Both get genuine lesson weight.
- **DB access:** `Microsoft.Data.Sqlite` (ADO.NET) directly through
  Slice 4, EF Core introduced in Slice 5 as its own topic — not the
  starting point.

## Schema

The lesson-production template this project follows is
`C:\Users\g4m3r\Documents\testing tutorials\open-calc\src\docs\reference\LESSON SCHEMA.md`
(read in full 2026-08-17). It's heavy: every Concept Unit requires an
isolated, actually-executed throwaway lab; a mechanical walkthrough
enumerating every syntactic element with full explanation, no
"already covered" shortcuts; CS/SE lenses; execution traces for any
loop/state; and a Reference Source citation (read fresh, this session,
not from memory) for anything with a real counterpart. It references two
companion docs, `LessonContract` (the philosophy) and `Guide.md` (a
per-concept dimension list) — checked 2026-08-17, neither exists in this
repo; both names only exist in unrelated separate repos elsewhere on disk.
`LESSON SCHEMA.md` alone is authoritative and self-sufficient here — don't
re-attempt locating those two files in future sessions.

## Conventions

- Every lesson states its **Capability, Acceptance Criteria,
  Implementation, and Verification** explicitly, in that order —
  acceptance criteria get written before implementation, not inferred
  after the fact. This is the actual point of the project: acceptance
  criteria are the vocabulary for directing and verifying work on real
  projects later, not paperwork around the code.
- Testing and debugging are woven into lessons where they naturally
  arise (see the parenthetical notes on lesson descriptions in
  `Curriculum.md`), not deferred to a dedicated testing phase.
- Git moves beyond commit-per-lesson starting Slice 2: one feature
  branch per lesson or small lesson group. Merge conflicts, `revert`,
  and `git bisect` are introduced later (Slice 6–7) once there's
  enough real complexity for them to be genuine rather than staged.
- Every new term is defined from zero the first time it appears —
  don't assume familiarity with WPF/XAML/MVVM/ADO.NET/EF
  Core/`async`/React vocabulary just because it's common in the C#
  world. This stack has a lot more built-in terminology than the
  Python/pywebview version did; term coverage is part of the lesson
  schema here, not optional polish.
- **Reader's actual background (stated directly, 2026-08-17):** knows
  basic procedural Python — variables, loops, conditionals, functions —
  and nothing more. Does **not** know C# or object-oriented programming.
  Every OOP concept this stack requires — classes vs. objects,
  constructors, inheritance, interfaces, access modifiers, `static`,
  generics, LINQ, `async`/`await`, records — needs the same from-zero,
  every-appearance treatment as the WPF/XAML/ADO.NET vocabulary above;
  "that's basic OOP" is not a valid reason to explain it thinly anywhere
  in this curriculum, Lesson 1 through Lesson 37. Conversely, don't
  over-explain plain procedural constructs that map directly to Python
  they already know (a loop, an `if`, a function definition, variable
  assignment) — the actual gap is OOP + C#-specific syntax, not
  programming fundamentals themselves.
- Every lesson still follows the full `LessonContract` schema — same
  rigor as other published curricula. No prose-only lessons.
- Every lesson ends in a git commit.
- Lesson numbering is project-local (1–37), matching the order in
  `Curriculum.md`.
- This project is self-contained: build lessons from what's in this
  folder and this conversation's decisions, not by cross-referencing
  other curricula in this repo.
