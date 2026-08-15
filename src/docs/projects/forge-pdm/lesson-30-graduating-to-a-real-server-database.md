# Lesson 30: Graduating to a Real Server Database

**What you will build:** direct, concrete proof that this project's
own real, disciplined repository pattern — upheld since Lesson 03 —
makes migrating from SQLite to a real, production SQL Server database
a real, small, contained change, not a rewrite — reusing `sqlite-
mastery`'s own Arc 9 directly, rather than re-deriving it.

**What you need to know first:** [Lesson 03](lesson-03-sqlite-and-the-data-layer.md)
— every real query this project has ever written, confined to
`src/data/`, exactly as this lesson depends on. `sqlite-mastery`'s own
[Lesson 62](../sqlite-mastery/lesson-62-connecting-to-a-real-enterprise-server-database.md)
(`pyodbc`, real connection strings) and [Lesson 64](../sqlite-mastery/lesson-64-the-backend-in-the-middle-architecture.md)
(the real case for never connecting a client directly) — both reused
directly.

**Terms introduced in this lesson:** none new.

**Objects and methods used:** none new — this lesson reuses
`sqlite-mastery`'s own real `pyodbc` connection pattern verbatim.

---

## Concept Unit: What Actually Has to Change

### The Problem

This project's own README has promised, since its very first line,
that this series ends with a real, deliberate migration to a real,
production database. What, concretely, does that migration actually
touch?

### Introduce the Concept in Isolation

Every real query this project has ever written lives inside
`src/data/` — `files_repository.py`, `locks_repository.py`,
`users_repository.py`, and the rest — confined there by Lesson 03's
own real, upheld rule, checked and re-checked, deliberately, at every
later lesson. The real, concrete consequence, provable directly:

```
$ grep -rl "conn.execute\|cursor.execute" src/api/ src/domain/
```

```
(no output)
```

Not one real API route, and not one real domain function, anywhere in
this entire project, contains a single, real, raw SQL call — every one
of them, without exception, calls a real, named repository function
instead. This is the real, concrete payoff Lesson 03's own SE Lens
already promised: a real migration's own actual, real scope is
confined entirely to `src/data/` — nowhere else.

`get_db` (Lesson 03), reusing `sqlite-mastery` Lesson 62's own real
pattern directly:

```python
# src/data/database.py (revised)
import os

import pyodbc
from dotenv import load_dotenv

load_dotenv()


def get_db():
    conn = pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        f"SERVER={os.environ['DB_SERVER']};"
        f"DATABASE={os.environ['DB_NAME']};"
        f"UID={os.environ['DB_USER']};"
        f"PWD={os.environ['DB_PASSWORD']};"
    )
    try:
        yield conn
    finally:
        conn.close()
```

Every real endpoint already calling `Depends(get_db)` — every one,
across every real phase of this project — requires zero, real changes
at all; `pyodbc`'s own real connection exposes the identical, real
`execute`/`fetchall` shape `sqlite3` always has, `sqlite-mastery`
Lesson 62's own real DB-API promise, proven true a second time, here,
for this project's own real, complete application.

### Discard

Nothing throwaway — every real piece here is a genuine, direct part of
this project's own real migration path.

### Mechanical Walkthrough

- `grep -rl "conn.execute\|cursor.execute" src/api/ src/domain/` —
  **(a) first appearance** of this real, direct, structural proof
  technique: searching this project's own real source for the one,
  specific pattern that would indicate a real, rule-breaking SQL call
  outside `src/data/` — and finding none.
- `get_db` — **(b) hard concept reappearing**, `sqlite-mastery` Lesson
  62's own real `pyodbc.connect` pattern, applied here verbatim.

### CS Lens

This is real, direct, structural proof of what Lesson 02's own domain-
layer boundary, and Lesson 03's own repository pattern, were always
*for*: not abstract discipline for its own sake, but a real,
deliberate reduction of this project's own real "blast radius" for
exactly this one, real, eventual, significant change.

### SE Lens

The real, honest, concrete contrast this project's own real, existing
application already lives: a real, hand-built system with SQL, or
git operations, or both, scattered across however many real, separate
places they happened to be needed, has no real, equivalent version of
this lesson's own `grep` proof available to it at all — a real
migration there means finding every real, scattered occurrence by
hand, with no real, structural guarantee any of them were actually
found.

## Concept Unit: What Still Needs Real, Deliberate Attention

### The Problem

Does every real piece of this project migrate this cleanly, or are
there real, honest exceptions?

### Introduce the Concept in Isolation

A real, direct migration of `files`' own schema — genuinely different,
real SQL syntax, not merely a different real connection:

```sql
-- SQLite (original)
CREATE TABLE files (
    id INTEGER PRIMARY KEY,
    path TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    file_type TEXT NOT NULL
)
```

```sql
-- SQL Server (real, migrated)
CREATE TABLE files (
    id INT IDENTITY(1,1) PRIMARY KEY,
    path NVARCHAR(500) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    file_type NVARCHAR(50) NOT NULL
)
```

