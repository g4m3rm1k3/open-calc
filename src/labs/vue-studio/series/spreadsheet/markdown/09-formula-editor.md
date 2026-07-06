# Formula Editor

## What you will build

A formula bar — a single-line input above the grid that shows the raw content of the selected cell and lets you edit it. This matches the formula bar in Excel and Google Sheets.

```
[ B2 ▾ ]  [ =A1+B1                    ]   ← formula bar
┌──────┬──────┬──────┐
│  5   │  10  │  15  │   ← cells still show computed results
└──────┴──────┴──────┘
```

When a formula cell is selected, the grid cell shows `15` (the result) but the formula bar shows `=A1+B1` (the formula). Editing in the bar and pressing Enter updates the cell.

---

## What you need to know first

In lesson 3 we added in-cell editing (double-click to open an input inside the cell). The formula bar is a second editing surface for the same data — it calls the same `updateCellValue` function from lesson 3. The technical challenge is preventing a reactive loop: the bar reads from the cell, the cell reads from the bar, which reads from the cell...

---

## The lesson

### The problem

When a formula cell is selected, we want two things simultaneously:
1. The grid cell shows the computed result (`15`)
2. The formula bar shows the raw formula (`=A1+B1`)

While the user is typing in the formula bar, we must not update the cell data on every keystroke — that would cause `displayData` to recompute (triggering formula evaluation) on each character, making the grid flicker with partial formulas.

---

### Step 1 — The `useFormulaBar` composable

**The problem:** We need a local editing state that is isolated from the cell data while typing, but syncs with it when the selected cell changes (and is not being edited).

```ts
// src/composables/useFormulaBar.ts
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { CellData } from '../types/cell'

export function useFormulaBar(
  selectedCell: Ref<{ row: number; col: number } | null>,
  cells: Ref<CellData[][]>
) {
  const formulaBarValue = ref('')
  const isEditingFormula = ref(false)

  watch(
    [selectedCell, cells],
    () => {
      if (isEditingFormula.value) return  // do not overwrite while user is typing
      if (!selectedCell.value) {
        formulaBarValue.value = ''
        return
      }
      const { row, col } = selectedCell.value
      const cell = cells.value[row]?.[col]
      formulaBarValue.value = cell ? String(cell.raw) : ''
    },
    { immediate: true }
  )

  function beginEditing() {
    isEditingFormula.value = true
  }

  function commitFormula(updateCell: (row: number, col: number, value: string) => void) {
    if (!selectedCell.value) return
    const { row, col } = selectedCell.value
    updateCell(row, col, formulaBarValue.value)
    isEditingFormula.value = false
  }

  function cancelEdit() {
    isEditingFormula.value = false
    // Re-sync from cells (the watch will fire but isEditingFormula is now false)
    if (!selectedCell.value) return
    const { row, col } = selectedCell.value
    formulaBarValue.value = String(cells.value[row]?.[col]?.raw ?? '')
  }

  return { formulaBarValue, isEditingFormula, beginEditing, commitFormula, cancelEdit }
}
```

**Walkthrough:** `formulaBarValue` holds the text in the bar. `isEditingFormula` is a guard flag. The `watch` runs whenever `selectedCell` or `cells` changes — but only if `isEditingFormula` is `false`. When the user is typing, the watch fires but `return`s immediately, leaving `formulaBarValue` unchanged.

When `commitFormula` runs, it calls `updateCell` (which mutates `cells`), then sets `isEditingFormula = false`. The watch fires again (because `cells` changed), reads the committed value from `cells`, and sets `formulaBarValue` — which now matches what was committed, so nothing visual changes.

**`watch` with array source and options — `watch([selectedCell, cells], fn, { immediate: true })`:** `watch` accepts an array of reactive sources — it runs the callback when any source changes. `{ immediate: true }` runs the callback once synchronously on setup (before the first render), so the formula bar is populated immediately when the composable is created. Without `immediate`, the bar would show empty on the first load even when a cell is already selected.

**Why `{ immediate: true }` instead of calling the callback manually?** Because the callback reads reactive values (`selectedCell.value`, `cells.value`) — if called manually, those reads would not be tracked as dependencies of the `watch`. The `watch` callback runs inside a reactive effect context that tracks dependencies. A manual call does not.

