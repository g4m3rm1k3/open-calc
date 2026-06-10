# Python Tool Database — LAB 37 — Sorting and Filtering: QSortFilterProxyModel

**Prerequisites:** Lab 36. You have a `QTableView` backed by `ToolTableModel`. Clicking column headers does nothing and filtering requires rebuilding the whole model. This lesson fixes both with one class.

**What this lab adds:**
- `QSortFilterProxyModel` — sits between model and view, intercepts data
- Sorting by column header click without touching `ToolTableModel`
- Case-insensitive search filtering without a full reload
- The proxy pattern as a general concept

**Time:** 30–40 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You add sorting to `ToolTableModel` directly. Now you add a second view of the same data sorted differently. What is the problem?
> 2. `proxy.setSourceModel(self.model)` and `self.table.setModel(proxy)`. The view never touches `ToolTableModel` directly. Who does the view talk to?
> 3. `proxy.setFilterFixedString("carbide")` — does this call `ToolTableModel.load()` again? How does filtering happen?
>
> *(Answers at the end)*

---

## The Proxy Pattern

A proxy sits between two things and intercepts communication. `QSortFilterProxyModel` sits between your model and the view:

```
ToolTableModel  →  QSortFilterProxyModel  →  QTableView
   (source)              (proxy)               (view)
```

The view asks the proxy for row 0. The proxy checks its filter, decides which source row maps to proxy row 0, and asks the source model for that row. The proxy handles sorting and filtering; the source model handles data storage. Neither knows about the other's concerns.

This is the **Decorator** and **Proxy** patterns in action. Your `ToolTableModel` has zero sorting or filtering code — it never needs to.

---

## Step 1 — Add the Proxy

Update `tooldb_ui/main.py`. Two changes: import the proxy, and insert it between model and view.

```python
from PySide6.QtCore import Qt
from PySide6.QtWidgets import QSortFilterProxyModel  # ← add to imports
```

In `_build_central`, replace:

```python
self.model = ToolTableModel()
self.table = QTableView()
self.table.setModel(self.model)
```

With:

```python
self.model = ToolTableModel()

self.proxy = QSortFilterProxyModel()
self.proxy.setSourceModel(self.model)
self.proxy.setFilterCaseSensitivity(Qt.CaseInsensitive)
self.proxy.setFilterKeyColumn(-1)   # -1 = search all columns

self.table = QTableView()
self.table.setModel(self.proxy)     # view uses proxy, not model directly
self.table.setSortingEnabled(True)  # enables click-to-sort on headers
self.table.horizontalHeader().setStretchLastSection(True)
self.table.setSelectionBehavior(QTableView.SelectionBehavior.SelectRows)
self.table.setEditTriggers(QTableView.EditTrigger.NoEditTriggers)
```

Update `_on_search_changed` to use the proxy filter instead of reloading:

```python
def _on_search_changed(self, text: str) -> None:
    self.proxy.setFilterFixedString(text)
    self.statusBar().showMessage(f"{self.proxy.rowCount()} tools shown")
```

And update `_refresh_tools` to not filter in Python:

```python
def _refresh_tools(self) -> None:
    tools = self.service.get_tools()
    self.model.load(tools)
    self.statusBar().showMessage(f"{self.proxy.rowCount()} tools")
```

Run it. Click any column header — the table sorts by that column. Click again — reverse sort. Type in the search field — filtering works across all columns.

---

## What Changed and Why It's Better

**Before:** `_on_search_changed` called `service.get_tools()`, filtered the Python list, and called `model.load()` — a database round-trip on every keystroke.

**After:** `_on_search_changed` calls `proxy.setFilterFixedString(text)` — pure in-memory operation. The proxy re-evaluates which source rows pass the filter and updates the view. No database hit, no model reload.

**Before:** Sorting required either a database `ORDER BY` query (another round-trip) or sorting the Python list and calling `model.load()`.

**After:** `setSortingEnabled(True)` on the view delegates sorting to the proxy. Zero code in `ToolTableModel`. Zero database queries.

---

## Step 2 — Getting the Selected Source Row

