# Lesson 12 — The Web Shell

## What You Will Build

Running `npm run dev:web` opens the Codex app in a browser tab — no Electron required.
The student opens a local folder using the browser's native folder picker, sees the
chapter sidebar, clicks a chapter, and reads it with full syntax highlighting and math
rendering. Code blocks show Run buttons but display "Python requires a runtime — loading…"
when clicked. Execution is wired in Lesson 13. This lesson proves the architecture decision
from Lesson 1 — the same `renderer` and `core` packages work in a browser without a single
line changed.

---

## What You Need to Know First

- Lesson 1: monorepo structure, why `renderer` and `core` are separate packages
- Lesson 3: `ChapterView`, `onReadContent` as a prop
- Lesson 2: IPC, `contextBridge`, the preload script — and why none of that exists in a browser

---

## The Lesson

### Step 1 — The Networking Concepts (First Appearance)

**What `localhost` is:**
`localhost` is the loopback address — a special network address that routes back to the
same machine. When Vite starts a dev server on `localhost:5173`, your computer is both
the client (your browser) and the server (Vite's process). No network traffic leaves your
machine. `127.0.0.1` is the IP address of `localhost`; most software treats them as equivalent.

**What a port is:**
A port is a number (1–65535) that routes a network connection to a specific program on a
machine. The OS maintains a table of which program is listening on which port. Two programs
cannot share a port — if you try to start two Vite servers, the second fails because port
5173 is already taken. Common ports: 80 (HTTP), 443 (HTTPS), 5173 (Vite), 3000 (many
dev servers by convention).

**What the dev server does:**
Vite's dev server receives HTTP requests from your browser. When the browser requests
`GET /src/App.tsx`, Vite reads the TypeScript file, compiles it to JavaScript using esbuild,
and returns the compiled JavaScript. This happens on demand — Vite does not pre-compile the
entire project at startup. The result: fast startup (no waiting for a full build) and fast
code changes (only the changed file is recompiled).

**The gap between dev and production:**
In development:
- Code is not minified — variable and function names are readable
- Source maps are generated — the browser can show original TypeScript line numbers in errors
- Hot module replacement (HMR) updates the page without a full reload when you save a file

In production:
- Code is bundled and minified — all files are merged and variable names are shortened to
  save bytes (a function named `handleChapterClick` might become `h`)
- Source maps may be omitted to hide source code from users
- There is no dev server — a web server like nginx serves the pre-built static files

**Why this matters for Codex:** The web shell in development runs on `localhost:5173` via
Vite. The web shell in production is a folder of HTML, CSS, and JavaScript files that can
be served from any static hosting service (GitHub Pages, Netlify, Vercel). No Node.js
server is required for the web app — the execution API (Lesson 18) is the only server-side
component.

### Step 2 — The Browser Security Model

In Electron, the renderer has IPC to the main process, which has Node.js access. In a
browser, there is no main process and no Node.js. The browser's security model restricts
what a web page can do:

**File system access:** By default, a web page cannot access the local file system. The
File System Access API is the browser's opt-in mechanism: it shows a permission dialog,
and if the user grants access, the page receives a `FileSystemDirectoryHandle` — an object
representing the selected folder.

**`window.showDirectoryPicker()` explained:**
`showDirectoryPicker()` is a browser API that shows a native folder picker and returns a
`Promise<FileSystemDirectoryHandle>`. The handle provides methods to read the directory's
contents. Unlike Electron's `dialog.showOpenDialog`, the browser API runs in the renderer
— no IPC required.

```typescript
const directoryHandle = await window.showDirectoryPicker()
```

**Why Electron's preload API and the browser's File System Access API have different shapes:**
Electron's IPC-based approach was designed for maximum security — the renderer can only
call what the preload explicitly exposes. The browser's File System Access API is designed
for web apps that need temporary file access — it requires a user gesture (the call must
happen inside a click handler) and shows a permission dialog every time (or caches the
permission for the session).

### Step 3 — The Shell Adapter Pattern

The core observation: `ChapterView` accepts `onReadContent` as a prop. It does not care
whether the content comes from Electron's IPC or from the browser's file system. This is
the **adapter pattern** — the component declares what it needs (a function that takes a
file path and returns content), and the shell provides an implementation.

In `apps/electron`, the adapter is `window.codexAPI.readChapter` (from the preload script).
In `apps/web`, the adapter will be a function that uses the File System Access API.

**SE lens:** This is the payoff of the design decision from Lesson 1. The `renderer` package
has no `import` from `electron` — not a single one. It has no IPC calls. It has no
`window.codexAPI` calls. Those live in `App.tsx` in each shell. The `renderer` package is
shell-agnostic.

When we add the VSCode extension in Lesson 22, the same `renderer` package works a third
time — with `postMessage` as the adapter.

### Step 4 — Create the Web App Shell

```
$ mkdir -p apps/web/src
$ touch apps/web/package.json
```

```json
{
  "name": "@codex/web",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@codex/core": "*",
    "@codex/renderer": "*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

```
$ touch apps/web/vite.config.ts
```

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@codex/renderer', '@codex/core'],
  },
})
```

**`optimizeDeps.exclude` explained:**
Vite pre-bundles dependencies at startup for faster page loads. Excluding our own
monorepo packages (`@codex/renderer`, `@codex/core`) prevents Vite from caching
stale versions — when we change these packages, Vite picks up the changes immediately
rather than serving a cached pre-bundle.

```
$ touch apps/web/index.html
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Codex</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #1a1a2e; font-family: system-ui, sans-serif; color: white; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**`<meta name="viewport">` explained:**
This meta tag controls how the browser scales the page on mobile devices. Without it,
mobile browsers render the page at desktop width and scale it down — making text tiny.
`width=device-width` sets the page width to the device screen width. `initial-scale=1.0`
prevents zoom. Every web page should have this tag.

**`type="module"` on the script tag:**
`type="module"` tells the browser to interpret the script as an ES module. ES modules
support `import` and `export` statements natively. Without `type="module"`, `import`
syntax would throw a `SyntaxError`. Vite requires module scripts.

### Step 5 — The Web Shell's File Adapter

In `apps/web/src/webFileSystem.ts`:

```typescript
import type { Chapter, Library } from '@codex/core'

let activeDirectoryHandle: FileSystemDirectoryHandle | null = null

export async function openFolder(): Promise<string | null> {
  try {
    activeDirectoryHandle = await window.showDirectoryPicker()
    return activeDirectoryHandle.name
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return null
    }
    throw err
  }
}

