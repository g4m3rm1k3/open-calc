# FOUNDATIONS — LAB-058 — Code Smells

**Series:** FOUNDATIONS — Part IX: Software Engineering Principles
**Environment:** TypeScript playground
**Time:** 40–50 minutes.

---

## What You Will Build

Four named code smells — God Object, Primitive Obsession, Feature Envy, and Shotgun Surgery — each demonstrated with a concrete example, named precisely, and refactored. After this lab you will be able to identify these smells on sight, name the design principle they violate, and propose the specific refactoring that removes them.

---

## What You Need to Know First

**From LAB-048 (SRP):** God Object directly violates SRP — it has too many reasons to change.
**From LAB-013 (Encapsulation):** Feature Envy and Primitive Obsession are failures of encapsulation — behavior that belongs inside a class living outside it.
**From LAB-057 (Fail Fast):** Removing smells is a precondition for making code defensible.

---

> **Quick Check — try to answer before reading:**
>
> 1. A code smell is not a bug — the program still works. So why fix it?
> 2. What is "Primitive Obsession"? Give a real example.
> 3. What does "Shotgun Surgery" feel like when you are the developer making a change?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — God Object

A God Object is a class that knows too much and does too much. It has accumulated responsibilities that belong to many other classes.

```typescript
class OrderSystem {
  // Data storage — belongs in a Repository
  private orders: Array<{
    id: string;
    userId: string;
    items: Array<{ name: string; price: number; quantity: number }>;
  }> = [];

  // Email formatting — belongs in an EmailFormatter
  formatConfirmationEmail(orderId: string): string {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return '';
    return `Dear customer, your order ${orderId} has been confirmed.`;
  }

  // Tax calculation — belongs in a TaxCalculator
  calculateTax(subtotal: number, region: string): number {
    if (region === 'CA') return subtotal * 0.0725;
    if (region === 'NY') return subtotal * 0.08;
    return subtotal * 0.06;
  }

  // Shipping — belongs in a ShippingService
  calculateShipping(weightKg: number): number {
    return weightKg < 1 ? 4.99 : weightKg * 2.5;
  }

  // Order totaling — belongs in an Order domain object
  calculateOrderTotal(orderId: string, region: string): number {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return 0;
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );
    return subtotal + this.calculateTax(subtotal, region);
  }
}
```

**The walkthrough:** `OrderSystem` stores orders, formats emails, calculates tax, calculates shipping, and totals orders. Any change to any of these domains — a new tax region, a new shipping carrier, a new email template — requires editing this one class. Adding a feature to one area risks breaking another.

**The CS lens — cohesion.** A class has high cohesion when all its methods work on the same data and serve the same purpose. `OrderSystem` has low cohesion — its methods have nothing to do with each other. The tax calculator uses `region`, not `orders`; the email formatter uses `orderId` but not the shipping logic. Low cohesion is the signature of a God Object.

**The fix — split along responsibility lines:**

```typescript
class TaxCalculator {
  calculate(subtotal: number, region: string): number {
    if (region === 'CA') return subtotal * 0.0725;
    if (region === 'NY') return subtotal * 0.08;
    return subtotal * 0.06;
  }
}

class ShippingService {
  calculateCost(weightKg: number): number {
    return weightKg < 1 ? 4.99 : weightKg * 2.5;
  }
}

class OrderConfirmationEmail {
  format(orderId: string): string {
    return `Dear customer, your order ${orderId} has been confirmed.`;
  }
}

class OrderRepository {
  private orders: Order[] = [];

  findById(orderId: string): Order | undefined {
    return this.orders.find(order => order.id === orderId);
  }
}
```

Each class has one job. A change to tax rates touches only `TaxCalculator`.

---

### Step 2 — Primitive Obsession

Primitive Obsession is using primitive types (string, number, boolean) where a domain-specific type should exist.

```typescript
// SMELLY: user is represented by scattered primitives
function createUser(
  email: string,
  password: string,
  age: number,
  phoneNumber: string,
  countryCode: string,
): void {
  // Nothing prevents these from being in the wrong order:
  console.log(`Creating user: ${email}, +${countryCode} ${phoneNumber}`);
}

// Bug waiting to happen — easy to swap email and password:
createUser('hunter2', 'alice@example.com', 25, '5551234', '1');
```

**The walkthrough:** Every field is a `string` or `number`. The compiler cannot catch swapped arguments. There is no validation of what makes a valid email, phone, or country code — that knowledge is scattered wherever these strings are used.

**The fix — introduce value objects:**

```typescript
class Email {
  private readonly value: string;

  constructor(raw: string) {
    if (!raw.includes('@') || !raw.includes('.')) {
      throw new Error(`Invalid email address: "${raw}"`);
    }
    this.value = raw.toLowerCase().trim();
  }

  toString(): string { return this.value; }
}

class PhoneNumber {
  private readonly countryCode: string;
  private readonly localNumber: string;

  constructor(countryCode: string, localNumber: string) {
    if (!/^\d{1,3}$/.test(countryCode)) {
      throw new Error(`Invalid country code: "${countryCode}"`);
    }
    if (!/^\d{7,15}$/.test(localNumber.replace(/\D/g, ''))) {
      throw new Error(`Invalid phone number: "${localNumber}"`);
    }
    this.countryCode = countryCode;
    this.localNumber = localNumber;
  }

  toString(): string { return `+${this.countryCode} ${this.localNumber}`; }
}

function createUser(email: Email, phone: PhoneNumber, age: number): void {
  console.log(`Creating user: ${email}, ${phone}`);
}

// The compiler enforces correct types — impossible to swap Email for PhoneNumber:
createUser(new Email('alice@example.com'), new PhoneNumber('1', '5551234'), 25);
```

