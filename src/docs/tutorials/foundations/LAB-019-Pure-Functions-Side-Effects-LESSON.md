# FOUNDATIONS — LAB-019 — Pure Functions and Side Effects

**Series:** FOUNDATIONS — Part IV: Functional Programming
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 50–65 minutes.

---

## What You Will Build

A small data pipeline — parse raw order data, calculate totals, apply discounts, format for display — written entirely as pure functions. You will compare a pure implementation against an impure one of the same logic and verify that the pure version is trivially testable, safely reusable, and mentally easier to reason about. After this lab, you will be able to classify any function as pure or impure, identify the specific side effect that makes an impure function impure, and explain why pure functions are the default choice for logic that transforms data.

---

## What You Need to Know First

**From LAB-006 (First-Class Functions):** Functions are values. Higher-order functions accept functions as arguments.

**From LAB-011 (Async):** Async operations (network requests, file reads) are inherently impure — they depend on external state. Understanding pure functions clarifies exactly what makes async code harder to reason about.

**From LAB-018 (Composition):** Components that are pure functions can be composed freely without worrying about hidden interactions. This is why composition and pure functions appear in the same part of the curriculum.

---

> **Quick Check — try to answer before reading:**
>
> 1. You call `calculateTax(100)` twice. The second call returns a different value than the first. Is `calculateTax` a pure function? What must be true for a function to be pure?
> 2. What is a "side effect"? Give three examples of side effects that a function might perform.
> 3. Why are pure functions trivially testable compared to impure functions?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Defining Pure Functions

**The problem this step solves:** Establish a precise definition of purity before applying it.

**The code:**

```js
// Pure functions
function add(a, b) {
  return a + b;
}

function double(x) {
  return x * 2;
}

function formatPrice(amount) {
  return `$${amount.toFixed(2)}`;
}

// Impure functions
let taxRate = 0.1;

function calculateTax(price) {
  return price * taxRate;   // IMPURE: reads external state (taxRate)
}

function logAndReturn(value) {
  console.log("Value:", value);   // IMPURE: side effect (writing to console)
  return value;
}

let callCount = 0;
function getNextId() {
  callCount += 1;   // IMPURE: modifies external state
  return callCount;
}
```

**The walkthrough — what makes each function pure or impure:**

`add(3, 4)`: always returns `7`, regardless of when or how often it is called. No external reads. No external writes. **Pure.**

`calculateTax(100)`: reads `taxRate`. If `taxRate` is `0.1`, returns `10`. If `taxRate` is later changed to `0.2`, the same call `calculateTax(100)` returns `20`. The result depends on external state. **Impure.**

`logAndReturn(42)`: calls `console.log`. `console.log` writes to the browser console — an external resource. Even though the function returns the correct value, the side effect means calling it has a visible effect outside the function. **Impure.**

`getNextId()`: modifies `callCount`, which is external to the function. Two calls to `getNextId()` return different values even though the arguments are identical (none). **Impure.**

**CS lens — referential transparency:**

A pure function has **referential transparency**: any call to the function can be replaced with its return value without changing the program's behavior. `add(3, 4)` can be replaced with `7` anywhere it appears. `calculateTax(100)` cannot be replaced with `10` because if `taxRate` changes, the replacement is wrong.

Referential transparency is what allows compilers to optimize, memoize, and parallelize pure functions. If a function call is referentially transparent, running it twice is exactly the same as running it once and caching the result. `Math.sqrt(25)` is always `5` — safe to cache. `getNextId()` returns a different value each time — cannot be cached.

**SE lens — pure functions as the testable core:**

Testing `add(3, 4)` requires zero setup — no database, no mock objects, no environment configuration. Call it, check the result. Testing `calculateTax(100)` requires setting `taxRate` to a known value first, then calling the function, then (potentially) restoring `taxRate` afterward so subsequent tests are not affected. Every dependency on external state becomes a setup and teardown burden in tests.

**What breaks when you use impure functions for core logic:**

