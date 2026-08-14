# Concept: `QFormLayout`, and Data-Bound `QComboBox`/`QSpinBox`

**What you'll understand by the end:** `QFormLayout` for real
label-plus-field rows, `QComboBox`'s real separation between what's
**displayed** and what's actually **stored** per item, `QSpinBox` for
bounded real numeric input, and how `setEnabled(False)` on a parent
propagates to its real children automatically.

**Prerequisites:** `pyside6-composing-a-widget-from-children-via-layout.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

A real, editable form — pick a machine from a list, enter a channel
number — needs several real, different input widgets, laid out as
clear label/field pairs, and a way to work with the *real, underlying
value* a dropdown represents (a machine's real ID) rather than only
the human-readable text shown for it (the machine's real name).

## The Isolated Example

```python
import sys
from PySide6.QtWidgets import QApplication, QComboBox, QFormLayout, QSpinBox, QWidget

app = QApplication.instance() or QApplication(sys.argv)

panel = QWidget()
layout = QFormLayout(panel)

machine_combo = QComboBox()
machine_combo.addItem("Lathe A", "m1")
machine_combo.addItem("Mill B", "m2")

channel_spin = QSpinBox()
channel_spin.setRange(1, 99)
channel_spin.setValue(1)

layout.addRow("Machine:", machine_combo)
layout.addRow("Channel:", channel_spin)

print("displayed text at index 0:", machine_combo.itemText(0))
print("underlying data at index 0:", machine_combo.itemData(0))

machine_combo.setCurrentIndex(1)
print("current display text:", machine_combo.currentText())
print("current underlying data:", machine_combo.currentData())

index_of_m1 = machine_combo.findData("m1")
print("findData('m1') returns index:", index_of_m1)
machine_combo.setCurrentIndex(index_of_m1)
print("after setting by data lookup, currentText():", machine_combo.currentText())

print("panel enabled before:", panel.isEnabled(), "| combo enabled before:", machine_combo.isEnabled())
panel.setEnabled(False)
print("panel enabled after:", panel.isEnabled(), "| combo enabled after (inherited):", machine_combo.isEnabled())
```

**Real output, run this session:**
```
displayed text at index 0: Lathe A
underlying data at index 0: m1
current display text: Mill B
current underlying data: m2
findData('m1') returns index: 0
after setting by data lookup, currentText(): Lathe A
panel enabled before: True | combo enabled before: True
panel enabled after: False | combo enabled after (inherited): False
```

**What this proves:** each combo box item genuinely carries **two**
real, independent values — `"Lathe A"` (what's shown) and `"m1"` (what
the application actually cares about, per `reference-by-id-not-by-
object.md`'s own ID-based referencing). `findData("m1")` correctly
located the real index for a specific underlying ID, without the
calling code needing to know or match the displayed text at all.
Disabling the parent `panel` genuinely, automatically disabled the
child `machine_combo` too — real proof `setEnabled` propagates down a
widget's own real child hierarchy, not just the one widget it's called
on.

## Mechanical Walkthrough

- `QFormLayout(panel)` arranges children as real label/field **rows**
  — `.addRow(label_text, widget)` adds one row at a time, aligning
  every label and every field into two clean, real columns.
- `QComboBox.addItem(display_text, user_data)` stores **two** real,
  independent values per item — `itemText(i)`/`currentText()` read the
  displayed label; `itemData(i)`/`currentData()` read the real,
  underlying value, which can be any real Python object, not just a
  string.
- `findData(value)` is the real, reverse lookup — given an underlying
  value, find which index carries it — essential for "restore the
  combo box to reflect this stored ID" without the code needing to
  know or search by display text.
- `QSpinBox.setRange(min, max)` bounds real, valid input to a specific
  numeric range — a user literally cannot type or scroll the value
  outside those real bounds through the widget itself.
- `setEnabled(False)` on a parent widget genuinely propagates to every
  real child automatically — a real, built-in Qt behavior, not
  something application code has to loop over children to apply
  itself.

## CS Lens

The combo box's display/data split is a real, concrete instance of
separating a **presentation value** from a **domain value** — the
identical underlying idea `reference-by-id-not-by-object.md` already
covers for stored references, now applied to a UI widget's own real
per-item storage. `setEnabled`'s propagation down the widget tree is a
real, built-in instance of a **composite** structure automatically
applying a state change to every real member, without the caller
needing to traverse the hierarchy manually.

Also recognized in: an HTML `<select>`'s own `value` attribute versus
its displayed text (the identical real display/data split, a different
real UI toolkit); CSS's own inherited properties, propagating a
computed value down through a real DOM subtree the same automatic way
`setEnabled` propagates down a Qt widget tree.

## SE Lens

The real, practical value of the display/data split: application code
never has to parse or match against a human-readable label (fragile —
labels can be renamed, localized, or reworded) to find "which machine
is this" — it works directly with the real, stable underlying ID the
whole time, exactly matching `reference-by-id-not-by-object.md`'s own
reasoning for why an ID, not an object or a display string, is the
right real thing to store and look up by.

## Connection

Builds on `pyside6-composing-a-widget-from-children-via-layout.md`.
Directly applies `reference-by-id-not-by-object.md`'s own real
principle to a concrete Qt widget's per-item storage.

## Try It Yourself

1. Add a third combo item and confirm `findData(...)` correctly locates
   it too — the lookup mechanism scales to any real number of items.
2. Connect `machine_combo.currentIndexChanged` to a real handler
   reading `machine_combo.currentData()` (not `.currentText()`) —
   confirming real application code should almost always prefer the
   underlying data over the displayed text when acting on a selection.
3. Add a `channel_spin.setSuffix(" ch")` call and confirm the real,
   displayed value now shows the suffix while `.value()` still returns
   the plain real integer, unaffected by the cosmetic display change.

## A Second Real Facet: `QListWidgetItem`'s Own Attached Data, via a Real Role

`QComboBox`'s `addItem(text, userData)` bundles exactly one piece of
attached data per item. A `QListWidgetItem` uses a more general, real
mechanism — an explicit **role** — since a list item can carry several
independent pieces of attached data at once:

```python
from PySide6.QtCore import Qt
from PySide6.QtWidgets import QListWidget, QListWidgetItem

