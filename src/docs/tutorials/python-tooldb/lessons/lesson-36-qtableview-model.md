# Python Tool Database — LAB 36 — Displaying Data: QTableView and QAbstractTableModel

**Prerequisites:** Lab 35. You have a `QMainWindow` with a `QListWidget` showing hard-coded tool names. This lesson replaces it with a proper table backed by real database data, using the MVC pattern.

**What this lab adds:**
- The Model-View-Controller pattern and why it matters for tables
- `QTableView` — the view that renders rows and columns
- `QAbstractTableModel` — the interface you implement to feed data to the view
- Connecting the model to a real database via `ToolService`
- The `data()` / `rowCount()` / `columnCount()` methods

**Time:** 55–70 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. With `QListWidget` you call `addItem("text")` to add rows. Why can't you do the same thing to display 10,000 tools efficiently?
> 2. Qt calls `model.data(index, role)` to get what to display in a cell. What is the `role` parameter for and what value do you check for display text?
> 3. You update the underlying list of tools in your model. The table on screen still shows the old data. What method do you call to tell Qt to re-read the model?
>
> *(Answers at the end)*

---

## MVC: Why Separate the Data from the View?

`QListWidget` mixes two things: it stores the data (strings) *and* renders them. This is convenient for small lists but breaks down when:
- You have 10,000 rows — `QListWidget` creates a widget object for every row, even the ones not visible
- You need sorting or filtering without reloading everything
- You want to show the same data in two different views simultaneously

The **Model-View** pattern separates the two jobs:
- The **Model** owns the data and tells Qt what is in row R, column C
- The **View** (`QTableView`) handles rendering — it asks the model for only the rows currently visible on screen

Qt calls your model's `data()` method only for visible cells. Scroll down — it calls `data()` for the newly visible rows. The model never pushes data to the view; the view pulls what it needs.

---

## Step 1 — The ToolTableModel

Create `tooldb_ui/tool_table_model.py`:

```python
from PySide6.QtCore import QAbstractTableModel, QModelIndex, Qt

COLUMNS = ["Name", "Diameter (in)", "Material", "Type", "Flutes"]
COL_NAME = 0
COL_DIAMETER = 1
COL_MATERIAL = 2
COL_TYPE = 3
COL_FLUTES = 4


class ToolTableModel(QAbstractTableModel):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._tools: list[dict] = []

    # ── Qt interface — three required methods ──────────────

    def rowCount(self, parent=QModelIndex()) -> int:
        return len(self._tools)

    def columnCount(self, parent=QModelIndex()) -> int:
        return len(COLUMNS)

    def data(self, index: QModelIndex, role: int = Qt.DisplayRole):
        if not index.isValid():
            return None
        if role == Qt.DisplayRole:
            tool = self._tools[index.row()]
            col = index.column()
            if col == COL_NAME:
                return tool.get("name", "")
            if col == COL_DIAMETER:
                return str(tool.get("diameter_inches", ""))
            if col == COL_MATERIAL:
                return tool.get("material", "")
            if col == COL_TYPE:
                return tool.get("tool_type", "")
            if col == COL_FLUTES:
                flutes = tool.get("flutes")
                return str(flutes) if flutes is not None else "—"
        return None

    def headerData(self, section: int, orientation, role: int = Qt.DisplayRole):
        if role == Qt.DisplayRole and orientation == Qt.Horizontal:
            return COLUMNS[section]
        return None

    # ── Public API — called by the window ─────────────────

    def load(self, tools: list[dict]) -> None:
        self.beginResetModel()
        self._tools = tools
        self.endResetModel()
```

Three methods are required by `QAbstractTableModel`:
- `rowCount()` — how many rows
- `columnCount()` — how many columns
- `data(index, role)` — what to show at position (row, col)

`headerData()` is optional but provides column headers.

---

## The `role` Parameter

Qt asks your model for different *kinds* of data about each cell. The most common:

| Role | What Qt wants |
|------|--------------|
| `Qt.DisplayRole` | The text to display |
| `Qt.ToolTipRole` | Tooltip text on hover |
| `Qt.TextAlignmentRole` | Left/center/right alignment |
| `Qt.ForegroundRole` | Text color |
| `Qt.BackgroundRole` | Background color |

Your `data()` method checks the role and returns the appropriate thing, or `None` to use the default. For now, only `DisplayRole` is implemented.

---

## `beginResetModel` / `endResetModel`

When you replace the entire data set (calling `load()` with a new list), you must tell Qt before and after:

```python
self.beginResetModel()   # tell Qt: the model is about to change completely
self._tools = tools      # replace the data
self.endResetModel()     # tell Qt: done — re-read everything
```

This triggers the view to clear itself and re-query from scratch. Without these calls, the view shows stale data or crashes trying to access rows that no longer exist.

For adding a single row (future: after the Add Tool dialog), use `beginInsertRows` / `endInsertRows` instead — more efficient, only updates the affected rows.

---

## Step 2 — Wire the Model into the Window

Update `tooldb_ui/main.py`. Replace the `QListWidget` with a `QTableView` + `ToolTableModel`:

```python
import sys
import sqlite3
from pathlib import Path

from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QLabel, QLineEdit,
    QPushButton, QVBoxLayout, QHBoxLayout, QTableView,
)
from PySide6.QtGui import QAction

from tooldb_ui.tool_table_model import ToolTableModel
from tooldb.repositories.tool_repository import ToolRepository
from tooldb.services.tool_service import ToolService
from tooldb.migrate import apply_migrations


DB_PATH = Path(__file__).parent.parent / "tools.db"
MIGRATIONS_DIR = Path(__file__).parent.parent / "migrations"


def make_service() -> ToolService:
    conn = sqlite3.connect(str(DB_PATH))
    apply_migrations(conn, MIGRATIONS_DIR)
    repo = ToolRepository(conn)
    return ToolService(repo)


class ToolDatabaseWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.service = make_service()
        self.setWindowTitle("Tool Database")
        self.setMinimumSize(800, 500)
        self._build_menu()
        self._build_central()
        self._build_status()
        self._refresh_tools()

    def _build_menu(self):
        menubar = self.menuBar()
        file_menu = menubar.addMenu("&File")

        exit_action = QAction("E&xit", self)
        exit_action.setShortcut("Ctrl+Q")
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)

    def _build_central(self):
        container = QWidget()
        self.setCentralWidget(container)
        root = QVBoxLayout(container)

        search_row = QHBoxLayout()
        search_row.addWidget(QLabel("Search:"))
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Filter by name...")
        self.search_input.textChanged.connect(self._on_search_changed)
        search_row.addWidget(self.search_input)
        root.addLayout(search_row)

        self.model = ToolTableModel()
        self.table = QTableView()
        self.table.setModel(self.model)
        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.setSelectionBehavior(QTableView.SelectionBehavior.SelectRows)
        self.table.setEditTriggers(QTableView.EditTrigger.NoEditTriggers)
        root.addWidget(self.table)

        button_row = QHBoxLayout()
        button_row.addStretch()
        self.add_button = QPushButton("Add Tool")
        self.add_button.clicked.connect(self._on_add_tool)
        button_row.addWidget(self.add_button)
        root.addLayout(button_row)

    def _build_status(self):
        self.statusBar()

    def _refresh_tools(self, filter_text: str = "") -> None:
        tools = self.service.get_tools()
        if filter_text:
            fl = filter_text.lower()
            tools = [t for t in tools if fl in t["name"].lower()]
        self.model.load(tools)
        self.statusBar().showMessage(f"{len(tools)} tools")

    def _on_search_changed(self, text: str) -> None:
        self._refresh_tools(filter_text=text)

    def _on_add_tool(self) -> None:
        self.statusBar().showMessage("Add Tool dialog — coming in Lesson 39", 3000)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = ToolDatabaseWindow()
    window.show()
    sys.exit(app.exec())
```

