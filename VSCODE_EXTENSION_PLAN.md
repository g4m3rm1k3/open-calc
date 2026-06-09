# UpSkillOS — VSCode Extension Plan

## Goal
Build a VSCode extension that runs the existing UpSkillOS web app (open-calc) inside
VS Code, Cursor, Windsurf, and all VS Code-compatible editors — with zero course
porting and one shared codebase that updates both the web app and the extension
when a bug is fixed or a course is added.

---

## Guiding Principles

1. **One codebase.** All course content, lesson components, OpenMAT, Ada, Firebase
   auth — zero duplication. A `npm run build` produces artifacts for both.
2. **Thin adapter.** The only code that differs between web and VS Code is a single
   `platform.js` file (~40 lines) that swaps out execution and file-system calls.
3. **Native feel.** Hide the app's own chrome (TopBar, Sidebar) inside VS Code and
   use VS Code's native UI zones (activity bar, sidebar TreeView, editor tabs, terminal).
4. **Real execution.** In VS Code, "Run" uses the real integrated terminal — no
   Pyodide workaround. Real Python, real Node, real file system.

---

## Visual Layout Inside VS Code

```
┌─────────────────────────────────────────────────────────────────┐
│  File  Edit  View  ...   (VS Code's own menu — untouched)       │
├────┬────────────────────┬────────────────────────────────────────┤
│    │                    │                                        │
│ 📚 │  UPSKILLOS         │   Lesson: Newton's First Law   [tab]  │
│    │  ─────────────     │   ─────────────────────────────────   │
│ 🔍 │  ▼ Calculus        │   A body at rest stays at rest...    │
│    │    ▶ Chapter 1     │                                       │
│ 🧮 │      ● Limits      │   $$ \sum F = 0 \Rightarrow a = 0 $$ │
│    │      ● Derivatives │                                       │
│    │    ▶ Chapter 2     │   ```python                           │
│ 💬 │  ▼ Physics         │   F = m * a                          │
│    │    ○ Newton's Laws  │   print(f"Force: {F} N")             │
│    │  ▼ Statistics      │   ```                                 │
│    │  ▼ Linear Algebra  │   [ ▶ Run ]  [ ↓ To workspace ]      │
│    │                    │                                       │
│    │  🧮 OpenMAT        │                                       │
│    │  💬 Ada            │                                       │
│    │  🐛 Report Bug     │                                       │
├────┴────────────────────┴────────────────────────────────────────┤
│  TERMINAL  │  OUTPUT  │  PROBLEMS                               │
│  $ python newton.py                                             │
│  Force: 20.0 N                                                  │
└─────────────────────────────────────────────────────────────────┘
```

After clicking "▶ Run" or "↓ To workspace" — VS Code split editor:
```
┌────────────────────────┬────────────────────────────────────────┐
│  Lesson (tab)          │  newton.py  ← real file in workspace   │
├────────────────────────┼────────────────────────────────────────┤
│  lesson content...     │  m = 5                                 │
│                        │  a = 4                                 │
│  [ ▶ Run ]             │  F = m * a                            │
│                        │  print(f"Force: {F} N")               │
├────────────────────────┴────────────────────────────────────────┤
│  TERMINAL                                                       │
│  $ python newton.py                                             │
│  Force: 20.0 N                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture

```
open-calc/                          ← existing repo, barely changes
  src/
    utils/
      platform.js                  ← NEW: ~40 lines, detects context
    components/
      layout/
        AppShell.jsx                ← CHANGE: hide TopBar+Sidebar in VS Code
      docs/
        WorkspaceTerminal.jsx       ← CHANGE: use real terminal in VS Code
        DocsCodeWorkspace.jsx       ← CHANGE: file creation → workspace
  package.json                     ← CHANGE: add build:ext + package:ext scripts

  vscode-extension/                ← NEW folder (~250 lines total)
    extension.ts                   ← extension host: VS Code API glue
    package.json                   ← extension manifest
    tsconfig.json
    assets/
      icon.svg                     ← activity bar icon
```

---

## Step-by-Step Implementation

### Phase 1 — Platform adapter (30 min)

**Create `src/utils/platform.js`:**
```js
// VS Code injects acquireVsCodeApi() into every webview's window
const vscode = typeof acquireVsCodeApi !== 'undefined'
  ? acquireVsCodeApi()
  : null

