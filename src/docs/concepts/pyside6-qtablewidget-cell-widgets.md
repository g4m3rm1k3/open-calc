# Concept: `QTableWidget.setCellWidget` — a Live Widget Inside a Cell, Not Text

**What you'll understand by the end:** how `setCellWidget` embeds a
real, interactive widget (a spin box, a combo box) directly inside a
table cell — a genuinely different real mechanism from a plain
`QTableWidgetItem`'s static text — and the real, easy-to-miss
consequence: a widget-holding cell and a text-holding cell are
mutually exclusive per position, `item()` returning `None` wherever
`setCellWidget()` was used instead.

**Prerequisites:** `pyside6-qtablewidget.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

`pyside6-qtablewidget.md` already covers a table of plain, read-only
text cells — correct for *displaying* tabular data, but genuinely
insufficient the moment a real cell needs to be **directly editable
in place** with something more structured than free-text typing: a
bounded number (a spin box), a fixed set of choices (a combo box).
`QTableWidgetItem`'s own plain text editing has no real way to enforce
either constraint.

## The Isolated Example

```python
table = QTableWidget()
table.setColumnCount(2)
table.setRowCount(2)

spin = QSpinBox()
spin.setValue(5)
table.setCellWidget(0, 0, spin)
table.setItem(0, 1, QTableWidgetItem("plain text"))

print("cellWidget(0,0):", table.cellWidget(0, 0))
print("cellWidget(0,0).value():", table.cellWidget(0, 0).value())
print("cellWidget(0,1) (no widget set here):", table.cellWidget(0, 1))
print("item(0,0) (a widget cell, not an item):", table.item(0, 0))
```

**Real output, run this session:**
```
cellWidget(0,0): <PySide6.QtWidgets.QSpinBox(0x1f319211a00) at 0x000001f31af30100>
cellWidget(0,0).value(): 5
cellWidget(0,1) (no widget set here): None
item(0,0) (a widget cell, not an item): None
```

**What this proves:** `cellWidget(0, 0)` genuinely returns the real,
live `QSpinBox` object — `.value()` reads its actual current numeric
value directly, not text that happens to look like a number.
`cellWidget(0, 1)` — a cell populated via `setItem`, not
`setCellWidget` — correctly returns `None`: no widget lives there.
**`item(0, 0)`** — the same coordinate the spin box occupies — also
returns `None`: a widget-holding cell has no `QTableWidgetItem` at
that position at all, confirming the two mechanisms are genuinely
separate, mutually exclusive ways of populating a given cell.

## Mechanical Walkthrough

- `setCellWidget(row, column, widget)` places a real, ordinary Qt
  widget — constructed exactly like any standalone widget — directly
  into a table cell, parented into the table's own internal layout.
- The embedded widget stays fully **live and interactive** — a
  `QSpinBox` in a cell responds to real clicks and typed input exactly
  as it would anywhere else; its own signals (`valueChanged`,
  `currentTextChanged`) still fire normally.
- `cellWidget(row, column)` reads back whatever widget (if any) was
  placed there; `item(row, column)` reads back whatever
  `QTableWidgetItem` (if any) was placed there — the two are
  independent real slots, and a given cell coordinate populates only
  one of them, never both, in ordinary use.
- Reading a widget-cell's own real, current value means going through
  the **widget itself** (`.value()`, `.currentText()`) — there is no
  plain text representation to read via `item(...).text()`, since no
  item exists there at all.

## CS Lens

This is a real, concrete instance of **composing** a complex UI
element from a simpler container plus fully-independent, live child
widgets, rather than the container reimplementing editing behavior
itself. `QTableWidgetItem`'s own in-place text editing and
`setCellWidget`'s embedded-widget approach are two genuinely different
real strategies for the identical underlying goal (letting a user
change what's in a cell) — one a lightweight, built-in text editor;
the other, full delegation to an arbitrary, real, independent widget
with its own complete behavior.

Also recognized in: a spreadsheet application embedding a real
dropdown or checkbox directly into specific cells (Excel/Google
Sheets "data validation" dropdowns); any real data-grid UI library
(AG Grid, React Table) offering a "cell renderer"/"cell editor"
concept — the identical real idea of substituting a fully custom,
live component for a cell's default plain-text rendering.

## SE Lens

The real, practical choice: plain `QTableWidgetItem` cells (per
`pyside6-qtablewidget.md`) are the right tool for **displaying**
tabular data, especially read-only data, since they're lightweight and
need no separate widget construction per cell. `setCellWidget` costs
more — a real, independent widget object per populated cell, each with
its own real event handling — but is the right, necessary tool the
moment a cell needs **constrained, structured** editing (a bounded
number, a fixed choice) that free-text editing can't enforce on its
own.

## Connection

Builds directly on `pyside6-qtablewidget.md`, this file's own real
contrast — a table whose cells hold live, independent widgets instead
of static item text. A real, applied instance in this project's own
history: a job's per-channel tool-assignment table, where each real
row's tool-number cell is a live `QSpinBox` and its assigned-assembly
cell is a live `QComboBox`, both directly editable in place, refreshed
via `set_available_assemblies` while explicitly preserving each row's
own current selection. The same real table also sets
`horizontalHeader().setSectionResizeMode(column, QHeaderView.
ResizeMode.Stretch)` on its combo-box column — a real, separate,
column-level sizing setting (that column claims any extra real
horizontal space the table has) that's independent of, and freely
combinable with, whichever mechanism populates the cells themselves.

## Try It Yourself

1. Call `setCellWidget` a **second** time on the same `(row, column)`
   with a different widget, and confirm `cellWidget(row, column)`
   afterward returns the **new** widget, not the old one — reasoning
   about what happens to the original widget once it's no longer
   referenced anywhere.
2. Connect a widget-cell's own real signal (`spin.valueChanged`) to a
   handler, and confirm it fires when a user (or test code calling
   `.setValue(...)` directly) changes it — the identical real signal
   behavior the same widget would have completely outside any table.
3. Try calling `table.item(0, 0).text()` directly on a widget-cell
   coordinate (with no `None` check first) and read the real,
   resulting `AttributeError` — direct, concrete proof of why a caller
   has to know (or check) which of the two mechanisms populated a
   given cell before reading it back.
