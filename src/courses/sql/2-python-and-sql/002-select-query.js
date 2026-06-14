export default {
  id: "sql1-002",
  slug: "select-your-first-query",
  chapter: "sql-1",
  order: 2,
  title: "SELECT — Your First Query",
  subtitle: "Filtering, sorting, and shaping data — the declarative mindset",
  tags: [
    "SELECT",
    "WHERE",
    "ORDER BY",
    "LIMIT",
    "DISTINCT",
    "LIKE",
    "IN",
    "BETWEEN",
    "COALESCE",
    "sql execution order",
  ],
  aliases:
    "select from where order by limit distinct like in between null coalesce filter sort query",

  hook: {
    question:
      "What is the order SQL actually executes a query — and why is it different from the order you write it?",
    realWorldContext:
      "SELECT is the most-used statement in any production database. A senior engineer " +
      "at a company running millions of queries per day thinks about SELECT differently from a beginner: " +
      'not as "fetch some rows" but as a pipeline of set transformations. ' +
      "Understanding execution order prevents bugs, explains error messages, and is the foundation " +
      "for understanding joins, aggregations, subqueries, and query performance — everything that comes next.",
    previewVisualizationId: "PythonNotebook",
  },

  intuition: {
    prose: [
      "**The SELECT pipeline.** SQL looks like English but executes in a different order from how you write it. The mental model that makes everything click: SQL is a pipeline of set operations applied to your data in a specific order.",
      "**Execution order (not writing order):**",
      "1. `FROM` — identify the source table(s) and load rows into memory\n2. `WHERE` — filter rows (removes rows before grouping or selecting)\n3. `GROUP BY` — collapse rows into groups (covered next lesson)\n4. `HAVING` — filter groups (covered next lesson)\n5. `SELECT` — compute the output columns\n6. `DISTINCT` — remove duplicate rows from the output\n7. `ORDER BY` — sort the result\n8. `LIMIT` — keep only the first N rows",
      "This order explains why you **cannot** use a column alias defined in SELECT inside a WHERE clause — WHERE runs before SELECT evaluates the alias.",
      "**WHERE: row-level filtering.** Every condition in WHERE is evaluated per row. Only rows where the condition evaluates to TRUE pass through. Rows where the condition is FALSE *or NULL* are discarded — this is the NULL trap again.",
      "**Pattern matching with LIKE.** SQL's LIKE operator uses `%` (any sequence of characters) and `_` (exactly one character). For serious pattern matching, PostgreSQL also supports ILIKE (case-insensitive), SIMILAR TO, and full regex via `~`.",
    ],
    callouts: [
      {
        type: "definition",
        title: "SQL Execution Order (memorize this)",
        body: "1. FROM (source)\n2. WHERE (filter rows)\n3. GROUP BY (group rows)\n4. HAVING (filter groups)\n5. SELECT (project columns)\n6. DISTINCT (deduplicate)\n7. ORDER BY (sort)\n8. LIMIT / OFFSET (paginate)",
      },
      {
        type: "warning",
        title: "Cannot use SELECT aliases in WHERE",
        body: 'Because WHERE runs before SELECT:\n```sql\n-- WRONG: "discounted" doesn\'t exist yet when WHERE runs\nSELECT amount * 0.9 AS discounted\nFROM orders\nWHERE discounted > 100\n\n-- CORRECT: repeat the expression\nSELECT amount * 0.9 AS discounted\nFROM orders\nWHERE amount * 0.9 > 100\n```\nThis trips up every SQL beginner — and many experienced developers.',
      },
      {
        type: "insight",
        title: "LIMIT without ORDER BY is meaningless",
        body: "Tables have no inherent row order (they are sets). `LIMIT 10` without `ORDER BY` returns an arbitrary 10 rows — possibly different each run. Always pair LIMIT with ORDER BY when the top-N matters.",
      },
      {
        type: "insight",
        title: "SELECT * in production",
        body: "Avoid `SELECT *` in production code. It returns every column (including future columns added by schema changes), breaks if columns are reordered, and prevents the query planner from using index-only scans. Name your columns explicitly.",
      },
    ],
    visualizations: [
      {
        id: "PythonNotebook",
        title: "SELECT — Reading Data with Precision",
        mathBridge:
          "A SELECT statement is a relational algebra expression: π (projection) ∘ σ (selection) ∘ R (relation). SELECT chooses columns (projection), WHERE filters rows (selection), FROM names the relation.",
        caption:
          "Work through all cells. The final cell has challenges that will test your understanding of execution order and NULL behavior.",
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: "Setup: rebuild the database",
              prose: [
                "## Recreate the tables from Lesson 1",
                "Run this first to restore the data we need.",
              ],
              code: `import sqlite3

conn = sqlite3.connect(":memory:")
cur = conn.cursor()

cur.executescript("""
CREATE TABLE customers (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL,
    email TEXT UNIQUE, state TEXT, joined TEXT
);
CREATE TABLE orders (
    id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL,
    amount REAL NOT NULL, quarter INTEGER NOT NULL, created_at TEXT NOT NULL
);
INSERT INTO customers VALUES
    (1,'Alice Chen','alice@example.com','CA','2022-03-10'),
    (2,'Bob Torres','bob@example.com','NY','2023-07-01'),
    (3,'Carol Kim','carol@example.com','CA','2021-11-20'),
    (4,'David Patel','david@example.com',NULL,'2024-01-05'),
    (5,'Eve Johnson','eve@example.com','TX','2023-04-15');
INSERT INTO orders VALUES
    (1,1,120.00,4,'2024-10-05'),(2,2,850.00,4,'2024-11-12'),
    (3,1,620.00,4,'2024-12-01'),(4,3,90.00,3,'2024-09-20'),
    (5,2,510.00,4,'2024-10-30'),(6,3,750.00,4,'2024-11-08'),
    (7,4,300.00,4,'2024-12-15'),(8,5,180.00,1,'2024-01-22');
""")
conn.commit()
print("Ready.")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: "SELECT and WHERE fundamentals",
              prose: [
                "## Selecting columns and filtering rows",
                "SELECT picks which columns to return. WHERE filters which rows. The result is a new table (not a modified version of the original).",
              ],
              code: `# Select specific columns
cur.execute("SELECT name, state FROM customers")
print("All customers (name, state):")
for row in cur.fetchall():
    print(" ", row)

print()

# WHERE filters rows
cur.execute("SELECT name, state FROM customers WHERE state = 'CA'")
print("CA customers only:")
for row in cur.fetchall():
    print(" ", row)

print()

# Multiple conditions with AND / OR
cur.execute("""
    SELECT name, state, joined
    FROM   customers
    WHERE  state IN ('CA', 'TX')   -- same as: state='CA' OR state='TX'
      AND  joined >= '2022-01-01'
    ORDER BY joined DESC
""")
print("CA or TX customers who joined 2022+:")
for row in cur.fetchall():
    print(" ", row)`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: "LIKE, BETWEEN, and comparison operators",
              prose: [
                "## Pattern matching and range checks",
                "`LIKE` with `%` matches any number of characters. `BETWEEN a AND b` is inclusive on both ends (equivalent to `>= a AND <= b`).",
              ],
              code: `# LIKE — pattern matching
# % = any sequence of characters
# _ = exactly one character
cur.execute("SELECT name, email FROM customers WHERE name LIKE 'A%'")
print("Names starting with A:")
for row in cur.fetchall(): print(" ", row)

cur.execute("SELECT name, email FROM customers WHERE email LIKE '%.com'")
print("\\n.com emails:")
for row in cur.fetchall(): print(" ", row)

# BETWEEN — inclusive range
cur.execute("SELECT id, amount FROM orders WHERE amount BETWEEN 100 AND 600")
print("\\nOrders $100-$600:")
for row in cur.fetchall(): print(" ", row)

# NOT IN
cur.execute("SELECT name, state FROM customers WHERE state NOT IN ('CA', 'NY')")
print("\\nNot CA or NY (watch for NULL):")
for row in cur.fetchall(): print(" ", row)

# COALESCE — replace NULL with a default
cur.execute("SELECT name, COALESCE(state, 'Unknown') AS state FROM customers")
print("\\nWith NULL replaced:")
for row in cur.fetchall(): print(" ", row)`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 4,
              cellTitle: "ORDER BY, LIMIT, and DISTINCT",
              prose: [
                "## Sorting, limiting, and deduplicating",
                "ORDER BY sorts the final result (step 7 of the pipeline). DISTINCT removes duplicate rows after SELECT. LIMIT + OFFSET enables pagination.",
              ],
              code: `# ORDER BY — ASC (default) or DESC
cur.execute("""
    SELECT id, amount, quarter
    FROM   orders
    ORDER  BY amount DESC
    LIMIT  3
""")
print("Top 3 largest orders:")
for row in cur.fetchall(): print(" ", row)

print()

# ORDER BY multiple columns
cur.execute("""
    SELECT customer_id, quarter, amount
    FROM   orders
    ORDER  BY customer_id ASC, amount DESC
""")
print("Orders by customer, largest first within each customer:")
for row in cur.fetchall(): print(" ", row)

print()

# DISTINCT — remove duplicate values
cur.execute("SELECT DISTINCT state FROM customers")
print("\\nDistinct states (including NULL):")
for row in cur.fetchall(): print(" ", row)

# LIMIT + OFFSET for pagination
page_size = 3
page = 1  # 0-indexed
cur.execute(f"SELECT id, amount FROM orders ORDER BY id LIMIT ? OFFSET ?",
            (page_size, page * page_size))
print(f"\\nPage {page+1} of orders (offset {page * page_size}):")
for row in cur.fetchall(): print(" ", row)`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 5,
              cellTitle: "Execution order: the alias trap",
              prose: [
                "## Why you cannot use a SELECT alias in WHERE",
                "This is the most common beginner mistake. Understanding *why* it fails makes the execution order concrete.",
              ],
              code: `# The execution order trap
# WHERE runs BEFORE SELECT — the alias doesn't exist yet

# This will fail:
try:
    cur.execute("""
        SELECT amount * 0.9 AS discounted
        FROM   orders
        WHERE  discounted > 500
    """)
    print(cur.fetchall())
except Exception as e:
    print(f"ERROR: {e}")
    print("Reason: WHERE runs before SELECT. 'discounted' doesn't exist yet.")

print()

# Correct: repeat the expression in WHERE
cur.execute("""
    SELECT amount, amount * 0.9 AS discounted
    FROM   orders
    WHERE  amount * 0.9 > 500
    ORDER  BY discounted DESC
""")
print("Orders where discounted price > $500:")
print(f"{'Original':>10} {'Discounted':>12}")
for original, discounted in cur.fetchall():
    print(f"\${original:>9.2f}  \${discounted:>10.2f}")

print()
print("Execution order: FROM → WHERE → SELECT → ORDER BY")
print("Aliases exist only from SELECT onward.")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 6,
              cellTitle: "Challenge: NULL traps in WHERE",
              prose: [
                "## NULL and NOT IN — a nasty production bug",
                "This is one of the most dangerous SQL behaviors. It causes silent data loss in production systems.",
              ],
              code: `# The NOT IN + NULL trap
# If any value in a NOT IN list is NULL, the whole query returns no rows

# Add a NULL state customer (already exists: David Patel, id=4)
cur.execute("SELECT name, state FROM customers")
print("All customers:")
for row in cur.fetchall(): print(" ", row)

print()

# You might expect this to return all non-CA customers
cur.execute("SELECT name FROM customers WHERE state NOT IN ('CA')")
print("NOT IN ('CA') — misses NULL states:")
for row in cur.fetchall(): print(" ", row)
# David (NULL state) is missing! NOT IN with a set that might contain NULL
# produces NULL for the NULL row → NULL in WHERE → row excluded

print()

# Safe version: explicitly handle NULL
cur.execute("""
    SELECT name, state FROM customers
    WHERE state != 'CA' OR state IS NULL
""")
print("Safe version (explicit NULL handling):")
for row in cur.fetchall(): print(" ", row)

print()
print("Lesson: whenever a column can be NULL, you must explicitly decide what NULL means.")
print("This is not a bug in SQL — it is mathematically correct three-valued logic.")`,
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
      "**Relational algebra.** SELECT implements three relational algebra operators: *selection* (σ, the WHERE clause — filters rows), *projection* (π, the column list — filters columns), and *rename* (ρ, aliases). The FROM clause names the relation. A SELECT query is a composition of these operators.",
      "**Three-valued logic.** SQL uses TRUE, FALSE, and NULL (unknown). WHERE keeps only TRUE rows. This means `NOT IN (list)` fails silently when any element of the list is NULL because `value != NULL` evaluates to NULL, not TRUE or FALSE. This is formally correct but a common source of production bugs.",
      "**LIMIT without ORDER BY.** Relational tables are mathematically *sets* — they have no inherent order. Without ORDER BY, the database is free to return rows in any order it finds efficient (usually insertion order or index order, but never guaranteed). `LIMIT 10` without ORDER BY returns 10 arbitrary rows.",
    ],
  },

  examples: [
    {
      id: "sql1-002-ex1",
      title: "Execution Order Trace",
      problem:
        "Trace through: SELECT DISTINCT state FROM customers WHERE joined > '2022-01-01' ORDER BY state LIMIT 3",
      steps: [
        { expression: "FROM customers", annotation: "Load all 5 rows" },
        {
          expression: "WHERE joined > '2022-01-01'",
          annotation: "Keep rows 2,4,5 (Bob, David, Eve)",
        },
        {
          expression: "SELECT DISTINCT state",
          annotation: "Extract state column, remove duplicates: [NY, NULL, TX]",
        },
        {
          expression: "ORDER BY state",
          annotation: "Sort: NULL sorts first in SQLite, then NY, TX",
        },
        {
          expression: "LIMIT 3",
          annotation: "Keep first 3 — all of them in this case",
        },
      ],
      conclusion:
        "The query executes in a different order from how you write it. Knowing this prevents the alias-in-WHERE bug and explains GROUP BY behavior.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql1-002-q1",
        type: "choice",
        text: "You write: SELECT price * 0.8 AS sale_price FROM products WHERE sale_price < 50. What happens?",
        options: [
          "Returns products where the 20%-off price is under $50",
          "Error or no results — WHERE runs before SELECT, so sale_price doesn't exist yet",
          "Returns all products",
          "Returns products where price < 50",
        ],
        answer:
          "Error or no results — WHERE runs before SELECT, so sale_price doesn't exist yet",
      },
      {
        id: "sql1-002-q2",
        type: "choice",
        text: "SELECT * FROM orders LIMIT 10 (with no ORDER BY) — what do you get?",
        options: [
          "The 10 oldest orders, by insertion order",
          "The 10 smallest orders",
          "10 arbitrary rows — the database chooses, with no guarantee of order",
          "An error — LIMIT requires ORDER BY",
        ],
        answer:
          "10 arbitrary rows — the database chooses, with no guarantee of order",
      },
      {
        id: "sql1-002-q3",
        type: "choice",
        text: "A customers table has some NULL in the state column. You run: WHERE state NOT IN ('CA', 'NY'). What rows does David (state=NULL) get?",
        options: [
          "David is included — NULL is not CA or NY",
          "David is excluded — NULL comparisons evaluate to NULL, which WHERE treats as FALSE",
          "David is included only if COALESCE is used",
          "An error is thrown",
        ],
        answer:
          "David is excluded — NULL comparisons evaluate to NULL, which WHERE treats as FALSE",
      },
    ],
  },

  mentalModel: [
    "SQL executes: FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT",
    "You cannot use SELECT aliases in WHERE — WHERE runs first",
    "LIMIT without ORDER BY returns arbitrary rows — tables are unordered sets",
    "NULL comparisons always produce NULL — use IS NULL / IS NOT NULL",
    "NOT IN with a NULL in the list silently excludes NULL rows",
  ],
};
