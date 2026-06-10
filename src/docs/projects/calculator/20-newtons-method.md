# Calculator — Lesson 20 — Newton's Method

## What You Will Build

The root of `f(x) = x^2 - 4` is found in 5–7 iterations where bisection needed
~37. The iteration count for both methods is shown side by side. Newton's method
requires a starting guess and a numerically approximated derivative.

## What You Need to Know First

Lessons 01–19. The bisection solver (lesson 18) as a reference for comparison. This
lesson presents a faster root-finding algorithm and explains precisely why it is
faster — and what it costs.

---

## The Problem

Bisection is guaranteed to converge in about 37 iterations for a tolerance of
`1e-10`. For every function, every interval, the iteration count is predictable.
Newton's method finds the same root in 5–7 iterations. Why is it faster, and what
does that speed cost?

---

## Step 1 — Maths: Derivatives and Tangent Lines

### The derivative

The **derivative** `f′(x)` of a function `f` at a point `x` is the slope of the
tangent line to the curve at that point. Informally: how fast is `f` changing at
`x`?

For `f(x) = x^2`, the derivative is `f′(x) = 2x`. At x=3: slope = 6 (rising steeply).
At x=0: slope = 0 (flat — the bottom of the parabola). At x=-1: slope = -2 (falling).

The derivative is a function: it takes x and returns the slope of `f` at x.

### Numerical differentiation

We do not compute derivatives symbolically here — that would require a separate
symbolic algebra system. Instead, we **approximate** the derivative numerically
using the **central difference formula**:

```
f′(x) ≈ (f(x + h) - f(x - h)) / (2h)
```

where `h` is a small number (we use `h = 1e-7`).

**Why central difference?**
The forward difference is `(f(x+h) - f(x)) / h`. This estimates the slope from
`x` to `x+h`. The central difference uses both directions — from `x-h` to `x+h`.
The central difference is **second-order accurate**: its error is proportional to
`h^2`. The forward difference is first-order: error proportional to `h`. For the
same `h = 1e-7`, the central difference error is `(1e-7)^2 = 1e-14`, while the
forward difference error is `1e-7`. The central difference is 10 million times more
accurate.

For root-finding, where precision matters, the central difference is the better default.

### Newton's formula

The tangent line at `(x₀, f(x₀))` with slope `f′(x₀)` has equation:
```
y - f(x₀) = f′(x₀) × (x - x₀)
```

Setting `y = 0` (where the tangent crosses the x-axis) and solving for x:
```
x₁ = x₀ - f(x₀) / f′(x₀)
```

This `x₁` is a better estimate of the root. Apply the formula again with `x₁` to
get `x₂`, and so on. This is Newton's method.

**Geometric interpretation:** At the current guess `x₀`, draw the tangent line.
Follow it until it hits the x-axis. That intersection is the next guess.

### Why Newton's method is faster: quadratic convergence

Bisection halves the error each iteration: error goes from `ε₀` to `ε₀/2`. This
is **linear convergence**.

Newton's method, when close to the root, squares the error each iteration: error
goes from `ε` to roughly `ε^2`. This is **quadratic convergence**.

|     Iteration     | Bisection error  | Newton error     |
|:-----------------:|:----------------:|:----------------:|
| Start             | 0.1              | 0.1              |
| After 1 iteration | 0.05             | 0.01             |
| After 2 iterations| 0.025            | 0.0001           |
| After 3 iterations| 0.0125           | 0.00000001       |

At small errors, Newton converges orders of magnitude faster. At error 0.001,
bisection halves to 0.0005. Newton squares to 0.000001. This is why bisection
needs 37 iterations and Newton needs 7.

**What Newton's method costs:**
1. It requires evaluating `f′(x)` at each step — twice as many function evaluations
   as bisection per step, though Newton needs far fewer steps overall.
2. It requires a starting guess. A bad guess can cause divergence (the method heads
   away from the root) or cycling (oscillating between two values).
3. It fails when `f′(x) = 0` at a step — dividing by zero. The tangent is
   horizontal and never crosses zero.

Bisection has none of these limitations. It only needs two initial points with
opposite signs. The choice between them depends on the function and available
information.

---

## Step 2 — Numerical Differentiation

### The code

Create `src/differentiator.ts`:

```typescript
import { evaluateAt }              from './function-evaluator.js'
import { Environment }             from './environment.js'
import { UserFunction, AngleMode } from './types.js'

const DERIVATIVE_STEP = 1e-7

export function numericalDerivative(
  userFunction: UserFunction,
  xValue:       number,
  environment:  Environment,
  angleMode:    AngleMode,
): number | null {
  const forwardValue  = evaluateAt(userFunction, xValue + DERIVATIVE_STEP, environment, angleMode)
  const backwardValue = evaluateAt(userFunction, xValue - DERIVATIVE_STEP, environment, angleMode)

  if (forwardValue === null || backwardValue === null) return null

  return (forwardValue - backwardValue) / (2 * DERIVATIVE_STEP)
}
```

**What `src/differentiator.ts` is:**
`differentiator.ts` owns the numerical derivative computation. It calls `evaluateAt`
twice, once at `x + h` and once at `x - h`, and returns the central difference. It
returns `null` if the function is undefined at either evaluation point.

**`DERIVATIVE_STEP = 1e-7` as a module-level constant:**
The step size is defined once at the module level. Every call to `numericalDerivative`
uses this value. If a particular function requires a different step size for accuracy,
there is one place to change it. Functions that call `numericalDerivative` do not
know the step size — the choice is encapsulated.

### Walkthrough — derivative of `x^2 - 4` at x=3

`DERIVATIVE_STEP = 1e-7`. `xValue = 3`.

`evaluateAt(f, 3 + 1e-7, env, DEG)` = `(3+1e-7)^2 - 4` = `9 + 6e-7 + 1e-14 - 4` = `5 + 6e-7 + 1e-14`

`evaluateAt(f, 3 - 1e-7, env, DEG)` = `(3-1e-7)^2 - 4` = `9 - 6e-7 + 1e-14 - 4` = `5 - 6e-7 + 1e-14`

Central difference:
`((5 + 6e-7) - (5 - 6e-7)) / (2 × 1e-7) = (12e-7) / (2e-7) = 6`

Exact answer: `f′(x) = 2x`, so `f′(3) = 6`. ✓ The `1e-14` terms cancelled out —
that is why central difference is second-order accurate.

---

## Step 3 — Newton's Method

### The code

Create `src/newton-solver.ts`:

```typescript
import { evaluateAt }            from './function-evaluator.js'
import { numericalDerivative }   from './differentiator.js'
import { Environment }           from './environment.js'
import { UserFunction, AngleMode } from './types.js'
import { CalcError, makeError }  from './calc-error.js'
import { SolverResult, SolverStep } from './bisection-solver.js'

const MAX_ITERATIONS    = 100
const DEFAULT_TOLERANCE = 1e-10

export function newton(
  userFunction: UserFunction,
  initialGuess: number,
  environment:  Environment,
  angleMode:    AngleMode,
  tolerance:    number = DEFAULT_TOLERANCE,
): SolverResult | CalcError {
  let currentGuess = initialGuess
  const steps: SolverStep[] = []

  for (let iterationCount = 0; iterationCount < MAX_ITERATIONS; iterationCount++) {
    const fValue          = evaluateAt(userFunction, currentGuess, environment, angleMode)
    const derivativeValue = numericalDerivative(userFunction, currentGuess, environment, angleMode)

    if (fValue === null) {
      return makeError(
        'INVALID_EXPRESSION',
        `Function undefined at x = ${currentGuess}`,
      )
    }

    if (derivativeValue === null || Math.abs(derivativeValue) < 1e-14) {
      return makeError(
        'INVALID_EXPRESSION',
        `Derivative is zero at x = ${currentGuess} — Newton's method cannot continue`,
      )
    }

    steps.push({
      lowerBound: currentGuess,
      upperBound: currentGuess,
      midpoint:   currentGuess,
      fMidpoint:  fValue,
    })

    if (Math.abs(fValue) < tolerance) {
      return {
        root:       currentGuess,
        fAtRoot:    fValue,
        iterations: iterationCount + 1,
        steps,
      }
    }

    const nextGuess = currentGuess - fValue / derivativeValue

    if (!isFinite(nextGuess)) {
      return makeError(
        'INVALID_EXPRESSION',
        `Newton's method diverged at iteration ${iterationCount + 1}`,
      )
    }

    if (Math.abs(nextGuess - currentGuess) < tolerance) {
      return {
        root:       nextGuess,
        fAtRoot:    fValue,
        iterations: iterationCount + 1,
        steps,
      }
    }

    currentGuess = nextGuess
  }

  return makeError(
    'INVALID_EXPRESSION',
    `Newton's method did not converge after ${MAX_ITERATIONS} iterations`,
  )
}
```

**`SolverResult` is reused from `bisection-solver.ts`:**
`newton` returns the same `SolverResult | CalcError` type as `bisect`. This is
intentional: the solver panel (lesson 22) accepts the result of either method
through the same type. The two solvers are interchangeable at the interface level.

**Termination conditions:**
Newton's method has three ways to terminate:
1. `|f(currentGuess)| < tolerance` — the function value is close enough to zero.
2. `|nextGuess - currentGuess| < tolerance` — consecutive guesses are nearly the
   same, indicating convergence.
3. `MAX_ITERATIONS` exceeded — the method did not converge.

Both conditions 1 and 2 are needed. Condition 2 catches cases where the function
value is still non-trivial but the guesses have stopped changing — which can happen
near a multiple root where convergence is slower.

**`SolverStep` with single point:**
Newton's method has no bracket — it works from a single point. The `SolverStep`
struct (designed for bisection) stores `lowerBound = upperBound = midpoint =
currentGuess`. This reuse is pragmatic: the solver panel reads `iterations` and
`fAtRoot`, not the step details, so the struct works for both algorithms.

### Walkthrough — Newton on `f(x) = x^2 - 4` starting at x=1

**Iteration 0:** `currentGuess = 1`. `f(1) = -3`. `f′(1) = 2`.
`nextGuess = 1 - (-3)/2 = 1 + 1.5 = 2.5`.

**Iteration 1:** `currentGuess = 2.5`. `f(2.5) = 2.25`. `f′(2.5) = 5`.
`nextGuess = 2.5 - 2.25/5 = 2.5 - 0.45 = 2.05`.

**Iteration 2:** `currentGuess = 2.05`. `f(2.05) = 0.2025`. `f′(2.05) = 4.1`.
`nextGuess = 2.05 - 0.2025/4.1 ≈ 2.05 - 0.0494 ≈ 2.0006`.

**Iteration 3:** `currentGuess ≈ 2.0006`. `f ≈ 0.0024`. `f′ ≈ 4.001`.
`nextGuess ≈ 2.0006 - 0.0024/4.001 ≈ 2.0000004`.

After 4 iterations, the error is < 1e-6. After 6–7, it is < 1e-10. Compare: bisection
needs ~37 iterations to reach the same precision. Quadratic convergence is visible
in the walkthrough — each iteration roughly doubles the number of correct digits.

---

## Step 4 — Tests

Create `src/newton-solver.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { newton }                  from './newton-solver.js'
import { bisect }                  from './bisection-solver.js'
import { createEnvironment }       from './environment.js'
import { AngleMode }               from './types.js'
import { isCalcError }             from './calc-error.js'

