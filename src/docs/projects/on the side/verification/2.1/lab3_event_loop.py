import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QTimer
from PySide6.QtWidgets import QApplication, QMainWindow

app = QApplication([])

window = QMainWindow()
window.setWindowTitle("Asset Manager")
window.show()

print(type(app))
print(type(window))
print(window.windowTitle())
print(window.isVisible())

QTimer.singleShot(100, app.quit)
exit_code = app.exec()
print(f"event loop exited with code {exit_code}")
