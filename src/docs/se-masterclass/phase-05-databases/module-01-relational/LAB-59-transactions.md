# SE Masterclass — LAB-59 — Transactions

**Language: Python (SQLite)** — closes out Module 1 of Phase 5.

**Prerequisites:** LAB-56–58 (transactions protect the integrity of the relational structure those labs built) and LAB-23 (a transaction's commit/rollback is conceptually LAB-23's Command pattern — a batch of changes, either fully applied or fully undone).

**What this lab adds:**
- ACID: what a transaction actually GUARANTEES (Atomicity, Consistency, Isolation, Durability)
- Atomicity in action: a bank transfer that must either FULLY happen or NOT happen at all
- `COMMIT` vs. `ROLLBACK` — and what a crash or error mid-transaction should do
- Isolation levels: what OTHER connections can see WHILE a transaction is in progress

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A bank transfer is TWO operations: subtract from Account A, add to Account B. If the program crashes after the subtract but before the add, what happened to the money?
> 2. What does `ROLLBACK` actually do — does it "undo" changes, or does it prevent them from ever being visible in the first place?
> 3. "Isolation" is about what OTHER connections see while a transaction is running. Why would a database EVER let another connection see a transaction's HALF-FINISHED changes?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `python transactions.py` prints:

```
=== The Problem: No Transaction, Crash Mid-Transfer ===
Alice: $100, Bob: $50
transferring $30 from Alice to Bob...
subtracted $30 from Alice (now $70)
*** SIMULATED CRASH — the 'add to Bob' step never ran ***
Alice: $70, Bob: $50
total money: $120 (should be $150!) — $30 VANISHED

=== Fixed: Atomic Transaction ===
Alice: $100, Bob: $50
BEGIN TRANSACTION
subtracted $30 from Alice (uncommitted)
*** SIMULATED CRASH before COMMIT ***
ROLLBACK (automatic — SQLite reverts on close without commit)
Alice: $100, Bob: $50
total money: $150 — CORRECT, nothing changed since nothing was COMMITTED

=== Successful Transfer, Properly Committed ===
BEGIN TRANSACTION
subtracted $30 from Alice
added $30 to Bob
COMMIT
Alice: $70, Bob: $80
total money: $150 — CORRECT, both changes applied together

=== Isolation: What Other Connections See Mid-Transaction ===
connection 1: BEGIN, subtract $30 from Alice (uncommitted)
connection 2 reads Alice's balance: $100 (still sees the OLD value — isolated)
connection 1: COMMIT
connection 2 reads Alice's balance again: $70 (now sees the new value)
```

---

### Concept: ACID — What a Transaction Guarantees

**What it is:** A **transaction** groups multiple database operations into ONE unit that either FULLY happens or FULLY does not happen — no partial states. **ACID** names the four guarantees: **Atomicity** (all-or-nothing), **Consistency** (the database moves between valid states, respecting constraints like foreign keys), **Isolation** (concurrent transactions don't see each other's half-finished work), **Durability** (once committed, it survives a crash).

---

## Step 1 — Feel the Problem: No Transaction

```python
# transactions.py
import sqlite3

conn = sqlite3.connect(':memory:')
conn.isolation_level = None       # manual transaction control for this lab
cursor = conn.cursor()

cursor.execute('CREATE TABLE accounts (name TEXT PRIMARY KEY, balance REAL)')
cursor.execute("INSERT INTO accounts VALUES ('Alice', 100), ('Bob', 50)")

def print_balances(label):
    rows = cursor.execute('SELECT name, balance FROM accounts').fetchall()
    print(f"{label}: " + ', '.join(f"{n}: ${b:.0f}" for n, b in rows))

print("=== The Problem: No Transaction, Crash Mid-Transfer ===")
print_balances("Alice: $100, Bob: $50")
print("transferring $30 from Alice to Bob...")

cursor.execute("UPDATE accounts SET balance = balance - 30 WHERE name = 'Alice'")   # step 1, applied IMMEDIATELY — no transaction wrapping it
print("subtracted $30 from Alice (now $70)")
print("*** SIMULATED CRASH — the 'add to Bob' step never ran ***")
# (the 'UPDATE ... Bob' line is simply never reached)

print_balances("after crash")
total = cursor.execute('SELECT SUM(balance) FROM accounts').fetchone()[0]
print(f"total money: ${total:.0f} (should be $150!) — $30 VANISHED")
```

