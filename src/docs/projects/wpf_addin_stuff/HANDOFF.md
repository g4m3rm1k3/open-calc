# HANDOFF — WPF Mastercam File Generator Curriculum

Read this first, every session, before writing or editing any lesson.

## Status

Lessons 1-20 are written and complete: `Lesson-01-Create-the-WPF-Shell.md`
through `Lesson-20-Parse-XML-Into-Part.md`. **Phase 2 completed at
Lesson 8; Phase 3 at Lesson 13; Phase 4 at Lesson 15; Phase 5 ("Build the
Domain Model") completed at Lesson 19; Phase 6 begins at Lesson 20.**
Lesson 20 built `SetupSheetParser` (`SetupSheetParser.cs`, new) —
`ParseFile(string filePath)` loads a real setup sheet via `XDocument.
Load` and produces a completely filled-in `Part`, five domain-model
levels deep, using `SetupSheetQueries` (Lesson 15) plus one small
addition to it, `GetOperationTool(XElement)`. Real-verified end to end
against the real sample file — real output saved in
`verification/lesson-20/`; see that folder or the lesson's own final
Concept Unit for the captured console output. Two things worth carrying
forward: `Part.PartNumber`/`Part.Revision` have no matching element in
the real sample file at all, so the parser honestly leaves them empty
rather than fabricating a mapping (this is deliberate — it sets up a
later validation phase, not an oversight); and `Part.Description`/
`Part.Customer` faithfully surface the sample file's own placeholder
text (`"PART NAME"`/`"REV"`) unmasked, which is exactly why a later
lesson needs real placeholder-detection logic. Next up: Lesson 21
("Detect Placeholder Values"), Phase 6's first lesson.

Complete domain model, all plain `class`es (deliberately not `record`s,
per `brd.md`'s own editable-fields-with-audit-trail requirement):
`Part` (Lesson 16 — `PartNumber`, `Description`, `Customer`, `Revision`,
`NcFiles`), `NcFile` (Lesson 17 — `ProgramName`, `ProgramNumber`,
`Operations`), `Operation` (Lesson 18 — `SequenceNumber` as `int`,
`Description`, `Tool`), `Tool` (Lesson 19 — `Number`, `Description`,
`Comment`, `Assembly`), `Assembly` (Lesson 19 — `Holder`). Collections
(`Part.NcFiles`, `NcFile.Operations`) are plain `List<T>`, decided
deliberately (nothing binds this model to a UI yet); single nested
objects (`Operation.Tool`, `Tool.Assembly`) are auto-property-initialized
class-typed properties, never `null`. `Operation.Tool` is singular, not a
collection — matches the curriculum's own Lesson 19 scope, not the
`NcFile`-level `TOOL` summary list the real sample XML also has; whether
a parser needs a second `NcFile.Tools` collection for that is explicitly
left to Lesson 20 to decide with real requirements in hand, not
preempted.

No lesson between 16 and 19 needed any code run — no genuine framework
uncertainty existed in any of them, so per the corrected verification
workflow, all were written entirely from confident, already-established
knowledge. Lesson 20 broke that streak deliberately: whether the complete
parse chain (root metadata, nested `NcFile`/`Operation`/`Tool`/`Assembly`,
including a real, chained null-conditional reach through a `TOOL` with no
`ASSEMBLY`) actually produces correct output end to end, against this
project's own real file, was genuine uncertainty worth a real run — see
`verification/lesson-20/` for the saved project and captured output.

**Read "Verification workflow," below, before writing anything — it was
corrected after this status summary and the `MastercamGenerator/`
directory it describes were both produced under a model now known to be
wrong.** Everything below this line still accurately describes what the
lessons have taught so far; it does not necessarily describe what should
exist on disk as a maintained, live copy going forward.

Lesson 14 created this curriculum's first-ever sample XML data:
`SampleData/SetupSheet_2026-08-26_0512.xml` — a from-scratch setup sheet
built to match `brd.md`'s own documented structural facts (placeholder
values, repeated `NCFILE` siblings, `TOOL` appearing at two different real
depths in the same file). `XmlExplorer.cs` (also Lesson 14) is a
standalone, recursive tree-printer proving the file's real shape — not a
parser, not wired into `MainWindow`. Lesson 15 added `SetupSheetQueries.cs`
— targeted `Element`/`Attribute`/`Elements(XName)`/`Descendants(XName)`
queries against that same sample file, real-verified to return `2` vs. `4`
`TOOL` elements depending on which of the last two methods is used — also
standalone, not wired anywhere.

The application the lessons teach, as built through Lesson 15, looks like
this (this describes the taught content, per each lesson's own "Updated
Project" steps — not a claim that a live copy is being maintained on
disk; see "Verification workflow" for why that distinction now matters).
Layout:
`Window` > `Grid` > one vertical `StackPanel` holding (1) the horizontal
folder row (label, named `FolderPathText`, `Browse` button), (2)
`FilesFoundText`, (3) `NewestFileText`, and (4) a named `DataGrid`
(`DiscoveredFilesGrid`, `AutoGenerateColumns="True"`, `IsReadOnly="True"`
— replaced the Lesson 5 `ListBox` in Lesson 8). Code: `FileSource.cs`
(Lesson 3), `InputFile.cs` (Lesson 4 — `public record InputFile(string
Path, string FileName, DateTime LastModified);`), `DirectoryScanner.cs`
(Lesson 5 — filters `*.xml` via `DirectoryInfo.GetFiles`, catches
`DirectoryNotFoundException`), `FileDateParser.cs` (Lesson 7 — `public
DateTime? TryParseDate(string fileName)`, parses this project's own
`<Name>_yyyy-MM-dd_HHmm.xml` naming convention via
`DateTime.TryParseExact`), and `NewestFileResolver.cs` (Lesson 6, rewired
in Lesson 7 to resolve by parsed filename date instead of
`FileInfo.LastWriteTime`). `MainWindow` holds `readonly` fields for
`FileSource`, `DirectoryScanner`, `NewestFileResolver`, and (Lesson 8)
`ObservableCollection<InputFile> _discoveredFiles`, bound once in the
constructor via `DiscoveredFilesGrid.ItemsSource = _discoveredFiles;`.
`BrowseButton_Click` now mutates `_discoveredFiles` directly
(`Clear()`/`Add()`) instead of touching the grid.

XAML also now has three bound rows below the `DataGrid` (Watcher Status +
a new "Start Watching" button, Current File, Last Event), all bound via
real `{Binding}` markup against `MainWindow.DataContext`, set once to a
new `WatcherStatus` field (Lesson 12 — `WatcherStatus.cs`, implements
`INotifyPropertyChanged`, three properties: `WatcherStatusText`,
`CurrentFileText`, `StatusMessage`). `LiveFileTracker.cs` (Lesson 11)
gained a `public event Action<string>? StatusUpdated;` in Lesson 12,
raised from `OnFileEvent`. `MainWindow` also gained `_selectedFolder`
(set in `BrowseButton_Click`), `_liveFileTracker`, and
`StartWatchingButton_Click`/`OnWatcherStatusUpdated` — the latter writes to
`_watcherStatus` from whatever thread `LiveFileTracker` calls it on, which
was a real, deliberately-unfixed cross-thread bug through the end of
Lesson 12, fixed for real in Lesson 13 via `Dispatcher.Invoke` (see that
lesson for the real, captured exception this bug actually threw, and the
real fix). Lesson 13 also made `BrowseButton_Click` `async`, scanning via
`await Task.Run(...)`.

The authoritative record of all of the above is each lesson's own
"Updated Project" steps, not any copy on disk — see "Verification
workflow," above, for why that's now stated explicitly rather than
assumed.

## Read-scope restriction (standing rule)

Only read files inside this folder
(`src/docs/projects/wpf_addin_stuff/`) and
`src/docs/reference/LESSON SCHEMA.md`. Never read anything else — no
sibling curriculum, no `src/docs/concepts/` catalog, no other project on
disk — even when a skill or the schema itself points elsewhere (for
example the `write-lesson` skill's instruction to also read
`LessonContract`/`Guide.md`, or the schema's own references to the shared
concepts catalog). This curriculum is fully self-contained by design:
every concept a lesson needs gets explained inline, never factored out to
a file outside this folder. Never create a git repo or run git commands
in this project.

## Verification workflow (standing rule — corrected twice: 2026-08-26
mid-session, then corrected again later the same day after the first
correction turned out to overcorrect)

