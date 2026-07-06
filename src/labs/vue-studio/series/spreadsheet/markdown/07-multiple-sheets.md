# Multiple Sheets

## What you will build

Sheet tabs below the grid. Each tab is a named, independent sheet with its own grid. Clicking a tab switches to that sheet instantly. Adding a new sheet creates a blank one.

```
┌──────┬──────┬──────┐
│  5   │  10  │  15  │   ← Sheet 1's cells (unchanged)
└──────┴──────┴──────┘
[ Sheet 1 ] [ Sheet 2 ] [ + ]
```

---

## What you need to know first

In lessons 1–6 we built one grid. This lesson adds multiple independent grids to the same UI shell. The active sheet is a `ref` — switching tabs changes only that ref, and Vue's reactivity system re-renders the grid automatically.

---

## The lesson

### The problem

The current spreadsheet has one grid. The user needs to organise data across multiple independent grids. The key insight: a "sheet" is just a named `CellData[][]`. Multiple sheets = an array of named grids. The active sheet = one entry from that array. Switching = changing which entry is active.

---

### Step 1 — The Sheet type

**The problem:** We need a type to represent one sheet — its unique identity, its display name, and its grid data.

```ts
// src/types/sheet.ts
import type { CellData } from './cell'
import { defaultCell } from './cell'

export interface Sheet {
  id: string          // stable unique identifier
  name: string        // display name ("Sheet 1")
  cells: CellData[][] // the grid
}

export function createSheet(name: string, rows = 10, cols = 8): Sheet {
  return {
    id: crypto.randomUUID(),
    name,
    cells: Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => defaultCell())
    ),
  }
}
```

**Walkthrough:** `createSheet` builds a new Sheet object: a unique ID, a display name, and a 2D array of default cells. `Array.from({ length: rows }, factory)` calls `factory` once for each index from `0` to `rows - 1` and collects the results into an array. The outer `Array.from` creates the rows; the inner creates the cells within each row.

**What is `crypto.randomUUID()`?** A browser and Node.js built-in function that generates a UUID — Universally Unique Identifier. A UUID is a 128-bit random value formatted as `"550e8400-e29b-41d4-a716-446655440000"`. The probability of two UUIDs colliding is astronomically small. We use it as the sheet ID so we can identify a sheet regardless of where it sits in the array — important when sheets can be reordered or deleted.

**What is `Array.from({ length: n }, fn)`?** Creates an array of `n` elements by calling `fn(undefined, index)` once for each index. `Array.from({ length: 3 }, () => 0)` produces `[0, 0, 0]`. The factory function runs separately for each element — this is essential here. The alternative `new Array(rows).fill([])` would reuse the same inner array object for every row: `cells[0]` and `cells[1]` would be the same array, and editing one row would silently corrupt all others.

**Why a `string` ID instead of a numeric index?** Arrays are indexed by position. If the user deletes Sheet 1, Sheet 2 shifts to index 0. Any code that stored "active sheet is index 1" now points to the wrong sheet. String IDs are **identity references** — they identify the sheet regardless of its position. Position changes; identity does not.

**CS concept — stable identity:** The difference between a positional reference (index 0, 1, 2) and an identity reference (UUID). Positional references break when the collection is reordered or filtered. Identity references survive reordering and deletion. Databases use primary keys (identity) not row numbers (position) for the same reason.

**SE principle — factory functions for initialisation safety:** `createSheet` guarantees that every new sheet has a unique ID and a fresh 2D array with no shared state. Without a factory, code that creates sheets must know about `crypto.randomUUID()` and the correct array construction pattern. Centralising creation in one function means one place to fix if the initialisation logic changes.

**What breaks if you use `new Array(rows).fill([])` for the cells:** Every row is the same array object. `cells[0].push(cell)` pushes onto the same array that `cells[1]` references. Editing a cell in row 0 shows it in every row — a phantom duplication bug with no obvious cause.

---

### Step 2 — Update useSpreadsheet for multiple sheets

**The problem:** The composable currently manages one grid. We need to manage an array of sheets and track which one is active.

