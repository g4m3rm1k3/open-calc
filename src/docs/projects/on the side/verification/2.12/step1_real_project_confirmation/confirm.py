import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication

from main import MainWindow

app = QApplication([])

window = MainWindow()

print(repr(window.current_search_text))
window.search_box.setText("Think")
print(repr(window.current_search_text))
window.search_box.setText("ThinkPad")
print(repr(window.current_search_text))
