# Vue Spreadsheet — Lesson 13 — Formatting Cells: A Design System, Not Just Colors

## What you will build

A small toolbar above the grid: **Bold** and *Italic* toggle buttons, six color swatches, and a number-format dropdown (Plain / Currency / Percentage). Select a cell, click **Bold** — its text turns bold. Pick a color — its text changes color. Type `0.15` into a cell set to Percentage format and it displays `15%`, while the number actually stored is still `0.15` — so a formula that references it still computes with `0.15`, not the text `"15%"`.

```
[ B ]  [ I ]  ● ● ● ● ● ●  [ Plain ▾ ]
    A          B          C
1 | $1,234.50 | 15%     | 42          |
```

This is the first lesson in the series about *appearance* rather than *computation* — and it is not a lesson about picking pretty colors. It is a lesson about a real engineering decision (where does "how a cell looks" live, separately from "what a cell holds") and a real design discipline (how do you know a color is legible, rather than guessing).

---

## What you need to know first

Lesson 12 split the single `App.vue` file into `App.vue` (owns state, `provide`s a `SpreadsheetContext`), `FormulaBar.vue`, `SpreadsheetGrid.vue`, and `CellDisplay.vue` — each injecting what it needs via `useSpreadsheet()`. `cells: Ref<Record<CellId, Cell>>` holds every cell's value; `displayValues: ComputedRef<Record<CellId, string>>` derives what each cell shows. This lesson adds a fourth component, `FormatToolbar.vue`, and a new piece of state that sits *alongside* `cells`, not inside it.

---

## Concept: a value and its appearance are two different questions

Right now, `cells.value['B1']` might be `{ kind: 'number', value: 0.15 }`. The number `0.15` is the cell's **value** — what it actually holds, what a formula referencing `B1` would read. Whether that `0.15` should be shown as `0.15`, or `15%`, or `$0.15`, is a completely different question: its **format**.

Every real spreadsheet keeps these separate. In Excel and Google Sheets, this is literally the "Format Cells" dialog — you can change how `0.15` is displayed a dozen times without the underlying number ever changing, and a formula like `=B1*2` always computes `0.3`, never `"15%"*2`. If formatting silently rewrote the stored value, every formula in every spreadsheet in the world would be one accidental format change away from silent corruption.

This is **separation of concerns** again — the same principle from Lesson 01's three-block `.vue` file and Lesson 08's `editableText`/`displayCell` split, now applied to *data* rather than *code*. The question "what is this?" and the question "how should this look?" are kept as two separate pieces of state, so that changing one can never accidentally change the other.

---

## Step 1 — A style type, stored separately from `Cell`

