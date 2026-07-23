# Curriculum Notes — Pocket Inventory (WPF)

Working notes for whoever writes Lessons 2–50 next (human or AI). `README.md`
is the roadmap; this file is the *why* behind it that isn't itself part of
the roadmap — the decisions to keep honoring so a later session doesn't
quietly re-derive the original, weaker version of this plan from scratch.

## Why this project exists

Written for a student taking a university course in C# and WPF. The
assignments are small, disconnected programs (a console app here, a WPF form
there), and each one re-teaches the same fundamentals from zero before it
can get to whatever it's actually supposed to be about. The explicit ask was
**one continuous project instead of five disconnected tutorials**, so every
C#/WPF concept gets taught exactly once, at the lesson that first needs it —
and the lesson sequence itself becomes the reference afterward, instead of
five unrelated homework folders that each shallowly repeat the basics.

The student knows Python well. They have done nothing in C#/.NET before this
project. Dev machine is Windows, mouse-shared with a Mac — WPF only
builds/runs on Windows; the plain `dotnet` CLI works fine on macOS for
verifying console-only C# snippets (this is how Lesson 0/1's C# examples
were actually run and verified — the WPF window itself could not be).

## Redesign decisions vs. the original outline

The student's first draft of this roadmap (GPT-generated) had real structural
problems this version deliberately fixes. If re-deriving this plan from
memory, don't silently drift back toward the naive version:

1. **Vertical-slice fix.** The original built every item field (name,
   category, location, value, purchase date, notes, favorite) across ~8
   lessons before the item could be viewed, saved, or reloaded at all — 8
   lessons of typing into a form that goes nowhere, violating this
   curriculum's Agile Delivery rule (every lesson ends with something you can
   run and see, now). This version gets a single-field item all the way
   through the full pipeline — form → list → SQLite → reload on restart →
   validation — in six lessons (Epic 2), then *grows* that working item one
   field at a time (Epic 3), each addition touching model + view + database
   together, never split across separate epics.
2. **Code-behind before MVVM, on purpose.** Lessons 1–22 use plain
   code-behind click handlers. `ICommand`/`RelayCommand`/MVVM is introduced
   in Lesson 23, specifically once Add/Edit/Delete/Search handlers have
   piled up enough to actually hurt — not assumed from Lesson 1 "because
   that's how real WPF is done." The pain has to be felt first.
3. **Raw ADO.NET before any ORM.** Persistence starts with
   `Microsoft.Data.Sqlite` and hand-written SQL. An ORM (EF Core) is
   mentioned only as the SE lens's "alternative not chosen," with the real
   tradeoff stated honestly. Mirrors the choice this curriculum's Python/
   FastAPI sibling project (`../inventory/`) already made, for the same
   reason: you can't understand what an ORM hides until you've done the
   thing by hand once.
4. **Suppliers as a real relational table.** The original treated
   "manufacturer"/"supplier" as plain text fields — throwing away the one
   place this project could teach foreign keys and `JOIN`, arguably the
   single most transferable relational-database idea there is. Epic 6 builds
   a real `Suppliers` table instead.
5. **Consolidated ~72 lessons down to 50.** Many of the original's lessons
   were near-duplicate "add one more field" busywork with little unique
   teaching value on their own; those got merged into denser lessons that
   each still land exactly one new concept, per the Recursive Concept
   Extraction Rule.

## A recurring theme to keep honoring

The student specifically wants real C# language fundamentals taught deeply,
not glossed over as "Python-familiar." The concrete example that prompted
this: they hit `var a, b = 5;` and had to figure out on their own why it
doesn't compile (`CS0819`/`CS0818`) — that became a named, verified example
in Lesson 0. Keep giving genuinely new C# constructs their own concept lab
even when they look like something Python already has — `LESSON_CONTRACT.md`
already states this rule explicitly ("familiar-sounding is a trap"); this
project is a real test case of actually applying it, not just citing it.

## Don't conflate these two systems

`LESSON_CONTRACT.md` + `LESSON SCHEMA.md` (both in `src/docs/`) govern every
lesson file in this project — concept labs, mechanical walkthroughs, CS/SE
lenses. `CONCEPT_CONTRACT.md` (also `src/docs/`) governs a separate,
unrelated system: atomic reference cards in `src/concepts/*.md`, rendered
app-wide via `<ConceptBlock>` in the site's Concept Explorer, with a
requirement that every code example actually executes via the app's
`runCode()`. This project's lessons do **not** feed that system and don't
need to — it was mentioned once mid-design and deliberately not adopted here
to avoid scope creep into a much larger, separately-governed system. Revisit
only if explicitly asked for a standalone reference-card library alongside
these narrative lessons.

## Siblings, not duplicates

`../track/` is an Android version of the same "Pocket Inventory" product
idea — a deliberate sibling, built to make platform-specific ceremony
(Activities, XML layouts) visible by contrast with WPF's. `../inventory/` is
an unrelated Python/FastAPI project ("NexusInventory") that happens to share
the word "inventory." Neither should be merged with or mistaken for this
project.

## Status

- [x] `README.md` — full 50-lesson roadmap, 12 epics
- [x] `00-developer-environment.md`
- [x] `01-your-first-wpf-window.md`
- [ ] Lessons 2–50 — write on request, in order
