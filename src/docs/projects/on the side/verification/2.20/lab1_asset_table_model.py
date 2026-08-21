import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from dataclasses import dataclass

from PySide6.QtCore import QAbstractTableModel, QModelIndex, Qt
from PySide6.QtWidgets import QApplication, QTableView

app = QApplication([])


@dataclass
class FakeAsset:
    name: str
    serial_number: str
    category: str


class AssetTableModel(QAbstractTableModel):
    COLUMN_HEADERS = ["Name", "Serial Number", "Category"]

    def __init__(self, assets, parent=None):
        super().__init__(parent)
        self._assets = assets

    def rowCount(self, parent=QModelIndex()):
        return len(self._assets)

    def columnCount(self, parent=QModelIndex()):
        return len(self.COLUMN_HEADERS)

    def data(self, index, role=Qt.ItemDataRole.DisplayRole):
        if role != Qt.ItemDataRole.DisplayRole:
            return None
        asset = self._assets[index.row()]
        column = index.column()
        if column == 0:
            return asset.name
        if column == 1:
            return asset.serial_number
        if column == 2:
            return asset.category
        return None

    def headerData(self, section, orientation, role=Qt.ItemDataRole.DisplayRole):
        if role != Qt.ItemDataRole.DisplayRole:
            return None
        if orientation == Qt.Orientation.Horizontal:
            return self.COLUMN_HEADERS[section]
        return None


assets = [FakeAsset("ThinkPad X1", "SN-001", "Laptop")]
model = AssetTableModel(assets)
table = QTableView()
table.setModel(model)

print(model.rowCount())
print(model.columnCount())
print(model.headerData(1, Qt.Orientation.Horizontal))
print(model.index(0, 0).data())
print(model.index(0, 1).data())
print(model.index(0, 2).data())

assets.append(FakeAsset("Dell Monitor", "SN-002", "Monitor"))
print(model.rowCount())
print(model.index(1, 0).data())
