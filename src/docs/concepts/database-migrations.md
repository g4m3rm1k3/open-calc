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

## A Second Real Facet: a Lightweight, Idempotent Alternative — No Migration History Needed

A full migration tool (this file's own first facet) is real, valuable
overhead: a tracking table, an ordered history, up/down pairs. A small
application using plain SQLite directly, with no ORM, can reach the
identical real goal — a column that's safely added whether or not it
already exists — with a much lighter, real technique: check first,
then add, every single time the application starts.

```python
def ensure_column(conn, table, column, declaration):
    existing = {row[1] for row in conn.execute(f"PRAGMA table_info({table})")}
    if column not in existing:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {declaration}")


conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT)")
conn.execute("INSERT INTO tools (name) VALUES ('end_mill_4fl')")
conn.commit()

ensure_column(conn, "tools", "material", "TEXT")
print("columns after first call:", [row[1] for row in conn.execute("PRAGMA table_info(tools)")])

ensure_column(conn, "tools", "material", "TEXT")  # e.g. the app's SECOND real startup
print("columns after second call (idempotent, no crash):", [row[1] for row in conn.execute("PRAGMA table_info(tools)")])

print("existing row survived untouched:", conn.execute("SELECT name, material FROM tools").fetchone())
```

**Real output, run this session:**
```
columns after first call: ['id', 'name', 'material']
columns after second call (idempotent, no crash): ['id', 'name', 'material']
existing row survived untouched: ('end_mill_4fl', None)
```

**What this proves:** `material` was correctly added on the first
real call — and calling `ensure_column` a **second** time (standing
in for the application's own next real startup, against the same,
already-migrated database) neither crashed nor duplicated anything;
`PRAGMA table_info` correctly reported the column as already present,
so the `ALTER TABLE` never ran the second time. The existing row
survived completely untouched throughout, its new `material` column
correctly defaulting to `NULL`.

**The real crash this check prevents:**

```python
conn2 = sqlite3.connect(":memory:")
conn2.execute("CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT)")
conn2.execute("ALTER TABLE tools ADD COLUMN material TEXT")
conn2.execute("ALTER TABLE tools ADD COLUMN material TEXT")  # no check first
```

**Real output, run this session:**
```
sqlite3.OperationalError: duplicate column name: material
```

**What this proves:** without `PRAGMA table_info`'s own upfront check,
running the identical `ALTER TABLE` a second time — exactly what a
second real application startup would do — genuinely crashes with a
real, concrete `OperationalError`. The check-first pattern is what
makes re-running the same "ensure this column exists" logic safe on
every startup, indefinitely.

**Mechanical note — the real, honest tradeoffs against a full
migration tool:** this technique has no ordered history (every
"migration" is just "does this column exist yet," checked fresh every
time, not a numbered, sequential step), and no real downgrade path —
it only ever knows how to move a schema *forward* to include a column,
never how to remove one. It's the right real choice specifically for
a small, single-file application where the full weight of a tracked
migration history (a separate tool, a migrations directory, up/down
pairs) is genuinely more real infrastructure than the actual, current
schema-evolution need justifies — and the wrong choice the moment
real changes get more complex than "does this column exist" (renaming
a column, changing a type, restructuring a relationship), where a full
migration tool's own ordered, reversible history becomes genuinely
necessary.

### Try It Yourself (second facet)

1. Call `ensure_column` for a **second**, different new column on the
   same table, and confirm both real columns coexist correctly — real
   proof this generalizes to adding several columns over an
   application's own real lifetime, one `ensure_column` call per real
   column that was ever added.
2. Reason about (then confirm) what `ensure_column` does if the
   *table itself* doesn't exist yet at all — is a real, separate
   `CREATE TABLE IF NOT EXISTS` still needed alongside it, or does
   `PRAGMA table_info` handle that case gracefully on its own?
3. Write a real, honest code comment (matching the style this file's
   own first facet's Connection section values) explaining *why* a
   project chose this lightweight technique over a full migration
   tool — and what real, concrete signal (schema changes getting more
   complex than adding columns) would be the trigger to reconsider
   that choice, per `deferred-decision-with-trigger-condition.md`.
