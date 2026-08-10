# Concept: `QTabWidget` — Managing Several Real Pages as Tabs

**What you'll understand by the end:** the real `QTabWidget` API for
holding several independent child widgets as tabs — adding, switching,
closing, and renaming them — and the real signals it emits when the
current tab changes or a user requests one closed.

**Prerequisites:** `pyside6-qapplication-and-mainwindow.md`,
`pyside6-signals-and-slots.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

A real application supporting several simultaneously-open documents
needs a way to hold each one as its own independent real widget, let a
user switch between them, close individual ones, and know when the
current selection changes — all real, common needs `QTabWidget`
provides as one ready-made, complete widget rather than something an
application has to hand-build from scratch.

## The Isolated Example

```python
import sys
from PySide6.QtWidgets import QApplication, QLabel, QTabWidget

app = QApplication.instance() or QApplication(sys.argv)

tabs = QTabWidget()
tabs.setTabsClosable(True)

closed = []
tabs.tabCloseRequested.connect(lambda index: closed.append(index))

changed = []
tabs.currentChanged.connect(lambda index: changed.append(index))

page1 = QLabel("first document")
page2 = QLabel("second document")

tabs.addTab(page1, "report.txt")
tabs.addTab(page2, "notes.md")

print("tab count:", tabs.count())
print("current index after adding both:", tabs.currentIndex())
print("currentWidget() is page1:", tabs.currentWidget() is page1)

tabs.setCurrentIndex(1)
print("currentChanged fired with:", changed)
print("currentWidget() is page2:", tabs.currentWidget() is page2)

print("indexOf(page1):", tabs.indexOf(page1))
print("tabText(0):", tabs.tabText(0))

tabs.setTabText(0, "report (edited)")
print("tabText(0) after rename:", tabs.tabText(0))

tabs.tabCloseRequested.emit(0)
print("tabCloseRequested fired with:", closed)

tabs.removeTab(0)
print("tab count after removeTab(0):", tabs.count())
print("widget(0) is now page2:", tabs.widget(0) is page2)
```

**Real output, run this session:**
```
tab count: 2
current index after adding both: 0
currentWidget() is page1: True
currentChanged fired with: [0, 1]
currentWidget() is page2: True
indexOf(page1): 0
tabText(0): report.txt
tabText(0) after rename: report (edited)
tabCloseRequested fired with: [0]
tab count after removeTab(0): 1
widget(0) is now page2: True
```

**What this proves:** `addTab` genuinely made `page1` the current tab
by default (`currentWidget() is page1`), and `currentChanged` already
fired with `0` at that point — real proof that going from **no** tabs
to a first tab already counts as a "current tab changed" event, not
only later switches. `setCurrentIndex(1)` genuinely switched the
current widget to `page2` and fired `currentChanged` a second real
time. `removeTab(0)` genuinely removed the first tab and shifted
`page2` down to real index `0` — tab indices are always contiguous,
recomputed after any removal.

## Mechanical Walkthrough

- `addTab(widget, label)` adds a real, existing widget as a new tab,
  with `label` as its real, displayed tab text — `QTabWidget` takes
  real ownership of the widget's lifecycle from this point on.
- `currentWidget()`/`widget(index)` retrieve a real, specific tab's
  content widget — the first by "whichever is currently selected," the
  second by explicit real index.
- `setCurrentIndex(index)` switches the real, currently-displayed tab
  programmatically — the identical real effect a user clicking a
  different tab would have.
- `indexOf(widget)` is the reverse lookup — given a real widget already
  added as a tab, find which real index it currently occupies (useful
  since indices shift as tabs are added/removed).
- `setTabsClosable(True)` adds a real, visible close button to each
  tab; clicking it emits `tabCloseRequested(index)` — note this signal
  only **requests** closing; it does not remove the tab itself, leaving
  the actual decision (confirm first? just close?) to whatever slot is
  connected.
- `removeTab(index)` is the real, separate call that actually removes a
  tab — typically connected to `tabCloseRequested`, but deliberately
  not fired automatically by it, so an application can intervene (a
  real, unsaved-changes confirmation, say) before the tab is actually
  gone.

## CS Lens

This is a real, ready-made instance of a **tabbed container** UI
pattern — a widget managing several independent child "pages," showing
exactly one at a time, with the container itself owning the real
switching/closing mechanics so no application has to reimplement them.
The distinction between `tabCloseRequested` (an **intent** signal) and
`removeTab` (the actual **action**) mirrors a broader, real pattern:
separating "the user asked for this" from "this actually happened,"
leaving room for real, intervening logic (a confirmation dialog) in
between.

Also recognized in: any tabbed-browser UI (a browser tab's own close
button similarly requests closing, with the browser itself deciding
whether to actually close immediately or prompt first for unsaved
form data); accordion/wizard UI components sharing the same "container
manages several pages, shows one at a time" shape.

## SE Lens

The real, practical value of `tabCloseRequested` staying a request
rather than an automatic removal: an application managing real,
stateful documents (each tab potentially holding unsaved changes) needs
a real chance to intervene before a tab actually disappears — connecting
`tabCloseRequested` to a real handler that checks for unsaved changes,
prompts if needed, and *then* calls `removeTab` (or doesn't) is exactly
the shape this two-step design enables, and a single, automatic
"request equals removal" signal would not.

## Connection

Builds on `pyside6-qapplication-and-mainwindow.md` and
`pyside6-signals-and-slots.md`. A real, natural companion to
`pyside6-composing-a-widget-from-children-via-layout.md`'s own
"several widgets, one container" idea — `QTabWidget` solves the same
general shape specifically for switchable, one-at-a-time pages rather
than always-visible, side-by-side children.

## Try It Yourself

1. Connect `tabCloseRequested` directly to `removeTab` (`tabs.
   tabCloseRequested.connect(tabs.removeTab)`) and confirm clicking a
   real close button now removes the tab immediately, with no
   intervening logic — the simplest possible real wiring, appropriate
   only when there's genuinely nothing to check first.
2. Add a third tab and remove the **middle** one — confirm the
   remaining two tabs' real indices shift down by one, and that
   `currentWidget()` correctly reflects whichever tab is now selected
   after the removal.
3. Look up `QTabWidget.setTabToolTip(...)` and `.setTabIcon(...)` — two
   further, real per-tab customization methods beyond the text label
   shown here — and confirm they apply independently, per tab, the same
   way `setTabText` does.
