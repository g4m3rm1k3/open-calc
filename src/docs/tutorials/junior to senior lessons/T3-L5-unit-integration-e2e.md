# Junior to Senior — T3·L5 — Unit vs Integration vs End-to-End Tests

**Prerequisites:** T3·L4 (Test Naming). You can write well-named tests. This lesson
covers the three types of tests — what each verifies, what each costs, and the
pyramid that explains why you write many of one type and few of another.

**What this lab adds:**
- Unit tests: one function or class; no real infrastructure; fast; isolated
- Integration tests: two or more real components together; slower; catches wiring bugs
- End-to-end tests: the full system from outside; slowest; highest confidence; most fragile
- The test pyramid: why many units, fewer integrations, fewest E2E
- Contract tests: verifying that a fake behaves the same as the real thing

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A unit test for `validateEmail` passes. An E2E test for the sign-up form
>    fails. What is the most likely explanation?
> 2. You have 100 unit tests and 1 integration test that requires a real database.
>    The database is down. How many tests can you run?
> 3. An E2E test verifies the sign-up flow takes less than 3 seconds. It then
>    fails intermittently — sometimes 2.9s, sometimes 3.1s. What is wrong?
>
> *(Answers at the end of this lab)*

---

## The Test Pyramid

```
         /\
        /  \
       / E2E\           Few — slow, expensive, fragile
      /------\
     /        \
    / Integr.  \        Some — medium speed, medium complexity
   /------------\
  /              \
 /   Unit Tests   \     Many — fast, isolated, cheap to write
/------------------\
```

The pyramid shape is intentional. Unit tests are cheap: fast to write, fast to run,
easy to diagnose. E2E tests are expensive: slow, fragile to unrelated changes, hard
to debug. The pyramid says: write many unit tests, some integration tests, few E2E tests.

An inverted pyramid (many E2E, few units) produces a test suite that is slow,
brittle, and expensive to maintain.

---

### Concept: Unit Tests — Isolated, Fast, Focused

**What it is:** A unit test exercises ONE function or class in isolation. All
dependencies are replaced with controlled substitutes (fakes or mocks). No network,
no filesystem, no database.

**The problem before (calling real dependencies):**

```ts
// Without isolation — tests run slowly and require infrastructure:
it('creates a contact', async () => {
  const db      = await connectToDatabase();    // SLOW: real DB connection
  const result  = await createContact(db, { name: 'Alice', email: 'alice@e.com' });
  // If the DB is down → test fails (but the code is fine)
  expect(result.id).toBeDefined();
});
```

**The solution:**

```ts
// With isolation — fast, no infrastructure needed:
it('validates a contact with valid data', () => {
  const result = validateContact({ name: 'Alice', email: 'alice@e.com', city: 'London' });
  // No DB, no network, no filesystem — runs in <1ms
  expect(result.valid).toBe(true);
});
```

**What it hides:** Infrastructure complexity. A unit test hides the entire infrastructure
stack — the test only interacts with the function's interface.

The invariant a unit test protects: "this function's logic is correct for these inputs."

**Canonical example:** Testing a car engine on a test bench. Not in the car, not on a
road — just the engine. Isolates the engine's behaviour from whether the road is wet,
whether the tyres are flat, or whether the fuel pump works.

**Project Application:** `validateContact` is a pure function — no dependencies. Every
test for it is a unit test. Fast, isolated, tells you exactly which rule is broken.

**Smallest possible example:**

```ts
// Pure function test — no dependencies to fake:
it('add returns the sum of two numbers', () => {
  expect(add(2, 3)).toBe(5);   // runs in <1ms, always works regardless of environment
});
```

**You will see this again in:**
- Every TDD practitioner writes mostly unit tests
- React Testing Library tests are unit/component tests — no real server
- pytest unit tests are the same concept in Python

**Watch for:** "Unit" does not mean "one line." A unit is one conceptual thing —
a function, a class, a module. A unit test can have many assertions if they all
test the same unit's behaviour.

