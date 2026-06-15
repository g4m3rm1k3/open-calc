const lesson = {
  id: "sql-0-001",
  slug: "what-is-a-database",
  chapter: "sql-0",
  order: 2,
  title: "What Is a Database?",
  subtitle: "Tables, rows, columns, and why flat files fail",
  tags: ["sql", "fundamentals", "schema", "tables"],
  aliases: ["database basics", "relational model", "what is sql"],

  hook: `You already have a spreadsheet. Why does anyone bother with a database?
The answer is: three spreadsheets that need to talk to each other.
Once you need relationships between data, a flat file fights you at every step.
SQL is the language that makes relationships first-class.`,

  intuition: {
    prose: [
      "**A database stores every fact exactly once.** In a flat spreadsheet, Alice's email appears on every order row — change her address and you must update every row. Miss one and your data is inconsistent. This is an **update anomaly**, one of the core problems the relational model was invented to solve.",
      "**The relational approach: split data into focused tables.** A `customers` table holds each customer once. An `orders` table references the customer by ID. A `products` table holds each product once. Each table has a **primary key** — a column that uniquely identifies each row. Tables connect via **foreign keys** — a column holding the primary key of another table's row.",
      "**This is the relational model**, invented by E.F. Codd in 1970. SQL is its query language. The flat-file anomalies — update, insertion, deletion — disappear when each fact lives in exactly one place.",
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Build the schema (auto-runs on load)",
              setup: true,
              sql: `-- Customers: each person lives here exactly once
CREATE TABLE customers (
  customer_id   INTEGER PRIMARY KEY,
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  joined_date   TEXT    NOT NULL
);

-- Products: each product lives here exactly once
CREATE TABLE products (
  product_id    INTEGER PRIMARY KEY,
  name          TEXT    NOT NULL,
  price         REAL    NOT NULL,
  category      TEXT    NOT NULL
);

-- Orders: references customers and products by ID
CREATE TABLE orders (
  order_id      INTEGER PRIMARY KEY,
  customer_id   INTEGER NOT NULL REFERENCES customers(customer_id),
  product_id    INTEGER NOT NULL REFERENCES products(product_id),
  quantity      INTEGER NOT NULL DEFAULT 1,
  order_date    TEXT    NOT NULL
);

-- Seed data
INSERT INTO customers VALUES
  (1, 'Alice Chen',   'alice@example.com',  '2024-01-15'),
  (2, 'Bob Patel',    'bob@example.com',    '2024-02-20'),
  (3, 'Carol Kim',    'carol@example.com',  '2024-03-05');

INSERT INTO products VALUES
  (1, 'Mechanical Keyboard', 89.99,  'Peripherals'),
  (2, 'Wireless Mouse',      34.99,  'Peripherals'),
  (3, 'Monitor 27"',        249.00,  'Displays'),
  (4, 'USB-C Hub',           49.99,  'Accessories');

INSERT INTO orders VALUES
  (1, 1, 1, 1, '2024-04-01'),
  (2, 1, 2, 1, '2024-04-01'),
  (3, 2, 3, 1, '2024-04-15'),
  (4, 3, 4, 2, '2024-05-01'),
  (5, 2, 2, 1, '2024-05-10');`,
            },
            {
              id: "q1",
              label: "Look at the customers table",
              sql: `SELECT * FROM customers;`,
            },
            {
              id: "q2",
              label:
                "Look at the orders table — notice customer_id, not the name",
              sql: `SELECT * FROM orders;`,
            },
            {
              id: "q3",
              label: "Inspect the schema itself",
              sql: `-- sqlite_master is SQLite's system table — it describes your own database
SELECT type, name, sql
FROM sqlite_master
WHERE type = 'table'
ORDER BY name;`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Relation = a table.** Each relation has a **schema** (column names and data types) and an **instance** (the current set of rows). The schema is fixed by CREATE TABLE; the instance changes as rows are inserted, updated, or deleted.",
      "**Primary key** uniquely identifies a row. SQLite enforces that no two rows share the same PK value. `INTEGER PRIMARY KEY` is also an alias for SQLite's internal `rowid`. **Foreign key** — a column whose value must exist as a PK in another table, enforcing **referential integrity**: you cannot create an order for a customer that doesn't exist.",
      "**Normalization** removes redundancy by splitting data into focused tables. **NULL** is the absence of a value — not zero, not empty string — truly unknown or missing.",
      "**SQL sublanguages:** DDL (CREATE, ALTER, DROP) defines structure. DML (INSERT, UPDATE, DELETE) manipulates data. DQL (SELECT) queries data. TCL (BEGIN, COMMIT, ROLLBACK) manages transactions.",
    ],
  },

  examples: [
    {
      title: "Update anomaly — why normalization wins",
      body: `If Alice's email is stored in every order row, changing it requires updating every order.
In the normalized schema, change it once in \`customers\` and every query sees the new value instantly.`,
    },
    {
      title: "The three anomalies (Codd's motivation)",
      body: `**Insertion anomaly**: can't add a product until it has been ordered (if product data lives only in orders).
**Update anomaly**: changing a fact requires updating multiple rows.
**Deletion anomaly**: deleting the last order for a customer erases the customer's data entirely.
Normalization eliminates all three.`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-001-q1",
        type: "choice",
        text: "What is a primary key?",
        options: [
          "A column that stores the table name",
          "A column (or set of columns) that uniquely identifies each row",
          "A foreign reference to another table",
          "Any NOT NULL column",
        ],
        answer:
          "A column (or set of columns) that uniquely identifies each row",
      },
      {
        id: "sql0-001-q2",
        type: "choice",
        text: "Why does storing a customer's email in every order row cause problems?",
        options: [
          "It wastes disk space only",
          "SQL can't query duplicated columns",
          "Updating the email requires finding and changing every order row (update anomaly)",
          "It prevents using foreign keys",
        ],
        answer:
          "Updating the email requires finding and changing every order row (update anomaly)",
      },
      {
        id: "sql0-001-q3",
        type: "choice",
        text: "What does a foreign key enforce?",
        options: [
          "The column must be unique",
          "The column cannot be NULL",
          "The referenced row must actually exist in the target table",
          "The column must be indexed",
        ],
        answer: "The referenced row must actually exist in the target table",
      },
    ],
  },

  mentalModel: [
    "A relational database stores every fact exactly once — no duplication, no update anomalies",
    "Tables are linked through IDs (foreign keys), not by copying data across rows",
    "The primary key uniquely identifies each row; the foreign key is the reference that joins tables",
    "Normalization = split data into focused tables so each fact has one home",
  ],
};

export default lesson;
