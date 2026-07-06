# Undo / Redo

## What you will build

Ctrl+Z to undo any cell edit. Ctrl+Y to redo. An undo/redo toolbar showing how many steps are available. The history persists within the session — navigating sheets does not lose it.

```
[ ← Undo (3) ]  [ Redo (1) → ]   ← toolbar
┌──────┬──────┬──────┐
│  5   │  10  │  15  │
└──────┴──────┴──────┘
```

---

## What you need to know first

Every cell edit in lessons 3 and 9 calls `updateCellValue`. That function currently writes directly to `cells` and the change is permanent. Undo means: save the state before every edit, and on Ctrl+Z, restore the most recent saved state.

The classic data structure for this is two stacks: a past stack (states before the current edit) and a future stack (states after an undo). Each edit pushes to the past stack and clears the future stack. Undo pops the past stack (moving the current state to the future stack). Redo pops the future stack (moving it back to the past stack).

---

## The lesson

### The problem

The user edits `A1`, `B1`, `C1`. They want to undo `C1`'s edit. Then they want to undo `B1`'s. Then redo `B1`'s. The history must travel in both directions without losing the future states during backward traversal.

---

### Step 1 — The two-stack history using a TypeScript class

**The problem:** We need a reusable data structure that manages past/future stacks and exposes `push`, `undo`, `redo`, and query methods.

```ts
// src/lib/History.ts

export class History<T> {
  private past: T[] = []
  private future: T[] = []
  private readonly maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  push(state: T): void {
    this.past.push(state)
    if (this.past.length > this.maxSize) {
      this.past.shift()
    }
    this.future = []  // any new edit discards the redo stack
  }

  undo(currentState: T): T | null {
    if (this.past.length === 0) return null
    const previous = this.past.pop()!
    this.future.unshift(currentState)
    return previous
  }

  redo(currentState: T): T | null {
    if (this.future.length === 0) return null
    const next = this.future.shift()!
    this.past.push(currentState)
    return next
  }

  get canUndo(): boolean { return this.past.length > 0 }
  get canRedo(): boolean { return this.future.length > 0 }
  get undoCount(): number { return this.past.length }
  get redoCount(): number { return this.future.length }
}
```

**Walkthrough:** `past` holds snapshots before each edit. `future` holds snapshots that were undone. `push(state)` records the current state (before the mutation), then discards the future stack (once you make a new edit, the redo history is gone — same as every text editor). `undo(currentState)` takes the current state as a parameter, moves it to `future`, and returns the previous state. `redo(currentState)` takes the current state, moves it to `past`, and returns the next future state. `maxSize` caps the history at 100 steps to prevent unbounded memory use.

**What is a TypeScript `class`?** A class defines a blueprint for objects. It can have:
- **Properties** (`past: T[] = []`) — data fields belonging to each instance
- **A `constructor`** — a special method that runs once when `new History()` is called; initialises the instance
- **Methods** — functions that belong to the class (`push`, `undo`, `redo`)
- **Getters** — computed properties using the `get` keyword; accessed like `h.canUndo` (no parentheses)

`new History<CellData[][]>(50)` creates an instance with `maxSize = 50` and empty `past` and `future` arrays.

**What is `private`?** An access modifier. `private past: T[]` means `past` is only readable and writable from inside the `History` class. Code outside — `useSpreadsheet`, `App.vue` — cannot access `history.past` directly. This enforces that `past` is always mutated through the class's methods (`push`, `undo`, `redo`), never externally. `private` is TypeScript-only — it is erased at runtime.

**What is `readonly`?** `private readonly maxSize: number` means `maxSize` is set in the constructor and never reassigned. TypeScript rejects `this.maxSize = 200` after the constructor. This is a compile-time guarantee that the cap does not change.

