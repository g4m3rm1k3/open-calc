# Concept: Testing Text Formatting via the Document's Own Layout (Not Pixels)

**What you'll understand by the end:** the real technique for testing
that a `QSyntaxHighlighter` applied the correct formatting — inspecting
Qt's own already-tracked internal formatting ranges directly via
`document.findBlockByNumber(n).layout().formats()` — and why that's a
genuinely better real choice than any pixel-based or screenshot-style
test.

**Prerequisites:** `pyside6-qtextcharformat-and-qcolor.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Verifying that a syntax highlighter actually did its job seems, at
first, like it might need to inspect *rendered pixels* — take a
screenshot, check that a specific pixel is the right color. That
approach is real, but slow, brittle (breaks on font/DPI/platform
differences that have nothing to do with whether highlighting logic is
correct), and indirect — it tests rendering, not the actual thing under
test. `QTextDocument` already maintains its own internal record of
which formatting applies to which characters, entirely separate from
however it's eventually drawn — that internal record is available to
inspect directly, with no rendering involved at all.

## The Isolated Example

```python
import sys
import re
from PySide6.QtGui import QColor, QSyntaxHighlighter, QTextCharFormat, QTextDocument
from PySide6.QtWidgets import QApplication

app = QApplication.instance() or QApplication(sys.argv)


class NumberHighlighter(QSyntaxHighlighter):
    def __init__(self, document):
        super().__init__(document)
        self.number_format = QTextCharFormat()
        self.number_format.setForeground(QColor("#2b6cb0"))
        self.pattern = re.compile(r"\d+")

    def highlightBlock(self, text):
        for match in self.pattern.finditer(text):
            self.setFormat(match.start(), match.end() - match.start(), self.number_format)


def format_covering(ranges, position):
    """Real, linear-scan 'does X fall within this range' idiom."""
    for r in ranges:
        if r.start <= position < r.start + r.length:
            return r.format
    return None


doc = QTextDocument()
highlighter = NumberHighlighter(doc)
doc.setPlainText("order 42 shipped, 7 remain")
highlighter.rehighlight()
app.processEvents()

ranges = doc.findBlockByNumber(0).layout().formats()

fmt_on_digit = format_covering(ranges, 7)   # inside "42"
fmt_on_letter = format_covering(ranges, 2)  # inside "order"

print("format found at a digit position:", fmt_on_digit is not None)
print("color at that digit:", fmt_on_digit.foreground().color().name())
print("format found at a letter position:", fmt_on_letter is not None)
```

**Real output, run this session:**
```
format found at a digit position: True
color at that digit: #2b6cb0
format found at a letter position: False
```

**What this proves:** the test located a real formatted range covering
position `7` (inside `"42"`) with exactly the color the highlighter set
(`#2b6cb0`), and correctly found **no** formatted range covering
position `2` (inside `"order"`, which the highlighter never touched) —
a complete, real, exact-position assertion about formatting state, with
no rendering, no screen, and no pixel comparison anywhere in the test.

## Mechanical Walkthrough

- `document.findBlockByNumber(0)` retrieves a real `QTextBlock` —
  Qt's own internal representation of one block of text (typically one
  line) within the document.
- `.layout()` returns that block's `QTextLayout` — the object Qt's own
  rendering pipeline consults when it eventually draws the block; it
  exists and is fully populated whether or not anything is ever
  actually rendered to a screen.
- `.formats()` returns a real, plain list of format-range objects — each
  one has a `.start`, a `.length`, and a `.format` (a real
  `QTextCharFormat`) — Qt's own already-computed record of exactly
  which formatting applies to which character range, maintained
  entirely independently of pixels.
- `format_covering(ranges, position)` is a small, real, linear scan:
  for each range, check whether the target `position` falls inside it
  (`start <= position < start + length`) — a direct, real instance of a
  common "does X fall within this interval" idiom, here applied to
  formatting ranges specifically.
- Because this inspects the document's own internal *model*, not a
  rendered *view* of it, the test is unaffected by font choice, screen
  resolution, operating system, or whether a display even exists at
  all — it runs identically in the fully headless environment these
  examples already use throughout (`pyside6-headless-gui-testing.md`).

## CS Lens

This is testing a system's **internal model state** directly, rather
than its **rendered output** — the same underlying principle behind
testing a web application's DOM structure or component state rather
than a rendered screenshot, or testing a database's actual rows rather
than a report generated from them. The model is the real source of
truth; the rendering is a downstream, derived *view* of it — testing
closer to the source of truth is both more direct and less fragile.

Also recognized in: React/DOM testing libraries that query rendered
elements' real attributes and text content rather than comparing
screenshots; any "snapshot the data, not the picture" testing
philosophy across UI frameworks generally.

## SE Lens

The real, practical tradeoff pixel/screenshot testing carries that this
technique avoids entirely: a screenshot-based test would need a real,
consistent rendering environment (fonts, DPI, anti-aliasing settings)
to produce stable, comparable images across different machines and CI
runners — a genuinely significant, ongoing maintenance cost. Testing
the document's own model instead needs none of that: the exact same
assertions pass identically on any machine capable of importing
PySide6 at all, headless or not, which is precisely why this project's
own test suite can run in CI with no real display attached.

## Connection

Builds directly on `pyside6-qtextcharformat-and-qcolor.md`
— the same `layout().formats()` technique that file's own isolated
example already used briefly to prove `setFormat` worked; this file is
where that technique gets its own full treatment, including the
`format_covering`-style linear scan a real test typically wraps it in.
Also connects to `pyside6-headless-gui-testing.md` — this technique is
part of *why* this project's highlighter tests can run fully headless,
not just its widget-construction tests.

## Try It Yourself

1. Add a second highlighted pattern to `NumberHighlighter` and write a
   test asserting **both** kinds of ranges are present with their
   correct, distinct formats — confirming `format_covering` (or a
   similar helper) generalizes past a single highlighted pattern.
2. Test a position that falls exactly at a range's boundary (`position
   == r.start + r.length`, one past the last highlighted character) and
   confirm it correctly reports "no format" — a real, worth-checking
   edge case for any interval-containment check.
3. Deliberately introduce a bug in `NumberHighlighter` (say, off-by-one
   the `match.start()` passed to `setFormat`) and confirm this test
   style catches it immediately with a wrong `start`/`length` — contrast
   how directly that failure would show up here versus how it might
   look in a screenshot diff instead.
