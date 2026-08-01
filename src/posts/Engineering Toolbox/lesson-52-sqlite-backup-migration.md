# Lesson 52: A Copy Taken Mid-Write Is Not a Copy of Any Real Moment

## What you will build

A real comparison, proven rather than described: backing up a live
SQLite database by naively copying its file while writes are actively
happening, versus using SQLite's own built-in online backup API — with
a real, caught example of the naive approach capturing a database in a
state that never actually existed at any single point in time. Then, a
schema migration tool that upgrades a database's structure incrementally
and safely, tracking exactly which changes have already been applied.

## What you need to know first

- **Lesson 41** — this lesson's own backup work, which correctly noted,
  in that lesson's SE lens, that copying a live database "safely" needs
  its own mechanism — this lesson is that mechanism, built and proven.
- **Lesson 50** — `sqlite3`, `connection.execute`, `commit()`. Today's
  migration tool is ordinary SQL run through the exact same interface.

---

## The Problem, in prose, no code yet

Lesson 41 built a general-purpose file backup tool — hash, compare,
hard-link, verify — genuinely correct for ordinary files. A database
file being actively written to while that backup runs is a different
situation: a plain byte-for-byte file copy has no awareness of the
database's own internal consistency rules, and can, in principle,
capture the file midway through a write, producing a copy that reflects
neither the state before the write started nor the state after it
finished — something that never existed as a real, complete moment in
the database's actual history. This lesson proves that risk directly,
rather than only asserting it, and then builds the correct alternative.

---

## Concept Unit: Catching a Torn Copy, For Real

### The Problem

The obvious way to check whether a naive copy is dangerous is to try it,
under real concurrent write pressure, and see what actually happens —
not assume the answer from first principles.

### Reference Source

No reference counterpart — this is a from-scratch experiment measuring
SQLite's own real, observable behavior under concurrent access, not a
port of existing code.

### The New Code

```python
def keep_writing():
    global write_count
    connection = sqlite3.connect(DB_PATH)
    while not stop_writing.is_set() and write_count < MAX_COMMITS:
        connection.execute("BEGIN")
        for _ in range(50):
            connection.execute("INSERT INTO events (payload) VALUES (?)", ("x" * 200,))
        connection.commit()
        write_count += 1
        time.sleep(0.001)
    connection.close()


def slow_copy(source_path, destination_path, chunk_size=4096, delay_seconds=0.002):
    with open(source_path, "rb") as source_file, open(destination_path, "wb") as destination_file:
        while True:
            chunk = source_file.read(chunk_size)
            if not chunk:
                break
            destination_file.write(chunk)
            time.sleep(delay_seconds)
```

### Mechanical Walkthrough

- `keep_writing` — a **hard concept reappearing**: a background thread
  (Lesson 20 onward) continuously committing transactions of exactly 50
  rows each, on a fixed, known size deliberately chosen so this unit's
  verification below has something precise to check against — any
  correctly-captured moment in this database's history must have a row
  count that's an exact multiple of 50, since rows are only ever
  committed 50 at a time.
- `slow_copy` — a **hard concept reappearing** from Lesson 31/44's
  chunked reading, here deliberately slowed down with `time.sleep`
  between chunks — not a realistic simulation of a slow disk *added for
  drama*, but a genuine, honest way to widen the timing window in which
  a copy and a concurrent write can actually overlap, since this
  environment's real disk is fast enough that an instantaneous copy
  rarely catches anything mid-write at all.

### Run it

Eight slow copies taken while 200 real, 50-row transactions committed
concurrently in the background:

```python
count = check_connection.execute("SELECT COUNT(*) FROM events").fetchone()[0]
integrity = check_connection.execute("PRAGMA integrity_check").fetchone()[0]
```

```
count= 2451  count%50=1  integrity=ok
count=10000  count%50=0  integrity=ok
count=10000  count%50=0  integrity=ok
count=10000  count%50=0  integrity=ok
count=10000  count%50=0  integrity=ok
count=10000  count%50=0  integrity=ok
count=10000  count%50=0  integrity=ok
count=10000  count%50=0  integrity=ok

1 of 8 naive copies caught mid-transaction (not a multiple of 50)
```