**What is `<T>`?** The `class History<T>` generic allows `History` to work with any type of state. `History<CellData[][]>` stores 2D grids. `History<string>` stores strings. `T` is a type placeholder — replaced by the actual type when the class is instantiated. `push(state: T)` accepts the same type used to instantiate the class.

**What is `Array.prototype.shift()`?** Removes and returns the first element of an array, shifting all remaining elements left. O(n) — all elements are moved. `[1, 2, 3].shift()` returns `1` and mutates the array to `[2, 3]`. Used here to remove the oldest history entry when the cap is exceeded, and in `redo` to take the next future state from the front of the queue.

**What is `Array.prototype.unshift(item)`?** Inserts an element at the beginning of an array, shifting existing elements right. O(n). `[2, 3].unshift(1)` mutates the array to `[1, 2, 3]`. Used in `undo` to prepend the current state to `future` — keeping `future` ordered newest-first so `redo` always returns the most recent undone state.

**CS concept — two-stack data structure for undo/redo:** This is a textbook application of the two-stack principle. The past stack and future stack together implement a doubly-navigable history. Every text editor (VS Code, Vim, Emacs), graphics tool (Figma, Photoshop), and database transaction system uses this exact structure. The insight: you do not need a doubly-linked list; two stacks with well-defined push/pop rules give the same behaviour with simpler code.

**SE principle — generic, reusable data structure:** `History<T>` knows nothing about cells, spreadsheets, or Vue. It stores any type and manages the two-stack logic. `useSpreadsheet` can use it today; `useCanvasEditor` in a future project can use the same class without modification. This is the Open/Closed Principle: open for extension (any `T`), closed for modification (the history logic never changes).

**What breaks if `maxSize` is removed (history grows without limit):** Every cell edit stores a full deep copy of the 10×8 `CellData[][]` grid. After 10,000 edits, 10,000 arrays × 80 objects × (string + object) = hundreds of megabytes. Eventually, the tab crashes with `OutOfMemoryError`. The `maxSize` cap discards the oldest history entries to bound memory use.

---

### Step 2 — Integrate History into useSpreadsheet

**The problem:** `updateCellValue` must save a snapshot before each edit. `undo` and `redo` must restore snapshots and notify Vue to re-render.

```ts
// src/composables/useSpreadsheet.ts — additions
import { History } from '../lib/History'

const history = new History<CellData[][]>(100)

function snapshotCells(): CellData[][] {
  return cells.value.map(row =>
    row.map(cell => ({
      raw: cell.raw,
      format: { ...cell.format },
    }))
  )
}

function updateCellValue(row: number, col: number, value: string) {
  history.push(snapshotCells())  // snapshot BEFORE the mutation
  const parsed = parseFloat(value)
  activeSheet.value.cells[row][col].raw = isNaN(parsed) ? value : parsed
  rebuild()
}

function undo() {
  const previous = history.undo(snapshotCells())
  if (!previous) return
  activeSheet.value.cells = previous
  rebuild()
}

function redo() {
  const next = history.redo(snapshotCells())
  if (!next) return
  activeSheet.value.cells = next
  rebuild()
}

return {
  /* ... existing returns ... */
  undo, redo,
  canUndo: computed(() => history.canUndo),
  canRedo: computed(() => history.canRedo),
  undoCount: computed(() => history.undoCount),
  redoCount: computed(() => history.redoCount),
}
```

**Walkthrough:** `snapshotCells()` deep-copies the current grid — each cell is a new object with a new format object. `history.push(snapshotCells())` records the state before the mutation. Then `updateCellValue` applies the change. On `undo()`, `history.undo(snapshotCells())` accepts the current state (for redo), returns the previous state, and `activeSheet.value.cells = previous` replaces the grid — triggering Vue's reactivity to re-render.

**Why `snapshotCells()` instead of `cells.value` directly?** `cells.value` is a reactive reference — a proxy. If you push the proxy itself, all history entries point to the same live object. Mutating the current cell mutates every history entry. Deep-copying (`map`, spread `{ ...cell.format }`) creates an independent snapshot — disconnected from the live reactive data.

