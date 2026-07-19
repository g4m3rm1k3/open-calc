# Lesson: Graph Traversal and Enriched UI Data
### Enriching the Codebase Graph Node Panel

## What you will build

When you click a node in the codebase galaxy, a panel slides in from the right. Before this lesson it showed a title, path, a description, import/export *counts*, and an optional jump button. After this lesson it shows the actual *names* of the files a node imports and is imported by — as clickable colour-coded chips — plus an inferred architectural role badge, a "what you'd learn reading this" section derived at runtime, and a contextual contributor tip. The transferable problems this lesson is actually about are: how to build two kinds of adjacency structure from the same edge list (directed vs. undirected), how to resolve index arrays back into objects, how to derive rich UI labels from raw graph metrics using pure functions, and how to compose a large panel from small focused sub-components so each piece is independently readable.

## What you need to know first

- The previous lesson (force-simulation stability) introduced `Float64Array`, the structure of `codebaseGraph.js`, the `NODES` and `EDGES` exports, the undirected `ADJ` array, and `IMPORTED_BY` / `IMPORTS_CNT` counts. All of these reappear here.
- `Array.from`, `.map()`, `.filter()`, `.push()` — used extensively, not re-taught in full.
- React component props and JSX — assumed from earlier curriculum work.
- `useNavigate` from React Router — appears in footer, not re-taught.

---

## Concept Unit: Directed vs. Undirected Adjacency Lists

### The Problem

The existing graph had one adjacency structure: an *undirected* `ADJ` array, used only during hover to highlight all neighbours regardless of direction. That was enough for highlighting. It is not enough for the panel: to show "this file imports X, Y, Z" and separately "this file is imported by A, B, C", you need two *directed* lists — one recording where each edge points *from*, one recording where each edge points *to*. Building both from the same edge list is the problem.

### Concept Lab

```js
// Throwaway — run this, then delete it.
// Demonstrates directed vs undirected adjacency from the same edge list.

const NODES = ['App', 'Button', 'Icon']
const EDGES = [[0, 1], [0, 2]]   // App → Button, App → Icon

// Undirected: edge (a,b) adds b to adj[a] AND a to adj[b]
const adj = [[], [], []]
for (const [a, b] of EDGES) { adj[a].push(b); adj[b].push(a) }
console.log('undirected adj[0]:', adj[0])  // [1, 2]  ← Button and Icon
console.log('undirected adj[1]:', adj[1])  // [0]     ← App
console.log('undirected adj[2]:', adj[2])  // [0]     ← App

// Directed — outgoing only: edge (a,b) only adds b to out[a]
const out = [[], [], []]
for (const [a, b] of EDGES) { out[a].push(b) }
console.log('outgoing out[0]:', out[0])   // [1, 2]  ← App imports Button, Icon
console.log('outgoing out[1]:', out[1])   // []      ← Button imports nothing
console.log('outgoing out[2]:', out[2])   // []      ← Icon imports nothing

// Directed — incoming only: edge (a,b) only adds a to inc[b]
const inc = [[], [], []]
for (const [a, b] of EDGES) { inc[b].push(a) }
console.log('incoming inc[0]:', inc[0])   // []      ← nothing imports App
console.log('incoming inc[1]:', inc[1])   // [0]     ← App imports Button
console.log('incoming inc[2]:', inc[2])   // [0]     ← App imports Icon
```

**Output from running it:**
```
undirected adj[0]: [ 1, 2 ]
undirected adj[1]: [ 0 ]
undirected adj[2]: [ 0 ]
outgoing out[0]: [ 1, 2 ]
outgoing out[1]: []
outgoing out[2]: []
incoming inc[0]: []
incoming inc[1]: [ 0 ]
incoming inc[2]: [ 0 ]
```

What the output proves: a single `for...of EDGES` loop can build all three structures simultaneously. The undirected version adds to *both* endpoints. The directed outgoing version adds only to the source. The directed incoming version adds only to the target. All three can be built in the same loop with no extra passes over the data.

**Discard:** `NODES`, `EDGES`, `adj`, `out`, `inc` above are deleted. The real project uses the same pattern, with 1,412 real nodes.

### Project Change

- **File modified:** `src/components/backgrounds/CodeMapBackground.jsx`
- **Change type:** add
- **Location:** Lines 15–18, immediately after the undirected `ADJ` loop that was already there — replacing the old two-line count-only block

### The New Code

```js
const IMPORTS_FROM    = Array.from({ length: NODES.length }, () => [])
const IMPORTED_BY_IDX = Array.from({ length: NODES.length }, () => [])
for (const [a, b] of EDGES) {
  IMPORTS_CNT[a]++; IMPORTED_BY[b]++
  IMPORTS_FROM[a].push(b)
  IMPORTED_BY_IDX[b].push(a)
}
```

### The Updated Project

```js
// Adjacency list for hover highlight
const ADJ = Array.from({ length: NODES.length }, () => [])
for (const [a, b] of EDGES) { ADJ[a].push(b); ADJ[b].push(a) }

// Import/export counts per node (directed)
const IMPORTED_BY  = new Array(NODES.length).fill(0)
const IMPORTS_CNT  = new Array(NODES.length).fill(0)
// Directed neighbour lists — who does node[i] import, and who imports it
const IMPORTS_FROM    = Array.from({ length: NODES.length }, () => []) // ← new
const IMPORTED_BY_IDX = Array.from({ length: NODES.length }, () => []) // ← new
for (const [a, b] of EDGES) {
  IMPORTS_CNT[a]++; IMPORTED_BY[b]++
  IMPORTS_FROM[a].push(b)      // ← new
  IMPORTED_BY_IDX[b].push(a)  // ← new
}
```

