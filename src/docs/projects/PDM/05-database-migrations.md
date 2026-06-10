# Vault PDM — Lesson 05 — Database Migrations

## What You Will Build

All five tables from the Vault data model are created in PostgreSQL using a SQL
migration script: `users`, `files`, `versions`, `locks`, and `wip_snapshots`. After
running the migration, you can inspect the tables in `psql`. The app still displays
the hardcoded file, but the database now has the correct structure for every feature
in lessons 06–30.

## What You Need to Know First

Lessons 01–04. PostgreSQL is running with the `vault` database. You can connect to it
with `psql`. The `VaultFile` type from lesson 04 describes what the `files` table will
eventually hold.

---

## The Problem

The database is empty. Before writing any query that reads from or writes to the
database, the tables must exist. Creating tables in the wrong order (for example,
creating `versions` before `files`) would violate the foreign key constraints.
Doing this interactively in `psql` once means the work is not repeatable — a new
team member or a fresh server would need to recreate the steps from memory.

The solution is a **migration**: a version-controlled SQL file that creates the
schema. Running the migration on any machine produces an identical database structure.
The migration is committed to git alongside the code it supports.

---

## Step 1 — What a Schema Is

**Schema — first appearance:**
A **schema** is the structure of a database: which tables exist, which columns each
table has, what type each column stores, and what constraints (uniqueness, foreign
keys, not-null) are enforced. The schema is the "shape" of the data before any data
exists.

In PostgreSQL, `CREATE TABLE` defines the schema. Once a table exists with data,
changing the schema requires care: adding a column is usually safe; removing one
destroys data; changing a column type may corrupt data if the existing values do not
convert. Migrations track these changes.

**Migration — first appearance:**
A **migration** is a versioned, sequential change to the database schema — written
as SQL and committed to git. Migrations are run in order. They are designed to be
**idempotent** where possible (running them twice produces the same result as running
them once).

The standard migration workflow:
1. Write a SQL file in `migrations/` with a sequential number prefix: `001_initial_schema.sql`
2. Commit the file to git
3. Run it with `psql` (or a migration tool)
4. Never modify an already-run migration — create a new one instead

**Why migrations are committed to git:**
The database schema is part of the codebase. A version of the code expects a specific
schema. If the schema and the code are out of sync — the code calls a column that does
not exist, or a column the code reads has been renamed — the app fails. Committing
migrations to git alongside the code that uses them means a `git checkout` of any
version brings both the code and the schema instructions together.

---

## Step 2 — The Migration File

### Create `migrations/001_initial_schema.sql`

