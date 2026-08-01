# FOUNDATIONS — LAB-061 — Test-Driven Development

**Series:** FOUNDATIONS — Part X: Testing
**Environment:** Browser DevTools console or Node.js
**Time:** 50–65 minutes.

---

## What You Will Build

A shopping cart total calculator implemented using strict TDD — writing each test before the code that makes it pass, committing after each green, and refactoring after the feature is complete. After this lab you will understand the red-green-refactor cycle and why it produces tests that are guaranteed to be sensitive to the bugs they test.

---

## What You Need to Know First

**From LAB-060 (Unit Testing):** The `assertEqual` assertion function. The Arrange-Act-Assert pattern. The red-green cycle (failing test first, then fix).

**From LAB-019 (Pure Functions):** The cart total is a pure function — same cart, same total. Pure functions are the ideal target for TDD.

---

> **Quick Check — try to answer before reading:**
>
> 1. In TDD, which comes first: the test or the production code?
> 2. What does "minimum code to pass" mean in the green phase?
> 3. Why does TDD enforce YAGNI (You Ain't Gonna Need It)?
>
> *(Answers at the end of this lab)*

---

## The Lesson

TDD is a discipline with one rule: **write the failing test before writing the production code.** The cycle is three phases repeated:

1. **Red** — Write a test that fails because the code does not exist yet.
2. **Green** — Write the minimum code that makes the test pass.
3. **Refactor** — Clean up the code without breaking any passing tests.

---

### Step 1 — Red: First Test, No Code Yet

We are building a function `calculateCartTotal(items, discountCode)`. Start with the simplest possible case: an empty cart has a total of zero.

```typescript
// Tests file — written BEFORE any production code:

function assertEqual<T>(actual: T, expected: T, name: string): void {
  if (actual !== expected) {
    throw new Error(`FAIL: ${name}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`);
  }
  console.log(`PASS: ${name}`);
}

// RED: this test fails because calculateCartTotal does not exist:
function test_emptyCartHasTotalOfZero(): void {
  const total = calculateCartTotal([], null);
  assertEqual(total, 0, 'empty cart has total of zero');
}

test_emptyCartHasTotalOfZero();
// ReferenceError: calculateCartTotal is not defined
```

**The walkthrough:** The test calls `calculateCartTotal` with an empty array and no discount code. The function does not exist yet, so the test throws a `ReferenceError`. This is the **red** phase: we have a failing test.

---

### Step 2 — Green: Minimum Code to Pass

Write the minimum code that makes this one test pass. Nothing more.

```typescript
interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

function calculateCartTotal(items: CartItem[], discountCode: string | null): number {
  return 0;  // minimum code — always returns 0 for now
}

test_emptyCartHasTotalOfZero();
// PASS: empty cart has total of zero
```

**The walkthrough:** The function returns `0` unconditionally. This is not the final implementation — it is the minimum to turn the test green. The test now passes.

**The SE lens — minimum code is not a hack.** Returning a constant is deliberately minimal. The next test will force the function to do real work. Writing more than the minimum test requires introduces untested code — code that could be wrong.

---

### Step 3 — Red Again: Test With Items

Add the next test — a cart with one item.

```typescript
function test_singleItemCart(): void {
  const items: CartItem[] = [{ name: 'Widget', price: 10.00, quantity: 3 }];
  const total = calculateCartTotal(items, null);
  assertEqual(total, 30.00, 'single item: price × quantity');
}

test_emptyCartHasTotalOfZero();
test_singleItemCart();
// PASS: empty cart has total of zero
// FAIL: single item: price × quantity
//   expected: 30
//   actual:   0
```

**The walkthrough:** The new test fails — the function still returns `0`. Both tests are now run, ensuring the fix does not break the already-passing test.

---

### Step 4 — Green: Sum the Items

```typescript
function calculateCartTotal(items: CartItem[], discountCode: string | null): number {
  return items.reduce(
    (runningTotal, item) => runningTotal + item.price * item.quantity,
    0
  );
}

test_emptyCartHasTotalOfZero();
test_singleItemCart();
// PASS: empty cart has total of zero
// PASS: single item: price × quantity
```

**The walkthrough:** `items.reduce(...)` accumulates the sum of `price × quantity` for each item, starting from `0`. The empty cart case still passes because `reduce` on an empty array returns the initial value (`0`).

---

### Step 5 — Red: Discount Code

```typescript
function test_discountCodeSAVE10(): void {
  const items: CartItem[] = [{ name: 'Widget', price: 100.00, quantity: 1 }];
  const total = calculateCartTotal(items, 'SAVE10');
  assertEqual(total, 90.00, 'SAVE10 discount code applies 10% off');
}

function test_unknownDiscountCodeIgnored(): void {
  const items: CartItem[] = [{ name: 'Widget', price: 100.00, quantity: 1 }];
  const total = calculateCartTotal(items, 'FAKECODE');
  assertEqual(total, 100.00, 'unknown discount code is ignored');
}

test_emptyCartHasTotalOfZero();
test_singleItemCart();
test_discountCodeSAVE10();
test_unknownDiscountCodeIgnored();
// PASS, PASS, FAIL, PASS
```

**The walkthrough:** `SAVE10` should reduce by 10%. `FAKECODE` should be ignored (full price). The discount test fails; the unknown code test passes because the current function already ignores discount codes (it has no discount logic).

---

### Step 6 — Green: Discount Logic

```typescript
function calculateCartTotal(items: CartItem[], discountCode: string | null): number {
  const subtotal = items.reduce(
    (runningTotal, item) => runningTotal + item.price * item.quantity,
    0
  );

  const discountPercents: Record<string, number> = {
    'SAVE10': 10,
    'SAVE20': 20,
  };

  const discountPercent = discountCode !== null
    ? (discountPercents[discountCode] ?? 0)
    : 0;

  return subtotal * (1 - discountPercent / 100);
}

test_emptyCartHasTotalOfZero();
test_singleItemCart();
test_discountCodeSAVE10();
test_unknownDiscountCodeIgnored();
// All PASS
```

**The walkthrough:** A `Record<string, number>` — a TypeScript type for a plain object whose keys are strings and values are numbers — maps discount codes to their percent reductions. `discountPercents[discountCode] ?? 0` looks up the code. The `??` operator is the nullish coalescing operator: it returns the left side unless it is `null` or `undefined`, in which case it returns the right side (`0`). An unknown code is not in the map, so the lookup returns `undefined`, and `?? 0` produces `0` — no discount applied.

---

### Step 7 — Refactor: Extract Discount Lookup

All tests still pass after this refactoring.

```typescript
const DISCOUNT_CODES: Record<string, number> = {
  'SAVE10': 10,
  'SAVE20': 20,
};

function lookupDiscountPercent(code: string | null): number {
  if (code === null) return 0;
  return DISCOUNT_CODES[code] ?? 0;
}

function calculateCartTotal(items: CartItem[], discountCode: string | null): number {
  const subtotal        = items.reduce(
    (runningTotal, item) => runningTotal + item.price * item.quantity,
    0
  );
  const discountPercent = lookupDiscountPercent(discountCode);
  return subtotal * (1 - discountPercent / 100);
}

// Run all tests — must still pass after refactoring:
test_emptyCartHasTotalOfZero();
test_singleItemCart();
test_discountCodeSAVE10();
test_unknownDiscountCodeIgnored();
// All PASS — refactoring preserved behavior
```

---

## Connect the Pieces

- **Kent Beck** invented TDD and documented it in *Test-Driven Development: By Example* (2002). The same cycle — red, green, refactor — is used by development teams at Google, Amazon, and Spotify.
- **TDD enforces YAGNI automatically.** Every line of production code is written in response to a failing test. Code with no test is code no test requires. Code no test requires is code YAGNI says should not exist.
- **TDD documents design decisions.** The tests for `calculateCartTotal` document: empty carts return 0, items are multiplied price × quantity, `SAVE10` gives 10% off, unknown codes are ignored. This is the specification. If requirements change, the tests change first.

---

## What Breaks Without This

**Writing tests after the code:**

A developer writes `calculateCartTotal` first, then writes tests. The tests pass immediately — but they may be testing what the code does, not what the code should do. If the code has a bug in the discount calculation, the test will mirror that bug. The developer has written tests that prove "the code does what it does," not "the code does what is required."

With TDD, the test is written against the requirement before the code exists. A failing test proves the test is sensitive to the requirement. A passing test proves the code meets the requirement.

---

## Definition of Done

- [ ] `calculateCartTotal` was implemented in four red-green cycles (empty, single item, discount, refactor)
- [ ] Each test was written before the code that makes it pass
- [ ] All four tests pass after the final implementation
- [ ] `lookupDiscountPercent` is extracted and `DISCOUNT_CODES` is a named constant
- [ ] You can explain why returning `0` in step 2 is valid TDD and not cheating

**Git commit:**

```
git add src/
git commit -m "LAB-061: TDD — calculateCartTotal built in red-green-refactor cycles; each test written before production code; discount logic extracted after all tests green"
```

---

## Quick Check Answers

1. **The test comes first.** Always. Writing the production code first is test-after development — valid, but it does not give the red phase, so it cannot guarantee the test is sensitive to the bug.
2. **"Minimum code to pass" means exactly the code required to make the current failing test turn green — no more.** In step 2, returning `0` is the minimum for the empty-cart test. A developer tempted to write the full implementation is writing untested code — code that may have bugs that no test would catch.
3. **TDD enforces YAGNI because every line of production code is written in response to a specific test.** If no test requires a feature, no code for that feature is written. The discipline of "only write code that a failing test requires" is a mechanical YAGNI enforcement — it is impossible to over-engineer when you cannot write code without a test requiring it.
