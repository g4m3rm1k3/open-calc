---
series: database-design
level: 5
title: Migrations and Schema Evolution
lang: sql
---

# Migrations and Schema Evolution

A database schema is not written once and left unchanged. As application requirements evolve, the schema evolves with them: new columns are added, columns are renamed or removed, tables are added, foreign key relationships change. Managing this evolution safely — so that existing data is preserved, the application continues to run during the change, and the change can be undone if needed — is called schema migration.

Schema migration is one of the highest-risk activities in production engineering. An `ALTER TABLE ADD COLUMN` on a 500-million-row table in PostgreSQL takes minutes and locks the table. A poorly designed migration can take a production system offline for hours. By the end of this lesson you will understand how migrations work, the difference between safe and dangerous migrations, and how to design migrations that run without downtime.

## What a migration is

A migration is a versioned script that describes one or more changes to a database schema. Migrations are applied in order to bring the schema from its current version to the desired version.

```text
MIGRATION FILE STRUCTURE (example — a migration tool like Flyway, Liquibase, or Knex):

  V001__create_users.sql          — creates users table
  V002__add_email_to_users.sql    — adds email column
  V003__create_orders.sql         — creates orders table
  V004__add_order_status_index.sql — adds index on orders.status
  V005__rename_orders_total.sql   — renames total to total_cents

Each migration file has:
  1. A version number (V001, V002, ...) — determines execution order.
  2. A description — what this migration does.
  3. The SQL to apply the change (UP migration).
  4. Optionally, the SQL to undo the change (DOWN migration).

The migration tool tracks which migrations have run (in a schema_migrations table).
On deployment, it runs any migrations that have not yet been applied.
```

```sql
-- Example migration: V005__rename_orders_total.sql
-- UP (apply):
ALTER TABLE orders RENAME COLUMN total TO total_cents;

-- DOWN (undo, if supported):
ALTER TABLE orders RENAME COLUMN total_cents TO total;
```

## Safe vs dangerous migrations

Not all migrations are equal. Some complete in milliseconds; others lock the table and block all reads and writes for minutes.

```text
SAFE MIGRATIONS (typically fast, no downtime):
  ✓ ADD COLUMN with a default value or nullable:
      ALTER TABLE users ADD COLUMN last_login_at TEXT;
      (nullable column — existing rows get NULL; fast)
  
  ✓ ADD INDEX (PostgreSQL CONCURRENTLY, MySQL online DDL):
      CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
      (builds index in background without blocking reads/writes)
  
  ✓ ADD TABLE:
      CREATE TABLE new_feature (...);
      (new table, no impact on existing tables)
  
  ✓ DROP TABLE (with application code removed first):
      DROP TABLE old_feature;
      (safe if no code uses it anymore)

DANGEROUS MIGRATIONS (may lock the table or lose data):
  ✗ ADD NOT NULL COLUMN WITHOUT DEFAULT:
      ALTER TABLE users ADD COLUMN phone TEXT NOT NULL;
      → Fails on existing rows (they have no phone). Requires a default or a multi-step migration.
  
  ✗ CHANGE COLUMN TYPE:
      ALTER TABLE products ALTER COLUMN price TYPE INTEGER;
      → May fail if existing values cannot be cast (TEXT '19.99' cannot cast to INTEGER).
      → In PostgreSQL, rewrites the entire table — locks for minutes on large tables.
  
  ✗ DROP COLUMN with data:
      ALTER TABLE users DROP COLUMN legacy_id;
      → Data is lost. Irreversible without a backup.
  
  ✗ RENAME COLUMN (while application is deployed):
      → The application still references the old name. Queries fail immediately.
```

## The expand-contract pattern for safe migrations

The expand-contract pattern (also called parallel changes) enables changing the schema without downtime by making the migration a three-phase process.

```text
SCENARIO: rename orders.total to orders.total_cents

NAIVE APPROACH (has downtime):
  1. Stop the application.
  2. Run ALTER TABLE orders RENAME COLUMN total TO total_cents.
  3. Deploy new application code that uses total_cents.
  4. Start the application.
  → Downtime: step 1 to step 4.

EXPAND-CONTRACT APPROACH (no downtime):

  PHASE 1 — EXPAND:
    Add the new column alongside the old one:
      ALTER TABLE orders ADD COLUMN total_cents INTEGER;
    Write application code that writes to BOTH columns:
      INSERT INTO orders (total, total_cents, ...) VALUES (amount, amount, ...)
    Deploy this code.
    Run a backfill migration to populate total_cents for existing rows:
      UPDATE orders SET total_cents = total WHERE total_cents IS NULL;
    Now both columns exist and are in sync.

  PHASE 2 — TRANSITION:
    Update application code to READ from total_cents (write still to both).
    Deploy. Verify all queries use total_cents.

  PHASE 3 — CONTRACT:
    Remove the old column:
      ALTER TABLE orders DROP COLUMN total;
    Remove writes to the old column from application code.
    Deploy.
  
  → No downtime. Each phase is independently deployable.
```

