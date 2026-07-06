# Render a Grid

## What you will build

A 3×3 grid of cells driven by reactive data. The data — a 2D array of numbers — lives in `App.vue`. The grid decomposes into three components: `Grid`, `Row`, and `Cell` (from lesson 1).

```
┌──────┬──────┬──────┐
│   5  │  10  │  15  │
├──────┼──────┼──────┤
│  20  │  25  │  30  │
├──────┼──────┼──────┤
│  35  │  40  │  45  │
└──────┴──────┴──────┘
```

Change the data — the grid updates. Adding a fourth row to `gridData` causes a fourth row to appear without touching the template.

---

## What you need to know first

Lesson 1 built `Cell.vue`, `App.vue`, and `main.ts`. `Cell.vue` is unchanged this lesson — we build above it.

We introduce `ref` (reactive state), `v-for` (rendering arrays), and `:key` (efficient list updates). All three are explained at the moment they appear.

---

## The lesson

### The problem

One cell is not a spreadsheet. A spreadsheet is a grid — rows of cells. The naive approach: copy `<Cell />` nine times in `App.vue`. This works for exactly nine cells but breaks the moment the grid grows. When lesson 7 adds rows dynamically, hand-written markup cannot respond.

The rule: if the number of something is determined by data, render it with `v-for`. The grid must be driven by data.

---

### Step 1 — The data model

**The problem:** We need to store the grid's values somewhere the template can react to. A plain JavaScript array will not work — Vue does not know when plain arrays change. We need a reactive container.

```ts
// In App.vue <script setup>
import { ref } from 'vue'

const gridData = ref([
  [5,  10, 15],
  [20, 25, 30],
  [35, 40, 45],
])
```

**Walkthrough:** `import { ref } from 'vue'` extracts `ref` from the `vue` package. `ref([...])` wraps the 2D array in a reactive container and returns a `Ref<number[][]>` object with one important property: `.value`. Reading `gridData.value` in script returns the array. Setting `gridData.value = newArray` tells Vue the data changed and triggers a re-render of everything that reads it. In templates, Vue automatically unwraps refs — you write `gridData`, not `gridData.value`.

**What is `import { ref } from 'vue'`?**

- The `vue` package is Vue 3's entire framework — reactivity system, component engine, template compiler, public API. Its single responsibility: provide the tools to build reactive user interfaces.
- `ref` is one specific named export — the function that creates a reactive container for a single value.
- We import `ref` specifically (not `reactive`) because `ref` works with any type including arrays and primitives. `reactive()` only wraps plain objects and cannot wrap primitive values like strings or numbers.

**What `ref()` does:** Accepts an initial value of any type. Returns a `Ref<T>` object — a reactive box. Reading `.value` in any reactive context (template, `computed`, `watch`) registers a dependency. Setting `.value` notifies all registered dependents and schedules a re-render. This is Vue's core reactivity primitive.

**What breaks without `ref`:** A plain `const gridData = [[5,10,15],...]` works for the initial render — Vue reads the array during the first paint. But when lesson 3 edits a cell by mutating `gridData[0][0]`, Vue has no idea the value changed. The screen stays frozen at the original values. No error is thrown — the bug is silent, which makes it harder to find than a crash.

**CS concept — the Observer pattern:** `ref` implements Observer. The `Ref` object is the observable (or "subject"). Every template or computed that reads `.value` subscribes. When `.value` is set, the Ref notifies subscribers and Vue schedules a re-render. Vue's reactivity uses JavaScript Proxies internally — every property access on a reactive object is intercepted. This is the same pattern used by MobX, Svelte stores, and Kotlin's `StateFlow`.

**SE principle — single source of truth:** `gridData` is the one authoritative record of what the grid contains. Templates read from it; future lessons write to it. There is no second copy. When two views of the same data can diverge, bugs become inevitable. One source of truth prevents divergence by design.

---

### Step 2 — The Row component

**The problem:** The grid renders rows of cells. We could render all cells directly in `Grid.vue`, but that mixes two concerns: "how rows are laid out vertically" and "how cells are laid out horizontally within a row." We separate them.

```vue
<!-- src/components/Row.vue -->
<script setup lang="ts">
import Cell from './Cell.vue'

defineProps<{
  cells: (number | string)[]
}>()
</script>

<template>
  <div class="row">
    <Cell
      v-for="(cellValue, columnIndex) in cells"
      :key="columnIndex"
      :value="cellValue"
    />
  </div>
</template>

<style scoped>
.row {
  display: flex;
}
</style>
```

**Walkthrough:**

