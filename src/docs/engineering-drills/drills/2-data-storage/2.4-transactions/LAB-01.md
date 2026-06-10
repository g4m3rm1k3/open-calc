# DRILL 2.4 — Database Transactions and ACID
## LAB-01: Why Transactions Exist and What They Cost

**Estimated time:** 60–90 minutes
**Standalone:** Yes. No prior drills required. Basic SQL familiarity helps.
**You will build:** A bank transfer simulation — first broken (money disappears), then correct (atomic transfer), then a demonstration of dirty reads between concurrent connections.

---

## Quick Check

Answer these before you start. Check your answers at the bottom.

1. You run two SQL statements: `UPDATE accounts SET balance = balance - 100 WHERE id = 1` then the process crashes. What happens to the database?
2. What does "atomic" mean in the context of a database transaction?
3. A transaction has been started but not committed. Can another connection read its changes?
4. What is the difference between `COMMIT` and `ROLLBACK`?

---

## The Concept Block

### Why Transactions Exist

A bank transfer is two operations: subtract from account A, add to account B. If your program executes them as two separate SQL statements and crashes between them, one write succeeds and one does not. The database is now corrupt. Money has disappeared.

This is not a theoretical problem. It is the default behavior. Without a transaction, every SQL statement is immediately permanent. The database has no way to undo it. If the power goes out after the debit but before the credit, the money is gone.

A transaction groups multiple statements into a single atomic unit. The database guarantees: either all of them succeed, or none of them do. No partial state.

### ACID

These are the four guarantees a database makes about transactions:

**Atomicity** — All-or-nothing. A transaction either completes entirely or has no effect at all. There is no "half-committed" state. If statement 3 of 5 fails, statements 1 and 2 are undone.

**Consistency** — The database moves from one valid state to another valid state. Your invariants (account balance cannot go below zero, foreign keys must be valid) are enforced. A transaction that violates a constraint is rejected in full.

**Isolation** — Concurrent transactions do not see each other's intermediate states. If two transfers are running simultaneously, each sees a consistent snapshot. One transaction cannot read data that another has modified but not yet committed.

**Durability** — Once a transaction is committed, it survives crashes. The database writes to a write-ahead log (WAL) on disk before acknowledging success. If the server crashes immediately after `COMMIT`, the data is still there when it restarts.

### What "No Transaction" Actually Means

Without `BEGIN`, every SQL statement runs in its own implicit transaction that auto-commits immediately. Statement committed. Permanent. No undo.

This is fine for a single write. It is catastrophic for two writes that must stay in sync.

### Isolation Levels

Isolation is a spectrum. Full isolation is expensive — it requires locking. Weaker isolation is faster but allows anomalies:

| Level | Dirty Read | Non-repeatable Read | Phantom Read |
|-------|-----------|-------------------|-------------|
| READ UNCOMMITTED | Possible | Possible | Possible |
| READ COMMITTED | Prevented | Possible | Possible |
| REPEATABLE READ | Prevented | Prevented | Possible |
| SERIALIZABLE | Prevented | Prevented | Prevented |

**Dirty read:** You read data that another transaction has modified but not yet committed. If that transaction rolls back, you read data that never officially existed.

**Non-repeatable read:** You read a row. Another transaction commits a change to that row. You read the same row again and get different data.

**Phantom read:** You query for rows matching a condition. Another transaction inserts a row that matches. You run the same query and get an extra row.

SQLite defaults to SERIALIZABLE — the strictest level. Postgres defaults to READ COMMITTED.

### Constraints

- SQLite serializes all writers by default — only one write transaction runs at a time. This makes dirty reads impossible in practice, but the concepts still apply and are observable by working around SQLite's WAL mode.
- A transaction holds locks. Long-running transactions block other writers. Always keep transactions short — do your computation outside the transaction, then commit quickly.
- Nested transactions do not exist in standard SQL. SQLite supports `SAVEPOINT` as a workaround, but true nesting is not available.
- If a transaction is not committed before the connection closes, it is automatically rolled back. No data is lost; the transaction simply never happened.

### Failure Modes

- **Forgetting to commit:** You open a transaction, write data, close the connection without committing. The writes vanish silently. No error. Just gone.
- **Catching exceptions without rolling back:** You handle a Python exception but the transaction is still open. Subsequent code may see a partially-written database and make wrong decisions.
- **Transactions that are too large:** Wrapping an entire batch import in one transaction — 1 million rows — means the entire job must fit in memory (in the WAL). If it fails on row 999,999, everything is lost. Use batch commits: commit every 10,000 rows.
- **Long-running read transactions on Postgres:** A transaction that stays open for hours blocks VACUUM from reclaiming dead rows, causing table bloat.
- **Using transactions for reads when you don't need to:** On Postgres, explicit transactions have overhead. Auto-commit is fine for single reads.

