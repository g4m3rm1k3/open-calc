import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication

app = QApplication([])

from asset_manager.desktop.main import MainWindow


def add_asset(window, name, serial_number, category):
    window.button.click()
    window.editor.name_field.setText(name)
    window.editor.serial_number_field.setText(serial_number)
    window.editor.category_field.setCurrentText(category)
    window.editor.save_button.click()


window = MainWindow()
window.show()

add_asset(window, "ThinkPad X1", "SN-001", "Laptop")
add_asset(window, "Dell Monitor", "SN-002", "Monitor")
add_asset(window, "MacBook Pro", "SN-003", "Laptop")

print(window.proxy_model.rowCount())
print(len(window.submitted_assets))

window.category_box.setCurrentText("Laptop")
print(window.proxy_model.rowCount())
print([window.proxy_model.index(r, 0).data() for r in range(window.proxy_model.rowCount())])

window.search_box.setText("mac")
print(window.proxy_model.rowCount())
print(window.proxy_model.index(0, 0).data())

window.assets_table.selectRow(0)
source_index = window.proxy_model.mapToSource(window.proxy_model.index(0, 0))
print(source_index.row())
print(window.detail_name_label.text())

window.search_box.setText("")
window.category_box.setCurrentText("All Categories")
print(window.proxy_model.rowCount())