This block now computes all four structures in a single pass over 2,137 edges. `ADJ` is still used by the hover highlight logic further down the file. `IMPORTS_CNT` and `IMPORTED_BY` are still the count arrays. `IMPORTS_FROM[i]` is a new array of node indices that node `i` imports. `IMPORTED_BY_IDX[i]` is a new array of node indices that import node `i`.

### Mechanical Walkthrough

Enumerating every element in the new block, in order:

- `Array.from({ length: NODES.length }, () => [])` — **(b) `Array.from` with a mapping function, hard concept reappearing from the previous lesson.** The two-argument form takes an array-like and a map function; the `{ length: N }` trick creates a sparse array-like object with `.length = N`, and the `() => []` factory is called once per index, producing a *new, independent* empty array for every slot. If you wrote `new Array(N).fill([])` instead, every slot would point to the *same* array object — a classic JavaScript trap.
- `IMPORTS_FROM[a].push(b)` — **(c) already-established** `.push()` on a plain array.
- `IMPORTED_BY_IDX[b].push(a)` — **(c) already-established.** Same pattern, reversed direction.

**Execution trace — first 3 edges of the real graph ([0,2], [0,3], [1,4]):**

```
Edge [0, 2]: IMPORTS_FROM[0].push(2)    → IMPORTS_FROM[0]    = [2]
             IMPORTED_BY_IDX[2].push(0) → IMPORTED_BY_IDX[2] = [0]
             IMPORTS_CNT[0]++           → IMPORTS_CNT[0]      = 1
             IMPORTED_BY[2]++           → IMPORTED_BY[2]       = 1

Edge [0, 3]: IMPORTS_FROM[0].push(3)    → IMPORTS_FROM[0]    = [2, 3]
             IMPORTED_BY_IDX[3].push(0) → IMPORTED_BY_IDX[3] = [0]
             IMPORTS_CNT[0]++           → IMPORTS_CNT[0]      = 2
             IMPORTED_BY[3]++           → IMPORTED_BY[3]       = 1

Edge [1, 4]: IMPORTS_FROM[1].push(4)    → IMPORTS_FROM[1]    = [4]
             IMPORTED_BY_IDX[4].push(1) → IMPORTED_BY_IDX[4] = [1]
             IMPORTS_CNT[1]++           → IMPORTS_CNT[1]      = 1
             IMPORTED_BY[4]++           → IMPORTED_BY[4]       = 1
```

After all 2,137 edges: `IMPORTS_FROM[0]` is a list of every index that `App.jsx` imports (47 entries); `IMPORTED_BY_IDX[0]` is empty — nothing imports `App.jsx`.

### CS Lens

Directed vs. undirected adjacency lists appear everywhere graphs appear:

- **Git's commit graph** — commits are directed (child → parent); `git log` traverses directed parents, `git bisect` needs both directions
- **Web crawler** — the web is a directed graph; PageRank needs both out-links (which pages does this link to?) and in-links (which pages link here?)
- **Package dependency trees** — `npm ls` shows directed dependencies; vulnerability scanners need reverse dependencies to find what breaks if a package changes
- **Call graphs** in compilers — "what functions does this function call?" (out-edges) and "what functions call this?" (in-edges, needed for dead-code elimination)
- **Database foreign keys** — the FK is directed (child table → parent table); cascade rules need the reverse (parent → all children that reference it)

The pattern: **whenever you need to answer questions about flow *and* about provenance, you need both directed lists. Building both in one pass is always possible because each edge has exactly two endpoints.**

### SE Lens

The alternative is to build these lists lazily — only compute them when the panel opens, by filtering all 2,137 edges for `a === clickedIdx` and `b === clickedIdx`. That works and is simpler. The reason the lists are built eagerly at module load time is **amortisation**: the module loads once and stays in memory; every subsequent click pays nothing to compute the neighbours. If the lists were computed per-click, clicking the most-connected node (274 connections) would scan 2,137 edges on every click. Building once costs the same O(E) scan regardless of how many nodes are clicked.

The maintenance cost: `IMPORTS_FROM` and `IMPORTED_BY_IDX` hold integer indices, not node objects. Any code that uses them must also have access to `NODES` to resolve an index to a label. This coupling is explicit in the click payload below.

---

## Concept Unit: Enriching an Event Payload

### The Problem

`CodeMapBackground` fires `onNodeClick(payload)` when you click a node. Previously the payload contained the node's own data plus two integers (`importedBy`, `importsCnt`). The panel now needs the actual neighbour *objects*, not just counts. Two options: (a) send all of `NODES` and the index arrays, letting the panel resolve them, or (b) resolve them inside `CodeMapBackground` and send the objects directly. This unit explains why (a) was chosen and how the payload is built.

### Concept Lab

