import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from asset_editor import AssetEditor
from PySide6.QtWidgets import QApplication, QDialog

app = QApplication([])

editor = AssetEditor()
editor.show()

print(isinstance(editor, QDialog))
print(editor.isVisible())
print(editor.result())

editor.cancel_button.click()

print(editor.isVisible())
print(editor.result())
print(editor.result() == QDialog.DialogCode.Rejected)