**CS concept — loop prevention via flag:** Two reactive systems observing each other create a cycle. The `isEditingFormula` flag breaks the cycle: the watch does not overwrite the formula bar during editing; the formula bar does not trigger the watch during editing (it does trigger it — but the guard stops it). This is the standard technique for breaking reactive feedback loops. The same pattern appears in React state management (batching updates to prevent cascade) and in spreadsheet dependency graph cycle detection (lesson 10).

**SE principle — controlled component pattern:** `formulaBarValue` during editing is owned by the formula bar composable — it is not derived from cell data. On commit, ownership transfers back to the cell data (`updateCell` writes it; the watch reads it back). Before commit, the formula bar is the source of truth for what is being typed. This matches React's controlled input pattern.

**What breaks if `{ immediate: false }` (the default):** The formula bar initialises to `''`. The selected cell (if any) does not populate the bar until the user switches cells or edits — a jarring UX where the bar appears empty on first load even when a cell is selected.

---

### Step 2 — The `FormulaBar` component

**The problem:** A component that shows the cell address and a text input for the formula, emitting events for focus, change, commit, and cancel.

```vue
<!-- src/components/FormulaBar.vue -->
<script setup lang="ts">
defineProps<{
  formulaBarValue: string
  isEditingFormula: boolean
  selectedAddress: string | null
}>()

const emit = defineEmits<{
  'update:formulaBarValue': [value: string]
  beginEditing: []
  commit: []
  cancel: []
}>()
</script>

<template>
  <div class="formula-bar">
    <div class="address-box">{{ selectedAddress ?? '—' }}</div>
    <div class="divider" />
    <input
      class="formula-input"
      :class="{ editing: isEditingFormula }"
      :value="formulaBarValue"
      @focus="emit('beginEditing')"
      @input="emit('update:formulaBarValue', ($event.target as HTMLInputElement).value)"
      @keydown.enter.prevent="emit('commit')"
      @keydown.escape="emit('cancel')"
      @blur="emit('commit')"
      :placeholder="selectedAddress ? 'Enter value or formula' : 'Select a cell'"
    />
  </div>
</template>

<style scoped>
.formula-bar { display: flex; align-items: center; padding: 4px 8px; border-bottom: 1px solid #e2e8f0; gap: 8px; }
.address-box { width: 60px; font-size: 13px; font-weight: 600; color: #41b883; text-align: center; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px; }
.formula-input { flex: 1; border: none; outline: none; font-size: 14px; font-family: monospace; }
.formula-input.editing { outline: 1px solid #41b883; border-radius: 2px; }
</style>
```

**Walkthrough:** The input uses `:value` + `@input` instead of `v-model` because we need to intercept focus separately (`@focus="emit('beginEditing')`). With `v-model`, we would not have a clean way to emit the focus event. The trade-off: more verbose but more control.

**`emit('update:formulaBarValue', ($event.target as HTMLInputElement).value)`:** `$event` is the native DOM input event. `$event.target` is the element that received the event — the `<input>`. `as HTMLInputElement` is a TypeScript type assertion: "I know this is an HTMLInputElement." TypeScript treats `$event.target` as `EventTarget` (the most general type), which does not have a `.value` property. The assertion tells TypeScript it is safe to access `.value`.

**What is `emit('update:formulaBarValue', value)`?** This is Vue's `v-model` convention for components. When a component emits `'update:propName'`, a parent can bind it with `v-model:propName="reactiveVar"` — the parent receives the emitted value and assigns it to the reactive variable. In `App.vue`, `v-model:formulaBarValue="formulaBarValue"` automatically wires the two-way binding.

**`@keydown.enter.prevent`:** Vue event modifiers chained with `.`. `@keydown.enter` fires only when the Enter key is pressed. `.prevent` calls `event.preventDefault()` — stops the browser from performing its default behaviour for the Enter key (which in some contexts is form submission). Multiple modifiers can be chained.

