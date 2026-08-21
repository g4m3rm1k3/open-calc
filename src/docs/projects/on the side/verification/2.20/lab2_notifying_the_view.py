import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from dataclasses import dataclass

from PySide6.QtCore import QAbstractTableModel, QModelIndex, Qt
from PySide6.QtWidgets import QApplication

app = QApplication([])


@dataclass
class FakeAsset:
    name: str
    serial_number: str
    category: str


class AssetTableModel(QAbstractTableModel):
    def __init__(self, assets, parent=None):
        super().__init__(parent)
        self._assets = assets

    def rowCount(self, parent=QModelIndex()):
        return len(self._assets)

    def columnCount(self, parent=QModelIndex()):
        return 3

    def data(self, index, role=Qt.ItemDataRole.DisplayRole):
        return None

    def add_asset(self, asset):
        row = len(self._assets)
        self.beginInsertRows(QModelIndex(), row, row)
        self._assets.append(asset)
        self.endInsertRows()


assets = []
model = AssetTableModel(assets)

signals_seen = []
model.rowsInserted.connect(lambda parent, first, last: signals_seen.append((first, last)))

model.add_asset(FakeAsset("ThinkPad X1", "SN-001", "Laptop"))

print(model.rowCount())
print(len(assets))
print(signals_seen)
