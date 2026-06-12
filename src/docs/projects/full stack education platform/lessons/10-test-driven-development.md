# Lesson 10 — Test-Driven Development From First Principles

## What You Will Build

Write tests for the sandbox runner and the lesson state reducer. No new visible feature —
but this lesson produces visible output: a test runner in your terminal showing green
checkmarks and red failures. Run `npm test` and see results. Break a function deliberately
and watch a test go red.

The visible output of this lesson is the test runner output. That counts.

---

## What You Need to Know First

- Lesson 08: `lessonReducer`, `LessonState`, `LessonAction`
- Lesson 09: `ExecutionResult`, `createSandboxRunner`

---

## The Lesson

### Step 1 — What a Test Is

A **test** is code that calls your code and **asserts** the output matches what you expect.

```typescript
// The function under test
function add(a: number, b: number): number {
  return a + b
}

// A test for it
test('add returns the sum of two numbers', () => {
  const result = add(3, 7)
  expect(result).toBe(10)
})
```

**`expect(result).toBe(10)` explained:**
`expect` takes the actual value. `.toBe` is a **matcher** — it compares the actual value
to the expected value. If they are not equal, `.toBe` throws an error. The test runner
catches the error and marks the test as failed. If no error is thrown, the test passes.

**What tests are for:** Tests do not prove code works. They define precisely what "works"
means — and detect **regressions**: when a future change breaks something that used to work.
Without tests, you find regressions when a user reports a bug. With tests, you find them
when you save a file.

**The assertion:** An assertion is a boolean check that throws if false. `expect(result).toBe(10)`
asserts that `result` equals `10`. If `result` is `11`, the assertion fails:
`Expected: 10, Received: 11`.

### Step 2 — Test-Driven Development

**TDD (test-driven development)** is a practice:
1. Write a test for the behaviour you want. Run it — it fails (because the code does not exist yet).
2. Write the minimum code that makes the test pass.
3. Refactor the code (clean it up). The test verifies behaviour did not change.

**Why write the failing test first?**
- If you write the code first, you might write tests that pass trivially without actually
  verifying the behaviour (accidentally testing the implementation, not the specification).
- A failing test proves the test actually tests something. A test that passes before the
  code exists is broken.
- Writing the test first forces you to think about the API (what does this function take
  as input? what does it return?) before thinking about the implementation.

**The red-green-refactor cycle:**
- **Red** — the test fails (red indicator)
- **Green** — make it pass (green indicator) with the simplest code
- **Refactor** — clean up the implementation; tests stay green

### Step 3 — Installing Vitest

**What Vitest is:** Vitest is a test runner designed for Vite-based projects. It is faster
than Jest (the most common alternative) because it uses the same bundler as your app —
no separate transformation step. For Expo projects with Vite, Vitest is the natural choice.

```bash
$ npm install --save-dev vitest @vitest/ui jsdom
```

- `vitest` — the test runner itself (dev dependency: never shipped to users)
- `@vitest/ui` — a browser-based UI for viewing test results (optional but useful)
- `jsdom` — simulates a browser DOM environment in Node.js (required for tests that
  create DOM elements, like the iframe runner)

**Add to `package.json`:**
```json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui"
},
"vitest": {
  "environment": "jsdom",
  "globals": true
}
```

`"globals": true` makes `test`, `expect`, `describe`, `it` available without importing
them in every test file — they are injected as globals by Vitest. This is consistent
with how Jest works and reduces boilerplate.

**`environment: "jsdom"`:** By default, Vitest runs in Node.js (no browser APIs). `jsdom`
provides a simulated DOM: `document`, `window`, `localStorage`, etc. Tests that create
iframes need the DOM environment.

### Step 4 — Testing the Reducer

The reducer is a pure function — given the same state and action, it always returns the
same result. Pure functions are the easiest things to test.

