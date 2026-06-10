# Python Tool Database — LAB 68 — Combined Filters and Filter State

**Prerequisites:** Lab 67 (ToolFilterProxy with filterAcceptsRow). You have a working proxy filter. This lesson adds a filter state object and makes filters composable, restorable, and testable in isolation.

**What this lab adds:**
- A `FilterState` dataclass — all filter parameters in one object
- Applying and reading the full state in one call: `proxy.apply_state(state)` / `proxy.get_state()`
- Persisting the last filter to `QSettings` so it survives app restarts
- Unit-testing `filterAcceptsRow` without a UI

**Time:** 40–50 minutes

---

## What You Will Build

A `FilterState` object that captures all active filters:

```python
state = FilterState(tool_type="endmill", min_diameter=6.0, max_diameter=13.0, search="EM")
proxy.apply_state(state)

# Later, read it back:
current = proxy.get_state()
# current.tool_type == "endmill", current.search == "EM"

# Persist it:
settings.save_filter(current)
restored = settings.load_filter()
proxy.apply_state(restored)
```

---

> **Quick Check — try to answer before reading:**
>
> 1. `FilterState` is a dataclass, not a class with `__init__` written by hand. What does Python's `@dataclass` decorator generate for you?
> 2. You save the filter state to `QSettings`. `QSettings` stores values as strings internally. A `FilterState` has `min_diameter: float | None`. How do you round-trip a `float | None` through a string store?
> 3. You want to test `filterAcceptsRow()` without opening a window. The method needs a source model. Can you create a `ToolTableModel` in a test script with no `QApplication`?
>
> *(Answers at the end of this lab)*

---

## Concept: `@dataclass` — Generated `__init__`, `__repr__`, `__eq__`

**What it is:** A decorator that reads your class's type-annotated attributes and generates standard methods (`__init__`, `__repr__`, `__eq__`) automatically.

**The problem before:** Without it:

```python
class FilterState:
    def __init__(self, tool_type=None, min_diameter=None, max_diameter=None, search=""):
        self.tool_type    = tool_type
        self.min_diameter = min_diameter
        self.max_diameter = max_diameter
        self.search       = search

    def __repr__(self):
        return (f"FilterState(tool_type={self.tool_type!r}, "
                f"min_diameter={self.min_diameter!r}, ...)")

    def __eq__(self, other):
        return (self.tool_type == other.tool_type and
                self.min_diameter == other.min_diameter and ...)
```

That is 15 lines of boilerplate that adds no logic — just repeats the attribute list.

**The solution:**

```python
from dataclasses import dataclass

@dataclass
class FilterState:
    tool_type    : str   | None = None
    min_diameter : float | None = None
    max_diameter : float | None = None
    search       : str          = ""
```

Python generates `__init__`, `__repr__`, and `__eq__` from the annotations. Four lines instead of fifteen.

**What it hides:** The mechanical code that copies constructor arguments into attributes, formats the repr string, and compares every attribute for equality. None of that is logic — it is just translation of the attribute list.

**The protected invariant:** `FilterState(tool_type="endmill") == FilterState(tool_type="endmill")` is `True`. Two dataclass instances with the same values are equal. Without `__eq__`, Python compares identity (same object in memory), not value — and two separate `FilterState` objects with the same fields would be unequal.

**Smallest possible example:**

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

