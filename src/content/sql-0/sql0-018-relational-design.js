const lesson = {
  id: "sql-0-018",
  slug: "relational-design",
  chapter: "sql-0",
  order: 15,
  title: "Keys and Relationships",
  subtitle: "How tables connect to each other",
  tags: [
    "sql",
    "primary key",
    "foreign key",
    "relationships",
    "relational model",
    "referential integrity",
  ],
  aliases: [
    "primary key sql",
    "foreign key sql",
    "table relationships",
    "one to many sql",
    "relational model",
    "database design basics",
  ],

  hook: `A spreadsheet has one sheet. A database has many related tables.
Customers are in one table. Orders are in another. Products in a third.
They connect through keys — small identifier values that create relationships.
This is the entire foundation of the relational model, invented in 1970 and still ruling the world.`,

  mentalModel: [
    "A PRIMARY KEY uniquely identifies each row in a table. No two rows can have the same primary key.",
    "A FOREIGN KEY in one table references the primary key of another table — creating a link.",
    "One customer can have many orders (one-to-many). This is the most common relationship type.",
    "Foreign key constraints enforce referential integrity: you can't reference a customer that doesn't exist.",
  ],

  intuition: {
    prose: [
      "**The relational model solves the repetition problem.** Imagine storing customer name and address on every order. If a customer moves, you'd update every order row. Instead, store the customer once in a `customers` table, and store just a `customer_id` on each order. Update the customer once, and all orders instantly reflect the new address.",
      "**A PRIMARY KEY is the row's unique identity.** Every table should have a primary key — a column (or set of columns) that uniquely identifies each row. `customer_id`, `order_id`, `product_id` — these are usually auto-incrementing integers. No two rows in the same table can have the same primary key value. Primary keys can't be NULL.",
      "**A FOREIGN KEY points to a primary key in another table.** In the `orders` table, `customer_id` is a foreign key. It stores the `customer_id` value from the `customers` table. This creates a relationship: 'this order belongs to that customer.' The database can enforce that the referenced customer actually exists.",
      "**One-to-many: the most common relationship.** One customer → many orders. One product → many order lines. One department → many employees. The 'many' side always holds the foreign key pointing back to the 'one' side.",
      "**Referential integrity prevents orphans.** With a foreign key constraint enabled, you can't insert an order for `customer_id = 999` if no customer with that ID exists. You also can't delete a customer who has existing orders (unless you set up CASCADE behavior). This keeps your data consistent.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Key types",
        body: "**Primary Key (PK):** Unique identifier for each row in a table. Not NULL. Usually an auto-increment integer or UUID.\n**Foreign Key (FK):** A column that references the PK of another table. Creates a relationship between tables.\n**Surrogate key:** An artificial key with no business meaning (e.g., auto-increment `id`). Preferred for simplicity.\n**Natural key:** A key derived from real data (e.g., email address, ISBN). Can be used as PK but risky if data changes.",
      },
      {
        type: "insight",
        title: "SQLite foreign key enforcement is opt-in",
        body: "SQLite defines foreign keys but doesn't enforce them by default. You must run `PRAGMA foreign_keys = ON;` at the start of your session to enable enforcement. This was a design decision for backward compatibility. In PostgreSQL and MySQL, enforcement is always on.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Three-table schema: customers, products, orders",
              setup: true,
              sql: `PRAGMA foreign_keys = ON;

CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,   -- PK: unique identity
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL UNIQUE,
  city        TEXT    NOT NULL
);

CREATE TABLE products (
  product_id  INTEGER PRIMARY KEY,   -- PK
  name        TEXT    NOT NULL,
  category    TEXT    NOT NULL,
  price       REAL    NOT NULL
);

CREATE TABLE orders (
  order_id    INTEGER PRIMARY KEY,   -- PK
  customer_id INTEGER NOT NULL
    REFERENCES customers(customer_id),  -- FK → customers
  order_date  TEXT    NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'pending',
  total       REAL    NOT NULL
);

CREATE TABLE order_items (
  item_id     INTEGER PRIMARY KEY,
  order_id    INTEGER NOT NULL REFERENCES orders(order_id),  -- FK → orders
  product_id  INTEGER NOT NULL REFERENCES products(product_id),  -- FK → products
  quantity    INTEGER NOT NULL,
  unit_price  REAL    NOT NULL
);

INSERT INTO customers VALUES
  (1, 'Alice Chen',   'alice@ex.com',   'Seattle'),
  (2, 'Bob Patel',    'bob@ex.com',     'New York'),
  (3, 'Carol Kim',    'carol@ex.com',   'Chicago');

INSERT INTO products VALUES
  (1, 'Laptop Pro',      'Electronics', 1299.00),
  (2, 'Wireless Mouse',  'Peripherals',   34.99),
  (3, 'Monitor 27"',     'Displays',     249.00);

INSERT INTO orders VALUES
  (1, 1, '2024-01-05', 'shipped',  1333.99),
  (2, 1, '2024-01-20', 'pending',   249.00),
  (3, 2, '2024-01-15', 'shipped',    34.99);

INSERT INTO order_items VALUES
  (1, 1, 1, 1, 1299.00),
  (2, 1, 2, 1,   34.99),
  (3, 2, 3, 1,  249.00),
  (4, 3, 2, 1,   34.99);`,
            },
            {
              id: "q1",
              label: "View each table independently",
              sql: `SELECT * FROM customers;`,
            },
            {
              id: "q2",
              label: "Orders reference customers by customer_id",
              sql: `SELECT * FROM orders;
-- See how customer_id 1 and 2 appear — these reference rows in customers`,
            },
            {
              id: "q3",
              label:
                "Referential integrity: can't reference non-existent customer",
              sql: `-- Try to create an order for customer_id 999 (doesn't exist)
-- With foreign_keys ON, this should fail
INSERT INTO orders VALUES (99, 999, '2024-02-01', 'pending', 100.00);`,
            },
            {
              id: "q4",
              label: "View the schema: sqlite_master",
              sql: `-- See how the tables and their constraints are stored
SELECT name, type, sql
FROM sqlite_master
WHERE type = 'table'
ORDER BY name;`,
            },
            {
              id: "q5",
              label: "Trace a relationship manually",
              sql: `-- Find all orders for Alice (customer_id = 1)
-- Step 1: get Alice's customer_id
SELECT customer_id, name FROM customers WHERE name = 'Alice Chen';

-- Step 2: find her orders using that customer_id
SELECT order_id, order_date, status, total
FROM orders
WHERE customer_id = 1;`,
            },
            {
              id: "q6",
              label:
                "Preview: next lesson shows how JOIN does this automatically",
              sql: `-- Without JOIN, you query in two steps (cumbersome)
-- With JOIN (next lesson), you do it in one:
-- SELECT c.name, o.order_date, o.total
-- FROM customers c JOIN orders o ON c.customer_id = o.customer_id
-- WHERE c.name = 'Alice Chen'

-- For now: count how many orders each customer has
SELECT customer_id, COUNT(*) AS num_orders
FROM orders
GROUP BY customer_id;`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Composite primary keys.** A primary key can span multiple columns. The `order_items` table might use `(order_id, product_id)` as a composite key instead of a surrogate `item_id`. This enforces that each product appears at most once per order. Composite keys are syntactically: `PRIMARY KEY (col1, col2)`.",
      "**Cascade options.** Foreign keys can specify behavior when the referenced row is updated or deleted: `ON DELETE CASCADE` (delete child rows too), `ON DELETE SET NULL` (set FK to NULL), `ON DELETE RESTRICT` (prevent deletion if children exist — the default), `ON UPDATE CASCADE` (propagate the new PK value to all FK references).",
    ],
    callouts: [
      {
        type: "definition",
        title: "Relationship types",
        body: "**One-to-many:** One customer → many orders. The FK is on the 'many' side.\n**Many-to-many:** An order can contain many products; a product can appear in many orders. Implemented via a junction/bridge table (order_items) with two FKs.\n**One-to-one:** Rare. A user and their profile, stored separately. One FK with a UNIQUE constraint.",
      },
    ],
  },

  examples: [
    {
      title: "Many-to-many via junction table",
      body: `-- Students can enroll in many courses
-- Courses can have many students
-- Junction table 'enrollments' holds the relationship

CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE courses (id INTEGER PRIMARY KEY, title TEXT);
CREATE TABLE enrollments (
  student_id INTEGER REFERENCES students(id),
  course_id  INTEGER REFERENCES courses(id),
  enrolled_on TEXT,
  PRIMARY KEY (student_id, course_id)  -- composite PK prevents duplicate enrollments
);`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-018-q1",
        type: "choice",
        text: "In a one-to-many relationship (one customer, many orders), where does the foreign key go?",
        options: [
          "In the customers table, pointing to orders",
          "In the orders table, pointing to customers",
          "In both tables",
          "In a separate join table",
        ],
        answer: "In the orders table, pointing to customers",
      },
      {
        id: "sql0-018-q2",
        type: "choice",
        text: "What does a foreign key constraint prevent?",
        options: [
          "Duplicate values in the referenced column",
          "NULL values in the foreign key column",
          "Inserting a row that references a non-existent primary key value",
          "Selecting from the referenced table",
        ],
        answer:
          "Inserting a row that references a non-existent primary key value",
      },
      {
        id: "sql0-018-q3",
        type: "choice",
        text: "What is a junction table (bridge table) used for?",
        options: [
          "Storing computed values from two tables",
          "Implementing many-to-many relationships between two tables",
          "Copying data from one table to another",
          "Enforcing one-to-one relationships",
        ],
        answer: "Implementing many-to-many relationships between two tables",
      },
    ],
  },
};

export default lesson;
