# Junior to Senior — T3·L4 — Test Naming

**Prerequisites:** T3·L3 (Red / Green / Refactor). You can write tests test-first.
This lesson covers the one thing that separates a useful test suite from a cryptic
one: naming tests so that failures explain themselves without reading the code.

**What this lab adds:**
- What a test name is for: the failure message in CI, not a label in the file
- The sentence naming pattern: `[subject] [condition] [expected outcome]`
- Naming the scenario, not the function
- Grouping tests with `describe` to build a hierarchy of names
- What bad names cost you at 2am when production is down

**Time:** 30–45 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Your CI pipeline shows: `FAIL: test1`. What do you know?
> 2. Your CI pipeline shows: `FAIL: returns false when the email has no @ symbol`.
>    What do you know?
> 3. A test is named `testEmailValidation`. What is wrong with that name?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A test file where every failing test produces a self-explanatory CI message:

```
FAIL: validateEmail > accepts a standard email address
FAIL: validateEmail > rejects an address with no @ symbol
FAIL: validateEmail > rejects an address with no domain extension
FAIL: validateEmail > rejects an empty string
FAIL: validateEmail > rejects an address with spaces
```

Reading these five lines tells you exactly what is broken, for whom, and why —
no code reading required.

---

### Concept: The Test Name Is a Failure Message

**What it is:** A test name appears in three places: (1) the CI pipeline failure
report, (2) the test runner output when run locally, (3) the test file itself
when someone reads it. All three audiences need the same thing: exactly what should
have happened.

**The problem before — uninformative names:**

```ts
test('test1', () => { ... });                    // "test1 failed" — useless
test('emailTest', () => { ... });                // "emailTest failed" — useless
test('testEmailValidation', () => { ... });      // "testEmailValidation failed" — useless
it('validates correctly', () => { ... });        // "validates correctly failed" — contradictory
it('should work', () => { ... });                // "should work failed" — of course it should
```

All of these give you the same information when they fail: something is broken.
You still have to open the file to find out what.

**The solution — the failure message IS the test name:**

```ts
it('rejects an email address with no @ symbol', () => { ... });
it('accepts a standard name@domain.ext address', () => { ... });
it('rejects an empty string', () => { ... });
```

**What it hides:** The investigation step. When you read a test name that says exactly
what happened, you know where to look and what to fix before opening a single file.

**Canonical example:** A fire alarm labelled "ALARM" vs one labelled "FIRE IN ROOM 204."
Both tell you something is wrong. Only one tells you what to do about it. At 3am in
production, you need the second kind.

**Project Application:** When the contacts validation breaks in production, the CI
message `'returns invalid when email is missing @'` tells the on-call engineer exactly
which validation rule was broken — before they look at any logs.

**Smallest possible example:**

```ts
// Bad — 30 seconds minimum to understand:
it('test3', () => { ... });

// Good — 0 seconds to understand:
it('returns 0 when the cart is below the minimum threshold', () => { ... });
```

**Why it matters here:** A test suite for the contacts validation will grow to 20+ tests.
At that scale, opaque names become a liability — every failure requires reading the test body.

**You will see this again in:**
- Open-source libraries: pytest, Jest, Mocha — all display test names in CI output
- Company dashboards that track "which tests are flaky" use test names as identifiers
- Code review comments: "this test name doesn't describe the expected behaviour"
- Standard interview question: "What makes a good test name?"

**Watch for:** Names starting with "should." `'should return false'` always sounds right —
"this test should do X" is trivially true for any test. Drop "should." Present tense:
`'returns false when...'`.

---

### Concept: The Naming Pattern

**What it is:** `[subject] [condition] [expected outcome]`

Or in plain English: describe what the thing does when given a specific input.

```ts
// Pattern applied:
it('returns 0 when the cart total is below the threshold', ...)
//  ↑ outcome  ↑ condition

it('throws when weight is negative', ...)
//  ↑ outcome  ↑ condition

it('accepts an email address with a subdomain', ...)
//  ↑ outcome  ↑ condition

it('returns all three errors when all fields are invalid', ...)
//  ↑ outcome             ↑ condition
```

**What to avoid:**

```ts
it('should work', ...);             // "should" is always true — drop it
it('testEmailValidation', ...);     // this is a function name, not a behaviour
it('valid email', ...);             // missing: what happens when it is valid?
it('correctly handles null', ...);  // "correctly" is redundant — all tests should be correct
it('test #3', ...);                 // numbers break as the suite grows
```

**The `should` rule:** Avoid "should." It means "ought to" — which is always true of
a test. `'should return 0'` says nothing that `'returns 0'` does not. Drop it.

**Project Application:** Every contacts validation test name uses the sentence pattern.
The describe group (`validateContact`) provides the subject; each test name provides
the condition and expected outcome.

**Smallest possible example:**