p1 = Point(1.0, 2.0)
p2 = Point(1.0, 2.0)
print(p1)           # Point(x=1.0, y=2.0)
print(p1 == p2)     # True
```

**You will see this again in:** FastAPI (request/response schemas), SQLAlchemy 2.0 (mapped dataclasses), Pydantic (which extends `@dataclass`), Python's standard library (`ast.Constant`, `http.cookies.Morsel`). Any time you need a named group of fields with no behavior, a dataclass is the right choice.

**Watch for:** Dataclass fields with mutable defaults (like `list`) must use `field(default_factory=list)`, not `= []`. Using `= []` raises `ValueError` — Python prevents it because a single list would be shared across all instances.

---

## Step 1 — The FilterState Dataclass

Create `tooldb_ui/filter_state.py`:

```python
from dataclasses import dataclass, field
```

`field` is needed only if you add mutable defaults. Import it now so it is available.

```python
@dataclass
class FilterState:
    tool_type    : str   | None = None   # None = no type filter
    min_diameter : float | None = None   # None = no lower bound
    max_diameter : float | None = None   # None = no upper bound
    search       : str          = ""     # empty = no search filter

    def is_empty(self) -> bool:
        """True when no filters are active — all tools are visible."""
        return (
            self.tool_type    is None and
            self.min_diameter is None and
            self.max_diameter is None and
            self.search       == ""
        )
```

`is_empty()` is useful for disabling a "Clear Filters" button when there is nothing to clear.

### SAVE AND TRY

```python
from tooldb_ui.filter_state import FilterState

empty = FilterState()
print(f"Empty: {empty}")
print(f"Is empty: {empty.is_empty()}")

active = FilterState(tool_type="endmill", min_diameter=6.0, search="EM")
print(f"Active: {active}")
print(f"Is empty: {active.is_empty()}")

# Equality from __eq__:
same = FilterState(tool_type="endmill", min_diameter=6.0, search="EM")
print(f"Equal to copy: {active == same}")
```

**You should see:**
```
Empty: FilterState(tool_type=None, min_diameter=None, max_diameter=None, search='')
Is empty: True
Active: FilterState(tool_type='endmill', min_diameter=6.0, max_diameter=None, search='EM')
Is empty: False
Equal to copy: True
```

**Change something:** Add `search="EM-01"` to the `empty` instance after creation: `empty.search = "EM-01"`. Call `empty.is_empty()` again. You should see `False` — the search field is now set. By default, dataclasses are mutable (you can set attributes after creation). Change it back.

---

## Step 2 — `apply_state()` and `get_state()` on the Proxy

Extend `ToolFilterProxy` from Lab 67:

```python
# In tooldb_ui/tool_filter_proxy.py — add these methods to ToolFilterProxy:

from tooldb_ui.filter_state import FilterState

    def apply_state(self, state: FilterState) -> None:
        """Applies all filters from a FilterState in one call."""
        self._type_filter   = state.tool_type
        self._min_diameter  = state.min_diameter
        self._max_diameter  = state.max_diameter
        self._search_query  = state.search.strip().lower()
        self.invalidateFilter()    # ← single call after all fields are updated

    def get_state(self) -> FilterState:
        """Returns the current filter configuration as a FilterState."""
        return FilterState(
            tool_type    = self._type_filter,
            min_diameter = self._min_diameter,
            max_diameter = self._max_diameter,
            search       = self._search_query,
        )
```

The important detail: `apply_state()` sets all fields and then calls `invalidateFilter()` **once**. If you called individual setters (`set_type_filter()`, then `set_diameter_range()`), `invalidateFilter()` would be called twice, causing the view to recalculate twice. A single `invalidateFilter()` at the end is more efficient.

### SAVE AND TRY

```python
from tooldb_ui.filter_state import FilterState
from tooldb_ui.tool_filter_proxy import ToolFilterProxy
from tooldb_ui.tool_table_model import ToolTableModel
from tooldb.schemas.tool_schemas import ToolRead
from PySide6.QtWidgets import QApplication
import sys

app = QApplication(sys.argv)

tools = [
    ToolRead(id=1, name="EM-0600", tool_type="endmill",  diameter=6.0),
    ToolRead(id=2, name="DRL-08",  tool_type="drill",    diameter=8.0),
    ToolRead(id=3, name="EM-1200", tool_type="endmill",  diameter=12.0),
]

model = ToolTableModel(tools)
proxy = ToolFilterProxy()
proxy.setSourceModel(model)