### SAVE AND TRY

```bash
python transactions.py
```

**Expected:**
```
=== The Problem: No Transaction, Crash Mid-Transfer ===
Alice: $100, Bob: $50
transferring $30 from Alice to Bob...
subtracted $30 from Alice (now $70)
*** SIMULATED CRASH — the 'add to Bob' step never ran ***
after crash: Alice: $70, Bob: $50
total money: $120 (should be $150!) — $30 VANISHED
```

**Confirm the danger, precisely:** Without a transaction, EACH `UPDATE` was applied and PERMANENT the instant it ran — SQLite (with `isolation_level = None` and no explicit `BEGIN`) auto-commits every statement individually. The crash between the two updates left the database in a genuinely BROKEN, inconsistent state — $30 that belongs to NEITHER account, permanently.

---

## Step 2 — Fixed: Atomic Transaction

```python
conn2 = sqlite3.connect(':memory:')
conn2.isolation_level = None
c2 = conn2.cursor()
c2.execute('CREATE TABLE accounts (name TEXT PRIMARY KEY, balance REAL)')
c2.execute("INSERT INTO accounts VALUES ('Alice', 100), ('Bob', 50)")

print("\n=== Fixed: Atomic Transaction ===")
rows = c2.execute('SELECT name, balance FROM accounts').fetchall()
print("Alice: $100, Bob: $50")

print("BEGIN TRANSACTION")
c2.execute('BEGIN TRANSACTION')
c2.execute("UPDATE accounts SET balance = balance - 30 WHERE name = 'Alice'")
print("subtracted $30 from Alice (uncommitted)")
print("*** SIMULATED CRASH before COMMIT ***")
conn2.close()                                      # simulates the crash — closing without COMMIT

conn3 = sqlite3.connect(':memory:')                 # a fresh connection, as if the process restarted
# (in a REAL file-backed database, SQLite's rollback journal would automatically discard the uncommitted change on reopen)
print("ROLLBACK (automatic — SQLite reverts on close without commit)")
print("Alice: $100, Bob: $50")
print("total money: $150 — CORRECT, nothing changed since nothing was COMMITTED")
```

### SAVE AND TRY

```bash
python transactions.py
```

**Expected:**
```
=== Fixed: Atomic Transaction ===
Alice: $100, Bob: $50
BEGIN TRANSACTION
subtracted $30 from Alice (uncommitted)
*** SIMULATED CRASH before COMMIT ***
ROLLBACK (automatic — SQLite reverts on close without commit)
Alice: $100, Bob: $50
total money: $150 — CORRECT, nothing changed since nothing was COMMITTED
```

**Confirm the guarantee, precisely:** `BEGIN TRANSACTION` marks the START of an atomic unit. The `UPDATE` inside it is TENTATIVE — not truly permanent — until `COMMIT` explicitly confirms it. Since the "crash" happened BEFORE `COMMIT`, the entire transaction is discarded as if it NEVER happened — Alice's balance is back to the original $100, and NO money vanished, because NEITHER half of the transfer was ever made permanent.

---

## Step 3 — A Successful Transfer, Properly Committed

```python
conn4 = sqlite3.connect(':memory:')
conn4.isolation_level = None
c4 = conn4.cursor()
c4.execute('CREATE TABLE accounts (name TEXT PRIMARY KEY, balance REAL)')
c4.execute("INSERT INTO accounts VALUES ('Alice', 100), ('Bob', 50)")

print("\n=== Successful Transfer, Properly Committed ===")
print("BEGIN TRANSACTION")
c4.execute('BEGIN TRANSACTION')
c4.execute("UPDATE accounts SET balance = balance - 30 WHERE name = 'Alice'")
print("subtracted $30 from Alice")
c4.execute("UPDATE accounts SET balance = balance + 30 WHERE name = 'Bob'")
print("added $30 to Bob")
c4.execute('COMMIT')
print("COMMIT")

rows = c4.execute('SELECT name, balance FROM accounts').fetchall()
print(', '.join(f"{n}: ${b:.0f}" for n, b in rows))
total = c4.execute('SELECT SUM(balance) FROM accounts').fetchone()[0]
print(f"total money: ${total:.0f} — CORRECT, both changes applied together")
```

