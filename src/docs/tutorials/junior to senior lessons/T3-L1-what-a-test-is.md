# Junior to Senior — T3·L1 — What a Test Is

**Prerequisites:** T2·L7 (Architecture Comparison). You can structure a codebase.
This lesson begins Topic 3 — TDD and Clean Testing. Before writing any test framework
code, this lesson builds the mental model for what tests are and why they exist.

**What this lab adds:**
- Tests as executable specifications — the precise definition
- The cost of bugs found at different stages
- The difference between testing and debugging
- Setting up Vitest (TypeScript) for the first time
- Your first test for the contacts validation logic

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A test passes. Does that prove the code is correct?
> 2. 100% test coverage — what does this guarantee? What does it NOT guarantee?
> 3. You write the test AFTER the code. The test passes immediately. What did
>    you NOT verify?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Your first test suite for the contacts validation logic:

```
$ npx vitest run

✓ validateContact > returns valid for a complete, correct contact
✓ validateContact > returns invalid with an error for an empty name
✓ validateContact > returns invalid with an error for a malformed email
✓ validateContact > returns invalid with an error for an empty city
✓ validateContact > accumulates ALL errors — does not stop at the first

Test Files  1 passed (1)
Tests       5 passed (5)
Duration    12ms
```

---

### Concept: Tests as Executable Specifications

**What it is:** A test is an executable specification. Not documentation (which can
go out of date). Not a type annotation (which describes shape, not behaviour). A test
is code that runs and verifies that the program does what it claims to do — right now,
with the current version of the code.

**The problem before (comments as documentation):**

```ts
/**
 * Validates a contact.
 * @param contact - the contact to validate
 * @returns true if valid, false otherwise
 */
function validateContact(contact: unknown): boolean {
  // Implementation changed three times since this comment was written.
  // The comment still says "returns true/false" but the function now returns
  // { valid: boolean; errors: Error[] }.
  // The comment lied.
}
```

Comments can be wrong. The function changed; nobody updated the comment. Code that
RUNS can never lie about its current behaviour — if the test passes, the behaviour
is exactly what the test describes.

**The solution:**

```ts
// The test is the documentation — it cannot lie because it runs:
test('returns a valid result for a complete contact', () => {
  const result = validateContact({ name: 'Alice', email: 'alice@e.com', city: 'London' });
  expect(result.valid).toBe(true);
  expect(result.errors).toHaveLength(0);
  // If the function returns boolean instead of an object, this test fails.
  // The test and the implementation are always in sync.
});
```

**What it hides:** The difference between intent and reality. A test forces the two
into alignment — if the code drifts from the specification, the test fails immediately.

The invariant a test protects: "this function behaves this way, and any future change
that breaks this behaviour is detected instantly."

**Canonical example:** A building code inspection. The code (spec) says "the beam
must support 500kg." The inspection (test) applies 500kg and verifies the beam holds.
The inspection cannot lie — either the beam held or it didn't. A comment on the
blueprint saying "this beam is strong" is not an inspection.

**Project Application:** In the contacts tool, `validateContact` is the core business
rule. A test for it runs in milliseconds and tells you immediately if any change broke
the validation. Without the test, you'd have to manually test every scenario after
every change.

**Smallest possible example:**

```ts
// The specification: "add returns the sum of two numbers"
test('add returns the sum', () => {
  expect(add(2, 3)).toBe(5);   // runs, cannot lie
});

// A comment can only describe: "add returns the sum of two numbers"
// The comment cannot verify it.
```

**Why it matters here:** The contacts validation has five rules. Without tests,
every change to the validation function requires manually testing all five rules
every time. With tests, the five rules run in 12ms automatically.

**You will see this again in:**
- Every professional codebase has a test suite — it is the industry standard
- Open-source projects often have 100,000+ tests
- CI/CD pipelines run the test suite on every commit
- Standard interview question: "How do you ensure code quality?" — "We write tests"

**Watch for:** A test that always passes is not a test. If you can delete the
implementation and the test still passes, the test is broken. A test must fail
when the code is wrong and pass when the code is correct.

---

### Concept: The Cost Curve of Bugs

**What it is:** The cost of fixing a bug multiplies by approximately 10x at each
stage of discovery.

