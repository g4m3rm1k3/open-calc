const lesson = {
  id: "sql-0-004",
  slug: "joins",
  chapter: "sql-0",
  order: 16,
  title: "JOINs — The Heart of Relational Data",
  subtitle: "INNER JOIN, LEFT JOIN, and combining tables on a shared key",
  tags: ["sql", "join", "inner join", "left join", "foreign key"],
  aliases: [
    "sql joins",
    "joining tables",
    "inner join",
    "left join",
    "combine tables",
  ],

  hook: `A database with one table is just a spreadsheet.
The power of the relational model only appears when you combine tables.
JOINs are the tool that turns foreign keys — those lonely integer IDs — into meaningful data.`,

  intuition: {
    prose: [
      "**A JOIN combines rows from two tables wherever a condition is true.** The most common condition: the foreign key in one table equals the primary key in another. Without JOINs, relational data stays fragmented in separate tables — JOINs are how you reassemble it.",
      "**INNER JOIN: only rows with a match in both tables.** A customer with no orders is excluded. An order for a non-existent customer is excluded. You get the intersection. If a customer has 5 orders, the join produces 5 rows for that customer.",
      "**LEFT JOIN: every row from the left table, fill NULLs for unmatched right rows.** A customer with no orders appears once, with NULLs in the order columns. Use LEFT JOIN when you want 'show me everything from A, and attach B if it exists.' The `WHERE right.pk IS NULL` pattern finds rows in A with no match in B at all.",
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Schema setup",
              setup: true,
              sql: `CREATE TABLE customers (
  customer_id   INTEGER PRIMARY KEY,
  name          TEXT    NOT NULL,
  city          TEXT    NOT NULL,
  tier          TEXT    NOT NULL  -- 'standard' or 'premium'
);

CREATE TABLE orders (
  order_id      INTEGER PRIMARY KEY,
  customer_id   INTEGER REFERENCES customers(customer_id),
  item          TEXT    NOT NULL,
  amount        REAL    NOT NULL,
  order_date    TEXT    NOT NULL,
  status        TEXT    NOT NULL
);

INSERT INTO customers VALUES
  (1, 'Alice Chen',  'New York',    'premium'),
  (2, 'Bob Patel',   'Chicago',     'standard'),
  (3, 'Carol Kim',   'Seattle',     'premium'),
  (4, 'Dave Lee',    'Austin',      'standard'),
  (5, 'Eve Nguyen',  'New York',    'standard');
-- Note: Eve (id=5) has no orders

INSERT INTO orders VALUES
  (101, 1, 'Laptop',    1299.00, '2024-04-01', 'shipped'),
  (102, 1, 'Mouse',       45.00, '2024-04-15', 'delivered'),
  (103, 2, 'Keyboard',   110.00, '2024-04-20', 'shipped'),
  (104, 3, 'Monitor',    399.00, '2024-05-01', 'delivered'),
  (105, 3, 'Webcam',      89.00, '2024-05-10', 'shipped'),
  (106, 4, 'Desk Lamp',   35.00, '2024-05-15', 'delivered'),
  (107, 1, 'Headset',    159.00, '2024-06-01', 'processing');
-- Note: no order has customer_id = 5`,
            },
            {
              id: "q1",
              label: "INNER JOIN — customers with their orders",
              sql: `-- Only customers who have at least one order appear
SELECT
  c.name          AS customer,
  c.city,
  o.order_id,
  o.item,
  o.amount,
  o.status
FROM customers AS c
INNER JOIN orders AS o
  ON c.customer_id = o.customer_id
ORDER BY c.name, o.order_date;`,
            },
            {
              id: "q2",
              label: "LEFT JOIN — every customer, even with no orders",
              sql: `-- Eve appears, with NULLs in the order columns
SELECT
  c.name      AS customer,
  c.city,
  o.order_id,
  o.item,
  o.amount
FROM customers AS c
LEFT JOIN orders AS o
  ON c.customer_id = o.customer_id
ORDER BY c.name;`,
            },
            {
              id: "q3",
              label: "Find customers with NO orders (anti-join pattern)",
              sql: `-- A LEFT JOIN where the right side IS NULL means "no match found"
SELECT
  c.name,
  c.city,
  c.tier
FROM customers AS c
LEFT JOIN orders AS o
  ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;`,
            },
            {
              id: "q4",
              label: "JOIN + aggregate — total spent per customer",
              sql: `SELECT
  c.name          AS customer,
  c.tier,
  COUNT(o.order_id) AS order_count,
  SUM(o.amount)     AS total_spent
FROM customers AS c
LEFT JOIN orders AS o
  ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name, c.tier
ORDER BY total_spent DESC NULLS LAST;`,
            },
            {
              id: "q5",
              label: "Self-join — comparing rows within one table",
              sql: `-- Find pairs of customers in the same city
SELECT
  a.name AS customer_a,
  b.name AS customer_b,
  a.city
FROM customers AS a
INNER JOIN customers AS b
  ON a.city = b.city
  AND a.customer_id < b.customer_id  -- avoid (A,B) and (B,A) duplicates
ORDER BY a.city;`,
            },
            {
              id: "challenge",
              label: "Your turn: premium orders",
              sql: `-- List all orders placed by premium-tier customers
-- Show: customer name, tier, item, amount, status
-- Sort by amount descending
`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Join types:** INNER JOIN keeps only matched rows. LEFT JOIN keeps all left rows. RIGHT JOIN keeps all right rows. FULL OUTER JOIN keeps all rows from both sides. CROSS JOIN produces every combination (Cartesian product — rarely intentional).",
      "**Table aliases are required for self-joins.** `FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.employee_id` — you join a table to itself and distinguish the two 'copies' with aliases.",
      "**Fan-out with aggregates.** If you JOIN before aggregating, SUM may count more than expected. A customer with 5 orders joined to a customer_credit table produces 5 rows, so `SUM(credit_limit)` counts the limit 5 times. Aggregate in a subquery first, then join — or use DISTINCT carefully.",
      "**NULL in JOIN conditions.** NULL never equals NULL in a JOIN. A row with a NULL foreign key matches no row in the other table.",
    ],
  },

  examples: [
    {
      title: "The anti-join pattern",
      body: `LEFT JOIN + WHERE right.pk IS NULL is the standard way to find rows in table A that have no match in table B.
"Show me all customers who never placed an order" — this pattern is everywhere.`,
    },
    {
      title: "Beware of fan-out with aggregates",
      body: `If you JOIN before aggregating, you might count more than you expect.
A customer with 5 orders joined to an orders table produces 5 rows.
SUM(order.amount) is correct, but SUM(customer.credit_limit) would count that limit 5 times.
Aggregate first in a subquery, then join — or use DISTINCT carefully.`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-004-q1",
        type: "choice",
        text: "What rows does INNER JOIN return that LEFT JOIN does NOT?",
        options: [
          "Left-table rows with no match in the right table",
          "Right-table rows with no match in the left table",
          "Nothing — INNER JOIN is a subset of LEFT JOIN",
          "All rows from both tables",
        ],
        answer: "Nothing — INNER JOIN is a subset of LEFT JOIN",
      },
      {
        id: "sql0-004-q2",
        type: "choice",
        text: "How do you find customers in table A who have NO orders in table B?",
        options: [
          "INNER JOIN orders ON customer_id",
          "LEFT JOIN orders ON customer_id WHERE orders.order_id IS NOT NULL",
          "LEFT JOIN orders ON customer_id WHERE orders.order_id IS NULL",
          "CROSS JOIN orders WHERE order_id IS NULL",
        ],
        answer: "LEFT JOIN orders ON customer_id WHERE orders.order_id IS NULL",
      },
      {
        id: "sql0-004-q3",
        type: "choice",
        text: "A customer has 5 orders. After INNER JOIN, how many rows does that customer contribute?",
        options: ["1", "5", "0", "Depends on SELECT columns"],
        answer: "5",
      },
    ],
  },

  mentalModel: [
    "INNER JOIN = only rows with a match in both tables — unmatched rows are dropped",
    "LEFT JOIN = every left-table row appears; unmatched right side becomes NULL",
    "LEFT JOIN + WHERE right.pk IS NULL = anti-join: rows in A with no match in B",
    "JOINs multiply rows — one customer with 5 orders produces 5 JOIN rows",
  ],
};

export default lesson;
