# Lesson 29 — Keyboard Shortcuts and Command Palette

## What You Will Build

`Cmd+Enter` (macOS) / `Ctrl+Enter` (Windows/Linux) inside a code block runs the code.
`Cmd+[` and `Cmd+]` navigate to the previous and next chapter. `Cmd+P` opens a command
palette — a floating search box that lists all chapters for quick navigation. The shortcuts
call the same functions as the existing buttons; no logic is duplicated.

---

## What You Need to Know First

- Lesson 5: the Run button, `RUNNABLE_LANGUAGES`, `onRun`
- Lesson 2: the `Chapter` and `Library` types, sidebar chapter navigation
- Lesson 9: `CodeBlock`, `editorRef`, Monaco editor

---

## The Lesson

### Step 1 — Keyboard Events: Bubbling and Capture

Browser keyboard events follow a two-phase path:
1. **Capture phase:** Event travels from the document root *down* to the target element.
2. **Bubble phase:** Event travels from the target element *up* to the document root.

`addEventListener('keydown', handler)` listens in the bubble phase. To intercept an event
before it reaches any child element, add the listener with `{ capture: true }`.

**Event bubbling in practice:**
When the student presses `Cmd+Enter` inside the Monaco editor, the `keydown` event fires
on the Monaco editor's DOM node. If nothing intercepts it, it bubbles up to the document.
We listen for it at the document level.

**The problem with Monaco:**
Monaco handles many keyboard shortcuts internally — for example, `Cmd+Enter` might insert
a newline in some Monaco configurations. We need to intercept `Cmd+Enter` before Monaco does,
or teach Monaco to call our handler.

**The cleaner approach for Monaco — `addCommand`:**
Monaco exposes `editor.addCommand(keybinding, handler)`. This adds a custom keybinding
*inside* Monaco that fires before Monaco's default behaviour.

For shortcuts outside Monaco (chapter navigation, command palette), listen on the document.

### Step 2 — The Monaco Run Shortcut

In `CodeBlock.tsx`, attach the run shortcut when Monaco mounts:

```typescript
import * as monacoNS from 'monaco-editor'

const handleEditorMount: OnMount = (editor, monaco) => {
  editorRef.current = editor

  // Cmd+Enter (macOS) / Ctrl+Enter (Windows/Linux) triggers Run
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
    () => {
      void handleRun()
    }
  )

  editor.updateOptions({
    // ... existing options
  })
}
```

`monaco.KeyMod.CtrlCmd` maps to `Cmd` on macOS and `Ctrl` on Windows/Linux automatically.
`monaco.KeyCode.Enter` is the Enter key. The `|` (bitwise OR) combines them into a
single keybinding code Monaco understands.

`void handleRun()` suppresses TypeScript's warning about an unhandled Promise — `handleRun`
returns a Promise, and in an event handler we intentionally do not await it.

**CS lens:** `editor.addCommand` is the **command pattern** — an operation (Run) is
encapsulated as a command object with a keybinding trigger. The same `handleRun` function
is called whether the student presses `Cmd+Enter` or clicks the Run button. The trigger
is separate from the action. This is how all keyboard shortcut systems are built.

### Step 3 — Document-Level Shortcuts

For chapter navigation and the command palette, add a document-level `keydown` listener
in `App.tsx` (or `ChapterView.tsx`):

```typescript
import { useEffect, useCallback } from 'react'

function useKeyboardShortcuts({
  library,
  selectedChapter,
  onChapterSelect,
  onCommandPaletteOpen,
}: {
  library: Library | null
  selectedChapter: Chapter | null
  onChapterSelect: (chapter: Chapter) => void
  onCommandPaletteOpen: () => void
}) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.startsWith('Mac')
    const modifier = isMac ? e.metaKey : e.ctrlKey

    if (!modifier) return

    if (e.key === 'p' || e.key === 'P') {
      e.preventDefault()
      onCommandPaletteOpen()
      return
    }

    if (library === null || selectedChapter === null) return

    // Flatten all chapters across all books
    const allChapters = library.books.flatMap(book => book.chapters)
    const currentIndex = allChapters.findIndex(ch => ch.path === selectedChapter.path)

    if (e.key === '[' && currentIndex > 0) {
      e.preventDefault()
      onChapterSelect(allChapters[currentIndex - 1])
    }

    if (e.key === ']' && currentIndex < allChapters.length - 1) {
      e.preventDefault()
      onChapterSelect(allChapters[currentIndex + 1])
    }
  }, [library, selectedChapter, onChapterSelect, onCommandPaletteOpen])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
```

