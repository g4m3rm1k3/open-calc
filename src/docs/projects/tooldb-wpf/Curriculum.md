# ToolDB (WPF + WebView2) — Curriculum (Slice-Based)

## What this project is

A rewrite of the ToolDB tool-inventory app for a WPF + WebView2 stack
instead of Python + pywebview. The goal isn't just a port — it's using
a real app to learn two UI paradigms side by side: native XAML screens
and browser-rendered (HTML/CSS/JS, later React) screens living in the
same window, so you build real judgment for when to reach for which.

## Why slices, not phases

Same reasoning as before: teaching all of SQLite, then all of WPF,
then all of WebView2 would mean a lot of code before a window ever
opens. Instead this builds in **slices** — each one adds a small, real
capability across whatever layers it touches (database, C#, XAML,
WebView2/JS) and ends with the app visibly doing one more true thing.
Depth topics (indexes, triggers, an ORM, migrations, live updates,
React) aren't skipped — they come back once there's a real app to hang
them on.

Every lesson still follows the full `LessonContract` schema, and every
new term gets defined from zero the first time it's used — nothing is
assumed just because it's "well known." This stack introduces a lot of
vocabulary that a Python/pywebview background wouldn't have covered
(WPF, XAML, MVVM, data binding, ADO.NET, `async`/`await`, EF Core,
LINQ, React/JSX), so term coverage is a first-class part of the
schema here, not an afterthought. The **Concepts Introduced** column
in the roadmap below is the audit trail for that promise — if a term
shows up in a lesson's concept list, it must be defined there, not
assumed.

## Three decisions this roadmap is built on

These were decided before any lesson got written, because they change
lesson order and content, not just which framework's syntax gets used:

1. **Host = WPF.** XAML for native chrome, dialogs, and forms; WebView2
   embedded inside the WPF window for browser-rendered content.
2. **JS progression: vanilla first, React later.** The web-rendered
   screens start as plain JS/jQuery/DataTables, matching the original
   project's pace. React shows up in a dedicated later slice that
   rebuilds a screen you already understand — so the comparison is
   earned, not assumed.
3. **Deliberate split, not a thin shell.** Some real screens are native
   XAML (forms, dialogs); others are WebView2 content (the data
   table/dashboard). Both get real practice, on purpose, starting in
   Slice 2.

## Architecture: what owns what

```text
WPF
 ├── application lifecycle (startup, shutdown, top-level window)
 ├── native dialogs / forms (XAML)
 └── WebView2 host
       └── HTML/CSS/JS content
            └── table / dashboard (DataTables, later React)

Persistence
 └── SQLite
      ↑
      │
  C# application layer   ← all data access happens here, and only here
      ↑
      ├── native XAML screens  (talk to C# directly)
      └── WebView2 screens     (talk to C# only through the bridge)
```

This isn't something to memorize — it's a small set of rules that stay
true even as the technologies on top of them change (EF Core replacing
hand-written SQL, React replacing DataTables, a future WebView2-hosted
view replacing today's):

- SQLite is never accessed directly by JavaScript — all data crosses
  the C# boundary first.
- WebView2 never owns application state — it renders what C# gives it
  and reports actions back through the bridge.
- WPF owns the application lifecycle.
- Native XAML screens communicate with application logic directly, in
  C#.
- WebView2 screens communicate with application logic only through the
  bridge (`postMessage`/`WebMessageReceived`, `ExecuteScriptAsync`).
- Swapping a WebView2 screen's presentation layer (vanilla JS → React,
  or any future JS-based view) doesn't change the bridge contract or
  the persistence layer underneath it.
- EF Core replaces/refactors the persistence implementation; it does
  not redefine this architecture.

## How this project is organized