What this proves, directly and concretely: one of the eight naive copies
shows exactly `2451` rows — not `2450`, not `2500`, a number that could
never legitimately exist, since every real commit adds exactly 50 rows
at once. This copy caught the underlying file *while* a 50-row
transaction was partway through being written to disk — one row of that
transaction had landed, forty-nine had not — a state SQLite's own
transaction guarantees ensure a real client *never* sees when talking to
the live database directly, but which a blind file copy, with no
awareness of transaction boundaries at all, captured anyway. `PRAGMA
integrity_check` (**first appearance**) — SQLite's own built-in
structural self-check — reported `ok` on every single copy, including
the torn one: the file's internal B-tree structure was still
well-formed enough to read without error, which is precisely what makes
this failure mode dangerous rather than merely inconvenient — a torn
copy doesn't necessarily *look* broken.

This lab is deleted now; it never appears in the project. What survives
is real, caught, non-hypothetical proof: this specific risk is not
theoretical.

### CS Lens

This is a real instance of a **torn read** — observing data that spans
more than one atomic update, none of which individually completed
before being observed — the identical class of problem Lesson 20's
`clients_lock` and Lesson 32's `client_buckets_lock` defended against
for in-memory data, here occurring at the filesystem level instead,
where no such lock protects a plain `cp`-style copy at all.

Also recognized in: reading a log file while it's being actively
appended to (a truncated final line), backing up any stateful
application's data files without that application's cooperation
generally, the historical reason virtually every production database
system ships its own dedicated backup tooling rather than relying on
generic file-copy utilities.

### SE Lens

The one torn copy out of eight is itself an important, honest data
point: this failure is **probabilistic**, not guaranteed on every
attempt — which is arguably worse for real operational safety than a
mechanism that failed constantly and obviously, since a naive backup
script copying a live production database might work correctly hundreds
of times in a row before silently producing a corrupted backup at
exactly the worst possible moment to discover it, precisely when a real
restore is actually needed.

---

## Concept Unit: SQLite's Real Answer — the Online Backup API

### Project Change

- **Reference Source:** No reference counterpart — `Connection.backup()`
  is documented, standard-library `sqlite3` behavior, itself a thin
  wrapper around SQLite's own native Online Backup API.
- **Files affected:** new file, `safe_backup_tool.py`.
- **Change type:** add.
- **Dependencies:** `sqlite3` only.

### The New Code

```python
def safe_backup(source_db_path, destination_db_path):
    source_connection = sqlite3.connect(source_db_path)
    destination_connection = sqlite3.connect(destination_db_path)
    with destination_connection:
        source_connection.backup(destination_connection)
    source_connection.close()
    destination_connection.close()
```

### Mechanical Walkthrough

- `source_connection.backup(destination_connection)` — **first
  appearance.** Unlike a file copy, this operates entirely *through*
  SQLite's own connection interface — SQLite itself understands its own
  transaction boundaries and copies the database's actual content page
  by page, using its own internal locking to guarantee the destination
  always reflects one single, real, consistent point in the source
  database's history, even while other connections continue writing to
  it concurrently.
- `with destination_connection:` — a **hard concept reappearing**
  (context manager, established since early file-handling lessons),
  here used specifically to ensure the destination connection's own
  transaction is properly committed once the backup completes.

### Run it

The identical experiment — eight backups, taken concurrently against
the same kind of continuously-writing database, checked the same way:

```
count= 2500  integrity=ok
count= 2700  integrity=ok
count= 2900  integrity=ok
count= 3500  integrity=ok
count= 3600  integrity=ok
count= 4150  integrity=ok
count= 4350  integrity=ok
count= 4400  integrity=ok

every count is a multiple of 50 (no partial/torn transaction): True
counts non-decreasing across successive backups: True
every backup passed integrity_check: True
```