| Stage | Cost | Example |
|---|---|---|
| While writing | Minutes | You catch it typing — fix immediately |
| In a test | Minutes to hours | Red test, read the error, fix the code |
| In code review | Hours | Reviewer flags it, discussion, fix, re-review |
| In QA | Days | QA reports, developer reproduces, fixes, re-tests |
| In production | Days to weeks | User reports, developer reproduces (harder), fixes, deploys, monitors |

**The problem before (no tests):**

```
Developer finishes the validation function on Monday.
QA finds a bug on Friday (4 days later).
Developer spends 2 hours reproducing, 2 hours debugging, 1 hour fixing, 1 hour re-testing.
Total: 6 hours.

vs

Developer writes a test Monday, catches the bug in 10 minutes.
Total: 10 minutes.
```

**What it hides:** The hidden cost of "I'll test it manually." Manual testing is
slow (minutes per case), unreliable (you skip edge cases), and non-repeatable (you
have to do it again after every change).

**Canonical example:** Fixing a typo in a letter. Found it yourself before printing: 5 seconds.
Found by the printer after 500 copies: you reprint 500 copies. Found by 500 recipients after
delivery: you apologise, reprint, and resend. Same typo — completely different cost.

**Project Application:** The contacts validation runs on every API request. A bug in
production means invalid data corrupts the database. Tests catch it before production.

**You will see this again in:**
- Every argument for TDD references this cost curve
- Joel Spolsky's "The Joel Test" — question 2: "Do you make daily builds?" (= automated testing)
- DevOps: "shift left" means catching problems earlier in the pipeline (closer to the developer)

**Watch for:** The cost curve assumes bugs are found in the same phase as testing.
A test that only runs once a week does not catch bugs in minutes — it catches them
in days. The value comes from running tests constantly (on every save, every commit).

---

## Step 1 — Set Up Vitest

Create a new project:

```bash
mkdir contact-tests
cd contact-tests
npm init -y
npm install -D vitest typescript @types/node
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target":            "ES2020",
    "module":            "ESNext",
    "moduleResolution":  "bundler",
    "strict":            true,
    "esModuleInterop":   true
  }
}
```

Add to `package.json` (the scripts and type sections):

```json
{
  "type": "module",
  "scripts": {
    "test":       "vitest run",
    "test:watch": "vitest"
  }
}
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
No test files found, exiting with code 1
```

This is correct — Vitest is installed but has no test files yet. The `code 1` exit means
"no tests found." In the next step you create a test and this error goes away.

**In the terminal, type:**

```bash
npx vitest --version
```

**Expected:** A version number (e.g., `1.x.x`). This confirms Vitest is installed correctly.

---

## Step 2 — Create the Validation Function

Create `src/validate-contact.ts`:

```ts
interface ContactInput {
  name:  string;
  email: string;
  city:  string;
}

interface ValidationError {
  field:   string;
  message: string;
}

interface ValidationResult {
  valid:  boolean;
  errors: ValidationError[];
}

export function validateContact(input: ContactInput): ValidationResult {
  const errors: ValidationError[] = [];

  if (!input.name.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  }
  if (!input.email.includes('@') || !input.email.includes('.')) {
    errors.push({ field: 'email', message: 'Email must be a valid address' });
  }
  if (!input.city.trim()) {
    errors.push({ field: 'city', message: 'City is required' });
  }

  return { valid: errors.length === 0, errors };
}
```

### SAVE AND TRY

```bash
npx tsx src/validate-contact.ts 2>/dev/null || echo "file exists — no entry point needed"
```

Or simply verify it compiles:

```bash
npx tsc --noEmit src/validate-contact.ts --allowImportingTsExtensions 2>&1 || echo "no type errors"
```

Expected: no errors. The file exists and is syntactically valid TypeScript.

---

## Step 3 — Write the First Tests

