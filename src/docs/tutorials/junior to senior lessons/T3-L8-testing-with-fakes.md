# Junior to Senior — T3·L8 — Testing With Fakes

**Prerequisites:** T3·L7 (What NOT to Test). You know when to use test doubles.
This lesson deepens the fake pattern — the most durable and maintainable double type —
and applies it using contract tests that verify the fake matches the real implementation.

**What this lab adds:**
- The contract test pattern: the same tests run against both the fake and the real
- Writing a `FakeContactRepository` that is trustworthy
- Testing the fake itself to prevent drift
- Using fakes to make service tests deterministic and fast
- The trade-off: when fakes become a maintenance burden

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You use a `FakeContactRepository` in 50 unit tests. Later, the real
>    `ContactRepository` changes: `findByEmail` now returns `null` instead of
>    `undefined` for missing contacts. What happens to your 50 unit tests?
> 2. A contact service test uses a fake repository. It passes. An integration test
>    with the real repository fails. Name two possible explanations.
> 3. The fake has a bug: `findByEmail` always returns the first contact regardless
>    of email. All 50 service tests pass. What does this tell you about those tests?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `FakeContactRepository` tested against the same contract as the real repository,
so tests using the fake can be trusted to catch the same bugs as integration tests:

```
$ npx vitest run

✓ ContactRepository contract (InMemoryContactRepository) > saves and retrieves by email
✓ ContactRepository contract (InMemoryContactRepository) > returns undefined for unknown email
✓ ContactRepository contract (InMemoryContactRepository) > returns all saved contacts
✓ ContactRepository contract (InMemoryContactRepository) > assigns unique ids
✓ ContactRepository contract (FakeContactRepository) > saves and retrieves by email
✓ ContactRepository contract (FakeContactRepository) > returns undefined for unknown email
✓ ContactRepository contract (FakeContactRepository) > returns all saved contacts
✓ ContactRepository contract (FakeContactRepository) > assigns unique ids
✓ ContactService with FakeContactRepository > creates a contact and returns success
✓ ContactService with FakeContactRepository > does not save when validation fails

Tests  10 passed (10)
```

The same 4 contract tests run against BOTH implementations. If the fake diverges from
the real, a contract test will fail on the fake — caught before reaching production.

---

### Concept: The Contract Test Pattern

**What it is:** A contract test describes the shared behaviour of an interface —
what any correct implementation must do. The same test function runs against multiple
implementations to verify they all behave identically.

**The problem before (fake that drifts from reality):**

```ts
class FakeContactRepository {
  findByEmail(email: string): Contact | undefined {
    return this.store[0];   // BUG: ignores the email argument — always returns first
  }
}
```

This fake passes all service tests because every test that checks `findByEmail`
expects SOME result — none check that the RIGHT email was returned. Then in production,
the real `findByEmail` returns `undefined` for missing emails — completely different behaviour.

**The solution — contract tests that expose the drift:**

```ts
// A shared test function that runs against any implementation:
function runContactRepositoryContract(
  label:          string,
  makeRepository: () => ContactRepository,
): void {
  describe(`${label} (contract)`, () => {

    it('returns undefined for an email that was never saved', () => {
      const repo  = makeRepository();
      const found = repo.findByEmail('nobody@example.com');
      expect(found).toBeUndefined();   // this would FAIL the buggy fake above
    });

  });
}

// Run against BOTH:
runContactRepositoryContract('InMemoryContactRepository', () => new InMemoryContactRepository());
runContactRepositoryContract('FakeContactRepository',     () => new FakeContactRepository());
```

The fake bug is caught by the contract test.

**What it hides:** The verification gap. Without contract tests, you assume the fake
is correct. With contract tests, you verify it continuously — every time the real
implementation changes, the contract tests ensure the fake keeps up.

**The invariant contract tests protect:** Any code that passes its unit tests using
the fake will also pass integration tests using the real implementation — because
the fake satisfies the same contract.

