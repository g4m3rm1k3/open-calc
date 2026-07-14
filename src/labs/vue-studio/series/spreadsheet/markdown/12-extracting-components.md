# Vue Spreadsheet — Lesson 12 — Extracting Components

## What you will build

The single `App.vue` file is split into three focused components: `SpreadsheetGrid.vue`, `CellDisplay.vue`, and `FormulaBar.vue`, plus one small shared file with no component of its own, `spreadsheet-context.ts`. All three components share the same reactive state — `cells`, `selectedCoordinate`, `editingCoordinate` — through `provide`/`inject`. The spreadsheet looks and behaves identically. The code is now five files with distinct responsibilities.

```
spreadsheet-context.ts  — shared types + the provide/inject key; depends on nothing else
App.vue
  provides: cells, selectedCoordinate, editingCoordinate, actions
  └── FormulaBar.vue  — shows and edits the selected cell's raw content
  └── SpreadsheetGrid.vue
        └── CellDisplay.vue (×60)  — per-cell rendering
```

---

## What you need to know first

Nothing beyond Lessons 01–11 of this series. Every file so far has been one file,
`App.vue`. This lesson introduces two ideas this series hasn't needed until now —
splitting a project across multiple component files, and `provide`/`inject` — both
explained here from scratch, the same as every other first appearance in this series.
This lesson does not change any behavior. It restructures existing code into components.

---

## Concept: what it means for one component to use another

Every `.vue` file this series has written is a **component** (Lesson 01 defined this:
a reusable, self-contained piece of UI, bundling logic with the markup that displays
it). Nothing so far has used more than one — `App.vue` has done everything, alone.
This lesson splits that single file into four: `App.vue`, `FormulaBar.vue`,
`SpreadsheetGrid.vue`, and `CellDisplay.vue`. Once split, `App.vue` needs to actually
*use* the other three — and a component uses another component by importing it, the
same `import` mechanism from Lesson 02, applied to a `.vue` file this time instead of
a named export from `'vue'` itself:

```typescript
import FormulaBar from './FormulaBar.vue'
```

This imports the entire component — everything `FormulaBar.vue`'s `<script setup>`,
`<template>`, and `<style>` define — as a single value, `FormulaBar`. Once imported, a
component can be written directly inside another component's `<template>`, as if it
were a new HTML tag:

```html
<FormulaBar />
```

This is not real HTML — no browser has ever heard of a `<FormulaBar>` element. Vue's
compiler (the same one that has been turning every `<template>` into DOM-building
JavaScript since Lesson 01) recognizes this as a reference to the imported component
and generates code that mounts `FormulaBar`'s own template, with its own reactive
state, right there. The `/>` self-closing form (no separate `</FormulaBar>`) is used
because, so far, this component takes no content between opening and closing tags —
the same self-closing convention as `<input />` in earlier lessons.

**The problem this raises immediately:** `FormulaBar`, `SpreadsheetGrid`, and
`CellDisplay` all need the same reactive state `App.vue` already owns —
`selectedCoordinate`, `cells`, and the dozen functions built across this series. The
straightforward fix — pass every one of them down as props (Step 5 explains what a
prop is, in full, when `CellDisplay` needs one) — works for one level, but
`SpreadsheetGrid` would then have to accept and immediately re-pass every single one
of those values down again to `CellDisplay`, just to relay them, never actually using
most of them itself. This is a real, named problem — **prop drilling**: passing a
value through several components that don't need it, purely so a component further
down the tree can reach it. `provide`/`inject` exists specifically to solve prop
drilling.

## Step 1 — Define the injection key

**Concept — `provide` and `inject`, before the typed key that refines them:**

`provide(key, value)`, called inside a component, makes `value` available to that
component and *every descendant of it in the component tree*, no matter how many
levels deep — without threading it through every intermediate component's props.
`inject(key)`, called inside any descendant, reaches upward through the component
tree and retrieves whatever the nearest ancestor provided under that same `key`. Think
of `provide` as posting a value to a shared board that only this component's own
subtree can see, and `inject` as reading from that board — any descendant can read it
directly, regardless of how many components sit in between.

**The problem:** `provide` and `inject` work with string keys, but string keys lose their TypeScript types. `InjectionKey<T>` fixes this.

**The problem underneath that problem — where does the key itself live?**

