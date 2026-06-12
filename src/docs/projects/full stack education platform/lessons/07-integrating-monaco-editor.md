# Lesson 07 — Integrating a Complex Third-Party Library

## What You Will Build

Drop Monaco Editor — the same editor that powers VS Code — into the Lessons screen.
The lesson screen shows a code editor with syntax highlighting, line numbers, and
bracket matching. Users can type code in the editor. The output of typing is visible
immediately. By the end, the Lessons screen looks and functions like a real code editor.

---

## What You Need to Know First

- Lesson 03: React components, props
- Lesson 05: The Lessons screen
- Lesson 08 (forward reference): state management will wire the editor to lesson content

---

## The Lesson

### Step 1 — What a Text Editor Actually Is

Before integrating Monaco, understand what it does computationally.

A code editor is built from three subsystems:
1. **The buffer** — a data structure that holds the document's text. For a large file,
   a naive approach (one giant string) is too slow for edits: inserting a character in
   the middle requires copying everything after it. Monaco uses a **piece tree** — a
   tree of spans that makes insertions and deletions O(log n) instead of O(n).
2. **The cursor** — a position in the buffer: a line number and column. Multiple cursors
   (a feature of VS Code) are multiple cursor positions managed simultaneously.
3. **The renderer** — draws the visible text. Only the visible lines are drawn; lines
   above and below the visible area are not rendered. This is **virtual rendering** (or
   windowing): a key optimisation for large files.

**Syntax highlighting** is a form of lexing: the editor tokenises the code (runs a
lexer over it) and assigns a colour token type to each token. `function` gets a
keyword colour; a string literal gets a string colour. This is the same process as
a compiler's first stage — but the output is colours rather than an AST.

**CS lens — event-driven programming:**
Monaco is an **event-driven** system. It does not poll for changes — instead, it emits
events when things happen: `onChange` when the content changes, `onMount` when the
editor loads, `onDidChangeCursorPosition` when the cursor moves.

What is an event? An event is a notification that something happened, with data about
what happened. What is an event handler? A function that is called when the event fires.

**The event loop:** JavaScript is single-threaded — only one piece of code runs at a
time. The **event loop** manages what runs next. When no user code is running, the loop
waits. When a user types a key, an `onChange` event is queued. The loop picks it up
and calls the registered handler. When the handler finishes, the loop picks up the next
event. This means long-running synchronous code (a slow `for` loop) blocks the UI —
while your code runs, the event loop cannot process user input or render updates.

### Step 2 — Integration vs Implementation

**When to build vs when to use a library:**
A code editor is hundreds of thousands of lines of carefully tested code. Building one
would take years. The decision criteria:
- **Complexity** — is this a core differentiator for your product, or a supporting capability?
  The lesson content and execution engine are core. The text editor is supporting.
- **Maintenance** — who maintains it over time? Using Monaco means Microsoft's team
  maintains it. Building it means you do.
- **Time** — how long would it take to build a comparable quality tool? Monaco: indefinitely.

**The adapter pattern:**
Wrapping Monaco in a `CodeEditor` component so the rest of your app does not depend on
Monaco directly is the **adapter pattern**: a component that translates between Monaco's
interface and your app's interface. If you later replace Monaco with CodeMirror, you
change `CodeEditor.tsx` and nothing else.

```
App code → CodeEditor component → Monaco library
App code knows nothing about Monaco's API surface
```

