import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication

app = QApplication([])

from asset_manager.desktop.main import MainWindow

window = MainWindow()
window.show()

print(window.submitted_assets)
print(window.validation_errors)

window.button.click()
window.editor.name_field.setText("ThinkPad X1")
window.editor.serial_number_field.setText("SN-001")
window.editor.save_button.click()

print(window.submitted_assets)
print(window.validation_errors)

window.button.click()
window.editor.name_field.setText("   ")
window.editor.serial_number_field.setText("SN-002")
window.editor.save_button.click()

print(window.submitted_assets)
print(window.validation_errors)
print(window.validation_errors[0].field)

validator = window.editor.serial_number_field.validator()
print(validator.validate("SN-003", 6))
print(validator.validate("bad serial!", 11))
