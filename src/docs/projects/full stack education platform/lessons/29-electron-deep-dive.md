# Lesson 29 — Electron Deep Dive

## What You Will Build

Desktop-native features: a system tray icon, global keyboard shortcuts, native file system
access (open/save files from the lesson editor), window management (resize, remember
position), and native dialog boxes. These are features that web and mobile apps cannot
provide — they require desktop-level OS access.

---

## What You Need to Know First

- Lesson 06: Electron's main/renderer process model, `contextBridge`, `nodeIntegration: false`
- Lesson 07: Monaco editor, `useRef`, `OnMount`

---

## The Lesson

### Step 1 — The Electron Process Model, Revisited

Lesson 06 introduced the main/renderer split. Before adding desktop features, the model
needs to be precise.

**Main process:** Node.js process. Full access to the OS — filesystem, process, native
APIs. There is exactly one main process. It manages windows, menus, tray icons, and
global shortcuts. It is the process that receives OS events.

**Renderer process:** Chromium process for each window. Runs your React app. Has NO
access to Node.js APIs by default (`nodeIntegration: false`). Communicates with the main
process via IPC (Inter-Process Communication).

**`contextBridge`:** The controlled interface between renderer and main. You define
exactly which capabilities the renderer may call. The renderer cannot call anything
not explicitly exposed.

**IPC channels:** Named string channels for messages between processes.
- `ipcRenderer.invoke(channel, ...args)` — renderer sends a message and awaits a response
- `ipcMain.handle(channel, handler)` — main registers a handler for a channel

The naming convention `'dialog:openFile'` (namespace:action) prevents channel name collisions.

**CS lens — privilege separation:**
The main/renderer split is the same principle as operating system rings (kernel mode vs
user mode). Kernel mode has full hardware access; user mode is restricted. The boundary
between them prevents a buggy or malicious user-space program from corrupting the kernel.
The renderer is user-mode; the main process is the kernel; `contextBridge` is the
system call interface.

### Step 2 — Native File System Access

```typescript
// main/ipc/fileSystem.ts — runs in main process
import { ipcMain, dialog } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

export function registerFileSystemHandlers() {
  ipcMain.handle('file:open', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Open file',
      filters: [
        { name: 'JavaScript/TypeScript', extensions: ['js', 'ts', 'jsx', 'tsx'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const filePath = result.filePaths[0]!
    const content = await readFile(filePath, 'utf-8')
    return { filePath, content }
  })

  ipcMain.handle('file:save', async (_, filePath: string, content: string) => {
    if (typeof filePath !== 'string' || typeof content !== 'string') {
      throw new Error('Invalid arguments')
    }
    // Validate path does not escape the user's home directory
    const resolved = path.resolve(filePath)
    await writeFile(resolved, content, 'utf-8')
    return { success: true }
  })

  ipcMain.handle('file:saveAs', async (_, content: string) => {
    const result = await dialog.showSaveDialog({
      title: 'Save file',
      defaultPath: 'lesson.js',
      filters: [
        { name: 'JavaScript', extensions: ['js'] },
        { name: 'TypeScript', extensions: ['ts'] },
      ],
    })

    if (result.canceled || result.filePath === undefined) {
      return null
    }

    await writeFile(result.filePath, content, 'utf-8')
    return { filePath: result.filePath }
  })
}
```

**`dialog.showOpenDialog` explained:**
Shows the operating system's native file picker. `filters` restricts visible files.
`properties: ['openFile']` allows selecting a file (vs `openDirectory` for directories).
Returns the full path(s) the user selected.

