---
series: oop-design
level: 0
title: What Object-Oriented Design Is
lang: javascript
---

# What Object-Oriented Design Is

Object-oriented programming is often taught as "objects have data and methods." That is a description of syntax, not of design. The design question is: which things should be objects, what should each object know, and how should they communicate?

Object-oriented design (OOD) is a set of principles and practices for organising programs around objects that model real-world or conceptual entities. Done well, it produces code where each piece of the system has a clear responsibility, where change is localised to the piece that owns it, and where the system is easy to extend without modifying existing code. Done poorly, it produces a tangle of objects that all depend on each other, where changing anything requires changing everything. By the end of this lesson you will understand the value proposition of OOD and the four fundamental concepts it builds on.

## The problem OOD solves

```text
PROGRAMS WITHOUT OOD (procedural spaghetti):

  // All data is global or passed everywhere
  let userName = ''
  let userEmail = ''
  let userBalance = 0
  let cartItems = []
  let cartTotal = 0

  function updateCart(item) {
    cartItems.push(item)
    cartTotal += item.price
    // but also needs to check userBalance...
    // and also needs to notify the user...
    // and also needs to update the database...
    // ONE FUNCTION does everything
  }

  Problems:
    → Any code anywhere can modify userName, cartTotal, etc. (no ownership)
    → Changing how the cart works requires hunting through every function
    → Adding a new type of user requires changing many functions
    → Testing is hard — functions depend on global state
```

```text
PROGRAMS WITH OOD:

  class User {
    // Owns: name, email, balance
    // Knows how to: verify payment ability, describe itself
  }

  class Cart {
    // Owns: items, discount
    // Knows how to: add/remove items, calculate total
  }

  class Order {
    // Owns: items, user, status
    // Knows how to: place itself, be fulfilled
  }

  Benefits:
    → Each object owns its data and the operations on it
    → Changing cart behaviour only touches Cart
    → New user types can extend User without changing Cart or Order
    → Each class can be tested independently
```

## The four pillars of OOD

```text
1. ENCAPSULATION
   Bundle data (fields) with the operations that work on that data (methods).
   Hide internal state from external code — only expose what callers need.
   Why: changes to internal representation don't break callers.

2. INHERITANCE
   A class can extend another class, gaining its fields and methods.
   Why: model "is-a" relationships; avoid duplicating shared behaviour.
   Risk: overused inheritance creates deep hierarchies that are hard to change.

3. POLYMORPHISM
   Different objects can respond to the same interface in different ways.
   A Payment can be a CreditCard, BankTransfer, or CryptoWallet —
   all respond to .process(), each with different logic.
   Why: callers don't need to know the specific type; they just call the method.

4. ABSTRACTION
   Hide implementation details behind an interface.
   Callers interact with what an object DOES, not how it does it.
   Why: you can change the implementation (e.g., swap the database) without
   breaking callers, as long as the interface is preserved.
```

## Encapsulation in practice

```javascript
// WITHOUT encapsulation: caller manipulates internal state directly
const account = { balance: 1000, transactions: [] }
account.balance -= 200   // caller directly mutates internal state
account.transactions.push({ amount: -200, type: 'debit' })   // must also know to do this
// Problem: if the rule changes (minimum balance check), it must be enforced everywhere

// WITH encapsulation: the object owns its state and enforces its rules
class BankAccount {
  #balance         // private field — not accessible outside the class
  #transactions

  constructor(initialBalance) {
    this.#balance = initialBalance
    this.#transactions = []
  }

  debit(amount) {
    if (amount > this.#balance) throw new Error('Insufficient funds')
    this.#balance -= amount
    this.#transactions.push({ amount: -amount, type: 'debit', at: new Date() })
  }

  get balance() { return this.#balance }
  get transactionHistory() { return [...this.#transactions] }   // defensive copy
}

const account = new BankAccount(1000)
account.debit(200)
console.log(account.balance)   // 800
// account.#balance = 5000    // SyntaxError: private field
```

```text
WHAT ENCAPSULATION ACHIEVES:
  → The minimum-balance rule lives in ONE place (the debit method)
  → The caller cannot set account.balance directly
  → The transactions array cannot be mutated from outside (defensive copy)
  → When the rule changes, only BankAccount changes
```

