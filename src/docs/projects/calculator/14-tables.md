# Lesson 14 — Tables

## What You Will Build

A table of x and f(x) values appears beside the graph. Start, end, and step are
configurable. Undefined values show a dash. Changing the function updates the
table immediately.

## What You Need to Know First

Lessons 01–13. `evaluateAt` exists and handles undefined values. The graph renders
the function visually. The table shows the same data numerically.

---

## The Lesson

### The problem

A graph shows the shape of a function at a glance. A table shows exact values at
specific points. These are complementary: the graph for pattern recognition, the
table for precise reading. A calculator that has one without the other is incomplete.

---

### Step 1 — Maths — reading a table

**Maths — tables of values:**
A table of values for `f(x) = x^2` might look like:

| x  | f(x) |
|----|------|
| -3 | 9    |
| -2 | 4    |
| -1 | 1    |
| 0  | 0    |
| 1  | 1    |
| 2  | 4    |
| 3  | 9    |

The step size (1 in this case) determines how close together the x values are.
A smaller step reveals more detail — important for functions that change rapidly.
A larger step gives an overview — useful for functions that change slowly.

**Significant figures in tables:**
Table values should respect the display precision setting. `f(x) = sin(x)` at
x=0.1 in degrees gives approximately `0.001745240643728`. At 4 significant figures:
`0.001745`. The precision setting from lesson 05 applies here too.

---

### Step 2 — The table data type

Create `src/table-builder.ts`:

```typescript
import { evaluateAt }   from './function-evaluator.js'
import { formatResult } from './format-number.js'
import { Environment }  from './environment.js'
import { UserFunction } from './types.js'
import { AngleMode, PrecisionLevel } from './types.js'

export interface TableRow {
  xValue:  number
  yValue:  number | null
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
    let xValue = config.startX;
    xValue <= config.endX + config.stepSize * 0.001; // small tolerance for float steps
    xValue += config.stepSize
  ) {
    const roundedX = parseFloat(xValue.toPrecision(10))
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

**CS lens — iteration with a float step:**
`for (let x = start; x <= end; x += step)` has a floating point problem. After
many additions, `x` drifts from the intended values. For `step = 0.1`, after 10
iterations, `x` might be `0.9999999999999999` instead of `1.0`. The fix:
`roundedX = parseFloat(xValue.toPrecision(10))` rounds away the accumulated error
at each step. The loop keeps a running float but displays (and evaluates at) the
rounded version.

This is a general pattern: floating point loops should accumulate in float but
snap to a meaningful precision for each actual use.

**SE lens — separate data from presentation:**
`TableRow` holds both raw values (`xValue`, `yValue`) and formatted strings
(`xDisplay`, `yDisplay`). The rendering code uses the display strings. The
solvers use the raw values. One data structure, two purposes. When the precision
changes, rebuild the table with new formatted strings — the raw values do not change.

---

### Step 3 — Tests

```typescript
describe('buildTable', () => {
  const fn  = { parameterName: 'x', bodyExpression: 'x^2' }
  const env = createEnvironment()

  test('correct values for x^2 from 1 to 3', () => {
    const rows = buildTable(fn, { startX: 1, endX: 3, stepSize: 1, precision: 10 }, env, AngleMode.DEGREES)
    expect(rows.length).toBe(3)
    expect(rows[0]?.yValue).toBe(1)
    expect(rows[1]?.yValue).toBe(4)
    expect(rows[2]?.yValue).toBe(9)
  })

  test('undefined values show as dash', () => {
    const sqrtFn = { parameterName: 'x', bodyExpression: 'sqrt(x)' }
    const rows   = buildTable(sqrtFn, { startX: -1, endX: 1, stepSize: 1, precision: 10 }, env, AngleMode.DEGREES)
    expect(rows[0]?.yDisplay).toBe('—')   // sqrt(-1) is undefined
    expect(rows[1]?.yDisplay).toBe('0')   // sqrt(0) = 0
  })
})
```

---

### Step 4 — The table UI

Add to `index.html` beside the canvas:

```html
<div class="table-panel">
  <div class="table-controls">
    <label>From <input type="number" id="table-start" value="-5" step="1" /></label>
    <label>To   <input type="number" id="table-end"   value="5"  step="1" /></label>
    <label>Step <input type="number" id="table-step"  value="1"  step="0.1" min="0.001" /></label>
  </div>
  <div class="table-scroll">
    <table class="value-table" id="value-table">
      <thead>
        <tr><th>x</th><th>f(x)</th></tr>
      </thead>
      <tbody id="table-body"></tbody>
    </table>
  </div>
