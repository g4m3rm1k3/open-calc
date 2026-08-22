import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import Qt
from PySide6.QtWidgets import QApplication, QStyleOptionViewItem

app = QApplication([])

from asset_manager.desktop.main import MainWindow

window = MainWindow()
window.show()

print(window.assets_table.itemDelegateForColumn(2) is window.category_delegate)

window.button.click()
window.editor.name_field.setText("ThinkPad X1")
window.editor.serial_number_field.setText("SN-001")
window.editor.category_field.setCurrentText("Laptop")
window.editor.save_button.click()

proxy_index = window.proxy_model.index(0, 2)
delegate = window.category_delegate

option = QStyleOptionViewItem()
editor = delegate.createEditor(window.assets_table, option, proxy_index)
print(type(editor))
print(editor.count())

delegate.setEditorData(editor, proxy_index)
print(editor.currentText())

editor.setCurrentText("Monitor")
delegate.setModelData(editor, window.proxy_model, proxy_index)

print(window.submitted_assets[0].category)
print(window.proxy_model.data(proxy_index))
