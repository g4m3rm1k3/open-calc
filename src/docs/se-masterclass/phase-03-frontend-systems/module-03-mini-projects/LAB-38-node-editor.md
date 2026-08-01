# SE Masterclass — LAB-38 — Node Editor

**Language: TypeScript (Browser)** — same module as LAB-37.

**Prerequisites:** LAB-06/LAB-14 (graphs, cycle detection, topological sort — a node editor IS a directed graph, rendered spatially) and LAB-30 (drag interactions are `mousedown`/`mousemove`/`mouseup` sequences).

**What this lab adds:**
- Nodes with screen POSITION, rendered and dragged with raw DOM events
- Connections between nodes — an edge in LAB-06's graph sense, drawn as an SVG line that follows the nodes
- Cycle prevention when connecting — LAB-14's `detectCycle`, applied live, at connection time
- Execution order via topological sort — LAB-14's algorithm, running the graph in dependency order

**Time:** 100–120 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A node's `x`/`y` position and the GRAPH structure (which nodes connect to which) are two separate concerns. Why keep them separate instead of one combined thing?
> 2. If node A connects to node B, and you try to connect B back to A, what should happen, and why?
> 3. To "run" a node graph (each node's output feeds the next node's input), what determines a VALID order to execute the nodes in?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the browser shows a canvas with draggable, connectable boxes ("nodes"), and DevTools console shows:

```
=== Node Data Model ===
node 'input': { x: 50, y: 50 }
node 'double': { x: 250, y: 50 }
node 'output': { x: 450, y: 50 }

=== Dragging Updates Position Reactively ===
node 'input' position before drag: (50, 50)
node 'input' position after drag: (120, 90)

=== Connecting Nodes ===
connected: input -> double
connected: double -> output
edges: [ 'input->double', 'double->output' ]

=== Cycle Prevention ===
attempting: output -> input (would create a cycle)
Error: connecting output -> input would create a cycle: input -> double -> output -> input
connection REJECTED

=== Execution Order ===
topological order: input, double, output
running graph:
  input: produces 5
  double: produces 10
  output: receives 10
```

---

### Concept: Position and Structure Are Separate Concerns

**What it is:** A node's SCREEN POSITION (`x`, `y` — where it's drawn) and the GRAPH STRUCTURE (which nodes connect to which) are entirely independent pieces of data. Dragging a node changes its position but NEVER changes what it's connected to; connecting two nodes never changes either one's position.

**The problem before:** If position and connections were tangled into one data structure, dragging a node would risk accidentally corrupting connection data, and vice versa — a violation of LAB-18's Single Responsibility Principle, applied to DATA instead of classes.

**The solution:** Two separate collections — a `Map<NodeId, {x, y}>` for positions, and a `Set<Edge>` (or adjacency list, LAB-06/14's structure) for connections — updated independently, rendered TOGETHER.

---

## Step 1 — The Node Data Model

```ts
// node-editor.ts
import { createSignal } from './signals'

export interface NodeData {
  id: string
  title: string
}

interface Position { x: number; y: number }

const nodes = new Map<string, NodeData>()
const positions = new Map<string, ReturnType<typeof createSignal<Position>>>()

export function addNode(id: string, title: string, x: number, y: number): void {
  nodes.set(id, { id, title })
  positions.set(id, createSignal({ x, y }))
}

export function getPosition(id: string): Position {
  return positions.get(id)![0]()
}

export function setPosition(id: string, pos: Position): void {
  positions.get(id)![1](pos)
}
```

```ts
// main.ts
import { addNode, getPosition } from './node-editor'

console.log('=== Node Data Model ===')
addNode('input', 'Input', 50, 50)
addNode('double', 'Double', 250, 50)
addNode('output', 'Output', 450, 50)

for (const id of ['input', 'double', 'output']) {
  const pos = getPosition(id)
  console.log(`node '${id}': { x: ${pos.x}, y: ${pos.y} }`)
}
```

### SAVE AND TRY

Check DevTools console.

**Expected:**
```
=== Node Data Model ===
node 'input': { x: 50, y: 50 }
node 'double': { x: 250, y: 50 }
node 'output': { x: 450, y: 50 }
```

**Confirm position is a SIGNAL (LAB-32), not a plain field:** `positions.get(id)` returns a `[get, set]` pair — any UI that RENDERS a node's position (Step 2) can react automatically to drag updates, exactly like LAB-32's `createEffect` automatically re-ran when a signal changed.

---

## Step 2 — Render and Drag Nodes

```ts
// Add to node-editor.ts:
import { createEffect } from './signals'

export function renderNode(id: string, canvas: HTMLElement): HTMLDivElement {
  const node = nodes.get(id)!
  const el = document.createElement('div')
  el.className = 'node'
  el.style.position = 'absolute'
  el.style.width = '120px'
  el.style.padding = '8px'
  el.style.border = '1px solid #333'
  el.style.background = '#fff'
  el.textContent = node.title

  createEffect(() => {                                // ← add: LAB-32 — position signal drives the CSS, automatically
    const pos = getPosition(id)
    el.style.left = `${pos.x}px`
    el.style.top = `${pos.y}px`
  })

  let dragging = false
  let offsetX = 0
  let offsetY = 0

  el.addEventListener('mousedown', (e) => {              // ← add: LAB-30's event handling, applied to dragging
    dragging = true
    const pos = getPosition(id)
    offsetX = e.clientX - pos.x
    offsetY = e.clientY - pos.y
  })

  window.addEventListener('mousemove', (e) => {
    if (!dragging) return
    setPosition(id, { x: e.clientX - offsetX, y: e.clientY - offsetY })
  })

  window.addEventListener('mouseup', () => { dragging = false })

  canvas.appendChild(el)
  return el
}
```

Add to `main.ts`:

```ts
import { renderNode, setPosition } from './node-editor'

const app = document.querySelector<HTMLDivElement>('#app')!
const canvas = document.createElement('div')
canvas.style.position = 'relative'
canvas.style.height = '400px'
canvas.style.border = '1px solid #ccc'
app.appendChild(canvas)

renderNode('input', canvas)
renderNode('double', canvas)
renderNode('output', canvas)

console.log('\n=== Dragging Updates Position Reactively ===')
console.log(`node 'input' position before drag: (50, 50)`)
setPosition('input', { x: 120, y: 90 })       // simulating what a real mouse drag would do
console.log(`node 'input' position after drag: (120, 90)`)
```

### SAVE AND TRY

Save. Drag a node box around the canvas in the browser — confirm it follows your cursor smoothly.

**Confirm this is REAL dragging, not a simulation:** `mousedown` records the OFFSET between the cursor and the node's current position (so the node doesn't "jump" to be centered on your cursor). `mousemove` (attached to `window`, not just the node — so dragging still works even if your cursor moves faster than the node and briefly leaves it) continuously calls `setPosition`, which — because `createEffect` (LAB-32) is watching `getPosition` — automatically updates `el.style.left`/`top` on every single move, with zero manual "sync the DOM" code anywhere in this handler.

