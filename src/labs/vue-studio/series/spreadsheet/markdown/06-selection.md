# Vue Spreadsheet — Lesson 06 — Tokenizing a Formula

## What you will build

Select a formula cell and a debug panel below the grid shows its token breakdown: `=A1+B2*5` becomes not one string but a structured list — `A1`, `+`, `B2`, `*`, `5` — each piece correctly identified as a cell reference, an operator, or a number. Select a non-formula cell and the panel resets. This is the first stage of a real interpreter, and you build it with no extra wiring — a `computed` property keeps the panel in sync automatically.

```
Tokens for =A1+B2*5:
[
  { "type": "cell",     "name": "A1" },
  { "type": "operator", "value": "+"  },
  { "type": "cell",     "name": "B2" },
  { "type": "operator", "value": "*"  },
  { "type": "number",   "value": 5    }
]
```

---

## What you need to know first

Lesson 05 left `Cell` with a `{ kind: 'formula'; expr: string }` variant. The `expr` field holds the formula's text with the leading `=` removed. Nothing yet looks inside that text at all.

---

## Concept: a computer does not "see" math

To you, `=A1+B2*5` is an equation. To this project right now, `cell.expr` is the string `"A1+B2*5"` — fourteen individual characters with no inherent structure. Before anything can add, multiply, or look up a cell, something has to answer a smaller question first: *what are the meaningful pieces this string is made of?* Is `A1` one thing or two? Is `5` a number or a stray digit?

This first stage is called **tokenizing**, or **lexing**. It converts a raw string into a list of **tokens** — the smallest meaningful pieces a language is built from. The same first stage sits at the front of every real programming language compiler, every database query parser, and every real spreadsheet.

---

## Step 1 — A type for what a token can be

**The problem:** Nothing describes what one meaningful piece of a formula looks like.

Add to `<script setup>`:

```typescript
type Token =
  | { type: 'number';   value: number }
  | { type: 'cell';     name: string  }
  | { type: 'operator'; value: '+' | '-' | '*' | '/' }
  | { type: 'paren';    value: '(' | ')' }
```

**Walkthrough — another discriminated union:**

`Token` has four variants, each tagged by `type`. A `'number'` token carries a real `value: number`. A `'cell'` token carries the cell's name as a string — `"A1"`, `"B12"`. An `'operator'` token's `value` is not just `string` — it is the union `'+' | '-' | '*' | '/'`, a **string literal type**: TypeScript will reject `{ type: 'operator', value: '%' }` because `'%'` is not in the permitted set.

Run this throwaway to see string literal types at work:

```vue
<script setup lang="ts">
type Op = '+' | '-' | '*' | '/'

// These are ok:
const a: Op = '+'
const b: Op = '*'

// TypeScript catches these:
// const c: Op = '%'         // not in the set
// const d: Op = 'plus'      // not in the set
// const e: Op = 'add'       // not in the set

// Using Op in a switch:
function describe(op: Op): string {
  switch (op) {
    case '+': return 'add'
    case '-': return 'subtract'
    case '*': return 'multiply'
    case '/': return 'divide'
  }
}
</script>
<template><p>{{ describe('+') }} — {{ describe('/') }}</p></template>
```

`Op` is a union of four string literals. Any value not in the set is a compile error. The `switch` is exhaustive — TypeScript can prove every case is covered without a `default: assertNever` because `Op` has exactly four members.

**Scope, stated honestly:**

This tokenizer handles exactly what this project's formulas need: numbers, cell references (`A1`, `B12`), the four basic arithmetic operators, and parentheses. Real spreadsheet languages have many more token kinds — string literals, comparison operators, sheet references, function names — none of which this project needs to teach what it is actually trying to teach.

---

## Step 2 — Scan the string, one character at a time

**The problem:** Nothing yet turns a string like `"A1+B2*5"` into a real `Token[]`.

Add to `<script setup>`:

