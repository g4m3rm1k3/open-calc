# Python Tool Database — LAB 41 — Polymorphic Forms

**Prerequisites:** Lab 40. You have `EndMill`, `Drill`, `FaceMill` Python objects and the database columns for their fields. The "Add Tool" dialog shows a fixed form. This lesson makes the form *react* — selecting a different tool type swaps in a different set of fields.

**What this lab adds:**
- `QStackedWidget` — multiple pages, one visible at a time
- Connecting a `QComboBox` to swap pages
- A separate form widget per tool type
- Assembling the final `Tool` object from whichever page is active
- Why this is better than hiding/showing individual fields

**Time:** 60–70 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have a form with 12 fields. Depending on the tool type, only 3–4 fields are relevant. You hide the irrelevant ones. What is the UX problem with hidden fields vs a separate page per type?
> 2. `QStackedWidget` holds 4 pages. Only page 2 is visible. What happens to pages 0, 1, and 3?
> 3. A user selects "Drill" in the combobox. Your slot runs. How do you know which page index corresponds to "Drill"?
>
> *(Answers at the end)*

---

## Why Not Just Hide Fields?

You could add all 12 fields to one form and call `.hide()` / `.show()` on them:

```python
if tool_type == "drill":
    self.corner_radius_input.hide()
    self.helix_angle_input.hide()
    self.point_angle_input.show()
```

Problems:
- The hidden fields still occupy space in the layout (invisible but present) unless you remove them from the layout too — then you are essentially doing `QStackedWidget` manually but worse
- A hidden field can still contain a value from a previous tool type — silent data contamination
- The form grows proportionally with tool types: 6 types × 4 fields = 24 widgets all in one form, most invisible at any time

`QStackedWidget` is cleaner: each page is an isolated widget. Switching pages guarantees the hidden pages contribute no values and occupy no space.

---

## The Plan

```
AddToolDialog
├── QComboBox (type selector)
└── QStackedWidget
    ├── page 0: EndMillPage (corner_radius, helix_angle, flute_length, flutes)
    ├── page 1: DrillPage (point_angle, drill_length)
    ├── page 2: FaceMillPage (insert_size, num_inserts, lead_angle)
    └── page 3: TurnToolPage (insert_shape, nose_radius, relief_angle)
```

The combobox and the stack are linked: index 0 in the combobox = page 0 in the stack. Selecting index 2 switches to page 2.

---

## Step 1 — Page Widgets

Create `tooldb_ui/tool_type_pages.py`:

```python
from PySide6.QtWidgets import (
    QWidget, QFormLayout, QDoubleSpinBox, QSpinBox, QLineEdit, QLabel,
)


class EndMillPage(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        form = QFormLayout(self)

        self.flutes = QSpinBox()
        self.flutes.setRange(1, 16)
        self.flutes.setValue(4)
        form.addRow("Flutes:", self.flutes)

        self.corner_radius = QDoubleSpinBox()
        self.corner_radius.setRange(0.0, 1.0)
        self.corner_radius.setDecimals(4)
        self.corner_radius.setSuffix(" in")
        form.addRow("Corner Radius:", self.corner_radius)

        self.helix_angle = QDoubleSpinBox()
        self.helix_angle.setRange(0.0, 60.0)
        self.helix_angle.setValue(30.0)
        self.helix_angle.setSuffix("°")
        form.addRow("Helix Angle:", self.helix_angle)

        self.flute_length = QDoubleSpinBox()
        self.flute_length.setRange(0.0, 12.0)
        self.flute_length.setDecimals(4)
        self.flute_length.setSuffix(" in")
        self.flute_length.setSpecialValueText("—")
        form.addRow("Flute Length:", self.flute_length)

    def get_fields(self) -> dict:
        return {
            "flutes": self.flutes.value(),
            "corner_radius": self.corner_radius.value(),
            "helix_angle": self.helix_angle.value(),
            "flute_length": self.flute_length.value() or None,
        }


class DrillPage(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        form = QFormLayout(self)

        self.point_angle = QDoubleSpinBox()
        self.point_angle.setRange(60.0, 180.0)
        self.point_angle.setValue(118.0)
        self.point_angle.setSuffix("°")
        form.addRow("Point Angle:", self.point_angle)

        self.drill_length = QDoubleSpinBox()
        self.drill_length.setRange(0.0, 24.0)
        self.drill_length.setDecimals(4)
        self.drill_length.setSuffix(" in")
        self.drill_length.setSpecialValueText("—")
        form.addRow("Drill Length:", self.drill_length)

    def get_fields(self) -> dict:
        return {
            "point_angle": self.point_angle.value(),
            "drill_length": self.drill_length.value() or None,
        }


class FaceMillPage(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        form = QFormLayout(self)

        self.insert_size = QLineEdit()
        self.insert_size.setPlaceholderText("e.g. APKT 1003")
        form.addRow("Insert Size:", self.insert_size)

        self.num_inserts = QSpinBox()
        self.num_inserts.setRange(1, 20)
        self.num_inserts.setSpecialValueText("—")
        form.addRow("# Inserts:", self.num_inserts)

        self.lead_angle = QDoubleSpinBox()
        self.lead_angle.setRange(0.0, 90.0)
        self.lead_angle.setValue(45.0)
        self.lead_angle.setSuffix("°")
        form.addRow("Lead Angle:", self.lead_angle)

    def get_fields(self) -> dict:
        return {
            "insert_size": self.insert_size.text().strip() or None,
            "num_inserts": self.num_inserts.value() if self.num_inserts.value() > 0 else None,
            "lead_angle": self.lead_angle.value(),
        }


class TurnToolPage(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        form = QFormLayout(self)

        self.insert_shape = QLineEdit()
        self.insert_shape.setPlaceholderText("e.g. CNMG 432")
        form.addRow("Insert Shape:", self.insert_shape)

        self.nose_radius = QDoubleSpinBox()
        self.nose_radius.setRange(0.0, 0.125)
        self.nose_radius.setDecimals(4)
        self.nose_radius.setSuffix(" in")
        form.addRow("Nose Radius:", self.nose_radius)

        self.relief_angle = QDoubleSpinBox()
        self.relief_angle.setRange(0.0, 30.0)
        self.relief_angle.setSuffix("°")
        form.addRow("Relief Angle:", self.relief_angle)

    def get_fields(self) -> dict:
        return {
            "insert_shape": self.insert_shape.text().strip() or None,
            "nose_radius": self.nose_radius.value() or None,
            "relief_angle": self.relief_angle.value() or None,
        }
```

