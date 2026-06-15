export default {
  id: "sql1-006",
  slug: "acid-transactions",
  chapter: "sql-1",
  order: 6,
  title: "ACID & Transactions",
  subtitle:
    "Why databases never lose your money — atomicity, consistency, isolation, durability",
  tags: [
    "ACID",
    "transactions",
    "BEGIN",
    "COMMIT",
    "ROLLBACK",
    "atomicity",
    "consistency",
    "isolation",
    "durability",
    "concurrency",
    "locks",
  ],
  aliases:
    "acid transaction begin commit rollback atomic consistent isolated durable concurrency isolation level dirty read phantom read serializable",

  hook: {
    question:
      "When you transfer money between bank accounts, two things must happen: the debit AND the credit. What guarantees they both happen — or neither does?",
    realWorldContext:
      "Transactions are the reason you can trust your bank's database, your e-commerce order, " +
      'your booking confirmation. They are also the mechanism behind every "undo" system, ' +
      "every financial reconciliation, every distributed system's consistency guarantee. " +
      "ACID is a contract the database makes with you. Understanding it makes you a better " +
      "system designer — you'll know when you need full ACID, when you can relax it for performance, " +
      "and what bad things happen when you do.",
    previewVisualizationId: "PythonNotebook",
  },

  intuition: {
    prose: [
      '**Atomicity: all or nothing.** A transaction is a group of operations that succeeds completely or fails completely. If you debit account A and then the server crashes before crediting account B, the debit is rolled back. No partial states. The word comes from the Greek "atomos" — indivisible.',
      "**Consistency: rules always hold.** The database has constraints (NOT NULL, UNIQUE, foreign keys, CHECK constraints). A transaction must leave the database in a state that satisfies all constraints. You cannot commit a transaction that leaves a foreign key violated. Consistency is enforced by the database; your application logic must also maintain business rules.",
      '**Isolation: transactions don\'t see each other\'s in-progress work.** When two transactions run concurrently, each sees a snapshot of the data as if the other doesn\'t exist (at the highest isolation level). Without isolation, you get "dirty reads" (seeing uncommitted data), "non-repeatable reads" (data changes between two reads in the same transaction), and "phantom reads" (new rows appearing between two range queries).',
      "**Durability: committed data survives crashes.** When the database says COMMIT succeeded, the data is written to disk (or write-ahead log) before responding. A power failure after COMMIT does not lose the data. This is typically implemented with a Write-Ahead Log (WAL) — changes are written to a log file before being applied to the actual data file.",
      "**BEGIN / COMMIT / ROLLBACK.** You explicitly start a transaction with BEGIN. You end it successfully with COMMIT (makes all changes permanent and visible). You cancel it with ROLLBACK (undoes all changes since BEGIN). Many databases also auto-begin a transaction for each statement (autocommit mode).",
    ],
    callouts: [
      {
        type: "definition",
        title: "ACID Guarantees",
        body: "**A — Atomicity:** All operations succeed or all are rolled back. No partial states.\n**C — Consistency:** Constraints are always satisfied. A transaction takes DB from one valid state to another.\n**I — Isolation:** Concurrent transactions behave as if they ran serially. No dirty reads.\n**D — Durability:** Committed data survives crashes. WAL ensures this.",
      },
      {
        type: "definition",
        title: "Isolation Levels (weakest to strongest)",
        body: "**READ UNCOMMITTED:** Can read dirty (uncommitted) data — fastest, least safe\n**READ COMMITTED:** Only reads committed data — default in PostgreSQL\n**REPEATABLE READ:** Same row returns same value within a transaction\n**SERIALIZABLE:** Full isolation — equivalent to serial execution — safest, slowest\n\nLower isolation = more concurrency = more performance. Higher = more safety = more locks.",
      },
      {
        type: "warning",
        title: "Long transactions block everything",
        body: "A transaction that runs for minutes holds locks on all rows it touched. Other transactions that need those rows are blocked. This causes cascading slowdowns. Keep transactions as short as possible — do not include user input, network calls, or long computations inside a transaction.",
      },
      {
        type: "insight",
        title: "NoSQL sacrifices some ACID for speed",
        body: 'Many NoSQL databases relax one or more ACID properties to achieve higher throughput or availability. MongoDB offers multi-document transactions (added in v4.0) but they are more expensive than single-document operations. Cassandra has "eventual consistency" — you can read stale data. Understanding ACID makes the NoSQL tradeoffs legible.',
      },
    ],
    visualizations: [
      {
        id: "PythonNotebook",
        title: "ACID Transactions",
        mathBridge:
          "A database schedule S is serializable if it is equivalent to some serial schedule S'. Strict 2-Phase Locking (S2PL) guarantees serializability: acquire all locks during the growing phase, release all locks only after COMMIT/ROLLBACK.",
        caption:
          "See what happens when a transfer crashes halfway without a transaction, versus with one. Then see how ROLLBACK is used for error handling.",
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: "Setup: bank accounts",
              prose: [
                "## A simple bank account system",
                "The classic example for understanding transactions.",
              ],
              code: `import sqlite3

conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.executescript("""
CREATE TABLE accounts (
    id      INTEGER PRIMARY KEY,
    name    TEXT    NOT NULL,
    balance REAL    NOT NULL CHECK(balance >= 0)  -- constraint: no negative balance
);
INSERT INTO accounts VALUES (1, 'Alice', 1000.00);
INSERT INTO accounts VALUES (2, 'Bob',    500.00);
INSERT INTO accounts VALUES (3, 'Carol',  250.00);
""")
conn.commit()

def show_balances(label=""):
    cur.execute("SELECT name, balance FROM accounts ORDER BY id")
    rows = cur.fetchall()
    total = sum(r[1] for r in rows)
    print(f"{'─'*30}  {label}")
    for name, bal in rows: print(f"  {name:<8}: \${bal:>8.2f}")
    print(f"  {'Total':<8}: \${total:>8.2f}")

show_balances("Initial state")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: "What happens without a transaction",
              prose: [
                "## Crash mid-transfer",
                "Simulate a transfer that crashes after the debit but before the credit. Without a transaction, money disappears.",
              ],
              code: `# Simulate transfer WITHOUT a transaction
# Imagine the process crashes between these two statements

def bad_transfer(from_id, to_id, amount):
    """No transaction — crash leaves DB in inconsistent state"""
    print(f"Transferring \${amount} from account {from_id} to {to_id}...")
    cur.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?",
                (amount, from_id))
    conn.commit()  # <-- debit is committed

    # CRASH HERE — credit never happens
    raise RuntimeError("Server crashed!")

    cur.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?",
                (amount, to_id))
    conn.commit()  # <-- credit never executes

show_balances("Before")
try:
    bad_transfer(1, 2, 200.00)
except RuntimeError as e:
    print(f"\\nCrash! {e}")

show_balances("After crash (money is GONE)")
print()
print("$200 was debited from Alice but never credited to Bob.")
print("Total balance decreased — the database is now inconsistent.")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: "COMMIT and ROLLBACK",
              prose: [
                "## The correct way: wrap in a transaction",
                "With `BEGIN` / `COMMIT`, either both operations succeed or neither does. `ROLLBACK` undoes everything.",
              ],
              code: `# Reset balances
cur.executescript("""
UPDATE accounts SET balance = 1000.00 WHERE id = 1;
UPDATE accounts SET balance =  500.00 WHERE id = 2;
UPDATE accounts SET balance =  250.00 WHERE id = 3;
""")
conn.commit()
show_balances("Reset")

def safe_transfer(from_id, to_id, amount, crash=False):
    """Atomic transfer using BEGIN/COMMIT/ROLLBACK"""
    try:
        conn.execute("BEGIN")
        cur.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amount, from_id))
        
        if crash:
            raise RuntimeError("Server crashed mid-transfer!")

        cur.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amount, to_id))
        conn.execute("COMMIT")
        print(f"Transfer of \${amount} succeeded.")
    except Exception as e:
        conn.execute("ROLLBACK")
        print(f"Transfer failed: {e}")
        print("ROLLBACK: database returned to pre-transfer state.")

print("\\n--- Test 1: successful transfer ---")
safe_transfer(1, 2, 200.00)
show_balances("After success")

print()
print("--- Test 2: crash mid-transfer (ROLLBACK triggered) ---")
safe_transfer(2, 3, 100.00, crash=True)
show_balances("After crash with ROLLBACK")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 4,
              cellTitle: "Constraint violations trigger rollback",
              prose: [
                "## CHECK constraints enforce consistency",
                "The `balance >= 0` constraint prevents overdrafts. Any statement that would violate a constraint causes the transaction to fail.",
              ],
              code: `show_balances("Before overdraft attempt")

print("\\nAttempt to overdraft Alice ($2000 but she only has $800):")
try:
    conn.execute("BEGIN")
    cur.execute("UPDATE accounts SET balance = balance - 2000 WHERE id = 1")
    cur.execute("UPDATE accounts SET balance = balance + 2000 WHERE id = 2")
    conn.execute("COMMIT")
except sqlite3.IntegrityError as e:
    conn.execute("ROLLBACK")
    print(f"Constraint violation: {e}")
    print("ROLLBACK: nothing changed.")

show_balances("After failed overdraft")

print()
print("The CHECK(balance >= 0) constraint is enforced atomically.")
print("Alice still has her balance. Bob's balance is unchanged.")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 5,
              cellTitle: "Durability: Write-Ahead Logging",
              prose: [
                "## How durability works internally",
                "The Write-Ahead Log (WAL) is how databases survive crashes. Changes are written to a log *before* the main data file. On recovery, the log is replayed.",
              ],
              code: `# SQLite WAL mode — show that it exists
# In a real app you'd use a file-based database
conn_file = sqlite3.connect("/tmp/wal_demo.db")
conn_file.execute("PRAGMA journal_mode=WAL")
cur_file = conn_file.cursor()
cur_file.execute("CREATE TABLE IF NOT EXISTS data (id INTEGER PRIMARY KEY, val TEXT)")
cur_file.execute("INSERT OR IGNORE INTO data VALUES (1, 'hello')")
conn_file.commit()

# Show WAL mode
cur_file.execute("PRAGMA journal_mode")
mode = cur_file.fetchone()[0]
print(f"Journal mode: {mode}")

# Show what durability means in practice
print()
print("WAL (Write-Ahead Log) — how COMMIT works:")
print("  1. Transaction writes changes to WAL file (.db-wal)")
print("  2. fsync() flushes WAL to disk")
print("  3. Database responds: COMMIT succeeded")
print("  4. Later: WAL is checkpointed into the main database file")
print()
print("If power fails after step 2: WAL is replayed on next open → no data loss")
print("If power fails before step 2: WAL is incomplete → rolled back on next open")
print()
print("This is why COMMIT is slow: it requires a disk fsync.")
print("Batching many operations into one transaction amortizes the fsync cost.")

# Cleanup
conn_file.close()
import os
for f in ['/tmp/wal_demo.db', '/tmp/wal_demo.db-wal', '/tmp/wal_demo.db-shm']:
    try: os.remove(f)
    except FileNotFoundError: pass`,
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
      "**Isolation levels and anomalies.** The ANSI SQL standard defines isolation levels by which anomalies they prevent: Dirty Read (reading uncommitted data), Non-Repeatable Read (same SELECT returns different values within a transaction), Phantom Read (new rows appear in a range query). SERIALIZABLE prevents all three. READ UNCOMMITTED prevents none. Most applications use READ COMMITTED or REPEATABLE READ.",
      "**Optimistic vs. Pessimistic concurrency.** Pessimistic locking acquires locks before accessing data — prevents conflicts but reduces concurrency. Optimistic locking assumes conflicts are rare: no locks during the transaction, but at COMMIT time, verify that the data hasn't changed (using a version number or timestamp). If it has, abort and retry. Most modern web frameworks use optimistic locking for better throughput.",
      "**Savepoints.** Within a transaction you can create named savepoints: `SAVEPOINT sp1`. If part of a transaction fails you can `ROLLBACK TO sp1` (undo back to the savepoint without rolling back the entire transaction) and retry just that part. Used in complex transactions that perform multiple independent operations.",
    ],
  },

  examples: [
    {
      id: "sql1-006-ex1",
      title: "Order Processing Transaction",
      problem:
        "Place an order: deduct from inventory, insert the order row, insert order line items — all atomically.",
      code: `def place_order(conn, customer_id, items):
    """items = list of (product_id, quantity, price)"""
    try:
        conn.execute("BEGIN")
        
        # 1. Check and deduct inventory
        for product_id, qty, price in items:
            cur.execute(
                "SELECT stock FROM products WHERE id = ?",
                (product_id,)
            )
            row = cur.fetchone()
            if not row or row[0] < qty:
                raise ValueError(f"Insufficient stock for product {product_id}")
            cur.execute(
                "UPDATE products SET stock = stock - ? WHERE id = ?",
                (qty, product_id)
            )
        
        # 2. Insert order header
        cur.execute(
            "INSERT INTO orders (customer_id, status) VALUES (?, 'confirmed')",
            (customer_id,)
        )
        order_id = cur.lastrowid
        
        # 3. Insert line items
        for product_id, qty, price in items:
            cur.execute(
                "INSERT INTO order_items VALUES (?, ?, ?, ?)",
                (order_id, product_id, qty, price)
            )
        
        conn.execute("COMMIT")
        return order_id
    except Exception as e:
        conn.execute("ROLLBACK")
        raise`,
      steps: [
        { expression: "BEGIN", annotation: "Start atomic unit" },
        {
          expression: "Check inventory",
          annotation: "Raise if insufficient — triggers ROLLBACK",
        },
        {
          expression: "UPDATE products (stock)",
          annotation: "Deduct inventory — still within transaction",
        },
        {
          expression: "INSERT orders header",
          annotation: "Create order record",
        },
        { expression: "INSERT order_items", annotation: "Create line items" },
        {
          expression: "COMMIT",
          annotation: "All or nothing — if any step failed, ROLLBACK",
        },
      ],
      conclusion:
        "Transactions make multi-step operations safe. If anything fails, the database returns to its pre-transaction state — no half-placed orders, no phantom inventory deductions.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql1-006-q1",
        type: "choice",
        text: "A transfer deducts from account A and crashes before crediting account B. With a proper transaction, what happens?",
        options: [
          "The debit is permanent; credit must be retried manually",
          "The entire transaction is rolled back — account A keeps its money",
          "The database becomes corrupted",
          "The credit is automatically retried on next startup",
        ],
        answer:
          "The entire transaction is rolled back — account A keeps its money",
      },
      {
        id: "sql1-006-q2",
        type: "choice",
        text: 'Which isolation anomaly does "REPEATABLE READ" prevent but "READ COMMITTED" does not?',
        options: [
          "Dirty reads",
          "Non-repeatable reads — seeing different values for the same row in the same transaction",
          "Phantom reads",
          "Constraint violations",
        ],
        answer:
          "Non-repeatable reads — seeing different values for the same row in the same transaction",
      },
      {
        id: "sql1-006-q3",
        type: "choice",
        text: "The Durability guarantee (D in ACID) means:",
        options: [
          "Data is replicated to multiple servers",
          "Once a transaction is committed, it survives a power failure",
          "Transactions run in parallel without blocking",
          "The database schema cannot be changed after data is inserted",
        ],
        answer: "Once a transaction is committed, it survives a power failure",
      },
    ],
  },

  mentalModel: [
    "Atomicity: all operations succeed, or all are rolled back — no partial state",
    "Consistency: constraints are always satisfied after every COMMIT",
    "Isolation: concurrent transactions don't see each other's in-progress changes",
    "Durability: COMMIT = written to disk — survives power failures and crashes",
    "Keep transactions short — long transactions hold locks and block other operations",
    "BEGIN → do work → COMMIT on success, ROLLBACK on failure",
  ],
};
