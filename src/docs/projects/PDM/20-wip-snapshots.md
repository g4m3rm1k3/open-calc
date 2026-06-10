# Vault PDM — Lesson 20 — WIP Snapshots

## What You Will Build

The "Save WIP" button is wired. Clicking it opens a file-select dialog to pick the
current version of the file from disk. Vault reads the file, base64-encodes it,
commits it to a dedicated WIP branch in GitLab, and records the snapshot SHA in
`wip_snapshots`. The "Saved WIP" count appears on the file row. WIP saves are
recoverable but do not appear in the committed version history.

## What You Need to Know First

Lessons 01–19. The file is checked out. The IPC pattern for file reading is established
from lesson 19. The `locks` and `wip_snapshots` tables exist. This lesson uses the
GitLab Commits API to write content to a branch.

---

## The Problem

An engineer may work on a file for several hours before it is ready to check in.
During that time, the laptop might crash, the file might be accidentally corrupted,
or the engineer might want to return to an earlier state. WIP saves are the equivalent
of git's `git stash` — recoverable snapshots that are not part of the committed
history.

WIP saves must:
- Be isolated from the main branch (no polluting the version timeline)
- Be recoverable (stored in GitLab, not just on the local machine)
- Be linked to the checkout (deleted when the file is checked in)
- Not require a meaningful commit message (they are progress saves, not deliberate versions)

---

## Step 1 — Git Branches

**Git branches — first appearance:**
A **branch** in git is a movable pointer to a commit. Creating a branch creates a
new pointer; committing on a branch advances the pointer to the new commit. The main
branch (default) records the committed version history. WIP branches are temporary:
created on checkout, deleted on check-in.

The WIP branch naming convention: `vault-wip/{lockId}`. Using the lock ID as the
branch name ensures:
- Each checkout has a unique WIP branch (no collisions between users or files)
- The branch can be found from the lock ID when recovering or deleting

**GitLab Commits API — first appearance:**
`POST /api/v4/projects/:id/repository/commits` creates a new commit. The request body:
```json
{
  "branch":         "vault-wip/lock-uuid",
  "commit_message": "WIP: housing-v3.step",
  "start_branch":   "main",
  "actions": [
    {
      "action":    "update",
      "file_path": "designs/housing/housing-v3.step",
      "content":   "<base64-encoded content>",
      "encoding":  "base64"
    }
  ]
}
```

`start_branch` — creates the WIP branch from `main` if it does not exist.
`actions` — an array of file operations in this commit: `create`, `update`, `move`,
`delete`.

---

## Step 2 — Reading the File from Disk via IPC

### Update `src/main/main.ts` — add file-open IPC handler

```typescript
ipcMain.handle(
  'file:open',
  async (_event, params: { defaultPath: string }) => {
    const openResult = await dialog.showOpenDialog({
      defaultPath: params.defaultPath,
      properties:  ['openFile'],
    })

    if (openResult.canceled || openResult.filePaths.length === 0) {
      return { success: false }
    }

    const selectedPath = openResult.filePaths[0]
    const content      = fs.readFileSync(selectedPath)

    return {
      success:       true,
      base64Content: content.toString('base64'),
      fileName:      path.basename(selectedPath),
      filePath:      selectedPath,
    }
  },
)
```

**`dialog.showOpenDialog` — first appearance:**
`dialog.showOpenDialog(options)` opens the OS file-open dialog. `properties: ['openFile']`
restricts selection to single files (not directories). Returns `{ canceled, filePaths }`.

**`fs.readFileSync(path)` — returns `Buffer`:**
Without a second argument specifying encoding, `readFileSync` returns a `Buffer` —
raw bytes. `buffer.toString('base64')` encodes the bytes as a base64 string. This is
the correct way to read a binary file (like a STEP file) for transmission.

**`path.basename(filePath)` — first appearance:**
`path.basename('/home/user/downloads/housing-v3.step')` returns `'housing-v3.step'`
— the filename portion of the path without the directory. Used to show the selected
filename in the UI and to construct the commit message.

