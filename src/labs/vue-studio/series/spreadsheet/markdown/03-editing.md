# Editing

## What you will build

Cells you can edit. Double-click a cell — it becomes a focused input. Type a new value. Press Enter or click away — the cell shows the new value and the reactive grid updates.

```
┌──────────────────┬──────┬──────┐
│ [  editing...   ]│  10  │  15  │   ← active cell is a focused <input>
└──────────────────┴──────┴──────┘
```

---

## What you need to know first

In lesson 2 we built `App → Grid → Row → Cell` with reactive data flowing downward as props. This lesson extends `Cell.vue` so it has two states — display and edit — and introduces the upward direction: events flowing from `Cell` back up to `App` to mutate the data.

---

## The lesson

### The problem

A static grid is a table, not a spreadsheet. To make cells editable, each cell must exist in two modes: **display mode** (showing a value) and **edit mode** (showing an input). We need to model that mode switch and propagate the edited value back up to `App.vue`, which owns the data.

---

### Step 1 — Model the cell's two states

**The problem:** A cell is either showing a value or accepting input. We need a variable that represents which state we are in.

```ts
// Inside Cell.vue <script setup>
import { ref } from 'vue'

const isEditing = ref(false)
// false = display mode, true = edit mode
```

**Walkthrough:** `isEditing` starts at `false` (display mode). When the user double-clicks the cell, we set `isEditing.value = true`. Vue sees the change, the template re-renders, and the input appears. When the user confirms or cancels, we set `isEditing.value = false` and the display span returns.

**CS concept — finite state machine (FSM):** A system that exists in exactly one of a fixed set of states and transitions between them in response to events. This cell is a two-state FSM: `Display ↔ Edit`. The events are: "double-click" (Display → Edit), "blur" (Edit → Display), "Enter" (Edit → Display), "Escape" (Edit → Display without saving). Every interactive UI element has this structure — a modal (open/closed), a dropdown (expanded/collapsed), a tab (active/inactive).

**SE principle — state isolation:** The `isEditing` ref is local to `Cell.vue`. No other component knows or cares whether a given cell is in edit mode. Keeping state as local as possible reduces the surface area of changes — adding a third state (e.g., "error") requires touching only `Cell.vue`.

**What breaks without `ref`:** A plain `let isEditing = false` does not trigger re-renders when changed. The input would never appear even after `isEditing = true` because Vue has not tracked this variable as reactive.

---

### Step 2 — Conditional rendering with `v-if` / `v-else`

**The problem:** We need to show either the display `<span>` or the edit `<input>` depending on `isEditing`. We need conditional rendering.

```vue
<template>
  <div class="cell" @dblclick="startEditing">
    <input
      v-if="isEditing"
      class="cell-input"
    />
    <span v-else>{{ value }}</span>
  </div>
</template>
```

**Walkthrough:** When `isEditing` is `false`, `v-if="isEditing"` evaluates to `false`. Vue removes the `<input>` from the DOM entirely (not just hidden — removed). `v-else` renders the `<span>`. When `isEditing` becomes `true`, Vue inserts the `<input>` and removes the `<span>`. This is a DOM element exchange.

**What is `v-if`?** A Vue directive that conditionally renders an element. When the expression is `true`, the element exists in the DOM. When `false`, the element is removed from the DOM. Compare to CSS `display: none`, which hides an element but keeps it in the DOM — `v-if` completely unmounts it.

**What is `v-else`?** Must be placed immediately after a `v-if` or `v-else-if`. Renders when all preceding conditions are false. It shares the same conditional scope as the `v-if` above it.

**What is `@dblclick`?** A Vue event directive shorthand for `v-on:dblclick`. It attaches a JavaScript event listener to the element. `@dblclick="startEditing"` calls `startEditing()` when the element receives a `dblclick` DOM event. The DOM fires `dblclick` when a user clicks the same element twice in quick succession.

**What breaks without `v-else` (if you use a second `v-if` instead):** Vue evaluates both conditions independently. If `startEditing` sets `isEditing = true` and both `v-if`s refer to `isEditing`, you get both the input and the span rendered simultaneously for one frame. `v-else` guarantees mutual exclusivity — Vue evaluates them as one unit.

---

### Step 3 — Auto-focus the input with template refs and `nextTick`

**The problem:** When the input appears, the user should not have to click it again to start typing. We need to programmatically focus the input after Vue inserts it into the DOM.

