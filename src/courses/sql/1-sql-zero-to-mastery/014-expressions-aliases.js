const lesson = {
  id: "sql-0-017",
  slug: "expressions-aliases",
  chapter: "sql-0",
  order: 14,
  title: "Expressions & Aliases",
  subtitle: "Compute new values and give columns meaningful names",
  tags: [
    "sql",
    "expressions",
    "aliases",
    "as",
    "calculated columns",
    "arithmetic",
    "string concat",
  ],
  aliases: [
    "sql expressions",
    "sql aliases",
    "calculated columns",
    "as keyword sql",
    "arithmetic sql",
    "computed columns",
  ],

  hook: `SQL's SELECT clause isn't just about picking columns.
You can do math: price * 1.08 for tax.
You can format text: first_name || ' ' || last_name for full name.
You can categorize values: CASE WHEN price > 100 THEN 'premium' ELSE 'budget' END.
Expressions turn raw data into the answers people actually need.`,

  mentalModel: [
    "Expressions in SELECT compute new values from existing columns. The result is a computed column.",
    "AS gives a computed column (or any column) a readable name called an alias.",
    "The || operator concatenates text in SQLite. UPPER(), LOWER(), ROUND() are built-in functions.",
    "Aliases defined in SELECT are available in ORDER BY but NOT in WHERE or HAVING.",
  ],

  intuition: {
    prose: [
      "**SELECT can compute, not just retrieve.** Every item in the SELECT list is an expression. `SELECT name, price` retrieves two columns. `SELECT name, price * 1.08 AS price_with_tax` retrieves name and computes a new column on the fly. The original `price` column in the table is unchanged — you're computing a derived value just for this result set.",
      "**Arithmetic works as expected.** `+`, `-`, `*`, `/` work on numeric columns. `price * quantity AS subtotal`, `salary / 12 AS monthly_salary`, `(high + low) / 2.0 AS midpoint`. Always divide by a float (2.0 not 2) when you want a decimal result; integer division truncates in many cases.",
      "**AS gives your expression a name (alias).** Without AS, a computed column often has an ugly name like `price * 1.08` in the results. `AS price_with_tax` gives it a clean name. AS is optional — you can write `price * 1.08 price_with_tax` — but the explicit AS is much more readable.",
      "**Concatenate text with ||.** `first_name || ' ' || last_name AS full_name` joins strings with a space. `city || ', ' || state AS location`. This is SQLite's string concatenation operator. (Other databases use CONCAT() or +.)",
      "**Aliases propagate to ORDER BY.** After you define `price * quantity AS subtotal`, you can write `ORDER BY subtotal`. But you cannot use aliases in WHERE or HAVING — those clauses run before SELECT evaluates the alias.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Common expression patterns",
        body: "**Math:** `price * quantity`, `salary * 1.10`, `(a + b) / 2.0`\n**Text concat:** `first || ' ' || last`\n**Functions:** `UPPER(name)`, `LOWER(email)`, `ROUND(price, 2)`, `ABS(balance)`, `LENGTH(description)`\n**Conditional:** `CASE WHEN score >= 90 THEN 'A' WHEN score >= 80 THEN 'B' ELSE 'C' END`\n**NULL-safe:** `COALESCE(phone, 'N/A')`",
      },
      {
        type: "warning",
        title: "Integer division truncates",
        body: "`SELECT 7 / 2` returns 3 in SQLite (integer division). To get 3.5, use `7.0 / 2` or `CAST(7 AS REAL) / 2`. When dividing column values, make sure at least one operand is a real number if you need decimal precision.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Products and employees dataset",
              setup: true,
              sql: `CREATE TABLE products (
  product_id  INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  category    TEXT    NOT NULL,
  price       REAL    NOT NULL,
  cost        REAL    NOT NULL,
  stock       INTEGER NOT NULL
);

CREATE TABLE staff (
  staff_id    INTEGER PRIMARY KEY,
  first_name  TEXT    NOT NULL,
  last_name   TEXT    NOT NULL,
  department  TEXT    NOT NULL,
  salary      REAL    NOT NULL,
  bonus_pct   REAL    NOT NULL DEFAULT 0
);

INSERT INTO products VALUES
  (1, 'Laptop Pro',     'Electronics', 1299.00,  800.00, 25),
  (2, 'Wireless Mouse', 'Peripherals',   34.99,   12.00, 150),
  (3, 'Monitor 27"',    'Displays',     249.00,  130.00, 40),
  (4, 'USB-C Hub',      'Accessories',   49.99,   18.00, 80),
  (5, 'Webcam 1080p',   'Peripherals',   79.99,   35.00, 55);

INSERT INTO staff VALUES
  (1, 'Alice',  'Chen',     'Engineering', 115000, 10),
  (2, 'Bob',    'Patel',    'Engineering',  98000,  8),
  (3, 'Carol',  'Kim',      'Design',       92000,  7),
  (4, 'Dave',   'Nguyen',   'Engineering',  87000,  6),
  (5, 'Eve',    'Torres',   'Marketing',    78000,  5);`,
            },
            {
              id: "q1",
              label: "Arithmetic: profit margin calculation",
              sql: `SELECT
  name,
  price,
  cost,
  ROUND(price - cost, 2)                    AS gross_profit,
  ROUND((price - cost) / price * 100, 1)   AS margin_pct
FROM products
ORDER BY margin_pct DESC;`,
            },
            {
              id: "q2",
              label: "Text concatenation with ||",
              sql: `SELECT
  first_name || ' ' || last_name            AS full_name,
  UPPER(department)                          AS dept,
  salary,
  ROUND(salary * bonus_pct / 100.0, 2)      AS bonus_amount,
  ROUND(salary + salary * bonus_pct / 100.0, 2) AS total_comp
FROM staff
ORDER BY total_comp DESC;`,
            },
            {
              id: "q3",
              label: "Alias in ORDER BY (but not WHERE)",
              sql: `-- 'margin_pct' alias available in ORDER BY
SELECT
  name,
  ROUND((price - cost) / price * 100, 1) AS margin_pct
FROM products
ORDER BY margin_pct DESC;

-- If you need to filter by the computed value, repeat the expression in WHERE:
-- WHERE (price - cost) / price * 100 > 50  (not WHERE margin_pct > 50)`,
            },
            {
              id: "q4",
              label: "Column aliasing for clarity",
              sql: `-- Even non-computed columns benefit from aliases for readability
SELECT
  name        AS product_name,
  price       AS retail_price,
  cost        AS unit_cost,
  stock       AS units_in_stock,
  stock * cost AS inventory_value
FROM products;`,
            },
            {
              id: "q5",
              label: "String functions",
              sql: `SELECT
  first_name || ' ' || last_name      AS name,
  UPPER(first_name || ' ' || last_name) AS name_upper,
  LENGTH(first_name)                  AS first_name_length,
  SUBSTR(department, 1, 3)            AS dept_code
FROM staff;`,
            },
            {
              id: "challenge",
              label: "Challenge: inventory risk report",
              sql: `-- For each product, calculate:
-- 1. inventory_value = stock * cost
-- 2. revenue_potential = stock * price
-- 3. potential_profit = revenue_potential - inventory_value
-- Show name, category, and all three computed columns
-- Sort by potential_profit descending
`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Computed columns are not stored.** Expressions in SELECT are evaluated at query time. They don't create new physical columns in the table. To persist a computed value, you'd use a computed/generated column feature (available in modern SQLite) or store it explicitly via INSERT/UPDATE.",
      "**Type affinity in expressions.** SQLite is dynamically typed. `price - cost` works even if they were stored as TEXT representations of numbers (SQLite coerces them). But `'10' + '5'` in SQLite returns 15 (numeric), not '105' (concatenation). The `||` operator always concatenates as text: `10 || 5` returns '105'.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Integer vs. real division in SQLite",
        body: "`7 / 2` → `3` (integer division, truncates)\n`7.0 / 2` → `3.5` (real division)\n`7 / 2.0` → `3.5` (real division)\n`CAST(7 AS REAL) / 2` → `3.5`\nAs long as one operand is REAL, the result is REAL.",
      },
    ],
  },

  examples: [
    {
      title: "Price tiers using CASE WHEN (preview of lesson 19)",
      body: `SELECT
  name,
  price,
  CASE
    WHEN price >= 1000 THEN 'Premium'
    WHEN price >= 100  THEN 'Mid-range'
    ELSE                    'Budget'
  END AS price_tier
FROM products
ORDER BY price DESC;`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-017-q1",
        type: "choice",
        text: "In SQLite, what does SELECT 7 / 2 return?",
        options: ["3.5", "3", "4", "NULL"],
        answer: "3",
      },
      {
        id: "sql0-017-q2",
        type: "choice",
        text: "How do you concatenate two text columns in SQLite?",
        options: [
          "first_name + last_name",
          "CONCAT(first_name, last_name)",
          "first_name || last_name",
          "first_name & last_name",
        ],
        answer: "first_name || last_name",
      },
      {
        id: "sql0-017-q3",
        type: "choice",
        text: "You write SELECT price * 1.08 AS taxed_price ... ORDER BY taxed_price. Is this valid?",
        options: [
          "No — aliases cannot be used in ORDER BY",
          "Yes — aliases defined in SELECT are available in ORDER BY",
          "No — you must use the full expression again",
          "Only if you also define the alias in GROUP BY",
        ],
        answer: "Yes — aliases defined in SELECT are available in ORDER BY",
      },
    ],
  },
};

export default lesson;