```js
// Throwaway — run this, then delete it.
// Demonstrates spreading an object and adding extra properties.

const base = { id: 'App.jsx', label: 'App.jsx', rgb: [100, 116, 139] }
const extra = { importsCnt: 3, idx: 0 }

const payload = { ...base, ...extra }
console.log(payload)
// { id: 'App.jsx', label: 'App.jsx', rgb: [100,116,139], importsCnt: 3, idx: 0 }

// Spreading merges all own enumerable properties. Later spread wins on collision:
const collision = { ...base, id: 'OVERRIDE' }
console.log(collision.id)   // 'OVERRIDE'
```

**Output:**
```
{ id: 'App.jsx', label: 'App.jsx', rgb: [ 100, 116, 139 ], importsCnt: 3, idx: 0 }
OVERRIDE
```

What the output proves: spread is order-dependent — properties from a later spread overwrite earlier ones with the same key. The payload uses `...NODES[idx]` first, then named properties after it; any property named in the named list would shadow the same key in the node object.

**Discard:** `base`, `extra`, `payload`, `collision` are deleted.

### Project Change

- **File modified:** `src/components/backgrounds/CodeMapBackground.jsx`
- **Change type:** replace
- **Location:** Inside the `onClick` handler, the `onNodeClickRef.current?.({ ... })` call, lines 114–122

### The New Code

```js
const idx = st.hovered
onNodeClickRef.current?.({
  ...NODES[idx],
  idx,
  importedBy:      IMPORTED_BY[idx],
  importsCnt:      IMPORTS_CNT[idx],
  importsFromIdxs: IMPORTS_FROM[idx].slice(0, 12),
  importedByIdxs:  IMPORTED_BY_IDX[idx].slice(0, 12),
  allNodes:        NODES,
})
```

### The Updated Project

```js
const onClick = e => {
  if (e.target.closest(ISEL)) return
  if (isOverUI(e.target)) return
  if (st.didDrag) return
  if (st.hovered >= 0) {
    const idx = st.hovered                          // ← new: named for clarity
    onNodeClickRef.current?.({
      ...NODES[idx],
      idx,                                          // ← new
      importedBy:      IMPORTED_BY[idx],
      importsCnt:      IMPORTS_CNT[idx],
      importsFromIdxs: IMPORTS_FROM[idx].slice(0, 12),    // ← new
      importedByIdxs:  IMPORTED_BY_IDX[idx].slice(0, 12), // ← new
      allNodes:        NODES,                             // ← new
    })
  } else {
    onNodeClickRef.current?.(null)
  }
}
```

The handler now sends six things to the panel: all original node fields (spread), the node's own index, both directed count arrays looked up by index, both directed *neighbour index arrays* truncated to 12 items each, and the full `NODES` array so the panel can resolve those indices to labels and colours.

### Mechanical Walkthrough

- `const idx = st.hovered` — **(c) already-established.** Extracts the hovered index to a named variable before it's used in multiple places — avoids repeated `st.hovered` reads and names the intent.
- `...NODES[idx]` — **(b) spread of an array element, hard concept reappearing.** `NODES[idx]` is a plain object (`{id, label, folder, rgb, x, y, z, size, meta?}`). Spreading it copies all its own enumerable properties into the new object literal.
- `idx,` — **(c)** shorthand property: `idx: idx`. Already-established syntax.
- `IMPORTS_FROM[idx].slice(0, 12)` — **(a) first appearance of `.slice(start, end)` as a cap.** `Array.prototype.slice(0, 12)` returns a new array containing elements from index 0 up to (not including) index 12. If the array has fewer than 12 elements, it returns all of them — no out-of-bounds error. This caps the payload at 12 neighbours; sending all 274 for the most-connected node would make the panel unusably long.
- `allNodes: NODES` — **(a) first appearance of passing the whole data set as a prop.** `NODES` is the same module-level array reference. Passing it lets the panel use indices to look up any node without needing its own import of `codebaseGraph.js`. This is a deliberate architectural choice: the panel does not import graph data directly; it only knows what the canvas tells it.

### CS Lens

Passing index arrays plus a reference array rather than resolved objects appears across systems:

- **Database foreign keys** — a row stores a numeric ID, not the whole referenced row; the join happens at read time
- **ECS (Entity-Component System) in game engines** — systems store entity IDs, not pointers; the component store is the "all nodes" equivalent
- **Message queues** — a queue carries a record ID; the consumer looks it up from the database rather than the producer embedding the full record
- **React virtualization** — `react-window` passes item indices to the renderer, which fetches items from a data array; the list doesn't hold copies of items
- **DNS** — a zone file stores name–record-type–value mappings; `allNodes` is the zone; an index is a hostname; resolution happens at lookup time

The pattern: **indices into a shared array are cheaper to pass and store than resolved objects, provided every consumer has access to the shared array. The coupling is explicit: you can't use the index without the array.**

### SE Lens

The alternative was to resolve neighbours *inside* `CodeMapBackground` before firing the event:

```js
importsFrom: IMPORTS_FROM[idx].slice(0, 12).map(i => NODES[i])
```

This would mean the panel receives complete node objects and doesn't need `allNodes`. The reason this was *not* chosen is **passing the full NODES array is a one-time cost** (it's a reference, not a copy), whereas resolving inside the canvas couples the canvas to the panel's display requirements. The canvas shouldn't know or care how many neighbour fields the panel renders. By passing raw indices + the lookup table, the panel decides what it needs; the canvas is not changed when the panel's information needs change.

---

## Concept Unit: Index-to-Object Resolution with `.filter(Boolean)`

