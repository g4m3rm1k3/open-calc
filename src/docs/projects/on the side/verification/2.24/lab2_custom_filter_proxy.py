import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QAbstractTableModel, QModelIndex, QSortFilterProxyModel, Qt
from PySide6.QtWidgets import QApplication, QTableView

app = QApplication([])


class AssetsModel(QAbstractTableModel):
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


class AssetFilterProxyModel(QSortFilterProxyModel):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._search_text = ""
        self._category_filter = "All Categories"

    def set_search_text(self, text):
        self._search_text = text
        self.invalidate()

    def set_category_filter(self, category):
        self._category_filter = category
        self.invalidate()

    def filterAcceptsRow(self, source_row, source_parent):
        model = self.sourceModel()
        name = model.index(source_row, 0, source_parent).data(Qt.ItemDataRole.DisplayRole) or ""
        category = model.index(source_row, 1, source_parent).data(Qt.ItemDataRole.DisplayRole) or ""

        if self._category_filter != "All Categories" and category != self._category_filter:
            return False

        if self._search_text and self._search_text.lower() not in name.lower():
            return False

        return True


source = AssetsModel(
    [
        ("ThinkPad X1", "Laptop"),
        ("Dell Monitor", "Monitor"),
        ("MacBook Pro", "Laptop"),
    ]
)

proxy = AssetFilterProxyModel()
proxy.setSourceModel(source)

table = QTableView()
table.setModel(proxy)

print(proxy.rowCount())

proxy.set_category_filter("Laptop")
print(proxy.rowCount())
print([proxy.index(row, 0).data() for row in range(proxy.rowCount())])

proxy.set_search_text("mac")
print(proxy.rowCount())
print(proxy.index(0, 0).data())

proxy.set_category_filter("All Categories")
proxy.set_search_text("")
print(proxy.rowCount())
