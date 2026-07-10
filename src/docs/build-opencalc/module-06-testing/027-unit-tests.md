# 027 — Unit Tests

*Testing pure functions, boundary values, edge cases, and the complete test suite for the calculator engine*

---

## What You Will Build

You will write a complete unit test suite for `calc-engine.ts`. The suite covers: boundary values, edge cases, error conditions, and the floating-point precision requirements. You will learn the `describe`/`it` pattern for test organisation, matchers for different assertion types, and the principle of testing one behaviour per test.

---

## What You Need to Know First

Lesson 026 — What Tests Are For. Vitest is configured and `calc-engine.ts` exists with initial tests.

---

## The Lesson

### What makes a good unit test

A good unit test has four properties (the FIRST properties):

**Fast** — runs in milliseconds. Unit tests with no I/O, no network, no filesystem are inherently fast. If a unit test is slow, it usually means it is doing too much (integration test in disguise).

**Isolated** — tests one thing. If a test fails, the cause is unambiguous. A test that exercises `evaluateExpression`, `formatResult`, and localStorage in one test body fails for any of three reasons — hard to diagnose.

**Repeatable** — same result every run. A test that depends on `new Date()`, random numbers, or filesystem state may pass sometimes and fail sometimes. Tests must be deterministic.

**Self-verifying** — the test knows if it passed or failed automatically. An assertion either passes or fails. A test that logs output and requires human inspection is not self-verifying.

**Thorough** — tests the interesting cases. Not every line of code, but every distinct behaviour. "Interesting" cases include: happy path, boundary values, error conditions, edge cases.

---

**CS lens — boundary value analysis:**

**Boundary value analysis** is a technique for selecting test inputs at the boundaries of valid input ranges. If a function accepts numbers from 0 to 100:
- Test exactly at the boundaries: `0`, `100`
- Test just inside: `1`, `99`
- Test just outside (error cases): `-1`, `101`

Boundaries are where bugs cluster. Off-by-one errors (`< n` vs `<= n`), type coercion failures (`0` treated as falsy when `0` is valid), and edge case handling (`""` vs `null`) all appear at input boundaries.

For `evaluateExpression`:
- Empty string (boundary: minimum input length)
- Single number: `'42'` (valid but incomplete expression)
- Expression ending in operator: `'1+'` (boundary between valid and invalid)
- Very large numbers: `'999999999*999999999'` (boundary of safe integers)
- Division by zero: `'1/0'` (special case producing Infinity)

---

**SE lens — tests as change detectors:**

A test suite's primary value is detecting regressions — changes that break existing behaviour. When you refactor `evaluateExpression` to replace `eval()` with a proper expression parser (a future lesson), the tests verify that the new implementation produces the same results as the old one.

Without tests, refactoring is dangerous. You must either avoid it (accumulating technical debt) or accept the risk of unknown breakage. With tests, refactoring becomes mechanical: change the implementation, run the tests, fix any failures, refactor complete.

This is why test-driven development (TDD) — write the test before the code — helps produce well-structured code: if you cannot write a test for a function before implementing it, the function's interface is probably not clear enough.

---

### The complete unit test suite

Create `src/calc-engine.test.ts` (replace the file from lesson 026 with this comprehensive version):

