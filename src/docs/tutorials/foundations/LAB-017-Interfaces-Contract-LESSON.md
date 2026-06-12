# FOUNDATIONS — LAB-017 — Interfaces as a Contract

**Series:** FOUNDATIONS — Part III: Object-Oriented Programming
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 50–65 minutes.

---

## What You Will Build

Two classes — `EmailNotifier` and `SmsNotifier` — that both satisfy a single `Notifier` contract. A function `alertUser` that works through the contract and cannot tell which implementation it is using. You will define the contract using the JavaScript convention (documented method signatures) and demonstrate how TypeScript's `interface` keyword makes this contract machine-checkable. After this lab, you will understand how programming to a contract creates seams where implementations can be swapped, and why this is the single most important technique for building testable code.

---

## What You Need to Know First

**From LAB-016 (Abstraction):** Abstract classes define contracts through enforced "must implement" methods. An interface is a purer form of this: a contract with zero implementation, only method signatures.

**From LAB-015 (Polymorphism):** Code that works through a contract works with any implementation of that contract — automatically, without changes.

**The distinction from LAB-016:** An abstract class can contain implementation (the `exists` and `count` methods). An interface contains only signatures — no implementation at all. An interface is a pure contract. In JavaScript, you simulate this with documentation; TypeScript enforces it at compile time.

---

> **Quick Check — try to answer before reading:**
>
> 1. A `Logger` contract requires `log(message: string): void`. You pass an object that has `log(message: string, level: string): void`. Is this compatible? Why or why not?
> 2. Why would you depend on an interface rather than a concrete class? What does it gain you?
> 3. Can a class implement multiple contracts/interfaces? Give a use case.
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Contract as Documentation

**The problem this step solves:** Establish what a contract is before making it enforceable.

**The code — the contract, written as comments:**

```js
/**
 * Notifier interface
 *
 * Any object that satisfies this contract must implement:
 *   send(recipient, message) → void
 *     - recipient: string  — where the notification goes (email address, phone number, etc.)
 *     - message: string    — the text to deliver
 *     Throws if send fails.
 *
 *   getDescription() → string
 *     - Returns a human-readable description of this notifier type.
 */

class EmailNotifier {
  send(recipient, message) {
    // In production: call an email API here
    console.log(`[EMAIL] To: ${recipient} | Message: ${message}`);
  }

  getDescription() {
    return "email notifier";
  }
}

class SmsNotifier {
  send(recipient, message) {
    // In production: call a SMS gateway here
    console.log(`[SMS] To: ${recipient} | Message: ${message}`);
  }

  getDescription() {
    return "SMS notifier";
  }
}

// Business logic: depends on the contract, not the class
function alertUser(notifier, recipient, event) {
  const message = `Alert: ${event} occurred at ${new Date().toLocaleTimeString()}`;
  notifier.send(recipient, message);
  console.log(`Notified via ${notifier.getDescription()}`);
}

alertUser(new EmailNotifier(), "alice@example.com", "login");
alertUser(new SmsNotifier(),   "+15551234567",      "login");
```

**The walkthrough:**

1. `alertUser(new EmailNotifier(), ...)` — `notifier` is the `EmailNotifier` instance.
2. `message` is constructed from the event and current time.
3. `notifier.send(recipient, message)` — JavaScript calls `EmailNotifier.prototype.send`. Logs the email format.
4. `notifier.getDescription()` returns `"email notifier"`.

Then:
5. `alertUser(new SmsNotifier(), ...)` — same function, different `notifier`. Calls `SmsNotifier.prototype.send`. Logs the SMS format.
6. `notifier.getDescription()` returns `"SMS notifier"`.

`new Date().toLocaleTimeString()` — `new Date()` creates the current date and time. `.toLocaleTimeString()` returns the time portion formatted according to the user's locale (e.g., `"2:30:45 PM"`).

**CS lens — the contract as a specification:**

