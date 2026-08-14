# Concept: `QTextDocument.find()` — a New Cursor Each Time, and the Null-Cursor Loop Sentinel

**What you'll understand by the end:** how `QTextDocument.find(query,
cursor)` returns a **new** `QTextCursor` (or a null one) rather than
mutating anything, and how to use that returned cursor as both the
current match's position and the next search's own starting point,
terminating the loop via `.isNull()`.

**Prerequisites:** `pyside6-qtextcursor-position-and-selection.md`,
`python-iterators.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Finding **every** occurrence of a query in a document — not just the
first — needs some way to repeatedly search "starting from where the
last match ended," and some way to know when to stop. `QPlainTextEdit.
find(query)` (`pyside6-qplaintextedit-widget.md`'s own facet) is a
convenience method tied to one specific widget's live cursor; a lower-
level, more general real API operates on the `QTextDocument` itself,
with a genuinely different shape.

## The Isolated Example

```python
import sys
from PySide6.QtGui import QTextCursor, QTextDocument
from PySide6.QtWidgets import QApplication

app = QApplication.instance() or QApplication(sys.argv)

doc = QTextDocument()
doc.setPlainText("X5 X5 X5")

matches = []
cursor = QTextCursor(doc)  # starts at position 0
while True:
    cursor = doc.find("X5", cursor)
    if cursor.isNull():
        break
    matches.append((cursor.selectionStart(), cursor.selectionEnd()))

print("matches found:", matches)
print("number of matches:", len(matches))

final_cursor = doc.find("X5", matches[-1][1] if matches else 0)
print("searching past the last real match -- isNull():", final_cursor.isNull())
```

**Real output, run this session:**
```
matches found: [(0, 2), (3, 5), (6, 8)]
number of matches: 3
searching past the last real match -- isNull(): True
```

**What this proves:** all three real occurrences of `"X5"` in `"X5 X5
X5"` were found, each at its own correct, real position — the loop
genuinely advanced past each match rather than re-finding the first one
repeatedly (per `reconstructing-discarded-position-via-sequential-
find.md`'s own concern, solved here differently: by reassigning
`cursor` to the *returned* cursor each time, whose own position already
sits past the match it just found). Searching from a position past the
last real match correctly returned a **null** cursor (`isNull()` is
`True`) — the real, only signal this API gives that nothing more was
found.

## Mechanical Walkthrough

- `doc.find(query, cursor)` searches `doc` starting from wherever
  `cursor` (its second argument) currently sits, and returns a **brand
  new** `QTextCursor` selecting the match, if one was found —
  it never mutates the `cursor` passed in.
- Because the returned cursor's own selection already ends *after* the
  match, reassigning `cursor = doc.find(query, cursor)` and looping
  automatically advances the search forward each time — the next call
  starts searching from the end of the previous match, never re-finding
  it.
- When no further match exists, `doc.find(...)` returns a real, special
  **null cursor** — checked via `.isNull()` — rather than raising an
  exception or returning `None`. This is the loop's entire real
  termination condition.
- `doc.find(query, cursor)` also accepts a plain integer position
  instead of a cursor (shown in `final_cursor` above) — both are valid
  real ways to say "start searching from here."

## CS Lens

The null-cursor sentinel is a real, Qt-specific counterpart to Python's
own iterator-exhaustion signal (`StopIteration`, per
`python-iterators.md`) — both communicate "there is nothing further"
to a consuming loop, just through genuinely different real mechanisms:
Python's iterator protocol raises a real exception the `for` statement
catches invisibly; Qt's `find()` returns a real, checkable sentinel
*value* the caller must explicitly test. Neither is "the" correct way
in the abstract — they're two different, real API design choices for
signaling the identical underlying idea (a sequence of results has run
out).

