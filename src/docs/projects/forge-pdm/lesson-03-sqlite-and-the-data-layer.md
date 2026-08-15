# Lesson 03: SQLite and the Data Layer

**What you will build:** `src/data/`'s own real, first content — a
real, working SQLite connection dependency and a real repository module
for `files`, reusing `sqlite-mastery`'s own already-proven repository
pattern directly, rather than re-deriving it from nothing.

**What you need to know first:** [Lesson 02](lesson-02-the-domain-layer-for-real.md)
— the real domain/API boundary this lesson's own data layer sits
underneath. `sqlite-mastery`'s own [Lesson 22](../sqlite-mastery/lesson-22-a-repository-pattern-in-python.md)
(the repository pattern itself) and [Lesson 31](../sqlite-mastery/lesson-31-a-real-database-dependency.md)
(`Depends(get_db)`) — both reused directly, by name, not re-taught.

**Terms introduced in this lesson:** none new — this lesson applies
`sqlite-mastery`'s own already-explained repository pattern and
`Depends(get_db)` shape to this project's own real, first table.

**Objects and methods used:** none new — `sqlite3.connect`, `Depends`,
and the repository-function shape are all reused unchanged from
`sqlite-mastery`.

---

## Concept Unit: A Real `files` Table, and Its Own Real Repository

### The Problem

`src/data/` is real and empty. This project's own real, first table —
`files`, one real row per file Forge manages — needs a real home, and
Lesson 01's own rule says every real query touching it belongs in
exactly one, real, dedicated place.

### Introduce the Concept in Isolation

```python
# src/data/database.py
import sqlite3

DB_PATH = "forge.db"


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY,
            path TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            file_type TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
    finally:
        conn.close()
```

`get_db` is the identical real, `Depends`-ready shape `sqlite-mastery`'s
own Lesson 31 already proved — one real connection per request,
correctly configured, automatically closed. `init_db`, this lesson's
own real, deliberate stand-in for a genuine migration (Lesson 05's own
subject), gets `files` into real existence for now.

A real, first, dedicated repository module — every real query against
`files`, and nowhere else:

```python
# src/data/files_repository.py
def create_file(conn, path: str, name: str, file_type: str) -> int:
    cursor = conn.execute(
        "INSERT INTO files (path, name, file_type) VALUES (?, ?, ?)",
        (path, name, file_type),
    )
    conn.commit()
    return cursor.lastrowid


def get_file_by_path(conn, path: str):
    return conn.execute("SELECT * FROM files WHERE path = ?", (path,)).fetchone()


def list_files(conn):
    return conn.execute("SELECT * FROM files ORDER BY path").fetchall()
```

Wired through a real, new route:

```python
# src/api/files.py (extended)
from fastapi import Depends

from src.data.database import get_db
from src.data.files_repository import create_file, list_files


@router.post("/api/files")
def add_file(path: str, name: str, file_type: str, db=Depends(get_db)):
    file_id = create_file(db, path, name, file_type)
    return {"id": file_id, "path": path, "name": name, "file_type": file_type}


@router.get("/api/files")
def get_files(db=Depends(get_db)):
    return [dict(row) for row in list_files(db)]
```

```
$ curl -X POST "http://127.0.0.1:8000/api/files?path=parts/bracket.sldprt&name=bracket.sldprt&file_type=sldprt"
{"id":1,"path":"parts/bracket.sldprt","name":"bracket.sldprt","file_type":"sldprt"}
$ curl http://127.0.0.1:8000/api/files
[{"id":1,"path":"parts/bracket.sldprt","name":"bracket.sldprt","file_type":"sldprt"}]
```

### Discard

Nothing throwaway — `database.py`, `files_repository.py`, and the real,
extended `files.py` route module are all permanent.

### Mechanical Walkthrough

- `def get_db(): conn = sqlite3.connect(DB_PATH); conn.row_factory =
  sqlite3.Row; ...; try: yield conn; finally: conn.close()` — **(b)
  hard concept reappearing**, `sqlite-mastery` Lesson 31, in full,
  unchanged.
- `def create_file(conn, path, name, file_type): cursor =
  conn.execute("INSERT INTO files (...) VALUES (?, ?, ?)", (...));
  conn.commit(); return cursor.lastrowid` — **(b) hard concept
  reappearing** throughout: parameterized `INSERT` (`sqlite-mastery`
  Lesson 18), `cursor.lastrowid` (Lesson 33), all unchanged.
- `db=Depends(get_db)` on `add_file`/`get_files` — **(b) hard concept
  reappearing**, `sqlite-mastery` Lesson 31's own real shape, applied
  to this project's own new endpoints.