---

### Concept: Integration Tests — Testing the Connections

**What it is:** An integration test exercises TWO OR MORE real components together.
Typically: a service + its real dependency (a real database, real file system, real
HTTP client). It verifies that the components connect correctly.

**The problem unit tests miss:**

```ts
// validateContact passes all unit tests
// ContactRepository.save() passes all unit tests
// But:

// Unit tests don't catch this bug:
async function createContact(data) {
  const validation = validateContact(data);
  if (!validation.valid) throw new Error(validation.errors[0].message);

  // BUG: wrong field name — should be 'email', not 'emailAddress'
  await repository.save({ name: data.name, emailAddress: data.email });
  //                                        ^^^^^^^^^^^^^ wrong!
}
// The unit tests for validateContact and repository.save() both pass.
// Only an integration test catches the wiring bug.
```

**The solution:**

```ts
// Integration test — uses real repository:
it('saves a contact and retrieves it by email', async () => {
  const repo = new ContactRepository(testDatabase);   // real database
  await repo.save({ name: 'Alice', email: 'alice@e.com', city: 'London' });
  const found = await repo.findByEmail('alice@e.com');
  expect(found?.name).toBe('Alice');   // catches the wiring bug
});
```

**What it hides:** The connection complexity. Integration tests verify that the handoff
between components is correct — that what one component produces, the next component
accepts.

**Canonical example:** Testing a car engine AND transmission together on a test bench.
Not the full car — but the connection between these two systems. Verifies the engine's
output shaft connects correctly to the transmission's input.

**Project Application:** The contacts API has: validation (unit-testable) + repository
(unit-testable) + the connection between them (integration-testable). The integration
test uses a real in-memory database.

**You will see this again in:**
- API tests with test databases (covered in T5-L8)
- React component tests that render with real child components
- pytest integration tests that use test databases (SQLite in-memory)

**Watch for:** Integration tests are slower than unit tests. A suite with 1,000
integration tests takes minutes to run. Keep integration test count lower than unit
test count (the pyramid shape).

---

### Concept: End-to-End Tests — The Full System

**What it is:** An E2E test drives the full system from outside — typically through
a browser or an HTTP client. It verifies a complete user flow.

**The problem with only unit and integration tests:**

```
Unit tests pass. ✓
Integration tests pass. ✓
But: the API endpoint sends the wrong HTTP status code.
    The frontend calls the wrong URL path.
    The authentication token expires before the test completes.
```

These are system-level problems that only E2E tests catch.

**What E2E tests verify:**

```ts
// E2E test — HTTP client, real server, real database:
it('creates a contact via the API and retrieves it', async () => {
  // Full stack: HTTP → route handler → validation → repository → database → response
  const createResponse = await fetch(`${BASE_URL}/contacts`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ name: 'Alice', email: 'alice@e.com', city: 'London' }),
  });
  expect(createResponse.status).toBe(201);

  const body  = await createResponse.json();
  const getR  = await fetch(`${BASE_URL}/contacts/${body.id}`);
  expect(getR.status).toBe(200);
  const found = await getR.json();
  expect(found.name).toBe('Alice');
});
```

**The cost:**
- Requires a running application, database, and possibly a browser
- Runs in seconds to minutes — not milliseconds
- Breaks when UI changes, test data changes, or timing issues arise
- Debugging failures requires reproducing the full environment

**Canonical example:** A test driver who takes a car on an actual road. Full system,
real conditions. Catches problems that the bench tests missed. But a road test is
expensive — you can't run 1,000 road tests per build.

**Project Application:** Write E2E tests for the most critical contact creation and
retrieval flows. Not for every edge case — unit tests cover those faster.

**You will see this again in:**
- Playwright, Cypress: browser-based E2E test frameworks
- Supertest: HTTP E2E testing for Node.js APIs
- FastAPI with `httpx.AsyncClient`: E2E testing covered in T5-L8

