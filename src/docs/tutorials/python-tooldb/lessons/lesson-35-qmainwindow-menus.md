# Python Tool Database — LAB 35 — QMainWindow, Menus, and Status Bar

**Prerequisites:** Lab 34. You have a `ToolDatabaseWindow(QWidget)` with a live-search list. Now you upgrade it to a proper application window with a menu bar and a real status bar.

**What this lab adds:**
- `QMainWindow` — the standard application window with designated zones
- Menu bar and `QAction` — the Command pattern
- Status bar for non-blocking feedback
- Why `QAction` is better than connecting menus and toolbars separately

**Time:** 35–45 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. What four zones does `QMainWindow` provide that a plain `QWidget` does not?
> 2. You have "Save" in the File menu and a Save button in a toolbar. Both should do the same thing. Without `QAction`, how many places do you connect the save logic? With `QAction`, how many?
> 3. `statusBar().showMessage("Saved", 3000)` — what does the `3000` mean?
>
> *(Answers at the end)*

---

## `QMainWindow` vs `QWidget`

`QWidget` is a blank container — you build everything yourself. `QMainWindow` is a specialized window that Qt applications conventionally use. It divides the window into five zones:

```
┌─────────────────────────────────┐
│  Menu Bar                       │
├─────────────────────────────────┤
│  Toolbar(s)                     │
├──────┬──────────────────┬───────┤
│ Dock │  Central Widget  │ Dock  │
│      │  (your content)  │       │
├─────────────────────────────────┤
│  Status Bar                     │
└─────────────────────────────────┘
```

The central widget is where your content goes — the search bar, the tool list, the buttons. Everything else is provided by `QMainWindow`.

---

## Step 1 — Convert to QMainWindow

Update `tooldb_ui/main.py`. The key changes:
- Inherit from `QMainWindow` instead of `QWidget`
- Create a container `QWidget` for the content and set it as the central widget
- Build the menu bar and status bar

```python
import sys
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QLabel, QLineEdit,
    QPushButton, QVBoxLayout, QHBoxLayout, QListWidget,
)
from PySide6.QtGui import QAction
from PySide6.QtCore import Qt


class ToolDatabaseWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Tool Database")
        self.setMinimumSize(700, 500)
        self._build_menu()
        self._build_central()
        self._build_status()

    # ── Menu ──────────────────────────────────────────────

    def _build_menu(self):
        menubar = self.menuBar()

        # File menu
        file_menu = menubar.addMenu("&File")

        self.open_action = QAction("&Open Database...", self)
        self.open_action.setShortcut("Ctrl+O")
        self.open_action.triggered.connect(self._on_open_database)
        file_menu.addAction(self.open_action)

        file_menu.addSeparator()

        exit_action = QAction("E&xit", self)
        exit_action.setShortcut("Ctrl+Q")
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)

        # Help menu
        help_menu = menubar.addMenu("&Help")
        about_action = QAction("&About", self)
        about_action.triggered.connect(self._on_about)
        help_menu.addAction(about_action)

    # ── Central widget ────────────────────────────────────

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

        self.tool_list = QListWidget()
        self._populate_tool_list(self._all_tools())
        self.tool_list.itemClicked.connect(self._on_tool_selected)
        root.addWidget(self.tool_list)

        button_row = QHBoxLayout()
        button_row.addStretch()
        self.add_button = QPushButton("Add Tool")
        self.add_button.clicked.connect(self._on_add_tool)
        button_row.addWidget(self.add_button)
        root.addLayout(button_row)

    # ── Status bar ────────────────────────────────────────

    def _build_status(self):
        self.statusBar().showMessage(f"{len(self._all_tools())} tools loaded")

    # ── Data (hard-coded until Lesson 36) ────────────────

    def _all_tools(self) -> list[str]:
        return [
            "EM-0500-4FL-C — 0.5\" endmill, carbide",
            "EM-0375-4FL-C — 0.375\" endmill, carbide",
            "EM-0750-4FL-C — 0.75\" endmill, carbide",
            "DR-0250-HSS — 0.25\" drill, HSS",
            "DR-0500-HSS — 0.5\" drill, HSS",
            "FM-1000-C — 1.0\" facemill, carbide",
            "EM-0625-4FL-C — 0.625\" endmill, carbide",
            "TAP-0250-HSS — 1/4-20 tap, HSS",
        ]

    def _populate_tool_list(self, tools: list[str]) -> None:
        self.tool_list.clear()
        for tool in tools:
            self.tool_list.addItem(tool)

    # ── Slots ─────────────────────────────────────────────

    def _on_search_changed(self, text: str) -> None:
        filtered = [t for t in self._all_tools() if text.lower() in t.lower()]
        self._populate_tool_list(filtered)
        self.statusBar().showMessage(f"{len(filtered)} tools shown")

    def _on_tool_selected(self, item) -> None:
        self.statusBar().showMessage(f"Selected: {item.text()}", 5000)

    def _on_add_tool(self) -> None:
        self.statusBar().showMessage("Add Tool dialog — coming in Lesson 39", 3000)

    def _on_open_database(self) -> None:
        self.statusBar().showMessage("Open Database — coming in Lesson 36", 3000)

    def _on_about(self) -> None:
        self.statusBar().showMessage("Tool Database v0.1", 5000)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = ToolDatabaseWindow()
    window.show()
    sys.exit(app.exec())
```

