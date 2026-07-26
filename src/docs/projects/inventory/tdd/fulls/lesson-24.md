# Lesson 24: Deploying the Application

**What you will build**
A containerized, deployable version of the application: a Dockerfile for reproducible environments, SQLite's WAL mode enabled for real concurrent traffic, a correct backup procedure, and migrations run automatically as part of deployment rather than by hand. The problem we're solving: everything built across this entire project has run on one machine, one way, with one person (you) manually remembering every setup step. Deployment means all of that has to work correctly on a different machine, unattended, under real concurrent load — including finally giving WAL, the term you had to ask about back in your NexusInventory practice project, the full explanation it never got then.

**What you need to know first**
Lesson 17 (Alembic migrations). Lesson 8 (transactions, atomicity — WAL turns out to be a direct application of the same idea).

---

## Concept Unit: Containerizing With Docker

### The Problem

This project has been developed on your machine, with your specific Python version, your specific installed packages, your specific operating system. Deploying it means running it somewhere else entirely — a server that may have none of that already in place, or worse, slightly different versions of it, silently changing behavior.

### Introduce the concept in isolation

Create a minimal `lab.Dockerfile`:

```dockerfile
FROM python:3.11-slim
RUN pip install fastapi uvicorn
COPY lab_app.py .
CMD ["python", "lab_app.py"]
```

And `lab_app.py`:

```python
print("Hello from inside a container")
```

Run it:

```bash
docker build -f lab.Dockerfile -t lab-image .
docker run lab-image
```

Output:

```text
Hello from inside a container
```

*What this proves:* this ran correctly regardless of what Python version or packages exist on the host machine outside the container — `FROM python:3.11-slim` specifies a complete, known starting environment, and everything after it (`RUN pip install ...`) builds on top of exactly that, packaged together into one reproducible unit (the **image**), which `docker run` then executes as an isolated, running instance (a **container**).

### Explain the mechanism

A Docker image is a layered, self-contained snapshot of an entire environment — not just your code, but the specific OS packages, Python version, and dependencies it needs, all captured together. A container is one running instance of that image, isolated from the host machine's own filesystem and processes by default. This is meaningfully lighter-weight than a full virtual machine (which emulates entire hardware) — a container shares the host machine's kernel, isolating only the application-level environment — but achieves the same practical goal here: "it works" stops depending on what happens to already be installed on whatever machine runs it.

### Discard the throwaway example

Delete `lab.Dockerfile` and `lab_app.py`. Build the real Dockerfile for this project.

### Project Change

* **Files affected:** Create `Dockerfile`, `requirements.txt`.
* **Change type:** Add.

### The New Code

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Mechanical walkthrough

1. `WORKDIR /app`: (first appearance). Sets the working directory inside the container for every instruction that follows — subsequent `COPY` and `CMD` steps operate relative to `/app`, not the container's filesystem root.
2. `COPY requirements.txt .` then `RUN pip install -r requirements.txt`, *before* `COPY . .` (the rest of the code): (first appearance of layer-ordering as a deliberate choice, not an arbitrary order). Docker caches each step; if only application code changes between builds (not dependencies), this ordering means the potentially slow `pip install` step can be skipped entirely on rebuild, reusing the cached layer — reordering these two `COPY` steps would defeat that caching for no benefit.
3. `--host 0.0.0.0`: (first appearance). Without this, `uvicorn` would only accept connections from inside the container itself, unreachable from outside it — `0.0.0.0` means "accept connections on any network interface," necessary for the container's exposed port to actually be reachable.

### CS Lens

**Reproducibility as a first-class engineering property, not a side effect of good habits.** Every lesson in this project has quietly assumed a working, correctly-configured Python environment existed. Docker makes that assumption an explicit, checked-in artifact instead of tribal knowledge living only in one developer's memory of what they happened to install and when.

### SE Lens

**"Works on my machine" is a real, named failure mode this directly addresses.** A Dockerfile is a single, version-controlled source of truth for the entire runtime environment — anyone (or any deployment system) building from the same Dockerfile gets an identical environment, eliminating an entire class of "it worked in development" bugs that have nothing to do with the actual application logic.

### Commands needed

```bash
docker build -t social-network .
docker run -p 8000:8000 social-network
```

---

## Concept Unit: WAL Mode — Properly Explained

### The Problem

SQLite's default journaling mode locks the *entire database file* for the duration of a write — meaning while one request is writing (say, creating a post), every other request trying to *read* anything from the database has to wait. Under real, concurrent deployment traffic — many requests arriving close together — this becomes a genuine bottleneck, not a theoretical one.