export async function loadLibrary(): Promise<Library | null> {
  if (activeDirectoryHandle === null) return null

  const chapters: Chapter[] = []
  let index = 0

  for await (const [name, handle] of activeDirectoryHandle) {
    if (handle.kind === 'file' && name.endsWith('.md')) {
      const file = await handle.getFile()
      const content = await file.text()
      const firstLine = content.split('\n')[0]
      const title = firstLine.startsWith('# ')
        ? firstLine.slice(2).trim()
        : name.replace('.md', '')

      chapters.push({
        filePath: `virtual://${name}`,
        title,
        order: index++,
      })
    }
  }

  chapters.sort((a, b) => a.title.localeCompare(b.title))

  return {
    rootPath: activeDirectoryHandle.name,
    chapters,
  }
}

export async function readChapter(virtualPath: string): Promise<string> {
  if (activeDirectoryHandle === null) {
    throw new Error('No folder open')
  }

  const fileName = virtualPath.replace('virtual://', '')
  const handle = await activeDirectoryHandle.getFileHandle(fileName)
  const file = await handle.getFile()
  return file.text()
}
```

**`for await...of` explained:**
`for await...of` is an asynchronous iteration loop. `FileSystemDirectoryHandle` is an
async iterable — it yields `[name, handle]` pairs one at a time, potentially waiting
between each one (since reading directory entries may involve I/O). The `await` in
`for await` pauses the loop until the next value is ready.

**`virtual://` prefix explained:**
The `Chapter.filePath` type is a `string`. In the Electron shell, file paths are real OS
paths like `/Users/student/curriculum/01-intro.md`. In the web shell, there are no OS file
paths — files are accessed through `FileSystemDirectoryHandle`. We use a `virtual://`
prefix to distinguish web-shell virtual paths from Electron OS paths.

