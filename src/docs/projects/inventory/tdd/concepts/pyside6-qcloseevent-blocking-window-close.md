# Concept: Overriding `closeEvent` to Block a Real Window Close

**What you'll understand by the end:** how to intercept a real window-
close request by overriding `closeEvent`, and how `event.ignore()`/
`event.accept()` decide whether the close actually proceeds.

**Prerequisites:** `python-inheritance-and-super.md`,
`pyside6-qapplication-and-mainwindow.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Closing an application window with real, unsaved changes still open
risks real, silent data loss — a user clicking the window's close
button (or pressing Alt+F4, or choosing Quit) shouldn't lose work
without at least a chance to reconsider. Qt needs some real, standard
way for application code to say "wait, not yet" at the exact moment a
close is requested, before the window actually disappears.

## The Isolated Example

```python
import sys
from PySide6.QtGui import QCloseEvent
from PySide6.QtWidgets import QApplication, QMainWindow

app = QApplication.instance() or QApplication(sys.argv)


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.has_unsaved_changes = True

    def closeEvent(self, event):
        if self.has_unsaved_changes:
            event.ignore()
        else:
            event.accept()


window = MainWindow()

event = QCloseEvent()
window.closeEvent(event)
print("event accepted while dirty?", event.isAccepted())

window.has_unsaved_changes = False
event2 = QCloseEvent()
window.closeEvent(event2)
print("event accepted while clean?", event2.isAccepted())
```

**Real output, run this session:**
```
event accepted while dirty? False
event accepted while clean? True
```

**What this proves:** the identical real window, with
`has_unsaved_changes` set `True`, genuinely **rejected** the close
event (`isAccepted()` is `False`) — in a real, running application,
this means the window stays open, nothing closes. With
`has_unsaved_changes` set `False`, the second real close event was
genuinely **accepted** — the window would actually close. The exact
same `closeEvent` method produced two different, correct real outcomes
purely based on the window's own current state.

## Mechanical Walkthrough

- `closeEvent(self, event)` is a real, Qt-called hook method (the same
  general shape as `paintEvent`/`resizeEvent` — per `template-method-
  pattern.md`'s own framing) — Qt calls it automatically whenever a
  real close is requested, whether from the window's own close button,
  a keyboard shortcut, or a programmatic `.close()` call.
- `event` is a real `QCloseEvent` — it carries no data of its own
  beyond its accept/ignore state, but that state is the entire real
  decision this method makes.
- `event.ignore()` marks the event as **not accepted** — Qt reads this
  after `closeEvent` returns and does **not** actually close the
  window; from the user's perspective, clicking "close" visibly did
  nothing.
- `event.accept()` marks it as accepted — Qt proceeds with the real
  close. `QCloseEvent` actually defaults to accepted already;
  `event.ignore()` is the real, active call that changes that default.
- Overriding `closeEvent` without calling `super().closeEvent(event)`
  anywhere is completely correct here — unlike `resizeEvent`'s own
  "extend, don't just replace" shape (`python-inheritance-and-super.md`'s
  second facet), `QMainWindow`'s own base `closeEvent` implementation
  has no independent real work this override needs to preserve; the
  override's own accept/ignore decision is the entire real behavior
  needed.

## CS Lens

This is a real, concrete instance of an application **vetoing** a
system-initiated action before it takes effect — the same underlying
shape as a web page's `beforeunload` handler (which can prompt "are you
sure you want to leave?" before a real navigation proceeds), or a
database trigger that can reject an incoming write. In every real case,
the deciding code runs **before** the action is finalized, with an
explicit, real way to say "don't."

Also recognized in: mobile OS "are you sure you want to force-quit"
prompts for apps with unsaved state; any real "confirm before a
destructive, hard-to-reverse action" pattern (`pyside6-qmessagebox-
dialogs.md`'s own SE Lens already names this exact UX principle,
applied there to `QMessageBox.question`, here to blocking a close
outright rather than asking first).

## SE Lens

The real, practical value: this is the **last real checkpoint** before
a user's unsaved work would be lost — every earlier confirmation
(`_confirm_discard_if_dirty`, per this project's own Step 7) only
covers specific, individual actions (opening a different file, say);
`closeEvent` is the one real hook that catches *every* way a window
can be closed, including ones an application's own code never
explicitly anticipated (a keyboard shortcut, an OS-level "close all
windows" command). Overriding it is what makes "never lose unsaved
work on close" a genuinely enforced guarantee rather than something
that only holds for the specific close paths an application happened
to add a check to.

## Connection

Builds on `python-inheritance-and-super.md` and `pyside6-qapplication-
and-mainwindow.md`. A real, direct parallel to `pyside6-qmessagebox-
dialogs.md`'s own "confirm before a destructive action" principle,
applied here to the window-close action specifically, via a different
real mechanism (accept/ignore on an event, rather than a modal dialog's
own return value) — the two are commonly combined in practice, showing
a real confirmation dialog *inside* `closeEvent`, then deciding
accept/ignore based on the user's real answer.

## Try It Yourself

1. Extend `closeEvent` to show a real `QMessageBox.question` dialog
   when `has_unsaved_changes` is `True`, and only call `event.ignore()`
   if the user declines to discard — combining this file's own
   mechanism with `pyside6-qmessagebox-dialogs.md`'s.
2. Confirm `QCloseEvent()`'s own default accepted state by checking
   `event.isAccepted()` immediately after construction, **before**
   `closeEvent` runs at all — direct, real proof that `ignore()` is
   the active call changing a real default, not the reverse.
3. Look up `QWidget.closeEvent` (the more general, non-`QMainWindow`
   version) and confirm the identical accept/ignore mechanism applies
   to any real top-level widget, not just a `QMainWindow` specifically.

## A Second Real Facet: a Modal `QDialog`'s `accept()`/`reject()` Does NOT Fire `closeEvent`

This file's own SE Lens calls `closeEvent` "the one real hook that
catches *every* way a window can be closed." A real, important
exception: a modal `QDialog` closed via its own `accept()` or
`reject()` — the normal way an OK/Cancel dialog ends — **never**
triggers `closeEvent` at all.

```python
class MyDialog(QDialog):
    def __init__(self):
        super().__init__()
        self.close_event_fired = False

    def closeEvent(self, event):
        self.close_event_fired = True
        event.accept()


