# Formatting

## What you will build

A format bar above the grid with Bold, Currency, and Alignment buttons. Clicking a cell selects it. Clicking a format button applies formatting to that cell. The cell re-renders with the new style immediately — no refresh, no explicit update call.

```
[ B ] [ $ ] [ ← ] [ ↔ ] [ → ]     ← format bar
┌──────┬──────────┬──────┐
│  5   │  $10.00  │  15  │   ← B1 formatted as currency
└──────┴──────────┴──────┘
```

---

## What you need to know first

In lessons 1–4 we built the data model and formula engine. Each cell stored one value: a number or string. This lesson adds a second dimension: the cell's visual style (bold, currency, alignment). We expand the data model from a value to an object.

---

## The lesson

### The problem

Cells have two independent kinds of data: the **value** (what is computed and stored) and the **format** (how it is displayed). A cell's value changes when the user edits. A cell's format changes when the user clicks Bold or Currency. They change for different reasons and must not be stored together as one flat structure.

---

### Step 1 — The CellData type

**The problem:** We need a type that holds both the raw value and the visual format as separate, independently updatable fields.

```ts
// src/types/cell.ts

export type TextAlignment = 'left' | 'center' | 'right'

export interface CellFormat {
  bold: boolean
  currency: boolean
  alignment: TextAlignment
}

export interface CellData {
  raw: number | string    // what the user typed or a formula string
  format: CellFormat      // how this cell is displayed
}

export function defaultCell(value: number | string = ''): CellData {
  return {
    raw: value,
    format: { bold: false, currency: false, alignment: 'left' },
  }
}
```

**Walkthrough:** `CellFormat` describes the visual state — three fields, all with safe defaults. `CellData` wraps the raw value and its format together. `defaultCell(value)` creates a new cell object with `value` as the raw content and all format fields set to their defaults.

**What is a TypeScript `interface`?** An interface declares the shape an object must have. `interface CellData { raw: number | string; format: CellFormat }` means: any object of type `CellData` must have exactly these fields with these types. TypeScript checks every place a `CellData` is created or assigned — if `format` is missing or `raw` is the wrong type, it is a compile error. Interfaces have no runtime cost — TypeScript erases them before the JavaScript runs.

**`interface` vs `type`:** Both describe shapes. `interface` supports declaration merging (two `interface Foo` blocks combine) and is preferred for object shapes. `type` is more flexible (supports unions: `type Foo = A | B`) and is preferred for type aliases and union types. Use `interface` for object shapes; use `type` for everything else.

**`type TextAlignment = 'left' | 'center' | 'right'`:** A TypeScript string literal union — the type is one of three specific string values. TypeScript rejects `alignment: 'justify'`. This is a more precise type than `string`, and it prevents typos: `alignment: 'lefft'` is a compile error.

**`import type`:** When you write `import type { CellFormat } from '../types/cell'`, TypeScript knows this import is only for type checking — never a value that runs at runtime. `import type` imports are always erased from the compiled JavaScript. Use `import type` for interfaces and types; use regular `import` for values (functions, classes, constants).

**What is `defaultCell`?** A factory function — a function whose job is to create a new instance of a data type with safe default values. It ensures every new cell has the same starting state. Without it, any code creating a cell must manually specify all defaults — and if the defaults change, every place must be updated. With a factory function, there is one place to change.

**CS concept — data modelling:** Choosing the right data structure determines how complex every operation will be. A flat array of values (lessons 1–3) was sufficient for reading. Now we need formatting — adding it to the existing type would require every value access to be rewritten. Separating `raw` from `format` keeps each operation focused on one dimension.

**SE principle — Single Responsibility applied to data:** `raw` changes for one reason (user edit). `format` changes for another (user applies bold). They are separate fields. If we later add `validation` (a third reason to change), it becomes a third field — without touching `raw` or `format`.

**What breaks without separate `raw` and `format`:** If you encode format as part of the value string (e.g., `"bold:42"`), every operation that reads the value must parse the string to extract the number. Every operation that formats must reconstruct the encoded string. Two concerns are tangled in one string. Parsing it is fragile; bugs are inevitable.

---

### Step 2 — Update useSpreadsheet

**The problem:** `useSpreadsheet` currently works with `(number | string)[][]`. We need it to work with `CellData[][]`.

