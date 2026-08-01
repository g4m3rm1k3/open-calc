# SE Masterclass — LAB-41 — File Explorer

**Language: TypeScript (Browser)** — same module as LAB-37–40.

**Prerequisites:** LAB-06 (trees) and LAB-33 (components). A file system IS a tree; a file explorer UI is a RECURSIVE COMPONENT — a component that renders instances of ITSELF for its children.

**What this lab adds:**
- A recursive tree data model (a folder CONTAINS more folders — LAB-06's tree, unchanged)
- A recursive COMPONENT: `FolderView` calling `FolderView` again for each child folder
- Per-node expand/collapse state, using LAB-32 signals — one signal PER node, not one global "which nodes are open" list
- Lazy rendering: children aren't rendered at all until their parent is expanded

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A file tree can be arbitrarily deep — 2 levels, or 20. Why can't you write a SEPARATE component for each possible depth?
> 2. If `expanded` state lived in ONE global array of "which folder IDs are open," what would happen as the number of folders in the tree grew very large?
> 3. If a folder's children are ALWAYS rendered (even while collapsed, just hidden with CSS), what's the cost for a folder containing 10,000 deeply nested files?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the browser shows an expandable/collapsible file tree:

```
▶ src
▶ node_modules
📄 package.json
📄 README.md
```
Clicking `▶ src` expands it:
```
▼ src
  📄 main.ts
  ▶ components
📄 package.json
```

---

### Concept: A Recursive Component

**What it is:** A component that, as part of rendering ITSELF, creates and renders MORE INSTANCES of itself — for each child in a recursive data structure. This is LAB-07's recursion (a function calling itself), applied to UI components instead of numeric computations.

**The problem before:** LAB-33's components handled FIXED, known structure (a `Card` with a title and content). A file tree's DEPTH is not known in advance — a folder might contain files, or MORE folders, which might contain MORE folders, arbitrarily deep. Writing `FolderLevel1`, `FolderLevel2`, `FolderLevel3`, ... components would require guessing a maximum depth, and would still break for anything deeper.

**The solution:** `FolderView`, when rendering a CHILD that is itself a folder, calls `FolderView` AGAIN, on that child. The recursion naturally handles ANY depth, with a base case (a FILE, not a folder) stopping the recursion — exactly LAB-06/07's base case/recursive case contract.

---

## Step 1 — The Tree Data Model

```ts
// file-tree.ts
export interface FileNode {
  type: 'file'
  name: string
}
export interface FolderNode {
  type: 'folder'
  name: string
  children: (FileNode | FolderNode)[]        // ← add: RECURSIVE — a folder contains more of the SAME type
}
export type TreeNode = FileNode | FolderNode

export const sampleTree: FolderNode = {
  type: 'folder',
  name: 'project',
  children: [
    {
      type: 'folder',
      name: 'src',
      children: [
        { type: 'file', name: 'main.ts' },
        { type: 'folder', name: 'components', children: [
          { type: 'file', name: 'button.ts' },
        ]},
      ],
    },
    { type: 'folder', name: 'node_modules', children: [] },
    { type: 'file', name: 'package.json' },
    { type: 'file', name: 'README.md' },
  ],
}
```

### SAVE AND TRY

```bash
npx ts-node -e "import { sampleTree } from './file-tree'; console.log(JSON.stringify(sampleTree, null, 2))"
```

**Confirm the recursive TYPE definition:** `FolderNode.children` is typed as `(FileNode | FolderNode)[]` — a folder's children can be MORE folders, each of which can have MORE children, recursively, with NO depth limit encoded anywhere in the type. This is LAB-06's `TreeNode { left: TreeNode | null, right: TreeNode | null }` shape, generalized from exactly 2 children to any NUMBER of children.

---

## Step 2 — A Recursive Rendering Component

```ts
// folder-view.ts
import { TreeNode, FolderNode } from './file-tree'
import { createSignal, createEffect } from './signals'

export function FolderView(node: TreeNode): HTMLElement {
  if (node.type === 'file') {                              // ← add: BASE CASE — a file, no recursion
    const el = document.createElement('div')
    el.textContent = `📄 ${node.name}`
    el.style.paddingLeft = '20px'
    return el
  }

  // node.type === 'folder' — RECURSIVE CASE
  const [expanded, setExpanded] = createSignal(false)         // ← add: ONE signal, PRIVATE to THIS folder instance
  const container = document.createElement('div')
  const header = document.createElement('div')
  header.style.cursor = 'pointer'
  header.addEventListener('click', () => setExpanded(!expanded()))

  const childrenContainer = document.createElement('div')
  childrenContainer.style.paddingLeft = '20px'

  createEffect(() => {
    header.textContent = `${expanded() ? '▼' : '▶'} ${node.name}`
    childrenContainer.innerHTML = ''
    if (expanded()) {
      for (const child of node.children) {
        childrenContainer.appendChild(FolderView(child))       // ← add: THE RECURSIVE CALL — FolderView calling FolderView
      }
    }
  })

  container.append(header, childrenContainer)
  return container
}
```

```ts
// main.ts
import { FolderView } from './folder-view'
import { sampleTree } from './file-tree'

const app = document.querySelector<HTMLDivElement>('#app')!
app.appendChild(FolderView(sampleTree))
```

### SAVE AND TRY

Save. The browser should show `▼ project` (or `▶ project`, depending on default `expanded` state) with clickable folder rows. Click a folder to expand/collapse it.

**Confirm the recursion visits every level correctly:** Expand `project` → `src` → `components` — each click triggers `FolderView` being called AGAIN on the clicked node's children, exactly like LAB-07's `factorial(4)` calling `factorial(3)` calling `factorial(2)`... The BASE CASE (`node.type === 'file'`) is what eventually stops the recursion at the leaves — a file NEVER calls `FolderView` again, exactly like `factorial(0)` never calls `factorial(-1)`.

---

## Step 3 — Confirm Independent Per-Node State

Expand `src`, then expand `components` — but leave `node_modules` (a sibling folder) collapsed.

### SAVE AND TRY

Click around the tree. Confirm expanding one folder never affects any OTHER folder's expand/collapse state.

**Confirm WHY this independence exists:** Each CALL to `FolderView(node)` creates its OWN `createSignal(false)` — exactly like LAB-33's TWO independent `Counter()` instances (LAB-33's Step 3) never shared state, because each function call gets its own closure. `project`'s `expanded` signal, `src`'s `expanded` signal, and `components`' `expanded` signal are THREE completely separate signals, created by THREE separate calls to `FolderView`, even though they're all running the exact same function body.

