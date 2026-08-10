# Curriculum Notes — Pocket Inventory (WPF)

Working notes for whoever writes Lessons 2–50 next (human or AI). `README.md`
is the roadmap; this file is the *why* behind it that isn't itself part of
the roadmap — the decisions to keep honoring so a later session doesn't
quietly re-derive the original, weaker version of this plan from scratch.

## Why this project exists

**The goal is to teach C# and WPF. The app is a tool, not the goal.**
Pocket Inventory is the vehicle this curriculum uses to teach the
language and the framework — it is not itself the point, and if a
choice ever has to be made between "what this lesson's app needs next"
and "what teaches C#/WPF best right now," the teaching goal wins.

Written for a student taking a university course in C# and WPF. The
assignments are small, disconnected programs (a console app here, a WPF form
there), and each one re-teaches the same fundamentals from zero before it
can get to whatever it's actually supposed to be about. The explicit ask was
**one continuous project instead of five disconnected tutorials**, so every
C#/WPF concept gets taught exactly once, at the lesson that first needs it —
and the lesson sequence itself becomes the reference afterward, instead of
five unrelated homework folders that each shallowly repeat the basics.

> **Revised — the floor below was wrong and caused real damage.**
> "Knows Python well" was read as license to explain C#/WPF concepts
> primarily by Python comparison, and to treat OOP vocabulary (class,
> object, instance, constructor, method, inheritance) as already known
> because "the student knows programming." Neither is true. The real,
> corrected floor, stated precisely because getting this wrong once
> already cost real time: **basic Python only — functions, data types,
> loops, `list`, `dict` — and nothing else.** No OOP, in Python or any
> language: `class`/`object`/`instance`/`constructor`/`method`/
> `inheritance` are first appearances here, not assumed background, the
> same as someone who has never written a class in any language. No C#.
> No WPF. A CS Lens "Also recognized in: Python's `__init__`..." aside is
> still fine — that's comparison after the fact, not the explanation
> itself — but nothing may be taught *only* via a Python comparison, and
> no from-scratch OOP grounding may be skipped because "the student
> already knows what a class is." Found by an audit that traced `class`/
> `object`/`constructor`/inheritance through Lessons 0–12: all four are
> used as settled vocabulary starting in Lesson 0, never once given a
> real, isolated, from-first-principles treatment anywhere in the
> course — the single largest gap in this project as of this pass.

Dev machine is Windows, mouse-shared with a Mac — WPF only
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
- [x] `Lesson-00-a-classes-objects-and-inheritance.md` — prepended, 2026-07-29
- [x] `Lesson-00-b-polymorphism-virtual-and-override.md` — prepended,
      2026-08-01 (real, captured `CS0108` warning proving method hiding
      silently fails through a `List<Lightbulb>`-typed reference, then
      real, corrected output proving `virtual`/`override` fixes it)
- [x] `Lesson-00-c-abstract-classes-and-interfaces.md` — prepended,
      2026-08-01 (real `CS0144`/`CS0534`/`CS1721` compiler errors,
      captured live: can't instantiate an `abstract` class, can't skip
      an `abstract` member, can't inherit two base classes — contrasted
      against a real, working multi-interface implementation)
- [x] `Lesson-00-developer-environment.md`
- [x] `Lesson-01-your-first-wpf-window.md`
- [x] `Lesson-01-a-static-readonly-dictionary-and-safe-lookups.md` — prepended, 2026-07-29
- [x] `Lesson-01-b-structs-and-extension-methods.md` — prepended,
      2026-08-01 (real, contrasting output: a `struct` copy stays
      independent, a `class` "copy" shares the same object; real
      `CS0509` proving `string` is sealed, then a real, working
      `IsBlank()` extension method)
- [x] `Lesson-02-grid-and-the-visual-tree.md`
- [x] `Lesson-03-frame-page-navigation.md`
- [x] `Lesson-04-the-navigation-stack.md`
- [x] `Lesson-05-styles-and-resource-dictionaries.md`
- [x] `Lesson-05-a-enum-a-closed-set-of-named-values.md` — prepended, 2026-07-29
- [x] `Lesson-06-fields-classes-and-list.md`
- [x] `Lesson-06-a-generics-writing-your-own.md` — prepended,
      2026-08-01 (real `InvalidCastException` at runtime for an
      `object`-based container, converted to a real, compile-time
      `CS0029` with a generic `Container<T>`; real `CS1061` proving an
      unconstrained `T` has no members, fixed with `where T : Animal` —
      directly explains Lesson 48's own, previously-unexplained
      `where T : DependencyObject`)
- [x] `Lesson-06-b-custom-delegates-and-events.md` — prepended,
      2026-08-01 (real multicast proof — one delegate variable, `+=`,
      one call running two methods; real, silent subscriber loss from a
      plain public delegate field reassigned from outside, then real
      `CS0070` errors proving `event` blocks both outside reassignment
      *and* outside direct invocation — explains `PropertyChanged`,
      Lesson 7)
