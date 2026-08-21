import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from dataclasses import dataclass

from PySide6.QtCore import QAbstractTableModel, QModelIndex, Qt
from PySide6.QtWidgets import QApplication

app = QApplication([])


@dataclass
class Reading:
    celsius: float


class TemperatureModel(QAbstractTableModel):
    def __init__(self, readings, parent=None):
        super().__init__(parent)
        self._readings = readings

    def rowCount(self, parent=QModelIndex()):
        return len(self._readings)

    def columnCount(self, parent=QModelIndex()):
        return 1

    def data(self, index, role=Qt.ItemDataRole.DisplayRole):
        reading = self._readings[index.row()]
        if role == Qt.ItemDataRole.DisplayRole:
            return f"{reading.celsius:.1f} C"
        if role == Qt.ItemDataRole.EditRole:
            return reading.celsius
        return None


readings = [Reading(21.456)]
model = TemperatureModel(readings)

index = model.index(0, 0)
print(model.data(index, Qt.ItemDataRole.DisplayRole))
print(model.data(index))
print(model.data(index, Qt.ItemDataRole.EditRole))
print(model.data(index, Qt.ItemDataRole.ToolTipRole))