### Operational Reality

Every payment system, every order processor, every inventory update uses transactions. The pattern is always the same:

```
BEGIN
  debit the sender
  credit the receiver
  log the transfer
COMMIT
```

If any step fails — network timeout, constraint violation, deadlock — the exception handler calls `ROLLBACK`. The database returns to the state before `BEGIN`.

In production Python, you use a context manager:
```python
with db.begin():
    debit(sender, amount)
    credit(receiver, amount)
# If the block exits normally: COMMIT
# If an exception is raised: ROLLBACK
```

SQLAlchemy, Django ORM, and every other serious ORM wraps this pattern. You rarely write `BEGIN`/`COMMIT`/`ROLLBACK` manually. But you need to know what happens underneath, because when it breaks, you are reading raw database logs.

### You Will See This Again In

- Every financial system you ever touch
- LAB-19 of the Flowboard Masterclass series (SQLite + SQLAlchemy)
- Django: `transaction.atomic()` decorator and context manager
- SQLAlchemy: `Session.begin()`, `session.commit()`, `session.rollback()`
- Any "why did my data disappear" debugging session in production
- Interview questions: "explain ACID," "what is a dirty read," "why use transactions"

---

## Setup

```
drills/2-data-storage/2.4-transactions/
  01_no_transaction.py      ← Step 1: the broken version
  02_with_transaction.py    ← Step 2: atomic transfer
  03_rollback.py            ← Step 3: rollback demonstration
  04_dirty_read.py          ← Step 4: isolation and dirty reads
```

All files are standalone. Run each independently. Each creates and cleans up its own database.

---

## Step 1 — The Broken Transfer (No Transaction)

Build the version that loses money. Study where the failure happens.

Create `01_no_transaction.py`:

```python
# 01_no_transaction.py
# Transfer WITHOUT a transaction.
# The bug: if the process crashes between the debit and the credit,
# money disappears from the database permanently.

import sqlite3
import time


def setup_accounts(conn):
    """Create and populate the accounts table."""
    conn.execute("DROP TABLE IF EXISTS accounts")
    conn.execute("""
        CREATE TABLE accounts (
            id      INTEGER PRIMARY KEY,
            owner   TEXT NOT NULL,
            balance REAL NOT NULL
        )
    """)
    # Alice starts with $1000, Bob starts with $500
    conn.execute("INSERT INTO accounts VALUES (1, 'Alice', 1000.00)")
    conn.execute("INSERT INTO accounts VALUES (2, 'Bob',    500.00)")
    conn.commit()


def print_balances(conn, label=""):
    """Print current balances — useful for seeing state at each step."""
    if label:
        print(f"\n  [{label}]")
    cursor = conn.execute("SELECT owner, balance FROM accounts ORDER BY id")
    for row in cursor:
        print(f"    {row[0]:10s}  ${row[1]:.2f}")


def transfer_no_transaction(conn, from_id: int, to_id: int, amount: float):
    """
    Transfer money WITHOUT a transaction.
    
    Each SQL statement auto-commits immediately.
    If anything fails between the two writes, the database is corrupt.
    """
    # Step 1: Debit the sender.
    # This commits IMMEDIATELY. The money is gone from Alice's account.
    conn.execute(
        "UPDATE accounts SET balance = balance - ? WHERE id = ?",
        (amount, from_id)
    )
    conn.commit()  # ← This is the point of no return for the debit.
    print(f"  Debited ${amount:.2f} from account #{from_id} — COMMITTED")

    # --- IMAGINE A CRASH HERE ---
    # A power outage, a network timeout, a bug in the next few lines.
    # The debit above is permanent. The credit below will never run.
    # Simulate a crash with a flag:
    simulate_crash = True
    if simulate_crash:
        print("  *** CRASH before credit! ***")
        raise RuntimeError("Process crashed after debit, before credit.")

    # Step 2: Credit the receiver.
    # This line never runs when simulate_crash is True.
    conn.execute(
        "UPDATE accounts SET balance = balance + ? WHERE id = ?",
        (amount, to_id)
    )
    conn.commit()
    print(f"  Credited ${amount:.2f} to account #{to_id} — COMMITTED")


# --- Main ---
conn = sqlite3.connect("bank_broken.db")
setup_accounts(conn)

print("Initial state:")
print_balances(conn, "before transfer")

# Total money in the system: $1500. This must never change.
# We are transferring $100 from Alice to Bob.

try:
    transfer_no_transaction(conn, from_id=1, to_id=2, amount=100.00)
except RuntimeError as e:
    print(f"\n  Transfer failed: {e}")

print("\nState AFTER the crash:")
print_balances(conn, "after crash")

# Count total money. It should still be $1500.
cursor = conn.execute("SELECT SUM(balance) FROM accounts")
total = cursor.fetchone()[0]
print(f"\n  Total money in system: ${total:.2f}")
print(f"  Expected:              $1500.00")
print(f"  Lost:                  ${1500.00 - total:.2f}")

conn.close()

# Clean up
import os
os.remove("bank_broken.db")
```

