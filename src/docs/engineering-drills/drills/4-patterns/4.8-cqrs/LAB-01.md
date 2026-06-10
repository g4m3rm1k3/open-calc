# Drill 4.8 — CQRS: Separating Reads from Writes

**Standalone drill. Prerequisites: basic Python, SQLite.**
**Time estimate:** 60–75 minutes
**Pattern category:** Non-GoF (Architecture pattern, Fowler/Greg Young)
**What you will build:** An order management system — write side creates orders (commands), read side serves a dashboard (queries) from a denormalized projection
**What you will understand:** Why reads and writes often need different data shapes, how CQRS enables independent scaling, and when CQRS is overkill

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. CQRS stands for Command Query Responsibility Segregation. What is being "segregated" — what are the two responsibilities being split?

2. Your order table has 20 columns and 1 million rows. Your dashboard shows a count of orders by status (5 values). With CQRS you maintain a separate `order_summary` table updated on every write. What is the tradeoff?

3. The write side of CQRS stores data in a normalized form optimized for consistency. The read side stores data in a denormalized form optimized for query speed. Can these two sides use the same database? Can they use different databases?

4. "CQRS is overkill for most applications." When is it appropriate? Name two concrete signals that suggest CQRS is the right choice.

*(Answers at the bottom.)*

---

## The Concept: CQRS

### Concept: Command Query Responsibility Segregation (CQRS)

**What it is:**
CQRS separates the model that updates data (the write side, handling Commands) from the model that reads data (the read side, handling Queries). Commands change state but return nothing (or just an acknowledgement). Queries return data but change nothing. Each side is optimized independently.

**The problem — one model doing both:**

```python
# Single model serving both reads and writes — increasingly painful at scale
class OrderRepository:
    def create_order(self, customer_id, items):          # write
        # normalized INSERT into orders, order_items
        ...

    def get_dashboard(self):                              # read
        # complex JOIN across orders, order_items, customers, products
        # returns aggregated data that looks nothing like the stored schema
        return db.execute("""
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
                SUM(total_amount) as revenue
            FROM orders
            JOIN customers ON ...
            JOIN order_items ON ...
        """).fetchone()
```

At small scale this works. At scale:
- The JOIN for the dashboard locks rows that writes also need — read and write compete
- The normalized schema is optimal for writes (no duplication) but terrible for reads (many joins)
- Scaling reads means scaling the same database as writes — you cannot scale them independently
- Adding an index to help reads can hurt write performance

**The solution:**

```python
# Write side: normalized, optimized for consistency
class OrderCommandHandler:
    def handle_create_order(self, cmd: CreateOrderCommand) -> str:
        order_id = str(uuid4())
        db.execute("INSERT INTO orders ...", ...)
        # Also update the read model projection:
        projection_db.execute("UPDATE order_summary SET total = total + 1 ...")
        return order_id   # just the ID — no data fetching

# Read side: denormalized, optimized for query speed
class OrderQueryHandler:
    def get_dashboard(self) -> dict:
        # Pre-computed projection — single table, no joins, instant
        return projection_db.execute("SELECT * FROM order_summary").fetchone()
```

**Pattern category:** Architecture pattern, not a GoF pattern. First described by Greg Young (2010), related to Bertrand Meyer's earlier CQS (Command Query Separation) principle.

**Tradeoff:**
Two models means eventual consistency between them — after a write, the read model is updated, but briefly (microseconds to milliseconds) the two may differ. Also: more complexity — two databases (or schemas), two models, synchronization logic. CQRS is not appropriate for most applications; the benefits only appear at scale or with specific requirements.

**What it hides:**
The complexity of maintaining the read projection. Commands update both the write model and the read projection as part of the same transaction (or via an event). Queries read from the projection without any joins or aggregation.

**Canonical example:**
An airline's reservation system. When you book a flight (Command), the normalized database records the booking. The seat map display (Query) reads from a separate, denormalized "available seats" view that was pre-computed and updated on every booking. The seat map query never touches the complex normalized booking table.

**Constraints:**
- The read projection must be kept in sync with the write model — either synchronously (in the same transaction) or asynchronously (via events, with a brief inconsistency window)
- If the projection is updated asynchronously, the read side may return stale data — your application must accept eventual consistency
- The complexity cost is real — two models, two schemas, synchronization code. Start without CQRS; add it when you feel the pain.

**Failure modes:**
- Inconsistent projection: a write succeeds but the projection update fails — reads show stale data indefinitely
- Projection drift: projection update logic has a bug — reads are wrong, writes are correct, discrepancy grows
- Premature CQRS: added complexity for a 100-row table with 5 users — no benefit, significant cost

