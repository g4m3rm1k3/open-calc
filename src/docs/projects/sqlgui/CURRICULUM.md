# ToolDB Project — Curriculum (Slice-Based)

## Why slices, not phases

The earlier version of this roadmap taught all of SQLite, then all of
pywebview, then all of the frontend. That's thorough, but you'd type
code for 16 lessons before a window ever opens. This version instead
builds in **slices** — each one adds a small, real capability across
whatever layers it touches (database, Python, GUI, frontend), and ends
with the app visibly doing one more true thing than it did before. Depth
topics (indexes, triggers, JSON functions, an ORM, migrations) aren't
skipped — they come back around in later slices, once there's a real
app to apply them to instead of a toy table.

Each lesson file still follows the full `LessonContract` schema.
Prerequisites are still respected — nothing is used before it's taught;
slices just interleave *which* subject gets the next lesson.

## How this project is organized

- One project folder, edited in place — same rule as before.
- Lessons live in `lessons/`, numbered in the order you'll actually do
  them (the number is the slice order, not the old subject order).
- Every lesson still ends in a git commit.

## Roadmap

### Slice 1 — One Tool, One Window
*Goal: a pywebview window opens and shows one real row, read from a real
SQLite file.*

| # | Lesson | Status |
|---|---|---|
| 1 | Connecting to a Database File | ✅ written |
| 2 | Schema Design (`CREATE TABLE`, type affinity, `PRIMARY KEY`) | not written |
| 3 | Inserting Safely (parameterized queries) | not written |
| 4 | Querying Back (`SELECT`, `fetchone`/`fetchall`, row factories) | not written |
| 5 | pywebview Basics (opening a window, loading local HTML) | not written |
| 6 | Passing Python Data to HTML (the `js_api` bridge, first real data on screen) | not written |

### Slice 2 — A Table You Can Actually Use
*Goal: a styled, sortable, searchable table of every tool, not one row.*

| # | Lesson | Status |
|---|---|---|
| 7 | Dataclasses (modeling a `Tool` as a real type instead of a raw tuple) | not written |
| 8 | Multiple Tables & `JOIN` (adding categories/vendors, foreign keys) | not written |
| 9 | jQuery Basics (selectors, events) | not written |
| 10 | DataTables Fundamentals (rendering the full tool list) | not written |
| 11 | Styling & Layout (an interface that doesn't look like a default HTML page) | not written |

### Slice 3 — Editing Safely
*Goal: add/edit/delete a tool from the GUI itself, correctly.*

| # | Lesson | Status |
|---|---|---|
| 12 | Updating and Deleting Safely (transactions, `rollback`) | not written |
| 13 | Constraints & Data Integrity (`CHECK`, `UNIQUE`, `NOT NULL`, `PRAGMA foreign_keys`) | not written |
| 14 | Two-Way Communication (exposing Python functions to JS, `evaluate_js`) | not written |
| 15 | UI/UX for Async State (loading / empty / error states — fixes your original hang, at the root) | not written |

### Slice 4 — Going Deeper on Data
*Goal: the schema itself gets smarter — faster, safer, more expressive.*

| # | Lesson | Status |
|---|---|---|
| 16 | Indexes & Query Planning (`EXPLAIN QUERY PLAN`) | not written |
| 17 | Views | not written |
| 18 | Triggers (e.g. an automatic "last modified" column) | not written |
| 19 | JSON Functions in SQLite | not written |

### Slice 5 — Introducing an ORM
*Goal: understand what an ORM buys you, by refactoring code you already
wrote by hand.*

| # | Lesson | Status |
|---|---|---|
| 20 | What an ORM Is and Isn't (SQLAlchemy Core vs. ORM, mapping a table to a class) | not written |
| 21 | Rewriting Your Queries Through the ORM (side-by-side with the raw SQL from Slices 1–3) | not written |
| 22 | Schema Migrations & Versioning (`PRAGMA user_version`, then Alembic) | not written |

### Slice 6 — Multiple Users, One View
*Goal: the actual point of this project — everyone's file, joined.*

| # | Lesson | Status |
|---|---|---|
| 23 | Multiple Database Files (`ATTACH DATABASE`) | not written |
| 24 | A Database on a Network Share (UNC paths, locking, WAL, `busy_timeout`) | not written |
| 25 | Aggregating Many Users' Files Automatically | not written |

### Slice 7 — Live
*Goal: the view updates itself the moment anyone's file changes — no
reopen, no hang.*

| # | Lesson | Status |
|---|---|---|
| 26 | Watching the Filesystem for Changes | not written |
| 27 | Doing That Without Freezing the GUI (threads, queues) | not written |
| 28 | Wiring Live Data Into the GUI (DataTables redraws in place, no reload) | not written |

### Slice 8 — Polish & Ship
*Goal: a finished, packaged, trustworthy app.*

| # | Lesson | Status |
|---|---|---|
| 29 | Window & App Lifecycle, Packaging (PyInstaller) | not written |
| 30 | Backup, `VACUUM`, Integrity Checks, In-Memory DBs for Testing | not written |
| 31 | Final Integration & Review | not written |

Lesson 1 doesn't move. Lesson 2 is next, same as before — the slice
restructure changes what comes *after* Slice 1's first working window,
not the ground floor.
