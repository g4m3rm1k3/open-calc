# Drill 2.5 — Indexes and Query Performance

**Standalone drill. No prerequisites except basic Python and SQL.**
**Time estimate:** 60–75 minutes
**Environment:** Python 3.8+ with sqlite3 (built-in — no install needed)
**What you will build:** A 100,000-row SQLite database. Benchmark a slow query, read the query plan, add the right index, benchmark again, verify the plan changed
**What you will understand:** What a database index actually is, why queries are slow without one, and how to design indexes that match your queries

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. You have a table with 100,000 rows. `SELECT * FROM orders WHERE customer_id = 42` has no index on `customer_id`. How many rows does the database read to answer this query?

2. A B-tree index on `customer_id` is sorted. If there are 100,000 rows and you search for `customer_id = 42`, roughly how many comparisons does the database make? What is the algorithmic complexity?

3. You create an index on `(last_name, first_name)`. Does `WHERE first_name = 'Alice'` use this index? Does `WHERE last_name = 'Smith'` use it?

4. Every INSERT and UPDATE on an indexed table must also update the index. For a table with 10 indexes that receives 10,000 inserts per second, what is the cost of those indexes?

*(Answers at the bottom.)*

---

## The Concept: Why Queries Are Slow

### Concept: Full Table Scan vs Index Lookup

**What it is:**
When you query a database without an index on the filter column, the database reads every single row to find matches. With a B-tree index, it jumps directly to the matching rows in O(log n) time.

**The problem — full table scan:**

```sql
SELECT * FROM orders WHERE customer_id = 42
```

Without an index, the database engine executes:
```
Read row 1  → customer_id = 891 → not 42, skip
Read row 2  → customer_id = 103 → not 42, skip
Read row 3  → customer_id = 42  → match, include
...
Read row 100,000 → done
```

Every query reads every row. With 100,000 rows, that's 100,000 disk reads. With 1,000,000 rows, it's 1,000,000 reads. The cost grows linearly with the table size — O(n).

**The solution — B-tree index:**
A B-tree index is a separate data structure maintained by the database alongside the table. It stores `(customer_id value → row location)` in a balanced binary search tree. The tree is sorted. To find `customer_id = 42`:

```
Root node: is 42 < 50000? Yes → go left
Level 2:   is 42 < 250?   Yes → go left
Level 3:   is 42 < 100?   Yes → go left
Level 4:   is 42 < 50?    Yes → go left
Level 5:   is 42 = 42?    Yes → here are the row locations
```

With 100,000 rows, a balanced B-tree has height ≈ log₂(100,000) ≈ 17. The database makes at most 17 comparisons to find the match — instead of 100,000. The cost is O(log n).

**What it hides:**
The B-tree structure, the page layout on disk, the buffer pool (pages cached in RAM), and the index maintenance on writes. The database manages all of this transparently. You create an index with one SQL statement; the database handles the rest.

**Canonical example:**
A phone book. Without an index, finding "Smith, Alice" requires reading every entry (full table scan). With a phone book sorted by last name, you open to approximately the right section (B-tree traversal) and find the entry in seconds. The phone book IS an index — it trades extra storage and extra work on update (re-printing the book) for fast lookups.

**Constraints:**
- Indexes cost storage — each index is roughly the same size as the data it indexes
- Indexes cost write performance — every INSERT, UPDATE, and DELETE must also update the index
- An index on a column with few distinct values (like a boolean `is_deleted`) is often useless — a full scan is faster than following index pointers for 50% of the table
- The query must filter on the leading columns of a composite index for the index to be used

**Failure modes:**
- Creating an index on a low-cardinality column (few distinct values): the optimizer may ignore it and do a full scan anyway
- Composite index column order mismatch: `INDEX ON (a, b)` is used for `WHERE a = 1` but NOT for `WHERE b = 1` (unless the optimizer is smart enough to do an index skip scan)
- Index fragmentation over time: after many inserts and deletes, the B-tree becomes unbalanced. `REINDEX` or `VACUUM` repairs it.
- The N+1 query problem: selecting N objects and then querying each one individually — 1 query returns N IDs, then N queries fetch each. An index helps each individual query but not the architectural problem.

