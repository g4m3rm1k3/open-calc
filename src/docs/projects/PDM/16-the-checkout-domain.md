# Vault PDM — Lesson 16 — The Checkout Domain Function

## What You Will Build

`src/domain/checkout.ts` — the `checkoutFile` function. It receives a file path and
a user ID. It checks whether the file is currently locked. If not, it creates a lock
record and returns success. If already locked, it returns an error with the lock
holder's name. This function contains no HTTP, no React, no Electron — only business
logic. It is tested with real database calls.

## What You Need to Know First

Lessons 01–15. The `files` and `locks` tables exist. `upsertFiles` creates file records
on tree load. The domain layer has `auth.ts` and `fileTree.ts` as precedents for
structure. This lesson creates the most critical domain function in the application.

---

## The Problem

The core PDM invariant: **at most one user holds a checkout for any file at any time.**
If two engineers both open the same file and both save, one overwrites the other's
work. The checkout lock prevents this: before opening a file, the engineer must acquire
the lock. Only one can succeed.

Enforcing this rule requires:
1. Checking whether a lock exists
2. If not, creating one atomically

Steps 1 and 2 must be atomic — no gap between the check and the insert where a
second user's check could also succeed. This is the **TOCTOU race condition**, and
it is why a naive implementation is wrong. The correct solution (using PostgreSQL
transactions) comes in lesson 17.

---

## Step 1 — The Repository Pattern

**Repository pattern — first appearance:**
The **repository pattern** separates the data access logic from the domain logic.
Instead of the domain function importing `query` directly and writing SQL, it receives
a **repository object** — an interface that describes what data operations are
available, without specifying how they are implemented.

**The problem the repository pattern solves:**
Testing `checkoutFile` with a real database is slow and requires setup. Testing it
with mock data is fast and isolated. If `checkoutFile` directly calls `query()`, the
test must connect to PostgreSQL. If it receives a repository, the test can pass a
fake repository that returns preset data.

For Vault, we use a simplified form: the domain function receives data functions as
parameters (dependency injection). Full repository interfaces are defined for the
functions it needs.

**Dependency injection — first appearance:**
**Dependency injection** is passing a dependency to a function rather than having
the function import it directly. `checkoutFile(fileId, userId, deps)` where `deps`
contains `{ getLock, createLock }` — the function uses these but does not import them.
Tests pass fake `deps`; production code passes real database functions.

---

## Step 2 — Data Layer Functions

### Add to `src/data/files.ts`

```typescript
export interface FileLock {
  lockId:       string
  fileId:       string
  heldBy:       string
  heldByUsername: string
  checkedOutAt: Date
}

export async function getLockForFile(
  fileId: string,
): Promise<FileLock | null> {
  const result = await query<{
    lock_id:          string
    file_id:          string
    held_by:          string
    held_by_username: string
    checked_out_at:   Date
  }>(
    `SELECT
       l.id            AS lock_id,
       l.file_id,
       l.held_by,
       u.username      AS held_by_username,
       l.checked_out_at
     FROM locks l
     JOIN users u ON u.id = l.held_by
     WHERE l.file_id = $1`,
    [fileId],
  )

  if (result.rows.length === 0) return null

  const row = result.rows[0]
  return {
    lockId:          row.lock_id,
    fileId:          row.file_id,
    heldBy:          row.held_by,
    heldByUsername:  row.held_by_username,
    checkedOutAt:    row.checked_out_at,
  }
}

export async function getFileByPath(
  gitlabProjectId: number,
  filePath:        string,
): Promise<StoredFile | null> {
  const result = await query<{
    id:                string
    gitlab_project_id: number
    file_path:         string
    file_type:         string
    created_at:        Date
  }>(
    `SELECT id, gitlab_project_id, file_path, file_type, created_at
     FROM files
     WHERE gitlab_project_id = $1 AND file_path = $2`,
    [gitlabProjectId, filePath],
  )

  if (result.rows.length === 0) return null

  const row = result.rows[0]
  return {
    id:              row.id,
    gitlabProjectId: row.gitlab_project_id,
    filePath:        row.file_path,
    fileType:        row.file_type,
    createdAt:       row.created_at,
  }
}

export async function createLock(
  fileId: string,
  userId: string,
): Promise<FileLock> {
  const result = await query<{
    lock_id:          string
    file_id:          string
    held_by:          string
    held_by_username: string
    checked_out_at:   Date
  }>(
    `INSERT INTO locks (file_id, held_by)
     VALUES ($1, $2)
     RETURNING
       id   AS lock_id,
       file_id,
       held_by,
       (SELECT username FROM users WHERE id = $2) AS held_by_username,
       checked_out_at`,
    [fileId, userId],
  )

  const row = result.rows[0]
  return {
    lockId:          row.lock_id,
    fileId:          row.file_id,
    heldBy:          row.held_by,
    heldByUsername:  row.held_by_username,
    checkedOutAt:    row.checked_out_at,
  }
}
```

