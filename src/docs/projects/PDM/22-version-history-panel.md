# Vault PDM — Lesson 22 — Version History Panel

## What You Will Build

Clicking a file opens a version history panel showing every committed version: version
number, who committed it, the date, and the commit message. Each version has a
"Download" button that fetches that specific commit from GitLab. The panel is
read-only — history is never modified.

## What You Need to Know First

Lessons 01–21. The `versions` table has records after check-in. The `users` table has
the committer's username. The download pattern (lesson 19) works for any commit SHA.

---

## Step 1 — The Version History Query

### Add to `src/data/files.ts`

```typescript
export interface VersionRecord {
  versionId:     string
  versionNumber: number
  commitSha:     string
  committedBy:   string
  committedByName: string
  commitMessage: string
  committedAt:   Date
}

export async function getVersionHistory(
  fileId: string,
): Promise<VersionRecord[]> {
  const result = await query<{
    version_id:       string
    version_number:   string
    commit_sha:       string
    committed_by:     string
    committed_by_name: string
    commit_message:   string
    committed_at:     Date
  }>(
    `SELECT
       v.id              AS version_id,
       ROW_NUMBER() OVER (ORDER BY v.committed_at ASC)::text AS version_number,
       v.commit_sha,
       u.username        AS committed_by,
       u.display_name    AS committed_by_name,
       v.commit_message,
       v.committed_at
     FROM versions v
     JOIN users u ON u.id = v.committed_by
     WHERE v.file_id = $1
     ORDER BY v.committed_at DESC`,
    [fileId],
  )

  return result.rows.map((row) => ({
    versionId:       row.version_id,
    versionNumber:   Number(row.version_number),
    commitSha:       row.commit_sha,
    committedBy:     row.committed_by,
    committedByName: row.committed_by_name,
    commitMessage:   row.commit_message,
    committedAt:     row.committed_at,
  }))
}
```

**`ROW_NUMBER() OVER (ORDER BY committed_at ASC)` — window functions:**
`ROW_NUMBER()` is a **window function** — a function that computes a value for each
row based on a set of rows (the "window"). `OVER (ORDER BY committed_at ASC)` defines
the window: all version rows ordered by commit date, oldest first. `ROW_NUMBER()`
assigns sequential integers starting at 1. The newest version has the highest number.

**Window functions — first appearance:**
Standard aggregate functions (`COUNT`, `SUM`, `MAX`) collapse multiple rows into one.
Window functions compute per-row values using information from multiple rows, without
collapsing. Common window functions: `ROW_NUMBER()`, `RANK()`, `LAG()` (value from
the previous row), `LEAD()` (value from the next row), `SUM() OVER (...)` (running
total). Window functions are standard SQL and supported by PostgreSQL, MySQL 8+,
SQLite 3.25+, and all major databases.

**`ORDER BY committed_at DESC` — latest version first:**
The panel shows newest versions at the top. The `ROW_NUMBER` window uses ascending
order (oldest = version 1), but the outer query returns rows in descending order
(newest first). Window function ordering is independent of the outer `ORDER BY`.

**Read-only by design:**
`getVersionHistory` is a `SELECT` query — it reads data. There is no `UPDATE` or
`DELETE` for version records. Version records are **append-only**: once created, they
are never modified. The audit value of version history depends on immutability. If
version records could be deleted, the history could be altered.

---

## Step 2 — Domain and API

### Add to `src/domain/fileTree.ts`

```typescript
export async function getFileVersionHistory(
  projectId: number,
  filePath:  string,
): Promise<VersionRecord[]> {
  const file = await getFileByPath(projectId, filePath)
  if (file === null) return []
  return getVersionHistory(file.id)
}
```

### Add API route:

```typescript
app.get('/api/files/versions', async (request, response) => {
  const { projectId, filePath } = request.query as {
    projectId: string
    filePath:  string
  }

  try {
    const versions = await getFileVersionHistory(Number(projectId), filePath)
    response.json(versions)
  } catch (error) {
    response.status(500).json({ error: 'Failed to fetch version history' })
  }
})
```

---

## Step 3 — The Version History Panel Component

### Create `src/renderer/VersionHistoryPanel.tsx`