`App.vue` needs `SPREADSHEET_KEY` to call `provide`. `useSpreadsheet.ts` (Step 3) needs
that exact same `SPREADSHEET_KEY` to call `inject` — `provide`/`inject` only connect
two calls that pass the identical key value, so there can be only one
`SPREADSHEET_KEY` in the whole project, and both files need to reach it. The obvious
move — declare it in `App.vue` and have `useSpreadsheet.ts` import it from there —
creates a cycle. `App.vue` imports `FormulaBar.vue` (Step 2, to mount it),
`FormulaBar.vue` imports `useSpreadsheet.ts` (Step 4, to read shared state), and
`useSpreadsheet.ts` would import `SPREADSHEET_KEY` back out of `App.vue` — a chain
that ends where it started: `App.vue → FormulaBar.vue → useSpreadsheet.ts → App.vue`.
That is a **circular import**: a chain of imports that eventually loops back to a file
already partway through loading. It is not a rare mistake — any two files that both
need to reference a third thing, where at least one of them also reaches the other
through some unrelated path, produce one. The general-purpose fix is always the same:
pull the shared thing into its own file that depends on nothing else in the project.
Neither original file imports the other anymore; both import the new, dependency-free
file instead.

Create `src/spreadsheet-context.ts`:

```typescript
import type { InjectionKey, Ref, ComputedRef } from 'vue'

export interface Coordinate {
  readonly col: number
  readonly row: number
}

export type CellId = string

export type Cell =
  | { kind: 'number';  value: number }
  | { kind: 'text';    value: string }
  | { kind: 'formula'; expr: string  }

export interface SpreadsheetContext {
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

In `App.vue`, delete the local `interface Coordinate`, `type CellId`, and `type Cell`
declarations from Lessons 02 and 04 — they now live in `spreadsheet-context.ts` — and
import everything back in, plus `provide` itself:

```typescript
import { provide } from 'vue'
import type { Coordinate, CellId, Cell } from './spreadsheet-context.ts'
import { SPREADSHEET_KEY } from './spreadsheet-context.ts'
```

**Walkthrough — why the domain types (`Coordinate`, `CellId`, `Cell`) moved too, not just `SPREADSHEET_KEY`:**

`SpreadsheetContext` names `Coordinate`, `CellId`, and `Cell` in its own field types
(`Ref<Record<CellId, Cell>>`, and so on). A file can only reference a type it either
declares itself or imports — `spreadsheet-context.ts` cannot reach into `App.vue`'s
local declarations, so if those three types had stayed behind in `App.vue`,
`spreadsheet-context.ts` would have nothing to write inside `SpreadsheetContext`'s own
definition. Once one type moves to a shared file, everything that type's own
definition touches has to either move with it or already live somewhere both files can
reach. This is a real, common ripple effect of introducing a shared file late — one
reason to notice early when several files are converging on the same handful of types,
rather than discovering it mid-refactor.

**Walkthrough — `import type { InjectionKey } from 'vue'`, an import that only exists for the compiler:**

Every earlier import in this series pulled in something that exists at runtime — a
real function (`ref`, `computed`), a real component. `import type` is different: it
imports something that is *only* a type, never a value, and is guaranteed to produce
zero runtime code — the same "erased before the browser ever sees it" idea as
`interface` and `type` themselves from Lesson 01, made explicit in the import
statement itself. Writing `import { InjectionKey }` (without `type`) would technically
still work here, but `import type` documents, precisely and checkably, that this
import is compile-time-only — a reader (or the compiler, with strict settings) can
tell at a glance that nothing about this line survives into running code.

**Walkthrough — `Ref<...>` and `ComputedRef<...>` used as types, not called as functions:**

Every earlier use of `ref` and `computed` in this series has been a function *call* —
`ref(null)`, `computed(() => ...)`, producing a real reactive object. Inside
`SpreadsheetContext`, `Ref<Record<CellId, Cell>>` and `ComputedRef<Record<CellId,
string>>` are different: these are the *type names* of what those function calls
return, used here to describe what shape `cells` and `displayValues` will have once
injected. `Ref<T>` is the type of the wrapper object `ref(x)` produces — the "one
property, `.value`, holding a `T`" shape from Lesson 02. `ComputedRef<T>` is the
read-only equivalent for whatever `computed(() => ...)` returns. Declaring these as
types here is what lets every component that later injects `SpreadsheetContext`
retain full type-checking on `.value` reads, exactly as if the `ref` had been created
locally in that same file.

**Walkthrough — `InjectionKey<T>`:**

`InjectionKey<T>` is a `Symbol` branded with a type. A **`Symbol`** is one of
JavaScript's primitive types (alongside `string`, `number`, and `boolean`) whose
entire purpose is guaranteed uniqueness: `Symbol('spreadsheet')` creates a value that
is not equal to any other value in the entire program, ever — not even another
`Symbol('spreadsheet')` created with the identical text. This is exactly the property
`provide`/`inject` need for their `key`: a key that cannot accidentally collide with
some unrelated `provide` call elsewhere in a large app that happened to choose the
same string. `InjectionKey<T>` doesn't change what a `Symbol` *is* at runtime — it
still compiles down to a plain `Symbol()` call — it only adds a compile-time-only type
parameter, so that when you call `inject(SPREADSHEET_KEY)`, TypeScript knows the return type is `SpreadsheetContext | undefined` — not `unknown`. Without the typed key, `inject` returns `unknown` and every value you inject needs manual type assertions.

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

Import `FormulaBar` and `SpreadsheetGrid` at the top of `<script setup>`, from
`./components/`, matching where Steps 4 and 5 actually create those files:

```typescript
import FormulaBar from './components/FormulaBar.vue'
import SpreadsheetGrid from './components/SpreadsheetGrid.vue'
```

---

## Step 3 — `useSpreadsheet` composable

**The problem:** Every child component needs to call `inject(SPREADSHEET_KEY)` and guard the result. A composable handles this once.

**Why `src/composables/` and `src/components/` are two separate directories:**
Composables and components are two genuinely different kinds of file, and separating
them by folder makes that difference visible without reading any file's contents.
`src/components/` holds `.vue` files — units that render markup. `src/composables/`
holds plain `.ts` files — reusable reactive *logic* with no template of its own,
meant to be called from inside a component's `<script setup>`, not mounted as a tag.
A reader scanning the project's file tree can tell, from the folder alone, "this is
something I mount" versus "this is something I call."

Create `src/composables/useSpreadsheet.ts`:

```typescript
import { inject } from 'vue'
import { SPREADSHEET_KEY } from '../spreadsheet-context.ts'

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

