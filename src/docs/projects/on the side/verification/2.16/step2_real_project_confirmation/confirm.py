import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QTimer
from PySide6.QtWidgets import QApplication, QMessageBox

app = QApplication([])

from asset_manager.desktop.main import MainWindow

window = MainWindow()
window.show()

window.button.click()
window.editor.name_field.setText("ThinkPad X1")
window.editor.serial_number_field.setText("SN-001")

print(window.editor.isVisible())
window.editor.save_button.click()

print(window.submitted_assets)
print(window.validation_errors)
print(window.editor.isVisible())

window.button.click()
window.editor.name_field.setText("   ")
window.editor.serial_number_field.setText("SN-002")


def dismiss_warning():
    box = app.activeModalWidget()
    print(type(box))
    print(box.text())
    box.button(QMessageBox.StandardButton.Ok).click()


QTimer.singleShot(50, dismiss_warning)
print(window.editor.isVisible())
window.editor.save_button.click()

print(window.submitted_assets)
print(window.validation_errors)
print(window.editor.isVisible())

window.editor.cancel_button.click()
print(window.editor.isVisible())
