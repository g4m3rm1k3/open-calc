const lesson = {
  id: "sql-0-011",
  slug: "where-clause",
  chapter: "sql-0",
  order: 7,
  title: "WHERE: Filtering Rows",
  subtitle: "Keep only the rows that match a condition",
  tags: [
    "sql",
    "where",
    "filter",
    "conditions",
    "and",
    "or",
    "in",
    "between",
    "like",
  ],
  aliases: [
    "where clause",
    "sql filter",
    "sql conditions",
    "and or sql",
    "in between like",
  ],

  hook: `A table with a million rows is useless if you can't ask it specific questions.
WHERE is how you filter: "show me only the orders placed in May" or
"show me only users from Seattle who signed up after 2023."
Every non-trivial query has a WHERE clause.`,

  mentalModel: [
    "WHERE is evaluated row by row. For each row, the condition is either true (keep it) or false/NULL (discard it).",
    "Combine conditions with AND (both must be true) or OR (either must be true). Use parentheses to control precedence.",
    "IN is shorthand for multiple OR conditions. BETWEEN is inclusive on both ends. LIKE is for text pattern matching.",
    "NULL comparisons never use =. Use IS NULL and IS NOT NULL instead.",
  ],

  intuition: {
    prose: [
      "**WHERE acts like a filter on every row.** The database reads each row, evaluates your condition, and keeps the row only if the condition is true. The condition can be as simple as `price > 100` or as complex as a multi-clause expression combining AND, OR, and parentheses.",
      "**Comparison operators you already know.** `=` (equal), `<>` or `!=` (not equal), `<` (less than), `>` (greater than), `<=` (less than or equal), `>=` (greater than or equal). These work on numbers, text, and dates. Text comparisons are alphabetical: `'B' > 'A'` is true.",
      "**AND requires both conditions to be true; OR requires at least one.** `WHERE price < 50 AND category = 'Books'` keeps only cheap books. `WHERE city = 'Seattle' OR city = 'Portland'` keeps rows from either city. When mixing AND and OR, use parentheses — `WHERE a AND (b OR c)` is very different from `WHERE (a AND b) OR c`.",
      "**IN is cleaner than many ORs.** Instead of `WHERE city = 'Seattle' OR city = 'Portland' OR city = 'Tacoma'`, write `WHERE city IN ('Seattle', 'Portland', 'Tacoma')`. IN checks whether a value appears in the list.",
      "**BETWEEN is inclusive.** `WHERE price BETWEEN 10 AND 50` keeps rows where price is ≥ 10 and ≤ 50. Both endpoints are included. It's shorthand for `WHERE price >= 10 AND price <= 50`.",
      "**LIKE does text pattern matching.** `%` matches any sequence of characters (including none). `_` matches exactly one character. `WHERE name LIKE 'A%'` finds names starting with A. `WHERE email LIKE '%@gmail.com'` finds Gmail addresses. LIKE is case-insensitive in SQLite.",
    ],
    callouts: [
      {
        type: "warning",
        title: "NULL is contagious — never use = NULL",
        body: "Any comparison with NULL evaluates to NULL (unknown), not TRUE or FALSE. `WHERE phone = NULL` will never match any row — not even rows where phone IS NULL. Always use `WHERE phone IS NULL` or `WHERE phone IS NOT NULL`. This is one of the most common beginner SQL bugs.",
      },
      {
        type: "definition",
        title: "Operator reference",
        body: "`=`  equal to\n`<>` or `!=`  not equal to\n`<`  less than,  `>`  greater than\n`<=` less than or equal, `>=` greater than or equal\n`IN (v1, v2, ...)`  value is in the list\n`NOT IN (v1, v2, ...)` value is not in the list\n`BETWEEN a AND b`  value is between a and b (inclusive)\n`LIKE pattern`  text matches pattern (% = any chars, _ = one char)\n`IS NULL` / `IS NOT NULL`  checks for NULL",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Products and orders dataset",
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
  (1,  'Mechanical Keyboard', 'Peripherals',  89.99,  45, 'KeyCo'),
  (2,  'Wireless Mouse',      'Peripherals',  34.99, 120, 'KeyCo'),
  (3,  'Monitor 27"',         'Displays',    249.00,  18, 'ScreenTech'),
  (4,  'USB-C Hub',           'Accessories',  49.99,  60, 'CablePlus'),
  (5,  'Webcam 1080p',        'Peripherals',  79.99,  30, 'VisionCo'),
  (6,  'Desk Lamp LED',       'Accessories',  29.99,  85, 'LightUp'),
  (7,  'Monitor 32" 4K',      'Displays',    499.00,   8, 'ScreenTech'),
  (8,  'Ergonomic Chair',     'Furniture',   349.00,  12, 'ComfortSeating'),
  (9,  'Standing Desk',       'Furniture',   599.00,   5, 'ComfortSeating'),
  (10, 'Mouse Pad XL',        'Accessories',  19.99, 200, 'KeyCo');`,
            },
            {
              id: "q1",
              label: "Basic comparison: products under $50",
              sql: `SELECT name, price
FROM products
WHERE price < 50
ORDER BY price;`,
            },
            {
              id: "q2",
              label: "AND: affordable AND in stock",
              sql: `-- Both conditions must be true
SELECT name, category, price, stock
FROM products
WHERE price < 100
  AND stock > 50;`,
            },
            {
              id: "q3",
              label: "OR: displays OR furniture",
              sql: `SELECT name, category, price
FROM products
WHERE category = 'Displays'
   OR category = 'Furniture'
ORDER BY category, price;`,
            },
            {
              id: "q4",
              label: "IN: same as above, cleaner",
              sql: `SELECT name, category, price
FROM products
WHERE category IN ('Displays', 'Furniture')
ORDER BY category, price;`,
            },
            {
              id: "q5",
              label: "BETWEEN: price range",
              sql: `-- BETWEEN is inclusive: includes $40.00 and $100.00
SELECT name, price
FROM products
WHERE price BETWEEN 40 AND 100
ORDER BY price;`,
            },
            {
              id: "q6",
              label: "LIKE: text patterns",
              sql: `-- % matches any sequence of characters
SELECT name FROM products WHERE name LIKE '%Monitor%';  -- contains Monitor
SELECT name FROM products WHERE name LIKE 'M%';         -- starts with M
SELECT name FROM products WHERE supplier LIKE '%Co';    -- ends with Co`,
            },
            {
              id: "q7",
              label: "NOT: invert a condition",
              sql: `-- NOT IN: everything except these categories
SELECT name, category
FROM products
WHERE category NOT IN ('Peripherals', 'Accessories')
ORDER BY category;`,
            },
            {
              id: "challenge",
              label: "Challenge: low-stock items from KeyCo",
              sql: `-- Find products supplied by KeyCo with fewer than 50 units in stock
-- Show: name, supplier, stock
-- Sort by stock ascending (most urgent first)
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
      "**Three-valued logic.** SQL WHERE conditions evaluate to TRUE, FALSE, or NULL (unknown). A row is kept only if the condition evaluates to TRUE — both FALSE and NULL result in the row being discarded. This is why `NULL = NULL` doesn't match anything: it evaluates to NULL (unknown), not TRUE.",
      "**Short-circuit evaluation.** Most databases evaluate AND/OR conditions left to right and short-circuit. `WHERE FALSE AND <expensive subquery>` skips the subquery. This matters for query optimization.",
      "**Index usage.** The WHERE clause is where indexes make their biggest impact. `WHERE customer_id = 42` can use an index on customer_id to find the row in O(log n) time instead of scanning every row. `WHERE name LIKE '%smith%'` cannot use a B-tree index (leading wildcard) — it forces a full scan.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Precedence: AND binds tighter than OR",
        body: "Without parentheses: `a OR b AND c` is evaluated as `a OR (b AND c)`, not `(a OR b) AND c`. This is a common source of logic bugs. When in doubt, add parentheses to make intent explicit.",
      },
    ],
  },

  examples: [
    {
      title: "Combining AND, OR, and NOT with parentheses",
      body: `-- High-value OR furniture items, but not from ScreenTech
SELECT name, category, price, supplier
FROM products
WHERE (price > 200 OR category = 'Furniture')
  AND supplier <> 'ScreenTech';`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-011-q1",
        type: "choice",
        text: "You want rows where city is 'Seattle' OR 'Portland'. Which is the cleanest way to write this?",
        options: [
          "WHERE city = 'Seattle' OR city = 'Portland'",
          "WHERE city IN ('Seattle', 'Portland')",
          "Both are equivalent; IN is cleaner for two or more values",
          "WHERE city BETWEEN 'Seattle' AND 'Portland'",
        ],
        answer: "Both are equivalent; IN is cleaner for two or more values",
      },
      {
        id: "sql0-011-q2",
        type: "choice",
        text: "What does WHERE phone = NULL match?",
        options: [
          "All rows where phone is NULL",
          "No rows — = NULL always evaluates to NULL (unknown), never TRUE",
          "All rows where phone is not empty string",
          "All rows where phone is 0",
        ],
        answer:
          "No rows — = NULL always evaluates to NULL (unknown), never TRUE",
      },
      {
        id: "sql0-011-q3",
        type: "choice",
        text: "What does WHERE name LIKE 'J%' match?",
        options: [
          "Names that are exactly 'J'",
          "Names containing 'J' anywhere",
          "Names that start with 'J'",
          "Names that end with 'J'",
        ],
        answer: "Names that start with 'J'",
      },
    ],
  },
};

export default lesson;
