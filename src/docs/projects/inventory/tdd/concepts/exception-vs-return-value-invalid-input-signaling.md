# Concept: Exception vs. Checkable Property — Two Real Ways to Signal Invalid Input

**What you'll understand by the end:** two genuinely different, both
legitimate real API philosophies for signaling that input was invalid
— raising immediately (Python's own `re.compile`) versus always
succeeding and exposing validity as a checkable property afterward
(`QRegularExpression`) — for the identical real operation, compiling a
regex pattern.

**Prerequisites:** `python-try-except.md`, `python-regex-compile.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

An operation that can fail on bad input — compiling a regex pattern
that turns out to be malformed — needs some real way to communicate
that failure back to its caller. There's more than one legitimate real
design for this, and a single codebase can genuinely use both,
depending on which library it's calling into — worth recognizing both
shapes rather than assuming there's one universally "correct" pattern.

## The Isolated Example

```python
import re
from PySide6.QtCore import QRegularExpression

# Python's re: invalid input can ONLY be handled via try/except.
try:
    re.compile("[unclosed")
except re.error as e:
    print(f"re.error: {e}")

# QRegularExpression: construction ALWAYS succeeds -- validity is a
# plain, checkable property afterward, no exception anywhere.
pattern = QRegularExpression("[unclosed")
print("QRegularExpression construction raised no exception.")
print("pattern.isValid():", pattern.isValid())
print("pattern.errorString():", pattern.errorString())

good_pattern = QRegularExpression(r"\d+")
print("good_pattern.isValid():", good_pattern.isValid())
```

**Real output, run this session:**
```
re.error: unterminated character set at position 0
QRegularExpression construction raised no exception.
pattern.isValid(): False
pattern.errorString(): missing terminating ] for character class
good_pattern.isValid(): True
```

**What this proves:** the identical, genuinely malformed pattern
(`"[unclosed"`, a real, unterminated character class) produced
completely different real behavior in each library. `re.compile(...)`
raised immediately — code calling it *must* wrap it in `try`/`except`
or the program crashes right there. `QRegularExpression(...)`
constructed successfully every time, with no exception anywhere —
`.isValid()` reports `False` only when explicitly asked, and
`.errorString()` gives a real, human-readable explanation on request.

## Mechanical Walkthrough

- Python's `re.compile(pattern)` treats a malformed pattern as an
  **exceptional** condition — the operation genuinely cannot produce a
  usable result, so it stops immediately via a real, raised
  `re.error`, per `python-try-except.md`'s own error-handling shape.
- `QRegularExpression(pattern)`'s constructor treats a malformed
  pattern as **ordinary, expected data** — it always returns a real,
  constructed object, and that object simply carries a `False` validity
  flag and an error description as two of its own real, plain
  properties, checkable whenever the caller chooses to look.
- Neither design is a workaround or a lesser version of the other —
  they reflect two genuinely different real assumptions about how
  *likely* and how *consequential* bad input is expected to be at each
  call site.
- A caller using `QRegularExpression` for something like a user-facing
  search box (this project's own real use) benefits from the
  check-a-property shape directly: the user's own typed text becomes
  the pattern, genuinely invalid input is expected and routine (not
  exceptional), and the real, correct response is "show a message,"
  not "crash," which is much more naturally expressed by checking
  `.isValid()` than by wrapping every keystroke's search in
  `try`/`except`.

## CS Lens

This is the real, general distinction between **exceptions** (signaling
that something genuinely went wrong, expected to be rare and to
interrupt normal control flow) and **checkable results** (signaling
that an operation completed, producing a real value the caller must
inspect to know what happened, without interrupting control flow at
all). Both are legitimate, real error-handling philosophies — languages
and libraries differ in which they default to, and a single, real
program frequently uses both, depending on the actual operation and how
routine failure is expected to be for it.

Also recognized in: Go's own idiomatic `(result, error)` return-pair
convention (checkable results, no exceptions in ordinary control flow
at all); Rust's `Result<T, E>` type (the identical idea, made a real,
first-class part of the type system); `dict.get(key, default)` versus
`dict[key]` in Python itself — the same real tension between "expect
this to routinely not be there" (checkable, via `.get`) and "this
genuinely should be there, and it's exceptional if not"
(`KeyError`-raising `[key]`).

## SE Lens

The real, practical guidance this contrast suggests: reach for an
exception when bad input is genuinely rare and represents a real
programming error or a truly abnormal situation the caller shouldn't
be expected to routinely handle inline; reach for a checkable
result/property when bad input is a normal, expected, routine
possibility the caller is *always* going to need to branch on anyway
(exactly the case for a live search box, where a user's own in-progress
typing is invalid regex syntax constantly, for entirely normal
reasons). Choosing the wrong one for a given real situation has a real
cost either way: forcing every caller of a "routine failure" operation
to write `try`/`except` around it is real, repeated ceremony; relying
on a checkable property for a genuinely rare, serious failure risks a
caller simply forgetting to check it, silently proceeding with invalid
state.

## Connection

Builds on `python-try-except.md` and `python-regex-compile.md`. Distinct
from `exception-translation-at-boundary.md` — that file covers
converting one exception type into a different one at a layer boundary;
this file covers the more fundamental choice between exceptions and
checkable results in the first place, for the same real operation in
two different real libraries.

## Try It Yourself

1. Pass a genuinely valid pattern to both `re.compile(...)` and
   `QRegularExpression(...)` and confirm both succeed cleanly — the
   real difference only shows up on *invalid* input, not valid.
2. Write a small function wrapping `QRegularExpression` that instead
   **raises** a real, custom exception when `.isValid()` is `False` —
   confirm you can build the exception-based shape on top of the
   checkable one, then reason about why the reverse (making
   `re.compile` merely "check a flag") would require catching its
   exception internally regardless — you can't remove a real exception
   that's already guaranteed to be raised, only catch and re-wrap it.
3. Look up Python's own `re.error` versus checking `re.compile(...)` in
   a way that avoids raising at all (hint: there isn't one, built into
   `re` itself) — confirm Python's own standard library regex module
   commits fully to the exception-based philosophy, with no
   alternative checkable-result API offered.
