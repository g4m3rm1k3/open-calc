import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QAbstractTableModel, QModelIndex, Qt
from PySide6.QtWidgets import QApplication, QTableView

app = QApplication([])


class SimpleModel(QAbstractTableModel):
    def __init__(self, rows, parent=None):
        super().__init__(parent)
        self._rows = rows

    def rowCount(self, parent=QModelIndex()):
        return len(self._rows)

    def columnCount(self, parent=QModelIndex()):
        return 2

    def data(self, index, role=Qt.ItemDataRole.DisplayRole):
        if role == Qt.ItemDataRole.DisplayRole:
            return self._rows[index.row()][index.column()]
        return None


model = SimpleModel([("ThinkPad X1", "SN-001"), ("Dell Monitor", "SN-002")])
table = QTableView()
table.setModel(model)

print(table.selectionModel() is not None)

selection_model = table.selectionModel()

current_rows_seen = []
selection_model.currentRowChanged.connect(
    lambda current, previous: current_rows_seen.append(current.row())
)

print(selection_model.currentIndex().isValid())

table.selectRow(1)
print(current_rows_seen)
print(selection_model.currentIndex().row())

table.selectRow(0)
print(current_rows_seen)
