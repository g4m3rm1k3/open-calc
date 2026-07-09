# Vue Spreadsheet — Lesson 03 — Editing a Cell

## What you will build

Double-click any cell and it becomes a focused text input. Type a value. Press Enter or click elsewhere and the input disappears, replaced by the text you typed. Every cell's raw text is now genuinely data this project owns — stored somewhere real, still there the next time you look.

```
    A         B         C
1 | hello  | [typing▌]|         |   ← B1 is being edited
2 |        |          |         |
```

---

## What you need to know first

Lesson 02 left `selectedCoordinate: ref<Coordinate | null>(null)`, updated by `selectCell()`, with `readonly` on `Coordinate` fields and a `isCellSelected()` helper for the template. Everything from lesson 02 carries forward.

---

## Step 1 — Store every cell's raw text

**The problem:** Nothing currently remembers what was typed into a cell.

Add to `<script setup>`:

```typescript
const rawValues = ref<Record<CellId, string>>({})
const editingCoordinate = ref<Coordinate | null>(null)
```

**Walkthrough — `Record<K, V>`:**

`Record<CellId, string>` describes an object where every key is a `CellId` (from lesson 01: a meaningful alias for `string`) and every value is a `string`. It is shorthand for `{ [key: CellId]: string }` — a lookup table from cell addresses to text content.

`Record` is TypeScript's built-in **generic utility type** for this pattern. The `<K, V>` part means Record does not commit to any specific types until you tell it which ones. `Record<CellId, string>` is Record specialized with `CellId` keys and `string` values.

Run this throwaway to understand what `Record` gives you:

```vue
<script setup lang="ts">
type CellId = string

// Record<CellId, string> is a typed lookup table
const store: Record<CellId, string> = {}

// Writing — any CellId key maps to a string value
store['A1'] = 'hello'
store['B3'] = '42'
store['F10'] = '=A1+B3'

// Reading — TypeScript says the return type is string
// (though at runtime it may be undefined for missing keys)
const a1 = store['A1']   // 'hello'
const c2 = store['C2']   // undefined at runtime — TypeScript does not warn about this gap

// The ?? operator fills that gap:
const safeRead = store['C2'] ?? ''   // '' when missing
</script>
<template>
  <p>A1: "{{ store['A1'] ?? '' }}"</p>
  <p>C2 (missing): "{{ store['C2'] ?? '' }}"</p>
</template>
```

The `??` note at the end is not cosmetic. `Record<CellId, string>` tells TypeScript "every value here is a string" — but for unvisited cells, the value genuinely is `undefined` at runtime. TypeScript's default settings do not flag this gap. `?? ''` defends against it explicitly.

**Walkthrough — `editingCoordinate: ref<Coordinate | null>(null)`:**

The same `Coordinate | null` union from lesson 02, applied to a second independent question: not *which* cell is selected, but *which* cell is currently showing a text input. The two can be different coordinates. They could even be the same cell — selecting B1 and then starting to edit it.

---

## Step 2 — Start and commit an edit

**The problem:** Nothing currently switches a cell into edit mode, and nothing stores what was typed.

Add to `<script setup>`:

```typescript
function startEditing(coordinate: Coordinate): void {
  editingCoordinate.value = coordinate
}

function commitEdit(coordinate: Coordinate, value: string): void {
  rawValues.value[cellId(coordinate)] = value
  editingCoordinate.value = null
}
```

`startEditing` sets `editingCoordinate`. The template will react to this change and replace the cell's display content with an `<input>`.

`commitEdit` does three things in order: store the typed value, clear `editingCoordinate` (the input disappears), and that is it — Vue re-renders the cell automatically because `rawValues` and `editingCoordinate` are both reactive.

**Walkthrough — why `commitEdit` is the only place `rawValues` is written:**

