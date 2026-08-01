# FOUNDATIONS — LAB-053 — DRY, YAGNI, and KISS

**Series:** FOUNDATIONS — Part IX: Software Engineering Principles
**Environment:** Browser DevTools console or TypeScript playground
**Time:** 45–60 minutes.

---

## What You Will Build

A DRY violation (duplicated pricing logic), a DRY fix (single authoritative source), a YAGNI violation (unused abstraction layer), its removal, and a KISS demonstration where three similar lines beats a premature abstraction. After this lab you will understand the tension between these principles and when each wins.

---

## What You Need to Know First

**From LAB-048 (SRP):** SRP and DRY reinforce each other — a class with one responsibility is less likely to contain duplicated logic, because duplication usually means two things that belong in the same place are in different places.

**From LAB-053 Prerequisite — LAB-031 (Sorting):** YAGNI is frequently violated when building "future-proof" sorting or filtering abstractions before any concrete use case exists.

---

> **Quick Check — try to answer before reading:**
>
> 1. DRY says "every piece of knowledge should have a single authoritative representation." Is duplicated code always a DRY violation?
> 2. YAGNI says "don't build features before they are required." What is the cost of building features too early?
> 3. Three lines of similar code — is that automatically a KISS violation or a DRY violation?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — DRY: Every Piece of Knowledge Has One Source

**DRY** stands for Don't Repeat Yourself. The precise statement from "The Pragmatic Programmer": "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system."

The keyword is **knowledge** — not code. Two pieces of code that look similar but express different knowledge are NOT a DRY violation. Two pieces of code that express the SAME knowledge (the same business rule, the same formula, the same invariant) are a DRY violation even if the code is not identical.

**The violation:**

```typescript
// Two places that know how to apply a discount:
function calculateCartTotal(items: { price: number; quantity: number }[]): number {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Business rule: 10% discount for orders over $100
  if (subtotal > 100) {
    return subtotal * 0.90;
  }
  return subtotal;
}

function calculateOrderConfirmationTotal(
  items: { price: number; quantity: number }[],
  shippingCost: number,
): number {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Same business rule — duplicated:
  const discountedSubtotal = subtotal > 100 ? subtotal * 0.90 : subtotal;
  return discountedSubtotal + shippingCost;
}
```

**Why this is a DRY violation:** The discount rule ("10% off orders over $100") is encoded in two places. When the rule changes (to 15% off orders over $150), a developer must find and update both. If they miss one, the cart shows a different total than the confirmation — a data integrity bug that customers will notice.

**The fix:**

```typescript
// Single authoritative source of the discount rule:
const DISCOUNT_THRESHOLD = 100;
const DISCOUNT_RATE      = 0.10;

function calculateDiscount(subtotal: number): number {
  return subtotal > DISCOUNT_THRESHOLD ? subtotal * DISCOUNT_RATE : 0;
}

function calculateCartTotal(items: { price: number; quantity: number }[]): number {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return subtotal - calculateDiscount(subtotal);
}

function calculateOrderConfirmationTotal(
  items: { price: number; quantity: number }[],
  shippingCost: number,
): number {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return subtotal - calculateDiscount(subtotal) + shippingCost;
}
```

Now `calculateDiscount` is the single authoritative source. Changing the discount rule in one place updates all callers.

**The CS lens — knowledge vs code:** The subtotal calculation appears twice (`items.reduce(...)`). Is this a DRY violation? It depends on the context. If "how to sum items" is the same knowledge (and might change consistently), extract it. If the two reductions diverge in future (one sums list prices, one sums discounted prices), extracting was premature. DRY is a judgment about whether two expressions encode the SAME knowledge.

---

### Step 2 — YAGNI: Build What Is Required, Nothing More

**YAGNI** stands for You Ain't Gonna Need It. The principle: do not build features, abstractions, or flexibility until a concrete use case requires them.

**The violation:**

```typescript
// A payment strategy framework built before there is a second payment method:
interface PaymentStrategy {
  process(amount: number): Promise<boolean>;
}

interface PaymentStrategyFactory {
  createStrategy(type: string): PaymentStrategy;
}

class StripePaymentStrategy implements PaymentStrategy {
  async process(amount: number): Promise<boolean> {
    console.log(`Processing $${amount} via Stripe`);
    return true;
  }
}

class PaymentStrategyFactoryImpl implements PaymentStrategyFactory {
  createStrategy(type: string): PaymentStrategy {
    if (type === 'stripe') return new StripePaymentStrategy();
    throw new Error(`Unknown payment type: ${type}`);
  }
}

// Usage:
const factory = new PaymentStrategyFactoryImpl();
const strategy = factory.createStrategy('stripe');
await strategy.process(99.99);
```

**The problem:** There is only one payment method (Stripe). The factory, the strategy interface, and the two classes are all in service of one concrete thing. The abstraction exists in anticipation of future payment methods that have not been specified, prioritised, or necessarily coming.

