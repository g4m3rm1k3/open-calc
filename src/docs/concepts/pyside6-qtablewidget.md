# Concept: `QTableWidget` — Rows and Columns, a Third Real Shape Alongside List and Tree

**What you'll understand by the end:** `QTableWidget`'s real
row-and-column grid API (`setRowCount`, `setColumnCount`,
`setHorizontalHeaderLabels`, `setItem`), how it's a genuinely
different real shape from a flat `QListWidget`/`QComboBox` and a
nested `QTreeWidget`, and when a real, two-dimensional grid of data is
actually the right widget to reach for.

**Prerequisites:** `pyside6-qtreewidget-self-contained-tree.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Not every real collection of data is a flat list (per `QListWidget`/
`QComboBox`) or a nested hierarchy (per `QTreeWidget`) — a real
spreadsheet-shaped dataset, several independent fields per real row
(a tool's name, diameter, flute count), needs a genuine **grid**:
rows and columns, each row holding one real record, each column
holding one real field of every record, both independently sizable
and labeled.

## The Isolated Example

```python
table = QTableWidget()
table.setColumnCount(3)
table.setHorizontalHeaderLabels(["Name", "Diameter", "Flutes"])

tools = [("End Mill 1/4in", "6.35", "4"), ("Drill 5mm", "5.0", "2")]
table.setRowCount(len(tools))
for row, (name, diameter, flutes) in enumerate(tools):
    table.setItem(row, 0, QTableWidgetItem(name))
    table.setItem(row, 1, QTableWidgetItem(diameter))
    table.setItem(row, 2, QTableWidgetItem(flutes))

print("rowCount:", table.rowCount())
print("columnCount:", table.columnCount())
print("item(0,0).text():", table.item(0, 0).text())
print("item(1,1).text():", table.item(1, 1).text())
```

**Real output, run this session:**
```
rowCount: 2
columnCount: 3
item(0,0).text(): End Mill 1/4in
item(1,1).text(): 5.0
```

**What this proves:** `table.item(0, 0)` and `table.item(1, 1)`
address two genuinely different real cells by their own explicit
`(row, column)` coordinates — `item(1, 1)` correctly returns the
second tool's own `"Diameter"` field (`"5.0"`), not its name or flute
count. Every cell is addressed by its own two-dimensional position,
something neither a flat list (one dimension) nor a tree (parent/
child nesting, not rows and columns) can express directly.

A real, common follow-up setting — making the table read-only:

```python
table.setEditTriggers(QTableWidget.EditTrigger.NoEditTriggers)
print("editTriggers after NoEditTriggers:", table.editTriggers())
```

**Real output, run this session:**
```
editTriggers after NoEditTriggers: EditTrigger.NoEditTriggers
```

**What this proves:** `QTableWidgetItem` cells are, by Qt's own
default, directly editable in place (double-click to type into a
cell) — `NoEditTriggers` genuinely disables that, confirmed by reading
the real, updated `editTriggers()` value back, correct for a real
table meant only to *display* data (like an imported tool library)
rather than accept direct in-grid edits.

## Mechanical Walkthrough

- `setColumnCount(n)`/`setRowCount(n)` establish the real grid's own
  dimensions — independently settable, and resizable later as real
  data changes.
- `setHorizontalHeaderLabels([...])` labels each real column — a list
  of strings, one per column, shown as the table's own header row.
- `setItem(row, column, QTableWidgetItem(text))` places one real cell
  — `QTableWidgetItem` is the per-cell content object, analogous to
  `QListWidgetItem`/`QTreeWidgetItem` but addressed by an explicit
  `(row, column)` pair instead of a flat or nested position.
- `item(row, column)` reads a cell back the same way it was written —
  by its own explicit two-dimensional coordinate.
- `setEditTriggers(EditTrigger.NoEditTriggers)` is a real, table-wide
  setting controlling whether a user can edit cells directly in place
  at all — independent of anything about the data itself.

## CS Lens

This is a real, concrete instance of choosing a **data structure's own
shape to match the real shape of the data** — a flat list for
one-dimensional data, a tree for hierarchical/nested data, a
two-dimensional grid (a real matrix, conceptually) for data that's
naturally organized as records-with-fixed-fields. Picking the widget
whose own real shape matches the data's actual shape (rather than
forcing a flat or nested widget to awkwardly represent tabular data)
is the identical underlying judgment call behind choosing the right
data structure in code generally.

Also recognized in: a spreadsheet application's own native grid; an
HTML `<table>` vs. a `<ul>` (flat) or nested `<ul>` (tree); a
database's own row/column table shape, the direct conceptual ancestor
of this widget's own real layout.

## SE Lens

The real, practical choice between the three real widgets this
project has now used: `QListWidget`/`QComboBox` when each real item is
a single, atomic value; `QTreeWidget` when items have a genuine
parent/child relationship; `QTableWidget` when every real item has
**several independent, named fields** that are naturally compared
column-by-column across many rows at once (sorting by diameter,
scanning a whole column of flute counts) — a shape neither of the
other two widgets expresses without real, awkward workarounds (cramming
multiple fields into one list item's display text, or building a
tree with no real hierarchy just to get multiple columns via
`QTreeWidget`'s own column support).

## Connection

Builds on `pyside6-qtreewidget-self-contained-tree.md` as the direct,
real contrast this file's own framing depends on — both are
self-contained (item-based) widgets, in the same family as
`QListWidget`/`QComboBox` (Steps 43/51), each choosing a genuinely
different real shape for its own data. A real, applied instance in
this project's own history: a tool-library panel displaying real,
imported tool and holder records — one row per real tool, one column
per real field (name, diameter, flute count, and others) — set
read-only via `NoEditTriggers` since edits belong in a dedicated real
edit dialog, not scattered directly into table cells.

## Try It Yourself

1. Call `table.item(5, 0)` — a row that was never populated — and
   observe the real, resulting `None` rather than a crash; reason
   about why a caller needs to check for `None` before calling
   `.text()` on an arbitrary cell.
2. Add a real, fourth column and populate it only for some rows,
   leaving others' `QTableWidgetItem` unset entirely — confirm
   `item(row, 3)` for an unset cell also returns `None`, the identical
   real behavior as an out-of-range row.
3. Compare this file's own grid shape directly against
   `pyside6-qtreewidget-self-contained-tree.md`'s own nested shape by
   trying to represent this file's tool data (name/diameter/flutes per
   row) in a `QTreeWidget` instead — reasoning concretely about what
   real, awkward choice that would force (a flat, one-level tree with
   no actual hierarchy, columns bolted on) that `QTableWidget`
   expresses directly instead.

## A Real Second Facet: `cellDoubleClicked` — Row Activation, Addressed Like Everything Else in This File

A real, read-only table (per this file's own `NoEditTriggers` example)
still needs some way for a user to *act* on a specific row — opening
whatever that row represents. `QTableWidget`'s own real signal for
this reports the exact same `(row, column)` coordinate pair every
other method in this file already addresses cells by.

```python
import sys
from PySide6.QtWidgets import QApplication, QTableWidget, QTableWidgetItem

