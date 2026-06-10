# Python Tool Database — LAB 59 — XML Report Tab in the UI

**Prerequisites:** Lab 58 (you have `build_report` and `print_report`). Lab 36 (QAbstractTableModel). Lab 37 (QSortFilterProxyModel). You can display data in a Qt table and you have a working report as a list of dicts. This lesson puts that report on screen.

**What this lab adds:**
- `QTabWidget` — a tabbed container that switches between two views with a single click
- A read-only table model — the same `QAbstractTableModel` pattern, but the user cannot edit cells
- A file-picker button that loads an XML file and populates the report table
- Why XML parsing must not happen on the Qt GUI thread — and a note on what to do about it

**Time:** 55–65 minutes

---

## What You Will Build

A second tab called "Reports" appears next to the existing "Tools" tab. The Reports tab has a "Load XML..." button and a table. Click the button, pick `sample_operations.xml`, and the table fills with the joined operation report — one row per operation, sortable by clicking column headers.

```
┌─ Tools ─┬─ Reports ─────────────────────────────────────────┐
│          │  [Load XML...]                                    │
│          │                                                   │
│          │  Operation   │ Tool Name        │ SFM  │ Feed    │
│          │  ──────────────────────────────────────────────  │
│          │  POCKET-1    │ 1/2 FLAT ENDMILL │ 600  │ 0.003   │
│          │  POCKET-2    │ 1/2 FLAT ENDMILL │ 600  │ 0.003   │
│          │  DRILL-1     │ 1/4 DRILL        │ 80   │ 0.005   │
└──────────┴───────────────────────────────────────────────────┘
```

---

> **Quick Check — try to answer before reading:**
>
> 1. You have a `QAbstractTableModel` used for the Tools tab. Can you reuse it for the Reports tab, or do you need a new model class? What determines the answer?
> 2. In Lab 36, `data()` returned `"—"` for `None` values. What should a read-only cell return when the user tries to edit it?
> 3. `QTabWidget` holds multiple widgets. When the user switches tabs, does Qt destroy and recreate the hidden widget, or keep it in memory?
>
> *(Answers at the end of this lab)*

---

## Concept: `QTabWidget`

**What it is:** A container widget that holds multiple child widgets, showing one at a time. A tab bar at the top lets the user switch between them.

**The problem before:** Your application has one view — the tool table. Adding a second view (the report) means either replacing the first view entirely when the user wants reports, or showing both simultaneously in a split. Neither is ideal — replacing loses context, splitting is cramped.

**The solution:** `QTabWidget` keeps both views alive in memory. The user switches between them instantly — no reload, no layout reshuffling.

**Smallest possible example:**

```python
from PySide6.QtWidgets import QTabWidget, QLabel

tabs = QTabWidget()
tabs.addTab(QLabel("Content A"), "Tab A")   # widget, tab label
tabs.addTab(QLabel("Content B"), "Tab B")
tabs.show()
```

`addTab(widget, label)` is the only method you need to start. The tab bar, switching behavior, and active-tab highlighting are all automatic.

**What it hides:** The show/hide lifecycle of each child widget. When "Tab B" is selected, Qt hides "Tab A"'s widget without destroying it — all its state (scroll position, loaded data, selected rows) is preserved. You never call `show()` or `hide()` yourself.

**The protected invariant:** Each tab's widget is always in memory. A switch to a tab is O(1) — no reloading. The trade-off is memory: all tabs exist simultaneously. For data-heavy tabs, load data lazily on first switch rather than on startup.

**You will see this again in:** Every desktop application with multiple views — VS Code's editor tabs, browser tabs, IDE panel tabs. `QTabWidget` is the direct Qt equivalent. Web frameworks implement the same idea with CSS `display: none` or React conditional rendering, but the concept is identical.

**Watch for:** Adding a tab does not make it active — the first tab added is shown by default. Call `tabs.setCurrentIndex(1)` to make the second tab active programmatically (for testing, or after loading a file).

---

## Step 1 — Add the Tab Widget to the Main Window

Open `tooldb_ui/main.py`. Right now `_build_central` creates and sets one widget as the central widget. You will wrap the existing tool table and the new report widget in a `QTabWidget`.

Find the `_build_central` method. It currently looks roughly like:

```python
def _build_central(self):
    self._table_view = QTableView()
    # ... proxy model setup ...
    self.setCentralWidget(self._table_view)
```

Replace the final `setCentralWidget` call with a tab widget:

```python
def _build_central(self):
    self._table_view = QTableView()
    # ... existing proxy model setup stays unchanged ...

    self._tabs = QTabWidget()                         # ← add this
    self._tabs.addTab(self._table_view, "Tools")      # ← add this — existing view becomes tab 0
    self._tabs.addTab(QWidget(), "Reports")           # ← add this — placeholder for now
    self.setCentralWidget(self._tabs)                 # ← was: setCentralWidget(self._table_view)
```

The `QWidget()` placeholder gives the Reports tab a valid widget so the tab bar shows up. You will replace it in the next step.

### SAVE AND TRY

Run the application. You should see a tab bar at the top with two tabs: "Tools" and "Reports". The Tools tab shows your existing table. The Reports tab shows a blank area. The tool table should work exactly as before.

**You should see:** Two tabs. Tools tab has the tool table. Reports tab is blank.

**Change something:** Add `self._tabs.setCurrentIndex(1)` after `addTab`. The app opens on the Reports tab instead of Tools. Change it back (or remove the line).

---

## Concept: Read-Only Table Model

**What it is:** A `QAbstractTableModel` where `flags()` returns `Qt.ItemIsEnabled` without `Qt.ItemIsEditable` — the cell is visible and selectable but cannot be modified.

**The problem before:** Your tool table model inherits from `QAbstractTableModel`. By default, Qt assumes all cells are potentially editable unless told otherwise. If a user double-clicks a report cell, Qt opens an inline editor. That is wrong for a read-only report.

**The solution:** Override `flags()` in your model and omit `Qt.ItemIsEditable`:

```python
from PySide6.QtCore import Qt

def flags(self, index):
    if not index.isValid():
        return Qt.NoItemFlags
    return Qt.ItemIsEnabled | Qt.ItemIsSelectable
    # Note: Qt.ItemIsEditable is deliberately absent
```

**Smallest possible example:**

```python
# Editable (default-ish) — user can double-click to edit:
return Qt.ItemIsEnabled | Qt.ItemIsSelectable | Qt.ItemIsEditable

# Read-only — user can select and copy but not edit:
return Qt.ItemIsEnabled | Qt.ItemIsSelectable
```

**You will see this again in:** Any display-only view — log viewers, audit trails, report tables, search results. Read-only flags are the standard way to prevent accidental edits in Qt. The same concept appears in web tables with `contenteditable=false` and in spreadsheets with cell protection.

**Watch for:** `Qt.ItemIsEnabled` must be present or the cell appears grayed out and unselectable. It is easy to accidentally return only `Qt.ItemIsSelectable` (no `Enabled`) and wonder why the row looks disabled.

---

## Step 2 — The Report Table Model

Create `tooldb_ui/report_table_model.py`:

```python
from PySide6.QtCore import QAbstractTableModel, QModelIndex, Qt

COLUMNS = [
    ("Operation",  "op_name"),
    ("Tool Name",  "tool_name"),
    ("Diameter",   "diameter"),
    ("Material",   "material"),
    ("SFM",        "sfm"),
    ("Feed",       "feed"),
]
```

Six columns. `sfm` and `feed` come from the nested `cutting` dict, so they need special handling in `data()`. You will see that in the next block.

```python
class ReportTableModel(QAbstractTableModel):
    def __init__(self):
        super().__init__()
        self._rows: list[dict] = []    # list of report row dicts from build_report()

    def reset_data(self, rows: list[dict]) -> None:
        self.beginResetModel()
        self._rows = rows
        self.endResetModel()
```

`beginResetModel` / `endResetModel` is the same pattern from Lab 36. It tells any connected view "all the data changed, re-read everything."

Now add `rowCount`, `columnCount`, `headerData`, `flags`, and `data`:

```python
    def rowCount(self, parent=QModelIndex()):
        return len(self._rows)

    def columnCount(self, parent=QModelIndex()):
        return len(COLUMNS)

    def headerData(self, section, orientation, role=Qt.DisplayRole):
        if role == Qt.DisplayRole and orientation == Qt.Horizontal:
            return COLUMNS[section][0]   # the human-readable column label
        return None

    def flags(self, index):
        if not index.isValid():
            return Qt.NoItemFlags
        return Qt.ItemIsEnabled | Qt.ItemIsSelectable   # read-only: no ItemIsEditable
```

Now `data()` — the only method that needs special handling for `sfm` and `feed`:

```python
    def data(self, index, role=Qt.DisplayRole):
        if not index.isValid() or role != Qt.DisplayRole:
            return None

        row     = self._rows[index.row()]
        col_key = COLUMNS[index.column()][1]     # e.g. "op_name", "sfm"

        if col_key == "sfm":
            return row['cutting'].get('sfm', '—')

        if col_key == "feed":
            # feed_per_tooth for mills, feed_per_rev for drills
            cutting = row['cutting']
            return cutting.get('feed_per_tooth') or cutting.get('feed_per_rev', '—')

        value = row.get(col_key)
        return str(value) if value is not None else "—"
```

The `sfm` and `feed` cases are the only departures from the standard `row.get(col_key)` pattern. All other columns are direct dict lookups.

### SAVE AND TRY

```python
from tooldb_ui.report_table_model import ReportTableModel

model = ReportTableModel()
model.reset_data([
    {"op_name": "POCKET-1", "tool_name": "Flat Endmill",
     "diameter": 0.5, "material": "carbide", "matched": True,
     "cutting": {"sfm": "600", "feed_per_tooth": "0.003"}}
])

print(model.rowCount())          # → 1
print(model.columnCount())       # → 6
idx = model.index(0, 0)
print(model.data(idx))           # → "POCKET-1"
idx_sfm = model.index(0, 4)
print(model.data(idx_sfm))       # → "600"
```

**You should see:**
```
1
6
POCKET-1
600
```

**Change something:** In `flags()`, add `Qt.ItemIsEditable` back. Then in the UI (next step), double-click a cell — an edit box appears. Remove it again.

---

## Step 3 — The Reports Tab Widget

Create `tooldb_ui/report_tab.py`:

```python
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QPushButton, QTableView,
    QFileDialog, QLabel
)
from PySide6.QtCore import Qt
from sqlalchemy.orm import Session
from tooldb_ui.report_table_model import ReportTableModel
from tooldb.parsers.mastercam_xml_parser import load_operation_sheet, extract_operations
from tooldb.reports.operation_report import load_tools_by_id, build_report
```

The imports pull in the XML parser and the report builder from earlier in this block. The tab widget orchestrates them.

```python
class ReportTab(QWidget):
    def __init__(self, session: Session, parent=None):
        super().__init__(parent)
        self._session = session        # the same session used by the rest of the app

        self._model = ReportTableModel()

        self._status = QLabel("No report loaded.")
        load_btn = QPushButton("Load XML...")
        load_btn.clicked.connect(self._on_load)

        self._table = QTableView()
        self._table.setModel(self._model)
        self._table.setSortingEnabled(True)    # free column-header sorting

        layout = QVBoxLayout(self)
        layout.addWidget(load_btn)
        layout.addWidget(self._status)
        layout.addWidget(self._table)
```

`setSortingEnabled(True)` gives the table sortable column headers at no extra cost — the proxy model handles it automatically when the model is connected to a `QTableView`.

Now the load handler:

```python
    def _on_load(self):
        path, _ = QFileDialog.getOpenFileName(
            self, "Open Operation Sheet", "", "XML Files (*.xml);;All Files (*)"
        )
        if not path:
            return    # user cancelled

        root       = load_operation_sheet(path)
        operations = extract_operations(root)
        tool_lookup = load_tools_by_id(self._session)
        rows       = build_report(operations, tool_lookup)

        self._model.reset_data(rows)

        unmatched = sum(1 for r in rows if not r['matched'])
        self._status.setText(
            f"{len(rows)} operation(s) loaded.  {unmatched} unmatched tool(s)."
        )
```

### SAVE AND TRY

Back in `main.py`, replace the `QWidget()` placeholder with a real `ReportTab`:

```python
from tooldb_ui.report_tab import ReportTab

# in _build_central, replace:
self._tabs.addTab(QWidget(), "Reports")
# with:
self._report_tab = ReportTab(self._session)          # ← was: QWidget()
self._tabs.addTab(self._report_tab, "Reports")       # ← was: QWidget()
```

Run the app. Click "Reports", then "Load XML...", pick `sample_operations.xml`.

**You should see:** The report table fills with 5 rows. The status label reads "5 operation(s) loaded. 0 unmatched tool(s)." Clicking column headers sorts the table.

**Change something:** Click the "Tools" tab and back to "Reports" — the loaded data is still there. The tab switch did not destroy the widget or clear the model.

---

## Concept: GUI Thread Safety (Flag for Later)

You called `load_operation_sheet()` and `build_report()` directly inside `_on_load` — a slot that runs on the Qt main (GUI) thread. For a small file like `sample_operations.xml`, this finishes in milliseconds. For a real Mastercam XML with hundreds of operations, it might take one or two seconds. During that time, the UI is frozen — the window cannot be resized, dragged, or closed.