**What is `{ ...cell.format }`?** The object spread operator. `{ ...obj }` creates a new object with all the same properties and values as `obj`. This is a shallow copy: `{ bold: false, currency: true, alignment: 'left' }` → a new object with the same values. For `CellFormat` (which has no nested objects), this is sufficient. For deeply nested objects, you would need recursive deep cloning.

**What breaks if you snapshot the reactive proxy directly:** `history.past[0]` is the same object as `cells.value`. Editing A1 after an undo updates A1 in the past snapshot too. Pressing Ctrl+Z restores the same state that is currently active — undo appears broken, history entries all look identical.

**What breaks if you call `history.push` after the mutation instead of before:** The snapshot records the post-mutation state. `undo` restores it — back to the edited state, not the pre-edit state. Pressing Ctrl+Z applies the edit a second time instead of reversing it.

---

### Step 3 — Keyboard listener with onMounted / onUnmounted

**The problem:** Ctrl+Z and Ctrl+Y must work globally — regardless of which element is focused. We need to attach a keyboard listener to the `document` when the spreadsheet mounts and remove it when it unmounts.

```ts
// In App.vue or useSpreadsheet.ts
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(event: KeyboardEvent) {
  const isMac = navigator.platform.toUpperCase().includes('MAC')
  const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey

  if (ctrlOrCmd && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    undo()
  }
  if (ctrlOrCmd && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
    event.preventDefault()
    redo()
  }
}
```

**Walkthrough:** `onMounted` runs after the component renders to the DOM for the first time — the DOM exists, so it is safe to attach event listeners. `onUnmounted` runs just before the component is removed from the DOM — the right time to clean up listeners. These are Vue lifecycle hooks.

**What is `onMounted(callback)`?** A Vue lifecycle hook. `callback` runs once, after the component's virtual DOM has been rendered and inserted into the real DOM. This is the earliest point at which you can safely access DOM elements or attach event listeners. Prior to mounting, the DOM does not exist.

**What is `onUnmounted(callback)`?** A Vue lifecycle hook. `callback` runs just before the component is torn down. This is the place to clean up: remove event listeners, cancel timers, close WebSocket connections. Failing to remove event listeners keeps the callback alive in memory even after the component is gone — a memory leak.

**Why `window.removeEventListener(handleKeydown)` must use the same function reference:** `addEventListener` registers a function by reference. `removeEventListener` removes a registration only if the function reference matches exactly. If `handleKeydown` were an arrow function defined inline in `onMounted`, a new function object would be created and the reference would be different — `removeEventListener` would find nothing to remove and the listener would persist.

**What is `event.metaKey`?** The Command key on Mac (⌘). `event.ctrlKey` is Ctrl on Windows/Linux. Mac uses ⌘+Z for undo; Windows uses Ctrl+Z. `navigator.platform.toUpperCase().includes('MAC')` detects the operating system. `navigator.platform` is a browser property that returns the OS platform string (e.g. `"MacIntel"`, `"Win32"`, `"Linux x86_64"`).

**What is `event.preventDefault()`?** Cancels the browser's default action for the event. For Ctrl+Z in a `<textarea>`, the default is to undo text in that input. Our handler runs before the browser default. Calling `event.preventDefault()` stops the browser from running its own undo after ours.

**What is a `KeyboardEvent`?** The type of the event object passed to `keydown` handlers. It has properties: `key` (the pressed key as a string: `'z'`, `'Enter'`, `'ArrowUp'`), `ctrlKey`, `metaKey`, `shiftKey`, `altKey` (booleans for modifier keys), and `code` (the physical key code: `'KeyZ'`). TypeScript's DOM type library provides `KeyboardEvent` — you get full type safety on all these properties.

