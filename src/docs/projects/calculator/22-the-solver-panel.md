# Calculator — Lesson 22 — The Solver Panel

## What You Will Build

A panel where you select a function, choose an operation — find root, find
intersection, integrate, find minimum, find maximum — set bounds, and press Solve.
The result appears in text and is annotated on the graph. All five numerical methods
from lessons 16–21 are accessible through one interface. No new algorithms are written.

## What You Need to Know First

All previous lessons. This lesson adds no new algorithms and no new data structures.
It connects existing ones through a user interface and a dispatch function.

---

## The Problem

All five numerical operations exist as pure functions in separate modules. The user
cannot access them without writing code. The solver panel is the user-facing
interface to these functions — the final piece of the application.

The SE challenge: five different operations with different inputs (some need a second
function, some need a method choice), different outputs (root vs area vs extremum),
and different visual annotations — all handled in one panel without duplicating any
algorithm logic.

---

## Step 1 — The Operation Type

Add to `src/types.ts`:

```typescript
export const SolverOperation = {
  ROOT:      'ROOT',
  INTERSECT: 'INTERSECT',
  INTEGRATE: 'INTEGRATE',
  MINIMUM:   'MINIMUM',
  MAXIMUM:   'MAXIMUM',
} as const

export type SolverOperation = typeof SolverOperation[keyof typeof SolverOperation]
```

Same `as const` pattern as `ButtonType`, `AngleMode`, and all other closed
enumerations in this project. The solver panel's operation selector produces a
`SolverOperation` value. The dispatch function switches on it.

---

## Step 2 — The Solver Panel HTML

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

  <div class="solver-field" id="solver-second-function-field">
    <label class="solver-label">Second Function</label>
    <select class="solver-select" id="solver-second-function-select"></select>
  </div>

  <div class="solver-field">
    <label class="solver-label">Lower Bound</label>
    <input type="number" class="solver-input" id="solver-lower" value="-5" step="1">
  </div>

  <div class="solver-field">
    <label class="solver-label">Upper Bound</label>
    <input type="number" class="solver-input" id="solver-upper" value="5" step="1">
  </div>

  <div class="solver-field" id="solver-method-field">
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

**`<h3>` — first appearance:**
`<h3>` is a third-level heading — below `<h1>` (page title) and `<h2>` (section
heading). HTML has six heading levels (`<h1>`–`<h6>`). Headings communicate
document hierarchy to screen readers and search engines. Using `<h3>` here is
correct because the solver panel is a sub-panel of a sub-section of the page.

Add to `style.css`:

```css
:root {
  --colour-solver-bg:     #0f172a;
  --colour-solver-label:  #94a3b8;
  --colour-solver-result: #e2e8f0;
  --font-size-solver:     0.8rem;
}

.solver-panel {
  background-color: var(--colour-solver-bg);
  border:           1px solid var(--colour-border);
  border-radius:    var(--radius-calculator);
  padding:          var(--space-md);
  min-width:        220px;
}

.solver-title {
  color:          var(--colour-solver-label);
  font-family:    var(--font-display);
  font-size:      var(--font-size-solver);
  font-weight:    normal;
  margin-bottom:  var(--space-sm);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.solver-field {
  display:        flex;
  flex-direction: column;
  gap:            0.25rem;
  margin-bottom:  var(--space-sm);
}

.solver-label {
  color:       var(--colour-solver-label);
  font-size:   var(--font-size-solver);
  font-family: var(--font-display);
}

.solver-select,
.solver-input {
  background-color: var(--colour-button-bg);
  color:            var(--colour-display-text);
  border:           1px solid var(--colour-border);
  border-radius:    var(--radius-display);
  padding:          0.3rem var(--space-sm);
  font-size:        var(--font-size-solver);
  font-family:      var(--font-display);
}

.solver-run-btn {
  width:            100%;
  margin-top:       var(--space-sm);
  background-color: var(--colour-operator-bg);
  color:            var(--colour-display-text);
  border:           none;
  border-radius:    var(--radius-display);
  padding:          var(--space-sm);
  font-size:        var(--font-size-solver);
  font-family:      var(--font-display);
  cursor:           pointer;
  height:           auto;
}

.solver-run-btn:hover {
  background-color: var(--colour-operator-hover);
}

.solver-result {
  margin-top:  var(--space-sm);
  color:       var(--colour-solver-result);
  font-size:   var(--font-size-solver);
  font-family: var(--font-display);
  line-height: 1.6;
  white-space: pre-wrap;
}

.solver-result.error {
  color: #f87171;
}
```

