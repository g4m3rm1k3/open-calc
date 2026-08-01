# FOUNDATIONS — LAB-057 — Fail Fast and Defensive Programming

**Series:** FOUNDATIONS — Part IX: Software Engineering Principles
**Environment:** TypeScript playground (browser DevTools or Node)
**Time:** 35–45 minutes.

---

## What You Will Build

A deeply nested validation function that silently propagates bad data, and a flat refactored version using guard clauses that fail immediately at the entry point. After this lab you will be able to recognize when a function is allowing invalid state to travel deep into a system, rewrite it with guard clauses, and explain why failing early is safer than failing late.

---

## What You Need to Know First

**From LAB-009 (Error Handling):** Throwing an error unwinds the call stack — the section from the throw site up to the nearest `catch` block. A guard clause uses `throw` to stop a function before it does any real work.

**From LAB-056 (Law of Demeter):** Defensive programming is complementary to LoD — both aim to keep invalid and unknown state contained.

---

> **Quick Check — try to answer before reading:**
>
> 1. What is the difference between failing fast and letting an error propagate?
> 2. What is a guard clause? Where does it appear in a function?
> 3. What does "deeply nested validation" look like — and why is it worse than failing early?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Problem: Silent Propagation

```typescript
function processPayment(
  userId: string | null | undefined,
  amount: number,
  currency: string
): string {
  if (userId) {
    if (amount > 0) {
      if (currency === 'USD' || currency === 'EUR') {
        // Only here, four levels deep, do we do real work:
        const receipt = `Charged ${userId} for ${amount} ${currency}`;
        console.log(receipt);
        return receipt;
      } else {
        console.log('Unknown currency — ignoring');
        return '';          // silently returns nothing
      }
    } else {
      console.log('Amount must be positive');
      return '';            // silently returns nothing
    }
  } else {
    console.log('No user — ignoring');
    return '';              // silently returns nothing
  }
}
```

**The walkthrough:** If `userId` is `null`, the function logs a message and returns an empty string. The caller receives `''` and might treat it as success. If `currency` is invalid, the same happens — the caller gets `''` and has no way to distinguish "I succeeded with an empty receipt" from "I rejected the input silently." Bad data travels all the way through the function before being discarded, and the caller is never informed of the rejection.

**The CS lens — deep nesting is structural debt.** Each level of indentation represents a condition that must be true for the function to do real work. The real work lives at the deepest level. Reading the function requires tracing every condition to understand when work happens. This is called "arrow code" — the code points to the right as it adds conditions.

**The SE lens — silent failure breaks the caller's contract.** The caller of `processPayment` expects a receipt string on success. Returning `''` on failure violates that implicit contract. The caller cannot tell success from failure unless it also checks the returned string — coupling the caller to the function's internal error representation.

---

### Step 2 — Guard Clauses: Fail Immediately

A guard clause is an `if` at the start of a function that checks a precondition and returns (or throws) immediately if it is not met. Guard clauses invert each nested `if` — instead of "if valid, proceed," they say "if invalid, stop."

```typescript
function processPayment(
  userId: string | null | undefined,
  amount: number,
  currency: string
): string {
  // Guard 1: known precondition — userId must be present
  if (!userId) {
    throw new Error('processPayment: userId is required');
  }

  // Guard 2: known precondition — amount must be positive
  if (amount <= 0) {
    throw new Error(`processPayment: amount must be positive, got ${amount}`);
  }

  // Guard 3: known precondition — only supported currencies
  const supportedCurrencies = ['USD', 'EUR'];
  if (!supportedCurrencies.includes(currency)) {
    throw new Error(`processPayment: unsupported currency "${currency}"`);
  }

  // All preconditions met — real work begins here, at the top level:
  const receipt = `Charged ${userId} for ${amount} ${currency}`;
  console.log(receipt);
  return receipt;
}
```

**The walkthrough:** The function checks each precondition in turn. If any fails, it throws immediately. The throw unwinds the call stack and delivers a precise error message to the nearest `catch` block. If all guards pass, the function proceeds to real work at the top indentation level — no nesting. The real work is now visible and flat.

**The CS lens — preconditions as contracts.** Each guard clause expresses a precondition: a condition that must be true before the function can do its work. Preconditions are part of the function's contract. Stating them explicitly at the top makes the contract visible to both the caller and the reader.

**The SE lens — fail fast principle.** The fail-fast principle says: detect invalid state as close as possible to its entry point and stop immediately. Continuing with invalid data is worse than stopping — invalid data corrupts output, and the further it travels, the harder the eventual error is to trace. A precise error at the guard clause is trivially debuggable. A corrupted result three function calls later is not.

