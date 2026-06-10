# Junior to Senior — T3·L2 — Arrange / Act / Assert

**Prerequisites:** T3·L1 (What a Test Is). You have a Vitest project and your
first passing test suite. This lesson establishes the structural pattern every
test you will ever write should follow.

**What this lab adds:**
- Arrange: set up the world the test needs
- Act: perform exactly one operation — the thing being tested
- Assert: check exactly one outcome
- Why one Act and one Assert: a failing test should identify one broken behaviour
- Given / When / Then — the BDD naming for the same pattern
- `beforeEach` for shared setup — when to use and when not to

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A test has three `expect` calls. It fails. Which one failed?
> 2. You have five tests that all create the same `Contact` object before acting.
>    Is `beforeEach` always the right answer?
> 3. The Act phase calls the function being tested. What does the Arrange phase do?
>    What does the Assert phase do?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A test suite where every test has a clear three-phase structure — readable without explanation:

```ts
it('returns invalid when name is empty', () => {
  // Arrange
  const input = { name: '', email: 'alice@example.com', city: 'London' };

  // Act
  const result = validateContact(input);

  // Assert
  expect(result.valid).toBe(false);
});
```

And a `beforeEach` refactor that removes duplication without hiding it.

---

### Concept: One Act, One Assert — The Unambiguous Failure

**What it is:** Each test covers exactly one behaviour. The Act is one function call.
The Assert checks one outcome of that call. When the test fails, the test name alone
tells you exactly what broke.

**The problem before:**

```ts
// Multiple acts in one test — which one broke?
it('validates a contact', () => {
  const valid = validateContact({ name: 'Alice', email: 'alice@e.com', city: 'London' });
  expect(valid.valid).toBe(true);                      // Assert 1

  const invalid = validateContact({ name: '', email: 'alice@e.com', city: 'London' });
  expect(invalid.valid).toBe(false);                   // Assert 2
  expect(invalid.errors[0].field).toBe('name');        // Assert 3
});
```

This test fails with: `AssertionError: expected false to be true`. Which line failed?
You cannot tell from the error message alone — you must read the entire test and
mentally trace the execution. With three assertions, the first failure hides the rest.

**The solution:**

```ts
// One act, one assert per test — failure is unambiguous:
it('returns valid for a complete contact', () => {
  const result = validateContact({ name: 'Alice', email: 'alice@e.com', city: 'London' });
  expect(result.valid).toBe(true);
});

it('returns invalid when name is empty', () => {
  const result = validateContact({ name: '', email: 'alice@e.com', city: 'London' });
  expect(result.valid).toBe(false);
});

it('sets the error field to "name" when name is empty', () => {
  const result = validateContact({ name: '', email: 'alice@e.com', city: 'London' });
  expect(result.errors[0].field).toBe('name');
});
```

Now a failing test names the broken behaviour: `returns invalid when name is empty`.
No reading required.

**What it hides:** The debugging cost. When a test has one act and one assert, the
failure message IS the root cause. When a test has three asserts, the failure message
is one symptom — you have to investigate which assert caused it and why.

The invariant a test protects: "one broken test = one broken behaviour." This only
holds when tests have one act and one assert.

**Canonical example:** A car inspection checklist. Each item is tested separately:
brakes, headlights, tyres. If "brakes" fails, you know brakes need repair. If all
three items were one combined test, the failure message "inspection failed" tells you
nothing about which system needs work.

**Project Application:** The contacts validation has five rules. Five separate tests,
each checking one rule — not one test checking all five. When rule 3 breaks, test 3
fails with a name that says exactly which rule broke.

**Smallest possible example:**

```ts
// Bad — multiple acts, ambiguous failure:
it('math works', () => {
  expect(add(1, 1)).toBe(2);
  expect(add(0, 0)).toBe(0);
  expect(subtract(5, 3)).toBe(2);
});

// Good — one behaviour per test:
it('add returns sum of two positive numbers', () => {
  expect(add(1, 1)).toBe(2);
});
it('add returns zero for two zeros', () => {
  expect(add(0, 0)).toBe(0);
});
```

**Why it matters here:** The contacts validation tests will grow to 20+ tests as
edge cases are added. Each must be independently diagnosable.

