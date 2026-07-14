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

**What a key-value pair is, and what a lookup table is, before the type that formalizes them:**

Every entry you've seen so far in an object literal — `{ col: 2, row: 4 }` from Lesson 01 — is a set of **key-value pairs**: `col` is a **key** (the name), `2` is its **value**. A **lookup table** is any data structure whose entire job is answering one question fast: "given this key, what value goes with it?" — no scanning, no searching, a direct jump straight to the answer. This project needs exactly that: given a cell's address (`"A1"`), find the text stored there. `rawValues` is about to become this project's first real lookup table.

**Walkthrough — `Record<K, V>`:**

`Record<CellId, string>` describes an object where every key is a `CellId` (from lesson 01: a meaningful alias for `string`) and every value is a `string`. It is shorthand for `{ [key: CellId]: string }` — a lookup table from cell addresses to text content.

`Record` is TypeScript's built-in **generic utility type** for this pattern. **Generic** means `Record` is written once, as a template, without committing to any specific types — the `<K, V>` part is that template's two blanks. You fill them in at the point you use it:

```
Record<K, V>              — the generic template, two blanks: K and V
        ↓ fill in K = CellId, V = string
Record<CellId, string>    — the specialized type this project actually uses
        ↓ TypeScript expands this, purely at compile time, to:
{ [key: CellId]: string } — an object type: any CellId key, every value a string
```

This is the same idea as a function parameter, one level up: `columnLetter(col: number)` doesn't commit to which number until it's called; `Record<K, V>` doesn't commit to which types until you write `Record<CellId, string>`. **At runtime, none of this exists** — a `Record<CellId, string>` is a perfectly ordinary JavaScript object, indistinguishable at runtime from `{}`. The generic type is a compile-time promise TypeScript checks on your behalf; the browser only ever sees a plain object.

Run this throwaway to understand what `Record` gives you — reading *and* writing:

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

**Walkthrough — `store['A1']`, square brackets instead of a dot:**

Every object property you've read so far used a dot: `coordinate.col`, `cell.value`. `store['A1']` uses square brackets instead — **bracket notation**, an alternative to dot notation that does the identical job (read or write one named field) with one crucial difference: the name inside the brackets can be a *variable*, not just a literal word typed into the source code. `store.A1` would only ever mean the one, fixed key `"A1"` — `store[cellId(coordinate)]` (used shortly, in Step 2) can mean a completely different key on every call, because `cellId(coordinate)` computes the key at runtime. Dot notation cannot do this — `store.cellId(coordinate)` would be nonsense, an attempt to read a property literally named `cellId` and then call it. Bracket notation is required the instant a key is computed rather than fixed.

**Walkthrough — what `store['A1'] = 'hello'` actually does:**

```
store['A1'] = 'hello' is executed
     ↓
JavaScript looks up the key 'A1' inside the store object
     ↓
Does 'A1' already exist as a key?
     ↓
  No  → a new key 'A1' is created on the object, holding 'hello'
  Yes → the existing value at 'A1' is overwritten with 'hello'
     ↓
store now contains { A1: 'hello', ...whatever else was already there }
```

This is worth being explicit about because it surprises people coming from languages
that require you to declare a key before writing to it: **plain JavaScript objects
never need that.** Assigning to a key that doesn't exist yet silently creates it. This
is exactly the behavior `rawValues.value[cellId(coordinate)] = value` relies on in
Step 2 — the very first time a cell is edited, its key does not exist in `rawValues`
yet, and the assignment creates it on the spot, no separate "add this key first" step
required.

**Why `ref<Record<CellId, string>>({})` starts as `{}`, specifically, and not `[]`,
`null`, or `new Map()`:**

- **Not `[]` (an array):** arrays are indexed by sequential numbers (`0`, `1`, `2`...).
  This project's keys are strings like `"A1"` and `"F10"` — there is no meaningful
  sequential position for a spreadsheet cell to occupy. Forcing cell addresses into
  array indices would require inventing a fake numbering scheme with no relationship
  to the grid.
