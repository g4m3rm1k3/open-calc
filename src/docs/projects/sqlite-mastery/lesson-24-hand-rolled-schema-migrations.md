# Lesson 24: Hand-Rolled Schema Migrations

**What you will build:** a real, versioned migration runner — two real
new columns added to `parts`, applied once, tracked permanently, and
proven safe to run again without error or duplicate effect.

**What you need to know first:** [Lesson 08](lesson-08-primary-and-foreign-keys.md)
— `ALTER TABLE ADD COLUMN`, applied there once, by hand, directly at
the CLI; this lesson gives that same real operation a repeatable,
trackable process. [Lesson 20](lesson-20-transactions-in-python.md) —
`with conn:`, reused here to make each migration atomic.

**Terms introduced in this lesson:**
- **Migration** — a real, named, ordered, one-time schema change,
  applied exactly once and recorded so it's never mistakenly reapplied.
- **Migration runner** — real code that checks which migrations have
  already been applied and runs only the ones that haven't, in order.
- **Idempotent** — a real property of an operation: running it more
  than once produces the same real end state as running it exactly
  once, with no further effect and no error on the repeats.

**Objects and methods used:** none new — this lesson combines
already-explained `sqlite3` calls (`execute`, `with conn:`) and ordinary
Python (a list of tuples, a `for` loop, a `set`) into a real, working
migration system; no new library object or method is introduced.

---

## Concept Unit: A Real, Versioned Record of What's Already Been Applied

### The Problem

Lesson 08's own `ALTER TABLE parts ADD COLUMN supplier_id ...` ran
exactly once, typed directly at this project's own single, real CLI
session. A genuinely separate environment — a teammate's own fresh copy
of `pocket_hardware.db`, or Arc 4's own future production deployment —
has no record that this change happened at all, and nothing to stop it
from being run twice by mistake, or in the wrong order relative to some
other real schema change.

### Introduce the Concept in Isolation

A real, permanent table, existing for exactly this purpose:

```python
import sqlite3

conn = sqlite3.connect("pocket_hardware.db")
conn.execute("""
    CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
    )
""")
conn.commit()
```

`schema_migrations` holds one real row per migration that has ever
actually run — `version` uniquely identifies which one, `applied_at`
records real, honest proof of when. Nothing about this table describes
*what* changed; it exists purely to answer one real question later:
"has migration N already happened here?"

Two real, ordered migrations this project genuinely needs, defined as
real data rather than ad-hoc CLI commands:

```python
MIGRATIONS = [
    (1, "add notes column to parts",
     "ALTER TABLE parts ADD COLUMN notes TEXT"),
    (2, "add reorder_threshold column to parts",
     "ALTER TABLE parts ADD COLUMN reorder_threshold INTEGER NOT NULL DEFAULT 5"),
]
```

Each real tuple names a version number, a human-readable description,
and the real SQL to run — an ordered, explicit, inspectable list,
rather than a fact that only ever existed as commands someone once
typed and didn't write down.

### Discard

Nothing throwaway — `schema_migrations` and `MIGRATIONS` are both real,
permanent parts of this project from here on.

### Mechanical Walkthrough

- `CREATE TABLE IF NOT EXISTS schema_migrations (...)` — **(a) first
  appearance** of `IF NOT EXISTS`: makes `CREATE TABLE` safe to run
  again — Lesson 02's own real "table already exists" error, silenced
  specifically for this one, deliberate case, where re-running the same
  setup code harmlessly is genuinely the desired behavior.
- `version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL` — **(b) hard
  concept reappearing**, Lesson 02's own `INTEGER PRIMARY KEY` and
  Lesson 07's own `NOT NULL`, both unchanged.
- `MIGRATIONS = [(1, "...", "ALTER TABLE ..."), (2, "...", "ALTER TABLE
  ...")]` — **(c) already basic**, an ordinary Python list of tuples;
  the `ALTER TABLE ... ADD COLUMN ... NOT NULL DEFAULT 5` inside the
  second one — **(b) hard concept reappearing** for `ALTER TABLE ADD
  COLUMN` itself (Lesson 08) and `NOT NULL`/`DEFAULT` (Lesson 07); the
  real, specific requirement that a `NOT NULL` column added this way
  *must* carry a real, non-`NULL` `DEFAULT` — SQLite has no other way to
  fill in `reorder_threshold` for `parts`' own already-existing rows
  without one — is this lesson's own small, real addition to that
  already-taught pair.

### CS Lens

