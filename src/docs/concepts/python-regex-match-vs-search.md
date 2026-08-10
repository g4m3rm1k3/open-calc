# Concept: `re.match` vs. `re.search`, `re.IGNORECASE`, and Alternation

**What you'll understand by the end:** why `re.match` and `re.search` can
disagree on the exact same pattern and string, what `^` actually anchors
to, how `(a|b|c)` lets one pattern recognize several distinct words, and
what `re.IGNORECASE` changes.

**Prerequisites:** `python-regex-search-findall.md`.

## Setup

Python 3, no packages needed.

## The Problem

`python-regex-search-findall.md` only used `re.search`, which scans the
*whole* string for a match anywhere in it. Sometimes the question isn't
"does this pattern appear somewhere in the text" but "does the text
*start with* this pattern" — a genuinely different, stricter question,
answered by a different function.

## The Isolated Example

```python
import re

pattern = re.compile(r"^(WHILE|END\d+|DO\d*)", re.IGNORECASE)
print(pattern.match("END1"))
print(pattern.match("  END1"))
print(pattern.search("  END1"))
print(pattern.match("while [#1 lt 8] do1"))
```

**Real output:**
```
<re.Match object; span=(0, 4), match='END1'>
None
None
<re.Match object; span=(0, 5), match='while'>
```

**What this proves:** `pattern.match(text)` only succeeds if the pattern
matches starting at index `0` of `text` — two leading spaces make it fail
even though the identical pattern would clearly match `"END1"` a few
characters in. `.search()` on that same padded string *also* returns
`None` here, because the pattern itself starts with `^` — an anchor
meaning "the true start of the string," which `.search()` still respects
even though it's otherwise willing to look anywhere.

## Mechanical Walkthrough

- `(WHILE|END\d+|DO\d*)` — parentheses plus `|` (alternation) mean "match
  any *one* of these alternatives," tried left to right. `END\d+` requires
  at least one digit after `END`; `DO\d*` allows zero or more, so bare
  `"DO"` matches too, not just `"DO1"`.
- `^` anchors the match to the actual start of the string being matched
  against — not "the start of a line" unless `re.MULTILINE` is also
  passed, which this pattern doesn't use.
- `re.IGNORECASE` (often imported as `re.I`) makes every letter in the
  pattern match either case — `WHILE` matches `"while"`, `"While"`,
  `"WHILE"`, all identically.
- `pattern.match(text)` implicitly behaves as if the pattern started with
  `^` even when it doesn't say so explicitly — it only ever tries
  position `0`. Writing `^` on a pattern used with `.match()` is
  redundant but not wrong; it starts to matter the moment the same
  compiled pattern is ever reused with `.search()` instead.
- `pattern.search(text)`, given a pattern that itself contains `^`, is
  constrained right back down to only trying position `0` too — the `^`
  inside the pattern does the constraining, not which method is called.

## CS Lens

Both `.match()` and `.search()` run the identical underlying automaton
(see `regular-language-finite-state-machine.md`); they differ only in
which start positions in the input they're willing to try before giving
up — `.match()` tries exactly one (position `0`), `.search()` tries every
position left to right until one succeeds or all fail.

## SE Lens

The real, concrete reason this project's own keyword check calls
`.strip()` before `.match()` (`_KEYWORD_RE.match(line.strip())`, not
`_KEYWORD_RE.match(line)`): G-code lines are commonly indented for
readability inside a loop body (`"  N100 #103 = ..."`), and `.match()`'s
position-`0`-only rule means leading whitespace alone — with no `^` even
involved — would silently defeat every real keyword check on an indented
line. Stripping first removes that failure mode without needing
`re.MULTILINE` or a leading `\s*` grafted onto the pattern itself.

## Connection

`python-regex-search-findall.md` (`.search`/`.findall`, no anchoring);
`regex-negated-character-class.md` (a different way to constrain what a
pattern accepts). This project's own `_KEYWORD_RE`
(`cnc-service/core/lexer.py`) is the first real, non-lab use of
alternation, `^`, and `re.IGNORECASE` together.

## Try It Yourself

1. Remove `re.IGNORECASE` from the compiled pattern above and re-run the
   `"while [#1 lt 8] do1"` line. Confirm it now returns `None`, and explain
   why in one sentence.
2. Change `pattern.match(...)` to `pattern.fullmatch(...)` against
   `"END1 extra text"` — a third real anchoring variant, requiring the
   *entire* string to match, not just its start. Predict the result before
   running it.
3. Write a pattern that matches `"CALL"` or `"RET"` or `"RTS"` (three real
   keywords from this project's own `_KEYWORD_RE`) using alternation, and
   run it against `"CALLBACK"`. Confirm it actually *matches* (a real,
   verified result — alternation alone has no word-boundary concept, so
   `"CALL"` inside `"CALLBACK"` counts), then add `\b` after the group and
   confirm that now correctly rejects it — a genuinely separate mechanism
   worth its own look, and the real reason this project's own
   `_KEYWORD_RE` would misfire on a real subroutine name like `CALLOUT`
   if it ever gained one.