Cost of the YAGNI violation:
- More code to read, test, and maintain
- The abstraction might not fit the second payment method when it arrives
- New developers spend time understanding the pattern before understanding the single thing it does

**The YAGNI fix:**

```typescript
// Just process payments — one concrete thing:
async function processStripePayment(amount: number): Promise<boolean> {
  console.log(`Processing $${amount} via Stripe`);
  return true;
}

// When a second payment method is needed, THEN introduce the abstraction.
// The refactoring will be informed by the actual requirements of both methods.
```

**The SE lens — abstractions cost more than they save when early:** A premature abstraction guesses the shape of future requirements. The actual requirements, when they arrive, often don't match the guess. You then have two costs: the refactoring you would have done anyway, plus undoing the premature abstraction. YAGNI says: wait for the concrete requirements.

---

### Step 3 — KISS: Three Similar Lines Is Better Than a Wrong Abstraction

**KISS** stands for Keep It Simple. Complexity is a cost, not a feature.

The KISS principle applies specifically to premature abstraction: three similar lines of code is often clearer than a helper function that names an abstraction that does not yet exist.

```typescript
// Three similar lines — CLEAR:
const adminAccess   = user.role === 'admin'   && user.isActive;
const editorAccess  = user.role === 'editor'  && user.isActive;
const viewerAccess  = user.role === 'viewer'  && user.isActive;

// The "abstraction" — WORSE when these three roles are independent:
const hasAccess = (role: string): boolean => user.role === role && user.isActive;
const adminAccess2  = hasAccess('admin');
const editorAccess2 = hasAccess('editor');
const viewerAccess2 = hasAccess('viewer');
```

The three lines are simple, explicit, and immediately readable. The `hasAccess` function introduces a name for an abstraction that may not generalise: what if `viewerAccess` needs different rules (no `isActive` check)? The "abstraction" becomes wrong as soon as one case diverges.

**The rule:** Extract when you have three uses AND they all express the SAME knowledge AND that knowledge is likely to change together. Three uses of DIFFERENT knowledge that happens to look similar should stay separate.

---

### Step 4 — The Tension Between DRY, YAGNI, and KISS

These principles create real tension:

| Situation | Principle that wins |
|---|---|
| Same business rule in two places | DRY — extract |
| Same code pattern, but rules might diverge | KISS — keep separate |
| Abstraction for one concrete use case | YAGNI — remove |
| Abstraction for two confirmed use cases | DRY — extract |
| Complex abstraction, simple alternative exists | KISS — simplify |

The resolution: DRY wins when the knowledge is definitively the same and the duplication will cause bugs on change. YAGNI wins when the second use case does not yet exist. KISS wins when the abstraction is more complex than the things it abstracts.

---

## Connect the Pieces

- **React hooks follow DRY:** `useLocalStorage`, `useWindowSize`, `useDebounce` are extractions of code that appeared in two or more components with identical knowledge. One hook, one authoritative source.
- **Django's DRY:** "Don't Repeat Yourself" appears in Django's design philosophy. Template inheritance (`{% extends %}`) eliminates repeated HTML structure.
- **Configuration as code:** Instead of duplicating database connection strings in test and production code, a single configuration function reads from environment variables — one source.

---

## What Breaks Without This

**The DRY violation that causes a data integrity bug:**

A developer changes the discount from 10% to 15% in `calculateCartTotal`. They miss `calculateOrderConfirmationTotal`. The cart shows the customer 15% off. The confirmation email (and the charge) applies 10% off. The customer calls support confused why the total changed between the cart and the order confirmation. The bug is in production before anyone notices because both paths are "working."

---

## Definition of Done

- [ ] Extract `calculateDiscount` — changing the threshold in one place updates both cart and confirmation calculations
- [ ] `processStripePayment` as a direct function — no factory, no strategy
- [ ] Write a 5-minute rule: "If I needed to explain this abstraction to a new developer in 5 minutes, how long would it take?" Apply it to your code
- [ ] Identify one DRY violation in your own code (or the examples) and fix it
- [ ] Explain the tension: "When would you NOT extract three similar lines of code?"

**Git commit:**

```
git add src/
git commit -m "LAB-053: DRY extracts shared knowledge; YAGNI removes premature abstraction; KISS keeps three lines instead of a wrong abstraction"
```

---

## Quick Check Answers

1. **No.** Duplicated code is only a DRY violation if it encodes the same knowledge. Two loops that happen to use the same pattern but compute different things for different reasons can change independently — extracting them would be premature coupling. DRY is about knowledge, not about code similarity.
2. **The cost is wasted effort on features that may never be needed, abstractions that don't fit actual requirements when they arrive, and complexity that new developers must understand before reaching the actual functionality.** Building early also makes the design harder to change — you are now coupled to the premature decision.
3. **Three similar lines is neither automatically a DRY violation nor a KISS violation.** The question is: do the three lines encode the same piece of knowledge? If yes and it might change — extract (DRY). If they encode similar but independently variable knowledge — keep separate (KISS). "Similar" is not "same."
