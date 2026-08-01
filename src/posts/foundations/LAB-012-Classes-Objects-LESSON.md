# FOUNDATIONS — LAB-012 — Classes and Objects

**Series:** FOUNDATIONS — Part III: Object-Oriented Programming
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 55–70 minutes.

---

## What You Will Build

A `BankAccount` class with a constructor, three instance methods, and a test suite you run manually. Each instance created from the class has its own independent copy of the data. After this lab, you will be able to read and write any class definition, explain what `this` refers to and why, and describe the relationship between a class (the blueprint) and an object (an instance of the blueprint).

---

## What You Need to Know First

**From LAB-007 (Closures):** The module pattern used closures to create private state and a public interface. A class does the same thing, but with a standardized syntax and the ability to create multiple independent instances from one definition.

**From LAB-009 (Error Handling):** Methods throw errors when called with invalid arguments. Instance methods use `this` to access the instance's data — which is why guard clauses inside methods work the same as in standalone functions.

**The conceptual connection:** In LAB-007, `makeCounter()` returned a closure that remembered `count`. A class is a generalization of this: instead of calling a factory function, you use `new ClassName(...)`, and instead of accessing the closure's state through returned functions, you call methods on the returned object.

---

> **Quick Check — try to answer before reading:**
>
> 1. Two variables both hold `BankAccount` objects. You call `account1.deposit(100)`. Does `account2`'s balance change? Why or why not?
> 2. Inside a class method, what does `this` refer to?
> 3. What is the difference between the class definition and an instance of the class?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Defining a Class

**The problem this step solves:** Create a reusable blueprint that produces objects with both data and methods.

**The code:**

```js
class BankAccount {
  constructor(ownerName, initialBalance) {
    this.ownerName = ownerName;
    this.balance = initialBalance;
    this.transactionCount = 0;
  }
}

const account = new BankAccount("Alice", 500);
console.log(account.ownerName);   // → "Alice"
console.log(account.balance);     // → 500
```

**The walkthrough — what `new BankAccount("Alice", 500)` does:**

1. A new empty object `{}` is created in heap memory.
2. The `constructor` function is called with `this` set to that new empty object.
3. `this.ownerName = "Alice"` — a property named `ownerName` is added to the object with value `"Alice"`.
4. `this.balance = 500` — a property named `balance` is added with value `500`.
5. `this.transactionCount = 0` — a property named `transactionCount` is added with value `0`.
6. The new object is returned. `account` now holds a reference to this object.

**`class ClassName { ... }`** — the class declaration syntax. A class is a blueprint that describes the structure and behavior of the objects it produces. The class itself is not an object — it is the description of how to make objects.

**`constructor(params)`** — a special method called automatically by `new`. It initializes the new object's data. Every class can have at most one constructor. If you do not write one, JavaScript provides an empty default constructor.

**`this`** — inside a class, `this` refers to the specific instance being worked with. When `account.deposit(100)` is called, inside `deposit`, `this` is `account`. When `account2.deposit(50)` is called, `this` is `account2`. `this` is how a method knows which object's data to use.

**`new ClassName(...)`** — the keyword `new` creates an instance of a class. Without `new`, calling `BankAccount("Alice", 500)` either throws an error (in strict mode) or runs `BankAccount` as a regular function, which does not create an object.

**CS lens — objects as records with behavior:**

A class defines a **record type** (a set of named fields) combined with the **methods** that operate on those fields. Before classes, JavaScript objects were plain dictionaries: `{ ownerName: "Alice", balance: 500 }`. Classes add two things: a guarantee that every instance has the same field names (established by the constructor), and a set of shared methods that all instances use.

**SE lens — the class as a module boundary:**

A class is a boundary: the constructor and methods are the public interface; the properties (`this.ownerName`, `this.balance`) are the internal data. Code outside the class should not directly modify `account.balance = 999` — that bypasses any validation the class enforces. The class owns its data; external code interacts through methods. This is the same principle as the module pattern — enforced by convention rather than by the language (JavaScript does not prevent external modification of `this.balance` without additional features from LAB-013).

**What breaks without a constructor:**

Without a constructor, all instances share no guaranteed fields. You create instances with `account.balance = 500` after construction — but some code might forget to set `balance`, leaving it as `undefined`. The constructor enforces a contract: every `BankAccount` instance is guaranteed to have `ownerName`, `balance`, and `transactionCount` from the moment it is created.

