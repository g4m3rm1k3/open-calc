# Calculator — Lesson 19 — Intersection Finder

## What You Will Build

The x value where `f(x)` and `g(x)` intersect is found and marked on the graph.
For `f(x) = x^2` and `g(x) = x + 2`, the solver finds `x ≈ 2` (or `x ≈ -1`
depending on the interval). No new algorithm is written.

## What You Need to Know First

Lessons 01–18. Two functions can be graphed (lesson 15). The bisection solver
exists (lesson 18). This lesson applies a CS technique to reuse the solver for a
new problem.

---

## The Problem

Two functions are plotted on the canvas. They visually intersect at one or more
points. The user wants the precise x coordinate of an intersection. Do we write
a new algorithm?

No. We transform the problem into one we have already solved.

---

## Step 1 — Maths: Intersection as Root-Finding

### Problem reduction

`f(x) = g(x)` is equivalent to `f(x) - g(x) = 0`.

The x value where two functions are equal is the same x value where their
**difference is zero**. Defining `h(x) = f(x) - g(x)`, finding where `f` and `g`
intersect is exactly the same problem as finding a root of `h`. We already have
bisection for finding roots.

This technique is called **problem reduction**: transform a new, unsolved problem
into an already-solved problem. The reduction itself requires insight; the solution
requires nothing new.

**The reduction chain:**
```
"Find intersection of f and g" 
  → "Find root of f(x) - g(x)"
  → "Apply bisection"
```

Three steps. No new algorithm. No new data structure.

**SE lens — composition, not duplication:**
The alternative is writing a separate intersection solver that duplicates the
sign-change check, the bisection loop, and the convergence test from lesson 18.
Two implementations of the same algorithm, maintained independently. When one
is improved, the other is not.

Problem reduction avoids the duplication entirely. `findIntersection` is 15 lines.
Every improvement to `bisect` propagates to `findIntersection` automatically.

---

## Step 2 — The Intersection Finder

### The code

Create `src/intersection-finder.ts`:

```typescript
import { bisect, SolverResult }          from './bisection-solver.js'
import { Environment }                   from './environment.js'
import { UserFunction, AngleMode }       from './types.js'
import { CalcError, makeError, isCalcError } from './calc-error.js'

export function findIntersection(
  firstFunction:  UserFunction,
  secondFunction: UserFunction,
  lowerBound:     number,
  upperBound:     number,
  environment:    Environment,
  angleMode:      AngleMode,
): SolverResult | CalcError {
  // h(x) = f(x) - g(x) — root of h is the intersection of f and g
  const differenceFunction: UserFunction = {
    parameterName:  firstFunction.parameterName,
    bodyExpression:
      `(${firstFunction.bodyExpression}) - (${secondFunction.bodyExpression})`,
  }

  const bisectionResult = bisect(
    differenceFunction,
    lowerBound,
    upperBound,
    environment,
    angleMode,
  )

  if (isCalcError(bisectionResult)) {
    return makeError(
      'INVALID_EXPRESSION',
      `No intersection found in [${lowerBound}, ${upperBound}]: ${bisectionResult.message}`,
    )
  }

  return bisectionResult
}
```

**What `src/intersection-finder.ts` is:**
`intersection-finder.ts` contains the problem reduction: it transforms an
intersection question into a root question and delegates to `bisect`. It owns no
algorithm. It is 15 lines including imports.

**Why parentheses around each body expression:**
`bodyExpression: \`(${f.bodyExpression}) - (${g.bodyExpression})\``

If `f(x) = x + 1` and `g(x) = 2*x`, the body without parentheses is
`x + 1 - 2*x`. This evaluates correctly: `x + 1 - 2x = -x + 1`. But if `g(x)` were
`-x`, the body without parentheses would be `x + 1 - -x` which the parser handles
correctly as `x + 1 + x`, but it is confusing. More critically, if `f(x) = x/2`
and we wrote `x/2 - 2*x`, that is `(x/2) - (2*x)` by precedence — correct. But
safer to always wrap, ensuring any body expression is fully enclosed: `(x/2) - (2*x)`.
The parentheses cost nothing and prevent ambiguity for any combination of expressions.

### Walkthrough — finding intersection of `x^2` and `x+2` in [1, 4]

`differenceFunction`:
```
{ parameterName: 'x', bodyExpression: '(x^2) - (x+2)' }
```

This computes `x^2 - x - 2`. At x=1: `1 - 1 - 2 = -2`. At x=4: `16 - 4 - 2 = 10`.
Sign change: `(-2) × 10 < 0` ✓. Bisection proceeds.

Root of `x^2 - x - 2`: factor as `(x-2)(x+1)`. Roots at x=2 and x=-1. In [1, 4],
bisection converges to x=2. ✓

The y coordinate of the intersection is `f(2) = 4` (or `g(2) = 4` — they are equal
at the intersection). The caller computes this by calling `evaluateAt` on either
function at the returned root.

**CS lens — problem reduction in CS:**
Problem reduction is one of the most powerful techniques in computer science. It
appears in algorithm analysis (reducing SAT to 3-SAT), cryptography (reducing
breaking a cipher to solving a hard maths problem), and database theory (reducing
query optimisation to graph colouring). In software engineering, it appears as
"don't rewrite — compose." Every time you call a function rather than reimplementing
its logic, you are applying problem reduction.

Here: the open/closed principle from lesson 09 (open for extension) applies again.
The bisection solver is unchanged. The intersection finder extends its behaviour
by composing with it.

---

## Step 3 — Tests