```typescript
function isDigit(character: string): boolean {
  return character >= '0' && character <= '9'
}

function isUppercaseLetter(character: string): boolean {
  return character >= 'A' && character <= 'Z'
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = []
  let position = 0

  while (position < expr.length) {
    const character = expr[position]

    if (character === ' ') {
      position++
      continue
    }

    if (character === '+' || character === '-' || character === '*' || character === '/') {
      tokens.push({ type: 'operator', value: character })
      position++
      continue
    }

    if (character === '(' || character === ')') {
      tokens.push({ type: 'paren', value: character })
      position++
      continue
    }

    if (isDigit(character)) {
      let numberText = ''
      while (position < expr.length && (isDigit(expr[position]) || expr[position] === '.')) {
        numberText += expr[position]
        position++
      }
      tokens.push({ type: 'number', value: Number(numberText) })
      continue
    }

    if (isUppercaseLetter(character)) {
      let cellName = character
      position++
      while (position < expr.length && isDigit(expr[position])) {
        cellName += expr[position]
        position++
      }
      tokens.push({ type: 'cell', name: cellName })
      continue
    }

    throw new Error(`Unexpected character "${character}" in formula`)
  }

  return tokens
}
```

**Before reading the walkthrough, run this to see the tokenizer in action:**

```vue
<script setup lang="ts">
type Token =
  | { type: 'number';   value: number }
  | { type: 'cell';     name: string  }
  | { type: 'operator'; value: '+' | '-' | '*' | '/' }
  | { type: 'paren';    value: '(' | ')' }

function isDigit(c: string) { return c >= '0' && c <= '9' }
function isUppercaseLetter(c: string) { return c >= 'A' && c <= 'Z' }

function tokenize(expr: string): Token[] {
  const tokens: Token[] = []
  let position = 0
  while (position < expr.length) {
    const ch = expr[position]
    if (ch === ' ') { position++; continue }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      tokens.push({ type: 'operator', value: ch }); position++; continue
    }
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch }); position++; continue
    }
    if (isDigit(ch)) {
      let num = ''
      while (position < expr.length && (isDigit(expr[position]) || expr[position] === '.')) {
        num += expr[position++]
      }
      tokens.push({ type: 'number', value: Number(num) }); continue
    }
    if (isUppercaseLetter(ch)) {
      let name = ch; position++
      while (position < expr.length && isDigit(expr[position])) {
        name += expr[position++]
      }
      tokens.push({ type: 'cell', name }); continue
    }
    throw new Error(`Unexpected: "${ch}"`)
  }
  return tokens
}

const formulas = [
  'A1+B2*5',
  '(A1+B2)*5',
  'A1+52.5',
  'B12/C3',
]

const results = formulas.map(f => ({ formula: f, tokens: tokenize(f) }))
</script>
<template>
  <div v-for="r in results" :key="r.formula" style="margin-bottom:1rem">
    <strong>={{ r.formula }}</strong>
    <pre style="background:#f1f5f9;padding:8px;border-radius:4px;font-size:12px">{{ JSON.stringify(r.tokens, null, 2) }}</pre>
  </div>
</template>
```

Verify: `A1+B2*5` produces five tokens. `B12` is one `cell` token, not three separate tokens. `52.5` is one `number` token. Click ▶ Run and check the output.

**Walkthrough — `isDigit` and `isUppercaseLetter`, comparing characters directly:**

```typescript
function isDigit(character: string): boolean {
  return character >= '0' && character <= '9'
}
```

JavaScript compares strings **lexicographically** — character by character, using each character's Unicode code point number. `'0'` through `'9'` sit at consecutive code points (48–57). Any single character between them, inclusive, is a digit. `'A'` through `'Z'` sit at 65–90 — consecutive, so the same trick works.

This is the inverse of `String.fromCharCode` from lesson 01: there, you used a code point number to get a letter. Here, you use the character directly and compare against range boundaries.

**Walkthrough — `position`, the scanner's memory:**