**`white-space: pre-wrap`:**
`pre-wrap` preserves whitespace and line breaks (like `pre`) but wraps long lines
to fit the container (unlike `pre`, which can overflow). The solver result summary
uses newline characters (`\n`) between lines. `pre-wrap` renders them as visible
line breaks, matching the multi-line output format.

**`text-transform: uppercase` and `letter-spacing`:**
These two properties together produce the SMALL CAPS style for the "SOLVER" title.
`uppercase` capitalises all characters. `letter-spacing: 0.1em` adds space between
letters — standard for uppercase labels in UI design. The label reads as a section
header, not running text.

---

## Step 3 — The Solver Dispatch

Create `src/solver-panel.ts`:

```typescript
import { bisect }               from './bisection-solver.js'
import { newton }               from './newton-solver.js'
import { findIntersection }     from './intersection-finder.js'
import { integrate,
         IntegrationMethod }    from './integrator.js'
import { findExtremum,
         ExtremumType }         from './extrema-finder.js'
import { evaluateAt }           from './function-evaluator.js'
import { isCalcError }          from './calc-error.js'
import { SolverOperation,
         UserFunction,
         AngleMode }            from './types.js'
import { formatResult,
         PrecisionLevel }       from './format-number.js'
import { Environment }          from './environment.js'

export type SolverAnnotation =
  | { type: 'ROOT';      x: number                                          }
  | { type: 'INTERSECT'; x: number; y: number                               }
  | { type: 'AREA';      lowerBound: number; upperBound: number; fn: UserFunction }
  | { type: 'EXTREMUM';  x: number; y: number; extremumType: ExtremumType   }

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
  summary:    string
  annotation: SolverAnnotation | null
  isError:    boolean
}

export function runSolver(input: SolverInput): SolverOutput {
  switch (input.operation) {

    case SolverOperation.ROOT: {
      const methodLabel = input.useNewton ? 'Newton' : 'Bisection'
      const midpoint    = (input.lowerBound + input.upperBound) / 2
      const result      = input.useNewton
        ? newton(input.primaryFunction, midpoint, input.environment, input.angleMode)
        : bisect(input.primaryFunction, input.lowerBound, input.upperBound,
                 input.environment, input.angleMode)

      if (isCalcError(result)) {
        return { summary: `Error: ${result.message}`, annotation: null, isError: true }
      }
      return {
        summary: [
          `Root at x = ${formatResult(result.root, input.precision)}`,
          `f(x) = ${formatResult(result.fAtRoot, input.precision)}`,
          `Iterations: ${result.iterations} (${methodLabel})`,
        ].join('\n'),
        annotation: { type: 'ROOT', x: result.root },
        isError: false,
      }
    }

    case SolverOperation.INTERSECT: {
      if (input.secondFunction === undefined) {
        return {
          summary: 'Error: select a second function',
          annotation: null, isError: true,
        }
      }
      const result = findIntersection(
        input.primaryFunction, input.secondFunction,
        input.lowerBound, input.upperBound,
        input.environment, input.angleMode,
      )
      if (isCalcError(result)) {
        return { summary: `Error: ${result.message}`, annotation: null, isError: true }
      }
      const yValue =
        evaluateAt(input.primaryFunction, result.root, input.environment, input.angleMode) ?? 0
      return {
        summary: [
          `Intersection at x = ${formatResult(result.root, input.precision)}`,
          `y = ${formatResult(yValue, input.precision)}`,
          `Iterations: ${result.iterations}`,
        ].join('\n'),
        annotation: { type: 'INTERSECT', x: result.root, y: yValue },
        isError: false,
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
        summary: [
          `∫f(x)dx from ${input.lowerBound} to ${input.upperBound}`,
          `= ${formatResult(result.value, input.precision)}`,
          `(Trapezoid rule, 1000 steps)`,
        ].join('\n'),
        annotation: {
          type: 'AREA',
          lowerBound: input.lowerBound,
          upperBound: input.upperBound,
          fn: input.primaryFunction,
        },
        isError: false,
      }
    }

    case SolverOperation.MINIMUM:
    case SolverOperation.MAXIMUM: {
      const result = findExtremum(
        input.primaryFunction,
        input.lowerBound, input.upperBound,
        input.environment, input.angleMode,
      )
      if (isCalcError(result)) {
        return { summary: `Error: ${result.message}`, annotation: null, isError: true }
      }
      const label = input.operation === SolverOperation.MINIMUM ? 'Minimum' : 'Maximum'
      return {
        summary: [
          `${label} at x = ${formatResult(result.xValue, input.precision)}`,
          `f(x) = ${formatResult(result.fValue, input.precision)}`,
          `Type: ${result.extremumType}`,
          `Iterations: ${result.iterations}`,
        ].join('\n'),
        annotation: {
          type: 'EXTREMUM',
          x: result.xValue,
          y: result.fValue,
          extremumType: result.extremumType,
        },
        isError: false,
      }
    }
  }
}
```

