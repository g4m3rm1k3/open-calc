# Python Tool Database — LAB 33 — Widgets and Layouts

**Prerequisites:** Lab 32. You have a window that shows a label. Now you add more widgets and learn how to arrange them without setting pixel coordinates.

**What this lab adds:**
- `QWidget` as a container
- `QLabel`, `QPushButton`, `QLineEdit`
- `QVBoxLayout` and `QHBoxLayout`
- Why layouts exist — the resize problem
- Building the visual shell of the tool database

**Time:** 40–50 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You place a button at pixel coordinates (200, 50). The user resizes the window to be narrower than 200px. What happens to the button?
> 2. `QVBoxLayout` vs `QHBoxLayout` — what does the V and H stand for, and what does each arrange?
> 3. A `QLineEdit` and a `QLabel` — which one accepts user input?
>
> *(Answers at the end)*

---

## Why Not Pixel Coordinates?

Every GUI toolkit offers absolute positioning — place a widget at exactly x=200, y=50. It's tempting and it works on your screen. It breaks as soon as:
- The window is resized
- The font size changes (accessibility settings)
- The OS uses a different DPI
- The window is displayed on a different platform

Layouts solve this. Instead of saying "this widget is at position (200, 50)", you say "this widget is in the second row of a vertical stack." The layout engine figures out the pixel math, and recalculates whenever the window changes size.

---

## The Widgets You Need for This Lesson

```python
from PySide6.QtWidgets import (
    QApplication, QWidget, QMainWindow,
    QLabel, QPushButton, QLineEdit,
    QVBoxLayout, QHBoxLayout,
)
```

| Widget | What it does |
|--------|-------------|
| `QWidget` | The base class for all widgets; also used as a plain container |
| `QLabel` | Displays text (or an image); not interactive |
| `QPushButton` | A clickable button |
| `QLineEdit` | A single-line text input field |
| `QVBoxLayout` | Stacks widgets vertically (top to bottom) |
| `QHBoxLayout` | Stacks widgets horizontally (left to right) |

---

## Step 1 — A Widget with a Layout

Replace `tooldb_ui/main.py`:

```python
import sys
from PySide6.QtWidgets import (
    QApplication, QWidget, QLabel, QLineEdit, QPushButton,
    QVBoxLayout, QHBoxLayout,
)


class ToolDatabaseWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Tool Database")
        self.setMinimumSize(600, 400)
        self._build_ui()

    def _build_ui(self):
        root = QVBoxLayout(self)          # vertical stack, attached to this widget

        # Header
        header = QLabel("Tool Database")
        root.addWidget(header)

        # Search row: a label + text field side by side
        search_row = QHBoxLayout()
        search_row.addWidget(QLabel("Search:"))
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Filter by name...")
        search_row.addWidget(self.search_input)
        root.addLayout(search_row)        # add a layout inside a layout

        # Placeholder for the tool table (Lesson 34+)
        self.placeholder = QLabel("(tool list goes here)")
        root.addWidget(self.placeholder)

        # Button row
        button_row = QHBoxLayout()
        button_row.addStretch()           # push buttons to the right
        self.add_button = QPushButton("Add Tool")
        button_row.addWidget(self.add_button)
        root.addLayout(button_row)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = ToolDatabaseWindow()
    window.show()
    sys.exit(app.exec())
```

Run it. You should see a window with a search row at the top, a placeholder in the middle, and an "Add Tool" button at the bottom right.

Resize the window. Everything reflows — the search field stretches wider, the button stays at the right edge.

---

## What Just Happened: Layout Nesting

The layout tree:

```
QVBoxLayout (root)
├── QLabel "Tool Database"
├── QHBoxLayout (search_row)
│   ├── QLabel "Search:"
│   └── QLineEdit
├── QLabel "(tool list goes here)"
└── QHBoxLayout (button_row)
    ├── stretch
    └── QPushButton "Add Tool"
```

`root.addLayout(search_row)` nests a horizontal layout inside the vertical one. Layouts can contain other layouts — this is how complex UIs are built. Every layout is just a rule about how to arrange its children.

---

## Step 2 — The Widget Class Pattern

Notice the structure of `ToolDatabaseWindow`:

```python
class ToolDatabaseWindow(QWidget):
    def __init__(self):
        super().__init__()          # always call super().__init__() first
        self._build_ui()

    def _build_ui(self):
        ...
```

