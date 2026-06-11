# Lesson 20 — Chapter Completion Tracking

## What You Will Build

A "Mark complete" checkbox appears at the bottom of each chapter. Completed chapters show
a checkmark in the sidebar. The header shows a progress percentage: "3 / 12 complete."
Progress persists across sessions — marks survive closing and reopening the app — in both
the web shell (`localStorage`) and the Electron shell (`electron-store`).

---

## What You Need to Know First

- Lesson 10: `localStorage`, the storage key pattern, the `ProgressStore` concept
- Lesson 2: the `Chapter` and `Library` types
- Lesson 1: `contextBridge`, Electron's user data directory

---

## The Lesson

### Step 1 — The ProgressStore Interface

Two shells, two storage mechanisms, one interface. The adapter pattern.

In `packages/core/src/progressStore.ts`:

```typescript
export interface ProgressStore {
  markComplete(chapterId: string): void
  markIncomplete(chapterId: string): void
  isComplete(chapterId: string): boolean
  getAll(): ReadonlySet<string>
}
```

**CS lens:** An interface with no implementation details is a **contract**. The methods
describe behaviour — what each operation does — without specifying how. `markComplete`,
`markIncomplete`, `isComplete`, and `getAll` are a complete CRUD-like API for progress
data. Any storage backend that can perform these four operations satisfies the contract.

**SE lens:** The adapter pattern. The component calls `progressStore.markComplete(id)`.
It does not know whether that writes to `localStorage`, to a JSON file in the user's home
directory, or to a remote database. Adding a new storage backend is adding a new class
that implements `ProgressStore`. The component does not change.

This is the same principle as the `Executor` interface — strategy pattern applied to storage.

### Step 2 — The Chapter ID

The chapter ID is a stable, unique identifier for a chapter. It must not change when the
lesson content changes — only the file path determines identity.

```typescript
// In packages/core/src/hash.ts (already exists from Lesson 10)
export function makeChapterId(filePath: string): string {
  return fnv1a(filePath)
}
```

**Why not use the file path directly as the ID?**
The file path can be very long (`/Users/alice/Documents/courses/python-fundamentals/01-intro.md`).
Using it as a key in `localStorage` is correct but verbose. A hash is compact (7 characters
in base 36) and still stable. More importantly, in the web shell we use `virtual://filename`
paths — these already work as stable IDs, but the hash normalises them.

**Why not use the chapter title?**
Titles can change when the lesson author edits the heading. A chapter titled "Introduction"
that becomes "Introduction to Python" would appear as a new incomplete chapter. The file
path is stable as long as the file is not moved.

### Step 3 — The localStorage Implementation

In `packages/renderer/src/LocalStorageProgressStore.ts`:

```typescript
import type { ProgressStore } from '@codex/core'

const STORAGE_KEY = 'codex:progress'

export class LocalStorageProgressStore implements ProgressStore {
  private completedIds: Set<string>

  constructor() {
    this.completedIds = this.load()
  }

  markComplete(chapterId: string): void {
    this.completedIds.add(chapterId)
    this.persist()
  }

  markIncomplete(chapterId: string): void {
    this.completedIds.delete(chapterId)
    this.persist()
  }

  isComplete(chapterId: string): boolean {
    return this.completedIds.has(chapterId)
  }

  getAll(): ReadonlySet<string> {
    return this.completedIds
  }

  private load(): Set<string> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === null) return new Set()
      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed)) return new Set()
      return new Set(parsed.filter((item): item is string => typeof item === 'string'))
    } catch {
      return new Set()
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.completedIds]))
  }
}
```

**`Set` serialisation explained:**
`JSON.stringify(new Set(['a', 'b']))` produces `'{}'` — JSON does not know how to
serialise a `Set`. Spreading into an array `[...this.completedIds]` produces `['a', 'b']`,
which serialises correctly. On load, `new Set(parsed)` converts the array back to a `Set`.

**Defensive `try/catch` in `load`:**
`localStorage.getItem` can return a corrupted string (if the user manually edited the
storage). `JSON.parse` of a corrupted string throws. The `try/catch` returns an empty
Set in any failure case — the student starts fresh rather than seeing an error. This is
the correct choice for non-critical stored data: degrade gracefully.

**`.filter((item): item is string => ...)` explained:**
This is a TypeScript **type predicate**. `(item): item is string` tells TypeScript: if
this function returns `true`, the type of `item` is `string`. Without the predicate,
`Array.filter` returns `unknown[]`. With the predicate, it returns `string[]`. This is
required because `JSON.parse` returns `unknown`.

### Step 4 — The electron-store Implementation

`electron-store` writes data to a JSON file in the OS's app data directory:
- macOS: `~/Library/Application Support/Codex/config.json`
- Windows: `%APPDATA%\Codex\config.json`
- Linux: `~/.config/Codex/config.json`

**Why not `localStorage` in Electron?**
`localStorage` works in Electron, but its data is stored as part of the Chromium profile —
it can be cleared by "Clear browser data" operations. `electron-store` writes to a
file in the system's app data directory, which survives browser data clears. For progress
tracking, the more durable storage is correct.

Install `electron-store`:

```
$ npm install electron-store --workspace=apps/electron
```

In `apps/electron/src/progressStore.ts`:

```typescript
import Store from 'electron-store'
import type { ProgressStore } from '@codex/core'

interface StoreSchema {
  completedChapterIds: string[]
}

const store = new Store<StoreSchema>({
  defaults: { completedChapterIds: [] },
})

export class ElectronProgressStore implements ProgressStore {
  markComplete(chapterId: string): void {
    const current = new Set(store.get('completedChapterIds'))
    current.add(chapterId)
    store.set('completedChapterIds', [...current])
  }

  markIncomplete(chapterId: string): void {
    const current = new Set(store.get('completedChapterIds'))
    current.delete(chapterId)
    store.set('completedChapterIds', [...current])
  }

  isComplete(chapterId: string): boolean {
    return store.get('completedChapterIds').includes(chapterId)
  }

  getAll(): ReadonlySet<string> {
    return new Set(store.get('completedChapterIds'))
  }
}
```