- **Not `null`:** every write would first need to check "does this exist yet?" and
  create the object if not, on every single edit. Starting with a real, empty object
  means every future write is the same one-line operation, with nothing to guard.
- **Not `new Map()`:** a `Map` is a real, valid lookup table with some genuine
  advantages (guaranteed key order, `.size` instead of `Object.keys(...).length`,
  keys that aren't restricted to strings). It is deliberately not used here because
  Vue's most ergonomic reactivity — auto-unwrapping inside templates, JSON-based
  devtools inspection — is built around plain objects and arrays. `Map` support
  exists in Vue 3 but adds ceremony this project doesn't need. `{}` is the simplest
  structure that correctly answers this project's actual question.

**Walkthrough — `??`, evaluated precisely:**

`store['C2'] ?? ''` is JavaScript's **nullish coalescing operator**. It evaluates the
left side first. If that value is exactly `null` or exactly `undefined`, the
expression's result is the right side; the right side is never even evaluated
otherwise — this is called **short-circuiting**, the same idea as `&&` and `||`
already used earlier in this series (`sel && sel.col === col`), applied to a
different pair of "empty" values. `store['A1'] ?? ''` — `'A1'` exists, so the left
side is `'hello'`, a real value, and `??` returns it untouched. `store['C2'] ?? ''` —
`'C2'` was never written, so the left side is `undefined`, and `??` falls through to
`''`. `??` is not the same as `||`: `0 ?? 'fallback'` returns `0` (0 is not nullish),
while `0 || 'fallback'` returns `'fallback'` (0 is falsy). This project uses `??`
deliberately everywhere a legitimately falsy-but-real value (an empty string, the
number `0`) must never be mistaken for "missing."

The `??` note at the end of the throwaway is not cosmetic. `Record<CellId, string>` tells TypeScript "every value here is a string" — but for unvisited cells, the value genuinely is `undefined` at runtime. TypeScript's default settings do not flag this gap. `?? ''` defends against it explicitly.

**Walkthrough — `editingCoordinate: ref<Coordinate | null>(null)`:**

The same `Coordinate | null` union from lesson 02, applied to a second independent question: not *which* cell is selected, but *which* cell is currently showing a text input. The two can be different coordinates. They could even be the same cell — selecting B1 and then starting to edit it. `Coordinate`'s fields are still `readonly`, exactly as Lesson 02 defined them — this project's rule ("replace the whole object, never edit one field of an existing one") applies to every `Coordinate`-shaped value everywhere it appears, not just `selectedCoordinate`.

One more detail worth naming now, because a later lesson depends on it: `editingCoordinate.value = coordinate` stores the *same* `Coordinate` object `startEditing` was handed — not a copy. Two variables can now refer to the exact same object in memory. This is called **object identity**, and it is harmless here specifically because `Coordinate` is `readonly` — nothing can mutate the shared object through either reference, so it does not matter that they point to the same place. If `Coordinate` were mutable, this sharing would be a real hazard: changing the object through one reference would silently change what the other reference sees too.

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

**Execution trace — `rawValues.value[cellId(coordinate)] = value`, the line that makes editing actually work:**

This single line quietly does eight distinct things. None of them are magic; every one is a mechanical consequence of what came before:

```
rawValues.value[cellId(coordinate)] = value  is executed
     ↓
rawValues            → the ref object created by ref<Record<CellId,string>>({})
     ↓
.value               → unwraps the ref, exposing the real object it wraps —
                        this is the plain object Record<CellId,string> describes
     ↓
cellId(coordinate)   → a function call, evaluated first, producing e.g. 'B1'
     ↓
rawValues.value['B1'] → bracket-notation property lookup on that plain object
     ↓
= value              → assignment: 'B1' is created or overwritten with the typed text
     ↓
Vue's reactivity system notices this write happened on a value a ref is tracking
     ↓
Vue marks every template expression that reads rawValues.value as needing
     to re-run ("dirty")
     ↓
Before the next paint, Vue re-evaluates those expressions — the display branch's
     {{ rawValues[cellId({ col, row })] ?? '' }} now reads the new text
     ↓
The browser's DOM is updated: the cell shows the typed value
```

The step labeled "Vue's reactivity system notices" is doing real work you haven't
seen explained yet: Vue wraps a `ref`'s `.value` in code that runs on every read and
every write (this is called a **Proxy** in JavaScript — an object that can intercept
and react to operations performed on it — you are not required to know how a Proxy
is built to use one, only that this is the real mechanism, not magic). Every `.value`
read anywhere in this project — inside a template, inside a `computed` — is silently
registering "I depend on this" with Vue; every `.value` write is silently asking "who
depends on me, and needs to be told I changed?" This exact mechanism is what already
made Lesson 02's `selectCell` and `isCellSelected` work together with zero explicit
wiring between them, and it's the same mechanism here.

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

## The Design lens — an input that doesn't look like it arrived from somewhere else

```css
.cell-input {
  width: 100%; height: 100%; border: none;
  outline: 2px solid #2563eb; padding: 0 6px;
  font: inherit; background: white;
  position: absolute; top: 0; left: 0;
}
```

Three choices, each earning its place:

**`position: absolute; top: 0; left: 0`, sized `width/height: 100%` of its cell.**
The input is deliberately made to occupy *exactly* the space the cell's text
occupied a moment before. If the input instead appeared as a normal, differently-sized
box, the grid would visibly reflow around it — every cell after it would shift, and
the user's eye would lose track of which cell they were even editing. Making the edit
surface exactly replace the display surface, pixel for pixel, is what makes editing
feel like *modifying this cell* rather than *opening a separate box near this cell*.

**The browser mechanics `position: absolute` depends on, made explicit:** an element
with `position: absolute` is taken out of the page's **normal layout flow** entirely
— it no longer takes up space among its siblings, and its `top`/`left` no longer mean
"distance from where it would have naturally sat." Instead, they mean "distance from
the nearest ancestor that is itself positioned" (any ancestor with `position` set to
anything other than the default `static`). This is exactly why the `<td>` rule
already carries `position: relative` in the stylesheet: `relative` positioning
changes nothing about the `<td>`'s own layout, but it *does* make the `<td>` the
reference point every absolutely-positioned child measures against. Without
`position: relative` on `<td>`, the input's `top: 0; left: 0` would resolve against
the next positioned ancestor up the tree — possibly the whole page — and the input
would jump to the corner of the browser window instead of sitting inside its cell.

