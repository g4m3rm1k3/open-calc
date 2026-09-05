# Lesson M4.1: A Field, a Button, and a Signal Connecting Them

*File paths under mastercam-app/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder. This lesson adds a real, new file - ta_search_panel.py - to verification/mastercam-app-copy/mastercam-app/mastercam_app/ui/, not the real mastercam-app/, per this phase's rule. This is the first lesson of a real, growing feature this phase keeps extending.*

**What you will build:** A brand-new dialog - TASearchPanel - with a real QLineEdit field, a real QPushButton, and a real QTableWidget, wired together with a signal/slot connection, using Phase M3's own fixed Database.search_by_tool_code to actually populate the table.

**What you need to know first:** Lesson M4.0's QMainWindow/central-widget shape, and Phase M3.5's real, fixed search_by_tool_code method - this lesson calls it for real.

## Terms used in this lesson

- **Signal** — A real, declared event source a Qt object can emit - QPushButton already has a built-in `clicked` signal, emitted automatically whenever the button is actually clicked (or activated via keyboard).
- **Slot** — Any callable connected to a signal - here, a plain method, `self._run_search`, connected via `.connect(...)`. Nothing marks it as special; anything callable can be a slot.
- **QLineEdit.text()** — Reads whatever the user has currently typed into a single-line text field, as a real, live Python string - not a snapshot taken at field-creation time.

## Objects and methods used

- **`TASearchPanel`**
  - *What it is:* A new, real QDialog with a search field and a results table
  - *Implementation:* mastercam_app/ui/ta_search_panel.py (new)
  - *Its use:* Standalone for now - not yet wired into DataViewer's menu (Lesson M4.4)
  - *Type:* class (QDialog subclass)
  - *Responsibility:* Take a tool code, query the database, show matching rows
  - *Depends on:* get_db, Database.search_by_tool_code (Phase M3)
  - *Connects to:* QPushButton.clicked -> self._run_search -> self._populate
  - *Shape:* one field, one button, one table, connected by a single signal

## Concept Unit: Wiring a Button's clicked Signal to a Real Method

### The Problem

A button by itself does nothing when clicked - something has to run in response. The panel needs: type a code, press Search, see results.

Before reading on:

- search_button.clicked.connect(self._run_search) - note there are no parentheses after self._run_search. What would happen instead if you wrote .connect(self._run_search())?
- self.query_field.text() is called fresh inside _run_search, not stored earlier - why does that matter for a field the user might still be typing into?

### Project Change

- **Reference Source:** No reference counterpart - this is a from-scratch addition, built new for this lesson. mastercam_app/ui/dialogs.py's real TAEditorDialog (Phase M3-adjacent) already shows the same clicked.connect shape this unit teaches directly: mastercam_app/ui/dialogs.py:273 (save_btn.clicked.connect(self._save)).
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/mastercam_app/ui/ta_search_panel.py` (new)
- **Change type:** add
- **Location:** new file
- **Dependencies:** PySide6.QtWidgets, mastercam_app.db.connection.get_db

### The New Code

The whole new file - a field, a button, an empty table, and the signal connection. _run_search and _populate are covered in the next unit.

**File:** `verification/mastercam-app-copy/mastercam-app/mastercam_app/ui/ta_search_panel.py` (new)

```python
"""
A new, real search panel for tools by code - a small, standalone
QDialog built for Lesson M4.1, using the real, fixed
Database.search_by_tool_code from Phase M3.
"""

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLineEdit, QPushButton,
    QTableWidget, QTableWidgetItem, QLabel,
)

from mastercam_app.db.connection import get_db

COLUMNS = ["TA Number", "Holder", "Tool Code", "Diameter", "Part"]