state = FilterState(tool_type="endmill", min_diameter=8.0)
proxy.apply_state(state)
print(f"Rows visible: {proxy.rowCount()}")     # expected: 1 (only EM-1200)

print(f"Current state: {proxy.get_state()}")
print(f"States match: {proxy.get_state() == state}")
```

**You should see:**
```
Rows visible: 1
Current state: FilterState(tool_type='endmill', min_diameter=8.0, max_diameter=None, search='')
States match: True
```

---

## Step 3 — Persisting Filter State with QSettings

`QSettings` (introduced in the challenge from Lab 63) stores string key-value pairs. Serializing `FilterState` requires converting each field to/from a string:

```python
# In tooldb_ui/filter_state.py — add after the FilterState class:

from PySide6.QtCore import QSettings


def save_filter_state(state: FilterState, settings: QSettings) -> None:
    """Writes all filter fields to QSettings."""
    settings.beginGroup("filter")
    settings.setValue("tool_type",    state.tool_type or "")
    settings.setValue("min_diameter", str(state.min_diameter) if state.min_diameter is not None else "")
    settings.setValue("max_diameter", str(state.max_diameter) if state.max_diameter is not None else "")
    settings.setValue("search",       state.search)
    settings.endGroup()


def load_filter_state(settings: QSettings) -> FilterState:
    """Reads filter fields from QSettings, returning defaults for missing values."""
    settings.beginGroup("filter")

    raw_type = settings.value("tool_type", "")
    raw_min  = settings.value("min_diameter", "")
    raw_max  = settings.value("max_diameter", "")
    search   = settings.value("search", "")

    settings.endGroup()

    return FilterState(
        tool_type    = raw_type  or None,    # empty string → None (no filter)
        min_diameter = float(raw_min) if raw_min else None,
        max_diameter = float(raw_max) if raw_max else None,
        search       = search,
    )
```

`settings.beginGroup("filter")` / `settings.endGroup()` namespaces all the keys under `filter/` — so `tool_type` becomes `filter/tool_type` in the settings store. This prevents collisions with other settings.

`str(state.min_diameter) if state.min_diameter is not None else ""` — `QSettings` only stores strings. `None` becomes an empty string; empty string becomes `None` on read. `float(raw_min) if raw_min else None` converts back.

### SAVE AND TRY

```python
from PySide6.QtCore import QSettings
from tooldb_ui.filter_state import FilterState, save_filter_state, load_filter_state

settings = QSettings("ToolDatabase", "TestApp")

state = FilterState(tool_type="endmill", min_diameter=6.0, search="EM")
save_filter_state(state, settings)
settings.sync()   # force write to disk

restored = load_filter_state(settings)
print(f"Restored: {restored}")
print(f"Round-trip successful: {state == restored}")
```

**You should see:**
```
Restored: FilterState(tool_type='endmill', min_diameter=6.0, max_diameter=None, search='EM')
Round-trip successful: True
```

**Change something:** Remove `settings.sync()`. Run again. `QSettings` writes lazily — your data may still be there from the previous run because the settings were never cleared. Now call `settings.clear()` before `save_filter_state`. The restore should still work because you just saved fresh values. Change it back.

---

## 🎯 Challenge: Unit Test filterAcceptsRow Without a Window

**You know:** `filterAcceptsRow()` calls `source_model.data()`. `ToolTableModel` takes a `list[ToolRead]`. Both are pure Python objects — no window required.

**Task:** Write a test function (no test framework needed — just assertions) that:
1. Creates a `ToolTableModel` with 3 tools
2. Creates a `ToolFilterProxy` with that model as the source
3. Applies a `FilterState(tool_type="endmill")`
4. Asserts that `proxy.rowCount()` == 2 (if 2 endmills)
5. Applies `FilterState()` (empty)
6. Asserts that `proxy.rowCount()` == 3

No `QApplication`, no window, no `view.show()`. Just model + proxy + assertions.

**Starting code:**

```python
from PySide6.QtCore import QCoreApplication   # lighter than QApplication — no GUI
import sys

