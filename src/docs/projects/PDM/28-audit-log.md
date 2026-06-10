# Vault PDM — Lesson 28 — Audit Log

## What You Will Build

Every checkout, check-in, and WIP save is recorded in an `audit_log` table with the
user, the file path, the action, and the timestamp. An admin screen shows the full
audit history sorted by time, filterable by action type. Audit records are never
updated or deleted — the table is append-only.

## What You Need to Know First

Lessons 01–27. All three tracked operations (checkout, check-in, WIP save) are
implemented. This lesson adds instrumentation that does not change any existing
behaviour.

---

## The Problem

"Who checked out file X and when?" is a question Vault cannot currently answer from
a single query. The `locks` table records current locks but deletes them on check-in.
The `versions` table records commits but not checkouts. WIP saves leave traces but
are also deleted on check-in. Without an audit log, historical operations are lost.

Audit logs are also a **compliance and security** requirement in production PDM
systems. ISO 9001, ITAR, and CMMC all require records of who accessed and modified
controlled documents. An audit log that can be deleted defeats its purpose.

---

## Step 1 — Append-Only Data

**Append-only — first appearance:**
An **append-only** data store accepts writes but not updates or deletes. Records,
once written, are permanent. This is the correct model for audit logs, event streams,
ledgers, and transaction logs.

**Why append-only:**
- **Auditability**: if audit records could be deleted, the audit trail could be
  falsified. An audit log that can be edited is not an audit log.
- **Concurrency**: appending a new row is simpler and safer than updating an existing
  one. No UPDATE lock needed; no risk of overwriting concurrent writes.
- **Recovery**: an append-only log can be replayed to reconstruct any past state.
  This is the foundation of event sourcing — a production pattern for complex systems.

**How to enforce append-only in PostgreSQL:**
Revoke UPDATE and DELETE permissions on the table for the application user:
```sql
REVOKE UPDATE, DELETE ON audit_log FROM vault_user;
```
`vault_user` can INSERT and SELECT but not UPDATE or DELETE. Even a bug in the
application code cannot delete audit records.

---

## Step 2 — Migration

### Create `migrations/004_audit_log.sql`

```sql
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  action      TEXT        NOT NULL,
  user_id     UUID        NOT NULL REFERENCES users(id),
  file_id     UUID        REFERENCES files(id),
  file_path   TEXT,
  commit_sha  TEXT,
  metadata    JSONB       NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_log_user_id_idx  ON audit_log (user_id);
CREATE INDEX IF NOT EXISTS audit_log_file_id_idx  ON audit_log (file_id);
CREATE INDEX IF NOT EXISTS audit_log_occurred_idx ON audit_log (occurred_at DESC);

REVOKE UPDATE, DELETE ON audit_log FROM vault_user;
```

Run: `psql -U vault_user -d vault -f migrations/004_audit_log.sql`

**`JSONB` — first appearance:**
`JSONB` is PostgreSQL's binary JSON column type. It stores arbitrary JSON structures —
key/value pairs of any depth. `metadata JSONB NOT NULL DEFAULT '{}'` stores action-
specific data: for check-in, `{ "commitSha": "abc123", "commitMessage": "..." }`;
for checkout, `{ "lockId": "uuid" }`. Using JSONB for variable metadata avoids
adding new columns for each action type.

**`CREATE INDEX` — first appearance:**
An **index** is a data structure that speeds up queries on a column. Without an index,
`SELECT * FROM audit_log WHERE user_id = $1` scans every row. With an index on
`user_id`, the database goes directly to matching rows. The trade-off: indexes use
disk space and slow down writes slightly (the index must be updated on every INSERT).

`audit_log_occurred_idx ON audit_log (occurred_at DESC)` — the DESC (descending)
matches the sort order of the audit view (newest first), making the query faster.
An index on the sort column eliminates a separate sort step.

**`REVOKE UPDATE, DELETE` — enforcing append-only:**
After granting `vault_user` permissions in lesson 03, we revoke specific permissions.
`REVOKE UPDATE, DELETE ON audit_log FROM vault_user` prevents the application user
from modifying or removing audit records. The constraint is enforced at the database
level — not just by convention.

---

## Step 3 — Data Layer

### Create `src/data/auditLog.ts`

