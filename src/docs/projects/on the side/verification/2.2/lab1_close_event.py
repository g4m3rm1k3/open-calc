import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication, QMainWindow


class LoudWindow(QMainWindow):
    def closeEvent(self, event):
        print("closeEvent fired: the user closed the window")
        event.accept()


app = QApplication([])

window = LoudWindow()
window.setWindowTitle("Asset Manager")
window.show()

print("before window.close()")
window.close()
print("after window.close()")