**CS lens:** Private fields (`#balance`) are a language-enforced encapsulation boundary. The JavaScript engine enforces the access restriction at the bytecode level — there is no way to read `#balance` from outside the class except through the getter. This is **information hiding** at the language level: the implementation detail (how balance is stored) is hidden from callers; only the contract (you can read the balance, you can debit within limits) is visible. Every module system, package boundary, and API is applying the same principle at a different granularity.

## Polymorphism in practice

```javascript
// Three payment types with different implementations, same interface
class CreditCardPayment {
  constructor(cardNumber, cvv) {
    this.cardNumber = cardNumber
    this.cvv = cvv
  }

  async process(amount) {
    return await stripe.charge({ amount, card: this.cardNumber, cvv: this.cvv })
  }
}

class BankTransferPayment {
  constructor(routingNumber, accountNumber) {
    this.routingNumber = routingNumber
    this.accountNumber = accountNumber
  }

  async process(amount) {
    return await ach.initiate({ amount, routing: this.routingNumber, account: this.accountNumber })
  }
}

class WalletPayment {
  constructor(walletAddress) {
    this.walletAddress = walletAddress
  }

  async process(amount) {
    return await cryptoGateway.send({ amount, to: this.walletAddress })
  }
}

// The caller does not care which type of payment it is:
async function processOrder(order, payment) {
  const result = await payment.process(order.total)   // polymorphic call
  if (result.success) order.markPaid()
}

// Works with any payment type:
await processOrder(order, new CreditCardPayment('4111...', '123'))
await processOrder(order, new BankTransferPayment('021000021', '123456789'))
await processOrder(order, new WalletPayment('0x742d35Cc6...'))
```

```text
WHAT POLYMORPHISM ACHIEVES:
  → processOrder() works with any payment type — past, present, and future
  → Adding a new payment type doesn't require changing processOrder()
  → Each payment type can be tested in isolation
  → The order processing logic is decoupled from payment implementation details
```

**SE lens:** The power of polymorphism is not in the three current payment types — it is in the fourth, fifth, and sixth payment types you will add later. When `processOrder` is written against the interface (`.process(amount)`) rather than against specific types (checking `if payment instanceof CreditCard`), adding a new payment type is a pure addition — no existing code changes. This is the **open/closed principle**: open for extension, closed for modification. Every plugin system, every event system, and every strategy pattern is polymorphism applied at different scales.

**Common mistakes:**
- Over-encapsulating simple data objects — not everything needs to be a class. A plain object `{ name: 'Alice', email: '...' }` is fine for data that is just passed around. Classes add value when they own behaviour and enforce invariants.
- Using inheritance where composition would be better — extending a class to add one method is usually wrong. Prefer composition: pass the thing you need as a dependency, or implement the interface without inheriting the full parent.
- Using `instanceof` checks instead of polymorphism — `if (payment instanceof CreditCard)` in the caller means the caller knows about specific types. This defeats polymorphism. The type-specific logic belongs in the type itself.

**Debug tip:** When an OO design is getting complicated, draw it. A box per class, an arrow per dependency. If arrows cross in every direction, the design has too much coupling — objects depend on too many other objects. The goal is a design where arrows flow in one direction: high-level classes depend on abstractions; low-level classes implement them.

## Challenge: oop_concepts

Reason about OOD principles in concrete scenarios.

```challenge
function oopConcepts(scenario) {
  if (scenario === 'encapsulation-purpose') {
    // A BankAccount stores balance internally and only exposes debit/credit methods.
    // What is the primary benefit of encapsulating the balance?
    return {
      benefit: '',   // one sentence describing the main encapsulation benefit
    }
  }

  if (scenario === 'polymorphism-add-type') {
    // You have processOrder(order, payment) that calls payment.process(amount).
    // You want to add a gift card payment type.
    // Which files need to change?
    // Options: 'only add GiftCardPayment class',
    //          'add GiftCardPayment class and update processOrder',
    //          'update processOrder only'
    return {
      filesChanged: '',
    }
  }

  if (scenario === 'private-field') {
    // In JavaScript, what does `#balance` (hash prefix) on a class field mean?
    return {
      meaning: '',   // one sentence
    }
  }
}
```

```test
const enc = oopConcepts('encapsulation-purpose')
assert enc.benefit.length > 20

const poly = oopConcepts('polymorphism-add-type')
assert poly.filesChanged === 'only add GiftCardPayment class'

const priv = oopConcepts('private-field')
assert priv.meaning.length > 20
assert priv.meaning.toLowerCase().includes('private') || priv.meaning.toLowerCase().includes('access')
```