class TASearchPanel(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Search Tools by Code")
        self.resize(700, 400)

        layout = QVBoxLayout(self)

        search_row = QHBoxLayout()
        search_row.addWidget(QLabel("Tool code:"))
        self.query_field = QLineEdit()
        self.query_field.setPlaceholderText("e.g. T0101")
        search_row.addWidget(self.query_field)
        self.search_button = QPushButton("Search")
        self.search_button.clicked.connect(self._run_search)
        search_row.addWidget(self.search_button)
        layout.addLayout(search_row)

        self.results_table = QTableWidget(0, len(COLUMNS))
        self.results_table.setHorizontalHeaderLabels(COLUMNS)
        layout.addWidget(self.results_table)
```

### Mechanical Walkthrough

- `self.search_button.clicked.connect(self._run_search)` — self._run_search (no parentheses) is a bound method object - connect stores it and calls it later, when clicked actually fires. Writing self._run_search() here would call it immediately, once, during __init__, and pass whatever it returns (None) to connect instead - a real, common mistake.
- `self.query_field.setPlaceholderText("e.g. T0101")` — Placeholder text shows only when the field is empty and disappears the moment the user types - it's not a default value; text() would still return "" until real input exists.

### CS Lens

This is **callback registration** - storing a reference to code to run later, in response to an event, rather than running it now. Qt's signal/slot system is a strongly-typed, introspectable version of the same pattern JavaScript's addEventListener or a plain Python callback list would use.

### SE Lens

The real alternative - polling the button's state in a loop ("check every 100ms whether it was clicked") - would waste CPU and still be less precise than an event fired exactly once, at the exact moment of the click. Signals/slots exist specifically so widgets don't need polling.

### Commands needed

- `python -c "from PySide6.QtWidgets import QApplication; import sys; app = QApplication(sys.argv); from mastercam_app.ui.ta_search_panel import TASearchPanel; p = TASearchPanel(); print(p.query_field.placeholderText())"` — Run from verification/mastercam-app-copy/mastercam-app/ - confirms the panel constructs without error

### Verification

```text
e.g. T0101
```

Full saved run: `verification/mastercam-phase-04/lab_test_ta_search_panel_output.txt`.

### Connection to the previous unit

Lesson M4.0 built a minimal QMainWindow; this unit is the first real, growing feature this phase adds - a QDialog instead, since this panel isn't the app's main window.

## Concept Unit: The Signal Fires - Now Something Has to Query and Display

### The Problem

Connecting clicked to _run_search only matters once _run_search actually does something real: read the field, query the database, and put rows into the table.

Before reading on:

- _populate sets self.results_table.setRowCount(len(rows)) before filling any cells - what would happen to old rows from a previous search if this line were removed?
- row.get('ta_number', '') uses .get with a default instead of row['ta_number'] - what real situation would make that difference matter?

### Project Change

- **Reference Source:** No reference counterpart - new code, using mastercam_app/db/database.py:767's real, fixed search_by_tool_code (Phase M3.5) as its data source.
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/mastercam_app/ui/ta_search_panel.py` (modified)
- **Change type:** add
- **Location:** end of ta_search_panel.py
- **Dependencies:** get_db, Database.search_by_tool_code

### The New Code

The two real methods the signal connection above calls.

**File:** `verification/mastercam-app-copy/mastercam-app/mastercam_app/ui/ta_search_panel.py` (new)

```python
def _run_search(self):
    db = get_db()
    query = self.query_field.text()
    rows = db.search_by_tool_code(query)
    self._populate(rows)

def _populate(self, rows):
    self.results_table.setRowCount(len(rows))
    for row_index, row in enumerate(rows):
        values = [
            row.get("ta_number", ""),
            row.get("holder_name", ""),
            row.get("tool_code", ""),
            row.get("tool_diameter", ""),
            row.get("partnumber", ""),
        ]
        for col_index, value in enumerate(values):
            self.results_table.setItem(row_index, col_index, QTableWidgetItem(str(value)))
```

### Mechanical Walkthrough

- `self.results_table.setRowCount(len(rows))` — This both grows AND shrinks the table to match the new result count - a second search with fewer matches than the first automatically drops the extra old rows, rather than leaving stale ones from before mixed in with new results.
- `row.get("ta_number", "")` — search_by_tool_code returns real dict rows built from sqlite3.Row objects via _rows_to_list - every real row does have this key, so .get's default never actually triggers here. It's defensive against a future column rename breaking silently into a KeyError crash instead of an empty cell.

### CS Lens

This is the real end of the callback chain from the unit above: event (click) -> signal (clicked) -> slot (_run_search) -> real side effect (a database query and a UI update) - the same shape every event-driven system uses, traced here through one real, concrete path.

### SE Lens

The real alternative - querying the database once at panel construction and never again - would show stale results forever. Querying inside the slot, triggered by the user's own action, keeps the displayed data as current as the last real search the user actually asked for.

### Commands needed

- `python -m pytest tests/test_ta_search_panel.py -v` — Run from verification/mastercam-app-copy/mastercam-app/

### Verification

```text
collected 2 items

tests/test_ta_search_panel.py::test_search_populates_the_table_with_a_real_match PASSED [ 50%]
tests/test_ta_search_panel.py::test_search_with_no_match_clears_the_table PASSED [100%]

============================== 2 passed in 0.13s ==============================
```

Full saved run: `verification/mastercam-phase-04/lab_test_ta_search_panel_output.txt`.

### Connection to the previous unit

The unit above wired the signal; this unit is what actually runs when it fires - together, a complete, real, working feature.

## Connect the pieces

Trace tool code "T0101" through both units: typing it into query_field and clicking Search fires the signal wired in unit one, which runs _run_search (unit two) - reading the field's real text, calling Phase M3's own fixed search_by_tool_code, and landing "TA0060" in the table's first cell, proven by a real, passing test using a real in-memory database.

**Next lesson:** Next: turning a selected search result into an editable form - QFormLayout and multiple QLineEdit fields, wired to Phase M3.3's fixed, atomic update_ta.