### SAVE AND TRY

```
python 01_no_transaction.py
```

Expected output:
```
Initial state:

  [before transfer]
    Alice       $1000.00
    Bob         $500.00
  Debited $100.00 from account #1 — COMMITTED
  *** CRASH before credit! ***

  Transfer failed: Process crashed after debit, before credit.

State AFTER the crash:

  [after crash]
    Alice       $900.00
    Bob         $500.00

  Total money in system: $1400.00
  Expected:              $1500.00
  Lost:                  $100.00
```

$100 has disappeared. Alice's balance is $900. Bob's balance is still $500. The total in the system dropped from $1500 to $1400.

This is not a hypothetical. This is what happens when a server crashes, runs out of memory, or hits an exception between two SQL statements that must stay in sync. The database did exactly what it was told — it committed each statement immediately. The fault is in the code, not the database.

**Change something:** Set `simulate_crash = False` and rerun. The transfer completes. Alice has $900, Bob has $600, total is still $1500. The crash is the only difference between a correct transfer and a corrupt one — and without transactions, there is no protection against it.

---

## Step 2 — The Correct Transfer (With Transaction)

Now fix it. Both writes happen inside one atomic unit.

Create `02_with_transaction.py`:

```python
# 02_with_transaction.py
# Transfer WITH a transaction.
#
# Key guarantee: either BOTH the debit and credit commit together,
# or NEITHER of them does. There is no state where one succeeded
# and the other didn't.

import sqlite3
import os


def setup_accounts(conn):
    conn.execute("DROP TABLE IF EXISTS accounts")
    conn.execute("""
        CREATE TABLE accounts (
            id      INTEGER PRIMARY KEY,
            owner   TEXT NOT NULL,
            balance REAL NOT NULL
        )
    """)
    conn.execute("INSERT INTO accounts VALUES (1, 'Alice', 1000.00)")
    conn.execute("INSERT INTO accounts VALUES (2, 'Bob',    500.00)")
    conn.commit()


def print_balances(conn, label=""):
    if label:
        print(f"\n  [{label}]")
    cursor = conn.execute("SELECT owner, balance FROM accounts ORDER BY id")
    for row in cursor:
        print(f"    {row[0]:10s}  ${row[1]:.2f}")


def transfer_with_transaction(conn, from_id: int, to_id: int, amount: float, simulate_crash: bool = False):
    """
    Transfer money WITH a transaction.
    
    BEGIN marks the start. Neither write is permanent until COMMIT.
    If anything goes wrong before COMMIT, ROLLBACK undoes all of it.
    """
    try:
        # BEGIN: start the transaction.
        # Nothing written inside will be permanent until COMMIT.
        conn.execute("BEGIN")
        print("  Transaction started.")

        # Debit the sender.
        # This write is NOT committed yet. It exists only in the transaction's
        # working memory — not visible to other connections.
        conn.execute(
            "UPDATE accounts SET balance = balance - ? WHERE id = ?",
            (amount, from_id)
        )
        print(f"  Debited ${amount:.2f} from account #{from_id} (not yet committed)")

        # Simulate a crash between the two writes — same scenario as before.
        if simulate_crash:
            print("  *** CRASH before credit! ***")
            raise RuntimeError("Crash after debit, before credit.")

        # Credit the receiver.
        conn.execute(
            "UPDATE accounts SET balance = balance + ? WHERE id = ?",
            (amount, to_id)
        )
        print(f"  Credited ${amount:.2f} to account #{to_id} (not yet committed)")

        # COMMIT: make both writes permanent simultaneously.
        # This is atomic — the database writes both changes as one unit.
        # If the server crashes during the commit, the write-ahead log
        # ensures both are either applied or neither is when it restarts.
        conn.execute("COMMIT")
        print("  Transaction COMMITTED — both changes are now permanent.")

    except Exception as e:
        # Something went wrong. Undo everything since BEGIN.
        # The database returns to the state before BEGIN — as if nothing happened.
        conn.execute("ROLLBACK")
        print(f"  Transaction ROLLED BACK — no changes applied.")
        print(f"  Error: {e}")


# --- Test 1: Crash scenario — with transaction, no money lost ---
print("=" * 50)
print("TEST 1: Crash during transaction (money is safe)")
print("=" * 50)

conn = sqlite3.connect("bank_tx.db")
setup_accounts(conn)

print("\nInitial state:")
print_balances(conn, "before transfer")

transfer_with_transaction(conn, from_id=1, to_id=2, amount=100.00, simulate_crash=True)

print("\nState AFTER the crash:")
print_balances(conn, "after crash")

cursor = conn.execute("SELECT SUM(balance) FROM accounts")
total = cursor.fetchone()[0]
print(f"\n  Total money in system: ${total:.2f}")
print(f"  Expected:              $1500.00")
print(f"  Money lost:            ${1500.00 - total:.2f}")


# --- Test 2: Successful transfer ---
print("\n")
print("=" * 50)
print("TEST 2: Successful transfer (both changes commit)")
print("=" * 50)

setup_accounts(conn)  # Reset to $1000/$500

print("\nInitial state:")
print_balances(conn, "before transfer")

transfer_with_transaction(conn, from_id=1, to_id=2, amount=100.00, simulate_crash=False)

print("\nState AFTER successful transfer:")
print_balances(conn, "after transfer")

cursor = conn.execute("SELECT SUM(balance) FROM accounts")
total = cursor.fetchone()[0]
print(f"\n  Total money in system: ${total:.2f}")
print(f"  Expected:              $1500.00")

conn.close()
os.remove("bank_tx.db")
```