**CS lens:** The expand-contract pattern is an application of the **blue-green deployment** principle to schema changes: rather than making a breaking change at one point in time, make additive changes that are backward-compatible, migrate traffic to the new approach, then remove the old approach. The key invariant: at every moment during the migration, at least one version of the application and schema is fully operational. This is the same principle used for online algorithm updates in distributed systems — never take the system into an invalid state, only move between valid states.

## Adding NOT NULL columns safely

Adding a NOT NULL column is one of the most commonly mishandled migrations. The correct approach in production depends on the database and the table size.

```sql
-- WRONG (fails or locks on large tables):
ALTER TABLE users ADD COLUMN verified BOOLEAN NOT NULL DEFAULT false;
-- PostgreSQL (older versions): rewrites every row to add the default value. Minutes of locking.
-- Rows with NULL are rejected.

-- CORRECT multi-step approach for large tables:
-- Step 1: Add nullable with no default (fast — no row rewrite):
ALTER TABLE users ADD COLUMN verified BOOLEAN;

-- Step 2: Backfill existing rows in batches (no single large lock):
UPDATE users SET verified = false WHERE verified IS NULL AND id BETWEEN 1 AND 10000;
UPDATE users SET verified = false WHERE verified IS NULL AND id BETWEEN 10001 AND 20000;
-- ... repeat in batches ...

-- Step 3: Add NOT NULL constraint (fast in PostgreSQL 12+ if default was set, or after backfill):
ALTER TABLE users ALTER COLUMN verified SET NOT NULL;
ALTER TABLE users ALTER COLUMN verified SET DEFAULT false;
```

**SE lens:** Production database migrations have killed more on-call engineers' nights than almost any other operation. The two golden rules: (1) never run a destructive migration (DROP COLUMN, DROP TABLE, DELETE) without first verifying the application no longer uses the data; (2) always test migrations on a copy of production data before running on production. A migration that takes 30 seconds on a 10,000-row development database may take 45 minutes on a 500-million-row production table. Always test with production-scale data.

**Common mistakes:**
- Committing migration files and running them manually — migration state in the database must match migration files in the repo. Running migrations manually bypasses the tracking table. Use the migration tool exclusively.
- Rolling back by editing the migration file — migration files are immutable history. If a migration was wrong, write a new DOWN migration. Editing applied migrations corrupts the migration history.
- Deploying new application code before running the migration — if the code expects `total_cents` but the column does not exist yet, all queries fail. Coordinate: run the migration, then deploy the code (or use expand-contract to decouple them).

**Debug tip:** When a migration fails midway, the database is in a partial state. Check `SELECT * FROM schema_migrations` to see which migrations have been marked as applied. Check the actual table structure (`\d tablename` in psql) to see what was actually applied. If a migration that modifies a large table failed partway through, you may need to manually undo the partial change before re-running.

## Challenge: design_migration

Design a safe migration for a schema change.

```challenge javascript
// SCENARIO:
// The current schema has:
//   orders(id, customer_id, amount, placed_at)
// where `amount` is a REAL (floating-point) number storing dollars.
//
// The new requirement: rename `amount` to `amount_cents` and store as INTEGER cents.
// The table has 50 million rows. Downtime is not acceptable.

const migrationPlan = {
  // How many phases does the expand-contract pattern require for this change?
  phases: 0,

  // What SQL runs in Phase 1 (the "expand" phase)?
  phase1_sql: '',

  // During Phase 1, what must the application write to keep data consistent?
  phase1_app_behavior: '',    // describe in one sentence

  // What SQL runs in the backfill step?
  backfill_sql: '',

  // What SQL runs in Phase 3 (the "contract" phase)?
  phase3_sql: '',

  // Why is ALTER TABLE orders ALTER COLUMN amount TYPE INTEGER dangerous on 50M rows?
  whyDangerous: '',
}
```

```test
const m = migrationPlan
assert m.phases === 3
assert m.phase1_sql.toUpperCase().includes('ADD COLUMN') || m.phase1_sql.toUpperCase().includes('ALTER TABLE')
assert m.phase1_app_behavior.length > 15
assert m.backfill_sql.toUpperCase().includes('UPDATE') && m.backfill_sql.toLowerCase().includes('amount_cents')
assert m.phase3_sql.toUpperCase().includes('DROP COLUMN') || m.phase3_sql.toUpperCase().includes('DROP')
assert m.whyDangerous.toLowerCase().includes('lock') || m.whyDangerous.toLowerCase().includes('rewrite') || m.whyDangerous.toLowerCase().includes('50 million')
```
