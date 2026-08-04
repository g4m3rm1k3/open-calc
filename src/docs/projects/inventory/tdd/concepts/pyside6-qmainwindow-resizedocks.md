# Concept: `QMainWindow.resizeDocks()` — Setting a Dock's Real Default Size

**What you'll understand by the end:** how to give a `QDockWidget` a
specific, real starting size via `QMainWindow.resizeDocks(...)`,
instead of leaving it to whatever size Qt's own layout happens to pick.

**Prerequisites:** `pyside6-qapplication-and-mainwindow.md`,
`pyside6-composing-a-widget-from-children-via-layout.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

A real, docked panel (a file browser, a properties pane) needs a
sensible default width the moment a window first opens — too narrow
and its content is unusable; too wide and it crowds out the window's
real main content. Qt's own automatic layout picks *some* real size by
default, but not necessarily the one an application actually wants.

## The Isolated Example

```python
import sys
from PySide6.QtCore import Qt
from PySide6.QtWidgets import QApplication, QDockWidget, QListWidget, QMainWindow, QTextEdit

app = QApplication.instance() or QApplication(sys.argv)

window = QMainWindow()
window.resize(800, 600)
window.setCentralWidget(QTextEdit())

dock = QDockWidget("Files")
dock.setWidget(QListWidget())
window.addDockWidget(Qt.DockWidgetArea.LeftDockWidgetArea, dock)
window.show()
app.processEvents()

print("dock width BEFORE resizeDocks:", dock.width())

window.resizeDocks([dock], [280], Qt.Orientation.Horizontal)
app.processEvents()

print("dock width AFTER resizeDocks:", dock.width())
```

**Real output, run this session:**
```
dock width BEFORE resizeDocks: 256
dock width AFTER resizeDocks: 280
```

**What this proves:** before `resizeDocks`, Qt's own automatic layout
had already picked a real, working width (`256`) on its own — not
wrong, just not necessarily the application's own intended default.
After the real `resizeDocks` call, the dock's genuine, measured width
changed to exactly `280` — the application-specified value, not a
request Qt merely considered.

## Mechanical Walkthrough

- `QMainWindow.resizeDocks(docks, sizes, orientation)` takes three real
  arguments: a list of dock widgets, a matching list of target sizes
  (in pixels), and an orientation (`Qt.Orientation.Horizontal` for
  width, `Qt.Orientation.Vertical` for height) — the two lists are
  matched up **positionally**, so `docks[i]`'s target size is
  `sizes[i]`.
- Calling it with a single-element list for both, as here, sets one
  specific dock's width directly; it can also resize several docks
  sharing the same screen edge at once, in a single real call.
- The dock must already be added to the window (via `addDockWidget`)
  and the window's own layout must have actually run at least once
  (confirmed here via `app.processEvents()`, per `event-loop.md`'s own
  "the layout system needs the event loop to actually turn" idea,
  already established for `QFileSystemModel`'s async load) before
  `resizeDocks` reliably takes effect.
- `Qt.Orientation.Horizontal`/`.Vertical` is the identical real,
  fully-qualified nested-enum form `python-mypy-static-type-checking.md`'s
  Step 13 context already established as the modern, correct spelling.

## CS Lens

This is a real, direct instance of an application overriding a layout
system's own default heuristic with an explicit, intentional
constraint — the same underlying idea as CSS's own explicit `width`
overriding a browser's default auto-sizing, or a spreadsheet's manual
column-width override replacing its own auto-fit calculation. A layout
system's automatic choices are real, sensible defaults, not
unchangeable decisions — most real layout APIs provide exactly this
kind of escape hatch for when a specific, intentional size actually
matters more than what the automatic algorithm would pick.

Also recognized in: CSS's `flex-basis` overriding a flex item's
natural content-based size; any GUI toolkit's own "set the preferred/
initial size" API for a panel inside an automatically-managed layout.

## SE Lens

The real, practical reason this matters at first launch specifically:
a brand-new user, opening the application for the very first time, has
no saved window-layout state at all — whatever size Qt's own layout
picks by default is genuinely what they see. Calling `resizeDocks`
once, right after construction, ensures that very first real
impression has a sensible, chosen width rather than an arbitrary one
that happened to fall out of the layout algorithm's own internal
defaults.

## Connection

Builds on `pyside6-qapplication-and-mainwindow.md` (dock widgets are
one of the several built-in `QMainWindow` regions that file's own
second facet, the status bar, already introduced) and
`pyside6-composing-a-widget-from-children-via-layout.md`. Relies on
the same real "the layout needs the event loop to run" idea
`pyside6-model-view-with-qfilesystemmodel.md` establishes for async
loading, here applied to layout computation instead.

## Try It Yourself

1. Add a second dock on the same edge and call `resizeDocks` with both
   docks and two matching target widths in one call — confirm both
   real widths apply correctly at once.
2. Try calling `resizeDocks` **before** `window.show()`/
   `app.processEvents()` and observe whether the real, resulting width
   still lands correctly — connecting directly to this file's own
   mechanical note about the layout needing to have actually run.
3. Resize the whole window smaller than the requested dock width
   afterward, and observe what real, sensible behavior Qt's own layout
   falls back to when the explicit request and the available real
   space conflict.

## A Second Real Facet: Grouping Docks with `tabifyDockWidget`

As a real application accumulates more than one or two dockable
panels, letting each permanently claim its own strip of screen space
stops scaling. `tabifyDockWidget` groups several docks into one
shared, tabbed region instead:

```python
window = QMainWindow()
window.setCentralWidget(QTextEdit())

