---
series: sql-fundamentals
level: 4
title: JOINs
lang: sql
---

# JOINs

A JOIN combines rows from two or more tables based on a related column. Without JOINs, relational databases would just be separate flat files. JOINs are what make the "relational" in relational database.

## INNER JOIN — matching rows only

`INNER JOIN` returns rows where both tables have a matching value. Rows without a match are excluded.

```sql
-- Get each course with its author's name
SELECT courses.title, users.name AS author_name
FROM courses
INNER JOIN users ON courses.author_id = users.id;
```

```text
-- courses table        -- users table
| id | title    | author_id |     | id | name  |
|----|----------|-----------|     |----|-------|
| 1  | Python   | 1         |     | 1  | Alice |
| 2  | CSS      | 1         |     | 2  | Bob   |
| 3  | JS       | 2         |     | 3  | Carol |

-- Result:
| title   | author_name |
|---------|-------------|
| Python  | Alice       |
| CSS     | Alice       |
| JS      | Bob         |
-- Carol has no courses — she's excluded from the result.
```

## LEFT JOIN — all rows from the left table

`LEFT JOIN` returns all rows from the left table, with `NULL` for columns from the right table when there's no match.

```sql
-- All users, with their courses (NULL if they have none)
SELECT users.name, courses.title
FROM users
LEFT JOIN courses ON users.id = courses.author_id;
```

```text
| name  | title   |
|-------|---------|
| Alice | Python  |
| Alice | CSS     |
| Bob   | JS      |
| Carol | NULL    |  ← Carol has no courses but still appears
```

**CS lens:** JOIN is the SQL implementation of the **relational algebra join** operation. `INNER JOIN` is the natural join — the intersection. `LEFT JOIN` is the left outer join — the left table's rows, extended with matching right-table data where available. The `ON` clause is the join predicate — it specifies which column values must match. Internally, the database uses hash joins (hash the smaller table, probe with the larger) or nested loop joins depending on table size and indexes.

## Multiple JOINs

You can join more than two tables in a single query.

```sql
-- Enrollments joining users, courses, and a progress table
SELECT
  users.name AS student,
  courses.title AS course,
  progress.completed_levels,
  progress.total_levels
FROM enrollments
INNER JOIN users   ON enrollments.user_id   = users.id
INNER JOIN courses ON enrollments.course_id = courses.id
LEFT JOIN  progress ON progress.enrollment_id = enrollments.id
WHERE users.role = 'student'
ORDER BY users.name, courses.title;
```

```text
| student | course  | completed_levels | total_levels |
|---------|---------|-----------------|--------------|
| Alice   | CSS     | 5               | 9            |
| Alice   | Python  | 36              | 37           |
| Bob     | JS      | 3               | 10           |
| Carol   | CSS     | NULL            | NULL         |  ← no progress yet
```

## JOIN vs subquery

Both can express the same logic. JOINs are usually faster. Subqueries are sometimes more readable.

```sql
-- With JOIN (faster):
SELECT courses.title
FROM courses
INNER JOIN users ON courses.author_id = users.id
WHERE users.role = 'admin';

-- With subquery (more readable for some):
SELECT title
FROM courses
WHERE author_id IN (
  SELECT id FROM users WHERE role = 'admin'
);
```

```text
Both produce: the titles of courses by admin users.

The JOIN version lets the database use a hash join or merge join.
The subquery version computes the subquery first, then filters.
For small result sets, the difference is unnoticeable.
For large tables, the optimizer usually handles both well — but INNER JOIN is clearer about intent.
```

**SE lens:** JOIN is the fundamental operation that lets you keep data normalized (stored without redundancy) and still query it with any combination. Without normalization + JOINs, you'd either duplicate author names in every course row (wasting space, risking inconsistency) or you'd need multiple queries and join them in application code (N+1 query problem). The N+1 problem: fetching 100 courses then making 100 separate queries for their authors is 101 queries. One JOIN is 1 query.

**Common mistakes:**
- Forgetting the `ON` clause — `FROM courses JOIN users` without `ON` is a Cartesian product (every course paired with every user). 3 courses × 3 users = 9 rows. Always add `ON`.
- Using `LEFT JOIN` everywhere instead of `INNER JOIN` — if a foreign key is guaranteed to match, `INNER JOIN` is clearer and sometimes faster.

**Debug tip:** Count the result rows after a JOIN. If you get more rows than expected, you likely have a one-to-many relationship creating duplicates. Add `DISTINCT` or review your join conditions.

**Next:** Subqueries and CTEs — nested queries and WITH clauses for complex multi-step queries.

## Challenge: join_query

Write an INNER JOIN.

Select `courses.title` and `users.name AS author` from `courses` joined to `users` on `courses.author_id = users.id`.

```sql
-- Your JOIN query:
```

```test
var q = code.trim().toLowerCase()
assert q.includes('select')
assert q.includes('title')
assert q.includes('from')
assert q.includes('courses')
assert q.includes('join')
assert q.includes('users')
assert q.includes('on')
assert q.includes('author_id')
```
