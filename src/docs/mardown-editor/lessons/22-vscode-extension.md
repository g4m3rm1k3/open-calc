# Lesson 22 — The VS Code Extension

## What You Will Build

A VS Code extension command "Codex: Open Library" opens a folder picker. Selecting a
curriculum folder opens a Codex panel — sidebar, chapter view, code blocks, Run buttons —
inside VS Code, without leaving the editor. Python blocks run (Tier 1 or Tier 2 depending
on what's installed). The extension installs from a `.vsix` file. The `renderer` package
is used unchanged for the third time.

---

## What You Need to Know First

- Lesson 12: the adapter pattern, the web shell's `WebApp.tsx`, `onReadContent` as a prop
- Lesson 13: the `FallbackExecutor`, executor chain
- Lesson 1: the monorepo structure, why `renderer` and `core` are separate packages

---

## The Lesson

### Step 1 — VS Code Extension Architecture

A VS Code extension consists of two execution contexts:

**The extension host process:**
- Runs your extension's TypeScript code
- Has full access to the VS Code API (`vscode.*`)
- Has full access to Node.js APIs (file system, child processes, network)
- Does not have a DOM

**The webview:**
- A sandboxed iframe-like component inside a VS Code panel
- Has a DOM (it is a web page)
- Cannot access Node.js or the VS Code API directly
- Communicates with the extension host via `postMessage`

```
Extension host process          Webview (iframe)
─────────────────────           ─────────────────────────
vscode.*  ✓                     DOM access  ✓
Node.js   ✓                     React, Monaco  ✓
File I/O  ✓                     vscode.*  ✗
                                Node.js  ✗
       ← postMessage →
```

**SE lens:** The webview is a third shell over `@codex/renderer`. The first shell was
Electron (Lesson 1). The second was the web browser (Lesson 12). The third is the VS Code
webview. In all three cases, the `renderer` package is unchanged. The only thing that
changes is the adapter — the IPC mechanism.

The open/closed principle at the architecture level: `renderer` is closed for modification
and open for use in new shells.

### Step 2 — The Extension Manifest

Create `apps/vscode/`:

```
$ mkdir -p apps/vscode/src
$ touch apps/vscode/package.json
```

```json
{
  "name": "codex-vscode",
  "displayName": "Codex",
  "description": "A markdown-based code learning environment inside VS Code",
  "version": "0.1.0",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": ["Education"],
  "activationEvents": [],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "codex.openLibrary",
        "title": "Codex: Open Library"
      }
    ]
  },
  "scripts": {
    "build": "vsce package",
    "compile": "tsc -p tsconfig.json"
  },
  "devDependencies": {
    "@types/vscode": "^1.85.0",
    "@vscode/vsce": "^2.0.0",
    "typescript": "^5.3.0"
  }
}
```

**Every field explained:**

- `"engines": { "vscode": "^1.85.0" }` — the minimum VS Code version this extension
  supports. `^1.85.0` means 1.85.0 or higher (but not 2.x). VS Code checks this before
  loading the extension.

- `"activationEvents": []` — when to activate the extension. Empty array means VS Code
  determines activation based on `contributes`. In modern VS Code (1.74+), activation
  events are inferred from contributed commands — an empty array is correct.

- `"main": "./dist/extension.js"` — the compiled entry point. VS Code loads this file
  when the extension activates.

- `"contributes.commands"` — declares commands that appear in the Command Palette
  (`Cmd+Shift+P`). `"command": "codex.openLibrary"` is the internal ID. `"title"` is
  what the user sees in the palette.

- `"@vscode/vsce"` — the VS Code Extension packaging tool. `vsce package` compiles the
  extension and creates a `.vsix` file. Install with `code --install-extension codex-vscode-0.1.0.vsix`.

### Step 3 — The Extension Host Entry Point

In `apps/vscode/src/extension.ts`:

```typescript
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import { parseLibrary } from '@codex/core'

export function activate(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand('codex.openLibrary', async () => {
    const folderUri = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
      canSelectMany: false,
      openLabel: 'Open Curriculum Folder',
    })

    if (!folderUri || folderUri.length === 0) return

    const folderPath = folderUri[0].fsPath
    const library = await parseLibrary(folderPath)

    CodexPanel.createOrShow(context.extensionUri, library)
  })

  context.subscriptions.push(command)
}

export function deactivate(): void {}
```

**`activate` and `deactivate` explained:**
`activate` is called once when the extension first activates. It registers commands,
event listeners, and other resources. `deactivate` is called when the extension is
unloaded — used for cleanup. VS Code calls these as lifecycle hooks.

`context.subscriptions.push(command)` registers the command for cleanup. When the
extension deactivates, VS Code calls `.dispose()` on everything in `subscriptions`,
which unregisters the command. Without this, the command lingers in VS Code's registry
after the extension deactivates.

**`vscode.window.showOpenDialog` explained:**
The VS Code equivalent of Electron's `dialog.showOpenDialog`. Returns a
`Promise<vscode.Uri[] | undefined>`. `Uri.fsPath` converts a VS Code URI to an OS file
path string. Returns `undefined` if the user cancels.

### Step 4 — The Webview Panel

In `apps/vscode/src/CodexPanel.ts`:

```typescript
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import type { Library } from '@codex/core'
import { LocalExecutor, WASMExecutor, FallbackExecutor } from '@codex/executor'

const executor = new FallbackExecutor([
  new LocalExecutor(),
  new WASMExecutor(),
])

export class CodexPanel {
  static currentPanel: CodexPanel | undefined
  private readonly panel: vscode.WebviewPanel
  private library: Library

  static createOrShow(extensionUri: vscode.Uri, library: Library): void {
    if (CodexPanel.currentPanel) {
      CodexPanel.currentPanel.panel.reveal()
      CodexPanel.currentPanel.updateLibrary(library)
      return
    }

    const panel = vscode.window.createWebviewPanel(
      'codex',
      'Codex',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'dist', 'webview'),
        ],
      }
    )

    CodexPanel.currentPanel = new CodexPanel(panel, library, extensionUri)
  }

  private constructor(
    panel: vscode.WebviewPanel,
    library: Library,
    extensionUri: vscode.Uri,
  ) {
    this.panel = panel
    this.library = library

    this.panel.webview.html = this.getWebviewContent(extensionUri)

    this.panel.webview.onDidReceiveMessage(async message => {
      switch (message.type) {
        case 'READY':
          this.panel.webview.postMessage({ type: 'LIBRARY', library: this.library })
          break

        case 'READ_CHAPTER': {
          const content = fs.readFileSync(message.filePath, 'utf-8')
          this.panel.webview.postMessage({ type: 'CHAPTER_CONTENT', filePath: message.filePath, content })
          break
        }

        case 'EXECUTE': {
          const result = await executor.execute({ language: message.language, code: message.code })
          this.panel.webview.postMessage({ type: 'EXECUTION_RESULT', id: message.id, result })
          break
        }
      }
    })

    this.panel.onDidDispose(() => {
      CodexPanel.currentPanel = undefined
    })
  }

  private updateLibrary(library: Library): void {
    this.library = library
    this.panel.webview.postMessage({ type: 'LIBRARY', library })
  }

  private getWebviewContent(extensionUri: vscode.Uri): string {
    const webviewDistPath = vscode.Uri.joinPath(extensionUri, 'dist', 'webview')
    const scriptUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(webviewDistPath, 'index.js')
    )
    const styleUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(webviewDistPath, 'index.css')
    )
    const nonce = generateNonce()

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none';
             script-src 'nonce-${nonce}' ${this.panel.webview.cspSource};
             style-src ${this.panel.webview.cspSource} 'unsafe-inline';
             img-src ${this.panel.webview.cspSource} data:;
             font-src ${this.panel.webview.cspSource};">
  <link href="${styleUri}" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`
  }
}

