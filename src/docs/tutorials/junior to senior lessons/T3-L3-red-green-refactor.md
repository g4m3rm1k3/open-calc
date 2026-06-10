# Junior to Senior — T3·L3 — Red / Green / Refactor

**Prerequisites:** T3·L2 (Arrange / Act / Assert). You can write well-structured
tests. This lesson teaches the discipline of writing the test first — the core TDD loop.

**What this lab adds:**
- The three-step TDD cycle: Red → Green → Refactor
- Why you MUST see the test fail before writing the implementation
- The minimum code rule: write only enough to make the test pass
- Refactoring under green: improving code without changing behaviour
- Recognising the difference between a test that fails correctly vs one that is broken

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You write a test and run it. It passes immediately without writing any implementation.
>    What went wrong?
> 2. You are in the Green step. The test passes, but your implementation is
>    hardcoded (`return 42`). Is that acceptable? What is the next step?
> 3. What is the exact definition of refactoring? Does refactoring add features?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `calculateDiscount` function developed entirely test-first, one test at a time:

```
$ npx vitest run

✓ calculateDiscount > returns 0 for a cart below the threshold
✓ calculateDiscount > returns 10% off for a cart of exactly 100
✓ calculateDiscount > returns 10% off for a cart above 100
✓ calculateDiscount > returns 20% off for a cart of exactly 200
✓ calculateDiscount > returns 0 for a negative amount

Test Files  1 passed (1)
Tests       5 passed (5)
Duration    8ms
```

Each test is written first (Red), then implemented (Green), then the code is cleaned (Refactor).

---

### Concept: The Three-Step Cycle

**What it is:** TDD is a development loop with three steps:

1. **Red** — write a test for the next small behaviour. Run it. Watch it fail.
2. **Green** — write the minimum code to make the test pass. Run it. Watch it pass.
3. **Refactor** — improve the code without changing its behaviour. Run the tests. They must still pass.

Repeat for every new behaviour.

**The problem before (code first, test later):**

```ts
// Written without tests:
function calculateDiscount(total: number): number {
  if (total >= 200) return total * 0.2;
  if (total >= 100) return total * 0.1;
  return 0;
}
// "Tested" by running it manually a few times.
// Next week: someone adds a new tier, the logic breaks, nobody knows.
```

**The solution — test first:**

The test defines the specification before the code exists. The test fails (Red) — proving
the test is wired correctly. Then the code makes it pass (Green). The test OWNS the behaviour.

**What it hides:** The doubt. "Does my test actually test what I think it tests?" Red forces
you to answer this by watching the test fail for the right reason. A test that passes
immediately after you write it — before any implementation — is a test you cannot trust.

The invariant TDD protects: "every test was seen to fail before the implementation
was written." This guarantees every test in the suite is actually checking something.

**Canonical example:** A building inspector checking before the walls go up. Red = the
inspector checks the specification (the test passes). Green = the builder meets the
specification. Refactor = the builder improves the construction method without changing
what was built. The inspector re-checks — still passes.

**Project Application:** The discount calculation has multiple tiers. TDD builds it
one tier at a time, verifying each tier works before adding the next.

**Smallest possible example:**

```ts
// Red — write the test first:
test('add returns 5', () => {
  expect(add(2, 3)).toBe(5);
});
// Run it → TypeError: add is not defined (or similar) ← RED ✓

// Green — minimum code:
function add(a, b) { return a + b; }
// Run it → passes ← GREEN ✓

// Refactor — add types:
function add(a: number, b: number): number { return a + b; }
// Run it → still passes ← REFACTOR ✓
```

**You will see this again in:**
- Every professional TDD practitioner follows this cycle
- Test-driven development is a standard hiring criterion for senior roles
- The cycle applies to every language: TypeScript, Python, Java, Go
- Standard interview question: "What is TDD and why is the Red step important?"

**Watch for:** Skipping Red. If you write the test after writing the code, and the
test passes immediately, you cannot be sure the test is actually checking what you
think. You must see it fail first to know it is wired correctly.

---

## Step 1 — Red: Write the First Failing Test

Create a new project for this exercise:

```bash
mkdir discount-tdd
cd discount-tdd
npm init -y
npm install -D vitest typescript
```

Add to `package.json`:
```json
{
  "type": "module",
  "scripts": { "test": "vitest run", "test:watch": "vitest" }
}
```

Create `src/calculate-discount.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { calculateDiscount }     from './calculate-discount';

describe('calculateDiscount', () => {

  it('returns 0 for a cart below the threshold', () => {
    // Arrange
    const cartTotal = 50;

    // Act
    const discount = calculateDiscount(cartTotal);

    // Assert
    expect(discount).toBe(0);
  });

});
```

Do NOT create `calculate-discount.ts` yet.

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
FAIL  src/calculate-discount.test.ts [ src/calculate-discount.test.ts ]
  Error: Cannot find module './calculate-discount'
```

This is RED. The test fails because the module does not exist. This is a valid failure —
it tells you exactly what to create next.

**In the terminal:**
```bash
echo $?   # Mac/Linux — check exit code
```

**Expected:** A non-zero exit code (failure). The test MUST fail here. If it passes,
something is wrong with the test setup.

---

## Step 2 — Green: Minimum Code to Pass

Create `src/calculate-discount.ts` with the absolute minimum:

```ts
export function calculateDiscount(cartTotal: number): number {
  return 0;
}
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
✓ calculateDiscount > returns 0 for a cart below the threshold

Tests  1 passed (1)
```

GREEN. The first test passes. The implementation is obviously incomplete — it always
returns 0. That is correct for now. There is only one test, and `return 0` satisfies it.

**Why not write the full implementation?** Because you have not written the tests for
the other cases yet. Writing code for untested behaviour is speculation. The tests will
define what the code must do.

**Change something:** Change `return 0` to `return 1`. Run the test.
Expected: the test fails. This confirms the test is checking the right thing.
Change back to `return 0`.

---

## Step 3 — Red: Second Test

Add the second test to the describe block:

```ts
it('returns 10% off for a cart of exactly 100', () => {
  // Arrange
  const cartTotal = 100;

  // Act
  const discount = calculateDiscount(cartTotal);

  // Assert
  expect(discount).toBe(10);
});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
✓ calculateDiscount > returns 0 for a cart below the threshold
× calculateDiscount > returns 10% off for a cart of exactly 100
  → AssertionError: expected 0 to be 10
```

RED again. The new test fails. The existing test still passes. This is the correct
Red state: exactly one new failure for the one new behaviour you are adding.

---

## Step 4 — Green: Make Both Pass

Update `calculate-discount.ts`:

```ts
export function calculateDiscount(cartTotal: number): number {
  if (cartTotal >= 100) {
    return cartTotal * 0.1;
  }
  return 0;
}
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
✓ calculateDiscount > returns 0 for a cart below the threshold
✓ calculateDiscount > returns 10% off for a cart of exactly 100

Tests  2 passed (2)
```

GREEN. Both pass.

**Refactor step:** The current code is simple enough — no refactoring needed.
The Refactor step only acts when the code has a smell worth addressing.

---

## Step 5 — Complete the Red/Green/Refactor Cycle

**Test 3 — above the threshold:**

Add to the describe block:

```ts
it('returns 10% off for a cart above 100', () => {
  const discount = calculateDiscount(150);
  expect(discount).toBe(15);
});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:** All 3 pass. The existing implementation already handles `cartTotal > 100`.
This confirms the existing code covers this case — no implementation change needed.

**Test 4 — 20% tier:**

```ts
it('returns 20% off for a cart of exactly 200', () => {
  const discount = calculateDiscount(200);
  expect(discount).toBe(40);
});
```

### SAVE AND TRY

```bash
npm test
```

Expected: Test 4 fails — `expected 20 to be 40`. Update:

```ts
export function calculateDiscount(cartTotal: number): number {
  if (cartTotal >= 200) {
    return cartTotal * 0.2;
  }
  if (cartTotal >= 100) {
    return cartTotal * 0.1;
  }
  return 0;
}
```

```bash
npm test
```

Expected: 4 passing.

**Test 5 — negative input:**

