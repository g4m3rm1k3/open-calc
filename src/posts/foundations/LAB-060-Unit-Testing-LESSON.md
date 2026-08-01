# FOUNDATIONS — LAB-060 — Unit Testing Fundamentals

**Series:** FOUNDATIONS — Part X: Testing
**Environment:** Browser DevTools console (no build step needed) or Node.js
**Time:** 45–60 minutes.

---

## What You Will Build

Three unit tests for the `calculateTax` pure function from LAB-059, written using the Arrange-Act-Assert pattern, with one test made to fail intentionally before fixing the function. After this lab you will understand what a unit test is, how to structure one, and why a failing test before a fix is as important as a passing test after it.

---

## What You Need to Know First

**From LAB-019 (Pure Functions):** Unit tests are easiest to write for pure functions — given the same input, the output is deterministic. No setup, no teardown, no mocking.

**From LAB-059 (Refactoring):** `calculateTax` was extracted in the last lesson because it has a single clear job. A function with one job is easy to test — there is only one behavior to verify.

---

> **Quick Check — try to answer before reading:**
>
> 1. What does "unit" mean in unit test? What is the unit being tested?
> 2. What is the Arrange-Act-Assert pattern?
> 3. Why is a failing test before the fix as important as a passing test after?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — What a Test Is: A Function That Asserts

A test is a function that:
1. Sets up some input (Arrange)
2. Calls the code under test with that input (Act)
3. Asserts that the result matches the expected value (Assert)

If the assertion passes, the test passes. If it fails, the test throws — the framework catches the throw and reports a failure with the expected and actual values.

A minimal assertion function — no framework needed:

```typescript
function assertEqual<T>(actual: T, expected: T, testName: string): void {
  if (actual !== expected) {
    throw new Error(
      `FAIL: ${testName}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`
    );
  }
  console.log(`PASS: ${testName}`);
}
```

**The walkthrough:** `assertEqual` takes the actual value (what the code produced), the expected value (what it should have produced), and a test name for the error message. If they are not strictly equal (`!==`), it throws an `Error` with a message that shows both values. If they are equal, it logs `PASS`. This is how every testing framework works internally — the only difference is that real frameworks also track counts, format output, and handle async.

**The CS lens — assertions as executable specifications.** An assertion is a claim: "this must be true." A test file is a collection of claims about the behavior of code. The claims are executable — they run and produce a pass/fail result. This makes tests the most reliable form of documentation: they cannot become stale because they are run on every build.

**The SE lens — tests as a safety net.** A test suite is the net that catches regressions — bugs introduced when changing existing code. Without a net, every change is a leap of faith. With a net, the developer knows immediately (in seconds) if they broke something.

---

### Step 2 — The Function Under Test

```typescript
function calculateTax(discountedTotal: number, region: string): number {
  if (region === 'CA') return discountedTotal * 0.0725;
  if (region === 'NY') return discountedTotal * 0.08;
  return discountedTotal * 0.06;
}
```

This function has three branches — three behaviors to verify. A complete test suite covers all three.

---

### Step 3 — Writing Three Tests (Arrange-Act-Assert)

```typescript
// Test 1: California tax rate
function test_calculateTax_california(): void {
  // Arrange — set up the inputs:
  const discountedTotal = 100;
  const region          = 'CA';

  // Act — call the code under test:
  const actualTax = calculateTax(discountedTotal, region);

  // Assert — verify the output:
  assertEqual(actualTax, 7.25, 'calculateTax: CA rate is 7.25%');
}

// Test 2: New York tax rate
function test_calculateTax_newYork(): void {
  const discountedTotal = 100;
  const region          = 'NY';
  const actualTax       = calculateTax(discountedTotal, region);
  assertEqual(actualTax, 8.00, 'calculateTax: NY rate is 8%');
}

// Test 3: Default tax rate (any other region)
function test_calculateTax_default(): void {
  const discountedTotal = 100;
  const region          = 'TX';  // not CA or NY — falls through to default
  const actualTax       = calculateTax(discountedTotal, region);
  assertEqual(actualTax, 6.00, 'calculateTax: default rate is 6%');
}

// Run all tests:
test_calculateTax_california();
test_calculateTax_newYork();
test_calculateTax_default();
```

**The walkthrough:** Each test follows the same structure. Arrange sets up the two inputs. Act calls `calculateTax`. Assert compares the result to the expected value. For `CA` with a `100` total: `100 * 0.0725 = 7.25`. For `NY`: `100 * 0.08 = 8.00`. For `TX`: `100 * 0.06 = 6.00`. All three tests pass against the correct implementation.

**The CS lens — branch coverage.** `calculateTax` has three branches (CA, NY, other). The three tests collectively exercise all three branches — this is called full branch coverage. Untested branches are code that could be silently wrong.

**The SE lens — tests as specification.** Reading the three tests tells you exactly what `calculateTax` does: CA rate is 7.25%, NY is 8%, everything else is 6%. The tests are a specification that is more reliable than a comment, because comments are not executed.

