import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QTimer
from PySide6.QtWidgets import QApplication, QMessageBox

app = QApplication([])

from asset_manager.desktop.main import MainWindow

window = MainWindow()
window.show()

print(window.assets_table.model() is window.assets_model)
print(window.submitted_assets is window.assets_model._assets)
print(window.assets_model.rowCount())

signals_seen = []
window.assets_model.rowsInserted.connect(
    lambda parent, first, last: signals_seen.append((first, last))
)

window.button.click()
window.editor.name_field.setText("ThinkPad X1")
window.editor.serial_number_field.setText("SN-001")
window.editor.save_button.click()

print(window.assets_model.rowCount())
print(len(window.submitted_assets))
print(window.assets_model.index(0, 0).data())
print(window.assets_model.index(0, 1).data())
print(window.assets_model.index(0, 2).data())
print(signals_seen)

window.button.click()
window.editor.name_field.setText("   ")
window.editor.serial_number_field.setText("SN-002")


def dismiss_warning():
    box = app.activeModalWidget()
    box.button(QMessageBox.StandardButton.Ok).click()


QTimer.singleShot(50, dismiss_warning)
window.editor.save_button.click()

print(window.assets_model.rowCount())
print(signals_seen)
