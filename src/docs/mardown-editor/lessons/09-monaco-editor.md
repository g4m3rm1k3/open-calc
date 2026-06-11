# Lesson 9 — Monaco Editor

## What You Will Build

The plain `<pre>` display in code blocks is replaced by the Monaco editor — the same
editor used in VS Code. Students can edit code directly in the lesson. Bracket matching,
multi-cursor editing, and syntax highlighting in the editor all work. Typing in the editor
and clicking Run uses the edited code, not the original. The original code from the
markdown file is still available (the Reset button, added in Lesson 10, restores it).

---

## What You Need to Know First

- Lesson 4: `CodeBlock`, `dangerouslySetInnerHTML`, Shiki
- Lesson 5: `RUNNABLE_LANGUAGES`, `onRun`, the `RunState` FSM
- Lesson 6: `ExecutionResult`, the execution pipeline

---

## The Lesson

### Step 1 — What Monaco Is

Monaco is Microsoft's open-source code editor — the core of VS Code, published as a
standalone library. It provides:
- A rich text editing model (undo/redo, multi-cursor, selection, clipboard)
- Language services: syntax highlighting, bracket matching, auto-indent
- Hover documentation (when a language server is connected — Lesson 23)
- A JavaScript API for reading and writing content programmatically

Monaco is heavier than a `<textarea>` — the library is ~5MB — but for a code learning
tool, the investment is correct. Students learn to edit code in an environment that
behaves exactly like the tools they will use professionally.

**Install Monaco:**

```
$ npm install @monaco-editor/react
$ npm install monaco-editor
```

`@monaco-editor/react` is the official React wrapper for Monaco. It handles:
- Lazy loading Monaco's large chunks on first use (not at app startup)
- Mounting and unmounting the editor as components are created and destroyed
- Forwarding React's ref system to Monaco's imperative API

`monaco-editor` is the underlying editor library. `@monaco-editor/react` depends on it.

### Step 2 — Controlled vs Uncontrolled Components

Understanding this distinction is essential before using Monaco.

**Controlled component:** React owns the state. The component's value is a prop; changes
are reported via an `onChange` prop. The parent always knows the current value.

```typescript
function ControlledInput({ value, onChange }: {
  value: string
  onChange: (value: string) => void
}) {
  return <input value={value} onChange={e => onChange(e.target.value)} />
}
```

**Uncontrolled component:** The DOM (or an external library) owns the state. React gets
a reference to the DOM node and reads the value imperatively.

```typescript
function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  function getValue() {
    return inputRef.current?.value ?? ''
  }

  return <input ref={inputRef} />
}
```

Monaco is an uncontrolled component. It maintains its own internal document model (an
`editor.ITextModel`). React does not drive Monaco's content — Monaco drives itself. When
you want to set Monaco's content programmatically, you call `editor.setValue(text)`. When
you want to read Monaco's current content, you call `editor.getValue()`.

**Why Monaco is uncontrolled:**
Monaco's document model is highly optimised. It tracks character-level changes, manages
undo/redo history, and supports thousands of operations per second. If React owned the
state and Monaco called `onChange` on every keystroke, React would re-render on every
character typed — potentially hundreds of times per second, each re-render destroying and
recreating the component. An uncontrolled Monaco editor updates its internal model directly,
with React notified only when you choose to read the value (e.g., when the student clicks Run).

**CS lens:** The uncontrolled component pattern is the **pull model**: the consumer asks
for the current state when it needs it. The controlled component pattern is the **push model**:
state changes are pushed to the consumer immediately. Monaco's performance requirements
demand the pull model.

### Step 3 — `useRef` for Imperative Handles

`useRef` returns a mutable container object `{ current: T }`. Unlike `useState`, updating
`ref.current` does not trigger a re-render. `useRef` is used for two purposes:

1. **DOM references:** `const divRef = useRef<HTMLDivElement>(null)` — attach to a DOM
   element via `ref={divRef}`. `divRef.current` is the DOM node.
2. **Imperative handles to external libraries:** `const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)` — store a reference to the Monaco editor instance.

```typescript
import React, { useRef, useState } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type * as monaco from 'monaco-editor'
```

The `OnMount` type describes the callback that fires when Monaco finishes loading.
`editor: monaco.editor.IStandaloneCodeEditor` is the editor instance — the imperative
handle we store in `editorRef`.

### Step 4 — The Updated CodeBlock Component

