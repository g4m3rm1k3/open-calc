# Calculator — Lesson 21 — Finding Extrema

## What You Will Build

The minimum and maximum of `f(x)` in an interval are found and marked on the graph
with distinct coloured markers. For `f(x) = x^2 - 3` in [-5, 5], the solver finds
the minimum at `x ≈ 0, f(0) = -3`. The result identifies whether the critical point
is a minimum, maximum, or inflection point. No new algorithm is written.

## What You Need to Know First

Lessons 01–20. `numericalDerivative` from lesson 20. The bisection solver from lesson
18. This lesson composes both to solve a new problem.

---

## The Problem

Given `f(x) = x^4 - 3x^2 + 2`, find the minimum value in the interval [-2, 0].
We cannot use the derivative rule `f′(x) = 0` analytically (the algebra is possible
but tedious). We want the computer to find the extremum numerically.

We have everything we need: `numericalDerivative` computes `f′` at any point.
`bisect` finds where a function equals zero. The extremum is where `f′ = 0`.
Bisect `f′`. Done.

---

## Step 1 — Maths: Local Extrema and the Derivative

### Local minimum and maximum

A **local minimum** of `f` is a point where `f(x)` is smaller than all nearby
values. A **local maximum** is where `f(x)` is larger than all nearby values.

Together, local minima and maxima are called **extrema** (singular: extremum).

### Fermat's theorem

At a local extremum `c`, if `f` is differentiable at `c`, then `f′(c) = 0`.

**Why:** The derivative measures the slope of the tangent line. At a minimum, the
function transitions from decreasing (`f′ < 0`) to increasing (`f′ > 0`). At the
transition point, the slope is zero. At a maximum, it transitions from increasing
to decreasing — slope zero again.

This gives us the algorithm: find where `f′ = 0`. That is a root-finding problem.
We already have bisection.

### Critical points and the first derivative test

A point where `f′(c) = 0` is called a **critical point**. Not all critical points
are extrema. For `f(x) = x^3`, `f′(0) = 0` but x=0 is not a minimum or maximum —
it is an **inflection point** where the curve changes from concave to convex.

The **first derivative test** classifies critical points:
- If `f′` changes from **negative to positive** at `c`: local **minimum** (function
  went from decreasing to increasing)
- If `f′` changes from **positive to negative** at `c`: local **maximum**
- If `f′` does not change sign: **inflection point**

The sign of `f′` at the original bracket endpoints tells us which applies: if
`f′(lowerBound) < 0` and `f′(upperBound) > 0`, the derivative crosses zero going
upward — that is a minimum.

---

## Step 2 — The Extrema Finder

### The code

Create `src/extrema-finder.ts`:

```typescript
import { numericalDerivative }          from './differentiator.js'
import { evaluateAt }                   from './function-evaluator.js'
import { Environment }                  from './environment.js'
import { UserFunction, AngleMode }      from './types.js'
import { CalcError, makeError }         from './calc-error.js'

export type ExtremumType = 'MINIMUM' | 'MAXIMUM' | 'INFLECTION'

export interface ExtremumResult {
  xValue:       number
  fValue:       number
  extremumType: ExtremumType
  iterations:   number
}

const MAX_ITERATIONS      = 100
const DERIVATIVE_TOLERANCE = 1e-7

export function findExtremum(
  userFunction: UserFunction,
  lowerBound:   number,
  upperBound:   number,
  environment:  Environment,
  angleMode:    AngleMode,
): ExtremumResult | CalcError {
  let derivativeAtLower = numericalDerivative(
    userFunction, lowerBound, environment, angleMode)
  let derivativeAtUpper = numericalDerivative(
    userFunction, upperBound, environment, angleMode)

  if (derivativeAtLower === null || derivativeAtUpper === null) {
    return makeError(
      'INVALID_EXPRESSION',
      'Derivative is undefined at one of the bounds',
    )
  }

  if (derivativeAtLower * derivativeAtUpper > 0) {
    return makeError(
      'INVALID_EXPRESSION',
      `No extremum in [${lowerBound}, ${upperBound}] — derivative does not change sign`,
    )
  }

  let currentLower = lowerBound
  let currentUpper = upperBound

  for (let iterationCount = 0; iterationCount < MAX_ITERATIONS; iterationCount++) {
    const midpoint      = (currentLower + currentUpper) / 2
    const derivativeAtMid = numericalDerivative(
      userFunction, midpoint, environment, angleMode)

    if (derivativeAtMid === null) break

    if (Math.abs(derivativeAtMid) < DERIVATIVE_TOLERANCE) {
      const fValue = evaluateAt(userFunction, midpoint, environment, angleMode)
      if (fValue === null) {
        return makeError('INVALID_EXPRESSION', 'Function undefined at extremum')
      }
      return {
        xValue:       midpoint,
        fValue,
        extremumType: classifyExtremum(derivativeAtLower, derivativeAtUpper),
        iterations:   iterationCount + 1,
      }
    }

    derivativeAtLower = numericalDerivative(
      userFunction, currentLower, environment, angleMode) ?? derivativeAtLower

    if (derivativeAtMid * derivativeAtLower < 0) {
      currentUpper = midpoint
      derivativeAtUpper = derivativeAtMid
    } else {
      currentLower = midpoint
      derivativeAtLower = derivativeAtMid
    }
  }

  const finalMidpoint = (currentLower + currentUpper) / 2
  const fFinal = evaluateAt(userFunction, finalMidpoint, environment, angleMode)
  if (fFinal === null) {
    return makeError('INVALID_EXPRESSION', 'Function undefined at extremum')
  }

  return {
    xValue:       finalMidpoint,
    fValue:       fFinal,
    extremumType: classifyExtremum(derivativeAtLower, derivativeAtUpper),
    iterations:   MAX_ITERATIONS,
  }
}

function classifyExtremum(
  derivativeAtLeft:  number,
  derivativeAtRight: number,
): ExtremumType {
  if (derivativeAtLeft < 0 && derivativeAtRight > 0) return 'MINIMUM'
  if (derivativeAtLeft > 0 && derivativeAtRight < 0) return 'MAXIMUM'
  return 'INFLECTION'
}
```

**What `src/extrema-finder.ts` is:**
`extrema-finder.ts` applies bisection to the numerical derivative. It is the same
halving algorithm as `bisection-solver.ts`, but the function being evaluated at
each step is `numericalDerivative` rather than the original function.

**CS lens — composing numerical methods:**
`findExtremum` does binary search on `f′` — the same algorithm as bisection but
with a different function. The derivative changes sign from negative to positive at
a minimum (function transitions from decreasing to increasing). Halving the interval
where `f′` changes sign converges to the extremum.

The pattern is identical to finding the root of any continuous function — because
finding an extremum is finding the root of the derivative. Problem reduction again.

**`ExtremumType` as a string literal union type:**
`type ExtremumType = 'MINIMUM' | 'MAXIMUM' | 'INFLECTION'` is a union of string
literals. The same pattern as `ButtonType` from lesson 02, `CalcErrorCode` from
lesson 04, and `IntegrationMethod` from lesson 16. A finite set of named values,
enforced by the type system.

**`classifyExtremum`:**
The initial derivative signs at the bracket endpoints persist throughout the
iteration (they are only narrowed, not changed). After convergence, they tell
which direction the derivative crossed zero:
- Negative at left, positive at right → derivative went up → minimum
- Positive at left, negative at right → derivative went down → maximum
- Same sign → no extremum (inflection point, though the sign check at the start
  should have caught this)

### Walkthrough — minimum of `x^2 - 3` in [-5, 5]

