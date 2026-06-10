# Calculator — Lesson 13 — Discontinuities

## What You Will Build

Graph `f(x) = 1/x`. The curve shows two separate branches with a visible gap at
x=0. `sqrt(-1)` in the calculator shows a domain error. `NaN` and `Infinity` never
appear on the display. A clipping heuristic prevents near-vertical spikes near
asymptotes.

## What You Need to Know First

Lessons 01–12. `evaluateAt` already returns `null` for non-finite values — the gap
in `1/x` at x=0 already exists. This lesson explains why, makes the error handling
explicit in the display, and refines the graphing to handle values near asymptotes.

---

## The Problem

Lesson 12 silently returns `null` for undefined function values. The graph of `1/x`
already has a gap at x=0. But the calculator display still shows `Infinity` when the
user types `1/0 =`. And for x values close to (but not at) 0, `1/x` produces very
large numbers that draw near-vertical spikes toward the canvas edges — correct
mathematically but visually misleading.

Both issues require explicit handling. The display must never show `NaN` or
`Infinity`. The graph must not draw misleading spikes.

---

## Step 1 — Maths: Asymptotes and Undefined Domains

### Continuity

A function is **continuous** at a point `a` if three conditions hold:
1. `f(a)` is defined
2. The limit of `f(x)` as `x → a` exists
3. The limit equals `f(a)`

Informally: the function has a value at the point, and the curve approaches that
value smoothly from both sides.

`f(x) = 1/x` fails condition 1 at `x = 0`: `1/0` is undefined. The function has
no value there.

### Vertical asymptotes

The limit of `1/x` as `x → 0` from the right is `+∞`. From the left: `-∞`. The
two one-sided limits disagree, so the overall limit does not exist. The line `x = 0`
is a **vertical asymptote**: the function approaches the line from both sides but
never touches it. The curve splits into two branches — one for `x > 0` and one for
`x < 0`.

The vertical asymptote is a mathematical fact about the function. The gap in the
graph is not a rendering defect — it is the correct visual representation.

### Domain restrictions

`sqrt(x)` is only defined for `x ≥ 0`. The square root of a negative number is not
a real number (it is imaginary). `log(x)` requires `x > 0`. At `x = 0`, `log(0) = -∞`.
For `x < 0`, the real logarithm is undefined.

These are domain restrictions — regions where the function simply does not exist.
The graph correctly shows only the region where the function is defined. This is not
a gap; it is the correct extent of the curve.

---

## Step 2 — IEEE 754 Special Values in the Display

### CS lens: Infinity and NaN

IEEE 754 defines two special numeric values beyond the normal range:

**`Infinity`:** The result of dividing a positive number by zero (`1/0`), or
exceeding the maximum representable floating point value. In JavaScript:
`1/0 === Infinity`. `typeof Infinity === 'number'` — it is a number type value.

**`NaN`:** "Not a Number." The result of operations that have no meaningful numeric
result: `0/0`, `Math.sqrt(-1)`, `Infinity - Infinity`. Despite the name, `typeof
NaN === 'number'`. The crucial property: `NaN !== NaN` — NaN is not equal to itself.
This is the only value in JavaScript with this property. Test for NaN with
`Number.isNaN(value)`, never with `=== NaN`.

Both values propagate: `NaN + 5 === NaN`. Any arithmetic involving NaN produces NaN.
This is intentional: if one value in a chain of operations is meaningless, the
result should be meaningless too.

**`Number.isNaN` vs `isNaN`:**
The global `isNaN(value)` coerces its argument: `isNaN('hello')` is `true` because
`Number('hello')` is `NaN`. `Number.isNaN(value)` returns `true` only when `value`
is the actual `NaN` value — it does not coerce. Always use `Number.isNaN`.

### Fix the display

Update `applyEquals` in `src/input-reducer.ts` to intercept `Infinity` and `NaN`
after evaluation:

```typescript
function applyEquals(state: CalculatorState): CalculatorState {
  const { result, environment: newEnvironment } =
    parseExpression(state.displayValue, state.environment, state.angleMode)

  if (isCalcError(result)) {
    return {
      ...state,
      displayValue: `Error: ${result.message}`,
      inputState:   InputState.IDLE,
    }
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

  const formattedResult = formatResult(numericResult, state.precision)
  const newEntry: HistoryEntry = {
    expression: state.displayValue,
    result:     formattedResult,
    timestamp:  Date.now(),
  }

  return {
    ...state,
    displayValue:    formattedResult,
    inputState:      InputState.AFTER_EQUALS,
    hasDecimalPoint: formattedResult.includes('.'),
    history:         [...state.history, newEntry],
    environment:     newEnvironment,
  }
}
```

