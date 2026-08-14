# Concept: Bootstrapping a PySide6 GUI Application

**What you'll understand by the end:** the minimum real pieces every
PySide6 desktop application needs to exist at all — the application
object, a top-level window, and the loop that keeps it responding to
input — and why each one is required, not optional boilerplate.

**Prerequisites:** `python-inheritance-and-super.md`,
`event-loop.md`.

## Setup

Python 3 with `pip install PySide6` (a real, separately-installed
third-party package — not part of the standard library).

## The Problem

A desktop GUI isn't a script that runs top-to-bottom once and exits —
it has to draw a real window on screen, keep it responsive to clicks
and keystrokes indefinitely, and only actually exit when the user
closes it (or the program decides to quit). Nothing in bare Python
provides any of that; a real GUI toolkit like Qt (via its PySide6
Python bindings) supplies it, but only once a few specific, required
pieces are wired together correctly.

## The Isolated Example

```python
import sys
from PySide6.QtWidgets import QApplication, QMainWindow, QLabel


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("Hello Qt")
        label = QLabel("Hello, window!")
        self.setCentralWidget(label)


app = QApplication(sys.argv)
window = MainWindow()
window.resize(300, 100)
window.show()
print("window title:", window.windowTitle())
print("is visible:", window.isVisible())
print("central widget text:", window.centralWidget().text())
sys.exit(0)  # in a real app, sys.exit(app.exec()) instead — see below
```

**Real output, run this session:**
```
window title: Hello Qt
is visible: True
central widget text: Hello, window!
```

**What this proves:** a real `QMainWindow` subclass, once `.show()` is
called, genuinely becomes visible (`isVisible()` reports `True`) and
holds the exact widget it was given as its central content — this
isn't a passive data object, it's a live, real window Qt is actually
tracking. (This example calls `sys.exit(0)` instead of running the
event loop so the script can finish and print its own output; a real,
interactive application calls `sys.exit(app.exec())` instead, which is
covered next.)

## Mechanical Walkthrough

- `QApplication(sys.argv)` — every PySide6 GUI needs **exactly one** of
  these, created before any widget. It owns the application's real
  connection to the OS windowing system, processes command-line
  arguments Qt itself recognizes (e.g. `-style`), and will later run
  the actual event loop. Constructing a widget before this exists
  raises a real error.
- `class MainWindow(QMainWindow):` — a real top-level window is built
  by *subclassing* `QMainWindow` (per `python-inheritance-and-super.md`),
  not by instantiating it directly — this is how every custom real
  window in a PySide6 app is built, since a plain `QMainWindow` has
  nothing in it yet.
- `super().__init__()` — required first, before touching `self` at
  all; it runs `QMainWindow`'s own real setup (menu bar, status bar,
  and central-widget machinery all get initialized here).
- `self.setWindowTitle(...)` / `self.setCentralWidget(label)` — real
  methods `MainWindow` inherits from `QMainWindow`, setting the
  window's title-bar text and the one real widget that fills its main
  content area.
- `window.show()` — without this call, the window object exists in
  memory but is never actually displayed; `isVisible()` would report
  `False`.
- `sys.exit(app.exec())` (the real, normal ending, not used literally
  in this isolated example so it can finish and print) — `app.exec()`
  **starts the real Qt event loop** and does not return until the
  application quits (usually when the last window closes); whatever
  integer it returns becomes the real process exit code via
  `sys.exit(...)`.

## CS Lens

`app.exec()` is a concrete, real instance of the general **event loop**
idea (`event-loop.md`): the process blocks, waiting for real OS-level
input events (mouse clicks, key presses, window-resize signals), reacts
to each one as it arrives, and keeps doing this indefinitely instead of
running once and exiting. `QMainWindow` subclassing is a concrete,
real instance of inheritance (`python-inheritance-and-super.md`): a
custom window is *a* `QMainWindow`, with all of that class's own real
behavior (menus, docking, a status bar), plus whatever the subclass
itself adds.

Also recognized in: every mainstream GUI toolkit's own equivalent
bootstrap sequence — a required top-level application object,
constructed once, followed by starting its own real event loop
(Electron's `app.whenReady()`, a web browser's own JavaScript event
loop, a game engine's frame loop).

## SE Lens

The real, concrete reason `QApplication` must be constructed before any
widget: many widget-construction paths internally query the real
application object for things like the active platform theme or font
defaults — skip it, and PySide6 raises a real, immediate error rather
than silently working with defaults. This is a real, deliberate
design choice (fail loudly and immediately at the one place the mistake
was made) rather than letting a missing application object cause subtle,
hard-to-trace failures somewhere else later.

## Connection

Builds on `python-inheritance-and-super.md` (subclassing `QMainWindow`)
and `event-loop.md` (what `app.exec()` actually is). Every later concept
in this project that covers a specific Qt widget or subsystem assumes
this bootstrap sequence already exists and is running.

## Try It Yourself

1. Comment out `window.show()` and re-run. Confirm `isVisible()` now
   reports `False` — construction and visibility are two genuinely
   separate real steps, not one.
2. Try constructing `MainWindow()` *before* `QApplication(sys.argv)` in
   the same script. Read the real error PySide6 raises and explain, in
   your own words, why the ordering matters.
3. Replace `sys.exit(0)` with the real `window.show(); sys.exit(app.exec())`
   ending and run the script in an environment with a real display
   attached (not headless) — confirm a real, visible, interactive window
   appears and stays open until you close it.

## A Second Real Facet: The Status Bar

`super().__init__()` already initializes more than just the central
widget's own machinery — a `QMainWindow` comes with several other real,
built-in regions, including a status bar at the window's bottom edge:

```python
window = MainWindow()

print("status bar before any message:", repr(window.statusBar().currentMessage()))

window.statusBar().showMessage("Ready")
print("status bar after showMessage('Ready'):", repr(window.statusBar().currentMessage()))

window.statusBar().showMessage("Line 3: G1 X10 Y5", 2000)
print("status bar after a second message:", repr(window.statusBar().currentMessage()))

print("statusBar() called TWICE returns the SAME real widget:", window.statusBar() is window.statusBar())
```

**Real output, run this session:**
```
status bar before any message: ''
status bar after showMessage('Ready'): 'Ready'
status bar after a second message: 'Line 3: G1 X10 Y5'
statusBar() called TWICE returns the SAME real widget: True
```

**What this proves:** `window.statusBar()` returns a real, genuine
`QStatusBar` — never explicitly created by this subclass anywhere —
that `QMainWindow` builds automatically the first time `.statusBar()`
is called. Calling `.showMessage(...)` a second time genuinely
**replaces** the first message rather than appending to it — a status
bar shows one real, current message at a time. `window.statusBar() is
window.statusBar()` being `True` confirms it's the identical real
object every time, not a fresh one constructed on each call.

**Mechanical note:** `.showMessage(text, timeout_ms)`'s optional second
argument, when given a positive number, automatically clears the
message after that many milliseconds — omitted (as in the first call
above), the message stays until explicitly replaced or cleared.

### Try It Yourself (second facet)

1. Call `window.statusBar().clearMessage()` after showing a message and
   confirm `.currentMessage()` goes back to an empty string.
2. Add a real, permanent widget to the status bar's right side via
   `window.statusBar().addPermanentWidget(QLabel("v1.0"))` — confirm it
   coexists with temporary messages shown via `.showMessage(...)`,
   rather than being replaced by them.
3. Look up `QMainWindow.menuBar()` — the identical real "auto-created on
   first access, same object every time" pattern already in use since
   this project's own first menu — and confirm it behaves identically
   to `statusBar()` in that specific respect.
