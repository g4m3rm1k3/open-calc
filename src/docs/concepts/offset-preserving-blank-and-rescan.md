# Concept: Offset-Preserving Blank-and-Rescan

**What you'll understand by the end:** the real technique of replacing
a matched region with **equal-length whitespace** rather than deleting
it, so a later, separate scan over the same string still reports
correct real positions relative to the *original* text — and the real,
concrete position-drift bug this avoids.

**Prerequisites:** `python-regex-sub.md`, `regex-negated-character-class.md`.

## Setup

Python 3, no packages needed.

## The Problem

A real multi-pass text scan sometimes needs to remove or ignore one
kind of region (a comment, a bracketed expression) before scanning for
something else (real tokens) — but the *positions* of whatever's found
in that second pass often still need to mean something relative to the
**original**, unmodified line (for error messages, syntax highlighting,
cursor placement). Simply deleting the first region shifts every
character after it leftward — silently corrupting every position the
second pass reports.

## The Isolated Example

The real technique — blank with **equal-length** whitespace, not delete:

```python
import re

COMMENT_RE = re.compile(r"\[[^\]]*\]")
WORD_RE = re.compile(r"[A-Z]\d+")

original = "G1 [rapid move] X10 Y20"

# Pass 1: find and remember the comment's own real text and position,
# BEFORE blanking it out.
comment_match = COMMENT_RE.search(original)
comment_text = comment_match.group(0)
comment_start = comment_match.start()

# Blank it with EQUAL-LENGTH whitespace -- the string's length, and
# every other character's position, stays exactly the same.
blanked = COMMENT_RE.sub(lambda m: " " * len(m.group(0)), original)

# Pass 2: scan the BLANKED string for words -- their positions are
# real, correct positions IN THE ORIGINAL LINE too, since nothing shifted.
words = [(m.group(0), m.start()) for m in WORD_RE.finditer(blanked)]

print("original: ", repr(original))
print("blanked:  ", repr(blanked))
print("comment found:", repr(comment_text), "at position", comment_start)
print("words found (text, position):", words)

for text, pos in words:
    assert original[pos:pos + len(text)] == text, "position drifted!"
print("every word's position is verified correct against the ORIGINAL line")
```

**Real output, run this session:**
```
original:  'G1 [rapid move] X10 Y20'
blanked:   'G1              X10 Y20'
comment found: '[rapid move]' at position 3
words found (text, position): [('G1', 0), ('X10', 16), ('Y20', 20)]
every word's position is verified correct against the ORIGINAL line
```

The real bug this avoids — deleting instead of blanking:

```python
deleted = COMMENT_RE.sub("", original)
words = [(m.group(0), m.start()) for m in WORD_RE.finditer(deleted)]

for text, pos in words:
    matches = original[pos:pos + len(text)] == text
    print(f"  {text!r} at position {pos} -- matches ORIGINAL line at that position? {matches}")
```

**Real output, run this session:**
```
  'G1' at position 0 -- matches ORIGINAL line at that position? True
  'X10' at position 4 -- matches ORIGINAL line at that position? False
  'Y20' at position 8 -- matches ORIGINAL line at that position? False
```

**What this proves:** blanking with equal-length whitespace kept every
word's real position **verified correct** against the original line —
the assertion never failed. Deleting instead genuinely broke it:
`'X10'`'s reported position (`4`) no longer matches where `X10`
actually sits in the *original* string (real position `16`) — the
scan found the right *text* but the *wrong position*, silently, with
no error or warning anywhere.

## Mechanical Walkthrough

- The comment's own real text and starting position are captured
  **before** any blanking happens — this information would be lost
  (or wrong) if captured from the blanked string instead.
- `COMMENT_RE.sub(lambda m: " " * len(m.group(0)), original)` replaces
  the matched region with a string of **spaces exactly as long as the
  original match** — the total string length, and therefore every
  other character's index, is completely unaffected by the
  replacement.
- The second real scan (`WORD_RE.finditer(blanked)`) runs entirely
  against the blanked string — the comment's own text can no longer
  accidentally match `WORD_RE` (it's just spaces now), but every
  position it reports is simultaneously a valid, correct position in
  the *original* string too, since blanking never moved anything.
- Deleting instead of blanking breaks exactly this guarantee: the
  string's total length shrinks by however much text was removed, and
  every character after the removed region shifts to a numerically
  smaller real index — a scan over the shortened string reports
  positions that no longer correspond to the same real characters in
  the original.

## CS Lens

This is a real, deliberate technique for preserving a **coordinate
system** across a transformation — the blanked string is a genuinely
different string, but it's constructed specifically so its own
character indices remain a valid coordinate system for the *original*
text too. This is conceptually related to, but a different real
technique from, `cumulative-offset-range-mapping.md`'s own approach
(recovering a group's position via a running cumulative total/prefix
sum) — that technique reconstructs positions *after the fact*, by
accumulating; this one *prevents positions from ever changing at all*,
by keeping the transformed string's length identical throughout.

Also recognized in: source-map-style tooling in compilers and
transpilers (mapping positions in generated code back to positions in
original source) — a different real mechanism solving an analogous
real "keep positions meaningful across a transformation" problem.

## SE Lens

The real, practical value: any later real feature needing accurate
positions relative to the *original* text — a syntax highlighter
underlining exactly the right characters, an error message pointing at
the real column a mistake occurred at, a "jump to this token" cursor
placement — depends entirely on this guarantee holding. The real,
easy-to-miss risk if it doesn't: a bug like the one demonstrated above
produces no exception, no crash, no visible symptom in casual testing
— just subtly wrong positions that only show up as "the highlighting
is one word off" or "clicking here jumps to the wrong place," genuinely
hard to notice and diagnose without deliberately checking, exactly the
way this file's own real assertion does.

## Connection

Builds directly on `python-regex-sub.md`'s function-replacement facet
(the mechanism this technique depends on) and
`regex-negated-character-class.md` (the pattern style used to match a
bracketed region). Distinct from `cumulative-offset-range-mapping.md`
— checked directly against it; a genuinely different technique solving
a differently-shaped real problem, not a duplicate.

## Try It Yourself

1. Change `COMMENT_RE`'s replacement to a **fixed-length** string that
   happens to differ from the match's own length (say, always exactly
   3 spaces) and confirm the position-verification assertion now fails
   for any comment that isn't exactly 3 characters long — direct, real
   proof the *equal-length* part specifically is what makes this work,
   not blanking in general.
2. Add a second kind of region to blank (say, a second bracket style)
   before the word scan, and confirm positions stay correct with two
   real blanked regions instead of one.
3. Write a real function `verify_positions(original, found)` that
   performs this file's own assertion loop generically, and use it as
   a real, reusable test helper for any future multi-pass scanning code
   you write.