### SAVE AND TRY

```
python 02_with_transaction.py
```

Expected output:
```
==================================================
TEST 1: Crash during transaction (money is safe)
==================================================

Initial state:

  [before transfer]
    Alice       $1000.00
    Bob         $500.00
  Transaction started.
  Debited $100.00 from account #1 (not yet committed)
  *** CRASH before credit! ***
  Transaction ROLLED BACK — no changes applied.
  Error: Crash after debit, before credit.

State AFTER the crash:

  [after crash]
    Alice       $1000.00
    Bob         $500.00

  Total money in system: $1500.00
  Expected:              $1500.00
  Money lost:            $0.00


==================================================
TEST 2: Successful transfer (both changes commit)
==================================================

Initial state:

  [before transfer]
    Alice       $1000.00
    Bob         $500.00
  Transaction started.
  Debited $100.00 from account #1 (not yet committed)
  Credited $100.00 to account #2 (not yet committed)
  Transaction COMMITTED — both changes are now permanent.

State AFTER successful transfer:

  [after transfer]
    Alice       $900.00
    Bob         $600.00

  Total money in system: $1500.00
  Expected:              $1500.00
```

Test 1: The crash happens. The rollback fires. Alice still has $1000. Bob still has $500. Total is $1500. Zero money lost — because the debit was never committed.

Test 2: Both writes commit together. Alice has $900, Bob has $600. Conservation holds.

**Change something:** In Test 1, look at the balances after the crash — they're identical to the initial state. Now go back to `01_no_transaction.py` and look at the balances after its crash. That's the difference between "atomicity" and "no atomicity."

---

## Step 3 — Rollback: The Explicit Undo

Demonstrate rollback directly — not as a crash recovery mechanism, but as a deliberate undo.

Create `03_rollback.py`:

```python
# 03_rollback.py
# Explicit ROLLBACK — deliberately undoing a transaction.
#
# Use case: you start a transfer, check a business rule partway through,
# and decide the operation should not proceed. ROLLBACK undoes all of it.

import sqlite3
import os


def setup_accounts(conn):
    conn.execute("DROP TABLE IF EXISTS accounts")
    conn.execute("""
        CREATE TABLE accounts (
            id      INTEGER PRIMARY KEY,
            owner   TEXT NOT NULL,
            balance REAL NOT NULL
        )
    """)
    conn.execute("INSERT INTO accounts VALUES (1, 'Alice', 1000.00)")
    conn.execute("INSERT INTO accounts VALUES (2, 'Bob',    500.00)")
    conn.commit()


def print_balances(conn, label=""):
    if label:
        print(f"\n  [{label}]")
    cursor = conn.execute("SELECT owner, balance FROM accounts ORDER BY id")
    for row in cursor:
        print(f"    {row[0]:10s}  ${row[1]:.2f}")


def safe_transfer(conn, from_id: int, to_id: int, amount: float):
    """
    Transfer with a business rule check: sender must have sufficient funds.
    If the check fails, ROLLBACK — no partial state.
    """
    conn.execute("BEGIN")

    # Read the sender's current balance.
    # This read is inside the transaction — we see the current committed state.
    cursor = conn.execute(
        "SELECT owner, balance FROM accounts WHERE id = ?",
        (from_id,)
    )
    row = cursor.fetchone()
    if row is None:
        conn.execute("ROLLBACK")
        print(f"  ROLLBACK: account #{from_id} does not exist.")
        return

    owner, balance = row[0], row[1]
    print(f"  {owner}'s balance: ${balance:.2f}")

    # Business rule: cannot overdraft.
    if balance < amount:
        # The debit hasn't even happened yet, but we still ROLLBACK cleanly.
        conn.execute("ROLLBACK")
        print(f"  ROLLBACK: insufficient funds. Needed ${amount:.2f}, have ${balance:.2f}.")
        return

    # Debit — still inside the transaction, not committed yet.
    conn.execute(
        "UPDATE accounts SET balance = balance - ? WHERE id = ?",
        (amount, from_id)
    )

    # Credit.
    conn.execute(
        "UPDATE accounts SET balance = balance + ? WHERE id = ?",
        (amount, to_id)
    )

    conn.execute("COMMIT")
    print(f"  Transfer of ${amount:.2f} committed successfully.")


conn = sqlite3.connect("bank_rollback.db")
setup_accounts(conn)

print_balances(conn, "initial")

# Transfer that succeeds
print("\n--- Transfer $200 from Alice to Bob (sufficient funds) ---")
safe_transfer(conn, from_id=1, to_id=2, amount=200.00)
print_balances(conn, "after $200 transfer")

# Transfer that fails the business rule
print("\n--- Transfer $900 from Alice to Bob (insufficient funds) ---")
# Alice now has $800, so $900 is too much.
safe_transfer(conn, from_id=1, to_id=2, amount=900.00)
print_balances(conn, "after failed transfer attempt")

# Verify conservation
cursor = conn.execute("SELECT SUM(balance) FROM accounts")
total = cursor.fetchone()[0]
print(f"\n  Total in system: ${total:.2f} (should be $1500.00)")

conn.close()
os.remove("bank_rollback.db")
```