The contract is a **specification** of what any conforming object must support. It specifies method names, parameter types, return types, and error behavior. Any object that satisfies the specification can be used wherever the contract type is expected. In strongly-typed languages (TypeScript, Java, C#), the compiler checks conformance. In JavaScript, the programmer checks it — and duck typing confirms it at runtime when the method is called.

**SE lens — the seam:**

The point where `alertUser` calls `notifier.send(...)` is a **seam** — a place where behavior can vary without changing the surrounding code. Seams are where you inject test doubles, swap implementations, and change behavior for different environments. Programming to a contract creates a seam; programming to a concrete class eliminates the seam and couples behavior to one specific implementation.

**What breaks if you program to the class:**

```js
function alertUser(emailNotifier, recipient, event) {
  // This function is forever coupled to EmailNotifier
  emailNotifier.send(recipient, message);
}
```

Adding SMS support requires adding a parameter: `alertUser(emailNotifier, smsNotifier, ...)` and adding `if (smsEnabled) smsNotifier.send(...)`. The function grows; every new channel requires another parameter and another branch. With a contract, adding a channel is one new class and one new call site.

---

### SAVE AND TRY

```js
// Existing notifiers + alertUser as defined above

// A test double: a notifier that captures messages without sending them
class CaptureNotifier {
  constructor() {
    this.sent = [];
  }

  send(recipient, message) {
    this.sent.push({ recipient, message });   // capture instead of send
  }

  getDescription() {
    return "capture notifier (test)";
  }
}

const capture = new CaptureNotifier();
alertUser(capture, "test@example.com", "account lockout");
alertUser(capture, "test@example.com", "suspicious login");

console.log("Captured messages:", capture.sent.length);   // → 2
console.log("First:", capture.sent[0].message);
```

Expected: 2 captured messages. `CaptureNotifier` satisfies the `Notifier` contract without sending anything — making it safe for tests.

**Change something:** Pass `capture.sent` to `JSON.stringify` to see the full captured data. Verify both messages are present. This is the test double pattern — you will study it formally in LAB-062.

---

### Step 2 — Multiple Implementations of One Contract

**The problem this step solves:** Show that any number of implementations can satisfy a contract, and that adding a new one requires zero changes to existing code.

**The code:**

```js
class PushNotifier {
  send(recipient, message) {
    console.log(`[PUSH] Device: ${recipient} | Push: ${message}`);
  }

  getDescription() {
    return "push notifier";
  }
}

class SlackNotifier {
  #webhookUrl;

  constructor(webhookUrl) {
    this.#webhookUrl = webhookUrl;
  }

  send(recipient, message) {
    // In production: POST to the webhook URL
    console.log(`[SLACK] Channel: ${recipient} | Message: ${message} | Webhook: ${this.#webhookUrl}`);
  }

  getDescription() {
    return "Slack notifier";
  }
}

// All four implementations work through the same alertUser function:
const notifiers = [
  new EmailNotifier(),
  new SmsNotifier(),
  new PushNotifier(),
  new SlackNotifier("https://hooks.slack.com/T01234/secret"),
];

notifiers.forEach((notifier, index) => {
  alertUser(notifier, `user-${index}`, "critical error");
});
```

**The walkthrough:**

The `forEach` calls `alertUser` four times with four different `notifier` objects. Each call is identical from `alertUser`'s perspective. Each call produces different output because each `notifier` implements `send` differently. Neither `PushNotifier` nor `SlackNotifier` needed `alertUser` to be modified to support them.

`index` in the `forEach` callback — when `Array.prototype.forEach(callback)` is called, the callback receives three arguments: `(element, index, array)`. The second argument is the zero-based index of the current element. We use it here to give each `alertUser` call a different "user" string.

**CS lens — the contract as an abstraction boundary:**

The contract creates a boundary between two sides. The **consumer** side (`alertUser`) knows only the contract — method names and signatures. The **producer** side (each notifier class) knows only the contract — what methods to implement. Neither side knows anything about the other. New notifiers can be added without consumers knowing. Consumer changes do not affect notifier implementations. This boundary is what makes large systems manageable: each side can evolve independently.

**SE lens — the interface segregation preview:**

This `Notifier` contract has two methods. What if a third method were added — `cancel(messageId)`? Not all notifiers support cancellation (you cannot unsend an SMS). Adding `cancel` to the contract forces all notifiers to implement it, even if they throw "not supported." This is the **Interface Segregation Principle** (LAB-051): split fat contracts into focused ones. A `CancellableNotifier` contract could extend the base `Notifier` contract and add `cancel`. Only the implementations that support cancellation implement `CancellableNotifier`. Code that needs cancellation depends on `CancellableNotifier`; code that does not depends only on `Notifier`.

**What breaks if contracts drift:**

If `EmailNotifier.send` accepts `(recipient, message, ccList)` and `SmsNotifier.send` accepts only `(recipient, message)`, they no longer satisfy the same contract. Code written for one cannot be swapped for the other. The contract's value is its consistency across all implementations.

---

### SAVE AND TRY

```js
function broadcastAlert(notifiers, event) {
  notifiers.forEach(notifier => {
    alertUser(notifier, "ops-team", event);
  });
}

