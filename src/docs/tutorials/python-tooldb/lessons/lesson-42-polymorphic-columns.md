# Python Tool Database — LAB 42 — Polymorphic Table Columns

**Prerequisites:** Lab 41. You can add endmills, drills, and facemills. The table shows Name, Diameter, Material, Type, Flutes. The type-specific fields (corner radius, point angle, etc.) are in the database but invisible. This lesson adds them to the table and lets the user control which ones show.

**What this lab adds:**
- Adding type-specific columns to `ToolTableModel`
- `QTableView.setColumnHidden()` — hiding columns without removing them from the model
- A "View" menu with per-column-group checkboxes
- Why the model stays stable while the view changes

**Time:** 40–50 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You hide column 3 in the view. The model still has column 3. A user clicks row 5 column 3 — what does `selectedIndexes()` return?
> 2. You remove column 3 from the model by returning `columnCount() - 1`. A different view shows all columns. What breaks?
> 3. Why is "hide the column in the view" architecturally cleaner than "remove it from the model"?
>
> *(Answers at the end)*

---

## Step 1 — Expand ToolTableModel

Update `tooldb_ui/tool_table_model.py` to add all type-specific columns:

```python
from PySide6.QtCore import QAbstractTableModel, QModelIndex, Qt

COLUMNS = [
    ("Name",          "name",          "common"),
    ("Diameter (in)", "diameter_inches","common"),
    ("Material",      "material",      "common"),
    ("Type",          "tool_type",     "common"),
    ("Flutes",        "flutes",        "common"),
    # EndMill
    ("Corner Radius", "corner_radius", "endmill"),
    ("Helix Angle",   "helix_angle",   "endmill"),
    ("Flute Length",  "flute_length",  "endmill"),
    # Drill
    ("Point Angle",   "point_angle",   "drill"),
    ("Drill Length",  "drill_length",  "drill"),
    # FaceMill
    ("Insert Size",   "insert_size",   "facemill"),
    ("# Inserts",     "num_inserts",   "facemill"),
    ("Lead Angle",    "lead_angle",    "facemill"),
    # TurnTool
    ("Insert Shape",  "insert_shape",  "turntool"),
    ("Nose Radius",   "nose_radius",   "turntool"),
    ("Relief Angle",  "relief_angle",  "turntool"),
]

# Column index constants
COL_NAME = 0
COL_DIAMETER = 1


class ToolTableModel(QAbstractTableModel):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._tools: list[dict] = []

    def rowCount(self, parent=QModelIndex()) -> int:
        return len(self._tools)

    def columnCount(self, parent=QModelIndex()) -> int:
        return len(COLUMNS)

    def data(self, index: QModelIndex, role: int = Qt.ItemDataRole.DisplayRole):
        if not index.isValid():
            return None
        if role == Qt.ItemDataRole.DisplayRole:
            tool = self._tools[index.row()]
            key = COLUMNS[index.column()][1]
            value = tool.get(key)
            if value is None:
                return "—"
            return str(value)
        if role == Qt.ItemDataRole.TextAlignmentRole:
            if index.column() == COL_DIAMETER:
                return Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter
        return None

    def headerData(self, section: int, orientation, role: int = Qt.ItemDataRole.DisplayRole):
        if role == Qt.ItemDataRole.DisplayRole and orientation == Qt.Orientation.Horizontal:
            return COLUMNS[section][0]
        return None

    def load(self, tools: list[dict]) -> None:
        self.beginResetModel()
        self._tools = tools
        self.endResetModel()
```

The `COLUMNS` list is now the single source of truth: column index, display header, field key, and group. The `data()` method is simpler too — it looks up the key from `COLUMNS` instead of a long if/elif chain.

---

## Step 2 — Column Groups in the View Menu

Update `_build_menu` in `main.py` to add a View menu:

```python
from tooldb_ui.tool_table_model import COLUMNS

def _build_menu(self):
    menubar = self.menuBar()

    file_menu = menubar.addMenu("&File")
    exit_action = QAction("E&xit", self)
    exit_action.setShortcut("Ctrl+Q")
    exit_action.triggered.connect(self.close)
    file_menu.addAction(exit_action)

    view_menu = menubar.addMenu("&View")
    self._column_actions: dict[str, QAction] = {}

    groups = dict.fromkeys(col[2] for col in COLUMNS)  # preserve insertion order
    for group in groups:
        action = QAction(f"Show {group.title()} columns", self)
        action.setCheckable(True)
        action.setChecked(group == "common")
        action.triggered.connect(lambda checked, g=group: self._on_toggle_columns(g, checked))
        view_menu.addAction(action)
        self._column_actions[group] = action
```

