# Vault PDM — Lesson 14 — Showing Lock Status on the Tree

## What You Will Build

Each file in the tree now shows a status badge: "Available" (green) or "Checked Out
by [username]" (amber). The status comes from a JOIN query that combines the `files`
and `locks` tables. The `GET /api/projects/:id/file-statuses` endpoint returns the
status of every file in the project in one query.

## What You Need to Know First

Lessons 01–13. The `files` table is populated by the sync in lesson 13. The `locks`
table exists (lesson 05) but is empty. This lesson queries them together.

---

## The Problem

The file tree displays file names from GitLab. But it does not know which files are
checked out. The checkout information is in the `locks` table in PostgreSQL. Combining
data from two tables requires a SQL JOIN.

---

## Step 1 — SQL JOINs

**JOIN — first appearance:**
A **JOIN** combines rows from two tables based on a related column. The general form:

```sql
SELECT columns
FROM table_a
JOIN table_b ON table_a.column = table_b.column
```

For each row in `table_a`, JOIN finds matching rows in `table_b` (where the ON
condition is true) and combines them.

**Types of JOINs:**
- `INNER JOIN` (or just `JOIN`) — only rows with a match in BOTH tables
- `LEFT JOIN` — all rows from the left table; NULL for columns from the right table
  when no match exists
- `RIGHT JOIN` — all rows from the right table; NULL for left columns when no match
- `FULL OUTER JOIN` — all rows from both tables

**Why `LEFT JOIN` for file status:**
Every file in `files` should appear in the result — whether locked or not. If a file
is not locked, there is no row in `locks` for it. `INNER JOIN` would exclude
unlocked files. `LEFT JOIN files ... LEFT JOIN locks ...` keeps all files and fills
lock columns with `NULL` when no lock exists. `NULL` in `locks.held_by` means the
file is available.

**CS lens — the LEFT JOIN pattern for optional relationships:**
`locks.file_id` is an optional relationship — some files have locks, most do not.
The LEFT JOIN is the standard SQL pattern for "give me A, and optionally B if it
exists." This appears everywhere: articles with optional tags, users with optional
subscriptions, files with optional locks.

---

## Step 2 — The File Status Query

### Add to `src/data/files.ts`

```typescript
export interface FileWithStatus {
  fileId:          string
  filePath:        string
  fileType:        string
  lockedBy:        string | null
  lockedByUsername: string | null
  checkedOutAt:    Date   | null
}

export async function getFileStatuses(
  gitlabProjectId: number,
): Promise<FileWithStatus[]> {
  const result = await query<{
    file_id:            string
    file_path:          string
    file_type:          string
    locked_by:          string | null
    locked_by_username: string | null
    checked_out_at:     Date   | null
  }>(
    `SELECT
       f.id           AS file_id,
       f.file_path,
       f.file_type,
       l.held_by      AS locked_by,
       u.username     AS locked_by_username,
       l.checked_out_at
     FROM files f
     LEFT JOIN locks l  ON l.file_id = f.id
     LEFT JOIN users u  ON u.id      = l.held_by
     WHERE f.gitlab_project_id = $1
     ORDER BY f.file_path`,
    [gitlabProjectId],
  )

  return result.rows.map((row) => ({
    fileId:            row.file_id,
    filePath:          row.file_path,
    fileType:          row.file_type,
    lockedBy:          row.locked_by,
    lockedByUsername:  row.locked_by_username,
    checkedOutAt:      row.checked_out_at,
  }))
}
```

**The three-table join:**
1. `files f` — the base table: all files in the project
2. `LEFT JOIN locks l ON l.file_id = f.id` — for each file, find its lock (if any)
3. `LEFT JOIN users u ON u.id = l.held_by` — for each lock, find the user who holds it

When no lock exists for a file: `l.held_by` is `NULL`, `l.file_id` is `NULL`, and
the users join produces nothing — `u.username` is `NULL`. The result has:
`locked_by = NULL, locked_by_username = NULL, checked_out_at = NULL` — meaning
the file is available.

**Column aliasing — `AS file_id`:**
`f.id AS file_id` renames the column in the result set. Without the alias, `id`
would be ambiguous — both `files` and `locks` have an `id` column. Aliasing makes
the result unambiguous and maps database names to application-meaningful names.

**`ORDER BY f.file_path`:**
Sorting by path ensures consistent result order. Without `ORDER BY`, SQL results are
in an undefined order — they may vary between queries, database configurations, or
PostgreSQL versions. Always include `ORDER BY` when the result order matters.

---

## Step 3 — Domain and API

### Update `src/domain/fileTree.ts`

```typescript
import { getFileStatuses, type FileWithStatus } from '../data/files.js'

export async function getProjectFileStatuses(
  projectId: number,
): Promise<FileWithStatus[]> {
  return getFileStatuses(projectId)
}
```

### Add API route:

```typescript
import { getProjectFileStatuses } from '../domain/fileTree.js'

app.get('/api/projects/:projectId/file-statuses', async (request, response) => {
  const projectId = Number(request.params.projectId)

  try {
    const statuses = await getProjectFileStatuses(projectId)
    response.json(statuses)
  } catch (error) {
    response.status(500).json({ error: 'Failed to fetch file statuses' })
  }
})
```

