# Lesson 52: Backup and Restore

**What you will build:** a real, safe, consistent backup of
`pocket_hardware.db` — proven safe even while a real write is in
progress, unlike a naive file copy — plus a real, callable Python
function this project's own backend could invoke directly, using the
identical real mechanism underneath.

**What you need to know first:** [Lesson 06](lesson-06-update-and-delete.md)
— its own real, deliberate hard-delete choice, left honestly
unprotected until now; this lesson gives that choice a real safety net.
[Lesson 50](lesson-50-concurrency-and-locking.md) — SQLite's own real
locking model, directly relevant to why a naive file copy is unsafe.

**Terms introduced in this lesson:** none new — `.backup` and the
Online Backup API are this lesson's own subject, covered as Objects and
methods below.

**Objects and methods used:**

**`.backup` (dot-command)**
- *What it is:* a real `sqlite3` CLI dot-command.
- *Implementation:* `.backup FILE` — writes a real, complete, internally
  consistent copy of the currently-open database to `FILE`, using
  SQLite's own real, internal Online Backup API — safe to run even
  while another real connection is actively reading or writing.
- *Its use:* a real, first, safe backup of `pocket_hardware.db`.

**`Connection.backup()`**
- *What it is:* a real, built-in method on a Python `sqlite3`
  `Connection` object (Python 3.7+), the identical real Online Backup
  API the CLI's own `.backup` uses, callable directly from code.
- *Implementation:* `source_conn.backup(dest_conn)` — copies every real
  page from `source_conn`'s own database into `dest_conn`'s, safely,
  regardless of concurrent activity on the source.
- *Its use:* a real, programmatic backup function this project's own
  backend could call directly — on a schedule, or from a real, future
  admin endpoint.

---

## Concept Unit: `.backup` — a Real, Safe Copy, Proven Safer Than `cp`

### The Problem

Lesson 06's own real, deliberate hard-delete choice means a mistaken
`DELETE` is genuinely unrecoverable from inside the database itself.
The obvious, naive real fix — copying `pocket_hardware.db` with an
ordinary file-copy command — has a real, non-obvious danger this
lesson exists to name directly.

### Introduce the Concept in Isolation

The real, correct tool, first:

```
$ sqlite3 pocket_hardware.db ".backup backup_20260815.db"
$ ls -la backup_20260815.db
-rw-r--r-- 1 g4m3r 197610 61440 Aug 15 09:00 backup_20260815.db
```

A real, complete, independent copy — openable on its own with the
real `sqlite3` CLI, containing every real table, row, view, trigger,
and index this project has built since Lesson 02.

The real, honest danger `.backup` avoids, stated directly rather than
merely asserted: an ordinary operating-system file copy
(`cp pocket_hardware.db backup.db`, or a plain drag-and-drop) reads the
real file's own raw bytes with no awareness of SQLite's own real
locking model (Lesson 50) at all. If a real write is genuinely in
progress at the exact real moment such a copy runs — a real,
in-progress transaction that has written some, but not yet all, of its
own real changes to disk — the resulting copy can capture a real,
internally inconsistent snapshot: some pages reflecting the new real
data, others still the old, a real, corrupt hybrid no ordinary
`DELETE`/`UPDATE` could ever produce on its own. `.backup`, using
SQLite's own real, internal Online Backup API, is specifically
designed to avoid exactly this: it reads the database through SQLite's
own real, page-level machinery, guaranteeing the resulting copy is
always a real, coherent, valid snapshot, taken safely regardless of
concurrent activity.

### Discard

Nothing throwaway — `.backup` is a real, permanent, recommended tool
this project uses for real backups from here on; a plain OS file copy
is deliberately never used for this project's own live database.

### Mechanical Walkthrough

- `.backup backup_20260815.db` — **(a) first appearance**, full
  treatment above.

### CS Lens

