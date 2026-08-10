# Concept: Qt's Model/View Architecture, via `QFileSystemModel`

**What you'll understand by the end:** how a real `QTreeView` (a pure
**view**, owning no file data itself) binds to `QFileSystemModel` (a
**model** reading the real filesystem directly), how a `QModelIndex`
lets the two communicate about "this one row" without either side
knowing the other's internals, and why the model's own directory scan
happens asynchronously rather than the instant it's requested.

**Prerequisites:** `pyside6-qapplication-and-mainwindow.md`,
`event-loop.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Displaying a real, potentially large filesystem tree in a GUI has two
genuinely separate real concerns: knowing *what's actually on disk*
(reading directories, tracking changes) and knowing *how to draw a
tree widget* (rows, indentation, expand/collapse). Every earlier
custom widget in this project managed its own data directly —
`FindBar` held its own `_matches` list, `LineNumberArea` drew from the
editor it wrapped. A real file browser is different: reading an entire
directory tree into a Python data structure up front would be real,
unnecessary, and potentially very expensive work for something the
operating system already tracks and can report incrementally.

## The Isolated Example

```python
import sys
import time
from PySide6.QtWidgets import QApplication, QFileSystemModel, QTreeView

app = QApplication.instance() or QApplication(sys.argv)

model = QFileSystemModel()
model.setRootPath("/some/real/directory")

view = QTreeView()
view.setModel(model)
root_index = model.index("/some/real/directory")
view.setRootIndex(root_index)

print("view's model IS the QFileSystemModel:", view.model() is model)
print("row count IMMEDIATELY after setRootPath:", model.rowCount(root_index))

deadline = time.monotonic() + 3
while time.monotonic() < deadline and model.rowCount(root_index) == 0:
    app.processEvents()
    time.sleep(0.01)

print("row count AFTER letting the event loop run:", model.rowCount(root_index))

for row in range(model.rowCount(root_index)):
    idx = model.index(row, 0, root_index)
    print(" real entry:", model.fileName(idx), "| isDir:", model.isDir(idx))
```

**Real output, run this session (a real directory with two files and
one subdirectory):**
```
view's model IS the QFileSystemModel: True
row count IMMEDIATELY after setRootPath: 0
row count AFTER letting the event loop run: 3
 real entry: notes.md | isDir: False
 real entry: report.txt | isDir: False
 real entry: subdir | isDir: True
```

**What this proves:** `view.model()` genuinely returns the exact same
`QFileSystemModel` instance passed to `setModel` — the view holds a
real reference to the model, not a copy of its data. Immediately after
`setRootPath`, the row count was **zero** — real proof the directory
scan hadn't finished yet — and only after letting the event loop
actually run (`app.processEvents()` in a loop) did the row count
correctly reflect the real, three real filesystem entries, each
queryable through the model (`.fileName(idx)`, `.isDir(idx)`) without
ever touching a raw file path directly.

## Mechanical Walkthrough

- `QFileSystemModel()` is a real **model** — it reads the actual
  filesystem, watches for real changes, and exposes results through a
  standard interface any compatible **view** can consume; it holds no
  UI concerns at all.
- `QTreeView` is a real, pure **view** — it knows how to draw rows,
  indentation, and expand/collapse arrows, but holds no real file data
  of its own; `setModel(model)` is the one call connecting them.
- A `QModelIndex` (returned by `model.index(...)`) is a real, opaque
  handle identifying "this one row/item" — the view uses indices to ask
  the model "what should I draw here," and the model uses them
  internally to look up the real, corresponding data, without either
  side needing to know the other's actual internal representation.
- `model.isDir(index)`/`.fileName(index)`/`.filePath(index)` are real,
  read-only queries against the model, given an index — the correct,
  real way to ask "what is this row" without the caller ever parsing
  a raw path string itself.
- `QFileSystemModel`'s own directory scan runs **asynchronously** —
  `setRootPath` returns immediately, before the real filesystem read
  completes; the model announces completion later via its own
  `directoryLoaded` signal, which requires Qt's real event loop to
  actually run before it can fire at all (per `event-loop.md`'s own
  "wait, then react" shape) — exactly why `rowCount` reports `0` until
  something (`app.processEvents()`, or a real, running application's
  own event loop) lets that loop turn at least once.

## CS Lens

This is the **Model/View** architectural pattern (a close relative of
MVC): a clean, real separation between data (the model) and its
presentation (the view), communicating through a narrow, stable
interface (`QModelIndex`-based queries) rather than the view directly
reaching into the model's own internal representation. This is a real,
different shape from every earlier custom widget in this project —
`FindBar` and `LineNumberArea` are both genuinely simpler cases where
the widget owns its own small, in-memory data directly; `ProjectExplorer`
delegates *all* real data ownership to a separate, purpose-built model
object it never inspects the internals of.

Also recognized in: `repository-pattern.md`'s own real idea (hiding a
data store's access details behind a small, stable interface) — a
worth-naming, real parallel, not the identical mechanism: a repository
hides a database behind domain-shaped methods; a Qt model hides a data
source behind the model/view protocol specifically for display
purposes. Also: React's own separation of data (state/props) from
rendering (JSX) — a different real mechanism, the same underlying
instinct.

## SE Lens

The real, practical payoff: `QFileSystemModel` never has to be told
about every file up front — it reads real, incremental filesystem
data on demand, watches for real changes on disk, and any real view
bound to it automatically reflects updates, all without the
application ever writing its own file-tracking code. The real,
concrete cost of this design showing up immediately in practice: the
view's own data isn't synchronously ready the instant it's requested —
any code that needs the model's real content (a test, an assertion)
has to account for the async load, not assume it completed the moment
`setRootPath` returned.

## Connection

Builds on `pyside6-qapplication-and-mainwindow.md` and `event-loop.md`
(the real reason the async load requires the event loop to actually
run). The real technique for correctly *waiting* for that async load
to finish — used in this project's own tests — gets its own, fuller
treatment in `pyside6-manual-event-loop-pumping-for-async-test-
waiting.md`.

## Try It Yourself

1. Call `model.setNameFilters(["*.txt"])` and `model.setNameFilterDisables(False)`
   before waiting for the load, then confirm only matching real files
   appear in the row-by-row output — the model itself supports real
   filtering, with no manual filename checking needed in application
   code.
2. Point `setRootPath` at a directory containing **hundreds** of real
   files and time how long the initial `rowCount` stays `0` before the
   async scan completes — a real, concrete sense of why this can't be
   synchronous for a large enough real directory.
3. Compare `model.index("/some/path")` (looking up an index by a real
   path string) against `model.filePath(index)` (the reverse
   direction) — confirm they're genuine inverses of each other for a
   real, valid path.
