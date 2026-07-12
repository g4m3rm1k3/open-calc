---
series: database-design
level: 3
title: Indexes — Making Queries Fast
lang: sql
---

# Indexes — Making Queries Fast

A query on a table with no indexes is a full table scan: the database reads every row to find the ones that match. For 100 rows, this is fine. For 10 million rows, this means reading and comparing 10 million rows for every query. An index is a separate data structure that allows the database to find rows matching a condition without reading the entire table.

Understanding indexes is understanding why some queries are fast and others are slow — not because the SQL is written differently, but because of what the database does internally. By the end of this lesson you will understand how B-tree indexes work, when to create them, what the cost of having too many indexes is, and how to use `EXPLAIN` to verify an index is being used.

## What an index is

An index is a sorted copy of one or more columns, stored separately from the table, with a pointer back to the corresponding table row. It is the database's equivalent of a book's index: a sorted lookup structure that avoids reading everything to find something specific.

```text
TABLE: orders (id, customer_id, placed_at, status, total_cents)
  1000 rows.

QUERY WITHOUT INDEX:
  SELECT * FROM orders WHERE customer_id = 42;
  → Database reads all 1000 rows, checks each for customer_id = 42.
  → 1000 row reads for a result that may be 5 rows.

WITH INDEX ON customer_id:
  → Database uses the index to find rows where customer_id = 42.
  → Reads only the matching rows (e.g., 5 row reads + ~10 index reads).
  → O(log n) instead of O(n).

B-TREE INDEX STRUCTURE for customer_id:
  The index is a sorted B-tree of (customer_id, row_pointer) pairs:
    (1, → row_id 5)
    (1, → row_id 89)
    (7, → row_id 3)
    ...
    (42, → row_id 11)   ← binary search finds this in O(log 1000) ≈ 10 steps
    (42, → row_id 55)
    (42, → row_id 201)
    ...

  Finding customer_id = 42: traverse the B-tree, arrive at the first 42 entry in ≈10 steps.
  Read all 42 entries. Follow the row_pointers to fetch the actual rows.
```

**CS lens:** B-tree (Balanced tree) indexes keep their data sorted and balanced: every path from root to leaf is the same length. This guarantees O(log n) for search, insert, and delete. A B-tree with branching factor 100 stores 100 pointers per node. With 10 million rows: height = log₁₀₀(10,000,000) ≈ 3.5, so at most 4 levels to traverse. Four disk reads to find any row in 10 million. This is why B-trees are universally used for database indexes. (Note: database B-trees are actually B+ trees, where all data is in leaf nodes — this allows efficient range scans by following leaf-level pointers without going back to the root.)

## When to create an index

Create an index on columns that are frequently used in WHERE, JOIN, and ORDER BY clauses.

```sql
-- Common indexing patterns:

-- 1. Index foreign keys — JOINs on unindexed FKs are table scans
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
-- SELECT * FROM orders WHERE customer_id = 42  → uses idx_orders_customer_id

-- 2. Index columns used in WHERE clauses for frequently-run queries
CREATE INDEX idx_orders_status ON orders(status);
-- SELECT * FROM orders WHERE status = 'pending'  → uses idx_orders_status

-- 3. Composite index for queries that filter on multiple columns together
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
-- SELECT * FROM orders WHERE customer_id = 42 AND status = 'pending'
-- Uses the composite index. More specific than either single-column index.

-- 4. Unique index: enforces uniqueness AND speeds up lookups
CREATE UNIQUE INDEX idx_customers_email ON customers(email);
-- Both: ensures no duplicate emails, AND makes "WHERE email = ?" fast.
```

```text
COMPOSITE INDEX RULE (leftmost prefix):
  Index on (customer_id, status) can be used for:
    WHERE customer_id = 42                         ✓ (leftmost column)
    WHERE customer_id = 42 AND status = 'pending'  ✓ (leftmost + next)
    WHERE customer_id = 42 ORDER BY status         ✓ (leftmost, index gives order)
  
  Cannot use for:
    WHERE status = 'pending'   ✗ (not the leftmost column — full scan needed)
  
  Rule: the query must use the index from the left. A composite index (A, B, C) is
  useful for queries on A, A+B, or A+B+C — but not B alone or C alone.
```

## What an index costs

Indexes are not free. Every index is a data structure that must be maintained whenever the table is modified.

