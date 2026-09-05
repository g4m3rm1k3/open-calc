# Lesson M3.0: One Connection, Shared by Every Component

*File paths under mastercam-app/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder. All code in this lesson is added to verification/mastercam-app-copy/mastercam-app/ only - never to the real mastercam-app/, per this phase's own rule: the real app is yours to type into once you understand a piece, not somewhere Claude writes to.*

**What you will build:** Nothing new yet - this lesson is orientation. You'll read the real, already-existing database layer (mastercam_app/db/) closely enough to predict its behavior before touching it, and pick up the basic SQL vocabulary this whole phase leans on, taught directly against the real schema instead of a generic textbook example.

**What you need to know first:** What a dataclass is and how a real XML file becomes one (Phase M1). No SQL knowledge assumed beyond having seen a SELECT statement before.

## Terms used in this lesson

- **Table** — A named, fixed-shape collection of rows - each row has the same columns. `tas` is a table; each row in it is one tool assembly.
- **PRIMARY KEY** — The column (or columns) that uniquely identifies a row - no two rows can share one, and SQLite uses it to look rows up fast. Not decorative: it's what makes "the row for TA0042" a well-defined question.
- **FOREIGN KEY** — A column whose value is required to match a PRIMARY KEY in another table - a real, enforced link between two tables, not just a naming convention. SQLite only enforces this when `PRAGMA foreign_keys=ON` has actually been run on that connection.
- **INDEX** — A separate, maintained lookup structure over one or more columns, built so a query filtering on those columns doesn't have to scan every row. A table works without one; the query is just slower.
- **Upsert (ON CONFLICT ... DO UPDATE)** — One statement that inserts a new row, or updates an existing row if the primary key already exists - avoiding a separate "does this already exist?" check before every write.

## Objects and methods used

- **`Database`**
  - *What it is:* A thin wrapper class around one sqlite3 connection
  - *Implementation:* mastercam_app/db/database.py:111
  - *Its use:* Every real read/write to mastercam.db goes through an instance of this
  - *Type:* class
  - *Responsibility:* Own the schema, and expose one method per real query/write the app needs
  - *Depends on:* sqlite3, mastercam_app/db/balloons.py
  - *Connects to:* get_db() in connection.py, which owns the one real instance
  - *Shape:* one connection, many narrow public methods

- **`get_db`**
  - *What it is:* The function every UI component calls to get the database
  - *Implementation:* mastercam_app/db/connection.py:157
  - *Its use:* Returns the same Database instance every time, opening it only once
  - *Type:* function
  - *Responsibility:* Guarantee there is exactly one open connection for the whole app's lifetime
  - *Depends on:* _open_db(), a module-level global
  - *Connects to:* Database.__init__
  - *Shape:* lazy singleton

## Concept Unit: The Database Is Opened Once, Not Once Per Query

### The Problem

If every part of the UI that needs data opened its own sqlite3.connect(), you'd have dozens of open connections to the same file, no shared cache, and no single place to reason about the connection's PRAGMAs (WAL mode, foreign keys). Something has to own exactly one connection and hand it out.

Before reading on:

- If get_db() is called from three different windows in the UI, how many real sqlite3 connections actually get opened?
- What real problem would you have if the answer were 'three' instead of 'one'?

### Project Change

- **Reference Source:** mastercam_app/db/connection.py:157-167 (get_db), quoted verbatim:
def get_db() -> Optional[Database]:
    global _DB, _DB_ERROR
    if _DB is not None:
        return _DB
    try:
        _DB = _open_db()
        _DB_ERROR = None
    except Exception as e:
        _DB_ERROR = str(e)
        _DB = None
    return _DB
- **Files affected:** `mastercam-app/mastercam_app/db/connection.py` (existing)
- **Change type:** none
- **Location:** module level, connection.py
- **Dependencies:** none - reading only, this unit adds no code

### Mechanical Walkthrough

- `global _DB, _DB_ERROR` — Without this, assigning to _DB inside the function would create a new *local* variable named _DB instead of changing the module-level one - the cache would never actually take effect, and get_db() would silently reopen the database every single call. This line is the entire reason the caching works at all.
- `if _DB is not None: return _DB` — The whole singleton guarantee is this one check. First call: _DB is None, so it falls through and opens a real connection. Every call after that: _DB is already set, so it returns immediately without touching sqlite3 again.
- `except Exception as e: _DB_ERROR = str(e); _DB = None` — A failed open doesn't raise up into the caller and crash the UI - it's recorded as a string the UI can display, and _DB stays None so the *next* call to get_db() will try to open again instead of being stuck on a failure forever.

### Mental Model

```text
First call to get_db():
  _DB is None  -->  _open_db() runs for real  -->  _DB = the real Database
  returns the real Database

Every call after that:
  _DB is not None  -->  return _DB immediately
  (sqlite3.connect is never called again)
```

### CS Lens

This is the **singleton pattern** - exactly one instance of something, created lazily on first use and reused after that. It shows up anywhere opening the real resource is expensive or must be shared: a database connection here, but the same shape appears for a logging handler, a thread pool, or a hardware device handle.

### SE Lens

The real alternative is dependency injection - create the Database once in main() and pass it explicitly to every window that needs it. That's more testable (no hidden global state, an isolated test can pass in its own instance) but means threading a `db` parameter through every constructor in the UI. This codebase chose the global-singleton shape instead - simpler call sites, at the real cost of hidden coupling: any code, anywhere, can call get_db() and you can't see that dependency from a function's signature.

