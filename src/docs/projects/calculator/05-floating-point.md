# Lesson 05 — Floating Point

## What You Will Build

The calculator displays `0.30000000000000004` when you type `0.1 + 0.2 =`.
Then a precision setting lets you control how many significant figures are shown,
so the same result displays as `0.3`. A precision selector is visible and
interactive.

This lesson is not about fixing a bug. It is about understanding why the "bug"
exists, why it is not a bug, and how to handle it correctly.

## What You Need to Know First

Lessons 01–04 — the working calculator with arithmetic. This lesson adds display
precision on top of the existing result.

---

## The Lesson

### The problem

Type `0.1 + 0.2 =` into the calculator from lesson 04. The display shows
`0.30000000000000004`.

This surprises people. It looks like a mistake. It is not a mistake. It is the
correct answer — correct according to the rules of how computers store decimal
numbers. Understanding why requires understanding how numbers are stored in memory.

---

### Step 1 — Why 0.1 + 0.2 ≠ 0.3

**Maths — binary fractions:**

Computers store numbers in binary (base 2). Just as `1/3` cannot be represented
exactly as a decimal (it becomes `0.333...` forever), `1/10` cannot be represented
exactly in binary. It becomes an infinitely repeating binary fraction:

```
0.1 (decimal) = 0.0001100110011001100... (binary, repeating forever)
```

The computer stores a finite approximation. When you add two approximations,
the approximation error accumulates. `0.1 + 0.2` does not equal exactly `0.3`
because neither `0.1` nor `0.2` is stored exactly. What is stored is the closest
representable binary value to each.

This is not a JavaScript bug. This is how IEEE 754 floating point works in every
programming language on every computer. Python has it. Java has it. C has it.
The calculator does not have a bug — it is showing you the truth.

**CS lens — IEEE 754:**
JavaScript uses 64-bit floating point numbers, defined by the IEEE 754 standard.
A 64-bit float has:
- 1 sign bit
- 11 exponent bits
- 52 mantissa bits

The 52 mantissa bits give approximately 15–17 significant decimal digits of
precision. `0.1` stored as a 64-bit float is actually:
`0.1000000000000000055511151231257827021181583404541015625`

When you add the stored value of `0.1` to the stored value of `0.2`, the result
is the stored value closest to `0.3`, which is:
`0.30000000000000004440892098500626161694526672363281250`

This is not wrong. This is what floating point arithmetic produces.

---

### Step 2 — Observing it directly

Add to `src/main.ts` temporarily, to see it in the console:

```typescript
console.log(0.1 + 0.2)           // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3)   // false
console.log(0.3)                  // 0.3 (0.3 stored is also approximate, but different)

// The correct way to compare floats:
const EPSILON = 1e-10
const closeEnough = Math.abs((0.1 + 0.2) - 0.3) < EPSILON
console.log(closeEnough)          // true
```

Open the browser console. See the output. This is not theory.

**SE lens — epsilon comparison:**
`0.1 + 0.2 === 0.3` is `false`. This will surprise you the first time and then
you will never forget it. The correct way to compare two floating point numbers
for equality is: are they within an acceptable tolerance (`epsilon`) of each other?

```
|a - b| < epsilon
```

The value of `epsilon` depends on the domain. For a calculator showing 10 decimal
places, `1e-10` (one ten-billionth) is sufficient. For scientific computation,
a smaller epsilon may be needed.

This pattern — epsilon comparison — is one of the most important things a developer
learns. Every language has it, every domain needs it, and it is never taught in
school. Now you know it.

---

### Step 3 — Display precision

The result `0.30000000000000004` is correct but unreadable. A calculator should
show `0.3`. The fix is not to change the arithmetic — the arithmetic is correct.
The fix is to format the display.

Create `src/format-number.ts`:

```typescript
export type PrecisionLevel = 2 | 4 | 6 | 8 | 10

export const DEFAULT_PRECISION: PrecisionLevel = 10

export function formatResult(value: number, precision: PrecisionLevel): string {
  // toPrecision formats to N significant figures, then
  // parseFloat removes trailing zeros: 3.0000 → 3, 0.30 → 0.3
  return String(parseFloat(value.toPrecision(precision)))
}
```

**CS lens — significant figures vs decimal places:**
`toPrecision(10)` means 10 significant figures — digits that carry meaning.
`0.30000000000000004` has 17 significant figures. At 10 significant figures it
becomes `0.3000000000`, and after stripping trailing zeros: `0.3`.

`toFixed(2)` means 2 decimal places — always two digits after the point.
`1234.5` with `toFixed(2)` gives `1234.50`. With `toPrecision(6)` it gives `1234.50`
(6 significant figures). The difference matters for a calculator that handles both
very small numbers (`0.0001`) and very large ones (`123456789`).

Significant figures is the right choice for a general-purpose calculator because
it preserves the meaningful digits regardless of scale.

---

### Step 4 — Tests

Create `src/format-number.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { formatResult }           from './format-number.js'

describe('formatResult', () => {
  test('removes floating point noise: 0.1 + 0.2', () => {
    expect(formatResult(0.1 + 0.2, 10)).toBe('0.3')
  })

  test('preserves significant figures', () => {
    expect(formatResult(1 / 3, 4)).toBe('0.3333')
  })

  test('removes trailing zeros', () => {
    expect(formatResult(2.5, 10)).toBe('2.5')
  })

  test('handles integers', () => {
    expect(formatResult(42, 10)).toBe('42')
  })

  test('handles large numbers', () => {
    expect(formatResult(123456789, 10)).toBe('123456789')
  })

  test('handles very small numbers', () => {
    expect(formatResult(0.0001234, 4)).toBe('0.0001234')
  })
})
```