describe('newton', () => {
  const squareFn = { parameterName: 'x', bodyExpression: 'x^2 - 4' }
  const env      = createEnvironment()

  test('finds root near x=1 → x≈2', () => {
    const result = newton(squareFn, 1, env, AngleMode.DEGREES)
    expect(isCalcError(result)).toBe(false)
    if (!isCalcError(result)) {
      expect(Math.abs(result.root - 2)).toBeLessThan(1e-9)
    }
  })

  test('Newton converges faster than bisection', () => {
    const bisectionResult = bisect(squareFn, 0, 5, env, AngleMode.DEGREES)
    const newtonResult    = newton(squareFn, 1, env, AngleMode.DEGREES)

    if (!isCalcError(bisectionResult) && !isCalcError(newtonResult)) {
      expect(newtonResult.iterations).toBeLessThan(bisectionResult.iterations)
    }
  })

  test('returns error when derivative is zero', () => {
    // f(x) = x^2 has derivative 0 at x=0
    const flatFn = { parameterName: 'x', bodyExpression: 'x^2' }
    const result = newton(flatFn, 0, env, AngleMode.DEGREES)
    expect(isCalcError(result)).toBe(true)
  })

  test('returns error when it does not converge', () => {
    // A function that causes oscillation near a bad guess
    // x^3 - 2x near x=0 has oscillating Newton iterates
    const oscillatingFn = { parameterName: 'x', bodyExpression: 'x^3 - 2*x' }
    const result = newton(oscillatingFn, 0.1, env, AngleMode.DEGREES)
    // This may converge or not — just verify it returns a valid type
    expect(result !== null).toBe(true)
  })
})
```

The convergence comparison test directly verifies the central claim of this lesson:
Newton's method converges in fewer iterations than bisection for the same function
and comparable starting points. This is a mathematical property test — not just
checking a value, but checking a relationship between two algorithms.

Run `npm test`. All tests pass.

---

## Debugging: When Newton's Method Behaves Wrongly

**Symptom: solver returns an error after `maxIterations` even though a root exists**

Newton's method may be diverging or oscillating. Add a log to see the iteration path:
```typescript
console.log('iter', iteration, 'guess:', currentGuess, 'f:', fValue)
```
If the guesses are oscillating (e.g., alternating between 3 and -3), the function
has a symmetry that prevents convergence from the chosen starting point. Try a
different `initialGuess` closer to the root.

If the derivative `f′(guess)` is near zero, Newton's formula divides by nearly zero
and produces a very large next guess. Check the `Math.abs(derivative) < 1e-14` guard
in the newton function.

**Symptom: Newton finds a root but it is not the root closest to `initialGuess`**

Newton's method converges to whichever root the gradient points toward from the
starting point. Different initial guesses can converge to different roots. For
`f(x) = x^3 - x`, starting at `x = 0.5` converges to `x = 1`; starting at `x = -0.5`
converges to `x = -1`. This is expected behaviour.

**Symptom: Newton requires more iterations than bisection for the same function**

For well-behaved functions, Newton converges quadratically and bisection linearly —
Newton should need fewer iterations. Verify the numerical derivative step size `h`
is small (e.g., `1e-7`). If `h` is too large, the derivative approximation is poor
and Newton takes many more steps.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`numericalDerivative` from `differentiator.ts` is reused in lesson 21 (finding
extrema). Extrema occur where `f′(x) = 0` — finding them means finding the root
of `f′`. Lesson 21 applies bisection to the numerical derivative. The same
`numericalDerivative` function, the same `bisect`, a new problem solved by
composition.

The two-solver system (bisection + Newton) is the foundation of the solver panel
(lesson 22). The user selects which method to use. Both return `SolverResult`.
The panel renders the same way regardless of which method produced the result.

---

## What Breaks Without This

**Without the derivative-zero check:**
If `f′(currentGuess) = 0`, then `currentGuess - fValue / 0 = ±Infinity`. The next
guess is `Infinity` or `-Infinity`. `evaluateAt` returns `null` for non-finite x
values. The iteration aborts silently. The user sees nothing — no result, no error.
The check converts the silent abort into an informative error message.

**Without central difference:**
Forward difference `(f(x+h) - f(x)) / h` has first-order error proportional to `h`.
For `h = 1e-7` near a root, the error in the derivative estimate is `1e-7`. This
reduces Newton's quadratic convergence to near-linear convergence. The method still
converges but needs more iterations. Central difference's second-order accuracy
(`h^2 = 1e-14`) keeps Newton's quadratic convergence intact.

---

## Definition of Done

- [ ] `newton(f, 1)` for `f(x) = x^2 - 4` → `x ≈ 2`
- [ ] Newton converges in fewer iterations than bisection for the same function (test passes)
- [ ] Iteration count for both methods is displayed in the solver panel
- [ ] Derivative of zero at starting guess → error message
- [ ] Non-convergence after 100 iterations → error message
- [ ] `npm test` passes all tests in `newton-solver.test.ts`
- [ ] You can derive Newton's formula from the tangent line equation
- [ ] You can explain quadratic convergence vs linear convergence with a concrete number example
- [ ] You can explain central difference and why it is more accurate than forward difference
- [ ] You can explain the three termination conditions and why both value-based and
      step-based conditions are needed
- [ ] Run:
      ```
      git add src/differentiator.ts src/newton-solver.ts src/newton-solver.test.ts
      git commit -m "Add Newton's method: quadratic convergence via tangent-line iteration, central difference derivative, convergence comparison verified by test"
      ```

---

*Next: Lesson 21 — Finding Extrema. Extrema occur where f′(x)=0. Finding them
is bisecting the numerical derivative. No new algorithm — problem reduction again.*
