# Junior to Senior — T3·L7 — What NOT to Test

**Prerequisites:** T3·L6 (Test Doubles). You can isolate units with doubles.
This lesson is the counterweight: knowing what to leave untested prevents test
suites that are expensive to maintain and give false confidence.

**What this lab adds:**
- Testing behaviour, not implementation
- What private methods are for and why you do not test them directly
- Testing third-party libraries — why you do not and what you do instead
- The fragile test: a test that breaks for the wrong reason
- The ROI question: is the cost of this test justified by what it catches?

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A test imports and calls `parseEmailDomain` — a private helper used only
>    by `validateEmail`. `validateEmail` is already tested. Should `parseEmailDomain`
>    have its own tests?
> 2. You test that `express` returns 404 for unknown routes. What are you testing?
> 3. You refactor `calculateDiscount` to use a lookup table instead of `if/else`.
>    The behaviour is identical. Which tests break?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Not a new test suite — this lesson focuses on identifying bad tests in an existing
suite and understanding why removing or rewriting them makes the suite stronger.

---

### Concept: Test ROI — Does This Test Earn Its Keep?

**What it is:** Every test has a cost: time to write, time to run, time to update
when things change. A test is worth writing when its benefit (catching a real bug
before production) exceeds its cost.

**The three categories of tests:**

1. **High ROI:** Catches real bugs, rarely breaks on refactoring, describes
   important behaviour. KEEP.
2. **Low ROI:** Tests something trivially correct or tests framework behaviour.
   DELETE or never write.
3. **Negative ROI:** Breaks on refactoring without any code being wrong,
   creating noise that masks real failures. DELETE.

**Canonical example:** A smoke alarm vs a burglar alarm tuned to the sound of
leaves. The smoke alarm is high ROI — catches real, dangerous events. The
leaf-triggered burglar alarm is negative ROI — fires constantly for harmless events
and trains you to ignore ALL alarms.

**Project Application:** The contacts validation tests check real business rules.
Removing them would let real bugs through. Tests for how `express` handles unknown
routes check the framework — removing them costs nothing and saves maintenance time.

**You will see this again in:**
- Code review: "this test is testing the ORM, not our code"
- Team discussions: "why are we spending an hour fixing 50 broken tests after a variable rename?"
- Technical debt: a large suite of fragile tests slows the entire team

---

### Concept: Test Behaviour, Not Implementation

**What it is:** Tests should verify what a function does (observable output for given input) —
not how it does it internally.

**The problem before (testing implementation):**

```ts
// Implementation:
function calculateDiscount(total: number): number {
  if (total >= 200) return total * 0.2;
  if (total >= 100) return total * 0.1;
  return 0;
}

// Test that tests implementation — not behaviour:
// (Hypothetically, if you could inspect the internal branches):
it('uses the 200-tier branch for cart of 250', () => {
  // Tests which IF branch was taken — not what was returned
  // This test breaks when you switch to a lookup table, even though
  // calculateDiscount(250) still returns 50.
});
```

**The solution — test the output:**

```ts
// Test that tests behaviour:
it('applies 20% discount for a cart of 250', () => {
  expect(calculateDiscount(250)).toBe(50);  // only cares about output
});
```

**What it hides:** The implementation details. A behaviour test does not care whether
the implementation uses `if/else`, a `switch`, a lookup table, or recursion. Any
implementation that produces the right output passes the test.

**The refactoring test:**

After refactoring `calculateDiscount` to use a lookup table:

```ts
const TIERS = [
  { min: 200, rate: 0.2 },
  { min: 100, rate: 0.1 },
];

function calculateDiscount(total: number): number {
  return (TIERS.find(t => total >= t.min)?.rate ?? 0) * total;
}
```

Behaviour-based tests: all pass. The output is identical.
Implementation-coupled tests: would break because the `if/else` is gone — even though
no behaviour changed.

**The rule:** If a test breaks during a refactoring that did not change observable
behaviour, the test was testing implementation. Delete or rewrite it.

**Canonical example:** Testing a lamp. Behaviour test: "when you flip the switch, the
light turns on." Implementation test: "the switch activates relay R14 on circuit board B."
Replace the relay with a transistor — behaviour test still passes; implementation test fails.

**Project Application:** After adding `const DISCOUNT_TIER_2_THRESHOLD = 200` in T3-L3,
all five tests still passed. They tested the output, not the variable names inside the function.

**You will see this again in:**
- Refactoring sessions: "all the behaviour tests still pass after the big restructure"
- Code review: "this test is asserting on the internal method call order"
- Maintainability: behaviour tests allow internal freedom; implementation tests lock you in

