# Vault PDM — Lesson 13 — Syncing the File Tree to the Database

## What You Will Build

When the file tree is fetched from GitLab, Vault upserts all file paths into the
`files` table. This creates the Vault metadata record for each file — the record that
lock and version information will attach to. After this lesson, `psql -c "SELECT
file_path FROM files"` shows every file in the project.

## What You Need to Know First

Lessons 01–12. The file tree is displayed from GitLab data. The `files` table exists
(lesson 05). This lesson bridges them: GitLab's tree data creates/updates Vault's
metadata records.

---

## The Problem

The GitLab Trees API returns files as they exist in the repository. Vault adds a
metadata layer on top: lock status, version history, file type. This metadata must
be stored in PostgreSQL, keyed by the GitLab file path. But the `files` table cannot
be pre-populated — the user connects to different projects. Files are created in the
`files` table on first encounter.

This is a **sync** operation: bring the local database state in line with the
authoritative source (GitLab). New files are inserted. Existing files (from a
previous sync) are updated if their path is unchanged. Files deleted from GitLab are
not deleted from Vault — version history must be preserved even if the file is gone.

---

## Step 1 — The Upsert for Files

### Add to `src/data/files.ts`

```typescript
import { query } from './database.js'

export interface StoredFile {
  id:               string
  gitlabProjectId:  number
  filePath:         string
  fileType:         string
  createdAt:        Date
}

export async function upsertFiles(
  gitlabProjectId: number,
  filePaths:       string[],
): Promise<StoredFile[]> {
  if (filePaths.length === 0) return []

  const placeholders = filePaths.map((_, index) => {
    const baseIndex = index * 2 + 2
    return `($1, $${baseIndex}, $${baseIndex + 1})`
  }).join(', ')

  const values: (number | string)[] = [gitlabProjectId]
  for (const filePath of filePaths) {
    values.push(filePath)
    values.push(inferFileType(filePath))
  }

  const result = await query<{
    id:                 string
    gitlab_project_id:  number
    file_path:          string
    file_type:          string
    created_at:         Date
  }>(
    `INSERT INTO files (gitlab_project_id, file_path, file_type)
     VALUES ${placeholders}
     ON CONFLICT (gitlab_project_id, file_path)
     DO UPDATE SET file_type = EXCLUDED.file_type
     RETURNING id, gitlab_project_id, file_path, file_type, created_at`,
    values,
  )

  return result.rows.map((row) => ({
    id:              row.id,
    gitlabProjectId: row.gitlab_project_id,
    filePath:        row.file_path,
    fileType:        row.file_type,
    createdAt:       row.created_at,
  }))
}
```

**Bulk upsert with dynamic placeholders:**
Rather than one `INSERT` per file (N database round trips for N files), a single
`INSERT ... VALUES (row1), (row2), (row3) ...` sends all rows in one query. The
`placeholders` variable builds the `($1, $2, $3), ($1, $4, $5), ...` string
dynamically. This is a **bulk insert** — standard practice for syncing many records.

**`ON CONFLICT (gitlab_project_id, file_path)` — composite conflict target:**
The `UNIQUE (gitlab_project_id, file_path)` constraint from lesson 05 is referenced
here. When a file already exists (same project ID and path), `DO UPDATE SET file_type
= EXCLUDED.file_type` updates the file type if it changed (for example, the file was
renamed from `.stp` to `.step`).

**`inferFileType` — mapping extension to type:**

```typescript
function inferFileType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toUpperCase() ?? 'OTHER'
  const knownTypes: Record<string, string> = {
    STEP: 'STEP', STP: 'STEP', IGES: 'IGES', IGS: 'IGES',
    PDF:  'PDF',  DWG:  'DWG', DXF:  'DXF',
    PNG:  'IMAGE', JPG: 'IMAGE', JPEG: 'IMAGE', SVG: 'IMAGE',
  }
  return knownTypes[ext] ?? ext
}
```

---

## Step 2 — Domain Layer: Sync

### Update `src/domain/fileTree.ts`

```typescript
import { fetchProjectTree }  from '../data/gitlab.js'
import { upsertFiles }        from '../data/files.js'
import type { GitlabTreeItem } from '../data/gitlab.js'

export async function syncProjectTree(
  gitlabUrl:  string,
  token:      string,
  projectId:  number,
  path:       string = '',
): Promise<GitlabTreeItem[]> {
  const items = await fetchProjectTree(gitlabUrl, token, projectId, path)

  const filePaths = items
    .filter((item) => item.type === 'blob')
    .map((item) => item.path)

  if (filePaths.length > 0) {
    await upsertFiles(projectId, filePaths)
  }

  return items.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'tree' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}
```

**Only syncing blobs (files), not trees (folders):**
`filter((item) => item.type === 'blob')` — only files need records in the `files`
table. Folders have no metadata in Vault — they are a GitLab concept, not a Vault
concept. The `files` table does not have a `is_directory` column; directories are
implicitly represented by the path prefix in `file_path`.

**SE lens — GitLab as source of truth, PostgreSQL as metadata:**
After this lesson, two sources of truth coexist:
- **GitLab**: the actual file content, the actual file tree structure
- **PostgreSQL**: metadata about files — who has them checked out, what versions exist

