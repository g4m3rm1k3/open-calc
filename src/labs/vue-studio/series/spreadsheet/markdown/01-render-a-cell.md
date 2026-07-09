# Vue Spreadsheet — Lesson 01 — Render a Grid

## What you will build

A 6×10 grid: column headers `A` through `F` across the top, row numbers `1` through `10` down the left side, and sixty empty, individually addressable cells between them — the visible skeleton every later lesson fills in.

```
    A     B     C     D     E     F
1 |     |     |     |     |     |     |
2 |     |     |     |     |     |     |
3 |     |     |     |     |     |     |
  ...
```

This lesson is entirely about the grid's structure. No interaction. No reactive state. Just sixty cells, generated from two numbers by code that could scale to six hundred without a single extra line of HTML.

---

## What you need to know first

Vue Studio gives you a Monaco editor and a ▶ Run button. Click ▶ Run at any point to see what your code produces in the preview panel on the right. There is no terminal, no install step, no build command — Vue Studio does all of that for you.

If you have completed the Vue Essentials series, you know `ref`, `<script setup>`, `v-for`, and props. Every concept from that series shows up here. The new element today is **why** — why these specific TypeScript types exist, what `interface` does that a plain object doesn't, and why generating sixty cells from a loop is better than writing them by hand even if "writing them by hand" sounds faster.

---

## Step 1 — Run something first

**The problem:** Before building the grid, get oriented. What does a Vue file look like in Vue Studio, and how does ▶ Run connect your code to the preview?

Type this into the editor and click ▶ Run:

```vue
<script setup lang="ts">
const message = 'Spreadsheet project — lesson 01'
const count = 42
</script>

<template>
  <div>
    <h2>{{ message }}</h2>
    <p>The answer is {{ count }}</p>
  </div>
</template>
```

You should see your heading and paragraph appear in the preview. Discard this and move to step 2 — it was just to verify the environment works and remind you how `{{ }}` interpolation connects script-block values to template output.

**What ▶ Run does:** Vue Studio compiles your `.vue` file — it runs the TypeScript compiler, processes the `<script setup>` block, and turns the template into a JavaScript render function — then mounts the resulting component into the preview's DOM. The browser receives compiled, standard JavaScript. You never see the intermediate steps; you only see the rendered output. In a local project, a build tool like Vite does this same work; here, Vue Studio does it for you.

**What `lang="ts"` does:** Without it, `<script setup>` is treated as plain JavaScript — no type checking at all. With `lang="ts"`, the TypeScript compiler checks every line against real type rules and highlights mistakes in the editor before you click ▶ Run. `lang="ts"` is not a Vue Studio feature — it is the same attribute you would write in any Vue 3 project.

---

## Step 2 — Define the coordinate type

**The problem:** The grid has sixty cells. Each cell needs to be addressed by its column and row. Before anything can compute a cell's position, something has to describe what "position" means.

Replace the entire file with:

```vue
<script setup lang="ts">
const COLUMN_COUNT = 6
const ROW_COUNT = 10

interface Coordinate {
  col: number
  row: number
}
</script>

<template>
  <p>Coordinate type defined. Nothing visible yet.</p>
</template>
```

Click ▶ Run. The message appears. Dull output — important foundation.

**Walkthrough — what `interface` actually does:**

`interface Coordinate { col: number; row: number }` does not create an object. It describes the *shape* an object must have to be considered a `Coordinate`. No runtime cost, no runtime object — the TypeScript compiler reads it and uses it to check every place a `Coordinate` is expected.

To understand what this buys you, run this throwaway example instead of the above:

```vue
<script setup lang="ts">
interface Coordinate {
  col: number
  row: number
}

// This is fine — shape matches
const a: Coordinate = { col: 2, row: 4 }

// TypeScript catches these mistakes before ▶ Run:
// const b: Coordinate = { col: 2 }            // missing row
// const c: Coordinate = { col: 'A', row: 1 }  // col should be number, not string
// const d: Coordinate = { column: 2, row: 1 } // wrong field name

console.log(a.col, a.row)
</script>

<template>
  <p>{{ a }}</p>
</template>
```

