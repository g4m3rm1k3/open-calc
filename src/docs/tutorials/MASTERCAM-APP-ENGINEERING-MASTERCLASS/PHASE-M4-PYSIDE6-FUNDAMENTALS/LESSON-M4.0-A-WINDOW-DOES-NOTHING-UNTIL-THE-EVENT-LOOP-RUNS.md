# Lesson M4.0: A Window Does Nothing Until the Event Loop Runs

*File paths under mastercam-app/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder. All new code in this lesson goes into verification/mastercam-app-copy/mastercam-app/tests/ - not the real mastercam-app/tests/, per this phase's rule.*

**What you will build:** A real, minimal QMainWindow - built the same shape as the real DataViewer (central widget, a layout, a menu) - and a real test proving what show() actually does and doesn't do, before this phase gets into fields, tables, and dialogs.

**What you need to know first:** Nothing from earlier phases - this is the first lesson of a new, independent phase. Phase M2's ErrorTerminalDialog already used QDialog and Signal in passing; this phase names the underlying model directly.

## Terms used in this lesson

- **QApplication** — The one object every PySide6 program needs exactly one of - it owns the event loop and must exist before any widget is created. Creating a second one in the same process is an error.
- **Event loop** — A real, running loop, started by app.exec(), that waits for things to happen (a click, a key press, a timer firing) and dispatches each one to the right widget's code. Nothing after app.exec() in main() runs until the loop actually stops (the window closes).
- **Central widget** — The one widget a QMainWindow displays in its main area, set once via setCentralWidget() - menus, toolbars, and status bars are separate, but everything else lives inside this one widget's own layout.

## Objects and methods used

- **`DataViewer`**
  - *What it is:* The real app's main window
  - *Implementation:* mastercam_app/app.py:103
  - *Its use:* Constructed once in main(), shown, then the event loop runs until it's closed
  - *Type:* class (QMainWindow subclass)
  - *Responsibility:* Own the central widget, the menu bar, and top-level window state
  - *Depends on:* QMainWindow, _setup_menu, _setup_ui
  - *Connects to:* main() constructs it; every dialog in this app is parented to it or a descendant
  - *Shape:* QMainWindow subclass, built in __init__ via small _setup_* methods

## Concept Unit: Constructing a Window Is Not the Same as Showing It

### The Problem

DataViewer() in main() builds the whole window - menu, central widget, layout - before window.show() ever runs. What's actually true about the window in between those two lines?

Before reading on:

- Right after DataViewer() returns but before .show() is called, is the window drawn on screen? What real attribute would prove your answer instead of guessing?
- main() ends with sys.exit(app.exec()) - what happens to every line of Python after that call, for as long as the window stays open?

### Project Change

- **Reference Source:** mastercam_app/app.py:103-116 (DataViewer.__init__) and :1129-1134 (main), quoted verbatim:
class DataViewer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle(f"<<< {get_current_username().upper()}'s  • Master Control Center >>>")
        self.resize(1680, 1020)
        self.setStyleSheet(STYLE)
        ...
        self._setup_menu()
        self._setup_ui()
        self._auto_load()

def main():
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    window = DataViewer()
    window.show()
    sys.exit(app.exec())
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/tests/test_qmainwindow_basics.py` (new)
- **Change type:** add
- **Location:** new test file
- **Dependencies:** PySide6.QtWidgets

### The New Code

A minimal window built the same shape as DataViewer - a QMainWindow subclass with a central widget set in __init__ - and a real test of construction vs. showing.

**File:** `verification/mastercam-app-copy/mastercam-app/tests/test_qmainwindow_basics.py` (new)

```python
from PySide6.QtWidgets import QMainWindow, QWidget, QLabel, QVBoxLayout


class MiniWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Mini Window")
        central = QWidget()
        layout = QVBoxLayout(central)
        layout.addWidget(QLabel("hello"))
        self.setCentralWidget(central)


def test_constructing_a_window_does_not_make_it_visible(qapp):
    win = MiniWindow()

    assert win.windowTitle() == "Mini Window"
    assert win.centralWidget() is not None
    assert win.isVisible() is False


def test_show_makes_the_already_built_window_visible(qapp):
    win = MiniWindow()
    win.show()

    assert win.isVisible() is True
```

### Mechanical Walkthrough

- `central = QWidget(); layout = QVBoxLayout(central); self.setCentralWidget(central)` — Passing central directly to QVBoxLayout(...) sets that layout as central's layout in one step - equivalent to central.setLayout(layout) separately. setCentralWidget then hands ownership of central to the QMainWindow - it's the one widget the window's main area will ever show.
- `assert win.isVisible() is False` — This is the real, measured proof that building a widget tree (window, layout, label, all fully constructed in memory) is a separate step from anything appearing on screen - nothing here is guessed from how Qt "should" work.

### CS Lens

This is the same **construct, then activate** shape as opening a file handle before reading it, or compiling a regex before running it - building a real, valid object graph is necessary but not sufficient; a separate, explicit step is what actually does the real work (here: painting pixels).

### SE Lens

The real alternative - some frameworks show a widget as a side effect of construction - would make testing harder: every window built anywhere (including in a test, as above) would try to paint immediately. Qt's split lets tests build and inspect a window's state, like this lesson just did, without ever needing a real screen.

### Commands needed

- `python -m pytest tests/test_qmainwindow_basics.py -v` — Run from verification/mastercam-app-copy/mastercam-app/

### Verification

```text
collected 2 items