`INTEGER PRIMARY KEY`'s own real `rowid`-aliasing behavior
(`sqlite-mastery` Lesson 02) has no direct SQL Server equivalent at
all — `IDENTITY(1,1)` is a real, genuinely different, if conceptually
related, mechanism. Real `TEXT` becomes a real, explicitly-sized
`NVARCHAR`, since SQL Server has no real, single, unbounded text type
used this casually.

Two, real, further, honest exceptions, named directly rather than
glossed over: this project's own real FTS5 search (Lesson 26) and its
own real, SQLite-specific triggers (Lessons 15, 19, 26–28) have no
direct, real, drop-in SQL Server equivalent — SQL Server's own real
full-text search, and its own real trigger syntax, are genuinely
different mechanisms, each requiring its own, real, deliberate
migration, not a mechanical, one-line change.

### Discard

Nothing throwaway — this real, honest accounting of what does and does
not migrate cleanly is permanent, real knowledge for this project's own
eventual, real migration work.

### Mechanical Walkthrough

- `id INT IDENTITY(1,1) PRIMARY KEY` — **(a) first appearance** of SQL
  Server's own real `IDENTITY` syntax — a real, genuinely different
  mechanism from SQLite's own `rowid`-aliasing `INTEGER PRIMARY KEY`,
  worth knowing precisely rather than assumed equivalent.
- `path NVARCHAR(500) NOT NULL UNIQUE` — **(a) first appearance** of
  SQL Server's own real `NVARCHAR(n)` type — real, explicitly sized,
  unlike SQLite's own real, unbounded `TEXT` (`sqlite-mastery` Lesson
  02's own real type-affinity system).

### CS Lens

Naming exactly which real pieces migrate mechanically (ordinary
`SELECT`/`INSERT`, behind a real repository function) and which do not
(engine-specific full-text search, engine-specific triggers) is a real,
direct instance of **honest scoping**: knowing precisely where a real,
general principle's own real coverage actually ends is as valuable as
the principle itself.

### SE Lens

The real, complete, honest conclusion this entire series closes on:
this project's own real, disciplined architecture — four, real, clean
layers, a real repository pattern, real, atomic transactions, real,
enforced authorization — was never built for its own sake. It was
built so that this exact, real, final, promised step — moving off
SQLite, onto a real, production, IT-owned database — is a real,
contained, well-understood, honest piece of work, rather than the kind
of undertaking that turned this project's own real, existing
application into something no one could safely read, debug, or extend
at all.

## Connect the pieces

A real, direct, structural search proved this project's own repository
pattern (Lesson 03) confined every real SQL call to exactly one, real
place — `get_db`, revised to use `pyodbc` (reusing `sqlite-mastery`
Lesson 62 directly), required zero changes anywhere else. A real,
honest accounting then named exactly what still needs real, deliberate,
manual attention — schema syntax, FTS5, triggers — closing this project
with the same real discipline it opened with: never assert something
migrates cleanly without checking, and never hide a real, remaining gap
behind confident-sounding prose.

## What breaks without this

Not applicable in this lesson's own usual sense — this lesson's own,
real, honest accounting of what does *not* migrate cleanly already is
the real, deliberate proof this closing lesson exists to give, rather
than a mistake to cause and fix.

## Exercises

1. Migrate `locks` and `users`, following this lesson's own exact,
   real pattern — real, explicit `NVARCHAR`/`INT IDENTITY` types, and
   confirm every real repository function in `locks_repository.py`/
   `users_repository.py` still works, entirely unchanged.
2. Research SQL Server's own real, standard trigger syntax
   (`CREATE TRIGGER ... ON ... AFTER INSERT AS ...`), and rewrite one,
   real trigger from this project — `trg_files_fts_insert` (Lesson 26)
   is a real, honest, deliberately hard case, given SQL Server's own
   real, genuinely different full-text search model; a simpler,
   real, worthwhile target instead is Lesson 27's own real, bundled
   audit-logging pattern, expressed as ordinary, sequential Python
   calls within one, real, explicit SQL Server transaction instead.

## Definition of Done — Phase 6 Complete

- [ ] You confirmed, directly, that no real SQL call exists anywhere
      outside `src/data/`.
- [ ] You migrated `get_db` to `pyodbc`, confirming every existing
      endpoint works unchanged.
- [ ] You migrated `files`' own real schema to SQL Server syntax,
      naming the real, specific differences directly.
- [ ] You named, honestly, which real pieces of this project do not
      migrate mechanically, and why.
- [ ] You completed both exercises.

## Series complete

Thirty lessons, six phases, and Forge — built in the identical, real
stack as this project's own actual, existing application — now proves,
completely and directly, the exact fix its own central, real bug
needed: a real, layered architecture; real, enforced identity and
authorization; exactly one, real, canonical git repository, reached
only through `Depends(get_db)`-style backend code, never a second,
independent clone; a real, atomic, database-enforced lock, proven
correct under genuine, concurrent load; real, permanent version
history; and, finally, a real, honest, well-scoped path off SQLite
entirely, the moment this project's own real growth genuinely needs it.
Nothing here was invented for its own sake — every real piece traces
directly back to a real, specific, named problem this project's own
actual, real, existing application still has today. Jump back to any
lesson by topic via this series' own [README](README.md) as you work
through fixing it for real.