dlg = MyDialog()
dlg.show()
dlg.accept()  # the normal way exec() ends when a user clicks OK

print("close_event_fired after accept():", dlg.close_event_fired)
```

**Real output, run this session:**
```
close_event_fired after accept(): False
```

**What this proves:** `dlg.accept()` — the identical real call
`exec()` makes internally the moment a user clicks a dialog's own OK
button — genuinely never ran `closeEvent` at all; `close_event_fired`
stayed `False`. Any cleanup logic placed only inside `closeEvent`
would silently **never run** for a dialog closed this normal, common
way.

**Mechanical note — why this is a real, structural exception, not a
bug:** `accept()`/`reject()` don't go through the same real
"something is asking to close this window" event path a close
button, Alt+F4, or `.close()` does — they directly set the dialog's
own result code and hide it. `closeEvent`'s entire real job is
deciding whether a close *request* should proceed; `accept()`/
`reject()` were never a close request in the first place, they're a
direct, decisive answer, so there's nothing for `closeEvent` to veto.

**The real, practical consequence:** any cleanup a dialog owns — a
live resource, a native handle, anything that needs to be released no
matter *how* the dialog ends — cannot safely live only inside
`closeEvent`. It has to run explicitly, right after `exec()` returns,
regardless of whether the real result was accept or reject.

### Try It Yourself (second facet)

1. Call `dlg.reject()` instead of `dlg.accept()` and confirm
   `closeEvent` is skipped identically — the exception applies to
   *both* real outcomes, not just acceptance.
2. Override `closeEvent` to also handle a real close via the window's
   own close button (`dlg.close()` instead of `dlg.accept()`) and
   confirm **that** path *does* fire `closeEvent` — direct, real proof
   the exception is specific to `accept()`/`reject()`, not to
   `QDialog` in general.
3. Write a small wrapper function, `exec_and_cleanup(dialog)`, that
   calls `dialog.exec()` and then unconditionally releases some
   real resource the dialog owns, regardless of the real result —
   reasoning about why this pattern (explicit post-`exec()` cleanup)
   is the correct fix, rather than trying to make `closeEvent` fire
   some other way.

## A Third Real Facet: `wheelEvent` — Selectively Handling an Event, Delegating the Rest to `super()`

`closeEvent`'s own override never called `super().closeEvent(event)` at
all — this file's own Mechanical Walkthrough explains why: there was no
independent base-class behavior worth preserving. A real, different
Qt event hook — `wheelEvent` — shows the opposite, and more common,
real shape: handle the event **only** under a specific real condition,
and explicitly fall through to the base class's own default behavior
every other time.

```python
import sys
from PySide6.QtCore import Qt, QPointF, QPoint
from PySide6.QtGui import QWheelEvent
from PySide6.QtWidgets import QApplication, QPlainTextEdit

