const lesson = {
  id: "sql-0-020",
  slug: "cte-with",
  chapter: "sql-0",
  order: 18,
  title: "CTEs: The WITH Clause",
  subtitle: "Name intermediate results and build queries step by step",
  tags: [
    "sql",
    "cte",
    "with clause",
    "common table expression",
    "recursive cte",
  ],
  aliases: [
    "cte sql",
    "with sql",
    "common table expression",
    "with as sql",
    "recursive sql",
  ],

  hook: `Complex queries get hard to read fast.
A subquery inside a subquery inside another subquery — nobody can follow that.
CTEs (Common Table Expressions) let you name each step of your logic and
build the final query from named pieces, like defining variables in your query.`,

  mentalModel: [
    "A CTE names an intermediate result set using WITH name AS (SELECT ...).",
    "CTEs appear before the main SELECT and are referenced like tables.",
    "Multiple CTEs can reference each other, building complexity step by step.",
    "Recursive CTEs can query hierarchical data by referencing themselves.",
  ],

  intuition: {
    prose: [
      "**CTEs are named temporary result sets.** You define them with `WITH name AS (...)` before the main query. Then you use that name in the main query as if it were a table. The CTE exists only for the duration of that query — it's not stored anywhere.",
      "**CTEs make complex queries readable.** Compare a deeply nested subquery with a CTE version where each transformation has a name. The CTE version reads like a recipe: step 1, step 2, step 3, final result. Anyone can follow the logic. The subquery version requires mental stack-tracing.",
      "**Chain multiple CTEs.** You can define several CTEs before the main query, and later CTEs can reference earlier ones. `WITH a AS (...), b AS (SELECT ... FROM a WHERE ...), c AS (SELECT ... FROM b JOIN a ON ...)` — each step builds on the previous. This is far cleaner than nesting.",
      "**CTEs can be reused.** If you need the same derived table in two places, define it as a CTE once and reference it twice. With subqueries, you'd have to copy and paste.",
      "**Recursive CTEs can traverse trees and graphs.** A recursive CTE references itself to traverse hierarchical data: org charts, file systems, category trees. It starts with a base case (the root), then repeatedly applies a recursive step until no new rows are produced.",
    ],
    callouts: [
      {
        type: "definition",
        title: "CTE syntax",
        body: "```sql\nWITH cte_name AS (\n  SELECT ...\n),\nsecond_cte AS (\n  SELECT ... FROM cte_name WHERE ...\n)\nSELECT * FROM second_cte WHERE ...;\n```\n`WITH` begins the block. Each CTE is `name AS (query)`. Separate multiple CTEs with commas. The main query follows the last CTE.",
      },
      {
        type: "insight",
        title: "CTE vs. subquery vs. view",
        body: "**Subquery:** inline, no name, no reuse. Good for simple one-offs.\n**CTE:** named, exists for one query, reusable within that query. Good for complex multi-step queries.\n**View:** named, stored permanently in the database, reusable across queries. Good for frequently used derived tables.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "E-commerce dataset",
              setup: true,
              sql: `CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  region      TEXT    NOT NULL
);

CREATE TABLE orders (
  order_id    INTEGER PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(customer_id),
  order_date  TEXT    NOT NULL,
  total       REAL    NOT NULL
);

INSERT INTO customers VALUES
  (1, 'Alice Chen',  'West'),
  (2, 'Bob Patel',   'East'),
  (3, 'Carol Kim',   'West'),
  (4, 'Dave Nguyen', 'Central'),
  (5, 'Eve Torres',  'East');

INSERT INTO orders VALUES
  (1,  1, '2024-01-05',  450.00),
  (2,  1, '2024-01-20', 1200.00),
  (3,  2, '2024-01-15',   89.00),
  (4,  3, '2024-02-01',  750.00),
  (5,  2, '2024-02-05',  320.00),
  (6,  1, '2024-02-10',  180.00),
  (7,  4, '2024-02-15',  990.00),
  (8,  3, '2024-02-20', 1450.00),
  (9,  5, '2024-03-01',  230.00),
  (10, 4, '2024-03-05',  110.00);`,
            },
            {
              id: "q1",
              label: "Simple CTE: customer order totals",
              sql: `-- Without CTE: a subquery in FROM
-- With CTE: clean and named

WITH customer_totals AS (
  SELECT
    customer_id,
    COUNT(*)          AS num_orders,
    SUM(total)        AS lifetime_value
  FROM orders
  GROUP BY customer_id
)
SELECT
  c.name,
  c.region,
  ct.num_orders,
  ROUND(ct.lifetime_value, 2) AS lifetime_value
FROM customers c
JOIN customer_totals ct ON c.customer_id = ct.customer_id
ORDER BY lifetime_value DESC;`,
            },
            {
              id: "q2",
              label: "Multiple CTEs chained together",
              sql: `WITH
-- Step 1: per-customer aggregates
customer_stats AS (
  SELECT
    customer_id,
    COUNT(*)    AS num_orders,
    SUM(total)  AS total_spent,
    AVG(total)  AS avg_order
  FROM orders
  GROUP BY customer_id
),
-- Step 2: classify customers using step 1 results
customer_segments AS (
  SELECT
    customer_id,
    num_orders,
    ROUND(total_spent, 2) AS total_spent,
    CASE
      WHEN total_spent >= 2000 THEN 'VIP'
      WHEN total_spent >= 500  THEN 'Regular'
      ELSE                          'Occasional'
    END AS segment
  FROM customer_stats
)
-- Final: join with customer names
SELECT
  c.name,
  c.region,
  cs.num_orders,
  cs.total_spent,
  cs.segment
FROM customers c
JOIN customer_segments cs ON c.customer_id = cs.customer_id
ORDER BY cs.total_spent DESC;`,
            },
            {
              id: "q3",
              label: "Recursive CTE: counting sequence",
              sql: `-- Recursive CTEs have two parts: base case + recursive step
-- This generates numbers 1 through 10
WITH RECURSIVE nums(n) AS (
  SELECT 1        -- base case
  UNION ALL
  SELECT n + 1    -- recursive step
  FROM nums
  WHERE n < 10    -- termination condition
)
SELECT n FROM nums;`,
            },
            {
              id: "q4",
              label: "Recursive CTE: org chart traversal",
              sql: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT,
  manager_id INTEGER  -- NULL for CEO
);
INSERT INTO employees VALUES
  (1, 'Alice (CEO)',   NULL),
  (2, 'Bob (VP Eng)',  1),
  (3, 'Carol (VP Des)',1),
  (4, 'Dave (Eng)',    2),
  (5, 'Eve (Eng)',     2),
  (6, 'Frank (Des)',   3);

-- Find all reports under Alice, at any depth
WITH RECURSIVE org(id, name, level) AS (
  SELECT id, name, 0 AS level FROM employees WHERE manager_id IS NULL  -- root
  UNION ALL
  SELECT e.id, e.name, o.level + 1
  FROM employees e
  JOIN org o ON e.manager_id = o.id  -- each employee whose manager is in current set
)
SELECT level, name,
       REPLACE(SUBSTR('          ', 1, level * 2), ' ', '  ') || name AS indented
FROM org
ORDER BY level, name;`,
            },
            {
              id: "challenge",
              label: "Challenge: regional leaderboard",
              sql: `-- Using a CTE:
-- Step 1: calculate total spending per customer
-- Step 2: rank customers within each region by spending
-- (just get top customer per region for now)
-- Show: region, top_customer_name, their_total_spent
`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**CTEs are not necessarily materialized.** Many databases treat CTEs as syntactic sugar for subqueries and inline them into the query plan. SQLite does this — a CTE is usually not a separate operation; the optimizer treats it like an inline view. PostgreSQL (before v12) always materialized CTEs as optimization fences. Understanding your database's behavior matters for performance-critical queries.",
      "**Recursive CTEs require a UNION ALL (not UNION).** The recursive step uses UNION ALL to combine base and recursive results. UNION would deduplicate, which breaks most recursive patterns and can cause infinite loops to terminate prematurely. The termination condition in the WHERE clause of the recursive step is what stops the recursion.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Recursive CTE structure",
        body: "```sql\nWITH RECURSIVE cte(col) AS (\n  SELECT ...       -- base case (non-recursive)\n  UNION ALL\n  SELECT ...       -- recursive step references cte\n  FROM cte\n  WHERE ...        -- termination condition\n)\nSELECT * FROM cte;\n```\nThe `RECURSIVE` keyword is required when the CTE references itself.",
      },
    ],
  },

  examples: [
    {
      title: "Running total using CTE",
      body: `WITH ordered_sales AS (
  SELECT
    order_date,
    total,
    SUM(total) OVER (ORDER BY order_date) AS running_total
  FROM orders
  ORDER BY order_date
)
SELECT * FROM ordered_sales;
-- (Window functions are covered in a later lesson — this is a preview)`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-020-q1",
        type: "choice",
        text: "What is a CTE (Common Table Expression)?",
        options: [
          "A permanent table stored in the database",
          "A named temporary result set defined before a query and used within it",
          "A stored procedure that returns a table",
          "A view with parameters",
        ],
        answer:
          "A named temporary result set defined before a query and used within it",
      },
      {
        id: "sql0-020-q2",
        type: "choice",
        text: "When you need to reuse the same derived table twice in one query, what should you use?",
        options: [
          "Write two identical subqueries",
          "Create a temporary table",
          "Define a CTE and reference it twice",
          "Use UNION to combine both uses",
        ],
        answer: "Define a CTE and reference it twice",
      },
      {
        id: "sql0-020-q3",
        type: "choice",
        text: "What is the purpose of the RECURSIVE keyword in a CTE?",
        options: [
          "It makes the CTE run faster by caching results",
          "It is required when the CTE references itself in the recursive step",
          "It allows the CTE to be reused across multiple queries",
          "It prevents the CTE from being optimized by the query planner",
        ],
        answer:
          "It is required when the CTE references itself in the recursive step",
      },
    ],
  },
};

export default lesson;
