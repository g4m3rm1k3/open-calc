import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication, QMainWindow

app = QApplication([])

window = QMainWindow()
window.setWindowTitle("Asset Manager")
window.show()

print(window.windowTitle())
print(window.isVisible())
print("reached the end of the script without calling app.exec()")
