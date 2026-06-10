# Vault PDM — Lesson 25 — File Type Conventions

## What You Will Build

A Settings screen with a "File Type Conventions" table. The admin can add rows:
extension (`.step`), category (`CAD`), and description. The file tree uses this
table to display icons and category labels. Adding `.fcstd` (FreeCAD) requires no
code change — only a database row. The configuration is stored in a
`file_type_conventions` table.

## What You Need to Know First

Lessons 01–24. The file tree uses `inferFileType` (lesson 13) which hardcodes file
type mapping. This lesson replaces that hardcoding with a database-driven configuration.

---

## The Problem

`inferFileType` in lesson 13 hardcodes file type mappings in a TypeScript object.
Adding a new file type requires:
1. Editing `src/data/files.ts`
2. Recompiling the application
3. Distributing a new version to all users

For a team using Vault with custom file types (`.vault_config`, `.machine_setup`),
this is unacceptable. Configuration belongs in data, not code.

---

## Step 1 — Configuration as Data

**Configuration as data — first appearance:**
**Configuration as data** means: the system's behaviour is driven by database records,
not by hardcoded values. Adding a new file type means adding a database row. No code
changes. No recompilation. No deployment.

This principle appears throughout production software:
- Feature flags (enable/disable features per user without deployment)
- Permission matrices (define what each role can do without code changes)
- Email templates (non-developers edit email content without touching code)
- File type conventions (this lesson)

The pattern: define a data model for the configuration, provide a UI to manage it,
read it in the application at runtime.

---

## Step 2 — Migration

### Create `migrations/003_file_type_conventions.sql`

```sql
CREATE TABLE IF NOT EXISTS file_type_conventions (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  extension   TEXT    NOT NULL UNIQUE,
  category    TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  icon_name   TEXT    NOT NULL DEFAULT 'document',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO file_type_conventions (extension, category, description, icon_name)
VALUES
  ('step', 'CAD',      'STEP 3D geometry',            'gear'),
  ('stp',  'CAD',      'STEP 3D geometry (alternate)', 'gear'),
  ('iges', 'CAD',      'IGES 3D geometry',             'gear'),
  ('igs',  'CAD',      'IGES 3D geometry (alternate)', 'gear'),
  ('dwg',  'Drawing',  'AutoCAD drawing',              'ruler'),
  ('dxf',  'Drawing',  'AutoCAD exchange format',      'ruler'),
  ('pdf',  'Document', 'PDF document',                 'document'),
  ('png',  'Image',    'PNG image',                    'image'),
  ('jpg',  'Image',    'JPEG image',                   'image'),
  ('svg',  'Image',    'SVG vector graphic',           'image')
ON CONFLICT (extension) DO NOTHING;
```

Run: `psql -U vault_user -d vault -f migrations/003_file_type_conventions.sql`

**Seed data — first appearance:**
The `INSERT ... ON CONFLICT DO NOTHING` after `CREATE TABLE` is **seed data** —
initial data populated on first run. The `ON CONFLICT DO NOTHING` ensures re-running
the migration does not fail or duplicate rows. Seed data is part of the migration file
for configurations that the application requires to function — default file types in
this case.

---

## Step 3 — Data Layer

### Create `src/data/fileTypeConventions.ts`

```typescript
import { query } from './database.js'

export interface FileTypeConvention {
  id:          string
  extension:   string
  category:    string
  description: string
  iconName:    string
}

let conventionsCache: Map<string, FileTypeConvention> | null = null

export async function getConventions(): Promise<Map<string, FileTypeConvention>> {
  if (conventionsCache !== null) return conventionsCache

  const result = await query<{
    id:          string
    extension:   string
    category:    string
    description: string
    icon_name:   string
  }>('SELECT id, extension, category, description, icon_name FROM file_type_conventions ORDER BY extension')

  conventionsCache = new Map(
    result.rows.map((row) => [
      row.extension.toLowerCase(),
      {
        id:          row.id,
        extension:   row.extension,
        category:    row.category,
        description: row.description,
        iconName:    row.icon_name,
      },
    ]),
  )

  return conventionsCache
}

export function invalidateConventionsCache(): void {
  conventionsCache = null
}

export async function upsertConvention(
  extension:   string,
  category:    string,
  description: string,
  iconName:    string,
): Promise<FileTypeConvention> {
  invalidateConventionsCache()

  const result = await query<{
    id: string; extension: string; category: string; description: string; icon_name: string
  }>(
    `INSERT INTO file_type_conventions (extension, category, description, icon_name)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (extension)
     DO UPDATE SET category = $2, description = $3, icon_name = $4
     RETURNING id, extension, category, description, icon_name`,
    [extension.toLowerCase(), category, description, iconName],
  )

  const row = result.rows[0]
  return { id: row.id, extension: row.extension, category: row.category,
           description: row.description, iconName: row.icon_name }
}
```

**Module-level cache:**
`conventionsCache` is a module-level variable — it persists across requests. The
first call loads from the database; subsequent calls return the cached `Map`. This
is **application-level caching**: avoid the database round trip for data that rarely
changes. `invalidateConventionsCache()` clears the cache when the admin updates a
convention — the next call reloads from the database.

**Why cache conventions:**
File type conventions are read on every file tree load and for every `inferFileType`
call. They are updated infrequently (perhaps once a year). A cache that costs one
database query amortised over thousands of reads is the correct trade-off.