**You will see this again in:**
- Every professional test suite — this is the universal standard
- React Testing Library: one assertion per `expect`, one user action per test
- pytest: same convention — each test function tests one scenario
- Standard interview question: "What makes a good unit test?"

**Watch for:** Multiple `expect` calls can be acceptable when they all verify the
SAME outcome: `expect(result.errors).toHaveLength(3)` followed by three
`expect(fields).toContain(...)` calls all check "all three errors are present" —
they are the same outcome, not three separate behaviours.

---

## Step 1 — See the Problem First

Add this multi-assertion test to your test file, run it, then break the implementation:

```ts
// Add temporarily to see the problem:
it('COMBINED TEST — do not write tests like this', () => {
  const valid   = validateContact({ name: 'Alice', email: 'alice@e.com', city: 'London' });
  const invalid = validateContact({ name: '', email: 'alice@e.com', city: 'London' });

  expect(valid.valid).toBe(true);
  expect(invalid.valid).toBe(false);
  expect(invalid.errors.length).toBeGreaterThan(0);
});
```

```bash
npm run test:watch
```

Now comment out `if (!input.name.trim())` in `validateContact`. The test fails.
**Which assertion failed?** Vitest shows the first failing assertion, but the
message is "expected 1 to be 0" — you have to read the test to understand which
assertion that refers to.

Remove the combined test. It demonstrated the problem.

---

### Concept: The Three Phases — Arrange, Act, Assert

**What it is:** Every test has three logical sections:
1. **Arrange** — set up the state the test needs (create objects, set values)
2. **Act** — perform exactly one operation (the function being tested)
3. **Assert** — verify exactly one outcome (check the result)

**The problem before (phases mixed together):**

```ts
it('name validation', () => {
  expect(validateContact({                          // Assert wrapping Act wrapping Arrange
    name: '',                                       // Arrange
    email: 'a@b.com',
    city: 'London'
  }).valid).toBe(false);                            // Assert
});
```

All three phases are collapsed into one line. When this test fails, it is hard to
tell what was being set up, what was being tested, or what was expected.

**The solution:**

```ts
it('returns invalid when name is empty', () => {
  // Arrange — the world the test needs:
  const input = { name: '', email: 'a@b.com', city: 'London' };

  // Act — exactly one operation:
  const result = validateContact(input);

  // Assert — exactly one outcome:
  expect(result.valid).toBe(false);
});
```

Three separate, readable sections.

**What it hides:** The reasoning process. When you write a test, you are answering:
- ARRANGE: "Given this world..."
- ACT: "When I call this function..."
- ASSERT: "Then this should be true."

The structure makes the reasoning visible in the code.

**Canonical example:** A recipe test: (1) Arrange the ingredients. (2) Act: combine and bake.
(3) Assert: the result is edible. These three steps appear in that order and do not mix.

**Project Application:** Every contacts validation test follows AAA. The Arrange section
provides the test contact. The Act section calls `validateContact`. The Assert section
checks the result.

**Smallest possible example:**

```ts
it('toUpperCase returns the string in uppercase', () => {
  // Arrange:
  const input = 'hello';

  // Act:
  const result = input.toUpperCase();

  // Assert:
  expect(result).toBe('HELLO');
});
```

**Why it matters here:** With five validation rules and multiple edge cases, tests will
grow to 15–20. The three-phase structure keeps each test scannable even as the suite grows.

**You will see this again in:**
- Python pytest: the same convention is called AAA or Arrange/Act/Assert
- JUnit (Java): the convention is Given/When/Then (BDD terminology for the same thing)
- The Microsoft Test Framework documentation uses AAA explicitly
- Every coding bootcamp, every book on unit testing

**Watch for:** "Act" should be one line — one call to the function under test. If
your Act phase has three lines, you are testing multiple operations. Each should
be its own test.

---

## Step 2 — Rewrite the Tests With Explicit Phases

Continue in the `contact-tests` project from T3·L1. Open `src/validate-contact.test.ts`
and replace its contents:

```ts
import { describe, it, expect } from 'vitest';
import { validateContact }       from './validate-contact';

describe('validateContact', () => {

  it('returns valid for a complete contact', () => {
    // Arrange
    const input = { name: 'Alice', email: 'alice@example.com', city: 'London' };

    // Act
    const result = validateContact(input);

    // Assert
    expect(result.valid).toBe(true);
  });

  it('returns empty errors for a complete contact', () => {
    // Arrange
    const input = { name: 'Alice', email: 'alice@example.com', city: 'London' };

    // Act
    const result = validateContact(input);

    // Assert
    expect(result.errors).toHaveLength(0);
  });

  it('returns invalid when name is empty', () => {
    // Arrange
    const input = { name: '', email: 'alice@example.com', city: 'London' };

    // Act
    const result = validateContact(input);

    // Assert
    expect(result.valid).toBe(false);
  });

  it('includes a name error when name is empty', () => {
    // Arrange
    const input = { name: '', email: 'alice@example.com', city: 'London' };

    // Act
    const result = validateContact(input);

    // Assert
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'name' })
    );
  });

  it('returns invalid when email has no @ symbol', () => {
    // Arrange
    const input = { name: 'Alice', email: 'not-an-email', city: 'London' };

    // Act
    const result = validateContact(input);

    // Assert
    expect(result.valid).toBe(false);
  });

  it('returns invalid when city is empty', () => {
    // Arrange
    const input = { name: 'Alice', email: 'alice@example.com', city: '' };

    // Act
    const result = validateContact(input);

    // Assert
    expect(result.valid).toBe(false);
  });

  it('accumulates ALL errors when all fields are invalid', () => {
    // Arrange — all three fields invalid:
    const input = { name: '', email: 'bad', city: '' };

    // Act
    const result = validateContact(input);

    // Assert — same outcome: all three errors are present:
    expect(result.errors).toHaveLength(3);
    const fields = result.errors.map(e => e.field);
    expect(fields).toContain('name');
    expect(fields).toContain('email');
    expect(fields).toContain('city');
  });

});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
✓ validateContact > returns valid for a complete contact
✓ validateContact > returns empty errors for a complete contact
✓ validateContact > returns invalid when name is empty
✓ validateContact > includes a name error when name is empty
✓ validateContact > returns invalid when email has no @ symbol
✓ validateContact > returns invalid when city is empty
✓ validateContact > accumulates ALL errors when all fields are invalid

Tests  7 passed (7)
```

**Notice:** The original "two-assertion" test for a complete contact was split into
two tests — one for `valid` and one for `errors`. Each failing test now names exactly
what broke.

**Change something:** Break the implementation — remove the city check from `validateContact`.
Run the tests. Expected: exactly `validateContact > returns invalid when city is empty` fails.
The test name tells you which rule broke without reading any code. Restore the city check.

---

### Concept: Given / When / Then (BDD)

**What it is:** Behaviour-Driven Development uses "Given / When / Then" instead of
"Arrange / Act / Assert." The phases are identical. The language is designed to read
as a business specification.

**The comparison:**

```ts
// Arrange / Act / Assert — developer language:
it('returns invalid when name is empty', () => {
  const input = { name: '', email: 'a@b.com', city: 'London' };   // Arrange
  const result = validateContact(input);                            // Act
  expect(result.valid).toBe(false);                                 // Assert
});

// Given / When / Then — specification language:
it('returns invalid when name is empty', () => {
  // Given a contact with an empty name:
  const input = { name: '', email: 'a@b.com', city: 'London' };

  // When it is validated:
  const result = validateContact(input);

  // Then it is invalid:
  expect(result.valid).toBe(false);
});
```

**What it hides:** They are the same pattern. The BDD framing helps non-developers
read tests as specifications. The AAA framing is more common in pure unit tests.
Pick one per codebase and be consistent.

**Canonical example:** A requirements document: "Given a user with an expired
subscription, when they try to access premium content, then they see the upgrade prompt."
Tests written in Given/When/Then format match this natural requirements language.

**Project Application:** For a professional API, tests written in Given/When/Then can
be shared with product managers and QA — they describe what the system should do in
language everyone understands.

**You will see this again in:**
- Cucumber: a testing framework where Given/When/Then are actual keywords in test files
- Gherkin syntax: `Given`, `When`, `Then` keywords in `.feature` files
- Python `behave` library: same pattern in Python
- Many QA teams write acceptance criteria in Given/When/Then format

**Watch for:** Mixing AAA and GWT in the same codebase creates confusion. Choose one.
Most TypeScript/JavaScript projects use AAA comments; many Python/Ruby projects use GWT.

---

### Concept: `beforeEach` for Shared Setup — When to Use It