- One project folder, edited in place.
- Lessons live in `lessons/`, numbered in slice order (the number is
  when you'll do it, not a subject grouping).
- Every lesson still ends in a git commit.
- Feature branches start in Slice 2 — one branch per lesson or small
  lesson group. Merge conflicts, `revert`, and `git bisect` get their
  own treatment later (Slice 6–7), once there's enough real complexity
  for them to be genuine rather than staged.
- Status/current position lives in `HANDOFF.md` — read that first when
  resuming.
- Lesson 1 should establish the vertical-slice shape itself
  (C# program → connection → SQLite file, and why each layer exists),
  not become five lessons' worth of ADO.NET infrastructure disguised
  as one.

## Roadmap

### Slice 1 — One Tool, One Window
*Capabilities established:*
- *A C# program can open and query a real SQLite database file.*
- *A WPF application can host a browser control (WebView2) inside a
  native window.*
- *The C# host and WebView2's JavaScript can pass data to each other.*

| # | Lesson | Prereqs | Concepts Introduced | Status |
|---|---|---|---|---|
| 0 | Environment & Project Setup (.NET SDK, creating the initial project, installing a NuGet package) | — | SDK, project file, package manager (NuGet), package restore | written |
| 1 | Connecting to a Database File (`Microsoft.Data.Sqlite`, connection strings) | — | database, SQLite, connection, connection string, resource lifetime | written |
| 2 | Schema Design (`CREATE TABLE`, type affinity, `PRIMARY KEY`) | 1 | table, column, row, type affinity, primary key | not written |
| 3 | Inserting Safely (parameterized queries, `SqliteParameter`) | 1–2 | SQL parameters, parameter binding, SQL injection | not written |
| 4 | Querying Back (`SELECT`, `ExecuteReader`, row→object mapping; write your first automated test against it) | 1–3 | `SELECT`, reader, iteration, row→object mapping, automated test | not written |
| 5 | WPF Basics (`App.xaml`, `MainWindow.xaml`, code-behind, window lifecycle) | — | application, window, XAML, code-behind, lifecycle | not written |
| 6 | Hosting WebView2 in a WPF Window (`CoreWebView2` init, loading local HTML; includes diagnosing a broken/failed initialization) | 5 | control, browser process, initialization, navigation | not written |
| 7 | Passing C# Data to HTML (`postMessage` + `WebMessageReceived` — the JS↔host messaging channel; first real data on screen) | 4, 6 | IPC, serialization, JSON, message passing | not written |

### Slice 2 — A Table You Can Actually Use
*Capabilities established:*
- *The database models real relationships, not a single table.*
- *WebView2 content can render, sort, and search a real dataset.*
- *A native XAML screen exists as a second, independent UI surface.*

| # | Lesson | Prereqs | Concepts Introduced | Status |
|---|---|---|---|---|
| 8 | Records & Strong Types (why a domain model exists — record vs. class, value semantics — instead of the raw mapped object from Lesson 4) | 4 | domain model, record vs. class, value semantics | not written |
| 9 | Multiple Tables & `JOIN` (categories/vendors, foreign keys) | 2–4 | foreign key, `JOIN`, referential relationship | not written |
| 10 | jQuery Basics (selectors, events) | 6 | selector, event binding, DOM | not written |
| 11 | DataTables Fundamentals (rendering the full tool list) | 7, 9–10 | table plugin, client-side rendering, sorting/searching | not written |
| 12 | Styling & Layout (CSS for the web content) | 11 | CSS box model, layout, visual hierarchy | not written |
| 13 | Your First Native XAML Screen (a simple WPF dialog — a separate surface from WebView2) | 5 | window vs. dialog, layout panel, control, XAML tree | not written |

### Slice 3 — Editing Safely
*Capabilities established:*
- *The persistence layer can mutate data safely — transactional, constrained.*
- *A native XAML screen can edit the domain model.*
- *WebView2 can request host operations, and the host can notify WebView2 of the resulting state change.*
- *Asynchronous operations don't block the WPF UI thread.*

| # | Lesson | Prereqs | Concepts Introduced | Status |
|---|---|---|---|---|
| 14 | Updating and Deleting Safely (transactions, rollback — tested against a failed update) | 3–4, 9 | `UPDATE`/`DELETE`, transaction, rollback | not written |
| 15 | Constraints & Data Integrity (`CHECK`, `UNIQUE`, `NOT NULL`, `PRAGMA foreign_keys` — tested against constraint violations and invalid input) | 2, 14 | `CHECK`, `UNIQUE`, `NOT NULL`, constraint violation | not written |
| 16 | XAML Data Binding & MVVM Basics (binding, `INotifyPropertyChanged`) | 8, 13 | binding, `INotifyPropertyChanged`, ViewModel | not written |
| 17 | Building the Add/Edit Form in XAML (bound to a `Tool` record, Save/Cancel) | 8, 13, 16 | form, two-way binding, commands | not written |
| 18 | Two-Way Communication Across the Split (exposing C# methods to JS, `ExecuteScriptAsync`, refreshing the table after a native-side edit; includes debugging a broken round trip) | 7, 14–15, 17 | bridge round trip, host↔JS contract, error propagation | not written |
| 19 | UI/UX for Async State (loading/empty/error states with `async`/`await`) | 18 | `async`/`await` (intro), loading/empty/error state | not written |

### Slice 4 — Going Deeper on Data
*Capabilities established:*
- *The schema enforces and expresses more on its own — indexes, views, triggers, JSON — without application-layer workarounds.*

| # | Lesson | Prereqs | Concepts Introduced | Status |
|---|---|---|---|---|
| 20 | Indexes & Query Planning (`EXPLAIN QUERY PLAN`) | 9, 11 | index, query plan, cost | not written |
| 21 | Views | 9, 20 | view, query reuse | not written |
| 22 | Triggers (e.g. an automatic "last modified" column) | 2, 14 | trigger, event-driven SQL, side effect | not written |
| 23 | JSON Functions in SQLite | 2, 4 | JSON1 extension, semi-structured data in a relational column | not written |

### Slice 5 — Introducing an ORM
*Capabilities established:*
- *An ORM can replace hand-written data access without changing observable behavior (verified by the tests already written).*
- *Schema changes are versioned and repeatable.*

| # | Lesson | Prereqs | Concepts Introduced | Status |
|---|---|---|---|---|
| 24 | What an ORM Is and Isn't (EF Core, `DbContext`, mapping a table to a class) | 1–4, 8–9 | ORM, `DbContext`, change tracking, mapping | not written |
| 25 | Rewriting Your Queries Through EF Core (LINQ side-by-side with the raw ADO.NET from Slices 1–3, verified against the tests already written for the ADO.NET version) | 4, 14–15, 24 | LINQ, query translation, parity testing | not written |
| 26 | Schema Migrations & Versioning (`PRAGMA user_version`, then EF Core Migrations) | 2, 24–25 | `PRAGMA user_version`, migration, schema evolution | not written |

### Slice 6 — Multiple Users, One View
*Capabilities established:*
- *The application can read and combine data across multiple independent database files, including ones on a network share.*

| # | Lesson | Prereqs | Concepts Introduced | Status |
|---|---|---|---|---|
| 27 | Multiple Database Files (`ATTACH DATABASE`) | 9 | `ATTACH DATABASE`, cross-database query | not written |
| 28 | A Database on a Network Share (UNC paths, locking, WAL, `busy_timeout`) | 3, 27 | UNC path, file locking, WAL mode, `busy_timeout` | not written |
| 29 | Aggregating Many Users' Files Automatically | 27–28 | aggregation over files, error tolerance | not written |

### Slice 7 — Live
*Capabilities established:*
- *The application detects external file changes and reflects them live, in both UI surfaces, without freezing or reopening.*

| # | Lesson | Prereqs | Concepts Introduced | Status |
|---|---|---|---|---|
| 30 | Watching the Filesystem for Changes (`FileSystemWatcher`; includes diagnosing duplicate events and locked-file races) | 28 | `FileSystemWatcher`, event debouncing, race condition | not written |
| 31 | Doing That Without Freezing the GUI (`Task`, `async`/`await`, `Dispatcher`; includes diagnosing and fixing a real UI freeze/deadlock) | 19, 30 | `Task`, `async`/`await` (deepened), `Dispatcher`, deadlock | not written |
| 32 | Wiring Live Data Into Both UIs (WebView2 table via `ExecuteScriptAsync`, native list via `ObservableCollection`) | 7, 18, 29, 31 | `ObservableCollection`, live refresh, state synchronization | not written |

### Slice 8 — Bring In React
*Capabilities established:*
- *A WebView2 screen's presentation layer can be replaced (vanilla JS → React) without touching the bridge or the persistence layer underneath it.*

| # | Lesson | Prereqs | Concepts Introduced | Status |
|---|---|---|---|---|
| 33 | What React Buys You (rebuild the Slice 2 table as a React component) | 10–12 | component, JSX, state, virtual DOM (intro) | not written |
| 34 | Wiring React Into the Same Bridge (reusing the Slice 3 C#↔JS bridge to drive React state instead of DataTables redraws) | 18, 33 | React state ↔ host bridge, `useEffect` | not written |

### Slice 9 — Polish & Ship
*Capabilities established:*
- *The application can be packaged, distributed, and trusted (backups, integrity checks, reproducible builds) as a finished product.*

| # | Lesson | Prereqs | Concepts Introduced | Status |
|---|---|---|---|---|
| 35 | Window & App Lifecycle, Packaging (`dotnet publish`, WebView2 runtime distribution) | 5–6 | app lifecycle events, `dotnet publish`, WebView2 runtime distribution | not written |
| 36 | Backup, `VACUUM`, Integrity Checks, In-Memory DBs for Testing | 1–4 | `VACUUM`, `integrity_check`, in-memory DB, test isolation | not written |
| 37 | Final Integration & Review | all preceding | system review, acceptance review | not written |

## Concept recurrence (cross-cutting only)

Not every concept needs tracking here — the per-lesson columns above
already cover that. This is just the handful of ideas the whole
curriculum is deliberately structured to revisit at increasing depth:

| Concept | Introduced | Deepened |
|---|---|---|
| SQL | 1 | 2–4, 9, 14–15, 20–23 |
| C# types / domain modeling | 4 | 8, 16–19, 24–26 |
| XAML / WPF | 5 | 13, 16–17 |
| WebView2 bridge | 7 | 18, 32, 34 |
| `async`/`await` | 19 | 31 |
| ORM (EF Core) | 24 | 25–26 |
| Live/concurrent state | 27–28 | 30–32 |
| Presentation layer (JS) | 10–11 | 33–34 |

Lesson 2 is next.