**SE lens:** The adapter pattern is the application of the **dependency inversion principle**:
high-level modules (your screens) should not depend on low-level modules (Monaco's API).
Both should depend on abstractions (the `CodeEditor` interface you define). The `CodeEditor`
component is the abstraction boundary.

### Step 3 — Installing Monaco

Monaco only works in a browser (it requires the DOM — the browser's document tree). In
React Native, you need the web renderer. Expo's `expo-web` target runs in a browser,
which supports Monaco.

```bash
$ npm install @monaco-editor/react
$ npm install monaco-editor
```

`@monaco-editor/react` — the official React wrapper. It handles:
- Lazy loading Monaco's large bundle on first use (not on app startup, saving initial load time)
- Mounting and unmounting the editor as components appear and disappear
- Forwarding React's `ref` system to Monaco's imperative API

`monaco-editor` — the underlying Monaco library (~5MB). `@monaco-editor/react` depends
on it. Installing both explicitly ensures version alignment.

**Why ~5MB matters:** The browser must download, parse, and execute this JavaScript
before the editor is usable. 5MB over a slow connection is several seconds. **Lazy loading**
defers this: the Monaco bundle is only fetched when the user navigates to a screen with
an editor, not when the app first loads. This is the first instance of a performance
pattern that will appear again in Lesson 26: load what you need, when you need it.

### Step 4 — Controlled vs Uncontrolled Components

Understanding this distinction is essential before writing the Monaco integration.

**Controlled component:** React owns the state. The component's value is always determined
by a prop; changes are reported via `onChange`. React re-renders on every change, and the
new prop value replaces the old one.

```typescript
function ControlledInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />
}
```

**Uncontrolled component:** The DOM (or library) owns the state. React does not drive
the content — it only reads the content imperatively when needed.

```typescript
function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null)
  const getValue = () => inputRef.current?.value ?? ''
  return <input ref={inputRef} />
}
```

**Monaco is uncontrolled.** Its internal document model is highly optimised and manages
thousands of operations per second. If React pushed state updates on every keystroke,
it would fight Monaco's internal model — the cursor would jump, undo history would
break, and the editor would be unusable.

The solution: Monaco owns its state. React reads it via `editor.getValue()` when needed
(the pull model — ask for the value only when you need it), rather than receiving it
on every keystroke (the push model).

**CS lens:** The push model (observable/callback) vs pull model (request/response)
is a fundamental distinction in system design. The event loop, WebSockets, and React
state are all push models. REST APIs, `localStorage`, and `useRef.current.getValue()`
are pull models. Neither is universally better — the choice depends on access patterns.

### Step 5 — `useRef` for Imperative Handles

`useRef` is a React hook that returns a mutable container `{ current: T }`. Unlike
`useState`, changing `ref.current` does not trigger a re-render. `useRef` has two uses:

1. **DOM references:** `const divRef = useRef<HTMLDivElement>(null)` — attached to an
   element via `ref={divRef}`, it gives direct access to the DOM node.
2. **Imperative handles:** `const editorRef = useRef<Editor | null>(null)` — stores
   a reference to a library's internal object so you can call its methods.

Monaco's `onMount` callback provides the editor instance. We store it in a `useRef`:

```typescript
const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

const handleMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
  editorRef.current = editor
}
```

After mounting, `editorRef.current.getValue()` reads the current code. `editorRef.current.setValue(newCode)` sets it. These are imperative operations — they reach into Monaco's internal model directly.

### Step 6 — The `CodeEditor` Component

Create `src/components/CodeEditor.tsx`:

```typescript
import { useRef } from 'react'
import MonacoEditor, { type OnMount } from '@monaco-editor/react'
import type * as monaco from 'monaco-editor'

interface CodeEditorProps {
  readonly defaultValue: string
  readonly language: string
  readonly height?: number
}

export interface CodeEditorHandle {
  getValue: () => string
}

export function CodeEditor({ defaultValue, language, height = 300 }: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 1.6,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      padding: { top: 12, bottom: 12 },
    })
  }

  return (
    <MonacoEditor
      height={height}
      defaultLanguage={language}
      defaultValue={defaultValue}
      theme="vs-dark"
      onMount={handleMount}
    />
  )
}
```

**`defaultValue` vs `value`:**
Using `defaultValue` sets the initial content once, then Monaco owns the state.
Using `value` makes Monaco controlled — React pushes the value on every render.
With `value`, every keystroke triggers a React render which pushes the current value
back to Monaco, which resets the cursor position to wherever React calculated it should
be. The editor becomes unusable. Always use `defaultValue` with Monaco.

**`height` with a default value:**
`height?: number` declares `height` as an optional prop (the `?` means optional).
`height = 300` in destructuring provides a default value when `height` is not passed.
`?: number` and `= 300` together mean: if you don't pass `height`, use 300.

**`OnMount` type:** `type OnMount` is a TypeScript type exported by `@monaco-editor/react`
that describes the signature of the mount callback. Declaring the type ensures
the callback receives the correctly-typed editor instance.

**`import type`:** `import type * as monaco from 'monaco-editor'` imports only the
TypeScript type definitions, not the runtime code. This imports nothing at runtime —
it only gives TypeScript access to Monaco's type declarations for annotation purposes.
Using `import type` prevents accidentally importing Monaco's runtime bundle in places
where only types are needed.

### Step 7 — Adding the Editor to the Lessons Screen

Update `src/screens/LessonsScreen.tsx`:

```typescript
import { StyleSheet, View, ScrollView } from 'react-native'
import { CodeEditor } from '../components/CodeEditor'
import { colors, spacing } from '../theme'

const STARTER_CODE = `function greet(name) {
  return "Hello, " + name
}

console.log(greet("World"))
`

export function LessonsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.editorContainer}>
        <CodeEditor
          defaultValue={STARTER_CODE}
          language="javascript"
          height={200}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  editorContainer: {
    margin: spacing.md,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
})
```

**`ScrollView` explained:** A regular `View` with `flex: 1` fills its container but does
not scroll. `ScrollView` is a scrollable container. When the content is taller than the
screen, the user can scroll to see it. For screens with variable-length content (lesson
prompts, code output), `ScrollView` is required.

---

## Connect the Pieces

The `CodeEditor` component's adapter role — wrapping Monaco's API into a simpler interface —
is the same pattern as the `Button` component wrapping `TouchableOpacity` in Lesson 03.
Both components hide complexity behind a simpler prop interface.

In Lesson 09, `editorRef.current.getValue()` will retrieve the code for execution. The
`useRef` handle established here is the exact bridge between the UI and the execution engine.

The lazy loading pattern used for Monaco (load on first need) appears in Lesson 07's
`React.lazy()` and in Lesson 26's performance optimisations. Loading code asynchronously
to avoid blocking the initial render is a universal web performance technique.

In production VS Code, Monaco is also the editor engine — the entire VS Code interface is
built around Monaco, exactly as this app builds its lesson interface around Monaco. The
difference is scale: VS Code wraps Monaco with language servers, extensions, and terminal
integration. Here, it is wrapped with a lesson engine and code executor.

---

## What Breaks Without This

If `value={currentCode}` replaces `defaultValue={defaultValue}` in the Monaco component,
the editor becomes controlled. Every keystroke: user types → React's `onChange` fires →
`setCurrentCode(newValue)` → React re-renders → `value={currentCode}` pushes new value →
Monaco resets cursor to position 0. The user types one character and the cursor jumps
to the beginning. The editor is completely unusable.

Without the adapter pattern, every screen that uses Monaco imports `@monaco-editor/react`
directly. If Monaco is later replaced with CodeMirror, every screen must change. With the
adapter, only `CodeEditor.tsx` changes.

---

## Definition of Done

- [ ] The Lessons screen shows a Monaco editor with the starter code
- [ ] Syntax highlighting works (keywords are coloured, strings are a different colour)
- [ ] The editor has line numbers visible on the left
- [ ] Typing in the editor works (characters appear as typed, cursor moves normally)
- [ ] `npm start` shows no TypeScript errors
- [ ] You can answer: what is the difference between controlled and uncontrolled components?
- [ ] You can answer: what is the adapter pattern and why does it apply to the `CodeEditor` component?
- [ ] You can answer: what does `useRef` do that `useState` does not?
- [ ] You can answer: why is lazy loading important for a 5MB library?
- [ ] `git commit` with a message explaining why — "Add Monaco editor to Lessons screen via CodeEditor adapter component"
