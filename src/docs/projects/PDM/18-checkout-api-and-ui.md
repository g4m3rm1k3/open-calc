# Vault PDM — Lesson 18 — The Checkout API Route and UI

## What You Will Build

`POST /api/files/checkout` — the API route that calls `checkoutFile`. In the file
tree, each available file shows a "Check Out" button. Clicking it calls the API.
On success, the file row updates to show "Checked Out by You" with a "Check In"
button replacing the "Check Out" button. On failure (already locked), the error
message shows who holds the lock. The status refreshes without reloading the whole tree.

## What You Need to Know First

Lessons 01–17. `checkoutFile` is atomic. `AsyncView` handles loading and error states.
The file tree shows lock badges. This lesson connects everything with API routes and
UI interactions.

---

## The Problem

The domain function works. The renderer knows about file status. They need to be
connected: a user action (click) must trigger the domain function (checkout) and
update the UI (show new lock status). The API layer is the bridge.

---

## Step 1 — HTTP POST for State-Changing Operations

**POST for mutations — restated precisely:**
A checkout changes the database (creates a lock record). This is a **state-changing
operation**. In REST design:
- `GET` is for reading state — must be **idempotent** (same result every call)
  and **safe** (no side effects)
- `POST` is for creating/changing state — not necessarily idempotent

`POST /api/files/checkout` is correct. `GET /api/files/checkout` would be wrong:
browsers may prefetch, cache, or retry GET requests — a checkout would fire multiple
times.

**Idempotency — restated in this context:**
`checkoutFile` is NOT idempotent: calling it twice for the same file has different
outcomes (success the first time, "already-locked" the second). This is correct
domain behaviour. Compare: `upsertFile` IS idempotent — calling it twice with the
same data produces the same result.

---

## Step 2 — The API Route

### Update `src/api/server.ts`

```typescript
import { checkoutFile } from '../domain/checkout.js'

app.post('/api/files/checkout', async (request, response) => {
  const { gitlabProjectId, filePath, userId } = request.body as {
    gitlabProjectId: number
    filePath:        string
    userId:          string
  }

  if (!gitlabProjectId || !filePath || !userId) {
    response.status(400).json({ error: 'gitlabProjectId, filePath, and userId are required' })
    return
  }

  try {
    const result = await checkoutFile(gitlabProjectId, filePath, userId)

    if (result.success) {
      response.status(201).json({ lock: result.lock })
    } else if (result.reason === 'already-locked') {
      response.status(409).json({
        error:     'File is already checked out',
        lockedBy:  result.lockedBy,
      })
    } else {
      response.status(404).json({ error: 'File not found in Vault' })
    }
  } catch (error) {
    response.status(500).json({ error: 'Checkout failed due to a server error' })
  }
})
```

**`201 Created`:**
`201 Created` is the correct status for a successful resource creation. The checkout
*created* a lock record. `200 OK` would also be acceptable but less precise. `201`
communicates "a new resource was created as a result of this POST."

**`409 Conflict`:**
`409 Conflict` indicates that the request conflicts with the current state of the
resource. "File is already checked out" is a conflict — the requested lock conflicts
with the existing lock. This is more precise than `400 Bad Request` (which means the
request is malformed) or `403 Forbidden` (which means the user is not allowed).
HTTP status codes have semantic meanings — using them precisely helps clients handle
errors correctly.

**The API layer maps domain results to HTTP:**
The domain function returns `{ success: false, reason: 'already-locked', lockedBy }`.
The API layer maps this to HTTP 409. The domain layer does not know about HTTP — this
mapping is the API layer's only job.

---

## Step 3 — File Row with Actions

### Create `src/renderer/FileRow.tsx`

```typescript
import { useState } from 'react'
import type { FileWithStatus } from '../../domain/fileTree.js'
import './FileRow.css'

interface FileRowProps {
  filePath:     string
  fileStatus:   FileWithStatus | undefined
  projectId:    number
  currentUserId: string
  token:        string
  onStatusChange: () => void
}

export function FileRow({
  filePath,
  fileStatus,
  projectId,
  currentUserId,
  token,
  onStatusChange,
}: FileRowProps) {
  const [checkingOut, setCheckingOut] = useState(false)
  const [actionError, setActionError] = useState('')

  const isLockedByMe = fileStatus?.lockedBy === currentUserId
  const isLocked     = fileStatus?.lockedBy !== null && fileStatus?.lockedBy !== undefined
  const filename     = filePath.split('/').pop() ?? filePath

  async function handleCheckout(): Promise<void> {
    setCheckingOut(true)
    setActionError('')
    try {
      const response = await fetch('http://localhost:3001/api/files/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          gitlabProjectId: projectId,
          filePath,
          userId:          currentUserId,
        }),
      })

      const data = await response.json() as { error?: string; lockedBy?: string }

      if (response.ok) {
        onStatusChange()
      } else if (response.status === 409) {
        setActionError(`Already checked out by ${data.lockedBy ?? 'another user'}`)
      } else {
        setActionError(data.error ?? 'Checkout failed')
      }
    } catch {
      setActionError('Network error during checkout')
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <div className="file-row">
      <span className="file-name">{filename}</span>

      {fileStatus !== undefined && (
        <span className={`badge ${isLocked ? 'badge--checked-out' : 'badge--available'}`}>
          {isLocked
            ? (isLockedByMe ? 'Checked Out by You' : `${fileStatus.lockedByUsername}`)
            : 'Available'}
        </span>
      )}

      {!isLocked && (
        <button
          className="action-btn"
          onClick={handleCheckout}
          disabled={checkingOut}
        >
          {checkingOut ? 'Checking Out...' : 'Check Out'}
        </button>
      )}

      {isLockedByMe && (
        <div className="action-group">
          <button className="action-btn action-btn--wip">Save WIP</button>
          <button className="action-btn action-btn--checkin">Check In</button>
        </div>
      )}

      {actionError !== '' && (
        <span className="action-error">{actionError}</span>
      )}
    </div>
  )
}
```

