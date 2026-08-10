# Concept: Composing a Custom Widget from Children via a Layout Manager

**What you'll understand by the end:** how to build a real, reusable
custom widget by arranging several real child widgets (`QLineEdit`,
`QPushButton`, `QLabel`, ...) inside a layout manager, and how this is
a genuinely different real construction technique from painting a
widget's own content directly.

**Prerequisites:** `pyside6-qapplication-and-mainwindow.md`,
`pyside6-custom-widget-painting.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Some real, custom widgets need to be built from several existing,
interactive real widgets working together (a search bar with a text
box, a button, and a status label) — not drawn as custom shapes and
text the way a line-number gutter is. Manually computing and setting
each child's pixel position and size would be real, tedious, and fragile
work, breaking the moment a window resizes or a child's own size
changes.

## The Isolated Example

```python
import sys
from PySide6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout,
    QLineEdit, QPushButton, QLabel,
)

app = QApplication.instance() or QApplication(sys.argv)


class SearchBar(QWidget):
    def __init__(self):
        super().__init__()
        self.query_box = QLineEdit()
        self.next_button = QPushButton("Next")
        self.status_label = QLabel("0 matches")

        layout = QHBoxLayout(self)
        layout.setContentsMargins(4, 4, 4, 4)
        layout.setSpacing(6)
        layout.addWidget(self.query_box)
        layout.addWidget(self.next_button)
        layout.addWidget(self.status_label)


bar = SearchBar()
print("SearchBar's own layout has", bar.layout().count(), "child widgets")
for i in range(bar.layout().count()):
    item = bar.layout().itemAt(i)
    print(" ", type(item.widget()).__name__)

print("query_box's real parent is the SearchBar:", bar.query_box.parent() is bar)
```

**Real output, run this session:**
```
SearchBar's own layout has 3 child widgets
  QLineEdit
  QPushButton
  QLabel
