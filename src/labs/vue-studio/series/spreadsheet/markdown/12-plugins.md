# Vue Spreadsheet — Lesson 12 — Extracting Components

## What you will build

The single `App.vue` file is split into three focused components: `SpreadsheetGrid.vue`, `CellDisplay.vue`, and `FormulaBar.vue`. All three share the same reactive state — `cells`, `selectedCoordinate`, `editingCoordinate` — through `provide`/`inject`. The spreadsheet looks and behaves identically. The code is now three files with distinct responsibilities.

```
App.vue
  provides: cells, selectedCoordinate, editingCoordinate, actions
  └── FormulaBar.vue  — shows and edits the selected cell's raw content
  └── SpreadsheetGrid.vue
        └── CellDisplay.vue (×60)  — per-cell rendering
```

---

## What you need to know first

`provide`/`inject` from the Essentials series (lesson 11): a root component provides data; any descendant injects it without prop chains. `InjectionKey<T>` from Vue gives the injected value its TypeScript type.

This lesson does not change any behavior. It restructures existing code into components.

---

## Step 1 — Define the injection key

**The problem:** `provide` and `inject` work with string keys, but string keys lose their TypeScript types. `InjectionKey<T>` fixes this.

In `App.vue`, add to `<script setup>`:

```typescript
import { provide } from 'vue'
import type { InjectionKey } from 'vue'

interface SpreadsheetContext {
  cells: Ref<Record<CellId, Cell>>
  selectedCoordinate: Ref<Coordinate | null>
  editingCoordinate: Ref<Coordinate | null>
  displayValues: ComputedRef<Record<CellId, string>>
  selectCell: (coord: Coordinate) => void
  startEditing: (coord: Coordinate) => void
  commitEdit: (coord: Coordinate, value: string) => void
  isCellSelected: (col: number, row: number) => boolean
  isEditing: (col: number, row: number) => boolean
  editableText: (cell: Cell | undefined) => string
  columns: number[]
  rows: number[]
  columnLetter: (col: number) => string
  cellId: (coord: Coordinate) => CellId
}

export const SPREADSHEET_KEY: InjectionKey<SpreadsheetContext> = Symbol('spreadsheet')
```

Import `Ref` and `ComputedRef` from `'vue'` at the top of the script.

**Walkthrough — `InjectionKey<T>`:**

`InjectionKey<T>` is a `Symbol` branded with a type. When you call `inject(SPREADSHEET_KEY)`, TypeScript knows the return type is `SpreadsheetContext | undefined` — not `unknown`. Without the typed key, `inject` returns `unknown` and every value you inject needs manual type assertions.

The `Symbol('spreadsheet')` label is only for debugging — `Symbol.description` returns it. Two calls to `Symbol('spreadsheet')` produce different keys; the label does not make them the same.

---

## Step 2 — Provide from `App.vue`

At the bottom of `App.vue`'s `<script setup>`, after all the functions and state are defined:

```typescript
provide(SPREADSHEET_KEY, {
  cells,
  selectedCoordinate,
  editingCoordinate,
  displayValues,
  selectCell,
  startEditing,
  commitEdit,
  isCellSelected,
  isEditing,
  editableText,
  columns,
  rows,
  columnLetter,
  cellId,
})
```

Simplify `App.vue`'s template to just mount the child components:

```html
<template>
  <FormulaBar />
  <SpreadsheetGrid />
  <div v-if="debugInfo !== null" class="debug-panel">
    <!-- debug panel stays in App.vue for now -->
    ...
  </div>
  <div class="status-bar">
    <button @click="undo" :disabled="history.length === 0">↩ Undo ({{ history.length }})</button>
    <button @click="redo" :disabled="redoStack.length === 0">Redo ({{ redoStack.length }}) ↪</button>
  </div>
</template>
```

Import `FormulaBar` and `SpreadsheetGrid` at the top of `<script setup>`:

```typescript
import FormulaBar from './FormulaBar.vue'
import SpreadsheetGrid from './SpreadsheetGrid.vue'
```

---

## Step 3 — `useSpreadsheet` composable

