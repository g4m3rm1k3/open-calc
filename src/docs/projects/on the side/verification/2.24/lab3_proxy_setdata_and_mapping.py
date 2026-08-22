import dataclasses
import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QAbstractTableModel, QModelIndex, QSortFilterProxyModel, Qt
from PySide6.QtWidgets import QApplication, QTableView

app = QApplication([])


class InvalidThingError(ValueError):
    pass


@dataclasses.dataclass
class Thing:
    label: str

    def __post_init__(self):
        if not self.label.strip():
            raise InvalidThingError("label must not be empty")


class ThingsModel(QAbstractTableModel):
    def __init__(self, things, parent=None):
        super().__init__(parent)
        self._things = things

    def rowCount(self, parent=QModelIndex()):
        return len(self._things)

    def columnCount(self, parent=QModelIndex()):
        return 1

    def data(self, index, role=Qt.ItemDataRole.DisplayRole):
        if role in (Qt.ItemDataRole.DisplayRole, Qt.ItemDataRole.EditRole):
            return self._things[index.row()].label
        return None

    def flags(self, index):
        return super().flags(index) | Qt.ItemFlag.ItemIsEditable

    def setData(self, index, value, role=Qt.ItemDataRole.EditRole):
        if role != Qt.ItemDataRole.EditRole:
            return False
        try:
            new_thing = dataclasses.replace(self._things[index.row()], label=value)
        except InvalidThingError:
            return False
        self._things[index.row()] = new_thing
        self.dataChanged.emit(index, index, [role])
        return True


things = [Thing("Zebra"), Thing("Apple"), Thing("Mango")]
source = ThingsModel(things)

proxy = QSortFilterProxyModel()
proxy.setSourceModel(source)
proxy.sort(0, Qt.SortOrder.AscendingOrder)

table = QTableView()
table.setModel(proxy)

print([proxy.index(row, 0).data() for row in range(proxy.rowCount())])

proxy_index = proxy.index(0, 0)
print(proxy_index.data())

success = proxy.setData(proxy_index, "Avocado")
print(success)
print(proxy_index.data())
print(things)

source_index = proxy.mapToSource(proxy_index)
print(source_index.row())
print(things[source_index.row()].label)

failure = proxy.setData(proxy_index, "   ")
print(failure)
print(proxy_index.data())
