import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import Qt
from PySide6.QtGui import QKeySequence
from PySide6.QtTest import QTest
from PySide6.QtWidgets import QApplication

app = QApplication([])

from asset_manager.desktop.main import MainWindow

window = MainWindow()
window.show()
app.setActiveWindow(window)

file_action = window.menuBar().actions()[0]
file_menu = file_action.menu()
new_action, edit_action, delete_action, separator, exit_action = file_menu.actions()

print(new_action.shortcut().toString())
print(exit_action.shortcut().toString())
print(edit_action.shortcut().isEmpty())
print(delete_action.shortcut().isEmpty())

print(window.editor)
QTest.keyClick(window, Qt.Key.Key_N, Qt.KeyboardModifier.ControlModifier)
print(window.editor is not None)

window.editor.cancel_button.click()

QTest.keyClick(window, Qt.Key.Key_Q, Qt.KeyboardModifier.ControlModifier)
print(window.isVisible())