**`outline: 2px solid #2563eb` — the identical blue from Lesson 02's selection state,
reused, not reinvented.** This is the design principle called **consistency** (one of
Jakob Nielsen's ten usability heuristics, if you want the real name): once a color has
been taught to mean something to a user ("blue outline = this is the active thing"),
reusing it for a related-but-distinct state (now editing, not just selected) lets the
user transfer what they already learned instead of learning a second convention. Two
different blues for two related states would ask the user to notice and remember a
distinction most would never consciously register.

**`font: inherit`.** Without it, the browser's default input styling (usually a
slightly different, smaller font) would apply, and the text would visibly jump in size
the instant editing starts. `inherit` takes the font from the input's parent — the
`<td>` — so the transition from display text to edit text is visually silent.

## Walkthrough — `<template v-if>`, an element that never renders itself

```html
<template v-if="isEditing(col, row)">
  <input ... />
</template>
<template v-else>
  {{ rawValues[cellId({ col, row })] ?? '' }}
</template>
```

Both branches are wrapped in `<template>`, not `<div>`. This is a second, unrelated
meaning of the word `<template>` from the one you already know — Vue's outer
`<template>...</template>` (one per file) is the whole component's markup section;
this inner `<template v-if="...">` is a **Vue-specific wrapper element that never
produces a DOM node of its own.** Its only job is to give `v-if` (or `v-else`) a
single element to attach to when the content you want to conditionally show is more
than one element, without adding an extra, meaningless wrapper to the actual page. If
`<div v-if="...">` were used instead, an empty `<div>` would sit inside every `<td>`
in the DOM, contributing nothing but an extra layer — a real, if minor, case of what's
sometimes called "div soup." `<template>` here compiles away entirely; only its
children (the `<input>`, or the interpolated text) end up as real DOM nodes.

