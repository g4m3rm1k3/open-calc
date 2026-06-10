# Lesson 13 — Discontinuities

## What You Will Build

Graph `f(x) = 1/x`. The curve renders with a visible gap at x=0. Typing `1/0`
into the calculator shows an error, not `Infinity`. `sqrt(-1)` shows a domain
error. `NaN` and `Infinity` are never displayed raw to the user.

## What You Need to Know First

Lessons 01–12. The `evaluateAt` function already returns `null` for non-finite
values — this lesson explains why that matters and makes the error handling visible.

---

## The Lesson

### The problem

Lesson 12 silently handles undefined values by returning `null`. The graph already
has a gap at x=0 for `1/x`. But the calculator display still shows `Infinity` when
`1/0` is typed directly. `NaN` can appear in the display if a computation returns
it. These are not numbers — showing them as if they were confuses users and
misrepresents the mathematics.

---

### Step 1 — Maths — asymptotes and continuity

**Maths — continuity:**
A function is continuous at a point if its limit exists at that point and equals
the function value. Informally: you can draw the function without lifting your pen.

`f(x) = 1/x` is not continuous at x=0 because it is undefined there. The limit
of `1/x` as x approaches 0 from the right is +∞. The limit from the left is -∞.
The two limits disagree — no value can be assigned at x=0.

The vertical line x=0 is a vertical asymptote of `f(x) = 1/x`. The function
approaches the line but never touches it. The graph shows two separate branches:
one for x > 0, one for x < 0. The gap between them is not a drawing error — it
is the correct mathematical representation.

**Maths — undefined domain:**
`sqrt(x)` is only defined for x ≥ 0. For x < 0, the square root of a negative
number is not a real number. The domain restriction `x ≥ 0` means the graph only
exists on the right half of the coordinate plane.

`log(x)` is only defined for x > 0. At x=0, log(0) = -∞. For x < 0, the
logarithm of a negative number is not defined in the real numbers.

These are not bugs. They are mathematical facts. The calculator must represent
them correctly.

---

### Step 2 — IEEE 754 special values

**CS lens — Infinity and NaN:**
IEEE 754 defines two special values:

`Infinity` — the result of dividing a non-zero number by zero, or exceeding the
maximum representable value. In JavaScript: `1/0 === Infinity`, `typeof Infinity === 'number'`.

`NaN` — "Not a Number." The result of operations that produce no meaningful number:
`0/0`, `Math.sqrt(-1)`, `Infinity - Infinity`. In JavaScript: `typeof NaN === 'number'`
(confusingly, NaN is of type number) but `NaN !== NaN` (NaN is not equal to itself — the
only value in JavaScript with this property). Test for NaN with `Number.isNaN(value)`.

These values propagate: `NaN + 5 === NaN`. Any arithmetic involving NaN produces NaN.
This is deliberate: if one number in a chain of operations is meaningless, the result
should be meaningless too.

**SE lens — `isFinite` and `Number.isNaN`:**
The evaluator already filters `!isFinite(result)` and `isNaN(result)` in `evaluateAt`.
This is the correct defensive check. `isFinite` returns `false` for `Infinity`,
`-Infinity`, and `NaN`. `Number.isNaN` returns `true` only for NaN — unlike the
global `isNaN`, which coerces its argument first and can give surprising results.

Use `Number.isNaN`, not `isNaN`.

---

### Step 3 — Fix the calculator display

Update `applyEquals` in `src/input-reducer.ts` to handle Infinity and NaN:

```typescript
function applyEquals(state: CalculatorState): CalculatorState {
  const { result, environment: newEnvironment } =
    parseExpression(state.displayValue, state.environment, state.angleMode)

  if (isCalcError(result)) {
    return { ...state, displayValue: `Error: ${result.message}`, inputState: InputState.IDLE }
  }

  const numericResult = result as number

  if (!isFinite(numericResult)) {
    return {
      ...state,
      displayValue: 'Error: result is undefined',
      inputState:   InputState.IDLE,
    }
  }

  if (Number.isNaN(numericResult)) {
    return {
      ...state,
      displayValue: 'Error: invalid operation',
      inputState:   InputState.IDLE,
    }
  }

  // ... normal result handling ...
}
```

