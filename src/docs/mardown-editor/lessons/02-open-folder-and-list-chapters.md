# Lesson 2 — Open a Folder and List Chapters

## What You Will Build

By the end of this lesson the Electron window has a sidebar. When the student clicks an
"Open Folder" button, a native file picker dialog opens. After selecting a folder, the
sidebar fills with the names of every `.md` file in that folder, sorted by filename. The
main content area shows a placeholder message: "Select a chapter to begin." Nothing is
rendered yet — just the list. That is the vertical slice: the content model exists, the
file system is read, and the result is visible.

---

## What You Need to Know First

- Lesson 1: the monorepo scaffold, TypeScript, npm, Electron's main/renderer split,
  `contextBridge`

---

## The Lesson

### Step 1 — The Content Model

Before reading any files, decide what a "chapter" is in code. This decision shapes
everything else.

A chapter has:
- A file path (where it lives on disk)
- A title (the first `# Heading` in the file, or the filename without extension)
- An order (so chapters can be sorted)

In `packages/core/src/types.ts`:

```typescript
export interface Chapter {
  readonly filePath: string
  readonly title: string
  readonly order: number
}

export interface Library {
  readonly rootPath: string
  readonly chapters: readonly Chapter[]
}
```

**CS lens:** An `interface` in TypeScript is a structural type — it describes the shape of
an object. Any object that has `filePath: string`, `title: string`, and `order: number`
satisfies the `Chapter` interface, regardless of how it was created. This is called
**duck typing**: if it has the right shape, it is the right type.

**SE lens:** `readonly` on every field is intentional. The content model is derived from
the file system — it is not state that should be mutated in place. If the file system
changes, a new `Library` object is created. Immutability eliminates a class of bug where
a component modifies shared state and causes unexpected re-renders elsewhere.

**Walkthrough:** `readonly filePath: string` tells TypeScript: this property exists, its
type is `string`, and no code may reassign it after creation. Attempting `chapter.filePath = '/new/path'`
would be a compile error: `Cannot assign to 'filePath' because it is a read-only property`.

**Data type as a decision:** We could have stored chapters as `string[]` (just file paths).
But then every component that needs the title would have to parse the file again. By
storing title alongside path at parse time, we parse once and read many times.

### Step 2 — Reading the File System

In `packages/core/src/parseLibrary.ts`:

```typescript
import { readdir, readFile } from 'fs/promises'
import { join, basename, extname } from 'path'
import type { Chapter, Library } from './types'

export async function parseLibrary(rootPath: string): Promise<Library> {
  const allEntries = await readdir(rootPath, { withFileTypes: true })

  const markdownFiles = allEntries
    .filter(entry => entry.isFile() && extname(entry.name) === '.md')
    .sort((a, b) => a.name.localeCompare(b.name))

  const chapters: Chapter[] = await Promise.all(
    markdownFiles.map(async (entry, index) => {
      const filePath = join(rootPath, entry.name)
      const content = await readFile(filePath, 'utf-8')
      const title = extractTitle(content) ?? basename(entry.name, '.md')

      return {
        filePath,
        title,
        order: index,
      }
    })
  )

  return { rootPath, chapters }
}

function extractTitle(content: string): string | null {
  const firstLine = content.split('\n')[0]
  if (firstLine.startsWith('# ')) {
    return firstLine.slice(2).trim()
  }
  return null
}
```

**Every import explained:**