query_box's real parent is the SearchBar: True
```

**What this proves:** `SearchBar`'s own layout genuinely holds all
three real child widgets, in the exact order they were added, and each
child's real `.parent()` is the `SearchBar` itself — `addWidget(...)`
didn't just make them visually appear inside `SearchBar`, it
established a genuine, real parent/child ownership relationship Qt
itself tracks.

## Mechanical Walkthrough

- `QHBoxLayout(self)` creates a real, horizontal layout manager and
  immediately installs it *as* `self`'s own layout — from this point
  on, `self`'s real size and shape is computed by arranging whatever
  widgets get added to this layout, not decided by hand.
- `.addWidget(widget)` adds a real, existing widget as a managed child
  — the layout takes over deciding its real position and size within
  the parent, recalculating automatically whenever the parent resizes
  or a child's own size hint changes.
- `.setContentsMargins(...)`/`.setSpacing(...)` control real, uniform
  spacing — the gap between the layout's own edge and its children, and
  the gap between children themselves — without any manual pixel-math
  in the widget's own code.
- `QVBoxLayout`/`QHBoxLayout` are real, complementary layout types —
  vertical and horizontal stacking respectively — commonly nested
  inside each other (a `QVBoxLayout` containing a `QHBoxLayout` as one
  of its own rows) to build genuinely two-dimensional real arrangements.
- This is a fundamentally different real construction technique from
  `pyside6-custom-widget-painting.md`'s own approach: that file's
  `LineNumberArea` has no real children at all — it draws its own
  content directly via `paintEvent`/`QPainter`. `SearchBar` has no
  custom painting code anywhere — its entire appearance comes from real,
  pre-built child widgets a layout manager arranges automatically.

## CS Lens

This is **declarative layout**: the code states *what* widgets should
exist and *how they relate* (side by side, stacked, spaced how far
apart) rather than *computing* exact pixel positions and sizes
directly. The layout manager itself is a real, separate algorithm
(different layout types implement genuinely different real arrangement
strategies) that solves the actual positioning problem once, reused by
every widget that adopts it, rather than every custom widget
re-deriving its own positioning math.

Also recognized in: CSS Flexbox/Grid (`css-flexbox-layout.md`,
`css-grid-layout.md`) solving the identical real problem for the web —
declaring relationships between elements rather than computing pixel
coordinates by hand; nearly every real GUI toolkit's own layout-manager
concept (Swing's `LayoutManager`, Android's `LinearLayout`/
`ConstraintLayout`).

## SE Lens

The real, practical payoff: `SearchBar` never needs to recompute
anything when its own window resizes, when the font changes a button's
natural width, or when a new child gets added later — the layout
manager recalculates automatically, every time. The real, concrete
contrast with `pyside6-custom-widget-painting.md`'s own approach: a
gutter drawing real numbers has no natural real "child widgets" to
arrange — it genuinely needs custom painting; a toolbar arranging real,
interactive controls has no real custom visuals of its own — it
genuinely needs layout composition. Recognizing which real situation a
given custom widget is in is the actual design decision, not a
stylistic preference.

## Connection

Builds on `pyside6-qapplication-and-mainwindow.md`. Directly contrasted
with `pyside6-custom-widget-painting.md` — two genuinely different,
real ways to build a custom Qt widget, chosen based on what the widget
actually needs to do (draw custom content vs. arrange real interactive
children).

A real, second, applied confirmation of this file's own second-facet
mechanical note (`isHidden()` over `isVisible()` in a headless test):
a real "only recompute an expensive embedded view while it's actually
open" feature was deliberately gated on an explicit, hand-tracked
boolean flag rather than `QWidget.isVisible()` — the code's own real
comment states the exact reason directly, confirmed by this file's own
mechanical note: `isVisible()` depends on the *entire* real ancestor
chain up through a genuinely shown top-level window, which is never
true under `pytest` (no real window is ever shown), so it would report
`False` unconditionally there regardless of the panel's own real,
intended open/closed state.

## Try It Yourself

1. Nest a `QVBoxLayout` containing two `QHBoxLayout` rows (each with its
   own child widgets) and confirm the real, two-dimensional arrangement
   this produces, with no manual position/size code anywhere.
2. Call `bar.resize(50, 50)` (deliberately too small for the real
   content) in a non-headless environment and observe how the layout
   manager handles the real space constraint — confirm it doesn't
   crash or silently drop a child.
3. Add a widget directly as a child (`QLabel("extra", bar)`) **without**
   going through `addWidget` — confirm it becomes a real Qt child (via
   `.parent()`) but is **not** managed or positioned by the layout at
   all, a real, concrete distinction between "is a Qt child" and "is
   managed by this layout."

## A Second Real Facet: a Bare Layout vs. a Widget Wrapping Its Own Layout

`addLayout(...)` and `addWidget(...)` both add real content to a
parent layout — but they're not interchangeable. The real, concrete
rule: whatever needs to be shown or hidden **as one unit** must be a
real `QWidget`; a purely organizational grouping with nothing to
individually toggle can stay a bare layout.

```python
class Toolbar(QWidget):
    def __init__(self):
        super().__init__()

        # find_row: a BARE layout, no QWidget of its own -- purely
        # organizational, always visible, nothing to individually hide.
        find_row = QHBoxLayout()
        find_row.addWidget(QLineEdit())
        find_row.addWidget(QPushButton("Find"))

        # replace_row: a REAL QWidget wrapping its own layout --
        # because it needs to be shown/hidden as one whole unit.
        self.replace_row = QWidget()
        replace_layout = QHBoxLayout(self.replace_row)
        replace_layout.addWidget(QLineEdit())
        replace_layout.addWidget(QPushButton("Replace"))

        outer = QVBoxLayout(self)
        outer.addLayout(find_row)
        outer.addWidget(self.replace_row)

        self.replace_row.setVisible(False)


bar = Toolbar()
bar.show()  # a top-level widget must actually be shown for isVisible() to mean anything

print("replace_row is a real widget:", isinstance(bar.replace_row, QWidget))
print("replace_row starts hidden:", not bar.replace_row.isVisible())

bar.replace_row.setVisible(True)
print("replace_row shown after setVisible(True):", bar.replace_row.isVisible())

