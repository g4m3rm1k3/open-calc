# FOUNDATIONS — LAB-054 — Composition over Inheritance

**Series:** FOUNDATIONS — Part IX: Software Engineering Principles
**Environment:** TypeScript playground
**Time:** 50–65 minutes.

---

## What You Will Build

The fragile base class problem demonstrated concretely, a refactored version using behavior components instead of inheritance, and a behavior combination that requires a new subclass in inheritance but zero new classes in composition. After this lab you will be able to decide when inheritance is the right tool and when composition is better.

---

## What You Need to Know First

**From LAB-018 (Object Composition):** Composition means "has-a" — an object holds a reference to another object and delegates to it. Inheritance means "is-a" — a subclass inherits all parent behavior.

**From LAB-050 (LSP):** LSP is often violated when inheritance is used for code reuse rather than for genuine subtyping.

---

> **Quick Check — try to answer before reading:**
>
> 1. What is the "fragile base class problem"?
> 2. Why does inheritance create coupling between parent and child?
> 3. Name one scenario where inheritance is clearly the right choice.
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Fragile Base Class Problem

```typescript
class EmailSender {
  protected sentCount = 0;

  sendAll(emails: string[], message: string): void {
    for (const email of emails) {
      this.send(email, message);
    }
  }

  send(email: string, message: string): void {
    console.log(`Sending "${message}" to ${email}`);
    this.sentCount++;
  }
}

// LoggingEmailSender wants to count total emails sent (for analytics):
class LoggingEmailSender extends EmailSender {
  override send(email: string, message: string): void {
    super.send(email, message);
    // Assume we log here
  }

  override sendAll(emails: string[], message: string): void {
    for (const email of emails) {
      this.send(email, message);  // this.send calls LoggingEmailSender.send
    }
  }
}
```

**The fragile base class problem in action:**

The developer of `LoggingEmailSender` did not override `sendAll` at first. They assumed `sendAll` calls `this.send` which, through polymorphism, would call their overridden `send`. It does. But the base class developer later "optimizes" `sendAll`:

```typescript
// Base class "optimization" that breaks the subclass:
class EmailSender {
  sendAll(emails: string[], message: string): void {
    // Optimization: batch all sends together
    const batchedEmails = emails.join(';');
    console.log(`Batch sending to: ${batchedEmails}`);
    this.sentCount += emails.length;
    // No longer calls this.send() for each email!
  }
}
```

Now `LoggingEmailSender.sendAll` does not log each email — the base class bypassed `send()`. The subclass breaks because the base class changed an internal implementation detail that the subclass was unknowingly relying on.

**The CS lens — tight coupling through inheritance:** Inheritance creates the tightest possible coupling between two classes. The subclass depends on the internal structure of the superclass — not just its public interface. A change to how the superclass calls its own methods can break subclasses without any change to the subclass code or the public interface.

---

### Step 2 — Composition: Independent Behavior Components

```typescript
// Instead of inheriting behavior, compose it:

interface EmailTransport {
  send(to: string, subject: string): void;
}

interface EmailLogger {
  logSent(to: string): void;
}

interface EmailRateLimiter {
  canSend(): boolean;
  recordSend(): void;
}

// Concrete implementations — no inheritance hierarchy:
class SMTPTransport implements EmailTransport {
  send(to: string, subject: string): void {
    console.log(`[SMTP] Delivering "${subject}" → ${to}`);
  }
}

class ConsoleLogger implements EmailLogger {
  private count = 0;
  logSent(to: string): void {
    this.count++;
    console.log(`[Log] Email #${this.count} sent to ${to}`);
  }
  get totalSent(): number { return this.count; }
}

class RateLimiter implements EmailRateLimiter {
  private sentThisSecond = 0;
  private readonly maxPerSecond: number;

  constructor(maxPerSecond: number) {
    this.maxPerSecond = maxPerSecond;
    setInterval(() => { this.sentThisSecond = 0; }, 1000);
  }

  canSend(): boolean { return this.sentThisSecond < this.maxPerSecond; }
  recordSend(): void { this.sentThisSecond++; }
}

// The composed EmailService — delegates to components:
class EmailService {
  constructor(
    private readonly transport: EmailTransport,
    private readonly logger: EmailLogger,
    private readonly rateLimiter: EmailRateLimiter,
  ) {}

  sendEmail(to: string, subject: string): boolean {
    if (!this.rateLimiter.canSend()) {
      console.log(`Rate limit reached — cannot send to ${to}`);
      return false;
    }
    this.transport.send(to, subject);
    this.logger.logSent(to);
    this.rateLimiter.recordSend();
    return true;
  }

  sendAll(recipients: string[], subject: string): number {
    let sentCount = 0;
    for (const recipient of recipients) {
      if (this.sendEmail(recipient, subject)) sentCount++;
    }
    return sentCount;
  }
}
```

**The walkthrough:**

`EmailService` delegates each responsibility to an injected component. It does not inherit from any of them. Changing the logging implementation (`ConsoleLogger` → `DatabaseLogger`) requires only creating a new `EmailLogger` implementation and passing it to `EmailService`. `EmailService` is not affected.

---

### Step 3 — New Behavior Combinations Without New Classes

**With inheritance:** if you want a transport+logger but no rate limiter, you need a new subclass. Transport+logger+rate limiter: another. Each combination requires a new class.

With composition, new behavior combinations are created at the call site:

```typescript
// Minimal: transport only — no logging, no rate limiting (for tests)
const silentTransport: EmailTransport = {
  send(to, subject) { /* no-op */ }
};