The code block now has two modes: **display mode** (Shiki highlighting, read-only, for
static languages and when execution is disabled) and **editor mode** (Monaco, for runnable
languages).

In `packages/renderer/src/CodeBlock.tsx`:

```typescript
import React, { useRef, useState } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type * as monaco from 'monaco-editor'
import { parsePythonError, parseNodeError, parseTypeScriptError } from './errorParser'

export const RUNNABLE_LANGUAGES = new Set([
  'python', 'py',
  'javascript', 'js',
  'typescript', 'ts',
])

const MONACO_LANGUAGE_MAP: Record<string, string> = {
  python:     'python',
  py:         'python',
  javascript: 'javascript',
  js:         'javascript',
  typescript: 'typescript',
  ts:         'typescript',
  sql:        'sql',
  bash:       'shell',
  sh:         'shell',
  yaml:       'yaml',
  yml:        'yaml',
  json:       'json',
  css:        'css',
  html:       'html',
}

type RunState =
  | { status: 'idle' }
  | { status: 'running' }
  | { status: 'done'; stdout: string[]; stderr: string[]; exitCode: number }

interface CodeBlockProps {
  readonly language: string | undefined
  readonly children: string
  readonly onRun?: (language: string, code: string) => Promise<ExecutionResult>
}

export function CodeBlock({ language, children, onRun }: CodeBlockProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [runState, setRunState] = useState<RunState>({ status: 'idle' })

  const normalizedLanguage = language?.toLowerCase() ?? 'text'
  const isRunnable = RUNNABLE_LANGUAGES.has(normalizedLanguage)
  const monacoLanguage = MONACO_LANGUAGE_MAP[normalizedLanguage] ?? 'plaintext'

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 1.6,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'off',
      padding: { top: 12, bottom: 12 },
      renderLineHighlight: 'none',
      hideCursorInOverviewRuler: true,
      overviewRulerBorder: false,
    })
  }

  async function handleRun() {
    if (!isRunnable || runState.status === 'running' || onRun === undefined) return

    const currentCode = editorRef.current?.getValue() ?? children

    setRunState({ status: 'running' })
    const result = await onRun(normalizedLanguage, currentCode)
    setRunState({
      status: 'done',
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
    })
  }

  const editorHeight = computeEditorHeight(children)

  return (
    <div style={{ marginBottom: '1rem' }}>
      {isRunnable && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#161b22',
            padding: '0.375rem 0.75rem',
            borderRadius: '6px 6px 0 0',
            borderBottom: '1px solid #1a1a3e',
          }}
        >
          <span style={{ color: '#888', fontSize: '0.75rem' }}>{normalizedLanguage}</span>
          <button
            onClick={handleRun}
            disabled={runState.status === 'running'}
            style={{
              padding: '0.25rem 0.75rem',
              background: runState.status === 'running' ? '#333' : '#0f3460',
              color: runState.status === 'running' ? '#888' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: runState.status === 'running' ? 'not-allowed' : 'pointer',
              fontSize: '0.75rem',
            }}
          >
            {runState.status === 'running' ? 'Running…' : '▶ Run'}
          </button>
        </div>
      )}

      <Editor
        height={editorHeight}
        defaultLanguage={monacoLanguage}
        defaultValue={children}
        theme="vs-dark"
        onMount={handleEditorMount}
        options={{
          readOnly: !isRunnable,
          lineNumbers: isRunnable ? 'on' : 'off',
          folding: false,
          glyphMargin: false,
          lineDecorationsWidth: isRunnable ? 10 : 0,
          lineNumbersMinChars: isRunnable ? 3 : 0,
        }}
      />

      {runState.status === 'done' && (
        <OutputPanel
          stdout={runState.stdout}
          stderr={runState.stderr}
          exitCode={runState.exitCode}
          language={normalizedLanguage}
        />
      )}
    </div>
  )
}

function computeEditorHeight(code: string): string {
  const lineCount = code.split('\n').length
  const lineHeight = 22.4
  const padding = 24
  const minHeight = 60
  const maxHeight = 600
  const height = Math.max(minHeight, Math.min(maxHeight, lineCount * lineHeight + padding))
  return `${height}px`
}
```

**`defaultValue` vs `value` in Monaco:**
`defaultValue` sets the initial content when the editor mounts. After mounting, Monaco
controls its own content — React does not push updates. Using `value` instead would make
Monaco controlled: React would set the content on every render, fighting against Monaco's
own edit history and causing cursor jumps.

Use `defaultValue` here. The edit history belongs to Monaco.

