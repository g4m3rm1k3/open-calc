# Lesson 5 — The Run Button

## What You Will Build

Python and JavaScript code blocks gain a Run button in the top-right corner. Clicking it
shows the text `[Running Python…]` or `[Running JavaScript…]` directly below the code
block. No actual execution yet — that arrives in Lesson 6. This lesson is about two things:
(1) the code block contract — which languages get a button and which do not; (2) the
security model — what the system must do before executing any user-controlled code.

By the end, the visual contract between the student and the execution system is established
and visible.

---

## What You Need to Know First

- Lesson 4: `CodeBlock`, the `components` prop, language detection from `className`
- Lesson 2: IPC, preload script, `contextBridge`
- Lesson 1: the single responsibility principle, `contextIsolation`

---

## The Lesson

### Step 1 — The Code Block Contract

A "code block contract" is the specification for which languages produce a Run button
and which are static display only. This is a design decision, not a technical limitation.

**Runnable languages** are languages where running the code produces output a student
learns from. Seeing `Hello, world` appear below a code block teaches more than reading the
`print` statement.

**Static-only languages** are languages where running the content produces nothing meaningful
— or where the content is configuration, not code.

```typescript
// In packages/renderer/src/CodeBlock.tsx

export const RUNNABLE_LANGUAGES = new Set([
  'python', 'py',
  'javascript', 'js',
  'typescript', 'ts',
])

export const STATIC_LANGUAGES = new Set([
  'yaml', 'yml',
  'toml',
  'json',
  'dockerfile',
  'nginx',
  'text', 'plaintext',
  'markdown', 'md',
])
```

**CS lens:** A `Set` is a data structure that holds unique values and supports O(1)
membership testing — `RUNNABLE_LANGUAGES.has('python')` is constant time regardless of
how many languages are in the set. Contrast with an array: `RUNNABLE_LANGUAGES.includes('python')`
would be O(n) — it scans the array from the start until it finds a match. For a small
set like this the difference is immeasurable, but using `Set.has` communicates that we
are testing membership, not searching.

**SE lens:** The code block contract is a **specification** separate from the rendering code.
If it were a series of `if (language === 'python' || language === 'js' || ...)` conditions
scattered through `CodeBlock.tsx`, adding a new language would require finding and changing
every condition. As a named constant (`RUNNABLE_LANGUAGES`), adding a language is one change
in one place. This is the open/closed principle at the data level.

**Why `'py'` and `'python'` both appear:**
Markdown authors may write ` ```python ``` ` or ` ```py ``` ` — both are common conventions
for Python code blocks. The set handles both without requiring the author to use a specific
spelling.

### Step 2 — Security at the Point of Input

This is the first lesson in which user-controlled content will be sent for execution.
The contract requires full security treatment here, at first contact.

**The threat: code injection**

When a student edits a code block (which arrives in Lesson 9), they control the code that
is sent for execution. This is intentional — editing and re-running is the core learning
interaction. But "the student controls the code" has consequences:

A student could write:
```python
import os
os.system('rm -rf ~')
```

And click Run. This is not an attack — it is exactly what the system is designed to do.
The threat is not from the student themselves, but from content the student might
**open** from an untrusted source: a malicious curriculum file downloaded from the internet.

The principle that applies is **least privilege**: each part of the system should have
only the capabilities it needs to do its job.

**How the current architecture limits damage:**

1. `contextIsolation: true` (Lesson 1) — the renderer cannot call Node.js APIs directly.
   It can only call what the preload script exposes.
2. The execution API (Lessons 6–7) will spawn child processes, not `eval()`. A child
   process runs in a separate OS process — it cannot access Electron's memory, cannot
   send IPC messages, and cannot modify the app state.
3. A child process inherits the parent's privileges. If the app runs as a normal user,
   the child process also runs as a normal user — it cannot write to system directories.

**What this does not prevent:**

The child process runs with the user's full permissions. It can read and write any file
the user can read and write. It can make network connections. This is the correct trade-off
for a local development tool — more sandboxing (like a Docker container) would require
more infrastructure. Lesson 18 adds Docker sandboxing for the remote execution tier.

