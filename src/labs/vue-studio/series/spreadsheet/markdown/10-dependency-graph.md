# Dependency Graph

## What you will build

A live dependency graph panel showing which cells depend on which. Select a cell and see every cell it reads from (its dependencies) and every cell that reads from it (its dependents). This makes the formula evaluation order visible.

```
┌──────┬──────┬──────┐     Dependencies of C1 (=A1+B1):
│  5   │  10  │  15  │     A1 ──→ C1
└──────┴──────┴──────┘     B1 ──→ C1
       Cell C1 selected
```

---

## What you need to know first

In lesson 4 we wrote `evaluateFormula` — it evaluates `=A1+B1` by reading cells A1 and B1. But we never recorded which cells it read. This lesson adds that recording: every time a formula reads a cell, we note the relationship in a dependency `Map`. When a cell changes, we can look up which cells depend on it and re-evaluate only those — exactly how a production spreadsheet engine works.

---

## The lesson

### The problem

Right now every edit re-evaluates every formula in `displayData` (lesson 4). For a 10×8 grid this is fast. For a 1000×1000 grid, re-evaluating 1,000,000 cells when the user types one character is unacceptable. A dependency graph lets the engine re-evaluate only the cells that actually depend on the changed cell — O(k) where k is the number of dependents, not O(n²).

---

### Step 1 — Build the dependency map

**The problem:** We need a data structure that records, for each cell, which other cells its formula reads. When cell A1 changes, we need to find every cell whose formula reads A1 and re-evaluate only those.

```ts
// src/composables/useDependencyGraph.ts
import { ref } from 'vue'
import type { Ref } from 'vue'
import type { CellData } from '../types/cell'

export type CellKey = string  // e.g. "A1", "B2"

export interface DependencyGraph {
  // deps[key] = Set of keys this cell reads from
  deps: Map<CellKey, Set<CellKey>>
  // rdeps[key] = Set of keys that read from this cell
  rdeps: Map<CellKey, Set<CellKey>>
}

export function useDependencyGraph(cells: Ref<CellData[][]>) {
  const graph = ref<DependencyGraph>({ deps: new Map(), rdeps: new Map() })

  function rebuild() {
    const deps = new Map<CellKey, Set<CellKey>>()
    const rdeps = new Map<CellKey, Set<CellKey>>()

    cells.value.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const key = toKey(rowIndex, colIndex)
        if (typeof cell.raw !== 'string' || !cell.raw.startsWith('=')) return

        const references = extractReferences(cell.raw)
        deps.set(key, new Set(references))

        references.forEach(ref => {
          if (!rdeps.has(ref)) rdeps.set(ref, new Set())
          rdeps.get(ref)!.add(key)
        })
      })
    })

    graph.value = { deps, rdeps }
  }

  return { graph, rebuild }
}

function toKey(row: number, col: number): CellKey {
  return `${String.fromCharCode('A'.charCodeAt(0) + col)}${row + 1}`
}

function extractReferences(formula: string): CellKey[] {
  const pattern = /[A-Z]+\d+/g
  return formula.match(pattern) ?? []
}
```

**Walkthrough:** `deps` maps a cell key to the set of cells it reads. `rdeps` (reverse dependencies) maps a cell key to the set of cells that read from it. `rebuild()` iterates every cell — if its `raw` value is a formula string starting with `=`, it finds all cell references with a regex, records them in `deps`, and inverts the relationship into `rdeps`.

**What is `Map`?** A built-in JavaScript collection that maps keys to values — like a plain object, but with important differences: keys can be any type (not just strings), the Map remembers insertion order, and it has O(1) `get`, `set`, and `has` operations. `new Map<string, Set<string>>()` creates a Map with string keys and `Set<string>` values. `map.get(key)` returns the value or `undefined` if the key is not present. `map.set(key, value)` adds or replaces a key.

