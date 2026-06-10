# Vault PDM — Lesson 12 — Fetching the File Tree

## What You Will Build

The main panel shows a file tree: a collapsible folder hierarchy of all files in the
selected GitLab project. Clicking a folder expands or collapses it. Files show their
name and file type. The data comes from GitLab's Repository Trees API. The file tree
component is recursive — the same component renders folders within folders.

## What You Need to Know First

Lessons 01–11. The user is authenticated and has selected a project. The PAT and
project ID are in the renderer state. This lesson fetches the project's file structure
and renders it.

---

## The Problem

A GitLab project's files form a **tree** structure: folders contain files and other
folders, recursively. The GitLab API returns this tree level-by-level — one API call
per directory. Rendering a tree in React requires either a flattened representation
or **recursive components** — a component that renders instances of itself for nested
items.

---

## Step 1 — Tree Data Structures

**Tree — first appearance:**
A **tree** is a hierarchical data structure where each node has zero or one parent
and zero or more children. Every tree has one root node (no parent). Nodes with no
children are called **leaves**.

The file system is a tree: the root directory contains subdirectories and files;
subdirectories contain further subdirectories and files. The GitLab project's
repository has the same structure.

Key tree operations:
- **Traversal** — visiting every node. In a file tree, traversal finds all files.
- **Depth-first traversal** — visit a node, then recursively visit its children,
  then continue to siblings. Produces files in directory order (the natural order
  for a file tree display).
- **Breadth-first traversal** — visit all nodes at depth 1, then all at depth 2, etc.
  Less useful for file trees.

**CS lens — tree depth and performance:**
The GitLab Trees API returns one level at a time. A project with deeply nested folders
(6 levels deep, 10 items per level) requires up to `10⁶ = 1,000,000` API calls if
fully expanded — clearly impractical. Real file tree UIs use **lazy loading**: fetch
one level at a time, only when the user expands a folder. This is the approach here.

---

## Step 2 — The GitLab Repository Trees API

**Repository Trees API — first appearance:**
`GET /api/v4/projects/:id/repository/tree?path=&ref=main&per_page=100`

Parameters:
- `path` — the directory to list. Empty string = root directory.
- `ref` — the branch or tag to browse. `main` is the default branch.
- `per_page` — number of items per page. Maximum is 100.

Response item:
```json
{
  "id":   "a1b2c3d4...",
  "name": "designs",
  "type": "tree",
  "path": "designs",
  "mode": "040000"
}
```

`type` is either `"tree"` (directory) or `"blob"` (file).

**Pagination — first appearance:**
When a directory has more than 100 items, GitLab returns only the first 100 and
includes pagination headers. The `X-Next-Page` response header contains the page
number to request next. `X-Total-Pages` contains the total page count.

For this lesson, `per_page=100` is sufficient for most real projects. Lesson 15
(error handling) adds a note about pagination for very large directories.

---

## Step 3 — Data Layer: Tree Fetching

### Update `src/data/gitlab.ts`

```typescript
export interface GitlabTreeItem {
  id:   string
  name: string
  type: 'tree' | 'blob'
  path: string
  mode: string
}

export async function fetchProjectTree(
  gitlabUrl:  string,
  token:      string,
  projectId:  number,
  path:       string = '',
): Promise<GitlabTreeItem[]> {
  const params = new URLSearchParams({
    ref:      'main',
    per_page: '100',
    path,
  })
  const url = `${gitlabUrl}/api/v4/projects/${projectId}/repository/tree?${params}`

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch tree at path '${path}': ${response.status}`)
  }

  return response.json() as Promise<GitlabTreeItem[]>
}
```

**`URLSearchParams` — first appearance:**
`new URLSearchParams({ key: value, ... })` builds a URL query string from an object.
`params.toString()` produces `ref=main&per_page=100&path=designs`. It handles URL
encoding automatically — a path containing spaces or special characters is properly
percent-encoded. Never build query strings with string concatenation:
`?path=${path}` would break if `path` contains `&` or `=`.

---

## Step 4 — Domain Layer and API Route

### Create `src/domain/fileTree.ts`

```typescript
import { fetchProjectTree, type GitlabTreeItem } from '../data/gitlab.js'

export async function getProjectTree(
  gitlabUrl:  string,
  token:      string,
  projectId:  number,
  path:       string = '',
): Promise<GitlabTreeItem[]> {
  const items = await fetchProjectTree(gitlabUrl, token, projectId, path)
  return items.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'tree' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}
