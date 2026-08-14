# Concept: Custom Context Menus (`QMenu`, `customContextMenuRequested`, `mapToGlobal`)

**What you'll understand by the end:** the real subsystem behind a
right-click context menu — `setContextMenuPolicy`, the
`customContextMenuRequested` signal, building a real `QMenu`, and why
showing it needs a **global** screen position rather than the local
widget coordinate the click itself reports.

**Prerequisites:** `pyside6-signals-and-slots.md`,
`pyside6-qabstractitemview-selectedindexes.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

A real right-click context menu needs to appear exactly at the point
the user clicked — but a widget only ever knows about a click in its
own **local** coordinate system (pixels from its own top-left corner),
while a menu, as an independent, real top-level popup window, needs to
know exactly where on the **entire screen** to appear.

## The Isolated Example

```python
import sys
from PySide6.QtCore import Qt, QPoint
from PySide6.QtWidgets import QApplication, QMenu, QTreeView
from PySide6.QtGui import QStandardItemModel, QStandardItem

app = QApplication.instance() or QApplication(sys.argv)

model = QStandardItemModel(2, 1)
model.setItem(0, 0, QStandardItem("report.txt"))
model.setItem(1, 0, QStandardItem("notes.md"))

view = QTreeView()
view.setModel(model)
view.setContextMenuPolicy(Qt.ContextMenuPolicy.CustomContextMenu)

triggered = []


def show_context_menu(position):
    menu = QMenu(view)
    action = menu.addAction("Open")
    action.triggered.connect(lambda: triggered.append("Open"))
    global_pos = view.viewport().mapToGlobal(position)
    print("local click position:", (position.x(), position.y()))
    print("translated to a real GLOBAL screen position:", (global_pos.x(), global_pos.y()))
    action.trigger()  # simulate a real click, since exec() would block for real input


view.customContextMenuRequested.connect(show_context_menu)

view.customContextMenuRequested.emit(QPoint(10, 10))

print("menu action fired:", triggered)
```

**Real output, run this session:**
```
local click position: (10, 10)
translated to a real GLOBAL screen position: (11, 11)
menu action fired: ['Open']
```

**What this proves:** the local click position `(10, 10)` (measured
from the view's own top-left corner) translated to a genuinely
different, real global screen coordinate via `mapToGlobal` — the exact
numbers depend on where the widget itself sits on screen, but the
point stands regardless: local and global are two real, distinct
coordinate systems, and `mapToGlobal` is the required real conversion
between them. The menu action fired correctly once triggered,
confirming the whole real chain — signal, menu construction, action —
works end to end.

## Mechanical Walkthrough

- `setContextMenuPolicy(Qt.ContextMenuPolicy.CustomContextMenu)` tells
  the widget: don't show any real default context menu on right-click
  — instead, emit a signal and let application code decide what to
  show.
- `customContextMenuRequested(position)` is the real signal that fires
  on a right-click (or the platform's equivalent), carrying the click's
  own **local** position (relative to the widget itself).
- `QMenu(parent)` constructs a real, empty popup menu; `.addAction(
  label)` adds a real, clickable entry to it, returning the new
  `QAction` so a real `.triggered` handler can be connected to it —
  the identical `QAction` object and signal mechanism
  `pyside6-signals-and-slots.md` already covers in full.
- `widget.mapToGlobal(local_point)` converts a **local**, widget-
  relative coordinate into a real, **global**, screen-relative one —
  necessary because `QMenu.exec(...)` (the real call that actually
  shows the menu and blocks until a choice is made, not used directly
  in this headless example) requires a global position to know exactly
  where on the physical screen to appear.
- `view.viewport()` is the real, actual widget receiving mouse events
  inside a scrollable view like `QTreeView` — clicks are reported
  relative to the *viewport*, not the outer view widget itself, which
  is why `mapToGlobal` is called on `view.viewport()` specifically,
  not `view`.

## CS Lens

This is a real, concrete instance of **coordinate system
translation** — the same underlying idea behind any UI system that
distinguishes a widget's own local rendering space from the screen's
absolute space (or, more generally, any transformation between a local
and a global/world frame of reference). A menu is a genuinely
independent top-level window, unaware of any other widget's own local
coordinate space — it can only be positioned in terms of the one
coordinate system every real window on screen shares: the screen's own
global one.

Also recognized in: `raycasting-screen-to-world-picking.md`'s own real
"turn a screen position into a scene position" translation (a
different, 3D real coordinate transform, the same underlying category
of problem); any GUI framework's local-to-global (or local-to-window,
window-to-screen) coordinate conversion utilities generally.

## SE Lens

The real, practical bug this mechanism prevents: positioning a context
menu using the click's own **local** coordinates directly (skipping
`mapToGlobal`) would place the menu near the screen's own top-left
corner (or some other consistently wrong location) rather than at the
actual click point — a real, visible, immediately-obvious bug the
moment the widget isn't positioned at the screen's own origin, which
is essentially always. The translation step isn't a defensive
nicety; it's the one real, correct way to make "the menu appears where
you clicked" true at all.

## Connection

Builds on `pyside6-signals-and-slots.md` (the identical `QAction`/
signal mechanism reused here for menu items) and
`pyside6-qabstractitemview-selectedindexes.md` — a real context menu
over a multi-selection view commonly reads the current selection first
(via `selectedIndexes()`) to decide what real actions to offer (a
different label for "Open" vs. "Open 3 Files").

## Try It Yourself

1. Add a second real menu item and confirm both appear, in order, and
   each fires its own independently-connected handler.
2. Replace `action.trigger()` (used here only to make this example
   runnable headlessly) with a real `menu.exec(global_pos)` call in a
   non-headless environment, and confirm a real, visible context menu
   appears exactly at your actual click position.
3. Compare `widget.mapToGlobal(point)` against its real inverse,
   `widget.mapFromGlobal(point)`, and confirm converting a point to
   global and back again returns the original real local coordinate
   unchanged.

## A Real Further Fact: `mapTo` — Between Two Widgets' Own Local Spaces, No Screen Involved

`mapToGlobal` solves "local coordinates → real screen coordinates."
A real, different, related need: converting a point from one widget's
own local space directly into a **different widget's** local space —
both still local, never touching the screen at all.

```python
import sys
from PySide6.QtCore import QPoint, Qt
from PySide6.QtWidgets import QApplication, QHBoxLayout, QPlainTextEdit, QWidget

