# Selection

## What you will build

A property panel that appears beside the grid when a cell is selected. It shows the cell's address (`B2`), its raw value or formula, and its computed display value. Clicking a different cell updates the panel instantly — no explicit notification, no callback registration.

```
┌──────┬──────┬──────┐     ┌──────────────────────┐
│  5   │  10  │  15  │     │ B2                   │
├──────┼──[B2]┤──────┤  →  │ Raw:    =A1+B1       │
│  20  │ [25] │  30  │     │ Display: 15          │
└──────┴──────┴──────┘     └──────────────────────┘
```

---

## What you need to know first

In lesson 5 we added `selectedCell` to `App.vue` and passed it down as a prop. For one level that is fine. But `FormatBar`, `PropertyPanel`, and `Grid` all need `selectedCell`. Passing it through every intermediate component — through `Grid` to `Row` to `Cell` — is **prop drilling**: threads of data through components that do not use it themselves.

`provide` and `inject` solve this. One component provides a value; any descendant can inject it, regardless of depth.

---

## The lesson

### The problem

`selectedCell` is needed by three different components at three different depths in the tree. Adding a sidebar, a status bar, and a context menu would add three more. Prop drilling scales poorly: every intermediate component must forward data it does not use, and every new consumer requires touching all intermediate components.

---

### Step 1 — The selection composable with `provide/inject`

**The problem:** We need a mechanism to share `selectedCell` across the component tree without threading it as a prop through every level.

```ts
// src/composables/useSelection.ts
import { ref, provide, inject } from 'vue'
import type { InjectionKey, Ref } from 'vue'

export interface SelectedCellInfo {
  row: number
  col: number
}

interface SelectionContext {
  selectedCell: Ref<SelectedCellInfo | null>
  selectCell: (row: number, col: number) => void
  clearSelection: () => void
}

export const SelectionKey: InjectionKey<SelectionContext> = Symbol('selection')

export function provideSelection() {
  const selectedCell = ref<SelectedCellInfo | null>(null)

  function selectCell(row: number, col: number) {
    selectedCell.value = { row, col }
  }

  function clearSelection() {
    selectedCell.value = null
  }

  const context: SelectionContext = { selectedCell, selectCell, clearSelection }
  provide(SelectionKey, context)
  return context
}

export function useSelection(): SelectionContext {
  const context = inject(SelectionKey)
  if (!context) {
    throw new Error('useSelection() must be called inside a component that called provideSelection()')
  }
  return context
}
```

**Walkthrough:** `provideSelection()` creates `selectedCell` and wraps it with two mutation functions. It calls `provide(SelectionKey, context)` — this registers the context under `SelectionKey` in Vue's injection tree for all descendant components. Any descendant that calls `inject(SelectionKey)` receives the same `context` object.

`useSelection()` calls `inject(SelectionKey)`. If no ancestor called `provide(SelectionKey, ...)`, inject returns `undefined` — we throw a descriptive error immediately rather than failing three function calls later with a cryptic `TypeError`.

**What is `provide`?** `provide(key, value)` registers `value` under `key` for all descendant components in the Vue component tree. It does not cross component tree boundaries — only descendants of the component that called `provide` can inject the value.

**What is `inject`?** `inject(key)` retrieves the value registered by the nearest ancestor that called `provide(key, ...)`. If no ancestor has provided the key, it returns `undefined` (or a default if one is specified). `inject` walks up the component tree until it finds a matching `provide`.

**What is `Symbol`?** A JavaScript primitive type that creates a globally unique identifier. `Symbol('selection')` creates a unique value — no other `Symbol('selection')` call produces an equal value, even with the same label. This prevents accidental key collisions between different `provide` calls that might both use the string `'selection'` as a key.