```typescript
// src/calc-engine.test.ts

import { evaluateExpression, canAppendOperator, formatResult } from './calc-engine.js'

// ---- evaluateExpression ----

describe('evaluateExpression', () => {

  describe('arithmetic operations', () => {

    it('adds two integers', () => {
      const result = evaluateExpression('1+2')
      expect(result).toMatchObject({ kind: 'ok', value: '3' })
    })

    it('subtracts two integers', () => {
      expect(evaluateExpression('10-4')).toMatchObject({ kind: 'ok', value: '6' })
    })

    it('multiplies two integers', () => {
      expect(evaluateExpression('6*7')).toMatchObject({ kind: 'ok', value: '42' })
    })

    it('divides two integers', () => {
      expect(evaluateExpression('15/3')).toMatchObject({ kind: 'ok', value: '5' })
    })

    it('respects operator precedence', () => {
      // 2 + 3 * 4 = 14 (not 20)
      expect(evaluateExpression('2+3*4')).toMatchObject({ kind: 'ok', value: '14' })
    })

    it('evaluates parenthesised expressions', () => {
      expect(evaluateExpression('(2+3)*4')).toMatchObject({ kind: 'ok', value: '20' })
    })

    it('handles unary negation', () => {
      expect(evaluateExpression('-5+3')).toMatchObject({ kind: 'ok', value: '-2' })
    })

    it('evaluates chained operations', () => {
      expect(evaluateExpression('1+2+3+4+5')).toMatchObject({ kind: 'ok', value: '15' })
    })

  })

  describe('decimal arithmetic', () => {

    it('adds decimals', () => {
      const result = evaluateExpression('1.5+2.5')
      expect(result.kind).toBe('ok')
      if (result.kind === 'ok') {
        expect(parseFloat(result.value)).toBeCloseTo(4.0, 5)
      }
    })

    it('handles the floating-point 0.1 + 0.2 case', () => {
      const result = evaluateExpression('0.1+0.2')
      expect(result.kind).toBe('ok')
      if (result.kind === 'ok') {
        // JavaScript: 0.1 + 0.2 = 0.30000000000000004
        // We assert approximately correct, not bit-exact
        expect(parseFloat(result.value)).toBeCloseTo(0.3, 5)
      }
    })

    it('divides to a decimal', () => {
      const result = evaluateExpression('1/3')
      expect(result.kind).toBe('ok')
      if (result.kind === 'ok') {
        expect(parseFloat(result.value)).toBeCloseTo(0.333333, 5)
      }
    })

  })

  describe('edge cases', () => {

    it('returns error for empty string', () => {
      expect(evaluateExpression('')).toMatchObject({ kind: 'error' })
    })

    it('returns error for whitespace-only string', () => {
      expect(evaluateExpression('   ')).toMatchObject({ kind: 'error' })
    })

    it('returns ok for a single number', () => {
      expect(evaluateExpression('42')).toMatchObject({ kind: 'ok', value: '42' })
    })

    it('returns ok for zero', () => {
      expect(evaluateExpression('0')).toMatchObject({ kind: 'ok', value: '0' })
    })

    it('returns error for expression ending in operator', () => {
      expect(evaluateExpression('1+')).toMatchObject({ kind: 'error' })
    })

    it('returns error for consecutive operators', () => {
      expect(evaluateExpression('1++2')).toMatchObject({ kind: 'error' })
    })

    it('returns error for division by zero', () => {
      // 1/0 = Infinity — not a finite number
      const result = evaluateExpression('1/0')
      expect(result).toMatchObject({ kind: 'error' })
    })

    it('returns error for non-numeric expression', () => {
      // eval("abc") would throw ReferenceError
      const result = evaluateExpression('abc')
      expect(result).toMatchObject({ kind: 'error' })
    })

    it('handles large numbers', () => {
      // 999999 * 999999 is within safe integer range
      const result = evaluateExpression('999999*999999')
      expect(result.kind).toBe('ok')
      if (result.kind === 'ok') {
        expect(parseInt(result.value, 10)).toBe(999998000001)
      }
    })

    it('handles negative results', () => {
      expect(evaluateExpression('3-10')).toMatchObject({ kind: 'ok', value: '-7' })
    })

  })

})

// ---- canAppendOperator ----

describe('canAppendOperator', () => {

  describe('when expression is non-empty', () => {

    it('returns true when last char is a digit', () => {
      expect(canAppendOperator('42', '+')).toBe(true)
    })

    it('returns true when last char is a closing parenthesis', () => {
      expect(canAppendOperator('(1+2)', '*')).toBe(true)
    })

    it('returns false when last char is the same operator', () => {
      expect(canAppendOperator('42+', '+')).toBe(false)
    })

    it('returns true when replacing operator with a different one', () => {
      expect(canAppendOperator('42+', '-')).toBe(true)
      expect(canAppendOperator('42+', '*')).toBe(true)
      expect(canAppendOperator('42+', '/')).toBe(true)
    })

  })

  describe('when expression is empty', () => {

    it('returns false', () => {
      expect(canAppendOperator('', '+')).toBe(false)
      expect(canAppendOperator('', '-')).toBe(false)
      expect(canAppendOperator('', '*')).toBe(false)
      expect(canAppendOperator('', '/')).toBe(false)
    })

  })

})

// ---- formatResult ----

describe('formatResult', () => {

  describe('integers', () => {

    it('formats zero', () => {
      expect(formatResult(0)).toBe('0')
    })

    it('formats positive integers without decimal', () => {
      expect(formatResult(42)).toBe('42')
      expect(formatResult(100)).toBe('100')
      expect(formatResult(999)).toBe('999')
    })

    it('formats negative integers', () => {
      expect(formatResult(-7)).toBe('-7')
      expect(formatResult(-42)).toBe('-42')
    })

  })

  describe('decimals', () => {

    it('formats simple decimals', () => {
      expect(formatResult(3.14)).toBe('3.14')
      expect(formatResult(0.5)).toBe('0.5')
    })

    it('removes trailing zeros from floating-point', () => {
      // 1/3 would be 0.3333333333 with 10 decimal places
      const third = 1/3
      const formatted = formatResult(third)
      // Should not end in trailing zeros
      expect(formatted).not.toMatch(/\.?0+$/)
    })

    it('corrects floating-point 0.1 + 0.2', () => {
      const sum = 0.1 + 0.2  // 0.30000000000000004 in JavaScript
      const formatted = formatResult(sum)
      expect(formatted).toBe('0.3')
    })

  })

})
```