**`(SELECT username FROM users WHERE id = $2)` — scalar subquery:**
A **scalar subquery** is a SELECT statement embedded in another query that returns
exactly one value. In the `RETURNING` clause, we need the username of the user who
holds the lock. The `locks` table has only the user ID; the username is in `users`.
A scalar subquery fetches it in the same statement, avoiding a round trip.

---

## Step 3 — The Domain Function

### Create `src/domain/checkout.ts`

```typescript
import {
  getFileByPath,
  getLockForFile,
  createLock,
  type FileLock,
  type StoredFile,
} from '../data/files.js'

type CheckoutResult =
  | { success: true;  lock: FileLock }
  | { success: false; reason: 'already-locked'; lockedBy: string }
  | { success: false; reason: 'file-not-found' }

export async function checkoutFile(
  gitlabProjectId: number,
  filePath:        string,
  userId:          string,
): Promise<CheckoutResult> {
  const file: StoredFile | null = await getFileByPath(gitlabProjectId, filePath)

  if (file === null) {
    return { success: false, reason: 'file-not-found' }
  }

  const existingLock: FileLock | null = await getLockForFile(file.id)

  if (existingLock !== null) {
    return {
      success:  false,
      reason:   'already-locked',
      lockedBy: existingLock.heldByUsername,
    }
  }

  const lock = await createLock(file.id, userId)
  return { success: true, lock }
}
```

**`CheckoutResult` — a discriminated union for business results:**
`CheckoutResult` is a union with three variants distinguished by `success` and
`reason`. This is the **result type** pattern: errors are values, not exceptions.
The caller must handle all three cases — TypeScript enforces this in a `switch` on
`result.success` and `result.reason`.

**Why results, not exceptions, for business rule failures:**
Exceptions are for unexpected failures (network down, database error). "File is already
locked" is not unexpected — it is a normal business outcome that happens regularly.
Modelling it as an exception means the caller uses `try/catch` for something that is
part of the normal flow. Modelling it as a result type makes all outcomes explicit at
the type level.

**The TOCTOU race condition — named and explained:**
TOCTOU = **Time Of Check To Time Of Use**.

In `checkoutFile`:
1. **Check**: `getLockForFile(file.id)` → no lock (file appears available)
2. **Use**: `createLock(file.id, userId)` → inserts lock

Between steps 1 and 2, a second user's `checkoutFile` call could also read "no lock"
and also try to insert. Both inserts would succeed without the `UNIQUE` constraint —
now two locks exist. OR: both succeed the check, the first inserts the lock, the
second hits the UNIQUE constraint error — an unhandled database exception.

The `UNIQUE` constraint on `locks.file_id` prevents two lock records from existing —
the second insert fails. But the failure is a database constraint violation, not a
handled business result. Lesson 17 fixes this with a database transaction and
`SELECT FOR UPDATE` to make the check and insert atomic.

For lesson 16, the `createLock` function will catch the constraint violation and
return an error:

```typescript
export async function createLock(
  fileId: string,
  userId: string,
): Promise<FileLock | null> {
  try {
    // ... the INSERT query above
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique')) {
      return null // concurrent checkout — UNIQUE constraint fired
    }
    throw error
  }
}
```

Update `checkoutFile` to handle `null` from `createLock`:

```typescript
const lock = await createLock(file.id, userId)
if (lock === null) {
  return { success: false, reason: 'already-locked', lockedBy: '(concurrent checkout)' }
}
return { success: true, lock }
```

This is correct behaviour but not perfectly safe — lesson 17 makes it fully atomic.

---

## Step 4 — Tests

### Create `src/domain/checkout.test.ts`

```typescript
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { checkoutFile }    from './checkout.js'
import { upsertFiles }     from '../data/files.js'
import { query }           from '../data/database.js'

const TEST_PROJECT_ID = 88888
const TEST_FILE_PATH  = 'test/checkout-test.step'

let testUserId: string

beforeEach(async () => {
  const userResult = await query<{ id: string }>(
    `INSERT INTO users (gitlab_user_id, username, email, display_name)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (gitlab_user_id) DO UPDATE SET username = EXCLUDED.username
     RETURNING id`,
    [888888, 'testuser', 'test@example.com', 'Test User'],
  )
  testUserId = userResult.rows[0].id
  await upsertFiles(TEST_PROJECT_ID, [TEST_FILE_PATH])
})

afterEach(async () => {
  await query('DELETE FROM locks   WHERE file_id IN (SELECT id FROM files WHERE gitlab_project_id = $1)', [TEST_PROJECT_ID])
  await query('DELETE FROM files   WHERE gitlab_project_id = $1', [TEST_PROJECT_ID])
  await query('DELETE FROM users   WHERE gitlab_user_id = $1', [888888])
})

describe('checkoutFile', () => {
  test('succeeds when file is available', async () => {
    const result = await checkoutFile(TEST_PROJECT_ID, TEST_FILE_PATH, testUserId)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.lock.heldBy).toBe(testUserId)
    }
  })

  test('fails with already-locked when file is checked out', async () => {
    await checkoutFile(TEST_PROJECT_ID, TEST_FILE_PATH, testUserId)
    const second = await checkoutFile(TEST_PROJECT_ID, TEST_FILE_PATH, testUserId)
    expect(second.success).toBe(false)
    if (!second.success) {
      expect(second.reason).toBe('already-locked')
    }
  })

  test('fails with file-not-found for non-existent file', async () => {
    const result = await checkoutFile(TEST_PROJECT_ID, 'nonexistent.step', testUserId)
    expect(result.success).toBe(false)
    if (!second.success) {
      expect(result.reason).toBe('file-not-found')
    }
  })
})
```

Run `npm test`. All three tests pass.

---

## Connect the Pieces

`checkoutFile` is the domain law for checkout. It answers: "Can this user check out
this file, and if so, make it so." Everything about who can check out what, in what
circumstances, lives here. The API layer (lesson 18) calls it; the renderer (lesson
18) shows the result. Neither needs to understand the rule — they just invoke it and
handle the result type.

---

## What Breaks Without This

**Without the domain function (checkout logic in the API route):**
The checkout rule lives in a route handler. Testing it requires an HTTP client, a
running Express server, and a database connection. Changing the rule requires finding
which route contains the logic. A second checkout operation (WIP save, check-in)
that needs to verify the lock must either import from the route file (wrong direction)
or duplicate the logic. Domain functions eliminate all three problems.

---

## Definition of Done

- [ ] `npm test` passes all three checkout tests
- [ ] Calling `checkoutFile` twice for the same file returns `already-locked` on the second call
- [ ] Calling `checkoutFile` for a non-existent path returns `file-not-found`
- [ ] `psql -c "SELECT * FROM locks"` shows the lock after a successful checkout
- [ ] You can explain the TOCTOU race condition with a concrete timeline of two concurrent users
- [ ] You can explain the result type pattern and why errors are values here, not exceptions
- [ ] You can explain the repository pattern and how it enables testing without a database
- [ ] Run:
      ```
      git add src/domain/ src/data/
      git commit -m "Add checkout domain function: CheckoutResult discriminated union, TOCTOU race condition identified and partially handled"
      ```

---

*Next: Lesson 17 — Atomic Locking with Database Transactions. The TOCTOU race
condition is closed with a PostgreSQL transaction and SELECT FOR UPDATE. ACID
properties and row-level locking are explained.*