**Canonical example:** A building code specification. The spec says "the door must
open when the fire alarm sounds." Any door model (fake OR real) must pass this test.
If the prototype (fake) passes but the installed door (real) fails, the contract test
catches it during approval — not during the fire.

**Project Application:** `ContactRepository` has two implementations: the fake (for
tests) and the real (for production). Contract tests ensure they behave identically
for the operations both must support.

**Smallest possible example:**

```ts
function runContract(label: string, make: () => Storage) {
  describe(label, () => {
    it('returns undefined for a missing key', () => {
      expect(make().get('missing')).toBeUndefined();
    });
  });
}

runContract('InMemoryStorage', () => new InMemoryStorage());
runContract('FakeStorage',     () => new FakeStorage());
```

**You will see this again in:**
- Django: `TestCase.databases` — run the same tests against different database backends
- Python `abc.ABC`: abstract base classes define contracts; concrete classes must implement them
- TypeScript: the `ContactRepository` interface IS the contract — contract tests verify it

**Watch for:** Contract tests that are too strict. A contract test for "returns items
in insertion order" would fail on databases that don't guarantee order. Contract tests
should verify the OBSERVABLE CONTRACT — what the interface promises — not arbitrary
implementation details.

---

## Step 1 — Define the Interface and Both Implementations

Add to the `contact-tests` project from T3-L1.

Create `src/contact-repository-interface.ts`:

```ts
export interface Contact {
  id:    string;
  name:  string;
  email: string;
  city:  string;
}

export interface ContactRepository {
  save(contact: Omit<Contact, 'id'>): Contact;
  findByEmail(email: string): Contact | undefined;
  findAll(): Contact[];
}
```

Create `src/fake-contact-repository.ts`:

```ts
import type { Contact, ContactRepository } from './contact-repository-interface';

export class FakeContactRepository implements ContactRepository {
  private readonly store: Contact[] = [];
  private nextId = 1;

  save(contact: Omit<Contact, 'id'>): Contact {
    const stored: Contact = {
      id: `fake-${this.nextId++}`,
      ...contact,
    };
    this.store.push(stored);
    return stored;
  }

  findByEmail(email: string): Contact | undefined {
    return this.store.find(c => c.email === email);
  }

  findAll(): Contact[] {
    return [...this.store];   // copy — callers cannot mutate internal state
  }
}
```

Create `src/real-contact-repository.ts` (simulates the real implementation):

```ts
import type { Contact, ContactRepository } from './contact-repository-interface';

export class InMemoryContactRepository implements ContactRepository {
  private readonly contacts: Contact[] = [];
  private idCounter = 0;

  save(contact: Omit<Contact, 'id'>): Contact {
    const stored: Contact = {
      id: `c-${++this.idCounter}`,
      ...contact,
    };
    this.contacts.push(stored);
    return stored;
  }

  findByEmail(email: string): Contact | undefined {
    return this.contacts.find(c => c.email === email);
  }

  findAll(): Contact[] {
    return [...this.contacts];
  }
}
```

### SAVE AND TRY

```bash
npx tsc --noEmit 2>&1 || echo "type errors"
```

Expected: no type errors — both implementations satisfy the `ContactRepository` interface.

---

## Step 2 — Write the Contract Tests

