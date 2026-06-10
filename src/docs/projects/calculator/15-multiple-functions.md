# Calculator — Lesson 15 — Multiple Functions

## What You Will Build

`f(x) = x^2` and `g(x) = x + 2` plotted together on the same canvas in distinct
colours. A legend in the corner labels each curve with its name and expression.
The table gains one column per function. Up to four functions can be plotted
simultaneously, cycling through a fixed colour palette.

## What You Need to Know First

Lessons 01–14. The graphing and table infrastructure exists. This lesson adds
support for multiple concurrent functions without changing the rendering logic —
only the orchestration code in `main.ts` changes.

---

## The Problem

A single function on the graph is informative. Two functions together reveal
relationships: where they intersect, which one is larger for a given x, where
they diverge. But if both curves are the same colour, it is impossible to tell
which is which.

Colour coding is not decoration here — it is a **data dimension**. Each colour
encodes function identity. The legend makes that encoding explicit.

---

## Step 1 — Maths: Comparing Functions Visually

Plotting `f(x) = x^2` and `g(x) = x + 2` together reveals:

- They intersect where `f(x) = g(x)`: `x^2 = x + 2` → `x^2 - x - 2 = 0` → `(x-2)(x+1) = 0` → x = 2 and x = -1
- Between x = -1 and x = 2, `g(x) > f(x)` (the line is above the parabola)
- Outside that range, `f(x) > g(x)` (the parabola dominates)

These observations are immediately visible on the graph. Finding the same information
from a single-column table would require comparing rows by value. The graph encodes
the relationship spatially — the visual channel is faster than the numeric channel
for questions about relative position.

This is why visual comparison is a fundamental mathematical tool, not just a
cosmetic enhancement.

---

## Step 2 — A Colour Palette

Add to `style.css`:

```css
:root {
  --colour-function-0: #38bdf8;  /* sky blue   */
  --colour-function-1: #f97316;  /* orange     */
  --colour-function-2: #a3e635;  /* lime green */
  --colour-function-3: #f43f5e;  /* rose       */
}
```

**SE lens — CSS variables for series colours:**
Each function has a colour token with a numeric index. The rendering code reads
`--colour-function-0`, `--colour-function-1`, etc. If the colour scheme changes,
only the CSS changes. Adding a fifth colour is one line. The rendering code never
knows what the colours are — it only knows the index.

This is the same principle as the design tokens from lesson 01 applied to a
multi-value series. Named values, one place to change, no hardcoded values
anywhere else.

---

## Step 3 — Function Colour Index in State

The environment stores functions by name. A colour index must be assigned to each
function name and stored in the application state so it persists across redraws.

Add to `src/calculator-state.ts`:

```typescript
export interface CalculatorState {
  // ... existing fields ...
  functionColourIndex: Readonly<Record<string, number>>
}

// In createInitialState:
functionColourIndex: {}
```

When a new function is defined, assign it the next available index:

```typescript
function assignColourIndex(
  functionName:      string,
  currentColourMap:  Readonly<Record<string, number>>,
  totalFunctions:    number,
): Readonly<Record<string, number>> {
  if (functionName in currentColourMap) return currentColourMap  // already assigned
  const nextIndex = totalFunctions % 4  // cycle through 0–3
  return { ...currentColourMap, [functionName]: nextIndex }
}
```

**`in` operator — first appearance:**
`functionName in currentColourMap` returns `true` if `functionName` is a key in
the object. It is the standard check for object key presence. Equivalent to
`currentColourMap[functionName] !== undefined` but more readable and semantically
precise — it tests key existence, not value truthiness.

Call `assignColourIndex` in `applyEquals` when the returned environment contains
a new function:

```typescript
// After binding a new function:
const updatedColourIndex = assignColourIndex(
  functionName,
  state.functionColourIndex,
  Object.keys(newEnvironment.functions).length,
)
// Include in returned state: functionColourIndex: updatedColourIndex
```

---

## Step 4 — Update the Graph Renderer

Update `redrawGraph` in `src/main.ts`:

