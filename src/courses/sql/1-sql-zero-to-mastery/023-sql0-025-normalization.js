const lesson = {
  id: "sql-0-025",
  slug: "normalization",
  chapter: "sql-0",
  order: 23,
  title: "Normalization",
  subtitle: "Design databases that don't lie, duplicate, or break",
  tags: [
    "sql",
    "normalization",
    "1nf",
    "2nf",
    "3nf",
    "database design",
    "anomalies",
    "redundancy",
  ],
  aliases: [
    "database normalization",
    "1nf 2nf 3nf",
    "first normal form sql",
    "database design principles",
    "update anomaly sql",
  ],

  hook: `Imagine a spreadsheet where every row contains the customer name, their address,
the order details, AND the product details all in one row. Now that customer moves.
You must update 47 rows. Miss one and your data is inconsistent.
Normalization is the discipline of organizing data to eliminate this redundancy.`,

  mentalModel: [
    "First Normal Form (1NF): each cell holds one atomic value; no repeating groups.",
    "Second Normal Form (2NF): no partial dependencies on composite keys — each non-key column depends on the WHOLE key.",
    "Third Normal Form (3NF): no transitive dependencies — non-key columns depend only on the key, not on other non-key columns.",
    "Normalization trades some query complexity (more JOINs) for update simplicity and data integrity.",
  ],

  intuition: {
    prose: [
      "**Data redundancy causes anomalies.** When the same fact appears in multiple places, three types of problems emerge: update anomalies (change one copy, miss another → inconsistent data), insert anomalies (can't add a fact without inventing a related record), and delete anomalies (deleting a row unintentionally destroys unrelated facts).",
      "**1NF: one value per cell, no repeating groups.** A cell that contains 'Apple, Banana, Cherry' (a list) violates 1NF. Every cell must hold one atomic value. No columns like `phone1`, `phone2`, `phone3` — that's a repeating group. The fix: a separate table with one row per phone number.",
      "**2NF: eliminate partial dependencies.** Only applies when you have a composite primary key (two or more columns make the PK). If `order_id + product_id` is the PK, and `product_name` depends only on `product_id` (not on the combination), that's a partial dependency. Fix: move `product_name` to a separate `products` table keyed by `product_id`.",
      "**3NF: eliminate transitive dependencies.** If `employee_id → dept_id → dept_name`, then `dept_name` is transitively dependent on `employee_id` through `dept_id`. A non-key column (dept_name) is determined by another non-key column (dept_id). Fix: extract departments into their own table. Now `dept_name` lives once and is looked up by `dept_id`.",
      "**Normalization is a spectrum, not an absolute rule.** Normalization reduces redundancy and prevents anomalies. De-normalization (intentionally keeping redundant data) can improve read performance for reporting workloads. Real systems often use a normalized write model (OLTP) and a de-normalized read model (OLAP/data warehouse). Understand the tradeoffs before choosing.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Three normal forms",
        body: "**1NF:** Atomic values, no repeating groups, has a primary key.\n**2NF:** Meets 1NF + no partial dependencies (non-key columns depend on the full composite PK).\n**3NF:** Meets 2NF + no transitive dependencies (non-key columns depend only on the key).\n\nA helpful mnemonic: a table is in 3NF when every non-key attribute depends 'on the key, the whole key, and nothing but the key.'",
      },
      {
        type: "insight",
        title: "When to de-normalize",
        body: "Reporting databases (data warehouses) often use star schema — fact tables connected to flat dimension tables — which intentionally duplicates some data to avoid expensive JOINs at query time. Normalization is for write-heavy OLTP systems. De-normalization is for read-heavy OLAP systems. Most applications have both.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Denormalized orders table (bad design)",
              setup: true,
              sql: `-- BAD DESIGN: all data in one flat table
-- Customer info repeated on every order
-- Product info repeated on every order line
CREATE TABLE orders_denormalized (
  order_id     INTEGER,
  customer_id  INTEGER,
  customer_name TEXT,       -- REDUNDANT: duplicated per order
  customer_city TEXT,       -- REDUNDANT
  product_id   INTEGER,
  product_name TEXT,        -- REDUNDANT: duplicated per line
  category     TEXT,        -- REDUNDANT
  qty          INTEGER,
  unit_price   REAL,
  order_date   TEXT
);

INSERT INTO orders_denormalized VALUES
  (1, 101, 'Alice Chen',   'Seattle',  'P01', 'Laptop',  'Electronics', 1, 999.00, '2024-01-05'),
  (1, 101, 'Alice Chen',   'Seattle',  'P02', 'Mouse',   'Peripherals',  2,  29.99, '2024-01-05'),
  (2, 102, 'Bob Patel',    'New York', 'P01', 'Laptop',  'Electronics', 1, 999.00, '2024-01-10'),
  (3, 101, 'Alice Chen',   'Seattle',  'P03', 'Monitor', 'Displays',    1, 249.00, '2024-01-15');

SELECT * FROM orders_denormalized;`,
            },
            {
              id: "q1",
              label: "Demonstrate update anomaly",
              sql: `-- Alice moves to Portland. We must update EVERY row.
-- Miss one → inconsistent data (two different cities for the same customer)
UPDATE orders_denormalized SET customer_city = 'Portland' WHERE order_id = 1;
-- We forgot to update order_id = 3!

-- Now Alice's city is inconsistent:
SELECT customer_id, customer_name, customer_city
FROM orders_denormalized
WHERE customer_id = 101;`,
            },
            {
              id: "q2",
              label: "3NF design: three separate tables",
              sql: `-- GOOD DESIGN: normalized into three tables
CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  city        TEXT    NOT NULL
);
CREATE TABLE products (
  product_id  INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  category    TEXT    NOT NULL,
  price       REAL    NOT NULL
);
CREATE TABLE order_lines (
  order_id    INTEGER NOT NULL,
  product_id  INTEGER REFERENCES products(product_id),
  customer_id INTEGER REFERENCES customers(customer_id),
  qty         INTEGER NOT NULL,
  order_date  TEXT    NOT NULL,
  PRIMARY KEY (order_id, product_id)
);

INSERT INTO customers VALUES
  (101, 'Alice Chen', 'Seattle'),
  (102, 'Bob Patel',  'New York');
INSERT INTO products VALUES
  ('P01', 'Laptop',  'Electronics', 999.00),
  ('P02', 'Mouse',   'Peripherals',  29.99),
  ('P03', 'Monitor', 'Displays',    249.00);
INSERT INTO order_lines VALUES
  (1, 'P01', 101, 1, '2024-01-05'),
  (1, 'P02', 101, 2, '2024-01-05'),
  (2, 'P01', 102, 1, '2024-01-10'),
  (3, 'P03', 101, 1, '2024-01-15');

SELECT * FROM customers;`,
            },
            {
              id: "q3",
              label: "Now update is one row, never inconsistent",
              sql: `-- Alice moves to Portland: ONE update, instantly consistent everywhere
UPDATE customers SET city = 'Portland' WHERE customer_id = 101;

-- Verify: all Alice's orders reflect the new city
SELECT ol.order_id, c.name, c.city, p.name AS product
FROM order_lines ol
JOIN customers c ON ol.customer_id = c.customer_id
JOIN products p ON ol.product_id = p.product_id
ORDER BY ol.order_id;`,
            },
            {
              id: "q4",
              label: "1NF violation: non-atomic values",
              sql: `-- VIOLATES 1NF: tags column stores a list
CREATE TABLE articles_bad (
  id    INTEGER PRIMARY KEY,
  title TEXT,
  tags  TEXT  -- 'sql,databases,design' -- NOT atomic!
);
INSERT INTO articles_bad VALUES
  (1, 'Intro to SQL', 'sql,databases'),
  (2, 'Normalization', 'sql,design,databases'),
  (3, 'Window Functions', 'sql,advanced');

-- Problem: can't query "find all articles tagged 'databases'" cleanly
SELECT * FROM articles_bad WHERE tags LIKE '%databases%';
-- This works but is fragile and can't use an index efficiently`,
            },
            {
              id: "q5",
              label: "1NF fix: many-to-many tags table",
              sql: `-- 1NF compliant: separate table, one tag per row
CREATE TABLE articles (id INTEGER PRIMARY KEY, title TEXT);
CREATE TABLE article_tags (article_id INTEGER, tag TEXT, PRIMARY KEY (article_id, tag));

INSERT INTO articles VALUES (1,'Intro to SQL'), (2,'Normalization'), (3,'Window Functions');
INSERT INTO article_tags VALUES
  (1,'sql'),(1,'databases'),
  (2,'sql'),(2,'design'),(2,'databases'),
  (3,'sql'),(3,'advanced');

-- Clean query: find articles tagged 'databases'
SELECT a.title
FROM articles a
JOIN article_tags t ON a.id = t.article_id
WHERE t.tag = 'databases';`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Beyond 3NF: BCNF, 4NF, 5NF.** Boyce-Codd Normal Form (BCNF) is a stronger version of 3NF that handles some edge cases with multiple candidate keys. 4NF eliminates multi-valued dependencies. 5NF eliminates join dependencies. In practice, 3NF is sufficient for most application databases; BCNF is occasionally needed.",
      "**Normalization is bottom-up; denormalization is top-down.** Start with a normalized design, then deliberately denormalize specific tables to optimize for known, frequent read queries. Keep the normalized tables as the system of record (writes go there), and build derived tables or materialized views for reporting.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Three anomaly types",
        body: "**Update anomaly:** A fact is stored in multiple places; changing one copy creates inconsistency.\n**Insert anomaly:** Can't insert a valid fact without inventing related data (e.g., can't add a department until there's an employee in it).\n**Delete anomaly:** Deleting a row destroys unrelated facts (e.g., deleting the last employee in a department destroys the department's details).",
      },
    ],
  },

  examples: [
    {
      title: "Check if a table is in 1NF, 2NF, 3NF",
      body: `-- Ask these questions in order:
-- 1NF: Does every cell hold exactly one atomic value? No lists, no repeating columns?
-- 2NF: For composite PKs only: does every non-key column depend on the WHOLE PK,
--      not just part of it?
-- 3NF: Does every non-key column depend DIRECTLY on the PK,
--      not via another non-key column (transitive dependency)?

-- A table with only a single-column PK automatically satisfies 2NF.
-- Most tables with simple integer surrogate keys satisfy both 1NF and 2NF by design;
-- the main concern is 3NF (transitive dependencies).`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-025-q1",
        type: "choice",
        text: "An orders table stores customer_name and customer_city on every order row. This causes which anomaly?",
        options: [
          "Insert anomaly only",
          "Delete anomaly only",
          "Update anomaly (changing address requires updating many rows)",
          "No anomaly; this is standard practice",
        ],
        answer: "Update anomaly (changing address requires updating many rows)",
      },
      {
        id: "sql0-025-q2",
        type: "choice",
        text: "A table with composite PK (order_id, product_id) stores product_name, which depends only on product_id. This violates:",
        options: ["1NF", "2NF", "3NF", "BCNF only"],
        answer: "2NF",
      },
      {
        id: "sql0-025-q3",
        type: "choice",
        text: "What does 3NF require about non-key columns?",
        options: [
          "They must be unique across all rows",
          "They must depend on the key, the whole key, and nothing but the key",
          "They must not contain NULL values",
          "They must be indexed for query performance",
        ],
        answer:
          "They must depend on the key, the whole key, and nothing but the key",
      },
    ],
  },
};

export default lesson;