**Operational reality:**
Missing indexes are the #1 cause of database performance crises in production. An app runs fine at 1,000 rows, hits slowness at 100,000, and becomes unusable at 1,000,000 — all because the query plan changed from a fast index lookup to a full table scan once the table grew past the optimizer's threshold. `EXPLAIN QUERY PLAN` (SQLite) or `EXPLAIN ANALYZE` (PostgreSQL) shows you which path the optimizer chose. Add this to your debugging toolkit.

**You will see this again in:**
Every database you ever use. SQLite, PostgreSQL, MySQL, MongoDB (called an index there too), Redis (sorted sets are B-trees). The concept transfers exactly — the SQL syntax for creating indexes is nearly identical across all of them.

**Watch for:**
`EXPLAIN QUERY PLAN` output contains `SCAN TABLE` (bad — full scan) or `SEARCH TABLE USING INDEX` (good — index used). Learn to read it before you tune anything.

---

## Step 1 — Create the Test Database

Create `indexes.py`:

```python
# indexes.py — demonstrate index performance with SQLite
import sqlite3
import time
import random

# ── Create and populate a 100,000-row table ───────────────────────────────────

def create_database(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    # isolation_level=None: autocommit — each statement commits immediately
    # We disable this to batch inserts inside one transaction (100x faster)
    conn.execute("PRAGMA journal_mode=WAL")
    # WAL (Write-Ahead Log): faster writes for read-heavy workloads
    # The default journal mode (DELETE) is slower for concurrent access

    conn.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id          INTEGER PRIMARY KEY,  -- INTEGER PRIMARY KEY is automatically indexed
            customer_id INTEGER NOT NULL,     -- NOT NULL: the optimizer can skip null checks
            product_id  INTEGER NOT NULL,
            amount      REAL    NOT NULL,
            status      TEXT    NOT NULL,
            created_at  TEXT    NOT NULL
        )
    """)

    return conn


def populate_database(conn: sqlite3.Connection, row_count: int = 100_000) -> None:
    print(f"Inserting {row_count:,} rows...")

    statuses = ["pending", "shipped", "delivered", "cancelled"]
    rows = []
    for i in range(row_count):
        rows.append((
            random.randint(1, 1_000),         # customer_id: 1000 distinct customers
            random.randint(1, 500),            # product_id: 500 distinct products
            round(random.uniform(1.0, 999.0), 2),  # amount
            random.choice(statuses),           # status
            f"2026-{random.randint(1,12):02d}-{random.randint(1,28):02d}",  # created_at
        ))

    # Insert all rows in one transaction — wrapping in BEGIN/COMMIT is ~100x faster
    # than auto-committing each row (because each commit flushes to disk)
    conn.executemany(
        "INSERT INTO orders (customer_id, product_id, amount, status, created_at) VALUES (?,?,?,?,?)",
        rows
    )
    conn.commit()
    print(f"Inserted {row_count:,} rows.\n")


# ── Benchmarking utility ───────────────────────────────────────────────────────

def benchmark_query(conn: sqlite3.Connection, query: str, params: tuple = (), label: str = "") -> float:
    """Run a query 5 times and return the average execution time in milliseconds."""
    times = []
    for _ in range(5):
        start = time.perf_counter()
        cursor = conn.execute(query, params)
        rows = cursor.fetchall()   # force the query to actually execute (lazy cursors)
        elapsed = (time.perf_counter() - start) * 1000  # convert to ms
        times.append(elapsed)

    avg_ms = sum(times) / len(times)
    print(f"{label}: {avg_ms:.2f}ms avg (returned {len(rows)} rows)")
    return avg_ms


# ── Main: run everything ───────────────────────────────────────────────────────

conn = create_database("orders.db")

# Check if we need to populate (skip if already done)
row_count = conn.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
if row_count == 0:
    populate_database(conn, 100_000)
else:
    print(f"Database already has {row_count:,} rows — skipping insert.\n")

# Show the query plan BEFORE adding any index
print("=== QUERY PLAN (no index) ===")
plan = conn.execute("EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 42").fetchall()
for row in plan:
    print(" ", row)
# Look for "SCAN TABLE orders" — this means full table scan
print()

# Benchmark the slow query
print("=== BENCHMARKS (no index) ===")
t1 = benchmark_query(conn, "SELECT * FROM orders WHERE customer_id = 42", label="  customer_id=42")
t2 = benchmark_query(conn, "SELECT * FROM orders WHERE status = 'pending'", label="  status=pending")
print()

conn.close()
```

