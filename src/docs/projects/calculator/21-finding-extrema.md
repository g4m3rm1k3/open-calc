# Lesson 21 — Finding Extrema

## What You Will Build

The minimum and maximum of `f(x)` in an interval are found and marked on the graph.
The solver uses numerical differentiation and bisection — no new algorithm is written.

## What You Need to Know First

Lessons 01–20. `numericalDerivative` from lesson 20. The bisection solver from
lesson 18. This lesson applies both to a new problem.

---

## The Lesson

### The problem

Given `f(x) = x^2 - 3`, find the minimum value and where it occurs.
The minimum is at x=0, f(0) = -3. We can see this on the graph. But for
`f(x) = x^4 - 3x^2 + 2`, the minimum requires solving `f′(x) = 0`.

---

### Step 1 — Maths — local extrema and the derivative

**Maths — local minimum and maximum:**
A local minimum of `f` is a point where `f(x)` is smaller than all nearby points.
A local maximum is a point where `f(x)` is larger than all nearby points.

At a local minimum or maximum (an "extremum"), the tangent line is horizontal.
The slope is zero. This means: `f′(x) = 0`.

This is Fermat's theorem: if `f` has a local extremum at an interior point `c`,
and `f` is differentiable there, then `f′(c) = 0`.

**Finding extrema using bisection:**
We want to find x where `f′(x) = 0`. This is the root of `f′`. We already have
bisection for finding roots. We already have `numericalDerivative` for computing
`f′`. Combined:

1. Compute `f′` numerically as a function of x
2. Use bisection to find the root of `f′` in the interval
3. The x value found is a candidate extremum
4. Check: is it a minimum (f′ goes from negative to positive) or maximum (positive to negative)?

This is problem reduction again: extrema → roots of derivative → bisection.

**Critical point vs extremum:**
Not every point where `f′(x) = 0` is a minimum or maximum. For `f(x) = x^3`,
`f′(0) = 0` but x=0 is not an extremum — it is an inflection point. To confirm
an extremum, we can check:
- If `f′` changes from negative to positive at x=c: local minimum
- If `f′` changes from positive to negative at x=c: local maximum
- If `f′` does not change sign: inflection point (not an extremum)

---

### Step 2 — The extrema finder

Create `src/extrema-finder.ts`:

```typescript
import { bisect, SolverResult }      from './bisection-solver.js'
import { numericalDerivative }        from './differentiator.js'
import { evaluateAt }                 from './function-evaluator.js'
import { Environment }                from './environment.js'
import { UserFunction }               from './types.js'
import { AngleMode }                  from './types.js'
import { CalcError, makeError, isCalcError } from './calc-error.js'

export type ExtremumType = 'MINIMUM' | 'MAXIMUM' | 'INFLECTION'

export interface ExtremumResult {
  xValue:       number
  fValue:       number
  extremumType: ExtremumType
  iterations:   number
}

const DERIVATIVE_EPSILON = 1e-7

export function findExtremum(
  userFunction: UserFunction,
  lowerBound:   number,
  upperBound:   number,
  environment:  Environment,
  angleMode:    AngleMode,
): ExtremumResult | CalcError {
  // Create a "function" representing f′(x)
  // We do this by creating a wrapper that evaluates the numerical derivative
  // The bisection solver needs a UserFunction, so we wrap the derivative evaluation

  const derivativeFn: UserFunction = {
    parameterName:  userFunction.parameterName,
    // The body is a placeholder — evaluateAt will be overridden below
    bodyExpression: `__derivative_of_${userFunction.parameterName}`,
  }

  // Instead of a standard UserFunction, we use bisect's raw interface
  // by defining a function that computes f'(x)
  let lowerDerivative = numericalDerivative(userFunction, lowerBound, environment, angleMode)
  let upperDerivative = numericalDerivative(userFunction, upperBound, environment, angleMode)

  if (lowerDerivative === null || upperDerivative === null) {
    return makeError('INVALID_EXPRESSION', 'Derivative is undefined at the bounds')
  }

  if (lowerDerivative * upperDerivative > 0) {
    return makeError(
      'INVALID_EXPRESSION',
      `No extremum found in [${lowerBound}, ${upperBound}] — derivative does not change sign`,
    )
  }

  // Binary search on the derivative
  let currentLower = lowerBound
  let currentUpper = upperBound
  let iterationCount = 0

  for (; iterationCount < 100; iterationCount++) {
    const midpoint           = (currentLower + currentUpper) / 2
    const midpointDerivative = numericalDerivative(userFunction, midpoint, environment, angleMode)

    if (midpointDerivative === null) break

    if (Math.abs(midpointDerivative) < DERIVATIVE_EPSILON) {
      const fValue = evaluateAt(userFunction, midpoint, environment, angleMode)
      if (fValue === null) return makeError('INVALID_EXPRESSION', 'Function undefined at extremum')

      const extremumType = classifyExtremum(lowerDerivative, upperDerivative)

      return { xValue: midpoint, fValue, extremumType, iterations: iterationCount + 1 }
    }

    lowerDerivative = numericalDerivative(userFunction, currentLower, environment, angleMode) ?? lowerDerivative
    if (midpointDerivative * lowerDerivative < 0) {
      currentUpper = midpoint
      upperDerivative = midpointDerivative
    } else {
      currentLower = midpoint
      lowerDerivative = midpointDerivative
    }
  }

  const finalMidpoint = (currentLower + currentUpper) / 2
  const fFinal = evaluateAt(userFunction, finalMidpoint, environment, angleMode)
  if (fFinal === null) return makeError('INVALID_EXPRESSION', 'Function undefined at extremum')

  return {
    xValue:       finalMidpoint,
    fValue:       fFinal,
    extremumType: classifyExtremum(lowerDerivative, upperDerivative),
    iterations:   iterationCount,
  }
}

function classifyExtremum(
  leftDerivative:  number,
  rightDerivative: number,
): ExtremumType {
  if (leftDerivative < 0 && rightDerivative > 0) return 'MINIMUM'
  if (leftDerivative > 0 && rightDerivative < 0) return 'MAXIMUM'
  return 'INFLECTION'
}
```