- `import Cell from './Cell.vue'` — `Cell.vue` from lesson 1. `./Cell.vue` resolves relative to `Row.vue`'s location inside `src/components/`. Vite compiled `Cell.vue` on startup; this import reuses the cached result.
- `defineProps<{ cells: (number | string)[] }>()` — one prop: `cells`, an array of cell values. `Row` does not know how many cells the array contains — that is determined by `Grid`'s caller.
- `v-for="(cellValue, columnIndex) in cells"` — Vue renders one `<Cell />` for each item in `cells`. On each iteration `cellValue` holds the current item and `columnIndex` holds its 0-based position.
- `:key="columnIndex"` — provides a stable identity for each rendered element (explained below).
- `:value="cellValue"` — passes the current value to `Cell` as a prop (the prop we defined in lesson 1).

**What is `import Cell from './Cell.vue'`?**

- `Cell.vue` is responsible for rendering exactly one spreadsheet cell — the boundary drawn in lesson 1.
- Default import (no curly braces) because SFCs export their component object as the default export.
- We do not import `Cell` into `Grid.vue` — `Grid` does not know what a cell looks like internally. Dependencies flow one level at a time.

**The prop type `(number | string)[]`:** An array where every element is either a number or a string. The parentheses around `number | string` are required — without them, `number | string[]` would mean "either a number, or an array of strings," which is a completely different type.

**What is `v-for`?** A Vue directive that repeats an element once for each item in an iterable. The syntax `v-for="(item, index) in array"` makes `item` (the value) and `index` (the position, 0-based) available inside the element. Vue renders one copy of the element and all its children for each iteration. The `in` keyword separates the iteration variable from the source.

**What is `:key`?** When Vue re-renders a `v-for` list after data changes, it must decide which DOM elements correspond to which data items. Without `:key`, Vue re-renders the entire list even if only one item changed — it cannot tell which old DOM node maps to which new data item. With `:key`, Vue tracks each element by its key, updates only the changed elements, and preserves internal state (like an active input) for unchanged ones. We use `columnIndex` for now. In later lessons we will use a stable cell ID — column indices shift when columns are inserted.

**`display: flex`:** Makes `.row` a flex container. Flex containers arrange children along a row axis by default. Without it, `<Cell />` elements (rendered as `<div>`) would stack vertically (block layout). The result would be nine cells in a single column, not a 3-across row.