app = QCoreApplication(sys.argv)   # required for Qt objects but no window

from tooldb_ui.tool_filter_proxy import ToolFilterProxy
from tooldb_ui.tool_table_model import ToolTableModel
from tooldb_ui.filter_state import FilterState
from tooldb.schemas.tool_schemas import ToolRead

def test_type_filter():
    tools = [...]   # define 3 tools here
    model = ToolTableModel(tools)
    proxy = ToolFilterProxy()
    proxy.setSourceModel(model)
    # ... your assertions
```

---

<details>
<summary>▶ Show Solution</summary>

```python
from PySide6.QtCore import QCoreApplication
import sys

app = QCoreApplication(sys.argv)

from tooldb_ui.tool_filter_proxy import ToolFilterProxy
from tooldb_ui.tool_table_model import ToolTableModel
from tooldb_ui.filter_state import FilterState
from tooldb.schemas.tool_schemas import ToolRead

def test_type_filter():
    tools = [
        ToolRead(id=1, name="EM-0600", tool_type="endmill", diameter=6.0),
        ToolRead(id=2, name="DRL-08",  tool_type="drill",   diameter=8.0),
        ToolRead(id=3, name="EM-1200", tool_type="endmill", diameter=12.0),
    ]
    model = ToolTableModel(tools)
    proxy = ToolFilterProxy()
    proxy.setSourceModel(model)

    proxy.apply_state(FilterState(tool_type="endmill"))
    assert proxy.rowCount() == 2, f"Expected 2, got {proxy.rowCount()}"

    proxy.apply_state(FilterState())
    assert proxy.rowCount() == 3, f"Expected 3, got {proxy.rowCount()}"

    print("test_type_filter passed")

test_type_filter()
```

**Key insight:** `QCoreApplication` (not `QApplication`) is enough for Qt objects that have no GUI. Model/proxy tests only need the Qt event infrastructure — not a display. This means filter logic is fully unit-testable without screenshots, manual verification, or a screen. Any logic you can express in `filterAcceptsRow()` can be tested this way: create data, apply filter, assert row count.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| `FilterState()` equality works | Create two identical FilterState objects — `==` returns True |
| `apply_state()` calls `invalidateFilter()` once | Add a print in `invalidateFilter` override — should print once per `apply_state` call |
| `get_state()` round-trips correctly | `proxy.get_state() == state` after `apply_state(state)` |
| `save_filter_state` / `load_filter_state` round-trip | Save a state with all fields set, load it back, compare |
| `is_empty()` returns True only for default FilterState | `FilterState().is_empty()` → True; `FilterState(search="x").is_empty()` → False |

---

## Quick Check Answers

**1. What does `@dataclass` generate?**
`__init__` (accepts keyword arguments for each annotated field, with defaults if provided), `__repr__` (prints the class name and each field's value), and `__eq__` (compares all fields for equality). These three methods cover the most common boilerplate for data-holding classes. `@dataclass(frozen=True)` additionally generates `__hash__` and makes instances immutable.

**2. How to round-trip `float | None` through a string store?**
Convert `None` to empty string when saving (`"" if value is None else str(value)`). Convert empty string back to `None` when loading (`None if raw == "" else float(raw)`). `QSettings` cannot distinguish between "not present" and "empty string" in all backends — the round-trip must be explicit. This is the standard pattern for nullable numeric settings.

**3. Can you create `ToolTableModel` in a test without `QApplication`?**
Yes, with `QCoreApplication` — the lightweight Qt application class that provides the event loop infrastructure without creating a display. `QAbstractTableModel` subclasses work fine with `QCoreApplication`. `QWidget` subclasses require `QApplication` (which creates a window system connection). Since models are not widgets, `QCoreApplication` is sufficient for testing them.
