# Lesson 16 — Numerical Integration

## What You Will Build

`integrate(f, 0, 1)` where `f(x) = x^2` returns approximately `0.3333`.
The area between the curve and the x-axis is shaded on the canvas.
Three methods — left Riemann, right Riemann, and trapezoid — are selectable.

## What You Need to Know First

Lessons 01–15. `evaluateAt` evaluates the function at any x value. The canvas
renders shapes. This lesson combines both to compute and visualise area.

---

## The Lesson

### The problem

A graph shows the shape of a function. But how much area is between the curve
and the x-axis between x=a and x=b? This is the definite integral — one of the
central concepts of calculus. We compute it numerically, not symbolically.

---

### Step 1 — Maths — the definite integral and Riemann sums

**Maths — what is area under a curve?**
The definite integral `∫[a to b] f(x) dx` is the signed area between the curve
`f(x)` and the x-axis, from x=a to x=b. "Signed" means:
- Area above the x-axis contributes positively
- Area below the x-axis contributes negatively

For `f(x) = x^2`, the area from 0 to 1 is 1/3 ≈ 0.3333. This is exact by
calculus (the antiderivative is `x^3/3`, evaluated from 0 to 1 gives 1/3).
Our numerical method should approximate this.

**Maths — Riemann sums:**
A Riemann sum approximates the area by dividing the interval [a, b] into
`n` equal sub-intervals of width `Δx = (b - a) / n`, and summing the areas of
rectangles:

Left Riemann sum: the rectangle height is `f(x_i)` — the left edge of each interval.
```
Area ≈ Δx × (f(a) + f(a+Δx) + f(a+2Δx) + ... + f(b-Δx))
```

Right Riemann sum: the rectangle height is `f(x_{i+1})` — the right edge.
```
Area ≈ Δx × (f(a+Δx) + f(a+2Δx) + ... + f(b))
```

Trapezoidal rule: the height is the average of left and right edges — a trapezoid,
not a rectangle.
```
Area ≈ Δx × (f(a)/2 + f(a+Δx) + f(a+2Δx) + ... + f(b-Δx) + f(b)/2)
```

The trapezoidal rule is more accurate than either Riemann sum for the same number
of intervals because it uses both endpoints and produces a better approximation of
the curve's shape within each interval.

**Why do more intervals give a better answer?**
With `n=1`, one rectangle approximates the whole area crudely. With `n=1000`, 1000
rectangles fill the space much more accurately. As `n → ∞`, the Riemann sum
converges to the exact integral. This is the mathematical definition of the integral:
the limit of the Riemann sum as the interval width approaches zero.

---

### Step 2 — The integration algorithm

Create `src/integrator.ts`:

```typescript
import { evaluateAt }    from './function-evaluator.js'
import { Environment }   from './environment.js'
import { UserFunction }  from './types.js'
import { AngleMode }     from './types.js'
import { CalcError, makeError } from './calc-error.js'

export const IntegrationMethod = {
  LEFT_RIEMANN:  'LEFT_RIEMANN',
  RIGHT_RIEMANN: 'RIGHT_RIEMANN',
  TRAPEZOID:     'TRAPEZOID',
} as const

export type IntegrationMethod = typeof IntegrationMethod[keyof typeof IntegrationMethod]

export type IntegrationResult = { value: number; stepCount: number } | CalcError

export function integrate(
  userFunction:     UserFunction,
  lowerBound:       number,
  upperBound:       number,
  method:           IntegrationMethod,
  stepCount:        number,
  environment:      Environment,
  angleMode:        AngleMode,
): IntegrationResult {
  if (upperBound <= lowerBound) {
    return makeError('INVALID_EXPRESSION', 'Upper bound must be greater than lower bound')
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
      if (leftY === null) continue  // skip undefined points
      totalArea += leftY * stepWidth
    } else if (method === IntegrationMethod.RIGHT_RIEMANN) {
      if (rightY === null) continue
      totalArea += rightY * stepWidth
    } else {
      // Trapezoid: use average of left and right
      if (leftY === null || rightY === null) continue
      totalArea += ((leftY + rightY) / 2) * stepWidth
    }
  }

  return { value: totalArea, stepCount }
}
```

**CS lens — summation algorithm:**
The integration is a summation loop: accumulate the area of each rectangle into
`totalArea`. This is the most fundamental algorithmic pattern: iterate, accumulate,
return. Every numerical method is a variation of this pattern.

The loop index `stepIndex` goes from `0` to `stepCount - 1`. The width of each
step is `(upperBound - lowerBound) / stepCount`. Multiplying width by height gives
the area of one rectangle. Summing all rectangles gives the total area.

**SE lens — algorithm as a pure function:**
`integrate` takes everything it needs as parameters. It has no side effects. It
is testable: call it with known inputs, verify the output converges to the known
analytical result. When the step count increases, the result improves — this
can be verified numerically.

