# FOUNDATIONS — LAB-056 — Law of Demeter

**Series:** FOUNDATIONS — Part IX: Software Engineering Principles
**Environment:** TypeScript playground
**Time:** 40–50 minutes.

---

## What You Will Build

A train-wreck call chain that violates the Law of Demeter, the exact coupling it creates, and a refactored version that uses the "don't talk to strangers" rule. After this lab you will be able to identify Demeter violations, state what they couple, and rewrite them with a single method that encapsulates the navigation.

---

## What You Need to Know First

**From LAB-055 (Tell Don't Ask):** Law of Demeter is Tell Don't Ask extended to navigation chains. Instead of asking A for B to ask B for C, tell A to perform the whole operation.

**From LAB-013 (Encapsulation):** LoD enforces encapsulation between modules — a caller should not need to know the internal structure of its collaborators' collaborators.

---

> **Quick Check — try to answer before reading:**
>
> 1. What is a "train wreck"? Give an example as a method chain.
> 2. The Law of Demeter says a method may only call methods on: (1) itself, (2) its parameters, (3) objects it creates, (4) its direct components. Why is each of these safe?
> 3. Does the Law of Demeter prohibit fluent interfaces like `builder.setWidth(10).setHeight(20).build()`?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Violation: Train Wreck

```typescript
class Wallet {
  constructor(public cards: PaymentCard[]) {}
}

class PaymentCard {
  constructor(
    public number: string,
    public bank: Bank,
  ) {}
}

class Bank {
  constructor(
    public name: string,
    public processingFee: number,  // in percent
  ) {}
}

class Customer {
  constructor(
    public name: string,
    public wallet: Wallet,
  ) {}
}

class OrderProcessor {
  processOrder(customer: Customer, amount: number): void {
    // TRAIN WRECK — chain navigates through multiple unrelated objects:
    const fee = customer.wallet.cards[0].bank.processingFee;
    const total = amount * (1 + fee / 100);
    const cardNumber = customer.wallet.cards[0].number;

    console.log(`Charging card ${cardNumber} for $${total.toFixed(2)}`);
  }
}
```

**The walkthrough — what is coupled:**

`OrderProcessor.processOrder` knows:
- `Customer` has a `wallet`
- `Wallet` has a `cards` array
- `cards[0]` is a `PaymentCard`
- `PaymentCard` has a `bank`
- `Bank` has a `processingFee`

That is four levels of navigation into internal structure. `OrderProcessor` is coupled to `Customer`, `Wallet`, `PaymentCard`, AND `Bank`. If any of these classes changes its internal structure — `Wallet` becomes `cards: Map<string, PaymentCard>`, or `Bank` renames `processingFee` to `transactionFeePercent` — `OrderProcessor` must change.

**The CS lens — coupling to internal structure:** The train wreck creates coupling to the internal structure of multiple objects, not just their public interfaces. This is more fragile than coupling to a single object's public interface: every intermediate class in the chain can independently change and break the caller.

**The SE lens — strangers:** The Law of Demeter's informal name is "don't talk to strangers." `OrderProcessor` talks to `Customer` (a direct collaborator) — that is fine. But it then talks to `Wallet` (a stranger — it was obtained from Customer), then to `PaymentCard` (a stranger's stranger), then to `Bank` (a stranger's stranger's stranger). Each degree of indirection is a new coupling.

---

### Step 2 — The Fix: Move Knowledge to the Object That Has It

```typescript
class Bank {
  constructor(
    public readonly name: string,
    private readonly processingFee: number,
  ) {}

  // The Bank knows its fee — callers don't need to dig it out:
  calculateFee(amount: number): number {
    return amount * this.processingFee / 100;
  }
}

class PaymentCard {
  constructor(
    private readonly number: string,
    private readonly bank: Bank,
  ) {}

  // The card knows how to process a charge — no navigation needed:
  charge(amount: number): { maskedNumber: string; total: number } {
    const fee   = this.bank.calculateFee(amount);
    const total = amount + fee;
    const masked = `****${this.number.slice(-4)}`;
    return { maskedNumber: masked, total };
  }
}

class Wallet {
  private readonly cards: PaymentCard[];

  constructor(cards: PaymentCard[]) {
    this.cards = cards;
  }

  // The wallet knows how to charge — hides which card and how:
  chargeDefault(amount: number): { maskedNumber: string; total: number } {
    if (this.cards.length === 0) {
      throw new Error('No payment cards in wallet');
    }
    return this.cards[0].charge(amount);
  }
}

class Customer {
  constructor(
    public readonly name: string,
    private readonly wallet: Wallet,
  ) {}

  // The customer knows how to pay — hides wallet internals:
  pay(amount: number): { maskedNumber: string; total: number } {
    return this.wallet.chargeDefault(amount);
  }
}

class OrderProcessor {
  processOrder(customer: Customer, amount: number): void {
    // Now talks only to its direct collaborator — Customer:
    const { maskedNumber, total } = customer.pay(amount);
    console.log(`Charged card ${maskedNumber} for $${total.toFixed(2)}`);
  }
}
```

**The walkthrough:** `OrderProcessor` only calls `customer.pay(amount)`. It knows nothing about `Wallet`, `PaymentCard`, or `Bank`. If `Bank` renames its fee property, `Bank` changes. `OrderProcessor` does not. If the wallet switches to storing cards in a `Map`, `Wallet` changes. `OrderProcessor` does not. The coupling chain has been broken — each object talks only to its immediate neighbor.

---

### Step 3 — What LoD Permits

The four allowed call targets for any method M:

1. **`this` methods** — call any method on the same object: `this.validate()`
2. **Parameter methods** — call methods on received parameters: `customer.pay(amount)` in a method that receives `customer`
3. **Locally created objects** — call methods on objects you create: `const formatter = new PriceFormatter(); formatter.format(total)`
4. **Direct components** — call methods on fields of the object: `this.wallet.chargeDefault(amount)` inside `Customer`, where `wallet` is a field

What is NOT permitted: call methods on objects RETURNED by other calls — `a.getB().doSomething()`.

**Fluent interfaces are an exception:** `query.select('*').from('users').where('active = 1').build()` appears to violate LoD (each method returns an object and you call the next). But the key distinction: all these methods return `this` (or a new builder of the same type). You are not navigating into a different object — you are chaining calls on the SAME logical object. This is the builder pattern (LAB-067) and is not a LoD violation.

---

### Step 4 — Applying LoD in Practice: Signals

When you find a train wreck, ask: what does each intermediate object know that the chain is trying to reach?

| Train wreck | Move to |
|---|---|
| `order.customer.address.city` | `order.getCustomerCity()` or `customer.getAddress()` |
| `repo.getDatabase().getConnection().execute(sql)` | `repo.execute(sql)` |
| `router.request.headers.authorization.split(' ')[1]` | `request.getBearerToken()` |

In each case, a method on the nearest collaborator encapsulates the navigation and exposes only the result.

---

## Connect the Pieces

- **React component props** follow LoD: components receive exactly the data they need as props, not a top-level store from which they navigate. Passing a top-level `appState` to every component and having them navigate internally is a LoD violation.
- **Django's ORM** provides `user.profile.avatar_url` — but the model should define a method `user.get_avatar_url()` that encapsulates the navigation.
- **The Facade pattern** (LAB-074) is a systematic LoD fix: the facade hides the complex subsystem structure, so callers only talk to the facade.

---

## What Breaks Without This

**The refactoring cascade:**

The `Bank` class renames `processingFee` to `transactionFeePercent`. The developer updates `Bank`. But `OrderProcessor` directly reads `bank.processingFee` — that breaks. The developer finds `OrderProcessor`, fixes it. A week later, another developer finds another train wreck in `ReportGenerator` that also reads `bank.processingFee`. Another breakage.

With LoD applied, `Bank.calculateFee(amount)` is the public interface. Renaming the internal field is a private change to `Bank` — nobody outside `Bank` knows about `processingFee`. Zero cascading changes.

---

## Definition of Done

- [ ] `OrderProcessor.processOrder` makes exactly one method call on its `customer` parameter — no chain
- [ ] Renaming `Bank.processingFee` to `transactionFeePercent` requires changing only `Bank` — demonstrate by making the change and verifying nothing else breaks
- [ ] `customer.pay(amount)` encapsulates the full navigation chain
- [ ] You can explain why `builder.setWidth(10).setHeight(20).build()` does NOT violate LoD
- [ ] Identify and fix one train wreck in the original code (other than the one shown)

**Git commit:**

```
git add src/
git commit -m "LAB-056: Law of Demeter — train wreck refactored to single method call; each object encapsulates navigation; renaming internal fields requires no external changes"
```

---

## Quick Check Answers

1. **A train wreck is a method chain of calls on objects returned by previous calls: `a.getB().getC().doD()`.** The visual appearance looks like linked train cars. Example: `customer.wallet.cards[0].bank.processingFee`.
2. **(1) Itself: calling your own methods is safe because you know your own contract. (2) Parameters: callers pass parameters knowing those parameters will be used. (3) Created objects: you own the lifecycle of objects you create. (4) Direct components: a class is responsible for its own fields.** In all four cases, the relationship is explicit and controlled. Calling methods on objects obtained from calls navigates to unknown territory — the internal structure of collaborators.
3. **No.** A fluent interface returns `this` (or a new instance of the SAME type) from each call. `builder.setWidth(10)` returns `builder` (same object). `builder.setWidth(10).setHeight(20)` is calling `setHeight` on the same builder. No navigation to strangers occurs. The Law of Demeter concerns navigating into OTHER objects, not chaining calls on the same object.
