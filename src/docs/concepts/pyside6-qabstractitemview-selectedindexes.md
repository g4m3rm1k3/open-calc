# Concept: Multi-Selection and `selectedIndexes()` — One Entry Per Cell, Not Per Row

**What you'll understand by the end:** how to enable real multi-row
selection on a Qt item view, and the real, easy-to-miss mechanical
fact behind `selectedIndexes()`: it returns one `QModelIndex` **per
selected cell**, not per row — including a real, honest look at how
hidden columns actually affect that count.

**Prerequisites:** `pyside6-model-view-with-qfilesystemmodel.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Letting a user select several real rows at once (to open, delete, or
act on multiple files together) needs two real, separate pieces: an
actual multi-selection interaction mode, and a correct way to read back
*which* real rows ended up selected — which turns out to be less
direct than it first sounds, because Qt's own selection model tracks
selection at the level of individual cells, not whole rows.

## The Isolated Example

```python
import sys
from PySide6.QtWidgets import QApplication, QAbstractItemView, QTreeView
from PySide6.QtGui import QStandardItemModel, QStandardItem
from PySide6.QtCore import QItemSelectionModel

app = QApplication.instance() or QApplication(sys.argv)

model = QStandardItemModel(2, 3)
for row in range(2):
    model.setItem(row, 0, QStandardItem(f"file{row}.txt"))
    model.setItem(row, 1, QStandardItem("1 KB"))
    model.setItem(row, 2, QStandardItem("txt"))

view = QTreeView()
view.setModel(model)
view.setSelectionMode(QAbstractItemView.SelectionMode.ExtendedSelection)
view.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
# All 3 columns visible for this first check.

selection_model = view.selectionModel()
for row in range(2):
    idx = model.index(row, 0)
    selection_model.select(idx, QItemSelectionModel.SelectionFlag.Select | QItemSelectionModel.SelectionFlag.Rows)

selected = view.selectedIndexes()
print("ALL COLUMNS VISIBLE -- number of selected indexes for 2 selected rows:", len(selected))
for idx in selected:
    print("  row:", idx.row(), "column:", idx.column())
```

**Real output, run this session:**
```
ALL COLUMNS VISIBLE -- number of selected indexes for 2 selected rows: 6
  row: 0 column: 0
  row: 0 column: 1
  row: 0 column: 2
  row: 1 column: 0
  row: 1 column: 1
  row: 1 column: 2
```

**What this proves:** selecting **2** real rows produced **6** real
selected indexes — one for **every** cell in each selected row (2
rows × 3 columns), not one per row. Code treating `len(selectedIndexes())`
as "the number of selected rows" would be off by a real factor of 3
here.

Now with two of those three columns actually **hidden**:

```python
view.hideColumn(1)
view.hideColumn(2)  # only column 0 stays visible

selected = view.selectedIndexes()
print("only column 0 visible -- number of selected indexes for 2 selected rows:", len(selected))
for idx in selected:
    print("  row:", idx.row(), "column:", idx.column())
```

**Real output, run this session:**
```
only column 0 visible -- number of selected indexes for 2 selected rows: 2
  row: 0 column: 0
  row: 1 column: 0
```

**What this proves:** with only column `0` visible, `selectedIndexes()`
genuinely returned **2** entries, not 6 — Qt itself excludes hidden
columns' indexes from this list. A real, honest, worth-stating
consequence: in an application that only ever shows one column (this
project's own real `ProjectExplorer`, per its Step 31 `hideColumn`
loop), filtering by `index.column() != 0` is real, correct **defensive**
code — it guards against a future change that shows a second column —
rather than something strictly load-bearing for the *current*, single-
visible-column configuration, where hidden columns already never
appear in this list at all.

## Mechanical Walkthrough

- `setSelectionMode(QAbstractItemView.SelectionMode.ExtendedSelection)`
  enables real, standard multi-select interaction — plain click selects
  one item, Ctrl+click adds/removes individual items, Shift+click
  selects a contiguous real range — all built in, no manual click-
  tracking code needed.
- `setSelectionBehavior(...SelectRows)` makes a real click anywhere in
  a row select the **whole row** (every visible cell in it), rather
  than just the one cell clicked.
- `selectedIndexes()` returns a real, flat list of every currently
  selected `QModelIndex` — genuinely one per selected **cell**, which
  is why a row with 3 visible columns contributes 3 real entries, not
  1, to this list.
- Real, correct row-oriented code built on top of `selectedIndexes()`
  has to filter — keeping only `column() == 0` (or whichever single
  column meaningfully identifies "this row") — to recover a real,
  accurate "one entry per selected row" view.

## CS Lens

This is a real, direct consequence of how a genuinely two-dimensional
selection model (rows *and* columns, independently selectable in
general) represents "what's selected": a flat list of every selected
coordinate pair, rather than a higher-level "these rows are selected"
abstraction layered automatically on top. Recovering row-level meaning
from cell-level data is the real, necessary translation step any code
built on `selectedIndexes()` has to perform itself.

Also recognized in: spreadsheet selection models generally (a
selected "row" in a real spreadsheet is genuinely a selection of every
cell in that row, not a separate, higher-level row-selection concept);
any 2D grid UI where "select whole row" is implemented as a real
convenience on top of a more general cell-level selection primitive.

## SE Lens

The real, practical risk of assuming `len(selectedIndexes())` directly
counts selected rows: it's silently, numerically wrong the moment more
than one column is visible — no exception, just an inflated real
count. The real, honest nuance about hidden columns specifically:
relying on "only one column is ever visible, so I don't need to
filter" is real, correct behavior *today*, but genuinely fragile
against a plausible future change (showing a second real column) —
filtering explicitly is the more robust real choice even when it looks
redundant given the current configuration.

## Connection

Builds on `pyside6-model-view-with-qfilesystemmodel.md`. Directly
relevant to any real, multi-file operation (open several, delete
several) built on top of a multi-selectable Qt item view — the
correct row-recovery filter shown here is a real, necessary step
before such an operation can trust its own count of "how many things
are selected."

## Try It Yourself

1. Select the same two rows using `SelectionBehavior.SelectItems`
   (the default, cell-level behavior) instead of `SelectRows`, then
   click only a single cell rather than a whole row — confirm
   `selectedIndexes()` now returns just that one real index, not an
   entire row's worth.
2. Re-show one of the hidden columns (`view.showColumn(1)`) after
   selecting rows, and confirm `selectedIndexes()`'s count immediately
   reflects the newly-visible column too — the filtering effect is
   live, tied to current visibility, not fixed at selection time.
3. Write a real, generic helper function `selected_rows(view)`
   returning a real, de-duplicated set of row numbers regardless of
   how many columns are currently visible — a robust, reusable version
   of the filtering this file's own example performs inline.