Each page widget is completely self-contained. It owns its fields and knows how to export them as a dict. The dialog never reaches inside a page — it just calls `page.get_fields()`.

---

## Step 2 — Rebuild AddToolDialog with a Stack

Replace `tooldb_ui/add_tool_dialog.py`:

```python
from PySide6.QtWidgets import (
    QDialog, QFormLayout, QLineEdit, QDoubleSpinBox, QComboBox,
    QLabel, QPushButton, QVBoxLayout, QDialogButtonBox, QStackedWidget,
    QGroupBox,
)
from tooldb.validation import validate_tool_data, VALID_MATERIALS
from tooldb.models.tool_types import EndMill, Drill, FaceMill, TurnTool, Tool
from tooldb_ui.tool_type_pages import EndMillPage, DrillPage, FaceMillPage, TurnToolPage

_TOOL_TYPES = ["endmill", "drill", "facemill", "turntool"]
_PAGES = [EndMillPage, DrillPage, FaceMillPage, TurnToolPage]
_CLASSES = [EndMill, Drill, FaceMill, TurnTool]


class AddToolDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Add Tool")
        self.setMinimumWidth(450)
        self._build_ui()

    def _build_ui(self):
        root = QVBoxLayout(self)

        # Common fields
        common_form = QFormLayout()
        root.addLayout(common_form)

        self.name_input = QLineEdit()
        self.name_error = self._error_label()
        common_form.addRow("Name:", self.name_input)
        common_form.addRow("", self.name_error)

        self.diameter_input = QDoubleSpinBox()
        self.diameter_input.setRange(0.001, 24.0)
        self.diameter_input.setDecimals(4)
        self.diameter_input.setSingleStep(0.0625)
        self.diameter_input.setSuffix(" in")
        self.diameter_error = self._error_label()
        common_form.addRow("Diameter:", self.diameter_input)
        common_form.addRow("", self.diameter_error)

        self.material_input = QComboBox()
        self.material_input.addItems(sorted(VALID_MATERIALS))
        common_form.addRow("Material:", self.material_input)

        self.type_selector = QComboBox()
        self.type_selector.addItems(_TOOL_TYPES)
        self.type_selector.currentIndexChanged.connect(self._on_type_changed)
        common_form.addRow("Tool Type:", self.type_selector)

        # Type-specific fields in a group box with a stack
        group = QGroupBox("Type-Specific Fields")
        group_layout = QVBoxLayout(group)
        self.stack = QStackedWidget()
        self._pages = [cls() for cls in _PAGES]
        for page in self._pages:
            self.stack.addWidget(page)
        group_layout.addWidget(self.stack)
        root.addWidget(group)

        # Buttons
        buttons = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel
        )
        buttons.accepted.connect(self._on_accept)
        buttons.rejected.connect(self.reject)
        root.addWidget(buttons)

    def _error_label(self) -> QLabel:
        label = QLabel("")
        label.setStyleSheet("color: red; font-size: 11px;")
        label.hide()
        return label

    def _on_type_changed(self, index: int) -> None:
        self.stack.setCurrentIndex(index)

    def _on_accept(self):
        name = self.name_input.text().strip()
        diameter = self.diameter_input.value()
        result = validate_tool_data({
            "name": name,
            "diameter_inches": diameter,
            "material": self.material_input.currentText(),
            "tool_type": _TOOL_TYPES[self.type_selector.currentIndex()],
        })
        if result.is_valid:
            self.accept()
        else:
            for e in result.errors:
                if "name" in e:
                    self.name_error.setText(e); self.name_error.show()
                elif "diameter" in e:
                    self.diameter_error.setText(e); self.diameter_error.show()

    def get_tool(self) -> Tool:
        """Call after exec() returns Accepted. Returns the correct Tool subclass."""
        idx = self.type_selector.currentIndex()
        cls = _CLASSES[idx]
        page = self._pages[idx]
        return cls(
            name=self.name_input.text().strip(),
            diameter_inches=self.diameter_input.value(),
            material=self.material_input.currentText(),
            **page.get_fields(),
        )
```