find_row_item = bar.layout().itemAt(0)
print("a bare layout item has setVisible:", hasattr(find_row_item, "setVisible"))
```

**Real output, run this session:**
```
replace_row is a real widget: True
replace_row starts hidden: True
replace_row shown after setVisible(True): True
a bare layout item has setVisible: False
```

**What this proves:** `replace_row`, a genuine `QWidget`, correctly
started hidden and could be shown again with a real `.setVisible(True)`
call. `find_row`'s own layout item — never wrapped in a `QWidget` at
all — has **no** `setVisible` method whatsoever; there's nothing there
capable of being individually shown or hidden, because a bare layout
isn't a real, addressable widget, just an arrangement instruction.

**Mechanical note:** `isVisible()` reflects not just a widget's own
explicit visibility flag but its **entire parent chain** — it only
reports `True` once every ancestor, up through a real, shown top-level
window, is also visible; this is why the example calls `bar.show()`
first, and why `isHidden()` (checking only the widget's own explicit
flag, ignoring ancestors) is sometimes the more useful real check in a
headless test that never shows a real top-level window.

### Try It Yourself (second facet)

1. Try calling `.hide()` on `find_row` directly (the bare layout, not
   `replace_row`) and observe the real `AttributeError` this raises —
   direct, concrete proof it has no such method.
2. Wrap `find_row` in its own `QWidget` too (mirroring `replace_row`'s
   construction) and confirm it can now be shown/hidden as a unit the
   identical way — the distinction is about what a piece of UI
   *needs*, not an inherent property of what it contains.
3. Check `bar.replace_row.isHidden()` versus `bar.replace_row.
   isVisible()` in a version of this script that never calls
   `bar.show()` at all — confirm `isHidden()` still correctly reports
   the widget's own explicit state while `isVisible()` stays `False`
   regardless, per this file's own mechanical note above.

## A Third Real Facet: `insertWidget` — Adding Before a Specific Item, Not Always Last

Every `addWidget` call so far appended to the real, current end of a
layout. A real, common need is keeping one specific item — often a
trailing stretch — always last, while new content keeps arriving
*before* it:

```python
container = QWidget()
layout = QHBoxLayout(container)
layout.addWidget(QLabel("first"))
layout.addStretch()  # a trailing stretch, meant to always stay last


def label_names():
    names = []
    for i in range(layout.count()):
        item = layout.itemAt(i)
        w = item.widget()
        names.append(type(w).__name__ if w else "stretch")
    return names


print("before insert:", label_names())

layout.insertWidget(layout.count() - 1, QPushButton("new"))
print("after insertWidget(count()-1, ...):", label_names())

layout.addWidget(QPushButton("appended"))
print("after a plain addWidget (appends at the very end):", label_names())
```

**Real output, run this session:**
```
before insert: ['QLabel', 'stretch']
after insertWidget(count()-1, ...): ['QLabel', 'QPushButton', 'stretch']
after a plain addWidget (appends at the very end): ['QLabel', 'QPushButton', 'stretch', 'QPushButton']
```

**What this proves:** `insertWidget(layout.count() - 1, ...)` placed
the new button genuinely **before** the trailing stretch — `count() -
1` is real, live shorthand for "the current last position," so the new
button landed second-to-last, correctly keeping the stretch itself
last. A plain `addWidget` afterward, by contrast, genuinely appended
**after** the stretch — real, direct proof the two calls place content
at different real positions, not interchangeably.

**Mechanical note:** `layout.count() - 1` is evaluated **fresh**, at
the moment `insertWidget` is called — it's real, current position math,
not a fixed index recorded once — so this same call correctly keeps
inserting new content just before the stretch no matter how many other
real widgets have already been added earlier.

### Try It Yourself (third facet)

1. Call `insertWidget(layout.count() - 1, ...)` a second time, adding
   yet another widget, and confirm the stretch stays last after both
   insertions — direct, real proof the "always before the trailing
   item" pattern holds regardless of how many times it's used.
2. Try `insertWidget(0, ...)` instead, and confirm the new widget lands
   at the very **front** of the layout instead — `insertWidget`'s own
   index argument is a real, absolute position, not specific to "before
   the last item."
3. Explain, in your own words, why `layout.addWidget(...)` alone would
   be the wrong real choice for this file's own trailing-stretch
   scenario — what would go visually wrong if new content were simply
   appended after the stretch instead of inserted before it?

## A Fourth Real Facet: A Bare Layout's Own `addStretch()` Can Bubble Its Size Policy Upward

This file's own second facet gave one real reason to wrap content in a
`QWidget` rather than leaving it a bare layout: needing to show/hide it
as a unit. A real, different reason: a bare layout containing its own
`addStretch()` can make the *parent* layout treat that whole region as
vertically expanding — even when the surrounding code never asked for
that — silently pushing sibling content away from where it was meant
to stay anchored.

```python
import sys
from PySide6.QtWidgets import QApplication, QHBoxLayout, QLabel, QVBoxLayout, QWidget