**Who verification is for, stated plainly because it was misread once
already:** per the schema's own Verification Rule, execution exists so a
wrong prediction doesn't silently make it into a lesson as fact — it is a
check on Claude's own confidence, written before the lesson text, for
Claude's own benefit. It is not for the reader (who runs their own copy
of the code themselves, in their own project, regardless of anything
Claude does here) and it does not imply maintaining any kind of
persistent, buildable application. Confusing this — treating verification
as something that needs a live "real project" to run against — is exactly
the second failure mode described below.

- **Never use the scratchpad, or any directory outside this folder, for
  anything.** If a lesson's claim needs real code actually run to check
  it (per the schema's Verification Rule), that code gets created and
  saved directly inside this folder — never in a temp/scratch location
  outside the read-scope restriction above.
- **Only run code for a claim Claude cannot already confidently predict**
  (the schema's own Necessity test). Most of what a lesson asserts —
  ordinary syntax mapping, a stdlib method's documented behavior, a fact
  about data Claude itself authored (a hand-written sample file, for
  instance) — needs no run at all; say so plainly in the lesson instead.
  Reach for a real run specifically for genuine uncertainty: real
  framework/OS behavior not already known firsthand, exact exception
  text, real timing, environment-dependent output.
- **When a run is genuinely needed, write the smallest code that checks
  it — nothing more — and it does not get deleted afterward.** It gets
  saved, real source plus real output, into a verification folder inside
  this same directory (`verification/lesson-NN/`, one subfolder per
  lesson, matching the shape `verification/lesson-01/` already
  established) — specifically so a later lesson needing the identical
  fact reuses the saved output instead of re-deriving and re-running it
  from nothing. Check that folder before running anything new.
- **This verification folder is a record of what was run and what it
  produced — never a live, buildable mirror of the application the
  curriculum teaches.** That taught application's entire real state
  already lives completely, lesson by lesson, in each lesson's own
  "Updated Project" steps — full, real, unelided code, already shown
  inline. Nothing about verification requires, or justifies, a
  separately-maintained, ever-growing, always-buildable second copy of
  it. A verification entry can be as small as the one snippet that was
  actually uncertain; it never needs to accumulate into a project.

**Two failure modes live in this section's own history — both worth
stating plainly so neither gets re-derived from scratch:**

**First** (Lesson 1): a full runnable WPF project was scaffolded in the
scratchpad directory (outside the read-scope restriction), and a second
throwaway console project was built purely to diff `.csproj` output —
genuine overreach, scaffolding far more than the actual claim needed.

**Second** (the "fix" applied starting Lesson 2, standing uncorrected
through at least Lesson 15): that overreach got misdiagnosed as "a
verification folder is the problem," when the real problem was
scaffolding more than necessary. The actual fix should have stayed
narrow — run only what's genuinely uncertain, save the source and real
output, nothing more. Instead, `verification/lesson-01/` (itself already
a reasonable, schema-compliant shape) was abandoned in favor of treating
`MastercamGenerator/` as a permanent, live, continuously-extended
application that must never be deleted — the opposite error: not too
much scaffolding, but treating disposable verification infrastructure as
a sacred deliverable it was never meant to be. This produced real,
unnecessary overhead across many lessons: a "final accumulated build"
ritual per lesson, and real behavior (like `Elements()` vs.
`Descendants()` counts on a file Claude itself had already written and
could simply count) re-verified by running code instead of being stated
directly from actual knowledge.

**Open, not yet resolved as of this correction:** what happens to the
existing `MastercamGenerator/` directory (built under the second, now-
corrected model, current through Lesson 15) has not been decided — ask
rather than assume, in either direction, before touching it.

## Next lesson

Lesson 21 — "Detect Placeholder Values" (per `Curriculum.md`, Phase 6's
first lesson — "Handle Bad/Placeholder Data"). The real sample file's own
`DESCRIPTION`/`CUSTOMER` values are literal placeholder text
(`"PART NAME"`/`"REV"`), not real data — Lesson 20's own real,
captured output already proves the parser currently surfaces them
unmasked, exactly as written. This lesson teaches recognizing that a
parsed value is a placeholder rather than genuine data (the curriculum's
own examples: `PART NAME`, `REV`, `PROGRAM NUMBER`) rather than silently
accepting it as real.

Real design decisions to make deliberately, not default on:
1. **What counts as a placeholder.** The BRD's own examples are literal,
   known strings (`"PART NAME"`, `"REV"`, `"PROGRAM NUMBER"`) — decide
   whether detection means an exact-match list of known placeholder
   strings (simple, matches the BRD's own stated examples, but silent on
   any placeholder text not on the list) versus a more general rule (e.g.
   flagging a value that's literally identical to its own field's label)
   — the curriculum's own text doesn't specify, so this needs a real,
   stated decision, not a default.
2. **Where the check lives.** `Part`, `NcFile`, etc. are plain classes
   with auto-implemented properties — placeholder detection could live
   on the parser (checking values as they're assigned), on the domain
   objects themselves (a method each class exposes), or as a separate
   free-standing checker taking a `Part` and reporting on it. Lesson 22
   ("Validation Results") is the next lesson per `Curriculum.md` and
   builds a `ValidationResult` model — worth deciding Lesson 21's own
   shape with that next step in mind, without building Lesson 22's own
   `ValidationResult` early.
