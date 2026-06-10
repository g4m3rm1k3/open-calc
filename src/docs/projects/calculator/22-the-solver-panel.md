# Lesson 22 — The Solver Panel

## What You Will Build

A panel where you enter a function, choose an operation — root, intersect,
integrate, minimum, maximum — set parameters, and see the result annotated on
the graph. This is the integration lesson: every component built across the
previous 21 lessons is wired together through a single interface.

## What You Need to Know First

All previous lessons. This lesson adds no new algorithms. It connects existing
ones through a user interface.

---

## The Lesson

### The problem

All five numerical operations exist as pure functions in separate modules.
The user has no way to invoke them except by writing code. The solver panel is
the user-facing interface to these functions.

The SE challenge: five different operations with different inputs, outputs, and
visual annotations — all in one panel without duplication of logic.

---

### Step 1 — The operation type

Add to `src/types.ts`:

```typescript
export const SolverOperation = {
  ROOT:        'ROOT',
  INTERSECT:   'INTERSECT',
  INTEGRATE:   'INTEGRATE',
  MINIMUM:     'MINIMUM',
  MAXIMUM:     'MAXIMUM',
} as const

export type SolverOperation = typeof SolverOperation[keyof typeof SolverOperation]
```

---

### Step 2 — The solver panel HTML

Add to `index.html`:

```html
<div class="solver-panel" id="solver-panel">
  <h3 class="solver-title">Solver</h3>

  <div class="solver-field">
    <label class="solver-label">Function</label>
    <select class="solver-select" id="solver-function-select"></select>
  </div>

  <div class="solver-field">
    <label class="solver-label">Operation</label>
    <select class="solver-select" id="solver-operation-select">
      <option value="ROOT">Find Root</option>
      <option value="INTERSECT">Find Intersection</option>
      <option value="INTEGRATE">Integrate</option>
      <option value="MINIMUM">Find Minimum</option>
      <option value="MAXIMUM">Find Maximum</option>
    </select>
  </div>

  <div class="solver-field" id="solver-second-function-field" style="display:none">
    <label class="solver-label">Second Function</label>
    <select class="solver-select" id="solver-second-function-select"></select>
  </div>

  <div class="solver-field">
    <label class="solver-label">Lower Bound</label>
    <input type="number" class="solver-input" id="solver-lower" value="-5" step="1" />
  </div>

  <div class="solver-field">
    <label class="solver-label">Upper Bound</label>
    <input type="number" class="solver-input" id="solver-upper" value="5" step="1" />
  </div>

  <div class="solver-field" id="solver-method-field" style="display:none">
    <label class="solver-label">Method</label>
    <select class="solver-select" id="solver-method-select">
      <option value="BISECTION">Bisection</option>
      <option value="NEWTON">Newton's Method</option>
    </select>
  </div>

  <button class="solver-run-btn" id="solver-run">Solve</button>

  <div class="solver-result" id="solver-result"></div>
</div>
```

Add tokens and styles:

```css
:root {
  --color-solver-bg:      #0f172a;
  --color-solver-label:   #94a3b8;
  --color-solver-result:  #e2e8f0;
  --font-size-solver:     0.8rem;
}

.solver-panel {
  background-color: var(--color-solver-bg);
  border:           1px solid var(--color-border);
  border-radius:    var(--radius-calculator);
  padding:          var(--spacing-md);
  min-width:        220px;
}

.solver-title {
  color:       var(--color-solver-label);
  font-family: var(--font-family-display);
  font-size:   var(--font-size-solver);
  font-weight: normal;
  margin-bottom: var(--spacing-sm);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.solver-field {
  display:       flex;
  flex-direction: column;
  gap:           0.25rem;
  margin-bottom: var(--spacing-sm);
}

.solver-label {
  color:       var(--color-solver-label);
  font-size:   var(--font-size-solver);
  font-family: var(--font-family-display);
}

.solver-select,
.solver-input {
  background-color: var(--color-button-bg);
  color:            var(--color-display-text);
  border:           1px solid var(--color-border);
  border-radius:    var(--radius-display);
  padding:          0.3rem var(--spacing-sm);
  font-size:        var(--font-size-solver);
  font-family:      var(--font-family-display);
}

.solver-run-btn {
  width:            100%;
  margin-top:       var(--spacing-sm);
  background-color: var(--color-operator-bg);
  color:            var(--color-display-text);
  border:           none;
  border-radius:    var(--radius-display);
  padding:          var(--spacing-sm);
  font-size:        var(--font-size-solver);
  font-family:      var(--font-family-display);
  cursor:           pointer;
  height:           auto;
}

.solver-run-btn:hover {
  background-color: var(--color-operator-hover);
}

.solver-result {
  margin-top:  var(--spacing-sm);
  color:       var(--color-solver-result);
  font-size:   var(--font-size-solver);
  font-family: var(--font-family-display);
  line-height: 1.6;
}

.solver-result.error {
  color: var(--color-error, #f87171);
}
```

---

