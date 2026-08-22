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


class ReadingTableModel(QAbstractTableModel):
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
        try:
            new_reading = dataclasses.replace(self._readings[index.row()], label=value)
        except InvalidReadingError:
            return False
        self._readings[index.row()] = new_reading
        self.dataChanged.emit(index, index, [role])
        return True


readings = [Reading("first")]
model = ReadingTableModel(readings)
index = model.index(0, 0)

print(bool(model.flags(index) & Qt.ItemFlag.ItemIsEditable))

changes_seen = []
model.dataChanged.connect(lambda top_left, bottom_right, roles: changes_seen.append(roles))

success = model.setData(index, "second")
print(success)
print(model.data(index))
print(readings[0] is model._readings[0])
print(changes_seen)

failure = model.setData(index, "   ")
print(failure)
print(model.data(index))
