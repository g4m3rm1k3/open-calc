import gc
import os
import weakref

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication, QLabel, QMainWindow, QPushButton

app = QApplication([])

window = QMainWindow()
button = QPushButton("Open Editor", window)

editor_ref = None


def open_editor_unsafe():
    global editor_ref
    editor = QLabel("I am an editor")
    editor.show()
    editor_ref = weakref.ref(editor)
    print("inside slot, editor.isVisible():", editor.isVisible())


button.clicked.connect(open_editor_unsafe)
button.click()

gc.collect()

print("editor_ref() after gc.collect():", editor_ref())
