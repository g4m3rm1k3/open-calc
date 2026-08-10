# Concept: Painting a Custom Qt Widget (`paintEvent`, `QPainter`, Block Geometry)

**What you'll understand by the end:** the real, bundled set of Qt APIs
needed to paint a widget's own content directly — `paintEvent`,
`QPainter` (`.fillRect()`, `.setPen()`, `.drawText()`), and the block/
geometry queries (`firstVisibleBlock()`, `blockBoundingGeometry()`,
`blockBoundingRect()`, `contentOffset()`, `fontMetrics().
horizontalAdvance()`, `setViewportMargins()`) that feed it — bundled
together because none of these pieces mean much independent of the
others.

**Prerequisites:** `pyside6-qapplication-and-mainwindow.md`,
`pyside6-qplaintextedit-widget.md`, `delegation-pattern.md`,
`template-method-pattern.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Some real widgets need to draw their own, custom content — not text in
a text box, not a button's label, but arbitrary shapes and text placed
exactly where the widget decides. A real, common instance: a line-number
gutter alongside a text editor, where each visible line's number must
be drawn at exactly the vertical position that line is actually
scrolled to — a position that changes continuously as the user scrolls
or edits.

## The Isolated Example

A gutter widget that delegates its real geometry decisions to the
editor it's attached to (per `delegation-pattern.md`), and an editor
subclass that actually computes and paints line numbers:

```python
import sys
from PySide6.QtCore import QRect, QSize, Qt
from PySide6.QtGui import QColor, QPainter, QPixmap
from PySide6.QtWidgets import QApplication, QPlainTextEdit, QWidget

app = QApplication.instance() or QApplication(sys.argv)


class GutterWidget(QWidget):
    def __init__(self, editor):
        super().__init__(editor)
        self.editor = editor

    def sizeHint(self):
        return QSize(self.editor.gutter_width(), 0)

    def paintEvent(self, event):
        self.editor.paint_gutter(event)


class NumberedEditor(QPlainTextEdit):
    def __init__(self):
        super().__init__()
        self.gutter = GutterWidget(self)
        self.blockCountChanged.connect(self.update_margins)
        self.updateRequest.connect(self.update_gutter)
        self.update_margins()

    def gutter_width(self):
        digits = len(str(max(1, self.blockCount())))
        return 10 + self.fontMetrics().horizontalAdvance("9") * digits

    def update_margins(self):
        self.setViewportMargins(self.gutter_width(), 0, 0, 0)

    def update_gutter(self, rect, dy):
        self.gutter.update(0, rect.y(), self.gutter.width(), rect.height())

    def resizeEvent(self, event):
        super().resizeEvent(event)  # let QPlainTextEdit do its own real work FIRST
        rect = self.contentsRect()
        self.gutter.setGeometry(QRect(rect.left(), rect.top(), self.gutter_width(), rect.height()))

    def paint_gutter(self, event):
        painter = QPainter(self.gutter)
        painter.fillRect(event.rect(), QColor("#f0f0f0"))

        block = self.firstVisibleBlock()
        block_number = block.blockNumber()
        top = self.blockBoundingGeometry(block).translated(self.contentOffset()).top()
        bottom = top + self.blockBoundingRect(block).height()

        painter.setPen(QColor("#888888"))
        while block.isValid() and top <= event.rect().bottom():
            if block.isVisible() and bottom >= event.rect().top():
                number = str(block_number + 1)
                painter.drawText(
                    0, int(top), self.gutter.width() - 4, self.fontMetrics().height(),
                    Qt.AlignmentFlag.AlignRight, number,
                )
            block = block.next()
            top = bottom
            bottom = top + self.blockBoundingRect(block).height()
            block_number += 1
        painter.end()


editor = NumberedEditor()
editor.resize(400, 300)
editor.show()

width_at_1_line = editor.gutter_width()
editor.setPlainText("\n".join(f"line {i}" for i in range(150)))
app.processEvents()
width_at_150_lines = editor.gutter_width()

print("gutter width with 1 line:  ", width_at_1_line)
print("gutter width with 150 lines:", width_at_150_lines)
print("gutter widened for the extra digit:", width_at_150_lines > width_at_1_line)

pixmap = QPixmap(editor.gutter.size())
editor.gutter.render(pixmap)
bg_pixel = pixmap.toImage().pixelColor(editor.gutter.width() - 2, 5)
print("background pixel color (should be the fillRect color):", bg_pixel.name())
```

**Real output, run this session:**
```
gutter width with 1 line:   22
gutter width with 150 lines: 46
gutter widened for the extra digit: True
background pixel color (should be the fillRect color): #f0f0f0
```

**What this proves:** the gutter's real width **grew** — `22` to `46`
— purely from adding enough lines to need a third digit (`150` has 3
digits; a single-line document needs only 1), directly confirming
`gutter_width()`'s digit-counting math actually drives real, changing
geometry rather than using a fixed guess. Rendering the real gutter
widget into a `QPixmap` and sampling an actual pixel confirms
`painter.fillRect(...)` genuinely painted the real background color
(`#f0f0f0`) onto the real widget surface — not merely called without
error, but visibly, measurably present in the rendered result.

