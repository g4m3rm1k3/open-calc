# Vue Spreadsheet — Lesson 10 — Circular Reference Detection

## What you will build

Set A1 to `=A1` — the cell shows `#CIRCULAR` instead of crashing the tab. Set A1 to `=B1` and B1 to `=A1` — both show `#CIRCULAR`. Any other formula evaluates normally. The detection is exact: a "currently evaluating" set tracks which cells are in flight; if a cell is asked for its own value while it is being computed, the cycle is detected and named.

```
    A           B
1 | #CIRCULAR | =A1  |   ← A1 = =B1, B1 = =A1, both circular
2 | =A2+1     |      |   ← A2 = =A2, self-referential
```

---

## What you need to know first

Lesson 09 left `lookupCell` as a recursive function that evaluates formula cells. A cell referencing itself calls `lookupCell` on its own name, which evaluates the same cell, which calls `lookupCell` again — infinite recursion and an eventual stack overflow.

---

## Concept: the visited set

Detecting circular references requires remembering which cells are currently being evaluated. A **visited set** tracks this: before evaluating a cell, add its name to the set; after, remove it. If `lookupCell` is called for a name already in the set, the cycle is detected.

```
Evaluating C1 (=A1+B1):
  visited = { 'C1' }
  needs A1 → add 'A1' to visited: { 'C1', 'A1' }
  A1 is =B1:
    needs B1 → add 'B1' to visited: { 'C1', 'A1', 'B1' }
    B1 is =A1:
      needs A1 → 'A1' is already in visited → CIRCULAR!
```

The visited set approach detects indirect cycles (A→B→C→A) as well as direct self-reference (A→A).

---

## Step 1 — A new result type for evaluation

**The problem:** `evaluate` currently returns `number`. It has no way to signal a circular reference or other error.

Add to `<script setup>`:

```typescript
type EvalResult =
  | { kind: 'ok';       value: number }
  | { kind: 'circular'; chain: string[] }
  | { kind: 'error';    message: string }
```

`EvalResult` is another discriminated union. `'ok'` carries the computed number. `'circular'` carries the chain of cell names that formed the cycle, for display. `'error'` carries a message for parse failures.

Update `evaluate` to return `EvalResult` instead of `number`:

```typescript
function evaluate(
  node: ExpressionNode,
  lookupCell: (name: string) => EvalResult
): EvalResult {
  switch (node.kind) {
    case 'Number':
      return { kind: 'ok', value: node.value }

    case 'UnaryExpression': {
      const result = evaluate(node.operand, lookupCell)
      if (result.kind !== 'ok') return result
      return { kind: 'ok', value: -result.value }
    }

    case 'BinaryExpression': {
      const left = evaluate(node.left, lookupCell)
      if (left.kind !== 'ok') return left

      const right = evaluate(node.right, lookupCell)
      if (right.kind !== 'ok') return right

      return { kind: 'ok', value: applyOperator(node.operator, left.value, right.value) }
    }

    case 'CellReference':
      return lookupCell(node.name)

    default:
      return assertNever(node)
  }
}
```

**Walkthrough — propagating errors:**

Each call to `evaluate` that might fail checks whether its result is `'ok'` before using the value. If it is not `'ok'`, the non-ok result is returned immediately — bubbling up without unwrapping. This is a common pattern for error propagation in languages without exceptions: if any sub-computation fails, the failure propagates to the top. The first error encountered wins.

Run this throwaway to understand the propagation:

```vue
<script setup lang="ts">
type EvalResult =
  | { kind: 'ok';    value: number }
  | { kind: 'error'; message: string }

function add(a: EvalResult, b: EvalResult): EvalResult {
  if (a.kind !== 'ok') return a    // propagate first error
  if (b.kind !== 'ok') return b    // propagate second error
  return { kind: 'ok', value: a.value + b.value }
}

const ok10: EvalResult = { kind: 'ok', value: 10 }
const ok5:  EvalResult = { kind: 'ok', value: 5 }
const err:  EvalResult = { kind: 'error', message: 'circular' }

const results = [
  add(ok10, ok5),   // ok, 15
  add(err, ok5),    // error propagated
  add(ok10, err),   // error propagated
  add(err, err),    // first error wins
]
</script>
<template>
  <ul>
    <li v-for="(r, i) in results" :key="i">{{ JSON.stringify(r) }}</li>
  </ul>
</template>
```

