# Calculator — Lesson 16 — Numerical Integration

## What You Will Build

`integrate(f, 0, 1)` where `f(x) = x^2` returns approximately `0.3333`. The area
between the curve and the x-axis is shaded on the canvas. Three methods are
available: left Riemann sum, right Riemann sum, and trapezoidal rule. A test
verifies that the trapezoidal rule is more accurate than Riemann sums for the same
step count.

## What You Need to Know First

Lessons 01–15. `evaluateAt` evaluates the function at any x value. The canvas
renders shapes. The coordinate plane is drawn. This lesson combines all three to
compute and visualise area under a curve.

---

## The Problem

A graph shows the shape of a function. But how much area is between the curve and
the x-axis between x=a and x=b? This is the **definite integral** — one of the two
central concepts of calculus (the other is the derivative, which appears in lesson 20).
We compute it numerically, not symbolically.

---

## Step 1 — Maths: The Definite Integral and Riemann Sums

### What is area under a curve?

The definite integral `∫[a to b] f(x) dx` is the **signed area** between the curve
`f(x)` and the x-axis, from `x=a` to `x=b`:

- Area **above** the x-axis contributes positively
- Area **below** the x-axis contributes negatively

For `f(x) = x^2`, the area from 0 to 1 is 1/3 ≈ `0.3333...`. This is exact by
calculus: the antiderivative of `x^2` is `x^3/3`. Evaluated from 0 to 1:
`(1^3/3) - (0^3/3) = 1/3 - 0 = 1/3`. Our numerical method should approximate this.

### Riemann sums

A Riemann sum approximates the area by dividing `[a, b]` into `n` equal
sub-intervals of width `Δx = (b - a) / n`, and summing the areas of rectangles:

**Left Riemann sum:** height = `f(x_i)` — the function value at the left edge.
```
Area ≈ Δx × (f(a) + f(a+Δx) + f(a+2Δx) + ... + f(b-Δx))
```

**Right Riemann sum:** height = `f(x_{i+1})` — the right edge.
```
Area ≈ Δx × (f(a+Δx) + f(a+2Δx) + ... + f(b))
```

**Trapezoidal rule:** height = average of left and right edges — approximates a
trapezoid rather than a rectangle.
```
Area ≈ Δx × (f(a)/2 + f(a+Δx) + ... + f(b-Δx) + f(b)/2)
```

### Why more intervals give a better answer

With `n=1`, one rectangle crudely approximates the whole area. With `n=1000`, 1000
rectangles fill the space accurately. As `n → ∞`, the Riemann sum converges to the
exact integral. This limit is the mathematical **definition** of the integral.

### Why the trapezoidal rule is more accurate

The trapezoidal rule uses both endpoints of each interval to approximate the curve
shape, not just one. For a monotone function (one that only increases or only
decreases), left Riemann over-estimates or under-estimates by roughly `Δx` per
interval. The trapezoidal rule's error is proportional to `Δx^2` — it is
**second-order accurate**, while Riemann sums are first-order accurate. With `n=10`
steps, the trapezoid error is roughly `1/100` of the Riemann error.

---

## Step 2 — The Integration Algorithm

### The code

Create `src/integrator.ts`:

