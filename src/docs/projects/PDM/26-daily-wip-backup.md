# Vault PDM — Lesson 26 — Daily WIP Backup Schedule

## What You Will Build

A background cron job runs daily at midnight. For every file currently checked out,
Vault reads the last known local file path from the WIP snapshot record and commits
the current disk content to the WIP branch. WIP snapshots older than 30 days are
deleted. The job is scheduled with `node-cron` and runs in the Electron main process.

## What You Need to Know First

Lessons 01–25. WIP snapshots work manually (lesson 20). The `locks` and `wip_snapshots`
tables are populated. This lesson automates the snapshot without user action.

---

## The Problem

An engineer might forget to save WIP for days. If their machine crashes, all work
since the last manual save is lost. Daily automatic snapshots ensure at most one day
of work is at risk.

This is a **background job** — it runs on a schedule independent of user actions.
It is not triggered by a button or an API call. It belongs in the main process (where
Node.js scheduling libraries work), not in the renderer.

---

## Step 1 — Cron Jobs

**Cron — first appearance:**
A **cron job** is a scheduled task that runs automatically at specified times.
The cron schedule format: `seconds minutes hours dayOfMonth month dayOfWeek`.

Examples:
- `0 0 * * *` — midnight every day (hour=0, minute=0, every day/month/weekday)
- `0 */6 * * *` — every 6 hours
- `*/15 * * * *` — every 15 minutes
- `0 9 * * 1` — 9 AM every Monday

**`node-cron` — first appearance:**
`node-cron` is a Node.js library for scheduling tasks using cron expressions.

```json
"node-cron": "^3.0.0",
"@types/node-cron": "^3.0.0"
```

---

## Step 2 — The Backup Job

### Create `src/main/jobs/wipBackup.ts`

```typescript
import cron            from 'node-cron'
import { query }       from '../../data/database.js'
import { commitWipSnapshot } from '../../data/gitlab.js'
import { recordWipSnapshot }  from '../../data/files.js'
import { loadSession }         from '../sessionStore.js'
import fs                      from 'fs'

export function scheduleWipBackup(): void {
  cron.schedule('0 0 * * *', async () => {
    console.log(`[WIP Backup] Starting at ${new Date().toISOString()}`)

    try {
      await runWipBackup()
    } catch (error) {
      console.error('[WIP Backup] Failed:', error)
    }
  })
}
```

**`cron.schedule(expression, callback)` — first appearance:**
`cron.schedule` registers a function to run at the specified cron times. The task
runs in the background — it does not block the main process or the renderer.
`node-cron` uses Node.js timers internally; it is not a separate process.

```typescript
async function runWipBackup(): Promise<void> {
  const session = loadSession()
  if (session === null) {
    console.log('[WIP Backup] No session — skipping')
    return
  }

  const activeLocks = await query<{
    lock_id:     string
    file_id:     string
    file_path:   string
    held_by:     string
    project_id:  number
    local_path:  string | null
  }>(
    `SELECT
       l.id           AS lock_id,
       l.file_id,
       f.file_path,
       l.held_by,
       f.gitlab_project_id AS project_id,
       (SELECT wip.local_path
        FROM   wip_snapshots wip
        WHERE  wip.lock_id = l.id
        ORDER  BY wip.saved_at DESC
        LIMIT  1) AS local_path
     FROM locks l
     JOIN files f ON f.id = l.file_id`,
  )

  console.log(`[WIP Backup] Found ${activeLocks.rows.length} active checkouts`)

  for (const lock of activeLocks.rows) {
    if (lock.local_path === null) {
      console.log(`[WIP Backup] No local path for ${lock.file_path} — skipping`)
      continue
    }

    if (!fs.existsSync(lock.local_path)) {
      console.log(`[WIP Backup] File not found at ${lock.local_path} — skipping`)
      continue
    }

    try {
      const content    = fs.readFileSync(lock.local_path)
      const base64     = content.toString('base64')
      const branchName = `vault-wip/${lock.lock_id}`

      const { commitSha } = await commitWipSnapshot(
        session.gitlabUrl,
        session.pat,
        lock.project_id,
        lock.file_path,
        base64,
        lock.lock_id,
      )

      await recordWipSnapshot(lock.lock_id, branchName, commitSha)
      console.log(`[WIP Backup] Saved ${lock.file_path} — SHA ${commitSha.slice(0, 8)}`)
    } catch (error) {
      console.error(`[WIP Backup] Failed for ${lock.file_path}:`, error)
    }
  }

  await cleanOldSnapshots()
  console.log('[WIP Backup] Complete')
}
```

