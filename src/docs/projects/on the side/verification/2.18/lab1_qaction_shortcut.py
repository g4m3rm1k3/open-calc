import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtGui import QAction, QKeySequence
from PySide6.QtWidgets import QApplication, QMainWindow

app = QApplication([])
window = QMainWindow()

new_action = QAction("&New", window)
new_action.setShortcut(QKeySequence("Ctrl+N"))

print(new_action.shortcut().toString())
print(new_action.shortcut() == QKeySequence("Ctrl+N"))

new_standard = QAction("&New (standard)", window)
new_standard.setShortcut(QKeySequence(QKeySequence.StandardKey.New))
print(new_standard.shortcut().toString())

quit_action = QAction("E&xit", window)
quit_action.setShortcut(QKeySequence(QKeySequence.StandardKey.Quit))
print(quit_action.shortcut().toString())
print(quit_action.shortcut().isEmpty())