```typescript
import { evaluateAt }              from './function-evaluator.js'
import { Environment }             from './environment.js'
import { UserFunction, AngleMode } from './types.js'
import { CalcError, makeError }    from './calc-error.js'

export const IntegrationMethod = {
  LEFT_RIEMANN:  'LEFT_RIEMANN',
  RIGHT_RIEMANN: 'RIGHT_RIEMANN',
  TRAPEZOID:     'TRAPEZOID',
} as const

export type IntegrationMethod = typeof IntegrationMethod[keyof typeof IntegrationMethod]

export interface IntegrationResult {
  value:     number
  stepCount: number
}

export function integrate(
  userFunction: UserFunction,
  lowerBound:   number,
  upperBound:   number,
  method:       IntegrationMethod,
  stepCount:    number,
  environment:  Environment,
  angleMode:    AngleMode,
): IntegrationResult | CalcError {
  if (upperBound <= lowerBound) {
    return makeError(
      'INVALID_EXPRESSION',
      'Upper bound must be greater than lower bound',
    )
  }
  if (stepCount < 1) {
    return makeError('INVALID_EXPRESSION', 'Step count must be at least 1')
  }

  const stepWidth = (upperBound - lowerBound) / stepCount
  let totalArea   = 0

  for (let stepIndex = 0; stepIndex < stepCount; stepIndex++) {
    const leftX  = lowerBound + stepIndex * stepWidth
    const rightX = leftX + stepWidth

    const leftY  = evaluateAt(userFunction, leftX,  environment, angleMode)
    const rightY = evaluateAt(userFunction, rightX, environment, angleMode)

    if (method === IntegrationMethod.LEFT_RIEMANN) {
      if (leftY === null) continue
      totalArea += leftY * stepWidth
    } else if (method === IntegrationMethod.RIGHT_RIEMANN) {
      if (rightY === null) continue
      totalArea += rightY * stepWidth
    } else {
      // Trapezoid: average of left and right
      if (leftY === null || rightY === null) continue
      totalArea += ((leftY + rightY) / 2) * stepWidth
    }
  }

  return { value: totalArea, stepCount }
}
```

**What `src/integrator.ts` is:**
`integrator.ts` owns the numerical integration algorithms. It takes a function, a
range, a method, and a step count, and returns an approximate area. It has no DOM
access and no side effects. It is testable with pure function calls.

**`IntegrationResult | CalcError` — defensive return type:**
The function returns either a result or an error. The same `CalcError` pattern from
lesson 04 applies here. The caller checks `isCalcError(result)` before reading the
value. The type system enforces the check.

**`continue` in a `for` loop — first appearance:**
`continue` skips the rest of the current loop iteration and jumps to the next one.
Here it is used when `evaluateAt` returns `null` — we skip undefined intervals
without aborting the integration. The total area simply excludes those intervals.

### Walkthrough — trapezoidal integration of `x^2` from 0 to 1 with n=4

`stepWidth = 0.25`. Steps: [0→0.25], [0.25→0.5], [0.5→0.75], [0.75→1.0].

Step 0: `leftY = f(0) = 0`, `rightY = f(0.25) = 0.0625`.
Area += `(0 + 0.0625) / 2 × 0.25 = 0.0078125`.

Step 1: `leftY = f(0.25) = 0.0625`, `rightY = f(0.5) = 0.25`.
Area += `(0.0625 + 0.25) / 2 × 0.25 = 0.0390625`.

Step 2: `leftY = f(0.5) = 0.25`, `rightY = f(0.75) = 0.5625`.
Area += `(0.25 + 0.5625) / 2 × 0.25 = 0.1015625`.

Step 3: `leftY = f(0.75) = 0.5625`, `rightY = f(1.0) = 1.0`.
Area += `(0.5625 + 1.0) / 2 × 0.25 = 0.1953125`.

Total: `0.0078125 + 0.0390625 + 0.1015625 + 0.1953125 = 0.34375`.

Exact answer: `1/3 ≈ 0.3333`. Error: `0.34375 - 0.3333 = 0.0104`.

With left Riemann and n=4:
`(0 + 0.0625 + 0.25 + 0.5625) × 0.25 = 0.875 × 0.25 = 0.21875`. Error: `0.115`.

Trapezoidal error (0.0104) is 11× smaller than left Riemann error (0.115). This is
the second-order accuracy in practice — and with only 4 steps.

**CS lens — summation algorithm:**
The integration is a **summation loop**: accumulate the area of each rectangle into
`totalArea`. This is the most fundamental algorithmic pattern: iterate, accumulate,
return. Merge sort's merge step, database aggregations, and statistical calculations
all follow this pattern. Numerical integration makes it visible: you can see each
rectangle being added to the total.

---

## Step 3 — Tests

