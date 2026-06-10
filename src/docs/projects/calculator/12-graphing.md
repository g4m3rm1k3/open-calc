# Calculator — Lesson 12 — Graphing

## What You Will Build

After defining `f(x) = x^2`, the parabola appears on the canvas. `f(x) = sin(x)`
plots a sine wave. Redefining `f(x)` immediately updates the graph. Points where
the function is undefined produce a visible gap rather than a connecting line.

## What You Need to Know First

Lessons 01–11. User functions exist (lesson 10) and the coordinate plane is rendered
(lesson 11). This lesson connects them: evaluate the function at sample x values and
draw the resulting curve using the canvas path API.

---

## The Problem

A graph of `f(x)` is the visual trace of all output values of `f` across a domain.
We cannot draw infinitely many points — computers are finite. We sample at a finite
number of x values and connect them with line segments. The key questions:
how many samples, how are they connected, and what happens when the function is
undefined at a point?

---

## Step 1 — Maths: Continuous Functions and Discrete Sampling

### Continuous functions

A function is **continuous** at a point if small changes in input produce small
changes in output — informally, you can draw it without lifting your pen. `f(x) = x^2`
is continuous everywhere. `f(x) = 1/x` is continuous everywhere except `x = 0`.

When graphing a continuous function, we connect sample points with straight line
segments. With enough samples, the segments are shorter than a pixel and the result
looks like a smooth curve. This is the same idea as digital audio: a continuous
sound wave is sampled 44,100 times per second, and when played back it sounds
continuous.

### Domain and visible range

The domain of a function is the set of x values for which it is defined.
`sqrt(x)` requires `x ≥ 0`, so its graph only exists for positive x. `1/x` is
undefined at x=0, so its graph has a gap there. When we sample over the visible
viewport range, some samples may land in undefined regions. Those samples produce
`null` from `evaluateAt` and the pen is lifted.

---

## Step 2 — The Function Evaluator

### The problem

The parser evaluates a full expression string. Graphing needs to evaluate a function
at a specific x value — binding the parameter and evaluating the body. This deserves
its own function.

### The code

Create `src/function-evaluator.ts`:

```typescript
import { parseExpression }           from './expression-parser.js'
import { Environment, bindVariable } from './environment.js'
import { AngleMode, UserFunction }   from './types.js'
import { isCalcError }               from './calc-error.js'

export function evaluateAt(
  userFunction: UserFunction,
  xValue:       number,
  environment:  Environment,
  angleMode:    AngleMode,
): number | null {
  const functionEnvironment = bindVariable(
    userFunction.parameterName,
    xValue,
    environment,
  )

  const { result } = parseExpression(
    userFunction.bodyExpression,
    functionEnvironment,
    angleMode,
  )

  if (isCalcError(result))         return null
  if (!isFinite(result as number)) return null
  if (isNaN(result as number))     return null

  return result as number
}
```

**What `src/function-evaluator.ts` is:**
`function-evaluator.ts` owns the single-point evaluation operation. It wraps
`parseExpression` with the parameter binding and result validation needed for
graphing and numerical methods. All lessons from 12 onward that evaluate a function
at a specific x value use `evaluateAt`.

### Walkthrough — `evaluateAt(f, 3, env, DEGREES)` where `f(x) = x^2 + 1`

`bindVariable('x', 3, environment)` → new environment with `x: 3`.

`parseExpression('x^2 + 1', functionEnvironment, DEGREES)`:
- Tokenise: `IDENTIFIER('x'), POWER, NUMBER(2), PLUS, NUMBER(1), EOF`
- Parse: `x` lookup → `3`. `3^2 = 9`. `9 + 1 = 10`.
- Result: `{ result: 10, environment: functionEnvironment }`

`isCalcError(10)` → false. `isFinite(10)` → true. `isNaN(10)` → false.
Return `10`. ✓

**SE lens — `null` as the undefined signal:**
`evaluateAt` returns `number | null`. `null` means: this function has no value at
this x — either it is mathematically undefined (division by zero, sqrt of negative),
or the result is non-finite (Infinity, -Infinity, NaN). The caller does not need
to distinguish between these cases. All it needs to know is: can I draw a point here?
`null` = no. A number = yes.

This is a clean, consistent contract. Every consumer of `evaluateAt` — the graphing
code, the table builder, the solvers — handles `null` the same way: skip this point.

---

## Step 3 — Sampling and Drawing

### The problem

`evaluateAt` gives one y value for one x value. Drawing a function means calling
`evaluateAt` many times and connecting the results. The connection uses the canvas
path API's pen metaphor.

### The code

Add to `src/graph-renderer.ts`:

```typescript
import { evaluateAt }   from './function-evaluator.js'
import { UserFunction } from './types.js'
import { Environment }  from './environment.js'
import { AngleMode }    from './types.js'
```