**`e.preventDefault()` explained:**
Without `e.preventDefault()`, the browser processes the key event with its default behaviour
after our handler runs. `Cmd+P` normally opens the browser print dialog. `e.preventDefault()`
stops that default behaviour. In Electron, `Cmd+P` has no default, but it is good practice
to always call `e.preventDefault()` for custom shortcuts.

**`useCallback` with dependencies:**
`useCallback` memoizes a function so it is not recreated on every render. This matters
because the function is in the `useEffect` dependency array — if it changed on every render,
the effect would re-run (add and remove the event listener) on every render. The dependencies
`[library, selectedChapter, onChapterSelect, onCommandPaletteOpen]` tell React when the
function actually needs to be recreated.

### Step 4 — The Command Palette

The command palette is a modal overlay: a dark backdrop, a centered input box, and a list
of chapters that filters as the student types.

```typescript
// packages/renderer/src/CommandPalette.tsx
import React, { useState, useEffect, useRef } from 'react'
import type { Chapter, Library } from '@codex/core'

interface CommandPaletteProps {
  readonly library: Library
  readonly onSelect: (chapter: Chapter) => void
  readonly onClose: () => void
}

export function CommandPalette({ library, onSelect, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the input when the palette opens
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const allChapters = library.books.flatMap(book =>
    book.chapters.map(ch => ({ chapter: ch, bookTitle: book.title }))
  )

  const filtered = query.trim().length === 0
    ? allChapters
    : allChapters.filter(({ chapter, bookTitle }) =>
        chapter.title.toLowerCase().includes(query.toLowerCase()) ||
        bookTitle.toLowerCase().includes(query.toLowerCase())
      )

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
        }}
      />
      {/* Palette */}
      <div
        style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          maxHeight: '60vh',
          background: '#1a1a2e',
          border: '1px solid #444',
          borderRadius: '8px',
          zIndex: 1001,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Go to chapter…"
          style={{
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid #333',
            color: '#e2e8f0',
            fontSize: '1rem',
            outline: 'none',
          }}
        />
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', overflowY: 'auto' }}>
          {filtered.map(({ chapter, bookTitle }) => (
            <li
              key={chapter.path}
              onClick={() => { onSelect(chapter); onClose() }}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #222',
                color: '#e2e8f0',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#2a2a4e')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ fontSize: '0.85rem' }}>{chapter.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>{bookTitle}</div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li style={{ padding: '12px 16px', color: '#888' }}>No chapters found</li>
          )}
        </ul>
      </div>
    </>
  )
}
```

In `App.tsx`:
```typescript
const [paletteOpen, setPaletteOpen] = useState(false)

useKeyboardShortcuts({
  library,
  selectedChapter,
  onChapterSelect: handleChapterSelect,
  onCommandPaletteOpen: () => setPaletteOpen(true),
})

// In the render:
{paletteOpen && library !== null && (
  <CommandPalette
    library={library}
    onSelect={handleChapterSelect}
    onClose={() => setPaletteOpen(false)}
  />
)}
```

---

## Connect the Pieces

The command palette's filtering logic is a simple `includes` check — it is not the inverted
index from Lesson 21. For navigating to chapters by title (a known, bounded list), linear
search is fast enough. The inverted index is for full-text search across content, which the
command palette does not do.

The command pattern used here — attaching a keybinding to an existing action rather than
duplicating logic — is the same model as VS Code's own keyboard shortcut system. In VS Code,
every command (e.g., `workbench.action.openFile`) is registered once; keyboard shortcuts,
menu items, and the command palette all invoke the same command. This is why remapping a
shortcut in VS Code does not require changing the code that opens the file — the trigger
and the action are decoupled. Codex implements the same principle with `editor.addCommand`
and the document-level `keydown` listener.

---

## What Breaks Without This

Without `e.preventDefault()` on `Cmd+P`, the native print dialog opens. The shortcut fires
but the palette also prints the page. For Electron this is less visible than for the web
app, but the habit of preventing default on custom shortcuts is correct and important.

---

## Definition of Done

- [ ] `Cmd+Enter` inside a code block runs the code (same as clicking Run)
- [ ] `Cmd+[` navigates to the previous chapter; `Cmd+]` to the next
- [ ] `Cmd+P` opens the command palette
- [ ] Typing in the command palette filters chapters by title and book name
- [ ] Clicking a palette result navigates to the chapter and closes the palette
- [ ] Pressing `Escape` closes the palette
- [ ] You can answer: what is the command pattern?
- [ ] You can answer: what does `e.preventDefault()` do and when is it needed?
- [ ] `git commit` with a message explaining why
