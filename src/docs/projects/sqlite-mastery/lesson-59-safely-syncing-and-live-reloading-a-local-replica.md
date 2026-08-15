# Lesson 59: Safely Syncing and Live-Reloading a Local Read-Only Replica

**What you will build:** a real, safe way to publish a new version of a
local database replica that a real user might already have open —
never overwriting the file they're using at all — plus a real,
background watcher that notices a new version and pushes a live refresh
directly into the already-open window, with no restart required.

**What you need to know first:** [Lesson 50](lesson-50-concurrency-and-locking.md)
— SQLite's own real locking model, the direct reason this lesson avoids
ever writing to a file that might already be open. [Lesson 56](lesson-56-loading-states-in-pywebview.md)
— `Window.evaluate_js()`, promised there and given full treatment here.

**Terms introduced in this lesson:**
- **Pointer file** — a real, tiny, plain-text file naming which
  *actual* data file is currently the real, correct one to open —
  updated instead of the real data file itself, so nothing ever needs
  to overwrite a file a real reader might already have open.

**Objects and methods used:**

**`Window.evaluate_js()`**
- *What it is:* a real method on a `pywebview` `Window` object (Lesson
  56 kept this real object around specifically for this).
- *Implementation:* `window.evaluate_js(js_code)` — runs `js_code`
  directly inside the currently-loaded real page's own JavaScript
  engine, exactly as if typed into that page's own browser console.
- *Its use:* triggering a real, live DataTables reload inside an
  already-open window, from Python, with no page navigation at all.

**`os.replace()`**
- *What it is:* a real, standard-library Python function.
- *Implementation:* `os.replace(src, dst)` — atomically renames `src`
  to `dst`; on POSIX systems, a real, well-documented guarantee that
  the operation is indivisible — a reader can never observe a
  half-written `dst`. Real, exact behavior when `dst` is simultaneously
  open by another process is genuinely platform- and filesystem-
  dependent — this lesson's own real design deliberately avoids relying
  on it at all, for exactly that reason.
- *Its use:* named directly, as a real, correct tool for the *general*
  case of atomically publishing a file — and as the real reason this
  lesson still doesn't reach for it against a file a live reader might
  already have open.

---

## Concept Unit: Never Overwrite What Might Already Be Open

### The Problem

A naive "just copy the new database over the old one" approach — the
real, most obvious first instinct — has a real, honest danger this
series has already built the exact knowledge to recognize: Lesson 50
already proved SQLite's own file-level locking is real and
unforgiving, and copying raw bytes over an already-open file has no
real relationship to that locking model at all — a plain file copy
(`shutil.copy2`, by real, standard default) opens the destination and
writes into it directly, in place, which a concurrent real reader could
observe *mid-write*: not a clean "old data" or "new data" read, but a
genuinely corrupt, half-old-half-new one, worse than either.

### Introduce the Concept in Isolation

The real, safe alternative: never touch the file a real reader might
have open at all. Publish every new version as a genuinely new,
uniquely-named file, and point readers at the current one through a
real, tiny pointer file instead:

```python
import shutil
from pathlib import Path

SHARED_SOURCE_DIR = Path(r"\\fileserver\shared\pocket_hardware")
LOCAL_DATA_DIR = Path.home() / ".pocket_hardware"
CURRENT_VERSION_FILE = LOCAL_DATA_DIR / "current_version.txt"


def check_for_update():
    latest_name = (SHARED_SOURCE_DIR / "latest.txt").read_text().strip()
    local_current = (
        CURRENT_VERSION_FILE.read_text().strip()
        if CURRENT_VERSION_FILE.exists()
        else None
    )
    if latest_name == local_current:
        return False

    LOCAL_DATA_DIR.mkdir(exist_ok=True)
    shutil.copy2(SHARED_SOURCE_DIR / latest_name, LOCAL_DATA_DIR / latest_name)
    CURRENT_VERSION_FILE.write_text(latest_name)
    return True
```

`latest.txt`, in the real, shared source location, holds nothing but a
real filename — `pocket_hardware_v3.db`, say — updated by whoever
publishes a new version. `check_for_update` compares that real name
against `current_version.txt`'s own, local, already-recorded one; if
they genuinely differ, it copies the *new*, not-yet-existing local file
— never the one a real, already-running app might currently have
open — and only then updates the local pointer to name it.

`get_db` (Lesson 31), extended to read that real pointer fresh, on
every single request, rather than a fixed constant:

