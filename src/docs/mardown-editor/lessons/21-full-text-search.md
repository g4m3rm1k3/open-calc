# Lesson 21 — Full-Text Search

## What You Will Build

`Cmd+K` (macOS) / `Ctrl+K` (Windows/Linux) opens a search dialog. Typing a term shows
every chapter that contains it, with a snippet of the surrounding text highlighted. Results
appear within 50ms for a 100-chapter library. Clicking a result navigates to the chapter.
The search index is built in a Web Worker so it does not block the UI thread.

---

## What You Need to Know First

- Lesson 10: `useDebounce`, the debouncing pattern
- Lesson 2: `Chapter`, `Library`, file reading
- Lesson 11: chokidar, file changes — the index must update when files change

---

## The Lesson

### Step 1 — Why an Inverted Index?

**Naive search:** scan every chapter's content for the query string.

Time complexity: O(n × m) per query, where n is the total character count of all chapters
and m is the query length. For a 100-chapter library with an average of 5,000 characters
per chapter, one query scans 500,000 characters. At the typical JavaScript string scan
rate, this takes ~2–5ms. Acceptable for small libraries, but it compounds as the library grows.

**The inverted index:**
A map from every word in the library to the list of chapters containing it.

```
{
  "ownership": ["rust-01.md", "rust-04.md", "cpp-02.md"],
  "borrow":    ["rust-01.md"],
  "pointer":   ["rust-01.md", "cpp-01.md", "cpp-02.md"],
  ...
}
```

A query for "ownership" looks up the word in the map: O(1). The result is a list of
chapters to display. Building the index is O(n × m) once at startup, but queries are
O(1) forever after.

**CS lens:** The inverted index is the data structure behind every search engine. Google
uses a distributed inverted index across millions of machines. Elasticsearch, Solr, and
PostgreSQL's full-text search all use inverted indexes. The key insight: do the expensive
work (scanning all text) once at index-build time; make the query fast by pre-computing
the word-to-document mapping.

**SE lens:** Building the index at startup is the right trade-off because the library
does not change while the student is using it (ignoring live-reload for now). Read-often,
write-rarely workloads are the classic case for pre-computed indexes. The cost is paid
once; the benefit is paid on every query.

### Step 2 — Web Workers

Building the search index scans every character in every chapter. For a large library,
this can take hundreds of milliseconds. JavaScript is single-threaded — CPU-intensive
work on the main thread freezes the UI. During the freeze, the sidebar does not respond
to clicks, animations stutter, and the app feels broken.

