# Vault PDM — Lesson 15 — Error Handling and Loading States

## What You Will Build

Every API call in the Vault renderer has three explicit states: `loading` (spinner),
`success` (data displayed), and `error` (error message with a Retry button). A shared
`useAsyncState` hook centralises this logic. The file tree shows a loading spinner
during the initial fetch. If the fetch fails, the user sees a clear error and can
retry without reloading the app.

## What You Need to Know First

Lessons 01–14. The file tree is functional. This lesson adds the error handling that
makes it production-quality. The pattern established here is used for every async
operation in lessons 16–30.

---

## The Problem

The current file tree has two problems:
1. The loading state is not shown — the panel is blank while fetching
2. If the fetch fails, nothing happens — the panel stays blank with no explanation

These are not edge cases. GitLab's API has rate limits (requests per minute per user).
Networks timeout. PostgreSQL has connection limits. In a real engineering environment,
failures happen. An app that silently fails is worse than one that fails loudly — at
least a clear error message tells the user what to do.

---

## Step 1 — UI State Machines

**UI state machine — first appearance:**
A state machine is a system with a finite set of states and defined transitions between
them. UI state is best modelled as a state machine to prevent impossible combinations.

For an async data fetch, the states are:

```
'idle' → (fetch starts) → 'loading' → (success) → 'success'
                                     → (failure) → 'error'
'error' → (retry clicked) → 'loading'
'success' → (refresh) → 'loading'
```

**Why not `isLoading: boolean` and `hasError: boolean`:**
Two booleans allow four combinations: `(false, false)`, `(true, false)`, `(false, true)`,
`(true, true)`. The fourth — simultaneously loading and errored — is impossible. A
union type `'idle' | 'loading' | 'success' | 'error'` has exactly four states, all
of which are meaningful. TypeScript enforces that you handle all four — exhaustive
switch statements catch missed states.

---

## Step 2 — The `useAsyncState` Hook

**Custom hooks — first appearance:**
React **custom hooks** are functions that encapsulate reusable stateful logic. A
custom hook must start with `use` (this is a React convention enforced by linting
rules). It can call other hooks (`useState`, `useEffect`, `useCallback`). Components
that use the hook get the hook's state and callbacks without duplicating the logic.

### Create `src/renderer/hooks/useAsyncState.ts`

```typescript
import { useState, useCallback } from 'react'

type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error';   error: string }

export function useAsyncState<T>(
  fetcher: () => Promise<T>,
): {
  state:   AsyncState<T>
  trigger: () => void
} {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' })

  const trigger = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const data = await fetcher()
      setState({ status: 'success', data })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred'
      setState({ status: 'error', error: message })
    }
  }, [fetcher])

  return { state, trigger }
}
```

**`AsyncState<T>` — a discriminated union with data:**
`AsyncState<T>` is a union of four object types, each with a `status` field. The
`'success'` variant carries `data: T`; the `'error'` variant carries `error: string`.
TypeScript narrows the type based on `status`:

```typescript
if (state.status === 'success') {
  // TypeScript knows state.data exists here
  renderData(state.data)
}
if (state.status === 'error') {
  // TypeScript knows state.error exists here
  showError(state.error)
}
```

This is the **discriminated union pattern** — the same pattern as `GcodeToken` in
the CAM project. The `status` field is the discriminant; TypeScript narrows the type
based on its value.

**Generic hook `<T>`:**
`useAsyncState<T>` works for any data type: `useAsyncState<GitlabTreeItem[]>`,
`useAsyncState<FileWithStatus[]>`, `useAsyncState<VaultFile>`. The generic parameter
flows through: the `fetcher` returns `Promise<T>`, the success state carries `data: T`.

---

## Step 3 — The `AsyncView` Component

A component that renders the correct UI for each state:

### Create `src/renderer/components/AsyncView.tsx`

```typescript
import type { ReactNode } from 'react'
import './AsyncView.css'

interface AsyncViewProps<T> {
  state:     { status: string; data?: T; error?: string }
  onRetry:   () => void
  children:  (data: T) => ReactNode
  loadingText?: string
}

export function AsyncView<T>({
  state,
  onRetry,
  children,
  loadingText = 'Loading...',
}: AsyncViewProps<T>) {
  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <div className="async-loading">
        <div className="spinner" aria-label="Loading" role="progressbar" />
        <span>{loadingText}</span>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="async-error">
        <p className="error-message">{state.error}</p>
        <button className="retry-btn" onClick={onRetry}>
          Retry
        </button>
      </div>
    )
  }

  if (state.status === 'success' && state.data !== undefined) {
    return <>{children(state.data)}</>
  }

  return null
}
```

**`children: (data: T) => ReactNode` — render prop pattern:**
The `children` prop is a **render prop** — a function that the parent passes and
the component calls to render content. `children(state.data)` calls the function
with the loaded data. This lets `AsyncView` own the loading/error/idle rendering
while the caller controls what to render on success:

```typescript
<AsyncView state={state} onRetry={trigger}>
  {(items) => items.map(item => <TreeNode key={item.id} item={item} />)}
</AsyncView>
```

The `{(items) => ...}` in JSX is the `children` render prop. React treats any JSX
children as the `children` prop — a function as a child is the render prop pattern.

**`role="progressbar"` and `aria-label="Loading"` — spinner accessibility:**
A CSS spinner (animated div with a border) is invisible to screen readers — they
cannot see visual animation. `role="progressbar"` tells screen readers this element
indicates an operation in progress. `aria-label="Loading"` provides the text
announced. Screen reader users hear "Loading" when the spinner appears.

