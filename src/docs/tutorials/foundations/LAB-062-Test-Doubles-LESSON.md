# FOUNDATIONS — LAB-062 — Test Doubles: Mocks, Stubs, Fakes, and Spies

**Series:** FOUNDATIONS — Part X: Testing
**Environment:** Browser DevTools console or Node.js
**Time:** 50–65 minutes.

---

## What You Will Build

A notification service that sends emails, tested without actually sending any emails. You will write a stub that returns a canned response, a spy that records calls without replacing behavior, a fake with a real (but simplified) implementation, and a mock that verifies the correct calls were made. After this lab you will know what each type of double is, how to implement each, and when to use each.

---

## What You Need to Know First

**From LAB-060 (Unit Testing):** Tests isolate the unit under test. When the unit depends on external systems (email servers, databases, payment gateways), those dependencies must be replaced in tests.

**From LAB-052 (DIP):** Dependency injection is the mechanism that makes test doubles possible — the class receives its dependencies, so tests can inject the test double.

---

> **Quick Check — try to answer before reading:**
>
> 1. Why would you ever want to replace a real dependency with a fake one in a test?
> 2. What is the difference between a stub and a mock?
> 3. When is a fake more appropriate than a mock?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The System Under Test

```typescript
interface EmailSender {
  sendEmail(to: string, subject: string, body: string): boolean;
}

class OrderNotificationService {
  private readonly emailSender: EmailSender;

  constructor(emailSender: EmailSender) {
    this.emailSender = emailSender;
  }

  notifyOrderShipped(orderId: string, customerEmail: string): boolean {
    const subject = `Your order ${orderId} has shipped`;
    const body    = `Hello! Order ${orderId} is on its way. Expected delivery: 3-5 business days.`;
    return this.emailSender.sendEmail(customerEmail, subject, body);
  }
}
```

**The walkthrough:** `OrderNotificationService` has one responsibility: sending an order-shipped notification. It depends on an `EmailSender` interface — not on any concrete email library. The dependency is injected via the constructor (dependency injection from LAB-052). In production, the real email library is injected. In tests, a test double is injected.

`EmailSender` is an interface — a TypeScript interface declares the contract (method signatures) without any implementation. Any object that has a `sendEmail(to, subject, body): boolean` method satisfies the interface, regardless of how that method works.

---

### Step 2 — Stub: Canned Response

A stub returns a fixed response regardless of the input. It does not verify anything — it just provides controlled output to the code under test.

```typescript
const alwaysSucceedsEmailStub: EmailSender = {
  sendEmail(_to: string, _subject: string, _body: string): boolean {
    return true;  // always succeeds — ignores all inputs
  }
};

const alwaysFailsEmailStub: EmailSender = {
  sendEmail(_to: string, _subject: string, _body: string): boolean {
    return false;  // always fails — simulates a down email server
  }
};

// Test: notification succeeds when email succeeds
function test_notifyOrderShipped_whenEmailSucceeds_returnsTrue(): void {
  const service = new OrderNotificationService(alwaysSucceedsEmailStub);
  const result  = service.notifyOrderShipped('ORD-123', 'alice@example.com');
  assertEqual(result, true, 'notification returns true when email succeeds');
}

// Test: notification fails when email fails
function test_notifyOrderShipped_whenEmailFails_returnsFalse(): void {
  const service = new OrderNotificationService(alwaysFailsEmailStub);
  const result  = service.notifyOrderShipped('ORD-123', 'alice@example.com');
  assertEqual(result, false, 'notification returns false when email fails');
}
```

**The walkthrough:** `alwaysSucceedsEmailStub` is a plain JavaScript object literal that satisfies the `EmailSender` interface — it has a `sendEmail` method that returns `true`. TypeScript checks at compile time that the object shape matches the interface. The underscore prefix on `_to`, `_subject`, `_body` is a TypeScript convention for unused parameters — it tells the compiler and the reader that the parameter exists to satisfy the interface but is not used.

**The CS lens — a stub controls inputs to the test.** A stub lets the test control what the dependency returns, making it possible to test both success and failure paths without needing a real email server. This is why stubs are the most common test double.

---

### Step 3 — Spy: Recording Without Replacing

A spy wraps the real behavior and records what was called. It lets the test verify that a side effect (calling a function with specific arguments) occurred.

```typescript
class SpyEmailSender implements EmailSender {
  private readonly calls: Array<{ to: string; subject: string; body: string }> = [];

  sendEmail(to: string, subject: string, body: string): boolean {
    this.calls.push({ to, subject, body });
    // In a real spy, this would delegate to the real implementation.
    // Here, for simplicity, we return true and record the call.
    return true;
  }

  getCallCount(): number {
    return this.calls.length;
  }

  getMostRecentCall(): { to: string; subject: string; body: string } | undefined {
    return this.calls[this.calls.length - 1];
  }

  wasCalledWith(to: string): boolean {
    return this.calls.some(call => call.to === to);
  }
}

function test_notifyOrderShipped_sendsToCorrectEmailAddress(): void {
  const spy     = new SpyEmailSender();
  const service = new OrderNotificationService(spy);

  service.notifyOrderShipped('ORD-456', 'bob@example.com');

  assertEqual(spy.getCallCount(), 1, 'email was sent exactly once');
  assertEqual(spy.wasCalledWith('bob@example.com'), true, 'email sent to correct address');
}
```

**The walkthrough:** `SpyEmailSender` records every call in the `calls` array. After calling `notifyOrderShipped`, the test inspects the spy: was `sendEmail` called exactly once? Was it called with `bob@example.com`? The spy answers both questions without the test knowing the actual email server behavior.

