# Concept: `QTextCharFormat`/`QColor` — Building a Real `QSyntaxHighlighter`, and Standalone Use

**What you'll understand by the end:** the concrete Qt API for
describing text appearance — `QTextCharFormat` and `QColor` — both as
the two real pieces a `QSyntaxHighlighter` subclass supplies
(`setForeground`, `setFontItalic`, applied via the inherited
`self.setFormat(start, length, fmt)`), and as a genuinely independent
mechanism usable with **no** highlighter involved at all, applying a
format straight to a real `QTextCursor`.

**Prerequisites:** `template-method-pattern.md`,
`pyside6-qapplication-and-mainwindow.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Highlighting text based on its content (numbers, keywords, comments)
needs two real, separate pieces: a way to describe *what a highlighted
range should look like* (a color, a weight, italics), and a way to say
*which exact characters* that description applies to, every time the
text changes. `QSyntaxHighlighter` (per `template-method-pattern.md`'s
own Template Method structure) handles the "every time the text
changes" part automatically — this file covers the two real pieces a
subclass has to supply itself. `QTextCharFormat`/`QColor` aren't
actually tied to `QSyntaxHighlighter` at all, though — they're a real,
independent appearance-description mechanism, usable anywhere Qt
expects a text format.

## The Isolated Example: Via `QSyntaxHighlighter`

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
        self.number_format.setFontItalic(True)
        self.pattern = re.compile(r"\d+")

    def highlightBlock(self, text):
        for match in self.pattern.finditer(text):
            self.setFormat(match.start(), match.end() - match.start(), self.number_format)


doc = QTextDocument()
highlighter = NumberHighlighter(doc)
doc.setPlainText("order 42 shipped, 7 remain")
highlighter.rehighlight()
app.processEvents()

block = doc.findBlockByNumber(0)
ranges = block.layout().formats()
print("number of format ranges:", len(ranges))
for r in ranges:
    print(
        "start:", r.start, "length:", r.length,
        "color:", r.format.foreground().color().name(),
        "italic:", r.format.fontItalic(),
    )
```

**Real output, run this session:**
```
number of format ranges: 2
start: 6 length: 2 color: #2b6cb0 italic: True
start: 18 length: 1 color: #2b6cb0 italic: True
```

**What this proves:** exactly two real ranges got formatted — `start:
6, length: 2` (the two characters `"42"`) and `start: 18, length: 1`
(the one character `"7"`) — the exact positions and lengths of the two
real number-runs in `"order 42 shipped, 7 remain"`, and nowhere else.
Both ranges carry the real `#2b6cb0` color and italic styling from
`self.number_format`, proving `setFormat` genuinely attached that exact
format object to those exact character ranges, and only those.

## The Isolated Example: Standalone, With No Highlighter At All

```python
import sys
from PySide6.QtGui import QColor, QTextCharFormat, QTextCursor
from PySide6.QtWidgets import QApplication, QPlainTextEdit

app = QApplication.instance() or QApplication(sys.argv)

editor = QPlainTextEdit()
editor.setPlainText("alert: disk usage critical")

highlight = QTextCharFormat()
highlight.setBackground(QColor("#ffcccc"))
highlight.setForeground(QColor("#990000"))

cursor = editor.textCursor()
cursor.setPosition(0)
cursor.setPosition(len("alert:"), QTextCursor.MoveMode.KeepAnchor)
cursor.setCharFormat(highlight)

check_cursor = editor.textCursor()
check_cursor.setPosition(2)
check_cursor.setPosition(3, QTextCursor.MoveMode.KeepAnchor)
fmt = check_cursor.charFormat()
print("background inside the formatted range:", fmt.background().color().name())
print("foreground inside the formatted range:", fmt.foreground().color().name())

check_cursor2 = editor.textCursor()
check_cursor2.setPosition(10)
check_cursor2.setPosition(11, QTextCursor.MoveMode.KeepAnchor)
fmt2 = check_cursor2.charFormat()
print("background OUTSIDE the formatted range:", fmt2.background().color().name())
```

**Real output, run this session:**
```
background inside the formatted range: #ffcccc
foreground inside the formatted range: #990000
background OUTSIDE the formatted range: #000000
```

**What this proves:** `cursor.setCharFormat(highlight)` applied the
format **directly to the document's own real character data** — with
zero `QSyntaxHighlighter` anywhere in this example — and a completely
independent, freshly-retrieved cursor's own `.charFormat()` correctly
reports both the new background (`#ffcccc`) inside the formatted range
and the real, unformatted default (`#000000`) just outside it. This is
a genuinely different real mechanism from the highlighter example
above: `QSyntaxHighlighter.setFormat` writes to a *rendering overlay*
(only visible via `layout().formats()`, confirmed in
`pyside6-testing-text-formatting-via-document-layout.md` — **not**
reflected in `cursor.charFormat()` at all); `cursor.setCharFormat(...)`
instead writes directly into the document's own real, persistent
character formatting, which *is* what `.charFormat()` reports.

## Mechanical Walkthrough

