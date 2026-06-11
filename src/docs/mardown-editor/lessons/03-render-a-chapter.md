# Lesson 3 — Render a Chapter

## What You Will Build

Clicking a chapter in the sidebar renders its full markdown content in the main area —
headings, paragraphs, bold text, italic text, inline code, fenced code blocks, blockquotes,
and lists. Code blocks are rendered as styled `<pre>` elements with a monospace font, but
without syntax highlighting yet (that arrives in Lesson 4). By the end of this lesson the
app is a functioning markdown reader.

---

## What You Need to Know First

- Lesson 1: monorepo structure, TypeScript, React components, `export`/`import`
- Lesson 2: `useState`, `useCallback`, IPC, the `Chapter` type, file path handling

---

## The Lesson

### Step 1 — Reading a Chapter's Content

When the user clicks a chapter, we need its markdown content — a string. Right now we
have the `Chapter` object with its `filePath`. We need to read that file.

Add a new IPC channel to read a chapter's content. In `apps/electron/src/main.ts`,
inside `registerIpcHandlers`:

```typescript
ipcMain.handle('chapter:read', async (_event, filePath: string): Promise<string> => {
  const content = await readFile(filePath, 'utf-8')
  return content
})
```

Import `readFile` at the top of `main.ts`:

```typescript
import { readFile } from 'fs/promises'
```

**Why is `readFile` in `main.ts` and not in `@codex/core`?**

You might expect all file system access to live in `@codex/core`. That is the eventual
design — Lesson 11 moves this. For now, placing it directly in the IPC handler lets us
see the reading, the IPC, and the rendering all work before we introduce the `core`
abstraction layer. This is the lesson contract's rule: build what is visible before
building infrastructure that supports it.

Expose it in the preload script. In `apps/electron/src/preload.ts`:

```typescript
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('codexAPI', {
  openFolder: (): Promise<string | null> =>
    ipcRenderer.invoke('dialog:openFolder'),

  loadLibrary: (folderPath: string): Promise<unknown> =>
    ipcRenderer.invoke('library:load', folderPath),

  readChapter: (filePath: string): Promise<string> =>
    ipcRenderer.invoke('chapter:read', filePath),
})
```

Update the `Window` type declaration in `App.tsx`:

```typescript
declare global {
  interface Window {
    codexAPI: {
      openFolder: () => Promise<string | null>
      loadLibrary: (path: string) => Promise<Library>
      readChapter: (filePath: string) => Promise<string>
    }
  }
}
```

### Step 2 — What is `react-markdown`?

`react-markdown` is a library that takes a markdown string and returns React elements.
It parses the markdown into an **abstract syntax tree** (AST), then traverses the tree
and converts each node to a React component.

**AST explained (first appearance):**
An abstract syntax tree is a tree data structure that represents the structure of a piece
of text (or code) after it has been parsed. For a markdown document, the AST might look like:

```
Root
├── Heading (depth: 1)
│   └── Text "Introduction"
├── Paragraph
│   ├── Text "This is "
│   ├── Strong
│   │   └── Text "important"
│   └── Text "."
└── Code (fenced, language: "python")
    └── Value "print('hello')"
```

The parser reads the raw markdown string and produces this tree. The renderer walks the
tree and converts each node to a React element. `Heading` becomes `<h1>`, `Strong`
becomes `<strong>`, `Code` (fenced) becomes `<pre><code>`.

`react-markdown` does both: it parses the markdown and renders the tree. It uses the
**remark** ecosystem for parsing and **rehype** for HTML generation.

Install it:

```
$ npm install react-markdown
```

**What `npm install` just did:**
1. Downloaded `react-markdown` and all its dependencies from the npm registry
2. Added `"react-markdown": "^9.0.0"` (or current version) to `apps/electron/package.json`'s
   `dependencies` (because `react-markdown` is needed at runtime, not just during build)
3. Recorded the exact installed version in `package-lock.json`

Check `package-lock.json` is updated. This file must be committed — it ensures that a
colleague running `npm install` gets the same version you installed.

### Step 3 — The ChapterView Component

In `packages/renderer/src/ChapterView.tsx`:

```typescript
import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Chapter } from '@codex/core'

interface ChapterViewProps {
  readonly chapter: Chapter
  readonly onReadContent: (filePath: string) => Promise<string>
}

export function ChapterView({ chapter, onReadContent }: ChapterViewProps) {
  const [content, setContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    setContent(null)

    onReadContent(chapter.filePath)
      .then(text => {
        setContent(text)
        setIsLoading(false)
      })
      .catch(err => {
        setError(String(err))
        setIsLoading(false)
      })
  }, [chapter.filePath, onReadContent])

  if (isLoading) {
    return <div style={{ color: '#888', padding: '2rem' }}>Loading…</div>
  }

  if (error !== null) {
    return (
      <div style={{ color: '#e74c3c', padding: '2rem' }}>
        <strong>Could not load chapter</strong>
        <pre style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>{error}</pre>
      </div>
    )
  }

  return (
    <article style={{ padding: '2rem', color: 'white', maxWidth: '800px' }}>
      <ReactMarkdown>{content ?? ''}</ReactMarkdown>
    </article>
  )
}
```

