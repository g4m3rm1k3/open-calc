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

Lesson 09 left `lookupCell` as a recursive function that evaluates formula cells, and named precisely what that recursion builds: a directed graph, where an edge from cell X to cell Y means "X's formula references Y." A cell referencing itself, directly or through a chain of other cells, closes a **cycle** in that graph — this is the exact graph-theory term for what `=A1` in A1, or `A1 = =B1` with `B1 = =A1`, actually is. Without detection, a cell referencing itself calls `lookupCell` on its own name, which evaluates the same cell, which calls `lookupCell` again — infinite recursion and an eventual stack overflow.

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

**Walkthrough — what a `Set` is, before the methods that operate on it:**

`new Set<string>()` creates a **Set** — a built-in JavaScript collection, like an
array, but with one defining difference: a Set can never contain the same value
twice. Adding a value already present does nothing (no duplicate, no error, silently
a no-op); this is exactly the property this project needs — `visiting` should never
need to ask "is `'A1'` in here twice," because it never can be. `.add(value)` inserts
a value. `.delete(value)` removes it. `.has(value)` checks membership, returning
`true` or `false`. Unlike an array, a Set has no numeric indices — you never write
`visiting[0]`, only ever check membership or add/remove.

**Walkthrough — `visiting.add(name)` / `visiting.delete(name)`:**

Before evaluating a formula cell, add its name to `visiting`. After evaluation (success or failure), remove it. If `lookupCell(name)` is called and `name` is already in `visiting`, the cycle is detected and `{ kind: 'circular', ... }` is returned immediately without any further recursion.

The `visiting` set starts empty for the root cell being displayed. It grows as the evaluation descends into referenced cells and shrinks as it returns. At any given moment, `visiting` contains exactly the cells currently "on the call stack."

**Walkthrough — `[...visiting, name]`, spreading a Set into an array:**

The spread operator (`...`) already appeared on objects (`{ ...cells.value }`, Lesson
11's undo snapshots). Here it spreads a *Set* instead — `[...visiting, name]` creates
a brand-new **array** containing every value currently in `visiting`, in the order
they were added, followed by `name`. This conversion matters because `chain` in
`EvalResult`'s `'circular'` variant is typed as `string[]`, not `Set<string>` — an
array is the right type for something you intend to display in order
(`chain.join(' → ')`, used later), while a Set is the right type for something you
only ever need to ask "is X in here."

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

## Step 2b — `debugInfo` has to change too, and this is worth pausing on

**The problem:** `evaluate`'s signature just changed for every caller, not only the one inside `displayCell`. Lesson 09's `debugInfo` computed also calls `evaluate`, with its own separate inline `lookupCell` — one that still returns a plain `number`, matching `evaluate`'s *old* signature. `evaluate` now expects a `lookupCell` that returns `EvalResult` and itself returns `EvalResult`, not `number`. Nothing about `debugInfo` was touched in Step 1 or Step 2, which means it is now silently out of sync with the function it calls.

**This is deliberately shown as a mistake first, not silently corrected**, because it is exactly the kind of gap real refactoring work produces: changing one function's contract (`evaluate`) and updating every call site *except* one that was easy to forget, because it lives in a different part of the file than the one you were focused on (`displayCell`). Vue Studio's sandbox will not stop you here — it strips TypeScript's types to run your code quickly, without fully type-checking them, so this mismatch produces no error and no crash. But it is a real type error: a real project's `vue-tsc` (Lesson 20) would refuse to build, and Monaco's own inline checking in the editor would underline it. Without a real compiler in the loop, this class of mistake ships silently — `debugInfo.result` would hold a whole `EvalResult` object instead of the plain number the debug panel expects to display, and the "Result" section would show something like `[object Object]` instead of a clean number, with no error anywhere telling you why.

Fix `debugInfo` to build a matching `EvalResult`-returning `lookupCell`, then unwrap the final result back down to a plain number for the panel to display exactly as before:

```typescript
const debugInfo = computed<DebugInfo | null>(() => {
  const sel = selectedCoordinate.value
  if (sel === null) return null
  const cell = cells.value[cellId(sel)]
  if (!cell || cell.kind !== 'formula') return null
  try {
    const tokens = tokenize(cell.expr)
    const parseResult = parse(tokens)

    function lookupCell(name: string): EvalResult {
      const c = cells.value[name]
      if (!c || c.kind === 'text') return { kind: 'ok', value: 0 }
      if (c.kind === 'number') return { kind: 'ok', value: c.value }
      const pr = parse(tokenize(c.expr))
      return pr.success === true ? evaluate(pr.ast, () => ({ kind: 'ok', value: 0 })) : { kind: 'error', message: 'parse failed' }
    }

    const evalResult = parseResult.success === true ? evaluate(parseResult.ast, lookupCell) : null
    const result = evalResult && evalResult.kind === 'ok' ? evalResult.value : null
    return { tokens, parseResult, result }
  } catch {
    return null
  }
})
```

**Walkthrough — why `result` unwraps `evalResult` down to `evalResult.kind === 'ok' ? evalResult.value : null`:**

`DebugInfo.result` is still typed `number | null` (Step 1 of Lesson 08 never changed) — the debug panel's template already knows how to show a plain number or fall back to `(parse failed — no result)` for `null`. Rather than changing the panel's template and `DebugInfo`'s shape to carry a full `EvalResult`, this fix keeps the *external* contract identical and only fixes the *internal* mismatch — `evalResult.kind === 'ok'` narrows (Lesson 02's type narrowing, applied here to a three-way union instead of `Coordinate | null`) to the one case that actually has a `.value`; `'circular'` and `'error'` both collapse to `null`, the same "something went wrong, nothing to show" signal the panel already handled correctly. A future lesson could show `#CIRCULAR` in the debug panel's Result section too — this fix deliberately doesn't reach for that, keeping this step scoped to "make `debugInfo` compile correctly again," not "add a new feature to the debug panel."

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

