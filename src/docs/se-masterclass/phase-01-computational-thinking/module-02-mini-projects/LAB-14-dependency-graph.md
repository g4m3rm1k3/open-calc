# SE Masterclass — LAB-14 — Dependency Graph

**Language: JavaScript (Node.js)** — same module as LAB-09–13.

**Prerequisites:** LAB-06 (Trees and Graphs — this lab's Kahn's-algorithm topological sort is the direct ancestor of what you build here) and LAB-13 (State Machine).

**What this lab adds:**
- A second technique for topological sort: DFS-based, instead of LAB-06's Kahn's algorithm (BFS-based) — same answer, different route
- Cycle detection with a USEFUL error — naming the actual cycle, not just "a cycle exists"
- Diamond dependencies: when two packages share a common dependency, it must appear exactly once, in a valid position
- A realistic package-manager-style install order calculator

**Time:** 70–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Package `app` depends on `left` and `right`; both `left` and `right` depend on `shared`. How many times should `shared` appear in the install order?
> 2. `A` depends on `B`, `B` depends on `C`, `C` depends on `A`. Is there ANY valid install order? Why or why not?
> 3. In LAB-06's DFS, you marked a node "visited" once and never revisited it. For cycle detection, is "visited" enough, or do you need a second, different marker?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `node main.js` prints:

```
=== Simple Chain ===
graph:
  test -> [compile]
  compile -> [link]
  link -> [package]
  package -> []
install order: package link compile test

=== Diamond Dependency ===
graph:
  app -> [left, right]
  left -> [shared]
  right -> [shared]
  shared -> []
install order: shared left right app
  ← "shared" appears exactly once, before anything that needs it

=== Cycle Detection ===
graph:
  A -> [B]
  B -> [C]
  C -> [A]
detectCycle found: A -> B -> C -> A

=== Cycle Detection: No False Positives ===
graph:
  X -> [Y]
  Y -> [Z]
  Z -> []
  W -> [Z]
detectCycle found: none (this is a valid DAG, even though Z has two dependents)

=== Realistic Install Order ===
packages:
  react-app -> [react, webpack]
  react -> [object-assign]
  webpack -> [webpack-cli, object-assign]
  webpack-cli -> []
  object-assign -> []
install order: object-assign react webpack-cli webpack react-app
```

---

### Concept: Dependency Graphs, Recapped

**What it is:** A dependency graph is a directed graph where an edge `A -> B` means "A requires B to already be done/installed/built FIRST." This is exactly LAB-06's directed graph example, generalized into its own mini-project.

**The problem before:** Given a set of packages/tasks with dependencies on each other, you need an ORDER to process them in that never processes something before everything it needs.

**The solution:** Topological sort — visit nodes such that every edge `A -> B` results in `B` appearing BEFORE `A` in the output (since `A` needs `B` done first). LAB-06 solved this with Kahn's algorithm (BFS: repeatedly pull nodes with zero remaining dependencies). This lab solves it a SECOND way — DFS-based — because seeing the same result reached two different ways builds real understanding of WHY it works, not just memorization of one recipe.

**Canonical example (General Explanation, the DFS approach):**

Think of getting dressed: you can't put on shoes before socks. A DFS-based topological sort works by: for each item, first make sure everything IT depends on is fully handled (recurse), and only THEN add the item itself to the order. This is EXACTLY LAB-06's postorder traversal (children before the node) — visit dependencies first, add yourself to the output list last, then reverse the whole list at the very end (since "last to finish" means "needed earliest").

```js
function topologicalSort(graph) {
  const visited = new Set()
  const order = []

  function visit(node) {
    if (visited.has(node)) return
    visited.add(node)
    for (const dep of graph[node]) {
      visit(dep)                    // fully resolve dependencies FIRST — postorder, like LAB-06
    }
    order.push(node)                // THEN add this node — it's now safe, everything it needs is already in order
  }

  for (const node of Object.keys(graph)) visit(node)
  return order                       // dependencies naturally end up earlier in this order — no reversal needed
                                      // (because we push AFTER dependencies, deps are already earlier in `order`)
}
```

