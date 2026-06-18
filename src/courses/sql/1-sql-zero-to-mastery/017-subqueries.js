const lesson = {
  id: "sql-0-019",
  slug: "subqueries",
  chapter: "sql-0",
  order: 17,
  title: "Subqueries",
  subtitle: "Use one query's result inside another query",
  tags: [
    "sql",
    "subquery",
    "nested query",
    "in select",
    "exists",
    "correlated subquery",
  ],
  aliases: [
    "nested query sql",
    "subquery sql",
    "select in select",
    "sql in subquery",
    "exists sql",
  ],

  hook: `Sometimes you need to answer a question whose answer depends on another question.
"Find customers who spent more than the average order value."
The average order value is itself a query.
Subqueries let you embed one query inside another — building up complexity step by step.`,

  mentalModel: [
    "A subquery is a SELECT statement inside another SELECT, WHERE, or FROM clause.",
    "Scalar subqueries return one value and can be used anywhere a single value is valid.",
    "IN (subquery) tests whether a value appears in the subquery's result set.",
    "Correlated subqueries reference the outer query's row and run once per outer row.",
  ],

  intuition: {
    prose: [
      "**A subquery is just a query inside another query.** The inner query runs first, and its result is used by the outer query. You can think of it as a question whose answer feeds into a larger question.",
      "**Scalar subquery: returns exactly one value.** `SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)` — the inner query computes the average salary (one number), and the outer query filters using that number. The inner query must return exactly one row and one column here.",
      "**IN with subquery: test membership.** `WHERE customer_id IN (SELECT customer_id FROM orders WHERE total > 500)` finds all customers who have placed at least one large order. The subquery returns a list of IDs, and IN tests each row's customer_id against that list.",
      "**Subquery in FROM: treat a query as a table.** You can wrap a SELECT in the FROM clause and query it like a table. This is called a derived table or inline view: `SELECT dept, avg_salary FROM (SELECT department AS dept, AVG(salary) AS avg_salary FROM employees GROUP BY department) WHERE avg_salary > 90000`. The parenthesized query becomes a temporary named result.",
      "**EXISTS: test whether a subquery returns any rows.** `WHERE EXISTS (SELECT 1 FROM orders WHERE customer_id = c.customer_id)` returns TRUE if the customer has any orders. It's more efficient than IN for large subqueries because it stops as soon as one matching row is found.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Types of subqueries",
        body: "**Scalar subquery:** Returns one row, one column. Used like a single value.\n**Row subquery:** Returns one row, multiple columns. Used for row comparisons.\n**Table subquery:** Returns multiple rows and columns. Used in FROM or with IN/EXISTS.\n**Correlated subquery:** References outer query's columns. Runs once per outer row.",
      },
      {
        type: "insight",
        title: "Subquery vs. JOIN — when to use which",
        body: "Subqueries are easier to reason about step-by-step. JOINs are usually more efficient and can return columns from both tables. If you need columns from both tables in the result, use JOIN. If you just need to filter based on another table's data, either works — EXISTS tends to be fastest.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Employees and departments",
              setup: true,
              sql: `CREATE TABLE departments (
  dept_id   INTEGER PRIMARY KEY,
  name      TEXT    NOT NULL,
  budget    REAL    NOT NULL
);

CREATE TABLE employees (
  emp_id     INTEGER PRIMARY KEY,
  name       TEXT    NOT NULL,
  dept_id    INTEGER REFERENCES departments(dept_id),
  salary     REAL    NOT NULL,
  hire_year  INTEGER NOT NULL
);

INSERT INTO departments VALUES
  (1, 'Engineering', 2000000),
  (2, 'Design',       800000),
  (3, 'Marketing',    600000),
  (4, 'Sales',        900000);

INSERT INTO employees VALUES
  (1,  'Alice Chen',    1, 115000, 2020),
  (2,  'Bob Patel',     1,  98000, 2021),
  (3,  'Carol Kim',     2,  92000, 2020),
  (4,  'Dave Nguyen',   1,  87000, 2022),
  (5,  'Eve Torres',    3,  78000, 2021),
  (6,  'Frank Liu',     2,  95000, 2020),
  (7,  'Grace Osei',    1, 125000, 2019),
  (8,  'Henry Park',    3,  72000, 2022),
  (9,  'Iris Nakamura', 2,  88000, 2021),
  (10, 'James Wu',      1, 110000, 2020),
  (11, 'Kate Lee',      4,  82000, 2022),
  (12, 'Leo Russo',     4,  89000, 2021);`,
            },
            {
              id: "q1",
              label: "Scalar subquery: above-average salary",
              sql: `-- First, find the average salary (the scalar subquery)
SELECT AVG(salary) AS avg_salary FROM employees;

-- Then use it to filter (with subquery embedded)
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees)
ORDER BY salary DESC;`,
            },
            {
              id: "q2",
              label: "IN with subquery: employees in high-budget departments",
              sql: `-- Which departments have budget > 800000?
SELECT dept_id FROM departments WHERE budget > 800000;

-- Use that list with IN
SELECT name, dept_id, salary
FROM employees
WHERE dept_id IN (SELECT dept_id FROM departments WHERE budget > 800000)
ORDER BY dept_id, salary DESC;`,
            },
            {
              id: "q3",
              label: "NOT IN: employees NOT in those departments",
              sql: `SELECT name, dept_id, salary
FROM employees
WHERE dept_id NOT IN (SELECT dept_id FROM departments WHERE budget > 800000)
ORDER BY dept_id;`,
            },
            {
              id: "q4",
              label: "Subquery in FROM: derived table",
              sql: `-- Step 1: compute per-dept stats as a derived table
-- Step 2: filter that derived table
SELECT dept_name, headcount, avg_sal
FROM (
  SELECT
    d.name                      AS dept_name,
    COUNT(e.emp_id)             AS headcount,
    ROUND(AVG(e.salary), 0)     AS avg_sal
  FROM departments d
  JOIN employees e ON d.dept_id = e.dept_id
  GROUP BY d.dept_id
) AS dept_summary
WHERE avg_sal > 90000
ORDER BY avg_sal DESC;`,
            },
            {
              id: "q5",
              label:
                "Correlated subquery: compare each employee to dept average",
              sql: `-- A correlated subquery references the outer query's row (e.dept_id)
-- It runs once for each employee row
SELECT
  e.name,
  e.salary,
  ROUND((SELECT AVG(e2.salary)
         FROM employees e2
         WHERE e2.dept_id = e.dept_id), 0) AS dept_avg,
  CASE WHEN e.salary > (SELECT AVG(e2.salary) FROM employees e2 WHERE e2.dept_id = e.dept_id)
       THEN 'above average' ELSE 'below average' END AS vs_dept
FROM employees e
ORDER BY e.dept_id, e.salary DESC;`,
            },
            {
              id: "challenge",
              label: "Challenge: top earner per department",
              sql: `-- Find the highest-paid employee in each department
-- Using a subquery approach:
-- Hint: for each employee, check if salary = MAX(salary) in their dept
-- Show: name, dept_id, salary
`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Correlated subqueries are powerful but potentially slow.** A correlated subquery that runs once per outer row can become O(n²) for large tables. The query planner may be able to optimize it, but CTEs (next lesson) and JOINs often express the same logic more efficiently.",
      "**NOT IN with NULL is a trap.** `WHERE x NOT IN (SELECT col FROM t)` returns no rows if any value in the subquery result is NULL. This is because `x <> NULL` is NULL (unknown), and NOT IN requires all comparisons to be FALSE. Use `NOT EXISTS` instead when the subquery column might contain NULLs.",
    ],
    callouts: [
      {
        type: "warning",
        title: "NOT IN + NULL = no results",
        body: "`WHERE dept_id NOT IN (1, 2, NULL)` matches nothing — because `dept_id <> NULL` is NULL, which is not FALSE. Safe alternative: `WHERE NOT EXISTS (SELECT 1 FROM t2 WHERE t2.id = t1.id)` — EXISTS handles NULLs correctly.",
      },
    ],
  },

  examples: [
    {
      title: "Find the second-highest salary",
      body: `SELECT MAX(salary) AS second_highest_salary
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-019-q1",
        type: "choice",
        text: "A scalar subquery must return:",
        options: [
          "Multiple rows, one column",
          "One row, multiple columns",
          "Exactly one row and one column",
          "Any number of rows and columns",
        ],
        answer: "Exactly one row and one column",
      },
      {
        id: "sql0-019-q2",
        type: "choice",
        text: "What does a correlated subquery do?",
        options: [
          "Runs once and caches the result for all outer rows",
          "References columns from the outer query and runs once for each outer row",
          "Returns a single table that the outer query queries",
          "Automatically creates an index for performance",
        ],
        answer:
          "References columns from the outer query and runs once for each outer row",
      },
      {
        id: "sql0-019-q3",
        type: "choice",
        text: "Why should you prefer NOT EXISTS over NOT IN when the subquery might return NULLs?",
        options: [
          "NOT EXISTS is always faster than NOT IN",
          "NOT IN with any NULL in the result returns no rows due to three-valued logic",
          "NOT EXISTS requires fewer table scans",
          "NOT IN doesn't support subqueries with NULLs",
        ],
        answer:
          "NOT IN with any NULL in the result returns no rows due to three-valued logic",
      },
    ],
  },
};

export default lesson;
