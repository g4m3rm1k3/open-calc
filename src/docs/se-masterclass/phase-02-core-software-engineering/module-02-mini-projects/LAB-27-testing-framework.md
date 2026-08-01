# SE Masterclass — LAB-27 — Testing Framework

**Language: TypeScript (Node.js)** — same module as LAB-21–26.

**Prerequisites:** LAB-20 (Dependency Injection — testability was the whole point; this lab builds the framework that actually RUNS those tests). LAB-13 (state machine hooks) foreshadowed this lab's `beforeEach`/`afterEach`.

**What this lab adds:**
- What Jest/Mocha/Vitest actually do underneath — built here from scratch
- Assertions: the boolean core every test ultimately reduces to
- A test collector (`describe`/`it`) and runner that reports pass/fail
- Test isolation: `beforeEach`/`afterEach`, and why tests must not share mutable state
- A minimal mock/spy function — recording calls, exactly like LAB-20's `RecordingFakeEmailSender`, generalized

**Time:** 90–110 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Every testing framework's assertions, no matter how fancy the syntax, ultimately reduce to one boolean question. What is it?
> 2. Test A creates an object and mutates it. Test B, running AFTER test A, expects a FRESH object. What goes wrong if they share the same object instance?
> 3. A "spy" function records that it was called. What's the minimum information it needs to record to be useful for assertions like "called exactly twice, with these arguments"?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `npx ts-node main.ts` prints:

```
=== Assertions: The Boolean Core ===
assertEqual(2 + 2, 4): PASS
assertEqual(2 + 2, 5): FAIL — expected 5, got 4

=== Minimal Test Collector and Runner ===
describe("Calculator")
  it("adds two numbers")
  it("throws on division by zero")
run():
  Calculator > adds two numbers ... PASS
  Calculator > throws on division by zero ... PASS

2 passed, 0 failed

=== A Failing Test, Reported Clearly ===
  Math > 2 + 2 equals 5 ... FAIL
    AssertionError: expected 5, got 4

1 passed, 1 failed

=== Test Isolation: beforeEach Resets State ===
  Counter > starts at 0 ... PASS
  Counter > increments to 1 ... PASS
  Counter > increments to 1 (again, independently) ... PASS
  ← each test got a FRESH counter — none of them saw another test's mutations

=== Without Isolation: The Bug ===
  Counter > test A increments shared counter ... PASS (counter is now 1)
  Counter > test B expects fresh counter ... FAIL
    AssertionError: expected 0, got 1   ← leaked state from test A!

=== Async Test Support ===
  Async > resolves with the right value ... PASS

=== Spy: Recording Calls for Assertions ===
spy called 2 times
spy call 1 args: [ 'hello' ]
spy call 2 args: [ 'world' ]
assertEqual(spy.calls.length, 2): PASS
```

---

### Concept: Every Assertion Is Just a Boolean Question

**What it is:** No matter how expressive a testing framework's syntax looks (`expect(x).toBe(y)`, `assert.equal(x, y)`), every assertion reduces to: "is this condition true? If not, THROW, with a message describing what was expected vs. what actually happened."

**The problem before:** Without a standard way to signal failure, every test would need custom `if`/`console.log` checks, with no consistent way for a RUNNER to know "did this test pass or fail?"

**The solution:**

```ts
function assertEqual(actual: unknown, expected: unknown): void {
  if (actual !== expected) {
    throw new Error(`expected ${expected}, got ${actual}`)   // throwing IS "this test failed"
  }
}
```

A test PASSES if it runs to completion without throwing. A test FAILS if an assertion (or anything else) throws. This is the ENTIRE mechanism — every fancy assertion library is convenience syntax wrapped around exactly this.

**Project Application (The "Why" here):** Every hand-written `assert()` call from LAB-20's testing section, and every "Confirm..." instruction throughout this whole curriculum's labs, has been an informal version of this exact idea.

---

## Step 1 — Build Assertions

```ts
// assert.ts
export class AssertionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AssertionError'
  }
}

export function assertEqual(actual: unknown, expected: unknown): void {
  if (actual !== expected) {
    throw new AssertionError(`expected ${expected}, got ${actual}`)
  }
}

export function assertThrows(fn: () => void): void {
  try {
    fn()
  } catch {
    return                            // threw as expected — assertion passes
  }
  throw new AssertionError('expected function to throw, but it did not')
}
```

