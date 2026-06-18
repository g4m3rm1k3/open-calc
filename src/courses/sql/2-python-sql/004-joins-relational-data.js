export default {
  id: "sql1-004",
  slug: "joins-relational-data",
  chapter: "sql-1",
  order: 4,
  title: "Joins — The Heart of Relational Data",
  subtitle:
    "Combining tables is not optional — it's the whole point of the relational model",
  tags: [
    "JOIN",
    "INNER JOIN",
    "LEFT JOIN",
    "RIGHT JOIN",
    "FULL OUTER JOIN",
    "foreign key",
    "N+1 problem",
    "self join",
  ],
  aliases:
    "join inner join left join right join outer join cross join self join foreign key on clause relational",

  hook: {
    question:
      "Why do databases store customer names and order amounts in separate tables — and how do you combine them when you need both?",
    realWorldContext:
      "Every non-trivial query in production involves a JOIN. " +
      "An e-commerce order summary joins orders to customers to products to shipping addresses. " +
      "A GitHub PR view joins commits to users to repositories to comments. " +
      "JOINs are not a technical nicety — they are the fundamental mechanism that makes " +
      "the relational model work. Engineers who understand JOINs deeply write faster queries, " +
      "design better schemas, and avoid the N+1 query problem that crashes production systems.",
    previewVisualizationId: "PythonNotebook",
  },

  intuition: {
    prose: [
      "**Why data is split across tables.** Storing customer name and address in every order row wastes space and — more critically — creates update anomalies. If Alice moves, you'd have to update every one of her 1,000 orders. Instead: store Alice's info once in `customers`, and have each order reference her by `customer_id`. To get a full order-with-customer-name, you *join* the two tables on `orders.customer_id = customers.id`.",
      "**INNER JOIN: the default.** Returns only rows that have a match in both tables. An order with no matching customer is excluded. A customer with no orders is excluded. Think of it as the intersection.",
      '**LEFT JOIN: keep all left rows.** Returns all rows from the left table, plus matching data from the right table. If there\'s no match, the right side columns are NULL. Use LEFT JOIN when you want "all customers, with their order count (zero if none)".',
      "**RIGHT JOIN and FULL OUTER JOIN.** RIGHT JOIN keeps all right rows (rarely used — just swap the table order and use LEFT JOIN instead). FULL OUTER JOIN keeps all rows from both sides, filling NULLs where there's no match. SQLite doesn't support FULL OUTER JOIN natively.",
      "**The N+1 query problem.** A critical performance anti-pattern. Instead of one JOIN query, novice code runs 1 query to get N records, then N individual queries to fetch related data — N+1 total. For 1,000 orders this means 1,001 database round-trips. The fix is always: use a JOIN to get everything in one query.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Join Types",
        body: "**INNER JOIN:** Only rows with a match in BOTH tables\n**LEFT JOIN:** All left rows + matching right rows (NULL if no match)\n**RIGHT JOIN:** All right rows + matching left rows (NULL if no match)\n**FULL OUTER JOIN:** All rows from both tables (NULL on whichever side has no match)\n**CROSS JOIN:** Every combination of left and right rows (Cartesian product — rarely what you want)",
      },
      {
        type: "insight",
        title: "LEFT JOIN is more common than INNER JOIN",
        body: 'In practice, LEFT JOIN is used more often because data is often incomplete. "All customers, even those with no orders" is a natural query. INNER JOIN silently discards non-matching rows — which is sometimes the bug, not the feature.',
      },
      {
        type: "warning",
        title: "The N+1 Query Problem",
        body: '```python\n# WRONG: N+1 queries\norders = db.query("SELECT * FROM orders")\nfor order in orders:  # N = 1000 orders\n    customer = db.query(  # 1000 extra queries!\n        f"SELECT * FROM customers WHERE id = {order.customer_id}"\n    )\n\n# CORRECT: 1 query with JOIN\nresults = db.query("""\n    SELECT o.*, c.name FROM orders o\n    JOIN customers c ON c.id = o.customer_id\n""")\n```\nThis pattern is responsible for a disproportionate share of production performance incidents.',
      },
      {
        type: "warning",
        title: "JOIN without ON is a Cartesian product",
        body: "If you forget the ON clause (or accidentally write a CROSS JOIN), you get the Cartesian product — every row of table A matched with every row of table B. 1,000 customers × 1,000,000 orders = 1,000,000,000 rows. This will OOM your server.",
      },
    ],
    visualizations: [
      {
        id: "PythonNotebook",
        title: "Joins — Combining Relational Data",
        mathBridge:
          "A JOIN is the relational algebra natural join (⋈) or theta-join. INNER JOIN = σ(condition)(R × S). LEFT OUTER JOIN = INNER JOIN ∪ {(r, NULL) | r ∈ R with no matching s ∈ S}.",
        caption:
          "Work through each join type carefully. The final cell demonstrates the N+1 problem with timing so you can see the performance difference directly.",
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: "Setup with more interesting data",
              prose: [
                "## Extended dataset with unmatched rows",
                "We add a customer with no orders, and an orphan order, to make LEFT/INNER differences visible.",
              ],
              code: `import sqlite3, time

conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.executescript("""
CREATE TABLE customers (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, state TEXT
);
CREATE TABLE products (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, price REAL NOT NULL, category TEXT
);
CREATE TABLE orders (
    id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER,
    quantity INTEGER NOT NULL, created_at TEXT NOT NULL
);
INSERT INTO customers VALUES
    (1,'Alice Chen','CA'),(2,'Bob Torres','NY'),
    (3,'Carol Kim','CA'),(4,'David Patel',NULL),
    (5,'Eve Johnson','TX'),(6,'Frank Lee','WA');  -- Frank has NO orders

INSERT INTO products VALUES
    (1,'Laptop',999.99,'Electronics'),(2,'Keyboard',79.99,'Electronics'),
    (3,'Desk',249.99,'Furniture'),(4,'Monitor',399.99,'Electronics'),
    (5,'Chair',189.99,'Furniture');

INSERT INTO orders VALUES
    (1,1,1,1,'2024-10-05'),(2,2,4,2,'2024-11-12'),
    (3,1,2,1,'2024-12-01'),(4,3,5,1,'2024-09-20'),
    (5,2,1,1,'2024-10-30'),(6,3,4,1,'2024-11-08'),
    (7,4,3,2,'2024-12-15'),(8,5,2,3,'2024-01-22'),
    (9,NULL,1,1,'2024-12-20');  -- orphan order: no customer_id
""")
conn.commit()
print("6 customers (Frank has no orders)")
print("9 orders (one orphan with no customer)")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: "INNER JOIN — only matching rows",
              prose: [
                "## INNER JOIN: the intersection",
                "Returns only rows where the join condition is satisfied in BOTH tables. Frank (no orders) is excluded. The orphan order (no customer) is also excluded.",
              ],
              code: `# INNER JOIN: only rows with a match on both sides
cur.execute("""
    SELECT o.id, c.name, o.quantity, o.created_at
    FROM   orders o
    INNER JOIN customers c ON c.id = o.customer_id
    ORDER  BY o.id
""")
print("INNER JOIN result:")
print(f"{'OrderID':>8} {'Customer':<15} {'Qty':>4} {'Date'}")
print("-" * 45)
for oid, name, qty, date in cur.fetchall():
    print(f"{oid:>8} {name:<15} {qty:>4} {date}")

# Count check
cur.execute("SELECT COUNT(*) FROM orders")
total = cur.fetchone()[0]
cur.execute("""
    SELECT COUNT(*) FROM orders o
    INNER JOIN customers c ON c.id = o.customer_id
""")
matched = cur.fetchone()[0]
print(f"\\nTotal orders: {total}, INNER JOIN returned: {matched}")
print(f"Missing: {total - matched} orphan orders (no matching customer)")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: "LEFT JOIN — keep all left rows",
              prose: [
                "## LEFT JOIN: never lose a customer",
                "All rows from the LEFT table (customers) appear in the result. If a customer has no orders, the order columns are NULL.",
              ],
              code: `# LEFT JOIN: all customers, even those with no orders
cur.execute("""
    SELECT c.name, c.state,
           COUNT(o.id)    AS num_orders,   -- COUNT(col) skips NULLs
           SUM(o.quantity) AS total_items
    FROM   customers c
    LEFT JOIN orders o ON o.customer_id = c.id
    GROUP BY c.id, c.name, c.state
    ORDER  BY num_orders DESC
""")
print("All customers with order counts (LEFT JOIN):")
print(f"{'Name':<15} {'State':>5} {'Orders':>7} {'Items':>7}")
print("-" * 38)
for name, state, orders, items in cur.fetchall():
    state_str = state or 'NULL'
    items_str = str(items) if items else '0'
    print(f"{name:<15} {state_str:>5} {orders:>7} {items_str:>7}")

print()
print("Frank Lee has 0 orders — LEFT JOIN includes him with NULLs from the orders table.")
print("INNER JOIN would have excluded Frank entirely.")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 4,
              cellTitle: "Multi-table join",
              prose: [
                "## Joining 3 tables",
                "Real queries often join many tables. Each JOIN adds one more table to the result. The order matters for LEFT JOINs.",
              ],
              code: `# Join orders + customers + products to get a full order summary
cur.execute("""
    SELECT
        o.id           AS order_id,
        c.name         AS customer,
        p.name         AS product,
        p.category,
        o.quantity,
        p.price,
        o.quantity * p.price AS line_total
    FROM   orders o
    JOIN   customers c ON c.id = o.customer_id
    JOIN   products  p ON p.id = o.product_id
    ORDER  BY line_total DESC
""")
print(f"{'OrdID':>6} {'Customer':<12} {'Product':<10} {'Cat':<12} {'Qty':>4} {'Price':>8} {'Total':>10}")
print("-" * 70)
for row in cur.fetchall():
    oid, cust, prod, cat, qty, price, total = row
    print(f"{oid:>6} {cust:<12} {prod:<10} {cat:<12} {qty:>4} \${price:>7.2f} \${total:>9.2f}")

# Grand total
cur.execute("""
    SELECT SUM(o.quantity * p.price) AS grand_total
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    JOIN products p ON p.id = o.product_id
""")
print(f"\\nGrand Total: \${cur.fetchone()[0]:.2f}")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 5,
              cellTitle: "The N+1 Query Problem",
              prose: [
                "## N+1: the most common production performance bug",
                "This pattern quietly appears in ORMs (SQLAlchemy, Django ORM, ActiveRecord). It looks innocent but causes massive performance issues at scale.",
              ],
              code: `import time

# Create a larger dataset to make timing visible
cur.executescript("""
DROP TABLE IF EXISTS big_orders;
CREATE TABLE big_orders AS
    SELECT * FROM orders;
""")
# Add more rows
for i in range(10, 210):
    cid = (i % 5) + 1
    cur.execute("INSERT INTO big_orders VALUES (?,?,?,?,?)",
                (i, cid, (i%5)+1, i%3+1, '2024-06-01'))
conn.commit()

cur.execute("SELECT COUNT(*) FROM big_orders")
print(f"Orders: {cur.fetchone()[0]}")

# N+1 approach — DO NOT do this
t0 = time.perf_counter()
cur.execute("SELECT id, customer_id FROM big_orders")
orders = cur.fetchall()
results_bad = []
for oid, cid in orders:
    cur.execute("SELECT name FROM customers WHERE id = ?", (cid,))
    row = cur.fetchone()
    name = row[0] if row else 'Unknown'
    results_bad.append((oid, name))
t_n1 = time.perf_counter() - t0

# JOIN approach — correct way
t0 = time.perf_counter()
cur.execute("""
    SELECT o.id, c.name
    FROM   big_orders o
    LEFT JOIN customers c ON c.id = o.customer_id
""")
results_good = cur.fetchall()
t_join = time.perf_counter() - t0

print(f"\\nN+1 approach:  {len(orders)+1} queries, {t_n1*1000:.2f}ms")
print(f"JOIN approach: 1 query,          {t_join*1000:.2f}ms")
print(f"Speedup: {t_n1/t_join:.0f}x")
print(f"\\nAt 1,000,000 orders, N+1 would be ~{1_000_000 * (t_n1/len(orders))*1000:.0f}ms = {1_000_000 * (t_n1/len(orders)):.1f}s")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**JOIN is a filter on the Cartesian product.** An INNER JOIN is equivalent to a CROSS JOIN (Cartesian product) followed by a WHERE on the join condition. The optimizer never actually computes the Cartesian product — it uses index lookups, hash joins, or merge joins depending on the data characteristics. But the logical semantics are: `A JOIN B ON cond ≡ SELECT * FROM A, B WHERE cond`.",
      "**Join algorithms.** Three main strategies: (1) Nested Loop Join — for each row in A, scan all of B. O(n×m). (2) Hash Join — build a hash table on the smaller table, probe it for each row of the larger. O(n+m). (3) Merge Join — sort both sides, then merge. O(n log n + m log m). The query planner chooses based on table sizes and available indexes.",
      "**Implicit vs explicit joins.** The old style `FROM orders, customers WHERE orders.customer_id = customers.id` is an implicit inner join. Always use explicit `JOIN ... ON ...` syntax — it separates join conditions from filter conditions, making queries easier to read and modify.",
    ],
  },

  examples: [
    {
      id: "sql1-004-ex1",
      title: "Self Join — Employees and Managers",
      problem:
        "Find every employee and their manager's name. The managers table is the same employees table.",
      code: `CREATE TABLE employees (
    id         INTEGER PRIMARY KEY,
    name       TEXT NOT NULL,
    manager_id INTEGER REFERENCES employees(id)  -- self-reference
);

-- Find employee + manager name
SELECT e.name       AS employee,
       m.name       AS manager
FROM   employees e
LEFT JOIN employees m ON m.id = e.manager_id
-- LEFT JOIN: include CEO (manager_id IS NULL) with NULL as manager
ORDER BY m.name NULLS LAST, e.name`,
      steps: [
        {
          expression: "employees e (the workers)",
          annotation: "One row per employee",
        },
        {
          expression: "LEFT JOIN employees m",
          annotation: 'Same table aliased as "m" for managers',
        },
        {
          expression: "ON m.id = e.manager_id",
          annotation: "Link employee's manager_id to the manager's id",
        },
        {
          expression: "LEFT JOIN (not INNER)",
          annotation: "Include CEO whose manager_id is NULL",
        },
      ],
      conclusion:
        "Self joins are how hierarchical data (org charts, file trees, categories with subcategories) is queried in relational databases.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql1-004-q1",
        type: "choice",
        text: "You want all customers, including those with no orders. Which join do you use?",
        options: [
          "INNER JOIN orders ON orders.customer_id = customers.id",
          "LEFT JOIN orders ON orders.customer_id = customers.id (customers on the left)",
          "RIGHT JOIN orders ON orders.customer_id = customers.id",
          "CROSS JOIN orders",
        ],
        answer:
          "LEFT JOIN orders ON orders.customer_id = customers.id (customers on the left)",
      },
      {
        id: "sql1-004-q2",
        type: "choice",
        text: "The N+1 query problem occurs when:",
        options: [
          "A query joins more than N tables",
          "You run 1 query to get N rows, then N separate queries to fetch related data for each row",
          "You have more than N+1 rows in a table",
          "A subquery returns more than 1 row",
        ],
        answer:
          "You run 1 query to get N rows, then N separate queries to fetch related data for each row",
      },
      {
        id: "sql1-004-q3",
        type: "choice",
        text: "You have orders and customers. An order has customer_id = 99, but no customer with id=99 exists. With INNER JOIN, this order:",
        options: [
          "Appears in the result with NULL for customer columns",
          "Causes a database error",
          "Is excluded from the result",
          "Is included only if you add WHERE customer_id IS NOT NULL",
        ],
        answer: "Is excluded from the result",
      },
    ],
  },

  mentalModel: [
    "INNER JOIN: intersection — only rows with a match on both sides",
    "LEFT JOIN: all left rows + matching right (NULL if no match) — never loses a left row",
    "JOIN without ON = Cartesian product = every row × every row = usually catastrophic",
    "N+1 problem: 1 query + N queries = use a JOIN instead",
    "Self join: join a table to itself using two aliases — for hierarchical data",
  ],
};
