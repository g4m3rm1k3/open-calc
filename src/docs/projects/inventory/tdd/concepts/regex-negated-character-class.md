# Concept: Regex Negated Character Class

**What you'll understand by the end:** how to match "anything except a specific character" in a regex pattern, and the two different meanings `^` has depending on where it appears.

**Prerequisites:** `python-regex-search-findall.md`.

## Setup

Python 3, no packages needed.

## The Problem

Sometimes a pattern needs to match a run of characters up until a specific stopping character, without knowing in advance what those characters actually are — only that they aren't the one that ends the run.

## The Isolated Example

```python
import re

match = re.search(r"\(([^)]*)\)", "value(42)rest")
print(match.group(1))
```

**Real output:**
```
42
```

**What this proves:** `[^)]*` matched `"42"` — every character up to, but not including, the closing `)` — without the pattern needing to know in advance what characters would appear there. Compare against a pattern using `.` (any character) instead:

```python
match2 = re.search(r"\((.*)\)", "value(42)rest(99)more")
print(match2.group(1))
```
```
42)rest(99
```

**What this proves:** `.*` (any character, greedy) matched *past* the first closing paren, all the way to the *last* one in the string — because `.` doesn't know to stop at `)` the way `[^)]` deliberately does. This is the real, practical reason to reach for a negated class instead of a generic "any character" pattern when a specific stopping character is known.

## Mechanical Walkthrough

- `[...]` defines a **character class** — a set of characters, any one of which matches at that position.
- `[^...]`, with `^` as the very first character inside the brackets, **negates** the class — it matches any character *not* in the listed set.
- `[^)]*` therefore means "zero or more characters, none of which is `)`" — stopping automatically the instant a `)` would be next.
- `^` means something entirely different outside of `[...]` — there, it anchors a pattern to the start of a string (not used in this example) — the same character, two unrelated meanings, distinguished entirely by context.

## CS Lens

A character class (negated or not) is still describing a **regular language** (see `regular-language-finite-state-machine.md`) — it's a compact way to describe "one character from this set" without writing out an alternation (`(a|b|c|...)`) by hand for every possible character.

Also recognized in: `grep -v` (line-level negation, a different but related idea), and any pattern-matching system that needs "anything but X" as a primitive — a common enough need that most regex flavors across languages support this identical `[^...]` syntax.

## SE Lens

Using `.*` (any character, greedy) when a specific stopping point is actually known is a common, real regex mistake — it tends to match further than intended, "greedily" consuming as much as possible before backtracking only if forced to. A negated class matching exactly "not the stop character" avoids that entire class of over-matching bug by construction, rather than requiring a non-greedy modifier (`.*?`) bolted on to work around it.

## Connection

Builds on `python-regex-search-findall.md`. This is exactly the tool needed for `python-regex-sub.md`'s comment-stripping use case — matching everything inside a pair of delimiters without accidentally spanning past a second, later occurrence of the closing one.

## Try It Yourself

1. Change the negated class to `[^,)]` (stop at either a comma or a closing paren) against `"(a,b,c)"` using `re.findall` with the pattern `r"[^,)]+"`. Confirm it produces three separate matches, split at each stopping character.
2. Compare `[^)]*` against `.*?` (a non-greedy "any character" quantifier) on the two-parenthesized-groups example above. Confirm `.*?` also stops at the first `)` — but reason about why relying on greediness modifiers is more fragile than a negated class when the stopping character is actually known in advance.
3. Try negating a range instead of a single character: `[^a-z]+` against `"abc123XYZ"`. Confirm it matches the digits and uppercase letters — everything *not* a lowercase letter — proving negation works on ranges and combinations, not just single literal characters.