**What `src/solver-panel.ts` is:**
`solver-panel.ts` is the coordination layer. It receives `SolverInput`, routes to
the correct algorithm, and returns `SolverOutput`. It contains no algorithm logic.
Every operation is one function call. The module's responsibility is to coordinate,
not compute.

**`SolverAnnotation` as a discriminated union:**
`SolverAnnotation` is the same discriminated union pattern as `ExprToken` (lesson 07)
and `SolverResult` (lesson 18). Each variant has a `type` field. The rendering code
switches on `annotation.type` to draw the correct visual. TypeScript's exhaustiveness
checking ensures that if a new operation is added and its annotation type is added
to the union, the renderer will produce a compile error if it does not handle it.

**`SE lens — dispatch, don't compute:**
`runSolver` is a dispatch function. It routes operations to algorithms. It does not
implement any algorithm. A function that only coordinates is easy to read, easy to
extend (add a case to the switch), and impossible to have algorithm bugs in. The
algorithms are in their own modules, testable in isolation.

This is the same pattern as the dispatch table in lesson 09 (`BUILT_IN_FUNCTIONS`),
applied to operations with different input shapes. There, a simple object lookup
worked. Here, a `switch` statement is the right tool because each case has a
different input structure.

**`Array.join('\n')`:**
`[line1, line2, line3].join('\n')` joins array elements into a string, separated
by newlines. This is more readable than string concatenation with `\n` scattered
throughout. The result is a multi-line string that `white-space: pre-wrap` renders
as multiple lines.

---

## Step 4 — Wire the Panel to the Graph

Add to `src/main.ts`:

```typescript
import { runSolver, SolverInput, SolverAnnotation } from './solver-panel.js'
import { SolverOperation }  from './types.js'
import { drawRootMarker, drawIntersectionMarker,
         drawShadedArea, drawExtremumMarker }        from './graph-renderer.js'

// Stored in state so redrawGraph can render it
let solverAnnotation: SolverAnnotation | null = null

function updateSolverSelects(): void {
  const functionNames = Object.keys(calculatorState.environment.functions)
  for (const selectId of ['#solver-function-select', '#solver-second-function-select']) {
    const selectElement = document.querySelector<HTMLSelectElement>(selectId)
    if (selectElement === null) continue
    const currentValue = selectElement.value
    selectElement.textContent = ''
    for (const name of functionNames) {
      const optionElement = document.createElement('option')
      optionElement.value       = name
      optionElement.textContent = name
      selectElement.appendChild(optionElement)
    }
    if (functionNames.includes(currentValue)) selectElement.value = currentValue
  }
}

// Show/hide second function and method fields based on selected operation
document.querySelector('#solver-operation-select')
  ?.addEventListener('change', () => {
    const operationValue = (document.querySelector<HTMLSelectElement>('#solver-operation-select'))?.value
    const secondField    = document.querySelector<HTMLElement>('#solver-second-function-field')
    const methodField    = document.querySelector<HTMLElement>('#solver-method-field')

    if (secondField !== null) {
      secondField.style.display =
        operationValue === 'INTERSECT' ? 'flex' : 'none'
    }
    if (methodField !== null) {
      methodField.style.display =
        operationValue === 'ROOT' ? 'flex' : 'none'
    }
  })

