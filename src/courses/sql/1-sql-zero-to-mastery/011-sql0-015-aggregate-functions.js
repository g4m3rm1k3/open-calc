const lesson = {
  id: "sql-0-015",
  slug: "aggregate-functions",
  chapter: "sql-0",
  order: 11,
  title: "Aggregate Functions",
  subtitle: "Summarize many rows into a single number",
  tags: ["sql", "aggregate", "count", "sum", "avg", "min", "max"],
  aliases: [
    "count sql",
    "sum sql",
    "average sql",
    "aggregate sql",
    "summarize sql",
    "total rows sql",
  ],

  hook: `Selecting individual rows is useful, but most business questions are about summaries:
"How many orders came in today?" "What's the total revenue?" "What's the average order value?"
These are aggregate questions — they turn many rows into one number.
SQL has a small set of built-in aggregate functions that answer them directly.`,

  mentalModel: [
    "Aggregate functions collapse many rows into a single summary value.",
    "COUNT(*) counts all rows. COUNT(column) counts non-NULL values in that column.",
    "SUM, AVG, MIN, MAX work on numbers. MAX and MIN also work on text (alphabetical) and dates.",
    "Without GROUP BY, aggregates collapse the entire result into one row.",
  ],

  intuition: {
    prose: [
      "**Aggregate functions work on a set of rows and return one value.** `SELECT COUNT(*) FROM orders` reads every row in the orders table and returns a single number: how many rows there are. That's the essence — many rows in, one summary out.",
      "**COUNT: two flavors.** `COUNT(*)` counts every row, including rows with NULL values. `COUNT(column_name)` counts only the rows where that column is not NULL. If 3 out of 10 customers have no phone number, `COUNT(*)` = 10 but `COUNT(phone)` = 7. This difference matters when you care about how much data is present.",
      "**SUM adds up all the values.** `SELECT SUM(total) FROM orders` returns the total revenue from all orders. NULL values are skipped. If there are no rows, SUM returns NULL (not 0).",
      "**AVG computes the arithmetic mean.** `SELECT AVG(price) FROM products` divides the sum of all prices by the count of non-NULL prices. Like SUM, NULLs are excluded from both the sum and the count.",
      "**MIN and MAX find the extreme values.** They work on numbers, text (alphabetical order), and dates. `MAX(order_date)` finds the most recent order. `MIN(price)` finds the cheapest product. These are also NULL-safe: NULLs are ignored.",
      "**Without GROUP BY, the whole table is one group.** All the examples above collapse the entire table into one row. In the next lesson you'll see GROUP BY, which splits the table into groups and applies the aggregate to each group separately.",
    ],
    callouts: [
      {
        type: "definition",
        title: "The five core aggregates",
        body: "**COUNT(*)** — number of rows\n**COUNT(col)** — number of non-NULL values in col\n**SUM(col)** — total of all values (NULLs skipped)\n**AVG(col)** — arithmetic mean (NULLs skipped)\n**MIN(col)** — smallest value (NULLs skipped)\n**MAX(col)** — largest value (NULLs skipped)",
      },
      {
        type: "warning",
        title: "SUM / AVG of no rows returns NULL, not 0",
        body: "`SELECT SUM(total) FROM orders WHERE status = 'cancelled'` returns NULL if there are no cancelled orders — not 0. Use `COALESCE(SUM(total), 0)` if you need a guaranteed numeric result.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Sales dataset",
              setup: true,
              sql: `CREATE TABLE sales (
  sale_id    INTEGER PRIMARY KEY,
  product    TEXT    NOT NULL,
  category   TEXT    NOT NULL,
  quantity   INTEGER NOT NULL,
  unit_price REAL    NOT NULL,
  total      REAL    NOT NULL,
  sale_date  TEXT    NOT NULL,
  rep        TEXT              -- NULL for online sales
);

INSERT INTO sales VALUES
  (1,  'Laptop',    'Electronics', 1, 1299.00, 1299.00, '2024-01-05', 'Alice'),
  (2,  'Mouse',     'Peripherals', 3,   34.99,  104.97, '2024-01-07', 'Bob'),
  (3,  'Laptop',    'Electronics', 2, 1299.00, 2598.00, '2024-01-10', NULL),
  (4,  'Monitor',   'Electronics', 1,  499.00,  499.00, '2024-01-12', 'Alice'),
  (5,  'Keyboard',  'Peripherals', 2,   89.99,  179.98, '2024-01-15', NULL),
  (6,  'Chair',     'Furniture',   1,  349.00,  349.00, '2024-01-18', 'Carol'),
  (7,  'Monitor',   'Electronics', 1,  249.00,  249.00, '2024-01-20', 'Bob'),
  (8,  'Desk',      'Furniture',   1,  599.00,  599.00, '2024-01-22', NULL),
  (9,  'Mouse',     'Peripherals', 1,   34.99,   34.99, '2024-01-25', 'Carol'),
  (10, 'Webcam',    'Peripherals', 2,   79.99,  159.98, '2024-01-28', 'Alice');`,
            },
            {
              id: "q1",
              label: "COUNT: how many rows?",
              sql: `-- COUNT(*) counts every row
SELECT COUNT(*) AS total_sales FROM sales;`,
            },
            {
              id: "q2",
              label: "COUNT(*) vs COUNT(column)",
              sql: `-- COUNT(rep) only counts non-NULL reps (online sales are NULL)
SELECT
  COUNT(*)    AS total_rows,
  COUNT(rep)  AS sales_with_rep,
  COUNT(*) - COUNT(rep) AS online_sales
FROM sales;`,
            },
            {
              id: "q3",
              label: "SUM: total revenue",
              sql: `SELECT
  SUM(total)    AS total_revenue,
  SUM(quantity) AS total_units_sold
FROM sales;`,
            },
            {
              id: "q4",
              label: "AVG: average sale value",
              sql: `SELECT
  ROUND(AVG(total), 2)      AS avg_sale_value,
  ROUND(AVG(unit_price), 2) AS avg_unit_price
FROM sales;`,
            },
            {
              id: "q5",
              label: "MIN and MAX",
              sql: `SELECT
  MIN(total)     AS smallest_sale,
  MAX(total)     AS largest_sale,
  MIN(sale_date) AS first_sale_date,
  MAX(sale_date) AS most_recent_sale_date
FROM sales;`,
            },
            {
              id: "q6",
              label: "Combine all aggregates in one query",
              sql: `SELECT
  COUNT(*)                    AS num_sales,
  ROUND(SUM(total), 2)        AS revenue,
  ROUND(AVG(total), 2)        AS avg_sale,
  ROUND(MIN(total), 2)        AS smallest_sale,
  ROUND(MAX(total), 2)        AS largest_sale
FROM sales;`,
            },
            {
              id: "q7",
              label: "Aggregate + WHERE: filter first, then summarize",
              sql: `-- Total revenue and sales count for Electronics only
SELECT
  COUNT(*) AS electronics_sales,
  ROUND(SUM(total), 2) AS electronics_revenue
FROM sales
WHERE category = 'Electronics';`,
            },
            {
              id: "challenge",
              label: "Challenge: rep sales summary",
              sql: `-- How many sales were made by a sales rep (not online)?
-- What was the total and average sale value for rep-assisted sales?
-- Hint: filter WHERE rep IS NOT NULL first
`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Aggregates in the SELECT clause cannot be mixed with non-aggregated columns without GROUP BY.** `SELECT product, SUM(total) FROM sales` is an error — which product name would appear? You must either aggregate all selected columns or use GROUP BY to split the data into groups. The only exception is expressions that are functionally dependent on grouped columns.",
      "**DISTINCT inside an aggregate.** `COUNT(DISTINCT category)` counts unique category values. `SUM(DISTINCT total)` adds each unique total value once. The DISTINCT keyword can be applied inside any aggregate function. It's most commonly useful with COUNT.",
    ],
    callouts: [
      {
        type: "definition",
        title: "COUNT DISTINCT",
        body: "`COUNT(DISTINCT col)` counts the number of unique non-NULL values.\nExample: `SELECT COUNT(DISTINCT category) FROM sales` → 3 (Electronics, Peripherals, Furniture)\nThis is different from `COUNT(category)` which counts all non-NULL values regardless of duplicates.",
      },
    ],
  },

  examples: [
    {
      title: "Summary statistics with ROUND and COALESCE",
      body: `SELECT
  COUNT(*)                        AS total_orders,
  COALESCE(ROUND(SUM(total), 2), 0)  AS total_revenue,
  COALESCE(ROUND(AVG(total), 2), 0)  AS avg_order_value,
  COUNT(DISTINCT product)         AS unique_products_sold
FROM sales
WHERE sale_date >= '2024-01-10';`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-015-q1",
        type: "choice",
        text: "You have 100 rows and 10 have NULL in the 'score' column. What does COUNT(score) return?",
        options: ["100", "90", "10", "NULL"],
        answer: "90",
      },
      {
        id: "sql0-015-q2",
        type: "choice",
        text: "What does SUM return when there are no rows matching the WHERE clause?",
        options: ["0", "NULL", "An error", "An empty string"],
        answer: "NULL",
      },
      {
        id: "sql0-015-q3",
        type: "choice",
        text: "What does COUNT(DISTINCT category) count?",
        options: [
          "All rows in the table",
          "Rows where category is not NULL",
          "The number of unique category values",
          "The total number of categories times the number of rows",
        ],
        answer: "The number of unique category values",
      },
    ],
  },
};

export default lesson;
