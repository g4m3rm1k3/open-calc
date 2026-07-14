# Vue Spreadsheet — Lesson 04 — Numbers and Text

## What you will build

Type `12` into a cell and it becomes a real number. Type `hello` and it stays text. Nothing about how you interact with the grid changes — you still double-click, type, and press Enter exactly as lesson 03 built. What changes is what this project *understands* about what it holds: every cell's value is now honestly one of two distinct, mutually exclusive shapes, and the type system knows the difference.

This is the most important type this project builds. Everything from lesson 05 onward adds a new shape to it.

---

## What you need to know first

Lesson 03 left `rawValues: ref<Record<CellId, string>>({})` storing whatever text was typed, displayed as-is. The template shows `rawValues[cellId(...)], ?? ''` — the same raw string you typed, nothing more.

---

## Step 1 — A type that is honestly one of two things

**The problem:** `rawValues` stores `"12"` and `"hello"` identically — both are strings. Nothing distinguishes a number someone wants to do arithmetic with from text that just happens to be sitting in a cell.

Replace `rawValues` in `<script setup>`:

```typescript
type Cell =
  | { kind: 'number'; value: number }
  | { kind: 'text';   value: string }

const cells = ref<Record<CellId, Cell>>({})
```

**Walkthrough — discriminated union:**

`Cell` is a union of two object types. Each object has a `kind` field set to one exact string — `'number'` on the first, `'text'` on the second. This tag field is what makes the union **discriminated**: given any real `Cell`, checking `kind` tells you exactly which shape you have, and therefore exactly what `value` contains.

To understand what this gains you, try this throwaway:

```vue
<script setup lang="ts">
type Cell =
  | { kind: 'number'; value: number }
  | { kind: 'text';   value: string }

function processCell(cell: Cell): string {
  switch (cell.kind) {
    case 'number':
      // Inside this case, TypeScript KNOWS cell.value is a number
      return cell.value.toFixed(2)          // ok
      // cell.value.toUpperCase()           // error: number has no toUpperCase

    case 'text':
      // Inside this case, TypeScript KNOWS cell.value is a string
      return cell.value.toUpperCase()       // ok
      // cell.value.toFixed(2)             // error: string has no toFixed
  }
}

const examples: Cell[] = [
  { kind: 'number', value: 3.14159 },
  { kind: 'text',   value: 'hello' },
]
</script>
<template>
  <ul>
    <li v-for="(c, i) in examples" :key="i">{{ processCell(c) }}</li>
  </ul>
</template>
```

Uncomment the error lines one at a time. TypeScript catches them before ▶ Run. A method that only exists on `number` is caught in the `number` case; a method only on `string` is caught in the `text` case. The `switch` on `kind` teaches TypeScript which branch it is in, and TypeScript enforces the type from there. This is type narrowing inside a `switch` — the same mechanism as the `if (sel === null)` guards from lesson 02, at a larger scale.

**Why both variants share the field name `value`:**

This is intentional. A `number` cell has `value: number`; a `text` cell has `value: string`. The same field name in both means any code that has already checked `kind` can read `.value` uniformly, regardless of which variant it turned out to be. This matters more when `Cell` grows a third shape in lesson 05.

**Why not just store `number | string`?**

```typescript
// Without the discriminated union:
const cells: Record<CellId, number | string> = {}
```

This works, barely, but has no structural tag. To display the value, you would check `typeof cell === 'number'`. That is one check, in one function. Now add a formula variant in lesson 05: `number | string | ???`. The formula has no number or string representation until it is evaluated — you would need a different check, inconsistent with the `typeof` pattern. The `kind` tag keeps all variants consistent from the start.

---

## Step 2 — Turn typed text into a real Cell

**The problem:** Nothing yet decides whether a freshly typed string should become a number or text.

Add to `<script setup>`:

```typescript
function parseRawInput(rawInput: string): Cell {
  const trimmed = rawInput.trim()
  const numericValue = Number(trimmed)

  if (trimmed !== '' && !Number.isNaN(numericValue)) {
    return { kind: 'number', value: numericValue }
  }

  return { kind: 'text', value: rawInput }
}
```

**Before reading the walkthrough, run these to see what `Number()` does:**

```vue
<script setup lang="ts">
const tests = [
  { input: '12',     result: Number('12')     },   // 12
  { input: '3.14',   result: Number('3.14')   },   // 3.14
  { input: '12abc',  result: Number('12abc')  },   // NaN
  { input: '',       result: Number('')        },   // 0  ← surprise!
  { input: ' 42 ',   result: Number(' 42 ')   },   // 42 (trims whitespace)
  { input: 'hello',  result: Number('hello')  },   // NaN
]
</script>
<template>
  <table>
    <tr v-for="t in tests" :key="t.input">
      <td><code>Number("{{ t.input }}")</code></td>
      <td>→ {{ t.result }}</td>
      <td>isNaN: {{ Number.isNaN(t.result) }}</td>
    </tr>
  </table>
</template>
```

Click ▶ Run. Notice the `''` row: `Number('')` is `0`, not `NaN`. That is why `parseRawInput` checks `trimmed !== ''` before the `Number.isNaN` check — clearing a cell's text should produce empty text, not the number zero.

