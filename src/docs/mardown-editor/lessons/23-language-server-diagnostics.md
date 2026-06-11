# Lesson 23 — Language Server Diagnostics

## What You Will Build

TypeScript code blocks in the VS Code extension and Electron shell display diagnostic
errors — red squiggles under type errors, yellow squiggles under warnings. Hovering a
squiggle shows the error message. In VS Code, this is implemented by delegating to VS Code's
own language server (Pylance for Python, tsserver for TypeScript). In Electron, it is
implemented via Monaco's language client connected to a locally running language server.

---

## What You Need to Know First

- Lesson 22: VS Code extension architecture, webview, `panel.webview`
- Lesson 9: Monaco editor, `editorRef`, `editor.updateOptions`
- Lesson 4: the two lenses — this lesson is heavy on CS concepts

---

## The Lesson

### Step 1 — The Language Server Protocol (First Appearance)

**What a language server is:**
A language server is a background process that analyses code and answers queries about it.
It is the intelligence behind IDE features: "what are the type errors in this file?",
"what are all the usages of this function?", "what is the documentation for this method?".

Before the Language Server Protocol (LSP), IDE intelligence was tightly coupled to the
IDE. The VS Code TypeScript plugin and the IntelliJ TypeScript plugin were separate
implementations of the same analysis. A new language required implementations for every
IDE.

LSP decouples language intelligence from the editor. The protocol defines a standard
set of JSON-RPC messages. Any editor that speaks LSP can use any language server. The
language server does not know or care about the editor — it speaks a protocol.

**JSON-RPC explained:**
JSON-RPC is a protocol for calling remote procedures over a message channel. Each message
is a JSON object with three fields:
- `method`: the operation name (e.g., `"textDocument/completion"`)
- `params`: the arguments
- `id`: a request ID (for matching responses to requests)

The server sends a response with the same `id` and a `result` field. Notifications
(messages without responses) have no `id`.

**The LSP message flow:**
```
Editor                              Language Server
  │                                       │
  ├─ initialize {rootUri, capabilities} ─→│
  │←─ initialized ────────────────────────┤
  │                                       │
  ├─ textDocument/didOpen {uri, content} ─→│
  │←─ textDocument/publishDiagnostics ────┤
  │   (errors, warnings, hints)           │
  │                                       │
  ├─ textDocument/didChange {changes} ───→│
  │←─ textDocument/publishDiagnostics ────┤
  │                                       │
```

`publishDiagnostics` is **push-based**: the server sends diagnostics whenever it detects
a change, without being asked. The editor does not poll — it registers a handler and the
server notifies it.

**CS lens:** LSP is the **open/closed principle at the ecosystem level**. The TypeScript
language server (tsserver) was written once by Microsoft. It is used in VS Code, Vim
(via vim-lsp), Emacs (via eglot), Neovim, Sublime Text, and Codex. Adding support for
TypeScript to a new editor is implementing the LSP client interface — the server does not
change. Every editor that implements LSP benefits from every language that has an LSP server.

**SE lens:** LSP is a textbook example of the **Liskov Substitution Principle (LSP — yes,
same abbreviation)** at the protocol level. Any language server can be substituted for
any other language server, as long as both implement the protocol. From the editor's
perspective, tsserver and Pyright are identical — both speak the same protocol.

### Step 2 — Diagnostics in the VS Code Extension (Simple Path)

In the VS Code extension, we do not need to run a language server. VS Code already runs
Pylance and tsserver for the user's files. We can leverage these existing servers for
the webview's Monaco editor by registering the webview's content as virtual documents
in VS Code's workspace.

**The simpler approach for this lesson:**
When a student opens a TypeScript block in the webview, the extension host creates a
virtual document in VS Code:

```typescript
// In CodexPanel.ts

import * as vscode from 'vscode'

const virtualDocumentScheme = 'codex-virtual'

const virtualDocuments = new Map<string, string>()

const provider = vscode.workspace.registerTextDocumentContentProvider(
  virtualDocumentScheme,
  {
    provideTextDocumentContent: (uri: vscode.Uri) => {
      return virtualDocuments.get(uri.toString()) ?? ''
    }
  }
)

// When a code block's content changes, update the virtual document
// and get diagnostics from VS Code's language server:
async function updateVirtualDocument(blockId: string, language: string, code: string) {
  const uri = vscode.Uri.parse(`${virtualDocumentScheme}://${blockId}.${getExtension(language)}`)
  virtualDocuments.set(uri.toString(), code)

  const doc = await vscode.workspace.openTextDocument(uri)
  await vscode.languages.setTextDocumentLanguage(doc, language === 'ts' ? 'typescript' : language)

  const diagnostics = vscode.languages.getDiagnostics(uri)
  return diagnostics.map(d => ({
    message: d.message,
    severity: d.severity,
    startLine: d.range.start.line,
    startCharacter: d.range.start.character,
    endLine: d.range.end.line,
    endCharacter: d.range.end.character,
  }))
}
```

**`vscode.workspace.registerTextDocumentContentProvider` explained:**
This API lets extensions provide content for URIs with a custom scheme. We define the
`codex-virtual://` scheme. When VS Code needs to read a file with that URI, it calls our
`provideTextDocumentContent` function. VS Code's language servers treat these virtual
documents the same as real files — they analyse them, produce diagnostics, and publish them.

**`vscode.languages.getDiagnostics(uri)` explained:**
Returns the current diagnostics (errors, warnings, information, hints) for a given URI.
These are the diagnostics produced by all language servers that have analysed the document.
We serialise them and send them to the webview via `postMessage`.

The webview renders them as Monaco markers (red squiggles) using `editor.setModelMarkers`.

### Step 3 — Monaco Markers

In the webview's React app, when diagnostics arrive:

```typescript
window.addEventListener('message', ({ data }) => {
  if (data.type === 'DIAGNOSTICS') {
    const editor = editorRefs.get(data.blockId)
    if (!editor) return

    const model = editor.getModel()
    if (!model) return

    const markers: monaco.editor.IMarkerData[] = data.diagnostics.map((d: any) => ({
      severity: d.severity === 0
        ? monaco.MarkerSeverity.Error
        : monaco.MarkerSeverity.Warning,
      message: d.message,
      startLineNumber: d.startLine + 1,
      startColumn: d.startCharacter + 1,
      endLineNumber: d.endLine + 1,
      endColumn: d.endCharacter + 1,
    }))

    monaco.editor.setModelMarkers(model, 'codex', markers)
  }
})
```

**`monaco.editor.setModelMarkers` explained:**
`setModelMarkers(model, owner, markers)` sets the diagnostic markers on a Monaco model.
`model` is the `ITextModel` for the specific editor. `owner` is a string identifying the
source of the markers — using different owner strings lets multiple sources set markers
independently. Calling `setModelMarkers` with an empty array clears all markers from
that owner.

Markers become red or yellow squiggles in the editor, and hovering them shows the message.
Monaco's decoration system handles the rendering — we only provide the data.

**Line/column numbering:**
VS Code and LSP use 0-indexed lines and columns: the first line is line 0, the first
character is column 0. Monaco uses 1-indexed: the first line is line 1, the first column
is column 1. Adding 1 to both converts between the two conventions.

### Step 4 — Language Server in Electron (Monaco Language Client)

For the Electron shell, VS Code's language servers are not available. We run a language
server as a child process and connect Monaco to it via the `monaco-languageclient` library.

This is a more complex setup and is marked as an **advanced extension** to this lesson —
it requires:
1. Installing a language server (`pyright`, `typescript-language-server`)
2. Starting it as a child process from the Electron main process
3. Bridging its stdin/stdout to a WebSocket (for the renderer to connect)
4. Connecting Monaco to the WebSocket using `monaco-languageclient`