**Walkthrough — `1/0 =`:**
`parseExpression('1/0', ...)` → the parser's division handler detects `rightValue === 0`
and returns `makeError('DIVISION_BY_ZERO', 'Division by zero')`. `isCalcError` is
`true`. Display: `'Error: Division by zero'`. `inputState: IDLE`.

So the `isFinite` check below the error check is actually a second safety net —
it catches any non-finite number that escapes the evaluator's explicit checks.
This defence-in-depth is appropriate: two guards are better than one when the
consequence of slipping through is a confusing display.

---

## Step 3 — Asymptote Clipping in the Graph

### The problem

For x values very close to 0, `1/x` produces large but finite numbers (not Infinity).
For example, `1/0.001 = 1000`. With viewport `yMax = 10`, this maps to `canvasY = ((10 - 1000) / 20) * 500 = -24750` — far above the canvas. The canvas clips
drawing operations outside its bounds, so this point is invisible. But `lineTo` from
a point inside the canvas to a point at y=-24750 draws a line that exits steeply —
a near-vertical spike at the canvas edge.

The spike is technically correct (the function value is 1000, which is off-screen)
but visually misleading. It looks like an asymptote indicator, which it is not.

The fix: treat values far outside the viewport range as gaps.

### The code

Add to `drawFunction` in `src/graph-renderer.ts`, after computing `mathY`:

```typescript
if (mathY === null) {
  isPenDown = false
  continue
}

// Clip values far outside the viewport (10× the visible range)
const yPadding = (viewport.yMax - viewport.yMin) * 10
if (Math.abs(mathY) > viewport.yMax + yPadding) {
  isPenDown = false
  continue
}
```

The clipping factor `10×` is a deliberate SE decision: large enough that legitimate
off-screen values (like the top of a parabola that extends beyond the viewport) draw
correctly, but small enough to clip the near-asymptote spikes. A value 100× the
viewport height is almost certainly an asymptote approach, not a normal function value.

**SE lens — clipping as a correctness decision:**
Drawing to y=-24750 when the viewport shows -10 to 10 is technically accurate but
communicates false information. The spike looks like a vertical asymptote indicator,
but the asymptote is at x=0, not at the canvas edge. Clipping at 10× the viewport
communicates the mathematical truth more clearly: the function has a value there, but
it is far off-screen, and connecting to it would mislead.

This is a case where strict mathematical accuracy and visual correctness diverge.
The code chooses visual correctness with an explicit comment explaining why.

---

## Step 4 — Tests

Create `src/discontinuities.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { evaluateAt }             from './function-evaluator.js'
import { createEnvironment }      from './environment.js'
import { AngleMode }              from './types.js'

describe('discontinuities', () => {
  const env = createEnvironment()

  test('1/x at x=0 returns null', () => {
    const fn = { parameterName: 'x', bodyExpression: '1/x' }
    expect(evaluateAt(fn, 0, env, AngleMode.DEGREES)).toBeNull()
  })

  test('sqrt(x) at x=-1 returns null', () => {
    const fn = { parameterName: 'x', bodyExpression: 'sqrt(x)' }
    expect(evaluateAt(fn, -1, env, AngleMode.DEGREES)).toBeNull()
  })

  test('log(x) at x=0 returns null', () => {
    const fn = { parameterName: 'x', bodyExpression: 'log(x)' }
    expect(evaluateAt(fn, 0, env, AngleMode.DEGREES)).toBeNull()
  })

  test('1/x at x=2 returns 0.5', () => {
    const fn = { parameterName: 'x', bodyExpression: '1/x' }
    expect(evaluateAt(fn, 2, env, AngleMode.DEGREES)).toBe(0.5)
  })

  test('sqrt(x) at x=0 returns 0', () => {
    const fn = { parameterName: 'x', bodyExpression: 'sqrt(x)' }
    expect(evaluateAt(fn, 0, env, AngleMode.DEGREES)).toBe(0)
  })
})
```

Run `npm test`. All tests pass.