The `readChapter` function uses the virtual path to look up the file handle. This is an
adapter: the calling code (ChapterView) passes a `filePath` string; the adapter knows
how to interpret it.

**`AbortError` handling:**
`showDirectoryPicker()` throws a `DOMException` with `name: 'AbortError'` when the user
cancels the picker. We catch this and return `null` — the same contract as Electron's
`dialog.showOpenDialog` when `result.canceled` is `true`. Callers do not need to know
which environment they are in.

### Step 6 — The Web Shell's App Entry

In `apps/web/src/main.tsx`:

```typescript
import React from 'react'
import { createRoot } from 'react-dom/client'
import { WebApp } from './WebApp'

const rootElement = document.getElementById('root')!
createRoot(rootElement).render(<WebApp />)
```

In `apps/web/src/WebApp.tsx`:

```typescript
import React, { useState, useCallback } from 'react'
import { Sidebar, ChapterView } from '@codex/renderer'
import { openFolder, loadLibrary, readChapter } from './webFileSystem'
import type { Chapter, Library } from '@codex/core'

export function WebApp() {
  const [library, setLibrary] = useState<Library | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)

  const handleOpenFolder = useCallback(async () => {
    const folderName = await openFolder()
    if (folderName === null) return

    const loadedLibrary = await loadLibrary()
    if (loadedLibrary === null) return

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
      <main style={{ flex: 1 }}>
        {selectedChapter === null ? (
          <p style={{ padding: '2rem', color: '#888' }}>Select a chapter to begin.</p>
        ) : (
          <ChapterView
            chapter={selectedChapter}
            onReadContent={readChapter}
          />
        )}
      </main>
    </div>
  )
}
```

`Sidebar` and `ChapterView` are imported from `@codex/renderer` — the same components
used in the Electron shell. They have not changed. The only difference is the `onReadContent`
and `onOpenFolder` callbacks — they come from `webFileSystem.ts` instead of `window.codexAPI`.

Add a `dev:web` script to the root `package.json`:

```json
"scripts": {
  "dev": "npm run dev --workspace=apps/electron",
  "dev:web": "npm run dev --workspace=apps/web"
}
```

**Workspace scripts explained:**
`npm run dev --workspace=apps/web` runs the `dev` script defined in `apps/web/package.json`
from the root of the monorepo. The `--workspace` flag selects which package's script to run.
This lets you start any app without `cd`-ing into its directory.

---

## Connect the Pieces

`WebApp.tsx` is structurally identical to `App.tsx` in Electron. Both use `Sidebar` and
`ChapterView` from `@codex/renderer`. Both have `handleOpenFolder` and the same state shape.
The only difference is the source of the callback implementations.

This is the architectural claim from Lesson 1 made concrete: three shells, one renderer.
Every feature added to `Sidebar` or `ChapterView` appears in both shells automatically.

In Lesson 13, `WebApp.tsx` gets a different `onRun` implementation than `App.tsx` — the
web shell uses WASM; the Electron shell uses child processes. The same `CodeBlock` component
works in both.

---

## What Breaks Without This

If `optimizeDeps.exclude` is removed, Vite pre-bundles `@codex/renderer` at startup. Changes
to `renderer/src/ChapterView.tsx` do not appear in the web app until you restart Vite (it
serves the cached bundle). This is the most common "why aren't my changes showing up?" issue
with Vite monorepos, and the fix is a single line in `vite.config.ts`.

---

## Definition of Done

- [ ] `npm run dev:web` opens the app in a browser at `localhost:5173`
- [ ] Clicking "Open Folder" shows a native folder picker in the browser
- [ ] After selecting a folder, the sidebar lists `.md` files
- [ ] Clicking a chapter renders it with syntax highlighting and math
- [ ] The web app runs from the same `@codex/renderer` package as the Electron app —
      verify with `npm ls @codex/renderer` showing one shared resolution
- [ ] You can answer: what is `localhost:5173` and what happens to the URL in production?
- [ ] You can answer: why does `showDirectoryPicker` throw `AbortError` on cancel?
- [ ] You can answer: what does `type="module"` on a script tag enable?
- [ ] `git commit` with a message explaining why
