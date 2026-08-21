import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication, QLabel, QMainWindow

app = QApplication([])

window = QMainWindow()
label = QLabel("Asset Manager", window)

print(label.text())
print(label.parent() is window)
print(label in window.children())
print(label.isVisible())

window.show()
print(label.isVisible())