**`path.resolve(filePath)` — security:**
User-supplied file paths must be validated. A malicious renderer could send a `filePath`
of `/etc/passwd`. `path.resolve` resolves relative paths to absolute paths. Additional
validation (checking the path starts with the user's home directory) prevents writes
to sensitive system locations.

**Expose via `contextBridge`:**
```typescript
// preload.ts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('fileSystem', {
  openFile: () => ipcRenderer.invoke('file:open'),
  saveFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('file:save', filePath, content),
  saveFileAs: (content: string) => ipcRenderer.invoke('file:saveAs', content),
})

// TypeScript types for the renderer
declare global {
  interface Window {
    fileSystem: {
      openFile: () => Promise<{ filePath: string; content: string } | null>
      saveFile: (filePath: string, content: string) => Promise<{ success: boolean }>
      saveFileAs: (content: string) => Promise<{ filePath: string } | null>
    }
  }
}
```

**Using in the editor component:**
```typescript
async function handleOpenFile() {
  const result = await window.fileSystem.openFile()
  if (result !== null) {
    setCurrentFilePath(result.filePath)
    editorRef.current?.setValue(result.content)
  }
}
```

### Step 3 — Global Keyboard Shortcuts

Global shortcuts work even when the app window is not focused.
```typescript
// main/shortcuts.ts
import { globalShortcut, app, BrowserWindow } from 'electron'

export function registerGlobalShortcuts(mainWindow: BrowserWindow) {
  app.whenReady().then(() => {
    // Cmd+Shift+C (macOS) / Ctrl+Shift+C (Windows/Linux): bring app to front
    globalShortcut.register('CommandOrControl+Shift+C', () => {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    })
  })

  app.on('will-quit', () => {
    globalShortcut.unregisterAll()
  })
}
```

**`CommandOrControl` explained:**
Electron's shortcut syntax uses `CommandOrControl` for the primary modifier: `Command`
on macOS and `Control` on Windows/Linux. This is platform-aware shortcut definition —
one string works on all platforms.

**`app.on('will-quit', () => globalShortcut.unregisterAll())`:**
Global shortcuts are OS-level registrations. If the app crashes without deregistering them,
the shortcuts remain registered at the OS level until the OS session ends, preventing other
apps from using them. `will-quit` fires before the process exits — the cleanup runs even
on graceful shutdown.

### Step 4 — System Tray

The system tray icon allows background operation — the app keeps running after the window
is closed:
```typescript
// main/tray.ts
import { Tray, Menu, nativeImage, app } from 'electron'
import path from 'path'

export function createTray(mainWindow: BrowserWindow) {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets/tray-icon.png'))
  const tray = new Tray(icon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open', click: () => { mainWindow.show(); mainWindow.focus() } },
    { label: 'Check streak', click: () => {
      mainWindow.show()
      mainWindow.webContents.send('navigate', '/profile')
    }},
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ])

  tray.setContextMenu(contextMenu)
  tray.setToolTip('Codex — Learning Platform')
  tray.on('click', () => { mainWindow.show(); mainWindow.focus() })
}
```

**`mainWindow.webContents.send('navigate', '/profile')` explained:**
Unlike `ipcRenderer.invoke` (renderer → main, awaits response), `webContents.send` is
main → renderer, fire-and-forget. The renderer listens with `ipcRenderer.on('navigate', ...)`.
This direction is used for events the main process initiates: incoming notifications,
menu/tray actions, OS events.

### Step 5 — Remembering Window Position

```typescript
import Store from 'electron-store'

interface WindowState {
  width: number
  height: number
  x?: number
  y?: number
}

const store = new Store<{ windowState: WindowState }>()

export function createWindow() {
  const saved = store.get('windowState', { width: 1200, height: 800 })

  const win = new BrowserWindow({
    width: saved.width,
    height: saved.height,
    x: saved.x,
    y: saved.y,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  function saveWindowState() {
    if (!win.isMaximized() && !win.isMinimized()) {
      const bounds = win.getBounds()
      store.set('windowState', bounds)
    }
  }

  win.on('resize', saveWindowState)
  win.on('move', saveWindowState)
  win.on('close', saveWindowState)

  return win
}
```

**`electron-store` explained:**
A persistent key-value store backed by a JSON file in the user's app data directory
(e.g., `~/Library/Application Support/codex/config.json` on macOS). Unlike browser
`localStorage`, it persists across app reinstalls and is accessible only to the app.
Used for user preferences, window state, and settings that should survive app updates.

---

## Connect the Pieces

The main/renderer IPC in Electron (`ipcMain.handle` / `ipcRenderer.invoke`) is the same
request/response pattern as HTTP: one side sends a request with a channel name (URL) and
data (body), the other handles it and returns a response. The difference: IPC is local
(no network), synchronous options exist, and there is no HTTP overhead.

`globalShortcut.unregisterAll()` in `will-quit` follows the same "clean up resources
when done" principle as `socket.disconnect()` in Lesson 25 and `AbortController.abort()`
in Lesson 16. Resources that outlive their owner cause leaks: memory, OS handles, port
bindings. The pattern: allocate → use → release, always.

Electron's `dialog.showOpenDialog` is an OS-native API — it shows the macOS Finder panel
or the Windows Explorer file picker, not a web UI. This is the primary reason to choose
Electron over a web app for tools that need deep filesystem access.

---

## What Breaks Without This

Without `globalShortcut.unregisterAll()` in `will-quit`, crash testing leaves OS-level
shortcut registrations behind. Subsequent launches of the app cannot register the same
shortcut (it is already registered by the dead process). The shortcut silently fails
until the user logs out.

Without path validation in `file:save`, the renderer can instruct the main process to
write to any file on the system — including system files. A compromised renderer (via
XSS in rendered lesson content) could write to `/etc/sudoers` or overwrite shell configs.
The `path.resolve` + home directory check limits writes to user-owned files.

---

## Definition of Done

- [ ] The File menu has Open, Save, and Save As items that trigger native file dialogs
- [ ] Opening a file loads its contents into the Monaco editor
- [ ] Saving writes the current editor contents to the original file path
- [ ] `Cmd/Ctrl+Shift+C` brings the app to the front when minimised
- [ ] Closing the window keeps the app in the system tray
- [ ] Clicking the tray icon opens the window
- [ ] Window size and position are restored on relaunch
- [ ] You can answer: what is privilege separation and how does the main/renderer split implement it?
- [ ] You can answer: how does `ipcMain.handle` differ from `webContents.send`?
- [ ] You can answer: why must `filePath` be validated in `file:save`?
- [ ] `git commit` with a message explaining why — "Add Electron file system, tray, global shortcuts, and persistent window state"
