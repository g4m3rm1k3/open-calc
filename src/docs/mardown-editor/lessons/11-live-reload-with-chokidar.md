# Lesson 11 — Live Reload with chokidar

## What You Will Build

When a curriculum author edits a markdown file in their text editor, the Electron app
updates the rendered chapter within 200ms — no page reload, no clicking Refresh, no
restarting the app. Adding a new `.md` file to the folder adds it to the sidebar. Deleting
a file removes it. The author writes a lesson and sees it rendered immediately.

---

## What You Need to Know First

- Lesson 2: `parseLibrary`, the `Library` type, IPC handlers
- Lesson 3: `ChapterView`, `onReadContent`, `useEffect`
- Lesson 1: Electron IPC, `ipcMain`, event-driven programming

---

## The Lesson

### Step 1 — The Observer Pattern

The observer pattern is one of the most widely used patterns in software. It defines a
one-to-many dependency: when one object (the **subject**) changes state, all its
**observers** are notified automatically.

In this lesson:
- **Subject:** the file system — specifically, the files in the curriculum folder
- **Observer:** the Electron app — it wants to know when files change
- The mechanism: `chokidar` watches the file system and emits events

You have already used the observer pattern:
- `childProcess.stdout.on('data', callback)` — Lesson 6. The child process is the subject;
  your callback is the observer.
- `editor.onDidChangeModelContent(callback)` — Lesson 10. Monaco is the subject.
- `document.addEventListener('click', callback)` — the DOM element is the subject.

The pattern is always the same: register a callback, be called when the event occurs.

**CS lens:** The observer pattern decouples the subject from its observers. The file
system watcher does not know that an Electron app is observing it. It knows only that
something called `on('change', callback)`. If we later add a second observer — a build
tool that recompiles on change — we add a second `on('change', callback)`. The watcher
does not change.

**SE lens:** Without the observer pattern, the alternative is polling: checking every
100ms whether any file has changed. Polling wastes CPU and has latency proportional to
the polling interval. Event notification has near-zero CPU cost (the OS notifies on change)
and near-zero latency. This is a concrete example of where the right abstraction (events
vs polling) produces measurably better performance.

This pattern appears in production everywhere:
- React's state system — components subscribe to state changes
- Redux — `store.subscribe(listener)` for state change notifications
- Node.js EventEmitter — the base class for all Node.js event-emitting objects
- DOM EventTarget — `addEventListener`
- WebSockets — `socket.on('message', callback)`

### Step 2 — What chokidar Is

`chokidar` (Chokidar — from the Hindi word for "watchman") is a Node.js file system watcher.
It wraps Node.js's `fs.watch` and `fs.watchFile` with a consistent, reliable API.

**Why not use Node.js's built-in `fs.watch` directly?**

`fs.watch` is documented as "not consistent or reliable across platforms" in the Node.js
documentation itself. On macOS, `fs.watch` uses FSEvents (reliable). On Linux, it uses
inotify (reliable). On Windows, it uses ReadDirectoryChangesW (less reliable, misses some
events). `fs.watch` can emit events with `null` filenames, duplicate events, or miss events
entirely on some platforms.

`chokidar` handles these platform differences, deduplicates events, and provides:
- `add` — a file was created
- `change` — a file was modified
- `unlink` — a file was deleted
- `addDir` — a directory was created
- `unlinkDir` — a directory was deleted
- `error` — a watch error occurred

Install chokidar (in the `apps/electron` package, since it uses Node.js APIs):

```
$ npm install chokidar
```

### Step 3 — The File Watcher in the Main Process

In `apps/electron/src/watcher.ts`:

