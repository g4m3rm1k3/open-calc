# Python Tool Database — LAB 38 — Forms: Adding a Tool with QDialog

**Prerequisites:** Lab 37. You have a working table with sort and filter. Clicking "Add Tool" shows a status bar message. This lesson makes it open a real dialog, validate the input, and save to the database.

**What this lab adds:**
- `QDialog` — a modal window for data entry
- `QFormLayout` — aligned label/field pairs
- `QComboBox`, `QDoubleSpinBox`, `QSpinBox`
- Accept/reject — the dialog lifecycle
- Inline validation: red error labels next to fields
- Wiring the dialog result back to the main window

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A dialog is "modal." What does that mean for the user?
> 2. `dialog.exec()` returns an integer. What are the two possible values and what does each mean?
> 3. You want the diameter field to only accept numbers between 0.001 and 24.0. Which widget is better: `QLineEdit` or `QDoubleSpinBox`? Why?
>
> *(Answers at the end)*

---

## Step 1 — The Add Tool Dialog

Create `tooldb_ui/add_tool_dialog.py`:

```python
from PySide6.QtWidgets import (
    QDialog, QFormLayout, QLineEdit, QDoubleSpinBox, QSpinBox,
    QComboBox, QLabel, QPushButton, QHBoxLayout, QVBoxLayout, QDialogButtonBox,
)
from PySide6.QtCore import Qt
from PySide6.QtGui import QColor

from tooldb.validation import validate_tool_data
from tooldb.validation import VALID_MATERIALS, VALID_TOOL_TYPES


class AddToolDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Add Tool")
        self.setMinimumWidth(400)
        self._build_ui()

    def _build_ui(self):
        root = QVBoxLayout(self)
        form = QFormLayout()
        root.addLayout(form)

        # Name
        self.name_input = QLineEdit()
        self.name_error = self._error_label()
        form.addRow("Name:", self.name_input)
        form.addRow("", self.name_error)

        # Diameter
        self.diameter_input = QDoubleSpinBox()
        self.diameter_input.setRange(0.001, 24.0)
        self.diameter_input.setDecimals(4)
        self.diameter_input.setSingleStep(0.0625)   # 1/16" increment
        self.diameter_input.setSuffix(" in")
        self.diameter_error = self._error_label()
        form.addRow("Diameter:", self.diameter_input)
        form.addRow("", self.diameter_error)

        # Material
        self.material_input = QComboBox()
        self.material_input.addItems(sorted(VALID_MATERIALS))
        self.material_error = self._error_label()
        form.addRow("Material:", self.material_input)
        form.addRow("", self.material_error)

        # Tool type
        self.type_input = QComboBox()
        self.type_input.addItems(sorted(VALID_TOOL_TYPES))
        self.type_error = self._error_label()
        form.addRow("Type:", self.type_input)
        form.addRow("", self.type_error)

        # Flutes (optional)
        self.flutes_input = QSpinBox()
        self.flutes_input.setRange(0, 16)
        self.flutes_input.setSpecialValueText("—")  # 0 displays as "—" meaning "none"
        form.addRow("Flutes:", self.flutes_input)

        # Dialog buttons
        buttons = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel)
        buttons.accepted.connect(self._on_accept)
        buttons.rejected.connect(self.reject)
        root.addWidget(buttons)

    def _error_label(self) -> QLabel:
        label = QLabel("")
        label.setStyleSheet("color: red; font-size: 11px;")
        label.hide()
        return label

    def _on_accept(self):
        data = self._collect_data()
        result = validate_tool_data(data)
        if result.is_valid:
            self.accept()
        else:
            self._show_errors(result.errors)

    def _collect_data(self) -> dict:
        flutes_val = self.flutes_input.value()
        return {
            "name": self.name_input.text().strip(),
            "diameter_inches": self.diameter_input.value(),
            "material": self.material_input.currentText(),
            "tool_type": self.type_input.currentText(),
            "flutes": flutes_val if flutes_val > 0 else None,
        }

    def _show_errors(self, errors: list[str]) -> None:
        # Clear all error labels first
        for lbl in (self.name_error, self.diameter_error, self.material_error, self.type_error):
            lbl.hide()
            lbl.setText("")

        for error in errors:
            if "name" in error:
                self.name_error.setText(error)
                self.name_error.show()
            elif "diameter" in error:
                self.diameter_error.setText(error)
                self.diameter_error.show()
            elif "material" in error:
                self.material_error.setText(error)
                self.material_error.show()
            elif "tool_type" in error:
                self.type_error.setText(error)
                self.type_error.show()

    def get_tool_data(self) -> dict:
        """Call after exec() returns Accepted to retrieve the validated data."""
        return self._collect_data()
```

---

## How QDialog Works

```
window.on_add_tool()
    ↓
dialog = AddToolDialog(parent=self)
result = dialog.exec()          ← blocks; user interacts with the dialog
    ↓ (when dialog closes)
if result == QDialog.Accepted:  ← user clicked OK and validation passed
    data = dialog.get_tool_data()
    service.create_tool(**data)
    self._refresh_tools()
```

