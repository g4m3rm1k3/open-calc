# Concept: Reverting to the Last Known-Good Selection When a Side Effect Is Cancelled

**What you'll understand by the end:** why a control that triggers a
real side effect (opening a file browser, confirming a destructive
action) needs to remember its own *previous*, valid selection — so
cancelling that side effect can cleanly revert to it, instead of
leaving the control stuck showing whatever momentarily-selected,
not-really-valid option triggered the cancelled action.

**Prerequisites:** `pyside6-qformlayout-and-databound-widgets.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Some options in a real selection control aren't themselves a final
answer — they're a trigger for a further, real action (an item labeled
"Browse for File..." that's meant to open a file picker, not be a real,
selectable value on its own). If that further action gets **cancelled**
(the user closes the file picker without choosing anything), the
control is left showing the trigger option itself, with no real,
underlying value behind it — a genuinely broken, dead-end state unless
something explicitly reverts it.

## The Isolated Example

```python
import sys
from PySide6.QtWidgets import QApplication, QComboBox

app = QApplication.instance() or QApplication(sys.argv)

_BROWSE = "__browse__"

combo = QComboBox()
combo.addItem("report.txt", "report.txt")
combo.addItem("notes.md", "notes.md")
combo.addItem("Browse for File...", _BROWSE)

last_valid_index = 0
combo.setCurrentIndex(last_valid_index)


def on_changed(index):
    global last_valid_index
    data = combo.itemData(index)
    if data == _BROWSE:
        chosen_path = None  # simulating the user cancelling the file picker
        if chosen_path is None:
            combo.setCurrentIndex(last_valid_index)  # revert
            return
    last_valid_index = index


combo.currentIndexChanged.connect(on_changed)

print("start:", combo.currentText())
combo.setCurrentIndex(1)
print("after picking notes.md:", combo.currentText(), "last_valid_index:", last_valid_index)
combo.setCurrentIndex(2)  # user picks "Browse...", then cancels
print("after cancelled browse:", combo.currentText(), "last_valid_index:", last_valid_index)
```

**Real output, run this session:**
```
start: report.txt
after picking notes.md: notes.md last_valid_index: 1
after cancelled browse: notes.md last_valid_index: 1
```

**What this proves:** selecting `"notes.md"` correctly updated both the
visible text and `last_valid_index`. Selecting `"Browse for File..."`
and then simulating a cancelled picker (`chosen_path = None`) did
**not** leave the combo box showing `"Browse for File..."` — it
genuinely reverted, on its own, back to `"notes.md"`, the last real,
valid selection — because `last_valid_index` remembered exactly what
that was.

## Mechanical Walkthrough

- `last_valid_index` is a real, small piece of state tracking "the most
  recent selection that was actually a real, usable value" — updated
  **only** when the newly-selected item genuinely isn't the trigger
  item.
- When the trigger item (`_BROWSE`) is selected, the handler doesn't
  update `last_valid_index` at all — it stays pointing at whatever the
  previous, real selection was.
- If the real, further action the trigger initiates succeeds, the code
  would go on to select (and thus register) the *real* new result as
  the new `last_valid_index`; if it's cancelled, calling `setCurrentIndex
  (last_valid_index)` explicitly puts the control back exactly where it
  was before the trigger was ever selected.
- This is a real, small, deliberate two-step design: **detect** that a
  non-final, trigger-only option was chosen, then **actively restore**
  a remembered prior state — neither step alone is sufficient; without
  the first, nothing would ever notice the trigger fired, and without
  the second, the control would stay stuck on it.

## CS Lens

This is a small, real, applied instance of **remembering a checkpoint
to roll back to** — the same underlying shape as a database transaction
reverting to its state before a failed operation, or an undo system
restoring a document to its last saved state. The scope here is
deliberately narrow (one remembered value, one specific trigger-and-
cancel scenario), but the structural idea — keep a durable record of
"the last state that was actually valid," so an interrupted or
cancelled operation has somewhere real to fall back to — is the same
principle at any scale.

Also recognized in: a form field reverting to its last-saved value when
an edit is cancelled (`Escape` in many real UI conventions); a
dropdown menu's "highlighted but not yet confirmed" hover state,
reverting to the actual current selection if the menu is dismissed
without a click; a game's checkpoint system, letting a failed attempt
restart from the last point that was genuinely, safely reached.

## SE Lens

The real, practical alternative — simply leaving the control however
the cancelled trigger left it — produces a genuinely confusing, broken
real state: a combo box permanently reading "Browse for File..." with
no real file actually selected behind it, and no way for a caller
reading `combo.currentData()` to distinguish "the user deliberately
wants this" from "the user cancelled and got stuck here." Tracking one
small, extra piece of state (`last_valid_index`) is a cheap, real fix
for a genuinely bad user-facing failure mode.

## Connection

Builds on `pyside6-qformlayout-and-databound-widgets.md`'s own
established `QComboBox.addItem(text, data)`/discriminating-by-userData
pattern — this file adds the real handling needed once one of those
data values is itself a non-final, action-triggering sentinel rather
than a genuine, selectable value.

## Try It Yourself

1. Add a **second** trigger item (say, `"Clear Selection..."`, with its
   own confirmation the user might cancel) and confirm the identical
   `last_valid_index` mechanism correctly reverts for either trigger,
   with no changes needed to the reverting logic itself.
2. Deliberately remove the `return` statement after `combo.
   setCurrentIndex(last_valid_index)` and trace through what would go
   wrong — would `last_valid_index` end up incorrectly overwritten with
   the trigger's own index, defeating the whole mechanism the next time
   it's needed?
3. Rewrite the example so a **successful** (not cancelled) browse
   updates `last_valid_index` to a brand-new value not originally in
   the combo box's list — confirm the revert mechanism doesn't care
   whether the "last known-good" value was one of the original options
   or something added later, only that it was once genuinely, validly
   selected.