Create `src/integrator.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { integrate,
         IntegrationMethod }      from './integrator.js'
import { createEnvironment }      from './environment.js'
import { AngleMode }              from './types.js'
import { isCalcError }            from './calc-error.js'

describe('integrate', () => {
  const squareFn = { parameterName: 'x', bodyExpression: 'x^2' }
  const env      = createEnvironment()

  test('trapezoid for x^2 from 0 to 1 ≈ 1/3', () => {
    const result = integrate(squareFn, 0, 1, IntegrationMethod.TRAPEZOID, 1000, env, AngleMode.DEGREES)
    expect(isCalcError(result)).toBe(false)
    if (!isCalcError(result)) {
      expect(Math.abs(result.value - 1/3)).toBeLessThan(0.001)
    }
  })

  test('trapezoid is more accurate than left Riemann for same step count', () => {
    const leftResult = integrate(squareFn, 0, 1, IntegrationMethod.LEFT_RIEMANN, 10, env, AngleMode.DEGREES)
    const trapResult = integrate(squareFn, 0, 1, IntegrationMethod.TRAPEZOID,    10, env, AngleMode.DEGREES)

    if (!isCalcError(leftResult) && !isCalcError(trapResult)) {
      expect(Math.abs(trapResult.value  - 1/3))
        .toBeLessThan(Math.abs(leftResult.value - 1/3))
    }
  })

  test('sin(x) from 0 to pi ≈ 2', () => {
    const sinFn = { parameterName: 'x', bodyExpression: 'sin(x)' }
    const result = integrate(sinFn, 0, Math.PI, IntegrationMethod.TRAPEZOID, 1000, env, AngleMode.RADIANS)
    if (!isCalcError(result)) {
      expect(Math.abs(result.value - 2)).toBeLessThan(0.001)
    }
  })

  test('returns error for invalid bounds', () => {
    const result = integrate(squareFn, 5, 0, IntegrationMethod.TRAPEZOID, 10, env, AngleMode.DEGREES)
    expect(isCalcError(result)).toBe(true)
  })
})
```

The second test directly verifies the mathematical claim: trapezoidal error < left
Riemann error for the same number of steps. This is not a test of an edge case — it
is a test of the algorithm's correctness claim. Tests that verify mathematical
properties are at the highest level of the specification.

Run `npm test`. All tests pass.

---

## Step 4 — Shade the Area on the Canvas

Add to `src/graph-renderer.ts`:

```typescript
export function drawShadedArea(
  context:      CanvasRenderingContext2D,
  userFunction: UserFunction,
  lowerBound:   number,
  upperBound:   number,
  viewport:     Viewport,
  environment:  Environment,
  angleMode:    AngleMode,
  fillColour:   string,
): void {
  const sampleCount = Math.min(viewport.canvasWidth, 500)
  const stepWidth   = (upperBound - lowerBound) / sampleCount
  const originY     = mathToCanvas(0, 0, viewport).canvasY

  context.fillStyle   = fillColour
  context.globalAlpha = 0.3  // semi-transparent

  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex++) {
    const leftX  = lowerBound + sampleIndex * stepWidth
    const rightX = leftX + stepWidth
    const midX   = (leftX + rightX) / 2
    const mathY  = evaluateAt(userFunction, midX, environment, angleMode)

    if (mathY === null) continue

    const leftCanvas  = mathToCanvas(leftX,  mathY, viewport)
    const rightCanvas = mathToCanvas(rightX, mathY, viewport)
    const rectHeight  = Math.abs(leftCanvas.canvasY - originY)
    const rectTop     = Math.min(leftCanvas.canvasY, originY)

    context.fillRect(
      leftCanvas.canvasX,
      rectTop,
      rightCanvas.canvasX - leftCanvas.canvasX,
      rectHeight,
    )
  }

  context.globalAlpha = 1.0  // restore
}
```

**`context.globalAlpha` — first appearance:**
`globalAlpha` sets the transparency of all subsequent drawing operations, from `0.0`
(fully transparent) to `1.0` (fully opaque). Setting it to `0.3` makes the shaded
area semi-transparent, so the curve is still visible through the fill. Restoring to
`1.0` afterward is essential — without the restore, all subsequent drawing (axes,
labels, curves) would also be semi-transparent.

**`context.fillRect(x, y, width, height)` — first appearance:**
`fillRect` draws and fills a solid rectangle. Unlike `strokeRect` (which draws only
the outline), `fillRect` fills the interior with `fillStyle`. The four arguments are
the top-left x, top-left y, width, and height in canvas pixels.