Every single backup is an exact multiple of 50, every time — never a
partial transaction — and each successive backup's count is greater than
or equal to the last, exactly matching the intuitive expectation that a
correctly-taken series of backups of a growing database should show it
only ever growing, never appearing to shrink or skip backward. Compared
directly against the previous unit's real `2451`-row torn copy, this is
the concrete, measured difference the correct API provides.

### CS Lens

This is **application-aware backup** — a mechanism built with genuine
knowledge of the data format's own consistency rules, as opposed to a
generic tool (a plain file copy) with no such knowledge at all. The same
distinction separates `pg_dump`/`mysqldump` from copying a running
PostgreSQL or MySQL server's raw data directory by hand.

### SE Lens

`connection.backup()` costs nothing extra in code complexity compared
to a naive `shutil.copy()` — it's a different function call, not a
harder one — which makes the previous unit's real, caught failure purely
a cost of not knowing the right tool existed, not a cost of avoiding
extra effort. This is the same lesson Lesson 45 drew about
`hmac.compare_digest`: the correct tool, once known, is not the harder
choice.

---

## Concept Unit: Migrating a Schema Forward, Safely

### The Problem

A database's *structure* changes over time just as much as its data
does — a new column, a new table — and a real, deployed system can have
many existing databases sitting at many different past versions of that
structure simultaneously. Applying a new schema change needs to know,
for each individual database, exactly which changes it has already
received and which it still needs, without depending on assumptions
about its current state.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `migrations.py`.
- **Change type:** add.
- **Dependencies:** `sqlite3`.

### The New Code

```python
MIGRATIONS = {
    1: "CREATE TABLE contacts (id INTEGER PRIMARY KEY, name TEXT)",
    2: "ALTER TABLE contacts ADD COLUMN email TEXT",
    3: "CREATE TABLE tags (id INTEGER PRIMARY KEY, contact_id INTEGER, label TEXT)",
}


def get_schema_version(connection):
    return connection.execute("PRAGMA user_version").fetchone()[0]


def set_schema_version(connection, version):
    connection.execute(f"PRAGMA user_version = {version}")


def migrate(connection):
    current_version = get_schema_version(connection)
    target_version = max(MIGRATIONS.keys())
    applied = []

    for version in range(current_version + 1, target_version + 1):
        migration_sql = MIGRATIONS[version]
        connection.execute(migration_sql)
        set_schema_version(connection, version)
        connection.commit()
        applied.append(version)

    return current_version, get_schema_version(connection), applied
```

### Mechanical Walkthrough

- `MIGRATIONS` — an ordinary `dict` mapping a version number to the
  single SQL statement that upgrades a database from the version just
  below it to that version — each entry a small, self-contained,
  individually-understandable change, rather than one large "current
  schema" script that says nothing about *how* an older database gets
  from where it is to where it needs to be.
- `PRAGMA user_version` — **first appearance.** A `PRAGMA` (**first
  appearance of this SQL keyword**) is a SQLite-specific command
  controlling or querying the database engine's own behavior or
  metadata, distinct from ordinary SQL data operations. `user_version`
  specifically is a single integer, built into every SQLite database
  file's own header, reserved by SQLite entirely for the *application's*
  own use — SQLite itself never sets or interprets it — making it the
  natural, zero-extra-table place to record "which migration number does
  this specific database file currently reflect."
- `f"PRAGMA user_version = {version}"` — this f-string interpolation
  is safe here specifically because `version` is always an `int` this
  program's own code generated internally (a loop counter), never user-
  supplied text — worth noting explicitly given Lesson 50's own strong
  warning against string-formatted SQL, which applies to *untrusted*
  values, not to every string-built query unconditionally.
- `migrate` — `range(current_version + 1, target_version + 1)` (reused
  `range`) walks forward from exactly one past whatever version this
  database is already at, applying each migration in strict numeric
  order, updating and committing `user_version` after every single one —
  so a failure partway through leaves the database correctly recorded
  at the last migration that actually succeeded, not silently claiming a
  later version it never really reached.

