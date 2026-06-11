# Lesson 16 — Multi-File Project Blocks

## What You Will Build

A code block with ` ```python project ``` ` shows a tab bar with multiple file tabs.
The markdown author writes multiple files in a single fenced block using `# file:` boundary
comments. The student edits each file in a separate Monaco editor and clicks a single Run
button that executes the entry point. The tab bar, the editor switching, and the file
boundary parser all exist in this lesson. Execution across files arrives in Lesson 17.

---

## What You Need to Know First

- Lesson 9: Monaco editor, `editor.setValue`, `defaultValue` vs `value`, `editorRef`
- Lesson 4: the `components` override in `ChapterView`, the `meta` field of a code node
- Lesson 10: the storage key design, `blockIndex`, persistence per file

---

## The Lesson

### Step 1 — The Project Block Syntax

A project block is a fenced code block with `project` in the meta string:

````markdown
```python project
# file: main.py
from utils import greet
greet("world")

# file: utils.py
def greet(name):
    print(f"Hello, {name}!")
```
````

The meta string is everything after the language name in the opening fence: `python project`
has language `python` and meta `project`. React-markdown exposes this in the `node.data.meta`
field of the code node (when `remark-mdx` or a custom plugin processes it — see Step 3).

**Design decisions:**
- `# file: filename.ext` is the boundary marker. It uses the target language's single-line
  comment syntax, so the block is valid code even before the project parser runs.
- The first file is the entry point. To run `main.py`, the executor receives the files in
  order with `main.py` first.
- An unnamed section before the first `# file:` marker is treated as the entry point named
  `main.py` (or `main.js`, `main.ts`, etc., based on language).

### Step 2 — The File Parser in Core

In `packages/core/src/parseProjectBlock.ts`:

```typescript
export interface ProjectFile {
  readonly name: string
  readonly content: string
}

export interface ParsedProject {
  readonly language: string
  readonly files: ProjectFile[]
  readonly entryFile: string
}

const FILE_MARKER_REGEX = /^#\s*file:\s*(.+)$/m

export function parseProjectBlock(
  language: string,
  rawContent: string
): ParsedProject {
  const lines = rawContent.split('\n')
  const files: ProjectFile[] = []
  let currentFileName: string | null = null
  let currentLines: string[] = []

  const defaultEntryName = getDefaultEntryName(language)

  function flushCurrentFile() {
    if (currentFileName === null && currentLines.some(l => l.trim().length > 0)) {
      currentFileName = defaultEntryName
    }
    if (currentFileName !== null) {
      files.push({
        name: currentFileName,
        content: currentLines.join('\n').trimEnd(),
      })
      currentFileName = null
      currentLines = []
    }
  }

  for (const line of lines) {
    const markerMatch = FILE_MARKER_REGEX.exec(line)
    if (markerMatch) {
      flushCurrentFile()
      currentFileName = markerMatch[1].trim()
    } else {
      currentLines.push(line)
    }
  }

  flushCurrentFile()

  const entryFile = files[0]?.name ?? defaultEntryName

  return { language, files, entryFile }
}

function getDefaultEntryName(language: string): string {
  const defaults: Record<string, string> = {
    python: 'main.py', py: 'main.py',
    javascript: 'main.js', js: 'main.js',
    typescript: 'main.ts', ts: 'main.ts',
    c: 'main.c', cpp: 'main.cpp',
  }
  return defaults[language] ?? 'main.txt'
}
```

**CS lens:** `parseProjectBlock` is a **scanner** — a function that reads a sequence of
tokens (lines) and accumulates state (the current file name and lines). It is a simplified
lexer: every line is either a file boundary marker or code content. The lexer has two states:
"building a file body" and "starting a new file after a marker." This is a finite state
machine with two states and two transitions.

**SE lens:** The `flushCurrentFile` inner function captures the mutable state (`currentFileName`,
`currentLines`) without needing parameters. This is a **closure** — a function that closes
over variables in its enclosing scope. Closures are the correct tool for inner helper
functions that share state with the parent function, as long as the function is not
exported. Exported functions should not close over mutable state (it creates hidden dependencies).

**Walkthrough:**
Given:
```
# file: main.py
from utils import greet
greet("world")

# file: utils.py
def greet(name):
    print(f"Hello, {name}!")
```

