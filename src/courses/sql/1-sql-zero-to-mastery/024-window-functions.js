const lesson = {
  id: "sql-0-024",
  slug: "window-functions",
  chapter: "sql-0",
  order: 22,
  title: "Window Functions",
  subtitle: "Compute rankings, running totals, and comparisons across rows",
  tags: [
    "sql",
    "window functions",
    "over",
    "partition by",
    "row_number",
    "rank",
    "lag lead",
    "running total",
  ],
  aliases: [
    "window function sql",
    "over partition by sql",
    "row_number sql",
    "rank sql",
    "running total sql",
    "lag lead sql",
  ],

  hook: `GROUP BY collapses rows into groups. But what if you want per-group calculations
without losing individual rows? "Show each sale, plus the running total so far."
"Rank employees by salary within each department."
Window functions do all of this — computing across a set of rows while keeping every row.`,

  mentalModel: [
    "A window function computes a value across a 'window' of rows related to the current row.",
    "OVER() defines the window. PARTITION BY divides rows into groups. ORDER BY sets the frame order.",
    "ROW_NUMBER, RANK, DENSE_RANK number rows within a partition.",
    "SUM/AVG OVER() computes running totals; LAG/LEAD look at previous/next rows.",
  ],

  intuition: {
    prose: [
      "**Window functions compute without collapsing rows.** A regular GROUP BY with SUM collapses all rows in a group into one row. A window function's SUM OVER (PARTITION BY ...) adds a computed column to every original row. You keep all detail AND get the aggregate.",
      "**OVER() is the signal that it's a window function.** Every window function has an OVER clause. `ROW_NUMBER() OVER (ORDER BY salary DESC)` numbers every row by salary rank — without eliminating any rows.",
      "**PARTITION BY divides rows into independent windows.** `ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC)` numbers rows 1, 2, 3... within each department separately. It's like GROUP BY but for window calculations — the numbering restarts for each department.",
      "**RANK vs DENSE_RANK vs ROW_NUMBER.** When two rows tie, RANK gives them the same number and skips the next (1, 1, 3). DENSE_RANK gives the same number without skipping (1, 1, 2). ROW_NUMBER always assigns a unique sequential number even to ties (1, 2, 3 — order between ties is undefined).",
      "**Running totals with SUM OVER ORDER BY.** `SUM(amount) OVER (ORDER BY date)` computes a cumulative sum: for each row, the sum of all rows up to and including the current one. This is a 'running total' or 'cumulative sum'.",
      "**LAG and LEAD access adjacent rows.** `LAG(salary, 1)` gives the previous row's salary. `LEAD(salary, 1)` gives the next row's salary. Combine with subtraction to compute period-over-period change without a self-join.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Window function anatomy",
        body: "```sql\nfunction_name() OVER (\n  PARTITION BY col1, col2   -- optional: groups\n  ORDER BY col3             -- optional: order within group\n  ROWS BETWEEN ...          -- optional: frame clause\n)\n```\n**Common functions:** `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `SUM()`, `AVG()`, `COUNT()`, `MIN()`, `MAX()`, `LAG(col, offset)`, `LEAD(col, offset)`, `FIRST_VALUE(col)`, `LAST_VALUE(col)`, `NTILE(n)`",
      },
      {
        type: "insight",
        title: "Window functions run after WHERE but before ORDER BY",
        body: "Window functions execute after WHERE, GROUP BY, and HAVING — so they see only the filtered rows. To filter on window function results, wrap in a CTE or subquery: `WITH ranked AS (SELECT ..., ROW_NUMBER() OVER ...) SELECT * FROM ranked WHERE rn = 1`.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Sales and employee data",
              setup: true,
              sql: `CREATE TABLE employees (
  emp_id     INTEGER PRIMARY KEY,
  name       TEXT    NOT NULL,
  dept       TEXT    NOT NULL,
  salary     REAL    NOT NULL
);

CREATE TABLE monthly_sales (
  month       TEXT    NOT NULL,  -- 'YYYY-MM'
  rep_name    TEXT    NOT NULL,
  region      TEXT    NOT NULL,
  amount      REAL    NOT NULL,
  PRIMARY KEY (month, rep_name)
);

INSERT INTO employees VALUES
  (1, 'Alice',  'Engineering', 115000),
  (2, 'Bob',    'Engineering',  98000),
  (3, 'Carol',  'Design',       92000),
  (4, 'Dave',   'Engineering',  87000),
  (5, 'Eve',    'Marketing',    78000),
  (6, 'Frank',  'Design',       95000),
  (7, 'Grace',  'Engineering', 125000),
  (8, 'Henry',  'Marketing',    72000);

INSERT INTO monthly_sales VALUES
  ('2024-01', 'Alice', 'West',    48000),
  ('2024-01', 'Bob',   'East',    62000),
  ('2024-01', 'Carol', 'West',    35000),
  ('2024-02', 'Alice', 'West',    55000),
  ('2024-02', 'Bob',   'East',    41000),
  ('2024-02', 'Carol', 'West',    58000),
  ('2024-03', 'Alice', 'West',    71000),
  ('2024-03', 'Bob',   'East',    66000),
  ('2024-03', 'Carol', 'West',    49000);`,
            },
            {
              id: "q1",
              label: "ROW_NUMBER: global vs partitioned ranking",
              sql: `SELECT
  name,
  dept,
  salary,
  ROW_NUMBER() OVER (ORDER BY salary DESC)                      AS global_rank,
  ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC)    AS dept_rank
FROM employees
ORDER BY dept, salary DESC;`,
            },
            {
              id: "q2",
              label: "RANK vs DENSE_RANK: handling ties",
              sql: `-- Let's add a tie to see the difference
WITH test_data(name, score) AS (
  VALUES ('Alice', 95), ('Bob', 90), ('Carol', 90), ('Dave', 85)
)
SELECT
  name,
  score,
  RANK()       OVER (ORDER BY score DESC) AS rank_val,       -- 1,2,2,4 (skips 3)
  DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank_val, -- 1,2,2,3 (no skip)
  ROW_NUMBER() OVER (ORDER BY score DESC) AS row_num         -- 1,2,3,4 (unique)
FROM test_data;`,
            },
            {
              id: "q3",
              label: "Running total with SUM OVER ORDER BY",
              sql: `SELECT
  month,
  rep_name,
  amount,
  SUM(amount) OVER (PARTITION BY rep_name ORDER BY month) AS running_total,
  AVG(amount) OVER (PARTITION BY rep_name ORDER BY month) AS running_avg
FROM monthly_sales
ORDER BY rep_name, month;`,
            },
            {
              id: "q4",
              label: "LAG and LEAD: period-over-period change",
              sql: `SELECT
  month,
  rep_name,
  amount,
  LAG(amount, 1) OVER (PARTITION BY rep_name ORDER BY month)    AS prev_month,
  amount - LAG(amount, 1) OVER (PARTITION BY rep_name ORDER BY month) AS change,
  ROUND(100.0 * (amount - LAG(amount,1) OVER (PARTITION BY rep_name ORDER BY month))
        / LAG(amount,1) OVER (PARTITION BY rep_name ORDER BY month), 1)  AS pct_change
FROM monthly_sales
ORDER BY rep_name, month;`,
            },
            {
              id: "q5",
              label: "Get top N per group using ROW_NUMBER in a CTE",
              sql: `-- Top 2 earners per department
WITH ranked AS (
  SELECT
    name,
    dept,
    salary,
    ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS rn
  FROM employees
)
SELECT name, dept, salary
FROM ranked
WHERE rn <= 2
ORDER BY dept, salary DESC;`,
            },
            {
              id: "challenge",
              label: "Challenge: sales leaderboard",
              sql: `-- For each sales rep:
-- Show their total sales across all months
-- Rank them overall (1 = highest total)
-- Show the running monthly total for each rep
-- Use a CTE to build this step by step
`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Window frames control which rows are included.** By default, `ORDER BY` in OVER creates a frame from the first row to the current row ('ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW'). You can change this: `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` computes a 3-row moving average. `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` includes all rows in the partition.",
      "**NTILE(n) divides rows into n buckets.** `NTILE(4) OVER (ORDER BY salary)` assigns each employee to quartile 1, 2, 3, or 4. Useful for percentile calculations. If rows don't divide evenly, some buckets get one extra row.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Frame clause syntax",
        body: "```sql\nSUM(amount) OVER (\n  ORDER BY date\n  ROWS BETWEEN 6 PRECEDING AND CURRENT ROW\n)\n```\nThis is a 7-day moving sum (current row + 6 before it).\n\n**Keywords:** `UNBOUNDED PRECEDING`, `n PRECEDING`, `CURRENT ROW`, `n FOLLOWING`, `UNBOUNDED FOLLOWING`",
      },
    ],
  },

  examples: [
    {
      title: "7-period moving average",
      body: `SELECT
  month,
  amount,
  ROUND(AVG(amount) OVER (
    ORDER BY month
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ), 0) AS moving_avg_3mo
FROM monthly_sales
WHERE rep_name = 'Alice'
ORDER BY month;`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-024-q1",
        type: "choice",
        text: "What does PARTITION BY do in a window function?",
        options: [
          "Filters rows before the window function runs",
          "Divides rows into independent groups so the window function restarts for each group",
          "Sorts rows within the result set",
          "Creates a temporary table for each partition",
        ],
        answer:
          "Divides rows into independent groups so the window function restarts for each group",
      },
      {
        id: "sql0-024-q2",
        type: "choice",
        text: "Employees A and B both have the highest salary (a tie). What does RANK() give them?",
        options: [
          "Both get rank 1; the next employee gets rank 2",
          "Both get rank 1; the next employee gets rank 3",
          "A gets rank 1, B gets rank 2 (alphabetical tiebreak)",
          "An error is raised due to the tie",
        ],
        answer: "Both get rank 1; the next employee gets rank 3",
      },
      {
        id: "sql0-024-q3",
        type: "choice",
        text: "Why must you use a CTE or subquery to filter on a window function result?",
        options: [
          "Window functions can only appear in CTEs",
          "Window functions run after WHERE, so WHERE can't see the window column; wrap in a subquery",
          "SQLite doesn't support filtering on window functions at all",
          "You must use HAVING to filter on window function results",
        ],
        answer:
          "Window functions run after WHERE, so WHERE can't see the window column; wrap in a subquery",
      },
    ],
  },
};

export default lesson;