**Walkthrough — what actually happens when `isEditing(col, row)` flips:**

`v-if` is not "hide this, show that" — it is **branch replacement**: when the
condition changes, Vue destroys the DOM subtree for the branch that was showing and
constructs a brand-new subtree for the branch that should show now. Double-click a
cell: Vue destroys the small subtree that was just `{{ rawValues[...] }}` text and
constructs a new `<input>` element from scratch, right there. This is why the `:ref`
callback (below) reliably fires on every double-click — a freshly constructed element
always triggers it — and it is the mechanical reason `v-if` was chosen over `v-show`
in the comparison that follows.

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

## Walkthrough — double-click, and why a single `click` doesn't fire twice by accident

`@dblclick` reacts to the browser's `dblclick` event — but the browser does not
skip firing `click` on the way there. A real double-click physically fires this exact
sequence:

```
mousedown → mouseup → click     (first click)
mousedown → mouseup → click     (second click, close enough in time and position)
                     → dblclick (fired in addition to both clicks above)
```

Four events precede `dblclick`, not zero. This matters here because the `<td>` also
has `@click="selectCell(...)"`: double-clicking a cell calls `selectCell` twice (once
per `click`) and then `startEditing` once (for `dblclick`) — all three calls happen,
in that order, for one double-click. Nothing in this project currently guards against
that, and nothing needs to: `selectCell` is idempotent (selecting the same cell twice
in a row leaves the state identical), so the redundant calls are harmless. This is
worth knowing precisely rather than assumed, because a future interaction that is
*not* idempotent would need to account for it.

---

## Walkthrough — the browser Event object, `$event`, and why `.target` needs a type assertion

```html
@keydown.enter.stop="commitEdit({ col, row }, ($event.target as HTMLInputElement).value)"
```

Every time something happens in the browser that code might care about — a key
pressed, a click, a field losing focus — the browser constructs an **event
object**: a small bundle of information describing exactly what happened. A key
press specifically produces a `KeyboardEvent`, carrying (among other things) which
key was pressed (`event.key`). `$event` is Vue's special template variable: inside
any `@eventname="..."` handler expression, `$event` refers to that real event
object, the same one a plain `addEventListener` callback would receive as its
argument. You did not create `$event` — Vue makes it available automatically inside
event-handler expressions specifically.

`$event.target` is the DOM element the event actually happened on — here, the
`<input>` itself. TypeScript, though, does not know that in advance: `.target`'s
declared type is `EventTarget`, a very general type that covers anything capable of
receiving an event — an input, a button, even `window` or `document`. `EventTarget`
has no `.value` property, because most things it could refer to don't have one.
`(event.target as HTMLInputElement)` is a **type assertion** — exactly the same
mechanism as `(el as HTMLInputElement)` in the `:ref` callback below, and like every
type assertion in this series, it exists purely at compile time: TypeScript checks
your assertion is *plausible* and then trusts you, and by the time this code runs in
the browser, the assertion has been erased entirely — there is no runtime check, no
trace of `as HTMLInputElement` left anywhere. If you assert wrong (asserting `target`
is an `HTMLInputElement` when it's actually a `<button>`, say), TypeScript will not
catch it; you would only find out at runtime, calling `.value` on something that
doesn't have one. Use type assertions only when you are certain, from context, what
something actually is — here, this handler is only ever attached to an `<input>`, so
`event.target` inside it can only ever be that input.

This is three things chained together:

- `@keydown` — listen for the `keydown` event
- `.enter` — filter to only fire when the key is `Enter`  
- `.stop` — call `event.stopPropagation()` before the handler

The `.stop` modifier matters because a document-level `keydown` listener could also respond to Enter. Without `.stop`, pressing Enter inside the input would commit the edit (correct) *and* potentially trigger whatever the document-level listener does (possibly re-opening editing). `.stop` prevents the event from reaching any ancestor listeners after this handler finishes.

**Event bubbling, shown as a path, not just asserted:** an event fired on a deeply
nested element doesn't only notify that element — it travels ("bubbles") upward
through every ancestor, in order, unless something stops it:

```
<input>  (event fires here first)
   ↓
<td>
   ↓
<tr>
   ↓
<table>
   ↓
<body>
   ↓
document  (a listener here would be the last to hear about it)
```

`.stop` is a switch that cuts this path short at exactly the element it's written on
— the input's `keydown` handler still runs (it's the origin), but nothing above the
input on this chain will ever hear about this particular keypress.

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