**What is `InjectionKey<T>`?** A TypeScript-only type that links a `Symbol` to its associated type. `InjectionKey<SelectionContext>` means: "when you inject this key, TypeScript knows the result is `SelectionContext`, not `unknown`." Without `InjectionKey`, `inject(SelectionKey)` returns `unknown` and every property access requires a type assertion.

**CS concept — dependency inversion:** Components that need `selectedCell` do not depend on `App.vue` — they depend on the `SelectionKey` abstraction. `App.vue` provides it. The components inject it. Neither side knows about the other's implementation. This is the Dependency Inversion Principle: depend on abstractions (the key and the interface), not on concrete implementations (the specific component that owns the state).

**SE principle — controlled mutations:** `selectedCell` is a `Ref`, but the `SelectionContext` type exposes only `selectCell` and `clearSelection` as mutators. A consuming component cannot do `selectedCell.value = { row: 0, col: 0 }` directly — the ref is typed within the context, not as a mutable ref with a direct setter. The only mutation paths are through `selectCell` and `clearSelection`. This is encapsulation at the state layer.

**What breaks without the `if (!context) throw` guard:** `inject` returns `undefined` when `provideSelection` was never called. The first property access on `undefined` (`context.selectedCell`) throws `TypeError: Cannot read properties of undefined`. The error message is "Cannot read properties of undefined (reading 'selectedCell')" — which says nothing about which component forgot to call `provideSelection`. The explicit throw gives the developer actionable information.

---

### Step 2 — The PropertyPanel component

**The problem:** We need a component that shows the selected cell's address, raw value, and display value, using `useSelection` instead of props.

```vue
<!-- src/components/PropertyPanel.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useSelection } from '../composables/useSelection'
import type { CellData } from '../types/cell'

const props = defineProps<{
  cells: CellData[][]
  displayData: (number | string)[][]
}>()

const { selectedCell } = useSelection()

function toAddress(row: number, col: number): string {
  const colLetter = String.fromCharCode('A'.charCodeAt(0) + col)
  return `${colLetter}${row + 1}`
}

const selectedCellData = computed(() => {
  if (!selectedCell.value) return null
  const { row, col } = selectedCell.value
  return {
    address: toAddress(row, col),
    raw: props.cells[row]?.[col]?.raw ?? '',
    display: props.displayData[row]?.[col] ?? '',
  }
})
</script>

<template>
  <div class="panel">
    <template v-if="selectedCellData">
      <div class="address">{{ selectedCellData.address }}</div>
      <div class="label">Raw</div>
      <div class="value">{{ selectedCellData.raw }}</div>
      <div class="label">Display</div>
      <div class="value">{{ selectedCellData.display }}</div>
    </template>
    <div v-else class="empty">Click a cell to inspect it</div>
  </div>
</template>
```

**Walkthrough:** `PropertyPanel` calls `useSelection()` to get the `selectedCell` ref. It does not receive `selectedCell` as a prop. When `selectedCell.value` changes (user clicks a cell), `selectedCellData` recomputes automatically because it reads `selectedCell.value` inside the `computed` callback.

**`String.fromCharCode('A'.charCodeAt(0) + col)`:** The inverse of `columnLetterToIndex` from lesson 4. `'A'.charCodeAt(0)` is 65. Adding `col` gives `65 + col`. `String.fromCharCode(65 + col)` converts back to the character: column 0 → `'A'`, column 1 → `'B'`, column 2 → `'C'`. `String.fromCharCode` is the inverse of `charCodeAt`.

**What is `String.fromCharCode(n)`?** A static method on `String`. It accepts one or more Unicode code point numbers and returns the corresponding characters as a string. `String.fromCharCode(65)` → `'A'`, `String.fromCharCode(65, 66, 67)` → `'ABC'`.

**What is `??` — nullish coalescing?** The `??` operator returns the left side if it is not `null` or `undefined`, otherwise returns the right side. `props.cells[row]?.[col]?.raw ?? ''` returns the cell's raw value if the cell exists, or an empty string if any part of the chain is null or undefined. It is similar to `||` but only triggers on `null` or `undefined` — not on `0`, `false`, or empty strings.

