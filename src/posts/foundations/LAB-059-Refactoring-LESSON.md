# FOUNDATIONS — LAB-059 — Refactoring

**Series:** FOUNDATIONS — Part IX: Software Engineering Principles
**Environment:** TypeScript playground
**Time:** 40–55 minutes.

---

## What You Will Build

A messy function refactored step by step using three named refactoring techniques: Extract Method, Rename Variable, and Introduce Parameter Object. You will apply each technique, run the same logic before and after, and verify the observable behavior is identical. After this lab you will be able to name and apply these techniques deliberately, and explain why the test suite is the safety net that makes refactoring safe.

---

## What You Need to Know First

**From LAB-058 (Code Smells):** Refactoring is the cure for smells — each technique targets a specific smell.
**From LAB-060 (Unit Testing):** Tests prove that refactoring did not change behavior. Refactoring without tests is renovation without checking if the roof is still attached. (LAB-060 comes next; this lesson sets the motivation for it.)

---

> **Quick Check — try to answer before reading:**
>
> 1. Refactoring changes the internal structure of code without changing its external behavior. How do you know you haven't changed the behavior?
> 2. What is "Extract Method"? When do you apply it?
> 3. What is the boy scout rule applied to code?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Starting Point: A Messy Function

```typescript
function processOrderList(
  o: Array<{
    id: string;
    items: Array<{ p: number; q: number }>;
    dc: number;
    r: string;
  }>
): void {
  for (let i = 0; i < o.length; i++) {
    let st = 0;
    for (let j = 0; j < o[i].items.length; j++) {
      st += o[i].items[j].p * o[i].items[j].q;
    }
    const t = st - (st * o[i].dc / 100);
    let tx = 0;
    if (o[i].r === 'CA') {
      tx = t * 0.0725;
    } else if (o[i].r === 'NY') {
      tx = t * 0.08;
    } else {
      tx = t * 0.06;
    }
    console.log(`Order ${o[i].id}: subtotal=${st.toFixed(2)}, discounted=${t.toFixed(2)}, tax=${tx.toFixed(2)}, total=${(t + tx).toFixed(2)}`);
  }
}
```

**The walkthrough:** This function loops over orders. For each order, it computes a subtotal by multiplying price by quantity for each item. It then applies a discount percent. It then computes tax based on a region code. It then logs a summary line. All of this is in one function with abbreviated variable names (`o`, `st`, `t`, `tx`, `i`, `j`, `p`, `q`, `dc`, `r`) and no extraction.

Problems: (1) single-letter variable names make intent invisible, (2) three distinct responsibilities in one function (subtotal, tax, output), (3) the tax logic cannot be tested or reused independently, (4) the entire function must be read to understand any part of it.

---

### Step 2 — Refactoring 1: Rename Variable

Rename every abbreviated variable to communicate its intent. This changes zero behavior — it only changes what the code says.

```typescript
function processOrderList(
  orders: Array<{
    id: string;
    items: Array<{ price: number; quantity: number }>;
    discountPercent: number;
    region: string;
  }>
): void {
  for (let orderIndex = 0; orderIndex < orders.length; orderIndex++) {
    const order = orders[orderIndex];
    let subtotal = 0;

    for (let itemIndex = 0; itemIndex < order.items.length; itemIndex++) {
      const item = order.items[itemIndex];
      subtotal += item.price * item.quantity;
    }

    const discountedTotal = subtotal - (subtotal * order.discountPercent / 100);
    let tax = 0;

    if (order.region === 'CA') {
      tax = discountedTotal * 0.0725;
    } else if (order.region === 'NY') {
      tax = discountedTotal * 0.08;
    } else {
      tax = discountedTotal * 0.06;
    }

    const grandTotal = discountedTotal + tax;
    console.log(
      `Order ${order.id}: subtotal=${subtotal.toFixed(2)}, discounted=${discountedTotal.toFixed(2)}, tax=${tax.toFixed(2)}, total=${grandTotal.toFixed(2)}`
    );
  }
}
```

**The walkthrough:** Every variable now names its purpose. `order.discountPercent` tells you what the value means. `discountedTotal` tells you what the result represents. The logic has not changed — the same arithmetic, the same `if`/`else` structure. A diff between this version and the previous shows only renamed identifiers.

**The SE lens — names as documentation.** A well-named variable does not need a comment. `subtotal` tells you it is the sum before discounts and taxes. `discountedTotal` tells you it is after discount but before tax. The code is now self-documenting.

---

### Step 3 — Refactoring 2: Extract Method

Pull the subtotal calculation and the tax calculation into their own functions. Each extracted function has one job and can be read, tested, and reused independently.

```typescript
function calculateSubtotal(
  items: Array<{ price: number; quantity: number }>
): number {
  return items.reduce(
    (runningTotal, item) => runningTotal + item.price * item.quantity,
    0
  );
}

function calculateTax(discountedTotal: number, region: string): number {
  if (region === 'CA') return discountedTotal * 0.0725;
  if (region === 'NY') return discountedTotal * 0.08;
  return discountedTotal * 0.06;
}

function processOrderList(
  orders: Array<{
    id: string;
    items: Array<{ price: number; quantity: number }>;
    discountPercent: number;
    region: string;
  }>
): void {
  for (const order of orders) {
    const subtotal       = calculateSubtotal(order.items);
    const discountAmount = subtotal * (order.discountPercent / 100);
    const discountedTotal = subtotal - discountAmount;
    const tax            = calculateTax(discountedTotal, order.region);
    const grandTotal     = discountedTotal + tax;

    console.log(
      `Order ${order.id}: subtotal=${subtotal.toFixed(2)}, ` +
      `discounted=${discountedTotal.toFixed(2)}, ` +
      `tax=${tax.toFixed(2)}, total=${grandTotal.toFixed(2)}`
    );
  }
}
```

