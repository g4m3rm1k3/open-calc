import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication

from main import MainWindow

app = QApplication([])

window = MainWindow()
window.show()

print(window.editor)
window.button.click()
print(window.editor.windowTitle())
print(window.editor.isVisible())