### The Problem

Inside `NodePanel`, the payload's `importsFromIdxs` is an array of integers — node indices. To render them as coloured chips with labels, they must be converted to node objects. The conversion is a `.map()` over indices. But the `allNodes` array might theoretically have a gap if an index is out of range (it shouldn't, but defensive code doesn't rely on that). The unit teaches the `.filter(Boolean)` pattern that removes any falsy values after a map.

### Concept Lab

```js
// Throwaway — run this, then delete it.
const nodes = [
  { id: 'App', rgb: [100,116,139] },
  { id: 'Button', rgb: [129,140,248] },
  { id: 'Icon', rgb: [56,189,248] },
]

const idxs = [0, 2, 99]   // 99 is out of range

// Without filter: undefined sneaks in
const raw = idxs.map(i => nodes[i])
console.log(raw)
// [ { id: 'App', ... }, { id: 'Icon', ... }, undefined ]

// With .filter(Boolean): removes all falsy values (undefined, null, 0, '', false)
const safe = idxs.map(i => nodes[i]).filter(Boolean)
console.log(safe)
// [ { id: 'App', ... }, { id: 'Icon', ... } ]
```

**Output from running it:**
```
[ { id: 'App', rgb: [ 100, 116, 139 ] },
  { id: 'Icon', rgb: [ 56, 189, 248 ] },
  undefined ]
[ { id: 'App', rgb: [ 100, 116, 139 ] },
  { id: 'Icon', rgb: [ 56, 189, 248 ] } ]
```

What the output proves: `array[99]` where the array has 3 elements returns `undefined` (not an error). `undefined` is falsy, so `.filter(Boolean)` removes it. The resulting array contains only real objects, safe to pass to a component that accesses `.rgb`, `.label`, etc. without nullchecks.

**Discard:** `nodes`, `idxs`, `raw`, `safe` are deleted.

### Project Change

- **File modified:** `src/components/backgrounds/NodePanel.jsx`
- **Change type:** add (new file — the whole file was replaced; this specific pattern appears near the top of the component function)
- **Location:** Inside the `NodePanel` function body, just after destructuring the `node` prop

### The New Code

```js
const importedFromNodes = importsFromIdxs.map(i => allNodes[i]).filter(Boolean)
const importedByNodes   = importedByIdxs.map(i => allNodes[i]).filter(Boolean)
```

### The Updated Project

```js
export default function NodePanel({ node, onClose }) {
  const navigate = useNavigate()
  const {
    id, label, folder, rgb, meta,
    importedBy = 0, importsCnt = 0,
    importsFromIdxs = [], importedByIdxs = [],
    allNodes = [],
  } = node

  const [r, g, b] = rgb
  const color    = `rgb(${r},${g},${b})`
  const type     = inferType(id)
  const role     = inferRole(type, importsCnt, importedBy)
  const learning = learningAngle(type, id, meta)
  const degree   = importsCnt + importedBy

  // Resolve neighbour indices → node objects         ← new
  const importedFromNodes = importsFromIdxs.map(i => allNodes[i]).filter(Boolean)  // ← new
  const importedByNodes   = importedByIdxs.map(i => allNodes[i]).filter(Boolean)   // ← new
  // ...rest of component
}
```

The component body now has two resolved arrays of real node objects that can be passed directly to the `NeighbourChip` sub-component, which accesses `.rgb` and `.label` without any nullcheck.

### Mechanical Walkthrough

- `importsFromIdxs.map(i => allNodes[i])` — **(b) `.map()` reappearing.** Transforms an array of integers into an array of objects by looking each index up in `allNodes`. Returns a new array of the same length; does not mutate `importsFromIdxs`.
- `.filter(Boolean)` — **(a) first appearance of passing a constructor as a predicate.** `Boolean` (capital B) is the built-in constructor function. When called as `Boolean(value)`, it returns `true` if `value` is truthy and `false` if it is falsy. Passing it to `.filter()` uses it as the callback: `.filter(v => Boolean(v))`, which removes any `undefined`, `null`, `0`, `''`, or `false`. This is idiomatic JavaScript shorthand — `filter(Boolean)` is recognised on sight by experienced JavaScript developers.

**Execution trace for `importsFromIdxs = [2, 47, 9999]` with `allNodes.length = 1412`:**

```
i=2    → allNodes[2]    = { id: 'components/backgrounds/CodeMapBackground.jsx', ... }  truthy → kept
i=47   → allNodes[47]   = { id: 'components/lesson/LessonBlock.jsx', ... }             truthy → kept
i=9999 → allNodes[9999] = undefined                                                    falsy  → removed
Result: [ nodeObject, nodeObject ]  (length 2, not 3)
```

### CS Lens

Null/undefined removal after a transform appears in:

- **Python list comprehensions with conditionals:** `[nodes[i] for i in idxs if i < len(nodes)]`
- **SQL `WHERE` after a `JOIN`:** the join produces `NULL` for unmatched rows; the `WHERE IS NOT NULL` removes them
- **Rust `Option` and `.filter_map()`:** `.filter_map(|i| nodes.get(i))` in one operation
- **Haskell `catMaybes`:** removes `Nothing` values from a list of `Maybe a`
- **Defensive API response handling:** `response.items?.filter(Boolean)` removes nulls injected by a backend that partially failed

