# Lesson 35 — Publishing and Final Review

## What You Will Build

The VS Code extension is packaged with `vsce` and published to the VS Code Marketplace.
The Electron app is rebuilt with code signing for macOS. The web app is deployed as a
static React app with a separate Express execution API server. Then: a complete trace of
the same user action through all three shells — the proof of the architecture decision
made in Lesson 1.

---

## What You Need to Know First

- Lesson 22: VS Code extension architecture
- Lesson 31: Electron packaging
- Lesson 12: Web shell, Express API
- All prior lessons — this is the final lesson

---

## The Lesson

### Step 1 — Publishing the VS Code Extension

**Install `vsce`:**
```bash
$ npm install -g @vscode/vsce
```

`vsce` (VS Code Extension manager) is the official CLI for packaging and publishing VS Code
extensions. It reads `package.json`, bundles the extension, and uploads it to the Marketplace.

**Prepare `package.json` for publication:**
An extension's `package.json` must include:

```json
{
  "name": "codex-lms",
  "displayName": "Codex",
  "description": "A local-first, markdown-driven, code-executing learning environment",
  "version": "1.0.0",
  "publisher": "your-publisher-id",
  "engines": { "vscode": "^1.85.0" },
  "categories": ["Education", "Other"],
  "repository": {
    "type": "git",
    "url": "https://github.com/yourname/codex"
  },
  "icon": "assets/icon.png"
}
```

`publisher` is your VS Code Marketplace publisher ID — created at
`marketplace.visualstudio.com`. Each publisher ID is unique. You must be logged in to
publish.

**The `.vscodeignore` file:**
`.vscodeignore` tells `vsce` which files to exclude from the packaged extension:

```
.vscode/
node_modules/
src/
tsconfig.json
.gitignore
*.map
**/*.ts
!out/**/*.js
```

The extension loads the compiled JavaScript in `out/` (or `dist/`), not the TypeScript
source. Source files are excluded to reduce the package size.

**Package the extension:**
```bash
$ vsce package
```

This produces a `.vsix` file (a ZIP archive with the extension manifest and code). Install
it locally for testing:
```bash
$ code --install-extension codex-lms-1.0.0.vsix
```

**Publish to the Marketplace:**
```bash
$ vsce publish
```

This uploads the `.vsix` to the VS Code Marketplace. The extension is reviewed
automatically (usually within minutes for code-only extensions) and becomes available
for installation from the Marketplace.

**What the Marketplace review checks:**
- The extension does not contain known malware signatures
- The `package.json` is well-formed
- The publisher ID exists and matches your login

There is no human review for code behaviour — the Marketplace relies on user reports and
automated scanning.

### Step 2 — Code Signing the Electron App

Code signing was introduced in Lesson 31. This step completes it.

**What signed apps provide:**
- macOS shows "Codex is a verified app from [Your Name]" instead of the security warning
- Windows shows the publisher name in the installation dialog instead of "Unknown Publisher"
- The OS can verify the app has not been tampered with after signing

**macOS notarisation:**
After signing, Apple recommends **notarisation** — submitting the app to Apple's servers
for automated malware scanning. After notarisation, macOS does not show any security
dialog at all. Without notarisation (but with signing), macOS shows a warning that can
be dismissed.

```bash
# Set environment variables with your Apple credentials
export APPLE_ID=your@email.com
export APPLE_ID_PASSWORD=app-specific-password
export APPLE_TEAM_ID=XXXXXXXXXX

# electron-builder handles signing and notarisation
$ npm run package
```

In `apps/electron/package.json`:

```json
"build": {
  "mac": {
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "entitlements.plist",
    "entitlementsInherit": "entitlements.plist",
    "notarize": {
      "teamId": "${APPLE_TEAM_ID}"
    }
  }
}
```

`hardenedRuntime: true` enables macOS Hardened Runtime — a security hardening feature
required for notarisation. It restricts what the app can do (e.g., it cannot load unsigned
dynamic libraries without explicit entitlements).

