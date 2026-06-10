# Vault PDM — Lesson 17 — Atomic Locking with Database Transactions

## What You Will Build

The checkout operation is made fully atomic using a PostgreSQL transaction with
`SELECT FOR UPDATE`. Two simultaneous checkout attempts for the same file can never
both succeed. The TOCTOU race condition identified in lesson 16 is closed. The
`checkoutFile` function works correctly under concurrent load.

## What You Need to Know First

Lessons 01–16. The `checkoutFile` domain function exists. The TOCTOU problem has
been named. This lesson solves it at the database level using transactions.

---

## The Problem

The lesson 16 implementation has a gap:

```
User A: getLockForFile → null (no lock)
                                        User B: getLockForFile → null (no lock)
User A: createLock → success
                                        User B: createLock → UNIQUE constraint error
```

User B's `createLock` throws an unhandled database error. The partial handling in
lesson 16 (catching the constraint error and returning null) works but is fragile —
it depends on PostgreSQL error messages to detect the condition. More importantly,
it is fundamentally not atomic: there is still a window where both reads succeed and
one write fails.

The correct solution: make the entire check-and-insert operation atomic using a
**database transaction** with a **row-level lock**.

---

## Step 1 — Database Transactions and ACID

**Transaction — first appearance:**
A **database transaction** is a sequence of operations that execute as a single unit.
If any operation fails, all changes from the transaction are reversed. The database
returns to the state before the transaction started. Transactions are essential for
operations that must be "all or nothing."

**ACID — first appearance:**
ACID is the set of properties that guarantee reliable database transactions:

- **A — Atomicity:** Every operation in the transaction succeeds, or none of them do.
  There is no partial completion. If a commit fails midway, the database rolls back
  all changes.

- **C — Consistency:** The transaction takes the database from one valid state to
  another valid state. Constraints (UNIQUE, FOREIGN KEY, NOT NULL) are checked at
  commit time. A transaction that would violate a constraint is rolled back.

- **I — Isolation:** Concurrent transactions do not see each other's in-progress
  changes. A transaction reading data sees a consistent snapshot as of the start of
  the transaction. Other transactions' uncommitted changes are invisible.

- **D — Durability:** Once committed, changes are permanent. Even if the server
  crashes immediately after commit, the change survives (written to disk before
  commit confirmation is sent to the client).

PostgreSQL provides full ACID guarantees. The isolation property is what prevents
the TOCTOU race condition — but only when combined with the correct locking.

---

## Step 2 — Row-Level Locking with SELECT FOR UPDATE

**SELECT FOR UPDATE — first appearance:**
`SELECT ... FOR UPDATE` acquires a **row-level lock** on the selected rows. While
Transaction A holds a `FOR UPDATE` lock on a row, Transaction B's attempt to also
`SELECT FOR UPDATE` that row **blocks** — it waits until Transaction A commits or
rolls back.

This eliminates the TOCTOU gap:

```
Transaction A:
  BEGIN
  SELECT id FROM files WHERE file_path = $1 FOR UPDATE  → locks the files row
  SELECT * FROM locks WHERE file_id = $2                → null (no lock)
  INSERT INTO locks ...                                 → succeeds
  COMMIT                                                → lock row released

Transaction B (arrives while A is running):
  BEGIN
  SELECT id FROM files WHERE file_path = $1 FOR UPDATE  → BLOCKS (row is locked by A)
  ... (waits until A commits) ...
  SELECT * FROM locks WHERE file_id = $2                → now sees A's lock!
  → returns 'already-locked'
  ROLLBACK
```

Transaction B's check happens AFTER Transaction A's commit. It sees the lock. The
race condition is impossible.

**Why lock the `files` row and not the `locks` row:**
A `locks` row does not exist yet — you cannot lock a row that does not exist.
Locking the `files` row is the standard technique: the file is the resource being
contested; its row serves as the mutex.

---

## Step 3 — Transactions in node-postgres

**`pg` transactions — first appearance:**
The `Pool.query()` helper we created in lesson 03 uses a pool connection for each
call — potentially different connections for consecutive queries. Transactions require
all queries to run on the **same connection**. We must acquire a dedicated client
from the pool:

```typescript
const client = await pool.connect()
try {
  await client.query('BEGIN')
  // ... queries using client.query(), not pool.query()
  await client.query('COMMIT')
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
}
```

`client.release()` returns the connection to the pool. It is called in `finally`
so it is always executed — whether the transaction succeeded, failed, or threw.
Without `release()`, the connection is never returned and the pool is slowly exhausted.

### Update `src/data/database.ts` — add transaction helper

```typescript
import pg from 'pg'
const { Pool } = pg

// ... existing pool setup ...

export async function withTransaction<T>(
  operation: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await operation(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
```

**`withTransaction<T>` — generic transaction wrapper:**
`withTransaction` takes an `operation` function that receives a `PoolClient` (the
dedicated connection) and returns a Promise. The helper wraps it with BEGIN/COMMIT/
ROLLBACK. The generic `<T>` propagates the operation's return type.

This is the **template method pattern**: `withTransaction` handles the transaction
lifecycle (the template); the caller provides the business logic (the method). The
transaction setup/teardown is written once and reused for every transactional operation.

---

## Step 4 — Atomic Checkout

### Update `src/data/files.ts` — atomic checkout function

