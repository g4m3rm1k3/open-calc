const lesson = {
  id: "sql-0-014",
  slug: "null-the-absent-value",
  chapter: "sql-0",
  order: 10,
  title: "NULL: The Absent Value",
  subtitle: "What 'missing' means in SQL — and why it breaks your expectations",
  tags: ["sql", "null", "is null", "coalesce", "nullif", "three-valued logic"],
  aliases: [
    "sql null",
    "null handling",
    "is null",
    "coalesce sql",
    "missing values sql",
    "null comparison",
  ],

  hook: `NULL is the most misunderstood concept in SQL.
It is not zero. It is not an empty string. It is not false.
It is the complete absence of a value — the database's way of saying "we don't know."
And it has rules that break every programmer's intuition.`,

  mentalModel: [
    "NULL means 'no value' — not zero, not empty, not false. It is unknown.",
    "Any arithmetic or comparison involving NULL produces NULL (unknown). 5 + NULL = NULL. NULL = NULL = NULL (not TRUE).",
    "IS NULL and IS NOT NULL are the only reliable ways to test for NULL.",
    "COALESCE(a, b, c) returns the first non-NULL value in its list — the standard NULL-replacement tool.",
  ],

  intuition: {
    prose: [
      "**NULL means 'I don't know'.** A customer row might have NULL in the `phone` column because the customer never gave their phone number. A product might have NULL in `weight` because it hasn't been measured yet. NULL isn't a value — it's the *absence* of a value.",
      "**Three-valued logic: TRUE, FALSE, or NULL (unknown).** This breaks every programmer's binary intuition. In SQL, conditions don't evaluate to just true or false. They can also evaluate to NULL — unknown. A row is returned only if its WHERE condition evaluates to TRUE. FALSE and NULL both result in the row being excluded.",
      "**`NULL = NULL` is not TRUE — it's NULL.** Think about it: if you don't know Alice's age and you don't know Bob's age, is Alice's age equal to Bob's age? You don't know. The answer is unknown (NULL). This is correct behavior, but it means you can never find NULL rows with `= NULL`.",
      "**Always use IS NULL or IS NOT NULL.** These are the only operators designed for NULL. `WHERE phone IS NULL` finds rows with no phone number. `WHERE phone IS NOT NULL` finds rows that have one.",
      "**COALESCE replaces NULL with a default.** `COALESCE(phone, 'N/A')` returns the phone number if it exists, or the string 'N/A' if it's NULL. COALESCE takes multiple arguments and returns the first non-NULL one: `COALESCE(nickname, first_name, 'Unknown')`.",
      "**NULL propagates through arithmetic.** `salary + bonus` returns NULL if either `salary` or `bonus` is NULL. Use `COALESCE(bonus, 0)` to treat NULL as zero in calculations.",
    ],
    callouts: [
      {
        type: "warning",
        title: "The most common NULL bug",
        body: "A developer writes `WHERE phone <> '555-0100'` expecting to get all customers without that specific phone number — including those with no phone at all. But customers with NULL phone are excluded because `NULL <> '555-0100'` evaluates to NULL (unknown), not TRUE. The fix: `WHERE phone <> '555-0100' OR phone IS NULL`.",
      },
      {
        type: "definition",
        title: "NULL functions",
        body: "**COALESCE(a, b, c, ...):** Returns first non-NULL argument.\n**NULLIF(a, b):** Returns NULL if a = b, otherwise returns a. Useful to avoid division-by-zero: `value / NULLIF(divisor, 0)`.\n**IFNULL(a, b):** SQLite shorthand for COALESCE(a, b) — returns a if not NULL, else b.\n**IS NULL / IS NOT NULL:** Test for NULL. These are the only reliable NULL tests.",
      },
      {
        type: "insight",
        title: "COUNT(*) vs COUNT(column)",
        body: "`COUNT(*)` counts all rows including those with NULLs.\n`COUNT(phone)` counts only rows where phone IS NOT NULL.\nThis difference is significant: `SELECT COUNT(*), COUNT(phone) FROM customers` will show different numbers if any phone is NULL.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Customer table with missing data",
              setup: true,
              sql: `CREATE TABLE customers (
  customer_id  INTEGER PRIMARY KEY,
  name         TEXT    NOT NULL,
  email        TEXT    NOT NULL,
  phone        TEXT,            -- optional, may be NULL
  city         TEXT,            -- optional, may be NULL
  discount_pct REAL             -- optional, may be NULL
);

INSERT INTO customers VALUES
  (1, 'Alice Chen',   'alice@ex.com',   '555-0101', 'Seattle',  10.0),
  (2, 'Bob Patel',    'bob@ex.com',     NULL,        'New York', NULL),
  (3, 'Carol Kim',    'carol@ex.com',   '555-0103', NULL,        5.0),
  (4, 'Dave Nguyen',  'dave@ex.com',    NULL,        'Chicago',  NULL),
  (5, 'Eve Torres',   'eve@ex.com',     '555-0105', 'Seattle',  NULL);`,
            },
            {
              id: "q1",
              label: "See all customers — spot the NULLs",
              sql: `SELECT * FROM customers;`,
            },
            {
              id: "q2",
              label: "Find customers with no phone (IS NULL)",
              sql: `-- IS NULL finds the absence of a value
SELECT name, email FROM customers WHERE phone IS NULL;`,
            },
            {
              id: "q3",
              label: "Wrong way vs right way to find NULLs",
              sql: `-- WRONG: = NULL never returns rows
SELECT name FROM customers WHERE phone = NULL;

-- RIGHT: IS NULL
SELECT name FROM customers WHERE phone IS NULL;`,
            },
            {
              id: "q4",
              label: "NULL propagates in arithmetic",
              sql: `-- Calculate a discounted price — NULL discount makes the whole result NULL
SELECT
  name,
  discount_pct,
  100.00 * (discount_pct / 100.0) AS discount_amount,  -- NULL if discount_pct is NULL
  100.00 - COALESCE(discount_pct, 0) AS price_after_discount  -- treat NULL as 0
FROM customers;`,
            },
            {
              id: "q5",
              label: "COALESCE: replace NULL with a default",
              sql: `SELECT
  name,
  COALESCE(phone, 'No phone on file')    AS phone_display,
  COALESCE(city,  'Location unknown')    AS city_display,
  COALESCE(discount_pct, 0)              AS effective_discount
FROM customers;`,
            },
            {
              id: "q6",
              label: "COUNT(*) vs COUNT(column)",
              sql: `-- COUNT(*) counts all rows; COUNT(col) skips NULLs
SELECT
  COUNT(*)           AS total_customers,
  COUNT(phone)       AS customers_with_phone,
  COUNT(discount_pct) AS customers_with_discount,
  COUNT(city)        AS customers_with_city
FROM customers;`,
            },
            {
              id: "q7",
              label: "NULLIF: the inverse of COALESCE",
              sql: `-- NULLIF(a, b) returns NULL if a = b, otherwise returns a
-- Useful for turning sentinel values into proper NULLs
-- Example: 0-discount rows treated as "no discount"
SELECT
  name,
  discount_pct,
  NULLIF(discount_pct, 0) AS discount_or_null  -- 0 becomes NULL
FROM customers;`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Three-valued logic (3VL) is not a bug — it's a feature.** SQL follows the closed-world assumption variant: a fact is either true, false, or unknown. This is the correct model for incomplete information. The alternative (two-valued logic where NULL = NULL = TRUE) would silently merge distinct unknown values, causing incorrect query results.",
      "**Aggregate functions ignore NULL.** `SUM(col)`, `AVG(col)`, `MAX(col)`, `MIN(col)` all skip NULL values. `AVG(discount_pct)` computes the average only over customers *who have* a discount. This is intentional — NULL means 'unknown', and including unknowns in an average would produce an unknown result.",
      "**UNIQUE constraints and NULL.** In SQL standard and most databases, multiple NULL values in a UNIQUE column are allowed — because NULL ≠ NULL (they're both unknown, not equal). SQLite follows this standard. PostgreSQL too. MySQL historically treated NULLs as equal in unique indexes.",
    ],
    callouts: [
      {
        type: "definition",
        title: "NULL in boolean expressions",
        body: "Special case: `NULL AND FALSE = FALSE` (even though one operand is unknown, the result is deterministically false).\n`NULL OR TRUE = TRUE` (even though one operand is unknown, the result is deterministically true).\nThese are the only two cases where NULL 'collapses' in boolean logic.",
      },
    ],
  },

  examples: [
    {
      title: "Safe division avoiding NULL and zero",
      body: `-- Without protection: salary / years could be NULL (NULL years) or error (0 years)
SELECT
  name,
  salary / NULLIF(years_at_company, 0) AS salary_per_year
FROM employees;
-- NULLIF converts 0 to NULL; dividing by NULL gives NULL (not an error)`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-014-q1",
        type: "choice",
        text: "What does NULL = NULL evaluate to in SQL?",
        options: ["TRUE", "FALSE", "NULL (unknown)", "1"],
        answer: "NULL (unknown)",
      },
      {
        id: "sql0-014-q2",
        type: "choice",
        text: "How do you correctly find all rows where the phone column has no value?",
        options: [
          "WHERE phone = NULL",
          "WHERE phone = ''",
          "WHERE phone IS NULL",
          "WHERE phone == NULL",
        ],
        answer: "WHERE phone IS NULL",
      },
      {
        id: "sql0-014-q3",
        type: "choice",
        text: "What does COALESCE(nickname, first_name, 'Anonymous') return?",
        options: [
          "Always returns nickname",
          "The first non-NULL value among nickname, first_name, and 'Anonymous'",
          "NULL if any of the three values is NULL",
          "The concatenation of all three values",
        ],
        answer:
          "The first non-NULL value among nickname, first_name, and 'Anonymous'",
      },
    ],
  },
};

export default lesson;