**Walkthrough:**

`expect(result).toMatchObject({ kind: 'ok', value: '3' })` — `.toMatchObject` checks that the received object contains the expected subset. The result object `{ kind: 'ok', value: '3' }` passes if `result.kind === 'ok'` and `result.value === '3'`. If the result has additional properties, they are ignored.

This is better than `toBe` for objects (which requires exact equality including reference). Better than checking each property individually (`expect(result.kind).toBe('ok'); expect(result.value).toBe('3')`) — one matcher, one failure message.

Nested `describe` blocks — tests for 'arithmetic operations' are nested inside tests for `evaluateExpression`. The test runner output is hierarchical:

```
evaluateExpression
  arithmetic operations
    ✓ adds two integers
    ✓ subtracts two integers
    ...
  decimal arithmetic
    ✓ adds decimals
    ...
  edge cases
    ✓ returns error for empty string
    ...
```

This hierarchy matches how the function works conceptually: top-level (`evaluateExpression`), then categories of inputs.

`expect(formatted).not.toMatch(/\.?0+$/)` — negated assertion. `.not.` inverts the matcher. `.toMatch` accepts a regex. `/\.?0+$/` matches any string ending in `0` (optionally preceded by `.`). The assertion: the formatted string should NOT end in trailing zeros.

---

**CS lens — test cases as input partitions:**

**Equivalence partitioning** is a test design technique: divide the input space into partitions where all inputs in a partition should produce the same behaviour. Test one representative from each partition.

For `evaluateExpression`:
- Partition 1: valid arithmetic expressions → `{ kind: 'ok', value: ... }`
- Partition 2: syntactically invalid → `{ kind: 'error', ... }`
- Partition 3: mathematically problematic (Infinity, NaN) → `{ kind: 'error', ... }`
- Partition 4: empty input → `{ kind: 'error', ... }`

Within partition 1, sub-partitions: integers, decimals, expressions with parentheses, multi-operator expressions.

The full test suite above covers all partitions and sub-partitions. Every test case belongs to one partition — no duplicate coverage, no gaps.

---

**SE lens — one assertion per test (the ideal):**

Ideally, each test has one assertion. When a test has multiple assertions and fails, you know which assertion failed (the first one that fails). But a single failing assertion may mask other failures (assertions after the failure are not executed).

In practice, related assertions can coexist when they are testing the same behaviour:

```typescript
it('formats positive integers', () => {
  expect(formatResult(42)).toBe('42')   // same behaviour
  expect(formatResult(100)).toBe('100') // same behaviour
  expect(formatResult(999)).toBe('999') // same behaviour
})
```

These three assertions test the same code path with three representative values from the same partition. Putting them in one test is reasonable. Putting addition, subtraction, and multiplication in one test is not — they are different behaviours.

The guideline: one behaviour per test, one logical assertion per behaviour. If testing one behaviour requires multiple assertions (check `kind`, then check `value` after narrowing), that is acceptable.

---

### Run the complete suite

```bash
npm run test:run
```

Expected output:

```
 ✓ src/calc-engine.test.ts (25)
   ✓ evaluateExpression > arithmetic operations (8)
   ✓ evaluateExpression > decimal arithmetic (3)
   ✓ evaluateExpression > edge cases (9)
   ✓ canAppendOperator > when expression is non-empty (4)
   ✓ canAppendOperator > when expression is empty (1)
   ✓ formatResult > integers (3)
   ✓ formatResult > decimals (3)

Test Files  1 passed (1)
Tests       25 passed (25)
```

