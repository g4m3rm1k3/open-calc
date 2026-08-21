from PySide6.QtWidgets import QComboBox, QFormLayout, QLineEdit, QWidget


def build_asset_editor() -> QWidget:
    editor = QWidget()
    editor.setWindowTitle("Asset Editor")

    name_field = QLineEdit()
    serial_number_field = QLineEdit()
    category_field = QComboBox()
    category_field.addItems(["Laptop", "Monitor", "Keyboard", "Mouse", "Other"])

    form = QFormLayout(editor)
    form.addRow("Name:", name_field)
    form.addRow("Serial Number:", serial_number_field)
    form.addRow("Category:", category_field)

    return editor
