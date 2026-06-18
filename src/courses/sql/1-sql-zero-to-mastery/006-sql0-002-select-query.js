const lesson = {
  id: "sql-0-002",
  slug: "select-query",
  chapter: "sql-0",
  order: 6,
  title: "SELECT — Retrieving Data",
  subtitle: "WHERE, ORDER BY, LIMIT, and thinking in sets",
  tags: ["sql", "select", "where", "order by", "limit"],
  aliases: [
    "sql queries",
    "select statement",
    "filtering rows",
    "where clause",
  ],

  hook: `SELECT is the workhorse of SQL. It answers one question:
"Give me the rows from this table that match these conditions."
Master SELECT and you can answer 80% of data questions without touching any other tool.`,

  intuition: {
    prose: [
      "**SELECT is a filter pipeline.** Conceptually: FROM picks the table (all rows), WHERE keeps only rows matching a condition, SELECT projects (chooses) only the columns you need, ORDER BY sorts the survivors, and LIMIT takes the first N. You describe *what* you want; the database figures out *how* to get it.",
      "**WHERE uses standard comparisons.** `=`, `<>`, `<`, `>`, `<=`, `>=` for values. Combine with `AND`, `OR`, `NOT`. Use `IN (val1, val2, ...)` for a list of values and `BETWEEN low AND high` for ranges. For text patterns, `LIKE` with `%` (any sequence) and `_` (exactly one character).",
      "**Column aliases with AS.** `SELECT price * 1.1 AS price_with_tax` — AS renames the output column. Aliases can be used in ORDER BY but not in WHERE (WHERE runs before SELECT in the logical order).",
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
              sql: `CREATE TABLE products (
  product_id  INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  category    TEXT    NOT NULL,
  price       REAL    NOT NULL,
  stock       INTEGER NOT NULL,
  supplier    TEXT    NOT NULL
);

INSERT INTO products VALUES
  (1,  'Mechanical Keyboard',  'Peripherals',  89.99,  45, 'KeyCo'),
  (2,  'Wireless Mouse',       'Peripherals',  34.99, 120, 'KeyCo'),
  (3,  'Monitor 27"',          'Displays',    249.00,  18, 'ScreenTech'),
  (4,  'USB-C Hub',            'Accessories',  49.99,  60, 'CablePlus'),
  (5,  'Webcam 1080p',         'Peripherals',  79.99,  30, 'VisionCo'),
  (6,  'Desk Lamp LED',        'Accessories',  29.99,  85, 'LightUp'),
  (7,  'Monitor 32" 4K',       'Displays',    499.00,   8, 'ScreenTech'),
  (8,  'Ergonomic Chair',      'Furniture',   349.00,  12, 'ComfortSeating'),
  (9,  'Standing Desk',        'Furniture',   599.00,   5, 'ComfortSeating'),
  (10, 'Mouse Pad XL',         'Accessories',  19.99, 200, 'KeyCo');

CREATE TABLE orders (
  order_id    INTEGER PRIMARY KEY,
  customer    TEXT    NOT NULL,
  product_id  INTEGER REFERENCES products(product_id),
  quantity    INTEGER NOT NULL,
  order_date  TEXT    NOT NULL,
  shipped     INTEGER NOT NULL DEFAULT 0
);

INSERT INTO orders VALUES
  (1, 'Alice',  1, 1, '2024-05-01', 1),
  (2, 'Bob',    3, 1, '2024-05-02', 1),
  (3, 'Carol',  2, 2, '2024-05-03', 0),
  (4, 'Alice',  7, 1, '2024-05-04', 0),
  (5, 'Dave',   5, 1, '2024-05-05', 1),
  (6, 'Eve',    4, 3, '2024-05-06', 0),
  (7, 'Bob',    9, 1, '2024-05-07', 0),
  (8, 'Carol',  6, 2, '2024-05-08', 1);`,
            },
            {
              id: "q1",
              label: "All products — * means every column",
              sql: `SELECT * FROM products;`,
            },
            {
              id: "q2",
              label: "Choose specific columns and rename with AS",
              sql: `SELECT
  name         AS product_name,
  price        AS price_usd,
  stock        AS units_available
FROM products;`,
            },
            {
              id: "q3",
              label: "WHERE — filter rows",
              sql: `-- Products under $100 in stock
SELECT name, price, stock
FROM products
WHERE price < 100
  AND stock > 50;`,
            },
            {
              id: "q4",
              label: "IN and BETWEEN",
              sql: `-- Products in specific categories
SELECT name, category, price
FROM products
WHERE category IN ('Displays', 'Furniture')
ORDER BY price DESC;

-- Price range
SELECT name, price
FROM products
WHERE price BETWEEN 40 AND 100
ORDER BY price;`,
            },
            {
              id: "q5",
              label: "LIKE — text pattern matching",
              sql: `-- Products with "Monitor" in the name
SELECT name, price FROM products WHERE name LIKE '%Monitor%';

-- Products supplied by anyone with "Co" in their name
SELECT name, supplier FROM products WHERE supplier LIKE '%Co%';`,
            },
            {
              id: "q6",
              label: "ORDER BY and LIMIT",
              sql: `-- Top 3 most expensive products
SELECT name, price
FROM products
ORDER BY price DESC
LIMIT 3;`,
            },
            {
              id: "challenge",
              label: "Your turn: pending orders",
              sql: `-- Find all orders that have NOT been shipped (shipped = 0)
-- Show: order_id, customer, order_date
-- Sort by order_date ascending
-- Write your query here:
`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Logical execution order differs from write order.** FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. This is why you can't use a SELECT alias in WHERE (WHERE runs before SELECT), but you can use it in ORDER BY (ORDER BY runs after SELECT).",
      "**DISTINCT removes duplicate rows.** `SELECT DISTINCT category FROM products` — returns each category once. Applied after SELECT expressions, before ORDER BY.",
      "**NULL comparisons require IS NULL / IS NOT NULL.** `WHERE shipped_date = NULL` never matches any row; use `WHERE shipped_date IS NULL` instead. NULL is not equal to anything, including itself.",
    ],
  },

  examples: [
    {
      title: "Why you should not SELECT *",
      body: `SELECT * is fine for exploration, but in production code it's a trap:
if someone adds a column to the table, your query silently starts returning it.
Always name the columns you actually need.`,
    },
    {
      title: "Aliases and readability",
      body: `Column aliases (AS) appear in the result headers and can be used in ORDER BY.
They cannot be used in WHERE because WHERE runs before SELECT in the logical order.`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-002-q1",
        type: "choice",
        text: "What is the logical evaluation order of a SELECT statement?",
        options: [
          "SELECT → FROM → WHERE → ORDER BY",
          "FROM → WHERE → SELECT → ORDER BY → LIMIT",
          "WHERE → FROM → SELECT → LIMIT",
          "SELECT → WHERE → FROM → ORDER BY",
        ],
        answer: "FROM → WHERE → SELECT → ORDER BY → LIMIT",
      },
      {
        id: "sql0-002-q2",
        type: "choice",
        text: "Why can't you use a column alias defined in SELECT inside a WHERE clause?",
        options: [
          "WHERE doesn't support aliases",
          "WHERE is evaluated before SELECT, so the alias doesn't exist yet",
          "Aliases only work in ORDER BY",
          "You need double quotes around aliases in WHERE",
        ],
        answer:
          "WHERE is evaluated before SELECT, so the alias doesn't exist yet",
      },
      {
        id: "sql0-002-q3",
        type: "choice",
        text: "What does LIKE '%key%' match?",
        options: [
          "Only strings that start with 'key'",
          "Only strings that end with 'key'",
          "Any string containing 'key' anywhere",
          "Strings that are exactly 'key'",
        ],
        answer: "Any string containing 'key' anywhere",
      },
    ],
  },

  mentalModel: [
    "FROM picks the table, WHERE filters rows, SELECT chooses columns — in that logical order",
    "Think in sets: describe *what* you want, not *how* to find it",
    "ORDER BY sorts the result; LIMIT caps the number of rows returned",
    "Column aliases (AS) rename output; they cannot be used in WHERE (applied too early)",
  ],
};

export default lesson;