const silentLogger: EmailLogger = {
  logSent(_to) { /* no-op */ }
};

const unlimitedRateLimiter: EmailRateLimiter = {
  canSend() { return true; },
  recordSend() { /* no-op */ },
};

const testEmailService = new EmailService(silentTransport, silentLogger, unlimitedRateLimiter);

// Production: full feature set
const productionEmailService = new EmailService(
  new SMTPTransport(),
  new ConsoleLogger(),
  new RateLimiter(10),  // max 10 per second
);

// High-volume: different rate limit, same transport and logger
const highVolumeEmailService = new EmailService(
  new SMTPTransport(),
  new ConsoleLogger(),
  new RateLimiter(100),
);
```

**The CS lens — combinatorial explosion:** With inheritance, supporting 3 transports × 3 loggers × 3 rate limiters = 27 subclass combinations. With composition: 3 + 3 + 3 = 9 classes, combined freely. Composition scales linearly; inheritance hierarchies for behavior combinations scale exponentially.

---

### Step 4 — When Inheritance Is Right

Composition is not always the answer. Use inheritance when:

1. **There is a genuine is-a relationship with behavioral substitutability (LSP).** `AdminUser extends User` when admin users truly IS-A user that adds capabilities without breaking the user contract.

2. **The subclass is extending, not overriding.** Adding methods without changing inherited ones avoids the fragile base class problem.

3. **You control both classes and will never change the base class's internal method-calling behavior.**

```typescript
// Good use of inheritance — extending without overriding:
class Animal {
  constructor(protected name: string) {}
  describe(): string { return `I am ${this.name}`; }
}

class Dog extends Animal {
  bark(): string { return 'Woof!'; }  // new behavior — does not override anything
  describe(): string {
    return `${super.describe()}, a dog`;  // extends, does not replace
  }
}
```

The rule of thumb: if you find yourself overriding many methods, or if you need to call `super()` and then add to what super did, consider composition. If you are only adding methods (not changing existing ones), inheritance is often fine.

---

## Connect the Pieces

- **React's composition model:** Components compose other components. There is no `class MyButton extends Button`. Shared behavior comes from hooks (composition) not inheritance.
- **The `@Decorator` pattern** (LAB-073) IS composition over inheritance — wrapping an object and delegating, rather than subclassing.
- **Go has no inheritance** — only composition. Embedding a struct is composition. This is a deliberate language design choice based on the fragile base class problem.

---

## What Breaks Without This

**Adding a new behavior with inheritance:**

```typescript
// Want: transport + logger + encryption — new requirement
class EncryptedLoggingEmailSender extends LoggingEmailSender {
  override send(email: string, message: string): void {
    const encryptedMessage = encrypt(message);
    super.send(email, encryptedMessage);  // calls LoggingEmailSender.send
    // But LoggingEmailSender.send calls EmailSender.send...
    // How deep does the super chain go? Where does encryption happen?
  }
}
```

Deep inheritance chains make it increasingly difficult to reason about when each method runs and in what order. The fragile base class problem compounds: each new layer is fragile against changes to every layer above it.

---

## Definition of Done

- [ ] `EmailService` with `SMTPTransport` + `ConsoleLogger` + `RateLimiter(10)` works correctly
- [ ] `testEmailService` with no-op implementations runs the same tests without touching SMTP
- [ ] Adding `EncryptedTransport` requires only a new class implementing `EmailTransport` — zero changes to `EmailService`, `ConsoleLogger`, or `RateLimiter`
- [ ] You can name one concrete scenario where inheritance is correct and one where composition is better
- [ ] Explain the fragile base class problem in one paragraph to someone who has not read this lesson

**Git commit:**

```
git add src/
git commit -m "LAB-054: composition over inheritance — EmailService delegates to injected components; new behavior combinations require no new classes; fragile base class problem demonstrated"
```

---

## Quick Check Answers

1. **The fragile base class problem is when a change to a superclass breaks subclasses without any change to the subclass code.** The subclass was relying on internal behavior of the superclass (which methods call which other methods) that was not part of the public interface. The superclass author changes an internal implementation detail, not knowing that subclasses depended on it.
2. **Inheritance creates coupling to internal implementation details, not just the public interface.** A subclass can override any non-private method and therefore implicitly depends on when and how the superclass calls its own methods. This is deeper coupling than composition — with composition, you depend only on the public interface of the component.
3. **Inheritance is clearly right when the subclass is a genuine behavioral subtype (LSP holds) and you are adding new capabilities without modifying existing behavior.** `HTTPSConnection extends HTTPConnection` — HTTPS IS-A connection, adds TLS without breaking the HTTP contract. `AdminUser extends User` when admin adds capabilities without narrowing the user contract.
