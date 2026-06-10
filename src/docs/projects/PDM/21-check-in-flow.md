# Vault PDM — Lesson 21 — The Check-in Flow

## What You Will Build

The complete check-in: the user selects the finished file from disk, adds a commit
message, and clicks "Check In." Vault uploads the file to the GitLab default branch
(creating a new commit), writes a `versions` record in PostgreSQL, deletes the
`locks` record, and deletes the WIP branch. The file returns to "Available" status.
Multi-system failure recovery is designed explicitly.

## What You Need to Know First

Lessons 01–20. The checkout cycle exists. The WIP pattern demonstrates GitLab commit
creation. The `withTransaction` helper handles database-level atomicity. This lesson
combines a GitLab API call with a database transaction.

---

## The Problem

Check-in spans two systems: GitLab (the file commit) and PostgreSQL (the version
record and lock deletion). If the GitLab commit succeeds but the database write
fails, the file is committed to GitLab but Vault still shows it as checked out.
If the database write succeeds but the GitLab commit fails, the version record in
Vault has no corresponding commit in GitLab.

A database transaction handles atomicity within PostgreSQL. But transactions cannot
span GitLab and PostgreSQL — they are separate systems. Multi-system consistency
requires a different strategy: **ordering operations to minimise unrecoverable states**,
and designing **idempotent recovery**.

---

## Step 1 — Multi-System Transaction Design

**Multi-system transactions — first appearance:**
When two systems must both be updated for correctness, full atomicity is impossible
without a distributed transaction protocol (Two-Phase Commit — complex and slow).
Instead, design the operation so that:

1. **The operation that cannot be retried** happens first: the GitLab commit.
   If it fails, nothing is written to the database — the state is clean, retry is safe.

2. **The operation that can be retried** happens after: the PostgreSQL writes.
   If these fail after the GitLab commit succeeds, the commit SHA is known and can be
   recorded in a retry.

3. **Idempotent recovery**: if the process crashes between GitLab commit and DB write,
   the next check-in attempt can detect the committed state (by querying GitLab for
   the latest commit) and resume the DB writes.

**The check-in ordering:**
```
1. GitLab: commit file to main branch → returns commitSha
2. PostgreSQL (transaction):
   a. INSERT INTO versions (file_id, commit_sha, committed_by)
   b. DELETE FROM wip_snapshots WHERE lock_id = $lockId
   c. DELETE FROM locks WHERE id = $lockId
3. GitLab: delete WIP branch (best-effort — not critical)
```

If step 1 fails: no DB changes. Retry is safe.
If step 2 fails after step 1: the commit exists in GitLab but has no version record.
The file appears checked out. Recovery: query GitLab for the commit, write the version
record, release the lock. (The audit log from lesson 28 helps trace this.)
If step 3 fails: the WIP branch lingers in GitLab. Not critical — the file is released.
Daily cleanup (lesson 26) can find and delete orphaned WIP branches.

---

## Step 2 — Data Layer: GitLab Check-in Commit

### Add to `src/data/gitlab.ts`

```typescript
export async function commitCheckin(
  gitlabUrl:     string,
  token:         string,
  projectId:     number,
  filePath:      string,
  base64Content: string,
  commitMessage: string,
): Promise<{ commitSha: string }> {
  const url  = `${gitlabUrl}/api/v4/projects/${projectId}/repository/commits`
  const body = {
    branch:         'main',
    commit_message: commitMessage,
    actions: [
      {
        action:    'update',
        file_path: filePath,
        content:   base64Content,
        encoding:  'base64',
      },
    ],
  }

  const response = await fetch(url, {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({})) as { message?: string }
    throw new Error(
      `GitLab commit failed: ${response.status} — ${errorBody.message ?? response.statusText}`,
    )
  }

  const data = await response.json() as { id: string }
  return { commitSha: data.id }
}

export async function deleteBranch(
  gitlabUrl:  string,
  token:      string,
  projectId:  number,
  branchName: string,
): Promise<void> {
  const url = `${gitlabUrl}/api/v4/projects/${projectId}/repository/branches/${encodeURIComponent(branchName)}`
  await fetch(url, {
    method:  'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  })
  // Ignore errors — branch deletion is best-effort
}
```

---

## Step 3 — Data Layer: Database Writes

### Add to `src/data/files.ts`

```typescript
export async function completeCheckin(
  lockId:        string,
  fileId:        string,
  committedBy:   string,
  commitSha:     string,
  commitMessage: string,
): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO versions (file_id, commit_sha, committed_by, commit_message)
       VALUES ($1, $2, $3, $4)`,
      [fileId, commitSha, committedBy, commitMessage],
    )

    await client.query(
      `DELETE FROM wip_snapshots WHERE lock_id = $1`,
      [lockId],
    )

    await client.query(
      `DELETE FROM locks WHERE id = $1`,
      [lockId],
    )
  })
}
```

**Deleting snapshots and lock in one transaction:**
The three writes (insert version, delete snapshots, delete lock) are atomic. Either
all succeed or all fail. If the transaction fails, the file is still checked out
(lock still exists), the version is not recorded, and snapshots are intact — a clean,
retryable state.

The order within the transaction matters: insert the version record BEFORE deleting
the lock. If the INSERT fails, the ROLLBACK removes the version record and the lock
remains — correct. If the lock were deleted first, a failure mid-transaction could
leave the file with no lock but no version record either.

---

## Step 4 — Domain Layer: Check-in

### Create `src/domain/checkin.ts`

```typescript
import { commitCheckin, deleteBranch } from '../data/gitlab.js'
import { getFileByPath, getLockForFile, completeCheckin } from '../data/files.js'

