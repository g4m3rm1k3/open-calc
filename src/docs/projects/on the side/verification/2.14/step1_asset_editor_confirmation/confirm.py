import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from asset_editor import AssetEditor
from PySide6.QtWidgets import QApplication

app = QApplication([])

editor = AssetEditor()
editor.name_field.setText("ThinkPad X1")
editor.serial_number_field.setText("SN-001")

received = []
editor.asset_submitted.connect(
    lambda name, serial, category: received.append((name, serial, category))
)

editor.save_button.click()

print(received)

form = editor.layout()
print(form.rowCount())
print(form.labelForField(editor.save_button))
