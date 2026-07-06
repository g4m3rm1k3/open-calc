# Plugins

## What you will build

A plugin system. A plugin is a JavaScript object that registers custom formula functions. You load a plugin, and its functions become available in every formula. The statistics plugin adds `MEDIAN`, `STDEV`, and `PERCENTILE`. You can write your own.

```
// Built-in functions (lesson 8):
=SUM(A1:B3)   =AVERAGE(A1:B3)   =MAX(A1:B3)

// After loading the statistics plugin:
=MEDIAN(A1:B3)   =STDEV(A1:B3)   =PERCENTILE(A1:B3,90)
```

---

## What you need to know first

In lesson 8, the formula functions (`SUM`, `AVERAGE`, `MAX`, `MIN`, `COUNT`) were hard-coded in a `Record<string, (values: number[]) => number>` table. Every new function required editing the core composable. Plugins invert this: the core composable exposes a `registerPlugin(plugin)` function. External modules call it to add functions. The core never changes.

This is the Open/Closed Principle applied at the system level: the spreadsheet engine is open for extension (plugins can add anything), closed for modification (adding MEDIAN does not require editing `useSpreadsheet.ts`).

---

## The lesson

### The problem

Hard-coding every formula function in the engine creates a growing file that changes for unrelated reasons — adding a financial function, adding a statistical function, adding a string function all modify the same function table. The engine becomes a "God function" that knows too much. Plugins separate each domain of functions into its own module.

---

### Step 1 — The plugin interface

**The problem:** Define a contract that every plugin must satisfy. This contract is the only thing the engine knows about plugins — it never imports a specific plugin directly.

```ts
// src/types/plugin.ts

export interface SpreadsheetPlugin {
  name: string
  version: string
  functions: Record<string, FormulaFunction>
}

export type FormulaFunction = (
  values: number[],
  args: unknown[],
  context: PluginContext
) => number | string

export interface PluginContext {
  getCellValue: (key: string) => number | string | null
  allValues: () => number[][]
  currentCell: string | null
}
```

**Walkthrough:** `SpreadsheetPlugin` has a `name`, `version`, and a `functions` record — a map of function names to implementations. `FormulaFunction` accepts numeric values (the resolved range), raw formula arguments (for functions that take non-range args like `PERCENTILE(A1:B3, 90)`), and a context object that lets the plugin read any cell in the spreadsheet. `PluginContext` gives plugins power without exposing internals — they call `getCellValue('A1')` rather than accessing the `cells` array directly.

**What is `unknown`?** A TypeScript type that means "a value of any type, but I have not inspected it yet." Unlike `any`, `unknown` requires a type check before you can use the value. `args: unknown[]` means "an array of arguments we cannot predict the type of." A plugin that needs the second argument as a number must write `const pct = typeof args[1] === 'number' ? args[1] : 0`. TypeScript enforces this check. `unknown` is the safe version of `any` — use it for values from external sources where you cannot guarantee the type.

**What is `Record<string, FormulaFunction>`?** `Record<K, V>` is a TypeScript utility type: an object where every key is of type `K` and every value is of type `V`. `Record<string, FormulaFunction>` means: "an object with string keys and FormulaFunction values." This is the same as `{ [key: string]: FormulaFunction }` but shorter and more idiomatic. Introduced in lesson 8 with `Record<string, (values: number[]) => number>` — here we use it again with the richer `FormulaFunction` type.

**CS concept — interface contract (API design):** `SpreadsheetPlugin` is an interface in the software engineering sense — not just a TypeScript keyword. It defines what a plugin must provide without prescribing how. The engine depends on this interface, not on any specific plugin. This is the Liskov Substitution Principle: any object implementing `SpreadsheetPlugin` can be registered and will work correctly.

**SE principle — Open/Closed Principle at system level:** Extending the engine's formula library used to require editing `useSpreadsheet.ts`. Now it requires creating a new file that exports a `SpreadsheetPlugin` object. The engine file never changes. New functionality is added by addition, not modification.

**What breaks if `context` is not included:** Plugin functions can only compute results from the range values they receive. A function like `VLOOKUP` (look up a value from a different range) needs to read arbitrary cells — it cannot be implemented with only the range values. The `context` parameter future-proofs the interface for lookup functions, cross-reference functions, and custom validators.

---

### Step 2 — The plugin registry in useSpreadsheet