1. Line `# file: main.py` → regex matches → `flushCurrentFile()` (nothing to flush yet)
   → `currentFileName = 'main.py'`
2. Lines `from utils import greet` and `greet("world")` → push to `currentLines`
3. Line `# file: utils.py` → regex matches → `flushCurrentFile()` → push `{ name: 'main.py', content: '...' }` → `currentFileName = 'utils.py'`
4. Lines `def greet(name):` and `    print(...)` → push to `currentLines`
5. End of loop → `flushCurrentFile()` → push `{ name: 'utils.py', content: '...' }`
6. Result: `files = [{ name: 'main.py', ... }, { name: 'utils.py', ... }]`, `entryFile = 'main.py'`

### Step 3 — Detecting the `project` Meta in ChapterView

`react-markdown` passes the raw meta string to the `code` component's `node.data.meta`.
The `remark-mdx` plugin is not needed — the meta string is already available.

In `ChapterView.tsx`'s `code` override:

```typescript
code({ node, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className ?? '')
  const language = match ? match[1] : undefined
  const codeText = String(children).replace(/\n$/, '')
  const meta: string = (node?.data?.meta as string) ?? ''
  const isProject = meta.includes('project')

  const isBlock = node?.position !== undefined &&
    node.position.start.line !== node.position.end.line

  if (isBlock) {
    const currentIndex = blockIndexRef.current++

    if (isProject && language !== undefined) {
      return (
        <ProjectBlock
          language={language}
          rawContent={codeText}
          chapterFilePath={chapter.filePath}
          blockIndex={currentIndex}
          onRun={async (lang, files) => window.codexAPI.executeProject?.(lang, files)}
        />
      )
    }

    return (
      <CodeBlock
        language={language}
        chapterFilePath={chapter.filePath}
        blockIndex={currentIndex}
        onRun={async (lang, code) => window.codexAPI.executeCode(lang, code)}
      >
        {codeText}
      </CodeBlock>
    )
  }
  // ... inline code
}
```

**`node?.data?.meta` explained:**
`node` is the rehype AST node for the code element. `data` is an optional property that
some remark plugins use to store parsed metadata. `meta` is the raw string after the
language name in the fenced code block opening. For ` ```python project ``` `, `meta`
is `'project'`. For ` ```python ``` ` (no meta), `meta` is `undefined` or `''`.

### Step 4 — The ProjectBlock Component

In `packages/renderer/src/ProjectBlock.tsx`:

```typescript
import React, { useRef, useState, useCallback } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type * as monaco from 'monaco-editor'
import { parseProjectBlock, type ProjectFile } from '@codex/core'
import { saveEdit, loadEdit, makeChapterId, makeContentHash, type StorageKey } from './codePersistence'

interface ProjectBlockProps {
  readonly language: string
  readonly rawContent: string
  readonly chapterFilePath: string
  readonly blockIndex: number
  readonly onRun?: (language: string, files: ProjectFile[]) => Promise<ExecutionResult>
}

export function ProjectBlock({
  language, rawContent, chapterFilePath, blockIndex, onRun
}: ProjectBlockProps) {
  const parsed = parseProjectBlock(language, rawContent)
  const [activeFileIndex, setActiveFileIndex] = useState(0)

  const editorRefs = useRef<Map<string, monaco.editor.IStandaloneCodeEditor>>(new Map())
  const [runState, setRunState] = useState<RunState>({ status: 'idle' })

  const chapterId = makeChapterId(chapterFilePath)

  function getInitialContent(file: ProjectFile, fileIndex: number): string {
    const key: StorageKey = {
      chapterId,
      blockIndex: blockIndex * 100 + fileIndex,
      contentHash: makeContentHash(file.content),
    }
    return loadEdit(key) ?? file.content
  }

  function handleEditorMount(fileName: string, fileIndex: number): OnMount {
    return (editor) => {
      editorRefs.current.set(fileName, editor)
      editor.onDidChangeModelContent(() => {
        const file = parsed.files[fileIndex]
        if (!file) return
        const key: StorageKey = {
          chapterId,
          blockIndex: blockIndex * 100 + fileIndex,
          contentHash: makeContentHash(file.content),
        }
        const currentCode = editor.getValue()
        if (currentCode !== file.content) {
          saveEdit(key, currentCode)
        }
      })
    }
  }

  async function handleRun() {
    if (runState.status === 'running' || onRun === undefined) return

    const currentFiles: ProjectFile[] = parsed.files.map(file => ({
      name: file.name,
      content: editorRefs.current.get(file.name)?.getValue() ?? file.content,
    }))

    setRunState({ status: 'running' })
    const result = await onRun(language, currentFiles)
    setRunState({ status: 'done', ...result })
  }

  const activeFile = parsed.files[activeFileIndex]

  return (
    <div style={{ marginBottom: '1rem', border: '1px solid #1a1a3e', borderRadius: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#161b22', padding: '0 0.75rem', borderRadius: '6px 6px 0 0' }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          {parsed.files.map((file, index) => (
            <button
              key={file.name}
              onClick={() => setActiveFileIndex(index)}
              style={{
                padding: '0.375rem 0.75rem',
                background: activeFileIndex === index ? '#0d1117' : 'transparent',
                color: activeFileIndex === index ? 'white' : '#888',
                border: 'none',
                borderBottom: activeFileIndex === index ? '2px solid #58a6ff' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              {file.name}
            </button>
          ))}
        </div>
        <button
          onClick={handleRun}
          disabled={runState.status === 'running'}
          style={{ padding: '0.25rem 0.75rem', background: '#0f3460', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', margin: '0.25rem 0' }}
        >
          {runState.status === 'running' ? 'Running…' : '▶ Run'}
        </button>
      </div>

      {parsed.files.map((file, index) => (
        <div key={file.name} style={{ display: activeFileIndex === index ? 'block' : 'none' }}>
          <Editor
            height={computeEditorHeight(file.content)}
            defaultLanguage={MONACO_LANGUAGE_MAP[language] ?? 'plaintext'}
            defaultValue={getInitialContent(file, index)}
            theme="vs-dark"
            onMount={handleEditorMount(file.name, index)}
          />
        </div>
      ))}

      {runState.status === 'done' && (
        <OutputPanel stdout={runState.stdout} stderr={runState.stderr} exitCode={runState.exitCode} language={language} />
      )}
    </div>
  )
}
```

**`display: none` vs unmounting for tab switching:**
Each file has its own Monaco editor. When the active tab changes, we hide inactive editors
with `display: none` rather than unmounting them. If we unmounted them, each editor's
undo history, cursor position, and selection would be lost when switching tabs. With
`display: none`, the editors remain mounted — their state is preserved — but they are
not visible.

**`blockIndex * 100 + fileIndex` for storage keys:**
The storage key uses `blockIndex * 100 + fileIndex` to create a unique sub-key for each
file within a project block. Multiplying by 100 ensures there is no collision between
`blockIndex=1, fileIndex=2` (key `102`) and `blockIndex=12, fileIndex=0` (wait — `1200`,
not `102`). For reasonable lesson sizes (< 100 blocks, < 100 files per block) this is
collision-free.

---

## Connect the Pieces

The `ProjectFile[]` type returned by `parseProjectBlock` is exactly what `LocalExecutor`
(Lesson 17) will write to disk as multiple temp files. The tab bar is a visual layer over
the data structure — the files array drives both the UI and the execution.

The `editorRefs` Map from this lesson is the same pattern as the single `editorRef` in
`CodeBlock`, extended to multiple editors. The imperative pull model (read values when
Run is clicked) works identically for multiple editors.

---

## What Breaks Without This

If editors are unmounted when switching tabs (using conditional rendering `{activeFileIndex === index && <Editor ... />}`) rather than `display: none`, the editor's undo history is lost
every time the student switches tabs. Typing five lines, switching to the other file, and
switching back shows a fresh editor with the default content — the student's work is gone.
`display: none` preserves mounted components with their full internal state.

---

## Definition of Done

- [ ] A two-file project block shows two tabs
- [ ] Clicking between tabs switches the editor; each editor preserves its content
- [ ] Editing one file and switching to another file does not lose the first file's edits
- [ ] The Run button is present but shows an error message (execution is wired in Lesson 17)
- [ ] Persisted edits per file survive a page reload
- [ ] You can answer: what is a closure and why is `flushCurrentFile` one?
- [ ] You can answer: why is `display: none` used instead of conditional rendering?
- [ ] `git commit` with a message explaining why