**Watch for:** Tests that check HOW the code does something rather than WHAT it produces.
Signs: tests that mock internal functions, tests that check internal variable values,
tests that assert a specific number of internal function calls.

---

### Concept: Do Not Test Private Methods

**What it is:** A private method exists to help the public method do its job. It has
no independent contract. Test the public method thoroughly — the private method gets
tested implicitly through every test that exercises the public API.

**The problem before:**

```ts
class ContactValidator {
  validate(contact: { name: string; email: string }): boolean {
    return this._isNameValid(contact.name) && this._isEmailValid(contact.email);
  }

  // Private helpers — only used by validate():
  private _isNameValid(name: string): boolean {
    return name.trim().length > 0;
  }

  private _isEmailValid(email: string): boolean {
    return email.includes('@') && email.includes('.');
  }
}
```

To test `_isNameValid` directly, you'd need to:
- Make it public (breaking encapsulation)
- Use TypeScript casting `(validator as any)._isNameValid(...)` (fragile)

**The problem with testing private methods:**

The contract is `validate()`. Whether `_isNameValid` and `_isEmailValid` are private
methods, inlined logic, or extracted to a utility module — that is an implementation
choice. Tests must not depend on it.

**The solution:**

```ts
// Test the public contract — the private methods get tested through it:
describe('ContactValidator', () => {
  const validator = new ContactValidator();

  it('returns false for an empty name', () => {
    expect(validator.validate({ name: '', email: 'a@b.com' })).toBe(false);
  });

  it('returns false for an email with no @', () => {
    expect(validator.validate({ name: 'Alice', email: 'notanemail' })).toBe(false);
  });
});
```

Every input that exercises `_isNameValid` or `_isEmailValid` is passed through `validate()`.
The private methods get full coverage through the public interface.

**What it hides:** The internal structure. When you test through the public interface,
you can freely change the internal structure (split a method, rename a private function,
inline a helper) without touching a single test.

**Canonical example:** Testing a car. You test from the driver's seat — pedals, steering,
instruments. You do not reach into the engine compartment and manually activate the
fuel injectors. The output (acceleration, braking) is what matters; the mechanism is private.

**Project Application:** `validateContact` calls internal logic for name, email, and city.
The tests for `validateContact` exercise all three pieces of logic — no direct tests of
the internal helpers are needed.

**You will see this again in:**
- "If you find yourself wanting to test a private method, it's a sign" — Martin Fowler
- Code review: "why is this method public if it's only called internally?"
- Refactoring: moving private logic to a separate module — no tests need updating

**Watch for:** If you MUST test a private method, it is a signal that the method
should become its own exported function with its own contract. A private method that
is complex enough to warrant independent tests is complex enough to deserve its own
module.

---

### Concept: Do Not Test Third-Party Libraries

**What it is:** You should not write tests that verify a third-party library works
correctly. That is the library author's responsibility.

**The problem before:**

```ts
// Testing that Array.sort works — not your responsibility:
it('sorts numbers correctly', () => {
  const arr = [3, 1, 2];
  arr.sort((a, b) => a - b);
  expect(arr).toEqual([1, 2, 3]);
});

// Testing that express returns JSON with the right Content-Type header:
it('sets Content-Type to application/json', async () => {
  // express always does this when you call res.json() — you don't need to test it
});
```

These tests:
- Fail when the library upgrades and changes minor behaviour
- Add maintenance cost without catching your bugs
- Give false confidence (they're testing someone else's code)

**What to test instead:**

```ts
// Test YOUR code's use of the library — not the library itself:
it('returns undefined when no contact matches the email', async () => {
  const repo  = new ContactRepository(testDb);
  const found = await repo.findByEmail('nobody@example.com');
  expect(found).toBeUndefined();   // tests YOUR repository, not the database
});
```

**The distinction:** `testDb.findOne()` is the library. `repo.findByEmail()` is yours.
Test `findByEmail`'s behaviour — not `findOne`'s.

**What it hides:** The false sense of security. Testing that `Array.sort` works gives
you 100% confidence that `Array.sort` works — which you already had for free, because
it's a standard library tested by millions of people.

**Canonical example:** You don't test that your hammer drives nails correctly. You test
whether your carpentry (your code) produces the right result. The hammer (library) is trusted.

**Project Application:** Vitest itself is not tested. The `expect().toBe()` assertion
chain is not tested. Only the validation logic that you wrote is tested.