- `QTextCharFormat()` describes **appearance**, not position — a
  reusable object built once with methods like `.setForeground(QColor(
  ...))` (text color), `.setBackground(QColor(...))` (highlight color
  behind the text), and `.setFontItalic(True)` (style). `QColor(
  "#2b6cb0")` takes a real, standard hex-string color code directly, no
  separate parsing needed.
- Inside a `QSyntaxHighlighter` subclass, `self.setFormat(start,
  length, fmt)` records a rendering-overlay range — Qt's own rendering
  and layout systems use it when drawing, but it's never written into
  the document's own actual character data.
- Applied directly via `QTextCursor.setCharFormat(fmt)` instead, the
  identical `QTextCharFormat` object is written straight into the
  document's real, persistent formatting for whatever range the cursor
  currently selects (established via `setPosition(...,
  KeepAnchor)`) — a genuinely different write path, with a genuinely
  different (and, for `.charFormat()` reads, more directly visible)
  real effect.
- Both paths accept the identical `QTextCharFormat` type — the object
  describing appearance is the same real class either way; only
  *how it gets applied*, and *how it can later be read back*, differs.

## CS Lens

This is a real, applied instance of separating **data** (a
`QTextCharFormat` describing *how something should look*, built once)
from **the logic that decides where it applies** — inside a
highlighter, that logic is `highlightBlock`, run fresh every time the
relevant text changes; used standalone, that logic is just whatever
code decides to call `cursor.setCharFormat(...)` once. The real,
worth-naming distinction between the two application paths mirrors a
broader real pattern: a **rendering overlay** (recomputed each time,
never persisted into the underlying data) versus a **direct data
mutation** (persisted into the model itself) — the same underlying
tension `pyside6-qtextedit-extraselections.md`'s own overlay mechanism
sits on the opposite side of from this file's second, direct-mutation
example.

Also recognized in: any styling system that separates a reusable style
definition (a CSS class, a design token — see `design-tokens-theming-
pattern.md`) from the logic deciding which elements that style applies
to.

## SE Lens

The real, practical value of building the format object once rather
than inside a hot code path: `highlightBlock` runs on *every* relevant
text change, possibly many times per keystroke — constructing a fresh
`QTextCharFormat` on every single match would be real, repeated,
avoidable work. The real, practical choice between the two application
paths shown here: a `QSyntaxHighlighter`'s overlay approach is right
when formatting is *derived* from content and needs to be recomputed
automatically as text changes (syntax coloring); direct
`cursor.setCharFormat(...)` is right when a specific, one-time
formatting decision needs to persist as part of the document's own
real state (rich-text editing, a user manually bolding a selection).

## Connection

Builds on `template-method-pattern.md` (the base class a highlighter
subclass completes) and `pyside6-qapplication-and-mainwindow.md`. The
real technique used to verify highlighter-applied formatting —
inspecting `document.findBlockByNumber(0).layout().formats()` directly
— is its own, fuller concept in `pyside6-testing-text-formatting-via-
document-layout.md`. Directly contrasted with
`pyside6-qtextedit-extraselections.md` — a third, real way to apply
colored formatting to text, distinct from both paths shown here.

## Try It Yourself

1. Add a second `QTextCharFormat`/pattern pair to `NumberHighlighter`
   (say, highlighting all-caps words in bold) inside the same
   `highlightBlock`, and confirm both real sets of ranges appear
   independently in the printed output.
2. Remove the `highlighter.rehighlight()` call and confirm the
   `ranges` list comes back empty — direct, real proof that
   highlighting doesn't happen synchronously the instant `setPlainText`
   is called; it's scheduled, and something (a real event loop, or this
   explicit call) has to actually let it run.
3. After running the standalone `cursor.setCharFormat(...)` example,
   also check `doc.findBlockByNumber(0).layout().formats()` (the
   highlighter-verification technique) against that same document —
   confirm it reports **no** ranges, direct, real proof the two
   application paths write to genuinely different places, checkable
   from either direction.

## A Third Real Facet: Generic Properties via `setProperty`/`property`

Beyond the dedicated methods shown so far (`setForeground`,
`setBackground`, `setFontItalic`), `QTextCharFormat` also exposes a
real, generic property mechanism for facets with no dedicated setter:

```python
fmt = QTextCharFormat()
fmt.setBackground(QColor("#fff3b0"))
print("default FullWidthSelection:", fmt.property(QTextCharFormat.Property.FullWidthSelection))
fmt.setProperty(QTextCharFormat.Property.FullWidthSelection, True)
print("after setProperty(True):", fmt.property(QTextCharFormat.Property.FullWidthSelection))
```

**Real output, run this session:**
```
default FullWidthSelection: None
after setProperty(True): True
```

**What this proves:** `FullWidthSelection` — a real, useful facet
that extends a highlighted background across an entire visual row
width (past the last real character on a short line), not just the
literal text span — has **no** dedicated `setFullWidthSelection(...)`
method the way color or italics do; it's set generically via
`setProperty(PropertyEnum, value)`, and starts as `None` (unset) until
explicitly given a value. This is a real, deliberate pattern for a
large class with dozens of possible real properties: dedicated methods
for the most commonly-used ones, a generic `setProperty`/`property`
pair for the rest, all sharing the identical underlying storage.

