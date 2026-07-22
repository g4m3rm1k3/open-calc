# Concept: SQL Transactions and `commit`

**What you'll understand by the end:** why a database change isn't actually saved until explicitly committed, and what that buys you.

**Prerequisites:** `sql-insert-select-where.md`.

## Setup

Python 3 with its standard-library `sqlite3` module — no install needed.

## The Problem

Some real-world operations need several individual database changes to happen together, as one unit — transferring money between two accounts, for instance, requires both a debit and a credit to succeed together, or neither should take effect at all; a failure partway through (crediting one account, then crashing before debiting the other) would leave the data in a genuinely inconsistent, incorrect state.

## The Isolated Example

```python
import sqlite3

connection = sqlite3.connect(":memory:")
connection.execute("CREATE TABLE accounts (name TEXT, balance INTEGER)")
connection.execute("INSERT INTO accounts VALUES ('alice', 100), ('bob', 50)")
connection.commit()

def transfer(from_name, to_name, amount):
    connection.execute("UPDATE accounts SET balance = balance - ? WHERE name = ?", (amount, from_name))
    connection.execute("UPDATE accounts SET balance = balance + ? WHERE name = ?", (amount, to_name))
    connection.commit()

transfer("alice", "bob", 30)
print(connection.execute("SELECT * FROM accounts").fetchall())

# Now, without committing at all:
connection.execute("UPDATE accounts SET balance = balance - 1000 WHERE name = 'alice'")
# no commit() here
fresh_connection = sqlite3.connect(":memory:")  # a separate, fresh view for comparison
print("uncommitted change visible on this same connection:",
      connection.execute("SELECT balance FROM accounts WHERE name = 'alice'").fetchone())
connection.rollback()
print("after rollback:", connection.execute("SELECT balance FROM accounts WHERE name = 'alice'").fetchone())
```

**Real output:**
```
[('alice', 70), ('bob', 80)]
uncommitted change visible on this same connection: (-930,)
after rollback: (70,)
```

**What this proves:** the committed transfer (`alice` → `bob`, 30) took effect permanently and correctly. The *uncommitted* second change was visible within the same connection (a real, expected detail — a connection sees its own pending changes) but `.rollback()` discarded it entirely, restoring `alice`'s balance to its last real, committed value (`70`) — proof that an uncommitted change can be fully undone, as if it never happened.

## Mechanical Walkthrough

- A **transaction** is a group of one or more database operations treated as a single, all-or-nothing unit — SQLite (like most real databases) begins one implicitly with the first statement after the last commit, and keeps accumulating changes into it until either `.commit()` or `.rollback()` is called.
- `.commit()` makes every change since the last commit permanent and durable — visible to any other connection, and guaranteed to survive even if the program crashes immediately afterward.
- `.rollback()` discards every uncommitted change since the last commit, reverting the database to exactly its last committed state — as if the uncommitted operations never ran at all.
- Without an explicit `.commit()`, changes are **not guaranteed to be saved** — closing a connection (or a program crashing) with pending, uncommitted work can silently lose it; this is exactly why every real `INSERT`/`UPDATE` in a real application must be followed by a real, explicit `.commit()` once the related work is actually complete.

## CS Lens

This is the **ACID** transaction model (Atomicity, Consistency, Isolation, Durability) that underlies nearly every real relational database — **atomicity** specifically is what's demonstrated here: a transaction either takes effect *entirely* or not at all, with no possibility of a partial, half-applied state becoming visible to anything relying on the data being consistent. This guarantee is what makes the money-transfer example safe: even if the program crashed between the two `UPDATE` calls, `.commit()` never having been reached means neither change takes effect, leaving both balances exactly as they were.

Also recognized in: every production-grade relational database's own transaction support (PostgreSQL, MySQL, SQL Server — the concept, if not always the exact API, is universal), and, more abstractly, any system requiring a multi-step operation to be treated as indivisible — a file-system's own atomic rename operation (used to make a multi-step file write appear instantaneous and all-or-nothing to any other process) is a related, if different-domain, instance of the same underlying need.

## SE Lens

Wrapping several related writes in one transaction, committed together at the end, is what makes "half of a multi-step operation happened" structurally impossible, rather than merely unlikely — a real, meaningful reliability guarantee for any operation where partial completion would leave data genuinely wrong (not just incomplete). The real cost: a transaction holds real, if usually brief, locks on the data it's touching, and keeping one open longer than necessary can reduce how many other operations can proceed concurrently — a real, practical reason to commit as soon as a related unit of work is genuinely done, not to hold transactions open indefinitely "just in case."

## Connection

Builds on `sql-insert-select-where.md`. Directly relevant to any function performing more than one related write — `sql-create-table-and-schema.md`'s schema-creation code and any multi-row seed/insert operation both rely on this same commit-when-genuinely-done discipline.

## Try It Yourself

1. Remove the `.commit()` call from `transfer` entirely, run the transfer, close the connection, reopen a fresh connection to the same real (non-`:memory:`) database file, and confirm the transfer never actually took effect — direct, real proof that uncommitted work isn't durable.
2. Deliberately raise an exception between the two `UPDATE` calls inside `transfer` (before its `.commit()`), catch it, and call `.rollback()` in the exception handler — confirm neither `UPDATE` took effect, demonstrating a real, practical pattern for keeping a multi-step operation atomic even when something goes wrong partway through.
3. Look up Python's `with connection:` context-manager support for `sqlite3` connections, which automatically commits on successful exit or rolls back on an exception — rewrite `transfer` to use it instead of explicit `.commit()`/`.rollback()` calls, and compare the resulting code's safety against forgetting to call either manually.
