---
series: sql-fundamentals
level: 6
title: INSERT, UPDATE, DELETE
lang: sql
---

# INSERT, UPDATE, DELETE

Reading data with SELECT is the most common operation, but databases exist to persist changes. INSERT adds new rows, UPDATE modifies existing ones, DELETE removes them. All three operations must be used carefully — there is no "undo" without a transaction.

## INSERT

```sql
-- Insert one row
INSERT INTO users (name, email, role)
VALUES ('Eve', 'eve@example.com', 'student');

-- Insert multiple rows in one statement (faster than multiple INSERTs)
INSERT INTO users (name, email, role)
VALUES
  ('Frank', 'frank@example.com', 'student'),
  ('Grace', 'grace@example.com', 'admin'),
  ('Henry', 'henry@example.com', 'student');

-- Insert from a SELECT (copy rows)
INSERT INTO archived_users (id, name, email)
SELECT id, name, email FROM users WHERE role = 'deactivated';
```

```text
-- After INSERT INTO users ... VALUES ('Eve', ...):
| id | name | email              | role    |
|----|------|--------------------|---------|
| 1  | Alice| alice@example.com  | admin   |
| 2  | Bob  | bob@example.com    | student |
| 3  | Carol| carol@example.com  | student |
| 4  | Eve  | eve@example.com    | student |  ← new row

-- id is auto-assigned (AUTOINCREMENT / SERIAL)
-- Columns not listed (like 'role' if it has a default) get their default values
```

## UPDATE

```sql
-- Update a single row
UPDATE users
SET role = 'admin'
WHERE id = 2;

-- Update multiple columns
UPDATE users
SET name = 'Robert', role = 'moderator'
WHERE email = 'bob@example.com';

-- Update based on a subquery
UPDATE courses
SET status = 'archived'
WHERE author_id IN (
  SELECT id FROM users WHERE active = 0
);
```

```text
-- ALWAYS use WHERE with UPDATE.
-- UPDATE users SET role = 'admin'  ← NO WHERE CLAUSE → changes every user's role!

-- Safe pattern: test your WHERE first:
-- 1. Run: SELECT * FROM users WHERE id = 2   (see what rows match)
-- 2. Run: UPDATE users SET role = 'admin' WHERE id = 2   (same WHERE)
```

**CS lens:** UPDATE is an **in-place mutation** — it modifies existing rows rather than creating new ones. This is different from the **append-only** pattern used in event sourcing and immutable data systems. Relational databases use a write-ahead log (WAL) to record changes before applying them, which enables rollback and crash recovery. When you UPDATE a row, the old value is preserved in the WAL until the transaction commits.

## DELETE

```sql
-- Delete specific rows
DELETE FROM users WHERE id = 4;

-- Delete based on a condition
DELETE FROM enrollments WHERE created_at < '2025-01-01';

-- Delete with JOIN (PostgreSQL / SQL Server syntax)
DELETE FROM enrollments
USING users
WHERE enrollments.user_id = users.id
AND users.active = 0;

-- Truncate — delete ALL rows, faster than DELETE without WHERE
TRUNCATE TABLE temp_import;
```

```text
-- NEVER run DELETE without WHERE in production without a backup.
-- DELETE FROM users;  ← deletes every user.

-- TRUNCATE vs DELETE:
-- TRUNCATE: removes all rows, resets auto-increment, cannot be rolled back in most databases.
-- DELETE without WHERE: removes all rows, can be rolled back (if in a transaction).
```

## Transactions — wrapping multiple statements

A **transaction** groups statements so they succeed or fail as a unit. Either all changes commit, or none do.

```sql
BEGIN;

UPDATE accounts SET balance = balance - 500 WHERE id = 1;  -- debit
UPDATE accounts SET balance = balance + 500 WHERE id = 2;  -- credit

-- If both succeed:
COMMIT;

-- If something goes wrong:
ROLLBACK;  -- both updates are undone
```

```text
-- Without a transaction:
-- If the first UPDATE succeeds and the database crashes before the second,
-- money disappears. Transactions prevent partial updates.

-- ACID properties:
-- Atomicity: all or nothing.
-- Consistency: the database stays valid.
-- Isolation: concurrent transactions don't interfere.
-- Durability: committed changes survive crashes.
```

**SE lens:** Transactions are the reason relational databases power financial systems, healthcare records, and e-commerce. The ACID guarantee — Atomicity, Consistency, Isolation, Durability — was formalized in the 1970s and is what separates a database from a flat file. Every ORM (SQLAlchemy, Prisma, ActiveRecord) wraps your writes in transactions automatically. Understanding transactions means you can debug the cases where the ORM's defaults aren't enough (bulk updates, cross-table operations that must be atomic).

**Common mistakes:**
- Updating or deleting without testing the WHERE clause first — always run `SELECT * FROM table WHERE [condition]` before `UPDATE`/`DELETE` with the same condition.
- Long-running transactions — a transaction holds locks. A transaction that's open for minutes blocks other writers. Keep transactions as short as possible.

**Debug tip:** In PostgreSQL/MySQL, start with `BEGIN;` before any destructive operation you're not sure about. If the result looks wrong, `ROLLBACK;` and nothing changes. Only `COMMIT;` when you're certain.

**Next:** Schema design and indexes — normalisation, foreign keys, constraints, and how indexes speed up queries.

## Challenge: insert_update

Write an INSERT and an UPDATE.

1. Write an INSERT into `products (name, price)` with values `('Widget', 9.99)`.
2. Write an UPDATE on `products` setting `price = 12.99` where `name = 'Widget'`.

```sql
-- Your INSERT:

-- Your UPDATE:
```

```test
var q = code.trim().toLowerCase()
assert q.includes('insert')
assert q.includes('products')
assert q.includes('widget')
assert q.includes('9.99') || q.includes("'widget'")
assert q.includes('update')
assert q.includes('set')
assert q.includes('price')
assert q.includes('12.99')
assert q.includes('where')
```