**`entitlements.plist`:**
The Hardened Runtime requires declaring exceptions for capabilities the app needs:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key><true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key><true/>
  <key>com.apple.security.cs.disable-library-validation</key><true/>
</dict>
</plist>
```

Electron requires these entitlements because it dynamically loads JavaScript (JIT
compilation) and native Node.js addons (unsigned libraries).

### Step 3 — Deploying the Web Shell

The web shell (Lesson 12) has two parts:
1. The React app — static HTML/CSS/JS files, served from a CDN or static host
2. The execution API — a Node.js Express server, must run on a server

**Option A — Split deployment:**
- Deploy the React app to Vercel, Netlify, or any static host. One command: `vercel deploy`.
- Deploy the Express API to a VPS (a Lesson 8 topic from the full-stack curriculum) or
  a container host (Railway, Fly.io, Render). The API runs `node server.js`.
- The React app calls the API at its deployed URL, configured via an environment variable:
  `VITE_API_URL=https://api.your-codex.com`

**Option B — Monolithic deployment:**
The Express server also serves the static React files:

```typescript
import path from 'path'
import express from 'express'

const app = express()

// Serve the React app
app.use(express.static(path.join(__dirname, '../renderer/dist')))

// API routes
app.post('/api/execute', handleExecute)

// Fallback to index.html for client-side routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../renderer/dist/index.html'))
})

app.listen(process.env['PORT'] ?? 3000)
```

For a learning project, Option B is simpler. Option A scales better under load (a CDN
can handle thousands of simultaneous readers; the API only handles Run clicks).

**The execution API requires Docker:**
The Docker execution tier (Lesson 18) requires Docker to be running on the server. A bare
VPS with Docker installed works. Serverless platforms (Vercel Functions, AWS Lambda) cannot
run Docker — they are sandboxed environments that do not have a Docker daemon. For the
web shell's execution, the server must be a persistent process with Docker available.

### Step 4 — Final Review: One Codebase, Three Shells