**Iterating over locks — loop vs Promise.all:**
The backup job uses a `for` loop (sequential) rather than `Promise.all` (parallel).
Sequential is correct here: if one snapshot fails, the loop continues with the next.
`Promise.all` would fail all snapshots if any one fails. For resilient background
jobs, sequential iteration with per-item error handling is more robust.

**`fs.existsSync` before reading:**
The local file might have been moved, renamed, or deleted since the last WIP save.
`existsSync` checks before reading — reading a non-existent file throws.
Background jobs must be resilient to missing files; skip and log rather than crash.

```typescript
async function cleanOldSnapshots(): Promise<void> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)

  await query(
    `DELETE FROM wip_snapshots WHERE saved_at < $1`,
    [cutoff],
  )

  console.log(`[WIP Backup] Cleaned snapshots older than ${cutoff.toISOString()}`)
}
```

**Retention policy — 30-day cleanup:**
Keeping unlimited WIP snapshots would grow the database and GitLab's branch history
indefinitely. Deleting snapshots older than 30 days is the retention policy. The
`saved_at` timestamp makes this a simple `DELETE WHERE saved_at < cutoff`. The
GitLab WIP branch itself accumulates commits — in production, old commits would be
squashed or the branch rebased; for this learning project, branch cleanup is omitted.

**`new Date(); cutoff.setDate(cutoff.getDate() - 30)` — date arithmetic:**
`new Date()` is today. `getDate()` returns the day-of-month (1–31). `setDate(day - 30)`
sets the day 30 days in the past, correctly handling month boundaries (January 1 minus
30 days becomes December 2 of the previous year — `Date` handles this).

---

## Step 3 — Scheduling on App Start

### Update `src/main/main.ts`

```typescript
import { scheduleWipBackup } from './jobs/wipBackup.js'

app.whenReady().then(async () => {
  scheduleWipBackup()
  // ... existing createWindow() and session restore
})
```

**Where background jobs live:**
Background jobs run in the main process — they use Node.js APIs (`fs`, cron timers)
and database connections. They are not API routes (they are not request-triggered)
and not renderer code (they have no UI). The `src/main/jobs/` directory is the
natural home: it is main-process code, not API layer code.

**SE lens — background jobs as a separate concern:**
The WIP backup job is independent of the request cycle. It does not touch Express
routes, renderer state, or user-triggered events. It reads from the database, calls
GitLab, and writes back to the database. This isolation allows the job to be tested
independently (call `runWipBackup()` in a test) and modified without touching any
request-handling code.

---

## Connect the Pieces

The backup job uses domain and data layer functions already written:
- `commitWipSnapshot` from `src/data/gitlab.ts` (lesson 20)
- `recordWipSnapshot` from `src/data/files.ts` (lesson 20)
- `query` from `src/data/database.ts` (lesson 03)

No new domain functions are needed — the backup is an automated execution of the
same operations the user performs manually. Reusing existing functions ensures the
backup produces identical results to a manual save.

---

## What Breaks Without This

**Without per-item error handling in the backup loop:**
If one GitLab API call fails (rate limit, network timeout), an unhandled error
would propagate out of the loop and abort the backup for all remaining checkouts.
The per-item `try/catch` ensures one failure does not affect others.

**Without the 30-day cleanup:**
WIP snapshot records accumulate indefinitely. The `wip_snapshots` table grows unbounded.
After one year with 10 active users each making daily saves, the table has ~3,650 rows
— manageable. After five years, ~18,000. Without cleanup, the table grows forever.
The cleanup also prevents the GitLab WIP branches from becoming a graveyard of
thousands of old commits.

---

## Definition of Done

- [ ] `scheduleWipBackup()` is called on app launch (verify with console log on startup)
- [ ] Calling `runWipBackup()` directly creates WIP snapshots for active checkouts
- [ ] `psql -c "SELECT * FROM wip_snapshots"` shows new rows after running the backup
- [ ] Files with no local path are skipped (logged, not errored)
- [ ] Snapshots older than 30 days are deleted by `cleanOldSnapshots`
- [ ] You can explain the cron expression `0 0 * * *` and write one for "every Monday at 9AM"
- [ ] You can explain why the backup uses a `for` loop instead of `Promise.all`
- [ ] You can explain retention policies — why data accumulates without them, and the trade-off between storage cost and recovery window
- [ ] Run:
      ```
      git add src/main/jobs/ src/main/
      git commit -m "Add daily WIP backup: node-cron at midnight, iterates active locks, 30-day snapshot retention cleanup"
      ```

---

*Next: Lesson 27 — In-App Notifications. When a file you are waiting for is checked
in, a notification appears in Vault. Implemented with server-sent events from Express
to the renderer.*