### Step 3 — The solver dispatch

Create `src/solver-panel.ts`:

```typescript
import { bisect }          from './bisection-solver.js'
import { newton }          from './newton-solver.js'
import { findIntersection } from './intersection-finder.js'
import { integrate, IntegrationMethod } from './integrator.js'
import { findExtremum }    from './extrema-finder.js'
import { isCalcError }     from './calc-error.js'
import { SolverOperation } from './types.js'
import { formatResult }    from './format-number.js'

export interface SolverInput {
  operation:       SolverOperation
  primaryFunction: UserFunction
  secondFunction?: UserFunction
  lowerBound:      number
  upperBound:      number
  useNewton:       boolean
  environment:     Environment
  angleMode:       AngleMode
  precision:       PrecisionLevel
}

export interface SolverOutput {
  summary:     string
  annotation:  SolverAnnotation | null
  isError:     boolean
}

export type SolverAnnotation =
  | { type: 'ROOT';        x: number }
  | { type: 'INTERSECT';   x: number; y: number }
  | { type: 'AREA';        lowerBound: number; upperBound: number; value: number; fn: UserFunction }
  | { type: 'EXTREMUM';    x: number; y: number; extremumType: ExtremumType }

export function runSolver(input: SolverInput): SolverOutput {
  switch (input.operation) {
    case SolverOperation.ROOT: {
      const method = input.useNewton ? 'Newton' : 'Bisection'
      const result = input.useNewton
        ? newton(input.primaryFunction, (input.lowerBound + input.upperBound) / 2, input.environment, input.angleMode)
        : bisect(input.primaryFunction, input.lowerBound, input.upperBound, input.environment, input.angleMode)

      if (isCalcError(result)) {
        return { summary: `Error: ${result.message}`, annotation: null, isError: true }
      }
      return {
        summary:    `Root found at x = ${formatResult(result.root, input.precision)}\nf(x) = ${formatResult(result.fAtRoot, input.precision)}\nIterations: ${result.iterations} (${method})`,
        annotation: { type: 'ROOT', x: result.root },
        isError:    false,
      }
    }

    case SolverOperation.INTERSECT: {
      if (input.secondFunction === undefined) {
        return { summary: 'Error: select a second function', annotation: null, isError: true }
      }
      const result = findIntersection(
        input.primaryFunction, input.secondFunction,
        input.lowerBound, input.upperBound,
        input.environment, input.angleMode,
      )
      if (isCalcError(result)) {
        return { summary: `Error: ${result.message}`, annotation: null, isError: true }
      }
      const yValue = evaluateAt(input.primaryFunction, result.root, input.environment, input.angleMode) ?? 0
      return {
        summary:    `Intersection at x = ${formatResult(result.root, input.precision)}\ny = ${formatResult(yValue, input.precision)}\nIterations: ${result.iterations}`,
        annotation: { type: 'INTERSECT', x: result.root, y: yValue },
        isError:    false,
      }
    }

    case SolverOperation.INTEGRATE: {
      const result = integrate(
        input.primaryFunction,
        input.lowerBound, input.upperBound,
        IntegrationMethod.TRAPEZOID, 1000,
        input.environment, input.angleMode,
      )
      if (isCalcError(result)) {
        return { summary: `Error: ${result.message}`, annotation: null, isError: true }
      }
      return {
        summary:    `∫f(x)dx from ${input.lowerBound} to ${input.upperBound}\n= ${formatResult(result.value, input.precision)}\n(Trapezoid rule, 1000 steps)`,
        annotation: { type: 'AREA', lowerBound: input.lowerBound, upperBound: input.upperBound, value: result.value, fn: input.primaryFunction },
        isError:    false,
      }
    }

    case SolverOperation.MINIMUM:
    case SolverOperation.MAXIMUM: {
      const result = findExtremum(input.primaryFunction, input.lowerBound, input.upperBound, input.environment, input.angleMode)
      if (isCalcError(result)) {
        return { summary: `Error: ${result.message}`, annotation: null, isError: true }
      }
      const label = input.operation === SolverOperation.MINIMUM ? 'Minimum' : 'Maximum'
      return {
        summary:    `${label} at x = ${formatResult(result.xValue, input.precision)}\nf(x) = ${formatResult(result.fValue, input.precision)}\nType: ${result.extremumType}\nIterations: ${result.iterations}`,
        annotation: { type: 'EXTREMUM', x: result.xValue, y: result.fValue, extremumType: result.extremumType },
        isError:    false,
      }
    }
  }
}
```

**SE lens — the dispatch pattern:**
`runSolver` is a dispatch function: it receives an operation type and routes to
the correct algorithm. The `switch` statement is the explicit, readable form of
a dispatch table for operations that have different input shapes. Each case does
one thing: call the algorithm, check for error, format the result.

Every algorithm call is one line. No algorithm logic lives in `runSolver`. The
function coordinates — it does not compute. This is separation of concerns at
the function level.