export async function checkinFile(
  gitlabUrl:     string,
  token:         string,
  projectId:     number,
  filePath:      string,
  userId:        string,
  base64Content: string,
  commitMessage: string,
): Promise<{ commitSha: string }> {
  const file = await getFileByPath(projectId, filePath)
  if (file === null) throw new Error('File not found in Vault')

  const lock = await getLockForFile(file.id)
  if (lock === null)          throw new Error('File is not checked out')
  if (lock.heldBy !== userId) throw new Error('You do not hold the checkout for this file')

  const { commitSha } = await commitCheckin(
    gitlabUrl, token, projectId, filePath, base64Content, commitMessage,
  )

  await completeCheckin(
    lock.lockId, file.id, userId, commitSha,
    `${commitMessage}\n\nChecked in via Vault — file: ${filePath}`,
  )

  const wipBranch = `vault-wip/${lock.lockId}`
  await deleteBranch(gitlabUrl, token, projectId, wipBranch)

  return { commitSha }
}
```

---

## Step 5 — API Route and UI

### Add API route:

```typescript
import { checkinFile } from '../domain/checkin.js'

app.post('/api/files/checkin', async (request, response) => {
  const { gitlabUrl, token, projectId, filePath, userId, base64Content, commitMessage } =
    request.body as {
      gitlabUrl: string; token: string; projectId: number
      filePath: string; userId: string; base64Content: string; commitMessage: string
    }

  try {
    const result = await checkinFile(
      gitlabUrl, token, projectId, filePath, userId, base64Content, commitMessage,
    )
    response.json({ commitSha: result.commitSha })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Check-in failed'
    response.status(400).json({ error: message })
  }
})
```

### Update `FileRow.tsx` — Check In button with commit message input:

```typescript
const [commitMessage, setCommitMessage] = useState('')
const [checkingIn,    setCheckingIn]    = useState(false)

async function handleCheckin(): Promise<void> {
  if (commitMessage.trim() === '') {
    setActionError('A commit message is required')
    return
  }
  setCheckingIn(true)

  const fileResult = await window.electronAPI.openFile({})
  if (!fileResult.success) { setCheckingIn(false); return }

  try {
    const response = await fetch('http://localhost:3001/api/files/checkin', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        gitlabUrl, token: pat, projectId, filePath,
        userId: currentUserId, base64Content: fileResult.base64Content, commitMessage,
      }),
    })

    if (response.ok) {
      setCommitMessage('')
      onStatusChange()
    } else {
      const data = await response.json() as { error: string }
      setActionError(data.error)
    }
  } catch {
    setActionError('Check-in failed')
  } finally {
    setCheckingIn(false)
  }
}

// In JSX for checked-out-by-me files:
{isLockedByMe && (
  <div className="checkin-form">
    <input
      type="text"
      placeholder="Commit message (required)"
      value={commitMessage}
      onChange={(e) => setCommitMessage(e.target.value)}
      className="field-input"
    />
    <div className="action-group">
      <button className="action-btn" onClick={handleSaveWip} disabled={savingWip}>
        {savingWip ? 'Saving...' : `Save WIP${wipCount > 0 ? ` (${wipCount})` : ''}`}
      </button>
      <button
        className="action-btn action-btn--checkin"
        onClick={handleCheckin}
        disabled={checkingIn || commitMessage.trim() === ''}
      >
        {checkingIn ? 'Checking In...' : 'Check In'}
      </button>
    </div>
  </div>
)}
```

---

## Connect the Pieces

The complete checkout cycle:

```
Check Out → lock created → download file → edit locally
→ Save WIP (optional, multiple) → commits to WIP branch in GitLab
→ Check In → commit to main branch → version recorded → lock deleted → WIP branch deleted
```

After check-in, `getFileStatuses` (lesson 14) returns `lockedBy: null` — the file
is Available. The badge updates. The version is in the `versions` table (lesson 22).
GitLab's main branch has the new commit.

---

## What Breaks Without This

**Without the ordering (DB writes before GitLab commit):**
If the GitLab commit succeeds but the DB transaction fails, the new content is in
GitLab with no version record in Vault. Vault still shows the file as checked out.
The user cannot check in again — the GitLab commit will fail (the file content is
already the new version on the branch). Manual recovery is required.

The correct ordering (GitLab commit first, then DB) means: if the DB fails, the
commit SHA is known and the DB writes can be retried without re-doing the GitLab commit.

---

## Definition of Done

- [ ] Checking in a file creates a commit on GitLab's main branch (verify in GitLab UI)
- [ ] `psql -c "SELECT * FROM versions"` shows the version record with the commit SHA
- [ ] `psql -c "SELECT * FROM locks"` shows no lock for the checked-in file
- [ ] The WIP branch is deleted from GitLab after check-in
- [ ] The file badge returns to "Available" after check-in
- [ ] You can explain the multi-system transaction ordering and why GitLab commit goes first
- [ ] You can explain idempotent recovery — what state remains if the process crashes between the GitLab commit and the DB write
- [ ] You can explain why deleting the lock comes AFTER inserting the version record within the transaction
- [ ] Run:
      ```
      git add src/domain/ src/data/ src/api/ src/renderer/
      git commit -m "Add check-in flow: GitLab commit on main, version record, lock deletion, WIP branch cleanup, multi-system failure ordering"
      ```

---

*Next: Lesson 22 — Version History Panel. A history panel shows every committed
version of a file: who committed it, when, and the commit message. Any version can
be downloaded.*