---

## Step 3 — Data Layer: GitLab WIP Commit

### Add to `src/data/gitlab.ts`

```typescript
export async function commitWipSnapshot(
  gitlabUrl:     string,
  token:         string,
  projectId:     number,
  branchName:    string,
  filePath:      string,
  base64Content: string,
  lockId:        string,
): Promise<{ commitSha: string }> {
  const url = `${gitlabUrl}/api/v4/projects/${projectId}/repository/commits`

  const response = await fetch(url, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      branch:         branchName,
      commit_message: `WIP snapshot — ${path.basename(filePath)} [lockId: ${lockId}]`,
      start_branch:   'main',
      actions: [
        {
          action:    'update',
          file_path: filePath,
          content:   base64Content,
          encoding:  'base64',
        },
      ],
    }),
  })

  if (response.status === 400) {
    const body = await response.json() as { message: string }
    if (body.message.includes('A file with this name doesn\'t exist')) {
      const retryResponse = await fetch(url, {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          branch:         branchName,
          commit_message: `WIP snapshot — ${path.basename(filePath)} [lockId: ${lockId}]`,
          start_branch:   'main',
          actions: [
            {
              action:    'create',
              file_path: filePath,
              content:   base64Content,
              encoding:  'base64',
            },
          ],
        }),
      })
      if (!retryResponse.ok) throw new Error(`GitLab commit failed: ${retryResponse.status}`)
      const retryData = await retryResponse.json() as { id: string }
      return { commitSha: retryData.id }
    }
    throw new Error(`GitLab commit failed: ${body.message}`)
  }

  if (!response.ok) throw new Error(`GitLab commit failed: ${response.status}`)

  const data = await response.json() as { id: string }
  return { commitSha: data.id }
}
```

**`'update'` vs `'create'` action:**
If the file already exists on the WIP branch (a previous WIP save for the same
checkout), `action: 'update'` is needed. If this is the first WIP save for this
checkout (the WIP branch is being created from `main`), the file may not exist on
the WIP branch — `action: 'create'` is needed. The retry logic handles this case.
Production implementations would check whether the branch and file exist before
choosing the action; this simplified version uses the error response as feedback.

### Add to `src/data/files.ts` — WIP snapshot record

```typescript
export async function recordWipSnapshot(
  lockId:       string,
  branchName:   string,
  snapshotSha:  string,
): Promise<void> {
  await query(
    `INSERT INTO wip_snapshots (lock_id, gitlab_branch, snapshot_sha)
     VALUES ($1, $2, $3)`,
    [lockId, branchName, snapshotSha],
  )
}

export async function getWipSnapshotCount(lockId: string): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM wip_snapshots WHERE lock_id = $1`,
    [lockId],
  )
  return Number(result.rows[0].count)
}
```

**`COUNT(*)::text` — PostgreSQL type casting:**
PostgreSQL's `COUNT(*)` returns a `bigint` (64-bit integer). `pg` returns PostgreSQL
`bigint` values as strings to avoid JavaScript's number precision limits (JavaScript
numbers are 64-bit floats; large bigints would lose precision). `::text` casts the
count to text in SQL; `Number(result.rows[0].count)` converts the string to a
JavaScript number in TypeScript. For counts that will never exceed `Number.MAX_SAFE_INTEGER`,
this is safe.

---

## Step 4 — Domain Layer: Save WIP

### Create `src/domain/wip.ts`

```typescript
import { downloadFileContent, commitWipSnapshot } from '../data/gitlab.js'
import { getLockForFile, recordWipSnapshot }        from '../data/files.js'