explorer_dock = QDockWidget("Explorer")
explorer_dock.setWidget(QListWidget())
window.addDockWidget(Qt.DockWidgetArea.LeftDockWidgetArea, explorer_dock)

check_dock = QDockWidget("Machine Check")
check_dock.setWidget(QListWidget())
window.addDockWidget(Qt.DockWidgetArea.LeftDockWidgetArea, check_dock)

print("before tabifyDockWidget, docks grouped with explorer_dock:",
      [d.windowTitle() for d in window.tabifiedDockWidgets(explorer_dock)])

window.tabifyDockWidget(explorer_dock, check_dock)
window.show()

print("after tabifyDockWidget, docks grouped with explorer_dock:",
      [d.windowTitle() for d in window.tabifiedDockWidgets(explorer_dock)])

explorer_dock.raise_()
print("explorer_dock is the real, active/visible tab:", explorer_dock.isVisible())
```

**Real output, run this session:**
```
before tabifyDockWidget, docks grouped with explorer_dock: []
after tabifyDockWidget, docks grouped with explorer_dock: ['Machine Check']
explorer_dock is the real, active/visible tab: True
```

**What this proves:** before `tabifyDockWidget`, `window.
tabifiedDockWidgets(explorer_dock)` correctly reports an empty list —
the two docks are independent, each with its own real space. After
the call, it correctly reports `["Machine Check"]` — the two docks now
genuinely share one screen region, switchable via real, visible tabs,
the same UI shape `pyside6-qtabwidget.md`'s own tabs provide for
document pages, here applied to whole dockable panels instead.
`raise_()` brought `explorer_dock` to the front as the real, active
tab within that shared group.

**Mechanical note:** `tabifyDockWidget(first, second)` requires both
docks to already occupy the **same** real dock area (both added via
`Qt.DockWidgetArea.LeftDockWidgetArea` here) — grouping docks from two
different real screen edges into one tabbed region isn't a real,
supported operation.

### Try It Yourself (second facet)

1. Add a real, third dock and tabify it into the same group — confirm
   `tabifiedDockWidgets(explorer_dock)` now reports **two** other real
   docks, not just one.
2. Try tabifying two docks added to *different* dock areas (one left,
   one right) and observe the real, resulting behavior — confirming
   this file's own mechanical note about same-area grouping.
3. Click between the real, visible tabs in a non-headless environment
   and confirm each dock's own real content genuinely swaps in and out
   — the identical underlying UI experience as switching between
   document tabs, now for whole panels.

## A Third Real Facet: Side-by-Side Placement via `splitDockWidget`, and Teardown

A third real dock-arrangement primitive, distinct from both
`addDockWidget` (an independent dock) and `tabifyDockWidget` (stacked
as tabs): placing two docks **side by side**, sharing one screen
region without hiding each other:

```python
window = QMainWindow()
window.setCentralWidget(QTextEdit())

channel1_dock = QDockWidget("Channel 1")
channel1_dock.setWidget(QListWidget())
window.addDockWidget(Qt.DockWidgetArea.RightDockWidgetArea, channel1_dock)

channel2_dock = QDockWidget("Channel 2")
channel2_dock.setWidget(QListWidget())

window.splitDockWidget(channel1_dock, channel2_dock, Qt.Orientation.Horizontal)
window.show()

print("channel2_dock is genuinely parented into MainWindow:", channel2_dock.parent() is not None)
print("channel2_dock's real dock area matches RightDockWidgetArea:",
      window.dockWidgetArea(channel2_dock) == Qt.DockWidgetArea.RightDockWidgetArea)
print("channel1 and channel2 are NOT tabified together:",
      channel2_dock not in window.tabifiedDockWidgets(channel1_dock))

window.removeDockWidget(channel2_dock)
print("after removeDockWidget, real dock area:", window.dockWidgetArea(channel2_dock))
```

**Real output, run this session:**
```
channel2_dock is genuinely parented into MainWindow: True
channel2_dock's real dock area matches RightDockWidgetArea: True
channel1 and channel2 are NOT tabified together: True
after removeDockWidget, real dock area: DockWidgetArea.NoDockWidgetArea
```

**What this proves:** `channel2_dock` genuinely became a real child of
`window` (`.parent()` is not `None`) and correctly landed in the same
real dock area as `channel1_dock` — but, confirmed directly via
`tabifiedDockWidgets`, the two are **not** grouped as tabs; both are
simultaneously visible, side by side, exactly what `splitDockWidget`
is for. `removeDockWidget` immediately, genuinely detached it from the
window's own layout (`dockWidgetArea` reports `NoDockWidgetArea`
afterward) — the correct, real first step of tearing a dock down
before also calling `deleteLater()` (per `pyside6-deletelater-
deferred-destruction.md`'s own real deferred-destruction facts) to
actually free it.

**Mechanical note:** `dock.parent() is not None` (used directly in this
project's own real tests) is a real, concrete way to verify a widget
is genuinely embedded in a parent's layout — distinct from merely
checking it was constructed at all, which tells you nothing about
whether it's actually placed anywhere real.

### Try It Yourself (third facet)

1. Split a third dock against `channel2_dock` and confirm all three
   arrange side by side, correctly — `splitDockWidget` generalizes past
   just two docks.
2. Try `Qt.Orientation.Vertical` instead of `Horizontal` and confirm
   the real, resulting arrangement stacks the docks top-to-bottom
   instead of side-by-side.
3. Build a real "tear down and rebuild every dock from scratch"
   sequence (`removeDockWidget` + `deleteLater()` for each existing
   dock, then real, fresh `addDockWidget`/`splitDockWidget` calls) and
   confirm it never accumulates stale docks across repeated calls —
   the identical real pattern this project's own `_channel_docks`
   rebuild uses.