Create `src/context/__tests__/lessonReducer.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { lessonReducer, type LessonState } from '../LessonContext'

const INITIAL_STATE: LessonState = {
  currentCode: 'console.log("hello")',
  hasEdited: false,
  submitCount: 0,
}

describe('lessonReducer', () => {
  it('CODE_CHANGED updates currentCode and sets hasEdited to true', () => {
    const newCode = 'console.log("world")'
    const nextState = lessonReducer(INITIAL_STATE, {
      type: 'CODE_CHANGED',
      newCode,
    })
    expect(nextState.currentCode).toBe(newCode)
    expect(nextState.hasEdited).toBe(true)
  })

  it('LESSON_RESET restores starter code and clears hasEdited', () => {
    const editedState: LessonState = {
      ...INITIAL_STATE,
      currentCode: 'different code',
      hasEdited: true,
    }
    const nextState = lessonReducer(editedState, {
      type: 'LESSON_RESET',
      starterCode: 'console.log("hello")',
    })
    expect(nextState.currentCode).toBe('console.log("hello")')
    expect(nextState.hasEdited).toBe(false)
    expect(nextState.submitCount).toBe(0)
  })

  it('CODE_SUBMITTED increments the submit count', () => {
    const nextState = lessonReducer(INITIAL_STATE, { type: 'CODE_SUBMITTED' })
    expect(nextState.submitCount).toBe(1)
  })

  it('CODE_CHANGED does not modify the original state', () => {
    const originalCode = INITIAL_STATE.currentCode
    lessonReducer(INITIAL_STATE, { type: 'CODE_CHANGED', newCode: 'new code' })
    // The original state object should be unchanged — the reducer must be pure
    expect(INITIAL_STATE.currentCode).toBe(originalCode)
  })
})
```

**`describe` and `it`:** `describe` groups related tests. `it` (short for "it should...")
defines a single test case. The naming pattern `describe('thing') → it('does something')`
reads as a sentence: "lessonReducer does not modify the original state."

**Test isolation:** The last test verifies **immutability** — that the reducer does not
mutate the input state. This matters because React's change detection compares object
references. A reducer that mutates state in place would cause React to miss the update.

**`INITIAL_STATE` as a constant:** Using a shared constant means every test starts from
the same known state. Tests that depend on other tests' side effects produce **false
positives** (a test passes only because another test ran first) and **false negatives**
(a test fails because another test changed state). Shared state between tests is a bug
in the tests.

### Step 5 — Testing the Sandbox Runner

The sandbox runner is harder to test — it creates iframes and uses `postMessage`. This
requires **mocking**: replacing real dependencies with controlled fakes.

**What mocking is:** A mock is a fake implementation of a dependency that you control.
Instead of a real iframe that executes JavaScript, a mock might immediately call
`postMessage` with a predefined response. Mocks let you test your code's logic without
depending on external systems (iframes, APIs, databases).

**What mocks test:** Mocks test how your code interacts with its dependencies — that it
calls the right functions with the right arguments, and handles responses correctly.
Mocks do not test the dependencies themselves.

Create `src/runner/__tests__/sandbox.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createSandboxRunner } from '../sandbox'

describe('createSandboxRunner', () => {
  let runner: ReturnType<typeof createSandboxRunner>

  beforeEach(() => {
    runner = createSandboxRunner()
  })

  afterEach(() => {
    runner.cleanup()
  })

  it('runs simple code and captures console.log output', async () => {
    const result = await runner.run('console.log("test output")')
    expect(result.stdout).toContain('test output')
    expect(result.timedOut).toBe(false)
  })

  it('captures runtime errors in stderr', async () => {
    const result = await runner.run('undefinedFunction()')
    expect(result.stderr.length).toBeGreaterThan(0)
    expect(result.timedOut).toBe(false)
  })
})
```

**`beforeEach` and `afterEach`:** These hooks run before and after each test in the
`describe` block.
- `beforeEach` creates a fresh `runner` for each test — test isolation
- `afterEach` cleans up the iframe after each test — prevents DOM pollution between tests

**`async`/`await` in tests:** `runner.run()` returns a Promise. `await` pauses the test
until the Promise resolves. Vitest supports async test functions — the test runner waits
for the returned Promise to resolve before recording pass/fail.

**`ReturnType<typeof createSandboxRunner>`:** `ReturnType` is a TypeScript utility type
that extracts the return type of a function. `typeof createSandboxRunner` is the type of
the function. Together: "the type returned by calling `createSandboxRunner()`." This avoids
writing the return type manually and stays in sync when the function signature changes.