The key method is `get_tool()`. It returns an `EndMill`, `Drill`, `FaceMill`, or `TurnTool` object — not a dict. The caller passes this directly to `TypedToolRepository.insert()`.

---

## Step 3 — Wire it to the Main Window

Update `_on_add_tool` in `main.py`:

```python
from tooldb.repositories.typed_tool_repository import TypedToolRepository

# In __init__, after make_service():
self.typed_repo = TypedToolRepository(sqlite3.connect(str(DB_PATH)))

def _on_add_tool(self) -> None:
    dialog = AddToolDialog(parent=self)
    if dialog.exec() == QDialog.DialogCode.Accepted:
        tool = dialog.get_tool()
        try:
            self.typed_repo.insert(tool)
            self._refresh_tools()
            self.statusBar().showMessage(f"Added: {tool.name} ({tool.type_name()})", 3000)
        except Exception as exc:
            self.statusBar().showMessage(str(exc), 5000)
```

Run the app. Click "Add Tool." Change the type combobox — the bottom section of the dialog swaps between four different sets of fields. The common fields (name, diameter, material) stay the same.

---

## Step 4 — SAVE AND TRY

**Select "endmill."** Fill in corner radius and helix angle. Click OK. The endmill appears in the table.

**Select "drill."** Notice the stack shows point angle and drill length — no corner radius, no helix angle. Completely different fields in the same dialog position.

**Switch types mid-fill.** Type a name. Set diameter. Switch from "endmill" to "drill." The name and diameter stay (they're in common fields). The endmill-specific values are preserved on the endmill page — if you switch back, they are still there.

That last behavior is a property of `QStackedWidget`: hidden pages are not destroyed, just invisible. Their widgets retain their values. This is usually what you want — it lets the user compare "what would this look like as an endmill vs a drill" without losing their work.

---

## Challenge

Add a visual indicator in the group box title that shows the current page's name:

```python
def _on_type_changed(self, index: int) -> None:
    self.stack.setCurrentIndex(index)
    self.group.setTitle(f"Type-Specific Fields: {_TOOL_TYPES[index].title()}")
```

This requires storing the `QGroupBox` as `self.group`. Make that change and verify the title updates when you switch types.

<details>
<summary>Answer</summary>

In `_build_ui`, change:
```python
group = QGroupBox("Type-Specific Fields")
```
to:
```python
self.group = QGroupBox("Type-Specific Fields")
```

And use `self.group` everywhere instead of `group`. Then the `_on_type_changed` slot can access it via `self.group.setTitle(...)`.

</details>

---

## Final Check

| | |
|--|--|
| Switching the combobox immediately swaps the visible page | ✓ |
| An endmill page value is preserved when you switch away and back | ✓ |
| `get_tool()` returns an `EndMill` when endmill is selected, `Drill` when drill is selected | ✓ |
| The common fields (name, diameter, material) are shared across all tool types | ✓ |
| The dialog does not need `isinstance` anywhere | ✓ |

---

## Quick Check Answers

1. **Hidden fields leave gaps** — a form with 12 fields where 8 are invisible still has the layout space for those 8 (layout items aren't destroyed when widgets hide). More importantly, a hidden field still holds a value from a previous selection. When you read the form data, you must remember to ignore hidden fields — a manual bookkeeping task that `QStackedWidget` eliminates by design. Separate pages share nothing; reading `page.get_fields()` only returns that page's fields.

2. **Pages 0, 1, and 3 exist in memory but are invisible and receive no events.** Their widgets retain their current values. `QStackedWidget` does not destroy hidden pages — it just sets them invisible. This is why switching types preserves previously entered values.

3. **By convention: combobox index == stack page index.** You maintain this mapping in `_TOOL_TYPES` and `_PAGES` lists — both ordered the same way. When the combobox emits `currentIndexChanged(2)`, you call `self.stack.setCurrentIndex(2)`. The lists ensure index 2 means "facemill" in both the selector and the stack. If you need to change the order, update both lists together. Constants like `ENDMILL_IDX = 0` make this more robust in larger dialogs.