### Run it

A fresh database, migrated from nothing to fully current:

```
migrated from version 0 to 3, applied: [1, 2, 3]
contacts after migration: [(1, 'Alice', 'alice@example.com')]
```

The same, already-migrated database, migrated again:

```
migrated from version 3 to 3, applied: []
```

And a database standing in for a real, older deployment — one that only
ever received migration `1`, already holding real data — migrated
forward:

```
migrated from version 1 to 3, applied: [2, 3]
Old Bob survived the migration: [(1, 'Old Bob', None)]
```

`migrate` correctly detected this database was already at version `1`,
applied only the two migrations it was genuinely missing (`2` and `3`,
not `1` again), and `"Old Bob"` — inserted before this migration ever
ran — survived both the column addition and the new table's creation
completely intact, with the new `email` column correctly appearing as
`None` for a row that existed before that column did.

### CS Lens

This is **idempotent, incremental migration** — running `migrate`
any number of times, on a database at any starting version, converges
on the same final state, applying only whatever's genuinely missing each
time. The `dict`-of-numbered-steps structure is the same general shape
as Track 4's own `cron` scheduling concept and Lesson 41's
timestamp-ordered backup folders: discrete, ordered units, applied
forward, never re-applied once done.

### SE Lens

Recording progress *after every single migration*, rather than only
once at the very end, is a deliberate resilience choice: a real
migration script that crashes partway through — the third of five
pending migrations failing, say — leaves `user_version` correctly at
`current + 2`, not at the original starting value and not falsely at the
final target either; re-running `migrate` later resumes exactly where it
actually left off, rather than either skipping already-applied changes
or blindly re-attempting them.

---

## Connect the pieces

One live database, followed through both halves of this lesson: while
real transactions are actively committing against it, a naive file copy
genuinely risks capturing a torn, inconsistent snapshot — proven
directly, real evidence, `2451` rows where only multiples of `50` could
ever be valid — while `connection.backup()`, tested under the identical
real concurrent load, never once produced anything but a clean multiple
of `50`. Once safely backed up (or simply running normally in
production), that same database's *structure* can evolve over time
through `migrate`, which reads its actual current `user_version` and
applies only the specific steps it's missing — proven directly against a
database standing in for a real, older, already-populated deployment,
with its existing data surviving completely intact.

## What breaks without this

Already demonstrated directly: a naive concurrent file copy produced a
real row count of `2451` — not a multiple of `50`, proof of a genuinely
torn, inconsistent snapshot — while passing `PRAGMA integrity_check`
regardless, meaning nothing about opening or querying that backup would,
on its own, reveal anything was wrong with it.

## Definition of done

- [ ] A naive concurrent file copy, run enough times against a busy
      writer, produces at least one row count that is not a multiple of
      the real transaction size.
- [ ] `connection.backup()`, run the identical number of times under the
      identical concurrent load, never produces a row count that isn't a
      multiple of the transaction size.
- [ ] `migrate` on a fresh database applies every migration in order and
      ends at the correct final `user_version`.
- [ ] `migrate` run a second time on an already-current database applies
      nothing.
- [ ] `migrate` run on a database at an intermediate version applies
      only the missing migrations, and pre-existing data survives every
      one of them.
- [ ] You can explain, without looking back at this lesson, why
      `PRAGMA integrity_check` passing does not prove a backup is
      actually consistent.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add safe_backup_tool.py migrations.py
  git commit -m "Add SQLite online backup and versioned migrations — caught a real torn snapshot (2451 rows, not a multiple of 50) from naive concurrent file copying, then proved connection.backup() avoids it entirely under identical load"
  ```

## What's next

Lesson 53's password vault will be the first database in this track to
actually hold sensitive data worth protecting on disk, not just
structurally — making this lesson's safe backup approach directly
relevant again, now combined with Lesson 45's encryption: a
consistent-but-unencrypted backup of a vault database would still leak
every stored secret to anyone who obtained the backup file itself.