Uncomment each broken declaration one at a time. Monaco underlines the mistake before you click ▶ Run. TypeScript is not guessing — it is applying the contract `interface Coordinate` stated.

**The CS concept — named shapes.**

Without `interface Coordinate`, you can still write `{ col: 2, row: 4 }`. The problem appears in function signatures. Compare:

```typescript
// Before: what does this function expect?
function doSomething(pos: { col: number; row: number }): string { ... }

// After: the name carries meaning
function doSomething(pos: Coordinate): string { ... }
```

Both enforce the same structure. The named interface version communicates intent — "`pos` is a coordinate" — and allows every function in the project to share that name rather than repeating `{ col: number; row: number }` in every signature.

**Walkthrough — `type CellId = string`:**

Add this line after the interface:

```typescript
type CellId = string
```

`type CellId = string` creates an alias — a second name for an existing type. `CellId` and `string` are completely interchangeable to the TypeScript compiler. No new restrictions. Its value is purely to a *reader*: a function that says `): CellId` communicates "this returns a cell's identifying string" more precisely than `): string`, even though they mean the same thing to the compiler.

This project's convention: `interface` for shapes with multiple fields; `type` for aliases and, starting in lesson 04, unions.

---

## Step 3 — Two pure functions

**The problem:** Knowing a cell is at `{ col: 2, row: 0 }` is useless if nothing can turn that into the string `"C1"` the grid needs for display and identity.

Add to `<script setup>` below the `type CellId = string` line:

```typescript
function columnLetter(col: number): string {
  return String.fromCharCode(65 + col)
}

function cellId(coordinate: Coordinate): CellId {
  return `${columnLetter(coordinate.col)}${coordinate.row + 1}`
}
```

**Before reading the walkthrough, run this to see what they produce:**

```vue
<script setup lang="ts">
interface Coordinate { col: number; row: number }
type CellId = string

function columnLetter(col: number): string {
  return String.fromCharCode(65 + col)
}
function cellId(coordinate: Coordinate): CellId {
  return `${columnLetter(coordinate.col)}${coordinate.row + 1}`
}

// Try it
const examples = [
  columnLetter(0),  // 'A'
  columnLetter(1),  // 'B'
  columnLetter(5),  // 'F'
  cellId({ col: 0, row: 0 }),  // 'A1'
  cellId({ col: 2, row: 3 }),  // 'C4'
  cellId({ col: 5, row: 9 }),  // 'F10'
]
</script>

<template>
  <ul>
    <li v-for="(ex, i) in examples" :key="i">{{ ex }}</li>
  </ul>
</template>
```

Click ▶ Run. You should see: `A`, `B`, `F`, `A1`, `C4`, `F10`. Discard and continue.

**Walkthrough — `String.fromCharCode(65 + col)`:**

Every character in JavaScript has a numeric code. `65` is the code for the capital letter `'A'`. `String.fromCharCode(65)` returns `'A'`. `String.fromCharCode(66)` returns `'B'`. Adding `col` shifts that many positions forward through the alphabet: column `0` → `'A'`, column `1` → `'B'`, column `5` → `'F'`. No hardcoded array of letters. No lookup table. The alphabet's ordering in Unicode encodes what you need.

You can verify this with another throwaway:

```vue
<script setup lang="ts">
// Character codes around 'A'
const codes = [64, 65, 66, 67, 90, 91].map(n => ({
  code: n,
  char: String.fromCharCode(n)
}))
</script>
<template>
  <ul>
    <li v-for="c in codes" :key="c.code">{{ c.code }} → "{{ c.char }}"</li>
  </ul>
</template>
```

`64` is `@`, `65` is `A`, `90` is `Z`, `91` is `[` — the letters sit at consecutive codes between those two boundaries.

**Walkthrough — parameter and return types:**

`function columnLetter(col: number): string` states two contracts:

- `col: number` — TypeScript rejects any call that passes something other than a number. `columnLetter('B')` is caught as a type error before ▶ Run, not discovered as a wrong result at runtime.
- `: string` after the parentheses — the return type. If the function body tried to `return 5` instead, TypeScript catches that error in the function itself, not at the call site.

