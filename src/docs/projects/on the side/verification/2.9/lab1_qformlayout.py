import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication, QFormLayout, QLineEdit, QWidget

app = QApplication([])

editor = QWidget()
name_field = QLineEdit()
form = QFormLayout(editor)
form.addRow("Name:", name_field)

print(form.rowCount())
print(name_field.parent() is editor)

label = form.labelForField(name_field)
print(label.text())