```ts
// src/composables/useSpreadsheet.ts (restructured)
import { ref, computed } from 'vue'
import type { Sheet } from '../types/sheet'
import { createSheet } from '../types/sheet'

export function useSpreadsheet() {
  const sheets = ref<Sheet[]>([
    createSheet('Sheet 1'),
    createSheet('Sheet 2'),
  ])
  const activeSheetId = ref<string>(sheets.value[0].id)

  const activeSheet = computed<Sheet>(() => {
    const found = sheets.value.find(sheet => sheet.id === activeSheetId.value)
    if (!found) throw new Error(`Sheet not found: ${activeSheetId.value}`)
    return found
  })

  function switchSheet(id: string) {
    activeSheetId.value = id
  }

  function addSheet() {
    const newSheet = createSheet(`Sheet ${sheets.value.length + 1}`)
    sheets.value.push(newSheet)
    activeSheetId.value = newSheet.id
  }

  function updateCellValue(row: number, col: number, newValue: string) {
    const parsed = parseFloat(newValue)
    activeSheet.value.cells[row][col].raw = isNaN(parsed) ? newValue : parsed
  }

  return { sheets, activeSheet, activeSheetId, switchSheet, addSheet, updateCellValue }
}
```

**Walkthrough:** `sheets` holds all sheet objects. `activeSheetId` holds the ID of the currently visible sheet. `activeSheet` is a `computed` that finds the sheet with that ID. When `switchSheet(id)` sets `activeSheetId.value`, `activeSheet` recomputes — Vue re-renders the grid with the new sheet's data.

**What is `Array.prototype.find(predicate)`?** Searches an array and returns the first element for which `predicate(element)` returns `true`, or `undefined` if none match. `sheets.value.find(sheet => sheet.id === activeSheetId.value)` returns the `Sheet` object whose `id` property equals `activeSheetId.value`. `find` is O(n) — it scans the array linearly. For a small number of sheets, this is fine.

**Why not use an index (`activeSheetIndex: ref(0)`) instead of an ID?** If the user later deletes or reorders sheets, the index becomes wrong. A deleted sheet at index 0 makes index 0 point to what was Sheet 2. UUIDs survive this — the sheet is identified by what it is, not where it is. This is the same reason databases use primary keys instead of row numbers for foreign key references.

**What is `computed<Sheet>()`?** The type parameter `<Sheet>` tells TypeScript that `activeSheet.value` is always a `Sheet` — not `Sheet | undefined`. We guarantee this by throwing if the ID is not found (rather than returning undefined). TypeScript trusts the explicit type parameter; the runtime throw catches the impossible case.

**CS concept — indirection:** `activeSheet` does not hold the sheet directly — it holds an ID that is resolved to a sheet. This is the same principle as a database foreign key, a filesystem path, or a URL. Indirection lets the referenced object be found regardless of where it lives in the collection.

**What breaks if you use `activeSheetIndex` instead of `activeSheetId`:** User deletes Sheet 1. `activeSheetIndex.value` is still `0`. `sheets.value[0]` is now what was Sheet 2. The grid shows Sheet 2's data while the Tab shows Sheet 1's name. The mismatch is invisible until the user notices the data is wrong.

---

### Step 3 — SheetTabs component

**The problem:** We need a tab bar that shows sheet names, highlights the active one, and emits events when the user clicks a tab or the add button.

```vue
<!-- src/components/SheetTabs.vue -->
<script setup lang="ts">
import type { Sheet } from '../types/sheet'

defineProps<{
  sheets: Sheet[]
  activeSheetId: string
}>()

const emit = defineEmits<{
  switchSheet: [id: string]
  addSheet: []
}>()
</script>

<template>
  <div class="tabs">
    <button
      v-for="sheet in sheets"
      :key="sheet.id"
      class="tab"
      :class="{ active: sheet.id === activeSheetId }"
      @click="emit('switchSheet', sheet.id)"
    >
      {{ sheet.name }}
    </button>
    <button class="add-tab" @click="emit('addSheet')">+</button>
  </div>
</template>

<style scoped>
.tabs { display: flex; align-items: center; border-top: 1px solid #e2e8f0; background: #f8fafc; }
.tab { padding: 8px 16px; border: none; border-right: 1px solid #e2e8f0; background: transparent; cursor: pointer; font-size: 13px; }
.tab.active { background: white; border-top: 2px solid #41b883; font-weight: 600; }
.add-tab { padding: 8px 14px; border: none; background: transparent; cursor: pointer; font-size: 16px; color: #64748b; }
</style>
```