export const platform = {
  isVSCode: !!vscode,
  isWeb:    !vscode,

  runCode(code, language, filename) {
    if (vscode) vscode.postMessage({ type: 'run', code, language, filename })
    // else: WorkspaceTerminal handles it as before (Pyodide / sandbox)
  },

  createFile(name, content) {
    if (vscode) vscode.postMessage({ type: 'create-file', name, content })
    // else: existing DocsCodeWorkspace adds it to editor items
  },

  openFile(path) {
    if (vscode) vscode.postMessage({ type: 'open-file', path })
  },

  notify(message) {
    if (vscode) vscode.postMessage({ type: 'notify', message })
  }
}
```

---

### Phase 2 — App shell changes (20 min)

**`src/components/layout/AppShell.jsx`**
```jsx
import { platform } from '../../utils/platform.js'

// Wrap TopBar and Sidebar with the guard:
{!platform.isVSCode && <TopBar ... />}
{!platform.isVSCode && <Sidebar ... />}

// Main content fills full container when in VS Code (no sidebar offset)
<main className={platform.isVSCode ? 'w-full h-full' : 'existing-classes'}>
  {children}
</main>
```

**`src/components/docs/WorkspaceTerminal.jsx`**
```js
import { platform } from '../../utils/platform.js'

// In the run() imperative handle, add before existing execution:
run(activeFile, allFiles) {
  if (platform.isVSCode) {
    platform.runCode(activeFile.content, activeFile.language, activeFile.name)
    return
  }
  // ... existing Pyodide / sandbox code unchanged
}
```

**`src/components/docs/DocsCodeWorkspace.jsx`**
```js
// Download / create file button:
if (platform.isVSCode) {
  platform.createFile(file.name, file.content)
  return
}
// else: existing behavior
```

---

### Phase 3 — Extension manifest (15 min)

**`vscode-extension/package.json`:**
```json
{
  "name": "upskillos",
  "displayName": "UpSkillOS",
  "description": "Learn coding, math, and science inside your editor",
  "version": "0.1.0",
  "publisher": "upskillos",
  "engines": { "vscode": "^1.85.0" },
  "categories": ["Education", "Notebooks", "Other"],
  "activationEvents": ["onStartupFinished"],
  "main": "./out/extension.js",
  "contributes": {
    "viewsContainers": {
      "activitybar": [{
        "id": "upskillos",
        "title": "UpSkillOS",
        "icon": "assets/icon.svg"
      }]
    },
    "views": {
      "upskillos": [
        {
          "type": "webview",
          "id": "upskillos.courses",
          "name": "Courses"
        },
        {
          "type": "webview",
          "id": "upskillos.ada",
          "name": "Ada — AI Tutor"
        }
      ]
    },
    "commands": [
      { "command": "upskillos.openLesson",  "title": "UpSkillOS: Open Lesson" },
      { "command": "upskillos.openOpenMat", "title": "UpSkillOS: Open in OpenMAT" },
      { "command": "upskillos.reportBug",   "title": "UpSkillOS: Report Bug" }
    ],
    "customEditors": [{
      "viewType": "upskillos.openmat",
      "displayName": "OpenMAT Editor",
      "selector": [{ "filenamePattern": "*.m" }],
      "priority": "default"
    }],
    "menus": {
      "editor/title": [{
        "command": "upskillos.openOpenMat",
        "when": "resourceExtname == .m",
        "group": "navigation"
      }]
    }
  },
  "scripts": {
    "vscode:prepublish": "cd .. && npm run build && npm run compile:ext",
    "compile:ext": "tsc -p ./tsconfig.json",
    "watch": "tsc -watch -p ./tsconfig.json"
  },
  "devDependencies": {
    "@types/vscode": "^1.85.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "@vscode/vsce": "^2.0.0"
  }
}
```

---

### Phase 4 — Extension host (60 min)

**`vscode-extension/extension.ts`** (~200 lines):

```typescript
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'

// ── Activation ────────────────────────────────────────────────────────────────
export function activate(ctx: vscode.ExtensionContext) {
  const distPath = path.join(ctx.extensionPath, '..', 'dist')

  // Sidebar: Courses panel
  ctx.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'upskillos.courses',
      new AppViewProvider(ctx, distPath, '/#/courses')
    )
  )

  // Sidebar: Ada AI panel
  ctx.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'upskillos.ada',
      new AppViewProvider(ctx, distPath, '/#/ada')
    )
  )

  // Custom editor for .m files (OpenMAT)
  ctx.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      'upskillos.openmat',
      new OpenMatEditorProvider(ctx, distPath)
    )
  )

  // Command: open a lesson as a full editor tab
  ctx.subscriptions.push(
    vscode.commands.registerCommand('upskillos.openLesson', (lessonPath?: string) => {
      openFullTab(ctx, distPath, lessonPath ? `/#/chapter/${lessonPath}` : '/#/')
    })
  )
}

// ── Webview provider (sidebar panels) ────────────────────────────────────────
class AppViewProvider implements vscode.WebviewViewProvider {
  constructor(
    private ctx: vscode.ExtensionContext,
    private distPath: string,
    private initialRoute: string
  ) {}

