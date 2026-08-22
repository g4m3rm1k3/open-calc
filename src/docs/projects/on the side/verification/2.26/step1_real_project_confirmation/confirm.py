import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QTimer
from PySide6.QtWidgets import QApplication, QMessageBox

app = QApplication([])

from asset_manager.desktop.application_state import ApplicationState
from asset_manager.desktop.main import MainWindow

window = MainWindow()
window.show()

# Concept Unit 1: self.current_search_text no longer exists at all.
print(hasattr(window, "current_search_text"))

# Concept Unit 2: self.state is a real ApplicationState, and AssetTableModel
# still holds the exact same list object by reference, not a copy.
print(isinstance(window.state, ApplicationState))
print(window.state.assets is window.assets_model._assets)
print(window.state.assets)
print(window.state.validation_errors)

# A valid submission lands in window.state.assets, and selecting it in the
# table still updates the detail panel through window.state.assets.
window.button.click()
window.editor.name_field.setText("ThinkPad X1")
window.editor.serial_number_field.setText("SN-001")
window.editor.category_field.setCurrentText("Laptop")
window.editor.save_button.click()

print(len(window.state.assets))
print(window.state.assets[0].name)

window.assets_table.selectRow(0)
print(window.detail_name_label.text())

# An invalid submission appends to window.state.validation_errors, not any
# bare self.validation_errors (which no longer exists either).
print(hasattr(window, "validation_errors"))

def dismiss_warning():
    box = QApplication.activeModalWidget()
    box.button(QMessageBox.StandardButton.Ok).click()


window.button.click()
window.editor.name_field.setText("")
window.editor.serial_number_field.setText("SN-002")
window.editor.category_field.setCurrentText("Monitor")
QTimer.singleShot(0, dismiss_warning)
window.editor.save_button.click()

print(len(window.state.validation_errors))
print(len(window.state.assets))

# The search box still works, driven entirely through self.proxy_model,
# with no self.current_search_text involved anywhere.
window.search_box.setText("think")
print(window.proxy_model.rowCount())
