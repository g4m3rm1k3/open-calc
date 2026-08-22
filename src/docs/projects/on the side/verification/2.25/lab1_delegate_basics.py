import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QAbstractTableModel, QModelIndex, Qt
from PySide6.QtWidgets import (
    QApplication,
    QComboBox,
    QStyledItemDelegate,
    QStyleOptionViewItem,
    QTableView,
)

app = QApplication([])


class CategoryModel(QAbstractTableModel):
    def __init__(self, rows, parent=None):
        super().__init__(parent)
        self._rows = rows

    def rowCount(self, parent=QModelIndex()):
        return len(self._rows)

    def columnCount(self, parent=QModelIndex()):
        return 1

    def data(self, index, role=Qt.ItemDataRole.DisplayRole):
        if role in (Qt.ItemDataRole.DisplayRole, Qt.ItemDataRole.EditRole):
            return self._rows[index.row()]
        return None

    def flags(self, index):
        return super().flags(index) | Qt.ItemFlag.ItemIsEditable

    def setData(self, index, value, role=Qt.ItemDataRole.EditRole):
        if role != Qt.ItemDataRole.EditRole:
            return False
        self._rows[index.row()] = value
        self.dataChanged.emit(index, index, [role])
        return True


class CategoryDelegate(QStyledItemDelegate):
    CATEGORIES = ["Laptop", "Monitor", "Keyboard", "Mouse", "Other"]

    def createEditor(self, parent, option, index):
        editor = QComboBox(parent)
        editor.addItems(self.CATEGORIES)
        return editor

    def setEditorData(self, editor, index):
        current_value = index.data(Qt.ItemDataRole.EditRole)
        editor.setCurrentText(current_value)

    def setModelData(self, editor, model, index):
        model.setData(index, editor.currentText(), Qt.ItemDataRole.EditRole)

    def updateEditorGeometry(self, editor, option, index):
        editor.setGeometry(option.rect)


model = CategoryModel(["Monitor"])
table = QTableView()
table.setModel(model)

delegate = CategoryDelegate()
table.setItemDelegateForColumn(0, delegate)

print(table.itemDelegateForColumn(0) is delegate)

index = model.index(0, 0)
option = QStyleOptionViewItem()

editor = delegate.createEditor(table, option, index)
print(type(editor))
print(editor.count())

delegate.setEditorData(editor, index)
print(editor.currentText())

editor.setCurrentText("Keyboard")
delegate.setModelData(editor, model, index)
print(model.data(index))