**CS lens — composing numerical methods:**
`findExtremum` does binary search on the derivative — exactly bisection, but with
`numericalDerivative` as the function being evaluated instead of the original function.
The algorithm is the same: find the sign change, halve the interval, repeat.

The derivative changes sign from negative to positive at a minimum (the function
goes from decreasing to increasing). It changes from positive to negative at a
maximum. `classifyExtremum` reads the signs and returns the type.

---

### Step 3 — Tests

```typescript
describe('findExtremum', () => {
  const quadraticFn = { parameterName: 'x', bodyExpression: 'x^2 - 3' }
  const env         = createEnvironment()

  test('finds minimum of x^2 - 3 in [-5, 5]', () => {
    const result = findExtremum(quadraticFn, -5, 5, env, AngleMode.DEGREES)
    expect(isCalcError(result)).toBe(false)
    if (!isCalcError(result)) {
      expect(Math.abs(result.xValue)).toBeLessThan(1e-5)   // x ≈ 0
      expect(Math.abs(result.fValue + 3)).toBeLessThan(1e-5) // f(0) = -3
      expect(result.extremumType).toBe('MINIMUM')
    }
  })

  test('finds maximum of -x^2 + 4 in [-5, 5]', () => {
    const maxFn  = { parameterName: 'x', bodyExpression: '-x^2 + 4' }
    const result = findExtremum(maxFn, -5, 5, env, AngleMode.DEGREES)
    if (!isCalcError(result)) {
      expect(Math.abs(result.xValue)).toBeLessThan(1e-5)
      expect(Math.abs(result.fValue - 4)).toBeLessThan(1e-5)
      expect(result.extremumType).toBe('MAXIMUM')
    }
  })

  test('returns error when no sign change in derivative', () => {
    // x^2 - 3 has no extremum in [1, 5] — derivative is positive throughout
    const result = findExtremum(quadraticFn, 1, 5, env, AngleMode.DEGREES)
    expect(isCalcError(result)).toBe(true)
  })
})
```

---

### Step 4 — Mark the extremum on the canvas

Add to `src/graph-renderer.ts`:

```typescript
export function drawExtremumMarker(
  context:       CanvasRenderingContext2D,
  xValue:        number,
  yValue:        number,
  extremumType:  ExtremumType,
  viewport:      Viewport,
): void {
  const { canvasX, canvasY } = mathToCanvas(xValue, yValue, viewport)
  const colour = extremumType === 'MINIMUM' ? '#fbbf24' : '#34d399'

  context.fillStyle = colour
  context.beginPath()
  context.arc(canvasX, canvasY, 5, 0, Math.PI * 2)
  context.fill()

  const label = extremumType === 'MINIMUM' ? '▼' : '▲'
  context.fillStyle = '#ffffff'
  context.font      = '10px monospace'
  context.textAlign = 'center'
  context.fillText(
    `${label} (${xValue.toPrecision(4)}, ${yValue.toPrecision(4)})`,
    canvasX,
    extremumType === 'MINIMUM' ? canvasY + 18 : canvasY - 10,
  )
}
```

---

## Connect the Pieces

`findExtremum` is the last numerical method. With bisection (18), Newton (20),
intersection (19), integration (16), and extrema (21), the solver panel (lesson 22)
has five operations to offer. Every one is built on `evaluateAt` and `numericalDerivative`.
The same two primitives power all five algorithms.

---

## What Breaks Without This

The classifier (`classifyExtremum`) is essential. Without it, the solver finds a
critical point but cannot tell the user whether it is a minimum, maximum, or
inflection point. For `f(x) = x^3`, the critical point at x=0 is an inflection
point — neither a minimum nor a maximum. A solver that calls it a minimum is wrong,
and the user's next decision (e.g., using this as the minimum for an engineering
calculation) would be based on false information.

---

## Definition of Done

- [ ] `minimum(f, -5, 5)` for `f(x) = x^2 - 3` → x ≈ 0, f(x) ≈ -3
- [ ] `maximum(f, -5, 5)` for `f(x) = -x^2 + 4` → x ≈ 0, f(x) ≈ 4
- [ ] Min/max marked on graph with distinct colours and coordinate labels
- [ ] Extremum type (MINIMUM/MAXIMUM/INFLECTION) is returned and displayed
- [ ] No extremum in interval → error message
- [ ] `npm test` passes all new tests