```ts
// main.ts
import { assertEqual } from './assert'

console.log('=== Assertions: The Boolean Core ===')
try {
  assertEqual(2 + 2, 4)
  console.log('assertEqual(2 + 2, 4): PASS')
} catch (err) {
  console.log(`assertEqual(2 + 2, 4): FAIL — ${(err as Error).message}`)
}

try {
  assertEqual(2 + 2, 5)
  console.log('assertEqual(2 + 2, 5): PASS')
} catch (err) {
  console.log(`assertEqual(2 + 2, 5): FAIL — ${(err as Error).message}`)
}
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Assertions: The Boolean Core ===
assertEqual(2 + 2, 4): PASS
assertEqual(2 + 2, 5): FAIL — expected 5, got 4
```

---

## Step 2 — A Minimal Test Collector and Runner

Real frameworks let you WRITE `describe`/`it` blocks before anything runs, then execute them all later. This requires COLLECTING tests as data first (LAB-23's Command pattern — an `it()` block is basically a named, deferred command).

```ts
// test-runner.ts
import { AssertionError } from './assert'

interface TestCase {
  suiteName: string
  testName: string
  fn: () => void | Promise<void>
}

const tests: TestCase[] = []          // ← add: the collected test registry — LAB-09's registry idea again
let currentSuite = ''

export function describe(suiteName: string, fn: () => void): void {
  currentSuite = suiteName
  fn()                                  // runs the body NOW — which calls it() below, registering tests
}

export function it(testName: string, fn: () => void | Promise<void>): void {
  tests.push({ suiteName: currentSuite, testName, fn })     // ← add: DEFER execution — just record it for now
}

export async function run(): Promise<void> {
  let passed = 0
  let failed = 0

  for (const test of tests) {
    try {
      await test.fn()                     // ← add: NOW actually execute it
      console.log(`  ${test.suiteName} > ${test.testName} ... PASS`)
      passed++
    } catch (err) {
      console.log(`  ${test.suiteName} > ${test.testName} ... FAIL`)
      if (err instanceof AssertionError) {
        console.log(`    AssertionError: ${err.message}`)
      }
      failed++
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`)
  tests.length = 0                          // reset registry for the next run() call in this lab's demo
}
```

Add to `main.ts`:

```ts
import { describe, it, run } from './test-runner'
import { assertThrows } from './assert'

function add(a: number, b: number) { return a + b }
function divide(a: number, b: number) {
  if (b === 0) throw new Error('division by zero')
  return a / b
}

console.log('\n=== Minimal Test Collector and Runner ===')
describe('Calculator', () => {
  console.log('describe("Calculator")')
  it('adds two numbers', () => {
    console.log('  it("adds two numbers")')
    assertEqual(add(2, 3), 5)
  })
  it('throws on division by zero', () => {
    console.log('  it("throws on division by zero")')
    assertThrows(() => divide(1, 0))
  })
})

console.log('run():')
await run()
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Minimal Test Collector and Runner ===
describe("Calculator")
  it("adds two numbers")
  it("throws on division by zero")
run():
  Calculator > adds two numbers ... PASS
  Calculator > throws on division by zero ... PASS

2 passed, 0 failed
```

**Confirm the TWO-PHASE structure:** Notice `it("adds two numbers")` and `it("throws on division by zero")` print BEFORE `run():` — because `describe`'s body runs IMMEDIATELY (registering tests), but the actual TEST BODIES (the `assertEqual`/`assertThrows` calls) don't run until `run()` is called separately. This separation — collect first, execute later — is EXACTLY LAB-23's Command pattern: `it()` packages "a named test" as data, and `run()` is the invoker that finally executes each one.

---

## Step 3 — A Failing Test, Reported Clearly

```ts
console.log('\n=== A Failing Test, Reported Clearly ===')
describe('Math', () => {
  it('2 + 2 equals 5', () => {
    assertEqual(2 + 2, 5)     // deliberately wrong — to see failure reporting
  })
})
await run()
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== A Failing Test, Reported Clearly ===
  Math > 2 + 2 equals 5 ... FAIL
    AssertionError: expected 5, got 4

1 passed, 1 failed
```

Wait — this should show `0 passed, 1 failed` for THIS specific `run()` call (the counters reset each `run()`). Confirm your actual output matches `0 passed, 1 failed` for this isolated block, since `tests.length = 0` at the end of the PREVIOUS `run()` call cleared the registry.

**Confirm the error message is genuinely useful:** `AssertionError: expected 5, got 4` tells you EXACTLY what was expected and what actually happened — not just "test failed." This is LAB-09's boundary-error-message precision, applied to test output.

---

### Concept: Test Isolation

**What it is:** Tests must not share MUTABLE state — one test's side effects should never be visible to another test. `beforeEach` (running before EVERY test in a suite) is the standard mechanism for guaranteeing each test starts from a known-fresh state.

**The problem before:**

```ts
let counter = 0                    // shared across ALL tests — dangerous
describe('Counter', () => {
  it('test A increments shared counter', () => {
    counter++
    assertEqual(counter, 1)          // passes... but leaves counter = 1 behind
  })
  it('test B expects fresh counter', () => {
    assertEqual(counter, 0)          // FAILS — sees test A's leftover state!
  })
})
```

Test B's PASS/FAIL now depends on whether test A ran first — tests are supposed to be independent and runnable in ANY order (or even in parallel); shared mutable state breaks that guarantee silently.

**The solution:** `beforeEach` resets whatever state each test needs, EVERY time, before that test's body runs — exactly like LAB-20's `RecordingFakeEmailSender` being constructed FRESH for each test that needed one.

---

## Step 4 — beforeEach and True Isolation

```ts
// Add to test-runner.ts:
let beforeEachHooks: (() => void)[] = []

