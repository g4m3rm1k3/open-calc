# Concept: `QTextEdit.ExtraSelection` — a Whole-List Visual Overlay

**What you'll understand by the end:** `QTextEdit.ExtraSelection`'s
real `.cursor`/`.format` shape, how `setExtraSelections(...)` replaces
the **entire** overlay list on every call rather than accumulating, and
why this is a genuinely distinct mechanism from both
`QSyntaxHighlighter.setFormat` and direct `QTextCharFormat` mutation.

**Prerequisites:** `pyside6-qtextcharformat-and-qcolor.md`,
`pyside6-qtextcursor-position-and-selection.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Highlighting several real, scattered ranges of text at once — search
results, say — needs a way to show colored backgrounds without
permanently altering the document's own real character formatting (the
highlighting is temporary, tied to a current search, not part of the
document's actual content). `QSyntaxHighlighter`'s own overlay
mechanism (`pyside6-qtextcharformat-and-qcolor.md`) is built for
content-driven formatting recomputed automatically as text changes —
a different real job from "highlight exactly these positions, right
now, until told otherwise."

## The Isolated Example

```python
import sys
from PySide6.QtGui import QColor, QTextCharFormat, QTextCursor
from PySide6.QtWidgets import QApplication, QTextEdit

app = QApplication.instance() or QApplication(sys.argv)

editor = QTextEdit()
editor.setPlainText("X5 X5 X5")

fmt = QTextCharFormat()
fmt.setBackground(QColor("#ffe08a"))

selections = []
for start in (0, 3, 6):
    cursor = QTextCursor(editor.document())
    cursor.setPosition(start)
    cursor.setPosition(start + 2, QTextCursor.MoveMode.KeepAnchor)
    sel = QTextEdit.ExtraSelection()
    sel.cursor = cursor
    sel.format = fmt
    selections.append(sel)

editor.setExtraSelections(selections)
print("number of extra selections applied:", len(editor.extraSelections()))

block = editor.document().findBlockByNumber(0)
print("real format ranges recorded in the document's own layout:", len(block.layout().formats()))

editor.setExtraSelections(selections[:1])
print("after replacing with just one:", len(editor.extraSelections()))
```

**Real output, run this session:**
```
number of extra selections applied: 3
real format ranges recorded in the document's own layout: 0
after replacing with just one: 1
```

**What this proves:** all three real selections were applied and
`editor.extraSelections()` correctly reports them back. Checking the
document's own `layout().formats()` — the same real technique
`pyside6-testing-text-formatting-via-document-layout.md` uses to verify
`QSyntaxHighlighter` output — reports **zero** ranges: `ExtraSelection`s
never touch the document's own actual formatting data at all, only a
separate, real visual overlay the widget renders on top. Calling
`setExtraSelections(...)` a second time with only one selection
**replaced** all three — the count dropped to `1`, not accumulated to
`4` — confirming each call sets the *entire* real overlay list at once.

## Mechanical Walkthrough

- `QTextEdit.ExtraSelection()` is a real, small object with exactly two
  fields: `.cursor` (a real `QTextCursor` whose current **selection**
  defines which range of text this overlay covers) and `.format` (a
  real `QTextCharFormat` describing how that range should look).
- `editor.setExtraSelections(list_of_selections)` hands the widget a
  **complete, real replacement** for its entire current overlay —
  every previous call's selections are discarded, not added to.
- Because `ExtraSelection`s are a rendering-only overlay, they never
  appear in `document().findBlockByNumber(n).layout().formats()` — the
  same real distinction `pyside6-qtextcharformat-and-qcolor.md`'s own
  standalone `cursor.setCharFormat(...)` example draws against
  `QSyntaxHighlighter`, now against a *third* real mechanism.
- Because `setExtraSelections` replaces the whole list, updating
  highlights after each new search (as matches change) is naturally
  correct: build the full, current list of matches fresh each time and
  call `setExtraSelections` once — there's no need to manually clear
  previous highlights first.

## CS Lens

This is a real, deliberate **immutable snapshot replacement** pattern:
rather than exposing incremental "add a highlight"/"remove a highlight"
operations that could drift out of sync with what's actually meant to
be shown, the API only ever accepts a complete, authoritative
description of the current overlay state, applied atomically in one
call. This avoids a real class of bug where forgetting to clear a
stale highlight leaves incorrect visual state lingering — there's no
"clear," only "replace with the current, correct full list."

Also recognized in: React's own re-render model (`react-usestate-hook.md`'s
own framing — a component describes its complete current output on
every render, rather than issuing incremental DOM mutation commands);
any UI update pattern favoring "describe the whole current state" over
"describe the delta from the previous state."

## SE Lens

The real, practical payoff for a search-highlighting feature
specifically: after every keystroke in a search box, the real, correct
implementation is simply "recompute the full list of current matches,
call `setExtraSelections` once" — no bookkeeping needed to track which
highlights were previously shown and need removing; the single
replacement call handles that automatically, every time, with the
document's own real content completely unaffected either way.

## Connection

Builds on `pyside6-qtextcharformat-and-qcolor.md` and
`pyside6-qtextcursor-position-and-selection.md`. A third, real, distinct
formatting-application mechanism alongside `QSyntaxHighlighter.setFormat`
and direct `cursor.setCharFormat(...)` — all three produce visually
similar colored text, through three genuinely different real underlying
mechanisms, worth being able to tell apart rather than treating as
interchangeable.

## Try It Yourself

1. Call `editor.setExtraSelections([])` (an empty list) after applying
   real highlights, and confirm every highlight disappears — the
   correct, real way to clear all overlays.
2. Give two different `ExtraSelection`s in the same list genuinely
   different formats (say, one match highlighted differently from the
   others, matching a "current match" vs. "other matches" distinction)
   and confirm both real, distinct appearances apply correctly at once.
3. Compare memory/performance conceptually: for a document with
   thousands of real matches, is rebuilding the entire `ExtraSelection`
   list on every keystroke likely to be a real, practical concern?
   Reason about what would make it expensive, and what wouldn't.
