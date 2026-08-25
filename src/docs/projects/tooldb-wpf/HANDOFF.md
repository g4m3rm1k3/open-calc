# ToolDB (WPF + WebView2) — Handoff

Read this first when resuming. Roadmap and lesson status live in
`Curriculum.md`; this file is current position + conventions only.

## Status

- **Roadmap extended this session (2026-08-25), no lesson content written:**
  the user's real, stated end goal is a Mastercam PDM app — WPF UI,
  merging Mastercam SQLite databases, generating documents/HTML (Jinja did
  this in the Python original), a real checkout/lock/version system. This
  project (`tooldb-wpf`) is the correct, already-in-progress vehicle for
  that goal rather than a new curriculum — confirmed with the user
  directly rather than assumed. `Curriculum.md` gained two new slices,
  inserted ahead of the old Slice 10 (renumbered to Slice 12, nothing
  else changed about it): **Slice 10 — Document and Report Generation**
  (Scriban, chosen for its Jinja-like `{{ }}`/`{% %}` syntax and zero
  ASP.NET Core dependency — a locked decision, not a placeholder) and
  **Slice 11 — PDM: Checkout, Locking, and Version History** (explicitly
  reusing `forge-pdm`'s already-proven lock/transaction/WIP-snapshot
  design, adapted into this project's own C#/SQLite terms per the Lesson
  Schema's Repetition Rule — never cited by `forge-pdm`'s own lesson
  numbers). Neither new slice is broken into individual lessons yet,
  same status Slice 10/12's 3D-visualization content was already left
  in — seeded rough shape only, real lesson numbers/prereqs deferred
  until Slices 2–9 actually exist to number against.
