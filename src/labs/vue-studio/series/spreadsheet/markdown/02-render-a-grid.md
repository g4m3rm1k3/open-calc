# Vue Spreadsheet — Lesson 02 — Selecting a Cell

## What you will build

Click any cell and it highlights with a blue outline. Click a different one and the highlight moves — never two cells at once, never zero once you have clicked at least one. The selection is the first real state this spreadsheet tracks: one piece of reactive data whose change automatically updates the one cell that was deselected and the one that is now selected.

```
    A     B     C     D     E     F
1 |     |▓▓▓▓▓|     |     |     |     |   ← B1 selected
2 |     |     |     |     |     |     |
```

---

## What you need to know first

Lesson 01 left a 6×10 grid with sixty individually addressable cells, each with a `cell-A1`-style `id`. `columnLetter()`, `cellId()`, `columns`, `rows` — all of that carries forward unchanged.

---

## Step 1 — A type that can be "nothing"

**The problem:** Before any cell has been clicked, there is no coordinate to point at. Forcing one to exist anyway means inventing a fake "default" selection — a lie about what the user has actually done.

Add to `<script setup>`, below the imports:

```typescript
import { ref } from 'vue'

const selectedCoordinate = ref<Coordinate | null>(null)
```

**Walkthrough — `Coordinate | null`:**

`|` is TypeScript's **union operator**. `Coordinate | null` means "a `Coordinate` object, *or* the special value `null`, and nothing else." `selectedCoordinate.value` can legally hold `{ col: 2, row: 3 }` or `null`. Both are valid states.

This is not a workaround. It is the honest, complete description of every state this variable can be in. Starting it as `null` means the moment the page loads — before any click — is represented truthfully.

Run this throwaway to see TypeScript enforcing the union:

```vue
<script setup lang="ts">
interface Coordinate { readonly col: number; readonly row: number }
import { ref } from 'vue'

const sel = ref<Coordinate | null>(null)

// These are all legal:
sel.value = { col: 2, row: 3 }    // a real coordinate
sel.value = null                   // no selection

// TypeScript catches these:
// sel.value = { col: 'A', row: 1 }  // col must be number
// sel.value = { col: 2 }            // missing row
// sel.value = 0                     // not Coordinate or null

// Type narrowing — required before reading .col:
if (sel.value !== null) {
  console.log(sel.value.col)   // ok — TypeScript knows it is a Coordinate here
}
// console.log(sel.value.col)   // error outside the if — might be null
</script>
<template><p>{{ sel }}</p></template>
```

The last commented line is the key: outside the `if`, `sel.value` might be `null`, and TypeScript refuses to let you call `.col` on something that might be `null`. Inside the `if`, TypeScript has *narrowed* the type — it knows `sel.value !== null` has been proven true at that point, so `.col` is safe.

**Type narrowing, stated precisely:**

TypeScript tracks what a check *proves* about a type. After `if (sel.value !== null)`, inside that block, TypeScript knows `sel.value` is `Coordinate` — not `Coordinate | null`. The union collapses to just the non-null branch. This is type narrowing: a conditional check reduces what a type can be in the code that follows it.

TypeScript does this automatically based on the shape of your `if` check. You do not ask for it. It happens because TypeScript tracks the logical implications of conditions.

---

## Step 2 — Make coordinates immutable

**The problem:** Nothing prevents a future line from writing `selectedCoordinate.value.col = 99` — quietly mutating an existing coordinate instead of replacing it with a new one.

Update the `Coordinate` interface in `<script setup>`:

```typescript
interface Coordinate {
  readonly col: number
  readonly row: number
}
```

**Walkthrough — `readonly`:**

`readonly` on a property means it can be set once — when the object literal is first created — and never after. `readonly` does not prevent replacing `selectedCoordinate.value` with a new object entirely; it prevents *editing* the fields of the object already stored there.

To feel this distinction:

```vue
<script setup lang="ts">
interface Coordinate {
  readonly col: number
  readonly row: number
}
import { ref } from 'vue'

const sel = ref<Coordinate | null>(null)
sel.value = { col: 2, row: 3 }    // ok — replacing the whole value

// TypeScript catches this:
// sel.value.col = 5               // Cannot assign to 'col' because it is read-only

// To "change" col, replace the whole object:
if (sel.value) {
  sel.value = { col: 5, row: sel.value.row }   // ok — new object
}
</script>
<template><p>{{ sel }}</p></template>
```