The pattern: **when a transform can produce invalid sentinels (null, undefined, -1), composing the transform with a filter is cleaner than adding nullchecks at every use site downstream.**

### SE Lens

The alternative is to skip `.filter(Boolean)` and instead check `node && node.rgb` inside `NeighbourChip`. That works, but it spreads defensive logic across every consumer of the array instead of handling it once at the source. This is the **parse-don't-validate** principle applied to arrays: resolve them into a clean type (an array with no `undefined` entries) at the boundary, so internal code can trust what it receives.

---

## Concept Unit: Pure Functions for Derived UI State

### The Problem

The panel needs to display three things that aren't stored in the graph data: an architectural role label (Hub, Connector, Leaf…), a "what you'd learn" string, and an inferred file type. All three depend only on inputs the panel already has — they are *derived* from the data, not fetched or stored separately. The question is where to put that derivation logic: inside JSX, in `useEffect`, or in standalone functions. This unit teaches the standalone pure-function approach and why it's the right choice.

### Concept Lab

```js
// Throwaway — run this, then delete it.
// Demonstrates a pure function vs inline derivation.

// Inline — hard to test, clutters JSX
function renderBadge_inline(importsCnt, importedBy) {
  return `<span>${
    importsCnt + importedBy >= 30 ? 'Hub'
    : importedBy >= 10 ? 'Shared'
    : importsCnt === 0 && importedBy === 0 ? 'Island'
    : 'Connector'
  }</span>`
}

// Pure function — testable, named, reusable
function classifyNode(importsCnt, importedBy) {
  const deg = importsCnt + importedBy
  if (deg >= 30)        return { label: 'Hub',     tip: 'High impact — many connections.' }
  if (importedBy >= 10) return { label: 'Shared',  tip: 'Widely used module.' }
  if (deg === 0)        return { label: 'Island',  tip: 'No connections found.' }
  return                       { label: 'Connector', tip: 'Focused module.' }
}

// Test it without any React, any DOM, any browser:
console.log(classifyNode(40, 5))    // { label: 'Hub', tip: 'High impact...' }
console.log(classifyNode(0, 15))    // { label: 'Shared', tip: 'Widely used...' }
console.log(classifyNode(0, 0))     // { label: 'Island', tip: 'No connections...' }
console.log(classifyNode(2, 3))     // { label: 'Connector', tip: 'Focused module.' }
```

**Output from running it:**
```
{ label: 'Hub', tip: 'High impact — many connections.' }
{ label: 'Shared', tip: 'Widely used module.' }
{ label: 'Island', tip: 'No connections found.' }
{ label: 'Connector', tip: 'Focused module.' }
```

What the output proves: the function can be run and its output verified with plain `console.log` — no browser, no React, no test framework. Inline JSX ternaries can't be tested this way. The function is also composable: its return value is a plain object, usable anywhere.

**Discard:** `renderBadge_inline` and `classifyNode` are deleted. The real project uses `inferRole`, `inferType`, and `learningAngle`, all following the same pattern.

### Project Change

- **File modified:** `src/components/backgrounds/NodePanel.jsx`
- **Change type:** add
- **Location:** Module level, above the `NodePanel` component function — three new functions: `inferRole`, `inferType` (already existed, unchanged), and `learningAngle`

### The New Code

```js
function inferRole(type, importsCnt, importedBy) {
  const deg = importsCnt + importedBy
  if (deg >= 30)        return { label: 'Hub',          icon: '⬡', tip: 'Many files depend on or connect through this. Changing it has wide impact.' }
  if (importedBy >= 10) return { label: 'Shared',       icon: '◈', tip: 'Widely imported. Acts as a shared library or service across the app.' }
  if (deg === 0)        return { label: 'Island',       icon: '○', tip: 'Not connected to anything. May be unused or an entry point loaded by a bundler.' }
  if (importsCnt >= 8)  return { label: 'Orchestrator', icon: '⬟', tip: 'Pulls in many dependencies. Likely a page, shell, or top-level controller.' }
  if (importedBy === 0) return { label: 'Leaf',         icon: '◇', tip: 'Nothing imports this. An entry point or a script run directly.' }
  if (importsCnt === 0) return { label: 'Pure Output',  icon: '◆', tip: 'Imports nothing itself. Pure data, constants, or purely declarative.' }
  return                       { label: 'Connector',    icon: '◉', tip: 'Connected but not dominant. A focused module doing one job.' }
}
```

### The Updated Project

```js
// ─── helpers ─────────────────────────────────────────────────────────────────

function inferType(id) {          // unchanged from before
  if (id.startsWith('pages/'))      return 'Page'
  // ... (full function as in file)
  return 'Module'
}

function inferRole(type, importsCnt, importedBy) {       // ← new
  const deg = importsCnt + importedBy
  if (deg >= 30)        return { label: 'Hub',          icon: '⬡', tip: 'Many files depend on or connect through this. Changing it has wide impact.' }
  if (importedBy >= 10) return { label: 'Shared',       icon: '◈', tip: 'Widely imported. Acts as a shared library or service across the app.' }
  if (deg === 0)        return { label: 'Island',       icon: '○', tip: 'Not connected to anything. May be unused or an entry point loaded by a bundler.' }
  if (importsCnt >= 8)  return { label: 'Orchestrator', icon: '⬟', tip: 'Pulls in many dependencies. Likely a page, shell, or top-level controller.' }
  if (importedBy === 0) return { label: 'Leaf',         icon: '◇', tip: 'Nothing imports this. An entry point or a script run directly.' }
  if (importsCnt === 0) return { label: 'Pure Output',  icon: '◆', tip: 'Imports nothing itself. Pure data, constants, or purely declarative.' }
  return                       { label: 'Connector',    icon: '◉', tip: 'Connected but not dominant. A focused module doing one job.' }
}

function learningAngle(type, id, meta) {                 // ← new
  if (meta?.concept) return meta.concept
  const t = type.toLowerCase()
  if (t === 'context')   return 'React Context + global state patterns'
  if (t === 'hook')      return 'Custom hooks and reusable stateful logic'
  // ... (full function as in file)
  return 'Module design and separation of concerns'
}

export default function NodePanel({ node, onClose }) { /* ... */ }
```

