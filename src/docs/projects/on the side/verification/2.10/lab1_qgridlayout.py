import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication, QCheckBox, QLabel, QWidget, QGridLayout

app = QApplication([])

settings = QWidget()
grid = QGridLayout(settings)

grid.addWidget(QLabel("Theme:"), 0, 0)
grid.addWidget(QCheckBox("Dark mode"), 0, 1)
grid.addWidget(QLabel("Notifications:"), 1, 0)
grid.addWidget(QCheckBox("Enabled"), 1, 1)

print(grid.rowCount())
print(grid.columnCount())
print(grid.itemAtPosition(0, 0).widget().text())
print(grid.itemAtPosition(1, 1).widget().text())