function generateNonce(): string {
  const array = new Uint32Array(4)
  crypto.getRandomValues(array)
  return Array.from(array, n => n.toString(16)).join('')
}
```

**`enableScripts: true` explained:**
By default, VS Code webviews cannot execute JavaScript. `enableScripts: true` opts in to
script execution. The CSP (Content Security Policy) limits which scripts can run.

**`localResourceRoots` explained:**
Restricts which local files the webview can load. Only files within the listed directories
can be served to the webview. This prevents the webview from loading arbitrary files from
the user's disk.

**`panel.webview.asWebviewUri` explained:**
Local file paths (`/path/to/dist/index.js`) cannot be used directly in a webview — the
browser would reject them as cross-origin. `asWebviewUri` converts a local path to a
special `vscode-webview-resource:` URI that the webview can load securely.

**CSP nonce explained:**
A nonce (number used once) is a random value added to the CSP header and to `<script>` tags.
`script-src 'nonce-{nonce}'` means: only execute scripts whose `<script>` tag has this
exact nonce value. This prevents injected scripts (that do not have the nonce) from running,
even if they appear in the webview's HTML. The nonce is regenerated for each webview creation.

### Step 5 — The Webview's React App

The webview's JavaScript (`apps/vscode/src/webview/main.tsx`) uses `window.acquireVsCodeApi`
to get the VS Code messaging API, then builds an adapter:

```typescript
import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@codex/renderer'

