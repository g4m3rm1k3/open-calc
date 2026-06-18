const lesson = {
  id: "sql-0-012",
  slug: "order-limit",
  chapter: "sql-0",
  order: 8,
  title: "ORDER BY and LIMIT",
  subtitle: "Sort your results and take only what you need",
  tags: ["sql", "order by", "limit", "offset", "sort", "pagination"],
  aliases: [
    "order by sql",
    "sort sql",
    "limit sql",
    "top n rows",
    "pagination sql",
  ],

  hook: `Without ORDER BY, a database returns rows in no guaranteed order.
One run might give you rows alphabetically. The next run might give them in insertion order.
If order matters — and it usually does — you must ask for it explicitly.
LIMIT takes this further: "give me the top 10" or "give me page 2 of results."`,

  mentalModel: [
    "ORDER BY sorts the result set. ASC (ascending, default) or DESC (descending).",
    "You can sort by multiple columns — the first column breaks ties, then the second, and so on.",
    "LIMIT N returns only the first N rows after sorting. OFFSET M skips the first M rows.",
    "LIMIT + OFFSET enables pagination: page 1 = LIMIT 10 OFFSET 0, page 2 = LIMIT 10 OFFSET 10.",
  ],

  intuition: {
    prose: [
      "**Without ORDER BY, row order is undefined.** Databases store rows in whatever internal arrangement is most efficient. Never assume rows will come back in insertion order, alphabetical order, or any other order unless you explicitly sort them. If you care about order — and users always do — write ORDER BY.",
      "**ORDER BY sorts ascending by default.** `ORDER BY price` returns the cheapest first. `ORDER BY price DESC` returns the most expensive first. ASC is the default and is usually omitted, but you can write it explicitly for clarity.",
      "**Sort by multiple columns for stable ordering.** `ORDER BY category, price` sorts by category alphabetically first, then within each category, by price ascending. The second column only breaks ties in the first. You can mix ASC and DESC per column: `ORDER BY category ASC, price DESC`.",
      "**LIMIT controls how many rows you get back.** `SELECT * FROM products ORDER BY price DESC LIMIT 5` returns the 5 most expensive products. This is essential for performance — if a table has 10 million rows and you only need the top 10, don't fetch all 10 million.",
      "**OFFSET enables pagination.** `LIMIT 10 OFFSET 20` skips the first 20 rows and returns rows 21–30. This is how 'next page' works in any app. Page N = `LIMIT page_size OFFSET (N-1) * page_size`.",
    ],
    callouts: [
      {
        type: "insight",
        title: "NULL sorts last in ascending order (SQLite default)",
        body: "In SQLite, NULLs sort before all other values in ASC order and after all other values in DESC order. This differs from PostgreSQL (NULLs last in ASC by default) and MySQL. Use `ORDER BY col ASC NULLS LAST` or `NULLS FIRST` to be explicit.",
      },
      {
        type: "warning",
        title: "OFFSET pagination gets slow on large tables",
        body: "LIMIT 10 OFFSET 1000000 still reads and discards 1 million rows before returning 10. For large datasets, use 'keyset pagination' instead: `WHERE id > last_seen_id LIMIT 10`. This uses an index and is O(log n) instead of O(n).",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Employee dataset",
              setup: true,
              sql: `CREATE TABLE employees (
  emp_id     INTEGER PRIMARY KEY,
  name       TEXT    NOT NULL,
  department TEXT    NOT NULL,
  salary     REAL    NOT NULL,
  hire_date  TEXT    NOT NULL,
  manager_id INTEGER  -- NULL for top-level employees
);

INSERT INTO employees VALUES
  (1,  'Alice Chen',    'Engineering', 115000, '2020-03-15', NULL),
  (2,  'Bob Patel',     'Engineering',  98000, '2021-06-01', 1),
  (3,  'Carol Kim',     'Design',       92000, '2020-09-10', NULL),
  (4,  'Dave Nguyen',   'Engineering',  87000, '2022-01-20', 1),
  (5,  'Eve Torres',    'Marketing',    78000, '2021-11-05', NULL),
  (6,  'Frank Liu',     'Design',       95000, '2020-07-22', 3),
  (7,  'Grace Osei',    'Engineering', 125000, '2019-04-01', NULL),
  (8,  'Henry Park',    'Marketing',    72000, '2022-08-15', 5),
  (9,  'Iris Nakamura', 'Design',       88000, '2021-02-28', 3),
  (10, 'James Wu',      'Engineering', 110000, '2020-12-01', 7);`,
            },
            {
              id: "q1",
              label: "Sort by salary — lowest to highest (default ASC)",
              sql: `SELECT name, department, salary
FROM employees
ORDER BY salary;`,
            },
            {
              id: "q2",
              label: "Sort by salary — highest to lowest (DESC)",
              sql: `SELECT name, department, salary
FROM employees
ORDER BY salary DESC;`,
            },
            {
              id: "q3",
              label: "Sort by multiple columns",
              sql: `-- Sort by department (A-Z), then within each department by salary (highest first)
SELECT name, department, salary
FROM employees
ORDER BY department ASC, salary DESC;`,
            },
            {
              id: "q4",
              label: "LIMIT: top 3 highest-paid employees",
              sql: `SELECT name, department, salary
FROM employees
ORDER BY salary DESC
LIMIT 3;`,
            },
            {
              id: "q5",
              label: "LIMIT + OFFSET: pagination",
              sql: `-- Page 1: rows 1-3
SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3 OFFSET 0;`,
            },
            {
              id: "q6",
              label: "OFFSET: page 2",
              sql: `-- Page 2: rows 4-6
SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3 OFFSET 3;`,
            },
            {
              id: "q7",
              label: "Sort NULLs — where does manager_id = NULL sort?",
              sql: `-- In SQLite, NULLs sort first in ASC
SELECT name, manager_id
FROM employees
ORDER BY manager_id ASC;
-- NULL rows appear first`,
            },
            {
              id: "challenge",
              label: "Challenge: junior engineers",
              sql: `-- Find the 3 most recently hired engineers
-- (department = 'Engineering', sorted by hire_date most recent first)
-- Show: name, hire_date, salary
`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**ORDER BY is the last logical step before LIMIT.** In SQL's logical evaluation order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT/OFFSET. ORDER BY runs after SELECT, which means you can ORDER BY an alias defined in SELECT. You cannot ORDER BY in a subquery unless it also has a LIMIT.",
      "**Sort stability.** SQL does not guarantee a stable sort — rows with equal sort keys may appear in any order, and that order may differ between runs. To get a fully deterministic result, your ORDER BY must uniquely identify the order of every row: `ORDER BY department, salary, emp_id`. Adding the primary key as a final tiebreaker makes sorting fully deterministic.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Full syntax",
        body: "`SELECT ... FROM ... WHERE ... ORDER BY col1 [ASC|DESC] [NULLS FIRST|LAST], col2 ... LIMIT n OFFSET m`\n\nSQLite shorthand: `LIMIT n, m` means `LIMIT n OFFSET m` (comma syntax).",
      },
    ],
  },

  examples: [
    {
      title: "Get the Nth highest value",
      body: `-- 2nd highest salary (N=2: skip 1, take 1)
SELECT name, salary
FROM employees
ORDER BY salary DESC
LIMIT 1 OFFSET 1;`,
    },
    {
      title: "Random sample",
      body: `-- Get 5 random rows (for testing, sampling, etc.)
SELECT * FROM employees
ORDER BY RANDOM()
LIMIT 5;
-- RANDOM() returns a different value each call — results are random every run`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-012-q1",
        type: "choice",
        text: "What does ORDER BY price DESC LIMIT 5 return?",
        options: [
          "The 5 cheapest products",
          "The 5 most expensive products",
          "All products sorted by price descending",
          "5 random products",
        ],
        answer: "The 5 most expensive products",
      },
      {
        id: "sql0-012-q2",
        type: "choice",
        text: "What does LIMIT 10 OFFSET 20 return?",
        options: [
          "The first 10 rows",
          "Rows 20 through 29",
          "Rows 21 through 30",
          "10 rows starting after the 20th row (rows 21–30)",
        ],
        answer: "10 rows starting after the 20th row (rows 21–30)",
      },
      {
        id: "sql0-012-q3",
        type: "choice",
        text: "ORDER BY department, salary DESC sorts how?",
        options: [
          "By department descending, then salary descending",
          "By department ascending (A-Z), then within each department by salary highest first",
          "By salary descending only — department is ignored",
          "Randomly, because two columns conflict",
        ],
        answer:
          "By department ascending (A-Z), then within each department by salary highest first",
      },
    ],
  },
};

export default lesson;