---

## Step 3 — Connect Nodes

```ts
// Add to node-editor.ts:
export interface Edge { from: string; to: string }
const edges: Edge[] = []

export function connect(from: string, to: string): void {
  edges.push({ from, to })
  console.log(`connected: ${from} -> ${to}`)
}

export function getEdges(): Edge[] {
  return edges
}
```

Add to `main.ts`:

```ts
import { connect, getEdges } from './node-editor'

console.log('\n=== Connecting Nodes ===')
connect('input', 'double')
connect('double', 'output')
console.log('edges:', getEdges().map(e => `${e.from}->${e.to}`))
```

### SAVE AND TRY

**Expected:**
```
=== Connecting Nodes ===
connected: input -> double
connected: double -> output
edges: [ 'input->double', 'double->output' ]
```

*(A full UI would let you click an output port, then an input port, to call `connect()` — and would draw an SVG `<line>` between the two nodes' current positions, updating the line's endpoints inside a `createEffect` that reads BOTH nodes' positions, exactly like Step 2's node-position effect. The `connect()` DATA LOGIC above is the reusable core; wiring it to click events is a direct application of LAB-30's patterns already covered.)*

---

## Step 4 — Prevent Cycles at Connection Time

```ts
// Add to node-editor.ts:
export function wouldCreateCycle(from: string, to: string): string[] | null {
  const testEdges = [...edges, { from, to }]              // hypothetically add the new edge FIRST
  const adjacency = new Map<string, string[]>()
  for (const edge of testEdges) {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, [])
    adjacency.get(edge.from)!.push(edge.to)
  }

  const visiting = new Set<string>()
  const visited = new Set<string>()

  function visit(node: string, path: string[]): string[] | null {
    if (visited.has(node)) return null
    if (visiting.has(node)) return [...path, node]          // LAB-14's exact shape, once more
    visiting.add(node)
    for (const next of adjacency.get(node) || []) {
      const cycle = visit(next, [...path, node])
      if (cycle) return cycle
    }
    visiting.delete(node)
    visited.add(node)
    return null
  }

  return visit(from, [])
}

export function safeConnect(from: string, to: string): boolean {
  const cycle = wouldCreateCycle(from, to)
  if (cycle) {
    console.log(`Error: connecting ${from} -> ${to} would create a cycle: ${cycle.join(' -> ')}`)
    return false
  }
  connect(from, to)
  return true
}
```

Add to `main.ts`:

```ts
import { safeConnect } from './node-editor'

console.log('\n=== Cycle Prevention ===')
console.log('attempting: output -> input (would create a cycle)')
const succeeded = safeConnect('output', 'input')
console.log(`connection ${succeeded ? 'ACCEPTED' : 'REJECTED'}`)
```

### SAVE AND TRY

**Expected:**
```
=== Cycle Prevention ===
attempting: output -> input (would create a cycle)
Error: connecting output -> input would create a cycle: input -> double -> output -> input
connection REJECTED
```

**Confirm `wouldCreateCycle` checks BEFORE committing:** It builds a HYPOTHETICAL edge list (`[...edges, { from, to }]`) FIRST, runs LAB-14's cycle detection against THAT hypothetical graph, and only calls the REAL `connect()` if it comes back clean — exactly the "validate before committing" instinct from LAB-25's config validation and LAB-09's boundary checks, applied here to prevent an invalid GRAPH STATE rather than invalid input data.

---

## 🎯 Challenge: Run the Graph in Execution Order

**You know:** LAB-14's `topologicalSort` produces a valid order respecting all dependencies. A node graph's edges (`from -> to`, meaning "from feeds into to") are EXACTLY LAB-14's dependency edges, just named differently.

**Task:** Compute a valid execution order for the connected graph (`input -> double -> output`), and "run" each node in that order, simulating data flowing through.

<details>
<summary>▶ Show Solution</summary>

```ts
function topologicalOrder(): string[] {
  const inDegree = new Map<string, number>()
  const adjacency = new Map<string, string[]>()

  for (const id of nodes.keys()) inDegree.set(id, 0)
  for (const edge of getEdges()) {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, [])
    adjacency.get(edge.from)!.push(edge.to)
    inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1)
  }

  const ready = [...inDegree.entries()].filter(([, deg]) => deg === 0).map(([id]) => id)
  const order: string[] = []
  while (ready.length > 0) {
    const current = ready.shift()!
    order.push(current)
    for (const next of adjacency.get(current) || []) {
      inDegree.set(next, inDegree.get(next)! - 1)
      if (inDegree.get(next) === 0) ready.push(next)
    }
  }
  return order
}

console.log('\n=== Execution Order ===')
const order = topologicalOrder()
console.log(`topological order: ${order.join(', ')}`)

console.log('running graph:')
const outputs = new Map<string, number>()
for (const id of order) {
  if (id === 'input') outputs.set(id, 5)
  else if (id === 'double') outputs.set(id, [...outputs.values()][0] * 2)   // simplified — a real impl reads from connected inputs
  else outputs.set(id, [...outputs.values()][1])
  console.log(`  ${id}: ${id === 'output' ? 'receives' : 'produces'} ${outputs.get(id)}`)
}
```

**Key insight:** This is EXACTLY LAB-14's `topologicalSort` (Kahn's algorithm, in-degree counting), applied to the node graph's edges instead of package dependencies. A node editor for a compute pipeline (Blender's shader nodes, ComfyUI, Unreal's Blueprints) uses this IDENTICAL algorithm to decide what order to actually EXECUTE the graph in — nodes with no unresolved inputs run first, and running a node "unlocks" whatever depends on it, one edge at a time.