**Why `Map` instead of a plain object?** A plain object `{}` works well for string keys, but `Map` gives explicit methods (`has`, `get`, `set`, `delete`) that make intent clear, it handles edge cases (like keys that would shadow Object prototype methods such as `"toString"`), and `Map.forEach` iterates in insertion order reliably across all JS engines. For a graph-adjacent data structure with frequent lookup and mutation, `Map` is the standard choice.

**What is `Set`?** A built-in JavaScript collection of unique values. `new Set<string>()` creates an empty Set. `set.add('A1')` adds `'A1'` (no-op if already present). `set.has('A1')` checks membership in O(1). The key property: no duplicate values. For dependency tracking, a cell either depends on A1 or it does not — `Set` automatically prevents recording the same dependency twice.

**What is `Array.prototype.forEach(callback)`?** Calls `callback(element, index, array)` once for each element. `cells.value.forEach((row, rowIndex) => ...)` is equivalent to `for (let rowIndex = 0; rowIndex < cells.value.length; rowIndex++)`. It does not return a value (unlike `map` or `filter`). Use `forEach` when you want side effects; use `map` when you want a new array.

**What is `/[A-Z]+\d+/g` (the regex)?** A regular expression:
- `/` starts the regex literal
- `[A-Z]+` matches one or more uppercase letters (the column, e.g. `A`, `B`, `AB`)
- `\d+` matches one or more digits (the row number, e.g. `1`, `23`)
- `/g` is the global flag — `match` with `g` returns all matches in the string, not just the first
- `.match(pattern) ?? []` returns the array of matches, or `[]` if there are none

`"=A1+B2".match(/[A-Z]+\d+/g)` returns `['A1', 'B2']`.

**What is `rdeps.get(ref)!.add(key)`?** The `!` is a TypeScript non-null assertion: "I know this is not null or undefined." We just called `rdeps.set(ref, new Set())` on the line above — so `rdeps.get(ref)` is guaranteed to return the Set we just inserted. The `!` tells TypeScript to trust this. At runtime, `!` erases completely (it is only a compile-time instruction). Never use `!` unless you can prove the value is non-null.

**CS concept — bidirectional graph:** The dependency graph is directed: A1 → C1 means "C1 reads from A1." `deps` stores forward edges (what a cell reads). `rdeps` stores backward edges (what reads a cell). Both directions are necessary: the UI needs "what does this cell depend on?" (forward), and incremental re-evaluation needs "who depends on this cell?" (backward). Storing both makes each query O(1) instead of requiring a full scan.

**SE principle — separation of derivation:** `DependencyGraph` is pure derived state — it is computed from `cells.value` and contains nothing that is not already in `cells.value`. Rebuilding it from scratch on every cell edit is correct and fast for a small grid. A production engine would use incremental updates (remove the old deps for the edited cell, add the new deps after re-parse), but the bidirectional structure is the same.

**What breaks if you use `deps` alone without `rdeps`:** Finding all cells that depend on A1 requires scanning every cell's `deps` set looking for A1. For a 100×100 grid, that is 10,000 set-membership checks per edit. With `rdeps`, the same query is `rdeps.get('A1')` — a single O(1) lookup.

---

### Step 2 — Detect circular dependencies

**The problem:** If A1 = `=B1` and B1 = `=A1`, they form a cycle. The formula evaluator from lesson 4 would infinite-loop (or hit a call stack limit). We need to detect cycles before evaluating.

```ts
export function hasCycle(
  start: CellKey,
  graph: DependencyGraph,
  visited = new Set<CellKey>(),
  stack = new Set<CellKey>()
): boolean {
  if (stack.has(start)) return true   // found a back-edge: cycle
  if (visited.has(start)) return false // already fully explored, no cycle here

  visited.add(start)
  stack.add(start)

  const deps = graph.deps.get(start)
  if (deps) {
    for (const dep of deps) {
      if (hasCycle(dep, graph, visited, stack)) return true
    }
  }

  stack.delete(start)
  return false
}
```