**The problem:** Nothing currently records how a cell should look. Adding `bold`, `italic`, `textColor`, and `numberFormat` fields directly onto the `Cell` union is possible — but every one of the four `Cell` variants (`number`, `text`, `formula`, plus anything future lessons add) would need to carry them, and every exhaustive `switch` over `Cell` (`displayCell`, `editableText`, the evaluator's cell lookups) would have style-related fields sitting in scope even though none of that code cares what color a cell is.

**Where `NumberFormat` and `CellStyle` live is not a free choice — Lesson 12 already decided it.**

`SpreadsheetContext` (Step 4, shortly) is about to gain fields typed `Record<CellId,
CellStyle>` and `(format: NumberFormat) => string`. Lesson 12 established the rule
this triggers: `spreadsheet-context.ts` cannot reference a type it doesn't declare or
import, so anything `SpreadsheetContext` names has to live somewhere
`spreadsheet-context.ts` can reach — the exact reasoning that moved `Coordinate`,
`CellId`, and `Cell` there in Lesson 12. `NumberFormat` and `CellStyle` follow the same
rule. `DEFAULT_STYLE`, `cellStyles`, and `styleFor` are not types, though — they're
runtime state and logic that belongs with the rest of `App.vue`'s state, so they stay
put.

Add to `spreadsheet-context.ts`:

```typescript
export type NumberFormat = 'plain' | 'currency' | 'percentage'

export interface CellStyle {
  readonly bold: boolean
  readonly italic: boolean
  readonly textColor: string
  readonly numberFormat: NumberFormat
}
```

Add to `<script setup>` in `App.vue` (and add `NumberFormat`, `CellStyle` to the `import type { ... } from './spreadsheet-context.ts'` line already there from Lesson 12):

```typescript
const DEFAULT_STYLE: CellStyle = {
  bold: false,
  italic: false,
  textColor: '#0f172a',
  numberFormat: 'plain',
}

const cellStyles = ref<Record<CellId, CellStyle>>({})

function styleFor(id: CellId): CellStyle {
  return cellStyles.value[id] ?? DEFAULT_STYLE
}
```

**Walkthrough — a second `Record`, parallel to `cells`:**

`cellStyles` is structurally identical to `cells` from Lesson 04 — the same `Record<CellId, ...>` pattern, keyed by the same `CellId` strings, but holding a completely different kind of value. This is deliberate. `cells` and `cellStyles` are two independent lookup tables that happen to share a key space. A cell can exist in `cells` with no entry in `cellStyles` (default appearance), or — after Lesson 11's undo/redo, hypothetically — retain its style even if its value is cleared. Keeping them separate means a `switch` over `Cell`'s `kind` never needs a `default` case added just because a style field changed; `assertNever` in `displayCell` stays exhaustive over exactly the same four checks it already had, untouched by anything this lesson adds.

**Walkthrough — `readonly` on every field, again:**

Every field is `readonly`, exactly like `Coordinate` back in Lesson 02. The reason repeats identically: this project's convention is to replace state, never mutate it in place, so that a single assignment to `cellStyles.value[id]` is the one moment Vue's reactivity needs to notice. `styleFor` never hands back something a caller could quietly edit.

**Walkthrough — `styleFor`'s `??`:**

`cellStyles.value[id]` is `CellStyle | undefined` for the same reason `cells.value[id]` was `Cell | undefined` back in Lesson 04 — `Record`'s index signature is optimistic about keys nobody has visited yet. `?? DEFAULT_STYLE` is the same defensive pattern from Lesson 04, applied to a new type: never-formatted cells look exactly like `DEFAULT_STYLE` (not bold, not italic, default color, plain numbers) without a single entry existing in `cellStyles` for them. Ninety-nine percent of a real spreadsheet's cells are never explicitly formatted; storing an entry only when something actually changes keeps `cellStyles` small.

---

## Step 2 — `formatNumber`, a pure function with an execution trace

**The problem:** `0.15` needs to become the text `"15%"` or `"$0.15"` depending on `numberFormat` — and this project already has a function, `assertNever`, whose whole job is making sure a `switch` like this one can never silently miss a case.

Add to `<script setup>`:

```typescript
function formatNumber(value: number, format: NumberFormat): string {
  switch (format) {
    case 'plain':
      return value.toString()
    case 'currency':
      return '$' + value.toFixed(2)
    case 'percentage':
      return (value * 100).toFixed(0) + '%'
    default:
      return assertNever(format)
  }
}
```

**`assertNever` again — its fourth appearance in this series, and this is the deepest one yet.** In Lesson 05 it protected a three-variant `Cell` switch. In Lesson 08 and 09 it protected `evaluate`'s node-kind switch and `applyOperator`'s operator switch. Here, it protects a switch over `NumberFormat` — a plain string-literal union with no `kind` tag at all, proof that exhaustiveness checking is not specific to discriminated unions with a tag field; it works on any finite union TypeScript can enumerate. Add a fourth format — `'scientific'`, say — and `assertNever(format)` refuses to compile until this `switch` grows a matching case.

**Execution trace — `formatNumber(0.15, 'percentage')`:**

```
formatNumber(0.15, 'percentage') is called
     ↓
switch (format) matches case 'percentage'
     ↓
value * 100  →  0.15 * 100  →  15
     ↓
(15).toFixed(0)  →  '15'   (toFixed always returns a string, rounded to 0 decimal places)
     ↓
'15' + '%'  →  '15%'
     ↓
formatNumber returns '15%'
```

**Walkthrough — `toFixed`, a method that has not appeared before:**

`value.toFixed(digits)` is a built-in method on every JavaScript number. It returns a *string* — not a number — formatted to exactly `digits` decimal places, rounding as needed. `(0.15 * 100).toFixed(0)` is `'15'`. `(1234.5).toFixed(2)` is `'1234.50'` — note the trailing zero `toFixed` adds to hit exactly two decimal places, which plain `.toString()` would never do (`(1234.5).toString()` is `'1234.5'`). This is exactly why `formatNumber`'s `'currency'` case uses `toFixed(2)` instead of `toString()`: currency should always show two decimal places, even for a whole-dollar amount like `5` → `'$5.00'`.

**Honest scope note — `Intl.NumberFormat`:** real production code does not hand-rebuild currency formatting. The browser ships a built-in API, `Intl.NumberFormat`, that handles locale-correct thousands separators, currency symbols for any world currency, and rounding rules that vary by locale — `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(1234.5)` produces `'$1,234.50'` with the comma included. This project's `formatNumber` is deliberately simplified so the *concept* (a pure function computing display text from a stored value) stays visible without `Intl`'s configuration surface competing for attention. Know that `Intl.NumberFormat` exists and is what you would actually reach for outside this lab.

---

## Step 3 — Toggle and set functions

**The problem:** Nothing yet changes an entry in `cellStyles`.

Add to `<script setup>`:

```typescript
function toggleBold(coordinate: Coordinate): void {
  const id = cellId(coordinate)
  const current = styleFor(id)
  cellStyles.value[id] = { ...current, bold: !current.bold }
}

function toggleItalic(coordinate: Coordinate): void {
  const id = cellId(coordinate)
  const current = styleFor(id)
  cellStyles.value[id] = { ...current, italic: !current.italic }
}

function setTextColor(coordinate: Coordinate, textColor: string): void {
  const id = cellId(coordinate)
  cellStyles.value[id] = { ...styleFor(id), textColor }
}

function setNumberFormat(coordinate: Coordinate, numberFormat: NumberFormat): void {
  const id = cellId(coordinate)
  cellStyles.value[id] = { ...styleFor(id), numberFormat }
}
```

**Walkthrough — `{ ...current, bold: !current.bold }`, updating one field of an object:**

`{ ...current, bold: !current.bold }` is the spread operator from Lesson 11's undo snapshots (`{ ...cells.value }`), used here for a new purpose: copy every field from `current` into a new object, then overwrite just `bold` with its opposite. JavaScript evaluates object literals left to right — if a later field with the same name appears, it wins. So `{ ...current, bold: true }` means "everything from `current`, except `bold`, which is `true` regardless of what `current.bold` was." This is how every field-level update happens in this project from now on: spread the old object, override the one field that changed. `readonly` on `CellStyle`'s fields is exactly what makes *editing* `current.bold` directly a compile error, and this spread pattern the only way TypeScript allows.

`toggleBold` is a **toggle**: `!current.bold` flips `true` to `false` and `false` to `true`. Click Bold on a cell — bold. Click again — not bold. No separate "on" and "off" functions are needed for a two-state value.

---

## Step 4 — Apply the style when rendering a cell

**The problem:** `cellStyles` exists and can be changed, but `CellDisplay.vue` does not read it yet.

Update `SpreadsheetContext` in `spreadsheet-context.ts` to expose the new pieces (not `App.vue` — `SpreadsheetContext` moved there in Lesson 12, along with everything its fields reference):

```typescript
interface SpreadsheetContext {
  // ...everything from Lesson 12, plus:
  cellStyles: Ref<Record<CellId, CellStyle>>
  styleFor: (id: CellId) => CellStyle
  toggleBold: (coord: Coordinate) => void
  toggleItalic: (coord: Coordinate) => void
  setTextColor: (coord: Coordinate, color: string) => void
  setNumberFormat: (coord: Coordinate, format: NumberFormat) => void
  formatNumber: (value: number, format: NumberFormat) => string
}
```

Add all six to the `provide(SPREADSHEET_KEY, { ... })` call, alongside everything Lesson 12 already provides.

In `CellDisplay.vue`, read the style and bind it:

```vue
<script setup lang="ts">
import { useSpreadsheet } from '../composables/useSpreadsheet.ts'

const props = defineProps<{ col: number; row: number }>()

const {
  cells, displayValues, editableText, isCellSelected, isEditing,
  commitEdit, cellId, styleFor,
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
    <span :style="{
      fontWeight: styleFor(cellId({ col: props.col, row: props.row })).bold ? 'bold' : 'normal',
      fontStyle: styleFor(cellId({ col: props.col, row: props.row })).italic ? 'italic' : 'normal',
      color: styleFor(cellId({ col: props.col, row: props.row })).textColor,
    }">
      {{ displayValues[cellId({ col: props.col, row: props.row })] ?? '' }}
    </span>
  </template>
</template>
```

**Walkthrough — `:style` with an object, the third binding shape you've now seen:**

Lesson 01 taught `:id="expression"` (an attribute bound to a string). Lesson 02 taught `:class="[..., {...}]"` (an array/object shorthand specific to CSS classes). `:style` accepts the same idea applied to inline CSS: an object where each **key** is a CSS property written in **camelCase** (`fontWeight`, not `font-weight`) and each **value** is what that property should be. Vue converts `{ fontWeight: 'bold' }` into the real inline style `style="font-weight: bold"` on the actual DOM element. camelCase is required here — JavaScript object keys cannot contain hyphens without quoting them (`'font-weight'` would also work, quoted, but every Vue project's convention is camelCase for `:style` and `:class` alike).

This is the same binding operator — the colon — doing the same job it always has: "evaluate this expression, use the result as the attribute's value," now producing a small object instead of a string.

**Why compute `styleFor(...)` three times instead of once?**

You could write `const style = styleFor(cellId(...))` once and reuse it. Vue templates re-evaluate every expression on every re-render regardless of how many times a value is referenced, so this is a readability choice, not a performance one at this scale — three short calls versus one `computed` per cell is a judgment call this lesson leaves as-is for now; a real project with thousands of formatted cells would likely hoist this into a `computed` inside `CellDisplay`, the same optimization Lesson 10 applied to `displayValues`.

**Note on number formatting:** this step applies `bold`/`italic`/`textColor` universally, but `numberFormat` only makes sense for `kind: 'number'` cells specifically — a `formula` cell's *result* is also a number and could reasonably be formatted too, but wiring `numberFormat` through `displayValues`'s evaluation pipeline is left as a deliberate scope cut for this lesson, not an oversight. `displayCell`'s `'number'` case is the one place to route through `formatNumber(cell.value, styleFor(id).numberFormat)` if you want to extend this yourself.

---

## Step 5 — `FormatToolbar.vue`, and why `<button>` is not optional

**The problem:** Nothing on screen lets you actually click Bold, Italic, a color, or a format.

Create `src/components/FormatToolbar.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useSpreadsheet } from '../composables/useSpreadsheet.ts'

const {
  selectedCoordinate, styleFor, cellId,
  toggleBold, toggleItalic, setTextColor, setNumberFormat,
} = useSpreadsheet()

const currentStyle = computed(() => {
  const sel = selectedCoordinate.value
  return sel ? styleFor(cellId(sel)) : null
})

const SWATCHES: ReadonlyArray<{ name: string; hex: string }> = [
  { name: 'Slate',   hex: '#0f172a' },
  { name: 'Red',     hex: '#b91c1c' },
  { name: 'Green',   hex: '#15803d' },
  { name: 'Blue',    hex: '#1d4ed8' },
  { name: 'Purple',  hex: '#7e22ce' },
  { name: 'Orange',  hex: '#c2410c' },
]

function onColorClick(hex: string): void {
  if (selectedCoordinate.value) setTextColor(selectedCoordinate.value, hex)
}

function onFormatChange(event: Event): void {
  if (!selectedCoordinate.value) return
  const value = (event.target as HTMLSelectElement).value as 'plain' | 'currency' | 'percentage'
  setNumberFormat(selectedCoordinate.value, value)
}
</script>

<template>
  <div class="format-toolbar" role="toolbar" aria-label="Cell formatting">
    <button
      type="button"
      class="toggle-button"
      :class="{ active: currentStyle?.bold }"
      :aria-pressed="currentStyle?.bold ?? false"
      :disabled="!selectedCoordinate"
      @click="selectedCoordinate && toggleBold(selectedCoordinate)"
    >B</button>

    <button
      type="button"
      class="toggle-button italic"
      :class="{ active: currentStyle?.italic }"
      :aria-pressed="currentStyle?.italic ?? false"
      :disabled="!selectedCoordinate"
      @click="selectedCoordinate && toggleItalic(selectedCoordinate)"
    >I</button>

    <div class="swatches">
      <button
        v-for="swatch in SWATCHES"
        :key="swatch.hex"
        type="button"
        class="swatch"
        :style="{ backgroundColor: swatch.hex }"
        :aria-label="'Set text color to ' + swatch.name"
        :aria-pressed="currentStyle?.textColor === swatch.hex"
        :disabled="!selectedCoordinate"
        @click="onColorClick(swatch.hex)"
      ></button>
    </div>

    <select
      class="format-select"
      aria-label="Number format"
      :disabled="!selectedCoordinate"
      :value="currentStyle?.numberFormat ?? 'plain'"
      @change="onFormatChange"
    >
      <option value="plain">Plain</option>
      <option value="currency">Currency</option>
      <option value="percentage">Percentage</option>
    </select>
  </div>
</template>

<style scoped>
.format-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.375rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}
.toggle-button {
  width: 28px;
  height: 28px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background: white;
  font-weight: bold;
  cursor: pointer;
}
.toggle-button.italic { font-style: italic; }
.toggle-button.active {
  background: #dbeafe;
  border-color: #2563eb;
}
.toggle-button:disabled { opacity: 0.4; cursor: default; }
.swatches { display: flex; gap: 4px; }
.swatch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
}
.swatch[aria-pressed="true"] { border-color: #0f172a; }
.swatch:disabled { opacity: 0.4; cursor: default; }
.format-select {
  height: 28px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 0 6px;
  font-size: 0.8rem;
}
</style>
```

Mount it in `App.vue`, above `SpreadsheetGrid`:

```html
<template>
  <FormulaBar />
  <FormatToolbar />
  <SpreadsheetGrid />
  ...
</template>
```

**Walkthrough — `ReadonlyArray<T>`, and `<select>`/`<option>`, two pieces of new syntax before the accessibility walkthroughs:**

`ReadonlyArray<T>` is to arrays what `readonly` (Lesson 02) is to object fields: a
type that permits reading (`SWATCHES[0]`, `SWATCHES.length`, looping with `v-for`)
but rejects, at compile time, anything that would mutate the array itself
(`SWATCHES.push(...)`, `SWATCHES[0] = ...`). `SWATCHES` is a fixed, hand-picked
palette — nothing in this project should ever add to or reorder it at runtime, and
`ReadonlyArray` turns that intention into a rule TypeScript enforces rather than a
comment hoping nobody changes it.

`<select>` and `<option>` are HTML's built-in dropdown elements — `<select>` is the
control itself; each `<option value="...">` inside it is one choice, with the text
between the tags shown to the user and `value` being what's actually read
programmatically when that option is chosen. Like `<button>`, `<select>` is a real,
native interactive element: it's keyboard-operable (arrow keys move between options
once focused, without a single line of code from this project) and understood by
screen readers as a dropdown, for the same reason `<button>` was non-negotiable
earlier in this lesson — using the semantically correct element is what makes
accessibility free instead of something to hand-build.

**Walkthrough — why every clickable control here is a real `<button>`, not a styled `<div>`:**

It would be entirely possible to write `<div class="toggle-button" @click="...">B</div>` — visually identical. It would also be a real accessibility failure, and this is worth understanding precisely rather than taking on faith. A `<button>` element gives you, for free, purely by using the correct HTML element:

1. **Keyboard focusability.** Pressing Tab moves focus to a `<button>` automatically. A `<div>` is not in the keyboard focus order at all unless you add `tabindex="0"` yourself.
2. **Keyboard activation.** Pressing Enter or Space activates a focused `<button>`, firing its click handler. A `<div>` does neither, unless you write your own `@keydown` handler to detect and react to those exact keys.
3. **Screen-reader semantics.** A screen reader announces a `<button>` as "Bold, button" (or "Bold, button, pressed" once `aria-pressed` is added) — a blind or low-vision user using assistive technology knows immediately that this is an interactive, clickable control. A `<div>` is announced as nothing in particular — generic, silent, indistinguishable from a paragraph of text.

Choosing the semantically correct HTML element is not a style preference. It is the difference between a control that is usable by keyboard and screen-reader users and one that silently excludes them, for zero extra code — `<button>` is not longer to type than `<div>`.

**Walkthrough — `aria-pressed`, ARIA's job in one attribute:**

`aria-pressed="true"` (Vue writes this from `:aria-pressed="currentStyle?.bold ?? false"`) is this project's first **ARIA attribute**. ARIA — **Accessible Rich Internet Applications** — is a set of HTML attributes, all prefixed `aria-`, whose entire job is communicating state and structure to assistive technology that a sighted user would otherwise infer purely from appearance. A sighted user looking at the Bold button sees it highlighted blue (`.active` class, from `:class="{ active: currentStyle?.bold }"`) and understands "bold is currently on for this cell." A screen-reader user cannot see the highlight. `aria-pressed="true"` gives them the exact same information, spoken aloud: "Bold, button, pressed." Every toggle button in this toolbar carries both signals — a visual one for sighted users, an ARIA one for everyone else — because neither signal alone reaches every user.

**Walkthrough — the color swatches have `aria-label`, not just a color:**

```html
:aria-label="'Set text color to ' + swatch.name"
```

A color swatch is a circle of pure color with no visible text — informative to a sighted user, meaningless to a screen reader with no text to read. `aria-label` supplies an invisible (to sighted users) text alternative: `"Set text color to Red"`. This is the same principle as an `<img alt="...">` attribute, applied to a button instead of an image — every piece of meaning conveyed purely through appearance needs a text equivalent somewhere, for a user who cannot perceive that appearance.

**Walkthrough — `role="toolbar"`:**

`role="toolbar"` on the wrapping `<div>` tells assistive technology "this group of controls is a toolbar" — a recognized UI pattern, letting screen readers announce it as a group and letting users navigate its buttons together rather than as unrelated, scattered controls on the page.

---

## Concept Lab — contrast ratio: the algorithm behind "is this color legible?"

**The problem this lab exists to isolate:** the six swatch colors above were not picked by eye. Each one was checked against a white background using a real, specified algorithm before being hardcoded. This lab builds that algorithm once, on throwaway data, so the "why these six colors, specifically" question has a real, computable answer rather than "they looked fine."

The **Web Content Accessibility Guidelines (WCAG)** — the standard nearly every accessibility rule in this lesson traces back to — define a precise formula for **contrast ratio** between two colors, and require a minimum ratio of **4.5:1** for normal-sized text to be considered legible for users with low vision or color-blindness.

Run this throwaway — it never enters the project:

```vue
<script setup lang="ts">
function channelLuminance(value255: number): number {
  const channel = value255 / 255
  return channel <= 0.03928
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4)
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
}

function contrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = relativeLuminance(...rgb1)
  const l2 = relativeLuminance(...rgb2)
  const lighter = Math.max(l1, l2)
  const darker  = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

const white: [number, number, number] = [255, 255, 255]

const tests = [
  { label: 'Slate  (#0f172a) on white', color: [15, 23, 42]    as [number, number, number] },
  { label: 'Light gray (#cbd5e1) on white', color: [203, 213, 225] as [number, number, number] },
]

const results = tests.map(t => ({
  label: t.label,
  ratio: contrastRatio(t.color, white).toFixed(2),
  passesAA: contrastRatio(t.color, white) >= 4.5,
}))
</script>
<template>
  <ul>
    <li v-for="r in results" :key="r.label">
      {{ r.label }}: {{ r.ratio }}:1 — {{ r.passesAA ? 'PASSES AA' : 'FAILS AA' }}
    </li>
  </ul>
</template>
```

Click ▶ Run. Slate-on-white comes out around `16.1:1` — passes easily. Light-gray-on-white comes out around `1.6:1` — fails badly; this is why none of this project's swatches are pale colors on the white grid background.

**Walkthrough — what this formula actually computes:**

`Math.pow(base, exponent)`, `Math.max(...values)`, and `Math.min(...values)` are three
more functions living in the `Math` namespace, the same kind of namespace object as
`String` back in Lesson 01 (`String.fromCharCode`) — a home for math-related
functions, reached with the same dot notation. `Math.pow(2, 4)` is `2` raised to the
4th power, `16`. `Math.max` and `Math.min` return whichever of their arguments is
largest or smallest — `Math.max(3, 7)` is `7`.

`channelLuminance` converts one 0–255 color channel into how much that channel *actually* contributes to perceived brightness — not linearly, because human vision and monitor gamma are both non-linear, which is what the branching formula (`/12.92` for very dark values, a power curve otherwise) corrects for. `relativeLuminance` combines red, green, and blue with different weights — `0.7152` for green, far higher than red or blue — because the human eye is measurably more sensitive to green light than to red or blue at equal intensity; this is a property of human color perception, not an arbitrary tuning constant. `contrastRatio` compares two luminances, always dividing the lighter by the darker (plus a small constant, `0.05`, to avoid dividing by exactly zero for pure black), which is why the result is always `≥ 1`, and why swapping which color is "text" and which is "background" gives the identical ratio.

**This lab is now finished — it is deleted and will not appear in the project again.** The project code does not compute contrast ratios at runtime; it uses a small, fixed, pre-checked palette. This is deliberate and mirrors real practice: a design system checks its colors *once*, at design time (often with exactly this kind of script, or a design tool's built-in checker), and then ships a small set of colors everyone can reuse with confidence — rather than asking every developer to re-derive "is this legible?" by eye, every time, for every color a user might pick.

*Recognized elsewhere:* this exact formula is what powers the contrast checker built into every modern browser's DevTools (inspect any text element and look for a contrast warning), Figma's and other design tools' built-in accessibility checks, and automated auditors like Lighthouse and axe that scan a whole page and report every text/background pair that fails WCAG. A number this project computed by hand, once, in twenty lines, is the same number every professional accessibility tool in the industry is built around.

---

## What breaks without this

**Storing `bold`/`italic`/`numberFormat` directly on the `Cell` union instead of in a separate `cellStyles` map:**

Every one of `Cell`'s current three variants (`number`, `text`, `formula`) would need those fields added, even though a `text` cell being "bold" has nothing to do with what makes it a `text` cell rather than a `number` cell. Every exhaustive `switch` over `Cell` — `displayCell`, `editableText`, every `assertNever` guard — becomes coupled to formatting concerns that have nothing to do with what those functions actually compute. A future change to formatting (adding underline, say) would force a diff across every one of those switches, even though none of their logic changed.

**Skipping `readonly` on `CellStyle`'s fields:**

`cellStyles.value[id].bold = true` would compile and appear to work — but it mutates the object in place rather than replacing it. If that same style object is ever shared or cached anywhere else (a future "copy formatting" feature, for instance), the mutation would silently affect both places. `readonly` forces the spread-and-replace pattern (`{ ...current, bold: true }`) that Lesson 02 established specifically to avoid this class of bug.

**Using `<div @click>` instead of `<button>` for the Bold toggle:**

Click it with a mouse — it still appears to work. Try to reach it with Tab from the keyboard — focus skips over it entirely, landing on the next real interactive element instead. A keyboard-only user (a real, common case: motor impairment, a broken trackpad, or simply a power user who never leaves the keyboard) cannot use the formatting toolbar at all. This is not a rare edge case being over-engineered for — it is the default behavior of the correct HTML element, lost by choosing the wrong one.

**Omitting `aria-pressed`:**

The Bold button still visually highlights when active — sighted mouse users notice nothing wrong. A screen-reader user tabs to the button and hears only "Bold, button" every time, with no way to know whether bold is currently on or off for the selected cell, forcing them to guess or take an action just to find out the current state.

---

## Connect the pieces

```
spreadsheet-context.ts
  export type NumberFormat  — 'plain' | 'currency' | 'percentage'
  export interface CellStyle — readonly bold, italic, textColor, numberFormat
  SpreadsheetContext extended with cellStyles, styleFor, toggleBold/Italic,
    setTextColor/NumberFormat, formatNumber

App.vue
  <script setup>
    (imports NumberFormat, CellStyle from spreadsheet-context.ts)
    DEFAULT_STYLE
    cellStyles                ref<Record<CellId, CellStyle>>({})
                              — parallel to cells; independent lookup table
    styleFor()                — pure; CellId → CellStyle; DEFAULT_STYLE via ??
    formatNumber()             — pure; (number, NumberFormat) → string;
                                assertNever guards exhaustiveness
    toggleBold/Italic()        — spread-and-replace one field
    setTextColor/NumberFormat()— spread-and-replace one field
  provides all of the above via SpreadsheetContext

FormatToolbar.vue
  useSpreadsheet() → reads currentStyle for selectedCoordinate
  <button :aria-pressed> ×2   — Bold, Italic toggles
  <button :aria-label> ×6     — color swatches, text alternative for color
  <select>                    — number format

CellDisplay.vue
  :style="{ fontWeight, fontStyle, color }"
                              — third binding shape, after :id and :class
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] Selecting a cell and clicking Bold makes its text bold; clicking again undoes it
- [ ] Clicking a color swatch changes the selected cell's text color
- [ ] Setting a cell's format to Percentage and typing `0.15` displays `15%`
- [ ] Tab through the toolbar using only the keyboard — every control receives focus and activates with Enter or Space
- [ ] Every toggle button's `aria-pressed` state is visible in the browser's element inspector and matches its visual highlight
- [ ] You can explain why `cellStyles` is a separate `Record`, not fields added to `Cell`
- [ ] You can explain what `aria-pressed` communicates and to whom
- [ ] You can compute, by hand or by re-running the contrast lab, why a pale gray would have failed as a swatch color

---

*Next: Lesson 14 — Testing. Every pure function this series has built since Lesson 01 — `columnLetter`, `tokenize`, `parse`, `evaluate`, `formatNumber` — gets proven correct with a hand-built test harness, including watching a real regression get caught the instant it's introduced.*