const vscodeApi = acquireVsCodeApi()

declare function acquireVsCodeApi(): {
  postMessage: (message: unknown) => void
}

let executionCallbacks = new Map<string, (result: unknown) => void>()
let readCallbacks = new Map<string, (content: string) => void>()
let executionIdCounter = 0

window.addEventListener('message', ({ data }) => {
  if (data.type === 'LIBRARY') {
    window.codexVSCodeLibrary = data.library
    window.dispatchEvent(new CustomEvent('codex:library', { detail: data.library }))
  }
  if (data.type === 'CHAPTER_CONTENT') {
    readCallbacks.get(data.filePath)?.(data.content)
    readCallbacks.delete(data.filePath)
  }
  if (data.type === 'EXECUTION_RESULT') {
    executionCallbacks.get(data.id)?.(data.result)
    executionCallbacks.delete(data.id)
  }
})

vscodeApi.postMessage({ type: 'READY' })

const vsCodeAdapter = {
  readChapter: (filePath: string): Promise<string> =>
    new Promise(resolve => {
      readCallbacks.set(filePath, resolve)
      vscodeApi.postMessage({ type: 'READ_CHAPTER', filePath })
    }),

  executeCode: (language: string, code: string): Promise<unknown> => {
    const id = String(++executionIdCounter)
    return new Promise(resolve => {
      executionCallbacks.set(id, resolve)
      vscodeApi.postMessage({ type: 'EXECUTE', id, language, code })
    })
  },
}

// Mount the React app with vsCodeAdapter as the implementation
createRoot(document.getElementById('root')!).render(
  <App codexApi={vsCodeAdapter} />
)
```

**`acquireVsCodeApi` explained:**
`acquireVsCodeApi()` is a function injected by VS Code into the webview's JavaScript
context. It returns an object with `postMessage` (send to extension host) and `getState`/
`setState` (persist state across webview reloads). It can only be called once per webview
— calling it twice throws.

**The callback map pattern:**
`postMessage` is fire-and-forget — it does not return a Promise. To implement async
request/response (the webview asks for a chapter's content; the extension host reads it
and sends it back), we use a callback map:
1. Generate a unique ID (or use the file path as the key for reads)
2. Store a callback `(result) => resolve(promise)` in the map
3. Send the request with the ID
4. When the response arrives (in `window.addEventListener`), look up the callback and
   call it with the result

This is the **correlation ID pattern** — the same technique used in asynchronous messaging
systems (message queues, WebSockets) to match requests to responses.

---

## Connect the Pieces

The three shells — Electron, web, VS Code — all use the `renderer` package unchanged.
The adapters differ:
- Electron: `window.codexAPI.*` (exposed by `contextBridge`)
- Web: `webFileSystem.ts` functions
- VS Code: `vsCodeAdapter` object with `postMessage`-backed Promises

The `FallbackExecutor` in the extension host runs the same code as in the Electron shell.
Tier 1 (LocalExecutor) uses Node.js child processes available in the extension host.

---

## What Breaks Without This

If `localResourceRoots` is not set to the webview distribution directory, VS Code refuses
to serve any local files to the webview. The webview loads an HTML page with a `<script>`
tag, but the script is blocked. The webview shows a blank page. The error is subtle:
VS Code does not show an error — the script tag simply loads nothing. The fix is to include
the directory containing the compiled webview JavaScript in `localResourceRoots`.

---

## Definition of Done

- [ ] `Cmd+Shift+P` → "Codex: Open Library" opens a folder picker
- [ ] Selecting a curriculum folder opens a Codex panel beside the active editor
- [ ] Chapters are visible in the sidebar; clicking one renders the content
- [ ] A Python block runs with correct output
- [ ] The `.vsix` package installs with `code --install-extension codex-vscode-0.1.0.vsix`
- [ ] You can answer: what is the difference between the extension host and the webview?
- [ ] You can answer: what is a CSP nonce and why is it used here?
- [ ] You can answer: why does the webview use callback maps instead of returning Promises
      from `postMessage`?
- [ ] `git commit` with a message explaining why
