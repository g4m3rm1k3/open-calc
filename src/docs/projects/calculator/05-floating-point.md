# Calculator — Lesson 05 — Floating Point

## What You Will Build

Type `0.1 + 0.2 =` into the calculator. The display shows `0.30000000000000004`.
Then a precision selector lets you control how many significant figures are shown,
so the same result displays as `0.3`. Changing precision to 4 significant figures
makes `1/3 =` show `0.3333`. The precision setting lives in the calculator state
and affects every result immediately.

This lesson is not about fixing a bug. `0.30000000000000004` is the correct answer.
The lesson explains why it is correct, why it surprises everyone who encounters it
for the first time, and how to format it for human consumption without hiding the
truth.

## What You Need to Know First

Lessons 01–04. The working calculator evaluates arithmetic from lesson 04.
This lesson adds result formatting on top of the existing evaluation. The evaluator
does not change. `applyEquals` in `input-reducer.ts` gains a formatting step.

---

## The Problem

Type `0.1 + 0.2 =` into the lesson 04 calculator. The display shows
`0.30000000000000004`. This surprises every programmer the first time. It looks
like a broken calculation. It is not.

Understanding why requires understanding how computers store decimal numbers —
a decision made in 1985 and locked into every processor built since.

---

## Step 1 — Why 0.1 + 0.2 ≠ 0.3

### Maths — binary fractions

Computers store numbers in **binary** — base 2, using only the digits 0 and 1.
A decimal number like 0.5 converts exactly to binary: `0.1` in base 2 represents
one half. But `0.1` in decimal — one tenth — **cannot** be represented exactly in
binary. It becomes an infinitely repeating binary fraction:

```
0.1 (decimal) = 0.0001100110011001100110011... (binary, repeating forever)
```

The same way that one third, `1/3 = 0.3333...`, repeats infinitely in decimal,
one tenth, `1/10 = 0.0001100...`, repeats infinitely in binary. A computer can only
store a finite number of digits, so it stores the closest value that fits.

When you add two approximations, the approximation errors accumulate. `0.1 + 0.2`
does not equal exactly `0.3` because neither `0.1` nor `0.2` was stored exactly.
The computer adds the two closest representable values and reports their sum.

This is not a JavaScript bug. It is not a bug at all. It is how **IEEE 754**
floating-point arithmetic works in every programming language on every computer built
in the last 50 years. Python has this behaviour. Java has it. C has it. Excel has it.
The calculator does not have a bug — it is showing you the truth that most software
hides.

### IEEE 754: the standard that defines floating-point numbers

**CS lens — IEEE 754:**
JavaScript uses 64-bit floating-point numbers defined by the **IEEE 754-2008**
standard (the same standard used by C `double`, Java `double`, Python `float`, and
almost every other language). A 64-bit float has three parts:

```
| 1 sign bit | 11 exponent bits | 52 mantissa bits |
```

The **sign bit** records positive or negative. The **exponent bits** store a power
of 2. The **mantissa bits** store the significant digits. Together they give
approximately 15–17 significant decimal digits of precision. The total range is
roughly ±1.8 × 10³⁰⁸.

The stored value of `0.1` in IEEE 754 is exactly:

```
0.1000000000000000055511151231257827021181583404541015625
```

The stored value of `0.2` is exactly:

```
0.200000000000000011102230246251565404236316680908203125
```

Their sum is:

```
0.3000000000000000444089209850062616169452667236328125
```

JavaScript rounds this to the nearest 64-bit float, which happens to be:

```
0.30000000000000004
```

This is not wrong. It is the exact answer that IEEE 754 arithmetic produces. The
difference from `0.3` appears at the 17th significant figure — well past what any
human calculation or physical measurement can distinguish.

### Observing it directly

Add this temporarily to `src/main.ts` to confirm in the browser console:

```typescript
console.log(0.1 + 0.2)          // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3)  // false
console.log(0.3)                 // 0.3 (a different approximation, looks clean)
```

Open the browser console (`F12` → Console tab). These are not theory — these are
actual values running in your browser right now. Then remove the `console.log`
lines before proceeding.

### The epsilon comparison pattern — first appearance