**You will see this again in:**
- Senior developers remove tests for framework behaviour during code reviews
- Well-maintained codebases have a clear boundary: "we test our logic, not our dependencies"
- When a library changes version, tests for library behaviour break; tests for your code survive

**Watch for:** The boundary between "testing the library" and "testing your use of the library."
`session.get(TaskModel, 99)` is the SQLAlchemy library. `repo.findById(99)` is your code.
Test `repo.findById` — not `session.get`.

---

### Concept: The Fragile Test

**What it is:** A fragile test breaks frequently for reasons that are not bugs.
Common causes: testing internal call order, testing log messages, testing timestamps,
or using snapshot tests for deeply nested objects.

**Common fragile test patterns:**

```ts
// Fragile 1 — testing internal call order:
expect(mockRepo.save).toHaveBeenCalledBefore(mockEmail.sendWelcome);
// Breaks if refactoring reorders the calls, even if behaviour is the same

// Fragile 2 — testing exact log messages:
expect(console.log).toHaveBeenCalledWith('Contact alice@e.com created successfully');
// Breaks if someone changes the wording

// Fragile 3 — testing timestamps:
expect(result.createdAt).toBe(new Date('2024-01-01'));
// Breaks based on when the test runs

// Fragile 4 — snapshot of large objects:
expect(largeComplexObject).toMatchSnapshot();
// Breaks when any property of the 50-field object changes
```

**The fix for each:**

```ts
// 1 — Test that save happened, not when:
expect(mockRepo.save).toHaveBeenCalled();

// 2 — Test that logging happened, or test the behaviour the log described:
// (Or remove the test entirely if the log has no user-observable effect)

// 3 — Test that createdAt is recent, not a specific value:
expect(result.createdAt.getTime()).toBeCloseTo(Date.now(), -3);

// 4 — Test specific properties that matter:
expect(result.name).toBe('Alice');
expect(result.email).toBe('alice@e.com');
```

**Canonical example:** A fire drill that fails because the fire exit door was painted
a slightly different shade of green this year. The drill tests whether people evacuate,
not whether doors are a specific colour. Fragile tests test the colour.

**Project Application:** A contacts test that verifies `validateContact` calls
`_checkNameFormat` internally is fragile. A test that verifies `validateContact` returns
an error for an empty name is not.

**You will see this again in:**
- "Test suite is 90% passing but 10% flaky" — usually fragile tests
- CI pipelines that "retry failed tests" — a workaround for flakiness
- Sprint retros: "we spent 2 hours fixing broken tests after the CSS class rename"

**Watch for:** A test that broke because of a change you wouldn't describe as a
"bug fix." If the code is correct but the test still fails, the test is fragile.

---

## Step 1 — Identify and Categorise Bad Tests

Review the following test suite. For each test, decide: **keep, remove, or rewrite**.

```ts
describe('ContactService', () => {

  // Test A:
  it('calls repository.save with the correct arguments', () => {
    const mockRepo    = { save: vi.fn().mockReturnValue({ id: '1', name: 'Alice', email: 'a@b.com', city: 'London' }) };
    const mockEmail   = { sendWelcome: vi.fn() };
    const service     = new ContactService(mockRepo, mockEmail);

    service.create({ name: 'Alice', email: 'alice@example.com', city: 'London' });

    expect(mockRepo.save).toHaveBeenCalledWith({ name: 'Alice', email: 'alice@example.com', city: 'London' });
  });

  // Test B:
  it('returns the contact with an id field', () => {
    const mockRepo    = { save: vi.fn().mockReturnValue({ id: 'generated-id', name: 'Alice', email: 'a@b.com', city: 'London' }) };
    const mockEmail   = { sendWelcome: vi.fn() };
    const service     = new ContactService(mockRepo, mockEmail);

    const result = service.create({ name: 'Alice', email: 'alice@example.com', city: 'London' });

    expect(result.contact?.id).toBe('generated-id');
  });

  // Test C:
  it('logs the contact after saving', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const service = new ContactService(
      { save: vi.fn().mockReturnValue({ id: '1', name: 'Alice', email: 'a@b.com', city: 'London' }) },
      { sendWelcome: vi.fn() },
    );
    service.create({ name: 'Alice', email: 'a@e.com', city: 'London' });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

});
```

**Analysis:**

**Test A — Low value / REMOVE:**
It verifies that `save` was called with the input object. But if `save` wasn't called,
Test B would ALSO fail (no contact returned). Test A is redundant — remove it.

**Test B — High value / KEEP:**
It verifies the service returns the contact with the id that the repository generated.
This tests real behaviour: "the id from the repository appears in the result."

