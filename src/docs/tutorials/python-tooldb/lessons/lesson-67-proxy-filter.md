# Python Tool Database — LAB 67 — Custom Proxy Filter with filterAcceptsRow

**Prerequisites:** Lab 37 (QSortFilterProxyModel basics). Lab 52 (ToolTableModel with ToolRead objects). You have a table model and a proxy that can sort. This lesson teaches the proxy to filter by any column — not just text.

**What this lab adds:**
- `filterAcceptsRow()` — the one method that decides whether a row is visible
- Testing numeric ranges: "show only tools with diameter > 10"
- Testing enum values: "show only endmills"
- The proxy chain: source model → proxy → view, and how each layer is independent

**Time:** 40–50 minutes

---

## What You Will Build

A `ToolFilterProxy` where you can call:

```python
proxy.set_type_filter("endmill")        # only show endmills
proxy.set_diameter_range(6.0, 13.0)     # only show tools with diameter 6–13mm
proxy.clear_filters()                   # show all tools
```

And the table view updates instantly without touching the source model.

---

> **Quick Check — try to answer before reading:**
>
> 1. `QSortFilterProxyModel` has a `setFilterFixedString()` method. Why can't you use it to filter by diameter range (e.g., "show diameters between 6 and 13")?
> 2. `filterAcceptsRow()` returns `True` or `False` for each row. What does `True` mean — shown or hidden?
> 3. The proxy sits between the model and the view. When you call `proxy.invalidateFilter()`, what exactly gets recalculated?
>
> *(Answers at the end of this lab)*

---

## Concept: `filterAcceptsRow()` — Custom Row Visibility

**What it is:** A method on `QSortFilterProxyModel` that you override to decide, for each source row, whether it should appear in the view. Return `True` to show the row, `False` to hide it.

**The problem before:** `QSortFilterProxyModel`'s built-in `setFilterFixedString()` searches one column for a text match. It cannot:
- Test a number column against a range
- Test an enum column for an exact value
- Combine multiple conditions (type AND diameter range)

**The solution:** Override `filterAcceptsRow(source_row, source_parent)`. Qt calls this once per row in the source model whenever the filter is applied. Your override reads the data from the source model, applies your logic, and returns `True` or `False`.

**What it hides:** The index mapping — when a row is hidden, the proxy renumbers all remaining rows. The view calls `proxy.rowCount()` and gets the filtered count; it never sees the original row indices. Source model row 7 might be proxy row 2 after filtering. The proxy's `mapToSource()` and `mapFromSource()` handle the translation — you never have to track the mapping yourself.

**The protected invariant:** The source model is never modified by filtering. Hiding row 7 does not remove it from the source model. Clearing the filter restores all rows without any database operation.

**Smallest possible example:**

```python
from PySide6.QtCore import QSortFilterProxyModel

class EvenRowProxy(QSortFilterProxyModel):
    def filterAcceptsRow(self, source_row, source_parent):
        return source_row % 2 == 0   # show even-numbered rows only
```

**You will see this again in:** Every Qt application with filtering. File browser filtering (hide hidden files). Log viewers (filter by severity level). Email clients (filter by sender, date range, label). The proxy pattern — insert a layer that transforms data without modifying the source — appears in every layered architecture.

**Career signal:** The proxy pattern (Structural) is a fundamental design pattern. The proxy here adds filtering behavior to an existing model without modifying the model class. This is the Open/Closed Principle: open for extension (add the proxy), closed for modification (the model is untouched).

**Watch for:** `filterAcceptsRow()` is called very frequently — once per row, every time `invalidateFilter()` is called. Keep it fast. No database queries here. The data should already be in the model.

---

## Step 1 — The ToolFilterProxy Skeleton

Create `tooldb_ui/tool_filter_proxy.py`:

```python
from PySide6.QtCore import QSortFilterProxyModel, QModelIndex
```

`QSortFilterProxyModel` is the base class — it handles the index mapping and the connection to the view. We only override the one method that decides visibility.

```python
class ToolFilterProxy(QSortFilterProxyModel):

    def __init__(self, parent=None):
        super().__init__(parent)
        self._type_filter: str | None = None
        # None means "no filter" — show all types
        self._min_diameter: float | None = None
        self._max_diameter: float | None = None
```

`self._type_filter = None` means no type filter is active. `"endmill"` means show only endmills. This is the simplest possible state model — two values: active (a string) or inactive (None).

Now the key method:

```python
    def filterAcceptsRow(self, source_row: int, source_parent: QModelIndex) -> bool:
        """
        Called by Qt for every row in the source model.
        Returns True if the row should be visible, False if it should be hidden.
        All active filters must pass — AND logic.
        """
        source_model = self.sourceModel()

        # --- Type filter ---
        if self._type_filter is not None:
            type_index = source_model.index(source_row, 1, source_parent)
            # column 1 = tool_type in ToolTableModel
            row_type = source_model.data(type_index)
            if row_type != self._type_filter:
                return False    # type mismatch — hide this row

        # --- Diameter range filter ---
        if self._min_diameter is not None or self._max_diameter is not None:
            diam_index = source_model.index(source_row, 2, source_parent)
            # column 2 = diameter in ToolTableModel
            raw = source_model.data(diam_index)
            try:
                diameter = float(raw) if raw is not None else 0.0
            except (ValueError, TypeError):
                return False    # unparseable diameter — hide it

            if self._min_diameter is not None and diameter < self._min_diameter:
                return False
            if self._max_diameter is not None and diameter > self._max_diameter:
                return False

        return True    # all active filters passed — show this row
```

`source_model.index(source_row, column, parent)` creates a `QModelIndex` for a specific cell in the source model. `source_model.data(index)` calls the source model's `data()` method to get the cell value — the same value displayed in the view.

### SAVE AND TRY

```python
from PySide6.QtWidgets import QApplication, QTableView
from tooldb_ui.tool_table_model import ToolTableModel
from tooldb_ui.tool_filter_proxy import ToolFilterProxy
from tooldb.schemas.tool_schemas import ToolRead
import sys

app = QApplication(sys.argv)

tools = [
    ToolRead(id=1, name="EM-0600", tool_type="endmill",   diameter=6.0),
    ToolRead(id=2, name="DRL-08",  tool_type="drill",     diameter=8.0),
    ToolRead(id=3, name="EM-1200", tool_type="endmill",   diameter=12.0),
    ToolRead(id=4, name="DRL-10",  tool_type="drill",     diameter=10.0),
]

model = ToolTableModel(tools)
proxy = ToolFilterProxy()
proxy.setSourceModel(model)

view = QTableView()
view.setModel(proxy)
view.show()

app.exec()
```

**You should see:** All 4 tools. The proxy is installed but no filters are active.

**Change something:** After `proxy = ToolFilterProxy()`, add:
```python
proxy._type_filter = "endmill"
```
Restart. You should see only the 2 endmills. Remove that line.

---

## Step 2 — Public Filter Methods

Add setter methods so callers do not touch private attributes directly:

```python
    def set_type_filter(self, tool_type: str | None) -> None:
        """Pass None to clear the type filter."""
        self._type_filter = tool_type
        self.invalidateFilter()    # ← tells Qt to re-run filterAcceptsRow for all rows

    def set_diameter_range(self, min_mm: float | None, max_mm: float | None) -> None:
        """Pass None for either bound to leave it unbounded."""
        self._min_diameter = min_mm
        self._max_diameter = max_mm
        self.invalidateFilter()

    def clear_filters(self) -> None:
        self._type_filter   = None
        self._min_diameter  = None
        self._max_diameter  = None
        self.invalidateFilter()
```

`invalidateFilter()` is the method that triggers a re-evaluation of `filterAcceptsRow()` for every row. Without it, changing `self._type_filter` would have no visible effect — the view would keep showing the old filtered result.

### SAVE AND TRY

```python
# Add to the test script from Step 1:

proxy.set_type_filter("endmill")
print(f"After endmill filter: {proxy.rowCount()} rows")   # expected: 2

proxy.set_diameter_range(8.0, 12.0)
print(f"After diameter 8–12 filter: {proxy.rowCount()} rows")
# endmill + diameter 8–12: EM-1200 (12.0) passes, EM-0600 (6.0) does not
# expected: 1

proxy.clear_filters()
print(f"After clear: {proxy.rowCount()} rows")   # expected: 4
```

**You should see:**
```
After endmill filter: 2 rows
After diameter 8–12 filter: 1 rows
After clear: 4 rows
```

**Change something:** Change `proxy.set_diameter_range(8.0, 12.0)` to `proxy.set_diameter_range(None, 12.0)` — min is None (unbounded). Now it means "diameter ≤ 12". Combined with the endmill filter: EM-0600 (6.0 ≤ 12) and EM-1200 (12.0 ≤ 12) both pass. Expected: 2 rows. Change it back.

---

## Step 3 — Wire Filters to the UI

Add a filter bar above the tool table in your main window. This step shows where the filter controls connect — the actual layout is left to you:

```python
# In tooldb_ui/main.py — in _build_central or wherever the toolbar lives:

from PySide6.QtWidgets import QLineEdit, QComboBox, QDoubleSpinBox

self._type_combo = QComboBox()
self._type_combo.addItem("All types", userData=None)          # userData=None → no filter
self._type_combo.addItem("Endmill",   userData="endmill")
self._type_combo.addItem("Drill",     userData="drill")
self._type_combo.addItem("Tap",       userData="tap")
self._type_combo.currentIndexChanged.connect(self._on_type_filter_changed)

self._min_diam_spin = QDoubleSpinBox()
self._min_diam_spin.setRange(0.0, 100.0)
self._min_diam_spin.setValue(0.0)
self._min_diam_spin.valueChanged.connect(self._on_diameter_filter_changed)

self._max_diam_spin = QDoubleSpinBox()
self._max_diam_spin.setRange(0.0, 100.0)
self._max_diam_spin.setValue(100.0)
self._max_diam_spin.valueChanged.connect(self._on_diameter_filter_changed)
```

```python
def _on_type_filter_changed(self) -> None:
    selected_type = self._type_combo.currentData()   # None or "endmill" etc.
    self._proxy.set_type_filter(selected_type)

def _on_diameter_filter_changed(self) -> None:
    min_mm = self._min_diam_spin.value() or None     # 0.0 treated as no min
    max_mm = self._max_diam_spin.value() or None     # 0.0 treated as no max
    self._proxy.set_diameter_range(min_mm, max_mm)
```

`self._type_combo.currentData()` returns the `userData` value passed to `addItem()` — not the display text. For "All types", that is `None`. For "Endmill", it is `"endmill"`. This is the correct way to attach data to a combo box item without string parsing.

### SAVE AND TRY

Connect the filter controls and run the app. Select "Endmill" from the combo box.

**You should see:** Only endmill rows remain in the table. Select "All types" — all rows return. Adjust the diameter spinners — rows outside the range disappear as you type.

---

## 🎯 Challenge: Search Filter

**You know:** `filterAcceptsRow()` can read any column. `source_model.data()` returns the cell value as a string.

**Task:** Add a `set_search(query: str)` method to `ToolFilterProxy`. When the query is non-empty, hide any row where the tool name does not contain the query string (case-insensitive). Wire it to a `QLineEdit` in the filter bar.

**Starting code:**

```python
def __init__(self, parent=None):
    super().__init__(parent)
    self._type_filter   = None
    self._min_diameter  = None
    self._max_diameter  = None
    self._search_query  = ""    # ← add this

def set_search(self, query: str) -> None:
    # store the query and invalidate
    ...

# In filterAcceptsRow — add a name search check before return True:
if self._search_query:
    name_index = source_model.index(source_row, 0, source_parent)   # column 0 = name
    name = source_model.data(name_index) or ""
    # check if query is in name (case-insensitive)
    ...
```

---

<details>
<summary>▶ Show Solution</summary>

```python
def set_search(self, query: str) -> None:
    self._search_query = query.strip().lower()   # normalize for case-insensitive match
    self.invalidateFilter()
```

In `filterAcceptsRow`, before `return True`:

```python
if self._search_query:
    name_index = source_model.index(source_row, 0, source_parent)
    name = (source_model.data(name_index) or "").lower()
    if self._search_query not in name:
        return False
```

**Key insight:** `.lower()` on both the query and the name makes the comparison case-insensitive without changing either string. `"em" not in "EM-0500".lower()` is `False` — the search finds it. This is the simplest form of substring search. A more advanced version would support multiple words, regex, or fuzzy matching — but those are extensions of the same `filterAcceptsRow` pattern.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| Type filter hides non-matching rows | Set type="endmill", count rows — only endmills visible |
| Diameter range filter works | Set min=10, max=20 — only tools with diameter 10–20 visible |
| Combined filters (AND logic) | Set type="endmill" AND min=10 — only endmills with diameter ≥ 10 |
| `clear_filters()` restores all rows | Call clear, count rows — original count |
| Source model unchanged by filtering | `model.rowCount()` before and after filtering — same number |

---

## Quick Check Answers

**1. Why can't `setFilterFixedString()` filter by diameter range?**
`setFilterFixedString()` does a string contains-match against one column. A diameter of 12.5 contains the characters "1" and "2" but that is not the same as "12.5 is between 6 and 13." String matching cannot express range logic. `filterAcceptsRow()` lets you convert the cell value to a float and compare numerically — the only way to express range conditions.

**2. `filterAcceptsRow()` returns `True` — shown or hidden?**
Shown. `True` means "accept this row into the filtered view." `False` means "reject/hide this row." The name "accepts" means the filter passes the row through — it is visible.

**3. When `invalidateFilter()` is called, what gets recalculated?**
Qt calls `filterAcceptsRow()` for every row in the source model — all of them, not just the ones that changed. The proxy rebuilds the mapping from proxy row indices to source row indices. The view then repaints based on the new mapping. This is why `filterAcceptsRow()` must be fast — it runs once per row every time the filter changes.
