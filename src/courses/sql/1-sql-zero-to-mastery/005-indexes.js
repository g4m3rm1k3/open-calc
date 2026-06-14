const lesson = {
  id: "sql-0-005",
  slug: "indexes-query-performance",
  chapter: "sql-0",
  order: 25,
  title: "Indexes & Query Performance",
  subtitle: "Why queries slow down and how indexes fix them",
  tags: ["sql", "indexes", "performance", "query plan", "b-tree"],
  aliases: [
    "sql index",
    "query optimization",
    "slow query",
    "database performance",
  ],

  hook: `A table with 10 rows is instant. A table with 10 million rows makes your query wait 30 seconds.
The fix almost always involves one word: index.
An index is a data structure that lets the database find rows without scanning every single one.`,

  intuition: {
    prose: [
      "**Without an index, a query scans every row.** `WHERE email = 'alice@example.com'` on a million-row table checks each row one by one — a million comparisons. This is a **full table scan** and is slow for large tables.",
      "**An index is a sorted lookup structure.** Like a book's index: instead of reading every page to find 'normalization', you jump directly to page 347. The most common index type is a **B-tree** — it keeps values sorted, enabling point lookups in O(log n), range scans efficiently, and ORDER BY without an extra sort step.",
      "**When to index:** columns frequently used in WHERE, foreign key columns used in JOINs, and columns used in ORDER BY or GROUP BY on large tables. **When not to:** small tables (scans are fine), rarely-queried columns, and tables with very frequent writes (indexes must be maintained on every INSERT/UPDATE/DELETE).",
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Schema setup — 1000 synthetic employees",
              setup: true,
              sql: `CREATE TABLE departments (
  dept_id   INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  budget    REAL NOT NULL
);
INSERT INTO departments VALUES
  (1, 'Engineering', 2000000),
  (2, 'Marketing',    800000),
  (3, 'Sales',       1200000),
  (4, 'HR',           400000),
  (5, 'Finance',      600000);

CREATE TABLE employees (
  emp_id      INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  dept_id     INTEGER REFERENCES departments(dept_id),
  salary      REAL    NOT NULL,
  hire_date   TEXT    NOT NULL,
  active      INTEGER NOT NULL DEFAULT 1
);

-- Generate 500 rows with a recursive CTE
WITH RECURSIVE gen(i) AS (
  SELECT 1
  UNION ALL
  SELECT i+1 FROM gen WHERE i < 500
)
INSERT INTO employees
SELECT
  i                                          AS emp_id,
  'Employee_' || i                           AS name,
  'emp' || i || '@company.com'               AS email,
  1 + (i % 5)                                AS dept_id,
  40000 + (i * 137 % 60000)                  AS salary,
  date('2018-01-01', '+' || (i*7 % 2000) || ' days') AS hire_date,
  CASE WHEN i % 15 = 0 THEN 0 ELSE 1 END    AS active
FROM gen;`,
            },
            {
              id: "q1",
              label: "Without index — full table scan (EXPLAIN QUERY PLAN)",
              sql: `-- SQLite's EXPLAIN QUERY PLAN shows what the optimizer will do.
-- "SCAN employees" = reads every row (slow on big tables)
EXPLAIN QUERY PLAN
SELECT * FROM employees WHERE email = 'emp42@company.com';`,
            },
            {
              id: "q2",
              label: "Create an index on email",
              sql: `CREATE INDEX idx_employees_email ON employees(email);

-- Now check the plan again
EXPLAIN QUERY PLAN
SELECT * FROM employees WHERE email = 'emp42@company.com';
-- "SEARCH employees USING INDEX" = the optimizer now uses the index`,
            },
            {
              id: "q3",
              label: "Range query — also benefits from B-tree index",
              sql: `CREATE INDEX idx_employees_salary ON employees(salary);

EXPLAIN QUERY PLAN
SELECT name, salary, dept_id
FROM employees
WHERE salary BETWEEN 60000 AND 80000
ORDER BY salary;`,
            },
            {
              id: "q4",
              label: "Composite index — when column order matters",
              sql: `-- A composite index covers queries that filter on both columns together
CREATE INDEX idx_emp_dept_salary ON employees(dept_id, salary);

-- This query can use the composite index efficiently
EXPLAIN QUERY PLAN
SELECT name, salary
FROM employees
WHERE dept_id = 1 AND salary > 80000
ORDER BY salary DESC;`,
            },
            {
              id: "q5",
              label: "View all indexes on the database",
              sql: `SELECT name, tbl_name, sql
FROM sqlite_master
WHERE type = 'index'
ORDER BY tbl_name, name;`,
            },
            {
              id: "q6",
              label: "What happens when you add a covering index",
              sql: `-- A covering index contains all columns the query needs
-- The DB never has to touch the main table rows at all
CREATE INDEX idx_emp_cover ON employees(dept_id, salary, name);

EXPLAIN QUERY PLAN
SELECT name, salary
FROM employees
WHERE dept_id = 3
ORDER BY salary DESC;
-- Should show: USING COVERING INDEX`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**B-tree internals.** A balanced tree where leaf nodes hold (key, row pointer) pairs sorted by key. Internal nodes hold routing keys. Height is O(log n) — a million-row table traverses ~20 tree levels. This is why indexed lookups are fast even on large tables.",
      "**Selectivity.** An index is most useful when values are mostly distinct (high selectivity). An index on a boolean column (true/false) is usually useless — half the rows match either value. An index on an email column is highly effective — each value identifies ~1 row.",
      "**Composite index column order.** An index on (dept_id, salary) helps `WHERE dept_id = 1 AND salary > 80000` but does NOT help `WHERE salary > 80000` alone. The leftmost column must be in the filter. Put the most selective (or equality) column first.",
      "**Write overhead.** Every INSERT, UPDATE, or DELETE must update all indexes on that table. Over-indexing slows writes. Index what you query, not everything.",
    ],
  },

  examples: [
    {
      title: "EXPLAIN QUERY PLAN is your best friend",
      body: `Before adding an index, run EXPLAIN QUERY PLAN on the slow query.
Look for "SCAN table" — that's the full scan. After adding the right index,
you should see "SEARCH table USING INDEX". Always verify with EXPLAIN.`,
    },
    {
      title: "Primary keys are automatically indexed",
      body: `You never need to manually create an index on the primary key column.
SQLite (and all relational databases) automatically maintain an index on the primary key.
That's why lookups by ID are fast even on large tables.`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-005-q1",
        type: "choice",
        text: "What does 'SCAN employees' in EXPLAIN QUERY PLAN mean?",
        options: [
          "The query uses a covering index",
          "Every row in the table is read (full table scan)",
          "Only indexed columns are scanned",
          "The query is invalid",
        ],
        answer: "Every row in the table is read (full table scan)",
      },
      {
        id: "sql0-005-q2",
        type: "choice",
        text: "Why does adding an index on every column hurt write performance?",
        options: [
          "Indexes use more RAM during reads",
          "Every INSERT/UPDATE/DELETE must also update each index",
          "The query planner gets confused by too many indexes",
          "Indexes conflict with foreign key constraints",
        ],
        answer: "Every INSERT/UPDATE/DELETE must also update each index",
      },
      {
        id: "sql0-005-q3",
        type: "choice",
        text: "You have a composite index on (dept_id, salary). Which query can use it efficiently?",
        options: [
          "WHERE salary > 50000",
          "WHERE dept_id = 3 AND salary > 50000",
          "WHERE salary > 50000 AND dept_id = 3 ORDER BY name",
          "Both B and C use it equally well",
        ],
        answer: "WHERE dept_id = 3 AND salary > 50000",
      },
    ],
  },

  mentalModel: [
    "Without an index the DB reads every row (full scan, O(n)); a B-tree index gives O(log n)",
    "Primary keys are automatically indexed — you only add indexes for other query columns",
    "Composite index (a, b): the leftmost column must be in the filter to use the index",
    "EXPLAIN QUERY PLAN: look for SCAN (bad) vs SEARCH USING INDEX (good)",
    "Indexes slow down writes — every INSERT/UPDATE/DELETE must update the index too",
  ],
};

export default lesson;
