# Lesson 10 — Code Persistence

## What You Will Build

When a student edits a code block and closes the app, their edits are there when they
return. A Reset button per code block restores the original code from the markdown file.
Edits are saved automatically — no save button, no confirmation. The student focuses on
learning, not on file management.

---

## What You Need to Know First

- Lesson 9: Monaco editor, `editorRef`, `editor.getValue()`, `editor.setValue()`, `defaultValue`
- Lesson 1: The content model, `filePath`, `@codex/core`

---

## The Lesson

### Step 1 — What `localStorage` Is

`localStorage` is the browser's built-in key/value store. It persists data across sessions —
data stored before closing the app is still there after reopening it.

**Characteristics:**
- **String-only** — both keys and values must be strings. To store structured data (objects,
  arrays), serialise to JSON first.
- **Synchronous** — `localStorage.getItem`, `setItem`, `removeItem` are not Promises.
  They run immediately on the main thread.
- **Scoped to the origin** — in a browser, `localStorage` is isolated per `scheme + host + port`.
  In Electron, each `BrowserWindow` with `contextIsolation: true` has its own `localStorage`
  scoped to the renderer's origin (usually `file://`).
- **Persistent** — survives page reloads, app restarts, and OS reboots. Cleared only
  by the user (browser settings → clear data) or by explicit `localStorage.clear()`.
- **~5MB limit** — more than enough for code snippets. If you store binary data or large
  files, you will hit this limit.

**Why not IndexedDB or the Electron `userData` directory?**
IndexedDB is more powerful (asynchronous, binary data, complex queries) but much more
verbose — a simple read/write is 15 lines of callbacks. `electron-store` (Lesson 20) writes
to the OS `userData` directory, which survives clearing browser data. For code block edits,
`localStorage` is sufficient and simple.

**SE lens:** The source of truth hierarchy: the markdown file is the ground truth; localStorage
is a user-layer overlay. This design is deliberate. The markdown file cannot be corrupted
by student edits — it always contains the original code. `localStorage` is expendable: if
it is cleared, the student loses their edits but the lesson is intact. The Reset button
returns to the ground truth. This is the same model as git: the repository is the truth;
the working tree is the overlay.

### Step 2 — The Storage Key

Each code block needs a unique storage key that identifies "the student's edit of this
specific block."

The key must be:
1. **Stable** — the same block must always produce the same key, even after app restarts
2. **Unique** — two different blocks must never share a key
3. **Invalidating** — if the lesson author changes the original code, the stored edit
   should be discarded (the student gets the new original)

A key design that satisfies all three:

```
codex:edit:{chapterId}:{blockIndex}:{contentHash}
```

- `chapterId` — a hash of the chapter's file path. Stable as long as the file does not move.
- `blockIndex` — the position of this code block in the chapter (0-indexed). Stable within
  a chapter as long as blocks are not reordered.
- `contentHash` — a hash of the original code. If the lesson author edits the code, the
  hash changes and the stored edit is discarded.

**CS lens:** The content hash acts as an **ETag** — a cache invalidation token. ETags are
used in HTTP caching: the server returns a hash of the resource; the browser sends it on
subsequent requests; if the hash has changed, the resource is re-fetched. Our storage key
uses the same principle: if the content hash changes, the stored value is ignored.

**Hashing explained (first appearance):**
A hash function takes arbitrary input and returns a fixed-size output. The same input always
produces the same output. Different inputs produce different outputs (with very high probability).
We use **FNV-1a** — a fast, non-cryptographic hash algorithm. Non-cryptographic means it is
optimised for speed and uniqueness, not for security. We do not need security here — we need
a compact, stable identifier.

```typescript
// In packages/core/src/hash.ts

export function fnv1a(input: string): string {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = (hash * 16777619) >>> 0
  }
  return hash.toString(36)
}
```

**Walkthrough of `fnv1a`:**
1. Start with the FNV offset basis: `2166136261` (a magic constant chosen by the FNV designers
   to produce good distribution)
2. For each character, XOR the current hash with the character's code point
3. Multiply by the FNV prime (`16777619`), using `>>> 0` to keep the result a 32-bit unsigned
   integer (JavaScript numbers are 64-bit floats; `>>> 0` forces unsigned 32-bit truncation)
4. After all characters, return the hash as a base-36 string (letters + numbers — compact
   and safe for use as a storage key)

**Why base 36?** `toString(36)` uses digits `0–9` and letters `a–z` — 36 possible characters.
A 32-bit number in base 36 is at most 7 characters long. Shorter keys are easier to debug.