**Always call `super().__init__()`.** Qt's C++ internals need to run their own initialization. Skipping this causes subtle crashes that are hard to diagnose.

**`_build_ui` is a convention**, not a requirement. Separating the constructor from the UI building makes the `__init__` readable — it says what the window *is* (`setWindowTitle`, `setMinimumSize`) and `_build_ui` says what it *contains*.

**Store widgets you need later as `self.widget`**. The search input and the button are stored as `self.search_input` and `self.add_button` so other methods can read and connect them. Widgets you never reference again (the header label, the "Search:" label) don't need to be stored.

---

## Step 3 — SAVE AND TRY

**Experiment 1: Remove `addStretch()`**

Comment out `button_row.addStretch()`. The button moves to the left edge. `addStretch()` inserts an expanding spacer — it consumes all leftover space in the layout, pushing everything else toward the opposite edge.

**Experiment 2: Nest another layout**

Between the placeholder and the button row, add a second button:

```python
self.delete_button = QPushButton("Delete Tool")
button_row.addWidget(self.delete_button)
```

Add it before `addStretch()`. The buttons stay on the right because the stretch is first; if you move the stretch after the buttons, they move left. Try it both ways.

**Experiment 3: Placeholder text**

Change the search field:

```python
self.search_input.setPlaceholderText("Type a tool name...")
```

Placeholder text appears when the field is empty and disappears when the user starts typing. It's hint text, not a default value — `self.search_input.text()` returns `""` when the placeholder is showing.

---

## Concept: The Widget Tree and Ownership

Every widget has a **parent**. When a parent is destroyed, Qt automatically destroys all its children. You don't manage memory manually.

When you do `QVBoxLayout(self)`, you pass `self` as the layout's parent widget. The layout then reparents any widget you add to it. The full chain: `window → layout → widgets`. Closing the window destroys the layout, which destroys all the widgets.

This is why we don't `del` widgets manually. Qt's parent-child ownership handles cleanup.

---

## Challenge

Add a status label at the very bottom of the window that shows "0 tools loaded". It should span the full width and be left-aligned.

Then add a horizontal separator line above it. Qt has `QFrame` for this:

```python
from PySide6.QtWidgets import QFrame

separator = QFrame()
separator.setFrameShape(QFrame.Shape.HLine)
separator.setFrameShadow(QFrame.Shadow.Sunken)
root.addWidget(separator)
```

<details>
<summary>Answer</summary>

```python
def _build_ui(self):
    root = QVBoxLayout(self)

    header = QLabel("Tool Database")
    root.addWidget(header)

    search_row = QHBoxLayout()
    search_row.addWidget(QLabel("Search:"))
    self.search_input = QLineEdit()
    self.search_input.setPlaceholderText("Filter by name...")
    search_row.addWidget(self.search_input)
    root.addLayout(search_row)

    self.placeholder = QLabel("(tool list goes here)")
    root.addWidget(self.placeholder)

    button_row = QHBoxLayout()
    button_row.addStretch()
    self.add_button = QPushButton("Add Tool")
    button_row.addWidget(self.add_button)
    root.addLayout(button_row)

    separator = QFrame()
    separator.setFrameShape(QFrame.Shape.HLine)
    separator.setFrameShadow(QFrame.Shadow.Sunken)
    root.addWidget(separator)

    self.status_label = QLabel("0 tools loaded")
    root.addWidget(self.status_label)
```

</details>

---

## Final Check

| | |
|--|--|
| Window resizes without widgets overlapping or disappearing | ✓ |
| Stretch pushes the button to the right edge | ✓ |
| `self.search_input` and `self.add_button` accessible from outside `_build_ui` | ✓ |
| `super().__init__()` called first in `__init__` | ✓ |

---

## Quick Check Answers

1. **The button disappears off the left edge of the window**, or it stays at its absolute position while the content area shrinks around it. Either way the UI is broken and unusable. Fixed positions make the window non-resizable in practice.

2. **V = Vertical (top to bottom), H = Horizontal (left to right).** `QVBoxLayout` stacks widgets in a column. `QHBoxLayout` arranges them in a row.

3. **`QLineEdit` accepts user input.** `QLabel` displays text but cannot be edited. `QLineEdit` is a single-line text field. For multi-line text, use `QTextEdit`.