Add the slot and call it on startup:

```python
def _on_toggle_columns(self, group: str, visible: bool) -> None:
    for i, (_, _, col_group) in enumerate(COLUMNS):
        if col_group == group:
            self.table.setColumnHidden(i, not visible)

def _apply_default_column_visibility(self) -> None:
    for i, (_, _, group) in enumerate(COLUMNS):
        self.table.setColumnHidden(i, group != "common")
```

In `__init__`, after `_build_central()`:

```python
self._apply_default_column_visibility()
```

Run the app. The table shows only the common columns by default. Open "View" → check "Show Endmill columns" — the corner radius, helix angle, and flute length columns appear. Rows that are drills show "—" in those columns.

---

## Step 3 — What Just Happened

The model has 16 columns. The view is hiding 11 of them. When you toggle a group on:

1. You call `setColumnHidden(i, False)` for each column in that group
2. Qt shows those columns in the view
3. Qt calls `model.data(index, DisplayRole)` for the newly visible cells
4. The model returns the value from the tool dict — or "—" if the field is None

The model never changes. The data never reloads. Column visibility is purely a view concern.

This is MVC working as designed. The model owns data. The view decides how to display it. Neither reaches into the other's territory.

---

## Step 4 — SAVE AND TRY

**Add an endmill.** Click Add Tool, select endmill, set a corner radius of 0.015. Click OK. In the table, enable "Show Endmill columns." The corner radius column now shows 0.015 for that row.

**Observe the drills.** Enable both endmill and drill columns simultaneously. Drill rows show "—" in corner radius. Endmill rows show "—" in point angle. The data is sparse but correct.

**Resize the window narrow.** The column headers are still there — the user can scroll horizontally. Qt table views support horizontal scrolling automatically.

---

## Step 5 — REFACTOR: Load Typed Tools as Dicts

The table model uses dicts, but `TypedToolRepository` returns `Tool` objects. You need both. The cleanest solution: add an `all_fields_for_table()` method to `Tool` that returns a flat dict suitable for the table model:

In `tooldb/models/tool_types.py`, add to the base class:

```python
def to_table_row(self) -> dict:
    """Flat dict with all fields — for use in ToolTableModel."""
    return self.all_fields()
```

Then update `_refresh_tools` in `main.py`:

```python
def _refresh_tools(self) -> None:
    tools = self.typed_repo.get_all()
    rows = [t.to_table_row() for t in tools]
    self.model.load(rows)
    self.statusBar().showMessage(f"{len(rows)} tools")
```

The table model gets dicts as before. The repository returns typed objects. The conversion happens in one place.

---

## Challenge

Add a "Reset Column Visibility" action to the View menu that hides all non-common columns and unchecks their menu items:

```python
reset_action = QAction("Reset Column Visibility", self)
reset_action.triggered.connect(self._on_reset_columns)
view_menu.addSeparator()
view_menu.addAction(reset_action)

def _on_reset_columns(self) -> None:
    self._apply_default_column_visibility()
    for group, action in self._column_actions.items():
        action.setChecked(group == "common")
```

<details>
<summary>Answer</summary>

The code above is complete. The key insight: `_apply_default_column_visibility` already hides non-common columns. The reset action calls it, then syncs the checkboxes by setting each action's `checked` state based on whether the group is "common". Both the visual state (hidden columns) and the UI state (checked/unchecked menu items) are reset together.

</details>

---

## Final Check

| | |
|--|--|
| Table shows only common columns by default | ✓ |
| Enabling "Endmill columns" shows corner_radius, helix_angle, flute_length | ✓ |
| Drill rows show "—" in endmill-specific columns | ✓ |
| Toggling column visibility does not reload the database | ✓ |
| Adding a new tool type only requires adding rows to `COLUMNS` | ✓ |

---

## Quick Check Answers

1. **`selectedIndexes()` will not return a hidden column.** The user cannot click a hidden column — it does not appear in the view. Qt does not deliver click events to hidden columns. If you programmatically select a range that includes hidden columns, Qt excludes them from the selection model too.

2. **The other view breaks.** Both views share the same model. If `columnCount()` returns 15 (one removed), the other view trying to render column 15 gets `None` or an index-out-of-range access. The model is the source of truth for both views — changing it for one view affects both.

3. **The model's job is to provide data; the view's job is to decide what to show.** "Hide this column" is a display decision. It belongs to the view layer. If you encode display decisions in the model (changing `columnCount` based on a flag), you couple the model to view concerns — it no longer works as a pure data provider. `setColumnHidden` is the correct place for this decision: zero model code, one view call.
