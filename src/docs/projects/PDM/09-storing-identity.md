# Vault PDM — Lesson 09 — Storing Identity in the Database

## What You Will Build

After a successful GitLab token validation, Vault writes the user to the `users`
table using an **upsert** — insert if new, update if returning. The user's PostgreSQL
UUID becomes their Vault identity. The renderer receives the UUID alongside the user
name. After connecting, `psql -c "SELECT * FROM users"` shows the row.

## What You Need to Know First

Lessons 01–08. The `users` table exists (lesson 05). `connectWithToken` validates
the GitLab token (lesson 08). This lesson adds the database write between those two
steps.

---

## The Problem

After GitLab validates the token, Vault knows the user's GitLab identity. But Vault
needs its own identity for the user — the UUID primary key in the `users` table.
This UUID is what appears in `locks.held_by`, `versions.committed_by`, and
`wip_snapshots` — not the GitLab user ID.

The user might connect multiple times (from different machines, or after restarting
the app). Each connection should not create a new user row — it should update the
existing one. This is the **upsert** operation.

---

## Step 1 — The Upsert Operation

**Upsert — first appearance:**
An **upsert** (update + insert) writes a record if it is new, or updates it if it
already exists. In PostgreSQL:

```sql
INSERT INTO users (gitlab_user_id, username, email, display_name)
VALUES ($1, $2, $3, $4)
ON CONFLICT (gitlab_user_id)
DO UPDATE SET
  username     = EXCLUDED.username,
  email        = EXCLUDED.email,
  display_name = EXCLUDED.display_name
RETURNING id, username, email, display_name, created_at
```

**`ON CONFLICT (column)` — first appearance:**
`ON CONFLICT` specifies what to do when inserting a row would violate a `UNIQUE`
constraint. `(gitlab_user_id)` identifies which unique constraint may be violated.

**`DO UPDATE SET ...` — the update action:**
`DO UPDATE SET` specifies the columns to update when a conflict occurs. `EXCLUDED`
is a special table alias that refers to the row that was attempted to be inserted —
the new values. `EXCLUDED.username` is the new username from the insert attempt.
This updates the row to the latest values from GitLab (username and email can change).

**`DO NOTHING` — the alternative:**
`ON CONFLICT DO NOTHING` silently discards the insert. Not used here because we want
to update the user's current username and email — these can change on GitLab.

**`RETURNING id, ...` — returning the upserted row:**
`RETURNING` causes the INSERT/UPDATE to also return the final state of the affected
row. Without it, we would need a separate SELECT to get the UUID. `RETURNING` makes
the upsert atomic: one query does the write and returns the result.

**Idempotency — first appearance:**
An operation is **idempotent** if performing it multiple times produces the same
result as performing it once. The upsert is idempotent: calling it 10 times for
the same GitLab user ID produces one row in the `users` table with the latest values.
Idempotency is valuable for retry logic — if a network failure causes the upsert to
run twice, the database is not corrupted.

---

## Step 2 — The Data Layer: users.ts

### Create `src/data/users.ts`

```typescript
import { query } from './database.js'

export interface StoredUser {
  id:          string
  username:    string
  email:       string
  displayName: string
  createdAt:   Date
}

export async function upsertUser(params: {
  gitlabUserId: number
  username:     string
  email:        string
  displayName:  string
}): Promise<StoredUser> {
  const result = await query<{
    id:           string
    username:     string
    email:        string
    display_name: string
    created_at:   Date
  }>(
    `INSERT INTO users (gitlab_user_id, username, email, display_name)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (gitlab_user_id)
     DO UPDATE SET
       username     = EXCLUDED.username,
       email        = EXCLUDED.email,
       display_name = EXCLUDED.display_name
     RETURNING id, username, email, display_name, created_at`,
    [params.gitlabUserId, params.username, params.email, params.displayName],
  )

  const row = result.rows[0]
  return {
    id:          row.id,
    username:    row.username,
    email:       row.email,
    displayName: row.display_name,
    createdAt:   row.created_at,
  }
}
```

**`display_name` vs `displayName` — snake_case to camelCase:**
PostgreSQL uses `snake_case` for column names by convention. TypeScript/JavaScript
uses `camelCase`. The `pg` library returns column names exactly as they appear in
SQL — `display_name`, not `displayName`. The mapping from `row.display_name` to
`storedUser.displayName` happens in the data layer, so all code above the data layer
uses camelCase. This is a data layer responsibility: translate storage conventions
to application conventions.

**Why not store the PAT:**
The PAT is a credential that authorises GitLab API calls. It belongs to the user and
can be revoked. Storing it in the `users` table means:
- Anyone who can read the database can impersonate every user
- A database backup contains all user credentials
- If the database is breached, every connected user's GitLab account is compromised

The PAT is stored in Electron's `safeStorage` in lesson 10 (encrypted, per-device),
not in PostgreSQL (plaintext, accessible to database admins). The database stores the
GitLab user ID as a cross-reference — this is enough to re-validate the PAT on next
launch without storing the PAT.

---

## Step 3 — Updating the Domain Layer

### Update `src/domain/auth.ts`

