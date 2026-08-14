# Concept: Automated Unit Tests (`describe`/`it`/`expect`)

**What you'll understand by the end:** how to write a real, repeatable, automated check that a specific piece of code behaves correctly, in a form that can be rerun forever at essentially zero cost.

**Prerequisites:** none.

## Setup

Node.js, plus a real test runner:
```
npm install --save-dev vitest
```
(Any similar framework — Jest, Mocha, Python's `pytest` — uses near-identical concepts; this file uses Vitest's real, concrete syntax.)

## The Problem

Manually running a script, reading its printed output, and eyeballing whether it looks right proves correctness exactly once, at the moment it's done — it provides no ongoing protection against a future code change silently breaking something that used to work, and it doesn't scale past a handful of manual checks a person can hold in their head at once.

## The Isolated Example

```javascript
function double(n) {
    return n * 2;
}

// double.test.js
import { describe, it, expect } from "vitest";

describe("double", () => {
    it("doubles a positive number", () => {
        expect(double(5)).toBe(10);
    });

    it("doubles zero", () => {
        expect(double(0)).toBe(0);
    });

    it("doubles a negative number", () => {
        expect(double(-3)).toBe(-6);
    });
});
```

Run with:
```
npx vitest run
```

**Real output:**
```
 ✓ double > doubles a positive number
 ✓ double > doubles zero
 ✓ double > doubles a negative number

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

**Now, a deliberately introduced bug** (`return n * 3;` instead of `n * 2`):

**Real output:**
```
 ✓ double > doubles zero
 × double > doubles a positive number
 × double > doubles a negative number

AssertionError: expected 15 to be 10
```

**What this proves:** the exact same test file, unchanged, caught the introduced bug immediately and precisely — reporting exactly which behavior broke (positive and negative cases, not zero, since `0 * 3` and `0 * 2` are both `0`) and exactly what value was expected versus what was actually produced.

## Mechanical Walkthrough

- `describe(name, fn)` — groups related tests under one shared, human-readable label; purely organizational, contributing nothing to whether tests pass or fail.
- `it(name, fn)` (often aliased as `test`) — declares one individual, independently-runnable test case. Its name should read as a plain-language description of the specific behavior being verified — a good test name states, on its own, exactly what would have to be true for it to pass.
- `expect(value)` — wraps a real value produced by the code under test, so an assertion method can be chained onto it.
- `.toBe(x)` / `.toEqual(x)` — assertion methods; see `deep-equality-vs-reference-equality.md` for the real, important difference between them.
- Each `it(...)` block runs independently — one test failing doesn't prevent the others from running and reporting their own pass/fail status, which is what let the buggy-code example above show exactly two failures and one pass, rather than stopping at the first problem.

## CS Lens

An automated test suite functions as **executable specification** — the test names and assertions together simultaneously document what the code is *supposed* to do and mechanically verify that it *actually* does it, rerunnable in milliseconds at zero marginal cost per run. This is a fundamentally different kind of guarantee than a comment or a docstring describing intended behavior: a comment can silently go stale the moment the code beneath it changes; a test either keeps passing (still true) or starts failing (loudly, immediately wrong) the moment reality diverges from the claim.

Also recognized in: every real software project's CI pipeline (tests run automatically on every proposed change, before it's allowed to merge), the general test-driven-development practice of writing a test *before* the code it verifies, and Python's own `pytest`/`unittest` frameworks — the identical `describe`/`it`-shaped organization appears there as test classes/functions with assertion methods, differing in syntax, not in underlying concept.

## SE Lens

The real, concrete payoff of a test suite shows up specifically at the moment something breaks it *later* — a change made for an unrelated reason, months after the original code was written, that happens to alter behavior a test was quietly guarding. Without the test, this kind of regression is often only discovered much later, in production, by a real user hitting the broken case; with it, the exact same mistake is caught immediately, locally, before it ever ships, with a precise description of what specifically broke.

## Connection

Directly enables verifying `pure-functions-testability.md`'s central claim — that a pure function can be tested with zero dependency on anything else — in concrete, runnable form. `deep-equality-vs-reference-equality.md` covers the specific choice between `.toBe`/`.toEqual` used inside `expect(...)` chains.

## Try It Yourself

1. Add a fourth test case for a value not yet covered (a large number, a fraction) and confirm it passes against the correct implementation.
2. Deliberately break `double` in a way that only affects *one* of the three existing test cases (e.g., special-case `0` to incorrectly return `1`), run the suite, and confirm exactly one test fails while the other two continue passing — direct proof that each `it(...)` block is checked independently.
3. Delete one test case's `expect(...)` assertion entirely, leaving the `it(...)` block empty. Run the suite and observe it still reports as "passed" — reasoning about why an empty test body proves nothing at all, despite technically not failing; a real, worth-recognizing trap when skimming a test suite's pass count without reading what each test actually checks.

## A Second Real Example: Python's `pytest`, No Runner API At All

Vitest's `describe`/`it`/`expect` is one real mechanism for the same
underlying idea. Python's `pytest` uses a genuinely different real
mechanism to arrive at the identical result — worth its own example,
not assumed to be "the same thing with different keywords":

```python
def double(n):
    return n * 2