**Walkthrough:** `hasCycle` uses depth-first search. `visited` marks nodes we have fully explored. `stack` marks nodes on the current recursion path. If we encounter a node that is already on the current path (`stack.has(start)`), we have found a back edge — a cycle. If we find a node that was already fully explored (`visited.has(start)`), we skip it — no cycle through this path.

**What is `for (const dep of deps)`?** `for...of` iterates over any iterable — arrays, Sets, Maps, strings. `for (const dep of deps)` calls `.next()` on the Set's iterator in sequence, assigning each value to `dep`. Unlike `forEach`, `for...of` supports `break` (to stop early) and `return` (from the enclosing function).

**CS concept — depth-first search (DFS):** DFS explores as deep as possible along one path before backtracking. Here it follows the dependency chain: A1 → B1 → C1 → ... until a dead end or cycle. The two sets (`visited`, `stack`) are the standard bookkeeping for cycle detection in directed graphs. This exact algorithm (DFS with a "current path" set) is called the "white-gray-black" algorithm in textbooks.

**What breaks without cycle detection:** `evaluateFormula('=B1', cells)` evaluates B1. B1 is `=A1`. `evaluateFormula('=A1', cells)` evaluates A1. A1 is `=B1`. Infinite recursion. The call stack overflows with `RangeError: Maximum call stack size exceeded` — no helpful error message for the user.

---

### Step 3 — The DependencyPanel component

**The problem:** Show the dependencies of the selected cell as a simple list — what it reads from and what reads from it.

```vue
<!-- src/components/DependencyPanel.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useSelection } from '../composables/useSelection'
import type { DependencyGraph, CellKey } from '../composables/useDependencyGraph'

const props = defineProps<{
  graph: DependencyGraph
}>()

const { selectedCell } = useSelection()

const selectedKey = computed<CellKey | null>(() => {
  if (!selectedCell.value) return null
  const { row, col } = selectedCell.value
  return `${String.fromCharCode('A'.charCodeAt(0) + col)}${row + 1}`
})

const dependencies = computed(() => {
  if (!selectedKey.value) return []
  return Array.from(props.graph.deps.get(selectedKey.value) ?? new Set())
})

const dependents = computed(() => {
  if (!selectedKey.value) return []
  return Array.from(props.graph.rdeps.get(selectedKey.value) ?? new Set())
})
</script>

<template>
  <div class="dep-panel">
    <template v-if="selectedKey">
      <div class="panel-title">{{ selectedKey }}</div>

      <div class="section-label">Reads from</div>
      <div v-if="dependencies.length === 0" class="empty">No dependencies</div>
      <div v-for="dep in dependencies" :key="dep" class="dep-item reads-from">
        {{ dep }} → {{ selectedKey }}
      </div>

      <div class="section-label">Read by</div>
      <div v-if="dependents.length === 0" class="empty">Nothing depends on this cell</div>
      <div v-for="dep in dependents" :key="dep" class="dep-item read-by">
        {{ selectedKey }} → {{ dep }}
      </div>
    </template>
    <div v-else class="empty">Select a cell to see its dependencies</div>
  </div>
</template>

<style scoped>
.dep-panel { padding: 12px; font-size: 13px; }
.panel-title { font-weight: 700; color: #41b883; margin-bottom: 12px; font-size: 15px; }
.section-label { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; margin: 8px 0 4px; }
.dep-item { padding: 4px 8px; border-radius: 4px; font-family: monospace; margin-bottom: 2px; }
.reads-from { background: #dbeafe; color: #1e40af; }
.read-by { background: #dcfce7; color: #15803d; }
.empty { color: #94a3b8; font-style: italic; }
</style>
```