**Watch for:** E2E tests that test timing. `expect(response.elapsed < 500ms)` fails
intermittently because latency varies. E2E tests should assert on correctness (status
codes, response content), not performance.

---

## Step 1 — Build All Three Test Types

This step shows all three test types for the same contact domain.

Add `src/contact-repository.ts` to the contacts project:

```ts
export interface StoredContact {
  id:    string;
  name:  string;
  email: string;
  city:  string;
}

export class InMemoryContactRepository {
  private readonly contacts: StoredContact[] = [];

  save(contact: Omit<StoredContact, 'id'>): StoredContact {
    const stored = { id: `c-${this.contacts.length + 1}`, ...contact };
    this.contacts.push(stored);
    return stored;
  }

  findByEmail(email: string): StoredContact | undefined {
    return this.contacts.find(c => c.email === email);
  }

  findAll(): StoredContact[] {
    return [...this.contacts];
  }
}
```

Add `src/contact-service.ts`:

```ts
import { validateContact }            from './validate-contact';
import { InMemoryContactRepository }  from './contact-repository';

export class ContactService {
  constructor(private readonly repository: InMemoryContactRepository) {}

  create(input: { name: string; email: string; city: string }): {
    success: boolean;
    contact?: { id: string; name: string; email: string; city: string };
    errors?: { field: string; message: string }[];
  } {
    const validation = validateContact(input);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const contact = this.repository.save(input);
    return { success: true, contact };
  }
}
```

Create `src/contact-service.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { validateContact }                    from './validate-contact';
import { InMemoryContactRepository }          from './contact-repository';
import { ContactService }                     from './contact-service';

// ── UNIT TESTS ────────────────────────────────────────────────────────────

describe('validateContact (unit)', () => {

  it('returns valid for a complete contact', () => {
    const result = validateContact({ name: 'Alice', email: 'alice@e.com', city: 'London' });
    expect(result.valid).toBe(true);
  });

  it('returns invalid when name is empty', () => {
    const result = validateContact({ name: '', email: 'alice@e.com', city: 'London' });
    expect(result.valid).toBe(false);
  });

});

// ── INTEGRATION TESTS ─────────────────────────────────────────────────────

describe('ContactService with InMemoryContactRepository (integration)', () => {
  let service: ContactService;

  beforeEach(() => {
    // Fresh repository for each test — no state leaks:
    const repository = new InMemoryContactRepository();
    service = new ContactService(repository);
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

  it('returns success false with errors when name is empty', () => {
    // Arrange
    const input = { name: '', email: 'alice@e.com', city: 'London' };

    // Act
    const result = service.create(input);

    // Assert
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('does not save the contact when validation fails', () => {
    // Arrange
    const freshRepo = new InMemoryContactRepository();
    const freshService = new ContactService(freshRepo);

    // Act — invalid contact:
    freshService.create({ name: '', email: 'alice@e.com', city: 'London' });

    // Assert — nothing was saved:
    expect(freshRepo.findAll()).toHaveLength(0);
  });

});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
✓ validateContact (unit) > returns valid for a complete contact
✓ validateContact (unit) > returns invalid when name is empty
✓ ContactService with InMemoryContactRepository (integration) > creates a contact...
✓ ContactService with InMemoryContactRepository (integration) > returns success false...
✓ ContactService with InMemoryContactRepository (integration) > does not save the contact...

Tests  5 passed (5)
```

**Notice the difference:** Unit tests call `validateContact` directly. Integration tests
use `ContactService` with a real `InMemoryContactRepository`. Both the service and the
repository execute — the connection between them is verified.

**Change something:** In `contact-service.ts`, save the contact with a wrong field name:

```ts
const contact = this.repository.save({ name: input.name, email: 'WRONG', city: input.city });
```

Run the tests. The unit tests still pass (they only test validation). The integration
test `'creates a contact and returns it with an id'` still passes (the id is still returned).
But the `findByEmail` integration test (if you added one) would fail. This shows that
integration tests catch wiring bugs that unit tests miss. Restore the correct code.

