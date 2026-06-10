# Junior to Senior — T3·L6 — Test Doubles: Stub, Mock, Fake, Spy

**Prerequisites:** T3·L5 (Unit vs Integration vs E2E). You understand why unit tests
isolate their subjects. This lesson introduces the four types of test double — the
tools that make isolation possible.

**What this lab adds:**
- Why you need test doubles at all
- Stub: a replacement that returns controlled data
- Fake: a simplified working implementation
- Mock: a stub that also records calls
- Spy: wraps a real implementation and records calls
- When to use each type — and when overusing mocks harms tests

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Your service calls `EmailSender.send()`. In a unit test, should you call
>    the real `EmailSender`? Why or why not?
> 2. What is the difference between a stub and a mock?
> 3. A test verifies that `send()` was called with the right email address.
>    Is this testing behaviour or implementation?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `ContactService` tested in complete isolation from the email sender and
repository — using all four double types:

```
✓ ContactService with stub repository > creates contact and returns it
✓ ContactService with stub repository > returns failure when validation fails
✓ ContactService with fake repository > saves contact to in-memory store
✓ ContactService with mock email sender > sends welcome email after creation
✓ ContactService with mock email sender > does not send email when creation fails
✓ ContactService with spy > records the exact email address sent
```

---

### Concept: Why Test Doubles Exist

**What it is:** A test double is a controlled substitute for a real dependency. The
name comes from film — a stunt double looks like the actor but is controlled by the
director. A test double looks like the real dependency but is controlled by the test.

**The problem before (testing with real dependencies):**

```ts
class ContactService {
  create(name: string, email: string): void {
    // Sends a REAL email on every test run:
    EmailSender.send(email, 'Welcome!');

    // Writes to the REAL database on every test run:
    Database.save({ name, email });
  }
}
```

A unit test for `ContactService.create` that uses the real `EmailSender` and `Database`:
- Requires a running mail server
- Requires a running database
- Sends real emails during test runs
- Fails if either is unavailable
- Runs in hundreds of milliseconds instead of 1ms

The test is testing the entire infrastructure stack, not `ContactService`'s logic.

**The solution:**

```ts
// Replace real dependencies with controlled substitutes:
const stubEmailSender = { send: (_email: string) => { /* silent */ } };
const service = new ContactService(stubEmailSender, stubRepository);
// Now the test only exercises ContactService's OWN logic
```

**What it hides:** The infrastructure complexity. A test double hides whether email
servers exist, whether databases are available, whether network calls succeed.
The unit test's job is to verify the logic — not the environment.

**The invariant test doubles protect:** A unit test should only fail when the unit
under test has a bug. Any other reason for failure (database down, email server
unavailable) is an infrastructure problem, not a code problem.

**Canonical example:** A flight simulator. The simulator (test double) behaves like
an aircraft (real dependency) in every way that matters for training the pilot (the
code under test). But no real aircraft is needed, and nothing bad happens if "something
goes wrong" in the simulation.

**You will see this again in:**
- Every professional test suite uses test doubles for external dependencies
- React Testing Library: `jest.fn()` for event handlers, `msw` for HTTP calls
- Python `unittest.mock`: `MagicMock` is Python's test double tool
- Standard interview topic: "When and why would you mock a dependency?"

**Watch for:** Over-mocking. Mocking every single dependency produces tests that test
nothing real — only that the code calls the mocks in a specific order. This is testing
implementation, not behaviour.

---

### Concept: Stub — Controlled Return Values

**What it is:** A stub is a replacement for a dependency that returns controlled,
predetermined values. It does not verify calls — it only controls the data flow.

**When to use:** When your code needs a dependency to return specific values, and
you do not care whether the dependency was called.

```ts
// A stub — always returns the same data, never verifies calls:
const stubRepository: ContactRepository = {
  save: (contact) => ({ id: 'stub-id', ...contact }),  // always returns this
  findByEmail: (_email) => undefined,                   // always "not found"
};
```

**What it hides:** The real dependency's behaviour. A stub makes the test deterministic
by controlling exactly what the dependency returns.

**Canonical example:** A stub is like a cardboard prop on a movie set. It looks like
a door from the front. When the actor (code under test) needs to "open a door," the
prop responds correctly. The actor doesn't care that it's cardboard.

