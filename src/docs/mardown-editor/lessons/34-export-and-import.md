# Lesson 34 — Export and Import

## What You Will Build

The student can export their progress — completed chapters and all edited code blocks —
as a single JSON file. They can import this file on another machine to restore their
exact state. This is cross-machine sync without a cloud service. No login. No server.
The data belongs to the student and lives in a file they control.

---

## What You Need to Know First

- Lesson 10: `localStorage`, storage key design, the `ProgressStore` concept
- Lesson 20: chapter completion tracking, `electron-store`

---

## The Lesson

### Step 1 — The Export Format

The export file is a JSON document with a documented, versioned format. Define it in
`packages/core/src/exportFormat.ts`:

```typescript
export interface CodexExport {
  readonly format: 'codex-export-v1'
  readonly exportedAt: string   // ISO 8601 timestamp
  readonly progress: Record<string, boolean>  // chapterId → completed
  readonly edits: Record<string, string>      // storageKey → editedCode
}

export function isCodexExport(value: unknown): value is CodexExport {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    obj['format'] === 'codex-export-v1' &&
    typeof obj['exportedAt'] === 'string' &&
    typeof obj['progress'] === 'object' &&
    typeof obj['edits'] === 'object'
  )
}
```

**Why include `format: 'codex-export-v1'`?**
The format field is a version identifier. When the export format changes (e.g., adding
a new field in v2), the import code can check the format string and either:
- Migrate the old format to the new one
- Reject the file with a clear message: "This export was created with an older version of Codex"

Without a version identifier, a v2 import code reading a v1 file would silently
ignore missing fields, potentially importing corrupted state.