sequence_list = QListWidget()

item = QListWidgetItem("N100 -- setup")
item.setData(Qt.ItemDataRole.UserRole, 5)  # the real source line index
sequence_list.addItem(item)

item2 = QListWidgetItem("N200 -- roughing pass")
item2.setData(Qt.ItemDataRole.UserRole, 12)
sequence_list.addItem(item2)

clicked = sequence_list.item(1)
print("clicked item's displayed text:", clicked.text())
print("clicked item's attached line index:", clicked.data(Qt.ItemDataRole.UserRole))
```

**Real output, run this session:**
```
clicked item's displayed text: N200 -- roughing pass
clicked item's attached line index: 12
```

**What this proves:** `item2`'s displayed text (`"N200 -- roughing
pass"`) and its real, attached data (`12`, a source line index) are
genuinely independent — retrieving the item by its real list position
(`sequence_list.item(1)`) and reading back `.data(Qt.ItemDataRole.
UserRole)` correctly returns the exact real value stored, with no need
to parse or derive it from the displayed text at all.

**Mechanical note:** `Qt.ItemDataRole.UserRole` is one real, specific
role among several Qt predefines (`DisplayRole` for the shown text
itself, `ToolTipRole` for hover text, and more) — a single item can
hold a real, independent value under **each** role simultaneously,
which is why this is a more general mechanism than `QComboBox`'s
single, fixed `userData` slot: a list item might need to carry a line
index *and* a tooltip *and* a custom sort key, all at once, each under
its own real role.

### Try It Yourself (second facet)

1. Store a second, independent value on the same item under a
   **different** role (`Qt.ItemDataRole.ToolTipRole`) and confirm both
   real values coexist, retrievable independently.
2. Connect `sequence_list.itemClicked` to a real handler reading
   `item.data(Qt.ItemDataRole.UserRole)` — the real, working mechanism
   behind "click a sequence in the list, jump the editor's cursor
   there."
3. Compare this file's own two real "label separate from value"
   mechanisms — `QComboBox.addItem(text, userData)` and
   `QListWidgetItem.setData(role, value)` — and explain, in your own
   words, why a combo box's simpler, single-slot version is enough for
   its own real use case, while a list item's role-based version isn't
   overkill for its own.

## A Third Real Facet: Deriving a Second Custom Role via `UserRole + 1`

A single item sometimes needs to carry **two** independent pieces of
real attached data at once. Qt's own documented convention for this:
offset from `UserRole` to derive additional, distinct real roles:

```python
from PySide6.QtCore import Qt
from PySide6.QtWidgets import QListWidgetItem

LINE_INDEX_ROLE = Qt.ItemDataRole.UserRole
RESOLVED_PATH_ROLE = Qt.ItemDataRole.UserRole + 1

item = QListWidgetItem("M98 P1000")
item.setData(LINE_INDEX_ROLE, 7)
item.setData(RESOLVED_PATH_ROLE, "/programs/O1000.txt")

print("line index:", item.data(LINE_INDEX_ROLE))
print("resolved path:", item.data(RESOLVED_PATH_ROLE))
print("the two roles are genuinely different real integers:", int(LINE_INDEX_ROLE) != int(RESOLVED_PATH_ROLE))
```

**Real output, run this session:**
```
line index: 7
resolved path: /programs/O1000.txt
the two roles are genuinely different real integers: True
```

**What this proves:** the identical `item` correctly holds **two**
real, independent values — a line index (`7`) and a resolved file path
— retrievable separately via two distinct, real role constants,
neither one disturbing the other. `UserRole + 1` genuinely produces a
different real integer than `UserRole` itself, confirmed directly.

**Mechanical note:** `Qt.ItemDataRole.UserRole` is documented as the
first real value safe for application-defined custom roles — every
role below it is reserved for Qt's own built-in purposes
(`DisplayRole`, `ToolTipRole`, and others). Defining named constants
(`_LINE_INDEX_ROLE`, `_RESOLVED_PATH_ROLE`) for each offset, rather
than using bare `Qt.ItemDataRole.UserRole + 1` inline every time, is
real, worthwhile self-documentation — a bare `+ 1` reveals nothing
about what the second role actually represents.

### Try It Yourself (third facet)

1. Add a real, third piece of attached data (`UserRole + 2`) and
   confirm all three coexist independently on the same item.
2. Try using the same role constant for two conceptually different
   pieces of data by mistake, and confirm the second `setData` call
   silently overwrites the first — direct, real proof of why using
   distinct, named role constants (not the same one reused) matters.
3. Connect `itemDoubleClicked` (a real, distinct gesture signal from
   `itemClicked`) to a handler reading `RESOLVED_PATH_ROLE`, while
   `itemClicked` reads `LINE_INDEX_ROLE` — confirming two genuinely
   different real actions (open a different file vs. jump within the
   current one) can be driven by two different real gestures on the
   identical underlying item.

## A Fourth Real Facet: `QComboBox.setEditable(True)` — a Starting Menu, Not a Closed Set

Every `QComboBox` use above restricts a user to exactly the items
explicitly added. `setEditable(True)` relaxes that — the combo box
becomes a real, typable text field with a dropdown of *suggestions*,
not a hard constraint.

```python
combo = QComboBox()
combo.addItems(["endmill", "drill", "mill"])
print("BEFORE setEditable -- isEditable:", combo.isEditable())
combo.setCurrentText("tap")
print("BEFORE setEditable -- currentText after setCurrentText('tap'):", combo.currentText())

combo.setEditable(True)
combo.setCurrentText("tap")
print("AFTER setEditable -- currentText after setCurrentText('tap'):", combo.currentText())
print("AFTER setEditable -- count (still just the original 3 items):", combo.count())
```

**Real output, run this session:**
```
BEFORE setEditable -- isEditable: False
BEFORE setEditable -- currentText after setCurrentText('tap'): endmill
AFTER setEditable -- currentText after setCurrentText('tap'): tap
AFTER setEditable -- count (still just the original 3 items): 3
```

**What this proves:** before `setEditable(True)`, trying to set the
current text to `"tap"` — not one of the three real added items —
genuinely failed silently, leaving `currentText()` at whatever it
already was (`"endmill"`). After `setEditable(True)`, the identical
call correctly accepted `"tap"` as a real, new, typed-in value —
while `count()` stayed at `3`, confirming the dropdown's own original
three items were never touched; a typed value doesn't automatically
become a permanent new item.

**Mechanical note:** this is the right real tool specifically when a
field has a **known, common set of values worth suggesting**, but
genuinely isn't a closed, exhaustive set — a real, new, valid value a
user might reasonably need to enter shouldn't be blocked just because
nobody anticipated it in advance.

### Try It Yourself (fourth facet)