```

**Sorting: folders before files, alphabetically within type:**
`a.type === 'tree' ? -1 : 1` puts folders first (sort comparators returning `-1`
mean "a comes before b"). `localeCompare` compares strings correctly for the user's
locale — case-insensitive, handles accented characters. This is the standard file
tree display order used by VS Code, macOS Finder, and Windows Explorer.

### Add API route:

```typescript
app.get('/api/projects/:projectId/tree', async (request, response) => {
  const projectId = Number(request.params.projectId)
  const path      = String(request.query.path ?? '')
  const { gitlabUrl, token } = request.query as { gitlabUrl: string; token: string }

  try {
    const items = await getProjectTree(gitlabUrl, token, projectId, path)
    response.json(items)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tree'
    response.status(500).json({ error: message })
  }
})
```

---

## Step 5 — The Recursive File Tree Component

### The problem

A folder component renders a list of items. Each item is either a file or a folder.
A folder renders a list of items. This is a recursive definition.

### Create `src/renderer/FileTree.tsx`

```typescript
import { useState, useCallback } from 'react'
import type { GitlabTreeItem }    from '../../domain/fileTree.js'
import './FileTree.css'

interface FileTreeProps {
  gitlabUrl:  string
  token:      string
  projectId:  number
}

export function FileTree({ gitlabUrl, token, projectId }: FileTreeProps) {
  const [rootItems, setRootItems] = useState<GitlabTreeItem[] | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const loadRoot = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ gitlabUrl, token, path: '' })
      const response = await fetch(
        `http://localhost:3001/api/projects/${projectId}/tree?${params}`,
      )
      const data = await response.json() as GitlabTreeItem[]
      setRootItems(data)
    } catch {
      setError('Failed to load file tree')
    } finally {
      setLoading(false)
    }
  }, [gitlabUrl, token, projectId])

  useEffect(() => { loadRoot() }, [loadRoot])

  if (loading) return <div className="tree-loading">Loading file tree...</div>
  if (error)   return <div className="tree-error">{error}</div>
  if (rootItems === null) return null

  return (
    <div className="file-tree" role="tree" aria-label="Project file tree">
      {rootItems.map((item) => (
        <TreeNode
          key={item.id}
          item={item}
          gitlabUrl={gitlabUrl}
          token={token}
          projectId={projectId}
          depth={0}
        />
      ))}
    </div>
  )
}
```

**`useCallback` — first appearance:**
`useCallback(fn, [deps])` returns a memoised version of `fn` — the same function
object across renders, unless `deps` changes. This matters because `useEffect`
has `[loadRoot]` as a dependency. Without `useCallback`, `loadRoot` is a new
function object on every render, causing `useEffect` to re-fire on every render —
an infinite fetch loop.

**`role="tree"` and `aria-label` — ARIA for accessibility:**
`role="tree"` tells screen readers that this is a tree widget. `aria-label="Project
file tree"` provides a human-readable name. ARIA roles are not styling — they are
semantic annotations that assistive technologies use to announce the structure of
the page.

### The recursive `TreeNode` component

