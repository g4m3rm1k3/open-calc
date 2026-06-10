# Lesson 12 — Graphing

## What You Will Build

After defining `f(x) = x^2`, the curve appears on the coordinate plane.
`f(x) = sin(x)` plots a sine wave. The graph updates when the function is redefined.

## What You Need to Know First

Lessons 01–11. Functions exist (lesson 10) and the coordinate plane is rendered
(lesson 11). This lesson connects them: evaluate the function at many x values
and draw the resulting curve.

---

## The Lesson

### The problem

A graph of `f(x)` is a visual representation of all the output values of `f` across
a domain. We cannot draw infinitely many points — we sample a finite number and
connect them. The key questions: how many samples? How are they connected? What
happens at points where `f` is undefined?

---

### Step 1 — Maths — continuous functions and discrete sampling

**Maths — continuous functions:**
A function is continuous at a point if small changes in input produce small changes
in output. `f(x) = x^2` is continuous everywhere. `f(x) = 1/x` is continuous
everywhere except `x = 0`, where it is undefined.

When we graph a continuous function, we connect sample points with straight line
segments. With enough samples, the line segments look like a smooth curve. This
is the same idea behind digital audio: a continuous sound wave is sampled at
44,100 points per second. Played back, it sounds continuous.

The number of samples determines the quality of the approximation. Too few and the
curve looks jagged. The right number depends on the viewport size: one sample per
pixel gives a smooth appearance.

**Maths — domain and range:**
The domain is the set of x values for which `f(x)` is defined. The range is the
set of resulting `f(x)` values. When we graph, we sample over the visible x domain
(viewport.xMin to viewport.xMax). Some functions have restricted domains: `sqrt(x)`
requires x ≥ 0, so the curve only appears for positive x. Lesson 13 handles this.

---

### Step 2 — The function evaluator

Create `src/function-evaluator.ts`:

```typescript
import { parseExpression }   from './expression-parser.js'
import { Environment,
         bindVariable }      from './environment.js'
import { AngleMode }         from './types.js'
import { UserFunction }      from './types.js'
import { isCalcError }       from './calc-error.js'

export function evaluateAt(
  userFunction: UserFunction,
  xValue:       number,
  environment:  Environment,
  angleMode:    AngleMode,
): number | null {
  const functionEnv = bindVariable(userFunction.parameterName, xValue, environment)
  const result      = parseExpression(userFunction.bodyExpression, functionEnv, angleMode)

  if (isCalcError(result.result)) return null
  if (!isFinite(result.result as number)) return null
  if (isNaN(result.result as number)) return null

  return result.result as number
}
```

**SE lens — null as signal:**
`evaluateAt` returns `number | null`. `null` means the function is undefined or
non-finite at this x value. The graphing code checks for `null` and does not draw
a point there. This is simpler and safer than throwing an exception — the graph
code handles gaps naturally as part of the drawing logic.

---

### Step 3 — Sampling and drawing

Add to `src/graph-renderer.ts`:

```typescript
import { evaluateAt }    from './function-evaluator.js'
import { UserFunction }  from './types.js'
import { Environment }   from './environment.js'
import { AngleMode }     from './types.js'

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
    const mathX  = viewport.xMin + sampleIndex * stepSize
    const mathY  = evaluateAt(userFunction, mathX, environment, angleMode)

    if (mathY === null) {
      isPenDown = false  // lift the pen — there is a gap here
      continue
    }

    const { canvasX, canvasY } = mathToCanvas(mathX, mathY, viewport)

    if (!isPenDown) {
      context.moveTo(canvasX, canvasY)
      isPenDown = true
    } else {
      context.lineTo(canvasX, canvasY)
    }
  }

  context.stroke()
}
```

**CS lens — the pen metaphor:**
The canvas drawing API uses a "pen" metaphor. `moveTo` lifts the pen and moves it
to a new position. `lineTo` draws a line from the current position to the new one.
`stroke` renders all the accumulated path segments.

`isPenDown` tracks whether the pen is currently drawing or lifted. When `mathY`
is `null` (function undefined at this x), the pen is lifted. The next valid point
starts a new line segment, creating a visible gap. This gap is where the asymptote
is — lesson 13 will teach the mathematics of why the gap exists.

**SE lens — one sample per pixel:**
`sampleCount = viewport.canvasWidth` — one sample per pixel column. This is the
minimum needed for a smooth curve. More samples would compute values between pixels,
which are never visible. Fewer samples would miss detail. One per pixel is the
right number because the canvas is a discrete grid of pixels and there is no visual
benefit to computing values that cannot be displayed.

---

### Step 4 — Wire to the calculator

In `src/main.ts`, update `redrawGraph` to draw functions from the environment:

```typescript
function redrawGraph(): void {
  drawCoordinatePlane(graphContext, viewport)

  const defaultColour = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-function-primary').trim()

  for (const [, userFunction] of Object.entries(calculatorState.environment.functions)) {
    drawFunction(
      graphContext,
      userFunction,
      viewport,
      calculatorState.environment,
      calculatorState.angleMode,
      defaultColour,
    )
  }
}
```

Add the colour token to `style.css`:

```css
:root {
  --color-function-primary: #38bdf8;
}
```

Call `redrawGraph()` at the end of `updateDisplay()`.

Type `f(x) = x^2` and press Enter. The parabola appears on the canvas.
Type `f(x) = sin(x)` and press Enter. The sine wave replaces it.

---

## Connect the Pieces

`evaluateAt` is the evaluation engine for the entire graphing, table, and solver
system. Lessons 14 (tables), 16 (integration), 18 (bisection), 20 (Newton), and
21 (extrema) all call `evaluateAt` with different x values. The sampling loop in
`drawFunction` is the most visible use — but the same function powers every
numerical method.

---

## What Breaks Without This

Without one sample per pixel, the parabola has visible kinks. `f(x) = sin(100*x)` —
a fast oscillating function — looks like random noise. The rule "one sample per
pixel" ensures the rendering is as accurate as the canvas resolution allows.

Without `isPenDown`, every time the function is undefined at a point, the path
draws a line from the last valid point to the next valid point, passing through
the undefined region. `f(x) = 1/x` would draw a vertical line through x=0.
The gap is the correct representation. The vertical line is a lie.

---

## Definition of Done

- [ ] `f(x) = x^2` plots a parabola on the canvas
- [ ] `f(x) = sin(x)` plots a sine wave
- [ ] Redefining `f(x)` updates the graph immediately
- [ ] Points where the function is undefined produce a gap, not a line
- [ ] The graph colour comes from a CSS custom property
- [ ] `evaluateAt` returns `null` for undefined, non-finite, and NaN results