### Introduce the concept in isolation

Create `lab_wal.py`:

```python
import sqlite3

conn = sqlite3.connect("lab_wal.db")
print("Before:", conn.execute("PRAGMA journal_mode").fetchone())

conn.execute("PRAGMA journal_mode=WAL")
print("After:", conn.execute("PRAGMA journal_mode").fetchone())

conn.execute("CREATE TABLE IF NOT EXISTS t (x INTEGER)")
conn.execute("INSERT INTO t VALUES (1)")
conn.commit()
conn.close()
```

Run it:

```bash
python lab_wal.py
ls lab_wal.db*
```

Output:

```text
Before: ('delete',)
After: ('wal',)
lab_wal.db  lab_wal.db-shm  lab_wal.db-wal
```

*What this proves:* switching journal modes is one `PRAGMA` statement — but it visibly changed what's on disk: two new files, `-wal` and `-shm`, appeared alongside the original database file. Something structurally different is happening now, not just a setting flipped invisibly.

### Explain the mechanism — the actual explanation you were owed back in NexusInventory

In WAL mode, a write doesn't modify the main database file directly. It's appended to the separate `-wal` file instead — a sequential log of pending changes. Readers continue reading the main database file's last fully consistent state, entirely undisturbed by writes still accumulating in the `-wal` file alongside it — this is precisely why WAL mode allows concurrent reads during a write, unlike the default mode's whole-file lock. Periodically (or explicitly, via `PRAGMA wal_checkpoint`), SQLite performs a **checkpoint**: replaying the accumulated `-wal` file's changes into the main database file, then clearing the log. This is, structurally, the exact same write-ahead-logging idea behind Lesson 8's transactions and most real databases' durability guarantees more broadly: record the intended change durably and sequentially *first*, apply it to the "real" structure *second* — the same ordering principle, applied here at the storage-engine level instead of the application level.

### Discard the throwaway example

Delete `lab_wal.py` and its generated files. Enable WAL for the real project.

### Project Change

* **Files affected:** `db.py`.
* **Change type:** Modify.

### The New Code

```python
# db.py — modify get_connection()
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn
```

### CS Lens

**Write-ahead logging as a general durability pattern, not a SQLite-specific trick.** The same principle — log the intended change sequentially and durably before modifying the "real" data structure — underlies journaling filesystems, most production database engines' transaction logs, and message queues' durability guarantees. Recognizing "record first, apply second" as a named, reusable pattern is more valuable than memorizing that SQLite specifically calls its version WAL.

### SE Lens

**WAL mode changes what a "backup" correctly means — directly motivating the next unit.** With the default mode, copying the single `.db` file while nothing is writing to it is a safe, complete backup. With WAL enabled, recent writes may exist *only* in the `-wal` file, not yet checkpointed into the main file — a naive copy of just the `.db` file could produce a backup silently missing recent data.

### Commands needed

```bash
pytest tests/
```

```text
============================= test session starts ==============================
collected 31 items

tests/test_api.py ..............................                         [ 97%]
tests/test_units.py .                                                    [100%]

============================== 31 passed in 0.14s ===============================
```

---

## Concept Unit: Backups and Migrations, Done Correctly

### The Problem

A correct backup, now that WAL is enabled, needs to account for the `-wal` file's pending changes — and a correct deployment needs Alembic's migrations (Lesson 17) applied automatically, in the right order, before the new application code that expects them starts serving traffic, not as a manual step someone might forget.

### The New Code

```python
# backup.py — a real, WAL-aware backup script
import sqlite3
import shutil
from datetime import datetime

def backup_database(source_path: str, backup_dir: str):
    source_conn = sqlite3.connect(source_path)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{backup_dir}/social_{timestamp}.db"
    backup_conn = sqlite3.connect(backup_path)

    with backup_conn:
        source_conn.backup(backup_conn)

    source_conn.close()
    backup_conn.close()
    return backup_path
```