document.querySelector('#solver-run')?.addEventListener('click', () => {
  const operationValue = (document.querySelector<HTMLSelectElement>('#solver-operation-select'))?.value as SolverOperation
  const primaryName    = (document.querySelector<HTMLSelectElement>('#solver-function-select'))?.value
  const primaryFn      = primaryName ? calculatorState.environment.functions[primaryName] : undefined

  if (primaryFn === undefined) return

  const secondaryName = (document.querySelector<HTMLSelectElement>('#solver-second-function-select'))?.value
  const secondaryFn   = secondaryName ? calculatorState.environment.functions[secondaryName] : undefined

  const lowerValue = parseFloat((document.querySelector<HTMLInputElement>('#solver-lower'))?.value ?? '-5')
  const upperValue = parseFloat((document.querySelector<HTMLInputElement>('#solver-upper'))?.value ?? '5')

  const solverInput: SolverInput = {
    operation:       operationValue,
    primaryFunction: primaryFn,
    secondFunction:  secondaryFn,
    lowerBound:      lowerValue,
    upperBound:      upperValue,
    useNewton:       (document.querySelector<HTMLSelectElement>('#solver-method-select'))?.value === 'NEWTON',
    environment:     calculatorState.environment,
    angleMode:       calculatorState.angleMode,
    precision:       calculatorState.precision,
  }

  const output = runSolver(solverInput)

  const resultElement = document.querySelector<HTMLDivElement>('#solver-result')
  if (resultElement !== null) {
    resultElement.textContent = output.summary
    resultElement.className   = `solver-result${output.isError ? ' error' : ''}`
  }

  solverAnnotation = output.annotation
  redrawGraph()
})
```

In `redrawGraph`, after drawing all functions, render the annotation:

```typescript
if (solverAnnotation !== null) {
  switch (solverAnnotation.type) {
    case 'ROOT':
      drawRootMarker(graphContext, solverAnnotation.x, viewport, '#ffffff')
      break
    case 'INTERSECT':
      drawIntersectionMarker(
        graphContext, solverAnnotation.x, solverAnnotation.y, viewport)
      break
    case 'AREA':
      drawShadedArea(
        graphContext, solverAnnotation.fn,
        solverAnnotation.lowerBound, solverAnnotation.upperBound,
        viewport, calculatorState.environment, calculatorState.angleMode,
        '#38bdf8')
      break
    case 'EXTREMUM':
      drawExtremumMarker(
        graphContext, solverAnnotation.x, solverAnnotation.y,
        solverAnnotation.extremumType, viewport)
      break
  }
}
```

Call `updateSolverSelects()` at the end of `updateDisplay()` to keep the function
dropdowns current as functions are defined.

**`element.style.display = 'none'` — first appearance:**
Setting `style.display = 'none'` hides an element — it takes up no space and is
not rendered. `'flex'` restores it as a flex container. This is how the second
function field and method field are shown or hidden based on the selected operation.
The alternative — `display: none` in CSS with a class toggle — would also work and
is often preferable for complex show/hide logic, but direct style assignment is
appropriate here.

### Walkthrough — finding the root of `f(x) = x^2 - 4` using bisection in [-5, 5]

1. User selects `f` from the function dropdown, selects "Find Root", sets bounds to
   -5 and 5, method to Bisection.

2. User clicks Solve. `runSolver` is called.

3. `operationValue === 'ROOT'`, `useNewton === false`. `bisect(f, -5, 5, env, DEG)` is called.

4. `bisect` returns `{ root: -2, fAtRoot: ~0, iterations: 37, steps: [...] }`.
   (Bisection in [-5, 5] converges to the -2 root — the midpoint of [-5, 5] is 0,
   and since `f(-5) = 21 > 0` and `f(0) = -4 < 0`, the first bracket is [-5, 0],
   which contains the root at -2.)

5. `runSolver` formats the output:
   ```
   Root at x = -2
   f(x) = 0
   Iterations: 37 (Bisection)
   ```

6. `resultElement.textContent` is set to this string. `solverAnnotation = { type: 'ROOT', x: -2 }`.

7. `redrawGraph()` is called. After drawing the coordinate plane and all functions,
   the annotation switch matches `'ROOT'` → `drawRootMarker` draws a circle at
   `(-2, 0)` on the canvas.

---

## Debugging: When the Solver Panel Behaves Wrongly

**Symptom: running the solver produces no output — panel stays empty**

`runSolver` may have returned a `CalcError`, or the result display element is not
found. Add a log:
```typescript
console.log('solver result:', result)
```
If `result` is a `CalcError`, the selected function may be undefined or the bounds
may be invalid. Check that a function is defined before running the solver and that
the bound inputs contain parseable numbers.

**Symptom: a solver method button does not respond to clicks**

The event listener was not attached to that button. Check that the `#solver-run`
button has a `click` listener and that the selected method is read from the correct
input element (e.g., the selected radio button or dropdown value).