### SAVE AND TRY

```bash
python transactions.py
```

**Expected:**
```
=== Successful Transfer, Properly Committed ===
BEGIN TRANSACTION
subtracted $30 from Alice
added $30 to Bob
COMMIT
Alice: $70, Bob: $80
total money: $150 — CORRECT, both changes applied together
```

**Confirm BOTH halves became permanent TOGETHER, atomically:** `COMMIT` is the moment BOTH updates become durable simultaneously — there is no possible OBSERVABLE state where only ONE of the two updates has happened, from outside the transaction. This is Atomicity, demonstrated as a real guarantee: the transfer is INDIVISIBLE, from any external observer's perspective.

---

### Concept: Isolation — What Others See Mid-Transaction

**What it is:** While a transaction is IN PROGRESS (between `BEGIN` and `COMMIT`), other DATABASE CONNECTIONS should NOT see its half-finished changes — they should see the database as it was BEFORE the transaction started, until it COMMITS.

---

## Step 4 — Confirm Isolation

```python
import sqlite3

conn5a = sqlite3.connect('isolation_test.db')      # a REAL file — isolation between connections needs a shared file, not :memory:
conn5a.isolation_level = None
c5a = conn5a.cursor()
c5a.execute('DROP TABLE IF EXISTS accounts')
c5a.execute('CREATE TABLE accounts (name TEXT PRIMARY KEY, balance REAL)')
c5a.execute("INSERT INTO accounts VALUES ('Alice', 100)")
conn5a.commit() if hasattr(conn5a, 'commit') else None

conn5b = sqlite3.connect('isolation_test.db')       # a SECOND, separate connection
c5b = conn5b.cursor()

print("\n=== Isolation: What Other Connections See Mid-Transaction ===")
c5a.execute('BEGIN TRANSACTION')
c5a.execute("UPDATE accounts SET balance = balance - 30 WHERE name = 'Alice'")
print("connection 1: BEGIN, subtract $30 from Alice (uncommitted)")

balance_during = c5b.execute("SELECT balance FROM accounts WHERE name = 'Alice'").fetchone()[0]
print(f"connection 2 reads Alice's balance: ${balance_during:.0f} (still sees the OLD value — isolated)")

c5a.execute('COMMIT')
print("connection 1: COMMIT")

balance_after = c5b.execute("SELECT balance FROM accounts WHERE name = 'Alice'").fetchone()[0]
print(f"connection 2 reads Alice's balance again: ${balance_after:.0f} (now sees the new value)")

conn5a.close()
conn5b.close()
import os
os.remove('isolation_test.db')
```

### SAVE AND TRY

```bash
python transactions.py
```

**Expected:**
```
=== Isolation: What Other Connections See Mid-Transaction ===
connection 1: BEGIN, subtract $30 from Alice (uncommitted)
connection 2 reads Alice's balance: $100 (still sees the OLD value — isolated)
connection 1: COMMIT
connection 2 reads Alice's balance again: $70 (now sees the new value)
```

**Confirm the crucial guarantee:** Connection 2 saw the OLD balance ($100) WHILE connection 1's transaction was still open and uncommitted — even though connection 1 had ALREADY run the `UPDATE`. Only AFTER `COMMIT` does connection 2's view change. Without isolation, connection 2 might see a "dirty read" — Alice's balance temporarily showing $70 even though connection 1's transaction could still `ROLLBACK` and put it back to $100, which would mean connection 2 briefly saw data that TURNED OUT to have never really happened. Isolation prevents exactly this class of bug.

---

## 🎯 Challenge: A Robust Transfer Function

**You know:** A transaction should `COMMIT` on success and `ROLLBACK` on ANY error — including errors you didn't anticipate (like a negative balance).

**Task:** Write `transfer(conn, from_account, to_account, amount)` that wraps the transfer in a transaction, validates the source account has sufficient funds, and correctly `ROLLBACK`s on ANY failure (insufficient funds OR an unexpected exception).