The full implementation is in the project's `apps/electron/src/languageServer.ts`. For
this lesson's definition of done, the VS Code extension path (Step 3) is sufficient.

The key CS/SE concept from this step applies regardless of the implementation path:

**CS lens:** The language server runs as a separate process. Monaco (a JavaScript library)
communicates with a native process (Pyright is a TypeScript program, tsserver is a
TypeScript program, Pylsp is a Python program) via a streaming protocol. The communication
channel (stdin/stdout or WebSocket) is transparent to both sides — the language server
does not know whether it is talking to VS Code, Monaco, or any other editor.

**SE lens:** Running the language server in a separate process is the **bulkhead pattern**
again. If the language server crashes, it does not crash Electron. If it is slow (analysing
a large codebase), it does not freeze the UI. The separation is both a safety mechanism
and a performance mechanism.

### Step 5 — Debounced Diagnostics

Diagnostics are expensive: every time the student types, the language server re-analyses
the file. We do not want to trigger analysis on every keystroke. The Monaco `onChange`
event fires on every character. We debounce the diagnostic update — wait 500ms after the
last change before sending the new content to the language server.

This is the same debounce pattern from Lesson 10 (code persistence), applied to a different
concern. The `useDebounce` hook from Lesson 10 is reused without modification.

```typescript
const debouncedDiagnosticsUpdate = useDebounce((code: string) => {
  vscodeApi.postMessage({
    type: 'UPDATE_VIRTUAL_DOC',
    blockId,
    language,
    code,
  })
}, 500)

// In handleEditorMount:
editor.onDidChangeModelContent(() => {
  debouncedDiagnosticsUpdate(editor.getValue())
})
```

**The connection between Lesson 10 and this lesson:**
The debounce pattern introduced in Lesson 10 for saving code to `localStorage` is being
applied a second time here for a different purpose — throttling language server requests.
The `useDebounce` function was written to be general-purpose (`useDebounce<T extends (...args: never[]) => void>`).
This is the open/closed principle: `useDebounce` is closed for modification and open for
use in new contexts. We are reusing it without touching it.

---

## Connect the Pieces

Language server diagnostics are the final feature that makes Codex a genuinely useful
learning tool rather than a text renderer. The student writes code, sees errors inline,
fixes them, and runs — the same workflow as a professional IDE, in a learning context.

The three shells now differ in how they provide diagnostics:
- VS Code extension: delegates to VS Code's existing language servers (no extra process)
- Electron: runs a child process language server, bridges via WebSocket
- Web: no language server (WASM-based type checking is theoretically possible but not
  implemented in this curriculum — it would require a WASM build of Pyright)

---

## What Breaks Without This

If `startLineNumber: d.startLine + 1` is written as `startLineNumber: d.startLine`
(forgetting the +1), every diagnostic marker appears one line above the actual error.
A type error on line 3 of a code block shows a squiggle on line 2. The student looks at
line 2 (which is fine) and is confused. The off-by-one error is invisible in casual
testing (the squiggle appears close to the right place) but misleading in real use.

---

## Definition of Done

- [ ] In the VS Code extension: a TypeScript code block with `const x: number = "hello"`
      shows a red squiggle under `"hello"` with the TypeScript error message
- [ ] Hovering the squiggle shows the error text
- [ ] Fixing the error removes the squiggle
- [ ] Diagnostics update within 600ms of stopping typing (500ms debounce + processing)
- [ ] A valid TypeScript block shows no squiggles
- [ ] You can answer: what is the Language Server Protocol and why does it exist?
- [ ] You can answer: what is the difference between `didChange` and `publishDiagnostics`
      in terms of push vs pull?
- [ ] You can answer: why are Monaco's line numbers 1-indexed but LSP's are 0-indexed?
- [ ] `git commit` with a message explaining why
