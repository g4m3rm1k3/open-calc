# Named Ranges

## What you will build

A named range manager. Select a range of cells, give it a name like `PRICES`, and reference it in a formula as `=SUM(PRICES)`. The formula engine resolves the name to the range before evaluating.

```
Named range: PRICES = A1:A3  (cells with values 5, 10, 15)

Formula:  =SUM(PRICES)
Result:   30
```

---

## What you need to know first

In lesson 4 we built formula evaluation with basic cell references (`A1`, `B2`). This lesson adds two new capabilities: range notation (`A1:B3`) and named ranges (`PRICES`). Both extend the formula evaluator without modifying its core — the open/closed principle.

---

## The lesson

### The problem

Formulas like `=A1+A2+A3+A4+A5` are hard to write and impossible to read. Naming a range (`PRICES = A1:A5`) makes formulas readable (`=SUM(PRICES)`) and maintainable (change the range in one place). This is the same reason we name variables in code instead of using raw memory addresses.

---

### Step 1 — The range type

**The problem:** We need a data structure to represent a rectangular block of cells — a start coordinate and an end coordinate — and a way to parse range notation like `"A1:C3"`.

```ts
// src/types/namedRange.ts
import type { CellData } from './cell'

export interface CellRange {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
}

export interface NamedRange {
  name: string      // e.g., 'PRICES'
  range: CellRange
  sheetId: string   // which sheet this range belongs to
}

export function parseRange(rangeStr: string): CellRange {
  const [startAddress, endAddress] = rangeStr.split(':')
  const start = parseCellAddress(startAddress)
  const end = parseCellAddress(endAddress)
  return {
    startRow: Math.min(start.rowIndex, end.rowIndex),
    startCol: Math.min(start.colIndex, end.colIndex),
    endRow:   Math.max(start.rowIndex, end.rowIndex),
    endCol:   Math.max(start.colIndex, end.colIndex),
  }
}

export function resolveCellRange(range: CellRange, cells: CellData[][]): (number | string)[] {
  const values: (number | string)[] = []
  for (let row = range.startRow; row <= range.endRow; row++) {
    for (let col = range.startCol; col <= range.endCol; col++) {
      values.push(cells[row]?.[col]?.raw ?? 0)
    }
  }
  return values
}
```

**Walkthrough:** `parseRange('A1:C3')` splits the string on `:` to produce `['A1', 'C3']`. It parses each address (using `parseCellAddress` from lesson 4) and normalises with `Math.min`/`Math.max` so the range is always stored top-left to bottom-right regardless of which direction the user selected.

`resolveCellRange` iterates the rectangular region with two nested `for` loops — outer over rows, inner over columns — collecting each cell's raw value into a flat array. For a 3×1 range `A1:A3`, the result is `[5, 10, 15]`. That flat array is what formula functions (`SUM`, `AVERAGE`) receive.

**What is `String.prototype.split(separator)`?** Returns an array of substrings by splitting the string at every occurrence of `separator`. `'A1:C3'.split(':')` → `['A1', 'C3']`. `'a,b,c'.split(',')` → `['a', 'b', 'c']`. `split` is the inverse of `Array.prototype.join`.

**Destructuring assignment — `const [startAddress, endAddress] = rangeStr.split(':')`:** `[a, b] = array` assigns `array[0]` to `a` and `array[1]` to `b`. This is JavaScript array destructuring — a shorthand for `const startAddress = parts[0]; const endAddress = parts[1]`.

**What is `Math.min(a, b)` and `Math.max(a, b)`?** Built-in JavaScript functions. `Math.min(3, 1)` returns `1` (the smaller). `Math.max(3, 1)` returns `3` (the larger). We use them to normalise the range: if the user selected from C3 to A1 (right-to-left, bottom-to-top), the start address has a larger index than the end. `Math.min` and `Math.max` ensure `startRow ≤ endRow` and `startCol ≤ endCol` regardless of selection direction.

**The `for...of` loop pattern here is two nested `for` (classic) loops:** `for (let row = start; row <= end; row++)` iterates from `start` to `end` inclusive, incrementing by 1 each step. Classic `for` loops are preferable over `for...of` when you need the current index explicitly and control start/end bounds. `let` declares `row` as a block-scoped variable — its scope is limited to the `for` loop block.