```typescript
import { fetchGitlabUser, type GitlabUser } from '../data/gitlab.js'
import { upsertUser,      type StoredUser }  from '../data/users.js'

export interface AuthResult {
  vaultUserId:  string
  gitlabUserId: number
  username:     string
  name:         string
  email:        string
}

export async function connectWithToken(
  gitlabUrl: string,
  token:     string,
): Promise<AuthResult> {
  const gitlabUser: GitlabUser = await fetchGitlabUser(gitlabUrl, token)

  if (gitlabUser.state !== 'active') {
    throw new Error(`GitLab account is ${gitlabUser.state}, not active`)
  }

  const storedUser: StoredUser = await upsertUser({
    gitlabUserId: gitlabUser.id,
    username:     gitlabUser.username,
    email:        gitlabUser.email,
    displayName:  gitlabUser.name,
  })

  return {
    vaultUserId:  storedUser.id,
    gitlabUserId: gitlabUser.id,
    username:     gitlabUser.username,
    name:         gitlabUser.name,
    email:        gitlabUser.email,
  }
}
```

**The domain layer orchestrates:**
`connectWithToken` now calls two data layer functions in sequence: first GitLab
(validate the token), then PostgreSQL (upsert the user). The domain layer does not
know how to call GitLab (that is `gitlab.ts`'s job) or how to write to PostgreSQL
(that is `users.ts`'s job). It coordinates them and enforces the business rule
(active account only) between the two calls.

**SE lens — the orchestrator pattern:**
`connectWithToken` is an **orchestrator** — it coordinates multiple operations
without owning any of them. The orchestrator pattern keeps coordination logic
separate from operational logic. Each data layer function can be tested independently;
the orchestrator can be tested with mocked data functions; neither knows about the
other.

---

## Step 4 — Updating the API Route

### Update `src/api/server.ts` (the auth route)

```typescript
// In the try block:
const result = await connectWithToken(gitlabUrl.trim(), token.trim())
response.json({
  vaultUserId:  result.vaultUserId,
  gitlabUserId: result.gitlabUserId,
  username:     result.username,
  name:         result.name,
  email:        result.email,
})
```

The API route passes the `vaultUserId` to the renderer. The renderer will use this
UUID for all subsequent operations that need to identify the current user.

---

## Step 5 — Verifying in psql

After connecting in the Vault app, run:

```
psql -U vault_user -d vault -c "SELECT id, username, email, display_name, created_at FROM users"
```

**What you should see:**
```
                 id                   | username |       email        | display_name | created_at
--------------------------------------+----------+--------------------+--------------+------------
 a4f12b3c-...                         | janedoe  | jane@example.com   | Jane Doe     | 2026-06-10 ...
```

The UUID in the `id` column is your Vault user ID. Connect again — the row updates
but does not duplicate. This confirms the upsert works correctly.

**`psql -c "SQL"` — one-shot query:**
`-c "SQL"` runs a single SQL statement and exits. Use `-c` for verification queries;
use the interactive `psql` session for exploration.

---

## Connect the Pieces

Identity is now fully established:

```
Vault UUID (users.id) ──────────────── Vault's internal identity
GitLab user ID (users.gitlab_user_id) ── Cross-reference to GitLab
GitLab PAT ─────────────────────────── Credential (not in database)
```

Every future operation that needs "who did this" uses the Vault UUID:
- `locks.held_by = UUID` — checkout attribution
- `versions.committed_by = UUID` — check-in attribution
- `wip_snapshots` — linked through `locks.held_by`

The UUID appears in the renderer's state after login and is included in API requests
that need to identify the caller (checkout, check-in, WIP save).

---

## What Breaks Without This

**Without `ON CONFLICT DO UPDATE`:**
`INSERT INTO users ... VALUES ($1, ...)` fails with a unique constraint violation if
the user connects a second time. The app shows an error after the first successful
connection. Every "reconnect" is a failure. The user cannot use Vault after closing
and reopening it without clearing the database.

**Without `RETURNING`:**
After the upsert, a separate `SELECT * FROM users WHERE gitlab_user_id = $1` query
is needed to get the UUID. This adds a round trip. More importantly, between the
INSERT and the SELECT, another process could theoretically modify the row — the
UUID returned by the SELECT might not be the UUID written by the INSERT in a
concurrent scenario. `RETURNING` makes this atomic: the returned UUID is
unconditionally the UUID of the affected row.

---

## Definition of Done

- [ ] Connecting with a valid PAT creates a row in the `users` table (verify with psql)
- [ ] Connecting a second time updates the existing row (no duplicate rows)
- [ ] `psql -c "SELECT * FROM users"` shows the row with a UUID `id`
- [ ] The renderer receives the `vaultUserId` UUID after connecting
- [ ] You can explain the upsert operation and what `ON CONFLICT DO UPDATE` does
- [ ] You can explain why the PAT is NOT stored in the `users` table
- [ ] You can explain idempotency with a concrete example from this lesson
- [ ] You can explain the difference between `EXCLUDED.username` and `users.username` in the SQL
- [ ] You can explain the orchestrator pattern and give an example from `connectWithToken`
- [ ] Run:
      ```
      git add src/domain/ src/data/
      git commit -m "Store user identity: upsert on GitLab user ID, RETURNING UUID, PAT excluded from database storage"
      ```

---

*Next: Lesson 10 — Sessions: Staying Logged In. After connecting, the session
persists across app restarts using Electron's safeStorage — the OS keychain. On
next launch, Vault restores the session without requiring the PAT again.*
