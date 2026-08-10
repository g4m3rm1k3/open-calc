# Concept: `QTreeWidget` — a Simpler, Self-Contained Tree

**What you'll understand by the end:** how to build a real, nested
tree UI directly out of `QTreeWidgetItem`s (parent/child relationships
via `.addChild()`), and how this is a genuinely different, simpler
real approach from `QTreeView` + `QFileSystemModel`'s own Model/View
split — and when each is the right real choice.

**Prerequisites:** `pyside6-model-view-with-qfilesystemmodel.md`,
`pyside6-qformlayout-and-databound-widgets.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Some real, nested data — a handful of items, each with a few children
— is already fully computed, in Python, before the UI ever needs to
show it. Building a full Model/View pair (`pyside6-model-view-with-
qfilesystemmodel.md`'s own real approach) for something this small and
static is real, unnecessary ceremony — that architecture earns its
real complexity specifically when the underlying data is large, external,
or changes independently of the UI (a real, live filesystem). A tree
of already-known, already-in-Python real values needs something
simpler.

## The Isolated Example

```python
import sys
from PySide6.QtWidgets import QApplication, QTreeWidget, QTreeWidgetItem

app = QApplication.instance() or QApplication(sys.argv)

tree = QTreeWidget()
tree.setHeaderHidden(True)

sequence_item = QTreeWidgetItem(["N10 -- setup"])
call_item = QTreeWidgetItem(["M98 P1000"])
sequence_item.addChild(call_item)

tree.addTopLevelItem(sequence_item)
tree.expandAll()

print("top-level item count:", tree.topLevelItemCount())
print("sequence item's own child count:", sequence_item.childCount())
print("call item's real parent is the sequence item:", call_item.parent() is sequence_item)
print("call item's own text:", call_item.text(0))

sequence_item.setData(0, 32, "line-5")
print("attached data on column 0:", sequence_item.data(0, 32))
```

**Real output, run this session:**
```
top-level item count: 1
sequence item's own child count: 1
call item's real parent is the sequence item: True
call item's own text: M98 P1000
attached data on column 0: line-5
```

**What this proves:** `call_item`, added via `sequence_item.addChild(
...)`, genuinely became a real child — `.parent()` correctly returns
the exact `sequence_item` object it was nested under, and `tree.
topLevelItemCount()` stays `1` (the nesting doesn't create a second
top-level item). `setData(0, 32, ...)` — a real, custom role at column
`0` — shows `QTreeWidgetItem.setData` taking a **column index** as its
first argument, unlike `QListWidgetItem.setData` (Step 51's own real
API, single-column, no index needed).

## Mechanical Walkthrough

- `QTreeWidgetItem(["text"])` constructs a real, standalone item — its
  constructor takes a real list of strings, one per real column (a
  single-column tree, as here, just needs a one-element list).
- `.addChild(item)` nests one real item underneath another — the
  parent/child relationship lives directly on the items themselves, no
  separate model object involved at all.
- `tree.addTopLevelItem(item)` adds a real, top-level (root-level) item
  to the tree widget itself — everything else nests underneath a real
  top-level item via `.addChild(...)`.
- `tree.expandAll()` visually expands every real, nested branch by
  default, rather than requiring a user to manually click each one
  open.
- `item.setData(column, role, value)` — the real, column-aware sibling
  of `QListWidgetItem.setData(role, value)` (Step 51) — a tree item can
  have several real columns, each independently carrying its own
  attached data under any real role.

## CS Lens

This is a genuinely different real architectural choice from Model/View
— `QTreeWidget` **is** its own data store; each `QTreeWidgetItem` holds
its own real content and structure directly, with no separate model
object mediating access. `QTreeView` + `QFileSystemModel`, by contrast,
keeps the view and the data genuinely separate, communicating through
`QModelIndex` (per `pyside6-model-view-with-qfilesystemmodel.md`'s own
CS Lens). Both are real, valid trees; the real, structural difference
is where the data actually lives.

Also recognized in: many GUI toolkits offering both a "simple,
self-contained" tree/list widget and a "full Model/View" one for the
identical real visual shape — the same real tradeoff (simplicity for
small, static, already-in-memory data vs. a real, separate model for
large, external, or independently-changing data) recurs broadly.

## SE Lens

The real, concrete reason this project reaches for `QTreeWidget` here,
specifically: the sequence/call data is a handful of already-computed
Python objects, built once by `summarize_program`, with no real need
to lazily load or watch an external, changing data source the way a
real filesystem does. Building a full `QAbstractItemModel` subclass for
this would be real, genuine over-engineering — more real code,
more real indirection, for data that's already fully known and small.
`QFileSystemModel`'s own real justification (Step 31) — a potentially
huge, real, live-changing directory tree — simply doesn't apply here.

## Connection

Builds on `pyside6-model-view-with-qfilesystemmodel.md`, directly
contrasted as the simpler real alternative for a genuinely different
real situation. `pyside6-qformlayout-and-databound-widgets.md`'s own
`QListWidgetItem.setData` facet is the direct, single-column ancestor
of this file's own column-aware version.

## Try It Yourself

1. Add a second, sibling top-level item with its own children, and
   confirm `tree.topLevelItemCount()` correctly becomes `2`, with each
   one's own children nested independently.
2. Add a real, second column (`QTreeWidgetItem(["N10 -- setup",
   "3 calls"])`) and confirm both columns display correctly — a real,
   genuine use for the column-aware `setData`/`text(column)` API this
   file's own example demonstrates.
3. Reason about, concretely, at what real point (how large, how
   dynamic) this project's own sequence/call data would actually
   justify switching to a full Model/View tree instead — what real
   property would have to change for `QFileSystemModel`'s own
   justification to start applying here too?