### SAVE AND TRY

```
python 03_rollback.py
```

Expected output:
```
  [initial]
    Alice       $1000.00
    Bob         $500.00

--- Transfer $200 from Alice to Bob (sufficient funds) ---
  Alice's balance: $1000.00
  Transfer of $200.00 committed successfully.

  [after $200 transfer]
    Alice       $800.00
    Bob         $700.00

--- Transfer $900 from Alice to Bob (insufficient funds) ---
  Alice's balance: $800.00
  ROLLBACK: insufficient funds. Needed $900.00, have $800.00.

  [after failed transfer attempt]
    Alice       $800.00
    Bob         $700.00

  Total in system: $1500.00 (should be $1500.00)
```

The rollback leaves the database unchanged. The second attempt — which would have overdrawn Alice — had no effect at all. The balances after the failed attempt are identical to the balances before it.

**Change something:** Remove the `conn.execute("ROLLBACK")` call in the "insufficient funds" branch and run again. The balances are still unchanged — because the debit hadn't happened yet. Now move the rollback removal to the point after the debit, run again, and try to observe partial state. This demonstrates that rollback cleans up writes that did happen inside the transaction.

---

## Step 4 — Dirty Reads: What Isolation Protects You From

Demonstrate the dirty read problem — reading data that another transaction has not yet committed.

SQLite in WAL mode allows a second connection to observe this. We use threading to simulate two concurrent connections.

Create `04_dirty_read.py`:

```python
# 04_dirty_read.py
# Demonstrating isolation and dirty reads.
#
# A dirty read: Connection B reads data that Connection A has written
# inside an open transaction — before A has committed or rolled back.
# If A rolls back, B has read data that officially never existed.
#
# SQLite's default isolation prevents dirty reads internally, but we can
# OBSERVE the isolation boundary: one connection cannot see another's
# uncommitted writes. Then we'll show what a dirty read WOULD look like
# using a manual simulation (since SQLite doesn't allow READ UNCOMMITTED).

import sqlite3
import threading
import time
import os


DB_PATH = "bank_isolation.db"


def setup():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DROP TABLE IF EXISTS accounts")
    conn.execute("""
        CREATE TABLE accounts (
            id      INTEGER PRIMARY KEY,
            owner   TEXT NOT NULL,
            balance REAL NOT NULL
        )
    """)
    conn.execute("INSERT INTO accounts VALUES (1, 'Alice', 1000.00)")
    conn.execute("INSERT INTO accounts VALUES (2, 'Bob',    500.00)")
    conn.commit()
    conn.close()


# --- PART 1: Demonstrating that SQLite prevents dirty reads ---
# Connection A starts a transaction and modifies a row.
# Connection B reads the same row BEFORE A commits.
# Connection B sees the OLD value — the committed value.
# This is correct behavior: B is isolated from A's uncommitted changes.

def connection_a_transfer(results: dict):
    """
    Connection A: start a transfer but don't commit immediately.
    Hold the transaction open so Connection B can try to read during it.
    """
    conn_a = sqlite3.connect(DB_PATH)
    conn_a.execute("BEGIN")
    
    # Debit Alice — this is NOT committed yet.
    conn_a.execute("UPDATE accounts SET balance = balance - 100 WHERE id = 1")
    print("  [A] Debited Alice $100 inside open transaction (NOT committed)")
    
    # Signal that we've written but not committed.
    results["a_written"] = True
    
    # Wait for Connection B to read.
    while not results.get("b_read"):
        time.sleep(0.05)
    
    # Now roll back — the debit never officially happened.
    conn_a.execute("ROLLBACK")
    print("  [A] ROLLED BACK — the debit is undone")
    results["a_done"] = True
    conn_a.close()


def connection_b_read(results: dict):
    """
    Connection B: read Alice's balance while Connection A has an open transaction.
    """
    # Wait for Connection A to write but not commit.
    while not results.get("a_written"):
        time.sleep(0.05)
    
    conn_b = sqlite3.connect(DB_PATH)
    cursor = conn_b.execute("SELECT balance FROM accounts WHERE id = 1")
    balance = cursor.fetchone()[0]
    print(f"  [B] Alice's balance while A's transaction is open: ${balance:.2f}")
    print(f"  [B] (A debited $100 but hasn't committed — B sees the COMMITTED value)")
    results["b_balance"] = balance
    results["b_read"] = True
    conn_b.close()


print("=" * 55)
print("PART 1: SQLite isolation — B cannot see A's uncommitted write")
print("=" * 55)

setup()
results = {}

thread_a = threading.Thread(target=connection_a_transfer, args=(results,))
thread_b = threading.Thread(target=connection_b_read, args=(results,))

thread_a.start()
thread_b.start()
thread_a.join()
thread_b.join()

# B should have read $1000, not $900, because A never committed.
b_saw = results["b_balance"]
print(f"\n  Connection B saw: ${b_saw:.2f}")
print(f"  Correct value (committed): $1000.00")
print(f"  A had written $900.00 (uncommitted) — B correctly did NOT see it.")
if b_saw == 1000.0:
    print("  ISOLATION WORKING: dirty read prevented.")
else:
    print("  ISOLATION FAILED: dirty read occurred.")


# --- PART 2: Simulating what a dirty read looks like ---
# We simulate a dirty read by bypassing isolation deliberately —
# reading from within the SAME connection as the uncommitted write.
# This models what READ UNCOMMITTED isolation level would allow.

print("\n")
print("=" * 55)
print("PART 2: What a dirty read LOOKS LIKE (simulated)")
print("=" * 55)
print()
print("  Scenario: System reads Alice's balance AFTER an in-flight debit")
print("  but BEFORE the transaction commits or rolls back.")
print("  If the transaction rolls back, the system acted on data that")
print("  never officially existed.")
print()

setup()

conn = sqlite3.connect(DB_PATH)

# Begin a transfer transaction.
conn.execute("BEGIN")
conn.execute("UPDATE accounts SET balance = balance - 100 WHERE id = 1")
print("  Transaction open. Alice debited $100. NOT committed.")

# Dirty read: reading inside the same connection sees the uncommitted write.
# This is equivalent to READ UNCOMMITTED — seeing your own transaction's writes
# before deciding whether to commit or roll back.
cursor = conn.execute("SELECT balance FROM accounts WHERE id = 1")
balance_during_tx = cursor.fetchone()[0]
print(f"  Reading Alice's balance inside the open transaction: ${balance_during_tx:.2f}")
print(f"  This is the DIRTY value — $900 — the transaction hasn't committed yet.")

# Make a business decision based on the dirty read.
print(f"  System decides: Alice has ${balance_during_tx:.2f}, so she can afford another $800 transfer? {balance_during_tx >= 800}")

# Now the transaction rolls back — the debit never happened.
conn.execute("ROLLBACK")
print("  Transaction ROLLED BACK.")

# But the business decision was already made based on the dirty read.
cursor = conn.execute("SELECT balance FROM accounts WHERE id = 1")
actual_balance = cursor.fetchone()[0]
print(f"  Alice's ACTUAL balance after rollback: ${actual_balance:.2f}")
print(f"  The system thought she had ${balance_during_tx:.2f} — that value never existed.")

conn.close()


# --- PART 3: The fix — read AFTER commitment, use proper isolation ---
print("\n")
print("=" * 55)
print("PART 3: The fix — always read committed data")
print("=" * 55)

setup()

conn_writer = sqlite3.connect(DB_PATH)
conn_reader = sqlite3.connect(DB_PATH)

# Writer starts a transaction.
conn_writer.execute("BEGIN")
conn_writer.execute("UPDATE accounts SET balance = balance - 100 WHERE id = 1")
print("  Writer debited Alice $100 (uncommitted)")

# Reader reads Alice's balance from a SEPARATE connection.
# SQLite's isolation ensures the reader sees only committed data.
cursor = conn_reader.execute("SELECT balance FROM accounts WHERE id = 1")
balance = cursor.fetchone()[0]
print(f"  Reader sees Alice's balance: ${balance:.2f} (the committed value — $1000)")
print(f"  Reader is isolated from the writer's uncommitted debit.")

# Writer commits.
conn_writer.execute("COMMIT")
print("  Writer committed.")

# Now the reader sees the new committed value.
cursor = conn_reader.execute("SELECT balance FROM accounts WHERE id = 1")
balance_after = cursor.fetchone()[0]
print(f"  Reader sees Alice's balance after commit: ${balance_after:.2f} (now $900)")

conn_writer.close()
conn_reader.close()

os.remove(DB_PATH)
```

