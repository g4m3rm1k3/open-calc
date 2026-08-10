# Concept: The `monkeypatch` Fixture

**What you'll understand by the end:** how to temporarily replace a
real function, method, or attribute for the duration of exactly one
test, and why this is a genuinely different real technique from
constructor/parameter-based dependency injection.

**Prerequisites:** `pytest-fixtures-and-tmp-path.md`,
`test-doubles-and-mocking.md`.

## Setup

Python 3 with `pip install pytest`.

## The Problem

Some real code depends on something genuinely non-deterministic or
externally uncontrollable (a random number, the current time, a real
network call, a real dialog needing a human) — testing it reliably
means controlling that one specific dependency for the test, without
redesigning the code under test to accept it as an injectable
parameter it was never written to take.

## The Isolated Example

```python
import random


def roll_and_report():
    value = random.randint(1, 6)
    return f"you rolled a {value}"


def test_roll_and_report_with_a_forced_value(monkeypatch):
    monkeypatch.setattr(random, "randint", lambda a, b: 4)
    result = roll_and_report()
    assert result == "you rolled a 4"


def test_random_randint_is_back_to_normal_afterward():
    values = {random.randint(1, 6) for _ in range(50)}
    assert values != {4}  # overwhelmingly unlikely if still forced to 4
    print("real distinct values seen:", sorted(values))
```

**Real output, run this session:**
```
test_monkeypatch.py::test_roll_and_report_with_a_forced_value PASSED
test_monkeypatch.py::test_random_randint_is_back_to_normal_afterward real distinct values seen: [1, 2, 3, 4, 5, 6]
PASSED
```

**What this proves:** `roll_and_report()` — code that was never written
to accept an injectable random source — was still made fully
deterministic for one test (`result == "you rolled a 4"`, every single
run). The *next* test, requesting no `monkeypatch` fixture at all,
observed real, varied values again (`[1, 2, 3, 4, 5, 6]`) — `pytest`
automatically reverted the patch the moment the first test finished,
with no manual cleanup written anywhere.

## Mechanical Walkthrough