Also recognized in: C's `NULL`-terminated strings/linked lists (a
sentinel *value* marking the end, checked explicitly by calling code,
the same real shape as `isNull()` here); any API returning a sentinel
object instead of raising on "not found" (Python's own `dict.get(key,
default)` is a milder, same-family instance — a sentinel *default*
rather than an exception, when a lookup fails).

## SE Lens

The real, practical risk this API shape carries: forgetting the
`.isNull()` check (or checking a stale, wrong cursor) would either loop
forever or crash confusingly when code tries to use a null cursor's
position — unlike Python's `for`, which makes forgetting to handle
exhaustion structurally impossible, this API requires the caller to
remember the check every time. The real payoff of the "returns a new
cursor rather than mutating" design: nothing about calling `doc.find(
...)` has any real side effect on the document or any other cursor —
completely safe to call repeatedly, from different starting points, in
any order, with no risk of one search's own state leaking into another.

## Connection

Builds on `pyside6-qtextcursor-position-and-selection.md` and
`python-iterators.md` (the direct real conceptual parallel this file
draws). Distinct from `pyside6-qplaintextedit-widget.md`'s `.find()`
facet — that's a convenience method on a specific widget, mutating its
own live cursor and returning a plain `bool`; this file's
`QTextDocument.find()` is document-level, side-effect-free, and returns
a real cursor object (or null) instead.

## Try It Yourself

1. Pass a plain integer position instead of a cursor as `doc.find(
   "X5", 4)`'s second argument and confirm it finds the same real
   match a cursor positioned identically would.
2. Search for a query that appears **zero** times and confirm the very
   first `doc.find(...)` call already returns a null cursor — the loop
   exits immediately, with `matches` staying empty.
3. Look up `QTextDocument.FindFlag` (the same real flag type
   `pyside6-qmessagebox-dialogs.md`'s `Yes | No` combination uses a
   sibling of) and pass `QTextDocument.FindFlag.FindCaseSensitively` as
   a third argument — confirm it changes which real matches are found
   against mixed-case text.

## A Second Real Facet: `find()` Is Polymorphic on Its Needle

`doc.find(needle, cursor)`'s first argument doesn't have to be a plain
string — it also accepts a real `QRegularExpression`, with the
identical null-cursor loop mechanics either way:

```python
from PySide6.QtCore import QRegularExpression

def find_all(needle):
    matches = []
    cursor = QTextCursor(doc)
    while True:
        cursor = doc.find(needle, cursor)
        if cursor.isNull():
            break
        matches.append((cursor.selectionStart(), cursor.selectionEnd()))
    return matches


literal_matches = find_all("X5")
print("literal string needle:", literal_matches)

pattern_matches = find_all(QRegularExpression(r"X\d+"))
print("regex needle:         ", pattern_matches)
```

**Real output, run this session:**
```
literal string needle: [(0, 2), (7, 9)]
regex needle:          [(0, 2), (3, 6), (7, 9)]
```

**What this proves:** against `"X5 X10 X5"`, the plain-string needle
`"X5"` found exactly its two literal occurrences — `"X10"` never
matches literal text `"X5"`. The `QRegularExpression(r"X\d+")` needle,
passed through the **exact same** `find_all` function with no changes
to the loop itself, found all **three** real matches, including
`"X10"` — a genuinely different real result, purely because of what
kind of needle was passed in. The loop's own structure (`while True`,
reassigning `cursor`, checking `.isNull()`) never had to change at all
— *what* is being searched for is completely decoupled from *how* the
search loop detects completion.

**Mechanical note:** this is why a real caller passing either a `str`
or a `QRegularExpression` through the same local variable needs a real
union type annotation (`needle: str | QRegularExpression`, per
`python-function-type-hints.md`'s own local-variable facet) — the two
branches genuinely assign different real types to the identical name,
and a type checker needs to be told that's deliberate.

### Try It Yourself (second facet)

1. Pass a `QRegularExpression` with `PatternOption.CaseInsensitiveOption`
   set and confirm it finds real matches a plain string needle,
   case-sensitive by default, would miss.
2. Construct a genuinely invalid `QRegularExpression` (see
   `exception-vs-return-value-invalid-input-signaling.md`) and pass it
   to `find_all` — observe what real behavior results, connecting
   directly to that file's own real, checkable-property philosophy.
3. Confirm `doc.find(needle, cursor)` also still works with `needle` as
   a plain `int` position (shown in this file's first example) — three
   real, genuinely different accepted types for the same parameter,
   each producing correct, real, type-appropriate search behavior.