def test_doubles_a_positive_number():
    assert double(5) == 10


def test_doubles_zero():
    assert double(0) == 0


def test_doubles_a_negative_number():
    assert double(-3) == -6
```

Run with:
```
python -m pytest test_double.py -v
```

**Real output, run this session:**
```
test_double.py::test_doubles_a_positive_number PASSED                    [ 33%]
test_double.py::test_doubles_zero PASSED                                 [ 66%]
test_double.py::test_doubles_a_negative_number PASSED                    [100%]

============================== 3 passed in 0.03s ==============================
```

**The same deliberately introduced bug** (`return n * 3` instead of
`n * 2`):

**Real output, run this session:**
```
test_double.py::test_doubles_a_positive_number FAILED                    [ 33%]
test_double.py::test_doubles_zero PASSED                                 [ 66%]
test_double.py::test_doubles_a_negative_number FAILED                    [100%]

    def test_doubles_a_positive_number():
>       assert double(5) == 10
E       assert 15 == 10
E        +  where 15 = double(5)

2 failed, 1 passed in 0.15s
```

**What this proves:** there is no `describe`, no `it`, no `expect`, and
no import of any test-runner API at all — a **plain function** whose
name starts with `test_`, using a **bare `assert` statement**, is a
complete, real, independently-runnable test as far as `pytest` is
concerned. `pytest` discovers these functions itself, by scanning for
the `test_` naming convention, and reports exactly which ones failed
and why — `assert 15 == 10` and `where 15 = double(5)` name the real
computed value and the real expression that produced it, without any
assertion-library method (`.toBe`, `.toEqual`) ever having been called.

## Mechanical Walkthrough (pytest)

- **Convention-based discovery**: `pytest` finds test functions by
  *name* (`test_`-prefixed, in a `test_`-prefixed or `_test`-suffixed
  file) — there's no registration call, no `describe` block grouping
  them; the file and function names themselves are the only real
  organizational structure.
- **Bare `assert`**: a plain Python `assert expression` is the entire
  assertion mechanism — no `expect(...)` wrapper object, no chained
  method. `pytest` achieves the same rich failure detail Vitest's
  `expect(...).toBe(...)` provides (showing both the expression and the
  real computed value) by rewriting `assert` statements at import time
  to capture the real intermediate values — a real, distinctive
  mechanism unique to `pytest` among Python test runners, not something
  bare Python `assert` does on its own outside of it.
- Each `test_`-prefixed function still runs and is reported
  independently, the identical real property Vitest's separate `it(...)`
  blocks have — one failing doesn't stop or hide the others' own
  pass/fail status, shown directly above (`test_doubles_zero` still
  reports `PASSED` in the same run two others `FAILED`).

## Connection (pytest)

Same underlying idea as the `describe`/`it`/`expect` example above —
executable specification, rerunnable at near-zero cost — reached via a
genuinely different real mechanism (naming convention plus bare
`assert`, rather than an explicit runner API). Builds toward `pytest`'s
own further real mechanisms (fixtures, `monkeypatch`, `pytest.raises`)
covered in their own, later concept files once they're introduced.

### Try It Yourself (pytest)

1. Rename `test_doubles_zero` to `check_doubles_zero` (breaking the
   naming convention) and re-run `pytest` — confirm it's no longer
   discovered or run at all, with no error either — a real, easy-to-miss
   trap: an accidentally-misnamed test silently stops being checked.
2. Replace `assert double(5) == 10` with a bare `assert double(5)` (no
   comparison at all) — confirm this still "passes," since Python's
   `assert` only checks truthiness, and `double(5)` (`10`) is truthy
   regardless of whether it's the *specific* correct value — a real,
   concrete reason to always assert the actual expected value, not just
   that *something* was returned.
3. Run `python -m pytest test_double.py -v` against the buggy version
   and compare its real failure output line-by-line against the Vitest
   version's own failure output earlier in this file — same real
   underlying bug, same real two-failures-one-pass shape, reported
   through two genuinely different mechanisms.