**Walkthrough — `Number()` vs `parseFloat()`:**

`Number(string)` is strict: the entire string must be a valid number, or the result is `NaN`. `Number("12abc")` is `NaN`. `parseFloat("12abc")` is `12` — it stops at the first non-numeric character and returns what it parsed so far. For a spreadsheet cell, `"12abc"` is text someone typed, not the number 12 with garbage after it. `Number()` is the right choice.

**Walkthrough — `Number.isNaN` vs global `isNaN`:**

`Number.isNaN(value)` returns `true` only when `value` is the exact special `NaN` value. The older global `isNaN(value)` first converts its argument to a number before checking — `isNaN("hello")` is `true` (converts to NaN), but so is `isNaN(undefined)`, `isNaN({})`, and many others. `Number.isNaN` only answers the one question being asked: "is this value NaN?" Use `Number.isNaN` whenever checking for NaN.

---

## Step 3 — Display a cell, narrowing on its `kind`

**The problem:** The template currently shows `rawValues[...] ?? ''`. It needs to show a `Cell`'s content — but the template does not know which `kind` it has.

Add to `<script setup>`:

```typescript
function displayCell(cell: Cell | undefined): string {
  if (!cell) return ''

  switch (cell.kind) {
    case 'number':
      return cell.value.toString()
    case 'text':
      return cell.value
  }
}
```

Update `commitEdit` to use `parseRawInput` and `cells` instead of `rawValues`:

```typescript
function commitEdit(coordinate: Coordinate, value: string): void {
  if (editingCoordinate.value === null) return
  cells.value[cellId(coordinate)] = parseRawInput(value)
  editingCoordinate.value = null
}
```

Update the template: replace `rawValues[cellId({ col, row })] ?? ''` in both the input's `:value` and the display `{{ }}` with `displayCell(cells[cellId({ col, row })])`:

```html
<template v-if="isEditing(col, row)">
  <input
    class="cell-input"
    :value="displayCell(cells[cellId({ col, row })])"
    @keydown.enter.stop="commitEdit({ col, row }, ($event.target as HTMLInputElement).value)"
    @blur="commitEdit({ col, row }, ($event.target as HTMLInputElement).value)"
    :ref="(el) => { if (el) (el as HTMLInputElement).focus() }"
  />
</template>
<template v-else>
  {{ displayCell(cells[cellId({ col, row })]) }}
</template>
```

**Note:** In Vue templates, `ref` unwraps automatically at the top level — write `cells` not `cells.value` in the template.

Here is the complete file. Replace everything:

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

type Cell =
  | { kind: 'number'; value: number }
  | { kind: 'text';   value: string }

function columnLetter(col: number): string {
  return String.fromCharCode(65 + col)
}

function cellId(coordinate: Coordinate): CellId {
  return `${columnLetter(coordinate.col)}${coordinate.row + 1}`
}

function parseRawInput(rawInput: string): Cell {
  const trimmed = rawInput.trim()
  const numericValue = Number(trimmed)
  if (trimmed !== '' && !Number.isNaN(numericValue)) {
    return { kind: 'number', value: numericValue }
  }
  return { kind: 'text', value: rawInput }
}

function displayCell(cell: Cell | undefined): string {
  if (!cell) return ''
  switch (cell.kind) {
    case 'number': return cell.value.toString()
    case 'text':   return cell.value
  }
}

const columns = Array.from({ length: COLUMN_COUNT }, (_, col) => col)
const rows    = Array.from({ length: ROW_COUNT },    (_, row) => row)

const cells              = ref<Record<CellId, Cell>>({})
const selectedCoordinate = ref<Coordinate | null>(null)
const editingCoordinate  = ref<Coordinate | null>(null)

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
  if (editingCoordinate.value === null) return
  cells.value[cellId(coordinate)] = parseRawInput(value)
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
              :value="displayCell(cells[cellId({ col, row })])"
              @keydown.enter.stop="commitEdit({ col, row }, ($event.target as HTMLInputElement).value)"
              @blur="commitEdit({ col, row }, ($event.target as HTMLInputElement).value)"
              :ref="(el) => { if (el) (el as HTMLInputElement).focus() }"
            />
          </template>
          <template v-else>
            {{ displayCell(cells[cellId({ col, row })]) }}
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

Click ▶ Run. Type `12` into a cell — it shows as `12`. Type `hello` into another — text. Type `3.14` — number. Type `12abc` — text (not a number, even though it starts with digits). Clear a cell you've already filled — shows empty, not `0`.

---

## Walkthrough — `Cell | undefined` in `displayCell`

```typescript
function displayCell(cell: Cell | undefined): string {
  if (!cell) return ''
  ...
}
```

`cells.value[cellId(coordinate)]` — TypeScript says this returns `Cell`. But `Record<CellId, Cell>` is optimistic: it claims every key maps to a `Cell`, even keys no one has ever typed into. For unvisited cells, the runtime value is genuinely `undefined`.