## Walkthrough — `:ref` for focus, and what a callback actually is

```html
:ref="(el) => { if (el) (el as HTMLInputElement).focus() }"
```

`:ref` (with the colon) accepts a **function value** — not a function *call*. This
distinction is easy to blur and worth making precise, because it is one of the most
common beginner mistakes in any framework: `:ref="(el) => { ... }"` hands Vue the
arrow function itself, unexecuted, to be called *later*, whenever Vue decides the
moment is right (when the element mounts). Compare it to what would happen if you
wrote `:ref="focusInput()"` (with parentheses) instead — that would call
`focusInput` immediately, once, while the template is being evaluated, and hand
`:ref` whatever `focusInput()` *returned* — almost certainly not what you want. A
function handed over to be called later, by someone else, at a time of their
choosing, is called a **callback**. Every `@click`, every `:ref`, and `Array.from`'s
`mapFn` back in Lesson 01 are all callbacks — a function is a callback not because of
anything about how it's written, but because of *how it's used*: passed as a value,
invoked by whoever received it, not by whoever wrote it. A function that accepts
another function as one of its arguments — the way `:ref` does, the way `Array.from`
does — is called a **higher-order function**.

Vue calls this callback when the element is mounted (inserted into the DOM) with the element as the argument, and calls it again with `null` when the element unmounts.

This specific callback: if `el` is truthy (the element just mounted), call `.focus()` on it. The `as HTMLInputElement` is the same kind of type assertion just explained above — `:ref` types `el` as `Element | ComponentPublicInstance | null`; calling `.focus()` requires `HTMLInputElement`. The assertion tells TypeScript "trust me, this is an input element," and — like every assertion — is erased entirely by the time this code runs.

Why not just `autofocus`? The HTML `autofocus` attribute fires once, on first page load. When `v-if` destroys and recreates the input element, `autofocus` does not fire again. The `:ref` callback fires every time the element is inserted — once per double-click, which is what you want.

---

## Walkthrough — `@blur` for click-elsewhere commit

**Focus and blur, defined as the pair they are:** an element has **focus** when it is
the one currently receiving keyboard input — clicking an input, or tabbing to it,
gives it focus, shown (by default) with a browser-drawn outline. **Blur** is focus's
exact opposite: the moment an element *stops* being that target, because something
else received focus instead, or nothing did. Every focused element eventually blurs;
`@blur` is just a hook into the exact instant that happens for this input.

```html
@blur="commitEdit({ col, row }, ($event.target as HTMLInputElement).value)"
```

`blur` fires when the input loses focus — whether because the user clicked elsewhere, pressed Tab, or pressed Enter (which triggers `commitEdit` via `@keydown.enter.stop` first). 

**Does pressing Enter trigger `commitEdit` twice? Yes — traced mechanically, not just asserted:**