`0.1 + 0.2 === 0.3` is `false`. This will surprise you the first time and you will
never forget it. The correct way to compare two floating-point numbers for equality
is: are they within an acceptable tolerance?

```
|a - b| < epsilon
```

In code:

```typescript
const EPSILON = 1e-10
const areEqual = Math.abs((0.1 + 0.2) - 0.3) < EPSILON
console.log(areEqual)  // true
```

**`1e-10` — scientific notation — first appearance:**
`1e-10` is scientific notation: `1 × 10⁻¹⁰` = `0.0000000001` (one ten-billionth).
The `e` means "times ten to the power of." `1e-10` is so small it is dwarfed by any
real calculation difference, but large enough to absorb the floating-point noise at
the 17th significant figure. The choice of epsilon depends on the domain:
- `1e-10` is appropriate for a 10-significant-figure calculator
- Orbital mechanics requires `1e-15` or smaller
- Currency rounding uses `0.005`

**`Math.abs(value)` — first appearance:**
`Math.abs(value)` returns the **absolute value** of a number — its distance from
zero, always non-negative. `Math.abs(-3)` = `3`. `Math.abs(3)` = `3`. It is used
here to measure the *magnitude* of the difference between two floats — we do not
care whether one is larger than the other, only how far apart they are.

The epsilon comparison pattern reappears as **tolerance** in the numerical solvers:
the bisection solver (lesson 18) terminates when `|f(midpoint)| < tolerance`. Newton's
method (lesson 20) terminates when `|x_new - x_old| < tolerance`. "Is this value
close enough to zero?" is the same question as "are these two values close enough to
equal?" — the same pattern, a different name in each context.

**SE lens — do not fix the arithmetic, fix the display:**
The temptation when first encountering `0.30000000000000004` is to "fix" the
arithmetic: add a rounding step inside `evaluate`. This is wrong. The arithmetic is
correct. Changing it would introduce *new* errors — values that appear to be `0.3`
but carry hidden accumulated error.

The correct fix is to format the display: show the result to a meaningful number of
significant figures. The underlying computation remains exact (in the IEEE 754 sense).
The display rounds for human readability. These are separate concerns and must stay
separate.

---

## Step 2 — The Formatting Module

### The problem

`0.30000000000000004` is correct but unreadable. `1/3 = 0.3333333333333333` is
correct but shows 16 digits when a user typically needs 4–10. A formatter takes
a number and a precision level and returns a clean string.

### The code

Create `src/format-number.ts`:

```typescript
export type PrecisionLevel = 2 | 4 | 6 | 8 | 10

export const DEFAULT_PRECISION: PrecisionLevel = 10

export function formatResult(value: number, precision: PrecisionLevel): string {
  return String(parseFloat(value.toPrecision(precision)))
}
```

**What `src/format-number.ts` is:**
`format-number.ts` owns the display-formatting logic. It has one job: take a number
and a precision level, return a human-readable string. It has no knowledge that a
calculator exists, no DOM access, no state access. The formatter is used by
`input-reducer.ts`, the variable panel in `main.ts`, and all subsequent lessons
that show numeric results. One module, one responsibility.

**`PrecisionLevel` — literal union type:**
`type PrecisionLevel = 2 | 4 | 6 | 8 | 10` is a **union of literal number types**
(the `|` means "or"). Only these five specific numbers are valid precision levels.
TypeScript rejects `precision: 3` at compile time — a typo like `7` produces an
error before the code runs. This is the same pattern as `ButtonType` and
`CalcErrorCode` — a closed set of valid values, enforced by the type system.

**`number.toPrecision(n)` — first appearance:**
`value.toPrecision(n)` is a built-in JavaScript method on every number. It returns
a **string** representation with `n` significant figures:

```
(0.30000000000000004).toPrecision(10)  → '0.3000000000'
(0.3333333333333333).toPrecision(4)    → '0.3333'
(123456789).toPrecision(10)            → '123456789.0'
```

**Significant figures vs decimal places:**
`toPrecision(n)` gives `n` **significant figures** — the digits that carry meaning,
counted from the first non-zero digit. `toFixed(n)` gives `n` **decimal places**
regardless of magnitude. For a general-purpose calculator, significant figures is
correct:

```
(0.0001234).toPrecision(4) = '0.0001234'   ← preserves the meaningful digits
(0.0001234).toFixed(4)     = '0.0001'      ← loses almost everything

(1234567).toPrecision(6)   = '1234570'     ← clips to 6 meaningful digits
(1234567).toFixed(6)       = '1234567.000000'  ← right for money, wrong for maths
```

Significant figures preserves meaning at any scale; decimal places is appropriate
only when scale is fixed (currency, for example).

**`parseFloat(string)` — first appearance:**
`parseFloat(string)` converts a string to a floating-point number and removes
trailing zeros automatically:

```
parseFloat('0.3000000000')  → 0.3
parseFloat('0.3333')        → 0.3333
parseFloat('123456789.0')   → 123456789
```

The two-step `String(parseFloat(value.toPrecision(precision)))` works in sequence:

1. `value.toPrecision(precision)` → `'0.3000000000'` (string, trailing zeros)
2. `parseFloat('0.3000000000')` → `0.3` (number, trailing zeros stripped)
3. `String(0.3)` → `'0.3'` (string, clean)

Without the `parseFloat` step, `formatResult(2.5, 10)` would return `'2.500000000'`
instead of `'2.5'`.

### Walkthrough — `formatResult(0.30000000000000004, 10)`

`value = 0.30000000000000004`, `precision = 10`.

`value.toPrecision(10)`:
`0.30000000000000004` has 17 significant figures. At 10, it becomes `'0.3000000000'`.
The floating-point noise lives at the 17th significant figure — `toPrecision(10)`
stops before reaching it.

`parseFloat('0.3000000000')` = `0.3`. JavaScript removes the nine trailing zeros.

`String(0.3)` = `'0.3'`. Display shows `0.3`. ✓

### Walkthrough — `formatResult(1/3, 4)`