`schema_migrations` is a real **log of applied operations** — the same
underlying idea as a database's own write-ahead log, or a distributed
system's own applied-operations ledger: a durable, ordered record of
*what has already happened*, so a system can always determine its own
current real state without re-deriving it from scratch or guessing.

### SE Lens

The real alternative not chosen: keep relying on hand-typed CLI history
(or nothing at all) as the only record of schema changes — real, and
exactly what this project has done since Lesson 08. The real, honest
cost of that alternative: it doesn't scale past one person, one
machine, one memory of "what did I already run here" — the instant a
second real environment (Arc 4's own deployment, a second contributor)
enters the picture, that informal record is worthless, and this
lesson's own real, explicit table is the direct, minimal fix.

## Concept Unit: The Runner — Applying Only What's Pending, Safely

### The Problem

Knowing which migrations *have* run (this unit's own first table) isn't
useful yet without something that reads it and decides what still needs
to happen.

### Introduce the Concept in Isolation

A real, complete runner, combining everything above:

```python
from datetime import datetime, timezone


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

A real, first run against `pocket_hardware.db`:

```
$ python -c "import sqlite3, migrations; conn = sqlite3.connect('pocket_hardware.db'); migrations.run_migrations(conn)"
Applied migration 1: add notes column to parts
Applied migration 2: add reorder_threshold column to parts
```

Confirmed for real, independently, at the CLI:

```
$ sqlite3 pocket_hardware.db "PRAGMA table_info(parts);"
0|id|INTEGER|0||1
1|name|TEXT|0||0
2|price|REAL|0||0
3|quantity|INTEGER|0||0
4|supplier_id|INTEGER|0||0
5|notes|TEXT|0||0
6|reorder_threshold|INTEGER|1|5|0
```

Two real, new columns — `notes` and `reorder_threshold` — with
`reorder_threshold`'s own real `notnull` flag (`1`) and `dflt_value`
(`5`) both correctly set, exactly matching `MIGRATIONS`' own second
entry. Every one of `parts`' eight already-existing real rows now has
`reorder_threshold = 5` and `notes = NULL`, filled in automatically the
instant the column was added — the identical real `ALTER TABLE ADD
COLUMN` behavior Lesson 08 already proved.

The real, deliberate second run, proving idempotency:

```
$ python -c "import sqlite3, migrations; conn = sqlite3.connect('pocket_hardware.db'); migrations.run_migrations(conn)"
```

No output at all — both migrations are already real rows in
`schema_migrations`, `done` correctly contains `{1, 2}`, and the `for`
loop's own `if version in done: continue` skips both without attempting
either `ALTER TABLE` a second time.

### Discard

Nothing throwaway — `migrations.py` (this concept unit's `run_migrations`
and `applied_versions`, plus the prior unit's own `MIGRATIONS` list) is
a real, permanent module, and `notes`/`reorder_threshold` are two real,
permanent columns on `parts` from here on.

### Mechanical Walkthrough

- `def applied_versions(conn): rows = conn.execute(...).fetchall();
  return {row[0] for row in rows}` — **(a) first appearance** of a real
  Python **set comprehension**, building a `set` (not a `list`)
  specifically because membership testing (`version in done`, below) is
  the only real operation this collection needs, and a `set` does that
  check faster than a `list` would.
- `for version, description, sql in MIGRATIONS: if version in done:
  continue` — **(c) already basic**, ordinary Python iteration and
  tuple unpacking; `in done` — **(b) hard concept reappearing**, the
  identical membership-test idea already used positionally-adjacent to
  Lesson 08's own real `IN (...)` SQL operator, here as ordinary Python
  instead of SQL.
- `with conn: conn.execute(sql); conn.execute("INSERT INTO
  schema_migrations ...")` — **(b) hard concept reappearing**, Lesson
  20's own automatic commit/rollback — applied here so a migration's own
  real schema change and its own real "I did this" record either both
  happen or neither does, never one without the other.
- `datetime.now(timezone.utc).isoformat()` — **(a) first appearance**
  of Python's own standard-library `datetime` module producing a real,
  timezone-aware current timestamp as text — not SQLite's own
  `datetime('now')` (Lesson 15) this time, since this value is computed
  in Python, before the SQL that stores it ever runs.

### CS Lens

This runner is a real, minimal instance of **idempotent operation
design**: `run_migrations` produces the identical real end state
whether it's called once or a hundred times, because every real action
it might take is guarded by a real check against durable, already-
recorded state — the same underlying principle behind HTTP's own `PUT`
(defined to be safely repeatable, unlike `POST`), a `mkdir -p` that
doesn't error if the directory already exists, or any retry-safe
distributed operation.

### SE Lens

The real alternative not chosen — a full, real migration framework
(Alembic, for a Python/SQLAlchemy stack; Django's own built-in
migrations) — offers real, genuine capabilities this lesson's own
~20-line runner doesn't: automatic reverse/"down" migrations, migration
generation from model changes, and handling for real, concurrent
multi-developer schema drift. This lesson deliberately hand-rolls the
minimal real version instead, for the same reason this entire series
has favored raw SQL and a hand-written repository over a full ORM so
far: understanding what a migration tool is *actually doing*
underneath — a version table, an ordered list, a guard against
re-running — makes reaching for a real framework later (should this
project ever outgrow ~20 lines) an informed choice, not a black box.

## Connect the pieces

One real gap, closed: Lesson 08's own `ALTER TABLE ADD COLUMN`, run
once by hand with no lasting record, became two real, ordered,
version-tracked migrations — `notes` and `reorder_threshold`, both now
real, permanent columns on `parts` — applied through one real runner
that checks `schema_migrations` before acting, proven both to apply
correctly on a first real run and to safely do nothing at all on a
second.

## What breaks without this

Bypass the runner and reapply migration 1's own real SQL directly, by
hand, exactly the way Lesson 08 originally worked:

```
$ sqlite3 pocket_hardware.db "ALTER TABLE parts ADD COLUMN notes TEXT;"
Error: duplicate column name: notes
```

A real, genuine rejection — direct proof of exactly the real risk this
lesson's own `schema_migrations` table exists to prevent. Run through
`run_migrations` itself, this exact mistake is structurally impossible:
`applied_versions` would have already reported `1` as done, and the
`for` loop's own `continue` would have skipped it silently, long before
this specific `ALTER TABLE` was ever attempted a second time. Run by
hand, with no version tracking at all, the identical mistake is a real,
hard SQL error instead — the concrete, provable cost of Lesson 08's own
original, untracked approach.

## Exercises

1. Add a real third migration — `reorder_threshold`'s own real
   companion, a `CHECK (reorder_threshold >= 0)` constraint (recall
   from Lesson 07 that SQLite cannot add a `CHECK` constraint via
   `ALTER TABLE`; research and use the real table-rebuild pattern this
   series' own Lesson 49 covers in depth, or state honestly in your own
   words why this specific migration genuinely cannot be a simple
   `ALTER TABLE ADD COLUMN` the way the first two were).
2. Modify `run_migrations` to print a real, clear message when it finds
   zero pending migrations to apply (instead of this lesson's own
   current silent no-op), and confirm it correctly distinguishes "ran
   fresh, nothing to do" from "ran fresh, applied two migrations."

## Definition of Done

- [ ] You created `schema_migrations` and confirmed it starts empty.
- [ ] You ran `run_migrations` for the first time and confirmed both
      real new columns exist on `parts`, with correct types, defaults,
      and `NOT NULL` flags.
- [ ] You ran it a second time and confirmed it does nothing, safely.
- [ ] You caused the real "duplicate column name" error by bypassing
      the runner, and understand exactly what real risk version
      tracking removes.
- [ ] You completed both exercises.

## Arc 2 complete

Eight lessons, and `pocket_hardware.db` is now reachable, safely and
correctly, from Python instead of only the `sqlite3` CLI:
`connect`/`cursor`/`execute`/`fetchall` (Lesson 17) proved the file
itself is CLI-agnostic; parameterized queries (Lesson 18) closed a
real, working SQL injection vulnerability; `sqlite3.Row` (Lesson 19)
removed a real, silent, positional-access bug; Python's own real
transaction defaults and `with conn:` (Lesson 20) were both proven
directly, including one genuine, easy-to-misjudge gotcha;
`executemany` (Lesson 21) gave this project real, efficient bulk
loading; the repository pattern (Lesson 22) gave six lessons' worth of
scattered SQL one real, organized home; a real, in-memory `pytest`
suite (Lesson 23) proved that home correct, including a second, genuine
gotcha specific to testing against `:memory:`; and hand-rolled
migrations (Lesson 24) gave this project's own schema changes a real,
versioned, idempotent process. [Arc 3](lesson-25-opening-the-same-db-from-nodejs.md)
proves the exact same `pocket_hardware.db` file — untouched, unconverted
— opens correctly from two entirely different languages next.