```ts
// Bad names:
it('test1', ...) → "test1 failed" (useless)
it('email', ...) → "email failed" (useless)

// Good names:
it('rejects an email with no @ symbol', ...) → "rejects an email with no @ symbol failed"
// The failure message IS the test name — self-describing
```

**You will see this again in:**
- Every professional codebase uses sentence-style test names
- pytest: `def test_returns_false_for_missing_email():` — same convention, Python style
- Jasmine/Jest: `it('should ...')` was common, but `it('...')` is now preferred
- Standard in code review: bad test names get flagged

**Watch for:** Names that describe the FUNCTION not the BEHAVIOUR.
`'testEmailValidation'` describes a function. `'rejects an email with no @ symbol'`
describes a behaviour. Tests should document behaviours, not function names.

---

## Step 1 — Observe Bad Names in Action

Create `src/bad-names.test.ts` temporarily:

```ts
import { describe, it } from 'vitest';

describe('emailValidator', () => {
  it('test1', () => { throw new Error('intentional failure'); });
  it('validates', () => { throw new Error('intentional failure'); });
  it('testEmailValidation', () => { throw new Error('intentional failure'); });
});
```

```bash
npm test
```

**You should see:**

```
FAIL src/bad-names.test.ts
  × emailValidator > test1
  × emailValidator > validates
  × emailValidator > testEmailValidation
```

These three failures tell you nothing. You must open the file.

Now delete `src/bad-names.test.ts`. The point is made.

---

## Step 2 — Build the Named Test Suite

Create `src/validate-email.ts`:

```ts
export function validateEmail(email: string): boolean {
  if (!email) return false;
  if (!email.includes('@')) return false;
  if (!email.includes('.')) return false;
  if (email.includes(' ')) return false;
  return true;
}
```

Create `src/validate-email.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { validateEmail }         from './validate-email';

describe('validateEmail', () => {

  it('accepts a standard name@domain.ext address', () => {
    expect(validateEmail('alice@example.com')).toBe(true);
  });

  it('rejects an address with no @ symbol', () => {
    expect(validateEmail('aliceexample.com')).toBe(false);
  });

  it('rejects an address with no domain extension', () => {
    expect(validateEmail('alice@example')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('rejects an address that contains a space', () => {
    expect(validateEmail('alice @example.com')).toBe(false);
  });

});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
✓ validateEmail > accepts a standard name@domain.ext address
✓ validateEmail > rejects an address with no @ symbol
✓ validateEmail > rejects an address with no domain extension
✓ validateEmail > rejects an empty string
✓ validateEmail > rejects an address that contains a space

Tests  5 passed (5)
```

Read the test names aloud. Each one is a complete sentence describing a behaviour.

**Change something:** Break the implementation — remove the `includes('@')` check.
Run the tests.

```bash
npm test
```

**You should see:**
```
FAIL  src/validate-email.test.ts
  × validateEmail > rejects an address with no @ symbol
```

This is the value of a good name. The CI message tells you exactly which validation
rule broke. No code reading required. Restore the implementation.

---

### Concept: `describe` Nesting for Hierarchy

**What it is:** `describe` nesting creates a hierarchy that shortens individual test names:

```ts
describe('validateContact', () => {
  describe('when name is empty', () => {
    it('returns invalid', () => { ... });
    it('includes a name field error', () => { ... });
  });

  describe('when email has no @', () => {
    it('returns invalid', () => { ... });
    it('includes an email field error', () => { ... });
  });
});
```

The full test name Vitest reports is the concatenation:
`validateContact > when name is empty > returns invalid`

**What it hides:** Redundant subject repetition. Without nesting:

```ts
it('validateContact returns invalid when name is empty', ...);
it('validateContact includes a name field error when name is empty', ...);
// 'validateContact' and 'when name is empty' repeated in every name
```

**Canonical example:** A filing cabinet. The cabinet label is `validateContact`.
The drawer label is `when name is empty`. The folder label is `returns invalid`.
You navigate by the hierarchy rather than reading the full path each time.

**Project Application:** Group the contacts validation tests by input scenario.
Each `describe` group names the condition; each `it` names the outcome.

**You will see this again in:**
- Jest and Vitest both support unlimited nesting depth
- pytest: test class names serve the same nesting purpose
- CI dashboards: tests are typically grouped by file → describe → test name

**Watch for:** Over-nesting. Two levels (`describe` → `it`) is almost always enough.
Three levels is acceptable for complex domains. Four or more levels indicate the tests
need reorganisation.

---

## Step 3 — Add Nested Grouping

Replace `validate-email.test.ts` with a nested version:

```ts
import { describe, it, expect } from 'vitest';
import { validateEmail }         from './validate-email';

describe('validateEmail', () => {

  describe('with a valid email', () => {
    it('accepts a standard address', () => {
      expect(validateEmail('alice@example.com')).toBe(true);
    });

    it('accepts an address with a subdomain', () => {
      expect(validateEmail('alice@mail.example.com')).toBe(true);
    });
  });

  describe('with an invalid email', () => {
    it('rejects an address with no @ symbol', () => {
      expect(validateEmail('aliceexample.com')).toBe(false);
    });

    it('rejects an address with no domain extension', () => {
      expect(validateEmail('alice@example')).toBe(false);
    });

    it('rejects an empty string', () => {
      expect(validateEmail('')).toBe(false);
    });

    it('rejects an address that contains a space', () => {
      expect(validateEmail('alice @example.com')).toBe(false);
    });
  });

});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
✓ validateEmail > with a valid email > accepts a standard address
✓ validateEmail > with a valid email > accepts an address with a subdomain
✓ validateEmail > with an invalid email > rejects an address with no @ symbol
✓ validateEmail > with an invalid email > rejects an address with no domain extension
✓ validateEmail > with an invalid email > rejects an empty string
✓ validateEmail > with an invalid email > rejects an address that contains a space

Tests  6 passed (6)
```

The hierarchy is visible. `'with a valid email'` vs `'with an invalid email'` groups
tests by scenario — a reader understands the structure immediately.

---

## 🎯 Challenge: Rename a Bad Test Suite

**You know:** The naming pattern, `describe` nesting, what names are for.

**Task:** The following test suite has name problems. Without running the tests or
reading the implementations, write improved names. Then add `describe` nesting.

```ts
// Bad test suite — rename everything:
test('t1', () => { expect(formatCurrency(1000)).toBe('$1,000.00'); });
test('t2', () => { expect(formatCurrency(0.5)).toBe('$0.50'); });
test('t3', () => { expect(formatCurrency(0)).toBe('$0.00'); });
test('t4', () => { expect(formatCurrency(-50)).toBe('-$50.00'); });
test('t5', () => { expect(formatCurrency(1000000)).toBe('$1,000,000.00'); });
test('test_currency', () => { expect(formatCurrency(NaN)).toBe('$0.00'); });
test('should format', () => { expect(formatCurrency(Infinity)).toBe('$0.00'); });
test('formatTest', () => { expect(formatCurrency(1.005)).toBe('$1.01'); });
```

Write the renamed version with `describe` structure.

---

<details>
<summary>▶ Show Solution</summary>

```ts
import { describe, it, expect } from 'vitest';
import { formatCurrency }        from './format-currency';

describe('formatCurrency', () => {

  describe('with whole numbers', () => {
    it('formats a round number with two decimal places', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
    });

    it('formats zero as $0.00', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('formats a million with comma separators', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });
  });

  describe('with decimal amounts', () => {
    it('formats a half-dollar amount', () => {
      expect(formatCurrency(0.5)).toBe('$0.50');
    });

    it('rounds half-up to the nearest cent', () => {
      expect(formatCurrency(1.005)).toBe('$1.01');
    });
  });

  describe('with negative amounts', () => {
    it('prefixes negative amounts with a minus sign', () => {
      expect(formatCurrency(-50)).toBe('-$50.00');
    });
  });

  describe('with non-finite inputs', () => {
    it('returns $0.00 for NaN', () => {
      expect(formatCurrency(NaN)).toBe('$0.00');
    });

    it('returns $0.00 for Infinity', () => {
      expect(formatCurrency(Infinity)).toBe('$0.00');
    });
  });

});
```

**What changed:**

- `t1` through `t5`, `test_currency`, `should format`, `formatTest` → sentences describing behaviour
- Tests grouped into four scenarios by what kind of input they test
- Each group has a clear `describe` label — the scenario condition
- Each test name within the group describes the expected outcome
- "should" removed everywhere — present tense verbs only

**Key insight:** Good names came from asking "given what input, what happens?"
for each test. That question forces a sentence structure automatically.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Failure message is self-explaining | Break one function, run tests | Failure message tells you exactly what broke without reading code |
| Names are sentences | Read names without the code | Each name describes one behaviour |
| No "should" | Search for "should" in test names | None found |
| Describe hierarchy visible | Run `vitest --reporter=verbose` | Hierarchy displayed in output |
| Scenario groups are consistent | Read the `describe` labels | Each group names a specific condition |

---

## Quick Check Answers

**1. CI shows `FAIL: test1` — what do you know?**

You know one test in the suite failed. You do not know which function failed, what
input caused the failure, what the expected output was, or what the actual output
was. You must open the test file and read `test1` to find any of this. The name
gave you zero information about the failure.

**2. CI shows `FAIL: returns false when the input email has no @ symbol` — what do you know?**

You know the email validation function is not returning `false` when the email
has no `@` symbol. You know the input type (email with no @) and the expected
output (false). You can immediately write a fix or identify where to look — without
opening any file.

**3. A test is named `testEmailValidation` — what is wrong?**

Three things: (1) it uses `test` as a prefix — redundant (all tests are tests); (2)
it names a function (`emailValidation`) not a behaviour; (3) it gives no information
about the input condition or expected output. When this test fails, the only
information you have is "something about email validation is wrong" — exactly what
you could infer from the test file name.