tests/test_qmainwindow_basics.py::test_constructing_a_window_does_not_make_it_visible PASSED [ 50%]
tests/test_qmainwindow_basics.py::test_show_makes_the_already_built_window_visible PASSED [100%]
```

Full saved run: `verification/mastercam-phase-04/lab_test_qmainwindow_basics_output.txt`.

### Connection to the previous unit

This is a new phase's first lesson - nothing precedes it.

## Concept Unit: closeEvent Is Qt Calling You, Not You Calling Qt

### The Problem

DataViewer overrides closeEvent to stop background servers before the window actually closes. Nothing in this codebase calls closeEvent directly - so what actually triggers it?

Before reading on:

- If closeEvent is never called explicitly anywhere in this codebase, and it still runs when you click the window's X button, what's actually invoking it?
- event.accept() is the last line - what would a real event.ignore() do instead, and when might that matter for a window with unsaved changes?

### Project Change

- **Reference Source:** mastercam_app/app.py:118-128 (DataViewer.closeEvent), quoted verbatim:
def closeEvent(self, event):
    for server in getattr(self, "_live_servers", []):
        try:
            server.stop()
        except Exception:
            pass
    event.accept()
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/tests/test_qmainwindow_basics.py` (modified)
- **Change type:** add
- **Location:** end of test_qmainwindow_basics.py
- **Dependencies:** MiniWindow from the unit above

### The New Code

A real closeEvent override on MiniWindow, and a test calling close() - not closeEvent - to prove Qt is the one routing the call.

**File:** `verification/mastercam-app-copy/mastercam-app/tests/test_qmainwindow_basics.py` (new)

```python
class TrackedCloseWindow(MiniWindow):
    def __init__(self):
        super().__init__()
        self.close_event_ran = False

    def closeEvent(self, event):
        self.close_event_ran = True
        event.accept()


def test_close_calls_closeevent_without_anyone_calling_it_directly(qapp):
    win = TrackedCloseWindow()
    win.show()

    win.close()

    assert win.close_event_ran is True
    assert win.isVisible() is False
```

### Mechanical Walkthrough

- `win.close()  # not win.closeEvent(...)` — close() is the real, public method application code calls (or clicking the window's own X button triggers internally) - it asks Qt to close the window, and Qt's own machinery is what constructs a real QCloseEvent and calls closeEvent(self, event) on the window automatically. This is the same event- dispatch mechanism the whole event loop runs on, just visible here through one specific, overridable method instead of a generic handler.
- `assert win.close_event_ran is True` — This is the real, mechanical proof that overriding closeEvent genuinely hooks into Qt's own close machinery - not just a method that happens to share a name Qt never actually calls.

### CS Lens

This is the **template method** shape - Qt defines the overall close sequence and calls out to your override at a fixed point, the same relationship a framework's lifecycle hooks (setUp/tearDown, componentDidMount) have with the code that fills them in.

### SE Lens

The real alternative - DataViewer could name its own method shutdown() and require every caller to remember to call it before closing - depends on every call site cooperating. Overriding closeEvent means the cleanup runs no matter how the window closes (X button, Alt+F4, programmatic .close()), because Qt itself is the one guaranteed caller.

### Commands needed

- `python -m pytest tests/test_qmainwindow_basics.py -v` — Run from verification/mastercam-app-copy/mastercam-app/, all three tests

### Verification

```text
collected 3 items

tests/test_qmainwindow_basics.py::test_constructing_a_window_does_not_make_it_visible PASSED [ 33%]
tests/test_qmainwindow_basics.py::test_show_makes_the_already_built_window_visible PASSED [ 66%]
tests/test_qmainwindow_basics.py::test_close_calls_closeevent_without_anyone_calling_it_directly PASSED [100%]
```

Full saved run: `verification/mastercam-phase-04/lab_test_qmainwindow_basics_output.txt`.

### Connection to the previous unit

The unit above proved show()/isVisible() reflect real, separate steps; this unit proves closing is the same kind of thing - a real Qt-driven call, not a plain Python method you'd call yourself.

## Connect the pieces

Trace one MiniWindow through both units: constructed but invisible, then shown (unit one) - and, in unit two, TrackedCloseWindow's close_event_ran flag flips to True only because Qt's own close() machinery calls closeEvent for you, the exact mechanism the real DataViewer relies on to stop its live color servers before exiting.

**Next lesson:** Next: collecting real data in fields - QLineEdit and QFormLayout, grounded in the real TAEditorDialog.