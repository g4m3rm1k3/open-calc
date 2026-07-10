# 026 — What Tests Are For

*Why tests exist, what categories cover, and when not to test*

---

## What You Will Build

You will install Vitest, write the first passing test — a unit test for the pure calculation function extracted from the calculator — and verify the test suite runs. You will understand what this test proves and what it does not prove.

---

## What You Need to Know First

Lesson 007 — Build Tools. Vite is used; Vitest is Vite's test runner.

Lesson 014 — useState. The calculator's `evaluate` function is the testable unit.

---

## The Lesson

### Why tests exist

A test is a program that verifies another program's behaviour under specific conditions. Tests exist because:

1. **Regression prevention** — when you change code, tests verify that existing behaviour still works. Without tests, every change risks breaking something that previously worked.

2. **Specification** — tests are executable specifications. `expect(formatCurrency(9.99)).toBe('$9.99')` states precisely what the function must do for that input. It is more reliable than a comment ("// formats as currency") because it is executed and verified.

3. **Design feedback** — code that is hard to test is often code that is poorly structured. If writing a test requires complex setup, multiple mocks, and intimate knowledge of internal state, the code is too tightly coupled. Test difficulty is a signal to refactor.

4. **Safe refactoring** — refactoring (restructuring code without changing behaviour) requires confidence that behaviour is preserved. Tests provide that confidence. Without tests, refactoring is guesswork.

These are the reasons to write tests. They are also the criteria for evaluating whether a specific test is worth writing.

---

**CS lens — the difference between testing and proving:**

Tests demonstrate that a program behaves correctly for specific inputs. They do not prove that the program is correct for all inputs.

A function `add(a, b)` with tests for `add(1,2)`, `add(0,0)`, and `add(-1,1)` might still fail for `add(2.1, 1.1)` (floating-point arithmetic: `2.1 + 1.1 === 3.2000000000000002` in JavaScript).

The distinction from Dijkstra: "testing can reveal the presence of bugs, but never their absence."

Testing is not a substitute for reasoning. A test suite that passes gives you confidence, not certainty. The confidence level depends on:
- How well the tests cover the input space (edge cases, boundary values)
- Whether the tests were written by the same person who wrote the code (confirmation bias)
- Whether the tests test the right thing (testing implementation rather than behaviour)

TypeScript reduces the need for certain tests: "does this function accept a number?" is answered by the type checker, not a test. TypeScript and tests complement each other: types cover structural correctness; tests cover behavioural correctness.

---

**SE lens — test categories and their value:**

Tests fall into three categories:

**Unit tests** — test a single function or module in isolation. The unit has no external dependencies (database, network, DOM). Arguments go in, return value comes out. Fast (milliseconds per test), cheap to write, low maintenance.

**Integration tests** — test multiple components working together. A component that calls a hook that reads from context is an integration test. Slower, more complex setup, higher value for testing component interaction.

**End-to-end (E2E) tests** — test the full system through the UI. A Playwright or Cypress script that clicks buttons and asserts DOM state. Slowest, most brittle (break when UI changes), highest confidence that the system works as a whole.

The **testing pyramid**: most tests should be unit tests, fewer integration tests, fewest E2E tests. The pyramid reflects cost: E2E tests are expensive to write and maintain; unit tests are cheap. Inverting the pyramid (most tests E2E) produces a fragile, slow test suite that discourages testing.

For this series:
- Lesson 027 — unit tests for pure functions (the bottom of the pyramid)
- Lesson 028 — component tests (integration, one level up)

---

**SE lens — when not to test:**

Not everything should have tests. Writing tests costs time. Every test must be maintained when the code changes. Bad tests — tests that add maintenance burden without adding confidence — should not exist.

