# Concept: Exception Chaining — `raise ... from ...`

**What you'll understand by the end:** how Python links a newly-raised
exception back to the original one that caused it, what that link looks
like in a real traceback, and how to deliberately suppress it when the
original isn't useful information for whoever reads the error.

**Prerequisites:** `python-custom-exceptions.md`, `python-try-except.md`.

## Setup

Python 3, no packages needed.

## The Problem

Translating a low-level exception into a higher-level, more meaningful
one (per `exception-translation-at-boundary.md`) loses real information
the moment the original exception is simply discarded — the *real*
underlying cause (what specifically failed, and where) is exactly what
someone debugging the problem later needs, even though the caller only
ever needs to handle the new, translated exception type.

## The Isolated Example

```python
class ConfigError(Exception):
    pass


def load_value(raw):
    return int(raw)


def load_config(raw):
    try:
        return load_value(raw)
    except ValueError as e:
        raise ConfigError(f"bad config value: {raw!r}") from e


def load_config_suppressed(raw):
    try:
        return load_value(raw)
    except ValueError:
        raise ConfigError(f"bad config value: {raw!r}") from None


load_config("not-a-number")
```

**Real output, run this session (`from e` — chained):**
```
Traceback (most recent call last):
  File "example.py", line 11, in load_config
    return load_value(raw)
  File "example.py", line 6, in load_value
    return int(raw)
ValueError: invalid literal for int() with base 10: 'not-a-number'

The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "example.py", line 28, in <module>
    load_config("not-a-number")
  File "example.py", line 13, in load_config
    raise ConfigError(f"bad config value: {raw!r}") from e
ConfigError: bad config value: 'not-a-number'
```

**The same real scenario, calling `load_config_suppressed` instead
(`from None`):**
```
Traceback (most recent call last):
  File "example.py", line 35, in <module>
    load_config_suppressed("not-a-number")
  File "example.py", line 20, in load_config_suppressed
    raise ConfigError(f"bad config value: {raw!r}") from None
ConfigError: bad config value: 'not-a-number'
```

**What this proves:** `from e` produces a real, two-part traceback —
the original `ValueError` shown first, an explicit real sentence
("The above exception was the direct cause of the following
exception"), then the new `ConfigError` — both real errors visible,
connected. `from None` produces only the new exception's own traceback;
the original `ValueError` genuinely never appears anywhere in the
output, deliberately hidden, not merely unmentioned.

## Mechanical Walkthrough

- `raise NewException(...) from original_exception` sets the new
  exception's real `__cause__` attribute to `original_exception` —
  Python's own traceback-printing machinery checks for this and, when
  present, prints the original exception first with the explicit
  "direct cause" sentence shown above.
- `raise NewException(...) from None` sets `__cause__` to the real
  value `None` explicitly — Python's traceback printer treats this as
  "deliberately suppressed" and shows only the new exception, even
  though a real original exception genuinely was being handled at the
  time.
- Without *any* `from` clause, Python still records the original
  exception automatically as `__context__` (not `__cause__`) whenever a
  new exception is raised from inside an `except` block — the
  traceback would show a similar two-part output, but with a slightly
  different real sentence ("During handling of the above exception,
  another exception occurred") signaling an *incidental* relationship
  rather than an explicitly declared causal one.

## CS Lens

This is **exception chaining** — preserving a real causal link between
an original failure and whatever new, translated failure it triggered,
so a full diagnostic history survives even after the original
exception's own type has been replaced by something more meaningful to
the code that's actually handling it.

Also recognized in: Java's `Throwable(Throwable cause)` constructor
parameter, JavaScript's `Error` `cause` option (`new Error(msg, {
cause: original })`) — the identical real idea (preserve the original
failure's identity while presenting a new, translated one) recurring
across languages that support structured exception handling at all.

## SE Lens

The real, practical choice: keep the chain (`from e`) when the original
exception's real detail (exact failure type, exact message) is useful
to whoever eventually reads this error — almost always true for
internal errors and logs. Suppress it (`from None`) when the original
is genuinely uninteresting noise to the *caller* — e.g. a public API
deliberately not leaking its own internal implementation details (which
specific parsing library failed, with which internal exception type)
through its own, cleaner error surface. Choosing wrong in either
direction has a real cost: keeping noisy internal detail in a
user-facing error confuses the reader; suppressing a genuinely useful
original cause makes a real bug harder to actually diagnose later.

## Connection

Builds on `python-custom-exceptions.md` and `python-try-except.md`.
Directly the real mechanism `exception-translation-at-boundary.md`'s
own translation pattern should use whenever the original exception's
detail is worth preserving — that file's own examples can be revisited
with this file's `from e`/`from None` choice in mind.

## Try It Yourself

1. Remove the `from e` clause entirely (just `raise ConfigError(...)`
   with no `from` at all) and confirm the traceback still shows both
   exceptions, but with the "During handling of the above exception..."
   wording instead of "direct cause" — the real, automatic `__context__`
   behavior, distinct from an explicit `from`.
2. Add a real `print(exc.__cause__)` inside an `except ConfigError as
   exc:` block after calling the chained version, and confirm it prints
   the real, original `ValueError` object itself — `__cause__` is a
   genuine, inspectable attribute, not just a traceback-printing detail.
3. Write a small public function that deliberately uses `from None` to
   hide a real internal implementation detail (e.g. which parsing
   library it delegates to) from its own raised exception, and justify
   in one sentence why that specific suppression is the right call for
   a public-facing function specifically.