**`useEffect` explained (first appearance):**
`useEffect` runs a side effect after a component renders. A "side effect" is anything that
reaches outside the component's own render cycle: network requests, file reads, subscriptions,
timers, direct DOM manipulation.

`useEffect(fn, [chapter.filePath, onReadContent])` — the second argument is the **dependency
array**. React runs `fn` after the first render and after any render where `chapter.filePath`
or `onReadContent` has changed. When the user clicks a different chapter, `chapter.filePath`
changes, `useEffect` runs again, and the new content is fetched.

**Why `useEffect` and not just calling `onReadContent` in the function body?**
Calling an async function directly inside a render function causes React to call it on every
render — including renders triggered by `setContent` inside the same call. This is an
infinite loop. `useEffect` is the correct hook for running code in response to a change
without re-running on every render.

**The loading/error state machine:**
The component has three states:
1. Loading (`isLoading: true`) — content is being fetched
2. Error (`error !== null`) — the fetch failed
3. Loaded (`content !== null`) — ready to render

Resetting all three at the start of the effect (`setIsLoading(true)`, `setError(null)`,
`setContent(null)`) ensures the component is in the Loading state while the new chapter
loads, preventing old content from flashing while the new content arrives.

**CS lens:** This is a finite state machine (FSM). The component is always in exactly one
of three states: Loading, Error, or Loaded. Each state has a distinct visual representation.
Transitions between states are explicit: `setIsLoading`, `setError`, `setContent`. FSMs are
the correct model for UI state that has mutually exclusive conditions — they prevent
impossible states (like being both loading and errored at the same time) because only one
state flag is active at a time.

In this implementation, we are approximating the FSM with three boolean/nullable fields.
A more precise implementation would use a discriminated union:

```typescript
type ContentState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; content: string }
```

That pattern eliminates impossible states entirely — TypeScript would reject any attempt
to represent both `status: 'loading'` and a content string simultaneously. We will use
this pattern in later lessons when state complexity warrants it.

**SE lens:** `ChapterView` accepts `onReadContent` as a prop rather than calling
`window.codexAPI.readChapter` directly. This is the **dependency injection** pattern:
the component declares what capability it needs (a function to read content), but does
not specify the source. In tests, you can pass a function that returns a hardcoded string.
In production, you pass `window.codexAPI.readChapter`. The component does not know the
difference — and that is the point.

**`Promise.then` and `.catch` explained:**
In the effect, we call `onReadContent(chapter.filePath)`, which returns a Promise.
`.then(text => ...)` registers a callback that runs when the Promise resolves successfully;
`text` is the resolved value.
`.catch(err => ...)` registers a callback that runs when the Promise rejects; `err` is
the rejection reason.

We use `.then`/`.catch` here instead of `async/await` because an `async` function inside
`useEffect` would require special handling (React ignores returned Promises from effects).

### Step 4 — Debugging React Errors

Before connecting `ChapterView` to `App`, learn to read React's error output.

**Which tools reveal React errors:**
1. **Browser console** (DevTools → Console, opened with `F12` or `Cmd+Option+I` on Mac) —
   shows runtime errors, warnings, and anything logged with `console.log`.
2. **React DevTools** (a browser extension) — shows the component tree, each component's
   props and state.
3. **Vite's terminal output** — shows TypeScript compile errors and import errors.

**Reading a React stack trace:**
When a component throws an unhandled error, React shows a red overlay (in development)
with a stack trace. The stack trace lists every function call active when the error occurred,
from most recent (top) to least recent (bottom).

```
TypeError: Cannot read properties of null (reading 'filePath')
    at ChapterView (ChapterView.tsx:12)
    at App (App.tsx:45)
    at div
    ...
```

This tells you:
- The error type: `TypeError`
- The error message: `Cannot read properties of null (reading 'filePath')`
- Where it happened: `ChapterView.tsx` line 12
- The call chain: `ChapterView` was rendered by `App`

Reading from top to bottom finds the first file you wrote — that is usually where
the bug is. Ignore the React internals below your code.

**Using the debugger:**
In Chrome or Electron's DevTools: Sources tab → find the file → click the line number
to set a **breakpoint**. When execution reaches that line, it pauses. You can see every
variable's current value in the right panel. This is more powerful than adding
`console.log` statements because you can inspect any variable without modifying code.

### Step 5 — Connecting ChapterView to App

In `packages/renderer/src/App.tsx`:

