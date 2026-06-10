# Python Tool Database — LAB 65 — Database Backups

**Prerequisites:** Lab 64 (WAL mode, DatabaseManager). You have a working database with WAL mode. This lesson makes safe copies of it — copies that are always consistent, even while the app is running.

**What this lab adds:**
- Why `shutil.copy()` is not safe for a live SQLite database
- `sqlite3.Connection.backup()` — the safe copy API
- Rotation: keeping the last N backups and deleting older ones
- A `BackupManager` class with scheduled backups via `QTimer`

**Time:** 40–50 minutes

---

## What You Will Build

A `BackupManager` that saves a dated backup of the database on a timer and keeps only the last 5. Running it produces:

```
backups/
  tooldb_2026-05-21_143022.sqlite3
  tooldb_2026-05-21_120015.sqlite3
  tooldb_2026-05-20_183045.sqlite3
  (older backups automatically deleted — only 5 kept)
```

---

> **Quick Check — try to answer before reading:**
>
> 1. You copy a SQLite database file with `shutil.copy()` while a transaction is being written. The copy starts mid-write. What state is the copy in?
> 2. SQLite's `Connection.backup()` method blocks until the copy is complete. What happens to new writes that arrive during the backup?
> 3. You keep 5 backups. A user corrupts data on Monday. You discover it Thursday. How many days back can you recover? What does this tell you about backup count vs. backup frequency?
>
> *(Answers at the end of this lab)*

---

## The Problem — A Corrupt Copy

Before seeing the fix, see what can go wrong.

```python
# WRONG — do not use for live databases:
import shutil

shutil.copy("tooldb.sqlite3", "tooldb_backup.sqlite3")
```

`shutil.copy()` opens the source file like any other file — at the OS level — and reads bytes while SQLite may be writing bytes to the same file. If a transaction is in the middle of being committed when `shutil.copy()` reads, the backup gets half the old data and half the new data. When you try to open the backup, SQLite reports: `database disk image is malformed`.

Even with WAL mode, this is not safe — the WAL file (`.wal`) is not copied together with the main file, so the backup is missing pending writes.

### SAVE AND TRY — See the Warning

```python
import sqlite3
import shutil

conn = sqlite3.connect("tooldb.sqlite3")
conn.execute("BEGIN")    # start a transaction but don't commit
conn.execute("INSERT INTO tools_orm (name, tool_type) VALUES ('test', 'endmill')")

# Now copy the file mid-transaction:
shutil.copy("tooldb.sqlite3", "tooldb_bad_backup.sqlite3")

conn.rollback()
conn.close()

# Try to open the backup:
backup_conn = sqlite3.connect("tooldb_bad_backup.sqlite3")
try:
    count = backup_conn.execute("SELECT COUNT(*) FROM tools_orm").fetchone()[0]
    print(f"Backup tool count: {count}")
except Exception as error:
    print(f"Backup is corrupt: {error}")
```

**You should see** either `Backup tool count:` with the wrong number (the test row is present but was rolled back in the source), or an integrity error depending on timing.

**The point:** The backup is in an unpredictable state because the copy and the write were not coordinated.

---

## Concept: `sqlite3.Connection.backup()`

**What it is:** A method on an open SQLite connection that creates a consistent copy of the database, coordinating with SQLite's locking system.

**The problem before:** `shutil.copy()` copies bytes at the OS level with no knowledge of SQLite's transaction state. It can copy a file mid-write.

**The solution:** `conn.backup(destination)` uses SQLite's internal API (`sqlite3_backup_init`) which:
1. Waits for any in-progress write to finish
2. Locks the source long enough to copy a consistent snapshot
3. Releases the lock
4. Writes to the destination connection

The backup is guaranteed to be a valid SQLite database at a transaction boundary — never mid-write.

**What it hides:** The page-by-page copy protocol, the lock acquisition and release, and the retry logic when the source is momentarily busy. You call one method; SQLite handles coordination.

**The protected invariant:** The destination database will always be a valid, openable SQLite database at a consistent transaction boundary. An incomplete OS-level copy does not protect this.