Both keyboard (Enter) and blur (click elsewhere) trigger `commitEdit`. Neither writes to `rawValues` directly. If a future lesson needs to validate or transform a value before storing it — lesson 04 does exactly this, distinguishing numbers from text — there is exactly one function to change. This is the same discipline as lesson 02's `selectCell`: all state changes go through a named function; the template dispatches to functions, not raw assignments.

---

## Step 3 — Conditional rendering per cell

**The problem:** The template currently renders every cell as an empty `<td>`. It needs to show a text input when editing, or display text when not.

Replace the `<td>` in the template:

```html
<td
  v-for="col in columns"
  :key="col"
  :id="'cell-' + cellId({ col, row })"
  :class="['cell', { 'cell-selected': isCellSelected(col, row) }]"
  @click="selectCell({ col, row })"
  @dblclick="startEditing({ col, row })"
>
  <template v-if="isEditing(col, row)">
    <input
      class="cell-input"
      :value="rawValues[cellId({ col, row })] ?? ''"
      @keydown.enter.stop="commitEdit({ col, row }, ($event.target as HTMLInputElement).value)"
      @blur="commitEdit({ col, row }, ($event.target as HTMLInputElement).value)"
      :ref="(el) => { if (el) (el as HTMLInputElement).focus() }"
    />
  </template>
  <template v-else>
    {{ rawValues[cellId({ col, row })] ?? '' }}
  </template>
</td>
```

Add `isEditing` to `<script setup>`:

```typescript
function isEditing(col: number, row: number): boolean {
  const ed = editingCoordinate.value
  if (ed === null) return false
  return ed.col === col && ed.row === row
}
```

Add to `<style>`:

```css
.cell-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  padding: 0;
  font: inherit;
  background: transparent;
}
```

Here is the complete file:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const COLUMN_COUNT = 6
const ROW_COUNT = 10

interface Coordinate {
  readonly col: number
  readonly row: number
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

const selectedCoordinate  = ref<Coordinate | null>(null)
const editingCoordinate   = ref<Coordinate | null>(null)
const rawValues           = ref<Record<CellId, string>>({})

function selectCell(coordinate: Coordinate): void {
  selectedCoordinate.value = coordinate
}

function isCellSelected(col: number, row: number): boolean {
  const sel = selectedCoordinate.value
  if (sel === null) return false
  return sel.col === col && sel.row === row
}

function startEditing(coordinate: Coordinate): void {
  editingCoordinate.value = coordinate
}

function commitEdit(coordinate: Coordinate, value: string): void {
  rawValues.value[cellId(coordinate)] = value
  editingCoordinate.value = null
}

function isEditing(col: number, row: number): boolean {
  const ed = editingCoordinate.value
  if (ed === null) return false
  return ed.col === col && ed.row === row
}
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
          :class="['cell', { 'cell-selected': isCellSelected(col, row) }]"
          @click="selectCell({ col, row })"
          @dblclick="startEditing({ col, row })"
        >
          <template v-if="isEditing(col, row)">
            <input
              class="cell-input"
              :value="rawValues[cellId({ col, row })] ?? ''"
              @keydown.enter.stop="commitEdit({ col, row }, ($event.target as HTMLInputElement).value)"
              @blur="commitEdit({ col, row }, ($event.target as HTMLInputElement).value)"
              :ref="(el) => { if (el) (el as HTMLInputElement).focus() }"
            />
          </template>
          <template v-else>
            {{ rawValues[cellId({ col, row })] ?? '' }}
          </template>
        </td>
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
  cursor: default;
  position: relative;
}
.spreadsheet thead th,
.spreadsheet tbody th {
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  text-align: center;
}
.cell-selected {
  outline: 2px solid #2563eb;
  outline-offset: -2px;
  background-color: #eff6ff;
}
.cell-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: 2px solid #2563eb;
  padding: 0 6px;
  font: inherit;
  background: white;
  position: absolute;
  top: 0; left: 0;
}
</style>
```

Click ▶ Run. Double-click any cell — a focused input appears. Type something. Press Enter — the input disappears and the text shows. Double-click again — the input opens with the previous value ready to edit.

---

## Walkthrough — `v-if` vs `v-show` for the input

Two Vue directives conditionally show content. They work differently:

```html
<!-- v-if: adds and removes the element from the DOM -->
<input v-if="isEditing(col, row)" ... />

