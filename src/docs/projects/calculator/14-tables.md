# Calculator — Lesson 14 — Tables

## What You Will Build

A table of x and f(x) values appears beside the graph. Start, end, and step are
configurable with input fields. Undefined values show a dash `—`. Changing the
function or the range controls immediately updates the table.

## What You Need to Know First

Lessons 01–13. `evaluateAt` evaluates the function at any x value and returns
`null` for undefined points. The graph shows the function visually. The table
shows the same data numerically — complementary views of the same function.

---

## The Problem

A graph shows the shape of a function at a glance. A table shows exact values at
specific points. These views are complementary: the graph for pattern recognition,
the table for precise reading. A calculator that has one without the other is
incomplete.

---

## Step 1 — Maths: Reading a Table of Values

A table of values for `f(x) = x^2`:

| x  | f(x) |
|----|------|
| -2 | 4    |
| -1 | 1    |
|  0 | 0    |
|  1 | 1    |
|  2 | 4    |

The **step size** determines how close the x values are. A smaller step reveals more
detail — important for rapidly changing functions. A larger step gives an overview.

The table and graph must agree: the same function, the same environment, the same
precision. If they disagreed, the user could not trust either.

---

## Step 2 — The Table Builder

### The problem

A table is a data transformation: given a function and a range, produce an array of
(x, f(x)) pairs. This is a pure computation — no DOM, no canvas — and deserves its
own module.

### The code

Create `src/table-builder.ts`:

```typescript
import { evaluateAt }              from './function-evaluator.js'
import { formatResult }            from './format-number.js'
import { Environment }             from './environment.js'
import { UserFunction, AngleMode } from './types.js'
import { PrecisionLevel }          from './format-number.js'

export interface TableRow {
  xValue:   number
  yValue:   number | null
  xDisplay: string
  yDisplay: string
}

export interface TableConfig {
  startX:    number
  endX:      number
  stepSize:  number
  precision: PrecisionLevel
}

export function buildTable(
  userFunction: UserFunction,
  config:       TableConfig,
  environment:  Environment,
  angleMode:    AngleMode,
): TableRow[] {
  const rows: TableRow[] = []

  for (
    let rawX = config.startX;
    rawX <= config.endX + config.stepSize * 0.001;
    rawX += config.stepSize
  ) {
    const roundedX = parseFloat(rawX.toPrecision(10))
    const yValue   = evaluateAt(userFunction, roundedX, environment, angleMode)

    rows.push({
      xValue:   roundedX,
      yValue,
      xDisplay: formatResult(roundedX, config.precision),
      yDisplay: yValue === null ? '—' : formatResult(yValue, config.precision),
    })
  }

  return rows
}
```

**What `src/table-builder.ts` is:**
`table-builder.ts` owns the table data computation. It produces rows from a function
and a config. It has no DOM access. The rendering code renders what `buildTable`
produces — two separate concerns, two separate places.

**The float loop drift problem:**
`for (let rawX = 1; rawX <= 3; rawX += 0.1)` does not produce exactly
`1.0, 1.1, 1.2, ... 3.0`. After ten additions of `0.1`, floating point accumulation
produces `1.9999999999999998` instead of `2.0`. After thirty additions, the last
value is `2.9999999999999996` — which is less than `3.0` — so the loop ends without
producing the `3.0` row.

**The fix has two parts:**

1. `config.stepSize * 0.001` tolerance added to the loop condition: the loop ends
   when `rawX > endX + 0.001 * stepSize`. This half-step tolerance is large enough
   to include a step that landed slightly short of `endX` due to float drift, but
   small enough to exclude a genuine next step.

2. `parseFloat(rawX.toPrecision(10))`: each raw x value is snapped to 10 significant
   figures before use. `1.9999999999999998.toPrecision(10)` gives `'2.000000000'`,
   which `parseFloat` converts to `2.0`. The accumulated float error is rounded away
   at each step.

This is the float loop pattern: accumulate in floating point for the loop counter,
snap to a meaningful precision for each actual use. The raw accumulation is never
shown to the user or used for evaluation.