**`onStatusChange` — notifying parent to refresh:**
When checkout succeeds, the lock status in the `statusMap` (held in `FileTree`) is
stale — it still shows "Available" for the just-checked-out file. `onStatusChange()`
tells `FileTree` to re-fetch statuses. The parent refreshes; the badge updates.
This is the correct pattern for sibling data sync: a child action triggers a parent
refresh which propagates down to all children.

**`isLockedByMe` — comparing UUIDs:**
`fileStatus?.lockedBy === currentUserId` compares the UUIDs. Both are PostgreSQL
UUID strings — exact string comparison is correct. The "Checked Out by You" badge
replaces the username badge only for the current user. Other users see the checker's
username.

**`Save WIP` and `Check In` buttons — stubbed:**
These buttons have no `onClick` handlers yet — they are visual stubs for lessons 20
and 21. In production code, never commit UI stubs without noting they are incomplete.
Here, the visual presence confirms the checkout UI is correct before wiring the
follow-on operations.

---

## Step 4 — CSS

### Create `src/renderer/FileRow.css`

```css
.file-row {
  display:     flex;
  align-items: center;
  gap:         8px;
  padding:     10px 16px;
  border-bottom: 1px solid var(--colour-border);
}

.file-name {
  flex:        1;
  font-family: monospace;
  font-size:   0.875rem;
  color:       var(--colour-text);
  overflow:    hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-btn {
  padding:      4px 10px;
  border:       1px solid var(--colour-border);
  border-radius: 4px;
  background:   transparent;
  color:        var(--colour-text);
  font-size:    0.75rem;
  cursor:       pointer;
  transition:   background-color 0.1s, border-color 0.1s;
  white-space:  nowrap;
}

.action-btn:hover {
  background:   var(--colour-surface-hover);
  border-color: var(--colour-accent);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor:  not-allowed;
}

.action-btn--checkin {
  border-color: var(--colour-checked-in);
  color:        var(--colour-checked-in);
}

.action-group {
  display: flex;
  gap:     6px;
}

.action-error {
  font-size: 0.75rem;
  color:     var(--colour-error);
}

.badge--available {
  background: color-mix(in srgb, var(--colour-checked-in) 15%, transparent);
  color:      var(--colour-checked-in);
  border:     1px solid var(--colour-checked-in);
  padding:    2px 8px;
  border-radius: 10px;
  font-size:  0.75rem;
}

.badge--checked-out {
  background: color-mix(in srgb, var(--colour-checked-out) 15%, transparent);
  color:      var(--colour-checked-out);
  border:     1px solid var(--colour-checked-out);
  padding:    2px 8px;
  border-radius: 10px;
  font-size:  0.75rem;
}
```

**`text-overflow: ellipsis` — first appearance:**
Long file names overflow the flex container. `overflow: hidden` clips the text.
`text-overflow: ellipsis` replaces the clipped portion with `...`. `white-space: nowrap`
prevents the text from wrapping. Together, these three properties truncate long file
names with ellipsis — a standard UI pattern for constrained-width lists.

---

## Connect the Pieces

The checkout flow end to end:

```
User clicks "Check Out"
  → fetch POST /api/files/checkout { gitlabProjectId, filePath, userId }
  → checkoutFile(projectId, filePath, userId) [domain]
  → atomicCheckout (BEGIN, FOR UPDATE, INSERT, COMMIT) [data]
  → success: 201 { lock: { lockId, heldBy, ... } }
  → onStatusChange() → parent re-fetches /api/projects/:id/file-statuses
  → statusMap updated → FileRow re-renders with "Checked Out by You" badge
```

---

## What Breaks Without This

**Without `onStatusChange()` after checkout:**
The badge stays "Available" even after successful checkout. The UI is wrong —
the user does not see their own checkout reflected. They might click "Check Out"
again, triggering a second call that returns 409. The stale UI makes the system
appear broken even when it works correctly.

**Without `409 Conflict` (using 400 instead):**
The renderer receives 400 for "already locked." 400 means "your request was invalid."
But the request WAS valid — the file path is correct, the user ID is correct. The
request is not malformed; it conflicts with existing state. 409 communicates the
correct semantics. Future clients (mobile app, CLI tool) that handle status codes can
distinguish "bad request" from "conflict" and present the right message.

---

## Definition of Done

- [ ] Available files show a "Check Out" button
- [ ] Clicking "Check Out" transitions the button to "Checking Out..." (disabled)
- [ ] After successful checkout, the file badge shows "Checked Out by You" and the "Save WIP" / "Check In" buttons appear
- [ ] Trying to check out an already-locked file shows the lock holder's username
- [ ] The Network tab shows `POST /api/files/checkout` with status 201 on success, 409 on conflict
- [ ] You can explain HTTP 201 vs 200 and HTTP 409 vs 400 with the reasons for each
- [ ] You can explain the `onStatusChange` pattern and why the parent re-fetches rather than the child updating its own badge
- [ ] You can explain `text-overflow: ellipsis` and the three CSS properties that make it work
- [ ] Run:
      ```
      git add src/api/ src/renderer/
      git commit -m "Add checkout UI: POST /api/files/checkout route, FileRow component with Check Out button, 201/409 status codes"
      ```

---

*Next: Lesson 19 — Downloading the File. After checkout, the user downloads the file
to their local machine. GitLab's file content API, base64 decoding, and Electron's
IPC for file system writes are introduced.*