**What it is:** `beforeEach` runs a function before EVERY test in a `describe` block.
It is the right tool when every test in the group needs the same starting state.

**The problem — duplicated Arrange code:**

```ts
it('returns valid for a complete contact', () => {
  const input = { name: 'Alice', email: 'alice@example.com', city: 'London' };  // ← repeated
  const result = validateContact(input);
  expect(result.valid).toBe(true);
});

it('returns empty errors for a complete contact', () => {
  const input = { name: 'Alice', email: 'alice@example.com', city: 'London' };  // ← repeated
  const result = validateContact(input);
  expect(result.errors).toHaveLength(0);
});
```

The same `input` object appears in both tests.

**The solution — `beforeEach` for shared data:**

```ts
describe('validateContact — valid inputs', () => {
  let result: ReturnType<typeof validateContact>;

  beforeEach(() => {
    // Arrange — runs before each test:
    result = validateContact({ name: 'Alice', email: 'alice@example.com', city: 'London' });
  });

  it('returns valid', () => {
    expect(result.valid).toBe(true);
  });

  it('returns no errors', () => {
    expect(result.errors).toHaveLength(0);
  });
});
```

**What it hides:** The repeated setup. But it also hides the Arrange phase from each
individual test — which can make tests harder to understand in isolation.

**The rule:** Use `beforeEach` only when EVERY test in the `describe` uses the same
setup without modification. If even one test needs different data, inline the setup.

**Canonical example:** A classroom setting up the same equipment for every lab session.
Every student (test) in this lab needs the same setup. But lab 1 (describe group 1)
and lab 2 (describe group 2) need different equipment — each `describe` has its own `beforeEach`.

**Project Application:** In the contacts tests, `beforeEach` makes sense for the
"valid contact" group (both tests check the same valid result). The "invalid" tests
each need different invalid data — `beforeEach` would be wrong there.

**Smallest possible example:**

```ts
describe('when the database has 3 users', () => {
  beforeEach(() => {
    database.seed([user1, user2, user3]);  // runs before EACH test in this describe
  });

  it('count is 3', () => { expect(database.count()).toBe(3); });
  it('can find user1', () => { expect(database.find(user1.id)).toBeDefined(); });
});
```

**You will see this again in:**
- Jest/Vitest: `beforeEach`, `afterEach`, `beforeAll`, `afterAll`
- pytest: `@pytest.fixture` with `scope='function'` is the equivalent
- JUnit: `@BeforeEach` annotation

**Watch for:** Overusing `beforeEach` — if a test needs DIFFERENT setup than the
`beforeEach` provides, the test overwrites it, and the `beforeEach` becomes wasted
work. When this happens, the test is communicating "I don't fit here" — move it or
inline its Arrange.

---

## Step 3 — Extract Shared Setup With `beforeEach`

Add a `describe` block using `beforeEach` to `validate-contact.test.ts`:

```ts
describe('validateContact — valid inputs', () => {
  let result: ReturnType<typeof validateContact>;

  beforeEach(() => {
    // Arrange — runs before each test in this group:
    result = validateContact({ name: 'Alice', email: 'alice@example.com', city: 'London' });
  });

  it('returns valid', () => {
    expect(result.valid).toBe(true);
  });

  it('returns no errors', () => {
    expect(result.errors).toHaveLength(0);
  });
});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:** 9 passing tests — the original 7 plus the 2 new ones.

**In your console, verify the beforeEach runs per test:**

```bash
npx vitest run --reporter=verbose
```

**Expected:** Each test in `'validateContact — valid inputs'` is listed separately.
Each gets fresh data from `beforeEach`.

**Change something:** Replace `beforeEach` with `beforeAll`:

```ts
beforeAll(() => {
  result = validateContact({ name: 'Alice', email: 'alice@example.com', city: 'London' });
});
```

Run tests. Expected: all still pass. The difference: `beforeAll` runs once; both tests
share the same `result` object. If a test mutated the result, the second test would
see the mutated version. `beforeEach` gives each test a fresh result.
Change back to `beforeEach`.

---

## 🎯 Challenge: Refactor a Poorly Structured Test Suite

**You know:** AAA structure, one Act, one Assert, `beforeEach`.

**Task:** The following test suite has structural problems. List every problem, then
rewrite the tests following the AAA pattern correctly.

```ts
// Problem test file — analyse it, then rewrite:
describe('calculator', () => {
  it('works', () => {
    expect(add(2, 3)).toBe(5);
    expect(add(0, 0)).toBe(0);
    expect(add(-1, 1)).toBe(0);
    expect(subtract(5, 3)).toBe(2);
    expect(multiply(4, 3)).toBe(12);
  });

  let x: number;
  let y: number;

  beforeEach(() => {
    x = 10;
    y = 5;
  });

  it('divides', () => {
    const result = divide(x, y);
    expect(result).toBe(2);
    expect(result).not.toBeNaN();
  });

  it('handles divide by zero', () => {
    y = 0;
    const result = divide(x, y);
    expect(isFinite(result)).toBe(false);
  });
});
```

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

**Problems in the original:**

1. `'works'` — tests five different functions in one test. Any failure is ambiguous.
2. Five `expect` calls in `'works'` check five different outcomes — should be five tests.
3. `beforeEach` sets `x = 10, y = 5` but `'handles divide by zero'` overwrites `y = 0`.
   The `beforeEach` adds noise without benefit for that test.
4. `'divides'` has two asserts checking different outcomes.

**Corrected test file:**

```ts
import { describe, it, expect } from 'vitest';
import { add, subtract, multiply, divide } from './calculator';

