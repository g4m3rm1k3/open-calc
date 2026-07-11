---
series: sql-fundamentals
level: 5
title: Subqueries and CTEs
lang: sql
---

# Subqueries and CTEs

Complex queries often need intermediate results. Subqueries nest a query inside another. CTEs (Common Table Expressions — `WITH` clauses) name those intermediate results, making complex queries readable.

## Subqueries in WHERE

A subquery in the `WHERE` clause computes a value or set of values that the outer query filters against.

```sql
-- Find courses by admin users (subquery in WHERE)
SELECT title FROM courses
WHERE author_id IN (
  SELECT id FROM users WHERE role = 'admin'
);

-- Find the most recent course
SELECT title, created_at FROM courses
WHERE created_at = (
  SELECT MAX(created_at) FROM courses
);

-- Find users who have NO courses
SELECT name FROM users
WHERE id NOT IN (
  SELECT author_id FROM courses WHERE author_id IS NOT NULL
);
```

```text
-- Results depend on data, but structure:
-- IN subquery: returns a list, outer query checks membership
-- = subquery: subquery must return exactly one row
-- NOT IN: users whose id doesn't appear in courses.author_id
```

## CTEs — WITH clause

A CTE names a subquery so it can be referenced like a table. CTEs make complex queries readable and allow the result to be referenced multiple times.

```sql
WITH admin_users AS (
  SELECT id, name FROM users WHERE role = 'admin'
),
popular_courses AS (
  SELECT course_id, COUNT(*) AS enrollment_count
  FROM enrollments
  GROUP BY course_id
  HAVING COUNT(*) > 100
)
SELECT
  admin_users.name AS author,
  courses.title,
  popular_courses.enrollment_count
FROM courses
INNER JOIN admin_users ON courses.author_id = admin_users.id
INNER JOIN popular_courses ON courses.id = popular_courses.course_id
ORDER BY popular_courses.enrollment_count DESC;
```

```text
-- Step 1 (admin_users): filter to admin users
| id | name  |
|----|-------|
| 1  | Alice |

-- Step 2 (popular_courses): courses with >100 enrollments
| course_id | enrollment_count |
|-----------|-----------------|
| 1         | 450             |
| 3         | 230             |

-- Final join — admin-authored courses that are popular:
| author | title   | enrollment_count |
|--------|---------|-----------------|
| Alice  | Python  | 450             |
```

**CS lens:** CTEs are **named subexpressions** in the query's scope. They implement the same concept as `let` bindings in functional languages: give a complex expression a name and use that name multiple times. Without CTEs, you'd either repeat the subquery (duplicated, error-prone) or nest it deeper and deeper (unreadable). CTEs are the SQL equivalent of extracting a complex expression into a named variable.

## Recursive CTEs

Recursive CTEs can query hierarchical data (trees, graphs) without knowing the depth in advance.

```sql
-- Traverse a category hierarchy (parent_id → id)
WITH RECURSIVE category_tree AS (
  -- Base case: start at root categories
  SELECT id, name, parent_id, 0 AS depth
  FROM categories
  WHERE parent_id IS NULL

  UNION ALL

  -- Recursive case: add children
  SELECT c.id, c.name, c.parent_id, ct.depth + 1
  FROM categories c
  INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT name, depth FROM category_tree ORDER BY depth, name;
```

```text
-- Example output for a course category tree:
| name              | depth |
|-------------------|-------|
| Programming       | 0     |
|   Frontend        | 1     |
|     CSS           | 2     |
|     JavaScript    | 2     |
|   Backend         | 1     |
|     Python        | 2     |
|     SQL           | 2     |
```

**SE lens:** CTEs have replaced correlated subqueries as the standard way to express complex logic in SQL. Every major analytics framework — dbt (data build tool), Google's BigQuery, Snowflake — treats CTEs as the fundamental unit of query composition. A dbt model is essentially a named CTE that other models can reference. Understanding CTEs means understanding how data pipelines and analytics workflows are structured.

**Common mistakes:**
- Using subqueries where JOINs work — a correlated subquery that references the outer query runs once per outer row. A JOIN (or CTE) runs once total. The correlated pattern is O(n²); the JOIN pattern is O(n log n) with indexes.
- Naming CTEs with generic names like `data` or `result` — CTE names are documentation. `admin_users`, `popular_courses`, `monthly_revenue` communicate intent. `data1`, `cte2` do not.

**Debug tip:** Test each CTE in isolation. Run just `SELECT * FROM ...` inside the CTE body (without the WITH wrapper) to verify it returns what you expect. Then wrap it in the CTE and build the outer query.

**Next:** Schema design and indexes — how table structure and indexes affect query performance and data integrity.

## Challenge: cte_query

Write a CTE query.

Write a CTE called `active_users` that selects `id` and `name` from `users` where `active = 1`. Then SELECT `name` from `active_users`.

```sql
-- Your CTE:
WITH active_users AS (
  -- your subquery
)
SELECT name FROM active_users;
```

```test
var q = code.trim().toLowerCase()
assert q.includes('with')
assert q.includes('active_users')
assert q.includes('as')
assert q.includes('users')
assert q.includes('active')
assert q.includes('select')
assert q.includes('name')
```