This is the pattern this project will always use: when a coordinate changes, create a new one. Never mutate the existing one. `readonly` turns that convention into a compiler-enforced rule.

**Why replace instead of mutate?**

A new object has one clear moment of transition. Vue's reactivity detects any write to `selectedCoordinate.value` and schedules a re-render. Mutating a field inside the object could be missed by shallow watching, or produce confusing intermediate states. Replacement is simpler to reason about and integrates cleanly with Vue's reactive model.

---

## Step 3 — Selection state and click handling

**The problem:** Clicking a cell does nothing. `selectedCoordinate` exists but nothing updates it, and nothing in the template responds to it.

Add to `<script setup>`:

```typescript
function selectCell(coordinate: Coordinate): void {
  selectedCoordinate.value = coordinate
}

function isCellSelected(col: number, row: number): boolean {
  const sel = selectedCoordinate.value
  if (sel === null) return false          // type narrowing
  return sel.col === col && sel.row === row
}
```

`selectCell` is the entire update logic: assign the new coordinate. One line. In the HTML Lab version of this project, `selectCell` had to find the previous cell's DOM element, remove a CSS class from it, update the variable, find the new cell's DOM element, and add the class to it. In Vue, you update state. Vue updates the DOM.

`isCellSelected` is pure: given a column and row, return whether that cell is currently selected. The `if (sel === null) return false` line is type narrowing — after that guard, `sel` is known to be `Coordinate`, so `sel.col` is safe.

Now update the `<td>` in the template:

```html
<td
  v-for="col in columns"
  :key="col"
  :id="'cell-' + cellId({ col, row })"
  :class="['cell', { 'cell-selected': isCellSelected(col, row) }]"
  @click="selectCell({ col, row })"
></td>
```

Add to `<style>`:

```css
.cell-selected {
  outline: 2px solid #2563eb;
  outline-offset: -2px;
  background-color: #eff6ff;
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

const selectedCoordinate = ref<Coordinate | null>(null)

function selectCell(coordinate: Coordinate): void {
  selectedCoordinate.value = coordinate
}

function isCellSelected(col: number, row: number): boolean {
  const sel = selectedCoordinate.value
  if (sel === null) return false
  return sel.col === col && sel.row === row
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
  cursor: default;
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
</style>
```

Click ▶ Run. Click any cell — it highlights. Click another — the highlight moves. Before any click, no cell is highlighted.

---

## Walkthrough — what Vue does when `selectCell` runs

Follow the chain when you click cell B1 (`col=1, row=0`):

1. Browser fires a `click` event on that `<td>`
2. Vue calls `selectCell({ col: 1, row: 0 })`
3. `selectCell` writes `selectedCoordinate.value = { col: 1, row: 0 }`
4. Vue detects the write — `selectedCoordinate` is a `ref`, so `.value` writes are tracked
5. Vue marks every expression that *read* `selectedCoordinate.value` as dirty
6. Before the next paint, Vue re-evaluates all dirty expressions
7. `isCellSelected(col, row)` is re-evaluated for all sixty cells
8. For cell at `col=1, row=0`: `isCellSelected(1, 0)` returns `true` → `cell-selected` is added
9. For the previously selected cell: `isCellSelected` returns `false` → `cell-selected` is removed
10. Only two cells' DOM attributes changed — the other fifty-eight are untouched

This is the full reactive loop for one click. The DOM update in steps 8–9 requires no code on your part. It follows from the `:class` binding reading a reactive value.

---

## Walkthrough — `:class` with an array and an object

```html
:class="['cell', { 'cell-selected': isCellSelected(col, row) }]"
```

Vue's `:class` accepts several formats. Knowing all three lets you choose the right one:

```html
<!-- String: always applied -->
:class="'cell'"

<!-- Object: applied when truthy -->
:class="{ 'cell-selected': isCellSelected(col, row) }"

<!-- Array: combine both -->
:class="['cell', { 'cell-selected': isCellSelected(col, row) }]"
```