Create `src/contact-repository.contract.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import type { ContactRepository }       from './contact-repository-interface';
import { FakeContactRepository }        from './fake-contact-repository';
import { InMemoryContactRepository }    from './real-contact-repository';


// ── Shared contract tests ─────────────────────────────────────────────────

function runContactRepositoryContract(
  label:            string,
  makeRepository:   () => ContactRepository,
): void {
  describe(label, () => {

    it('saves a contact and retrieves it by email', () => {
      // Arrange
      const repo    = makeRepository();

      // Act
      const saved = repo.save({ name: 'Alice', email: 'alice@e.com', city: 'London' });
      const found = repo.findByEmail('alice@e.com');

      // Assert
      expect(found).toBeDefined();
      expect(found?.name).toBe('Alice');
      expect(found?.id).toBe(saved.id);
    });

    it('returns undefined for an email that was never saved', () => {
      // Arrange
      const repo = makeRepository();

      // Act
      const found = repo.findByEmail('nobody@example.com');

      // Assert
      expect(found).toBeUndefined();
    });

    it('returns all saved contacts', () => {
      // Arrange
      const repo = makeRepository();
      repo.save({ name: 'Alice', email: 'alice@e.com', city: 'London' });
      repo.save({ name: 'Bob',   email: 'bob@e.com',   city: 'Paris'  });

      // Act
      const all = repo.findAll();

      // Assert
      expect(all).toHaveLength(2);
    });

    it('assigns a unique id to each contact', () => {
      // Arrange
      const repo = makeRepository();

      // Act
      const first  = repo.save({ name: 'Alice', email: 'a@e.com', city: 'London' });
      const second = repo.save({ name: 'Bob',   email: 'b@e.com', city: 'Paris'  });

      // Assert
      expect(first.id).not.toBe(second.id);
    });

    it('does not return a contact saved under a different email', () => {
      // Arrange
      const repo = makeRepository();
      repo.save({ name: 'Alice', email: 'alice@e.com', city: 'London' });

      // Act
      const found = repo.findByEmail('bob@e.com');

      // Assert
      expect(found).toBeUndefined();   // this test would catch the "always returns first" bug
    });

  });
}


// ── Run contract against both implementations ─────────────────────────────

runContactRepositoryContract(
  'ContactRepository contract (InMemoryContactRepository)',
  () => new InMemoryContactRepository(),
);

runContactRepositoryContract(
  'ContactRepository contract (FakeContactRepository)',
  () => new FakeContactRepository(),
);
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
✓ ContactRepository contract (InMemoryContactRepository) > saves and retrieves by email
✓ ContactRepository contract (InMemoryContactRepository) > returns undefined for unknown email
✓ ContactRepository contract (InMemoryContactRepository) > returns all saved contacts
✓ ContactRepository contract (InMemoryContactRepository) > assigns unique ids
✓ ContactRepository contract (InMemoryContactRepository) > does not return wrong contact
✓ ContactRepository contract (FakeContactRepository) > saves and retrieves by email
✓ ContactRepository contract (FakeContactRepository) > returns undefined for unknown email
✓ ContactRepository contract (FakeContactRepository) > returns all saved contacts
✓ ContactRepository contract (FakeContactRepository) > assigns unique ids
✓ ContactRepository contract (FakeContactRepository) > does not return wrong contact

Tests  10 passed (10)
```

**Change something:** Introduce the drift bug in `FakeContactRepository.findByEmail`:

```ts
findByEmail(_email: string): Contact | undefined {
  return this.store[0];   // BUG: always returns the first contact
}
```

Run the tests. Expected: the contract test `'does not return a contact saved under a different email'`
FAILS for the fake — but passes for the real implementation.

```
× ContactRepository contract (FakeContactRepository) > does not return a contact saved under a different email
  AssertionError: expected { id: 'fake-1', name: 'Alice', ... } to be undefined
```

The contract test caught the drift. Restore the correct implementation.

---

## Step 3 — Use the Fake in Service Tests