Core logic that reads global state becomes order-dependent: tests that run fine in isolation fail when run after a test that modifies global state. Core logic that writes to databases or logs must be run in an environment with those systems available. Core logic that calls APIs requires network access and a running server. Pure functions need none of these things.

---

### SAVE AND TRY

```js
function add(a, b)        { return a + b; }
function multiply(a, b)   { return a * b; }
function formatPrice(n)   { return `$${n.toFixed(2)}`; }

// These can be tested with simple assertions:
console.assert(add(3, 4) === 7,           "add(3,4) should be 7");
console.assert(multiply(3, 4) === 12,     "multiply(3,4) should be 12");
console.assert(formatPrice(9.5) === "$9.50", "formatPrice should format correctly");
console.log("All assertions passed");
```

`console.assert(condition, message)` — a built-in function that logs an error message if `condition` is `false`, and silently succeeds if `condition` is `true`. Used here as a minimal test runner — no setup required.

Expected: `"All assertions passed"` — all three assertions pass silently.

**Change something:** Break one assertion: change `add(3, 4) === 7` to `add(3, 4) === 8`. Expected: an assertion error appears in the console. Restore it. This demonstrates the zero-friction testing that pure functions enable.

---

### Step 2 — Identifying and Isolating Side Effects

**The problem this step solves:** Learn to identify all categories of side effects and understand which are unavoidable.

**The code:**

```js
// Side effect categories:

// 1. External state read (hidden input)
let discount = 0.05;
function getPriceWithDiscount(price) {
  return price * (1 - discount);   // reads external 'discount'
}

// 2. External state write (hidden output)
let totalRevenue = 0;
function recordSale(amount) {
  totalRevenue += amount;   // writes external 'totalRevenue'
  return amount;
}

// 3. I/O: writing to console, files, network
function saveToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// 4. Date and time (non-determinism)
function getCurrentPrice(basePrice) {
  const hour = new Date().getHours();
  return hour >= 9 && hour <= 17 ? basePrice : basePrice * 1.2;   // surge pricing at night
}

// 5. Math.random (non-determinism)
function applyChanceDiscount(price) {
  return Math.random() < 0.1 ? price * 0.9 : price;   // 10% chance of discount
}
```

**The walkthrough — why each is impure:**

`getPriceWithDiscount(100)`: result changes when `discount` changes. Same input, different output depending on external state. **Hidden input.**

`recordSale(100)`: modifies `totalRevenue`. The function has an effect on the world beyond its return value. Two calls to `recordSale(100)` each change `totalRevenue` — you cannot reason about the function's effect in isolation. **Hidden output.**

`saveToLocalStorage(...)`: writes to browser storage. An external resource is modified. **I/O side effect.**

`getCurrentPrice(100)`: returns a different value depending on the current time. Two calls with the same argument at different times return different results. **Non-determinism from environment.**

`applyChanceDiscount(100)`: uses `Math.random()`. Two calls with the same argument return different results. **Non-determinism from randomness.**

**Which side effects are unavoidable:**

Side effects are not inherently wrong — they are necessary. Programs that never write to storage, never display output, and never make network requests are useless. The goal is not to eliminate side effects but to **contain them**: push them to the edges of the system (system boundaries) and keep the core logic pure. The architecture looks like:

```
Input (read external state)
    ↓
Pure core logic (transform data — no side effects)
    ↓
Output (write external state, display, network)
```

**CS lens — the functional core, imperative shell:**

This architecture — pure functions at the center, I/O at the edges — is called the **functional core, imperative shell** pattern. The core (calculation, transformation, decision-making) is pure and testable. The shell (reading input, writing output, calling APIs) is impure but thin and simple. Most bugs live in the core — testing the core with zero setup catches most bugs. The shell is hard to test, but it is so thin that bugs there are rare.

**SE lens — side effects as dependencies:**

Every side effect is a hidden dependency. `getCurrentPrice` depends on the system clock. `applyChanceDiscount` depends on `Math.random`. These dependencies cannot be passed as arguments, so they cannot be substituted in tests. The fix: pass them in:

```js
function getCurrentPrice(basePrice, currentHour) {
  return currentHour >= 9 && currentHour <= 17 ? basePrice : basePrice * 1.2;
}

// Testable: getCurrentPrice(100, 10) always returns 100
// Testable: getCurrentPrice(100, 22) always returns 120
```

By making the time an argument, the dependency is explicit and injectable. The function becomes pure.

**What breaks when side effects infiltrate the core:**

The most common symptom: tests that pass in isolation but fail when run together, or fail on CI servers but pass locally. These are signs that tests share mutable external state. Isolating pure logic from I/O eliminates this entire class of problem.

---

### SAVE AND TRY

```js
// Make getCurrentPrice pure by injecting the hour:
function getCurrentPrice(basePrice, currentHour) {
  if (currentHour < 9 || currentHour > 17) {
    return basePrice * 1.2;   // surge pricing
  }
  return basePrice;
}

// Now fully testable with no clock dependency:
console.assert(getCurrentPrice(100, 10) === 100,   "Business hours: no surge");
console.assert(getCurrentPrice(100, 22) === 120,   "After hours: surge pricing");
console.assert(getCurrentPrice(100, 8)  === 120,   "Before hours: surge pricing");
console.log("All assertions passed");
```

Expected: all pass.

**Change something:** Add a third price tier: `currentHour === 12` returns `basePrice * 0.9` (lunchtime discount). Write an assertion: `getCurrentPrice(100, 12) === 90`. Run it. Zero infrastructure needed.

---

### Step 3 — A Pure Data Pipeline

**The problem this step solves:** Write a complete, realistic transformation pipeline as pure functions.

**The code:**

```js
// Raw data input (what arrives from an API or form)
const rawOrders = [
  { id: "ord-001", items: [{ name: "Widget", quantity: 3, unitPrice: 9.99 }], customerId: "c1" },
  { id: "ord-002", items: [{ name: "Gadget", quantity: 1, unitPrice: 49.99 }, { name: "Widget", quantity: 2, unitPrice: 9.99 }], customerId: "c2" },
  { id: "ord-003", items: [], customerId: "c3" },   // empty order — edge case
];

// Pure step 1: calculate item total
function calculateItemTotal(item) {
  return item.quantity * item.unitPrice;
}

// Pure step 2: calculate order subtotal
function calculateOrderSubtotal(order) {
  return order.items.reduce((total, item) => total + calculateItemTotal(item), 0);
}

// Pure step 3: apply discount based on subtotal
function applyDiscount(subtotal, discountRate) {
  return subtotal * (1 - discountRate);
}

// Pure step 4: format an order for display
function formatOrder(order, discountRate) {
  const subtotal   = calculateOrderSubtotal(order);
  const discounted = applyDiscount(subtotal, discountRate);
  return {
    id:        order.id,
    itemCount: order.items.length,
    subtotal:  subtotal,
    discount:  subtotal - discounted,
    total:     discounted,
    formatted: `Order ${order.id}: ${order.items.length} items, total $${discounted.toFixed(2)}`
  };
}

// Process all orders:
const discountRate = 0.1;  // 10% discount
const formatted = rawOrders.map(order => formatOrder(order, discountRate));
formatted.forEach(order => console.log(order.formatted));
```

**The walkthrough — processing `rawOrders[1]` (two-item order):**

1. `formatOrder(rawOrders[1], 0.1)` called.
2. `calculateOrderSubtotal(order)` — calls `calculateItemTotal` for each item:
   - `Gadget`: `1 × 49.99 = 49.99`
   - `Widget`: `2 × 9.99 = 19.98`
   - `reduce` sums them: `49.99 + 19.98 = 69.97`
3. `applyDiscount(69.97, 0.1)` = `69.97 × 0.9 = 62.973`
4. Returns the formatted object with `total: 62.973`.

Every function in this pipeline is pure. Every function can be tested in isolation. The `map` call applies `formatOrder` to each order independently.