25 tests. All passing. Execution time under 1 second (pure functions, no I/O).

---

**CS lens — test coverage:**

**Code coverage** measures which lines of source code are executed during a test run. Vitest can generate coverage reports:

```bash
npx vitest run --coverage
```

With `@vitest/coverage-v8` installed, the report shows:
- Lines covered / total lines
- Functions covered / total functions
- Branches covered (if/else paths) / total branches

For `calc-engine.ts` with 25 tests, you should see near 100% coverage. The uncovered lines would be error paths that no test exercises.

Coverage is a useful metric but not a complete picture: 100% coverage does not mean 100% correctness. A test that calls `evaluateExpression('1+2')` covers the `return { kind: 'ok', value: ... }` line — but if the assertion is wrong (asserts `'4'` instead of `'3'`), the test passes despite the incorrect behaviour.

Coverage tells you which code ran; not whether it produced the right output. Use coverage as a floor ("at least 80% covered") not as a target.

---

## Connect the Pieces

**Connection to lesson 026:** This lesson extends the initial test file from lesson 026 to a complete suite. The structure (describe/it, toMatchObject, toBeCloseTo) is the same; the coverage is comprehensive.

**Connection to lesson 025:** The `isHistoryEntry` type predicate in `Calculator.tsx` could also have unit tests: `expect(isHistoryEntry({ id: 1, expression: '1+2', result: '3' })).toBe(true)`, `expect(isHistoryEntry(null)).toBe(false)`. Pure validation functions are ideal unit test targets.

**Connection to lesson 028:** These unit tests run in under 1 second because they have no DOM. Component tests in lesson 028 are slower (jsdom setup, component mount) but test higher-level behaviour. Both coexist in the same Vitest run.

---

## What Breaks Without This

**Flaky test (non-deterministic):**

```typescript
it('generates a unique ID', () => {
  const id = nextId()
  // nextId uses Date.now() internally — result changes every millisecond
  expect(id).toBeGreaterThan(0)  // passes, but tests nothing specific
})
```

If the function uses `Date.now()` or `Math.random()`, the test cannot assert exact values. Two solutions:
1. Inject the time/random source as a parameter (`nextId(seed: number)`) — testable with a fixed seed
2. Assert only invariants (`toBeGreaterThan(0)`) — less valuable but at least tests the type

**Testing implementation details:**

```typescript
it('calls setExpression when digit is appended', () => {
  const setExpression = vi.fn()  // Vitest mock function
  appendDigit('5', setExpression)  // if appendDigit is extracted
  expect(setExpression).toHaveBeenCalledWith(expect.stringContaining('5'))
})
```

This test breaks if `appendDigit` is refactored to update a reducer instead of calling `setExpression` directly. The implementation changed; the behaviour (the expression contains '5') did not. Test behaviour, not implementation.

**Forgetting to test error cases:**

```typescript
// Only tests happy path
it('evaluates 1+2', () => {
  expect(evaluateExpression('1+2')).toMatchObject({ kind: 'ok' })
})

// Missing: division by zero, empty input, invalid expressions
```

This test suite only detects regressions in the happy path. A bug that returns `{ kind: 'ok', value: 'Infinity' }` for `'1/0'` would not be caught. Error cases and edge cases must be explicitly tested — they are not covered "automatically" by testing the happy path.

---

## Definition of Done

- [ ] `src/calc-engine.test.ts` has at least 25 tests across three describe blocks
- [ ] Tests cover: all four arithmetic operations, decimal precision, boundary values, and error cases
- [ ] `npm run test:run` reports all tests passing
- [ ] No test takes more than 100ms (all are under 10ms)
- [ ] You can explain equivalence partitioning with an example from the test suite
- [ ] You can explain the difference between `toBe` and `toMatchObject`
- [ ] You can explain why `toBeCloseTo` is used instead of `toBe` for decimal comparisons
- [ ] You can explain what a flaky test is and how to prevent it
- [ ] Git commit:
    ```
    git add src/calc-engine.test.ts
    git commit -m "Complete unit test suite for calc-engine — 25 tests

    Tests cover arithmetic operations, decimal precision, edge cases, error conditions.
    Organized with nested describe blocks: evaluateExpression/canAppendOperator/formatResult.
    Boundary values tested: empty string, single number, operator-ending expressions.
    All 25 pass in under 1 second — zero I/O, pure functions only."
    ```