### SAVE AND TRY

```
python 04_dirty_read.py
```

Expected output:
```
=======================================================
PART 1: SQLite isolation — B cannot see A's uncommitted write
=======================================================
  [A] Debited Alice $100 inside open transaction (NOT committed)
  [B] Alice's balance while A's transaction is open: $1000.00
  [B] (A debited $100 but hasn't committed — B sees the COMMITTED value)
  [A] ROLLED BACK — the debit is undone

  Connection B saw: $1000.00
  Correct value (committed): $1000.00
  A had written $900.00 (uncommitted) — B correctly did NOT see it.
  ISOLATION WORKING: dirty read prevented.


=======================================================
PART 2: What a dirty read LOOKS LIKE (simulated)
=======================================================

  Scenario: System reads Alice's balance AFTER an in-flight debit
  but BEFORE the transaction commits or rolls back.
  If the transaction rolls back, the system acted on data that
  never officially existed.

  Transaction open. Alice debited $100. NOT committed.
  Reading Alice's balance inside the open transaction: $900.00
  This is the DIRTY value — $900 — the transaction hasn't committed yet.
  System decides: Alice has $900.00, so she can afford another $800 transfer? False
  Transaction ROLLED BACK.
  Alice's ACTUAL balance after rollback: $1000.00
  The system thought she had $900.00 — that value never existed.


=======================================================
PART 3: The fix — read AFTER commitment, use proper isolation
=======================================================
  Writer debited Alice $100 (uncommitted)
  Reader sees Alice's balance: $1000.00 (the committed value — $1000)
  Reader is isolated from the writer's uncommitted debit.
  Writer committed.
  Reader sees Alice's balance after commit: $900.00 (now $900)
```

Part 1: Connection B reads Alice's balance while Connection A has an open transaction that debited her. B sees $1000 — the committed value — not $900. The isolation is working.

Part 2: What it looks like when your own code reads dirty data — acting on a value that gets rolled back. The system thought Alice had $900, made a decision, then the transaction rolled back and Alice actually had $1000.

Part 3: Two separate connections, proper isolation, both reading only committed values.

**Change something:** In Part 3, try reading again with `conn_reader` without closing and reopening. You get $900 — the committed value after the write. This is READ COMMITTED behavior: each new read sees the latest committed state.

---

## What You Just Built

| File | What it shows |
|------|--------------|
| `01_no_transaction.py` | $100 lost — auto-commit is fatal for multi-step operations |
| `02_with_transaction.py` | Atomicity — crash-proof debit+credit, both or neither |
| `03_rollback.py` | Deliberate rollback on business rule failure — no partial state |
| `04_dirty_read.py` | Isolation — what a dirty read is and how SQLite prevents it |

The progression: no protection → atomic protection → explicit rollback → isolation levels.

---

## Challenge

Simulate a double-spend attack: two concurrent connections that both check Alice's balance, find sufficient funds, and initiate a transfer. Without proper isolation, both transfers complete — Alice's account goes negative.

**Requirements:**
- Alice starts with $100
- Two concurrent transfers each want to send $75 (only one can succeed — $75 + $75 = $150 > $100)
- Without protection: both succeed, Alice ends at -$50 (negative balance)
- With protection: only one succeeds, Alice ends at $25

**What to implement:**
1. The vulnerable version — two threads both read the balance, both see $100, both proceed. Show Alice going negative.
2. The protected version — use a transaction that reads and writes atomically, so the second transfer sees the updated balance and fails the balance check. Use `BEGIN IMMEDIATE` in SQLite (this acquires a write lock immediately, so concurrent writers queue up rather than reading stale data).

