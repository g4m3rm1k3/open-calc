# Pocket Inventory (WPF) — C#, XAML, and SQLite From First Principles

## What You Will Build

A desktop inventory manager: add items, browse them in a real data grid, search
and filter, edit and delete, attach photos and suppliers, track value and
borrowing history, export and import your data, and ship a published,
installable Windows application. Every screen is built with WPF. Every record
is really saved, in a real SQLite database, on disk, from the first lesson
that touches persistence onward.

The app is not the point. **The app is the laboratory.** Pocket Inventory
exists so that C# — the language — and WPF — the framework — *have* to come
up, one concept at a time, because the feature you're building genuinely
needs them, not because a syllabus scheduled them.

## Why This Project, Why Now

You're taking a university course in C# and WPF. The assignments are small,
disconnected programs — a console app here, a WPF form there — and each one
re-teaches the same fundamentals (variables, loops, a button click) from zero
before it can get to whatever it's actually supposed to be about. That's fine
for grading, but it's a bad way to actually learn a language: you re-read the
same "here's a variable" explanation five times and never get anywhere deep,
and you're left with five unrelated files instead of one thing you understand
end to end.

This project is the opposite bet: **one continuous codebase, one continuous
lesson sequence.** Every C# and WPF concept — from `var` to `INotifyPropertyChanged`
to the Memento pattern behind undo/redo — is taught exactly once, at the exact
lesson that first needs it, inside a project that keeps growing instead of
getting thrown away. That single sequence *is* your reference afterward: when
you forget how nullable value types work, you don't hunt through five old
homework folders — you go back to [Lesson 14](Lesson-14-nullable-purchase-info.md),
because that's the lesson that needed them first.