```typescript
import { query } from './database.js'

export type AuditAction = 'checkout' | 'checkin' | 'wip_save' | 'connect'

export interface AuditEntry {
  id:          string
  action:      AuditAction
  userId:      string
  username:    string
  filePath:    string | null
  commitSha:   string | null
  metadata:    Record<string, unknown>
  occurredAt:  Date
}

export async function writeAuditEntry(params: {
  action:     AuditAction
  userId:     string
  fileId?:    string
  filePath?:  string
  commitSha?: string
  metadata?:  Record<string, unknown>
}): Promise<void> {
  await query(
    `INSERT INTO audit_log (action, user_id, file_id, file_path, commit_sha, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      params.action,
      params.userId,
      params.fileId   ?? null,
      params.filePath ?? null,
      params.commitSha ?? null,
      JSON.stringify(params.metadata ?? {}),
    ],
  )
}

export async function getAuditLog(
  limit:   number = 100,
  offset:  number = 0,
  action?: AuditAction,
): Promise<AuditEntry[]> {
  const filterClause = action !== undefined ? 'AND a.action = $3' : ''
  const params: (number | string)[] = [limit, offset]
  if (action !== undefined) params.push(action)

  const result = await query<{
    id:          string
    action:      string
    user_id:     string
    username:    string
    file_path:   string | null
    commit_sha:  string | null
    metadata:    Record<string, unknown>
    occurred_at: Date
  }>(
    `SELECT
       a.id,
       a.action,
       a.user_id,
       u.username,
       a.file_path,
       a.commit_sha,
       a.metadata,
       a.occurred_at
     FROM audit_log a
     JOIN users u ON u.id = a.user_id
     WHERE true ${filterClause}
     ORDER BY a.occurred_at DESC
     LIMIT $1 OFFSET $2`,
    params,
  )

  return result.rows.map((row) => ({
    id:         row.id,
    action:     row.action as AuditAction,
    userId:     row.user_id,
    username:   row.username,
    filePath:   row.file_path,
    commitSha:  row.commit_sha,
    metadata:   row.metadata,
    occurredAt: row.occurred_at,
  }))
}
```

**`LIMIT $1 OFFSET $2` — pagination:**
`LIMIT n OFFSET m` returns `n` rows starting from the `m`th row. `LIMIT 100 OFFSET 0`
is the first page; `LIMIT 100 OFFSET 100` is the second page. This is **offset
pagination** — simple but inefficient for large offsets (the database must scan all
skipped rows). For an admin audit log, offset pagination is acceptable.

**`WHERE true ${filterClause}` — dynamic filter:**
Appending `AND a.action = $3` conditionally builds a filtered query. `WHERE true`
ensures the syntax is valid even without the optional filter. This is a common
technique for optional SQL filters — the `true` clause is harmlessly optimised away
by PostgreSQL.

---

## Step 4 — Instrument the Domain Functions

Add `writeAuditEntry` calls in `checkoutFile`, `checkinFile`, and `saveWipSnapshot`:

```typescript
// In checkoutFile, after successful lock creation:
await writeAuditEntry({
  action:    'checkout',
  userId,
  fileId:    file.id,
  filePath,
  metadata:  { lockId: result.lock.lockId },
})

// In checkinFile, after completeCheckin:
await writeAuditEntry({
  action:     'checkin',
  userId,
  fileId:     file.id,
  filePath,
  commitSha:  commitSha,
  metadata:   { commitMessage },
})

// In saveWipSnapshot, after recordWipSnapshot:
await writeAuditEntry({
  action:    'wip_save',
  userId,
  fileId:    file.id,
  filePath,
  commitSha: snapshotSha,
  metadata:  { branchName },
})
```

**Instrumentation — first appearance:**
**Instrumentation** is adding logging or tracking code to a function without changing
its behaviour. The audit entries are side effects of the domain operations — they
record what happened without affecting the outcome. If `writeAuditEntry` fails,
the operation still succeeds (audit failure is not a reason to roll back a checkout).
In production, audit entries would be written inside the same transaction to ensure
no audit-less operations — left as an extension.

---

## Step 5 — Audit Log Screen

### Create `src/renderer/AuditLogScreen.tsx`

```typescript
import { useState }      from 'react'
import { useAsyncState } from './hooks/useAsyncState.js'
import { AsyncView }     from './components/AsyncView.js'
import type { AuditEntry, AuditAction } from '../../data/auditLog.js'