### SAVE AND TRY

```bash
python indexes.py
```

**Expected output (times vary by machine):**
```
Inserting 100,000 rows...
Inserted 100,000 rows.

=== QUERY PLAN (no index) ===
  (2, 0, 0, 'SCAN TABLE orders')

=== BENCHMARKS (no index) ===
  customer_id=42: 18.40ms avg (returned 97 rows)
  status=pending: 21.12ms avg (returned 25003 rows)
```

**Read the query plan:** `SCAN TABLE orders` means the database read every row. No optimization. For 100,000 rows, this is ~18ms. With 10,000,000 rows, it would be ~1,800ms — unusable for a web request.

**Change something:** Change the `customer_id` filter from `42` to `1`. Customer ID 1 matches roughly the same number of rows. The time should be similar — because without an index, every query scans all 100,000 rows regardless of which value you're looking for.

---

## Step 2 — Add the Index and Compare

Add this to `indexes.py`, after the first benchmarks:

```python
# Re-open connection (we closed it above) or continue in the same script
conn = sqlite3.connect("orders.db")
conn.execute("PRAGMA journal_mode=WAL")

print("=== ADDING INDEX ===")
start = time.perf_counter()
conn.execute("CREATE INDEX IF NOT EXISTS idx_customer_id ON orders (customer_id)")
# CREATE INDEX: builds the B-tree index on the customer_id column
# IF NOT EXISTS: safe to run multiple times — no error if index already exists
# idx_customer_id: conventional naming — idx_{table}_{column(s)}
conn.commit()
elapsed = (time.perf_counter() - start) * 1000
print(f"  Index created in {elapsed:.0f}ms\n")

# Show the query plan AFTER adding the index
print("=== QUERY PLAN (with index) ===")
plan = conn.execute("EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 42").fetchall()
for row in plan:
    print(" ", row)
# Look for "SEARCH TABLE orders USING INDEX idx_customer_id" — index is being used
print()

# Benchmark again — same queries, same data, now with an index
print("=== BENCHMARKS (with index on customer_id) ===")
t3 = benchmark_query(conn, "SELECT * FROM orders WHERE customer_id = 42", label="  customer_id=42")
t4 = benchmark_query(conn, "SELECT * FROM orders WHERE status = 'pending'", label="  status=pending")
print()

# Summarize the improvement
print("=== SUMMARY ===")
print(f"  customer_id=42: {t1:.2f}ms → {t3:.2f}ms  ({t1/t3:.0f}x faster)")
print(f"  status=pending: {t2:.2f}ms → {t4:.2f}ms  (no improvement — no index on status)")
# status=pending is still slow because we only indexed customer_id

conn.close()
```

### SAVE AND TRY

```bash
python indexes.py
```

**Expected output:**
```
=== ADDING INDEX ===
  Index created in 87ms

=== QUERY PLAN (with index) ===
  (3, 0, 0, 'SEARCH TABLE orders USING INDEX idx_customer_id (customer_id=?)')

=== BENCHMARKS (with index on customer_id) ===
  customer_id=42: 0.18ms avg (returned 97 rows)
  status=pending: 20.89ms avg (returned 25003 rows)

=== SUMMARY ===
  customer_id=42: 18.40ms → 0.18ms  (102x faster)
  status=pending: 21.12ms → 20.89ms (no improvement — no index on status)
```

**Read the results:**
- `customer_id=42` went from 18ms to 0.18ms — 100x faster. The query plan now says `USING INDEX idx_customer_id`.
- `status=pending` is unchanged — we only indexed `customer_id`, not `status`. It still scans all rows.

**The takeaway:** Indexes are surgical. They speed up queries on the indexed column(s). Other queries are unaffected.

**In the terminal — try the N+1 query problem:**
```python
# This is what NOT to do — 100 separate queries instead of 1
conn = sqlite3.connect("orders.db")
customer_ids = list(range(1, 101))   # 100 customer IDs

start = time.perf_counter()
for cid in customer_ids:
    orders = conn.execute("SELECT * FROM orders WHERE customer_id = ?", (cid,)).fetchall()
elapsed = (time.perf_counter() - start) * 1000
print(f"100 individual queries: {elapsed:.1f}ms")

# This is the correct approach — 1 query for all 100 customers
start = time.perf_counter()
placeholders = ",".join("?" * len(customer_ids))
all_orders = conn.execute(
    f"SELECT * FROM orders WHERE customer_id IN ({placeholders})", customer_ids
).fetchall()
elapsed = (time.perf_counter() - start) * 1000
print(f"1 query with IN clause: {elapsed:.1f}ms")
conn.close()
```