This does **not** mean every C# fundamental gets dumped on you in Lesson 0.
Cramming everything up front so it's "all in one place" would just be a
different kind of shallow. Concepts still arrive one at a time, each in the
lesson that actually needs it — the "one tutorial" promise is about never
re-teaching the same idea from scratch in a disconnected project, not about
front-loading. See [Lesson Standard](#lesson-standard) below.

Pocket Inventory has a deliberate sibling in this curriculum: an Android
version of the same idea already exists at
[`../track/`](../track/). That project teaches the same product concept —
name it, categorize it, save it, find it again — on a phone. This project
teaches it on the desktop. Building the same *idea* twice, on two genuinely
different platforms, is what makes it obvious which parts of what you're
learning are universal (validation, persistence, state management, one
source of truth) and which parts are platform ceremony (an `Activity`'s
lifecycle vs. a WPF `Window`'s).

## Lesson Standard

Every lesson in this project must meet [`LESSON_CONTRACT.md`](../../LESSON_CONTRACT.md)
and follow [`LESSON SCHEMA.md`](../../LESSON%20SCHEMA.md) mechanically. Read
both before writing or reviewing a lesson. The short version, relevant to
this specific project:

- **Every C# construct gets its own throwaway lab the first time it appears
  in this curriculum — no exceptions for things that look Python-familiar.**
  `var` is not "the same as Python, just with a keyword." A `foreach` is not
  "just a for-loop." Static typing means the compiler rejects programs Python
  would happily run. These get real concept labs, not a one-line aside.
- **Code-behind before MVVM.** WPF's idiomatic architecture (data binding,
  `ICommand`, a ViewModel layer) is *introduced once its absence actually
  hurts* — after a few lessons of manually keeping a list in sync by hand,
  not before. See [How the Lessons Are Ordered](#how-the-lessons-are-ordered).
- **Raw ADO.NET before any ORM.** Persistence starts with `Microsoft.Data.Sqlite`
  and hand-written SQL — the same choice this curriculum's Python/FastAPI
  sibling project ([`../inventory/`](../inventory/)) made, for the same
  reason: you can't understand what an ORM is hiding from you until you've
  done the thing it hides by hand at least once.

## Before Lesson 0a: What You Already Know

> **Revised 2026-07-29** — see `CURRICULUM_NOTES.md`. The floor below
> used to read "you know Python well," which in practice meant OOP
> vocabulary (`class`, `object`, `constructor`, `: BaseClass`
> inheritance) got used starting in Lesson 0 without ever being taught
> — nobody had actually verified the reader knew it. The corrected floor
> is deliberately narrower.

Basic Python only: functions, data types, loops, `list`, `dict`. That
gives you real, transferable understanding of what these *are for* —
that transfers. It does **not** give you C#'s syntax, C#'s type system,
or WPF's execution model, and this curriculum never assumes it does.
**It also does not include OOP** — `class`, `object`, `constructor`,
inheritance are first appearances here, the same as if you'd never
written a class in any language, and get real, from-scratch treatment
in [Lesson 0a](Lesson-00-a-classes-objects-and-inheritance.md), read
*before* Lesson 0 for exactly this reason. Every lesson that touches a
construct with a "Python cousin" (`var` vs. Python's untyped assignment,
`foreach` vs. `for x in y`, `Dictionary<K,V>` vs. `dict`) says so
explicitly and still gives it a full concept lab — per
`LESSON_CONTRACT.md`'s own rule: *"familiar-sounding is a trap, not a
reason to skip the lab."*

Lesson 0a assumes nothing else. No prior C#. No prior WPF. No prior
XAML. No prior OOP, in any language.

## How the Lessons Are Ordered

Four deliberate departures from a naive "one user story per lesson" ordering,
each fixing a real problem:

1. **A working, saved, reloadable item exists by Lesson 10 — not Lesson 20.**
   Adding every field of an inventory item (name, category, location, value,
   purchase date, notes, favorite) before the item can be viewed, saved, or
   reloaded is eight lessons of typing into a form that goes nowhere. That
   violates Agile Delivery's core rule from `LESSON_CONTRACT.md`: *every
   lesson ends with something you can run and see, now, not "once we wire it
   up later."* Epic 2 instead builds the smallest possible item — a name and
   nothing else — all the way through the full pipeline (form → in-memory
   list → data-bound display → SQLite → reload on startup → validation) in
   six tight lessons. Epic 3 then *grows* that already-working item one field
   at a time. Every lesson after Lesson 6 is a real vertical slice: model,
   view, and database, together, never split across three separate epics.
2. **Code-behind first, MVVM once it hurts.** Lessons 1–22 use plain
   code-behind event handlers — the most direct path from "click a button" to
   "something happens," and the same starting point React Studio (this
   curriculum's other project) uses before introducing `useReducer`. By
   Lesson 23 there are Add, Edit, Delete, and Save handlers scattered across
   two windows, several of them duplicating the same validation and refresh
   logic. That felt pain is the entire motivation for Lesson 23: introducing
   `ICommand`, `RelayCommand`, and a proper MVVM split — not because "real
   WPF uses MVVM" as a rule to memorize, but because you will have already
   felt exactly the problem it solves.
3. **The database is raw SQL, not an ORM, from Lesson 9 onward.** You write
   the `CREATE TABLE`, the `INSERT`, and the `SELECT` yourself. An ORM is
   mentioned exactly once, as the SE lens's "alternative not chosen," with
   the real tradeoff stated honestly — not retrofitted in later.
4. **Suppliers arrive as a real relational table, not a text field.** The
   original plan for this project treated "manufacturer" and "supplier" as
   plain strings typed into a text box. That throws away the one place this
   project could teach foreign keys, `JOIN`, and one-to-many relationships —
   the single most transferable relational-database idea there is. Epic 6
   builds a real `Suppliers` table instead.

## Prepended Concept Lessons (`Lesson-NN-a-...`)

Added 2026-07-29, ongoing: wherever a lesson uses a C#/.NET construct
without ever teaching it — found by auditing the whole course against
the corrected "no OOP, no C#, no WPF" floor above — the fix is a short,
standalone lesson **inserted before** the lesson that first needs it,
not a rewrite of the lesson itself. Existing lessons stay as committed;
a prepended lesson closes the gap in front of them.

A second wave, added 2026-08-01, closes a different kind of gap: real
C#/OOP fundamentals (`virtual`/`override`, `abstract` classes, structs,
writing your own generics, custom `delegate`/`event` types, custom
exceptions) that this project's own real code never happened to force —
found via a direct audit against the stated goal of learning C# and OOP
deeply, not just whatever this one project's narrative required. Nine
exist so far:

- [Lesson 0a — Classes, Objects, Constructors, and Inheritance](Lesson-00-a-classes-objects-and-inheritance.md) — before Lesson 0, which uses `class`/`instance`/`constructor` on its very first page.
- [Lesson 0b — Polymorphism, `virtual`, and `override`](Lesson-00-b-polymorphism-virtual-and-override.md) — directly after 0a; inheritance without overriding is half the picture.
- [Lesson 0c — Abstract Classes and Interfaces as Abstraction](Lesson-00-c-abstract-classes-and-interfaces.md) — directly after 0b; contrasts `abstract` classes against the interfaces (`INotifyPropertyChanged`, `ICommand`) this project already implements without ever explaining why an interface, not a base class.
- [Lesson 1a — `static`, `readonly`, `Dictionary<K,V>`, and Safe Lookups](Lesson-01-a-static-readonly-dictionary-and-safe-lookups.md) — before Lesson 2, whose attached-property lab bundles five unlabeled constructs into one line.
- [Lesson 1b — Structs and Extension Methods](Lesson-01-b-structs-and-extension-methods.md) — directly after 1a; `SortDescription` (Lesson 18) is a real `struct`, used without ever explaining value-type semantics.
- [Lesson 5a — `enum`](Lesson-05-a-enum-a-closed-set-of-named-values.md) — before Lesson 6, which uses an enum-backed property six lessons before `enum` otherwise gets its own lab (Lesson 12, which now points back here instead of re-teaching it).
- [Lesson 6a — Generics, Writing Your Own](Lesson-06-a-generics-writing-your-own.md) — directly after Lesson 6's own `List<T>`; Lesson 48's `CountDescendants<T> where T : DependencyObject` uses this silently, 42 lessons later, with no prior explanation.
- [Lesson 6b — Custom Delegates and Events](Lesson-06-b-custom-delegates-and-events.md) — directly after 6a; explains the `delegate`/`event` mechanism behind `PropertyChangedEventHandler`/`PropertyChanged` (Lesson 7), used correctly but never explained.
- [Lesson 23a — Custom Exceptions](Lesson-23-a-custom-exceptions.md) — directly after Lesson 23, before Lesson 24's real `catch (SqliteException ex)` — explains how a `catch` block can distinguish exception types at all.

More get added as they're found reading forward — this list grows, not
all at once.

## Lesson 0 — Developer Environment

Lesson 0 has no user story — it's the one explicitly non-feature lesson,
because nothing else can start without it. It covers, in this order: what
.NET and the CLR actually are and how they differ from Python's interpreter;
what C# is and where WPF sits among Windows UI options (WinForms, UWP, MAUI,
Avalonia) and why this curriculum picked WPF; installing the .NET SDK and
Visual Studio on your Windows machine; a from-scratch console app used purely
to get comfortable with `Main`, `Console.WriteLine`, semicolons, curly braces,
and `var` (including the exact `var` gotcha that prompted this project:
`var` cannot be used to declare more than one variable in a single statement,
unlike `int x, y;`); and finally the first WPF project — a window that opens
and shows text, which is where Lesson 1 picks up.

→ [`Lesson-00-developer-environment.md`](Lesson-00-developer-environment.md)

---

## Epic 1 — The Application Shell

The shell is visible from the first lesson: a real window, with real
navigation between two real screens, before a single inventory item exists.

| # | Title (User Story) | You Can See | New C#/.NET/WPF Concept | SE Principle | CS Concept |
|---|---|---|---|---|---|
| 1 | Your First WPF Window — *As a user, I want to launch Pocket Inventory and see a welcoming home screen* | A window opens with a title and a greeting | `Window`, XAML vs. code-behind, the `.csproj`/`App.xaml`/`MainWindow.xaml` project shape | Markup describing structure, code describing behavior — kept in separate files on purpose | The retained-mode UI model (declare the tree once; the framework re-renders it) |
| 2 | Grid and the Visual Tree — *I want the application to have a professional-looking layout* | Header, content area, and footer arranged in a real layout, not stacked labels | `Grid`, `RowDefinition`/`ColumnDefinition`, the visual tree | Layout as a system (rows/columns) vs. manual pixel positioning | Tree data structures — the visual tree is one |
| 3 | Frame/Page Navigation — *I want to navigate to an Add Inventory screen* | Clicking "Add Item" swaps in a new screen without opening a new window | `Frame`, `Page`, `NavigationService.Navigate` | One window, many interchangeable screens — composition over one giant window | A navigation stack as an explicit data structure |
| 4 | The Navigation Stack — *I want to return to the Home screen from anywhere* | A working Back button that returns to Home from any screen | `NavigationService.GoBack`, `CanGoBack` | Symmetry: every forward navigation implies a backward one | Stack semantics (LIFO) made concrete and clickable |
| 5 | Styles and Resource Dictionaries — *I want a consistent title, branding, and navigation experience* | Every screen shares the same fonts, colors, and header — changing one `Style` changes all of them | `Style`, `ResourceDictionary`, `StaticResource` | DRY applied to markup, not just code | None |

---

## Epic 2 — The First End-to-End Item

The whole pipeline — type a name, see it in a list, close the app, reopen it,
it's still there — built for the smallest possible item before a single
extra field exists.

| # | Title (User Story) | You Can See | New C#/.NET/WPF Concept | SE Principle | CS Concept |
|---|---|---|---|---|---|
| 6 | Fields, Classes, and `List<T>` — *I want to enter the basic details of an inventory item* | Typing a name and clicking "Add" makes it appear in a plain list on screen | `class`, fields vs. properties, `List<T>`, a click event handler | Modeling a real-world thing as a type before touching the UI | None yet — the pain of manual refresh is next lesson's motivation |
| 7 | `INotifyPropertyChanged` + `ObservableCollection<T>` — *the list should update itself* | The manual refresh call from Lesson 6 is deleted; the list still updates | `INotifyPropertyChanged`, `ObservableCollection<T>`, XAML `{Binding}` | The Observer pattern — the view reacts to the model instead of being told about it | Observer pattern (first appearance — will recur constantly) |
| 8 | `SelectedItem` and Two-Way Binding — *I want to select an item to view its details* | Clicking a row shows that item's full details in a side panel | `SelectedItem`, `TwoWay` vs. `OneWay` binding mode | Single source of truth — the detail panel has no state of its own | None |
| 9 | SQLite and `Microsoft.Data.Sqlite` — *I don't want my inventory to disappear when I close the app* | Add an item, fully quit the app, and it's gone from the screen — but it's sitting in a real `.db` file you can open | `Microsoft.Data.Sqlite`, `CREATE TABLE`, parameterized `INSERT` | Why raw ADO.NET before an ORM — see what an ORM would hide | Persistent storage vs. process memory |
| 10 | Reading Rows Back Into Objects — *I want all previously saved items loaded automatically* | Reopen the app — every item you ever added is back in the list | `SELECT`, `SqliteDataReader`, mapping a row to a `class` instance | The load/save pair as the two halves of one contract | None |
| 11 | Validation at a Boundary — *I don't want the application to accept invalid data* | Submitting a blank name shows an inline error instead of a blank row in the grid | `string.IsNullOrWhiteSpace`, `IDataErrorInfo` | Never trust input, even your own UI's | The general boundary-validation principle (first appearance) |

---

## Epic 3 — Growing the Item Model

Every lesson here adds one real field, end to end — model, form, list/detail
view, and database column, together. None of these are model-only or
view-only lessons.

| # | Title (User Story) | You Can See | New C#/.NET/WPF Concept | SE Principle | CS Concept |
|---|---|---|---|---|---|
| 12 | Enums and `ComboBox` — *I want to organize items into categories and specify where they're stored* | A dropdown of fixed categories; a location field; both shown as new grid columns | `enum`, `ComboBox`, `ItemsSource` binding | Closed sets of valid values enforced by the type system, not by convention | Enumeration as a finite, named set |
| 13 | `decimal` and Culture-Aware Formatting — *I want to assign a monetary value* | A price column showing real currency formatting (`$1,299.00`) | `decimal` vs. `double`/`float`, `ToString("C")`, `CultureInfo` | Why money is never stored as a binary float | Floating-point representation error, made concrete |
| 14 | Nullable Value Types and `DatePicker` — *I want to record purchase information* | A purchase-date column that's genuinely blank for older items instead of showing a fake date | `Nullable<T>` / `DateTime?`, `DatePicker` | Modeling "this might not exist" instead of faking a sentinel value | Option/optional types as a general CS idea |
| 15 | Multi-line Text and `bool` — *I want to attach notes and mark favorites* | A notes field that wraps across lines; a star icon that toggles per row | `TextWrapping`, `CheckBox`, `bool` columns, `DataTrigger` | Presentation logic driven by data, not by manually toggling visuals | None |

---

## Epic 4 — Search, Sort, and Filter

| # | Title (User Story) | You Can See | New C#/.NET/WPF Concept | SE Principle | CS Concept |
|---|---|---|---|---|---|
| 16 | The `DataGrid` Control — *I want inventory displayed in a professional table* | The plain `ListBox` from Epic 2 is replaced by a real sortable, resizable table | `DataGrid`, `DataGridTextColumn`, auto-generated vs. explicit columns | Swapping a control without touching the underlying data — the payoff of Lesson 7's binding | None |
| 17 | `CollectionViewSource` — *I want items grouped by category* | The same flat list now shows category headers with items nested underneath | `CollectionViewSource`, `ICollectionView`, `GroupDescriptions` | One data source, many presentations — no duplicated data | Grouping as a view over data, not a copy of it |
| 18 | `SortDescription` — *I want items sorted alphabetically, and by value* | Clicking a column header re-sorts the grid live | `SortDescription`, `IComparable` | Sorting as a declared description applied to a view, not a manual `List.Sort()` call each time | Comparison-based sorting, stability |
| 19 | Predicates on `ICollectionView` — *I want to search by name* | Typing in a search box filters the grid live, on every keystroke | `ICollectionView.Filter`, a `Predicate<T>` delegate | Filtering as a pure function over each row, composed with the view | Predicate functions, linear scan filtering |
| 20 | Combining Predicates — *I want to combine multiple filters* | Category, location, favorites-only, and search text all narrow the same grid together | Composing delegates with `&&` instead of branching `if`/`else` chains | Composability — N independent filters instead of 2^N special-cased branches | Boolean composition of predicates |

---

## Epic 5 — Editing, Deleting, and Growing Up (MVVM)

| # | Title (User Story) | You Can See | New C#/.NET/WPF Concept | SE Principle | CS Concept |
|---|---|---|---|---|---|
| 21 | Reusing a View for Create and Update — *I want to edit an existing item* | The same Add form, now pre-filled, saves changes to an existing row instead of creating a new one | Passing an existing object into a view; `UPDATE ... WHERE Id = @id` | DRY across two user stories that are 90% the same form | None |
| 22 | Modal Dialogs and `MessageBoxResult` — *I want to delete items, with confirmation* | Clicking delete pops a real Yes/No dialog before anything disappears | `MessageBox.Show`, `MessageBoxResult`, `MessageBoxButton` | Destructive actions get a deliberate pause, by convention, everywhere | None |
| 23 | `ICommand`, `RelayCommand`, and the MVVM Refactor — *making the last three lessons' click handlers maintainable* | Nothing new visually — Add/Edit/Delete/Search all still work, now driven by bindable Commands instead of `Click="..."` handlers | `ICommand`, a hand-written `RelayCommand`, `ViewModel` classes, `CommandParameter` | Separation of concerns — UI logic becomes testable without a `Window` to click on | The Command pattern (first appearance — recurs at undo/redo in Lesson 45) |

---

## Epic 6 — Relational Data

| # | Title (User Story) | You Can See | New C#/.NET/WPF Concept | SE Principle | CS Concept |
|---|---|---|---|---|---|
| 24 | Foreign Keys and `JOIN` — *I want to manage manufacturers, suppliers, and serial numbers* | A Supplier dropdown on the item form, populated from a separate, manageable Suppliers list | A second SQLite table, `FOREIGN KEY`, `INNER JOIN` | One-to-many relationships modeled relationally instead of as a repeated text field | Relational joins, referential integrity |
| 25 | Storing Photos by Path, Not by Value — *I want to attach photographs* | Click "Add Photo," pick a file, see a real thumbnail next to the item | `OpenFileDialog`, `BitmapImage`, copying a file into an app-owned folder | Why the database stores a file *path*, not the image bytes — BLOB vs. filesystem tradeoff | None |
| 26 | Deleting Orphaned Files — *I want to remove outdated photographs* | Removing a photo from the item also removes the file from disk — no orphaned files pile up | `File.Delete`, cleanup as part of the same transaction conceptually | Referential integrity isn't just a database concept — the filesystem needs it too | None |

---

## Epic 7 — Inventory Lifecycle

| # | Title (User Story) | You Can See | New C#/.NET/WPF Concept | SE Principle | CS Concept |
|---|---|---|---|---|---|
| 27 | Deep Copy vs. Reference Copy — *I want to duplicate an item* | Clicking "Duplicate" creates a genuinely independent second row — editing the copy never changes the original | Manual deep copy (a copy constructor or `with`-expression on a `record`) | Value semantics vs. reference semantics — the exact bug this lesson exists to prevent | Shallow vs. deep copy |
| 28 | The Soft-Delete Pattern — *I want to archive items instead of deleting them, and restore them later* | "Delete" now hides an item from the main grid instead of removing the row; an Archive view shows it and can bring it back | An `IsArchived` column, a second filtered `ICollectionView` | Soft delete vs. hard delete — recoverability vs. unbounded storage growth, stated honestly | None |
| 29 | A Tiny State Machine — *I want to track borrowed items, who has them, and when they're returned* | A status badge on each row: Available, or Borrowed with a name and date | A `BorrowStatus` enum, valid-transition logic (`Available → Borrowed → Available`) | Encoding valid state transitions in code instead of trusting every screen to check by hand | Finite state machines (first appearance — real-world recognition list given here) |

---

## Epic 8 — Inventory Intelligence

| # | Title (User Story) | You Can See | New C#/.NET/WPF Concept | SE Principle | CS Concept |
|---|---|---|---|---|---|
| 30 | `SUM()` and Aggregate Queries — *I want to know the total value of my inventory* | A running total displayed above the grid, computed by the database, not by looping in C# | `SUM()`, scalar queries | Let the database do aggregate math — it's built for exactly this | Aggregate functions over a relation |
| 31 | `GROUP BY` — *I want to see inventory value by category* | A small breakdown panel: category name next to its total value | `GROUP BY`, one row per group returned | Grouping as a single query instead of N queries in a loop | Relational grouping |
| 32 | `ORDER BY` and `LIMIT` — *I want to identify my most valuable items, and items missing a category* | A "Top 5 Most Valuable" list; an "Uncategorized" warning list | `ORDER BY ... DESC LIMIT`, `WHERE category IS NULL` | Expressing "top N" as a query, not as sorting the whole table in C# and slicing | `NULL` as "unknown/absent," distinct from a default value |
| 33 | Composing a Dashboard From What You Already Have — *I want summary statistics for my collection* | A small stats panel combining total value, item count, top category, and uncategorized count | Composing the previous three lessons' queries behind one method | Open/closed — the dashboard adds behavior by composing existing queries, not modifying them | Reappearance: composability (first seen in Lesson 20) |

---

## Epic 9 — Import, Export, and Print

| # | Title (User Story) | You Can See | New C#/.NET/WPF Concept | SE Principle | CS Concept |
|---|---|---|---|---|---|
| 34 | CSV, `StreamWriter`, and Escaping — *I want to export my inventory as CSV* | A real `.csv` file, opens correctly in Excel, including an item whose name contains a comma | `StreamWriter`, manual CSV quoting/escaping rules | Why "just join with commas" breaks the moment real data contains one | Serialization to a flat text format |
| 35 | Defensive CSV Parsing — *I want to import inventory from CSV* | Importing a hand-edited CSV file — malformed rows are reported, not silently corrupted or crashed on | Splitting respecting quotes, per-row try/catch | Never trust an imported file — the boundary-validation principle from Lesson 11, reappearing | Parsing as tokenizing a line into fields |
| 36 | `System.Text.Json` — *I want to export and import as JSON* | A `.json` file round-trips perfectly, including nested supplier and photo data CSV couldn't represent | `JsonSerializer.Serialize`/`Deserialize`, attributes on a `class` | Structured vs. flat formats — a real tradeoff, not just "JSON is newer" | Tree-shaped (nested) vs. flat (tabular) data |
| 37 | `FlowDocument` and `PrintDialog` — *I want to print my inventory* | A real print preview, then a printed page, from the same data shown on screen | `FlowDocument`, `PrintDialog`, `DocumentPaginator` | Reusing the existing model to drive a completely different output — not a special "printable copy" of the data | None |

---

## Epic 10 — Professional Desktop Features

| # | Title (User Story) | You Can See | New C#/.NET/WPF Concept | SE Principle | CS Concept |
|---|---|---|---|---|---|
| 38 | `%AppData%` and Settings Persistence — *I want application settings that stick* | Change a setting, fully quit, reopen — it's still set | `Environment.SpecialFolder`, a settings file separate from the inventory database | Why user preferences don't live in the same database as user data | None |
| 39 | `DynamicResource` — *I want dark mode and custom themes* | Toggle a switch — every screen re-themes instantly, no restart | `DynamicResource` vs. `StaticResource`, swapping a `ResourceDictionary` at runtime | Why theming needs `Dynamic`, not `Static`, resources — the real mechanical reason | None |
| 40 | `InputBindings` and `KeyGesture` — *I want keyboard shortcuts* | `Ctrl+N` adds an item; `Delete` removes the selected one — reusing Lesson 23's Commands | `InputBinding`, `KeyGesture` | Reappearance: the Command pattern (Lesson 23) — one Command, two triggers (click and keypress) | None |
| 41 | `ContextMenu` and a Status Bar — *I want right-click actions, a toolbar, and useful status info* | Right-clicking a row shows Edit/Delete/Duplicate; a status bar shows item count and last-saved time | `ContextMenu`, `StatusBar`, binding a footer to live view-model state | Discoverability — the same Commands, surfaced a third way | None |

---

## Epic 11 — Power User Features

| # | Title (User Story) | You Can See | New C#/.NET/WPF Concept | SE Principle | CS Concept |
|---|---|---|---|---|---|
| 42 | `SelectionMode` and `SelectedItems` — *I want to select multiple items at once* | Ctrl-click and Shift-click select multiple rows, visibly highlighted | `DataGrid.SelectionMode`, `SelectedItems` | None yet — this lesson is the setup for the next | `IList` as the shape multiple selections take |
| 43 | Bulk Edit and Bulk Delete — *I want to act on my whole selection at once* | Select five rows, change their category once, or delete all five with one confirmation | Iterating `SelectedItems`, one transaction for many rows | Batch operations vs. repeating a single-item operation N times | None |
| 44 | The Drag-and-Drop API — *I want to drag items to reorganize them* | Dragging a row onto a category in a side panel re-categorizes it | `DragDrop.DoDragDrop`, `DragEventArgs`, `AllowDrop` | Direct manipulation as an alternative UI to menus — a real usability tradeoff, not strictly "better" | None |
| 45 | The Command and Memento Patterns — *I want undo and redo for destructive actions* | Delete five items, hit `Ctrl+Z` five times, watch them come back, in order | An undo stack of reversible Command objects | Reappearance: the Command pattern (Lesson 23), deepened — a Command that also knows how to *undo itself* | The Memento pattern; stack-based history (LIFO, again — reappearing from Lesson 4's navigation stack) |

---

## Epic 12 — Finishing the Product

| # | Title (User Story) | You Can See | New C#/.NET/WPF Concept | SE Principle | CS Concept |
|---|---|---|---|---|---|
| 46 | `File.Copy` and `DispatcherTimer` — *I want automatic backups* | A timestamped backup `.db` file appears in a backups folder on a schedule | `DispatcherTimer`, `File.Copy` | Backups as a scheduled side effect, decoupled from the save path itself | None |
| 47 | Restoring a Backup — *I want to restore from a backup* | Pick an old backup file — the app's data is fully replaced by it, after a confirmation | Closing and reopening a `SqliteConnection` against a different file | The restore path is the load path (Lesson 10), reappearing — not a new mechanism | None |
| 48 | Virtualization and Big-O — *I want the app to perform well with thousands of items* | Load 10,000 generated items — scrolling stays smooth instead of freezing | `VirtualizingStackPanel`, why `DataGrid` virtualizes by default | Naming what "n" actually is in this app's real use, not just the asymptotic class | UI virtualization; the 16.6ms-per-frame budget |
| 49 | `dotnet publish` and an About Screen — *I want to publish Pocket Inventory as a real desktop application* | A real installer/executable that runs on a machine with no SDK installed | `dotnet publish`, self-contained vs. framework-dependent deployment | The dev/production gap — what changes between `dotnet run` and a shipped `.exe` | None |

---

## Capstone

**Lesson 50 — Refactor, Architecture Review, and a v2 Retrospective.**
No new feature. This lesson revisits the whole codebase with the professional
practice named in `LESSON_CONTRACT.md`'s "Code review" section: extract a
`Repository` class from the raw SQL scattered across nine lessons' worth of
ViewModels, confirm every screen actually went through the Lesson 23 MVVM
refactor and none quietly reverted to a click handler, and write down, in
your own words, what you'd design differently starting a v2 today. The
retrospective is itself the deliverable — a professional engineer revisiting
old decisions with better judgment than they had when they made them.

→ *(all 50 lessons are written — see [Status](#status) below)*

## After the Capstone

Lessons 51–54, added 2026-08-01, came from the same kind of audit that
produced the second wave of prepended concept lessons — real,
professional-practice gaps (`async`/`await`, real unit tests, real
logging, LINQ) this project's own narrative never forced, but that a
developer aiming for genuine C# depth needs regardless. Each is a real,
appended lesson, not a rewrite of the capstone itself — the capstone's
own retrospective stands as originally written.

- **Lesson 51 — Async/Await.** Converts `ItemRepository.GetAll()` to a
  real `GetAllAsync()`, with real, measured proof (a `DispatcherTimer`
  heartbeat) that a synchronous SQLite call genuinely freezes the UI
  thread, and an async one doesn't.
- **Lesson 52 — Unit Testing with xUnit.** A real, permanent
  `PocketInventory.Tests` project, replacing this course's own
  throwaway-lab verification method with real, rerunnable `[Fact]`
  tests against `ItemRepository` — the concrete payoff of Lesson 50's
  own Repository extraction.
- **Lesson 53 — Logging.** A real `FileLogger`, wired into
  `Application.DispatcherUnhandledException`, so a real crash in the
  published `.exe` (Lesson 49) leaves a real, persistent record instead
  of vanishing with no console attached to see it.
- **Lesson 54 — LINQ, the Professional Shorthand.** Proves
  `Where`/`Select` reproduce this project's own hand-rolled filter loops
  exactly, names deferred execution, and closes a small, real finding
  Lesson 50's own retrospective named but left for later.

## Definition of Done

- Every lesson's code compiles and runs against the previous lesson's
  completed state, no gaps.
- An item can be created, edited, archived, restored, and permanently
  deleted, each going through real SQLite, not just in-memory state.
- Suppliers are a real related table, joined, not a text field.
- The grid can be searched, filtered on multiple criteria at once, sorted,
  and grouped, without duplicating the underlying data.
- Undo/redo works for at least delete and bulk-delete.
- The app can be exported to CSV and JSON and re-imported without data loss.
- The app runs, unmodified, against 10,000 generated items without the UI
  freezing.
- `dotnet publish` produces a `.exe` that runs on a machine with no .NET SDK
  installed.
- You can explain, from memory, why code-behind was used first and MVVM was
  introduced in Lesson 23 specifically — not "because MVVM is the WPF way."

## Status

All 50 core lessons and the capstone are written and verified, plus
nine prepended concept lessons and four lessons appended after the
capstone (Lessons 51–54) closing real C#/professional-practice gaps
found by direct audit — see [After the Capstone](#after-the-capstone)
above:

- [x] [Lesson 0a — Classes, Objects, Constructors, and Inheritance](Lesson-00-a-classes-objects-and-inheritance.md) *(prepended 2026-07-29)*
- [x] [Lesson 0b — Polymorphism, `virtual`, and `override`](Lesson-00-b-polymorphism-virtual-and-override.md) *(prepended 2026-08-01)*
- [x] [Lesson 0c — Abstract Classes and Interfaces as Abstraction](Lesson-00-c-abstract-classes-and-interfaces.md) *(prepended 2026-08-01)*
- [x] [Lesson 0 — Developer Environment](Lesson-00-developer-environment.md)
- [x] [Lesson 1 — Your First WPF Window](Lesson-01-your-first-wpf-window.md)
- [x] [Lesson 1a — `static`, `readonly`, `Dictionary<K,V>`, and Safe Lookups](Lesson-01-a-static-readonly-dictionary-and-safe-lookups.md) *(prepended 2026-07-29)*
- [x] [Lesson 1b — Structs and Extension Methods](Lesson-01-b-structs-and-extension-methods.md) *(prepended 2026-08-01)*
- [x] [Lesson 2 — Grid and the Visual Tree](Lesson-02-grid-and-the-visual-tree.md)
- [x] [Lesson 3 — Frame/Page Navigation](Lesson-03-frame-page-navigation.md)
- [x] [Lesson 4 — The Navigation Stack](Lesson-04-the-navigation-stack.md)
- [x] [Lesson 5 — Styles and Resource Dictionaries](Lesson-05-styles-and-resource-dictionaries.md)
- [x] [Lesson 5a — `enum`](Lesson-05-a-enum-a-closed-set-of-named-values.md) *(prepended 2026-07-29)*
- [x] [Lesson 6 — Fields, Classes, and List](Lesson-06-fields-classes-and-list.md)
- [x] [Lesson 6a — Generics, Writing Your Own](Lesson-06-a-generics-writing-your-own.md) *(prepended 2026-08-01)*
- [x] [Lesson 6b — Custom Delegates and Events](Lesson-06-b-custom-delegates-and-events.md) *(prepended 2026-08-01)*
- [x] [Lesson 7 — `INotifyPropertyChanged` and `ObservableCollection`](Lesson-07-inotifypropertychanged-observablecollection.md)
- [x] [Lesson 8 — `SelectedItem` and Two-Way Binding](Lesson-08-selecteditem-and-two-way-binding.md)
- [x] [Lesson 9 — SQLite and `Microsoft.Data.Sqlite`](Lesson-09-sqlite-and-microsoft-data-sqlite.md)
- [x] [Lesson 10 — Reading Rows Back Into Objects](Lesson-10-reading-rows-back-into-objects.md)
- [x] [Lesson 11 — Validation at a Boundary](Lesson-11-validation-at-a-boundary.md)
- [x] [Lesson 12 — Enums and `ComboBox`](Lesson-12-enums-and-combobox.md)
- [x] [Lesson 13 — `decimal` and Culture-Aware Formatting](Lesson-13-decimal-and-culture-aware-formatting.md)
- [x] [Lesson 14 — Nullable Purchase Info](Lesson-14-nullable-purchase-info.md)
- [x] [Lesson 15 — Notes and Favorites](Lesson-15-notes-and-favorites.md) *(closes Epic 3)*
- [x] [Lesson 16 — The DataGrid Control](Lesson-16-the-datagrid-control.md)
- [x] [Lesson 17 — CollectionViewSource and Grouping](Lesson-17-collectionviewsource-and-grouping.md)
- [x] [Lesson 18 — SortDescription](Lesson-18-sortdescription.md)
- [x] [Lesson 19 — Predicates and Live Search](Lesson-19-predicates-and-live-search.md)
- [x] [Lesson 20 — Combining Predicates](Lesson-20-combining-predicates.md) *(closes Epic 4)*
- [x] [Lesson 21 — Reusing a View for Create and Update](Lesson-21-reusing-a-view-for-create-and-update.md)
- [x] [Lesson 22 — Modal Dialogs and MessageBoxResult](Lesson-22-modal-dialogs-and-messageboxresult.md)
- [x] [Lesson 23 — ICommand, RelayCommand, and MVVM](Lesson-23-icommand-relaycommand-and-mvvm.md) *(closes Epic 5)*
- [x] [Lesson 23a — Custom Exceptions](Lesson-23-a-custom-exceptions.md) *(prepended 2026-08-01)*
- [x] [Lesson 24 — Foreign Keys and JOIN](Lesson-24-foreign-keys-and-join.md) *(opens Epic 6)*
- [x] [Lesson 25 — Storing Photos by Path](Lesson-25-storing-photos-by-path.md)
- [x] [Lesson 26 — Deleting Orphaned Files](Lesson-26-deleting-orphaned-files.md) *(closes Epic 6)*
- [x] [Lesson 27 — Deep Copy vs. Reference Copy](Lesson-27-deep-copy-vs-reference-copy.md) *(opens Epic 7)*
- [x] [Lesson 28 — The Soft-Delete Pattern](Lesson-28-the-soft-delete-pattern.md)
- [x] [Lesson 29 — A Tiny State Machine](Lesson-29-a-tiny-state-machine.md) *(closes Epic 7)*
- [x] [Lesson 30 — SUM() and Aggregate Queries](Lesson-30-sum-and-aggregate-queries.md) *(opens Epic 8)*
- [x] [Lesson 31 — GROUP BY](Lesson-31-group-by.md)
- [x] [Lesson 32 — ORDER BY and LIMIT](Lesson-32-order-by-and-limit.md)
- [x] [Lesson 33 — Composing a Dashboard](Lesson-33-composing-a-dashboard.md) *(closes Epic 8)*
- [x] [Lesson 34 — CSV, StreamWriter, and Escaping](Lesson-34-csv-streamwriter-and-escaping.md) *(opens Epic 9)*
- [x] [Lesson 35 — Defensive CSV Parsing](Lesson-35-defensive-csv-parsing.md)
- [x] [Lesson 36 — System.Text.Json](Lesson-36-system-text-json.md)
- [x] [Lesson 37 — FlowDocument and PrintDialog](Lesson-37-flowdocument-and-printdialog.md) *(closes Epic 9)*
- [x] [Lesson 38 — %AppData% and Settings Persistence](Lesson-38-appdata-and-settings-persistence.md) *(opens Epic 10)*
- [x] [Lesson 39 — DynamicResource and Dark Mode](Lesson-39-dynamicresource-and-dark-mode.md)
- [x] [Lesson 40 — InputBindings and KeyGesture](Lesson-40-inputbindings-and-keygesture.md)
- [x] [Lesson 41 — ContextMenu and a Status Bar](Lesson-41-contextmenu-and-status-bar.md) *(closes Epic 10)*
- [x] [Lesson 42 — SelectionMode and SelectedItems](Lesson-42-selectionmode-and-selecteditems.md) *(opens Epic 11)*
- [x] [Lesson 43 — Bulk Edit and Bulk Delete](Lesson-43-bulk-edit-and-bulk-delete.md)
- [x] [Lesson 44 — The Drag-and-Drop API](Lesson-44-the-drag-and-drop-api.md)
- [x] [Lesson 45 — The Command and Memento Patterns](Lesson-45-command-and-memento-patterns.md) *(closes Epic 11)*
- [x] [Lesson 46 — File.Copy and DispatcherTimer](Lesson-46-file-copy-and-dispatchertimer.md) *(opens Epic 12)*
- [x] [Lesson 47 — Restoring a Backup](Lesson-47-restoring-a-backup.md)
- [x] [Lesson 48 — Virtualization and Big-O](Lesson-48-virtualization-and-big-o.md)
- [x] [Lesson 49 — dotnet publish and an About Screen](Lesson-49-dotnet-publish-and-an-about-screen.md)
- [x] [Lesson 50 (Capstone) — Refactor, Architecture Review, and a Retrospective](Lesson-50-refactor-architecture-review-and-a-retrospective.md)
- [x] [Lesson 51 — Async/Await](Lesson-51-async-and-await.md) *(added 2026-08-01)*
- [x] [Lesson 52 — Unit Testing with xUnit](Lesson-52-unit-testing-with-xunit.md) *(added 2026-08-01)*
- [x] [Lesson 53 — Logging](Lesson-53-logging.md) *(added 2026-08-01)*
- [x] [Lesson 54 — LINQ, the Professional Shorthand](Lesson-54-linq-the-professional-shorthand.md) *(added 2026-08-01)*