These three helper functions live at module scope, outside the React component. They are called inside the component body and their results consumed in JSX. The component function never contains the classification logic itself.

### Mechanical Walkthrough

Enumerating `inferRole` top to bottom:

- `const deg = importsCnt + importedBy` — **(c) already-established** local variable for total degree.
- `if (deg >= 30) return { label: 'Hub', icon: '⬡', tip: '...' }` — **(a) first appearance of early-return guard-clause style.** Each `if` either returns immediately or falls through. There is no `else if` chain. This is guard-clause / early-exit style: each case is independent, the reader scans down until the first match, and the final `return` at the bottom is the default. This is contrasted with a nested `if/else if/else` in the SE Lens.
- `if (importedBy >= 10)` — **(c)** threshold check, already-established.
- `if (deg === 0)` — **(c)** equality check on a derived value.
- Return value `{ label, icon, tip }` — **(c)** object literal with three properties; all already-established syntax.

For `learningAngle`:

- `if (meta?.concept) return meta.concept` — **(b) optional chaining `?.` reappearing.** `meta?.concept` short-circuits to `undefined` if `meta` is undefined or null, rather than throwing. Already introduced when the panel first used `meta?.description` and `meta?.title`. Here it's used as a guard to prefer the explicit meta value over the inferred one.
- `const t = type.toLowerCase()` — **(a) first appearance of `.toLowerCase()`.** Returns a new string with all characters converted to lower case. `'Context'.toLowerCase()` → `'context'`. Used here so the switch-like chain can use lowercase strings without worrying about the capitalisation `inferType` returns.

### CS Lens

Pure functions for derived UI state appear across frameworks and paradigms:

- **Redux selectors** (`reselect`) — `selectUserName(state)` is a pure function from state to display value, memoised for performance
- **Vue computed properties** — declared as pure functions of reactive state; Vue tracks which state they read and only re-runs them when those values change
- **Elm's `view` function** — the entire UI is a pure function of the model; no side effects, no stored display state
- **SQL computed columns** — a column defined as `total_price = quantity * unit_price`; derived on read, never stored separately
- **Spreadsheet formulas** — a cell's displayed value is always derived from its formula and its inputs; there is no "display copy" of the value

The pattern: **if a value can be fully computed from other values the system already has, it should be — not stored, not cached unless performance demands it, not managed as separate state. Derived state that is also stored is a synchronisation problem waiting to happen.**

### SE Lens

The alternative to `inferRole` is a lookup table:

```js
const ROLE_TABLE = [
  { test: (cnt, by) => cnt + by >= 30,  label: 'Hub', ... },
  { test: (cnt, by) => by >= 10,        label: 'Shared', ... },
  // ...
]
function inferRole(cnt, by) {
  return ROLE_TABLE.find(r => r.test(cnt, by)) ?? defaultRole
}
```

The lookup table makes the priority order explicit as data rather than code order. It is the better choice when roles are added or reordered frequently, because each change is a data edit rather than a code edit. The early-return chain is the right choice here because the thresholds are stable and the logic is short enough to read at a glance — the table version adds indirection without adding clarity at this scale.

---

## Concept Unit: Small Sub-components as Named Abstractions

### The Problem

The panel renders two lists of file chips — one for imports, one for imported-by — using identical visual logic: an index card with a background colour, border, label, hover state, and click handler. Writing that styling inline twice produces 40+ duplicated lines that must be kept in sync. The solution is to extract a `NeighbourChip` sub-component. This unit teaches when and how to extract a sub-component, and why the line between a helper function and a component is meaningful.

### Concept Lab

```js
// Throwaway — run this, then delete it.
// Demonstrates extracting repeated JSX into a sub-component.

// Before extraction — repeated inline:
function PanelBefore() {
  return (
    <div>
      <span style={{ background: 'red', padding: 4 }}>Button.jsx</span>
      <span style={{ background: 'blue', padding: 4 }}>Icon.jsx</span>
      {/* identical style, only name differs */}
    </div>
  )
}

// After extraction — one component, used twice:
function Chip({ name, color }) {
  return <span style={{ background: color, padding: 4 }}>{name}</span>
}

function PanelAfter() {
  return (
    <div>
      <Chip name="Button.jsx" color="red" />
      <Chip name="Icon.jsx"   color="blue" />
    </div>
  )
}
```

The output is identical — this is a structural change, not a behavioural one. What matters is that the styling logic now has *one* definition, and both uses refer to it by name. Adding a hover effect, changing the border radius, or fixing a colour computation happens in one place.