**Test C — No value / REMOVE:**
`console.log` is an implementation detail. If someone removes the log statement, the test
fails even though no user-visible behaviour changed. High maintenance cost, catches no bugs.

### SAVE AND TRY

```bash
npm test
```

The existing tests from T3-L6 should still pass. The analysis above is a mental exercise —
you don't need to write these tests.

---

## 🎯 Challenge: Audit a Test Suite

**You know:** What NOT to test, fragile tests, private methods, third-party libraries.

**Task:** For each of the following tests, decide: **keep, remove, or rewrite**. Justify each.

```ts
// Test 1:
it('calls bcrypt.hash with the password', async () => {
  const mockBcrypt = { hash: vi.fn().mockResolvedValue('hashed') };
  const service = new UserService(mockBcrypt, fakeRepo);
  await service.register('alice', 'password123');
  expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', expect.any(Number));
});

// Test 2:
it('stores a hashed password, not the plaintext', async () => {
  const fakeRepo = new FakeUserRepository();
  const service  = new UserService(realHasher, fakeRepo);
  await service.register('alice', 'password123');
  const stored = fakeRepo.findByUsername('alice');
  expect(stored?.password).not.toBe('password123');
});

// Test 3:
it('throws DuplicateUserError when username already exists', async () => {
  const fakeRepo = new FakeUserRepository();
  fakeRepo.seed({ username: 'alice', password: 'hashed' });
  const service = new UserService(realHasher, fakeRepo);
  await expect(service.register('alice', 'pass')).rejects.toThrow('DuplicateUserError');
});

// Test 4:
it('console.logs the registration event', async () => {
  const spy = vi.spyOn(console, 'log');
  await service.register('alice', 'pass');
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('alice'));
});
```

---

<details>
<summary>▶ Show Solution</summary>

**Test 1 — REMOVE or REWRITE**

This tests that `bcrypt.hash` was called — verifying HOW hashing happens, not WHAT
the effect is. If `bcrypt` is replaced with `argon2`, this test breaks even though
the behaviour (password is hashed) is unchanged.

Rewrite to test the observable effect: "the stored password is not plaintext" (Test 2 already does this).

**Test 2 — KEEP**

This tests the critical security behaviour: the plaintext password is never stored.
It uses a real hasher and a fake repository — correct. This is a behaviour test with
high ROI (catches a critical security bug).

**Test 3 — KEEP**

Correct behaviour test. If `alice` already exists, registration throws. The error
type matters for callers — they need to catch `DuplicateUserError` specifically.
High ROI.

**Test 4 — REMOVE**

`console.log` is an implementation detail. If someone removes the log in a refactoring,
this test fails — but no user-observable behaviour changed. High maintenance cost,
catches no real bugs.

| Test | Decision | Why |
|---|---|---|
| 1 — bcrypt called | Remove/rewrite | Tests implementation, not behaviour |
| 2 — no plaintext stored | Keep | Critical security behaviour |
| 3 — duplicate throws | Keep | Contract that callers depend on |
| 4 — console.log | Remove | Implementation detail, zero ROI |

</details>

---

## Final Check

| What to test | What NOT to test |
|---|---|
| Return values | Internal call order |
| Thrown errors | Private methods directly |
| Side effects (email sent, file written) | Third-party library behaviour |
| Edge cases in your logic | `console.log` output |
| Behaviour: "what it does" | Implementation: "how it does it" |

---

## Quick Check Answers

**1. `parseEmailDomain` is private and `validateEmail` is already tested. Should `parseEmailDomain` have its own tests?**

No. `parseEmailDomain` is an implementation detail of `validateEmail`. Its behaviour
is fully covered by the tests for `validateEmail` — any input that exercises the domain-parsing
logic goes through `validateEmail`. If `parseEmailDomain` needs its own tests, it is a signal
that it should be extracted into its own exported function with its own public contract.

**2. You test that Express returns 404 for unknown routes. What are you testing?**

You are testing Express, not your code. Express's 404 behaviour for unknown routes
is defined by Express and covered by Express's own test suite. This is a test for
someone else's library. What would have value: a test that confirms YOUR router is
set up correctly — "when the route is not registered in my app, the response is 404."
That tests your configuration, not the framework.

**3. You refactor `calculateDiscount` from `if/else` to a lookup table. Which tests break?**

Behaviour-based tests: none. The output is identical for all inputs. If a test
breaks, it was testing the `if/else` structure (implementation) rather than the
discount amounts (behaviour). That test was wrong before the refactoring — it was
testing the wrong thing.
