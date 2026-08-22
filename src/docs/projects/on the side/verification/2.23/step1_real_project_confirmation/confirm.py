import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication

app = QApplication([])

from asset_manager.desktop.main import MainWindow

window = MainWindow()
window.show()

print(window.detail_name_label.text())

window.button.click()
window.editor.name_field.setText("ThinkPad X1")
window.editor.serial_number_field.setText("SN-001")
window.editor.save_button.click()

window.button.click()
window.editor.name_field.setText("Dell Monitor")
window.editor.serial_number_field.setText("SN-002")
window.editor.category_field.setCurrentText("Monitor")
window.editor.save_button.click()

print(len(window.submitted_assets))

window.assets_table.selectRow(0)
print(window.detail_name_label.text())
print(window.detail_serial_label.text())
print(window.detail_category_label.text())
print(window.detail_owner_label.text())
print(window.detail_status_label.text())

window.assets_table.selectRow(1)
print(window.detail_name_label.text())
print(window.detail_category_label.text())

window.submitted_assets[1].mark_retired()
window.assets_table.selectRow(0)
window.assets_table.selectRow(1)
print(window.detail_status_label.text())