Create `src/validate-contact.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { validateContact }       from './validate-contact';

describe('validateContact', () => {

  it('returns valid for a complete, correct contact', () => {
    // Arrange — a contact with all required fields:
    const input = { name: 'Alice', email: 'alice@example.com', city: 'London' };

    // Act — run the validation:
    const result = validateContact(input);

    // Assert — check both aspects of a valid result:
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns invalid with an error for an empty name', () => {
    const result = validateContact({ name: '', email: 'alice@e.com', city: 'London' });

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'name' })
    );
  });

  it('returns invalid with an error for a malformed email', () => {
    const result = validateContact({ name: 'Alice', email: 'not-an-email', city: 'London' });

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'email' })
    );
  });

  it('returns invalid with an error for an empty city', () => {
    const result = validateContact({ name: 'Alice', email: 'alice@e.com', city: '' });

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'city' })
    );
  });

  it('accumulates ALL errors — does not stop at the first', () => {
    // All three fields are invalid:
    const result = validateContact({ name: '', email: 'bad', city: '' });

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(3);  // all three errors present

    const fields = result.errors.map(e => e.field);
    expect(fields).toContain('name');
    expect(fields).toContain('email');
    expect(fields).toContain('city');
  });

});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
✓ src/validate-contact.test.ts (5)
  ✓ validateContact > returns valid for a complete, correct contact
  ✓ validateContact > returns invalid with an error for an empty name
  ✓ validateContact > returns invalid with an error for a malformed email
  ✓ validateContact > returns invalid with an error for an empty city
  ✓ validateContact > accumulates ALL errors — does not stop at the first

Test Files  1 passed (1)
Tests       5 passed (5)
Duration    ~12ms
```

**In the terminal, to see the test output in watch mode:**

```bash
npm run test:watch
```

**Change something:** Remove the `!input.city.trim()` check from `validateContact`.
Expected: the `'returns invalid with an error for an empty city'` test fails.
The error message names exactly which behaviour broke. Restore the check.

---

### Concept: Test Coverage — What It Measures and What It Does Not

**What it is:** Test coverage measures what percentage of code lines are executed
by the test suite.

**What 100% coverage guarantees:**
- Every line of code executes at least once during the tests
- No dead code (unreachable lines) exists

**What 100% coverage does NOT guarantee:**
- That the code is correct
- That all edge cases are handled
- That the behaviour matches the specification

**The problem — coverage can be gamed:**

```ts
// Function with a hidden bug — achieves 100% coverage with one test:
function divide(a: number, b: number): number {
  return a / b;  // 100% coverage with divide(4, 2) — never tests divide(1, 0)
}

test('divides correctly', () => {
  expect(divide(4, 2)).toBe(2);  // passes — 100% coverage!
  // But divide(1, 0) returns Infinity — the bug is untested
});
```

**What it hides:** Coverage hides the difference between "ran" and "tested correctly."
A test that calls every line but checks nothing can achieve 100% coverage with zero
useful assertions.

**Canonical example:** A fire alarm test. "We activated the alarm" (100% coverage —
every component ran). But did we check that the alarm actually sounded? Did we check it
alerted the fire station? Coverage measures activation, not verification.

**Project Application:** In the contacts tool, running all five tests covers ~90% of
`validateContact`. But coverage does not tell us whether the edge cases (null email,
whitespace name) are handled correctly — only targeted tests verify that.

**The rule:** Coverage is a floor, not a ceiling. 80% coverage probably means 20%
of your code runs untested. 100% coverage says every line ran — it does not say
every behaviour was verified.

**Smallest possible example:**

```ts
// 100% coverage — but does this test the right thing?
test('add runs', () => {
  add(1, 2);   // no expect! Coverage counts this as "covered"
});
```

**You will see this again in:**
- CI pipelines often enforce a coverage threshold (e.g., "90% minimum")
- Coverage thresholds are a useful floor but insufficient on their own
- The phrase "100% coverage but still has bugs" is a common criticism of coverage-only metrics

**Watch for:** Coverage that includes test files themselves. Some configurations
report coverage including the test files, which artificially inflates the number.
Always measure coverage on source files only.

---

## Step 4 — Add Edge Case Tests

```ts
// Add to the describe block in validate-contact.test.ts:

it('trims whitespace before validating — name with only spaces fails', () => {
  const result = validateContact({ name: '   ', email: 'a@b.com', city: 'London' });
  expect(result.valid).toBe(false);
});

it('accepts email with subdomain', () => {
  const result = validateContact({ name: 'Alice', email: 'alice@mail.example.com', city: 'London' });
  expect(result.valid).toBe(true);
});

it('rejects email with @ but no domain extension', () => {
  // This test EXPOSES a bug: the current condition uses || not &&
  // Spot the bug: "includes('@') || includes('.')" accepts alice@nodot
  // because '@' is present and the || short-circuits.
  const result = validateContact({ name: 'Alice', email: 'alice@nodot', city: 'London' });
  expect(result.valid).toBe(false);
});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:** The `'rejects email with @ but no domain extension'` test FAILS:

```
× validateContact > rejects email with @ but no domain extension
  AssertionError: expected false to be false