**Web Workers (first appearance):**
A Web Worker is a script that runs in a background thread. It has:
- Its own JavaScript context (separate from the page's `window`)
- No DOM access
- Communication with the main thread via `postMessage`
- The ability to run CPU-intensive work without blocking the UI

```javascript
// Main thread                    // Worker thread
const worker = new Worker(...)    // runs independently
worker.postMessage(data)   ──→    self.onmessage = ({ data }) => {
                                    // process data, maybe slowly
                                    const result = doExpensiveWork(data)
worker.onmessage = ({ data }) => {   self.postMessage(result)
  // receive result               }
}
```

**`postMessage` constraints:**
Only JSON-serialisable data can be sent via `postMessage` — numbers, strings, arrays,
plain objects. No functions, no class instances, no DOM nodes. The data is copied
(structured clone algorithm), not shared. Modifying the sent data in the worker does
not affect the original.

**CS lens:** `postMessage` is **message passing** — the concurrency model used by Erlang,
Go's goroutines, and Rust's channels. It is safer than shared memory (no race conditions,
no mutexes) at the cost of copying data. For search indexing, the library data is sent
to the worker once at startup; results are sent back on every query. The copy cost is paid
once; the safety is paid for always.

### Step 3 — The Search Worker

In `apps/web/src/searchWorker.ts` (or `apps/electron/src/renderer/searchWorker.ts`):

```typescript
export type WorkerMessage =
  | { type: 'BUILD_INDEX'; chapters: Array<{ id: string; title: string; content: string }> }
  | { type: 'QUERY'; query: string; queryId: number }

export type WorkerResponse =
  | { type: 'INDEX_READY'; chapterCount: number }
  | { type: 'QUERY_RESULT'; queryId: number; results: SearchResult[] }

export interface SearchResult {
  readonly chapterId: string
  readonly title: string
  readonly snippet: string
  readonly matchCount: number
}

type InvertedIndex = Map<string, Set<string>>

let index: InvertedIndex = new Map()
let chapterMeta: Map<string, { title: string; content: string }> = new Map()

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
}

function buildIndex(chapters: Array<{ id: string; title: string; content: string }>): void {
  index = new Map()
  chapterMeta = new Map()

  for (const chapter of chapters) {
    chapterMeta.set(chapter.id, { title: chapter.title, content: chapter.content })

    const words = tokenize(`${chapter.title} ${chapter.content}`)
    for (const word of words) {
      if (!index.has(word)) index.set(word, new Set())
      index.get(word)!.add(chapter.id)
    }
  }
}

function query(searchText: string): SearchResult[] {
  const queryWords = tokenize(searchText)
  if (queryWords.length === 0) return []

  const candidateSets = queryWords
    .map(word => index.get(word) ?? new Set<string>())

  const intersection = candidateSets.reduce((acc, set) =>
    new Set([...acc].filter(id => set.has(id)))
  )

  return [...intersection]
    .map(chapterId => {
      const meta = chapterMeta.get(chapterId)!
      const snippet = extractSnippet(meta.content, queryWords[0])
      const matchCount = queryWords.reduce((count, word) => {
        return count + (index.get(word)?.has(chapterId) ? 1 : 0)
      }, 0)
      return { chapterId, title: meta.title, snippet, matchCount }
    })
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 10)
}

function extractSnippet(content: string, word: string): string {
  const index = content.toLowerCase().indexOf(word.toLowerCase())
  if (index === -1) return content.slice(0, 150)
  const start = Math.max(0, index - 60)
  const end = Math.min(content.length, index + 90)
  const snippet = content.slice(start, end)
  return (start > 0 ? '…' : '') + snippet + (end < content.length ? '…' : '')
}

self.onmessage = ({ data }: MessageEvent<WorkerMessage>) => {
  if (data.type === 'BUILD_INDEX') {
    buildIndex(data.chapters)
    self.postMessage({ type: 'INDEX_READY', chapterCount: data.chapters.length })
  } else if (data.type === 'QUERY') {
    const results = query(data.query)
    self.postMessage({ type: 'QUERY_RESULT', queryId: data.queryId, results })
  }
}
```

**`tokenize` explained:**
Tokenisation breaks text into searchable units (words). Steps:
1. `toLowerCase()` — case-insensitive search: "Python" and "python" are the same word
2. Replace non-alphanumeric characters with spaces — punctuation is not part of words
3. `split(/\s+/)` — split on whitespace sequences (handles multiple spaces, newlines, tabs)
4. `filter(word => word.length > 2)` — remove words shorter than 3 characters (a, an, the,
   to, in, etc.) — these are too common to be useful search terms

**Multi-word query as intersection:**
For a query "Python closure", we find chapters containing "python" AND chapters containing
"closure" and return the intersection. `candidateSets.reduce((acc, set) => intersection)`
starts with all chapters matching the first word, then filters to only those also matching
the second word.

**`!` non-null assertion explained:**
`index.get(word)!.add(chapter.id)` — the `!` tells TypeScript "I know this is not null or
undefined." We just checked `if (!index.has(word)) index.set(word, new Set())`, so
`index.get(word)` cannot return `undefined`. The `!` is safe here because we just set the
value. Using `!` without this guarantee is unsafe and should be avoided.

**`queryId` explained:**
The user may type quickly — "py", "pyt", "pyth", "pytho", "python" in rapid succession.
Each keystroke sends a new query to the worker. Queries complete in any order. Without
`queryId`, the UI might show results for "py" after results for "python" arrive —
displaying wrong results. The `queryId` is a counter incremented with each query; the UI
only renders results if the `queryId` matches the latest sent query (all older queries are
discarded).

### Step 4 — The Search Dialog Component

In `packages/renderer/src/SearchDialog.tsx`:

```typescript
import React, { useEffect, useRef, useState } from 'react'
import { useDebounce } from './useDebounce'
import type { SearchResult } from './searchWorker'

interface SearchDialogProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onNavigate: (chapterId: string) => void
  readonly onQuery: (query: string, queryId: number) => void
  readonly results: SearchResult[]
  readonly latestQueryId: number
}

export function SearchDialog({
  isOpen, onClose, onNavigate, onQuery, results, latestQueryId
}: SearchDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [queryText, setQueryText] = useState('')
  const queryIdRef = useRef(0)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQueryText('')
    }
  }, [isOpen])

  const debouncedQuery = useDebounce((text: string) => {
    queryIdRef.current++
    onQuery(text, queryIdRef.current)
  }, 150)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setQueryText(event.target.value)
    debouncedQuery(event.target.value)
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '15vh', zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width: '600px', background: '#161b22', borderRadius: '8px', overflow: 'hidden' }}>
        <input
          ref={inputRef}
          value={queryText}
          onChange={handleChange}
          placeholder="Search chapters…"
          style={{
            width: '100%', padding: '1rem', background: 'transparent',
            border: 'none', color: 'white', fontSize: '1rem', outline: 'none',
            borderBottom: '1px solid #1a1a3e',
          }}
        />
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {results.map(result => (
            <button
              key={result.chapterId}
              onClick={() => { onNavigate(result.chapterId); onClose() }}
              style={{
                display: 'block', width: '100%', padding: '0.75rem 1rem',
                background: 'transparent', border: 'none', color: 'white',
                textAlign: 'left', cursor: 'pointer',
                borderBottom: '1px solid #1a1a3e',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{result.title}</div>
              <div style={{ color: '#888', fontSize: '0.875rem' }}>{result.snippet}</div>
            </button>
          ))}
          {queryText.length > 0 && results.length === 0 && (
            <div style={{ padding: '1rem', color: '#888' }}>No results for "{queryText}"</div>
          )}
        </div>
      </div>
    </div>
  )
}
```

**`role="dialog"` and `aria-modal="true"` explained:**
Accessibility attributes tell screen readers how to interpret this element. `role="dialog"`
indicates this is a modal dialog. `aria-modal="true"` tells screen readers that content
behind the dialog is inert (not navigable while the dialog is open). These are required
for the dialog to be usable by people who navigate with screen readers or keyboard-only.

**`inset: 0` explained:**
CSS `inset` is shorthand for `top: 0; right: 0; bottom: 0; left: 0`. Combined with
`position: fixed`, it makes the overlay fill the entire viewport.

---

## Connect the Pieces

The search worker runs independently of the main thread. When the library changes
(Lesson 11's file watcher), the main thread sends a new `BUILD_INDEX` message to the
worker. The worker rebuilds the index in the background; the UI remains responsive.

In Lesson 20, completed chapters were tracked by `chapterId`. Search results include
`chapterId` — a future enhancement could show a completion mark in search results.

---

## What Breaks Without This

If the search index is built on the main thread (no Web Worker), the UI freezes for the
duration of the build. For a 100-chapter library with ~5,000 words per chapter, building
takes ~30–50ms. The user experiences a 50ms freeze every time they open a new folder.
For 1,000 chapters, the freeze is 500ms — visibly noticeable. The Web Worker pays a small
message-passing cost but eliminates the freeze entirely.

---

## Definition of Done

- [ ] `Cmd+K` / `Ctrl+K` opens the search dialog; `Escape` closes it
- [ ] Typing a word shows chapters containing that word within 200ms
- [ ] Multi-word queries return chapters containing all words
- [ ] Clicking a result navigates to the chapter
- [ ] The search debounce is 150ms: confirm with DevTools that the worker receives one
      message per typing burst, not one per keystroke
- [ ] Searching a 50-chapter library returns results in < 50ms
- [ ] You can answer: what is an inverted index and what problem does it solve?
- [ ] You can answer: why can a Web Worker not access the DOM?
- [ ] `git commit` with a message explaining why