`value = 0.3333333333333333` (JavaScript's best approximation of 1/3).

`value.toPrecision(4)` = `'0.3333'`.
`parseFloat('0.3333')` = `0.3333`.
`String(0.3333)` = `'0.3333'`. ✓

---

## Step 3 — Tests

### Why tests before wiring to the UI

`formatResult` is a pure function — it takes numbers in, returns strings out, with
no side effects. This means it can be tested completely without a browser, without
a DOM, without any setup. Writing tests now means that before touching `main.ts` or
`input-reducer.ts`, you know with certainty that the formatter works.

Recap from lesson 04: `npm test` runs Vitest, which finds files matching
`*.test.ts`, executes them, and reports which passed (`✓`) and which failed (`✗`).
Each test calls `expect(value).toBe(expected)` — if the values differ, Vitest shows
the actual and expected values with the test file name and line number.

Create `src/format-number.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { formatResult }           from './format-number.js'
```

**Import explanation:**
`vitest` is the test runner package installed in lesson 02. We import `describe`,
`test`, and `expect` — the three functions needed to define and assert in every test
(first explained in lesson 04, used without re-explanation from here on).

`import { formatResult } from './format-number.js'` — `format-number.ts` is the
module responsible for display formatting (this lesson). We import `formatResult` —
the single exported function — because that is the function being tested. Nothing
else from this module is needed in the test file.

```typescript
describe('formatResult', () => {
  test('removes floating point noise: 0.1 + 0.2', () => {
    expect(formatResult(0.1 + 0.2, 10)).toBe('0.3')
  })

  test('removes trailing zeros', () => {
    expect(formatResult(2.5, 10)).toBe('2.5')
  })

  test('preserves significant figures: 1/3 at 4 sig. fig.', () => {
    expect(formatResult(1 / 3, 4)).toBe('0.3333')
  })

  test('handles integers cleanly', () => {
    expect(formatResult(42, 10)).toBe('42')
  })

  test('handles large numbers', () => {
    expect(formatResult(123456789, 10)).toBe('123456789')
  })

  test('handles very small numbers', () => {
    expect(formatResult(0.0001234, 4)).toBe('0.0001234')
  })

  test('2 sig. fig. rounds correctly', () => {
    expect(formatResult(1 / 3, 2)).toBe('0.33')
  })
})
```

**Reading the first test:**
`formatResult(0.1 + 0.2, 10)` passes `0.30000000000000004` (the actual JS result
of `0.1 + 0.2`) and precision `10`. The test asserts the return value is `'0.3'`.
This directly verifies the central claim of this lesson: the formatter eliminates
floating-point noise at 10 significant figures.

Run `npm test`. All seven tests pass before touching any other file.

**Reading a test failure:**
If `formatResult(0.1 + 0.2, 10)` returns `'0.30000000000000004'` instead of `'0.3'`,
the failure message reads:

```
AssertionError: expected '0.30000000000000004' to be '0.3'
  at format-number.test.ts:4:3
```

Line 4 is `expect(formatResult(0.1 + 0.2, 10)).toBe('0.3')`. The function is not
applying `toPrecision` — check `format-number.ts` and verify that `toPrecision` is
called with the `precision` parameter, not with a hardcoded value.

---

## Step 4 — Precision in Calculator State

### The problem

The precision setting must survive between calculations. If the user selects 4
significant figures, every subsequent result should use 4. Precision belongs in
the application state — the single source of truth established in lesson 03.

### The code

Update `src/calculator-state.ts`:

```typescript
import { InputState }                        from './input-state.js'
import { PrecisionLevel, DEFAULT_PRECISION } from './format-number.js'
import { HistoryEntry }                      from './types.js'
```

**Import explanation:**
`import { InputState } from './input-state.js'` — `input-state.ts` is the module
that defines the four valid input states (lesson 03). This import existed before;
it is unchanged.

`import { PrecisionLevel, DEFAULT_PRECISION } from './format-number.js'` —
`format-number.ts` is the module responsible for display formatting (this lesson).
We import `PrecisionLevel` (the type) because `CalculatorState.precision` must be
typed as one of the five valid precision values. We import `DEFAULT_PRECISION` (the
constant `10`) because `createInitialState` uses it as the starting value. Both the
type and the default originate from the same module that owns the formatting concept.

`import { HistoryEntry } from './types.js'` — this import will be used in lesson 06
when `history` is added to the state. Include it now so the state shape is stable.
`types.ts` is the central type registry (lesson 02).

```typescript
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

### Walkthrough — what changes in state

Before this lesson, `CalculatorState` had three fields. After this step:

```
{
  displayValue:    '0',      // unchanged
  inputState:      'IDLE',   // unchanged
  hasDecimalPoint: false,    // unchanged
  precision:       10,       // new: how many significant figures to show
}
```

The `precision` field is a `PrecisionLevel` — one of `2 | 4 | 6 | 8 | 10`. Any
code that reads `calculatorState.precision` gets a number the compiler has verified
is in that set.

---

## Step 5 — Format the Result on Equals

### The problem

`applyEquals` in `input-reducer.ts` currently returns the raw number from
`evaluate`. This is where precision formatting must be applied — after evaluation,
before storing the display value.

### The code

Update `src/input-reducer.ts`:

```typescript
import { evaluate }      from './evaluator.js'
import { isCalcError }   from './calc-error.js'
import { formatResult }  from './format-number.js'
import { InputState }    from './input-state.js'
import { CalculatorState } from './calculator-state.js'
import type { ButtonConfig } from './buttons.js'
```

**Import explanation:**
`import { formatResult } from './format-number.js'` — `format-number.ts` is the
module responsible for display formatting (this lesson). We import `formatResult`
— the function that takes a `number` and a `PrecisionLevel` and returns a formatted
`string` — because `applyEquals` needs to format the result before storing it in
`displayValue`. The other imports existed before; they are unchanged.

Update the `applyEquals` function:

```typescript
function applyEquals(state: CalculatorState): CalculatorState {
  const evaluationResult = evaluate(state.displayValue)

  if (isCalcError(evaluationResult)) {
    return {
      ...state,
      displayValue:    `Error: ${evaluationResult.message}`,
      inputState:      InputState.IDLE,
      hasDecimalPoint: false,
    }
  }

  const formattedResult = formatResult(evaluationResult, state.precision)

  return {
    ...state,
    displayValue:    formattedResult,
    inputState:      InputState.AFTER_EQUALS,
    hasDecimalPoint: formattedResult.includes('.'),
  }
}
```

**`string.includes(substring)` — first appearance:**
`formattedResult.includes('.')` returns `true` if the string contains a decimal
point anywhere in it. `'0.3'.includes('.')` = `true`. `'42'.includes('.')` = `false`.
It is used here to set `hasDecimalPoint` correctly so that the input state machine
knows whether the displayed result already has a decimal point — important if the
user immediately presses `.` after `=`.

### Walkthrough — `0.1 + 0.2 =` end-to-end

State before `=`:
`{ displayValue: '0.1+0.2', inputState: 'AFTER_OPERATOR', precision: 10, ... }`

`evaluate('0.1+0.2')` returns `0.30000000000000004` (a number — not an error).

`formatResult(0.30000000000000004, 10)`:
→ `(0.30000000000000004).toPrecision(10)` = `'0.3000000000'`
→ `parseFloat('0.3000000000')` = `0.3`
→ `String(0.3)` = `'0.3'`

`formattedResult` = `'0.3'`.
`'0.3'.includes('.')` = `true`.

Returned state: `{ displayValue: '0.3', inputState: 'AFTER_EQUALS', hasDecimalPoint: true, ... }`

Display shows `0.3`. ✓

---

## Step 6 — The Precision Selector

### The problem

The HTML shell from lesson 01 already includes a `<select>` dropdown for precision,
but it has been inert — it exists visually but nothing responds to it. This step
connects the dropdown to the calculator state.

The HTML in `index.html` already contains:

```html
<div class="precision-bar">
  <label class="precision-label" for="precision-select">Precision</label>
  <select class="precision-select" id="precision-select">
    <option value="2">2 sig. fig.</option>
    <option value="4">4 sig. fig.</option>
    <option value="6">6 sig. fig.</option>
    <option value="8">8 sig. fig.</option>
    <option value="10" selected>10 sig. fig.</option>
  </select>
</div>
```

The `selected` attribute on the `10` option matches `DEFAULT_PRECISION`. The HTML
and the state default agree.

Add to `src/main.ts`:

```typescript
import { formatResult, PrecisionLevel } from './format-number.js'
import { InputState }                   from './input-state.js'
```

**Import explanation:**
`import { formatResult, PrecisionLevel } from './format-number.js'` — `format-number.ts`
is the module responsible for display formatting (this lesson). We import two things:
`formatResult` is the function used to re-format the current display when precision
changes, and `PrecisionLevel` is the type needed to type-assert the parsed dropdown
value. Both belong to the same module because both are aspects of the formatting concept.

`import { InputState } from './input-state.js'` — `input-state.ts` defines the four
valid input states (lesson 03). We import `InputState` here to check whether the
current state is `AFTER_EQUALS` — the condition under which re-formatting makes sense.

```typescript
const precisionSelectElement =
  document.querySelector<HTMLSelectElement>('#precision-select')

precisionSelectElement?.addEventListener('change', () => {
  if (precisionSelectElement === null) return

  const selectedPrecision =
    parseInt(precisionSelectElement.value, 10) as PrecisionLevel

  calculatorState = { ...calculatorState, precision: selectedPrecision }

  if (calculatorState.inputState === InputState.AFTER_EQUALS) {
    const currentNumericValue = parseFloat(calculatorState.displayValue)
    if (!isNaN(currentNumericValue)) {
      calculatorState = {
        ...calculatorState,
        displayValue: formatResult(currentNumericValue, selectedPrecision),
      }
    }
  }

  updateDisplay()
})
```

**`document.querySelector<HTMLSelectElement>('#precision-select')` — type parameter
review (from lesson 01):**
The type parameter `<HTMLSelectElement>` tells TypeScript that the element you
expect is a `<select>`. Without it, the return type is `Element | null`, which lacks
the `.value` property. With it, the return type is `HTMLSelectElement | null`, and
`.value` is available after the null check. The selector `#precision-select` matches
only the `<select id="precision-select">` element, so the assertion is safe.

**`parseInt(string, radix)` — first appearance:**
`parseInt(string, radix)` converts a string to an integer. `radix` is the numeric
base to use for parsing. The `<option value="2">` elements have string values
`'2'`, `'4'`, `'6'`, `'8'`, and `'10'`. `parseInt('4', 10)` gives the number `4`.

Always specify the radix. Without it, older JavaScript engines interpret strings
starting with `0` as octal (base 8), turning `parseInt('010')` into `8` — a real
historical bug that caused hard-to-find errors in production code for years. The
radix `10` means "interpret this string as a decimal number."

**`as PrecisionLevel` — type assertion:**
`parseInt(...)` returns `number`. TypeScript cannot verify from the type alone that
the result is one of `2 | 4 | 6 | 8 | 10`. The `as PrecisionLevel` is a **type
assertion** — you are telling the compiler: "I have verified this value is a
`PrecisionLevel`; treat it as such." This shifts verification responsibility to you.
Here it is safe because the `<option>` values are hardcoded in the HTML as the
five valid values. At runtime, no other value can come from this dropdown.

Type assertions are a promise to the compiler. Use them only when you have verified
the assertion holds. An assertion on an unchecked value turns a type error into a
silent bug.

**Optional chaining `?.` — first appearance:**
`precisionSelectElement?.addEventListener(...)` uses **optional chaining**. If
`precisionSelectElement` is `null`, the `?.` short-circuits: the expression evaluates
to `undefined` and the `addEventListener` call is skipped entirely. No error, no crash.
It is equivalent to:
```typescript
if (precisionSelectElement !== null) {
  precisionSelectElement.addEventListener(...)
}
```
Optional chaining is the correct tool when you want to call a method only if the
value is non-null, and doing nothing is the right behaviour when it is null.

**Re-formatting the current display:**
When the user changes precision while the display shows a result (after pressing `=`),
the displayed number should immediately update to the new precision. `parseFloat`
converts the display string back to a number; `formatResult` re-formats it at the
new precision. If the display shows an error message or an in-progress expression
(not in `AFTER_EQUALS` state), no re-formatting is done.

### Walkthrough — changing precision from 10 to 4 while displaying `0.3333333333`

`calculatorState.displayValue` is `'0.3333333333'` (result of `1/3` at 10 sig. fig.).
`calculatorState.inputState` is `'AFTER_EQUALS'`.

User changes dropdown to `4 sig. fig.`.

`selectedPrecision = parseInt('4', 10) = 4`.
`calculatorState = { ...calculatorState, precision: 4 }`.
`inputState` is `'AFTER_EQUALS'` → re-format.
`parseFloat('0.3333333333')` = `0.3333333333` (number).
`isNaN(0.3333333333)` = `false` → proceed.
`formatResult(0.3333333333, 4)`:
→ `(0.3333333333).toPrecision(4)` = `'0.3333'`
→ `parseFloat('0.3333')` = `0.3333`
→ `String(0.3333)` = `'0.3333'`
`calculatorState.displayValue` = `'0.3333'`. `updateDisplay()` → display shows `0.3333`. ✓

---

## Debugging: When Formatting Produces Wrong Output

The formatter introduces a new category of display bug. Here is how to locate it.

**Symptom: display shows trailing zeros (e.g., `'2.5000000000'` instead of `'2.5'`)**

`parseFloat` is not being called, or is being called on the wrong value. Verify the
three-step sequence in `formatResult`:
1. `value.toPrecision(precision)` — check that `precision` is the right value
2. `parseFloat(...)` — check this is wrapping step 1's output
3. `String(...)` — check this is wrapping step 2's output

Add a temporary log to `formatResult` to see each step:
```typescript
export function formatResult(value: number, precision: PrecisionLevel): string {
  const step1 = value.toPrecision(precision)
  const step2 = parseFloat(step1)
  const step3 = String(step2)
  console.log({ step1, step2, step3 })
  return step3
}
```

**Symptom: display still shows `0.30000000000000004` after adding formatting**

`applyEquals` is calling `evaluate` but not calling `formatResult`. Check that the
`formatResult` call is inside `applyEquals` after the `isCalcError` check. The
typical mistake: `formatResult` was added outside the function or after the return.

**Symptom: precision change does not update the current display**

The `inputState` check is wrong. Add a temporary log:
```typescript
console.log('inputState:', calculatorState.inputState)
console.log('AFTER_EQUALS:', InputState.AFTER_EQUALS)
```
If the state is not `'AFTER_EQUALS'`, the re-format branch never runs. Check that
`applyEquals` sets `inputState: InputState.AFTER_EQUALS` on a successful result.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`formatResult` is called every time a result is displayed. In lesson 06 (history),
each history entry's `result` field is produced by `formatResult`. In lesson 08
(variables), the variable panel formats stored values using `formatResult`. In
lesson 14 (tables), every cell uses `formatResult`. In lessons 18–22 (solvers),
every root, area, and extremum passes through `formatResult`.

The `precision` field in `CalculatorState` follows state everywhere: `applyEquals`
reads it to format results, `renderVariables` reads it to format panel entries,
and the precision selector writes it. The single source of truth principle from
lesson 03 means there is exactly one place to look when precision behaves wrongly.

The epsilon comparison pattern introduced here (`Math.abs(a - b) < epsilon`) reappears
as **tolerance** throughout the numerical methods. Every algorithm that converges
to an answer (bisection in lesson 18, Newton's method in lesson 20, extrema finder
in lesson 21) uses this same question: "Is this value close enough to zero?"

---

## What Breaks Without This

**Without precision formatting:**
Every result with a floating-point representation shows raw IEEE 754 output.
`0.1 + 0.2` shows `0.30000000000000004`. `sin(30)` (lesson 09) shows
`0.49999999999999994`. Users stop trusting the calculator. They assume it is broken.
The calculator is not broken — the display is.

**Without understanding epsilon comparison:**
A developer writes `if (result === 0.3)` to check whether `0.1 + 0.2` equals the
target value. The condition is always `false`. The developer spends hours searching
for a value that was never incorrect in the first place. This exact bug has appeared
in production systems in every language that uses IEEE 754 floating point — including
financial software, physical simulations, and game engines. Understanding the cause
means you will never write it.

**Without `parseFloat` in `formatResult`:**
`formatResult(2.5, 10)` returns `'2.5000000000'` instead of `'2.5'`. The display
shows unnecessary precision. More critically, the history panel (lesson 06) stores
`'2.5000000000'` as the result string. The variable panel (lesson 08) shows
`'2.5000000000'`. Every display of a clean number shows trailing zeros.
The `parseFloat` strip is the difference between a readable result and a noisy one.

---

## Definition of Done

- [ ] `0.1 + 0.2 =` shows `0.3` (not `0.30000000000000004`)
- [ ] `1 / 3 =` at 10 sig. fig. shows `0.3333333333`
- [ ] `1 / 3 =` at 4 sig. fig. shows `0.3333`
- [ ] `1 / 3 =` at 2 sig. fig. shows `0.33`
- [ ] `2 =` shows `2` (no trailing zeros)
- [ ] Changing the precision dropdown while a result is displayed immediately
      re-formats the displayed number
- [ ] `npm test` passes all seven tests in `format-number.test.ts`
- [ ] You can explain why `0.1 + 0.2 ≠ 0.3` in terms of binary fractions and
      finite storage
- [ ] You can explain the IEEE 754 standard and what "64-bit float" means
- [ ] You can explain the difference between `toPrecision` (significant figures)
      and `toFixed` (decimal places) and why significant figures is correct here
- [ ] You can explain the three-step sequence in `formatResult` and what each step does
- [ ] You can explain what `1e-10` means (scientific notation)
- [ ] You can explain what `Math.abs` does and why it is used in the epsilon comparison
- [ ] You can explain what `parseInt(string, 10)` does and why the `10` is required
- [ ] You can explain what `as PrecisionLevel` is and why it is a promise, not a check
- [ ] You can explain what optional chaining (`?.`) does
- [ ] You can explain what `string.includes(substring)` returns
- [ ] Run:
      ```
      git add src/format-number.ts src/format-number.test.ts src/calculator-state.ts src/input-reducer.ts src/main.ts
      git commit -m "Add display precision: IEEE 754 floating point explained, formatResult rounds to significant figures, precision selector updates state"
      ```

---

*Next: Lesson 06 — History. Every calculation is stored and shown in a scrollable
list. Clicking a history entry pastes its result into the display. The history
array is immutable: entries are appended with spread syntax and never mutated with
push. Why immutability matters is shown directly by what breaks without it.*
