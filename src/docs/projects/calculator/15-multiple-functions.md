# Lesson 15 — Multiple Functions

## What You Will Build

`f(x)` and `g(x)` plotted together on the same canvas in distinct colours.
A legend labels each curve. The table gains a column for each function.
Up to four functions can be plotted simultaneously.

## What You Need to Know First

Lessons 01–14. The graphing and table infrastructure is in place. This lesson
adds support for multiple curves without changing the underlying rendering logic.

---

## The Lesson

### The problem

One function on the graph is informative. Two functions reveal relationships:
where they are equal, where one dominates the other, where they diverge. But the
current system renders all functions in the same colour, making it impossible to
tell which curve is which.

---

### Step 1 — Maths — comparing functions visually

**Maths — comparing two functions:**
Plotting `f(x) = x^2` and `g(x) = x + 2` together reveals:
- They intersect at two points (where `f(x) = g(x)`, i.e., `x^2 = x + 2`, i.e., x=2 and x=-1)
- For x between -1 and 2, `g(x) > f(x)` (the line is above the parabola)
- Outside that range, `f(x) > g(x)` (the parabola is above the line)

These observations are visible immediately on a graph. In a table, you would have
to compare two columns row by row. The graph communicates the relationship at a
glance. This is why visual comparison is a fundamental mathematical tool.

---

### Step 2 — A colour palette

Add to `style.css`:

```css
:root {
  --color-function-0: #38bdf8;  /* sky blue */
  --color-function-1: #f97316;  /* orange */
  --color-function-2: #a3e635;  /* lime */
  --color-function-3: #f43f5e;  /* rose */
}
```

**SE lens — CSS variables for series colours:**
Each function has a colour token with a numeric index. The rendering code reads
the colour for function index 0, 1, 2, 3. If the palette changes, only the CSS
changes. Adding a fifth colour is one line. The rendering code never knows what
the colours are — it only knows the index.

This is the same principle as the design tokens in lesson 01: named values, one
place to change, no hardcoded values anywhere else.

---

### Step 3 — Function colours in state

The environment already stores functions by name. We need a stable mapping from
function name to colour index. Add to `src/calculator-state.ts`:

```typescript
export interface CalculatorState {
  // ... existing fields ...
  functionColourIndex: Readonly<Record<string, number>>
}
```

When a new function is defined, assign it the next available colour index:

```typescript
function assignColourIndex(
  functionName:         string,
  currentColourMap:     Readonly<Record<string, number>>,
  totalFunctionCount:   number,
): Readonly<Record<string, number>> {
  if (functionName in currentColourMap) return currentColourMap
  const nextIndex = totalFunctionCount % 4  // cycle through 0–3
  return { ...currentColourMap, [functionName]: nextIndex }
}
```

Call this in `applyEquals` when a function definition is detected.

---

### Step 4 — Update the graph renderer

Update `redrawGraph` in `src/main.ts`:

```typescript
function redrawGraph(): void {
  drawCoordinatePlane(graphContext, viewport)

  const functionEntries = Object.entries(calculatorState.environment.functions)

  for (const [functionName, userFunction] of functionEntries) {
    const colourIndex = calculatorState.functionColourIndex[functionName] ?? 0
    const colour = getComputedStyle(document.documentElement)
      .getPropertyValue(`--color-function-${colourIndex}`).trim()

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
export function drawLegend(
  context:          CanvasRenderingContext2D,
  functionEntries:  [string, UserFunction][],
  colourIndexMap:   Readonly<Record<string, number>>,
): void {
  const legendX = 10
  let legendY   = 20

  for (const [functionName, userFunction] of functionEntries) {
    const colourIndex = colourIndexMap[functionName] ?? 0
    const colour = getComputedStyle(document.documentElement)
      .getPropertyValue(`--color-function-${colourIndex}`).trim()

    context.fillStyle   = colour
    context.font        = '12px monospace'
    context.textAlign   = 'left'
    context.fillText(
      `${functionName}(x) = ${userFunction.bodyExpression}`,
      legendX,
      legendY,
    )
    legendY += 18
  }
}
```

---

### Step 5 — Multiple columns in the table

Update `renderTable` in `src/main.ts` to show one column per function:

```typescript
function renderTable(): void {
  const functions = Object.entries(calculatorState.environment.functions)
  if (functions.length === 0) return

  // Update the header row
  const headerRow = document.querySelector<HTMLTableRowElement>('#table-header-row')
  if (headerRow !== null) {
    headerRow.innerHTML = '<th>x</th>'
    for (const [functionName] of functions) {
      const headerCell = document.createElement('th')
      headerCell.textContent = `${functionName}(x)`
      headerRow.appendChild(headerCell)
    }
  }

  // Compute rows for all functions at once
  const tableConfig: TableConfig = { /* ... as before ... */ }
  const xValues = computeXValues(tableConfig)

  const tableBody = document.querySelector<HTMLTableSectionElement>('#table-body')!
  tableBody.innerHTML = ''

  for (const xValue of xValues) {
    const tableRow = document.createElement('tr')
    const xCell = document.createElement('td')
    xCell.textContent = formatResult(xValue, calculatorState.precision)
    tableRow.appendChild(xCell)

    for (const [, userFunction] of functions) {
      const yValue = evaluateAt(userFunction, xValue, calculatorState.environment, calculatorState.angleMode)
      const yCell  = document.createElement('td')
      yCell.textContent = yValue === null ? '—' : formatResult(yValue, calculatorState.precision)
      tableRow.appendChild(yCell)
    }

    tableBody.appendChild(tableRow)
  }
}

function computeXValues(config: TableConfig): number[] {
  const values: number[] = []
  for (
    let xValue = config.startX;
    xValue <= config.endX + config.stepSize * 0.001;
    xValue += config.stepSize
  ) {
    values.push(parseFloat(xValue.toPrecision(10)))
  }
  return values
}
```

---

## Connect the Pieces

The colour index map (`functionColourIndex`) carries through to the solver panel
(lesson 22), which uses the same colours to annotate results on the graph.
When the bisection solver marks a root, it uses the same colour as the function
it found the root of. Consistent colour coding throughout the application is a
small SE decision with a large readability benefit.

---

## What Breaks Without This

Without colour coding, two functions on the same graph look like one complex curve.
The user cannot tell which segment belongs to which function. The graph communicates
less information than it could. Colour is not decoration — it is a data dimension.

---

## Definition of Done

- [ ] `f(x) = x^2` and `g(x) = x + 2` are plotted in different colours
- [ ] A legend shows the function name and expression for each curve
- [ ] The table shows two columns: one for each function
- [ ] Up to 4 functions can be plotted (colour indices 0–3, cycling)
- [ ] All function colours come from CSS custom properties