const allNotifiers = [new EmailNotifier(), new SmsNotifier(), new PushNotifier()];
broadcastAlert(allNotifiers, "server down");
```

Expected: three separate notifications, one per notifier.

**Change something:** Add `new CaptureNotifier()` to `allNotifiers`. Expected: its `send` captures the message instead of sending it. `broadcastAlert` does not know or care. This demonstrates that a capture notifier (for testing) is interchangeable with real notifiers at runtime.

---

### Step 3 — TypeScript Interfaces: Machine-Checkable Contracts

**The problem this step solves:** Show how TypeScript makes the contract explicit and checkable, producing errors at write time rather than runtime.

**Note:** You cannot run TypeScript in the browser console. Read the TypeScript code as documentation for the concept — the JavaScript behavior is identical, but TypeScript adds compile-time verification.

```typescript
// TypeScript: the contract is a language construct
interface Notifier {
  send(recipient: string, message: string): void;
  getDescription(): string;
}

// TypeScript enforces the contract:
class EmailNotifier implements Notifier {
  send(recipient: string, message: string): void {
    console.log(`[EMAIL] To: ${recipient} | ${message}`);
  }

  getDescription(): string {
    return "email notifier";
  }
}

// If a required method is missing:
class BrokenNotifier implements Notifier {
  send(recipient: string, message: string): void {
    console.log(`[BROKEN] ${message}`);
  }
  // getDescription is MISSING
  // TypeScript error: Property 'getDescription' is missing
}

// The function type uses the interface:
function alertUser(notifier: Notifier, recipient: string, event: string): void {
  notifier.send(recipient, `Alert: ${event}`);
  console.log(`Notified via ${notifier.getDescription()}`);
}
```

**`interface Notifier { ... }`** — a TypeScript interface is a contract with zero implementation. It declares method signatures: name, parameter types, return type. Any class that has all these methods (with compatible types) satisfies the interface — no `implements` keyword is required. TypeScript uses **structural typing**: if an object has the right shape, it is compatible.

**`class EmailNotifier implements Notifier`** — the `implements` keyword is optional in TypeScript (duck typing works without it) but is good practice. It makes the intent explicit AND makes TypeScript produce a clear error if a method is missing or has the wrong signature, rather than a potentially confusing error at the point of use.

**Structural typing example:**

```typescript
// This plain object satisfies Notifier — no class, no extends, no implements
const slimNotifier = {
  send(recipient: string, message: string) {
    console.log(`${recipient}: ${message}`);
  },
  getDescription() {
    return "slim notifier";
  }
};

alertUser(slimNotifier, "alice", "test");   // TypeScript: ✓ compatible
```

TypeScript checks that `slimNotifier` has `send` with compatible parameters and `getDescription` returning a string. It does not require `slimNotifier` to declare `implements Notifier`. The structure is all that matters.

**CS lens — structural vs nominal typing:**

**Nominal typing** (Java, C#): type compatibility is determined by name. An object that does not explicitly declare `implements Notifier` is not compatible, even if it has all the right methods.

**Structural typing** (TypeScript, Go): type compatibility is determined by shape. Any object with the required methods is compatible, regardless of what it is called or whether it declares the interface.

JavaScript's duck typing is runtime structural typing. TypeScript's interface system is compile-time structural typing. Both achieve the same goal: a contract-based system where implementations are freely substitutable if they have the right shape.

**SE lens — the `implements` keyword as a contract declaration:**

Even in TypeScript, `implements` is optional (structural typing means it is not required for the compiler to check compatibility). But writing `implements Notifier` serves as documentation and ensures the compiler checks the class against the contract at the point of definition — not at the point of use. Discovering a missing method when writing the class is far better than discovering it when someone else tries to pass it as a `Notifier`.

**What breaks in TypeScript without interfaces:**

Without an interface, `alertUser(notifier: EmailNotifier, ...)` is the only option. Passing a `SmsNotifier` produces a type error. Adding SMS support requires changing the parameter type to `EmailNotifier | SmsNotifier` — and adding every new notifier to the union. With an interface, `alertUser(notifier: Notifier, ...)` accepts any conforming object forever, with no changes.

---

### SAVE AND TRY (JavaScript simulation of TypeScript checking)

```js
// A validation function that checks whether an object satisfies the Notifier contract
function assertImplementsNotifier(obj) {
  const requiredMethods = ["send", "getDescription"];
  const missing = requiredMethods.filter(method => typeof obj[method] !== "function");
  if (missing.length > 0) {
    throw new Error(`Contract violation: missing methods: ${missing.join(", ")}`);
  }
}