`displayCell` accepts `Cell | undefined` and guards at the top. The `if (!cell) return ''` covers both `undefined` (cell never typed) and falsy objects (not possible here, but defensive). After the guard, `cell` is narrowed to `Cell`.

You can see this gap clearly by running:

```vue
<script setup lang="ts">
type Cell = { kind: 'number'; value: number } | { kind: 'text'; value: string }
import { ref } from 'vue'

const cells = ref<Record<string, Cell>>({})

// TypeScript says this is Cell — but at runtime it is undefined:
const unvisited = cells.value['Z99']
console.log('unvisited:', unvisited)   // undefined
console.log('type says:', typeof unvisited)  // "undefined"
</script>
<template><p>Check console</p></template>
```

`Record`'s index type claims certainty TypeScript cannot actually deliver. `Cell | undefined` is the honest type; `displayCell`'s `if (!cell)` is the honest guard.

---

## Walkthrough — the `switch` on `cell.kind`

```typescript
switch (cell.kind) {
  case 'number': return cell.value.toString()
  case 'text':   return cell.value
}
```

Inside `case 'number':`, TypeScript narrows `cell` to `{ kind: 'number'; value: number }`. Calling `.toString()` is safe. Calling `.toUpperCase()` would be a compile error — `number` has no `.toUpperCase()`.

Inside `case 'text':`, TypeScript narrows `cell` to `{ kind: 'text'; value: string }`. Calling `.toUpperCase()` is safe. Calling `.toFixed(2)` would be a compile error — `string` has no `.toFixed()`.

Try it:

```vue
<script setup lang="ts">
type Cell =
  | { kind: 'number'; value: number }
  | { kind: 'text';   value: string }

function displayCell(cell: Cell): string {
  switch (cell.kind) {
    case 'number':
      // Try uncommenting these to see TypeScript errors:
      // return cell.value.toUpperCase()   // error: number has no toUpperCase
      return cell.value.toFixed(2)         // ok: number has toFixed
    case 'text':
      // return cell.value.toFixed(2)      // error: string has no toFixed
      return cell.value.toUpperCase()      // ok: string has toUpperCase
  }
}

const cells: Cell[] = [
  { kind: 'number', value: 3.14159 },
  { kind: 'text',   value: 'hello' },
]
</script>
<template>
  <ul>
    <li v-for="(c, i) in cells" :key="i">{{ displayCell(c) }}</li>
  </ul>
</template>
```

The type system prevents calling a method that does not exist on the actual runtime type — caught before ▶ Run, not discovered as a runtime TypeError.

---

## What breaks without this

**Removing `trimmed !== ''` from `parseRawInput`:**

Open a cell, type `"hello"`, press Enter. Now reopen it, delete everything, press Enter. `Number('')` is `0` — the cell becomes the number `0` rather than empty text. A subtle, invisible data corruption.

**Using global `isNaN` instead of `Number.isNaN`:**

```typescript
if (trimmed !== '' && !isNaN(trimmed)) { ... }   // don't do this
```

`isNaN("  ")` is `true` (converts whitespace string to `NaN`). `Number.isNaN("  ")` is `false` (the string `"  "` is not literally `NaN`). With global `isNaN`, a cell containing only spaces would be stored as text. With `Number.isNaN`, it correctly parses as `Number("  ")` = `0` — but the `trimmed !== ''` check catches that before `Number.isNaN` is reached.

**Calling `cell.value.toUpperCase()` in the `'number'` case:**

TypeScript error immediately: *Property 'toUpperCase' does not exist on type 'number'*. This is the discriminated union protecting you — the type narrowing inside `case 'number':` made `cell.value` exactly `number`, and `number` does not have `toUpperCase`. Without the discriminated union (if `cell.value` were typed as `number | string`), this would compile and silently fail at runtime for number cells.

---

## Connect the pieces

```
App.vue
  <script setup>
    type Cell              — two variants: 'number' and 'text'
    cells                  ref<Record<CellId, Cell>>({})
    parseRawInput()        — pure; typed string → Cell; one write point
    displayCell()          — pure; Cell | undefined → string;
                             switch narrows per variant
    commitEdit()           — calls parseRawInput; stores in cells
  <template>
    displayCell(cells[cellId({ col, row })])
                           — same call in two places: input :value and
                             the text display branch
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] Typing a number stores it as `{ kind: 'number' }` — confirm by opening a typed cell and seeing the value ready for re-edit
- [ ] Typing text stores it as `{ kind: 'text' }`
- [ ] Typing `12abc` stores as text, not the number 12
- [ ] Clearing a cell's text stores as text `''`, not the number `0`
- [ ] You can trigger TypeScript errors by calling type-wrong methods inside the `switch` cases
- [ ] You can explain the difference between `Number.isNaN` and global `isNaN` using concrete examples
- [ ] You can explain why `displayCell` accepts `Cell | undefined` even though `Record<CellId, Cell>` claims to always return `Cell`

---

*Next: Lesson 05 — Formulas Appear. Typing `=anything` is recognised as a third kind of cell, stored distinctly, and displayed with its `=` restored. This is the lesson where `Cell` grows past two shapes — and where a new tool prevents `switch` statements from silently missing the new case forever.*