- [x] `Lesson-07-inotifypropertychanged-observablecollection.md`
- [x] `Lesson-08-selecteditem-and-two-way-binding.md`
- [x] `Lesson-09-sqlite-and-microsoft-data-sqlite.md`
- [x] `Lesson-10-reading-rows-back-into-objects.md`
- [x] `Lesson-11-validation-at-a-boundary.md`
- [x] `Lesson-12-enums-and-combobox.md`
- [x] `Lesson-13-decimal-and-culture-aware-formatting.md` — written and
      verified 2026-07-31 (real `dotnet run` output for the
      `double`-vs-`decimal` representation-error lab, the `ToString("C")`/
      `CultureInfo` lab, and a real `dotnet new wpf` build proving the
      `TextBox`-to-`decimal` implicit binding conversion, including its
      silent-failure-on-bad-input behavior)
- [x] `Lesson-14-nullable-purchase-info.md` — written and verified
      2026-07-31 (real `CS0037` compiler error proving `DateTime` can't
      hold `null`; a real `dotnet new wpf` run proving `DatePicker.SelectedDate`
      is genuinely `DateTime?` in both directions, including clearing it
      back to `null`; a real SQLite round-trip proving `DBNull.Value`/
      `IsDBNull` correctly persist and reload the null case)
- [x] `Lesson-15-notes-and-favorites.md` — written and verified
      2026-07-31, closes Epic 3 (real measured `DesiredSize.Height`
      proving `TextWrapping="Wrap"` actually wraps text across multiple
      lines vs. one; a real `dotnet new wpf` run proving `CheckBox.IsChecked`
      binds a `bool` two-way and a `DataTrigger` really does change a
      `TextBlock`'s `Foreground` from gray to gold with zero code-behind
      `if` statements)
- [x] `Lesson-16-the-datagrid-control.md` — written and verified
      2026-07-31, opens Epic 4 (real `dotnet run` output proving
      `AutoGenerateColumns="True"` reflects over a type's public
      properties for real column count/headers, vs. `False` showing
      exactly the explicit `DataGridTextColumn`s declared; real proof
      `DataGrid.IsReadOnly` defaults to `False`, unlike `ListBox`)
- [x] `Lesson-17-collectionviewsource-and-grouping.md` — written and
      verified 2026-07-31 (real `dotnet run` output proving
      `CollectionViewSource.GetDefaultView` + `PropertyGroupDescription`
      genuinely partitions 5 items into 3 real groups summing back to 5,
      with zero duplication of the source collection)
- [x] `Lesson-18-sortdescription.md` — verified 2026-07-31 (real
      ascending/descending `SortDescription` reordering on a live
      `ICollectionView`, same three objects each pass)
- [x] `Lesson-19-predicates-and-live-search.md` — verified 2026-07-31
      (real `Predicate<object>`/`ICollectionView.Filter` narrowing proven
      live against 4 objects, underlying `Cats.Count` unchanged)
- [x] `Lesson-20-combining-predicates.md` — verified 2026-07-31, closes
      Epic 4 (real output proving `&&`-composed search+category+favorites
      narrows 4 items to 2 to 1 as each condition activates)
- [x] `Lesson-21-reusing-a-view-for-create-and-update.md` — verified
      2026-07-31 (real independent-copy proof; real `UPDATE ... WHERE
      Id = @id` against SQLite with rows-affected + read-back proof).
      Deliberately avoided introducing LINQ (`FirstOrDefault`) in real
      project code — used a plain indexed loop instead, since LINQ has
      never been taught in this course; keep doing this going forward,
      don't reach for LINQ shortcuts in real project code without first
      giving it its own concept lab.
- [x] `Lesson-22-modal-dialogs-and-messageboxresult.md` — verified
      2026-07-31 (real `DELETE ... WHERE Id/Name` against SQLite with
      rows-affected + read-back proof; `MessageBox.Show`'s actual click
      behavior documented per established API contract, not
      automatable headlessly — same honest "run it yourself" pattern
      already used for other pure-UI-interaction proofs, e.g. Lesson 8)
- [x] `Lesson-23-icommand-relaycommand-and-mvvm.md` — verified 2026-07-31,
      closes Epic 5. Full `RelayCommand.cs`/`InventoryViewModel.cs`/
      `InventoryItem.cs` actually compiled together as a real WPF project
      (0 errors) — not just inspected. Found and fixed a **real latent
      bug** while testing, not a deliberate teaching device: `RemoveItem`
      didn't reset `editingItemId`, so select-item-to-edit → delete that
      same item → add a new item silently did nothing (confirmed via
      real output: `Items.Count` stayed `0` instead of `1`). Fixed by
      clearing `editingItemId`/`NewItemDraft` in `RemoveItem` when the
      deleted item is the one currently loaded for editing; documented
      directly in the lesson's own Mechanical Walkthrough. Also
      deliberately kept `MessageBox.Show` in code-behind, not the
      ViewModel — honest exception, discussed in the lesson's SE Lens.
- [x] `Lesson-23-a-custom-exceptions.md` — prepended, 2026-08-01 (real
      proof `catch (Exception ex)` can't distinguish two different
      validation failures; a real custom `InvalidCategoryException`,
      carrying its own `AttemptedCategory` property, correctly routed
      by a second, more specific `catch` block — explains the real
      `catch (SqliteException ex)` the very next lesson uses)