- `monkeypatch` is itself a real, built-in `pytest` fixture (per
  `pytest-fixtures-and-tmp-path.md`'s own mechanism) — declared by
  parameter name, supplied automatically.
- `monkeypatch.setattr(random, "randint", lambda a, b: 4)` directly
  overwrites the real `randint` attribute on the real `random` module
  object, in memory, for the running process — `roll_and_report`'s own
  `random.randint(1, 6)` call now genuinely reaches the replacement
  function instead, with zero changes to `roll_and_report`'s own code.
- `pytest` records every `monkeypatch` change made during a test and
  automatically **reverts** each one the instant that test finishes —
  confirmed directly by the second test's own real output, observing
  the genuine `random.randint` behavior again.

## CS Lens

This is **monkey patching**: replacing an existing object's attribute
or method at runtime, on the real, live object itself, rather than
through any interface the original code was designed to accept a
substitute through. It's a real, valid test-double technique
(`test-doubles-and-mocking.md`'s own vocabulary — this specific
replacement is a real **stub**, returning a fixed, canned value with no
further behavior).

Also recognized in: any dynamic language's ability to reassign an
object's attributes after the fact (JavaScript's `jest.spyOn`/module
mocking, Ruby's method redefinition) — a real capability static,
compiled languages generally don't offer nearly as directly.

## SE Lens

The real, important contrast with dependency injection
(`dependency-injection.md`): DI requires the code under test to have
been **designed** with an injectable seam (a constructor parameter, a
passed-in dependency) — `roll_and_report()` has no such parameter at
all, and changing it just to make testing easier would be a real,
sometimes-unwelcome change to its public shape. Monkeypatching reaches
in and replaces the real dependency directly, for the test's duration
only, without requiring the original code to have anticipated this —
the real, practical tradeoff: it works on code you can't or don't want
to redesign, at the cost of patching something more tightly coupled to
the *implementation* (which real module-level name is being called)
than a clean, designed-in injection seam would be.

## Connection

Builds on `pytest-fixtures-and-tmp-path.md` (the same fixture
mechanism) and `test-doubles-and-mocking.md` (the vocabulary for what
kind of test double this produces). Directly contrasted with
`dependency-injection.md` — two genuinely different real techniques for
the same underlying goal (control what a test actually depends on).

## Try It Yourself

1. Patch `random.randint` to always raise an exception instead of
   returning a value (`lambda a, b: (_ for _ in ()).throw(RuntimeError(
   "forced failure"))` or a small named function) and confirm
   `roll_and_report()` now genuinely raises that real error during the
   test.
2. Use `monkeypatch.setenv("SOME_VAR", "test-value")` (a related, real
   `monkeypatch` method for environment variables, not just attributes)
   and confirm `os.environ.get("SOME_VAR")` reflects it during the test
   and reverts afterward, the identical real revert guarantee.
3. Try patching `random.randint` using a plain, hand-written
   `try`/`finally` (save the original, replace it, restore it in
   `finally`) instead of `monkeypatch` — get it working, then compare
   how much of that bookkeeping `monkeypatch.setattr` did for you
   automatically, including the case where the test itself fails
   partway through (finally still needs to run correctly either way).

## A Second Real Facet: Suppressing a Side Effect, Not Substituting a Value

The example above uses `monkeypatch` to make an otherwise-random result
**deterministic** — the replacement still returns a real, meaningful
value the test asserts against. A second, genuinely different real use
is suppressing a call that would otherwise have an unwanted real side
effect (blocking on a human, sending a real network request) — where
the point isn't the replacement's return value at all, only that it
happened, safely, in place of the real thing:

```python
import sys

notifications_sent = []


def notify_admin(message):
    """Stands in for a real, slow/blocking side effect (e.g. sending an email)."""
    raise RuntimeError("a real notification should never fire during a test")


def deactivate_account(account_id):
    notify_admin(f"account {account_id} was deactivated")
    return f"account {account_id} deactivated"


def test_deactivate_account_suppresses_the_real_notification(monkeypatch):
    monkeypatch.setattr(
        sys.modules[__name__], "notify_admin",
        lambda message: notifications_sent.append(message),
    )
    result = deactivate_account(42)
    assert result == "account 42 deactivated"
    assert notifications_sent == ["account 42 was deactivated"]


def test_notify_admin_is_back_to_its_real_blocking_self_afterward():
    try:
        notify_admin("should raise")
        raised = False
    except RuntimeError:
        raised = True
    assert raised
```

**Real output, run this session:**
```
test_monkeypatch_suppress.py::test_deactivate_account_suppresses_the_real_notification PASSED [ 50%]
test_monkeypatch_suppress.py::test_notify_admin_is_back_to_its_real_blocking_self_afterward PASSED [100%]
```

**What this proves:** `notify_admin`'s real, un-patched body
deliberately `raise`s — a stand-in for "this would really block or
fire a real side effect if it ran during a test." The first test still
passes, because `monkeypatch` replaced it with a no-op recorder before
`deactivate_account` ever called it. The second test, with no
`monkeypatch` fixture requested, confirms `notify_admin` is genuinely
back to its real, raising self — the identical automatic-revert
guarantee as the `random.randint` example, now protecting against a
dangerous real call rather than an unpredictable one.

**The real distinction this draws:** the first example (`random.
randint`) patches something *safe to call* but *unpredictable* — the
replacement's return value is the point. This second example patches
something *unsafe or undesirable to call at all* during a test — the
replacement's return value is almost incidental; suppressing the real
call is the actual point. Recognizing which of the two a given real
patch is doing clarifies what the test is actually asserting: a
computed result, or merely "the dangerous thing didn't happen."

### Try It Yourself (second facet)

1. Remove the `monkeypatch.setattr(...)` line from the first test and
   confirm it now genuinely fails with the real `RuntimeError` —
   concrete proof the patch, not luck, was suppressing the real call.
2. Change the lambda to also `raise` under some condition (say, if
   `account_id` is negative) and write a third test proving
   `deactivate_account(-1)` now propagates that real exception —
   showing the stand-in can simulate a *failed* notification too, not
   only a silently-suppressed one.
3. Compare this file's own real, earlier use of `QMessageBox.critical`
   (patched to a no-op purely to prevent a real, blocking modal dialog
   during a headless test run) against this section's `notify_admin` —
   confirm they're the identical real technique, applied to a real Qt
   call instead of an invented stand-in.