**CS concept — the `Result` type pattern:**

`EvalResult` is an instance of the **Result type** pattern, common in languages like Rust (`Result<T, E>`) and functional languages. Instead of throwing exceptions, functions return a value that is either success or failure. Callers must explicitly check which case they have before using the value. This makes the possibility of failure visible in the type system and forces the caller to handle it.

JavaScript uses exceptions for errors; this project uses a discriminated union. Both are valid; the union makes the possible outcomes explicit in `evaluate`'s return type.

---

## Step 2 — Circular-reference-safe `lookupCell`

**The problem:** `lookupCell` needs the visited set.

Replace `displayCell`'s `lookupCell` implementation:

```typescript
function displayCell(
  cell: Cell | undefined,
  allCells: Record<CellId, Cell>
): string {
  if (!cell) return ''

  switch (cell.kind) {
    case 'number': return cell.value.toString()
    case 'text':   return cell.value
    case 'formula': {
      const parseResult = parse(tokenize(cell.expr))
      if (parseResult.success === false) return '#ERROR'

      const visiting = new Set<string>()

      function lookupCell(name: string): EvalResult {
        if (visiting.has(name)) {
          return { kind: 'circular', chain: [...visiting, name] }
        }
        const referenced = allCells[name]
        if (!referenced)                  return { kind: 'ok', value: 0 }
        if (referenced.kind === 'number') return { kind: 'ok', value: referenced.value }
        if (referenced.kind === 'text')   return { kind: 'ok', value: 0 }

        // formula cell — evaluate recursively
        const refParse = parse(tokenize(referenced.expr))
        if (refParse.success === false) return { kind: 'error', message: 'parse failed' }

        visiting.add(name)
        const result = evaluate(refParse.ast, lookupCell)
        visiting.delete(name)
        return result
      }

      const result = evaluate(parseResult.ast, lookupCell)
      if (result.kind === 'ok')       return result.value.toString()
      if (result.kind === 'circular') return '#CIRCULAR'
      return '#ERROR'
    }
    default: return assertNever(cell)
  }
}
```

**Walkthrough — `visiting.add(name)` / `visiting.delete(name)`:**

Before evaluating a formula cell, add its name to `visiting`. After evaluation (success or failure), remove it. If `lookupCell(name)` is called and `name` is already in `visiting`, the cycle is detected and `{ kind: 'circular', ... }` is returned immediately without any further recursion.

The `visiting` set starts empty for the root cell being displayed. It grows as the evaluation descends into referenced cells and shrinks as it returns. At any given moment, `visiting` contains exactly the cells currently "on the call stack."

**Walkthrough — why `visiting` is a `Set` not an array:**

`Set.has()` runs in O(1) — constant time regardless of how many cells are in the set. An array would require O(n) linear search. For formulas that reference many cells, the set is noticeably faster.

Run a throwaway to see the detection working:

```vue
<script setup lang="ts">
// Simulated cells (no real spreadsheet needed):
type CellKind = 'number' | 'formula'
type SimCell = { kind: 'number'; value: number } | { kind: 'formula'; expr: string }
type EvalResult = { kind: 'ok'; value: number } | { kind: 'circular'; chain: string[] }

function evaluateCell(
  name: string,
  allCells: Record<string, SimCell>,
  visiting = new Set<string>()
): EvalResult {
  if (visiting.has(name)) {
    return { kind: 'circular', chain: [...visiting, name] }
  }
  const cell = allCells[name]
  if (!cell) return { kind: 'ok', value: 0 }
  if (cell.kind === 'number') return { kind: 'ok', value: cell.value }

  // formula: just simulate =<ref> for this demo
  const ref = cell.expr.trim()
  visiting.add(name)
  const result = evaluateCell(ref, allCells, visiting)
  visiting.delete(name)
  return result
}

// Direct cycle: A1 = =A1
const selfRef = { 'A1': { kind: 'formula', expr: 'A1' } as const }
// Indirect cycle: A1 = =B1, B1 = =A1
const indirect = {
  'A1': { kind: 'formula', expr: 'B1' } as const,
  'B1': { kind: 'formula', expr: 'A1' } as const,
}
// No cycle: A1 = =B1, B1 = 10
const noCycle = {
  'A1': { kind: 'formula', expr: 'B1' } as const,
  'B1': { kind: 'number', value: 10 } as const,
}

const results = [
  { label: 'Self A1=A1', result: evaluateCell('A1', selfRef) },
  { label: 'Indirect A1→B1→A1', result: evaluateCell('A1', indirect) },
  { label: 'No cycle A1→B1=10', result: evaluateCell('A1', noCycle) },
]
</script>
<template>
  <ul>
    <li v-for="r in results" :key="r.label">
      {{ r.label }}: {{ r.result.kind }}
      <span v-if="r.result.kind === 'ok'"> = {{ r.result.value }}</span>
      <span v-if="r.result.kind === 'circular'"> ({{ r.result.chain.join(' → ') }})</span>
    </li>
  </ul>
</template>
```