app = QApplication.instance() or QApplication(sys.argv)


class ZoomableEditor(QPlainTextEdit):
    def __init__(self):
        super().__init__()
        self.zoom_calls = []

    def wheelEvent(self, event):
        if event.modifiers() == Qt.KeyboardModifier.ControlModifier:
            delta = event.angleDelta().y()
            if delta > 0:
                self.zoom_calls.append("in")
            elif delta < 0:
                self.zoom_calls.append("out")
            event.accept()
        else:
            super().wheelEvent(event)


def make_wheel_event(modifiers, dy):
    return QWheelEvent(
        QPointF(0, 0), QPointF(0, 0), QPoint(0, 0), QPoint(0, dy),
        Qt.MouseButton.NoButton, modifiers,
        Qt.ScrollPhase.NoScrollPhase, False,
    )


editor = ZoomableEditor()

ctrl_event = make_wheel_event(Qt.KeyboardModifier.ControlModifier, 120)
editor.wheelEvent(ctrl_event)
print("with Ctrl held, zoom_calls:", editor.zoom_calls)
print("ctrl_event accepted:", ctrl_event.isAccepted())

plain_event = make_wheel_event(Qt.KeyboardModifier.NoModifier, 120)
editor.wheelEvent(plain_event)
print("without Ctrl, zoom_calls still:", editor.zoom_calls)
```

**Real output, run this session:**
```
with Ctrl held, zoom_calls: ['in']
ctrl_event accepted: True
without Ctrl, zoom_calls still: ['in']
```

**What this proves:** a real wheel scroll while `Ctrl` is held gets
intercepted — `zoom_calls` records `"in"` and the event is explicitly
`accept()`-ed, meaning `QPlainTextEdit`'s own normal scroll behavior
never runs for that event. A real wheel scroll *without* `Ctrl` leaves
`zoom_calls` unchanged — the `else: super().wheelEvent(event)` branch
handed the event straight to the base class, which is exactly what
lets the widget keep scrolling normally the ordinary way, with zero
custom scrolling logic written here at all.

**Mechanical note — the real, structural contrast with `closeEvent`:**
`closeEvent`'s override was the *entire* real behavior, correctly
never calling `super()`. `wheelEvent`'s override is a real, partial
interception — genuinely new behavior for one specific, narrow
condition (`Ctrl` held), falling through to the inherited, base-class
default for every other case. Both are the identical general
mechanism (override a Qt-called hook method, decide what happens),
but they resolve the "call `super()` or not" question oppositely,
each correctly, because they're solving genuinely different real
problems: *veto* an action entirely, versus *layer* new behavior on
top of existing behavior without losing it.

### Try It Yourself (third facet)

1. Remove the `else: super().wheelEvent(event)` branch entirely and
   reason about (or test against a real, visible widget) what breaks —
   direct, real proof that skipping the fallback silently discards the
   widget's own normal scrolling for every non-`Ctrl` wheel event, not
   just the `Ctrl` ones this override actually cares about.
2. Compare this file's own two real examples side by side and write
   one sentence each stating whether `super()` is called and why —
   confirming the choice tracks the real *problem* (veto vs. layer),
   not some fixed rule about whether an override should always or
   never call its base implementation.
3. Look up `QWidget.keyPressEvent` and predict which of this file's two
   real shapes (always-veto, or selectively-handle-then-delegate) a
   real keyboard-shortcut override would more likely need — reasoning
   from the fact that most keys typed into a text widget still need to
   reach the widget's own normal typing behavior.
