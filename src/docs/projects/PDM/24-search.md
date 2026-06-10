# Vault PDM — Lesson 24 — Search

## What You Will Build

A search bar above the file tree. Typing a query filters the file list to files whose
path contains the query. Results appear as you type, debounced to 300ms. Matching
portions of the file name are highlighted. The search uses PostgreSQL `ILIKE` for
case-insensitive matching.

## What You Need to Know First

Lessons 01–23. The `files` table is populated. This lesson introduces `ILIKE`,
debouncing, and text highlighting.

---

## Step 1 — Full-Text Search with ILIKE

**`ILIKE` — first appearance:**
`ILIKE` is PostgreSQL's case-insensitive version of `LIKE`. `LIKE` matches patterns
with two wildcards: `%` (any sequence of characters) and `_` (any single character).

```sql
SELECT file_path FROM files WHERE file_path ILIKE $1
```

With parameter `'%housing%'`:
- `designs/housing/housing-v3.step` → matches
- `DESIGNS/HOUSING/housing-v3.step` → matches (case-insensitive)
- `designs/bracket.step` → no match

**Pattern construction:**
```typescript
const pattern = `%${query.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`
```

`query.replace(/%/g, '\\%').replace(/_/g, '\\_')` **escapes** the user's input:
if the user types `%` or `_`, they would otherwise be interpreted as ILIKE wildcards
rather than literal characters. Escaping converts them to `\%` and `\_`, which ILIKE
treats as literal characters. This is parameterised-query-equivalent protection for
the pattern content itself.

The `%...%` wrapping performs a substring search — `%housing%` matches `housing`
anywhere in the path.

---

## Step 2 — Data Layer

### Add to `src/data/files.ts`

```typescript
export async function searchFiles(
  gitlabProjectId: number,
  query:           string,
  limit:           number = 50,
): Promise<FileWithStatus[]> {
  if (query.trim().length < 2) return []

  const pattern = `%${query.replace(/%/g, '\\%').replace(/_/g, '\\_%')}%`

  const result = await query<{
    file_id:            string
    file_path:          string
    file_type:          string
    locked_by:          string | null
    locked_by_username: string | null
    checked_out_at:     Date   | null
  }>(
    `SELECT
       f.id           AS file_id,
       f.file_path,
       f.file_type,
       l.held_by      AS locked_by,
       u.username     AS locked_by_username,
       l.checked_out_at
     FROM files f
     LEFT JOIN locks l  ON l.file_id = f.id
     LEFT JOIN users u  ON u.id      = l.held_by
     WHERE f.gitlab_project_id = $1
       AND f.file_path ILIKE $2 ESCAPE '\\'
     ORDER BY f.file_path
     LIMIT $3`,
    [gitlabProjectId, pattern, limit],
  )

  return result.rows.map((row) => ({
    fileId:            row.file_id,
    filePath:          row.file_path,
    fileType:          row.file_type,
    lockedBy:          row.locked_by,
    lockedByUsername:  row.locked_by_username,
    checkedOutAt:      row.checked_out_at,
  }))
}
```

**`ESCAPE '\\'` — specifying the escape character:**
`ILIKE` patterns use `\` as the default escape character in most PostgreSQL configurations,
but being explicit with `ESCAPE '\\'` (a literal backslash) is more portable.
`\\` in a SQL string literal represents a single backslash `\`.

**`LIMIT $3` — pagination for search:**
Search results are limited to 50. Without a limit, a query `%a%` could match
thousands of files and return a large result set. The limit keeps the response fast.
For a search box, 50 results is more than enough — if the user needs more specificity,
they should type a longer query.

**Minimum query length guard (`query.trim().length < 2`):**
A single-character query `%a%` could match most files in a large project — the
result would be useless noise. Requiring at least 2 characters filters out
accidental single-character results. This is a UX decision, not a correctness issue.

---

## Step 3 — API Route

```typescript
app.get('/api/projects/:projectId/search', async (request, response) => {
  const projectId = Number(request.params.projectId)
  const q         = String(request.query.q ?? '')

  if (q.trim().length < 2) {
    response.json([])
    return
  }

  try {
    const results = await searchFiles(projectId, q)
    response.json(results)
  } catch (error) {
    response.status(500).json({ error: 'Search failed' })
  }
})
```

---

## Step 4 — Debouncing

**Debouncing — first appearance:**
A **debounced** function delays its execution until a specified time has passed since
the last call. For a search box, without debouncing:
- User types "h", "o", "u", "s", "i", "n", "g" (7 characters, ~200ms apart)
- 7 API calls fire simultaneously
- Results from early calls may arrive after results from later calls (race condition)
- The database runs 7 queries; GitLab's rate limiter may reject some

With 300ms debouncing:
- Only the call from the character typed 300ms ago fires
- Rapid typing suppresses intermediate calls
- One API call per "pause in typing"

### Create `src/renderer/hooks/useDebounce.ts`

```typescript
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debouncedValue
}
```

**How `useDebounce` works:**
Every time `value` changes, `useEffect` fires:
1. A `setTimeout` is scheduled for `delayMs` ms in the future
2. The cleanup function cancels any previously scheduled timer

If `value` changes again before the timer fires, the cleanup cancels it and a new
timer is set. Only when `value` stops changing for `delayMs` ms does the timer
actually fire and update `debouncedValue`.

**`clearTimeout(timer)` — cleanup:**
`setTimeout(fn, ms)` returns a timer ID. `clearTimeout(id)` cancels a pending timer.
If the user types "h" (timer scheduled) then "o" (cleanup cancels "h" timer, new
timer scheduled), only the timer from "o" (eventually "housing") fires. The cleanup
in `useEffect` runs before the effect fires again — so the timer is always cancelled
when the dependency changes.

### Create `src/renderer/SearchBar.tsx`

```typescript
import { useState, useEffect } from 'react'
import { useDebounce }         from './hooks/useDebounce.js'
import type { FileWithStatus } from '../../domain/fileTree.js'
import './SearchBar.css'