### CS Lens

Confining every real query against `files` to `files_repository.py`
alone is the identical real **repository pattern** `sqlite-mastery`
Lesson 22 already proved directly: real callers depend on *what*
operation happens (`create_file`, `list_files`), never on the raw SQL
or connection details making it happen.

### SE Lens

The real, deliberate reason this lesson reuses `sqlite-mastery`'s own
pattern verbatim rather than inventing a new one: this project's own
real domain — file metadata, later locks, later versions — is
genuinely the same *kind* of problem `sqlite-mastery` already solved
completely; re-deriving an equivalent pattern from scratch here would
teach nothing new and risk a real, subtly different, worse design for
no real reason.

## Concept Unit: Why Raw SQL Never Leaves `src/data/`

### The Problem

Nothing in Python stops a real route, or a real domain function, from
calling `conn.execute(...)` directly instead of going through
`files_repository.py`. What does skipping the repository actually
cost?

### Introduce the Concept in Isolation

A real, tempting shortcut — a real, second route, written to skip the
repository "just this once," for a query the repository doesn't
happen to have yet:

```python
@router.get("/api/files/count")
def count_files(db=Depends(get_db)):
    row = db.execute("SELECT COUNT(*) AS n FROM files").fetchone()
    return {"count": row["n"]}
```

This real route works correctly. The real, concrete cost surfaces the
first time `files`' own real schema changes — Lesson 05's own real
migrations add a `checked_out` derived concept later, and a real,
future lesson needs every real query against `files` to also exclude
soft-deleted rows (a real, plausible, later requirement). Every real
query written directly inside a route, like `count_files`'s own, has to
be found and updated by hand, one real call site at a time; every real
query living inside `files_repository.py` gets fixed once, in one real
place, and every real caller is correct automatically.

### Discard

`count_files`, exactly as written above, is real, disposable proof of
the real shortcut's own cost — the real, permanent version belongs in
`files_repository.py` instead, as this unit's own exercise.

### Mechanical Walkthrough

- `db.execute("SELECT COUNT(*) AS n FROM files").fetchone()` directly
  inside a real route — **(b) hard concept reappearing** for the SQL
  itself (`sqlite-mastery` Lesson 10's own `COUNT(*)`); its real
  *location*, outside `files_repository.py`, is this unit's own point.

### CS Lens

This is the identical real risk Lesson 02 already proved for a
domain-layer boundary violation, one layer over: a **leaky
abstraction**, where a real implementation detail (raw SQL) escapes
the one, real, intended boundary (`src/data/`) into a layer that was
never meant to hold it.

### SE Lens

The real, honest rule this project commits to from here: if a real
query doesn't yet exist in the appropriate repository module, it gets
*added there*, not written inline at the call site "just this once" —
the identical real discipline `sqlite-mastery`'s own Lesson 22 already
proved pays for itself the first time a query needs to change in more
than one place at once.

## Connect the pieces

`get_db` and `files_repository.py`, reusing `sqlite-mastery`'s own
already-proven shapes directly, gave this project's own first real
table a real, single, correct home — every query behind a named
function, every route calling those functions instead of raw SQL. A
real, deliberate shortcut then proved, concretely, why that discipline
matters: a query written inline works today and becomes real, scattered
maintenance debt the moment `files`' own schema changes underneath it.

## What breaks without this

Not applicable beyond this lesson's own second unit, which is itself
this lesson's real, concrete proof — `count_files`'s own inline query
is real, working code that nonetheless already violates this project's
own stated rule, the exact real gap Exercise 1 closes.

## Exercises

1. Move `count_files`'s own query into `files_repository.py` as a real
   `count_files(conn)` function, and update the route to call it —
   confirm the real, identical response.
2. Add a real `delete_file(conn, path: str) -> None` function to
   `files_repository.py`, and a real `DELETE /api/files` route using
   it, following this lesson's own exact pattern throughout.

## Definition of Done

- [ ] You created the real `files` table and a real repository module
      for it, reusing `sqlite-mastery`'s own proven shape.
- [ ] You wired real `POST`/`GET` routes through `Depends(get_db)` and
      the repository, confirmed with real requests.
- [ ] You identified this lesson's own real, inline-SQL shortcut and
      can state precisely what it costs later.
- [ ] You completed both exercises.

## Next

[Lesson 04 — The Domain Types](lesson-04-the-domain-types.md) gives
`File`, `User`, and `Lock` their own real, shared shape — read as a
plain `sqlite3.Row` today, but about to be passed between every layer
this project has built so far.