**The walkthrough:** `calculateSubtotal` is a pure function — given items, it returns the sum. `calculateTax` is a pure function — given a total and a region, it returns the tax. `processOrderList` now reads like a description of what happens: calculate subtotal, calculate discount, calculate tax, log. Each step is one line. The function body is an executive summary of the algorithm.

**The CS lens — separation of concerns.** Each function does one thing. Subtotal calculation is separate from tax calculation is separate from output. Each can be tested independently. A bug in tax calculation is isolated to `calculateTax` — it does not touch `calculateSubtotal`.

**The SE lens — Extract Method.** Extract Method is the most common refactoring. When a block of code has a name that can be described in one phrase, extract it into a function with that name. The rule of thumb: if you need a comment to explain what a code block does, the block should be a function whose name is the comment.

---

### Step 4 — Refactoring 3: Introduce Parameter Object

The order data has multiple related fields passed around together. Introduce a named type.

```typescript
interface OrderItem {
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  discountPercent: number;
  region: string;
}

function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce(
    (runningTotal, item) => runningTotal + item.price * item.quantity,
    0
  );
}

function calculateTax(discountedTotal: number, region: string): number {
  if (region === 'CA') return discountedTotal * 0.0725;
  if (region === 'NY') return discountedTotal * 0.08;
  return discountedTotal * 0.06;
}

function processOrders(orders: Order[]): void {
  for (const order of orders) {
    const subtotal        = calculateSubtotal(order.items);
    const discountedTotal = subtotal - subtotal * (order.discountPercent / 100);
    const tax             = calculateTax(discountedTotal, order.region);
    const grandTotal      = discountedTotal + tax;

    console.log(
      `Order ${order.id}: subtotal=${subtotal.toFixed(2)}, ` +
      `discounted=${discountedTotal.toFixed(2)}, ` +
      `tax=${tax.toFixed(2)}, total=${grandTotal.toFixed(2)}`
    );
  }
}
```

**The walkthrough:** `Order` and `OrderItem` are TypeScript interfaces — they declare the shape of an object. TypeScript enforces these shapes at compile time. Any code that creates an `Order` must include `id`, `items`, `discountPercent`, and `region`. The `processOrders` function now reads as a contract: "give me a list of `Order` objects."

**The CS lens — typed parameter objects.** A parameter object groups related data under a name. TypeScript's `interface` keyword declares the contract. The type system catches any field that is missing or of the wrong type before the code runs.

---

## Connect the Pieces

- **IDE support for refactoring.** VS Code can perform Rename Variable and Extract Function automatically. Press F2 on a variable name to rename it across all uses. Highlight a block and select "Refactor → Extract Function" to extract it. These automated refactorings are safe — the IDE tracks all references. Manual search-and-replace is not — it can miss an occurrence.
- **The boy scout rule:** leave the code cleaner than you found it. Every time you touch a file, apply one small refactoring — rename a confusing variable, extract a block into a function. Over time, the codebase improves incrementally without a big rewrite.
- **Automated refactoring in production systems.** Large companies (Google, Facebook) run automated codemods — scripts that apply a specific refactoring to thousands of files simultaneously. The principle is the same: change structure, preserve behavior, verify with tests.

---

## What Breaks Without This

**The refactoring without tests:**

The developer extracts `calculateTax` but accidentally writes `0.725` instead of `0.0725` for the California rate. Without a test suite, this bug ships. Customers in California are overcharged by 10x on tax. The bug is caught by a customer, not by the developer.

With a unit test for `calculateTax` that asserts `calculateTax(100, 'CA') === 7.25`, the test fails immediately when `0.725` is used, before the code ships.

---

## Definition of Done

- [ ] All single-letter and abbreviated variable names replaced with descriptive names
- [ ] `calculateSubtotal` extracted as a pure function, callable and testable independently
- [ ] `calculateTax` extracted as a pure function, callable and testable independently
- [ ] `Order` and `OrderItem` interfaces defined; `processOrders` accepts `Order[]`
- [ ] Calling `processOrders` with the same data before and after refactoring produces identical console output

**Git commit:**

```
git add src/
git commit -m "LAB-059: Refactoring — Rename Variable, Extract Method, and Introduce Parameter Object applied to processOrderList; behavior preserved, structure clarified"
```

---

## Quick Check Answers

1. **You know you haven't changed behavior because a test suite runs the same inputs and asserts the same outputs before and after the refactoring.** Without tests, the only way to know is careful manual review — which is error-prone for non-trivial changes.
2. **Extract Method pulls a block of code into a named function.** Apply it when: (1) a block of code has a name that can be stated in one phrase, (2) the block is used more than once (avoiding duplication), (3) the function body is long enough that a reader has to scroll to understand any one part of it.
3. **The boy scout rule: leave the code cleaner than you found it.** Every time you touch a file, apply at least one small improvement — rename a confusing variable, add a missing type annotation, extract a repeated block. The codebase improves continuously without a big-bang rewrite.