**CS lens — composing pure functions into a pipeline:**

Each pure function is one transformation step. `rawData → calculate subtotals → apply discounts → format` is a pipeline where each step is independently correct and testable. The composition is verifiable by verifying each step. If the pipeline produces wrong output, you test each step in isolation to find which one is wrong. With impure functions, the error could be in any step — or in the interaction between steps that share external state.

**SE lens — idempotency:**

`formatOrder(order, 0.1)` produces the same result every time, for the same `order` and `discountRate`. Running it 100 times on the same input produces 100 identical results. This property — **idempotency** (for pure functions, "same input = same output") — makes functions safe to retry, cache, and parallelize. An impure function that writes to a database is not idempotent — calling it 100 times creates 100 database records.

**What breaks if `calculateOrderSubtotal` reads `discountRate` from an outer scope:**

```js
let discountRate = 0.1;
function calculateTotal(order) {
  const subtotal = order.items.reduce(...);
  return subtotal * (1 - discountRate);  // impure: reads outer discountRate
}
```

Testing `calculateTotal` with a different discount rate requires changing `discountRate` before the test and restoring it after. If two tests run concurrently (as test runners often do), they can interfere with each other — one test changes `discountRate` while another is in the middle of calling `calculateTotal`. Pure functions are immune to this class of bug.

---

### SAVE AND TRY

```js
// Test the pipeline:
const testOrder = { id: "test-001", items: [{ name: "Widget", quantity: 2, unitPrice: 10 }], customerId: "c1" };

console.assert(calculateItemTotal({ name: "X", quantity: 3, unitPrice: 5 }) === 15, "item total");
console.assert(calculateOrderSubtotal(testOrder) === 20, "order subtotal");
console.assert(applyDiscount(20, 0.1) === 18, "discount applied");

const result = formatOrder(testOrder, 0.1);
console.assert(result.total === 18, "formatted total");
console.assert(result.itemCount === 1, "item count");
console.log("Pipeline tests passed");
```

Expected: `"Pipeline tests passed"` — all assertions pass.

**Change something:** Test the edge case: `formatOrder({ id: "empty", items: [], customerId: "cx" }, 0.1)`. Expected: `{ total: 0, discount: 0, itemCount: 0, ... }`. The empty order produces zero total without errors because `reduce` with `0` as the initial accumulator handles an empty array correctly.

---

### Step 4 — Rewriting Impure Code as Pure

**The problem this step solves:** Practice identifying and extracting the pure core from an impure function.

**The code — before (impure):**

```js
let log = [];
let totalProcessed = 0;

function processOrder(order) {
  const subtotal = order.items.reduce((t, item) => t + item.price * item.qty, 0);
  const tax = subtotal * 0.08;  // reads nothing external, but 0.08 is hardcoded
  const total = subtotal + tax;

  log.push(`Processed order ${order.id}: $${total.toFixed(2)}`);  // IMPURE: mutates log
  totalProcessed += 1;  // IMPURE: mutates counter

  return { ...order, total };
}

processOrder({ id: "o1", items: [{ price: 10, qty: 2 }] });
processOrder({ id: "o2", items: [{ price: 5,  qty: 3 }] });
console.log(log);
console.log("Total processed:", totalProcessed);
```

`{ ...order, total }` — the **object spread** syntax. `{ ...order }` creates a shallow copy of all properties of `order`. Adding `, total` adds (or overwrites) the `total` property. This creates a new object rather than mutating `order` — a step toward immutability.

**After (pure core + explicit side effects):**