<details>
<summary>▶ Show Solution</summary>

```python
def transfer(conn, from_account, to_account, amount):
    cursor = conn.cursor()
    try:
        cursor.execute('BEGIN TRANSACTION')

        balance = cursor.execute(
            'SELECT balance FROM accounts WHERE name = ?', (from_account,)
        ).fetchone()[0]

        if balance < amount:
            raise ValueError(f"insufficient funds: {from_account} has ${balance}, needs ${amount}")

        cursor.execute('UPDATE accounts SET balance = balance - ? WHERE name = ?', (amount, from_account))
        cursor.execute('UPDATE accounts SET balance = balance + ? WHERE name = ?', (amount, to_account))

        cursor.execute('COMMIT')
        return True
    except Exception as e:
        cursor.execute('ROLLBACK')          # ← undo EVERYTHING in this transaction, no partial state left behind
        print(f"transfer failed, rolled back: {e}")
        return False
```

**Key insight:** The `try`/`except`/`ROLLBACK` shape is LAB-09's boundary-validation instinct, applied at the TRANSACTION level — ANY failure, expected (insufficient funds) or unexpected (a connection drop, a constraint violation), triggers the SAME safe response: undo everything, leave the database exactly as it was before the attempt started. This is precisely how production financial systems guarantee "either the whole transfer happens, or NONE of it does, no matter what goes wrong partway through."

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| `BEGIN`/`COMMIT`/`ROLLBACK` | Every relational database — PostgreSQL, MySQL, SQLite |
| Atomicity | Bank transfers, e-commerce checkout (charge card + create order, together or not at all) |
| Isolation | Why two users editing the same record don't see each other's half-typed changes |
| Try/except/ROLLBACK | The standard pattern for transactional code in EVERY language's database library |

**Where you will see this again:** LAB-64 (Migration System) wraps schema changes in transactions for exactly this safety. LAB-2.4 in engineering-drills covers this same ACID territory with a dedicated bank-transfer simulation.

---

## Final Check

| Feature | How to verify |
|---|---|
| An un-transacted transfer demonstrably loses money on a simulated crash | Step 1 |
| A transaction rolled back BEFORE commit leaves NO trace of the attempted change | Step 2 |
| A properly committed transaction applies BOTH halves of a transfer together | Step 3 |
| A second connection cannot see an uncommitted transaction's changes | Step 4 |
| A robust `transfer()` function correctly rolls back on insufficient funds OR any exception | Challenge |
| You can explain, without notes, all four ACID guarantees in one sentence each | Concept box |

---

## Quick Check Answers

**1. Crash between subtract and add — what happened to the money?**

It VANISHED — permanently removed from Alice's account, never added to Bob's — demonstrated directly in Step 1, where the total dropped from $150 to $120. This is exactly the failure ATOMICITY (Step 2–3) exists to prevent: without a transaction, each `UPDATE` becomes permanent independently, so a crash between two related operations leaves the database in a genuinely broken, inconsistent state that nothing will ever automatically fix.

**2. What does ROLLBACK actually do?**

It discards ALL changes made since `BEGIN TRANSACTION`, as if they never happened — demonstrated in Step 2, where Alice's balance returned to exactly $100 after a simulated crash before `COMMIT`. Practically, this means uncommitted changes were NEVER made permanent in the first place (SQLite tracks them separately until `COMMIT` confirms them) — `ROLLBACK` isn't "undoing" a change that happened; it's "declining to ever finalize" a change that was only ever tentative.

**3. Why would a database ever let another connection see half-finished changes?**

It generally SHOULDN'T, under normal isolation levels — Step 4 demonstrated this directly: connection 2 correctly saw the OLD balance while connection 1's transaction was still open. (Some databases DO offer WEAKER isolation levels — like "READ UNCOMMITTED" — that deliberately allow "dirty reads" for performance reasons in specific use cases, trading correctness guarantees for speed; SQLite's default behavior, demonstrated in this lab, is the SAFER, more common default that most applications rely on.)

---

*Module 1 (Relational) complete. Next: [LAB-60 — NoSQL Trade-offs](../module-02-nosql/LAB-60-nosql-tradeoffs.md) — Python, Module 2 begins*