**Project Application:** Test that `ContactService.create` returns the contact data —
without a real database. The stub returns a predictable `{id: 'stub-id', ...}`.

**Smallest possible example:**

```ts
const stubFetch = async (_url: string) => ({
  ok:   true,
  json: async () => ({ users: ['Alice', 'Bob'] }),
});

// Your code calls fetch() — the stub always returns the same fake response
```

**You will see this again in:**
- `jest.fn().mockReturnValue(value)` — a stub in Jest
- Python `MagicMock(return_value=...)` — a stub in Python
- Sinon.js: `sinon.stub(obj, 'method').returns(value)`

**Watch for:** Stubs that are too specific. If a stub returns a perfect response for
every possible input, the test may pass even when the real code would fail for some inputs.
Keep stubs simple and focused on what the test needs.

---

### Concept: Fake — A Working Simplified Implementation

**What it is:** A fake is a simplified but working implementation. Unlike a stub
(which returns hardcoded values), a fake has real logic — it just uses a simpler
mechanism than production.

**When to use:** When multiple tests need a dependency that maintains state across
calls — saving and retrieving records.

```ts
// A fake — working in-memory implementation, no real database:
class FakeContactRepository {
  private readonly store: { id: string; name: string; email: string }[] = [];

  save(contact: { name: string; email: string }) {
    const stored = { id: `fake-${this.store.length}`, ...contact };
    this.store.push(stored);
    return stored;
  }

  findByEmail(email: string) {
    return this.store.find(c => c.email === email);
  }
}
```

**What it hides:** The database. The fake stores data in memory — O(1) operations, no
I/O, completely deterministic. Tests get real save/find behaviour without a real database.

**Canonical example:** A fake is like a training kitchen. It has real equipment and real
food — but smaller quantities and no risk of serving customers. The chef (code) learns
exactly what they'd learn in a real kitchen, without the stakes.

**Project Application:** `FakeContactRepository` used in integration-style unit tests.
A `save` followed by `findByEmail` should return the saved contact — real behaviour.

**You will see this again in:**
- `InMemoryContactRepository` from T3-L8 — a complete fake implementation
- Django's `TestCase` uses a real test database (a fake of production) per test
- React Testing Library wraps real components — the DOM is a fake browser

**Watch for:** A fake that diverges from the real implementation. If the fake stores
contacts in a different order than the database, tests might pass with the fake but
fail in production. Contract tests (T3-L8) catch this drift.

---

### Concept: Mock — Records Calls

**What it is:** A mock is a stub that also records calls. It verifies that a
dependency was called — with what arguments, how many times.

**When to use:** When the key behaviour you are testing is a side effect rather
than a return value. Sending an email, writing to a log, calling an external API.

```ts
// A mock — records calls, lets you verify them:
const mockEmailSender = {
  sendWelcome: vi.fn(),  // vi.fn() creates a Vitest mock function
};

// After calling the service:
expect(mockEmailSender.sendWelcome).toHaveBeenCalledWith('alice@example.com');
expect(mockEmailSender.sendWelcome).toHaveBeenCalledTimes(1);
```

**What it hides:** The side effect. `send()` has no return value to assert on.
The mock records whether it was called and what it was called with — so you can
verify the side effect happened.

**Canonical example:** A mock is like a flight recorder on an airplane. It records
everything that happened. After the test (flight), you inspect the recorder to verify
the right calls (manoeuvres) were made at the right times.

**Project Application:** `mockEmailSender` verifies that `ContactService` sends
a welcome email after creating a contact — and doesn't send one when creation fails.

**You will see this again in:**
- `jest.fn()` and `vi.fn()` — mock functions in Jest and Vitest
- Python `unittest.mock.Mock` — Python's mock implementation
- Any test that verifies a side effect happened (email sent, log written, payment charged)

**Watch for:** Over-mocking. If every test uses mocks to verify every call sequence,
tests become coupled to the implementation. Changing the call order breaks tests —
even if the behaviour is identical.

---

### Concept: Spy — Observes Real Implementations