### Step 6 — Running the Tests

```bash
$ npm test
```

Vitest scans for files matching `**/__tests__/**/*.test.ts` and `**/*.test.ts`, runs them,
and reports results:

```
 ✓ src/context/__tests__/lessonReducer.test.ts (4 tests) 12ms
 ✓ src/runner/__tests__/sandbox.test.ts (2 tests) 234ms

 Test Files  2 passed (2)
      Tests  6 passed (6)
```

**How to read test failures:**
```
FAIL src/context/__tests__/lessonReducer.test.ts
  ✗ CODE_CHANGED updates currentCode and sets hasEdited to true
    AssertionError: expected 'original code' to be 'console.log("world")'
      at src/context/__tests__/lessonReducer.test.ts:18:35
```

The failure shows: which test failed, what it expected, what it got, and the exact line.
The file path and line number let you navigate directly to the failing assertion.

**Deliberately breaking a test:**
Change `lessonReducer` so `CODE_CHANGED` does not update `currentCode`. Run `npm test`.
Watch the test go red. This proves the test actually tests the behaviour. Fix the reducer;
the test goes green.

### Step 7 — The Testing Pyramid

Three levels of testing have different costs and guarantees:

**Unit tests** (most tests, fastest):
- Test one function or module in isolation
- Fast: milliseconds per test
- No network, no database, no browser
- Example: the reducer tests above

**Integration tests** (fewer, slower):
- Test multiple modules working together
- May involve a real database or a real HTTP server
- Example: test that `LessonsScreen` + `LessonContext` + `lessonReducer` work together

**End-to-end tests** (fewest, slowest):
- Test the whole app from the user's perspective
- Open a real browser, click real buttons, verify real output
- Tools: Playwright, Cypress, Detox (for React Native)
- Example: "user navigates to lessons, types code, clicks Run, sees output"

Most tests should be unit tests — they are fast enough to run on every save, and they
tell you exactly which function is broken when they fail. End-to-end tests are valuable
but slow — run them before deploying, not on every keypress.

---

## Connect the Pieces

The reducer test verifies the **immutability invariant**: the reducer never mutates its
input. This is the same invariant that React relies on for change detection. If the
reducer mutated state, React would never detect changes — the same reference, even with
different content, looks unchanged to React.

The `beforeEach` / `afterEach` isolation pattern is the same principle as the sandbox
runner's fresh iframe per execution: each run starts clean, with no residue from the
previous run.

Tests as a specification: the test file for `lessonReducer` defines precisely what the
reducer does — what inputs produce what outputs. This is documentation that cannot go
stale, because a test that is wrong will fail. Comments about what code does go stale
silently. Tests go red loudly.

Google, Netflix, and every major software company run thousands of automated tests on
every code change before deploying. The testing pyramid and the red/green/refactor cycle
are standard across the industry.

---

## What Breaks Without This

Without the immutability test, a developer refactors the reducer and accidentally
uses `state.currentCode = action.newCode` instead of `return { ...state, currentCode: action.newCode }`.
The mutation corrupts React's change detection — the screen never updates. The bug
is subtle and hard to find without knowing to check for mutation. The test fails
immediately and points at the exact line.

Without `beforeEach` creating a fresh runner, the second test might receive output from
the first test's execution. The tests become order-dependent — passing individually but
failing together. These are the hardest bugs in test suites to diagnose.

---

## Definition of Done

- [ ] `npm test` runs and shows all tests passing
- [ ] The reducer tests cover: CODE_CHANGED, LESSON_RESET, CODE_SUBMITTED, and immutability
- [ ] The sandbox runner tests cover: successful execution, runtime errors
- [ ] Deliberately breaking the reducer makes a test go red; fixing it makes it green
- [ ] You can answer: what is the difference between a unit test and an integration test?
- [ ] You can answer: why do you write the test before the code in TDD?
- [ ] You can answer: what is mocking and what does it test vs what the real code tests?
- [ ] You can answer: what is test isolation and why do tests share no state?
- [ ] `git commit` with a message explaining why — "Add Vitest tests for reducer and sandbox runner — establish test baseline before backend work"