`f′(x) = 2x`. At x=-5: `f′(-5) = -10` (negative). At x=5: `f′(5) = 10` (positive).
Sign change ✓. The minimum is where `f′ = 0`, i.e., x=0.

**Iteration 0:** midpoint = 0. `f′(0) = 0` (numerically: nearly zero). `|f′(0)| < DERIVATIVE_TOLERANCE`. Done.

`fValue = f(0) = 0 - 3 = -3`. `classifyExtremum(-10, 10)` → `'MINIMUM'`.

Return: `{ xValue: 0, fValue: -3, extremumType: 'MINIMUM', iterations: 1 }`. ✓

---

## Step 3 — Tests

Create `src/extrema-finder.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { findExtremum }            from './extrema-finder.js'
import { createEnvironment }       from './environment.js'
import { AngleMode }               from './types.js'
import { isCalcError }             from './calc-error.js'

describe('findExtremum', () => {
  const env = createEnvironment()

  test('finds minimum of x^2 - 3 in [-5, 5]', () => {
    const fn     = { parameterName: 'x', bodyExpression: 'x^2 - 3' }
    const result = findExtremum(fn, -5, 5, env, AngleMode.DEGREES)

    expect(isCalcError(result)).toBe(false)
    if (!isCalcError(result)) {
      expect(Math.abs(result.xValue)).toBeLessThan(1e-5)
      expect(Math.abs(result.fValue + 3)).toBeLessThan(1e-5)
      expect(result.extremumType).toBe('MINIMUM')
    }
  })

  test('finds maximum of -x^2 + 4 in [-5, 5]', () => {
    const fn     = { parameterName: 'x', bodyExpression: '-x^2 + 4' }
    const result = findExtremum(fn, -5, 5, env, AngleMode.DEGREES)

    if (!isCalcError(result)) {
      expect(Math.abs(result.xValue)).toBeLessThan(1e-5)
      expect(Math.abs(result.fValue - 4)).toBeLessThan(1e-5)
      expect(result.extremumType).toBe('MAXIMUM')
    }
  })

  test('returns error when no sign change in derivative', () => {
    // x^2 - 3 has f′ > 0 everywhere in [1, 5] — no minimum there
    const fn     = { parameterName: 'x', bodyExpression: 'x^2 - 3' }
    const result = findExtremum(fn, 1, 5, env, AngleMode.DEGREES)
    expect(isCalcError(result)).toBe(true)
  })
})
```

Run `npm test`. All tests pass.

---

## Step 4 — Mark the Extremum on the Canvas

Add to `src/graph-renderer.ts`:

```typescript
import { ExtremumType } from './extrema-finder.js'

export function drawExtremumMarker(
  context:      CanvasRenderingContext2D,
  xValue:       number,
  yValue:       number,
  extremumType: ExtremumType,
  viewport:     Viewport,
): void {
  const { canvasX, canvasY } = mathToCanvas(xValue, yValue, viewport)
  const colour = extremumType === 'MINIMUM' ? '#fbbf24' : '#34d399'  // amber : emerald

  context.fillStyle = colour
  context.beginPath()
  context.arc(canvasX, canvasY, 5, 0, Math.PI * 2)
  context.fill()

  const arrowSymbol = extremumType === 'MINIMUM' ? '▼' : '▲'
  context.fillStyle = '#ffffff'
  context.font      = '10px monospace'
  context.textAlign = 'center'
  context.fillText(
    `${arrowSymbol} (${xValue.toPrecision(4)}, ${yValue.toPrecision(4)})`,
    canvasX,
    extremumType === 'MINIMUM' ? canvasY + 18 : canvasY - 10,
  )
}
```

Minima are marked amber (▼), maxima emerald (▲). The arrow symbol points toward
the extremum — ▼ for a minimum (the low point), ▲ for a maximum (the high point).
The label is placed below minima and above maxima to avoid overlapping the curve.

---

## Debugging: When Extrema Finding Behaves Wrongly

