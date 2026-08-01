# SE Masterclass — LAB-43 — IDE Layout System

**Language: TypeScript (Browser)** — the capstone of Phase 3.

**Prerequisites:** LAB-41 (recursive components — a layout is a recursive tree, exactly like a file tree), LAB-30 (drag interactions), LAB-32 (signals for reactive resizing). This lab combines LAB-41's file explorer and LAB-42's terminal as real panel CONTENT inside the layout it builds.

**What this lab adds:**
- A layout as a RECURSIVE TREE: a panel is either a `Leaf` (actual content) or a `Split` (divides space between two child panels)
- Recursive rendering, exactly LAB-41's `FolderView` pattern, applied to layout instead of files
- Draggable dividers that resize panels reactively, using signals
- Assembling LAB-41's file explorer and LAB-42's terminal as real content inside a working mini-IDE shell

**Time:** 100–120 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A layout with a sidebar, an editor, and a bottom terminal panel has THREE visible regions. How many SPLITS (not leaves) does that require, and why is it one fewer than the number of leaves?
> 2. Dragging a divider between two panels needs to update BOTH panels' sizes simultaneously and in COORDINATION. Why can't each panel just track its own width independently?
> 3. What's the minimum information a `Split` node needs to know how to render its two children at the right sizes?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the browser shows a VSCode-like layout: a file explorer on the left, an editor area in the middle, and a terminal along the bottom — all resizable by dragging the dividers between them.

```
┌──────────┬────────────────────────┐
│          │                        │
│  Files   │       Editor           │
│          │                        │
│          ├────────────────────────┤
│          │       Terminal         │
└──────────┴────────────────────────┘
```

---

### Concept: A Layout Is a Recursive Tree of Splits

**What it is:** A resizable panel layout is a TREE (LAB-06/41, again): a `Split` node divides its space between two children ALONG ONE AXIS (horizontal or vertical), each of which is EITHER another `Split` (nested further) or a `Leaf` (actual panel content, with no further subdivision). This is the exact recursive shape as LAB-41's file tree — `Split` plays the role of `FolderNode`, `Leaf` plays the role of `FileNode`.

**The layout in "What You Will Build," expressed as a tree:**
```
Split (horizontal, ratio 0.2)
├── Leaf: "Files"
└── Split (vertical, ratio 0.7)
    ├── Leaf: "Editor"
    └── Leaf: "Terminal"
```

---

## Step 1 — The Layout Data Model

```ts
// layout.ts
import { createSignal } from './signals'

export interface Leaf {
  type: 'leaf'
  render: () => HTMLElement          // ← add: content is just ANY function producing a DOM node — LAB-33's component idea
}
export interface Split {
  type: 'split'
  direction: 'horizontal' | 'vertical'
  ratio: ReturnType<typeof createSignal<number>>    // ← add: a SIGNAL — draggable, reactive (LAB-32)
  first: LayoutNode
  second: LayoutNode
}
export type LayoutNode = Leaf | Split

export function leaf(render: () => HTMLElement): Leaf {
  return { type: 'leaf', render }
}
export function split(direction: 'horizontal' | 'vertical', initialRatio: number, first: LayoutNode, second: LayoutNode): Split {
  return { type: 'split', direction, ratio: createSignal(initialRatio), first, second }
}
```

### SAVE AND TRY

```bash
npx ts-node -e "
import { leaf, split } from './layout'
const layout = split('horizontal', 0.2,
  leaf(() => document.createElement('div')),
  split('vertical', 0.7, leaf(() => document.createElement('div')), leaf(() => document.createElement('div')))
)
console.log(JSON.stringify(layout.direction), layout.ratio[0]())
"
```

**Expected:** `"horizontal" 0.2`

**Confirm the tree shape matches the Concept box diagram exactly:** The OUTER `split` divides `Files` from an INNER `split` (which itself divides `Editor` from `Terminal`) — three leaves, two splits, nested exactly as drawn.

---

## Step 2 — Recursive Rendering

```ts
// Add to layout.ts:
import { createEffect } from './signals'

export function renderLayout(node: LayoutNode): HTMLElement {
  if (node.type === 'leaf') {                          // ← add: BASE CASE — LAB-41's exact pattern
    const container = document.createElement('div')
    container.style.overflow = 'auto'
    container.appendChild(node.render())
    return container
  }

  // node.type === 'split' — RECURSIVE CASE
  const container = document.createElement('div')
  container.style.display = 'flex'
  container.style.flexDirection = node.direction === 'horizontal' ? 'row' : 'column'
  container.style.height = '100%'
  container.style.width = '100%'

  const firstPane = renderLayout(node.first)             // ← add: THE RECURSIVE CALL — same shape as LAB-41's FolderView
  const secondPane = renderLayout(node.second)

  const divider = document.createElement('div')
  divider.style.background = '#999'
  divider.style[node.direction === 'horizontal' ? 'width' : 'height'] = '4px'
  divider.style.cursor = node.direction === 'horizontal' ? 'col-resize' : 'row-resize'

  createEffect(() => {                                    // ← add: LAB-32 — ratio changes automatically resize both panes
    const [ratio] = node.ratio
    const pct = ratio() * 100
    firstPane.style.flex = `0 0 ${pct}%`
    secondPane.style.flex = `1 1 ${100 - pct}%`
  })

  container.append(firstPane, divider, secondPane)
  return container
}
```