Create `src/intersection-finder.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { findIntersection }        from './intersection-finder.js'
import { createEnvironment }       from './environment.js'
import { AngleMode }               from './types.js'
import { isCalcError }             from './calc-error.js'

describe('findIntersection', () => {
  const parabolaFn = { parameterName: 'x', bodyExpression: 'x^2' }
  const lineFn     = { parameterName: 'x', bodyExpression: 'x + 2' }
  const env        = createEnvironment()

  test('finds intersection near x=2', () => {
    const result = findIntersection(parabolaFn, lineFn, 1, 4, env, AngleMode.DEGREES)
    expect(isCalcError(result)).toBe(false)
    if (!isCalcError(result)) {
      expect(Math.abs(result.root - 2)).toBeLessThan(1e-8)
    }
  })

  test('finds intersection near x=-1', () => {
    const result = findIntersection(parabolaFn, lineFn, -3, 0, env, AngleMode.DEGREES)
    if (!isCalcError(result)) {
      expect(Math.abs(result.root - (-1))).toBeLessThan(1e-8)
    }
  })

  test('returns error when no intersection in interval', () => {
    const constantFn = { parameterName: 'x', bodyExpression: '100' }
    // x^2 < 100 everywhere in [-1, 1], so no intersection
    const result = findIntersection(parabolaFn, constantFn, -1, 1, env, AngleMode.DEGREES)
    expect(isCalcError(result)).toBe(true)
  })
})
```

Run `npm test`. All tests pass.

---

## Step 4 — Mark the Intersection on the Canvas

Add to `src/graph-renderer.ts`:

```typescript
export function drawIntersectionMarker(
  context:     CanvasRenderingContext2D,
  xIntersect:  number,
  yIntersect:  number,
  viewport:    Viewport,
): void {
  const { canvasX, canvasY } = mathToCanvas(xIntersect, yIntersect, viewport)

  context.strokeStyle = '#ffffff'
  context.lineWidth   = 1.5
  context.beginPath()
  context.arc(canvasX, canvasY, 6, 0, Math.PI * 2)
  context.stroke()

  context.fillStyle = '#ffffff'
  context.font      = '10px monospace'
  context.textAlign = 'left'
  context.fillText(
    `(${xIntersect.toPrecision(4)}, ${yIntersect.toPrecision(4)})`,
    canvasX + 9,
    canvasY - 4,
  )
}
```

The intersection marker uses `stroke` (an open circle) rather than `fill` (a solid
dot) to distinguish it visually from the root marker. The open circle sits on the
intersection point, which is on both curves simultaneously.

---

## Debugging: When Intersection Finding Behaves Wrongly

**Symptom: `findIntersection` returns no sign change even though the curves visually cross**

The difference function `d(x) = f(x) - g(x)` may not change sign across the crossing
if one function is undefined at an endpoint. Add a log:
```typescript
const diff = { parameterName: 'x', bodyExpression: `(${f.bodyExpression}) - (${g.bodyExpression})` }
console.log('d(a):', evaluateAt(diff, a, env, mode))
console.log('d(b):', evaluateAt(diff, b, env, mode))
```
If either returns `null`, choose a bracket that avoids the undefined region.

**Symptom: the intersection marker appears at the right x but the wrong y position**

`yIntersect` was computed as `evaluateAt(f, x, ...)` when it should be
`evaluateAt(g, x, ...)` (or vice versa). Because the functions are equal at the
intersection, both should return the same value — check which function is being
evaluated for the y coordinate of the marker.

**Symptom: the open circle marker overlaps the root marker (both at y=0)**

The intersection search is being run on a root-finding interval where `g(x) = 0`
happens to equal the x-axis. Verify the two functions being intersected are both
non-trivial (not zero on the x-axis throughout the interval).

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`findIntersection` demonstrates that the solver infrastructure is composable. The
same reduction applies in lesson 21 (finding extrema): reduce to bisecting the
numerical derivative. The pattern — new problem → reduce to existing solver — is
consistent through all solver lessons.

`SolverResult` is returned unchanged from `bisect` through `findIntersection` to
the solver panel. The solver panel does not need to know which solver produced the
result — it always receives `SolverResult`. The type system ensures this.

---

## What Breaks Without This

**A standalone intersection solver:**
Would duplicate the sign-change check, iteration loop, and convergence test.
When `DEFAULT_TOLERANCE` is tightened in `bisection-solver.ts`, the standalone
intersection solver still uses the old tolerance — unless someone remembers to
update it. Two implementations of the same logic create two places to maintain,
two places to get wrong.

Problem reduction means there is one place. Always.

---

## Definition of Done

- [ ] Intersection of `f(x) = x^2` and `g(x) = x + 2` near x=2 → `x ≈ 2`
- [ ] Intersection of the same functions near x=-1 → `x ≈ -1`
- [ ] Intersection point is marked on the graph with an open circle and coordinates
- [ ] No intersection in interval → error message
- [ ] `findIntersection` calls `bisect` — it does not reimplement the algorithm
- [ ] `npm test` passes all tests in `intersection-finder.test.ts`
- [ ] You can explain problem reduction and give one example from outside this project
- [ ] You can explain why the body expressions are wrapped in parentheses
- [ ] You can trace the reduction: intersection → root of difference → bisection
- [ ] Run:
      ```
      git add src/intersection-finder.ts src/intersection-finder.test.ts src/graph-renderer.ts
      git commit -m "Add intersection finder: reduces intersection to root-finding via h(x)=f(x)-g(x), calls bisect, no new algorithm"
      ```

---

*Next: Lesson 20 — Newton's Method. The same root found in fewer steps. Quadratic
convergence versus linear. The central difference derivative approximation.*
