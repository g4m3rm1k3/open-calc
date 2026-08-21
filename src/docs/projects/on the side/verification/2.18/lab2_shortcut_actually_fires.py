import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import Qt
from PySide6.QtGui import QAction, QKeySequence
from PySide6.QtTest import QTest
from PySide6.QtWidgets import QApplication, QMainWindow

app = QApplication([])
window = QMainWindow()

triggers = []


def on_new():
    triggers.append("new")


new_action = QAction("&New", window)
new_action.setShortcut(QKeySequence("Ctrl+N"))
new_action.triggered.connect(on_new)
window.addAction(new_action)

window.show()
app.setActiveWindow(window)

print(triggers)
QTest.keyClick(window, Qt.Key.Key_N, Qt.KeyboardModifier.ControlModifier)
print(triggers)
