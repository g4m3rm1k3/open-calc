---
concept: 080-unit-testing
name: Unit Testing
---

## Definition

A unit test is a small, automated piece of code that checks one specific
behavior of one specific piece of production code, run repeatedly to
confirm that behavior still holds as the codebase changes.

## Problem

Manually re-checking "does this still work?" by running the whole program
and clicking through it by hand doesn't scale — it's slow, easy to skip
under time pressure, and leaves no record of what was actually verified. An
automated test runs in seconds, every time, and fails loudly the moment the
behavior it checks breaks.

## Execution

**Arrange**: set up the specific input or state needed for this one check
↓
**Act**: call the actual function or method being tested
↓
**Assert**: compare what it returned or did against what was expected
↓
If the assertion holds → the test passes
↓
If it doesn't → the test fails, reporting exactly what was expected versus
what actually happened

## Computer Science

This "Arrange-Act-Assert" structure exists because a test is itself a
small, deterministic program whose job is to exercise one code path and
produce a true/false verdict — the same underlying logic as the Assertions
concept, but organized as a standalone, repeatable, automatically-run check
rather than an inline runtime invariant check.

Tags: Arrange-Act-Assert, Determinism, Test isolation, Assertions

## Software Engineering

A good unit test isolates the one thing it's checking from everything else
— a test that touches a real database, a real network call, or depends on
the current date/time is fragile and slow, and usually a sign that a
dependency should be swapped for a fake or mock (see the Test Doubles /
Mocking concept) instead of used for real. Tests that run fast and don't
depend on external state are what make it practical to run the entire test
suite on every single change.

Tags: Test isolation, Fast feedback, Flaky tests, Continuous integration

## Common Mistakes

- Testing implementation details (exactly how a function computes its result) instead of its actual behavior (what it returns for a given input) — this makes tests break on harmless internal refactors that didn't change any real behavior.
- Writing one giant test that checks many unrelated things at once — when it fails, it's unclear which of the several things being checked actually broke.

## Exercises

- Write a unit test for an `isEven(n)` function covering: a positive even number, a positive odd number, zero, and a negative even number, as four separate, clearly-named checks.
- Take an existing function you've written and identify one edge case (empty input, a boundary value) its current tests don't cover yet.

## javascript

```javascript
function isEven(n) {
  return n % 2 === 0
}

function assertEqual(actual, expected, label) {
  const pass = actual === expected
  console.log(`${pass ? '✓' : '✗'} ${label}: got ${actual}, expected ${expected}`)
}

// Arrange/Act/Assert, one behavior per check
assertEqual(isEven(4), true, 'isEven(4)')
assertEqual(isEven(7), false, 'isEven(7)')
assertEqual(isEven(0), true, 'isEven(0)')
assertEqual(isEven(-2), true, 'isEven(-2)')
```
Walkthrough: each `assertEqual` call is its own tiny Arrange-Act-Assert: the
input is set up inline (Arrange), `isEven(...)` is called (Act), and the
result is compared against what's expected (Assert). A real test framework
(Jest, Vitest, etc.) provides equivalent functions built in and handles the
pass/fail reporting for you — this is the same underlying idea, written by
hand.

## python

```python
def is_even(n):
    return n % 2 == 0


def assert_equal(actual, expected, label):
    passed = actual == expected
    mark = '✓' if passed else '✗'
    print(f'{mark} {label}: got {actual}, expected {expected}')


# Arrange/Act/Assert, one behavior per check
assert_equal(is_even(4), True, 'is_even(4)')
assert_equal(is_even(7), False, 'is_even(7)')
assert_equal(is_even(0), True, 'is_even(0)')
assert_equal(is_even(-2), True, 'is_even(-2)')
```
Walkthrough: identical Arrange-Act-Assert structure to the JavaScript
version — Python's real testing frameworks (`unittest`, `pytest`) provide
the equivalent of `assert_equal` built in, along with test discovery and
reporting, but the underlying idea being demonstrated here is exactly what
they automate.