Return types document intent and catch mistakes at both ends. The function signature is a machine-checked contract.

**Walkthrough — `coordinate.row + 1`:**

Spreadsheet rows are traditionally displayed starting at `1`. This project's internal `row` field, like every array index, starts at `0`. The `+ 1` is the entire translation. Cell at `{ col: 0, row: 0 }` displays as `"A1"`, not `"A0"`. If you ever see a cell with row `0` in the grid, that `+ 1` is missing somewhere.

**Walkthrough — pure functions:**

Both `columnLetter` and `cellId` are **pure functions**: given the same input, they always return the same output. No access to any external state, no random values, no `Date.now()`, no mutation of anything outside themselves. Pure functions are predictable and testable. You can run `cellId({ col: 2, row: 3 })` in your head and know it returns `"C4"` without running the program. Every later lesson calls these functions — their correctness never changes, because their behavior is completely determined by their inputs.

**SE concept — the single-definition rule:**

Every lesson that needs a cell's address calls `cellId()`. Every lesson that needs a column letter calls `columnLetter()`. Define each concept once; use it everywhere. If the grid grows from six columns to twenty-six, `columnLetter` does not change — callers do not change — only `COLUMN_COUNT` changes. This is not an accident. It is what making a function means: the logic lives in one place.

---

## Step 4 — Generate the grid data

**The problem:** The grid needs sixty cells. The template cannot loop over `COLUMN_COUNT` directly — `v-for` needs something iterable: an array.

Add to `<script setup>`, below the two functions:

```typescript
const columns = Array.from({ length: COLUMN_COUNT }, (_, col) => col)
const rows    = Array.from({ length: ROW_COUNT },    (_, row) => row)
```

**Walkthrough — `Array.from({ length: N }, (_, i) => i)`:**

`Array.from(arrayLike, mapFn)` creates an array from anything with a `.length` property, calling `mapFn` for each position. `{ length: 6 }` is the smallest legal array-like — an object that only claims to have six positions, with no actual elements. The map function receives the (unused) current value and the index `i`; returning `i` fills the array with `[0, 1, 2, 3, 4, 5]`.

The `_` naming convention signals "this parameter is required by the function signature but intentionally unused here." TypeScript does not require this — it is a convention that communicates intent to readers.

Run this throwaway to see it clearly:

```vue
<script setup lang="ts">
const columns = Array.from({ length: 6 }, (_, i) => i)
const rows    = Array.from({ length: 4 }, (_, i) => i)

// columns = [0, 1, 2, 3, 4, 5]
// rows    = [0, 1, 2, 3]
</script>
<template>
  <p>columns: {{ columns }}</p>
  <p>rows: {{ rows }}</p>
</template>
```

**Why not just write `[0, 1, 2, 3, 4, 5]`?**

Because `COLUMN_COUNT` controls everything. Change it to `26` and `columns` becomes `[0, 1, ..., 25]` — a full alphabet's worth — without touching anything else. The hardcoded array `[0, 1, 2, 3, 4, 5]` would need manual editing and could silently disagree with `COLUMN_COUNT`.

---

## Step 5 — Render the grid

**The problem:** `columns` and `rows` exist but nothing displays them.

Replace the entire file with:

```vue
<script setup lang="ts">
const COLUMN_COUNT = 6
const ROW_COUNT = 10

interface Coordinate {
  col: number
  row: number
}

type CellId = string

function columnLetter(col: number): string {
  return String.fromCharCode(65 + col)
}

function cellId(coordinate: Coordinate): CellId {
  return `${columnLetter(coordinate.col)}${coordinate.row + 1}`
}

const columns = Array.from({ length: COLUMN_COUNT }, (_, col) => col)
const rows    = Array.from({ length: ROW_COUNT },    (_, row) => row)
</script>

<template>
  <table class="spreadsheet">
    <thead>
      <tr>
        <th></th>
        <th v-for="col in columns" :key="col">{{ columnLetter(col) }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row">
        <th>{{ row + 1 }}</th>
        <td
          v-for="col in columns"
          :key="col"
          :id="'cell-' + cellId({ col, row })"
          class="cell"
        ></td>
      </tr>
    </tbody>
  </table>
</template>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; padding: 1rem; }

.spreadsheet { border-collapse: collapse; }
.spreadsheet th,
.spreadsheet td {
  border: 1px solid #cbd5e1;
  min-width: 90px;
  height: 28px;
  text-align: left;
  padding: 0 6px;
  font-size: 0.875rem;
}
.spreadsheet thead th,
.spreadsheet tbody th {
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  text-align: center;
}
</style>
```