---

### SAVE AND TRY

```js
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const origin = new Point(0, 0);
const point = new Point(3, 4);

console.log(origin.x, origin.y);   // → 0 0
console.log(point.x, point.y);     // → 3 4
console.log(origin === point);      // → false  (two different objects)
```

Expected: `0 0`, `3 4`, `false`.

**Change something:** Create two `Point` objects with the same coordinates: `const p1 = new Point(3, 4)` and `const p2 = new Point(3, 4)`. Check `p1 === p2`. Expected: `false` — they are two separate objects at different memory addresses, even though their values are identical. This is **reference equality** vs **value equality** — a foundational difference in how objects work.

---

### Step 2 — Instance Methods

**The problem this step solves:** Add behavior to the class so instances can do useful work.

**The code:**

```js
class BankAccount {
  constructor(ownerName, initialBalance) {
    if (typeof initialBalance !== "number" || initialBalance < 0) {
      throw new Error("Initial balance must be a non-negative number");
    }
    this.ownerName = ownerName;
    this.balance = initialBalance;
    this.transactionCount = 0;
  }

  deposit(amount) {
    if (amount <= 0) throw new Error("Deposit amount must be positive");
    this.balance += amount;
    this.transactionCount += 1;
    return this;   // enables method chaining
  }

  withdraw(amount) {
    if (amount <= 0) throw new Error("Withdrawal amount must be positive");
    if (amount > this.balance) throw new Error("Insufficient funds");
    this.balance -= amount;
    this.transactionCount += 1;
    return this;
  }

  getStatement() {
    return `${this.ownerName}: balance $${this.balance.toFixed(2)}, ${this.transactionCount} transactions`;
  }
}
```

**`this.balance.toFixed(2)`** — `toFixed(n)` is a method on JavaScript numbers. It returns a string representation of the number rounded to `n` decimal places. `(1234.5).toFixed(2)` returns `"1234.50"`. Used here to format currency with two decimal places.

