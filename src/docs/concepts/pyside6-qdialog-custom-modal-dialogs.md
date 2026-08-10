# Concept: `QDialog` — Building a Custom Modal Dialog

**What you'll understand by the end:** how to build a real, custom
dialog window from scratch (arbitrary content, not one of Qt's built-in
static convenience dialogs), how `QDialogButtonBox` wires standard
buttons to `accept()`/`reject()` automatically, and what `.exec()`
actually returns once a user responds.

**Prerequisites:**
`pyside6-composing-a-widget-from-children-via-layout.md`,
`pyside6-qmessagebox-dialogs.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Qt's own built-in dialogs (`QFileDialog.getOpenFileName`,
`QMessageBox.question`, `QInputDialog.getText`) cover a lot of common,
real cases — but each one is shaped for one specific, fixed kind of
request (a file path, a yes/no question, one line of text). A real
dialog needing genuinely custom content — several independent fields,
custom widgets, real application-specific layout — needs to be built
from scratch, as its own `QDialog` subclass, rather than reached for as
a one-line static call.

## The Isolated Example

```python
import sys
from PySide6.QtWidgets import QApplication, QDialog, QDialogButtonBox, QLineEdit, QVBoxLayout

app = QApplication.instance() or QApplication(sys.argv)


class NameDialog(QDialog):
    def __init__(self):
        super().__init__()
        self.name_edit = QLineEdit()
        buttons = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel
        )
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)

        layout = QVBoxLayout(self)
        layout.addWidget(self.name_edit)
        layout.addWidget(buttons)


dialog = NameDialog()
dialog.name_edit.setText("Ada")

print("DialogCode.Accepted value:", int(QDialog.DialogCode.Accepted))
print("DialogCode.Rejected value:", int(QDialog.DialogCode.Rejected))

# Simulating a real user clicking OK -- this is exactly what buttons.accepted triggers.
dialog.accept()
print("result() after accept():", dialog.result())
print("result() == Accepted:", dialog.result() == QDialog.DialogCode.Accepted)
print("name entered:", dialog.name_edit.text())

dialog2 = NameDialog()
dialog2.reject()
print("result() after reject():", dialog2.result())
print("result() == Rejected:", dialog2.result() == QDialog.DialogCode.Rejected)
```

**Real output, run this session:**
```
DialogCode.Accepted value: 1
DialogCode.Rejected value: 0
result() after accept(): 1
result() == Accepted: True
name entered: Ada
result() after reject(): 0
result() == Rejected: True
```

**What this proves:** `buttons.accepted.connect(self.accept)` — real,
ordinary signal/slot wiring — means clicking the real `Ok` button (or,
here, directly calling `.accept()` to simulate that click) sets the
dialog's own `result()` to `QDialog.DialogCode.Accepted` (real value
`1`). `.reject()`, wired to `Cancel`, sets it to `Rejected` (real value
`0`) instead. Whatever the user actually typed into `name_edit` stays
genuinely readable afterward either way — accepting or rejecting the
dialog doesn't erase or reset the real widgets living inside it.

## Mechanical Walkthrough

- A custom `QDialog` subclass is built exactly like any other custom
  widget — real child widgets, arranged via a real layout manager
  (`pyside6-composing-a-widget-from-children-via-layout.md`'s own
  technique, applied here to a dialog instead of an ordinary widget).
- `QDialogButtonBox` is a real, purpose-built widget specifically for a
  dialog's own standard action buttons — `QDialogButtonBox.
  StandardButton.Ok | ...Cancel` requests a real, platform-appropriate
  set of buttons (correctly ordered per the current OS convention,
  something hand-built buttons wouldn't get automatically).
- `buttons.accepted`/`buttons.rejected` are real, pre-built signals
  `QDialogButtonBox` emits when its own `Ok`-role/`Cancel`-role buttons
  are clicked — connecting them directly to the dialog's own inherited
  `self.accept`/`self.reject` methods is the real, standard idiom;
  nothing custom needs to be written to make `Ok`/`Cancel` behave
  correctly.
- `.accept()`/`.reject()` are real `QDialog` methods, inherited from
  the base class — calling either one sets the dialog's own `result()`
  to the corresponding `DialogCode` and (in a real, running
  application) closes the dialog.
- `.exec()` (not called directly in this headless example, since it
  genuinely blocks waiting for real user interaction) is what a real
  caller uses to actually show the dialog modally — it blocks the
  calling code until the dialog closes via `accept()`/`reject()`, then
  returns the identical `DialogCode` value `result()` would report.

## CS Lens

This is a real, concrete instance of **modal interaction** — the
calling code's own execution genuinely pauses at `.exec()` until the
dialog resolves one way or the other, a fundamentally different real
control-flow shape from the asynchronous, signal-driven interaction
every other widget in this project uses (a button's `clicked` signal
firing whenever, with the rest of the program continuing to run in the
meantime). `QDialogButtonBox`'s own role-based buttons (`Ok`, `Cancel`,
and others) are a real, small instance of **convention over
configuration** — requesting `StandardButton.Ok` gets a correctly
labeled, correctly positioned, platform-appropriate button without the
caller having to specify text, position, or platform-specific ordering
by hand.

Also recognized in: `window.showModal()` for an HTML `<dialog>`
element, blocking interaction with the rest of the page until closed;
any GUI toolkit's own modal dialog primitive, universally built around
the identical "block until resolved, then report which real action the
user took" shape.

## SE Lens

The real, practical tradeoff versus Qt's own built-in static
convenience dialogs: a custom `QDialog` is real, additional code to
write and maintain (a whole class, its own layout, its own button
wiring) — worth it specifically once a request genuinely needs more
than one of Qt's fixed built-in shapes can express (several independent
fields, custom widgets, conditional layout) — not worth it for anything
a one-line `QMessageBox.question` or `QInputDialog.getText` call
already covers correctly. Recognizing which real situation applies is
the actual decision, not a default preference for either approach.

## Connection

Builds on `pyside6-composing-a-widget-from-children-via-layout.md` and
directly contrasts with every prior dialog in this project
(`pyside6-qfiledialog-open-and-save.md`, `pyside6-qmessagebox-
dialogs.md`, `pyside6-qinputdialog-gettext.md`) — this is the first
time this project needed to build a dialog's own real content from
scratch, rather than reaching for one of Qt's fixed, built-in shapes.

## Try It Yourself

1. Add a second real field (a `QComboBox`, say) to `NameDialog` and
   confirm both fields' values remain independently readable after
   `.accept()` — a custom dialog can hold arbitrarily many real,
   independent widgets, unlike any single built-in convenience dialog.
2. Add a real validation check inside a slot connected to `buttons.
   accepted` that calls `self.reject()` (or simply doesn't call
   `self.accept()` at all) when `name_edit.text()` is empty — confirm
   the dialog can refuse to close on `Ok` when its own content isn't
   valid yet, something none of the built-in static dialogs allow a
   caller to customize.
3. In a real, non-headless environment, call `dialog.exec()` instead of
   directly calling `.accept()`/`.reject()`, and confirm the calling
   code genuinely pauses until a real user clicks one of the buttons —
   observe that the return value of `.exec()` is the identical
   `DialogCode` this file's own example reads via `.result()`.

## A Real Second Facet: a Non-Modal Dialog, Lazily Created Once and Reused

Every dialog in this file so far has been **modal** — `.exec()` blocks
the calling code until the user responds, and a fresh instance is
typically built each time. A real, different kind of dialog — a
calculator, a live search-results panel — needs the opposite shape:
non-blocking, and reused across repeated opens rather than rebuilt
each time.

```python
import sys
from PySide6.QtWidgets import QApplication, QDialog