`dialog.exec()` is a **blocking call** — it starts a nested event loop for the dialog. The caller pauses here until the dialog closes. The main window is disabled (modal). When the user dismisses the dialog, `exec()` returns `QDialog.Accepted` (clicked OK, validation passed) or `QDialog.Rejected` (clicked Cancel or closed).

This is different from regular Python code that blocks the GUI thread. `exec()` runs its own event loop, so the dialog remains interactive — the user can type, click, resize.

---

## Step 2 — Inline Validation: Why This Way

The `_show_errors` approach:
- Shows a red label immediately *below* each broken field
- The user sees all problems at once without any popup
- Fixing a field hides its error label on the next OK attempt

This is the "collect, don't stop" validation from Lesson 27, surfaced in the UI layer. The service layer's `validate_tool_data` did the actual checking; the dialog just maps the error strings to the right labels.

Notice `QDoubleSpinBox` for diameter. It:
- Enforces the numeric range (0.001–24.0) at the input level
- Shows a spinner the user can increment
- Returns a `float` directly — no string-to-float conversion, no `ValueError`

The validation in `_on_accept` will therefore never see a bad diameter from `QDoubleSpinBox`. That check in `validate_tool_data` acts as defense-in-depth for when the dialog is bypassed (e.g., called from a script). Both layers are right.

---

## Step 3 — Connect the Dialog to the Main Window

In `tooldb_ui/main.py`, update `_on_add_tool`:

```python
from tooldb_ui.add_tool_dialog import AddToolDialog
from PySide6.QtWidgets import QDialog

def _on_add_tool(self) -> None:
    dialog = AddToolDialog(parent=self)
    if dialog.exec() == QDialog.DialogCode.Accepted:
        data = dialog.get_tool_data()
        try:
            self.service.create_tool(
                name=data["name"],
                diameter_inches=data["diameter_inches"],
                material=data["material"],
                tool_type=data["tool_type"],
                flutes=data["flutes"],
            )
            self._refresh_tools()
            self.statusBar().showMessage(f"Added: {data['name']}", 3000)
        except ValueError as exc:
            # Duplicate name — show in status bar
            self.statusBar().showMessage(str(exc), 5000)
```

Run the app. Click "Add Tool". Fill in the form. Click OK. The tool appears in the table. Leave the name blank and click OK — a red error label appears under the Name field. The dialog does not close.

---

## Step 4 — SAVE AND TRY

**Test the validation:**
1. Leave the name blank → red "name: is required" label appears
2. Fill in the name, click OK → dialog closes, tool added
3. Try to add the same name again → "A tool named '...' already exists" in the status bar

**Test the spinner behavior:**
- The diameter spinner starts at 0.001 (minimum). Click the up arrow — it increments by 0.0625 (one sixteenth). This matches the standard fractional inch increments used in machining.
- The flutes spinner shows "—" at 0 (`setSpecialValueText`). This communicates "none specified" without confusing the user with a zero.

**Press Escape** while the dialog is open. It closes with `Rejected`. No tool is added. This is the default `QDialog` behavior — Escape triggers rejection.

---

## Challenge

Add a `QLineEdit` for optional notes. It is optional, so no validation needed. After the flutes row:

```python
self.notes_input = QLineEdit()
self.notes_input.setPlaceholderText("Optional notes...")
form.addRow("Notes:", self.notes_input)
```

Update `_collect_data` to include it:

```python
"notes": self.notes_input.text().strip() or None,
```

And update the `create_tool` call in the main window to pass notes through.

<details>
<summary>Answer</summary>

No tricks here — the code above is correct. `self.notes_input.text().strip() or None` converts an empty string to `None` so the database stores `NULL` rather than an empty string. The `create_tool` call becomes:

```python
self.service.create_tool(
    name=data["name"],
    diameter_inches=data["diameter_inches"],
    material=data["material"],
    tool_type=data["tool_type"],
    flutes=data["flutes"],
    notes=data.get("notes"),
)
```

</details>

---

## Final Check

| | |
|--|--|
| "Add Tool" opens a dialog | ✓ |
| Leaving name blank shows a red error label; dialog does not close | ✓ |
| Filling valid data and clicking OK adds the tool and refreshes the table | ✓ |
| Pressing Escape or Cancel does not add anything | ✓ |
| Duplicate name is caught by the service and shown in the status bar | ✓ |

---

## Quick Check Answers

1. **A modal dialog disables the parent window** — the user cannot interact with the main window until the dialog is closed. "Modal" means exclusive focus. `dialog.exec()` implements this by running a nested event loop that captures all input events for the dialog.

2. **`QDialog.Accepted` (value 1)** when the user confirmed (and your code called `self.accept()`), **`QDialog.Rejected` (value 0)** when the user cancelled or pressed Escape (called `self.reject()`). Check `if result == QDialog.DialogCode.Accepted:` to know whether to read the form data.

3. **`QDoubleSpinBox`** is better. It enforces the numeric range at the widget level, so the user physically cannot type letters or out-of-range numbers. `QLineEdit` accepts any text — you get strings back and must convert and validate them yourself. Use the right widget for the data type and your validation code shrinks.