```typescript
function redrawGraph(): void {
  drawCoordinatePlane(graphContext, viewport)

  const functionEntries =
    Object.entries(calculatorState.environment.functions) as [string, UserFunction][]

  for (const [functionName, userFunction] of functionEntries) {
    const colourIndex  = calculatorState.functionColourIndex[functionName] ?? 0
    const colourToken  = `--colour-function-${colourIndex}`
    const colour       = getComputedStyle(document.documentElement)
      .getPropertyValue(colourToken).trim()

    drawFunction(
      graphContext,
      userFunction,
      viewport,
      calculatorState.environment,
      calculatorState.angleMode,
      colour,
    )
  }

  drawLegend(graphContext, functionEntries, calculatorState.functionColourIndex)
}
```

Add `drawLegend` to `src/graph-renderer.ts`:

```typescript
import { UserFunction } from './types.js'

export function drawLegend(
  context:        CanvasRenderingContext2D,
  functionEntries: [string, UserFunction][],
  colourIndexMap:  Readonly<Record<string, number>>,
): void {
  let legendY = 20

  for (const [functionName, userFunction] of functionEntries) {
    const colourIndex = colourIndexMap[functionName] ?? 0
    const colour = getComputedStyle(document.documentElement)
      .getPropertyValue(`--colour-function-${colourIndex}`).trim()

    context.fillStyle   = colour
    context.font        = '12px monospace'
    context.textAlign   = 'left'
    context.fillText(
      `${functionName}(x) = ${userFunction.bodyExpression}`,
      10,
      legendY,
    )
    legendY += 18
  }
}
```

**Template literals in CSS property names:**
`` `--colour-function-${colourIndex}` `` builds the CSS custom property name
dynamically. `colourIndex` is `0`, `1`, `2`, or `3`, producing the four colour
token names. This is the correct pattern when the property name follows a predictable
pattern indexed by data.

**Walkthrough — drawing `f(x) = x^2` (index 0) and `g(x) = x+2` (index 1):**

`functionEntries` is `[ ['f', { bodyExpression: 'x^2', ... }], ['g', { bodyExpression: 'x+2', ... }] ]`.

First iteration: `functionName = 'f'`. `colourIndex = 0`. Reads `--colour-function-0`
from CSS: `'#38bdf8'` (sky blue). `drawFunction` draws the parabola in sky blue.

Second iteration: `functionName = 'g'`. `colourIndex = 1`. Reads `--colour-function-1`
from CSS: `'#f97316'` (orange). `drawFunction` draws the line in orange.

`drawLegend` draws `f(x) = x^2` in sky blue at y=20, then `g(x) = x+2` in orange
at y=38. Both labels are visible in the top-left corner of the canvas.

---

## Step 5 — Multiple Columns in the Table

Update `renderTable` in `src/main.ts` to show one column per function:

```typescript
function renderTable(): void {
  const functions = Object.entries(calculatorState.environment.functions)
  if (functions.length === 0) return

  // Rebuild the header row
  const headerRowElement =
    document.querySelector<HTMLTableRowElement>('#table-header-row')
  if (headerRowElement !== null) {
    headerRowElement.textContent = ''
    const xHeader = document.createElement('th')
    xHeader.textContent = 'x'
    headerRowElement.appendChild(xHeader)

    for (const [functionName] of functions) {
      const functionHeader = document.createElement('th')
      functionHeader.textContent = `${functionName}(x)`
      headerRowElement.appendChild(functionHeader)
    }
  }

  // Compute x values
  const startValue = parseFloat(
    document.querySelector<HTMLInputElement>('#table-start')?.value ?? '-5')
  const endValue   = parseFloat(
    document.querySelector<HTMLInputElement>('#table-end')?.value   ?? '5')
  const stepValue  = parseFloat(
    document.querySelector<HTMLInputElement>('#table-step')?.value  ?? '1')

  if (!isFinite(startValue) || !isFinite(endValue)
      || !isFinite(stepValue) || stepValue <= 0) return

  const tableConfig = {
    startX: startValue, endX: endValue,
    stepSize: stepValue, precision: calculatorState.precision,
  }

  // Get x values from the first function's table
  const { rows: firstRows } = {
    rows: buildTable(
      functions[0]![1], tableConfig,
      calculatorState.environment, calculatorState.angleMode,
    )
  }

  const tableBodyElement =
    document.querySelector<HTMLTableSectionElement>('#table-body')!
  tableBodyElement.textContent = ''

  for (let rowIndex = 0; rowIndex < firstRows.length; rowIndex++) {
    const rowData = firstRows[rowIndex]!
    const tableRowElement = document.createElement('tr')

    const xCell = document.createElement('td')
    xCell.textContent = rowData.xDisplay
    tableRowElement.appendChild(xCell)

    for (const [, userFunction] of functions) {
      const yValue = evaluateAt(
        userFunction, rowData.xValue,
        calculatorState.environment, calculatorState.angleMode,
      )
      const yCell = document.createElement('td')
      yCell.textContent =
        yValue === null ? '—' : formatResult(yValue, calculatorState.precision)
      tableRowElement.appendChild(yCell)
    }

    tableBodyElement.appendChild(tableRowElement)
  }
}
```