**Do not test:**
- Third-party library behaviour (test your code, not React's code)
- Implementation details (which internal variables are set, which functions are called internally)
- Trivial code that cannot fail (`const x = 1` has no interesting behaviour)
- Code that TypeScript already checks (argument type correctness)
- Things the browser can test better than unit tests (layout, visual regression)

**Do test:**
- Pure functions with non-trivial logic (`evaluate`, `formatCurrency`, `parseExpression`)
- Business rules that must not regress (`tax calculation`, `permission checks`)
- Code that interacts with external systems at boundaries (with mocks at that boundary)
- Components where user interaction is complex (multi-step forms, stateful widgets)

The rule: test behaviour that matters, at the lowest level of the pyramid that can test it, with enough coverage to detect the failures that would be bad.

---

### Install Vitest

```bash
npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

`vitest` — the test runner. Uses the same Vite configuration, so TypeScript, path aliases, and module resolution work without extra setup.

`@vitest/ui` — an optional browser-based UI for viewing test results. Run with `npx vitest --ui`.

`jsdom` — a JavaScript implementation of the browser's DOM API, used in Node.js. Vitest runs in Node.js; `jsdom` provides `document`, `window`, `HTMLElement` so component tests can run without a real browser.

`@testing-library/react` — the standard React testing library. Provides `render` (mounts a component into a `jsdom` document) and queries (`screen.getByText`, `screen.getByRole`, etc.).

`@testing-library/jest-dom` — custom matchers for Jest/Vitest: `expect(element).toBeInTheDocument()`, `expect(element).toHaveTextContent('...')`, etc.

`@testing-library/user-event` — simulates real user interactions (typing, clicking, pressing keys) more accurately than `fireEvent`.

---

Update `vite.config.js` to add test configuration:

```javascript
// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

`test.environment: 'jsdom'` — run tests in a jsdom environment (browser-like APIs available).

`test.globals: true` — makes `describe`, `it`, `expect`, `beforeEach`, etc. available globally (like Jest). Without this, you must import them: `import { describe, expect, it } from 'vitest'`.

`test.setupFiles` — files to run before each test file. Used to add `@testing-library/jest-dom` matchers.

Create `src/test-setup.ts`:

```typescript
// src/test-setup.ts
// Runs before every test file.

import '@testing-library/jest-dom'
```

`import '@testing-library/jest-dom'` — extends `expect` with DOM-specific matchers. Without this, `expect(element).toBeInTheDocument()` does not exist.

Add test scripts to `package.json`:

```json
{
  "scripts": {
    "dev":     "vite",
    "build":   "vite build",
    "preview": "vite preview",
    "test":    "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "type-check": "tsc --noEmit"
  }
}
```

`"test": "vitest"` — runs Vitest in watch mode (re-runs tests on file changes). Good for development.

`"test:run": "vitest run"` — runs all tests once and exits. Used in CI.

`"type-check": "tsc --noEmit"` — type-checks without building. Useful as a separate step.

---

### Extract a pure function to test

The `evaluate` function in `Calculator.tsx` is not easily testable because it:
1. Uses `eval` directly
2. Calls multiple state setters as side effects
3. Is a method inside a React component

To write a unit test, extract the pure calculation logic:

Create `src/calc-engine.ts`:

```typescript
// src/calc-engine.ts
//
// Pure calculation functions, independent of React state.
// These can be tested without mounting any component.

export type CalcResult =
  | { kind: 'ok';    value: string }
  | { kind: 'error'; message: string }

export function evaluateExpression(expression: string): CalcResult {
  if (expression.trim() === '') {
    return { kind: 'error', message: 'Expression is empty' }
  }

  try {
    // eslint-disable-next-line no-eval
    const rawResult = eval(expression) as unknown

    if (typeof rawResult !== 'number') {
      return { kind: 'error', message: `Result is not a number: ${typeof rawResult}` }
    }

    if (!isFinite(rawResult)) {
      return { kind: 'error', message: `Result is not finite: ${rawResult}` }
    }

    return { kind: 'ok', value: String(rawResult) }

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { kind: 'error', message }
  }
}

export function canAppendOperator(expression: string, op: string): boolean {
  if (expression === '') return false
  const lastChar = expression.slice(-1)
  return !['+', '-', '*', '/'].includes(lastChar) || op !== lastChar
}

export function formatResult(value: number, decimalPlaces = 10): string {
  if (Number.isInteger(value)) return String(value)
  const fixed = parseFloat(value.toFixed(decimalPlaces))
  return String(fixed)
}
```

**Walkthrough:**

`export type CalcResult = { kind: 'ok'; value: string } | { kind: 'error'; message: string }` — a **discriminated union**. The `kind` property distinguishes the two cases. The caller uses `if (result.kind === 'ok')` to type-safely access `result.value`; otherwise `result.message` is available. This is more explicit than returning `string | null` — the error case carries a message.

`evaluateExpression` is a pure function: same input, same output, no side effects. It never calls `setExpression` or `setIsError`. It receives an expression string, returns a `CalcResult`.

`canAppendOperator` — pure function. Checks whether it is valid to append an operator to the current expression. Used by `appendOperator` in `Calculator.tsx`.

`formatResult` — pure function. Handles floating-point display: `0.1 + 0.2` in JavaScript is `0.30000000000000004`. `toFixed(10)` rounds to 10 decimal places, then `parseFloat` removes trailing zeros. `3.1` stays `3.1`; `3.30000000000000004` becomes `3.3`.

---

### Write the first test

Create `src/calc-engine.test.ts`:

```typescript
// src/calc-engine.test.ts

import { evaluateExpression, canAppendOperator, formatResult } from './calc-engine.js'

describe('evaluateExpression', () => {

  it('evaluates simple addition', () => {
    const result = evaluateExpression('1+2')
    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') {
      expect(result.value).toBe('3')
    }
  })

  it('evaluates multiplication', () => {
    const result = evaluateExpression('6*7')
    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') {
      expect(result.value).toBe('42')
    }
  })

  it('evaluates nested expressions', () => {
    const result = evaluateExpression('(2+3)*4')
    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') {
      expect(result.value).toBe('20')
    }
  })

  it('returns error for empty expression', () => {
    const result = evaluateExpression('')
    expect(result.kind).toBe('error')
  })

  it('returns error for invalid expression', () => {
    const result = evaluateExpression('1++2')
    expect(result.kind).toBe('error')
  })

  it('returns error for division by zero', () => {
    const result = evaluateExpression('1/0')
    // In JavaScript, 1/0 === Infinity — not a finite number
    expect(result.kind).toBe('error')
  })

  it('handles decimal arithmetic', () => {
    const result = evaluateExpression('0.1+0.2')
    expect(result.kind).toBe('ok')
    // Note: 0.1 + 0.2 = 0.30000000000000004 in JavaScript
    // The raw value is not 0.3
    if (result.kind === 'ok') {
      expect(parseFloat(result.value)).toBeCloseTo(0.3, 5)
    }
  })

})

describe('canAppendOperator', () => {

  it('returns true when expression is non-empty and last char is a digit', () => {
    expect(canAppendOperator('42', '+')).toBe(true)
  })

  it('returns false when expression is empty', () => {
    expect(canAppendOperator('', '+')).toBe(false)
  })

  it('returns false when replacing operator with same operator', () => {
    expect(canAppendOperator('42+', '+')).toBe(false)
  })

  it('returns true when replacing operator with different operator', () => {
    expect(canAppendOperator('42+', '-')).toBe(true)
  })

})

describe('formatResult', () => {

  it('formats integers without decimal point', () => {
    expect(formatResult(42)).toBe('42')
    expect(formatResult(0)).toBe('0')
    expect(formatResult(-7)).toBe('-7')
  })

  it('formats decimals with correct precision', () => {
    expect(formatResult(3.14)).toBe('3.14')
    expect(formatResult(0.1 + 0.2)).toBe('0.3')  // floating-point corrected
  })

})
```

**Walkthrough:**

`describe('evaluateExpression', () => { ... })` — groups related tests. The string `'evaluateExpression'` is the group label. Nested `describe` blocks create hierarchical groupings. Test output shows: `evaluateExpression > evaluates simple addition`.

`it('evaluates simple addition', () => { ... })` — a single test case. `it` is an alias for `test`. The string is the test name. The callback contains the assertions.

`expect(result.kind).toBe('ok')` — an assertion. `expect(value)` creates an expectation object. `.toBe(expected)` asserts strict equality (`Object.is`). If `result.kind` is not `'ok'`, the test fails and reports the expected vs actual values.

`expect(parseFloat(result.value)).toBeCloseTo(0.3, 5)` — floating-point comparison. `.toBeCloseTo(expected, numDigits)` asserts that the numbers are close within `numDigits` decimal places. `toBeCloseTo(0.3, 5)` means "equal to `0.3` within 5 decimal places." Direct equality (`toBe(0.3)`) would fail due to floating-point precision.

The TypeScript narrowing inside the test:

```typescript
expect(result.kind).toBe('ok')
if (result.kind === 'ok') {
  expect(result.value).toBe('3')  // TypeScript knows result.value exists here
}
```

After `expect(result.kind).toBe('ok')`, the test logically guarantees `result.kind === 'ok'` (if it were not, the test would have failed). TypeScript does not understand assertion semantics, so the `if` check is needed for narrowing.

---

### Run the tests

```bash
npm test
```

Or for a single run:

```bash
npm run test:run
```

Expected output:

```
 ✓ src/calc-engine.test.ts (9)

Test Files  1 passed (1)
Tests       9 passed (9)
Duration    432ms (transform 180ms, setup 12ms, collect 88ms, tests 152ms, environment 0ms, prepare 0ms)
```

Nine tests, all passing.

---

**CS lens — the test as executable specification:**

The test `it('handles decimal arithmetic', ...)` specifies:
- Input: `'0.1+0.2'`
- Expected output: approximately `0.3`

This test is documentation that cannot go stale. If `evaluateExpression` is changed to return a formatted string like `"0.30"` instead of `"0.30000000000000004"`, the test adapts to the new reality. The test captures the intent (the result should be approximately 0.3) not the implementation.

Compare to a comment: `// floating-point arithmetic can produce long decimal results`. The comment describes the problem but does not specify what the correct output is. The test specifies exactly what output is expected and verifies it on every test run.

---

## Connect the Pieces

**Connection to lesson 001:** Tests are the executable version of requirements. "Any lab loads within 2 seconds on a 4G connection" is a non-functional requirement. A performance test that measures load time is the test for that requirement.

**Connection to lesson 023:** TypeScript types and tests complement each other. `evaluateExpression` takes `string`, returns `CalcResult` — TypeScript checks the types. The tests check the behaviour: does `'1+2'` return `{ kind: 'ok', value: '3' }`? TypeScript cannot answer that.

**Connection to lesson 027:** Lesson 027 extends the unit test suite with more complex cases and introduces the `describe`/`it` hierarchy for large test suites.

**Connection to lesson 028:** Component tests use `@testing-library/react` to render components and assert their output. The setup from this lesson (Vitest, jsdom, jest-dom) is what lesson 028's component tests build on.

---

## What Breaks Without This

**Test file not discovered:**

Vitest discovers test files by pattern. Default patterns: `**/*.test.ts`, `**/*.spec.ts`, `**/*.test.tsx`, `**/*.spec.tsx`. A file named `calc-engine-tests.ts` is not discovered. Rename to `calc-engine.test.ts`.

**Using DOM APIs in a test without jsdom:**

```typescript
const div = document.createElement('div')  // Error: document is not defined
```

Without `environment: 'jsdom'` in the Vitest config, `document` is not available in test files. The error appears at runtime, not compile time. With jsdom, `document`, `window`, and all DOM APIs are available.

**Testing implementation instead of behaviour:**

```typescript
// Wrong — tests internal state
it('sets isError to true on invalid expression', () => {
  // Cannot access isError directly — it is internal React state
  // This test would require exposing internal state, which is wrong
})

// Correct — tests visible behaviour
it('shows Error on invalid expression', async () => {
  render(<Calculator />)
  // Find the = button, click it (invalid expression)
  // Assert the display shows 'Error'
})
```

Testing implementation details couples the test to the code structure. When you refactor (rename `isError` to `hasError`), the test breaks even though the behaviour is identical. Test what the user sees, not how the code works internally.

---

## Definition of Done

- [ ] `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` are in `devDependencies`
- [ ] `vite.config.js` has `test: { environment: 'jsdom', globals: true, setupFiles: [...] }`
- [ ] `src/test-setup.ts` imports `@testing-library/jest-dom`
- [ ] `src/calc-engine.ts` exists with `evaluateExpression`, `canAppendOperator`, `formatResult`
- [ ] `src/calc-engine.test.ts` exists with at least 9 tests across 3 describe blocks
- [ ] `npm run test:run` reports all tests passing
- [ ] You can explain the three testing categories and which level of the pyramid each represents
- [ ] You can explain what `toBeCloseTo` is and why `toBe(0.3)` fails for `0.1 + 0.2`
- [ ] You can explain what TypeScript checks that tests do not, and vice versa
- [ ] Git commit:
    ```
    git add package.json package-lock.json vite.config.js src/test-setup.ts src/calc-engine.ts src/calc-engine.test.ts
    git commit -m "Add Vitest test runner and first unit test suite

    vitest + jsdom + testing-library installed and configured.
    calc-engine.ts extracts pure functions for testability.
    calc-engine.test.ts: 9 tests for evaluateExpression, canAppendOperator, formatResult.
    npm run test:run: all 9 tests pass."
    ```