**Smallest possible example:**

```python
import sqlite3

source = sqlite3.connect("source.sqlite3")
dest   = sqlite3.connect("destination.sqlite3")

source.backup(dest)    # ← one method call — consistent copy guaranteed

dest.close()
source.close()
```

The destination can be any `Connection` — including `sqlite3.connect(":memory:")` for an in-memory copy.

**You will see this again in:** Every application that stores user data in SQLite and needs to offer "Export" or "Save a copy." Firefox uses `backup()` for its profile copy feature. SQLite documentation lists online backup as a core use case, not an edge case.

**Watch for:** `backup()` acquires a shared lock on the source. Long-running reads on the source can delay the backup start. For large databases (over 100 MB), pass `pages=` and `sleep=` to copy in chunks with pauses, keeping the app responsive.

---

## Step 1 — A Single Safe Backup

Create `tooldb/db/backup_manager.py`:

```python
import sqlite3
from datetime import datetime
from pathlib import Path
```

`datetime` is Python's standard library module for timestamps — `datetime.now()` returns the current date and time as an object with `.year`, `.month`, `.day`, `.hour`, etc.

```python
def backup_database(source_path: str | Path, backup_dir: str | Path) -> Path:
    """
    Creates a timestamped backup of the source database.
    Returns the path of the created backup file.
    Uses sqlite3.backup() — safe to call while the database is open.
    """
    source_path = Path(source_path)
    backup_dir  = Path(backup_dir)
    backup_dir.mkdir(parents=True, exist_ok=True)   # create the directory if it doesn't exist

    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")    # e.g. "2026-05-21_143022"
    backup_name = f"{source_path.stem}_{timestamp}{source_path.suffix}"
    # source_path.stem = "tooldb", source_path.suffix = ".sqlite3"

    backup_path = backup_dir / backup_name

    source_conn = sqlite3.connect(str(source_path))
    dest_conn   = sqlite3.connect(str(backup_path))

    source_conn.backup(dest_conn)    # ← the safe copy

    dest_conn.close()
    source_conn.close()

    return backup_path
```

`datetime.now().strftime("%Y-%m-%d_%H%M%S")` formats the current time as a sortable string. `%Y` = 4-digit year, `%m` = 2-digit month, `%d` = 2-digit day, `%H%M%S` = hours-minutes-seconds. The result sorts alphabetically in chronological order — important for rotation in Step 3.

### SAVE AND TRY

```python
from tooldb.db.backup_manager import backup_database
from pathlib import Path

path = backup_database("tooldb.sqlite3", "backups")
print(f"Backup created: {path}")
print(f"Backup size: {path.stat().st_size} bytes")

# Verify the backup is readable:
import sqlite3
conn = sqlite3.connect(str(path))
count = conn.execute("SELECT COUNT(*) FROM tools_orm").fetchone()[0]
print(f"Tools in backup: {count}")
conn.close()
```

**You should see:**
```
Backup created: backups\tooldb_2026-05-21_143022.sqlite3
Backup size: 36864 bytes
Tools in backup: 4
```

**Change something:** Open a transaction on the source (`conn.execute("BEGIN EXCLUSIVE")`) in a separate script, then run the backup script. Watch whether it blocks or proceeds. SQLite's `backup()` will wait up to the connection timeout — with the default timeout it will wait 5 seconds and then proceed anyway. Change it back.

---

## Step 2 — Backup Rotation

Keeping unlimited backups fills disk. Keep only the last N:

```python
def rotate_backups(backup_dir: str | Path, keep: int = 5) -> list[Path]:
    """
    Deletes old backups, keeping only the `keep` most recent.
    Returns list of deleted paths.
    Relies on filename sort order being chronological (timestamped names from backup_database).
    """
    backup_dir = Path(backup_dir)
    all_backups = sorted(backup_dir.glob("*.sqlite3"))   # sorted alphabetically = chronologically
    to_delete   = all_backups[:-keep] if len(all_backups) > keep else []

    deleted = []
    for old_backup in to_delete:
        old_backup.unlink()    # .unlink() deletes a file — from "unlink inode" in Unix terminology
        deleted.append(old_backup)

    return deleted
```