**`^=` (XOR assignment) explained:**
`^` is the bitwise XOR operator. XOR returns `1` for each bit position where exactly one
of the two inputs is `1`. `hash ^= char` modifies `hash` in place.

**`>>> 0` (unsigned right shift) explained:**
JavaScript integers can become negative when the multiplication overflows 32 bits.
`>>> 0` reinterprets the number as an unsigned 32-bit integer, converting any negative
value to a positive one. This keeps the hash value in the range `[0, 4294967295]`.

### Step 3 — The Persistence Module

In `packages/renderer/src/codePersistence.ts`:

```typescript
import { fnv1a } from '@codex/core'

const STORAGE_PREFIX = 'codex:edit:'

export interface StorageKey {
  readonly chapterId: string
  readonly blockIndex: number
  readonly contentHash: string
}

export function makeStorageKey(key: StorageKey): string {
  return `${STORAGE_PREFIX}${key.chapterId}:${key.blockIndex}:${key.contentHash}`
}

export function saveEdit(key: StorageKey, code: string): void {
  const storageKey = makeStorageKey(key)
  localStorage.setItem(storageKey, code)
}

export function loadEdit(key: StorageKey): string | null {
  const storageKey = makeStorageKey(key)
  return localStorage.getItem(storageKey)
}

export function clearEdit(key: StorageKey): void {
  const storageKey = makeStorageKey(key)
  localStorage.removeItem(storageKey)
}

export function clearAllEditsForChapter(chapterId: string): void {
  const prefix = `${STORAGE_PREFIX}${chapterId}:`
  const keysToRemove: string[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key !== null && key.startsWith(prefix)) {
      keysToRemove.push(key)
    }
  }

  for (const key of keysToRemove) {
    localStorage.removeItem(key)
  }
}

export function makeChapterId(filePath: string): string {
  return fnv1a(filePath)
}

export function makeContentHash(originalCode: string): string {
  return fnv1a(originalCode)
}
```

**`localStorage.length` and `localStorage.key(i)` explained:**
`localStorage` does not provide a namespace or prefix filter API — there is no
`localStorage.getByPrefix('codex:edit:')`. The only way to find keys by prefix is to
iterate all keys using `localStorage.length` (total count) and `localStorage.key(i)`
(key at index `i`). We collect all matching keys first, then remove them in a second
pass — modifying a collection while iterating it causes skipped items.

**Why two passes (collect, then remove):**
`localStorage` does not define what happens to `localStorage.key(i)` after a `removeItem`
call during iteration. The keys may shift. Iterating and deleting simultaneously is unsafe.
Collecting keys first and deleting after is safe and predictable.

### Step 4 — Debounced Saving

`localStorage.setItem` is synchronous and fast, but calling it on every keystroke is
unnecessary — the student does not need their work saved after every character. More
importantly, we will later log each save to track "has the student modified this block,"
and logging on every keystroke creates noise.

**Debouncing explained:**
Debouncing delays a function call until a specified time has passed since the last call.
If calls arrive faster than the delay, the timer resets. Only when calls stop for the
full delay does the function execute.

```
Keystroke at t=0  → reset timer to t=500
Keystroke at t=100 → reset timer to t=600
Keystroke at t=200 → reset timer to t=700
No keystrokes for 500ms → function executes at t=1200
```

The effect: rapid typing produces one save per burst of typing, not one per character.

```typescript
// In packages/renderer/src/useDebounce.ts

export function useDebounce<T extends (...args: never[]) => void>(
  fn: T,
  delayMs: number
): T {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  return useCallback((...args: Parameters<T>) => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      fn(...args)
      timerRef.current = null
    }, delayMs)
  }, [fn, delayMs]) as T
}
```

**`ReturnType<typeof setTimeout>` explained:**
`setTimeout` returns a timer ID. In a browser, it is a `number`. In Node.js, it is a
`NodeJS.Timeout` object. TypeScript's `ReturnType<typeof setTimeout>` infers the correct
type for the current environment — avoiding a hard-coded `number` that would fail in a
Node.js context.

**`Parameters<T>` explained:**
`Parameters<T>` is a TypeScript utility type that extracts the parameter types of a
function type `T` as a tuple. If `T` is `(code: string, key: string) => void`, then
`Parameters<T>` is `[string, string]`. Using it here means the returned debounced function
has exactly the same parameter types as the input function — TypeScript enforces the
signature.

### Step 5 — Integrating Persistence in CodeBlock

Extend `CodeBlock` to load saved edits on mount and save on change:

```typescript
import { saveEdit, loadEdit, makeChapterId, makeContentHash, type StorageKey } from './codePersistence'
import { useDebounce } from './useDebounce'

interface CodeBlockProps {
  readonly language: string | undefined
  readonly children: string
  readonly onRun?: (language: string, code: string) => Promise<ExecutionResult>
  readonly chapterFilePath: string
  readonly blockIndex: number
}

export function CodeBlock({
  language, children, onRun,
  chapterFilePath, blockIndex
}: CodeBlockProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [runState, setRunState] = useState<RunState>({ status: 'idle' })

  const storageKey: StorageKey = {
    chapterId: makeChapterId(chapterFilePath),
    blockIndex,
    contentHash: makeContentHash(children),
  }

  const savedEdit = loadEdit(storageKey)
  const initialCode = savedEdit ?? children

  const debouncedSave = useDebounce((code: string) => {
    if (code !== children) {
      saveEdit(storageKey, code)
    } else {
      clearEdit(storageKey)
    }
  }, 500)

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor
    editor.onDidChangeModelContent(() => {
      debouncedSave(editor.getValue())
    })
    editor.updateOptions({ /* ... same as before */ })
  }

  function handleReset() {
    clearEdit(storageKey)
    editorRef.current?.setValue(children)
    setRunState({ status: 'idle' })
  }

  // ... rest of component, pass initialCode as defaultValue to Editor
  // and add Reset button next to Run button
}
```

**`editor.onDidChangeModelContent` explained:**
This is Monaco's change event. It fires after every edit to the document model —
insertions, deletions, pastes. We register the listener inside `handleEditorMount`
(called once when Monaco mounts) so the listener is attached once. The debounced save
function runs 500ms after the last edit.

**`if (code !== children)` in the save function:**
If the student has edited the code back to the original (undone all changes), we delete
the stored edit rather than storing a copy of the original. This keeps localStorage clean
and ensures a fresh `loadEdit` returns `null` (meaning "use the original"), not the
original text.

**`editor.setValue(children)` in `handleReset`:**
`setValue` replaces the entire content of the editor with the given string. It clears
Monaco's undo history — after reset, `Ctrl+Z` does not undo the reset. This is intentional:
"Reset" means "return to the original code," which should not be undoable.

### Step 6 — Passing Block Metadata from ChapterView

`ChapterView` renders the `code` component override and must pass `chapterFilePath` and
`blockIndex` to each `CodeBlock`. To track `blockIndex`, we use a counter in the override:

```typescript
// In ChapterView.tsx
const blockIndexRef = useRef(0)

useEffect(() => {
  blockIndexRef.current = 0
}, [chapter.filePath])

// In the components prop:
code({ node, className, children, ...props }) {
  // ... existing language detection code ...

  if (isBlock) {
    const currentIndex = blockIndexRef.current++
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
  // ...
}
```

**Why `useRef` for `blockIndexRef` rather than `useState`:**
`blockIndexRef` is a counter that resets when the chapter changes. If it were `useState`,
incrementing it would trigger a re-render, which would call the `components` prop again,
which would increment again — an infinite loop. `useRef.current` is mutable without
triggering re-renders.

---

## Connect the Pieces

The `makeChapterId` and `makeContentHash` functions from this lesson are the storage
key components that `clearAllEditsForChapter` (added in Lesson 23's progress tracking)
will use. When a student exports their progress (Lesson 46 in the extended curriculum),
all `localStorage` keys with the `codex:edit:` prefix are exported.

The debounce pattern from `useDebounce.ts` is reused in Lesson 21's search input.

---

## What Breaks Without This

If `code !== children` check is removed from the debounced save, storing the original
code as an edit when the user hasn't changed anything. Later, if the lesson author rewrites
the code block, `makeContentHash(originalCode)` produces a new hash — the stored edit is
correctly discarded. But there is a subtler problem: the stored value is the same as
`children`, so `savedEdit !== null` is `true` and `initialCode = savedEdit`. The editor
initialises with the stored value (same as original), and the Reset button calls
`clearEdit` but there is nothing to clear. Behaviour is correct but localStorage is
unnecessarily polluted. The check keeps it clean.

---

## Definition of Done

- [ ] Edit a Python block, close and reopen the app — the edit is preserved
- [ ] Two blocks with identical original code but different positions store independently
- [ ] Click Reset on an edited block — original code is restored
- [ ] Edit code back to its original text — the edit is not stored (localStorage stays clean)
- [ ] Changing chapter and returning preserves the edit
- [ ] Open browser DevTools → Application → Local Storage and verify the key format:
      `codex:edit:{hash}:{index}:{hash}`
- [ ] You can answer: what is debouncing and why is it used here?
- [ ] You can answer: why are two passes used when clearing all edits for a chapter?
- [ ] `git commit` with a message explaining why