  resolveWebviewView(view: vscode.WebviewView) {
    view.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(this.distPath)]
    }
    view.webview.html = buildHtml(view.webview, this.distPath, this.initialRoute)
    view.webview.onDidReceiveMessage(msg => handleMessage(msg, view.webview))
  }
}

// ── Custom editor for .m files ────────────────────────────────────────────────
class OpenMatEditorProvider implements vscode.CustomTextEditorProvider {
  constructor(
    private ctx: vscode.ExtensionContext,
    private distPath: string
  ) {}

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    panel: vscode.WebviewPanel
  ) {
    panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(this.distPath)]
    }
    // Open OpenMAT with the file content pre-loaded
    panel.webview.html = buildHtml(
      panel.webview, this.distPath, '/#/openmat',
      { openmatFile: document.getText(), openmatName: path.basename(document.fileName) }
    )
    panel.webview.onDidReceiveMessage(msg => {
      if (msg.type === 'save-openmat') {
        const edit = new vscode.WorkspaceEdit()
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), msg.content)
        vscode.workspace.applyEdit(edit)
      }
      handleMessage(msg, panel.webview)
    })
  }
}

// ── Open a full editor tab ─────────────────────────────────────────────────────
function openFullTab(ctx: vscode.ExtensionContext, distPath: string, route: string) {
  const panel = vscode.window.createWebviewPanel(
    'upskillos.lesson',
    'UpSkillOS',
    vscode.ViewColumn.One,
    { enableScripts: true, localResourceRoots: [vscode.Uri.file(distPath)] }
  )
  panel.webview.html = buildHtml(panel.webview, distPath, route)
  panel.webview.onDidReceiveMessage(msg => handleMessage(msg, panel.webview))
}

// ── Message handler (postMessage from React app → VS Code) ───────────────────
async function handleMessage(msg: any, _webview: vscode.Webview) {
  const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? os.tmpdir()

  switch (msg.type) {

    case 'run': {
      const terminal = vscode.window.activeTerminal
        ?? vscode.window.createTerminal({ name: 'UpSkillOS' })

      // Write file to workspace (or temp dir if no workspace open)
      const filePath = path.join(folder, msg.filename)
      fs.writeFileSync(filePath, msg.code, 'utf8')

      const cmd: Record<string, string> = {
        python:     `python "${filePath}"`,
        javascript: `node "${filePath}"`,
        typescript: `npx ts-node "${filePath}"`,
        openmat:    `echo "OpenMAT runs in the OpenMAT panel — no terminal needed"`,
      }
      terminal.show(true)           // true = don't steal focus
      terminal.sendText(cmd[msg.language] ?? `node "${filePath}"`)
      break
    }

    case 'create-file': {
      const uri = vscode.Uri.file(path.join(folder, msg.name))
      await vscode.workspace.fs.writeFile(uri, Buffer.from(msg.content, 'utf8'))
      // Open the new file in a split editor beside the lesson
      await vscode.window.showTextDocument(uri, {
        viewColumn: vscode.ViewColumn.Beside,
        preserveFocus: true
      })
      break
    }

    case 'open-file': {
      const uri = vscode.Uri.file(path.join(folder, msg.path))
      await vscode.window.showTextDocument(uri)
      break
    }

    case 'notify': {
      vscode.window.showInformationMessage(msg.message)
      break
    }

    case 'save-openmat': {
      // Handled per-panel in OpenMatEditorProvider
      break
    }
  }
}

// ── Build HTML ─────────────────────────────────────────────────────────────────
function buildHtml(
  webview: vscode.Webview,
  distPath: string,
  initialRoute: string,
  injectedData?: Record<string, unknown>
): string {
  let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8')

  // Rewrite /assets/... src and href to webview URIs (VS Code security requirement)
  html = html.replace(
    /(src|href)="(\/[^"]+)"/g,
    (_, attr, p) =>
      `${attr}="${webview.asWebviewUri(vscode.Uri.file(path.join(distPath, p)))}"`
  )

  // Inject the initial route and any extra data before </head>
  const injection = `
    <script>
      window.__VSCODE_INITIAL_ROUTE__ = ${JSON.stringify(initialRoute)};
      window.__VSCODE_DATA__ = ${JSON.stringify(injectedData ?? {})};
    </script>
  `
  return html.replace('</head>', injection + '</head>')
}
```

---

### Phase 5 — Route injection in React app (15 min)

The extension injects `window.__VSCODE_INITIAL_ROUTE__` so the app opens on the
right page. Read it once in the router:

**`src/main.jsx` or `src/App.jsx`:**
```jsx
import { platform } from './utils/platform.js'