export function beforeEach(fn: () => void): void {
  beforeEachHooks.push(fn)
}

// Modify run() to call all beforeEach hooks before each test:
export async function run(): Promise<void> {
  let passed = 0
  let failed = 0

  for (const test of tests) {
    for (const hook of beforeEachHooks) hook()      // ← add: fresh state, EVERY test, no exceptions
    try {
      await test.fn()
      console.log(`  ${test.suiteName} > ${test.testName} ... PASS`)
      passed++
    } catch (err) {
      console.log(`  ${test.suiteName} > ${test.testName} ... FAIL`)
      if (err instanceof AssertionError) console.log(`    AssertionError: ${err.message}`)
      failed++
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`)
  tests.length = 0
  beforeEachHooks = []
}
```

Add to `main.ts`:

```ts
console.log('\n=== Test Isolation: beforeEach Resets State ===')
let isolatedCounter: { value: number }

describe('Counter', () => {
  beforeEach(() => {
    isolatedCounter = { value: 0 }     // ← add: BRAND NEW object, every single test
  })
  it('starts at 0', () => {
    assertEqual(isolatedCounter.value, 0)
  })
  it('increments to 1', () => {
    isolatedCounter.value++
    assertEqual(isolatedCounter.value, 1)
  })
  it('increments to 1 (again, independently)', () => {
    isolatedCounter.value++            // if this saw the PREVIOUS test's counter, it would be 2, not 1
    assertEqual(isolatedCounter.value, 1)
  })
})
await run()
console.log('  ← each test got a FRESH counter — none of them saw another test\'s mutations')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Test Isolation: beforeEach Resets State ===
  Counter > starts at 0 ... PASS
  Counter > increments to 1 ... PASS
  Counter > increments to 1 (again, independently) ... PASS

3 passed, 0 failed
  ← each test got a FRESH counter — none of them saw another test's mutations
```

**Confirm the third test PROVES isolation, not just convenience:** If `beforeEach` were NOT resetting `isolatedCounter`, the third test would see `value = 1` already (from the second test), increment it to `2`, and FAIL its `assertEqual(isolatedCounter.value, 1)` check. It passing confirms the reset genuinely happened.

Now demonstrate the BUG directly, without `beforeEach`:

```ts
console.log('\n=== Without Isolation: The Bug ===')
let sharedCounter = { value: 0 }
describe('Counter', () => {
  it('test A increments shared counter', () => {
    sharedCounter.value++
    assertEqual(sharedCounter.value, 1)
  })
  it('test B expects fresh counter', () => {
    assertEqual(sharedCounter.value, 0)     // fails — sees test A's leftover mutation
  })
})
await run()
console.log(`  (counter is now ${sharedCounter.value} — test A's mutation leaked into test B)`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Without Isolation: The Bug ===
  Counter > test A increments shared counter ... PASS
  Counter > test B expects fresh counter ... FAIL
    AssertionError: expected 0, got 1

1 passed, 1 failed
  (counter is now 1 — test A's mutation leaked into test B)
```

---

## Step 5 — Async Test Support

```ts
console.log('\n=== Async Test Support ===')
function delayedValue<T>(value: T, ms: number): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

describe('Async', () => {
  it('resolves with the right value', async () => {
    const result = await delayedValue(42, 10)
    assertEqual(result, 42)
  })
})
await run()
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Async Test Support ===
  Async > resolves with the right value ... PASS

1 passed, 0 failed
```

**Confirm why `run()`'s `await test.fn()` (Step 2) was necessary from the start:** Without `await` in front of `test.fn()`, an ASYNC test's promise would still be pending when `run()` moves on to report PASS/FAIL — the test might not have actually finished (or even failed) yet. `await`ing each test's result, one at a time, guarantees the runner waits for the real outcome before reporting it — this is why `run()` itself had to be declared `async` back in Step 2, even though the FIRST tests you wrote were all synchronous.

---

## 🎯 Challenge: A Minimal Spy Function

**You know:** LAB-20's `RecordingFakeEmailSender` recorded calls for later assertions. A "spy" generalizes that idea to wrap ANY function.

**Task:** Write `createSpy()` that returns a function which, when called, records its arguments — and exposes a `.calls` array so tests can assert on how it was used.

<details>
<summary>▶ Show Solution</summary>

```ts
interface Spy {
  (...args: unknown[]): void
  calls: unknown[][]
}

function createSpy(): Spy {
  const calls: unknown[][] = []
  const spy = ((...args: unknown[]) => {
    calls.push(args)                    // record EVERY call's arguments
  }) as Spy
  spy.calls = calls
  return spy
}
```

**Key insight:** A spy is a CLOSURE (LAB-02) — `calls` lives in the outer scope, captured by the returned function, exactly like LAB-02's `make_counter`'s private `count`. This is the SAME shape as LAB-20's `RecordingFakeEmailSender.calls`, generalized from "a class with one specific method" to "wrap ANY function signature" — real mocking libraries (Jest's `jest.fn()`, Sinon) are elaborate versions of exactly this closure trick.

</details>

Add to `main.ts`:

```ts
console.log('\n=== Spy: Recording Calls for Assertions ===')
const spy = createSpy()
spy('hello')
spy('world')

console.log(`spy called ${spy.calls.length} times`)
spy.calls.forEach((args, i) => console.log(`spy call ${i + 1} args:`, args))

try {
  assertEqual(spy.calls.length, 2)
  console.log('assertEqual(spy.calls.length, 2): PASS')
} catch (err) {
  console.log(`assertEqual(spy.calls.length, 2): FAIL — ${(err as Error).message}`)
}
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Spy: Recording Calls for Assertions ===
spy called 2 times
spy call 1 args: [ 'hello' ]
spy call 2 args: [ 'world' ]
assertEqual(spy.calls.length, 2): PASS
```

---

## Mental Model: Where This Shows Up

| Real tool | This lab's equivalent |
|---|---|
| Jest, Mocha, Vitest | `describe`/`it`/`run` — the exact same collect-then-execute shape |
| `expect(x).toBe(y)` | `assertEqual` |
| `jest.fn()` / Sinon spies | `createSpy()` |
| `beforeEach`/`afterEach` | This lab's `beforeEach` |
| CI pipelines (LAB-9.3 in engineering-drills) | `run()`'s exit behavior (pass/fail counts) is what a CI system checks to decide "can this merge?" |

---

## Final Check

| Feature | How to verify |
|---|---|
| `assertEqual` throws with a clear message on mismatch, passes silently on match | Step 1 |
| `describe`/`it` COLLECT tests without running them; `run()` executes and reports them | Step 2 |
| A failing test reports the exact expected vs. actual values | Step 3 |
| `beforeEach` gives every test a FRESH, independent state | Step 4 |
| Without `beforeEach`, shared state visibly leaks between tests | Step 4 |
| An `async` test correctly awaits before reporting pass/fail | Step 5 |
| `createSpy()` correctly records call arguments for later assertions | Challenge |

---

## Quick Check Answers

**1. What's the one boolean question every assertion reduces to?**

"Is this condition true — and if not, THROW." `assertEqual(actual, expected)` is really just `if (actual !== expected) throw ...` with a nicely formatted message; `assertThrows` inverts it slightly ("did this function throw as expected?") but the mechanism is identical: a test PASSES if it runs to completion without throwing, and FAILS the instant anything inside it throws — every assertion, however elaborate its syntax, exists only to decide WHEN to throw.

**2. Shared object mutated by test A, test B expects fresh — what goes wrong?**

Test B's outcome now depends on whether test A ran first (and whether it ran at all) — demonstrated directly in Step 4's "Without Isolation" section, where `sharedCounter.value` was `1` (left over from test A) when test B expected `0`, causing a failure that has NOTHING to do with test B's own logic being wrong. This breaks a fundamental testing guarantee: tests should be runnable in any order, or even in isolation, and produce the SAME result every time — shared mutable state destroys that guarantee silently, often passing in CI by coincidence of run order and then failing unpredictably later.

**3. Minimum information a spy needs to record?**

The ARGUMENTS of each call, in order — `Step 6`'s `calls: unknown[][]` (an array of argument-arrays, one per call) is the minimum needed to answer questions like "was it called?", "how many times?", and "with what arguments, each time?" A more elaborate spy might also record the RETURN VALUE or `this` context of each call, but arguments alone already support the most common assertions ("called exactly twice, with these specific values") that Step 6's Challenge demonstrated.

---

*Next: [LAB-28 — Logging System](LAB-28-logging-system.md) — TypeScript, same module*
