import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from asset_editor import AssetEditor
from PySide6.QtWidgets import QApplication

app = QApplication([])

editor = AssetEditor()

validator = editor.serial_number_field.validator()
print(validator is not None)
print(validator.validate("SN-001", 6))
print(validator.validate("SN 001!", 7))

print(editor.name_field.validator())