</div>
```

Add to `style.css`:

```css
:root {
  --color-table-header:  #334155;
  --color-table-row-alt: #0f172a;
  --color-table-border:  #1e293b;
  --font-size-table:     0.8rem;
  --height-table-scroll: 300px;
}

.table-scroll {
  max-height:  var(--height-table-scroll);
  overflow-y:  auto;
  margin-top:  var(--spacing-sm);
}

.value-table {
  width:           100%;
  border-collapse: collapse;
  font-family:     var(--font-family-display);
  font-size:       var(--font-size-table);
}

.value-table th {
  background-color: var(--color-table-header);
  color:            var(--color-display-text);
  padding:          var(--spacing-sm);
  text-align:       right;
  position:         sticky;
  top:              0;
}

.value-table td {
  color:        var(--color-display-text);
  padding:      var(--spacing-sm);
  text-align:   right;
  border-bottom: 1px solid var(--color-table-border);
}

.value-table tr:nth-child(even) td {
  background-color: var(--color-table-row-alt);
}
```

---

### Step 5 — Render and wire

Add to `src/main.ts`:

```typescript
function renderTable(): void {
  const tableBody = document.querySelector<HTMLTableSectionElement>('#table-body')
  if (tableBody === null) return

  const firstFunction = Object.values(calculatorState.environment.functions)[0]
  if (firstFunction === undefined) { tableBody.innerHTML = ''; return }

  const startInput = document.querySelector<HTMLInputElement>('#table-start')
  const endInput   = document.querySelector<HTMLInputElement>('#table-end')
  const stepInput  = document.querySelector<HTMLInputElement>('#table-step')

  const tableConfig: TableConfig = {
    startX:    parseFloat(startInput?.value ?? '-5'),
    endX:      parseFloat(endInput?.value   ?? '5'),
    stepSize:  parseFloat(stepInput?.value  ?? '1'),
    precision: calculatorState.precision,
  }

  const rows = buildTable(
    firstFunction,
    tableConfig,
    calculatorState.environment,
    calculatorState.angleMode,
  )

  tableBody.innerHTML = ''
  for (const row of rows) {
    const tableRow = document.createElement('tr')
    tableRow.innerHTML = `<td>${row.xDisplay}</td><td>${row.yDisplay}</td>`
    tableBody.appendChild(tableRow)
  }
}
```

Call `renderTable()` at the end of `updateDisplay()`. Wire the input controls
to call `renderTable()` on change.

---

## Connect the Pieces

The table uses the same `evaluateAt` and `formatResult` as the graph. They share
the same function definition, the same environment, and the same precision setting.
When lesson 15 adds multiple functions, the table will grow more columns — one
per function.

---

## What Breaks Without This

Without the tolerance fix (`config.stepSize * 0.001`) in the loop condition,
the table misses the final row when step produces a float endpoint. `for x = 1 to 3 step 1`
ends at `2.9999999999` and never reaches `3`. The table shows two rows instead of three.
This bug is invisible unless you know to look for it.

---

## Definition of Done

- [ ] The table shows x and f(x) values for the configured range and step
- [ ] Undefined values display as `—`
- [ ] Changing start/end/step updates the table immediately
- [ ] Table values respect the current display precision
- [ ] `buildTable` is a pure function tested independently
- [ ] `npm test` passes all new tests
