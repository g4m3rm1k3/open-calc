# Concept: A Reentrancy Guard Flag for Programmatic Widget Updates

**What you'll understand by the end:** the real risk of a signal
handler firing *during* a block of purely programmatic widget updates
— potentially reading and writing genuinely corrupted, partially-loaded
data — and the real, simple fix: an explicit boolean flag the handler
checks first, suppressing itself during that block.

**Prerequisites:** `pyside6-signals-and-slots.md`,
`pyside6-qformlayout-and-databound-widgets.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Loading a real, existing object's data into several form widgets at
once (a combo box, a spin box) means calling `setCurrentIndex(...)`,
`setValue(...)`, and similar methods — each of which fires the exact
same real signal (`currentIndexChanged`, `valueChanged`) a normal user
edit would. If a "the user changed something" handler is listening
for those same signals, it fires *during* the load too — potentially
reading widgets that are only **partially** updated, and writing that
genuinely incomplete, inconsistent state back into real, live data.

## The Isolated Example

Without a guard — real, genuine data corruption:

```python
import sys
from PySide6.QtWidgets import QApplication, QComboBox, QSpinBox, QWidget

app = QApplication.instance() or QApplication(sys.argv)


class Assignment:
    def __init__(self, machine_id, channel):
        self.machine_id = machine_id
        self.channel = channel

    def __repr__(self):
        return f"Assignment({self.machine_id!r}, {self.channel})"


class BrokenPanel(QWidget):
    def __init__(self):
        super().__init__()
        self.editor_assignment = None
        self.combo = QComboBox()
        self.combo.addItem("Lathe A", "m1")
        self.combo.addItem("Mill B", "m2")
        self.spin = QSpinBox()
        self.spin.setRange(1, 10)

        self.combo.currentIndexChanged.connect(self._on_changed)
        self.spin.valueChanged.connect(self._on_changed)

    def _on_changed(self, *args):
        if self.editor_assignment is None:
            return
        self.editor_assignment.machine_id = self.combo.currentData()
        self.editor_assignment.channel = self.spin.value()

    def set_editor(self, assignment):
        self.editor_assignment = assignment
        index = self.combo.findData(assignment.machine_id)
        self.combo.setCurrentIndex(index)  # fires _on_changed EARLY
        self.spin.setValue(assignment.channel)


panel = BrokenPanel()
doc_a = Assignment("m1", 3)
doc_b = Assignment("m2", 9)

panel.set_editor(doc_a)
print("doc_a after its own load:", doc_a)

panel.set_editor(doc_b)
print("doc_b immediately after switching (mid-load state leaked in?):", doc_b)
```

**Real output, run this session:**
```
doc_a after its own load: Assignment('m1', 3)
doc_b immediately after switching (mid-load state leaked in?): Assignment('m2', 3)
```

**What this proves:** `doc_b`'s real channel should be `9` — that's
the value it was constructed with. Instead it ends up `3` — `doc_a`'s
stale channel value. The mechanism is genuinely subtle: `combo.
setCurrentIndex(index)` fires `_on_changed` **before** `spin.setValue(
assignment.channel)` ever runs — at that moment, `self.spin` still
holds its *old* value (`3`, left over from `doc_a`'s load), so
`_on_changed` writes `doc_b.channel = 3` immediately. Because
`assignment` **is** `doc_b` (the same real object, not a copy), that
write happens *before* the final line reads `assignment.channel` to
set the spin box — so `assignment.channel` has *already* been
corrupted to `3` by the time `spin.setValue(assignment.channel)` runs,
permanently losing the real, original `9` with no error anywhere.

The real, simple fix:

```python
class GuardedPanel(QWidget):
    def __init__(self):
        super().__init__()
        self._loading = False
        self.editor_assignment = None
        # ... identical widget setup ...

    def _on_changed(self, *args):
        if self._loading or self.editor_assignment is None:
            return
        self.editor_assignment.machine_id = self.combo.currentData()
        self.editor_assignment.channel = self.spin.value()

    def set_editor(self, assignment):
        self._loading = True
        self.editor_assignment = assignment
        index = self.combo.findData(assignment.machine_id)
        self.combo.setCurrentIndex(index)
        self.spin.setValue(assignment.channel)
        self._loading = False