Even with the index, 100 separate queries add 100x the query overhead. One `IN` query with the same index is far faster.

---

## Challenge

**No solution provided. Requirements checklist only.**

Add an index on `status` and a composite index on `(customer_id, status)`. Benchmark the improvement for a filtered query: `WHERE customer_id = 42 AND status = 'pending'`.

**Requirements checklist:**

- [ ] Create `idx_status` on the `status` column
- [ ] Create `idx_customer_status` as a composite index on `(customer_id, status)`
- [ ] Benchmark `WHERE status = 'pending'` before and after `idx_status` — show the improvement
- [ ] Benchmark `WHERE customer_id = 42 AND status = 'pending'` using all three index states: no composite index, with `idx_customer_id` only, and with `idx_customer_status`
- [ ] Print the query plan for each case — show which index the optimizer chooses
- [ ] Add a benchmark for `WHERE status = 'pending' AND customer_id = 42` (same conditions, different order) — does the composite index still work?
- [ ] Document your findings: which index configuration is fastest for each query, and why

**Starter:**

```python
# Drop indexes to start clean:
# conn.execute("DROP INDEX IF EXISTS idx_customer_id")
# conn.execute("DROP INDEX IF EXISTS idx_customer_status")

# Create the new indexes:
# conn.execute("CREATE INDEX IF NOT EXISTS idx_status ON orders (status)")
# conn.execute("CREATE INDEX IF NOT EXISTS idx_customer_status ON orders (customer_id, status)")
```

**When you're done:** The composite index `(customer_id, status)` should be the fastest for `WHERE customer_id = 42 AND status = 'pending'`. The query plan should show `USING INDEX idx_customer_status`. The `status`-only index should be noticeably faster for `WHERE status = 'pending'` than no index.

**Stuck?** Ask AI: "In SQLite, I have a composite index on `(customer_id, status)`. I want to understand: does the query `WHERE status = 'pending'` use this index? What is the 'leftmost prefix rule' for composite indexes, and why does column order in the CREATE INDEX statement matter?"

---

## Quick Check Answers

**1. How many rows does the database read for a full table scan on 100,000 rows?**
All 100,000 — every single row. Without an index on `customer_id`, the database has no way to know where the matching rows are. It must read the entire table and check each row. The SQL output in Step 1 confirms this: `SCAN TABLE orders` means a full scan. This is O(n) — time grows linearly with table size.

**2. How many comparisons does a B-tree index make for 100,000 rows?**
Approximately log₂(100,000) ≈ 17 comparisons. A balanced B-tree of height h can index 2^h nodes. For 100,000 rows, height ≈ 17. The database navigates 17 nodes to find the matching rows. This is O(log n) — much better than O(n). In this drill, you measured the real difference: ~18ms vs ~0.18ms — a 100x speedup. At 10,000,000 rows, the full scan would take ~1,800ms but the index lookup would still take ~0.18ms.

**3. Does `WHERE first_name = 'Alice'` use an index on `(last_name, first_name)`?**
No, it does not (in most databases). A composite index `(last_name, first_name)` is sorted first by `last_name`, then by `first_name` within each last_name group. Searching by `first_name` alone requires scanning the entire index — the database cannot use the sorted order without the leading column. `WHERE last_name = 'Smith'` uses the index because `last_name` is the leftmost (leading) column. `WHERE last_name = 'Smith' AND first_name = 'Alice'` also uses it. This is the "leftmost prefix rule" — a composite index is used only when your filter includes the leading columns in order.

**4. What is the cost of 10 indexes for a table receiving 10,000 inserts/second?**
Each insert must update all 10 indexes — 10 additional B-tree insertions per row insert, for 100,000 B-tree operations per second. Each B-tree insert requires finding the insertion point (O(log n)) and potentially rebalancing the tree. The database must flush index pages to disk, adding I/O. Heavy write workloads with many indexes become write-bound. This is why you don't index every column — indexes are an explicit tradeoff: read performance at the cost of write performance and storage space. For read-heavy tables, many indexes are fine. For write-heavy tables (logs, events, telemetry), use fewer or no indexes.
