const lesson = {
  id: "sql-0-027",
  slug: "views",
  chapter: "sql-0",
  order: 27,
  title: "Views",
  subtitle: "Saved queries you can use like tables",
  tags: ["sql", "views", "create view", "virtual table", "reusable query"],
  aliases: [
    "sql views",
    "create view sql",
    "virtual table sql",
    "view vs table sql",
  ],

  hook: `You've written a complex JOIN query with five tables and three conditions.
Now you need it in six different places.
Copy-paste is a trap — when the logic changes, you'll have to update all six copies.
A view is a named, saved query. Use it like a table, update the definition once, and every usage reflects the change.`,

  mentalModel: [
    "A view is a named SELECT statement stored in the database.",
    "You query a view just like a table: SELECT * FROM my_view WHERE ...",
    "Views don't store data — they re-run the underlying query each time (unless materialized).",
    "Views simplify complex queries, provide a security layer, and create stable interfaces.",
  ],

  intuition: {
    prose: [
      "**A view is a stored query with a name.** `CREATE VIEW active_users AS SELECT * FROM users WHERE status = 'active'` stores that query as `active_users`. From now on, `SELECT * FROM active_users` is equivalent to writing the full query — but shorter, reusable, and centrally maintained.",
      "**Views don't store data.** When you query a view, the database runs the underlying SELECT at that moment. Views are sometimes called 'virtual tables' — they look like tables but contain no persistent data. The data still lives in the base tables.",
      "**Simplify complex queries.** A view can encapsulate a five-table JOIN that's used in many places. Instead of every developer re-writing (and potentially getting wrong) that JOIN, they query the view. The complexity is hidden. If a column name changes in a base table, you update the view definition once.",
      "**Create security boundaries.** You can grant users access to a view without giving them access to the underlying tables. `CREATE VIEW public_employees AS SELECT name, department FROM employees` — users can query names and departments but can't see salaries or SSNs.",
      "**Drop and recreate to modify.** There's no `ALTER VIEW`. To change a view's definition, use `DROP VIEW view_name` and then `CREATE VIEW` again. Some databases support `CREATE OR REPLACE VIEW` (SQLite doesn't, but you can `DROP VIEW IF EXISTS` first).",
    ],
    callouts: [
      {
        type: "definition",
        title: "View syntax",
        body: "```sql\nCREATE VIEW view_name AS\n  SELECT col1, col2, ...\n  FROM table1\n  JOIN table2 ON ...\n  WHERE ...;\n\n-- Drop:\nDROP VIEW view_name;\nDROP VIEW IF EXISTS view_name;\n\n-- Use like a table:\nSELECT * FROM view_name WHERE col1 = 'value';\n```",
      },
      {
        type: "insight",
        title: "SQLite doesn't support updatable views or CREATE OR REPLACE",
        body: "In PostgreSQL and MySQL, some views are updatable (you can INSERT/UPDATE through them). SQLite views are read-only. Also, SQLite doesn't have `CREATE OR REPLACE VIEW` — drop and recreate instead. Temp views (`CREATE TEMP VIEW`) exist only for the current session.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "E-commerce base tables",
              setup: true,
              sql: `CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT, tier TEXT DEFAULT 'standard'
);
CREATE TABLE products (
  product_id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT, price REAL NOT NULL
);
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(customer_id),
  order_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
);
CREATE TABLE order_items (
  item_id INTEGER PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id),
  product_id INTEGER REFERENCES products(product_id),
  qty INTEGER NOT NULL,
  unit_price REAL NOT NULL
);

INSERT INTO customers VALUES
  (1,'Alice Chen','Seattle','premium'),
  (2,'Bob Patel','New York','standard'),
  (3,'Carol Kim','Chicago','premium'),
  (4,'Dave Nguyen','Seattle','standard');

INSERT INTO products VALUES
  (1,'Laptop Pro','Electronics',1299),
  (2,'Wireless Mouse','Peripherals',34.99),
  (3,'Monitor 27"','Displays',249),
  (4,'USB Hub','Peripherals',24.99);

INSERT INTO orders VALUES
  (1,1,'2024-01-05','shipped'),
  (2,1,'2024-02-01','pending'),
  (3,2,'2024-01-15','shipped'),
  (4,3,'2024-02-10','shipped'),
  (5,4,'2024-02-20','pending');

INSERT INTO order_items VALUES
  (1,1,1,1,1299),(2,1,2,1,34.99),
  (3,2,3,1,249),
  (4,3,2,2,34.99),
  (5,4,1,1,1299),(6,4,4,2,24.99),
  (7,5,2,1,34.99);`,
            },
            {
              id: "q1",
              label: "Create a view: order summary",
              sql: `-- Instead of writing this JOIN every time:
CREATE VIEW order_summary AS
SELECT
  o.order_id,
  c.name                          AS customer_name,
  c.tier                          AS customer_tier,
  o.order_date,
  o.status,
  COUNT(oi.item_id)               AS item_count,
  ROUND(SUM(oi.qty * oi.unit_price), 2) AS total
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id, c.name, c.tier, o.order_date, o.status;

-- Now just query the view:
SELECT * FROM order_summary ORDER BY order_date;`,
            },
            {
              id: "q2",
              label: "Filter and sort the view like a table",
              sql: `-- The view behaves exactly like a table for SELECT
SELECT customer_name, total
FROM order_summary
WHERE status = 'shipped'
ORDER BY total DESC;`,
            },
            {
              id: "q3",
              label: "Create a security view: hide prices",
              sql: `-- A view for external reporting that hides internal pricing
CREATE VIEW public_catalog AS
SELECT
  product_id,
  name,
  category
  -- price column is intentionally excluded
FROM products
WHERE category != 'Internal';  -- also filters internal products

SELECT * FROM public_catalog;`,
            },
            {
              id: "q4",
              label: "List all views in the database",
              sql: `SELECT name, sql
FROM sqlite_master
WHERE type = 'view'
ORDER BY name;`,
            },
            {
              id: "q5",
              label: "Drop and recreate to modify a view",
              sql: `-- There's no ALTER VIEW in SQLite
-- Drop + recreate pattern:
DROP VIEW IF EXISTS public_catalog;

CREATE VIEW public_catalog AS
SELECT
  product_id,
  name,
  category,
  CASE
    WHEN price > 100 THEN 'Premium'
    ELSE 'Budget'
  END AS price_tier
FROM products;

SELECT * FROM public_catalog;`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Views are not performance optimizations.** A view is just a stored query — each time you query it, the database executes the full underlying query. There's no automatic caching. If the underlying query is slow, querying the view is equally slow. For performance, use indexed columns in the base tables.",
      "**Materialized views store query results.** PostgreSQL supports `CREATE MATERIALIZED VIEW` — the results are computed once and stored, like a cached table. You manually refresh them with `REFRESH MATERIALIZED VIEW`. SQLite doesn't support this, but you can approximate it with a real table populated by `INSERT INTO ... SELECT ...`.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Avoid SELECT * in view definitions",
        body: "If you use `SELECT * FROM table` in a view definition and later add a column to that table, the view won't automatically include the new column (SQLite caches the column names at view creation time). Always list columns explicitly in view definitions.",
      },
    ],
  },

  examples: [
    {
      title: "Temporary view (session-scoped)",
      body: `-- A TEMP view disappears when the connection closes
-- Useful for intermediate results in a long analytical session
CREATE TEMP VIEW high_value_orders AS
SELECT * FROM order_summary WHERE total > 500;

SELECT * FROM high_value_orders;`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-027-q1",
        type: "choice",
        text: "Does a view store data?",
        options: [
          "Yes, it stores a snapshot of the query results",
          "No, it re-runs the underlying query each time it is queried",
          "Yes, but only for the current session",
          "No, it stores only the column names",
        ],
        answer: "No, it re-runs the underlying query each time it is queried",
      },
      {
        id: "sql0-027-q2",
        type: "choice",
        text: "How do you modify a view in SQLite?",
        options: [
          "ALTER VIEW view_name AS SELECT ...",
          "UPDATE VIEW view_name SET ...",
          "DROP VIEW IF EXISTS view_name; then CREATE VIEW view_name AS ...",
          "MODIFY VIEW view_name AS SELECT ...",
        ],
        answer:
          "DROP VIEW IF EXISTS view_name; then CREATE VIEW view_name AS ...",
      },
      {
        id: "sql0-027-q3",
        type: "choice",
        text: "What is a security use case for views?",
        options: [
          "Encrypting data at rest in the database",
          "Granting users access to specific columns while hiding others in the base table",
          "Preventing users from running slow queries",
          "Automatically indexing frequently accessed columns",
        ],
        answer:
          "Granting users access to specific columns while hiding others in the base table",
      },
    ],
  },
};

export default lesson;