**What breaks without `:key`:** Static data — nothing visible. Dynamic data (lesson 3 onwards) — Vue cannot efficiently update individual cells. When `gridData.value[0][0]` changes, Vue re-renders the entire row instead of the one cell, causing a flash. If cells carry internal component state (lesson 3's editing state), unkeyed re-renders can corrupt that state by swapping the wrong element.

**CS concept — decomposition:** `Row` does not know how many rows exist. `Cell` does not know it is in a row. Each component solves the smallest possible problem. This is the same principle that keeps functions short and testable: divide the problem, conquer each piece independently.

**SE principle — single responsibility:** `Row.vue` has one job: render one horizontal row of cells. It does not manage the grid or know its own row index. One reason to change: if cells within a row need a row header added, that change lives entirely in `Row.vue`.

---

### Step 3 — The Grid component

**The problem:** Something must render the rows. `Row` renders cells within a row; `Grid` renders rows within the grid — the same decomposition principle, one level up.

```vue
<!-- src/components/Grid.vue -->
<script setup lang="ts">
import Row from './Row.vue'

defineProps<{
  rows: (number | string)[][]
}>()
</script>

<template>
  <div class="grid">
    <Row
      v-for="(rowCells, rowIndex) in rows"
      :key="rowIndex"
      :cells="rowCells"
    />
  </div>
</template>

<style scoped>
.grid {
  display: inline-flex;
  flex-direction: column;
  border-top: 1px solid #cbd5e1;
  border-left: 1px solid #cbd5e1;
}
</style>
```

**Walkthrough:**

- `defineProps<{ rows: (number | string)[][] }>()` — accepts `rows`, a 2D array. `[][]` means "array of arrays."
- `v-for="(rowCells, rowIndex) in rows"` — iterates the outer array. Each `rowCells` is an inner array of cell values; it is passed to `<Row :cells="rowCells" />`.
- The border strategy: `Grid` has `border-top` and `border-left`. Each `Cell` already has a full 1px border. The combination creates clean grid lines: cells' bottom and right borders form the internal grid lines; `Grid`'s top and left borders close the top-left corner without doubling any border.

**What is `import Row from './Row.vue'`?**

- `Row.vue` is responsible for rendering one horizontal row of cells.
- Default import — same pattern as `Cell` in lesson 1.
- `Grid` does not import `Cell`. `Grid` knows about `Row`; `Row` knows about `Cell`. Each layer imports only the layer directly below it. This is loose coupling — `Grid` can be replaced without affecting `Cell`.

**The type `(number | string)[][]`:** A 2D array. The outer `[]` is the grid (array of rows). The inner `[]` is each row (array of cell values). TypeScript rejects passing a 1D array or an array of objects — it enforces the matrix shape at compile time.

**`flex-direction: column`:** Flex containers default to `row` direction (children side by side). `column` stacks children vertically, so each `<Row />` appears below the previous one.

**What breaks without `flex-direction: column`:** All `Row` elements appear side by side horizontally. The 3×3 grid renders as three wide horizontal strips stacked left-to-right rather than top-to-bottom — a very confused layout with no visible fix because it looks like a CSS problem rather than an architecture problem.

**What breaks without the border strategy:** Remove `border-top: 1px solid` and `border-left: 1px solid` from `.grid`. The top and left edges of the first row and first column are unbounded — the grid looks open on two sides. It is a cosmetic bug but one that appears in every lesson until it is fixed.

**CS concept — hierarchical composition:** App → Grid → Row → Cell. Each layer has its own job and is ignorant of layers above it. This pattern appears in operating systems (process → thread → instruction), in HTML (document → section → element), and in every major UI framework. Hierarchical composition is the universal technique for managing UI complexity.

**SE principle — dependency direction:** `Grid` imports `Row`; `Row` imports `Cell`; `Cell` imports nothing. Dependencies flow downward only. `Cell` has no knowledge of `Row` or `Grid` — it can be tested in isolation, reused in any other context, and replaced without touching `Grid`.

---

### Step 4 — Wire it together in App.vue

**The problem:** `App.vue` owns the data and must connect it to `Grid`. `Grid` does not own data — it displays data given to it via props.

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import Grid from './components/Grid.vue'

const gridData = ref([
  [5,  10, 15],
  [20, 25, 30],
  [35, 40, 45],
])
</script>

<template>
  <div class="spreadsheet">
    <Grid :rows="gridData" />
  </div>
</template>

<style scoped>
.spreadsheet {
  padding: 24px;
  font-family: system-ui, sans-serif;
}
</style>
```

**Walkthrough:** `App.vue` no longer imports `Cell` directly — it imports `Grid` and passes the full 2D array. In the template, `:rows="gridData"` passes the reactive array. Vue auto-unwraps the `Ref` — `Grid` receives the raw array, not the Ref wrapper. `Grid` passes each inner array to `Row` as `cells`. `Row` passes each value to `Cell`. `App.vue` knows nothing about cells or rows internally — only about `Grid`.

**Verify reactivity:** Add a fourth row to `gridData`:

```ts
const gridData = ref([
  [5,  10, 15],
  [20, 25, 30],
  [35, 40, 45],
  [50, 55, 60],  // add this
])
```

Save. Vite hot-reloads. A fourth row appears. Remove it. The 3×3 grid returns. The template did not change — the grid responds to data.

**What breaks without `ref`:** As established in step 1, plain array → silent render freeze in lesson 3. Adding `ref` now costs nothing and prevents a subtle bug later.

**CS concept — data-driven rendering:** The grid is a pure function of `gridData`. Same data → same UI. Different data → different UI. This is the core idea of reactive frameworks. The mental model shifts from "imperatively update the DOM when data changes" to "declaratively describe what the UI looks like given the current data; the framework handles the DOM."

**SE principle — props down, events up:** Data flows downward via props: `App → Grid → Row → Cell`. User actions (lesson 3) flow upward via emits: `Cell → Row → Grid → App`. This one-way data flow is a deliberate constraint. When data can flow freely in both directions, tracing where a value was changed becomes guesswork. Enforced one-way flow makes data changes traceable to a single source.

---

## Connect the pieces

`Cell.vue` from lesson 1 is unchanged. We built `Row.vue` and `Grid.vue` above it — new layers in the component tree. `gridData` in `App.vue` is the single source of truth for what the grid contains.

In lesson 3, user input writes to `gridData`. Because `gridData` is a `ref`, every component that reads it re-renders automatically. The architecture built here — reactive data at the root, display-only components below — is what makes lessons 3 through 12 work without rewriting anything from lessons 1 or 2.

**In production:** This component hierarchy (a data-owning "container" component with display-only "presentational" children) is standard Vue architecture used at every company building Vue applications. React's documentation calls it "container/presentational components" — the same pattern, different syntax.

---

## What breaks without this

**If you skip `ref` and use a plain array:** The grid renders correctly on first load. Lesson 3's editing code mutates `cells[row][col].raw = newValue`. Vue detects no change. The cell shows the old value. There is no error message — which is the hardest kind of bug because the code appears correct and the only symptom is "the screen didn't update."

---

## Definition of done

- [ ] The browser shows a 3×3 grid with visible borders
- [ ] The grid displays 5, 10, 15, 20, 25, 30, 35, 40, 45
- [ ] Adding a fourth row to `gridData` causes a fourth row to appear without touching the template
- [ ] Removing the added row restores the 3×3 grid immediately
- [ ] No console errors
- [ ] **Git commit:**

```
git add src/
git commit -m "Add Grid and Row components — grid renders from reactive data (App → Grid → Row → Cell)"
```