<!-- v-show: toggles CSS display:none — element always in DOM -->
<input v-show="isEditing(col, row)" ... />
```

This lesson uses `v-if`. The input element does not exist in the DOM when `isEditing` returns false. When `isEditing` returns true, Vue creates the element fresh. This is important for two reasons:

1. **Focus:** The `:ref` callback runs when the element is inserted. If the input persisted in the DOM (with `v-show`), the `:ref` callback would not re-run when editing starts, and `focus()` would not be called.
2. **Value reset:** Each time editing starts, the input receives the current `rawValues` entry via `:value="rawValues[...] ?? ''"`. If the input persisted, its own internal state might disagree with the stored value.

`v-if` creates and destroys the element on each transition — exactly the right behavior for a component that should always start fresh.

---

## Walkthrough — `@keydown.enter.stop`

```html
@keydown.enter.stop="commitEdit(...)"
```

This is three things chained together:

- `@keydown` — listen for the `keydown` event
- `.enter` — filter to only fire when the key is `Enter`  
- `.stop` — call `event.stopPropagation()` before the handler

The `.stop` modifier matters because a document-level `keydown` listener could also respond to Enter. Without `.stop`, pressing Enter inside the input would commit the edit (correct) *and* potentially trigger whatever the document-level listener does (possibly re-opening editing). `.stop` prevents the event from reaching any ancestor listeners after this handler finishes.

Compare with `@keydown.prevent`: that would call `event.preventDefault()`, which cancels the browser's default behavior for the keystroke (like form submission) but still lets the event bubble up. `stopPropagation` and `preventDefault` are different operations. You can use both: `@keydown.enter.prevent.stop`.

Run this throwaway to see the difference clearly:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      console.log('Document listener fired!')
    }
  })
})
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px; padding: 16px">
    <p>Type in each input and press Enter. Watch the console.</p>

    <!-- No modifier: document listener fires -->
    <input placeholder="No modifier — document fires" @keydown.enter="console.log('input handler')" />

    <!-- .stop: document listener does NOT fire -->
    <input placeholder=".stop — document does NOT fire" @keydown.enter.stop="console.log('input handler')" />
  </div>
</template>
```

Click ▶ Run, open the browser console. Type Enter in the first input: you see "input handler" AND "Document listener fired!" Type Enter in the second input: only "input handler". `.stop` consumed the event before it reached the document.

---

## Walkthrough — `:ref` for focus

```html
:ref="(el) => { if (el) (el as HTMLInputElement).focus() }"
```

`:ref` (with the colon) accepts a function. Vue calls this function when the element is mounted (inserted into the DOM) with the element as the argument, and calls it again with `null` when the element unmounts.

This specific callback: if `el` is truthy (the element just mounted), call `.focus()` on it. The `as HTMLInputElement` is a TypeScript type assertion — `:ref` types `el` as `Element | ComponentPublicInstance | null`; calling `.focus()` requires `HTMLInputElement`. The assertion tells TypeScript "trust me, this is an input element."

Why not just `autofocus`? The HTML `autofocus` attribute fires once, on first page load. When `v-if` destroys and recreates the input element, `autofocus` does not fire again. The `:ref` callback fires every time the element is inserted — once per double-click, which is what you want.

---

## Walkthrough — `@blur` for click-elsewhere commit

```html
@blur="commitEdit({ col, row }, ($event.target as HTMLInputElement).value)"
```

`blur` fires when the input loses focus — whether because the user clicked elsewhere, pressed Tab, or pressed Enter (which triggers `commitEdit` via `@keydown.enter.stop` first). 

