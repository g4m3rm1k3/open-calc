import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication, QLabel, QMainWindow, QVBoxLayout, QWidget

app = QApplication([])

window = QMainWindow()
label = QLabel("Asset Manager", window)

print("before layout, label.parent() is window:", label.parent() is window)

central = QWidget(window)
layout = QVBoxLayout(central)
layout.addWidget(label)
window.setCentralWidget(central)

print("after layout, label.parent() is window:", label.parent() is window)
print("after layout, label.parent() is central:", label.parent() is central)
print("central.parent() is window:", central.parent() is window)
print("window.centralWidget() is central:", window.centralWidget() is central)