**The problem:** Every child component needs to call `inject(SPREADSHEET_KEY)` and guard the result. A composable handles this once.

Create `src/composables/useSpreadsheet.ts`:

```typescript
import { inject } from 'vue'
import { SPREADSHEET_KEY } from '../App.vue'

export function useSpreadsheet() {
  const ctx = inject(SPREADSHEET_KEY)
  if (!ctx) {
    throw new Error(
      'useSpreadsheet() must be called inside a component that is a descendant of App.vue'
    )
  }
  return ctx
}
```

This matches the `useTheme` / `provideTheme` pattern from Essentials lesson 11. The guard (`if (!ctx) throw`) turns a confusing runtime error about undefined properties into a precise message naming the mistake.

---

## Step 4 — `FormulaBar.vue`

A formula bar shows the selected cell's address and its editable content (the formula, not the evaluated value).

Create `src/components/FormulaBar.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useSpreadsheet } from '../composables/useSpreadsheet.ts'

const {
  selectedCoordinate,
  cells,
  editableText,
  cellId,
  columnLetter,
  commitEdit,
} = useSpreadsheet()

const selectedAddress = computed(() => {
  const sel = selectedCoordinate.value
  if (sel === null) return ''
  return `${columnLetter(sel.col)}${sel.row + 1}`
})

const formulaBarValue = computed(() => {
  const sel = selectedCoordinate.value
  if (sel === null) return ''
  return editableText(cells.value[cellId(sel)])
})

function onFormulaBarCommit(event: Event) {
  const sel = selectedCoordinate.value
  if (!sel) return
  const input = event.target as HTMLInputElement
  commitEdit(sel, input.value)
}
</script>

<template>
  <div class="formula-bar">
    <span class="cell-address">{{ selectedAddress }}</span>
    <input
      class="formula-input"
      :value="formulaBarValue"
      @change="onFormulaBarCommit"
      placeholder="Select a cell"
      :disabled="selectedCoordinate === null"
    />
  </div>
</template>

<style scoped>
.formula-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  height: 28px;
}
.cell-address {
  min-width: 50px;
  font-weight: 600;
  font-size: 0.8rem;
  color: #64748b;
  text-align: center;
  border: 1px solid #e2e8f0;
  padding: 2px 6px;
  border-radius: 3px;
}
.formula-input {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 3px;
  padding: 0 6px;
  font-size: 0.875rem;
  height: 100%;
  font-family: monospace;
}
.formula-input:focus {
  outline: 2px solid #2563eb;
  outline-offset: -1px;
}
</style>
```

**Walkthrough — `computed` for derived display values in a child component:**

`selectedAddress` and `formulaBarValue` are computed from injected reactive state. They update automatically when `selectedCoordinate.value` or `cells.value` changes — exactly as if they were defined in `App.vue`. The injected refs are live references; computing from them works identically across component boundaries.

---

## Step 5 — `SpreadsheetGrid.vue` and `CellDisplay.vue`

Create `src/components/SpreadsheetGrid.vue`:

```vue
<script setup lang="ts">
import { useSpreadsheet } from '../composables/useSpreadsheet.ts'
import CellDisplay from './CellDisplay.vue'

const { columns, rows, columnLetter, cellId, selectCell, startEditing } = useSpreadsheet()
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
          @click="selectCell({ col, row })"
          @dblclick="startEditing({ col, row })"
        >
          <CellDisplay :col="col" :row="row" />
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

Create `src/components/CellDisplay.vue`:

```vue
<script setup lang="ts">
import { useSpreadsheet } from '../composables/useSpreadsheet.ts'

const props = defineProps<{ col: number; row: number }>()

const {
  cells,
  displayValues,
  editableText,
  isCellSelected,
  isEditing,
  commitEdit,
  cellId,
} = useSpreadsheet()
</script>

