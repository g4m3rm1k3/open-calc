import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QTimer
from PySide6.QtWidgets import QApplication, QMainWindow


class LoudWindow(QMainWindow):
    def closeEvent(self, event):
        print("callback: closeEvent fired")
        event.accept()


app = QApplication([])

window = LoudWindow()
window.setWindowTitle("Asset Manager")
window.show()

print("main(): about to start the event loop")
QTimer.singleShot(100, window.close)
exit_code = app.exec()
print(f"back in main(): event loop exited with code {exit_code}")