**The correct fix** is to move the XML parsing and database query to a background thread (`QThread` or `concurrent.futures.ThreadPoolExecutor`) and emit a signal when the data is ready. The main thread only updates the UI; it never blocks.

**This lesson leaves the fix for Block 11.** The important thing right now is to know:

1. Slow code in a slot freezes the UI — this is a design smell, not a subtle bug
2. The fix always involves the same structure: start work on a background thread, emit a signal when done, update the UI in the signal handler
3. Any code that touches Qt widgets must run on the main thread — even from a signal handler connected to a background thread, Qt routes the signal to the main thread automatically if you use queued connections

**Watch for it:** If you load a large XML file and the window goes white and unresponsive, this is why. File a mental note: "this needs threading."

---

## 🎯 Challenge: Export Report to CSV

**You know:** `build_report` returns a list of dicts. Python's standard `csv` module writes dicts to CSV with `csv.DictWriter`.

**Task:** Add an "Export CSV..." button to `ReportTab` that saves the current report rows to a CSV file. Only enabled when rows are loaded (`self._model.rowCount() > 0`).

**Starting code:**
```python
import csv

export_btn = QPushButton("Export CSV...")
export_btn.setEnabled(False)           # disabled until data is loaded
export_btn.clicked.connect(self._on_export)

# In _on_load, after reset_data:
export_btn.setEnabled(len(rows) > 0)   # enable once data arrives
```

**Hint:** `QFileDialog.getSaveFileName` for the destination path. Write one row per operation; include `op_name`, `tool_name`, `diameter`, `material`, and the `sfm`/`feed` values.

---

<details>
<summary>▶ Show Solution</summary>

```python
def _on_export(self):
    path, _ = QFileDialog.getSaveFileName(
        self, "Export Report", "report.csv", "CSV Files (*.csv)"
    )
    if not path:
        return

    fieldnames = ["op_name", "tool_name", "diameter", "material", "sfm", "feed"]

    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in self._model._rows:
            cutting = row.get("cutting", {})
            writer.writerow({
                "op_name":   row["op_name"],
                "tool_name": row["tool_name"],
                "diameter":  row.get("diameter", ""),
                "material":  row.get("material", ""),
                "sfm":       cutting.get("sfm", ""),
                "feed":      cutting.get("feed_per_tooth") or cutting.get("feed_per_rev", ""),
            })
```

**Key insight:** `csv.DictWriter` takes a list of field names and writes only those keys from each dict — extra keys in the dict are silently ignored. This is why keeping the data in a consistent dict structure (not a flat object) makes export easy: you map field names to dict keys and the writer does the rest. The same pattern writes JSON, XLSX, and any other tabular format.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| Two tabs appear: "Tools" and "Reports" | Run app, count tabs |
| Tools tab is unchanged | Sort, filter — existing behavior intact |
| Load XML button opens a file picker | Click it; picker appears |
| Report table fills after picking `sample_operations.xml` | Load file; count rows (expect 5) |
| Status label shows correct count | Read the label after loading |
| Column header click sorts the table | Click "SFM" header; rows reorder |
| Double-clicking a cell does NOT open an editor | Try it; nothing should happen |
| Switching tabs preserves report data | Load XML, switch to Tools, switch back — data still there |

---

## Quick Check Answers

**1. Can you reuse the ToolTableModel for the Reports tab?**
No — and the data structure determines why. `ToolTableModel` holds `list[ToolRead]` and accesses fields with `getattr(tool, col_key)`. The report holds `list[dict]` with different column names. You need a separate model class (`ReportTableModel`) with its own `COLUMNS` definition and its own `data()` implementation. The pattern is the same — the data is different.

**2. What should `data()` return when the user tries to edit a read-only cell?**
`data()` is only called for `Qt.DisplayRole` (what to show) — not for editing. The `flags()` method controls editability. When `Qt.ItemIsEditable` is absent from `flags()`, Qt never asks the model for an edit delegate. `data()` does not need to handle this case at all.

**3. When the user switches tabs, does Qt destroy the hidden widget?**
No. Qt hides the widget by removing it from the visible layout, but it stays alive in memory. All its state — loaded data, scroll position, selections — is preserved. This is why the report data survives a tab switch. The trade-off is memory: all tab widgets exist simultaneously even when not visible. For tabs that load large datasets, it is worth loading lazily on first activation rather than at startup.
