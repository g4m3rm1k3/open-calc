# Lesson 05: Schema Migrations

**What you will build:** a real, versioned migration runner — reusing
`sqlite-mastery`'s own proven pattern directly — replacing Lesson 03's
own ad-hoc `init_db()`, plus this project's own real, first migrations
for `files`, and two real tables Phase 2 and Phase 4 will need soon:
`users` and `locks`.

**What you need to know first:** [Lesson 03](lesson-03-sqlite-and-the-data-layer.md)
— `init_db()`'s own real, un-tracked `CREATE TABLE IF NOT EXISTS`, this
lesson's own direct replacement. `sqlite-mastery`'s own [Lesson 24](../sqlite-mastery/lesson-24-hand-rolled-schema-migrations.md)
— the real migration runner reused verbatim below.

**Terms introduced in this lesson:** none new — `sqlite-mastery`
Lesson 24 already gave **migration**, **migration runner**, and
**idempotent** full treatment; this lesson applies that exact,
already-explained system to this project's own real schema.

**Objects and methods used:** none new.

---

## Concept Unit: The Real Migration Runner, Reused Directly

### The Problem

`init_db()` (Lesson 03) creates `files` correctly, but has no real
record of what it already did, and no real way to add a second table
without either editing that same function by hand (real, working, on
one real machine, unverifiable everywhere else) or risking a real
"table already exists" error the moment it runs twice.

### Introduce the Concept in Isolation

The identical real system `sqlite-mastery` Lesson 24 already proved
correct, applied here without modification:

```python
# src/data/migrations.py
from datetime import datetime, timezone

MIGRATIONS = [
    (1, "create files table",
     """CREATE TABLE files (
            id INTEGER PRIMARY KEY,
            path TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            file_type TEXT NOT NULL
        )"""),
]


def applied_versions(conn):
    rows = conn.execute("SELECT version FROM schema_migrations").fetchall()
    return {row[0] for row in rows}


def run_migrations(conn):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY,
            applied_at TEXT NOT NULL
        )
    """)
    done = applied_versions(conn)
    for version, description, sql in MIGRATIONS:
        if version in done:
            continue
        with conn:
            conn.execute(sql)
            conn.execute(
                "INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)",
                (version, datetime.now(timezone.utc).isoformat()),
            )
        print(f"Applied migration {version}: {description}")
```

```
$ python -c "import sqlite3; from src.data.migrations import run_migrations; run_migrations(sqlite3.connect('forge.db'))"
Applied migration 1: create files table
```