app = QApplication.instance() or QApplication(sys.argv)

table = QTableWidget(2, 1)
table.setItem(0, 0, QTableWidgetItem("row zero"))
table.setItem(1, 0, QTableWidgetItem("row one"))

activated = []
table.cellDoubleClicked.connect(lambda row, col: activated.append((row, col)))

table.cellDoubleClicked.emit(1, 0)
print("activated:", activated)
```

**Real output, run this session:**
```
activated: [(1, 0)]
```

**What this proves:** the connected slot received `(1, 0)` — the exact
real row/column pair a genuine double-click on that cell would report
— confirming `cellDoubleClicked` hands a real handler the identical
coordinate system `setItem`/`item` already use, per this file's own
Mechanical Walkthrough, rather than some separate row-index-only or
item-object-based addressing scheme.

**Mechanical note — why a table typically only needs the row, not the
column:** a real handler responding to "the user wants to open what
this row represents" usually only cares which **row** was activated —
the column argument exists because the signal fires per-cell, not
per-row, but a handler is free to simply ignore it (as this project's
own real code does, naming it `_column` with a leading underscore to
signal "received, deliberately unused") when every column in a row
maps to the identical underlying real record.

### Try It Yourself (second facet)

1. Connect a handler to the plain `cellClicked` signal (single click,
   not double) alongside `cellDoubleClicked`, and trigger both against
   the same cell — confirm they're genuinely independent signals, both
   firing for their own respective real trigger.
2. Look up `QTableWidget.currentCellChanged` — a signal reporting both
   the newly- and previously-current cell — and reason about when a
   real feature would need the *previous* cell's coordinates too,
   versus `cellDoubleClicked`'s simpler single-cell report.
3. Build a small, real table where double-clicking any cell in a row
   should behave identically regardless of which column was actually
   clicked (as this file's own SE Lens describes for a real, per-row
   "open this record" action) — confirming the handler correctly
   ignores its own `column` argument rather than branching on it.

## A Real Third Facet: `setBackground`/`setForeground` — Per-Item Color, Independent of Text

A real, common table need — visually flagging *which* rows matter
(added, removed, changed) without a whole extra column spelling it
out in words — colors individual cells directly, per `QTableWidgetItem`.

```python
import sys
from PySide6.QtGui import QColor
from PySide6.QtWidgets import QApplication, QTableWidget, QTableWidgetItem

app = QApplication.instance() or QApplication(sys.argv)

table = QTableWidget(2, 1)
plain_item = QTableWidgetItem("plain")
colored_item = QTableWidgetItem("colored")
colored_item.setBackground(QColor("#c9f7c9"))
colored_item.setForeground(QColor("#1a1a1a"))
table.setItem(0, 0, plain_item)
table.setItem(1, 0, colored_item)