```ts
it('returns 0 for a negative amount', () => {
  const discount = calculateDiscount(-50);
  expect(discount).toBe(0);
});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:** All 5 pass. The current implementation handles negatives (neither
`>= 200` nor `>= 100` is true for `-50`) — no change needed.

---

### Concept: The Refactor Step

**What it is:** Refactoring is changing the internal structure of code without
changing its observable behaviour. The tests are the safety net: if refactoring
accidentally changes behaviour, a test fails.

**The problem before (magic numbers in code):**

```ts
export function calculateDiscount(cartTotal: number): number {
  if (cartTotal >= 200) {         // what is 200? why 200?
    return cartTotal * 0.2;       // what is 0.2? what does it represent?
  }
  if (cartTotal >= 100) {
    return cartTotal * 0.1;
  }
  return 0;
}
```

`200`, `100`, `0.2`, `0.1` are magic numbers. A future reader has to guess what they mean.

**The solution:**

```ts
const DISCOUNT_TIER_1_THRESHOLD = 100;
const DISCOUNT_TIER_1_RATE      = 0.10;  // 10%
const DISCOUNT_TIER_2_THRESHOLD = 200;
const DISCOUNT_TIER_2_RATE      = 0.20;  // 20%

export function calculateDiscount(cartTotal: number): number {
  if (cartTotal >= DISCOUNT_TIER_2_THRESHOLD) {
    return cartTotal * DISCOUNT_TIER_2_RATE;
  }
  if (cartTotal >= DISCOUNT_TIER_1_THRESHOLD) {
    return cartTotal * DISCOUNT_TIER_1_RATE;
  }
  return 0;
}
```

**What it hides:** The intent. A reader now knows these are discount tiers with named
thresholds and rates — without needing comments.

**The rule:** After refactoring, every test that passed before must still pass without
modification. If a test breaks after refactoring, it was not a refactoring — it was a
behaviour change.

**Canonical example:** Reorganising a filing system. The documents haven't changed,
just their arrangement. Anyone looking for a document finds the same information — but
organised more clearly. The content (observable behaviour) is unchanged; the organisation
(structure) is improved.

**Project Application:** Extracting the threshold constants makes the discount function
readable — a product manager can confirm the thresholds match the business rules.

**You will see this again in:**
- "Refactoring: Improving the Design of Existing Code" by Martin Fowler — the canonical reference
- Pull request review feedback: "This works, but extracting this into a constant would help"
- Code review: any time a reviewer asks for readability improvements on passing code

**Watch for:** Refactoring that changes behaviour. Moving an `if` condition, changing
`||` to `&&`, extracting to a function with different parameter order — these all risk
behaviour changes. Always run the tests after every refactoring step.

---

## Step 6 — Refactor Under Green

Update `calculate-discount.ts`:

```ts
const DISCOUNT_TIER_1_THRESHOLD  = 100;
const DISCOUNT_TIER_1_RATE       = 0.10;
const DISCOUNT_TIER_2_THRESHOLD  = 200;
const DISCOUNT_TIER_2_RATE       = 0.20;

export function calculateDiscount(cartTotal: number): number {
  if (cartTotal >= DISCOUNT_TIER_2_THRESHOLD) {
    return cartTotal * DISCOUNT_TIER_2_RATE;
  }
  if (cartTotal >= DISCOUNT_TIER_1_THRESHOLD) {
    return cartTotal * DISCOUNT_TIER_1_RATE;
  }
  return 0;
}
```

### SAVE AND TRY

```bash
npm test
```

**You should see:** All 5 still pass. The behaviour has not changed — the tests
confirm it. This is the Refactor step: code is cleaner, tests are unchanged.

**In the terminal, verify the constants have the right values:**

```bash
node -e "
import('./src/calculate-discount.ts').catch(() =>
  import('./src/calculate-discount.js')
).then(m => {
  console.log(m.calculateDiscount(100));  // should be 10
  console.log(m.calculateDiscount(200));  // should be 40
  console.log(m.calculateDiscount(50));   // should be 0
})
"
```

Or just check by looking at the passing tests.

---

## 🎯 Challenge: TDD a `calculateShipping` Function

**You know:** Red/Green/Refactor, one test at a time.

**Task:** Build `calculateShipping(weight: number, expedited: boolean): number`
using TDD. The rules:

- Weight 0–1 kg: $3.00 standard, $7.00 expedited
- Weight 1–5 kg: $5.00 standard, $12.00 expedited
- Weight over 5 kg: $10.00 standard, $20.00 expedited
- Negative weight: throw an error with message `'Weight cannot be negative'`

**Requirements:**
- Write each test first, watch it fail, then implement the minimum to make it pass
- Write at least 6 tests covering each tier and the error case
- After all tests pass, refactor (extract the tier thresholds and rates as named constants)

Try for at least 15 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

**Tests written before implementation:**

```ts
import { describe, it, expect } from 'vitest';
import { calculateShipping }     from './calculate-shipping';

