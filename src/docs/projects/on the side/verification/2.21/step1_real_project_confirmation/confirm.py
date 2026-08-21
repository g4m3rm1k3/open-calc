import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import Qt
from PySide6.QtWidgets import QApplication

app = QApplication([])

from asset_manager.desktop.main import MainWindow

window = MainWindow()
window.show()

window.button.click()
window.editor.name_field.setText("ThinkPad X1")
window.editor.serial_number_field.setText("SN-001")
window.editor.save_button.click()

name_index = window.assets_model.index(0, 0)
serial_index = window.assets_model.index(0, 1)

print(window.assets_model.data(name_index, Qt.ItemDataRole.DisplayRole))
print(window.assets_model.data(name_index, Qt.ItemDataRole.EditRole))
print(window.assets_model.data(serial_index, Qt.ItemDataRole.TextAlignmentRole))
print(window.assets_model.data(name_index, Qt.ItemDataRole.TextAlignmentRole))

window.submitted_assets[0].mark_retired()

print(window.assets_model.data(name_index, Qt.ItemDataRole.DisplayRole))
print(window.assets_model.data(name_index, Qt.ItemDataRole.EditRole))
