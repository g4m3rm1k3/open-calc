# Lesson 15: The File Tree

**What you will build:** a real, working `POST /api/files/sync`
endpoint — reading every real, tracked file directly out of the
canonical repository, and correctly reflecting them into this
project's own real `files` table, safe to run again and again with no
real error.

**What you need to know first:** [Lesson 14](lesson-14-the-one-canonical-repository.md)
— the real, canonical repository this lesson reads from. [Lesson 03](lesson-03-sqlite-and-the-data-layer.md)
— `files_repository.py`'s own real, existing shape, extended here.

**Terms introduced in this lesson:** none new — **upsert** already has
full, real treatment from `sqlite-mastery`'s own Lesson 24; this lesson
applies it to a real, new, project-specific problem.

**Objects and methods used:**

**`Repo.git.ls_files()`**
- *What it is:* GitPython's own real, direct proxy (Lesson 13) for the
  real, standard `git ls-files` command.
- *Implementation:* `repo.git.ls_files()` returns a real, single,
  newline-separated string naming every real file git is currently
  tracking, relative to the repository's own root.
- *Its use:* the real, authoritative, ground-truth list of every file
  this project's own canonical repository actually manages.

---

## Concept Unit: Listing Every Real, Tracked File

### The Problem

The canonical repository (Lesson 14) already holds real, committed
files. Nothing yet lists them back out in a form this project's own
metadata layer can use.

### Introduce the Concept in Isolation

```python
# src/data/git_repo.py (extended)
def list_tracked_files(repo: Repo) -> list[str]:
    output = repo.git.ls_files()
    return output.splitlines() if output else []
```

```
$ python -c "
from src.data.git_repo import get_repo, list_tracked_files
print(list_tracked_files(get_repo()))
"
['.gitkeep', 'bracket-notes.txt']
```

A real, direct, authoritative list — exactly what `git` itself
considers tracked, with no real, separate bookkeeping this project has
to keep in sync by hand.

A real, pure, domain-layer function — Lesson 02's own real rule upheld
again — parsing each real, raw path into this project's own real file
metadata shape:

```python
# src/domain/file_sync.py
import os


def sync_file_tree(tracked_paths: list[str]) -> list[dict]:
    results = []
    for path in tracked_paths:
        if path == ".gitkeep":
            continue
        name = os.path.basename(path)
        _, ext = os.path.splitext(name)
        file_type = ext.lstrip(".")
        results.append({"path": path, "name": name, "file_type": file_type})
    return results
```

```
$ python -c "
from src.domain.file_sync import sync_file_tree
print(sync_file_tree(['.gitkeep', 'bracket-notes.txt']))
"
[{'path': 'bracket-notes.txt', 'name': 'bracket-notes.txt', 'file_type': 'txt'}]
```

A real, pure function, run in isolation, with no real git or SQL
dependency at all — `.gitkeep` (Lesson 14's own real, internal
bookkeeping file) correctly excluded, since it was never a real,
managed Forge file to begin with.

### Discard

Nothing throwaway — `list_tracked_files` and `sync_file_tree` are both
real and permanent.

### Mechanical Walkthrough

- `repo.git.ls_files()` — **(a) first appearance**, full treatment
  above.
- `output.splitlines()` — **(a) first appearance** of Python's own
  real, standard string method, splitting real, multi-line text into a
  real, ordinary list — genuinely new to this series, ordinary Python.
- `os.path.basename(path)` / `os.path.splitext(name)` — **(a) first
  appearance** of these two real, standard-library path functions,
  extracting a real file's own name and extension from a real, full
  path.

### CS Lens

Treating `git ls-files`'s own real, live output as the one, real,
authoritative source of truth — rather than a real, separate list this
project maintains independently — is a direct, concrete application of
`sqlite-mastery`'s own already-proven **single source of truth**
principle, applied here to a real filesystem-backed tool instead of a
database view.

### SE Lens

The real, deliberate reason `sync_file_tree` stays a real, pure domain
function, accepting a plain, real list of paths rather than a real
`Repo` object directly: Lesson 02's own rule, upheld once more — this
real parsing logic needs no real git dependency at all, and keeping it
that way means it can be tested, and trusted, with nothing more than a
real, plain Python list.

## Concept Unit: Syncing Into `files`, Safely, Repeatedly

### The Problem

A real sync needs to run more than once — new real files get added to
the canonical repository over this project's own real lifetime. Does a
plain, real `INSERT` handle that correctly?

### Introduce the Concept in Isolation

The real, naive version, first, to prove the real problem directly:

```python
def upsert_file_naive(conn, path: str, name: str, file_type: str) -> None:
    conn.execute(
        "INSERT INTO files (path, name, file_type) VALUES (?, ?, ?)",
        (path, name, file_type),
    )
    conn.commit()
```

```
$ python -c "
import sqlite3
from src.data.database import get_db
conn = next(get_db())
from src.domain.file_sync import sync_file_tree
from src.data.git_repo import get_repo, list_tracked_files
for f in sync_file_tree(list_tracked_files(get_repo())):
    from src.data.files_repository import upsert_file_naive
    upsert_file_naive(conn, f['path'], f['name'], f['file_type'])
    upsert_file_naive(conn, f['path'], f['name'], f['file_type'])
"
sqlite3.IntegrityError: UNIQUE constraint failed: files.path
```