**`'—'` — Unicode escape:**
`'—'` is the **em dash** character `—`. Unicode escapes in string literals
have the form `\uXXXX` where XXXX is the four-digit hexadecimal Unicode code point.
The em dash is the standard typographic character for "not available" or "undefined"
in tables. It is wider than a hyphen (`-`) and visually distinct from the minus sign.

**`TableRow` — data and display together:**
Each row holds both raw values (`xValue: number`, `yValue: number | null`) and
formatted strings (`xDisplay: string`, `yDisplay: string`). The rendering code uses
the display strings. Future solvers could use the raw values to find approximate
roots. Both are available from one data structure. When precision changes, rebuild
the table with new formatted strings — the raw values do not change.

**CS lens — separate data from display:**
`buildTable` computes data. The rendering function renders it. These are separate
concerns: the table data could be used without a DOM (in tests, in a CSV export, in
a solver). The rendering code can be replaced without changing the data computation.
This is the same principle as `BUTTON_GRID` in lesson 02: data defined once,
rendered wherever needed.

---

## Step 3 — Tests

Create `src/table-builder.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { buildTable }             from './table-builder.js'
import { createEnvironment }      from './environment.js'
import { AngleMode }              from './types.js'

describe('buildTable', () => {
  const env = createEnvironment()

  test('correct values for x^2 from -2 to 2', () => {
    const fn   = { parameterName: 'x', bodyExpression: 'x^2' }
    const rows = buildTable(fn,
      { startX: -2, endX: 2, stepSize: 1, precision: 10 },
      env, AngleMode.DEGREES)

    expect(rows.length).toBe(5)
    expect(rows[0]?.yValue).toBe(4)
    expect(rows[2]?.yValue).toBe(0)
    expect(rows[4]?.yValue).toBe(4)
  })

  test('undefined values show as dash', () => {
    const fn   = { parameterName: 'x', bodyExpression: 'sqrt(x)' }
    const rows = buildTable(fn,
      { startX: -1, endX: 1, stepSize: 1, precision: 10 },
      env, AngleMode.DEGREES)

    expect(rows[0]?.yDisplay).toBe('—')  // sqrt(-1) is undefined
    expect(rows[1]?.yDisplay).toBe('0')        // sqrt(0) = 0
    expect(rows[2]?.yDisplay).toBe('1')        // sqrt(1) = 1
  })

  test('float step includes endpoint', () => {
    const fn   = { parameterName: 'x', bodyExpression: 'x' }
    const rows = buildTable(fn,
      { startX: 0, endX: 1, stepSize: 0.1, precision: 10 },
      env, AngleMode.DEGREES)

    expect(rows.length).toBe(11)  // 0, 0.1, 0.2, ..., 1.0
  })
})
```

The third test directly verifies the float tolerance fix: with step 0.1, from 0 to
1, there should be exactly 11 rows (0 through 1.0 inclusive). Without the tolerance
fix, only 10 rows would be produced.

Run `npm test`. All tests pass.

---

## Step 4 — The Table UI

### Add to `index.html`

Place below the canvas in the layout:

```html
<div class="table-panel">
  <div class="table-controls">
    <label>From
      <input type="number" id="table-start" value="-5" step="1">
    </label>
    <label>To
      <input type="number" id="table-end" value="5" step="1">
    </label>
    <label>Step
      <input type="number" id="table-step" value="1" step="0.1" min="0.001">
    </label>
  </div>
  <div class="table-scroll">
    <table class="value-table" id="value-table">
      <thead>
        <tr id="table-header-row">
          <th>x</th>
          <th>f(x)</th>
        </tr>
      </thead>
      <tbody id="table-body"></tbody>
    </table>
  </div>
</div>
```

**`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` — first appearance:**
HTML table elements form a semantic hierarchy for tabular data:
- `<table>` — the container for the entire table
- `<thead>` — the header section (not scrolled away when the body scrolls)
- `<tbody>` — the data section
- `<tr>` — a table row
- `<th>` — a header cell (bold, centred by default)
- `<td>` — a data cell

Using the correct semantic elements makes the table accessible: screen readers
announce column headers to visually impaired users, and CSS can target elements
by their semantic role.

