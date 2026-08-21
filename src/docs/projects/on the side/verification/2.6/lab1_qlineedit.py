import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication, QLineEdit, QMainWindow

app = QApplication([])

window = QMainWindow()
search_box = QLineEdit(window)
search_box.setPlaceholderText("Search assets...")

print(repr(search_box.text()))
print(search_box.placeholderText())

search_box.setText("ThinkPad")
print(search_box.text())
print(search_box.placeholderText())