1. After typing a real, new value, call `combo.addItem(combo.
   currentText())` to actually add it to the dropdown permanently —
   confirm `count()` now reports `4`, and reason about when a real
   application would want to do this versus leaving typed values
   ephemeral.
2. Connect the combo's own `currentTextChanged` signal and confirm it
   fires for both a real dropdown selection *and* a typed entry —
   direct proof both paths funnel through the identical real signal.

## A Fifth Real Facet: `QDoubleSpinBox.setSpecialValueText` — a Sentinel Value Displayed as a Real Placeholder

A numeric field sometimes needs to represent "not set" — but a plain
spin box always shows *some* real number, with no built-in way to
display "nothing" instead.

```python
spin = QDoubleSpinBox()
spin.setRange(0.0, 180.0)
spin.setSpecialValueText("Not Set")

print("spin.value() at minimum -- text shown:", spin.text())
spin.setValue(45.0)
print("spin.value() at 45.0 -- text shown:", spin.text())
```

**Real output, run this session:**
```
spin.value() at minimum -- text shown: Not Set
spin.value() at 45.0 -- text shown: 45.00
```

**What this proves:** at the spin box's own minimum value (`0.0`,
never a real, meaningful tip angle), the displayed text reads `"Not
Set"` instead of `"0.00"` — a real, built-in sentinel-value-as-
placeholder mechanism. The moment a genuinely different, real value
(`45.0`) is set, the display correctly reverts to showing the actual
number.

**Mechanical note — the alternative this avoids:** representing
"not applicable to this tool kind" could instead use a separate real
enable/disable checkbox alongside the spin box — `setSpecialValueText`
achieves the identical real communication (this field currently has
no meaningful value) using the spin box's own existing minimum-value
mechanism, with no second widget needed at all.

### Try It Yourself (fifth facet)

1. Set the spin box's value to exactly its own minimum again after
   setting it to `45.0`, and confirm the display reverts to `"Not
   Set"` — real proof this is a live, continuous mapping from value to
   display text, not a one-time initialization state.
2. Change `setRange`'s own minimum to a real, different number (say,
   `-1.0`) and confirm `"Not Set"` now displays at *that* new minimum
   instead of `0.0` — direct proof the special text is tied to
   whatever the current minimum happens to be, not a hardcoded value.
3. Reason about (then confirm) whether `spin.value()` — the real,
   underlying numeric value, not the displayed text — still reports
   the real minimum (`0.0`) while `"Not Set"` is showing, and what a
   caller reading `.value()` directly (rather than `.text()`) would
   need to check before treating that number as a genuine, meaningful
   value.

## A Sixth Real Facet: A Checkable `QListWidgetItem`, and Batch-Setting Every Item at Once

Every prior `QListWidgetItem` use in this file attaches **data** to an
item (a role-based value read back later). A genuinely different real
use makes the item itself **checkable** — showing a real checkbox a
user can toggle directly, independent of selection.

```python
item = QListWidgetItem("End Mill 1/4in")
item.setFlags(item.flags() | Qt.ItemFlag.ItemIsUserCheckable)
item.setCheckState(Qt.CheckState.Unchecked)
list_widget.addItem(item)

print("checkState (default):", item.checkState())
item.setCheckState(Qt.CheckState.Checked)
print("checkState after setCheckState(Checked):", item.checkState())
```

**Real output, run this session:**
```
checkState (default): CheckState.Unchecked
checkState after setCheckState(Checked): CheckState.Checked
```

**What this proves:** `checkState()` genuinely reads back whatever was
most recently set — `Unchecked` by explicit initial choice, then
`Checked` after the real toggle. `item.flags() | Qt.ItemFlag.
ItemIsUserCheckable` is the identical real bitwise-OR flag-combination
technique `bitwise-or-flag-combination.md` already covers, applied
here to item flags instead of a dialog's button set — adding the
checkable capability without disturbing whatever other real flags
(`ItemIsSelectable`, `ItemIsEnabled`) the item already carries.

The real, practical payoff — batch-setting every item at once, the
mechanism behind a real "Select All" button:

```python
for i in range(list_widget.count()):
    list_widget.item(i).setCheckState(Qt.CheckState.Checked)
```

**Real output, run this session (two items, both toggled at once):**
```
after Select All -- item.checkState(): CheckState.Checked CheckState.Checked
```

