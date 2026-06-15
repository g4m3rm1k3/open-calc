const lesson = {
  id: "sql-0-008",
  slug: "data-types",
  chapter: "sql-0",
  order: 3,
  title: "Data Types",
  subtitle:
    "TEXT, INTEGER, REAL, BLOB, and NULL — what kind of data each column holds",
  tags: ["sql", "data types", "text", "integer", "real", "null", "schema"],
  aliases: [
    "sql data types",
    "column types",
    "integer vs text",
    "null in sql",
    "sqlite types",
  ],

  hook: `When you define a table, you must tell the database what *kind* of data goes in each column.
A column that holds names should refuse to accept the number 42.
A column that holds prices should refuse to accept the word "expensive".
Data types are the first line of defense against bad data entering your system.`,

  mentalModel: [
    "Every column has a type. The type tells the database what values are valid and how to store them efficiently.",
    "SQLite's four main types: TEXT (strings), INTEGER (whole numbers), REAL (decimal numbers), BLOB (raw bytes).",
    "NULL is a special value meaning 'no data here' — it is not zero, not empty string, not false. It is the absence of a value.",
    "Types constrain what you can store; constraints like NOT NULL, UNIQUE, and CHECK add further rules.",
  ],

  intuition: {
    prose: [
      "**Every column holds one kind of data.** When you create a table, you declare what type of data goes in each column. The database uses this to store the data efficiently and to catch mistakes — if you try to insert the text `'hello'` into an `INTEGER` column, the database rejects it.",
      "**The four main types in SQLite.** `TEXT` holds any string of characters — names, emails, descriptions. `INTEGER` holds whole numbers — counts, IDs, quantities. `REAL` holds numbers with decimal points — prices, measurements, percentages. `BLOB` holds raw binary data — image bytes, compressed data (you'll rarely use this as a beginner).",
      "**NULL deserves its own category.** NULL means *this value is absent or unknown*. It is not the number zero. It is not an empty string. It is genuinely nothing. A customer row might have a NULL in the `phone` column if the customer never provided their phone number. NULL is the most misunderstood concept in SQL, so we give it its own lesson later.",
      "**You can add constraints alongside types.** `NOT NULL` forbids NULL values in a column — every row must have a real value there. `UNIQUE` ensures no two rows have the same value in that column (useful for email addresses, usernames). `DEFAULT` sets a value that is used when you don't provide one.",
      "**Why types matter for beginners.** If you store a price as TEXT ('12.99') instead of REAL (12.99), sorting by price gives you alphabetical order — '9.99' sorts after '12.99' because '9' > '1'. Always store numbers as numbers.",
    ],
    callouts: [
      {
        type: "definition",
        title: "SQLite's type system",
        body: "**TEXT:** Any string of characters. 'Alice', 'hello@example.com', 'New York City'.\n**INTEGER:** Whole numbers. 42, -7, 0, 1000000.\n**REAL:** Floating-point numbers. 3.14, 99.99, -0.5.\n**BLOB:** Raw binary data. Rarely used directly.\n**NULL:** The absence of any value. Not zero, not empty string.",
      },
      {
        type: "warning",
        title: "SQLite is flexible — but flexibility bites you",
        body: "SQLite allows you to store any value in any column regardless of declared type (this is called 'type affinity', not strict typing). PostgreSQL and MySQL are stricter. Regardless, always use the right type — it prevents logic bugs and sorting errors.",
      },
      {
        type: "insight",
        title: "INTEGER PRIMARY KEY is special in SQLite",
        body: "A column declared `INTEGER PRIMARY KEY` is an alias for SQLite's internal row ID. It auto-increments — if you insert a row without providing this value, SQLite automatically assigns the next integer. This is the standard way to give every row a unique ID.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Create a table with multiple types",
              setup: true,
              sql: `CREATE TABLE products (
  product_id   INTEGER PRIMARY KEY,  -- whole number, auto-assigned
  name         TEXT    NOT NULL,     -- text, required
  description  TEXT,                 -- text, optional (allows NULL)
  price        REAL    NOT NULL,     -- decimal number, required
  stock        INTEGER NOT NULL DEFAULT 0,  -- whole number, defaults to 0
  is_active    INTEGER NOT NULL DEFAULT 1   -- SQLite has no BOOLEAN; use 0/1
);

INSERT INTO products (name, description, price, stock) VALUES
  ('Keyboard',  'Mechanical, 60%',  89.99,  45),
  ('Mouse',     'Wireless',         34.99, 120),
  ('Monitor',   NULL,              249.00,  18),  -- description is NULL
  ('USB Hub',   'USB-C, 7 ports',   49.99,   0);  -- out of stock`,
            },
            {
              id: "q1",
              label: "See the data — notice how types look",
              sql: `SELECT * FROM products;
-- Notice:
--   product_id was auto-assigned (1, 2, 3, 4) even though we didn't insert it
--   Monitor's description shows NULL
--   is_active defaults to 1 for all rows`,
            },
            {
              id: "q2",
              label: "Types affect arithmetic — prices are numbers",
              sql: `-- Arithmetic works on REAL and INTEGER columns
SELECT
  name,
  price,
  price * 1.10        AS price_with_tax,   -- 10% tax
  price * stock       AS inventory_value
FROM products
ORDER BY inventory_value DESC;`,
            },
            {
              id: "q3",
              label: "NULL: the missing description",
              sql: `-- IS NULL tests for the absence of a value
SELECT name, description
FROM products
WHERE description IS NULL;

-- Trying = NULL would not work: NULL = NULL is NULL (not TRUE)
-- This is the most common NULL mistake. We'll cover it fully later.`,
            },
            {
              id: "q4",
              label: "TYPEOF() — inspect the actual stored type",
              sql: `-- SQLite's TYPEOF() function reveals what type was actually stored
SELECT
  name,
  TYPEOF(price)      AS price_type,
  TYPEOF(stock)      AS stock_type,
  TYPEOF(description) AS description_type
FROM products;`,
            },
            {
              id: "q5",
              label: "Text stored as text sorts alphabetically — beware",
              sql: `-- Create a demo table with price stored as TEXT (wrong approach)
CREATE TABLE bad_prices (item TEXT, price TEXT);
INSERT INTO bad_prices VALUES ('A', '9.99'), ('B', '12.99'), ('C', '149.99');

-- Sorts alphabetically: '1' < '9' so 12.99 comes before 9.99
SELECT item, price FROM bad_prices ORDER BY price;

-- With REAL types this would sort numerically (correct)`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**SQLite uses 'type affinity', not strict typing.** Unlike PostgreSQL or MySQL, SQLite stores values based on their actual data rather than enforcing the declared type. If you insert the text '42' into an INTEGER column, SQLite stores it as the integer 42. If you insert 'hello' into an INTEGER column, it stores it as text. This flexibility is useful for a learning environment but not the default behavior in production databases.",
      "**Storage classes vs. type affinity.** SQLite has five storage classes for the actual values stored: NULL, INTEGER, REAL, TEXT, BLOB. The declared column type suggests an affinity — an INTEGER column *prefers* to store integers but won't reject text. The STRICT table modifier (SQLite 3.37+) enables true strict typing.",
      "**NULL semantics in SQL are three-valued logic.** Any comparison involving NULL evaluates to NULL (unknown), not TRUE or FALSE. This means `NULL = NULL` is NULL, not TRUE. `NULL <> 5` is NULL, not TRUE. Only `IS NULL` and `IS NOT NULL` reliably detect NULL values.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Type affinity rules in SQLite",
        body: "Column type keywords that contain 'INT' → INTEGER affinity.\n'CHAR', 'CLOB', 'TEXT' → TEXT affinity.\n'REAL', 'FLOA', 'DOUB' → REAL affinity.\n'BLOB' or no type → BLOB affinity.\nAnything else → NUMERIC affinity.",
      },
    ],
  },

  examples: [
    {
      title: "Choosing the right type",
      body: `Use TEXT for: names, emails, addresses, descriptions, codes like 'CA' or 'USD'.
Use INTEGER for: IDs, counts, quantities, years, boolean flags (0/1).
Use REAL for: prices, percentages, measurements, GPS coordinates.
If in doubt: if you'll do math on it, use a number type. If you won't, text is fine.`,
    },
    {
      title: "Phone numbers are TEXT, not INTEGER",
      body: `Phone numbers look like numbers but should be stored as TEXT.
Why? Leading zeros: '0044 207 123 4567' — an INTEGER would drop the leading zero.
Also: you never do arithmetic on phone numbers (what would adding two phones mean?).
When deciding a type, ask: 'Will I do arithmetic on this?' If no, TEXT is usually right.`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-008-q1",
        type: "choice",
        text: "A column stores prices like 9.99, 149.00, 34.50. Which type should it use?",
        options: ["TEXT", "INTEGER", "REAL", "BLOB"],
        answer: "REAL",
      },
      {
        id: "sql0-008-q2",
        type: "choice",
        text: "What does NULL represent in SQL?",
        options: [
          "The number zero",
          "An empty string",
          "The boolean value false",
          "The absence of a value — unknown or not applicable",
        ],
        answer: "The absence of a value — unknown or not applicable",
      },
      {
        id: "sql0-008-q3",
        type: "choice",
        text: "Why should a phone number be stored as TEXT rather than INTEGER?",
        options: [
          "TEXT columns are faster to search",
          "Phone numbers can have leading zeros and you never do arithmetic on them",
          "INTEGER columns can't store large numbers",
          "The database requires it",
        ],
        answer:
          "Phone numbers can have leading zeros and you never do arithmetic on them",
      },
    ],
  },
};

export default lesson;
