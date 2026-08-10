# Concept: Regular Expressions — `re.search` and `re.findall`

**What you'll understand by the end:** how to recognize a text pattern in a string using Python's `re` module, and why regex patterns are almost always written as raw strings.

**Prerequisites:** none.

## Setup

Python 3, no packages needed — `re` is part of the standard library.

## The Problem

Recognizing a pattern in text — "a run of digits," "a letter followed by a number," "an email-shaped string" — by hand, character by character, is possible but long and easy to get subtly wrong. A dedicated pattern language, built into the standard library, handles this class of problem directly.

## The Isolated Example

```python
import re

match = re.search(r"\d+", "abc123def")
print(match.group())
```

**Real output:**
```
123
```

**What this proves:** `re.search(pattern, text)` scanned `text` for the first place `pattern` matched, and returned a `Match` object holding that result — `\d+` (backslash-d-plus) means "one or more consecutive digits," and `.group()` retrieves the actual matched text, `"123"`.

Finding *every* match, not just the first:
```python
print(re.findall(r"\d+", "a1 b22 c333"))
```
```
['1', '22', '333']
```

## Mechanical Walkthrough

- `\d` means "any single digit." `+` means "one or more of the previous thing." Together, `\d+` means "one or more consecutive digits."
- The `r` before the pattern string makes it a **raw string** — inside a raw string, backslash (`\`) is not treated as an escape character, so `\d` stays literally backslash-d rather than Python trying to interpret it as some other special character (like `\n` would mean newline in a normal string). This is why regex patterns in Python are almost always written with the `r` prefix.
- `re.search(pattern, text)` returns a `Match` object on success, or `None` if nothing matched anywhere in `text` — calling `.group()` on `None` would raise an `AttributeError`, a real, common mistake worth knowing to check for.
- `re.findall(pattern, text)` returns every match as a plain list of strings (or tuples, when the pattern has multiple capture groups — see `regex-capture-groups.md`), instead of stopping at the first one.

## CS Lens

A regex pattern is a compact description of a **regular language** — the formal-languages term for exactly the class of patterns regular expressions can recognize. Regex matching itself runs on a **finite state machine** internally (see `regular-language-finite-state-machine.md` for the concept in isolation).

Also recognized in: `grep` (the command-line tool, literally named after "global regular expression print"), form-input validation (email/phone patterns), log-file parsing, and every real compiler's own lexer, whether it uses regex directly or a hand-written state machine doing the equivalent job.

## SE Lens

The alternative to a regex is hand-written character-by-character scanning — a loop reading one character at a time, deciding "is this a letter? a digit?" That alternative is often *more* readable to someone who's never seen regex syntax, which is exactly why many lexer/parser textbooks teach it first. Regex trades a steeper one-time learning cost for far less code (one line often replaces many lines of a scanning loop) and easier long-term maintenance (one pattern to adjust, not a scanning loop's worth of branches) — a real tradeoff, not a strictly better choice in every case.

## Connection

`regex-capture-groups.md` builds directly on this — the same `re.findall`, with parentheses added to the pattern to extract specific pieces of each match rather than the whole thing. `python-regex-compile.md` covers the performance-oriented variant of calling these same operations repeatedly.

## Try It Yourself

1. Change the pattern to `r"[a-z]+"` (one or more lowercase letters) against `"abc123def456"`. Predict the result of `re.findall` before running it.
2. Call `re.search(r"\d+", "no digits here")` and print the result directly (not `.group()`). Confirm it's exactly `None`, and that calling `.group()` on it raises a real `AttributeError` — read the actual error message.
3. Remove the `r` prefix from a pattern that includes `\d` (write `"\d+"` instead of `r"\d+"`) and run the same search. Does it still work? Try a pattern where the difference actually breaks something (a pattern containing `\b`, which collides with the string escape for backspace) to see a case where dropping `r` produces a real, different bug.
