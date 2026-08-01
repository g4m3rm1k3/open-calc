# SE Masterclass — LAB-64 — Migration System

**Language: Python (SQLite)** — same module as LAB-62–63.

**Prerequisites:** LAB-26 (this lab's `SaveV1`/`SaveV2` versioned save-file migration is the SAME pattern, applied to database SCHEMA instead of a save file) and LAB-59 (each migration should run inside a transaction — fail safely, not half-applied).

**What this lab adds:**
- A `migrations` table tracking which schema changes have ALREADY been applied
- `up`/`down` migration functions — apply a change, or precisely reverse it
- Applying a CHAIN of pending migrations, in order, exactly once each
- Wrapping each migration in a transaction, so a failed migration never leaves the schema half-changed

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Two developers both add a NEW column to the same table, independently, without a migration SYSTEM. What could go wrong when both changes reach production?
> 2. A migration ADDS a column. What should its "down" migration do?
> 3. A migration crashes HALFWAY through (it successfully added a column, then failed adding a second one). Without a transaction wrapping it, what state is the schema left in?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `python migrations.py` prints:

```
=== Migration History Table ===
migrations table created — tracks which migrations have run

=== Defining Migrations ===
migration 001_create_users: up() creates 'users' table
migration 002_add_email: up() adds 'email' column to 'users'
migration 003_add_index: up() creates an index on 'email'

=== Applying Pending Migrations ===
applying 001_create_users... done
applying 002_add_email... done
applying 003_add_index... done
migrations table: [001_create_users, 002_add_email, 003_add_index]

=== Re-running: Already-Applied Migrations Are Skipped ===
applying migrations again...
001_create_users: already applied, skipping
002_add_email: already applied, skipping
003_add_index: already applied, skipping
0 new migrations applied

=== Rolling Back the Last Migration ===
rolling back 003_add_index...
down() drops the index
migrations table: [001_create_users, 002_add_email]

=== Migration Safety: Transaction Wrapping ===
migration 004_bad_migration: adds a column, then FAILS
attempting migration 004_bad_migration...
ERROR — rolling back entire migration
schema check: 'bad_column' does NOT exist — failed migration left NO partial trace
```

---

### Concept: A Migrations Table — The Schema's Own Version History

**What it is:** A **migrations table** records WHICH schema-changing scripts have ALREADY run, by a unique ID/name — exactly LAB-26's `version` field on a save file, generalized to a WHOLE HISTORY of sequential changes instead of one single number.

---

## Step 1 — A Migrations History Table

```python
# migrations.py
import sqlite3

conn = sqlite3.connect(':memory:')
conn.isolation_level = None
cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE migrations (
        name TEXT PRIMARY KEY,
        applied_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
''')
print("=== Migration History Table ===")
print("migrations table created — tracks which migrations have run")
```

### SAVE AND TRY

```bash
python migrations.py
```

**Expected:**
```
=== Migration History Table ===
migrations table created — tracks which migrations have run
```

---

## Step 2 — Define Migrations as up/down Pairs

```python
migrations = [
    {
        'name': '001_create_users',
        'up': lambda c: c.execute('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)'),
        'down': lambda c: c.execute('DROP TABLE users'),
    },
    {
        'name': '002_add_email',
        'up': lambda c: c.execute('ALTER TABLE users ADD COLUMN email TEXT'),
        'down': lambda c: c.execute('ALTER TABLE users DROP COLUMN email'),
    },
    {
        'name': '003_add_index',
        'up': lambda c: c.execute('CREATE INDEX idx_email ON users(email)'),
        'down': lambda c: c.execute('DROP INDEX idx_email'),
    },
]

print("\n=== Defining Migrations ===")
print("migration 001_create_users: up() creates 'users' table")
print("migration 002_add_email: up() adds 'email' column to 'users'")
print("migration 003_add_index: up() creates an index on 'email'")
```

### SAVE AND TRY

```bash
python migrations.py
```

**Expected:**
```
=== Defining Migrations ===
migration 001_create_users: up() creates 'users' table
migration 002_add_email: up() adds 'email' column to 'users'
migration 003_add_index: up() creates an index on 'email'
```

**Confirm each migration is a Command (LAB-23) with an inverse:** `up`/`down` is EXACTLY LAB-23's `execute`/`undo` pair, applied to SCHEMA changes instead of text-editor operations — a migration is nothing more than a named `Command` object where `down` is defined to precisely REVERSE whatever `up` did.

---

## Step 3 — Apply Pending Migrations, In Order, Exactly Once

```python
def applied_migrations():
    return {row[0] for row in cursor.execute('SELECT name FROM migrations').fetchall()}

def migrate_up():
    already_applied = applied_migrations()
    new_count = 0
    for migration in migrations:
        if migration['name'] in already_applied:
            continue
        print(f"applying {migration['name']}...", end=' ')
        migration['up'](cursor)
        cursor.execute('INSERT INTO migrations (name) VALUES (?)', (migration['name'],))
        print("done")
        new_count += 1
    return new_count

print("\n=== Applying Pending Migrations ===")
migrate_up()
print(f"migrations table: [{', '.join(applied_migrations())}]")
```

### SAVE AND TRY

```bash
python migrations.py
```

**Expected (order may print differently since it's a set, but content matches):**
```
=== Applying Pending Migrations ===
applying 001_create_users... done
applying 002_add_email... done
applying 003_add_index... done
migrations table: [001_create_users, 002_add_email, 003_add_index]
```

Now confirm IDEMPOTENCY — running it again:

```python
print("\n=== Re-running: Already-Applied Migrations Are Skipped ===")
print("applying migrations again...")
for m in migrations:
    status = "already applied, skipping" if m['name'] in applied_migrations() else "would apply"
    print(f"{m['name']}: {status}")
new_count = migrate_up()
print(f"{new_count} new migrations applied")
```

### SAVE AND TRY

```bash
python migrations.py
```

**Expected:**
```
=== Re-running: Already-Applied Migrations Are Skipped ===
applying migrations again...
001_create_users: already applied, skipping
002_add_email: already applied, skipping
003_add_index: already applied, skipping
0 new migrations applied
```

**Confirm the `applied_migrations()` check is what makes this SAFE to run repeatedly:** A migration system that's NOT idempotent (re-running it would try to `CREATE TABLE users` a SECOND time and crash) would be dangerous to run in an automated deployment pipeline — checking the `migrations` table FIRST, and SKIPPING anything already recorded, is exactly what makes "just run migrations on every deploy" a safe, standard practice.

---

## Step 4 — Rolling Back

```python
def migrate_down():
    applied = list(applied_migrations())
    if not applied:
        return None
    # roll back the migration with the LATEST name (in this lab's numbered-prefix convention, the highest number)
    last = sorted(applied)[-1]
    migration = next(m for m in migrations if m['name'] == last)
    print(f"rolling back {last}...")
    migration['down'](cursor)
    cursor.execute('DELETE FROM migrations WHERE name = ?', (last,))
    return last

print("\n=== Rolling Back the Last Migration ===")
migrate_down()
print("down() drops the index")
print(f"migrations table: [{', '.join(sorted(applied_migrations()))}]")
```

### SAVE AND TRY

```bash
python migrations.py
```

**Expected:**
```
=== Rolling Back the Last Migration ===
rolling back 003_add_index...
down() drops the index
migrations table: [001_create_users, 002_add_email]
```

**Confirm the migrations table shrinks, mirroring what the schema now looks like:** After rollback, `003_add_index` is GONE from the `migrations` table — meaning the NEXT `migrate_up()` call would correctly RE-APPLY it (since it's no longer marked "applied"), and the actual database index was genuinely DROPPED by `down()` — the recorded history and the ACTUAL schema state stay in sync, exactly as they must for this system to be trustworthy.

---

## 🎯 Challenge: Transaction-Wrapped Migrations

**You know:** LAB-59's `BEGIN`/`COMMIT`/`ROLLBACK` guarantees a group of operations is all-or-nothing. A migration should get the SAME guarantee — if it fails PARTWAY through, the schema should be left EXACTLY as it was before the attempt, not half-changed.

**Task:** Wrap `migrate_up`'s per-migration application in a transaction, rolling back on ANY failure.

<details>
<summary>▶ Show Solution</summary>

```python
def migrate_up_safe():
    already_applied = applied_migrations()
    for migration in migrations:
        if migration['name'] in already_applied:
            continue
        try:
            cursor.execute('BEGIN TRANSACTION')
            migration['up'](cursor)
            cursor.execute('INSERT INTO migrations (name) VALUES (?)', (migration['name'],))
            cursor.execute('COMMIT')
        except Exception as e:
            cursor.execute('ROLLBACK')                 # ← LAB-59's exact safety net, applied to schema changes
            print(f"ERROR — rolling back entire migration: {e}")
            raise

bad_migration = {
    'name': '004_bad_migration',
    'up': lambda c: (
        c.execute('ALTER TABLE users ADD COLUMN bad_column TEXT'),
        1 / 0,                                            # simulated failure AFTER the first change succeeded
    ),
}
migrations.append(bad_migration)

print("\n=== Migration Safety: Transaction Wrapping ===")
print("migration 004_bad_migration: adds a column, then FAILS")
print("attempting migration 004_bad_migration...")
try:
    migrate_up_safe()
except Exception:
    pass

cols = [row[1] for row in cursor.execute("PRAGMA table_info(users)").fetchall()]
has_bad_column = 'bad_column' in cols
print(f"schema check: 'bad_column' does {'NOT' if not has_bad_column else 'STILL'} exist — failed migration left NO partial trace")
```

**Key insight:** Without the transaction wrapper, `bad_migration` would leave `bad_column` PERMANENTLY added to `users`, even though the migration OVERALL failed — a genuinely corrupted, half-applied schema state that's hard to diagnose later (was `bad_column` intentional? Did SOME later migration depend on it existing?). Wrapping each migration in `BEGIN`/`COMMIT`/`ROLLBACK` guarantees the EXACT same all-or-nothing property LAB-59 established for application data, now protecting the SCHEMA itself — a migration either fully succeeds and is recorded, or fully fails and leaves zero trace, with no possible middle state.

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| `migrations` table | Django's `django_migrations` table, Rails' `schema_migrations`, Flyway's `flyway_schema_history` |
| `up`/`down` pairs | Every real migration framework's core structure |
| Idempotent re-application | Why "run migrations on every deploy" is safe standard practice |
| Transaction-wrapped migrations | Why production migration tools wrap changes in transactions (where the underlying database supports DDL transactions) |

**Where you will see this again:** LAB-26's save-file versioning was the CONCEPTUAL preview; this lab is the REAL, database-shaped version of the same idea — both boil down to "track a version, define how to move forward (and back) between versions, one step at a time."

---

## Final Check

| Feature | How to verify |
|---|---|
| The migrations table correctly tracks which migrations have run | Step 1 |
| Each migration has a matching, precisely-inverse `up`/`down` pair | Step 2 |
| Pending migrations apply in order, exactly once each | Step 3 |
| Re-running the migration system is safe — already-applied migrations are skipped | Step 3 |
| Rolling back correctly reverses the schema AND updates the migrations table | Step 4 |
| A failing migration, transaction-wrapped, leaves NO partial schema change | Challenge |

---

## Quick Check Answers

**1. Two developers both add a column independently, no migration system — what goes wrong?**

Without a SHARED, ORDERED, TRACKED history of schema changes, there's no reliable way to know which changes have ALREADY been applied to a given database, or in what order they need to be applied — one developer's manual `ALTER TABLE` could conflict with, duplicate, or be silently overwritten by another's, and production could end up with a DIFFERENT schema than either developer's local database, with no record of WHY. A migrations table (Step 1) makes this coordination explicit and automatic — every environment applies the SAME sequence, in the SAME order, exactly once.

**2. A migration ADDS a column — what should its down migration do?**

REMOVE that exact column — demonstrated directly in Step 2 (`002_add_email`'s `up` does `ADD COLUMN email`; its `down` does `DROP COLUMN email`). The `down` migration's entire job is to be the PRECISE inverse of `up`, so that applying `up` then `down` leaves the schema EXACTLY as it was before either ran — the same "undo reverses exactly what execute did" contract LAB-23's Command pattern established.

**3. A migration crashes halfway, no transaction — what state is the schema left in?**

Partially changed — whatever operations SUCCEEDED before the crash remain permanently applied, while whatever was supposed to happen AFTER the crash never does, demonstrated directly in the Challenge's `bad_migration` example (the column addition succeeds, then a simulated failure occurs). Without a transaction wrapper, this leaves a genuinely inconsistent, hard-to-diagnose schema state — exactly why the Challenge's transaction-wrapped version is the CORRECT way to write a real migration, guaranteeing all-or-nothing application even when something goes wrong partway through.

---

*Next: [LAB-65 — Caching Layer](LAB-65-caching-layer.md) — Python, same module*