app = QApplication.instance() or QApplication(sys.argv)


def build(use_bare_layout_with_stretch: bool) -> QWidget:
    graph = QLabel("graph")
    graph.setFixedHeight(40)

    labels_column = QVBoxLayout()
    labels_column.addWidget(QLabel("A"))
    labels_column.addWidget(QLabel("B"))
    if use_bare_layout_with_stretch:
        labels_column.addStretch()

    content_row = QHBoxLayout()
    if use_bare_layout_with_stretch:
        content_row.addLayout(labels_column)
    else:
        wrapper = QWidget()
        wrapper.setLayout(labels_column)
        wrapper.setFixedHeight(graph.height())
        content_row.addWidget(wrapper)
    content_row.addWidget(graph, 1)

    container = QWidget()
    outer = QVBoxLayout(container)
    outer.addLayout(content_row)
    outer.addWidget(QLabel("status"))
    return container


with_stretch = build(True)
without_stretch = build(False)
with_stretch.resize(300, 300)  # far more height than either actually needs
without_stretch.resize(300, 300)
with_stretch.show()
without_stretch.show()
app.processEvents()

graph_with = with_stretch.layout().itemAt(0).layout().itemAt(1).widget()
graph_without = without_stretch.layout().itemAt(0).layout().itemAt(1).widget()
print("WITH addStretch in the nested layout -- graph's own y position:", graph_with.y())
print("WITHOUT (wrapped in a fixed-height widget) -- graph's own y position:", graph_without.y())
```

**Real output, run this session:**
```
WITH addStretch in the nested layout -- graph's own y position: 121
WITHOUT (wrapped in a fixed-height widget) -- graph's own y position: 11
```

**What this proves:** both versions place an identical, real
`40`px-tall `graph` label inside an identical `300`x`300` container —
genuinely more space than either needs. With the nested `labels_column`
left as a bare layout containing its own `addStretch()`, `graph` ends
up at `y=121` — vertically **centered** in the extra real space, far
from the top-anchored labels beside it. Wrapped in a fixed-height
`QWidget` instead (no `addStretch()` needed at all, since the wrapper's
own explicit height already bounds it), `graph` stays flush near the
top (`y=11`) regardless of how much extra real space the container is
given.

**Mechanical note — why this happens:** `addLayout(labels_column)`
doesn't just insert `labels_column`'s own items — it lets
`labels_column`'s own **size policy** (as an entity) participate in
`content_row`'s layout calculation. A trailing `addStretch()` inside
`labels_column` is itself a real, sizeable, vertically-expanding
layout item, which makes `labels_column` as a whole report itself as
willing to absorb extra vertical space — and `content_row`, having no
better information, distributes real leftover space accordingly,
pulling `graph` (sized relative to that now-expanding sibling) down
into that vertical center. A `QWidget` wrapping the identical content,
given an explicit `setFixedHeight(...)`, reports a real, fixed size
hint instead — nothing about it looks expandable to the parent layout,
so no leftover space gets attributed to it, and `graph` stays anchored
exactly where it was placed.

**The real, practical fix, restated from this project's own actual
history:** removing the unnecessary trailing `addStretch()` (nothing
needed padding out; the wrapping widget's own fixed height already
does the real job) and wrapping the nested layout in a `QWidget` with
an explicit fixed height, matching this file's own second facet's
general "needs to be its own real widget" pattern — applied here for a
size-policy-containment reason, not a show/hide reason.

### Try It Yourself (fourth facet)

1. Keep the bare layout but remove only the `addStretch()` call (no
   `QWidget` wrapper) and re-run — reasoning about whether `graph`
   stays anchored correctly even without wrapping, now that nothing
   inside `labels_column` claims to want extra space.
2. Add `labels_column.setSizeConstraint(QLayout.SizeConstraint.
   SetFixedSize)` instead of wrapping in a widget, and compare its
   real effect against this facet's own wrapping fix — researching
   what real tradeoff exists between constraining a layout directly
   versus containing it inside a fixed-height widget.
3. Connect this facet directly back to `pyside6-qsizepolicy.md`'s own
   whole-file theme — write one sentence on why a *layout* (not just a
   *widget*) can effectively carry its own real size policy once it
   contains a stretch item, extending that file's own "don't hardcode,
   but also don't accidentally claim more space than intended" lesson
   one level further.