```typescript
import { withTransaction } from './database.js'
import type pg             from 'pg'

export async function atomicCheckout(
  gitlabProjectId: number,
  filePath:        string,
  userId:          string,
): Promise<
  | { outcome: 'locked';      lock: FileLock }
  | { outcome: 'not-found' }
  | { outcome: 'already-locked'; heldByUsername: string }
> {
  return withTransaction(async (client) => {
    const fileResult = await client.query<{ id: string }>(
      `SELECT id FROM files
       WHERE gitlab_project_id = $1 AND file_path = $2
       FOR UPDATE`,
      [gitlabProjectId, filePath],
    )

    if (fileResult.rows.length === 0) {
      return { outcome: 'not-found' }
    }

    const fileId = fileResult.rows[0].id

    const lockResult = await client.query<{
      held_by_username: string
    }>(
      `SELECT u.username AS held_by_username
       FROM locks l
       JOIN users u ON u.id = l.held_by
       WHERE l.file_id = $1`,
      [fileId],
    )

    if (lockResult.rows.length > 0) {
      return {
        outcome:        'already-locked',
        heldByUsername: lockResult.rows[0].held_by_username,
      }
    }

    const insertResult = await client.query<{
      lock_id:          string
      held_by:          string
      held_by_username: string
      checked_out_at:   Date
    }>(
      `INSERT INTO locks (file_id, held_by)
       VALUES ($1, $2)
       RETURNING
         id AS lock_id,
         file_id,
         held_by,
         (SELECT username FROM users WHERE id = $2) AS held_by_username,
         checked_out_at`,
      [fileId, userId],
    )

    const row = insertResult.rows[0]
    return {
      outcome: 'locked',
      lock: {
        lockId:          row.lock_id,
        fileId,
        heldBy:          row.held_by,
        heldByUsername:  row.held_by_username,
        checkedOutAt:    row.checked_out_at,
      },
    }
  })
}
```

### Update `src/domain/checkout.ts`

```typescript
import { atomicCheckout } from '../data/files.js'

export async function checkoutFile(
  gitlabProjectId: number,
  filePath:        string,
  userId:          string,
): Promise<CheckoutResult> {
  const result = await atomicCheckout(gitlabProjectId, filePath, userId)

  switch (result.outcome) {
    case 'not-found':
      return { success: false, reason: 'file-not-found' }
    case 'already-locked':
      return { success: false, reason: 'already-locked', lockedBy: result.heldByUsername }
    case 'locked':
      return { success: true, lock: result.lock }
  }
}
```

**Exhaustive switch — no default needed:**
TypeScript's union type `'locked' | 'not-found' | 'already-locked'` is exhausted by
the three `case` statements. TypeScript infers that code after the switch is
unreachable — no `default` is needed. If a fourth outcome is added to the union,
TypeScript reports an unhandled case.

---

## Step 5 — Verifying Atomicity (Conceptually)

The race condition cannot be triggered by a single user in development. To reason
about correctness:

1. `FOR UPDATE` on the `files` row prevents any other transaction from acquiring
   `FOR UPDATE` on the same row simultaneously.
2. The lock check (`SELECT FROM locks WHERE file_id = $1`) happens inside the same
   transaction — it sees the committed state of the database at transaction start.
3. The `INSERT INTO locks` either succeeds (atomic with the check) or fails (UNIQUE
   constraint — which cannot fire because the check already confirmed no lock exists).

The TOCTOU window is zero. The check and insert are in the same transaction, with
the files row locked. No other transaction can read an out-of-date "no lock" result
while a lock is being inserted.

---

## Connect the Pieces

Atomicity ripples through all subsequent operations:
- **Check-in** (lesson 21) uses `withTransaction` to atomically: upload to GitLab,
  insert version record, delete lock record.
- **WIP save** (lesson 20) verifies the lock still exists before writing.
- **Audit log** (lesson 28) adds an audit entry inside the checkout transaction.

The `withTransaction` helper is the foundation for every multi-step operation that
must be "all or nothing."

---

## What Breaks Without This

**Without transactions (lesson 16's implementation):**
Two simultaneous checkout requests: both read "no lock," both attempt inserts. One
succeeds; the other hits the UNIQUE constraint. The constraint violation is an
unhandled database error — the second user sees an HTTP 500, not a meaningful
"already locked" message. The error handling is incomplete.

**Without `SELECT FOR UPDATE`:**
Even inside a transaction, a plain `SELECT` does not block concurrent readers.
Transaction A reads no lock; Transaction B also reads no lock (no blocking). Both
proceed to insert. The UNIQUE constraint saves correctness, but the second user still
gets a database error rather than the clean `already-locked` result.

**Without `client.release()` in `finally`:**
Each checkout call consumes a pool connection and never returns it. The pool has
`max: 10` connections. After 10 checkout calls (regardless of success or failure),
all pool connections are consumed. The 11th checkout call waits indefinitely for a
connection that is never returned. The app hangs.

---

## Definition of Done

- [ ] `npm test` still passes all checkout tests (they test the same domain API)
- [ ] You can explain ACID — what each letter means with a concrete example
- [ ] You can explain `SELECT FOR UPDATE` and draw the timeline showing how it prevents the race
- [ ] You can explain why `client.release()` must be in `finally` and what happens without it
- [ ] You can explain the template method pattern and how `withTransaction` implements it
- [ ] Run:
      ```
      git add src/data/ src/domain/
      git commit -m "Make checkout atomic: withTransaction helper, SELECT FOR UPDATE on files row, TOCTOU race condition closed"
      ```

---

*Next: Lesson 18 — The Checkout API Route and UI. The file tree shows a "Check Out"
button on available files. After checkout, the file row shows the user's name and a
"Check In" button.*
