# Concept: `QRegularExpression` and Its Manual Match Iterator

**What you'll understand by the end:** `QRegularExpression`'s
`.globalMatch(text)` and the resulting iterator's explicit
`.hasNext()`/`.next()` pattern, `.capturedStart()`/`.capturedLength()`,
and why this looks different from Python's own native `for`-driven
regex iteration despite finding the identical real matches.

**Prerequisites:** `python-regex-search-findall.md`,
`python-iterators.md`, `regex-capture-groups.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Finding every occurrence of a pattern in a string — not just the first
— is a real, common need. Python's own `re` module handles this with a
native iterator (`re.finditer`), driven transparently by a `for` loop.
Qt's own regex class, `QRegularExpression`, is a real C++ API exposed
through Python bindings — it solves the identical real problem, but
its iteration shape looks noticeably different, because it wasn't
designed around Python's own iterator protocol at all.

## The Isolated Example

```python
import sys
from PySide6.QtCore import QRegularExpression
from PySide6.QtWidgets import QApplication

app = QApplication.instance() or QApplication(sys.argv)

text = "released v2 today, then v2.5 next week, not v2x though"
pattern = QRegularExpression(r"\bv\d+(\.\d+)?\b")

matches = pattern.globalMatch(text)
found = []
while matches.hasNext():
    m = matches.next()
    found.append((m.captured(0), m.capturedStart(), m.capturedLength()))

for text_matched, start, length in found:
    print(f"matched {text_matched!r} at start={start} length={length}")

print("total matches:", len(found))
```

**Real output, run this session:**
```
matched 'v2' at start=9 length=2
matched 'v2.5' at start=24 length=4
total matches: 2
```

**What this proves:** exactly two real matches were found —
`"v2"` and `"v2.5"` — and `"v2x"` was correctly **not** matched,
proving the trailing `\b` genuinely rejected it (`x` immediately after
the digits means there's no real word boundary there). The manual
`while matches.hasNext(): m = matches.next()` loop is required — there
is no `for m in matches:` shorthand for this object.

A direct, side-by-side contrast against Python's own native style on
the identical text and pattern:

```python
import re

text = "released v2 today, then v2.5 next week, not v2x though"

# Qt style: an explicit iterator object with hasNext()/next()
pattern = QRegularExpression(r"\bv\d+(\.\d+)?\b")
matches = pattern.globalMatch(text)
qt_found = []
while matches.hasNext():
    m = matches.next()
    qt_found.append((m.captured(0), m.capturedStart(), m.capturedLength()))

# Python style: re.finditer -- a native iterator, driven by `for`
py_pattern = re.compile(r"\bv\d+(\.\d+)?\b")
py_found = [
    (m.group(0), m.start(), m.end() - m.start())
    for m in py_pattern.finditer(text)
]

print("same real matches from both APIs:", qt_found == py_found)
```

**Real output, run this session:**
```
same real matches from both APIs: True
```

**What this proves:** both APIs find the exact same real matches, at
the exact same positions — the *result* is identical. Only the
mechanism for walking through those results differs: Python's
`finditer` plugs directly into `for`, the language's own native
iterator protocol (per `python-iterators.md`); `QRegularExpression`'s
`globalMatch` instead returns an object you drive yourself with an
explicit `while`/`hasNext`/`next` loop.

## Mechanical Walkthrough

- `QRegularExpression(pattern)` compiles a real pattern once, similar
  in spirit to `python-regex-search-findall.md`'s own recommendation to
  compile a pattern ahead of time when it'll be reused.
- The pattern `\bv\d+(\.\d+)?\b` is its own small, real syntax: `\b` is
  a **word boundary** (a real, zero-width position between a
  word character and a non-word character, or string edge) —
  required on both ends so `"v2"` inside `"v2x"` isn't matched as a
  false partial hit; `\d+` is one-or-more digits; `(\.\d+)?` is a
  **capturing group** made **optional** by the trailing `?`, matching a
  literal `.` followed by more digits, if present — the same optional-
  group technique `regex-capture-groups.md`'s own file establishes,
  applied here to an entire group rather than a single character.
- `.globalMatch(text)` returns a real
  `QRegularExpressionMatchIterator` — not a Python list, and not a
  native Python iterator/generator either, despite the name.
- `.hasNext()` reports whether at least one more real match remains;
  `.next()` advances the iterator **and** returns the actual
  `QRegularExpressionMatch` object for that match, in one call — unlike
  Python's own iterator protocol, where checking "is there a next
  value" and "get the next value" aren't separate method calls at all
  (a `for` loop handles both together, invisibly, via `StopIteration`).
- `.captured(0)` returns the whole match's text (group `0` is always
  "the entire match," the same real convention `regex-capture-
  groups.md` establishes for Python's own `re` module).
  `.capturedStart()`/`.capturedLength()` give the match's real position
  and size within the original string — Qt's own equivalent of Python's
  `match.start()`/`match.end()`.

## CS Lens

This is a real, concrete illustration of **why an API's shape isn't
always native to the language calling it**: `QRegularExpression` is a
real C++ class, and PySide6 exposes it to Python largely as-is rather
than adapting it to Python's own idioms. C++ has no built-in iterator
protocol matching Python's `__iter__`/`__next__`/`StopIteration`
machinery, so a C++-native API reaches for an explicit
`hasNext()`/`next()` shape instead — a real, common pattern in
languages (and API-bindings) without native generator/iterator support
built in.

Also recognized in: Java's `Iterator` interface (the identical
`hasNext()`/`next()` shape, for the identical underlying reason);
any C-library binding exposed to a higher-level language that keeps the
original library's own iteration idiom rather than translating it.

## SE Lens

The real, practical takeaway: recognizing *why* an API looks unusual
(a real, deliberate consequence of its origin as a C++ binding, not
carelessness or a worse design) changes how you approach unfamiliar
library code — the instinct to reach for `for x in thing:` first, and
fall back to an explicit `while`/`hasNext`-style loop only when a
library genuinely doesn't support the native shape, is a real, general
skill applicable well beyond regex APIs specifically.

## Connection

Builds on `python-regex-search-findall.md`, `regex-capture-groups.md`,
and directly contrasts with `python-iterators.md`'s native-iterator
framing — deliberately taught *after* that file specifically so the
contrast lands: "here's Python's own native shape" first, then "here's
a real API that doesn't follow it, and why." The real pattern
`\bv\d+(\.\d+)?\b` here mirrors, in shape, this project's own real
G-code token pattern (`\bG\d+(\.\d+)?\b`) — same structure (word
boundary, digit run, optional decimal group), invented here to keep the
isolated example project-independent.

## Try It Yourself

1. Add a plain `for` loop attempt (`for m in matches:`) directly on the
   `QRegularExpressionMatchIterator` from the first example and observe
   the real `TypeError` this raises — direct, concrete proof it does
   not support Python's iterator protocol despite superficially "being
   an iterator."
2. Add a second real capturing group to the pattern (say, requiring the
   version to end in an optional letter suffix) and use `.captured(1)`,
   `.captured(2)` to pull each group's own text independently.
3. Time both loops (Qt's `while`/`hasNext` vs. Python's `for`/
   `finditer`) against a long, repeated real string and confirm they're
   both genuinely fast — the mechanism difference here is about API
   shape and idiom, not a real performance gap.