**The problem:** The engine needs a registry — a place to store all registered plugin functions and look them up by name during formula evaluation.

```ts
// src/composables/useSpreadsheet.ts — additions

import type { SpreadsheetPlugin, FormulaFunction } from '../types/plugin'

const pluginFunctions = ref<Record<string, FormulaFunction>>({})

function registerPlugin(plugin: SpreadsheetPlugin): void {
  const existing = Object.keys(pluginFunctions.value)
  const conflicts = Object.keys(plugin.functions).filter(
    name => existing.includes(name)
  )

  if (conflicts.length > 0) {
    console.warn(
      `Plugin "${plugin.name}" overrides existing functions: ${conflicts.join(', ')}`
    )
  }

  pluginFunctions.value = {
    ...pluginFunctions.value,
    ...plugin.functions,
  }
}

function getAllFunctions(): Record<string, FormulaFunction> {
  return {
    SUM: (values) => values.reduce((a, b) => a + b, 0),
    AVERAGE: (values) => values.reduce((a, b) => a + b, 0) / values.length,
    MAX: (values) => Math.max(...values),
    MIN: (values) => Math.min(...values),
    COUNT: (values) => values.length,
    ...pluginFunctions.value,  // plugin functions override built-ins if names conflict
  }
}
```

**Walkthrough:** `pluginFunctions` is a reactive `ref` holding all registered plugin function objects. `registerPlugin` merges the plugin's functions into `pluginFunctions.value` using the spread operator — existing keys are replaced, new keys are added. The built-in functions stay in `getAllFunctions()` as a baseline, with plugin functions spread after (plugin functions override built-ins).

**What is `Object.keys(obj)`?** Returns an array of all own enumerable property names (string keys) of `obj`. `Object.keys({ SUM: fn, AVERAGE: fn })` → `['SUM', 'AVERAGE']`. This is the standard way to iterate or inspect the keys of a plain object. `Object.values(obj)` returns the values; `Object.entries(obj)` returns `[key, value]` pairs.

**What is `Object.fromEntries(entries)`?** Converts an array of `[key, value]` pairs into a plain object. `Object.fromEntries([['a', 1], ['b', 2]])` → `{ a: 1, b: 2 }`. The inverse of `Object.entries`. Use it when you need to transform an object's values with `map` (which produces an array) and then convert back: `Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, transform(v)]))`.

**What is `Object.entries(obj)`?** Returns an array of `[key, value]` pairs for all own enumerable properties. `Object.entries({ a: 1, b: 2 })` → `[['a', 1], ['b', 2]]`. Commonly used with `for...of` to iterate both key and value: `for (const [name, fn] of Object.entries(plugin.functions)) { ... }`.

**What is `.filter(name => existing.includes(name))`?** `.filter(predicate)` returns a new array containing only elements for which `predicate` returns `true`. Here it selects function names from the new plugin that already exist in the registry. `.includes(name)` returns `true` if `name` is in the `existing` array. The result is an array of conflicting function names.

**What is `Array.prototype.flatMap(fn)`?** Calls `fn(element)` on each element, where `fn` returns an array, then flattens the result one level. `[1, 2, 3].flatMap(n => [n, n * 2])` → `[1, 2, 2, 4, 3, 6]`. Use `flatMap` when you need to map each element to zero, one, or many output elements. For the plugin system, `plugins.flatMap(p => Object.entries(p.functions))` would flatten all plugins' entries into one list.

**What breaks if `pluginFunctions.value = { ...pluginFunctions.value, ...plugin.functions }` is not reactive:** If `pluginFunctions` were a plain object (not a `ref`), spreading and reassigning would not notify Vue. Formula cells that call the plugin function would show `#ERROR` until the page reloads. Making it a `ref` means `getAllFunctions()` (which reads `pluginFunctions.value`) is called fresh on each `computed` evaluation.

---

### Step 3 — Error handling in formula evaluation

**The problem:** Plugin functions are user-supplied code. They may throw. We need to catch errors and show `#ERROR(message)` instead of crashing the entire formula evaluator.