Add to `main.ts`:

```ts
import { leaf, split, renderLayout } from './layout'

const app = document.querySelector<HTMLDivElement>('#app')!
app.style.height = '400px'

function placeholderPanel(label: string): () => HTMLElement {
  return () => {
    const el = document.createElement('div')
    el.textContent = label
    el.style.padding = '8px'
    el.style.border = '1px solid #ccc'
    el.style.height = '100%'
    return el
  }
}

const layout = split('horizontal', 0.2,
  leaf(placeholderPanel('Files')),
  split('vertical', 0.7, leaf(placeholderPanel('Editor')), leaf(placeholderPanel('Terminal')))
)

app.appendChild(renderLayout(layout))
```

### SAVE AND TRY

Save. Confirm the browser shows three labeled panels arranged as in the Concept box diagram, sized according to their ratios (20% / 80% split horizontally, then 70% / 30% split vertically within the right side).

**Confirm this is LAB-41's recursion, unchanged in SHAPE:** `renderLayout` calling `renderLayout` for `node.first` and `node.second` is STRUCTURALLY identical to `FolderView` calling `FolderView` for each child — the only difference is a `Split` always has EXACTLY 2 children (not an arbitrary number, like a folder), so the recursive calls are two individually-named calls instead of a loop over an array.

---

## Step 3 — Draggable Dividers

```ts
// Modify the divider creation inside renderLayout to add drag behavior:
let dragging = false
divider.addEventListener('mousedown', () => { dragging = true })
window.addEventListener('mousemove', (e) => {
  if (!dragging) return
  const rect = container.getBoundingClientRect()
  const newRatio = node.direction === 'horizontal'
    ? (e.clientX - rect.left) / rect.width
    : (e.clientY - rect.top) / rect.height
  node.ratio[1](Math.max(0.1, Math.min(0.9, newRatio)))    // ← add: clamp — never let a panel shrink to nothing or take everything
})
window.addEventListener('mouseup', () => { dragging = false })
```

### SAVE AND TRY

Save. Drag the divider between "Files" and the right side — confirm both panels resize live as you drag. Drag the divider between "Editor" and "Terminal" — confirm it resizes independently of the outer split.

**Confirm the reactive chain, end to end:** `mousemove` → `node.ratio[1](newRatio)` (a LAB-32 signal write) → the `createEffect` inside `renderLayout` (which reads `ratio()`) automatically re-runs → `firstPane.style.flex`/`secondPane.style.flex` update. Exactly LAB-38's node-dragging pattern (signal-driven position), applied to panel SIZE instead of node POSITION.

**Confirm the clamp matters:** Try dragging a divider all the way to one edge. Confirm the panel stops shrinking at 10% instead of disappearing entirely (`Math.max(0.1, ...)`) — an UNCLAMPED ratio could reach `0` or `1`, making one panel literally zero-width and impossible to grab or resize back, a real usability trap this clamp directly prevents.

---

## Step 4 — Assemble a Real Mini-IDE

```ts
import { FolderView } from './folder-view'          // LAB-41
import { sampleTree } from './file-tree'             // LAB-41
// (a real terminal panel would import LAB-42's terminal-building code similarly)

const realLayout = split('horizontal', 0.2,
  leaf(() => FolderView(sampleTree)),                // ← add: LAB-41's REAL file explorer, as actual panel content
  split('vertical', 0.7,
    leaf(placeholderPanel('Editor (LAB-39\'s markdown editor could go here)')),
    leaf(placeholderPanel('Terminal (LAB-42\'s terminal could go here)')),
  )
)

app.innerHTML = ''
app.appendChild(renderLayout(realLayout))
```

### SAVE AND TRY

Save. Confirm the LEFT panel now shows a REAL, working, expandable file tree (LAB-41's actual component, unchanged) instead of a placeholder — while still being resizable via the SAME dividers from Step 3.

**Confirm zero coupling between the layout system and the panel content:** `renderLayout` never needed to know ANYTHING about what a `FolderView` is — a `Leaf`'s `render` field is just "a function returning an `HTMLElement`" (LAB-17's interface pattern, at its simplest). ANY component built in this entire phase — the reactive spreadsheet (LAB-37), the drawing app (LAB-40), the terminal (LAB-42) — could slot into this layout with zero changes to `layout.ts`, because they all satisfy the exact same minimal contract.

---

## 🎯 Challenge: Minimum Panel Size Constraint

**You know:** Step 3's `Math.max(0.1, Math.min(0.9, newRatio))` already prevents a RATIO from reaching the extremes — but ratio-based clamping doesn't account for the CONTAINER's actual pixel size (10% of a very narrow window could still be uselessly small).