---

### Concept: Lazy Rendering — Don't Build What Isn't Shown

**What it is:** `childrenContainer.innerHTML = ''` followed by "only append children `if (expanded())`" means a COLLAPSED folder's children are NEVER rendered at all — not hidden with CSS, genuinely NOT CONSTRUCTED as DOM nodes (or recursively called) until the user actually expands that folder.

**The problem before:** If EVERY folder's children were always rendered (just hidden via `display: none`), a large project with thousands of files nested many folders deep would force the browser to construct THOUSANDS of DOM elements on initial load, even though the user might only ever look at a handful of them — LAB-08's complexity lens applied to UI construction cost.

**The solution:** This lab's Step 2 ALREADY does this correctly — the `if (expanded())` check inside the `createEffect` means the recursive `FolderView(child)` calls for a folder's children only happen WHEN that folder is expanded, not eagerly for the whole tree up front.

---

## 🎯 Challenge: Recursive Search/Filter

**You know:** Recursion visits every node in a tree; filtering means deciding, at each node, whether it (or anything beneath it) matches.

**Task:** Write `containsMatch(node, query)` that returns `true` if the node's name (or ANY descendant's name) contains the search query, and use it to auto-expand folders leading to a match while highlighting matched names.

<details>
<summary>▶ Show Solution</summary>

