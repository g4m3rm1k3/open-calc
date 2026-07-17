---
concept: 135-transactions
name: Transactions
---

## Definition

A transaction groups multiple database operations into a single
all-or-nothing unit — either every operation in it succeeds and is saved
(commit), or if anything fails partway through, all of it is undone
(rollback), leaving the database as if none of it happened.

## Problem

Transferring money between two accounts requires TWO operations — debit
account A, credit account B. If the program crashes or an error occurs
after debiting A but before crediting B, the money simply vanishes —
neither account has it. A transaction wraps both operations together so
that either both succeed or neither does, preventing this
half-completed, inconsistent state.

## Execution

BEGIN TRANSACTION
↓
Debit $100 from Account A (balance: 500 → 400)
↓
Credit $100 to Account B (balance: 200 → 300) — but suppose this step
fails (e.g., Account B doesn't exist)
↓
ROLLBACK — Account A's debit is undone too; balance returns to 500, as if
the transaction never started
↓
(If both steps had succeeded instead: COMMIT — both changes are saved
permanently together)

## Computer Science

A transaction guarantees atomicity — a sequence of multiple operations
behaves as though it were a single indivisible operation, with no
possibility of a caller ever observing a partially-applied state. This is
enforced via mechanisms like write-ahead logging (recording intended
changes before applying them) or shadow copies, so a crash mid-transaction
can still be cleanly rolled back on recovery.

Tags: Atomicity, Write-ahead logging, All-or-nothing operations, Rollback

## Software Engineering

Wrapping related writes in a transaction is essential anywhere a single
logical operation touches multiple rows or tables (an order that both
creates a record and decrements inventory, a transfer touching two
accounts) — forgetting to do so is a common source of subtle
data-corruption bugs that only surface when something fails partway
through, which is exactly the scenario transactions exist to protect
against.

Tags: Data integrity, Multi-table writes, Failure handling

## Common Mistakes

- Performing multiple related writes as separate, un-transacted operations — if the process crashes or an error occurs between them, the database is left in an inconsistent half-completed state.
- Forgetting to actually call rollback on an error path — a transaction only protects you if the failure is caught and rollback is explicitly triggered; an uncaught exception that skips the rollback call can leave partial changes committed depending on the database driver's defaults.

## Exercises

- Trace through the money-transfer example if the CREDIT step is what fails instead of the account not existing (e.g., it throws an error partway through) — what must roll back?
- Identify one multi-step operation in an app you've used (e.g., checkout: create order + reduce stock + charge payment) that would corrupt data if only some of its steps completed.

## javascript

```javascript
// Simulating a transaction's all-or-nothing commit/rollback behavior with
// a simple in-memory "database" and a snapshot-based rollback.
class Bank {
  #balances = { A: 500, B: 200 }

  transfer(from, to, amount) {
    const snapshot = { ...this.#balances }   // record state BEFORE the transaction
    try {
      if (!(from in this.#balances) || !(to in this.#balances)) {
        throw new Error(`account missing`)
      }
      this.#balances[from] -= amount
      this.#balances[to] += amount
      return { committed: true, balances: { ...this.#balances } }
    } catch (err) {
      this.#balances = snapshot   // ROLLBACK -- restore pre-transaction state
      return { committed: false, balances: { ...this.#balances } }
    }
  }
}

const bank = new Bank()
console.log(bank.transfer('A', 'Z', 100))   // { committed: false, balances: { A: 500, B: 200 } } -- rolled back, A untouched
console.log(bank.transfer('A', 'B', 100))   // { committed: true, balances: { A: 400, B: 300 } } -- both succeeded together
```
Walkthrough: the first transfer targets a nonexistent account `'Z'` — the
debit to `A` never actually applies to the returned state because
`transfer` restores the pre-transaction `snapshot` on any error, so `A`
stays at 500 rather than being left at 400 with the credit missing. The
second transfer succeeds fully, applying both the debit and credit
together.

## python

```python
class Bank:
    def __init__(self):
        self._balances = {'A': 500, 'B': 200}

    def transfer(self, frm, to, amount):
        snapshot = dict(self._balances)   # record state BEFORE the transaction
        try:
            if frm not in self._balances or to not in self._balances:
                raise ValueError('account missing')
            self._balances[frm] -= amount
            self._balances[to] += amount
            return {'committed': True, 'balances': dict(self._balances)}
        except ValueError:
            self._balances = snapshot   # ROLLBACK -- restore pre-transaction state
            return {'committed': False, 'balances': dict(self._balances)}


bank = Bank()
print(bank.transfer('A', 'Z', 100))   # {'committed': False, 'balances': {'A': 500, 'B': 200}} -- rolled back
print(bank.transfer('A', 'B', 100))   # {'committed': True, 'balances': {'A': 400, 'B': 300}} -- both succeeded together
```
Walkthrough: identical snapshot-and-rollback mechanics as the JavaScript
version — the failed transfer to `'Z'` leaves `A` untouched at 500, while
the successful transfer applies both the debit and credit atomically.