`import { readdir, readFile } from 'fs/promises'`
— `fs` is Node.js's built-in file system module. `fs/promises` is its promise-based API
(as opposed to the callback-based `fs` API). We import `readdir` (read a directory's
contents) and `readFile` (read a file's contents as text). We do not import the whole
`fs` module because we only need these two functions — importing only what you need makes
the dependency explicit.

`import { join, basename, extname } from 'path'`
— `path` is Node.js's built-in path manipulation module. `join` combines path segments
using the OS separator. `basename('/a/b/file.md', '.md')` returns `'file'` (the filename
without extension). `extname('file.md')` returns `'.md'` (the extension including the dot).

`import type { Chapter, Library } from './types'`
— `import type` imports only the TypeScript type definitions, not any runtime code.
This is an optimisation: the compiled JavaScript file contains no trace of this import
because types exist only at compile time.

**CS lens:** `Promise.all` takes an array of Promises and returns a single Promise that
resolves when all of them resolve. If any Promise rejects, `Promise.all` immediately
rejects. We use it here to read all markdown files in parallel — if there are 20 chapters,
we start 20 file reads simultaneously rather than reading one, waiting, reading the next,
waiting, and so on. On a modern SSD this is measurably faster.

**SE lens:** `parseLibrary` has one job: given a path, return a Library. It does not
render anything. It does not cache anything. It does not know about React or Electron.
This is the single responsibility principle. If we later want to add caching, we wrap
`parseLibrary` in a caching layer — we do not modify `parseLibrary`.

**Walkthrough:**
1. `readdir(rootPath, { withFileTypes: true })` reads the directory and returns an array
   of `Dirent` objects. Each `Dirent` has the entry's name and methods like `isFile()` and
   `isDirectory()`. `{ withFileTypes: true }` is required to get `Dirent` objects — without
   it, `readdir` returns plain strings (just the filenames, without the type information).
2. We filter to files whose extension is `.md`. `entry.isFile()` rejects directories and
   symlinks. `extname(entry.name) === '.md'` rejects files like `README.txt`.
3. We sort alphabetically. `localeCompare` handles filenames with accents and special
   characters correctly, unlike a simple `<` comparison.
4. For each file, we read its content and extract the first `# Heading` as the title.
   If the file has no `# Heading`, we use the filename without extension.
5. We return a `Library` object with the root path and the sorted chapters.

**`async/await` explained (first appearance):**
`async` before a function declaration means the function always returns a Promise.
`await` inside an async function pauses execution until the Promise resolves, then
returns the resolved value. Without `async/await`, reading 20 files would require 20
nested callbacks — deeply nested code that is hard to read and reason about.

`await readFile(filePath, 'utf-8')` pauses `parseLibrary` until the file is read.
The `'utf-8'` argument tells `readFile` to decode the file's bytes as UTF-8 text and
return a `string`. Without it, `readFile` returns a `Buffer` (raw bytes).

**What breaks if `{ withFileTypes: true }` is omitted:**
`readdir` returns `string[]` — just names. `entry.isFile()` would throw `TypeError:
entry.isFile is not a function` because strings do not have that method.

Update `packages/core/src/index.ts` to export the new code:

```typescript
export { parseLibrary } from './parseLibrary'
export type { Chapter, Library } from './types'
export const CODEX_VERSION = '1.0.0'
```

### Step 3 — Exposing File System Access via the Preload Script

The renderer cannot call `parseLibrary` directly — it cannot access Node.js APIs.
We expose it through the preload script's `contextBridge`.

In `apps/electron/src/preload.ts`:

```typescript
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('codexAPI', {
  openFolder: (): Promise<string | null> =>
    ipcRenderer.invoke('dialog:openFolder'),

  loadLibrary: (folderPath: string): Promise<unknown> =>
    ipcRenderer.invoke('library:load', folderPath),
})
```

**IPC explained (first appearance):**
IPC stands for Inter-Process Communication — the mechanism by which two separate processes
exchange messages. Electron has a built-in IPC system: `ipcMain` (in the main process) and
`ipcRenderer` (in the renderer process).

`ipcRenderer.invoke('dialog:openFolder')` sends a message named `'dialog:openFolder'` to
the main process and returns a Promise that resolves when the main process replies.
`ipcMain.handle('dialog:openFolder', ...)` in the main process registers a handler for
that message.

The channel name `'dialog:openFolder'` is a string we chose — it is a convention, not
a keyword. Using a `namespace:action` format (`dialog:`, `library:`, `execution:`) makes
the channel's purpose clear at a glance.

**SE lens:** The preload script defines the exact API surface the renderer has access to.
It is narrow by design: one function to open a dialog, one to load a library. The renderer
cannot call `readFile` directly, cannot access the OS dialog API directly, cannot spawn
processes. It can only do exactly what the preload script exposes. This is the principle
of least privilege: give each part of the system only the capabilities it needs.

### Step 4 — IPC Handlers in the Main Process

In `apps/electron/src/main.ts`, add handlers:

```typescript
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { parseLibrary } from '@codex/core'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  registerIpcHandlers()
}

function registerIpcHandlers(): void {
  ipcMain.handle('dialog:openFolder', async (): Promise<string | null> => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })

    if (result.canceled) {
      return null
    }

    return result.filePaths[0]
  })

  ipcMain.handle('library:load', async (_event, folderPath: string) => {
    return parseLibrary(folderPath)
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

**CS lens:** `dialog.showOpenDialog` is an **asynchronous** OS call. Opening a file dialog
is a system operation — it pauses until the user makes a choice. `await` pauses the handler
function until the dialog closes. The dialog returns a `result` object with two fields:
`canceled` (whether the user dismissed without selecting) and `filePaths` (the selected paths).

**`dialog.showOpenDialog` explained:**
`properties: ['openDirectory']` limits the picker to directories only (not files). Without
this, the user could select any file, not just a folder.
`result.canceled` is `true` if the user pressed Cancel or closed the dialog. In that case
we return `null` — no folder was chosen.
`result.filePaths[0]` is the selected folder path. Even when selecting a single directory,
Electron returns an array (because multiple selection is possible with different properties).

**`_event` explained:**
The first argument to an `ipcMain.handle` callback is the IPC event object. We do not need
it here, so we name it `_event` — the underscore prefix is a TypeScript/JavaScript
convention meaning "this parameter is intentionally unused." Without the underscore,
some linters would warn about an unused variable.

**Walkthrough of the full IPC round trip:**
1. Renderer: user clicks "Open Folder"
2. Renderer: `window.codexAPI.openFolder()` is called
3. Preload: `ipcRenderer.invoke('dialog:openFolder')` sends a message to the main process
4. Main: `ipcMain.handle('dialog:openFolder', ...)` receives the message, shows the dialog
5. User selects a folder
6. Main: handler returns the folder path
7. Preload/IPC: the path travels back to the renderer as the resolved Promise value
8. Renderer: the `.then()` or `await` receives the folder path

### Step 5 — The Sidebar Component

In `packages/renderer/src/Sidebar.tsx`:

```typescript
import React from 'react'
import type { Chapter } from '@codex/core'

interface SidebarProps {
  readonly chapters: Chapter[]
  readonly selectedChapter: Chapter | null
  readonly onSelectChapter: (chapter: Chapter) => void
  readonly onOpenFolder: () => void
}

export function Sidebar({
  chapters,
  selectedChapter,
  onSelectChapter,
  onOpenFolder,
}: SidebarProps) {
  return (
    <nav
      style={{
        width: '260px',
        minHeight: '100vh',
        background: '#16213e',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <button
        onClick={onOpenFolder}
        style={{
          padding: '0.5rem 1rem',
          background: '#0f3460',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '1rem',
        }}
      >
        Open Folder
      </button>

      {chapters.length === 0 && (
        <p style={{ color: '#888', fontSize: '0.875rem' }}>
          No chapters found. Open a folder containing .md files.
        </p>
      )}

      {chapters.map(chapter => (
        <button
          key={chapter.filePath}
          onClick={() => onSelectChapter(chapter)}
          style={{
            padding: '0.5rem',
            background: selectedChapter?.filePath === chapter.filePath
              ? '#0f3460'
              : 'transparent',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          {chapter.title}
        </button>
      ))}
    </nav>
  )
}
```

**CS lens:** Each `chapter.filePath` is used as the `key` prop. React uses `key` to identify
which list items have changed, been added, or been removed between renders. The key must be
stable (not an array index — indexes change when items are reordered) and unique within the
list. The file path satisfies both: it does not change, and no two chapters share a path.

**What breaks if `key` is missing:** React logs a warning: `Each child in a list should have
a unique "key" prop`. More importantly, React's reconciliation algorithm (the process of
figuring out what changed between renders) cannot work correctly without keys. With an
array index as the key, deleting the first chapter causes every subsequent chapter's key to
change — React re-renders all of them instead of just removing one.

**SE lens:** `Sidebar` accepts data and callback functions as props. It owns no state.
This is the **presentational component** pattern: the component is responsible for
rendering a given set of data, not for fetching or managing it. `onOpenFolder` and
`onSelectChapter` are passed in from the parent. The sidebar does not know how folders
are opened or what happens when a chapter is selected — it only fires the callbacks.
This makes `Sidebar` independently testable: you can render it with any data and any
callbacks in a test.

**Optional chaining explained (first appearance):**
`selectedChapter?.filePath` uses the `?.` optional chaining operator. If `selectedChapter`
is `null`, the expression evaluates to `undefined` instead of throwing `TypeError: Cannot
read properties of null`. Without optional chaining, you would write
`selectedChapter !== null ? selectedChapter.filePath : undefined`.

### Step 6 — Connecting It All in App

In `packages/renderer/src/App.tsx`:

```typescript
import React, { useState, useCallback } from 'react'
import { Sidebar } from './Sidebar'
import type { Chapter, Library } from '@codex/core'

declare global {
  interface Window {
    codexAPI: {
      openFolder: () => Promise<string | null>
      loadLibrary: (path: string) => Promise<Library>
    }
  }
}

export function App() {
  const [library, setLibrary] = useState<Library | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)

  const handleOpenFolder = useCallback(async () => {
    const folderPath = await window.codexAPI.openFolder()
    if (folderPath === null) return

    const loadedLibrary = await window.codexAPI.loadLibrary(folderPath)
    setLibrary(loadedLibrary)
    setSelectedChapter(null)
  }, [])

  const chapters = library?.chapters ?? []

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        chapters={chapters}
        selectedChapter={selectedChapter}
        onSelectChapter={setSelectedChapter}
        onOpenFolder={handleOpenFolder}
      />

      <main style={{ flex: 1, padding: '2rem', color: 'white' }}>
        {selectedChapter === null ? (
          <p style={{ color: '#888' }}>Select a chapter to begin.</p>
        ) : (
          <p>Chapter: {selectedChapter.title}</p>
        )}
      </main>
    </div>
  )
}
```

**`useState` explained (first appearance):**
`useState` is a React Hook — a function that adds state to a function component.
`useState<Library | null>(null)` declares a piece of state with initial value `null`.
It returns two things: the current value (`library`) and a function to update it
(`setLibrary`). When `setLibrary` is called with a new value, React re-renders the
component with the new value.

State lives inside the component. It persists between renders (unlike local variables
inside the function body, which are re-created on every render). It is not global —
each component instance has its own copy.

**`useCallback` explained (first appearance):**
`useCallback` memoizes a function — it returns the same function reference between
renders unless its dependencies change. `useCallback(async () => { ... }, [])` with an
empty dependency array `[]` means: create this function once and reuse it on every render.

Without `useCallback`, a new `handleOpenFolder` function would be created on every render.
This matters when the function is passed as a prop: if the prop changes (even if the
function does the same thing), the child component re-renders. `useCallback` prevents
unnecessary child re-renders.

**`declare global` explained:**
The preload script places `codexAPI` on `window`, but TypeScript does not know about it.
`declare global { interface Window { codexAPI: ... } }` tells TypeScript that `window.codexAPI`
exists and describes its shape. This is a **type declaration** — it adds a type without
adding any runtime code. If you call `window.codexAPI.openFolder()` and the preload script
did not expose it, TypeScript would have accepted it but the call would fail at runtime.
The declaration is a promise you are making to TypeScript that you will fulfil in the preload.

**Walkthrough of a folder open:**
1. User clicks "Open Folder" → `Sidebar` calls `onOpenFolder`
2. `App.handleOpenFolder` runs
3. `window.codexAPI.openFolder()` triggers the IPC chain → native file dialog appears
4. User selects a folder → `folderPath` is the selected path string
5. `window.codexAPI.loadLibrary(folderPath)` triggers IPC → `parseLibrary` runs in main
6. The returned `Library` is stored in `setLibrary(loadedLibrary)`
7. React re-renders `App` with the new `library` value
8. `library?.chapters` is the chapter list; it is passed to `Sidebar` as `chapters`
9. `Sidebar` renders a button for each chapter

---

## Connect the Pieces

`parseLibrary` in `@codex/core` is the only code in the entire system that reads the file
system to build the chapter list. The IPC handlers in `apps/electron` are the only code
that calls it from the renderer's world. `Sidebar` is the only component that renders the
chapter list. Each piece has one job.

In Lesson 3, the `selectedChapter` state in `App` will be used to load and render the
chapter's markdown content. The infrastructure is already here — we just need to add rendering.

---

## What Breaks Without This

If you remove `return null` from the dialog handler when `result.canceled` is `true`, the
preload script receives `undefined`. The renderer calls `window.codexAPI.loadLibrary(undefined)`,
which calls `parseLibrary(undefined)`, which calls `readdir(undefined)` — Node.js throws
`TypeError: The "path" argument must be of type string`. The error message is correct but
it does not tell you the real cause (the user cancelled the dialog). The explicit `null`
return and `if (folderPath === null) return` guard makes the intent clear and prevents
the error entirely.

---

## Definition of Done

- [ ] Clicking "Open Folder" opens a native directory picker
- [ ] After selecting a folder, the sidebar shows the `.md` filenames sorted alphabetically
- [ ] Selecting a folder with no `.md` files shows "No chapters found"
- [ ] Clicking a chapter highlights it in the sidebar and shows its title in the main area
- [ ] Cancelling the dialog (pressing Escape or Cancel) does not crash or clear the sidebar
- [ ] You can answer: what is IPC and why can the renderer not call `readdir` directly?
- [ ] You can answer: what does `useState` return and what triggers a re-render?
- [ ] `git commit` with a message explaining why this commit exists