describe('add', () => {
  it('adds two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
  it('returns zero when both inputs are zero', () => {
    expect(add(0, 0)).toBe(0);
  });
  it('returns zero when inputs cancel out', () => {
    expect(add(-1, 1)).toBe(0);
  });
});

describe('subtract', () => {
  it('subtracts the second number from the first', () => {
    expect(subtract(5, 3)).toBe(2);
  });
});

describe('multiply', () => {
  it('multiplies two numbers', () => {
    expect(multiply(4, 3)).toBe(12);
  });
});

describe('divide', () => {
  it('divides the first number by the second', () => {
    // Arrange
    const numerator   = 10;
    const denominator = 5;
    // Act
    const result = divide(numerator, denominator);
    // Assert
    expect(result).toBe(2);
  });

  it('returns a non-finite result when dividing by zero', () => {
    // Arrange
    const numerator   = 10;
    const denominator = 0;
    // Act
    const result = divide(numerator, denominator);
    // Assert
    expect(isFinite(result)).toBe(false);
  });
});
```

**Key changes:**

- `'works'` became five focused tests — each with one Act and one Assert.
- `beforeEach` was removed — each test has inline Arrange. The `'handles divide by zero'`
  test needed different values anyway; shared setup was harmful.
- The two-assert `'divides'` test became two tests.
- Test names are sentences describing behaviour, not code.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| One Act per test | Read each test — one function call in the Act section | No test calls the function twice |
| One outcome per test | Count `expect` calls | Each test verifies one outcome (or multiple aspects of the same outcome) |
| Phases visible | Read the test without explanation | Arrange / Act / Assert are clear |
| `beforeEach` appropriate | Every test in the `describe` uses the same setup | No test overwrites or ignores `beforeEach` data |
| Test names are sentences | Read the test names aloud | Each describes one expected behaviour |

---

## Quick Check Answers

**1. A test has three `expect` calls and fails. Which one failed?**

You cannot know without reading the test. Vitest will report the first failing
`expect` and stop — the other two are not evaluated. If the first `expect` passes
and the second fails, you see the second failure message but do not know whether
the third would have passed. One `expect` per test eliminates this ambiguity
entirely: a failing test names one broken behaviour.

**2. Five tests create the same `Contact` object — is `beforeEach` always the answer?**

Not always. Use `beforeEach` only if all five tests use the same object without
modification. If any test uses a different contact (different name, different
email for a different scenario), inline the setup in that test. `beforeEach`
should describe the one thing that is always true at the start of every test in
the group — if that is not true, the shared setup is misleading.

**3. What does the Arrange phase do? What does the Assert phase do?**

The Arrange phase sets up everything the test needs to run: creating objects,
setting values, registering any fakes or observers. It does not call the function
being tested. The Assert phase checks one outcome of the Act — it does not call
any function; it only evaluates the result of the Act using `expect`. The boundary
rule: if a line calls the function under test, it is Act. If it creates inputs,
it is Arrange. If it calls `expect`, it is Assert.