`init_db()` is deleted entirely — `run_migrations`, called once at real
startup (this lesson's own second unit wires that in), is now this
project's own only real way `files` ever comes into existence.

### Discard

`init_db()` itself is disposable — deleted from `src/data/database.py`,
never called again; `run_migrations` is real and permanent.

### Mechanical Walkthrough

Every real line here is **(b) hard concept reappearing** — `sqlite-
mastery` Lesson 24 already gave `MIGRATIONS`, `applied_versions`,
`run_migrations`, the real `schema_migrations` table, and the real
`with conn:`-wrapped apply-and-record step full, first-appearance
treatment; nothing here is new syntax, only a new, real, project-
specific `MIGRATIONS` list.

### CS Lens

Reused directly from `sqlite-mastery` Lesson 24: a real **log of
applied operations** — a durable, ordered record of what has already
happened, so this project can always determine its own current, real
schema state without guessing or re-deriving it.

### SE Lens

The real, deliberate reason this lesson doesn't design a new migration
system: this project's own real schema-versioning problem is *exactly*
the one `sqlite-mastery` Lesson 24 already solved — inventing a second,
differently-shaped system here would be real, wasted effort, and a
real, unjustified departure from a pattern already proven correct.

## Concept Unit: Real Migrations for `users` and `locks`

### The Problem

Phase 2's own real authentication work, and Phase 4's own real
checkout logic, both need real tables that don't exist yet. Adding them
now, as real, ordered migrations, means every later lesson can assume
they're already there.

### Introduce the Concept in Isolation

```python
MIGRATIONS = [
    (1, "create files table",
     """CREATE TABLE files (
            id INTEGER PRIMARY KEY,
            path TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            file_type TEXT NOT NULL
        )"""),
    (2, "create users table",
     """CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            display_name TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )"""),
    (3, "create locks table",
     """CREATE TABLE locks (
            id INTEGER PRIMARY KEY,
            file_id INTEGER NOT NULL UNIQUE REFERENCES files(id),
            user_id INTEGER NOT NULL REFERENCES users(id),
            checked_out_at TEXT NOT NULL DEFAULT (datetime('now'))
        )"""),
]
```

```
$ python -c "import sqlite3; from src.data.migrations import run_migrations; run_migrations(sqlite3.connect('forge.db'))"
Applied migration 2: create users table
Applied migration 3: create locks table
```

Only migrations `2` and `3` ran — `1` was already recorded as applied
from this lesson's own first unit, proving the runner's own real
idempotency directly, exactly as `sqlite-mastery` Lesson 24 already
demonstrated.

`locks.file_id UNIQUE` is this lesson's own first, real, structural
enforcement of this whole project's own central rule, stated in real
SQL rather than only in prose: at most one real lock row can ever exist
per real file — a real, genuine database constraint (`sqlite-mastery`
Lesson 07's own `UNIQUE`), not merely application-level intent, laying
the real, structural groundwork Phase 4's own atomic-locking lessons
build directly on top of.

### Discard

Nothing throwaway — all three real migrations are permanent.

### Mechanical Walkthrough

- `role TEXT NOT NULL DEFAULT 'user'` — **(b) hard concept
  reappearing**, `sqlite-mastery` Lesson 07's own `NOT NULL`/`DEFAULT`,
  unchanged; the real, specific value set this column is limited to in
  practice (`'user'`, `'admin'`, `'super_admin'`) is Lesson 11's own
  real, enforced subject, not yet constrained at the schema level here.
- `file_id INTEGER NOT NULL UNIQUE REFERENCES files(id)` — **(b) hard
  concept reappearing** for `NOT NULL`/`REFERENCES` (`sqlite-mastery`
  Lessons 07–08); `UNIQUE` applied to a real foreign-key column
  specifically — **(a) first appearance** of this exact, real
  combination: not merely "every value in this column is distinct,"
  but "no real file can ever have more than one real lock row," a real,
  structural fact this project's own central problem depends on
  directly.

### CS Lens

`locks.file_id UNIQUE` is a real, direct instance of encoding a real
business invariant *structurally*, inside the schema itself, rather
than only inside application code that could forget to check it — the
identical real principle `sqlite-mastery` Lesson 07 already proved for
`CHECK` constraints, applied here to a real, load-bearing uniqueness
rule instead.

### SE Lens

The real, deliberate reason this constraint is added now, three real
phases before Phase 4 actually uses it: a real, structural guarantee
present from the moment `locks` exists is strictly safer than one added
later, after real, incorrect data might already exist — the identical
real lesson `sqlite-mastery`'s own Lesson 49 already proved the hard
way, needing a real, twelve-step rebuild specifically because a
constraint wasn't there from the start.

## Connect the pieces

`sqlite-mastery`'s own real migration runner, reused without
modification, replaced Lesson 03's own ad-hoc table creation with a
real, versioned, idempotent system — proven directly by applying
migration `1` once, then two real, new ones (`users`, `locks`) without
ever re-running the first. `locks.file_id UNIQUE` gave this project's
own central rule — one lock per file, always — a real, structural
guarantee, three phases before it's actually exercised.

## What breaks without this

Attempt to insert two real lock rows for the identical real file
directly, proving the real constraint is genuinely enforced, not merely
declared:

```
$ sqlite3 forge.db "INSERT INTO users (username, password_hash, display_name) VALUES ('alice', 'x', 'Alice');"
$ sqlite3 forge.db "INSERT INTO files (path, name, file_type) VALUES ('parts/bracket.sldprt', 'bracket.sldprt', 'sldprt');"
$ sqlite3 forge.db "INSERT INTO locks (file_id, user_id) VALUES (1, 1);"
$ sqlite3 forge.db "INSERT INTO locks (file_id, user_id) VALUES (1, 1);"
Runtime error: UNIQUE constraint failed: locks.file_id
```

A real, immediate rejection — the identical real `UNIQUE` failure
`sqlite-mastery` Lesson 07 already proved directly, now protecting this
project's own real, central invariant three phases before any real
application code exercises it.

## Exercises

1. Add a real, fourth migration creating `versions` (Phase 4's own real
   table: `id`, `file_id`, `commit_hash`, `message`, `user_id`,
   `created_at`), anticipating Lesson 23 the same way this lesson's own
   `locks` anticipated Phase 4.
2. Confirm, directly, that running `run_migrations` a third time —
   after all four are already applied — produces no real output at
   all, the identical real idempotency proof `sqlite-mastery` Lesson 24
   already established.

## Definition of Done

- [ ] You replaced `init_db()` with the real, versioned migration
      runner.
- [ ] You added real migrations for `users` and `locks`, confirming
      only the new ones ran.
- [ ] You caused the real `UNIQUE constraint failed: locks.file_id`
      error and understand exactly what real invariant it protects.
- [ ] You completed both exercises.

## Next

[Lesson 06 — The Complete Skeleton](lesson-06-the-complete-skeleton.md)
closes Phase 1 by wiring every layer built so far into one real,
working request, and marks this project's own first, real Definition
of Done at the scale of a whole phase.