---

### Step 3 — Tests

```typescript
describe('integrate', () => {
  const squareFn = { parameterName: 'x', bodyExpression: 'x^2' }
  const env      = createEnvironment()

  test('left Riemann sum for x^2 from 0 to 1 converges to 1/3', () => {
    const result = integrate(squareFn, 0, 1, IntegrationMethod.LEFT_RIEMANN, 1000, env, AngleMode.DEGREES)
    expect(isCalcError(result)).toBe(false)
    if (!isCalcError(result)) {
      expect(Math.abs(result.value - 1/3)).toBeLessThan(0.01)
    }
  })

  test('trapezoid rule is more accurate than left Riemann for same step count', () => {
    const leftResult = integrate(squareFn, 0, 1, IntegrationMethod.LEFT_RIEMANN, 10, env, AngleMode.DEGREES)
    const trapResult = integrate(squareFn, 0, 1, IntegrationMethod.TRAPEZOID,    10, env, AngleMode.DEGREES)

    if (!isCalcError(leftResult) && !isCalcError(trapResult)) {
      const leftError = Math.abs(leftResult.value - 1/3)
      const trapError = Math.abs(trapResult.value - 1/3)
      expect(trapError).toBeLessThan(leftError)
    }
  })

  test('sin(x) from 0 to pi ≈ 2', () => {
    const sinFn = { parameterName: 'x', bodyExpression: 'sin(x)' }
    const result = integrate(sinFn, 0, Math.PI, IntegrationMethod.TRAPEZOID, 1000, env, AngleMode.RADIANS)
    if (!isCalcError(result)) {
      expect(Math.abs(result.value - 2)).toBeLessThan(0.001)
    }
  })
})
```

The trapezoid test confirms a mathematical fact: the trapezoidal rule is
second-order accurate (error ∝ `Δx^2`), while the Riemann sums are first-order
(error ∝ `Δx`). With 10 steps, the trapezoid rule should be noticeably more accurate.

---

### Step 4 — Shade the area on the canvas

Add to `src/graph-renderer.ts`:

```typescript
export function drawShadedArea(
  context:     CanvasRenderingContext2D,
  userFunction: UserFunction,
  lowerBound:  number,
  upperBound:  number,
  viewport:    Viewport,
  environment: Environment,
  angleMode:   AngleMode,
  fillColour:  string,
): void {
  const sampleCount = Math.min(viewport.canvasWidth, 500)
  const stepWidth   = (upperBound - lowerBound) / sampleCount
  const originY     = mathToCanvas(0, 0, viewport).canvasY

  context.fillStyle   = fillColour
  context.globalAlpha = 0.3  // semi-transparent fill

  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex++) {
    const leftX  = lowerBound + sampleIndex * stepWidth
    const rightX = leftX + stepWidth
    const midX   = (leftX + rightX) / 2
    const mathY  = evaluateAt(userFunction, midX, environment, angleMode)

    if (mathY === null) continue

    const leftCanvas  = mathToCanvas(leftX,  mathY, viewport)
    const rightCanvas = mathToCanvas(rightX, mathY, viewport)

    context.fillRect(
      leftCanvas.canvasX,
      Math.min(leftCanvas.canvasY, originY),
      rightCanvas.canvasX - leftCanvas.canvasX,
      Math.abs(leftCanvas.canvasY - originY),
    )
  }

  context.globalAlpha = 1.0  // restore
}
```

Add integration UI controls below the table, wire to `integrate`, and call
`drawShadedArea` in `redrawGraph` when integration bounds are set.

---

## Connect the Pieces

The integration result feeds into the solver panel (lesson 22). The shaded area
visualisation makes the mathematical concept concrete: the integral is area. This
is the payoff of having a coordinate plane — abstract maths becomes visible.

---

## What Breaks Without This

Without the trapezoidal rule, only left/right Riemann sums are available. Both
are first-order accurate. A student comparing them would not see why one method
is better than another. The trapezoid rule's second-order accuracy is visible in
the test: it requires fewer steps to achieve the same precision. Understanding
why requires understanding that the trapezoid approximates the curve better within
each interval — a lesson that connects the algorithm to the maths.

---

## Definition of Done

- [ ] `integrate(f, 0, 1)` for `f(x) = x^2` → approximately `0.3333`
- [ ] `integrate(f, 0, pi)` for `f(x) = sin(x)` in radians → approximately `2.0`
- [ ] Area is shaded on the canvas between the curve and the x-axis
- [ ] Three methods are selectable: left Riemann, right Riemann, trapezoid
- [ ] Trapezoid rule is more accurate than Riemann for the same step count (verified by test)
- [ ] `npm test` passes all new tests
