export default {
  id: "sql1-005",
  slug: "indexes-and-query-performance",
  chapter: "sql-1",
  order: 5,
  title: "Indexes & Query Performance",
  subtitle:
    "Why the same query can take 50ms or 50 seconds — and how to fix it",
  tags: [
    "indexes",
    "B-tree",
    "query planner",
    "EXPLAIN",
    "full table scan",
    "composite index",
    "covering index",
    "selectivity",
  ],
  aliases:
    "index btree query plan explain analyze full table scan performance optimization slow query composite covering",

  hook: {
    question:
      "Your app works perfectly in development with 100 rows. It falls over in production with 10 million rows. The query hasn't changed. Why?",
    realWorldContext:
      "Missing indexes are the number one cause of database performance problems in production. " +
      "A query that takes 50ms at 10,000 rows takes 500 seconds at 100,000,000 rows — " +
      "if it's doing a full table scan. An index makes the same query run in 2ms regardless of table size. " +
      "Every engineer who works with databases needs to understand what indexes are, " +
      "when the planner uses them, and when they actually hurt more than they help.",
    previewVisualizationId: "PythonNotebook",
  },

  intuition: {
    prose: [
      "**A full table scan is O(n).** Without an index, the database reads every single row to find the ones matching your WHERE clause. For 1 million rows, that's 1 million disk reads per query. For 1 billion rows, it's 1 billion. This is why small tables feel fast — the scan is short. It's not because the query is efficient.",
      "**An index is a sorted copy of a column.** More precisely, a B-tree index maintains a sorted data structure that maps column values to the physical locations (row IDs) of matching rows. Finding a value in a B-tree is O(log n). For 1 billion rows, O(log₂(10⁹)) ≈ 30 comparisons. That's the difference between 50ms and 500 seconds.",
      "**The B-tree structure.** A B-tree (Balanced Tree) is a self-balancing search tree where every leaf is the same depth. Lookups, insertions, and deletions are all O(log n). Most databases also support Hash indexes (O(1) equality lookup, no range support) and GiST/GIN indexes for special types (full-text, JSON, geometric data).",
      "**When indexes hurt.** Indexes are not free. Every INSERT, UPDATE, and DELETE must also update every index on that table. A table with 20 indexes has 20 B-trees to maintain on every write. For write-heavy tables (logging, event streams), fewer indexes = faster writes. You are always trading write performance for read performance.",
      "**The query planner decides.** You do not directly control which index is used — the database's query planner decides based on table statistics (row counts, value distributions). `EXPLAIN` shows you what the planner chose. If the planner ignores your index, there's a reason (usually the query isn't selective enough, or statistics are stale).",
    ],
    callouts: [
      {
        type: "definition",
        title: "Types of Indexes",
        body: "**B-tree (default):** Handles =, <, >, BETWEEN, LIKE 'prefix%'\n**Hash:** Handles = only (faster for equality, no range support)\n**GiST/GIN (PostgreSQL):** Full-text search, arrays, JSON, geometric\n**Composite:** Index on multiple columns — column order matters\n**Covering:** Index includes all columns the query needs — no table lookup required",
      },
      {
        type: "warning",
        title: "Index does not help with LIKE '%suffix' or functions",
        body: "`WHERE name LIKE '%son'` — cannot use a B-tree index (pattern starts with wildcard)\n`WHERE UPPER(name) = 'ALICE'` — cannot use index on `name` (function wraps it)\n`WHERE YEAR(created_at) = 2024` — cannot use index on `created_at`\n\nFix: `WHERE name LIKE 'Alice%'` (prefix only), or create a functional index in PostgreSQL.",
      },
      {
        type: "insight",
        title: "Primary keys are always indexed",
        body: "A primary key automatically creates an index. Foreign keys do NOT automatically create an index (in most databases). Always index foreign key columns you join on — missing FK indexes are a very common performance problem.",
      },
      {
        type: "insight",
        title: "Composite index column order matters",
        body: "A composite index on (state, quarter) can serve queries on: (state, quarter), (state alone). It CANNOT efficiently serve queries on (quarter alone) — the index is sorted by state first. Put the most selective column, or the column you filter most often, first.",
      },
    ],
    visualizations: [
      {
        id: "PythonNotebook",
        title: "Indexes & Query Performance",
        mathBridge:
          "B-tree lookup: O(log n) comparisons. Full table scan: O(n) reads. For n=10⁶: log₂(10⁶)≈20 comparisons vs 1,000,000 reads. At 1μs per read, that's 20μs vs 1,000,000μs = 50,000x speedup.",
        caption:
          "Generate a large table and measure the actual timing difference between indexed and non-indexed queries. Then use EXPLAIN QUERY PLAN to understand what the planner does.",
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: "Generate a large table",
              prose: [
                "## Create 100,000 rows to make index timing measurable",
                "We use Python to generate realistic data then measure raw query times.",
              ],
              code: `import sqlite3, time, random

random.seed(42)
conn = sqlite3.connect(":memory:")
cur = conn.cursor()

# Create a table WITHOUT any indexes (beyond the implicit PK)
cur.execute("""
    CREATE TABLE events (
        id          INTEGER PRIMARY KEY,
        user_id     INTEGER NOT NULL,
        event_type  TEXT    NOT NULL,
        country     TEXT    NOT NULL,
        amount      REAL,
        created_at  TEXT    NOT NULL
    )
""")

# Generate 100,000 rows
countries = ['US','CA','GB','DE','FR','JP','AU','BR','IN','MX']
events    = ['purchase','view','click','signup','cancel']
rows = [
    (i,
     random.randint(1, 10000),
     random.choice(events),
     random.choice(countries),
     round(random.uniform(1, 1000), 2) if random.random() > 0.3 else None,
     f"2024-{random.randint(1,12):02d}-{random.randint(1,28):02d}")
    for i in range(1, 100_001)
]
cur.executemany("INSERT INTO events VALUES (?,?,?,?,?,?)", rows)
conn.commit()

cur.execute("SELECT COUNT(*) FROM events")
print(f"Rows: {cur.fetchone()[0]:,}")
print("No indexes yet (except the automatic PK index on 'id')")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: "Timing: no index vs. indexed",
              prose: [
                "## Measure the speedup",
                "We time the same query before and after creating an index. The difference is the cost of a full table scan.",
              ],
              code: `def time_query(label, sql, params=()):
    t0 = time.perf_counter()
    cur.execute(sql, params)
    results = cur.fetchall()
    elapsed = (time.perf_counter() - t0) * 1000
    print(f"{label:<35} {elapsed:>8.3f}ms  ({len(results)} rows)")
    return elapsed

print("=== WITHOUT INDEX ===")
t_no_idx = time_query(
    "user_id = 42",
    "SELECT * FROM events WHERE user_id = ?", (42,)
)
t_no_idx2 = time_query(
    "country='US' AND event_type='purchase'",
    "SELECT * FROM events WHERE country=? AND event_type=?", ('US','purchase')
)

print()
print("Creating index on user_id...")
cur.execute("CREATE INDEX idx_events_user_id ON events(user_id)")

print("Creating composite index on (country, event_type)...")
cur.execute("CREATE INDEX idx_events_country_type ON events(country, event_type)")
conn.commit()

print()
print("=== WITH INDEX ===")
t_idx = time_query(
    "user_id = 42",
    "SELECT * FROM events WHERE user_id = ?", (42,)
)
t_idx2 = time_query(
    "country='US' AND event_type='purchase'",
    "SELECT * FROM events WHERE country=? AND event_type=?", ('US','purchase')
)

print()
print(f"Speedup (user_id):       {t_no_idx / max(t_idx, 0.001):.0f}x")
print(f"Speedup (country+type):  {t_no_idx2 / max(t_idx2, 0.001):.0f}x")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: "EXPLAIN QUERY PLAN",
              prose: [
                "## Reading the query planner's decision",
                "`EXPLAIN QUERY PLAN` shows you what the database decided to do — scan the table, use an index, etc. This is how you diagnose slow queries.",
              ],
              code: `# EXPLAIN QUERY PLAN shows the planner's strategy
print("=== Full table scan (no index for 'amount') ===")
cur.execute("EXPLAIN QUERY PLAN SELECT * FROM events WHERE amount > 500")
for row in cur.fetchall():
    print(" ", row)

print()
print("=== Index scan (user_id has an index) ===")
cur.execute("EXPLAIN QUERY PLAN SELECT * FROM events WHERE user_id = 42")
for row in cur.fetchall():
    print(" ", row)

print()
print("=== Composite index (country + event_type) ===")
cur.execute("EXPLAIN QUERY PLAN SELECT * FROM events WHERE country='US' AND event_type='purchase'")
for row in cur.fetchall():
    print(" ", row)

print()
print("=== Right column only — composite index may not help ===")
# This only uses event_type — but the composite index is (country, event_type)
# SQLite may or may not use it depending on selectivity
cur.execute("EXPLAIN QUERY PLAN SELECT * FROM events WHERE event_type='purchase'")
for row in cur.fetchall():
    print(" ", row)

print()
print("Key terms in EXPLAIN output:")
print("  SCAN TABLE   → full table scan (slow for large tables)")
print("  SEARCH TABLE USING INDEX → B-tree lookup (fast)")
print("  USING COVERING INDEX → index has all needed columns, no table access needed")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 4,
              cellTitle: "When indexes hurt: write overhead",
              prose: [
                "## The cost of maintaining indexes",
                "Every write operation must update all indexes. More indexes = slower writes.",
              ],
              code: `# Measure write performance with vs without many indexes

# How many indexes do we currently have?
cur.execute("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='events'")
indexes = cur.fetchall()
print(f"Current indexes on events: {[i[0] for i in indexes]}")

# Time inserting 10,000 rows with existing indexes
t0 = time.perf_counter()
new_rows = [
    (100_001 + i, random.randint(1,10000), random.choice(events),
     random.choice(countries), round(random.uniform(1,1000),2), '2024-06-01')
    for i in range(10_000)
]
cur.executemany("INSERT INTO events VALUES (?,?,?,?,?,?)", new_rows)
conn.commit()
t_with_idx = (time.perf_counter() - t0) * 1000

# Now add 5 more indexes (simulating an over-indexed table)
for col in ['event_type', 'country', 'amount', 'created_at']:
    try:
        cur.execute(f"CREATE INDEX idx_events_{col} ON events({col})")
    except Exception:
        pass
conn.commit()

cur.execute("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='events'")
print(f"After adding more indexes: {[i[0] for i in cur.fetchall()]}")

t0 = time.perf_counter()
more_rows = [
    (200_001 + i, random.randint(1,10000), random.choice(events),
     random.choice(countries), round(random.uniform(1,1000),2), '2024-07-01')
    for i in range(10_000)
]
cur.executemany("INSERT INTO events VALUES (?,?,?,?,?,?)", more_rows)
conn.commit()
t_many_idx = (time.perf_counter() - t0) * 1000

print(f"\\nInsert 10,000 rows with 2 indexes:  {t_with_idx:.1f}ms")
print(f"Insert 10,000 rows with 6 indexes:  {t_many_idx:.1f}ms")
print(f"Overhead: {t_many_idx/t_with_idx:.1f}x slower")
print("\\nRule: index reads you need, remove indexes you don't use.")`,
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
      "**B-tree properties.** A B-tree of order m has: every node with at most m children, every non-root node with at least ⌈m/2⌉ children, all leaves at the same depth. For a disk-based B-tree with block size 8KB and 8-byte keys, a single node holds hundreds of keys. The tree is extremely shallow — a 3-level tree can index billions of rows.",
      '**Selectivity.** An index is only useful if it is selective — if the indexed column has many distinct values relative to table size. An index on a `gender` column with 3 values is rarely useful for a 10M-row table — the planner will do a full scan anyway because each "match" is 3.3M rows and reading the index first adds overhead. An index on `user_id` with 10M distinct values is highly selective.',
      "**Statistics and the planner.** The query planner uses table statistics (stored in the catalog) to estimate how many rows a condition will return. Stale statistics (after large bulk inserts) cause the planner to make wrong decisions. Run `ANALYZE` (PostgreSQL, SQLite) or `UPDATE STATISTICS` (SQL Server) to refresh them.",
    ],
  },

  examples: [
    {
      id: "sql1-005-ex1",
      title: "Composite Index Design",
      problem:
        "You have queries: (1) WHERE user_id = ? (2) WHERE user_id = ? AND event_type = ? (3) WHERE event_type = ? — what indexes do you create?",
      steps: [
        {
          expression: "CREATE INDEX ON events(user_id)",
          annotation: "Serves query 1 directly",
        },
        {
          expression: "CREATE INDEX ON events(user_id, event_type)",
          annotation:
            "Serves query 2 — also serves query 1 (uses leftmost prefix)",
        },
        {
          expression: "Drop the single-column user_id index",
          annotation: "The composite index covers it",
        },
        {
          expression: "CREATE INDEX ON events(event_type)",
          annotation:
            "Serves query 3 — composite index (user_id, event_type) cannot serve event_type-only queries",
        },
      ],
      conclusion:
        "Two indexes (user_id, event_type) and (event_type) cover all three queries. Design for your actual query patterns, not for all possible queries.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql1-005-q1",
        type: "choice",
        text: 'EXPLAIN QUERY PLAN shows "SCAN TABLE events". This means:',
        options: [
          "The query is using an efficient index scan",
          "The database is reading every row in the table to find matches",
          "The query has a syntax error",
          "The table has no rows",
        ],
        answer:
          "The database is reading every row in the table to find matches",
      },
      {
        id: "sql1-005-q2",
        type: "choice",
        text: "You have a composite index on (country, event_type). Which query CAN use it efficiently?",
        options: [
          "WHERE event_type = 'purchase' (event_type alone)",
          "WHERE country = 'US' AND event_type = 'purchase'",
          "WHERE UPPER(country) = 'US'",
          "WHERE country LIKE '%S'",
        ],
        answer: "WHERE country = 'US' AND event_type = 'purchase'",
      },
      {
        id: "sql1-005-q3",
        type: "choice",
        text: "Adding 10 indexes to a write-heavy log table will:",
        options: [
          "Speed up both reads and writes",
          "Speed up reads but slow down writes — every INSERT must update all 10 indexes",
          "Have no effect on write performance",
          "Cause the database to refuse inserts",
        ],
        answer:
          "Speed up reads but slow down writes — every INSERT must update all 10 indexes",
      },
    ],
  },

  mentalModel: [
    "No index = full table scan = O(n) — works fine at 1,000 rows, catastrophic at 100,000,000",
    "B-tree index = O(log n) lookup — fast regardless of table size",
    "Indexes cost write performance — every INSERT/UPDATE/DELETE maintains all indexes",
    "EXPLAIN QUERY PLAN shows what the planner chose — use it for every slow query",
    "Composite index (a, b) helps: WHERE a=? AND b=?, WHERE a=?. Does NOT help: WHERE b=? alone",
  ],
};
