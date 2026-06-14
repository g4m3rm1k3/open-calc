export default {
  id: "sql1-003",
  slug: "aggregation-and-grouping",
  chapter: "sql-1",
  order: 3,
  title: "Aggregation & Grouping",
  subtitle:
    "Collapsing many rows into summary statistics — COUNT, SUM, GROUP BY, HAVING",
  tags: [
    "GROUP BY",
    "HAVING",
    "COUNT",
    "SUM",
    "AVG",
    "MIN",
    "MAX",
    "aggregate functions",
    "window functions",
  ],
  aliases:
    "group by having count sum avg min max aggregate grouping statistics window function",

  hook: {
    question:
      'How does every dashboard in the world compute "total revenue by month" or "number of active users per country"?',
    realWorldContext:
      "Aggregation is how raw transaction data becomes business insight. " +
      "Every analytics dashboard — Google Analytics, Stripe, Datadog, your company's internal BI tool — " +
      "runs aggregation queries. Understanding GROUP BY deeply makes you the person who can write " +
      "the SQL behind those dashboards, diagnose why they're slow, and explain to non-technical " +
      "stakeholders exactly what the numbers mean.",
    previewVisualizationId: "PythonNotebook",
  },

  intuition: {
    prose: [
      "**Aggregate functions collapse many rows into one number.** `COUNT(*)` counts all rows. `SUM(amount)` adds up the amount column. `AVG(amount)` divides the sum by the count. `MIN` and `MAX` find the extremes. Each of these produces a single value from a set of rows.",
      "**GROUP BY: partitioning the table.** Without GROUP BY, aggregate functions collapse the entire table to one row. With GROUP BY, the table is first partitioned into groups — one group per distinct value of the GROUP BY column(s) — and the aggregate is computed within each group. The result has one row per group.",
      "**The GROUP BY rule (the most violated rule in SQL).** In a query with GROUP BY, every column in SELECT must be either: (a) in the GROUP BY clause, or (b) inside an aggregate function. This is not arbitrary — it's mathematically necessary. If a group contains multiple rows with different `name` values, which `name` should appear in the output? SQL refuses to guess.",
      '**WHERE vs HAVING.** WHERE filters individual rows *before* grouping. HAVING filters groups *after* grouping. If you want "customers who placed more than 3 orders", that\'s a condition on a group (use HAVING). If you want "orders from California customers", that\'s a condition on individual rows (use WHERE). Using them in the wrong place causes either errors or wrong answers.',
      "**COUNT(*) vs COUNT(col).** `COUNT(*)` counts every row including NULLs. `COUNT(col)` counts only rows where col is NOT NULL. This distinction matters — `COUNT(state)` might give a different number than `COUNT(*)` if some states are NULL.",
    ],
    callouts: [
      {
        type: "definition",
        title: "The GROUP BY Rule",
        body: "In a SELECT with GROUP BY:\n- Every column in SELECT must be either:\n  1. In the GROUP BY clause, OR\n  2. Wrapped in an aggregate function (COUNT, SUM, AVG, MIN, MAX)\n\nViolating this is a logic error (SQL will either reject it or return arbitrary results).",
      },
      {
        type: "definition",
        title: "WHERE vs HAVING",
        body: '**WHERE:** Filters individual rows BEFORE grouping\n  → "only include orders from Q4"\n\n**HAVING:** Filters groups AFTER grouping\n  → "only include customers with more than 2 orders"\n\nYou cannot use aggregate functions in WHERE. You cannot use non-grouped columns in HAVING.',
      },
      {
        type: "warning",
        title: "COUNT(*) vs COUNT(col) — different numbers",
        body: "```sql\nSELECT COUNT(*)        -- counts all rows: 5\n     , COUNT(state)   -- counts non-NULL states: 4\nFROM customers\n```\nAlways be explicit about which you mean. In analytics code, counting rows vs counting non-null values are two completely different calculations.",
      },
      {
        type: "insight",
        title: "Execution order with aggregation",
        body: "Full pipeline:\nFROM → WHERE → **GROUP BY** → **HAVING** → SELECT → DISTINCT → ORDER BY → LIMIT\n\nHAVING runs after GROUP BY but before SELECT, which is why you CAN use aggregate functions in HAVING but CANNOT reference SELECT aliases in HAVING.",
      },
    ],
    visualizations: [
      {
        id: "PythonNotebook",
        title: "Aggregation & Grouping",
        mathBridge:
          "GROUP BY implements a partition of the relation R into equivalence classes by the group-by attributes. Each equivalence class is collapsed to a single tuple by applying aggregate functions (SUM, COUNT, etc.) to the non-group-by attributes.",
        caption:
          "Build up from simple counts to multi-level aggregations. The challenge at the end requires combining WHERE, GROUP BY, and HAVING correctly.",
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: "Setup",
              prose: ["## Rebuild the database"],
              code: `import sqlite3
conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.executescript("""
CREATE TABLE customers (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE,
    state TEXT, joined TEXT
);
CREATE TABLE orders (
    id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL,
    amount REAL NOT NULL, quarter INTEGER NOT NULL, created_at TEXT NOT NULL
);
INSERT INTO customers VALUES
    (1,'Alice Chen','alice@example.com','CA','2022-03-10'),
    (2,'Bob Torres','bob@example.com','NY','2023-07-01'),
    (3,'Carol Kim','carol@example.com','CA','2021-11-20'),
    (4,'David Patel','david@example.com',NULL,'2024-01-05'),
    (5,'Eve Johnson','eve@example.com','TX','2023-04-15');
INSERT INTO orders VALUES
    (1,1,120.00,4,'2024-10-05'),(2,2,850.00,4,'2024-11-12'),
    (3,1,620.00,4,'2024-12-01'),(4,3,90.00,3,'2024-09-20'),
    (5,2,510.00,4,'2024-10-30'),(6,3,750.00,4,'2024-11-08'),
    (7,4,300.00,4,'2024-12-15'),(8,5,180.00,1,'2024-01-22');
""")
conn.commit()
print("Ready.")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: "Aggregate functions without GROUP BY",
              prose: [
                "## The whole table as one group",
                "Without GROUP BY, aggregates collapse the entire table to exactly one row. This is the simplest case — good for global stats.",
              ],
              code: `# Without GROUP BY: entire table → one row
cur.execute("""
    SELECT
        COUNT(*)             AS total_orders,
        COUNT(DISTINCT customer_id) AS unique_customers,
        SUM(amount)          AS total_revenue,
        AVG(amount)          AS avg_order,
        MIN(amount)          AS smallest_order,
        MAX(amount)          AS largest_order
    FROM orders
""")
row = cur.fetchone()
labels = ['total_orders', 'unique_customers', 'total_revenue', 'avg_order', 'smallest', 'largest']
for label, val in zip(labels, row):
    print(f"{label:<20}: {val}")

print()
# COUNT(*) vs COUNT(col) — they CAN differ
cur.execute("SELECT COUNT(*), COUNT(state) FROM customers")
total, non_null = cur.fetchone()
print(f"COUNT(*) = {total}  (all rows)")
print(f"COUNT(state) = {non_null}  (David's NULL state is excluded)")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: "GROUP BY: one group per customer",
              prose: [
                "## GROUP BY partitions the table",
                "The table is split into groups, one per distinct `customer_id`. The aggregate is computed inside each group. One output row per group.",
              ],
              code: `# Revenue and order count per customer
cur.execute("""
    SELECT
        customer_id,
        COUNT(*)   AS num_orders,
        SUM(amount) AS total_spent,
        AVG(amount) AS avg_order,
        MAX(amount) AS largest_order
    FROM  orders
    GROUP BY customer_id
    ORDER BY total_spent DESC
""")
print(f"{'CustomerID':>10} {'Orders':>7} {'Total':>10} {'Avg':>8} {'Max':>8}")
print("-" * 48)
for row in cur.fetchall():
    cid, n, total, avg, mx = row
    print(f"{cid:>10} {n:>7} \${total:>9.2f} \${avg:>7.2f} \${mx:>7.2f}")

print()
print("The GROUP BY rule: customer_id is in GROUP BY. COUNT/SUM/AVG/MAX")
print("are aggregate functions. Every SELECT column satisfies the rule.")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 4,
              cellTitle: "Violating the GROUP BY rule",
              prose: [
                "## What happens when you break the rule",
                "SQLite is unusually permissive here — it will execute the query but return an arbitrary value for the non-grouped column. PostgreSQL will correctly reject it with an error.",
              ],
              code: `# This is WRONG — customer_id is grouped but what about created_at?
# In strict SQL (PostgreSQL), this would be an error.
# SQLite executes it but returns an arbitrary created_at per group.
cur.execute("""
    SELECT customer_id, COUNT(*), created_at  -- created_at violates the rule
    FROM   orders
    GROUP  BY customer_id
""")
print("SQLite's result (PostgreSQL would reject this):")
for row in cur.fetchall():
    print(" ", row)
print()
print("The created_at value returned is ARBITRARY — SQLite picks one from the group.")
print("In PostgreSQL this would be: ERROR: column 'orders.created_at' must appear")
print("in the GROUP BY clause or be used in an aggregate function")
print()
print("The fix: either add created_at to GROUP BY, or wrap it in MIN()/MAX()/etc.")

# Correct version
cur.execute("""
    SELECT customer_id, COUNT(*), MAX(created_at) AS latest_order
    FROM   orders
    GROUP  BY customer_id
""")
print()
print("Correct version:")
for row in cur.fetchall(): print(" ", row)`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 5,
              cellTitle: "WHERE vs HAVING — the right tool for each job",
              prose: [
                "## Filtering before vs. after grouping",
                "WHERE filters rows before groups are formed. HAVING filters groups after they are formed. They are not interchangeable.",
              ],
              code: `# WHERE: filter rows before grouping
# Only look at Q4 orders, then group
cur.execute("""
    SELECT customer_id, COUNT(*) AS q4_orders, SUM(amount) AS q4_revenue
    FROM   orders
    WHERE  quarter = 4          -- filter rows BEFORE grouping
    GROUP  BY customer_id
    ORDER  BY q4_revenue DESC
""")
print("Q4 orders per customer (WHERE filters first):")
for row in cur.fetchall(): print(" ", row)

print()

# HAVING: filter groups after grouping
# Find customers who spent more than $700 total (any quarter)
cur.execute("""
    SELECT customer_id, COUNT(*) AS orders, SUM(amount) AS total
    FROM   orders
    GROUP  BY customer_id
    HAVING SUM(amount) > 700   -- filter GROUPS after aggregation
    ORDER  BY total DESC
""")
print("High-value customers (HAVING filters groups):")
for row in cur.fetchall(): print(" ", row)

print()

# Combine WHERE + HAVING
cur.execute("""
    SELECT customer_id, SUM(amount) AS q4_total
    FROM   orders
    WHERE  quarter = 4             -- only Q4 rows
    GROUP  BY customer_id
    HAVING SUM(amount) > 600       -- only groups with Q4 total > $600
    ORDER  BY q4_total DESC
""")
print("High-value Q4 customers (WHERE + HAVING together):")
for row in cur.fetchall(): print(" ", row)`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 6,
              cellTitle: "GROUP BY multiple columns",
              prose: [
                "## Grouping by more than one column",
                "You can group by any combination of columns. The output has one row per distinct combination.",
              ],
              code: `# Revenue by customer AND quarter
cur.execute("""
    SELECT
        customer_id,
        quarter,
        COUNT(*)    AS orders,
        SUM(amount) AS revenue
    FROM  orders
    GROUP BY customer_id, quarter   -- one row per (customer_id, quarter) pair
    ORDER BY customer_id, quarter
""")
print(f"{'Customer':>10} {'Q':>3} {'Orders':>7} {'Revenue':>10}")
print("-" * 35)
for cid, q, n, rev in cur.fetchall():
    print(f"{cid:>10} {q:>3} {n:>7} \${rev:>9.2f}")

print()
print("Revenue by state (requires join — next lesson)")
print("Preview: GROUP BY works on any column, including joined columns")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Aggregate functions and NULL.** All aggregate functions except `COUNT(*)` skip NULL values. `AVG(col)` divides by the count of non-NULL rows, not the total row count. This means `AVG(col)` can differ from `SUM(col) / COUNT(*)` when NULLs are present.",
      "**HAVING vs WHERE performance.** WHERE filters rows before grouping — fewer rows to group = faster. HAVING filters after grouping — the grouping work has already been done. Always push conditions to WHERE when they apply to individual rows, keeping HAVING only for conditions that genuinely depend on the aggregate result.",
      '**Window functions.** GROUP BY collapses rows into groups, which loses the original row data. When you need the aggregate value alongside each original row (e.g., "what percent of total does this row represent?"), use window functions: `SUM(amount) OVER (PARTITION BY customer_id)`. Covered in advanced SQL.',
    ],
  },

  examples: [
    {
      id: "sql1-003-ex1",
      title: "Revenue Dashboard Query",
      problem:
        "Find the top 3 states by Q4 revenue, showing only states with at least $500 total.",
      code: `SELECT   c.state,
         COUNT(o.id)   AS orders,
         SUM(o.amount) AS revenue
FROM     orders o
JOIN     customers c ON c.id = o.customer_id
WHERE    o.quarter = 4               -- filter rows before grouping
  AND    c.state IS NOT NULL         -- exclude unknown states
GROUP BY c.state
HAVING   SUM(o.amount) >= 500        -- filter groups after grouping
ORDER BY revenue DESC
LIMIT    3`,
      steps: [
        {
          expression: "FROM + JOIN",
          annotation: "Combine orders with customer data",
        },
        {
          expression: "WHERE quarter=4 AND state IS NOT NULL",
          annotation: "Keep only Q4 rows with known states",
        },
        {
          expression: "GROUP BY state",
          annotation: "Partition into one group per state",
        },
        {
          expression: "HAVING SUM >= 500",
          annotation: "Discard low-revenue states",
        },
        {
          expression: "SELECT state, COUNT, SUM",
          annotation: "Compute output columns",
        },
        {
          expression: "ORDER BY + LIMIT 3",
          annotation: "Sort and trim to top 3",
        },
      ],
      conclusion:
        "Every clause has a specific stage in the pipeline. Knowing the stage tells you exactly what data each clause sees.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql1-003-q1",
        type: "choice",
        text: "You want customers who placed more than 5 orders. Which clause do you use?",
        options: [
          "WHERE COUNT(*) > 5",
          "HAVING COUNT(*) > 5",
          "WHERE orders > 5",
          "GROUP BY COUNT(*) > 5",
        ],
        answer: "HAVING COUNT(*) > 5",
      },
      {
        id: "sql1-003-q2",
        type: "choice",
        text: "A table has 100 rows. 10 rows have NULL in the `score` column. What does AVG(score) use as its denominator?",
        options: [
          "100 — all rows",
          "90 — only non-NULL rows",
          "10 — only NULL rows",
          "It returns NULL because some values are NULL",
        ],
        answer: "90 — only non-NULL rows",
      },
      {
        id: "sql1-003-q3",
        type: "choice",
        text: "SELECT department, name, COUNT(*) FROM employees GROUP BY department — what is wrong?",
        options: [
          "Nothing — this is valid SQL",
          "name violates the GROUP BY rule: it is neither in GROUP BY nor in an aggregate function",
          "COUNT(*) cannot be used without WHERE",
          "GROUP BY must come before SELECT",
        ],
        answer:
          "name violates the GROUP BY rule: it is neither in GROUP BY nor in an aggregate function",
      },
    ],
  },

  mentalModel: [
    "GROUP BY partitions rows into groups — one output row per group",
    "Every SELECT column must be in GROUP BY or inside an aggregate function",
    "WHERE filters rows BEFORE grouping; HAVING filters groups AFTER grouping",
    "COUNT(*) counts all rows; COUNT(col) skips NULLs",
    "All aggregates (SUM, AVG, MIN, MAX) skip NULL values automatically",
  ],
};
