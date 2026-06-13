# FOUNDATIONS — LAB-055 — Tell Don't Ask and Command-Query Separation

**Series:** FOUNDATIONS — Part IX: Software Engineering Principles
**Environment:** TypeScript playground
**Time:** 40–55 minutes.

---

## What You Will Build

A Tell Don't Ask violation (external code making decisions about an object's state), a refactored version where the object makes its own decisions, a Command-Query Separation violation (a method that both modifies state and returns a value), and its split into a command and a query. After this lab you will understand how these two principles enforce encapsulation in practice.

---

## What You Need to Know First

**From LAB-013 (Encapsulation):** Encapsulation bundles data with the methods that operate on it. Tell Don't Ask and CQS are two specific practices that enforce encapsulation properly.

**From LAB-019 (Pure Functions):** CQS's query methods are pure functions — same input, same output, no side effects.

---

> **Quick Check — try to answer before reading:**
>
> 1. "Tell Don't Ask" — what are you telling, and what are you asking?
> 2. A method that both modifies a list and returns the removed element — which CQS rule does it violate?
> 3. Can you always separate commands and queries? Name one case where it is genuinely difficult.
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Tell Don't Ask: The Violation

"Tell Don't Ask" says you should TELL an object to do something rather than ASKING for its state and making decisions externally.

```typescript
class BankAccount {
  constructor(
    private balance: number,
    private readonly overdraftLimit: number,
  ) {}

  getBalance(): number { return this.balance; }
  getOverdraftLimit(): number { return this.overdraftLimit; }
  deductAmount(amount: number): void { this.balance -= amount; }
}

// VIOLATION: external code asks for state and makes decisions that the account should make:
function processPayment(account: BankAccount, amount: number): boolean {
  // This code knows about the account's internal business rules:
  if (account.getBalance() - amount >= -account.getOverdraftLimit()) {
    account.deductAmount(amount);
    return true;
  }
  return false;
}
```

**The walkthrough — why this violates Tell Don't Ask:**

`processPayment` knows:
- How the available balance is calculated (`balance - amount >= -overdraftLimit`)
- When the account is overdrawn
- How to deduct

This knowledge belongs to `BankAccount`. If the overdraft rule changes (add a fee for overdrafts, restrict overdraft to certain account types), the developer must find every external function that embeds this logic.

**The SE lens — information expert:** Martin Fowler's information expert principle says: give responsibility to the class that has the information needed to fulfill it. `BankAccount` has balance and overdraft limit — it should make the decision, not external callers.

---

### Step 2 — The Fix: Tell the Account

```typescript
class BankAccount {
  private balance: number;
  private readonly overdraftLimit: number;

  constructor(balance: number, overdraftLimit: number) {
    this.balance = balance;
    this.overdraftLimit = overdraftLimit;
  }

  // Tell the account to withdraw — it decides whether it can:
  withdraw(amount: number): boolean {
    if (this.balance - amount < -this.overdraftLimit) {
      return false;  // cannot withdraw
    }
    this.balance -= amount;
    return true;    // withdrawal successful
  }

  // Deposit — tell the account, it handles the update:
  deposit(amount: number): void {
    if (amount <= 0) throw new Error('Deposit amount must be positive');
    this.balance += amount;
  }

  // Query: what is the balance?
  get currentBalance(): number { return this.balance; }

  // Query: is the account overdrawn?
  get isOverdrawn(): boolean { return this.balance < 0; }
}

// The caller tells the account to withdraw — no access to internals needed:
function processPayment(account: BankAccount, amount: number): boolean {
  return account.withdraw(amount);  // the account decides
}
```

**The walkthrough:** The business rule (overdraft limit logic) now lives in `withdraw`. External code calls `account.withdraw(amount)` and receives a boolean — can it or can't it? The caller makes no decisions about account state. If the rule changes, `withdraw` changes — and all callers automatically get the new rule.

---

### Step 3 — Command-Query Separation

**CQS** says a method should be either:
- **A command:** changes state (writes), returns nothing (void)
- **A query:** reads state, returns a value, has NO side effects

A method that does BOTH is a CQS violation — it makes callers uncertain whether calling it is "safe" (can I call this to read the value without triggering side effects?).

**The violation:**

```typescript
class NumberStack {
  private items: number[] = [];

  push(item: number): void { this.items.push(item); }

  // VIOLATION: both removes an item (command) and returns it (query):
  pop(): number | undefined {
    return this.items.pop();
  }

  // VIOLATION: both adds an item and returns the new length:
  addAndGetSize(item: number): number {
    this.items.push(item);
    return this.items.length;
  }
}
```

