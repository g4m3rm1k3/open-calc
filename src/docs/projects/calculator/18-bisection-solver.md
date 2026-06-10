# Calculator — Lesson 18 — Bisection Solver

## What You Will Build

The root of `f(x) = 0` is found using bisection and marked on the graph. For
`f(x) = x^2 - 4` in the interval [0, 5], the solver finds `x ≈ 2`. The number
of iterations is reported. No sign change in the interval → clear error message.

## What You Need to Know First

Lessons 01–17. `evaluateAt` evaluates `f` at any x value. The canvas can draw
markers. This lesson adds the first numerical solver.

---

## The Problem

Given `f(x) = x^2 - 4`, find x such that `f(x) = 0`. The answers are x=2 and x=-2.
We know this because `x^2 = 4 → x = ±2`. But for `f(x) = x^3 - 2x - 5`, there is
no closed-form formula. The only way to find the root is iteratively.

---

## Step 1 — Maths: Roots and the Intermediate Value Theorem

### What is a root?

A **root** (or zero) of `f(x)` is a value `x` where `f(x) = 0`. Geometrically, a
root is where the curve crosses the x-axis. A function can have zero, one, or many
roots. `f(x) = x^2 + 1` has no real roots (it never touches the x-axis). `f(x) = x`
has exactly one root (x=0). `f(x) = x^2 - 4` has two roots (x=2, x=-2).

### The intermediate value theorem

If `f` is continuous on `[a, b]` and `f(a)` and `f(b)` have **opposite signs** (one
positive, one negative), then there is at least one root somewhere inside `(a, b)`.

**Why:** A continuous function cannot jump from a positive value to a negative value
without passing through zero. If `f(a) > 0` and `f(b) < 0`, the function must cross
zero somewhere between `a` and `b`.

This theorem is the foundation of bisection. The sign check `f(a) × f(b) < 0` is
the code version of "opposite signs." If the check passes, bisection is guaranteed
to find a root.

### The bisection algorithm

1. Verify `f(a)` and `f(b)` have opposite signs. If not, stop — no guarantee.
2. Compute the midpoint: `m = (a + b) / 2`
3. Evaluate `f(m)`
4. If `|f(m)| < tolerance`, m is the root — done.
5. If `f(m)` has the same sign as `f(a)`: the root is in `[m, b]`. Replace `a` with `m`.
6. If `f(m)` has the same sign as `f(b)`: the root is in `[a, m]`. Replace `b` with `m`.
7. Return to step 2.

Each iteration halves the bracket. After `n` iterations, the bracket width is
`(b - a) / 2^n`. For a starting interval of width 10 and tolerance `1e-10`:

```
10 / 2^n < 1e-10
2^n > 10^11
n > log₂(10^11) = 11 × log₂(10) ≈ 11 × 3.32 ≈ 36.5
```

About 37 iterations. This is **predictable**: the iteration count depends only on
the interval width and tolerance, not on the function.

**CS lens — binary search:**
Bisection is **binary search** applied to a continuous function. Binary search on
a sorted array halves the search space at each step — it finds a target in O(log n)
steps. Bisection halves the root-bracketing interval at each step. The connection
is exact: bisection is the continuous analogue of binary search.

Both algorithms exploit a structural property: binary search needs a sorted array
(can determine which half contains the target); bisection needs opposite signs (can
determine which half contains the root). Both achieve O(log n) convergence.

---

## Step 2 — The Solver

### The code

Create `src/bisection-solver.ts`:

```typescript
import { evaluateAt }              from './function-evaluator.js'
import { Environment }             from './environment.js'
import { UserFunction, AngleMode } from './types.js'
import { CalcError, makeError }    from './calc-error.js'

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

const MAX_ITERATIONS    = 100
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
    return makeError(
      'INVALID_EXPRESSION',
      'Function is undefined at one of the bounds',
    )
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

    steps.push({
      lowerBound: currentLower,
      upperBound: currentUpper,
      midpoint,
      fMidpoint,
    })

    if (Math.abs(fMidpoint) < tolerance) {
      return {
        root:       midpoint,
        fAtRoot:    fMidpoint,
        iterations: iterationCount + 1,
        steps,
      }
    }

    const fCurrentLower = evaluateAt(userFunction, currentLower, environment, angleMode)
    if (fCurrentLower === null) break

    if (fMidpoint * fCurrentLower < 0) {
      currentUpper = midpoint  // root is in left half
    } else {
      currentLower = midpoint  // root is in right half
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

**What `src/bisection-solver.ts` is:**
`bisection-solver.ts` owns the bisection algorithm. It takes a function, a bracket,
and optional tolerance. It returns either a root result with the full iteration
history, or an error. It has no DOM access, no state, no side effects.

**Default parameter value — `tolerance = DEFAULT_TOLERANCE`:**
`tolerance: number = DEFAULT_TOLERANCE` is a **default parameter** — if the caller
does not provide `tolerance`, it defaults to `1e-10`. This is TypeScript/JavaScript
syntax: the `= value` after the parameter name sets its default. The caller can
override: `bisect(fn, 0, 5, env, mode, 1e-6)` uses a looser tolerance.

**`SolverStep[]` — recording the iteration history:**
The `steps` array records every iteration: what interval was tested, what the
midpoint was, what the function value was. This enables two things: the solver
panel (lesson 22) can show iteration count, and animated playback could show the
narrowing bracket step by step.

### Walkthrough — `bisect(f, 0, 5, env, DEG)` where `f(x) = x^2 - 4`

Initial: `lowerBound = 0`, `upperBound = 5`.
`fLower = f(0) = -4`. `fUpper = f(5) = 21`. Signs differ (`-4 × 21 < 0`) ✓.

**Iteration 0:** `midpoint = 2.5`. `f(2.5) = 6.25 - 4 = 2.25`. Positive.
`f(lower) = -4` (negative). `fMidpoint × fLower = 2.25 × (-4) < 0` → root in [0, 2.5].
`currentUpper = 2.5`.

**Iteration 1:** `midpoint = 1.25`. `f(1.25) = 1.5625 - 4 = -2.4375`. Negative.
`f(lower) = -4`. `fMidpoint × fLower = (-2.4375) × (-4) > 0` → root is NOT in
left half. `currentLower = 1.25`.

**Iteration 2:** `midpoint = 1.875`. `f(1.875) = 3.515625 - 4 = -0.484375`. Negative.
`f(lower) = f(1.25) = -2.4375`. Same sign → `currentLower = 1.875`.

**Iteration 3:** `midpoint = 2.1875`. `f(2.1875) = 4.785... - 4 = 0.785...`. Positive.
`f(lower) = -0.484375`. Different signs → `currentUpper = 2.1875`.

Each iteration, the bracket narrows toward x=2. After ~37 iterations, `|f(midpoint)| < 1e-10`.
Returns `{ root: 2.0, fAtRoot: ~0, iterations: ~37 }`. ✓

---

## Step 3 — Tests

Create `src/bisection-solver.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { bisect }                  from './bisection-solver.js'
import { createEnvironment }       from './environment.js'
import { AngleMode }               from './types.js'
import { isCalcError }             from './calc-error.js'

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
    // x^2 - 4 is positive everywhere in [3, 10]
    const result = bisect(squareFn, 3, 10, env, AngleMode.DEGREES)
    expect(isCalcError(result)).toBe(true)
  })

  test('converges in ≤ 50 iterations for default tolerance', () => {
    const result = bisect(squareFn, 0, 5, env, AngleMode.DEGREES)
    if (!isCalcError(result)) {
      expect(result.iterations).toBeLessThanOrEqual(50)
    }
  })

  test('records steps array with iteration history', () => {
    const result = bisect(squareFn, 0, 5, env, AngleMode.DEGREES)
    if (!isCalcError(result)) {
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.steps[0]?.midpoint).toBe(2.5)
    }
  })
})
```

Run `npm test`. All tests pass.

---

## Step 4 — Mark the Root on the Canvas

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

**`context.arc(x, y, radius, startAngle, endAngle)` — first appearance:**
`arc` draws a circular arc. The arguments are: centre x, centre y, radius in pixels,
start angle in radians, end angle in radians. `0` to `Math.PI * 2` is a full circle
(0 radians to 2π radians). After `context.fill()`, this produces a filled circle.
The root marker is a filled dot at canvas position `(canvasX, canvasY)`, which
corresponds to the x-axis at `x = rootX` (y=0 in mathematical coordinates).

**`number.toPrecision(6)` here:**
`.toPrecision(6)` gives 6 significant figures in the label — enough precision for
a visual annotation without cluttering the canvas.

---

## Debugging: When Bisection Behaves Wrongly

**Symptom: solver returns `Error: no sign change in interval` for a function with a known root**

The sign check `f(a) × f(b) < 0` failed. Either:
1. The root is outside `[a, b]` — check the initial bracket
2. The function is positive on both sides (e.g., touches x=0 but does not cross it,
   like `f(x) = x^2` at x=0)
3. `evaluateAt` returned `null` for one endpoint — check that neither bound is in an
   undefined region of the function

Add a log:
```typescript
console.log('f(a):', evaluateAt(fn, a, env, mode))
console.log('f(b):', evaluateAt(fn, b, env, mode))
```

**Symptom: solver runs but returns a value far from the true root**

The tolerance is too loose, or `maxIterations` is too small. Check the convergence
condition: the loop should run until `Math.abs(fAtMidpoint) < tolerance` OR the
bracket width is smaller than the tolerance. If only one condition is checked and it
is too loose, the algorithm terminates early with a poor approximation.

**Symptom: `bisect` runs but the root marker appears at the wrong x position**

`drawRootMarker` is being called with the wrong `rootX` value. Add a log:
```typescript
console.log('bisect result:', bisect(fn, a, b, env, mode))
```
Verify the returned `root` field matches the expected value before passing it to `drawRootMarker`.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`bisect` returns `SolverResult` with a `steps` array. The solver panel (lesson 22)
uses the iteration count and the `fAtRoot` value in its summary display. The `steps`
array preserves the full history of the algorithm — future extensions could
animate the narrowing bracket step by step.

Lesson 19 (intersection finder) will call `bisect` on a difference function. Lesson
21 (extrema) will call bisection on the numerical derivative. The same function,
composed to solve new problems without rewriting any algorithm.

---

## What Breaks Without This

**Without the sign change check:**
Bisection on `f(x) = x^2 + 1` in `[-5, 5]` would run. Both endpoints are positive,
`f(a) × f(b) > 0` — the check fails. But without the check, the algorithm would
happily run 100 iterations, converging to the midpoint of a steadily-shrinking
interval that contains no root. It returns `x ≈ 0` and claims `f(0) = 1` is "the
root." The value is wrong and the error message is absent. The check makes the
algorithm honest about what it can and cannot find.

**Without recording steps:**
The solver panel can only show the final result. The algorithm is a black box.
Recording steps makes the algorithm transparent — the user can see every interval
the solver tested, which builds trust in the result.

---

## Definition of Done

- [ ] `bisect(f, 0, 5)` for `f(x) = x^2 - 4` → `x ≈ 2`
- [ ] Root is marked on the graph with a circle and x coordinate label
- [ ] No sign change → clear error message
- [ ] Iteration count is reported in the result
- [ ] `npm test` passes all tests in `bisection-solver.test.ts`
- [ ] You can state the intermediate value theorem and explain why it matters for bisection
- [ ] You can trace the first three iterations of bisection for `f(x) = x^2 - 4` on [0, 5]
- [ ] You can explain why bisection is O(log n) and connect it to binary search
- [ ] You can explain default parameter values in TypeScript
- [ ] You can explain `context.arc` parameters
- [ ] Run:
      ```
      git add src/bisection-solver.ts src/bisection-solver.test.ts src/graph-renderer.ts
      git commit -m "Add bisection solver: IVT-based root finding, binary-search halving, steps history recorded, root marked on canvas"
      ```

---

*Next: Lesson 19 — Intersection Finder. The intersection of two functions is found
by reducing it to a root-finding problem. `h(x) = f(x) - g(x)`, find where h=0.
No new algorithm — problem reduction.*
