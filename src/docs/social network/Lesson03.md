# Interlude — What to Test, and Why

**Track:** Developer Social Network — Slice 0 (before any code)
**Depth:** Heavy — this is methodology you'll apply in literally every lesson from here forward, so it's worth being genuinely solid on before the first line of app code exists
**Goal:** Understand the test pyramid, know how to decide what deserves a test versus what doesn't, and be comfortable with the red-green-refactor TDD cycle — so Slice 1's backend lesson can apply this for real instead of bolting tests on afterward.

---

## 0. Why this comes before any code, this time

The earlier version of this project added testing late, as its own separate topic, after a lot of code already existed untested. That's backward, and it produces a specific bad habit: testing starts to feel like an obligation performed *on* code, rather than a tool you think *with* while writing it. This time, every single lesson from Slice 1 onward writes a failing test before writing the code that makes it pass. This lesson is what makes that possible — you need the vocabulary and judgment before the first `assert` shows up.

---

## 1. What a test actually is — stripped of ceremony

A test is a small, automated program that checks whether another piece of your program behaves the way you expect, and tells you clearly (pass/fail) whether it did — without a human having to manually click through the app and eyeball the result.

```python
def add(a, b):
    return a + b

def test_add():
    assert add(2, 3) == 5
```

`assert` is a Python keyword: if the condition after it is `True`, nothing happens. If it's `False`, Python raises an error immediately, and a test runner (like `pytest`) catches that error and reports the test as failed. That's the entire mechanism — everything else in this lesson is judgment about *what* to assert and *when*.

---

## 2. The test pyramid — three levels, and why the shape matters

```
        /\
       /e2e\        <- few, slow, test the whole system together
      /------\
     /integr. \     <- some, test a few pieces working together
    /----------\
   / unit tests \   <- many, fast, test one small piece in isolation
  /--------------\
```

- **Unit tests** — test one function or one small piece of logic, in complete isolation from everything else (no real database, no real network call). Fast (milliseconds), and when one fails, you know almost exactly where the bug is.
- **Integration tests** — test a few pieces working together (e.g., "does this API endpoint actually read from and write to a real test database correctly"). Slower, catch bugs unit tests structurally can't see (like a database schema mismatch), but a failure tells you less precisely where the problem is.
- **End-to-end (e2e) tests** — test the whole system as a real user would experience it (e.g., a browser automation that signs up, logs in, and posts something). Slowest, most realistic, but also the most brittle and expensive to maintain.

**Why the pyramid shape, and not an equal split:** unit tests are cheap enough to write dozens of, so most of your test suite should live there — fast feedback, precise failure location. Integration and e2e tests are expensive (slow, more fragile, harder to write), so you write far fewer of them, reserved for the things unit tests genuinely can't verify (does the whole system actually wire together correctly). A test suite that's upside-down — mostly slow e2e tests, few unit tests — is a common, real mistake: painfully slow to run, and failures that don't tell you where the bug actually is.

---

## 3. Deciding what deserves a test — the actual judgment call

Not everything needs a test, and testing everything indiscriminately wastes time and creates maintenance burden without adding real safety. A few concrete guidelines:

**Do test:**
- Business logic with real decision-making (e.g., "is this password long enough," "can this user delete this post")
- Anything that's bitten you before, or that you can imagine breaking silently
- Edge cases: empty input, the boundary of a valid range, what happens when something's missing
- Code other code depends on — a bug here has a wide blast radius

**Usually skip testing:**
- Trivial one-line getters/setters with no logic
- Framework code you didn't write (you don't need to test that FastAPI correctly routes a request — that's FastAPI's own test suite's job)
- Exact wording of a UI label, unless that wording is itself business-critical

**The question worth asking for any specific piece of code:** *if this breaks, how would I find out, and how bad would it be?* If the honest answer is "I'd probably notice immediately and it's low-stakes," a test may not be worth the ongoing maintenance cost. If the answer is "this could silently corrupt data and I might not notice for weeks," that's exactly what tests are for.

---

## 4. Red-Green-Refactor — the actual TDD cycle

This is the workflow every backend lesson from Slice 1 onward will follow:

1. **Red** — write a test for behavior that doesn't exist yet. Run it. It fails (usually because the function doesn't even exist yet) — this is expected and correct, not a mistake.
2. **Green** — write the *minimum* code needed to make that test pass. Not the most elegant version, not handling every edge case yet — just enough to turn the failure into a pass.
3. **Refactor** — now that you have a passing test acting as a safety net, clean up the code (better names, remove duplication, handle an edge case) while continuously re-running the test to confirm you haven't broken the behavior it checks.

```python
# RED - this test fails because normalize_username doesn't exist yet
def test_normalize_username_lowercases_input():
    assert normalize_username("Alice") == "alice"

# GREEN - the simplest possible implementation that passes
def normalize_username(username):
    return username.lower()

# REFACTOR - now handle a real edge case, re-running the test throughout
def normalize_username(username):
    return username.strip().lower()   # also strips accidental whitespace
```

**Why write the test first, rather than after:** writing the test first forces you to think about *what the function should do* before getting absorbed in *how to build it* — a genuinely different, clarifying mental mode. It also guarantees the test actually tests something real: a test written after the code, especially by the same person who just wrote the code, has a natural tendency to just confirm whatever the code already does, bugs included, rather than checking what it *should* do.

---

## 5. A quick, complete example — testing a function that doesn't exist yet

```python
"""
interlude_practice.py
Run with: pytest interlude_practice.py -v
"""

def test_calculate_post_excerpt_truncates_long_text():
    long_text = "a" * 200
    result = calculate_post_excerpt(long_text, max_length=100)
    assert len(result) <= 103   # 100 chars + "..." = 103


def test_calculate_post_excerpt_leaves_short_text_unchanged():
    short_text = "Hello world"
    result = calculate_post_excerpt(short_text, max_length=100)
    assert result == "Hello world"


def calculate_post_excerpt(text, max_length):
    if len(text) <= max_length:
        return text
    return text[:max_length] + "..."
```

Run this with `pytest interlude_practice.py -v` — both tests should pass. Notice the pattern: two tests, each checking one specific, nameable behavior ("truncates long text," "leaves short text unchanged") rather than one giant test trying to check everything about the function at once. **One assertion-worthy behavior per test** is a habit worth building now — when a test named `test_calculate_post_excerpt_truncates_long_text` fails, you immediately know what broke, without reading the test body.

---

## 6. Challenges before Slice 1's backend lesson

1. Write a failing test (red) for a function `is_valid_email(email)` that should return `True` for `"user@example.com"` and `False` for `"not-an-email"`. Then implement the minimum code to make it pass (green). Then add a test for an edge case you think of yourself (e.g., an empty string), and extend the implementation to handle it (another red-green cycle).
2. For each of the following, decide "test" or "skip," and justify it in one sentence using Section 3's question: (a) a function that calculates a user's age from their birthdate, (b) a function that returns the string `"Welcome!"`, (c) a function that determines whether a user is allowed to delete a specific comment.
3. Explain, in your own words, why a test suite with 500 unit tests and 3 integration tests is generally healthier than one with 20 unit tests and 100 end-to-end tests — tie your answer to Section 2's pyramid reasoning, not just "because the pyramid says so."

---

## What's next

Slice 1's backend lesson applies this directly: the very first line of actual application code will be preceded by a failing test, and every feature from here forward follows the same red-green-refactor rhythm. Say the word when you're ready.