Run it. You should see a proper application with a File and Help menu, a working search bar, and a status bar.

---

## `QAction` — The Command Pattern

`QAction` represents a *command*, not a UI element. It has:
- A name ("Open Database...")
- An optional keyboard shortcut ("Ctrl+O")
- An optional icon (added later)
- A `triggered` signal

You connect the logic once — to the action's `triggered` signal. Then you add the action to a menu, a toolbar, or both. The logic doesn't move.

```python
# Without QAction — two connections for the same operation:
file_menu.addAction("Open...").triggered.connect(self._on_open)
toolbar_button.clicked.connect(self._on_open)

# With QAction — one connection regardless of how many places it appears:
self.open_action = QAction("Open...", self)
self.open_action.triggered.connect(self._on_open)
file_menu.addAction(self.open_action)
toolbar.addAction(self.open_action)    # adds it to both; same slot
```

When you store the action as `self.open_action`, you can also enable/disable it: `self.open_action.setEnabled(False)` greys it out in both the menu and the toolbar simultaneously.

---

## Status Bar Usage

The status bar has two modes:

```python
# Permanent message (stays until changed):
self.statusBar().showMessage("5 tools loaded")

# Temporary message (disappears after N milliseconds):
self.statusBar().showMessage("Saved successfully", 3000)  # 3 seconds
```

Status bar messages are the right place for non-blocking feedback. A popup dialog for "Tool saved" is annoying — it requires dismissal. A status bar message appears and disappears automatically.

---

## Step 2 — SAVE AND TRY

**Try the keyboard shortcuts.** Press `Ctrl+O` — the status bar shows the placeholder message. Press `Ctrl+Q` — the window closes. Qt wires the shortcuts to the `QAction` automatically once you call `setShortcut`.

**Add a toolbar.** After the menu bar setup:

```python
toolbar = self.addToolBar("Main")
toolbar.addAction(self.open_action)   # same action, appears in toolbar too
```

The toolbar button and the menu item are the same command. Clicking either one calls `_on_open_database`.

**Disable the Open action** after it's created:

```python
self.open_action.setEnabled(False)
```

Both the menu item and the toolbar button grey out. Re-enable it:

```python
self.open_action.setEnabled(True)
```

---

## Challenge

Add an "Edit" menu with a "Find..." action (shortcut `Ctrl+F`) that gives focus to the search field:

```python
self.search_input.setFocus()
self.search_input.selectAll()
```

`setFocus()` moves the keyboard cursor to the field. `selectAll()` highlights any existing text so the user can start typing immediately.

<details>
<summary>Answer</summary>

In `_build_menu`:
```python
edit_menu = menubar.addMenu("&Edit")
find_action = QAction("&Find...", self)
find_action.setShortcut("Ctrl+F")
find_action.triggered.connect(self._on_find)
edit_menu.addAction(find_action)
```

Add the slot:
```python
def _on_find(self) -> None:
    self.search_input.setFocus()
    self.search_input.selectAll()
```

</details>

---

## Final Check

| | |
|--|--|
| File menu opens with "Open Database..." and "Exit" | ✓ |
| `Ctrl+Q` closes the window | ✓ |
| Selecting a tool shows it in the status bar for 5 seconds | ✓ |
| Typing in search updates the status bar count | ✓ |
| The same `QAction` could be added to a toolbar without changing the slot | ✓ understood |

---

## Quick Check Answers

1. **Menu bar, toolbar(s), status bar, and dock widget areas** (left, right, bottom). The central widget is the fifth zone but it's really just the content area that plain `QWidget` also has.

2. **Without `QAction`: two `connect()` calls** — one for the menu item, one for the toolbar button. If you add a third trigger (keyboard shortcut), that's a third connection. With `QAction`: **one `connect()` call** — the action's `triggered` signal. Add the action to as many places as you want; the logic stays in one slot.

3. **3000 milliseconds = 3 seconds.** The message displays for 3 seconds and then disappears, restoring the previous permanent status bar message (if any). Pass `0` or omit the timeout for a permanent message.