**CSS spinner:**
```css
.spinner {
  width:         24px;
  height:        24px;
  border:        3px solid var(--colour-border);
  border-top:    3px solid var(--colour-accent);
  border-radius: 50%;
  animation:     spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**`@keyframes` — first appearance:**
`@keyframes name { from { ... } to { ... } }` defines a CSS animation. `spin` rotates
the element from 0° to 360°. `animation: spin 0.8s linear infinite` applies it:
- `spin` — the keyframes name
- `0.8s` — one revolution takes 0.8 seconds
- `linear` — constant rotation speed (no easing)
- `infinite` — repeats forever

CSS animations run on the browser's compositor thread — they do not block JavaScript
and remain smooth even if the main thread is busy fetching data.

---

## Step 4 — Refactoring the File Tree

### Update `src/renderer/FileTree.tsx`

```typescript
import { useEffect } from 'react'
import { useAsyncState } from './hooks/useAsyncState.js'
import { AsyncView }     from './components/AsyncView.js'
import type { GitlabTreeItem } from '../../domain/fileTree.js'

interface FileTreeProps {
  gitlabUrl:  string
  token:      string
  projectId:  number
}

export function FileTree({ gitlabUrl, token, projectId }: FileTreeProps) {
  async function fetchRoot(): Promise<GitlabTreeItem[]> {
    const params = new URLSearchParams({ gitlabUrl, token, path: '' })
    const response = await fetch(
      `http://localhost:3001/api/projects/${projectId}/tree?${params}`,
    )
    if (!response.ok) {
      const err = await response.json() as { error: string }
      throw new Error(err.error ?? `HTTP ${response.status}`)
    }
    return response.json()
  }

  const { state, trigger } = useAsyncState(fetchRoot)

  useEffect(() => { trigger() }, [trigger])

  return (
    <div className="file-tree" role="tree" aria-label="Project file tree">
      <AsyncView
        state={state}
        onRetry={trigger}
        loadingText="Loading file tree..."
      >
        {(items) =>
          items.map((item) => (
            <TreeNode key={item.id} item={item} projectId={projectId}
                      gitlabUrl={gitlabUrl} token={token} depth={0} />
          ))
        }
      </AsyncView>
    </div>
  )
}
```

**The refactoring result:**
The `FileTree` component no longer manages `loading`, `error`, and `data` states
directly — `useAsyncState` owns all three. The component only needs to define `fetchRoot`
and pass it to `useAsyncState`. `AsyncView` handles rendering the spinner, error, and
retry. `FileTree` focuses on its one job: composing the tree display.

**SE lens — the single responsibility after refactoring:**
Before: `FileTree` managed data fetching, loading state, error state, and tree
rendering — four responsibilities. After: `useAsyncState` manages the async state
machine; `AsyncView` renders the state; `FileTree` defines what to fetch and how to
render success. Each unit has one responsibility.

---

## Step 5 — Pagination Warning

**Adding a note for the Definition of Done:**
If a GitLab directory has more than 100 files, the Trees API returns the first 100.
The `X-Total-Pages` response header tells us whether there are more pages. For lesson
15, if more than 100 files are in a single directory, add a warning below the tree:

```typescript
// In the fetch function, after checking response.ok:
const totalPages = Number(response.headers.get('X-Total-Pages') ?? '1')
const items      = await response.json() as GitlabTreeItem[]
if (totalPages > 1) {
  console.warn(`Directory has ${totalPages} pages — only first 100 items shown`)
}
return items
```

Full pagination implementation (fetching all pages) is left as an extension exercise.

---

## Connect the Pieces

The `useAsyncState` hook and `AsyncView` component are used for every async
operation added in lessons 16–30:
- Checking out a file (lesson 18) — `useAsyncState(checkoutFile)`
- Downloading a file (lesson 19) — `useAsyncState(downloadFile)`
- Loading version history (lesson 22) — `useAsyncState(fetchVersionHistory)`
- Searching for files (lesson 24) — `useAsyncState(searchFiles)`

Building the pattern once and reusing it means every operation gets error handling
and retry for free.

---

## What Breaks Without This

**Without explicit loading state:**
Between the user clicking "Connect Project" and the tree appearing, the panel is
blank. The user does not know whether the app is working or stuck. If the API is slow
(5 seconds), the user may click "Connect" again, triggering a duplicate request.
The spinner tells the user "work is happening" and prevents repeat clicks.

**Without the retry button:**
If the GitLab API returns 503 (rate limit exceeded), the tree fails to load. The
user must close and reopen the app to retry. A Retry button triggers `trigger()` —
the same fetch — without restarting the app.

**Without `role="progressbar"` on the spinner:**
Screen reader users hear nothing while the tree is loading. They cannot distinguish
between "the tree is loading" and "no files exist." The ARIA role announces the
loading state.

---

## Definition of Done

- [ ] The file tree shows a spinner during the initial fetch
- [ ] If the GitLab API is unreachable, an error message and Retry button appear
- [ ] Clicking Retry re-fetches the tree
- [ ] The spinner animation is smooth and does not stutter during data fetch
- [ ] You can draw the `AsyncState<T>` state machine as a diagram with states and transitions
- [ ] You can explain custom hooks — what they are, why they start with `use`, what they can contain
- [ ] You can explain the render prop pattern and show how `children(data)` works
- [ ] You can explain `@keyframes` and CSS animations — which thread they run on and why that matters
- [ ] You can explain why a union type is safer than boolean flags for UI state
- [ ] Run:
      ```
      git add src/renderer/
      git commit -m "Add error handling and loading states: useAsyncState hook, AsyncView render-prop component, CSS spinner with ARIA"
      ```

---

*Next: Lesson 16 — The Checkout Domain Function. Phase 4 begins. The core PDM
feature: a file can be checked out by exactly one user. The domain function enforces
this rule. The TOCTOU race condition is identified.*
