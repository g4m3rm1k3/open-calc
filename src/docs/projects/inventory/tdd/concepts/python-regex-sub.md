# Concept: `re.sub` — Pattern-Based Replacement

**What you'll understand by the end:** how to remove or replace every occurrence of a pattern in a string, and that Python replaces *all* matches by default — a real, notable difference from some other languages' regex APIs.

**Prerequisites:** `python-regex-search-findall.md`.

## Setup

Python 3, no packages needed.

## The Problem

Finding matches (`.search`/`.findall`) answers "where is this pattern," but doesn't change the string. Removing or replacing every occurrence of a pattern — stripping out comments, censoring digits, normalizing whitespace — needs a dedicated operation.

## The Isolated Example

```python
import re

text = "keep (drop this) keep (and this too)"
result = re.sub(r"\([^)]*\)", "", text)
print(repr(result))
```

**Real output:**
```
'keep  keep '
```

**What this proves:** both parenthesized sections were removed, not just the first — `re.sub` replaces *every* match in the string by default, with no special flag needed to request that. (Note the double space left behind where the first block once sat — `re.sub` only removes exactly what the pattern matched, nothing more; cleaning up resulting whitespace, if wanted, is a separate step.)

Replacing with real text instead of deleting:
```python
print(re.sub(r"\d+", "#", "room 42, item 7"))
```
```
room #, item #
```

## Mechanical Walkthrough

- `re.sub(pattern, replacement, text)` scans `text` for every match of `pattern` and replaces each one with `replacement`, returning a new string — the original `text` is never modified in place (strings are immutable in Python).
- With `replacement=""`, every match is effectively deleted.
- Unlike some other languages' regex replace functions (JavaScript's `.replace()`, for example, which replaces only the *first* match unless an explicit global flag is set), Python's `re.sub` replaces every match by default — a real, worth-knowing difference if you've used regex in another language first.

## CS Lens

`re.sub` combines pattern *matching* with a **rewrite rule** — for every location the pattern matches, substitute something else. This is the same underlying idea as find-and-replace in a text editor, generalized from a literal string to an entire pattern class.

Also recognized in: every "find and replace" feature in every text editor and word processor (a plain-text special case of the same idea), template engines performing substitution passes, and compiler preprocessing stages that rewrite source text before real parsing begins.

## SE Lens

Reaching for `re.sub` specifically (rather than `re.findall` plus manually rebuilding the string) is the right choice whenever the *positions* of matches don't need individual inspection — just "replace every occurrence." Manually rebuilding a string from `findall` results is more code and more opportunity for an off-by-one mistake in stitching the pieces back together; `re.sub` handles that bookkeeping internally.

## Connection

Builds on `python-regex-search-findall.md` and pairs directly with `regex-negated-character-class.md` — matching "everything inside a pair of delimiters, stopping correctly" and then removing every such match in one pass is a very common combination.

## Try It Yourself

1. Use `re.sub` with a function as the replacement argument instead of a string (`re.sub(r"\d+", lambda m: str(int(m.group()) * 2), "a1 b2 c3")`) — confirm each matched number is individually doubled, not replaced with one fixed value. This is a real, distinct capability plain string replacement doesn't have.
2. Add a `count` argument (`re.sub(pattern, replacement, text, count=1)`) to replace only the *first* match instead of all of them — confirm this recovers the "replace-first" behavior some other languages default to.
3. Chain two separate `re.sub` calls — one removing block comments `(...)`, one removing everything after a `;` — against a string containing both, and confirm the combination produces genuinely clean text with neither kind of comment remaining.