---

## Step 4 — Replace `inferFileType` with Database Lookup

### Update `src/data/files.ts`

```typescript
import { getConventions } from './fileTypeConventions.js'

// Replace the hardcoded inferFileType function with:
async function getFileType(filePath: string): Promise<string> {
  const ext         = filePath.split('.').pop()?.toLowerCase() ?? ''
  const conventions = await getConventions()
  return conventions.get(ext)?.category ?? ext.toUpperCase()
}
```

Update `upsertFiles` to use the async version:

```typescript
const fileTypes = await Promise.all(filePaths.map(getFileType))
```

**`Promise.all` — first appearance:**
`Promise.all(arrayOfPromises)` runs all Promises concurrently and returns a Promise
that resolves when all of them resolve. `await Promise.all([...])` is equivalent to
running all operations in parallel and waiting for all to finish.

Compare:
```typescript
// Sequential (slow — each awaits before starting the next):
for (const path of filePaths) {
  const type = await getFileType(path)
}

// Parallel (fast — all start simultaneously):
const types = await Promise.all(filePaths.map(getFileType))
```

For `getFileType`, the cache means all calls hit the in-memory `Map` after the first
one — the parallel vs sequential distinction only matters for the first call per cache
miss.

---

## Step 5 — Settings Screen

### Create `src/renderer/SettingsScreen.tsx`

```typescript
import { useState } from 'react'
import { useAsyncState } from './hooks/useAsyncState.js'
import { AsyncView }     from './components/AsyncView.js'
import type { FileTypeConvention } from '../../data/fileTypeConventions.js'
import './SettingsScreen.css'

export function SettingsScreen() {
  const [newExt,  setNewExt]  = useState('')
  const [newCat,  setNewCat]  = useState('')
  const [newDesc, setNewDesc] = useState('')

  async function fetchConventions(): Promise<FileTypeConvention[]> {
    const response = await fetch('http://localhost:3001/api/settings/conventions')
    if (!response.ok) throw new Error('Failed to load conventions')
    return response.json()
  }

  const { state, trigger } = useAsyncState(fetchConventions)

  async function handleAdd(): Promise<void> {
    await fetch('http://localhost:3001/api/settings/conventions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ extension: newExt, category: newCat, description: newDesc }),
    })
    setNewExt('')
    setNewCat('')
    setNewDesc('')
    trigger()
  }

  return (
    <div className="settings-screen">
      <h2>File Type Conventions</h2>
      <AsyncView state={state} onRetry={trigger}>
        {(conventions) => (
          <table className="conventions-table">
            <thead>
              <tr><th>Extension</th><th>Category</th><th>Description</th></tr>
            </thead>
            <tbody>
              {conventions.map((c) => (
                <tr key={c.id}>
                  <td><code>.{c.extension}</code></td>
                  <td>{c.category}</td>
                  <td>{c.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AsyncView>

      <h3>Add Convention</h3>
      <div className="add-convention-form">
        <input value={newExt}  onChange={(e) => setNewExt(e.target.value)}
               placeholder="extension (e.g. fcstd)" className="field-input" />
        <input value={newCat}  onChange={(e) => setNewCat(e.target.value)}
               placeholder="category (e.g. CAD)" className="field-input" />
        <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
               placeholder="description" className="field-input" />
        <button className="action-btn" onClick={handleAdd}
                disabled={!newExt || !newCat}>
          Add
        </button>
      </div>
    </div>
  )
}
```

**`<table>` — first appearance:**
HTML `<table>` renders tabular data: rows (`<tr>`), header cells (`<th>`), data cells
(`<td>`). `<thead>` groups header rows; `<tbody>` groups data rows. Tables are
semantically correct for data with rows and columns — the file type convention list
fits. Do not use tables for page layout (a pre-CSS practice) — use flexbox or grid.

---

## Connect the Pieces

After this lesson, file types flow from configuration to display:

```
file_type_conventions table (database)
  ──► getConventions() → Map<extension, convention>
  ──► getFileType(filePath) → category string
  ──► upsertFiles uses category from DB
  ──► FileIcon and filter panels use category from the convention
```

Adding `.fcstd` (FreeCAD) requires one row in `file_type_conventions` — no code
change, no recompilation, no new deployment. This is the payoff of configuration
as data.

---

## Definition of Done

- [ ] `psql -c "SELECT * FROM file_type_conventions"` shows the seeded rows
- [ ] Adding a new extension in the settings screen appears in the table immediately
- [ ] File tree uses the category from the database (not the hardcoded `inferFileType`)
- [ ] Adding `.fcstd` in the settings screen gives FreeCAD files the correct category
- [ ] You can explain configuration as data and give three examples from production software
- [ ] You can explain module-level caching and `invalidateConventionsCache` — when to clear a cache
- [ ] You can explain `Promise.all` and the difference between parallel and sequential async calls
- [ ] Run:
      ```
      git add migrations/ src/data/ src/domain/ src/api/ src/renderer/
      git commit -m "Add file type conventions: DB-driven config, module cache, settings screen with table, replaces hardcoded inferFileType"
      ```

---

*Next: Lesson 26 — Daily WIP Backup Schedule. A background cron job runs at midnight
and saves a WIP snapshot for every currently checked-out file.*