The sync operation keeps PostgreSQL in sync with GitLab *for structure* (which files
exist). It never replicates file content — that always stays in GitLab. Each storage
system does what it does best: GitLab stores and versions binary content; PostgreSQL
stores and queries structured metadata.

---

## Step 3 — Update the API Route

Replace `getProjectTree` with `syncProjectTree` in the route:

```typescript
import { syncProjectTree } from '../domain/fileTree.js'

app.get('/api/projects/:projectId/tree', async (request, response) => {
  const projectId = Number(request.params.projectId)
  const path      = String(request.query.path ?? '')
  const { gitlabUrl, token } = request.query as { gitlabUrl: string; token: string }

  try {
    const items = await syncProjectTree(gitlabUrl, token, projectId, path)
    response.json(items)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tree'
    response.status(500).json({ error: message })
  }
})
```

The renderer (`FileTree.tsx`) is unchanged — it calls the same endpoint. The sync
now happens transparently on each tree level load.

---

## Step 4 — Tests

### Create `src/data/files.test.ts`

```typescript
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { upsertFiles } from './files.js'
import { query }       from './database.js'

beforeEach(async () => {
  await query('DELETE FROM files WHERE gitlab_project_id = $1', [99999])
})

afterEach(async () => {
  await query('DELETE FROM files WHERE gitlab_project_id = $1', [99999])
})

describe('upsertFiles', () => {
  test('inserts new files', async () => {
    const result = await upsertFiles(99999, ['designs/part-a.step'])
    expect(result).toHaveLength(1)
    expect(result[0].filePath).toBe('designs/part-a.step')
    expect(result[0].fileType).toBe('STEP')
  })

  test('updates file type on re-upsert', async () => {
    await upsertFiles(99999, ['drawings/plan.pdf'])
    const result = await upsertFiles(99999, ['drawings/plan.pdf'])
    expect(result).toHaveLength(1)
    expect(result[0].fileType).toBe('PDF')
  })

  test('returns empty array for empty input', async () => {
    const result = await upsertFiles(99999, [])
    expect(result).toHaveLength(0)
  })

  test('bulk inserts multiple files in one query', async () => {
    const result = await upsertFiles(99999, [
      'part-a.step', 'part-b.step', 'spec.pdf',
    ])
    expect(result).toHaveLength(3)
  })
})
```

**`beforeEach` and `afterEach` — test lifecycle hooks:**
`beforeEach` runs before each test. `afterEach` runs after each test. Here they
clean up test data from the database. Without cleanup, tests would affect each other:
a file created in test 1 would exist in test 2 and cause false positives or failures.

**Test project ID 99999:**
Using a project ID (`99999`) that does not exist in GitLab isolates test data. A
`DELETE WHERE gitlab_project_id = $1` with this ID only removes test rows, not
real data. This is a **test fixture** convention: use identifiers in a reserved
"test" range that never conflict with real data.

**Integration tests vs unit tests:**
These tests hit the real PostgreSQL database — they are **integration tests**, not
unit tests. Unit tests mock dependencies; integration tests test the real integration
between components (here, between the TypeScript function and the database). Both
are valuable. These tests run with `npm test` against the local development database.

Run `npm test`. All four tests pass.

---

## Connect the Pieces

After this lesson, the file tree is doubly sourced:

```
GitLab Trees API ──► fetchProjectTree → items
                                     ↓
                          filter blobs → upsertFiles → files table
                                     ↓
                             sorted items → renderer → TreeNode display
```

Lesson 14 queries `files` and `locks` together (a JOIN) to add lock status badges.
The `files` table is now populated; the JOIN can proceed.

---

## What Breaks Without This

**Without the sync step:**
The `files` table is empty. Lesson 16's `checkoutFile` function queries `files` to
get the file ID before creating a lock. With no record in `files`, checkout fails
with "file not found" even if the file exists in GitLab. The sync creates the
prerequisite for every subsequent operation.

**Without the `empty filePaths` guard:**
`upsertFiles(projectId, [])` with an empty array generates `INSERT INTO files ...
VALUES` with no values — invalid SQL. PostgreSQL returns a syntax error. The guard
`if (filePaths.length === 0) return []` prevents this. The same pattern is needed
for any bulk insert — always guard against the empty case.

---

## Definition of Done

- [ ] Expanding a folder in the file tree upserts its file paths into `files` (`psql -c "SELECT file_path FROM files"`)
- [ ] Expanding the same folder twice does not duplicate rows
- [ ] `upsertFiles` tests pass: `npm test`
- [ ] Files show their inferred type (STEP, PDF, etc.) — verify with psql
- [ ] You can explain the difference between a unit test and an integration test
- [ ] You can explain `beforeEach`/`afterEach` and why cleanup is required between tests
- [ ] You can explain why folders are not inserted into the `files` table
- [ ] You can explain the bulk insert pattern and why one INSERT for N rows is better than N INSERTs
- [ ] Run:
      ```
      git add src/data/ src/domain/ src/api/
      git commit -m "Sync file tree to database: bulk upsert on tree load, inferFileType, integration tests with cleanup fixtures"
      ```

---

*Next: Lesson 14 — Showing Lock Status on the Tree. A JOIN query combines the
`files` and `locks` tables. Each file in the tree shows an "Available" or "Checked
Out" badge with the holder's username.*