**The trust model for this lesson:**
We trust the user's own code. We do not trust code from unknown sources. The app does not
currently prevent a user from opening a curriculum folder containing malicious scripts.
This is documented here so a future lesson can address it, not silently assumed.

**XSS explained:**
XSS (Cross-Site Scripting) is an attack where malicious HTML or JavaScript is injected
through a user input field and the application renders it as code rather than text.
Example: a code block whose content contains `<script>alert('xss')</script>`.

`react-markdown` is safe against this because it escapes HTML by default — it renders the
script tag as literal text, not as an executable element. Our `CodeBlock` component uses
`dangerouslySetInnerHTML` for Shiki's output, but Shiki's output is generated from the
code block content by a trusted library — it contains only `<span>` elements with colour
styles.

### Step 3 — The Run Button UI

Extend `CodeBlock.tsx` to show a Run button for runnable languages:

```typescript
import React, { useEffect, useState } from 'react'
import { createHighlighter, type Highlighter } from 'shiki'

export const RUNNABLE_LANGUAGES = new Set([
  'python', 'py',
  'javascript', 'js',
  'typescript', 'ts',
])

export const STATIC_LANGUAGES = new Set([
  'yaml', 'yml', 'toml', 'json', 'dockerfile',
  'nginx', 'text', 'plaintext', 'markdown', 'md',
])

let shikiHighlighter: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (shikiHighlighter === null) {
    shikiHighlighter = createHighlighter({
      themes: ['github-dark'],
      langs: [
        'python', 'javascript', 'typescript', 'sql', 'bash',
        'json', 'yaml', 'css', 'html', 'markdown'
      ],
    })
  }
  return shikiHighlighter
}

type RunState =
  | { status: 'idle' }
  | { status: 'running'; language: string }

interface CodeBlockProps {
  readonly language: string | undefined
  readonly children: string
  readonly onRun?: (language: string, code: string) => void
}

export function CodeBlock({ language, children, onRun }: CodeBlockProps) {
  const [highlightedHTML, setHighlightedHTML] = useState<string | null>(null)
  const [runState, setRunState] = useState<RunState>({ status: 'idle' })

  const normalizedLanguage = language?.toLowerCase() ?? 'text'
  const isRunnable = RUNNABLE_LANGUAGES.has(normalizedLanguage)

  useEffect(() => {
    getHighlighter().then(highlighter => {
      const supportedLangs = highlighter.getLoadedLanguages()
      const langToUse = supportedLangs.includes(normalizedLanguage as never)
        ? normalizedLanguage
        : 'text'

      const html = highlighter.codeToHtml(children, {
        lang: langToUse,
        theme: 'github-dark',
      })
      setHighlightedHTML(html)
    })
  }, [children, normalizedLanguage])

  function handleRun() {
    if (!isRunnable || runState.status === 'running') return

    setRunState({ status: 'running', language: normalizedLanguage })
    onRun?.(normalizedLanguage, children)
  }

  return (
    <div style={{ position: 'relative', marginBottom: '1rem' }}>
      {isRunnable && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#0d1117',
            padding: '0.375rem 0.75rem',
            borderRadius: '6px 6px 0 0',
            borderBottom: '1px solid #1a1a3e',
          }}
        >
          <span style={{ color: '#888', fontSize: '0.75rem' }}>
            {normalizedLanguage}
          </span>
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

      {highlightedHTML === null ? (
        <pre
          style={{
            background: '#0d1117',
            padding: '1rem',
            borderRadius: isRunnable ? '0 0 6px 6px' : '6px',
          }}
        >
          <code>{children}</code>
        </pre>
      ) : (
        <div
          dangerouslySetInnerHTML={{ __html: highlightedHTML }}
          style={{
            borderRadius: isRunnable ? '0 0 6px 6px' : '6px',
            overflow: 'hidden',
          }}
        />
      )}

      {runState.status === 'running' && (
        <div
          style={{
            background: '#0d0d1a',
            border: '1px solid #1a1a3e',
            borderTop: 'none',
            padding: '0.75rem 1rem',
            borderRadius: '0 0 6px 6px',
            color: '#888',
            fontFamily: 'Menlo, Consolas, monospace',
            fontSize: '0.875rem',
          }}
        >
          {`[Running ${normalizedLanguage}…]`}
        </div>
      )}
    </div>
  )
}
```

