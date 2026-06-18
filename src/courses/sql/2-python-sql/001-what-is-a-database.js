export default {
  id: "sql1-001",
  slug: "what-is-a-database",
  chapter: "sql-1",
  order: 1,
  title: "What Is a Database?",
  subtitle:
    "Why files aren't enough — and what the relational model actually gives you",
  tags: [
    "relational model",
    "tables",
    "primary key",
    "schema",
    "sqlite3",
    "RDBMS",
    "null",
    "data types",
  ],
  aliases:
    "database table row column schema primary key foreign key relational model sqlite postgresql mysql",

  hook: {
    question:
      "You have 10 million orders stored in a CSV file. How do you find every order over $500 placed in Q4 by a customer in California — in under 50 milliseconds?",
    realWorldContext:
      "Every application you have ever used stores its data in a database. Your bank balance, your GitHub commits, " +
      "your Spotify playlists, every Stack Overflow answer — all of it lives in tables with rows and columns. " +
      'Databases are not just "fancy files". They enforce rules, answer complex questions instantly, and guarantee ' +
      "that two people writing at the same moment can't corrupt each other's data. " +
      "Understanding databases at this level is what separates engineers who can build production systems " +
      "from engineers who can only follow tutorials.",
    previewVisualizationId: "PythonNotebook",
  },

  intuition: {
    prose: [
      "**Before databases: the file problem.** Imagine you store your app's data in plain text files — one file per table, rows separated by newlines. This works for toy projects. It falls apart the moment two users write simultaneously (race condition → corrupted file), you need to search (read the whole file every time), you need to link data across files (manually join with loops), or you crash mid-write (half-written data forever).",
      '**The relational model** (E.F. Codd, 1970) solved all of this with a deceptively simple idea: store data as *relations* — tables where every row represents one fact about one thing, and every column represents one attribute of that thing. The word "relational" does NOT mean "tables are related to each other" (a common mistake) — it comes from the mathematical concept of a *relation* (a set of tuples).',
      "**Three rules that make it work.** (1) Each table has a *schema* — a fixed list of columns with types. The database rejects anything that doesn't fit. (2) Each row has a *primary key* — a column or combination of columns guaranteed to be unique. No two rows can represent the same fact. (3) Rows in one table can *reference* rows in another via a *foreign key* — that's how you link customers to orders without duplicating data.",
      "**SQL** (Structured Query Language) is the language you use to talk to a relational database. It is *declarative*: you describe *what* you want, not *how* to compute it. The database figures out the most efficient plan. This is a profound engineering idea — the same query runs correctly on 1,000 rows and 1,000,000,000 rows (performance changes, but correctness doesn't).",
    ],
    callouts: [
      {
        type: "definition",
        title: "Key Terms",
        body: "**Table (Relation):** A named set of rows, all having the same columns.\n**Row (Tuple/Record):** One instance — one customer, one order, one event.\n**Column (Attribute/Field):** One property of every row in that table.\n**Schema:** The definition of a table — column names, types, constraints.\n**Primary Key:** A column (or group) that uniquely identifies each row.\n**Foreign Key:** A column that references the primary key of another table.\n**NULL:** The absence of a value. Not zero, not empty string — genuinely unknown.",
      },
      {
        type: "warning",
        title: "NULL is not zero and not empty string",
        body: 'NULL means "this value is unknown or not applicable". In SQL, `NULL = NULL` evaluates to NULL (not TRUE). To check for null you must use `IS NULL` or `IS NOT NULL`. This trips up every developer at least once — and causes real bugs in production.',
      },
      {
        type: "insight",
        title: "Why Python sqlite3?",
        body: "Python ships with `sqlite3` in its standard library — no install needed. SQLite runs entirely in-process with no server, making it perfect for learning. The SQL you learn here is ~95% identical to PostgreSQL, MySQL, and every other major database. Differences are called out when they matter.",
      },
      {
        type: "insight",
        title: 'The "relational" in relational database',
        body: '"Relational" comes from *relation* in mathematics — a set of tuples (rows) with named attributes (columns). It does NOT primarily mean "tables are related to each other", though that is also true. The mathematical foundation means database behavior is provably correct and consistent.',
      },
    ],
    visualizations: [
      {
        id: "PythonNotebook",
        title: "The Relational Model — First Principles",
        mathBridge:
          "A table is a relation R ⊆ D₁ × D₂ × … × Dₙ where each Dᵢ is the domain (type) of column i. A primary key is a minimal set of columns whose values uniquely identify every row.",
        caption:
          "Run each cell in sequence. By the end you will have created a real relational database, inserted data, and queried it — entirely in memory using Python's built-in sqlite3 module.",
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: "Before databases: the CSV problem",
              prose: [
                "## Why files fail at scale",
                'Before we use a database, let\'s see exactly what goes wrong with plain files. This cell simulates loading data from a CSV and doing a simple "query" manually.',
              ],
              code: `# Imagine your "database" is just a list of dicts (like a CSV loaded into memory)
orders_csv = [
    {"id": 1, "customer": "Alice", "amount": 120.00, "state": "CA", "quarter": 4},
    {"id": 2, "customer": "Bob",   "amount": 850.00, "state": "NY", "quarter": 4},
    {"id": 3, "customer": "Alice", "amount": 620.00, "state": "CA", "quarter": 4},
    {"id": 4, "customer": "Carol", "amount": 90.00,  "state": "CA", "quarter": 3},
    {"id": 5, "customer": "Bob",   "amount": 510.00, "state": "CA", "quarter": 4},
]

# "Query": find Q4 orders > $500 from CA
# You must scan EVERY row — O(n). No shortcuts.
results = [
    o for o in orders_csv
    if o["amount"] > 500 and o["state"] == "CA" and o["quarter"] == 4
]

for r in results:
    print(f"Order #{r['id']}: {r['customer']} — \${r['amount']}")

print(f"\\nScanned {len(orders_csv)} rows to find {len(results)} results.")
print("At 10 million rows, this takes seconds. A database with an index takes milliseconds.")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: "Creating your first database",
              prose: [
                "## sqlite3: a real SQL database in your Python process",
                '`sqlite3.connect(":memory:")` creates a full relational database that lives entirely in RAM — no files, no server. When the process exits, the database is gone. Perfect for learning.',
                "We use `cursor.execute()` to send SQL commands. `CREATE TABLE` defines a *schema* — the contract every row must satisfy.",
              ],
              code: `import sqlite3

# Create an in-memory database — full SQL engine, no files, no server
conn = sqlite3.connect(":memory:")
cursor = conn.cursor()

# CREATE TABLE defines the schema: column names and their types
# SQL types: INTEGER, REAL, TEXT, BLOB, NULL
cursor.execute("""
    CREATE TABLE customers (
        id       INTEGER PRIMARY KEY,   -- unique identifier, auto-increments
        name     TEXT    NOT NULL,      -- cannot be NULL
        email    TEXT    UNIQUE,        -- no two rows can have the same email
        state    TEXT,
        joined   TEXT                   -- ISO date string: '2024-01-15'
    )
""")

cursor.execute("""
    CREATE TABLE orders (
        id          INTEGER PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id),  -- foreign key
        amount      REAL    NOT NULL CHECK (amount > 0),        -- must be positive
        quarter     INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
        created_at  TEXT    NOT NULL
    )
""")

conn.commit()
print("Tables created. The schema is now enforced — the database will reject invalid data.")
print()

# Try to break the schema
try:
    cursor.execute("INSERT INTO orders VALUES (1, 999, -50.00, 5, '2024-01-01')")
except sqlite3.IntegrityError as e:
    print(f"Schema enforcement caught a bad row: {e}")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: "Inserting rows and understanding NULL",
              prose: [
                "## Populating the tables",
                "Notice that `state` is optional — we allow NULL for customers whose state we don't know. Watch how NULL behaves differently from empty string or zero.",
              ],
              code: `# Insert customers
cursor.executemany("""
    INSERT INTO customers (id, name, email, state, joined) VALUES (?, ?, ?, ?, ?)
""", [
    (1, "Alice Chen",    "alice@example.com",  "CA", "2022-03-10"),
    (2, "Bob Torres",    "bob@example.com",    "NY", "2023-07-01"),
    (3, "Carol Kim",     "carol@example.com",  "CA", "2021-11-20"),
    (4, "David Patel",   "david@example.com",  None, "2024-01-05"),  # state unknown = NULL
    (5, "Eve Johnson",   "eve@example.com",    "TX", "2023-04-15"),
])

# Insert orders
cursor.executemany("""
    INSERT INTO orders (id, customer_id, amount, quarter, created_at) VALUES (?, ?, ?, ?, ?)
""", [
    (1,  1, 120.00, 4, "2024-10-05"),
    (2,  2, 850.00, 4, "2024-11-12"),
    (3,  1, 620.00, 4, "2024-12-01"),
    (4,  3, 90.00,  3, "2024-09-20"),
    (5,  2, 510.00, 4, "2024-10-30"),
    (6,  3, 750.00, 4, "2024-11-08"),
    (7,  4, 300.00, 4, "2024-12-15"),
    (8,  5, 180.00, 1, "2024-01-22"),
])
conn.commit()

# NULL comparison trap — this is a common bug
cursor.execute("SELECT name, state FROM customers WHERE state = NULL")
print("WHERE state = NULL:", cursor.fetchall())   # Empty! NULL = NULL is NULL, not TRUE

cursor.execute("SELECT name, state FROM customers WHERE state IS NULL")
print("WHERE state IS NULL:", cursor.fetchall())  # Correct way to find NULLs

print()
print("NULL = NULL  →  NULL (not TRUE)")
print("NULL IS NULL →  TRUE")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 4,
              cellTitle: "Your first real query",
              prose: [
                "## SELECT — asking the database a question",
                "Now the payoff: we ask the same question we struggled with in the CSV version. The database's query planner finds the answer optimally.",
              ],
              code: `# The same query that required a full scan on CSV —
# a real database can use indexes to answer this in O(log n)

cursor.execute("""
    SELECT c.name, o.amount, o.quarter
    FROM   orders o
    JOIN   customers c ON c.id = o.customer_id
    WHERE  o.amount > 500
      AND  c.state = 'CA'
      AND  o.quarter = 4
    ORDER  BY o.amount DESC
""")

rows = cursor.fetchall()
print(f"{'Customer':<15} {'Amount':>10} {'Q':>3}")
print("-" * 30)
for name, amount, quarter in rows:
    print(f"{name:<15} \${amount:>9.2f} {quarter:>3}")

print(f"\\nFound {len(rows)} matching orders")
print("\\nKey insight: you described WHAT you wanted.")
print("The database decided HOW to find it efficiently.")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 5,
              cellTitle: "Schema inspection",
              prose: [
                "## Inspecting the schema",
                "SQLite stores its own schema in a special table called `sqlite_master`. Every relational database has a similar system catalog. This is how database tools like DBeaver or pgAdmin know what tables exist.",
              ],
              code: `# SQLite stores its schema in sqlite_master
cursor.execute("SELECT name, type, sql FROM sqlite_master ORDER BY type, name")
for name, kind, ddl in cursor.fetchall():
    print(f"[{kind.upper()}] {name}")
    if ddl:
        # Print the CREATE statement that defines this object
        for line in ddl.strip().split('\\n'):
            print(f"   {line}")
    print()

print("This is the 'data dictionary' — the database's memory of its own structure.")
print("In PostgreSQL this is called the 'information_schema'.")
print("Every production database has one.")`,
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
      "**The relational model is mathematical.** E.F. Codd's 1970 paper \"A Relational Model of Data for Large Shared Data Banks\" defined tables as *relations* — subsets of the Cartesian product of their column domains. This means SQL's behavior is provable, not just conventional.",
      "**SQL is declarative by design.** In procedural code (Python, C, Java), you describe *how* to compute something step by step. SQL describes *what* you want. The database's *query optimizer* translates your declaration into an efficient execution plan. The same SQL query may execute differently on different data sizes — the optimizer chooses the plan.",
      '**NULL propagation.** Any arithmetic or comparison involving NULL produces NULL. This is called "three-valued logic" (TRUE, FALSE, NULL). It is formally correct but practically treacherous. `NULL + 1 = NULL`, `NULL > 0 = NULL`, `NULL = NULL = NULL`. The only safe NULL checks are `IS NULL` and `IS NOT NULL`.',
    ],
  },

  examples: [
    {
      id: "sql1-001-ex1",
      title: "Schema Design: One Fact, One Table",
      problem:
        "You need to store blog posts with authors. What tables do you need?",
      code: `-- Good: each table stores facts about ONE type of thing
CREATE TABLE authors (
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    bio  TEXT
);

CREATE TABLE posts (
    id        INTEGER PRIMARY KEY,
    author_id INTEGER REFERENCES authors(id),
    title     TEXT NOT NULL,
    body      TEXT,
    published TEXT
);

-- Bad alternative: store author name in every post row
-- CREATE TABLE posts_bad (
--     id          INTEGER PRIMARY KEY,
--     author_name TEXT,   ← duplicated everywhere
--     author_bio  TEXT,   ← update one = update all rows
--     title       TEXT,
--     ...
-- )`,
      steps: [
        {
          expression: "One table per entity type",
          annotation: "customers, orders, products — not one giant table",
        },
        {
          expression: "Link with foreign keys",
          annotation: "orders.customer_id → customers.id",
        },
        {
          expression: "Each fact stored once",
          annotation: "change customer name in one place, all orders see it",
        },
      ],
      conclusion:
        "This is the first normal form principle: eliminate repeating groups and redundant data.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql1-001-q1",
        type: "choice",
        text: "What does `WHERE state = NULL` return when some rows have a NULL state?",
        options: [
          "All rows where state is NULL",
          "An error — invalid SQL",
          "No rows — NULL comparisons always evaluate to NULL, not TRUE",
          "All rows in the table",
        ],
        answer: "No rows — NULL comparisons always evaluate to NULL, not TRUE",
      },
      {
        id: "sql1-001-q2",
        type: "choice",
        text: 'The "relational" in relational database refers to:',
        options: [
          "The fact that tables are related to each other via foreign keys",
          "The mathematical concept of a relation — a set of tuples with named attributes",
          "The relationship between the developer and the data",
          "Edgar Codd's last name",
        ],
        answer:
          "The mathematical concept of a relation — a set of tuples with named attributes",
      },
      {
        id: "sql1-001-q3",
        type: "choice",
        text: 'SQL is "declarative". This means:',
        options: [
          "You declare variable types before using them",
          "You describe WHAT data you want; the database decides HOW to retrieve it",
          "You must declare every table before querying it",
          "SQL was declared the official database language by ISO in 1987",
        ],
        answer:
          "You describe WHAT data you want; the database decides HOW to retrieve it",
      },
    ],
  },

  mentalModel: [
    "A table is a set of facts about ONE type of thing — not a spreadsheet",
    "Each row is uniquely identified by its primary key",
    "NULL means unknown — it is not zero, not empty, and never equals anything",
    "SQL is declarative: describe WHAT, let the database figure out HOW",
    "Foreign keys link tables without duplicating data",
  ],
};