**`Record<string, boolean>` for progress:**
A `Record<string, boolean>` is a TypeScript type for an object where every key is a string
and every value is a boolean. It is equivalent to `{ [key: string]: boolean }`. The chapter
ID (derived from the chapter's file path) maps to `true` if the chapter is marked complete.
Only completed chapters are included; incomplete chapters are absent from the record.

### Step 2 — Collecting the Data

In `packages/renderer/src/exportImport.ts`:

```typescript
import type { CodexExport } from '@codex/core'

export function collectExportData(): CodexExport {
  const progress: Record<string, boolean> = {}
  const edits: Record<string, string> = {}

  // Read all keys from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key === null) continue

    const value = localStorage.getItem(key)
    if (value === null) continue

    if (key.startsWith('codex:progress:')) {
      const chapterId = key.slice('codex:progress:'.length)
      progress[chapterId] = value === 'true'
    } else if (key.startsWith('codex:edit:')) {
      edits[key.slice('codex:edit:'.length)] = value
    }
  }

  return {
    format: 'codex-export-v1',
    exportedAt: new Date().toISOString(),
    progress,
    edits,
  }
}
```

**Iterating `localStorage`:**
`localStorage` has no `entries()` or `values()` method — it is a key-value store with an
indexed key access API. The loop `for (let i = 0; i < localStorage.length; i++)` is the
standard technique for reading all keys. There is no namespace or directory structure —
we use key prefixes (`codex:progress:`, `codex:edit:`) as a naming convention.

### Step 3 — Triggering the Download

The student exports by clicking a button. The download happens entirely in the browser —
no server, no file system write from JavaScript:

```typescript
export function downloadExport(data: CodexExport): void {
  const json = JSON.stringify(data, null, 2)  // pretty-printed, 2-space indent
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `codex-export-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()

  // Revoke the object URL after a short delay (it's no longer needed)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
```

**`Blob` and `URL.createObjectURL` explained:**
`new Blob([content], { type: 'application/json' })` creates an in-memory binary object.
`URL.createObjectURL(blob)` returns a temporary URL (`blob:https://...`) that the browser
can download. Setting `anchor.download` tells the browser to download the file rather than
navigate to it, and sets the filename.

`URL.revokeObjectURL(url)` releases the memory. The `setTimeout` gives the download a
chance to start before the URL is revoked — revoking immediately would cancel the download.

**Why not use `fs.writeFile` from Electron?**
We could. But this approach works in both the browser (web shell) and Electron without
any branching. The browser download dialog appears in both environments. Keeping it
consistent simplifies the code.

### Step 4 — Importing: Parse, Validate, Merge

```typescript
import { isCodexExport } from '@codex/core'

export function importFromFile(file: File): Promise<{ imported: number; errors: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)

        if (!isCodexExport(parsed)) {
          resolve({ imported: 0, errors: ['Invalid export file format. Expected codex-export-v1.'] })
          return
        }

        const errors: string[] = []
        let imported = 0

        // Import progress
        for (const [chapterId, completed] of Object.entries(parsed.progress)) {
          try {
            localStorage.setItem(`codex:progress:${chapterId}`, String(completed))
            imported++
          } catch (e) {
            errors.push(`Could not import progress for ${chapterId}`)
          }
        }

        // Import edits (merge — do not overwrite existing edits)
        for (const [editKey, editValue] of Object.entries(parsed.edits)) {
          const fullKey = `codex:edit:${editKey}`
          if (localStorage.getItem(fullKey) === null) {
            // Only import if the student does not already have an edit for this block
            try {
              localStorage.setItem(fullKey, editValue)
              imported++
            } catch (e) {
              errors.push(`Could not import edit for ${editKey}`)
            }
          }
        }

        resolve({ imported, errors })
      } catch (e) {
        reject(new Error(`Could not parse export file: ${e instanceof Error ? e.message : String(e)}`))
      }
    }

    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsText(file)
  })
}
```

**Merge, not replace:**
The import merges data — existing localStorage entries are preserved. If the student has
already made edits on machine B, importing machine A's export does not overwrite them.
Only entries that do not exist on machine B are imported. This is the **last-write-wins**
problem — the merge policy chosen here (existing wins) is deliberately conservative.

**`FileReader` explained:**
`FileReader` is the browser API for reading the contents of a `File` object (which comes
from a file input). `.readAsText(file)` reads the file as a UTF-8 string; `.onload` fires
when reading is complete. This is an older callback-based API (predating Promises); we
wrap it in a Promise for consistent usage.

### Step 5 — The Export/Import UI

In `App.tsx` or a settings panel:

```typescript
function ExportImportPanel() {
  const [status, setStatus] = useState<string | null>(null)

  function handleExport() {
    const data = collectExportData()
    downloadExport(data)
    setStatus(`Exported ${Object.keys(data.progress).length} progress entries and ${Object.keys(data.edits).length} code edits.`)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file === undefined) return

    try {
      const { imported, errors } = await importFromFile(file)
      setStatus(`Imported ${imported} items.${errors.length > 0 ? ` Errors: ${errors.join(', ')}` : ''}`)
    } catch (err) {
      setStatus(`Import failed: ${err instanceof Error ? err.message : String(err)}`)
    }

    // Reset the file input so the same file can be re-imported if needed
    e.target.value = ''
  }

  return (
    <div>
      <button onClick={handleExport}>Export progress</button>
      <label>
        Import progress
        <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
      </label>
      {status !== null && <p>{status}</p>}
    </div>
  )
}
```

---

## Connect the Pieces

The export format is intentionally human-readable (pretty-printed JSON). A student can
open the file in a text editor, read their progress, and understand exactly what is stored.
This transparency is a design principle: **data portability means the data is yours, in a
format you can read**.

**Security: importing untrusted files**
The import function reads a user-selected JSON file and stores its contents into `localStorage`.
The `isCodexExport` validator (Step 2) ensures the file has the correct format before any
data is written — a file that does not pass validation is rejected entirely, not partially
applied. However, the validator does not inspect the *values* in `progress` or `edits` —
only their types. A malicious export file could contain code in the `edits` values. Those
edits are stored in `localStorage` and loaded into Monaco editors, where they sit as
editable text. They are not executed automatically on import or on chapter load. The student
must manually click Run for stored code to execute. The threat is social engineering, not
automatic execution: a crafted export could place harmful code into a code block that looks
benign. Never import export files from sources you do not trust.

For the Electron shell, the export could alternatively use `dialog.showSaveDialog` to let
the student choose the save location. This is a minor improvement — the browser download
dialog is already functional — and can be added as an enhancement.

The versioned export format with an explicit `format` field is the same pattern used by
every long-lived data format in production software. SQLite databases carry a schema
version number in the `user_version` pragma; applications that open the database compare
the version and run migrations if needed. VS Code's `settings.json` does not have a
version field — when the settings format changes, the app silently ignores unknown keys
and uses defaults for missing ones. Notion's export format uses a `version` field in
exported JSON so that future importers can detect and migrate old exports. The `codex-export-v1`
format follows this practice: the version is the first field checked, and a mismatch
produces a clear error rather than a silent corruption. That one design decision makes the
format maintainable indefinitely.

---

## What Breaks Without This

Without export/import, a student who uses Codex on both a home machine and a school laptop
has no way to synchronise their progress. Every lab starts from scratch on the second
machine. The export/import mechanism is the minimum viable cross-machine story — it requires
no cloud infrastructure, no accounts, and no ongoing cost.

---

## Definition of Done

- [ ] Clicking "Export" downloads a `codex-export-YYYY-MM-DD.json` file
- [ ] The JSON file contains `format: "codex-export-v1"`, `progress`, and `edits` keys
- [ ] Importing the JSON file on another machine (or after clearing storage) restores state
- [ ] Importing does not overwrite existing edits on the importing machine
- [ ] Importing a file with the wrong format shows a clear error message
- [ ] You can answer: what is `URL.createObjectURL` and when must you call `revokeObjectURL`?
- [ ] You can answer: why does the merge policy choose "existing wins"?
- [ ] `git commit` with a message explaining why
