import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QTimer
from PySide6.QtWidgets import QApplication

app = QApplication([])

from asset_manager.desktop.main import MainWindow

window = MainWindow()
window.show()

file_action = window.menuBar().actions()[0]
file_menu = file_action.menu()
new_action, edit_action, delete_action, separator, exit_action = file_menu.actions()

print(new_action.text())
print(edit_action.text(), edit_action.isEnabled())
print(delete_action.text(), delete_action.isEnabled())
print(exit_action.text())

print(window.editor)
new_action.trigger()
print(window.editor is not None)
print(window.editor.isVisible())

window.editor.cancel_button.click()

QTimer.singleShot(50, exit_action.trigger)
exit_code = app.exec()
print(exit_code)
