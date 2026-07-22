# Concept: Database Migrations

**What you'll understand by the end:** why `CREATE TABLE IF NOT EXISTS` isn't enough once a real schema needs to change after real data already exists, and how a migration tool solves that safely.

**Prerequisites:** `sql-create-table-and-schema.md`.

## Setup

Python 3, plus a real migration tool for demonstrating the concept:
```
pip install alembic sqlalchemy
```

## The Problem

`CREATE TABLE IF NOT EXISTS` correctly creates a table the first time, and safely does nothing on every later run — but it has no way to *change* a table that already exists and already has real, valuable data in it. Adding a new required column, renaming one, or changing a type on a table that already has a thousand real rows needs a real, careful, repeatable procedure — not a statement that only ever handles "doesn't exist yet."

## The Isolated Example

The problem, concretely:
```python
import sqlite3
connection = sqlite3.connect(":memory:")
connection.execute("CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT)")
connection.execute("INSERT INTO tools (name) VALUES ('end_mill_4fl')")
connection.commit()

# Running the *same* CREATE TABLE again, now wanting an extra column:
connection.execute("""
    CREATE TABLE IF NOT EXISTS tools (
        id INTEGER PRIMARY KEY, name TEXT, material TEXT
    )
""")
connection.commit()

columns = [row[1] for row in connection.execute("PRAGMA table_info(tools)")]
print(columns)
```

**Real output:**
```
['id', 'name']
```

**What this proves:** `material` never actually got added — `IF NOT EXISTS` saw the table already existed and did nothing at all, silently ignoring the new column entirely. The existing table, and the real row already in it, were left completely untouched by the "updated" schema — a real, structural limitation, not a bug.

**The real fix — a migration statement, applied once, explicitly:**
```python
connection.execute("ALTER TABLE tools ADD COLUMN material TEXT")
connection.commit()
columns = [row[1] for row in connection.execute("PRAGMA table_info(tools)")]
print(columns)
```
**Real output:**
```
['id', 'name', 'material']
```

## Mechanical Walkthrough

- A **migration** is a real, individually-named, ordered change to a database's schema — `ALTER TABLE tools ADD COLUMN material TEXT`, in this simple case — recorded as its own discrete step, separate from the original `CREATE TABLE`.
- A real migration tool (like Alembic, SQLAlchemy's own companion migration tool) tracks, in the database itself, *which* migrations have already been applied — so running the migration tool again is safe and idempotent (see `idempotent-initialization-guard.md`): already-applied migrations are skipped, and only genuinely new ones run.
- Migrations are typically applied in a strict, linear order, each one building on the schema state the previous one left behind — this is what lets a fresh, empty database and an old, already-populated one both reach the identical final schema, by replaying the same ordered sequence of changes (skipping ones already applied, for the database that already has some of them).
- A well-written migration is also **reversible** — paired with a "downgrade" step undoing exactly what it did — giving a real, safe way to back out a schema change if something goes wrong after deploying it.

## CS Lens

A migration history is a real, applied instance of **versioned, incremental state transformation** — rather than describing a system's *desired final state* directly (as `CREATE TABLE IF NOT EXISTS` does, only for the "doesn't exist yet" case), a migration describes the *specific delta* from one known state to the next, and a sequence of such deltas, replayed in order, deterministically reconstructs the current state from any earlier one. This is conceptually close to how version control itself works (see `dependency-graph-resolution.md`'s neighboring ideas about tracked, ordered change) — a database schema's own real history, made explicit and replayable rather than only ever existing as "whatever it currently happens to be."

Also recognized in: every real production application's schema-migration tooling (Django migrations, Rails' ActiveRecord migrations, Alembic for SQLAlchemy) — genuinely universal across frameworks and languages, because "the schema must change safely after real data already exists" is a universal problem for any application that outlives its first deployment.

## SE Lens

The real, concrete risk of *not* having real migrations: a schema change gets made by hand, once, directly against a production database (a real, common but genuinely dangerous shortcut) — untracked, unrepeatable, and easy to forget to also apply to every other environment (a teammate's local database, a staging environment) that needs the identical change. A real migration, checked into version control alongside the application code it supports, is what makes a schema change reviewable, repeatable, and automatically applied consistently everywhere the application runs — turning a schema change into an ordinary, trackable part of a codebase's own history rather than a manual, easy-to-lose-track-of operational step.

## Connection

Builds on `sql-create-table-and-schema.md` and `idempotent-initialization-guard.md` (a migration tool's own "skip what's already applied" tracking is itself an idempotency guard, applied to an ordered sequence of changes rather than a single one).

## Try It Yourself

1. Reproduce the "silent no-op" behavior shown above (`CREATE TABLE IF NOT EXISTS` with an added column, against a table that already exists) and confirm for yourself that no error is raised at all — the change is simply, silently ignored, which is precisely why it's a dangerous trap for anyone expecting `IF NOT EXISTS` to also mean "or update it to match."
2. Write a second, real `ALTER TABLE` migration (renaming a column, if your database supports it directly, or adding a second new column) and apply it to the same database, confirming both real schema changes persist together.
3. Look up a real migration tool's actual "downgrade" mechanism (Alembic's `downgrade()` function, for instance) and write the reverse of your `ADD COLUMN` migration (`ALTER TABLE tools DROP COLUMN material`, if your database supports it) — confirming a real, tracked way exists to safely undo a specific, applied schema change.
