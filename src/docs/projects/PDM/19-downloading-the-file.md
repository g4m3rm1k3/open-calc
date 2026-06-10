# Vault PDM — Lesson 19 — Downloading the File

## What You Will Build

After checkout, a "Download" button appears on the checked-out file row. Clicking it
opens an OS file-save dialog. The file is fetched from GitLab (as base64-encoded
content), decoded, and written to the user-chosen location. A progress indicator
shows during download. The download uses Electron IPC — the renderer requests a
file write; the main process performs it.

## What You Need to Know First

Lessons 01–18. The file is checked out. The PAT is available in the session. This
lesson introduces `ipcMain.handle`, base64 decoding, and Electron's dialog API.

---

## The Problem

The renderer process cannot write files to disk — it runs in a browser sandbox. The
main process can, via Node.js's `fs` module. The renderer must ask the main process
to perform the write on its behalf.

This is not a design quirk — it is a security boundary. If the renderer could write
arbitrary files, a JavaScript injection in the renderer (from a malicious file name
processed by the UI, for example) could overwrite system files. The IPC channel is
the only bridge — and we control exactly what it exposes.

---

## Step 1 — GitLab File Content API

**GitLab Repository Files API — first appearance:**
`GET /api/v4/projects/:id/repository/files/:file_path/raw?ref=main` returns the raw
file content. For binary files (STEP, DWG), the content is the raw bytes. GitLab also
provides `GET /api/v4/projects/:id/repository/files/:file_path?ref=main` which returns
JSON including the file content as **base64-encoded** text.

**Base64 in file transfer — first appearance in this context:**
Binary files (images, CAD files) contain bytes that are not valid UTF-8 text — they
would be corrupted if transmitted as a string. Base64 encoding converts arbitrary
bytes to printable ASCII. The JSON API uses base64 so the binary content can be
embedded in a JSON string safely.

`atob(base64String)` — browser function that decodes base64 to a binary string.
`Buffer.from(base64String, 'base64')` — Node.js equivalent, decodes to a `Buffer`.
In the main process (Node.js), we use `Buffer.from`.

### Add to `src/data/gitlab.ts`

```typescript
export async function downloadFileContent(
  gitlabUrl:  string,
  token:      string,
  projectId:  number,
  filePath:   string,
  ref:        string = 'main',
): Promise<Buffer> {
  const encodedPath = encodeURIComponent(filePath)
  const url = `${gitlabUrl}/api/v4/projects/${projectId}/repository/files/${encodedPath}?ref=${ref}`

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  })

  if (response.status === 404) throw new Error(`File not found at path: ${filePath}`)
  if (!response.ok)            throw new Error(`GitLab error: ${response.status}`)

  const data = await response.json() as {
    file_name:    string
    content:      string
    encoding:     string
    size:         number
  }

  if (data.encoding !== 'base64') {
    throw new Error(`Unexpected encoding: ${data.encoding}`)
  }

  return Buffer.from(data.content, 'base64')
}
```

**`Buffer.from(base64, 'base64')` — explained:**
`Buffer` is a Node.js class for raw binary data. `Buffer.from(string, encoding)`
creates a `Buffer` from a string, interpreting it according to the given encoding.
`'base64'` means: decode the base64 string to its original binary bytes. The result
is a `Buffer` containing the exact bytes of the file.

**`encodeURIComponent(filePath)` — URL-encoding file paths:**
File paths can contain `/` characters. `/` in a URL path segment separates path
components — `designs/housing.step` in a URL would be parsed as two segments:
`designs` and `housing.step`. `encodeURIComponent` converts `/` to `%2F`, `space`
to `%20`, etc. The GitLab API understands `%2F` as a literal slash within the path.

---

## Step 2 — IPC: Renderer to Main Process

**`ipcMain.handle` — first appearance:**
`ipcMain.handle(channel, handler)` is the request-response form of IPC. The renderer
calls `ipcRenderer.invoke(channel, data)` and awaits the result. The main process
handler runs and returns a value — the renderer receives it as the resolved Promise.

This is different from `ipcMain.on` (lesson 10) which is fire-and-forget. `handle`/
`invoke` is the correct pattern for operations that return data (downloads, file
reads, dialog results).

**Path traversal — first appearance:**
**Path traversal** is a security vulnerability where an attacker supplies a file path
containing `../` to escape the intended directory. If a download request contains
`../../../../etc/passwd` as the file path, a naive implementation would write to that
system path.