`tokenize` reads through `expr` using a single index, `position`, advanced explicitly every time a character (or several) is consumed. This is the standard shape of a **scanner**: look at the character `position` currently points to, decide what it starts, consume however many characters that thing needs, advance `position` past all of them, then loop.

Whitespace is skipped — `position++` with nothing pushed — so `A1 + B2` and `A1+B2` tokenize identically.

**Walkthrough — multi-character tokens:**

A digit does not necessarily mean a one-digit number. `"52"` must become the single token `{ type: 'number', value: 52 }`, not two tokens `5` and `2`. The inner `while` loop keeps consuming characters — digits and a decimal point for numbers like `3.14` — for as long as they keep being part of the same number, accumulating `numberText` as a string before converting the whole thing to a real number once at the end.

Cell references work the same way: one uppercase letter, then as many following digits as exist. `"A1"`, `"B12"`, `"F10"` each become one `{ type: 'cell' }` token.

**Walkthrough — the `throw`:**

If `position` points at a character matching none of the cases — a lowercase letter, a stray symbol — `tokenize` throws immediately with the exact character named in the message. Silently ignoring an unrecognised character would be worse: a formula with a typo like `=a1+B2` would tokenize into something plausible-looking but wrong, surfacing only later as a confusing wrong result rather than a clear message.

---

## Step 3 — A debug panel using `computed`

**The problem:** `tokenize` works, but nothing shows its output.

In the HTML Lab version of this project, a separate `updateDebugPanel()` function was called manually from two places: from `selectCell` and from `commitEdit`. Every time those two functions ran, they had to remember to also update the debug panel.

In Vue, you do not call anything. A `computed` property reads whatever `selectedCoordinate` and `cells` currently hold and derives the debug output automatically. Vue re-evaluates it whenever those dependencies change.

Add to `<script setup>`:

```typescript
import { computed } from 'vue'

const debugTokens = computed<Token[] | null>(() => {
  const sel = selectedCoordinate.value
  if (sel === null) return null

  const cell = cells.value[cellId(sel)]
  if (!cell || cell.kind !== 'formula') return null

  try {
    return tokenize(cell.expr)
  } catch {
    return null
  }
})
```

Add to `<template>`, below the `</table>`:

```html
<div class="debug-panel" v-if="debugTokens !== null">
  <h3>Tokens for ={{ cells[cellId(selectedCoordinate!)]?.expr }}</h3>
  <pre>{{ JSON.stringify(debugTokens, null, 2) }}</pre>
</div>
<div class="debug-panel debug-empty" v-else>
  <p>(select a formula cell to see its tokens)</p>
</div>
```

Add to `<style>`:

```css
.debug-panel {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 6px;
  max-width: 500px;
}
.debug-panel h3 {
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}
.debug-panel pre {
  font-family: monospace;
  font-size: 0.75rem;
  white-space: pre-wrap;
  margin: 0;
}
.debug-empty p {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}
```

Here is the complete updated file. Add the new imports, types, and functions to the script block from lesson 05, then add the template and style additions above:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const COLUMN_COUNT = 6
const ROW_COUNT = 10

interface Coordinate {
  readonly col: number
  readonly row: number
}

type CellId = string

type Cell =
  | { kind: 'number';  value: number }
  | { kind: 'text';    value: string }
  | { kind: 'formula'; expr: string  }

type Token =
  | { type: 'number';   value: number }
  | { type: 'cell';     name: string  }
  | { type: 'operator'; value: '+' | '-' | '*' | '/' }
  | { type: 'paren';    value: '(' | ')' }

function columnLetter(col: number): string {
  return String.fromCharCode(65 + col)
}