**Walkthrough:** `SheetTabs` is a pure presentational component — it receives data and emits events. It does not own any state. The active tab is identified by comparing each `sheet.id` to `activeSheetId`. The `:class="{ active: sheet.id === activeSheetId }"` binding (introduced in lesson 5) applies the `active` CSS class to the currently active tab.

**Why emit events instead of calling `switchSheet` directly?** `SheetTabs` does not have access to `useSpreadsheet`. The composable is used in `App.vue`. Events carry the action upward to the component that owns the state — this is Vue's "data down, events up" principle. The component that owns the state decides what to do with the action.

**What breaks if `SheetTabs` calls `useSpreadsheet()` directly:** `useSpreadsheet` creates a new composable instance — a fresh set of reactive state. `SheetTabs` gets a different `sheets` array from the one in `App.vue`. Switching a tab in `SheetTabs` updates the tab component's local state but not `App.vue`'s state. The grid never changes.

---

### Step 4 — Wire it in App.vue

```vue
<script setup lang="ts">
import SheetTabs from './components/SheetTabs.vue'
const { sheets, activeSheet, activeSheetId, switchSheet, addSheet, updateCellValue } = useSpreadsheet()
</script>

<template>
  <div class="spreadsheet">
    <!-- ...FormatBar, main area... -->
    <SheetTabs
      :sheets="sheets"
      :activeSheetId="activeSheetId"
      @switch-sheet="switchSheet"
      @add-sheet="addSheet"
    />
  </div>
</template>
```

**Walkthrough:** When `switchSheet(id)` runs, `activeSheetId.value` changes. `activeSheet` (computed) re-evaluates and returns the new sheet. `displayData` (which reads `activeSheet.value.cells`) re-evaluates. The grid re-renders with the new sheet's cells. The tab bar shows the new tab as active. Nothing in `Grid`, `Row`, or `Cell` changed — only the data they receive.

**What breaks without the `computed` for `activeSheet`:** If `activeSheet` were a method `getActiveSheet()`, the template would not re-render when `activeSheetId` changes — it would not be a reactive dependency. Only `computed` and `ref` values create reactive dependencies in Vue templates.

---

## Connect the pieces

Multiple sheets is the same reactive pattern as everything else: reactive data → computed derivation → template rendering. The only new concept is ID-based references — the same principle databases use for foreign keys, Redux uses for normalised state, and every URL-based routing system uses.

**In production:** Google Sheets, Excel Online, and LibreOffice all represent sheets as a named array of cell grids with an active pointer — exactly this architecture. The ID-based reference system is used in every production spreadsheet to handle sheet operations (rename, delete, reorder) without corrupting cross-sheet formula references.

---

## What breaks without this

**If you use `activeSheetIndex` (number) instead of `activeSheetId` (string):** Every sheet operation that shifts the array — delete, reorder — invalidates the active pointer. After deleting Sheet 1, the grid shows Sheet 2's data but the UI shows Sheet 1's name. The mismatch is silent; no error is thrown; the user's data appears to vanish.

---

## Definition of done

- [ ] Two sheet tabs visible below the grid
- [ ] Clicking Sheet 2 shows its (empty) grid; Sheet 1's data is unchanged
- [ ] Editing cells on Sheet 2 does not affect Sheet 1
- [ ] Clicking `+` creates a new empty sheet and switches to it
- [ ] The active tab has a green top border
- [ ] **Git commit:**

```
git add src/
git commit -m "Add multiple sheets — each sheet is an independent CellData[][] identified by UUID"
```
