---
series: sql-fundamentals
level: 2
title: Sorting, Limiting, and Distinct
lang: sql
---

# Sorting, Limiting, and Distinct

Raw query results come back in arbitrary order. `ORDER BY` sorts them. `LIMIT` caps the number of rows — essential for pagination and performance. `DISTINCT` removes duplicate values.

## ORDER BY

```sql
-- Ascending (default)
SELECT name, email FROM users ORDER BY name;

-- Descending
SELECT title, created_at FROM courses ORDER BY created_at DESC;

-- Multiple columns: primary sort, then secondary
SELECT name, role FROM users ORDER BY role ASC, name ASC;
```

```text
-- ORDER BY name:
| name  | email              |
|-------|--------------------|
| Alice | alice@example.com  |
| Bob   | bob@example.com    |
| Carol | carol@example.com  |

-- ORDER BY created_at DESC (newest first):
| title               | created_at  |
|---------------------|-------------|
| JavaScript          | 2026-03-05  |
| CSS Mastery         | 2026-02-10  |
| Python Fundamentals | 2026-01-15  |
```

## LIMIT and OFFSET — pagination

```sql
-- First 10 courses
SELECT id, title FROM courses ORDER BY id LIMIT 10;

-- Second page (rows 11-20)
SELECT id, title FROM courses ORDER BY id LIMIT 10 OFFSET 10;

-- Third page (rows 21-30)
SELECT id, title FROM courses ORDER BY id LIMIT 10 OFFSET 20;
```

```text
-- Page 1 (LIMIT 10 OFFSET 0):
| id | title               |
|----|---------------------|
| 1  | Python Fundamentals |
| 2  | CSS Mastery         |
| 3  | JavaScript          |
...

-- Always combine LIMIT with ORDER BY. Without ORDER BY, the database returns
-- rows in no guaranteed order — LIMIT returns arbitrary rows, not stable pages.
```

**CS lens:** `LIMIT/OFFSET` pagination is simple but scales poorly. For page 1000 with OFFSET 10000, the database must scan and skip 10000 rows. At scale, use **keyset pagination** (cursor-based): instead of `OFFSET`, add `WHERE id > last_seen_id` — the database uses an index to jump directly to the next page's first row. This is why Twitter's API returns a `next_cursor` token rather than a page number.

## DISTINCT — removing duplicates

```sql
-- All unique roles in the users table
SELECT DISTINCT role FROM users;

-- All unique author_id values in courses
SELECT DISTINCT author_id FROM courses;

-- DISTINCT on multiple columns — unique combinations
SELECT DISTINCT role, name FROM users;
```

```text
-- SELECT DISTINCT role FROM users:
| role    |
|---------|
| admin   |
| student |
-- (Even if there are 1000 students, only 'student' appears once)
```

**SE lens:** `DISTINCT` is a set operation — it eliminates duplicate rows. It's useful for finding unique values in a column but can be expensive on large tables because the database must sort or hash the results to find duplicates. If you're using `DISTINCT` frequently, it often signals that your JOINs are creating duplicate rows — a schema or query design issue.

**Common mistakes:**
- `ORDER BY` without `LIMIT` on large tables — returns millions of rows sorted, which is slow and transmits far more data than needed.
- `SELECT DISTINCT *` — almost never what you want. If all columns are selected, DISTINCT only removes rows that are identical in every column, which usually means they're complete duplicates.

**Debug tip:** Add `LIMIT 1` to any unfamiliar query before running it — see what shape the result has before fetching all rows. Remove the limit once you're confident.

**Next:** Aggregates — COUNT, SUM, AVG, MIN, MAX, and GROUP BY for summarizing data.

## Challenge: order_limit

Write a query with ORDER BY and LIMIT.

Select `title` from `courses`, ordered by `title` alphabetically, limited to 5 results.

```sql
-- Your query:
```

```test
var q = code.trim().toLowerCase()
assert q.includes('select')
assert q.includes('title')
assert q.includes('from')
assert q.includes('courses')
assert q.includes('order by')
assert q.includes('limit')
assert q.includes('5')
```