Validation: the download destination must be a path the user chose from the dialog.
The dialog (Electron's `dialog.showSaveDialog`) returns a path — the user picked it,
so it is safe. The `filePath` from GitLab (the source) is the path within the
repository — it is used to construct the GitLab API URL, not as a local filesystem
path. These two paths are never conflated.

### Update `src/main/main.ts`

```typescript
import { ipcMain, dialog, app as electronApp } from 'electron'
import fs                                        from 'fs'
import path                                      from 'path'
import { downloadFileContent }                   from '../data/gitlab.js'
import { loadSession }                           from './sessionStore.js'

ipcMain.handle(
  'file:download',
  async (
    _event,
    params: { projectId: number; filePath: string; fileName: string },
  ) => {
    const session = loadSession()
    if (session === null) {
      return { success: false, error: 'Not authenticated' }
    }

    const { gitlabUrl, pat } = session

    const saveResult = await dialog.showSaveDialog({
      defaultPath: path.join(electronApp.getPath('downloads'), params.fileName),
      filters: [{ name: 'All Files', extensions: ['*'] }],
    })

    if (saveResult.canceled || saveResult.filePath === undefined) {
      return { success: false, error: 'Download cancelled' }
    }

    const destinationPath = saveResult.filePath

    try {
      const contentBuffer = await downloadFileContent(
        gitlabUrl,
        pat,
        params.projectId,
        params.filePath,
      )

      fs.writeFileSync(destinationPath, contentBuffer)
      return { success: true, path: destinationPath }
    } catch (error) {
      return {
        success: false,
        error:   error instanceof Error ? error.message : 'Download failed',
      }
    }
  },
)
```

**`dialog.showSaveDialog` — first appearance:**
`dialog.showSaveDialog(options)` opens the OS's native file-save dialog. The user
navigates to where they want to save the file and types a name. Returns a Promise
with `{ canceled: boolean, filePath?: string }`. If `canceled` is true, the user
dismissed the dialog without choosing a path.

`defaultPath` — the initial path and filename pre-filled in the dialog. Using the
user's `downloads` folder (`app.getPath('downloads')`) with the original filename
is the expected behaviour — the user can accept or change it.

**`fs.writeFileSync(path, buffer)` — first appearance:**
`fs.writeFileSync(path, data)` writes `data` to `path` synchronously (blocks until
complete). For a download, synchronous writing is acceptable — it happens in the
main process, not in the render loop, so it does not block the UI. For large files,
an async approach (`fs.writeFile`) would be more correct — left as an extension.

---

## Step 3 — Preload: Expose the IPC Channel

### Update `src/main/preload.ts`

```typescript
downloadFile: (params: { projectId: number; filePath: string; fileName: string }) =>
  ipcRenderer.invoke('file:download', params),
```

Add this to the `contextBridge.exposeInMainWorld('electronAPI', { ... })` object.
The renderer calls `window.electronAPI.downloadFile(params)` and receives the result.

---

## Step 4 — Renderer: Download Button

### Update `src/renderer/FileRow.tsx`

```typescript
async function handleDownload(): Promise<void> {
  setDownloading(true)
  setActionError('')

  const fileName = filePath.split('/').pop() ?? 'file'

  try {
    const result = await window.electronAPI.downloadFile({
      projectId: projectId,
      filePath,
      fileName,
    })

    if (!result.success) {
      if (result.error !== 'Download cancelled') {
        setActionError(result.error)
      }
    }
  } catch {
    setActionError('Download failed')
  } finally {
    setDownloading(false)
  }
}
```

**`window.electronAPI.downloadFile` — type safety:**
The renderer calls `window.electronAPI.downloadFile`, which is the preload-exposed
function. TypeScript does not know about this function by default. Add a declaration:

```typescript
// In src/renderer/electronAPI.d.ts
export {}
declare global {
  interface Window {
    electronAPI: {
      downloadFile: (params: { projectId: number; filePath: string; fileName: string }) =>
        Promise<{ success: boolean; path?: string; error?: string }>
      // ... other APIs
    }
  }
}
```

**`.d.ts` files — first appearance:**
`.d.ts` files are TypeScript **declaration files**. They describe the type shapes of
values without containing any JavaScript code. They are used to type values that
TypeScript cannot infer: global variables, libraries without TypeScript support, and
`contextBridge` exposed APIs. `declare global { interface Window { ... } }` extends
the global `Window` type with Vault's IPC API.

---

## Connect the Pieces

The download flow crosses all three Electron boundaries:

```
Renderer (browser):
  handleDownload() → window.electronAPI.downloadFile(params)
                       ↓ IPC (invoke)
Preload (Node.js + browser bridge):
  ipcRenderer.invoke('file:download', params)
                       ↓ IPC (main process handle)
Main process (Node.js):
  fetchGitlabFile → base64 decode → dialog.showSaveDialog → fs.writeFileSync
                       ↓ IPC return
Renderer:
  result.success → clear loading state
```

Each boundary is explicit: renderer to preload via the `window.electronAPI` API;
preload to main via IPC channel. No direct `require('fs')` in the renderer. No React
imports in the main process.

---

## What Breaks Without This

**Without the preload declaration file:**
`window.electronAPI.downloadFile` has type `any`. TypeScript does not check the
parameter shape. Passing `{ projectId: 'wrong-type', filePath: ... }` compiles
without error. The runtime fails with a confusing error in the main process handler.
The declaration file makes the type boundary enforced at compile time.

**Without `dialog.showSaveDialog` (writing to a hardcoded path):**
A hardcoded download path (`~/Downloads/filename`) silently overwrites any existing
file with the same name. The user might have multiple versions of `housing-v3.step`
downloaded at different times. A save dialog lets the user choose where and with
what name to save — respecting the principle that software does not make irreversible
decisions without user confirmation.

---

## Definition of Done

- [ ] Clicking "Download" on a checked-out file opens the OS save dialog
- [ ] The dialog defaults to the Downloads folder with the correct filename
- [ ] Cancelling the dialog shows no error (cancelled download is not an error)
- [ ] A successful download writes the file to the chosen location (verify with Finder/Explorer)
- [ ] You can explain base64 encoding — what it is, what it solves, what it is not
- [ ] You can explain `ipcMain.handle` vs `ipcMain.on` and when to use each
- [ ] You can explain path traversal and why the download destination is safe (user chose it via dialog)
- [ ] You can explain `.d.ts` declaration files — what they contain and why `window.electronAPI` needs one
- [ ] Run:
      ```
      git add src/main/ src/data/ src/renderer/
      git commit -m "Add file download: GitLab content API with base64 decode, IPC handle for fs.writeFileSync, OS save dialog"
      ```

---

*Next: Lesson 20 — WIP Snapshots. While a file is checked out, the engineer can
save intermediate progress. Vault commits the modified file to a temporary GitLab
branch and records the snapshot SHA in `wip_snapshots`.*