**CS concept — bounding box as a data structure:** A `CellRange` is a two-dimensional bounding box (min row/col, max row/col). The same structure appears in image processing (selection rectangles), CSS layout (element bounds), collision detection (axis-aligned bounding boxes), and geographic information systems (bounding boxes for map regions).

**What breaks if you do not normalise with `Math.min/max`:** A user who selects from C3 to A1 produces `{ startRow: 2, endRow: 0 }`. The loop `for (let row = 2; row <= 0; row++)` has `2 <= 0` which is false immediately — the loop never runs. `resolveCellRange` returns an empty array. `=SUM(PRICES)` returns 0. No error — just silently wrong.

---

### Step 2 — The formula function registry

**The problem:** Named ranges enable range-based formula functions like `SUM` and `AVERAGE`. We need a registry that maps function names to implementations.

```ts
// src/utils/formulaFunctions.ts

export const FORMULA_FUNCTIONS: Record<string, (values: number[]) => number> = {
  SUM:     (values) => values.reduce((total, value) => total + value, 0),
  AVERAGE: (values) => values.reduce((total, value) => total + value, 0) / values.length,
  MAX:     (values) => Math.max(...values),
  MIN:     (values) => Math.min(...values),
  COUNT:   (values) => values.filter(value => !isNaN(value)).length,
}
```

**Walkthrough:** `FORMULA_FUNCTIONS` is a plain JavaScript object mapping function names (strings) to function implementations. `FORMULA_FUNCTIONS['SUM']` returns the `SUM` function. `FORMULA_FUNCTIONS['AVERAGE']` returns the average function. A formula like `=SUM(PRICES)` looks up `'SUM'` in this table and calls the result.

**What is `Record<string, (values: number[]) => number>`?** `Record<K, V>` is a TypeScript utility type for an object where every key has type `K` and every value has type `V`. `Record<string, (values: number[]) => number>` means: every key is a string, every value is a function that accepts `number[]` and returns `number`. TypeScript rejects `FORMULA_FUNCTIONS['SUM'] = 42` (not a function) and `FORMULA_FUNCTIONS['SUM'] = (v) => 'hello'` (wrong return type).

**What is `Array.prototype.reduce(callback, initialValue)`?** Reduces an array to a single value by applying `callback(accumulator, currentValue)` to each element. The accumulator starts as `initialValue`. `[5, 10, 15].reduce((total, v) => total + v, 0)` runs: total=0 + 5 = 5, then 5 + 10 = 15, then 15 + 15 = 30. Result: `30`. `reduce` is the general aggregation operation — `SUM`, `AVERAGE`, `MAX`, and `MIN` are all special cases of reduce.

**What is `Math.max(...values)`?** `Math.max` does not accept an array — it accepts individual arguments: `Math.max(5, 10, 15)` → `15`. The spread operator `...values` expands `[5, 10, 15]` into individual arguments, making `Math.max(...[5, 10, 15])` equivalent to `Math.max(5, 10, 15)`. This works for reasonable array sizes; for very large arrays (tens of thousands of elements), `reduce` is safer (spread can overflow the call stack).

**What is `Array.prototype.filter(predicate)`?** Returns a new array containing only the elements for which `predicate(element)` is `true`. `[1, NaN, 3].filter(value => !isNaN(value))` → `[1, 3]`. `filter` does not mutate the original array; it creates a new one. `COUNT` counts only numeric values — filtering out `NaN` handles empty cells (which contribute `0` raw values, converted to `NaN` by `Number('')`).

**CS concept — dispatch table:** `FORMULA_FUNCTIONS` is a dispatch table — a data structure that maps identifiers to functions. JavaScript lookups in an object are O(1) (hash map access). The alternative — a long `if/else if` chain — is O(n) and must be modified every time a function is added. The dispatch table is the standard pattern for extensible command systems.