## Mechanical Walkthrough

- `paintEvent(event)` is a real, Qt-called **hook method** (per
  `template-method-pattern.md`'s own framing) — Qt's own painting
  system calls it automatically whenever a widget needs to redraw
  itself (first shown, resized, or explicitly told to update), passing
  a `QPaintEvent` whose `.rect()` names exactly which region needs
  repainting.
- `QPainter(self.gutter)` is a real, temporary drawing context bound to
  one specific widget — every draw call made through it (`fillRect`,
  `setPen`, `drawText`) paints directly onto that widget's real surface,
  only valid for as long as this one `paintEvent` call is running.
- `.fillRect(rect, color)` paints a solid rectangle — used here as the
  gutter's real background, painted fresh on every repaint.
- `.setPen(color)` sets the color subsequent drawing operations
  (`drawText`) will use — Qt's `QPainter` carries this as ongoing state
  across multiple draw calls, not passed as an argument each time.
- `.drawText(x, y, width, height, alignment, text)` draws real text
  inside a real rectangle; `Qt.AlignmentFlag.AlignRight` right-aligns
  each line number within its own row — the same real bitmask-flag
  mechanism as `bitwise-or-flag-combination.md`, here used with a
  single flag rather than a combination.
- `firstVisibleBlock()` returns the real first block of text currently
  scrolled into view — painting starts there, not at the document's
  actual first line, since only visible lines need numbers drawn.
- `blockBoundingGeometry(block).translated(contentOffset())` computes
  a block's real, on-screen vertical position, accounting for both the
  document's own internal layout and any scroll offset — `top` and
  `bottom` are accumulated across the loop exactly the way
  `LessonSchema.md`'s Execution Trace trigger describes: each
  iteration's `top` becomes the next iteration's starting point,
  building on the previous result rather than being computed fresh.
- `fontMetrics().horizontalAdvance("9")` measures the real, current
  font's pixel width for a specific character — used to size the
  gutter proportionally to how wide digits actually render in whatever
  font is active, rather than a guessed fixed width.
- `setViewportMargins(left, top, right, bottom)` reserves real screen
  space on the editor's own edge so the gutter has somewhere to sit
  without overlapping the actual text content.
- `resizeEvent` calls `super().resizeEvent(event)` **first** — the
  parent class's own real resize logic runs before this subclass adds
  its own step (repositioning the gutter) — the real "extend, not just
  initialize" facet of `super()` from `python-inheritance-and-super.md`.

## CS Lens

This is **immediate-mode 2D rendering**: each `paintEvent` call
recomputes and redraws everything needed for the requested region from
current state, from scratch — there's no persistent "line number
object" sitting on screen being moved; each repaint walks the currently
visible blocks and draws fresh. This differs from retained-mode
graphics systems (where you build a persistent scene graph once and the
system redraws it for you) — Qt's widget painting is immediate-mode,
putting the responsibility for figuring out *what* needs drawing, every
time, on the widget's own `paintEvent`.

Also recognized in: HTML5 Canvas's own 2D drawing API (immediate-mode,
the identical redraw-from-scratch-on-each-frame model); any game's
per-frame render loop, which recomputes what to draw from current game
state on every single frame rather than persisting drawn shapes.

## SE Lens

The real, practical reason these APIs are taught together rather than
separately: `paintEvent` alone is meaningless without something to
paint with (`QPainter`); `QPainter`'s calls are meaningless without
knowing *where* on screen a given line of text actually is
(`blockBoundingGeometry`, `contentOffset`); and the gutter's own size
has to react to real, changing content (`gutter_width()`'s digit count)
via `setViewportMargins` to avoid overlapping the text it sits next to.
Teaching any one piece without the others would leave a reader able to
recite an API without being able to build the real, working feature
they're all actually for.

## Connection

Builds on `pyside6-qplaintextedit-widget.md`, `delegation-pattern.md`
(the gutter/editor split), and `template-method-pattern.md`
(`paintEvent`, `sizeHint`, and `resizeEvent` are all real, Qt-called
hook methods). The `resizeEvent`'s `super().resizeEvent(event)`-then-
extend shape is the real, applied instance of `python-inheritance-and-
super.md`'s second facet. The block-walking `while` loop, accumulating
`top`/`bottom` across iterations, is exactly the shape `python-
iterators.md` and `fold-reduce-pattern.md` both describe in the
abstract — each iteration builds on the previous one's result, not
independent of it.

## Try It Yourself

1. Change `gutter_width()`'s padding constant (`10`) to something
   larger and confirm, via the same rendered-pixmap technique above,
   that the gutter's real, measured width changes accordingly.
2. Add a second real color — highlight the *current* line's number
   differently (a different `setPen` color, checked against
   `self.textCursor().blockNumber()`) — and verify with a real pixel
   sample that the highlighted row's text pixel differs from an
   unhighlighted row's.
3. Remove `super().resizeEvent(event)` from `resizeEvent` and resize the
   editor — observe what real, incorrect behavior results (the parent
   class's own internal layout logic never runs), connecting directly
   back to why `python-inheritance-and-super.md`'s "call the real
   parent method" facet matters in an *event handler*, not just an
   `__init__`.
