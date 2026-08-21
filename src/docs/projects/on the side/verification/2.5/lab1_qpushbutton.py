import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication, QLabel, QMainWindow, QPushButton

app = QApplication([])

window = QMainWindow()
button = QPushButton("Add Asset", window)
label = QLabel("Asset Manager", window)

print(button.text())
print(button.parent() is window)
print(hasattr(button, "clicked"))
print(hasattr(label, "clicked"))
