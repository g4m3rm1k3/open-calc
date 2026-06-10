# Lesson 18 — Bisection Solver

## What You Will Build

The root of `f(x) = 0` is found using bisection and marked on the graph. The
narrowing bracket is visible during animated playback. The number of iterations
is shown.

## What You Need to Know First

Lessons 01–17. `evaluateAt` evaluates f at any x. The canvas can draw markers.
This lesson adds the first numerical solver.

---

## The Lesson

### The problem

Given `f(x) = x^2 - 4`, find x such that `f(x) = 0`. The answers are x=2 and
x=-2. We know this analytically. But for `f(x) = x^3 - 2x - 5`, there is no
simple formula. We need an algorithm.

---

### Step 1 — Maths — roots and the intermediate value theorem

**Maths — what is a root?**
A root of `f(x)` is a value x where `f(x) = 0`. Roots are also called "zeros."
Geometrically, a root is where the curve crosses the x-axis.

**Maths — the intermediate value theorem:**
If `f` is continuous on `[a, b]` and `f(a)` and `f(b)` have opposite signs
(one positive, one negative), then there is at least one root in `(a, b)`.

This is intuitive: a continuous curve that starts below the x-axis and ends above
it must cross the x-axis somewhere. It cannot jump over it.

This theorem is the foundation of bisection. To find a root, we need an interval
`[a, b]` where `f(a) × f(b) < 0` (opposite signs). The theorem guarantees a root
exists inside.

**Maths — the bisection algorithm:**
1. Check that `f(a)` and `f(b)` have opposite signs. If not, no guaranteed root.
2. Find the midpoint: `m = (a + b) / 2`
3. Evaluate `f(m)`
4. If `|f(m)| < tolerance`, m is the root — stop.
5. If `f(m)` has the same sign as `f(a)`, the root is in `[m, b]`. Set `a = m`.
6. If `f(m)` has the same sign as `f(b)`, the root is in `[a, m]`. Set `b = m`.
7. Repeat from step 2.

Each iteration halves the interval. After `n` iterations, the interval width is
`(b - a) / 2^n`. For a starting interval of width 10 and tolerance `1e-10`:
`10 / 2^n < 1e-10` → `n > 33.2` → about 34 iterations. Bisection always converges
in a predictable number of steps.

---

### Step 2 — The solver

Create `src/bisection-solver.ts`:

```typescript
import { evaluateAt }    from './function-evaluator.js'
import { Environment }   from './environment.js'
import { UserFunction }  from './types.js'
import { AngleMode }     from './types.js'
import { CalcError, makeError, isCalcError } from './calc-error.js'

export interface SolverStep {
  lowerBound: number
  upperBound: number
  midpoint:   number
  fMidpoint:  number
}

export interface SolverResult {
  root:       number
  fAtRoot:    number
  iterations: number
  steps:      SolverStep[]
}

const MAX_ITERATIONS = 100
const DEFAULT_TOLERANCE = 1e-10

export function bisect(
  userFunction: UserFunction,
  lowerBound:   number,
  upperBound:   number,
  environment:  Environment,
  angleMode:    AngleMode,
  tolerance:    number = DEFAULT_TOLERANCE,
): SolverResult | CalcError {
  const fLower = evaluateAt(userFunction, lowerBound, environment, angleMode)
  const fUpper = evaluateAt(userFunction, upperBound, environment, angleMode)

  if (fLower === null || fUpper === null) {
    return makeError('INVALID_EXPRESSION', 'Function is undefined at one of the bounds')
  }

  if (fLower * fUpper > 0) {
    return makeError(
      'INVALID_EXPRESSION',
      `No sign change in [${lowerBound}, ${upperBound}] — cannot guarantee a root`,
    )
  }

  let currentLower = lowerBound
  let currentUpper = upperBound
  const steps: SolverStep[] = []

  for (let iterationCount = 0; iterationCount < MAX_ITERATIONS; iterationCount++) {
    const midpoint  = (currentLower + currentUpper) / 2
    const fMidpoint = evaluateAt(userFunction, midpoint, environment, angleMode)

    if (fMidpoint === null) break

    steps.push({ lowerBound: currentLower, upperBound: currentUpper, midpoint, fMidpoint })

    if (Math.abs(fMidpoint) < tolerance) {
      return { root: midpoint, fAtRoot: fMidpoint, iterations: iterationCount + 1, steps }
    }

    const fLowerCurrent = evaluateAt(userFunction, currentLower, environment, angleMode)
    if (fLowerCurrent === null) break

    if (fMidpoint * fLowerCurrent < 0) {
      currentUpper = midpoint  // root is in the left half
    } else {
      currentLower = midpoint  // root is in the right half
    }
  }

  const finalMidpoint = (currentLower + currentUpper) / 2
  const fFinal = evaluateAt(userFunction, finalMidpoint, environment, angleMode) ?? 0

  return {
    root:       finalMidpoint,
    fAtRoot:    fFinal,
    iterations: MAX_ITERATIONS,
    steps,
  }
}
```