**What it is:** A spy wraps a real implementation and records calls. Unlike a mock
(which replaces the real implementation), a spy calls through to the real code AND
records what it was called with.

**When to use:** When you want to verify call behaviour while keeping the real
implementation active — typically in integration tests.

```ts
const realEmailSender = {
  sendWelcome(email: string): void {
    console.log(`Sending welcome to ${email}`);  // real implementation runs
  },
};

// Spy wraps the real function — calls it AND records calls:
const sendWelcomeSpy = vi.spyOn(realEmailSender, 'sendWelcome');

// After calling the service:
expect(sendWelcomeSpy).toHaveBeenCalledWith('alice@example.com');
// The real sendWelcome also ran (console.log happened)
```

**What it hides:** The observation mechanism. The spy is transparent to the code
under test — the code calls the real function without knowing it is being watched.

**Canonical example:** A mystery shopper at a restaurant. The shopper (spy) acts like
a real customer — and they are a real customer. But they also observe and record
everything. The restaurant (code) behaves normally; the observation happens invisibly.

**Project Application:** A spy on `console.log` in integration tests to verify
logging happens without replacing the real logging behaviour.

**You will see this again in:**
- `vi.spyOn(object, 'methodName')` in Vitest
- `jest.spyOn(object, 'methodName')` in Jest
- Python `unittest.mock.spy` — similar concept

**Watch for:** Spies that are never restored. After a test, `spy.mockRestore()` removes
the spy and returns the original function. Without restoration, subsequent tests use the
spied version — which may have unexpected side effects.

---

## Step 1 — Build the Service With Dependencies

Add these files to the `contact-tests` project.

Add `src/email-sender.ts`:

```ts
export interface EmailSender {
  sendWelcome(email: string): void;
}

export class ConsoleEmailSender implements EmailSender {
  sendWelcome(email: string): void {
    console.log(`[EMAIL] Sending welcome to ${email}`);
  }
}
```

Update `src/contact-service.ts`:

```ts
import { validateContact }  from './validate-contact';
import type { EmailSender } from './email-sender';

interface ContactRepository {
  save(contact: { name: string; email: string; city: string }): {
    id: string; name: string; email: string; city: string;
  };
  findByEmail(email: string): { id: string } | undefined;
}

interface ServiceResult {
  success: boolean;
  contact?: { id: string; name: string; email: string; city: string };
  errors?: { field: string; message: string }[];
}

export class ContactService {
  constructor(
    private readonly repository: ContactRepository,
    private readonly emailSender: EmailSender,
  ) {}

  create(input: { name: string; email: string; city: string }): ServiceResult {
    const validation = validateContact(input);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const contact = this.repository.save(input);
    this.emailSender.sendWelcome(contact.email);  // side effect
    return { success: true, contact };
  }
}
```

---

## Step 2 — Write Tests Using All Four Double Types