**Walkthrough — what a composable is, and why this one exists:**

`useSpreadsheet` is this project's first **composable** — the Vue convention of
wrapping reusable reactive logic (here: "inject this context, and fail loudly with a
clear message if that's not possible") in a plain function whose name starts with
`use`. Nothing about the name `use...` is special to Vue itself — it's purely a
naming convention every Vue codebase follows, so that any function starting with
`use` immediately signals "this is composable logic, probably involving reactivity or
lifecycle hooks," the same way this project's own convention has always been that
`is...` functions return booleans. Without `useSpreadsheet`, every one of the three
child components would repeat the identical three lines — call `inject`, check for
`undefined`, throw a clear error — instead of one call to a function that does it
once, correctly, in one place (this project's single-write-point discipline from
Lesson 03, applied to reading shared state instead of writing it).

The guard (`if (!ctx) throw`) turns a confusing runtime error about undefined properties into a precise message naming the mistake. Without it, forgetting to mount a component inside `App.vue`'s tree would fail the first time that component tried to read `ctx.cells` — with an error like "Cannot read properties of undefined (reading 'cells')," pointing at the wrong line and giving no hint that the real problem is a missing ancestor `provide`.

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

**The Design lens — a formula bar deliberately styled unlike the grid:**

`.formula-input` sets `font-family: monospace`, the same reasoning as Lesson 06's
debug panel: a formula bar shows raw, exact formula text (`=A1+B2*5`), not a
rendered value — monospace signals "this is precise, literal text" the same way it
does in every code editor. `.cell-address`'s pale background and centered text treat
it as a *label*, not an input — sighted users learn at a glance that the address box
is read-only information and the wider box next to it is where typing happens,
without either one needing an explicit instruction. `:disabled="selectedCoordinate ===
null"` on the formula input is the same disabled-not-hidden affordance choice Lesson
11's Undo button made: the formula bar is always visible, always in the same place,
just inactive until a cell is selected — a user always knows it exists.

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

**Concept — what a prop is, and `defineProps`, this project's first appearance of both:**

A **prop** (short for "property") is a piece of data a parent component passes down
to a child component, explicitly, at the point it uses it — the component
equivalent of a function's parameter. `SpreadsheetGrid` writes `<CellDisplay :col="col"
:row="row" />` — the exact same `:name="expression"` attribute-binding syntax as
`:id` back in Lesson 01, just aimed at a component instead of an HTML element. Vue
recognizes that `CellDisplay` is a component, not a real HTML tag, and routes `col`
and `row` in as props rather than as literal HTML attributes.

`const props = defineProps<{ col: number; row: number }>()` is how `CellDisplay`
declares which props it accepts, and their types. `defineProps` looks like an
ordinary function call, but it is a **compiler macro** — a piece of syntax that only
works inside `<script setup>`, that Vue's compiler recognizes and replaces entirely at
compile time; it is never actually called as a real function at runtime, the way
`ref()` or `computed()` are. This is why it can accept a generic type argument
(`<{ col: number; row: number }>`) with no value argument at all — normal TypeScript
generics on a real function call still need real parentheses-passed arguments; a
macro is free to have whatever syntax the compiler is written to recognize. The
practical effect: `props.col` and `props.row` inside the template are fully typed,
read-only (a child component must never mutate a prop it was handed — that would let
a child silently change data the parent thinks it still controls), and Vue
automatically keeps them in sync with whatever `SpreadsheetGrid` passes down.

`CellDisplay` receives `col` and `row` as props from `SpreadsheetGrid`. All reactive state comes from `useSpreadsheet`. The `<td>` click handlers stay in `SpreadsheetGrid` — `CellDisplay` only handles rendering and edit-mode input.

---

## Walkthrough — data flow after extraction

Before extraction: `App.vue` owned everything. Template expressions read reactive state directly.

After extraction:

```
spreadsheet-context.ts
  - owns no state; exports only types and SPREADSHEET_KEY
  - depends on nothing else in the project (breaks the cycle)

App.vue
  - owns cells, selectedCoordinate, editingCoordinate, history
  - imports SPREADSHEET_KEY from spreadsheet-context.ts
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

**This entire lesson is a real, named Agile/engineering practice: a refactor.** A
**refactor** is a change that restructures existing code's internals without changing
its observable behavior — this lesson's own "What you will build" said it plainly:
"the spreadsheet looks and behaves identically." Nothing here was driven by a new
feature request; it was driven by the codebase itself outgrowing a single file. This
is also a real, deliberately-timed decision, not an accident of lesson ordering:
refactoring *now*, before Lesson 13 adds formatting, is easier than it would be
after — fewer places for new code to land wrong, fewer things to untangle at once. A
team that waits to refactor until a file is truly unmanageable pays far more for the
same restructuring than a team that does it while the pain is still small.

---

## What breaks without this

**Calling `useSpreadsheet()` in a component that is not a descendant of `App.vue`:**

`inject(SPREADSHEET_KEY)` returns `undefined`. The `if (!ctx) throw` guard throws immediately: "useSpreadsheet() must be called inside a component that is a descendant of App.vue." Without the guard, the first access to `ctx.cells` throws "Cannot read properties of undefined" — a confusing error pointing at the wrong line.

**Passing `cells` to `provide` without wrapping it in the context object:**

You could provide each value separately. But `provide` / `inject` require one key per value. With eight separate keys, every new value requires both a new `provide` call in `App.vue` and a new `inject` call in every child. The context object approach bundles all related values under one key — one `provide`, one `inject`, one typed interface.

**Declaring `SPREADSHEET_KEY` inside `App.vue` instead of `spreadsheet-context.ts`:**

The build fails before the app ever runs. `useSpreadsheet.ts` would need to import
`SPREADSHEET_KEY` from `App.vue`, but `App.vue` (through `FormulaBar.vue`) already
imports `useSpreadsheet.ts` — the circular import from Step 1. Depending on which file
finishes compiling first, the symptom is either a bundler error naming the cycle
directly, or `SPREADSHEET_KEY` silently being `undefined` in whichever file loaded
first, producing a confusing `inject()` failure that has nothing to do with the actual
mistake.

---

## Connect the pieces

```
spreadsheet-context.ts
  exports SPREADSHEET_KEY, SpreadsheetContext, Coordinate, CellId, Cell
  imports nothing project-local (breaks the cycle)

App.vue
  imports SPREADSHEET_KEY from spreadsheet-context.ts
  provides SPREADSHEET_KEY → SpreadsheetContext (all state + actions)
  mounts FormulaBar, SpreadsheetGrid

useSpreadsheet.ts
  imports SPREADSHEET_KEY from spreadsheet-context.ts
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
- [ ] You can explain prop drilling and why `provide`/`inject` avoids it, without looking back at this lesson
- [ ] You can explain what `defineProps` is and why it's called a compiler macro rather than a real function
- [ ] You can explain what a `Symbol` guarantees that a plain string key wouldn't
- [ ] You can explain what makes `useSpreadsheet` a composable and what problem it solves
- [ ] You can explain what a circular import is, and why `App.vue` and `useSpreadsheet.ts` needing the same key from each other would create one
- [ ] You can explain why pulling shared types into their own dependency-free file is a general fix for circular imports, not just a fix specific to `SPREADSHEET_KEY`

---

*Next: Lesson 13 — Formatting Cells. Bold, italic, color, and number formats are added as a design system rather than a grab-bag of CSS — including the first real accessibility work in this series: ARIA states, keyboard-focusable controls, and the contrast-ratio math behind "is this color legible."*