The architecture decision made in Lesson 1 — separating core, renderer, and executor into
packages, making shells thin — is now proven. Trace the same user action ("run a Python
code block") through all three shells:

```
Electron shell:
  Student presses Cmd+Enter in Monaco
    → CodeBlock.handleRun() [renderer package]
    → window.codexAPI.executeCode('python', code) [IPC call]
    → ipcMain handler in apps/electron/src/main.ts
    → LocalExecutor.execute({ language: 'python', code }) [executor package]
    → child_process.spawn('python3', [tempFile])
    → stdout lines → ipcRenderer.send('execute:output') → OutputPanel update
    → Promise resolves → setRunState({ status: 'done' })

Web shell:
  Student presses Cmd+Enter in Monaco
    → CodeBlock.handleRun() [SAME renderer package, unchanged]
    → fetch('/api/execute', { language, code }) [HTTP call]
    → Express POST /api/execute handler in apps/web/src/server.ts
    → FallbackExecutor.execute() [SAME executor package, unchanged]
      → Tier 1: LocalExecutor (if python3 available)
      → Tier 2: WASMExecutor/Pyodide (if not)
    → streaming: server-sent events → OutputPanel update
    → Response resolves → setRunState({ status: 'done' })

VS Code extension:
  Student presses Cmd+Enter in Monaco
    → CodeBlock.handleRun() [SAME renderer package, unchanged]
    → vscode.postMessage({ type: 'execute', language, code }) [extension IPC]
    → extension host message handler in extension/src/extension.ts
    → FallbackExecutor.execute() [SAME executor package, unchanged]
    → stdout lines → panel.webview.postMessage({ type: 'output', line }) → OutputPanel update
    → Completion message → setRunState({ status: 'done' })
```

In all three cases:
- `CodeBlock.handleRun()` is identical
- `OutputPanel` is identical
- `FallbackExecutor`, `LocalExecutor`, `WASMExecutor` are identical
- The `ExecutionResult` type is identical

Only the shell adapter changes: IPC vs HTTP vs `postMessage`. The renderer and executor
packages are reused without modification.

**What this means:**
A bug fix in `CodeBlock` fixes it in all three shells. A new language executor works in
all three shells. A UI improvement to the output panel appears in all three shells. The
cost of adding a feature is proportional to the feature's complexity, not to the number
of shells.

**What the architecture decision ruled out:**
If `CodeBlock` called `child_process.spawn` directly, it would work in Electron but fail
in the browser (browsers cannot spawn processes). If the web shell had its own duplicate
`CodeBlock` component, a bug fix would need to be applied in two places. The package
boundary — the `Executor` interface — is the decision that prevents this.

---

## What You Have Built

Working from a single markdown-driven curriculum file, you built:

1. **A monorepo** with shared packages across three applications
2. **A markdown renderer** with live code execution, syntax highlighting, and math
3. **Eight language executors**: Python, JavaScript, TypeScript, Go, C, Rust, SQL, Bash
4. **A four-tier fallback chain**: local → WASM → Docker → read-only
5. **File watching** that reloads chapters on save
6. **Keyboard shortcuts** and a command palette
7. **Theme switching** using React Context and CSS custom properties
8. **Streaming output** that shows results as they arrive
9. **Multi-file project blocks** with a virtual filesystem
10. **WASM runtimes** for Python, SQL, Lua, Ruby, C, Shell — no local installation needed
11. **A service worker** for offline execution
12. **Docker-backed execution** for Go and Rust in the web shell
13. **Progress tracking** with export/import
14. **Full-text search** across the library
15. **All of the above in three shells**: Electron, web app, VS Code extension

Every architectural pattern taught — strategy, chain of responsibility, observer, adapter,
command, registry — was used. Every pattern was named when first introduced and used again
in subsequent lessons. By Lesson 35, you have seen each pattern in multiple contexts.
That is how patterns become tools, not vocabulary.

---

## Connect the Pieces

Every lesson before this one built toward this one. The monorepo decision (Lesson 1)
made it possible for the VS Code extension and the web shell to share the renderer
without modification. The strategy pattern (Lesson 6) made it possible to add Go, C,
Rust, and SQL executors without touching the UI. The chain of responsibility (Lesson 13)
made it possible to fall back gracefully across four tiers.

This is the same architectural decomposition used by production platforms:
- **VS Code itself** separates the editor engine (Monaco), the language services (LSP
  servers), and the shell (Electron). The renderer package in Codex mirrors this.
- **React Native** uses a single component tree that renders to native iOS/Android widgets
  instead of DOM elements — the same pattern as Codex using one renderer across three shells.
- **Webpack and Vite** use an executor registry with one strategy per file type — the same
  pattern as Codex's language executor registry.

The architecture decision that felt abstract in Lesson 1 is now visible in three working
products. That is the only test that matters.

---

## What Breaks Without This

Without code signing, every macOS user who downloads the Electron app sees a Gatekeeper
warning: "Codex can't be opened because it is from an unidentified developer." Most users
treat this as a hard stop — they delete the app without reading the bypass instructions.
The distribution funnel collapses before the first person uses the product.

Without `vsce publish`, the VS Code extension must be installed via `.vsix` file — a
process that requires the user to know about the VS Code command palette and `--install-extension`.
Published extensions are one click in the Marketplace. Self-distributed extensions need
a 10-step README.

Without the final review trace, the student can build all three shells but cannot explain
why only the shell adapter changes. That understanding is the difference between a developer
who can maintain this codebase and one who can only follow it.

---

## Definition of Done

- [ ] `vsce package` produces a `.vsix` that installs and works in VS Code
- [ ] The Electron app is built with code signing (or signing is explicitly skipped for development)
- [ ] The web app is deployed and accessible at a public URL
- [ ] You can trace the "run a code block" action through all three shells verbatim
- [ ] You can name the exact files that differ across the three shells, and explain why
- [ ] You can name every architectural pattern used in the curriculum and where it appears
- [ ] `git commit` with a message explaining what this version delivers and why it is ready — "Ship v1.0: all three shells building, packaging complete" not "final lesson"
- [ ] `git tag v1.0.0` after the commit, then `git push --tags`
