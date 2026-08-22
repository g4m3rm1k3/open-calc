from PySide6.QtCore import Qt
from PySide6.QtWidgets import QComboBox, QStyledItemDelegate


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