app = QApplication.instance() or QApplication(sys.argv)


class ReusableDialog(QDialog):
    def __init__(self):
        super().__init__()
        self.calls = 0


dialog = None


def show_dialog():
    global dialog
    if dialog is None:
        dialog = ReusableDialog()
    dialog.calls += 1
    dialog.show()
    return dialog


d1 = show_dialog()
d2 = show_dialog()
print("same instance reused:", d1 is d2)
print("calls counted on the one instance:", d1.calls)
print("isVisible after show():", d1.isVisible())
print("isModal:", d1.isModal())
```

**Real output, run this session:**
```
same instance reused: True
calls counted on the one instance: 2
isVisible after show(): True
isModal: False
```

**What this proves:** the second `show_dialog()` call genuinely reused
the exact same real `ReusableDialog` instance (`d1 is d2` is `True`) —
the `if dialog is None:` guard only constructs one, the first time.
`isModal` reports `False` — `.show()` (not `.exec()`) never blocks the
app's own event loop, and never makes the dialog modal on its own;
`QDialog` is non-modal by default, `.exec()` is specifically what
makes it modal.

**Mechanical note — why `.show()`, `.raise_()`, and `.activateWindow()`
travel together in real code:** `.show()` alone makes a hidden dialog
visible, but if it's already visible (behind the main window, say) and
shown a *second* time, nothing brings it to the front on its own —
`.raise_()` stacks it above sibling windows, and `.activateWindow()`
gives it real keyboard focus, so a second real "open the calculator"
request genuinely surfaces the existing window rather than doing
nothing visible at all.

**Why lazy, one-time construction (not "build fresh each time"):** a
non-modal dialog that's reused needs to preserve whatever the user was
in the middle of (a partially-typed expression) across separate real
open requests — rebuilding it each time would silently discard that
state, exactly the opposite of what a "glance back and forth" tool
needs. Building it once, on first real use, and simply re-showing the
same instance afterward is what makes that persistence automatic,
with zero extra state-saving code required.

### Try It Yourself (second facet)

1. Remove the `if dialog is None:` guard so `show_dialog()` always
   constructs a fresh `ReusableDialog` — confirm each call now produces
   a genuinely different real instance, and reason about what real,
   user-visible state (like a partially-typed value) this would
   silently lose on a second open.
2. Call `.close()` on the dialog after showing it, then call
   `show_dialog()` again — confirm the *same* instance is still reused
   (closing doesn't destroy it), then research what `setAttribute
   (Qt.WidgetAttribute.WA_DeleteOnClose)` would change about that.
3. Compare this facet's own real singleton-like reuse directly against
   `pyside6-headless-gui-testing.md`'s own `QApplication` singleton —
   reasoning about what's genuinely similar (exactly one instance,
   created lazily on first need) and what's genuinely different (a
   `QApplication` is required to exist at all; this dialog is optional,
   only created if a user actually opens it).
