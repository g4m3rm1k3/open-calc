---
series: sql-fundamentals
level: 7
title: Schema Design and Indexes
lang: sql
---

# Schema Design and Indexes

The schema is the highest-leverage decision in a web application. A good schema makes queries straightforward and fast. A bad schema means complex queries, slow performance, and data that gets out of sync. Unlike application code, which can be refactored freely, schema changes on a table with millions of rows require careful migration planning and often downtime.

The two most important tools: **normalisation** (storing each fact in exactly one place) and **indexes** (data structures that make lookups fast without reading every row).

By the end of this lesson you will understand why normalisation prevents data inconsistency, how database constraints enforce invariants even when application code has bugs, and when and how to create indexes.

## Normalisation — avoiding redundancy

Normalisation means storing data once, referencing it elsewhere. The goal: no redundancy, no update anomalies.

```sql
-- Denormalised (bad): author name stored in every course row
CREATE TABLE courses_bad (
  id          INTEGER PRIMARY KEY,
  title       TEXT,
  author_name TEXT,   -- duplicated everywhere
  author_email TEXT   -- if Alice changes email, update 50 rows or be inconsistent
);

-- Normalised (good): author data stored once in users, referenced by ID
CREATE TABLE users (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);
CREATE TABLE courses (
  id        INTEGER PRIMARY KEY,
  title     TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id)  -- foreign key
);
```

```text
-- If Alice changes her email:
-- Denormalised: must update every course row with Alice's email
-- Normalised:   update ONE row in users — courses still reference the right user

-- The "update anomaly": denormalised data can get out of sync.
-- In a large production database, this causes silent data corruption.
```

## Constraints — database-enforced rules

Constraints enforce rules at the database level — not in application code. They catch bugs even if the application has a bug.

```sql
CREATE TABLE enrollments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, course_id)   -- a user can only enroll in a course once
);

CREATE TABLE orders (
  id       INTEGER PRIMARY KEY,
  amount   REAL NOT NULL CHECK (amount > 0),    -- amount must be positive
  status   TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled'))
);
```

```text
-- UNIQUE (user_id, course_id): attempts to enroll twice fail with a constraint error
-- CHECK (amount > 0): negative orders are rejected at the database level, not just the app
-- ON DELETE CASCADE: if a user is deleted, their enrollments are deleted automatically
-- ON DELETE RESTRICT (default): prevents deleting a user who has enrollments
```

**CS lens:** Constraints implement **invariants** at the data layer — properties that must always be true. `UNIQUE` is a set invariant (no duplicates). `CHECK` is a predicate invariant (value satisfies a condition). `NOT NULL` is an existence invariant (value must be present). The database engine enforces these as atomic operations during INSERT/UPDATE, even under concurrent writes. Application-level validation (checking in API code) is not a substitute — two concurrent requests can both pass validation and then both insert, violating a uniqueness constraint.

## Indexes — making queries fast

Without an index, the database reads every row to find matches (a full table scan). An index is a B-tree that maps column values to row locations, making lookups O(log n) instead of O(n).

```sql
-- Without index: SELECT * FROM users WHERE email = 'alice@example.com'
-- Scans every row. On a 1M-row table: ~1M comparisons.

-- Create an index:
CREATE INDEX idx_users_email ON users(email);
-- Now the same query: ~20 comparisons (log₂(1M) ≈ 20).

-- Composite index — index on multiple columns (order matters)
CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);
-- Fast for: WHERE user_id = 1 AND course_id = 5
-- Fast for: WHERE user_id = 1 (uses leftmost column)
-- NOT fast for: WHERE course_id = 5 only (doesn't use the leftmost column)

-- Unique index (also enforces uniqueness)
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);
```

```text
-- When to add an index:
-- ✓ Columns used in WHERE clauses frequently
-- ✓ Columns used in JOIN ON conditions
-- ✓ Columns used in ORDER BY (avoids sort step)
-- ✗ Don't index every column — indexes slow down INSERT/UPDATE/DELETE
--   because the database must update the index too.

-- Rule of thumb: add indexes for the columns you query by.
-- Start with no indexes except PRIMARY KEY; add others when queries are slow.
```

**SE lens:** Schema design is the highest-leverage technical decision in a web application. A well-designed schema makes queries simple and fast. A poorly-designed schema means complex queries, slow performance, and data that can get inconsistent. This is why experienced engineers spend significant time on schema design before writing application code. The schema is the foundation — everything else is built on it.

**Common mistakes:**
- Adding too many indexes — each index adds overhead to writes. A table with 10 indexes on a write-heavy workload will be slow to insert to.
- No foreign key constraints — without FKs, you can have orphaned rows (courses referencing deleted users). The database won't prevent it, application bugs will create it.

**Debug tip:** Run `EXPLAIN QUERY PLAN SELECT ...` (SQLite) or `EXPLAIN ANALYZE SELECT ...` (PostgreSQL) to see if your indexes are being used. "SCAN TABLE" or "Seq Scan" = full scan = probably needs an index. "SEARCH TABLE USING INDEX" or "Index Scan" = fast.

**Congratulations — SQL Fundamentals complete!** You've covered SELECT, WHERE, ORDER BY, aggregates, JOINs, subqueries, CTEs, INSERT/UPDATE/DELETE, schema design, and indexes.

## Challenge: schema_design

Write two `CREATE TABLE` statements for a simple blog:

1. `authors` table with columns: `id INTEGER PRIMARY KEY`, `name TEXT NOT NULL`, `email TEXT UNIQUE NOT NULL`.
2. `posts` table with columns: `id INTEGER PRIMARY KEY`, `title TEXT NOT NULL`, `body TEXT`, `author_id INTEGER NOT NULL REFERENCES authors(id)`.

The `REFERENCES authors(id)` makes `author_id` a foreign key — the database will reject any post with an `author_id` that doesn't exist in `authors`.

```sql
-- Your CREATE TABLE statements:
```

```test
var q = code.trim().toLowerCase().replace(/\s+/g, ' ')
assert q.includes('create table authors')
assert q.includes('create table posts')
assert (q.match(/create table/g) || []).length >= 2
assert q.includes('primary key')
assert q.includes('not null')
assert q.includes('unique')
assert q.includes('references authors')
assert q.includes('author_id')
assert q.includes('email')
```