**CS lens — binary search:**
Bisection is binary search applied to a continuous function. Binary search on a
sorted array works by halving the search space at each step. Bisection halves the
interval at each step. Both have `O(log n)` convergence. The connection is exact:
bisection is the continuous analogue of binary search.

Convergence rate: each iteration reduces the error by half. Starting with error
`ε₀`, after `n` iterations the error is `ε₀ / 2^n`. This is linear convergence —
slow compared to Newton's method (lesson 20) but guaranteed for any continuous
function with a sign change.

---

### Step 3 — Tests

```typescript
describe('bisect', () => {
  const squareFn = { parameterName: 'x', bodyExpression: 'x^2 - 4' }
  const env      = createEnvironment()

  test('finds positive root of x^2 - 4 in [0, 5]', () => {
    const result = bisect(squareFn, 0, 5, env, AngleMode.DEGREES)
    expect(isCalcError(result)).toBe(false)
    if (!isCalcError(result)) {
      expect(Math.abs(result.root - 2)).toBeLessThan(1e-9)
    }
  })

  test('finds negative root of x^2 - 4 in [-5, 0]', () => {
    const result = bisect(squareFn, -5, 0, env, AngleMode.DEGREES)
    if (!isCalcError(result)) {
      expect(Math.abs(result.root - (-2))).toBeLessThan(1e-9)
    }
  })

  test('returns error when no sign change', () => {
    const result = bisect(squareFn, 3, 5, env, AngleMode.DEGREES)
    expect(isCalcError(result)).toBe(true)
  })

  test('converges in ≤ 50 iterations for standard precision', () => {
    const result = bisect(squareFn, 0, 5, env, AngleMode.DEGREES)
    if (!isCalcError(result)) {
      expect(result.iterations).toBeLessThanOrEqual(50)
    }
  })
})
```

---

### Step 4 — Mark the root on the canvas

Add to `src/graph-renderer.ts`:

```typescript
export function drawRootMarker(
  context:   CanvasRenderingContext2D,
  rootX:     number,
  viewport:  Viewport,
  colour:    string,
): void {
  const { canvasX, canvasY } = mathToCanvas(rootX, 0, viewport)

  context.fillStyle = colour
  context.beginPath()
  context.arc(canvasX, canvasY, 6, 0, Math.PI * 2)
  context.fill()

  context.fillStyle   = '#ffffff'
  context.font        = '11px monospace'
  context.textAlign   = 'center'
  context.fillText(`x ≈ ${rootX.toPrecision(6)}`, canvasX, canvasY - 12)
}
```

---

## Connect the Pieces

`bisect` returns `SolverResult` with a `steps` array. The solver panel (lesson 22)
uses these steps for animated playback — drawing the narrowing brackets on the
canvas one step at a time. The `steps` array also makes the algorithm transparent:
the user can see every interval the solver tested.

---

## What Breaks Without This

Without the sign change check, bisection happily runs on `f(x) = x^2 + 1` in
`[-5, 5]`. Both endpoints are positive. The midpoint is also positive. The solver
converges to... nothing. It hits `MAX_ITERATIONS` and returns the midpoint of the
final tiny interval, which is not a root at all. The error message is essential:
it tells the user exactly what is required for bisection to work.

---

## Definition of Done

- [ ] `bisect(f, -5, 5)` for `f(x) = x^2 - 4` → approximately `x = 2` or `x = -2`
- [ ] Root is marked on the graph with a circle and coordinate label
- [ ] No sign change → error message shown
- [ ] Iteration count is shown after the result
- [ ] `npm test` passes all new tests