function cellId(coordinate: Coordinate): CellId {
  return `${columnLetter(coordinate.col)}${coordinate.row + 1}`
}

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`)
}

function parseRawInput(rawInput: string): Cell {
  const trimmed = rawInput.trim()
  if (trimmed.startsWith('=')) return { kind: 'formula', expr: trimmed.slice(1) }
  const numericValue = Number(trimmed)
  if (trimmed !== '' && !Number.isNaN(numericValue)) return { kind: 'number', value: numericValue }
  return { kind: 'text', value: rawInput }
}

function displayCell(cell: Cell | undefined): string {
  if (!cell) return ''
  switch (cell.kind) {
    case 'number':  return cell.value.toString()
    case 'text':    return cell.value
    case 'formula': return '=' + cell.expr
    default:        return assertNever(cell)
  }
}

function isDigit(c: string): boolean { return c >= '0' && c <= '9' }
function isUppercaseLetter(c: string): boolean { return c >= 'A' && c <= 'Z' }

function tokenize(expr: string): Token[] {
  const tokens: Token[] = []
  let position = 0

  while (position < expr.length) {
    const ch = expr[position]

    if (ch === ' ') { position++; continue }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      tokens.push({ type: 'operator', value: ch })
      position++
      continue
    }

    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch })
      position++
      continue
    }

    if (isDigit(ch)) {
      let num = ''
      while (position < expr.length && (isDigit(expr[position]) || expr[position] === '.')) {
        num += expr[position++]
      }
      tokens.push({ type: 'number', value: Number(num) })
      continue
    }

    if (isUppercaseLetter(ch)) {
      let name = ch; position++
      while (position < expr.length && isDigit(expr[position])) {
        name += expr[position++]
      }
      tokens.push({ type: 'cell', name })
      continue
    }

    throw new Error(`Unexpected character "${ch}" in formula`)
  }

  return tokens
}

const columns = Array.from({ length: COLUMN_COUNT }, (_, col) => col)
const rows    = Array.from({ length: ROW_COUNT },    (_, row) => row)

const cells              = ref<Record<CellId, Cell>>({})
const selectedCoordinate = ref<Coordinate | null>(null)
const editingCoordinate  = ref<Coordinate | null>(null)

const debugTokens = computed<Token[] | null>(() => {
  const sel = selectedCoordinate.value
  if (sel === null) return null
  const cell = cells.value[cellId(sel)]
  if (!cell || cell.kind !== 'formula') return null
  try { return tokenize(cell.expr) } catch { return null }
})

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

  <div class="debug-panel" v-if="debugTokens !== null">
    <h3>Tokens</h3>
    <pre>{{ JSON.stringify(debugTokens, null, 2) }}</pre>
  </div>
  <div class="debug-panel debug-empty" v-else>
    <p>(select a formula cell to see its tokens)</p>
  </div>
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
.cell-selected { outline: 2px solid #2563eb; outline-offset: -2px; background-color: #eff6ff; }
.cell-input {
  width: 100%; height: 100%; border: none;
  outline: 2px solid #2563eb; padding: 0 6px;
  font: inherit; background: white;
  position: absolute; top: 0; left: 0;
}
.debug-panel {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 6px;
  max-width: 500px;
}
.debug-panel h3 {
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}
.debug-panel pre {
  font-family: monospace;
  font-size: 0.75rem;
  white-space: pre-wrap;
  margin: 0;
}
.debug-empty p { font-size: 0.75rem; color: #64748b; margin: 0; }
</style>
```

Click ▶ Run. Type `=A1+B2*5` into any cell and press Enter. Click that cell — the debug panel shows five tokens. Click a number or text cell — the panel resets to the placeholder message.

---

## Walkthrough — why `computed` vs calling a function from two places

In the HTML Lab version:

```typescript
// updateDebugPanel must be called from two places:
function selectCell(coordinate: Coordinate): void {
  selectedCoordinate = coordinate
  updateDebugPanel(coordinate)   // explicit call
}

function commitEdit(coordinate: Coordinate, rawInput: string): void {
  cells[cellId(coordinate)] = parseRawInput(rawInput)
  editingCoordinate = null
  renderCell(coordinate)
  updateDebugPanel(coordinate)   // explicit call again
}
```

Two places to remember. Miss one — commit an edit and the panel shows stale tokens. Add a third place where `cells` can change (paste, import, formula propagation) and you must remember to add the call there too.