// If running inside VS Code, start at the injected route
const initialRoute = platform.isVSCode
  ? (window.__VSCODE_INITIAL_ROUTE__ ?? '/')
  : undefined

// Pass to your router:
<HashRouter>
  {initialRoute && <Navigate to={initialRoute} replace />}
  <Routes>...</Routes>
</HashRouter>
```

---

### Phase 6 — Build scripts (10 min)

**Root `package.json` — add these scripts:**
```json
{
  "scripts": {
    "build":         "vite build",
    "build:ext":     "npm run build && cd vscode-extension && npm run compile:ext",
    "package:ext":   "npm run build:ext && cd vscode-extension && npx vsce package",
    "publish:ext":   "npm run build:ext && cd vscode-extension && npx vsce publish",
    "dev:ext":       "code --extensionDevelopmentPath=$(pwd)/vscode-extension"
  }
}
```

**`vscode-extension/tsconfig.json`:**
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "out",
    "lib": ["ES2020"],
    "strict": true,
    "rootDir": "."
  },
  "include": ["extension.ts"]
}
```

---

## What Works Immediately (Without Extra Work)

| Feature | Web | Extension |
|---|---|---|
| All courses and lessons | ✅ | ✅ Same bundle |
| Markdown + KaTeX rendering | ✅ | ✅ |
| OpenMAT engine | ✅ | ✅ Pure JS, runs in webview |
| Firebase auth + progress sync | ✅ | ✅ Same Firebase |
| Ada AI (WebLLM) | ✅ | ✅ Electron = Chromium, WebGPU works |
| Pyodide (Python) | ✅ | ✅ WASM works in Electron webviews |
| Run code | Pyodide/sandbox | **Real terminal** ← better |
| Download file | Browser download | **Real workspace file** ← better |
| Report Bug | Firestore | Same Firestore |

---

## What Changes Per Context

| Action | Web behaviour | VS Code behaviour |
|---|---|---|
| App chrome | TopBar + own Sidebar | Hidden — VS Code provides these |
| "▶ Run" | Pyodide / JS sandbox | `terminal.sendText(...)` |
| "↓ Download/To workspace" | Browser download or internal | `workspace.fs.writeFile(...)` |
| New file appears | Internal editor tabs | VS Code Explorer sidebar |
| Output | Internal terminal pane | VS Code integrated terminal |

---

## Update Flow (One Codebase)

```
Developer adds a course or fixes a bug in src/
  │
  ├─── npm run build
  │       └── dist/  (web app)
  │
  ├─── Web deployment (Firebase Hosting / Vercel)
  │       └── Users get it immediately
  │
  └─── npm run publish:ext
          └── Marketplace update → VS Code auto-updates the extension
```

No separate course porting. No duplicate content. One fix, two outputs.

---

## Testing the Extension Locally

1. `npm run build:ext` — builds the web app + compiles the extension
2. Open `vscode-extension/` folder in VS Code
3. Press `F5` — opens a new VS Code window with the extension loaded
4. Click the UpSkillOS icon in the activity bar

Or from the repo root:
```bash
npm run dev:ext
```

---

## Publishing

```bash
# First time: create publisher account at marketplace.visualstudio.com
npx vsce create-publisher upskillos

# Package and publish
npm run publish:ext
```

Works on: VS Code, Cursor, Windsurf, VSCodium, any VS Code fork.

---

## File Checklist

Files to **create**:
- [ ] `src/utils/platform.js`
- [ ] `vscode-extension/extension.ts`
- [ ] `vscode-extension/package.json`
- [ ] `vscode-extension/tsconfig.json`
- [ ] `vscode-extension/assets/icon.svg`

Files to **modify** (small changes only):
- [ ] `src/components/layout/AppShell.jsx` — hide chrome in VS Code
- [ ] `src/components/docs/WorkspaceTerminal.jsx` — real terminal in VS Code
- [ ] `src/components/docs/DocsCodeWorkspace.jsx` — workspace file creation
- [ ] `src/main.jsx` or `src/App.jsx` — initial route injection
- [ ] `package.json` (root) — add build scripts

Files that **do not change**:
- Everything in `src/content/` (all courses)
- All lesson components
- OpenMAT engine
- Ada / useStudioAI
- Firebase / AuthContext
- ProgressContext
- All pages and tools

---

## Estimated Build Time

| Phase | What | Time |
|---|---|---|
| 1 | platform.js | 30 min |
| 2 | App shell changes | 20 min |
| 3 | Extension manifest | 15 min |
| 4 | Extension host (extension.ts) | 60 min |
| 5 | Route injection | 15 min |
| 6 | Build scripts | 10 min |
| **Total** | | **~2.5 hours** |

A working prototype that opens lessons in VS Code and runs code in the real
terminal can be built in a single session.