export async function saveWipSnapshot(
  gitlabUrl:     string,
  token:         string,
  projectId:     number,
  filePath:      string,
  userId:        string,
  base64Content: string,
): Promise<{ snapshotSha: string }> {
  const file       = await getFileByPath(projectId, filePath)
  if (file === null) throw new Error('File not found in Vault')

  const lock = await getLockForFile(file.id)
  if (lock === null)         throw new Error('File is not checked out')
  if (lock.heldBy !== userId) throw new Error('You do not hold the checkout for this file')

  const branchName  = `vault-wip/${lock.lockId}`
  const { commitSha } = await commitWipSnapshot(
    gitlabUrl, token, projectId, branchName, filePath, base64Content, lock.lockId,
  )

  await recordWipSnapshot(lock.lockId, branchName, commitSha)

  return { snapshotSha: commitSha }
}
```

**The domain enforces the business rule:**
`lock.heldBy !== userId` — only the checkout holder can save WIP for this file.
Another engineer cannot save WIP to someone else's checkout. This rule lives in the
domain layer; it cannot be bypassed by calling the data layer directly.

---

## Step 5 — API Route and UI

### Add API route:

```typescript
app.post('/api/files/wip', async (request, response) => {
  const { gitlabUrl, token, projectId, filePath, userId, base64Content } = request.body as {
    gitlabUrl: string; token: string; projectId: number
    filePath: string; userId: string; base64Content: string
  }

  try {
    const result = await saveWipSnapshot(gitlabUrl, token, projectId, filePath, userId, base64Content)
    response.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'WIP save failed'
    response.status(400).json({ error: message })
  }
})
```

### Update `FileRow.tsx` — wire the Save WIP button:

```typescript
async function handleSaveWip(): Promise<void> {
  setSavingWip(true)
  setActionError('')

  const openResult = await window.electronAPI.openFile({
    defaultPath: electronApp.getPath('downloads'),
  })

  if (!openResult.success) {
    setSavingWip(false)
    return
  }

  try {
    const response = await fetch('http://localhost:3001/api/files/wip', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        gitlabUrl,
        token:         pat,
        projectId,
        filePath,
        userId:        currentUserId,
        base64Content: openResult.base64Content,
      }),
    })

    if (!response.ok) {
      const data = await response.json() as { error: string }
      setActionError(data.error)
    } else {
      setWipCount((count) => count + 1)
    }
  } catch {
    setActionError('WIP save failed')
  } finally {
    setSavingWip(false)
  }
}
```

---

## Connect the Pieces

WIP saves complete the "during checkout" workflow:

```
Check out → download file → edit locally → Save WIP (multiple times) → Check In
```

The WIP snapshots branch (`vault-wip/{lockId}`) accumulates commits with each save.
On check-in (lesson 21), the branch is deleted. If the check-in is interrupted
(network failure, crash), the WIP branch persists in GitLab. Recovery: a future
Vault version could offer "resume checkout from WIP" by reading the latest snapshot
from the WIP branch.

---

## Definition of Done

- [ ] Clicking "Save WIP" opens an OS file-select dialog
- [ ] After selecting the modified file, a "WIP saved" message appears (or the WIP count increments)
- [ ] `psql -c "SELECT * FROM wip_snapshots"` shows the snapshot with a commit SHA
- [ ] GitLab shows the WIP branch in the project's branches list
- [ ] Trying to save WIP for a file you have not checked out returns an error
- [ ] You can explain the difference between a WIP snapshot and a committed version
- [ ] You can explain the GitLab Commits API `actions` field — what `create` vs `update` does
- [ ] You can explain why the WIP branch is named with the lock ID
- [ ] You can explain `path.basename` and give an example
- [ ] Run:
      ```
      git add src/domain/ src/data/ src/api/ src/main/ src/renderer/
      git commit -m "Add WIP snapshots: GitLab Commits API, WIP branch per lock, file:open IPC, wip_snapshots table records"
      ```

---

*Next: Lesson 21 — The Check-in Flow. The complete check-in: upload file to GitLab
main branch, write version record, delete lock, delete WIP branch. Multi-system
transaction design and failure recovery are discussed.*