**Symptom: the marker appears on the canvas but at the wrong position after zoom**

The annotation uses the mathematical coordinate stored in `solverAnnotation`. If this
coordinate was correct at the time it was computed but you have since zoomed or panned,
`drawRootMarker` maps it through the *current* viewport. The annotation position in
mathematical space is fixed — only its pixel position changes with zoom. If the marker
appears at the wrong position on a fresh render, check that `solverAnnotation.x` holds
the mathematical root coordinate, not a canvas pixel coordinate.

**Symptom: solver panel shows results but the canvas marker is missing**

`redrawGraph()` is not called after computing the solver result, or the annotation
switch in `redrawGraph` does not handle the result type. Verify the order:
```typescript
solverAnnotation = { type: 'ROOT', x: result.root }
redrawGraph()  // must come AFTER solverAnnotation is set
```

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

The solver panel is the integration point of the entire project. It calls `runSolver`,
which calls the individual solvers, which call `evaluateAt`, which calls
`parseExpression`, which uses the `Environment`, `AngleMode`, and `UserFunction`
objects. The full chain from user input to canvas annotation passes through every
module built across 22 lessons.

The architecture held:
- Every module has one responsibility and one place to change.
- Every algorithm is a pure function, testable without a UI.
- Every type is a discriminated union or literal type, checked by the compiler.
- The viewport abstraction made zoom/pan transparent to all rendering code.
- Problem reduction eliminated duplicate algorithms.
- The reducer pattern made state transitions predictable.

The solver panel added zero new algorithm logic. It only wired together what already
existed.

---

## What Breaks Without This

**Without `SolverAnnotation` as a discriminated union:**
The rendering code receives an untyped object and switches on `annotation.type` as
a plain `string`. TypeScript cannot verify that all cases are handled. Add a new
operation, forget to add its renderer — no error. The annotation renders nothing
silently. With the union, the omission is a compile error.

**Without `white-space: pre-wrap`:**
The multi-line result summary — built with `.join('\n')` — renders as a single line
with `\n` characters showing as spaces. The result is unreadable. `pre-wrap` makes
the line breaks render as visual line breaks without needing `<br>` tags or separate
DOM elements for each line.

---

## Definition of Done

- [ ] The solver panel is visible with operation selector, bounds inputs, and Solve button
- [ ] All five operations — root, intersection, integrate, minimum, maximum — produce results
- [ ] Results are annotated on the graph with the appropriate visual marker
- [ ] Selecting INTERSECT shows the second function dropdown; selecting ROOT shows the method dropdown; others hide both
- [ ] Invalid input → specific error message, no crash
- [ ] `solverAnnotation` persists through zoom and pan (the annotation redraws with the viewport)
- [ ] The solver panel imports from algorithm modules — no algorithm logic lives inside it
- [ ] All colours and styles come from CSS custom properties
- [ ] `npm test` — the complete application passes all tests
- [ ] You can explain what `SolverAnnotation` is and why its discriminated union enables exhaustiveness checking
- [ ] You can explain `element.style.display = 'none'` and when it is appropriate
- [ ] You can explain `white-space: pre-wrap` and why it is needed here
- [ ] You can explain `Array.join('\n')` and what it produces
- [ ] You can trace a full root-finding operation from the Solve button click through
      `runSolver`, `bisect`, `redrawGraph`, and `drawRootMarker`
- [ ] You can name all five numerical operations and which lesson introduced each algorithm
- [ ] Run:
      ```
      git add src/types.ts src/solver-panel.ts src/main.ts index.html src/style.css
      git commit -m "Add solver panel: five numerical operations wired to a unified UI, discriminated union annotation drives canvas rendering, no algorithm logic in the panel"
      ```

---

*The calculator is complete. You have built a working scientific calculator with
expression parsing, variable storage, user-defined functions, graphing, numerical
integration, and five numerical solvers — from a blank HTML file to a full
application, lesson by lesson, each step building on a visible result.*