**SE principle — open/closed:** Adding `MEDIAN`, `STDEV`, or `PERCENTILE` adds one entry to `FORMULA_FUNCTIONS`. No existing code changes. The formula evaluator, the formula parser, and all existing formulas continue to work unchanged. This is the open/closed principle: open for extension (add entries), closed for modification (don't touch the evaluator).

**What breaks if `FORMULA_FUNCTIONS` is not `const`:** Nothing functional — but convention signals intent. `const` communicates "this object is defined once and not reassigned." Without `const`, future code might do `FORMULA_FUNCTIONS = {}` (replacing the whole table) instead of `FORMULA_FUNCTIONS['NEWFN'] = ...` (adding to it). The lesson 12 plugin system will add functions dynamically — but by creating a merged object, not by mutating this one.

---

### Step 3 — The useNamedRanges composable

**The problem:** We need to store named ranges and provide functions to define, look up, and remove them.

```ts
// src/composables/useNamedRanges.ts
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { NamedRange, CellRange } from '../types/namedRange'

export function useNamedRanges(activeSheetId: Ref<string>) {
  const namedRanges = ref<NamedRange[]>([])

  function defineRange(name: string, range: CellRange) {
    const upperName = name.toUpperCase()
    const existingIndex = namedRanges.value.findIndex(
      r => r.name === upperName && r.sheetId === activeSheetId.value
    )
    const entry: NamedRange = { name: upperName, range, sheetId: activeSheetId.value }
    if (existingIndex >= 0) {
      namedRanges.value[existingIndex] = entry  // update
    } else {
      namedRanges.value.push(entry)             // insert
    }
  }

  function removeRange(name: string) {
    namedRanges.value = namedRanges.value.filter(
      r => !(r.name === name.toUpperCase() && r.sheetId === activeSheetId.value)
    )
  }

  function findRange(name: string): NamedRange | undefined {
    return namedRanges.value.find(
      r => r.name === name.toUpperCase() && r.sheetId === activeSheetId.value
    )
  }

  const activeSheetRanges = computed(() =>
    namedRanges.value.filter(r => r.sheetId === activeSheetId.value)
  )

  return { namedRanges, activeSheetRanges, defineRange, removeRange, findRange }
}
```

**Walkthrough:** `namedRanges` holds all named ranges across all sheets. Each has a `sheetId` so ranges are scoped to their sheet. `defineRange` normalises the name to uppercase (so `PRICES` and `prices` are the same), then either updates the existing entry or inserts a new one. `removeRange` creates a new array excluding the named range. `activeSheetRanges` is a computed that filters to only the current sheet's ranges — used by the UI to list defined names.

**What is `Array.prototype.findIndex(predicate)`?** Like `find`, but returns the **index** of the first matching element instead of the element itself. Returns `-1` if no match is found. `[{name:'PRICES'},{name:'TAX'}].findIndex(r => r.name === 'TAX')` → `1`. We use `findIndex` (not `find`) because we need the position to do an in-place update: `array[index] = newValue`.

**What is `String.prototype.toUpperCase()`?** Returns a new string with all characters converted to uppercase. `'prices'.toUpperCase()` → `'PRICES'`. Non-alphabetic characters are unchanged. We normalise to uppercase so users can type `sum(prices)` and have it match `PRICES`.

**Upsert pattern:** "Update if exists, insert if not." Common in databases. `findIndex` checks if the name exists. If `existingIndex >= 0`, replace at that position. If `-1`, push a new entry. Without the upsert, defining `PRICES` twice would create two entries, and the formula evaluator would find the first one (possibly the old one) instead of the most recent.

**Why `namedRanges.value = namedRanges.value.filter(...)` instead of `splice`?** `filter` creates a new array. Replacing the ref's value with the new array triggers Vue's reactivity: any computed or template reading `namedRanges.value` re-evaluates. Mutation via `splice` would also work (`namedRanges.value.splice(index, 1)`), but replacing the array is more explicit and easier to reason about.

**What breaks if names are not normalised to uppercase:** `=SUM(PRICES)` works after defining `PRICES`. `=SUM(prices)` fails with `#NAME?` — the lookup is case-sensitive by default. Excel and Google Sheets are case-insensitive for named ranges. Users type in all caps or all lowercase; normalising to uppercase means all formats match.

---

### Step 4 — Update the formula evaluator

**The problem:** The evaluator from lesson 4 handles cell references (`A1`). We now need it to handle function calls on ranges (`SUM(A1:C3)`) and named ranges (`SUM(PRICES)`).

```ts
function evaluateFormula(
  formula: string,
  cells: CellData[][],
  findRange: (name: string) => NamedRange | undefined
): number | string {
  let expression = formula.slice(1)

  // Pre-processing step: resolve function calls before cell reference substitution
  expression = expression.replace(
    /([A-Z]+)\(([A-Z_][A-Z0-9_]*|[A-Z]+\d+:[A-Z]+\d+)\)/g,
    (_, funcName, argument) => {
      const fn = FORMULA_FUNCTIONS[funcName]
      if (!fn) return '#NAME?'

      const rawValues = argument.includes(':')
        ? resolveCellRange(parseRange(argument), cells)        // range: A1:C3
        : resolveCellRange(findRange(argument)!.range, cells)  // named: PRICES

      const numbers = rawValues.map(v => Number(v) || 0)
      return String(fn(numbers))
    }
  )

  // Then: lesson 4's cell reference substitution and arithmetic evaluation
  // ...
}
```

**Walkthrough:** Before the lesson 4 cell reference step, we add a new replacement pass. The regex `/([A-Z]+)\(([A-Z_][A-Z0-9_]*|[A-Z]+\d+:[A-Z]+\d+)\)/g` matches patterns like `SUM(PRICES)` or `AVERAGE(A1:B3)`. For each match, the first capture group (`funcName`) is the function name; the second (`argument`) is either a named range identifier or a range address. We resolve the argument to values, apply the function, and substitute the numeric result.

After this step, the expression contains only numbers and arithmetic operators — which the existing lesson 4 evaluator handles unchanged.

**`argument.includes(':')`:** `String.prototype.includes(substring)` returns `true` if the string contains `substring`. `'A1:C3'.includes(':')` → `true`. `'PRICES'.includes(':')` → `false`. We use this to distinguish range notation (`A1:C3`) from a named range identifier (`PRICES`).

**SE principle — open/closed in action:** We extended `evaluateFormula` with a pre-processing step without modifying the lesson 4 cell reference step. The existing logic runs after the new logic, completely unchanged. New capability added; existing capability unmodified.

**What breaks if the function name check `if (!fn)` is missing:** `=TYPO(A1:B1)` looks up `FORMULA_FUNCTIONS['TYPO']` which is `undefined`. Calling `undefined(numbers)` throws `TypeError: undefined is not a function`. The error propagates up, crashes `evaluateFormula`, and the whole grid fails to render. `#NAME?` is the user-visible signal that the function does not exist — not a crashed spreadsheet.

---

## Connect the pieces

Named ranges sit between the formula evaluator and the grid data. They are a vocabulary layer — they give human-readable names to regions of cells, making formulas readable and resilient to layout changes.

**CS concept — symbol table:** A symbol table maps identifiers (names) to locations or values. When JavaScript resolves a variable `x`, it looks it up in the scope chain — a symbol table. When our evaluator resolves `PRICES`, it looks it up in the named range registry — a domain-specific symbol table. You have built a small domain-specific language with its own name resolution mechanism.

**In production:** Excel's Name Manager, Google Sheets' Named Ranges, and SQL's views are all instances of this same pattern. Formula engineers at these companies maintain exactly this architecture: a name registry, a lookup function, and a formula evaluator that pre-resolves names before arithmetic evaluation.

---

## What breaks without this

**If you always pass the cell reference through `new Function` evaluation:** `=SUM(PRICES)` gets to `new Function('return (SUM(PRICES))')()`. `SUM` is not a JavaScript function — this throws `ReferenceError: SUM is not defined`. The pre-processing step that replaces `SUM(PRICES)` with its numeric result (e.g., `30`) before passing to `new Function` is what makes formula functions safe.

---

## Definition of done

- [ ] Define named range `PRICES` covering `A1:A3` with values 5, 10, 15
- [ ] `=SUM(PRICES)` in a cell shows `30`
- [ ] `=AVERAGE(PRICES)` shows `10`; `=MAX(PRICES)` shows `15`
- [ ] Changing A1 to 100 updates the formula cell automatically
- [ ] The NameManager lists the defined range and has a working Remove button
- [ ] Range notation without naming also works: `=SUM(A1:A3)` → `30`
- [ ] **Git commit:**

```
git add src/
git commit -m "Add named ranges and formula functions — human-readable labels, SUM/AVERAGE/MAX/MIN/COUNT"
```