**Symptom: returns no sign change in interval even though a minimum visually exists**

The derivative `f′` may not change sign in the given interval. For `f(x) = x^2 - 3`
in [-5, 5], `f′(x) = 2x` changes sign at `x = 0` — this should work. But for a
function that is monotonically increasing in the entire interval, `f′ > 0` throughout
and bisection correctly reports no sign change.

Add a log:
```typescript
const derFn = derivativeFunction(fn)
console.log("f'(a):", evaluateAt(derFn, a, env, mode))
console.log("f'(b):", evaluateAt(derFn, b, env, mode))
```

**Symptom: the extremum is classified as a minimum when it should be a maximum**

The second derivative test uses `f′′(xCrit) > 0` for minimum, `< 0` for maximum.
Check the sign in the classification logic — a common mistake is inverting the
condition. Add a log:
```typescript
console.log('secondDerivative:', secondDerivative)
```

**Symptom: marker appears at correct x but at y = 0 instead of y = f(x)**

`drawExtremumMarker` is called with `y = 0` instead of the function value at the
critical point. Verify the call: `drawExtremumMarker(ctx, xCrit, evaluateAt(fn, xCrit, ...), viewport, colour)`.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`findExtremum` is the fifth and final numerical method. With bisection (18), Newton
(20), intersection (19), integration (16), and extrema (21), the solver panel has
five operations. Every one is built on `evaluateAt` and `numericalDerivative` from
`differentiator.ts`. Two primitives, five algorithms.

The composition chain:
```
findExtremum
  → numericalDerivative (bisect the derivative)
  → evaluateAt (evaluate the derivative at each midpoint)
  → parseExpression (evaluate the function body)
  → environment bindings (resolve variable names)
```

The full chain of every module built across 21 lessons, in one call.

---

## What Breaks Without This

**Without the classifier:**
The solver finds x=0 for `f(x) = x^3`. `f′(0) = 0`. But x=0 is not a minimum or
maximum — it is an inflection point. Without classification, the solver reports it
as an extremum. A user making a design decision based on "the minimum is at x=0,
f(0)=0" would be wrong. The classification makes the distinction explicit and
testable.

**Without the sign-change check on the derivative:**
`findExtremum` on `f(x) = x^2 - 3` in [1, 5] would run. The derivative is `2x`,
which is positive throughout [1, 5] — no sign change, no extremum. The bisection
loop would converge to the midpoint of a narrowing interval that contains no zero
of `f′`. The returned result would be meaningless. The check prevents this exactly
as the sign-change check in `bisect` prevents rootless bisection.

---

## Definition of Done

- [ ] `findExtremum(f, -5, 5)` for `f(x) = x^2 - 3` → `x ≈ 0`, `f(x) ≈ -3`, type = MINIMUM
- [ ] `findExtremum(f, -5, 5)` for `f(x) = -x^2 + 4` → `x ≈ 0`, `f(x) ≈ 4`, type = MAXIMUM
- [ ] Extremum is marked on the graph with colour and arrow symbol
- [ ] No sign change in derivative → error message
- [ ] `npm test` passes all tests in `extrema-finder.test.ts`
- [ ] You can state Fermat's theorem and explain what a critical point is
- [ ] You can explain the first derivative test: what sign transition indicates a
      minimum vs a maximum vs an inflection point
- [ ] You can explain how `findExtremum` reduces to bisecting the derivative
- [ ] You can explain `ExtremumType` and how `classifyExtremum` works
- [ ] Run:
      ```
      git add src/extrema-finder.ts src/extrema-finder.test.ts src/graph-renderer.ts
      git commit -m "Add extrema finder: bisect the derivative to find where f'=0, first derivative test classifies min/max/inflection"
      ```

---

*Next: Lesson 22 — The Solver Panel. All five numerical methods are wired to a
unified UI. This is the final integration lesson: every module from lessons 01–21
is connected through a single panel.*