The tests verify both the undefined cases (return `null`) and the valid cases
(return the correct number). The fourth test confirms that `1/x` works correctly
away from the asymptote — the null-return is specific to the discontinuity.

---

## Debugging: When Discontinuities Are Handled Wrongly

**Symptom: `1/0 =` shows `Infinity` instead of an error message**

The display guard is missing from `applyEquals`. Check `input-reducer.ts`:
after `evaluate(state.displayValue)` returns a number, check whether it is finite:
```typescript
if (!isFinite(evaluationResult as number)) {
  return { ...state, displayValue: 'Error: result is undefined', inputState: InputState.IDLE }
}
```
If this check is absent or positioned after `formatResult`, `Infinity` reaches
the display unguarded.

**Symptom: graph of `f(x) = 1/x` shows a spike near x=0 instead of a clean gap**

The asymptote clipping heuristic is not applied. Check `drawFunction` in
`graph-renderer.ts` — after the `if (mathY === null)` check, there should be a
second check:
```typescript
const yPadding = (viewport.yMax - viewport.yMin) * 10
if (Math.abs(mathY) > viewport.yMax + yPadding) {
  isPenDown = false
  continue
}
```
If this block is missing, large-but-finite values (like `1/0.001 = 1000`) draw
a line far above the canvas that appears as a spike at the canvas edge.

**Symptom: `evaluateAt` returns a number for `1/x` at x=0 instead of `null`**

The division-by-zero check in the parser is not producing a `CalcError`, or the
`isCalcError` check in `evaluateAt` is not catching it. Run the test:
```typescript
evaluateAt({ parameterName: 'x', bodyExpression: '1/x' }, 0, createEnvironment(), AngleMode.DEGREES)
```
Expected: `null`. If it returns `Infinity`, the `isFinite` guard in `evaluateAt`
should catch it — verify:
```typescript
if (!isFinite(result as number)) return null
```

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

The `null` contract from `evaluateAt` is the universal signal throughout the system:
"this function is undefined here." Every consumer handles it the same way:
- The graphing code lifts the pen.
- The table (lesson 14) shows a dash.
- The integrator (lesson 16) skips the interval.
- The bisection solver (lesson 18) aborts if either bound is undefined.

One return value, one meaning, everywhere. The consistency is not accidental — it
is the result of defining `evaluateAt` as the single evaluation interface and
committing to the `null` contract from the beginning.

---

## What Breaks Without This

**Without the display guard:**
`1/0 =` would show `Infinity` on the display. The user would not know if that means
"division by zero" or "the result exceeded the display range" or "something went
wrong." `Infinity` is a JavaScript implementation detail, not a user-facing message.
The error message states the mathematical fact: "result is undefined."

**Without asymptote clipping:**
`f(x) = 1/x` renders a near-vertical spike at the left and right sides of the canvas
near x=0. The spike is not drawn at x=0 (where the asymptote is) but at the canvas
edge (where the far-off-screen line intersects the visible area). This looks like a
graphing artifact — and it is. Clipping removes it.

---

## Definition of Done

- [ ] Graph of `f(x) = 1/x` shows a visible gap at x=0 with no spike at the canvas edge
- [ ] Graph of `f(x) = sqrt(x)` renders only for `x ≥ 0`
- [ ] `1/0 =` → display shows `Error: result is undefined`
- [ ] `sqrt(-1) =` → display shows `Error: sqrt requires x ≥ 0`
- [ ] `NaN` and `Infinity` never appear in the display
- [ ] `npm test` passes all tests in `discontinuities.test.ts`
- [ ] You can explain what a vertical asymptote is and why the gap is mathematically correct
- [ ] You can explain `Number.isNaN` vs `isNaN` and why the former is preferred
- [ ] You can explain what `typeof NaN` returns and why `NaN !== NaN`
- [ ] You can explain the asymptote clipping heuristic and the SE decision behind it
- [ ] Run:
      ```
      git add src/graph-renderer.ts src/input-reducer.ts src/discontinuities.test.ts
      git commit -m "Handle discontinuities: Infinity/NaN blocked from display, asymptote clipping removes misleading spikes, null contract documented"
      ```

---

*Next: Lesson 14 — Tables. A table of x and f(x) values appears beside the graph.
Undefined values show a dash. Floating point loop drift is corrected by snapping
each step to a rounded value.*