```ts
// src/composables/useSpreadsheet.ts (updated)
import { ref, computed } from 'vue'
import type { CellData, CellFormat } from '../types/cell'
import { defaultCell } from '../types/cell'

export function useSpreadsheet(initialValues: (number | string)[][]) {
  const cells = ref<CellData[][]>(
    initialValues.map(row => row.map(value => defaultCell(value)))
  )

  function updateCellValue(rowIndex: number, colIndex: number, newValue: string) {
    const parsed = parseFloat(newValue)
    cells.value[rowIndex][colIndex].raw = isNaN(parsed) ? newValue : parsed
  }

  function updateCellFormat(rowIndex: number, colIndex: number, patch: Partial<CellFormat>) {
    Object.assign(cells.value[rowIndex][colIndex].format, patch)
  }

  return { cells, displayData, updateCellValue, updateCellFormat }
}
```

**Walkthrough:** The initial values are converted from a flat 2D array to a `CellData[][]` at construction time using `defaultCell`. `updateCellValue` now writes to `cells.value[row][col].raw` instead of `cells.value[row][col]`. `updateCellFormat` applies partial format changes.

**What is `Partial<CellFormat>`?** `Partial<T>` is a TypeScript utility type that makes every property of `T` optional. `Partial<CellFormat>` means "an object with some or none of the CellFormat fields." This lets `updateCellFormat(0, 0, { bold: true })` work without requiring the caller to also specify `currency` and `alignment`. TypeScript provides several utility types: `Required<T>` (all fields required), `Readonly<T>` (all fields immutable), `Pick<T, K>` (subset of fields).

**What is `Object.assign(target, source)`?** A built-in JavaScript method that copies all enumerable own properties from `source` onto `target`. It returns `target`. `Object.assign(cells.value[0][0].format, { bold: true })` copies `bold: true` onto the existing format object — preserving `currency` and `alignment` unchanged. It mutates `target` in place.

**Why `Object.assign` and not direct assignment?** Direct assignment (`cells.value[0][0].format = { bold: true }`) replaces the whole format object — losing `currency` and `alignment`. `Object.assign` applies only the changed fields (the "patch") to the existing object. This is the "partial update" pattern used in every form system and REST API.

**What breaks if you store format as a CSS string:** `"bold currency"` cannot be queried as a boolean — `format.bold` does not exist. You must parse the string: `format.includes('bold')`. Parsing is fragile; adding a fourth format requires understanding the string format. Structured data is always easier to query than encoded strings.

---

### Step 3 — Format display values

**The problem:** Currency formatting (`$1,234.56`) should be applied to the displayed value, not to the stored raw value. The raw value must stay numeric so formulas still work.

```ts
function formatValue(value: number | string, format: CellFormat): string {
  if (format.currency && typeof value === 'number') {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    })
  }
  return String(value)
}
```

**Walkthrough:** `toLocaleString('en-US', options)` formats a number using locale-specific conventions. `style: 'currency'` with `currency: 'USD'` produces `"$1,234.56"`. `minimumFractionDigits: 2` ensures two decimal places even for whole numbers (`$10.00`, not `$10`).

**What is `Number.prototype.toLocaleString(locale, options)`?** A built-in method that converts a number to a locale-formatted string. `locale` is a BCP 47 language tag (`'en-US'`, `'de-DE'`, `'ja-JP'`). The `options` object controls the formatting style. This is the correct way to display numbers with locale-appropriate separators and currency symbols — not string concatenation (`'$' + value`), which produces `$1234.56` instead of `$1,234.56` and does not adapt to different locales.

**What breaks if you concatenate `'$'` directly:** `'$' + 10000` produces `$10000` — no thousands separator. European users expect `€10.000` (period as thousands separator). Japanese users expect `¥10,000`. `toLocaleString` handles all of these correctly; manual concatenation does not.

---

### Step 4 — Dynamic class binding with `:class`

**The problem:** The format bar buttons must show whether the current cell has bold, currency, or a specific alignment active. The active state must be reflected in the button's visual style.

```vue
<button
  :class="{ active: props.format?.bold }"
  :disabled="!props.format"
  @click="emit('bold')"
>
  <strong>B</strong>
</button>
```

**Walkthrough:** `:class="{ active: condition }"` is Vue's object class binding. The object's keys are CSS class names. When the value is truthy, the class is added; when falsy, it is removed. `{ active: props.format?.bold }` adds `active` to the element's class list when bold is enabled, removes it otherwise. Multiple classes can be toggled: `{ active: isBold, error: hasError }`.