Create `src/contact-service-with-fake.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { FakeContactRepository }              from './fake-contact-repository';
import { ContactService }                     from './contact-service';

describe('ContactService with FakeContactRepository', () => {
  let repo:    FakeContactRepository;
  let service: ContactService;

  beforeEach(() => {
    // Fresh fake for every test — no state leaks:
    repo    = new FakeContactRepository();
    service = new ContactService(repo, { sendWelcome: (_e) => {} });
  });

  it('creates a contact and returns it with an id', () => {
    // Arrange
    const input = { name: 'Alice', email: 'alice@e.com', city: 'London' };

    // Act
    const result = service.create(input);

    // Assert
    expect(result.success).toBe(true);
    expect(result.contact?.id).toBeDefined();
    expect(result.contact?.name).toBe('Alice');
  });

  it('stores the contact in the repository', () => {
    // Arrange
    const input = { name: 'Alice', email: 'alice@e.com', city: 'London' };

    // Act
    service.create(input);

    // Assert — the fake lets us inspect what was saved:
    const all = repo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].email).toBe('alice@e.com');
  });

  it('does not save when validation fails', () => {
    // Arrange — invalid input (empty name):
    const input = { name: '', email: 'alice@e.com', city: 'London' };

    // Act
    service.create(input);

    // Assert — nothing was saved:
    expect(repo.findAll()).toHaveLength(0);
  });

  it('can create multiple contacts with different ids', () => {
    // Act
    const r1 = service.create({ name: 'Alice', email: 'alice@e.com', city: 'London' });
    const r2 = service.create({ name: 'Bob',   email: 'bob@e.com',   city: 'Paris'  });

    // Assert
    expect(r1.contact?.id).not.toBe(r2.contact?.id);
  });
});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
Tests  14 passed (14)
```

**Notice:** The service tests can inspect `repo.findAll()` — only possible because
the fake maintains real state. A mock would not maintain state; a stub would return
hardcoded data. The fake provides real interaction behaviour.

---

### Concept: When Fakes Become a Burden

**What it is:** A fake is worth maintaining when the real implementation is slow,
unavailable, or has side effects that cannot run in tests. When the real implementation
is already fast and clean, maintaining a fake may cost more than it saves.

**The signals that a fake is becoming a burden:**

```ts
interface ContactRepository {
  save(contact): Contact;
  findByEmail(email): Contact | undefined;
  findAll(): Contact[];
  // ... 6 more methods added over time ...
  countByCity(city: string): number;
  findOverdueContacts(days: number): Contact[];
  bulkUpdate(ids: string[], updates: Partial<Contact>): number;
}
```

Every new method requires updating the fake. As the interface grows, the fake
becomes harder to keep in sync.

**The rule:** A fake is worth maintaining when:
1. The real implementation involves I/O (database, network, file system)
2. The I/O is slow, unreliable, or has real side effects
3. The fake provides meaningful behaviour (not just returns)

A fake is NOT worth maintaining when:
1. The real implementation is already fast (in-memory or SQLite)
2. The interface changes frequently (use integration tests directly)
3. The fake logic is approaching the complexity of the real implementation

**Project Application:** `FakeContactRepository` is fast to create (in-memory),
simple to maintain (4 methods), and used in many tests. It earns its keep.
When the repository grows to 20 methods, reconsider.

**You will see this again in:**
- Large codebases debate fakes vs integration tests for each service boundary
- Testing pyramids vary by team: some use more integration tests, some use more fakes
- The decision is always about cost/benefit — there is no universal rule

---

## 🎯 Challenge: Write a Fake Email Sender

**You know:** The contract test pattern, fakes with state.

**Task:** Build a `FakeEmailSender` that:
- Records all emails sent (so tests can verify them)
- Has a `getSentEmails()` method returning the list
- Has `sentTo(email: string)` returning only emails sent to that address

Then write contract tests that run against both `ConsoleEmailSender` and `FakeEmailSender`.
The contract: "calling `sendWelcome(email)` does not throw."

Write 3 service tests that use `FakeEmailSender`.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// fake-email-sender.ts:
import type { EmailSender } from './email-sender';

export class FakeEmailSender implements EmailSender {
  private readonly sentEmails: string[] = [];

  sendWelcome(email: string): void {
    this.sentEmails.push(email);
  }

  getSentEmails(): string[] {
    return [...this.sentEmails];
  }

  sentTo(email: string): string[] {
    return this.sentEmails.filter(e => e === email);
  }

