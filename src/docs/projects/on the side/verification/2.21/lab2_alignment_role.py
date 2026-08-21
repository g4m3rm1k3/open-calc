import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QAbstractTableModel, QModelIndex, Qt
from PySide6.QtWidgets import QApplication

app = QApplication([])


class TwoColumnModel(QAbstractTableModel):
    def rowCount(self, parent=QModelIndex()):
        return 1

    def columnCount(self, parent=QModelIndex()):
        return 2

    def data(self, index, role=Qt.ItemDataRole.DisplayRole):
        if role == Qt.ItemDataRole.DisplayRole:
            return "SN-001" if index.column() == 1 else "ThinkPad X1"
        if role == Qt.ItemDataRole.TextAlignmentRole:
            if index.column() == 1:
                return Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter
            return None
        return None


model = TwoColumnModel()

name_index = model.index(0, 0)
serial_index = model.index(0, 1)

print(model.data(name_index, Qt.ItemDataRole.TextAlignmentRole))
print(model.data(serial_index, Qt.ItemDataRole.TextAlignmentRole))

alignment = model.data(serial_index, Qt.ItemDataRole.TextAlignmentRole)
print(bool(alignment & Qt.AlignmentFlag.AlignRight))
print(bool(alignment & Qt.AlignmentFlag.AlignVCenter))
print(bool(alignment & Qt.AlignmentFlag.AlignLeft))