```ts
function safeCall(
  fn: FormulaFunction,
  values: number[],
  args: unknown[],
  context: PluginContext
): number | string {
  try {
    const result = fn(values, args, context)
    if (typeof result !== 'number' && typeof result !== 'string') {
      return '#ERROR(plugin must return a number or string)'
    }
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return `#ERROR(${message})`
  }
}
```

**Walkthrough:** `safeCall` wraps the plugin function call in a `try/catch`. If the function throws, the error is caught and shown as a cell value — the rest of the spreadsheet is unaffected. If the function returns a type other than `number | string`, it is also treated as an error. The cell shows an informative message; no crash.

**What is `error instanceof Error`?** `instanceof` checks whether an object was created by a specific constructor. `error instanceof Error` returns `true` if `error` is an `Error` object (created with `new Error('message')` or any subclass). If the thrown value is not an `Error` (someone did `throw 'a string'` or `throw 42`), `instanceof Error` is `false`. The pattern `error instanceof Error ? error.message : String(error)` safely gets a string description in both cases.

**Why not just write `error.message`?** TypeScript types `error` in a `catch` block as `unknown` (since TypeScript 4.0). `unknown` does not have a `.message` property — TypeScript rejects `error.message`. The `instanceof Error` check narrows the type: inside the `if (error instanceof Error)` branch, TypeScript knows `error` has `.message`. This is the correct, type-safe pattern for error handling in TypeScript.

**What is `String(error)`?** Converts any value to its string representation. `String(42)` → `'42'`. `String(null)` → `'null'`. `String({ a: 1 })` → `'[object Object]'`. For non-Error thrown values, `String(error)` gives us something displayable even if not pretty.

**CS concept — defensive programming at system boundaries:** The plugin boundary is a trust boundary. Built-in code is trusted; plugin code is not. `safeCall` is a firewall: any exception from untrusted code is caught and transformed into a recoverable error state (`#ERROR`) rather than allowing it to propagate and crash the host. This pattern appears at every system boundary: DOM event handlers, timer callbacks, network response handlers, WebAssembly module calls.

**What breaks without `try/catch`:** A plugin function that throws (e.g., divides by zero, calls an undefined method) propagates the exception through `evaluateFormula`, through `displayData` (which is a computed that re-evaluates on every change), and ultimately crashes the Vue reactive update. The entire grid stops rendering. The user sees a blank spreadsheet with no indication of what went wrong.

---

### Step 4 — The statistics plugin

**The problem:** Show how a plugin is implemented — a self-contained module that exports a `SpreadsheetPlugin` object.

```ts
// src/plugins/statistics.ts
import type { SpreadsheetPlugin } from '../types/plugin'

export const statisticsPlugin: SpreadsheetPlugin = {
  name: 'Statistics',
  version: '1.0.0',
  functions: {
    MEDIAN: (values) => {
      const sorted = [...values].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid]
    },

    STDEV: (values) => {
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
      return Math.sqrt(variance)
    },

    PERCENTILE: (values, args) => {
      const pct = typeof args[0] === 'number' ? args[0] / 100 : 0.5
      const sorted = [...values].sort((a, b) => a - b)
      const index = pct * (sorted.length - 1)
      const lower = Math.floor(index)
      const upper = Math.ceil(index)
      return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
    },
  },
}
```

**Walkthrough:** `MEDIAN` sorts the values, finds the middle index, and returns the middle value (odd count) or the average of the two middle values (even count). `[...values].sort(...)` spreads into a new array before sorting — `sort` mutates in place, and we do not want to mutate the caller's array. `STDEV` computes the population standard deviation. `PERCENTILE` uses linear interpolation: `args[0]` is the percentile (90 for the 90th percentile); it divides by 100 to get a fraction, then linearly interpolates between the two surrounding sorted values.

**What is `[...values].sort((a, b) => a - b)`?** `sort(comparator)` sorts an array in place. The comparator `(a, b) => a - b` sorts numerically: negative return means `a` before `b`, positive means `b` before `a`. Without a comparator, `sort` converts values to strings — `[10, 2, 1].sort()` gives `[1, 10, 2]` (lexicographic order). Always pass a numeric comparator for numeric sorting.

**What is `(v - mean) ** 2`?** The `**` operator is JavaScript's exponentiation operator (ES2016). `x ** 2` is `x` squared — equivalent to `Math.pow(x, 2)`. Standard deviation formula: variance = average of squared deviations from the mean; standard deviation = square root of variance.

**What breaks if `values.sort(...)` mutates the original instead of `[...values].sort(...)`:** The caller's array (the resolved range values) is sorted. Every formula that re-evaluates using that range now operates on sorted data instead of the original cell order. `SUM` still works (order does not matter), but any function that depends on position (like cell order for a running total) would silently produce wrong results.