---

## Step 4 — Status Badges in the File Tree

### Update `src/renderer/FileTree.tsx`

Add a status lookup passed to `TreeNode`:

```typescript
type StatusMap = Map<string, FileWithStatus>

// In FileTree component, after loading root items:
const [statusMap, setStatusMap] = useState<StatusMap>(new Map())

useEffect(() => {
  const params = new URLSearchParams({ projectId: String(projectId) })
  fetch(`http://localhost:3001/api/projects/${projectId}/file-statuses`)
    .then((r) => r.json())
    .then((statuses: FileWithStatus[]) => {
      const map = new Map(statuses.map((s) => [s.filePath, s]))
      setStatusMap(map)
    })
    .catch(() => {}) // statuses are supplementary — don't block the tree on failure
}, [projectId])
```

**`Map` — first appearance in React context:**
`Map<string, FileWithStatus>` is a JavaScript `Map` — a collection of key/value
pairs where keys can be any type (not just strings). `map.get(filePath)` looks up the
status for a given file path in O(1) time. Lookups in a plain object are also O(1),
but `Map` is preferred when keys are strings not known at compile time — the TypeScript
types are cleaner.

`new Map(iterable)` creates a `Map` from an array of `[key, value]` pairs.
`statuses.map(s => [s.filePath, s])` transforms the array into pairs; `new Map(...)`
builds the lookup structure in one expression.

In `FileNode` (the file variant of `TreeNode`):

```typescript
const status = statusMap.get(item.path)

<div className="tree-file" ...>
  <FileIcon name={item.name} />
  <span className="tree-item-name">{item.name}</span>
  {status !== undefined && (
    <LockBadge
      lockedByUsername={status.lockedByUsername}
      checkedOutAt={status.checkedOutAt}
    />
  )}
</div>
```

```typescript
function LockBadge({
  lockedByUsername,
  checkedOutAt,
}: {
  lockedByUsername: string | null
  checkedOutAt:     Date   | null
}) {
  if (lockedByUsername === null) {
    return <span className="badge badge--available">Available</span>
  }

  const since = checkedOutAt !== null
    ? new Date(checkedOutAt).toLocaleDateString()
    : 'recently'

  return (
    <span className="badge badge--checked-out" title={`Checked out on ${since}`}>
      {lockedByUsername}
    </span>
  )
}
```

**`new Date(checkedOutAt).toLocaleDateString()` — first appearance:**
`checkedOutAt` arrives from the API as a string (JSON serialises dates as ISO strings).
`new Date(string)` parses it back to a `Date` object. `.toLocaleDateString()` formats
it in the user's locale: `'6/10/2026'` on US systems, `'10/06/2026'` on UK systems.
Always use locale-aware formatters for user-visible dates — hard-coding a format
assumes all users share the same locale.

**`title={...}` — tooltip on hover:**
The HTML `title` attribute creates a browser tooltip shown when hovering over the
element. The full checkout date appears on hover — the badge shows only the username
to save space.

---

## Connect the Pieces

Lock status connects the file tree (GitLab data) with Vault metadata (PostgreSQL):

```
FileTree renders → fetches file-statuses → getFileStatuses SQL JOIN → FileWithStatus[]
GitLab tree items keyed by path → statusMap.get(item.path) → LockBadge renders
```

When a checkout happens (lesson 18), a lock record is written to `locks`. The next
time the file tree refreshes, `getFileStatuses` returns the new lock. The badge
updates. No additional code is needed — the JOIN picks up the new lock automatically.

---

## What Breaks Without This

**Without `LEFT JOIN` (using `INNER JOIN`):**
Only files with a lock record appear in the result. Unlocked files are excluded.
The status endpoint returns only checked-out files. The renderer tries to look up
statuses for all tree items but finds entries for only some — most files appear
without a badge at all, which looks like a loading failure.

**Without status fetch failure being silent (no error state):**
If `getFileStatuses` fails (database down, connection timeout), the statuses are
empty. Files show no badge — they look available even if some are checked out. This
is a minor inaccuracy. If the status failure blocked the tree display entirely
(throwing an error that prevents the tree from rendering), no files would be visible
at all — a worse outcome. Statuses are supplementary; the tree is essential.

---

## Definition of Done

- [ ] Files in the tree show "Available" (green) when not checked out
- [ ] After manually inserting a lock row in psql, the file shows "Checked Out by [username]"
- [ ] The badge shows the date in the browser tooltip (`title` attribute)
- [ ] The status fetch does not block the tree from displaying if it fails
- [ ] You can write the SQL JOIN query from memory and explain what LEFT JOIN returns when no match exists
- [ ] You can explain why `Map` is used instead of a plain object for the status lookup
- [ ] You can explain `toLocaleDateString` and why locale-aware formatting matters
- [ ] Run:
      ```
      git add src/data/ src/domain/ src/api/ src/renderer/
      git commit -m "Add lock status to file tree: LEFT JOIN across files/locks/users, status map in renderer, LockBadge component"
      ```

---

*Next: Lesson 15 — Error Handling and Loading States. Every async operation in the
file tree gets an explicit loading state and an error state with a retry button. No
API call is allowed to fail silently.*