A real, genuine failure — `files.path` is real, `UNIQUE` (Lesson 05's
own migration), and a plain `INSERT`, run a second real time for a file
already synced once, collides with it directly. The real, correct fix
— a real, genuine upsert:

```python
# src/data/files_repository.py (corrected)
def upsert_file(conn, path: str, name: str, file_type: str) -> None:
    conn.execute(
        """
        INSERT INTO files (path, name, file_type) VALUES (?, ?, ?)
        ON CONFLICT(path) DO UPDATE SET name = excluded.name, file_type = excluded.file_type
        """,
        (path, name, file_type),
    )
    conn.commit()
```

Wired into a real, complete, working endpoint:

```python
# src/api/files.py (extended)
from src.data.files_repository import upsert_file
from src.data.git_repo import get_repo, list_tracked_files
from src.domain.file_sync import sync_file_tree


@router.post("/api/files/sync")
def sync_files(db=Depends(get_db), current_user=Depends(get_current_user)):
    repo = get_repo()
    tracked = list_tracked_files(repo)
    parsed = sync_file_tree(tracked)
    for f in parsed:
        upsert_file(db, f["path"], f["name"], f["file_type"])
    return {"synced": len(parsed)}
```

```
$ curl -X POST --cookie "session_token=..." http://127.0.0.1:8000/api/files/sync
{"synced":1}
$ curl -X POST --cookie "session_token=..." http://127.0.0.1:8000/api/files/sync
{"synced":1}
```

Run twice, in direct real succession — no error either time, exactly
the real, correct, repeatable behavior a real sync operation needs.

### Discard

`upsert_file_naive` is real, disposable proof of the real problem —
never a permanent part of this project; `upsert_file`, the real,
corrected version, replaces it entirely.

### Mechanical Walkthrough

- `INSERT INTO files (...) VALUES (...) ON CONFLICT(path) DO UPDATE SET
  name = excluded.name, file_type = excluded.file_type` — **(a) first
  appearance** of SQLite's own real `ON CONFLICT ... DO UPDATE` upsert
  syntax; `excluded` — **(a) first appearance** of this real, special,
  built-in table alias, referring to the exact row this same statement
  was attempting to insert when the real conflict occurred.

### CS Lens

This real upsert is a direct, concrete instance of **idempotent
synchronization**: running `sync_files` once, or a real hundred times
in a row, against an unchanged real repository, always produces the
identical, real, correct end state — the same underlying real property
`sqlite-mastery`'s own migration runner (Lesson 24) already proved,
applied here to real, ongoing file-tree synchronization instead of a
one-time schema change.

### SE Lens

The real, deliberate reason this endpoint is a real `POST`, triggered
explicitly, rather than something run automatically on every real
request: syncing genuinely does real, repeated work — walking every
real, tracked file — and this project's own real, later lessons
(checkout, check-in) are exactly the real moments a fresh sync
actually matters, not every single, unrelated request in between.

## Connect the pieces

`list_tracked_files`, reading directly from the canonical repository
via GitPython's own real `git` proxy, gave this project a real,
authoritative list of every file it actually manages. `sync_file_tree`,
a real, pure domain function, parsed each one into this project's own
real metadata shape. `upsert_file`, a real, genuine SQL upsert, then
proved safe to run any real number of times — confirmed directly
against the real `UNIQUE` failure a plain `INSERT` alone would have
caused the second time.

## What breaks without this

Not applicable beyond this lesson's own second unit, which is itself
this lesson's real, concrete proof — the real `UNIQUE constraint
failed: files.path` error, caused deliberately by the naive version,
*is* this lesson's own "what breaks" demonstration.

## Exercises

1. Add a real, second file to the canonical repository directly (a
   real, new commit, following Lesson 14's own `commit_file_change`),
   run `POST /api/files/sync` again, and confirm `GET /api/files`
   (Lesson 03) now shows both real, tracked files correctly.
2. Confirm, directly, that re-running `POST /api/files/sync` after
   *removing* a real, tracked file from the repository does **not**
   remove its own, now-stale row from `files` — write a real, short
   explanation of why (`upsert_file` only ever inserts or updates,
   never deletes), and state what a real, correct fix would need to do
   instead.

## Definition of Done

- [ ] You listed every real, tracked file directly from the canonical
      repository using `repo.git.ls_files()`.
- [ ] You built a real, pure domain function parsing tracked paths into
      file metadata.
- [ ] You caused the real `UNIQUE constraint failed` error from a naive
      `INSERT`, then fixed it with a real, genuine SQL upsert.
- [ ] You confirmed `POST /api/files/sync` is safe to call repeatedly.
- [ ] You completed both exercises.

## Next

[Lesson 16 — Error Handling and Loading States](lesson-16-error-handling-and-loading-states.md)
closes Phase 3 by giving every real API call this project has built so
far — and every one Phase 4 is about to add — a real, honest, visible
state for exactly what's happening, at every real moment.