**`pop` is the famous CQS gray area.** The separation into a pure command and a pure query would be:

```typescript
class CQSStack<T> {
  private items: T[] = [];

  // Command: modify state, return nothing
  push(item: T): void    { this.items.push(item); }
  pop(): void            { this.items.pop(); }
  
  // Query: read state, no side effects
  peek(): T | undefined  { return this.items[this.items.length - 1]; }
  get size(): number     { return this.items.length; }
  get isEmpty(): boolean { return this.items.length === 0; }
}

// Usage:
const topValue = stack.peek();  // query — no side effect
stack.pop();                    // command — removes top

// Vs violation:
const removed = stack.pop();  // What did I just do? Read AND modify?
```

**The CS lens — referential transparency:** A query is referentially transparent — calling it multiple times with the same state produces the same result. You can safely call a query to display state, to debug, to test, without worrying about what it changes. A command changes state — but the change is clearly signaled by returning `void`. Mixing them removes both guarantees.

---

### Step 4 — When CQS Is Genuinely Hard

Some operations are naturally combined: `Queue.dequeue()` returns the item AND removes it. Separating them creates a race condition in multi-threaded environments: read the front, then remove it — but another thread might remove it between those two operations.

```typescript
// Thread-safe alternative: the combined operation is atomic:
class AtomicQueue<T> {
  private items: T[] = [];

  enqueue(item: T): void { this.items.push(item); }

  // In single-threaded JavaScript: CQS violation but practically acceptable
  // In multi-threaded C++: the combined operation is necessary for atomicity
  dequeue(): T | undefined { return this.items.shift(); }

  // CQS-compliant alternative (safe in single-threaded code):
  front(): T | undefined { return this.items[0]; }
  removeFirst(): void    { this.items.shift(); }
}
```

**The SE lens — pragmatism over purity:** CQS is a strong default, not an absolute rule. In the JavaScript event loop (single-threaded), combining `peek` and `pop` is pragmatically acceptable even if it violates CQS. Understand the principle, know when it applies, and document when you intentionally break it.

---

## Connect the Pieces

- **CQRS (Command Query Responsibility Segregation)** in architecture (LAB-093) is CQS applied at the service level: separate services handle reads and writes. The CQRS architectural pattern is named after the CQS principle you just learned.
- **React's `useState` setter** follows CQS: `setState(value)` is a command (no return value), `state` is a query (read-only). The two are deliberately separated.
- **Functional reactive programming** (RxJS, signals) enforces CQS structurally: observable streams (queries) and subjects/dispatchers (commands) are different types.

---

## What Breaks Without This

**Testing a CQS-violating method:**

```typescript
// BUG: spy / test reads the value AND triggers a side effect:
const sentCount = emailService.sendAndGetCount('alice@example.com');
// Did that just send an email? Yes — because the method both sends and counts.
// In a test, you wanted to check the count — but you triggered an SMTP send too.

// With CQS:
emailService.send('alice@example.com');   // command: sends email (no return)
const count = emailService.sentCount;     // query: reads count (no side effect)
// The query can be called in tests without triggering real email sends.
```

---

## Definition of Done

- [ ] `BankAccount.withdraw` returns `false` when overdraft limit would be exceeded — no external balance checking
- [ ] `processPayment` only calls `account.withdraw` — no knowledge of overdraft logic
- [ ] `CQSStack.pop()` is void; `CQSStack.peek()` has no side effects — verify by calling `peek()` ten times and confirming state is unchanged
- [ ] You can explain why `Array.prototype.pop()` in JavaScript technically violates CQS
- [ ] Name one production system where a CQS violation is pragmatically justified

**Git commit:**

```
git add src/
git commit -m "LAB-055: Tell Don't Ask and CQS — BankAccount owns its overdraft logic; commands return void, queries have no side effects; CQRS architecture named after this principle"
```

---

## Quick Check Answers

1. **You are telling an object to perform an operation. You are asking for its state to make a decision yourself.** Tell: `account.withdraw(100)`. Ask: `if (account.getBalance() >= 100) { account.deductAmount(100); }`. The distinction is whether the decision is made inside the object (Tell) or outside (Ask).
2. **The command rule: commands should return void.** A method that both removes an element (command — modifies state) and returns the removed element (query — returns value) violates CQS. The caller cannot call it without triggering the removal.
3. **Stack/Queue dequeue operations in concurrent systems.** Separating "peek" and "remove" creates a window between the two calls where another thread can remove the element. The combined operation (peek + remove atomically) is necessary for correctness in multi-threaded environments. Some blocking queues also intentionally combine blocking-until-available with consuming — the combination is fundamental to their semantics.