Click ▶ Run. Direct self-reference shows `circular`. Indirect cycle shows `circular` with the chain. No cycle shows `ok` with value `10`.

---

## Step 3 — Precompute all display values

**The problem:** The template calls `displayCell(cells[...], cells)` sixty times on every render. Each call may re-evaluate formulas from scratch. For a grid with many cross-referencing formulas, this is redundant work.

Replace the per-call approach with a `computed` that evaluates all cells once:

```typescript
const displayValues = computed<Record<CellId, string>>(() => {
  const allCells = cells.value
  const cache: Record<CellId, string> = {}

  function getDisplay(id: CellId): string {
    if (id in cache) return cache[id]
    cache[id] = displayCell(allCells[id], allCells)
    return cache[id]
  }

  // Pre-compute all cells with data (lazy for empty cells)
  for (const id of Object.keys(allCells)) {
    getDisplay(id)
  }

  return cache
})
```

Update the template to use `displayValues` instead of calling `displayCell` inline:

```html
<template v-else>
  {{ displayValues[cellId({ col, row })] ?? '' }}
</template>
```

And for the edit input (still uses `editableText`):

```html
:value="editableText(cells[cellId({ col, row })])"
```

**Walkthrough — `computed` for derived state:**

`displayValues` is a `computed` that derives all display strings from `cells.value`. Any write to `cells.value` invalidates `displayValues`, triggering one re-computation that evaluates everything. The template reads `displayValues[id]` — a simple map lookup — for each cell. This replaces sixty separate `displayCell` calls on every render with one batch computation.

The `cache` inside `computed` is local to each evaluation run — not persistent between runs. It prevents the same cell from being evaluated twice within one render cycle (relevant when multiple formulas reference the same cell).

---

## What breaks without this

**Removing `visiting.add(name)` before the recursive call:**

Any direct self-reference immediately loops forever. The `visiting` set must be updated *before* recursing, not after — the add/recurse/delete sequence around the recursive call is the entire mechanism.

**Checking `visiting.has(name)` after `visiting.add(name)` instead of before:**

The name has already been added; the check always sees it in the set and returns `#CIRCULAR` for every formula cell, regardless of whether it is actually circular.

**Using an array for `visiting` with `.includes()` instead of a `Set` with `.has()`:**

For small grids: no observable difference. For a grid with formulas referencing 50+ cells: `includes` performs 50 comparisons per lookup; `has` performs 1. At scale, the difference matters. The Set is the right data structure for membership testing.

---

## Connect the pieces

```
App.vue
  <script setup>
    EvalResult         — discriminated union: ok, circular, error
    evaluate()         — returns EvalResult; propagates errors up
    lookupCell()       — inside displayCell; uses visiting Set;
                         checks for cycle before recursing
    displayValues      — computed; precomputes all display strings once
                         per reactive change to cells
  <template>
    displayValues[cellId({ col, row })] ?? ''
                       — simple map lookup; no inline computation
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] Setting A1 to `=A1` shows `#CIRCULAR` in A1
- [ ] Setting A1 to `=B1` and B1 to `=A1` shows `#CIRCULAR` in both
- [ ] All non-circular formulas still evaluate correctly
- [ ] You can explain the visited set algorithm and why the add/recurse/delete order matters
- [ ] You can explain why `Set.has()` is used instead of `Array.includes()`
- [ ] You can explain how `EvalResult` propagates errors without throwing

---

*Next: Lesson 11 — Undo/Redo. Ctrl+Z undoes any edit. The history of all cell states is an immutable stack — each state is a snapshot of the entire `cells` map.*