Click ▶ Run. A full grid appears: column letters `A` through `F` along the top, row numbers `1` through `10` down the left, and sixty empty bordered cells.

**Walkthrough — the template structure:**

```html
<thead>
  <tr>
    <th></th>                                         <!-- empty corner cell -->
    <th v-for="col in columns" :key="col">           <!-- A B C D E F -->
      {{ columnLetter(col) }}
    </th>
  </tr>
</thead>
```

The empty `<th></th>` occupies the top-left corner — the intersection of the column-header row and the row-number column. Without it, column `A` would sit above row 1's content rather than above the first data column. One `<th>` placeholder aligns everything.

`v-for="col in columns"` iterates over `[0, 1, 2, 3, 4, 5]`. Each iteration: `col` is one of those numbers; `columnLetter(col)` converts it to the letter.

```html
<tbody>
  <tr v-for="row in rows" :key="row">
    <th>{{ row + 1 }}</th>                            <!-- 1 2 3 ... 10 -->
    <td
      v-for="col in columns"
      :key="col"
      :id="'cell-' + cellId({ col, row })"
      class="cell"
    ></td>
  </tr>
</tbody>
```

The outer `v-for` loops over rows; the inner `v-for` loops over columns inside each row. Each `<td>` gets an `id` computed by `cellId({ col, row })` — so the cell at column 2, row 0 gets `id="cell-C1"`. Every lesson that needs to find a specific cell's DOM element uses that same `cellId()` function to compute the id.

**Walkthrough — `:id="'cell-' + cellId({ col, row })"`:**

`:id` (with the colon) means "evaluate this JavaScript expression and use its value as the `id` attribute." Without the colon, Vue treats the value as a static string: every cell gets the literal string `'cell-' + cellId({ col, row })` as its `id`. The colon is the binding operator — "what follows is code, not text."

**CS concept — declarative vs imperative:**

The HTML Lab lesson builds the same grid imperatively:

```typescript
for (let col = 0; col < COLUMN_COUNT; col++) {
  const headerCell = document.createElement('th')
  headerCell.textContent = columnLetter(col)
  headerRow.appendChild(headerCell)
}
```

Step by step: create an element, set a property, attach it. Six instructions to add one header cell.

Vue's template is declarative:

```html
<th v-for="col in columns" :key="col">{{ columnLetter(col) }}</th>
```

One line says: "for each column, a `<th>` showing `columnLetter(col)`." The how — create element, set content, attach — is Vue's job. You describe what should exist; Vue makes it exist.

Neither is always better. Declarative templates become harder to read when the structure is highly conditional or deeply dynamic. But for rendering lists and grids — generating repeating structure from data — declarative templates are shorter, more readable, and far less prone to the class of bug that imperative DOM code introduces: forgetting to clear old elements before re-adding, appending in the wrong order, losing track of which element is which.

**Walkthrough — `:key`:**

```html
<th v-for="col in columns" :key="col">
```

`:key` tells Vue how to identify each item in a list. When the list changes — an item is added, removed, or reordered — Vue uses the key to decide which existing DOM element corresponds to which new item, and updates only what changed.

Without `:key`, Vue falls back to position: "first item → first element, second item → second element." If item 2 is removed, Vue updates items 2 through 6 in place rather than removing one and keeping five unchanged. For a static grid this makes no observable difference. For a list that changes, missing `:key` causes incorrect updates. The convention: always provide `:key` in `v-for`.

