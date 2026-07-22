# Concept: Test Doubles — Stubs, Fakes, and Mocks

**What you'll understand by the end:** the different ways to replace a real dependency with a fake one for testing, when each is appropriate, and why a pure function often needs none of them at all.

**Prerequisites:** `pure-functions-testability.md`, `automated-testing-unit-test-basics.md`.

## Setup

Python 3, plus a real test runner:
```
pip install pytest
```

## The Problem

Testing code that depends on something slow, unreliable, or hard to control in a test environment — a real network call, a real database, the real current time — either makes tests slow and flaky (genuinely calling the real thing every test run) or genuinely impossible to run in isolation at all. Something needs to stand in for the real dependency during a test, without the code under test needing to know it's talking to a fake.

## The Isolated Example

```python
# Code under test: depends on an injected "clock" instead of calling time.time() directly.
def is_expired(created_at, ttl_seconds, clock):
    return clock() - created_at > ttl_seconds

# A test double: a fake clock returning a fixed, controlled value.
def fake_clock():
    return 1000.0

print(is_expired(created_at=900.0, ttl_seconds=50, clock=fake_clock))   # True
print(is_expired(created_at=990.0, ttl_seconds=50, clock=fake_clock))   # False

# A spy: records how it was called, in addition to returning a value.
calls = []
def spy_clock():
    calls.append("called")
    return 1000.0

is_expired(created_at=900.0, ttl_seconds=50, clock=spy_clock)
print(f"clock was called {len(calls)} time(s)")
```

**Real output:**
```
True
False
clock was called 1 time(s)
```

**What this proves:** `is_expired` was tested against two different, exact, controlled points in time — `1000.0` — with zero dependency on the real, actual current time, making the test's outcome fully deterministic and repeatable regardless of when it's actually run. The spy version additionally proved *how* the dependency was used (called exactly once), not just what the final answer was.

## Mechanical Walkthrough

- A **stub** provides a fixed, canned response when called, with no logic beyond that — `fake_clock` above is a stub, always returning `1000.0` regardless of anything else.
- A **fake** is a real, working, simplified implementation — not just a canned answer, but genuine (if simplified) logic — `stub-placeholder-pattern.md`'s in-memory list standing in for a real database is a fake, since it actually stores and retrieves data, just not durably.
- A **spy** wraps a real or fake implementation and additionally records how it was called — arguments passed, number of calls — so a test can assert not just the final result, but the *interaction* itself (as `spy_clock` does above).
- A **mock** goes further still: a mock object is typically pre-programmed with specific expectations ("this method must be called exactly twice, with these exact arguments") and a test explicitly verifies those expectations were met — testing the *interaction contract* between the code under test and its dependency, not merely its final output.
- All four are collectively called **test doubles** (an analogy to a stunt double in film) — different tools for the same underlying need: replacing a real, inconvenient dependency with something controllable, for the duration of a test.

## CS Lens

Test doubles work by relying on the code under test depending on an **interface** (a shape it expects something to have — a callable, an object with certain methods) rather than a specific, concrete implementation — this is the same dependency-on-shape-not-mechanism idea `stub-placeholder-pattern.md` and `dependency-injection.md` both describe, applied specifically to the context of testing. A function or class that only ever calls a globally-imported, hardcoded dependency directly has no seam to substitute a double into at all — which is exactly why designing for testability (accepting dependencies as parameters, as `clock` is accepted here) has to happen *before* a test is written, not after.

Also recognized in: every mainstream testing framework's own mocking library (Python's `unittest.mock`, JavaScript's Jest mocks, Java's Mockito) — the stub/fake/spy/mock vocabulary, while not perfectly standardized across every source, is widely recognized across the industry in roughly this shape.

## SE Lens

The real, important judgment call is choosing the *right* double for what's actually being verified: a stub is enough when only the returned value matters; a mock is appropriate specifically when the *interaction itself* is the thing being tested (did this send exactly one email, not zero, not two). Overusing mocks — asserting on exact call counts and arguments for things that aren't actually the behavior under test — produces brittle tests that break the moment an unrelated implementation detail changes, even though the real, externally-visible behavior didn't. A pure function (see `pure-functions-testability.md`) needs none of this machinery at all, which is itself a real, practical reason to prefer pure functions where the logic allows it — one less category of test-design decision to get wrong.

## Connection

Builds on `pure-functions-testability.md` and `automated-testing-unit-test-basics.md`. Directly enabled by `dependency-injection.md` — a dependency has to be *substitutable* (passed in, not hardcoded) before any double can be used in its place at all.

## Try It Yourself

1. Rewrite `is_expired` to call `time.time()` directly instead of accepting a `clock` parameter, and reason about (or attempt) how you'd write a deterministic, repeatable test against this version — confirming the difficulty is a direct, structural consequence of the dependency being hardcoded rather than injected.
2. Use `spy_clock`'s recorded `calls` to assert `is_expired` calls the clock *exactly once* per invocation — then deliberately introduce a bug that calls it twice (checking the time, then re-checking it) and confirm the spy-based test catches this extra call even though the final boolean result might still happen to be correct.
3. Look up your language's real mocking library (Python's `unittest.mock.Mock`, for instance) and rebuild the spy example using it instead of a hand-written list — comparing the built-in library's assertion helpers (`assert_called_once()`, `assert_called_with(...)`) against the manual version.