```python
def get_db():
    db_path = CURRENT_VERSION_FILE.read_text().strip()
    conn = sqlite3.connect(str(LOCAL_DATA_DIR / db_path))
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
```

Because `get_db` already opens a real, fresh connection per request
(Lesson 31's own original design), the backend picks up a new version
automatically the instant `current_version.txt` changes — with no
explicit "reload" logic needed inside the backend at all.

### Discard

Nothing throwaway — `check_for_update` and this lesson's own real,
extended `get_db` are permanent; a real, older version file
(`pocket_hardware_v2.db`, once `v3` is current) is deliberately left in
place rather than deleted, exactly because a real reader might still
have it open — real, periodic cleanup of genuinely old versions is this
lesson's own honest, open exercise.

### Mechanical Walkthrough

- `latest_name = (SHARED_SOURCE_DIR / "latest.txt").read_text().strip()`
  — **(a) first appearance** of `Path`'s own real `read_text` method
  and `/`-based path joining (`pathlib`, Python's own real, standard,
  object-oriented path API) — genuinely new to this series, ordinary,
  real Python.
- `shutil.copy2(...)` — **(a) first appearance** of Python's own real,
  standard-library file-copy function, `copy2` specifically preserving
  real file metadata (timestamps) alongside content.
- `CURRENT_VERSION_FILE.write_text(latest_name)` — **(a) first
  appearance** of `Path.write_text`, the real, direct counterpart to
  `read_text` above.
- `db_path = CURRENT_VERSION_FILE.read_text().strip()` inside `get_db`
  — **(b) hard concept reappearing**, the identical real `read_text`
  call, now run fresh on every real request rather than once at
  startup.

### CS Lens

This is a real, direct instance of **copy-on-write publishing** with a
real, indirection layer — the same underlying shape a real symlink
swap uses to deploy a new software release without ever touching a
running process's own already-open files, or the way a real database's
own MVCC (multi-version concurrency control) keeps old row versions
alive for as long as a real, in-progress read might still need them,
rather than overwriting data a reader could be mid-way through
consuming.

Also recognized in: blue-green deployment (a real, second, complete
environment stood up alongside the live one, traffic switched only once
it's ready), a real package manager installing a new version alongside
the old and only then updating a `current` symlink, immutable
infrastructure generally — never mutate what's live; publish something
new, then repoint.

### SE Lens

The real, deliberate reason this lesson doesn't reach for `os.replace`
against the live file directly, despite it being a genuinely real,
atomic tool: its own real guarantee — no reader ever observes a
half-written file — says nothing at all about what happens to a reader
that already has the *old* file open when the rename occurs, and that
real answer, honestly, differs by real operating system and
filesystem, in ways this lesson cannot responsibly assert without
testing directly against your own real, exact deployment target. The
version-file pattern sidesteps that entire real question: nothing a
real reader has open is ever touched, renamed, or deleted at all, which
is a real, strictly stronger guarantee than atomic replacement alone
provides.

## Concept Unit: Watching for a New Version, Live

### The Problem

`check_for_update` works correctly when called — but a real, running
desktop app needs to call it on its own, periodically, and do something
real and visible the moment it finds a genuine change.

### Introduce the Concept in Isolation

A real, background watcher, combined directly with Lesson 56's own real
startup sequence:

```python
import threading
import time


def watch_for_updates(window):
    while True:
        time.sleep(30)
        if check_for_update():
            window.evaluate_js('$("#parts-table").DataTable().ajax.reload();')


def startup(window):
    threading.Thread(target=run_backend, daemon=True).start()
    wait_for_backend("http://127.0.0.1:8000/")
    check_for_update()
    window.load_url("index.html")
    threading.Thread(target=watch_for_updates, args=(window,), daemon=True).start()
```

Running this real, complete app: `check_for_update` runs once, real and
synchronous, before the window ever swaps to the real UI (Lesson 56's
own pattern, guaranteeing at least one real, valid local copy exists
before anything tries to query it) — then a real, separate, permanent
background thread checks again every real thirty seconds, for as long
as the app runs. The moment a genuinely new version appears at the real
shared source, `check_for_update` copies it locally, updates the real
pointer, and `window.evaluate_js` reaches directly into the
already-open, already-displayed real page and runs Lesson 41's own
familiar `ajax.reload()` — the identical real DataTables refresh a user
clicking a button would trigger, run here automatically, from Python,
with no user action at all.

### Discard

Nothing throwaway — `watch_for_updates` and its own real, thirty-second
polling interval are a permanent, real part of this project's own
startup sequence.

### Mechanical Walkthrough

- `while True: time.sleep(30); if check_for_update(): ...` — **(b)
  hard concept reappearing**, ordinary Python looping and
  already-used `time.sleep`; the real, deliberate infinite loop, inside
  its own real, `daemon=True` thread — **(b) hard concept reappearing**,
  Lesson 42's own real threading pattern.
- `window.evaluate_js('$("#parts-table").DataTable().ajax.reload();')`
  — **(a) first appearance**, full treatment above; the real string
  passed to it — **(b) hard concept reappearing**, Lesson 41's own
  already-explained `ajax.reload()` call, this time written as a real
  string of JavaScript rather than typed directly into a `<script>`
  tag.

### CS Lens

This is real, direct **polling** — the real, simplest, most portable
form of change detection, checking a real condition on a fixed
interval rather than being *pushed* a real, immediate notification the
instant something changes. A real, more sophisticated alternative (a
real, OS-level file-watcher, or a push-based WebSocket connection from
the backend) would notice a change faster; thirty real seconds of real,
worst-case latency is an honest, deliberate tradeoff for a
dramatically simpler, real, standard-library-only implementation.

### SE Lens

The real, concrete payoff this unit closes the loop on: a real user,
sitting in front of this project's own already-open window, sees new
data appear on its own, live, with zero action required — the exact,
real, direct answer to "I would like to just... watch for changes and
if there are changes update live," reusing every real piece this
series already built (`Depends(get_db)`'s own per-request freshness,
`ajax.reload()`, and this arc's own new `window.evaluate_js`) rather
than introducing a genuinely new, separate live-update mechanism from
scratch.

## Connect the pieces

One real, safe publishing pattern — never overwrite a file a reader
might have open; publish a new, uniquely-named one and repoint a real,
tiny pointer file instead — combined with one real, simple watcher,
polling that pointer every thirty real seconds and calling
`window.evaluate_js` the instant it changes. Together, they answer
every real piece of the original problem: a local replica that's safe
to update regardless of what a real user currently has open, and a live
UI that reflects a real, new version without asking anyone to restart
anything.

## What breaks without this

Reproduce the real danger this lesson's own first unit named, directly:
call `shutil.copy2(new_source, LOCAL_DATA_DIR / "pocket_hardware.db")`
— overwriting the exact, real, fixed filename a real, already-open
`sqlite3.Connection` in this same process currently has open — instead
of this lesson's own real, version-suffixed approach:

```python
shutil.copy2(new_source, LOCAL_DATA_DIR / "pocket_hardware.db")
row = conn.execute("SELECT * FROM parts WHERE id = 1").fetchone()
```

The real, honest, concrete risk: depending on your own real operating
system, filesystem, and exactly how far `shutil.copy2`'s own internal
write had progressed at the moment `conn`'s own query ran, this can
return correct old data, correct new data, or — the real, worst case —
a `sqlite3.DatabaseError: database disk image is malformed`, because
`conn` read a file genuinely caught mid-overwrite. This is not a
guaranteed failure every single time, which is exactly what makes it
dangerous: real, intermittent corruption, timing-dependent, is far
harder to notice and diagnose than a real, consistent one — the direct,
concrete reason this lesson's own version-file pattern never allows
this situation to occur at all.

## Exercises

1. Implement a real, simple cleanup step: once `current_version.txt`
   names a real, third generation, delete any local version file two or
   more generations behind it — a real, reasonable, safe assumption
   that nothing could still plausibly have a version that old open.
2. Replace this lesson's own thirty-second polling loop with a real,
   shorter interval during active development (five real seconds, say),
   and confirm, by publishing a real, new version to
   `SHARED_SOURCE_DIR` while the app is running, that the real, live
   table genuinely refreshes on its own within that window.

## Definition of Done

- [ ] You implemented `check_for_update`, confirming it never touches
      an already-published, real version file.
- [ ] You extended `get_db` to read the real, current pointer fresh, on
      every request.
- [ ] You wired a real, background watcher to `window.evaluate_js`,
      confirming a live table refresh with no restart.
- [ ] You can state, honestly, why this design avoids relying on
      `os.replace`'s own real but platform-uncertain behavior against
      an already-open destination.
- [ ] You completed both exercises.

## Next

[Lesson 60 — Composing Dynamic, Safe Joins](lesson-60-composing-dynamic-safe-joins.md)
closes this arc with a real, direct fix for a real, complex database's
own scattered, hand-written joins — the last of this arc's own,
originally-described real problems.