For these columns and rows, the key is the index itself — `col` or `row` — because the indices are unique within their loop and stable: column 0 is always column A.

**Walkthrough — `{ col, row }` inside `v-for`:**

```html
<td :id="'cell-' + cellId({ col, row })">
```

Inside the inner loop, both `row` (from the outer `v-for`) and `col` (from the inner `v-for`) are in scope. Vue's template loops follow the same scoping rules as JavaScript loops: inner scopes have access to variables from outer scopes. `{ col, row }` is standard JavaScript shorthand for `{ col: col, row: row }` — create an object with both values.

**Walkthrough — `id` naming convention:**

Every cell's DOM `id` is `cell-` followed by its spreadsheet address: `cell-A1`, `cell-F10`. This is deliberate. Any code that needs to find a specific cell can compute `'cell-' + cellId(coordinate)` using the same `cellId()` function and pass the result to `document.getElementById()` — no separate lookup table, no stored references to DOM elements, no array of elements to manage. The naming convention turns the DOM's `id` system into a coordinate-indexed registry.

---

## What breaks without this

**Hardcoding `[0, 1, 2, 3, 4, 5]` instead of `Array.from`:** Change `COLUMN_COUNT` to `8`. The header and cell loop now produce eight columns, but `columns` still has six entries. Row cells and header cells disagree. Alignment breaks. The bug is invisible until you look at the grid and count. With `Array.from({ length: COLUMN_COUNT }, ...)`, `COLUMN_COUNT` is the single source of truth.

**Removing `:key` from one of the `v-for` directives:** In development mode, Vue warns: "Elements in iteration expect to have 'v-key' directives." For a static grid the visual output is unchanged. But Vue is telling you that it has lost its ability to efficiently update this list. Add interaction in lesson 02 and you may see incorrect update behavior traced back to missing keys.

**Returning `coordinate.row` instead of `coordinate.row + 1` from `cellId`:** The cell at row 0 gets id `"cell-A0"`. The row header shows `1`. The id and the visible label disagree. This would silently corrupt every feature that navigates by cell id — selection (lesson 02), editing (lesson 03), formula evaluation (lesson 06–08).

**Calling `columnLetter('A')` instead of `columnLetter(0)`:** TypeScript catches `Argument of type 'string' is not assignable to parameter of type 'number'` before ▶ Run. At runtime, `String.fromCharCode(65 + 'A')` produces `String.fromCharCode(NaN)`, which returns the empty string. A type annotation on the parameter is what makes the runtime silent failure into a caught, located error.

---

## Connect the pieces

```
App.vue
  <script setup>
    COLUMN_COUNT, ROW_COUNT  — the two numbers the entire grid derives from
    interface Coordinate     — named shape for a grid position
    type CellId = string     — alias making function signatures readable
    columnLetter()           — pure: number → letter. String.fromCharCode.
    cellId()                 — pure: Coordinate → 'A1' style string
    columns, rows            — arrays of indices; v-for iterates these
  <template>
    <th v-for="col in columns">  — header row
    <tr v-for="row in rows">     — body rows
      <td v-for="col in columns" :id="'cell-' + cellId({ col, row })">
                               — sixty individually addressable cells
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] A 6×10 grid appears with column letters `A`–`F` and row numbers `1`–`10`
- [ ] Each cell's `id` attribute follows the `cell-A1` pattern (verify by right-clicking a cell → Inspect)
- [ ] Changing `COLUMN_COUNT = 6` to `COLUMN_COUNT = 8` adds two columns without any other change
- [ ] You can explain why `interface Coordinate` does not create an object at runtime
- [ ] You can explain the difference between `:id="..."` and `id="..."`
- [ ] You can explain why `coordinate.row + 1` appears in `cellId` but not in `v-for`'s `:key`
- [ ] You can explain what `String.fromCharCode(65 + col)` computes and why 65

---

*Next: Lesson 02 — Selecting a Cell. Click any cell and it highlights — the first piece of state this project tracks, the first time a value is deliberately allowed to be "nothing at all," and the first encounter with type narrowing.*