**What is `($event.target as HTMLInputElement).value`?** In more detail: the DOM input event carries a reference to the element that fired it in `event.target`. TypeScript does not know that the target of an `input` event is specifically an `HTMLInputElement` — it types it as `EventTarget`, which has no `.value` property. The `as HTMLInputElement` type assertion (a TypeScript-only concept, erased at runtime) tells the compiler: "trust me, this is an HTMLInputElement." The `.value` property (the current text in the input) is then accessible. This is the standard pattern for accessing typed DOM properties in Vue templates.

**What breaks without `@focus="emit('beginEditing')`:** The user clicks the formula bar. `isEditingFormula` stays `false`. The watch is still active. Every character typed updates `formulaBarValue`, the watch fires, and since `isEditingFormula` is false, it overwrites `formulaBarValue` from `cells.value` — resetting the input to the last committed value on every keystroke. The user can type but the input never accumulates characters.

---

### Step 3 — Wire it in App.vue

```vue
<script setup lang="ts">
import FormulaBar from './components/FormulaBar.vue'
import { useFormulaBar } from './composables/useFormulaBar'

const { selectedCell } = useSelection()
const { cells, updateCellValue } = useSpreadsheet()

const {
  formulaBarValue, isEditingFormula,
  beginEditing, commitFormula, cancelEdit,
} = useFormulaBar(selectedCell, cells)

const selectedAddress = computed(() => {
  if (!selectedCell.value) return null
  const { row, col } = selectedCell.value
  return `${String.fromCharCode('A'.charCodeAt(0) + col)}${row + 1}`
})
</script>

<template>
  <FormulaBar
    v-model:formulaBarValue="formulaBarValue"
    :isEditingFormula="isEditingFormula"
    :selectedAddress="selectedAddress"
    @begin-editing="beginEditing"
    @commit="commitFormula(updateCellValue)"
    @cancel="cancelEdit"
  />
</template>
```

**Walkthrough:** `v-model:formulaBarValue="formulaBarValue"` binds the formula bar's input to the `formulaBarValue` ref — when the component emits `'update:formulaBarValue'`, `App.vue` automatically assigns the emitted value to `formulaBarValue`. `@commit="commitFormula(updateCellValue)"` passes `updateCellValue` to `commitFormula` at the event call site — the composable does not import `updateCellValue` directly, maintaining composable independence.

**What breaks if you bind `v-model="cells.value[row][col].raw"` directly to the input:** Typing `=A` immediately sets the cell's raw value to `=A`. `displayData` recomputes. `evaluateFormula('=A', cells)` finds no cell reference matching `A` alone and returns `#ERROR`. The grid flickers `#ERROR` with every character typed. The formula bar is unusable for editing.

---

## Connect the pieces

The formula bar is the same `updateCellValue` entry point as the in-cell editor from lesson 3, wrapped in a composable that manages the editing lifecycle (begin → accumulate → commit or cancel). The two editing surfaces coexist without conflict because they both call the same underlying mutation function.

**In production:** Excel, Google Sheets, and LibreOffice Calc all have exactly this formula bar with exactly this guard: the bar shows the raw formula (not the computed result) of the selected cell, and updates only on commit. The same reactive loop problem exists in all of them, and all of them solve it with the same editing-mode flag.

---

## What breaks without this

**Without the `isEditingFormula` guard:** Every keystroke in the formula bar triggers a `watch` update. The watch reads `cells.value[row][col].raw` (the last committed value) and overwrites `formulaBarValue`. The user types `=A1+` and the bar resets to the pre-edit value. Typing is impossible because the input resets on every character.

---

## Definition of done

- [ ] The formula bar shows the selected cell's address on the left
- [ ] Clicking a formula cell shows `=A1+B1` in the bar (raw formula, not the result `15`)
- [ ] Editing in the bar and pressing Enter updates the cell
- [ ] Pressing Escape restores the original formula in the bar without updating the cell
- [ ] Typing in the bar shows no `#ERROR` flickering in the grid during typing
- [ ] Switching selected cells updates the bar immediately
- [ ] **Git commit:**

```
git add src/
git commit -m "Add FormulaBar — shows raw formula of selected cell, guards against reactive loop during editing"
```