```typescript
interface TreeNodeProps {
  item:       GitlabTreeItem
  gitlabUrl:  string
  token:      string
  projectId:  number
  depth:      number
}

function TreeNode({ item, gitlabUrl, token, projectId, depth }: TreeNodeProps) {
  const [expanded, setExpanded]     = useState(false)
  const [children, setChildren]     = useState<GitlabTreeItem[] | null>(null)
  const [loadingChildren, setLoadingChildren] = useState(false)

  async function handleFolderClick(): Promise<void> {
    if (item.type !== 'tree') return

    if (!expanded && children === null) {
      setLoadingChildren(true)
      try {
        const params = new URLSearchParams({ gitlabUrl, token, path: item.path })
        const response = await fetch(
          `http://localhost:3001/api/projects/${projectId}/tree?${params}`,
        )
        const data = await response.json() as GitlabTreeItem[]
        setChildren(data)
      } catch {
        // leave children null — folder shows as collapsed on next click
      } finally {
        setLoadingChildren(false)
      }
    }
    setExpanded(!expanded)
  }

  const paddingLeft = depth * 16 + 8

  if (item.type === 'blob') {
    return (
      <div
        className="tree-file"
        style={{ paddingLeft }}
        role="treeitem"
        aria-label={item.name}
      >
        <FileIcon name={item.name} />
        <span className="tree-item-name">{item.name}</span>
      </div>
    )
  }

  return (
    <div role="treeitem" aria-expanded={expanded}>
      <div
        className="tree-folder"
        style={{ paddingLeft }}
        onClick={handleFolderClick}
      >
        <span className="tree-chevron">{expanded ? '▾' : '▸'}</span>
        <span className="tree-item-name">{item.name}</span>
        {loadingChildren && <span className="tree-spinner">...</span>}
      </div>
      {expanded && children !== null && (
        <div className="tree-children">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              gitlabUrl={gitlabUrl}
              token={token}
              projectId={projectId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Recursion in React — first appearance:**
`TreeNode` renders `TreeNode` — a component that renders instances of itself. This
is **recursive rendering**. React handles this identically to any other component
tree — the recursion terminates when a node has `type === 'blob'` (no `TreeNode`
children rendered). Each level of nesting is an independent component with its own
`expanded` and `children` state.

**`depth * 16` — visual indentation:**
Each level of nesting is indented 16 CSS pixels. `depth=0` (root items) → 8px
padding. `depth=1` → 24px. `depth=2` → 40px. Inline style is used here because the
depth value is dynamic — it cannot be expressed as a static CSS class.

**Lazy loading — fetch on expand:**
`children` starts as `null`. When a folder is first expanded (`!expanded && children
=== null`), the API is called and children are fetched. Subsequent expand/collapse
uses the cached `children` — no additional API calls. This is **lazy loading**:
defer loading until the data is needed. Eagerly fetching the entire tree would
require thousands of API calls for a large project.

**CS lens — memoisation:**
Storing `children` in state after the first fetch is **memoisation** — caching the
result of an expensive operation (the API call) to avoid repeating it. `children
=== null` is the cache miss signal; anything else is a cache hit. This is the same
concept as function memoisation (caching function results by input) applied to
component state (caching API results by path).

---

## Step 6 — The FileIcon helper

```typescript
function FileIcon({ name }: { name: string }) {
  const extension = name.split('.').pop()?.toLowerCase() ?? ''
  const icons: Record<string, string> = {
    step: '⚙', stp: '⚙', iges: '⚙', igs: '⚙',
    pdf:  '📄', dwg: '📐', dxf: '📐',
    jpg: '🖼', png: '🖼', svg: '🖼',
  }
  return <span className="tree-icon">{icons[extension] ?? '📁'}</span>
}
```

**`name.split('.').pop()?.toLowerCase()`:**
- `.split('.')` splits `'housing-v3.step'` into `['housing-v3', 'step']`
- `.pop()` returns and removes the last element: `'step'`
- `?.` — optional chaining (introduced in calc project lesson 18): handles the case
  where `split` returns a one-element array (no `.`) and `pop` returns `undefined`
- `.toLowerCase()` normalises `'STEP'` to `'step'` for the lookup

---

## Connect the Pieces

The file tree panel has two layers of data:
- **GitLab source of truth** — the actual file content (fetched from the Trees API)
- **Vault metadata overlay** — lock status, version count (queried from PostgreSQL)

Lesson 13 adds the metadata overlay: after fetching the tree, Vault upserts file
records into the `files` table. Lesson 14 adds lock status badges to each file row.

---

## What Breaks Without This

**Without lazy loading:**
Fetching the full tree recursively on load makes one API call per directory. A project
with 200 directories makes 200 sequential API calls. At 100ms per call, the file tree
takes 20 seconds to appear. GitLab's API rate limits would be hit. The lazy-load
approach makes one API call per user action — the load time is proportional to user
interaction, not project size.

**Without `useCallback` wrapping `loadRoot`:**
`useEffect(() => { loadRoot() }, [loadRoot])` fires every time `loadRoot` changes.
Without `useCallback`, `loadRoot` is a new function on every render. The effect fires
on every render. `loadRoot` fetches data and calls `setRootItems`. `setRootItems`
triggers a render. The render creates a new `loadRoot`. The effect fires again. This
is an infinite loop — the app fetches the tree indefinitely, exhausting the GitLab
API and freezing the UI.

---

## Definition of Done

- [ ] The file tree panel shows folders and files from the GitLab project
- [ ] Clicking a folder expands it and shows its contents (one API call per expansion)
- [ ] Clicking an expanded folder collapses it (no additional API call)
- [ ] File icons differ by extension (STEP, PDF, DWG, image)
- [ ] The tree displays files before or after folders — you can explain the sort order
- [ ] You can explain lazy loading and why fetching the full tree eagerly is impractical
- [ ] You can explain recursive React components — how they terminate, how state is per-instance
- [ ] You can explain `useCallback` and why removing it causes an infinite loop
- [ ] You can explain `URLSearchParams` and why it is better than string concatenation for query strings
- [ ] Run:
      ```
      git add src/data/ src/domain/ src/api/ src/renderer/
      git commit -m "Add file tree: GitLab Repository Trees API, lazy-loaded recursive TreeNode component, folder/file distinction"
      ```

---

*Next: Lesson 13 — Syncing the File Tree to the Database. When the tree is loaded,
Vault upserts file records into the `files` table. This creates the metadata records
that will hold lock and version data in later lessons.*