```ts
import { ref, watch, nextTick } from 'vue'

const inputEl = ref<HTMLInputElement | null>(null)

watch(isEditing, async (nowEditing) => {
  if (nowEditing) {
    await nextTick()
    inputEl.value?.focus()
  }
})
```

And in the template, attach the ref:

```vue
<input
  v-if="isEditing"
  ref="inputEl"
  class="cell-input"
/>
```

**Walkthrough:** When `isEditing` changes to `true`, the `watch` callback runs. The template has not been updated yet — Vue batches DOM updates and applies them asynchronously. `await nextTick()` waits until Vue has finished the current render cycle and the `<input>` is in the DOM. Then `inputEl.value?.focus()` calls the browser's focus method on the input element.

**What is a template ref?** `ref="inputEl"` links a DOM element to a script variable. After the element mounts (appears in the DOM), `inputEl.value` holds a reference to the actual `HTMLInputElement`. Before it mounts (when `v-if` is false), `inputEl.value` is `null`. This is the mechanism for imperative DOM access in Vue — rare, but necessary for cases like focus management.

**What is `ref<HTMLInputElement | null>(null)`?** The TypeScript type annotation `<HTMLInputElement | null>` tells TypeScript what type `inputEl.value` holds. `HTMLInputElement` is the TypeScript type for a `<input>` DOM element — it has methods like `.focus()`, `.blur()`, and `.select()`. The `| null` is required because the element may not be mounted yet.

**What is `watch`?** `watch(source, callback)` runs `callback` whenever `source` changes. `source` can be a `ref`, a `computed`, or an array of either. The callback receives `(newValue, oldValue)` as arguments. We use `watch` here because we need to run imperative code (focus the input) in response to a state change — something `computed` cannot do.

**What is `nextTick`?** Vue batches reactive updates for performance: it does not update the DOM immediately when a ref changes. Instead it schedules the update for the next "tick" of the JavaScript event loop. `nextTick()` returns a Promise that resolves after Vue finishes the current batch of DOM updates. Without `await nextTick()`, we call `.focus()` before the `<input>` exists in the DOM — the call does nothing.

