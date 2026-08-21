import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import Qt
from PySide6.QtGui import QStandardItem, QStandardItemModel
from PySide6.QtWidgets import QApplication, QTableView

app = QApplication([])

model = QStandardItemModel(0, 3)
model.setHorizontalHeaderLabels(["Name", "Serial Number", "Category"])

print(model.rowCount())
print(model.columnCount())
print(model.headerData(0, Qt.Orientation.Horizontal))

table = QTableView()
table.setModel(model)

print(table.model() is model)

model.appendRow(
    [QStandardItem("ThinkPad X1"), QStandardItem("SN-001"), QStandardItem("Laptop")]
)

print(model.rowCount())
print(model.index(0, 0).data())
print(model.index(0, 1).data())
print(model.index(0, 2).data())