**`<input type="number">` — first appearance:**
`type="number"` creates a numeric input field with browser-provided up/down controls.
`step="0.1"` sets the increment for those controls. `min="0.001"` prevents step
sizes of zero or negative, which would cause an infinite loop in `buildTable`.
The browser validates these constraints when the user uses the controls, but not
when text is typed directly — the code must validate too.

### Add to `style.css`

```css
:root {
  --colour-table-header:  #334155;
  --colour-table-row-alt: #0f172a;
  --colour-table-border:  #1e293b;
  --font-size-table:      0.8rem;
  --height-table-scroll:  300px;
}

.table-scroll {
  max-height: var(--height-table-scroll);
  overflow-y: auto;
  margin-top: var(--space-sm);
}

.value-table {
  width:           100%;
  border-collapse: collapse;
  font-family:     var(--font-display);
  font-size:       var(--font-size-table);
}

.value-table th {
  background-color: var(--colour-table-header);
  color:            var(--colour-display-text);
  padding:          var(--space-sm);
  text-align:       right;
  position:         sticky;
  top:              0;
}

.value-table td {
  color:         var(--colour-display-text);
  padding:       var(--space-sm);
  text-align:    right;
  border-bottom: 1px solid var(--colour-table-border);
}

.value-table tr:nth-child(even) td {
  background-color: var(--colour-table-row-alt);
}
```

**`border-collapse: collapse`:**
Without this, table cells have their own borders and there are gaps between them.
`collapse` merges adjacent cell borders into a single line — the standard appearance
for data tables.

**`position: sticky; top: 0` on `<th>`:**
Sticky positioning keeps the header row visible at the top of the scroll container
even as the body scrolls. As the user scrolls down through a long table, the column
headers remain visible. Without it, the headers scroll away and the columns are
unlabelled.

**`tr:nth-child(even) td`:**
`:nth-child(even)` matches every even-numbered row. Alternating row colours — the
"zebra stripe" pattern — makes it easier to read across a row without losing your
place. This is a common table UI convention.

---

## Step 5 — Render and Wire

Add to `src/main.ts`:

```typescript
import { buildTable, TableConfig } from './table-builder.js'

function renderTable(): void {
  const tableBodyElement =
    document.querySelector<HTMLTableSectionElement>('#table-body')
  if (tableBodyElement === null) return

  const functions = Object.values(calculatorState.environment.functions)
  const firstFunction = functions[0]

  if (firstFunction === undefined) {
    tableBodyElement.textContent = ''
    return
  }

  const startInput = document.querySelector<HTMLInputElement>('#table-start')
  const endInput   = document.querySelector<HTMLInputElement>('#table-end')
  const stepInput  = document.querySelector<HTMLInputElement>('#table-step')

  const startValue = parseFloat(startInput?.value ?? '-5')
  const endValue   = parseFloat(endInput?.value   ?? '5')
  const stepValue  = parseFloat(stepInput?.value  ?? '1')

  if (!isFinite(startValue) || !isFinite(endValue)
      || !isFinite(stepValue) || stepValue <= 0) {
    return  // invalid input — do nothing
  }

  const tableConfig: TableConfig = {
    startX:    startValue,
    endX:      endValue,
    stepSize:  stepValue,
    precision: calculatorState.precision,
  }

  const rows = buildTable(
    firstFunction,
    tableConfig,
    calculatorState.environment,
    calculatorState.angleMode,
  )

  tableBodyElement.textContent = ''

  for (const row of rows) {
    const tableRowElement = document.createElement('tr')

    const xCell = document.createElement('td')
    xCell.textContent = row.xDisplay
    tableRowElement.appendChild(xCell)

    const yCell = document.createElement('td')
    yCell.textContent = row.yDisplay
    tableRowElement.appendChild(yCell)

    tableBodyElement.appendChild(tableRowElement)
  }
}
```

Wire input changes and call `renderTable` from `updateDisplay`:

```typescript
for (const inputId of ['table-start', 'table-end', 'table-step']) {
  document.querySelector(`#${inputId}`)?.addEventListener('change', renderTable)
}
```

Call `renderTable()` at the end of `updateDisplay()`.

**Security — `textContent` not `innerHTML` for cell content:**
`xCell.textContent = row.xDisplay` continues the safe pattern from lessons 02 and 06.
`row.xDisplay` is a formatted number string from `formatResult`, which always
produces a clean numeric string. Even so, using `textContent` is the correct habit.
Using `innerHTML` here would be unnecessary and potentially risky if the display
format ever changes.

---

## Debugging: When the Table Renders Wrongly

**Symptom: table is empty even though a function is defined**

`renderTable` is not detecting the function, or it is not being called. Add a log:
```typescript
console.log('functions:', Object.values(calculatorState.environment.functions))
```
If the array is empty, no functions are stored in the environment — check lesson 10's
function definition storage. If the array has entries but the table is still empty,
check that `renderTable` is called from `updateDisplay`.

**Symptom: last row is missing (e.g., table from 0 to 1 step 0.1 shows 10 rows)**

The float loop tolerance fix is missing from `buildTable`. The loop condition should
add a small tolerance to the end bound:
```typescript
while (currentX <= endX + stepSize * 0.001)
```
Without the tolerance, `currentX` accumulates floating-point drift and never quite
reaches `endX`, so the last row is skipped.

**Symptom: undefined values show as blank instead of `—`**

The `row.yDisplay` is being set to `null` or `undefined` rather than `'—'`. Check
`buildTable` in `table-builder.ts`: when `evaluateAt` returns `null`, `yDisplay`
should be set to the dash character string `'—'`.

**Symptom: table does not update when the step input changes**

The event listener for input `change` events is missing from `main.ts`. Verify:
```typescript
for (const inputId of ['table-start', 'table-end', 'table-step']) {
  document.querySelector(`#${inputId}`)?.addEventListener('change', renderTable)
}
```
If these three event listeners are absent, changing the control values does not
trigger a re-render.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

The table and the graph are complementary views of the same function in the same
environment at the same precision. They share `evaluateAt` and `formatResult`.
When lesson 15 adds multiple functions, the table will grow more columns — one per
function — using the same `buildTable` call with different function arguments.

`buildTable` is a pure function: the same inputs always produce the same rows. This
makes it testable (lesson 03 explains why pure functions are easy to test) and
predictable. It also means the table can be rebuilt entirely on every change without
worrying about stale state.

---

## What Breaks Without This

**Without the float tolerance fix:**
A table from `x=0` to `x=3` with step `0.1` would show 30 rows instead of 31.
`x=3.0` would be missing. The bug is invisible unless you count rows or check the
last entry. The cause — floating point accumulation — is non-obvious. The tolerance
fix is one line; not having it is a subtle, hard-to-find bug.

**Without `border-collapse`:**
The table cells appear with visible gaps between them and double-border lines at
cell boundaries. The result looks unprofessional and is harder to read.

---

## Definition of Done

- [ ] The table shows x and f(x) values for the configured range and step
- [ ] Undefined values display as `—`
- [ ] Changing start/end/step updates the table immediately
- [ ] Table values respect the current display precision
- [ ] A float loop from 0 to 1 with step 0.1 produces exactly 11 rows (verified by test)
- [ ] `buildTable` is a pure function with no DOM access
- [ ] `npm test` passes all tests in `table-builder.test.ts`
- [ ] You can explain the float loop drift problem and the two-part fix
- [ ] You can explain `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`
- [ ] You can explain `border-collapse: collapse`
- [ ] You can explain `position: sticky` and when it is used
- [ ] You can explain `tr:nth-child(even)` and what it selects
- [ ] Run:
      ```
      git add src/table-builder.ts src/table-builder.test.ts src/main.ts index.html src/style.css
      git commit -m "Add value table: buildTable pure function, float loop tolerance fix, sticky headers, undefined values show dash"
      ```

---

*Next: Lesson 15 — Multiple Functions. `f(x)` and `g(x)` plotted in different
colours on the same canvas. A legend labels each curve. The table gains a column
per function. Colour coding is a data dimension, not decoration.*