**Walkthrough — `id in cache` and `Object.keys(allCells)`, two new ways of asking objects questions:**

`in` is an operator that checks whether a key exists on an object at all —
`'A1' in cache` is `true` the instant *any* value (even `undefined`) has been stored
at that key, and `false` only when the key was never set. This is different from
`cache['A1'] ?? ''`'s job: `??` asks "what value should I use, falling back if this
is missing," while `in` asks a yes/no question — "has this been computed yet?" —
which is exactly what `getDisplay` needs to decide whether to reuse a cached result
or compute a fresh one.

`Object.keys(someObject)` is a built-in function that returns an array of every key
an object has, as strings, in the order they were added — `Object.keys({ A1: 'x', B3:
'y' })` returns `['A1', 'B3']`. `for (const id of Object.keys(allCells))` is a
**for-of loop**: unlike `while`, which re-checks a condition, `for...of` iterates
once over every item in something iterable (an array, here) — one pass, in order, no
manual index or condition to manage. This loop's whole job is visiting every cell
address that has real data, so `getDisplay` can pre-compute and cache each one.

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

**Changing `evaluate`'s signature without updating every call site (Step 2b's own bug, left in on purpose to demonstrate it):**

Vue Studio's sandbox will not catch this — it strips types without type-checking them, so the mismatch runs without crashing, silently producing a wrong value (`debugInfo.result` becomes an `EvalResult` object where a plain `number` was expected). A real project's `vue-tsc` refuses to build at all until every caller matches the new signature. This is a real, common refactoring mistake — changing a function's contract and finding every place that calls it, not just the one you were already looking at — and the fact that this exact project shipped it, briefly, in the course of building this very lesson, is more convincing than being told to watch out for it in the abstract.

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
- [ ] You can explain why `debugInfo` needed its own fix in Step 2b, and why Vue Studio's sandbox didn't warn you about it

---

*Next: Lesson 11 — Undo/Redo. Ctrl+Z undoes any edit. The history of all cell states is an immutable stack — each state is a snapshot of the entire `cells` map.*