**The CS lens — type safety.** A value object encapsulates validation and ensures that only valid values can be constructed. Once an `Email` exists, it is guaranteed to be a valid email. No caller needs to re-validate it. The type system enforces correctness at compile time.

**The SE lens — domain language.** Using `Email` instead of `string` makes the code speak the domain language. A function signature that accepts `Email` is self-documenting. A function signature that accepts three `string` parameters is not.

---

### Step 3 — Feature Envy

Feature Envy is a method that uses the data of another class more than its own.

```typescript
class Order {
  constructor(
    public readonly id: string,
    public readonly items: Array<{ price: number; quantity: number }>,
    public readonly discountPercent: number,
  ) {}
}

class Invoice {
  // This method is more interested in Order's data than Invoice's own data:
  calculateTotal(order: Order): number {
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discount = subtotal * (order.discountPercent / 100);
    return subtotal - discount;
  }
}
```

**The walkthrough:** `Invoice.calculateTotal` touches `order.items`, `order.discountPercent`, and arithmetic using both. It does not touch any data on `Invoice` itself. The calculation belongs in `Order` — `Order` has the items and the discount percent; it is the right place to know the total.

**The fix — move the method to the class whose data it uses:**

```typescript
class Order {
  constructor(
    public readonly id: string,
    public readonly items: Array<{ price: number; quantity: number }>,
    public readonly discountPercent: number,
  ) {}

  // The total belongs to Order — Order has all the data:
  calculateTotal(): number {
    const subtotal = this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discount = subtotal * (this.discountPercent / 100);
    return subtotal - discount;
  }
}

class Invoice {
  generate(order: Order): string {
    return `Invoice for order ${order.id}: $${order.calculateTotal().toFixed(2)}`;
  }
}
```

**The CS lens — information expert principle.** The Information Expert principle says: assign responsibility to the class that has the information required to fulfill it. `Order` has the items and discount — it is the expert on its own total.

---

### Step 4 — Shotgun Surgery

Shotgun Surgery is when one logical change requires editing many unrelated files.

```typescript
// config.ts
export const TAX_RATE = 0.08;

// orderService.ts
import { TAX_RATE } from './config';
function getOrderTax(subtotal: number): number {
  return subtotal * TAX_RATE;
}

// reportGenerator.ts
const TAX_RATE_REPORT = 0.08;  // duplicated — not from config
function generateTaxSummary(subtotal: number): string {
  return `Tax: $${(subtotal * TAX_RATE_REPORT).toFixed(2)}`;
}

// emailFormatter.ts
function formatReceiptLine(subtotal: number): string {
  const tax = subtotal * 0.08;  // hardcoded — third place
  return `Subtotal: $${subtotal.toFixed(2)} | Tax: $${tax.toFixed(2)}`;
}
```

**The walkthrough:** The tax rate appears in three places: `config.ts` (correctly), `reportGenerator.ts` (duplicated as a constant), and `emailFormatter.ts` (hardcoded). Changing the tax rate requires finding and editing all three. Missing one produces inconsistent results — the email might show a different tax than the report.

**The fix — single source of truth:**

```typescript
// taxPolicy.ts — single source of truth for all tax logic
export const TAX_RATE = 0.08;

export function calculateTax(subtotal: number): number {
  return subtotal * TAX_RATE;
}

// All callers import from taxPolicy.ts:
import { calculateTax } from './taxPolicy';
```

**The CS lens — DRY (Don't Repeat Yourself).** DRY says every piece of knowledge should have one authoritative representation. Tax rate is one piece of knowledge. Three representations mean three places to update, three places to forget.

---

## Connect the Pieces

- **Linters like ESLint** detect some smells automatically: duplicate code (Shotgun Surgery), deeply nested conditions (a precursor to God Objects), and functions that are too long (often God Objects in miniature).
- **The "broken window" theory** applied to code: one smell left unfixed signals that the codebase tolerates smells, and more accumulate. Teams that refactor smells immediately keep codebases that stay readable.
- **Database schemas** exhibit the same smells: a table with 50 columns is a God Object; storing a full address as a single string is Primitive Obsession.

---

## What Breaks Without This

**The maintenance trap:** A God Object grows over time. New developers add methods to it because it already has everything. Within a year, a single file has 1,000 lines and 40 methods. Every pull request touches it. Merge conflicts are constant. Developers fear changing it because they do not know what depends on what.

Identifying the smell early and extracting classes before the file reaches 200 lines avoids the trap entirely.

---

## Definition of Done

- [ ] You can identify which smell each example demonstrates and name it precisely
- [ ] `OrderSystem` is split into at least three classes with single responsibilities
- [ ] `Email` and `PhoneNumber` value objects exist and throw on invalid input
- [ ] `Order.calculateTotal()` lives on `Order`, not on `Invoice`
- [ ] Tax rate appears in exactly one place; changing it requires changing one file

**Git commit:**

```
git add src/
git commit -m "LAB-058: Code smells — God Object split, Primitive Obsession replaced with value objects, Feature Envy moved to Order, Shotgun Surgery consolidated"
```

---

## Quick Check Answers

1. **A smell is a surface indicator of a deeper design problem. It does not break the program today, but it makes the program harder to change without breaking it tomorrow.** Smells accumulate interest — ignored, they compound into systems that are too fragile to modify.
2. **Primitive Obsession is using raw primitives (string, number) where a domain type should exist.** Example: storing a phone number as a plain `string` allows `"banana"` to be assigned. A `PhoneNumber` class validates at construction and guarantees validity everywhere it is used.
3. **Shotgun Surgery feels like whack-a-mole: you change one thing and have to find every place that duplicated that knowledge.** It usually produces a bug the first time — you miss one copy. The tell is: "every time I change X, I also have to change Y and Z."
