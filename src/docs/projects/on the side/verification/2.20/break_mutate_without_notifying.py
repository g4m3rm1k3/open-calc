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


class SilentTableModel(QAbstractTableModel):
    def __init__(self, assets, parent=None):
        super().__init__(parent)
        self._assets = assets

    def rowCount(self, parent=QModelIndex()):
        return len(self._assets)

    def columnCount(self, parent=QModelIndex()):
        return 3

    def data(self, index, role=Qt.ItemDataRole.DisplayRole):
        return None


assets = []
model = SilentTableModel(assets)

signals_seen = []
model.rowsInserted.connect(lambda parent, first, last: signals_seen.append((first, last)))

assets.append(FakeAsset("ThinkPad X1", "SN-001", "Laptop"))

print(model.rowCount())
print(signals_seen)