**What is `:class` object syntax?** Different from `:class="className"` (which sets the class to the string) or `:class="[class1, class2]"` (which concatenates an array of class names). The object syntax `{ className: condition }` is for conditional CSS — adding a class only when a condition is true. This is the idiomatic Vue way to implement state-dependent visual styles.

**What breaks if you use inline `style` instead of `:class`:** Inline styles cannot be targeted by CSS `hover`, `focus`, or `active` pseudo-selectors. They are harder to override and make the template noisy. External classes keep style rules in the `<style>` section where they belong, and can be targeted by CSS selectors.

---

### Step 5 — Wire it all together in App.vue

```vue
<!-- src/App.vue — key additions -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import FormatBar from './components/FormatBar.vue'
import type { TextAlignment } from './types/cell'

const { cells, displayData, updateCellValue, updateCellFormat } = useSpreadsheet([...])

const selectedCell = ref<{ row: number; col: number } | null>(null)

const selectedFormat = computed(() =>
  selectedCell.value
    ? cells.value[selectedCell.value.row][selectedCell.value.col].format
    : null
)

function applyBold() {
  if (!selectedCell.value) return
  const { row, col } = selectedCell.value
  updateCellFormat(row, col, { bold: !cells.value[row][col].format.bold })
}

function applyAlignment(alignment: TextAlignment) {
  if (!selectedCell.value) return
  updateCellFormat(selectedCell.value.row, selectedCell.value.col, { alignment })
}
</script>

<template>
  <div class="spreadsheet">
    <FormatBar
      :format="selectedFormat"
      @bold="applyBold"
      @currency="() => { /* similar to applyBold */ }"
      @align="applyAlignment"
    />
    <Grid ... :selectedCell="selectedCell" @select-cell="(row, col) => selectedCell = { row, col }" />
  </div>
</template>
```

**Walkthrough:** `selectedCell` is a ref holding the selected row/column or `null`. `selectedFormat` is a computed that reads the format of the selected cell — when `selectedCell` changes, `selectedFormat` automatically returns the new cell's format. `FormatBar` receives `selectedFormat` as a prop and is disabled when it is `null` (nothing selected). The `@bold` handler toggles bold by calling `updateCellFormat` with the inverted current value.

**Why toggle bold with `!cells.value[row][col].format.bold` instead of a passed-in state from `FormatBar`?** `App.vue` is the source of truth. `FormatBar` signals the intent ("toggle bold"), not the new value ("set bold to true"). The toggle logic lives in the handler — next to the data it reads. This follows the "events signal intent, data flows down" principle.

**What breaks without `selectedFormat` as `computed`:** If it is a plain function, accessing it re-reads `cells.value` on every call — fine for a function, but the `FormatBar` would not know when to re-render. A `computed` creates a reactive dependency — when `selectedCell` or `cells` changes, the component reading `selectedFormat` automatically re-renders.

---

## Connect the pieces

`CellData` is now the central type of the spreadsheet. Every feature from this lesson forward builds on it. Undo/redo (lesson 11) stores `CellData` snapshots. Named ranges (lesson 8) resolve to ranges of `CellData`. The plugin system (lesson 12) accesses raw values from `CellData`. Getting the data model right here — separate `raw` from `format` — is what makes the remaining lessons clean to implement.

**In production:** Google Sheets uses exactly this architecture: cells have a "value" layer (formulas, raw values) and a "format" layer (number format, font, borders, background colour). They are stored and versioned separately. `toLocaleString` is the same API Google Sheets calls internally for number formatting.

---

## What breaks without this

**If you encode format as CSS class strings instead of structured data:** `isBold` becomes `format.includes('bold')` — string parsing. When you need to toggle bold, you must add `'bold'` if absent or remove it if present, manipulating a string. When you need `isBold` as a boolean in a `computed`, you parse the string every render. Structured booleans are O(1) to read, trivial to toggle, and impossible to mistype.

---

## Definition of done

- [ ] Clicking a cell highlights it and enables the format bar
- [ ] Bold button toggles bold on the selected cell; the button shows as active when bold is on
- [ ] Currency button formats the numeric value as `$X.XX`
- [ ] Alignment buttons change the cell's text alignment left/center/right
- [ ] Format bar is disabled when no cell is selected
- [ ] Formulas still work — `=A1+B1` still evaluates to the sum, currency-formatted if the format is set
- [ ] **Git commit:**

```
git add src/
git commit -m "Add formatting — CellData separates value from style; FormatBar toggles bold, currency, alignment"
```