```js
// Pure core: takes all dependencies as arguments, returns new data
function calculateOrderTotal(order, taxRate) {
  const subtotal = order.items.reduce((t, item) => t + item.price * item.qty, 0);
  const tax = subtotal * taxRate;
  return { ...order, subtotal, tax, total: subtotal + tax };
}

// Impure shell: orchestrates side effects
function processOrder(order, taxRate, logArray, counter) {
  const result = calculateOrderTotal(order, taxRate);   // pure
  logArray.push(`Processed ${result.id}: $${result.total.toFixed(2)}`);  // explicit mutation
  counter.count += 1;   // explicit mutation
  return result;
}

// Usage:
const logArray = [];
const counter = { count: 0 };

const result1 = processOrder({ id: "o1", items: [{ price: 10, qty: 2 }] }, 0.08, logArray, counter);
const result2 = processOrder({ id: "o2", items: [{ price: 5,  qty: 3 }] }, 0.08, logArray, counter);

console.log(logArray);
console.log("Total processed:", counter.count);
```

**The walkthrough — what changed:**

The impure version read from and wrote to `log` and `totalProcessed` — global variables. The pure version:
1. `calculateOrderTotal` takes `taxRate` as an argument instead of hardcoding or reading it from outside. Returns a new order object with totals added. No side effects.
2. `processOrder` is still impure (it mutates `logArray` and `counter`) but the impurity is **explicit** — the mutable things are passed in, not hidden globals. Tests can inject a fresh `logArray` and `counter` each time.

**CS lens — explicit over implicit dependencies:**

Impure code hides its dependencies. `calculateTax()` implicitly depends on `taxRate`. `processOrder()` implicitly depends on `log` and `totalProcessed`. Making dependencies explicit (passing them as arguments) converts implicit dependencies to explicit ones — which can be controlled, substituted, and reasoned about.

**SE lens — testability through injection:**

```js
// Test calculateOrderTotal with zero setup:
const testOrder = { id: "t1", items: [{ price: 100, qty: 1 }] };
const result = calculateOrderTotal(testOrder, 0.1);
console.assert(result.total === 110, "100 base + 10% tax = 110");
```

No global state. No cleanup. One function call. Compare to testing the original `processOrder`: you would need to reset `log` and `totalProcessed` before each test and verify their values after — with risk of test interference.

**What breaks when injection is skipped:**

The original `processOrder` is not testable in isolation. Its behavior depends on the current state of `log` and `totalProcessed` — which may have been modified by a previous test. Test 2 may see `totalProcessed = 1` (from test 1) even though it started fresh. This is a **test contamination** bug. It is common, insidious, and entirely avoidable by making dependencies explicit.

---

### SAVE AND TRY

```js
// Test the pure core:
const order = { id: "test", items: [{ price: 50, qty: 2 }] };  // 2 × $50 = $100
const result = calculateOrderTotal(order, 0.08);

console.assert(result.subtotal === 100,   "subtotal is 100");
console.assert(result.tax === 8,          "tax is 8% of 100 = 8");
console.assert(result.total === 108,      "total is 108");
console.log("Order calculation tests passed");
```

Expected: `"Order calculation tests passed"` — all three assertions pass.

**Change something:** Call `calculateOrderTotal` with a different `taxRate`: `calculateOrderTotal(order, 0.2)`. Expected: `tax = 20`, `total = 120`. Then call it with `taxRate = 0`. Expected: `tax = 0`, `total = 100`. Same function, different behavior from different arguments — not from a global variable.

---

## Connect the Pieces

**What you built:** A pure data pipeline (item totals → order subtotals → discounts → formatted output) and a refactored pure core extracted from an impure function.

**How it connects to LAB-006 (First-Class Functions) and LAB-021 (map/filter/reduce):** Pure functions compose perfectly. `rawOrders.map(order => formatOrder(order, 0.1))` works because `formatOrder` is pure — applying it to each element is safe, has no side effects, and produces results independent of each other.

**How it connects to LAB-018 (Composition):** Pure functions are the ideal components for composition. `compose(formatOrder, calculateSubtotal, calculateTax)` works correctly when all three are pure — their outputs depend only on their inputs, not on shared state that could change between steps.

**How it connects forward:**

