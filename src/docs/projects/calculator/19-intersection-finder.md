# Lesson 19 — Intersection Finder

## What You Will Build

The point where `f(x)` and `g(x)` intersect is found and marked on the graph.
The solver reuses `bisect` — no new algorithm is written.

## What You Need to Know First

Lessons 01–18. Two functions can be graphed (lesson 15). The bisection solver
exists (lesson 18). This lesson reduces a new problem to a solved one.

---

## The Lesson

### The problem

We have `f(x) = x^2` and `g(x) = x + 2` plotted together. They intersect at x=2
and x=-1. We can see this visually. But we want the precise x values. We need a
solver. Do we write a new algorithm?

No. We reduce the problem to root-finding.

---

### Step 1 — Maths — intersection as root-finding

**Maths — problem reduction:**
`f(x) = g(x)` is equivalent to `f(x) - g(x) = 0`.

The x value where two functions are equal is the same x value where their
difference is zero. Defining `h(x) = f(x) - g(x)`, finding the intersection is
exactly finding the root of `h`. We have already built a root finder. We use it.

This is problem reduction — one of the most important techniques in computer science
and mathematics. When you encounter a new problem, ask: "Have I seen something like
this before? Can I transform this new problem into a solved problem?"

Here: intersection → root of difference → bisection. Three steps. No new code.

**Why this matters as an SE lesson:**
The alternative is writing a separate `intersect` function that duplicates the
bisection logic. Now there are two root-finding implementations. When you fix a bug
in one, you must fix it in the other. When you improve convergence in one, you must
improve the other. Duplication is the enemy of maintainability.

By reducing the problem instead of re-implementing, `intersect` is three lines.
If `bisect` improves, `intersect` automatically improves too.

---

### Step 2 — The intersection finder

Create `src/intersection-finder.ts`:

```typescript
import { bisect, SolverResult }  from './bisection-solver.js'
import { evaluateAt }            from './function-evaluator.js'
import { Environment }           from './environment.js'
import { UserFunction }          from './types.js'
import { AngleMode }             from './types.js'
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
    bodyExpression: `(${firstFunction.bodyExpression}) - (${secondFunction.bodyExpression})`,
  }

  const result = bisect(differenceFunction, lowerBound, upperBound, environment, angleMode)

  if (isCalcError(result)) {
    return makeError(
      'INVALID_EXPRESSION',
      `No intersection found in [${lowerBound}, ${upperBound}]`,
    )
  }

  return result
}
```

**CS lens — program reduction in code:**
`differenceFunction` is a new `UserFunction` whose body is the string
`"(f_body) - (g_body)"`. When `evaluateAt` is called on it, it evaluates `f - g`
at each x. The parser handles the arithmetic. `bisect` finds where that becomes 0.

The parentheses around each body are important: if `f(x) = x + 1` and `g(x) = 2*x`,
the difference body without parentheses would be `x + 1 - 2*x` = `-x + 1` — correct
by operator precedence in this case, but `x + 1 / 2*x` without parentheses would
be `x + (1/2)*x` — wrong. The parentheses make it safe for any body expression.

**SE lens — composition, not duplication:**
`findIntersection` is 15 lines. It calls `bisect`. If the bisection solver gains
a better termination condition, a step limit, or a different convergence criterion,
`findIntersection` inherits the improvement for free. This is the payoff of the
single responsibility principle applied at the system level: each algorithm lives
in one place, and other algorithms compose with it.

---

### Step 3 — Tests

```typescript
describe('findIntersection', () => {
  const parabolaFn = { parameterName: 'x', bodyExpression: 'x^2' }
  const lineFn     = { parameterName: 'x', bodyExpression: 'x + 2' }
  const env        = createEnvironment()

  test('finds intersection of x^2 and x+2 near x=2', () => {
    const result = findIntersection(parabolaFn, lineFn, 1, 4, env, AngleMode.DEGREES)
    expect(isCalcError(result)).toBe(false)
    if (!isCalcError(result)) {
      expect(Math.abs(result.root - 2)).toBeLessThan(1e-8)
    }
  })

  test('finds intersection of x^2 and x+2 near x=-1', () => {
    const result = findIntersection(parabolaFn, lineFn, -3, 0, env, AngleMode.DEGREES)
    if (!isCalcError(result)) {
      expect(Math.abs(result.root - (-1))).toBeLessThan(1e-8)
    }
  })

  test('returns error when no intersection in interval', () => {
    // x^2 and x+2 do not intersect in [3, 10] (parabola is above the line there)
    // Actually x^2 > x+2 for x>2, so x=3 gives f=9 > g=5. Let's pick a safe non-intersecting interval.
    const constFn = { parameterName: 'x', bodyExpression: '100' }
    const result  = findIntersection(parabolaFn, constFn, -1, 1, env, AngleMode.DEGREES)
    // x^2 < 100 in [-1, 1], so no sign change in h = x^2 - 100
    expect(isCalcError(result)).toBe(true)
  })
})
```

---

### Step 4 — Mark the intersection on the canvas

The intersection is a point `(root, f(root))` — the x coordinate where they meet,
and the y coordinate is the shared value. Add to `src/graph-renderer.ts`:

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

---

## Connect the Pieces

`findIntersection` demonstrates that the solver infrastructure is composable.
Lesson 21 (finding extrema) uses the same pattern: reduce finding a minimum to
finding the root of the derivative. The pattern is consistent: new problems are
solved by reduction to existing solvers, not by new algorithms.

---

## What Breaks Without This

A standalone intersection solver written from scratch would duplicate the sign-change
check, the iteration loop, and the convergence test. All three would need to be
maintained in parallel with the bisection solver. When the bisection tolerance is
tightened (a one-line change), the intersection solver stays at the old tolerance
unless someone remembers to update it. Duplication is technical debt with interest.

---

## Definition of Done

- [ ] Intersection of `f(x) = x^2` and `g(x) = x + 2` near x=2 → approximately `x = 2`
- [ ] Intersection point is marked on the graph with coordinates displayed
- [ ] `findIntersection` calls `bisect` — it does not reimplement the algorithm
- [ ] No intersection in interval → error message
- [ ] `npm test` passes all new tests
