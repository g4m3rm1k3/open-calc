import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication

app = QApplication([])

from main import MainWindow

window = MainWindow()
window.show()

print(window.submitted_assets)

window.button.click()
window.editor.name_field.setText("ThinkPad X1")
window.editor.serial_number_field.setText("SN-001")
window.editor.save_button.click()

print(window.submitted_assets)