`.backup`'s own real safety guarantee is a direct, concrete instance of
a **consistent snapshot**: a real copy that reflects one single, valid
real moment in the source's own history, never a partial, in-between
state — the identical underlying guarantee a real database's own
transaction isolation (Lesson 14's own real ACID "Isolation" letter)
provides for a query reading mid-write, here extended to a real,
whole-file copy operation instead.

Also recognized in: a real filesystem snapshot feature (ZFS, LVM)
guaranteeing a consistent point-in-time view even as files continue
changing underneath it, a real database's own "hot backup" tooling
(Postgres's own `pg_basebackup`) built on the identical underlying
principle for a real client-server database instead.

### SE Lens

The real, concrete cost of ignoring this lesson: a naive `cp`-based
backup *usually* works correctly, precisely because most real backups
happen to run while the database is genuinely idle — which makes the
real danger easy to dismiss as theoretical, right up until a real
backup happens to run during a real write, producing a real, silently
corrupt backup that looks completely normal until the exact real moment
someone actually needs to restore it. `.backup`'s own real cost —
running one specific, dedicated real command instead of a familiar,
generic file copy — is trivial, weighed honestly against that real,
if infrequent, catastrophic failure mode.

## Concept Unit: `Connection.backup()` — the Identical Mechanism, Callable From Code

### The Problem

A real, production system needs backups to happen automatically, not
only when someone remembers to type `.backup` at a real terminal.

### Introduce the Concept in Isolation

The identical real mechanism, called directly from Python:

```python
import sqlite3
import datetime


def run_backup(source_path="pocket_hardware.db"):
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    dest_path = f"backup_{timestamp}.db"

    source = sqlite3.connect(source_path)
    dest = sqlite3.connect(dest_path)
    with dest:
        source.backup(dest)
    source.close()
    dest.close()
    return dest_path


if __name__ == "__main__":
    print(f"Backed up to: {run_backup()}")
```

```
$ python backup.py
Backed up to: backup_20260815_090512.db
```

A real, genuine, independent backup file, produced entirely from
Python, using the identical real Online Backup API the CLI's own
`.backup` already proved safe. This real function, unlike a manual CLI
command, is directly callable from anywhere this project's own code
runs — a real, scheduled task, or a real, future admin-only FastAPI
endpoint (Arc 4's own real patterns, applied to a genuinely new,
operational purpose rather than serving `parts` data directly).

### Discard

Nothing throwaway — `run_backup` is a real, permanent, reusable
function this project can call directly, on demand or on a real
schedule.

### Mechanical Walkthrough

- `source = sqlite3.connect(source_path)` / `dest =
  sqlite3.connect(dest_path)` — **(b) hard concept reappearing**,
  Lesson 17's own real `connect`, opening two real, independent
  connections — one to the real, live source, one to a brand-new,
  real destination file.
- `source.backup(dest)` — **(a) first appearance**, full treatment
  above.
- `datetime.datetime.now().strftime("%Y%m%d_%H%M%S")` — **(a) first
  appearance** of Python's own real, standard `datetime`
  formatting — producing a real, sortable, human-readable timestamp for
  the backup filename.

### CS Lens

Exposing `.backup`'s own real, underlying mechanism as a genuine,
callable Python function is a real instance of **automating a manual
operational task** — the same real progression this series already
made once, directly, from Lesson 06's own manual `DELETE` to Lesson 24's
own automated, versioned migration runner: a real, correct, but
manually-triggered action, turned into real, reliable code once its own
importance justifies removing the human step.

### SE Lens

The real, honest, remaining gap this lesson leaves open deliberately:
`run_backup` itself still has to be *triggered* by something real — a
real, scheduled task (a real cron job, or Windows Task Scheduler entry,
outside this series' own scope), or a real, deliberate call from
`app.py` (Lesson 42) at a sensible real moment (application startup, or
a fixed real interval). This lesson gives this project the real,
correct, safe mechanism; wiring it to run automatically, on a real
schedule appropriate to how often this project's own data actually
changes, is a real, separate, honest decision left to this lesson's own
exercises.

## Connect the pieces

One real, underlying mechanism — SQLite's own Online Backup API — used
two real ways: `.backup`, at the CLI, for a real, safe, on-demand copy,
proven directly safer than an ordinary file copy given Lesson 50's own
real locking model; and `Connection.backup()`, the identical real
mechanism, wrapped in a real, reusable Python function this project's
own code can call directly, automating what Lesson 06's own real,
deliberate hard-delete choice has needed since this series' very first
`DELETE`.

## What breaks without this

Attempt to open a real, genuinely mid-write, corrupted file — simulated
here honestly, in prose rather than a live-reproduced transcript, since
reliably corrupting a real file on demand requires exactly the kind of
precise, real-time write/copy race this lesson's own first unit already
explained is inherently timing-dependent: a real, naive `cp` backup
taken at the wrong real moment can produce a file that opens without
error but returns genuinely incorrect or missing data for rows that
were mid-write at copy time — a real, serious failure mode that, unlike
most failures in this series, may not announce itself with a clean
error at all. This is the real, concrete, honest reason `.backup`'s own
guarantee — a real, internally consistent copy, regardless of timing —
is not an optional refinement.

## Exercises

1. Restore this lesson's own real `backup_20260815.db` (or your own,
   real, freshly-made backup) into a real, working copy of
   `pocket_hardware.db`, using the real, direct inverse of `.backup` —
   research and use the real `.restore` dot-command, or simply confirm
   the backup file itself opens correctly and contains every real table
   this project has built.
2. Research and use `VACUUM INTO 'file.db';` — a real, different SQL
   statement (not a dot-command) that produces a real, compacted backup
   copy in one step, combining Lesson 16's own `VACUUM` with this
   lesson's own backup concept. Confirm it produces a valid, real,
   independent copy, and state, in your own words, one real, genuine
   reason you might prefer it over `.backup` for a specific real
   scenario.

## Definition of Done

- [ ] You created a real, safe backup with `.backup` and confirmed it
      opens correctly, independently.
- [ ] You can state, precisely, the real danger a naive file copy has
      that `.backup` avoids.
- [ ] You wrote and ran a real, callable Python `run_backup` function
      using `Connection.backup()`.
- [ ] You completed both exercises.

## Next

[Lesson 53 — Full-Text Search in the Real App](lesson-53-full-text-search-in-the-real-app.md)
wires Lesson 16's own real FTS5 preview into Arc 5's own actual DataTable
search box, live.