Create `src/contact-service-doubles.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContactService }                         from './contact-service';

// ── STUB TESTS ────────────────────────────────────────────────────────────

describe('ContactService with stub repository', () => {
  const stubRepository = {
    save: (contact: { name: string; email: string; city: string }) =>
      ({ id: 'stub-id', ...contact }),
    findByEmail: (_email: string) => undefined,
  };

  const stubEmailSender = {
    sendWelcome: (_email: string) => { /* silent stub */ },
  };

  it('creates contact and returns it', () => {
    // Arrange
    const service = new ContactService(stubRepository, stubEmailSender);

    // Act
    const result = service.create({ name: 'Alice', email: 'alice@e.com', city: 'London' });

    // Assert — check return value only:
    expect(result.success).toBe(true);
    expect(result.contact?.name).toBe('Alice');
    expect(result.contact?.id).toBe('stub-id');
  });

  it('returns failure when validation fails', () => {
    // Arrange
    const service = new ContactService(stubRepository, stubEmailSender);

    // Act
    const result = service.create({ name: '', email: 'alice@e.com', city: 'London' });

    // Assert
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });
});

// ── FAKE TESTS ────────────────────────────────────────────────────────────

describe('ContactService with fake repository', () => {
  class FakeRepository {
    private readonly store: { id: string; name: string; email: string; city: string }[] = [];

    save(contact: { name: string; email: string; city: string }) {
      const stored = { id: `fake-${this.store.length + 1}`, ...contact };
      this.store.push(stored);
      return stored;
    }

    findByEmail(email: string) {
      return this.store.find(c => c.email === email);
    }

    getAll() { return [...this.store]; }
  }

  const silentEmailSender = { sendWelcome: (_e: string) => {} };

  it('saves contact to in-memory store', () => {
    // Arrange
    const fakeRepo = new FakeRepository();
    const service  = new ContactService(fakeRepo, silentEmailSender);

    // Act
    service.create({ name: 'Alice', email: 'alice@e.com', city: 'London' });

    // Assert — fake has state, we can verify it:
    expect(fakeRepo.getAll()).toHaveLength(1);
    expect(fakeRepo.getAll()[0].name).toBe('Alice');
  });
});

// ── MOCK TESTS ────────────────────────────────────────────────────────────

describe('ContactService with mock email sender', () => {
  const stubRepository = {
    save: (c: { name: string; email: string; city: string }) => ({ id: 'id', ...c }),
    findByEmail: (_: string) => undefined,
  };

  it('sends welcome email after creation', () => {
    // Arrange — mock records calls:
    const mockEmailSender = { sendWelcome: vi.fn() };
    const service         = new ContactService(stubRepository, mockEmailSender);

    // Act
    service.create({ name: 'Alice', email: 'alice@e.com', city: 'London' });

    // Assert — verify the side effect:
    expect(mockEmailSender.sendWelcome).toHaveBeenCalledWith('alice@e.com');
    expect(mockEmailSender.sendWelcome).toHaveBeenCalledTimes(1);
  });

  it('does not send email when creation fails validation', () => {
    // Arrange
    const mockEmailSender = { sendWelcome: vi.fn() };
    const service         = new ContactService(stubRepository, mockEmailSender);

    // Act — invalid input:
    service.create({ name: '', email: 'alice@e.com', city: 'London' });

    // Assert — email must NOT have been sent:
    expect(mockEmailSender.sendWelcome).not.toHaveBeenCalled();
  });
});

// ── SPY TESTS ─────────────────────────────────────────────────────────────

describe('ContactService with spy', () => {
  const stubRepository = {
    save: (c: { name: string; email: string; city: string }) => ({ id: 'id', ...c }),
    findByEmail: (_: string) => undefined,
  };

  it('records the exact email address sent', () => {
    // Arrange — real object, spy wraps it:
    const realEmailSender = {
      sendWelcome(email: string): void { /* real logic runs */ }
    };
    const spy     = vi.spyOn(realEmailSender, 'sendWelcome');
    const service = new ContactService(stubRepository, realEmailSender);

    // Act
    service.create({ name: 'Alice', email: 'alice@e.com', city: 'London' });

    // Assert — real function ran AND was called with right arg:
    expect(spy).toHaveBeenCalledWith('alice@e.com');
    spy.mockRestore();   // ← always restore spies to prevent test pollution
  });
});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
✓ ContactService with stub repository > creates contact and returns it
✓ ContactService with stub repository > returns failure when validation fails
✓ ContactService with fake repository > saves contact to in-memory store
✓ ContactService with mock email sender > sends welcome email after creation
✓ ContactService with mock email sender > does not send email when creation fails
✓ ContactService with spy > records the exact email address sent

Tests  6 passed (6)
```

**Change something:** Remove the `this.emailSender.sendWelcome(contact.email)` call
from `ContactService`. Run the tests. Expected: the mock and spy tests fail —
they verify the call was made. The stub and fake tests still pass — they don't
verify calls.

This demonstrates the difference: stub/fake tests break when OUTPUT changes;
mock/spy tests break when CALL BEHAVIOUR changes.

Restore the `sendWelcome` call.

---

## 🎯 Challenge: Write a Service With Doubles

**You know:** All four double types and when to use each.

**Task:** A `NotificationService` has this interface:

```ts
interface Logger {
  log(message: string): void;
}

interface PushClient {
  send(userId: string, title: string, body: string): Promise<void>;
}

class NotificationService {
  constructor(
    private readonly logger: Logger,
    private readonly pushClient: PushClient,
  ) {}

  async notify(userId: string, message: string): Promise<void> {
    if (!userId.trim()) throw new Error('userId is required');
    if (!message.trim()) throw new Error('message is required');

    this.logger.log(`Sending to ${userId}: ${message}`);
    await this.pushClient.send(userId, 'New message', message);
  }
}
```

Write tests using:
1. A stub `Logger` that discards logs
2. A mock `PushClient` that verifies it was called with the right arguments
3. A test that verifies `pushClient.send` is NOT called when `userId` is empty

Try for at least 15 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
import { describe, it, expect, vi } from 'vitest';

interface Logger     { log(message: string): void }
interface PushClient { send(userId: string, title: string, body: string): Promise<void> }

class NotificationService {
  constructor(
    private readonly logger:     Logger,
    private readonly pushClient: PushClient,
  ) {}

  async notify(userId: string, message: string): Promise<void> {
    if (!userId.trim())   throw new Error('userId is required');
    if (!message.trim())  throw new Error('message is required');
    this.logger.log(`Sending to ${userId}: ${message}`);
    await this.pushClient.send(userId, 'New message', message);
  }
}

// Stub logger — discards all logs:
const stubLogger: Logger = { log: (_msg) => {} };

describe('NotificationService', () => {

  it('sends a push notification to the correct user', async () => {
    // Arrange — mock PushClient records calls:
    const mockPush: PushClient = { send: vi.fn().mockResolvedValue(undefined) };
    const service = new NotificationService(stubLogger, mockPush);

    // Act
    await service.notify('user-123', 'Hello!');

    // Assert — correct arguments:
    expect(mockPush.send).toHaveBeenCalledWith('user-123', 'New message', 'Hello!');
  });

  it('sends exactly once per notification', async () => {
    const mockPush: PushClient = { send: vi.fn().mockResolvedValue(undefined) };
    const service = new NotificationService(stubLogger, mockPush);
    await service.notify('user-123', 'Hello!');
    expect(mockPush.send).toHaveBeenCalledTimes(1);
  });

  it('throws when userId is empty', async () => {
    const mockPush: PushClient = { send: vi.fn().mockResolvedValue(undefined) };
    const service = new NotificationService(stubLogger, mockPush);
    await expect(service.notify('', 'Hello!')).rejects.toThrow('userId is required');

    // The push was NOT called — the error stopped execution:
    expect(mockPush.send).not.toHaveBeenCalled();
  });

});
```

**Key insights:**

1. `stubLogger` is a stub — discards logs, never verified.
2. `mockPush` is a mock — `vi.fn()` records calls; `mockResolvedValue(undefined)` makes it return a resolved Promise.
3. The third test verifies BOTH that the exception is thrown AND that no push was sent —
   two outcomes of the same guard clause.

</details>

---

## Final Check

| Double type | What it does | Verify calls? |
|---|---|---|
| Stub | Returns controlled values | No |
| Fake | Working simplified implementation | Via state inspection |
| Mock | Records calls + returns controlled values | Yes |
| Spy | Wraps real implementation + records calls | Yes, real code also runs |

---

## Quick Check Answers

**1. Should a unit test call the real `EmailSender`?**

No. Calling the real `EmailSender` in a unit test sends real emails during every
test run, requires a mail server to be available, and makes the test slow and
non-deterministic (network might be down). The unit test's job is to test the
logic of the service — whether it calls `sendWelcome` at the right time with the
right argument. A stub or mock `EmailSender` verifies this without the side effects.

**2. Difference between a stub and a mock?**

A stub controls what a dependency returns. A mock controls what a dependency
returns AND records calls (so you can assert it was called, with what arguments,
how many times). A stub is for controlling data flow; a mock is for verifying
side-effect behaviour.

**3. Verifying that `send()` was called with the right email — testing behaviour or implementation?**

Both, with nuance. For a side-effect-only function like sending email (no return
value to assert on), asserting the call is the ONLY way to test the behaviour.
The behaviour IS "an email is sent" — which can only be observed by checking whether
`send()` was called. However, asserting the internal call sequence ("first save,
then send, then log") is testing implementation — if the order changes but the
email still gets sent, the test should not care.