**CS concept — lifecycle hooks:** Every framework that manages component teardown needs a way to say "run this cleanup when the component is destroyed." React calls it `useEffect`'s cleanup return. Angular calls it `ngOnDestroy`. Vue calls it `onUnmounted`. The underlying concept is RAII (Resource Acquisition Is Initialisation) extended to component lifecycle: acquire resources on mount, release them on unmount. The two always come in pairs.

**SE principle — symmetric resource management:** For every `addEventListener` there must be a `removeEventListener`. For every `setTimeout` there must be a `clearTimeout`. For every open file handle there must be a close. This is the cleanup contract — resources are always returned to the system when they are no longer needed.

**What breaks without `onUnmounted` cleanup:** The spreadsheet component is unmounted (user navigates away). The `keydown` listener is still attached to `window`. Every Ctrl+Z press thereafter calls `undo()` — which calls `activeSheet.value.cells = previous` — on a component that no longer exists. In the best case, nothing happens. In the worst case, it throws an error when it tries to update a component that Vue has already garbage-collected.

---

### Step 4 — Undo/Redo toolbar

```vue
<!-- src/components/UndoRedoBar.vue -->
<script setup lang="ts">
defineProps<{
  canUndo: boolean
  canRedo: boolean
  undoCount: number
  redoCount: number
}>()

const emit = defineEmits<{
  undo: []
  redo: []
}>()
</script>

<template>
  <div class="undo-bar">
    <button :disabled="!canUndo" @click="emit('undo')">
      ← Undo{{ canUndo ? ` (${undoCount})` : '' }}
    </button>
    <button :disabled="!canRedo" @click="emit('redo')">
      Redo{{ canRedo ? ` (${redoCount})` : '' }} →
    </button>
  </div>
</template>

<style scoped>
.undo-bar { display: flex; gap: 8px; padding: 4px 8px; border-bottom: 1px solid #e2e8f0; }
button { padding: 4px 12px; border: 1px solid #e2e8f0; border-radius: 4px; cursor: pointer; font-size: 12px; background: white; }
button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
```

**What breaks without `:disabled="!canUndo"`:** The button is always enabled. Clicking Undo with no history calls `history.undo()`, which returns `null`. `cells.value = null` replaces the grid with null. The next render tries to iterate `null` with `v-for` — `TypeError: Cannot read properties of null`. The `canUndo` check prevents this at the button level.

---

## Connect the pieces

Undo/redo is the first feature in this series that does not model the spreadsheet's data — it models its history. The `History<T>` class is a general-purpose utility; it works for any stateful system. Text editors, drawing tools, version control (git's commit graph is a DAG variant of this two-stack structure), and database transactions all use the same two-stack or linked-list history pattern.

**In production:** Google Docs sends each edit as an operation to the server, which maintains the history server-side. Local undo/redo uses a local operation stack and replays/inverts operations against the server's state. Excel stores the history in memory as cell snapshots — the same approach used here, with a hard limit (around 100 steps by default in Excel 2019).

---

## What breaks without this

**Without `onUnmounted` cleanup:** After navigating away from the spreadsheet, pressing Ctrl+Z anywhere in the app triggers the spreadsheet's undo handler. If the handler accesses `activeSheet.value.cells`, it may throw (the spreadsheet is gone) or corrupt unrelated state (it writes to an orphaned reactive ref). This is a real-world bug that appears in production apps where developers add event listeners without cleanup.

---

## Definition of done

- [ ] Ctrl+Z (or ⌘+Z on Mac) undoes the most recent cell edit
- [ ] Ctrl+Y (or ⌘+Shift+Z on Mac) redoes an undone edit
- [ ] Undo button shows `← Undo (3)` when 3 edits are available to undo
- [ ] Making a new edit after an undo clears the redo stack
- [ ] Navigating to a different sheet and back preserves the undo history
- [ ] **Git commit:**

```
git add src/
git commit -m "Add undo/redo — two-stack History<T> class with Ctrl+Z/Y keyboard listener"
```
