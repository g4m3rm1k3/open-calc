# Lesson 6.14: SQLite

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Two real scripts naming what has actually been true underneath every lesson in this entire phase: this project's own real database has always been SQLite specifically, not a generic stand-in. The first proves a real, distinctive SQLite behavior - a column declared `db.Integer` genuinely accepting, and storing, a non-numeric string, confirmed by SQLite's own real `typeof()` function - which turns out to be the real, underlying reason a much earlier, already-known finding in this project (`create_machine` accepting a non-numeric `axes` value) was ever possible at the database level at all. The second proves a real, single-writer limitation directly: a second, genuinely separate connection's own write is refused outright, `"database is locked"`, while a first connection's own write transaction is still open.

**What you need to know first:** This curriculum's own Why Databases Exist lesson - `backend/config.py`'s own real `SQLALCHEMY_DATABASE_URI`, already cited there, pointing at a real SQLite file; this curriculum's own Transactions lesson - what an open, uncommitted transaction is, and this curriculum's own Constraints lesson's own already-documented finding that `create_machine` accepts a non-numeric `axes` value with zero validation.

## Terms used in this lesson

- **SQLite (as a specific engine)** — A real, specific relational database engine - not a generic stand-in for "a database" - that runs embedded directly inside the same process as the application using it, storing an entire real database as one ordinary file (or, this curriculum's own real `TestingConfig`, entirely in memory), with no separate database server process involved at all. It exists as its own real, distinct thing from a client-server database (like PostgreSQL or MySQL) because embedding the engine directly removes an entire real layer - no server to install, configure, or connect to over a network - at the real cost of the specific limitations this lesson's own two units demonstrate directly.
- **type affinity** — SQLite's own real, specific rule for how strictly a column's declared type is actually enforced: a declared type is a strong preference for how a value SHOULD be stored, not a hard guarantee of what CAN be - a column declared `INTEGER` will genuinely accept, and store, a real value that is not numeric at all. It exists because SQLite's own real, documented type system was designed around flexibility rather than the strict type enforcement a client-server database more commonly provides for the identical declared column type - a real, specific SQLite behavior, not a general SQL guarantee.
- **single-writer concurrency** — SQLite's own real, specific limitation that only one real connection may hold an open write transaction against a given database at a time - a second, real, concurrent attempt to write is refused outright until the first one's own transaction ends, rather than both being allowed to proceed at once. It exists as a real, direct consequence of SQLite's own embedded, serverless design: with no separate server process to coordinate multiple real writers the way a client-server database's own server process can, SQLite instead locks the entire real database file for the duration of one real write transaction at a time.

## Objects and methods used

- **`typeof()`**
  - *What it is:* A real, built-in SQLite SQL function that returns the actual, real runtime type SQLite is storing for a given value - `'integer'`, `'text'`, `'real'`, `'null'`, or `'blob'` - regardless of what type the column holding it was declared with.
  - *Implementation:* `typeof(column_name)`, called inside a real `SELECT`, already fully treated in this curriculum's own SQL lesson - returns one of SQLite's own five real, named storage classes as a string.
  - *Its use:* This lesson's own Type Affinity unit uses it directly to prove, not merely assert, that a value stored in a column declared `db.Integer` is genuinely being stored as real text underneath, exactly as entered.
  - *Type:* A real, built-in SQLite SQL function.
  - *Responsibility:* Reporting the real, actual storage class SQLite is using for one specific value, as opposed to whatever type its own column was declared with.
  - *Depends on:* A real column reference inside a real SELECT statement.
  - *Connects to:* Called directly inside this lesson's own real `SELECT`, immediately after a real `UPDATE` deliberately stores a non-numeric string in an `INTEGER`-declared column.
  - *Shape:* Takes one value in, returns one of five real, named strings out.

## Concept Unit: This Was Always SQLite - What Every Earlier Lesson Actually Ran Against

### The Problem

`backend/config.py`'s own real `SQLALCHEMY_DATABASE_URI`, already cited in this curriculum's own Why Databases Exist lesson, has pointed at a real SQLite file - or, for `TestingConfig`, real in-memory SQLite - since Lesson 6.1. Every `EXPLAIN QUERY PLAN`, every `PRAGMA`, every real constraint this whole phase has studied has been a fact about THIS specific engine, not databases in the abstract. What, specifically, does this project's own real choice actually commit to?

Before reading on:

- `backend/config.py`'s own real `DevelopmentConfig`, `TestingConfig`, and `ProductionConfig` all point at SQLite - none of them ever names a separate database server at all. What does the ABSENCE of any server configuration - a host, a port, a username - already tell you about how this project's own real database actually runs?
- This curriculum's own Foreign Keys lesson found that SQLite does not enforce a declared `ForeignKey` without a real `PRAGMA`. Was that ever a fact about relational databases in general, or specifically about the one real engine this project actually uses?

### Project Change

- **Reference Source:** Real, verbatim, read this session, `backend/config.py:1-6,23-26,58-62`, already cited in full in this curriculum's own Why Databases Exist lesson - `DevelopmentConfig`, `TestingConfig`, and `ProductionConfig` all real, all pointing at SQLite, with `ProductionConfig`'s own comment reading plainly: "Can switch to PostgreSQL/MySQL by changing SQLALCHEMY_DATABASE_URI" - acknowledging a real alternative this project has never actually taken.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - this unit synthesizes real evidence already fully cited in this curriculum's own Why Databases Exist lesson; no new file is added.
- **Dependencies:** None beyond what this curriculum's own earlier lessons already established.

### CS Lens

This is **SQLite**, named here for the first time as its own, specific, real engine rather than "a database" in the abstract. Also recognized in: a mobile app's own local, on-device database, embedded directly in the app itself with no server anywhere; a web browser's own local storage engine, running inside the browser process; a desktop application's own local save-file format, structured and queryable rather than a plain document; and, in this project's own domain, every real `.db` file this entire curriculum's own labs have created and deleted under `verification/phase-06/`.

### SE Lens

The design principle behind choosing an embedded engine like SQLite is removing an entire real layer of operational complexity - no separate server to install, patch, or keep running - at the real cost of the specific limitations this lesson's own next two units demonstrate directly. The real alternative this project's own `ProductionConfig` explicitly names but has never actually taken - switching to PostgreSQL or MySQL for real production use - would trade that simplicity away in exchange for real concurrent-writer support and stricter real type enforcement, both studied directly in this lesson's own remaining units.

### Verification

This unit synthesizes real evidence already fully cited and quoted in this curriculum's own Why Databases Exist lesson - it makes no new behavioral claim requiring a fresh, separate run.

### Connection to the previous unit

This is the lesson's first unit - it names the real engine every earlier lesson in this phase has actually been running against; the next unit proves one of its own real, distinctive behaviors directly.

## Concept Unit: Type Affinity - Why a Non-Numeric axes Was Always Possible

### The Problem

This curriculum's own Constraints lesson already named a real, separate, already-known finding: `create_machine` accepts a non-numeric string for `Machine.axes` - a column declared `db.Integer` - with zero validation. That finding was about missing APPLICATION-level validation. Does SQLite's own real database engine, independent of the application entirely, actually enforce `axes` being a real number at all?

Before reading on:

- `Machine.axes` is declared `db.Column(db.Integer, default=3)`. If a real client-server database enforced column types strictly, a non-numeric value would be refused at the database level even if application code never checked it. Does SQLite refuse it too?
- SQLite's own real `typeof()` function reports the ACTUAL runtime type of a stored value. Before running the lab below: what would you expect it to report for a value that was declared `INTEGER` but was actually stored as a real string?

### Project Change

- **Reference Source:** Real, verbatim, read this session, `backend/app/models/machine.py:63`, already cited in this curriculum's own Why Databases Exist lesson: ``` axes = db.Column(db.Integer, default=3) ``` This unit proves directly, at the database level, why this column - and the already-documented `create_machine` finding naming it - was ever able to hold a non-numeric value at all, independent of anything the application does or does not validate.
- **Files affected:** `verification/phase-06/lab_sqlite_type_affinity.py` (new)
- **Change type:** add
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** This project's own real backend, and its already-installed `sqlalchemy`.

### The New Code

A real `Machine`, its own `axes` column directly overwritten with a non-numeric string, then read back with `typeof()`:

**File:** `verification/phase-06/lab_sqlite_type_affinity.py` (new)

```python
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "backend"))

from sqlalchemy import text

from app import create_app, db
from app.models.machine import Machine

app = create_app("testing")

with app.app_context():
    db.session.add(Machine(id="m1", name="Haas VF-2", category="mill", sub_type="3_axis", axes=3))
    db.session.commit()

    print("Machine.axes is declared db.Integer - storing a non-numeric string directly:")
    db.session.execute(text("UPDATE machines SET axes = 'not-a-number' WHERE id = 'm1'"))
    db.session.commit()

    row = list(db.session.execute(text("SELECT id, axes, typeof(axes) FROM machines WHERE id = 'm1'")))
    print(f"real stored value and its real runtime type: {row}")
```

### Mechanical Walkthrough

- `UPDATE machines SET axes = 'not-a-number' WHERE id = 'm1'` — A real `UPDATE`, already fully treated in this curriculum's own SQL lesson, deliberately storing a non-numeric string in a column declared `db.Integer` - if SQLite genuinely enforced that declaration, this statement itself should fail.
- `db.session.commit() (succeeds)` — Already fully treated in this curriculum's own Transactions lesson - succeeds without incident, the first real proof that nothing here was refused at all.
- `typeof(axes)` — Fully treated in this lesson's own Header - reports the REAL, actual storage class SQLite used for the value just written, independent of what `axes`'s own column declaration says.
- `the real result: ('m1', 'not-a-number', 'text')` — Confirms directly: the stored value is genuinely `'not-a-number'`, and SQLite's own `typeof()` reports its real storage class as `'text'` - not `'integer'`, despite the column's own declared type.

### CS Lens

This is **type affinity**, fully named in this lesson's own Header - SQLite's own real, specific choice to treat a declared column type as a preference, not an enforced guarantee. Also recognized in: a JavaScript variable accepting any real value regardless of what it held before, unlike a statically-typed language's own variable; a spreadsheet cell accepting text in a column formatted as "Number," displaying it unconverted; a loosely typed configuration file accepting a quoted string where a number was expected, without validating it; and, in this project's own domain, this exact real column - `Machine.axes`, already flagged in this curriculum's own Constraints lesson as accepting invalid application input, now shown to be permitted at the database level too.

### SE Lens

The design principle behind SQLite's own real type affinity is flexibility - a column's declared type guides storage without rigidly enforcing it, useful for a lightweight, embedded engine not built around strict schema enforcement as its primary job. The real alternative NOT chosen by SQLite itself - refusing a non-numeric value for an `INTEGER` column outright, the way a real client-server database more commonly would - would have caught this project's own already-known `axes` finding at the database level, regardless of whatever the application itself validates or fails to. The honest cost of the flexibility SQLite actually provides: this project's own real schema cannot rely on its declared column types alone to guarantee real data quality - only application-level validation, which this curriculum's own Constraints lesson already found missing for this exact column.

### Commands needed

- `backend\.venv\Scripts\python.exe verification\phase-06\lab_sqlite_type_affinity.py` — Run from the manufacturing-platform repository root, using this project's own real backend virtual environment.

### Verification

```text
Seeding default users...
Machine.axes is declared db.Integer - storing a non-numeric string directly:
real stored value and its real runtime type: [('m1', 'not-a-number', 'text')]
```

Full saved run: `verification/phase-06/lab_sqlite_type_affinity_output.txt`.

### Connection to the previous unit

The previous unit named SQLite as a specific, real engine; this unit proves one of its own real, distinctive behaviors, and connects it to an already-known finding from earlier in this curriculum. The final unit proves a second, equally real limitation.

## Concept Unit: Single-Writer Concurrency - A Real Ceiling on Top of This Project's Own

### The Problem

This curriculum's own Why Databases Exist lesson already showed two real threads racing over a shared Python dict, with no database involved at all. If two genuinely SEPARATE real connections both tried to WRITE to the identical real SQLite database file at the same time, does SQLite itself add any real limitation of its own, on top of whatever the application already does or does not coordinate?

Before reading on:

- If one real connection has an open, uncommitted write transaction against a real SQLite file, and a second, separate connection tries to write to the SAME file before the first one commits, what would you expect SQLite itself to do?
- Does this real limitation, if it exists, depend on the application's own code coordinating anything at all - or is it something SQLite itself enforces regardless?

### Project Change

- **Reference Source:** No real project file changes - this unit demonstrates a real, general limitation of SQLite itself, using two genuinely separate real `sqlite3` connections to a shared, real, temporary file - the identical real engine this project's own `config.py` already uses for real, per this curriculum's own Why Databases Exist and SQLite (this lesson's own first) units.
- **Files affected:** `verification/phase-06/lab_sqlite_single_writer.py` (new)
- **Change type:** add
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** None beyond Python's own standard library (`sqlite3`).

### The New Code

Two real, separate `sqlite3` connections to the identical real file - one holds an open write transaction while the other tries to write too:

**File:** `verification/phase-06/lab_sqlite_single_writer.py` (new)

```python
import os
import sqlite3
from pathlib import Path

DB_PATH = str(Path(__file__).resolve().parent / "lock_demo.db")
if os.path.exists(DB_PATH):
    os.remove(DB_PATH)

connection_a = sqlite3.connect(DB_PATH, timeout=0.5)
connection_a.execute("CREATE TABLE t (id INTEGER)")
connection_a.commit()

connection_b = sqlite3.connect(DB_PATH, timeout=0.5)

connection_a.execute("BEGIN IMMEDIATE")
connection_a.execute("INSERT INTO t VALUES (1)")
print("connection A holds a real, open write transaction (not committed yet)")

try:
    connection_b.execute("INSERT INTO t VALUES (2)")
    connection_b.commit()
    print("connection B wrote fine too - no lock")
except sqlite3.OperationalError as e:
    print(f"connection B's own real write was refused: {e}")

connection_a.commit()
print("connection A commits - the lock is released")

connection_b.execute("INSERT INTO t VALUES (2)")
connection_b.commit()
print("connection B's identical write now succeeds")

connection_a.close()
connection_b.close()
os.remove(DB_PATH)
```

### Mechanical Walkthrough

- `sqlite3.connect(DB_PATH, timeout=0.5) (both connections)` — Python's own standard-library `sqlite3` module (basic Python, already available without installing anything), opening two genuinely separate real connections to the IDENTICAL real file; `timeout=0.5` bounds how long each connection waits for a lock before giving up, rather than waiting forever.
- `connection_a.execute("BEGIN IMMEDIATE")` — A real SQLite statement, already established as basic real SQL usage in this curriculum's own SQL lesson, explicitly starting a real write transaction and acquiring SQLite's own real write lock immediately, rather than waiting until the first actual write.
- `connection_b.execute("INSERT INTO t VALUES (2)") (raises)` — A second, real, genuinely separate connection attempting to write to the SAME real file while connection A's own transaction is still open - SQLite itself, not any application code, refuses this.
- `except sqlite3.OperationalError as e: ...` — A real, standard-library exception, distinct from the real SQLAlchemy `IntegrityError` this curriculum has used elsewhere - `"database is locked"` is SQLite's own real, literal message for exactly this situation.
- `connection_a.commit() / connection_b.execute(...) (succeeds)` — Once connection A's own transaction actually ends, the IDENTICAL write from connection B, retried, succeeds - proof this is genuinely about the transaction being open, not about connection B being broken in some other way.

### Mental Model

```text
connection A                       connection B
-------------                       -------------
BEGIN IMMEDIATE
INSERT INTO t VALUES (1)
(transaction still open,
 real write lock held)
                                    INSERT INTO t VALUES (2)
                                    -> OperationalError:
                                       "database is locked"
commit()
(real write lock released)
                                    INSERT INTO t VALUES (2)
                                    -> succeeds

SQLite allows only one real, open write transaction against a
given database at a time - a second one waits, or is refused,
regardless of what either connection's own application code
does to coordinate.
```

### CS Lens

This is **single-writer concurrency**, fully named in this lesson's own Header - a real, engine-level constraint layered on top of whatever the application itself does or does not coordinate. Also recognized in: a single-user desktop file locked by whichever program opened it for editing first, refusing a second program's own attempt to save; a printer accepting only one real print job at a time, queuing or refusing the rest; a single-threaded event loop processing one real task fully before starting the next; and, in this project's own domain, this curriculum's own Why Databases Exist lesson's own real concurrency lab - two operators racing over a shared value with NOTHING coordinating them - now layered under a real, additional guarantee SQLite itself provides for actual writes, regardless of whether the application coordinates anything at all.

### SE Lens

The design principle is that SQLite's own embedded, serverless design - already named in this lesson's own first unit - has no separate server process to coordinate multiple simultaneous real writers, so it enforces safety the only way it can: by refusing a second real writer outright rather than risking real corruption. The real alternative NOT chosen by this project - a real client-server database, supporting many simultaneous real writers - is exactly what `backend/config.py`'s own real comment already names as available but unused. The honest cost of this project's own real, current choice: every real, concurrent write this application ever needs to make competes for the SAME single real write lock, a genuine, real ceiling this curriculum's own earlier Concurrency unit's own operator-claiming race never had to contend with at all, since it never touched a real database file.

### Commands needed

- `python verification/phase-06/lab_sqlite_single_writer.py` — Runs the lab from the manufacturing-platform repository root; no flags needed - uses only Python's own standard library. Creates and removes a real, temporary file database under `verification/phase-06/` for the duration of the run.

### Verification

```text
connection A holds a real, open write transaction (not committed yet)
connection B's own real write was refused: database is locked
connection A commits - the lock is released
connection B's identical write now succeeds
```

Full saved run: `verification/phase-06/lab_sqlite_single_writer_output.txt`.

### Connection to the previous unit

The previous unit proved a real SQLite-specific data behavior; this unit closes the lesson, and this phase, with a real SQLite-specific concurrency limitation - the last of this project's own real, current database engine's own particular properties this phase set out to study.

## Connect the pieces

Follow this project's own real database engine, SQLite, through every unit, and back through this entire phase. `backend/config.py` named it plainly from Lesson 6.1 onward - a real, embedded, file- based engine, never a separate server, used identically for development, testing, and (per its own comment) production too. That real choice is exactly why `Machine.axes`, declared `db.Integer`, could genuinely store the non-numeric string `'not-a-number'`, confirmed by SQLite's own real `typeof()` reporting `'text'` - not a missing check in this project's own code, this lesson's own second unit shows, but a real property of the specific engine underneath it, already flagged as a separate finding in this curriculum's own Constraints lesson. And that same embedded, serverless design is exactly why a second, real, separate connection's own write was refused outright - `"database is locked"` - while a first connection's own transaction stayed open, a real ceiling on concurrent writes that has nothing to do with whatever the application itself coordinates, and everything to do with which real engine this project chose.

**Next lesson:** Phase 6 is complete - every real term this phase set out to teach, from why a database exists at all to the real, particular engine this project actually runs, has now been shown directly against this project's own real code, real schema, and real data, not invented from scratch. Next, this curriculum turns to the real tool that has been generating every one of this phase's own SQL statements underneath a Python object all along: SQLAlchemy itself, studied as its own real subject rather than a means to an end.