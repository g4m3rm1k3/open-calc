import gc
import os
import weakref

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication, QLabel, QMainWindow, QPushButton


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.button = QPushButton("Open Editor", self)
        self.button.clicked.connect(self.open_editor_safe)
        self.editor = None

    def open_editor_safe(self):
        self.editor = QLabel("I am an editor")
        self.editor.show()


app = QApplication([])

window = MainWindow()
window.button.click()

editor_ref = weakref.ref(window.editor)
gc.collect()

print("editor_ref() after gc.collect():", editor_ref() is not None)
print("window.editor.isVisible():", window.editor.isVisible())