```typescript
import chokidar, { type FSWatcher } from 'chokidar'
import type { BrowserWindow } from 'electron'

let activeWatcher: FSWatcher | null = null

export function startWatching(
  folderPath: string,
  mainWindow: BrowserWindow
): void {
  if (activeWatcher !== null) {
    activeWatcher.close()
  }

  activeWatcher = chokidar.watch(folderPath, {
    ignored: /(^|[/\\])\../,
    persistent: true,
    ignoreInitial: true,
    depth: 1,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50,
    },
  })

  activeWatcher.on('change', (changedPath: string) => {
    if (changedPath.endsWith('.md')) {
      mainWindow.webContents.send('watcher:fileChanged', changedPath)
    }
  })

  activeWatcher.on('add', (addedPath: string) => {
    if (addedPath.endsWith('.md')) {
      mainWindow.webContents.send('watcher:libraryChanged', folderPath)
    }
  })

  activeWatcher.on('unlink', (removedPath: string) => {
    if (removedPath.endsWith('.md')) {
      mainWindow.webContents.send('watcher:libraryChanged', folderPath)
    }
  })

  activeWatcher.on('error', (error: Error) => {
    console.error('File watcher error:', error)
  })
}

export function stopWatching(): void {
  activeWatcher?.close()
  activeWatcher = null
}
```

**Every `chokidar.watch` option explained:**

- `ignored: /(^|[/\\])\../` — ignore files and directories starting with `.` (dotfiles like
  `.DS_Store`, `.git`). The regex `(^|[/\\])\.` matches a dot at the start of a name
  after a path separator. Without this, modifying `.DS_Store` would trigger a reload.

- `persistent: true` — the watcher keeps the Node.js event loop alive. Without this,
  the watcher would be garbage collected when nothing holds a reference to it.

- `ignoreInitial: true` — do not emit `add` events for files that already exist when the
  watcher starts. Without this, every file in the folder would trigger an `add` event at
  startup, causing the app to reload the library immediately.

- `depth: 1` — only watch one level deep. We only care about `.md` files in the root
  of the curriculum folder, not files in subdirectories.

- `awaitWriteFinish` — wait until a file write is complete before emitting `change`.
  Some editors write files in chunks (write partial content, then write the rest). Without
  `awaitWriteFinish`, the app would reload the chapter before the file is fully written,
  displaying partial content. `stabilityThreshold: 100` means the file must not change
  for 100ms before we consider the write finished.

**`mainWindow.webContents.send` explained:**
This is the **push IPC direction** — main process to renderer. The main process sends a
message to the renderer without the renderer requesting it. This is different from `ipcMain.handle`
(Lessons 2–6), where the renderer requests data and the main process responds.

`mainWindow.webContents.send('watcher:fileChanged', changedPath)` sends the channel name
`'watcher:fileChanged'` and the changed file path to the renderer. The renderer listens
with `ipcRenderer.on('watcher:fileChanged', callback)`.

**Why two events (`fileChanged` vs `libraryChanged`)?**
When a file's content changes, we only need to re-render that chapter — not re-read the
entire folder. When a file is added or deleted, the library (the list of chapters in the
sidebar) must be re-read. Distinguishing these events avoids unnecessary work.

**The `activeWatcher` module-level variable:**
Only one watcher should be active at a time. When the user opens a new folder, `startWatching`
closes the previous watcher before creating a new one. The module-level variable holds the
active watcher so `stopWatching` and subsequent `startWatching` calls can close it.

### Step 4 — Wiring the Watcher to the Folder Open

In `main.ts`, update the `dialog:openFolder` handler to start watching the selected folder:

```typescript
import { startWatching } from './watcher'

// The createWindow function needs to pass the window reference to the watcher
// Refactor: pass mainWindow to registerIpcHandlers

function registerIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle('dialog:openFolder', async (): Promise<string | null> => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })

    if (result.canceled) return null

    const folderPath = result.filePaths[0]
    startWatching(folderPath, mainWindow)
    return folderPath
  })

  // ... other handlers
}
```

### Step 5 — Listening to Watcher Events in the Renderer

In `preload.ts`, expose the `ipcRenderer.on` subscriptions:

```typescript
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('codexAPI', {
  // ... existing API ...

  onFileChanged: (callback: (filePath: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, filePath: string) => {
      callback(filePath)
    }
    ipcRenderer.on('watcher:fileChanged', handler)
    return () => ipcRenderer.removeListener('watcher:fileChanged', handler)
  },

  onLibraryChanged: (callback: (folderPath: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, folderPath: string) => {
      callback(folderPath)
    }
    ipcRenderer.on('watcher:libraryChanged', handler)
    return () => ipcRenderer.removeListener('watcher:libraryChanged', handler)
  },
})
```