**Signed area — `Math.min(canvasY, originY)` and `Math.abs(canvasY - originY)`:**
For functions that go below the x-axis, `mathY < 0`, so `canvasY > originY` (lower
on screen). `rectTop = Math.min(canvasY, originY)` always picks the higher point
(smaller y value) as the rectangle top. `rectHeight = Math.abs(canvasY - originY)`
gives the rectangle height regardless of sign. This draws rectangles downward for
negative values — correct for the signed area representation.

Add integration UI controls to `index.html` and wire `drawShadedArea` call to
`redrawGraph` when bounds are set.

---

## Debugging: When Integration Produces Wrong Results

**Symptom: integral of `x^2` from 0 to 3 returns a clearly wrong value (e.g., 9 instead of 9)**

Wait — `∫₀³ x² dx = 9` is correct. If you're getting a different value, check which
rule is being used. Left-Riemann at low `n` gives an underestimate; right-Riemann
gives an overestimate; trapezoid is closer. Add a temporary log:
```typescript
console.log(`n=${n}, rule=${rule}, result=${result}`)
```
Verify the accumulation loop is iterating `n` times and computing the correct x
values at each step.

**Symptom: integral returns `NaN`**

One of the `evaluateAt` calls returned `null` (function undefined at that x value),
but the integration loop did not handle it. Check that the loop skips or substitutes
`0` when `evaluateAt` returns `null`:
```typescript
const yValue = evaluateAt(fn, x, env, mode)
if (yValue === null) continue  // or: sum += 0
```

**Symptom: shaded area appears but the reported value is wrong**

The graphical display (`drawShadedArea`) and the numerical computation (`integrate`)
may use different intervals or rule types. Add a log to compare:
```typescript
console.log('numerical result:', integrate(fn, a, b, n, 'trapezoid', env, mode))
```
Verify both the display and the reported value use the same `a`, `b`, `n`, and rule.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

The numerical integration result feeds into the solver panel (lesson 22), which
displays the computed area alongside root and extremum findings. The shaded area
on the canvas makes the abstract concept of "area under a curve" concrete: the
student sees the rectangles being summed.

The summation loop pattern here — iterate a range, accumulate results, return total
— is the foundation of every numerical method in lessons 18–21. Recognising it here
makes the later lessons immediately familiar.

---

## What Breaks Without This

**Without the trapezoid option:**
Only left/right Riemann sums are available. Both have first-order accuracy. A student
comparing them would see similar results and not learn why one method might be
preferred. The test that verifies `trapError < leftRiemannError` is only meaningful
because the trapezoid method is present.

**Without `globalAlpha` restore:**
The shaded area is drawn first in `redrawGraph`, then the axes, grid, and function
curves. If `globalAlpha` is not restored to `1.0`, the entire coordinate plane and
all curves are rendered at 30% opacity — barely visible. This is the kind of bug
that is obvious in the browser and invisible in the code.

---

## Definition of Done

- [ ] `integrate(f, 0, 1)` for `f(x) = x^2` returns approximately `0.3333`
- [ ] `integrate(sin, 0, π)` in radians returns approximately `2.0`
- [ ] The area between the curve and the x-axis is shaded on the canvas
- [ ] Three methods are selectable: left Riemann, right Riemann, trapezoid
- [ ] Trapezoid is more accurate than left Riemann for the same step count (test passes)
- [ ] `npm test` passes all tests in `integrator.test.ts`
- [ ] You can explain the definite integral in terms of signed area
- [ ] You can explain left Riemann, right Riemann, and trapezoid sums
- [ ] You can explain why the trapezoidal rule is more accurate (second-order vs first-order)
- [ ] You can explain `continue` in a loop and why it is used for null values
- [ ] You can explain `context.globalAlpha` and why it must be restored
- [ ] You can explain `context.fillRect` parameters
- [ ] Run:
      ```
      git add src/integrator.ts src/integrator.test.ts src/graph-renderer.ts src/main.ts index.html
      git commit -m "Add numerical integration: Riemann sums and trapezoidal rule, shaded area on canvas, trapezoidal accuracy verified by test"
      ```

---

*Next: Lesson 17 — Zoom and Pan. The viewport min/max values are changed by mouse
wheel and drag events. All drawing code automatically uses the updated viewport —
no drawing logic changes.*
