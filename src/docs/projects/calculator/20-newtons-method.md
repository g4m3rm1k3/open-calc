# Lesson 20 — Newton's Method

## What You Will Build

The same root found in fewer steps. Newton's method converges in 5–7 iterations
where bisection needed 34. The iteration count for each method is shown side by
side. The convergence path is visible on the graph.

## What You Need to Know First

Lessons 01–19. The bisection solver (lesson 18). This lesson presents a faster
root-finding algorithm and explains why it is faster.

---

## The Lesson

### The problem

Bisection guaranteed convergence in about 34 iterations regardless of the function.
Newton's method finds the same root in 5–7 iterations for smooth functions. Why
is it faster, and what does it cost?

---

### Step 1 — Maths — derivatives and tangent lines

**Maths — the derivative:**
The derivative `f′(x)` of a function `f` at a point `x` is the slope of the
tangent line to the curve at that point. Informally: how fast is `f` changing at `x`?

If `f(x) = x^2`, then `f′(x) = 2x`. At x=3, the slope is 6 — the curve is rising
steeply. At x=0, the slope is 0 — the curve is at its flattest.

We do not compute the derivative symbolically. We approximate it numerically using
the central difference formula:

```
f′(x) ≈ (f(x + h) - f(x - h)) / (2h)
```

where `h` is a small number (we use `h = 1e-7`).

**Why central difference?**
The forward difference `(f(x+h) - f(x)) / h` estimates the slope from `x` to
`x+h`. The central difference uses both directions: `x-h` to `x+h`. This gives
a second-order approximation (error ∝ `h^2`) vs the forward difference's first-order
approximation (error ∝ `h`). For the same `h = 1e-7`, central difference is 10
million times more accurate.

**Maths — Newton's formula:**
Newton's method uses the tangent line at the current guess `x₀` to estimate where
the function crosses zero. The tangent line at `(x₀, f(x₀))` with slope `f′(x₀)`
crosses zero at:

```
x₁ = x₀ - f(x₀) / f′(x₀)
```

This new `x₁` is a better estimate of the root. Repeat with `x₁` to get `x₂`, and
so on. This is Newton's method.

**Why is it faster?**
Bisection halves the error each iteration (linear convergence). Newton's method
squares the error each iteration (quadratic convergence). If the current error is
`ε`, bisection produces error `ε/2`. Newton produces error ≈ `ε^2`.

At error `0.1`: bisection → `0.05`. Newton → `0.01`. Already twice as fast.
At error `0.001`: bisection → `0.0005`. Newton → `0.000001`. Now 500× as fast.

Quadratic convergence means once Newton's method is close to the root, it gets
very close very quickly.

**What does it cost?**
Newton's method requires `f′(x)` at each step. It also requires a good starting
guess — far from the root, it can diverge or cycle. And it fails when `f′(x) = 0`
(horizontal tangent — the tangent line never crosses zero). Bisection has none
of these limitations. The choice between them depends on the function and the
available information.

---

### Step 2 — Numerical differentiation

Create `src/differentiator.ts`:

```typescript
import { evaluateAt }    from './function-evaluator.js'
import { Environment }   from './environment.js'
import { UserFunction }  from './types.js'
import { AngleMode }     from './types.js'

const DERIVATIVE_STEP = 1e-7

export function numericalDerivative(
  userFunction: UserFunction,
  xValue:       number,
  environment:  Environment,
  angleMode:    AngleMode,
): number | null {
  const fForward  = evaluateAt(userFunction, xValue + DERIVATIVE_STEP, environment, angleMode)
  const fBackward = evaluateAt(userFunction, xValue - DERIVATIVE_STEP, environment, angleMode)

  if (fForward === null || fBackward === null) return null

  return (fForward - fBackward) / (2 * DERIVATIVE_STEP)
}
```

**SE lens — one small step value, one place:**
`DERIVATIVE_STEP = 1e-7` is a module-level constant. If this value ever needs to
change — because a particular function requires a smaller or larger step — there is
one place to change it. Functions that call `numericalDerivative` do not know the
step size. The decision is encapsulated.

---

### Step 3 — Newton's method

Create `src/newton-solver.ts`:

```typescript
import { evaluateAt }         from './function-evaluator.js'
import { numericalDerivative } from './differentiator.js'
import { Environment }         from './environment.js'
import { UserFunction }        from './types.js'
import { AngleMode }           from './types.js'
import { CalcError, makeError, isCalcError } from './calc-error.js'
import { SolverResult, SolverStep }          from './bisection-solver.js'

const MAX_ITERATIONS = 100
const DEFAULT_TOLERANCE = 1e-10

export function newton(
  userFunction:  UserFunction,
  initialGuess:  number,
  environment:   Environment,
  angleMode:     AngleMode,
  tolerance:     number = DEFAULT_TOLERANCE,
): SolverResult | CalcError {
  let currentGuess = initialGuess
  const steps: SolverStep[] = []

  for (let iterationCount = 0; iterationCount < MAX_ITERATIONS; iterationCount++) {
    const fValue         = evaluateAt(userFunction, currentGuess, environment, angleMode)
    const derivativeValue = numericalDerivative(userFunction, currentGuess, environment, angleMode)

    if (fValue === null) {
      return makeError('INVALID_EXPRESSION', `Function undefined at x = ${currentGuess}`)
    }

    if (derivativeValue === null || Math.abs(derivativeValue) < 1e-14) {
      return makeError('INVALID_EXPRESSION', `Derivative is zero at x = ${currentGuess} — Newton's method cannot continue`)
    }

    steps.push({
      lowerBound: currentGuess,
      upperBound: currentGuess,  // Newton has a single point, not an interval
      midpoint:   currentGuess,
      fMidpoint:  fValue,
    })

    if (Math.abs(fValue) < tolerance) {
      return { root: currentGuess, fAtRoot: fValue, iterations: iterationCount + 1, steps }
    }

    const nextGuess = currentGuess - fValue / derivativeValue

    if (!isFinite(nextGuess)) {
      return makeError('INVALID_EXPRESSION', `Newton's method diverged at iteration ${iterationCount + 1}`)
    }

    if (Math.abs(nextGuess - currentGuess) < tolerance) {
      return { root: nextGuess, fAtRoot: fValue, iterations: iterationCount + 1, steps }
    }

    currentGuess = nextGuess
  }

  return makeError('INVALID_EXPRESSION', `Newton's method did not converge after ${MAX_ITERATIONS} iterations`)
}
```

---

### Step 4 — Tests that compare convergence

```typescript
describe('newton', () => {
  const squareFn = { parameterName: 'x', bodyExpression: 'x^2 - 4' }
  const env      = createEnvironment()

  test('finds root of x^2 - 4 starting near x=1', () => {
    const result = newton(squareFn, 1, env, AngleMode.DEGREES)
    expect(isCalcError(result)).toBe(false)
    if (!isCalcError(result)) {
      expect(Math.abs(result.root - 2)).toBeLessThan(1e-9)
    }
  })

  test('converges faster than bisection', () => {
    const bisectionResult = bisect(squareFn, 0, 5, env, AngleMode.DEGREES)
    const newtonResult    = newton(squareFn, 1, env, AngleMode.DEGREES)

    if (!isCalcError(bisectionResult) && !isCalcError(newtonResult)) {
      expect(newtonResult.iterations).toBeLessThan(bisectionResult.iterations)
    }
  })

  test('returns error when derivative is zero', () => {
    // f(x) = x^2 has derivative 0 at x=0
    const result = newton({ parameterName: 'x', bodyExpression: 'x^2' }, 0, env, AngleMode.DEGREES)
    expect(isCalcError(result)).toBe(true)
  })
})
```

The convergence comparison test is a proof that Newton's method is faster.
It does not just assert a number — it asserts a relationship between two algorithms.

---

### Step 5 — Show the comparison

In the solver panel (lesson 22), the iteration counts of both methods will be
shown side by side. For now, add a simple comparison display when Newton is run:

```typescript
// In the solver result display:
const comparisonText = `Bisection: ${bisectionIterations} iterations | Newton: ${newtonIterations} iterations`
```

---

## Connect the Pieces

`numericalDerivative` is reused in lesson 21 (finding extrema). Extrema occur
where `f′(x) = 0`. Finding where the derivative is zero is exactly finding the
root of the derivative — so lesson 21 calls `bisect` on `numericalDerivative`.
The pattern continues: new problems reduce to solved ones.

---

## What Breaks Without This

Without central difference, numerical differentiation uses forward difference:
`(f(x+h) - f(x)) / h`. For `h = 1e-7`, the forward difference accumulates
cancellation error (two nearly equal numbers subtracted, losing precision).
Central difference is inherently more accurate for the same `h` because it
uses a symmetric estimate that cancels the leading error term.

For most functions this is unimportant. For functions with rapidly changing
derivatives near the root, it matters. The lesson: algorithm choice affects
numerical stability, and central difference is the better default.

---

## Definition of Done

- [ ] `newton(f, 1)` for `f(x) = x^2 - 4` → approximately `x = 2`
- [ ] Newton converges in fewer iterations than bisection (verified by test)
- [ ] Iteration count for both methods is shown
- [ ] Derivative of zero → error message
- [ ] Non-convergence after 100 iterations → error message
- [ ] `npm test` passes all new tests