**Template literal syntax** — `` `${expression}` `` — a string enclosed in backticks (`` ` ``) that can contain expressions inside `${}`. The expression is evaluated and its string representation is inserted. This was introduced in LAB-000's "You will see this again" as part of modern JavaScript. `` `Balance: $${this.balance}` `` with `this.balance = 100` produces `"Balance: $100"`.

**The walkthrough — `account.deposit(100)` executes:**

1. `deposit(100)` is called on `account`. `this` is set to `account`.
2. `amount` is `100`. The guard `amount <= 0` is `false`. No error thrown.
3. `this.balance += amount` — reads `account.balance` (currently `500`), adds `100`, writes `600` back. `account.balance` is now `600`.
4. `this.transactionCount += 1` — `account.transactionCount` is now `1`.
5. `return this` — returns the `account` object itself.

**Method chaining from `return this`:** Because `deposit` returns `this` (the instance itself), you can call another method on the result: `account.deposit(100).withdraw(50)`. The result of `deposit(100)` is `account`. Calling `.withdraw(50)` on that calls `withdraw(50)` on `account`. This is called **method chaining** or a **fluent interface** — you will see it in DOM manipulation, query builders, and test assertion libraries.

**CS lens — methods as message passing:**

In object-oriented programming, calling a method is described as **sending a message** to an object. `account.deposit(100)` sends the `deposit` message with argument `100` to the `account` object. The object decides how to respond — `deposit` mutates the balance. This framing (messages, not function calls) emphasizes that the object owns the decision about what to do, not the caller.

**SE lens — methods enforce invariants:**

The guard clause `if (amount > this.balance) throw new Error("Insufficient funds")` enforces the invariant that `balance` never goes negative. If `balance` were a public property and external code could set `account.balance = -1000`, the invariant would be broken. The method is the only way to change `balance`, and the method checks the invariant on every change. This is why exposing data through methods rather than direct field access is a design principle (covered fully in LAB-013).

**What breaks without `return this`:**

Without `return this`, method chaining does not work — each method call returns `undefined`, and calling `.withdraw()` on `undefined` throws `TypeError: Cannot read properties of undefined`. The `return this` pattern is a deliberate choice, not required. Many well-designed classes do not chain; they return the modified value or nothing.

---

### SAVE AND TRY

```js
class BankAccount {
  constructor(ownerName, initialBalance) {
    if (typeof initialBalance !== "number" || initialBalance < 0) {
      throw new Error("Initial balance must be non-negative");
    }
    this.ownerName = ownerName;
    this.balance = initialBalance;
    this.transactionCount = 0;
  }

  deposit(amount) {
    if (amount <= 0) throw new Error("Deposit must be positive");
    this.balance += amount;
    this.transactionCount++;
    return this;
  }

  withdraw(amount) {
    if (amount <= 0) throw new Error("Withdrawal must be positive");
    if (amount > this.balance) throw new Error("Insufficient funds");
    this.balance -= amount;
    this.transactionCount++;
    return this;
  }

  getStatement() {
    return `${this.ownerName}: $${this.balance.toFixed(2)}, ${this.transactionCount} transactions`;
  }
}

const alice = new BankAccount("Alice", 1000);
alice.deposit(500).deposit(200).withdraw(300);
console.log(alice.getStatement());
// → "Alice: $1400.00, 3 transactions"
```

Expected: `"Alice: $1400.00, 3 transactions"`.

**Change something:** Try `alice.withdraw(5000)`. Expected: error thrown — "Insufficient funds." Try `new BankAccount("Bob", -1)`. Expected: constructor error. Try `alice.deposit(-50)`. Expected: error — "Deposit must be positive."

---

### Step 3 — Multiple Independent Instances

**The problem this step solves:** Prove that each instance has completely independent data — modifying one does not affect another.

**The code:**

```js
const alice = new BankAccount("Alice", 1000);
const bob   = new BankAccount("Bob",   500);

alice.deposit(200);
bob.withdraw(100);

console.log(alice.getStatement());   // Alice's balance, Alice's transactions
console.log(bob.getStatement());     // Bob's balance, Bob's transactions — completely separate
```

**The walkthrough — where the data lives:**

1. `new BankAccount("Alice", 1000)` creates object at heap address `0xA1` (hypothetically). `ownerName="Alice"`, `balance=1000`, `transactionCount=0` are stored in that object.
2. `new BankAccount("Bob", 500)` creates a **different** object at heap address `0xB2`. These are two separate memory locations.
3. `alice.deposit(200)`: `this` is the object at `0xA1`. Only `0xA1`'s `balance` is changed to `1200`.
4. `bob.withdraw(100)`: `this` is the object at `0xB2`. Only `0xB2`'s `balance` is changed to `400`.
5. Alice's statement: `"Alice: $1200.00, 1 transactions"`. Bob's statement: `"Bob: $400.00, 1 transactions"`.

They share no data. The `deposit`, `withdraw`, and `getStatement` methods are shared (defined once on the class), but the data each method operates on is determined by `this` — which is a different object for each call.

**CS lens — shared methods, separate data:**

Methods are stored once — there is one copy of the `deposit` function, not one per instance. This is memory-efficient: 1,000 `BankAccount` instances share one `deposit` method. The data (`balance`, `ownerName`, `transactionCount`) is stored per instance — each instance has its own. This separation is how classes scale: a single method definition serves unlimited instances.

**SE lens — value objects vs entity objects:**

Two `Point(3, 4)` objects have the same value but are different objects. Two `BankAccount("Alice", 1000)` objects represent different bank accounts — they have independent transaction histories even if the balance starts the same. This distinction — objects that represent **values** (where equality means same content) vs objects that represent **entities** (where identity matters, same object reference means same entity) — is fundamental to domain modeling. `Point` is a value object; `BankAccount` is an entity.

**What breaks without instance separation:**

If `balance` were shared among all instances (a class-level variable rather than an instance variable), every deposit on any account would change every account's balance. This would make the class useless. The constructor assigning to `this.balance` is what makes each instance's `balance` private to that instance.

---

### SAVE AND TRY

```js
const accounts = [
  new BankAccount("Alice", 1000),
  new BankAccount("Bob",   500),
  new BankAccount("Carol", 750),
];

accounts[0].deposit(200);
accounts[1].deposit(50).deposit(50);
accounts[2].withdraw(100);

accounts.forEach(account => console.log(account.getStatement()));
```

Expected: three independent statements. Alice +200, Bob +100 (two deposits), Carol -100.

**Change something:** Add `const total = accounts.reduce((sum, acct) => sum + acct.balance, 0); console.log("Total:", total)`. Expected: total of all three balances. The `reduce` from LAB-006 works on arrays of objects just as well as on arrays of numbers.

---

### Step 4 — Static Methods and Properties

**The problem this step solves:** Attach behavior to the class itself rather than to instances — for factory methods, utilities, and class-level operations.

**The code:**

```js
class BankAccount {
  static minimumBalance = 0;   // static property: belongs to the class, not to instances
  static accountCount = 0;

  constructor(ownerName, initialBalance) {
    if (initialBalance < BankAccount.minimumBalance) {
      throw new Error(`Initial balance must be at least ${BankAccount.minimumBalance}`);
    }
    this.ownerName = ownerName;
    this.balance = initialBalance;
    this.transactionCount = 0;
    BankAccount.accountCount += 1;   // increment class-level counter
    this.accountId = BankAccount.accountCount;
  }

  static create(ownerName, initialBalance) {
    return new BankAccount(ownerName, initialBalance);
  }

  static fromObject(obj) {
    return new BankAccount(obj.name, obj.balance);
  }

  deposit(amount) {
    if (amount <= 0) throw new Error("Deposit must be positive");
    this.balance += amount;
    this.transactionCount++;
    return this;
  }

  withdraw(amount) {
    if (amount <= 0) throw new Error("Withdrawal must be positive");
    if (amount > this.balance) throw new Error("Insufficient funds");
    this.balance -= amount;
    this.transactionCount++;
    return this;
  }

  getStatement() {
    return `[${this.accountId}] ${this.ownerName}: $${this.balance.toFixed(2)}`;
  }
}

const alice = BankAccount.create("Alice", 1000);
const bob   = BankAccount.fromObject({ name: "Bob", balance: 500 });

console.log(alice.getStatement());           // → "[1] Alice: $1000.00"
console.log(bob.getStatement());             // → "[2] Bob: $500.00"
console.log(BankAccount.accountCount);       // → 2
```

**`static`** — a static method or property belongs to the **class object itself**, not to instances. `BankAccount.accountCount` is accessed on the class. `alice.accountCount` would be `undefined` — static members are not on instances.

**Static factory methods** (`create`, `fromObject`) are a common pattern: instead of calling `new BankAccount(...)` directly everywhere, callers use a named factory. This makes the intent clear (`BankAccount.fromObject(...)` conveys "create from a plain object" better than a constructor with the same parameters) and allows different construction paths without overloading the constructor.

**CS lens — the class as a namespace:**

Static members turn the class into a namespace for related utilities. `BankAccount.minimumBalance` is more organized than a separate global variable `minimumBankAccountBalance`. The class groups related data and behavior — static members for class-level concerns, instance members for per-object concerns.

**SE lens — static factory methods over multiple constructors:**

JavaScript allows only one constructor per class. Static factory methods provide named alternatives: `BankAccount.create(name, balance)` and `BankAccount.fromObject(obj)` are two construction paths without overloading. This improves readability — the method name describes what kind of construction is happening.

**What breaks without static:**

Without `BankAccount.accountCount`, tracking the total number of accounts requires a separate global variable. Global variables can be modified by any code. A static property is associated with the class and is (at least conventionally) only modified through class methods.

---

### SAVE AND TRY

```js
// Continuing with the BankAccount class above
console.log("Accounts before:", BankAccount.accountCount);   // → 0 initially
const c1 = BankAccount.create("Carol", 200);
const c2 = BankAccount.create("Dave",  300);
console.log("Accounts after:", BankAccount.accountCount);    // → 2 (plus any from above)
console.log(c1.accountId, c2.accountId);  // sequential IDs
```

**Change something:** Try accessing `c1.accountCount`. Expected: `undefined` — static properties are on the class, not on instances. Try `BankAccount.minimumBalance = 100`. Now try `new BankAccount("Eve", 50)`. Expected: error — initial balance below the new minimum.

---

## Connect the Pieces

**What you built:** A `BankAccount` class with constructor validation, instance methods, method chaining, multiple independent instances, and static members.

**How it connects to LAB-007 (Closures):** The `makeCounter()` factory from LAB-007 returned an object with functions that shared a closure over `count`. A class does the same thing with `new`: `this.balance` plays the role of `count`, and `deposit`/`withdraw` play the role of the returned functions. The key difference: a class lets you create multiple independent instances from one definition, whereas `makeCounter()` had to be called again for each counter.

**How it connects forward:**

- **LAB-013 (Encapsulation):** You will add private fields (`#balance`) to `BankAccount` so external code literally cannot access or modify `balance` directly — enforced by the language, not by convention.
- **LAB-014 (Inheritance):** `SavingsAccount extends BankAccount` — a savings account that inherits all of BankAccount's behavior and adds interest calculations.
- **LAB-015 (Polymorphism):** An array of mixed account types (`BankAccount`, `SavingsAccount`, `CheckingAccount`) — all of which have `getStatement()` — can be iterated and have `getStatement()` called without knowing which concrete type each is.
- **LAB-016 (Abstraction):** An `AbstractAccount` defines the interface that all account types must implement.
- **LAB-065–086 (Design Patterns):** Every creational pattern (Factory, Builder, Prototype) works with classes. Every structural pattern uses class composition or inheritance.

**The real-world connection:**

`class` syntax in JavaScript compiles to prototypal inheritance — the underlying mechanism JavaScript has used since 1995. Every React component written as a class extends `React.Component` and uses the same `constructor`, `this`, and method semantics you used here. TypeScript classes compile to the same JavaScript. Java and C# classes have an identical mental model. The specific syntax differs; the concepts — constructor, instance, method, `this`/`self` — are universal across every object-oriented language.

---

## What Breaks Without This

**Concrete failure — no shared method definitions:**

```js
// Without classes: duplicated method for each object
function createBankAccount(ownerName, balance) {
  return {
    ownerName,
    balance,
    // Each object gets its OWN copy of deposit — 1000 accounts = 1000 deposit functions
    deposit: function(amount) { this.balance += amount; },
    withdraw: function(amount) { this.balance -= amount; },
    getStatement: function() { return `${this.ownerName}: $${this.balance}`; },
  };
}

const a = createBankAccount("Alice", 1000);
const b = createBankAccount("Bob", 500);

console.log(a.deposit === b.deposit);  // → false — two separate functions in memory
```

With classes, `alice.deposit === bob.deposit` is `true` — they share one method. With the factory pattern above, every instance gets its own copy of every method. For 1,000 accounts, that is 3,000 separate function objects (deposit + withdraw + getStatement) instead of 3. Classes solve this through the **prototype chain** — methods are stored on the prototype, not on each instance. You do not need to understand the prototype chain to use classes, but this is why `class` is not just syntactic sugar over plain objects.

---

## Definition of Done

Verify each item before moving to LAB-013.

- [ ] `new BankAccount("Alice", 1000)` creates an instance with `ownerName`, `balance`, and `transactionCount`
- [ ] `new BankAccount("Bob", -1)` throws an error
- [ ] `account.deposit(100)` increases `balance` by `100` and increments `transactionCount`
- [ ] `account.deposit(100).withdraw(50)` chains correctly — balance net +50
- [ ] Two `BankAccount` instances have completely independent `balance` values
- [ ] `alice.deposit === bob.deposit` is `true` (shared method on the prototype)
- [ ] `BankAccount.accountCount` increments with each `new BankAccount(...)` call
- [ ] `BankAccount.create("Alice", 100)` creates a valid instance via static factory

**Git commit:**

```
git add .
git commit -m "LAB-012: BankAccount class with constructor validation, instance methods, method chaining, and static members"
```

---

## Quick Check Answers

**1. Does calling `account1.deposit(100)` change `account2`'s balance?**

No. Each instance has its own `balance` property stored in separate heap memory. `account1` and `account2` are two different objects at two different memory addresses. `this.balance += amount` inside `deposit` modifies the property of the specific object that `this` points to — which is `account1` when called as `account1.deposit(100)`. `account2`'s data is untouched.

**2. What does `this` refer to inside a class method?**

`this` refers to the specific instance on which the method was called. When you call `account1.deposit(100)`, inside `deposit`, `this` is `account1`. When you call `account2.deposit(50)`, `this` is `account2`. `this` is not fixed at definition time — it is set at call time based on what is to the left of the dot.

**3. What is the difference between the class definition and an instance?**

The class is a **blueprint** — a description of what properties and methods objects of this type will have. It exists as a single object in memory (the class object). An instance is a **specific object** created from the blueprint. `BankAccount` is the blueprint; `new BankAccount("Alice", 1000)` creates one instance of it. You can create as many instances as you want from one class. Each instance has its own data; all instances share the class's method definitions.

---

*Next: LAB-013 — Encapsulation*