**Project Application (The "Why" here):** Notice this version needs NO in-degree counting (unlike LAB-06's Kahn's algorithm) — it relies entirely on recursion's natural "finish children before returning" property, echoing LAB-07's recursive-case contract directly.

**Watch for:** Both algorithms are equally correct — Kahn's (BFS, in-degree counting) and DFS-based (recursive, postorder) are simply two different ways to arrive at a valid topological order. Real systems use both; npm's dependency resolver and `make` both effectively perform this same operation, using whichever technique suits their exact constraints.

---

## Step 1 — DFS-Based Topological Sort

```js
// dependency-graph.js

function topologicalSort(graph) {
  const visited = new Set()
  const order = []

  function visit(node) {
    if (visited.has(node)) return                  // ← add: already fully processed — skip
    visited.add(node)
    for (const dep of graph[node] || []) {           // ← add: recurse into every dependency FIRST
      visit(dep)
    }
    order.push(node)                                 // ← add: THEN add this node — postorder, from LAB-06
  }

  for (const node of Object.keys(graph)) {
    visit(node)
  }

  return order
}

function printGraph(graph, order) {
  console.log('graph:')
  for (const node of order) {
    console.log(`  ${node} -> [${(graph[node] || []).join(', ')}]`)
  }
}

module.exports = { topologicalSort, printGraph }
```

```js
// main.js
const { topologicalSort, printGraph } = require('./dependency-graph')

console.log('=== Simple Chain ===')
const buildGraph = {
  test: ['compile'],
  compile: ['link'],
  link: ['package'],
  package: [],
}

printGraph(buildGraph, ['test', 'compile', 'link', 'package'])
console.log(`install order: ${topologicalSort(buildGraph).join(' ')}`)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Simple Chain ===
graph:
  test -> [compile]
  compile -> [link]
  link -> [package]
  package -> []
install order: package link compile test
```

**Trace it by hand:** `visit('test')` marks `test` visited, then recurses into `visit('compile')`, which recurses into `visit('link')`, which recurses into `visit('package')`. `package` has no dependencies — its `for` loop does nothing, so it's pushed IMMEDIATELY: `order = ['package']`. Back in `link`'s call, its loop is done, so `link` gets pushed: `order = ['package', 'link']`. This continues outward: `compile` pushed (`order = ['package', 'link', 'compile']`), then `test` pushed last (`order = ['package', 'link', 'compile', 'test']`). The DEEPEST dependency ends up FIRST in `order`, exactly matching LAB-06's postorder giving the topological result directly.

