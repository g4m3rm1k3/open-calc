# Python Tool Database — LAB 64 — SQLite in a Multi-User Environment

**Prerequisites:** Lab 49 (Alembic migrations). Lab 52 (ToolService with session injection). You can run migrations and inject database sessions. This lesson covers what happens when two processes touch the same SQLite file at the same time.

**What this lab adds:**
- The `SQLITE_BUSY` error — what it is and when it appears
- WAL mode (`PRAGMA journal_mode=WAL`) — how it changes the locking model
- `timeout` on `connect()` — how long to wait before giving up
- A `DatabaseManager` that enables WAL on every new connection
- The honest comparison: when SQLite is enough and when it is not

**Time:** 40–50 minutes

---

## What You Will Build

A `DatabaseManager` class that opens connections with WAL mode and a configurable retry timeout. The demo script shows the difference between a plain connection and a managed one when a lock collision occurs:

```
# Without DatabaseManager — plain connect():
OperationalError: database is locked

# With DatabaseManager — WAL + timeout:
Connected. Proceeding.
```

---

> **Quick Check — try to answer before reading:**
>
> 1. SQLite uses a file on disk. Two Python scripts open the same file and both call `UPDATE tools SET ...` at the same time. What happens to the second one?
> 2. WAL stands for Write-Ahead Log. A "log" in a database context is not a debug log — it is a data structure. What problem does writing to a log first (before the main file) solve?
> 3. PostgreSQL handles dozens of concurrent writers. SQLite handles one. Name one reason you would still choose SQLite over PostgreSQL for a tool database used by a shop floor of 10 people.
>
> *(Answers at the end of this lab)*

---

## The Problem — See It Break First

Before learning the fix, reproduce the failure. Open two terminal windows. Run this script in **both at the same time** (run the first, immediately run the second):

```python
# lock_demo.py
import sqlite3
import time

conn = sqlite3.connect("tooldb.sqlite3")    # open the shared database
conn.execute("BEGIN EXCLUSIVE")             # hold an exclusive lock — blocks all other writers
print("Lock acquired. Holding for 5 seconds...")
time.sleep(5)
conn.execute("COMMIT")
print("Done.")
```

The first terminal prints "Lock acquired." The second terminal prints nothing for 5 seconds, then:

```
OperationalError: database is locked
```

**Why this happens:** SQLite's default locking mode is journal mode. A writer acquires an exclusive lock on the entire database file. While that lock is held, every other connection — whether reading or writing — gets `SQLITE_BUSY` (which Python surfaces as `OperationalError: database is locked`). The second connection had zero tolerance — it tried once, got BUSY, and raised immediately.

This is not a bug in your code. It is SQLite behaving exactly as designed — it was built for embedded, single-process access. When two processes share a file, you need to explicitly configure for that case.

---

## Concept: WAL Mode (Write-Ahead Logging)

**What it is:** An alternative journal mode for SQLite where writes go to a separate log file first, instead of modifying the main database file in place.

**The problem before:** In the default journal mode (DELETE mode), a writer locks the entire database file exclusively. No readers can proceed while a write is in progress. For a tool database opened by a PySide6 app and a watcher process simultaneously, this produces `database is locked` errors constantly.

**The solution:** WAL mode separates writing from reading. Writers append to a write-ahead log (a `.wal` file next to your `.sqlite3` file). Readers read from the main database file — which is never modified mid-transaction. At some point (a "checkpoint"), the WAL file's contents are merged back into the main database. During that merge, reads still proceed from the old main file.

The result: **writers and readers no longer block each other**. Multiple readers always work simultaneously. One writer can work at the same time as any number of readers. The only constraint that remains: only one writer at a time.

**What it hides:** The mechanics of the WAL file itself, checkpoint timing, and the shared-memory file (`.shm`) that SQLite uses to coordinate processes. You enable WAL with one PRAGMA; SQLite manages everything else.

**The protected invariant:** After `PRAGMA journal_mode=WAL`, any read transaction is guaranteed to see a consistent snapshot of the database — even while a write transaction is in progress. Reads never block on writes.

**Smallest possible example:**