Update the `DIVISION_BY_ZERO` case in the evaluator to return an error, not Infinity:

In `src/expression-parser.ts`, the division handler already returns `makeError('DIVISION_BY_ZERO', ...)`.
Confirm this is the case — the parser should never let `Infinity` reach the display.

---

### Step 4 — The asymptote detection

The gap in `1/x` already works because `evaluateAt` returns `null` for `Infinity`.
But there is a subtle issue: for values of x very close to 0, `1/x` produces a
very large number, not `Infinity`. The graph will draw a nearly-vertical line to
the edge of the canvas. This is technically correct but visually misleading.

Add an out-of-viewport clip to `drawFunction` in `src/graph-renderer.ts`:

```typescript
// After computing mathY, check if it is within a reasonable range:
const yPadding = (viewport.yMax - viewport.yMin) * 10 // allow 10x the viewport range
if (Math.abs(mathY) > Math.abs(yPadding)) {
  isPenDown = false  // value is far outside the viewport — treat as a gap
  continue
}
```

**SE lens — clipping as a visual correctness decision:**
Drawing a line from y=100 to y=0.001 when the viewport only shows y=-10 to y=10
produces a near-vertical spike that looks like an asymptote indicator. But it is
not an asymptote indicator — the function technically has a value there. Clipping
values outside a generous range (10× the viewport) produces cleaner graphs without
misrepresenting the mathematics. This is a deliberate SE decision: choose the
representation that communicates the truth most clearly.

---

### Step 5 — Tests for special values

```typescript
describe('discontinuities', () => {
  test('evaluateAt returns null for 1/x at x=0', () => {
    const fn  = { parameterName: 'x', bodyExpression: '1/x' }
    const env = createEnvironment()
    expect(evaluateAt(fn, 0, env, AngleMode.DEGREES)).toBeNull()
  })

  test('evaluateAt returns null for sqrt(x) at x=-1', () => {
    const fn  = { parameterName: 'x', bodyExpression: 'sqrt(x)' }
    const env = createEnvironment()
    expect(evaluateAt(fn, -1, env, AngleMode.DEGREES)).toBeNull()
  })

  test('evaluateAt returns null for log(x) at x=0', () => {
    const fn  = { parameterName: 'x', bodyExpression: 'log(x)' }
    const env = createEnvironment()
    expect(evaluateAt(fn, 0, env, AngleMode.DEGREES)).toBeNull()
  })

  test('evaluateAt returns a number for 1/x away from 0', () => {
    const fn     = { parameterName: 'x', bodyExpression: '1/x' }
    const env    = createEnvironment()
    const result = evaluateAt(fn, 2, env, AngleMode.DEGREES)
    expect(result).toBe(0.5)
  })
})
```

---

## Connect the Pieces

The `null` contract from `evaluateAt` is the universal signal: "this function is
undefined here." The graphing code, the table (lesson 14), the solver (lesson 18),
and the integration (lesson 16) all respond to `null` the same way: skip this
point, show a dash, or abort with an error. One return value, consistent meaning
everywhere.

---

## What Breaks Without This

Without explicit handling, `1/0` shows `Infinity` on the display. The user wonders
if the calculator is broken. `sqrt(-1)` shows `NaN`. The user has no idea what
that means. The calculator looks unreliable.

More subtly: a solver trying to find the root of `1/x` in an interval that includes
0 would receive `Infinity` as a function value and produce nonsense results. The
`null` contract is not just about display — it protects every algorithm that uses
`evaluateAt` from receiving garbage values.

---

## Definition of Done

- [ ] Graph of `f(x) = 1/x` shows a visible gap at x=0
- [ ] Graph of `f(x) = sqrt(x)` only renders for x ≥ 0
- [ ] Typing `1/0` in the calculator → `Error: result is undefined`
- [ ] Typing `sqrt(-1)` → `Error: domain error — sqrt requires x ≥ 0`
- [ ] `NaN` and `Infinity` never appear in the display
- [ ] `evaluateAt` returns `null` for all three test cases above
- [ ] `npm test` passes all new tests