---

### Step 3 — Assertions for Internal Invariants

Guard clauses protect entry points. Assertions protect internal invariants — conditions that must be true in the middle of a function due to the logic that preceded them.

```typescript
function splitPayment(
  totalAmount: number,
  numberOfParts: number
): number[] {
  if (totalAmount <= 0) {
    throw new Error('splitPayment: totalAmount must be positive');
  }
  if (numberOfParts <= 0 || !Number.isInteger(numberOfParts)) {
    throw new Error('splitPayment: numberOfParts must be a positive integer');
  }

  const baseAmount = Math.floor(totalAmount / numberOfParts);
  const remainder  = totalAmount - baseAmount * numberOfParts;

  const parts = Array.from({ length: numberOfParts }, (_, index) => {
    // Last part absorbs the remainder from integer division:
    return index === numberOfParts - 1 ? baseAmount + remainder : baseAmount;
  });

  // Internal assertion: the parts must sum to the original total.
  // If this fails, there is a logic error in the split calculation above.
  const computedTotal = parts.reduce((sum, part) => sum + part, 0);
  if (computedTotal !== totalAmount) {
    throw new Error(
      `splitPayment: assertion failed — parts sum to ${computedTotal}, expected ${totalAmount}`
    );
  }

  return parts;
}
```

**The walkthrough:** Entry guards reject invalid input at the top. The split calculation runs. Then an assertion checks that the split is correct. This assertion will never trigger if the logic above is right — but it will trigger immediately if there is a rounding bug, making the bug visible at its source rather than silently returning wrong data to the caller.

**The CS lens — assertions as self-checks.** Assertions are boolean conditions that must be true at a specific point in code. They are checks that the programmer believes will always pass — a failing assertion means there is a bug in the code, not in the input. Assertions are commonly disabled in production (unlike guard clauses, which always run) because their purpose is to catch development-time bugs.

---

## Connect the Pieces

- **Python's `assert` statement** is a built-in assertion mechanism. Python can run with assertions disabled using the `-O` (optimize) flag, which is why they should not be used for input validation — only for invariants.
- **Database constraints** (NOT NULL, CHECK, FOREIGN KEY) are guard clauses at the database level. They fail fast before a bad row is written, preventing corrupt data from entering the database. This is the same principle applied at a different layer.
- **Rust's type system** makes many guard clauses unnecessary by making invalid states unrepresentable. If a type cannot be `null` (Rust has no `null`), a null guard clause is never needed. TypeScript's strict mode (`strictNullChecks`) brings the same benefit to TypeScript.

---

## What Breaks Without This

**The silent cascade:**

A downstream function receives a `processPayment` call where `userId` is `null`. Without guards, the payment appears to succeed — the function returns `''`. The caller stores that receipt in the database. A report generation job later reads the empty receipts and produces a report with missing data. The bug is noticed a week later by a customer, traced back through three layers of code to a `null` check that was missing at the entry point.

With fail fast: the error throws at `processPayment`, is caught immediately, logged with the stack trace, and the caller handles the rejection. The bug is found in minutes, not a week.

---

## Definition of Done

- [ ] `processPayment` uses guard clauses — all validation at the top, real work flat at the same level
- [ ] Each guard clause throws with a specific message that names the function and the violated precondition
- [ ] `splitPayment` has an internal assertion that catches logic bugs after the calculation
- [ ] You can explain the difference between a guard clause (input validation) and an assertion (internal invariant)
- [ ] Remove the assertion from `splitPayment` and introduce a deliberate rounding bug — confirm the bug now silently returns wrong data

**Git commit:**

```
git add src/
git commit -m "LAB-057: Fail fast — guard clauses replace nested validation; invalid input stopped at entry, not silently propagated"
```

---

## Quick Check Answers

1. **Failing fast stops execution immediately when invalid state is detected. Letting an error propagate means continuing with bad data until something eventually fails — potentially far from the source, with a confusing error message.** Failing fast produces a clear, early error. Silent propagation produces corrupt output or a confusing late failure.
2. **A guard clause is an `if` statement at the top of a function that checks a precondition and returns or throws immediately if it is not met.** It appears at the very beginning of a function, before any real work. Each guard is one condition — the function has as many guards as it has preconditions.
3. **Deep nesting ("arrow code") validates conditions layer by layer, with real work at the innermost level.** It is worse than failing early because: (1) the real work is buried under multiple levels of indentation, making it harder to read; (2) invalid inputs cause silent returns rather than thrown errors; (3) the caller cannot distinguish success from silent failure without checking the return value for a sentinel.