```typescript
import { useEffect }          from 'react'
import { useAsyncState }       from './hooks/useAsyncState.js'
import { AsyncView }           from './components/AsyncView.js'
import type { VersionRecord }  from '../../domain/fileTree.js'
import './VersionHistoryPanel.css'

interface VersionHistoryPanelProps {
  projectId:     number
  filePath:      string
  gitlabUrl:     string
  token:         string
  onDownload:    (commitSha: string, fileName: string) => void
}

export function VersionHistoryPanel({
  projectId,
  filePath,
  gitlabUrl,
  token,
  onDownload,
}: VersionHistoryPanelProps) {
  const fileName = filePath.split('/').pop() ?? filePath

  async function fetchVersions(): Promise<VersionRecord[]> {
    const params   = new URLSearchParams({ projectId: String(projectId), filePath })
    const response = await fetch(`http://localhost:3001/api/files/versions?${params}`)
    if (!response.ok) throw new Error('Failed to load version history')
    return response.json()
  }

  const { state, trigger } = useAsyncState(fetchVersions)
  useEffect(() => { trigger() }, [trigger])

  return (
    <div className="version-panel">
      <h3 className="version-panel-title">History — {fileName}</h3>
      <AsyncView state={state} onRetry={trigger} loadingText="Loading history...">
        {(versions) =>
          versions.length === 0 ? (
            <p className="version-empty">No committed versions yet.</p>
          ) : (
            <ul className="version-list">
              {versions.map((version) => (
                <VersionRow
                  key={version.versionId}
                  version={version}
                  fileName={fileName}
                  onDownload={onDownload}
                />
              ))}
            </ul>
          )
        }
      </AsyncView>
    </div>
  )
}

function VersionRow({
  version,
  fileName,
  onDownload,
}: {
  version:    VersionRecord
  fileName:   string
  onDownload: (sha: string, name: string) => void
}) {
  const date = new Date(version.committedAt).toLocaleString()

  return (
    <li className="version-row">
      <div className="version-number">v{version.versionNumber}</div>
      <div className="version-info">
        <div className="version-message">{version.commitMessage}</div>
        <div className="version-meta">
          {version.committedByName} · {date}
        </div>
        <div className="version-sha" title={version.commitSha}>
          {version.commitSha.slice(0, 8)}
        </div>
      </div>
      <button
        className="action-btn"
        onClick={() => onDownload(version.commitSha, `${fileName}_v${version.versionNumber}`)}
      >
        Download
      </button>
    </li>
  )
}
```

**`version.commitSha.slice(0, 8)` — abbreviated commit SHA:**
A full commit SHA is 40 hex characters: `a1b2c3d4e5f6...`. Displaying 8 characters
is the conventional abbreviation — enough to uniquely identify a commit for human
reading (the probability of two SHAs sharing the first 8 characters in a normal
repository is negligible). This is the same convention used by `git log --short`.

**`title={version.commitSha}` — full SHA in tooltip:**
The abbreviated SHA in the UI has the full SHA in the `title` attribute. Hovering
reveals it. Copy-pasting the full SHA (for looking up the commit in GitLab) is done
from the tooltip.

**`new Date(version.committedAt).toLocaleString()`:**
`version.committedAt` arrives as an ISO string from the API. `new Date(isoString)`
parses it. `.toLocaleString()` formats both date and time in the user's locale:
`"6/10/2026, 2:30:15 PM"` on US systems.

**Read model — SE lens:**
The version history panel is a **read model** — it exists only to display data, not
to modify it. It has no "edit" button, no "delete" action, no state that changes.
Read models are separate from write paths for a reason: the constraints differ. The
write path (checkin) must be atomic and consistent; the read path can tolerate
slightly stale data (a version added 500ms ago might not yet appear). The version
panel does not share code with `checkinFile`.

---

## Connect the Pieces

After this lesson, the full version timeline is visible. In the GitLab UI, the same
history is visible in the project's commit log. Both show the same commits — Vault's
panel adds the Vault-specific metadata (version numbers, names) from PostgreSQL.

Lesson 23 traces this full history in a review exercise.

---

## Definition of Done

- [ ] Clicking a file in the tree opens the version history panel
- [ ] After checking in, the version appears immediately (trigger re-fetch after check-in)
- [ ] Clicking "Download" for a version downloads that specific commit's file content
- [ ] The version number, committer name, date, and abbreviated SHA display correctly
- [ ] Files with no check-ins show "No committed versions yet"
- [ ] You can explain `ROW_NUMBER() OVER (ORDER BY ...)` — what a window function is and what `OVER` specifies
- [ ] You can explain why the version panel is a read model and what that means architecturally
- [ ] You can explain why version records are append-only and what would be lost if they could be deleted
- [ ] Run:
      ```
      git add src/data/ src/domain/ src/api/ src/renderer/
      git commit -m "Add version history panel: JOIN across versions/users, ROW_NUMBER window function, read-only per-version download"
      ```

---

*Next: Lesson 23 — Phase 4 Review: The Full Checkout Cycle. A review lesson tracing
the complete cycle. An ASCII sequence diagram is written and committed.*