**`electron-store` explained:**
`new Store<StoreSchema>({ defaults: ... })` creates a typed key/value store backed by a
JSON file. `store.get('completedChapterIds')` reads the array from disk. `store.set(key, value)`
writes it back. The `defaults` option provides initial values if the file does not yet exist.

The schema type `StoreSchema` is a TypeScript type that `electron-store` uses to validate
reads and writes. If you call `store.get('nonExistentKey')`, TypeScript gives a compile error.

**IPC for progress in Electron:**
The renderer cannot call `ElectronProgressStore` directly (no Node.js access). Expose it
via IPC in the preload script:

```typescript
markChapterComplete: (chapterId: string): void =>
  ipcRenderer.send('progress:markComplete', chapterId),
isChapterComplete: (chapterId: string): Promise<boolean> =>
  ipcRenderer.invoke('progress:isComplete', chapterId),
getAllCompleted: (): Promise<string[]> =>
  ipcRenderer.invoke('progress:getAll'),
```

Note `ipcRenderer.send` (fire-and-forget) vs `ipcRenderer.invoke` (request-response).
`markComplete` does not need to return a value — we fire and forget. `isComplete` and
`getAll` need the stored data — we use `invoke`.

### Step 5 — The CompletionBar Component

In `packages/renderer/src/CompletionBar.tsx`:

```typescript
import React from 'react'

interface CompletionBarProps {
  readonly chapterId: string
  readonly isComplete: boolean
  readonly onMarkComplete: () => void
  readonly onMarkIncomplete: () => void
}

export function CompletionBar({
  isComplete,
  onMarkComplete,
  onMarkIncomplete,
}: CompletionBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1.5rem 2rem',
        borderTop: '1px solid #1a1a3e',
        marginTop: '2rem',
      }}
    >
      <input
        type="checkbox"
        id="mark-complete"
        checked={isComplete}
        onChange={isComplete ? onMarkIncomplete : onMarkComplete}
        style={{ cursor: 'pointer', width: '1rem', height: '1rem' }}
      />
      <label htmlFor="mark-complete" style={{ cursor: 'pointer', color: '#aaa' }}>
        {isComplete ? 'Completed ✓' : 'Mark as complete'}
      </label>
    </div>
  )
}
```

**Checkbox as a controlled component:**
`checked={isComplete}` makes this a controlled input — React owns the checked state.
`onChange` fires when the user clicks. We do not toggle directly — we call the appropriate
callback (`onMarkComplete` or `onMarkIncomplete`) based on the current state. The parent
updates the store and passes the new `isComplete` value as a prop, which re-renders the
checkbox.

**`htmlFor` explained:**
`htmlFor` is the React equivalent of HTML's `for` attribute on `<label>`. It associates
the label with the input element via matching `id` values. When the user clicks the label
text, the associated checkbox toggles — a larger click target than the checkbox alone.

### Step 6 — Progress Percentage in the Sidebar Header

In `Sidebar.tsx`, add a progress display:

```typescript
interface SidebarProps {
  readonly chapters: Chapter[]
  readonly selectedChapter: Chapter | null
  readonly completedIds: ReadonlySet<string>
  readonly onSelectChapter: (chapter: Chapter) => void
  readonly onOpenFolder: () => void
}

// In the sidebar JSX, above the chapter list:
const completedCount = chapters.filter(ch =>
  completedIds.has(makeChapterId(ch.filePath))
).length

{chapters.length > 0 && (
  <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
    {completedCount} / {chapters.length} complete
  </div>
)}

// In each chapter button, add a checkmark:
{completedIds.has(makeChapterId(chapter.filePath)) && (
  <span style={{ marginLeft: 'auto', color: '#68d391' }}>✓</span>
)}
```

---

## Connect the Pieces

The `ProgressStore` interface and `makeChapterId` function are reused in Lesson 21's
search feature — completed chapters may be ranked higher in search results. They are
also the foundation for the export/import feature in the BRD's extended curriculum.

The `LocalStorageProgressStore` in this lesson and the `LocalStorageCodePersistence` from
Lesson 10 both write to `localStorage`. A future lesson could consolidate these into a
single storage facade — but only if consolidation reduces complexity, not just for the
sake of DRY.

---

## What Breaks Without This

If the `try/catch` in `LocalStorageProgressStore.load` is removed, a corrupted
`localStorage` value (e.g., the student manually typed `"invalid json"` in DevTools)
causes `JSON.parse` to throw, which propagates through the component tree as an unhandled
error, crashing the app. Progress tracking is not critical enough to crash the app —
the `try/catch` downgrades the failure to "start with no progress."

---

## Definition of Done

- [ ] Check "Mark as complete" on a chapter; the sidebar shows a checkmark
- [ ] Close and reopen the app; the checkmark is still there
- [ ] Uncheck the chapter; the checkmark disappears in the sidebar
- [ ] Progress percentage updates correctly as chapters are marked
- [ ] In the web shell: progress is in `localStorage`. Verify via DevTools → Application.
- [ ] In the Electron shell: progress is in `electron-store`. Find the JSON file at the
      path for your OS and verify it contains the completed chapter IDs.
- [ ] You can answer: what is the adapter pattern and why does it apply here?
- [ ] You can answer: why is `electron-store` more durable than `localStorage` in Electron?
- [ ] `git commit` with a message explaining why
