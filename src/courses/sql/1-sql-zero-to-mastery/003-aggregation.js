const lesson = {
  id: "sql-0-003",
  slug: "aggregation-grouping",
  chapter: "sql-0",
  order: 12,
  title: "Aggregation & GROUP BY",
  subtitle: "COUNT, SUM, AVG, and collapsing rows into summaries",
  tags: ["sql", "aggregation", "group by", "having", "count", "sum"],
  aliases: ["group by sql", "aggregate functions", "sql counting", "sql sum"],

  hook: `"How many orders did each customer place?" — that question requires collapsing many rows into one per customer.
That's aggregation. GROUP BY is the instruction that says where the boundaries between groups are.
Without it, you're stuck counting rows one by one.`,

  intuition: {
    prose: [
      "**Aggregate functions collapse rows into a single value.** `COUNT(*)` counts rows, `SUM(col)` totals them, `AVG(col)` averages them, `MIN`/`MAX` find extremes. Without GROUP BY, the aggregate runs over all rows and returns one number.",
      "**GROUP BY divides the table into groups.** `GROUP BY rep` draws a boundary between rows with different `rep` values. The aggregate function runs independently within each group, producing one output row per group. Mental model: sort by the grouping column, then draw lines between groups.",
      "**WHERE vs HAVING.** WHERE filters individual rows *before* grouping. HAVING filters groups *after* aggregation. Use WHERE to remove rows you don't want in the groups at all; use HAVING to remove groups whose aggregate result doesn't qualify.",
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Schema setup",
              setup: true,
              sql: `CREATE TABLE sales (
  sale_id     INTEGER PRIMARY KEY,
  rep         TEXT    NOT NULL,
  region      TEXT    NOT NULL,
  product     TEXT    NOT NULL,
  amount      REAL    NOT NULL,
  sale_date   TEXT    NOT NULL,
  quarter     INTEGER NOT NULL
);

INSERT INTO sales VALUES
  (1,  'Alice',   'North', 'Widget A',  1200.00, '2024-01-10', 1),
  (2,  'Bob',     'South', 'Widget B',   800.00, '2024-01-15', 1),
  (3,  'Alice',   'North', 'Widget C',  2200.00, '2024-02-01', 1),
  (4,  'Carol',   'East',  'Widget A',   950.00, '2024-02-14', 1),
  (5,  'Bob',     'South', 'Widget A',  1500.00, '2024-03-03', 1),
  (6,  'Alice',   'North', 'Widget B',   600.00, '2024-04-01', 2),
  (7,  'Dave',    'West',  'Widget C',  3100.00, '2024-04-20', 2),
  (8,  'Carol',   'East',  'Widget B',  1100.00, '2024-05-05', 2),
  (9,  'Dave',    'West',  'Widget A',  2400.00, '2024-05-18', 2),
  (10, 'Bob',     'South', 'Widget C',  1800.00, '2024-06-10', 2),
  (11, 'Alice',   'North', 'Widget A',  1700.00, '2024-07-02', 3),
  (12, 'Carol',   'East',  'Widget C',  2900.00, '2024-08-15', 3);`,
            },
            {
              id: "q1",
              label: "Simple aggregate — whole table",
              sql: `-- Aggregate across ALL rows (no GROUP BY)
SELECT
  COUNT(*)       AS total_sales,
  SUM(amount)    AS total_revenue,
  AVG(amount)    AS avg_sale,
  MIN(amount)    AS smallest_sale,
  MAX(amount)    AS largest_sale
FROM sales;`,
            },
            {
              id: "q2",
              label: "GROUP BY — total revenue per rep",
              sql: `SELECT
  rep,
  COUNT(*)    AS num_sales,
  SUM(amount) AS total_revenue
FROM sales
GROUP BY rep
ORDER BY total_revenue DESC;`,
            },
            {
              id: "q3",
              label: "GROUP BY multiple columns",
              sql: `-- Revenue broken down by rep AND quarter
SELECT
  rep,
  quarter,
  COUNT(*)    AS num_sales,
  SUM(amount) AS revenue
FROM sales
GROUP BY rep, quarter
ORDER BY rep, quarter;`,
            },
            {
              id: "q4",
              label: "HAVING — filter groups after aggregation",
              sql: `-- Only reps with total revenue over $4000
SELECT
  rep,
  SUM(amount) AS total_revenue
FROM sales
GROUP BY rep
HAVING total_revenue > 4000
ORDER BY total_revenue DESC;`,
            },
            {
              id: "q5",
              label: "WHERE vs HAVING — both together",
              sql: `-- Q1 only (WHERE filters rows first),
-- then only regions with more than 1 sale (HAVING filters groups)
SELECT
  region,
  COUNT(*)    AS sales_count,
  SUM(amount) AS revenue
FROM sales
WHERE quarter = 1
GROUP BY region
HAVING sales_count > 1;`,
            },
            {
              id: "challenge",
              label: "Your turn: top products",
              sql: `-- Find total revenue per product
-- Only include products with total revenue above 3000
-- Sort by total revenue descending
-- Expected columns: product, total_revenue
`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Golden rule of GROUP BY:** every column in SELECT must either appear in GROUP BY or be wrapped in an aggregate function. Violating this is a SQL error (or silently wrong in some databases that pick an arbitrary value).",
      "**COUNT(*) vs COUNT(column):** `COUNT(*)` counts all rows including NULLs. `COUNT(column)` counts only rows where that column is NOT NULL. These differ whenever the column has NULL values — a common source of subtle bugs.",
      "**HAVING vs WHERE summary:** WHERE runs before GROUP BY (operates on rows, can't reference aggregates). HAVING runs after (operates on groups, can reference aggregate results like `HAVING SUM(amount) > 1000`).",
    ],
  },

  examples: [
    {
      title: "The classic mistake: GROUP BY without aggregation",
      body: `SELECT rep, amount FROM sales GROUP BY rep;
This is wrong — \`amount\` isn't in GROUP BY and isn't aggregated.
Which \`amount\` should it pick? It's undefined. Always aggregate every non-grouped column.`,
    },
    {
      title: "Filtering before grouping saves work",
      body: `WHERE filters rows before they're grouped.
If you only care about Q1 sales, add WHERE quarter = 1 — the database won't even
look at Q2/Q3 rows when building groups. This is often dramatically faster.`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-003-q1",
        type: "choice",
        text: "You want only departments with more than 10 employees. Which clause filters groups?",
        options: [
          "WHERE COUNT(*) > 10",
          "HAVING COUNT(*) > 10",
          "FILTER COUNT(*) > 10",
          "GROUP BY COUNT(*) > 10",
        ],
        answer: "HAVING COUNT(*) > 10",
      },
      {
        id: "sql0-003-q2",
        type: "choice",
        text: "SELECT department, name, COUNT(*) FROM employees GROUP BY department — what is wrong?",
        options: [
          "Nothing, this is valid SQL",
          "name is neither in GROUP BY nor in an aggregate function",
          "COUNT(*) cannot be used with GROUP BY",
          "GROUP BY must appear before SELECT",
        ],
        answer: "name is neither in GROUP BY nor in an aggregate function",
      },
      {
        id: "sql0-003-q3",
        type: "choice",
        text: "A table has 100 rows; 10 have NULL in the score column. What does AVG(score) use as its denominator?",
        options: [
          "100 — all rows",
          "90 — only non-NULL rows",
          "10 — only NULL rows",
          "It returns NULL because some values are NULL",
        ],
        answer: "90 — only non-NULL rows",
      },
    ],
  },

  mentalModel: [
    "GROUP BY partitions rows into groups — one output row per group",
    "Every SELECT column must be in GROUP BY or wrapped in an aggregate function",
    "WHERE filters individual rows *before* grouping; HAVING filters groups *after* aggregation",
    "COUNT(*) counts all rows; SUM/AVG/MIN/MAX skip NULLs automatically",
  ],
};

export default lesson;