describe('calculateShipping', () => {

  it('charges $3 standard for a 0.5 kg package', () => {
    expect(calculateShipping(0.5, false)).toBe(3.00);
  });

  it('charges $7 expedited for a 0.5 kg package', () => {
    expect(calculateShipping(0.5, true)).toBe(7.00);
  });

  it('charges $5 standard for a 3 kg package', () => {
    expect(calculateShipping(3, false)).toBe(5.00);
  });

  it('charges $12 expedited for a 3 kg package', () => {
    expect(calculateShipping(3, true)).toBe(12.00);
  });

  it('charges $10 standard for a 10 kg package', () => {
    expect(calculateShipping(10, false)).toBe(10.00);
  });

  it('charges $20 expedited for a 10 kg package', () => {
    expect(calculateShipping(10, true)).toBe(20.00);
  });

  it('throws for a negative weight', () => {
    expect(() => calculateShipping(-1, false)).toThrow('Weight cannot be negative');
  });

});
```

**Implementation after all tests are Red:**

```ts
const TIERS = [
  { maxWeight: 1,        standard:  3, expedited:  7 },
  { maxWeight: 5,        standard:  5, expedited: 12 },
  { maxWeight: Infinity, standard: 10, expedited: 20 },
];

export function calculateShipping(weight: number, expedited: boolean): number {
  if (weight < 0) {
    throw new Error('Weight cannot be negative');
  }

  const tier = TIERS.find(t => weight <= t.maxWeight)!;
  return expedited ? tier.expedited : tier.standard;
}
```

**Key insight:** Writing tests first forced the API decision: `calculateShipping(weight, expedited)`
takes a boolean for expedited rather than a string `'standard' | 'expedited'`. That decision
was made when writing the first test call — before the implementation existed. The `TIERS`
array came from the Refactor step; the initial Green implementation used `if/else` chains.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Red before Green | Remove the implementation, run tests | Tests fail |
| Green with minimum code | Review `calculate-discount.ts` | No code covers untested cases |
| Refactor safety | Change a constant name, run tests | All tests still pass |
| New test fails first | Add test 3 before implementation | Red for exactly that test |
| Existing tests stay green | Add new test + implementation | Previous tests unaffected |

---

## Quick Check Answers

**1. You write a test and it passes immediately. What went wrong?**

Either: (a) the function already implemented the behaviour — the test is correct but
redundant; or (b) the test has a bug and would pass even if the implementation were wrong.
You cannot distinguish these cases without having seen the test fail. The Red step is not
optional — it is the proof that the test is wired correctly and would detect a regression.

**2. Green implementation is hardcoded (`return 42`). Acceptable?**

Yes, temporarily. In the Green step the only goal is passing tests. Hardcoding is a valid
Green implementation if it passes the current tests. The next step is to add the test that
makes `return 42` fail — forcing a real implementation. The Refactor step cleans the code
but does not add behaviour. The next Red step forces the next real behaviour.

**3. What is refactoring? Does it add features?**

Refactoring is changing the internal structure of code without changing its observable
behaviour. No, refactoring does not add features. If a change requires adding or modifying
a test, it is not refactoring — it is a feature addition or bug fix. The rule: after
refactoring, every test that passed before must still pass without modification.