app = QApplication.instance() or QApplication(sys.argv)

parent = QWidget()
layout = QHBoxLayout(parent)
left = QPlainTextEdit()
right = QPlainTextEdit()
layout.addWidget(left)
layout.addWidget(right)
parent.resize(600, 200)
parent.show()
app.processEvents()

local_point_in_viewport = QPoint(10, 10)
mapped_to_parent = left.viewport().mapTo(parent, local_point_in_viewport)
print("point in left's own viewport:", local_point_in_viewport)
print("same point, mapped into parent's coordinate space:", mapped_to_parent)
```

**Real output, run this session:**
```
point in left's own viewport: PySide6.QtCore.QPoint(10, 10)
same point, mapped into parent's coordinate space: PySide6.QtCore.QPoint(22, 22)
```

**What this proves:** the identical real point (`10, 10` relative to
`left`'s own viewport) genuinely lands at a different real coordinate
(`22, 22`) once expressed relative to `parent` instead — the
difference (`12, 12` here) is exactly `left`'s viewport's own real
offset within `parent`, confirming `mapTo` correctly accounts for
every ancestor step between the two widgets, the same real kind of
translation `mapToGlobal` does, just stopping at a different real
widget's own coordinate space instead of the screen.

**Real, practical use — drawing on top of two unrelated child
widgets:** a transparent overlay widget, stacked above two sibling
editors via `.raise_()`, needs to draw a line connecting a point
inside one editor's own viewport to a point inside the other's —
neither editor's own local coordinates mean anything to the overlay's
own `paintEvent`, so each point has to be mapped, via `mapTo`, into
the one shared coordinate space the overlay itself actually paints in
(its own parent's).

### Try It Yourself (further fact)

1. Call `right.viewport().mapTo(parent, QPoint(0, 0))` and confirm it
   reports a real, different offset than `left`'s own — direct proof
   each widget's own position within `parent` is tracked and mapped
   independently.
2. Compare `left.mapTo(parent, point)` against `left.viewport().mapTo
   (parent, point)` for the identical raw point — reasoning about why
   they differ (a `QPlainTextEdit` and its own `.viewport()` are two
   distinct real widgets, not the same coordinate space).
3. Look up `mapFrom` (`mapTo`'s real inverse) and confirm mapping a
   point from `parent`'s own space into `left`'s, then back again with
   `mapTo`, returns the original real coordinate unchanged.
