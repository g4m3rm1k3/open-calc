---
concept: 136-acid
name: ACID
---

## Definition

ACID is the set of four guarantees — Atomicity, Consistency, Isolation,
Durability — a database transaction system provides, ensuring
transactions behave predictably and safely even under failures or
concurrent access.

## Problem

Without these guarantees, concurrent transactions could interleave in
ways that corrupt data (Isolation), a crash mid-write could leave partial
changes applied (Atomicity/Durability), or a transaction could leave the
database violating its own rules, like a negative balance (Consistency).
ACID names these specific properties so a database's behavior under
failure and concurrency is well-defined rather than accidental.

## Execution

Atomicity: a transfer either fully happens or fully doesn't (see the
Transactions concept)
↓
Consistency: a transaction can never leave the database violating a
defined rule (e.g., a constraint that balance can't go below zero) — an
attempted transaction that would violate it is rejected instead
↓
Isolation: two concurrent transactions don't see each other's
uncommitted, in-progress changes — each behaves as if it ran alone
↓
Durability: once a transaction commits, the change survives even if the
system crashes immediately after — it's been written somewhere durable
that survives a restart

## Computer Science

These four properties are independent, addressing different failure
modes — Atomicity and Durability are primarily about surviving crashes
correctly, while Isolation is about correctness under concurrent
execution (see Race Conditions), and Consistency is about the transaction
never violating the schema's own integrity rules. A database is only said
to be "ACID-compliant" when it provides all four together.

Tags: Atomicity, Consistency, Isolation, Durability, Crash recovery

## Software Engineering

Different databases make different tradeoffs around ACID, particularly
Isolation — stricter isolation levels prevent more concurrency anomalies
but reduce throughput, while weaker isolation levels (e.g., "read
committed") allow more concurrent throughput at the cost of permitting
certain anomalies a stricter level would prevent. Many NoSQL databases
explicitly relax ACID guarantees (see NoSQL vs SQL) in exchange for higher
availability or throughput.

Tags: Isolation levels, Concurrency tradeoffs, NoSQL relaxation

## Common Mistakes

- Assuming ALL databases provide full ACID guarantees by default — many NoSQL systems deliberately relax one or more of these guarantees (often Consistency or Isolation) in exchange for availability or performance, and knowing which guarantees a given system actually provides is a real design decision.
- Confusing "Consistency" in ACID (a transaction never violates defined integrity rules) with "Consistency" in the CAP theorem (all nodes see the same data at the same time) — despite sharing a name, these are genuinely different concepts.

## Exercises

- For each of the four ACID letters, name one specific failure scenario (a crash, a concurrent transaction, an invalid write) that guarantee specifically prevents.
- Look up the difference between "read committed" and "serializable" isolation levels, and identify one concurrency anomaly serializable prevents that read committed allows.

## javascript

```javascript
// Demonstrating Consistency: a transaction that would violate a defined
// rule (balance >= 0) is rejected rather than applied.
class Account {
  #balance = 100

  withdraw(amount) {
    const wouldBe = this.#balance - amount
    if (wouldBe < 0) {
      throw new Error('Consistency violation: balance cannot go negative')
    }
    this.#balance = wouldBe
    return this.#balance
  }
}

const account = new Account()
console.log(account.withdraw(50))   // 50 -- allowed, stays >= 0

try {
  account.withdraw(1000)   // would make balance -950
} catch (err) {
  console.log(err.message)   // 'Consistency violation: balance cannot go negative'
}
console.log(account.withdraw(0))   // 50 -- balance unchanged; the invalid withdrawal never applied
```
Walkthrough: the second withdrawal would violate the "balance can never go
negative" rule, so it's rejected before ever touching `#balance` — the
account's balance stays exactly 50 afterward, exactly Consistency's job:
a transaction that would break a defined integrity rule never gets applied
at all.

## python

```python
class Account:
    def __init__(self):
        self._balance = 100

    def withdraw(self, amount):
        would_be = self._balance - amount
        if would_be < 0:
            raise ValueError('Consistency violation: balance cannot go negative')
        self._balance = would_be
        return self._balance


account = Account()
print(account.withdraw(50))   # 50 -- allowed, stays >= 0

try:
    account.withdraw(1000)   # would make balance -950
except ValueError as err:
    print(err)   # Consistency violation: balance cannot go negative

print(account.withdraw(0))   # 50 -- balance unchanged; the invalid withdrawal never applied
```
Walkthrough: identical Consistency-guarantee mechanics as the JavaScript
version — the rule violation is caught and rejected before the balance is
ever mutated, leaving it at exactly 50.