**Walkthrough — rendering a 2-column table row for x=2:**

`rowData.xValue = 2`. `rowData.xDisplay = '2'`.

First function column `f`: `evaluateAt(f, 2, env, DEG)` → `4`. Cell shows `'4'`.
Second function column `g`: `evaluateAt(g, 2, env, DEG)` → `4`. Cell shows `'4'`.

The row is `| 2 | 4 | 4 |` — the intersection point where `f(2) = g(2)`.

---

## Debugging: When Multiple Functions Render Wrongly

**Symptom: both functions appear in the same colour**

The colour index is not advancing between functions. Check the loop that calls
`drawFunction` — it should use the function's index (0, 1, 2, 3) to pick a CSS
colour token:
```typescript
const colour = getComputedStyle(document.documentElement)
  .getPropertyValue(`--colour-function-${index}`).trim()
```
If the index is always `0`, or if the CSS tokens `--colour-function-0` through
`--colour-function-3` are not defined in `:root`, all functions get the same colour.

**Symptom: legend does not appear**

The `drawLegend` call is missing from `redrawGraph`, or it is called before
`drawCoordinatePlane` clears the canvas and then gets overwritten. Ensure
`drawLegend` is the last call in `redrawGraph`, after all curve draws.

**Symptom: table shows only one column (missing function columns)**

The table render is iterating `Object.values` instead of `Object.entries`, losing
the function names for header cells. Or `buildTable` was only called for the first
function. Check that `renderTable` in `main.ts` iterates all functions in
`calculatorState.environment.functions` and creates one column per function.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

The colour index map (`functionColourIndex`) carries through to the solver panel
(lesson 22), which marks roots and extrema on the graph using the same colour as
the function they belong to. Consistent colour coding throughout the application
makes results immediately associable with the function that produced them.

The pattern established here — `Object.entries`, index map, CSS token name from
index — is used unchanged in lesson 22. Learning the pattern now means recognising
it later.

---

## What Breaks Without This

**Without colour coding:**
Two functions on the same graph produce one complex-looking curve. The user cannot
distinguish which segment belongs to `f` and which to `g`. The intersection appears
as a feature of a single curve rather than as a meeting of two separate functions.
Colour is not decoration — it is a data dimension that carries the identity of each
function.

**Without the legend:**
Even with different colours, the user must remember which colour was assigned to
which function. The legend makes the mapping explicit, embedded in the graph itself.

---

## Definition of Done

- [ ] `f(x) = x^2` and `g(x) = x + 2` are plotted in different colours
- [ ] A legend in the canvas corner shows each function name and expression in its colour
- [ ] The table has two data columns: `f(x)` and `g(x)`
- [ ] Up to 4 functions can be plotted simultaneously (cycle through indices 0–3)
- [ ] All function colours come from CSS custom properties `--colour-function-N`
- [ ] Redefining a function updates its curve and table column immediately
- [ ] You can explain why colour is a data dimension here, not decoration
- [ ] You can explain the `in` operator for object key testing
- [ ] You can explain how the CSS property name is constructed dynamically from the index
- [ ] Run:
      ```
      git add src/calculator-state.ts src/graph-renderer.ts src/main.ts src/style.css
      git commit -m "Add multi-function graphing: colour palette assigns distinct colours per function, legend labels curves, table shows one column per function"
      ```

---

*Next: Lesson 16 — Numerical Integration. The area between `f(x)` and the x-axis
is computed using Riemann sums and the trapezoidal rule. The area is shaded on the
canvas. The trapezoidal rule is visibly more accurate than Riemann sums for the
same step count.*