**The CS lens — recording interaction.** A spy tests that an interaction happened — "the code called this method with these arguments." This is interaction testing, in contrast to state testing (asserting on the return value). State testing is preferred when possible; interaction testing is needed when the behavior is a side effect (sending an email, writing to a log) that produces no return value the caller can check.

---

### Step 4 — Fake: A Working Simplified Implementation

A fake is a real implementation that is simpler than the production version. An in-memory database is the canonical fake — it works, but stores nothing to disk.

```typescript
class InMemoryEmailSender implements EmailSender {
  private readonly sentEmails: Array<{ to: string; subject: string; body: string }> = [];

  sendEmail(to: string, subject: string, body: string): boolean {
    if (!to.includes('@')) return false;  // basic validation
    this.sentEmails.push({ to, subject, body });
    return true;
  }

  getSentEmailsTo(address: string): Array<{ subject: string; body: string }> {
    return this.sentEmails
      .filter(email => email.to === address)
      .map(({ subject, body }) => ({ subject, body }));
  }
}

function test_notifyOrderShipped_sendsCorrectSubject(): void {
  const fakeEmailSender = new InMemoryEmailSender();
  const service         = new OrderNotificationService(fakeEmailSender);

  service.notifyOrderShipped('ORD-789', 'carol@example.com');

  const received = fakeEmailSender.getSentEmailsTo('carol@example.com');
  assertEqual(received.length, 1, 'one email received');
  assertEqual(
    received[0].subject,
    'Your order ORD-789 has shipped',
    'subject contains order ID'
  );
}
```

**The walkthrough:** `InMemoryEmailSender` stores emails in an array and provides a query method. It includes basic email address validation (a real email sender would validate too). It behaves like a real email sender — it just does not make network calls. The test can inspect the content of the sent email, not just whether it was called.

**The CS lens — fakes as in-process implementations.** A fake runs in the same process as the test with no network calls, no startup time, and no state that persists between tests (unless shared). Fakes are faster than stubs for complex interactions and more realistic than stubs for behavior that depends on prior state.

---

### Step 5 — Mock: Verify Expected Interactions

A mock is a stub that also verifies the expected calls were made. The mock is set up with expectations and then verified at the end of the test.

```typescript
class MockEmailSender implements EmailSender {
  private expectedTo: string | null      = null;
  private expectedSubject: string | null = null;
  private callCount: number              = 0;

  // Set up what the mock expects:
  expectCallWith(to: string, subject: string): this {
    this.expectedTo      = to;
    this.expectedSubject = subject;
    return this;
  }

  sendEmail(to: string, subject: string, _body: string): boolean {
    this.callCount++;
    return true;
  }

  // Verify expectations at the end of the test:
  verify(testName: string): void {
    if (this.callCount === 0) {
      throw new Error(`FAIL: ${testName} — sendEmail was never called`);
    }
    console.log(`PASS: ${testName}`);
  }
}

function test_notifyOrderShipped_callsSendEmail(): void {
  const mockEmail = new MockEmailSender()
    .expectCallWith('dave@example.com', 'Your order ORD-001 has shipped');

  const service = new OrderNotificationService(mockEmail);
  service.notifyOrderShipped('ORD-001', 'dave@example.com');

  mockEmail.verify('notifyOrderShipped calls sendEmail');
}
```

**The CS lens — mocks verify collaboration.** A mock asks "did the system under test collaborate with its dependency in the expected way?" It is the right tool when the interaction itself is the behavior being tested, not just the result.

---

## Connect the Pieces

- **Sinon.js** (JavaScript) and **unittest.mock** (Python) provide stubs, spies, and mocks without the boilerplate shown above. They wrap any object and record calls automatically.
- **When to use each:** Use a stub when you need to control a dependency's output. Use a spy when you need to verify a side effect. Use a fake when the dependency has stateful behavior you need to exercise across multiple calls. Use a mock when you need strict verification that a specific method was called with specific arguments.
- **The test double boundary:** test doubles belong at the same boundary as real implementations. If the production code uses an `EmailSender` interface, the test injects a double through that same interface. Code that cannot accept a test double is code that cannot be unit-tested — which is usually a sign that the DIP (LAB-052) has been violated.

---

## What Breaks Without This

**The slow, fragile test suite:**

Tests that depend on a real email server are slow (network latency), flaky (the server may be down), and expensive (real emails are sent to real addresses on every test run). A test suite that takes 5 minutes to run is not run on every change — it becomes a quarterly event. Bugs accumulate between runs.

Test doubles make the suite run in milliseconds. A suite that runs in milliseconds is run on every save.

---

## Definition of Done

- [ ] `OrderNotificationService` accepts an `EmailSender` via constructor injection
- [ ] Stub tests verify the return value for success and failure paths
- [ ] Spy test verifies `sendEmail` was called with the correct `to` address
- [ ] Fake test verifies the subject line of the sent email
- [ ] You can explain in one sentence when to choose a fake over a mock

**Git commit:**

```
git add src/
git commit -m "LAB-062: Test doubles — stub, spy, fake, and mock for EmailSender; OrderNotificationService tested without real network calls"
```

---

## Quick Check Answers

1. **You replace a real dependency with a test double to make the test fast, deterministic, and isolated.** A real email server is slow (network round-trip), non-deterministic (it might be down), and has side effects (it sends real emails). A test double has none of these problems.
2. **A stub returns canned responses; a mock also verifies that expected calls were made.** A stub is passive — it provides data. A mock is assertive — it fails the test if the expected interaction did not happen.
3. **A fake is appropriate when the dependency has stateful behavior — when the test needs to store something and read it back.** An in-memory repository that supports `save` followed by `findById` is a fake. A mock would need to be set up for every `save` call and every `findById` call separately, which is tedious. A fake handles the stateful interaction naturally.