`sorted()` without a `key` argument sorts alphabetically. Because the filename starts with the date in `YYYY-MM-DD` format, alphabetical order is chronological order. `all_backups[:-keep]` is a slice: everything except the last `keep` items. If there are 7 backups and `keep=5`, `[:-5]` gives the first 2 — the oldest two — which get deleted.

### SAVE AND TRY

```python
from tooldb.db.backup_manager import backup_database, rotate_backups
import time

# Create 7 backups quickly:
for i in range(7):
    backup_database("tooldb.sqlite3", "backups")
    time.sleep(1)   # ensure unique timestamps

from pathlib import Path
print(f"Before rotation: {len(list(Path('backups').glob('*.sqlite3')))} backups")

deleted = rotate_backups("backups", keep=5)
print(f"Deleted: {len(deleted)}")
print(f"After rotation: {len(list(Path('backups').glob('*.sqlite3')))} backups")
```

**You should see:**
```
Before rotation: 7 backups
Deleted: 2
After rotation: 5 backups
```

**Change something:** Change `keep=5` to `keep=2`. Run again (after making 7 backups). You should see `Deleted: 5`. Change it back to `5`.

---

## Step 3 — The BackupManager Class with QTimer

Wire backup + rotation into a Qt timer that runs every 30 minutes:

```python
# In tooldb/db/backup_manager.py — add after the functions:

from PySide6.QtCore import QObject, QTimer


class BackupManager(QObject):
    """
    Schedules automatic database backups at a fixed interval.
    Runs entirely on the main thread via QTimer — no background thread needed
    because sqlite3.backup() is fast for typical tool databases (< 1 second).
    """

    INTERVAL_MS = 30 * 60 * 1000    # 30 minutes in milliseconds

    def __init__(self, db_path: str | Path, backup_dir: str | Path,
                 keep: int = 5, parent=None):
        super().__init__(parent)
        self._db_path   = Path(db_path)
        self._backup_dir = Path(backup_dir)
        self._keep      = keep

        self._timer = QTimer(self)
        self._timer.setInterval(self.INTERVAL_MS)
        self._timer.timeout.connect(self._run_backup)

    def start(self) -> None:
        self._timer.start()

    def stop(self) -> None:
        self._timer.stop()

    def _run_backup(self) -> None:
        """Called by QTimer every INTERVAL_MS milliseconds."""
        path = backup_database(self._db_path, self._backup_dir)
        rotate_backups(self._backup_dir, keep=self._keep)
        print(f"[BackupManager] Backup written: {path.name}")   # replace with logging in production
```

`QTimer(self)` creates a timer owned by this `QObject`. When `self` is deleted, the timer is automatically stopped and cleaned up — no manual cleanup required.

`timeout.connect(self._run_backup)` fires `_run_backup()` on the main thread every `INTERVAL_MS` milliseconds. Unlike `watchdog` (Lab 63) which needed signal/thread crossing, `QTimer` already runs on the main thread — no thread-safety concern here.

### SAVE AND TRY

```python
import sys
from PySide6.QtWidgets import QApplication
from tooldb.db.backup_manager import BackupManager

app = QApplication(sys.argv)

manager = BackupManager("tooldb.sqlite3", "backups", keep=5)
manager._timer.setInterval(2000)   # 2 seconds for testing only
manager.start()

# Run for 8 seconds — should produce ~4 backups then rotate
from PySide6.QtCore import QTimer
QTimer.singleShot(8000, app.quit)
app.exec()

from pathlib import Path
backups = list(Path("backups").glob("*.sqlite3"))
print(f"Backups after 8 seconds: {len(backups)} (should be 5 or fewer)")
```

**You should see:**
```
[BackupManager] Backup written: tooldb_2026-05-21_143022.sqlite3
[BackupManager] Backup written: tooldb_2026-05-21_143024.sqlite3
...
Backups after 8 seconds: 4 (should be 5 or fewer)
```

---

## 🎯 Challenge: Manual Backup from the UI

