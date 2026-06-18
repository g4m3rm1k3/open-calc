const lesson = {
  id: "sql-0-016",
  slug: "having",
  chapter: "sql-0",
  order: 13,
  title: "HAVING: Filtering Groups",
  subtitle: "WHERE filters rows; HAVING filters groups",
  tags: ["sql", "having", "group by", "filter groups", "aggregate filter"],
  aliases: [
    "having sql",
    "having vs where",
    "filter after group by",
    "having count",
  ],

  hook: `GROUP BY splits data into groups. But what if you only want groups that meet some criteria?
What if you want categories with more than 3 products, or departments where average salary exceeds $100k?
That's HAVING — it filters groups the same way WHERE filters rows.`,

  mentalModel: [
    "WHERE filters individual rows before grouping. HAVING filters groups after grouping.",
    "HAVING conditions can use aggregate functions (WHERE cannot).",
    "The evaluation order is: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.",
    "Think of HAVING as 'WHERE for the results of GROUP BY'.",
  ],

  intuition: {
    prose: [
      "**Two different filtering stages.** WHERE runs first, before rows are grouped. It eliminates individual rows. HAVING runs after GROUP BY has formed groups and calculated aggregates. It eliminates entire groups based on their aggregate values.",
      "**Why you need HAVING.** Suppose you want departments that have more than 2 employees. `WHERE employee_count > 2` wouldn't work — `employee_count` doesn't exist as a column; it's a computed aggregate. You need `HAVING COUNT(*) > 2`, which runs after the groups are formed.",
      "**HAVING can use any aggregate.** `HAVING SUM(revenue) > 10000`, `HAVING AVG(score) >= 90`, `HAVING MAX(price) < 500`, `HAVING COUNT(DISTINCT customer_id) >= 5` — any aggregate expression is valid in HAVING.",
      "**WHERE is faster — use it to pre-filter when possible.** If you only want sales from 2024, use WHERE to filter those rows before grouping. Don't use HAVING for non-aggregate conditions — that forces the database to group all data first, then throw groups away.",
    ],
    callouts: [
      {
        type: "definition",
        title: "WHERE vs HAVING — which filter goes where?",
        body: "**WHERE** — filters individual rows. Can't use aggregates here.\n**HAVING** — filters groups. Can (and usually does) use aggregates.\nRule of thumb: if your condition uses COUNT, SUM, AVG, MIN, or MAX → use HAVING. Otherwise → use WHERE.",
      },
      {
        type: "insight",
        title: "Both in the same query",
        body: "`SELECT department, COUNT(*) FROM employees WHERE hire_date >= '2022-01-01' GROUP BY department HAVING COUNT(*) > 1`\nWHERE first narrows to recent hires. GROUP BY groups them. HAVING keeps only departments with more than 1 recent hire.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Orders dataset",
              setup: true,
              sql: `CREATE TABLE orders (
  order_id   INTEGER PRIMARY KEY,
  customer   TEXT    NOT NULL,
  category   TEXT    NOT NULL,
  product    TEXT    NOT NULL,
  total      REAL    NOT NULL,
  order_date TEXT    NOT NULL,
  region     TEXT    NOT NULL
);

INSERT INTO orders VALUES
  (1,  'Alice',  'Electronics', 'Laptop',     1299.00, '2024-01-05', 'West'),
  (2,  'Bob',    'Peripherals', 'Mouse',        34.99, '2024-01-07', 'East'),
  (3,  'Alice',  'Electronics', 'Monitor',     499.00, '2024-01-10', 'West'),
  (4,  'Carol',  'Furniture',   'Chair',       349.00, '2024-01-12', 'East'),
  (5,  'Bob',    'Peripherals', 'Keyboard',     89.99, '2024-01-15', 'East'),
  (6,  'Dave',   'Electronics', 'Laptop',     1299.00, '2024-01-18', 'Central'),
  (7,  'Carol',  'Furniture',   'Desk',        599.00, '2024-01-20', 'East'),
  (8,  'Alice',  'Peripherals', 'Webcam',       79.99, '2024-01-22', 'West'),
  (9,  'Eve',    'Electronics', 'Laptop',     1299.00, '2024-01-25', 'West'),
  (10, 'Frank',  'Furniture',   'Chair',       349.00, '2024-01-28', 'Central'),
  (11, 'Bob',    'Electronics', 'Monitor',     249.00, '2024-02-01', 'East'),
  (12, 'Alice',  'Furniture',   'Desk',        599.00, '2024-02-03', 'West'),
  (13, 'Dave',   'Peripherals', 'Mouse',        34.99, '2024-02-05', 'Central'),
  (14, 'Eve',    'Peripherals', 'Keyboard',     89.99, '2024-02-07', 'West'),
  (15, 'Frank',  'Electronics', 'Monitor',     499.00, '2024-02-10', 'Central');`,
            },
            {
              id: "q1",
              label: "Group by category — all groups",
              sql: `SELECT category, COUNT(*) AS num_orders, ROUND(SUM(total), 2) AS revenue
FROM orders
GROUP BY category
ORDER BY revenue DESC;`,
            },
            {
              id: "q2",
              label: "HAVING: keep only high-revenue categories",
              sql: `-- Only categories with more than $1500 in revenue
SELECT category, COUNT(*) AS num_orders, ROUND(SUM(total), 2) AS revenue
FROM orders
GROUP BY category
HAVING SUM(total) > 1500
ORDER BY revenue DESC;`,
            },
            {
              id: "q3",
              label: "HAVING COUNT: customers with 3+ orders",
              sql: `SELECT customer, COUNT(*) AS num_orders
FROM orders
GROUP BY customer
HAVING COUNT(*) >= 3
ORDER BY num_orders DESC;`,
            },
            {
              id: "q4",
              label: "WHERE + GROUP BY + HAVING: combine all three",
              sql: `-- West and East regions only (WHERE), then
-- only categories with avg order > $300 (HAVING)
SELECT region, category, ROUND(AVG(total), 2) AS avg_order
FROM orders
WHERE region IN ('West', 'East')
GROUP BY region, category
HAVING AVG(total) > 300
ORDER BY region, avg_order DESC;`,
            },
            {
              id: "q5",
              label: "Anti-pattern: using HAVING instead of WHERE",
              sql: `-- BAD: HAVING to filter on a non-aggregate column
-- (groups all data first, then discards groups)
SELECT category, COUNT(*), SUM(total)
FROM orders
HAVING region = 'West';  -- This is inefficient and may not work as expected

-- GOOD: Use WHERE for non-aggregate conditions
SELECT category, COUNT(*), SUM(total)
FROM orders
WHERE region = 'West'
GROUP BY category;`,
            },
            {
              id: "challenge",
              label: "Challenge: productive customers",
              sql: `-- Find customers who have placed at least 2 orders
-- AND whose total spending exceeds $500
-- Show: customer, order count, total spent
-- Sort by total spent descending
`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Logical evaluation order.** SQL processes clauses in this order: FROM (build the source), WHERE (filter rows), GROUP BY (form groups), HAVING (filter groups), SELECT (compute output), ORDER BY (sort), LIMIT (truncate). This order matters because it explains what's available where — aggregate aliases from SELECT are not available in HAVING because HAVING runs before SELECT.",
      "**Can you reference SELECT aliases in HAVING?** In standard SQL, no — HAVING runs before SELECT. In SQLite specifically, you can sometimes use SELECT aliases in HAVING as an extension. For portability, always use the full aggregate expression in HAVING rather than an alias defined in SELECT.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Full clause order",
        body: "**FROM** table(s) and joins\n**WHERE** filter rows\n**GROUP BY** columns\n**HAVING** aggregate condition\n**SELECT** columns and expressions\n**ORDER BY** sort\n**LIMIT / OFFSET** paginate",
      },
    ],
  },

  examples: [
    {
      title: "Find months with unusually high sales volume",
      body: `SELECT
  strftime('%Y-%m', order_date) AS month,
  COUNT(*)                      AS num_orders,
  ROUND(SUM(total), 2)          AS monthly_revenue
FROM orders
GROUP BY strftime('%Y-%m', order_date)
HAVING COUNT(*) >= 5
   OR  SUM(total) >= 2000
ORDER BY month;`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-016-q1",
        type: "choice",
        text: "What is the difference between WHERE and HAVING?",
        options: [
          "WHERE filters columns; HAVING filters rows",
          "WHERE filters rows before grouping; HAVING filters groups after grouping",
          "They are interchangeable — both filter rows",
          "HAVING filters rows; WHERE filters groups",
        ],
        answer:
          "WHERE filters rows before grouping; HAVING filters groups after grouping",
      },
      {
        id: "sql0-016-q2",
        type: "choice",
        text: "You want departments where the average salary exceeds $80,000. Which clause do you use?",
        options: [
          "WHERE AVG(salary) > 80000",
          "HAVING AVG(salary) > 80000",
          "WHERE salary > 80000",
          "FILTER AVG(salary) > 80000",
        ],
        answer: "HAVING AVG(salary) > 80000",
      },
      {
        id: "sql0-016-q3",
        type: "choice",
        text: "In what order does SQL logically evaluate: WHERE, GROUP BY, HAVING?",
        options: [
          "HAVING → GROUP BY → WHERE",
          "GROUP BY → WHERE → HAVING",
          "WHERE → GROUP BY → HAVING",
          "WHERE → HAVING → GROUP BY",
        ],
        answer: "WHERE → GROUP BY → HAVING",
      },
    ],
  },
};

export default lesson;
