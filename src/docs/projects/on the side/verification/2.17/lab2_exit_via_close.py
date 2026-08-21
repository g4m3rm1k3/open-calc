import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QTimer
from PySide6.QtWidgets import QApplication, QMainWindow


class TrackedWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.close_events = 0

    def closeEvent(self, event) -> None:
        self.close_events += 1
        super().closeEvent(event)


app = QApplication([])
window = TrackedWindow()
window.show()

print(window.close_events)

QTimer.singleShot(50, window.close)
exit_code = app.exec()

print(window.close_events)
print(exit_code)