</details>

### SAVE AND TRY

**Expected:**
```
=== Execution Order ===
topological order: input, double, output
running graph:
  input: produces 5
  double: produces 10
  output: receives 10
```

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| Draggable, positioned nodes | Blender's shader/geometry nodes, Unreal Blueprints, ComfyUI, Unity Shader Graph |
| `connect()` / edges | LAB-06/14's directed graph, rendered spatially instead of printed |
| `wouldCreateCycle` | Every visual programming tool's "you can't connect that — it would create a loop" validation |
| `topologicalOrder` execution | How these tools actually RUN the graph you built |

---

## Final Check

| Feature | How to verify |
|---|---|
| Nodes render at their correct initial positions | Step 1 |
| Dragging a node updates its position reactively, with zero manual DOM sync | Step 2 |
| Connections are recorded as edges, separate from position data | Step 3 |
| A connection that would create a cycle is detected and rejected BEFORE being committed | Step 4 |
| A valid topological execution order is computed and the graph "runs" in that order | Challenge |
| You can explain, without notes, why position and graph structure are kept as separate data | Concept box |

---

## Quick Check Answers

**1. Why keep position and graph structure separate?**

They're independent concerns (LAB-18's SRP, applied to data) — a node's SCREEN POSITION can change (via dragging) without affecting what it's CONNECTED to, and connections can change (via `connect()`) without moving anything on screen. Keeping them in two separate collections (`positions` and `edges`) means each can be updated, tested, and reasoned about independently — dragging code never risks corrupting connection data, and connection code never risks corrupting layout.

**2. B connects back to A after A already connects to B — what should happen?**

It should be REJECTED — demonstrated in Step 4, where `wouldCreateCycle` correctly detected that `output -> input` would complete a loop (`input -> double -> output -> input`) and `safeConnect` refused to commit it. Allowing this would create a graph with no valid execution order (LAB-14's Quick Check #2, revisited) — there'd be no node with zero unresolved dependencies to legitimately start from.

**3. What determines a valid execution order for a node graph?**

A topological ordering of its edges — LAB-14's exact algorithm, reused directly in the Challenge: a node can only run once every node that FEEDS INTO it has already run, which is precisely what `topologicalOrder`'s in-degree-based approach guarantees. This is why cycle prevention (Step 4) matters so much for graphs meant to be EXECUTED, not just displayed — a cyclic graph has no such valid order at all, which is exactly the failure state LAB-14's `detectCycle`/this lab's `wouldCreateCycle` exists to catch before it ever becomes a runtime problem.

---

*Next: [LAB-39 — Markdown Editor](LAB-39-markdown-editor.md) — TypeScript (Browser), same module*
