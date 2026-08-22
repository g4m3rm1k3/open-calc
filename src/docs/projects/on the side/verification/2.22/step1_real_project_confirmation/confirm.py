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

print(bool(window.assets_model.flags(name_index) & Qt.ItemFlag.ItemIsEditable))

changes_seen = []
window.assets_model.dataChanged.connect(
    lambda top_left, bottom_right, roles: changes_seen.append(roles)
)

success = window.assets_model.setData(name_index, "ThinkPad X1 Carbon")
print(success)
print(window.assets_model.data(name_index, Qt.ItemDataRole.EditRole))
print(window.submitted_assets[0].name)
print(changes_seen)

failure = window.assets_model.setData(name_index, "   ")
print(failure)
print(window.assets_model.data(name_index, Qt.ItemDataRole.EditRole))
print(window.submitted_assets[0].name)

serial_success = window.assets_model.setData(serial_index, "SN-002")
print(serial_success)
print(window.submitted_assets[0].serial_number)
