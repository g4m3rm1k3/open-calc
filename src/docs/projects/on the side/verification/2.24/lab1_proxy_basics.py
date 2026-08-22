import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QAbstractTableModel, QModelIndex, QSortFilterProxyModel, Qt
from PySide6.QtWidgets import QApplication, QTableView

app = QApplication([])


class SimpleModel(QAbstractTableModel):
    def __init__(self, rows, parent=None):
        super().__init__(parent)
        self._rows = rows

    def rowCount(self, parent=QModelIndex()):
        return len(self._rows)

    def columnCount(self, parent=QModelIndex()):
        return 1

    def data(self, index, role=Qt.ItemDataRole.DisplayRole):
        if role == Qt.ItemDataRole.DisplayRole:
            return self._rows[index.row()]
        return None


source = SimpleModel(["Zebra", "Apple", "Mango"])

proxy = QSortFilterProxyModel()
proxy.setSourceModel(source)

table = QTableView()
table.setModel(proxy)

print(proxy.rowCount())
print(proxy.index(0, 0).data())

proxy.setFilterFixedString("an")
print(proxy.rowCount())
print(proxy.index(0, 0).data())

proxy.setFilterFixedString("")
proxy.sort(0, Qt.SortOrder.AscendingOrder)
print([proxy.index(row, 0).data() for row in range(proxy.rowCount())])

proxy_index = proxy.index(0, 0)
source_index = proxy.mapToSource(proxy_index)
print(source_index.row())
print(source.data(source_index))