`'cell'` in the array means every `<td>` always has the class `cell`. The object conditionally adds `cell-selected`. You could also write:

```html
<td class="cell" :class="{ 'cell-selected': isCellSelected(col, row) }">
```

Both are correct. Vue merges static `class` and dynamic `:class` — they do not overwrite each other.

---

## The closure-in-loop problem (and why Vue avoids it)

The HTML Lab builds the same grid imperatively with `addEventListener`. Try this throwaway to see the classic bug:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  const container = document.getElementById('container')!

  // var is function-scoped — all listeners share the same variable
  for (var i = 0; i < 5; i++) {
    const btn = document.createElement('button')
    btn.textContent = `Button ${i}`
    btn.addEventListener('click', () => console.log('clicked:', i))
    container.appendChild(btn)
  }
  // By the time any button is clicked, i is 5 — every button logs 5
})
</script>
<template><div id="container" style="display:flex;gap:8px"></div></template>
```

Click ▶ Run. Click any button: the console always prints `clicked: 5`. Never 0, 1, 2, 3, or 4.

`var` is **function-scoped**: all five iterations share the exact same `i` variable. By the time any click fires — after the loop ends — `i` is `5`. Every listener closes over the same `i` and reads its current value at click time.

Now change `var i` to `let i`:

```vue
for (let i = 0; i < 5; i++) {
```

Click ▶ Run again. Each button logs its correct number. `let` is **block-scoped**: each iteration creates a fresh, independent `i` binding. The listener created in iteration 2 closes over iteration 2's own `i`. Later iterations cannot affect it.

**This bug cannot happen in Vue's `v-for`:**

```html
<button v-for="col in columns" @click="selectCell({ col, row })">
```

`v-for` always creates a new, scoped binding per iteration — the equivalent of `let`, never `var`. The closure bug is structurally impossible in a Vue template. Every `@click` handler captures the correct `col` for that cell.

---

## What breaks without this

**Removing `if (sel === null) return false` from `isCellSelected`:**

```typescript
function isCellSelected(col: number, row: number): boolean {
  const sel = selectedCoordinate.value
  return sel.col === col && sel.row === row   // TypeScript error
}
```

TypeScript underlines `sel.col`: *Object is possibly 'null'*. Before any click, `selectedCoordinate.value` is `null`, and `null.col` would be a runtime TypeError. The guard is not optional — it is what makes `sel.col` safe on the next line.

**Starting with `ref<Coordinate>({ col: 0, row: 0 })` instead of `ref<Coordinate | null>(null)`:**

Cell A1 appears selected before any click. The application lies about its state from the first render. Any UI that reacts to the selection — an info bar, a formula editor — would show A1's data immediately, as if the user had interacted. The `| null` initial value is the honest representation: nothing is selected yet.

**Writing `selectedCoordinate.value.col = newCol` instead of replacing:**

TypeScript: *Cannot assign to 'col' because it is a read-only property.* `readonly` catches this. The fix is always to create a new object: `selectedCoordinate.value = { col: newCol, row: selectedCoordinate.value.row }`.

---

## Connect the pieces

```
App.vue
  <script setup>
    selectedCoordinate  ref<Coordinate | null>(null)
                        — the one new state this lesson adds
    selectCell()        — replaces .value; Vue handles the DOM update
    isCellSelected()    — pure; returns boolean; type narrowing guards null
  <template>
    @click              — triggers selectCell; passes current { col, row }
    :class              — derives 'cell-selected' from isCellSelected()
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] Clicking any cell highlights it with a visible blue outline
- [ ] Clicking a second cell moves the highlight; the first cell deselects
- [ ] Before any click, no cell is highlighted
- [ ] You can explain what `Coordinate | null` means and why `null` is the correct initial value
- [ ] You can explain what `readonly` prevents and write the TypeScript error it produces
- [ ] You can explain type narrowing using `isCellSelected`'s `if (sel === null)` check as the example
- [ ] You can run the `var`-in-a-loop throwaway, reproduce the bug, and explain why `let` fixes it

---

*Next: Lesson 03 — Editing a Cell. Double-click a selected cell and an input appears. Type a value, press Enter, and it sticks — the first data this spreadsheet actually owns.*