---

## Step 2 — The Speed Comparison

Add timing output to see the difference:

```bash
npm run test:watch -- --reporter=verbose
```

**You should see:** Unit tests in `<1ms` each. The integration tests in `<5ms`.
In a real project, integration tests with real databases take `10–100ms` each — the
difference from unit tests becomes significant at scale.

---

## 🎯 Challenge: Identify the Test Type

**You know:** Unit, integration, E2E — what each verifies and costs.

**Task:** For each of the following tests, identify the type (unit / integration / E2E)
and explain why. Then identify one thing each test does NOT verify.

```ts
// Test A:
it('formats a date as DD/MM/YYYY', () => {
  expect(formatDate(new Date('2024-01-15'))).toBe('15/01/2024');
});

// Test B:
it('saves a user to the database', async () => {
  const db = await createTestDatabase();
  const repo = new UserRepository(db);
  await repo.save({ username: 'alice', email: 'alice@e.com' });
  const found = await db.query('SELECT * FROM users WHERE username = ?', ['alice']);
  expect(found.rows).toHaveLength(1);
});

// Test C:
it('logs in and sees the dashboard', async () => {
  await page.goto('http://localhost:3000/login');
  await page.fill('#username', 'alice');
  await page.fill('#password', 'secret');
  await page.click('button[type=submit]');
  await expect(page.locator('h1')).toHaveText('Dashboard');
});
```

---

<details>
<summary>▶ Show Solution</summary>

**Test A — Unit test**

Why: `formatDate` takes a `Date` object and returns a string. No I/O. No dependencies.
The entire test is a function call and an assertion on its return value.

Does NOT verify: that the formatted date is correctly used anywhere in the application.
A component could call `formatDate` with the wrong field, but this test would still pass.

**Test B — Integration test**

Why: It creates a real test database, uses a real `UserRepository`, and queries the
database directly. Two components (repository + database) interact through real I/O.

Does NOT verify: that the `UserRepository` is called correctly from the service layer.
The service could have a bug that passes the wrong data to `repo.save()` — this test
would still pass.

**Test C — End-to-end test**

Why: It drives a browser through a real login flow, interacting with a real running
application. Full stack: UI → HTTP → service → database.

Does NOT verify: what happens when the login fails. This test only covers the happy path.
A unit test for `validateCredentials` would cover error cases faster and more precisely.

</details>

---

## Final Check

| Test type | Setup needed | Typical speed | What it verifies |
|---|---|---|---|
| Unit | None | < 1ms | One function's logic |
| Integration | Database / server | 10–100ms | Components connect correctly |
| E2E | Full running app | 100ms–minutes | User flows work end to end |

---

## Quick Check Answers

**1. Unit test passes, E2E sign-up test fails — most likely explanation?**

The validation logic itself is correct (unit test confirms this), but something in
the wiring is broken: the HTTP route handler may call the wrong service method, the
service may not pass all fields to the repository, the response may be missing a
required field, or the validation errors may be formatted differently in the HTTP
response than the UI expects. Unit tests cannot catch wiring bugs — only integration
or E2E tests can.

**2. 100 unit tests, 1 integration test that needs a real database — database is down, how many can you run?**

100. Unit tests have no external dependencies — they run regardless of database
availability, network state, or any infrastructure. This is the key practical
advantage of unit tests: they always run. An integration test suite that requires
a database silently fails to run when the database is unavailable — masking coverage gaps.

**3. E2E test checks response time ≤ 3s but fails intermittently — what is wrong?**

The test is asserting on timing, which is non-deterministic. Network latency, CPU load,
garbage collection, and other factors mean the same request can take 2.9s or 3.1s
on identical hardware on consecutive runs. Tests that use timing thresholds are
inherently flaky. E2E tests should assert on correctness (status codes, response content,
UI state), not performance. Use dedicated performance testing tools (k6, Lighthouse) for
timing assertions.