**Import explanation:**
`import { evaluateAt } from './function-evaluator.js'` — `function-evaluator.ts`
is the module responsible for single-point function evaluation (this lesson). We
import `evaluateAt` — the function that binds the parameter and evaluates the body
— because `drawFunction` calls it for each sample x value.

`import { UserFunction } from './types.js'` — `types.ts` is the central type
registry (lesson 02, extended in lesson 10). We import `UserFunction` for the
`userFunction` parameter type. Without it, TypeScript cannot check that
`userFunction.bodyExpression` and `userFunction.parameterName` exist.

`import { Environment } from './environment.js'` — `environment.ts` owns the symbol
table (lesson 08). We import `Environment` for the `environment` parameter type.
`evaluateAt` needs the environment to resolve any outer variables referenced inside
the function body.

`import { AngleMode } from './types.js'` — `types.ts` is the central type registry.
We import `AngleMode` for the `angleMode` parameter type. `evaluateAt` passes it to
`parseExpression` so trig functions use the correct degree/radian mode.

```typescript

export function drawFunction(
  context:      CanvasRenderingContext2D,
  userFunction: UserFunction,
  viewport:     Viewport,
  environment:  Environment,
  angleMode:    AngleMode,
  colour:       string,
): void {
  const sampleCount = viewport.canvasWidth  // one sample per pixel column
  const stepSize    = (viewport.xMax - viewport.xMin) / sampleCount

  context.strokeStyle = colour
  context.lineWidth   = 2
  context.beginPath()

  let isPenDown = false

  for (let sampleIndex = 0; sampleIndex <= sampleCount; sampleIndex++) {
    const mathX = viewport.xMin + sampleIndex * stepSize
    const mathY = evaluateAt(userFunction, mathX, environment, angleMode)

    if (mathY === null) {
      isPenDown = false  // lift the pen — gap here
      continue
    }

    const { canvasX, canvasY } = mathToCanvas(mathX, mathY, viewport)

    if (!isPenDown) {
      context.moveTo(canvasX, canvasY)  // start a new sub-path
      isPenDown = true
    } else {
      context.lineTo(canvasX, canvasY)  // extend the current sub-path
    }
  }

  context.stroke()
}
```

**CS lens — the pen metaphor:**
The canvas drawing API uses the "pen" metaphor. `moveTo` lifts the pen and places
it at a new position without drawing. `lineTo` draws a line from the current position
to a new position. `stroke()` renders all accumulated line segments. A single call
to `beginPath()` followed by many `moveTo`/`lineTo` calls produces a complex shape
that is stroked all at once.

`isPenDown` tracks whether the pen is currently drawing. When `mathY` is `null`
(function undefined), the pen is lifted: `isPenDown = false`. The next valid point
starts a new sub-path with `moveTo`. The gap is visible as a break in the curve.

**One sample per pixel column:**
`sampleCount = viewport.canvasWidth` — one sample per pixel column. This is the
**minimum resolution for smooth rendering**: fewer samples produce visible kinking
where straight segments connect at wide angles; more samples compute values between
pixels that cannot be displayed. One per pixel column is exactly right.

### Walkthrough — drawing `f(x) = x^2` on a 500-pixel canvas, viewport x: [-10, 10]

`sampleCount = 500`. `stepSize = 20/500 = 0.04`.

`sampleIndex=0`: `mathX = -10`. `mathY = evaluateAt(f, -10, env, DEG) = 100`.
`mathToCanvas(-10, 100, viewport)`:
- `canvasX = 0` (left edge)
- `canvasY = ((10 - 100) / 20) * 500 = (-90/20) * 500 = -2250` — far above the canvas

The y value is `100`, but the canvas top is at `yMax = 10`. The point is off-screen.
It will be drawn (canvas clips automatically) but invisible.

`sampleIndex=250`: `mathX = 0`. `mathY = 0`. `canvasX = 250`, `canvasY = 250`.
The origin — bottom of the parabola — appears at canvas centre.

`sampleIndex=125`: `mathX = -5`. `mathY = 25`. `canvasY = ((10-25)/20)*500 = -375`. Off-screen.

The parabola only enters the visible canvas range when `mathY ≤ 10`. This happens
near `x = ±√10 ≈ ±3.16`. Around those x values the curve enters the canvas from the
top and arcs down to the vertex.

The resulting drawn shape is the bottom portion of a parabola — the part that fits
within the y range [-10, 10]. This is correct: the viewport clips the view to its
declared range.

**Wire to `main.ts`:**

```typescript
import { drawFunction } from './graph-renderer.js'
```

**Import explanation:**
`import { drawFunction } from './graph-renderer.js'` — `graph-renderer.ts` is the
module responsible for canvas rendering (lesson 11). We import `drawFunction` — the
function added in this step that draws a user-defined function as a sampled curve —
because `redrawGraph` calls it for each function stored in the environment.

