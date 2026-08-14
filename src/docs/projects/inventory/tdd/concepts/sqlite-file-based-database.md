# Concept: SQLite — a Real, File-Based Database

**What you'll understand by the end:** how to connect to a real, embedded SQL database with no separate server process, and read rows back in a convenient, dict-like form.

**Prerequisites:** none.

## Setup

Python 3 — `sqlite3` ships in the standard library, no install needed:
```
python3 -c "import sqlite3; print(sqlite3.sqlite_version)"
```

## The Problem

Most real databases (PostgreSQL, MySQL) run as a separate, always-on server process that a program connects to over a network — real, correct infrastructure for a production system with many concurrent clients, but genuine setup overhead (installing, configuring, and running a whole separate service) for a project that just needs real, durable storage without that complexity.

## The Isolated Example

```python
import sqlite3

connection = sqlite3.connect("example.db")
connection.row_factory = sqlite3.Row

connection.execute("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, text TEXT)")
connection.execute("INSERT INTO notes (text) VALUES (?)", ("hello",))
connection.commit()

row = connection.execute("SELECT * FROM notes WHERE id = 1").fetchone()
print(row["id"], row["text"])
print(dict(row))
connection.close()
```

**Real output:**
```
1 hello
{'id': 1, 'text': 'hello'}
```

**What this proves:** no separate database server was started anywhere — `sqlite3.connect("example.db")` created a real, ordinary file on disk (inspectable directly, e.g. with a `file example.db` shell command showing "SQLite 3.x database"), and the entire database lived inside it. `row["text"]` worked by *name*, not just position, because `row_factory` was set — without it, the same access would need `row[1]` instead.

## Mechanical Walkthrough

- `sqlite3.connect(path)` opens (creating, if it doesn't already exist) a single, ordinary file at `path` — the *entire* database (every table, every row) lives inside this one file; copying the file *is* copying the whole database.
- `sqlite3.connect(":memory:")` is a special case: an entirely in-memory database, never written to disk, useful for disposable, temporary work (tests, quick experiments) that shouldn't leave anything behind.
- `connection.row_factory = sqlite3.Row` changes how fetched rows behave: by default, a row is a plain tuple (`row[0]`, `row[1]`, positional only); with `sqlite3.Row`, a row supports **both** positional access and name-based access (`row["text"]`), and critically, `dict(row)` — converting a row directly into a plain Python dict, matching whatever shape the rest of an application already expects to work with.
- A connection should be explicitly `.close()`d once done with it — SQLite (like most database drivers) holds real resources (an open file handle, internal locks) for the duration of an open connection.

## CS Lens

SQLite is an **embedded database** — the database engine runs *inside* the same process as the application using it (linked in as a library, not a separate service reached over a network), as opposed to a **client-server database** (PostgreSQL, MySQL), where an application is a network client of a separately-running database process. This is a real, deliberate architectural choice with genuine tradeoffs, not simply "a smaller version" of a client-server database.

Also recognized in: browsers' own built-in storage (IndexedDB, and historically WebSQL, both embedded within the browser process itself), mobile apps' near-universal use of SQLite for local, on-device storage, and any application shipping its own bundled data file rather than depending on a separately-run service.

## SE Lens

SQLite's real, honest tradeoff: zero setup and zero separate infrastructure to run or deploy, at the cost of weaker support for many concurrent *writers* at once (multiple separate processes/threads writing to the same file simultaneously is a real, known limitation) — entirely appropriate for a single-server application, a desktop app, or a project's early stages, and a real, deliberate reason many real, larger systems migrate to a client-server database specifically once concurrent write load grows past what a single file can comfortably support. Choosing SQLite isn't "not a real database" — it's choosing the right tool for a specific, honestly-assessed scale.

## Connection

Directly enables `sql-create-table-and-schema.md`, `sql-insert-select-where.md`, and `sql-parameterized-queries-injection.md` — all of standard SQL works identically against SQLite as against any other relational database; only the connection/deployment model shown here is SQLite-specific.

## Try It Yourself

1. Open the same `.db` file from two separate Python processes (two terminal windows) and read from both — confirm reads work fine from multiple simultaneous connections, then research SQLite's own real documentation on concurrent *write* behavior to understand the specific limitation this file's SE Lens names.
2. Delete the row-factory line entirely and re-run the example — confirm `row["text"]` now raises a real error, while `row[1]` still works, direct proof of what `sqlite3.Row` actually changes.
3. Use a real file inspection tool (or Python's own `sqlite3` command-line shell, `sqlite3 example.db`) to open the database file created above directly, outside of your Python script, and run `SELECT * FROM notes;` — confirming the data really is durable, plain, inspectable file content, not something only your original script can read.