```

This is a real bug in `validateContact`. The condition `!email.includes('@') || !email.includes('.')` 
is wrong — it should be `&&`. Fix it:

```ts
if (!input.email.includes('@') && !input.email.includes('.')) {   // ← was ||, now &&
```

Wait — this is ALSO wrong. The correct check is: email must include BOTH `@` AND `.`.
The correct condition:

```ts
if (!(input.email.includes('@') && input.email.includes('.'))) {  // ← correct
```

Re-run tests. **All 8 should now pass.**

**This is the power of edge case tests:** They found a real bug that the original
5 tests missed.

---

## 🎯 Challenge: Test the `validateCity` Function

**You know:** Vitest setup, Arrange/Act/Assert, writing tests for validation functions.

**Task:** Add a `validateCity` function to `validate-contact.ts` with these rules:
- City must not be empty
- City must contain only letters, spaces, and hyphens (`-`)
- City must be at least 2 characters long

Write tests FIRST (they will fail). Then implement the function to make them pass.

**Requirements:**
- At least 5 tests: valid city, empty city, city with numbers, too-short city, city with hyphen
- Test names are sentences describing the expected behaviour

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

**Tests first (all fail initially):**
```ts
describe('validateCity', () => {
  it('accepts a valid city name', () => {
    expect(validateCity('London')).toEqual({ valid: true, error: null });
  });

  it('rejects an empty city', () => {
    const result = validateCity('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });

  it('rejects a city with numbers', () => {
    const result = validateCity('Lond0n');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('characters');
  });

  it('rejects a city that is too short', () => {
    const result = validateCity('A');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('2');
  });

  it('accepts a hyphenated city name', () => {
    expect(validateCity('San-Francisco')).toEqual({ valid: true, error: null });
  });
});
```

**Implementation (written after tests fail):**
```ts
export function validateCity(city: string): { valid: boolean; error: string | null } {
  if (!city.trim()) {
    return { valid: false, error: 'City is required' };
  }
  if (city.trim().length < 2) {
    return { valid: false, error: 'City must be at least 2 characters' };
  }
  if (!/^[a-zA-Z\s\-]+$/.test(city.trim())) {
    return { valid: false, error: 'City may only contain letters, spaces, and hyphens' };
  }
  return { valid: true, error: null };
}
```

**Key insight:** The tests were written before the implementation — the Red step.
When `validateCity` did not exist, all tests failed with `TypeError: validateCity is not a function`.
Writing the tests first forced thinking about the interface (what does `validateCity` return?)
before the implementation (how does it work?).

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Vitest runs | `npm test` | All tests pass |
| Test names are sentences | Read the test names | Describe behaviour, not code |
| Broken code fails tests | Remove city validation | One test fails |
| Fixed code passes | Restore the validation | All tests pass |
| Edge case test | Email with @ but no . | Catches the `&&` vs `||` bug |

---

## Quick Check Answers

**1. A test passes — does that prove the code is correct?**

No. A passing test proves that the code behaves correctly for the specific inputs
provided in that test. It says nothing about inputs not covered by the test. A test
for `divide(4, 2) === 2` passes with a correct implementation but also passes with
`return 2` (hardcoded). Tests increase confidence proportionally to how well they
cover the specification. No finite test suite can prove correctness for all possible inputs.

**2. What does 100% test coverage guarantee? What does it NOT guarantee?**

100% coverage guarantees that every line of code executed at least once during
the test run. It does NOT guarantee the code is correct, that all edge cases are
handled, that the code handles invalid inputs gracefully, or that the behaviour
matches the specification. It is possible to have 100% coverage with tests that
make no assertions at all — they just run every line without checking any output.

**3. You write the test after the code — the test passes immediately. What did you NOT verify?**

You did not verify that the test can fail — which means you cannot trust that it
will catch a real bug. A test that never fails may: have a wrong assertion that
always passes, not test the right behaviour, or test a part of the code that can
never be broken. In TDD, the test must be seen to fail before you write the
implementation. If you write the test after the code and it passes immediately,
you missed the Red step — you cannot know whether the test would catch a regression
if the code changed.