Run `npm test`. All pass before touching the display.

---

### Step 5 — The precision selector

Add to `index.html` inside `.calculator`, above the display:

```html
<div class="precision-bar">
  <label class="precision-label">Precision</label>
  <select class="precision-select" id="precision-select">
    <option value="2">2 sig. fig.</option>
    <option value="4">4 sig. fig.</option>
    <option value="6">6 sig. fig.</option>
    <option value="8">8 sig. fig.</option>
    <option value="10" selected>10 sig. fig.</option>
  </select>
</div>
```

Add tokens and styles to `style.css`:

```css
:root {
  /* add to existing tokens */
  --color-precision-bg:    #0f172a;
  --color-precision-text:  #94a3b8;
  --font-size-precision:   0.75rem;
}

.precision-bar {
  display:         flex;
  align-items:     center;
  justify-content: flex-end;
  gap:             var(--spacing-sm);
  margin-bottom:   var(--spacing-sm);
}

.precision-label {
  color:     var(--color-precision-text);
  font-size: var(--font-size-precision);
  font-family: var(--font-family-display);
}

.precision-select {
  background-color: var(--color-precision-bg);
  color:            var(--color-precision-text);
  border:           1px solid var(--color-border);
  border-radius:    var(--radius-display);
  padding:          0.2rem var(--spacing-sm);
  font-size:        var(--font-size-precision);
  font-family:      var(--font-family-display);
}
```

---

### Step 6 — Wire precision to the display

Update `src/calculator-state.ts` to include precision:

```typescript
import { InputState }    from './input-state.js'
import { PrecisionLevel, DEFAULT_PRECISION } from './format-number.js'

export interface CalculatorState {
  displayValue:    string
  inputState:      InputState
  hasDecimalPoint: boolean
  precision:       PrecisionLevel
}

export function createInitialState(): CalculatorState {
  return {
    displayValue:    '0',
    inputState:      InputState.IDLE,
    hasDecimalPoint: false,
    precision:       DEFAULT_PRECISION,
  }
}
```

Update `applyEquals` in `src/input-reducer.ts` to format the result:

```typescript
import { formatResult } from './format-number.js'

function applyEquals(state: CalculatorState): CalculatorState {
  const result = evaluate(state.displayValue)

  if (isCalcError(result)) {
    return {
      ...state,
      displayValue: `Error: ${result.message}`,
      inputState:   InputState.IDLE,
    }
  }

  return {
    ...state,
    displayValue:    formatResult(result, state.precision),
    inputState:      InputState.AFTER_EQUALS,
    hasDecimalPoint: formatResult(result, state.precision).includes('.'),
  }
}
```

Update `src/main.ts` to handle precision changes:

```typescript
const precisionSelect = document.querySelector<HTMLSelectElement>('#precision-select')
precisionSelect?.addEventListener('change', () => {
  const selectedPrecision = parseInt(precisionSelect.value, 10) as PrecisionLevel
  calculatorState = { ...calculatorState, precision: selectedPrecision }
  // Re-format and display if the last input was AFTER_EQUALS
  if (calculatorState.inputState === InputState.AFTER_EQUALS) {
    const numericValue = parseFloat(calculatorState.displayValue)
    if (!isNaN(numericValue)) {
      calculatorState = {
        ...calculatorState,
        displayValue: formatResult(numericValue, selectedPrecision),
      }
    }
  }
  updateDisplay()
})
```

Open the browser. Type `0.1 + 0.2 =`. See `0.30000000000000004`. Change precision
to `10 sig. fig.`. See `0.3`. Change to `4 sig. fig.`. See `0.3`. Change to
`2 sig. fig.`. See `0.3`.

Now try `1 / 3 =`. At 10 sig. fig.: `0.3333333333`. At 4: `0.3333`. At 2: `0.33`.

---

## Connect the Pieces

`formatResult` will be used by every lesson that displays a computed number:
the graphing table (lesson 14), the numerical integration result (lesson 16),
and the solver results (lesson 22). The precision setting in `CalculatorState`
travels with the application state and is always available.

The epsilon comparison pattern introduced here reappears in the solvers. The
bisection solver (lesson 18) terminates when `|f(x)| < tolerance`. Newton's
method (lesson 20) terminates when `|x_new - x_old| < tolerance`. Tolerance
is epsilon, renamed for its context.

---

## What Breaks Without This

Without precision formatting, every result with a floating point tail is shown
raw. `1 / 3` displays as `0.3333333333333333`. `sin(30)` (in a future lesson)
displays as `0.49999999999999994`. Users distrust the calculator. They assume
it is broken. They are wrong, but the display is not helping them be right.

More importantly: without understanding why `0.1 + 0.2 ≠ 0.3`, a developer will
write `if (result === 0.3)` and spend an afternoon wondering why it never fires.
This lesson is the vaccine.

---

## Definition of Done

- [ ] `0.1 + 0.2 =` displays `0.30000000000000004` before precision is applied
- [ ] With precision at 10 sig. fig., `0.1 + 0.2 =` displays `0.3`
- [ ] `0.1 + 0.2 == 0.3` (typed as an expression) evaluates to `false` (lesson 07 will add this)
- [ ] A precision selector with options 2, 4, 6, 8, 10 is visible and interactive
- [ ] Changing precision immediately re-formats the current display value
- [ ] `1/3 =` at 4 sig. fig. shows `0.3333`
- [ ] `npm test` passes all tests in `format-number.test.ts`