**Discard:** `PanelBefore`, `PanelAfter`, `Chip` are deleted.

### Project Change

- **File modified:** `src/components/backgrounds/NodePanel.jsx`
- **Change type:** add
- **Location:** Module level, between the helper functions and the `NodePanel` export — two new sub-components: `SectionLabel` and `NeighbourChip`

### The New Code

```js
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, color: '#334155',
      letterSpacing: '.1em', textTransform: 'uppercase',
      fontFamily: 'JetBrains Mono, monospace', marginBottom: 8,
    }}>{children}</div>
  )
}

function NeighbourChip({ node, onClick }) {
  if (!node) return null
  const name = node.label.replace(/\.(jsx?|tsx?|mjs)$/, '')
  const [r, g, b] = node.rgb
  return (
    <button
      onClick={onClick}
      title={node.id}
      style={{
        background: `rgba(${r},${g},${b},0.10)`,
        border: `1px solid rgba(${r},${g},${b},0.20)`,
        color: `rgb(${r},${g},${b})`,
        borderRadius: 6, padding: '3px 8px',
        fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
        cursor: 'pointer', transition: 'background 0.12s, border-color 0.12s',
        whiteSpace: 'nowrap', maxWidth: 140,
        overflow: 'hidden', textOverflow: 'ellipsis',
        display: 'inline-block',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `rgba(${r},${g},${b},0.22)`
        e.currentTarget.style.borderColor = `rgba(${r},${g},${b},0.45)`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = `rgba(${r},${g},${b},0.10)`
        e.currentTarget.style.borderColor = `rgba(${r},${g},${b},0.20)`
      }}
    >
      {name}
    </button>
  )
}
```

### The Updated Project

```js
// ─── sub-components ────────────────────────────────────────────────────────

const DIVIDER = <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 16px' }} />  // ← new

function SectionLabel({ children }) {   // ← new
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, color: '#334155',
      letterSpacing: '.1em', textTransform: 'uppercase',
      fontFamily: 'JetBrains Mono, monospace', marginBottom: 8,
    }}>{children}</div>
  )
}

function NeighbourChip({ node, onClick }) {   // ← new
  if (!node) return null
  const name = node.label.replace(/\.(jsx?|tsx?|mjs)$/, '')
  const [r, g, b] = node.rgb
  return (
    <button
      onClick={onClick}
      title={node.id}
      style={{
        background: `rgba(${r},${g},${b},0.10)`,
        /* ... (full style as above) */
      }}
      onMouseEnter={e => { /* hover in */ }}
      onMouseLeave={e => { /* hover out */ }}
    >
      {name}
    </button>
  )
}

export default function NodePanel({ node, onClose }) { /* ... uses both above ... */ }
```

`DIVIDER`, `SectionLabel`, and `NeighbourChip` are all defined above `NodePanel`. `NodePanel` uses `SectionLabel` five times and `NeighbourChip` in a `.map()` over each neighbour array.

### Mechanical Walkthrough

- `function SectionLabel({ children })` — **(b) `children` prop reappearing.** `children` is a special React prop: whatever JSX is placed between `<SectionLabel>` and `</SectionLabel>` is passed as `props.children`. It allows the parent to control what goes *inside* the component. Here it lets each usage pass an icon + text string without SectionLabel caring what they are.
- `if (!node) return null` — **(a) first appearance of early null-return from a component.** Returning `null` from a React component renders nothing. This is the React equivalent of a guard-clause: if `NeighbourChip` receives no node, it silently renders nothing rather than crashing on `node.label`.
- `node.label.replace(/\.(jsx?|tsx?|mjs)$/, '')` — **(b) regex `.replace()` reappearing.** The regex matches `.jsx`, `.js`, `.tsx`, `.ts`, or `.mjs` at the end of the string (`$`). Stripping the extension gives a cleaner display name without storing a separate field.
- `const [r, g, b] = node.rgb` — **(b) array destructuring reappearing.** `node.rgb` is always `[r, g, b]`; destructuring pulls them into named variables for the template literals below.
- `` `rgba(${r},${g},${b},0.10)` `` — **(c) template literals**, already-established.
- `onMouseEnter`/`onMouseLeave` with `e.currentTarget.style` — **(b) imperative style mutation reappearing** from the previous version of NodePanel. An alternative is CSS classes or a `useState` hover flag; imperative mutation is used here to avoid re-renders for a purely visual effect.
- `textOverflow: 'ellipsis'` with `overflow: 'hidden'` and `whiteSpace: 'nowrap'` — **(a) first appearance of the text-truncation trio.** These three CSS properties work together: `whiteSpace: 'nowrap'` prevents the text from wrapping, `overflow: 'hidden'` clips anything that exceeds the container's width, `textOverflow: 'ellipsis'` replaces the clipped portion with `…`. All three are required — any one alone does not produce the ellipsis effect.

### CS Lens

Sub-component extraction as a named abstraction is the same move as:

- **Extracting a named function** instead of repeating an expression — both give a single place to change and a name to reason about
- **CSS utility classes** (`.chip`, `.badge`) — one definition referenced many times; changing `.chip` changes all chips
- **React Design System components** (Material UI's `<Chip>`, Chakra's `<Badge>`) — the same abstraction scaled to a library boundary
- **SQL views** — a named query that other queries reference; changing the view changes all consumers
- **Partial application / currying** in functional programming — bind common arguments once, reuse the result