**You know:** `backup_database()` creates a backup. `QFileDialog.getSaveFileName()` lets the user pick a destination path.

**Task:** Add a "File → Backup Database..." menu action. When clicked, open a save dialog starting in the `backups/` folder. The default filename should be the timestamped name. When the user confirms, call `backup_database()` to that exact path. Show a `QMessageBox.information()` confirming success.

**Starting code:**

```python
from PySide6.QtWidgets import QFileDialog, QMessageBox
from tooldb.db.backup_manager import backup_database
from datetime import datetime
from pathlib import Path

def _on_backup_database(self):
    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    default_name = f"tooldb_{timestamp}.sqlite3"

    path, _ = QFileDialog.getSaveFileName(
        self,
        "Save Database Backup",
        str(Path("backups") / default_name),    # starting path + default name
        "SQLite Database (*.sqlite3)"
    )
    if not path:
        return   # user cancelled
    # call backup_database here...
```

---

<details>
<summary>▶ Show Solution</summary>

```python
def _on_backup_database(self):
    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    default_name = f"tooldb_{timestamp}.sqlite3"

    path, _ = QFileDialog.getSaveFileName(
        self,
        "Save Database Backup",
        str(Path("backups") / default_name),
        "SQLite Database (*.sqlite3)"
    )
    if not path:
        return

    dest = Path(path)
    dest.parent.mkdir(parents=True, exist_ok=True)

    # backup_database expects a directory; we want a specific path
    # so we use sqlite3.backup directly:
    import sqlite3
    source = sqlite3.connect(str(Path("tooldb.sqlite3")))
    dest_conn = sqlite3.connect(str(dest))
    source.backup(dest_conn)
    dest_conn.close()
    source.close()

    QMessageBox.information(self, "Backup Complete", f"Backup saved to:\n{dest}")
```

**Key insight:** `backup_database()` auto-generates the filename and directory. When the user chooses their own path via `getSaveFileName`, bypass the helper and call `sqlite3.backup()` directly. Knowing the underlying API — not just the helper — is what lets you adapt to non-standard cases without rewriting everything.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| `backup_database()` creates a readable database | Open backup with sqlite3, run `SELECT COUNT(*)` |
| Backup filename is timestamped and sortable | Check filename format: `YYYY-MM-DD_HHMMSS` |
| `rotate_backups()` deletes oldest backups | Create 7, rotate with keep=5, count remaining |
| Rotation leaves exactly `keep` backups | `len(list(Path("backups").glob("*.sqlite3")))` → 5 |
| `BackupManager` timer fires on schedule | Check `[BackupManager]` prints at ~30-minute intervals |

---

## Quick Check Answers

**1. What state is a `shutil.copy()` backup in if copied mid-write?**
Indeterminate. The OS reads whatever bytes are on disk at that moment. If a transaction is in the middle of being written, some pages reflect the pre-transaction state and some reflect the post-transaction state. The SQLite file format has checksums on each page — it will detect this as corruption and report "database disk image is malformed." Even without a corruption error, the data is logically inconsistent — some rows reference foreign keys that don't exist yet, or vice versa.

**2. What happens to new writes during `sqlite3.backup()`?**
They wait. `backup()` acquires a shared lock on the source database for the duration of the copy. New write transactions will hit `SQLITE_BUSY` and retry until the backup finishes (or until their timeout). For a typical tool database under 50 MB, the backup takes under a second — the delay is invisible to users. For larger databases, the `pages=` parameter copies incrementally, releasing and re-acquiring the lock between chunks so writes can proceed between pages.

**3. Keep 5 backups, discover corruption on Thursday from Monday's work — how far back?**
If backups run every 30 minutes, 5 backups cover at most 2.5 hours. Monday's data is long gone. This is why backup count and backup frequency are separate decisions: frequency determines the resolution of recovery (how much work you can lose), count determines how far back you can go. For a shop floor database, daily backups kept for 30 days is a reasonable baseline. The 5-backup limit in this lesson is appropriate for "undo an accidental import" — not for "recover from a disaster discovered days later." Archival (long-term) and operational (recent) backups serve different purposes and need different retention policies.