```text
COST OF AN INDEX:
  STORAGE:  Each index is a separate B-tree on disk. 10 indexes = 10× the size of the indexed columns.
  INSERT:   Every INSERT into the table must also update every index on that table.
            A table with 10 indexes requires 11 writes per row inserted.
  UPDATE:   An UPDATE on an indexed column updates the index. Expensive on hot columns.
  DELETE:   Every DELETE from the table must remove the row from every index.

WHEN INDEXES HURT:
  → Heavily write-intensive tables (logs, events, metrics).
    Every insert maintains all indexes. Fewer indexes = faster inserts.
  → Columns with very low cardinality (few distinct values).
    A "status" column with values 'active'/'inactive' on a table where 90% are 'active':
    the index on status would return 90% of the table for status='active'. A full scan
    is often faster because there is less overhead.
  → Small tables (< ~1000 rows): full scans are fast enough; index overhead is not worth it.

THE RULE: create indexes that serve real, measured queries. Do not index "just in case."
  Every unused index is write overhead with no read benefit.
```

## EXPLAIN: verifying an index is used

`EXPLAIN` (or `EXPLAIN QUERY PLAN` in SQLite) shows the query execution plan — what the database actually does to execute a query.

```sql
-- Without index:
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 42;
-- Output: SCAN TABLE orders   ← full table scan — reads all rows

-- After creating the index:
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 42;
-- Output: SEARCH TABLE orders USING INDEX idx_orders_customer_id (customer_id=?)
--         ← uses the index

-- Composite index, not leftmost column:
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE status = 'pending';
-- Output: SCAN TABLE orders   ← full scan — status alone not covered by (customer_id, status) index
```

```text
How to read EXPLAIN output:
  SCAN TABLE name         → full table scan (no index used) — potential problem for large tables
  SEARCH TABLE name USING INDEX idx_name → index used — efficient
  SEARCH TABLE name USING COVERING INDEX → index has all needed columns — most efficient (no table row read needed)

When EXPLAIN shows SCAN on a large table for a frequently-run query:
  → Add an index on the columns in the WHERE clause.
  → Then re-run EXPLAIN to confirm it switches to SEARCH.
```

**SE lens:** The workflow for optimising slow queries is: (1) identify the slow query (from application logs or a slow query log), (2) run EXPLAIN on it to see what the database does, (3) if SCAN on a large table — add an index, (4) EXPLAIN again to confirm the index is used, (5) measure the query time before and after. Never add an index without this workflow — you may add it to the wrong column, or the query may have a different bottleneck (returning too many rows, a complex subquery, etc.).

**Common mistakes:**
- Indexing every column — each index is a maintenance cost. Index only columns that appear in WHERE or JOIN conditions for frequently-run queries on large tables.
- Not indexing foreign keys — the most consistently impactful missing index. Every JOIN on an unindexed FK column is a full table scan.
- Expecting the index to be used when the column is inside a function — `WHERE LOWER(email) = 'alice@example.com'` does NOT use an index on `email`. The database cannot use the index because the column is transformed. Use a function-based index or store the column in normalised form.

**Debug tip:** When a query is inexplicably slow after adding an index, run EXPLAIN to check if the index is actually being used. Databases may choose a full scan if the table is small (the planner estimates a scan is faster), if the column has low cardinality, or if statistics are out of date. Run `ANALYZE` (PostgreSQL/SQLite) to refresh the planner's statistics.

## Challenge: index_decisions

For each scenario, decide whether to add an index and on which column(s).

```challenge
const indexDecisions = {
  // Table: products (id, name, category, price_cents, in_stock, created_at)
  // 2 million rows.
  // Frequently run query: SELECT * FROM products WHERE category = 'electronics' AND in_stock = true

  scenario1_addIndex: false,   // true or false
  scenario1_columns:  [],      // column name(s) to index
  scenario1_why:      '',

  // Table: audit_logs (id, action, user_id, resource_type, resource_id, created_at)
  // 500 million rows, written 10,000 times per second, rarely queried.
  // You are tempted to add an index on every column "just in case."
  
  scenario2_addIndex: false,   // true or false — for the "index every column" plan
  scenario2_why: '',

  // Table: users (id, email, name, created_at)
  // 100,000 rows. The login query: SELECT * FROM users WHERE email = 'user@example.com'
  // Currently does a full scan.
  
  scenario3_addIndex: false,
  scenario3_columns:  [],
  scenario3_why:      '',
}
```

```test
const i = indexDecisions
assert i.scenario1_addIndex === true
assert i.scenario1_columns.some(c => c.toLowerCase().includes('category'))
assert i.scenario1_why.length > 15

assert i.scenario2_addIndex === false
assert i.scenario2_why.length > 15

assert i.scenario3_addIndex === true
assert i.scenario3_columns.some(c => c.toLowerCase().includes('email'))
assert i.scenario3_why.length > 15
```