```typescript

function redrawGraph(): void {
  drawCoordinatePlane(graphContext, viewport)

  const functionColour = getComputedStyle(document.documentElement)
    .getPropertyValue('--colour-function-primary').trim()

  for (const userFunction of Object.values(calculatorState.environment.functions)) {
    drawFunction(
      graphContext,
      userFunction,
      viewport,
      calculatorState.environment,
      calculatorState.angleMode,
      functionColour,
    )
  }
}
```

Add to `style.css`:

```css
:root {
  --colour-function-primary: #38bdf8;
}
```

Call `redrawGraph()` at the end of `updateDisplay()`.

**`Object.values(object)` — first appearance:**
`Object.values(obj)` returns an array of all values in `obj`. Like `Object.entries`
but without the keys. Used here to iterate over all stored functions without needing
their names (the name is not needed for drawing — only the function definition).

Type `f(x) = x^2` and press Enter. The parabola appears. Type `f(x) = sin(x)` and
press Enter. The sine wave replaces it.

---

## Debugging: When the Graph Renders Wrongly

**Symptom: function is defined but nothing appears on the canvas**

The function was stored in `calculatorState.environment.functions` but `redrawGraph`
is not reading from it. Add a temporary log:
```typescript
console.log('functions:', calculatorState.environment.functions)
```
If the object is empty, the function was not stored — check lesson 10's `parseExpression`
for the function definition branch.

If functions are present but nothing draws, check that `redrawGraph()` is called from
`updateDisplay()`. Also verify `Object.values(calculatorState.environment.functions)`
iterates correctly — it should produce an array of `UserFunction` objects.

**Symptom: function plots as a straight horizontal line at y=0**

`evaluateAt` is returning `0` for all inputs instead of the correct value. Add a log:
```typescript
const testResult = evaluateAt(userFunction, 3, calculatorState.environment, calculatorState.angleMode)
console.log('f(3) =', testResult)
```
If this returns `0` for `f(x) = x^2`, the parameter binding is wrong — check
`bindVariable(userFunction.parameterName, xValue, environment)` in
`function-evaluator.ts`.

**Symptom: `1/x` shows a vertical spike at x=0 instead of a gap**

`isPenDown` is not being reset to `false` when `mathY === null`. Check the
`if (mathY === null)` branch in `drawFunction` — it must set `isPenDown = false`.

**Symptom: the parabola has a jagged, polygon appearance**

`sampleCount` is too low. Verify `sampleCount = viewport.canvasWidth` — it should
equal the canvas pixel width (500 for the default canvas). If it is a smaller number,
the curve has too few sample points and appears angular.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`evaluateAt` is the single evaluation primitive for the remainder of the project:
- Lesson 14 (tables): calls `evaluateAt` for each table row.
- Lesson 16 (integration): calls `evaluateAt` at each interval boundary.
- Lesson 18 (bisection): calls `evaluateAt` to check sign changes.
- Lesson 20 (Newton's method): calls `evaluateAt` and the differentiator.
- Lesson 21 (extrema): calls `evaluateAt` to evaluate the derivative.

Every numerical method that acts on a function uses this same pure, consistent
interface: give me a function, an x value, an environment, an angle mode — I give
you a number or null.

---

## What Breaks Without This

**Without `isPenDown`:**
Every time the function is undefined at a sample point, the path would draw a line
from the last valid point to the next valid point — connecting across the gap.
`f(x) = 1/x` would draw a near-vertical line through x=0, making a vertical spike
that is visible but incorrect. The gap is the correct representation.

**Without one sample per pixel:**
With 50 samples for a 500-pixel canvas, each segment covers 10 pixels. `f(x) = x^2`
would look like a polygon: visible flat segments between sample points. With 500
samples, each segment is 1 pixel — below the threshold of visual perception.
Fewer is visibly wrong; more is wasteful computation. One per pixel is exact.

---

## Definition of Done

- [ ] `f(x) = x^2` plots a parabola on the canvas
- [ ] `f(x) = sin(x)` plots a sine wave
- [ ] Redefining `f(x)` updates the graph immediately
- [ ] Points where the function is undefined produce a gap, not a connecting line
- [ ] The graph colour comes from `--colour-function-primary` CSS custom property
- [ ] `evaluateAt` returns `null` for non-finite and NaN results
- [ ] You can explain why one sample per pixel is the correct sampling rate
- [ ] You can explain `isPenDown` and trace what happens when a `null` is returned
      mid-draw
- [ ] You can explain `Object.values` and what it returns
- [ ] You can explain the relationship between `evaluateAt` here and the substitution
      model from lesson 10 (they are the same mechanism)
- [ ] Run:
      ```
      git add src/function-evaluator.ts src/graph-renderer.ts src/main.ts src/style.css
      git commit -m "Add graphing: evaluateAt samples functions at pixel resolution, pen metaphor draws curves with gaps at undefined points"
      ```

---

*Next: Lesson 13 — Discontinuities. The maths of asymptotes and undefined domains
is explained. `NaN` and `Infinity` are never shown raw. The asymptote clipping
heuristic prevents misleading near-vertical spikes.*
