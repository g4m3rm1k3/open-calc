---
series: sql-fundamentals
level: 3
title: Aggregates and GROUP BY
lang: sql
---

# Aggregates and GROUP BY

Every dashboard, report, and analytics feature relies on aggregate queries. "How many users signed up this month?" "What is the average order value?" "Which course has the most enrollments?" None of these can be answered with a plain SELECT — they need values computed across multiple rows.

**Aggregate functions** reduce a set of rows to a single computed value. **GROUP BY** partitions rows into groups so aggregates are computed per group instead of across all rows at once.

By the end of this lesson you will be able to use COUNT, SUM, AVG, MIN, and MAX, group results with GROUP BY, and filter groups with HAVING.

## Aggregate functions

```sql
-- COUNT: how many rows
SELECT COUNT(*) FROM users;                        -- all rows
SELECT COUNT(email) FROM users;                    -- non-NULL emails only
SELECT COUNT(DISTINCT role) FROM users;            -- unique roles

-- SUM, AVG, MIN, MAX
SELECT SUM(price) FROM orders;
SELECT AVG(price) FROM orders;
SELECT MIN(created_at) FROM courses;
SELECT MAX(created_at) FROM courses;
```

```text
-- Assume: users has 150 rows, 3 unique roles
SELECT COUNT(*) FROM users;         -- 150
SELECT COUNT(DISTINCT role) FROM users;  -- 3

-- Assume: courses has these created_at values: 2026-01-15, 2026-02-10, 2026-03-05
SELECT MIN(created_at) FROM courses;  -- 2026-01-15
SELECT MAX(created_at) FROM courses;  -- 2026-03-05
```

**CS lens:** Aggregate functions implement **reduction** — combining multiple values into one. This is the same as `reduce()` in JavaScript or Python's `functools.reduce()`. `COUNT(*)` is a reduce with `(acc, _) => acc + 1`. `SUM` is `(acc, val) => acc + val`. Understanding this connection helps: SQL aggregates and array reduce are the same abstraction at different levels.

## GROUP BY — aggregating per group

`GROUP BY` splits rows into groups and applies aggregate functions to each group.

```sql
-- How many users have each role?
SELECT role, COUNT(*) AS user_count
FROM users
GROUP BY role;

-- Average price per category
SELECT category, AVG(price) AS avg_price, COUNT(*) AS item_count
FROM products
GROUP BY category
ORDER BY avg_price DESC;
```

```text
-- SELECT role, COUNT(*) FROM users GROUP BY role:
| role    | user_count |
|---------|------------|
| admin   | 3          |
| student | 147        |

-- ORDER tells you: GROUP BY goes before ORDER BY in the SQL clause order:
-- SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT
```

## HAVING — filtering groups

`WHERE` filters individual rows before grouping. `HAVING` filters groups after aggregation.

```sql
-- Only show roles with more than 10 users
SELECT role, COUNT(*) AS user_count
FROM users
GROUP BY role
HAVING COUNT(*) > 10;

-- Only show categories where avg price > 50
SELECT category, AVG(price) AS avg_price
FROM products
GROUP BY category
HAVING AVG(price) > 50
ORDER BY avg_price DESC;
```

```text
-- The clause order matters: WHERE filters rows, then GROUP BY groups them,
-- then HAVING filters the groups, then ORDER BY sorts, then LIMIT caps.

-- Common mistake: WHERE role_count > 10 — 'role_count' doesn't exist yet,
-- because WHERE runs before GROUP BY. Use HAVING for aggregate conditions.
```

**SE lens:** The `GROUP BY → HAVING` pattern is the foundation of every analytics query you'll write. "Users who enrolled in more than 3 courses" — GROUP BY user_id, HAVING COUNT(enrollment) > 3. "Products with below-average ratings" — GROUP BY product_id, HAVING AVG(rating) < 3. These patterns are in every dashboard, recommendation engine, and business report. SQL's declarative nature means you state *what* you want; the database engine decides *how* to compute it efficiently.

**Common mistakes:**
- Selecting non-aggregated, non-grouped columns — `SELECT name, COUNT(*)` without `name` in GROUP BY is an error in strict databases (PostgreSQL). SQLite may allow it but returns arbitrary values.
- Confusing WHERE and HAVING — WHERE filters individual rows, HAVING filters groups. `WHERE COUNT(*) > 10` is always wrong. `HAVING COUNT(*) > 10` after GROUP BY is correct.

**Debug tip:** Build GROUP BY queries incrementally. First write the SELECT and FROM. Then add GROUP BY. Then check the result. Then add HAVING. Each step is verifiable — don't write all clauses at once.

**Next:** JOINs — combining data from multiple tables.

## Challenge: group_by

Write a query that counts users per role. Select `role` and `COUNT(*) AS user_count` from `users`, grouped by `role`, ordered by `user_count` descending.

```sql
-- Your query:
```

```test
var q = code.trim().toLowerCase().replace(/\s+/g, ' ')
assert q.includes('select')
assert q.includes('role')
assert q.includes('count(*)')
assert q.includes('as user_count')
assert q.includes('from users')
assert q.includes('group by role')
assert q.includes('order by user_count desc') || q.includes('order by 2 desc')
```