**CS lens:** `RunState` is a discriminated union — a TypeScript type that can be one of
several shapes, each identified by a literal `status` field. `{ status: 'idle' }` and
`{ status: 'running'; language: string }` are the two shapes. TypeScript narrows the type
based on `runState.status`: inside `runState.status === 'running'`, TypeScript knows
`runState` has the `language` field; outside that check, it does not.

This is the same finite state machine (FSM) concept from Lesson 3's loading states, but
expressed more precisely using TypeScript's type system. The FSM has two states: `idle`
and `running`. The transition from `idle` to `running` happens in `handleRun`.

**SE lens:** `onRun?.(normalizedLanguage, children)` uses optional chaining on the
`onRun` prop. The `?` means: call `onRun` if it exists; do nothing if it is `undefined`.
This makes `onRun` optional — the `CodeBlock` component can be rendered without an
execution callback (for example, in tests or in a read-only view). The `CodeBlock` does
not know or care whether `onRun` is wired to a real executor or a test stub.

**`disabled` attribute explained:**
`disabled={runState.status === 'running'}` sets the HTML `disabled` attribute on the
button when running. A disabled button does not fire click events and is visually
greyed out. The `cursor: 'not-allowed'` style reinforces this visually.

### Step 4 — Connecting onRun in ChapterView

The `code` component override in `ChapterView.tsx` needs to pass `onRun` to `CodeBlock`:

```typescript
components={{
  code({ node, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className ?? '')
    const language = match ? match[1] : undefined
    const codeText = String(children).replace(/\n$/, '')

    const isBlock = node?.position !== undefined &&
      node.position.start.line !== node.position.end.line

    if (isBlock) {
      return (
        <CodeBlock
          language={language}
          onRun={(lang, code) => {
            console.log('Run requested:', lang, code.slice(0, 50))
          }}
        >
          {codeText}
        </CodeBlock>
      )
    }

    return (
      <code
        style={{
          fontFamily: 'Menlo, Consolas, monospace',
          fontSize: '0.875em',
          background: '#0f3460',
          padding: '0.125rem 0.375rem',
          borderRadius: '3px',
        }}
        {...props}
      >
        {children}
      </code>
    )
  }
}}
```

The `onRun` callback logs to the browser console for now. In Lesson 6 it will call
the execution API.

---

## Connect the Pieces

The `RUNNABLE_LANGUAGES` set is the single source of truth for which languages have
Run buttons. In Lesson 6, the executor will also consult this set to decide which
languages it accepts. In Lesson 13, the WASM executor adds languages to a different
set (`WASM_LANGUAGES`). The `FallbackExecutor` in Lesson 13 combines the sets.

The `RunState` discriminated union will grow to a third state (`{ status: 'done'; output: string[] }`)
in Lesson 6. The pattern established here — a typed FSM per code block — carries forward
through every execution lesson.

---

## What Breaks Without This

If the `disabled` attribute is omitted and the user clicks Run repeatedly before the
first run completes, `handleRun` is called multiple times. In Lesson 6, each call spawns
a new child process. The user sees multiple overlapping output streams. The outputs from
two simultaneous Python processes interleave — which line belongs to which run is
indeterminate. Disabling the button during execution prevents this race condition.

---

## Definition of Done

- [ ] Python and JavaScript code blocks show a `▶ Run` button; YAML and JSON do not
- [ ] Clicking `▶ Run` changes the button text to `Running…` and disables it
- [ ] Clicking `▶ Run` shows `[Running python…]` in the output area below the code
- [ ] The Run button appearance is correct for each state: idle (blue), running (grey)
- [ ] A YAML code block with a language label shows the language name but no Run button
- [ ] Browser console shows "Run requested: python" when a Python block's Run is clicked
- [ ] You can answer: why is `Set.has` used instead of `Array.includes`?
- [ ] You can answer: what is the difference between XSS and code injection, and which
      threat applies here?
- [ ] `git commit` with a message explaining why