**`editorRef.current?.getValue() ?? children`:**
`editorRef.current` is `null` before Monaco mounts (e.g., if Run is clicked before the
editor loads). The optional chaining `?.getValue()` returns `undefined` in that case, and
`?? children` falls back to the original code from the markdown file. This is a defensive
pattern: never assume the editor is loaded when a user action triggers.

**`computeEditorHeight` explained:**
Monaco does not auto-size to its content — it requires an explicit height. We calculate
the height based on the line count: each line is approximately 22.4px tall (14px font ×
1.6 line height), plus 24px of padding. We clamp between 60px (minimum to show at least
two lines) and 600px (maximum before the editor becomes unusably tall).

**`readOnly: !isRunnable` explained:**
Static languages (YAML, JSON, Dockerfile) render in Monaco with `readOnly: true` — the
student can see the code and syntax highlighting but cannot edit it. The line numbers are
also hidden for static blocks (`lineNumbers: 'off'`) because line numbers are only useful
when the student is editing and debugging.

**Performance note — this is a hot path:**
Monaco fires an `onChange` event on every keystroke. If `onChange` were connected to
`setRunState` or any other state setter, React would re-render the entire `CodeBlock`
on every character typed. We deliberately do not connect `onChange` here. The editor's
content is read only when Run is clicked, via `editor.getValue()`. This is the pull model
in practice.

**CS lens:** `editorRef` is the **façade pattern** — a simplified interface to a complex
subsystem. The Monaco editor has hundreds of methods and options. We expose exactly two:
`getValue()` (get current code) and `updateOptions()` (configure the editor). Everything
else Monaco can do is accessible if needed, but we do not expose it as part of `CodeBlock`'s
contract.

### Step 5 — Shiki vs Monaco for Static Blocks

With Monaco installed, we use Monaco for both runnable and static code blocks. Shiki is
now only used for the initial render fallback (the placeholder while Monaco loads). Once
Monaco mounts, it handles all highlighting via its own language services.

Remove the Shiki `dangerouslySetInnerHTML` path from `CodeBlock`. The `Editor` component
from `@monaco-editor/react` handles all display. This simplifies the component: one code
path instead of two.

The module-level `shikiHighlighter` singleton can be removed from `CodeBlock.tsx`. Shiki
is no longer needed here. It remains available as a separate utility for other use cases
(e.g., server-side rendering of highlighted code).

---

## Security: The Editor Does Not Change What the Executor Receives

Monaco lets students edit the code before clicking Run. The security model from Lesson 06
still applies: `editor.getValue()` returns a string; that string is passed to the executor;
the executor runs it with the user's full permissions. The editor is purely a UI concern.
An edit that removes a `print()` call is no different, security-wise, from an edit that adds
`os.system("rm -rf ~/")`. The trust model is unchanged: run only code from curricula you
trust. The Monaco editor makes editing more ergonomic; it does not make execution safer.

---

## Connect the Pieces

The `editorRef.current?.getValue()` call in `handleRun` is the exact point where the
student's edited code enters the execution pipeline. Every lesson about execution
(Lessons 6, 7, 8) used `children` — the original code from the markdown file. From this
lesson forward, `getValue()` provides the actual code that runs.

In Lesson 10, `localStorage` persistence uses the same `getValue()` to save the student's
edits. In Lesson 23, `editorRef.current` is where language server diagnostics are attached.

---

## What Breaks Without This

If `defaultValue` is replaced with `value={children}`, Monaco becomes controlled. React
sets `value` on every render. The problem: every keystroke calls `onChange`, which
typically calls `setState`, which triggers a render, which sets `value` again. Monaco
receives the new value and repositions the cursor to the start. The result: typing in the
editor moves the cursor to the beginning of the file after every character. The editor
is unusable.

---

## Definition of Done

- [ ] Python, JavaScript, and TypeScript code blocks show the Monaco editor
- [ ] Typing in the editor and clicking Run uses the edited code
- [ ] YAML and JSON blocks show Monaco in read-only mode (no line numbers, no cursor)
- [ ] The editor height adjusts to the number of lines (short blocks are short; long ones are taller)
- [ ] Clicking Run after editing shows the output of the edited code
- [ ] After clicking Run with an error, the error is displayed below the editor
- [ ] You can answer: what is the difference between controlled and uncontrolled components?
- [ ] You can answer: why is `useRef` used instead of `useState` for the editor instance?
- [ ] `git commit` with a message explaining why