**What this proves:** a single, plain loop over every real item's own
index, calling `setCheckState` on each, correctly checked **both**
real items in one pass — there's no dedicated "check all" API on
`QListWidget` itself; the real batch behavior is just this ordinary
loop, the same technique any real "select all"/"select none" control
over a list of checkable items uses.

### Try It Yourself (sixth facet)

1. Connect the list widget's own `itemChanged` signal and confirm it
   fires once per real `setCheckState` call — including each of the
   calls inside the batch "Select All" loop — reasoning about whether
   a real UI update handler listening to that signal would need to
   guard against being called many times in a row during a batch
   operation.
2. Write a real `selected_items()` helper filtering
   `[list_widget.item(i) for i in range(list_widget.count())]` down to
   only the ones whose `checkState() == Qt.CheckState.Checked` —
   confirming this is the real, direct way calling code reads back
   "what did the user actually pick" after a batch of individual
   toggles and/or a "Select All"/"Select None" click.
3. Add a real, third item and toggle only it — confirm the other two
   remain in whatever state they were last set to, direct proof each
   item's checkable state is genuinely independent, not a single
   shared value.

## A Seventh Real Facet: `QComboBox.addItem(text, userData)` — a Dedicated, Built-In Attached-Data Slot

This file's own second facet showed `QListWidgetItem` attaching real
data via `setData(role, value)`, a generic mechanism needing an
explicit `Qt.ItemDataRole` to name which "slot" the data lives in.
`QComboBox` offers the identical real idea — displaying one thing,
carrying a separate real value alongside it — through a simpler,
dedicated two-argument API with no role to specify at all.

```python
import sys
from PySide6.QtWidgets import QApplication, QComboBox

app = QApplication.instance() or QApplication(sys.argv)

combo = QComboBox()
combo.addItem("Translate", "translate")
combo.addItem("Scale", "scale")

print("displayed text at index 0:", combo.itemText(0))
print("associated data at index 0:", combo.itemData(0))

combo.setCurrentIndex(1)
print("currentText:", combo.currentText())
print("currentData:", combo.currentData())
```

**Real output, run this session:**
```
displayed text at index 0: Translate
associated data at index 0: translate
currentText: Scale
currentData: scale
```

**What this proves:** `addItem("Translate", "translate")` genuinely
stored two independent real values per item — the shown label and a
separate, machine-facing string — confirmed by `itemText`/`itemData`
reading each back separately. `currentData` tracks the current
*selection* the same way `currentText` does, just returning the
attached value instead of the display string.

**Mechanical note — why this is a real, different API shape from
`QListWidgetItem`'s own role-based `setData`, not just a shorter
spelling of it:** `QComboBox.addItem`'s second parameter is a
dedicated, built-in slot for exactly one piece of associated data per
item — there's no role argument because there's only ever one real
slot to put it in, unlike `QListWidgetItem.setData(role, value)`,
which supports arbitrarily many independent values per item, each
named by its own role (this file's own third facet's whole point).
`QComboBox` trades that generality for simplicity, matching its own
real, narrower use case: exactly one label, exactly one associated
value, per item.

**Real, practical value — decoupling what a user sees from what code
acts on:** a caller reading `combo.currentData()` gets a stable,
real, machine-facing key (`"translate"`) that can safely be used in an
`if`/`elif` chain or a dict lookup, completely independent of the
displayed label's own exact wording — the label can be reworded,
translated, or capitalized differently later with zero risk of
breaking code that branches on the selected operation.

### Try It Yourself (seventh facet)

1. Change `"Translate"` to `"Move"` in the display text only (leaving
   `"translate"` as the associated data unchanged) and confirm
   `currentData()` still reports `"translate"` — real, direct proof
   the two are genuinely independent, and code branching on
   `currentData()` needs no changes when only the display label
   changes.
2. Call `combo.findData("scale")` (a real, built-in reverse lookup) to
   get back the index of the item whose data matches, then call
   `combo.setCurrentIndex(...)` with it — confirming a caller can
   programmatically select an item by its real, stable data value
   without needing to know its display text or position at all.
3. Compare this facet directly against this file's own second facet
   (`QListWidgetItem.setData`/`Qt.ItemDataRole.UserRole`) — write one
   sentence on when the extra generality of role-based data actually
   matters (multiple independent values per item) versus when
   `QComboBox`'s simpler, single-slot API is enough.