The pattern: **when the same visual or behavioural contract appears more than once, name it. The name becomes a unit of communication between developers, not just between functions.**

### SE Lens

The alternative is to keep the chip logic inline and use a CSS class or Tailwind utilities for styling. That would reduce the JavaScript noise but wouldn't eliminate the duplication of the hover-state logic, the rgb template literals, or the `onClick` wiring. A sub-component is chosen over a CSS class specifically because the hover logic depends on the node's *runtime colour* — it can't be expressed in a static CSS class.

The honest cost: `NeighbourChip` is not exported. It lives only in `NodePanel.jsx`. If another panel ever needed the same chip shape, the component would need to be moved to a shared file. That's intentional premature-export avoidance — share it when the second consumer exists, not speculatively.

---

## Closing

### Connect the Pieces

One click on node `AppShell.jsx` (41 connections) travelling through everything built in this lesson:

1. `st.hovered` resolves to index 4 (AppShell). `const idx = 4`.
2. `IMPORTS_FROM[4].slice(0, 12)` returns the first 12 indices of files AppShell imports, e.g. `[0, 2, 6, 7, ...]`. `IMPORTED_BY_IDX[4].slice(0, 12)` returns indices of files that import AppShell, e.g. `[1]`.
3. `onNodeClickRef.current?.({ ...NODES[4], idx: 4, importedBy: 1, importsCnt: 40, importsFromIdxs: [0,2,6,...], importedByIdxs: [1], allNodes: NODES })` fires. React sets `selectedNode` to this object. `NodePanel` mounts.
4. Inside `NodePanel`, `importsFromIdxs.map(i => allNodes[i]).filter(Boolean)` resolves indices `[0,2,6,...]` to node objects (`App.jsx`, `CodeMapBackground.jsx`, `TopBar.jsx`...).
5. `inferRole('Component', 40, 1)` runs: `deg = 41 >= 30` → returns `{ label: 'Hub', icon: '⬡', tip: 'Many files depend on or connect through this...' }`.
6. `learningAngle('Component', '...AppShell.jsx', { concept: 'Layout Composition', ... })` runs: `meta?.concept` is `'Layout Composition'` → returns it immediately.
7. The JSX renders: the Hub role badge (with its tooltip), the "Layout Composition" learning card, 12 coloured chips for files AppShell imports, 1 chip for the file that imports it, and the contributor tip: *"This is a core shared module — 1 file depends on it. Before changing it..."* — which uses the `importedBy >= 20` branch? No — `importedBy = 1`. So it falls to the `importsCnt >= 8` branch: *"This file orchestrates 40 dependencies. A good way to understand it is to open the dependency graph..."*

### What Breaks Without This

**Remove `.filter(Boolean)` from one of the resolution lines:**

```js
// Break it:
const importedFromNodes = importsFromIdxs.map(i => allNodes[i])
// (no .filter(Boolean))
```

If any index is out of range (try passing `importsFromIdxs: [99999]` as a test), `allNodes[99999]` is `undefined`. Inside `NeighbourChip`, `node.label` on `undefined` throws: `TypeError: Cannot read properties of undefined (reading 'label')`. The panel crashes to a blank white box. The `if (!node) return null` guard in `NeighbourChip` never fires because the bad value reaches the component only when `.filter(Boolean)` is *not* there to remove it first.

**Restore `.filter(Boolean)` before continuing.**

### Exercises

1. **Add a "total degree" number to the role badge tooltip.** Hover text currently reads `'Many files depend on or connect through this. Changing it has wide impact.'` Modify `inferRole` to append the degree number: `'…wide impact. (degree: 41)'`. Test it on AppShell.

2. **Increase the neighbour chip limit from 12 to 20.** Change both `.slice(0, 12)` calls in `CodeMapBackground.jsx`. Click AppShell. Does the panel stay readable? Does anything overflow?

3. **Add a new role: `'Core'`** for nodes where both `importsCnt >= 5` AND `importedBy >= 5`. It should appear *before* the `'Connector'` default in the guard-clause chain. What icon and tip would you write for it?

4. **Write a unit test for `inferRole`** without React. Copy the function into a plain Node script. Run: `inferRole('Component', 40, 1)` and assert `result.label === 'Hub'`. Try all the other branches. Which branch is hardest to reach with a realistic import graph?

### Definition of Done

- [ ] Clicking any node opens the panel with all six sections visible
- [ ] Hub nodes (AppShell, App.jsx) show the ⬡ Hub badge; leaf nodes show the ◇ Leaf badge
- [ ] The imports and imported-by chip sections show real file names, colour-coded
- [ ] Hovering a chip changes its background; clicking it fires the handler without a JS error
- [ ] Nodes with no connections show the "No import connections found" message, not a crash
- [ ] Commit with a message that explains why, not what:

```
feat(NodePanel): enrich node panel with graph traversal data

Panel previously showed import/export counts with no context. Add directed
adjacency lists (IMPORTS_FROM, IMPORTED_BY_IDX) built in the same edge-scan
loop. Pass index arrays + NODES ref through the click payload so the panel
can resolve and render actual neighbour file chips. Add pure functions for
architectural role inference and contributor tips derived from degree metrics.
```