**Does pressing Enter trigger `commitEdit` twice?**

Yes — but only when `blur` fires after the Enter handler. The Enter handler sets `editingCoordinate.value = null`, which removes the input from the DOM via `v-if`. Vue schedules the removal for the next DOM update. In practice, `blur` fires as the input is being removed. `commitEdit` runs a second time on the same coordinate, writing the same value to `rawValues`. The result is idempotent — storing the same value twice is harmless.

If you want to prevent the double call, you can check `editingCoordinate.value` in `commitEdit`:

```typescript
function commitEdit(coordinate: Coordinate, value: string): void {
  if (editingCoordinate.value === null) return    // already committed
  rawValues.value[cellId(coordinate)] = value
  editingCoordinate.value = null
}
```

This is not required for correctness but is cleaner for observability (you can log and see exactly when commits happen).

---

## The single write point

Both Enter and blur call `commitEdit`. Neither writes to `rawValues` directly. This is the same principle as lesson 02's `selectCell`: state changes happen through named functions. The template dispatches *what* happened (Enter, blur, double-click); functions decide *what that means* (commit the edit, start editing).

When lesson 04 needs to interpret a cell's text as a number or formula, there is exactly one function to update: `commitEdit`. No spread of logic to find and change across the template.

---

## What breaks without this

**Removing `rawValues` from `ref({})`—making it a plain `{}`:**

```typescript
const rawValues = {}   // not a ref
```

Typing into a cell and pressing Enter stores the value in `rawValues`. But Vue never re-renders because `rawValues` is not reactive — no ref to track. The input disappears (because `editingCoordinate` is still a ref), but the displayed text never appears. The value is stored but invisible.

**Removing `.stop` from `@keydown.enter.stop`:**

If the document has any `keydown` listener that responds to Enter (as this project adds in lesson 05), pressing Enter commits the edit and then triggers that listener. Depending on what the listener does, this causes a double action — sometimes harmless, sometimes immediately reopening the cell for editing.

**Using `v-show` instead of `v-if` for the input:**

The input element persists in the DOM with `display:none`. The `:ref` focus callback fires once when the input first mounts — not when editing starts. Subsequent double-clicks open the edit mode (setting `editingCoordinate`) but the input does not focus automatically. The user must click the input to type. Additionally, the input may retain stale internal DOM state between edits.

---

## Connect the pieces

```
App.vue
  <script setup>
    rawValues           ref<Record<CellId, string>>({})
                        — every cell's stored text; read and written via cellId()
    editingCoordinate   ref<Coordinate | null>(null)
                        — which single cell, if any, shows an input
    startEditing()      — sets editingCoordinate; template reacts
    commitEdit()        — stores value, clears editingCoordinate; one write point
    isEditing()         — pure; type narrowing guards null; used in v-if
  <template>
    @dblclick           — triggers startEditing
    v-if / v-else       — per-cell: input when editing, text otherwise
    @keydown.enter.stop — commits via Enter; .stop prevents double-trigger
    @blur               — commits when focus leaves the input
    :ref + focus()      — focuses the input the instant it mounts
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] Double-clicking a cell opens a focused input showing the cell's current value
- [ ] Typing a value and pressing Enter commits it and shows it in the cell
- [ ] Clicking away from an open input commits its value (blur)
- [ ] Reopening an edited cell shows the value you typed, not an empty input
- [ ] You can explain what `Record<CellId, string>` means and why `?? ''` is needed when reading from it
- [ ] You can explain the difference between `event.stopPropagation()` and `event.preventDefault()`
- [ ] You can explain why `v-if` is used instead of `v-show` for the input element

---

*Next: Lesson 04 — Numbers and Formulas Start. Typed values stop being just raw strings — `"42"` becomes a number, `"=A1+B2"` is marked as a formula — and this project defines the discriminated union type that everything from here on is built around.*
