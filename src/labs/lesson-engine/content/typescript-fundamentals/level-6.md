---
series: typescript-fundamentals
level: 6
title: Classes and Access Modifiers
lang: typescript
---

# Classes and Access Modifiers

JavaScript classes added syntactic sugar for constructor functions and prototypes in ES2015. TypeScript builds on this with access modifiers that control which code can read or write each property, and shorthand syntax that eliminates constructor boilerplate.

TypeScript classes are unique in that they serve two roles at once: they are a **runtime construct** (produce real JavaScript class code) and a **type construct** (define a type that describes instances). A class named `CourseRepo` both creates the `CourseRepo` constructor function and introduces a type named `CourseRepo`.

By the end of this lesson you will be able to use `public`, `private`, `protected`, and `readonly` access modifiers, write the parameter shorthand to declare and assign properties in one line, and understand when to use a class versus an interface.

## Access modifiers

`public` (default), `private`, and `protected` control what code can access class members.

```typescript
class BankAccount {
  public readonly accountId: string;
  private balance: number;
  protected owner: string;

  constructor(accountId: string, owner: string, initialBalance: number) {
    this.accountId = accountId;
    this.owner = owner;
    this.balance = initialBalance;
  }

  public deposit(amount: number): void {
    if (amount <= 0) throw new Error("Deposit must be positive");
    this.balance += amount;
  }

  public withdraw(amount: number): void {
    if (amount > this.balance) throw new Error("Insufficient funds");
    this.balance -= amount;
  }

  public getBalance(): number {
    return this.balance;
  }
}
```

```text
const account = new BankAccount("ACC-001", "Alice", 1000);
account.deposit(500);
account.getBalance()        // → 1500
account.balance             // Error: Property 'balance' is private
account.accountId = "XXX"   // Error: Cannot assign to 'accountId' — it is read-only
```

`private balance` — only code inside `BankAccount` can read or write `balance`. External code must use `deposit`, `withdraw`, and `getBalance`. This is **encapsulation**: the implementation (a number) is hidden; the interface (deposit/withdraw/getBalance) is exposed.

## Constructor parameter shorthand

TypeScript lets you combine parameter declarations and property assignments in one step.

```typescript
// The verbose way:
class CourseA {
  public id: string;
  public title: string;
  private levelCount: number;

  constructor(id: string, title: string, levelCount: number) {
    this.id = id;
    this.title = title;
    this.levelCount = levelCount;
  }
}

// TypeScript shorthand — identical result:
class Course {
  constructor(
    public readonly id: string,
    public title: string,
    private levelCount: number
  ) {}

  getLevelCount(): number { return this.levelCount; }
}
```

```text
const course = new Course("python-fundamentals", "Python Fundamentals", 37);
course.id          // → "python-fundamentals"
course.title       // → "Python Fundamentals"
course.levelCount  // Error: 'levelCount' is private
course.getLevelCount()  // → 37
```

**CS lens:** `private` in TypeScript is a **compile-time constraint** — it doesn't exist at runtime. The compiled JavaScript has no `private` keyword. TypeScript's `#field` syntax (JavaScript private fields) provides true runtime privacy. For production code requiring actual encapsulation at runtime, use `#field`. For development-time encapsulation (catching misuse in TypeScript codebases), `private` is sufficient and more readable.

## Implements — classes and interfaces

A class can declare that it `implements` an interface. TypeScript verifies the class has all required properties and methods.

```typescript
interface Serializable {
  serialize(): string;
  deserialize(data: string): void;
}

interface Validatable {
  validate(): boolean;
  errors: string[];
}

class UserForm implements Serializable, Validatable {
  errors: string[] = [];
  private name: string = "";
  private email: string = "";

  setName(name: string): void { this.name = name; }
  setEmail(email: string): void { this.email = email; }

  validate(): boolean {
    this.errors = [];
    if (!this.name) this.errors.push("Name is required");
    if (!this.email.includes("@")) this.errors.push("Email is invalid");
    return this.errors.length === 0;
  }

  serialize(): string {
    return JSON.stringify({ name: this.name, email: this.email });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.name = parsed.name;
    this.email = parsed.email;
  }
}
```

```text
const form = new UserForm();
form.setName("Alice");
form.setEmail("alice@example.com");
form.validate()     // → true
form.serialize()    // → '{"name":"Alice","email":"alice@example.com"}'

form.setEmail("invalid");
form.validate()     // → false
form.errors         // → ["Email is invalid"]
```

**SE lens:** `implements` is a **contract declaration** — the class promises to provide everything the interface requires. TypeScript will immediately report an error if the promise is broken (a method is missing or has the wrong signature). This is the same principle as Go interfaces, but explicit. The power of `implements` over inheritance is that a class can implement multiple interfaces, mixing concerns from different contracts — while only being able to extend one base class.

**Common mistakes:**
- Overusing classes — TypeScript (and modern JavaScript) often prefers plain objects and functions over classes. Classes are most appropriate when you need encapsulation (private state), inheritance, or instance identity. For plain data, use interfaces; for logic, use functions.
- Making everything `public` because it's the default — treat visibility as a design decision. `private` is documentation that says "callers should not depend on this implementation detail."

**Debug tip:** TypeScript immediately underlines class members that violate interface contracts. The error message shows exactly which interface method or property is missing or incompatible, making it trivial to identify what needs to be added.

**Next:** Modules and declaration files — `import`/`export`, ambient declarations, and working with third-party JavaScript packages.

## Challenge: class_access

Create a class with proper access modifiers.

Create a `Counter` class with:
- `private count: number` initialized to 0
- `public increment(): void` — increases count by 1
- `public decrement(): void` — decreases count by 1 (min 0)
- `public getCount(): number` — returns current count

```challenge typescript
class Counter {
  // implement the class
}
```

```test
var c = new Counter()
assert c.getCount() === 0
c.increment()
c.increment()
assert c.getCount() === 2
c.decrement()
assert c.getCount() === 1
c.decrement()
c.decrement()
assert c.getCount() === 0
```