// Test the check:
assertImplementsNotifier(new EmailNotifier());    // → no error
assertImplementsNotifier(new SmsNotifier());      // → no error
assertImplementsNotifier({ send: () => {} });     // → "missing methods: getDescription"
assertImplementsNotifier({});                     // → "missing methods: send, getDescription"
```

Expected: first two succeed; third and fourth throw.

**Change something:** Add a `priority` method to the `Notifier` contract check. Required: `["send", "getDescription", "priority"]`. Run against existing notifiers. Expected: all fail because none have `priority`. This demonstrates what happens when a contract is extended — all existing implementations must be updated. This is the Interface Segregation trade-off: adding to a contract is a breaking change.

---

### Step 4 — Composing Contracts

**The problem this step solves:** Show that an object can implement multiple contracts, and that contracts can extend other contracts.

**The code:**

```js
/**
 * LoggableNotifier contract (extends Notifier):
 *   send(recipient, message) → void     (from Notifier)
 *   getDescription() → string           (from Notifier)
 *   getLog() → Array<{recipient, message, sentAt}>  (new)
 */

class LoggingEmailNotifier {
  #log = [];

  send(recipient, message) {
    const entry = { recipient, message, sentAt: new Date().toISOString() };
    this.#log.push(entry);
    console.log(`[EMAIL] To: ${recipient} | ${message}`);
  }

  getDescription() {
    return "logging email notifier";
  }