```bash
# deployment sequence — run in this exact order, e.g. as a container startup script
alembic upgrade head
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Mechanical walkthrough

1. `source_conn.backup(backup_conn)`: (first appearance). SQLite's built-in backup API — deliberately used instead of a plain file copy — correctly incorporates any pending `-wal` content into the backup as part of a single consistent snapshot, exactly the gap a naive `shutil.copy("social.db", ...)` would silently miss.
2. `alembic upgrade head` run *before* `uvicorn` starts: (already-established `alembic upgrade` from Lesson 17, now sequenced deliberately as a deployment step). New application code may expect a schema change (like Lesson 13's `UNIQUE` constraint) that doesn't exist yet on a freshly deployed database — running migrations first guarantees the schema is ready before any request can possibly be served against it.

### CS Lens

**Deployment ordering as its own correctness property, the same category as everything else this curriculum has cared about.** A deployment sequence that starts serving traffic before migrations complete is structurally similar to Lesson 8's unguarded two-write like/count update: two operations that must happen in a specific order, where getting that order wrong produces a real, if intermittent, failure — here, requests hitting a schema the application code doesn't expect yet.

### SE Lens

**Automating what used to be a manual step removes an entire category of human error.** Every deployment-related fix in this lesson — WAL-aware backups, migrations sequenced before serving traffic — replaces a step that a tired, rushed person could plausibly forget or get wrong under real production pressure, with something that happens identically, correctly, every single time.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 31 items

tests/test_api.py ..............................                         [ 97%]
tests/test_units.py .                                                    [100%]

============================== 31 passed in 0.14s ===============================
```

---

## Closing

**Connect the pieces**
`docker build` produces a reproducible image containing exactly this project's dependencies and code, independent of whatever happens to be installed on any given machine. Inside that container, `get_connection()` now enables WAL mode — writes append to a separate log file, letting reads proceed concurrently, exactly the mechanism you had to ask about and were given a poor answer for back in your NexusInventory practice project. `backup.py` correctly captures WAL's pending writes as one consistent snapshot, and every deployment runs `alembic upgrade head` before serving a single request, guaranteeing the schema and the code that expects it are never out of sync.

**What breaks without this**
Without WAL, real concurrent traffic serializes every write behind a full-file lock, blocking reads unnecessarily. Without WAL-aware backups, a routine backup taken at the wrong moment could silently miss recent writes sitting only in the `-wal` file. Without migrations sequenced before serving traffic, a freshly deployed instance could serve requests against a schema still missing a change the newly deployed code assumes already exists — intermittent, hard-to-reproduce failures, arriving exactly during the highest-risk moment of any system's lifecycle: right after a deploy.

**Exercises**
1. Deliberately deploy in the wrong order (start `uvicorn` before running `alembic upgrade head` on a fresh database) and observe the resulting failure directly — the concrete version of this lesson's ordering argument, not just the argument itself.
2. Write a restore procedure using the backup files `backup.py` produces, and verify a restored database passes the full test suite against it.

**Definition of Done**
* [x] A working `Dockerfile` produces a reproducible container image.
* [x] WAL mode enabled, explained fully — closing the loop on the term from your earlier NexusInventory work.
* [x] A WAL-aware backup script using SQLite's real backup API.
* [x] Migrations sequenced correctly before the application starts serving traffic.
* [x] Commit: `feat: containerized deployment with WAL mode, correct backups, and migration-first startup`

---

## Context Snapshot (End of Lesson 24 — Project Complete)

**1. File Tree (additions):** `Dockerfile`, `requirements.txt`, `backup.py`.

**2. Schema State:** WAL mode enabled — `social.db-wal` and `social.db-shm` now exist alongside the main database file.

**6. Terminology Ledger (final additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Docker image / container | L24 | A reproducible environment snapshot, and one running instance of it |
| Layer caching (Docker) | L24 | Reordering build steps to reuse cached, unchanged layers on rebuild |
| WAL (Write-Ahead Logging) | L24 | Writes appended to a separate log first, allowing concurrent reads; periodically checkpointed into the main file |
| Checkpoint (WAL) | L24 | Replaying the WAL file's changes into the main database file |
| WAL-aware backup | L24 | A backup capturing pending WAL content as one consistent snapshot, not just the main file |
| Deployment ordering | L24 | Migrations applied before the application starts serving traffic, as a correctness requirement |

**7. Lesson Completion State:**
- Completed: Lessons 1-24, Interludes A, B, C, D — **project complete**

**8. Final Architecture State:**
- HTTP Layer: 23 routes, authenticated, authorized, logged, timed, and cached where warranted
- Business Logic: `extract_hashtags`, `create_access_token`, `get_current_member`, `require_admin`, `log_slow_requests`
- Data Access: `db.py`, `repositories.py`, `models.py` — hybrid raw-SQL and ORM by design
- ORM: partially adopted, Alembic-migrated
- Authentication: complete, RBAC-layered
- Observability: structured logging, request timing
- Deployment: containerized, WAL-enabled, correctly backed up, migration-sequenced
