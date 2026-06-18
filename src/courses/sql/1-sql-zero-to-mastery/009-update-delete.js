const lesson = {
  id: "sql-0-013",
  slug: "update-delete",
  chapter: "sql-0",
  order: 9,
  title: "UPDATE and DELETE",
  subtitle: "Changing and removing rows — carefully",
  tags: ["sql", "update", "delete", "dml", "modify data", "where"],
  aliases: [
    "update sql",
    "delete sql",
    "modify rows",
    "remove rows",
    "update where",
  ],

  hook: `Databases are not write-once. Prices change. Addresses change. Orders get cancelled.
UPDATE changes the values in existing rows.
DELETE removes rows entirely.
Both are powerful — and both can destroy a lot of data instantly if you forget the WHERE clause.`,

  mentalModel: [
    "UPDATE changes column values in existing rows. Always include WHERE unless you intentionally want to update every row.",
    "DELETE removes entire rows. Always include WHERE unless you intentionally want to delete every row.",
    "Test your WHERE condition with a SELECT before running UPDATE or DELETE — see what rows would be affected.",
    "TRUNCATE TABLE (not in SQLite) or DELETE without WHERE empties a table. DROP TABLE removes the table itself.",
  ],

  intuition: {
    prose: [
      "**UPDATE changes values in existing rows.** The syntax is: `UPDATE tablename SET column = value WHERE condition`. The SET clause names the column and its new value. The WHERE clause selects which rows to change. Without WHERE, every row in the table is updated.",
      "**You can update multiple columns at once.** `UPDATE orders SET status = 'shipped', shipped_date = '2024-05-15' WHERE order_id = 42` sets both columns in one statement. This is atomic — either both change or neither does.",
      "**The new value can reference the old one.** `UPDATE products SET stock = stock - 1 WHERE product_id = 7` decrements the stock by 1. `UPDATE accounts SET balance = balance + 500 WHERE customer_id = 3` adds 500 to whatever balance is currently there.",
      "**DELETE removes entire rows.** `DELETE FROM orders WHERE status = 'cancelled' AND order_date < '2023-01-01'` removes all old cancelled orders. There is no 'delete column' — that's ALTER TABLE DROP COLUMN. DELETE removes entire rows.",
      "**The golden rule: SELECT first, then DELETE/UPDATE.** Before you run a destructive statement, run `SELECT * FROM table WHERE your_condition` to verify it selects exactly the rows you intend to modify. This one habit prevents most data disasters.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Forgetting WHERE is catastrophic",
        body: "`UPDATE employees SET salary = 0` — sets every employee's salary to zero.\n`DELETE FROM orders` — deletes every order in the table.\nBoth execute instantly and silently. Without a transaction, there is no undo. Always double-check your WHERE clause.",
      },
      {
        type: "insight",
        title: "Soft delete pattern",
        body: "Many production systems never actually DELETE rows. Instead, they add a column `is_deleted INTEGER DEFAULT 0` and UPDATE it to 1. This preserves history, makes accidental deletion recoverable, and supports audit trails. Queries then add `WHERE is_deleted = 0` to exclude deleted rows.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Inventory and orders dataset",
              setup: true,
              sql: `CREATE TABLE inventory (
  product_id  INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  price       REAL    NOT NULL,
  stock       INTEGER NOT NULL DEFAULT 0,
  status      TEXT    NOT NULL DEFAULT 'active'  -- 'active' or 'discontinued'
);

CREATE TABLE orders (
  order_id    INTEGER PRIMARY KEY,
  customer    TEXT    NOT NULL,
  product_id  INTEGER REFERENCES inventory(product_id),
  quantity    INTEGER NOT NULL,
  total       REAL    NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'pending'
);

INSERT INTO inventory VALUES
  (1, 'Laptop Pro',     1299.00, 50, 'active'),
  (2, 'Wireless Mouse',   34.99, 200, 'active'),
  (3, 'Old Monitor',     149.00,   0, 'active'),
  (4, 'USB Hub',          49.99, 100, 'active'),
  (5, 'Legacy Keyboard',  29.99,  15, 'active');

INSERT INTO orders VALUES
  (1, 'Alice',  1, 1, 1299.00, 'pending'),
  (2, 'Bob',    2, 2,   69.98, 'pending'),
  (3, 'Carol',  4, 1,   49.99, 'pending'),
  (4, 'Dave',   3, 1,  149.00, 'cancelled'),
  (5, 'Eve',    5, 1,   29.99, 'shipped'),
  (6, 'Alice',  2, 5,  174.95, 'shipped');`,
            },
            {
              id: "q1",
              label: "SELECT first — verify before you modify",
              sql: `-- Always check what rows will be affected before running UPDATE/DELETE
-- Which products have 0 stock?
SELECT product_id, name, stock
FROM inventory
WHERE stock = 0;`,
            },
            {
              id: "q2",
              label: "UPDATE: change one value",
              sql: `-- Restock the Old Monitor
UPDATE inventory
SET stock = 25
WHERE product_id = 3;

SELECT name, stock FROM inventory WHERE product_id = 3;`,
            },
            {
              id: "q3",
              label: "UPDATE: change multiple columns at once",
              sql: `-- Apply a 10% price increase to all active products
UPDATE inventory
SET price = ROUND(price * 1.10, 2)
WHERE status = 'active';

SELECT name, price FROM inventory ORDER BY price;`,
            },
            {
              id: "q4",
              label: "UPDATE: use current value in calculation",
              sql: `-- Decrement stock when an order ships
-- Order 3 (USB Hub, quantity 1) is being shipped
UPDATE inventory
SET stock = stock - 1
WHERE product_id = 4;

UPDATE orders
SET status = 'shipped'
WHERE order_id = 3;

SELECT name, stock FROM inventory WHERE product_id = 4;
SELECT order_id, status FROM orders WHERE order_id = 3;`,
            },
            {
              id: "q5",
              label: "DELETE: remove specific rows",
              sql: `-- Delete the old cancelled order
DELETE FROM orders
WHERE status = 'cancelled';

SELECT * FROM orders;`,
            },
            {
              id: "q6",
              label: "Soft delete: mark as discontinued instead of deleting",
              sql: `-- Discontinue the Legacy Keyboard (don't delete — preserve the record)
UPDATE inventory
SET status = 'discontinued'
WHERE product_id = 5;

-- Queries can filter out discontinued items
SELECT name, price, stock
FROM inventory
WHERE status = 'active';`,
            },
            {
              id: "q7",
              label: "DELETE without WHERE — dangerous demo",
              sql: `-- Create a temp table to demonstrate (safe to delete)
CREATE TABLE temp_demo AS SELECT * FROM orders WHERE status = 'shipped';

SELECT 'Before: ' || COUNT(*) || ' rows' AS info FROM temp_demo;

DELETE FROM temp_demo;  -- deletes ALL rows

SELECT 'After: ' || COUNT(*) || ' rows' AS info FROM temp_demo;`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**UPDATE and DELETE return a count of affected rows.** In most database clients you'll see 'N rows affected' after running these statements. SQLite's `changes()` function returns the count for the most recent statement. This is useful in application code to verify the expected number of rows changed.",
      "**Cascading deletes.** When foreign keys are defined with `ON DELETE CASCADE`, deleting a parent row automatically deletes all child rows that reference it. `ON DELETE SET NULL` sets the foreign key column to NULL instead. Without these options, deleting a parent row that has children raises a foreign key violation error.",
      "**RETURNING clause.** Like INSERT, UPDATE and DELETE support `RETURNING col1, col2` to get back the affected rows' values after the operation. `UPDATE orders SET status = 'shipped' WHERE order_id = 5 RETURNING order_id, status` confirms what was changed.",
    ],
    callouts: [
      {
        type: "definition",
        title: "UPDATE vs. DELETE vs. TRUNCATE vs. DROP",
        body: "**UPDATE:** Change values in existing rows. Rows remain.\n**DELETE FROM t WHERE ...:*** Remove specific rows. Other rows remain.\n**DELETE FROM t (no WHERE):** Remove all rows. Table structure remains.\n**TRUNCATE TABLE t:** Faster than DELETE for emptying a table (not available in SQLite).\n**DROP TABLE t:** Remove the table definition and all data permanently.",
      },
    ],
  },

  examples: [
    {
      title: "Safe UPDATE pattern: wrap in a transaction",
      body: `BEGIN;
UPDATE employees
SET salary = salary * 1.05  -- 5% raise
WHERE department = 'Engineering'
  AND hire_date < '2022-01-01';
-- Check what changed
SELECT name, salary FROM employees WHERE department = 'Engineering';
-- If it looks right:
COMMIT;
-- If something's wrong:
-- ROLLBACK;`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-013-q1",
        type: "choice",
        text: "What happens if you run UPDATE employees SET salary = 0 without a WHERE clause?",
        options: [
          "Only the first employee's salary is set to 0",
          "An error is raised — UPDATE requires WHERE",
          "Every employee's salary is set to 0",
          "The statement is ignored if no rows match",
        ],
        answer: "Every employee's salary is set to 0",
      },
      {
        id: "sql0-013-q2",
        type: "choice",
        text: "What is the 'soft delete' pattern?",
        options: [
          "Using DELETE with a WHERE clause to be careful",
          "Backing up rows before deleting them",
          "Marking rows as deleted (e.g., is_deleted = 1) instead of removing them",
          "Deleting rows one at a time with LIMIT 1",
        ],
        answer:
          "Marking rows as deleted (e.g., is_deleted = 1) instead of removing them",
      },
      {
        id: "sql0-013-q3",
        type: "choice",
        text: "What is the best practice before running a DELETE?",
        options: [
          "Always run DROP TABLE first to be sure",
          "Run SELECT with the same WHERE clause first to verify which rows will be affected",
          "Add LIMIT 1 to delete only one row at a time",
          "Back up the database using EXPORT",
        ],
        answer:
          "Run SELECT with the same WHERE clause first to verify which rows will be affected",
      },
    ],
  },
};

export default lesson;