print("plain background:", table.item(0, 0).background().color().name())
print("colored background:", table.item(1, 0).background().color().name())
print("colored foreground:", table.item(1, 0).foreground().color().name())
```

**Real output, run this session:**
```
plain background: #000000
colored background: #c9f7c9
colored foreground: #1a1a1a
```

**What this proves:** the two items, in two different real rows of the
same column, carry genuinely independent colors — `plain_item` was
never touched, and reading its background back reports Qt's own real
unset-brush default; `colored_item`'s own `setBackground`/
`setForeground` calls are reflected exactly in what's read back from
it, confirming color is real, per-item state, not something set once
for a whole column or table.

**Mechanical note — why this is a genuinely different mechanism from
`pyside6-qtextcharformat-and-qcolor.md`'s own coloring:** that file's
`QTextCharFormat` colors *ranges of characters inside a text document*.
`QTableWidgetItem.setBackground`/`setForeground` colors *a whole grid
cell* — conceptually similar (both ultimately paint with a `QColor`),
but a completely different real API surface, tied to a table's own
per-cell item objects rather than a document's own character
positions.

**Real, practical use — flagging row status by color, keyed off real
data, not manual per-row logic:** a small `{status_value: QColor}`
lookup table, checked once per row against whatever value that row
actually represents, applies a real, consistent color scheme without
hardcoding a color decision separately for every single row.

### Try It Yourself (third facet)

1. Color an entire row (every column of one real row, not just one
   item) and confirm each `QTableWidgetItem` needs its own
   `setBackground` call — there's no single "color this whole row" method,
   confirming color really is per-item, not per-row.
2. Try `item.setBackground(QColor())` (a real, default-constructed,
   "no color" `QColor`) after previously coloring an item, and check
   whether the background visually reverts — researching what a
   default `QColor` actually represents to Qt's own painting system.
3. Build a small `{status: QColor}` lookup dict (matching this file's
   own real practical-use pattern) and apply it across every item in a
   real table populated from a list of records with a `status` field
   each — confirming the same lookup-then-apply shape scales to any
   number of real rows without per-row special-casing.

## A Real Fourth Facet: `QHeaderView.setSectionResizeMode` — Per-Column Resize Behavior

A real, common two-column shape — one short, label-like column (a
status word) next to one long, variable-width column (a file path) —
looks wrong under Qt's own default column sizing: both columns resize
identically, wasting space on the short one or truncating the long one.

```python
import sys
from PySide6.QtWidgets import QApplication, QHeaderView, QTableWidget, QTableWidgetItem

app = QApplication.instance() or QApplication(sys.argv)

table = QTableWidget(1, 2)
table.setItem(0, 0, QTableWidgetItem("Modified"))
table.setItem(0, 1, QTableWidgetItem("some/very/long/relative/path/to/a/file.nc"))
table.resize(600, 100)
table.show()

header = table.horizontalHeader()
print("default mode col0:", header.sectionResizeMode(0))

header.setSectionResizeMode(0, QHeaderView.ResizeMode.ResizeToContents)
header.setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
app.processEvents()

print("after set -- col0 width:", table.columnWidth(0))
print("after set -- col1 width:", table.columnWidth(1))
print("sum of widths:", table.columnWidth(0) + table.columnWidth(1))
print("viewport width:", table.viewport().width())
```

**Real output, run this session:**
```
default mode col0: ResizeMode.Interactive
after set -- col0 width: 103
after set -- col1 width: 479
sum of widths: 582
viewport width: 582
```

**What this proves:** the real, unset default (`Interactive`, a user
can drag either column's own border to any width) never adapts to
content on its own. After setting column 0 to `ResizeToContents` and
column 1 to `Stretch`, column 0 shrank to exactly fit its own real
`"Modified"` text (`103` px — no more, no less) and column 1 expanded
to absorb every remaining real pixel (`479`), summing precisely to the
table's own real viewport width (`582`) — the two resize modes
genuinely cooperate: one claims only what it needs, the other claims
everything else.

**Mechanical note — a real, per-widget parallel to this file's own
earlier lessons:** this is the identical real principle
`pyside6-qsizepolicy.md`'s whole file already establishes for widgets
inside a layout (some elements should hug their content, others should
absorb whatever space is left) — `QHeaderView.setSectionResizeMode`
applies the same real idea one level more specifically, to individual
*columns* inside one table's own header, rather than to whole widgets
inside a layout.

### Try It Yourself (fourth facet)

1. Set **both** columns to `Stretch` and observe the real, resulting
   widths — confirming two competing `Stretch` columns split remaining
   space, roughly evenly, the same way two `Expanding`-policy widgets
   share space in a layout.
2. Set column 0 to `Fixed` and call `table.setColumnWidth(0, 150)`
   explicitly — confirm the column stays exactly `150` px regardless of
   its own real content length, direct proof `Fixed` ignores content
   entirely, unlike `ResizeToContents`.
3. Resize the table window itself smaller after both modes are set,
   and confirm only the `Stretch` column's own width actually changes
   — the `ResizeToContents` column stays pinned to its content's real
   size regardless of how much total space is available.