```ts
function containsMatch(node: TreeNode, query: string): boolean {
  if (node.name.toLowerCase().includes(query.toLowerCase())) return true    // this node itself matches
  if (node.type === 'file') return false                                     // base case — files have no children to check
  return node.children.some(child => containsMatch(child, query))            // recursive case — ANY child matches?
}

// Usage inside FolderView, when a search query is active:
// if (containsMatch(node, currentQuery)) { setExpanded(true) }  — auto-open folders leading to a result
```

**Key insight:** `containsMatch` is structurally IDENTICAL to LAB-06's `contains(node, target)` for a binary search tree — base case (a leaf, here a file, returns based on its own value), recursive case (check if ANY child satisfies the condition, via `.some()` instead of checking a specific left/right side, since a folder can have any number of children instead of exactly two). The generalization from "binary tree, 2 children" to "file tree, N children" only changes HOW you iterate children (`.some()` over an array instead of checking `left`/`right` individually) — the underlying recursive SHAPE is unchanged.

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| `FolderView` calling itself | VS Code's file explorer, macOS Finder's list view, any OS file browser |
| Per-node `expanded` signal | React's per-component `useState` for expand/collapse — the exact same independence guarantee |
| Lazy rendering on expand | VS Code genuinely does NOT render a folder's contents until you click to expand it — for exactly this performance reason |
| `containsMatch` recursion | VS Code's "Search in Files" auto-expanding folders containing a match |

**Where you will see this again:** LAB-43 (IDE Layout System) builds a FULL IDE shell, likely including a file explorer panel using exactly this pattern.

---

## Final Check

| Feature | How to verify |
|---|---|
| The tree renders correctly, with files and folders visually distinguished | Step 1–2 |
| Clicking a folder toggles its expand/collapse state | Step 2 |
| Nested folders (folders within folders) render correctly at any depth | Step 2 |
| Expanding one folder never affects a sibling folder's state | Step 3 |
| A collapsed folder's children are not rendered until expanded | Concept box |
| `containsMatch` correctly finds a match anywhere in the subtree | Challenge |
| You can explain, without notes, why a recursive component handles arbitrary depth | Concept box |

---

## Quick Check Answers

**1. Why can't you write a separate component per depth level?**

Because the tree's depth is not known in advance and can vary arbitrarily — a project might nest folders 2 levels deep or 20, and a FIXED set of components (`FolderLevel1`, `FolderLevel2`, ...) would require guessing a maximum and would still break the moment a REAL project exceeds it. A RECURSIVE component (Step 2) handles any depth uniformly, because it doesn't need to know the depth in advance — it just keeps calling itself for however many levels actually exist, the same way LAB-07's `factorial` doesn't need a different function per possible input size.

**2. One global "which folder IDs are open" array — what happens as the tree grows?**

Every expand/collapse action would need to search or update this GLOBAL, ever-growing collection — and worse, EVERY folder's rendering would need to check "is MY id in this global list?" rather than simply reading its OWN local state, creating an unnecessary coupling between folders that have nothing to do with each other. Step 2's per-node signal (LAB-33's private-state pattern) avoids this entirely — each folder's expand state is independent, local data, with no shared global structure to search or synchronize as the tree grows.

**3. Cost of always rendering children, even while collapsed?**

For 10,000 deeply nested files, EVERY SINGLE ONE would be constructed as real DOM nodes (and, in this lab's recursive design, would trigger real recursive `FolderView` calls) immediately on load — even though the vast majority are hidden and may never be viewed by the user at all. This is real, measurable waste (LAB-08's complexity lens): construction cost scales with the TOTAL tree size, not with what's actually VISIBLE, which is exactly the problem this lab's lazy rendering (only recursing into `expanded()` folders) avoids.

---

*Next: [LAB-42 — Terminal Emulator](LAB-42-terminal-emulator.md) — TypeScript (Browser), same module*