  getLog() {
    return [...this.#log];   // return a copy
  }
}

// Works as a Notifier:
alertUser(new LoggingEmailNotifier(), "alice@example.com", "test");

// Also provides the extended contract:
const loggingNotifier = new LoggingEmailNotifier();
loggingNotifier.send("alice@example.com", "first message");
loggingNotifier.send("bob@example.com", "second message");
console.log("Log entries:", loggingNotifier.getLog().length);   // → 2
```

**The walkthrough:**

`LoggingEmailNotifier` satisfies both the `Notifier` contract (has `send` and `getDescription`) and the `LoggableNotifier` contract (also has `getLog`). Code that needs only `Notifier` capabilities can use it. Code that needs logging capabilities can also use it — by calling `getLog()` after the fact.

**CS lens — interface composition:**

Contracts can be composed: `LoggableNotifier extends Notifier` means "everything in `Notifier` plus `getLog`." A class that satisfies `LoggableNotifier` automatically satisfies `Notifier`. This hierarchical composition lets you build layered contracts: every cache is a store; every logging store is a store plus logging; every audited logging store is a logging store plus an audit trail. Each layer adds capabilities without removing the base contract.

**SE lens — the Liskov Substitution Principle for contracts:**

A `LoggingEmailNotifier` can be used anywhere a `Notifier` is expected — it satisfies the full `Notifier` contract. But a `Notifier` cannot be used everywhere a `LoggableNotifier` is expected — it may not have `getLog`. Code that needs logging must depend on `LoggableNotifier`. Code that does not need logging depends on `Notifier`. Depending on only what you need is the Interface Segregation Principle (LAB-051).

**What breaks if you always depend on the widest contract:**

If `alertUser(notifier: LoggableNotifier, ...)` is the signature, you can never pass a plain `EmailNotifier` or `SmsNotifier` — they do not have `getLog`. The function is over-specified. It depends on a capability it does not use. The minimum necessary contract is `Notifier`; use that.

---

### SAVE AND TRY

```js
function auditedAlertUser(notifier, recipient, event) {
  alertUser(notifier, recipient, event);

  // Only call getLog if the notifier supports it
  if (typeof notifier.getLog === "function") {
    const log = notifier.getLog();
    console.log(`[AUDIT] ${log.length} message(s) sent by ${notifier.getDescription()}`);
  }
}

const plain   = new EmailNotifier();
const logging = new LoggingEmailNotifier();

auditedAlertUser(plain,   "alice@example.com", "test");
auditedAlertUser(logging, "bob@example.com",   "test");
```

Expected: the `plain` notifier produces no audit line (no `getLog`); the `logging` notifier produces an audit line.

**Change something:** Call `auditedAlertUser(logging, ...)` three times. Expected: the audit line reports 3 messages. The log accumulates across calls because `#log` is an instance field that persists.

---

## Connect the Pieces

**What you built:** A `Notifier` contract, four implementations satisfying it, a test double (CaptureNotifier), the TypeScript `interface` syntax that formalizes it, and a composed `LoggableNotifier` contract.

**How it connects to LAB-016 (Abstraction):** In LAB-016, the abstract `DataStore` class defined the contract via throwing methods. A TypeScript `interface` is a cleaner alternative: pure signature, zero implementation. Both achieve "what, not how."

**How it connects to LAB-015 (Polymorphism):** The `Notifier` contract is what allows polymorphic dispatch — any object satisfying the contract works with `alertUser`. The interface is the formal name for the contract that enables polymorphism.

**How it connects forward:**

- **LAB-034 (TypeScript Interfaces):** You will use TypeScript `interface` syntax formally and see how structural typing differs from nominal typing. The concepts here are the prerequisite.
- **LAB-051 (Interface Segregation Principle):** Fat contracts force implementers to provide no-op methods. The solution — split into focused contracts — is what you previewed with `Notifier` vs `LoggableNotifier`.
- **LAB-052 (Dependency Inversion Principle):** High-level code (`alertUser`) depends on the `Notifier` abstraction, not on concrete classes. DIP formalizes this rule.
- **LAB-062 (Test Doubles):** `CaptureNotifier` is a **stub** — an implementation that satisfies the contract but does not perform real work. You will build sophisticated test doubles in LAB-062.

**The real-world connection:**

Every library and framework is built on interfaces. Node.js's `EventEmitter` defines an event listener contract — any function that accepts an event object satisfies it. Express middleware satisfies `(req, res, next) => void` — a function-level interface. Java's `Comparable` interface allows any object to participate in sorting. Go's `io.Reader` interface allows any object with a `Read` method to be used as a data source — files, network connections, in-memory buffers, and more. Interfaces are the universal mechanism for pluggable, extensible systems.

---

## What Breaks Without This

**Concrete failure — type mismatch discovered at runtime:**

```js
// Object that looks like a Notifier but has the wrong signature:
const brokenNotifier = {
  send: (recipient) => console.log(`sent to ${recipient}`),  // missing 'message' param
  getDescription: () => "broken"
};

// JavaScript does not check — it runs:
alertUser(brokenNotifier, "alice@example.com", "server down");
// → "sent to alice@example.com" (message is silently ignored — 'message' arg not in function)
// → "Notified via broken"
// No error thrown. The notification was delivered without the message content.
```

The missing parameter produces wrong behavior silently — the recipient is notified but receives no message content. TypeScript would catch this: `send(recipient: string, message: string): void` requires two parameters; a function with one parameter is incompatible. The interface check turns this silent bug into a compile-time error.

---

## Definition of Done

Verify each item before moving to LAB-018.

- [ ] `alertUser` calls `send` and `getDescription` on any object — no `instanceof` checks
- [ ] `CaptureNotifier` satisfies the contract and captures messages without sending them
- [ ] `assertImplementsNotifier({})` throws with "missing methods: send, getDescription"
- [ ] `assertImplementsNotifier(new EmailNotifier())` passes
- [ ] `LoggingEmailNotifier` works as both a `Notifier` and a `LoggableNotifier`
- [ ] You can explain the difference between structural typing (TypeScript) and nominal typing (Java)

**Git commit:**

```
git add .
git commit -m "LAB-017: Notifier interface with multiple implementations, test double, and TypeScript interface concept"
```

---

## Quick Check Answers

**1. Is `log(message, level)` compatible with a contract requiring `log(message)`?**

In JavaScript's duck typing: yes — calling `obj.log("msg")` works on an object with `log(message, level)`. The extra `level` parameter is just `undefined`. In TypeScript's structural typing: it depends on direction. A function with more parameters than required is generally NOT assignable to a type with fewer, for function types, because TypeScript checks parameter types strictly in certain contexts. For method implementations: TypeScript allows this in many practical cases through callback compatibility rules. In practice, the guidance is: implement the contract exactly as specified — no extra required parameters, no missing parameters.

**2. Why depend on an interface rather than a concrete class?**

An interface creates a **seam** — a point where the implementation can be swapped. Code that depends on a concrete class is permanently coupled to that class's behavior, test strategy, and deployment requirements. Code that depends on an interface can use any conforming implementation: a real one in production, an in-memory one in tests, a mock one for specific scenarios. The interface is what makes a system's components independently replaceable.

**3. Can a class implement multiple contracts? Give a use case.**

Yes. In TypeScript: `class LoggingEmailNotifier implements Notifier, LoggableNotifier`. In JavaScript: a class can satisfy any number of duck-typed contracts simultaneously, because any object that has the required methods satisfies any contract that requires those methods.

Use case: a data store that is both a `DataStore` (CRUD operations) and a `Transactional` (begin, commit, rollback). Queries go through `DataStore`; transaction management goes through `Transactional`. A `PostgresStore` implements both. Code that manages transactions depends on `Transactional`; code that reads/writes data depends on `DataStore`. Neither depends on `PostgresStore` directly.

---

*Next: LAB-018 — Object Composition*
