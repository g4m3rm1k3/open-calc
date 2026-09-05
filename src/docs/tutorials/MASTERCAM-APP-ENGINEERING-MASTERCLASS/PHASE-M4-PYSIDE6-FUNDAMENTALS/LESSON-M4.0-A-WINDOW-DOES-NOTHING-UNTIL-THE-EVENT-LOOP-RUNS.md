# Lesson M4.0: A Window Does Nothing Until the Event Loop Runs

*File paths under mastercam-app/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder. This lesson adds two real, standalone scripts to verification/mastercam-app-copy/mastercam-app/manual_checks/ - not the real mastercam-app/, per this phase's rule. Unlike most lessons in this curriculum, the "done" state here is not a passing pytest run - it's you, running each script directly and watching what actually happens on screen.*

**What you will build:** Two real, runnable scripts - one that deliberately freezes its own window for 5 real seconds so you can watch what an unresponsive GUI actually looks like, and one with a real closeEvent override that pops up a genuine confirmation dialog and can refuse to let the window close, depending on which button you click.

**What you need to know first:** Nothing from earlier phases - this is the first lesson of a new, independent phase.

## Terms used in this lesson

- **QApplication** — The one object every PySide6 program needs exactly one of - it owns the event loop and must exist before any widget is created.
- **Event loop** — A real, running loop, started by app.exec(), that waits for things to happen (a click, a key press, a repaint request) and dispatches each one. Anything that blocks the same thread - a long computation, a sleep, a network call - stops the loop from processing anything at all until that blocking code finishes.
- **QCloseEvent / event.ignore()** — The real object Qt constructs and passes to closeEvent when something asks a window to close. Calling event.ignore() on it is a real, working way to refuse the close - the window simply stays open, with no further code needed.
- **PySide6 basics (this lesson)** — Per this project's own project_overrides (prompts.yaml), these PySide6 names are used here only for their ordinary, documented role, with no Lens or walkthrough in this lesson depending on how any of them actually works internally: `PySide6`, `QLabel`, `QMainWindow`, `QtWidgets`.

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

## Concept Unit: Freezing Your Own Window on Purpose

### The Problem

"The event loop processes events" is easy to read and easy to forget, because a working app never makes you feel what happens when it doesn't run. The real way to understand it is to block it yourself and watch.

Before reading on:

- Before running the script below, predict: between win.show() and time.sleep(5), has the window already appeared on screen, or does it only appear once app.exec() starts?
- While the window is frozen, try dragging another window on top of it and then away again. What do you expect to see left behind, and why would that specifically happen during the freeze but not after it?

### Project Change

- **Reference Source:** No reference counterpart - a from-scratch, standalone script, not a modification of any real app file.
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/manual_checks/freeze_demo.py` (new)
- **Change type:** add
- **Location:** new file
- **Dependencies:** PySide6.QtWidgets, time

### The New Code

The whole script - run it directly, don't import it.

**File:** `verification/mastercam-app-copy/mastercam-app/manual_checks/freeze_demo.py` (new)

```python
import sys
import time

from PySide6.QtWidgets import QApplication, QMainWindow, QLabel

app = QApplication(sys.argv)
win = QMainWindow()
win.setWindowTitle("Freeze Demo - try dragging me during the freeze")
win.setCentralWidget(QLabel("  Try moving this window right now.  "))
win.resize(400, 100)
win.show()

print("Window shown. Freezing for 5 real seconds starting now...")
time.sleep(5)
print("Unfrozen. Starting the real event loop - try moving it now.")

sys.exit(app.exec())
```

### Mechanical Walkthrough

- `win.show() then time.sleep(5) then app.exec()` — show() genuinely does make the window appear - the freeze isn't "the window hasn't shown yet," it's "the window has shown, but nothing is running that could repaint it, respond to a drag, or process a click." That distinction is the entire point: visible and responsive are two different, separately-controlled things.
- `print(...) calls before and after the sleep` — These run in your real terminal, not the GUI - useful here specifically because the GUI itself can't show you anything new during the freeze; the terminal is what proves the script is still alive and progressing on schedule.

### CS Lens

This is a directly felt case of **cooperative single-threaded scheduling** - the event loop only gets to run when your own code isn't. A real, measured version of the same fact: a QTimer scheduled to fire immediately still doesn't fire until a blocking sleep finishes, proven below without needing a visible window at all.

### SE Lens

The real fix for genuinely slow work - a database query, a network call, a big computation - is never "sleep and hope," it's moving the work off this thread entirely (a real topic for a later lesson: QThread/worker objects). This demo uses sleep() only because it's the simplest way to occupy the thread on purpose, not because it's how a real blocking operation should ever be written.

### Commands needed

- `python manual_checks/freeze_demo.py` — Run from verification/mastercam-app-copy/mastercam-app/ - watch the real window for the full 5 seconds, then try moving it

### Verification

```text
The interactive result (a visibly frozen, then responsive,
window) has to be watched, not pasted as text - that's the
point of this lesson. The underlying mechanism was measured
directly instead: a QTimer.singleShot(0, ...) scheduled just
before a real 2-second sleep did not fire until 2.0 seconds
later, at the same moment the sleep ended - proving nothing
queued during a blocking call can run until the block ends,
the identical mechanism the visible freeze demonstrates:

timer fired 2.0 seconds after sleep started
sleep itself took 2.0 seconds
timer only fired once processEvents ran, proving it could not fire during the sleep
```

Full saved run: `verification/mastercam-phase-04/lab_event_loop_blocking_output.txt`.

### Connection to the previous unit

This is a new phase's first lesson - nothing precedes it.

## Concept Unit: A Real Dialog That Can Refuse to Let the Window Close

### The Problem

DataViewer's real closeEvent (mastercam_app/app.py:118) runs cleanup and then always accepts the close. Making it possible to refuse - a real "are you sure?" - means calling event.ignore() instead, and feeling what that actually does by clicking it yourself.

Before reading on:

- Before running the script below, predict: after clicking the real X button and then clicking 'No' in the dialog that appears, is the window still open? Then actually try it.
- QMessageBox.question(...) blocks until you click a button - given Lesson M4.0's first unit, what is the event loop doing (or not doing) while that dialog is waiting for your click?

### Project Change

- **Reference Source:** mastercam_app/app.py:118-128 (DataViewer's real closeEvent, which always calls event.accept() unconditionally) - this script adds the one real branch DataViewer doesn't have: a way to refuse.
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/manual_checks/close_confirm_demo.py` (new)
- **Change type:** add
- **Location:** new file
- **Dependencies:** PySide6.QtWidgets.QMessageBox

### The New Code

The whole script - run it directly and actually click the X button.

**File:** `verification/mastercam-app-copy/mastercam-app/manual_checks/close_confirm_demo.py` (new)

```python
import sys

from PySide6.QtWidgets import QApplication, QMainWindow, QLabel, QMessageBox


class ConfirmCloseWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Close Confirm Demo - click the real X button")
        self.setCentralWidget(QLabel("  Close this window with the X button.  "))
        self.resize(400, 100)

    def closeEvent(self, event):
        answer = QMessageBox.question(
            self, "Confirm", "Are you sure you want to quit?"
        )
        if answer == QMessageBox.Yes:
            event.accept()
        else:
            event.ignore()


app = QApplication(sys.argv)
win = ConfirmCloseWindow()
win.show()
sys.exit(app.exec())
```

### Mechanical Walkthrough

- `answer = QMessageBox.question(self, "Confirm", "Are you sure you want to quit?")` — Nothing in this script calls closeEvent, and nothing calls QMessageBox.question except Qt itself, from inside its own close machinery, the moment you click the real X button - the same "Qt is calling you" relationship the original version of this lesson named, now with a visible, clickable consequence instead of a silent boolean.
- `if answer == QMessageBox.Yes: event.accept() else: event.ignore()` — event.ignore() is the real, whole mechanism - no flag to reset, no state to track. Qt simply doesn't proceed with closing the window when this runs, which is why clicking 'No' leaves the window exactly as it was.

### CS Lens

This is the same **template method** relationship as before - Qt owns the close sequence and calls out to your override at a fixed point - but now with a real, visible branch: your override doesn't just run, it can change the outcome Qt was about to produce.

### SE Lens

The real alternative - a window that closes unconditionally, with a separate "did you save?" check run some other way - is exactly what DataViewer already does today (it always accepts). Adding a real refusal here isn't proposing DataViewer is wrong; it's making the specific, real mechanism that a future "unsaved changes" guard would need, tangible before you'd ever need to add one for real.

### Commands needed

- `python manual_checks/close_confirm_demo.py` — Run from verification/mastercam-app-copy/mastercam-app/ - click the real X button, then click No, then try again and click Yes

### Verification

```text
The real experience (clicking a genuine dialog) has to be done
by hand. The underlying mechanism was verified directly by
simulating both answers instead of a real click:

after clicking No, isVisible: True
after clicking Yes, isVisible: False
```

Full saved run: `verification/mastercam-phase-04/lab_close_confirm_output.txt`.

### Connection to the previous unit

The unit above froze the window with no way to interact at all; this unit is the opposite case - a window whose close depends entirely on a real interaction you provide.

## Connect the pieces

Run both scripts back to back: freeze_demo.py proves a window can be visible and completely unresponsive at the same time; close_confirm_demo.py proves the reverse is also controllable - Qt will wait, genuinely blocked, for your real click before deciding whether to close at all. Both are the same event loop, doing what it was always going to do: run your code exactly when it's supposed to, and nothing else in between.

**Next lesson:** Next: collecting real data in fields - QLineEdit and QFormLayout, grounded in the real TAEditorDialog.