**Task:** Modify the drag handler to enforce a minimum PIXEL width/height (say, 80px) for each pane, regardless of the container's overall size.

<details>
<summary>▶ Show Solution</summary>

```ts
window.addEventListener('mousemove', (e) => {
  if (!dragging) return
  const rect = container.getBoundingClientRect()
  const totalSize = node.direction === 'horizontal' ? rect.width : rect.height
  const minRatio = 80 / totalSize                          // 80px, expressed as a ratio of THIS container's actual size
  const maxRatio = 1 - minRatio

  const rawRatio = node.direction === 'horizontal'
    ? (e.clientX - rect.left) / rect.width
    : (e.clientY - rect.top) / rect.height
  node.ratio[1](Math.max(minRatio, Math.min(maxRatio, rawRatio)))
})
```

**Key insight:** A FIXED ratio bound (like Step 3's flat `0.1`/`0.9`) means "10% of whatever the container happens to be" — which is a MEANINGFULLY different absolute size on a tiny laptop screen versus an ultrawide monitor. Computing `minRatio` FROM the container's actual current pixel size (`80 / totalSize`) ties the constraint to something that matters practically (readable panel width) rather than something arbitrary (a fixed percentage) — the same "know what you're actually optimizing for" instinct as LAB-08's Big-O analysis caring about GROWTH, not just an arbitrary number.

</details>

---

## Mental Model: This IS VS Code's Layout System

| This lab | VS Code |
|---|---|
| `Split`/`Leaf` recursive tree | VS Code's internal `GridView` — literally a recursive split-pane tree |
| Draggable dividers with clamped ratios | VS Code's resizable panel borders |
| `Leaf.render()` as an arbitrary component | Any VS Code panel (explorer, editor, terminal, extensions) — pluggable, uniform contract |
| Assembling LAB-41 + LAB-42 into one shell | Exactly how a real IDE combines independently-built panels into one window |

**Phase 3 (Frontend Systems) complete.** Across three modules, you built: the raw DOM pain (Module 1), a working from-scratch reactive framework — signals, components, virtual DOM (Module 2) — and seven real applications combining all of it (Module 3), CULMINATING in a genuine mini-IDE shell assembled from components built in earlier labs. This is not a curriculum of disconnected exercises — LAB-41's file tree became a real panel in LAB-43's IDE; LAB-32's signals powered EVERY reactive UI from LAB-33 onward.

---

## Final Check

| Feature | How to verify |
|---|---|
| The layout tree correctly nests a horizontal split containing a vertical split | Step 1 |
| `renderLayout` correctly renders leaves and recursively renders nested splits | Step 2 |
| Dragging a divider resizes both adjacent panes reactively, live | Step 3 |
| Ratios are clamped so no panel can disappear entirely | Step 3 |
| LAB-41's real file explorer works correctly as layout content, unmodified | Step 4 |
| A minimum PIXEL size (not just ratio) constraint prevents unusably small panels | Challenge |
| You can explain, without notes, why `renderLayout` needs zero knowledge of what a `Leaf` contains | Step 4 |

---

## Quick Check Answers

**1. Three visible regions — how many splits, and why one fewer than leaves?**

Two splits for three leaves — demonstrated directly in the Concept box's tree diagram: the OUTER split divides "Files" from a NESTED split, and that nested split divides "Editor" from "Terminal." In general, a binary tree with `N` leaves always has exactly `N - 1` internal (split) nodes — each split, by definition, turns ONE region into TWO, so going from 1 region to `N` regions requires exactly `N - 1` splitting operations, regardless of how they're nested.

**2. Why can't each panel track its own width independently?**

Because the two panels sharing a divider are CONSTRAINED together — if one grows, the other must shrink by the exact same amount, or they'd either overlap or leave a gap. A single shared `ratio` signal (Step 1) on the `Split` node, read by BOTH panels' size calculations (Step 2's `createEffect`), guarantees this coordination automatically — there's only ONE number to update (via dragging), and both panels' sizes are DERIVED from it, exactly like LAB-31's `total` was derived from `items` rather than independently tracked.

**3. Minimum information a `Split` needs to render its children correctly?**

The DIRECTION (horizontal or vertical — which axis to divide along), the RATIO (how much space the first child gets, as a fraction), and REFERENCES to its two children (`first`/`second`) — demonstrated in Step 1's `Split` interface. Everything else (actual pixel sizes, DOM structure) is DERIVED from these three pieces at render time, rather than being separately stored and kept in sync — fewer independently-tracked facts means fewer things that can drift out of sync with each other, echoing LAB-31's lesson about derived vs. independently-mutated state.

---

*Phase 3 (Frontend Systems) complete. Next: [Phase 4 — Backend Systems](../../phase-04-backend-systems/README.md), starting with [LAB-44 — HTTP Protocol](../../phase-04-backend-systems/module-01-http/LAB-44-http-protocol.md)*