---

### Step 4 — A Failing Test Before the Fix

Introduce a bug and see the test catch it:

```typescript
// Buggy version: California rate is wrong
function calculateTaxBuggy(discountedTotal: number, region: string): number {
  if (region === 'CA') return discountedTotal * 0.725;  // BUG: 10× too large
  if (region === 'NY') return discountedTotal * 0.08;
  return discountedTotal * 0.06;
}

// Run the CA test against the buggy version:
function test_buggy_california(): void {
  const actualTax = calculateTaxBuggy(100, 'CA');
  // expected: 7.25, actual: 72.5 — this will FAIL:
  assertEqual(actualTax, 7.25, 'calculateTaxBuggy: CA rate is 7.25%');
}

test_buggy_california();
// Output: FAIL: calculateTaxBuggy: CA rate is 7.25%
//   expected: 7.25
//   actual:   72.5
```

**The walkthrough:** The test fails and shows both values. The developer sees `expected: 7.25, actual: 72.5` and immediately knows the rate is 10 times too large. The fix is changing `0.725` to `0.0725`. The test is run again and passes. This cycle — red (fail), green (pass) — is the heartbeat of test-driven development (LAB-061).

**The CS lens — regression prevention.** Once the test exists, it runs on every future change. If someone later accidentally changes `0.0725` to `0.725` again, the test fails immediately. The test is a permanent regression guard.

---

### Step 5 — Testing Edge Cases

Edge cases are inputs at the boundaries of normal behavior:

```typescript
// Edge case 1: zero total — tax should be zero
function test_calculateTax_zeroTotal(): void {
  assertEqual(calculateTax(0, 'CA'), 0, 'calculateTax: zero total produces zero tax');
}

// Edge case 2: unknown region falls to default
function test_calculateTax_unknownRegion(): void {
  assertEqual(calculateTax(100, 'ZZ'), 6.00, 'calculateTax: unknown region uses default 6%');
}

// Edge case 3: negative total — behavior is defined by the math, not a guard
function test_calculateTax_negativeTotal(): void {
  // For a refund of $100, the tax is also negative (refund of tax):
  assertEqual(calculateTax(-100, 'CA'), -7.25, 'calculateTax: negative total produces negative tax');
}

test_calculateTax_zeroTotal();
test_calculateTax_unknownRegion();
test_calculateTax_negativeTotal();
```

**The walkthrough:** Each edge case tests a boundary. Zero produces zero (the function is pure math — no special case needed). An unknown region code falls to the default — the test documents this. A negative total produces negative tax — the function handles it correctly by the math, which the test confirms.

---

## Connect the Pieces

- **Vitest and Jest** are JavaScript/TypeScript testing frameworks. They provide `describe()` to group tests, `it()` or `test()` to define a test, and `expect(actual).toBe(expected)` as the assertion. They are more sophisticated versions of the `assertEqual` function above.
- **Test runners in CI/CD.** Every professional project runs the test suite on every push to the repository. If any test fails, the push is rejected. This is how teams prevent broken code from reaching production.
- **Python's `unittest` and `pytest`** use the same pattern: arrange, act, assert. The pattern transcends the language and the framework.

---

## What Breaks Without This

**The confident incorrect refactor:**

A developer refactors `calculateTax` to use a lookup table instead of `if/else`. They are confident the behavior is identical. They are wrong — the lookup key for `CA` is `'ca'` (lowercase) in the table but `'CA'` (uppercase) in the input. Without tests, this ships. Every California order returns the default rate. Revenue is understated. The bug is caught in a quarterly audit, not in a test run.

With tests, the CA test fails immediately when the case sensitivity bug is introduced.

---

## Definition of Done

- [ ] `assertEqual` is implemented and throws on mismatch with a message showing expected and actual
- [ ] Three tests cover the CA, NY, and default branches of `calculateTax`
- [ ] All three tests pass against the correct implementation
- [ ] The buggy implementation causes the CA test to fail with a clear message
- [ ] Two edge case tests exist: zero total and unknown region

**Git commit:**

```
git add src/
git commit -m "LAB-060: Unit testing fundamentals — assertEqual, three branch tests, and edge cases for calculateTax; failing test against buggy version demonstrated"
```

---

## Quick Check Answers

1. **The "unit" is the smallest piece of code that has a distinct behavior — typically a single function or method.** A unit test verifies that unit in isolation, with no dependence on external systems (database, network, file system).
2. **Arrange-Act-Assert is a three-phase structure for a test:** (1) Arrange: set up inputs and initial state, (2) Act: call the code under test, (3) Assert: verify the output matches the expected value. Every test has these three phases, even if they are not labeled.
3. **A failing test before the fix proves the test is actually testing the thing you think it is.** If you only see the test pass (after the fix), you cannot know whether it would have caught the bug. The red phase confirms the test is sensitive to the bug. The green phase confirms the fix resolved it.