- [x] `Lesson-24-foreign-keys-and-join.md` — verified 2026-07-31, opens
      Epic 6 (real `SqliteException`/error 19 for a FK violation; real
      `INNER JOIN` output; confirmed `Microsoft.Data.Sqlite` defaults
      `PRAGMA foreign_keys` to ON, unlike raw SQLite — a real,
      provider-specific fact worth having verified rather than assumed;
      real `SelectedValue`/`SelectedValuePath` two-way proof; real
      `INSERT OR IGNORE` multi-row idempotency + column `DEFAULT` proof)
- [x] `Lesson-25-storing-photos-by-path.md` — verified 2026-07-31 (real
      `File.Copy` + `BitmapImage` round-trip against a real 3840x2400
      Windows wallpaper file; genuinely important real finding — a plain
      XAML string binding leaves the image file locked, `File.Delete`
      throws a real `IOException`, while explicit `BitmapImage` with
      `CacheOption.OnLoad` releases the handle and deletion succeeds.
      This directly motivates Lesson 26 rather than being an arbitrary
      style choice — confirmed with real, contrasting output, not
      assumed from general documentation)
- [x] `Lesson-26-deleting-orphaned-files.md` — verified 2026-07-31,
      closes Epic 6 (real proof `File.Delete` on a missing path throws
      nothing, real proof it removes an existing file)
- [x] `Lesson-27-deep-copy-vs-reference-copy.md` — verified 2026-07-31,
      opens Epic 7 (real `ReferenceEquals` proof of shared-mutable-state
      shallow-copy bug via `List<string>`, and its real fix via
      `new List<string>(original)`)
- [x] `Lesson-28-the-soft-delete-pattern.md` — verified 2026-07-31 (real
      proof two `ICollectionView`s — `GetDefaultView` and a directly
      constructed `ListCollectionView` — are genuinely independent
      objects over the same source collection, `ReferenceEquals` false,
      each filtering correctly and reacting to `.Refresh()`). Caught and
      fixed one issue before it shipped: the first draft referenced an
      unexplained `BoolToVisibilityConverter` for the Restore button —
      value converters have never been taught in this course — replaced
      with the already-established `RelayCommand`/`CanExecute` pattern
      instead. Watch for this class of mistake going forward: reaching
      for a common WPF idiom without checking whether this course has
      actually earned it yet.
