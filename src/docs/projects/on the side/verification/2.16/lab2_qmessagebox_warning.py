import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QTimer
from PySide6.QtWidgets import QApplication, QMessageBox

app = QApplication([])


def dismiss_active_message_box():
    box = app.activeModalWidget()
    print(type(box))
    print(box.text())
    box.button(QMessageBox.StandardButton.Ok).click()


QTimer.singleShot(50, dismiss_active_message_box)
result = QMessageBox.warning(None, "Invalid Asset", "Asset name must not be empty")

print(result)
print(result == QMessageBox.StandardButton.Ok)