**The cleanup function (returned value):**
Both `onFileChanged` and `onLibraryChanged` return a function that removes the listener.
This is critical: if you add a listener and never remove it, you have a **memory leak** —
the listener holds a reference to the callback, which holds a reference to React state or
the component, which should have been freed when the component unmounted.

In React, `useEffect` can return a cleanup function that runs when the component unmounts
or when the effect is about to re-run. Returning the unsubscribe function from `useEffect`
ensures the listener is removed at the right time.

### Step 6 — Subscribing in App

In `App.tsx`:

```typescript
useEffect(() => {
  const unsubscribeFileChanged = window.codexAPI.onFileChanged((filePath) => {
    if (selectedChapter?.filePath === filePath) {
      setChapterRefreshKey(prev => prev + 1)
    }
  })

  const unsubscribeLibraryChanged = window.codexAPI.onLibraryChanged(async (folderPath) => {
    const updatedLibrary = await window.codexAPI.loadLibrary(folderPath)
    setLibrary(updatedLibrary)
  })

  return () => {
    unsubscribeFileChanged()
    unsubscribeLibraryChanged()
  }
}, [selectedChapter?.filePath])
```

**`chapterRefreshKey` explained:**
When the currently displayed chapter's file changes, we want `ChapterView` to re-fetch and
re-render its content. But the `chapter` prop passed to `ChapterView` has not changed —
only the file's content on disk has. React does not know to re-run the `useEffect` in
`ChapterView`.

The pattern: add a `refreshKey` prop to `ChapterView`. When its value changes, `ChapterView`'s
`useEffect` re-runs (because `refreshKey` is in the dependency array). Changing a counter
is the React-idiomatic way to force a re-fetch without changing the underlying data.

```typescript
const [chapterRefreshKey, setChapterRefreshKey] = useState(0)

// Pass to ChapterView:
<ChapterView
  chapter={selectedChapter}
  refreshKey={chapterRefreshKey}
  onReadContent={window.codexAPI.readChapter}
/>
```

In `ChapterView`:
```typescript
interface ChapterViewProps {
  readonly chapter: Chapter
  readonly refreshKey: number
  readonly onReadContent: (filePath: string) => Promise<string>
}

// In useEffect dependency array:
useEffect(() => {
  // ... fetch content
}, [chapter.filePath, onReadContent, refreshKey])
```

---

## Connect the Pieces

`chokidar` is used in the main process because Node.js file system APIs are not available
in the renderer. The event path is:

```
chokidar (OS-level watch) → main process → IPC push → renderer → React state update → re-render
```

In Lesson 13, the web shell does not have `chokidar` — the browser cannot watch the file
system. Live reload in the web shell requires either polling (acceptable for development)
or a WebSocket connection to a development server. The Electron shell's live reload is
a higher-fidelity experience than the web shell can provide — and that is the correct trade-off.

---

## What Breaks Without This

Without the cleanup function returned from `useEffect`, a new `onFileChanged` listener is
added every time the `selectedChapter` changes. After clicking through 10 chapters, 10
listeners are active. Each file change triggers 10 callbacks — the last 9 check
`selectedChapter?.filePath === filePath` with the wrong chapter path and do nothing, but
they still run. After 100 chapters, memory and CPU waste is measurable. The listener leak
is invisible in testing (tests don't click through chapters) but compounds in real use.

---

## Definition of Done

- [ ] Edit a chapter's markdown file in a text editor; the Electron app updates in under 200ms
- [ ] Add a new `.md` file to the folder; it appears in the sidebar within 200ms
- [ ] Delete a `.md` file from the folder; it disappears from the sidebar within 200ms
- [ ] Open folder A, watch it update, then open folder B — only folder B triggers updates
- [ ] Open DevTools while watching; confirm no `watcher:fileChanged` events fire for `.DS_Store`
- [ ] You can answer: what is the observer pattern and where have you seen it in the last three lessons?
- [ ] You can answer: why does `awaitWriteFinish` matter for editors that write files incrementally?
- [ ] You can answer: what is a memory leak in the context of event listeners?
- [ ] `git commit` with a message explaining why