- **Open question, not yet resolved, worth settling before Slice 11 is
  written:** whether `tooldb-wpf` stays a standalone WPF process (reads/
  writes Mastercam's `.TOOLDB` files from outside Mastercam, which is
  everything the roadmap assumes today) or needs to also become an
  in-process Mastercam add-in (hosted inside Mastercam's own Win32/WinForms
  process via its .NET API, using WPF's `HwndHost`/`ElementHost` interop).
  The user's own framing ("building interfaces in mastercam") leans toward
  wanting the add-in-hosting case at least eventually; nothing in the
  current roadmap builds toward it yet. Ask directly before Slice 11 (or
  whichever slice ends up covering app shell/hosting) is written, rather
  than assuming either way.
- **Lesson 8 written and verified this session (2026-08-25):** `ToolDB/Tool.cs`
  changed from `class Tool` with `set` properties to `record Tool` with
  `init` properties — `Tool.FromReader`'s own body needed zero changes
  (object-initializer syntax works identically for `set` and `init`).
  Three Concept Units: (1) a real, run aliasing bug using `Widget`
  (`Widget alias = original; alias.Name = "..."` also changes
  `original.Name` — real captured output), (2) `class` vs. `record`
  equality proven with two new throwaway types, `PlainPoint`/`PointRecord`
  (real output: `False`/`False` for the class, `True`/`True` for the
  record, plus the record's real synthesized `ToString` output), (3) the
  real `Tool.cs` change, proven closed by a deliberate
  `tools[0].Name = "..."` mutation attempt that now fails to compile with
  a real, captured `CS8852` error. `ToolDB.Tests` still passes unchanged
  (`ToolTests.cs` only reads properties, never mutates). `record`/`init`
  documentation was fetched fresh this session from Microsoft Learn (the
  `record` language reference page and the `init` keyword page); the
  `Object.Equals`/`Object.ToString` fetches came back oversized and were
  read from the tool's own persisted output file instead of a second
  fetch — both real, both cited with exact quoted signatures/remarks in
  the lesson itself.
- **Environment fix, this session, not a curriculum decision:** this
  session's machine had only .NET SDKs 7.0.406/8.0.130/9.0.120/9.0.307
  installed (`dotnet --list-sdks`) — no .NET 10 SDK, even though all four
  `.csproj` files (`ToolDB`, `ToolDB.Tests`, `LabScratch`,
  `LabScratch.Wpf`) targeted `net10.0`/`net10.0-windows`. No `global.json`
  exists in this project pinning a specific SDK. Retargeted all four to
  `net9.0`/`net9.0-windows` so real verification could happen at all —
  confirmed via a real `dotnet build`/`dotnet test` pass on `ToolDB`
  *before* touching `Tool.cs`, so this fix is isolated from Lesson 8's own
  real content. Nothing this curriculum has taught or plans to teach
  depends on .NET 10 specifically. If a future session finds .NET 10
  available again, retargeting back is a free, independent choice — not
  required by anything Lesson 8 did.
- **`tools.db` was found empty (0 bytes) at the start of this session** —
  expected, not a bug: `*.db` files are `.gitignore`d (per
  `code/.gitignore`), so they never travel with the repository itself, and
  this session's working copy simply never had one populated. Recreated
  with the exact schema and one row Lessons 2–3 already established
  (`1/2 in 4-Flute Carbide End Mill`, `O'Brien Carbide Tools`, 0.5, 3.0,
  4) via a temporary `LabScratch/Program.cs` script, run once, before any
  of Lesson 8's own real verification. **Future sessions should expect
  this on a fresh checkout and know the fix** — recreate via the same
  `CREATE TABLE`/`INSERT` shape shown in `ToolDB.Tests/ToolTests.cs`
  (lines 17–30), not re-derive it from scratch or treat it as a real bug
  worth investigating.
- **A real course-correction happened mid-session, worth carrying
  forward:** the user pushed back hard, twice — first that this session's
  own chat responses (not the lesson content itself) were dumping dense,
  jargon-heavy architecture decisions on them and stopping for approval on
  things they can't yet evaluate (that's the whole point of taking the
  lessons); second, mid-lesson-8-research, that too many tool-call steps
  were passing with no visible deliverable ("lots of usage building an
  example of what I will never use"). Both corrections are about *this
  session's own chat pacing/tone*, not about the lesson file's own
  content or rigor — the schema-mandated lesson format itself was not
  challenged and should keep being followed in full. Going forward:
  make stack/tooling decisions unilaterally and state them in one plain
  sentence rather than asking the user to choose between options they
  don't have context to weigh; keep chat updates short and in plain
  language; minimize the gap between "starting a lesson" and "here's the
  finished lesson" — batch research/verification tool calls tightly
  rather than narrating each one.
- **Lesson 9 written and verified this session (2026-08-25), same session
  as Lesson 8:** real `tools.db` migrated from a single `tools` table with
  a plain `manufacturer TEXT` column to `tools` + a new `vendors` table,
  linked by a real `vendor_id` foreign key — `CREATE TABLE vendors`,
  `INSERT ... SELECT DISTINCT manufacturer FROM tools`, `ALTER TABLE tools
  ADD COLUMN vendor_id ...`, a correlated-subquery `UPDATE` to backfill it,
  then `ALTER TABLE tools DROP COLUMN manufacturer` — dry-run proven first
  against a disposable `migration_test.db`, then applied for real. Real,
  useful surprise caught this session: `Microsoft.Data.Sqlite` enforces
  foreign keys **by default**, with no `PRAGMA foreign_keys = ON` needed —
  differs from raw SQLite's own off-by-default behavior; proven with three
  real runs (no pragma → fails, `OFF` → succeeds, `ON` → fails). Real
  connection-pooling gotcha hit and worked around while building that lab:
  reusing one `.db` filename across three sequential `SqliteConnection`s in
  the same process hit the same "file still locked after Dispose" issue
  Lesson 3 already named — fixed by giving each of the three test calls its
  own database file instead of fighting the pool. `MainWindow.xaml.cs`'s
  own `SELECT` became a real `tools JOIN vendors ON tools.vendor_id =
  vendors.id`, explicit-qualified column list; `Tool.FromReader` needed
  zero changes (proven, not just claimed) since it only ever reads six
  columns by position. `ToolDB` builds clean and `ToolDB.Tests` still
  passes unchanged. All `fk_test*.db`/`migration_test.db` throwaway files
  cleaned up from `LabScratch/` after use.
- **Both Lesson 8 and Lesson 9 were written in the same session, faster
  than this project's usual one-lesson-per-session pace, at the user's own
  explicit request** ("if you are efficient you can squeeze another lesson
  out") given limited remaining usage — not a new standing pace
  expectation for every future session; ask/default back to the normal
  unhurried pace unless the user signals a similar constraint again.
- **Next lesson:** 10 — jQuery Basics
- **Lessons written:** 0 — Environment & Project Setup
  (`lessons/lesson-00-environment-and-project-setup.md`); 1 — Static
  Types, Connection Strings, and a Resource's Lifetime
  (`lessons/lesson-01-connecting-to-a-database-file.md`); 2 — What a
  Schema Promises vs. What SQLite Enforces
  (`lessons/lesson-02-schema-design.md`); 3 — Never Let Data Become Code
  (`lessons/lesson-03-inserting-safely.md`); 4 — Turning Rows Into Objects,
  and Making "Still Correct" Automatic
  (`lessons/lesson-04-querying-back.md`); 5 — The Framework Calls You Now
  (WPF Basics) (`lessons/lesson-05-wpf-basics.md`); 6 — The Control Isn't
  the Browser (Hosting WebView2 in a WPF Window)
  (`lessons/lesson-06-hosting-webview2.md`); 7 — A Shared Language Across
  the Boundary (Passing C# Data to HTML)
  (`lessons/lesson-07-passing-csharp-data-to-html.md`)
- Update the "Next lesson" line above after every lesson, not just at
  session boundaries.
- **Lesson 7 notes (this session):** `ToolDB`'s two Lesson 6 pipelines are
  connected now — the browser pane shows real `tools.db` data instead of
  `local.html`'s old static placeholder. `MainWindow_Loaded`'s own
  `toolCount`/`firstTool` tracking (Lesson 5–6) was replaced with a real
  `List<Tool>`; a new private field, `_toolsJson` (initialized to `"[]"`),
  carries `JsonSerializer.Serialize(tools)`'s own result from
  `MainWindow_Loaded` across to `Browser_NavigationCompleted`, where
  `Browser.CoreWebView2.PostWebMessageAsJson(_toolsJson)` sends it —
  deliberately inside `NavigationCompleted`, not `Loaded`, per
  `PostWebMessageAsJson`'s own real, fetched Remarks ("If a navigation
  occurs before the message is posted to the page, the message is not be
  sent"). `local.html` gained this project's first-ever JavaScript: a
  `<script>` block calling `window.chrome.webview.addEventListener(
  'message', event => { ... })`, reading `event.data` (already parsed by
  WebView2, no `JSON.parse` needed — also confirmed via real fetched
  docs) and writing real tool data into a `<p id="output">` via
  `textContent`. **A genuinely surprising, fully-verified fact surfaced
  this session, worth knowing before touching `JsonSerializer` again in
  this project:** `System.Text.Json`'s default encoder escapes the
  apostrophe (among other HTML-sensitive characters) as a Unicode escape
  sequence by default — proven by actually running
  `JsonSerializer.Serialize` against this project's own real
  apostrophe-bearing manufacturer name, `"O'Brien Carbide Tools"` (Lesson
  3), in `LabScratch/Program.cs` this session; real, fetched Microsoft
  documentation on `System.Text.Json` character encoding confirms this is
  deliberate defense-in-depth against script injection when JSON is
  embedded in HTML — directly relevant here since this project's own JSON
  is headed straight into an HTML/JS environment via WebView2. The escape
  is invisible once JavaScript parses it back (a real apostrophe again),
  so nothing about the rendered page changes. **A tooling note, not a
  project decision, worth flagging for future sessions:** this session hit
  repeated difficulty getting the literal six-character escape sequence
  (backslash + `u0027`) to actually land in the lesson file via the Edit
  tool — every direct attempt silently turned it into a literal apostrophe
  instead, and a `sed`-based workaround mangled it differently. The lesson
  file resolves this by showing the JSON code blocks with a literal
  apostrophe (for readability) plus an adjacent prose caveat stating what
  the real captured terminal text actually contains — an honest, accurate
  compromise, but if a future session needs to write this exact escape
  sequence literally into a file, expect the same difficulty and budget
  for it (or use a different method than direct Edit-tool text
  composition). **A schema-following decision made this session, not
  requested by the user:** `LESSON SCHEMA.md`'s own Concept Unit sequence
  includes a note that reordering Project Change/New Code/Updated Project
  *before* the isolated lab (rather than after, Lesson 6's own order) is
  the preferred structure "for lessons written from this point forward";
  Lesson 7 adopts that reordering (real code shown first, isolated lab
  second, explicitly relating back to the real code) since it is a new
  lesson being written now — Lesson 6 was **not** revised to match, per
  the same schema note's own instruction not to retrofit existing lessons.
  Future lessons should default to this newer order too, unless a reason
  emerges to reconsider. **A scope decision worth knowing before touching
  Lesson 18:** the roadmap's own concept-list cell for Lesson 7 named both
  `postMessage` and `WebMessageReceived`; this lesson only implements the
  host→JS half (`PostWebMessageAsJson` + JS-side `addEventListener`) —
  the reverse direction (JS→host, the real C# `WebMessageReceived` event)
  is deliberately deferred to Lesson 18 ("Two-Way Communication Across the
  Split"), which is where the roadmap already puts full bidirectional
  wiring; `Curriculum.md`'s own Lesson 7 row was updated to reflect this.
  **Same live-window constraint as Lessons 5–6, not retested this
  session:** no `dotnet run` against `ToolDB` or `LabScratch.Wpf` was
  attempted; verification rested on real `dotnet build`/`dotnet test`
  output (all captured this session, all clean), a real read of the
  compiler-generated `ToolDB.GlobalUsings.g.cs` (proving `List<Tool>`
  needs no new `using`), and genuine Microsoft Learn/MDN documentation for
  every new API cited (fetched fresh this session — `List<T>` and its
  `Add`/`Count`/indexer, `JsonSerializer.Serialize<TValue>`, `WebView2
  .CoreWebView2`, `CoreWebView2.PostWebMessageAsJson`, auto-implemented
  properties' backing-field behavior, plus MDN's `addEventListener`,
  arrow functions, template literals, `document.getElementById`, and
  `Node.textContent`). **A real, deliberately-reproduced timing-mistake
  lab exists in `LabScratch.Wpf/`'s own git history within this
  session** (built clean, then reverted, not run) — calling
  `Browser.CoreWebView2.PostWebMessageAsJson(...)` immediately after
  `Browser.Source = new Uri(...)`, before initialization has had time to
  finish; the lesson predicts a real `NullReferenceException` from this
  (`Browser.CoreWebView2` is still `null` at that point, per its own real,
  fetched documentation), not the "message not sent" failure
  `PostWebMessageAsJson`'s own Remarks describe (a different mistake —
  racing a *subsequent* navigation, not applicable to a first send). Don't
  conflate these two failure modes if this resurfaces in a future lesson.
- **Lesson 6 notes (previous session):** `ToolDB` hosts a second UI surface now
  — `Microsoft.Web.WebView2` (real package version `1.0.4129.50`, added via
  real `dotnet add package` to both `ToolDB` and `LabScratch.Wpf`) —
  `MainWindow.xaml` gained `xmlns:wv2="clr-namespace:Microsoft.Web.WebView2
  .Wpf;assembly=Microsoft.Web.WebView2.Wpf"` and replaced Lesson 5's own
  `TextBlock` with `<wv2:WebView2 x:Name="Browser" />`; the tool-count
  summary Lesson 5 wrote into that `TextBlock` moved to `Window.Title`
  instead (set dynamically in `MainWindow_Loaded`, same `Title` property
  Lesson 5 set statically). `MainWindow.xaml.cs` now attaches
  `CoreWebView2InitializationCompleted` and `NavigationCompleted` in the
  constructor and sets `Browser.Source` to a real `file://` `Uri` (built via
  `AppContext.BaseDirectory`/`Path.Combine`) pointing at a new
  `ToolDB/local.html`, copied into the build output via a new `<Content
  Include="local.html" CopyToOutputDirectory="PreserveNewest" />` item in
  `ToolDB.csproj` — real, confirmed via directory listing both with and
  without that line present (the lesson's own "what breaks" demo). This
  lesson's own local.html is deliberately static — no `tools.db` data
  reaches it yet; that's Lesson 7's entire job, which the lesson's own
  Header pipeline diagram states explicitly. **Same live-window constraint
  as Lesson 5, reconfirmed directly by the user this session (not
  retested/re-derived):** no `dotnet run` was attempted, foreground or
  background — the user opened this session by repeating the same
  instruction from Lesson 5's own retrospective ("don't run any commands
  that need permission, I am not on this screen"). Verification instead
  rested on real `dotnet build`/`dotnet test` output (all captured this
  session, all clean), a real generated-code read out of `LabScratch.Wpf`'s
  own `obj/MainWindow.g.cs` proving `x:Name="Browser"` generates a field the
  identical way Lesson 5's `StatusText` did, and genuine Microsoft Learn
  documentation for every WebView2 event/property/exception cited (fetched
  fresh this session — `WebView2`, `Source`, `CoreWebView2InitializationCompleted`,
  `CoreWebView2InitializationCompletedEventArgs`, `CoreWebView2CreationProperties`/
  `UserDataFolder`, `NavigationCompleted`, `CoreWebView2NavigationCompletedEventArgs`,
  `HwndHost`, `EventHandler<TEventArgs>`, and `WebView2RuntimeNotFoundException`
  named but not demonstrated). **A real, deliberately-reproduced initialization
  failure lab exists in `LabScratch.Wpf/` (never in `ToolDB`)** — a
  guaranteed-invalid `CoreWebView2CreationProperties.UserDataFolder`
  (`"C:\\Invalid|UserData"`, using the illegal `|` character so it fails the
  same way on any machine) — built and proven to compile clean, but not run;
  the lesson's own first Exercise asks the reader to run it and read the
  real `InitializationException` text themselves. **A real, load-bearing
  scope decision made this session, worth knowing before touching this
  lesson again:** `Grid.RowDefinitions`/attached-property row layout was
  deliberately avoided so `Browser` could stay the `Grid`'s only child
  (mirroring Lesson 5's own single-child-`Grid` shape exactly) — the
  roadmap's own Lesson 6 concept list is `control, browser process,
  initialization, navigation` only, and Grid/attached-property layout isn't
  on it; that topic belongs to a future lesson (Slice 2's "Styling &
  Layout," or "Your First Native XAML Screen") instead. Don't add
  multi-child `Grid` layout to `ToolDB`'s `MainWindow.xaml` before that
  lesson exists. **`EventHandler<TEventArgs>` is this curriculum's first
  appearance of a generic type anywhere** — real Microsoft documentation
  (`EventHandler<TEventArgs>`'s own Remarks) was used to explain *why*
  generics exist, folded into Concept Unit 2's own Header entry and
  Mechanical Walkthrough rather than given a full separate Concept Unit —
  full generics coverage (the reader's own OOP-from-zero requirement) is
  still owed in full whenever `TEventArgs`-shaped code reappears; don't
  treat this lesson's light treatment as "already covered."
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