**Operational reality:**
CQRS appears in: high-traffic e-commerce (Amazon's catalog and order systems), financial systems (transaction ledger vs account balance view), and collaborative software (document text vs rendered document). It is often combined with Event Sourcing (the write model stores events, projections are derived from replaying events). GitHub uses CQRS for repository statistics — writes to the git storage, reads from pre-computed aggregate tables.

**You will see this again in:**
Event-driven architectures, microservices with separate read/write services, Kafka-based systems (events are commands, consumer updates projections), Redux (dispatched actions are commands, the store state is a projection). When you see "materialized view" in a database, that is CQRS at the SQL level.

**Watch for:**
Eventual consistency is not a bug — it is a design choice. If your application cannot tolerate a brief window where reads lag writes by 50ms, you need synchronous projection updates (or you should not use async CQRS). Most applications can tolerate eventual consistency for non-critical reads (a dashboard showing yesterday's totals is fine); some cannot (a bank account balance must be current).

---

## Step 1 — The Single Model (Showing the Pain)

Create `orders_simple.py`:

```python
# orders_simple.py — one model for reads and writes (the starting point)
import sqlite3
from datetime import datetime

DB = "orders.db"

def init_db():
    with sqlite3.connect(DB) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY, customer_id TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                total_amount REAL NOT NULL, created_at TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY, order_id TEXT NOT NULL,
                product_name TEXT NOT NULL, quantity INTEGER NOT NULL,
                unit_price REAL NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id)
            )
        """)

def create_order(customer_id: str, items: list[dict]) -> str:
    """Write: create an order. Returns the order ID."""
    import uuid
    order_id    = str(uuid.uuid4())[:8]
    total       = sum(item["quantity"] * item["unit_price"] for item in items)
    created_at  = datetime.now().isoformat()

    with sqlite3.connect(DB) as conn:
        conn.execute(
            "INSERT INTO orders (id, customer_id, status, total_amount, created_at) VALUES (?,?,?,?,?)",
            (order_id, customer_id, "pending", total, created_at)
        )
        conn.executemany(
            "INSERT INTO order_items (order_id, product_name, quantity, unit_price) VALUES (?,?,?,?)",
            [(order_id, i["name"], i["quantity"], i["unit_price"]) for i in items]
        )
    return order_id

def get_dashboard() -> dict:
    """Read: aggregate dashboard. Complex query over normalized data."""
    with sqlite3.connect(DB) as conn:
        # This query joins two tables and aggregates — expensive at scale
        row = conn.execute("""
            SELECT
                COUNT(DISTINCT o.id)                          AS total_orders,
                SUM(CASE WHEN o.status='pending'   THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN o.status='completed' THEN 1 ELSE 0 END) AS completed,
                COALESCE(SUM(o.total_amount), 0)              AS revenue
            FROM orders o
        """).fetchone()
    return {"total": row[0], "pending": row[1], "completed": row[2], "revenue": row[3]}


if __name__ == "__main__":
    init_db()
    create_order("customer-1", [{"name": "Widget", "quantity": 2, "unit_price": 9.99}])
    create_order("customer-2", [{"name": "Gadget", "quantity": 1, "unit_price": 24.99}])
    print("Dashboard:", get_dashboard())
    print("Problem: get_dashboard() runs a JOIN + aggregation on every call.")
    print("At 1M orders, this query takes seconds. Reads and writes compete for locks.")
```

### SAVE AND TRY

```bash
python orders_simple.py
```

**Expected:**
```
Dashboard: {'total': 2, 'pending': 2, 'completed': 0, 'revenue': 44.97}
Problem: get_dashboard() runs a JOIN + aggregation on every call.
At 1M orders, this query takes seconds. Reads and writes compete for locks.
```

---

## Step 2 — CQRS with a Separate Read Projection

Create `orders_cqrs.py`:

```python
# orders_cqrs.py — CQRS: separate write model and read projection
import sqlite3
from datetime import datetime

WRITE_DB = "orders_write.db"    # normalized — optimized for consistency
READ_DB  = "orders_read.db"     # denormalized — optimized for query speed

# ── Write database setup ───────────────────────────────────────────────────────

def init_write_db():
    with sqlite3.connect(WRITE_DB) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY, customer_id TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                total_amount REAL NOT NULL, created_at TEXT NOT NULL
            )
        """)

# ── Read database setup (the projection) ──────────────────────────────────────

def init_read_db():
    with sqlite3.connect(READ_DB) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS order_summary (
                id INTEGER PRIMARY KEY DEFAULT 1,
                total_orders INTEGER NOT NULL DEFAULT 0,
                pending      INTEGER NOT NULL DEFAULT 0,
                completed    INTEGER NOT NULL DEFAULT 0,
                revenue      REAL    NOT NULL DEFAULT 0.0
            )
        """)
        # Ensure exactly one row exists — we update in place
        conn.execute("INSERT OR IGNORE INTO order_summary (id) VALUES (1)")

# ── COMMANDS (write side) ──────────────────────────────────────────────────────

def cmd_create_order(customer_id: str, items: list[dict]) -> str:
    """
    Command: create an order.
    Writes to the normalized write database AND updates the read projection.
    Both updates happen in sequence — if the projection update fails, the write
    is already committed (for this demo we accept this; production uses events or
    a saga for true atomicity).
    """
    import uuid
    order_id   = str(uuid.uuid4())[:8]
    total      = sum(i["quantity"] * i["unit_price"] for i in items)
    created_at = datetime.now().isoformat()

    # Write to the normalized store
    with sqlite3.connect(WRITE_DB) as conn:
        conn.execute(
            "INSERT INTO orders (id, customer_id, status, total_amount, created_at) VALUES (?,?,?,?,?)",
            (order_id, customer_id, "pending", total, created_at)
        )

    # Update the read projection
    with sqlite3.connect(READ_DB) as conn:
        conn.execute("""
            UPDATE order_summary
            SET total_orders = total_orders + 1,
                pending      = pending + 1,
                revenue      = revenue + ?
            WHERE id = 1
        """, (total,))
        # This is a simple increment — no JOIN, no aggregation, sub-millisecond

    return order_id


def cmd_complete_order(order_id: str) -> None:
    """Command: mark an order as completed. Updates both models."""
    # Fetch current amount from write side to update revenue correctly
    with sqlite3.connect(WRITE_DB) as conn:
        row = conn.execute(
            "SELECT total_amount FROM orders WHERE id=?", (order_id,)
        ).fetchone()
        if not row:
            raise ValueError(f"Order {order_id} not found")
        conn.execute(
            "UPDATE orders SET status='completed' WHERE id=?", (order_id,)
        )

    # Update projection: pending-1, completed+1 (revenue unchanged)
    with sqlite3.connect(READ_DB) as conn:
        conn.execute("""
            UPDATE order_summary
            SET pending   = pending - 1,
                completed = completed + 1
            WHERE id = 1
        """)


# ── QUERIES (read side) ────────────────────────────────────────────────────────

def query_dashboard() -> dict:
    """
    Query: read the pre-computed dashboard projection.
    Single table, single row, no joins, no aggregation.
    At 1 million orders, this returns in microseconds — the projection is always ready.
    """
    with sqlite3.connect(READ_DB) as conn:
        row = conn.execute(
            "SELECT total_orders, pending, completed, revenue FROM order_summary WHERE id=1"
        ).fetchone()
    return {"total": row[0], "pending": row[1], "completed": row[2], "revenue": row[3]}


def query_order(order_id: str) -> dict | None:
    """Query: get a specific order. Reads from the write model (detailed data)."""
    with sqlite3.connect(WRITE_DB) as conn:
        row = conn.execute(
            "SELECT * FROM orders WHERE id=?", (order_id,)
        ).fetchone()
    if not row:
        return None
    return {"id": row[0], "customer_id": row[1], "status": row[2],
            "total_amount": row[3], "created_at": row[4]}


# ── Run it ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    init_write_db()
    init_read_db()

    print("=== Creating orders ===")
    id1 = cmd_create_order("customer-1", [{"name": "Widget", "quantity": 2, "unit_price": 9.99}])
    id2 = cmd_create_order("customer-2", [{"name": "Gadget", "quantity": 1, "unit_price": 24.99}])
    print(f"Created orders: {id1}, {id2}")

    print("\n=== Dashboard (from projection — no joins) ===")
    print(query_dashboard())

    print("\n=== Completing order ===")
    cmd_complete_order(id1)

    print("\n=== Dashboard after completion ===")
    print(query_dashboard())

    print("\n=== Individual order (from write model) ===")
    print(query_order(id1))
```

### SAVE AND TRY

```bash
python orders_cqrs.py
```

**Expected:**
```
=== Creating orders ===
Created orders: a1b2c3d4, e5f6g7h8

=== Dashboard (from projection — no joins) ===
{'total': 2, 'pending': 2, 'completed': 0, 'revenue': 44.97}

=== Completing order ===

=== Dashboard after completion ===
{'total': 2, 'pending': 1, 'completed': 1, 'revenue': 44.97}

=== Individual order (from write model) ===
{'id': 'a1b2c3d4', 'customer_id': 'customer-1', 'status': 'completed', ...}
```

**In the terminal — compare the query complexity:**
```bash
python -c "
import sqlite3
# Simple projection read — what CQRS uses for dashboard
conn = sqlite3.connect('orders_read.db')
print('CQRS read query plan:')
print(conn.execute('EXPLAIN QUERY PLAN SELECT * FROM order_summary WHERE id=1').fetchall())

# Complex aggregation — what the simple version uses
conn2 = sqlite3.connect('orders_write.db')
print('Simple aggregation query plan:')
print(conn2.execute('EXPLAIN QUERY PLAN SELECT COUNT(*), SUM(total_amount) FROM orders').fetchall())
"
```

**Change something:** Add 100 orders in a loop, then compare the dashboard query time between `orders_simple.py` (JOIN + aggregation every call) vs `orders_cqrs.py` (projection read). At 100 rows the difference is small. Imagine 1 million.

---

## Challenge

**No solution provided. Requirements checklist only.**

Add a second projection: `customer_summary` that tracks each customer's order count and total spend. Update it on every `cmd_create_order`.

**Requirements checklist:**

- [ ] `customer_summary` table: `customer_id TEXT PRIMARY KEY, order_count INTEGER, total_spent REAL`
- [ ] `cmd_create_order` updates `customer_summary` for the relevant customer (INSERT OR UPDATE)
- [ ] `query_customer_summary(customer_id)` reads from the projection — no join with the orders table
- [ ] Running 10 orders across 3 customers produces correct per-customer counts
- [ ] Verify: `query_customer_summary("customer-1")` returns the right count without querying the orders table
- [ ] A query that would read ALL customer summaries runs as a single `SELECT * FROM customer_summary` — constant time regardless of number of orders

**Starter:**
```python
def init_customer_projection():
    with sqlite3.connect(READ_DB) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS customer_summary (
                customer_id  TEXT PRIMARY KEY,
                order_count  INTEGER NOT NULL DEFAULT 0,
                total_spent  REAL    NOT NULL DEFAULT 0.0
            )
        """)

# In cmd_create_order, after updating order_summary:
# with sqlite3.connect(READ_DB) as conn:
#     conn.execute("""
#         INSERT INTO customer_summary (customer_id, order_count, total_spent)
#         VALUES (?, 1, ?)
#         ON CONFLICT(customer_id) DO UPDATE SET
#             order_count = order_count + 1,
#             total_spent = total_spent + excluded.total_spent
#     """, (customer_id, total))
```

**When you're done:** `query_customer_summary("customer-1")` returns `{"order_count": N, "total_spent": X}` instantly, with zero aggregation at query time. Creating 1000 orders for the same customer and then querying their summary takes the same time as querying after 1 order — because the projection is maintained incrementally on writes.

**Stuck?** Ask AI: "In SQLite, I want to INSERT a row if the customer doesn't exist, or UPDATE it if they do. I need to increment the `order_count` by 1 and add to `total_spent`. How do I use `INSERT OR REPLACE` or `ON CONFLICT DO UPDATE` (upsert) for this?"

---

## Quick Check Answers

**1. What two responsibilities are being segregated in CQRS?**
Commands (writes) and Queries (reads). Commands change state — they create, update, or delete data. Queries retrieve data — they never change state. CQRS says these two operations should use separate models, separate code paths, and potentially separate databases. The core insight: the data shape optimal for writing (normalized, relational, ACID) is rarely the same as the data shape optimal for reading (denormalized, aggregated, fast).

**2. What is the tradeoff of maintaining a separate `order_summary` projection?**
The tradeoff is consistency vs performance. Dashboard reads become trivial (constant time, no joins), but every write now has two steps: update the normalized write model AND update the projection. If the projection update fails, the projection is out of sync with the write model — data inconsistency. The projection is also extra storage and extra code to maintain. In exchange: the dashboard query is milliseconds regardless of the number of orders, and reads don't compete with writes for database locks.

**3. Can the two sides use the same database? Different databases?**
Both are valid. The simplest CQRS implementation uses one database with two separate schemas or tables (as in this drill). This eliminates network overhead and makes updates atomic (both write model and projection in one transaction). Using different databases allows independent scaling — the read database can be replicated to 10 servers while the write database stays on one — but adds network latency and makes atomicity impossible (you get eventual consistency). Start with one database; add the second when you actually need to scale them independently.

**4. When is CQRS appropriate? Two signals?**
Signal 1: **Asymmetric read/write load** — 99% of traffic is reads, 1% is writes, but the read queries are slow because they run complex aggregations over the same data that writes modify. CQRS lets you pre-compute the reads and stop competing for write locks. Signal 2: **Read and write models have fundamentally different shapes** — the write model is 20 normalized tables, but every dashboard query joins 15 of them in a different way. Maintaining projections for each dashboard query eliminates the joins. CQRS is NOT appropriate when: the application is simple, the data model is small, the read and write volumes are balanced, or the team doesn't already understand the concepts — the complexity cost will outweigh the benefit.
