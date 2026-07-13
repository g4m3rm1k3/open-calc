---
series: sql-fundamentals
level: 1
title: SELECT and FROM
lang: sql
---

# SELECT and FROM

Every piece of data you retrieve from a database starts with a `SELECT` statement. The dashboards that show business metrics, the API endpoints that return JSON to apps, the reports that run every night — they all use `SELECT`. It is the most-used SQL statement by a wide margin.

By the end of this lesson you will be able to write SELECT statements that retrieve specific columns, filter rows with WHERE, use comparison operators and pattern matching, and handle NULL values correctly.

## Basic SELECT syntax

```sql
-- Select all columns
SELECT * FROM courses;

-- Select specific columns
SELECT id, title FROM courses;

-- Add an alias for clarity
SELECT id, title AS course_title FROM courses;

-- Expression in SELECT
SELECT title, length(title) AS title_length FROM courses;
```

```text
-- SELECT * FROM courses:
| id | title               | author_id | created_at  |
|----|---------------------|-----------|-------------|
| 1  | Python Fundamentals | 1         | 2026-01-15  |
| 2  | CSS Mastery         | 1         | 2026-02-10  |
| 3  | JavaScript          | 2         | 2026-03-05  |

-- SELECT id, title AS course_title FROM courses:
| id | course_title        |
|----|---------------------|
| 1  | Python Fundamentals |
| 2  | CSS Mastery         |
| 3  | JavaScript          |
```

`SELECT *` returns every column. In production, avoid `SELECT *` — it returns columns you don't need (wasting bandwidth), breaks if the table schema changes, and makes queries harder to understand. Always name the columns you need.

## WHERE — filtering rows

`WHERE` filters which rows are returned. Only rows where the condition is `TRUE` are included.

```sql
-- Equality
SELECT * FROM users WHERE role = 'admin';

-- Comparison operators: =, <>, !=, <, >, <=, >=
SELECT * FROM courses WHERE author_id = 1;

-- LIKE — pattern matching
-- % matches any sequence of characters
-- _ matches exactly one character
SELECT name FROM users WHERE name LIKE 'A%';  -- starts with A
SELECT name FROM users WHERE name LIKE '%son';  -- ends with son

-- NULL checking (NOT = NULL — use IS NULL instead)
SELECT * FROM courses WHERE author_id IS NULL;
SELECT * FROM courses WHERE author_id IS NOT NULL;
```

```text
-- SELECT * FROM users WHERE role = 'admin':
| id | name  | email             | role  |
|----|-------|-------------------|-------|
| 1  | Alice | alice@example.com | admin |

-- SELECT name FROM users WHERE name LIKE 'A%':
| name  |
|-------|
| Alice |
```

**CS lens:** `WHERE` implements **predicate logic** — a mathematical function from a row to `TRUE`/`FALSE`. The database evaluates the predicate for every row (in a full table scan) or uses an **index** to find matching rows without scanning. An index is a B-tree data structure that maps column values to row locations — like the index at the back of a book. Without an index on the `WHERE` column, large tables are slow.

## AND, OR, NOT — combining conditions

```sql
-- AND — both conditions must be true
SELECT * FROM users WHERE role = 'admin' AND name LIKE 'A%';

-- OR — either condition must be true
SELECT * FROM courses WHERE author_id = 1 OR author_id = 2;

-- IN — shorthand for multiple OR conditions
SELECT * FROM courses WHERE author_id IN (1, 2);

-- NOT — inverts the condition
SELECT * FROM users WHERE NOT role = 'admin';
-- equivalent to: WHERE role <> 'admin'

-- BETWEEN — inclusive range
SELECT * FROM courses WHERE created_at BETWEEN '2026-01-01' AND '2026-06-30';
```

```text
-- WHERE author_id IN (1, 2):
| id | title               | author_id |
|----|---------------------|-----------|
| 1  | Python Fundamentals | 1         |
| 2  | CSS Mastery         | 1         |
| 3  | JavaScript          | 2         |
```

**SE lens:** SQL conditions compile to a query execution plan — the database engine decides whether to use indexes, scan the table, or use other strategies. `IN (1, 2)` is often more efficient than `OR` for multiple values on the same column because the database can use a single index lookup. Understanding that the `WHERE` clause drives query cost is the first step to writing performant SQL.

**Common mistakes:**
- Using `= NULL` instead of `IS NULL` — `NULL = NULL` is `NULL` (not `TRUE`) in SQL's three-valued logic. Always use `IS NULL` / `IS NOT NULL`.
- Putting `LIKE '%term%'` on large tables without full-text search — `%` at the start of a LIKE pattern prevents index use, causing a full table scan. For search, use full-text indexes or a dedicated search engine.

**Debug tip:** In PostgreSQL and MySQL, prefix your query with `EXPLAIN` to see the query execution plan. `EXPLAIN SELECT * FROM courses WHERE author_id = 1` shows whether an index is used. If you see "Seq Scan" (sequential scan) on a large table, you probably need an index.

**Next:** ORDER BY, LIMIT, and DISTINCT — sorting results, limiting the number of rows returned, and removing duplicates.

## Challenge: select_where

Write a SELECT statement that retrieves `title` and `author_id` from `courses` where `author_id = 1`. Use only those two columns — do not use `SELECT *`.

```challenge sql
-- Your SELECT statement:
```

```test
var q = code.trim().toLowerCase().replace(/\s+/g, ' ')
assert q.startsWith('select') && !q.includes('select *')
assert q.includes('title') && q.includes('author_id')
assert q.includes('from courses') && q.includes('where')
assert q.includes('author_id = 1') || q.includes('author_id=1')
assert !q.includes('name') && !q.includes('email')
```