**Starter — `double_spend.py`:**
```python
import sqlite3
import threading
import time
import os

DB = "double_spend.db"

def setup():
    conn = sqlite3.connect(DB)
    conn.execute("DROP TABLE IF EXISTS accounts")
    conn.execute("CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT, balance REAL)")
    conn.execute("INSERT INTO accounts VALUES (1, 'Alice', 100.00)")
    conn.commit()
    conn.close()

def print_balance(label=""):
    conn = sqlite3.connect(DB)
    cursor = conn.execute("SELECT balance FROM accounts WHERE id = 1")
    balance = cursor.fetchone()[0]
    conn.close()
    if label:
        print(f"  [{label}] Alice: ${balance:.2f}")
    return balance


# --- Vulnerable transfer (no protection) ---
def vulnerable_transfer(transfer_id: int, amount: float, results: list):
    """Both threads read before either writes — race condition."""
    conn = sqlite3.connect(DB)
    
    # Simulate realistic delay between read and write
    balance = conn.execute("SELECT balance FROM accounts WHERE id = 1").fetchone()[0]
    print(f"  [Transfer {transfer_id}] Read balance: ${balance:.2f}")
    
    time.sleep(0.1)  # Other thread reads here too, before either writes
    
    if balance >= amount:
        conn.execute("UPDATE accounts SET balance = balance - ? WHERE id = 1", (amount,))
        conn.commit()
        print(f"  [Transfer {transfer_id}] Transferred ${amount:.2f} — COMMITTED")
        results.append("success")
    else:
        print(f"  [Transfer {transfer_id}] Insufficient funds — rejected")
        results.append("failed")
    
    conn.close()


# --- Your task: implement protected_transfer ---
def protected_transfer(transfer_id: int, amount: float, results: list):
    """
    Use BEGIN IMMEDIATE to prevent the double-spend.
    BEGIN IMMEDIATE acquires a write lock at the start of the transaction.
    The second connection blocks until the first commits or rolls back.
    """
    # Your code here
    pass


# Test vulnerable version
print("=== VULNERABLE (double-spend) ===")
setup()
results = []
t1 = threading.Thread(target=vulnerable_transfer, args=(1, 75.0, results))
t2 = threading.Thread(target=vulnerable_transfer, args=(2, 75.0, results))
t1.start(); t2.start()
t1.join(); t2.join()
final = print_balance("final")
print(f"  Results: {results}")
print(f"  Both succeeded: {results.count('success') == 2}")
print(f"  Alice negative: {final < 0}")

# Test protected version
print("\n=== PROTECTED (BEGIN IMMEDIATE) ===")
setup()
results = []
t1 = threading.Thread(target=protected_transfer, args=(1, 75.0, results))
t2 = threading.Thread(target=protected_transfer, args=(2, 75.0, results))
t1.start(); t2.start()
t1.join(); t2.join()
final = print_balance("final")
print(f"  Results: {results}")
print(f"  Only one succeeded: {results.count('success') == 1}")
print(f"  Alice non-negative: {final >= 0}")

os.remove(DB)
```

**When done, your output should show:**

For the vulnerable version:
```
  [Transfer 1] Read balance: $100.00
  [Transfer 2] Read balance: $100.00
  [Transfer 1] Transferred $75.00 — COMMITTED
  [Transfer 2] Transferred $75.00 — COMMITTED
  [final] Alice: $-50.00
  Both succeeded: True
  Alice negative: True
```

For the protected version:
```
  [Transfer 1] Read balance: $100.00
  [Transfer 1] Transferred $75.00 — COMMITTED
  [Transfer 2] Read balance: $25.00
  [Transfer 2] Insufficient funds — rejected
  [final] Alice: $25.00
  Only one succeeded: True
  Alice non-negative: True
```

**Stuck? Ask AI:**
> "My protected_transfer function still allows the double-spend. I'm using BEGIN IMMEDIATE but both transfers still see $100. Here's my code: [paste]. What am I missing about when the read happens relative to the lock?"

**Hint:** `BEGIN IMMEDIATE` prevents other writers from starting. But if the read happens before `BEGIN IMMEDIATE`, the race condition still exists. The read must happen inside the transaction, after `BEGIN IMMEDIATE`.

---

## Quick Check Answers

1. **You run two SQL statements: `UPDATE accounts SET balance = balance - 100 WHERE id = 1` then the process crashes. What happens to the database?**
   The first statement auto-committed immediately — it is permanent. The second statement never ran. The database is now in a partial state: the debit happened, but whatever the second statement was meant to do did not. There is no automatic undo. This is why multi-step operations require explicit transactions.

2. **What does "atomic" mean in the context of a database transaction?**
   All-or-nothing. Either every statement in the transaction commits together, or none of them do. The database has no intermediate state where some statements committed and others did not. From the perspective of any observer, the transaction either fully happened or fully did not.

3. **A transaction has been started but not committed. Can another connection read its changes?**
   With default isolation (READ COMMITTED or higher): no. The other connection sees the last committed state. The uncommitted changes are invisible to it. This is isolation — concurrent connections do not see each other's in-flight work. If isolation is READ UNCOMMITTED, the answer is yes — that's a dirty read.

4. **What is the difference between `COMMIT` and `ROLLBACK`?**
   `COMMIT` makes all changes in the current transaction permanent and visible to other connections. `ROLLBACK` undoes all changes made since `BEGIN` — the database returns to the state it was in before the transaction started. After either operation, the transaction is over and a new one must be explicitly started.