Run it. If `tools.db` has records, they appear in the table. If the database is empty, the table is blank — that is correct.

---

## Step 3 — Seed Some Data

If your database is empty, seed it from the command line:

```python
python -c "
import sqlite3
from pathlib import Path
from tooldb.repositories.tool_repository import ToolRepository
from tooldb.services.tool_service import ToolService
from tooldb.migrate import apply_migrations

conn = sqlite3.connect('tools.db')
apply_migrations(conn, Path('migrations'))
repo = ToolRepository(conn)
service = ToolService(repo)
for name, d, mat, typ, fl in [
    ('EM-0500-4FL-C', 0.5, 'carbide', 'endmill', 4),
    ('EM-0375-4FL-C', 0.375, 'carbide', 'endmill', 4),
    ('DR-0250-HSS', 0.25, 'HSS', 'drill', None),
    ('FM-1000-C', 1.0, 'carbide', 'facemill', None),
    ('TAP-0250-HSS', 0.25, 'HSS', 'tap', None),
]:
    try:
        service.create_tool(name, d, mat, typ, fl)
    except ValueError:
        pass  # skip duplicates
print('Done')
"
```

Rerun the UI. The five tools appear in the table. Type in the search field — the count in the status bar updates.

---

## Step 4 — SAVE AND TRY

**Resize columns.** Drag a column header border to widen a column. Qt table views support this by default.

**Click a column header.** Nothing happens yet — sorting requires `QSortFilterProxyModel`, which comes later.

**Check `setSelectionBehavior(SelectRows)`.** Click any cell — the entire row highlights. Without this, individual cells highlight. Rows make more sense for a tool list.

**Check `setEditTriggers(NoEditTriggers)`.** Double-click a cell. Nothing happens — edits are disabled. Without this, double-clicking lets you type in a cell, which would corrupt the data.

---

## Challenge

Add a `data()` response for `Qt.TextAlignmentRole` that right-aligns the diameter column:

```python
from PySide6.QtCore import Qt

if role == Qt.TextAlignmentRole:
    if index.column() == COL_DIAMETER:
        return Qt.AlignRight | Qt.AlignVCenter
```

Right-aligned numbers are easier to compare at a glance — this is a standard typographic convention for numeric columns.

<details>
<summary>Answer</summary>

In `ToolTableModel.data()`, add this before `return None`:

```python
if role == Qt.ItemDataRole.TextAlignmentRole:
    if index.column() == COL_DIAMETER:
        return Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter
    return Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter
```

Note: in PySide6 you must use the full enum path (`Qt.ItemDataRole.TextAlignmentRole`, `Qt.AlignmentFlag.AlignRight`) rather than the shorthand (`Qt.TextAlignmentRole`). Both forms compile but the full path avoids deprecation warnings in newer versions.

</details>

---

## Final Check

| | |
|--|--|
| Table shows real data from `tools.db` | ✓ |
| Typing in search filters rows without restarting the app | ✓ |
| Status bar shows current row count | ✓ |
| Selecting a row highlights the whole row | ✓ |
| `beginResetModel` / `endResetModel` called when data changes | ✓ in code |

---

## Quick Check Answers

1. **`QListWidget` creates a `QListWidgetItem` object for every row**, even rows not visible. For 10,000 rows that is 10,000 objects. `QTableView` + `QAbstractTableModel` only calls `data()` for visible rows — typically 20–30. Scrolling through 10,000 rows creates no objects beyond what fits on screen.

2. **`role` tells your model what kind of data Qt wants for that cell.** The most common value is `Qt.DisplayRole` — "what text should I show?" You check `if role == Qt.DisplayRole:` and return the string. Other roles let you return colors, tooltips, and icons for the same cell coordinates.

3. **Call `beginResetModel()` before changing the data and `endResetModel()` after.** Qt connects these to the view. `endResetModel()` tells the view to discard its cache and re-read everything from the model. Without this pair, the view never knows the model changed.
