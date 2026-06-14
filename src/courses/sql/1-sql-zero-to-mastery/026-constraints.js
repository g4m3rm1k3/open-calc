const lesson = {
  id: "sql-0-026",
  slug: "constraints",
  chapter: "sql-0",
  order: 24,
  title: "Constraints",
  subtitle: "Let the database enforce your data rules",
  tags: [
    "sql",
    "constraints",
    "unique",
    "check",
    "default",
    "not null",
    "foreign key",
    "data integrity",
  ],
  aliases: [
    "sql constraints",
    "unique constraint sql",
    "check constraint sql",
    "default sql",
    "not null constraint",
  ],

  hook: `Your application code validates input — but what if someone bypasses the API?
What if a bug inserts a negative price, or two records with the same email?
Database constraints enforce rules at the data layer itself.
No matter how data enters the database, the constraints hold.`,

  mentalModel: [
    "NOT NULL prevents missing values. UNIQUE prevents duplicates. DEFAULT provides fallback values.",
    "CHECK constraints enforce arbitrary conditions on values being inserted or updated.",
    "FOREIGN KEY constraints ensure referential integrity across related tables.",
    "Constraints are enforced at the database level, independent of application code.",
  ],

  intuition: {
    prose: [
      "**Constraints are rules enforced by the database engine.** They apply to every INSERT and UPDATE, regardless of where it comes from — application code, direct SQL, scripts, or migrations. This is defense in depth: even if your application has a bug, the database won't accept invalid data.",
      "**NOT NULL: required values.** Columns marked `NOT NULL` cannot hold NULL. This is the most basic constraint. Use it for any column where a missing value makes no business sense: a user must have an email, a product must have a price. `name TEXT NOT NULL`.",
      "**UNIQUE: no duplicate values.** `UNIQUE` ensures no two rows in the same column (or set of columns) have the same value. Perfect for email addresses, usernames, and SKUs. Unlike PRIMARY KEY, UNIQUE columns can hold NULL (each NULL is considered distinct from others). You can have multiple UNIQUE constraints on different columns.",
      "**DEFAULT: fallback values.** When an INSERT doesn't specify a column's value, the DEFAULT is used. `status TEXT NOT NULL DEFAULT 'pending'` — if status isn't provided at insert time, it becomes 'pending'. DEFAULT values are evaluated at insert time (except for special values like `CURRENT_TIMESTAMP`).",
      "**CHECK: custom validation rules.** `CHECK (price > 0)` ensures no negative or zero prices ever enter the database. `CHECK (status IN ('pending', 'active', 'closed'))` limits the column to a fixed set of values. CHECK constraints can reference multiple columns: `CHECK (end_date >= start_date)`.",
      "**FOREIGN KEY: referential integrity.** As covered in the relational design lesson, FOREIGN KEY ensures that every value in a FK column exists in the referenced table. In SQLite, this requires `PRAGMA foreign_keys = ON`. Violation raises an error: you can't insert an order for a non-existent customer.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Constraint placement",
        body: "**Column-level (inline):** `price REAL NOT NULL CHECK (price > 0) DEFAULT 0`  \n**Table-level (after columns):** `CONSTRAINT chk_dates CHECK (end_date >= start_date)`  \n\nTable-level constraints are required when the constraint references multiple columns. Both styles are equivalent for single-column constraints.",
      },
      {
        type: "warning",
        title: "SQLite CHECK constraints: some limitations",
        body: "SQLite validates CHECK constraints on INSERT and UPDATE but **not** by default when using `PRAGMA integrity_check`. Also, SQLite doesn't enforce FOREIGN KEYs by default (need `PRAGMA foreign_keys = ON`). CHECK expressions cannot call user-defined functions in standard SQLite.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Products table with all constraint types",
              setup: true,
              sql: `PRAGMA foreign_keys = ON;

CREATE TABLE categories (
  category_id INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL UNIQUE   -- can't have two categories with same name
);

CREATE TABLE products (
  product_id  INTEGER PRIMARY KEY,
  sku         TEXT    NOT NULL UNIQUE,          -- no duplicate SKUs
  name        TEXT    NOT NULL,
  category_id INTEGER NOT NULL
    REFERENCES categories(category_id),         -- FK constraint
  price       REAL    NOT NULL
    CHECK (price > 0),                          -- must be positive
  stock       INTEGER NOT NULL DEFAULT 0        -- defaults to 0
    CHECK (stock >= 0),                         -- can't have negative stock
  status      TEXT    NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','discontinued','out_of_stock')),
  created_at  TEXT    NOT NULL DEFAULT (date('now')),
  CONSTRAINT chk_sku_format CHECK (LENGTH(sku) >= 4)  -- table-level check
);

INSERT INTO categories VALUES (1, 'Electronics'), (2, 'Peripherals');
INSERT INTO products (product_id, sku, name, category_id, price, stock)
VALUES
  (1, 'ELEC001', 'Laptop Pro',     1, 1299.00, 5),
  (2, 'PERI001', 'Wireless Mouse', 2,   34.99, 20);

SELECT * FROM products;`,
            },
            {
              id: "q1",
              label: "NOT NULL violation",
              sql: `-- Try to insert without a required name
INSERT INTO products (product_id, sku, category_id, price) VALUES (3, 'PERI002', 2, 19.99);
-- Error: NOT NULL constraint failed: products.name`,
            },
            {
              id: "q2",
              label: "UNIQUE violation",
              sql: `-- Try to insert a duplicate SKU
INSERT INTO products (product_id, sku, name, category_id, price)
VALUES (4, 'ELEC001', 'Another Laptop', 1, 999.00);
-- Error: UNIQUE constraint failed: products.sku`,
            },
            {
              id: "q3",
              label: "CHECK constraint violation",
              sql: `-- Try to insert a negative price
INSERT INTO products (product_id, sku, name, category_id, price)
VALUES (5, 'ELEC002', 'Budget Laptop', 1, -50.00);
-- Error: CHECK constraint failed: price > 0`,
            },
            {
              id: "q4",
              label: "DEFAULT in action",
              sql: `-- Insert without specifying stock, status, or created_at
INSERT INTO products (product_id, sku, name, category_id, price)
VALUES (6, 'PERI002', 'USB Hub', 2, 24.99);

-- Verify defaults were applied
SELECT product_id, sku, stock, status, created_at FROM products WHERE product_id = 6;`,
            },
            {
              id: "q5",
              label: "Valid status values only",
              sql: `-- Update with an invalid status
UPDATE products SET status = 'retired' WHERE product_id = 1;
-- Error: CHECK constraint failed: status IN (...)

-- Valid update works fine
UPDATE products SET status = 'discontinued' WHERE product_id = 1;
SELECT product_id, sku, status FROM products;`,
            },
            {
              id: "q6",
              label: "Add constraints to existing table",
              sql: `-- You can't add CHECK or NOT NULL constraints to existing SQLite tables
-- via ALTER TABLE (SQLite limitation).
-- The standard approach: create new table, copy data, rename.
-- Or plan constraints ahead at CREATE TABLE time.

-- However, you CAN add a UNIQUE index (which acts like a UNIQUE constraint):
CREATE UNIQUE INDEX idx_products_name ON products (name);

-- Now duplicate names are blocked:
INSERT INTO products (product_id, sku, name, category_id, price)
VALUES (7, 'ELEC003', 'Laptop Pro', 1, 899.00);
-- Error: UNIQUE constraint failed (name already exists)`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Constraint names enable specific error handling.** Naming constraints with `CONSTRAINT constraint_name` lets you identify which constraint failed from the error message. Without names, you get generic messages. In application code, you can parse the constraint name to return a user-friendly error: 'That email address is already registered.'",
      "**Deferred constraints in transactions.** Normally constraints are checked immediately (IMMEDIATE). You can declare constraints as DEFERRED, which means they're checked at transaction COMMIT time instead of at each statement. This allows temporarily violating a constraint mid-transaction (e.g., swapping two unique values) as long as the final state is valid.",
    ],
    callouts: [
      {
        type: "insight",
        title: "Constraints vs. application validation",
        body: "Always validate in your application code for user experience (show friendly errors before hitting the database). But ALSO enforce constraints at the database level for data integrity. The database is the single source of truth — it may be written to by multiple applications, scripts, or direct SQL. Application code can be bypassed; database constraints cannot.",
      },
    ],
  },

  examples: [
    {
      title: "Multi-column UNIQUE constraint",
      body: `-- A student can enroll in a course only once
CREATE TABLE enrollments (
  student_id INTEGER,
  course_id  INTEGER,
  enrolled_on TEXT NOT NULL DEFAULT (date('now')),
  PRIMARY KEY (student_id, course_id),  -- composite PK is also a UNIQUE constraint
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Or use a separate UNIQUE constraint:
-- UNIQUE (student_id, course_id)`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-026-q1",
        type: "choice",
        text: "What is the key advantage of database constraints over application-level validation?",
        options: [
          "Database constraints are faster to evaluate",
          "Database constraints enforce rules regardless of how data enters the database",
          "Application-level validation only works with web forms",
          "Database constraints are easier to update than application code",
        ],
        answer:
          "Database constraints enforce rules regardless of how data enters the database",
      },
      {
        id: "sql0-026-q2",
        type: "choice",
        text: "What happens when you insert a row without specifying a column that has a DEFAULT value?",
        options: [
          "An error is raised",
          "NULL is stored in the column",
          "The DEFAULT value is used for that column",
          "The row is rejected unless all columns are specified",
        ],
        answer: "The DEFAULT value is used for that column",
      },
      {
        id: "sql0-026-q3",
        type: "choice",
        text: "A CHECK constraint CHECK (status IN ('open', 'closed')) rejects which value?",
        options: ["'open'", "'closed'", "'pending'", "NULL"],
        answer: "'pending'",
      },
    ],
  },
};

export default lesson;