const ACTION_LABELS: Record<AuditAction, string> = {
  checkout: 'Checkout',
  checkin:  'Check-in',
  wip_save: 'WIP Save',
  connect:  'Connect',
}

export function AuditLogScreen() {
  const [filter, setFilter] = useState<AuditAction | 'all'>('all')

  async function fetchLog(): Promise<AuditEntry[]> {
    const params   = filter !== 'all' ? `?action=${filter}` : ''
    const response = await fetch(`http://localhost:3001/api/audit-log${params}`)
    if (!response.ok) throw new Error('Failed to load audit log')
    return response.json()
  }

  const { state, trigger } = useAsyncState(fetchLog)

  return (
    <div className="audit-screen">
      <h2>Audit Log</h2>
      <div className="audit-filters">
        {(['all', 'checkout', 'checkin', 'wip_save'] as const).map((action) => (
          <button
            key={action}
            className={`filter-btn ${filter === action ? 'filter-btn--active' : ''}`}
            onClick={() => { setFilter(action); trigger() }}
          >
            {action === 'all' ? 'All' : ACTION_LABELS[action]}
          </button>
        ))}
      </div>

      <AsyncView state={state} onRetry={trigger} loadingText="Loading audit log...">
        {(entries) => (
          <table className="audit-table">
            <thead>
              <tr>
                <th>Action</th><th>User</th><th>File</th>
                <th>Time</th><th>Details</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className={`audit-row audit-row--${entry.action}`}>
                  <td><code>{ACTION_LABELS[entry.action]}</code></td>
                  <td>{entry.username}</td>
                  <td className="audit-path">{entry.filePath ?? '—'}</td>
                  <td>{new Date(entry.occurredAt).toLocaleString()}</td>
                  <td>
                    {entry.commitSha !== null &&
                      <code title={entry.commitSha}>{entry.commitSha.slice(0, 8)}</code>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AsyncView>
    </div>
  )
}
```

---

## Connect the Pieces

The audit log is a cross-cutting concern — it touches every domain operation. The
data it produces answers questions that no other table can: "Did anyone check out
this file last Tuesday?", "How many WIP saves did user A make last month?", "When
was this file last touched?"

In production, the audit log would be immutable at the database level (REVOKE applied),
backed up separately from the main database, and retained for years. For regulatory
compliance (ITAR, CMMC), the audit log is the primary evidence that processes were
followed.

---

## What Breaks Without This

**Without `REVOKE UPDATE, DELETE`:**
A bug in the application code — or a compromised account — could delete audit records.
`DELETE FROM audit_log WHERE user_id = $1` removes all trace of a user's actions.
The database-level revoke prevents this even if the application code has a bug.

**Without the index on `occurred_at`:**
`SELECT ... ORDER BY occurred_at DESC LIMIT 100` scans the entire `audit_log` table,
sorts all rows, and returns the first 100. As the table grows (10,000 rows after a
busy month), this scan slows. The index on `occurred_at DESC` makes this query
efficient — the index already has rows in the needed order.

---

## Definition of Done

- [ ] Checking out a file creates an `audit_log` row (verify with psql)
- [ ] Checking in creates an audit row with the commit SHA
- [ ] The Audit Log screen shows entries sorted by time, newest first
- [ ] The action filter shows only the selected action type
- [ ] Attempting to `DELETE FROM audit_log` as `vault_user` fails with permission denied
- [ ] You can explain append-only data — why audit logs must be append-only and how REVOKE enforces it
- [ ] You can explain database indexes — what they are, what they trade, when to add them
- [ ] You can explain JSONB — what it stores, why it is used for `metadata`
- [ ] You can explain `LIMIT/OFFSET` pagination and name one alternative approach
- [ ] Run:
      ```
      git add migrations/ src/data/ src/domain/ src/api/ src/renderer/
      git commit -m "Add audit log: append-only table with REVOKE, indexed by time and user, instrumented in checkout/checkin/wip domain functions"
      ```

---

*Next: Lesson 29 — Packaging and Distribution. The Electron app is packaged into a
distributable installer with electron-builder. Code signing concepts are explained.*