**What is `inputEl.value?.focus()`?** The `?.` is optional chaining — a JavaScript operator introduced in ES2020. `a?.b` returns `undefined` if `a` is `null` or `undefined`, rather than throwing `TypeError: Cannot read property 'b' of null`. Here, `inputEl.value` might be `null` (if the `v-if` hasn't rendered yet despite `nextTick`). The `?.` makes the focus call safe.

**CS concept — asynchrony:** The browser's event loop processes one task at a time. Between tasks, it can repaint the screen. Vue queues DOM updates as microtasks. `nextTick` inserts our focus call as a microtask that runs after Vue's updates but before the next browser repaint — so the input is in the DOM when we call `.focus()`.

**SE principle — imperative vs declarative:** Vue templates are declarative — you describe what the DOM should look like. Template refs are the escape hatch to imperative DOM access. The rule: use declarative rendering by default; reach for template refs only when the browser's API (focus, scroll, play/pause, canvas draw) requires a direct reference to the DOM element.

**What breaks without `nextTick`:** `.focus()` fires before the `<input>` element exists in the DOM. The call is silently ignored. The user types and nothing happens. No error — the bug is invisible.

---

### Step 4 — Add `v-model` and commit logic

**The problem:** We need the input to show the current cell value when editing starts, and to capture what the user types. We also need to commit on Enter/blur and cancel on Escape.

```ts
const editValue = ref(String(props.value))

function startEditing() {
  editValue.value = String(props.value)
  isEditing.value = true
}

function commitEdit() {
  isEditing.value = false
  emit('update', props.rowIndex, props.colIndex, editValue.value)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') commitEdit()
  if (event.key === 'Escape') isEditing.value = false
}
```

```vue
<input
  v-if="isEditing"
  ref="inputEl"
  v-model="editValue"
  class="cell-input"
  @blur="commitEdit"
  @keydown="handleKeydown"
/>
```

**Walkthrough:** `startEditing` copies `props.value` into the local `editValue` ref — this gives the input a starting point (the current cell value). The user types; `v-model` updates `editValue` on each keystroke. When the user presses Enter or clicks away, `commitEdit` sets `isEditing` to false (returning to display mode) and emits the `update` event with the final typed value.

**What is `String(props.value)`?** `String()` is a built-in JavaScript function that converts any value to its string representation. `String(42)` returns `"42"`. `String(null)` returns `"null"`. We convert `props.value` to a string because `<input>` elements always work with strings — they have no concept of a "number" value.

**What is `v-model`?** Two-way data binding. `v-model="editValue"` is shorthand for `:value="editValue" @input="editValue.value = $event.target.value"`. It keeps the input's displayed text and the `editValue` ref in sync in both directions: when the user types, `editValue` updates; when `editValue` is set by code (in `startEditing`), the input shows the new text.

**What is `@blur`?** `blur` is a DOM event fired when an element loses focus — when the user clicks somewhere else or presses Tab. `@blur="commitEdit"` commits the edit whenever the input loses focus.

**What is `@keydown`?** `keydown` fires each time a key is pressed (before the key is released — contrast with `keyup`). The handler receives a `KeyboardEvent`. `event.key` is a string describing which key was pressed: `'Enter'`, `'Escape'`, `'a'`, `'ArrowUp'`, etc.

**Why keep `editValue` local?** If we bound directly to `props.value` via `v-model`, every keystroke would fire an event upward, causing the grid to re-render on every character. Buffering in a local ref accumulates keystrokes silently. We emit only once — the confirmed final value. This is the pattern for every form field: accumulate, then submit.

**What breaks if you emit on every keypress:** Every character typed triggers `updateCell` in `App.vue`. In lesson 4, `updateCell` triggers `computed()` to re-evaluate all formulas. For a spreadsheet with 50 formula cells, typing "hello" (5 characters) causes 250 formula evaluations. The grid stutters visibly.

**CS concept:** Double buffering. The `editValue` local copy is the "back buffer" — invisible to the rest of the app until the edit is committed, at which point it becomes the "front buffer" (the visible `props.value`). This pattern is used in graphics rendering (OpenGL double buffering), database transactions (write-ahead logging), and UI frameworks (React's state batching).

---

### Step 5 — Declare emit and update props

**The problem:** We need to declare the new props (`rowIndex`, `colIndex`) and the `update` event so TypeScript can type-check the component's API.

```ts
const props = defineProps<{
  value: number | string
  rowIndex: number
  colIndex: number
}>()

const emit = defineEmits<{
  update: [rowIndex: number, colIndex: number, newValue: string]
}>()
```

**What is `defineEmits`?** The counterpart to `defineProps`. `defineEmits<{ eventName: [payloadTypes] }>()` declares which events this component can fire and what their payload types are. The return value is the `emit` function — calling `emit('update', 0, 1, 'hello')` fires the `update` event with that payload. Vue validates the payload types at compile time.

**What is `const props = defineProps<{...}>()`?** In lesson 1 we called `defineProps` without capturing the return value because we only needed `value` in the template. Now we need `props.rowIndex` and `props.colIndex` in the script — so we capture the return value as `props`. `props.value` in the script equals `value` in the template.

---

### Step 6 — Thread the event through Grid and Row

**The problem:** `Cell` emits `update`. But `App.vue` is the handler. The event must pass through `Row` and `Grid` on the way up.

```vue
<!-- src/components/Row.vue -->
<script setup lang="ts">
import Cell from './Cell.vue'

defineProps<{ cells: (number | string)[]; rowIndex: number }>()
const emit = defineEmits<{ updateCell: [rowIndex: number, colIndex: number, value: string] }>()
</script>

<template>
  <div class="row">
    <Cell
      v-for="(cellValue, colIndex) in cells"
      :key="colIndex"
      :value="cellValue"
      :rowIndex="rowIndex"
      :colIndex="colIndex"
      @update="emit('updateCell', rowIndex, colIndex, $event)"
    />
  </div>
</template>
```

```vue
<!-- src/components/Grid.vue -->
<script setup lang="ts">
import Row from './Row.vue'

defineProps<{ rows: (number | string)[][] }>()
const emit = defineEmits<{ updateCell: [rowIndex: number, colIndex: number, value: string] }>()
</script>

<template>
  <div class="grid">
    <Row
      v-for="(rowCells, rowIndex) in rows"
      :key="rowIndex"
      :cells="rowCells"
      :rowIndex="rowIndex"
      @update-cell="emit('updateCell', rowIndex, $event.colIndex, $event.value)"
    />
  </div>
</template>
```

**What is `$event`?** Inside a Vue event handler expression (the string value of `@eventName="..."`), `$event` refers to the event payload — whatever the emitting component passed to `emit`. `@update="emit('updateCell', rowIndex, colIndex, $event)"` means: when `Cell` emits `update` with a string payload, re-emit it from `Row` as `updateCell`. The `$event` here is the string value.

**What is `@update-cell` vs `updateCell`?** Vue normalises event names between kebab-case (in templates: `@update-cell`) and camelCase (in `defineEmits`: `updateCell`). Use camelCase in `defineEmits`; Vue handles the conversion.

**What breaks without threading:** `Cell` emits `update`. Nobody above it listens. `commitEdit` fires; `emit` runs; the event disappears into the void. `App.vue` never receives it; `gridData` is never mutated; the cell appears to revert to its old value (because `props.value` is still the old value from `gridData`). The edit is silently discarded.

**SE principle — props down, events up:** This is Vue's fundamental data flow model. Props carry data from parent to child (downward). Events carry signals from child to parent (upward). Data changes only happen at the source (App.vue). This one-way flow means: to find where a value was changed, follow the event chain upward. There is exactly one place to look.

---

### Step 7 — Handle the event in App.vue

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

function updateCell(rowIndex: number, colIndex: number, newValue: string) {
  const parsed = parseFloat(newValue)
  gridData.value[rowIndex][colIndex] = isNaN(parsed) ? newValue : parsed
}
</script>

<template>
  <div class="spreadsheet">
    <Grid :rows="gridData" @update-cell="updateCell" />
  </div>
</template>
```

**Walkthrough:** `updateCell` receives the row index, column index, and the typed string. `parseFloat(newValue)` attempts to convert the string to a number. `parseFloat("42")` returns `42`. `parseFloat("hello")` returns `NaN` — a special JavaScript value meaning "Not a Number." `isNaN(value)` returns `true` if the value is `NaN`. If parsing fails, we store the raw string. If it succeeds, we store the number.

**What is `parseFloat`?** A built-in JavaScript function. Accepts a string, returns a floating-point number or `NaN`. `parseFloat("3.14")` → `3.14`. `parseFloat("  42  ")` → `42` (trims whitespace). `parseFloat("99bottles")` → `99` (stops at the first non-numeric character). `parseFloat("hello")` → `NaN`.

**What is `isNaN`?** A built-in function that returns `true` if the argument is `NaN`. It is the only reliable way to test for `NaN` — `NaN === NaN` is `false` in JavaScript (by IEEE 754 specification).

**Why store numbers as numbers?** In lesson 4, `=A1+B1` must add numbers, not concatenate strings. If A1 contains the string `"5"` and B1 contains `"10"`, `"5" + "10"` is `"510"`. Normalising to numbers at the input boundary prevents this class of bug.

**What breaks if you always store strings:** Every formula result is wrong. `=A1+B1` with A1="5" and B1="10" gives "510". Detecting and fixing this later requires touching the evaluator, the display, and every formula test. Fixing it at the boundary costs one line.

---

## Connect the pieces

The reactive loop: user double-clicks → `startEditing` → `isEditing = true` → input appears and is focused → user types (updates `editValue`) → user confirms → `commitEdit` → `emit('update')` → event bubbles through `Row` → `Grid` → `App` → `updateCell` → `gridData` mutated → Vue detects change → grid re-renders.

This is the complete cycle: user action → event → data mutation → automatic re-render. It is the same loop that drives React, Svelte, and Angular. Vue calls it the reactivity system. The underlying mechanism is JavaScript Proxies — Vue wraps `gridData.value` in a Proxy that intercepts writes and schedules re-renders.

**In production:** This pattern — local edit buffer, emit-on-commit — is used in every production form: search boxes, inline editable tables, comment editors, settings panels. The alternative (live sync on every keystroke) is used only for real-time collaboration (Google Docs) where a full synchronisation infrastructure exists to handle conflicts.

---

## What breaks without this

**If Cell emits on every keypress:** Each character typed triggers `updateCell` → `gridData` mutation → Vue schedules re-render → all cells re-render. In lesson 4, this also triggers formula recomputation for every dependent cell. Typing a 5-character formula triggers 5 full grid recomputes. At 100ms per recompute, the grid lags 500ms behind the user's typing.

---

## Definition of done

- [ ] Double-clicking a cell shows a focused input containing the current value
- [ ] Typing a new value and pressing Enter shows the new value in the cell
- [ ] Clicking away (blur) commits the edit
- [ ] Pressing Escape reverts the cell to its original value without emitting
- [ ] Typing `42` stores the number 42; typing `hello` stores the string "hello"
- [ ] No console errors
- [ ] **Git commit:**

```
git add src/
git commit -m "Make cells editable — double-click to enter edit mode, Enter/blur commits, Escape cancels"
```
