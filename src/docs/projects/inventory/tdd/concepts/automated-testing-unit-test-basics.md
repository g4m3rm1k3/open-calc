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