**Walkthrough:** `selectedKey` converts the selected cell's row/col to a string key like `'B2'`. `dependencies` reads from `graph.deps` — the cells this cell formula reads. `dependents` reads from `graph.rdeps` — the cells whose formulas reference this cell. Both are `Array.from(set ?? new Set())` — converting the Set to an array for `v-for`, with an empty Set as fallback if the key is not in the map.

**What is `Array.from(iterable)`?** Converts any iterable (Set, Map, string, NodeList, arguments) to a plain array. `Array.from(new Set(['A1', 'B2']))` → `['A1', 'B2']`. The `v-for` directive works with arrays and plain iterables — but `Set.forEach` does not give the index that `v-for` expects with `:key`. Converting to an array first is the idiomatic approach.

**What is `?? new Set()`?** `map.get(key)` returns `undefined` if the key is not present. `undefined ?? new Set()` returns the new empty Set (because `undefined` is nullish). This means `Array.from(...)` never receives `undefined` — which would throw a `TypeError: undefined is not iterable`.

**What breaks without `Array.from`:** `v-for="dep in props.graph.deps.get(selectedKey.value)"` would iterate over a `Set` — which `v-for` does support, but using a Set as the `v-for` source makes `:key` tricky (Set values are not indexed). Converting to an array first is explicit and consistent.

---

### Step 4 — Wire rebuild into the spreadsheet update cycle

```ts
// In useSpreadsheet.ts — call rebuild() after every cell update
const { graph, rebuild } = useDependencyGraph(cells)

function updateCellValue(row: number, col: number, value: string) {
  const parsed = parseFloat(value)
  activeSheet.value.cells[row][col].raw = isNaN(parsed) ? value : parsed
  rebuild()  // recompute dependency graph after every edit
}
```

**Walkthrough:** Every cell edit triggers `rebuild()`. This re-scans the entire grid to rebuild `deps` and `rdeps`. For a small grid, this is fast (< 1ms). In a production engine, you would incrementally update: remove the edited cell's old deps, re-parse its formula, add the new deps. But the interface (the `Map` and `Set` structure) stays identical.

**What breaks without calling `rebuild()` after an update:** The graph reflects the cell formulas at the last rebuild. If the user changes a formula in B2 from `=A1` to `=C1`, the graph still shows B2 → A1 until the next rebuild. The dependency panel shows stale information.

---

## Connect the pieces

The dependency graph is the engine layer between the data model (lesson 5's `CellData`) and the evaluation engine (lesson 4's `evaluateFormula`). It makes the spreadsheet's evaluation order explicit — not just correct, but inspectable.

**In production:** Microsoft Excel's calculation engine, Google Sheets' server-side evaluator, and LibreOffice Calc all maintain exactly this bidirectional dependency graph. When you set a cell to `=A1+B1`, Excel records A1 and B1 in that cell's dependency set, and adds that cell to A1's and B1's reverse dependency sets. Pressing F9 (recalculate) does a topological sort of the dependency graph and re-evaluates each cell once in the correct order.

The `Map` and `Set` structures you wrote here are the direct analogues of the production data structures, scaled down to fit a lesson.

---

## What breaks without this

**Without a dependency graph:** The only option is full recalculation — evaluate every formula on every keystroke. For 10,000 cells with complex formulas, that is seconds of lag per character. With the graph, only the affected cells are touched — typically 1–10 cells in a normal spreadsheet. This is the difference between a feature and a product.

---

## Definition of done

- [ ] Selecting a formula cell (e.g. `=A1+B1`) shows `A1` and `B1` in the "Reads from" section
- [ ] Selecting A1 shows C1 in the "Read by" section (if C1 = `=A1+B1`)
- [ ] Selecting a non-formula cell shows "No dependencies" and "Nothing depends on this cell"
- [ ] Entering a circular formula (`A1 = =B1`, `B1 = =A1`) shows `#CYCLE` in the cell, not an infinite loop
- [ ] **Git commit:**

```
git add src/
git commit -m "Add dependency graph — Map/Set bidirectional tracking of cell formula references"
```