```

**Real output, run this session:**
```
doc_a after its own load: Assignment('m1', 3)
doc_b after switching, WITH the guard: Assignment('m2', 9)
```

**What this proves:** with `self._loading = True` set before any
programmatic widget update, `_on_changed`'s very first check returns
immediately — the handler never runs at all during the load, so it
never reads a partially-updated widget or writes a partially-loaded
value back. `doc_b.channel` correctly stays `9`, its own real, original
value, completely untouched by the loading process.

## Mechanical Walkthrough

- A **reentrancy guard flag** is a plain boolean, checked as the
  **first** thing inside a signal handler — `if self._loading: return`
  — that suppresses the handler's real effect whenever it's set.
- The flag is set `True` immediately before a block of purely
  programmatic updates, and reset `False` immediately after — every
  signal fired *during* that block finds the flag set and does
  nothing; every signal fired *outside* it (a real, later user edit)
  finds the flag `False` and runs normally.
- The real risk this specifically guards against isn't just "the
  handler runs when it shouldn't" in the abstract — it's that the
  handler can read **genuinely incomplete** state (only some of
  several related widgets updated so far) and write that incomplete
  snapshot into real, shared, mutable data, sometimes corrupting the
  very values the loading code was about to use next.

## CS Lens

This is a **reentrancy guard** — a real, general technique preventing
a function (here, a signal handler) from running again, uninvited,
while a related operation it's logically tied to is already in
progress. The bug it prevents is a real, concrete instance of an
**invariant violation during a multi-step update**: the real "this
object's fields are all consistent with each other" invariant only
holds *before* an update starts and *after* it fully completes — a
handler reading state in between sees a genuinely inconsistent,
transient snapshot, exactly the risk this guard exists to prevent
external code from observing or acting on.

Also recognized in: database transaction isolation levels (preventing
a concurrent reader from seeing a transaction's own partial, in-
progress writes); any UI framework's own "suppress change
notifications during a batch update" API, offering the identical real
guarantee through a different real mechanism.

## SE Lens

The real, practical danger this bug class carries: it's silent and
**data-dependent** in a genuinely subtle way — it only manifests when
a *later* widget update in the same load sequence depends on reading a
value from the object being loaded, and that value was already
overwritten by an earlier, reentrant signal fired mid-load. A test
loading a document whose displayed values happen to already match
what's being written (a document reopened unchanged) would never catch
this; only a test loading two genuinely *different* real documents in
sequence — this project's own real test — actually exercises it.

## Connection

Builds on `pyside6-signals-and-slots.md` and `pyside6-qformlayout-and-
databound-widgets.md`. Directly resolves an open question from
`pyside6-signals-and-slots.md`'s own fourth fact (bidirectional
scrollbar sync) — that case was genuinely, structurally safe *without*
an explicit guard specifically because both synced values were always
meant to converge to the identical final value, so a reentrant
`setValue` call was always a real no-op; this step's case is
different, precisely because it loads several *different*, real,
independent values in sequence, where a reentrant handler can observe
and corrupt genuinely inconsistent, in-between state — the guard here
is load-bearing, not incidental.

## Try It Yourself

1. Reorder `BrokenPanel.set_editor` to set the spin box **before** the
   combo box, and confirm the real corruption now shows up in a
   different field, connecting the specific bug to the specific
   ordering rather than to the widgets involved.
2. Add a third, real widget and a third field to `Assignment`, and
   confirm the guarded version still correctly loads all three,
   unaffected by however many programmatic updates happen inside the
   guarded block.
3. Explain, in your own words, why `self._loading = False` must be set
   **after** every real programmatic update in the block, not before
   the last one — what real, remaining risk would an early reset leave
   open?

## A Second Real Facet: `blockSignals` — the Identical Problem, Solved by Qt Itself

This file's own guard is hand-rolled: a plain instance attribute, and
a manual `if self._loading: return` at the top of every handler that
needs to respect it. Qt provides a **built-in**, real alternative that
solves the identical underlying problem without touching handler code
at all.

```python
combo = QComboBox()
combo.addItems(["a", "b", "c"])

fired = []
combo.currentTextChanged.connect(lambda text: fired.append(text))

combo.setCurrentText("b")
print("fired after normal setCurrentText:", fired)

fired.clear()
combo.blockSignals(True)
combo.setCurrentText("c")
combo.blockSignals(False)
print("fired after blockSignals-wrapped setCurrentText:", fired)
print("currentText is still actually updated:", combo.currentText())
```

**Real output, run this session:**
```
fired after normal setCurrentText: ['b']
fired after blockSignals-wrapped setCurrentText: []
currentText is still actually updated: c
```

**What this proves:** a normal `setCurrentText("b")` genuinely fired
`currentTextChanged` — `fired` holds `['b']`. Wrapped in
`blockSignals(True)`/`blockSignals(False)`, the
identical kind of call — `setCurrentText("c")` — updated the widget's
own real, underlying state (`currentText()` correctly reports `"c"`
afterward) **without** emitting the signal at all — `fired` stayed
empty.

**Mechanical note — the real, structural difference between the two
techniques:** this file's own hand-rolled flag is checked **inside**
the handler — the signal still fires, and the handler itself decides
to no-op. `blockSignals` instead suppresses emission **at the
source** — the widget itself never sends the signal in the first
place, so *every* connected handler is silenced at once, with no
handler needing to know or check anything. The hand-rolled version
requires editing every relevant handler; `blockSignals` requires
editing only the call site doing the programmatic update, at the real
cost of silencing *all* listeners indiscriminately, including ones
that might have had a legitimate reason to still react.

### Try It Yourself (second facet)

1. Connect a **second** handler to the same signal and confirm
   `blockSignals(True)` silences both simultaneously — direct, real
   proof it operates on the widget's own emission, not per-listener.
2. Compare `blockSignals` against this file's own hand-rolled flag for
   the specific case where **one** particular listener genuinely
   should still react during a programmatic update while others
   shouldn't — reasoning about which technique can express that (and
   which structurally cannot).
3. Forget to call `blockSignals(False)` after a block of updates, and
   observe that **every** later, real user interaction with that
   widget also silently stops firing signals — a real, concrete
   footgun `blockSignals` carries that the hand-rolled flag (scoped to
   one specific handler's own `if` check) does not.