```python
import sqlite3

conn = sqlite3.connect("mydb.sqlite3")
conn.execute("PRAGMA journal_mode=WAL")   # ← one line — switches the mode
# From this point: readers and the writer no longer block each other
```

After running this once, the mode is **persisted in the database file itself**. You do not need to run it every time — but running it every time is harmless, so making it part of your connection setup is safe and explicit.

**You will see this again in:** Every SQLite deployment with more than one concurrent reader or writer. SQLAlchemy supports WAL via `connect_args={"timeout": 30}` and event hooks. Django's SQLite backend enables WAL in its test runner. SQLite documentation calls WAL the recommended mode for all new applications as of SQLite 3.7.0.

**Watch for:** WAL creates two extra files: `mydb.sqlite3-wal` and `mydb.sqlite3-shm`. Include both in your `.gitignore`. Never delete the `.wal` file while a connection is open — it contains uncommitted transactions.

---

## Concept: Connection Timeout

**What it is:** A parameter on `sqlite3.connect()` that tells SQLite how many seconds to keep retrying a locked resource before raising `OperationalError`.

**The problem before:** The default timeout is `5.0` seconds (Python's sqlite3 module). But the default behavior after exhausting the timeout is still to raise `OperationalError`. If you never set it explicitly, you are relying on an implicit value and have no visibility into it.

**The solution:**

```python
conn = sqlite3.connect("tooldb.sqlite3", timeout=30)
# SQLite will retry for up to 30 seconds when it hits SQLITE_BUSY
# before raising OperationalError
```

Setting `timeout=30` means: if the database is locked, retry silently for up to 30 seconds. For a short write (updating tool data), 30 seconds is far more than enough for a concurrent writer to finish.

**What it hides:** The retry loop — SQLite internally sleeps for increasing intervals and re-attempts the operation on your behalf. You do not write any retry logic yourself.

**Watch for:** `timeout` only helps with `SQLITE_BUSY` (another writer is active). It does not help with `SQLITE_LOCKED` (the same connection is in a conflicting state). Those are different error codes with different causes.

---

## Step 1 — Reproduce and Measure the Default Timeout

First, see the default behavior:

```python
# timeout_demo.py
import sqlite3
import time

# Open a connection and hold an exclusive lock for 8 seconds
def hold_lock(seconds=8):
    conn = sqlite3.connect("tooldb.sqlite3")
    conn.execute("BEGIN EXCLUSIVE")
    print(f"Lock held for {seconds}s...")
    time.sleep(seconds)
    conn.commit()
    conn.close()

# This is the "second process" — open with default timeout (5 seconds)
hold_lock(8)   # simulate a slow writer
```

Run `hold_lock(8)` in one terminal, then immediately run this in a second terminal:

```python
import sqlite3
import time

start = time.time()
try:
    conn = sqlite3.connect("tooldb.sqlite3")  # default timeout = 5 seconds
    conn.execute("SELECT 1")
    print("Success")
except Exception as error:
    elapsed = time.time() - start
    print(f"Failed after {elapsed:.1f}s: {error}")
```

### SAVE AND TRY

Run the lock holder in terminal 1. Immediately run the second script in terminal 2.

**You should see** in terminal 2:
```
Failed after 5.0s: database is locked
```

The second script waited exactly 5 seconds (the default timeout), then gave up.

**Change something:** Change `sqlite3.connect("tooldb.sqlite3")` to `sqlite3.connect("tooldb.sqlite3", timeout=15)` in terminal 2, and change `hold_lock(8)` to `hold_lock(3)` in terminal 1. Now the lock is released in 3 seconds and the second connection has a 15-second budget. You should see `Success` instead of an error. Change both back.

---

## Step 2 — The DatabaseManager Class

Now combine WAL mode and a timeout into a single place. Create `tooldb/db/database_manager.py`:

```python
import sqlite3
from pathlib import Path
```

`sqlite3` is Python's built-in SQLite library — no installation needed. `Path` is from Lab 60 — it lets us validate the directory before trying to open the file.

```python
class DatabaseManager:
    """
    Opens SQLite connections with WAL mode and a configurable busy timeout.
    WAL mode: readers never block writers; writers never block readers.
    timeout: how long to retry (seconds) when another process holds a write lock.
    """

    DEFAULT_TIMEOUT = 30    # seconds — enough for any realistic tool import

    def __init__(self, db_path: str | Path, timeout: int = DEFAULT_TIMEOUT):
        self._db_path = Path(db_path)
        self._timeout = timeout
```

`self._db_path` stores the path as a `Path` object — the `.resolve()` in `connect()` will expand relative paths to absolute ones.

```python
    def connect(self) -> sqlite3.Connection:
        """
        Returns a connection with WAL mode and the configured timeout.
        WAL pragma is idempotent — safe to run on every connection.
        """
        conn = sqlite3.connect(
            str(self._db_path.resolve()),   # sqlite3 requires a string, not a Path
            timeout=self._timeout,          # retry on SQLITE_BUSY for this many seconds
        )
        conn.row_factory = sqlite3.Row      # rows behave like dicts: row["column_name"]
        conn.execute("PRAGMA journal_mode=WAL")   # enable write-ahead logging
        conn.execute("PRAGMA foreign_keys=ON")    # enforce FK constraints — off by default in SQLite
        return conn
```

`row_factory = sqlite3.Row` was introduced in Lab 53 — rows support both `row["name"]` and `row[0]` access.

`PRAGMA foreign_keys=ON` is included here because SQLite disables foreign key enforcement by default for backwards compatibility. This must be set per-connection — it is not persisted in the database file.

### SAVE AND TRY

```python
from tooldb.db.database_manager import DatabaseManager

manager = DatabaseManager("tooldb.sqlite3")
conn = manager.connect()
mode = conn.execute("PRAGMA journal_mode").fetchone()[0]
print(f"Journal mode: {mode}")    # should print "wal"
conn.close()
```

**You should see:**
```
Journal mode: wal
```

**Change something:** Remove the `conn.execute("PRAGMA journal_mode=WAL")` line from `connect()`, reconnect, and check the mode again. You will see `delete` (the default mode). Add it back.

---

## Step 3 — Using DatabaseManager with SQLAlchemy

Your app uses SQLAlchemy sessions (from Lab 48–52), not raw `sqlite3` connections. SQLAlchemy needs the WAL pragma too. Add it via a connection event:

```python
# In tooldb/orm/session.py — add after the engine is created:

from sqlalchemy import event

@event.listens_for(engine, "connect")    # ← fires on every new connection SQLAlchemy opens
def set_wal_mode(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()
```

`@event.listens_for(engine, "connect")` is SQLAlchemy's hook for new connections. `dbapi_connection` is the raw `sqlite3.Connection` object underneath SQLAlchemy — the same object `sqlite3.connect()` returns.

This runs once per new connection in the pool. Since SQLAlchemy pools connections, this fires infrequently — not once per query.

### SAVE AND TRY

```python
from tooldb.orm.session import SessionLocal
from sqlalchemy import text

with SessionLocal() as session:
    result = session.execute(text("PRAGMA journal_mode")).fetchone()
    print(f"SQLAlchemy connection mode: {result[0]}")
```

**You should see:**
```
SQLAlchemy connection mode: wal
```

**Change something:** Remove the `@event.listens_for` block and run again. You will see `delete`. Add it back.

---

## Step 4 — The Honest Comparison: SQLite vs PostgreSQL

Before adding WAL mode to production code, it helps to know exactly what it fixes and what it does not.

**What WAL mode fixes:**
- Readers no longer block writers
- Writers no longer block readers
- The watcher (Lab 63) and the UI can both be open without constant `database is locked` errors

**What WAL mode does NOT fix:**
- Only one writer at a time — two concurrent `UPDATE` or `INSERT` statements still serialize
- Network drive reliability — SQLite file locking over a network share is unreliable regardless of journal mode (mentioned in Lab 63)
- True multi-user concurrency — a shop floor with 10 simultaneous users making tool edits will still experience queuing

**The threshold question:** When does SQLite become the wrong tool?

SQLite's documentation gives a direct answer: SQLite is the right choice when the database is accessed by one process at a time, or by multiple processes that rarely write simultaneously. For "many concurrent writers" — their definition is hundreds of writes per second — PostgreSQL is the right tool.

For a tool database on a single shop floor:
- One user at a time actively editing: SQLite + WAL is fine
- Two users on different machines editing simultaneously: SQLite + WAL handles this if writes are infrequent (seconds between writes)
- 10 users all submitting changes at the same moment: SQLite will serialize them — each waits for the one before — but with `timeout=30`, all will succeed
- A web server serving hundreds of requests per second: SQLite is the wrong choice

The migration path (Block 11) replaces SQLite with a backend API. The concept you are learning here — connection management via a manager class — is the same regardless of the database. The `DatabaseManager` pattern appears in every production app.

---

## 🎯 Challenge: DatabaseManager with Context Manager Support

**You know:** `DatabaseManager.connect()` returns a connection. Connections must be closed when you are done with them — forgetting `conn.close()` leaks file handles.

**Task:** Add `__enter__` and `__exit__` methods to `DatabaseManager` so it can be used as a context manager:

```python
with DatabaseManager("tooldb.sqlite3") as conn:
    result = conn.execute("SELECT COUNT(*) FROM tools_orm").fetchone()
    print(result[0])
# conn is automatically closed here — no conn.close() needed
```

**Starting code:**

```python
class DatabaseManager:
    def __init__(self, db_path, timeout=30):
        self._db_path = Path(db_path)
        self._timeout = timeout
        self._conn = None    # ← add this

    def connect(self):
        # ... existing code ...

    def __enter__(self):
        # open the connection and return it
        ...

    def __exit__(self, exc_type, exc_val, exc_tb):
        # close the connection regardless of whether an exception occurred
        ...
```

---

<details>
<summary>▶ Show Solution</summary>

```python
def __enter__(self) -> sqlite3.Connection:
    self._conn = self.connect()   # open and store
    return self._conn             # returned as the `as conn` target

def __exit__(self, exc_type, exc_val, exc_tb):
    if self._conn:
        self._conn.close()
        self._conn = None
    return False   # False = do not suppress exceptions
```

**Key insight:** `__exit__` receives the exception info (if any occurred inside the `with` block). Returning `False` (or `None`) means "I do not handle this exception — let it propagate." Returning `True` would suppress it. For a connection manager, you almost always want `False`: the exception should still reach the caller, but the connection should still close. This is the same guarantee `try/finally` provides — and `with` is exactly `try/finally` with a named interface.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| WAL mode is active after `manager.connect()` | `conn.execute("PRAGMA journal_mode").fetchone()[0]` → `"wal"` |
| SQLAlchemy connections also use WAL | `session.execute(text("PRAGMA journal_mode")).fetchone()[0]` → `"wal"` |
| Foreign keys are enforced | Insert a tool with a nonexistent `holder_id` — should raise IntegrityError |
| `timeout=30` prevents immediate lock failure | Hold a lock for 3s, connect with timeout=30 — succeeds |
| Context manager closes the connection | `conn.close()` raises `ProgrammingError` if you call it after the `with` block |

---

## Quick Check Answers

**1. Two scripts write to the same SQLite file simultaneously — what happens to the second one?**
SQLite uses file-level locking. The first writer acquires an exclusive lock on the database file. The second writer hits `SQLITE_BUSY` immediately (with default timeout 5 seconds) or after however long its timeout is configured. It does not corrupt data — it simply fails to proceed until the first writer releases the lock. This is by design: serialization over corruption.

**2. What problem does writing to a log first solve?**
Atomicity. If the process crashes mid-write to the main database file, the file can be in an inconsistent state (partially written). With WAL, the write goes to the log file first — which is an append operation, always either fully written or not. The main file is only modified during a checkpoint, which is a controlled, atomic operation. A crash during a checkpoint does not corrupt the database — the WAL file still contains the full record of what was intended.

**3. One reason to choose SQLite over PostgreSQL for 10 shop-floor users:**
Zero administration. PostgreSQL requires a running server process, user accounts, connection credentials, and monitoring. SQLite is a file — copy it, back it up with `cp`, send it as an email attachment. For a shop where the "IT department" is one person with other responsibilities, the operational simplicity of SQLite is a real engineering argument, not just laziness. WAL mode and a 30-second timeout handle the concurrency case for 10 users who rarely write simultaneously.
