import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QTimer
from PySide6.QtWidgets import QApplication, QDialog, QPushButton, QVBoxLayout

app = QApplication([])


class ConfirmDialog(QDialog):
    def __init__(self) -> None:
        super().__init__()
        self.ok_button = QPushButton("OK")
        self.ok_button.clicked.connect(self.accept)
        layout = QVBoxLayout(self)
        layout.addWidget(self.ok_button)


dialog = ConfirmDialog()

print(dialog.result())

QTimer.singleShot(50, dialog.ok_button.click)
outcome = dialog.exec()

print(outcome)
print(outcome == QDialog.DialogCode.Accepted)
print(dialog.result())