**What is `<template v-if="...">`?** A `<template>` element is invisible in the DOM — it is a structural wrapper that Vue removes. Using `v-if` on `<template>` conditionally renders its children without adding an extra DOM element. Use `<template>` when you need to group elements for `v-if`, `v-for`, or `v-else` without introducing an unnecessary `<div>`.

**What breaks if `PropertyPanel` received `selectedCell` as a prop:** Every component between `App` and `PropertyPanel` (in this case `Grid`, `Row`) would need to forward it, even though they do not use it. Adding a deeper-nested component that also needs `selectedCell` means threading it through more layers. With `inject`, `PropertyPanel` accesses it directly regardless of nesting depth.

---

### Step 3 — Update App.vue to use provide

```vue
<!-- src/App.vue — additions -->
<script setup lang="ts">
import PropertyPanel from './components/PropertyPanel.vue'
import { provideSelection } from './composables/useSelection'

const { selectedCell, selectCell } = provideSelection()
// selectedCell and selectCell are also used in this component:
// - selectedCell: for FormatBar's selectedFormat computed
// - selectCell: passed to Grid as @select-cell="selectCell"
</script>

<template>
  <div class="spreadsheet">
    <FormatBar :format="selectedFormat" ... />
    <div class="main-area">
      <Grid ... @select-cell="selectCell" />
      <PropertyPanel :cells="cells" :displayData="displayData" />
    </div>
  </div>
</template>
```

**Walkthrough:** `provideSelection()` is called once, in `App.vue`. It creates the selection state, registers it with Vue's provide system, and returns it for `App.vue`'s own use. `Grid` emits `@select-cell` with `(row, col)` — `App.vue` handles it by calling `selectCell(row, col)`. `PropertyPanel` does not receive `selectCell` as a prop — it calls `useSelection()` to inject it.

**What breaks if you call `provideSelection()` inside `PropertyPanel` instead of `App.vue`:** A `provide` call only makes the value available to descendants — not ancestors. If `PropertyPanel` calls `provide`, only `PropertyPanel`'s children can inject it. `FormatBar` and `Grid` cannot inject it because they are not descendants of `PropertyPanel`. The provide must always happen in the common ancestor.

---

## Connect the pieces

`provide/inject` eliminates prop drilling for shared state. The pattern: one `provideX()` at the root, `useX()` anywhere in the subtree.

This is the same pattern used by every major Vue library. Vue Router uses `app.use(router)` to provide the router, then `useRouter()` in any component to inject it. Pinia uses `createPinia()` to provide the store, then `useStore()` to inject it. When you call `useRouter()` in a component, you are using `inject` — now you understand how it works under the hood.

**In production:** The provide/inject pattern appears in React as Context, in Angular as dependency injection containers, and in many state management systems. It is the standard mechanism for sharing state that many components need without the overhead of a global store.

---

## What breaks without this

**If `inject` silently returns `undefined` with no error (the default behaviour):** `PropertyPanel` accesses `context.selectedCell` on the next line — `TypeError: Cannot read properties of undefined`. The error does not say which component forgot to call `provideSelection`. Developers spend time tracing backward through the component tree. The explicit `throw new Error(...)` turns a 30-minute debugging session into a 10-second fix.

---

## Definition of done

- [ ] Clicking a cell highlights it (blue border or background) and shows its address in the panel
- [ ] A formula cell shows the formula string as Raw and the numeric result as Display
- [ ] Clicking a different cell updates the panel instantly
- [ ] The panel shows "Click a cell to inspect it" when nothing is selected
- [ ] `PropertyPanel` does not receive `selectedCell` as a prop — it uses `useSelection()`
- [ ] **Git commit:**

```
git add src/
git commit -m "Add PropertyPanel and provide/inject selection — shared selection state without prop drilling"
```