### Try It Yourself (third facet)

1. Apply a `QTextCharFormat` with `FullWidthSelection` set to a real,
   short line inside a wider text widget, and compare its visible
   highlight against an identical format with the property left unset
   — confirm the real, visible difference in how far the highlight
   extends.
2. Look up two or three other real `QTextCharFormat.Property` enum
   values with no dedicated setter method, and confirm each is
   settable through the identical generic `setProperty` mechanism.
3. Note that `QTextDocument.findBlockByLineNumber(n)` is a real,
   available sibling of `findBlockByNumber(n)` — confirm both return
   the identical block for a plain-text document with no soft line
   wrapping, and research what (if anything) distinguishes "line
   number" from "block number" when wrapping is involved.

## A Fourth Real Facet: Re-Theming at Runtime — Mutate the Existing Format, Then Force a Re-Highlight

Every format object shown so far was built once and never changed
again. A real, different situation — a user switching color themes
while a document is already open — needs the *same* highlighter
instance's *existing* format objects to change color live, with
already-highlighted text updating immediately.

```python
import sys
from PySide6.QtGui import QColor, QSyntaxHighlighter, QTextCharFormat, QTextDocument
from PySide6.QtWidgets import QApplication

app = QApplication.instance() or QApplication(sys.argv)


class WordHighlighter(QSyntaxHighlighter):
    def __init__(self, document):
        super().__init__(document)
        self.keyword_format = QTextCharFormat()
        self.keyword_format.setForeground(QColor("#2b6cb0"))

    def highlightBlock(self, text):
        if "STOP" in text:
            self.setFormat(text.index("STOP"), len("STOP"), self.keyword_format)


doc = QTextDocument()
highlighter = WordHighlighter(doc)
doc.setPlainText("program STOP here")
highlighter.rehighlight()
app.processEvents()

block = doc.findBlockByNumber(0)
ranges = block.layout().formats()
before_color = ranges[0].format.foreground().color().name()
print("color before re-theme:", before_color)

highlighter.keyword_format.setForeground(QColor("#f92672"))
highlighter.rehighlight()
app.processEvents()

block2 = doc.findBlockByNumber(0)
ranges2 = block2.layout().formats()
after_color = ranges2[0].format.foreground().color().name()
print("color after re-theme:", after_color)
```

**Real output, run this session:**
```
color before re-theme: #2b6cb0
color after re-theme: #f92672
```

**What this proves:** calling `self.keyword_format.setForeground(...)`
again on the exact same, already-existing `QTextCharFormat` object —
never creating a new one — genuinely changed the color every future
`setFormat` call would apply. `rehighlight()` (already established
elsewhere in this file's own first example) is what actually applies
that change to the *already-typed* text: without it, the mutated
`keyword_format` would only affect newly-typed text going forward,
leaving `"STOP"`'s already-rendered color stale until the next real
edit happened to re-trigger `highlightBlock` on its own line.

**Mechanical note — how this differs from every earlier example in
this file:** the first two examples' own point was that a *fresh*
`QTextCharFormat`, built once, gets applied to different ranges (via
`setFormat`) or written directly into the document (via
`setCharFormat`). This facet does neither — it mutates a format object
that's *already in use*, in place, then explicitly asks Qt to redraw
everything that already referenced it. `_formats` (a `dict` mapping
token types to format objects, elsewhere in this project's own real
highlighter) needs no rebuilding at all for *this specific* value to
change — every dict entry pointing at `self.keyword_format` already
sees the identical, now-recolored object, the same real aliasing
behavior `mutable-object-aliasing.md` describes generally, here used
deliberately.

## SE Lens, continued

The real, practical reason to mutate in place rather than replace with
a brand-new `QTextCharFormat` and re-register it: any other structure
already holding a reference to the *old* format object (a lookup
`dict`, another highlighter's own copy) would need to be found and
updated too, or it would silently keep showing the old color. Mutating
the one, shared object in place means every existing reference to it
automatically sees the new value — the same real tradeoff
`mutable-object-aliasing.md`'s own deliberate-use facet already names,
applied here specifically to live theme switching.

### Try It Yourself (fourth facet)

1. Skip the `highlighter.rehighlight()` call after mutating
   `keyword_format` and confirm `"STOP"`'s own rendered color in the
   already-typed text does **not** update — direct, real proof that
   mutating the format object alone changes future formatting, but
   never retroactively repaints text `setFormat` already ran against.
2. Create a *second* highlighter instance sharing the identical
   `keyword_format` object (rather than each building its own), mutate
   it once, and confirm both highlighters' own highlighted text changes
   color — real, further proof of the aliasing behavior this facet
   relies on.
3. Compare this facet directly against the file's own second, standalone
   example (`cursor.setCharFormat(...)`) — reason about why re-theming
   an entire document's worth of syntax coloring via the highlighter
   path (mutate one shared format, `rehighlight()` once) is dramatically
   cheaper than re-walking the document and calling `setCharFormat`
   individually on every previously-colored range.
