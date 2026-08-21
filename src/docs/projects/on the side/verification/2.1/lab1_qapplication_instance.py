import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication

print(QApplication.instance())

app = QApplication([])

print(QApplication.instance())
print(QApplication.instance() is app)