```
User presses Enter
     ↓
Browser constructs a KeyboardEvent, key: 'Enter'
     ↓
Vue's compiled keydown handler runs: .enter checks event.key === 'Enter' → matches
     ↓
.stop calls event.stopPropagation() — this event will not bubble past the input
     ↓
commitEdit({ col, row }, event.target.value) runs — value is stored, editingCoordinate.value = null
     ↓
Vue schedules a re-render (editingCoordinate changed, a ref write)
     ↓
On that re-render: isEditing(col, row) now returns false
     ↓
v-if's branch replacement destroys the <input>'s DOM node
     ↓
The browser, about to remove an element that currently has focus, fires blur
     on it first — this is a real, mandatory browser behavior, not a Vue choice
     ↓
Vue's compiled blur handler runs: commitEdit({ col, row }, event.target.value) again
     ↓
rawValues.value[cellId(coordinate)] is written a second time, to the same value
```

The double call is not a coincidence or a hidden bug — it is the browser's own
DOM-removal behavior (an element about to be destroyed while focused is blurred
first, unconditionally) combined with this component wiring `@blur` to the same
function as `@keydown.enter`. `commitEdit` runs a second time on the same coordinate, writing the same value to `rawValues`. The result is **idempotent** — running it twice produces the identical end state as running it once — so nothing is actually wrong, but knowing *why* it happens, mechanically, is what separates "I think this is fine" from "I know this is fine."

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

Both Enter and blur call `commitEdit`. Neither writes to `rawValues` directly.

```
Without a single write point:            With a single write point:

@keydown.enter → writes rawValues        @keydown.enter ─┐
@blur          → writes rawValues                        ├─→ commitEdit() → writes rawValues
some future feature → writes rawValues   @blur          ─┘
                                          some future feature ─┘
     ↓                                        ↓
Three places to remember to update       One place to update
when the storage rule changes            when the storage rule changes
(lesson 04's number/text split           (lesson 04 only touches commitEdit)
 would need finding all three)
```

This is the same principle as lesson 02's `selectCell`: state changes happen through named functions. The template dispatches *what* happened (Enter, blur, double-click); functions decide *what that means* (commit the edit, start editing).

When lesson 04 needs to interpret a cell's text as a number or formula, there is exactly one function to update: `commitEdit`. No spread of logic to find and change across the template.

**CS concept — this project just built its first finite state machine, formalized:**

Every cell has been quietly moving between exactly three states this whole lesson:

```
   Idle ──(double-click)──▶ Editing ──(Enter or blur)──▶ Committed
    ▲                                                          │
    └──────────────────────────────────────────────────────────┘
                    (Committed is immediately Idle again)
```

A **finite state machine** is a system with a fixed, enumerable set of states and
named transitions between them — exactly this diagram. `editingCoordinate` *is* the
state variable: `null` means every cell is Idle; a real `Coordinate` means exactly
that one cell is in the Editing state. `startEditing` and `commitEdit` are the only
two legal transitions — there is no code path that skips from Idle straight to
Committed, or that leaves two cells in Editing simultaneously (only one `Coordinate`
can be stored at a time). Recognizing this as a state machine, rather than "some
booleans and a function," is what makes it obvious *why* `editingCoordinate` is a
single `Coordinate | null` rather than, say, a `Set` of editing cells — the design
already assumed, correctly, that only one state transition can be in flight at once.

*Recognized elsewhere:* traffic lights, TCP connection states, every UI wizard with
"back/next" steps, regex engines, and — not coincidentally — Lesson 06's formula
tokenizer, which is itself a state machine reading one character at a time. Once you
can see this shape, you will keep finding it.

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
- [ ] You can explain the difference between a callback and an ordinary function call, using `:ref="(el) => ...focus()"` as your example
- [ ] You can trace, step by step, why pressing Enter calls `commitEdit` twice, without looking back at this lesson
- [ ] You can draw this lesson's three-state state machine (Idle / Editing / Committed) from memory
- [ ] You can explain why `position: relative` on `<td>` is required for the input's `position: absolute` to work correctly

---

*Next: Lesson 04 — Numbers and Formulas Start. Typed values stop being just raw strings — `"42"` becomes a number, `"=A1+B2"` is marked as a formula — and this project defines the discriminated union type that everything from here on is built around.*