```sql
-- Enable UUID generation function
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

**`CREATE EXTENSION IF NOT EXISTS "pgcrypto"` — first appearance:**
PostgreSQL extensions add functions not available in the standard SQL library.
`pgcrypto` adds `gen_random_uuid()` — the function that generates UUID primary keys.
`IF NOT EXISTS` makes the statement **idempotent**: if the extension is already
installed, the statement succeeds silently rather than failing.

**UUID — first appearance:**
A **UUID (Universally Unique Identifier)** is a 128-bit random identifier, formatted
as `550e8400-e29b-41d4-a716-446655440000` (32 hexadecimal digits in five groups
separated by hyphens). The probability of two independently generated UUIDs being
equal is astronomically small — effectively zero for any practical purpose.

**Security lens — UUID primary keys prevent IDOR:**
**IDOR (Insecure Direct Object Reference)** is a vulnerability where a client can
access objects by guessing or incrementing an identifier. With integer primary keys
(`id = 1, 2, 3, ...`), a user who can see file ID 42 can try ID 43, 44, 45 — often
successfully. With UUIDs, guessing a valid ID is computationally infeasible (2¹²²
possibilities). UUID primary keys are not a substitute for authorisation checks, but
they prevent enumeration attacks. Every table in Vault uses UUID primary keys.

```sql
CREATE TABLE IF NOT EXISTS users (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  gitlab_user_id  INTEGER     NOT NULL UNIQUE,
  username        TEXT        NOT NULL,
  email           TEXT        NOT NULL,
  display_name    TEXT        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**`CREATE TABLE IF NOT EXISTS` — idempotency:**
`IF NOT EXISTS` prevents the statement from failing if the table already exists.
The migration can be re-run safely (for example, if it was interrupted partway).
Without `IF NOT EXISTS`, running the migration twice would fail with "relation already
exists."

**SQL data types — first appearance:**
- `UUID` — stores a 128-bit UUID. `gen_random_uuid()` generates one automatically.
- `INTEGER` — a 32-bit signed integer (-2,147,483,648 to 2,147,483,647).
- `TEXT` — variable-length string. No maximum length (unlike `VARCHAR(255)`).
  PostgreSQL's `TEXT` is recommended over `VARCHAR` unless a specific length limit
  is needed.
- `TIMESTAMPTZ` — timestamp with timezone. Stores both the time and the UTC offset.
  Always use `TIMESTAMPTZ` over `TIMESTAMP` (without timezone) — without timezone
  information, timestamps are ambiguous when the server moves between time zones.

**`PRIMARY KEY`:** Marks this column as the table's primary key. Implies UNIQUE and
NOT NULL. Every table must have a primary key — it is how rows are identified and
referenced by other tables.

**`DEFAULT gen_random_uuid()`:** When an `INSERT` statement does not specify a value
for `id`, PostgreSQL calls `gen_random_uuid()` and uses the result. Application code
never generates UUIDs — the database does. This prevents duplicate IDs that would
occur if two application instances generated IDs simultaneously using the same seed.

**`NOT NULL`:** Prevents the column from storing `NULL`. Every column in Vault is
`NOT NULL` unless it is explicitly nullable — nullability is a design decision, not
a default.

**`UNIQUE`:** `gitlab_user_id UNIQUE` ensures no two rows can have the same
`gitlab_user_id`. This enforces the one-user-per-GitLab-account invariant at the
database level. TypeScript types describe what we intend; database constraints enforce
it.

```sql
CREATE TABLE IF NOT EXISTS files (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  gitlab_project_id   INTEGER     NOT NULL,
  file_path           TEXT        NOT NULL,
  file_type           TEXT        NOT NULL DEFAULT 'OTHER',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (gitlab_project_id, file_path)
);
```

**`UNIQUE (gitlab_project_id, file_path)` — composite unique constraint:**
A single-column `UNIQUE` constraint prevents duplicate values in one column.
A composite `UNIQUE` on multiple columns prevents duplicate *combinations*: the same
file path in a different project is allowed; the same file path in the same project
is not. This enforces the "one Vault metadata record per actual file" invariant.

```sql
CREATE TABLE IF NOT EXISTS versions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id        UUID        NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  commit_sha     TEXT        NOT NULL,
  committed_by   UUID        NOT NULL REFERENCES users(id),
  commit_message TEXT        NOT NULL DEFAULT '',
  committed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**`REFERENCES files(id)` — foreign key:**
A **foreign key** creates a relationship between two tables. `file_id REFERENCES
files(id)` means: `file_id` must contain a value that exists in `files.id`. Inserting
a version with a `file_id` that does not exist in `files` fails with a constraint
violation. Foreign keys enforce referential integrity at the database level — it is
impossible to create an orphaned version (a version with no parent file).

**`ON DELETE CASCADE`:** When a file is deleted from `files`, all its versions are
automatically deleted. Without `CASCADE`, deleting a file that has versions would
fail — the foreign key constraint prevents deletion of a row that is referenced.
`CASCADE` is appropriate when child records have no meaning without their parent.

```sql
CREATE TABLE IF NOT EXISTS locks (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id         UUID        NOT NULL UNIQUE REFERENCES files(id) ON DELETE CASCADE,
  held_by         UUID        NOT NULL REFERENCES users(id),
  checked_out_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**`file_id UUID NOT NULL UNIQUE` — one lock per file:**
The `UNIQUE` constraint on `file_id` enforces the invariant: at most one lock record
per file. The database makes it impossible to insert a second lock for the same file —
the constraint violation prevents it at the storage level. Business rules expressed
as database constraints are enforced regardless of which code path updates the
database.

**Why a separate `locks` table:**
A lock is transient state — created on checkout, deleted on check-in. `files` records
are permanent. Mixing permanent and transient state in the same row creates several
problems:
- Querying "all currently checked-out files" requires scanning the full `files` table
  for rows where `locked_by IS NOT NULL`, instead of a simple `SELECT * FROM locks`
- The `files` row must be `UPDATE`d on checkout and check-in — two extra writes to
  the most frequently read table
- The lock's history is destroyed when it is released — a separate table makes audit
  logging (lesson 28) possible

```sql
CREATE TABLE IF NOT EXISTS wip_snapshots (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lock_id         UUID        NOT NULL REFERENCES locks(id) ON DELETE CASCADE,
  gitlab_branch   TEXT        NOT NULL,
  snapshot_sha    TEXT        NOT NULL,
  saved_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**`REFERENCES locks(id) ON DELETE CASCADE`:** When a lock is deleted (file is
checked in), all its WIP snapshots are automatically deleted. WIP snapshots are
meaningless after check-in — they were temporary saves during a checkout session.
Cascading the delete keeps the database clean without requiring application code to
explicitly delete snapshots.

---

## Step 3 — Running the Migration

```
psql -U vault_user -d vault -f migrations/001_initial_schema.sql
```

**Each argument:**
- `-U vault_user` — connect as `vault_user`
- `-d vault` — connect to the `vault` database
- `-f migrations/001_initial_schema.sql` — read and execute the SQL file

**Expected output:**
```
CREATE EXTENSION
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
```
One line per statement. If any line says `ERROR:`, the migration failed at that
point — read the error message carefully. Common errors:
- `ERROR: role "vault_user" does not exist` — the user was not created (lesson 03)
- `ERROR: database "vault" does not exist` — the database was not created (lesson 03)
- `ERROR: permission denied` — `vault_user` does not have `CREATE TABLE` permission.
  Fix: in psql as `postgres`, run `GRANT ALL ON DATABASE vault TO vault_user; GRANT
  CREATE ON SCHEMA public TO vault_user;`

### Inspecting the result

```
psql -U vault_user -d vault
```

In the psql session:
```
\dt
```

**`\dt` — list all tables:**
Displays a table showing all tables in the current database:
```
         List of relations
 Schema |    Name      | Type  |   Owner
--------+--------------+-------+-----------
 public | files        | table | vault_user
 public | locks        | table | vault_user
 public | users        | table | vault_user
 public | versions     | table | vault_user
 public | wip_snapshots| table | vault_user
```

```
\d files
```

**`\d tablename` — describe a table:**
Shows all columns, their types, and their constraints. Verify that every column
matches the migration.

---

## Connect the Pieces

The migration creates the storage structure that lessons 09–23 fill with data. The
tables map directly to the domain types:

```
SQL TABLE          DOMAIN TYPE        LESSON WHERE DATA FIRST APPEARS
users           ←→ UserProfile         Lesson 09 (after GitLab auth)
files           ←→ VaultFile           Lesson 13 (sync from GitLab)
versions        ←→ FileVersion         Lesson 21 (check-in creates a version)
locks           ←→ FileLock            Lesson 16 (checkout creates a lock)
wip_snapshots   ←→ WipSnapshot         Lesson 20 (WIP save creates a snapshot)
```

The migration runs once per environment (once on your development machine, once on
any production server). After lesson 05, the schema is stable. New columns or tables
in future lessons would require a new numbered migration file (`002_`, `003_`, etc.)
— never modifying `001_initial_schema.sql`.

---

## What Breaks Without This

**Without `UNIQUE` on `locks.file_id`:**
Two simultaneous checkout requests can both read "no lock exists," both proceed, and
both insert a lock record. Now the file has two locks — two people believe they have
exclusive access. The `UNIQUE` constraint prevents the second insert with a constraint
violation. This is the foundation of the atomic locking in lesson 17.

**Without foreign keys:**
A version record with an invalid `file_id` (pointing to a deleted or non-existent
file) creates an orphaned record. A version for a file that no longer exists is
garbage data — it cannot be displayed, downloaded, or cleaned up without knowing
which file it belongs to. Foreign keys make orphans impossible.

**Without `TIMESTAMPTZ` (using `TIMESTAMP` instead):**
Timestamps stored without timezone information are ambiguous when a server moves
between data centres in different time zones (for example, from US-East to Europe).
`TIMESTAMP` `'2026-01-15 14:00:00'` could mean UTC or EST or any other timezone.
`TIMESTAMPTZ` `'2026-01-15 14:00:00+00'` is unambiguous. Version history timestamps
must be unambiguous — "which version was committed first?" must have a correct answer.

---

## Definition of Done

- [ ] `psql -f migrations/001_initial_schema.sql` runs without errors
- [ ] `\dt` in psql shows all five tables
- [ ] `\d files` shows all columns with correct types and constraints
- [ ] `\d locks` shows `UNIQUE` on `file_id` and `REFERENCES files(id)`
- [ ] You can explain what a migration is and why it is committed to git
- [ ] You can explain what a foreign key enforces with a concrete example
- [ ] You can explain UUID primary keys and the IDOR vulnerability
- [ ] You can explain why `TIMESTAMPTZ` is used instead of `TIMESTAMP`
- [ ] You can explain why `locks` is a separate table rather than a column on `files`
- [ ] Run:
      ```
      git add migrations/
      git commit -m "Add initial schema migration: users, files, versions, locks, wip_snapshots with UUID PKs, foreign keys, and uniqueness constraints"
      ```

---

*Next: Lesson 06 — The Complete Skeleton (Phase 1 Review). No new features. The
student traces a complete request lifecycle from the renderer to the database and
back. The architecture diagram is written and committed. The Network tab in Electron
devtools shows the HTTP request in detail.*