In Vue:

```typescript
const debugTokens = computed(() => {
  const sel = selectedCoordinate.value
  if (sel === null) return null
  const cell = cells.value[cellId(sel)]
  if (!cell || cell.kind !== 'formula') return null
  try { return tokenize(cell.expr) } catch { return null }
})
```

Zero explicit calls. Vue tracks that `debugTokens` reads `selectedCoordinate.value` and `cells.value`. Any write to either — from `selectCell`, from `commitEdit`, from anything else — automatically invalidates `debugTokens` and schedules a re-evaluation. The panel is always in sync without any coordination code.

**This is what `computed` is for:** a value that is a pure function of other reactive state. `debugTokens` is exactly that — its value is completely determined by `selectedCoordinate.value` and `cells.value`. No other state matters, no timing matters, no call order matters.

---

## Walkthrough — `try/catch` inside `computed`

```typescript
try {
  return tokenize(cell.expr)
} catch {
  return null
}
```

`tokenize` throws for unrecognised characters (lowercase letters, stray symbols). Inside a `computed`, an uncaught throw produces a Vue error and leaves the computed in a broken state. The `try/catch` handles the error gracefully — an invalid formula shows `null` (the panel says "select a formula cell...") instead of crashing the component.

Lesson 09 (error handling) will display formula errors explicitly. For now, `null` is the correct "failed to tokenize" return value.

---

## What breaks without this

**Replacing the inner `while` that builds `numberText` with a single character read:**

`"52"` produces two tokens: `{ type: 'number', value: 5 }` and `{ type: 'number', value: 2 }`. The formula `=52+1` would be silently interpreted as `5 + 2 + 1 = 8`, not `52 + 1 = 53`. A multi-digit number becomes multiple single-digit tokens. No error appears — the tokenizer succeeds — but the parser in lesson 07 would evaluate the wrong formula.

**Removing the `throw` for unrecognised characters:**

Type `=a1+B2` (lowercase `a`). Without the `throw`, the lowercase `a` is silently skipped. The token list becomes `[B2]` — a formula that the evaluator interprets as "the value of B2," not "A1 plus B2." A typo produces a wrong result with no indication anything went wrong.

**Removing `try/catch` from `computed`:**

Type `=a1` (lowercase `a`) into a cell and select it. The computed re-evaluates, `tokenize` throws, the throw escapes the computed, and Vue logs an unhandled error in the console. The component continues to function, but the error is uncaught and unhandled — worse, it may appear as a noisy console error on every re-render that reads `debugTokens`.

---

## Connect the pieces

```
App.vue
  <script setup>
    type Token           — four variants: number, cell, operator, paren
    isDigit()            — character range comparison: '0' <= c <= '9'
    isUppercaseLetter()  — character range comparison: 'A' <= c <= 'Z'
    tokenize()           — scanner; pure function; string → Token[]
    debugTokens          — computed; reads selectedCoordinate + cells;
                           returns Token[] | null; zero explicit calls
  <template>
    v-if="debugTokens !== null"
                         — panel appears only when a formula is selected
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] Selecting a formula cell shows its token breakdown in the debug panel
- [ ] `=A1+B2*5` produces exactly five tokens, correctly typed
- [ ] Multi-digit numbers (`52`) and multi-character cell references (`B12`) each produce exactly one token
- [ ] Selecting a number or text cell shows the placeholder message
- [ ] You can explain what tokenizing is and why it is a separate step from computing a result
- [ ] You can explain why `character >= '0' && character <= '9'` correctly identifies a digit
- [ ] You can explain why `debugTokens` updates automatically when you select a different cell, without any explicit call in `selectCell`

---

*Next: Lesson 07 — Parsing Into a Tree. A flat list of tokens still cannot tell you that `*` should happen before `+` in `10+5*2`. That requires real structure — an Abstract Syntax Tree — built by a parser that understands operator precedence.*
