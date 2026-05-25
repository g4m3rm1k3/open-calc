const lesson = {
  id: "sql-0-010",
  slug: "insert-data",
  chapter: "sql-0",
  order: 5,
  title: "INSERT INTO",
  subtitle: "Adding rows to a table — one at a time, or many at once",
  tags: ["sql", "insert", "dml", "add data", "insert into"],
  aliases: ["insert sql", "add rows", "insert data", "insert into values"],

  hook: `You've created a table — an empty grid waiting for data.
Now you need to fill it.
INSERT INTO is the statement that adds rows.
Get this right and your queries will always have something to work with.`,

  mentalModel: [
    "INSERT INTO adds one or more rows to a table.",
    "You specify which columns to fill, then the values in matching order. Omitting a column uses its DEFAULT or NULL.",
    "INSERT fails if you violate a constraint: NOT NULL, UNIQUE, PRIMARY KEY, FOREIGN KEY, or CHECK.",
    "INSERT can also pull data from another table using INSERT INTO ... SELECT.",
  ],

  intuition: {
    prose: [
      "**The basic syntax is straightforward.** `INSERT INTO tablename (col1, col2, col3) VALUES (val1, val2, val3)`. You name the table, list the columns you're providing values for, then provide the matching values. Order matters — the first value goes into the first column you listed.",
      "**You don't have to list every column.** Columns with `DEFAULT` values or that allow `NULL` can be omitted from the INSERT. The database fills them in automatically. Columns with `NOT NULL` and no `DEFAULT` must be provided — inserting without them causes an error.",
      "**Insert multiple rows in one statement.** Adding a comma-separated list of value groups after VALUES is much more efficient than one INSERT per row — the database processes it as a single operation. This matters for large datasets.",
      "**INSERT fails loudly if you break a rule.** Try to insert a duplicate primary key? Error. Try to insert a string into a NOT NULL column without a value? Error. Try to insert a foreign key that doesn't exist in the parent table? Error. These failures are features — they protect your data from becoming inconsistent.",
      "**INSERT ... SELECT copies rows from one table to another.** Instead of providing literal VALUES, you write a SELECT that produces the rows to insert. This is useful for populating a new table from existing data or archiving rows to a history table.",
    ],
    callouts: [
      {
        type: "insight",
        title: "Always list your columns explicitly",
        body: "You can write `INSERT INTO t VALUES (1, 'Alice', 'alice@co.com')` without naming columns. This works but breaks if someone adds or reorders columns later. Always write `INSERT INTO t (id, name, email) VALUES (...)` — it's self-documenting and resilient to schema changes.",
      },
      {
        type: "warning",
        title: "INSERT OR REPLACE vs. INSERT OR IGNORE",
        body: "If you insert a row with a duplicate PRIMARY KEY or UNIQUE value:\n- `INSERT OR REPLACE` deletes the old row and inserts the new one\n- `INSERT OR IGNORE` silently skips the new row if a conflict exists\n- Plain `INSERT` raises an error\nChoose based on whether you want to overwrite, skip, or be warned.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Create tables for this lesson",
              setup: true,
              sql: `CREATE TABLE customers (
  customer_id  INTEGER PRIMARY KEY,
  name         TEXT    NOT NULL,
  email        TEXT    NOT NULL UNIQUE,
  city         TEXT    NOT NULL,
  joined_date  TEXT    NOT NULL DEFAULT (date('now'))
);

CREATE TABLE orders (
  order_id     INTEGER PRIMARY KEY,
  customer_id  INTEGER NOT NULL REFERENCES customers(customer_id),
  item         TEXT    NOT NULL,
  amount       REAL    NOT NULL CHECK(amount > 0),
  order_date   TEXT    NOT NULL DEFAULT (date('now'))
);`,
            },
            {
              id: "q1",
              label: "Insert one row explicitly",
              sql: `INSERT INTO customers (customer_id, name, email, city, joined_date)
VALUES (1, 'Alice Chen', 'alice@example.com', 'Seattle', '2024-01-10');

SELECT * FROM customers;`,
            },
            {
              id: "q2",
              label: "Insert multiple rows at once",
              sql: `INSERT INTO customers (customer_id, name, email, city, joined_date) VALUES
  (2, 'Bob Patel',   'bob@example.com',   'New York', '2024-02-15'),
  (3, 'Carol Kim',   'carol@example.com', 'Chicago',  '2024-03-01'),
  (4, 'Dave Nguyen', 'dave@example.com',  'Seattle',  '2024-03-20');

SELECT * FROM customers;`,
            },
            {
              id: "q3",
              label: "Omit the DEFAULT column — it fills in automatically",
              sql: `-- joined_date has DEFAULT (date('now')), so we can omit it
INSERT INTO customers (name, email, city)
VALUES ('Eve Torres', 'eve@example.com', 'Austin');

SELECT * FROM customers WHERE name = 'Eve Torres';
-- joined_date should show today's date`,
            },
            {
              id: "q4",
              label: "Insert orders for customers",
              sql: `INSERT INTO orders (customer_id, item, amount, order_date) VALUES
  (1, 'Laptop',    1299.00, '2024-04-01'),
  (1, 'Mouse',       45.00, '2024-04-15'),
  (2, 'Keyboard',   110.00, '2024-04-20'),
  (3, 'Monitor',    399.00, '2024-05-01'),
  (4, 'Webcam',      89.00, '2024-05-10');

SELECT * FROM orders;`,
            },
            {
              id: "q5",
              label: "Constraint violation — duplicate email",
              sql: `-- email has UNIQUE constraint; this will fail
INSERT INTO customers (name, email, city)
VALUES ('Alice Double', 'alice@example.com', 'Portland');
-- Error: UNIQUE constraint failed: customers.email`,
            },
            {
              id: "q6",
              label: "INSERT OR IGNORE — skip conflicts silently",
              sql: `-- Insert a new customer and try to re-insert Alice — the duplicate is skipped
INSERT OR IGNORE INTO customers (name, email, city) VALUES
  ('Frank Liu',    'frank@example.com',  'Denver'),
  ('Alice Double', 'alice@example.com',  'Portland');  -- duplicate email, ignored

SELECT * FROM customers ORDER BY customer_id;`,
            },
            {
              id: "q7",
              label: "INSERT ... SELECT — copy data from another table",
              sql: `-- Create a table for Seattle customers only
CREATE TABLE seattle_customers AS
  SELECT * FROM customers WHERE city = 'Seattle';

SELECT * FROM seattle_customers;`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**INSERT is atomic per statement.** A single INSERT (even one with hundreds of rows in the VALUES list) either fully succeeds or fully fails. There is no partial insertion. If row 47 out of 100 violates a constraint, none of the 100 rows are inserted.",
      "**RETURNING clause (SQLite 3.35+).** `INSERT INTO customers (...) VALUES (...) RETURNING customer_id` returns the generated primary key immediately after insertion. This is essential when you need the auto-assigned ID to use in a subsequent INSERT into a related table.",
      "**INSERT performance.** Wrapping many INSERTs in a transaction (`BEGIN; INSERT...; INSERT...; COMMIT;`) dramatically speeds up bulk inserts in SQLite — sometimes 100x faster — because SQLite writes to disk once at COMMIT rather than after every statement.",
    ],
    callouts: [
      {
        type: "definition",
        title: "ON CONFLICT clause",
        body: "All in one place:\n`INSERT OR ABORT` (default) — rollback the INSERT, raise error\n`INSERT OR FAIL` — raise error, keep other changes in transaction\n`INSERT OR IGNORE` — skip conflicting row silently\n`INSERT OR REPLACE` — delete the conflicting row, insert the new one\n`INSERT OR ROLLBACK` — rollback the entire transaction on conflict",
      },
    ],
  },

  examples: [
    {
      title: "Inserting a row and immediately using its ID",
      body: `INSERT INTO customers (name, email, city)
VALUES ('Zara Ahmed', 'zara@example.com', 'Boston')
RETURNING customer_id;
-- Returns: customer_id = 6 (or whatever the next ID is)

-- Then use that ID:
INSERT INTO orders (customer_id, item, amount)
VALUES (6, 'Standing Desk', 599.00);`,
    },
    {
      title: "Bulk insert wrapped in a transaction",
      body: `BEGIN;
INSERT INTO logs (event, ts) VALUES ('login', '2024-05-01 08:00');
INSERT INTO logs (event, ts) VALUES ('page_view', '2024-05-01 08:01');
-- ... thousands more ...
COMMIT;
-- All rows committed to disk in one operation — much faster than individual INSERTs.`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-010-q1",
        type: "choice",
        text: "What happens if you omit a column from an INSERT and that column has a DEFAULT value?",
        options: [
          "The INSERT fails with an error",
          "The column is set to NULL",
          "The column is set to its DEFAULT value",
          "The column is set to 0",
        ],
        answer: "The column is set to its DEFAULT value",
      },
      {
        id: "sql0-010-q2",
        type: "choice",
        text: "You try to INSERT a row with a primary key that already exists. What is the default behavior?",
        options: [
          "The old row is silently overwritten",
          "The new row is silently skipped",
          "An error is raised and the INSERT fails",
          "Both rows are stored and the primary key becomes non-unique",
        ],
        answer: "An error is raised and the INSERT fails",
      },
      {
        id: "sql0-010-q3",
        type: "choice",
        text: "What does INSERT INTO ... SELECT do?",
        options: [
          "Reads rows from a file and inserts them",
          "Inserts rows produced by a SELECT query",
          "Updates existing rows using a SELECT result",
          "Creates a new table with the SELECT result",
        ],
        answer: "Inserts rows produced by a SELECT query",
      },
    ],
  },
};

export default lesson;
