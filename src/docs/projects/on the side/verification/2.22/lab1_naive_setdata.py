import dataclasses
import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QAbstractTableModel, QModelIndex, Qt
from PySide6.QtWidgets import QApplication

app = QApplication([])


class InvalidReadingError(ValueError):
    pass


@dataclasses.dataclass
class Reading:
    label: str

    def __post_init__(self):
        if not self.label.strip():
            raise InvalidReadingError("label must not be empty")


class NaiveReadingTableModel(QAbstractTableModel):
    def __init__(self, readings, parent=None):
        super().__init__(parent)
        self._readings = readings

    def rowCount(self, parent=QModelIndex()):
        return len(self._readings)

    def columnCount(self, parent=QModelIndex()):
        return 1

    def data(self, index, role=Qt.ItemDataRole.DisplayRole):
        if role in (Qt.ItemDataRole.DisplayRole, Qt.ItemDataRole.EditRole):
            return self._readings[index.row()].label
        return None

    def flags(self, index):
        return super().flags(index) | Qt.ItemFlag.ItemIsEditable

    def setData(self, index, value, role=Qt.ItemDataRole.EditRole):
        if role != Qt.ItemDataRole.EditRole:
            return False
        self._readings[index.row()].label = value
        self.dataChanged.emit(index, index, [role])
        return True


readings = [Reading("first")]
model = NaiveReadingTableModel(readings)
index = model.index(0, 0)

print(model.setData(index, "   "))
print(repr(model.data(index)))