<template>
  <template v-if="isEditing(props.col, props.row)">
    <input
      class="cell-input"
      :value="editableText(cells[cellId({ col: props.col, row: props.row })])"
      @keydown.enter.stop="commitEdit(
        { col: props.col, row: props.row },
        ($event.target as HTMLInputElement).value
      )"
      @blur="commitEdit(
        { col: props.col, row: props.row },
        ($event.target as HTMLInputElement).value
      )"
      :ref="(el) => { if (el) (el as HTMLInputElement).focus() }"
    />
  </template>
  <template v-else>
    {{ displayValues[cellId({ col: props.col, row: props.row })] ?? '' }}
  </template>
</template>
```

Note: `CellDisplay` receives `col` and `row` as props from `SpreadsheetGrid`. All reactive state comes from `useSpreadsheet`. The `<td>` click handlers stay in `SpreadsheetGrid` — `CellDisplay` only handles rendering and edit-mode input.

---

## Walkthrough — data flow after extraction

Before extraction: `App.vue` owned everything. Template expressions read reactive state directly.

After extraction:

```
App.vue
  - owns cells, selectedCoordinate, editingCoordinate, history
  - provides SpreadsheetContext via provide(SPREADSHEET_KEY, ctx)
  - mounts FormulaBar and SpreadsheetGrid

SpreadsheetGrid.vue
  - injects SpreadsheetContext via useSpreadsheet()
  - renders the table shell and passes col/row to CellDisplay

CellDisplay.vue
  - injects SpreadsheetContext via useSpreadsheet()
  - receives col/row as props
  - renders either input or display text

FormulaBar.vue
  - injects SpreadsheetContext via useSpreadsheet()
  - derives selectedAddress and formulaBarValue from injected refs
```

Reactive updates still work: when `cells.value` changes in `App.vue`, `displayValues` (a computed derived from `cells`) invalidates, and every `CellDisplay` that reads `displayValues` re-renders. The reactivity system does not care that the reads happen in a different component from the writes.

**SE concept — separation of concerns:**

Each component has one clear responsibility:

- `App.vue`: own state, provide context, handle keyboard shortcuts, undo/redo
- `FormulaBar.vue`: display and edit the selected cell's formula
- `SpreadsheetGrid.vue`: render the table structure, dispatch click/dblclick to state
- `CellDisplay.vue`: render one cell — either its display value or an edit input

Adding a new feature (column resizing, cell formatting, conditional coloring) now has a clear home. If it is grid structure, it goes in `SpreadsheetGrid`. If it is per-cell rendering, it goes in `CellDisplay`. If it is app-wide state, it stays in `App.vue`.

---

## What breaks without this

**Calling `useSpreadsheet()` in a component that is not a descendant of `App.vue`:**

`inject(SPREADSHEET_KEY)` returns `undefined`. The `if (!ctx) throw` guard throws immediately: "useSpreadsheet() must be called inside a component that is a descendant of App.vue." Without the guard, the first access to `ctx.cells` throws "Cannot read properties of undefined" — a confusing error pointing at the wrong line.

**Passing `cells` to `provide` without wrapping it in the context object:**

You could provide each value separately. But `provide` / `inject` require one key per value. With eight separate keys, every new value requires both a new `provide` call in `App.vue` and a new `inject` call in every child. The context object approach bundles all related values under one key — one `provide`, one `inject`, one typed interface.

---

## Connect the pieces

```
App.vue
  provides SPREADSHEET_KEY → SpreadsheetContext (all state + actions)
  mounts FormulaBar, SpreadsheetGrid

useSpreadsheet.ts
  inject(SPREADSHEET_KEY) with guard → SpreadsheetContext

FormulaBar.vue
  useSpreadsheet() → renders cell address + formula input

SpreadsheetGrid.vue
  useSpreadsheet() → renders table; mounts CellDisplay per cell

CellDisplay.vue
  useSpreadsheet() + props { col, row } → renders cell content
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] The formula bar shows the selected cell's address and raw content
- [ ] Editing in the formula bar commits the value to the cell
- [ ] Cell selection, editing, and display all work identically to the single-file version
- [ ] Undo/redo still works
- [ ] You can explain how `InjectionKey<T>` gives injected values their types
- [ ] You can explain the data flow: where state lives, how it reaches each component, and why reactive updates still propagate across component boundaries
- [ ] You can identify which component is the right home for each type of new feature
