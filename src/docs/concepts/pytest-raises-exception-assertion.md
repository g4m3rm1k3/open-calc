# Concept: Asserting an Exception Is Raised — `pytest.raises`

**What you'll understand by the end:** how to write a real, automated
test proving that specific code *should* fail, in what way, and why
that's a genuinely different kind of assertion from a bare `assert`.

**Prerequisites:** `automated-testing-unit-test-basics.md`,
`python-custom-exceptions.md`.

## Setup

Python 3 with `pip install pytest`.

## The Problem

Some real code is *supposed* to raise an exception under specific,
real conditions (invalid input, a missing file) — that's the correct,
intended behavior, not a bug. A bare `assert` can check a returned
value, but there's nothing to check a return value *of* when the
correct behavior is for the function to never return at all.

## The Isolated Example

```python
import pytest


class ConfigError(Exception):
    pass


def load_config(raw):
    if not raw.isdigit():
        raise ConfigError(f"bad config value: {raw!r}")
    return int(raw)


def test_load_config_raises_on_bad_value():
    with pytest.raises(ConfigError, match="bad config value"):
        load_config("not-a-number")


def test_load_config_works_on_good_value():
    assert load_config("42") == 42
```

**Real output, run this session:**
```
test_raises.py::test_load_config_raises_on_bad_value PASSED
test_raises.py::test_load_config_works_on_good_value PASSED
```

**What happens when the code under test *doesn't* raise, real output:**
```python
def test_expects_an_exception_but_none_comes():
    with pytest.raises(ValueError):
        pass  # nothing raised
```
```
    def test_expects_an_exception_but_none_comes():
>       with pytest.raises(ValueError):
E       Failed: DID NOT RAISE ValueError

1 failed in 0.15s
```

**What this proves:** `pytest.raises(...)` is a real, active assertion
— the test only passes if the wrapped code genuinely raises the
specified exception type; if it *doesn't*, `pytest.raises` itself fails
the test with an explicit "DID NOT RAISE" message, exactly the same way
a failed bare `assert` would, just checking for the *absence* of a
failure that was supposed to happen instead of a wrong value.

## Mechanical Walkthrough

- `pytest.raises(ExceptionType)` returns a real context manager — used
  with `with`, it expects the code inside the block to raise
  `ExceptionType` (or a subclass of it) before the block ends.
- If the block raises the expected type, the exception is caught by
  `pytest.raises` itself (it never propagates further, and the test
  continues normally after the `with` block) — the test passes.
- If the block raises nothing at all, `pytest.raises` fails the test
  itself with `Failed: DID NOT RAISE ExceptionType` — the real, precise
  message shown above.
- `match="bad config value"` additionally requires the raised
  exception's real string message to match that regular expression —
  confirming not just *that* something failed, but that it failed for
  the *right stated reason*, not merely any exception of the right
  type.

## CS Lens

This is a real, specific instance of testing a function's **contract**
around failure, not just its success path — a complete, honest
specification of a function's behavior includes what it does when given
invalid input, and `pytest.raises` is the real, concrete mechanism for
asserting that failure mode automatically and permanently, the same way
a bare `assert` does for a success mode.

Also recognized in: `expect(() => fn()).toThrow(...)` in JavaScript
test frameworks, `assertThrows(...)` in Java/JUnit — the identical real
idea (assert that calling this specifically raises/throws), expressed
through each language's own real exception-handling syntax.

## SE Lens

The real, practical value: without a test like this, a change that
accidentally makes `load_config` stop raising on bad input (silently
returning `None`, say, instead) would have no automated test catching
the regression — the "should fail" behavior is just as real a
requirement as the "should succeed" one, and just as capable of
silently breaking later without a test actively guarding it.

## Connection

Builds on `automated-testing-unit-test-basics.md` (the same executable-
specification idea, applied to exceptional behavior) and
`python-custom-exceptions.md`/`python-try-except.md` (what's actually
being asserted here). Directly complements Step 1's own bare-`assert`
content — most of a function's behavior is checked with a plain
`assert`; its failure modes are checked with `pytest.raises`.

## Try It Yourself

1. Remove the `match="bad config value"` argument and confirm the test
   still passes with a *wrong-message* `ConfigError` — then add match
   back and confirm a genuinely wrong message now fails the test,
   distinguishing "raised the right type" from "raised it for the
   right stated reason."
2. Change `pytest.raises(ConfigError, ...)` to `pytest.raises(
   ValueError, ...)` (the wrong type) while `load_config` still raises
   `ConfigError` — observe that the real `ConfigError` now propagates
   out of the test *uncaught*, failing it in a different, real way than
   "DID NOT RAISE."
3. Capture the real exception object itself: `with pytest.raises(
   ConfigError) as exc_info:` then, after the block,
   `print(exc_info.value.args)` — confirm you can inspect real, specific
   details of the caught exception, not just that one was raised.