---

### Step 5 — Load a plugin from the UI

```vue
<!-- In App.vue or a PluginManager.vue component -->
<template>
  <div class="plugin-manager">
    <button @click="loadStatistics">Load Statistics Plugin</button>
    <div v-if="loadedPlugins.length > 0" class="loaded">
      Loaded: {{ loadedPlugins.map(p => p.name).join(', ') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { statisticsPlugin } from '../plugins/statistics'

const { registerPlugin } = useSpreadsheet()
const loadedPlugins = ref<Array<{ name: string }>>([])

function loadStatistics() {
  registerPlugin(statisticsPlugin)
  loadedPlugins.value.push({ name: statisticsPlugin.name })
}
</script>
```

**What breaks if `registerPlugin` is called twice with the same plugin:** Duplicate registration is harmless — the spread operator overwrites the same keys with the same values. The `conflicts` warning in `registerPlugin` will fire, but the functions still work correctly. The UI guard (`loadedPlugins`) prevents loading the same plugin twice visually.

---

## You finished the series

You have built a working spreadsheet from scratch in 12 lessons. Here is what you actually built and what you learned from each piece:

| Lesson | What you built | Core concept |
|--------|---------------|--------------|
| 1 | A rendered cell | Vue SFC, TypeScript, Vite, npm |
| 2 | A grid with reactive data | `ref`, `v-for`, `:key` |
| 3 | In-cell editing | `defineEmits`, `watch`, `nextTick`, template refs |
| 4 | Formula evaluation | `computed`, regex, composables, `new Function` |
| 5 | Cell formatting | TypeScript interfaces, `Object.assign`, `Partial<T>` |
| 6 | Selection panel | `provide/inject`, `Symbol`, `InjectionKey<T>` |
| 7 | Multiple sheets | `crypto.randomUUID()`, `Array.from`, stable identity |
| 8 | Named ranges & functions | `reduce`, `filter`, `findIndex`, upsert pattern |
| 9 | Formula bar | `watch` with `{ immediate: true }`, `v-model:propName` |
| 10 | Dependency graph | `Map`, `Set`, depth-first search, cycle detection |
| 11 | Undo/redo | TypeScript class, `private`, `onMounted`/`onUnmounted` |
| 12 | Plugin system | `unknown`, `instanceof Error`, Open/Closed Principle |

**Every concept you learned is real.** `ref`, `computed`, `watch`, `provide/inject`, `defineProps`, `defineEmits` — these are the Vue 3 Composition API. TypeScript generics, interfaces, `Partial<T>`, `Record<K,V>` — these appear in every production TypeScript codebase. `Map`, `Set`, depth-first search — these are the data structures you reach for when arrays are not the right tool.

The spreadsheet you built uses the same architecture as Google Sheets and Excel: a reactive cell store, a computed display layer, a formula evaluator, a dependency graph, and a plugin system. You did not simulate it — you built it.

---

## What to build next

The series gave you the vocabulary. Here are real extensions that use what you have learned:

- **Collaborative editing:** Replace `cells` with a `Y.js` shared type. Two browser tabs edit the same spreadsheet in real time — same architecture, real-time sync layer on top.
- **CSV import/export:** `FileReader` API reads a `.csv` file; `updateCellValue` populates the grid. Export: `cells.value.map(row => row.map(c => c.raw).join(',')).join('\n')`.
- **Charts:** Read a selected range, pass the values to `Chart.js` or `unovis`. The dependency graph (lesson 10) tells you when to re-render the chart.
- **Server-side persistence:** Replace `cells.value` with a Vue `watch` that POSTs changes to a REST API. The composable interface does not change.

Each of these is a new layer on the same foundation. You already understand the foundation.

---

## Definition of done

- [ ] `registerPlugin(statisticsPlugin)` makes `=MEDIAN(A1:B3)` work in a formula cell
- [ ] A plugin function that throws shows `#ERROR(message)` in the cell, not a crash
- [ ] `=PERCENTILE(A1:B3,90)` computes the 90th percentile of the range
- [ ] The Plugin Manager shows which plugins are currently loaded
- [ ] Calling `registerPlugin` twice with the same plugin does not produce duplicate functions
- [ ] **Git commit:**

```
git add src/
git commit -m "Add plugin system — SpreadsheetPlugin interface, safeCall error boundary, statistics plugin"
```