  clear(): void {
    this.sentEmails.length = 0;
  }
}
```

**Contract tests:**
```ts
function runEmailSenderContract(label: string, make: () => EmailSender) {
  describe(label, () => {
    it('does not throw when sendWelcome is called', () => {
      const sender = make();
      expect(() => sender.sendWelcome('test@example.com')).not.toThrow();
    });
  });
}

runEmailSenderContract('ConsoleEmailSender contract', () => new ConsoleEmailSender());
runEmailSenderContract('FakeEmailSender contract',    () => new FakeEmailSender());
```

**Service tests using `FakeEmailSender`:**
```ts
it('sends a welcome email to the new contact after creation', () => {
  const fakeEmail = new FakeEmailSender();
  const service   = new ContactService(new FakeContactRepository(), fakeEmail);
  service.create({ name: 'Alice', email: 'alice@e.com', city: 'London' });
  expect(fakeEmail.getSentEmails()).toHaveLength(1);
  expect(fakeEmail.getSentEmails()[0]).toBe('alice@e.com');
});

it('does not send email when creation fails', () => {
  const fakeEmail = new FakeEmailSender();
  const service   = new ContactService(new FakeContactRepository(), fakeEmail);
  service.create({ name: '', email: 'alice@e.com', city: 'London' });
  expect(fakeEmail.getSentEmails()).toHaveLength(0);
});

it('sends one email per contact created', () => {
  const fakeEmail = new FakeEmailSender();
  const service   = new ContactService(new FakeContactRepository(), fakeEmail);
  service.create({ name: 'Alice', email: 'alice@e.com', city: 'London' });
  service.create({ name: 'Bob',   email: 'bob@e.com',   city: 'Paris'  });
  expect(fakeEmail.getSentEmails()).toHaveLength(2);
});
```

**Key insight:** `FakeEmailSender` is more useful than a mock for this scenario because
it maintains state across multiple calls — `getSentEmails()` returns ALL emails sent in
the test, not just the last one. The `sentTo(email)` method enables queries like
"were all emails sent to Alice?" which are harder with mocks.

</details>

---

## Final Check

| Concept | What to verify |
|---|---|
| Contract tests run against both | Both labels appear in the test output |
| Fake bug caught by contract | Introduce bug → contract test fails on fake, not real |
| State isolation | `beforeEach` creates fresh fake — no leaks between tests |
| Service tests faster than integration | Compare timings — fake service tests: <5ms |
| Same contract function used twice | One function, two `runContract(...)` calls |

---

## Quick Check Answers

**1. The real repo changes: `findByEmail` returns `null` instead of `undefined`. What happens to the 50 unit tests?**

They continue to pass — because the fake still returns `undefined`. This is the fake drift
problem: the fake no longer matches the real implementation. If service code checks
`if (found)` (both `null` and `undefined` are falsy), the tests still pass and the mismatch
is invisible. If service code checks `if (found === undefined)`, the unit tests pass but
production fails. The contract test for `findByEmail` would catch this if it explicitly
checked for `undefined` vs `null`.

**2. Fake service test passes, real integration test fails. Two possible explanations:**

1. The fake does not accurately implement the repository contract — it returns different data,
   different errors, or behaves differently for edge cases. Contract tests would catch this.

2. The service relies on a behaviour of the real repository that the fake does not model —
   for example, the real repository sorts results by creation date, but the fake returns them
   in insertion order, and the service depends on the order. Contract tests should cover ordering
   if it is part of the contract.

**3. Fake has a bug: `findByEmail` always returns the first contact. All 50 service tests pass. What does this tell you?**

It tells you that none of the 50 service tests verify that the CORRECT contact is returned
for a specific email — they only check that SOME contact is returned. The tests are passing
for the wrong reason. Two fixes: (1) add a contract test for `findByEmail` that would catch
the bug in the fake; (2) add a service test that creates multiple contacts and verifies the
service returns the right one for a specific email.