**SE lens — the annotation type:**
`SolverAnnotation` is a discriminated union — each variant has a `type` field
that identifies which case it is. The rendering code switches on `annotation.type`
to draw the right thing: a dot for a root, a shaded area for integration, a
triangle marker for an extremum. The type system enforces that the renderer handles
every case. If a new operation is added, adding its annotation to the union and
omitting it from the renderer is a compile error.

---

### Step 4 — Wire the panel to the graph

Add to `src/main.ts`:

```typescript
function updateSolverFunctionSelects(): void {
  const functionNames  = Object.keys(calculatorState.environment.functions)
  const primarySelect  = document.querySelector<HTMLSelectElement>('#solver-function-select')!
  const secondarySelect = document.querySelector<HTMLSelectElement>('#solver-second-function-select')!

  for (const select of [primarySelect, secondarySelect]) {
    const currentValue = select.value
    select.innerHTML   = ''
    for (const name of functionNames) {
      const option = document.createElement('option')
      option.value     = name
      option.textContent = name
      select.appendChild(option)
    }
    if (functionNames.includes(currentValue)) select.value = currentValue
  }
}

document.querySelector('#solver-run')?.addEventListener('click', () => {
  const primaryName = (document.querySelector<HTMLSelectElement>('#solver-function-select'))?.value
  const operation   = (document.querySelector<HTMLSelectElement>('#solver-operation-select'))?.value as SolverOperation

  const primaryFunction = primaryName
    ? calculatorState.environment.functions[primaryName]
    : undefined

  if (primaryFunction === undefined) return

  const secondaryName  = (document.querySelector<HTMLSelectElement>('#solver-second-function-select'))?.value
  const secondFunction = secondaryName ? calculatorState.environment.functions[secondaryName] : undefined

  const solverInput: SolverInput = {
    operation,
    primaryFunction,
    secondFunction,
    lowerBound:  parseFloat((document.querySelector<HTMLInputElement>('#solver-lower'))?.value ?? '-5'),
    upperBound:  parseFloat((document.querySelector<HTMLInputElement>('#solver-upper'))?.value ?? '5'),
    useNewton:   (document.querySelector<HTMLSelectElement>('#solver-method-select'))?.value === 'NEWTON',
    environment: calculatorState.environment,
    angleMode:   calculatorState.angleMode,
    precision:   calculatorState.precision,
  }

  const output = runSolver(solverInput)

  const resultDiv = document.querySelector<HTMLDivElement>('#solver-result')!
  resultDiv.textContent = output.summary
  resultDiv.className   = `solver-result${output.isError ? ' error' : ''}`

  // Store the annotation in state so redrawGraph can render it
  calculatorState = { ...calculatorState, solverAnnotation: output.annotation ?? null }
  redrawGraph()
})
```

In `redrawGraph`, after drawing all functions, render the annotation:

```typescript
if (calculatorState.solverAnnotation !== null) {
  const annotation = calculatorState.solverAnnotation
  switch (annotation.type) {
    case 'ROOT':
      drawRootMarker(graphContext, annotation.x, viewport, '#ffffff')
      break
    case 'INTERSECT':
      drawIntersectionMarker(graphContext, annotation.x, annotation.y, viewport)
      break
    case 'AREA':
      drawShadedArea(graphContext, annotation.fn, annotation.lowerBound, annotation.upperBound, viewport, calculatorState.environment, calculatorState.angleMode, '#38bdf8')
      break
    case 'EXTREMUM':
      drawExtremumMarker(graphContext, annotation.x, annotation.y, annotation.extremumType, viewport)
      break
  }
}
```

---

## Connect the Pieces

The solver panel is the final integration point. It calls `runSolver`, which calls
the individual solvers, which call `evaluateAt`, which calls `parseExpression`,
which uses the `Environment`, `AngleMode`, and `UserFunction` objects. The full
chain from user input to canvas annotation passes through every module built across
22 lessons.

Every module is in the right place. Every interface is clean. The solver panel
adds zero logic — it only coordinates.

---

## What Breaks Without This

Without the `SolverAnnotation` discriminated union, the renderer receives an
untyped object and switches on `annotation.type` as a plain string. TypeScript
cannot check that the renderer handles every case. Add a new operation, forget
to add its annotation type, and nothing tells you. The annotation renders nothing
and there is no error message.

With the union, the TypeScript `switch` on `annotation.type` has exhaustiveness
checking: if any variant is unhandled, the compiler reports it. Adding a new
operation and forgetting the renderer is a compile error, not a silent failure
at runtime.

---

## Definition of Done

- [ ] The solver panel is visible with operation selector and bounds inputs
- [ ] Root, intersect, integrate, minimum, and maximum all produce results
- [ ] Results are annotated on the graph
- [ ] Switching operations shows/hides the second function selector and method selector
- [ ] Invalid input shows a specific error message, not a crash
- [ ] The solver panel imports from algorithm modules — no logic is duplicated inside it
- [ ] All solver colours and styles come from CSS custom properties
- [ ] The complete application passes all tests: `npm test`