With a proxy, the view's selected index is a *proxy* index, not a source index. To get the actual tool dict from the model, convert first:

```python
def _selected_tool(self) -> dict | None:
    indexes = self.table.selectedIndexes()
    if not indexes:
        return None
    proxy_index = indexes[0]
    source_index = self.proxy.mapToSource(proxy_index)
    row = source_index.row()
    if 0 <= row < len(self.model._tools):
        return self.model._tools[row]
    return None
```

`proxy.mapToSource(proxy_index)` translates a proxy row/column to the corresponding row/column in the source model. Always do this before accessing the source model's data directly.

Add this to `_build_central` to show the selected tool in the status bar:

```python
self.table.selectionModel().selectionChanged.connect(self._on_selection_changed)

def _on_selection_changed(self) -> None:
    tool = self._selected_tool()
    if tool:
        self.statusBar().showMessage(f"Selected: {tool['name']} — {tool['diameter_inches']}\"")
```

---

## Step 3 — SAVE AND TRY

**Sort by diameter.** Click the "Diameter (in)" header. The tools sort numerically... except they sort as strings by default (`"1.0"` comes before `"0.5"` alphabetically if you're not careful). Test whether the sort is numeric or alphabetic. If alphabetic (wrong), the fix is to return a numeric type from `data()` for `Qt.DisplayRole` on the diameter column — return `float(tool["diameter_inches"])` instead of `str(...)`.

**Filter for "carbide".** Type "carbide" in the search field. Only carbide tools remain. Clear it — all tools return. The model was never reloaded.

**Sort + filter together.** Filter for "carbide", then sort by diameter. Both work simultaneously — the proxy composes sort and filter.

---

## Challenge

Right now `setFilterKeyColumn(-1)` searches all columns. Add a `QComboBox` that lets the user choose which column to search:

```python
from PySide6.QtWidgets import QComboBox

self.filter_column = QComboBox()
self.filter_column.addItems(["All Columns", "Name", "Material", "Type"])
self.filter_column.currentIndexChanged.connect(self._on_filter_column_changed)
search_row.addWidget(self.filter_column)

def _on_filter_column_changed(self, index: int) -> None:
    # index 0 = "All Columns" → -1
    # index 1 = "Name" → column 0
    # index 2 = "Material" → column 2
    # index 3 = "Type" → column 3
    col_map = {0: -1, 1: 0, 2: 2, 3: 3}
    self.proxy.setFilterKeyColumn(col_map[index])
```

<details>
<summary>Answer</summary>

The code above is the complete answer. Add the import, add the combo box to `search_row` (before or after the `QLineEdit`), and add the slot. The `col_map` dict maps combo box index to the column number in `ToolTableModel` (name=0, material=2, type=3, -1=all).

Note: `setFilterKeyColumn` affects `setFilterFixedString`. The filter text in the search box applies to the selected column. Changing the combo box column does not clear the filter text — search results update immediately on column change.

</details>

---

## Final Check

| | |
|--|--|
| Clicking a column header sorts the table | ✓ |
| Clicking again reverses the sort | ✓ |
| Typing in search filters without a database query | ✓ |
| Selecting a filtered/sorted row shows the right tool in status bar | ✓ |
| `proxy.mapToSource()` used before accessing `self.model._tools` | ✓ |

---

## Quick Check Answers

1. **Each view needs its own sort state**, but sorting modifies the model's row order. If `ToolTableModel` sorts its internal list, view A and view B see the same sort order — you can't have view A sorted by name while view B is sorted by diameter. With a proxy per view, each proxy maintains its own sort state independently. The source model never changes.

2. **The view talks to the proxy.** The proxy translates proxy coordinates to source coordinates and calls `ToolTableModel.data()`. The view has no direct connection to `ToolTableModel`. If you replace the proxy with a different one, the view doesn't change. If you replace the source model, the proxy adapts.

3. **No, `setFilterFixedString` does not call `model.load()`.** The proxy holds a reference to the source model. When the filter changes, the proxy re-evaluates which source rows pass the filter and emits signals telling the view which rows are now visible. The source model data is untouched. The database is not queried.
