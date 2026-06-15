const lesson = {
  id: "sql-0-009",
  slug: "create-table",
  chapter: "sql-0",
  order: 4,
  title: "CREATE TABLE",
  subtitle: "Define a table's structure before you put any data in it",
  tags: ["sql", "create table", "ddl", "schema", "primary key", "not null"],
  aliases: [
    "create table sql",
    "define table",
    "ddl sql",
    "table structure",
    "schema definition",
  ],

  hook: `Before a database can store a single row, you have to tell it what shape that row has.
What columns exist? What type does each column hold? Which column uniquely identifies a row?
CREATE TABLE is the blueprint. Every table starts with one.`,

  mentalModel: [
    "CREATE TABLE defines the structure (schema) of a table. No data is stored yet — just the blueprint.",
    "Each column gets a name, a type, and optional constraints like NOT NULL or UNIQUE.",
    "PRIMARY KEY is the column (or columns) that uniquely identifies each row. Every table should have one.",
    "DROP TABLE deletes the table and all its data permanently. ALTER TABLE modifies an existing table's structure.",
  ],

  intuition: {
    prose: [
      "**A table definition is a contract.** When you write `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE)`, you are making a contract: every row in `customers` will have these three columns, the id will be unique, name will never be empty, and no two rows will share an email. The database enforces this contract on every INSERT and UPDATE.",
      "**Column definitions follow the pattern: name → type → constraints.** The name is what you'll call the column in queries (`customers.name`, `ORDER BY price`). The type says what kind of data it holds. The constraints add rules: `NOT NULL` forbids empty values, `UNIQUE` forbids duplicates, `DEFAULT value` provides a fallback when you don't supply one.",
      "**PRIMARY KEY is the row's unique identifier.** Every table needs a way to unambiguously refer to one specific row. The primary key column (usually called `id` or `customer_id`) guarantees that no two rows are identical in that column. In SQLite, `INTEGER PRIMARY KEY` auto-assigns the next available integer when you insert without providing one.",
      "**DROP TABLE permanently deletes a table.** `DROP TABLE IF EXISTS products` removes the table and every row in it. There is no undo. In development you'll use this often (reset your schema, start fresh). In production, be very careful.",
      "**Think before you create.** A good schema is one where you don't have to change it later. Before running CREATE TABLE, ask: What is one row? What properties does it have? Which property uniquely identifies it? Does any property belong in a different table?",
    ],
    callouts: [
      {
        type: "definition",
        title: "DDL — Data Definition Language",
        body: "SQL is divided into sublanguages by purpose:\n**DDL (Data Definition Language):** defines structure — CREATE TABLE, DROP TABLE, ALTER TABLE\n**DML (Data Manipulation Language):** changes data — INSERT, UPDATE, DELETE\n**DQL (Data Query Language):** reads data — SELECT\n**TCL (Transaction Control Language):** manages transactions — BEGIN, COMMIT, ROLLBACK",
      },
      {
        type: "insight",
        title: "Name columns clearly",
        body: "Good column names are specific and self-explanatory. Prefer `customer_id` over `id` (unambiguous when you join tables), `order_date` over `date` (avoids collision with the SQL keyword DATE), `is_active` over `active` (signals boolean intent). Lowercase with underscores is the universal SQL convention.",
      },
      {
        type: "warning",
        title: "ALTER TABLE is limited in SQLite",
        body: "SQLite's ALTER TABLE only supports adding a column or renaming a table/column. You cannot drop a column or change a column's type. In PostgreSQL and MySQL, ALTER TABLE is more powerful. For SQLite schema changes, the workaround is: create a new table, copy data, drop old table, rename new table.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Nothing to set up — we'll CREATE as we go",
              setup: true,
              sql: `-- This lesson creates tables interactively.
-- Run cells top to bottom.
SELECT 'Ready' AS status;`,
            },
            {
              id: "q1",
              label: "Create a simple table: books",
              sql: `CREATE TABLE books (
  book_id       INTEGER PRIMARY KEY,
  title         TEXT    NOT NULL,
  author        TEXT    NOT NULL,
  published_year INTEGER NOT NULL,
  pages         INTEGER,            -- optional: some books don't have a page count
  price         REAL    NOT NULL DEFAULT 0.00,
  in_stock      INTEGER NOT NULL DEFAULT 1  -- 1 = yes, 0 = no
);

-- Confirm it was created
SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name = 'books';`,
            },
            {
              id: "q2",
              label: "Insert some rows to test it",
              sql: `INSERT INTO books (title, author, published_year, pages, price) VALUES
  ('The Pragmatic Programmer', 'Hunt & Thomas', 1999, 352, 49.99),
  ('Clean Code',               'Robert Martin',  2008, 464, 39.99),
  ('Designing Data-Intensive Applications', 'Martin Kleppmann', 2017, 616, 59.99),
  ('SQL Antipatterns',         'Bill Karwin',    2010, 352, 44.99),
  ('The Algorithm Design Manual', 'Skiena',      2020, NULL, 79.99);  -- pages unknown

SELECT * FROM books;`,
            },
            {
              id: "q3",
              label: "Inspect the schema with sqlite_master",
              sql: `-- sqlite_master stores metadata about your database
SELECT type, name, sql
FROM sqlite_master
WHERE type IN ('table', 'index')
ORDER BY type, name;`,
            },
            {
              id: "q4",
              label: "Constraints in action — try violating NOT NULL",
              sql: `-- This WILL fail: title is NOT NULL
INSERT INTO books (title, author, published_year, price)
VALUES (NULL, 'Anonymous', 2024, 9.99);`,
            },
            {
              id: "q5",
              label: "DROP TABLE — clean up",
              sql: `-- DROP TABLE removes the table and ALL data. No undo.
DROP TABLE IF EXISTS books;

-- Verify it's gone
SELECT name FROM sqlite_master WHERE type = 'table';`,
            },
            {
              id: "q6",
              label: "Your turn: create a movies table",
              sql: `-- Create a table called 'movies' with these columns:
--   movie_id   INTEGER, primary key, auto-assigned
--   title      TEXT, required
--   director   TEXT, required
--   year       INTEGER, required
--   rating     REAL (e.g. 8.4), optional
--   runtime_min INTEGER (minutes), optional

-- Write your CREATE TABLE here:
`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Normalization starts at CREATE TABLE time.** The decision of which columns belong in which table is where normalization happens. A column belongs in a table if it describes the *subject* of that table. If a `customers` table has a column for the customer's city, that's fine — a customer has a city. But if it also has a column for the product name of their most recent order, that information belongs in `orders`, not `customers`.",
      "**Referential integrity is declared at CREATE TABLE time.** Foreign keys — columns that reference another table's primary key — are declared with `REFERENCES other_table(primary_key_column)`. Once declared, the database enforces that you can't insert an order for a customer who doesn't exist. In SQLite, foreign key enforcement must be enabled with `PRAGMA foreign_keys = ON`.",
      "**CHECK constraints let you add custom rules.** `CHECK(price >= 0)` ensures no row can have a negative price. `CHECK(rating BETWEEN 0 AND 10)` constrains valid ratings. CHECK is evaluated on every INSERT and UPDATE — if it fails, the operation is rejected.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Constraint summary",
        body: "**PRIMARY KEY:** Unique, NOT NULL identifier for each row.\n**NOT NULL:** Column must always have a value.\n**UNIQUE:** No two rows may share this value (but NULL is exempt in most databases).\n**DEFAULT value:** Used when INSERT doesn't provide this column.\n**CHECK(expr):** Row is rejected if expr evaluates to false.\n**REFERENCES table(col):** Foreign key — value must exist as a PK in the referenced table.",
      },
    ],
  },

  examples: [
    {
      title: "A well-designed table definition",
      body: `CREATE TABLE orders (
  order_id    INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
  order_date  TEXT    NOT NULL,
  total       REAL    NOT NULL CHECK(total >= 0),
  status      TEXT    NOT NULL DEFAULT 'pending'
                       CHECK(status IN ('pending', 'shipped', 'delivered', 'cancelled'))
);
Each column serves a clear purpose. Constraints prevent bad data at the definition level.`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-009-q1",
        type: "choice",
        text: "What does CREATE TABLE do?",
        options: [
          "Inserts the first row into a new table",
          "Defines the structure (columns, types, constraints) of a new table",
          "Creates a backup copy of an existing table",
          "Fills a table with data from another table",
        ],
        answer:
          "Defines the structure (columns, types, constraints) of a new table",
      },
      {
        id: "sql0-009-q2",
        type: "choice",
        text: "What does NOT NULL do when declared on a column?",
        options: [
          "Prevents the column from containing duplicate values",
          "Requires every row to have a non-NULL value for this column",
          "Makes the column the primary key",
          "Prevents the column from being updated after insertion",
        ],
        answer: "Requires every row to have a non-NULL value for this column",
      },
      {
        id: "sql0-009-q3",
        type: "choice",
        text: "What happens when you run DROP TABLE on a table with data?",
        options: [
          "The table structure is deleted but the data is saved as a backup",
          "The operation fails — you must empty the table first",
          "The table and all its data are permanently deleted",
          "The table is renamed with a _backup suffix",
        ],
        answer: "The table and all its data are permanently deleted",
      },
    ],
  },
};

export default lesson;
