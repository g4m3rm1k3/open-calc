from PySide6.QtCore import QRegularExpression, Signal
from PySide6.QtGui import QRegularExpressionValidator
from PySide6.QtWidgets import QComboBox, QFormLayout, QLineEdit, QPushButton, QWidget


class AssetEditor(QWidget):
    asset_submitted = Signal(str, str, str)

    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("Asset Editor")

        self.name_field = QLineEdit()
        self.serial_number_field = QLineEdit()
        self.serial_number_field.setValidator(
            QRegularExpressionValidator(QRegularExpression("[A-Za-z0-9-]*"))
        )
        self.category_field = QComboBox()
        self.category_field.addItems(["Laptop", "Monitor", "Keyboard", "Mouse", "Other"])

        self.save_button = QPushButton("Save")
        self.save_button.clicked.connect(self.on_save_clicked)

        form = QFormLayout(self)
        form.addRow("Name:", self.name_field)
        form.addRow("Serial Number:", self.serial_number_field)
        form.addRow("Category:", self.category_field)
        form.addRow(self.save_button)

    def on_save_clicked(self) -> None:
        self.asset_submitted.emit(
            self.name_field.text(),
            self.serial_number_field.text(),
            self.category_field.currentText(),
        )