```typescript
import React, { useState, useCallback } from 'react'
import { Sidebar } from './Sidebar'
import { ChapterView } from './ChapterView'
import type { Chapter, Library } from '@codex/core'

declare global {
  interface Window {
    codexAPI: {
      openFolder: () => Promise<string | null>
      loadLibrary: (path: string) => Promise<Library>
      readChapter: (filePath: string) => Promise<string>
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

      <main style={{ flex: 1, overflow: 'auto' }}>
        {selectedChapter === null ? (
          <p style={{ padding: '2rem', color: '#888' }}>Select a chapter to begin.</p>
        ) : (
          <ChapterView
            chapter={selectedChapter}
            onReadContent={window.codexAPI.readChapter}
          />
        )}
      </main>
    </div>
  )
}
```

Update the `index.ts` barrel export in `packages/renderer/src/index.tsx`:

```typescript
export { App } from './App'
```

### Step 6 — Default Styling for Markdown Elements

`ReactMarkdown` renders semantic HTML elements — `<h1>`, `<p>`, `<strong>`, `<code>`,
`<pre>`, `<blockquote>`. Without CSS, these elements use the browser's built-in styles,
which are designed for light backgrounds. Since our app has a dark background, we need
to explicitly style the rendered markdown.

Add global styles to `apps/electron/src/renderer/index.html`:

```html
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #1a1a2e; font-family: system-ui, sans-serif; color: white; }

  article h1 { font-size: 2rem; margin-bottom: 1rem; line-height: 1.2; }
  article h2 { font-size: 1.5rem; margin: 1.5rem 0 0.75rem; }
  article h3 { font-size: 1.25rem; margin: 1.25rem 0 0.625rem; }
  article p  { line-height: 1.7; margin-bottom: 1rem; }
  article ul, article ol { padding-left: 1.5rem; margin-bottom: 1rem; }
  article li { line-height: 1.7; margin-bottom: 0.25rem; }
  article strong { font-weight: 600; }
  article em { font-style: italic; }
  article blockquote {
    border-left: 4px solid #0f3460;
    padding: 0.5rem 1rem;
    margin: 1rem 0;
    color: #aaa;
  }
  article code {
    font-family: 'Menlo', 'Consolas', monospace;
    font-size: 0.875em;
    background: #0f3460;
    padding: 0.125rem 0.375rem;
    border-radius: 3px;
  }
  article pre {
    background: #0d0d1a;
    border: 1px solid #1a1a3e;
    border-radius: 6px;
    padding: 1rem;
    overflow-x: auto;
    margin-bottom: 1rem;
  }
  article pre code {
    background: none;
    padding: 0;
    font-size: 0.875rem;
    line-height: 1.6;
  }
</style>
```

**Why global styles here and not inline styles in components?**
Inline styles (the `style={{ ... }}` pattern we used earlier) are scoped to a single element.
CSS selectors like `article h1` target elements anywhere inside an `<article>` element.
`ReactMarkdown` generates nested HTML that we do not control directly — we cannot add
`style` props to every `<h1>` it generates. CSS selectors let us style elements we do not
directly create.

---

## Connect the Pieces

The rendering pipeline is now complete for plain markdown:

```
File on disk
  → IPC: chapter:read
  → main process: readFile
  → IPC response: markdown string
  → ChapterView: receives string
  → ReactMarkdown: parses to AST, renders to React elements
  → DOM: styled HTML visible on screen
```

Lesson 4 adds syntax highlighting and math rendering by inserting plugins into the
ReactMarkdown pipeline — specifically between the parsing step (markdown → AST) and the
rendering step (AST → React elements).

---

## What Breaks Without This

If `useEffect`'s dependency array is `[]` (empty) instead of `[chapter.filePath, onReadContent]`,
the effect runs only once — on the first render. Clicking a different chapter in the sidebar
changes `selectedChapter` and re-renders `ChapterView`, but `useEffect` does not run again.
The content area never updates. The user is stuck on the first chapter they clicked.

This is one of the most common React bugs: a `useEffect` with a stale dependency array.
ESLint's `react-hooks/exhaustive-deps` rule catches it automatically — if you see a lint
warning about missing dependencies, this is the reason.

---

## Definition of Done

- [ ] Clicking a chapter renders its full markdown content
- [ ] Headings, paragraphs, bold, italic, code, and lists all render correctly
- [ ] Clicking a different chapter replaces the content (not appends)
- [ ] A "Loading…" indicator appears briefly while the content loads
- [ ] A chapter whose file has been deleted shows a clear error, not a crash
- [ ] You can answer: what is an AST and what does `react-markdown` do with one?
- [ ] You can answer: what does `useEffect`'s dependency array control?
- [ ] You can answer: how do you open browser DevTools in Electron?
- [ ] `git commit` with a message explaining why