**Change something:** Add a 5th independent node, `docs: []`, to `buildGraph` with no dependents. Confirm it appears SOMEWHERE in the output (order relative to the others doesn't matter, since nothing depends on it and it depends on nothing) — a topological sort is not always unique; any order respecting the edges is valid.

---

## Step 2 — Diamond Dependencies

```js
console.log('\n=== Diamond Dependency ===')
const diamondGraph = {
  app: ['left', 'right'],
  left: ['shared'],
  right: ['shared'],
  shared: [],
}

printGraph(diamondGraph, ['app', 'left', 'right', 'shared'])
console.log(`install order: ${topologicalSort(diamondGraph).join(' ')}`)
console.log('  ← "shared" appears exactly once, before anything that needs it')
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Diamond Dependency ===
graph:
  app -> [left, right]
  left -> [shared]
  right -> [shared]
  shared -> []
install order: shared left right app
  ← "shared" appears exactly once, before anything that needs it
```

**Trace WHY `shared` appears only once:** `visit('app')` recurses into `visit('left')`, which recurses into `visit('shared')` — `shared` gets marked visited AND pushed (`order = ['shared']`) before `left` returns. Back in `left`, it's pushed (`order = ['shared', 'left']`). `app`'s loop continues to `visit('right')` — but `right`'s own recursion into `visit('shared')` hits `if (visited.has('shared')) return` IMMEDIATELY — `shared` was already fully handled, so this second visit does NOTHING. `right` still gets pushed normally (`order = ['shared', 'left', 'right']`), and finally `app` (`order = ['shared', 'left', 'right', 'app']`).

**This is the exact same `visited` guard from LAB-06's DFS** (`if (visited.count(node)) return;`) — there, it prevented infinite loops on cycles; here, it ALSO prevents duplicate work and duplicate output entries when two different paths lead to the same shared node. One guard, two payoffs.

---

### Concept: Cycle Detection — "Visited" Isn't Enough

**What it is:** A cycle (`A` depends on `B`, `B` depends on `C`, `C` depends on `A`) has NO valid install order — something would always need to be installed before itself. Detecting this requires distinguishing "fully finished" from "currently being processed" — two DIFFERENT states, not one.

**The problem before:** LAB-06's `visited` set only asks "have I EVER seen this node?" — but that alone cannot detect a cycle. If `visit('A')` calls `visit('B')` which calls `visit('C')` which calls `visit('A')` again, a SIMPLE `visited` set would say "yes, `A` is visited" and just skip it silently — hiding the cycle instead of reporting it, since `A` WAS visited... it's just that we're still INSIDE processing it, not done with it.

**The solution:** Track TWO states per node: **"currently on the call stack"** (in-progress — call it `visiting`) and **"fully done"** (call it `visited`). If you reach a node that's `visiting` (on the current path, not yet finished), you've found a cycle — you looped back to something you're still in the middle of processing.

**Canonical example (General Explanation):**

Think of walking through a building checking rooms, but you're currently STANDING IN room A while checking room B, which leads to room C, which leads BACK to room A. You haven't "finished with" room A — you're still physically standing there. Arriving back at a room you're currently inside of (not just one you visited earlier and left) is the signature of a loop in the hallway layout.

```js
function detectCycle(graph) {
  const visited = new Set()     // fully done — safe, never revisit
  const visiting = new Set()    // currently on the current recursion path — a repeat here IS a cycle

  function visit(node, path) {
    if (visited.has(node)) return null            // fully done already — no cycle through here
    if (visiting.has(node)) {
      return [...path, node]                       // found it — 'node' is still being processed = cycle
    }

    visiting.add(node)
    for (const dep of graph[node] || []) {
      const cycle = visit(dep, [...path, node])
      if (cycle) return cycle                       // propagate the cycle finding up through the recursion
    }
    visiting.delete(node)                            // ← add: DONE processing this path — no longer "in progress"
    visited.add(node)
    return null
  }

  for (const node of Object.keys(graph)) {
    const cycle = visit(node, [])
    if (cycle) return cycle
  }
  return null
}
```

**What it hides (Law 7):** The caller of `detectCycle` never needs to understand the visiting/visited distinction — they just get back `null` (no cycle) or an array showing the exact loop, ready to display in an error message.

---

## Step 3 — Cycle Detection

```js
function detectCycle(graph) {
  const visited = new Set()                            // ← add: fully processed nodes
  const visiting = new Set()                            // ← add: nodes on the CURRENT recursion path

  function visit(node, path) {
    if (visited.has(node)) return null
    if (visiting.has(node)) {
      return [...path, node]                              // ← add: found a repeat WHILE still in progress = cycle
    }

    visiting.add(node)                                    // ← add: mark "in progress"
    for (const dep of graph[node] || []) {
      const cycle = visit(dep, [...path, node])
      if (cycle) return cycle
    }
    visiting.delete(node)                                 // ← add: done with this path — no longer in progress
    visited.add(node)
    return null
  }

  for (const node of Object.keys(graph)) {
    const cycle = visit(node, [])
    if (cycle) return cycle
  }
  return null
}

module.exports = { topologicalSort, printGraph, detectCycle }
```

Add to `main.js`:

```js
console.log('\n=== Cycle Detection ===')
const cyclicGraph = { A: ['B'], B: ['C'], C: ['A'] }
printGraph(cyclicGraph, ['A', 'B', 'C'])
const cycle = detectCycle(cyclicGraph)
console.log(`detectCycle found: ${cycle.join(' -> ')}`)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Cycle Detection ===
graph:
  A -> [B]
  B -> [C]
  C -> [A]
detectCycle found: A -> B -> C -> A
```

**Trace the visiting/visited distinction directly:** `visit('A', [])` marks `A` as `visiting`, recurses into `visit('B', ['A'])`, which marks `B` `visiting`, recurses into `visit('C', ['A','B'])`, which marks `C` `visiting`, recurses into `visit('A', ['A','B','C'])` — and NOW `visiting.has('A')` is `true` (A was never removed from `visiting`, because its own `for` loop is still running, waiting on this very call to return) — so this returns `[...['A','B','C'], 'A']` = `['A','B','C','A']`, correctly showing the full loop back to where it started.

**Change something:** Add a 4th node, `D: []`, with nothing pointing to it and it pointing to nothing. Confirm `detectCycle` still correctly finds the `A → B → C → A` cycle — an unrelated, cycle-free node elsewhere in the graph doesn't interfere.

---

## Step 4 — Confirming No False Positives

A graph where one node has MULTIPLE dependents (like the diamond in Step 2) is NOT a cycle — `detectCycle` must correctly tell the difference.

```js
console.log('\n=== Cycle Detection: No False Positives ===')
const validDag = { X: ['Y'], Y: ['Z'], Z: [], W: ['Z'] }
printGraph(validDag, ['X', 'Y', 'Z', 'W'])
const noCycle = detectCycle(validDag)
console.log(`detectCycle found: ${noCycle ? noCycle.join(' -> ') : 'none (this is a valid DAG, even though Z has two dependents)'}`)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Cycle Detection: No False Positives ===
graph:
  X -> [Y]
  Y -> [Z]
  Z -> []
  W -> [Z]
detectCycle found: none (this is a valid DAG, even though Z has two dependents)
```

**Why this ISN'T flagged as a cycle:** By the time `visit('W', [])` reaches `visit('Z', ['W'])`, `Z` was ALREADY fully processed by the earlier `visit('X', [])` → `visit('Y', ['X'])` → `visit('Z', ['X','Y'])` chain — meaning `Z` is in `visited` (fully done), NOT `visiting` (in progress). The very first check, `if (visited.has(node)) return null`, catches this and correctly reports no cycle. Multiple things depending on the SAME node (a diamond) is completely normal and NOT a cycle — only looping back to something still `visiting` (still on the current path) is.

---

## 🎯 Challenge: Realistic Package Install Order

**You know:** Both `topologicalSort` and `detectCycle` are already fully general — they work on any graph shaped as `{ nodeName: [dependencyNames] }`.

**Task:** Build a small `package.json`-style dependency graph (4-5 packages, at least one shared dependency) and compute its install order. Confirm `detectCycle` returns `null` for it before trusting the install order.

**Starting code:**

```js
const packages = {
  'react-app': ['react', 'webpack'],
  'react': ['object-assign'],
  'webpack': ['webpack-cli', 'object-assign'],
  'webpack-cli': [],
  'object-assign': [],
}

// TODO: confirm no cycle, then print the install order
```

<details>
<summary>▶ Show Solution</summary>

```js
console.log('\n=== Realistic Install Order ===')
const packages = {
  'react-app': ['react', 'webpack'],
  'react': ['object-assign'],
  'webpack': ['webpack-cli', 'object-assign'],
  'webpack-cli': [],
  'object-assign': [],
}

console.log('packages:')
for (const [name, deps] of Object.entries(packages)) {
  console.log(`  ${name} -> [${deps.join(', ')}]`)
}

const packageCycle = detectCycle(packages)
if (packageCycle) {
  console.log(`Cannot install — circular dependency: ${packageCycle.join(' -> ')}`)
} else {
  console.log(`install order: ${topologicalSort(packages).join(' ')}`)
}
```

**Key insight:** `object-assign` is a shared dependency of BOTH `react` and `webpack`, exactly like Step 2's diamond — it correctly appears exactly once, positioned before both things that need it. This is precisely what a real package manager (npm, pip, Cargo) does before installing anything: build the full dependency graph, verify there's no cycle (which would mean an unsatisfiable requirement), then compute one valid install order.

</details>

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Realistic Install Order ===
packages:
  react-app -> [react, webpack]
  react -> [object-assign]
  webpack -> [webpack-cli, object-assign]
  webpack-cli -> []
  object-assign -> []
install order: object-assign react webpack-cli webpack react-app
```

**Confirm the guarantee holds:** For EVERY package in this order, every one of ITS dependencies already appears somewhere earlier in the list. Verify this by hand for `webpack`: its dependencies are `webpack-cli` and `object-assign` — both appear before `webpack` in the output.

---

## Mental Model: Where This Shows Up

| System | What's a "node" | What's an "edge" |
|---|---|---|
| npm / pip / Cargo | A package | "requires" |
| Make / Bazel / CI pipelines | A build target | "must build before" |
| Spreadsheet formulas | A cell | "reads the value of" |
| Terraform / infrastructure-as-code | A resource | "must exist before" |
| Course prerequisites | A course | "must complete before" |

**Where you will see this again:**
- LAB-15 (Scheduler) — takes this lab's ordering one step further: not just WHAT order, but WHEN, with priorities and timing
- LAB-64 (Migration System) — database migrations must run in dependency order, with the exact same cycle-detection safety net
- LAB-37 (Reactive Spreadsheet) — recalculating cells in dependency order IS this lab's algorithm, applied to formulas instead of packages

---

## Final Check

| Feature | How to verify |
|---|---|
| Simple chain produces a valid dependency-respecting order | Step 1 |
| Diamond dependency: shared node appears exactly once | Step 2 |
| Cycle detection correctly identifies and names a real cycle | Step 3 |
| Cycle detection does NOT falsely flag a diamond (shared, non-cyclic) as a cycle | Step 4 |
| A 5-package realistic graph produces a correct, verifiable install order | Challenge |
| You can explain, without notes, why `visited` alone can't detect cycles | `visiting` vs `visited` distinction |

---

## Quick Check Answers

**1. `app` depends on `left` and `right`; both depend on `shared`. How many times should `shared` appear?**

Exactly once. This lab's `visited` set (from LAB-06's DFS pattern) ensures a node is only ever pushed into the output ONE time, regardless of how many other nodes depend on it — confirmed directly in Step 2, where `shared` appeared once despite being reached through two different paths (`app → left → shared` and `app → right → shared`).

**2. `A → B → C → A` — is there a valid install order?**

No. Every node in the cycle transitively depends on itself — `A` needs `B`, which needs `C`, which needs `A` again. There is no starting point with zero unresolved dependencies, so no linear order can satisfy all the edges simultaneously. This is exactly what `detectCycle` exists to catch BEFORE attempting `topologicalSort`, which would otherwise recurse forever or (in this lab's specific implementation) simply never terminate correctly on a cyclic graph.

**3. Is `visited` alone enough for cycle detection, or do you need a second marker?**

You need a second marker (`visiting`, tracking "currently on the current recursion path," distinct from `visited`, tracking "fully finished"). `visited` alone only answers "have I ever started processing this node," which is TRUE for every node still in the middle of being processed too — so a plain `visited` check cannot distinguish "I'm revisiting something I already fully finished" (fine — a diamond) from "I've looped back to something I'm still in the middle of, higher up the SAME call stack" (a cycle). This lab's Step 3 made that distinction explicit, and Step 4 confirmed it correctly avoids false positives on legitimate diamonds.

---

*Next: [LAB-15 — Scheduler](LAB-15-scheduler.md) — JavaScript, same module*