### Commands needed

- `python -c "from mastercam_app.db.database import Database; db = Database(':memory:'); print(type(db._conn))"` — Confirms Database wraps a real sqlite3.Connection, run in isolation with no real file involved

### Verification

```text
<class 'sqlite3.Connection'>
```

Full saved run: `verification/mastercam-phase-03/lab_database_wraps_sqlite3_connection_output.txt`.

### Connection to the previous unit

Phase M1 tested Part/Sequence/Operation - real Python objects built from parsed XML. This phase starts on what those objects turn into once they're saved: real rows, in a real, shared database.

## Concept Unit: Reading the Real Schema Teaches the SQL Vocabulary

### The Problem

You know basic SQL, but "basic" and "read this real, 250-line CREATE TABLE script correctly" are different skills. Before writing a single test against this database, you need to be able to read its actual schema and say what each real constraint means.

Before reading on:

- In the tas table below, what real column is the PRIMARY KEY, and what does that guarantee about ta_number that no other column has?
- ta_parts has a FOREIGN KEY on ta_number pointing at tas.ta_number - what real row would SQLite refuse to insert into ta_parts, and why?

### Project Change

- **Reference Source:** mastercam_app/db/database.py:132-163 (Database._create_schema, first two tables), quoted verbatim:
CREATE TABLE IF NOT EXISTS parts (
    partnumber   TEXT PRIMARY KEY,
    rev          TEXT,
    description  TEXT,
    programnumber TEXT,
    programmer   TEXT,
    machine      TEXT,
    uploaded_at  TEXT
);
CREATE TABLE IF NOT EXISTS tas (
    ta_number    TEXT PRIMARY KEY,
    holder_name  TEXT,
    holder_catalog TEXT,
    holder_manufacturer TEXT,
    tool_code    TEXT,
    tool_comment TEXT,
    tool_diameter TEXT,
    tool_type    TEXT,
    tool_oal     TEXT,
    tool_flutes  TEXT,
    stick_out    TEXT,
    first_seen   TEXT,
    last_seen    TEXT
);
-- fingerprint index for fast duplicate detection CREATE INDEX IF NOT EXISTS idx_tas_fingerprint
    ON tas (holder_name, tool_code, stick_out);
- **Files affected:** `mastercam-app/mastercam_app/db/database.py` (existing)
- **Change type:** none
- **Location:** Database._create_schema
- **Dependencies:** none - reading only, this unit adds no code

### Mechanical Walkthrough

- `partnumber TEXT PRIMARY KEY` — partnumber is the whole identity of a row in parts - two rows can never share one, and SQLite will reject a second INSERT with the same partnumber unless it's an explicit upsert (the next lesson covers save_part's ON CONFLICT clause that relies on exactly this).
- `CREATE INDEX IF NOT EXISTS idx_tas_fingerprint ON tas (holder_name, tool_code, stick_out)` — This index doesn't change what queries are *allowed* - a query filtering on holder_name/tool_code/stick_out would still work without it. It changes how fast: without it, checking whether a fingerprint already exists means scanning every row in tas; with it, SQLite can jump straight to matching rows. This one exists specifically because that fingerprint check happens on every real save (Lesson M3.3).

### CS Lens

An index is the same idea as a book's index versus reading every page to find a topic - a small, separately-maintained structure that trades write cost (every insert must also update the index) for read speed. This tradeoff - build once, benefit on every future lookup - is the same shape as memoization or a hash table's internal bucket structure.

### SE Lens

The real alternative to a real, enforced PRIMARY KEY/FOREIGN KEY is "just be careful in application code" - trust that every INSERT already checked for duplicates and valid references by hand. The real cost of the enforced version: SQLite will raise a real exception the moment code tries to violate it, which means bugs surface immediately at the write, not later as silently corrupted data discovered during some unrelated query.

### Commands needed

- `python -c "from mastercam_app.db.database import Database; db = Database(':memory:'); print([r['name'] for r in db._conn.execute(\"SELECT name FROM sqlite_master WHERE type='table' ORDER BY name\")])"` — Lists every real table this schema actually creates, run against an in-memory database so no real file is touched

### Verification

```text
['balloon_changes', 'balloons', 'parsed_parts', 'part_changes', 'part_edits', 'part_versions', 'parts', 'pdf_paths', 'sqlite_sequence', 'ta_changes', 'ta_parts', 'tas']
```

Full saved run: `verification/mastercam-phase-03/lab_real_table_list_output.txt`.

### Connection to the previous unit

The singleton from the unit above hands out one Database instance; this unit is what that instance's schema actually looks like - twelve real tables, two of them (balloons, balloon_changes) owned by a second migration this phase gets to later.

## Connect the pieces

Trace ta_number "TA0042" through both units: get_db() would hand you the one real Database instance holding it; inside that instance, tas.ta_number PRIMARY KEY is what guarantees "TA0042" identifies exactly one row, and idx_tas_fingerprint is what makes checking whether some (holder, code, stickout) combination already resolves to it fast instead of a full table scan.

**Next lesson:** Next: writing the first real, permanent tests against this schema - starting with save_part, the method that turns a parsed XML part into real rows.