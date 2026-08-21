import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication, QLabel, QWidget, QGridLayout

app = QApplication([])

settings = QWidget()
grid = QGridLayout(settings)

first = QLabel("First")
second = QLabel("Second")

grid.addWidget(first, 0, 0)
grid.addWidget(second, 0, 0)

print(grid.count())
print(grid.itemAtPosition(0, 0).widget().text())