interface SearchBarProps {
  projectId:     number
  onResultSelect: (filePath: string) => void
}

export function SearchBar({ projectId, onResultSelect }: SearchBarProps) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<FileWithStatus[]>([])
  const [loading, setLoading] = useState(false)

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    const params = new URLSearchParams({ q: debouncedQuery })
    fetch(`http://localhost:3001/api/projects/${projectId}/search?${params}`)
      .then((r) => r.json())
      .then((data: FileWithStatus[]) => setResults(data))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [debouncedQuery, projectId])

  function highlightMatch(text: string, query: string): React.ReactNode {
    if (query.trim().length < 2) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, index) =>
      regex.test(part)
        ? <mark key={index} className="search-highlight">{part}</mark>
        : part
    )
  }

  return (
    <div className="search-bar">
      <input
        type="search"
        placeholder="Search files..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
        aria-label="Search files by name or path"
      />
      {loading && <span className="search-loading">...</span>}
      {results.length > 0 && (
        <ul className="search-results">
          {results.map((result) => (
            <li
              key={result.fileId}
              className="search-result-item"
              onClick={() => {
                onResultSelect(result.filePath)
                setQuery('')
                setResults([])
              }}
            >
              {highlightMatch(result.filePath, query)}
              <LockBadge
                lockedByUsername={result.lockedByUsername}
                checkedOutAt={result.checkedOutAt}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

**`new RegExp(...)` for dynamic regex — first appearance:**
`highlightMatch` creates a regex from the user-provided query. `query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')` **escapes regex special characters** in the query string — if the user types `(housing)`, the `(` and `)` are regex metacharacters that would cause a syntax error. `\\$&` replaces each matched character with a backslash followed by the original character.

`'gi'` flags: `g` = global (match all occurrences), `i` = case-insensitive.

**`<mark>` — first appearance:**
The HTML `<mark>` element semantically marks highlighted text. By default, browsers
render it with a yellow background. We override the style to use the accent colour.
`<mark>` is semantically correct for search matches — it communicates "this is
relevant to the search" to screen readers and other tools.

**`type="search"` — first appearance:**
`type="search"` gives the input search semantics: on some platforms, it shows an `×`
clear button; on iOS, it shows the Search keyboard. It is functionally identical to
`type="text"` in most contexts but communicates intent.

---

## Connect the Pieces

Search is additive — it does not modify any existing component. The `SearchBar`
component appears above the `FileTree` in the main layout. Selecting a search result
calls `onResultSelect(filePath)` — the parent can use this to scroll the tree to the
file, open its version history, or show its actions.

---

## What Breaks Without This

**Without debouncing:**
Typing "housing" fires 7 API calls. PostgreSQL runs 7 simultaneous ILIKE queries.
The results from early calls (1-character query) may arrive after results from later
calls (7-character query) due to network variability — a race condition where stale
results overwrite fresh ones. The displayed results do not match what the user typed.
Debouncing eliminates this by ensuring only one call fires per typing session.

**Without escaping the regex in `highlightMatch`:**
A user searching for `(v3)` creates the regex `/(v3)/gi` — the unescaped parentheses
are a capture group, not literal characters. The behaviour is wrong. More severely,
`.*` would match everything. Worst case: a user typing specific regex patterns could
cause the regex engine to exhibit **ReDoS (Regular Expression Denial of Service)** —
certain pathological patterns cause the engine to take exponential time. Always escape
user-provided strings before using them as regex patterns.

---

## Definition of Done

- [ ] Typing in the search bar shows matching files after 300ms
- [ ] Less than 2 characters shows no results (no API call made)
- [ ] Clearing the search restores the full tree view
- [ ] Matching text in the file path is highlighted in the accent colour
- [ ] Clicking a search result selects/highlights the file
- [ ] You can explain debouncing — what it does, how the `clearTimeout` cleanup works
- [ ] You can explain `ILIKE` and write a safe parameterised ILIKE query
- [ ] You can explain why `$&` in `.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')` is needed
- [ ] You can explain ReDoS and why user input must never be used as a raw regex
- [ ] Run:
      ```
      git add src/data/ src/api/ src/renderer/
      git commit -m "Add search: ILIKE parameterised query, 300ms debounced SearchBar, regex-safe match highlighting with <mark>"
      ```

---

*Next: Lesson 25 — File Type Conventions. A settings screen lets the admin define
which extensions Vault manages and how they are categorised. Configuration stored in
a database table — no code changes required to add a new file type.*