- [x] `Lesson-29-a-tiny-state-machine.md` — verified 2026-07-31, closes
      Epic 7 (real proof `TryBorrow`/`TryReturn`-style guards correctly
      allow valid transitions and reject invalid ones, state left
      unchanged on rejection; real proof `CommandParameter` bound via
      `ElementName` correctly carries a live `TextBox.Text` value through
      to a command's `Execute`)
- [x] `Lesson-30-sum-and-aggregate-queries.md` — verified 2026-07-31,
      opens Epic 8. **Real, important, non-obvious finding**: SQLite's
      `SUM()` over the `Value` column (stored as exact `TEXT` per Lesson
      13) still computes internally in floating point — `SUM('0.1'+'0.2')`
      returns `0.30000000000000004`, the *exact* same representation
      error Lesson 13 built a whole lesson to avoid, now reintroduced at
      the aggregate level despite exact storage. This was not assumed
      — it was tested and confirmed real. Handled honestly in the lesson
      (rounding via `ToString("C")` safely absorbs an error ~15 orders
      of magnitude smaller than a cent) rather than silently ignored.
      Also confirmed `SUM()` on an empty table returns real `DBNull`,
      not `0` — handled explicitly, with a real reproduced crash
      (`Convert.ToDecimal(DBNull.Value)` throws) proving why it matters.
- [x] `Lesson-31-group-by.md` — verified 2026-07-31 (real `GROUP BY` +
      `SUM`/`COUNT` output, 3 correct per-category groups from 4 rows)
- [x] `Lesson-32-order-by-and-limit.md` — verified 2026-07-31. **Real,
      significant bug caught before writing anything else**: `ORDER BY
      Value DESC` on the `TEXT`-stored `Value` column sorts
      lexicographically, not numerically — real, wrong output confirmed
      (`"9.99"` outranks `"100.00"`; `"100.00"` outranks `"10.00"`).
      Fixed with `ORDER BY CAST(Value AS REAL) DESC`, verified correct.
      A "Top 5 Most Valuable" feature built on the naive query would
      have silently shown wrong results forever with zero errors. Also:
      substituted `PurchaseDate IS NULL` for the roadmap's generic
      "missing category" idea, since this project's `Category` has been
      `NOT NULL` since Lesson 12 — checked the actual schema rather than
      copying the roadmap's generic description uncritically.
- [x] `Lesson-33-composing-a-dashboard.md` — verified 2026-07-31, closes
      Epic 8 (real proof `Frame.GoBack()` returns to the *same cached
      page instance*, not a fresh one — `ReferenceEquals` true, state
      intact — the load-bearing fact this lesson's whole design depends
      on, checked rather than assumed by analogy to browser back
      buttons)
- [x] `Lesson-34-csv-streamwriter-and-escaping.md` — verified 2026-07-31,
      opens Epic 9 (real proof naive comma-joining breaks a
      comma-containing field; real proof the quote-and-double escaping
      fix produces a correctly-structured row; real `StreamWriter` file
      write/read-back)
- [x] `Lesson-35-defensive-csv-parsing.md` — verified 2026-07-31 (real
      quote-aware parser correctly reverses Lesson 34's escaping; real
      per-row `try`/`catch` proof — 2 of 4 rows succeed, 2 fail with
      real, different exception types, neither failure stopping the
      loop). **While writing this lesson, caught a real, severe
      retroactive bug in Lesson 24**: `SaveItemToDatabase`/
      `UpdateItemInDatabase` were never actually updated to include
      `SupplierId`/`SerialNumber` — only `CREATE TABLE` and the `JOIN`
      load were. Verified for real: every "Add" from Lesson 24 onward
      would have thrown `SQLite Error 19: NOT NULL constraint failed:
      Items.SerialNumber` and crashed. Fixed directly in Lesson 24 (new
      "The New Code — Saving and Updating" section + Mechanical
      Walkthrough note), re-verified against a real SQLite round-trip,
      checker re-run clean. This is exactly the kind of gap that only
      surfaces when a *later* lesson's own code forces you to reason
      about what an earlier lesson actually left in place — worth
      periodically re-reading earlier "New Code" sections against later
      ones for this same class of drift.
- [x] `Lesson-36-system-text-json.md` — verified 2026-07-31 (real nested
      JSON serialization proof — `Supplier` as a genuine nested object;
      `decimal` preserved exactly, no `SUM()`-style float artifact;
      `DateTime?` → real `null`; `JsonStringEnumConverter` proof).
      Caught and fixed my own draft using `Items.Select(...)` (LINQ) in
      real project code with zero explanation — replaced with a plain
      `foreach`, same mistake class as the Lesson 21 `FirstOrDefault`
      catch. This is now the second time; worth treating as a standing
      habit to check for on every remaining lesson, not a one-off.
- [x] `Lesson-37-flowdocument-and-printdialog.md` — verified 2026-07-31,
      closes Epic 9 (real, unusually thorough proof: an actual
      `FlowDocument`/`Table` was written through the exact same
      `XpsDocument`/`XpsDocumentWriter`/`DocumentPaginator` pipeline
      `PrintDialog` uses internally, producing a real 63,658-byte file
      with a correctly-reported page count — not just constructed and
      trusted)
- [x] `Lesson-38-appdata-and-settings-persistence.md` — verified
      2026-07-31, opens Epic 10 (real `%AppData%` resolution + real
      JSON settings file write/read-back, confirmed separate from
      `pocketinventory.db`)
- [x] `Lesson-39-dynamicresource-and-dark-mode.md` — verified 2026-07-31
      (real, side-by-side proof: after swapping a resource dictionary
      entry at runtime, a `StaticResource`-bound element stayed
      unchanged while a `DynamicResource`-bound element correctly
      updated — the exact mechanical reason this lesson exists, not
      just asserted from the attribute names)
- [x] `Lesson-40-inputbindings-and-keygesture.md` — verified 2026-07-31
      (real proof a `KeyBinding.Command` resolves to the exact same
      object as the button's own command — `ReferenceEquals` true —
      and invoking it runs identical logic)
- [x] `Lesson-41-contextmenu-and-status-bar.md` — verified 2026-07-31,
      closes Epic 10. **Real, important WPF gotcha caught and proven**:
      a `ContextMenu`'s `MenuItem` does not inherit `DataContext` the
      normal way — `Command="{Binding ...}"` resolved to a real `null`
      (confirmed) — because `ContextMenu` is a separate popup root, not
      part of the visual tree. Fixed and verified with the real
      `PlacementTarget.DataContext`/`RelativeSource AncestorType=ContextMenu`
      pattern (`ReferenceEquals` true). Also confirmed
      `{Binding Items.Count}` updates live via `ObservableCollection<T>`'s
      own `Count` change notification.
- [x] `Lesson-42-selectionmode-and-selecteditems.md` — verified
      2026-07-31, opens Epic 11 (real proof `DataGrid.SelectionMode`
      already defaults to `Extended`; real, correctly-typed
      `SelectedItems` `IList` proof with 2 of 3 items selected)
- [x] `Lesson-43-bulk-edit-and-bulk-delete.md` — verified 2026-07-31.
      **Dramatic, real, measured proof**: 200 individual auto-committing
      `UPDATE`s took 1753ms; the same 200 wrapped in one real
      `SqliteTransaction` took 12ms — ~146x faster, real numbers from
      this machine, not an estimate. Real rollback proof included too.
- [x] `Lesson-44-the-drag-and-drop-api.md` — verified 2026-07-31 (real
      `IDataObject`/`GetDataPresent`/`GetData` round-trip
      proof, `ReferenceEquals` confirming the real object travels, not
      a copy). Caught and fixed a real gap while writing it — referenced
      `viewModel.UpdateSingleItem(item)` before it existed;
      `UpdateItemInDatabase` has been `private` since Lesson 21, so
      code-behind (outside the ViewModel) couldn't reach it. Added the
      thin public wrapper with a real explanation, not just silently
      patched. This is the third time a real gap surfaced only because
      a later lesson's code forced the question — same class of issue
      as the Lesson 24 and Lesson 36 catches.
- [x] `Lesson-45-command-and-memento-patterns.md` — verified 2026-07-31,
      closes Epic 11 (real LIFO undo-stack proof: 3 deletes then 3
      undos restore items in exact reverse-deletion order at their
      exact original positions; real proof re-inserting a deleted row
      gets a genuinely new `Id`, never the original — named honestly,
      not glossed over)
- [x] `Lesson-46-file-copy-and-dispatchertimer.md` — verified
      2026-07-31, opens Epic 12 (real, measured `DispatcherTimer` ticks
      ~300ms apart, 3 real timestamped backup files confirmed on disk)
- [x] `Lesson-47-restoring-a-backup.md` — verified 2026-07-31 (real,
      significant finding: a plain `File.Copy` restore over a live
      SQLite file silently fails to take effect, and cleanup throws a
      real `IOException`, because `Microsoft.Data.Sqlite` pools native
      connections even after `using` disposes the wrapper —
      `SqliteConnection.ClearAllPools()` before the copy is genuinely
      required and was proven both ways with real output)
- [x] `Lesson-48-virtualization-and-big-o.md` — verified 2026-07-31 (real,
      dramatic proof: 10,000-item `DataGrid`, virtualization on = 32 rows
      realized/91ms vs. off = 10,000 rows/34324ms; grouping a 10,000-item
      view still only realizes 32 rows/51ms, and explicitly disabling
      `IsVirtualizingWhenGrouping` — older WPF advice's "required" fix —
      measurably changed nothing, a real, dated-advice correction; a
      20-jump scroll session realized 692 distinct row containers under
      `VirtualizationMode="Standard"` vs. 33 under `"Recycling"`, and
      leaving it unset matched `Recycling` exactly, proving that's
      `DataGrid`'s real default)
- [x] `Lesson-49-dotnet-publish-and-an-about-screen.md` — verified
      2026-07-31 (real, measured `dotnet publish` size/file-count gap:
      framework-dependent = 5 files/190K vs. self-contained = 257
      files/141M; `PublishSingleFile=true` shrinks that to 7 files, with
      5 real native `_cor3.dll` interop files proven to survive outside
      the bundle — single-file publish isn't actually single-file for
      WPF; the published framework-dependent `.exe` was run directly,
      outside `dotnet run`, and proven to execute real code via a
      written proof file; `Window.GetWindow(this)`, called from a real
      `Page` hosted in a `Frame`, proven to return the exact
      `Application.Current.MainWindow` instance; `ShowDialog()` proven
      to genuinely block via real console-output ordering, and
      `Owner.IsEnabled` proven to stay `True` throughout — a real,
      checked-not-assumed correction)
- [x] `Lesson-50-refactor-architecture-review-and-a-retrospective.md`
      (Capstone) — verified 2026-07-31. Real, grepped evidence, not
      assertion: 29 raw `SqliteConnection(ConnectionString)` call sites
      across 13 real lesson files (9 through 43); a real before/after
      `ItemRepository` extraction lab producing byte-identical output
      pre- and post-refactor; a real, corrected audit of every
      `MessageBox.Show` call site across all 49 files, finding Lesson
      23's own "confirmations stay in code-behind" rule first broken by
      Lesson 35's `ImportCsv` (soft, info-only) and then fully broken by
      Lessons 43/47 (`BulkDelete`/`RestoreBackup`, both Yes/No-gated) —
      genuine architectural drift, caught and named, not fixed by
      retroactively rewriting three working lessons. The retrospective
      itself is the lesson's stated deliverable. **All 50 core lessons
      plus the capstone were, at this point, written and verified** —
      see the 2026-08-01 entries directly below for what was added
      after this point, following the coverage audit described in the
      next note.
- [x] `Lesson-51-async-and-await.md` — added 2026-08-01 (real, measured
      `DispatcherTimer` proof: a synchronous `Thread.Sleep(3000)` on the
      UI thread produces exactly `0` timer ticks during a real `3003ms`
      span; the identical `3000ms` wait via `await Task.Delay` produces
      `28` ticks, matching the expected ~30 — real proof `await` yields
      the UI thread instead of blocking it. `ItemRepository.GetAllAsync`
      added using real, verified `OpenAsync`/`ExecuteReaderAsync`/
      `ReadAsync` calls.)
- [x] `Lesson-52-unit-testing-with-xunit.md` — added 2026-08-01 (a real
      `dotnet new xunit` project; real pass/fail proof with a
      deliberately-wrong `Assert.Equal`; real `ItemRepositoryTests`
      against a real, temp SQLite database, including a deliberate
      regression — breaking `Add` to insert `"BROKEN"` instead of the
      real category — caught automatically by `dotnet test` with a
      real, structured diff)
- [x] `Lesson-53-logging.md` — added 2026-08-01 (real proof: the same
      `Console.WriteLine` output from three separate process runs is
      gone after each one exits, while a real log file accumulated all
      three real, timestamped entries; a real `FileLogger` with
      `Information`/`Warning`/`Error` levels; a real, working
      `Application.DispatcherUnhandledException` handler proven both
      ways — with it, a real thrown exception is logged in full and the
      app survives; without it, the app crashes for real and zero log
      file is left behind)
- [x] `Lesson-54-linq-the-professional-shorthand.md` — added 2026-08-01
      (real `SequenceEqual` proof that hand-rolled `foreach`/`if` and
      `Where().Select()` produce byte-identical output; real, genuinely
      surprising deferred-execution proof — the same un-materialized
      query variable, enumerated twice with no reassignment in between,
      returns two different real results because the source list
      changed; a small, real refactor closing the `PrintButton_Click`
      duplication Lesson 50's own retrospective named but didn't fix)
- [x] Lesson 50's own `InventoryViewModel(ItemRepository repository)`
      Mechanical Walkthrough updated, 2026-08-01, to name **dependency
      injection** explicitly — the pattern was already correct when
      written, just never labeled.
- [x] Lesson 48's Mechanical Walkthrough updated, 2026-08-01, to credit
      Lesson 6a for `CountDescendants<T> where T : DependencyObject`,
      which previously used generics with zero explanation anywhere in
      the lesson — a real gap the 2026-08-01 audit found and closed.
- [x] Lesson 20's own throwaway lab fixed, 2026-08-01: it used
      `items.Where(...)` (real LINQ) before LINQ is ever taught anywhere
      in this project — the same class of mistake as the Lesson 21/36
      LINQ catches, just in a discarded lab rather than real project
      code. Replaced with a plain `foreach`/`if`, re-verified for
      identical real output.

**2026-07-31 continuation note:** user confirmed (mid-session) they want
every remaining lesson (17–50) written and verified now, in this pass,
not paced to their own reading — "usage resets tomorrow... let's build
them all." Continue the same per-lesson rigor (real `dotnet run`/`dotnet
build` output for every new mechanic, checker script clean, status files
updated) for every lesson from here through 50. Do not silently drop the
verification bar to move faster — that was explicitly rejected earlier
this same session ("there can't be gaps").

**2026-07-31 post-completion audit:** after all 50 lessons + capstone
were done, user asked directly whether logging, NuGet, OOP, and design
patterns were actually covered. A real, grepped audit (not from memory)
found: NuGet ✅ (Lesson 9), design patterns ✅ (Observer reinforced
4×, Command/Memento Lesson 45, Repository Lesson 50) minus DI being used
but never named, and two real, unaddressed gaps — **polymorphism**
(inheritance is taught in Lesson 0a but `virtual`/`override` never
appears anywhere) and **logging** (zero coverage; `Console.WriteLine` is
used everywhere but only as lab-verification output, never framed as
production logging discipline). The same audit, extended further per
the user's "search for more, make sure we teach everything" follow-up,
found six more real gaps (unit testing/xUnit, async/await, abstract
classes, structs, custom delegates, generics-writing-your-own,
extension methods, custom exceptions — see the Status list below for
each as it's added) and one real bug: Lesson 20's throwaway lab used
`.Where(...)` (real LINQ) before LINQ is ever taught anywhere in this
project — the same class of mistake as the Lesson 21/36 LINQ catches
earlier this session, just in a discarded lab instead of real project
code. Fixed by replacing it with a plain `foreach`/`if`, re-verified for
identical real output. **All of these gaps are now closed** (2026-08-01):
six new prepended concept lessons (`00b`/`00c`/`01b`/`06a`/`06b`/`23a`,
matching the existing `00a`/`01a`/`05a` convention, for foundational
OOP/language gaps) and four new appended lessons (`51`–`54`, for
professional-practice layers — async, testing, logging, a LINQ payoff —
built on the finished app) — see the Status list above for each, plus
small, real edits to Lessons 20 (the LINQ bug), 48 (crediting Lesson 6a
for its own previously-unexplained generics), and 50 (naming dependency
injection explicitly). Every new/edited file was re-run through
`scripts/check-narrative-lessons.mjs` and came back clean.

## Prepended concept lessons — an ongoing strategy, not a one-time fix

A full-course audit (2026-07-29) against the corrected floor above found
`class`/`object`/`constructor`/inheritance used unexplained from Lesson
0 onward, plus three narrower gaps (`static`/`readonly`/`Dictionary`/
target-typed `new()`/`TryGetValue` bundled unlabeled into one Lesson 2
lab; `enum` used six lessons before its own lab; `ADO.NET` used but
never positively defined). The fix pattern going forward: **a short,
standalone `Lesson-NN-a-...` lesson inserted before the lesson that
first needs a concept, not a rewrite of the lesson itself.** Existing
lessons stay as committed; a prepended lesson closes the gap in front of
them. Don't rewrite Lessons 6–12 in place to fix a gap found in them —
prepend instead, the same way Lessons 0a/1a/5a were just added. Numbers
above 9 need two digits for correct sort (`Lesson-10-a-...`, not
`Lesson-9-a-...`), matching the existing `Lesson-NN-` convention.

**Real gaps found and fixed this pass**, for reference — don't
re-discover these from scratch in a future audit:
- Lesson 0's very first page uses `class`/`instance`/`constructor`
  unexplained → Lesson 0a.
- Lesson 2's attached-property lab bundles `static`, `readonly`,
  `Dictionary<object,int>`, target-typed `new()`, and a `TryGetValue`/
  ternary pattern into one line with zero individual walkthrough →
  Lesson 1a.
- Lesson 6 uses an enum-backed `Orientation` property calling it "first
  appearance," but `enum` doesn't get a real lab until Lesson 12 → moved
  the lab to Lesson 5a; Lesson 12 now points back to it instead of
  re-teaching it (its own glossary trimmed to match).
- `ADO.NET` (Lessons 9, 10) was defined only negatively ("not an ORM")
  → real definition added in place at its first use, Lesson 9 (no
  prepended lesson needed — the surrounding mechanism already had real
  labs; only the term itself was undefined).
- Lesson 11's `IDataErrorInfo` unit presented "interface" as if needing
  fresh grounding, when Lesson 7 already taught it properly (a real,
  correct, from-scratch treatment — confirmed, not a gap) → fixed to
  cite Lesson 7 by name instead of silently re-implying it's new.

**Smaller gaps found same audit, fixed 2026-07-31**:
- `IDataErrorInfo` (Lesson 11) skipped "Introduce the Concept in
  Isolation" → added a throwaway console lab (`IDataErrorInfo` is a
  plain `System.ComponentModel` interface, no WPF window needed to
  prove it) with real, verified output showing the indexer returning
  the validation message when empty and an empty string once set.
- `ComboBox` (Lesson 12) skipped it too → added a throwaway
  `dotnet new wpf` lab binding `ItemsSource` to `Enum.GetValues`,
  verified to build clean (0 errors/warnings) with the exact XAML/C#
  the lesson now shows; proves the real teaching point (the dropdown's
  contents come live from the enum, never hand-typed as
  `<ComboBoxItem>`s) before the real project does the same thing.

Also ran a fresh pass of `scripts/check-narrative-lessons.mjs`'s
`dense-concept-unit` flags against this project specifically (2026-07-31):
all 4 (Lesson 0's Anatomy of a WPF Project, Lesson 6's `List<T>`,
Lesson 9's `SqliteConnection` and `CREATE TABLE`/`ExecuteNonQuery`)
checked out as real false positives — each bundles several terms that
are all proven together by one execution trace or one real run, not
gaps. Don't re-investigate these from scratch next time the checker
flags them; this note is the record that they were checked.

## Filename convention

Lesson files are named `Lesson-NN-slug.md` (two-digit zero-padded number,
e.g. `Lesson-06-fields-classes-and-list.md`), not a bare `NN-slug.md`. The
site's doc renderer (`src/components/docs/MarkdownHub.jsx`, `displayName()`)
strips a leading bare `^\d+-` pattern from the displayed title — a filename
starting with a digit loses its number in the UI. Prefixing with `Lesson-`
avoids that, since the string no longer starts with a digit. Keep this
convention for every lesson from here on; don't revert to the bare
`NN-slug.md` pattern lessons 0–1 originally used.

## 2026-08-10 audit: Objects/methods section, shared concept catalog, layout-panel gap

Three findings from a fresh session, applying `LESSON SCHEMA.md`'s
Header requirements (grown since this project's early lessons were
written) and a fresh look at WPF's own layout-panel toolbox against what
this course actually teaches:

1. **"Objects and methods used" header section is absent from all 61
   lesson files** (verified: zero matches, `grep -rn "Objects and
   methods" *.md`). This section postdates this project — same shape as
   the Repetition Rule's own stated exception (predates the schema's
   Header requirement, not a real gap in the lessons' actual teaching).
   Retrofitting it lesson-by-lesson is ongoing; this note is the record
   of when and why it started, so a future session doesn't re-diagnose
   the same gap from scratch. Where a lesson's own "Terms introduced"
   already gives a supporting framework piece full treatment, the
   Objects/methods section doesn't duplicate it — only genuinely
   uncovered supporting API gets a fresh entry.
2. **This project now draws from and contributes to `src/docs/concepts/`**
   — the platform's single shared concept catalog (see that folder's own
   `README.md` for the format rules: Setup/Problem/Isolated Example/
   Mechanical Walkthrough/CS+SE Lens/Connection/Try It Yourself, and the
   100%-match rule). Seven WPF/XAML concept files already existed there
   (written for the separate `wpf-lessons`/`CncWpf` stub project) but
   were never referenced from this course; two more
   (`wpf-styles-and-setters.md`, `wpf-resourcedictionary-and-staticresource.md`)
   were extracted from this course's own Lesson 5 real, verified content
   and added same session. Use `src/docs/concepts/GLOSSARY.md` to check
   for an existing match before writing a new concept file or a fresh
   inline explanation.
3. **Layout-panel gap, confirmed by grep, not guessed:** this course uses
   only `Grid` and `StackPanel` for all 54 lessons.
   `DockPanel`/`WrapPanel`/`Canvas`/`UniformGrid` — four of WPF's other
   standard layout panels — appear in zero lesson files. Closed via
   [Lesson 02a](Lesson-02-a-other-layout-panels.md), a prepended,
   throwaway-lab-only lesson (same shape as Lesson 05a's `enum` lab —
   nothing it teaches enters the real project), each unit backed by its
   own new concept file (`wpf-dockpanel.md`, `wpf-wrappanel.md`,
   `wpf-canvas.md`, `wpf-uniformgrid.md`) and connected back to a real,
   concrete "would this project's own code use this panel instead, and
   why or why not" judgment call, not just an isolated fact.

Ran `scripts/check-narrative-lessons.mjs` against the whole project
after these changes: 65 files, 12 issues, all soft/judgment-call kinds
(`dense-concept-unit`, `note-unverified-hidden-behavior`,
`note-no-cs-lens`) except three `code-prose-interleaved-in-fence` hits in
Lesson 51, all three confirmed false positives on inspection — the
flagged "before"/"after" words are literal text inside a real
`Console.WriteLine` string argument, not prose crammed into a fence.
Spot-checked both `note-unverified-hidden-behavior` hits (Lessons 6 and
7's auto-property backing-field claims): both already have real proof
(Lesson 6 shows the actual `<Name>k__BackingField` via reflection;
Lesson 7's claim explicitly cites that same proof back rather than
re-asserting it ungrounded). Remaining `dense-concept-unit`/`note-no-cs-lens`
flags (Lessons 0, 6, 9, 11, 49) not individually re-verified this
session — same category this project's own 2026-07-31 note already
found to be mostly cohesive-mechanism false positives; flag for a future
session rather than re-deriving now.

**Update, same session — the "Objects and methods used" retrofit is
complete.** All 64 lesson files (every `Lesson-*.md` in this folder,
including the new Lesson 02a) now have the section. Per file, it either
names genuinely uncovered supporting-cast API with full treatment, or
states plainly that everything the lesson touches is either its own
subject (covered in its Terms glossary/Concept Units) or a brief,
Repetition-Rule-compliant reminder of something an earlier lesson
already gave full treatment. Two real, previously-unflagged gaps were
found and closed in the process, beyond the section itself:

- **Lesson 00b** used `List<T>`, collection-initializer syntax, and
  `foreach` with zero explanation, eleven lessons before Lesson 6's own
  "official" `List<T>` lab — missed by both the 2026-07-29 and
  2026-08-01 audit passes. Closed with a real Objects/methods entry at
  its true point of use.
- **Lesson 51** used `System.Diagnostics.Stopwatch`
  (`.StartNew()`/`.Stop()`/`.ElapsedMilliseconds`) — the lesson's own
  actual proof mechanism that a synchronous call blocks and an async one
  doesn't — with zero explanation anywhere. Closed the same way.
- **Lesson 53** used `Environment.NewLine` and `File.ReadAllText` with
  zero explanation; both closed with brief entries (simple enough not
  to need a full shown shape, per the Usage Contract Rule's own
  exception for single, plain-input/output calls).

Also closed, at its true first appearance rather than piecemeal: the
**ternary conditional operator** (`?:`) and **string interpolation**
were both used, unexplained, starting in Lesson 00a's very first code
sample (`$"This bulb is {(IsOn ? "on" : "off")}"`), and multiple later
lessons (01a among them) cited them as "already established" when they
never actually had been. Both now get real Terms entries and a
Mechanical Walkthrough bullet in Lesson 00a itself — every later lesson
citing them as reappearing is now actually correct, not just plausible.

Re-ran `scripts/check-narrative-lessons.mjs` after the full pass: still
65 files, still the same 12 pre-existing soft flags (line numbers
shifted only by the inserted sections) — confirms none of the 64 edits
introduced a structural regression.

**What this pass deliberately did not do:** a full re-audit of every
lesson's Terms glossary for other possibly-implicit basic syntax, the
way `?:`/`$"..."` were caught here — those two were found incidentally
while verifying Objects/methods claims, not from a systematic sweep.
Worth a dedicated future pass if the same "nothing implicit" standard
is meant to extend past what this pass happened to notice along the way.

## Independence from the Android track

`../track/` (Android) and this project cover a lot of the same ground —
SQLite, list/detail UI, validation at a boundary, navigation stacks — on
purpose, per the README's own "why a sibling project" framing. That
framing is about the *product concept* being deliberately duplicated
across platforms so the universal parts become visible by contrast. It is
**not** license to lighten a WPF lesson's own explanation because the
Android track already covered the same idea. Every hard concept still
gets its own full lab, walkthrough, and both lenses here, from zero, as if
the Android track didn't exist — a "Also recognized in: ...the Android
track" line in a Recognition list is fine (that's the CS Lens doing its
job, per `LESSON_CONTRACT.md`'s Recognition section), but it must never
stand in for the WPF-side explanation itself. This project is meant to
stand alone.