- **LAB-020 (Immutability):** Pure functions treat their inputs as immutable — they never modify arguments. Immutability is the data counterpart to pure functions: both avoid hidden state changes.
- **LAB-021 (map/filter/reduce):** These higher-order functions are meaningful precisely because they accept pure function callbacks. A `map` with a pure callback is predictable; a `map` with an impure callback (that writes to a database per element) is an anti-pattern.
- **LAB-060 (Unit Testing):** The ease of testing pure functions IS the unit testing argument. Pure functions eliminate all test setup. Every function you write as pure is a function you can test in one line.
- **LAB-033 (Dynamic Programming / Memoization):** Memoization is safe only for pure functions. You cannot safely cache the result of an impure function because the same inputs may produce different outputs on the next call.

**The real-world connection:**

React's component render functions are intended to be pure: given the same props and state, always return the same JSX. This is why React can optimize re-renders, support concurrent mode, and enable server-side rendering — the render function's purity guarantees predictable output. Redux reducers are required to be pure: `(state, action) => newState`. Elm, Haskell, and functional languages enforce purity at the language level. Every React developer, every Redux user, and every developer who writes testable code is implicitly applying the principle of pure functions.

---

## What Breaks Without This

**Concrete failure — test contamination from shared state:**

```js
let totalOrders = 0;

function processOrder(amount) {
  totalOrders += 1;
  return { orderId: totalOrders, amount };
}

// "Test" 1:
const o1 = processOrder(100);
console.assert(o1.orderId === 1, "first order should be ID 1");

// "Test" 2 (in the same console session):
const o2 = processOrder(200);
console.assert(o2.orderId === 2, "second order should be ID 2");

// Now run "test 1" again:
const o3 = processOrder(100);
console.assert(o3.orderId === 1, "first order should be ID 1");  // FAILS: returns 3
```

The third assertion fails because `totalOrders` was not reset between tests. In a test suite, this causes intermittent failures that depend on test execution order — the hardest class of bug to debug. Pure functions eliminate this entirely: there is no shared state to contaminate.

---

## Definition of Done

Verify each item before moving to LAB-020.

- [ ] `add(3, 4) === 7` passes; you can verify this is pure by checking: no external reads, no external writes
- [ ] `calculateItemTotal({ quantity: 3, unitPrice: 9.99 })` returns `29.97` — testable with no setup
- [ ] `calculateOrderSubtotal` handles empty `items` array — returns `0`
- [ ] `calculateOrderTotal(order, 0.1)` injects the tax rate — no global variables
- [ ] The entire order pipeline runs on `rawOrders` with correct totals
- [ ] You can identify the specific side effect in `recordSale(amount)` and explain why it prevents isolation

**Git commit:**

```
git add .
git commit -m "LAB-019: pure data pipeline — calculateOrderTotal extracts impure side effects to explicit parameters, enabling zero-setup testing"
```

---

## Quick Check Answers

**1. If `calculateTax(100)` returns different values on two calls, is it pure?**

No. A pure function must satisfy two conditions: (1) same inputs always produce the same output, and (2) no side effects. If the same input (`100`) produces different outputs, condition 1 is violated — the function must be reading external state (like `taxRate`) that changed between calls. A pure version would take `taxRate` as an explicit argument: `calculateTax(price, taxRate)`.

**2. What is a "side effect"? Give three examples.**

A side effect is any effect a function has on the world outside its return value. Three examples: (1) writing to a variable outside the function (`totalRevenue += amount`) — modifies external state, (2) writing to `localStorage` or a database — I/O, (3) calling `console.log` — writes to the console output. Reading external state (like the system clock or a global variable) is sometimes considered a side effect as well — it makes the function's output non-deterministic.

**3. Why are pure functions trivially testable?**

A pure function's entire behavior is determined by its arguments and returns nothing but its return value. Testing requires only: call the function with specific arguments, check the return value, assert it equals the expected value. No database to reset, no global state to initialize, no network to mock, no clock to freeze. Every test is three lines at most. Impure functions require setting up external state before the call and verifying or cleaning up external state after — setup and teardown that can itself contain bugs.

---

*Next: LAB-020 — Immutability*
